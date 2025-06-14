'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
   Search,
   Filter,
   ChevronDown,
   ChevronUp,
   X,
   Check,
   TruckIcon,
   Package,
   ExternalLink,
   RefreshCw,
   Tag,
   Calendar,
   DollarSign,
   ChevronLeft,
   ChevronRight
} from 'lucide-react';
import Toast from '@/app/components/ui/toast/Toast';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import { HOST } from '@/app/constants/api';

// Interfaces
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   product_id?: string; // Add this field to match data structure
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
   cancelReason?: string | null; // Add this field
   item: OrderItem[];
   __entity: string;
   user?: {
      id: number;
      name: string;
      phone: string;
      email: string;
   };
}

// ...existing code...

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
   'Đang chờ thanh toán': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Thanh toán thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Thanh toán thành công': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đã đặt hàng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã huỷ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },

   // Đổi trả hàng
   'Đổi trả hàng': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đã chấp nhận đổi trả': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đã hoàn thành đổi trả và hoàn tiền': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã từ chối đổi trả': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },

   // Trả hàng hoàn tiền
   'Trả hàng hoàn tiền': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đang chờ hoàn tiền': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Hoàn tiền thành công': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Hoàn tiền thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

// Danh sách các trạng thái đơn hàng có thể chuyển đến tiếp theo
const nextPossibleStatuses: Record<string, string[]> = {
   'Đơn hàng vừa được tạo': ['Đang xử lý', 'Đã huỷ'],
   'Đang chờ thanh toán': ['Thanh toán thành công', 'Thanh toán thất bại', 'Đang xử lý', 'Đã huỷ'],
   'Thanh toán thành công': ['Đang xử lý', 'Đã huỷ'],
   'Thanh toán thất bại': [],
   'Đang xử lý': ['Đang giao hàng', 'Đã huỷ'],
   'Đang giao hàng': ['Hoàn thành'],
   'Đã đặt hàng': ['Đang xử lý', 'Đã huỷ'],
   'Đổi trả hàng': ['Đã chấp nhận đổi trả', 'Đã từ chối đổi trả'],
   'Đã chấp nhận đổi trả': ['Đã hoàn thành đổi trả và hoàn tiền'],
   'Đang chờ hoàn tiền': ['Hoàn tiền thành công', 'Hoàn tiền thất bại'],
   'Hoàn tiền thành công': ['Đã hoàn thành đổi trả và hoàn tiền'],
   'Hoàn tiền thất bại': ['Đổi trả hàng'],
   'Đã huỷ': [], // Không thể chuyển tiếp
   'Hoàn thành': [], // Không thể chuyển tiếp
   'Đã từ chối đổi trả': [], // Không thể chuyển tiếp
};

export default function OrdersPage() {
   const [loading, setLoading] = useState(true);
   const [orders, setOrders] = useState<Order[]>([]);
   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
   const [statusFilter, setStatusFilter] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [showFilterMenu, setShowFilterMenu] = useState(false);
   const [dateRange, setDateRange] = useState({ from: '', to: '' });
   const [priceRange, setPriceRange] = useState({ min: '', max: '' });
   const [fetchedDetails, setFetchedDetails] = useState<Record<string | number, boolean>>({});
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
   const [newStatus, setNewStatus] = useState('');
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });
   const [sortOption, setSortOption] = useState('newest');
   const [currentPage, setCurrentPage] = useState(1);
   const [ordersPerPage] = useState(5); // Mỗi trang hiển thị 5 đơn hàng
   // Thêm state để theo dõi sản phẩm đang được tải
   const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
   const [lastFetchTime, setLastFetchTime] = useState<number>(0);
   // Khởi tạo một loadingState riêng để tránh re-render toàn trang
   const [pageLoading, setPageLoading] = useState(false);
   const [isChangingPage, setIsChangingPage] = useState(false);

   // Define statuses to exclude from display
   const excludedStatuses = [
      'Đổi trả hàng',
      'Đã chấp nhận đổi trả',
      'Đã từ chối đổi trả',
      'Đã hoàn thành đổi trả và hoàn tiền',
      'Đang chờ hoàn tiền',
      'Hoàn tiền thành công',
      'Hoàn tiền thất bại'
   ];

   // Toast message function
   const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info') => {
      setToast({
         show: true,
         message,
         type,
      });

      setTimeout(() => {
         setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
   }, []);

   // Load all orders (modified to filter out excluded statuses)
   const loadOrders = useCallback(async (forceRefresh = false) => {
      try {
         // Thêm logic chống trùng lặp request
         const currentTime = Date.now();
         // Nếu không phải force refresh và thời gian giữa các lần gọi < 5 giây, bỏ qua
         if (!forceRefresh && currentTime - lastFetchTime < 5000) {
            return; // Bỏ qua request nếu mới gọi gần đây
         }

         setLastFetchTime(currentTime);
         setLoading(true);

         const token = localStorage.getItem('token');
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            window.location.href = '/seller/signin';
            return;
         }

         const response = await fetch(`${HOST}/api/orders/all`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng');
         }

         const data = await response.json();

         // Filter out excluded statuses and sort orders
         const filteredData = data.filter(
            (order: Order) => !excludedStatuses.includes(order.status)
         );

         // Sort orders by createdAt date (newest first)
         const sortedOrders = filteredData.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
         });

         setOrders(sortedOrders);
         setFilteredOrders(sortedOrders);

         if (sortedOrders.length === 0) {
            showToastMessage('Không có đơn hàng nào', 'info');
         }
         setCurrentPage(1); // Reset về trang đầu tiên khi tải lại dữ liệu
         return data;
      } catch (error) {
         console.error('Error loading orders:', error);
         showToastMessage('Không thể tải danh sách đơn hàng', 'error');
         throw error; // Re-throw để có thể xử lý ở caller
      } finally {
         setLoading(false);
      }
   }, [showToastMessage, lastFetchTime, excludedStatuses]);

   // Thêm useRef để lưu trữ dữ liệu đã fetch
   const fetchedOrdersRef = useRef<Record<number, boolean>>({});

   // Cập nhật hàm fetchProductDetails để tránh fetch lại dữ liệu đã có
   const fetchProductDetails = useCallback(async (ordersList: Order[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Tìm các sản phẩm cần tải thông tin chi tiết
      const productsToFetch: Array<{ itemId: number, orderId: number, productId?: string, detailId: number }> = [];
      const usersToFetch: Set<number> = new Set();

      // Thu thập tất cả product IDs và user IDs cần fetch mà chưa được fetch
      ordersList.forEach(order => {
         // Bỏ qua order đã fetch đầy đủ
         if (fetchedOrdersRef.current[order.id]) return;

         if (!order.user && order.user_id) {
            usersToFetch.add(order.user_id);
         }

         let allItemsFetched = true;

         order.item.forEach(item => {
            if (item.product_id && !item.product) {
               productsToFetch.push({
                  itemId: item.id,
                  orderId: order.id,
                  productId: item.product_id,
                  detailId: item.product_detail_id
               });
               allItemsFetched = false;
            }
            else if (!fetchedDetails[item.product_detail_id] && item.product_detail_id && !item.product_detail) {
               productsToFetch.push({
                  itemId: item.id,
                  orderId: order.id,
                  detailId: item.product_detail_id
               });
               allItemsFetched = false;
            }
         });

         // Đánh dấu order đã fetch đủ thông tin
         if (allItemsFetched && order.user) {
            fetchedOrdersRef.current[order.id] = true;
         }
      });

      // Không cần fetch nếu không có gì mới
      if (productsToFetch.length === 0 && usersToFetch.size === 0) {
         return;
      }

      // Tạo bản sao của orders để cập nhật
      const updatedOrders = [...ordersList];

      // Fetch thông tin người dùng
      const userFetchPromises = Array.from(usersToFetch).map(async userId => {
         try {
            // Kiểm tra xem có đang tải hay không
            if (loadingDetails[`user_${userId}`]) return null;

            setLoadingDetails(prev => ({ ...prev, [`user_${userId}`]: true }));

            const userResponse = await fetch(
               `${HOST}/api/v1/users/${userId}`,
               { headers: { Authorization: `Bearer ${token}` } }
            );

            if (userResponse.ok) {
               const userData = await userResponse.json();
               return {
                  userId,
                  data: {
                     id: userData.id,
                     name: userData.firstName && userData.lastName
                        ? `${userData.firstName} ${userData.lastName}`
                        : userData.firstName || userData.lastName || 'Không có tên',
                     phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                     email: userData.email || 'Không có email',
                  }
               };
            }
         } catch (error) {
            console.error(`Failed to fetch user info for user ID ${userId}:`, error);
         } finally {
            setLoadingDetails(prev => ({ ...prev, [`user_${userId}`]: false }));
         }
         return null;
      });

      // Tạo bản đồ product_id -> [requests] để gom nhóm
      const productRequestsMap: Record<string, Array<{ itemId: number, orderId: number, detailId: number }>> = {};
      const detailRequestsMap: Record<number, Array<{ itemId: number, orderId: number }>> = {};

      productsToFetch.forEach(request => {
         if (request.productId) {
            if (!productRequestsMap[request.productId]) {
               productRequestsMap[request.productId] = [];
            }
            productRequestsMap[request.productId].push({
               itemId: request.itemId,
               orderId: request.orderId,
               detailId: request.detailId
            });
         } else if (request.detailId) {
            if (!detailRequestsMap[request.detailId]) {
               detailRequestsMap[request.detailId] = [];
            }
            detailRequestsMap[request.detailId].push({
               itemId: request.itemId,
               orderId: request.orderId
            });
         }
      });

      // Fetch product data in parallel
      const productFetchPromises = Object.entries(productRequestsMap).map(async ([productId, requests]) => {
         try {
            // Kiểm tra xem đang tải hay không
            if (loadingDetails[`product_${productId}`]) return null;

            setLoadingDetails(prev => ({ ...prev, [`product_${productId}`]: true }));

            const productResponse = await fetch(
               `${HOST}/api/products/${productId}`,
               { headers: { Authorization: `Bearer ${token}` } }
            );

            if (productResponse.ok) {
               const productData = await productResponse.json();

               return {
                  productId,
                  requests,
                  data: {
                     id: productData.id,
                     name: productData.name || "Sản phẩm không tên",
                     images: productData.images || [],
                     details: productData.details || []
                  }
               };
            }
         } catch (error) {
            console.error(`Failed to fetch product for product_id ${productId}:`, error);
         } finally {
            setLoadingDetails(prev => ({ ...prev, [`product_${productId}`]: false }));
         }
         return null;
      });

      // Fetch product detail data in parallel
      const detailFetchPromises = Object.entries(detailRequestsMap).map(async ([detailIdStr, requests]) => {
         const detailId = parseInt(detailIdStr);
         try {
            // Kiểm tra xem đang tải hay không
            if (loadingDetails[`detail_${detailId}`] || fetchedDetails[detailId]) return null;

            setLoadingDetails(prev => ({ ...prev, [`detail_${detailId}`]: true }));

            const detailResponse = await fetch(
               `${HOST}/api/product-details/${detailId}`,
               { headers: { Authorization: `Bearer ${token}` } }
            );

            if (detailResponse.ok) {
               const detailData = await detailResponse.json();

               // Đánh dấu là đã fetch
               setFetchedDetails(prev => ({ ...prev, [detailId]: true }));

               // Nếu chúng ta cần thông tin sản phẩm từ chi tiết
               let productData = null;
               if (detailData.product_id && !fetchedDetails[`product_from_detail_${detailData.product_id}`]) {
                  try {
                     const productResponse = await fetch(
                        `${HOST}/api/products/${detailData.product_id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                     );

                     if (productResponse.ok) {
                        productData = await productResponse.json();
                        setFetchedDetails(prev => ({
                           ...prev,
                           [`product_from_detail_${detailData.product_id}`]: true
                        }));
                     }
                  } catch (error) {
                     console.error(`Failed to fetch product from detail ${detailId}:`, error);
                  }
               }

               return {
                  detailId,
                  requests,
                  detailData,
                  productData
               };
            }
         } catch (error) {
            console.error(`Failed to fetch details for product_detail_id ${detailId}:`, error);
         } finally {
            setLoadingDetails(prev => ({ ...prev, [`detail_${detailId}`]: false }));
         }
         return null;
      });

      // Đợi tất cả các promise hoàn thành
      const [userResults, productResults, detailResults] = await Promise.all([
         Promise.all(userFetchPromises),
         Promise.all(productFetchPromises),
         Promise.all(detailFetchPromises)
      ]);

      // Lọc ra các kết quả có giá trị
      const validUserResults = userResults.filter(Boolean);
      const validProductResults = productResults.filter(Boolean);
      const validDetailResults = detailResults.filter(Boolean);

      // Nếu không có kết quả, không cần cập nhật
      if (validUserResults.length === 0 &&
         validProductResults.length === 0 &&
         validDetailResults.length === 0) {
         return;
      }

      // Cập nhật thông tin người dùng
      validUserResults.forEach(result => {
         if (!result) return;

         const { userId, data } = result;

         updatedOrders.forEach(order => {
            if (order.user_id === userId) {
               order.user = data;
            }
         });
      });

      // Cập nhật thông tin sản phẩm
      validProductResults.forEach(result => {
         if (!result) return;

         const { requests, data } = result;

         requests.forEach(req => {
            const order = updatedOrders.find(o => o.id === req.orderId);
            if (!order) return;

            const item = order.item.find(i => i.id === req.itemId);
            if (!item) return;

            // Thiết lập thông tin sản phẩm
            item.product = {
               id: data.id,
               name: data.name,
               images: data.images
            };

            // Tìm thông tin chi tiết phù hợp
            const matchingDetail = data.details?.find(
               (detail: { id: number }) => detail.id === req.detailId
            );

            if (matchingDetail) {
               item.product_detail = {
                  id: matchingDetail.id,
                  size: matchingDetail.size,
                  type: matchingDetail.type,
                  values: matchingDetail.values,
                  images: matchingDetail.images || []
               };

               item.productDetailData = {
                  id: matchingDetail.id,
                  size: matchingDetail.size,
                  type: matchingDetail.type,
                  values: matchingDetail.values,
                  quantities: matchingDetail.quantities,
                  isActive: matchingDetail.isActive,
                  images: matchingDetail.images || []
               };

               setFetchedDetails(prev => ({ ...prev, [req.detailId]: true }));
            }
         });
      });

      // Cập nhật thông tin chi tiết sản phẩm
      validDetailResults.forEach(result => {
         if (!result) return;

         const { requests, detailData, productData } = result;

         requests.forEach(req => {
            const order = updatedOrders.find(o => o.id === req.orderId);
            if (!order) return;

            const item = order.item.find(i => i.id === req.itemId);
            if (!item) return;

            // Thiết lập thông tin chi tiết
            item.productDetailData = detailData;

            item.product_detail = {
               id: detailData.id,
               size: detailData.size,
               type: detailData.type,
               values: detailData.values,
               images: detailData.images || []
            };

            // Thêm thông tin sản phẩm nếu có
            if (productData) {
               item.product = {
                  id: productData.id,
                  name: productData.name || "Sản phẩm không tên",
                  images: productData.images || []
               };
            }
         });
      });

      // Cập nhật state nếu có thay đổi
      if (validUserResults.length > 0 || validProductResults.length > 0 || validDetailResults.length > 0) {
         // Sử dụng cập nhật state theo hàm để tránh phụ thuộc vào giá trị hiện tại
         setOrders((prevOrders) => {
            // Tạo bản sao mới của danh sách đơn hàng

            const newOrders = [...prevOrders];

            // Chỉ cập nhật các đơn hàng đã được xử lý
            const processedOrderIds = new Set(updatedOrders.map(o => o.id));

            // Kết hợp thông tin mới với danh sách hiện có
            return newOrders.map(order => {
               if (processedOrderIds.has(order.id)) {
                  // Tìm phiên bản đã cập nhật
                  const updatedOrder = updatedOrders.find(o => o.id === order.id);
                  return updatedOrder || order;
               }
               return order;
            });
         });

         // Áp dụng bộ lọc với phiên bản hiện tại của orders
         // Gọi thông qua hàm để tránh phụ thuộc vào danh sách orders
         applyFilters(updatedOrders);
      }
   }, [loadingDetails]); // Chỉ phụ thuộc vào loadingDetails, không phụ thuộc vào fetchedDetails

   // Thêm hàm sắp xếp đơn hàng
   const sortOrders = useCallback(
      (ordersList: Order[]) => {
         let sorted = [...ordersList];
         switch (sortOption) {
            case 'newest':
               sorted = sorted.sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
               );
               break;
            case 'oldest':
               sorted = sorted.sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
               );
               break;
            case 'price-high':
               sorted = sorted.sort(
                  (a, b) => parseFloat(b.total_price) - parseFloat(a.total_price),
               );
               break;
            case 'price-low':
               sorted = sorted.sort(
                  (a, b) => parseFloat(a.total_price) - parseFloat(b.total_price),
               );
               break;
         }
         return sorted;
      },
      [sortOption],
   );

   // Sửa hàm applyFilters để ngăn vòng lặp cập nhật
   const applyFilters = useCallback(
      (ordersList: Order[] = orders) => {
         let result = [...ordersList];

         // Filter out excluded statuses
         result = result.filter(order => !excludedStatuses.includes(order.status));

         // Apply status filter
         if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
         }

         // Apply search filter
         if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            result = result.filter(
               (order) =>
                  order.order_code.toLowerCase().includes(term) ||
                  order.address.toLowerCase().includes(term) ||
                  order.user?.name?.toLowerCase().includes(term) ||
                  order.user?.phone?.includes(term) ||
                  order.user?.email?.toLowerCase().includes(term)
            );
         }

         // Apply date range filter
         if (dateRange.from) {
            const fromDate = new Date(dateRange.from);
            result = result.filter((order) => new Date(order.createdAt) >= fromDate);
         }

         if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999); // Set to end of day
            result = result.filter((order) => new Date(order.createdAt) <= toDate);
         }

         // Apply price range filter
         if (priceRange.min) {
            const minPrice = parseFloat(priceRange.min);
            result = result.filter((order) => parseFloat(order.total_price) >= minPrice);
         }

         if (priceRange.max) {
            const maxPrice = parseFloat(priceRange.max);
            result = result.filter((order) => parseFloat(order.total_price) <= maxPrice);
         }

         // Apply sorting
         result = sortOrders(result);

         // So sánh kết quả trước khi cập nhật state
         // Chỉ cập nhật nếu kết quả thực sự khác nhau
         const currentFilteredJson = JSON.stringify(filteredOrders);
         const newFilteredJson = JSON.stringify(result);

         if (currentFilteredJson !== newFilteredJson) {
            setFilteredOrders(result);
            // Chỉ reset trang khi bộ lọc thay đổi và gọi từ UI action
            if (ordersList === orders) { // Khi gọi mặc định từ UI filters
               setCurrentPage(1);
            }
         }
      },
      [orders, statusFilter, searchTerm, dateRange, priceRange, sortOrders, excludedStatuses, filteredOrders]
   );

   // Sử dụng useMemo cho currentOrders và totalPages để tránh tính lại mỗi lần render
   const { currentOrders, totalPages, indexOfFirstOrder, indexOfLastOrder } = useMemo(() => {
      const indexOfLastOrder = currentPage * ordersPerPage;
      const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
      const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
      const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

      return { currentOrders, totalPages, indexOfFirstOrder, indexOfLastOrder };
   }, [currentPage, filteredOrders, ordersPerPage]);


   // Initialize data - chỉ gọi một lần
   useEffect(() => {
      loadOrders();
      // Không thêm loadOrders vào dependencies - chỉ gọi một lần khi mount
   }, []);

   // Cải thiện useEffect cho việc fetch chi tiết sản phẩm
   useEffect(() => {
      // Sử dụng biến ref để tránh các lần gọi không cần thiết
      const shouldFetch = orders.length > 0 && !loading && !isChangingPage;

      if (shouldFetch) {
         // Sử dụng giá trị lưu trữ thay vì tính toán lại
         const fetchCurrentPage = () => {
            // Dùng giá trị từ useMemo để tránh tính toán trùng lặp
            if (currentOrders.length > 0) {
               console.log(`Fetching details for ${currentOrders.length} orders on page ${currentPage}`);
               fetchProductDetails(currentOrders);
            }
         };

         const timer = setTimeout(fetchCurrentPage, 100);
         return () => clearTimeout(timer);
      }
   }, [orders.length, loading, isChangingPage, currentOrders, currentPage, fetchProductDetails]);

   // Apply filters when filter conditions change - chỉ cập nhật filteredOrders, không gọi API
   useEffect(() => {
      applyFilters();
   }, [statusFilter, searchTerm, dateRange, priceRange, sortOption, applyFilters]);

   // Cải thiện hàm paginate để cuộn mượt hơn
   const paginate = useCallback((pageNumber: number) => {
      if (pageNumber > 0 && pageNumber <= Math.ceil(filteredOrders.length / ordersPerPage) && pageNumber !== currentPage) {
         // Ngăn nhiều lần thay đổi trang nhanh liên tiếp
         if (isChangingPage) return;

         setIsChangingPage(true);
         setCurrentPage(pageNumber);

         // Đặt lại trạng thái sau khi chuyển trang
         setTimeout(() => {
            // Cuộn lên đầu danh sách đơn hàng
            const ordersList = document.getElementById('orders-list');
            if (ordersList) {
               ordersList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            setIsChangingPage(false);
         }, 300);
      }
   }, [currentPage, filteredOrders.length, ordersPerPage, isChangingPage]);

   // Thêm hàm này trong component
   const goToPage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0 && value <= totalPages && value !== currentPage) {
         paginate(value);
      }
   }, [currentPage, totalPages, paginate]);

   // Add this ref
   const lastRenderedPage = useRef(currentPage);

   // Chỉ fetch chi tiết khi trang thay đổi thực sự
   useEffect(() => {
      if (lastRenderedPage.current !== currentPage && orders.length > 0 && !loading) {
         lastRenderedPage.current = currentPage;

         const fetchCurrentPage = () => {
            if (currentOrders.length > 0) {
               console.log(`Fetching details for ${currentOrders.length} orders on page ${currentPage}`);
               fetchProductDetails(currentOrders);
            }
         };

         const timer = setTimeout(fetchCurrentPage, 100);
         return () => clearTimeout(timer);
      }
   }, [currentPage, orders.length, loading, currentOrders, fetchProductDetails]);

   // Get payment method icon
   const getPaymentMethodIcon = (method: string) => {
      switch (method) {
         case 'COD':
            return '/images/logo.png';
         case 'BANKING':
            return '/images/vietinbank-logo.png';
         case 'MOMO':
            return '/images/momo-logo.png';
         default:
            return '/images/payment/cod.png';
      }
   };

   // Update the list of valid statuses to match exactly what the API expects
   const validOrderStatuses = [
      'Đơn hàng vừa được tạo',
      'Đang chờ thanh toán',
      'Thanh toán thất bại',
      'Thanh toán thành công',
      'Đang chờ hoàn tiền',
      'Hoàn tiền thành công',
      'Hoàn tiền thất bại',
      'Đang xử lý',
      'Đang giao hàng',
      'Đã đặt hàng',
      'Hoàn thành',
      'Đã huỷ',
      'Đổi trả hàng'
   ];

   // Handle status update
   const handleUpdateOrderStatus = async () => {
      if (!selectedOrder || !newStatus) return;

      // Validate the status to ensure it's in the allowed list
      if (!validOrderStatuses.includes(newStatus)) {
         showToastMessage(`Trạng thái "${newStatus}" không hợp lệ`, 'error');
         return;
      }

      try {
         setLoading(true);
         const token = localStorage.getItem('token');

         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            return;
         }

         // Use query parameter for status instead of JSON body
         const encodedStatus = encodeURIComponent(newStatus);
         const response = await fetch(
            `${HOST}/api/orders/${selectedOrder.id}/status?status=${encodedStatus}`,
            {
               method: 'PATCH', // Keep the PATCH method
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               // No body needed since we're using query parameters
            },
         );

         // Handle specific error codes
         if (response.status === 422) {
            const errorData = await response.json();
            showToastMessage(errorData.errors?.status || 'Trạng thái không hợp lệ', 'error');
            return;
         }

         if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái đơn hàng');
         }

         // Update orders state with new status
         setOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === selectedOrder.id ? { ...order, status: newStatus } : order,
            ),
         );

         // Also update filteredOrders to see changes immediately
         setFilteredOrders((prevOrders) =>
            prevOrders.map((order) =>
               order.id === selectedOrder.id ? { ...order, status: newStatus } : order,
            ),
         );

         showToastMessage('Cập nhật trạng thái đơn hàng thành công', 'success');
         setShowUpdateStatusModal(false);
         setSelectedOrder(null);
         setNewStatus('');
      } catch (error) {
         console.error('Error updating order status:', error);
         showToastMessage('Không thể cập nhật trạng thái đơn hàng', 'error');
      } finally {
         setLoading(false);
      }
   };

   // Open status update modal
   const openUpdateStatusModal = (order: Order) => {
      setSelectedOrder(order);
      setShowUpdateStatusModal(true);
   };

   // Reset filters
   const resetFilters = () => {
      setStatusFilter(null);
      setSearchTerm('');
      setDateRange({ from: '', to: '' });
      setPriceRange({ min: '', max: '' });
      setShowFilterMenu(false);
   };

   // Sửa hàm refresh để gọi loadOrders với force refresh
   const handleRefreshOrders = () => {
      setPageLoading(true);
      loadOrders(true).finally(() => {
         setPageLoading(false);
      });
   };

   if (loading) {
      return (
         <div className='flex h-screen bg-[#F8F8F9]'>
            <div className='hidden md:block'>
               <MenuSideBar />
            </div>
            <div className='flex-1'>
               <Header />
               <div className='flex justify-center items-center h-[calc(100vh-64px)]'>
                  <div className='flex flex-col items-center'>
                     <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#442C08] mb-2'></div>
                     <p className='text-sm text-gray-600'>Đang tải dữ liệu...</p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className='flex h-screen bg-[#F8F8F9]'>
         <div className='hidden md:block'>
            <MenuSideBar />
         </div>
         <div className='flex-1 flex flex-col w-full'>
            <Header />

            <div className='flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5'>
               {/* Toast notification */}
               <div className='fixed top-16 right-2 z-50'>
                  <Toast
                     show={toast.show}
                     message={toast.message}
                     type={toast.type}
                     onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                  />
               </div>

               {/* Breadcrumb - thêm mới */}
               <nav className='flex mb-3 text-xs'>
                  <ol className='flex items-center space-x-1'>
                     <li>
                        <Link
                           href='/seller/dashboard'
                           className='text-gray-500 hover:text-[#442C08]'
                        >
                           Dashboard
                        </Link>
                     </li>
                     <li>
                        <span className='text-gray-400 mx-1'>/</span>
                     </li>
                     <li className='text-[#442C08] font-medium'>Quản lý đơn hàng</li>
                  </ol>
               </nav>

               {/* Page title và stats - nâng cấp */}
               <div className='mb-4'>
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4'>
                     <div>
                        <h1 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#442C08]'>
                           Quản Lý Đơn Hàng
                        </h1>
                        <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                           Xem và quản lý tất cả đơn hàng của shop
                        </p>
                     </div>
                     <div className='flex items-center w-full sm:w-auto gap-2'>
                        <button
                           onClick={handleRefreshOrders}
                           className='flex-1 sm:flex-none bg-[#E8E2D9] hover:bg-[#d6cfc6] text-[#442C08] px-2 sm:px-3 py-1.5 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm'
                           disabled={pageLoading}
                        >
                           <RefreshCw size={14} className={`mr-1.5 ${pageLoading ? 'animate-spin' : ''}`} />
                           {pageLoading ? 'Đang tải...' : 'Làm mới'}
                        </button>
                     </div>
                  </div>

                  {/* Order stats cards - thêm mới */}
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4'>
                     <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100'>
                        <p className='text-xs text-gray-500'>Tất cả đơn</p>
                        <p className='text-lg font-bold text-[#442C08]'>{orders.length}</p>
                     </div>
                     <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-blue-100'>
                        <p className='text-xs text-gray-500'>Đơn mới</p>
                        <p className='text-lg font-bold text-blue-600'>
                           {
                              orders.filter(
                                 (o) =>
                                    o.status === 'Đơn hàng vừa được tạo' ||
                                    o.status === 'Đã đặt hàng',
                              ).length
                           }
                        </p>
                     </div>
                     <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-yellow-100'>
                        <p className='text-xs text-gray-500'>Đang xử lý</p>
                        <p className='text-lg font-bold text-yellow-600'>
                           {
                              orders.filter(
                                 (o) => o.status === 'Đang xử lý' || o.status === 'Đang giao hàng',
                              ).length
                           }
                        </p>
                     </div>
                     <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-green-100'>
                        <p className='text-xs text-gray-500'>Hoàn thành</p>
                        <p className='text-lg font-bold text-green-600'>
                           {
                              orders.filter(
                                 (o) => o.status === 'Hoàn thành' || o.status === 'Đã giao hàng',
                              ).length
                           }
                        </p>
                     </div>
                     <div className='bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-red-100'>
                        <p className='text-xs text-gray-500'>Đã hủy</p>
                        <p className='text-lg font-bold text-red-600'>
                           {orders.filter((o) => o.status === 'Đã huỷ').length}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Search and filter bar - nâng cấp */}
               <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4'>
                  <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                     <div className='flex-1 w-full'>
                        <div className='relative'>
                           <input
                              type='text'
                              placeholder='Tìm kiếm theo mã đơn, khách hàng, địa chỉ...'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className='w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] focus:border-[#442C08] text-sm'
                           />
                           <Search
                              size={18}
                              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                           />
                        </div>
                     </div>

                     <div className='flex gap-3'>
                        {/* Sort dropdown - thêm mới */}
                        <div className='relative'>
                           <select
                              value={sortOption}
                              onChange={(e) => setSortOption(e.target.value)}
                              className='appearance-none pl-3 pr-9 py-2.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#442C08]'
                           >
                              <option value='newest'>Mới nhất</option>
                              <option value='oldest'>Cũ nhất</option>
                              <option value='price-high'>Giá cao nhất</option>
                              <option value='price-low'>Giá thấp nhất</option>
                           </select>
                           <ChevronDown
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none'
                              size={18}
                           />
                        </div>

                        <button
                           onClick={() => setShowFilterMenu(!showFilterMenu)}
                           className='flex items-center px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm'
                        >
                           <Filter size={18} className='mr-2' />
                           <span>Bộ lọc</span>
                           {showFilterMenu ? (
                              <ChevronUp size={18} className='ml-2' />
                           ) : (
                              <ChevronDown size={18} className='ml-2' />
                           )}
                        </button>
                     </div>
                  </div>

                  {showFilterMenu && (
                     <div className='mt-4 pt-4 border-t border-gray-200'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                           {/* Status filter - tăng kích thước và padding */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1.5'>
                                 <Tag size={16} className='mr-2' />
                                 <label className='text-sm font-medium'>Trạng thái đơn hàng</label>
                              </div>
                              <select
                                 value={statusFilter || ''}
                                 onChange={(e) => setStatusFilter(e.target.value || null)}
                                 className='w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] focus:border-[#442C08] text-sm'
                              >
                                 <option value=''>Tất cả trạng thái</option>
                                 {Object.keys(orderStatusColors)
                                    .filter(status => !excludedStatuses.includes(status))
                                    .map((status) => (
                                       <option key={status} value={status}>
                                          {status}
                                       </option>
                                    ))
                                 }
                              </select>
                           </div>

                           {/* Date range filter - tăng kích thước và padding */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1.5'>
                                 <Calendar size={16} className='mr-2' />
                                 <label className='text-sm font-medium'>Khoảng thời gian</label>
                              </div>
                              <div className='grid grid-cols-2 gap-3'>
                                 <input
                                    type='date'
                                    value={dateRange.from}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, from: e.target.value })
                                    }
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm'
                                 />
                                 <input
                                    type='date'
                                    value={dateRange.to}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, to: e.target.value })
                                    }
                                    className='w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm'
                                 />
                              </div>
                           </div>

                           {/* Price range filter - tăng kích thước và padding */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1.5'>
                                 <DollarSign size={16} className='mr-2' />
                                 <label className='text-sm font-medium'>Giá trị đơn hàng</label>
                              </div>
                              <div className='flex items-center gap-3'>
                                 <input
                                    type='number'
                                    placeholder='Tối thiểu'
                                    value={priceRange.min}
                                    onChange={(e) =>
                                       setPriceRange({ ...priceRange, min: e.target.value })
                                    }
                                    className='w-1/2 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm'
                                 />
                                 <span>-</span>
                                 <input
                                    type='number'
                                    placeholder='Tối đa'
                                    value={priceRange.max}
                                    onChange={(e) =>
                                       setPriceRange({ ...priceRange, max: e.target.value })
                                    }
                                    className='w-1/2 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm'
                                 />
                              </div>
                           </div>

                           {/* Actions - tăng kích thước và cải thiện giao diện */}
                           <div className='flex items-end'>
                              <div className='grid grid-cols-2 gap-3 w-full'>
                                 <button
                                    onClick={resetFilters}
                                    className='px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm'
                                 >
                                    Xoá bộ lọc
                                 </button>
                                 <button
                                    onClick={() => {
                                       applyFilters();
                                       setShowFilterMenu(false);
                                    }}
                                    className='px-4 py-2.5 bg-[#442C08] text-white rounded-md hover:bg-[#5d3a0a] transition-colors text-sm'
                                 >
                                    Áp dụng
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Status tabs - cập nhật để chỉ hiển thị 4 trạng thái quan trọng */}
               <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-4'>
                  <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
                     <button
                        onClick={() => setStatusFilter(null)}
                        className={`px-3 py-2 text-center transition-colors text-sm rounded-md ${!statusFilter
                           ? 'bg-[#442C08] text-white font-medium'
                           : 'text-gray-700 hover:text-[#442C08] border border-gray-200'
                           }`}
                     >
                        Tất cả
                     </button>

                     {/* Hiển thị chỉ 4 trạng thái yêu cầu */}
                     {['Đang xử lý', 'Đang giao hàng', 'Hoàn thành', 'Đã huỷ'].map(status => (
                        <button
                           key={status}
                           onClick={() => setStatusFilter(status)}
                           className={`px-2 py-2 text-center transition-colors text-sm rounded-md ${statusFilter === status
                              ? 'bg-[#442C08] text-white font-medium'
                              : 'text-gray-700 hover:text-[#442C08] border border-gray-200'
                              }`}
                        >
                           {status}
                        </button>
                     ))}
                  </div>
               </div>
               {/* Results count and pagination info - cập nhật phần hiển thị số lượng */}
               <div className='flex justify-between items-center mb-4'>
                  <p className='text-xs text-gray-500'>
                     Hiển thị {currentOrders.length > 0 ?
                        `${indexOfFirstOrder + 1}-${Math.min(indexOfLastOrder, filteredOrders.length)} của ${filteredOrders.length}` :
                        '0'} đơn hàng
                     {statusFilter ? ` (trạng thái: ${statusFilter})` : ''}
                  </p>
               </div>

               {/* Orders list */}
               <div id="orders-list" className={`relative ${isChangingPage ? 'opacity-50' : ''} transition-opacity duration-300`}>
                  {isChangingPage && (
                     <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-30 z-10">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#442C08] rounded-full animate-spin"></div>
                     </div>
                  )}

                  {filteredOrders.length === 0 ? (
                     <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center'>
                        <div className='flex flex-col items-center'>
                           <div className='bg-gray-100 p-5 rounded-full mb-4'>
                              <Package size={32} className='text-gray-400' />
                           </div>
                           <h3 className='text-lg font-medium mb-2'>Không có đơn hàng nào</h3>
                           <p className='text-sm text-gray-500 mb-4 max-w-md'>
                              {searchTerm ||
                                 statusFilter ||
                                 dateRange.from ||
                                 dateRange.to ||
                                 priceRange.min ||
                                 priceRange.max
                                 ? 'Không tìm thấy đơn hàng nào phù hợp với điều kiện lọc của bạn'
                                 : 'Chưa có đơn hàng nào được tạo'}
                           </p>

                           {(searchTerm ||
                              statusFilter ||
                              dateRange.from ||
                              dateRange.to ||
                              priceRange.min ||
                              priceRange.max) && (
                                 <button
                                    onClick={resetFilters}
                                    className='bg-[#442C08] text-white py-2 px-4 rounded-md hover:bg-[#5d3a0a] transition-colors text-sm'
                                 >
                                    Xoá bộ lọc
                                 </button>
                              )}
                        </div>
                     </div>
                  ) : (
                     <div className='space-y-3'>
                        {currentOrders.map((order) => (
                           <div
                              key={order.id}
                              className='bg-white rounded-lg shadow-sm border border-gray-100 hover:border-[#E8E2D9] transition-colors overflow-hidden'
                           >
                              {/* Order header - layout mới có responsive tốt hơn */}
                              <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
                                 <div className='flex items-center gap-2 flex-wrap w-full sm:w-auto'>
                                    <p className='font-medium text-sm'>#{order.order_code}</p>
                                    <span
                                       className={`px-2 py-0.5 text-xs md:text-sm rounded-full ${orderStatusColors[order.status]?.bg || 'bg-gray-50'
                                          } ${orderStatusColors[order.status]?.text || 'text-gray-700'
                                          } border ${orderStatusColors[order.status]?.border || 'border-gray-200'
                                          }`}
                                    >
                                       {order.status}
                                    </span>
                                    <span className='text-xs md:text-sm text-gray-500'>
                                       {formatDate(order.createdAt)}
                                    </span>
                                 </div>

                                 <div className='flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end'>
                                    {order.method_payment && (
                                       <div className='flex items-center bg-gray-50 px-2 py-1 rounded-md'>
                                          <Image
                                             src={getPaymentMethodIcon(order.method_payment)}
                                             alt={order.method_payment}
                                             width={16}
                                             height={16}
                                             className='mr-1.5'
                                          />
                                          <span className='text-sm text-gray-700'>
                                             {order.method_payment === 'COD'
                                                ? 'COD'
                                                : order.method_payment === 'BANKING'
                                                   ? 'Chuyển khoản'
                                                   : order.method_payment === 'MOMO'
                                                      ? 'Momo'
                                                      : ''}
                                          </span>
                                       </div>
                                    )}

                                    <div className='text-base font-medium text-[#442C08]'>
                                       {formatPrice(order.total_price)}
                                    </div>
                                 </div>
                              </div>

                              {/* Phần hiển thị lý do hủy đơn - cải thiện padding và kích thước chữ */}
                              {order.status === 'Đã huỷ' && order.cancelReason && (
                                 <div className='p-3 bg-red-50 border-b border-red-100'>
                                    <div className='flex items-start'>
                                       <div>
                                          <p className='text-xs text-red-600 font-medium'>Lý do hủy đơn:</p>
                                          <p className='text-sm text-gray-700'>{order.cancelReason}</p>
                                       </div>
                                    </div>
                                 </div>
                              )}

                              {/* Customer section - cải thiện responsive và font size */}
                              <div className='p-4 bg-gray-50 border-b border-gray-100'>
                                 <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                    <div>
                                       <p className='text-xs text-gray-500 mb-1'>Khách hàng</p>
                                       <p className='text-sm truncate'>
                                          {order.user?.name || 'Không có tên'}
                                       </p>
                                    </div>
                                    <div>
                                       <p className='text-xs text-gray-500 mb-1'>Điện thoại</p>
                                       <p className='text-sm truncate'>
                                          {order.user?.phone || 'Không có SĐT'}
                                       </p>
                                    </div>
                                    <div>
                                       <p className='text-xs text-gray-500 mb-1'>Email</p>
                                       <p className='text-sm truncate'>
                                          {order.user?.email || 'Không có email'}
                                       </p>
                                    </div>
                                    <div>
                                       <p className='text-xs text-gray-500 mb-1'>Địa chỉ</p>
                                       <p className='text-sm truncate'>{order.address}</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Order items - cải thiện responsive và font size */}
                              <div className='p-4'>
                                 <div className='mb-2 flex justify-between'>
                                    <p className='text-sm text-gray-500'>
                                       Sản phẩm ({order.item.length})
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                       Tổng SL: {order.total_quantity}
                                    </p>
                                 </div>

                                 <div className='space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar'>
                                    {order.item.map((item) => (
                                       <div key={item.id} className='flex items-center gap-3'>
                                          <div className='relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
                                             <Image
                                                src={
                                                   item.productDetailData?.images?.[0]?.path ||
                                                   item.product_detail?.images?.[0]?.path ||
                                                   item.product?.images?.[0]?.path ||
                                                   '/images/default-product.png'
                                                }
                                                alt={
                                                   item.product?.name ||
                                                   `Sản phẩm #${item.product_detail_id}`
                                                }
                                                fill
                                                sizes='48px'
                                                style={{ objectFit: 'contain' }}
                                                className='p-1'
                                             />
                                          </div>
                                          <div className='flex-1 min-w-0'>
                                             <p className='text-sm font-medium line-clamp-1'>
                                                {item.product?.name ||
                                                   `Sản phẩm #${item.product_detail_id}`}
                                             </p>
                                             <div className='flex justify-between'>
                                                <span className='text-xs text-gray-500'>
                                                   {(item.productDetailData?.size ||
                                                      item.product_detail?.size) &&
                                                      `${item.productDetailData?.size ||
                                                      item.product_detail?.size
                                                      } - `}
                                                   {item.productDetailData?.values ||
                                                      item.product_detail?.values}
                                                </span>
                                                <span className='text-xs text-gray-500'>
                                                   {formatPrice(item.unit_price)} × {item.quantity}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              {/* Order summary and actions - cải thiện responsive */}
                              <div className='flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50 p-4 border-t border-gray-100'>
                                 {/* Summary */}
                                 <div className='w-full sm:w-auto'>
                                    <div className='flex items-center justify-between sm:justify-start sm:gap-6'>
                                       <div>
                                          <span className='text-xs text-gray-500 block mb-0.5'>
                                             Tổng tiền:
                                          </span>
                                          <span className='text-base font-medium text-[#442C08]'>
                                             {formatPrice(order.total_price)}
                                          </span>
                                       </div>

                                       <div>
                                          <span className='text-xs text-gray-500 block mb-0.5'>
                                             Khách hàng:
                                          </span>
                                          <span className='text-sm truncate max-w-[180px] inline-block'>
                                             {order.user?.name || 'N/A'}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Actions - nút lớn hơn và dễ bấm hơn */}
                                 <div className='flex gap-3 w-full sm:w-auto'>
                                    <Link
                                       href={`/seller/orders/${order.id}`}
                                       className='flex-1 sm:flex-none text-center text-sm border border-[#442C08] bg-white text-[#442C08] hover:bg-gray-50 px-4 py-2 rounded-md flex items-center justify-center'
                                    >
                                       <ExternalLink size={16} className='mr-2' />
                                       Chi tiết
                                    </Link>

                                    {/* Hide update button for completed orders */}
                                    {order.status !== 'Hoàn thành' && order.status !== 'Đã huỷ' && (
                                       <button
                                          onClick={() => openUpdateStatusModal(order)}
                                          className='flex-1 sm:flex-none text-center text-sm bg-[#442C08] text-white hover:bg-opacity-90 px-4 py-2 rounded-md flex items-center justify-center'
                                       >
                                          <TruckIcon size={16} className='mr-2' />
                                          {order.status === 'Đơn hàng vừa được tạo'
                                             ? 'Xử lý'
                                             : 'Cập nhật'}
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}

                        {/* Pagination Controls */}
                        {filteredOrders.length > ordersPerPage && (
                           <div className='flex flex-col sm:flex-row justify-between items-center mt-6 pt-3 border-t border-gray-100'>
                              <div className='text-xs sm:text-sm text-gray-500 mb-3 sm:mb-0'>
                                 {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} / {filteredOrders.length} đơn hàng
                              </div>

                              <div className='flex flex-wrap items-center justify-center gap-1 sm:gap-2'>
                                 <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center p-1.5 rounded ${currentPage === 1
                                       ? 'text-gray-300 cursor-not-allowed'
                                       : 'text-gray-600 hover:bg-gray-100'
                                       }`}
                                    aria-label="Trang trước"
                                 >
                                    <ChevronLeft size={16} />
                                 </button>

                                 {/* Page Numbers - hiển thị số trang gọn hơn */}
                                 <div className='flex items-center gap-1'>
                                    {Array.from({ length: totalPages }, (_, i) => {
                                       const pageNum = i + 1;
                                       // Hiển thị ít trang hơn để tránh tràn
                                       if (
                                          pageNum === 1 ||
                                          pageNum === totalPages ||
                                          (totalPages <= 5 || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1))
                                       ) {
                                          return (
                                             <button
                                                key={pageNum}
                                                onClick={() => paginate(pageNum)}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs ${currentPage === pageNum
                                                   ? 'bg-[#442C08] text-white'
                                                   : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                                   }`}
                                             >
                                                {pageNum}
                                             </button>
                                          );
                                       } else if (
                                          (pageNum === 2 && currentPage > 3) ||
                                          (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                       ) {
                                          // Hiển thị dấu chấm lửng
                                          return <span key={pageNum} className="px-0.5 text-gray-400">...</span>;
                                       }
                                       return null;
                                    })}
                                 </div>

                                 <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center p-1.5 rounded ${currentPage === totalPages
                                       ? 'text-gray-300 cursor-not-allowed'
                                       : 'text-gray-600 hover:bg-gray-100'
                                       }`}
                                    aria-label="Trang kế tiếp"
                                 >
                                    <ChevronRight size={16} />
                                 </button>

                                 {/* Input trang - hiển thị trên màn hình lớn */}
                                 <div className="hidden sm:flex items-center ml-3 text-xs">
                                    <span className="mr-1">Trang:</span>
                                    <input
                                       type="number"
                                       min="1"
                                       max={totalPages}
                                       value={currentPage}
                                       onChange={goToPage}
                                       className="w-10 h-7 border border-gray-300 rounded px-1 text-center"
                                    />
                                    <span className="ml-1">/ {totalPages}</span>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Status update modal - cải tiến */}
         {showUpdateStatusModal && selectedOrder && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-lg p-5 w-full max-w-md'>
                  <div className='flex justify-between items-center mb-4'>
                     <h2 className='text-base font-medium'>Cập nhật trạng thái đơn hàng</h2>
                     <button
                        onClick={() => setShowUpdateStatusModal(false)}
                        className='text-gray-400 hover:text-gray-600 p-1.5'
                     >
                        <X size={20} />
                     </button>
                  </div>

                  <div className='space-y-4'>
                     <div className='bg-gray-50 p-3 rounded-md'>
                        <div className='flex justify-between items-center'>
                           <p className='text-sm text-gray-600'>Mã đơn hàng:</p>
                           <p className='text-sm font-medium'>{selectedOrder.order_code}</p>
                        </div>
                        <div className='flex justify-between items-center mt-2'>
                           <p className='text-sm text-gray-600'>Ngày đặt:</p>
                           <p className='text-sm'>{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <div className='flex justify-between items-center mt-2'>
                           <p className='text-sm text-gray-600'>Trạng thái hiện tại:</p>
                           <p
                              className={`text-sm ${orderStatusColors[selectedOrder.status]?.text || 'text-gray-700'
                                 }`}
                           >
                              {selectedOrder.status}
                           </p>
                        </div>

                        {/* Display cancellation reason if available */}
                        {selectedOrder.status === 'Đã huỷ' && selectedOrder.cancelReason && (
                           <div className='mt-2'>
                              <p className='text-sm text-gray-600'>Lý do huỷ đơn:</p>
                              <p className='text-sm text-red-600 mt-1'>{selectedOrder.cancelReason}</p>
                           </div>
                        )}
                     </div>

                     {/* Rest of the modal content */}
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                           Chọn trạng thái mới:
                        </label>
                        <select
                           value={newStatus}
                           onChange={(e) => setNewStatus(e.target.value)}
                           className='w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm'
                        >
                           <option value=''>-- Chọn trạng thái --</option>
                           {nextPossibleStatuses[selectedOrder.status]?.map((status) => (
                              <option key={status} value={status}>
                                 {status}
                              </option>
                           ))}
                        </select>

                        {/* Trạng thái tiếp theo gợi ý */}
                        <div className='mt-3'>
                           <p className='text-sm text-gray-500'>Các trạng thái tiếp theo:</p>
                           <div className='flex flex-wrap gap-2 mt-2'>
                              {nextPossibleStatuses[selectedOrder.status]?.map((status) => (
                                 <button
                                    key={status}
                                    className={`px-3 py-1.5 text-sm rounded-full border
                                      ${newStatus === status
                                          ? 'bg-[#442C08] text-white border-[#442C08]'
                                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                       }`}
                                    onClick={() => setNewStatus(status)}
                                 >
                                    {status}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className='flex justify-end gap-3 mt-5'>
                     <button
                        onClick={() => setShowUpdateStatusModal(false)}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm'
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handleUpdateOrderStatus}
                        disabled={!newStatus}
                        className={`px-4 py-2 rounded-md text-white flex items-center text-sm ${newStatus
                           ? 'bg-[#442C08] hover:bg-opacity-90'
                           : 'bg-gray-400 cursor-not-allowed'
                           }`}
                     >
                        <Check size={16} className='mr-2' />
                        Xác nhận
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Custom scrollbar styles */}
         <style jsx global>{`
            html, body {
               overflow-x: hidden; /* Ngăn chặn cuộn ngang toàn trang */
            }
            
            .no-scrollbar::-webkit-scrollbar {
               display: none;
            }
            .no-scrollbar {
               -ms-overflow-style: none;
               scrollbar-width: none;
            }
         
            .custom-scrollbar::-webkit-scrollbar {
               width: 4px;
               height: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
               background: #f1f1f1;
               border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
               background: #888;
               border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
               background: #555;
            }
         
            @media (max-width: 640px) {
               input[type='date'] {
                  min-height: 32px;
               }
               
               /* Tăng kích thước font cho mobile */
               .text-xs {
                  font-size: 0.8125rem !important; /* 13px */
               }
               
               .text-[10px] {
                  font-size: 0.75rem !important; /* 12px */
               }
               
               /* Nút trong bảng có kích thước phù hợp */
               .pagination-button {
                  padding: 0.25rem !important;
                  min-width: 1.75rem !important;
               }
            }
            
            /* Desktop & Tablet */
            @media (min-width: 641px) {
               .text-xs {
                  font-size: 0.875rem !important; /* 14px */
                  line-height: 1.25rem !important;
               }
               
               .text-[10px] {
                  font-size: 0.8125rem !important; /* 13px */
               }
               
               .text-sm {
                  font-size: 0.9375rem !important; /* 15px */
                  line-height: 1.4rem !important;
               }
            }
            
            /* Đảm bảo các container không bị tràn */
            .flex-1 {
               min-width: 0;
            }
            
            /* Sửa lỗi cho các container grid */
            .grid {
               min-width: 0;
            }
         `}</style>
      </div>
   );
}
