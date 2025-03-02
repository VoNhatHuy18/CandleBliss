'use client'

import React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
   LogOut,
   Home,
   Package,
   ShoppingBag,
   CreditCard,
   Settings,
   Users,
   ChevronDown,
   ChevronUp,
} from 'lucide-react';

export default function MenuSideBar() {
   const [showProductSubmenu, setShowProductSubmenu] = useState(false);

   const toggleProductSubmenu = () => {
      setShowProductSubmenu(!showProductSubmenu);
   };

   return (
      <div className='min-h-screen bg-gray-50 flex'>
         {/* Sidebar */}
         <div className='w-64 bg-white shadow-md h-screen flex flex-col'>
            <div className='p-4 border-b'>
               <div className='flex items-center'>
                  <Image
                     src={'/images/logoCoChu.png'}
                     alt='Candle Bliss Logo'
                     height={62}
                     width={253}
                     className='cursor-pointer'
                  />
               </div>
            </div>
            <nav className='mt-4 flex-grow overflow-y-auto'>
               <div className='px-4 py-2'>
                  <Link
                     href='/seller/dashboard'
                     className='flex items-center p-2 bg-amber-100 text-amber-800 rounded'
                  >
                     <Home size={18} className='mr-2' />
                     <span>Danh Mục</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <button
                     onClick={toggleProductSubmenu}
                     className='flex items-center justify-between w-full p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <div className='flex items-center'>
                        <Package size={18} className='mr-2' />
                        <span>Quản Lý Sản Phẩm</span>
                     </div>
                     {showProductSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showProductSubmenu && (
                     <div className='ml-6 mt-2 border-l-2 border-gray-200 pl-2'>
                        <Link
                           href='/seller/products'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Tất cả sản phẩm</span>
                        </Link>
                        <Link
                           href='/products/gift-sets'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Tạo set quà</span>
                        </Link>
                        <Link
                           href='/products/promotions'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Khuyến Mãi</span>
                        </Link>
                        <Link
                           href='/products/price-list'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Bảng giá</span>
                        </Link>
                     </div>
                  )}
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/orders'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <ShoppingBag size={18} className='mr-2' />
                     <span>Quản Lý Đơn Hàng</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/payments'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <CreditCard size={18} className='mr-2' />
                     <span>Quản Lý Đối trả</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/finances'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <CreditCard size={18} className='mr-2' />
                     <span>Quản Lý Tài Chính</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/permissions'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <Users size={18} className='mr-2' />
                     <span>Phân Quyền</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/settings'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <Settings size={18} className='mr-2' />
                     <span>Cài Đặt</span>
                  </Link>
               </div>
            </nav>
            <div className='p-4 border-t'>
               <button className='flex items-center p-2 text-gray-600 w-full hover:bg-gray-100 rounded'>
                  <LogOut size={18} className='mr-2' />
                  <span>Đăng Xuất</span>
               </button>
            </div>
         </div>
      </div>
   );
}
