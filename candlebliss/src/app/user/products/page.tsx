'use client';

import React, { useState } from 'react';
import { Star, StarHalf, Eye, Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import NavBar from '@/app/components/user/nav/page';
import MenuSidebar from '@/app/components/user/menusidebar/page';
import Footer from '@/app/components/user/footer/page';


interface ProductCardProps {
   title: string;
   price: string;
   rating: number;
   imageUrl: string;
   onViewDetail?: () => void;
   onAddToCart?: () => void;
}

const ProductCard = ({ title, price, rating, imageUrl, onViewDetail, onAddToCart }: ProductCardProps) => {
   const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
         stars.push(<Star key={`star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      }

      if (hasHalfStar) {
         stars.push(
            <StarHalf key="half-star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
         );
      }

      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
         stars.push(<Star key={`empty-star-${i}`} className="w-4 h-4 text-yellow-400" />);
      }

      return stars;
   };

   return (
      <div className="rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow">
         <div className="relative aspect-square overflow-hidden rounded-lg group">
            <Image
               src={imageUrl}
               alt={title}
               height={400}
               width={400}
               className="h-full w-full object-cover transition-all duration-300 group-hover:blur-sm"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <button
                  onClick={onViewDetail}
                  className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border boder-black"
               >
                  <Eye className="w-4 h-4" />
                  <span>Xem chi tiết</span>
               </button>
               <button
                  onClick={onAddToCart}
                  className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border boder-black"
               >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm vào giỏ</span>
               </button>
            </div>
         </div>
         <div className="mt-3">
            <h3 className="text-sm font-medium text-gray-700 line-clamp-2">{title}</h3>
            <div className="mt-1 flex items-center">{renderStars()}</div>
            <p className="mt-1 text-sm font-medium text-red-600">{price}đ</p>
         </div>
      </div>
   );
};

export default function ProductPage() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const products = Array(10).fill({
      title: 'Bộ phụ kiện nến Dụng cụ chăm sóc nến thơm thường bị bỏ qua bởi mọi người...',
      price: '150,000',
      rating: 4.5,
      imageUrl: '/api/placeholder/400/400',
   });

   const handleViewDetail = () => {
      console.log('View detail clicked');
   };

   const handleAddToCart = () => {
      console.log('Add to cart clicked');
   };

   return (
      <div className="bg-[#F1EEE9] min-h-screen">
         <NavBar />
         <div className="px-4 lg:px-0 py-8">
            <p className="text-center text-[#555659] text-lg font-mont">S Ả N P H Ẩ M</p>
            <p className="text-center font-mont font-semibold text-xl lg:text-3xl pb-4">
               Nến Thơm
            </p>
         </div>

         {/* Mobile menu button */}
         <button
            className="lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
            {/* Sidebar */}
            <div className={`
               lg:w-64 bg-white
               fixed lg:relative
               inset-y-0 left-0
               transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
               lg:translate-x-0 transition-transform duration-300 ease-in-out
               z-30 h-full
               overflow-y-auto
            `}>
               <MenuSidebar />
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
               <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
               />
            )}

            {/* Main content */}
            <div className="flex-1 px-4 lg:px-8">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product, index) => (
                     <ProductCard 
                        key={index} 
                        {...product} 
                        onViewDetail={handleViewDetail}
                        onAddToCart={handleAddToCart}
                     />
                  ))}
               </div>

               <div className="flex justify-center items-center gap-2 mt-8 pb-8">
                  <button className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 font-medium">
                     1
                  </button>
                  <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700">
                     2
                  </button>
                  <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700">
                     3
                  </button>
                  <button className="px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700">
                     4
                  </button>
               </div>
            </div>
         </div>
         
         <Footer />
      </div>
   );
}