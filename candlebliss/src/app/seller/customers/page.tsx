'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Trash2, Eye,
    ArrowLeft, ArrowRight, Download, RefreshCcw, ChevronDown, X
} from 'lucide-react';
import Sidebar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { HOST } from '@/app/constants/api'

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
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    hasNextPage?: boolean;
}

export default function CustomerPage() {
    // State management
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');

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

            // Handle the case where the API returns an array directly
            if (Array.isArray(data)) {
                // Filter users with role 'User'
                const userCustomers = data.filter(user =>
                    user.role && user.role.name === 'User'
                );

                setCustomers(userCustomers);

                // Since we have all data at once, implement client-side pagination
                setPagination({
                    currentPage: page,
                    totalPages: Math.ceil((userCustomers.length || 1) / pagination.limit),
                    total: userCustomers.length || 0,
                    limit: pagination.limit,
                    hasNextPage: page < Math.ceil((userCustomers.length || 1) / pagination.limit)
                });
            }
            // Handle the original format where data is inside data.data
            else if (data && data.data) {
                const userCustomers = data.data.filter((user: Customer) =>
                    user.role && user.role.name === 'User'
                );

                setCustomers(userCustomers);

                if (data.pagination) {
                    setPagination({
                        currentPage: data.pagination.currentPage || 1,
                        totalPages: data.pagination.totalPages || 1,
                        total: data.pagination.total || 0,
                        limit: data.pagination.limit || 10,
                        hasNextPage: !!data.pagination.hasNextPage
                    });
                } else {
                    setPagination({
                        currentPage: page,
                        totalPages: Math.ceil((userCustomers.length || 1) / pagination.limit),
                        total: userCustomers.length || 0,
                        limit: pagination.limit,
                        hasNextPage: false
                    });
                }
            } else {
                console.error('Invalid response format:', data);
                setLoading(false);
                return;
            }

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

        return [...filtered].sort((a, b) => {
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
                                                <td colSpan={6} className='px-6 py-12 text-center'>
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
                                                            <div className='h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-amber-50 flex items-center justify-center text-amber-700 font-medium'>
                                                                {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                                            </div>
                                                            <div className='ml-4'>
                                                                <div className='text-sm font-medium text-gray-900'>
                                                                    {customer.firstName} {customer.lastName}
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
                                                <td colSpan={6} className='px-6 py-12 text-center'>
                                                    <p className='text-gray-500'>Không tìm thấy khách hàng nào</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
                                <div className='text-sm text-gray-500'>
                                    Hiển thị {customers?.length || 0} khách hàng
                                    (Trang {pagination?.currentPage || 1}/{pagination?.totalPages || 1},
                                    Tổng {pagination?.total || 0} khách hàng)
                                </div>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={prevPage}
                                        disabled={!pagination || pagination.currentPage <= 1}
                                        className={`p-2 rounded-md border ${!pagination || pagination.currentPage <= 1
                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <span className='px-4 py-1.5 bg-white border rounded-md text-sm'>
                                        Trang {pagination?.currentPage || 1}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={!pagination || !pagination.hasNextPage}
                                        className={`p-2 rounded-md border ${!pagination || !pagination.hasNextPage
                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ArrowRight size={16} />
                                    </button>
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
                                    <div className='flex justify-center'>
                                        <div className='h-24 w-24 rounded-full overflow-hidden border border-gray-200 bg-amber-50 flex items-center justify-center text-amber-700 text-3xl font-medium'>
                                            {selectedCustomer.firstName?.charAt(0)}{selectedCustomer.lastName?.charAt(0)}
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
                                            <p className='text-sm text-gray-500'>Trạng thái</p>
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
                                    </div>
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
        </div>
    );
}