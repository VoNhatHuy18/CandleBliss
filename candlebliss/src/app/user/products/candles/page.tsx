'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Star, StarHalf, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page'; // Fixed: Added missing Footer import

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
   categoryId?: number; // Added categoryId field to filter by category
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

// ProductCard component (same as in products page)
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
                     className={`text-xs px-2 py-1 border rounded ${
                        selectedVariant === variant.detailId
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

// Search component
function ProductSearch({ onSearch }: { onSearch: (query: string) => void }) {
   const searchParams = useSearchParams();
   const searchQuery = searchParams.get('search') || '';

   useEffect(() => {
      onSearch(searchQuery);
   }, [searchParams, onSearch]);

   return null;
}

export default function CandlesPage() {
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

   const getPaginatedProducts = () => {
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      return filteredProducts.slice(startIndex, endIndex);
   };

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            // Fetch all products first
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();
            console.log('Total products fetched:', productsData.length);

            // DIRECT FILTERING APPROACH:
            // The field is actually named category_id in the API response, not categoryId
            const CANDLES_CATEGORY_ID = 4; // "Nến Thơm" category ID
            let candleProducts: Product[] = [];

            // Strategy 1: Try to find products with direct category references
            // Using all possible variations of the category ID field name
            candleProducts = productsData.filter((product: ProductWithPossibleCategories) => {
               // Check all possible field names for the category ID
               if (product.categoryId === CANDLES_CATEGORY_ID) return true;
               if (product.category_id === CANDLES_CATEGORY_ID) return true;
               if (product.category?.id === CANDLES_CATEGORY_ID) return true;
               if (product.categories?.some((cat: Category) => cat.id === CANDLES_CATEGORY_ID))
                  return true;

               return false;
            });

            console.log('Products found by category ID:', candleProducts.length);

            // Strategy 3: If still no products, try name-based filtering
            if (candleProducts.length === 0) {
               console.log('No products found by category ID, trying name-based filtering');

               // Filter by keywords in name or description
               candleProducts = productsData.filter((product) => {
                  const name = product.name?.toLowerCase() || '';
                  const desc = product.description?.toLowerCase() || '';

                  // Look for candle-related keywords
                  return (
                     name.includes('nến') ||
                     name.includes('candle') ||
                     desc.includes('nến thơm') ||
                     desc.includes('scented candle')
                  );
               });

               console.log('Products found by keyword filtering:', candleProducts.length);
            }

            // If we still don't have any products, show all products as a fallback
            if (candleProducts.length === 0) {
               console.log('WARNING: No candle products found, showing all products');
               candleProducts = productsData;
            }

            // Continue with your existing product processing code
            const normalizedProducts = candleProducts.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            try {
               // Use a more resilient approach for prices - try both endpoints
               let pricesData: Price[] = [];

               try {
                  // Try the public endpoint first (less likely to redirect)
                  const publicPricesResponse = await fetch(
                     'http://68.183.226.198:3000/api/v1/prices',
                  );

                  if (publicPricesResponse.ok) {
                     pricesData = await publicPricesResponse.json();
                     console.log(
                        'Prices fetched successfully from public endpoint:',
                        pricesData.length,
                     );
                  } else {
                     // If that fails, try the authenticated endpoint
                     console.log('Public prices endpoint failed, trying authenticated endpoint');
                     const pricesResponse = await fetch(
                        'http://68.183.226.198:3000/api/v1/prices',
                        {
                           headers: {
                              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                           },
                        },
                     );

                     if (pricesResponse.ok) {
                        pricesData = await pricesResponse.json();
                        console.log(
                           'Prices fetched successfully from authenticated endpoint:',
                           pricesData.length,
                        );
                     }
                  }
               } catch (priceErr) {
                  console.error('Error fetching prices:', priceErr);
               }

               // If we still don't have prices, create minimal products without detailed pricing
               if (pricesData.length === 0) {
                  console.log('No prices found, creating minimal product data');
                  const basicProducts = normalizedProducts.map((product) => ({
                     id: product.id,
                     title: product.name,
                     description: product.description,
                     price: '0',
                     rating: 4.5,
                     imageUrl:
                        product.images && product.images.length > 0
                           ? product.images[0].path
                           : '/images/placeholder.jpg',
                  }));

                  setProducts(basicProducts);
                  setFilteredProducts(basicProducts);
                  return;
               }

               // Create product detail mapping
               const productDetailMapping: { [key: number]: number } = {};

               normalizedProducts.forEach((product) => {
                  if (product.details && product.details.length > 0) {
                     product.details.forEach((detail) => {
                        productDetailMapping[detail.id] = product.id;
                     });
                  }
               });

               // Create list of products to display
               const mappedProducts = normalizedProducts.map((product) => {
                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;

                  // Find all prices related to this product through product details
                  const relatedPrices: Price[] = [];

                  // Method 1: If the product has a details list
                  if (product.details && product.details.length > 0) {
                     const detailIds = product.details.map((detail) => detail.id);

                     detailIds.forEach((detailId) => {
                        const matchingPrices = pricesData.filter(
                           (price) => price.product_detail && price.product_detail.id === detailId,
                        );
                        relatedPrices.push(...matchingPrices);
                     });
                  }
                  // Method 2: Try other ways to find connections if no details
                  else {
                     const potentialDetailIds = Array.from({ length: 5 }, (_, i) => product.id + i);
                     potentialDetailIds.push(product.id, product.id * 2, product.id * 3);

                     pricesData.forEach((price) => {
                        if (
                           price.product_detail &&
                           potentialDetailIds.includes(price.product_detail.id)
                        ) {
                           relatedPrices.push(price);
                        }
                     });
                  }

                  // Handle pricing
                  let basePrice = '0';
                  let discountPrice: string | undefined = undefined;

                  if (relatedPrices.length > 0) {
                     // Sort prices from low to high
                     relatedPrices.sort((a, b) => Number(a.base_price) - Number(b.base_price));
                     basePrice = relatedPrices[0].base_price.toString();

                     const discountPrices = relatedPrices.filter(
                        (price) => price.discount_price && Number(price.discount_price) > 0,
                     );

                     if (discountPrices.length > 0) {
                        discountPrice = discountPrices[0].discount_price.toString();
                     }
                  }

                  // Create variants list
                  const variants = relatedPrices.map((price) => {
                     const detail = price.product_detail;
                     return {
                        detailId: detail.id,
                        size: detail.size || 'Default',
                        type: detail.type || 'Standard',
                        basePrice: price.base_price.toString(),
                        discountPrice: price.discount_price
                           ? price.discount_price.toString()
                           : undefined,
                        inStock: detail.quantities > 0 && detail.isActive,
                     };
                  });

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

               setProducts(mappedProducts);
               setFilteredProducts(mappedProducts);
            } catch (priceErr) {
               console.error('Error processing prices:', priceErr);

               // Create basic products without price details as fallback
               const basicProducts = normalizedProducts.map((product) => ({
                  id: product.id,
                  title: product.name,
                  description: product.description,
                  price: '0',
                  rating: 4.5,
                  imageUrl:
                     product.images && product.images.length > 0
                        ? product.images[0].path
                        : '/images/placeholder.jpg',
               }));

               setProducts(basicProducts);
               setFilteredProducts(basicProducts);
            }
         } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

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

   const handleSearch = (query: string) => {
      setSearchQuery(query);
   };

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
            <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>NẾN THƠM</p>
         </div>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
            <div className='flex-1 px-4 lg:px-8'>
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
                     {searchQuery ? (
                        <div>
                           <p className='text-gray-600 mb-4'>
                              Không tìm thấy sản phẩm nến thơm phù hợp với &ldquo;{searchQuery}
                              &rdquo;
                           </p>
                           <Link href='/user/products/candles'>
                              <button className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'>
                                 Xem tất cả nến thơm
                              </button>
                           </Link>
                        </div>
                     ) : (
                        <p className='text-gray-500'>Hiện không có sản phẩm nến thơm nào</p>
                     )}
                  </div>
               )}

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

               {!loading && !error && filteredProducts.length > productsPerPage && (
                  <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                           key={page}
                           className={`px-3 py-1 ${
                              currentPage === page ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
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

         <Footer />
      </div>
   );
}
