'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Star, StarHalf, Eye, Menu, X } from 'lucide-react';
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

// Create a client component that uses searchParams
function ProductSearch({ onSearch }: { onSearch: (query: string) => void }) {
   const searchParams = useSearchParams();
   const searchQuery = searchParams.get('search') || '';

   useEffect(() => {
      onSearch(searchQuery);
   }, [searchParams, onSearch]);

   return null; // This component doesn't render anything, just processes the search
}

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
            // 1. Lấy danh sách sản phẩm cơ bản
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            // Chuẩn hóa danh sách sản phẩm
            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // 2. Lấy thêm thông tin về giá
            try {
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
               console.log('Total prices found:', pricesData.length);

               // 3. Tạo mapping giữa productId và mảng prices
               const productPricesMap: { [productId: number]: Price[] } = {};

               // Nhóm prices theo productId trong product_detail
               pricesData.forEach(price => {
                  if (price.product_detail && price.product_detail.productId) {
                     const productId = price.product_detail.productId;
                     if (!productPricesMap[productId]) {
                        productPricesMap[productId] = [];
                     }
                     productPricesMap[productId].push(price);
                  }
               });

               console.log('Product price mappings created for', Object.keys(productPricesMap).length, 'products');

               // 4. Xây dựng mảng sản phẩm hiển thị với thông tin giá
               const mappedProducts = await Promise.all(normalizedProducts.map(async (product) => {
                  console.log(`Processing product ${product.id}: ${product.name}`);

                  // Default values
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

                  // Lấy ảnh đầu tiên làm ảnh hiển thị
                  const imageUrl = product.images && product.images.length > 0
                     ? product.images[0].path
                     : null;

                  // Tìm giá dựa trên productId
                  const productPrices = productPricesMap[product.id] || [];

                  if (productPrices.length > 0) {
                     console.log(`Found ${productPrices.length} prices for product ${product.id}`);

                     // Tạo variants từ productPrices
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

                     // Sắp xếp theo giá từ thấp đến cao
                     variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                     // Lấy giá thấp nhất làm giá mặc định
                     if (variants.length > 0) {
                        basePrice = variants[0].basePrice;
                        discountPrice = variants[0].discountPrice;
                     }
                  } else {
                     console.log(`No prices found for product ${product.id} - fetching details`);

                     // Nếu không có giá, thử lấy chi tiết từ API riêng
                     try {
                        const detailResponse = await fetch(`http://68.183.226.198:3000/api/products/${product.id}`);
                        if (detailResponse.ok) {
                           const detailData = await detailResponse.json();

                           if (detailData.details && detailData.details.length > 0) {
                              console.log(`Found ${detailData.details.length} details from specific API`);

                              // Tìm giá cho từng detail trong details
                              const detailIds = detailData.details.map((d: ProductDetail) => d.id);

                              // Lấy prices cho các detail này từ pricesData
                              const detailPrices = pricesData.filter(
                                 price => price.product_detail && detailIds.includes(price.product_detail.id)
                              );

                              if (detailPrices.length > 0) {
                                 // Tạo variants từ detailPrices
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

                                 // Sắp xếp theo giá từ thấp đến cao
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
                     rating: 4.5,
                     imageUrl: imageUrl || '/images/placeholder.jpg',
                     variants: variants.length > 0 ? variants : undefined,
                  };
               }));

               setProducts(mappedProducts);
               setFilteredProducts(mappedProducts);
            } catch (priceErr) {
               console.error('Error fetching prices:', priceErr);
               // Fallback khi không lấy được thông tin giá
               const mappedProductsWithoutPrices = normalizedProducts.map(product => ({
                  id: product.id,
                  title: product.name,
                  description: product.description,
                  price: '0',
                  rating: 4.5,
                  imageUrl: product.images && product.images.length > 0
                     ? product.images[0].path
                     : '/images/placeholder.jpg',
               }));

               setProducts(mappedProductsWithoutPrices);
               setFilteredProducts(mappedProductsWithoutPrices);
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

         {/* Wrap the search params usage in Suspense */}
         <Suspense fallback={<div>Loading search results...</div>}>
            <ProductSearch onSearch={handleSearch} />
         </Suspense>

         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>S Ả N P H Ẩ M</p>
            {searchQuery ? (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  KẾT QUẢ TÌM KIẾM: &ldquo;{searchQuery}&rdquo;
               </p>
            ) : (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  TẤT CẢ SẢN PHẨM
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

               {!loading && !error && filteredProducts.length > productsPerPage && !searchQuery && (
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

         <Footer />
      </div>
   );
}
