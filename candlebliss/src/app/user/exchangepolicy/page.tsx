'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function ExchangePolicyPage() {
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
                           Chính sách đổi trả
                        </span>
                     </div>
                  </li>
               </ol>
            </nav>
         </div>

         <div className='container mx-auto px-4 py-8 flex-grow'>
            <div className='max-w-4xl mx-auto'>
               <h1 className='text-3xl font-medium mb-6'>Chính sách đổi trả</h1>

               <div className='bg-white rounded-lg shadow p-6'>
                  <div className='prose max-w-none'>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>1. Điều kiện đổi trả</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Sản phẩm còn nguyên tem, nhãn mác</li>
                           <li>Sản phẩm chưa qua sử dụng hoặc bị hư hỏng</li>
                           <li>Có hóa đơn mua hàng</li>
                           <li>Thời gian đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                        </ul>
                     </div>

                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>2. Các trường hợp được đổi trả</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Sản phẩm bị lỗi do nhà sản xuất</li>
                           <li>Sản phẩm giao không đúng mẫu, size, màu sắc</li>
                           <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                           <li>Sản phẩm không đúng với mô tả</li>
                        </ul>
                     </div>

                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>3. Quy trình đổi trả</h2>
                        <ol className='list-decimal pl-5 text-gray-700 mb-4'>
                           <li className='mb-2'>Liên hệ với chúng tôi qua hotline hoặc email</li>
                           <li className='mb-2'>Cung cấp thông tin đơn hàng và lý do đổi trả</li>
                           <li className='mb-2'>Nhận mã đổi trả và hướng dẫn đóng gói</li>
                           <li className='mb-2'>Gửi sản phẩm về địa chỉ công ty</li>
                           <li>Nhận sản phẩm mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc</li>
                        </ol>
                     </div>

                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>4. Chi phí đổi trả</h2>
                        <ul className='list-disc pl-5 text-gray-700 mb-4'>
                           <li>Miễn phí đổi trả nếu lỗi từ nhà sản xuất</li>
                           <li>Khách hàng chịu phí vận chuyển cho các trường hợp khác</li>
                           <li>Hoàn tiền 100% nếu không có sản phẩm thay thế</li>
                        </ul>
                     </div>

                     <div className='border-t pt-6'>
                        <h2 className='text-xl font-medium mb-4'>5. Lưu ý</h2>
                        <ul className='list-disc pl-5 text-gray-700'>
                           <li>Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi nhận hàng</li>
                           <li>Giữ lại hóa đơn và tem nhãn sản phẩm</li>
                           <li>Không nhận đổi trả cho các sản phẩm đã qua sử dụng</li>
                           <li>Liên hệ ngay với chúng tôi nếu có bất kỳ vấn đề nào với sản phẩm</li>
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
