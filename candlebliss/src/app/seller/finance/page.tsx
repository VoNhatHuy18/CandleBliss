'use client';

import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import Sidebar from '@/app/components/seller/menusidebar/page';
import Image from 'next/image';
import { useState, useEffect, SetStateAction } from 'react';
import {
   Search,
   DollarSign,
   ShoppingCart,
   Truck,
   Package,
   Star,
   ArrowRight,
   FileText,
   Calendar,
   Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend
);

// Define interface for order item
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   quantity: number;
   totalPrice: string;
}

// Define interface for order
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
   createdAt: string;
   updatedAt: string;
   item: OrderItem[];
}

// Hàm cập nhật dữ liệu cho biểu đồ
interface ChartData {
   totalRevenue: number;
   totalOrderValue: number;
   totalShippingFee: number;
}

export default function FinancePage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [currentTab, setCurrentTab] = useState('overview');
   const [animateStats, setAnimateStats] = useState(false);
   const [timeFilter, setTimeFilter] = useState('month');
   const [timeValue, setTimeValue] = useState(4); // Default to current month (April)
   const [year] = useState(2025);
   const [statsData, setStatsData] = useState({
      totalRevenue: 0,
      totalOrderValue: 0,
      totalShippingFee: 0,
      totalOrders: 0
   });
   const [orders, setOrders] = useState<Order[]>([]);
   const [loading, setLoading] = useState(true);
   const [ordersLoading, setOrdersLoading] = useState(true);
   const [chartData, setChartData] = useState<{
      labels: string[];
      datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number; }[];
   }>({
      labels: [],
      datasets: []
   });
   const [chartOptions, setChartOptions] = useState({});

   // Thêm state cho dữ liệu biểu đồ lịch sử
   const [historicalData, setHistoricalData] = useState<Array<{
      timeValue: number;
      totalRevenue: number;
      totalOrderValue: number;
      totalShippingFee: number;
      totalOrders: number;
   }>>([]);

   // Add this state
   const [chartView, setChartView] = useState<'current' | 'historical'>('historical');

   useEffect(() => {
      // Kích hoạt animation khi component mount
      setAnimateStats(true);

      // Fetch statistics data
      fetchStatisticsData();

      // Fetch orders data
      fetchOrdersData();

      // Generate sample historical data for the chart
      generateSampleHistoricalData();

      // Setup chart options
      setupChartOptions();

      // Update chart based on selected view
      if (chartView === 'current') {
         updateCurrentPeriodChart();
      } else {
         updateHistoricalChart();
      }
   }, [timeFilter, timeValue, year, chartView]);

   const fetchStatisticsData = async () => {
      setLoading(true);
      try {
         const response = await fetch(`/api/orders/statistics?timeFilter=${timeFilter}&timeValue=${timeValue}&year=${year}`);
         if (!response.ok) {
            throw new Error('Failed to fetch statistics data');
         }
         const data = await response.json();
         setStatsData(data);

         // Cập nhật dữ liệu cho biểu đồ
         updateChartData(data);
      } catch (error) {
         console.error('Error fetching statistics data:', error);
      } finally {
         setLoading(false);
      }
   };

   const fetchOrdersData = async () => {
      setOrdersLoading(true);
      try {
         const response = await fetch('/api/orders/all');
         if (!response.ok) {
            throw new Error('Failed to fetch orders data');
         }
         const data = await response.json();
         setOrders(data);
      } catch (error) {
         console.error('Error fetching orders data:', error);
      } finally {
         setOrdersLoading(false);
      }
   };



   const handleTimeFilterChange = (event: { target: { value: SetStateAction<string>; }; }) => {
      setTimeFilter(event.target.value);
      // Reset timeValue based on new filter
      if (event.target.value === 'month') {
         setTimeValue(4); // Default to April
      } else if (event.target.value === 'week') {
         setTimeValue(16); // Example week number
      } else {
         setTimeValue(2025); // Current year
      }
   };

   const stats = [
      {
         id: 1,
         title: 'Doanh thu',
         value: `${statsData.totalRevenue?.toLocaleString()} VND`,
         trend: `+${statsData.totalRevenue > 0 ? '37.8%' : '0%'}`,
         bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
         icon: <DollarSign className='text-blue-500' size={28} />,
      },
      {
         id: 2,
         title: 'Tổng giá trị đơn hàng',
         value: `${statsData.totalOrderValue?.toLocaleString()} VND`,
         trend: `+${statsData.totalOrderValue > 0 ? '37.8%' : '0%'}`,
         bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
         icon: <ShoppingCart className='text-purple-500' size={28} />,
      },
      {
         id: 3,
         title: 'Tổng phí vận chuyển',
         value: `${statsData.totalShippingFee?.toLocaleString()} VND`,
         trend: 'Phí vận chuyển',
         bg: 'bg-gradient-to-br from-green-50 to-green-100',
         icon: <Truck className='text-green-500' size={28} />,
      },
      {
         id: 4,
         title: 'Đơn hàng',
         value: `${statsData.totalOrders || 0} Đơn hàng`,
         trend: `+${statsData.totalOrders || 0} đơn hàng`,
         bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
         icon: <Package className='text-yellow-500' size={28} />,
      },
      {
         id: 5,
         title: 'Sản phẩm bán chạy nhất',
         value: '5 sản phẩm',
         trend: 'Top 5 sản phẩm',
         bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
         icon: <Star className='text-indigo-500' size={28} />,
      },
   ];

   const newCustomers = [
      { id: 1, name: 'Courtney Henry', image: '/images/courtney.png' },
      { id: 2, name: 'Jenny Wilson', image: '/images/jenny.png' },
      { id: 3, name: 'Cameron Williamson', image: '/images/cameron.png' },
   ];

   // Transform API orders into the format we need for display
   const completedOrders = orders
      .filter(order => order.status === 'Hoàn thành')
      .map((order) => {
         // Format date for display
         const date = new Date(order.createdAt);
         const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

         return {
            id: order.id,
            orderId: order.order_code,
            customer: `Khách hàng #${order.user_id}`, // Replace with actual customer name if available
            address: order.address,
            quantity: order.total_quantity,
            shippingFee: parseInt(order.ship_price),
            total: parseInt(order.total_price),
            status: order.status,
            date: formattedDate,
         };
      });

   const filteredOrders = completedOrders.filter(
      (order) =>
         order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.address.toLowerCase().includes(searchTerm.toLowerCase()),
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
         })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn hàng thành công');
      XLSX.writeFile(workbook, 'completed_orders.xlsx');
   };

   // Hàm thiết lập tùy chọn cho biểu đồ
   const setupChartOptions = () => {
      setChartOptions({
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
            legend: {
               position: 'top' as const,
               labels: {
                  boxWidth: 10,
                  usePointStyle: true,
                  pointStyle: 'circle'
               }
            },
            title: {
               display: true,
               text: `Thống kê tài chính ${timeFilter === 'month' ? 'theo tháng' : timeFilter === 'week' ? 'theo tuần' : 'theo năm'}`,
               font: {
                  size: 16
               }
            },
         },
         scales: {
            y: {
               beginAtZero: true,
               ticks: {
                  callback: function (value: number) {
                     return value.toLocaleString() + ' VND';
                  }
               }
            }
         },
      });
   };



   const updateChartData = (data: ChartData) => {
      const timeLabel = timeFilter === 'month'
         ? `Tháng ${timeValue}/${year}`
         : timeFilter === 'week'
            ? `Tuần ${timeValue}/${year}`
            : `Năm ${year}`;

      setChartData({
         labels: [timeLabel],
         datasets: [
            {
               label: 'Tổng doanh thu',
               data: [data.totalRevenue],
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
            },
            {
               label: 'Tổng giá trị đơn hàng',
               data: [data.totalOrderValue],
               backgroundColor: 'rgba(168, 85, 247, 0.5)',
               borderColor: 'rgb(168, 85, 247)',
               borderWidth: 1,
            },
            {
               label: 'Tổng phí vận chuyển',
               data: [data.totalShippingFee],
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               borderColor: 'rgb(34, 197, 94)',
               borderWidth: 1,
            }
         ]
      });
   };



   // Nếu không có API lịch sử, chúng ta có thể tạo dữ liệu mẫu:
   const generateSampleHistoricalData = () => {
      let sampleData = [];

      if (timeFilter === 'month') {
         sampleData = [
            { timeValue: 1, totalRevenue: 1200000, totalOrderValue: 1100000, totalShippingFee: 100000, totalOrders: 2 },
            { timeValue: 2, totalRevenue: 1500000, totalOrderValue: 1400000, totalShippingFee: 100000, totalOrders: 2 },
            { timeValue: 3, totalRevenue: 1800000, totalOrderValue: 1700000, totalShippingFee: 100000, totalOrders: 3 },
            { timeValue: 4, totalRevenue: 1750000, totalOrderValue: 1640000, totalShippingFee: 110000, totalOrders: 3 }
         ];
      } else if (timeFilter === 'week') {
         sampleData = [
            { timeValue: 13, totalRevenue: 420000, totalOrderValue: 400000, totalShippingFee: 20000, totalOrders: 1 },
            { timeValue: 14, totalRevenue: 500000, totalOrderValue: 470000, totalShippingFee: 30000, totalOrders: 1 },
            { timeValue: 15, totalRevenue: 620000, totalOrderValue: 590000, totalShippingFee: 30000, totalOrders: 1 },
            { timeValue: 16, totalRevenue: 850000, totalOrderValue: 800000, totalShippingFee: 50000, totalOrders: 2 }
         ];
      } else {
         sampleData = [
            { timeValue: 2023, totalRevenue: 12500000, totalOrderValue: 11800000, totalShippingFee: 700000, totalOrders: 25 },
            { timeValue: 2024, totalRevenue: 15800000, totalOrderValue: 14900000, totalShippingFee: 900000, totalOrders: 32 },
            { timeValue: 2025, totalRevenue: 6500000, totalOrderValue: 6100000, totalShippingFee: 400000, totalOrders: 12 }
         ];
      }

      setHistoricalData(sampleData);

      // Update chart with this data
      const labels = sampleData.map(item => {
         if (timeFilter === 'month') return `T${item.timeValue}`;
         if (timeFilter === 'week') return `Tuần ${item.timeValue}`;
         return `${item.timeValue}`;
      });

      setChartData({
         labels,
         datasets: [
            {
               label: 'Tổng doanh thu',
               data: sampleData.map(item => item.totalRevenue),
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
            },
            {
               label: 'Tổng giá trị đơn hàng',
               data: sampleData.map(item => item.totalOrderValue),
               backgroundColor: 'rgba(168, 85, 247, 0.5)',
               borderColor: 'rgb(168, 85, 247)',
               borderWidth: 1,
            },
            {
               label: 'Tổng phí vận chuyển',
               data: sampleData.map(item => item.totalShippingFee),
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               borderColor: 'rgb(34, 197, 94)',
               borderWidth: 1,
            }
         ]
      });
   };

   // Add this function for updating current period chart
   const updateCurrentPeriodChart = () => {
      if (!statsData) return;

      const timeLabel = timeFilter === 'month'
         ? `Tháng ${timeValue}/${year}`
         : timeFilter === 'week'
            ? `Tuần ${timeValue}/${year}`
            : `Năm ${year}`;

      setChartData({
         labels: [timeLabel],
         datasets: [
            {
               label: 'Tổng doanh thu',
               data: [statsData.totalRevenue],
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
            },
            {
               label: 'Tổng giá trị đơn hàng',
               data: [statsData.totalOrderValue],
               backgroundColor: 'rgba(168, 85, 247, 0.5)',
               borderColor: 'rgb(168, 85, 247)',
               borderWidth: 1,
            },
            {
               label: 'Tổng phí vận chuyển',
               data: [statsData.totalShippingFee],
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               borderColor: 'rgb(34, 197, 94)',
               borderWidth: 1,
            }
         ]
      });
   };

   // Add this function for updating historical chart
   const updateHistoricalChart = () => {
      if (historicalData.length === 0) return;

      const labels = historicalData.map(item => {
         if (timeFilter === 'month') return `T${item.timeValue}`;
         if (timeFilter === 'week') return `Tuần ${item.timeValue}`;
         return `${item.timeValue}`;
      });

      setChartData({
         labels,
         datasets: [
            {
               label: 'Tổng doanh thu',
               data: historicalData.map(item => item.totalRevenue),
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
            },
            {
               label: 'Tổng giá trị đơn hàng',
               data: historicalData.map(item => item.totalOrderValue),
               backgroundColor: 'rgba(168, 85, 247, 0.5)',
               borderColor: 'rgb(168, 85, 247)',
               borderWidth: 1,
            },
            {
               label: 'Tổng phí vận chuyển',
               data: historicalData.map(item => item.totalShippingFee),
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               borderColor: 'rgb(34, 197, 94)',
               borderWidth: 1,
            }
         ]
      });
   };

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Sidebar */}
         <Sidebar />

         <div className='flex flex-col flex-1 overflow-hidden'>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className='flex-1 overflow-y-auto p-6 pt-4'>
               <div className='container mx-auto px-2 md:px-4'>
                  {/* Page Title */}
                  <div className='flex justify-between items-center mb-8'>
                     <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Quản Lý Tài Chính</h1>
                        <p className='text-gray-500 mt-1'>
                           Quản lý doanh thu và đơn hàng của cửa hàng
                        </p>
                     </div>

                     <div className='flex items-center gap-4'>
                        <div className='relative'>
                           <Calendar
                              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                              size={18}
                           />
                           <select
                              className='pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                              value={timeFilter}
                              onChange={handleTimeFilterChange}
                           >
                              <option value="week">Tuần này</option>
                              <option value="month">Tháng này</option>
                              <option value="year">Năm nay</option>
                           </select>
                        </div>

                        <button
                           onClick={exportOrdersToExcel}
                           className='flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow'
                        >
                           <Download size={18} />
                           <span>Xuất báo cáo</span>
                        </button>
                     </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className='mb-8 border-b border-gray-200'>
                     <div className='flex space-x-8'>
                        <button
                           onClick={() => setCurrentTab('overview')}
                           className={`pb-3 px-1 font-medium text-sm ${currentTab === 'overview'
                              ? 'border-b-2 border-amber-500 text-amber-600'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                        >
                           Tổng quan
                        </button>
                        <button
                           onClick={() => setCurrentTab('orders')}
                           className={`pb-3 px-1 font-medium text-sm ${currentTab === 'orders'
                              ? 'border-b-2 border-amber-500 text-amber-600'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                        >
                           Đơn hàng
                        </button>
                        <button
                           onClick={() => setCurrentTab('customers')}
                           className={`pb-3 px-1 font-medium text-sm ${currentTab === 'customers'
                              ? 'border-b-2 border-amber-500 text-amber-600'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                        >
                           Khách hàng
                        </button>
                     </div>
                  </div>

                  {/* Tab Content */}
                  {currentTab === 'overview' && (
                     <>
                        {/* Stats Section */}
                        <section className='mb-8'>
                           <h2 className='text-lg font-semibold mb-4'>Tổng quan tài chính</h2>
                           {loading ? (
                              <div className="flex justify-center items-center h-48">
                                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                              </div>
                           ) : (
                              <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6'>
                                 {stats.map((stat, index) => (
                                    <div
                                       key={stat.id}
                                       className={`p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${stat.bg
                                          } ${animateStats ? 'animate-fade-in' : 'opacity-0'}`}
                                       style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                       <div className='flex items-center mb-3 justify-between'>
                                          <div className='p-2 rounded-lg bg-white bg-opacity-70 shadow-sm'>
                                             {stat.icon}
                                          </div>
                                          <span
                                             className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend.includes('+')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}
                                          >
                                             {stat.trend}
                                          </span>
                                       </div>
                                       <h3 className='text-sm text-gray-600 mb-1'>{stat.title}</h3>
                                       <p className='text-xl font-bold text-gray-800'>{stat.value}</p>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </section>

                        {/* Revenue Chart Section */}
                        <section className='mb-8 bg-white p-6 rounded-xl shadow-sm'>
                           <div className='flex justify-between items-center mb-6'>
                              <div>
                                 <h2 className='text-lg font-semibold'>Biểu Đồ Doanh Thu</h2>
                                 <p className='text-sm text-gray-600 mt-1'>
                                    Thống kê doanh thu theo {timeFilter === 'month' ? 'tháng' : timeFilter === 'week' ? 'tuần' : 'năm'}
                                 </p>
                              </div>

                              <div className="inline-flex rounded-md shadow-sm">
                                 <button
                                    onClick={() => setChartView('current')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${chartView === 'current'
                                       ? 'bg-amber-500 text-white'
                                       : 'bg-white text-gray-700 hover:bg-gray-50'
                                       } border border-gray-200`}
                                 >
                                    Kỳ hiện tại
                                 </button>
                                 <button
                                    onClick={() => setChartView('historical')}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${chartView === 'historical'
                                       ? 'bg-amber-500 text-white'
                                       : 'bg-white text-gray-700 hover:bg-gray-50'
                                       } border border-gray-200 border-l-0`}
                                 >
                                    Lịch sử
                                 </button>
                              </div>
                           </div>

                           <div className='w-full' style={{ height: '400px' }}>
                              {loading ? (
                                 <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                                 </div>
                              ) : (
                                 <Bar options={chartOptions} data={chartData} />
                              )}
                           </div>
                        </section>

                        {/* New Customers Section */}
                        <section className='mb-8 bg-white p-6 rounded-xl shadow-sm'>
                           <div className='flex justify-between items-center mb-6'>
                              <div>
                                 <h2 className='text-lg font-semibold'>Khách hàng mới</h2>
                                 <p className='text-sm text-gray-600 mt-1'>
                                    {newCustomers.length} khách hàng mới trong tháng này
                                 </p>
                              </div>
                              <Link
                                 href='/seller/customers'
                                 className='text-amber-500 hover:text-amber-600 text-sm font-medium flex items-center'
                              >
                                 Xem tất cả <ArrowRight className='ml-1' size={16} />
                              </Link>
                           </div>

                           <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                              {newCustomers.map((customer) => (
                                 <div
                                    key={customer.id}
                                    className='flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all'
                                 >
                                    <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-200'>
                                       <Image
                                          src={customer.image}
                                          alt={customer.name}
                                          width={48}
                                          height={48}
                                          className='object-cover'
                                       />
                                    </div>
                                    <div className='ml-3'>
                                       <p className='font-medium text-gray-800'>{customer.name}</p>
                                       <p className='text-xs text-gray-500'>Mới tham gia</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>
                     </>
                  )}

                  {currentTab === 'orders' && (
                     <>
                        {/* Completed Orders Section */}
                        <section className='mb-8'>
                           <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                              <div>
                                 <h2 className='text-lg font-semibold'>Danh sách đơn hàng hoàn thành</h2>

                              </div>

                              <div className='flex items-center gap-4 mt-4 md:mt-0'>
                                 <div className='relative'>
                                    <Search
                                       className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                       size={18}
                                    />
                                    <input
                                       type='text'
                                       placeholder='Tìm đơn hàng...'
                                       value={searchTerm}
                                       onChange={(e) => setSearchTerm(e.target.value)}
                                       className='pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                    />
                                 </div>

                                 <button
                                    onClick={exportOrdersToExcel}
                                    className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all'
                                 >
                                    <FileText size={18} />
                                    <span>Xuất Excel</span>
                                 </button>
                              </div>
                           </div>

                           <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
                              <div className='overflow-x-auto'>
                                 <table className='min-w-full'>
                                    <thead>
                                       <tr className='bg-gray-50 text-left'>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             STT
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Mã đơn hàng
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Khách hàng
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Địa chỉ
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Số lượng
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Phí vận chuyển
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Tổng thanh toán
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Trạng thái
                                          </th>
                                          <th className='py-3 px-4 text-sm font-medium text-gray-600'>
                                             Ngày tạo
                                          </th>
                                       </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200'>
                                       {ordersLoading ? (
                                          <tr>
                                             <td colSpan={9} className='py-8 text-center text-gray-500'>
                                                <div className="flex justify-center items-center">
                                                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                                                   <span className="ml-2">Đang tải dữ liệu...</span>
                                                </div>
                                             </td>
                                          </tr>
                                       ) : filteredOrders.length > 0 ? (
                                          filteredOrders.map((order, index) => (
                                             <tr
                                                key={order.id}
                                                className='hover:bg-gray-50 transition-colors'
                                             >
                                                <td className='py-3 px-4 text-sm text-gray-500'>
                                                   {index + 1}
                                                </td>
                                                <td className='py-3 px-4 text-sm font-medium text-amber-600'>
                                                   {order.orderId}
                                                </td>
                                                <td className='py-3 px-4 text-sm'>{order.customer}</td>
                                                <td className='py-3 px-4 text-sm text-gray-500'>
                                                   {order.address}
                                                </td>
                                                <td className='py-3 px-4 text-sm'>{order.quantity}</td>
                                                <td className='py-3 px-4 text-sm'>
                                                   {order.shippingFee.toLocaleString()} VND
                                                </td>
                                                <td className='py-3 px-4 text-sm font-medium'>
                                                   {order.total.toLocaleString()} VND
                                                </td>
                                                <td className='py-3 px-4 text-sm'>
                                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Đơn hàng vừa được tạo'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : 'bg-green-100 text-green-700'
                                                      }`}>
                                                      {order.status}
                                                   </span>
                                                </td>
                                                <td className='py-3 px-4 text-sm text-gray-500'>
                                                   {order.date}
                                                </td>
                                             </tr>
                                          ))
                                       ) : (
                                          <tr>
                                             <td colSpan={9} className='py-8 text-center text-gray-500'>
                                                Không tìm thấy đơn hàng hoàn thành nào
                                             </td>
                                          </tr>
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                              {filteredOrders.length > 0 && (
                                 <div className='py-3 px-4 bg-gray-50 text-sm text-gray-500 border-t'>
                                    Hiển thị {filteredOrders.length} đơn hàng hoàn thành
                                 </div>
                              )}
                           </div>
                        </section>
                     </>
                  )}

                  {currentTab === 'customers' && (
                     <>
                        {/* New Customers Section (full view) */}
                        <section className='mb-8 bg-white p-6 rounded-xl shadow-sm'>
                           <div className='flex justify-between items-center mb-6'>
                              <div>
                                 <h2 className='text-lg font-semibold'>Khách hàng mới</h2>
                                 <p className='text-sm text-gray-600 mt-1'>
                                    {newCustomers.length} khách hàng mới trong tháng này
                                 </p>
                              </div>
                              <Link
                                 href='/seller/customers'
                                 className='text-amber-500 hover:text-amber-600 text-sm font-medium flex items-center'
                              >
                                 Xem tất cả <ArrowRight className='ml-1' size={16} />
                              </Link>
                           </div>

                           <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
                              {newCustomers.map((customer) => (
                                 <div
                                    key={customer.id}
                                    className='flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all'
                                 >
                                    <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-200'>
                                       <Image
                                          src={customer.image}
                                          alt={customer.name}
                                          width={48}
                                          height={48}
                                          className='object-cover'
                                       />
                                    </div>
                                    <div className='ml-3'>
                                       <p className='font-medium text-gray-800'>{customer.name}</p>
                                       <p className='text-xs text-gray-500'>Mới tham gia</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </section>
                     </>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
