'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Package, ShoppingBag, CreditCard, Users } from 'lucide-react';
import { HOST } from '@/app/constants/api';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/app/components/StarRating';

// Interfaces
interface User {
   id: number;
   name: string;
   phone: string;
   email: string;
}

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
   voucher_id: string | null;
   method_payment: string;
   createdAt: string;
   updatedAt: string;
   item: OrderItem[];
   __entity: string;
   user?: User;
}

// Format currency helper function
const formatPrice = (price: string | number): string => {
   const numPrice = typeof price === 'string' ? parseFloat(price) : price;
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(numPrice);
};

// Order status colors
const orderStatusColors: Record<string, string> = {
   'Đơn hàng vừa được tạo': 'bg-blue-100 text-blue-800',
   'Đang chờ thanh toán': 'bg-blue-100 text-blue-800',
   'Thanh toán thất bại': 'bg-red-100 text-red-800',
   'Thanh toán thành công': 'bg-green-100 text-green-800',
   'Đang xử lý': 'bg-yellow-100 text-yellow-800',
   'Đang giao hàng': 'bg-purple-100 text-purple-800',
   'Đã đặt hàng': 'bg-blue-100 text-blue-800',
   'Đã giao hàng': 'bg-green-100 text-green-800',
   'Hoàn thành': 'bg-green-100 text-green-800',
   'Đã huỷ': 'bg-red-100 text-red-800',
   'Đang chờ hoàn tiền': 'bg-yellow-100 text-yellow-800',
   'Hoàn tiền thành công': 'bg-green-100 text-green-800',
   'Hoàn tiền thất bại': 'bg-red-100 text-red-800',
   'Đổi trả hàng': 'bg-yellow-100 text-yellow-800',
};

export default function Dashboard() {
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   // Sử dụng useRef thay vì useState để không trigger re-render
   const fetchedUserIdsRef = useRef<Record<number, boolean>>({});
   // State này vẫn cần giữ lại để tương thích với code khác
   const [fetchedUserIds, setFetchedUserIds] = useState<Record<number, boolean>>({});
   const [stats, setStats] = useState({
      totalRevenue: '0',
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
   });

   // Thêm state cho top-rated products
   const [topRatedProducts, setTopRatedProducts] = useState<Array<{
      id: number;
      name: string;
      imageUrl: string;
      rating: number;
      reviewCount: number;
      soldCount: number;
   }>>([]);

   // Fetch user data
   const fetchUserData = useCallback(async (orders: Order[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      let hasUpdates = false;
      const updatedOrders = [...orders];

      for (const order of updatedOrders) {
         if (!order.user && order.user_id && !fetchedUserIdsRef.current[order.user_id]) {
            try {
               const userResponse = await fetch(
                  `${HOST}/api/v1/users/${order.user_id}`,
                  {
                     headers: { Authorization: `Bearer ${token}` },
                  }
               );

               if (userResponse.ok) {
                  const userData = await userResponse.json();
                  order.user = {
                     id: userData.id,
                     name:
                        userData.firstName && userData.lastName
                           ? `${userData.firstName} ${userData.lastName}`
                           : userData.firstName || userData.lastName || 'Không có tên',
                     phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                     email: userData.email || 'Không có email',
                  };
                  hasUpdates = true;

                  // Cập nhật vào ref và state
                  fetchedUserIdsRef.current[order.user_id] = true;
                  setFetchedUserIds(prev => ({
                     ...prev,
                     [order.user_id]: true,
                  }));
               }
            } catch (error) {
               console.error(`Failed to fetch user info for user ID ${order.user_id}:`, error);
            }
         }
      }

      if (hasUpdates) {
         setOrders(updatedOrders);
      }
   }, []); // Không phụ thuộc vào fetchedUserIds

   // Thêm ref để đánh dấu đã fetch orders
   const ordersFetchedRef = useRef(false);

   // Fetch data from API
   useEffect(() => {
      // Kiểm tra nếu đã fetch thì không fetch lại
      if (ordersFetchedRef.current) return;

      const fetchOrders = async () => {
         try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
               console.error('No authentication token found');
               return;
            }

            // Đánh dấu đã fetch orders
            ordersFetchedRef.current = true;

            const response = await fetch(`${HOST}/api/orders/all`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            // Sort orders by date (newest first)
            const sortedOrders = data.sort(
               (a: Order, b: Order) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

            setOrders(sortedOrders);

            // Calculate stats
            calculateStats(sortedOrders);
         } catch (error) {
            console.error('Error fetching orders:', error);
            // Reset flag nếu có lỗi để có thể thử lại
            ordersFetchedRef.current = false;
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, []);

   // Thêm useRef để đánh dấu đã fetch topRatedProducts
   const topRatedProductsFetchedRef = useRef(false);

   // Thêm useEffect để fetch sản phẩm có rating cao
   useEffect(() => {
      // Thêm flag để chỉ fetch một lần
      if (topRatedProductsFetchedRef.current) return;

      const fetchTopRatedProducts = async () => {
         try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Đánh dấu đã bắt đầu fetch
            topRatedProductsFetchedRef.current = true;

            // Fetch tất cả sản phẩm
            const productsResponse = await fetch(`${HOST}/api/products`);
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData = await productsResponse.json();

            // Chuẩn hóa danh sách sản phẩm
            const normalizedProducts = productsData.map((product: { id: number; name: string; images: Array<{ path: string }> }) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // Lấy rating cho tất cả sản phẩm
            const productIds = normalizedProducts.map((p: { id: number; name: string; images: Array<{ path: string }> }) => p.id);
            const ratingsPromises = productIds.map((id: number) =>
               fetch(`${HOST}/api/rating/get-by-product`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ product_id: id }),
               }).then(res => res.ok ? res.json() : [])
            );

            const ratingsResults = await Promise.all(ratingsPromises);

            // Xử lý kết quả ratings và kết hợp với products
            const productsWithRatings = normalizedProducts.map((product: { id: number; name: string; images: Array<{ path: string }> }, index: number) => {
               const productRatings = ratingsResults[index];
               let avgRating = 0;
               let reviewCount = 0;

               if (Array.isArray(productRatings) && productRatings.length > 0) {
                  const totalRating = productRatings.reduce(
                     (sum, item) => sum + (item.rating || item.avg_rating || 0),
                     0
                  );
                  avgRating = totalRating / productRatings.length;
                  reviewCount = productRatings.length;
               }

               return {
                  id: product.id,
                  name: product.name,
                  imageUrl: product.images && product.images.length > 0
                     ? product.images[0].path
                     : '/images/placeholder.jpg',
                  rating: avgRating,
                  reviewCount: reviewCount,
                  soldCount: Math.floor(Math.random() * 150) + 20 // Placeholder cho số lượng đã bán
               };
            });

            // Lọc sản phẩm có rating từ 4-5 sao và sắp xếp theo rating giảm dần
            const topRated = productsWithRatings
               .filter((p: { rating: number }) => p.rating >= 4 && p.rating <= 5)
               .sort((a: { rating: number; reviewCount: number }, b: { rating: number; reviewCount: number }) => {
                  // Sắp xếp theo rating trước
                  if (b.rating !== a.rating) {
                     return b.rating - a.rating;
                  }
                  // Nếu rating bằng nhau, sắp xếp theo số lượng đánh giá
                  return b.reviewCount - a.reviewCount;
               })
               .slice(0, 4); // Lấy 4 sản phẩm đầu tiên

            setTopRatedProducts(topRated);
         } catch (error) {
            console.error('Error fetching top rated products:', error);
            // Reset flag nếu có lỗi để có thể thử lại
            topRatedProductsFetchedRef.current = false;
         }
      };

      fetchTopRatedProducts();
   }, []);

   // Fetch user data when orders change
   useEffect(() => {
      if (orders.length > 0) {
         // Tạo một biến mới để lưu trữ fetchedUserIds và orders
         const currentFetchedUserIds = fetchedUserIds;
         const currentOrders = orders;

         // Kiểm tra xem có order nào cần fetch user không
         const needsFetch = currentOrders.some(
            order => !order.user && order.user_id && !currentFetchedUserIds[order.user_id]
         );

         if (needsFetch) {
            fetchUserData(currentOrders);
         }
      }
   }, [orders, fetchUserData]);

   // Thêm một useEffect riêng để fetch tất cả thông tin khách hàng khi trang tải xong
   useEffect(() => {
      // Chỉ chạy khi orders đã được tải và không còn loading
      if (orders.length > 0 && !loading) {
         const fetchAllUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Lấy danh sách user_id duy nhất từ tất cả orders
            const uniqueUserIds = [...new Set(
               orders
                  .filter(order => order.user_id && !order.user)
                  .map(order => order.user_id)
            )];

            if (uniqueUserIds.length === 0) return;

            // Tạo bản sao orders hiện tại
            const updatedOrders = [...orders];
            let hasUpdates = false;

            // Fetch thông tin cho từng user_id
            for (const userId of uniqueUserIds) {
               // Kiểm tra xem đã fetch thông tin chưa
               if (fetchedUserIdsRef.current[userId]) continue;

               try {
                  const userResponse = await fetch(
                     `${HOST}/api/v1/users/${userId}`,
                     {
                        headers: { Authorization: `Bearer ${token}` },
                     }
                  );

                  if (userResponse.ok) {
                     const userData = await userResponse.json();

                     // Tạo dữ liệu người dùng
                     const userInfo = {
                        id: userData.id,
                        name: userData.firstName && userData.lastName
                           ? `${userData.firstName} ${userData.lastName}`
                           : userData.firstName || userData.lastName || `Khách hàng #${userId}`,
                        phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                        email: userData.email || 'Không có email',
                     };

                     // Cập nhật thông tin user cho tất cả order có user_id tương ứng
                     updatedOrders.forEach(order => {
                        if (order.user_id === userId) {
                           order.user = userInfo;
                        }
                     });

                     // Đánh dấu đã fetch thông tin user
                     fetchedUserIdsRef.current[userId] = true;
                     hasUpdates = true;
                  }
               } catch (error) {
                  console.error(`Không thể lấy thông tin khách hàng ID ${userId}:`, error);
               }
            }

            if (hasUpdates) {
               setOrders(updatedOrders);
            }
         };

         fetchAllUserData();
      }
   }, [orders, loading]);

   // Thêm ref để kiểm soát việc fetch user
   const allUsersFetchingRef = useRef(false);
   const lastUserFetchTimeRef = useRef(0);

   // Thay thế useEffect hiện tại để fetch user data khi orders change
   useEffect(() => {
      // Chỉ chạy khi có orders và không đang loading
      if (orders.length > 0 && !loading) {
         // Kiểm tra xem có đang fetch users không
         if (allUsersFetchingRef.current) return;

         // Giới hạn tần suất fetch (ít nhất 5 giây giữa các lần fetch)
         const now = Date.now();
         if (now - lastUserFetchTimeRef.current < 5000) return;

         // Kiểm tra xem có order nào cần fetch thông tin user không
         const needsFetch = orders.some(
            order => !order.user && order.user_id && !fetchedUserIdsRef.current[order.user_id]
         );

         if (needsFetch) {
            allUsersFetchingRef.current = true;
            lastUserFetchTimeRef.current = now;

            const fetchAllMissingUsers = async () => {
               try {
                  const token = localStorage.getItem('token');
                  if (!token) return;

                  // Lấy danh sách user_id duy nhất từ tất cả orders chưa có thông tin
                  const uniqueUserIds = [...new Set(
                     orders
                        .filter(order => !order.user && order.user_id && !fetchedUserIdsRef.current[order.user_id])
                        .map(order => order.user_id)
                  )];

                  if (uniqueUserIds.length === 0) return;

                  // Tạo bản sao orders hiện tại
                  const updatedOrders = [...orders];
                  let hasUpdates = false;

                  // Fetch thông tin cho từng user_id
                  for (const userId of uniqueUserIds) {
                     try {
                        const userResponse = await fetch(
                           `${HOST}/api/v1/users/${userId}`,
                           {
                              headers: { Authorization: `Bearer ${token}` },
                           }
                        );

                        if (userResponse.ok) {
                           const userData = await userResponse.json();

                           // Chuẩn bị dữ liệu người dùng
                           const userInfo = {
                              id: userData.id,
                              name: userData.firstName && userData.lastName
                                 ? `${userData.firstName} ${userData.lastName}`
                                 : userData.firstName || userData.lastName || `Khách hàng #${userId}`,
                              phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                              email: userData.email || 'Không có email',
                           };

                           // Cập nhật thông tin user cho tất cả order có user_id tương ứng
                           updatedOrders.forEach(order => {
                              if (order.user_id === userId) {
                                 order.user = userInfo;
                              }
                           });

                           // Đánh dấu đã fetch thông tin user
                           fetchedUserIdsRef.current[userId] = true;
                           hasUpdates = true;
                        }
                     } catch (error) {
                        console.error(`Không thể lấy thông tin khách hàng ID ${userId}:`, error);
                     }
                  }

                  if (hasUpdates) {
                     setOrders(updatedOrders);
                  }
               } finally {
                  allUsersFetchingRef.current = false;
               }
            };

            fetchAllMissingUsers();
         }
      }
   }, [orders, loading]);

   // Thêm ref để đánh dấu đã fetch users lần đầu
   const initialUsersFetchedRef = useRef(false);

   // Thêm useEffect để fetch tất cả user data ngay khi trang tải xong
   useEffect(() => {
      // Chỉ chạy một lần sau khi orders đã được tải
      if (orders.length > 0 && !loading && !initialUsersFetchedRef.current) {
         initialUsersFetchedRef.current = true;

         const fetchInitialUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Lấy danh sách user_id duy nhất từ tất cả orders
            const uniqueUserIds = [...new Set(
               orders
                  .filter(order => order.user_id)
                  .map(order => order.user_id)
            )];

            if (uniqueUserIds.length === 0) return;

            // Tạo bản sao orders hiện tại
            const updatedOrders = [...orders];
            let hasUpdates = false;

            // Fetch thông tin cho từng user_id
            for (const userId of uniqueUserIds) {
               // Kiểm tra xem đã fetch thông tin chưa
               if (fetchedUserIdsRef.current[userId]) continue;

               try {
                  const userResponse = await fetch(
                     `${HOST}/api/v1/users/${userId}`,
                     {
                        headers: { Authorization: `Bearer ${token}` },
                     }
                  );

                  if (userResponse.ok) {
                     const userData = await userResponse.json();

                     // Tạo dữ liệu người dùng
                     const userInfo = {
                        id: userData.id,
                        name: userData.firstName && userData.lastName
                           ? `${userData.firstName} ${userData.lastName}`
                           : userData.firstName || userData.lastName || `Khách hàng #${userId}`,
                        phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                        email: userData.email || 'Không có email',
                     };

                     // Cập nhật thông tin user cho tất cả order có user_id tương ứng
                     updatedOrders.forEach(order => {
                        if (order.user_id === userId) {
                           order.user = userInfo;
                        }
                     });

                     // Đánh dấu đã fetch thông tin user
                     fetchedUserIdsRef.current[userId] = true;
                     hasUpdates = true;
                  }
               } catch (error) {
                  console.error(`Không thể lấy thông tin khách hàng ID ${userId}:`, error);
               }
            }

            if (hasUpdates) {
               setOrders(updatedOrders);
            }
         };

         fetchInitialUserData();
      }
   }, [orders, loading]);

   // Calculate dashboard statistics
   const calculateStats = (orders: Order[]) => {
      let revenue = 0;
      const customers = new Set();
      let productCount = 0;

      orders.forEach((order) => {
         // Only count completed orders for revenue
         if (order.status === 'Hoàn thành' || order.status === 'Đã giao hàng') {
            revenue += parseFloat(order.total_price);
         }

         customers.add(order.user_id);

         // Count total products
         order.item?.forEach((item) => {
            productCount += item.quantity;
         });
      });

      setStats({
         totalRevenue: revenue.toString(),
         totalProducts: productCount,
         totalOrders: orders.length,
         totalCustomers: customers.size,
      });
   };

   // Format date for display
   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   };

   // Display appropriate status badge
   const renderStatusBadge = (status: string) => {
      const colorClass = orderStatusColors[status] || 'bg-gray-100 text-gray-800';
      return (
         <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
         >
            {status}
         </span>
      );
   };

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Sidebar */}
         <MenuSideBar />

         <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Header */}
            <Header />

            {/* Dashboard Content */}
            <main className='flex-1 p-6 overflow-auto'>
               <div className='mb-6'>
                  <h2 className='text-xl font-semibold text-gray-800'>Tổng Quan</h2>
                  <div className='flex justify-between items-center mt-2'>
                     <div>
                        <span className='text-sm text-gray-500'>30 ngày gần nhất</span>
                     </div>
                  </div>
               </div>

               {/* Stats Cards */}
               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                  <div className='bg-purple-100 rounded-lg p-4 shadow-sm'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-gray-600 text-sm font-medium'>Tổng doanh thu</h3>
                           <p className='text-gray-800 font-semibold mt-1'>
                              {formatPrice(stats.totalRevenue)}
                           </p>
                        </div>
                        <div className='p-2 bg-purple-500 text-white rounded-full'>
                           <CreditCard size={20} />
                        </div>
                     </div>
                  </div>
                  <div className='bg-orange-100 rounded-lg p-4 shadow-sm'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-gray-600 text-sm font-medium'>
                              Tổng sản phẩm bán ra
                           </h3>
                           <p className='text-gray-800 font-semibold mt-1'>{stats.totalProducts}</p>
                        </div>
                        <div className='p-2 bg-orange-500 text-white rounded-full'>
                           <Package size={20} />
                        </div>
                     </div>
                  </div>
                  <div className='bg-blue-100 rounded-lg p-4 shadow-sm'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-gray-600 text-sm font-medium'>Tổng đơn hàng</h3>
                           <p className='text-gray-800 font-semibold mt-1'>{stats.totalOrders}</p>
                        </div>
                        <div className='p-2 bg-blue-500 text-white rounded-full'>
                           <ShoppingBag size={20} />
                        </div>
                     </div>
                  </div>
                  <div className='bg-yellow-100 rounded-lg p-4 shadow-sm'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-gray-600 text-sm font-medium'>Tổng khách hàng</h3>
                           <p className='text-gray-800 font-semibold mt-1'>
                              {stats.totalCustomers}
                           </p>
                        </div>
                        <div className='p-2 bg-yellow-500 text-white rounded-full'>
                           <Users size={20} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Orders Table */}
               <div className='bg-white rounded-lg shadow'>
                  <div className='p-4 border-b'>
                     <h3 className='text-lg font-medium text-gray-700'>Đơn Hàng Gần Đây</h3>
                  </div>

                  {loading ? (
                     <div className='p-8 text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto'></div>
                        <p className='mt-2 text-gray-500'>Đang tải dữ liệu...</p>
                     </div>
                  ) : (
                     <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                           <thead className='bg-gray-50'>
                              <tr>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Mã đơn
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Ngày đặt
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Khách hàng
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Giá trị
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Phương thức
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                 >
                                    Trạng thái
                                 </th>
                              </tr>
                           </thead>
                           <tbody className='bg-white divide-y divide-gray-200'>
                              {orders.slice(0, 10).map((order) => (
                                 <tr key={order.id} className='hover:bg-gray-50'>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                                       {order.order_code}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                       {formatDate(order.createdAt)}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                       {order.user ? (
                                          <div className="flex flex-col">
                                             <span className="text-sm font-medium text-gray-800">
                                                {order.user.name}
                                             </span>
                                             <div className="flex flex-col text-xs text-gray-500">
                                                {order.user.email && (
                                                   <span className="truncate max-w-[150px]">{order.user.email}</span>
                                                )}
                                                {order.user.phone && (
                                                   <span>{order.user.phone}</span>
                                                )}
                                             </div>
                                          </div>
                                       ) : (
                                          <div className="flex flex-col">
                                             <span className="text-sm font-medium text-gray-800">
                                                {order.user_id ? `Khách hàng #${order.user_id}` : "Khách vãng lai"}
                                             </span>
                                             <span className="text-xs text-gray-500">Đang tải thông tin...</span>
                                          </div>
                                       )}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                                       {formatPrice(order.total_price)}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                       {order.method_payment === 'COD'
                                          ? 'Tiền mặt'
                                          : order.method_payment === 'BANKING'
                                             ? 'Chuyển khoản'
                                             : order.method_payment === 'MOMO'
                                                ? 'Ví MoMo'
                                                : order.method_payment}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap'>
                                       {renderStatusBadge(order.status)}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>

                        {orders.length === 0 && (
                           <div className='p-6 text-center text-gray-500'>Chưa có đơn hàng nào</div>
                        )}
                     </div>
                  )}

                  <div className='p-4 border-t flex'>
                     <div className='flex flex-wrap items-center gap-4'>
                        <div className='flex items-center'>
                           <span className='w-3 h-3 rounded-full bg-blue-500 mr-1'></span>
                           <span className='text-xs'>Đơn hàng mới</span>
                        </div>

                        <div className='flex items-center'>
                           <span className='w-3 h-3 rounded-full bg-yellow-500 mr-1'></span>
                           <span className='text-xs'>Đang xử lý</span>
                        </div>

                        <div className='flex items-center'>
                           <span className='w-3 h-3 rounded-full bg-purple-500 mr-1'></span>
                           <span className='text-xs'>Đang giao hàng</span>
                        </div>

                        <div className='flex items-center'>
                           <span className='w-3 h-3 rounded-full bg-green-500 mr-1'></span>
                           <span className='text-xs'>Hoàn thành</span>
                        </div>

                        <div className='flex items-center'>
                           <span className='w-3 h-3 rounded-full bg-red-500 mr-1'></span>
                           <span className='text-xs'>Đơn hàng hủy</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Recent Products Section */}
               <div className='mt-8'>
                  <div className='flex justify-between items-center mb-4'>
                     <h3 className='text-lg font-medium text-gray-700'>Sản phẩm đánh giá tốt</h3>
                     <Link
                        href='/seller/reviews'
                        className='text-sm text-indigo-600 hover:text-indigo-800'
                     >
                        Xem tất cả
                     </Link>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                     {topRatedProducts.length > 0 ? (
                        topRatedProducts.map((product) => (
                           <div key={product.id} className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
                              <Link href={`/seller/products/${product.id}`}>
                                 <div className='relative aspect-square w-full max-h-[180px]'>
                                    <Image
                                       src={product.imageUrl}
                                       alt={product.name}
                                       className='object-contain'
                                       onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                       }}
                                       loading="lazy"
                                       fill
                                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                 </div>
                              </Link>
                              <div className="p-4">
                                 <Link href={`/seller/products/${product.id}`}>
                                    <h3 className='text-sm font-medium text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors'>
                                       {product.name}
                                    </h3>
                                 </Link>
                                 <div className='flex items-center mt-2'>
                                    <StarRating
                                       rating={product.rating}
                                       reviewCount={product.reviewCount}
                                    />
                                 </div>

                              </div>
                           </div>
                        ))
                     ) : (
                        // Loading hoặc placeholder khi chưa có dữ liệu
                        Array(4).fill(0).map((_, index) => (
                           <div key={index} className='bg-white rounded-lg shadow-sm overflow-hidden'>
                              <div className='relative pt-[100%] bg-gray-100 animate-pulse'></div>
                              <div className='p-4'>
                                 <div className='h-5 bg-gray-100 rounded w-3/4 mb-2 animate-pulse'></div>
                                 <div className='h-4 bg-gray-100 rounded w-1/2 mb-2 animate-pulse'></div>
                                 <div className='h-4 bg-gray-100 rounded w-2/3 animate-pulse'></div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
