'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import Toast from '@/app/components/ui/toast/Toast';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    TrashIcon,
    EyeIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';
import { HOST } from '@/app/constants/api';

// Interface definitions
interface Image {
    id: string;
    path: string;
    public_id: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    isDeleted?: boolean;
}
interface Gift {
    id: string;
    name: string;
    description: string;
    images: Image[];
    video: string;
    product_details: number[];
    products: number[];

    base_price: string;
    discount_price: string;
    start_date: string;
    end_date: string;
    created_at: string | null;
    updated_at: string | null;
}

// Add this interface with your other interface definitions
interface ProductDetail {
    id: number;
    size: string;
    type: string;
    isActive: boolean;
    quantities: number;
    values: string;
    rating: number;
    images: Image[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    isDeleted?: boolean;
}

// Format price helper function
const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(numericPrice);
};

// Format date helper function
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
};

// Check if a gift is active
const isGiftActive = (startDate: string, endDate: string): boolean => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
};

// Skeleton loader component
const GiftDetailSkeleton = () => {
    return (
        <div className='animate-pulse'>
            <div className='h-8 w-2/3 bg-gray-200 rounded mb-6'></div>
            <div className='flex flex-col md:flex-row gap-6'>
                <div className='w-full md:w-1/3'>
                    <div className='h-72 bg-gray-200 rounded-lg mb-4'></div>
                    <div className='flex space-x-2'>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='h-20 w-20 bg-gray-200 rounded'></div>
                        ))}
                    </div>
                </div>
                <div className='w-full md:w-2/3'>
                    <div className='h-10 bg-gray-200 rounded mb-6 w-3/4'></div>
                    <div className='h-6 bg-gray-200 rounded mb-4 w-1/4'></div>
                    <div className='h-24 bg-gray-200 rounded mb-6'></div>
                    <div className='h-10 bg-gray-200 rounded mb-4 w-1/3'></div>
                    <div className='h-10 bg-gray-200 rounded mb-4 w-1/2'></div>
                </div>
            </div>
        </div>
    );
};

export default function GiftDetail() {
    const [gift, setGift] = useState<Gift | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string>('details');
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);

    const params = useParams();
    const router = useRouter();
    const giftId = params.id as string;

    // Show toast message
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    // Toggle section expansion
    const toggleSection = (section: string) => {
        setExpandedSection((prev) => (prev === section ? '' : section));
    };

    // Update the fetchProductDetails function to use the correct API format
    const fetchProductDetails = async (productIds: number[]) => {
        if (!productIds || productIds.length === 0) {
            console.log("No product IDs provided to fetch");
            return;
        }

        try {
            console.log("Attempting to fetch product details for IDs:", productIds);
            setProductDetails([]); // Clear existing product details
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // Build URL with multiple ids parameters
            let apiUrl = `${HOST}/api/product-details/list-product-detail`;

            // Add each ID as a separate query parameter
            // Format: ?ids=34&ids=35&ids=36
            const queryParams = productIds.map(id => `ids=${id}`).join('&');
            apiUrl = `${apiUrl}?${queryParams}`;

            console.log("API URL:", apiUrl);

            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
                return;
            }

            // Parse the response JSON
            const data = await response.json();
            console.log("Product details response:", data);

            // Update state with all fetched product details
            setProductDetails(data);
        } catch (err) {
            console.error('Error fetching product details:', err);
            showToast('Không thể tải thông tin chi tiết sản phẩm', 'error');
        }
    };
    // Fetch gift details
    useEffect(() => {
        const fetchGiftDetail = async () => {
            if (!giftId) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                if (!token) {
                    showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                    router.push('/seller/signin');
                    return;
                }

                const response = await fetch(`${HOST}/api/v1/gifts/${giftId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Không thể lấy thông tin quà tặng: ${response.statusText}`);
                }

                // Log raw gift response
                const responseText = await response.text();
                console.log("Raw gift response:", responseText);

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error("Failed to parse gift JSON:", e);
                    throw new Error("Invalid JSON response from server");
                }

                console.log("Parsed gift data:", data);

                const giftData = Array.isArray(data) && data.length > 0 ? data[0] : data;
                console.log("Final gift data:", giftData);
                setGift(giftData);

                // Look for product IDs in the 'products' array instead of 'product_details'
                if (giftData?.products && giftData.products.length > 0) {
                    console.log("Found products:", giftData.products);
                    await fetchProductDetails(giftData.products);
                } else {
                    console.log("No product IDs found in gift data");
                }
            } catch (err) {
                console.error('Error fetching gift details:', err);
                setError(err instanceof Error ? err.message : 'Không thể tải thông tin quà tặng');
                showToast('Không thể tải thông tin quà tặng', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchGiftDetail();
    }, [giftId, router]);


    // Handle delete gift
    const handleDeleteGift = () => {
        setIsDeleteConfirmOpen(true);
    };

    // Confirm delete gift
    const confirmDeleteGift = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                router.push('/seller/signin');
                return;
            }

            // Fixed API endpoint URL
            const response = await fetch(`${HOST}/api/v1/gifts/${giftId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                showToast('Quà tặng đã được xóa thành công', 'success');
                // Navigate back to gifts page after successful deletion
                setTimeout(() => {
                    router.push('/seller/gift');
                }, 1500);
            } else {
                let errorMessage = 'Không thể xóa quà tặng';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = `Không thể xóa quà tặng (${response.status}: ${response.statusText})`;
                }

                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Error deleting gift:', err);
            setError(err instanceof Error ? err.message : 'Không thể xóa quà tặng');
            showToast(err instanceof Error ? err.message : 'Không thể xóa quà tặng', 'error');
        } finally {
            setLoading(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    // View gift in store front
    const viewGiftInStore = () => {
        router.push(`/user/gifts/${giftId}`);
    };

    // Calculate discount percentage
    const calculateDiscount = () => {
        if (!gift) return 0;
        const basePrice = parseFloat(gift.base_price);
        const discountPrice = parseFloat(gift.discount_price);

        if (basePrice === 0 || discountPrice >= basePrice) return 0;

        const discountPercentage = ((basePrice - discountPrice) / basePrice) * 100;
        return Math.round(discountPercentage);
    };

    if (loading && !gift) {
        return (
            <div className='flex h-screen bg-gray-50'>
                <MenuSideBar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 p-6 overflow-auto'>
                        <GiftDetailSkeleton />
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex h-screen bg-gray-50'>
                <MenuSideBar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 p-6 overflow-auto'>
                        <div className='bg-red-50 p-4 rounded-lg text-red-800 mb-6'>
                            <h2 className='text-lg font-medium mb-2'>Đã xảy ra lỗi</h2>
                            <p>{error}</p>
                            <button
                                onClick={() => router.push('/seller/gift')}
                                className='mt-4 flex items-center text-red-700 hover:text-red-900'
                            >
                                <ArrowLeftIcon className='h-4 w-4 mr-2' />
                                Quay lại danh sách quà tặng
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!gift) {
        return (
            <div className='flex h-screen bg-gray-50'>
                <MenuSideBar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 p-6 overflow-auto'>
                        <div className='text-center py-12'>
                            <h2 className='text-xl font-medium text-gray-700'>Không tìm thấy quà tặng</h2>
                            <button
                                onClick={() => router.push('/seller/gift')}
                                className='mt-4 inline-flex items-center text-amber-600 hover:text-amber-800'
                            >
                                <ArrowLeftIcon className='h-4 w-4 mr-2' />
                                Quay lại danh sách quà tặng
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // Check if gift is currently active
    const isActive = isGiftActive(gift.start_date, gift.end_date);

    return (
        <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <Header />
                <main className='flex-1 p-6 overflow-auto'>
                    {/* Back button and actions */}
                    <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
                        <button
                            onClick={() => router.push('/seller/gift')}
                            className='inline-flex items-center text-gray-600 hover:text-amber-600'
                        >
                            <ArrowLeftIcon className='h-4 w-4 mr-2' />
                            Quay lại danh sách quà tặng
                        </button>

                        <div className='flex gap-2'>
                            <button
                                onClick={viewGiftInStore}
                                className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50'
                            >
                                <EyeIcon className='h-4 w-4 mr-1.5' />
                                Xem trang quà tặng
                            </button>

                            <button
                                onClick={handleDeleteGift}
                                className='inline-flex items-center px-3 py-1.5 border border-red-600 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700'
                            >
                                <TrashIcon className='h-4 w-4 mr-1.5' />
                                Xóa
                            </button>
                        </div>
                    </div>

                    {/* Gift overview card */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-6'>
                        <div className='p-6'>
                            <div className='flex flex-col md:flex-row gap-8'>
                                {/* Image gallery */}
                                <div className='w-full md:w-1/3'>
                                    <div className='bg-gray-100 rounded-lg mb-4 aspect-square overflow-hidden'>
                                        {gift.images && gift.images.length > 0 ? (
                                            <Image
                                                src={gift.images[activeImageIndex].path}
                                                alt={gift.name}
                                                width={500}
                                                height={500}
                                                className='object-cover w-full h-full'
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder.png';
                                                }}
                                            />
                                        ) : (
                                            <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                                <p>Không có hình ảnh</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnail images */}
                                    {gift.images && gift.images.length > 1 && (
                                        <div className='flex space-x-2 overflow-x-auto pb-2'>
                                            {gift.images.map((image, index) => (
                                                <div
                                                    key={image.id}
                                                    className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 cursor-pointer ${index === activeImageIndex
                                                        ? 'border-amber-500'
                                                        : 'border-transparent'
                                                        }`}
                                                    onClick={() => setActiveImageIndex(index)}
                                                >
                                                    <Image
                                                        src={image.path}
                                                        alt={`${gift.name} - ảnh ${index + 1}`}
                                                        width={80}
                                                        height={80}
                                                        className='object-cover w-full h-full'
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Gift info */}
                                <div className='w-full md:w-2/3'>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <h1 className='text-2xl font-bold text-gray-800'>{gift.name}</h1>
                                        <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </div>

                                    <div className='text-sm text-gray-500 flex items-center gap-3 mb-4'>
                                        <span>ID: #{gift.id}</span>
                                    </div>

                                    {/* Price and promotion info */}
                                    <div className='mb-6'>
                                        <div className='flex items-end gap-3'>
                                            <span className='text-2xl font-bold text-red-600'>
                                                {formatPrice(gift.discount_price)}
                                            </span>
                                            {parseFloat(gift.discount_price) < parseFloat(gift.base_price) && (
                                                <>
                                                    <span className='text-lg text-gray-400 line-through'>
                                                        {formatPrice(gift.base_price)}
                                                    </span>
                                                    <span className='text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded'>
                                                        Giảm {calculateDiscount()}%
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className='mt-2 text-sm text-gray-600'>
                                            <div className='flex items-center gap-1'>
                                                <CalendarIcon className='h-4 w-4' />
                                                <span>Thời gian:</span>
                                            </div>
                                            <div className='ml-5'>
                                                <p>Bắt đầu: {formatDate(gift.start_date)}</p>
                                                <p>Kết thúc: {formatDate(gift.end_date)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className='text-sm font-medium text-gray-700 mb-2'>
                                            Mô tả quà tặng
                                        </h3>
                                        <div className='text-gray-600 text-sm prose prose-sm max-w-none'>
                                            {gift.description ? (
                                                <p>{gift.description}</p>
                                            ) : (
                                                <p className='text-gray-400 italic'>Chưa có mô tả</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Associated products count */}
                                    <div className='mt-6 p-4 bg-amber-50 rounded-lg'>
                                        <h3 className='text-sm font-medium text-amber-800 mb-1'>
                                            Sản phẩm liên quan
                                        </h3>
                                        <p className='text-amber-600'>
                                            {gift.products && gift.products.length > 0
                                                ? `Có ${gift.products.length} sản phẩm được áp dụng quà tặng này`
                                                : 'Chưa có sản phẩm nào được áp dụng quà tặng này'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Associated product details section */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-6'>
                        <div
                            className='px-6 py-4 flex justify-between items-center cursor-pointer border-b'
                            onClick={() => toggleSection('details')}
                        >
                            <h3 className='font-medium text-gray-800'>Sản phẩm được áp dụng quà tặng</h3>
                            <div>
                                {expandedSection === 'details' ? (
                                    <ChevronDownIcon className='h-5 w-5 text-gray-500' />
                                ) : (
                                    <ChevronRightIcon className='h-5 w-5 text-gray-500' />
                                )}
                            </div>
                        </div>

                        {expandedSection === 'details' && (
                            <div className='p-6'>
                                {/* Check if products exists and has items */}
                                {(gift?.products?.length > 0) ? (
                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {/* Check if productDetails has been loaded */}
                                        {productDetails.length > 0 ? (
                                            productDetails.map((detail) => (
                                                <div key={detail.id} className='border rounded-lg p-4 hover:bg-gray-50'>
                                                    <div className='flex mb-3'>
                                                        <div className='w-20 h-20 rounded-md overflow-hidden mr-3 bg-gray-100'>
                                                            {detail.images && detail.images.length > 0 ? (
                                                                <Image
                                                                    src={detail.images[0].path}
                                                                    alt={detail.values}
                                                                    width={80}
                                                                    height={80}
                                                                    className='object-cover w-full h-full'
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = '/placeholder.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className='font-medium text-gray-800'>{detail.values}</h4>
                                                            <div className='text-sm text-gray-500'>
                                                                <p>ID: {detail.id}</p>
                                                                <p>Kích thước: {detail.size}</p>
                                                                <p>{detail.type}: {detail.values}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-between items-center text-sm'>
                                                        <span className={detail.isActive ? 'text-green-600' : 'text-red-600'}>
                                                            {detail.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                        <span className='font-medium'>
                                                            Tồn kho: {detail.quantities}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className='col-span-full'>
                                                <div className='flex items-center justify-center p-4 bg-gray-50 rounded-lg'>
                                                    <svg className='animate-spin h-5 w-5 text-gray-400 mr-3' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                                    </svg>
                                                    <p>Đang tải thông tin chi tiết sản phẩm...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className='bg-amber-50 p-4 rounded-lg text-center'>
                                        <p className='text-amber-800'>
                                            Quà tặng này chưa được áp dụng cho sản phẩm nào.
                                        </p>

                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Delete confirmation modal */}
                    {isDeleteConfirmOpen && (
                        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                            <div className='bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl'>
                                <div className='mb-5 text-center'>
                                    <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                                        <TrashIcon className='h-6 w-6 text-red-600' />
                                    </div>
                                    <h3 className='text-lg font-medium text-gray-900'>
                                        Xác nhận xóa quà tặng
                                    </h3>
                                    <p className='font-medium text-gray-800 mt-1'>{gift.name}</p>
                                    <p className='text-sm text-gray-500 mt-2'>
                                        Bạn có chắc chắn muốn xóa quà tặng này? Hành động này không thể hoàn
                                        tác và sẽ xóa tất cả thông tin liên quan.
                                    </p>
                                </div>
                                <div className='flex justify-end space-x-3'>
                                    <button
                                        className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                                        onClick={() => setIsDeleteConfirmOpen(false)}
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
                                            'Xóa quà tặng'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toast notifications */}
                    <Toast
                        show={toast.show}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                        duration={3000}
                        position='top-right'
                    />
                </main>
            </div>
        </div>
    );
}