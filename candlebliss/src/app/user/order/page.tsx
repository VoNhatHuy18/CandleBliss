'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/page';

// Interfaces
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   quantity: number;
   totalPrice: string;
   product?: {
      name: string;
      images: string[];
   };
   __entity: string;
}

interface Order {
   id: number;
   order_code: string;
   user_id: number;
   status: string;
   address: string;
   total_quantity: number;
   total_price: string;
   discount: string;
   ship_price: string;
   voucher_id: string;
   method_payment: string;
   createdAt: string;
   updatedAt: string;
   item: OrderItem[];
   __entity: string;
}

// Format price helper function
const formatPrice = (price: string | number): string => {
   const numPrice = typeof price === 'string' ? parseFloat(price) : price;
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(numPrice);
};

// Format date helper function
const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
};

// Trạng thái đơn hàng và màu sắc tương ứng
const orderStatusColors: Record<string, { bg: string; text: string; border: string }> = {
   'Đơn hàng vừa được tạo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Đã giao hàng': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã hủy': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function OrderPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [orders, setOrders] = useState<Order[]>([]);
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   // Wrap with useCallback
   const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info') => {
      setToast({
         show: true,
         message,
         type,
      });

      // Tự động ẩn sau 3 giây
      setTimeout(() => {
         setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
   }, []);

   // Wrap with useCallback and add dependencies
   const loadOrders = useCallback(
      async (userId: number) => {
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
               router.push('/user/signin');
               return;
            }

            const response = await fetch(
               `http://68.183.226.198:3000/api/orders?user_id=${userId}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (!response.ok) {
               throw new Error('Không thể tải danh sách đơn hàng');
            }

            const data = await response.json();

            // Sort orders by createdAt date (newest first)
            const sortedOrders = data.sort((a: Order, b: Order) => {
               return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setOrders(sortedOrders);

            if (sortedOrders.length === 0) {
               showToastMessage('Bạn chưa có đơn hàng nào', 'info');
            }
         } catch (error) {
            console.error('Error loading orders:', error);
            showToastMessage('Không thể tải danh sách đơn hàng', 'error');
         }
      },
      [router, showToastMessage],
   );

   // Update useEffect with all dependencies
   useEffect(() => {
      const init = async () => {
         // Lấy thông tin userId từ localStorage
         const storedUserId = localStorage.getItem('userId');
         if (!storedUserId) {
            // Nếu không có userId, chuyển về trang đăng nhập
            router.push('/user/signin');
            return;
         }

         const userId = parseInt(storedUserId);

         try {
            setLoading(true);
            await loadOrders(userId);
         } catch (error) {
            console.error('Error initializing data:', error);
            showToastMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
         } finally {
            setLoading(false);
         }
      };

      init();
   }, [router, loadOrders, showToastMessage]);

   // Update handleCancelOrder with proper error typing
   const handleCancelOrder = async (orderId: number) => {
      if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
         return;
      }

      try {
         setLoading(true);
         const token = localStorage.getItem('token');

         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         // Gọi API để hủy đơn hàng
         const response = await fetch(`http://68.183.226.198:3000/api/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể hủy đơn hàng');
         }

         // Cập nhật trạng thái trong state
         setOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === orderId ? { ...order, status: 'Đã hủy' } : order,
            ),
         );

         showToastMessage('Đơn hàng đã được hủy thành công', 'success');
      } catch (error: unknown) {
         console.error('Error canceling order:', error);

         let errorMessage = 'Không thể hủy đơn hàng';
         if (error instanceof Error) {
            errorMessage = error.message;
         } else if (typeof error === 'object' && error && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
         }

         showToastMessage(errorMessage, 'error');
      } finally {
         setLoading(false);
      }
   };

   // Hàm render trạng thái đơn hàng
   const renderOrderStatus = (status: string) => {
      const colorSet = orderStatusColors[status] || {
         bg: 'bg-gray-50',
         text: 'text-gray-700',
         border: 'border-gray-200',
      };

      return (
         <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${colorSet.bg} ${colorSet.text} border ${colorSet.border}`}
         >
            {status}
         </span>
      );
   };

   // Hàm để lấy biểu tượng phương thức thanh toán
   const getPaymentMethodIcon = (method: string) => {
      switch (method) {
         case 'COD':
            return '/images/payment/cod.png';
         case 'BANKING':
            return '/images/payment/bank.png';
         case 'MOMO':
            return '/images/payment/momo-logo.png';
         default:
            return '/images/payment/cod.png';
      }
   };

   if (loading) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />
            <div className='container mx-auto px-4 py-12 flex justify-center items-center'>
               <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
            </div>
            <Footer />
         </div>
      );
   }

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <Header />

         {/* Toast notification */}
         <div className='fixed top-4 right-4 z-50'>
            <Toast
               show={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
         </div>

         <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-medium mb-6'>Đơn hàng của tôi</h1>

            {orders.length === 0 ? (
               <div className='bg-white rounded-lg shadow p-8 text-center'>
                  <div className='flex flex-col items-center'>
                     <div className='mb-4'>
                        <Image
                           src='/images/empty-order.png'
                           alt='No orders'
                           width={150}
                           height={150}
                        />
                     </div>
                     <h3 className='text-xl font-medium mb-2'>Bạn chưa có đơn hàng nào</h3>
                     <p className='text-gray-500 mb-6'>
                        Hãy trải nghiệm mua sắm và quay lại đây để xem đơn hàng của bạn
                     </p>
                     <Link
                        href='/user/products'
                        className='bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700'
                     >
                        Mua sắm ngay
                     </Link>
                  </div>
               </div>
            ) : (
               <div className='space-y-6'>
                  {orders.map((order) => (
                     <div key={order.id} className='bg-white rounded-lg shadow overflow-hidden'>
                        {/* Order header */}
                        <div className='p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2'>
                           <div>
                              <p className='text-sm text-gray-500'>
                                 Mã đơn hàng:{' '}
                                 <span className='font-medium text-gray-800'>
                                    {order.order_code}
                                 </span>
                              </p>
                              <p className='text-sm text-gray-500'>
                                 Ngày đặt:{' '}
                                 <span className='font-medium text-gray-800'>
                                    {formatDate(order.createdAt)}
                                 </span>
                              </p>
                           </div>
                           <div className='flex items-center'>
                              {order.method_payment && (
                                 <div className='flex items-center mr-4 bg-gray-50 px-3 py-1 rounded-full'>
                                    <Image
                                       src={getPaymentMethodIcon(order.method_payment)}
                                       alt={order.method_payment}
                                       width={16}
                                       height={16}
                                       className='mr-1'
                                    />
                                    <span className='text-xs text-gray-700'>
                                       {order.method_payment === 'COD'
                                          ? 'Thanh toán khi nhận hàng'
                                          : order.method_payment === 'BANKING'
                                          ? 'Chuyển khoản ngân hàng'
                                          : order.method_payment === 'MOMO'
                                          ? 'Ví MoMo'
                                          : 'Không xác định'}
                                    </span>
                                 </div>
                              )}
                              {renderOrderStatus(order.status)}
                           </div>
                        </div>

                        {/* Order items */}
                        <div className='p-4'>
                           {order.item.map((item, index) => (
                              <div
                                 key={item.id}
                                 className={`flex py-3 ${
                                    index < order.item.length - 1 ? 'border-b border-gray-100' : ''
                                 }`}
                              >
                                 <div className='relative w-16 h-16 bg-gray-100 rounded'>
                                    {/* Placeholder nếu không có ảnh sản phẩm */}
                                    <Image
                                       src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                       alt={
                                          item.product?.name ||
                                          `Sản phẩm #${item.product_detail_id}`
                                       }
                                       layout='fill'
                                       objectFit='contain'
                                       className='p-2'
                                    />
                                 </div>
                                 <div className='ml-3 flex-1'>
                                    <div className='flex justify-between'>
                                       <p className='font-medium text-sm'>
                                          {item.product?.name ||
                                             `Sản phẩm #${item.product_detail_id}`}
                                       </p>
                                       <p className='text-orange-600 font-medium text-sm'>
                                          {formatPrice(item.totalPrice)}
                                       </p>
                                    </div>
                                    <div className='flex justify-between mt-1'>
                                       <span className='text-xs text-gray-500'>
                                          Đơn giá: {formatPrice(item.unit_price)}
                                       </span>
                                       <span className='text-xs text-gray-500'>
                                          x{item.quantity}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Order summary */}
                        <div className='bg-gray-50 p-4'>
                           <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>Tổng số sản phẩm:</span>
                              <span>{order.total_quantity}</span>
                           </div>

                           {parseFloat(order.discount) > 0 && (
                              <div className='flex justify-between text-sm mt-1'>
                                 <span className='text-gray-600'>Giảm giá:</span>
                                 <span className='text-green-600'>
                                    -{formatPrice(order.discount)}
                                 </span>
                              </div>
                           )}

                           <div className='flex justify-between text-sm mt-1'>
                              <span className='text-gray-600'>Phí vận chuyển:</span>
                              <span>{formatPrice(order.ship_price)}</span>
                           </div>

                           <div className='flex justify-between mt-2 pt-2 border-t border-gray-200'>
                              <span className='font-medium'>Tổng thanh toán:</span>
                              <span className='font-bold text-orange-600'>
                                 {formatPrice(order.total_price)}
                              </span>
                           </div>

                           <div className='flex justify-between items-center mt-4'>
                              <div className='text-sm text-gray-500'>
                                 <span className='font-medium'>Giao đến:</span> {order.address}
                              </div>

                              <div className='flex space-x-2'>
                                 <Link
                                    href={`/user/order/${order.id}`}
                                    className='text-sm text-orange-600 border border-orange-300 bg-white hover:bg-orange-50 px-3 py-1 rounded'
                                 >
                                    Chi tiết
                                 </Link>

                                 {order.status === 'Đơn hàng vừa được tạo' && (
                                    <button
                                       onClick={() => handleCancelOrder(order.id)}
                                       className='text-sm text-red-600 border border-red-300 bg-white hover:bg-red-50 px-3 py-1 rounded'
                                    >
                                       Hủy đơn
                                    </button>
                                 )}

                                 {order.status === 'Đã giao hàng' && (
                                    <Link
                                       href={`/user/review?order=${order.id}`}
                                       className='text-sm text-green-600 border border-green-300 bg-white hover:bg-green-50 px-3 py-1 rounded'
                                    >
                                       Đánh giá
                                    </Link>
                                 )}

                                 {(order.status === 'Đã hủy' ||
                                    order.status === 'Đã giao hàng') && (
                                    <button
                                       onClick={() => {
                                          // Lưu thông tin sản phẩm vào localStorage để mua lại
                                          // Đây chỉ là giả định, bạn cần thực hiện logic riêng
                                          showToastMessage(
                                             'Đang thêm sản phẩm vào giỏ hàng...',
                                             'info',
                                          );
                                       }}
                                       className='text-sm text-blue-600 border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1 rounded'
                                    >
                                       Mua lại
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <Footer />
      </div>
   );
}
