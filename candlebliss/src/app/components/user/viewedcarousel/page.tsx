'use client';

import { useState, useEffect } from 'react';
import { Eye, ShoppingCart, Star, StarHalf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Interface for viewed products
interface ViewedProduct {
   id: number;
   name: string;
   image: string;
   price: number;
   discountPrice: number | null;
   timestamp: number;
   description?: string;
   rating?: number;
   hasVariants?: boolean;
}

export default function ViewedCarousel() {
   const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
   const [loading, setLoading] = useState(true);

   // Thêm hook để đảm bảo giá được tính toán lại sau khi client-side hydration
   const [formattedPrices, setFormattedPrices] = useState<Record<number, {
      price: string,
      discountPrice: string | null
   }>>({});

   // Load viewed products from localStorage
   useEffect(() => {
      // Only run on client side
      if (typeof window !== 'undefined') {
         try {
            const storedProducts = localStorage.getItem('viewedProducts');
            if (storedProducts) {
               const parsedProducts = JSON.parse(storedProducts);
               console.log("Loaded viewed products:", parsedProducts);

               // Kiểm tra và log chi tiết để debug
               if (Array.isArray(parsedProducts)) {
                  parsedProducts.forEach((product: any, index: number) => {
                     console.log(`Product ${index} - ${product.name}:`, {
                        price: typeof product.price,
                        priceValue: product.price,
                        discountPrice: typeof product.discountPrice,
                        discountPriceValue: product.discountPrice
                     });
                  });
               }

               setViewedProducts(parsedProducts);
            }
         } catch (error) {
            console.error('Error loading viewed products:', error);
         } finally {
            setLoading(false);
         }
      }
   }, []);

   // Tính toán giá đã format sau khi component đã mount
   useEffect(() => {
      if (viewedProducts.length > 0) {
         const prices: Record<number, { price: string, discountPrice: string | null }> = {};

         viewedProducts.forEach(product => {
            prices[product.id] = {
               price: formatPrice(product.price),
               discountPrice: product.discountPrice ? formatPrice(product.discountPrice) : null
            };
         });

         setFormattedPrices(prices);
      }
   }, [viewedProducts]);

   // Debug viewed products data
   useEffect(() => {
      if (viewedProducts.length > 0) {
         console.log("Viewed products data:", viewedProducts);
      }
   }, [viewedProducts]);

   // If no viewed products or still loading, return empty
   if (loading || viewedProducts.length === 0) {
      return null;
   }

   // Format price helper function
   const formatPrice = (price: number | string | null): string => {
      if (price === null || price === undefined) return "0";

      // Chuyển đổi giá trị thành số
      let numPrice: number;

      if (typeof price === 'string') {
         // Nếu price là chuỗi, loại bỏ các ký tự định dạng và chuyển thành số
         numPrice = parseFloat(price.replace(/[^\d.]/g, ''));
      } else {
         numPrice = price;
      }

      // Kiểm tra nếu không phải là số hợp lệ
      if (isNaN(numPrice)) return "0";

      // Format số với dấu phẩy ngăn cách hàng nghìn
      return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   };

   // Giới hạn số lượng sản phẩm hiển thị
   const displayLimit = 4;
   const displayProducts = viewedProducts.slice(0, displayLimit);

   // Helper function to render rating stars
   const renderStars = (rating: number = 4.5) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
         stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      }

      if (hasHalfStar) {
         stars.push(
            <StarHalf key="half-star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
         );
      }

      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
         stars.push(<Star key={`empty-star-${i}`} className="w-4 h-4 text-yellow-400" />);
      }

      return stars;
   };

   // Handle add to cart
   const handleAddToCart = (product: ViewedProduct) => {
      const cartItem = {
         productId: product.id,
         name: product.name,
         price: product.discountPrice || product.price,
         quantity: 1,
         imageUrl: product.image
      };

      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

      const existingItemIndex = cartItems.findIndex(
         (item: any) => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
         cartItems[existingItemIndex].quantity += 1;
      } else {
         cartItems.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cartItems));
      alert('Đã thêm sản phẩm vào giỏ hàng!');
   };

   return (
      <div className="my-12">
         <div className="px-4 pb-8">
            <p className="text-center text-[#555659] text-lg font-mont">G Ầ N &nbsp; Đ Â Y</p>
            <p className="text-center font-mont font-semibold text-xl lg:text-3xl pb-4">Sản Phẩm Đã Xem</p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 lg:px-0 max-w-7xl mx-auto">
            {displayProducts.map((product) => (
               <div key={product.id} className="rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow">
                  <div className="relative aspect-square overflow-hidden rounded-lg group">
                     <Image
                        src={product.image || '/images/placeholder.jpg'}
                        alt={product.name}
                        height={400}
                        width={400}
                        className="h-full w-full object-cover transition-all duration-300 group-hover:blur-sm"
                     />
                     <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link href={`/user/products/${product.id}`}>
                           <button
                              className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black"
                           >
                              <Eye className="w-4 h-4" />
                              <span>Xem chi tiết</span>
                           </button>
                        </Link>
                        <button
                           onClick={() => handleAddToCart(product)}
                           className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black"
                        >
                           <ShoppingCart className="w-4 h-4" />
                           <span>Thêm vào giỏ</span>
                        </button>
                     </div>
                  </div>
                  <div className="mt-3">
                     <h3 className="text-sm font-medium text-gray-700 mb-1">{product.name}</h3>
                     <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                        {product.description || ''}
                     </p>



                     <div className="flex items-center">{renderStars(product.rating || 4.5)}</div>
                     <div className="mt-1">


                        {/* Sử dụng formattedPrices thay vì gọi formatPrice trực tiếp */}
                        {formattedPrices[product.id] && (
                           <div>
                              {product.discountPrice ? (
                                 <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-red-600">
                                       {formattedPrices[product.id].discountPrice}đ
                                    </p>
                                    <p className="text-xs text-gray-500 line-through">
                                       {formattedPrices[product.id].price}đ
                                    </p>
                                 </div>
                              ) : (
                                 <p className="text-sm font-medium text-red-600">
                                    {formattedPrices[product.id].price}đ
                                 </p>
                              )}
                           </div>
                        )}

                        {/* Phương án dự phòng - hiển thị trực tiếp nếu formattedPrices chưa sẵn sàng */}
                        {!formattedPrices[product.id] && (
                           <p className="text-sm font-medium text-red-600">
                              {product.discountPrice ? formatPrice(product.discountPrice) : formatPrice(product.price)}đ
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {viewedProducts.length > displayLimit && (
            <div className="text-center mt-8">
               <Link href="/user/products" className="inline-block bg-orange-700 text-white px-6 py-2 rounded-md hover:bg-orange-800 transition-colors">
                  Xem tất cả sản phẩm
               </Link>
            </div>
         )}
      </div>
   );
}
