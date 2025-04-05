'use client';

import Head from 'next/head';
import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import Sidebar from '@/app/components/seller/menusidebar/page';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Search, Bell, DollarSign, ShoppingCart, Truck, Package, Star, ArrowRight, FileText, Calendar, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('overview');
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    // Kích hoạt animation khi component mount
    setAnimateStats(true);
  }, []);

  const stats = [
    { id: 1, title: 'Doanh thu', value: '241,891.12 VND', trend: '+37.8%', bg: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: <DollarSign className="text-blue-500" size={28} /> },
    { id: 2, title: 'Tổng giá trị đơn hàng', value: '241,891.12 VND', trend: '+37.8%', bg: 'bg-gradient-to-br from-purple-50 to-purple-100', icon: <ShoppingCart className="text-purple-500" size={28} /> },
    { id: 3, title: 'Tổng phí vận chuyển', value: '241,891.12 VND', trend: 'Phí vận chuyển', bg: 'bg-gradient-to-br from-green-50 to-green-100', icon: <Truck className="text-green-500" size={28} /> },
    { id: 4, title: 'Đơn hàng', value: '520 Đơn hàng', trend: '+20 đơn hàng', bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', icon: <Package className="text-yellow-500" size={28} /> },
    { id: 5, title: 'Sản phẩm bán chạy nhất', value: '5 sản phẩm', trend: 'Top 5 sản phẩm', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', icon: <Star className="text-indigo-500" size={28} /> },
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="container mx-auto px-2 md:px-4">
            {/* Page Title */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Tài Chính</h1>
                <p className="text-gray-500 mt-1">Quản lý doanh thu và đơn hàng của cửa hàng</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Tháng này</option>
                    <option>Tháng trước</option>
                    <option>Quý này</option>
                    <option>Năm nay</option>
                  </select>
                </div>

                <button onClick={exportOrdersToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow">
                  <Download size={18} />
                  <span>Xuất báo cáo</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8 border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`pb-3 px-1 font-medium text-sm ${currentTab === 'overview'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                  Tổng quan
                </button>
                <button
                  onClick={() => setCurrentTab('orders')}
                  className={`pb-3 px-1 font-medium text-sm ${currentTab === 'orders'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                  Đơn hàng
                </button>
                <button
                  onClick={() => setCurrentTab('customers')}
                  className={`pb-3 px-1 font-medium text-sm ${currentTab === 'customers'
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                  Khách hàng
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Tổng quan tài chính</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.id}
                    className={`p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${stat.bg} ${animateStats ? 'animate-fade-in' : 'opacity-0'}`}
                    style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center mb-3 justify-between">
                      <div className="p-2 rounded-lg bg-white bg-opacity-70 shadow-sm">
                        {stat.icon}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* New Customers Section */}
            <section className="mb-8 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Khách hàng mới</h2>
                  <p className="text-sm text-gray-600 mt-1">{newCustomers.length} khách hàng mới trong tháng này</p>
                </div>
                <Link href="/seller/customers" className="text-amber-500 hover:text-amber-600 text-sm font-medium flex items-center">
                  Xem tất cả <ArrowRight className="ml-1" size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {newCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={customer.image}
                        alt={customer.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{customer.name}</p>
                      <p className="text-xs text-gray-500">Mới tham gia</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Completed Orders Section */}
            <section className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Danh sách đơn hàng thành công</h2>
                  <p className="text-sm text-gray-600 mt-1">Quản lý tất cả đơn hàng đã hoàn thành</p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Tìm đơn hàng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    onClick={exportOrdersToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FileText size={18} />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">STT</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Mã đơn hàng</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Khách hàng</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Địa chỉ</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Số lượng</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Phí vận chuyển</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Tổng thanh toán</th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-600">Ngày hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="py-3 px-4 text-sm font-medium text-amber-600">{order.orderId}</td>
                            <td className="py-3 px-4 text-sm">{order.customer}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{order.address}</td>
                            <td className="py-3 px-4 text-sm">{order.quantity}</td>
                            <td className="py-3 px-4 text-sm">{order.shippingFee.toLocaleString()} VND</td>
                            <td className="py-3 px-4 text-sm font-medium">{order.total.toLocaleString()} VND</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{order.date}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            Không tìm thấy đơn hàng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredOrders.length > 0 && (
                  <div className="py-3 px-4 bg-gray-50 text-sm text-gray-500 border-t">
                    Hiển thị {filteredOrders.length} / {completedOrders.length} đơn hàng
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}