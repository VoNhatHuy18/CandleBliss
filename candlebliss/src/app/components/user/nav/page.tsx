'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function NavBar() {
   const [showSearchInput, setShowSearchInput] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [userName, setUserName] = useState<string | null>(null);
   const router = useRouter();

   const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
   };

   // Kiểm tra trạng thái đăng nhập mỗi khi component được render
   useEffect(() => {
      // Check for JWT token in localStorage
      const token = localStorage.getItem('token');
      if (token) {
         setIsLoggedIn(true);
         try {
            // Decode the token to get user information
            const decoded = jwtDecode(token);
            // Assuming your token contains a name field
            setUserName((decoded as { name: string }).name);
         } catch (error) {
            console.error('Invalid token:', error);
            // Nếu token không hợp lệ, xóa token và đặt trạng thái là chưa đăng nhập
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setIsLoggedIn(false);
            setUserName(null);
         }
      } else {
         setIsLoggedIn(false);
         setUserName(null);
      }
   }, []);

   const handleUserIconClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isLoggedIn) {
         // If logged in, go directly to profile page
         router.push('/user/profile');
      } else {
         // If not logged in, go to sign in page
         router.push('/user/signin');
      }
   };

   const handleLogout = () => {
      // Remove all authentication tokens
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Update state
      setIsLoggedIn(false);
      setUserName(null);

      // Redirect to home
      router.push('/user/home');
   };

   return (
      <>
         {/* Menu */}
         <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
            <div className='flex items-center'>
               <Link href='/user/home'>
                  <div className='cursor-pointer'>
                     <Image
                        src={'/images/logoCoChu.png'}
                        alt='Candle Bliss Logo'
                        height={62}
                        width={253}
                        className='cursor-pointer w-auto h-10 md:h-12 lg:h-auto'
                     />
                  </div>
               </Link>
            </div>

            {/* Mobile menu button */}
            <div className='flex items-center space-x-4 md:space-x-6 lg:hidden'>
               <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className='text-[#553C26]'
               >
                  <MagnifyingGlassIcon className='size-5' />
               </button>
               <Link href='/user/cart' className='text-[#553C26]'>
                  <ShoppingBagIcon className='size-5' />
               </Link>
               <button onClick={toggleMobileMenu} className='text-[#553C26]'>
                  {mobileMenuOpen ? (
                     <XMarkIcon className='size-6' />
                  ) : (
                     <Bars3Icon className='size-6' />
                  )}
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
                  <Link href='/user/products'>
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
               <Link href='https://www.facebook.com/' target='_blank'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Liên Hệ
                  </button>
               </Link>
               <div className='relative items-center flex'>
                  {showSearchInput && (
                     <input
                        type='text'
                        className='p-2 border border-[#553C26] rounded-lg'
                        placeholder='Tìm kiếm...'
                     />
                  )}
                  <button
                     onClick={() => setShowSearchInput(!showSearchInput)}
                     className='ml-2 text-[#553C26]'
                  >
                     <MagnifyingGlassIcon className='size-5' />
                  </button>
               </div>
               <Link href='/user/cart' className='text-[#553C26]'>
                  <ShoppingBagIcon className='size-5' />
               </Link>
               <div className='relative items-center flex '>
                  <button onClick={handleUserIconClick} className='text-[#553C26] '>
                     <UserIcon className='size-5' />
                  </button>
                  {isLoggedIn && userName && (
                     <div className='absolute top-full right-0 mt-1 bg-[#F1EEE9] rounded-md shadow-lg px-2 py-1 text-xs text-[#553C26] font-semibold truncate'>
                        {userName}
                     </div>
                  )}
               </div>
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
                  <Link href='' onClick={toggleMobileMenu}>
                     <a href='https://www.facebook.com/'>
                        <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                           Liên Hệ
                        </span>
                     </a>
                  </Link>
                  <div className='pt-2'>
                     {!isLoggedIn ? (
                        <>
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
                        </>
                     ) : (
                        <>
                           <Link href='/user/profile' onClick={toggleMobileMenu}>
                              <span className='block text-[#553C26] text-lg hover:text-[#FF9900]'>
                                 Hồ Sơ Cá Nhân ({userName})
                              </span>
                           </Link>
                           <button
                              onClick={handleLogout}
                              className='block text-[#553C26] text-lg hover:text-[#FF9900] mt-2 text-left'
                           >
                              Đăng Xuất
                           </button>
                        </>
                     )}
                  </div>
               </nav>
            </div>
         )}
      </>
   );
}
