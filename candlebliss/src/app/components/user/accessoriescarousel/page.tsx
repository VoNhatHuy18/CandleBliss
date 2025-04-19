'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

// Product interfaces
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
   createdAt?: string;
}



// Product card interface for carousel display
interface CarouselProduct {
   id: number;
   name: string;
   description: string;
   price: string;
   discountPrice?: string;
   originalPrice?: string;
   image: string;
   isNew: boolean;
   rating: number;
   createdAt?: string;
}

export default function CandlesCarousel() {
   const sliderRef = useRef<HTMLDivElement>(null);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isHovering, setIsHovering] = useState(false);
   const [products, setProducts] = useState<CarouselProduct[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const visibleItems = 4; // Number of items visible at once
   const totalItems = products.length;

   // Check if a product is considered "new" (created within last 7 days)
   const isNewProduct = (createdAt?: string): boolean => {
      if (!createdAt) return false;

      const creationDate = new Date(createdAt);
      const currentDate = new Date();
      const differenceInTime = currentDate.getTime() - creationDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      return differenceInDays <= 7;
   };

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setLoading(true);
            // Fetch all products first
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();
            console.log('Total products fetched:', productsData.length);

            // Filter for candle products
            const CANDLES_CATEGORY_ID = 4; // "Nến Thơm" category ID
            let candleProducts: Product[] = [];

            // Strategy 1: Try to find products with direct category references
            candleProducts = productsData.filter((product: Product) => {
               // Check all possible field names for the category ID
               if (product.categoryId === CANDLES_CATEGORY_ID) return true;
               return true;

            });

            console.log('Products found by category ID:', candleProducts.length);

            // Strategy 2: If no products found, try name-based filtering
            if (candleProducts.length === 0) {
               console.log('No products found by category ID, trying name-based filtering');

               candleProducts = productsData.filter((product) => {
                  const name = product.name?.toLowerCase() || '';
                  const desc = product.description?.toLowerCase() || '';

                  return (
                     name.includes('nến') ||
                     name.includes('candle') ||
                     desc.includes('nến thơm') ||
                     desc.includes('scented candle')
                  );
               });

               console.log('Products found by keyword filtering:', candleProducts.length);
            }

            // If still no products, limit to 6 random products as fallback
            if (candleProducts.length === 0) {
               console.log('WARNING: No candle products found, showing random products');
               candleProducts = productsData.slice(0, 6);
            }

            // Normalize product images
            const normalizedProducts = candleProducts.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // Fetch prices
            let pricesData: Price[] = [];
            try {
               const publicPricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices');
               if (publicPricesResponse.ok) {
                  pricesData = await publicPricesResponse.json();
               } else {
                  console.log('Public prices endpoint failed, trying authenticated endpoint');
                  const pricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                     headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                     },
                  });

                  if (pricesResponse.ok) {
                     pricesData = await pricesResponse.json();
                  }
               }
            } catch (priceErr) {
               console.error('Error fetching prices:', priceErr);
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

            // Map products to carousel display format
            const carouselProducts: CarouselProduct[] = normalizedProducts.map((product) => {
               const imageUrl =
                  product.images && product.images.length > 0 && product.images[0]
                     ? product.images[0].path
                     : '/images/trending.png';

               // Find prices related to this product
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
                     if (price.product_detail && potentialDetailIds.includes(price.product_detail.id)) {
                        relatedPrices.push(price);
                     }
                  });
               }

               // Handle pricing - UPDATED PRICE CALCULATION LOGIC
               let price = '0đ';
               let discountPrice: string | undefined = undefined;
               let originalPrice: string | undefined = undefined;

               if (relatedPrices.length > 0) {
                  // Sort prices from low to high
                  relatedPrices.sort((a, b) => Number(a.base_price) - Number(b.base_price));

                  // Get the lowest price option
                  const lowestPriceOption = relatedPrices[0];
                  const basePrice = Number(lowestPriceOption.base_price);

                  // Check if there's a discount
                  if (lowestPriceOption.discount_price && Number(lowestPriceOption.discount_price) > 0) {
                     // Calculate discounted price: base_price * (1 - discount_price/100)
                     const discountPercent = Number(lowestPriceOption.discount_price);
                     const discountedValue = basePrice * (1 - discountPercent / 100);

                     // Set the price to the discounted value
                     price = discountedValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';

                     // Set discount percentage and original price
                     discountPrice = `-${discountPercent}%`;
                     originalPrice = basePrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
                  } else {
                     // No discount, just use the base price
                     price = basePrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
                  }
               }

               return {
                  id: product.id,
                  name: product.name,
                  description: product.description || 'Nến thơm cao cấp',
                  price: price,
                  discountPrice: discountPrice,
                  originalPrice: originalPrice,
                  image: imageUrl,
                  isNew: isNewProduct(product.createdAt), // Use the actual creation date
                  rating: 4 + Math.random(), // Generate random rating between 4-5
                  createdAt: product.createdAt,
               };
            });

            // Limit to 6 products for carousel
            setProducts(carouselProducts.slice(0, 6));
         } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   const handleNext = useCallback(() => {
      if (sliderRef.current) {
         const newIndex =
            currentIndex + 1 >= Math.ceil(totalItems - visibleItems + 1) ? 0 : currentIndex + 1;
         setCurrentIndex(newIndex);

         if (newIndex === 0) {
            sliderRef.current.scrollLeft = 0;
         } else {
            const cardWidth = sliderRef.current.querySelector('div')?.clientWidth || 0;
            const gap = 16; // gap-4 = 16px
            sliderRef.current.scrollLeft = newIndex * (cardWidth + gap);
         }
      }
   }, [currentIndex, totalItems, visibleItems]);

   const handlePrev = useCallback(() => {
      if (sliderRef.current) {
         const newIndex = Math.max(currentIndex - 1, 0);
         setCurrentIndex(newIndex);

         const cardWidth = sliderRef.current.querySelector('div')?.clientWidth || 0;
         const gap = 16; // gap-4 = 16px
         sliderRef.current.scrollLeft = newIndex * (cardWidth + gap);
      }
   }, [currentIndex]);

   useEffect(() => {
      if (isHovering) return; // Don't auto-scroll when user is hovering

      const interval = setInterval(() => {
         handleNext();
      }, 4000);
      return () => clearInterval(interval);
   }, [isHovering, handleNext]);

   // Generate star rating UI
   const renderRating = (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
         stars.push(
            <StarIcon
               key={`full-${i}`}
               className='w-4 h-4 text-amber-400'
            />
         );
      }

      if (hasHalfStar) {
         stars.push(
            <svg
               key='half'
               className='w-4 h-4 text-amber-400'
               fill='currentColor'
               viewBox='0 0 20 20'
            >
               <defs>
                  <linearGradient id='halfGradient'>
                     <stop offset='50%' stopColor='currentColor' />
                     <stop offset='50%' stopColor='#D1D5DB' />
                  </linearGradient>
               </defs>
               <path
                  fill='url(#halfGradient)'
                  d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
               ></path>
            </svg>
         );
      }

      // Add empty stars
      for (let i = stars.length; i < 5; i++) {
         stars.push(
            <StarIcon
               key={`empty-${i}`}
               className='w-4 h-4 text-gray-300'
            />
         );
      }

      return stars;
   };

   return (
      <div className='relative w-full max-w-7xl mx-auto px-4 my-12'>
         {/* Section Header */}
         <div className='flex justify-between items-center mb-8'>
            <div>
               <h2 className='text-3xl font-bold text-gray-800 font-mont'>Nến Thơm</h2>
               <div className='h-1 w-24 bg-amber-500 mt-2'></div>
            </div>
            <div className='hidden md:flex space-x-2'>
               <button
                  onClick={handlePrev}
                  className='p-2 rounded-full border border-gray-300 hover:bg-amber-50 hover:border-amber-300 transition-colors'
                  aria-label='Previous'
                  disabled={loading || products.length <= 0}
               >
                  <ChevronLeftIcon className='h-5 w-5 text-gray-600' />
               </button>
               <button
                  onClick={handleNext}
                  className='p-2 rounded-full border border-gray-300 hover:bg-amber-50 hover:border-amber-300 transition-colors'
                  aria-label='Next'
                  disabled={loading || products.length <= 0}
               >
                  <ChevronRightIcon className='h-5 w-5 text-gray-600' />
               </button>
            </div>
         </div>

         {/* Carousel Container */}
         <div className='relative overflow-hidden'>
            {loading ? (
               <div className='flex justify-center items-center h-64 bg-gray-50 rounded-lg'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
               </div>
            ) : error ? (
               <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center h-64 flex items-center justify-center'>
                  <p>{error}</p>
               </div>
            ) : products.length === 0 ? (
               <div className='bg-amber-50 text-amber-800 p-4 rounded-md my-4 text-center h-64 flex items-center justify-center'>
                  <p>Không tìm thấy sản phẩm nến thơm</p>
               </div>
            ) : (
               <div
                  ref={sliderRef}
                  className='flex gap-8 overflow-x-scroll scrollbar-hide scroll-smooth transition-transform duration-500'
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
               >
                  {products.map((product) => (
                     <div
                        key={product.id}
                        className='min-w-[280px] max-w-[280px] group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300'
                     >
                        {/* Product Image Container */}
                        <div className='relative h-60 overflow-hidden bg-[#F9F6F3]'>
                           {/* New Badge - Top Left */}
                           {product.isNew && (
                              <span className='absolute top-3 left-3 z-10 bg-amber-800 text-white text-xs font-bold px-2 py-1 rounded'>
                                 Mới
                              </span>
                           )}

                           {/* Discount Badge - Top Right */}
                           {product.discountPrice && (
                              <span className='absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
                                 {product.discountPrice}
                              </span>
                           )}

                           {/* Product Image */}
                           <Image
                              src={product.image}
                              alt={product.name}
                              width={280}
                              height={240}
                              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                              onError={(e) => {
                                 // Fallback for broken images
                                 const target = e.target as HTMLImageElement;
                                 target.src = "/images/trending.png";
                              }}
                           />

                           {/* Quick action buttons - visible on hover */}
                           <div className='absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent p-4'>
                              <Link href={`/product/${product.id}`}>
                                 <button className='bg-[#553C26] text-white px-4 py-2 rounded-full flex items-center gap-1 hover:bg-amber-600 transition-colors'>
                                    <ShoppingBagIcon className='h-5 w-5' />
                                    <span>Thêm vào giỏ</span>
                                 </button>
                              </Link>
                           </div>
                        </div>

                        {/* Product Details */}
                        <div className='p-4 bg-white'>
                           {/* Rating */}
                           <div className='flex items-center mb-2'>
                              <div className='flex items-center'>{renderRating(product.rating)}</div>
                              <span className='text-xs text-gray-500 ml-2'>({product.rating.toFixed(1)})</span>
                           </div>

                           {/* Product Name */}
                           <Link href={`/product/${product.id}`}>
                              <h3 className='font-medium text-gray-800 hover:text-amber-600 transition-colors cursor-pointer mb-1 font-mont'>
                                 {product.name}
                              </h3>
                           </Link>

                           {/* Description */}
                           <p className='text-sm text-gray-500 mb-3 line-clamp-2'>{product.description}</p>

                           {/* Price */}
                           <div className='flex items-center'>
                              <span className='text-lg font-semibold text-amber-800'>{product.price}</span>
                              {product.originalPrice && (
                                 <span className='ml-2 text-sm text-gray-500 line-through'>
                                    {product.originalPrice}
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Mobile navigation buttons */}
            {!loading && products.length > 0 && (
               <div className='md:hidden flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-2 pointer-events-none'>
                  <button
                     onClick={handlePrev}
                     className='bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white pointer-events-auto'
                  >
                     <ChevronLeftIcon className='h-5 w-5 text-gray-700' />
                  </button>
                  <button
                     onClick={handleNext}
                     className='bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white pointer-events-auto'
                  >
                     <ChevronRightIcon className='h-5 w-5 text-gray-700' />
                  </button>
               </div>
            )}
         </div>

         {/* Progress Indicators */}
         {!loading && products.length > 0 && (
            <div className='flex justify-center mt-6 gap-2'>
               {[...Array(Math.ceil(totalItems / visibleItems))].map((_, index) => (
                  <button
                     key={index}
                     className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-amber-500 w-6' : 'bg-gray-300'
                        }`}
                     onClick={() => {
                        setCurrentIndex(index);
                        if (sliderRef.current) {
                           const cardWidth = sliderRef.current.querySelector('div')?.clientWidth || 0;
                           const gap = 16;
                           sliderRef.current.scrollLeft = index * visibleItems * (cardWidth + gap);
                        }
                     }}
                  />
               ))}
            </div>
         )}

         {/* View All Button */}
         <div className='flex justify-center mt-10'>
            <Link href='/products/candles'>
               <button className='px-8 py-3 bg-[#553C26] text-white rounded-full flex items-center gap-2 hover:bg-amber-600 transition-colors font-mont font-medium'>
                  Xem Tất Cả Nến Thơm
                  <ChevronRightIcon className='h-5 w-5' />
               </button>
            </Link>
         </div>
      </div>
   );
}
