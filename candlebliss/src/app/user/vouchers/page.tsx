'use client';

import React, { useState, useEffect } from 'react';
import VoucherTag from '@/app/components/user/vouchertags/VoucherTags';
import { HOST } from '@/app/constants/api';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

// Define the voucher interface to match your API response
interface Voucher {
    id: number;
    code: string;
    description: string;
    amount_off: string;
    percent_off: string;
    min_order_value: string;
    max_voucher_amount: string;
    usage_limit: number;
    usage_per_customer: number;
    start_date: string;
    end_date: string;
    new_customers_only: boolean;
    isActive: boolean;
    applicable_categories: string | null;
}

export default function VouchersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdvancedSearch] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        status: 'active', // Mặc định chỉ hiển thị voucher còn hiệu lực
    });

    // Fetch vouchers when component mounts
    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            try {
                // Fetch vouchers data from API using fetch
                const response = await fetch(`${HOST}/api/v1/vouchers`);

                if (!response.ok) {
                    throw new Error('Failed to fetch vouchers');
                }

                const data = await response.json();
                setVouchers(data);
                setError('');
            } catch (err) {
                console.error('Failed to fetch vouchers:', err);
                setError('Không thể tải mã giảm giá. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Determine voucher status
    const getVoucherStatus = (voucher: Voucher) => {
        if (!voucher.isActive) return 'Hết hiệu lực';

        const now = new Date();
        const endDate = new Date(voucher.end_date);

        if (endDate < now) return 'Hết hạn';
        return 'Còn hiệu lực';
    };

    // Filter vouchers based on search and filters
    const getFilteredVouchers = () => {
        return vouchers.filter((voucher) => {
            // First filter by search term (code)
            const searchMatch =
                searchTerm.trim() === '' ||
                voucher.code.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                voucher.description.toLowerCase().includes(searchTerm.toLowerCase().trim());

            // Then filter by status
            let statusMatch = true;
            const status = getVoucherStatus(voucher).toLowerCase();

            if (filterOptions.status === 'active') {
                statusMatch = status === 'còn hiệu lực';
            } else if (filterOptions.status === 'expired') {
                statusMatch = status !== 'còn hiệu lực';
            }
            // Nếu filterOptions.status === 'all' thì statusMatch vẫn là true

            return searchMatch && statusMatch;
        });
    };

    const filteredVouchers = getFilteredVouchers();

    // Format discount display
    const getDiscountText = (voucher: Voucher) => {
        if (parseFloat(voucher.percent_off) > 0) {
            return `${parseInt(voucher.percent_off)}%`;
        } else {
            return `${parseInt(voucher.amount_off).toLocaleString('vi-VN')}đ`;
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#F1EEE9] py-8">
                <div className="container mx-auto px-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <a href="/user/home" className="hover:text-amber-600">Trang chủ</a>
                        <span className="mx-2">/</span>
                        <span className="text-amber-600">Mã giảm giá</span>
                    </div>
                </div>
                <div className="container mx-auto px-4">
                    {/* Page header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Mã Giảm Giá Của Bạn</h1>
                        <p className="text-gray-600">Sử dụng các mã giảm giá sau để được hưởng ưu đãi khi mua sắm</p>
                    </div>

                    {/* Search bar */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="relative flex-1 w-full flex">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm mã giảm giá..."
                                    className="w-full px-4 py-2.5 pl-10 border border-r-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                />
                                <span className="absolute left-3 top-3 text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </span>

                                {/* Search button */}
                                <button className="px-4 bg-amber-500 text-white border border-amber-500 rounded-r-lg hover:bg-amber-600 transition-all">
                                    Tìm
                                </button>

                                {/* Clear search button - only show when there's text */}
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>


                        </div>

                        {/* Filter options */}
                        {showAdvancedSearch && (
                            <div className="w-full mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Status filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={filterOptions.status}
                                            onChange={(e) =>
                                                setFilterOptions({ ...filterOptions, status: e.target.value })
                                            }
                                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="active">Còn hiệu lực</option>
                                            <option value="expired">Hết hạn</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vouchers content container */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* Title section with counter */}
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Mã Giảm Giá</h2>
                            <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                                {filteredVouchers.length} mã
                            </span>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-red-400 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <p className="text-gray-500 max-w-md">{error}</p>
                            </div>
                        )}

                        {/* Empty state - no results found */}
                        {!loading && !error && filteredVouchers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-gray-300 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">
                                    {searchTerm ? 'Không tìm thấy mã voucher' : 'Không có mã giảm giá nào'}
                                </h3>
                                <p className="text-gray-500 max-w-md">
                                    {searchTerm
                                        ? `Không tìm thấy mã voucher phù hợp với "${searchTerm}". Vui lòng thử lại với từ khóa khác.`
                                        : 'Hiện tại không có mã giảm giá nào khả dụng. Vui lòng quay lại sau.'}
                                </p>
                            </div>
                        )}

                        {/* Voucher grid when we have data */}
                        {!loading && !error && filteredVouchers.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {filteredVouchers.map((voucher) => (
                                    <VoucherTag
                                        key={voucher.id}
                                        id={voucher.id.toString()}
                                        code={voucher.code}
                                        discount={getDiscountText(voucher)}
                                        description={voucher.description}
                                        minOrderValue={voucher.min_order_value}
                                        maxVoucherAmount={voucher.max_voucher_amount}
                                        usageLimit={voucher.usage_limit}
                                        usagePerCustomer={voucher.usage_per_customer}
                                        startDate={formatDate(voucher.start_date)}
                                        endDate={formatDate(voucher.end_date)}
                                        status={getVoucherStatus(voucher)}
                                        newCustomersOnly={voucher.new_customers_only}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Additional information */}
                        {!loading && !error && filteredVouchers.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-medium mb-2">Hướng dẫn sử dụng</h3>
                                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                    <li>Sao chép mã giảm giá và nhập vào ô mã giảm giá khi thanh toán</li>
                                    <li>Mỗi mã giảm giá chỉ được sử dụng một lần</li>
                                    <li>Chú ý điều kiện và thời hạn sử dụng của từng mã</li>
                                    <li>Một số mã giảm giá có giá trị đơn hàng tối thiểu để áp dụng</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}