'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HOST } from '@/app/constants/api';
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

   // Tìm hàm renderStars và thay thế với hàm sau:
   const renderStars = () => {
      return <StarDisplay rating={rating} />;
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

// Add this function before the CandlesCarousel component (around line 330)

// Tối ưu: Tạo hàm để lấy ratings cho nhiều sản phẩm cùng lúc
const fetchRatingsForProducts = async (productIds: number[]) => {
   if (!productIds.length) return {};

   try {
      const ratingPromises = productIds.map(id =>
         fetch(`${HOST}/api/rating/get-by-product`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: id })
         }).then(res => res.ok ? res.json() : [])
      );

      const ratingsResults = await Promise.all(ratingPromises);

      // Map ratings to product IDs
      const ratingsMap: Record<number, number> = {};

      productIds.forEach((id, index) => {
         const productRatings = ratingsResults[index];
         if (Array.isArray(productRatings) && productRatings.length > 0) {
            const totalRating = productRatings.reduce((sum, item) =>
               sum + (item.rating || item.avg_rating || 0), 0);
            ratingsMap[id] = productRatings.length > 0 ? totalRating / productRatings.length : 5;
         } else {
            ratingsMap[id] = 0; // Default rating
         }
      });

      return ratingsMap;
   } catch (error) {
      console.error('Error fetching ratings batch:', error);
      return {};
   }
};

export default function CandlesCarousel() {
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
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Carousel state
   const [currentSlide, setCurrentSlide] = useState(0);
   const carouselRef = useRef<HTMLDivElement>(null);
   const itemsPerSlide = 4; // Number of products to show per slide

   // Calculate total number of slides
   const totalSlides = Math.ceil(products.length / itemsPerSlide);

   // Move to next slide
   const nextSlide = () => {
      if (currentSlide < totalSlides - 1) {
         setCurrentSlide(currentSlide + 1);
      } else {
         setCurrentSlide(0); // Loop back to first slide
      }
   };

   // Move to previous slide
   const prevSlide = () => {
      if (currentSlide > 0) {
         setCurrentSlide(currentSlide - 1);
      } else {
         setCurrentSlide(totalSlides - 1); // Loop to last slide
      }
   };

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            // 1. Lấy danh sách sản phẩm cơ bản
            const productsResponse = await fetch(`${HOST}/api/products`);
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();
            console.log('Total products fetched:', productsData.length);

            // 2. Lọc sản phẩm chỉ lấy danh mục Nến thơm (category_id = 4)
            const CANDLES_CATEGORY_ID = 4; // "Nến Thơm" category ID

            // Lọc sản phẩm theo category_id hoặc categoryId
            let candleProducts = productsData.filter((product: ProductWithPossibleCategories) => {
               return (
                  product.categoryId === CANDLES_CATEGORY_ID ||
                  product.category_id === CANDLES_CATEGORY_ID ||
                  product.category?.id === CANDLES_CATEGORY_ID ||
                  product.categories?.some(cat => cat.id === CANDLES_CATEGORY_ID)
               );
            });

            // Nếu không tìm thấy sản phẩm nào theo ID, lọc theo từ khóa liên quan đến nến
            if (candleProducts.length === 0) {
               console.log('Không tìm thấy sản phẩm theo category ID, đang thử lọc theo tên...');
               candleProducts = productsData.filter(product => {
                  const name = product.name?.toLowerCase() || '';
                  const desc = product.description?.toLowerCase() || '';
                  return (
                     name.includes('nến') ||
                     name.includes('candle') ||
                     desc.includes('nến thơm') ||
                     desc.includes('scented candle')
                  );
               });
            }

            console.log(`Tìm thấy ${candleProducts.length} sản phẩm nến thơm`);

            // Chuẩn hóa danh sách sản phẩm nến
            const normalizedProducts = candleProducts.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // 3. Lấy chi tiết sản phẩm và giá cho từng sản phẩm nến
            const detailedProducts = await Promise.all(
               normalizedProducts.map(async (product) => {
                  try {
                     // Lấy chi tiết sản phẩm từ API chi tiếp
                     const detailResponse = await fetch(`${HOST}/api/products/${product.id}`);
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

            // Get product IDs for batch ratings fetch
            const productIds = detailedProducts.map(p => p.id);

            // Fetch ratings for all products in a single batch
            const ratingsMap = await fetchRatingsForProducts(productIds);
            console.log('Fetched ratings for', Object.keys(ratingsMap).length, 'products');

            // 4. Lấy thông tin giá
            try {
               // Fetch prices data
               const pricesResponse = await fetch(`${HOST}/api/v1/prices`, {
                  headers: {
                     Authorization: 'Bearer ' + localStorage.getItem('token'),
                  },
               });

               if (!pricesResponse.ok) {
                  throw new Error('Failed to fetch prices');
               }

               const pricesData: Price[] = await pricesResponse.json();
               console.log('Tìm thấy tổng số giá:', pricesData.length);

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

                  // Price logic...

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

                  // Try to find prices for this product
                  const productPrices = pricesData.filter(price =>
                     price.product_detail && price.product_detail.productId === product.id
                  );

                  if (productPrices.length > 0) {
                     console.log(`Found ${productPrices.length} prices for product ${product.id}`);

                     // Create variants from productPrices
                     productPrices.forEach(price => {
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
                  // If no direct product prices found, process details if available
                  else if (product.details && product.details.length > 0) {
                     console.log(`Product ${product.id} has ${product.details.length} variants`);

                     // Create a map of detail IDs to prices for efficient lookup
                     const detailPricesMap: { [detailId: number]: Price } = {};
                     pricesData.forEach(price => {
                        if (price.product_detail && price.product_detail.id) {
                           detailPricesMap[price.product_detail.id] = price;
                        }
                     });

                     // Process each variant (detail) of the product
                     product.details.forEach((detail: { id: string | number; size: string; type: string; quantities: number; isActive: boolean; }) => {
                        console.log(`Processing variant ${detail.id} for product ${product.id}`);

                        // Find price for this variant based on detail ID
                        const price = detailPricesMap[Number(detail.id)];

                        if (price) {
                           console.log(`Found price for variant ${detail.id}: ${price.base_price}`);
                           variants.push({
                              detailId: Number(detail.id),
                              size: detail.size || 'Default',
                              type: detail.type || 'Standard',
                              basePrice: price.base_price.toString(),
                              discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                              inStock: detail.quantities > 0 && detail.isActive
                           });
                        } else {
                           console.log(`Warning: No price found for variant ${detail.id} of product ${product.id}`);
                        }
                     });
                  }

                  // Sort variants by price (lowest to highest)
                  variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                  // Use the cheapest variant price as default price
                  if (variants.length > 0) {
                     basePrice = variants[0].basePrice;
                     discountPrice = variants[0].discountPrice;
                  }

                  // Get the rating from ratingsMap or use default
                  const rating = ratingsMap[product.id] || 0;

                  return {
                     id: product.id,
                     title: product.name,
                     description: product.description,
                     price: basePrice,
                     discountPrice: discountPrice,
                     rating: rating, // Use actual rating from API
                     imageUrl: imageUrl || '/images/placeholder.jpg',
                     variants: variants.length > 0 ? variants : undefined,
                  };
               });

               setProducts(mappedProducts);
            } catch (priceErr) {
               console.error('Lỗi khi lấy thông tin giá:', priceErr);
            }
         } catch (err) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();

      // Auto-advance the carousel every 5 seconds
      const interval = setInterval(() => {
         nextSlide();
      }, 5000);

      return () => clearInterval(interval);
   }, []);

   // Move to correct slide position when currentSlide changes
   useEffect(() => {
      if (carouselRef.current) {
         carouselRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
   }, [currentSlide]);

   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
   };


   return (
      <div className='bg-[#F1EEE9] py-8'>
         <div className='max-w-7xl mx-auto px-4'>
            <h2 className='text-2xl font-semibold text-[#553C26] mb-6 text-center'>Nến Thơm Nổi Bật</h2>

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

            {!loading && !error && products.length === 0 && (
               <div className='text-center py-10'>
                  <p className='text-gray-500'>Hiện không có sản phẩm nến thơm nào</p>
               </div>
            )}

            {!loading && !error && products.length > 0 && (
               <div className='relative'>
                  {/* Carousel navigation buttons */}
                  <button
                     onClick={prevSlide}
                     className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md'
                     aria-label='Previous slide'
                  >
                     <ChevronLeft className='w-6 h-6' />
                  </button>

                  <button
                     onClick={nextSlide}
                     className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-800 p-2 rounded-full shadow-md'
                     aria-label='Next slide'
                  >
                     <ChevronRight className='w-6 h-6' />
                  </button>

                  {/* Carousel container */}
                  <div className='overflow-hidden'>
                     <div
                        ref={carouselRef}
                        className='flex transition-transform duration-500 ease-in-out'
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                     >
                        {/* Generate slides */}
                        {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                           const slideProducts = products.slice(
                              slideIndex * itemsPerSlide,
                              slideIndex * itemsPerSlide + itemsPerSlide
                           );

                           return (
                              <div
                                 key={slideIndex}
                                 className='flex-none w-full'
                              >
                                 <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                                    {slideProducts.map((product) => (
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
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Carousel indicator dots */}
                  <div className='flex justify-center mt-6 gap-2'>
                     {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                           key={index}
                           onClick={() => setCurrentSlide(index)}
                           className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-[#553C26]' : 'bg-gray-300'
                              } transition-colors`}
                           aria-label={`Go to slide ${index + 1}`}
                        />
                     ))}
                  </div>
               </div>
            )}

            {/* View all products link */}
            <div className='text-center mt-8'>
               <Link href='/user/products/candles'>
                  <button className='px-6 py-2 bg-[#553C26] text-white rounded-full  gap-2 hover:bg-amber-600 transition-colors font-mont font-medium'>
                     Xem tất cả nến thơm
                  </button>
               </Link>
            </div>
         </div>
      </div>
   );
}
