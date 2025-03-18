'use client';

import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Eye, Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/app/components/user/nav/page';
import MenuSidebar from '@/app/components/user/menusidebar/page';
import Footer from '@/app/components/user/footer/page';

interface ProductImage {
   id: string;
   path: string;
   public_id: string;
}

interface ProductDetail {
   id: number;
   size: string;
   type: string;
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

// 1. Cập nhật interface Product để phù hợp với API
interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage | ProductImage[]; // Có thể là một object hoặc mảng
}

interface ProductCardProps {
   title: string;
   price: string;
   discountPrice?: string;
   rating: number;
   imageUrl: string;
   onViewDetail?: () => void;
   onAddToCart?: () => void;
}

const ProductCard = ({
   title,
   price,
   discountPrice,
   rating,
   imageUrl,
   onViewDetail,
   onAddToCart,
}: ProductCardProps) => {
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

   // Format price to include commas
   const formatPrice = (value: string) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   };

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
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
               <Link href={`/user/products/${encodeURIComponent(title)}`}>
                  <button
                     onClick={onViewDetail}
                     className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border boder-black'
                  >
                     <Eye className='w-4 h-4' />
                     <span>Xem chi tiết</span>
                  </button>
               </Link>
               <button
                  onClick={onAddToCart}
                  className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border boder-black'
               >
                  <ShoppingCart className='w-4 h-4' />
                  <span>Thêm vào giỏ</span>
               </button>
            </div>
         </div>
         <div className='mt-3'>
            <h3 className='text-sm font-medium text-gray-700 line-clamp-2'>{title}</h3>
            <div className='mt-1 flex items-center'>{renderStars()}</div>
            <div className='mt-1'>
               {discountPrice ? (
                  <div className='flex items-center gap-2'>
                     <p className='text-sm font-medium text-red-600'>
                        {formatPrice(discountPrice)}đ
                     </p>
                     <p className='text-xs text-gray-500 line-through'>{formatPrice(price)}đ</p>
                  </div>
               ) : (
                  <p className='text-sm font-medium text-red-600'>{formatPrice(price)}đ</p>
               )}
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
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
      }>
   >([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const productsResponse = await fetch('http://localhost:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            // Chuẩn hóa dữ liệu sản phẩm
            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // Log để kiểm tra dữ liệu đã chuẩn hóa
            console.log('Normalized Products data:', normalizedProducts);

            // Kiểm tra cụ thể về hình ảnh của từng sản phẩm
            normalizedProducts.forEach((product, index) => {
               console.log(`Product ${index}: ${product.name}`);
               console.log(`  - Has images:`, product.images.length > 0);
               if (product.images && product.images.length > 0) {
                  console.log(`  - First image path:`, product.images[0].path);
               }
            });

            try {
               // Fetch prices with authentication
               const pricesResponse = await fetch('http://localhost:3000/api/v1/prices', {
                  headers: {
                     Authorization: 'Bearer ' + localStorage.getItem('token'),
                  },
               });
               if (!pricesResponse.ok) {
                  console.warn('Could not fetch prices, using default values');
                  // Continue with products but use default prices
                  const mappedProducts = normalizedProducts.map((product) => {
                     // Lấy đường dẫn hình ảnh đầu tiên nếu có
                     const imageUrl =
                        product.images && product.images.length > 0 ? product.images[0].path : null;

                     return {
                        id: product.id,
                        title: product.name,
                        price: '0', // Default price
                        rating: 4.5,
                        imageUrl: imageUrl || '/images/placeholder.jpg',
                     };
                  });
                  setProducts(mappedProducts);
                  return;
               }

               const pricesData: Price[] = await pricesResponse.json();

               // Map products with prices
               const mappedProducts = normalizedProducts.map((product) => {
                  console.log(`Mapping product ${product.id}: ${product.name}`);

                  // Lấy đường dẫn hình ảnh đầu tiên nếu có
                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;
                  console.log(`  - Image path:`, imageUrl);

                  const priceInfo = pricesData.find(
                     (price) => price.product_detail.id === product.id,
                  );

                  console.log(`  - Final imageUrl:`, imageUrl || '/images/placeholder.jpg');

                  return {
                     id: product.id,
                     title: product.name,
                     price: priceInfo ? priceInfo.base_price.toString() : '0',
                     discountPrice: priceInfo?.discount_price
                        ? priceInfo.discount_price.toString()
                        : undefined,
                     rating: 4.5,
                     imageUrl: imageUrl || '/images/placeholder.jpg',
                  };
               });

               setProducts(mappedProducts);
            } catch (priceErr) {
               console.warn('Error fetching prices:', priceErr);
               // Handle gracefully and continue with products
               const mappedProducts = normalizedProducts.map((product) => ({
                  id: product.id,
                  title: product.name,
                  price: '0', // Default price
                  rating: 4.5,
                  imageUrl: product.images?.[0]?.path || '/images/placeholder.jpg',
               }));
               setProducts(mappedProducts);
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

   const handleViewDetail = () => {
      console.log('View detail clicked');
   };

   const handleAddToCart = () => {
      console.log('Add to cart clicked');
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <NavBar />
         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>S Ả N P H Ẩ M</p>
            <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>Nến Thơm</p>
         </div>

         {/* Mobile menu button */}
         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
            {/* Sidebar */}
            <div
               className={`
               lg:w-64 bg-white
               fixed lg:relative
               inset-y-0 left-0
               transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
               lg:translate-x-0 transition-transform duration-300 ease-in-out
               z-30 h-full
               overflow-y-auto
            `}
            >
               <MenuSidebar />
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
               <div
                  className='fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden'
                  onClick={() => setIsSidebarOpen(false)}
               />
            )}

            {/* Main content */}
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

               {!loading && !error && products.length === 0 && (
                  <div className='text-center py-10'>
                     <p className='text-gray-500'>Không tìm thấy sản phẩm nào</p>
                  </div>
               )}

               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {products.map((product) => (
                     <ProductCard
                        key={product.id}
                        title={product.title}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        rating={product.rating}
                        imageUrl={product.imageUrl}
                        onViewDetail={handleViewDetail}
                        onAddToCart={handleAddToCart}
                     />
                  ))}
               </div>

               {!loading && !error && products.length > 0 && (
                  <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                     <button className='px-3 py-1 bg-gray-200 rounded-md text-gray-700 font-medium'>
                        1
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        2
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        3
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        4
                     </button>
                  </div>
               )}
            </div>
         </div>

         <Footer />
      </div>
   );
}
