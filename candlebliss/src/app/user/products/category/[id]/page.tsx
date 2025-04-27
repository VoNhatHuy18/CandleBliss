'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Eye, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ChatBot from '@/app/components/user/chatbot/ChatBot';
import { useParams } from 'next/navigation';

interface ProductImage {
    id: string;
    path: string;
    public_id: string;
}

interface ProductDetail {
    productId: number;
    id: number;
    size: string;
    type: string;
    values: string;
    quantities: number;
    images: ProductImage[];
    isActive: boolean;
}

interface Price {
    id: number;
    base_price: number;
    discount_price: number;
    start_date: string;
    end_date: string;
    product_detail: ProductDetail;
}

interface Product {
    id: number;
    name: string;
    description: string;
    video: string;
    images: ProductImage | ProductImage[];
    details?: ProductDetail[];
    categoryId: number; // Add this field to track category
    category_id?: number; // Thêm field này để hỗ trợ API trả về dưới tên khác
    categories?: Array<{ id: number, name: string }>;
}

interface Category {
    id: number;
    name: string;
    description: string;
}

interface ProductCardProps {
    id: number;
    title: string;
    description: string;
    price: string;
    discountPrice?: string;
    rating: number;
    imageUrl: string;
    variants?: Array<{
        detailId: number;
        size: string;
        type: string;
        basePrice: string;
        discountPrice?: string;
        inStock: boolean;
    }>;
    onViewDetail?: (productId: number) => void;
    onAddToCart?: (productId: number, detailId?: number) => void;
}

interface PriceRange {
    min: number;
    max: number;
    label: string;
}

interface SortOption {
    value: string;
    label: string;
}

// Star display component for product ratings
const StarDisplay = ({ rating }: { rating: number }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

// ProductCard component
const ProductCard = ({
    id,
    title,
    description,
    price,
    discountPrice,
    rating,
    imageUrl,
    variants,
    onViewDetail,
}: ProductCardProps) => {
    const [selectedVariant, setSelectedVariant] = useState(
        variants && variants.length > 0 ? variants[0].detailId : null,
    );
    const [showVariantOptions, setShowVariantOptions] = useState(false);

    const handleVariantChange = (variantId: number) => {
        setSelectedVariant(variantId);
        setShowVariantOptions(false);
    };

    const renderVariantOptions = () => {
        if (showVariantOptions && variants) {
            return (
                <div className='mt-1 space-y-1'>
                    {variants.map((variant) => (
                        <button
                            key={variant.detailId}
                            className={`text-xs px-2 py-1 border rounded ${selectedVariant === variant.detailId
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-300'
                                }`}
                            onClick={() => handleVariantChange(variant.detailId)}
                        >
                            {variant.size} - {variant.type}
                        </button>
                    ))}
                </div>
            );
        }
        return null;
    };

    const formatPrice = (value: string | number) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
        const basePriceNum = parseFloat(basePrice);
        const discountPercentNum = parseFloat(discountPercent);

        if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

        const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
        return discountedPrice;
    };

    const getDisplayPrice = () => {
        if (variants && variants.length > 0) {
            const activeVariant = selectedVariant
                ? variants.find((v) => v.detailId === selectedVariant)
                : variants[0];

            if (activeVariant) {
                const actualDiscountPrice = activeVariant.discountPrice
                    ? calculateDiscountedPrice(activeVariant.basePrice, activeVariant.discountPrice)
                    : null;

                return {
                    basePrice: activeVariant.basePrice,
                    discountPrice: actualDiscountPrice,
                    discountPercent: activeVariant.discountPrice,
                };
            }
        }

        const actualDiscountPrice = discountPrice
            ? calculateDiscountedPrice(price, discountPrice)
            : null;

        return {
            basePrice: price,
            discountPrice: actualDiscountPrice,
            discountPercent: discountPrice,
        };
    };

    const { basePrice, discountPrice: calculatedDiscountPrice, discountPercent } = getDisplayPrice();

    return (
        <div className='rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow'>
            <div className='relative aspect-square overflow-hidden rounded-lg group'>
                <Image
                    src={imageUrl}
                    alt={title}
                    height={400}
                    width={400}
                    className='h-full w-full object-cover transition-all duration-300 group-hover:blur-sm'
                />

                {/* Discount badge */}
                {discountPercent && parseInt(discountPercent) > 0 && (
                    <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium'>
                        -{discountPercent}%
                    </div>
                )}

                <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <Link href={`/user/products/${id}`}>
                        <button
                            onClick={() => onViewDetail && onViewDetail(id)}
                            className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black'
                        >
                            <Eye className='w-4 h-4' />
                            <span>Xem chi tiết</span>
                        </button>
                    </Link>
                </div>
            </div>

            <div className='mt-3'>
                <h3 className='text-sm font-medium text-gray-700 mb-1 truncate whitespace-nowrap overflow-hidden'>
                    {title}
                </h3>
                <p className='text-xs text-gray-500 line-clamp-2 mb-1'>{description}</p>
                <div className='flex items-center'>
                    <StarDisplay rating={rating} />
                </div>

                {/* Variant options */}
                {variants && variants.length > 0 && (
                    <div className='mt-2'>
                        <button
                            className='text-xs text-gray-600 hover:text-orange-700 mb-1 flex items-center'
                            onClick={() => setShowVariantOptions(!showVariantOptions)}
                        ></button>
                        {renderVariantOptions()}
                    </div>
                )}

                {/* Price display */}
                <div className='mt-1.5'>
                    {(() => {
                        if (
                            discountPercent &&
                            parseInt(discountPercent) > 0 &&
                            calculatedDiscountPrice !== null
                        ) {
                            return (
                                <div className='flex items-center'>
                                    <span className='text-red-600 text-sm font-medium'>
                                        {formatPrice(calculatedDiscountPrice)}đ
                                    </span>
                                    <span className='ml-1.5 text-gray-500 text-xs line-through'>
                                        {formatPrice(basePrice)}đ
                                    </span>
                                </div>
                            );
                        }
                        else {
                            return (
                                <span className='text-red-600 text-sm font-medium'>
                                    {formatPrice(basePrice)}đ
                                </span>
                            );
                        }
                    })()}
                </div>
            </div>
        </div>
    );
};

// Fetch ratings for multiple products
const fetchRatingsForProducts = async (productIds: number[]) => {
    if (!productIds.length) return {};

    try {
        const ratingPromises = productIds.map(id =>
            fetch(`http://68.183.226.198:3000/api/rating/get-by-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_id: id })
            }).then(res => res.ok ? res.json() : [])
        );

        const ratingsResults = await Promise.all(ratingPromises);
        const ratingsMap: Record<number, number> = {};

        productIds.forEach((id, index) => {
            const productRatings = ratingsResults[index];
            if (Array.isArray(productRatings) && productRatings.length > 0) {
                const totalRating = productRatings.reduce((sum, item) =>
                    sum + (item.rating || item.avg_rating || 0), 0);
                ratingsMap[id] = productRatings.length > 0 ? totalRating / productRatings.length : 5;
            } else {
                ratingsMap[id] = 0;
            }
        });

        return ratingsMap;
    } catch (error) {
        console.error('Error fetching ratings batch:', error);
        return {};
    }
};

export default function CategoryProductsPage() {
    const params = useParams();
    const categoryId = typeof params.id === 'string' ? parseInt(params.id) : -1;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<ProductCardProps[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>([]);
    const [originalProducts, setOriginalProducts] = useState<ProductCardProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
    const [sortOption, setSortOption] = useState<string>('default');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 24;

    const searchParams = useSearchParams();

    // Define price ranges for filtering
    const priceRanges: PriceRange[] = [
        { min: 0, max: 100000, label: 'Dưới 100K' },
        { min: 100000, max: 300000, label: '100K - 300K' },
        { min: 300000, max: 500000, label: '300K - 500K' },
        { min: 500000, max: 1000000, label: '500K - 1 triệu' },
        { min: 1000000, max: Infinity, label: 'Trên 1 triệu' },
    ];

    // Define sorting options
    const sortOptions: SortOption[] = [
        { value: 'default', label: 'Mặc định' },
        { value: 'price-asc', label: 'Giá tăng dần' },
        { value: 'price-desc', label: 'Giá giảm dần' },
        { value: 'name-asc', label: 'Tên A-Z' },
        { value: 'name-desc', label: 'Tên Z-A' },
    ];

    // Apply filters and sorting
    const applyFiltersAndSort = (
        products: ProductCardProps[],
        originalList: ProductCardProps[],
        query: string,
        priceRange: PriceRange | null,
        sort: string
    ) => {
        let result;

        // If default sort, use original order
        if (sort === 'default') {
            result = [...originalList];
        } else {
            result = [...products];
        }

        // Apply search filter
        if (query.trim()) {
            const searchLower = query.toLowerCase();
            result = result.filter((product) => {
                return (
                    product.title.toLowerCase().includes(searchLower) ||
                    (product.description && product.description.toLowerCase().includes(searchLower))
                );
            });
        }

        // Apply price range filter
        if (priceRange) {
            result = result.filter((product) => {
                const productPrice = product.discountPrice
                    ? parseFloat(calculateDiscountedPrice(product.price, product.discountPrice).toString())
                    : parseFloat(product.price);

                return productPrice >= priceRange.min && productPrice <= priceRange.max;
            });
        }

        // Apply sorting (except default)
        if (sort !== 'default') {
            switch (sort) {
                case 'price-asc':
                    result.sort((a, b) => {
                        const priceA = a.discountPrice
                            ? calculateDiscountedPrice(a.price, a.discountPrice)
                            : parseFloat(a.price);
                        const priceB = b.discountPrice
                            ? calculateDiscountedPrice(b.price, b.discountPrice)
                            : parseFloat(b.price);
                        return priceA - priceB;
                    });
                    break;
                case 'price-desc':
                    result.sort((a, b) => {
                        const priceA = a.discountPrice
                            ? calculateDiscountedPrice(a.price, a.discountPrice)
                            : parseFloat(a.price);
                        const priceB = b.discountPrice
                            ? calculateDiscountedPrice(b.price, b.discountPrice)
                            : parseFloat(b.price);
                        return priceB - priceA;
                    });
                    break;
                case 'name-asc':
                    result.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'name-desc':
                    result.sort((a, b) => b.title.localeCompare(a.title));
                    break;
            }
        }

        return result;
    };

    // Helper function to calculate discounted price
    const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
        const basePriceNum = parseFloat(basePrice);
        const discountPercentNum = parseFloat(discountPercent);

        if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

        const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
        return discountedPrice;
    };

    // Fetch category information and its products
    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            try {
                setLoading(true);

                // Fetch category details
                const categoryResponse = await fetch(`http://68.183.226.198:3000/api/categories/${categoryId}`);
                if (!categoryResponse.ok) {
                    throw new Error('Category not found');
                }
                const categoryData = await categoryResponse.json();
                setCategory(categoryData);

                // Fetch all products
                const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
                if (!productsResponse.ok) {
                    throw new Error('Failed to fetch products');
                }
                const productsData: Product[] = await productsResponse.json();

                // Sửa phần lọc sản phẩm theo danh mục
                const categoryProducts = productsData.filter(product => {
                    // Kiểm tra cả hai trường hợp: categoryId hoặc category_id
                    if (product.categoryId === categoryId) return true;
                    if (product.category_id === categoryId) return true;

                    // Kiểm tra trong mảng categories nếu có
                    if (product.categories && Array.isArray(product.categories)) {
                        return product.categories.some(cat => cat.id === categoryId);
                    }

                    return false;
                });

                console.log(`Tìm thấy ${categoryProducts.length} sản phẩm cho danh mục ID ${categoryId}`);

                // Normalize products
                const normalizedProducts = categoryProducts.map((product) => ({
                    ...product,
                    images: Array.isArray(product.images) ? product.images : [product.images],
                }));

                // Fetch prices data
                const pricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token'),
                    },
                });

                if (!pricesResponse.ok) {
                    throw new Error('Failed to fetch prices');
                }

                const pricesData: Price[] = await pricesResponse.json();

                // Create mapping between productId and prices
                const productPricesMap: { [productId: number]: Price[] } = {};

                pricesData.forEach(price => {
                    if (price.product_detail && price.product_detail.productId) {
                        const productId = price.product_detail.productId;
                        if (!productPricesMap[productId]) {
                            productPricesMap[productId] = [];
                        }
                        productPricesMap[productId].push(price);
                    }
                });

                // Get ratings for products
                const productIds = normalizedProducts.map(p => p.id);
                const ratingsMap = await fetchRatingsForProducts(productIds);

                // Map products with prices and ratings
                const mappedProducts = await Promise.all(normalizedProducts.map(async (product) => {
                    let basePrice = '0';
                    let discountPrice: string | undefined = undefined;
                    let variants: Array<{
                        detailId: number;
                        size: string;
                        type: string;
                        basePrice: string;
                        discountPrice?: string;
                        inStock: boolean;
                    }> = [];

                    const imageUrl = product.images && product.images.length > 0
                        ? product.images[0].path
                        : null;

                    const productPrices = productPricesMap[product.id] || [];

                    if (productPrices.length > 0) {
                        variants = productPrices.map(price => {
                            const detail = price.product_detail;
                            return {
                                detailId: detail.id,
                                size: detail.size || 'Default',
                                type: detail.type || 'Standard',
                                basePrice: price.base_price.toString(),
                                discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                                inStock: detail.quantities > 0 && detail.isActive
                            };
                        });

                        variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                        if (variants.length > 0) {
                            basePrice = variants[0].basePrice;
                            discountPrice = variants[0].discountPrice;
                        }
                    } else {
                        try {
                            const detailResponse = await fetch(`http://68.183.226.198:3000/api/products/${product.id}`);
                            if (detailResponse.ok) {
                                const detailData = await detailResponse.json();

                                if (detailData.details && detailData.details.length > 0) {
                                    const detailIds = detailData.details.map((d: ProductDetail) => d.id);

                                    const detailPrices = pricesData.filter(
                                        price => price.product_detail && detailIds.includes(price.product_detail.id)
                                    );

                                    if (detailPrices.length > 0) {
                                        variants = detailPrices.map(price => {
                                            const detail = price.product_detail;
                                            return {
                                                detailId: detail.id,
                                                size: detail.size || 'Default',
                                                type: detail.type || 'Standard',
                                                basePrice: price.base_price.toString(),
                                                discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                                                inStock: detail.quantities > 0 && detail.isActive
                                            };
                                        });

                                        variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                                        if (variants.length > 0) {
                                            basePrice = variants[0].basePrice;
                                            discountPrice = variants[0].discountPrice;
                                        }
                                    }
                                }
                            }
                        } catch (detailErr) {
                            console.error(`Error fetching details for product ${product.id}:`, detailErr);
                        }
                    }

                    return {
                        id: product.id,
                        title: product.name,
                        description: product.description,
                        price: basePrice,
                        discountPrice: discountPrice,
                        rating: ratingsMap[product.id] || 0,
                        imageUrl: imageUrl || '/images/placeholder.jpg',
                        variants: variants.length > 0 ? variants : undefined,
                    };
                }));

                setOriginalProducts(mappedProducts);
                setProducts(mappedProducts);
                setFilteredProducts(mappedProducts);
            } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        if (categoryId > 0) {
            fetchCategoryAndProducts();
        } else {
            setError("Invalid category ID");
            setLoading(false);
        }
    }, [categoryId]);

    // Apply filters and sorting when changed
    useEffect(() => {
        if (products.length > 0 && originalProducts.length > 0) {
            const newFilteredProducts = applyFiltersAndSort(
                products,
                originalProducts,
                searchQuery,
                selectedPriceRange,
                sortOption
            );
            setFilteredProducts(newFilteredProducts);
        }
    }, [searchQuery, selectedPriceRange, sortOption]);

    // Apply filters only when base products change
    useEffect(() => {
        if (products.length > 0 && originalProducts.length > 0) {
            const newFilteredProducts = applyFiltersAndSort(
                products,
                originalProducts,
                searchQuery,
                selectedPriceRange,
                sortOption
            );
            setFilteredProducts(newFilteredProducts);
        }
    }, [products, originalProducts]);

    // Handle search param changes
    useEffect(() => {
        const searchQuery = searchParams.get('search') || '';
        setSearchQuery(searchQuery);
    }, [searchParams]);

    // Handle sort option changes
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (loading) return;

        const newSortOption = event.target.value;
        setSortOption(newSortOption);

        if (products.length > 0 && originalProducts.length > 0) {
            const productsToSort = newSortOption === 'default' ? originalProducts : products;

            const newFilteredProducts = applyFiltersAndSort(
                productsToSort,
                originalProducts,
                searchQuery,
                selectedPriceRange,
                newSortOption
            );

            setFilteredProducts(newFilteredProducts);
            setCurrentPage(1);
        }
    };

    // Handle price range filter changes
    const handlePriceRangeChange = (range: PriceRange | null) => {
        if (loading) return;

        setSelectedPriceRange(range);

        if (products.length > 0 && originalProducts.length > 0) {
            const productsToFilter = sortOption === 'default' ? originalProducts : products;

            const newFilteredProducts = applyFiltersAndSort(
                productsToFilter,
                originalProducts,
                searchQuery,
                range,
                sortOption
            );

            setFilteredProducts(newFilteredProducts);
            setCurrentPage(1);
        }
    };



    // Get products for current page
    const getPaginatedProducts = () => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    return (
        <div className='bg-[#F1EEE9] min-h-screen'>
            <Head>
                <title>{category ? `${category.name} - Sản phẩm` : 'Danh mục sản phẩm'}</title>
                <meta name='description' content={category?.description || 'Danh mục sản phẩm'} />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <ChatBot />
            <NavBar />

            <Suspense fallback={<div>Loading search results...</div>}>
                {/* Process search params */}
                {searchQuery && <div className="hidden">{searchQuery}</div>}
            </Suspense>

            <div className='px-4 lg:px-0 py-8'>
                <p className='text-center text-[#555659] text-lg font-mont'>D A N H M Ụ C</p>
                <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                    {category ? category.name.toUpperCase() : 'ĐANG TẢI...'}
                </p>
                {category?.description && (
                    <p className='text-center text-gray-600 max-w-2xl mx-auto mb-6'>
                        {category.description}
                    </p>
                )}
            </div>

            <button
                className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
                {/* Price Filter Sidebar */}
                <div
                    className={`lg:w-64 lg:block fixed lg:relative top-0 left-0 h-full lg:h-auto z-40 bg-white lg:bg-transparent shadow-lg lg:shadow-none overflow-y-auto transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        } px-4 pt-16 lg:pt-0 lg:px-8 mb-6`}
                >
                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <h3 className='font-medium text-gray-800 mb-3'>Lọc sản phẩm</h3>

                        <div className='mb-5'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Khoảng giá</h4>
                            <div className='space-y-2'>
                                <div className='flex items-center'>
                                    <button
                                        onClick={() => handlePriceRangeChange(null)}
                                        className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === null
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Tất cả
                                    </button>
                                </div>

                                {priceRanges.map((range, idx) => (
                                    <div key={idx} className='flex items-center'>
                                        <button
                                            onClick={() => handlePriceRangeChange(range)}
                                            className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === range
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex-1 px-4 lg:px-8'>
                    {/* Sorting dropdown and product count */}
                    <div className='flex justify-between items-center mb-6'>
                        <p className='text-sm text-gray-600'>
                            {filteredProducts.length} sản phẩm
                            {searchQuery ? ` cho "${searchQuery}"` : ''}
                            {selectedPriceRange ? ` trong khoảng giá ${selectedPriceRange.label}` : ''}
                        </p>

                        <div className='flex items-center'>
                            <label htmlFor='sort' className='text-sm text-gray-600 mr-2'>Sắp xếp:</label>
                            <select
                                id='sort'
                                className='text-sm border rounded-md py-1.5 px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500'
                                value={sortOption}
                                onChange={handleSortChange}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && (
                        <div className='flex justify-center items-center h-64'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
                        </div>
                    )}

                    {error && (
                        <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center'>
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className='text-center py-10'>
                            <div>
                                <p className='text-gray-600 mb-4'>
                                    Không tìm thấy sản phẩm phù hợp
                                    {searchQuery ? ` với "${searchQuery}"` : ''}
                                    {selectedPriceRange ? ` trong khoảng giá ${selectedPriceRange.label}` : ''}
                                </p>
                                <Link href={`/user/products`}>
                                    <button
                                        className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'
                                    >
                                        Xem tất cả sản phẩm
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Product grid */}
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {getPaginatedProducts().map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                description={product.description || ''}
                                price={product.price}
                                discountPrice={product.discountPrice}
                                rating={product.rating}
                                imageUrl={product.imageUrl}
                                variants={product.variants}
                                onViewDetail={(id) => console.log('View detail for product', id)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {!loading && !error && filteredProducts.length > productsPerPage && (
                        <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`px-3 py-1 ${currentPage === page ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                                        } rounded-md text-gray-700`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Footer />
        </div>
    );
}