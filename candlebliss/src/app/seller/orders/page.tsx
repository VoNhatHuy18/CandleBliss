'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Toast from '@/app/components/ui/toast/Toast';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';

// Interfaces
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
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
   item: OrderItem[];
   __entity: string;
   user?: {
      id: number;
      name: string;
      phone: string;
      email: string;
   };
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
   'Đang chờ thanh toán': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Thanh toán thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
   'Thanh toán thành công': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
   },
   'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   'Đã đặt hàng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   'Đã giao hàng': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   'Đã huỷ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
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
   'Đổi trả hàng': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

// Danh sách các trạng thái đơn hàng có thể chuyển đến tiếp theo
const nextPossibleStatuses: Record<string, string[]> = {
   'Đơn hàng vừa được tạo': ['Đang chờ thanh toán', 'Đã huỷ'],
   'Đang chờ thanh toán': ['Thanh toán thành công', 'Thanh toán thất bại', 'Đang xử lý', 'Đã huỷ'],
   'Thanh toán thành công': ['Đang xử lý', 'Đã huỷ'],
   'Thanh toán thất bại': ['Đơn hàng vừa được tạo', 'Đã huỷ'],
   'Đang xử lý': ['Đang giao hàng', 'Đã huỷ'],
   'Đang giao hàng': ['Hoàn thành', 'Đổi trả hàng'],
   'Đã đặt hàng': ['Đang xử lý', 'Đã huỷ'],
   'Đổi trả hàng': ['Hoàn thành', 'Đang chờ hoàn tiền'],
   'Đang chờ hoàn tiền': ['Hoàn tiền thành công', 'Hoàn tiền thất bại'],
   'Hoàn tiền thành công': ['Hoàn thành'],
   'Hoàn tiền thất bại': ['Đổi trả hàng'],
   'Đã huỷ': [], // Không thể chuyển tiếp
   'Hoàn thành': [], // Không thể chuyển tiếp
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
   const [fetchedDetails, setFetchedDetails] = useState<Record<number, boolean>>({});
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
   const [newStatus, setNewStatus] = useState('');
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });
   const [sortOption, setSortOption] = useState('newest');

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

   // Load all orders
   const loadOrders = useCallback(async () => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            window.location.href = '/seller/signin';
            return;
         }

         const response = await fetch('http://68.183.226.198:3000/api/orders/all', {
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
         setFilteredOrders(sortedOrders);

         if (sortedOrders.length === 0) {
            showToastMessage('Không có đơn hàng nào', 'info');
         }
      } catch (error) {
         console.error('Error loading orders:', error);
         showToastMessage('Không thể tải danh sách đơn hàng', 'error');
      } finally {
         setLoading(false);
      }
   }, [showToastMessage]);

   // Fetch additional product details
   const fetchProductDetails = useCallback(
      async (orders: Order[]) => {
         const token = localStorage.getItem('token');
         if (!token) return;

         let hasUpdates = false;
         const updatedOrders = [...orders];

         for (const order of updatedOrders) {
            // Fetch user information if not already present
            if (!order.user && order.user_id) {
               try {
                  const userResponse = await fetch(
                     `http://68.183.226.198:3000/api/v1/users/${order.user_id}`,
                     {
                        headers: { Authorization: `Bearer ${token}` },
                     },
                  );

                  if (userResponse.ok) {
                     const userData = await userResponse.json();
                     order.user = {
                        id: userData.id,
                        // Xử lý tên đầy đủ từ firstName và lastName
                        name:
                           userData.firstName && userData.lastName
                              ? `${userData.firstName} ${userData.lastName}`
                              : userData.firstName || userData.lastName || 'Không có tên',
                        phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                        email: userData.email || 'Không có email',
                     };
                     hasUpdates = true;
                  }
               } catch (error) {
                  console.error(`Failed to fetch user info for user ID ${order.user_id}:`, error);
               }
            }

            // Fetch product details for each item
            for (const item of order.item) {
               if (!fetchedDetails[item.product_detail_id] && item.product_detail_id) {
                  try {
                     const detailResponse = await fetch(
                        `http://68.183.226.198:3000/api/product-details/${item.product_detail_id}`,
                        {
                           headers: {
                              Authorization: `Bearer ${token}`,
                           },
                        },
                     );

                     if (detailResponse.ok) {
                        const detailData = await detailResponse.json();
                        item.productDetailData = detailData;
                        hasUpdates = true;

                        setFetchedDetails((prev) => ({
                           ...prev,
                           [item.product_detail_id]: true,
                        }));

                        // Fetch product information
                        if (detailData.product_id) {
                           try {
                              const productResponse = await fetch(
                                 `http://68.183.226.198:3000/api/products/${detailData.product_id}`,
                                 {
                                    headers: {
                                       Authorization: `Bearer ${token}`,
                                    },
                                 },
                              );

                              if (productResponse.ok) {
                                 const productData = await productResponse.json();

                                 if (!item.product) {
                                    item.product = {
                                       id: productData.id,
                                       name: productData.name,
                                       images: productData.images || [],
                                    };
                                 }

                                 const matchingDetail = productData.details?.find(
                                    (detail: { id: number }) =>
                                       detail.id === item.product_detail_id,
                                 );

                                 if (
                                    matchingDetail &&
                                    matchingDetail.images &&
                                    matchingDetail.images.length > 0
                                 ) {
                                    if (!item.product_detail) {
                                       item.product_detail = {
                                          id: matchingDetail.id,
                                          size: matchingDetail.size,
                                          type: matchingDetail.type,
                                          values: matchingDetail.values,
                                          images: matchingDetail.images,
                                       };
                                    } else if (
                                       !item.product_detail.images ||
                                       item.product_detail.images.length === 0
                                    ) {
                                       item.product_detail.images = matchingDetail.images;
                                    }
                                 }

                                 hasUpdates = true;
                              }
                           } catch (error) {
                              console.error(
                                 `Failed to fetch product for product_id ${detailData.product_id}:`,
                                 error,
                              );
                           }
                        }
                     }
                  } catch (error) {
                     console.error(
                        `Failed to fetch details for product_detail_id ${item.product_detail_id}:`,
                        error,
                     );
                  }
               }
            }
         }

         if (hasUpdates) {
            setOrders(updatedOrders);
            applyFilters(updatedOrders); // Apply current filters to the updated data
         }
      },
      [fetchedDetails],
   );

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

   // Apply all filters to the orders
   const applyFilters = useCallback(
      (ordersList: Order[] = orders) => {
         let result = [...ordersList];

         // Apply status filter
         if (statusFilter) {
            result = result.filter((order) => order.status === statusFilter);
         }

         // Apply search filter (search by order code, address, user name, etc.)
         if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            result = result.filter(
               (order) =>
                  order.order_code.toLowerCase().includes(term) ||
                  order.address.toLowerCase().includes(term) ||
                  order.user?.name?.toLowerCase().includes(term) ||
                  order.user?.phone?.includes(term) ||
                  order.user?.email?.toLowerCase().includes(term),
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

         setFilteredOrders(result);
      },
      [orders, statusFilter, searchTerm, dateRange, priceRange, sortOrders],
   );

   // Initialize data
   useEffect(() => {
      const init = async () => {
         try {
            setLoading(true);
            await loadOrders();
         } catch (error) {
            console.error('Error initializing data:', error);
            showToastMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
         }
      };

      init();
   }, [loadOrders, showToastMessage]);

   // Fetch additional details
   useEffect(() => {
      if (orders.length > 0) {
         fetchProductDetails(orders);
      }
   }, [orders, fetchProductDetails]);

   // Apply filters when filter conditions change
   useEffect(() => {
      applyFilters();
   }, [statusFilter, searchTerm, dateRange, priceRange, applyFilters]);


   // Get payment method icon
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
            `http://68.183.226.198:3000/api/orders/${selectedOrder.id}/status?status=${encodedStatus}`,
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
                           onClick={() => loadOrders()}
                           className='flex-1 sm:flex-none bg-[#E8E2D9] hover:bg-[#d6cfc6] text-[#442C08] px-2 sm:px-3 py-1.5 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm'
                        >
                           <RefreshCw size={14} className='mr-1.5' />
                           Làm mới
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
               <div className='bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-4'>
                  <div className='flex flex-col sm:flex-row gap-2 sm:items-center'>
                     <div className='flex-1 w-full'>
                        <div className='relative'>
                           <input
                              type='text'
                              placeholder='Tìm kiếm theo mã đơn, khách hàng, địa chỉ...'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className='w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] focus:border-[#442C08] text-xs sm:text-sm'
                           />
                           <Search
                              size={16}
                              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                           />
                        </div>
                     </div>

                     <div className='flex gap-2'>
                        {/* Sort dropdown - thêm mới */}
                        <div className='relative'>
                           <select
                              value={sortOption}
                              onChange={(e) => setSortOption(e.target.value)}
                              className='appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#442C08]'
                           >
                              <option value='newest'>Mới nhất</option>
                              <option value='oldest'>Cũ nhất</option>
                              <option value='price-high'>Giá cao nhất</option>
                              <option value='price-low'>Giá thấp nhất</option>
                           </select>
                           <ChevronDown
                              className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none'
                              size={16}
                           />
                        </div>

                        <button
                           onClick={() => setShowFilterMenu(!showFilterMenu)}
                           className='flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm'
                        >
                           <Filter size={16} className='mr-2' />
                           <span>Bộ lọc</span>
                           {showFilterMenu ? (
                              <ChevronUp size={16} className='ml-2' />
                           ) : (
                              <ChevronDown size={16} className='ml-2' />
                           )}
                        </button>
                     </div>
                  </div>

                  {showFilterMenu && (
                     <div className='mt-3 pt-3 border-t border-gray-200'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                           {/* Status filter */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1'>
                                 <Tag size={14} className='mr-1.5' />
                                 <label className='text-xs font-medium'>Trạng thái đơn hàng</label>
                              </div>
                              <select
                                 value={statusFilter || ''}
                                 onChange={(e) => setStatusFilter(e.target.value || null)}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] focus:border-[#442C08] text-xs'
                              >
                                 <option value=''>Tất cả trạng thái</option>
                                 {Object.keys(orderStatusColors).map((status) => (
                                    <option key={status} value={status}>
                                       {status}
                                    </option>
                                 ))}
                              </select>
                           </div>

                           {/* Date range filter */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1'>
                                 <Calendar size={14} className='mr-1.5' />
                                 <label className='text-xs font-medium'>Khoảng thời gian</label>
                              </div>
                              <div className='grid grid-cols-2 gap-2'>
                                 <input
                                    type='date'
                                    value={dateRange.from}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, from: e.target.value })
                                    }
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-xs'
                                 />
                                 <input
                                    type='date'
                                    value={dateRange.to}
                                    onChange={(e) =>
                                       setDateRange({ ...dateRange, to: e.target.value })
                                    }
                                    className='w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-xs'
                                 />
                              </div>
                           </div>

                           {/* Price range filter */}
                           <div>
                              <div className='flex items-center text-gray-700 mb-1'>
                                 <DollarSign size={14} className='mr-1.5' />
                                 <label className='text-xs font-medium'>Giá trị đơn hàng</label>
                              </div>
                              <div className='flex items-center gap-2'>
                                 <input
                                    type='number'
                                    placeholder='Tối thiểu'
                                    value={priceRange.min}
                                    onChange={(e) =>
                                       setPriceRange({ ...priceRange, min: e.target.value })
                                    }
                                    className='w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-xs'
                                 />
                                 <span>-</span>
                                 <input
                                    type='number'
                                    placeholder='Tối đa'
                                    value={priceRange.max}
                                    onChange={(e) =>
                                       setPriceRange({ ...priceRange, max: e.target.value })
                                    }
                                    className='w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-xs'
                                 />
                              </div>
                           </div>

                           {/* Actions */}
                           <div className='flex items-end'>
                              <div className='grid grid-cols-2 gap-2 w-full'>
                                 <button
                                    onClick={resetFilters}
                                    className='px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-xs'
                                 >
                                    Xoá bộ lọc
                                 </button>
                                 <button
                                    onClick={() => {
                                       applyFilters();
                                       setShowFilterMenu(false);
                                    }}
                                    className='px-3 py-2 bg-[#442C08] text-white rounded-md hover:bg-[#5d3a0a] transition-colors text-xs'
                                 >
                                    Áp dụng
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Status tabs - cải tiến */}
               <div className='bg-white rounded-lg shadow-sm border border-gray-100 px-2 py-1 mb-4'>
                  <div className='flex overflow-x-auto gap-2 no-scrollbar'>
                     <button
                        onClick={() => setStatusFilter(null)}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${!statusFilter
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Tất cả đơn hàng
                     </button>

                     {/* Nhóm theo category để làm gọn */}
                     <button
                        onClick={() => setStatusFilter('Đơn hàng vừa được tạo')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đơn hàng vừa được tạo'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đơn mới
                     </button>

                     <button
                        onClick={() => setStatusFilter('Đang xử lý')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đang xử lý'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đang xử lý
                     </button>

                     <button
                        onClick={() => setStatusFilter('Đang giao hàng')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đang giao hàng'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đang giao hàng
                     </button>

                     <button
                        onClick={() => setStatusFilter('Đã giao hàng')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đã giao hàng'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đã giao hàng
                     </button>

                     <button
                        onClick={() => setStatusFilter('Hoàn thành')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Hoàn thành'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Hoàn thành
                     </button>

                     <button
                        onClick={() => setStatusFilter('Đã huỷ')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đã huỷ'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đã hủy
                     </button>

                     <button
                        onClick={() => setStatusFilter('Đổi trả hàng')}
                        className={`px-3 py-1.5 whitespace-nowrap transition-colors text-xs ${statusFilter === 'Đổi trả hàng'
                           ? 'bg-[#442C08] text-white rounded-md font-medium'
                           : 'text-gray-700 hover:text-[#442C08]'
                           }`}
                     >
                        Đổi/Trả
                     </button>
                  </div>
               </div>

               {/* Results count and pagination placeholder - thêm mới */}
               <div className='flex justify-between items-center mb-4'>
                  <p className='text-xs text-gray-500'>
                     Hiển thị {filteredOrders.length} đơn hàng{' '}
                     {statusFilter ? `(trạng thái: ${statusFilter})` : ''}
                  </p>
               </div>

               {/* Orders list */}
               {filteredOrders.length === 0 ? (
                  <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center'>
                     <div className='flex flex-col items-center'>
                        <div className='bg-gray-100 p-4 rounded-full mb-3'>
                           <Package size={24} className='text-gray-400' />
                        </div>
                        <h3 className='text-base font-medium mb-1'>Không có đơn hàng nào</h3>
                        <p className='text-xs text-gray-500 mb-3 max-w-md'>
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
                                 className='bg-[#442C08] text-white py-1.5 px-3 rounded-md hover:bg-[#5d3a0a] transition-colors text-xs'
                              >
                                 Xoá bộ lọc
                              </button>
                           )}
                     </div>
                  </div>
               ) : (
                  <div className='space-y-3'>
                     {filteredOrders.map((order) => (
                        <div
                           key={order.id}
                           className='bg-white rounded-lg shadow-sm border border-gray-100 hover:border-[#E8E2D9] transition-colors overflow-hidden'
                        >
                           {/* Order header - layout mới */}
                           <div className='p-3 border-b border-gray-100 flex justify-between items-center'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                 <p className='font-medium text-xs'>#{order.order_code}</p>
                                 <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${orderStatusColors[order.status]?.bg || 'bg-gray-50'
                                       } ${orderStatusColors[order.status]?.text || 'text-gray-700'
                                       } border ${orderStatusColors[order.status]?.border || 'border-gray-200'
                                       }`}
                                 >
                                    {order.status}
                                 </span>
                                 <span className='text-xs text-gray-500'>
                                    {formatDate(order.createdAt)}
                                 </span>
                              </div>

                              <div className='flex items-center gap-2'>
                                 {order.method_payment && (
                                    <div className='hidden sm:flex items-center bg-gray-50 px-2 py-0.5 rounded-md'>
                                       <Image
                                          src={getPaymentMethodIcon(order.method_payment)}
                                          alt={order.method_payment}
                                          width={12}
                                          height={12}
                                          className='mr-1'
                                       />
                                       <span className='text-xs text-gray-700'>
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

                                 <div className='text-sm font-medium text-[#442C08]'>
                                    {formatPrice(order.total_price)}
                                 </div>
                              </div>
                           </div>

                           {/* Customer section */}
                           <div className='p-3 bg-gray-50 border-b border-gray-100'>
                              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                 <div>
                                    <p className='text-[10px] text-gray-500'>Khách hàng</p>
                                    <p className='text-xs truncate'>
                                       {order.user?.name || 'Không có tên'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className='text-[10px] text-gray-500'>Điện thoại</p>
                                    <p className='text-xs truncate'>
                                       {order.user?.phone || 'Không có SĐT'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className='text-[10px] text-gray-500'>Email</p>
                                    <p className='text-xs truncate'>
                                       {order.user?.email || 'Không có email'}
                                    </p>
                                 </div>
                                 <div>
                                    <p className='text-[10px] text-gray-500'>Địa chỉ</p>
                                    <p className='text-xs truncate'>{order.address}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Order items - cải tiến */}
                           <div className='p-3'>
                              <div className='mb-1.5 flex justify-between'>
                                 <p className='text-[15px] text-gray-500'>
                                    Sản phẩm ({order.item.length})
                                 </p>
                                 <p className='text-[15px] text-gray-500'>
                                    Tổng SL: {order.total_quantity}
                                 </p>
                              </div>

                              <div className='space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar'>
                                 {order.item.map((item) => (
                                    <div key={item.id} className='flex items-center gap-2'>
                                       <div className='relative w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
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
                                             sizes='32px'
                                             style={{ objectFit: 'contain' }}
                                             className='p-1'
                                          />
                                       </div>
                                       <div className='flex-1 min-w-0'>
                                          <p className='text-xs font-medium line-clamp-1'>
                                             {item.product?.name ||
                                                `Sản phẩm #${item.product_detail_id}`}
                                          </p>
                                          <div className='flex justify-between'>
                                             <span className='text-[10px] text-gray-500'>
                                                {(item.productDetailData?.size ||
                                                   item.product_detail?.size) &&
                                                   `${item.productDetailData?.size ||
                                                   item.product_detail?.size
                                                   } - `}
                                                {item.productDetailData?.values ||
                                                   item.product_detail?.values}
                                             </span>
                                             <span className='text-[10px] text-gray-500'>
                                                {formatPrice(item.unit_price)} × {item.quantity}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Order summary and actions */}
                           <div className='flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-50 p-3 border-t border-gray-100'>
                              {/* Summary */}
                              <div className='w-full sm:w-auto'>
                                 <div className='flex items-center justify-between sm:justify-start sm:gap-4'>
                                    <div>
                                       <span className='text-[10px] text-gray-500 block'>
                                          Tổng tiền:
                                       </span>
                                       <span className='text-sm font-medium text-[#442C08]'>
                                          {formatPrice(order.total_price)}
                                       </span>
                                    </div>

                                    <div>
                                       <span className='text-[10px] text-gray-500 block'>
                                          Khách hàng:
                                       </span>
                                       <span className='text-xs truncate max-w-[100px] inline-block'>
                                          {order.user?.name || 'N/A'}
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              {/* Actions */}
                              <div className='flex gap-2 w-full sm:w-auto'>
                                 <Link
                                    href={`/seller/orders/${order.id}`}
                                    className='flex-1 sm:flex-none text-center text-xs border border-[#442C08] bg-white text-[#442C08] hover:bg-gray-50 px-2 py-1.5 rounded-md flex items-center justify-center'
                                 >
                                    <ExternalLink size={12} className='mr-1' />
                                    Chi tiết
                                 </Link>

                                 <button
                                    onClick={() => openUpdateStatusModal(order)}
                                    className='flex-1 sm:flex-none text-center text-xs bg-[#442C08] text-white hover:bg-opacity-90 px-2 py-1.5 rounded-md flex items-center justify-center'
                                 >
                                    <TruckIcon size={12} className='mr-1' />
                                    {order.status === 'Đơn hàng vừa được tạo'
                                       ? 'Xử lý'
                                       : 'Cập nhật'}
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Status update modal - cải tiến */}
         {showUpdateStatusModal && selectedOrder && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-lg p-4 w-full max-w-sm'>
                  <div className='flex justify-between items-center mb-4'>
                     <h2 className='text-sm font-medium'>Cập nhật trạng thái đơn hàng</h2>
                     <button
                        onClick={() => setShowUpdateStatusModal(false)}
                        className='text-gray-400 hover:text-gray-600 p-1'
                     >
                        <X size={16} />
                     </button>
                  </div>

                  <div className='space-y-4'>
                     <div className='bg-gray-50 p-2 rounded-md'>
                        <div className='flex justify-between items-center'>
                           <p className='text-xs text-gray-600'>Mã đơn hàng:</p>
                           <p className='text-xs font-medium'>{selectedOrder.order_code}</p>
                        </div>
                        <div className='flex justify-between items-center mt-1'>
                           <p className='text-xs text-gray-600'>Ngày đặt:</p>
                           <p className='text-xs'>{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <div className='flex justify-between items-center mt-1'>
                           <p className='text-xs text-gray-600'>Trạng thái hiện tại:</p>
                           <p
                              className={`text-xs ${orderStatusColors[selectedOrder.status]?.text || 'text-gray-700'
                                 }`}
                           >
                              {selectedOrder.status}
                           </p>
                        </div>
                     </div>

                     <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1'>
                           Chọn trạng thái mới:
                        </label>
                        <select
                           value={newStatus}
                           onChange={(e) => setNewStatus(e.target.value)}
                           className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-xs'
                        >
                           <option value=''>-- Chọn trạng thái --</option>
                           {nextPossibleStatuses[selectedOrder.status]?.map((status) => (
                              <option key={status} value={status}>
                                 {status}
                              </option>
                           ))}
                        </select>

                        {/* Trạng thái tiếp theo gợi ý */}
                        <div className='mt-2'>
                           <p className='text-[10px] text-gray-500'>Các trạng thái tiếp theo:</p>
                           <div className='flex flex-wrap gap-1 mt-1'>
                              {nextPossibleStatuses[selectedOrder.status]?.map((status) => (
                                 <button
                                    key={status}
                                    className={`px-2 py-0.5 text-[10px] rounded-full border
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

                  <div className='flex justify-end gap-2 mt-4'>
                     <button
                        onClick={() => setShowUpdateStatusModal(false)}
                        className='px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs'
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handleUpdateOrderStatus}
                        disabled={!newStatus}
                        className={`px-3 py-2 rounded-md text-white flex items-center text-xs ${newStatus
                           ? 'bg-[#442C08] hover:bg-opacity-90'
                           : 'bg-gray-400 cursor-not-allowed'
                           }`}
                     >
                        <Check size={12} className='mr-1.5' />
                        Xác nhận
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Custom scrollbar styles */}
         <style jsx global>{`
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
            }
         `}</style>
      </div>
   );
}
