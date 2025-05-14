'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import Toast from '@/app/components/ui/toast/Toast';
import { useRouter } from 'next/navigation';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { HOST } from '@/app/constants/api';
import { format } from 'date-fns';

// Định nghĩa các interface
interface Image {
    id: string;
    path: string;
    public_id?: string;
}

interface ProductDetail {
    id: number;
    size?: string;
    type?: string;
    values?: string;
    quantities?: number;
    images?: Image[];
    isActive?: boolean;
    base_price?: number;
    discount_price?: number;
}

interface Gift {
    id: string;
    name: string;
    description?: string;
    images: Image[];
    video?: string;
    'product-details': number[];
    products: number[];
    base_price: string | number;
    discount_price: string | number; // Phần trăm giảm giá (%)
    start_date: string;
    end_date: string;
    created_at: string | null;
    updated_at: string | null;
    productDetails?: ProductDetail[];
}

// Format price helper function
const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(numPrice);
};

// Format date helper function
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';

    try {
        const date = new Date(dateString);
        return format(date, 'dd/MM/yyyy');
    } catch {
        return dateString || '—';
    }
};

// Check if the gift is active based on dates
const isGiftActive = (startDate: string, endDate: string): boolean => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return now >= start && now <= end;
};

// Loading Skeleton Component
const TableSkeleton = () => {
    return (
        <div className='animate-pulse'>
            <div className='h-10 bg-gray-200 rounded mb-4'></div>
            {[1, 2, 3].map((i) => (
                <div key={i} className='mb-4'>
                    <div className='h-24 bg-gray-100 rounded-lg mb-1'></div>
                </div>
            ))}
        </div>
    );
};

// Badge Component
const Badge = ({
    count,
    variant = 'default',
}: {
    count: number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) => {
    const colors = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${colors[variant]}`}>{count}</span>
    );
};

// EmptyState Component
const EmptyState = ({
    message,
    actionLabel,
    onAction,
}: {
    message: string;
    actionLabel: string;
    onAction: () => void;
}) => {
    return (
        <div className='text-center py-12 px-4'>
            <div className='bg-amber-50 inline-flex p-4 rounded-full mb-4'>
                <PlusIcon className='h-8 w-8 text-amber-600' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>{message}</h3>
            <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                Tạo bộ quà tặng đầu tiên để bắt đầu quản lý và tăng doanh số bán hàng
            </p>
            <button
                onClick={onAction}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700'
            >
                <PlusIcon className='h-4 w-4 mr-2' />
                {actionLabel}
            </button>
        </div>
    );
};

// GiftTable Component
const GiftTable = ({
    gifts,
    loading,
    fetchAllGiftData,
    handleEditGift,
    handleDeleteGift,
    resetPagination,
    setSearchTerm,
    searchTerm,
    currentPage,
    setCurrentPage,
}: {
    gifts: Gift[];
    loading: boolean;
    fetchAllGiftData: () => Promise<void>;
    handleEditGift: (giftId: string) => void;
    handleDeleteGift: (giftId: string) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    resetPagination?: string;
    setSearchTerm: (term: string) => void;
    searchTerm: string;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}) => {
    const [expandedGift, setExpandedGift] = useState<string | null>(null);
    const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
    const [productDetailsCache, setProductDetailsCache] = useState<Record<number, ProductDetail>>({});
    const router = useRouter();

    // Filter gifts based on search term
    const filteredGifts = useMemo(() => {
        if (!searchTerm.trim()) return gifts;

        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        return gifts.filter(
            (gift) =>
                gift.name.toLowerCase().includes(lowerCaseSearch) ||
                gift.id.toString().includes(lowerCaseSearch)
        );
    }, [gifts, searchTerm]);

    // Fetch product details when a gift is expanded
    useEffect(() => {
        if (expandedGift !== null) {
            fetchGiftProductDetails(expandedGift);
        }
    }, [expandedGift]);

    // Fetch product details for a specific gift
    const fetchGiftProductDetails = async (giftId: string) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            const gift = gifts.find((g) => g.id === giftId);
            if (!gift || !gift['product-details'] || gift['product-details'].length === 0) return;

            // Update loading state for this gift's details
            setDetailLoading((prev) => ({ ...prev, [giftId]: true }));

            // Fetch details for each product detail ID
            const detailPromises = gift['product-details'].map(async (detailId) => {
                // Check if we already have it in cache
                if (productDetailsCache[detailId]) {
                    return { detailId, data: productDetailsCache[detailId] };
                }

                try {
                    const response = await fetch(
                        `${HOST}/api/product-details/${detailId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const detailData = await response.json();
                        return { detailId, data: detailData };
                    }
                    return { detailId, data: null };
                } catch {
                    return { detailId, data: null };
                }
            });

            const details = await Promise.all(detailPromises);

            // Update state with fetched details
            const detailsObj: Record<number, ProductDetail> = {};
            details.forEach((detail) => {
                if (detail.data) {
                    detailsObj[detail.detailId] = detail.data;
                }
            });

            // Update cache
            setProductDetailsCache((prev) => ({ ...prev, ...detailsObj }));
        } catch (error) {
            console.error('Error fetching gift product details:', error);
        } finally {
            // Stop loading state for this gift's details
            setDetailLoading((prev) => ({ ...prev, [giftId]: false }));
        }
    };

    // Toggle gift expansion
    const toggleGiftExpansion = useCallback((giftId: string) => {
        setExpandedGift((prev) => (prev === giftId ? null : giftId));
    }, []);

    // Refresh data
    const handleRefresh = useCallback(() => {
        fetchAllGiftData();
    }, [fetchAllGiftData]);

    // Handle search with debounce
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Pagination setup
    const [giftsPerPage] = useState(10);
    const indexOfLastGift = currentPage * giftsPerPage;
    const indexOfFirstGift = indexOfLastGift - giftsPerPage;
    const currentGifts = filteredGifts.slice(indexOfFirstGift, indexOfLastGift);
    const totalPages = Math.ceil(filteredGifts.length / giftsPerPage);

    // Pagination function
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredGifts.length, searchTerm, resetPagination]);

    // Calculate discounted price based on base price and discount percentage
    const calculateDiscountedPrice = (basePrice: string | number, discountPercentage: string | number): number => {
        const base = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
        const discount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;

        return base * (1 - discount / 100);
    };

    return (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
            {/* Table Header with search and actions */}
            <div className='border-b border-gray-200 px-6 py-4'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex-1 w-full md:w-auto md:max-w-md relative'>
                        <div className='relative flex'>
                            <input
                                type='text'
                                placeholder='Tìm bộ quà tặng theo tên, ID'
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                            />
                            <div className='absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                <MagnifyingGlassIcon className='h-5 w-5' />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className='absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                >
                                    <svg
                                        className='h-4 w-4'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        stroke='currentColor'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M6 18L18 6M6 6l12 12'
                                        />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={handleRefresh}
                                className='p-2 text-gray-500 hover:text-amber-600 rounded-lg transition-colors pl-5'
                                title='Làm mới'
                            >
                                <ArrowPathIcon className='h-5 w-5' />
                            </button>
                        </div>
                        {searchTerm && (
                            <div className='absolute mt-1 text-xs text-gray-500'>
                                Tìm thấy {filteredGifts.length} kết quả
                            </div>
                        )}
                    </div>

                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={() => router.push('/seller/gift/creategift')}
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 shadow-sm'
                        >
                            <PlusIcon className='h-4 w-4 mr-1.5' />
                            Thêm bộ quà tặng
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className='p-6'>
                    <TableSkeleton />
                </div>
            ) : filteredGifts.length === 0 ? (
                searchTerm ? (
                    <div className='p-10 text-center'>
                        <p className='text-gray-500'>
                            Không tìm thấy bộ quà tặng phù hợp với từ khóa: {searchTerm}
                        </p>
                        <button
                            onClick={() => handleSearch('')}
                            className='mt-2 text-amber-600 hover:text-amber-800 font-medium'
                        >
                            Xóa từ khóa
                        </button>
                    </div>
                ) : (
                    <EmptyState
                        message='Chưa có bộ quà tặng nào'
                        actionLabel='Thêm bộ quà tặng đầu tiên'
                        onAction={() => router.push('/seller/gift/creategift')}
                    />
                )
            ) : (
                <div>
                    {/* Header */}
                    <div className='hidden md:grid grid-cols-7 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        <div className='col-span-2'>Quà tặng</div>
                        <div>Thời gian</div>
                        <div>Số lượng sản phẩm</div>
                        <div>Trạng thái</div>
                        <div className='text-right'>Thao tác</div>
                    </div>

                    {/* Gift rows */}
                    {currentGifts.map((gift) => {
                        const totalProducts = gift.products ? gift.products.length : 0;
                        const isExpanded = expandedGift === gift.id;
                        const isActive = isGiftActive(gift.start_date, gift.end_date);

                        // Calculate discounted price
                        const discountedPrice = calculateDiscountedPrice(gift.base_price, gift.discount_price);

                        return (
                            <div
                                key={gift.id}
                                className='border-b last:border-b-0 transition hover:bg-gray-50/50'
                            >
                                {/* Main gift row */}
                                <div className='grid grid-cols-1 md:grid-cols-7 px-6 py-4'>
                                    {/* Mobile view */}
                                    <div className='md:hidden flex justify-between items-center mb-3'>
                                        <div className='flex items-center'>
                                            <button
                                                onClick={() => toggleGiftExpansion(gift.id)}
                                                className='mr-2 text-gray-500 hover:text-amber-600'
                                                aria-expanded={isExpanded}
                                                aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDownIcon className='h-5 w-5' />
                                                ) : (
                                                    <ChevronRightIcon className='h-5 w-5' />
                                                )}
                                            </button>
                                            <div className='h-10 w-10 bg-gray-200 rounded-md overflow-hidden'>
                                                {gift.images && gift.images.length > 0 ? (
                                                    <Image
                                                        src={gift.images[0].path}
                                                        alt={gift.name}
                                                        width={40}
                                                        height={40}
                                                        className='object-cover h-full w-full'
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className='flex items-center justify-center h-full w-full text-gray-400'>
                                                        <PlusIcon className='h-5 w-5' />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='ml-3'>
                                                <p className='text-sm font-medium text-gray-800'>
                                                    {gift.name}
                                                </p>
                                                <p className='text-xs text-gray-500 mt-0.5'>#{gift.id}</p>
                                            </div>
                                        </div>
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={() => handleEditGift(gift.id)}
                                                className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded'
                                                title='Chỉnh sửa'
                                            >
                                                <PencilIcon className='h-4 w-4' />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGift(gift.id)}
                                                className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                                title='Xóa'
                                            >
                                                <TrashIcon className='h-4 w-4' />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='col-span-2 flex items-center'>
                                        <button
                                            onClick={() => toggleGiftExpansion(gift.id)}
                                            className='mr-3 text-gray-500 hover:text-amber-600 hidden md:block'
                                            aria-expanded={isExpanded}
                                            aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}
                                        >
                                            {isExpanded ? (
                                                <ChevronDownIcon className='h-5 w-5' />
                                            ) : (
                                                <ChevronRightIcon className='h-5 w-5' />
                                            )}
                                        </button>

                                        <div className='flex items-center'>
                                            <div className='h-12 w-12 bg-gray-200 rounded-md overflow-hidden mr-3 flex-shrink-0 border'>
                                                {gift.images && gift.images.length > 0 ? (
                                                    <Image
                                                        src={gift.images[0].path}
                                                        alt={gift.name}
                                                        width={48}
                                                        height={48}
                                                        className='object-cover h-full w-full'
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className='flex items-center justify-center h-full w-full text-gray-400'>
                                                        <PlusIcon className='h-5 w-5' />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='truncate'>
                                                <p className='text-sm font-medium text-gray-800 truncate'>
                                                    {gift.name}
                                                </p>
                                                <div className='flex flex-wrap items-center gap-x-2 mt-1'>
                                                    <div className='text-xs text-gray-500'>
                                                        <span className="inline-flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {formatPrice(discountedPrice)}
                                                        </span>
                                                    </div>
                                                    {Number(gift.discount_price) > 0 && (
                                                        <div className='text-xs text-gray-500 line-through'>
                                                            {formatPrice(gift.base_price)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    <div className='hidden md:flex items-center'>
                                        <div className='text-sm text-gray-700'>
                                            <div>{formatDate(gift.start_date)} - {formatDate(gift.end_date)}</div>

                                        </div>
                                    </div>

                                    <div className='hidden md:flex items-center'>
                                        <div className='text-sm text-gray-700'>
                                            {totalProducts > 0 && (
                                                <Badge
                                                    count={totalProducts}
                                                    variant='success'
                                                />
                                            )}
                                            <span> Sản phẩm</span>
                                        </div>
                                    </div>

                                    <div className='hidden md:flex items-center'>
                                        <span
                                            className={`px-2.5 py-1 text-xs rounded-full ${isActive
                                                ? 'bg-green-100 text-green-800'
                                                : new Date() < new Date(gift.start_date)
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {isActive
                                                ? 'Đang hoạt động'
                                                : new Date() < new Date(gift.start_date)
                                                    ? 'Sắp diễn ra'
                                                    : 'Đã kết thúc'}
                                        </span>
                                    </div>

                                    <div className='hidden md:flex items-center justify-end space-x-2'>
                                        <button
                                            onClick={() => handleEditGift(gift.id)}
                                            className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded'
                                            title='Chỉnh sửa'
                                        >
                                            <PencilIcon className='h-4 w-4' />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGift(gift.id)}
                                            className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                            title='Xóa'
                                        >
                                            <TrashIcon className='h-4 w-4' />
                                        </button>
                                    </div>

                                    {/* Mobile info */}
                                    <div className='md:hidden grid grid-cols-2 gap-2 text-sm mt-2'>
                                        <div>
                                            <span className='text-gray-500'>Sản phẩm: </span>
                                            <span className='text-gray-700'>{totalProducts}</span>
                                        </div>
                                        <div className='text-right'>
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : new Date() < new Date(gift.start_date)
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {isActive
                                                    ? 'Đang hoạt động'
                                                    : new Date() < new Date(gift.start_date)
                                                        ? 'Sắp diễn ra'
                                                        : 'Đã kết thúc'}
                                            </span>
                                        </div>
                                        <div className='col-span-2 text-xs text-gray-500 mt-1'>
                                            <div>Thời gian: {formatDate(gift.start_date)} - {formatDate(gift.end_date)}</div>
                                            <div className='mt-0.5'>
                                                Giá: {formatPrice(discountedPrice)}
                                                {Number(gift.discount_price) > 0 && (
                                                    <span className='line-through ml-1'>{formatPrice(gift.base_price)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className='p-4 bg-gray-50 border-t'>
                                        <div className='flex justify-between items-center mb-3'>
                                            <h4 className='text-sm font-medium'>Chi tiết bộ quà tặng</h4>

                                            {/* Display loading indicator when details are being fetched */}
                                            {detailLoading[gift.id] && (
                                                <div className='flex items-center text-amber-600 text-sm'>
                                                    <div className='animate-spin h-4 w-4 border-2 border-amber-600 rounded-full border-t-transparent mr-2'></div>
                                                    Đang tải chi tiết...
                                                </div>
                                            )}
                                        </div>

                                        {/* Rest of your expanded details code */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-4'>
                                            <div>
                                                <h5 className='text-xs font-medium text-gray-500 uppercase mb-2'>Thông tin cơ bản</h5>
                                                <div className='bg-white p-3 rounded-md border border-gray-200'>
                                                    <div className='grid grid-cols-2 gap-2 text-sm'>
                                                        <div className='text-gray-500'>Tên quà tặng:</div>
                                                        <div className='text-gray-900 font-medium'>{gift.name}</div>

                                                        <div className='text-gray-500'>Giá gốc:</div>
                                                        <div className='text-gray-900 font-medium'>{formatPrice(gift.base_price)}</div>

                                                        <div className='text-gray-500'>Giảm giá:</div>
                                                        <div className='text-amber-600 font-medium'>{Number(gift.discount_price)}%</div>

                                                        <div className='text-gray-500'>Giá sau giảm:</div>
                                                        <div className='text-green-600 font-medium'>
                                                            {formatPrice(discountedPrice)}
                                                        </div>

                                                        <div className='text-gray-500'>Ngày bắt đầu:</div>
                                                        <div className='text-gray-900'>{formatDate(gift.start_date)}</div>

                                                        <div className='text-gray-500'>Ngày kết thúc:</div>
                                                        <div className='text-gray-900'>{formatDate(gift.end_date)}</div>

                                                        <div className='text-gray-500'>Trạng thái:</div>
                                                        <div>
                                                            <span
                                                                className={`px-2 py-0.5 text-xs rounded-full ${isActive
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : new Date() < new Date(gift.start_date)
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                            >
                                                                {isActive
                                                                    ? 'Đang hoạt động'
                                                                    : new Date() < new Date(gift.start_date)
                                                                        ? 'Sắp diễn ra'
                                                                        : 'Đã kết thúc'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {gift.description && (
                                                        <div className='mt-3 pt-3 border-t border-gray-200'>
                                                            <div className='text-gray-500 text-sm mb-1'>Mô tả:</div>
                                                            <p className='text-sm text-gray-800'>{gift.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className='text-xs font-medium text-gray-500 uppercase mb-2'>Hình ảnh</h5>
                                                <div className='bg-white p-3 rounded-md border border-gray-200'>
                                                    {gift.images && gift.images.length > 0 ? (
                                                        <div className='grid grid-cols-3 gap-2'>
                                                            {gift.images.map((image) => (
                                                                <div key={image.id} className='aspect-square rounded overflow-hidden'>
                                                                    <Image
                                                                        src={image.path}
                                                                        alt={gift.name}
                                                                        width={100}
                                                                        height={100}
                                                                        className='object-cover w-full h-full'
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.src = '/placeholder.png';
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className='text-center py-4 text-gray-500'>
                                                            Không có hình ảnh
                                                        </div>
                                                    )}

                                                    {gift.video && (
                                                        <div className='mt-3 pt-3 border-t border-gray-200'>
                                                            <div className='text-gray-500 text-sm mb-2'>Video:</div>
                                                            <a
                                                                href={gift.video}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className='text-blue-600 hover:text-blue-800 text-sm underline'
                                                            >
                                                                Xem video
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {filteredGifts.length > giftsPerPage && (
                        <div className="flex justify-center items-center mt-8 pb-6">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center space-x-1">
                                    {/* Nút Quay lại */}
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1.5 rounded-md ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-300'
                                            }`}
                                        aria-label="Trang trước"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Các số trang */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => {
                                            const pageNum = i + 1;

                                            // Hiển thị các nút trang: trang đầu, trang cuối, và 3 trang xung quanh trang hiện tại
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => paginate(pageNum)}
                                                        className={`px-3 py-1.5 rounded-md ${currentPage === pageNum
                                                            ? 'bg-amber-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-300'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                (pageNum === currentPage - 2 && currentPage > 3) ||
                                                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                                            ) {
                                                // Hiển thị dấu chấm lửng
                                                return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    {/* Nút Trang tiếp */}
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1.5 rounded-md ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-300'
                                            }`}
                                        aria-label="Trang tiếp"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Thông tin trang hiện tại */}
                                <div className="text-sm text-gray-500 mt-3">
                                    Hiển thị {indexOfFirstGift + 1}-{Math.min(indexOfLastGift, filteredGifts.length)} của {filteredGifts.length} bộ quà tặng
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function GiftManagement() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Tất cả');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
    const [giftToDelete, setGiftToDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });
    const [searchTerm, setSearchTerm] = useState<string>('');

    const router = useRouter();

    // Toast function
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    // Tabs
    const tabs: { id: keyof typeof tabCounts; label: string }[] = [
        { id: 'Tất cả', label: 'Tất cả' },
        { id: 'Đang hoạt động', label: 'Đang hoạt động' },
        { id: 'Sắp diễn ra', label: 'Sắp diễn ra' },
        { id: 'Đã kết thúc', label: 'Đã kết thúc' },
    ];

    // Fetch all gift data
    const fetchAllGiftData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                setLoading(false);
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            setLoading(true);

            // Fetch all gifts
            const response = await fetch(`${HOST}/api/v1/gifts`, {
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch gifts: ${response.status}`);
            }

            const data = await response.json();
            setGifts(data);
        } catch (err) {
            console.error('Error fetching gift data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load gifts';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchAllGiftData();
    }, [fetchAllGiftData]);

    // Handle edit gift
    const handleEditGift = useCallback(
        (giftId: string) => {
            router.push(`/seller/gift/${giftId}`);
        },
        [router],
    );

    // Handle delete gift confirmation
    const handleDeleteGift = useCallback(
        (giftId: string) => {
            const giftToDelete = gifts.find((gift) => gift.id === giftId);

            if (giftToDelete) {
                setGiftToDelete(giftId);
                setIsDeleteConfirmOpen(true);
            } else {
                const errorMessage = `Không tìm thấy thông tin bộ quà tặng ID: ${giftId}`;
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        },
        [gifts],
    );

    // Confirm delete gift
    const confirmDeleteGift = async () => {
        if (!giftToDelete) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                router.push('/seller/signin');
                return;
            }

            // Delete request to the API
            const response = await fetch(
                `${HOST}/api/v1/gifts/${giftToDelete}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (response.ok) {
                setGifts((prev) => prev.filter((gift) => gift.id !== giftToDelete));
                showToast('Bộ quà tặng đã được xóa thành công', 'success');
                setIsDeleteConfirmOpen(false);
                setGiftToDelete(null);

                // Refresh the gift list
                await fetchAllGiftData();
            } else {
                let errorMessage = 'Không thể xóa bộ quà tặng';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch {
                        errorMessage = `Không thể xóa bộ quà tặng (${response.status}: ${response.statusText})`;
                    }
                }

                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Error deleting gift:', err);
            setError(err instanceof Error ? err.message : 'Không thể xóa bộ quà tặng');
            showToast(err instanceof Error ? err.message : 'Không thể xóa bộ quà tặng', 'error');
        } finally {
            setLoading(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    // Filtered gifts based on active tab
    const filteredGifts = useMemo(() => {
        const now = new Date();

        switch (activeTab) {
            case 'Đang hoạt động':
                return gifts.filter((gift) => {
                    const startDate = new Date(gift.start_date);
                    const endDate = new Date(gift.end_date);
                    return now >= startDate && now <= endDate;
                });
            case 'Sắp diễn ra':
                return gifts.filter((gift) => {
                    const startDate = new Date(gift.start_date);
                    return now < startDate;
                });
            case 'Đã kết thúc':
                return gifts.filter((gift) => {
                    const endDate = new Date(gift.end_date);
                    return now > endDate;
                });
            default:
                return gifts;
        }
    }, [gifts, activeTab]);

    // Tab counts
    const tabCounts = useMemo(() => {
        const now = new Date();

        return {
            'Tất cả': gifts.length,
            'Đang hoạt động': gifts.filter((gift) => {
                const startDate = new Date(gift.start_date);
                const endDate = new Date(gift.end_date);
                return now >= startDate && now <= endDate;
            }).length,
            'Sắp diễn ra': gifts.filter((gift) => {
                const startDate = new Date(gift.start_date);
                return now < startDate;
            }).length,
            'Đã kết thúc': gifts.filter((gift) => {
                const endDate = new Date(gift.end_date);
                return now > endDate;
            }).length,
        };
    }, [gifts]);

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setCurrentPage(1); // Reset to first page when changing tab
    };

    const resetPagination = activeTab; // Using activeTab as a dependency

    return (
        <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <Header />
                <main className='flex-1 p-6 overflow-auto'>
                    {/* Header with title */}
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-semibold text-gray-800'>Quản lý bộ quà tặng</h1>
                    </div>

                    {/* Filter tabs with counts */}
                    <div className='mb-6'>
                        <div className='border-b border-gray-200'>
                            <nav className='-mb-px flex flex-wrap gap-y-2'>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center mr-6 ${activeTab === tab.id
                                            ? 'border-amber-500 text-amber-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.label}
                                        <span
                                            className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {tabCounts[tab.id]}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start'>
                            <svg
                                className='h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                    clipRule='evenodd'
                                />
                            </svg>
                            <div className='flex-1'>
                                <p className='font-medium'>Đã xảy ra lỗi</p>
                                <p className='text-sm'>{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className='text-red-700 hover:text-red-900 ml-4'
                            >
                                <svg
                                    className='h-5 w-5'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Gift table */}
                    <GiftTable
                        gifts={filteredGifts}
                        loading={loading}
                        fetchAllGiftData={fetchAllGiftData}
                        handleEditGift={handleEditGift}
                        handleDeleteGift={handleDeleteGift}
                        showToast={showToast}
                        resetPagination={resetPagination}
                        setSearchTerm={setSearchTerm}
                        searchTerm={searchTerm}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </main>
            </div>

            {/* Delete confirmation modal */}
            {isDeleteConfirmOpen && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl'>
                        <div className='mb-5 text-center'>
                            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                                <TrashIcon className='h-6 w-6 text-red-600' />
                            </div>
                            <h3 className='text-lg font-medium text-gray-900'>Xác nhận xóa bộ quà tặng</h3>
                            {giftToDelete && (
                                <p className='font-medium text-gray-800 mt-1'>
                                    {gifts.find((g) => g.id === giftToDelete)?.name}
                                </p>
                            )}
                            <p className='text-sm text-gray-500 mt-2'>
                                Bạn có chắc chắn muốn xóa bộ quà tặng này? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className='flex justify-end space-x-3'>
                            <button
                                className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false);
                                    setGiftToDelete(null);
                                }}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center'
                                onClick={confirmDeleteGift}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xóa bộ quà tặng'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                duration={3000}
                position='top-right'
            />
        </div>
    );
}