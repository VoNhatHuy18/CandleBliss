'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/page';

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

// Cập nhật interface Order để thêm chi tiết về thông tin giao hàng
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
   // Thêm các thuộc tính mới cho thông tin người nhận
   recipient_name?: string;
   recipient_phone?: string;
   // Lưu ý: có thể API trả về những thông tin này trong trường address dưới dạng chuỗi
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
   // Unwrap the params Promise using React.use()
   const resolvedParams = use(params);
   const orderId = resolvedParams.id;

   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState<Order | null>(null);
   const [userId, setUserId] = useState<number | null>(null);
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   // Thêm hàm hiện toast message
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

   // First, wrap loadOrderDetail with useCallback
   const loadOrderDetail = useCallback(
      async (orderId: string) => {
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
               router.push('/user/signin');
               return;
            }

            // Sửa URL API theo định dạng mới
            const response = await fetch(
               `http://68.183.226.198:3000/api/orders/${orderId}?id=${orderId}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (!response.ok) {
               if (response.status === 404) {
                  showToastMessage('Đơn hàng không tồn tại hoặc đã bị xóa', 'error');
                  router.push('/user/order');
                  return;
               }
               throw new Error('Không thể tải chi tiết đơn hàng');
            }

            const data = await response.json();
            setOrder(data);

            // Add this check
            if (userId !== data.user_id) {
               showToastMessage('Bạn không có quyền xem đơn hàng này', 'error');
               router.push('/user/order');
               return;
            }
         } catch (error) {
            console.error('Error loading order detail:', error);
            showToastMessage('Không thể tải chi tiết đơn hàng', 'error');
         }
      },
      [router, showToastMessage, userId],
   );

   // Then update your useEffect
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
         setUserId(userId);

         try {
            setLoading(true);
            await loadOrderDetail(orderId);
         } catch (error) {
            console.error('Error initializing data:', error);
            showToastMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
         } finally {
            setLoading(false);
         }
      };

      init();
   }, [orderId, router, loadOrderDetail, showToastMessage]);

   // Hàm xử lý hủy đơn hàng
   const handleCancelOrder = async () => {
      if (!order) return;

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

         // Sửa URL API cho endpoint hủy đơn hàng
         const response = await fetch(
            `http://68.183.226.198:3000/api/orders/${order.id}/cancel?id=${order.id}`,
            {
               method: 'PUT',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            },
         );

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể hủy đơn hàng');
         }

         // Cập nhật trạng thái trong state
         setOrder({ ...order, status: 'Đã hủy' });
         showToastMessage('Đơn hàng đã được hủy thành công', 'success');
      } catch (error: unknown) {
         console.error('Error canceling order:', error);

         // Safely extract error message
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

   if (!order) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />
            <div className='container mx-auto px-4 py-12 text-center'>
               <div className='bg-white rounded-lg shadow p-8'>
                  <h2 className='text-2xl font-medium mb-4'>Đơn hàng không tồn tại</h2>
                  <p className='mb-6 text-gray-600'>
                     Đơn hàng bạn đang tìm không tồn tại hoặc đã bị xóa.
                  </p>
                  <Link
                     href='/user/order'
                     className='bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700'
                  >
                     Quay lại danh sách đơn hàng
                  </Link>
               </div>
            </div>
            <Footer />
         </div>
      );
   }

   // Tính toán các giá trị hiển thị
   const subtotal = order.item.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
   const discount = parseFloat(order.discount) || 0;
   const shipping = parseFloat(order.ship_price) || 0;
   const total = parseFloat(order.total_price) || 0;

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
            <div className='flex items-center mb-6'>
               <button
                  onClick={() => router.back()}
                  className='mr-4 p-2 rounded-full hover:bg-gray-200'
               >
                  <svg
                     xmlns='http://www.w3.org/2000/svg'
                     width='24'
                     height='24'
                     viewBox='0 0 24 24'
                     fill='none'
                     stroke='currentColor'
                     strokeWidth='2'
                     strokeLinecap='round'
                     strokeLinejoin='round'
                  >
                     <path d='M19 12H5M12 19l-7-7 7-7' />
                  </svg>
               </button>
               <h1 className='text-3xl font-medium'>Chi tiết đơn hàng</h1>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
               <div className='lg:col-span-2'>
                  {/* Order Status Card */}
                  <div className='bg-white rounded-lg shadow mb-6'>
                     <div className='p-6 border-b border-gray-100'>
                        <div className='flex justify-between items-center'>
                           <h2 className='text-xl font-medium'>Trạng thái đơn hàng</h2>
                           {renderOrderStatus(order.status)}
                        </div>
                     </div>

                     {/* Order Timeline */}
                     <div className='p-6'>
                        <div className='relative'>
                           {/* Timeline Line */}
                           <div className='absolute left-3 top-0 h-full w-0.5 bg-gray-200'></div>

                           {/* Order Created */}
                           <div className='relative flex items-start mb-8'>
                              <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white z-10'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                 >
                                    <polyline points='20 6 9 17 4 12'></polyline>
                                 </svg>
                              </div>
                              <div className='ml-4'>
                                 <h3 className='font-medium'>Đơn hàng đã được tạo</h3>
                                 <p className='text-sm text-gray-500'>
                                    {formatDate(order.createdAt)}
                                 </p>
                              </div>
                           </div>

                           {/* Order Processing */}
                           <div className='relative flex items-start mb-8'>
                              <div
                                 className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                    order.status !== 'Đơn hàng vừa được tạo' &&
                                    order.status !== 'Đã hủy'
                                       ? 'bg-green-500 text-white'
                                       : 'bg-gray-200 text-gray-400'
                                 } z-10`}
                              >
                                 {order.status !== 'Đơn hàng vừa được tạo' &&
                                 order.status !== 'Đã hủy' ? (
                                    <svg
                                       xmlns='http://www.w3.org/2000/svg'
                                       width='16'
                                       height='16'
                                       viewBox='0 0 24 24'
                                       fill='none'
                                       stroke='currentColor'
                                       strokeWidth='2'
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                    >
                                       <polyline points='20 6 9 17 4 12'></polyline>
                                    </svg>
                                 ) : (
                                    <span className='text-xs'>2</span>
                                 )}
                              </div>
                              <div className='ml-4'>
                                 <h3
                                    className={`font-medium ${
                                       order.status === 'Đơn hàng vừa được tạo' ||
                                       order.status === 'Đã hủy'
                                          ? 'text-gray-400'
                                          : ''
                                    }`}
                                 >
                                    Đang xử lý
                                 </h3>
                                 <p className='text-sm text-gray-500'>
                                    Đơn hàng của bạn đang được chuẩn bị
                                 </p>
                              </div>
                           </div>

                           {/* Shipping */}
                           <div className='relative flex items-start mb-8'>
                              <div
                                 className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                    order.status === 'Đang giao hàng' ||
                                    order.status === 'Đã giao hàng'
                                       ? 'bg-green-500 text-white'
                                       : 'bg-gray-200 text-gray-400'
                                 } z-10`}
                              >
                                 {order.status === 'Đang giao hàng' ||
                                 order.status === 'Đã giao hàng' ? (
                                    <svg
                                       xmlns='http://www.w3.org/2000/svg'
                                       width='16'
                                       height='16'
                                       viewBox='0 0 24 24'
                                       fill='none'
                                       stroke='currentColor'
                                       strokeWidth='2'
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                    >
                                       <polyline points='20 6 9 17 4 12'></polyline>
                                    </svg>
                                 ) : (
                                    <span className='text-xs'>3</span>
                                 )}
                              </div>
                              <div className='ml-4'>
                                 <h3
                                    className={`font-medium ${
                                       order.status !== 'Đang giao hàng' &&
                                       order.status !== 'Đã giao hàng'
                                          ? 'text-gray-400'
                                          : ''
                                    }`}
                                 >
                                    Đang giao hàng
                                 </h3>
                                 <p className='text-sm text-gray-500'>
                                    Đơn hàng đang được vận chuyển
                                 </p>
                              </div>
                           </div>

                           {/* Delivered */}
                           <div className='relative flex items-start'>
                              <div
                                 className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                    order.status === 'Đã giao hàng'
                                       ? 'bg-green-500 text-white'
                                       : 'bg-gray-200 text-gray-400'
                                 } z-10`}
                              >
                                 {order.status === 'Đã giao hàng' ? (
                                    <svg
                                       xmlns='http://www.w3.org/2000/svg'
                                       width='16'
                                       height='16'
                                       viewBox='0 0 24 24'
                                       fill='none'
                                       stroke='currentColor'
                                       strokeWidth='2'
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                    >
                                       <polyline points='20 6 9 17 4 12'></polyline>
                                    </svg>
                                 ) : (
                                    <span className='text-xs'>4</span>
                                 )}
                              </div>
                              <div className='ml-4'>
                                 <h3
                                    className={`font-medium ${
                                       order.status !== 'Đã giao hàng' ? 'text-gray-400' : ''
                                    }`}
                                 >
                                    Đã giao hàng
                                 </h3>
                                 <p className='text-sm text-gray-500'>
                                    Đơn hàng đã được giao thành công
                                 </p>
                              </div>
                           </div>

                           {/* Cancelled (conditional) */}
                           {order.status === 'Đã hủy' && (
                              <div className='relative flex items-start mt-8 pl-10'>
                                 <div className='absolute left-3 top-0 h-full w-0.5 bg-red-200'></div>
                                 <div className='flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white z-10'>
                                    <svg
                                       xmlns='http://www.w3.org/2000/svg'
                                       width='16'
                                       height='16'
                                       viewBox='0 0 24 24'
                                       fill='none'
                                       stroke='currentColor'
                                       strokeWidth='2'
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                    >
                                       <line x1='18' y1='6' x2='6' y2='18'></line>
                                       <line x1='6' y1='6' x2='18' y2='18'></line>
                                    </svg>
                                 </div>
                                 <div className='ml-4'>
                                    <h3 className='font-medium text-red-600'>Đơn hàng đã bị hủy</h3>
                                    <p className='text-sm text-gray-500'>Đơn hàng này đã bị hủy</p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Order Items */}
                  <div className='bg-white rounded-lg shadow mb-6'>
                     <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-xl font-medium'>Sản phẩm đã đặt</h2>
                     </div>

                     <div className='p-4'>
                        {order.item.map((item) => (
                           <div key={item.id} className='flex py-3 border-b border-gray-100'>
                              <div className='relative w-20 h-20 bg-gray-100 rounded'>
                                 <Image
                                    src={item.product?.images?.[0] || '/images/placeholder.jpg'}
                                    alt={
                                       item.product?.name || `Sản phẩm #${item.product_detail_id}`
                                    }
                                    layout='fill'
                                    objectFit='contain'
                                    className='p-2'
                                 />
                              </div>
                              <div className='ml-4 flex-1'>
                                 <div className='flex justify-between'>
                                    <div>
                                       <p className='font-medium'>
                                          {item.product?.name ||
                                             `Sản phẩm #${item.product_detail_id}`}
                                       </p>
                                       <p className='text-sm text-gray-500 mt-1'>
                                          Đơn giá: {formatPrice(item.unit_price)}
                                       </p>
                                    </div>
                                    <div className='text-right'>
                                       <p className='text-orange-600 font-medium'>
                                          {formatPrice(item.totalPrice)}
                                       </p>
                                       <p className='text-sm text-gray-500 mt-1'>
                                          Số lượng: x{item.quantity}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Order Summary and Actions */}
               <div className='lg:col-span-1'>
                  {/* Order Summary */}
                  <div className='bg-white rounded-lg shadow mb-6'>
                     <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-xl font-medium'>Tổng đơn hàng</h2>
                     </div>

                     <div className='p-6 space-y-3'>
                        <div className='flex justify-between text-gray-600'>
                           <span>Mã đơn hàng:</span>
                           <span className='font-medium text-gray-800'>{order.order_code}</span>
                        </div>
                        <div className='flex justify-between text-gray-600'>
                           <span>Ngày đặt:</span>
                           <span>{formatDate(order.createdAt)}</span>
                        </div>

                        {order.method_payment && (
                           <div className='flex justify-between text-gray-600 items-center'>
                              <span>Thanh toán:</span>
                              <div className='flex items-center'>
                                 <Image
                                    src={getPaymentMethodIcon(order.method_payment)}
                                    alt={order.method_payment}
                                    width={16}
                                    height={16}
                                    className='mr-1'
                                 />
                                 <span>
                                    {order.method_payment === 'COD'
                                       ? 'Tiền mặt khi nhận hàng'
                                       : order.method_payment === 'BANKING'
                                       ? 'Chuyển khoản ngân hàng'
                                       : order.method_payment === 'MOMO'
                                       ? 'Ví MoMo'
                                       : 'Không xác định'}
                                 </span>
                              </div>
                           </div>
                        )}

                        <div className='pt-3 border-t border-gray-100 space-y-2'>
                           <div className='flex justify-between'>
                              <span className='text-gray-600'>Tạm tính:</span>
                              <span>{formatPrice(subtotal)}</span>
                           </div>

                           <div className='flex justify-between'>
                              <span className='text-gray-600'>Phí vận chuyển:</span>
                              <span>{formatPrice(shipping)}</span>
                           </div>

                           {discount > 0 && (
                              <div className='flex justify-between'>
                                 <span className='text-gray-600'>Giảm giá:</span>
                                 <span className='text-green-600'>-{formatPrice(discount)}</span>
                              </div>
                           )}

                           <div className='flex justify-between pt-3 border-t border-gray-100'>
                              <span className='font-medium'>Tổng thanh toán:</span>
                              <span className='font-bold text-orange-600'>
                                 {formatPrice(total)}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Shipping Info */}
                  <div className='bg-white rounded-lg shadow mb-6'>
                     <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-xl font-medium'>Thông tin giao hàng</h2>
                     </div>

                     <div className='p-6'>
                        {/* Tên người nhận và số điện thoại */}
                        <div className='mb-4'>
                           <h3 className='font-medium mb-2'>Người nhận:</h3>
                           <div className='flex flex-col space-y-1 text-gray-600'>
                              <p className='flex items-center'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 mr-2'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                    />
                                 </svg>
                                 <span>{order.recipient_name || 'Không có thông tin'}</span>
                              </p>
                              <p className='flex items-center'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 mr-2'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                                    />
                                 </svg>
                                 <span>{order.recipient_phone || 'Không có thông tin'}</span>
                              </p>
                           </div>
                        </div>

                        {/* Địa chỉ giao hàng */}
                        <div>
                           <h3 className='font-medium mb-2'>Địa chỉ giao hàng:</h3>
                           <p className='flex items-start text-gray-600'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-4 w-4 mr-2 mt-1'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                 />
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                 />
                              </svg>
                              <span>{order.address || 'Không có thông tin'}</span>
                           </p>
                        </div>

                        {/* Nếu đơn hàng đang giao, có thể hiển thị thông tin đơn vị vận chuyển */}
                        {order.status === 'Đang giao hàng' && (
                           <div className='mt-4 pt-4 border-t border-gray-100'>
                              <h3 className='font-medium mb-2'>Đơn vị vận chuyển:</h3>
                              <p className='text-gray-600'>Giao hàng nhanh</p>
                              <p className='text-gray-600 text-sm'>
                                 Mã vận đơn: {order.order_code}
                              </p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Order Actions */}
                  <div className='bg-white rounded-lg shadow'>
                     <div className='p-6 space-y-3'>
                        <Link
                           href='/user/order'
                           className='block w-full py-2 text-center border border-gray-300 rounded text-gray-700 hover:bg-gray-50'
                        >
                           Quay lại danh sách đơn hàng
                        </Link>

                        {order.status === 'Đơn hàng vừa được tạo' && (
                           <button
                              onClick={handleCancelOrder}
                              className='block w-full py-2 text-center bg-red-600 rounded text-white hover:bg-red-700'
                           >
                              Hủy đơn hàng
                           </button>
                        )}

                        {order.status === 'Đã giao hàng' && (
                           <Link
                              href={`/user/review?order=${order.id}`}
                              className='block w-full py-2 text-center bg-green-600 rounded text-white hover:bg-green-700'
                           >
                              Đánh giá sản phẩm
                           </Link>
                        )}

                        <button
                           onClick={() => {
                              // Logic để mua lại đơn hàng
                              router.push('/user/cart');
                           }}
                           className='block w-full py-2 text-center bg-orange-600 rounded text-white hover:bg-orange-700'
                        >
                           Mua lại
                        </button>

                        {order.status === 'Đang giao hàng' && (
                           <button
                              onClick={() => {
                                 // Modal theo dõi đơn hàng hoặc chuyển hướng tới trang theo dõi
                                 showToastMessage('Tính năng đang được phát triển', 'info');
                              }}
                              className='block w-full py-2 text-center border border-blue-600 rounded text-blue-600 hover:bg-blue-50'
                           >
                              Theo dõi đơn hàng
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
}
