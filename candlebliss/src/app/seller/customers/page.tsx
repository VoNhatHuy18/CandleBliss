'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Trash2, Eye,
    ArrowLeft, ArrowRight, Download, RefreshCcw, ChevronDown, X, ShoppingBag, ExternalLink
} from 'lucide-react';
import Sidebar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { HOST } from '@/app/constants/api'
import Image from 'next/image';
import Link from 'next/link';

interface Customer {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: {
        id: number;
        name: string;
    };
    status: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    isSvip?: boolean; // Add this new property
    orderCount?: number; // Add this property to store order count
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    hasNextPage?: boolean;
}

// Định nghĩa interface Order
interface Order {
    id: number;
    order_code: string;
    user_id: number;
    cancelReason: string | null;
    status: string;
    address: string;
    total_quantity: number;
    total_price: string;
    discount: string;
    ship_price: string;
    voucher_id: string;
    method_payment: string;
    cancel_images: Array<{ path: string }> | null;
    createdAt: string;
    updatedAt: string;
    item: {
        id: number;
        status: string;
        unit_price: string;
        product_detail_id: number;
        product_id: string;
        quantity: number;
        totalPrice: string;
        __entity: string;
        product_name?: string;
        product_image?: string | null;
        product_detail?: {
            id: number;
            size?: string;
            values?: string;
            type?: string;
        };
    }[];
    __entity: string;
}

// Định nghĩa màu sắc trạng thái đơn hàng
const orderStatusColors: Record<string, string> = {
    'Đơn hàng vừa được tạo': 'bg-blue-100 text-blue-800',
    'Đang chờ thanh toán': 'bg-blue-100 text-blue-800',
    'Thanh toán thất bại': 'bg-red-100 text-red-800',
    'Thanh toán thành công': 'bg-green-100 text-green-800',
    'Đang xử lý': 'bg-yellow-100 text-yellow-800',
    'Đã đặt hàng': 'bg-blue-100 text-blue-800',
    'Đang giao hàng': 'bg-purple-100 text-purple-800',
    'Hoàn thành': 'bg-green-100 text-green-800',
    'Đã huỷ': 'bg-red-100 text-red-800',
    'Đổi trả hàng': 'bg-yellow-100 text-yellow-800',
};

export default function CustomerPage() {
    // State management
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');

    // Thêm state cho tab và đơn hàng - chuyển vào trong component
    const [activeTab, setActiveTab] = useState<string>('info');
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

    // Initialize with safe defaults
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10,
        hasNextPage: true
    });
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    // Form states for editing
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 1
    });

    // State cho modal chi tiết đơn hàng
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState<boolean>(false);

    const fetchCustomers = async (page: number = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setLoading(false);
                return;
            }

            // Update the API endpoint to use /v1/users without query parameters
            const response = await fetch(`${HOST}/api/v1/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();

            let userCustomers: Customer[] = [];

            // Handle the case where the API returns an array directly
            if (Array.isArray(data)) {
                // Filter users with role 'User'
                userCustomers = data.filter(user =>
                    user.role && user.role.name === 'User'
                );
            }
            // Handle the original format where data is inside data.data
            else if (data && data.data) {
                userCustomers = data.data.filter((user: Customer) =>
                    user.role && user.role.name === 'User'
                );
            } else {
                console.error('Invalid response format:', data);
                setLoading(false);
                return;
            }

            // Check SVIP status for each customer by fetching their orders
            const customersWithSvipStatus = await Promise.all(
                userCustomers.map(async (customer) => {
                    try {
                        const ordersResponse = await fetch(`${HOST}/api/orders?user_id=${customer.id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (ordersResponse.ok) {
                            const ordersData = await ordersResponse.json();
                            const orders = Array.isArray(ordersData) ? ordersData : [];
                            const orderCount = orders.length;
                            const isSvip = orderCount >= 20;

                            return {
                                ...customer,
                                isSvip,
                                orderCount
                            };
                        }

                        return customer;
                    } catch (error) {
                        console.error(`Error checking SVIP status for customer ${customer.id}:`, error);
                        return customer;
                    }
                })
            );

            setCustomers(customersWithSvipStatus);

            // Update pagination with a limit of 10 users per page
            const limit = 10;
            const total = customersWithSvipStatus.length;
            const totalPages = Math.ceil(total / limit);

            setPagination({
                currentPage: page,
                totalPages: totalPages,
                total: total,
                limit: limit,
                hasNextPage: page < totalPages
            });

        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };
    // Cập nhật các hàm xử lý phân trang
    const nextPage = () => {
        if (pagination.currentPage < pagination.totalPages) {
            fetchCustomers(pagination.currentPage + 1);
        }
    };

    const prevPage = () => {
        if (pagination.currentPage > 1) {
            fetchCustomers(pagination.currentPage - 1);
        }
    };

    // Fetch customer details
    const fetchCustomerDetails = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${HOST}/api/v1/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }

            const data = await response.json();
            setSelectedCustomer(data);

            // Initialize edit form with customer data
            setEditForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                status: data.status?.id || 1
            });

        } catch (error) {
            console.error('Error fetching customer details:', error);
        }
    };

    // Thêm hàm formatPrice cho việc hiển thị giá
    const formatPrice = (price: string | number): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(numPrice);
    };

    // Thêm hàm fetch đơn hàng của khách hàng
    const fetchProductInfo = async (productId: string, item: Order['item'][0], token: string) => {
        try {
            const response = await fetch(`${HOST}/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.log(`Product API returned status ${response.status} for product ID ${productId}`);
                return {
                    ...item,
                    product_name: `Sản phẩm #${productId}`,
                    product_image: null,
                };
            }

            const productData = await response.json();

            // Kiểm tra xem productData có đúng định dạng không
            if (!productData || typeof productData !== 'object') {
                console.log(`Invalid product data format for product ID ${productId}`);
                return {
                    ...item,
                    product_name: `Sản phẩm #${productId}`,
                    product_image: null,
                };
            }

            // Thêm thông tin sản phẩm vào item
            return {
                ...item,
                product_name: productData.name || `Sản phẩm #${productId}`,
                product_image: productData.images?.[0]?.path || null,
                product_detail: productData.details?.find(
                    (detail: { id: number; size?: string; values?: string; type?: string }) => detail.id === item.product_detail_id
                ) || null
            };
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return {
                ...item,
                product_name: `Sản phẩm #${productId}`,
                product_image: null,
            };
        }
    };

    const fetchCustomerOrders = async (userId: number) => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setOrdersLoading(false);
                return;
            }

            const response = await fetch(`${HOST}/api/orders?user_id=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch customer orders');
            }

            const data = await response.json();

            // Xử lý dữ liệu trả về
            let orders = [];

            // Kiểm tra cấu trúc data
            if (Array.isArray(data)) {
                orders = data;
            } else if (data && typeof data === 'object') {
                // Nếu API trả về một object đơn lẻ có __entity là OrdersEntity hoặc có id
                if (data.__entity === 'OrdersEntity' || data.id) {
                    orders = [data];
                }
                // Nếu API trả về dạng {data: [...]}
                else if (data.data && Array.isArray(data.data)) {
                    orders = data.data;
                }
            }

            if (orders.length === 0) {
                setCustomerOrders([]);
                setOrdersLoading(false);
                return;
            }

            // Phải copy ra một mảng mới để không ảnh hưởng đến dữ liệu gốc
            const ordersWithProductDetails = [...orders];

            // Fetch thông tin sản phẩm cho mỗi item trong đơn hàng
            const fetchPromises = [];
            for (let orderIndex = 0; orderIndex < ordersWithProductDetails.length; orderIndex++) {
                const order = ordersWithProductDetails[orderIndex];

                if (order.item && Array.isArray(order.item)) {
                    for (let itemIndex = 0; itemIndex < order.item.length; itemIndex++) {
                        const item = order.item[itemIndex];
                        if (item.product_id) {
                            // Thêm promise vào danh sách
                            fetchPromises.push(
                                fetchProductInfo(item.product_id, item, token).then(updatedItem => {
                                    // Cập nhật item trong order
                                    ordersWithProductDetails[orderIndex].item[itemIndex] = updatedItem;
                                })
                            );
                        }
                    }
                }
            }

            // Đợi tất cả các promise hoàn thành
            await Promise.all(fetchPromises);

            // Cập nhật state với dữ liệu đã có thông tin sản phẩm
            setCustomerOrders(ordersWithProductDetails);
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            setCustomerOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Delete customer
    const deleteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${HOST}/api/v1/users/${selectedCustomer.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            // Refresh the customer list
            fetchCustomers(1);
            setShowModal(false);

        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    // Handle view/edit/delete actions
    const handleAction = (customer: Customer, action: 'view' | 'edit' | 'delete') => {
        setSelectedCustomer(customer);
        setModalMode(action);
        fetchCustomerDetails(customer.id);

        // Reset activeTab về tab thông tin khi mở modal mới
        setActiveTab('info');

        // Nếu là view mode, fetch đơn hàng của khách hàng
        if (action === 'view') {
            fetchCustomerOrders(customer.id);
        }

        setShowModal(true);
    };

    // Filter customers based on search term and filters
    const getFilteredCustomers = () => {
        return customers.filter(customer => {
            // Search filtering
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase().trim();
                const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
                const email = customer.email?.toLowerCase() || '';
                const phone = customer.phone?.toString() || '';

                const matchesSearch =
                    fullName.includes(searchLower) ||
                    email.includes(searchLower) ||
                    phone.includes(searchTerm);

                if (!matchesSearch) return false;
            }

            // Status filtering
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && customer.status.name !== 'Active') return false;
                if (statusFilter === 'inactive' && customer.status.name !== 'Inactive') return false;
            }

            return true;
        });
    };

    const getSortedCustomers = () => {
        const filtered = getFilteredCustomers();
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name-asc':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'name-desc':
                    return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
                default:
                    return 0;
            }
        });

        // Calculate the starting and ending indices for the current page
        const startIndex = (pagination.currentPage - 1) * 10;
        const endIndex = startIndex + 10;

        // Return only the customers for the current page
        return sorted.slice(startIndex, endIndex);
    };

    // Export customers to CSV
    const exportCustomers = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const data = getSortedCustomers().map(c => ({
            ID: c.id,
            'Họ': c.lastName,
            'Tên': c.firstName,
            'Email': c.email,
            'Số điện thoại': c.phone || '',
            'Trạng thái': c.status.name,
            'Ngày tạo': format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm')
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataFile = new Blob([excelBuffer], { type: fileType });
        saveAs(dataFile, `khach-hang-${format(new Date(), 'dd-MM-yyyy')}${fileExtension}`);
    };

    // Initialize component
    useEffect(() => {
        fetchCustomers(1);
    }, []);

    const openOrderDetail = (order: Order) => {
        setSelectedOrder(order);
        setShowOrderDetailModal(true);
    };

    return (
        <div className='flex h-screen bg-gray-50'>
            <Sidebar />

            <div className='flex flex-col flex-1 overflow-hidden'>
                <Header />
                <main className='flex-1 overflow-y-auto p-6'>
                    <div className='container mx-auto px-2 md:px-4'>
                        {/* Page Title */}
                        <div className='flex justify-between items-center mb-8'>
                            <div>
                                <h1 className='text-2xl font-bold text-gray-800'>Quản Lý Khách Hàng</h1>
                                <p className='text-gray-500 mt-1'>
                                    Quản lý và theo dõi danh sách khách hàng của cửa hàng
                                </p>
                            </div>

                            <div className='flex items-center gap-3'>
                                <button
                                    onClick={() => fetchCustomers(1)}
                                    className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all'
                                    title='Làm mới'
                                >
                                    <RefreshCcw size={20} />
                                </button>

                                <button
                                    onClick={exportCustomers}
                                    className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm hover:shadow'
                                >
                                    <Download size={18} />
                                    <span>Xuất Excel</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters & Search */}
                        <div className='bg-white p-4 rounded-xl shadow-sm mb-6'>
                            <div className='flex flex-col sm:flex-row justify-between gap-4'>
                                <div className='relative flex-1'>
                                    <Search
                                        className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                        size={18}
                                    />
                                    <input
                                        type='text'
                                        placeholder='Tìm kiếm khách hàng...'
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                    />
                                </div>

                                <div className='flex gap-2'>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className='flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-all'
                                    >
                                        <Filter size={18} className='text-gray-500' />
                                        <span className='text-sm font-medium'>Lọc</span>
                                        <ChevronDown size={16} className='text-gray-500' />
                                    </button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className='mt-4 pt-4 border-t border-gray-100'>
                                    <div className='flex flex-wrap gap-4'>
                                        <div className='w-full sm:w-auto'>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Trạng thái</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className='w-full sm:w-40 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            >
                                                <option value='all'>Tất cả</option>
                                                <option value='active'>Hoạt động</option>
                                                <option value='inactive'>Không hoạt động</option>
                                            </select>
                                        </div>
                                        <div className='w-full sm:w-auto'>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Sắp xếp theo</label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className='w-full sm:w-48 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            >
                                                <option value='newest'>Mới nhất</option>
                                                <option value='oldest'>Cũ nhất</option>
                                                <option value='name-asc'>Tên (A-Z)</option>
                                                <option value='name-desc'>Tên (Z-A)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customer Table */}
                        <div className='bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100'>
                            <div className='overflow-x-auto'>
                                <table className='min-w-full divide-y divide-gray-200'>
                                    <thead>
                                        <tr className='bg-gray-50'>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Khách hàng
                                            </th>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Email
                                            </th>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Số điện thoại
                                            </th>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Trạng thái
                                            </th>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Đơn hàng
                                            </th>
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Ngày tham gia
                                            </th>
                                            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='bg-white divide-y divide-gray-200'>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className='px-6 py-12 text-center'>
                                                    <div className='flex justify-center'>
                                                        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500'></div>
                                                    </div>
                                                    <p className='mt-2 text-sm text-gray-500'>Đang tải dữ liệu...</p>
                                                </td>
                                            </tr>
                                        ) : getSortedCustomers().length > 0 ? (
                                            getSortedCustomers().map((customer) => (
                                                <tr key={customer.id} className='hover:bg-gray-50'>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center'>
                                                            <div className={`h-10 w-10 rounded-full overflow-hidden border border-gray-200 ${customer.isSvip ? 'bg-amber-100' : 'bg-gray-50'} flex items-center justify-center text-amber-700 font-medium`}>
                                                                {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                            </div>
                                                            <div className='ml-4'>
                                                                <div className='flex items-center gap-2'>
                                                                    <span className='text-sm font-medium text-gray-900'>
                                                                        {customer.firstName} {customer.lastName}
                                                                    </span>
                                                                    {customer.isSvip && (
                                                                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-600 to-amber-400 text-white'>
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-3 w-3 mr-1"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                                />
                                                                            </svg>
                                                                            SVIP
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        {customer.email}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        {customer.phone || '-'}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${customer.status.name === 'Active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'}`}
                                                        >
                                                            {customer.status.name === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center'>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(customer.orderCount ?? 0) >= 20
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {customer.orderCount || 0} đơn
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                        {format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                                        <div className='flex justify-end gap-2'>
                                                            <button
                                                                onClick={() => handleAction(customer, 'view')}
                                                                className='p-1.5 rounded-md hover:bg-amber-50 text-amber-500'
                                                                title='Xem chi tiết'
                                                            >
                                                                <Eye size={18} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleAction(customer, 'delete')}
                                                                className='p-1.5 rounded-md hover:bg-red-50 text-red-500'
                                                                title='Xóa'
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className='px-6 py-12 text-center'>
                                                    <p className='text-gray-500'>Không tìm thấy khách hàng nào</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className='bg-white px-4 py-3 border-t border-gray-200 sm:px-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                                        <div>
                                            <p className='text-sm text-gray-700'>
                                                Hiển thị <span className='font-medium'>
                                                    {pagination.currentPage === pagination.totalPages ?
                                                        (pagination.total - (pagination.currentPage - 1) * pagination.limit) :
                                                        pagination.limit}
                                                </span> trong số{' '}
                                                <span className='font-medium'>{pagination.total}</span> khách hàng
                                            </p>
                                        </div>
                                        <div>
                                            <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px' aria-label='Pagination'>
                                                <button
                                                    onClick={prevPage}
                                                    disabled={pagination.currentPage === 1}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className='sr-only'>Previous</span>
                                                    <ArrowLeft size={16} />
                                                </button>

                                                {/* Page numbers */}
                                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => fetchCustomers(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.currentPage
                                                            ? 'bg-amber-50 border-amber-500 text-amber-600'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={nextPage}
                                                    disabled={!pagination.hasNextPage}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!pagination.hasNextPage
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className='sr-only'>Next</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>

                                    {/* Mobile pagination */}
                                    <div className='flex sm:hidden items-center justify-between'>
                                        <button
                                            onClick={prevPage}
                                            disabled={pagination.currentPage === 1}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.currentPage === 1
                                                ? 'bg-white text-gray-300 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Trước
                                        </button>

                                        <p className='text-sm text-gray-700'>
                                            <span className='font-medium'>{pagination.currentPage}</span> / {pagination.totalPages}
                                        </p>

                                        <button
                                            onClick={nextPage}
                                            disabled={!pagination.hasNextPage}
                                            className={`relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 text-sm font-medium rounded-md ${!pagination.hasNextPage
                                                ? 'bg-white text-gray-300 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            Tiếp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal for View/Edit/Delete Customer */}
            {showModal && selectedCustomer && (
                <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                        <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                            <h3 className='text-xl font-bold text-gray-800'>
                                {modalMode === 'view' && `Thông tin khách hàng: ${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                                {modalMode === 'edit' && `Chỉnh sửa thông tin: ${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                                {modalMode === 'delete' && `Xóa khách hàng: ${selectedCustomer.firstName} ${selectedCustomer.lastName}?`}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className='text-gray-400 hover:text-gray-500'
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
                            {modalMode === 'view' && (
                                <div className='space-y-6'>
                                    {/* Tab Navigation */}
                                    <div className='border-b border-gray-200'>
                                        <div className='flex space-x-8'>
                                            <button
                                                onClick={() => setActiveTab('info')}
                                                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                                    ? 'border-amber-500 text-amber-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                Thông tin khách hàng
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('orders')}
                                                className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
                                                    ? 'border-amber-500 text-amber-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                Đơn hàng ({customerOrders.length})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Content - Thông tin khách hàng */}
                                    {activeTab === 'info' && (
                                        <div className='space-y-6'>
                                            <div className='flex justify-center'>
                                                <div className={`h-24 w-24 rounded-full overflow-hidden border border-gray-200 ${selectedCustomer.isSvip ? 'bg-amber-50' : 'bg-gray-50'} flex items-center justify-center text-amber-700 text-3xl font-medium relative`}>
                                                    {selectedCustomer.firstName?.charAt(0)}{selectedCustomer.lastName?.charAt(0)}

                                                    {/* SVIP Badge */}
                                                    {selectedCustomer.isSvip && (
                                                        <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full p-1.5">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Họ</p>
                                                    <p className='font-medium'>{selectedCustomer.lastName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Tên</p>
                                                    <p className='font-medium'>{selectedCustomer.firstName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Email</p>
                                                    <p className='font-medium'>{selectedCustomer.email}</p>
                                                </div>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Số điện thoại</p>
                                                    <p className='font-medium'>{selectedCustomer.phone || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Trạng thái tài khoản</p>
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${selectedCustomer.status.name === 'Active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'}`}
                                                    >
                                                        {selectedCustomer.status.name === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className='text-sm text-gray-500'>Ngày tạo tài khoản</p>
                                                    <p className='font-medium'>
                                                        {format(new Date(selectedCustomer.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                    </p>
                                                </div>
                                                {/* Add SVIP status */}
                                                <div>
                                                    <p className='text-sm text-gray-500'>Cấp độ khách hàng</p>
                                                    {selectedCustomer.isSvip ? (
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-600 to-amber-400 text-white mr-2">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-3 w-3 mr-1"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                    />
                                                                </svg>
                                                                SVIP
                                                            </span>
                                                            <span className="text-xs text-amber-700">
                                                                (Khách hàng VIP với {selectedCustomer.orderCount || 0}+ đơn hàng)
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                                                                Thành viên
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {selectedCustomer.orderCount !== undefined ? `(${selectedCustomer.orderCount}/20 đơn để đạt VIP)` : '(0/20 đơn để đạt VIP)'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Add order count */}
                                                <div>
                                                    <p className='text-sm text-gray-500'>Đơn hàng đã đặt</p>
                                                    <div className='flex items-center gap-2'>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(selectedCustomer.orderCount || 0) >= 20
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {selectedCustomer.orderCount || 0} đơn
                                                        </span>

                                                        {(selectedCustomer.orderCount || 0) > 0 && (
                                                            <button
                                                                onClick={() => setActiveTab('orders')}
                                                                className="text-xs text-amber-600 hover:text-amber-700 underline"
                                                            >
                                                                Xem tất cả
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab Content - Đơn hàng */}
                                    {activeTab === 'orders' && (
                                        <div className='space-y-4'>
                                            <div className='flex justify-between items-center'>
                                                <h3 className='text-lg font-medium text-gray-800'>Đơn hàng của khách hàng</h3>
                                                <button
                                                    onClick={() => {
                                                        if (selectedCustomer) {
                                                            fetchCustomerOrders(selectedCustomer.id);
                                                        }
                                                    }}
                                                    className='p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-all'
                                                    title='Làm mới'
                                                    disabled={ordersLoading}
                                                >
                                                    <RefreshCcw size={18} className={ordersLoading ? 'animate-spin' : ''} />
                                                </button>
                                            </div>

                                            {ordersLoading ? (
                                                <div className='flex justify-center py-12'>
                                                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500'></div>
                                                </div>
                                            ) : customerOrders && customerOrders.length > 0 ? (
                                                <div className="space-y-4">
                                                    {customerOrders.map((order) => (
                                                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                            {/* Phần header đơn hàng */}
                                                            <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
                                                                <div>
                                                                    <div className="flex items-center">
                                                                        <span className="text-gray-600 text-sm">Mã đơn: </span>
                                                                        <span className="ml-2 font-medium">{order.order_code}</span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 mt-1">
                                                                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${orderStatusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                                        {order.status}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => openOrderDetail(order)}
                                                                        className="flex items-center px-3 py-1 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors"
                                                                    >
                                                                        <Eye size={14} className="mr-1" />
                                                                        <span>Chi tiết</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Phần danh sách sản phẩm */}
                                                            <div className="p-4">
                                                                {order.item && order.item.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {order.item.map((item) => (
                                                                            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                                                                {/* Ảnh sản phẩm */}
                                                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                                                                                    {item.product_image ? (
                                                                                        <Image
                                                                                            src={item.product_image}
                                                                                            alt={item.product_name || `Sản phẩm #${item.product_id}`}
                                                                                            width={64}
                                                                                            height={64}
                                                                                            className="object-cover w-full h-full"
                                                                                            unoptimized // Thêm tùy chọn này để tránh lỗi với URL không được xác thực
                                                                                            onError={(e) => {
                                                                                                // Fallback khi ảnh lỗi
                                                                                                e.currentTarget.onerror = null;
                                                                                                e.currentTarget.style.display = 'none';
                                                                                                if (e.currentTarget.parentElement) {
                                                                                                    e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>`;
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <ShoppingBag size={24} />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="font-medium truncate">
                                                                                        {item.product_name || `Sản phẩm ID: ${item.product_id}`}
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                                        {item.product_detail && (
                                                                                            <>
                                                                                                {item.product_detail.size && (
                                                                                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                                        {item.product_detail.size}
                                                                                                    </span>
                                                                                                )}
                                                                                                {item.product_detail.values && (
                                                                                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                                        {item.product_detail.values}
                                                                                                    </span>
                                                                                                )}
                                                                                            </>
                                                                                        )}
                                                                                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                                                                                            {item.quantity} x {formatPrice(item.unit_price)}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="font-medium text-amber-600">
                                                                                    {formatPrice(item.totalPrice)}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-3 text-gray-500">
                                                                        Không có thông tin sản phẩm
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Phần footer đơn hàng */}
                                                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                                                                <div>
                                                                    <span className="text-gray-600 text-sm">Số lượng: </span>
                                                                    <span className="font-medium">{order.total_quantity}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs text-gray-500">Tổng tiền:</div>
                                                                    <div className="font-bold text-amber-600">{formatPrice(order.total_price)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className='text-center py-12 border rounded-lg bg-gray-50'>
                                                    <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
                                                    <p className='text-gray-500'>Khách hàng chưa có đơn hàng nào</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalMode === 'edit' && (
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Họ</label>
                                            <input
                                                type='text'
                                                value={editForm.lastName}
                                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Tên</label>
                                            <input
                                                type='text'
                                                value={editForm.firstName}
                                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                                            <input
                                                type='email'
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                                            <input
                                                type='text'
                                                value={editForm.phone || ''}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1'>Trạng thái</label>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                                                className='w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
                                            >
                                                <option value={1}>Hoạt động</option>
                                                <option value={2}>Không hoạt động</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'delete' && (
                                <div className='text-center py-6'>
                                    <div className='inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-100 text-red-500 mb-6'>
                                        <Trash2 size={40} />
                                    </div>
                                    <p className='text-lg text-gray-700 mb-2'>Bạn có chắc chắn muốn xóa khách hàng này?</p>
                                    <p className='text-gray-500'>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến khách hàng sẽ bị xóa vĩnh viễn.</p>
                                </div>
                            )}
                        </div>

                        <div className='p-6 border-t border-gray-100 flex justify-end gap-3'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all'
                            >
                                {modalMode === 'view' ? 'Đóng' : 'Hủy'}
                            </button>

                            {modalMode === 'delete' && (
                                <button
                                    onClick={deleteCustomer}
                                    className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all'
                                >
                                    Xác nhận xóa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chi tiết đơn hàng */}
            {showOrderDetailModal && selectedOrder && (
                <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                        <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                            <h3 className='text-xl font-bold text-gray-800'>
                                Chi tiết đơn hàng: {selectedOrder.order_code}
                            </h3>
                            <button
                                onClick={() => setShowOrderDetailModal(false)}
                                className='text-gray-400 hover:text-gray-500'
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
                            <div className='space-y-6'>
                                {/* Thông tin đơn hàng */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Mã đơn hàng</p>
                                        <p className='font-medium'>{selectedOrder.order_code}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-500'>Ngày đặt</p>
                                        <p className='font-medium'>
                                            {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-500'>Trạng thái</p>
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${orderStatusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-500'>Phương thức thanh toán</p>
                                        <p className='font-medium'>{selectedOrder.method_payment || 'COD'}</p>
                                    </div>
                                </div>

                                <div className='border-t pt-4'>
                                    <h4 className='font-medium text-gray-800 mb-3'>Địa chỉ giao hàng</h4>
                                    <p className='text-gray-700'>{selectedOrder.address}</p>
                                </div>

                                {/* Danh sách sản phẩm */}
                                <div className='border-t pt-4'>
                                    <h4 className='font-medium text-gray-800 mb-3'>Sản phẩm ({selectedOrder.item?.length || 0})</h4>
                                    {selectedOrder.item && selectedOrder.item.length > 0 ? (
                                        <div className='space-y-3'>
                                            {selectedOrder.item.map(item => (
                                                <div key={item.id} className="border border-gray-200 p-3 rounded-lg flex items-start gap-3">
                                                    {/* Ảnh sản phẩm */}
                                                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                                                        {item.product_image ? (
                                                            <Image
                                                                src={item.product_image}
                                                                alt={item.product_name || `Sản phẩm #${item.product_id}`}
                                                                width={64}
                                                                height={64}
                                                                className="object-cover w-full h-full"
                                                                unoptimized // Thêm tùy chọn này để tránh lỗi với URL không được xác thực
                                                                onError={(e) => {
                                                                    // Fallback khi ảnh lỗi
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.style.display = 'none';
                                                                    if (e.currentTarget.parentElement) {
                                                                        e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>`;
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <ShoppingBag size={24} />
                                                        )}
                                                    </div>

                                                    {/* Thông tin sản phẩm */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-medium text-gray-800">
                                                                    {item.product_name || `Sản phẩm ID: ${item.product_id}`}
                                                                </p>

                                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                                    {item.product_detail ? (
                                                                        <>
                                                                            {item.product_detail.size && (
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                    Size: {item.product_detail.size}
                                                                                </span>
                                                                            )}
                                                                            {item.product_detail.values && (
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                    Loại: {item.product_detail.values}
                                                                                </span>
                                                                            )}
                                                                            {item.product_detail.type && (
                                                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                    {item.product_detail.type}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                            Chi tiết SP: #{item.product_detail_id}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="font-medium text-amber-600">
                                                                {formatPrice(item.totalPrice)}
                                                            </p>
                                                        </div>

                                                        <div className="flex justify-between items-center mt-3">
                                                            <p className="text-sm text-gray-600">
                                                                Đơn giá: {formatPrice(item.unit_price)}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <p className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-sm">
                                                                    Số lượng: {item.quantity}
                                                                </p>
                                                                {item.product_id && (
                                                                    <Link href={`/seller/products/${item.product_id}`} target="_blank">
                                                                        <button className="text-xs flex items-center gap-1 px-2 py-0.5 border border-gray-200 rounded hover:bg-gray-50">
                                                                            <ExternalLink size={12} />
                                                                            <span>Chi tiết SP</span>
                                                                        </button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-gray-500'>Không có thông tin sản phẩm</p>
                                    )}
                                </div>

                                {/* Thông tin thanh toán */}
                                <div className='border-t pt-4'>
                                    <h4 className='font-medium text-gray-800 mb-3'>Tổng thanh toán</h4>
                                    <div className='space-y-2'>
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Tạm tính:</span>
                                            <span>{formatPrice(
                                                // Tính tổng giá sản phẩm từ các item
                                                selectedOrder.item.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
                                            )}</span>
                                        </div>
                                        {parseFloat(selectedOrder.discount) > 0 && (
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>Giảm giá:</span>
                                                <span>-{formatPrice(selectedOrder.discount)}</span>
                                            </div>
                                        )}
                                        <div className='flex justify-between'>
                                            <span className='text-gray-600'>Phí vận chuyển:</span>
                                            <span>{formatPrice(selectedOrder.ship_price)}</span>
                                        </div>
                                        <div className='flex justify-between border-t pt-2 font-medium'>
                                            <span>Tổng cộng:</span>
                                            <span>{formatPrice(selectedOrder.total_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='p-6 border-t border-gray-100 flex justify-end gap-3'>
                            <button
                                onClick={() => setShowOrderDetailModal(false)}
                                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all'
                            >
                                Đóng
                            </button>

                            <Link href={`/seller/orders/${selectedOrder.id}`}>
                                <button className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all'>
                                    Xem đầy đủ
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}