'use client';

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function NavBar() {
   const [showSearchInput, setShowSearchInput] = useState(false);
   return (
      <>
         {/* Header */}
         <header className='bg-[#F1EEE9] py-2 flex justify-between px-60'>
            <h4 className='text-[#553C26] font-normal'>Email: candlebliss@gmail.com</h4>
            <div className=''>
               <a href='/user/signup'>
                  <span className='text-[#553C26] hover:underline text-xl'>Đăng Ký |</span>
               </a>
               <a href='/user/signin'>
                  <span className='text-[#553C26] hover:underline text-xl'> Đăng Nhập</span>
               </a>
            </div>
         </header>
         <hr className='border-t-2 border-t-[#553C26]' />
         {/* Menu */}
         <div className='bg-[#F1EEE9]  flex justify-between px-60'>
            <div className='flex space-x-2 items-center'>
               <Image
                  src={'/images/logoCoChu.png'}
                  alt='Candle Bliss Logo'
                  height={62}
                  width={253}
                  className='cursor-pointer'
               />
            </div>
            <nav className='flex space-x-10 text-[#553C26] items-center'>
               <Link href='/user/home'>
                  <button className='text-lg  hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Trang Chủ
                  </button>
               </Link>
               <div className='relative group'>
                  <Link href='/user/product'>
                  <button className='text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Sản Phẩm
                  </button>
                  </Link>
                  <div className='absolute hidden group-hover:block bg-[#F1EEE9] shadow-lg rounded-lg  w-36 font-semibold z-50'>
                     <Link
                        href='/products/candles'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8] '
                     >
                        Nến Thơm
                     </Link>
                     <hr className=' border-[#553C26]' />
                     <Link
                        href='/products/holders'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8] '
                     >
                        Tinh Dầu
                     </Link>
                     <hr className=' border-[#553C26]' />
                     <Link
                        href='/products/scents'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Phụ Kiện Nến
                     </Link>
                     <hr className=' border-[#553C26]' />
                     <Link
                        href='/products/accessories'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Quà Tặng
                     </Link>
                  </div>
               </div>
               <button className='text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                  Về Chúng Tôi
               </button>
               <button className='text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                  Liên Hệ
               </button>
               <div className='relative items-center flex'>
                  {showSearchInput && (
                     <input
                        type='text'
                        className=' p-2 border border-[#553C26] rounded-lg '
                        placeholder='Tìm kiếm...'
                     />
                  )}
                  <button onClick={() => setShowSearchInput(!showSearchInput)} className='ml-2'>
                     <MagnifyingGlassIcon className='size-6' />
                  </button>
               </div>
               <Link href='/cart' className='hover:underline'>
                  <ShoppingBagIcon className='size-6' />
               </Link>
               <Link href='/' className='hover:underline'>
                  <UserIcon className='size-6' />
               </Link>
            </nav>
         </div>
      </>
   );
}
