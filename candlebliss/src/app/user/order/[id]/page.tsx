'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import { HOST } from '@/app/constants/api';

interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   product_id?: string; // Add this field
   quantity: number;
   totalPrice: string;
   product?: {
      id?: number; // Add this field
      name: string;
      images: string[];
   };
   product_detail?: {
      id: number;
      size: string;
      type: string;
      values: string;
      images: string[];
   };
   productDetailData?: { // Add this field for detailed product info
      id: number;
      size: string;
      type: string;
      values: string;
      quantities: number;
      isActive: boolean;
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
   statusUpdates?: {
      status: string;
      updatedAt: string;
   }[];
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

// Thêm hoặc cập nhật trong đối tượng orderStatusColors

const orderStatusColors: Record<string, { bg: string; text: string; border: string }> = {
   'Đơn hàng vừa được tạo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đang chờ thanh toán': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Thanh toán thành công': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Thanh toán thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Đã giao hàng': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã huỷ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Đổi trả hàng': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
   'Đã chấp nhận đổi trả': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Đã từ chối đổi trả': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Đã hoàn thành đổi trả và hoàn tiền': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đang chờ hoàn tiền': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
   'Hoàn tiền thành công': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
   'Hoàn tiền thất bại': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
};

export default function OrderDetailPage() {
   const router = useRouter();
   const pathname = usePathname();
   // Lấy orderId từ pathname thay vì params
   const orderId = pathname ? pathname.split('/').pop() : '';

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

   // Hàm tạo key cho localStorage
   const getOrderStatusHistoryKey = (orderId: string, userId: number | null) => {
      if (!userId) return null;
      return `user_${userId}_order_${orderId}_status_history`;
   };

   // Thêm hàm này vào phần đầu component (sau các khai báo hiện tại)

   const getShippingInfoFromLocalStorage = (orderId: string, userId: number | null) => {
      if (!userId) return null;

      try {
         // Lấy thông tin địa chỉ từ localStorage
         const shippingInfoKey = `user_${userId}_order_${orderId}_shipping`;
         const shippingInfoStr = localStorage.getItem(shippingInfoKey);

         if (shippingInfoStr) {
            return JSON.parse(shippingInfoStr);
         }

         // Thử lấy từ danh sách địa chỉ đã lưu
         const addressesKey = `user_${userId}_addresses`;
         const addressesStr = localStorage.getItem(addressesKey);

         if (addressesStr) {
            const addresses = JSON.parse(addressesStr);
            // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên
            const defaultAddress =
               addresses.find((addr: { isDefault: boolean }) => addr.isDefault) || addresses[0];
            return defaultAddress;
         }

         return null;
      } catch (error) {
         console.error('Error reading shipping info from localStorage:', error);
         return null;
      }
   };

   // Improved function to process order status history
   const processOrderStatusHistory = (order: Order) => {
      // Đọc lịch sử từ localStorage nếu có
      const historyKey = getOrderStatusHistoryKey(order.id.toString(), userId);
      let statusHistory: { status: string; updatedAt: string }[] = [];

      if (historyKey) {
         try {
            const savedHistory = localStorage.getItem(historyKey);
            if (savedHistory) {
               statusHistory = JSON.parse(savedHistory);
            }
         } catch (error) {
            console.error('Error reading status history from localStorage:', error);
         }
      }

      // Special case: If the current order status is "Đổi trả hàng" but timeline doesn't start with it
      if (order.status === 'Đổi trả hàng' && (statusHistory.length === 0 || statusHistory[0].status !== 'Đổi trả hàng')) {
         // Create new timeline with just this status
         statusHistory = [{
            status: 'Đổi trả hàng',
            updatedAt: order.updatedAt
         }];

         // Save the new history to localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(statusHistory));
         }

         return statusHistory;
      }

      // Special case: If the current order status is "Đang chờ hoàn tiền" but timeline doesn't start with it
      if (order.status === 'Đang chờ hoàn tiền' && (statusHistory.length === 0 || statusHistory[0].status !== 'Đang chờ hoàn tiền')) {
         // Create new timeline with just this status
         statusHistory = [{
            status: 'Đang chờ hoàn tiền',
            updatedAt: order.updatedAt
         }];

         // Save the new history to localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(statusHistory));
         }

         return statusHistory;
      }

      // Thêm các case đặc biệt sau trong hàm processOrderStatusHistory

      // Special case: If the current order status is "Hoàn tiền thành công" or "Hoàn tiền thất bại" but timeline doesn't include "Đang chờ hoàn tiền"
      if ((order.status === 'Hoàn tiền thành công' || order.status === 'Hoàn tiền thất bại') &&
         !statusHistory.some(item => item.status === 'Đang chờ hoàn tiền')) {
         // Create new timeline with proper history
         statusHistory = [
            {
               status: 'Đang chờ hoàn tiền',
               updatedAt: new Date(new Date(order.updatedAt).getTime() - 5 * 60000).toISOString()
            },
            {
               status: order.status,
               updatedAt: order.updatedAt
            }
         ];

         // Save the new history to localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(statusHistory));
         }

         return statusHistory;
      }

      // Special case: If the current order status is "Đã chấp nhận đổi trả" or "Đã từ chối đổi trả" but timeline doesn't include "Đổi trả hàng"
      if ((order.status === 'Đã chấp nhận đổi trả' || order.status === 'Đã từ chối đổi trả') &&
         !statusHistory.some(item => item.status === 'Đổi trả hàng')) {
         // Create new timeline with proper history
         statusHistory = [
            {
               status: 'Đổi trả hàng',
               updatedAt: new Date(new Date(order.updatedAt).getTime() - 5 * 60000).toISOString()
            },
            {
               status: order.status,
               updatedAt: order.updatedAt
            }
         ];

         // Save the new history to localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(statusHistory));
         }

         return statusHistory;
      }

      // Special case: If the current order status is "Đã hoàn thành đổi trả và hoàn tiền"
      if (order.status === 'Đã hoàn thành đổi trả và hoàn tiền' && statusHistory.length < 3) {
         // Try to figure out which flow it came from
         const isRefundFlow = statusHistory.some(item =>
            ['Đang chờ hoàn tiền', 'Hoàn tiền thành công', 'Hoàn tiền thất bại'].includes(item.status));

         if (isRefundFlow) {
            // Create timeline for refund flow
            statusHistory = [
               {
                  status: 'Đang chờ hoàn tiền',
                  updatedAt: new Date(new Date(order.updatedAt).getTime() - 10 * 60000).toISOString()
               },
               {
                  status: 'Hoàn tiền thành công',
                  updatedAt: new Date(new Date(order.updatedAt).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: order.status,
                  updatedAt: order.updatedAt
               }
            ];
         } else {
            // Create timeline for exchange flow
            statusHistory = [
               {
                  status: 'Đổi trả hàng',
                  updatedAt: new Date(new Date(order.updatedAt).getTime() - 10 * 60000).toISOString()
               },
               {
                  status: 'Đã chấp nhận đổi trả',
                  updatedAt: new Date(new Date(order.updatedAt).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: order.status,
                  updatedAt: order.updatedAt
               }
            ];
         }

         // Save the new history to localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(statusHistory));
         }

         return statusHistory;
      }

      // Nếu không có lịch sử trong localStorage, tạo lịch sử mặc định
      if (statusHistory.length === 0) {
         statusHistory = generateDefaultStatusTimeline(order);

         // Lưu lại lịch sử mặc định vào localStorage
         if (historyKey) {
            try {
               localStorage.setItem(historyKey, JSON.stringify(statusHistory));
            } catch (error) {
               console.error('Error saving default status history to localStorage:', error);
            }
         }
      }

      return statusHistory;
   };


   // Hàm tạo timeline mặc định dựa trên trạng thái đơn hàng
   const generateDefaultStatusTimeline = (order: Order) => {
      // Định nghĩa các luồng trạng thái có thể
      const orderStatusFlows = {
         // COD flow
         cod: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Hoàn thành'
         ],
         // Online payment successful flow
         onlinePaymentSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang chờ thanh toán',
            'Thanh toán thành công',
            'Đang giao hàng',
            'Hoàn thành'
         ],
         // Online payment failed flow
         onlinePaymentFailed: [
            'Đơn hàng vừa được tạo',
            'Đang chờ thanh toán',
            'Thanh toán thất bại',
            'Đã hủy'
         ],
         // Return success flow
         returnSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Đổi trả hàng',
            'Xác nhận đổi trả',
            'Đang giao hàng',
            'Đổi trả thành công'
         ],
         // Return fail flow
         returnFail: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Đổi trả hàng',
            'Từ chối đổi trả',
            'Đổi trả thất bại'
         ],
         // Refund success flow
         refundSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Trả hàng hoàn tiền',
            'Đang chờ hoàn tiền',
            'Hoàn tiền thành công'
         ],
         // Refund fail flow
         refundFail: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Trả hàng hoàn tiền',
            'Đang chờ hoàn tiền',
            'Hoàn tiền thất bại'
         ],
      };

      // Chọn luồng phù hợp dựa trên trạng thái hiện tại
      let orderStatusFlow = orderStatusFlows.cod; // mặc định là luồng COD

      // Xác định loại luồng dựa vào trạng thái hiện tại
      if (order.status === 'Đã hủy') {
         // Trường hợp đơn hàng đã hủy - tạo timeline đặc biệt
         return [
            {
               status: 'Đơn hàng vừa được tạo',
               updatedAt: order.createdAt
            },
            {
               status: 'Đã hủy',
               updatedAt: order.updatedAt
            }
         ];
      }

      // Kiểm tra các trạng thái đặc biệt để xác định luồng
      if (['Đang chờ thanh toán', 'Thanh toán thành công'].includes(order.status)) {
         orderStatusFlow = orderStatusFlows.onlinePaymentSuccess;
      }
      else if (order.status === 'Thanh toán thất bại') {
         orderStatusFlow = orderStatusFlows.onlinePaymentFailed;
      }
      else if (['Đổi trả hàng', 'Xác nhận đổi trả', 'Đổi trả thành công'].includes(order.status)) {
         orderStatusFlow = orderStatusFlows.returnSuccess;
      }
      else if (['Từ chối đổi trả', 'Đổi trả thất bại'].includes(order.status)) {
         orderStatusFlow = orderStatusFlows.returnFail;
      }
      else if (['Trả hàng hoàn tiền', 'Đang chờ hoàn tiền', 'Hoàn tiền thành công'].includes(order.status)) {
         orderStatusFlow = orderStatusFlows.refundSuccess;
      }
      else if (order.status === 'Hoàn tiền thất bại') {
         orderStatusFlow = orderStatusFlows.refundFail;
      }

      // Tìm vị trí của trạng thái hiện tại trong luồng
      const currentStatusIndex = orderStatusFlow.indexOf(order.status);

      if (currentStatusIndex === -1) {
         // Trường hợp trạng thái không nằm trong luồng
         return [
            {
               status: 'Đơn hàng vừa được tạo',
               updatedAt: order.createdAt
            },
            {
               status: order.status,
               updatedAt: order.updatedAt
            }
         ];
      }

      // Tính toán thời gian giữa ngày tạo và ngày cập nhật
      const createTime = new Date(order.createdAt).getTime();
      const updateTime = new Date(order.updatedAt).getTime();

      // Tạo timeline giả từ tạo đơn đến trạng thái hiện tại
      const timeline = [];

      // Tính thời gian trung bình giữa các trạng thái
      const timePerStatus = (updateTime - createTime) / (currentStatusIndex || 1);

      // Thêm tất cả trạng thái từ đầu đến trạng thái hiện tại
      for (let i = 0; i <= currentStatusIndex; i++) {
         timeline.push({
            status: orderStatusFlow[i],
            updatedAt: i === 0
               ? order.createdAt
               : i === currentStatusIndex
                  ? order.updatedAt
                  : new Date(createTime + timePerStatus * i).toISOString()
         });
      }

      return timeline;
   };

   // Add fetchProductDetails function inside OrderDetailPage component
   const fetchProductDetails = useCallback(
      async (order: Order | null) => {
         if (!order) return;

         const token = localStorage.getItem('token');
         if (!token) return;

         let hasUpdates = false;
         const updatedOrder = { ...order };

         // Process all items in the order
         for (const item of updatedOrder.item) {
            // Get the product data directly if we have product_id
            if (item.product_id && (!item.product || !item.product.images || item.product.images.length === 0)) {
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
                        (detail: { id: number }) => detail.id === item.product_detail_id
                     );

                     // Set the product information
                     item.product = {
                        id: productData.id,
                        name: productData.name || "Sản phẩm không tên",
                        images: productData.images?.map((img: { path: string }) => img.path) || []
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
                           images: matchingDetail.images?.map((img: { path: string }) => img.path) || []
                        };

                        // Set product_detail as well for compatibility
                        if (!item.product_detail) {
                           item.product_detail = {
                              id: matchingDetail.id,
                              size: matchingDetail.size,
                              type: matchingDetail.type,
                              values: matchingDetail.values,
                              images: matchingDetail.images?.map((img: { path: string }) => img.path) || []
                           };
                        }
                     }

                     hasUpdates = true;
                  } else {
                     console.error(`Error fetching product ${item.product_id}, status: ${productResponse.status}`);
                  }
               } catch (productError) {
                  console.error(`Failed to fetch product for product_id ${item.product_id}:`, productError);
               }
            }
         }

         if (hasUpdates) {
            setOrder(updatedOrder);
         }
      },
      []
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

         const parsedUserId = parseInt(storedUserId);
         setUserId(parsedUserId);

         try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
               showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
               router.push('/user/signin');
               return;
            }

            const response = await fetch(
               `${HOST}/api/orders/${orderId}?id=${orderId}`,
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

            // Kiểm tra nếu API trả về lịch sử trạng thái
            if (data.statusUpdates && data.statusUpdates.length > 0) {
               // Lấy lịch sử hiện tại từ localStorage (nếu có)
               const historyKey = getOrderStatusHistoryKey(data.id.toString(), parsedUserId);
               let localStatusHistory = [];

               if (historyKey) {
                  const savedHistory = localStorage.getItem(historyKey);
                  if (savedHistory) {
                     try {
                        localStatusHistory = JSON.parse(savedHistory);
                     } catch (error) {
                        console.error('Error parsing local status history:', error);
                     }
                  }
               }

               // Nếu đã có lịch sử trong localStorage, hợp nhất với lịch sử từ API
               if (localStatusHistory.length > 0) {
                  // Tạo map từ cả hai nguồn lịch sử
                  const statusMap = new Map();

                  // Thêm lịch sử từ localStorage
                  localStatusHistory.forEach((update: { status: string; }) => {
                     statusMap.set(update.status, update);
                  });

                  // Thêm lịch sử từ API, ưu tiên dữ liệu từ API nếu cả hai đều có cùng trạng thái
                  data.statusUpdates.forEach((update: { status: string; }) => {
                     statusMap.set(update.status, update);
                  });

                  // Chuyển map về mảng và sắp xếp theo thời gian
                  const mergedStatusHistory = Array.from(statusMap.values()).sort(
                     (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                  );

                  // Lưu lịch sử đã hợp nhất
                  if (historyKey) {
                     localStorage.setItem(historyKey, JSON.stringify(mergedStatusHistory));
                  }

                  // Cập nhật dữ liệu trước khi set state
                  data.statusUpdates = mergedStatusHistory;
               } else {
                  // Nếu chưa có lịch sử local, lưu lịch sử từ API
                  const historyKey = getOrderStatusHistoryKey(data.id.toString(), parsedUserId);
                  if (historyKey) {
                     localStorage.setItem(historyKey, JSON.stringify(data.statusUpdates));
                  }
               }
            } else {
               // API không trả về lịch sử, tạo lịch sử cơ bản
               const basicHistory = generateDefaultStatusTimeline(data);
               const historyKey = getOrderStatusHistoryKey(data.id.toString(), parsedUserId);

               if (historyKey) {
                  localStorage.setItem(historyKey, JSON.stringify(basicHistory));
               }

               data.statusUpdates = basicHistory;
            }

            setOrder(data);

            // Fetch product details after setting the order
            fetchProductDetails(data);

         } catch (error) {
            console.error('Error loading order detail:', error);
            showToastMessage('Không thể tải chi tiết đơn hàng', 'error');
         } finally {
            setLoading(false);
         }
      };

      init();
   }, [orderId, router, showToastMessage, fetchProductDetails]);


   // useEffect riêng để kiểm tra và xử lý tự động hủy đơn
   useEffect(() => {
      if (order && order.status === 'Thanh toán thất bại') {
         const failureTime = new Date(order.updatedAt).getTime();
         const currentTime = new Date().getTime();
         const dayInMilliseconds = 24 * 60 * 60 * 1000;

         if (currentTime - failureTime >= dayInMilliseconds) {
            handleUpdateOrderStatus('Đã hủy');
         }
      }
   }, [order?.id, order?.status]); // Chỉ phụ thuộc vào ID và trạng thái, không phụ thuộc vào toàn bộ order
   // Hàm để kiểm tra trạng thái tiếp theo có hợp lệ không
   const getValidNextStatuses = (currentStatus: string): string[] => {
      // Map trạng thái hiện tại đến các trạng thái có thể chuyển tiếp
      const statusTransitions: Record<string, string[]> = {
         // Luồng chính
         'Đơn hàng vừa được tạo': ['Đang xử lý', 'Đang chờ thanh toán', 'Đã hủy'],
         'Đang xử lý': ['Đang giao hàng', 'Đã hủy'],
         'Đang giao hàng': ['Đã giao hàng', 'Hoàn thành'],
         'Đã giao hàng': ['Hoàn thành', 'Đổi trả hàng', 'Trả hàng hoàn tiền'],
         'Hoàn thành': ['Đổi trả hàng', 'Trả hàng hoàn tiền'],

         // Luồng thanh toán trực tuyến
         'Đang chờ thanh toán': ['Thanh toán thành công', 'Thanh toán thất bại', 'Đã hủy'],
         'Thanh toán thành công': ['Đang xử lý', 'Đang giao hàng'],
         'Thanh toán thất bại': ['Đã hủy', 'Đang chờ thanh toán'],

         // Luồng đổi trả hàng
         'Đổi trả hàng': ['Xác nhận đổi trả', 'Từ chối đổi trả'],
         'Xác nhận đổi trả': ['Đang giao hàng'],
         'Đang giao hàng sau đổi trả': ['Đổi trả thành công'],
         'Từ chối đổi trả': ['Đổi trả thất bại'],
         'Đổi trả thành công': [],
         'Đổi trả thất bại': [],

         // Luồng trả hàng hoàn tiền
         'Trả hàng hoàn tiền': ['Đang chờ hoàn tiền'],
         'Đang chờ hoàn tiền': ['Hoàn tiền thành công', 'Hoàn tiền thất bại'],
         'Hoàn tiền thành công': [],
         'Hoàn tiền thất bại': ['Đang chờ hoàn tiền'],

         // Trạng thái kết thúc
         'Đã hủy': [],
      };

      return statusTransitions[currentStatus] || [];
   };

   // Hàm xử lý hủy đơn hàng với cập nhật timeline
   const handleCancelOrder = async () => {
      if (!order) return;

      // Check if order can be cancelled based on status
      const validNextStatuses = getValidNextStatuses(order.status);
      if (!validNextStatuses.includes('Đã hủy')) {
         showToastMessage('Đơn hàng này không thể hủy ở trạng thái hiện tại', 'error');
         return;
      }

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

         const response = await fetch(
            `${HOST}/api/orders/${order.id}/status`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  status: 'Đã hủy'
               }),
            },
         );

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể hủy đơn hàng');
         }

         // Get current time for the new status
         const currentTime = new Date().toISOString();

         // Lấy lịch sử trạng thái từ localStorage
         const historyKey = getOrderStatusHistoryKey(order.id.toString(), userId);
         let statusHistory = [];

         if (historyKey) {
            const savedHistory = localStorage.getItem(historyKey);
            if (savedHistory) {
               try {
                  statusHistory = JSON.parse(savedHistory);
               } catch (error) {
                  console.error('Error parsing status history:', error);
               }
            }
         }

         // Nếu không có lịch sử, khởi tạo với trạng thái ban đầu
         if (statusHistory.length === 0) {
            statusHistory = [{
               status: 'Đơn hàng vừa được tạo',
               updatedAt: order.createdAt
            }];

            // Nếu trạng thái hiện tại khác "Đơn hàng vừa được tạo", thêm vào
            if (order.status !== 'Đơn hàng vừa được tạo') {
               statusHistory.push({
                  status: order.status,
                  updatedAt: order.updatedAt
               });
            }
         }

         // Tạo map để lưu trạng thái theo tên, đảm bảo không bị trùng lặp
         const statusMap = new Map();
         statusHistory.forEach((update: { status: string; }) => {
            statusMap.set(update.status, update);
         });

         // Thêm trạng thái hủy mới
         statusMap.set('Đã hủy', {
            status: 'Đã hủy',
            updatedAt: currentTime
         });

         // Chuyển map về mảng và sắp xếp theo thời gian
         const updatedStatusHistory = Array.from(statusMap.values()).sort(
            (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
         );

         // Lưu lịch sử đã cập nhật vào localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(updatedStatusHistory));
         }

         // Update order state
         setOrder({
            ...order,
            status: 'Đã hủy',
            updatedAt: currentTime,
            statusUpdates: updatedStatusHistory
         });

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

   // Hàm chung để cập nhật trạng thái đơn hàng
   const handleUpdateOrderStatus = async (newStatus: string) => {
      if (!order) return;

      // Kiểm tra tính hợp lệ của trạng thái mới
      const validNextStatuses = getValidNextStatuses(order.status);
      if (!validNextStatuses.includes(newStatus)) {
         showToastMessage(`Không thể chuyển từ trạng thái ${order.status} sang ${newStatus}`, 'error');
         return;
      }

      if (!confirm(`Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái ${newStatus} không?`)) {
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

         // Gọi API cập nhật trạng thái
         const response = await fetch(
            `${HOST}/api/orders/${order.id}/status`,
            {
               method: 'PATCH',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  status: newStatus
               }),
            },
         );

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Không thể cập nhật trạng thái đơn hàng sang ${newStatus}`);
         }

         // Thời gian cập nhật mới
         const currentTime = new Date().toISOString();

         // Lấy lịch sử trạng thái từ localStorage
         const historyKey = getOrderStatusHistoryKey(order.id.toString(), userId);
         let statusHistory = [];

         if (historyKey) {
            const savedHistory = localStorage.getItem(historyKey);
            if (savedHistory) {
               try {
                  statusHistory = JSON.parse(savedHistory);
               } catch (error) {
                  console.error('Error parsing status history:', error);
               }
            }
         }

         // Nếu không có lịch sử, khởi tạo với trạng thái ban đầu
         if (statusHistory.length === 0) {
            statusHistory = [{
               status: 'Đơn hàng vừa được tạo',
               updatedAt: order.createdAt
            }];

            // Nếu trạng thái hiện tại khác "Đơn hàng vừa được tạo", thêm vào
            if (order.status !== 'Đơn hàng vừa được tạo') {
               statusHistory.push({
                  status: order.status,
                  updatedAt: order.updatedAt
               });
            }
         }

         // Check if the new status is "Đổi trả hàng"
         if (newStatus === 'Đổi trả hàng') {
            // Clear the old timeline and create new one with only this status
            statusHistory = [{
               status: 'Đổi trả hàng',
               updatedAt: currentTime
            }];

            // Create map with just this new status
            const statusMap = new Map();
            statusMap.set('Đổi trả hàng', {
               status: 'Đổi trả hàng',
               updatedAt: currentTime
            });

            // Convert map to array
            const updatedStatusHistory = Array.from(statusMap.values());

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(updatedStatusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: updatedStatusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // Check if the new status is "Đang chờ hoàn tiền"
         if (newStatus === 'Đang chờ hoàn tiền') {
            // Clear the old timeline and create new one with only this status
            statusHistory = [{
               status: 'Đang chờ hoàn tiền',
               updatedAt: currentTime
            }];

            // Create map with just this new status
            const statusMap = new Map();
            statusMap.set('Đang chờ hoàn tiền', {
               status: 'Đang chờ hoàn tiền',
               updatedAt: currentTime
            });

            // Convert map to array
            const updatedStatusHistory = Array.from(statusMap.values());

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(updatedStatusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: updatedStatusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // Thêm sau phần xử lý "Đổi trả hàng"

         // Check if the new status is "Đã chấp nhận đổi trả" or "Đã từ chối đổi trả"
         if (newStatus === 'Đã chấp nhận đổi trả' || newStatus === 'Đã từ chối đổi trả') {
            // Create a timeline with the previous status and the new one
            statusHistory = [
               {
                  status: 'Đổi trả hàng',
                  updatedAt: new Date(new Date(currentTime).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: newStatus,
                  updatedAt: currentTime
               }
            ];

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(statusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: statusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // Check if the new status is "Đã hoàn thành đổi trả và hoàn tiền" from exchange flow
         if (newStatus === 'Đã hoàn thành đổi trả và hoàn tiền' &&
            (order.status === 'Đã chấp nhận đổi trả' || order.status === 'Đã từ chối đổi trả')) {
            // Create a timeline showing the flow
            statusHistory = [
               {
                  status: 'Đổi trả hàng',
                  updatedAt: new Date(new Date(currentTime).getTime() - 10 * 60000).toISOString()
               },
               {
                  status: order.status,
                  updatedAt: new Date(new Date(currentTime).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: newStatus,
                  updatedAt: currentTime
               }
            ];

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(statusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: statusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // Check if the new status is "Hoàn tiền thành công" or "Hoàn tiền thất bại"
         if (newStatus === 'Hoàn tiền thành công' || newStatus === 'Hoàn tiền thất bại') {
            // Create a timeline with previous status and the new one
            statusHistory = [
               {
                  status: 'Đang chờ hoàn tiền',
                  // Use an earlier timestamp (5 minutes ago) 
                  updatedAt: new Date(new Date(currentTime).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: newStatus,
                  updatedAt: currentTime
               }
            ];

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(statusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: statusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // Check if the new status is "Đã hoàn thành đổi trả và hoàn tiền" from refund flow
         if (newStatus === 'Đã hoàn thành đổi trả và hoàn tiền' &&
            (order.status === 'Hoàn tiền thành công' || order.status === 'Hoàn tiền thất bại')) {
            // Get current status history
            const previousStatus = order.status;

            // Create a timeline with previous statuses and the new one
            statusHistory = [
               {
                  status: 'Đang chờ hoàn tiền',
                  updatedAt: new Date(new Date(currentTime).getTime() - 10 * 60000).toISOString()
               },
               {
                  status: previousStatus,
                  updatedAt: new Date(new Date(currentTime).getTime() - 5 * 60000).toISOString()
               },
               {
                  status: newStatus,
                  updatedAt: currentTime
               }
            ];

            // Save the updated history to localStorage
            if (historyKey) {
               localStorage.setItem(historyKey, JSON.stringify(statusHistory));
            }

            // Update order state with new timeline
            setOrder({
               ...order,
               status: newStatus,
               updatedAt: currentTime,
               statusUpdates: statusHistory
            });

            showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
            setLoading(false);
            return;
         }

         // For other statuses, continue with normal flow
         const statusMap = new Map();
         statusHistory.forEach((update: { status: string; }) => {
            statusMap.set(update.status, update);
         });

         // Thêm trạng thái mới vào, không thay thế trạng thái cũ
         statusMap.set(newStatus, {
            status: newStatus,
            updatedAt: currentTime
         });

         // Chuyển map về mảng và sắp xếp theo thời gian
         const updatedStatusHistory = Array.from(statusMap.values()).sort(
            (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
         );

         // Lưu lịch sử đã cập nhật vào localStorage
         if (historyKey) {
            localStorage.setItem(historyKey, JSON.stringify(updatedStatusHistory));
         }

         // Cập nhật state order
         setOrder({
            ...order,
            status: newStatus,
            updatedAt: currentTime,
            statusUpdates: updatedStatusHistory
         });

         showToastMessage(`Đơn hàng đã được chuyển sang trạng thái ${newStatus}`, 'success');
      } catch (error: unknown) {
         console.error('Error updating order status:', error);

         let errorMessage = `Không thể cập nhật trạng thái đơn hàng`;
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
   // Hàm xác nhận đã nhận hàng
   const handleConfirmDelivery = async () => {
      await handleUpdateOrderStatus('Đã giao hàng');
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
            return '/images/logo.png';
         case 'BANKING':
            return '/images/payment/bank.png';
         case 'MOMO':
            return '/images/momo-logo.png';
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

                           {/* Modified Status Timeline - Display based on status names */}
                           {processOrderStatusHistory(order).map((statusUpdate, index) => {
                              const statusColor = orderStatusColors[statusUpdate.status] || {
                                 bg: 'bg-gray-50',
                                 text: 'text-gray-700',
                                 border: 'border-gray-200'
                              };

                              const isCancelled = statusUpdate.status === 'Đã hủy';
                              const isCompleted = statusUpdate.status === 'Hoàn thành';
                              const isPaymentFailed = statusUpdate.status === 'Thanh toán thất bại';
                              const isRefundFailed = statusUpdate.status === 'Hoàn tiền thất bại';

                              // Determine appropriate icon for the status
                              let statusIcon = (
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
                              );

                              if (isCancelled || isPaymentFailed || isRefundFailed) {
                                 statusIcon = (
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
                                 );
                              } else if (isCompleted) {
                                 statusIcon = (
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
                                       <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>
                                       <polyline points='22 4 12 14.01 9 11.01'></polyline>
                                    </svg>
                                 );
                              }

                              return (
                                 <div key={index} className='relative flex items-start mb-8'>
                                    <div
                                       className={`flex items-center justify-center w-6 h-6 rounded-full z-10 ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
                                    >
                                       {statusIcon}
                                    </div>
                                    <div className='ml-4'>
                                       <h3 className={`font-medium ${isCancelled || isPaymentFailed || isRefundFailed
                                          ? 'text-red-600'
                                          : isCompleted
                                             ? 'text-green-600'
                                             : ''
                                          }`}>
                                          {statusUpdate.status}
                                       </h3>
                                       <p className='text-sm text-gray-500'>
                                          {formatDate(statusUpdate.updatedAt)}
                                       </p>
                                    </div>
                                 </div>
                              );
                           })}
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
                                    src={
                                       item.product?.images?.[0] ||
                                       item.productDetailData?.images?.[0] ||
                                       item.product_detail?.images?.[0] ||
                                       '/images/placeholder.jpg'
                                    }
                                    alt={
                                       item.product?.name ||
                                       `Sản phẩm #${item.product_detail_id}`
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
                                          {item.product?.name || `Sản phẩm #${item.product_detail_id}`}
                                       </p>
                                       <p className='text-sm text-gray-500 mt-1'>
                                          {item.productDetailData?.size || item.product_detail?.size ?
                                             `${item.productDetailData?.size || item.product_detail?.size} - ` :
                                             ''}
                                          {item.productDetailData?.values || item.product_detail?.values || ''}
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
                                 <span>
                                    {(() => {
                                       // Thử lấy thông tin từ localStorage trước
                                       const shippingInfo = getShippingInfoFromLocalStorage(
                                          orderId || '',
                                          userId,
                                       );
                                       if (shippingInfo?.fullName) {
                                          return shippingInfo.fullName;
                                       }
                                       // Nếu không có, dùng thông tin từ API
                                       return order.recipient_name || 'Không có thông tin';
                                    })()}
                                 </span>
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
                                 <span>
                                    {(() => {
                                       // Thử lấy thông tin từ localStorage trước
                                       const shippingInfo = getShippingInfoFromLocalStorage(
                                          orderId || '',
                                          userId,
                                       );
                                       if (shippingInfo?.phone) {
                                          return shippingInfo.phone;
                                       }
                                       // Nếu không có, dùng thông tin từ API
                                       return order.recipient_phone || 'Không có thông tin';
                                    })()}
                                 </span>
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
                              <span>
                                 {(() => {
                                    return order.address || 'Không có thông tin';
                                 })()}
                              </span>
                           </p>
                        </div>
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

                        {/* Nút hủy đơn chỉ hiển thị khi trạng thái là "Đã đặt hàng" */}
                        {order.status === 'Đã đặt hàng' && (
                           <button
                              onClick={handleCancelOrder}
                              className='block w-full py-2 text-center bg-red-600 rounded text-white hover:bg-red-700'
                           >
                              Hủy đơn hàng
                           </button>
                        )}

                        {/* Nút thanh toán khi đơn hàng đang chờ thanh toán hoặc thanh toán thất bại */}
                        {(['Đang chờ thanh toán', 'Thanh toán thất bại'].includes(order.status)) && (
                           <button
                              onClick={() => handleUpdateOrderStatus('Thanh toán thành công')}
                              className='block w-full py-2 text-center bg-green-600 rounded text-white hover:bg-green-700'
                           >
                              Thanh toán ngay
                           </button>
                        )}

                        {/* Nút xác nhận đã nhận hàng khi đơn đang giao hàng */}
                        {order.status === 'Đang giao hàng' && (
                           <button
                              onClick={handleConfirmDelivery}
                              className='block w-full py-2 text-center bg-blue-600 rounded text-white hover:bg-blue-700'
                           >
                              Xác nhận đã nhận hàng
                           </button>
                        )}

                        {/* Nút đánh giá sản phẩm khi đơn hàng đã giao hoặc hoàn thành */}
                        {(['Hoàn thành', 'Đã giao hàng'].includes(order.status)) && (
                           <Link
                              href={`/user/review?order=${order.id}`}
                              className='block w-full py-2 text-center bg-green-600 rounded text-white hover:bg-green-700'
                           >
                              Đánh giá sản phẩm
                           </Link>
                        )}





                        {/* Nút theo dõi đơn hàng */}
                        {order.status === 'Đang giao hàng' && (
                           <button
                              onClick={() => {
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
