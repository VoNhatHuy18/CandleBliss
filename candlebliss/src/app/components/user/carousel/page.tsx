'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const Carousel = () => {
   const images = [
      '/images/image.png',
      '/images/image2.png',
      '/images/image3.png',
      '/images/image4.png',
      '/images/image5.png',
   ];

   const [currentIndex, setCurrentIndex] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
   }, [images.length]);

   return (
      <div className='relative w-auto max-w-2xl mx-auto overflow-hidden '>
         <div
            className='flex transition-transform duration-500'
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
         >
            {images.map((image, index) => (
               <div key={index} className='flex-none w-full'>
                  <Image
                     src={image}
                     alt={`Slide ${index + 1}`}
                     height={753}
                     width={688}
                     className='w-full h-auto object-cover rounded-lg flex-none'
                  />
               </div>
            ))}
         </div>

         <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2'>
            {images.map((_, index) => (
               <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                     index === currentIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                  onClick={() => setCurrentIndex(index)}
               ></button>
            ))}
         </div>
      </div>
   );
};

export default Carousel;
