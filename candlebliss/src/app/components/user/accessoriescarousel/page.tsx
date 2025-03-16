'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'Nến Thơm Quế',
    description: 'Hương thơm đặc trưng của Quế',
    price: '650,000đ',
    discount: '-5%',
    originalPrice: '685,000đ',
    image: '/images/trending.png',
    isNew: false,
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Nến Thơm Nhiệt Đới',
    description: 'Mùi thơm của mùa hè',
    price: '650,000đ',
    discount: '-10%',
    originalPrice: '722,000đ',
    image: '/images/trending.png',
    isNew: false,
    rating: 4.2,
  },
  {
    id: 3,
    name: 'Nến Thơm Cà Phê',
    description: 'Mùi hương của cà phê',
    price: '650,000đ',
    discount: null,
    originalPrice: null,
    image: '/images/trending.png',
    isNew: false,
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Nến Thơm Thư Giãn',
    description: 'Mùi hương của sự yên bình',
    price: '500,000đ',
    discount: null,
    originalPrice: null,
    image: '/images/trending.png',
    isNew: true,
    rating: 5.0,
  },
  {
    id: 5,
    name: 'Nến Thơm Trà Trắng',
    description: 'Mùi thơm của thiên nhiên',
    price: '200,000đ',
    discount: null,
    originalPrice: null,
    image: '/images/trending.png',
    isNew: true,
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Nến Thơm Hoa Nhài',
    description: 'Hương hoa nhài dịu nhẹ',
    price: '350,000đ',
    discount: '-15%',
    originalPrice: '412,000đ',
    image: '/images/trending.png',
    isNew: false,
    rating: 4.6,
  },
];

export default function GlideSlide() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const visibleItems = 4; // Number of items visible at once
  const totalItems = products.length;

  useEffect(() => {
    if (isHovering) return; // Don't auto-scroll when user is hovering
    
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovering, currentIndex]);

  const handlePrev = () => {
    if (sliderRef.current) {
      const newIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(newIndex);
      
      const cardWidth = sliderRef.current.querySelector('div')?.clientWidth || 0;
      const gap = 16; // gap-4 = 16px
      sliderRef.current.scrollLeft = newIndex * (cardWidth + gap);
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      const newIndex = currentIndex + 1 >= Math.ceil(totalItems - visibleItems + 1) ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex === 0) {
        sliderRef.current.scrollLeft = 0;
      } else {
        const cardWidth = sliderRef.current.querySelector('div')?.clientWidth || 0;
        const gap = 16; // gap-4 = 16px
        sliderRef.current.scrollLeft = newIndex * (cardWidth + gap);
      }
    }
  };
  
  // Generate star rating UI
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    // Add empty stars
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 my-12">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 font-mont">Sản Phẩm Nổi Bật</h2>
          <div className="h-1 w-24 bg-amber-500 mt-2"></div>
        </div>
        <div className="hidden md:flex space-x-2">
          <button 
            onClick={handlePrev}
            className="p-2 rounded-full border border-gray-300 hover:bg-amber-50 hover:border-amber-300 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={handleNext}
            className="p-2 rounded-full border border-gray-300 hover:bg-amber-50 hover:border-amber-300 transition-colors"
            aria-label="Next"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div 
          ref={sliderRef} 
          className="flex gap-8 overflow-x-scroll scrollbar-hide scroll-smooth transition-transform duration-500"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[280px] max-w-[280px] group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Product Image Container */}
              <div className="relative h-60 overflow-hidden bg-[#F9F6F3]">
                {product.discount && (
                  <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount}
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-3 left-3 z-10 bg-amber-800 text-white text-xs font-bold px-2 py-1 rounded">
                    Mới
                  </span>
                )}
                
                {/* Product Image */}
                <Image
                  src={product.image}
                  alt={product.name}
                  width={280}
                  height={240}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Quick action buttons - visible on hover */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent p-4">
                 
                  <button className="bg-[#553C26] text-white px-4 py-2 rounded-full flex items-center gap-1 hover:bg-amber-600 transition-colors">
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-4 bg-white">
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {renderRating(product.rating)}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">({product.rating})</span>
                </div>
                
                {/* Product Name */}
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium text-gray-800 hover:text-amber-600 transition-colors cursor-pointer mb-1 font-mont">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Description */}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                
                {/* Price */}
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-amber-800">{product.price}</span>
                  {product.originalPrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile navigation buttons */}
        <div className="md:hidden flex justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-2 pointer-events-none">
          <button 
            onClick={handlePrev}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white pointer-events-auto"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <button 
            onClick={handleNext}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white pointer-events-auto"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Progress Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {[...Array(Math.ceil(totalItems / visibleItems))].map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-amber-500 w-6' : 'bg-gray-300'
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

      {/* View All Button */}
      <div className="flex justify-center mt-10">
        <Link href="/products">
          <button className="px-8 py-3 bg-[#553C26] text-white rounded-full flex items-center gap-2 hover:bg-amber-600 transition-colors font-mont font-medium">
            Xem Tất Cả Sản Phẩm
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
