// Thay đổi trong phần stats section để làm nổi bật hơn
<section className="mb-8"></section>
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import Sidebar from '@/app/components/seller/menusidebar/page';
import Image from 'next/image';
import { useState } from 'react';
import { Search, Bell, DollarSign, ShoppingCart, Truck, Package, Star, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const stats = [
    { id: 1, title: 'Doanh thu', value: '241,891.12 VND', trend: '+37.8%', bg: 'bg-blue-50', icon: <DollarSign className="text-blue-500" size={24} /> },
    { id: 2, title: 'Tổng giá trị đơn hàng', value: '241,891.12 VND', trend: '+37.8%', bg: 'bg-purple-50', icon: <ShoppingCart className="text-purple-500" size={24} /> },
    { id: 3, title: 'Tổng phí vận chuyển', value: '241,891.12 VND', trend: 'Phí vận chuyển', bg: 'bg-green-50', icon: <Truck className="text-green-500" size={24} /> },
    { id: 4, title: 'Đơn hàng', value: '520 Đơn hàng', trend: '+20 đơn hàng', bg: 'bg-yellow-50', icon: <Package className="text-yellow-500" size={24} /> },
    { id: 5, title: 'Sản phẩm bán chạy nhất', value: '5 sản phẩm', trend: 'Top 5 sản phẩm', bg: 'bg-indigo-50', icon: <Star className="text-indigo-500" size={24} /> },
  ];

  const newCustomers = [
    { id: 1, name: 'Courtney Henry', image: '/images/courtney.png' },
    { id: 2, name: 'Jenny Wilson', image: '/images/jenny.png' },
    { id: 3, name: 'Cameron Williamson', image: '/images/cameron.png' },
  ];

  const completedOrders = [
    {
      id: 1,
      orderId: 'A01',
      customer: 'Courtney Henry',
      address: '123 Main Street',
      quantity: 10,
      shippingFee: 20000,
      total: 250000,
      status: 'Thành công',
      date: '20/02/2025',
    },
    {
      id: 2,
      orderId: 'A02',
      customer: 'Jenny Wilson',
      address: '456 Elm Street',
      quantity: 5,
      shippingFee: 15000,
      total: 125000,
      status: 'Thành công',
      date: '21/02/2025',
    },
  ];

  const filteredOrders = completedOrders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm xuất danh sách đơn hàng thành công dưới dạng Excel
  const exportOrdersToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      completedOrders.map((order, index) => ({
        STT: index + 1,
        'Mã đơn hàng': order.orderId,
        'Khách hàng': order.customer,
        'Địa chỉ': order.address,
        'Số lượng': order.quantity,
        'Phí vận chuyển': `${order.shippingFee.toLocaleString()} VND`,
        'Tổng thanh toán': `${order.total.toLocaleString()} VND`,
        'Ngày hoàn thành': order.date,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn hàng thành công');
    XLSX.writeFile(workbook, 'completed_orders.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Candle Bliss | Quản lý tài chính</title>
        <meta name="description" content="Candle Bliss Admin Dashboard" />
      </Head>

      {/* Header */}
        <Header />
    
        {/* Sidebar */}
        <Sidebar />
     
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Tổng quan tài chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <div key={stat.id} className={`p-4 rounded-lg shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow ${stat.bg}`}>
                <div>{stat.icon}</div>
                <div>
                  <h3 className="text-sm text-gray-600">{stat.title}</h3>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Customers Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Số lượng khách hàng mới</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">{newCustomers.length} khách hàng mới</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-center">
            {newCustomers.map((customer) => (
              <div key={customer.id} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <Image
                    src={customer.image}
                    alt={customer.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-700 mt-2">{customer.name}</p>
              </div>
            ))}
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
              <ArrowRight className="text-gray-600" size={20} />
            </button>
          </div>
        </section>

        {/* Completed Orders Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Danh sách đơn hàng thành công</h2>
            <button
              onClick={exportOrdersToExcel}
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              Xuất hóa đơn
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">STT</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Mã đơn hàng</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Địa chỉ</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Số lượng</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Phí vận chuyển</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tổng thanh toán</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Ngày hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm">{order.orderId}</td>
                    <td className="py-3 px-4 text-sm">{order.customer}</td>
                    <td className="py-3 px-4 text-sm">{order.address}</td>
                    <td className="py-3 px-4 text-sm">{order.quantity}</td>
                    <td className="py-3 px-4 text-sm">{order.shippingFee.toLocaleString()} VND</td>
                    <td className="py-3 px-4 text-sm">{order.total.toLocaleString()} VND</td>
                    <td className="py-3 px-4 text-sm">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}