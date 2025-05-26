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
    is_svip_only?: boolean; // Add SVIP flag
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
    const [activeTab, setActiveTab] = useState<'all' | 'vip'>('all');
    const [isSvip, setIsSvip] = useState(false);

    // Check user SVIP status
    useEffect(() => {
        const checkSvipStatus = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                // First check if we already know the SVIP status from localStorage
                const svipStatusKey = `user_${userId}_svip_status`;
                const cachedStatus = localStorage.getItem(svipStatusKey);

                if (cachedStatus) {
                    setIsSvip(cachedStatus === 'true');
                    return;
                }

                // If not in localStorage, check via API
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${HOST}/api/orders?user_id=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Error fetching user orders:', response.status);
                    return;
                }

                const orders = await response.json();

                // Check if user has 20 or more orders
                const userIsSvip = Array.isArray(orders) && orders.length >= 20;
                setIsSvip(userIsSvip);

                // Cache the result in localStorage for 24 hours
                localStorage.setItem(svipStatusKey, userIsSvip.toString());
                setTimeout(() => {
                    localStorage.removeItem(svipStatusKey);
                }, 24 * 60 * 60 * 1000); // 24 hours expiry
            } catch (error) {
                console.error('Error checking SVIP status:', error);
            }
        };

        checkSvipStatus();
    }, []);

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

    // Filter vouchers based on search, filters, and active tab
    const getFilteredVouchers = () => {
        return vouchers.filter((voucher) => {
            // First filter by tab
            let tabMatch = true;
            if (activeTab === 'vip') {
                tabMatch = !!voucher.is_svip_only;
            }

            // Then filter by search term (code)
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

            // Filter out VIP-only vouchers if user is not SVIP in the "all" tab
            // but show them in the VIP tab even if user is not SVIP (they'll see them as locked)
            if (activeTab === 'all' && !isSvip && voucher.is_svip_only) {
                return false;
            }

            return tabMatch && searchMatch && statusMatch;
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
                        {/* Tabs */}
                        <div className="flex border-b mb-6">
                            <button
                                className={`py-3 px-6 font-medium text-sm transition-all ${activeTab === 'all'
                                        ? 'text-amber-600 border-b-2 border-amber-600'
                                        : 'text-gray-500 hover:text-amber-500'
                                    }`}
                                onClick={() => setActiveTab('all')}
                            >
                                Tất cả voucher
                            </button>
                            <button
                                className={`py-3 px-6 font-medium text-sm flex items-center transition-all ${activeTab === 'vip'
                                        ? 'text-amber-600 border-b-2 border-amber-600'
                                        : 'text-gray-500 hover:text-amber-500'
                                    }`}
                                onClick={() => setActiveTab('vip')}
                            >
                                <span className="mr-1">Voucher VIP</span>
                                <span className="inline-flex items-center justify-center w-5 h-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-600">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                </span>
                            </button>
                        </div>

                        {/* Title section with counter */}
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {activeTab === 'all' ? 'Mã Giảm Giá' : 'Mã Giảm Giá VIP'}
                                {activeTab === 'vip' && !isSvip && (
                                    <span className="ml-2 text-sm text-gray-500 font-normal">
                                        (Cần 20+ đơn hàng để kích hoạt)
                                    </span>
                                )}
                            </h2>
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

                        {/* VIP-only message when on VIP tab and not SVIP */}
                        {!loading && !error && activeTab === 'vip' && !isSvip && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-amber-800">Trở thành Khách hàng VIP để mở khóa voucher đặc biệt</h3>
                                        <div className="mt-2 text-sm text-amber-700">
                                            <p>Để đạt được VIP status, bạn cần hoàn thành 20 đơn hàng. Những voucher này có thể xem nhưng chỉ khách hàng VIP mới sử dụng được.</p>
                                        </div>
                                    </div>
                                </div>
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
                                    {activeTab === 'vip' ? 'Không có mã giảm giá VIP nào' :
                                        searchTerm ? 'Không tìm thấy mã voucher' :
                                            'Không có mã giảm giá nào'}
                                </h3>
                                <p className="text-gray-500 max-w-md">
                                    {searchTerm
                                        ? `Không tìm thấy mã voucher phù hợp với "${searchTerm}". Vui lòng thử lại với từ khóa khác.`
                                        : activeTab === 'vip'
                                            ? 'Hiện tại không có mã giảm giá đặc biệt nào dành cho khách hàng VIP. Vui lòng quay lại sau.'
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
                                        isVipOnly={voucher.is_svip_only}
                                        isUserVip={isSvip}
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
                                    {activeTab === 'vip' && (
                                        <li className="font-medium text-amber-700">Voucher VIP chỉ có thể sử dụng khi tài khoản đạt cấp độ VIP (20+ đơn hàng)</li>
                                    )}
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