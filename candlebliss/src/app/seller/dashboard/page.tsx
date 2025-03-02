'use client';

import { Package, ShoppingBag, CreditCard, Users } from 'lucide-react';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

export default function Dashboard() {
   // Dữ liệu mẫu cho bảng đơn hàng
   const orders = [
      {
         id: 1,
         productName: 'Casual leave',
         category: 'Casual leave',
         code: '02 (05-06 Jul)',
         totalPayment: '02 (05-06 Jul)',
         orderDate: '02 (05-06 Jul)',
         status: 'Đang Xử Lý',
         action: 'Xem chi tiết',
      },
      {
         id: 2,
         productName: 'Late entry',
         category: 'Late entry',
         code: '01 (06 Jul)',
         totalPayment: '01 (06 Jul)',
         orderDate: '01 (06 Jul)',
         status: 'Đã Hủy',
         action: 'Xem chi tiết',
      },
      {
         id: 3,
         productName: 'maternity leave',
         category: 'maternity leave',
         code: '05 (05-06 Jul)',
         totalPayment: '05 (05-06 Jul)',
         orderDate: '05 (05-06 Jul)',
         status: 'Đang Xử Lý',
         action: 'Xem chi tiết',
      },
      {
         id: 4,
         productName: 'Late entry',
         category: 'Late entry',
         code: '02 (06 Jul)',
         totalPayment: '02 (06 Jul)',
         orderDate: '02 (06 Jul)',
         status: 'Đơn Hàng Mới',
         action: 'Xem chi tiết',
      },
      {
         id: 5,
         productName: 'Sick leave',
         category: 'Sick leave',
         code: '02 (05-06 Jul)',
         totalPayment: '02 (05-06 Jul)',
         orderDate: '02 (05-06 Jul)',
         status: 'Đơn Hàng Mới',
         action: 'Xem chi tiết',
      },
      {
         id: 6,
         productName: 'Late entry',
         category: 'Late entry',
         code: '02 (06 Jul)',
         totalPayment: '02 (06 Jul)',
         orderDate: '02 (06 Jul)',
         status: 'Đã Hủy',
         action: 'Xem chi tiết',
      },
      {
         id: 7,
         productName: 'Sick leave',
         category: 'Sick leave',
         code: '02 (05-06 Jul)',
         totalPayment: '02 (05-06 Jul)',
         orderDate: '02 (05-06 Jul)',
         status: 'Đơn Hàng Mới',
         action: 'Xem chi tiết',
      },
      {
         id: 8,
         productName: 'Late entry',
         category: 'Late entry',
         code: '02 (06 Jul)',
         totalPayment: '02 (06 Jul)',
         orderDate: '02 (06 Jul)',
         status: 'Đã Hủy',
         action: 'Xem chi tiết',
      },
      {
         id: 9,
         productName: 'Sick leave',
         category: 'Sick leave',
         code: '02 (05-06 Jul)',
         totalPayment: '02 (05-06 Jul)',
         orderDate: '02 (05-06 Jul)',
         status: 'Đơn Hàng Mới',
         action: 'Xem chi tiết',
      },
      {
         id: 10,
         productName: 'Late entry',
         category: 'Late entry',
         code: '02 (06 Jul)',
         totalPayment: '02 (06 Jul)',
         orderDate: '02 (06 Jul)',
         status: 'Đơn Hàng Mới',
         action: 'Xem chi tiết',
      },
   ];

   // Dữ liệu thống kê
   const stats = [
      {
         title: 'Tổng doanh thu',
         value: '10.000.000 VNĐ',
         color: 'bg-purple-100',
         icon: (
            <div className='p-2 bg-purple-500 text-white rounded-full'>
               <CreditCard size={20} />
            </div>
         ),
      },
      {
         title: 'Tổng sản phẩm',
         value: '300',
         color: 'bg-orange-100',
         icon: (
            <div className='p-2 bg-orange-500 text-white rounded-full'>
               <Package size={20} />
            </div>
         ),
      },
      {
         title: 'Tổng đơn hàng',
         value: '100',
         color: 'bg-blue-100',
         icon: (
            <div className='p-2 bg-blue-500 text-white rounded-full'>
               <ShoppingBag size={20} />
            </div>
         ),
      },
      {
         title: 'Tổng khách hàng',
         value: '120',
         color: 'bg-yellow-100',
         icon: (
            <div className='p-2 bg-yellow-500 text-white rounded-full'>
               <Users size={20} />
            </div>
         ),
      },
   ];

   return (
      <div className='min-h-screen bg-gray-50 flex'>
         {/* Sidebar */}
         <MenuSideBar />

         {/* Main Content */}
         <div className='flex-1 flex flex-col'>
            {/* Header */}
            <Header />

            {/* Dashboard Content */}
            <main className='flex-1 p-6'>
               <div className='mb-6'>
                  <h2 className='text-xl font-semibold text-gray-800'>Tổng Quan</h2>
                  <div className='flex justify-between items-center mt-2'>
                     <div>
                        <span className='text-sm text-gray-500'>Last 30 days</span>
                     </div>
                  </div>
               </div>

               {/* Stats Cards */}
               <div className='grid grid-cols-4 gap-6 mb-8'>
                  {stats.map((stat, index) => (
                     <div key={index} className={`${stat.color} rounded-lg p-4 shadow-sm`}>
                        <div className='flex items-center justify-between'>
                           <div>
                              <h3 className='text-gray-600 text-sm font-medium'>{stat.title}</h3>
                              <p className='text-gray-800 font-semibold mt-1'>{stat.value}</p>
                           </div>
                           {stat.icon}
                        </div>
                     </div>
                  ))}
               </div>

               {/* Orders Table */}
               <div className='bg-white rounded-lg shadow'>
                  <div className='p-4 border-b'>
                     <h3 className='text-lg font-medium text-gray-700'>Đơn Hàng</h3>
                  </div>
                  <div className='overflow-x-auto'>
                     <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                           <tr>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 STT
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Mã Đơn Hàng
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Giá Chỉ
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Tên Sản Phẩm
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Tổng Thanh Toán
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Ngày Đặt
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Trạng Thái
                              </th>
                              <th
                                 scope='col'
                                 className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                              >
                                 Hành Động
                              </th>
                           </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                           {orders.map((order) => (
                              <tr key={order.id}>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.id}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.productName}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.category}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.code}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.totalPayment}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {order.orderDate}
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap'>
                                    <span
                                       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          order.status === 'Đang Xử Lý'
                                             ? 'bg-yellow-100 text-yellow-800'
                                             : order.status === 'Đã Hủy'
                                             ? 'bg-red-100 text-red-800'
                                             : 'bg-blue-100 text-blue-800'
                                       }`}
                                    >
                                       {order.status}
                                    </span>
                                 </td>
                                 <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    <a href='#' className='text-indigo-600 hover:text-indigo-900'>
                                       {order.action}
                                    </a>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  <div className='p-4 border-t flex'>
                     <div className='flex items-center'>
                        <span className='w-3 h-3 rounded-full bg-blue-500 mr-1'></span>
                        <span className='text-xs mr-4'>Đơn hàng mới</span>

                        <span className='w-3 h-3 rounded-full bg-yellow-500 mr-1'></span>
                        <span className='text-xs mr-4'>Đang giao hàng</span>

                        <span className='w-3 h-3 rounded-full bg-red-500 mr-1'></span>
                        <span className='text-xs mr-4'>Đơn hàng hủy</span>

                        <span className='w-3 h-3 rounded-full bg-green-500 mr-1'></span>
                        <span className='text-xs'>Đơn hàng đã hoàn thành</span>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
