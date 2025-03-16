'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiTag, FiPercent, FiDollarSign, FiUsers, FiInfo } from 'react-icons/fi';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

export default function VoucherDetail() {
   const [startDate, setStartDate] = useState('05/01/2025');
   const [endDate, setEndDate] = useState('09/01/2025');
   const [discountPercent, setDiscountPercent] = useState('10');
   const [minPrice, setMinPrice] = useState('100.000 VND');
   const [usageLimit, setUsageLimit] = useState('Không giới hạn');
   const [description, setDescription] = useState(
      'Giảm giá cho toàn bộ sản phẩm của shop cho ngày quốc tế phụ nữ',
   );
   const [applicableProducts, setApplicableProducts] = useState('Tất cả');
   const [voucherCode, setVoucherCode] = useState('WOMANDAY2025');
   const [voucherName, setVoucherName] = useState('Mã giảm giá ngày quốc tế phụ nữ');

   // Format date để hiển thị
   const formatDate = (dateString: string) => {
      if (!dateString) return '';
      return dateString;
   };

   return (
      <div className='flex min-h-screen bg-[#f8f5f0]'>
         {/* Sidebar cố định bên trái */}
         <div className='fixed left-0 top-0 h-full z-30'>
            <MenuSideBar />
         </div>

         {/* Phần nội dung chính với padding-left để tránh sidebar */}
         <div className='flex-1 flex flex-col ml-64'>
            {/* Header cố định phía trên */}
            <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
               <Header />
            </div>
            {/* Main content */}
            <div className='flex-1 p-6 mt-16'>
               <Head>
                  <title>Chi tiết mã giảm giá - Candle Bliss</title>
               </Head>

               <div className='mb-6'>
                  <div className='text-sm mb-2'>
                     <Link href='/seller/vouchers' className='text-amber-600 hover:text-amber-800'>
                        Quản lý mã giảm giá
                     </Link>
                     <span className='mx-2 text-gray-400'>/</span>
                     <span className='text-gray-700'>Chi tiết mã giảm giá</span>
                  </div>
                  <h1 className='text-xl font-medium'>Chi tiết mã giảm giá</h1>
               </div>

               <div className='bg-white rounded-md shadow-sm p-6'>
                  <div className='flex flex-col md:flex-row gap-6'>
                     <div className='w-full md:w-2/3'>
                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiTag className='mr-1 text-amber-600' />
                              Mã voucher:
                           </label>
                           <input
                              type='text'
                              value={voucherCode}
                              onChange={(e) => setVoucherCode(e.target.value)}
                              className=' w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiTag className='mr-1 text-amber-600' />
                              Tên mã giảm giá:
                           </label>
                           <input
                              type='text'
                              value={voucherName}
                              onChange={(e) => setVoucherName(e.target.value)}
                              className=' w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                           <div>
                              <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian bắt đầu:
                              </label>
                              <input
                                 type='text'
                                 value={startDate}
                                 onChange={(e) => setStartDate(e.target.value)}
                                 className=' w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                           </div>
                           <div>
                              <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian kết thúc:
                              </label>
                              <input
                                 type='text'
                                 value={endDate}
                                 onChange={(e) => setEndDate(e.target.value)}
                                 className=' w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                           </div>
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiPercent className='mr-1 text-amber-600' />
                              Mức giảm (%):
                           </label>
                           <div className='relative mt-1'>
                              <input
                                 type='text'
                                 value={discountPercent}
                                 onChange={(e) => setDiscountPercent(e.target.value)}
                                 className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                              <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none'>
                                 <span className='text-gray-500'>%</span>
                              </div>
                           </div>
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiDollarSign className='mr-1 text-amber-600' />
                              Giá trị tối thiểu:
                           </label>
                           <input
                              type='text'
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiUsers className='mr-1 text-amber-600' />
                              Số lượt sử dụng:
                           </label>
                           <input
                              type='text'
                              value={usageLimit}
                              onChange={(e) => setUsageLimit(e.target.value)}
                              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiInfo className='mr-1 text-amber-600' />
                              Mô tả:
                           </label>
                           <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              rows={3}
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiInfo className='mr-1 text-amber-600' />
                              Đối tượng áp dụng:
                           </label>
                           <input
                              type='text'
                              value={applicableProducts}
                              onChange={(e) => setApplicableProducts(e.target.value)}
                              className='block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>
                     </div>

                     <div className='w-full md:w-1/3'>
                        <div className='sticky top-24'>
                           <h2 className='text-lg font-medium mb-4 flex items-center'>
                              <FiTag className='mr-2 text-amber-600' /> Xem trước voucher
                           </h2>

                           {/* Phần preview voucher với thiết kế giống trang createvoucher */}
                           <div className='bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
                              {/* Phần trang trí */}
                              <div className='absolute -top-10 -right-10 w-20 h-20 bg-amber-100 rounded-full'></div>
                              <div className='absolute -bottom-8 -left-8 w-16 h-16 bg-amber-50 rounded-full'></div>

                              <div className='flex items-center justify-between mb-3 relative z-10'>
                                 <div className='w-full'>
                                    <div className='flex justify-between mb-2'>
                                       <div className='text-sm font-semibold'>
                                          Mã Voucher:{' '}
                                          <span className='font-bold text-amber-600'>
                                             {voucherCode}
                                          </span>
                                       </div>
                                       <div className='bg-amber-50 p-1.5 rounded-full'>
                                          <svg
                                             xmlns='http://www.w3.org/2000/svg'
                                             width='20'
                                             height='20'
                                             viewBox='0 0 24 24'
                                             fill='none'
                                             stroke='currentColor'
                                             strokeWidth='2'
                                             strokeLinecap='round'
                                             strokeLinejoin='round'
                                             className='text-amber-500'
                                          >
                                             <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'></path>
                                          </svg>
                                       </div>
                                    </div>

                                    <div className='text-lg font-semibold my-2'>{voucherName}</div>

                                    <div className='text-md font-semibold border-t border-dashed border-gray-200 pt-2 mt-2'>
                                       Giảm{' '}
                                       <span className='text-red-600 font-bold'>
                                          {discountPercent}%
                                       </span>
                                    </div>

                                    <div className='flex justify-between mt-2'>
                                       <div className='text-xs'>
                                          Hạn sử dụng: {formatDate(endDate)}
                                       </div>
                                       <div className='text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full'>
                                          Hoạt động
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Thông tin chi tiết voucher */}
                              <div className='mt-4 border-t pt-4 text-xs text-gray-600'>
                                 <div className='mb-2 flex items-center'>
                                    <FiDollarSign className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Giá trị tối thiểu:</span>{' '}
                                    <span className='ml-1'>{minPrice}</span>
                                 </div>
                                 <div className='mb-2 flex items-center'>
                                    <FiCalendar className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Thời gian:</span>{' '}
                                    <span className='ml-1'>
                                       {formatDate(startDate)} - {formatDate(endDate)}
                                    </span>
                                 </div>
                                 <div className='mb-2 flex items-center'>
                                    <FiUsers className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Lượt sử dụng:</span>{' '}
                                    <span className='ml-1'>{usageLimit}</span>
                                 </div>
                                 <div className='flex items-center'>
                                    <FiInfo className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Áp dụng:</span>{' '}
                                    <span className='ml-1'>{applicableProducts}</span>
                                 </div>
                              </div>
                           </div>

                           <div className='flex space-y-2 flex-col'>
                              <Link href={`/seller/vouchers/edit/${voucherCode}`}>
                                 <button className='px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 w-full mb-2'>
                                    Chỉnh sửa
                                 </button>
                              </Link>
                              <button className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full mb-2'>
                                 Tải hoạt động
                              </button>
                              <button className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 w-full'>
                                 Xóa mã
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
