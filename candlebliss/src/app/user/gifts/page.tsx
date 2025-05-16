'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Eye, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ChatBot from '@/app/components/user/chatbot/ChatBot';
import { HOST } from '@/app/constants/api';


// Interface cho hình ảnh quà tặng
interface GiftImage {
    id: string;
    path: string;
    public_id?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    isDeleted?: boolean;
}


// Interface cho quà tặng
interface Gift {
    id: string;
    name: string;
    description: string;
    images: GiftImage[] | null;
    video?: string;
    products: number[];
    base_price: string;
    discount_price: string; // Phần trăm giảm giá
    start_date: string;
    end_date: string;
    created_at: string | null;
    updated_at: string | null;
}

// Interface cho card hiển thị quà tặng
interface GiftCardProps {
    id: string;
    title: string;
    description: string;
    basePrice: string;
    discountPercent: string;
    imageUrl: string;
    products: number[];
    startDate: string;
    endDate: string;
    onViewDetail?: (giftId: string) => void;
}

// Interface cho bộ lọc khoảng giá
interface PriceRange {
    min: number;
    max: number;
    label: string;
    hasDiscount?: boolean;
}

// Interface cho tùy chọn sắp xếp
interface SortOption {
    value: string;
    label: string;
}

// Component hiển thị card quà tặng
const GiftCard = ({
    id,
    title,
    description,
    basePrice,
    discountPercent,
    imageUrl,
    products,
    startDate,
    endDate,
    onViewDetail,
}: GiftCardProps) => {
    // Format giá thành dạng hiển thị
    const formatPrice = (value: string | number) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Tính giá sau khi áp dụng phần trăm giảm giá
    const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
        const basePriceNum = parseFloat(basePrice);
        const discountPercentNum = parseFloat(discountPercent);

        if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

        // Tính giá sau khi giảm: basePrice * (1 - discount/100)
        const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
        return discountedPrice;
    };

    // Kiểm tra quà tặng có đang hoạt động không
    const isActive = () => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return now >= start && now <= end;
    };

    // Tính toán giá hiển thị
    const discountPercentValue = parseFloat(discountPercent);
    const calculatedDiscountPrice =
        calculateDiscountedPrice(basePrice, discountPercent);
    const hasDiscount = discountPercentValue > 0;

    return (
        <div className='rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow'>
            <div className='relative aspect-square overflow-hidden rounded-lg group'>
                <Image
                    src={imageUrl || '/placeholder.jpg'}
                    alt={title}
                    height={400}
                    width={400}
                    className='h-full w-full object-cover transition-all duration-300 group-hover:blur-sm'
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                    }}
                />

                {/* Badge giảm giá */}
                {hasDiscount && (
                    <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium'>
                        -{parseFloat(discountPercent).toFixed(0)}%
                    </div>
                )}

                {/* Badge trạng thái */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium
               ${isActive()
                        ? 'bg-green-500 text-white'
                        : new Date() < new Date(startDate)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                    }`}
                >
                    {isActive()
                        ? 'Đang diễn ra'
                        : new Date() < new Date(startDate)
                            ? 'Sắp diễn ra'
                            : 'Đã kết thúc'
                    }
                </div>

                <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <Link href={`/user/gifts/${id}`}>
                        <button
                            onClick={() => onViewDetail && onViewDetail(id)}
                            className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black'
                        >
                            <Eye className='w-4 h-4' />
                            <span>Xem chi tiết</span>
                        </button>
                    </Link>
                </div>
            </div>

            <div className='mt-3'>
                <h3 className='text-sm font-medium text-gray-700 mb-1 truncate whitespace-nowrap overflow-hidden'>
                    {title}
                </h3>
                <p className='text-xs text-gray-500 line-clamp-2 mb-1'>{description}</p>

                {/* Hiển thị số lượng sản phẩm */}
                <div className='flex items-center mt-1.5'>
                    <span className='text-xs text-gray-500'>
                        {products.length} sản phẩm
                    </span>
                </div>

                {/* Hiển thị giá */}
                <div className='mt-1.5'>
                    {hasDiscount ? (
                        <div className='flex items-center'>
                            <span className='text-red-600 text-sm font-medium'>
                                {formatPrice(calculatedDiscountPrice)}đ
                            </span>
                            <span className='ml-1.5 text-gray-500 text-xs line-through'>
                                {formatPrice(basePrice)}đ
                            </span>
                            <div className='bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ml-1.5'>
                                -{parseFloat(discountPercent).toFixed(0)}%
                            </div>
                        </div>
                    ) : (
                        <span className='text-red-600 text-sm font-medium'>
                            {formatPrice(basePrice)}đ
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component xử lý tìm kiếm từ URL
function GiftSearch({ onSearch }: { onSearch: (query: string) => void }) {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        if (searchQuery !== undefined) {
            onSearch(searchQuery);
        }
    }, [searchParams]);

    return null; // Component không render gì
}

// Interface cho lịch sử tìm kiếm
interface GiftSearchHistoryItem {
    term: string;
    count: number;
    lastSearched: number;
}

// Lưu lịch sử tìm kiếm
const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;

    const searches: GiftSearchHistoryItem[] = JSON.parse(localStorage.getItem('giftSearchHistory') || '[]');
    const existingSearch = searches.find((s: GiftSearchHistoryItem) => s.term.toLowerCase() === term.toLowerCase());

    if (existingSearch) {
        existingSearch.count++;
        existingSearch.lastSearched = Date.now();
    } else {
        searches.push({
            term: term,
            count: 1,
            lastSearched: Date.now()
        });
    }

    // Giữ tối đa 20 từ khóa tìm kiếm
    const updatedSearches = searches
        .sort((a, b) => b.lastSearched - a.lastSearched)
        .slice(0, 20);

    localStorage.setItem('giftSearchHistory', JSON.stringify(updatedSearches));
};

// Lưu lịch sử xem quà tặng
// Interface cho lịch sử xem quà tặng
interface GiftViewHistoryItem {
    giftId: string;
    viewCount: number;
    lastViewed: number;
}

const saveGiftView = (giftId: string) => {
    const views: GiftViewHistoryItem[] = JSON.parse(localStorage.getItem('giftViewHistory') || '[]');
    const existingView = views.find((v: GiftViewHistoryItem) => v.giftId === giftId);

    if (existingView) {
        existingView.viewCount++;
        existingView.lastViewed = Date.now();
    } else {
        views.push({
            giftId: giftId,
            viewCount: 1,
            lastViewed: Date.now()
        });
    }

    // Giữ tối đa 50 quà tặng đã xem
    const updatedViews = views
        .sort((a: GiftViewHistoryItem, b: GiftViewHistoryItem) => b.lastViewed - a.lastViewed)
        .slice(0, 50);

    localStorage.setItem('giftViewHistory', JSON.stringify(updatedViews));
};

export default function GiftPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [networkError, setNetworkError] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
    const [sortOption, setSortOption] = useState<string>('default');

    const [currentPage, setCurrentPage] = useState(1);
    const giftsPerPage = 24;

    // Định nghĩa các khoảng giá
    const priceRanges: PriceRange[] = [
        { min: 0, max: 100000, label: 'Dưới 100K' },
        { min: 100000, max: 300000, label: '100K - 300K' },
        { min: 300000, max: 500000, label: '300K - 500K' },
        { min: 500000, max: 1000000, label: '500K - 1 triệu' },
        { min: 1000000, max: Infinity, label: 'Trên 1 triệu' },
    ];

    // Định nghĩa các lựa chọn sắp xếp
    const sortOptions: SortOption[] = [
        { value: 'default', label: 'Mặc định' },
        { value: 'price-asc', label: 'Giá tăng dần' },
        { value: 'price-desc', label: 'Giá giảm dần' },
        { value: 'name-asc', label: 'Tên A-Z' },
        { value: 'name-desc', label: 'Tên Z-A' },
        { value: 'date-desc', label: 'Mới nhất' },
        { value: 'date-asc', label: 'Cũ nhất' },
    ];

    // Hàm tính toán giá sau khi áp dụng phần trăm giảm giá
    const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
        const basePriceNum = parseFloat(basePrice);
        const discountPercentNum = parseFloat(discountPercent);

        if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

        // Tính giá sau khi giảm: basePrice * (1 - discount/100)
        const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
        return discountedPrice;
    };

    // Lấy danh sách quà tặng phân trang
    const getPaginatedGifts = () => {
        const startIndex = (currentPage - 1) * giftsPerPage;
        const endIndex = startIndex + giftsPerPage;
        return filteredGifts.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredGifts.length / giftsPerPage);

    // Áp dụng bộ lọc và sắp xếp
    const applyFiltersAndSort = (
        gifts: Gift[],
        query: string,
        priceRange: PriceRange | null,
        sort: string,
    ) => {
        // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
        let result = [...gifts];

        // Lọc theo từ khóa tìm kiếm
        if (query.trim()) {
            const searchLower = query.toLowerCase();
            result = result.filter((gift) => {
                return (
                    gift.name.toLowerCase().includes(searchLower) ||
                    gift.description.toLowerCase().includes(searchLower) ||
                    gift.id.toLowerCase().includes(searchLower)
                );
            });
        }

        // Lọc theo trạng thái đang hoạt động
        if (priceRange?.hasDiscount === true) {
            const now = new Date();
            result = result.filter((gift) => {
                const startDate = new Date(gift.start_date);
                const endDate = new Date(gift.end_date);
                return now >= startDate && now <= endDate;
            });
        }
        // Lọc theo khoảng giá
        else if (priceRange && priceRange.min !== undefined && priceRange.max !== undefined) {
            result = result.filter((gift) => {
                // Tính giá thực tế sau khi giảm giá
                const calculatedPrice = calculateDiscountedPrice(gift.base_price, gift.discount_price);
                return calculatedPrice >= priceRange.min && calculatedPrice <= priceRange.max;
            });
        }

        // Sắp xếp kết quả
        switch (sort) {
            case 'price-asc':
                result.sort((a, b) => {
                    const priceA = calculateDiscountedPrice(a.base_price, a.discount_price);
                    const priceB = calculateDiscountedPrice(b.base_price, b.discount_price);
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                result.sort((a, b) => {
                    const priceA = calculateDiscountedPrice(a.base_price, a.discount_price);
                    const priceB = calculateDiscountedPrice(b.base_price, b.discount_price);
                    return priceB - priceA;
                });
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-desc':
                result.sort((a, b) => {
                    const dateA = new Date(a.start_date).getTime();
                    const dateB = new Date(b.start_date).getTime();
                    return dateB - dateA;
                });
                break;
            case 'date-asc':
                result.sort((a, b) => {
                    const dateA = new Date(a.start_date).getTime();
                    const dateB = new Date(b.start_date).getTime();
                    return dateA - dateB;
                });
                break;
            default:
                // Sắp xếp mặc định theo trạng thái (đang diễn ra > sắp diễn ra > đã kết thúc)
                result.sort((a, b) => {
                    const now = new Date();
                    const aStartDate = new Date(a.start_date);
                    const aEndDate = new Date(a.end_date);
                    const bStartDate = new Date(b.start_date);
                    const bEndDate = new Date(b.end_date);

                    const aIsActive = now >= aStartDate && now <= aEndDate;
                    const bIsActive = now >= bStartDate && now <= bEndDate;
                    const aIsFuture = now < aStartDate;
                    const bIsFuture = now < bStartDate;

                    if (aIsActive && !bIsActive) return -1;
                    if (!aIsActive && bIsActive) return 1;
                    if (aIsFuture && !bIsFuture) return -1;
                    if (!aIsFuture && bIsFuture) return 1;

                    // Nếu cùng trạng thái, sắp xếp theo ngày bắt đầu (gần đây nhất)
                    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
                });
        }

        return result;
    };

    // Áp dụng bộ lọc khi có thay đổi
    useEffect(() => {
        // Reset về trang đầu tiên khi bộ lọc thay đổi
        setCurrentPage(1);

        // Áp dụng bộ lọc và sắp xếp
        const newFilteredGifts = applyFiltersAndSort(
            gifts,
            searchQuery,
            selectedPriceRange,
            sortOption
        );
        setFilteredGifts(newFilteredGifts);
    }, [searchQuery, selectedPriceRange, sortOption, gifts]);

    // Lấy dữ liệu quà tặng từ API
    useEffect(() => {
        const fetchGifts = async () => {
            try {
                setNetworkError(false);
                setLoading(true);

                const response = await fetch(`${HOST}/api/v1/gifts`);
                if (!response.ok) {
                    throw new Error('Failed to fetch gifts');
                }

                const data: Gift[] = await response.json();
                setGifts(data);

                // Mặc định áp dụng bộ lọc rrn đầu
                const filteredData = applyFiltersAndSort(data, '', null, 'default');
                setFilteredGifts(filteredData);

            } catch (err) {
                console.error('Error fetching gifts:', err);

                // Phát hiện lỗi mạng
                if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                    setNetworkError(true);
                }

                setError(err instanceof Error ? err.message : 'Failed to fetch gifts');
            } finally {
                setLoading(false);
            }
        };

        fetchGifts();
    }, []);

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (loading) return;
        const newSortOption = event.target.value;
        setSortOption(newSortOption);
    };

    // Xử lý thay đổi khoảng giá
    const handlePriceRangeChange = (range: PriceRange | null) => {
        if (loading) return;
        setSelectedPriceRange(range);
    };

    // Xử lý tìm kiếm
    const handleSearch = (query: string) => {
        if (loading) return;

        // Lưu từ khóa tìm kiếm
        saveSearchTerm(query);
        setSearchQuery(query);
    };

    // Xử lý xem chi tiết quà tặng
    const handleViewDetail = (giftId: string) => {
        console.log('View gift detail:', giftId);
        saveGiftView(giftId);
    };

    return (
        <div className='bg-[#F1EEE9] min-h-screen'>
            <Head>
                <title>Bộ quà tặng</title>
                <meta name='description' content='Bộ quà tặng tại Candle Bliss' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <ChatBot />
            <NavBar />

            {/* Xử lý tìm kiếm từ URL */}
            <Suspense fallback={<div>Loading search results...</div>}>
                <GiftSearch onSearch={handleSearch} />
            </Suspense>

            <div className='px-4 lg:px-0 py-8'>
                <p className='text-center text-[#555659] text-lg font-mont'>B Ộ  Q U À  T Ặ N G</p>
                {searchQuery ? (
                    <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                        KẾT QUẢ TÌM KIẾM: &ldquo;{searchQuery}&rdquo;
                    </p>
                ) : (
                    <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                        TẤT CẢ BỘ QUÀ TẶNG
                    </p>
                )}
            </div>

            {/* Thông báo lỗi mạng */}
            {networkError && (
                <div className='max-w-7xl mx-auto px-4 mb-6'>
                    <div className='bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md'>
                        <div className='flex items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className='text-sm font-medium text-orange-800'>
                                    Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn và thử lại.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className='mt-2 text-xs font-medium text-orange-800 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-md transition-colors'
                                >
                                    Tải lại trang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nút toggle sidebar trên mobile */}
            <button
                className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
                {/* Sidebar bộ lọc */}
                <div
                    className={`lg:w-64 lg:block fixed lg:relative top-0 left-0 h-full lg:h-auto z-40 bg-white lg:bg-transparent shadow-lg lg:shadow-none overflow-y-auto transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        } px-4 pt-16 lg:pt-0 lg:px-8 mb-6`}
                >
                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <h3 className='font-medium text-gray-800 mb-3'>Lọc bộ quà tặng</h3>

                        {/* Lọc theo khoảng giá */}
                        <div className='mb-5'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Khoảng giá</h4>
                            <div className='space-y-2'>
                                <div className='flex items-center'>
                                    <button
                                        onClick={() => handlePriceRangeChange(null)}
                                        className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === null
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Tất cả
                                    </button>
                                </div>

                                {priceRanges.map((range, idx) => (
                                    <div key={idx} className='flex items-center'>
                                        <button
                                            onClick={() => handlePriceRangeChange(range)}
                                            className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === range
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lọc theo trạng thái */}
                        <div className='mb-5'>
                            <h4 className='text-sm font-medium text-gray-700 mb-2'>Trạng thái</h4>
                            <div className='space-y-2'>
                                <div className='flex items-center'>
                                    <button
                                        onClick={() =>
                                            handlePriceRangeChange({
                                                min: 0,
                                                max: Infinity,
                                                label: 'Bộ quà tặng đang hoạt động',
                                                hasDiscount: true,
                                            })
                                        }
                                        className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange?.hasDiscount === true
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Đang diễn ra
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nội dung chính */}
                <div className='flex-1 px-4 lg:px-8'>
                    {/* Thông tin số lượng và sắp xếp */}
                    <div className='flex justify-between items-center mb-6'>
                        <p className='text-sm text-gray-600'>
                            {filteredGifts.length} bộ quà tặng
                            {searchQuery ? ` cho "${searchQuery}"` : ''}
                            {selectedPriceRange
                                ? selectedPriceRange.hasDiscount
                                    ? ' đang diễn ra'
                                    : ` trong khoảng giá ${selectedPriceRange.label}`
                                : ''}
                        </p>

                        <div className='flex items-center'>
                            <label htmlFor='sort' className='text-sm text-gray-600 mr-2'>
                                Sắp xếp:
                            </label>
                            <select
                                id='sort'
                                className='text-sm border rounded-md py-1.5 px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500'
                                value={sortOption}
                                onChange={handleSortChange}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className='flex justify-center items-center h-64'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !networkError && (
                        <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center max-w-7xl mx-auto'>
                            {error}
                        </div>
                    )}

                    {/* Không có kết quả */}
                    {!loading && !error && filteredGifts.length === 0 && (
                        <div className='text-center py-10'>
                            <div>
                                <p className='text-gray-600 mb-4'>
                                    Không tìm thấy bộ quà tặng phù hợp
                                    {searchQuery ? ` với "${searchQuery}"` : ''}
                                    {selectedPriceRange
                                        ? selectedPriceRange.hasDiscount
                                            ? ' đang diễn ra'
                                            : ` trong khoảng giá ${selectedPriceRange.label}`
                                        : ''}
                                </p>
                                <button
                                    className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedPriceRange(null);
                                        setSortOption('default');
                                    }}
                                >
                                    Xem tất cả bộ quà tặng
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Hiển thị danh sách quà tặng */}
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {getPaginatedGifts().map((gift) => (
                            <GiftCard
                                key={gift.id}
                                id={gift.id}
                                title={gift.name}
                                description={gift.description}
                                basePrice={gift.base_price}
                                discountPercent={gift.discount_price}
                                imageUrl={gift.images && gift.images.length > 0 ? gift.images[0].path : '/placeholder.jpg'}
                                products={gift.products}
                                startDate={gift.start_date}
                                endDate={gift.end_date}
                                onViewDetail={handleViewDetail}
                            />
                        ))}
                    </div>

                    {/* Phân trang */}
                    {!loading && !error && filteredGifts.length > giftsPerPage && (
                        <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`px-3 py-1 ${currentPage === page ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                                        } rounded-md text-gray-700`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Lớp phủ khi sidebar mở trên mobile */}
            {isSidebarOpen && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Footer />
        </div>
    );
}