'use client';

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function NavBar() {
   const [showSearchInput, setShowSearchInput] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   
   const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
   };

   return (
      <>
         {/* Header */}
         <header className='bg-[#F1EEE9] py-2 flex justify-between px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60'>
            <h4 className='text-[#553C26] font-normal text-sm md:text-base'>Email: candlebliss@gmail.com</h4>
            <div className='hidden sm:block'>
               <a href='/user/signup'>
                  <span className='text-[#553C26] hover:underline text-sm md:text-base lg:text-xl'>Đăng Ký |</span>
               </a>
               <a href='/user/signin'>
                  <span className='text-[#553C26] hover:underline text-sm md:text-base lg:text-xl'> Đăng Nhập</span>
               </a>
            </div>
            <div className='sm:hidden'>
               <a href='/user/signin'>
                  <UserIcon className='size-5 text-[#553C26]' />
               </a>
            </div>
         </header>
         <hr className='border-t-2 border-t-[#553C26]' />
         
         {/* Menu */}
         <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
            <div className='flex items-center'>
               <Image
                  src={'/images/logoCoChu.png'}
                  alt='Candle Bliss Logo'
                  height={62}
                  width={253}
                  className='cursor-pointer w-auto h-10 md:h-12 lg:h-auto'
               />
            </div>
            
            {/* Mobile menu button */}
            <div className='flex items-center space-x-4 md:space-x-6 lg:hidden'>
               <button onClick={() => setShowSearchInput(!showSearchInput)} className='text-[#553C26]'>
                  <MagnifyingGlassIcon className='size-5' />
               </button>
               <Link href='/user/cart' className='text-[#553C26]'>
                  <ShoppingBagIcon className='size-5' />
               </Link>
               <button onClick={toggleMobileMenu} className='text-[#553C26]'>
                  {mobileMenuOpen ? <XMarkIcon className='size-6' /> : <Bars3Icon className='size-6' />}
               </button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className='hidden lg:flex space-x-5 xl:space-x-10 text-[#553C26] items-center'>
               <Link href='/user/home'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Trang Chủ
                  </button>
               </Link>
               <div className='relative group'>
                  <Link href='/user/product'>
                     <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                        Sản Phẩm
                     </button>
                  </Link>
                  <div className='absolute hidden group-hover:block bg-[#F1EEE9] shadow-lg rounded-lg w-36 font-semibold z-50'>
                     <Link
                        href='/products/candles'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Nến Thơm
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/products/holders'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Tinh Dầu
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/products/scents'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Phụ Kiện Nến
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/products/accessories'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Quà Tặng
                     </Link>
                  </div>
               </div>
               <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                  Về Chúng Tôi
               </button>
               <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                  Liên Hệ
               </button>
               <div className='relative items-center flex'>
                  {showSearchInput && (
                     <input
                        type='text'
                        className='p-2 border border-[#553C26] rounded-lg'
                        placeholder='Tìm kiếm...'
                     />
                  )}
                  <button onClick={() => setShowSearchInput(!showSearchInput)} className='ml-2 text-[#553C26]'>
                     <MagnifyingGlassIcon className='size-5' />
                  </button>
               </div>
               <Link href='/user/cart' className='text-[#553C26]'>
                  <ShoppingBagIcon className='size-5' />
               </Link>
               <Link href='/' className='text-[#553C26]'>
                  <UserIcon className='size-5' />
               </Link>
            </nav>
         </div>
         
         {/* Mobile Menu */}
         {mobileMenuOpen && (
            <div className='lg:hidden bg-[#F1EEE9] py-4 px-4 sm:px-6 md:px-12 shadow-md'>
               {showSearchInput && (
                  <div className='mb-4'>
                     <input
                        type='text'
                        className='w-full p-2 border border-[#553C26] rounded-lg'
                        placeholder='Tìm kiếm...'
                     />
                  </div>
               )}
               <nav className='flex flex-col space-y-4'>
                  <Link href='/user/home' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Trang Chủ
                     </span>
                  </Link>
                  <div className='relative'>
                     <Link href='/user/product' onClick={toggleMobileMenu}>
                        <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                           Sản Phẩm
                        </span>
                     </Link>
                     <div className='ml-4 mt-2 space-y-2'>
                        <Link href='/products/candles' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Nến Thơm
                           </span>
                        </Link>
                        <Link href='/products/holders' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Tinh Dầu
                           </span>
                        </Link>
                        <Link href='/products/scents' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Phụ Kiện Nến
                           </span>
                        </Link>
                        <Link href='/products/accessories' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Quà Tặng
                           </span>
                        </Link>
                     </div>
                  </div>
                  <Link href='/about' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Về Chúng Tôi
                     </span>
                  </Link>
                  <Link href='/contact' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Liên Hệ
                     </span>
                  </Link>
                  <div className='sm:hidden pt-2'>
                     <Link href='/user/signup' onClick={toggleMobileMenu}>
                        <span className='block text-[#553C26] text-lg hover:text-[#FF9900]'>
                           Đăng Ký
                        </span>
                     </Link>
                     <Link href='/user/signin' onClick={toggleMobileMenu}>
                        <span className='block text-[#553C26] text-lg hover:text-[#FF9900] mt-2'>
                           Đăng Nhập
                        </span>
                     </Link>
                  </div>
               </nav>
            </div>
         )}
      </>
   );
}