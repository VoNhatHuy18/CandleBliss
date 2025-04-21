'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Star, StarHalf, Eye, X, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

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
   categoryId?: number;
}

interface ProductCardProps {
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

// Add this interface above the existing ones
interface Category {
   id: number;
   name: string;
   description?: string;
}

interface ProductWithPossibleCategories extends Product {
   categoryId?: number;
   category_id?: number;
   category?: Category;
   categories?: Category[];
}

// Add these interfaces before the ProductCard component
interface PriceRange {
   min: number;
   max: number;
   label: string;
}

interface SortOption {
   value: string;
   label: string;
}

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
}: ProductCardProps & { id: number }) => {
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

   const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
         stars.push(<Star key={`star-${i}`} className='w-4 h-4 fill-yellow-400 text-yellow-400' />);
      }

      if (hasHalfStar) {
         stars.push(
            <StarHalf key='half-star' className='w-4 h-4 fill-yellow-400 text-yellow-400' />,
         );
      }

      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
         stars.push(<Star key={`empty-star-${i}`} className='w-4 h-4 text-yellow-400' />);
      }

      return stars;
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
            <h3 className='text-sm font-medium text-gray-700 mb-1'>{title}</h3>
            <p className='text-xs text-gray-500 line-clamp-2 mb-1'>{description}</p>
            <div className='flex items-center'>{renderStars()}</div>

            {variants && variants.length > 0 && (
               <div className='mt-2'>
                  <button
                     className='text-xs text-gray-600 hover:text-orange-700 mb-1 flex items-center'
                     onClick={() => setShowVariantOptions(!showVariantOptions)}
                  ></button>
                  {renderVariantOptions()}
               </div>
            )}

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
                           <div className='bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ml-1.5'>
                              -{discountPercent}%
                           </div>
                        </div>
                     );
                  } else {
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

// Tối ưu hóa Search component để tránh vòng lặp vô hạn
function ProductSearch({ onSearch }: { onSearch: (query: string) => void }) {
   const searchParams = useSearchParams();
   const searchQuery = searchParams.get('search') || '';
   const searchQueryRef = React.useRef(searchQuery);

   useEffect(() => {
      // Chỉ gọi onSearch khi giá trị thực sự thay đổi
      if (searchQuery !== searchQueryRef.current) {
         searchQueryRef.current = searchQuery;
         onSearch(searchQuery);
      }
   }, [searchParams]); // Bỏ onSearch khỏi dependencies

   return null;
}

export default function AccessoriesPage() {
   const [products, setProducts] = useState<
      Array<{
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
      }>
   >([]);
   const [filteredProducts, setFilteredProducts] = useState<
      Array<{
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
      }>
   >([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState('');

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 25;

   // Add these new states for filtering and sorting
   const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
   const [sortOption, setSortOption] = useState<string>('default');
   const [originalProducts, setOriginalProducts] = useState<
      Array<{
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
      }>
   >([]);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

   const getPaginatedProducts = () => {
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      return filteredProducts.slice(startIndex, endIndex);
   };

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   // Hàm áp dụng bộ lọc và sắp xếp
   const applyFiltersAndSort = (
      products: Array<{
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
      }>,
      originalList: Array<{
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
      }>,
      query: string,
      priceRange: PriceRange | null,
      sort: string
   ) => {
      // First filter by search query
      let result;

      // Nếu chọn sắp xếp mặc định, dùng thứ tự ban đầu từ originalProducts
      if (sort === 'default') {
         // Chỉ lọc originalProducts mà không sắp xếp
         result = [...originalList];
      } else {
         // Nếu không phải mặc định, dùng sản phẩm hiện tại
         result = [...products];
      }

      // Áp dụng bộ lọc tìm kiếm
      if (query.trim()) {
         const searchLower = query.toLowerCase();
         result = result.filter((product) => {
            return (
               product.title.toLowerCase().includes(searchLower) ||
               (product.description && product.description.toLowerCase().includes(searchLower))
            );
         });
      }

      // Áp dụng bộ lọc giá
      if (priceRange) {
         result = result.filter((product) => {
            // Get actual price considering discounts
            const productPrice = product.discountPrice
               ? parseFloat(calculateDiscountedPrice(product.price, product.discountPrice).toString())
               : parseFloat(product.price);

            return productPrice >= priceRange.min && productPrice <= priceRange.max;
         });
      }

      // Áp dụng sắp xếp (ngoại trừ mặc định)
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

   // Helper function to calculate discounted price (nếu chưa có)
   const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
      const basePriceNum = parseFloat(basePrice);
      const discountPercentNum = parseFloat(discountPercent);

      if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

      const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
      return discountedPrice;
   };

   // Handlers cho filter và sort
   const handleSearch = (query: string) => {
      if (loading) return;

      setSearchQuery(query);

      if (products.length > 0 && originalProducts.length > 0) {
         const newFilteredProducts = applyFiltersAndSort(
            products,
            originalProducts,
            query,
            selectedPriceRange,
            sortOption
         );

         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1);
      }
   };

   const handlePriceRangeChange = (range: PriceRange | null) => {
      if (loading) return;

      setSelectedPriceRange(range);

      if (products.length > 0 && originalProducts.length > 0) {
         const newFilteredProducts = applyFiltersAndSort(
            products,
            originalProducts,
            searchQuery,
            range,
            sortOption
         );

         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1);
      }
   };

   const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (loading) return;

      const newSortOption = event.target.value;
      setSortOption(newSortOption);

      if (products.length > 0 && originalProducts.length > 0) {
         const newFilteredProducts = applyFiltersAndSort(
            products,
            originalProducts,
            searchQuery,
            selectedPriceRange,
            newSortOption
         );

         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1);
      }
   };

   // Thay thế useEffect cho tìm kiếm
   useEffect(() => {
      // Chỉ lưu trữ sản phẩm gốc khi có dữ liệu và chưa lưu trước đó
      if (products.length > 0 && originalProducts.length === 0) {
         setOriginalProducts([...products]);
      }
   }, [products, originalProducts]);

   // Sửa phần fetchProducts trong useEffect
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            // 1. Lấy danh sách sản phẩm cơ bản
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();
            console.log('Total products fetched:', productsData.length);

            // 2. Lọc sản phẩm chỉ lấy danh mục Phụ kiện (category_id = 6)
            const ACCESSORIES_CATEGORY_ID = 6; // "Phụ kiện" category ID

            // Lọc sản phẩm theo category_id hoặc categoryId
            let accessoriesProducts = productsData.filter((product: ProductWithPossibleCategories) => {
               return (
                  product.categoryId === ACCESSORIES_CATEGORY_ID ||
                  product.category_id === ACCESSORIES_CATEGORY_ID ||
                  product.category?.id === ACCESSORIES_CATEGORY_ID ||
                  product.categories?.some(cat => cat.id === ACCESSORIES_CATEGORY_ID)
               );
            });

            // Nếu không tìm thấy sản phẩm nào theo ID, lọc theo từ khóa liên quan đến phụ kiện
            if (accessoriesProducts.length === 0) {
               console.log('Không tìm thấy sản phẩm theo category ID, đang thử lọc theo tên...');
               accessoriesProducts = productsData.filter(product => {
                  const name = product.name?.toLowerCase() || '';
                  const desc = product.description?.toLowerCase() || '';
                  return (
                     name.includes('phụ kiện') ||
                     name.includes('accessories') ||
                     desc.includes('phụ kiện') ||
                     desc.includes('accessories') ||
                     name.includes('đế') ||
                     name.includes('holder') ||
                     name.includes('đèn')
                  );
               });
            }

            console.log(`Tìm thấy ${accessoriesProducts.length} sản phẩm phụ kiện`);

            // Nếu vẫn không tìm thấy sản phẩm nào, hiển thị trạng thái trống
            if (accessoriesProducts.length === 0) {
               console.log('Không tìm thấy sản phẩm phụ kiện, hiển thị trạng thái trống');
               setProducts([]);
               setFilteredProducts([]);
               setLoading(false);
               return;
            }

            // Chuẩn hóa danh sách sản phẩm phụ kiện
            const normalizedProducts = accessoriesProducts.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // 3. Lấy chi tiết sản phẩm và giá cho từng sản phẩm phụ kiện
            const detailedProducts = await Promise.all(
               normalizedProducts.map(async (product) => {
                  try {
                     // Lấy chi tiết sản phẩm từ API chi tiết
                     const detailResponse = await fetch(`http://68.183.226.198:3000/api/products/${product.id}`);
                     if (detailResponse.ok) {
                        const detailData = await detailResponse.json();
                        // Cập nhật thông tin chi tiết
                        return {
                           ...product,
                           details: detailData.details || [],
                        };
                     }
                     return product;
                  } catch (detailErr) {
                     console.error(`Lỗi khi lấy chi tiết cho sản phẩm ${product.id}:`, detailErr);
                     return product;
                  }
               })
            );

            // 4. Lấy thông tin giá
            try {
               // Fetch prices data với xử lý lỗi tốt hơn
               let pricesData: Price[] = [];

               try {
                  // Thử endpoint không cần xác thực trước
                  const publicPricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices');

                  if (publicPricesResponse.ok) {
                     pricesData = await publicPricesResponse.json();
                     console.log('Lấy giá thành công từ endpoint công khai:', pricesData.length);
                  } else {
                     // Nếu thất bại, thử endpoint có xác thực
                     console.log('Endpoint giá công khai thất bại, đang thử endpoint có xác thực');
                     const pricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                        headers: {
                           Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                     });

                     if (pricesResponse.ok) {
                        pricesData = await pricesResponse.json();
                        console.log('Lấy giá thành công từ endpoint có xác thực:', pricesData.length);
                     }
                  }
               } catch (priceErr) {
                  console.error('Lỗi khi lấy thông tin giá:', priceErr);
               }

               // Nếu không lấy được giá, tạo sản phẩm với giá mặc định
               if (pricesData.length === 0) {
                  console.log('Không tìm thấy giá, tạo dữ liệu sản phẩm cơ bản');
                  const basicProducts = normalizedProducts.map(product => ({
                     id: product.id,
                     title: product.name,
                     description: product.description,
                     price: '0',
                     rating: 4.5,
                     imageUrl: product.images && product.images.length > 0
                        ? product.images[0].path
                        : '/images/placeholder.jpg',
                  }));

                  setProducts(basicProducts);
                  setFilteredProducts(basicProducts);
                  return;
               }

               // Tạo mapping từ ID chi tiết sản phẩm đến giá
               const detailPricesMap: { [detailId: number]: Price } = {};

               // Map giá theo ID của chi tiết sản phẩm
               pricesData.forEach(price => {
                  if (price.product_detail && price.product_detail.id) {
                     detailPricesMap[price.product_detail.id] = price;
                  }
               });

               console.log('Tạo mapping giá cho', Object.keys(detailPricesMap).length, 'chi tiết sản phẩm');

               // Map sản phẩm với giá chính xác dựa trên chi tiết
               const mappedProducts = detailedProducts.map((product) => {
                  console.log(`Xử lý sản phẩm ${product.id}: ${product.name}`);

                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;

                  // Giá trị mặc định
                  let basePrice = '0';
                  let discountPrice: string | undefined = undefined;
                  const variants: Array<{
                     detailId: number;
                     size: string;
                     type: string;
                     basePrice: string;
                     discountPrice?: string;
                     inStock: boolean;
                  }> = [];

                  // Xử lý chi tiết nếu có
                  if (product.details && product.details.length > 0) {
                     console.log(`Sản phẩm ${product.id} có ${product.details.length} variant`);

                     // Xử lý từng variant (chi tiết) của sản phẩm
                     product.details.forEach((detail: { id: string | number; size: string; type: string; quantities: number; isActive: boolean; }) => {
                        console.log(`Đang xử lý variant ${detail.id} cho sản phẩm ${product.id}`);

                        // Tìm giá cho variant này dựa trên ID chi tiết
                        const price = detailPricesMap[Number(detail.id)];

                        if (price) {
                           console.log(`Đã tìm thấy giá cho variant ${detail.id}: ${price.base_price}`);
                           variants.push({
                              detailId: Number(detail.id),
                              size: detail.size || 'Default',
                              type: detail.type || 'Standard',
                              basePrice: price.base_price.toString(),
                              discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                              inStock: detail.quantities > 0 && detail.isActive
                           });
                        } else {
                           console.log(`Cảnh báo: Không tìm thấy giá cho variant ${detail.id} của sản phẩm ${product.id}`);
                        }
                     });
                  } else {
                     console.log(`Sản phẩm ${product.id} không có variants từ chi tiết`);

                     // Tìm giá dựa trên mối quan hệ product_detail.productId = product.id
                     const relevantPrices = pricesData.filter(price =>
                        price.product_detail && price.product_detail.productId === product.id
                     );

                     if (relevantPrices.length > 0) {
                        console.log(`Tìm thấy ${relevantPrices.length} giá cho sản phẩm ${product.id} qua productId`);

                        relevantPrices.forEach(price => {
                           const detail = price.product_detail;
                           variants.push({
                              detailId: detail.id,
                              size: detail.size || 'Default',
                              type: detail.type || 'Standard',
                              basePrice: price.base_price.toString(),
                              discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                              inStock: detail.quantities > 0 && detail.isActive
                           });
                        });
                     }
                  }

                  // Sắp xếp variant theo giá (thấp đến cao)
                  variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                  // Sử dụng giá của variant rẻ nhất làm giá mặc định
                  if (variants.length > 0) {
                     basePrice = variants[0].basePrice;
                     discountPrice = variants[0].discountPrice;
                  }

                  return {
                     id: product.id,
                     title: product.name,
                     description: product.description,
                     price: basePrice,
                     discountPrice: discountPrice,
                     rating: 4.5,
                     imageUrl: imageUrl || '/images/placeholder.jpg',
                     variants: variants.length > 0 ? variants : undefined,
                  };
               });

               setOriginalProducts(mappedProducts); // Lưu sản phẩm gốc
               setProducts(mappedProducts);
               setFilteredProducts(mappedProducts);
            } catch (priceErr) {
               console.error('Lỗi khi xử lý thông tin giá:', priceErr);

               // Tạo sản phẩm cơ bản không có thông tin giá chi tiết làm phương án dự phòng
               const basicProducts = normalizedProducts.map(product => ({
                  id: product.id,
                  title: product.name,
                  description: product.description,
                  price: '0',
                  rating: 4.5,
                  imageUrl: product.images && product.images.length > 0
                     ? product.images[0].path
                     : '/images/placeholder.jpg',
               }));

               setProducts(basicProducts);
               setFilteredProducts(basicProducts);
            }
         } catch (err) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []); // Giữ dependency array trống để chỉ chạy một lần

   useEffect(() => {
      if (!searchQuery.trim()) {
         setFilteredProducts(products);
         return;
      }

      const filtered = products.filter((product) => {
         const searchLower = searchQuery.toLowerCase();
         return (
            product.title.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower))
         );
      });

      setFilteredProducts(filtered);
   }, [searchQuery, products]);

   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <NavBar />

         <Suspense fallback={<div>Loading search results...</div>}>
            <ProductSearch onSearch={handleSearch} />
         </Suspense>

         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>D A N H M Ụ C</p>
            <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>PHỤ KIỆN</p>
         </div>

         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
            {/* Price Filter Sidebar - show/hide on mobile with animation */}
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
                                 className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange?.label === range.label
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
               {/* Add sorting dropdown and product count */}
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
                           Không tìm thấy sản phẩm phụ kiện phù hợp
                           {searchQuery ? ` với "${searchQuery}"` : ''}
                           {selectedPriceRange ? ` trong khoảng giá ${selectedPriceRange.label}` : ''}
                        </p>
                        <button
                           className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'
                           onClick={() => {
                              setSearchQuery('');
                              setSelectedPriceRange(null);
                              setSortOption('default');
                           }}
                        >
                           Xem tất cả phụ kiện
                        </button>
                     </div>
                  </div>
               )}

               {/* Existing product grid */}
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
                        onViewDetail={handleViewDetail}
                     />
                  ))}
               </div>

               {/* Existing pagination */}
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

         {/* Add a semi-transparent overlay when sidebar is open on mobile */}
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
