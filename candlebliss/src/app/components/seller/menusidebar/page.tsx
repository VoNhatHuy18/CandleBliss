'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
   LogOut,
   Home,
   Package,
   ShoppingBag,
   CreditCard,
   Settings,
   ChevronDown,
   ChevronUp,
   Globe, // Import Globe icon for store/client navigation
} from 'lucide-react';
import { HOST } from '@/app/constants/api';


interface Order {
   id: number;
   status: string;
   createdAt: string;
   order_code: string;
}

export default function MenuSideBar() {
   const [showProductSubmenu, setShowProductSubmenu] = useState(false);
   const [showSettingSubmenu, setShowSettingSubmenu] = useState(false);
   const [newOrdersCount, setNewOrdersCount] = useState(0);
   const [newExchangesCount, setNewExchangesCount] = useState(0);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      // Kiểm tra xem người dùng đã đọc thông báo chưa
      const lastReadOrdersTime = localStorage.getItem('ordersLastRead')
         ? new Date(localStorage.getItem('ordersLastRead') as string)
         : null;

      // Kiểm tra xem người dùng đã đọc thông báo đổi trả chưa
      const lastReadExchangesTime = localStorage.getItem('exchangesLastRead')
         ? new Date(localStorage.getItem('exchangesLastRead') as string)
         : null;

      // Lấy dữ liệu đơn hàng thực tế từ API
      const fetchNewOrders = async () => {
         setIsLoading(true);
         try {
            const response = await fetch(`${HOST}/api/orders/all`);
            const data = await response.json();

            // Danh sách trạng thái cần theo dõi để hiển thị badge
            const notificationStatuses = [
               "Đang chờ thanh toán",
               "Đơn hàng vừa được tạo",
               "Đang xử lý" // Thêm trạng thái "Đang xử lý"
            ];

            const exchangeNotificationStatuses = [
               "Đổi trả hàng",
               "Đang chờ hoàn tiền"
            ];

            // Xử lý đơn hàng thông thường
            let unreadOrders = 0;
            if (lastReadOrdersTime) {
               unreadOrders = data.filter((order: Order) => {
                  const orderDate = new Date(order.createdAt);
                  return (
                     orderDate > lastReadOrdersTime &&
                     notificationStatuses.some(status =>
                        order.status === status || order.status.includes(status)
                     )
                  );
               }).length;
            } else {
               // Nếu chưa có lần đọc nào, tính tất cả đơn hàng có trạng thái cần thông báo là mới
               unreadOrders = data.filter((order: Order) =>
                  notificationStatuses.some(status =>
                     order.status === status || order.status.includes(status)
                  )
               ).length;
            }

            // Xử lý đơn đổi trả
            let unreadExchanges = 0;
            if (lastReadExchangesTime) {
               unreadExchanges = data.filter((order: Order) => {
                  const orderDate = new Date(order.createdAt);
                  return (
                     orderDate > lastReadExchangesTime &&
                     exchangeNotificationStatuses.some(status =>
                        order.status === status || order.status.includes(status)
                     )
                  );
               }).length;
            } else {
               // Nếu chưa có lần đọc nào, tính tất cả đơn đổi trả có trạng thái cần thông báo là mới
               unreadExchanges = data.filter((order: Order) =>
                  exchangeNotificationStatuses.some(status =>
                     order.status === status || order.status.includes(status)
                  )
               ).length;
            }

            // Cập nhật state cho cả đơn hàng và đơn đổi trả
            setNewOrdersCount(unreadOrders);

            setNewExchangesCount(unreadExchanges);

         } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback to default value if API fails
            setNewOrdersCount(0);
            setNewExchangesCount(0);
         } finally {
            setIsLoading(false);
         }
      };

      fetchNewOrders();

      const intervalId = setInterval(fetchNewOrders, 1 * 60 * 1000);

      // Clear interval khi component unmount
      return () => clearInterval(intervalId);
   }, []);

   const toggleProductSubmenu = () => {
      setShowProductSubmenu(!showProductSubmenu);
   };

   const toggleSettingSubmenu = () => {
      setShowSettingSubmenu(!showSettingSubmenu);
   };

   const handleOrdersClick = () => {
      // Đánh dấu đơn hàng đã được đọc
      localStorage.setItem('ordersLastRead', new Date().toISOString());
      setNewOrdersCount(0);
   };

   const handleExchangesClick = () => {
      // Đánh dấu đơn đổi trả đã được đọc
      localStorage.setItem('exchangesLastRead', new Date().toISOString());
      setNewExchangesCount(0);
   };

   const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/seller/signin';
   };

   return (
      <div className='min-h-screen flex'>
         {/* Sidebar */}
         <div className='w-64 bg-[#F1EEE9] shadow-md h-screen flex flex-col'>
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
               {/* Visit Store Button - Added at the top */}
               <div className='px-4 py-2 mb-2'>
                  <Link
                     href='/user/home'
                     className='flex items-center p-2 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors'
                     rel='noopener noreferrer'
                  >
                     <Globe size={18} className='mr-2' />
                     <span>Xem Cửa Hàng</span>
                  </Link>
               </div>

               <div className='px-4 py-2'>
                  <Link
                     href='/seller/dashboard'
                     className='flex items-center p-2 text-[#442C08] rounded border border-[#442C08] hover:bg-gray-100'
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
                           href='/seller/gift'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Set quà</span>
                        </Link>
                        <Link
                           href='/seller/vouchers'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Khuyến Mãi</span>
                        </Link>
                     </div>
                  )}
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/seller/orders'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded relative'
                     onClick={handleOrdersClick}
                  >
                     <Package size={18} className='mr-2' />
                     <span>Quản Lý Đơn Hàng</span>
                     {!isLoading && newOrdersCount > 0 && (
                        <span className='absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse'>
                           {newOrdersCount}
                        </span>
                     )}
                  </Link>
               </div>

               <div className='px-4 py-2'>
                  <Link
                     href='/seller/warehouse'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <Package size={18} className='mr-2' />
                     <span>Quản Lý Kho </span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/seller/exchange'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded relative'
                     onClick={handleExchangesClick}
                  >
                     <CreditCard size={18} className='mr-2' />
                     <span>Quản Lý Đổi trả</span>
                     {!isLoading && newExchangesCount > 0 && (
                        <span className='absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse'>
                           {newExchangesCount}
                        </span>
                     )}
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/seller/finance'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <CreditCard size={18} className='mr-2' />
                     <span>Quản Lý Tài Chính</span>
                  </Link>
               </div>
               <div className='px-4 py-2'>
                  <Link
                     href='/seller/reviews'
                     className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                  >
                     <ShoppingBag size={18} className='mr-2' />
                     <span> Đánh Giá Sản Phẩm</span>
                  </Link>
               </div>


               <div className='px-4 py-2'>
                  <button
                     onClick={toggleSettingSubmenu}
                     className='flex items-center justify-between w-full p-2 text-gray-600 hover:bg-gray-100 rounded '
                  >
                     <div className='flex items-center'>

                        <Settings size={18} className='mr-2' />
                        <span>Cài Đặt</span>
                     </div>
                     {showSettingSubmenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showSettingSubmenu && (
                     <div className='ml-6 mt-2 border-l-2 border-gray-200 pl-2'>
                        <Link
                           href='/seller/categories'
                           className='flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded'
                        >
                           <span className='text-sm'>Quản lý danh mục</span>
                        </Link>

                     </div>
                  )}
               </div>
            </nav>
            <div className='p-4 border-t'>
               <button className='flex items-center p-2 text-gray-600 w-full hover:bg-gray-100 rounded'>
                  <LogOut size={18} className='mr-2' />
                  <span onClick={handleLogout}>Đăng Xuất</span>
               </button>
            </div>
         </div>
      </div>
   );
}
