'use client';
import React, { useState } from 'react';
import Header from '@/app/components/seller/header/page';
import MenuSidebar from '@/app/components/seller/menusidebar/page';
import VoucherTag from '@/app/components/seller/vouchertags/page';

import Link from 'next/link';

export default function VoucherPage() {
   const [searchTerm, setSearchTerm] = useState('');

   // Sample voucher data
   const allVouchers = [
      {
         id: 1,
         code: '1234567',
         discount: '30%',
         expiryDate: '31-05-2023',
         status: 'Còn Hàng',
      },
      {
         id: 2,
         code: '2345678',
         discount: '25%',
         expiryDate: '15-05-2023',
         status: 'Còn Hàng',
      },
      {
         id: 3,
         code: '3456789',
         discount: '40%',
         expiryDate: '10-05-2023',
         status: 'Còn Hàng',
      },
      {
         id: 4,
         code: '4567890',
         discount: '20%',
         expiryDate: '31-05-2023',
         status: 'Còn Hàng',
      },
      // Additional vouchers for better UI demonstration
      {
         id: 5,
         code: '5678901',
         discount: '15%',
         expiryDate: '05-06-2023',
         status: 'Còn Hàng',
      },
      {
         id: 6,
         code: '6789012',
         discount: '35%',
         expiryDate: '20-05-2023',
         status: 'Còn Hàng',
      },
      {
         id: 7,
         code: '7890123',
         discount: '50%',
         expiryDate: '01-06-2023',
         status: 'Hết Hàng',
      },
      {
         id: 8,
         code: '8901234',
         discount: '10%',
         expiryDate: '25-05-2023',
         status: 'Còn Hàng',
      },
   ];

   // Filter vouchers based on search term
   const filteredVouchers = allVouchers.filter(
      (voucher) =>
         voucher.code.includes(searchTerm) ||
         voucher.discount.includes(searchTerm) ||
         voucher.status.toLowerCase().includes(searchTerm.toLowerCase()),
   );

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSidebar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />

            {/* Content area */}
            <main className='flex-1 overflow-auto p-4'>
               {/* Search and action bar */}
               <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                     <div className='relative flex-1 w-full'>
                        <input
                           type='text'
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           placeholder='Tìm kiếm mã giảm giá...'
                           className='w-full px-4 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all'
                        />
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-5 w-5 absolute left-3 top-3 text-gray-400'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                           />
                        </svg>
                     </div>

                     <div className='flex gap-3 w-full sm:w-auto'>
                        <Link href='/seller/vouchers/createvoucher'>
                           <button className='flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-sm flex-1 sm:flex-none'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5 mr-2'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                 />
                              </svg>
                              Thêm mới
                           </button>
                        </Link>

                        <button className='flex items-center justify-center p-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-all bg-white'>
                           <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth={2}
                                 d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                              />
                           </svg>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Content container */}
               <div className='bg-white rounded-lg shadow-sm p-6'>
                  {/* Title section with counter */}
                  <div className='flex items-center justify-between border-b pb-4 mb-6'>
                     <h2 className='text-xl font-semibold text-gray-800'>Mã Giảm Giá</h2>
                  </div>

                  {/* Empty state */}
                  {filteredVouchers.length === 0 && (
                     <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-16 w-16 text-gray-300 mb-4'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                           />
                        </svg>
                        <h3 className='text-lg font-medium text-gray-600 mb-1'>
                           Không tìm thấy mã giảm giá
                        </h3>
                        <p className='text-gray-500 max-w-md'>
                           Không có mã giảm giá nào phù hợp với tìm kiếm của bạn. Vui lòng thử với
                           từ khóa khác.
                        </p>
                     </div>
                  )}

                  {/* Voucher grid with improved spacing and responsive layout */}
                  {filteredVouchers.length > 0 && (
                     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                        {filteredVouchers.map((voucher) => (
                           <div key={voucher.id} className='flex flex-col'>
                              <VoucherTag
                                 code={voucher.code}
                                 discount={voucher.discount}
                                 expiryDate={voucher.expiryDate}
                                 status={voucher.status}
                                 id={''}
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
