'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function ShippingPolicyPage() {
   return (
      <div className='bg-[#F1EEE9] min-h-screen flex flex-col'>
         <Header />

         {/* Breadcrumb navigation */}
         <div className='container mx-auto px-4 pt-4 pb-2'>
            <nav className='flex' aria-label='Breadcrumb'>
               <ol className='inline-flex items-center space-x-1 md:space-x-3'>
                  <li className='inline-flex items-center'>
                     <Link
                        href='/'
                        className='inline-flex items-center text-sm text-gray-700 hover:text-orange-600'
                     >
                        <svg
                           className='w-3 h-3 mr-2.5'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='currentColor'
                           viewBox='0 0 20 20'
                        >
                           <path d='m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z' />
                        </svg>
                        Trang chủ
                     </Link>
                  </li>
                  <li aria-current='page'>
                     <div className='flex items-center'>
                        <svg
                           className='w-3 h-3 text-gray-400 mx-1'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='none'
                           viewBox='0 0 6 10'
                        >
                           <path
                              stroke='currentColor'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='m1 9 4-4-4-4'
                           />
                        </svg>
                        <span className='ml-1 text-sm font-medium text-orange-600 md:ml-2'>
                           Chính sách vận chuyển
                        </span>
                     </div>
                  </li>
               </ol>
            </nav>
         </div>

         <div className='container mx-auto px-4 py-8 flex-grow'>
            <div className='max-w-4xl mx-auto'>
               <h1 className='text-3xl font-medium mb-6'>Chính sách vận chuyển</h1>

               <div className='bg-white rounded-lg shadow p-6'>
                  <div className='prose max-w-none'>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>1. Phạm vi giao hàng</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Giao hàng trên toàn quốc</li>
                           <li>Áp dụng cho tất cả sản phẩm của CandleBliss</li>
                           <li>Có hỗ trợ giao hàng quốc tế (liên hệ để biết thêm chi tiết)</li>
                        </ul>
                     </div>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>2. Thời gian giao hàng</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Nội thành HCM: 1-2 ngày làm việc</li>
                           <li>Các tỉnh miền Nam: 2-3 ngày làm việc</li>
                           <li>Các tỉnh miền Trung: 3-4 ngày làm việc</li>
                           <li>Các tỉnh miền Bắc: 4-5 ngày làm việc</li>
                           <li>Vùng sâu, vùng xa: 5-7 ngày làm việc</li>
                        </ul>
                     </div>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>3. Phí vận chuyển</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Phí vận chuyển mặc định: 30.000đ</li>
                           <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</li>
                           <li>Phụ phí vận chuyển có thể phát sinh tùy theo khu vực</li>
                           <li>Phí sẽ được hiển thị chi tiết khi đặt hàng</li>
                        </ul>
                     </div>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>4. Đơn vị vận chuyển</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Giao hàng nhanh (GHN)</li>
                           <li>Giao hàng tiết kiệm (GHTK)</li>
                           <li>Viettel Post</li>
                           <li>J&T Express</li>
                        </ul>
                     </div>
                     <div className='border-t pt-6'>
                        <h2 className='text-xl font-medium mb-4'>5. Lưu ý khi nhận hàng</h2>
                        <ul className='list-disc pl-5 text-gray-700'>
                           <li>Kiểm tra kỹ tình trạng sản phẩm trước khi nhận hàng</li>
                           <li>Từ chối nhận hàng nếu phát hiện sản phẩm bị hư hỏng</li>
                           <li>Giữ lại biên nhận và hóa đơn để đối chiếu khi cần</li>
                           <li>Liên hệ hotline nếu có bất kỳ vấn đề gì khi nhận hàng</li>
                        </ul>
                     </div>
                  </div>
               </div>

               <div className='mt-8 text-center'>
                  <Link
                     href='/'
                     className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700'
                  >
                     Trở về trang chủ
                  </Link>
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
}
