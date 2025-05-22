'use client';

import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import Sidebar from '@/app/components/seller/menusidebar/page';
import { useEffect, useState, SetStateAction, useCallback, useMemo } from 'react';
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
   Chart,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
Chart.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Tooltip,
   Legend
);
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HOST } from '@/app/constants/api';


// Define interface for order item
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   quantity: number;
   totalPrice: string;
}

// Define interface for user
interface User {
   id: number;
   name: string;
   phone: string;
   email: string;
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
   user?: User; // Thêm trường user
}

// Rename this interface to avoid conflicts with the imported ChartData
interface FinanceChartData {
   totalRevenue: number;
   totalOrderValue: number;
   totalShippingFee: number;
}

// Add this new interface:
interface NewCustomer {
   id: number;
   firstName: string;
   lastName: string;
   email: string;
   createdAt: string;
   phone?: number | null;
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
   const [fetchedUserIds, setFetchedUserIds] = useState<Record<number, boolean>>({});
   const [completedOrders, setCompletedOrders] = useState<Array<{
      id: number;
      orderId: string;
      customer: string;
      address: string;
      quantity: number;
      shippingFee: number;
      total: number;
      status: string;
      date: string;
   }>>([]);

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

   // Add this state inside your component:
   const [newCustomers, setNewCustomers] = useState<NewCustomer[]>([]);

   // Thêm state để theo dõi lần fetch cuối cùng và cache dữ liệu
   const [lastFetchTime, setLastFetchTime] = useState(0);
   const [cachedHistoricalData, setCachedHistoricalData] = useState<Record<string, Array<{
      timeValue: number;
      totalRevenue: number;
      totalOrderValue: number;
      totalShippingFee: number;
      totalOrders: number;
   }>>>({});

   // Thêm state để kiểm soát fetch new customers
   const [newCustomersFetched, setNewCustomersFetched] = useState(false);

   useEffect(() => {
      // Kích hoạt animation khi component mount
      setAnimateStats(true);
      setupChartOptions();

      // Gộp fetch dữ liệu vào một hàm và thêm tham số để điều khiển loading state
      const loadData = async () => {
         setLoading(true);

         // Luôn fetch orders data - chỉ cần fetch một lần
         await fetchOrdersData();

         if (chartView === 'current') {
            // Với chế độ xem hiện tại, chỉ cần tính toán từ dữ liệu orders đã có
            fetchStatisticsData();
            updateCurrentPeriodChart();
         } else {
            // Với chế độ xem lịch sử, fetch dữ liệu lịch sử
            fetchHistoricalData();
         }

         // Fetch new customers data nếu chưa có
         if (newCustomers.length === 0) {
            fetchNewCustomers();
         }

         setLoading(false);
      };

      loadData();

   }, [chartView, timeFilter, timeValue]); // Giảm thiểu dependencies

   // Modify the fetchStatisticsData function to properly filter orders


   // Sửa hàm fetchOrdersData để tránh fetch trùng lặp
   const fetchOrdersData = async () => {
      const now = Date.now();
      if (now - lastFetchTime < 60000 && orders.length > 0) {
         // Nếu đã fetch trong vòng 1 phút gần đây và đã có dữ liệu, không fetch lại
         return;
      }

      setOrdersLoading(true);
      try {
         const response = await fetch(`${HOST}/api/orders/all`);
         if (!response.ok) {
            throw new Error('Failed to fetch orders data');
         }
         const data = await response.json();
         setOrders(data);
         setLastFetchTime(now);
      } catch (error) {
         console.error('Error fetching orders data:', error);
      } finally {
         setOrdersLoading(false);
      }
   };

   const fetchUserData = useCallback(async (orders: Order[]) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Lấy danh sách user_id duy nhất từ các orders
      const uniqueUserIds = [...new Set(
         orders
            .filter(order => !order.user && order.user_id && !fetchedUserIds[order.user_id])
            .map(order => order.user_id)
      )];

      if (uniqueUserIds.length === 0) return;

      let hasUpdates = false;
      const updatedOrders = [...orders];
      const newFetchedUserIds = { ...fetchedUserIds };

      // Tạo mảng promises cho tất cả API calls
      const userPromises = uniqueUserIds.map(async (userId) => {
         try {
            // Đánh dấu user_id này đã được xử lý
            newFetchedUserIds[userId] = true;

            const userResponse = await fetch(
               `${HOST}/api/v1/users/${userId}`,
               {
                  headers: { Authorization: `Bearer ${token}` },
               }
            );

            // Xử lý response và return thông tin người dùng
            if (userResponse.ok) {
               const contentType = userResponse.headers.get('content-type');
               if (contentType && contentType.includes('application/json')) {
                  const text = await userResponse.text();
                  if (text && text.trim()) {
                     try {
                        return { userId, userData: JSON.parse(text) };
                     } catch (jsonError) {
                        console.error(`Invalid JSON for user ID ${userId}:`, jsonError);
                     }
                  }
               }
            }

            // Return null nếu có lỗi
            return { userId, userData: null };
         } catch (error) {
            console.error(`Failed to fetch user info for user ID ${userId}:`, error);
            return { userId, userData: null };
         }
      });

      // Đợi tất cả promises hoàn thành
      const results = await Promise.all(userPromises);

      // Cập nhật thông tin người dùng vào orders
      results.forEach(({ userId, userData }) => {
         // Bỏ qua nếu không có userData
         if (!userData) {
            // Cung cấp dữ liệu fallback
            updatedOrders.forEach(order => {
               if (order.user_id === userId) {
                  order.user = {
                     id: userId,
                     name: `Khách hàng #${userId}`,
                     phone: 'Không có SĐT',
                     email: 'Không có email',
                  };
                  hasUpdates = true;
               }
            });
            return;
         }

         // Cập nhật thông tin user cho tất cả orders phù hợp
         updatedOrders.forEach(order => {
            if (order.user_id === userId) {
               order.user = {
                  id: userData.id,
                  name: userData.firstName && userData.lastName
                     ? `${userData.firstName} ${userData.lastName}`
                     : userData.firstName || userData.lastName || 'Không có tên',
                  phone: userData.phone ? userData.phone.toString() : 'Không có SĐT',
                  email: userData.email || 'Không có email',
               };
               hasUpdates = true;
            }
         });
      });

      if (hasUpdates) {
         setOrders(updatedOrders);
         setFetchedUserIds(newFetchedUserIds);

         // Filter orders by valid statuses before mapping to completedOrders
         const filtered = updatedOrders.filter(order => isRevenueCountableStatus(order.status));

         const mappedOrders = filtered.map((order) => {
            // Format date for display
            const date = new Date(order.createdAt);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            return {
               id: order.id,
               orderId: order.order_code,
               customer: order.user?.name || `Khách hàng #${order.user_id}`,
               address: order.address,
               quantity: order.total_quantity,
               shippingFee: parseInt(order.ship_price),
               total: parseInt(order.total_price),
               status: order.status,
               date: formattedDate,
            };
         });

         setCompletedOrders(mappedOrders);
      }
   }, [fetchedUserIds]);

   useEffect(() => {
      if (orders.length > 0) {
         fetchUserData(orders);
      }
   }, [orders, fetchUserData]);

   // Add this useEffect to recalculate statistics when orders change
   useEffect(() => {
      if (orders.length > 0) {
         fetchStatisticsData();
      }
   }, [orders]);

   const handleTimeFilterChange = (event: { target: { value: SetStateAction<string>; }; }) => {
      const newTimeFilter = event.target.value as string;
      setTimeFilter(newTimeFilter);

      // Set time value based on the filter and chart view
      const now = new Date();

      if (chartView === 'current') {
         // Set to current period based on the new filter
         if (newTimeFilter === 'month') {
            setTimeValue(now.getMonth() + 1); // Current month (1-12)
         } else if (newTimeFilter === 'week') {
            // Calculate current week number
            const start = new Date(now.getFullYear(), 0, 1);
            const weekNumber = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
            setTimeValue(weekNumber);
         } else {
            setTimeValue(now.getFullYear()); // Current year
         }
      } else {
         // Historical view - filter doesn't change the timeValue
         // Just update the data with the new filter type
      }

      // The useEffect will handle data fetching due to timeFilter change
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
         icon: <Truck className='text-green-500' size={28} />
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

   const filteredOrders = useMemo(() => {
      return completedOrders.filter(
         (order) =>
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
   }, [completedOrders, searchTerm]);

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

   // Hàm xuất báo cáo tổng quan tài chính chuyên nghiệp
   const exportFinancialOverview = () => {
      // Tạo timestamp cho tên file
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const currentDate = new Date().toLocaleDateString('vi-VN');

      // Định dạng tiêu đề báo cáo
      const title = timeFilter === 'week' ? `Tuần ${timeValue}/${year}` :
         timeFilter === 'month' ? `Tháng ${timeValue}/${year}` :
            `Năm ${year}`;

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // SHEET 1: TRANG TỔNG QUAN
      // -------------------
      // Tạo dữ liệu cho summary sheet (trang tóm tắt) với tiêu đề lớn
      const summaryData = [
         ["BÁO CÁO TÀI CHÍNH TỔNG QUAN"], [""],
         ["Tên cửa hàng:", "CandleBliss"],
         ["Kỳ báo cáo:", title],
         ["Ngày xuất báo cáo:", currentDate],
         ["Người xuất báo cáo:", "Admin"],
         [""],
         ["THỐNG KÊ CHỈ SỐ TÀI CHÍNH CHÍNH"], [""],
         ["Chỉ số", "Giá trị", "Phân tích"],
         ["Tổng doanh thu", `${statsData.totalRevenue.toLocaleString()} VND`, statsData.totalRevenue > 10000000 ? "Đạt chỉ tiêu" : "Chưa đạt chỉ tiêu"],
         ["Tổng giá trị đơn hàng", `${statsData.totalOrderValue.toLocaleString()} VND`, ""],
         ["Tổng phí vận chuyển", `${statsData.totalShippingFee.toLocaleString()} VND`, ""],
         ["Tổng số đơn hàng", statsData.totalOrders.toString(), ""],
         ["Giá trị trung bình/đơn", statsData.totalOrders > 0 ? `${Math.round(statsData.totalOrderValue / statsData.totalOrders).toLocaleString()} VND` : "0 VND", ""],
         [""],
         ["BIỂU ĐỒ VÀ THỐNG KÊ CHI TIẾT"],
         ["Tham khảo phần biểu đồ trong file đính kèm hoặc trang quản trị."]
      ];

      // Tạo worksheet summary từ mảng dữ liệu
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Thiết lập style cho các tiêu đề
      const merges = [
         { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },  // Merge ô tiêu đề chính
         { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } },  // Merge ô tiêu đề thống kê
         { s: { r: 15, c: 0 }, e: { r: 15, c: 2 } } // Merge ô tiêu đề biểu đồ
      ];
      summarySheet['!merges'] = merges;

      // Thiết lập độ rộng cho các cột
      summarySheet['!cols'] = [
         { width: 25 },  // Cột A
         { width: 25 },  // Cột B
         { width: 25 }   // Cột C
      ];

      // Thêm sheet summary vào workbook
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

      // SHEET 2: CHI TIẾT ĐƠN HÀNG
      // -------------------
      if (completedOrders.length > 0) {
         // Tạo header chuyên nghiệp cho sheet đơn hàng
         const orderHeader = [
            [`BÁO CÁO CHI TIẾT ĐƠN HÀNG - ${title}`], [""],
            ["Ngày xuất báo cáo:", currentDate],
            ["Tổng số đơn hàng:", completedOrders.length.toString()],
            [""],
         ];

         // Tạo dữ liệu chi tiết đơn hàng
         const orderDetails = completedOrders.map((order, index) => ({
            "STT": index + 1,
            "Mã đơn hàng": order.orderId,
            "Khách hàng": order.customer,
            "Địa chỉ": order.address,
            "Số lượng": order.quantity,
            "Phí vận chuyển": `${order.shippingFee.toLocaleString()} VND`,
            "Tổng thanh toán": `${order.total.toLocaleString()} VND`,
            "Trạng thái": order.status,
            "Ngày": order.date
         }));

         // Tạo worksheet từ header
         const orderSheet = XLSX.utils.aoa_to_sheet(orderHeader);

         // Thêm data chi tiết vào sheet (bắt đầu từ dòng sau header)
         XLSX.utils.sheet_add_json(orderSheet, orderDetails, {
            origin: "A" + (orderHeader.length + 1),
            skipHeader: false
         });

         // Thiết lập merge cells cho tiêu đề
         const orderMerges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]; // Merge tiêu đề chính
         orderSheet['!merges'] = orderMerges;

         // Thiết lập độ rộng cột
         orderSheet['!cols'] = [
            { width: 5 },  // STT
            { width: 15 }, // Mã đơn hàng
            { width: 20 }, // Khách hàng
            { width: 30 }, // Địa chỉ
            { width: 10 }, // Số lượng
            { width: 15 }, // Phí vận chuyển
            { width: 15 }, // Tổng thanh toán
            { width: 20 }, // Trạng thái
            { width: 15 }  // Ngày
         ];

         // Thêm sheet vào workbook
         XLSX.utils.book_append_sheet(workbook, orderSheet, 'Chi tiết đơn hàng');
      }

      // SHEET 3: DỮ LIỆU LỊCH SỬ
      // -------------------
      if (historicalData.length > 0) {
         // Tạo header cho sheet lịch sử
         const historyHeader = [
            [`BÁO CÁO DỮ LIỆU LỊCH SỬ - ${timeFilter === 'week' ? 'THEO TUẦN' : timeFilter === 'month' ? 'THEO THÁNG' : 'THEO NĂM'}`], [""],
            ["Ngày xuất báo cáo:", currentDate],
            ["Số kỳ báo cáo:", historicalData.length.toString()],
            [""],
         ];

         // Tạo dữ liệu lịch sử
         const historyDetails = historicalData.map(item => ({
            "Thời gian": timeFilter === 'week' ? `Tuần ${item.timeValue}` :
               timeFilter === 'month' ? `Tháng ${item.timeValue}` :
                  `Năm ${item.timeValue}`,
            "Doanh thu": item.totalRevenue.toLocaleString() + " VND",
            "Tổng giá trị đơn hàng": item.totalOrderValue.toLocaleString() + " VND",
            "Tổng phí vận chuyển": item.totalShippingFee.toLocaleString() + " VND",
            "Số đơn hàng": item.totalOrders,
            "Giá trị TB/đơn": item.totalOrders > 0 ?
               Math.round(item.totalOrderValue / item.totalOrders).toLocaleString() + " VND" :
               "0 VND"
         }));

         // Tính tổng và trung bình các giá trị
         const totalRevenue = historicalData.reduce((sum, item) => sum + item.totalRevenue, 0);
         const totalOrderValue = historicalData.reduce((sum, item) => sum + item.totalOrderValue, 0);
         const totalShippingFee = historicalData.reduce((sum, item) => sum + item.totalShippingFee, 0);
         const totalOrders = historicalData.reduce((sum, item) => sum + item.totalOrders, 0);

         // Thêm dòng tổng vào cuối
         historyDetails.push({
            "Thời gian": "TỔNG CỘNG",
            "Doanh thu": totalRevenue.toLocaleString() + " VND",
            "Tổng giá trị đơn hàng": totalOrderValue.toLocaleString() + " VND",
            "Tổng phí vận chuyển": totalShippingFee.toLocaleString() + " VND",
            "Số đơn hàng": totalOrders,
            "Giá trị TB/đơn": totalOrders > 0 ?
               Math.round(totalOrderValue / totalOrders).toLocaleString() + " VND" :
               "0 VND"
         });

         // Tạo worksheet từ header
         const historySheet = XLSX.utils.aoa_to_sheet(historyHeader);

         // Thêm data chi tiết vào sheet
         XLSX.utils.sheet_add_json(historySheet, historyDetails, {
            origin: "A" + (historyHeader.length + 1),
            skipHeader: false
         });

         // Thiết lập merge cells cho tiêu đề
         const historyMerges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
         historySheet['!merges'] = historyMerges;

         // Thiết lập độ rộng cột
         historySheet['!cols'] = [
            { width: 15 }, // Thời gian
            { width: 20 }, // Doanh thu
            { width: 25 }, // Tổng giá trị đơn hàng
            { width: 25 }, // Tổng phí vận chuyển
            { width: 15 }, // Số đơn hàng
            { width: 20 }  // Giá trị TB/đơn
         ];

         // Thêm sheet vào workbook
         XLSX.utils.book_append_sheet(workbook, historySheet, 'Lịch sử');
      }

      // SHEET 4: KHÁCH HÀNG MỚI
      // -------------------
      if (newCustomers.length > 0) {
         // Tạo header cho sheet khách hàng mới
         const customerHeader = [
            ["BÁO CÁO KHÁCH HÀNG MỚI (7 NGÀY GẦN NHẤT)"], [""],
            ["Ngày xuất báo cáo:", currentDate],
            ["Số khách hàng mới:", newCustomers.length.toString()],
            [""],
         ];

         // Tạo dữ liệu khách hàng
         const customerDetails = newCustomers.map((customer, index) => ({
            "STT": index + 1,
            "Họ": customer.lastName,
            "Tên": customer.firstName,
            "Email": customer.email,
            "Số điện thoại": customer.phone || "Không có",
            "Ngày đăng ký": new Date(customer.createdAt).toLocaleDateString('vi-VN'),
            "Thời gian": formatTimeAgo(customer.createdAt)
         }));

         // Tạo worksheet từ header
         const customerSheet = XLSX.utils.aoa_to_sheet(customerHeader);

         // Thêm data chi tiết vào sheet
         XLSX.utils.sheet_add_json(customerSheet, customerDetails, {
            origin: "A" + (customerHeader.length + 1),
            skipHeader: false
         });

         // Thiết lập merge cells cho tiêu đề
         const customerMerges = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
         customerSheet['!merges'] = customerMerges;

         // Thiết lập độ rộng cột
         customerSheet['!cols'] = [
            { width: 5 },  // STT
            { width: 15 }, // Họ
            { width: 15 }, // Tên
            { width: 30 }, // Email
            { width: 15 }, // Số điện thoại
            { width: 15 }, // Ngày đăng ký
            { width: 20 }  // Thời gian
         ];

         // Thêm sheet vào workbook
         XLSX.utils.book_append_sheet(workbook, customerSheet, 'Khách hàng mới');
      }

      // Xuất file với tên có thương hiệu
      XLSX.writeFile(workbook, `CandleBliss_BaoCaoTaiChinh_${dateStr}.xlsx`);
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

   const updateChartData = (data: FinanceChartData) => {
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

   const fetchStatisticsData = useCallback(() => {
      // Không cần async vì không có API call

      // Filter orders with valid statuses for revenue calculation
      const validOrders = orders.filter(order => isRevenueCountableStatus(order.status));

      // Calculate statistics based on filtered orders
      const statsData = {
         totalRevenue: validOrders.reduce((sum, order) => sum + parseInt(order.total_price), 0),
         totalOrderValue: validOrders.reduce((sum, order) => sum + parseInt(order.total_price), 0),
         totalShippingFee: validOrders.reduce((sum, order) => sum + parseInt(order.ship_price), 0),
         totalOrders: validOrders.length
      };

      setStatsData(statsData);

      // Update chart data
      updateChartData(statsData);
   }, [orders, updateChartData]);

   // Nếu không có API lịch sử, chúng ta có thể tạo dữ liệu mẫu:
   const generateSampleHistoricalData = () => {
      const sampleData = [];
      const currentYear = new Date().getFullYear();

      if (timeFilter === 'month') {
         // Generate data for all 12 months
         for (let month = 1; month <= 12; month++) {
            // Create a base revenue that increases gradually with some randomization
            const baseRevenue = 800000 + (month * 100000) + (Math.random() * 300000);
            const baseOrderValue = baseRevenue * 0.92; // 92% of revenue is order value
            const baseShippingFee = baseRevenue * 0.08; // 8% is shipping fee
            const orders = Math.floor(5 + (month * 0.5) + (Math.random() * 3));

            sampleData.push({
               timeValue: month,
               totalRevenue: Math.round(baseRevenue),
               totalOrderValue: Math.round(baseOrderValue),
               totalShippingFee: Math.round(baseShippingFee),
               totalOrders: orders
            });
         }
      } else if (timeFilter === 'week') {
         // Generate data for all 52 weeks
         for (let week = 1; week <= 52; week++) {
            // Create a pattern where sales peak in certain periods
            let seasonMultiplier = 1;
            // Sales peak during holidays (weeks 48-52, 13-16, 26-30)
            if ((week >= 48 && week <= 52) || (week >= 13 && week <= 16) || (week >= 26 && week <= 30)) {
               seasonMultiplier = 1.5;
            }

            const baseRevenue = (200000 + (Math.random() * 150000)) * seasonMultiplier;
            const baseOrderValue = baseRevenue * 0.93;
            const baseShippingFee = baseRevenue * 0.07;
            const orders = Math.floor(2 + (Math.random() * 3) * seasonMultiplier);

            sampleData.push({
               timeValue: week,
               totalRevenue: Math.round(baseRevenue),
               totalOrderValue: Math.round(baseOrderValue),
               totalShippingFee: Math.round(baseShippingFee),
               totalOrders: orders
            });
         }
      } else {
         // Generate data for 5 years (current year - 2 to current year + 2)
         for (let yearOffset = -2; yearOffset <= 2; yearOffset++) {
            const year = currentYear + yearOffset;
            // Growth trend over years
            const yearMultiplier = 0.8 + (yearOffset + 2) * 0.15;

            const baseRevenue = 10000000 * yearMultiplier;
            const baseOrderValue = baseRevenue * 0.94;
            const baseShippingFee = baseRevenue * 0.06;
            const orders = Math.floor(100 * yearMultiplier);

            sampleData.push({
               timeValue: year,
               totalRevenue: Math.round(baseRevenue),
               totalOrderValue: Math.round(baseOrderValue),
               totalShippingFee: Math.round(baseShippingFee),
               totalOrders: orders
            });
         }
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
   const updateHistoricalChart = (data?: Array<{
      timeValue: number;
      totalRevenue: number;
      totalOrderValue: number;
      totalShippingFee: number;
      totalOrders: number;
   }>) => {
      const dataToUse = data || historicalData;
      if (dataToUse.length === 0) return;

      const labels = dataToUse.map(item => {
         if (timeFilter === 'month') return `T${item.timeValue}`;
         if (timeFilter === 'week') return `Tuần ${item.timeValue}`;
         return `${item.timeValue}`;
      });

      setChartData({
         labels,
         datasets: [
            {
               label: 'Tổng doanh thu',
               data: dataToUse.map(item => item.totalRevenue),
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
            },
            {
               label: 'Tổng giá trị đơn hàng',
               data: dataToUse.map(item => item.totalOrderValue),
               backgroundColor: 'rgba(168, 85, 247, 0.5)',
               borderColor: 'rgb(168, 85, 247)',
               borderWidth: 1,
            },
            {
               label: 'Tổng phí vận chuyển',
               data: dataToUse.map(item => item.totalShippingFee),
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               borderColor: 'rgb(34, 197, 94)',
               borderWidth: 1,
            }
         ]
      });
   };

   // Helper function to check if order status should be counted for revenue
   const isRevenueCountableStatus = (status: string) => {
      const validStatuses = [
         'Hoàn thành',
         'Đã hoàn thành đổi trả và hoàn tiền',
         'Hoàn tiền thất bại',
         'Đã từ chối đổi trả'
      ];
      return validStatuses.includes(status);
   };

   const fetchNewCustomers = async () => {
      if (newCustomersFetched) return; // Đã fetch rồi, không fetch nữa

      try {
         const token = localStorage.getItem('token');
         if (!token) return;

         const response = await fetch(`${HOST}/api/v1/users`, {
            headers: { Authorization: `Bearer ${token}` }
         });

         if (!response.ok) throw new Error('Failed to fetch customers');

         const data = await response.json();

         // Calculate date 7 days ago
         const sevenDaysAgo = new Date();
         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

         // Handle the case where the API returns an array directly
         if (Array.isArray(data)) {
            // Filter customers created within the last 7 days
            const recentCustomers = data
               .filter((user: { createdAt: string; role: { name: string } }) => {
                  const createdAt = new Date(user.createdAt);
                  return createdAt >= sevenDaysAgo && user.role && user.role.name === "User";
               })
               .map((user: { id: number; firstName: string; lastName: string; email: string; createdAt: string; phone?: number | null }) => ({
                  id: user.id,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email,
                  createdAt: user.createdAt,
                  phone: user.phone
               }));

            setNewCustomers(recentCustomers);
         }
         // Handle the original format where data is inside data.data
         else if (data && data.data) {
            const recentCustomers = data.data
               .filter((user: { createdAt: string; role: { name: string } }) => {
                  const createdAt = new Date(user.createdAt);
                  return createdAt >= sevenDaysAgo && user.role.name === "User";
               })
               .map((user: { id: number; firstName: string; lastName: string; email: string; createdAt: string; phone?: number | null }) => ({
                  id: user.id,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email,
                  createdAt: user.createdAt,
                  phone: user.phone
               }));

            setNewCustomers(recentCustomers);
         } else {
            console.error('Invalid response format:', data);
         }
      } catch (error) {
         console.error('Error fetching new customers:', error);
      } finally {
         setNewCustomersFetched(true); // Đánh dấu đã fetch
      }
   };

   // Add this helper function for formatting time ago:
   const formatTimeAgo = (dateString: string) => {
      try {
         const date = new Date(dateString);
         return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      } catch {
         return 'Không xác định';
      }
   };

   // Tối ưu hàm fetchHistoricalData với cơ chế cache
   const fetchHistoricalData = async () => {
      // Tạo key từ các tham số hiện tại
      const cacheKey = `${timeFilter}_${year}`;

      // Kiểm tra cache
      if (cachedHistoricalData[cacheKey]) {
         setHistoricalData(cachedHistoricalData[cacheKey]);
         updateHistoricalChart(cachedHistoricalData[cacheKey]);
         return;
      }

      try {
         setLoading(true);
         let allData = [];

         if (timeFilter === 'week') {
            // Fetch data for all 52 weeks
            const promises = [];
            for (let week = 1; week <= 52; week++) {
               promises.push(
                  fetch(`${HOST}/api/orders/statistics?timeFilter=week&timeValue=${week}&year=${year}`)
                     .then(res => res.ok ? res.json() : null)
               );
            }
            const results = await Promise.all(promises);
            allData = results.filter(Boolean).map((data, index) => ({
               timeValue: index + 1,
               totalRevenue: data.totalRevenue || 0,
               totalOrderValue: data.totalOrderValue || 0,
               totalShippingFee: data.totalShippingFee || 0,
               totalOrders: data.totalOrders || 0
            }));
         } else if (timeFilter === 'month') {
            // Fetch data for all 12 months
            const promises = [];
            for (let month = 1; month <= 12; month++) {
               promises.push(
                  fetch(`${HOST}/api/orders/statistics?timeFilter=month&timeValue=${month}&year=${year}`)
                     .then(res => res.ok ? res.json() : null)
               );
            }
            const results = await Promise.all(promises);
            allData = results.filter(Boolean).map((data, index) => ({
               timeValue: index + 1,
               totalRevenue: data.totalRevenue || 0,
               totalOrderValue: data.totalOrderValue || 0,
               totalShippingFee: data.totalShippingFee || 0,
               totalOrders: data.totalOrders || 0
            }));
         } else {
            // Sửa đổi cho lọc theo năm
            const currentYear = new Date().getFullYear();
            const startYear = currentYear - 2;
            const endYear = currentYear + 2;

            const promises = [];
            for (let yearVal = startYear; yearVal <= endYear; yearVal++) {
               // Bỏ tham số timeValue khi lọc theo năm
               promises.push(
                  fetch(`${HOST}/api/orders/statistics?timeFilter=year&year=${yearVal}`)
                     .then(res => res.ok ? res.json() : null)
               );
            }
            const results = await Promise.all(promises);
            console.log("Year filter API results:", results); // Log kết quả API

            allData = results.filter(Boolean).map((data, index) => ({
               timeValue: startYear + index,
               totalRevenue: data?.totalRevenue || 0,
               totalOrderValue: data?.totalOrderValue || 0,
               totalShippingFee: data?.totalShippingFee || 0,
               totalOrders: data?.totalOrders || 0
            }));
         }

         if (allData.length > 0) {
            console.log("Historical data processed:", allData);
            // Lưu vào cache
            setCachedHistoricalData(prev => ({
               ...prev,
               [cacheKey]: allData
            }));
            setHistoricalData(allData);
            updateHistoricalChart(allData);
         } else {
            console.log("No historical data returned, falling back to sample data");
            // Sử dụng dữ liệu mẫu khi không có dữ liệu thật
            generateSampleHistoricalData();
         }
      } catch (error) {
         console.error('Error fetching historical data:', error);
         // Fallback to sample data on error
         generateSampleHistoricalData();
      } finally {
         setLoading(false);
      }
   };

   const handleChartViewChange = (view: 'current' | 'historical') => {
      setChartView(view);

      // If switching to current view, update timeValue to current period
      if (view === 'current') {
         const now = new Date();
         if (timeFilter === 'month') {
            setTimeValue(now.getMonth() + 1); // current month (1-12)
         } else if (timeFilter === 'week') {
            // Calculate current week number
            const start = new Date(now.getFullYear(), 0, 1);
            const weekNumber = Math.ceil((((now.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
            setTimeValue(weekNumber);
         } else {
            setTimeValue(now.getFullYear()); // current year
         }
      }
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
                              <option value="week">Tuần</option>
                              <option value="month">Tháng</option>
                              <option value="year">Năm</option>
                           </select>
                        </div>

                        <button
                           onClick={exportFinancialOverview}
                           className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm hover:shadow mr-2'
                        >
                           <Download size={18} />
                           <span>Xuất báo cáo tổng quan</span>
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
                                    onClick={() => handleChartViewChange('current')}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${chartView === 'current'
                                       ? 'bg-amber-500 text-white'
                                       : 'bg-white text-gray-700 hover:bg-gray-50'
                                       } border border-gray-200`}
                                 >
                                    Kỳ hiện tại
                                 </button>
                                 <button
                                    onClick={() => handleChartViewChange('historical')}
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
                           <div className="mt-4 text-center text-sm text-gray-500">
                              {chartView === 'current' ? (
                                 <span>Đang hiển thị dữ liệu cho {timeFilter === 'month'
                                    ? `Tháng ${timeValue}/${year}`
                                    : timeFilter === 'week'
                                       ? `Tuần ${timeValue}/${year}`
                                       : `Năm ${timeValue}`}
                                 </span>
                              ) : (
                                 <span>Đang hiển thị dữ liệu lịch sử cho tất cả {timeFilter === 'month'
                                    ? 'các tháng'
                                    : timeFilter === 'week'
                                       ? 'các tuần'
                                       : 'các năm'}
                                 </span>
                              )}
                           </div>
                        </section>

                        {/* New Customers Section */}
                        <section className='mb-8 bg-white p-6 rounded-xl shadow-sm'>
                           <div className='flex justify-between items-center mb-6'>
                              <div>
                                 <h2 className='text-lg font-semibold'>Khách hàng mới</h2>
                                 <p className='text-sm text-gray-600 mt-1'>
                                    Khách hàng đăng ký trong 7 ngày qua
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
                              {loading ? (
                                 <div className="col-span-full flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                 </div>
                              ) : newCustomers.length > 0 ? (
                                 newCustomers.map((customer) => (
                                    <div
                                       key={customer.id}
                                       className='flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all'
                                    >
                                       <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-amber-50 flex items-center justify-center text-amber-700 font-medium'>
                                          {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                       </div>
                                       <div className='ml-3'>
                                          <p className='font-medium text-gray-800'>{customer.firstName} {customer.lastName}</p>
                                          <p className='text-xs text-gray-500'>{formatTimeAgo(customer.createdAt)}</p>
                                          <p className='text-xs text-gray-500'>{customer.email}</p>
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div className="col-span-full text-center py-8 text-gray-500">
                                    Không có khách hàng mới trong 7 ngày qua
                                 </div>
                              )}
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
                                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Hoàn thành'
                                                      ? 'bg-green-100 text-green-700'
                                                      : order.status === 'Đã hoàn thành đổi trả và hoàn tiền'
                                                         ? 'bg-blue-100 text-blue-700'
                                                         : order.status === 'Hoàn tiền thất bại'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
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
                              {orders
                                 .filter(order => order.user && order.user.name)
                                 .slice(0, 8) // Giới hạn số lượng hiển thị
                                 .map((order) => (
                                    <div
                                       key={order.user_id}
                                       className='flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all'
                                    >
                                       <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center'>
                                          {order.user?.name.charAt(0).toUpperCase() || 'K'}
                                       </div>
                                       <div className='ml-3'>
                                          <p className='font-medium text-gray-800'>{order.user?.name}</p>
                                          <p className='text-xs text-gray-500'>{order.user?.phone || 'Không có SĐT'}</p>
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