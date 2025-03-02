'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
const products = [
   {
      id: 1,
      name: 'Nến Thơm Quế',
      description: 'Hương thơm đặc trưng của Quế',
      price: '650,000đ',
      discount: '-5%',
      image: '/images/trending.png',
      isNew: false,
   },
   {
      id: 2,
      name: 'Nến Thơm Nhiệt Đới',
      description: 'Mùi thơm của mùa hè',
      price: '650,000đ',
      discount: '-10%',
      image: '/images/trending.png',
      isNew: false,
   },
   {
      id: 3,
      name: 'Nến Thơm Cà Phê',
      description: 'Mùi hương của cà phê',
      price: '650,000đ',
      discount: null,
      image: '/images/trending.png',
      isNew: false,
   },
   {
      id: 4,
      name: 'Nến Thơm Thư Giãn',
      description: 'Mùi hương của sự yên bình',
      price: '500,000đ',
      discount: null,
      image: '/images/trending.png',
      isNew: true,
   },
   {
      id: 5,
      name: 'Nến Thơm Trà Trắng',
      description: 'Mùi thơm của thiên nhiên',
      price: '200,000đ',
      discount: null,
      image: '/images/trending.png',
      isNew: true,
   },
];

export default function GlideSlide() {
   const sliderRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const interval = setInterval(() => {
         handleNext();
      }, 3000);
      return () => clearInterval(interval);
   }, []);

   const handlePrev = () => {
      if (sliderRef.current) {
         sliderRef.current.scrollLeft -= 300;
      }
   };

   const handleNext = () => {
      if (sliderRef.current) {
         const maxScrollLeft = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;
         if (sliderRef.current.scrollLeft >= maxScrollLeft) {
            sliderRef.current.scrollLeft = 0;
         } else {
            sliderRef.current.scrollLeft += 300;
         }
      }
   };

   return (
      <div className='relative w-full max-w-7xl mx-auto'>
         {/* Glide Slider */}
         <div ref={sliderRef} className='flex gap-6 overflow-x-scroll scrollbar-hide scroll-smooth'>
            {products.map((product) => (
               <div
                  key={product.id}
                  className='min-w-[250px] p-4 bg-[#F1EEE9] rounded-lg  flex-shrink-0 relative'
               >
                  {/* Product Card */}
                  <div className='flex flex-col items-start shadow-lg p-4'>
                     {product.discount && (
                        <span className='absolute top-2 right-2 bg-[#FF6F61] text-white text-sm font-semibold px-2 py-1 rounded-full'>
                           {product.discount}
                        </span>
                     )}

                     {product.isNew && (
                        <span className='absolute top-2 right-2 bg-[#D3C2B7] text-white text-sm font-semibold px-2 py-1 rounded-full'>
                           Mới
                        </span>
                     )}

                     <Image
                        src={product.image}
                        alt={product.name}
                        height={290}
                        width={290}
                        className='w-full h-56 object-cover rounded-lg mb-4'
                     />
                     <h2 className='text-lg font-semibold font-mont'>{product.name}</h2>
                     <p className='text-gray-500 font-mont'>{product.description}</p>
                     <p className='text-lg font-bold mt-2'>{product.price}</p>
                  </div>
               </div>
            ))}
         </div>
         <div className='flex justify-center items-center'>
            <button className='mt-4 px-14 py-4 bg-[#F1EEE9] text-black rounded-full flex border border-[#C9A489] font-mont font-semibold hover:bg-[#FF9900]'>
               Xem Thêm <ChevronRightIcon className='h-6 w-6 pl-1' />
            </button>
         </div>
         <button
            className='relative right-14 bottom-52  bg-[#553C26] text-white p-3 rounded-full hover:bg-gray-700 '
            onClick={handlePrev}
         >
            <ChevronLeftIcon className='h-6 w-6' />
         </button>

         {/* Next Button */}
         <button
            className='relative left-[1238px] bottom-52 bg-[#553C26] text-white p-3 rounded-full hover:bg-gray-700'
            onClick={handleNext}
         >
            <ChevronRightIcon className='h-6 w-6' />
         </button>
      </div>
   );
}
