'use client';

import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus, FaEllipsisV, FaPencilAlt } from 'react-icons/fa';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import MenuProfile from '@/app/components/user/menuprofile/page';

export default function Profile() {
   const [selectedTab, setSelectedTab] = useState('profile');

   return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
         <Head>
            <title>Thông tin cá nhân | Candle Bliss</title>
            <meta name='description' content='Thông tin cá nhân Candle Bliss' />
         </Head>

         {/* Header */}
         <Header />

         {/* Breadcrumb */}
         <div className='bg-gray-100 py-3'>
            <div className='container mx-auto px-4'>
               <nav className='flex items-center text-sm'>
                  <Link href='/' className='hover:text-amber-600'>
                     Trang chủ
                  </Link>
                  <span className='mx-2 text-gray-400'>{'>'}</span>
                  <span className='text-gray-500'>Thông tin cá nhân</span>
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <main className='flex-grow container mx-auto px-4 py-6'>
            <div className='flex flex-col md:flex-row gap-8'>
               {/* Sidebar */}
               <MenuProfile />

               {/* Main Section */}
               <div className='w-full md:w-3/4 space-y-6'>
                  {/* Account Information */}
                  <section className='bg-white p-6 rounded-lg shadow-sm border'>
                     <h2 className='text-xl font-semibold text-gray-800 mb-4'>Thông tin tài khoản</h2>
                     <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                           <span className='font-semibold text-lg text-gray-800 mr-2'>maixuantoan1</span>
                        </div>
                        <div className='flex items-center'>
                           <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-200'>
                              <Image
                                 src='/avatar.jpg'
                                 alt='Avatar'
                                 width={48}
                                 height={48}
                                 className='object-cover w-full h-full'
                              />
                           </div>
                           <button className='ml-4 text-amber-600 flex items-center hover:text-amber-800'>
                              <FaPencilAlt className='mr-1' />
                              <span>Thay đổi</span>
                           </button>
                        </div>
                     </div>
                  </section>

                  {/* Personal Details */}
                  <section className='bg-white p-6 rounded-lg shadow-sm border'>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>Họ tên</label>
                           <input
                              type='text'
                              className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                              value='Mai Xuân Toàn'
                           />
                        </div>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ email</label>
                           <input
                              type='email'
                              className='w-full px-4 py-2 border rounded-md bg-gray-100 focus:ring-amber-500 focus:border-amber-500'
                              value='mai******@gmail.com'
                              disabled
                           />
                        </div>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                           <input
                              type='tel'
                              className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                              value='0333084060'
                           />
                        </div>
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>Ngày sinh</label>
                           <input
                              type='text'
                              className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                              value='28.09.2000'
                           />
                        </div>
                        <div className='md:col-span-2'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>Giới tính</label>
                           <div className='flex items-center space-x-6'>
                              <label className='flex items-center'>
                                 <input
                                    type='radio'
                                    name='gender'
                                    className='h-4 w-4 text-amber-600 focus:ring-amber-500'
                                    checked
                                 />
                                 <span className='ml-2 text-sm text-gray-700'>Nam</span>
                              </label>
                              <label className='flex items-center'>
                                 <input
                                    type='radio'
                                    name='gender'
                                    className='h-4 w-4 text-amber-600 focus:ring-amber-500'
                                 />
                                 <span className='ml-2 text-sm text-gray-700'>Nữ</span>
                              </label>
                              <label className='flex items-center'>
                                 <input
                                    type='radio'
                                    name='gender'
                                    className='h-4 w-4 text-amber-600 focus:ring-amber-500'
                                 />
                                 <span className='ml-2 text-sm text-gray-700'>Khác</span>
                              </label>
                           </div>
                        </div>
                     </div>
                  </section>

                  {/* Shipping Address */}
                  <section className='bg-white p-6 rounded-lg shadow-sm border'>
                     <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>Địa chỉ giao hàng</h3>
                        <button className='text-amber-600 flex items-center text-sm hover:text-amber-800'>
                           <FaPlus className='mr-1' />
                           <span>Thêm địa chỉ mới</span>
                        </button>
                     </div>
                     <div className='overflow-x-auto'>
                        <table className='min-w-full'>
                           <thead className='border-b'>
                              <tr>
                                 <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Họ tên</th>
                                 <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Địa chỉ</th>
                                 <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Tỉnh/Thành</th>
                                 <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'>Số điện thoại</th>
                                 <th className='text-left py-3 px-4 text-sm font-medium text-gray-500'></th>
                              </tr>
                           </thead>
                           <tbody className='divide-y divide-gray-200'>
                              <tr className='hover:bg-gray-50'>
                                 <td className='py-3 px-4'>Mai Xuân Toàn</td>
                                 <td className='py-3 px-4'>1135 Huỳnh Tấn Phát</td>
                                 <td className='py-3 px-4'>TP Hồ Chí Minh - Quận 7 - Phường Phú Thuận</td>
                                 <td className='py-3 px-4'>0333084060</td>
                                 <td className='py-3 px-4 text-right'>
                                    <button className='text-gray-400 hover:text-gray-600'>
                                       <FaEllipsisV />
                                    </button>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </section>
               </div>
            </div>

            {/* Recently Viewed Products */}
            <ViewedCarousel />
         </main>

         {/* Footer */}
         <Footer />
      </div>
   );
}
