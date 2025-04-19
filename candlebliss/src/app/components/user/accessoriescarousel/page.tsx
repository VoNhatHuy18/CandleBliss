'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, StarHalf, Eye, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


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
   details?: ProductDetail[]; // Add the 'details' property as optional
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

// Update ProductCard component to better handle variants and their prices
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

   // Add this function to use setSelectedVariant
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

   // Cập nhật hàm tính giá sau khi áp dụng phần trăm giảm giá
   const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
      const basePriceNum = parseFloat(basePrice);
      const discountPercentNum = parseFloat(discountPercent);

      if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

      // Tính giá sau khi giảm: basePrice * (1 - discount/100)
      const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
      return discountedPrice;
   };

   // Lấy thông tin giá hiển thị dựa trên product-detail
   const getDisplayPrice = () => {
      // Nếu có variants và đã chọn một variant
      if (variants && variants.length > 0) {
         // Sử dụng variant được chọn nếu có, ngược lại sử dụng variant đầu tiên
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

      // Fallback nếu không có variant hoặc không thể tìm thấy variant đã chọn
      const actualDiscountPrice = discountPrice
         ? calculateDiscountedPrice(price, discountPrice)
         : null;

      return {
         basePrice: price,
         discountPrice: actualDiscountPrice,
         discountPercent: discountPrice,
      };
   };

   // Get the display price values
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

            {/* Badge giảm giá */}
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

            {/* Hiển thị tùy chọn variants */}
            {variants && variants.length > 0 && (
               <div className='mt-2'>
                  {/* Toggle button to show/hide variant options */}
                  <button
                     className='text-xs text-gray-600 hover:text-orange-700 mb-1 flex items-center'
                     onClick={() => setShowVariantOptions(!showVariantOptions)}
                  ></button>
                  {renderVariantOptions()}
               </div>
            )}

            {/* Hiển thị giá */}
            <div className='mt-1.5'>
               {(() => {
                  // Nếu có giảm giá
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
                  }
                  // Không có giảm giá
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



export default function ProductPage() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
   const [searchQuery] = useState('');

   // Remove pagination state and add carousel refs and state
   const carouselRef = useRef<HTMLDivElement>(null);
   const [activeSlide, setActiveSlide] = useState(0);
   const slidesToShow = { mobile: 1, tablet: 2, desktop: 4 };

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            try {
               // Lấy dữ liệu giá
               const pricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                  headers: {
                     Authorization: 'Bearer ' + localStorage.getItem('token'),
                  },
               });
               if (!pricesResponse.ok) {
                  // Xử lý khi không lấy được giá
                  return;
               }

               const pricesData: Price[] = await pricesResponse.json();
               console.log('Tổng số giá được tìm thấy:', pricesData.length);

               // Lấy thông tin chi tiết sản phẩm (product details) trực tiếp để biết chúng thuộc về sản phẩm nào
               // Nếu API không có sẵn, chúng ta sẽ thử phương pháp khác
               const productDetailMapping: { [key: number]: number } = {};

               // Phương pháp 1: Lấy mapping từ product.details nếu có
               normalizedProducts.forEach((product) => {
                  if (product.details && product.details.length > 0) {
                     product.details.forEach((detail) => {
                        productDetailMapping[detail.id] = product.id;
                     });
                  }
               });

               console.log('Mapped product details:', Object.keys(productDetailMapping).length);

               // Tạo danh sách sản phẩm hiển thị
               const mappedProducts = normalizedProducts.map((product) => {
                  console.log(`Mapping product ${product.id}: ${product.name}`);

                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;

                  // Tìm tất cả các giá liên quan đến sản phẩm này thông qua product details
                  const relatedPrices = [];

                  // Cách 1: Nếu sản phẩm có danh sách details
                  if (product.details && product.details.length > 0) {
                     const detailIds = product.details.map((detail) => detail.id);

                     // Tìm giá cho từng chi tiết sản phẩm
                     detailIds.forEach((detailId) => {
                        const matchingPrices = pricesData.filter(
                           (price) => price.product_detail && price.product_detail.id === detailId,
                        );
                        relatedPrices.push(...matchingPrices);
                     });
                  }
                  // Cách 2: Nếu không có details, thử nhiều cách khác để tìm liên kết
                  else {
                     // Tạo mảng ID chi tiết sản phẩm có thể thuộc về sản phẩm này
                     // Dùng heuristic: Chi tiết sản phẩm có thể có ID gần với ID sản phẩm
                     const potentialDetailIds = Array.from({ length: 5 }, (_, i) => product.id + i);
                     potentialDetailIds.push(product.id, product.id * 2, product.id * 3); // Thêm một vài phỏng đoán

                     pricesData.forEach((price) => {
                        if (
                           price.product_detail &&
                           potentialDetailIds.includes(price.product_detail.id)
                        ) {
                           relatedPrices.push(price);
                        }
                     });
                  }

                  console.log(`Found ${relatedPrices.length} prices for product ${product.id}`);

                  // Nếu không tìm thấy giá, thử dùng một số heuristic khác
                  if (relatedPrices.length === 0) {
                     // Dùng product_detail đầu tiên trong pricesData nếu không có dữ liệu khác
                     // Đây chỉ là giải pháp tạm thời để hiển thị
                     // Trong thực tế cần cải thiện API để trả về thông tin chính xác hơn
                     if (pricesData.length > 0) {
                        const firstPrice = pricesData[0];
                        relatedPrices.push(firstPrice);
                        console.log(`Using fallback price for product ${product.id}`);
                     }
                  }

                  // Xử lý giá
                  let basePrice = '0';
                  let discountPrice: string | undefined = undefined;

                  if (relatedPrices.length > 0) {
                     // Sắp xếp giá từ thấp đến cao
                     relatedPrices.sort((a, b) => Number(a.base_price) - Number(b.base_price));
                     basePrice = relatedPrices[0].base_price.toString();

                     // Tìm giá khuyến mãi thấp nhất
                     const discountPrices = relatedPrices.filter(
                        (price) => price.discount_price && Number(price.discount_price) > 0,
                     );

                     if (discountPrices.length > 0) {
                        // Lưu ý: discount_price ở đây là phần trăm giảm giá (ví dụ: 50 có nghĩa là giảm 50%)
                        discountPrice = discountPrices[0].discount_price.toString();
                     }
                  }

                  // Tạo danh sách biến thể (variants)
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
               console.error('Error fetching prices:', priceErr);
               // Xử lý fallback khi không lấy được giá
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


   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
   };

   // Add carousel navigation functions
   const scrollToNext = () => {
      if (carouselRef.current) {
         const scrollAmount = carouselRef.current.clientWidth;
         carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

         const newSlide = Math.min(
            activeSlide + 1,
            Math.ceil(filteredProducts.length / slidesToShow.desktop) - 1
         );
         setActiveSlide(newSlide);
      }
   };



   // Add auto-scroll effect for carousel
   useEffect(() => {
      const autoScrollInterval = setInterval(() => {
         if (filteredProducts.length > slidesToShow.desktop) {
            scrollToNext();
         }
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(autoScrollInterval);
   }, [activeSlide, filteredProducts.length]);

   // Update the carousel navigation to match the carousel component
   const goToSlide = (index: number) => {
      setActiveSlide(index);
      if (carouselRef.current) {
         const scrollAmount = carouselRef.current.clientWidth * index;
         carouselRef.current.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
         });
      }
   };

   // Auto-scroll effect for carousel (similar to the Carousel component)
   useEffect(() => {
      const autoScrollInterval = setInterval(() => {
         const nextSlide = (activeSlide + 1) % Math.ceil(filteredProducts.length / slidesToShow.desktop);
         goToSlide(nextSlide);
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(autoScrollInterval);
   }, [activeSlide, filteredProducts.length]);

   return (
      <div className='bg-[#F1EEE9]'>
         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

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
                              Không tìm thấy sản phẩm phù hợp với &ldquo;{searchQuery}&rdquo;
                           </p>
                           <Link href='/user/products'>
                              <button className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'>
                                 Xem tất cả sản phẩm
                              </button>
                           </Link>
                        </div>
                     ) : (
                        <p className='text-gray-500'>Không có sản phẩm nào</p>
                     )}
                  </div>
               )}

               {/* Replace with a simpler carousel layout like the Carousel component */}
               {!loading && !error && filteredProducts.length > 0 && (
                  <div className="relative w-auto max-w-6xl mx-auto overflow-hidden mt-6 pb-12">
                     <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sản phẩm nổi bật</h2>

                     {/* Main carousel container with transition effect */}
                     <div className="relative overflow-hidden rounded-lg">
                        <div
                           ref={carouselRef}
                           className="flex transition-transform duration-500 ease-out"
                           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                           {filteredProducts.map((product) => (
                              <div
                                 key={product.id}
                                 className="flex-none w-full sm:w-1/2 lg:w-1/4 px-2"
                              >
                                 <ProductCard
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
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Carousel indicators similar to the Carousel component */}
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-2 py-4">
                        {Array.from({
                           length: Math.ceil(filteredProducts.length / slidesToShow.desktop)
                        }).map((_, index) => (
                           <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all ${activeSlide === index ? 'bg-gray-800 w-6' : 'bg-gray-400'
                                 }`}
                              onClick={() => goToSlide(index)}
                              aria-label={`Go to slide ${index + 1}`}
                           />
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
