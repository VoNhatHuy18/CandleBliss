'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, CreditCard, Users } from 'lucide-react';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Link from 'next/link';

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
   const [stats, setStats] = useState({
      totalRevenue: '0',
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0
   });

   // Fetch data from API
   useEffect(() => {
      const fetchOrders = async () => {
         try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
               console.error('No authentication token found');
               return;
            }

            const response = await fetch('http://68.183.226.198:3000/api/orders', {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            });

            if (!response.ok) {
               throw new Error('Failed to fetch orders');
            }

            const data = await response.json();

            // Sort orders by date (newest first)
            const sortedOrders = data.sort((a: Order, b: Order) =>
               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(sortedOrders);

            // Calculate stats
            calculateStats(sortedOrders);
         } catch (error) {
            console.error('Error fetching orders:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, []);

   // Calculate dashboard statistics
   const calculateStats = (orders: Order[]) => {
      let revenue = 0;
      const customers = new Set();
      let productCount = 0;

      orders.forEach(order => {
         // Only count completed orders for revenue
         if (order.status === 'Hoàn thành' || order.status === 'Đã giao hàng') {
            revenue += parseFloat(order.total_price);
         }

         customers.add(order.user_id);

         // Count total products
         order.item?.forEach(item => {
            productCount += item.quantity;
         });
      });

      setStats({
         totalRevenue: revenue.toString(),
         totalProducts: productCount,
         totalOrders: orders.length,
         totalCustomers: customers.size
      });
   };

   // Format date for display
   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric'
      });
   };

   // Display appropriate status badge
   const renderStatusBadge = (status: string) => {
      const colorClass = orderStatusColors[status] || 'bg-gray-100 text-gray-800';
      return (
         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
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
                           <p className='text-gray-800 font-semibold mt-1'>{formatPrice(stats.totalRevenue)}</p>
                        </div>
                        <div className='p-2 bg-purple-500 text-white rounded-full'>
                           <CreditCard size={20} />
                        </div>
                     </div>
                  </div>
                  <div className='bg-orange-100 rounded-lg p-4 shadow-sm'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-gray-600 text-sm font-medium'>Tổng sản phẩm bán ra</h3>
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
                           <p className='text-gray-800 font-semibold mt-1'>{stats.totalCustomers}</p>
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
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Mã đơn
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Ngày đặt
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Khách hàng
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Giá trị
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Phương thức
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Trạng thái
                                 </th>
                                 <th scope='col' className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Thao tác
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
                                       {`Khách hàng #${order.user_id}`}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                                       {formatPrice(order.total_price)}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                       {order.method_payment === 'COD' ? 'Tiền mặt' :
                                          order.method_payment === 'BANKING' ? 'Chuyển khoản' :
                                             order.method_payment === 'MOMO' ? 'Ví MoMo' :
                                                order.method_payment}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap'>
                                       {renderStatusBadge(order.status)}
                                    </td>
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900'>
                                       <a href={`/seller/orders/${order.id}`}>Chi tiết</a>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>

                        {orders.length === 0 && (
                           <div className='p-6 text-center text-gray-500'>
                              Chưa có đơn hàng nào
                           </div>
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
                     <h3 className='text-lg font-medium text-gray-700'>Sản phẩm bán chạy</h3>
                     <Link href='/seller/products' className='text-sm text-indigo-600 hover:text-indigo-800'>
                        Xem tất cả
                     </Link>
                  </div>

                  {/* This would be populated from a different API call */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                     {/* Placeholder for top products */}
                     <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='h-40 bg-gray-100 rounded-md mb-3'></div>
                        <p className='font-medium'>Sản phẩm bán chạy #1</p>
                        <p className='text-sm text-gray-500 mt-1'>Đã bán: 120 sản phẩm</p>
                     </div>
                     <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='h-40 bg-gray-100 rounded-md mb-3'></div>
                        <p className='font-medium'>Sản phẩm bán chạy #2</p>
                        <p className='text-sm text-gray-500 mt-1'>Đã bán: 98 sản phẩm</p>
                     </div>
                     <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='h-40 bg-gray-100 rounded-md mb-3'></div>
                        <p className='font-medium'>Sản phẩm bán chạy #3</p>
                        <p className='text-sm text-gray-500 mt-1'>Đã bán: 85 sản phẩm</p>
                     </div>
                     <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='h-40 bg-gray-100 rounded-md mb-3'></div>
                        <p className='font-medium'>Sản phẩm bán chạy #4</p>
                        <p className='text-sm text-gray-500 mt-1'>Đã bán: 72 sản phẩm</p>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
