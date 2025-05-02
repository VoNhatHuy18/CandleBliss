'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react'; // Add Suspense
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Add useSearchParams
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import { retryOrderPayment } from '@/app/utils/orderUtils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import OrderActionModal from '@/app/components/user/orderactionmodals/OrderActionModals';
import { HOST } from '@/app/constants/api';

// Interfaces
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   product_id: string; // Make sure this exists in the interface
   quantity: number;
   totalPrice: string;
   product?: {
      id: number;
      name: string;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
   product_detail?: {
      id: number;
      size: string;
      type: string;
      values: string;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
   __entity: string;
   // Add this field to store fetched product detail data
   productDetailData?: {
      id: number;
      size: string;
      type: string;
      values: string;
      quantities: number;
      isActive: boolean;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
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

// Cập nhật trạng thái đơn hàng và màu sắc tương ứng
const orderStatusColors: Record<string, { bg: string; text: string; border: string }> = {
   'Đơn hàng vừa được tạo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đang chờ thanh toán': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Thanh toán thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Thanh toán thành công': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
   },
   'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đã đặt hàng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã huỷ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },

   // Đổi trả hàng
   'Đổi trả hàng': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đã chấp nhận đổi trả': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đã hoàn thành đổi trả và hoàn tiền': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
   },
   'Đã từ chối đổi trả': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },

   // Trả hàng hoàn tiền
   'Trả hàng hoàn tiền': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
   },
   'Đang chờ hoàn tiền': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
   },
   'Hoàn tiền thành công': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
   },
   'Hoàn tiền thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

function OrderFilter({ onFilterChange }: { onFilterChange: (filterId: string | null) => void }) {
   const searchParams = useSearchParams();
   const filterStatus = searchParams.get('status');

   useEffect(() => {
      onFilterChange(filterStatus);
   }, [searchParams, onFilterChange]);

   return null;
}

const PaymentCountdown = ({
   createdAt,
   orderId,
   onTimeout,
   status,
}: {
   createdAt: string;
   orderId: number;
   onTimeout: (orderId: number, status: string) => void;
   status: string;
}) => {
   const [timeLeft, setTimeLeft] = useState<number>(0);
   const [timedOut, setTimedOut] = useState<boolean>(false);

   useEffect(() => {
      const calculateTimeLeft = () => {
         const createdTime = new Date(createdAt).getTime();
         const now = new Date().getTime();
         const timePassed = now - createdTime;

         // Đang chờ thanh toán: 15 phút
         // Thanh toán thất bại: 1 ngày (24 giờ)
         const timeoutMs = status === 'Đang chờ thanh toán'
            ? 15 * 60 * 1000  // 15 minutes 
            : 24 * 60 * 1000; // 24 hours

         const remaining = timeoutMs - timePassed;
         return Math.max(0, Math.floor(remaining / 1000)); // Return seconds left
      };

      // Calculate initial time left
      const initialTimeLeft = calculateTimeLeft();
      setTimeLeft(initialTimeLeft);

      // If time already expired, call onTimeout immediately
      if (initialTimeLeft <= 0 && !timedOut) {
         setTimedOut(true);
         onTimeout(orderId, status);
         return;
      }

      // Set up interval to update countdown every second
      const timer = setInterval(() => {
         const remaining = calculateTimeLeft();
         setTimeLeft(remaining);

         // When time runs out, call callback to update order status
         if (remaining <= 0 && !timedOut) {
            clearInterval(timer);
            setTimedOut(true);
            onTimeout(orderId, status);
         }
      }, 1000);

      return () => clearInterval(timer);
   }, [createdAt, orderId, onTimeout, timedOut, status]);

   // Time expired
   if (timeLeft <= 0) {
      return <span className='text-red-600 text-sm font-medium'>Hết thời gian thanh toán</span>;
   }

   // Format the time differently based on status
   if (status === 'Đang chờ thanh toán') {
      // For waiting payment, show minutes and seconds
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return (
         <span className={`text-sm font-medium ${timeLeft < 180 ? 'text-red-600' : 'text-orange-600'}`}>
            Thanh toán còn: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
         </span>
      );
   } else {
      // For failed payment, show hours and minutes
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      return (
         <span className={`text-sm font-medium ${timeLeft < 3600 ? 'text-red-600' : 'text-orange-600'}`}>
            Thanh toán còn: {hours}h:{minutes < 10 ? `0${minutes}` : minutes}m
         </span>
      );
   }
};

export default function OrderPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [orders, setOrders] = useState<Order[]>([]);
   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
   const [statusFilter, setStatusFilter] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [ordersPerPage] = useState(5);
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   // Add a state to track which product details have been fetched
   const [fetchedDetails, setFetchedDetails] = useState<Record<number, boolean>>({});

   // Add a new state to track which products have been fetched
   const [fetchedProducts, setFetchedProducts] = useState<Record<string, boolean>>({});

   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

   // Add this state to track which order is currently processing payment
   const [processingPaymentOrderId, setProcessingPaymentOrderId] = useState<number | null>(null);

   // Add these new states inside your OrderPage component right after the existing state declarations
   const [actionModalOpen, setActionModalOpen] = useState(false);
   const [actionType, setActionType] = useState<'cancel' | 'exchange' | 'refund'>('cancel');
   const [actionLoading, setActionLoading] = useState(false);

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

            const response = await fetch(`${HOST}/api/orders?user_id=${userId}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

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

   const fetchProductDetails = useCallback(
      async (orders: Order[]) => {
         const token = localStorage.getItem('token');
         if (!token) return;

         let hasUpdates = false;
         const updatedOrders = [...orders];

         for (const order of updatedOrders) {
            for (const item of order.item) {
               // First fetch the product data if needed
               if (item.product_id && !fetchedProducts[item.product_id]) {
                  try {
                     console.log(`Fetching product with ID: ${item.product_id}`);
                     const productResponse = await fetch(
                        `${HOST}/api/products/${item.product_id}`,
                        {
                           headers: {
                              Authorization: `Bearer ${token}`,
                           },
                        },
                     );

                     if (productResponse.ok) {
                        const productData = await productResponse.json();
                        console.log(`Product data fetched:`, productData);

                        // Find the matching product detail
                        const matchingDetail = productData.details?.find(
                           (detail: {
                              id: number;
                              size: string;
                              type: string;
                              values: string;
                              quantities: number;
                              isActive: boolean;
                              images: Array<{ id: string; path: string; public_id: string }>;
                           }) => detail.id === item.product_detail_id,
                        );

                        // Set the product information
                        item.product = {
                           id: productData.id,
                           name: productData.name || 'Sản phẩm không tên',
                           images: productData.images || [],
                        };

                        // If we found matching detail, store it
                        if (matchingDetail) {
                           item.productDetailData = {
                              id: matchingDetail.id,
                              size: matchingDetail.size,
                              type: matchingDetail.type,
                              values: matchingDetail.values,
                              quantities: matchingDetail.quantities,
                              isActive: matchingDetail.isActive,
                              images: matchingDetail.images || [],
                           };

                           // Mark detail as fetched
                           setFetchedDetails((prev) => ({
                              ...prev,
                              [item.product_detail_id]: true,
                           }));
                        }

                        // Mark product as fetched
                        setFetchedProducts((prev) => ({
                           ...prev,
                           [item.product_id]: true,
                        }));

                        hasUpdates = true;
                     } else {
                        console.error(
                           `Error fetching product ${item.product_id}, status: ${productResponse.status}`,
                        );
                     }
                  } catch (productError) {
                     console.error(
                        `Failed to fetch product for product_id ${item.product_id}:`,
                        productError,
                     );
                  }
               }
            }
         }

         if (hasUpdates) {
            setOrders(updatedOrders);
            setFilteredOrders(
               statusFilter
                  ? updatedOrders.filter((order) => order.status === statusFilter)
                  : updatedOrders,
            );
         }
      },
      [fetchedDetails, fetchedProducts, statusFilter],
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

   // Call fetchProductDetails when orders change
   useEffect(() => {
      if (orders.length > 0) {
         fetchProductDetails(orders);
      }
   }, [orders, fetchProductDetails]);

   // Modified handleCancelOrder function to only allow cancellation in specific statuses

   // Within the OrderPage component, add this new function to handle completing the order
   const handleCompleteOrder = async (orderId: number) => {
      // Show warning confirmation dialog
      if (
         !confirm(
            'Khi bạn chọn Hoàn thành thì sẽ không thể đổi trả lại hàng, hãy quay clip và kiểm tra hàng trước khi chọn hoàn thành đơn. Bạn có chắc chắn muốn hoàn thành đơn hàng này?',
         )
      ) {
         return; // If user cancels, exit the function
      }

      try {
         setLoading(true);
         const token = localStorage.getItem('token');

         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         // Use query parameter format instead of request body
         const encodedStatus = encodeURIComponent('Hoàn thành');
         const response = await fetch(
            `${HOST}/api/orders/${orderId}/status?status=${encodedStatus}`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            },
         );

         if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
         }

         // Update the state after successful API call
         setOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === orderId ? { ...order, status: 'Hoàn thành' } : order,
            ),
         );

         showToastMessage('Đơn hàng đã được hoàn thành', 'success');
      } catch (error: unknown) {
         console.error('Error completing order:', error);

         let errorMessage = 'Không thể cập nhật trạng thái đơn hàng';
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

   const handleFilterChange = useCallback((filterStatus: string | null) => {
      setStatusFilter(filterStatus);
   }, []);

   // Filter orders when statusFilter or orders change
   useEffect(() => {
      if (!statusFilter) {
         setFilteredOrders(orders);
      } else {
         setFilteredOrders(orders.filter((order) => order.status === statusFilter));
      }
   }, [statusFilter, orders]);

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
            return '/images/logo.png';
         case 'BANKING':
            return '/images/payment/bank.png';
         case 'MOMO':
            return '/images/momo-logo.png';
         default:
            return '/images/payment/cod.png';
      }
   };

   // Thêm hàm này trong component OrderPage

   // Hàm cập nhật trạng thái đơn hàng khi hết thời gian thanh toán
   const handlePaymentTimeout = useCallback(async (orderId: number, currentStatus: string) => {
      try {
         const token = localStorage.getItem('token');
         if (!token) return;

         // Determine the next status based on current status
         let nextStatus;
         if (currentStatus === 'Đang chờ thanh toán') {
            nextStatus = 'Thanh toán thất bại';
         } else if (currentStatus === 'Thanh toán thất bại') {
            nextStatus = 'Đã hủy';
         } else {
            return; // Exit if not a relevant status
         }

         const encodedStatus = encodeURIComponent(nextStatus);
         const response = await fetch(
            `${HOST}/api/orders/${orderId}/status?status=${encodedStatus}`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            }
         );

         if (response.ok) {
            // Update local state
            setOrders((prevOrders) =>
               prevOrders.map((order) =>
                  order.id === orderId ? { ...order, status: nextStatus } : order
               )
            );

            if (nextStatus === 'Thanh toán thất bại') {
               showToastMessage(
                  `Đơn hàng #${orderId} đã hết thời gian thanh toán và chuyển sang trạng thái Thanh toán thất bại. Bạn còn 24h để thanh toán lại.`,
                  'error'
               );
            } else {
               showToastMessage(
                  `Đơn hàng #${orderId} đã quá hạn thanh toán và tự động hủy`,
                  'error'
               );
            }
         } else {
            console.error('Failed to update order status:', await response.text());
         }
      } catch (error) {
         console.error('Error handling payment timeout:', error);
      }
   }, [showToastMessage]);

   // Thêm hàm kiểm tra các đơn hàng chưa thanh toán khi component mount
   const checkPendingPayments = useCallback(() => {
      // Filter orders with "Đang chờ thanh toán" and "Thanh toán thất bại" statuses
      const pendingOrders = orders.filter(
         (order) => order.status === 'Đang chờ thanh toán' && order.method_payment !== 'COD'
      );

      const failedOrders = orders.filter(
         (order) => order.status === 'Thanh toán thất bại' && order.method_payment !== 'COD'
      );

      if (pendingOrders.length > 0) {
         // Show warning toast for pending orders
         showToastMessage(
            'Lưu ý: Đơn hàng chưa thanh toán sẽ tự động chuyển sang Thanh toán thất bại sau 15 phút',
            'info'
         );
      }

      if (failedOrders.length > 0) {
         // Show warning toast for failed orders
         showToastMessage(
            'Lưu ý: Đơn hàng thanh toán thất bại sẽ tự động hủy sau 1 ngày nếu không thanh toán lại',
            'info'
         );
      }

      // Check orders that have passed the deadline
      const now = new Date().getTime();

      // Check pending orders (15 minutes timeout)
      pendingOrders.forEach((order) => {
         const createdTime = new Date(order.createdAt).getTime();
         const timePassed = now - createdTime;
         const timeoutMs = 15 * 60 * 1000; // 15 minutes

         if (timePassed >= timeoutMs) {
            console.log(`Order ${order.id} payment time (15min) has expired, updating status...`);
            handlePaymentTimeout(order.id, 'Đang chờ thanh toán');
         }
      });

      // Check failed payment orders (24 hours timeout)
      failedOrders.forEach((order) => {
         const createdTime = new Date(order.createdAt).getTime();
         const timePassed = now - createdTime;
         const timeoutMs = 24 * 60 * 60 * 1000; // 24 hours

         if (timePassed >= timeoutMs) {
            console.log(`Order ${order.id} extended payment time (24h) has expired, updating status...`);
            handlePaymentTimeout(order.id, 'Thanh toán thất bại');
         }
      });
   }, [orders, handlePaymentTimeout, showToastMessage]);

   // Thêm useEffect này sau các useEffect hiện có

   // Kiểm tra đơn hàng chưa thanh toán khi component mount
   useEffect(() => {
      if (orders.length > 0) {
         checkPendingPayments();
      }
   }, [orders, checkPendingPayments]);

   // Thêm hàm này để xử lý trạng thái đơn hàng COD
   // Hàm này sẽ tự động cập nhật trạng thái đơn hàng COD thành "Đang xử lý"
   const handleCODOrderStatus = useCallback(async () => {
      // Find orders that are COD and have status "Đơn hàng vừa được tạo"
      const codOrdersToUpdate = orders.filter(
         (order) => order.status === 'Đơn hàng vừa được tạo' && order.method_payment === 'COD',
      );

      if (codOrdersToUpdate.length === 0) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      // Update each order's status to "Đang xử lý" using query parameter
      for (const order of codOrdersToUpdate) {
         try {
            // Use query parameter for status with proper URL encoding
            const encodedStatus = encodeURIComponent('Đang xử lý');
            const response = await fetch(
               `${HOST}/api/orders/${order.id}/status?status=${encodedStatus}`,
               {
                  method: 'PATCH',
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
               },
            );

            if (response.ok) {
               // Update the state locally
               setOrders((prevOrders) =>
                  prevOrders.map((o) => (o.id === order.id ? { ...o, status: 'Đang xử lý' } : o)),
               );
               console.log(`Successfully updated COD order ${order.id} status to "Đang xử lý"`);
            } else {
               console.error(`Failed to update order ${order.id} status:`, await response.text());
            }
         } catch (error) {
            console.error(`Error updating order ${order.id} status:`, error);
         }
      }
   }, [orders]);

   // Add a new useEffect to run the COD status update
   useEffect(() => {
      if (orders.length > 0) {
         handleCODOrderStatus();
      }
   }, [orders, handleCODOrderStatus]);

   // Add this function inside your OrderPage component
   const handleRetryPayment = async (orderId: number) => {
      try {
         setProcessingPaymentOrderId(orderId); // Set the processing order ID

         // Get the order to check its payment method
         const orderToRetry = orders.find((order) => order.id === orderId);
         if (!orderToRetry) {
            showToastMessage('Không tìm thấy đơn hàng', 'error');
            return;
         }

         // First update the order status to "Đang chờ thanh toán"
         const token = localStorage.getItem('token');
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         // Update order status to "Đang chờ thanh toán"
         const encodedStatus = encodeURIComponent('Đang chờ thanh toán');
         const statusResponse = await fetch(
            `${HOST}/api/orders/${orderId}/status?status=${encodedStatus}`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
            }
         );

         if (!statusResponse.ok) {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
         }

         // Update local state
         setOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === orderId ? { ...order, status: 'Đang chờ thanh toán', createdAt: new Date().toISOString() } : order
            )
         );

         // Save the pending order ID in localStorage for verification after payment
         localStorage.setItem('pendingOrderId', orderId.toString());

         // Check if it's MOMO payment or other method
         if (orderToRetry.method_payment === 'MOMO') {
            try {
               const paymentLink = await retryOrderPayment(orderId);

               // Show toast message
               showToastMessage('Đang chuyển đến trang thanh toán MOMO...', 'info');

               // Redirect to MOMO payment page
               window.location.href = paymentLink;
            } catch (error) {
               console.error('Error creating MOMO payment:', error);
               showToastMessage('Không thể tạo liên kết thanh toán MOMO', 'error');
            }
         } else if (orderToRetry.method_payment === 'BANKING') {
            // For BANKING, show banking information
            showToastMessage('Vui lòng chuyển khoản theo thông tin đã cung cấp', 'info');

            // Redirect to order detail page
            router.push(`/user/order/${orderId}`);
         } else {
            // For other payment methods, redirect to payment page
            router.push(`/user/checkout/payment?order_id=${orderId}`);
         }
      } catch (error) {
         console.error('Error processing retry payment:', error);
         showToastMessage('Có lỗi xảy ra khi xử lý thanh toán lại', 'error');
      } finally {
         setProcessingPaymentOrderId(null); // Clear the processing state
      }
   };

   // Add this useEffect near the top of your OrderPage component, after other useEffect hooks
   useEffect(() => {
      const checkMomoPayment = async () => {
         // Check if there's a pending order ID in localStorage
         const pendingOrderId = localStorage.getItem('pendingOrderId');

         // Check if there are URL parameters indicating payment return
         const urlParams = new URLSearchParams(window.location.search);
         const paymentStatus = urlParams.get('status');

         if (pendingOrderId && paymentStatus) {
            try {
               // Clear the pending order ID
               localStorage.removeItem('pendingOrderId');

               if (paymentStatus === 'success') {
                  showToastMessage('Thanh toán thành công!', 'success');

                  // Refresh the orders list to show updated status
                  const storedUserId = localStorage.getItem('userId');
                  if (storedUserId) {
                     const userId = parseInt(storedUserId);
                     await loadOrders(parseInt(userId.toString()));
                  }
               } else {
                  showToastMessage(
                     'Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác',
                     'error',
                  );
               }
            } catch (error) {
               console.error('Error verifying MOMO payment:', error);
            }
         }
      };

      checkMomoPayment();
   }, []);

   // Function to handle cancel order
   const handleCancelOrder = (orderId: number) => {
      setSelectedOrderId(orderId);
      setActionType('cancel');
      setActionModalOpen(true);
   };

   // Function to handle return/exchange order
   const handleReturnOrder = (orderId: number) => {
      setSelectedOrderId(orderId);
      setActionType('exchange');
      setActionModalOpen(true);
   };

   // Function to handle return with refund
   const handleReturnWithRefund = (orderId: number) => {
      setSelectedOrderId(orderId);
      setActionType('refund');
      setActionModalOpen(true);
   };

   // Cập nhật hàm handleActionSubmit để kiểm tra trạng thái hợp lệ
   const handleActionSubmit = async (reason: string, files: File[]) => {
      if (!selectedOrderId) return;

      try {
         setActionLoading(true);

         // Tìm đơn hàng hiện tại
         const currentOrder = orders.find((order) => order.id === selectedOrderId);
         if (!currentOrder) {
            showToastMessage('Không tìm thấy thông tin đơn hàng', 'error');
            setActionLoading(false);
            return;
         }

         // Xác định status dựa trên actionType
         let status = '';
         if (actionType === 'cancel') {
            status = 'Đã huỷ';
         } else if (actionType === 'exchange') {
            status = 'Đổi trả hàng';
         } else if (actionType === 'refund') {
            status = 'Đang chờ hoàn tiền'; // Sửa thành "Trả hàng hoàn tiền" thay vì "Đang chờ hoàn tiền"
         }

         const token = localStorage.getItem('token');
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn', 'error');
            router.push('/user/signin');
            return;
         }

         // Create FormData object to send both text data and files
         const formData = new FormData();
         formData.append('reason', reason);
         formData.append('status', status);

         // Add files directly to the FormData with tên trường chính xác là 'images'
         if (files && files.length > 0) {
            files.forEach((file) => {
               formData.append('images', file);
            });
         }

         // Debug log FormData content
         console.log('FormData content:');
         for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
         }

         // Send the request with FormData
         const response = await fetch(`${HOST}/api/orders/cancel-or-return/${selectedOrderId}`, {
            method: 'PATCH',
            headers: {
               Authorization: `Bearer ${token}`,
            },
            body: formData,
         });

         if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(
               errorData.message || `API request failed with status ${response.status}`,
            );
         }

         // Update local state
         setOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === selectedOrderId ? { ...order, status } : order,
            ),
         );

         setActionModalOpen(false);
         showToastMessage(
            actionType === 'cancel'
               ? 'Đơn hàng đã được hủy thành công'
               : actionType === 'exchange'
                  ? 'Yêu cầu đổi/trả hàng đã được gửi'
                  : 'Yêu cầu trả hàng hoàn tiền đã được gửi',
            'success',
         );
      } catch (error) {
         console.error('Error processing action:', error);

         // Show specific error message from API if available
         let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu';
         if (error instanceof Error) {
            errorMessage = error.message;
         }

         showToastMessage(errorMessage, 'error');
      } finally {
         setActionLoading(false);
      }
   };

   // Calculate pagination indices
   const indexOfLastOrder = currentPage * ordersPerPage;
   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
   const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

   // Function to change page
   const paginate = (pageNumber: number) => {
      if (pageNumber > 0 && pageNumber <= totalPages) {
         setCurrentPage(pageNumber);
         // Scroll to top of orders section when changing page
         window.scrollTo({ top: 0, behavior: 'smooth' });
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

         {/* Add Breadcrumb navigation with status filter */}
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
                  <li>
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
                        <Link
                           href='/user/profile'
                           className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                        >
                           Tài khoản
                        </Link>
                     </div>
                  </li>
                  <li>
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
                        <Link
                           href='/user/order'
                           className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                        >
                           Đơn hàng của tôi
                        </Link>
                     </div>
                  </li>
                  {statusFilter && (
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
                              {statusFilter}
                           </span>
                        </div>
                     </li>
                  )}
               </ol>
            </nav>
         </div>

         {/* Wrap the search params usage in Suspense */}
         <Suspense fallback={<div>Loading filters...</div>}>
            <OrderFilter onFilterChange={handleFilterChange} />
         </Suspense>

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

            {/* Add filter tabs */}
            <div className='flex overflow-x-auto mb-6 gap-2'>
               <Link
                  href='/user/order'
                  className={`px-4 py-2 whitespace-nowrap rounded-md ${!statusFilter
                     ? 'bg-orange-100 text-orange-700 font-medium'
                     : 'bg-white hover:bg-gray-100'
                     }`}
               >
                  Tất cả
               </Link>
               {['Đang xử lý', 'Đang giao hàng', 'Hoàn thành'].map((status) => (
                  <Link
                     key={status}
                     href={`/user/order?status=${encodeURIComponent(status)}`}
                     className={`px-4 py-2 whitespace-nowrap rounded-md ${statusFilter === status
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'bg-white hover:bg-gray-100'
                        }`}
                  >
                     {status}
                  </Link>
               ))}
            </div>

            {filteredOrders.length === 0 ? (
               <div className='bg-white rounded-lg shadow p-8 text-center'>
                  <div className='flex flex-col items-center'>
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
                  {currentOrders.map((order) => (
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

                              {/* Add countdown timer for both newly created and waiting for payment status */}
                              {(order.status === 'Đơn hàng vừa được tạo' ||
                                 order.status === 'Đang chờ thanh toán') &&
                                 order.method_payment !== 'COD' && (
                                    <PaymentCountdown
                                       createdAt={order.createdAt}
                                       orderId={order.id}
                                       onTimeout={handlePaymentTimeout}
                                       status={order.status}
                                    />
                                 )}
                              {/* Countdown timer for "Đang chờ thanh toán" status */}
                              {order.status === 'Đang chờ thanh toán' &&
                                 order.method_payment !== 'COD' && (
                                    <PaymentCountdown
                                       createdAt={order.createdAt}
                                       orderId={order.id}
                                       onTimeout={handlePaymentTimeout}
                                       status={order.status}
                                    />
                                 )
                              }

                              {/* Countdown timer for "Thanh toán thất bại" status */}
                              {order.status === 'Thanh toán thất bại' &&
                                 order.method_payment !== 'COD' && (
                                    <PaymentCountdown
                                       createdAt={order.createdAt}
                                       orderId={order.id}
                                       onTimeout={handlePaymentTimeout}
                                       status={order.status}
                                    />
                                 )
                              }
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
                                 className={`flex py-3 ${index < order.item.length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                              >
                                 <div className='relative w-16 h-16 bg-gray-100 rounded'>
                                    {/* Use product images instead of product detail images */}
                                    <Image
                                       src={
                                          item.product?.images?.[0]?.path ||
                                          '/images/default-product.png'
                                       }
                                       alt={
                                          item.product?.name ||
                                          `Sản phẩm #${item.product_detail_id}`
                                       }
                                       fill
                                       sizes='64px'
                                       style={{ objectFit: 'contain' }}
                                       className='p-2'
                                    />
                                 </div>
                                 <div className='ml-3 flex-1'>
                                    <div className='flex justify-between'>
                                       <div>
                                          <p className='font-medium text-sm'>
                                             {item.product?.name ||
                                                `Sản phẩm #${item.product_detail_id}`}
                                          </p>
                                          {(item.productDetailData || item.product_detail) && (
                                             <p className='text-xs text-gray-500'>
                                                {item.productDetailData?.size ||
                                                   item.product_detail?.size}{' '}
                                                -{' '}
                                                {item.productDetailData?.values ||
                                                   item.product_detail?.values}
                                             </p>
                                          )}
                                       </div>
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

                           {/* Order actions */}
                           <div className='flex justify-between items-center mt-4'>
                              <span className='text-sm text-gray-600'>
                                 Địa chỉ giao hàng: {order.address}
                              </span>
                              <div className='flex space-x-2'>
                                 <Link
                                    href={`/user/order/${order.id}`}
                                    className='text-sm text-orange-600 border border-orange-300 bg-white hover:bg-orange-50 px-3 py-1 rounded'
                                 >
                                    Chi tiết
                                 </Link>

                                 {/* Retry Payment button - hiển thị cho cả trạng thái Đang chờ thanh toán và Thanh toán thất bại */}
                                 {(order.status === 'Đang chờ thanh toán' || order.status === 'Thanh toán thất bại') &&
                                    (() => {
                                       const createdTime = new Date(order.createdAt).getTime();
                                       const now = new Date().getTime();
                                       const timePassed = now - createdTime;
                                       const timeoutMs = 24 * 60 * 60 * 1000; // 1 ngày (24 giờ)

                                       if (timePassed < timeoutMs) {
                                          return (
                                             <button
                                                onClick={() => handleRetryPayment(order.id)}
                                                disabled={processingPaymentOrderId === order.id}
                                                className='text-sm text-blue-600 border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1 rounded flex items-center'
                                             >
                                                {processingPaymentOrderId === order.id ? (
                                                   <>
                                                      <svg
                                                         className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600'
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
                                                      Đang xử lý...
                                                   </>
                                                ) : (
                                                   'Thanh toán lại'
                                                )}
                                             </button>
                                          );
                                       }
                                       return null;
                                    })()}

                                 {/* Nút hủy đơn - chỉ hiển thị ở các trạng thái phù hợp */}
                                 {(order.status === 'Đơn hàng vừa được tạo' ||
                                    order.status === 'Đang xử lý' ||
                                    order.status === 'Đang chờ thanh toán') && (
                                       <button
                                          onClick={() => handleCancelOrder(order.id)}
                                          className='text-sm text-red-600 border border-red-300 bg-white hover:bg-red-50 px-3 py-1 rounded'
                                       >
                                          Hủy đơn
                                       </button>
                                    )}

                                 {/* Show Complete button for any order in "Đang giao hàng" status */}
                                 {order.status === 'Đang giao hàng' && (
                                    <button
                                       onClick={() => handleCompleteOrder(order.id)}
                                       className='text-sm text-green-600 border border-green-300 bg-white hover:bg-green-50 px-3 py-1 rounded'
                                    >
                                       Hoàn thành
                                    </button>
                                 )}

                                 {/* Nút Đổi/Trả và Trả hàng hoàn tiền - chỉ hiển thị ở trạng thái Đang giao hàng */}
                                 {order.status === 'Đang giao hàng' && (
                                    <>
                                       <button
                                          onClick={() => handleReturnOrder(order.id)}
                                          className='text-sm text-purple-600 border border-purple-300 bg-white hover:bg-purple-50 px-3 py-1 rounded'
                                       >
                                          Đổi/Trả
                                       </button>
                                       <button
                                          onClick={() => handleReturnWithRefund(order.id)}
                                          className='text-sm text-yellow-600 border border-yellow-300 bg-white hover:bg-yellow-50 px-3 py-1 rounded'
                                       >
                                          Trả hàng hoàn tiền
                                       </button>
                                    </>
                                 )}

                                 {/* Show Review button */}
                                 {(order.status === 'Hoàn thành' ||
                                    order.status === 'Đổi trả thành công') && (
                                       <Link
                                          href={`/user/order/rating`}
                                          className='text-sm text-green-600 border border-green-300 bg-white hover:bg-green-50 px-3 py-1 rounded'
                                       >
                                          Đánh giá
                                       </Link>
                                    )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
            {/* Pagination Controls */}
            {filteredOrders.length > 0 && (
               <div className='flex items-center justify-center mt-6 space-x-2'>
                  <button
                     onClick={() => paginate(currentPage - 1)}
                     disabled={currentPage === 1}
                     className={`flex items-center px-3 py-1 rounded ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                  >
                     <ChevronLeftIcon className='w-4 h-4 mr-1' />
                     Trước
                  </button>

                  {/* Page Numbers */}
                  <div className='flex items-center space-x-1'>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                           key={pageNumber}
                           onClick={() => paginate(pageNumber)}
                           className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === pageNumber
                              ? 'bg-orange-600 text-white'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                              }`}
                        >
                           {pageNumber}
                        </button>
                     ))}
                  </div>

                  <button
                     onClick={() => paginate(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className={`flex items-center px-3 py-1 rounded ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                  >
                     Tiếp
                     <ChevronRightIcon className='w-4 h-4 ml-1' />
                  </button>
               </div>
            )}
         </div>

         <Footer />

         {/* Order Action Modal */}
         <OrderActionModal
            isOpen={actionModalOpen}
            onClose={() => setActionModalOpen(false)}
            title={
               actionType === 'cancel'
                  ? 'Hủy đơn hàng'
                  : actionType === 'exchange'
                     ? 'Yêu cầu đổi/trả hàng'
                     : 'Yêu cầu trả hàng hoàn tiền'
            }
            actionType={actionType}
            onSubmit={handleActionSubmit}
            isLoading={actionLoading}
         />
      </div>
   );
}
