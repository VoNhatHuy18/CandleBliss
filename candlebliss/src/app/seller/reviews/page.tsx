'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import Toast from '@/app/components/ui/toast/Toast';
import { useRouter } from 'next/navigation';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    StarIcon,
    ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import { HOST } from '@/app/constants/api';
// Interface definitions
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photo?: {
        path: string;
    };
}

interface Product {
    id: number;
    name: string;
    category_id?: number;
    images: {
        id: string;
        path: string;
        public_id: string;
    }[];
}

// Thêm interface Category 
interface Category {
    id: number;
    name: string;
    description?: string;
}

interface ProductRating {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    product?: Product;
    user?: User;
}

interface EnhancedRating extends ProductRating {
    product_name: string;
    product_image: string;
    user_name: string;
    user_avatar?: string;
}
interface RatingData {
    id: number;
    user_id: number;
    rating?: number;
    avg_rating?: number;
    comment?: string;
    created_at?: string;
    updated_at?: string;
}

// Format date helper function
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Thêm hàm helper để lấy tên danh mục trực tiếp từ ID
const getCategoryNameById = (categoryId: number | undefined): string => {
    if (!categoryId) return 'Chưa phân loại';

    switch (categoryId) {
        case 4:
            return 'Nến thơm';
        case 5:
            return 'Tinh dầu';
        case 6:
            return 'Phụ kiện';
        case 7:
            return 'Nước hoa';
        default:
            return 'Danh mục khác';
    }
};

// Star Rating component
const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
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

// EmptyState Component
const EmptyState = ({ message }: { message: string }) => {
    return (
        <div className='text-center py-12 px-4'>
            <div className='bg-amber-50 inline-flex p-4 rounded-full mb-4'>
                <ChatBubbleLeftEllipsisIcon className='h-8 w-8 text-amber-600' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>{message}</h3>
            <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                Chưa có đánh giá nào từ khách hàng. Đánh giá sẽ xuất hiện khi khách hàng gửi phản hồi về sản phẩm của bạn.
            </p>
        </div>
    );
};

// Thêm component CategoryFilter
const CategoryFilter = ({
    categories,
    selectedCategory,
    onChange
}: {
    categories: Category[];
    selectedCategory: number | null;
    onChange: (categoryId: number | null) => void;
}) => {
    return (
        <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo danh mục sản phẩm
            </label>
            <div className="relative">
                <select
                    id="category"
                    value={selectedCategory !== null ? selectedCategory : ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

            </div>
        </div>
    );
};

// ReviewTable Component
const ReviewTable = ({
    reviews,
    loading,
    fetchAllReviews,
    handleDeleteReview,
    categories, // Thêm categories vào props
}: {
    reviews: EnhancedRating[];
    loading: boolean;
    fetchAllReviews: () => Promise<void>;
    handleDeleteReview: (reviewId: number) => void;
    categories: Category[]; // Thêm kiểu dữ liệu
}) => {
    const [expandedReview, setExpandedReview] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewsPerPage] = useState(10);

    // Filter reviews based on search term
    const filteredReviews = reviews.filter(review => {
        if (!searchTerm.trim()) return true;

        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        return (
            review.product_name.toLowerCase().includes(lowerCaseSearch) ||
            review.user_name.toLowerCase().includes(lowerCaseSearch) ||
            review.comment.toLowerCase().includes(lowerCaseSearch) ||
            review.rating.toString().includes(lowerCaseSearch) ||
            // Thêm tìm kiếm theo tên danh mục
            (review.product?.category_id &&
                categories.find(c => c.id === review.product?.category_id)?.name?.toLowerCase().includes(lowerCaseSearch))
        );
    });

    // Calculate pagination
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

    // Toggle review expansion
    const toggleReviewExpansion = useCallback((reviewId: number) => {
        setExpandedReview((prev) => (prev === reviewId ? null : reviewId));
    }, []);

    // Refresh data
    const handleRefresh = useCallback(() => {
        fetchAllReviews();
    }, [fetchAllReviews]);

    // Pagination function
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
            {/* Table Header with search and actions */}
            <div className='border-b border-gray-200 px-6 py-4'>
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex-1 w-full md:w-auto md:max-w-md relative'>
                        <div className='relative flex'>
                            <input
                                type='text'
                                placeholder='Tìm đánh giá theo tên sản phẩm, khách hàng...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                            />
                            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                                <MagnifyingGlassIcon className='h-5 w-5' />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
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
                                Tìm thấy {filteredReviews.length} kết quả
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className='p-6'>
                    <TableSkeleton />
                </div>
            ) : filteredReviews.length === 0 ? (
                searchTerm ? (
                    <div className='p-10 text-center'>
                        <p className='text-gray-500'>
                            Không tìm thấy đánh giá phù hợp với từ khóa: {searchTerm}
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className='mt-2 text-amber-600 hover:text-amber-800 font-medium'
                        >
                            Xóa từ khóa
                        </button>
                    </div>
                ) : (
                    <EmptyState message='Chưa có đánh giá nào' />
                )
            ) : (
                <div>
                    {/* Header */}
                    <div className='hidden md:grid grid-cols-7 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        <div className='col-span-2'>Sản phẩm</div>
                        <div className='col-span-2'>Người đánh giá</div>
                        <div>Đánh giá</div>
                        <div>Thời gian</div>
                        <div className='text-right'>Thao tác</div>
                    </div>

                    {/* Review rows */}
                    {currentReviews.map((review) => {
                        const isExpanded = expandedReview === review.id;

                        return (
                            <div
                                key={review.id}
                                className='border-b last:border-b-0 transition hover:bg-gray-50/50'
                            >
                                {/* Main review row */}
                                <div className='grid grid-cols-1 md:grid-cols-7 px-6 py-4'>
                                    {/* Mobile view */}
                                    <div className='md:hidden flex justify-between items-center mb-3'>
                                        <div className='flex items-center'>
                                            <button
                                                onClick={() => toggleReviewExpansion(review.id)}
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
                                            <div className='flex flex-col'>
                                                <StarRating rating={review.rating} />
                                                <p className='text-sm font-medium text-gray-800 mt-1'>
                                                    {review.product_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product info */}
                                    <div className='col-span-2 flex items-center'>
                                        <button
                                            onClick={() => toggleReviewExpansion(review.id)}
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
                                                <Image
                                                    src={review.product_image || '/placeholder.png'}
                                                    alt={review.product_name}
                                                    width={48}
                                                    height={48}
                                                    className='object-cover h-full w-full'
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder.png';
                                                    }}
                                                />
                                            </div>
                                            <div className='truncate'>
                                                <p className='text-sm font-medium text-gray-800 truncate'>
                                                    {review.product_name}
                                                </p>
                                                <div className='flex items-center text-xs text-gray-500 mt-1'>
                                                    <span className="truncate">ID: {review.product_id}</span>
                                                    {review.product?.category_id && (
                                                        <span className='ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 truncate'>
                                                            {getCategoryNameById(review.product.category_id)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User info - Phiên bản không có ảnh đại diện */}
                                    <div className='col-span-2 hidden md:flex items-center'>
                                        <div className='flex items-center'>
                                            <div className='truncate'>
                                                <p className='text-sm font-medium text-gray-800 truncate'>
                                                    {review.user_name}
                                                </p>
                                                <p className='text-xs text-gray-500 mt-1 truncate'>
                                                    ID: {review.user_id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating stars */}
                                    <div className='hidden md:flex items-center'>
                                        <StarRating rating={review.rating} />
                                    </div>

                                    {/* Date */}
                                    <div className='hidden md:flex items-center'>
                                        <span className='text-sm text-gray-600'>
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className='hidden md:flex items-center justify-end space-x-2'>
                                        <button
                                            onClick={() => handleDeleteReview(review.id)}
                                            className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                            title='Xóa'
                                        >
                                            <TrashIcon className='h-4 w-4' />
                                        </button>
                                    </div>

                                    {/* Mobile info */}
                                    <div className='md:hidden grid grid-cols-2 gap-2 text-sm mt-2'>
                                        <div>
                                            <span className='text-gray-500'>Người đánh giá: </span>
                                            <span className='text-gray-700'>{review.user_name}</span>
                                        </div>
                                        <div className='text-right'>
                                            <span className='text-xs text-gray-600'>
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                        <div className='col-span-2 flex justify-between mt-2'>
                                            <div></div>
                                            <div className='flex space-x-2'>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                                    title='Xóa'
                                                >
                                                    <TrashIcon className='h-4 w-4' />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className='p-4 bg-gray-50 border-t'>
                                        <div className='mb-3'>
                                            <h4 className='text-sm font-medium'>Thông tin sản phẩm</h4>
                                            <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                <div className='bg-white p-3 rounded border border-gray-200'>
                                                    <p className='text-sm text-gray-500'>Tên sản phẩm</p>
                                                    <p className='text-sm font-medium'>{review.product_name}</p>
                                                </div>
                                                <div className='bg-white p-3 rounded border border-gray-200'>
                                                    <p className='text-sm text-gray-500'>Danh mục</p>
                                                    <p className='text-sm font-medium'>
                                                        {review.product?.category_id ?
                                                            getCategoryNameById(review.product.category_id) :
                                                            'Chưa phân loại'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mb-3'>
                                            <h4 className='text-sm font-medium'>Nội dung đánh giá</h4>
                                            <p className='mt-2 text-gray-700 bg-white p-4 rounded border border-gray-200'>
                                                {review.comment || 'Không có nội dung đánh giá'}
                                            </p>
                                        </div>

                                        <div className='flex items-start mt-4'>
                                            <div className='flex-1'>
                                                <div className='bg-white p-4 rounded-lg border border-gray-200'>
                                                    <div className='flex justify-between items-center'>
                                                        <p className='font-medium text-gray-900'>{review.user_name}</p>
                                                        <p className='text-xs text-gray-500'>{formatDate(review.created_at)}</p>
                                                    </div>
                                                    <div className='mt-1'>
                                                        <StarRating rating={review.rating} />
                                                    </div>
                                                    <p className='mt-2 text-gray-700'>{review.comment || 'Không có nội dung'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {filteredReviews.length > reviewsPerPage && (
                        <div className="flex justify-center items-center mt-8 pb-6">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center space-x-1">
                                    {/* Previous button */}
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

                                    {/* Page numbers */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => {
                                            const pageNum = i + 1;

                                            // Show first, last, and pages around current page
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
                                                // Show ellipsis
                                                return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    {/* Next button */}
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

                                {/* Current page info */}
                                <div className="text-sm text-gray-500 mt-3">
                                    Hiển thị {indexOfFirstReview + 1}-{Math.min(indexOfLastReview, filteredReviews.length)} của {filteredReviews.length} đánh giá
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Các hàm quản lý thời gian đánh giá trong localStorage
const saveRatingTimes = (ratingsWithTimes: Record<number, string>) => {
    localStorage.setItem('ratingTimes', JSON.stringify(ratingsWithTimes));
};

const getRatingTimes = (): Record<number, string> => {
    if (typeof window === 'undefined') return {}; // Server-side check
    const saved = localStorage.getItem('ratingTimes');
    return saved ? JSON.parse(saved) : {};
};

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<EnhancedRating[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Tất cả');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
    const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    // Cập nhật mảng tabs để thêm tab 1 sao và 2 sao
    const tabs = [
        { id: 'Tất cả', label: 'Tất cả' },
        { id: '5sao', label: '5 Sao' },
        { id: '4sao', label: '4 Sao' },
        { id: '3sao', label: '3 Sao' },
        { id: '2sao', label: '2 Sao' }, // Thêm tab 2 sao
        { id: '1sao', label: '1 Sao' }, // Thêm tab 1 sao
    ];

    const router = useRouter();

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    // Fetch all reviews
    const fetchAllReviews = useCallback(async () => {
        try {
            setLoading(true);

            // Load thời gian trực tiếp từ localStorage thay vì sử dụng state
            const currentRatingTimes = getRatingTimes();

            // Get token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                setLoading(false);
                return;
            }

            // Lấy tất cả sản phẩm của seller
            const productsResponse = await fetch(`${HOST}/api/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!productsResponse.ok) {
                throw new Error(`Failed to fetch products: ${productsResponse.status}`);
            }

            const productsData = await productsResponse.json();

            // Kiểm tra nếu không có sản phẩm nào
            if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
                setReviews([]);
                setLoading(false);
                return;
            }

            // Lấy tất cả người dùng
            const usersResponse = await fetch(`${HOST}/api/v1/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!usersResponse.ok) {
                throw new Error(`Failed to fetch users: ${usersResponse.status}`);
            }

            const usersData = await usersResponse.json();
            console.log("Users data structure:", usersData); // Ghi log để kiểm tra cấu trúc

            // Tạo map cho users - xử lý cả hai trường hợp cấu trúc API
            const usersMap = new Map();
            if (Array.isArray(usersData)) {
                // Trường hợp API trả về mảng trực tiếp
                usersData.forEach((user: User) => {
                    usersMap.set(user.id, user);
                });
            } else if (usersData && Array.isArray(usersData.data)) {
                // Trường hợp API trả về object có thuộc tính data là mảng
                usersData.data.forEach((user: User) => {
                    usersMap.set(user.id, user);
                });
            }

            console.log("Users map size:", usersMap.size); // Kiểm tra xem map có dữ liệu không

            // Tạo map cho products
            const productsMap = new Map();
            productsData.forEach((product: Product) => {
                productsMap.set(product.id, product);
            });

            // Lấy đánh giá cho từng sản phẩm
            const allRatings: EnhancedRating[] = [];

            // Lấy đánh giá cho từng sản phẩm của seller
            for (const product of productsData) {
                try {
                    const ratingResponse = await fetch(`${HOST}/api/rating/get-by-product`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ product_id: product.id }),
                    });

                    if (ratingResponse.ok) {
                        const ratingsData = await ratingResponse.json();

                        // Chỉ xử lý nếu đây là mảng hợp lệ
                        if (Array.isArray(ratingsData)) {
                            const enhancedProductRatings = ratingsData.map((rating: RatingData) => {
                                const user = usersMap.get(rating.user_id);

                                // Kiểm tra nếu đã có thời gian lưu trong localStorage
                                let ratingTime = currentRatingTimes[rating.id];

                                // Nếu chưa có, tạo thời gian mới và cập nhật localStorage
                                if (!ratingTime) {
                                    ratingTime = new Date().toISOString();
                                    currentRatingTimes[rating.id] = ratingTime;
                                    saveRatingTimes(currentRatingTimes);
                                }

                                return {
                                    id: rating.id,
                                    product_id: product.id,
                                    user_id: rating.user_id,
                                    rating: rating.rating ?? rating.avg_rating ?? 0,
                                    comment: rating.comment ?? '',
                                    created_at: ratingTime,
                                    updated_at: ratingTime,
                                    product_name: product.name,
                                    product_image: product.images && product.images.length > 0
                                        ? product.images[0].path
                                        : '/placeholder.png',
                                    user_name: user
                                        ? `${user.firstName} ${user.lastName}`
                                        : `Khách hàng #${rating.user_id}`,
                                    user_avatar: user?.photo?.path,
                                    // Thêm thông tin sản phẩm đầy đủ bao gồm category_id
                                    product: {
                                        ...product,
                                        category_id: product.category_id
                                    }
                                };
                            });

                            allRatings.push(...enhancedProductRatings);
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching ratings for product ${product.id}:`, err);
                }
            }

            setReviews(allRatings);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Thay thế hàm fetchCategories bằng dữ liệu cố định để tránh lỗi 302
    const fetchCategories = useCallback(async () => {
        try {
            // Sử dụng dữ liệu cố định thay vì gọi API
            const categoriesData = [
                {
                    id: 6,
                    name: "Phụ kiện",
                    description: "Nến thơm với hương xoài, táo, cam, dừa,... mang đến cảm giác ngọt ngào, tươi mới."
                },
                {
                    id: 5,
                    name: "Tinh dầu",
                    description: "Các mùi hương cổ điển từ gỗ đàn hương, trầm hương,... tạo cảm giác ấm áp, sang trọng."
                },
                {
                    id: 4,
                    name: "Nến thơm",
                    description: "Các loại nến thơm mang hương hoa tự nhiên như hoa hồng, hoa nhài, lavender,..."
                },
                {
                    id: 7,
                    name: "Nước hoa",
                    description: "Nước hoa"
                }
            ];

            setCategories(categoriesData);
        } catch (error) {
            console.error('Error setting categories:', error);
            setError('Không thể tải danh mục sản phẩm');
        }
    }, []);

    // Cập nhật useEffect ban đầu để gọi fetchCategories
    useEffect(() => {
        fetchAllReviews();
        fetchCategories(); // Thêm việc gọi API lấy danh mục
    }, [fetchAllReviews, fetchCategories]);

    // Handle delete review
    const handleDeleteReview = (reviewId: number) => {
        setReviewToDelete(reviewId);
        setIsDeleteConfirmOpen(true);
    };

    // Confirm delete review
    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                router.push('/seller/signin');
                return;
            }

            // Lấy thông tin đánh giá cần xóa
            const reviewToRemove = reviews.find(review => review.id === reviewToDelete);
            if (!reviewToRemove) {
                throw new Error('Không tìm thấy đánh giá để xóa');
            }

            // API không hỗ trợ xóa trực tiếp, nên chúng ta cập nhật với giá trị rỗng/0
            const response = await fetch(`${HOST}/api/rating/upsert`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([{
                    id: reviewToDelete,
                    product_id: reviewToRemove.product_id,
                    user_id: reviewToRemove.user_id,
                    comment: '', // Xóa nội dung
                    rating: 0,   // Đặt rating về 0
                    order_id: null
                }]),
            });

            if (response.ok) {
                // Cập nhật state nếu API call thành công
                setReviews((prev) => prev.filter((review) => review.id !== reviewToDelete));
                showToast('Đã xóa đánh giá thành công', 'success');
            } else {
                let errorMessage = 'Không thể xóa đánh giá';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = `Không thể xóa đánh giá (${response.status})`;
                }
                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            setError(err instanceof Error ? err.message : 'Không thể xóa đánh giá');
            showToast(err instanceof Error ? err.message : 'Không thể xóa đánh giá', 'error');
        } finally {
            setLoading(false);
            setIsDeleteConfirmOpen(false);
            setReviewToDelete(null);
        }
    };

    // Filter reviews based on active tab
    const filteredReviews = useMemo(() => {
        // Đầu tiên lọc theo rating theo tab
        let result = [...reviews];

        switch (activeTab) {
            case '5sao':
                result = result.filter(review => review.rating === 5);
                break;
            case '4sao':
                result = result.filter(review => review.rating === 4);
                break;
            case '3sao':
                result = result.filter(review => review.rating === 3);
                break;
            case '2sao':
                result = result.filter(review => review.rating === 2);
                break;
            case '1sao':
                result = result.filter(review => review.rating === 1);
                break;
            default:
                // "Tất cả" tab, không lọc theo rating
                break;
        }

        // Tiếp theo lọc theo danh mục nếu đã chọn
        if (selectedCategory !== null) {
            result = result.filter(review => review.product?.category_id === selectedCategory);
        }

        // Sắp xếp theo thời gian tạo mới nhất
        result.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime(); // Sắp xếp giảm dần (mới nhất lên đầu)
        });

        return result;
    }, [reviews, activeTab, selectedCategory]);

    // Calculate tab counts
    const tabCounts = useMemo(() => ({
        'Tất cả': reviews.length,
        '5sao': reviews.filter(r => r.rating === 5).length,
        '4sao': reviews.filter(r => r.rating === 4).length,
        '3sao': reviews.filter(r => r.rating === 3).length,
        '2sao': reviews.filter(r => r.rating === 2).length, // Thêm đếm 2 sao
        '1sao': reviews.filter(r => r.rating === 1).length, // Thêm đếm 1 sao
    }), [reviews]);

    return (
        <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <Header />
                <main className='flex-1 p-6 overflow-auto'>
                    {/* Header with title */}
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-800'>Quản lý đánh giá</h1>
                            <p className='text-gray-600 mt-1'>
                                Xem và quản lý đánh giá sản phẩm từ khách hàng
                            </p>
                        </div>
                    </div>

                    {/* Thêm CategoryFilter component */}
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onChange={setSelectedCategory}
                    />

                    {/* Hiển thị thông tin lọc nếu đã chọn danh mục */}
                    {selectedCategory !== null && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                                        clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-amber-800">
                                    Đang lọc theo danh mục: <strong>
                                        {getCategoryNameById(selectedCategory)}
                                    </strong>
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-amber-600 hover:text-amber-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Filter tabs with counts */}
                    <div className='mb-6'>
                        <div className='border-b border-gray-200'>
                            <nav className='-mb-px flex flex-wrap gap-y-2'>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
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
                                            {tabCounts[tab.id as keyof typeof tabCounts]}
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
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z'
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

                    <ReviewTable
                        reviews={filteredReviews}
                        loading={loading}
                        fetchAllReviews={fetchAllReviews}
                        handleDeleteReview={handleDeleteReview}
                        categories={categories} // Truyền categories xuống component con
                    />

                    {/* Rest of the component (modals, etc.) */}
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
                            <h3 className='text-lg font-medium text-gray-900'>Xác nhận xóa đánh giá</h3>
                            <p className='text-sm text-gray-500 mt-2'>
                                Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className='flex justify-end space-x-3'>
                            <button
                                className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                                onClick={() => {
                                    setIsDeleteConfirmOpen(false);
                                    setReviewToDelete(null);
                                }}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center'
                                onClick={confirmDeleteReview}
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
                                    'Xóa đánh giá'
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