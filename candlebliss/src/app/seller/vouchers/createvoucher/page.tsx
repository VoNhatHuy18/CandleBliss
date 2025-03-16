'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import {
   FiCalendar,
   FiTag,
   FiPercent,
   FiDollarSign,
   FiUsers,
   FiInfo,
   FiCheckCircle,
} from 'react-icons/fi';
import Link from 'next/link';

export default function CreateVoucher() {
   const [voucherData, setVoucherData] = useState({
      code: '',
      name: '',
      startDate: '',
      endDate: '',
      discountPercent: '',
      minPrice: '',
      usageLimit: '',
      description: '',
      applyTo: 'all',
   });

   const [isSubmitting, setIsSubmitting] = useState(false);

   // Format date để hiển thị
   const formatDate = (dateString: string | number | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   };

   // Cập nhật dữ liệu voucher
   const handleChange = (e: { target: { name: any; value: any } }) => {
      const { name, value } = e.target;
      setVoucherData((prev) => ({ ...prev, [name]: value }));
   };

   // Tạo voucher
   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Giả lập thời gian xử lý
      setTimeout(() => {
         alert('Đã tạo voucher thành công!');
         setIsSubmitting(false);
      }, 1500);
   };

   return (
      <div className='flex min-h-screen bg-gray-50'>
         <Head>
            <title>Tạo mã giảm giá mới - Candle Bliss</title>
         </Head>

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

            {/* Nội dung chính - thêm padding-top để tránh header */}
            <div className='flex-1 p-6 mt-16'>
               <div className='mb-6 flex justify-between items-center'>
                  <div className='text-sm mb-6'>
                     <Link href='/seller/vouchers' className='text-gray-500 hover:text-amber-800'>
                        Quản lý mã khuyến mãi
                     </Link>
                     <span className='mx-2 text-gray-400'>/</span>
                     <span className='text-gray-700'>Tạo mã khuyến mãi mới</span>
                  </div>
               </div>

               <div className='flex gap-6'>
                  {/* Form bên trái */}
                  <div className='bg-white p-6 rounded-lg shadow-sm flex-1 transition-all duration-300 hover:shadow-md'>
                     <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                           <div className='col-span-2'>
                              <h2 className='text-lg font-medium mb-4 pb-2 border-b'>
                                 Thông tin cơ bản
                              </h2>
                           </div>

                           <div className='relative'>
                              <label className='block mb-2 text-sm font-medium'>Mã voucher:</label>
                              <div className='relative'>
                                 <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500'>
                                    <FiTag />
                                 </span>
                                 <input
                                    type='text'
                                    name='code'
                                    className='w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                    placeholder='SUMMER2025'
                                    value={voucherData.code}
                                    onChange={handleChange}
                                    required
                                 />
                              </div>
                              <p className='text-xs text-gray-500 mt-1'>
                                 Mã độc nhất để khách hàng nhập khi sử dụng
                              </p>
                           </div>

                           <div>
                              <label className='block mb-2 text-sm font-medium'>
                                 Tên mã giảm giá:
                              </label>
                              <input
                                 type='text'
                                 name='name'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 placeholder='Ví dụ: Giảm giá mùa hè'
                                 value={voucherData.name}
                                 onChange={handleChange}
                                 required
                              />
                           </div>

                           {/* Các trường còn lại giữ nguyên... */}
                           <div>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian bắt đầu:
                              </label>
                              <input
                                 type='date'
                                 name='startDate'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 value={voucherData.startDate}
                                 onChange={handleChange}
                                 required
                              />
                           </div>

                           <div>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian kết thúc:
                              </label>
                              <input
                                 type='date'
                                 name='endDate'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 value={voucherData.endDate}
                                 onChange={handleChange}
                                 required
                              />
                           </div>

                           <div className='col-span-2'>
                              <h2 className='text-lg font-medium mb-4 mt-2 pb-2 border-b'>
                                 Thiết lập giảm giá
                              </h2>
                           </div>

                           <div className='relative'>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiPercent className='mr-1 text-amber-600' />
                                 Mức giảm (%):
                              </label>
                              <input
                                 type='number'
                                 name='discountPercent'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 placeholder='10'
                                 min='0'
                                 max='100'
                                 value={voucherData.discountPercent}
                                 onChange={handleChange}
                                 required
                              />
                           </div>

                           <div>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiDollarSign className='mr-1 text-amber-600' />
                                 Giá trị đơn hàng tối thiểu:
                              </label>
                              <div className='relative'>
                                 <input
                                    type='number'
                                    name='minPrice'
                                    className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                    placeholder='100000'
                                    min='0'
                                    value={voucherData.minPrice}
                                    onChange={handleChange}
                                 />
                                 <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm'>
                                    VNĐ
                                 </span>
                              </div>
                           </div>

                           <div>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiUsers className='mr-1 text-amber-600' />
                                 Số lượt sử dụng:
                              </label>
                              <select
                                 name='usageLimit'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 value={voucherData.usageLimit}
                                 onChange={handleChange}
                              >
                                 <option value=''>Không giới hạn</option>
                                 <option value='10'>10 lượt</option>
                                 <option value='50'>50 lượt</option>
                                 <option value='100'>100 lượt</option>
                                 <option value='200'>200 lượt</option>
                                 <option value='500'>500 lượt</option>
                              </select>
                           </div>

                           <div>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiInfo className='mr-1 text-amber-600' />
                                 Đối tượng áp dụng:
                              </label>
                              <select
                                 name='applyTo'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition'
                                 value={voucherData.applyTo}
                                 onChange={handleChange}
                              >
                                 <option value='all'>Tất cả sản phẩm</option>
                                 <option value='product'>Sản phẩm cụ thể</option>
                                 <option value='category'>Theo danh mục</option>
                              </select>
                           </div>

                           <div className='col-span-2'>
                              <label className=' mb-2 text-sm font-medium flex items-center'>
                                 <FiInfo className='mr-1 text-amber-600' />
                                 Mô tả:
                              </label>
                              <textarea
                                 name='description'
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition h-24'
                                 placeholder='Mô tả chi tiết về mã giảm giá này, điều kiện áp dụng...'
                                 value={voucherData.description}
                                 onChange={handleChange}
                              ></textarea>
                           </div>
                        </div>

                        <div className='flex justify-end mt-6 space-x-2'>
                           <button
                              type='button'
                              className='px-5 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300'
                           >
                              Hủy
                           </button>
                           <button
                              type='submit'
                              disabled={isSubmitting}
                              className={`px-5 py-2 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700 transition focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center ${
                                 isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                           >
                              {isSubmitting ? (
                                 <>
                                    <svg
                                       className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                       xmlns='http://www.w3.org/2000/svg'
                                       fill='none'
                                       viewBox='0 0 24 24'
                                    >
                                       <circle
                                          className='opacity-25'
                                          cx='12'
                                          cy='12'
                                          r='10'
                                          stroke='currentColor'
                                          strokeWidth='4'
                                       ></circle>
                                       <path
                                          className='opacity-75'
                                          fill='currentColor'
                                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                       ></path>
                                    </svg>
                                    Đang tạo...
                                 </>
                              ) : (
                                 <>
                                    <FiCheckCircle className='mr-1' /> Tạo voucher
                                 </>
                              )}
                           </button>
                        </div>
                     </form>
                  </div>

                  {/* Phần voucher preview bên phải */}
                  <div className='w-96 hidden md:block'>
                     <div className='sticky top-24'>
                        <h2 className='text-lg font-medium mb-4 flex items-center'>
                           <FiTag className='mr-2 text-amber-600' /> Xem trước voucher
                        </h2>

                        {/* Phần preview của voucher giữ nguyên... */}
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
                                          {voucherData.code || 'VOUCHER'}
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

                                 <div className='text-lg font-semibold my-2'>
                                    {voucherData.name || 'Tên mã giảm giá'}
                                 </div>

                                 <div className='text-md font-semibold border-t border-dashed border-gray-200 pt-2 mt-2'>
                                    {voucherData.discountPercent ? (
                                       <>
                                          Giảm{' '}
                                          <span className='text-red-600 font-bold'>
                                             {voucherData.discountPercent}%
                                          </span>
                                       </>
                                    ) : (
                                       'Giảm ...%'
                                    )}
                                 </div>

                                 <div className='flex justify-between mt-2'>
                                    <div className='text-xs'>
                                       {voucherData.endDate
                                          ? `Hạn sử dụng: ${formatDate(voucherData.endDate)}`
                                          : 'Hạn sử dụng: ...'}
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
                                 <span className='ml-1'>
                                    {voucherData.minPrice
                                       ? `${Number(voucherData.minPrice).toLocaleString(
                                            'vi-VN',
                                         )} VNĐ`
                                       : '...'}
                                 </span>
                              </div>
                              <div className='mb-2 flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-500' />
                                 <span className='font-medium'>Thời gian:</span>{' '}
                                 <span className='ml-1'>
                                    {voucherData.startDate
                                       ? `${formatDate(voucherData.startDate)} - ${formatDate(
                                            voucherData.endDate || new Date(),
                                         )}`
                                       : '...'}
                                 </span>
                              </div>
                              <div className='mb-2 flex items-center'>
                                 <FiUsers className='mr-1 text-amber-500' />
                                 <span className='font-medium'>Lượt sử dụng:</span>{' '}
                                 <span className='ml-1'>
                                    {voucherData.usageLimit || 'Không giới hạn'}
                                 </span>
                              </div>
                              <div className='flex items-center'>
                                 <FiInfo className='mr-1 text-amber-500' />
                                 <span className='font-medium'>Áp dụng:</span>{' '}
                                 <span className='ml-1'>
                                    {voucherData.applyTo === 'all'
                                       ? 'Tất cả sản phẩm'
                                       : voucherData.applyTo === 'product'
                                       ? 'Sản phẩm cụ thể'
                                       : voucherData.applyTo === 'category'
                                       ? 'Danh mục sản phẩm'
                                       : '...'}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Phần hướng dẫn mẫu */}
                        <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-md border border-blue-100 transition-all duration-300 hover:shadow-md'>
                           <h3 className='text-sm font-medium text-blue-700 mb-2 flex items-center'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-4 w-4 mr-1'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                              Mẹo tạo voucher hiệu quả
                           </h3>
                           <ul className='text-xs text-blue-700 list-disc pl-5 space-y-2'>
                              <li>Đặt tên voucher dễ nhớ, liên quan đến chương trình</li>
                              <li>Giới hạn thời gian để tạo cảm giác khan hiếm</li>
                              <li>Thiết lập mức chi tiêu tối thiểu phù hợp</li>
                              <li>Mô tả rõ ràng về điều kiện áp dụng</li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
