'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function PaymentMethodPage() {
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
                           Hình thức thanh toán
                        </span>
                     </div>
                  </li>
               </ol>
            </nav>
         </div>

         <div className='container mx-auto px-4 py-8 flex-grow'>
            <div className='max-w-4xl mx-auto'>
               <h1 className='text-3xl font-medium mb-6'>Hình thức thanh toán</h1>

               <div className='bg-white rounded-lg shadow p-6'>
                  <div className='prose max-w-none'>
                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>
                           1. Thanh toán khi nhận hàng (COD)
                        </h2>
                        <div className='flex items-start space-x-4 mb-4'>
                           <div className='w-16 h-16 relative flex-shrink-0'>
                              <Image
                                 src='/images/logo.png'
                                 alt='COD'
                                 fill
                                 className='object-contain'
                              />
                           </div>
                           <div>
                              <p className='text-gray-700 mb-2'>
                                 Quý khách có thể thanh toán bằng tiền mặt khi nhận hàng tại địa chỉ
                                 giao hàng.
                              </p>
                              <ul className='list-disc pl-5 text-gray-700'>
                                 <li>Áp dụng cho tất cả đơn hàng trên toàn quốc</li>
                                 <li>Khách hàng kiểm tra hàng trước khi thanh toán</li>
                                 <li>Không mất phí giao dịch</li>
                              </ul>
                           </div>
                        </div>
                     </div>

                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>2. Chuyển khoản ngân hàng</h2>
                        <div className='flex items-start space-x-4 mb-4'>
                           <div className='w-16 h-16 relative flex-shrink-0'>
                              <Image
                                 src='/images/vietinbank-logo.png'
                                 alt='Bank Transfer'
                                 fill
                                 className='object-contain'
                              />
                           </div>
                           <div>
                              <p className='text-gray-700 mb-2'>
                                 Chuyển khoản trực tiếp vào tài khoản ngân hàng của chúng tôi:
                              </p>
                              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                                 <p className='font-medium'>Thông tin tài khoản:</p>
                                 <ul className='list-none pl-0 text-gray-700'>
                                    <li>Ngân hàng: Vietcombank</li>
                                    <li>Số tài khoản: 1234567890</li>
                                    <li>Chủ tài khoản: CANDLEBLISS</li>
                                    <li>Chi nhánh: TP.HCM</li>
                                 </ul>
                              </div>
                              <p className='text-gray-700 italic'>
                                 Nội dung chuyển khoản: [Mã đơn hàng] - [Số điện thoại]
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className='mb-8'>
                        <h2 className='text-xl font-medium mb-4'>3. Thanh toán qua ví điện tử</h2>
                        <div className='flex items-start space-x-4 mb-4'>
                           <div className='w-16 h-16 relative flex-shrink-0'>
                              <Image
                                 src='/images/momo-logo.png'
                                 alt='E-wallet'
                                 fill
                                 className='object-contain'
                              />
                           </div>
                           <div>
                              <p className='text-gray-700 mb-2'>
                                 Chúng tôi chấp nhận thanh toán qua các ví điện tử phổ biến:
                              </p>
                              <ul className='list-disc pl-5 text-gray-700'>
                                 <li>Momo</li>

                              </ul>
                           </div>
                        </div>
                     </div>

                     <div className='border-t pt-6'>
                        <h2 className='text-xl font-medium mb-4'>Lưu ý khi thanh toán</h2>
                        <ul className='list-disc pl-5 text-gray-700'>
                           <li>Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán</li>
                           <li>Giữ lại biên lai, hóa đơn thanh toán để đối chiếu khi cần thiết</li>
                           <li>
                              Liên hệ ngay với chúng tôi nếu có bất kỳ vấn đề nào về thanh toán
                           </li>
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
