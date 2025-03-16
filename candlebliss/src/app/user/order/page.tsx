'use client';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { useOrder } from '@/stores/user/order';
import Link from 'next/link';
import { Key, useEffect, useState } from 'react';
import { ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Tabs from '@/app/components/user/pages/order/tabs';
import Image from 'next/image';
import { ORDER_PROCESS_FILTER } from '@/contants/order.constant';
import OrderItem from '@/app/components/user/pages/order/order-item';
import Loading from '@/app/components/user/loading';

export default function OrdersManagement() {
   const [orderStore, orderActions] = useOrder();
   const [status, setStatus] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      setLoading(true);
      orderActions.getOrders(status).then(() => {
         setLoading(false);
      });
   }, []);

   const onChangeTab = (tab: string) => {
      setStatus(tab);
   };

   return (
      <>
         {loading && <Loading />}
         <div className='bg-gray-50 min-h-screen flex flex-col'>
            <Header />
            <div className='flex-grow'>
               <div className='container mx-auto px-4 py-4 text-sm'>
                  <div className='flex items-center space-x-2'>
                     <Link
                        href='/user/home'
                        className='text-gray-500 hover:text-amber-600 transition-colors'
                     >
                        Trang chủ
                     </Link>
                     <span className='text-gray-400'>/</span>
                     <span className='text-gray-700 font-medium'>Đơn hàng</span>
                  </div>
               </div>

               <div className='container mx-auto px-4 py-6 max-w-7xl'>
                  <div className='flex items-center justify-between mb-8'>
                     <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>
                        Đơn hàng Của Tôi
                     </h1>
                     {orderStore.orders.length > 0 && (
                        <span className='text-sm text-gray-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100'>
                           {orderStore.orders.length} đơn hàng
                        </span>
                     )}
                  </div>

                  {orderStore.orders.length > 0 ? (
                     <div className='flex flex-col lg:flex-row gap-8'>
                        <div className='w-full'>
                           <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                              <Tabs orderStatus={status} handleFilterByStatus={onChangeTab} />
                              <div className={'p-[12px]'}>
                                 {orderStore.orders.map((item: any, index: Key | null | undefined) => (
                                    <div key={index}>
                                       <OrderItem data={item} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className='mt-6'>
                              <Link
                                 href='/user/product'
                                 className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors'
                              >
                                 <ArrowLeftIcon className='h-4 w-4' />
                                 <span>Tiếp tục mua sắm</span>
                              </Link>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className={`bg-white rounded-lg shadow-sm p-8 text-center`}>
                        {!loading && (
                           <>
                              <div className='flex justify-center mb-4'>
                                 <div className='h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center'>
                                    <ShoppingBagIcon className='h-12 w-12 text-amber-600' />
                                 </div>
                              </div>
                              <h2 className='text-2xl font-medium text-gray-800 mb-3'>
                                 Không có đơn hàng nào
                              </h2>
                              <p className='text-gray-500 mb-6'>
                                 Thêm sản phẩm vào giỏ hàng để tiến hành mua sắm
                              </p>
                              <Link href='/user/product'>
                                 <button className='bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors'>
                                    Tiếp Tục Mua Sắm
                                 </button>
                              </Link>
                           </>
                        )}
                     </div>
                  )}
               </div>
            </div>
            <Footer />
         </div>
      </>
   );
}
