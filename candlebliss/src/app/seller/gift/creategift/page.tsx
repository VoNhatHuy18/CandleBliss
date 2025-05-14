'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import Toast from '@/app/components/ui/toast/Toast';
import { useRouter } from 'next/navigation';
import {
    ChevronDown,
    Plus,
    X,
    Image as ImageIcon,
    Calendar,
    DollarSign,
    Loader2
} from 'lucide-react';
import { HOST } from '@/app/constants/api';
import { format } from 'date-fns';

// Định nghĩa các interface
interface GiftImage {
    id?: string;
    path?: string;
    file?: File;
    preview?: string;
    public_id?: string;
}

interface ProductDetail {
    id: number;
    size: string;
    type: string;
    values: string;
    quantities: number;
    images: {
        id: string;
        path: string;
    }[];
    isActive: boolean;
    base_price?: number;
    discount_price?: number;
}

interface Gift {
    id?: string;
    name: string;
    description: string;
    video: string;
    images: GiftImage[];
    base_price: number;
    discount_price: number; // Giờ đây đại diện cho % giảm giá (vd: 10 = giảm 10%)
    start_date: Date | null;
    end_date: Date | null;
    products: number[];
}

export default function CreateGiftPage() {
    // Update the initial state
    const [gift, setGift] = useState<Gift>({
        name: '',
        description: '',
        video: '',
        images: [],
        base_price: 0,
        discount_price: 0,
        start_date: new Date(), // Initialize with current date
        end_date: new Date(),   // Initialize with current date
        products: []
    });

    const [selectedProducts, setSelectedProducts] = useState<ProductDetail[]>([]);
    const [availableProducts, setAvailableProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isProductSelectOpen, setIsProductSelectOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    // State for date dropdowns
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    // Refs to detect outside clicks
    const startDateRef = useRef<HTMLDivElement>(null);
    const endDateRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    // Thêm các states mới để quản lý tốt hơn việc upload hình ảnh
    const [imageUploading, setImageUploading] = useState(false);
    const [imageProcessingCount, setImageProcessingCount] = useState(0);
    const [imageError, setImageError] = useState<string | null>(null);

    // Handle click outside date pickers
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (startDateRef.current && !startDateRef.current.contains(event.target as Node)) {
                setStartDateOpen(false);
            }
            if (endDateRef.current && !endDateRef.current.contains(event.target as Node)) {
                setEndDateOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    // Cập nhật hàm fetchAvailableProducts để sử dụng API all-product-details
    const fetchAvailableProducts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                setLoading(false);
                return;
            }

            console.log("Đang lấy danh sách chi tiết sản phẩm...");

            // Gọi API để lấy tất cả chi tiết sản phẩm
            const response = await fetch(`${HOST}/api/product-details/all-product-details`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch product details: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched all product details:", data.length);

            // Lọc sản phẩm đang hoạt động và có tồn kho trước khi cập nhật state
            setAvailableProducts(data.filter((p: ProductDetail) => p.isActive && p.quantities > 0));
            console.log("Active products with stock:", data.filter((p: ProductDetail) => p.isActive && p.quantities > 0).length);

        } catch (err) {
            console.error('Error fetching products:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchAvailableProducts();
    }, [fetchAvailableProducts]);

    // Handle image upload - đã cải tiến giống với Step1
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const files = e.target.files;

        if (!files || files.length === 0) return;

        // Check if adding these files would exceed the 9 image limit
        if (gift.images.length + files.length > 9) {
            setImageError('Chỉ được phép tải lên tối đa 9 hình ảnh');
            return;
        }

        setImageUploading(true);
        setImageProcessingCount(files.length);

        try {
            // Process each file
            const filesToProcess = Array.from(files);
            const processedImages: GiftImage[] = [];

            for (const file of filesToProcess) {
                try {
                    // Validate file type
                    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                        setImageError('Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP');
                        continue;
                    }

                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        setImageError('Kích thước ảnh không được vượt quá 5MB');
                        continue;
                    }

                    // Create object URL
                    const preview = URL.createObjectURL(file);
                    processedImages.push({
                        file,
                        preview
                    });

                    // Artificial delay to show loading state (can be removed in production)
                    await new Promise((resolve) => setTimeout(resolve, 300));

                    setImageProcessingCount((prev) => Math.max(0, prev - 1));
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            }

            setGift(prev => ({
                ...prev,
                images: [...prev.images, ...processedImages]
            }));
        } catch (error) {
            console.error('Error during image upload:', error);
            setImageError('Có lỗi xảy ra khi xử lý hình ảnh.');
        } finally {
            setImageUploading(false);
            setImageProcessingCount(0);
            // Reset the input value so the same file can be selected again
            e.target.value = '';
        }
    };

    // Remove image - cải tiến để giải phóng bộ nhớ
    const removeImage = (index: number) => {
        setGift(prev => {
            const newImages = [...prev.images];
            // Revoke object URL to free memory if it exists
            if (newImages[index].preview) {
                URL.revokeObjectURL(newImages[index].preview!);
            }
            newImages.splice(index, 1);
            return {
                ...prev,
                images: newImages
            };
        });
    };



    // Handle product selection
    const toggleProductSelection = async (product: ProductDetail) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);

        if (isSelected) {
            // Remove from selection
            setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
            setGift(prev => ({
                ...prev,
                products: prev.products.filter(id => id !== product.id)
            }));
        } else {
            // Add to selection
            setSelectedProducts(prev => [...prev, product]);
            setGift(prev => ({
                ...prev,
                products: [...prev.products, product.id]
            }));

            // Recalculate total price
            const newBasePrice = calculateTotalBasePrice([...selectedProducts, product]);
            const newDiscountPrice = calculateTotalDiscountPrice([...selectedProducts, product]);

            setGift(prev => ({
                ...prev,
                base_price: newBasePrice,
                discount_price: newDiscountPrice
            }));
        }
    };
    // Calculate total base price of selected products
    const calculateTotalBasePrice = (products: ProductDetail[]) => {
        return products.reduce((sum, product) => {
            return sum + (product.base_price || 0);
        }, 0);
    };

    // Cập nhật hàm calculateTotalDiscountPrice
    const calculateTotalDiscountPrice = (products: ProductDetail[]) => {
        // Calculate discount based on products or use a default value
        // For example, you could set a default discount percentage based on the number of products
        const baseDiscount = 5; // Base discount percentage
        const additionalDiscount = Math.min(products.length * 1, 5); // 1% per product, max 5% additional

        return baseDiscount + additionalDiscount; // Total discount percentage
    };

    // Filter products based on search term
    const filteredProducts = availableProducts.filter(product =>
        product.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.values?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().includes(searchTerm)
    );
    // Cập nhật hàm handleSubmit để xử lý đúng định dạng dữ liệu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra các điều kiện đầu vào (không thay đổi)
        if (!gift.name || gift.products.length === 0 || !gift.start_date || !gift.end_date) {
            // Thông báo lỗi (không thay đổi)
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                // Xử lý lỗi token (không thay đổi)
                return;
            }

            // Tạo FormData
            const giftFormData = new FormData();

            // API yêu cầu id là string, không được để trống
            // Nếu không có id (tạo mới), tạo một id tạm thời
            const giftId = gift.id || 'new_gift_' + Date.now();
            giftFormData.append('id', giftId);

            // Thêm các thông tin khác
            giftFormData.append('name', gift.name);
            giftFormData.append('description', gift.description || "");
            giftFormData.append('video', gift.video || "");
            giftFormData.append('base_price', gift.base_price.toString());
            giftFormData.append('discount_price', gift.discount_price.toString());
            giftFormData.append('start_date', gift.start_date!.toISOString());
            giftFormData.append('end_date', gift.end_date!.toISOString());

            // Thêm danh sách sản phẩm
            gift.products.forEach(productId => {
                giftFormData.append('products', productId.toString());
            });

            // Xử lý hình ảnh (không thay đổi)
            console.log(`Xử lý ${gift.images.length} hình ảnh...`);
            setImageProcessingCount(gift.images.length);

            for (const [index, image] of gift.images.entries()) {
                try {
                    if (image.file) {
                        console.log(`Đang xử lý hình ảnh ${index + 1}/${gift.images.length}...`);
                        giftFormData.append('images', image.file);
                    } else if (image.path) {
                        giftFormData.append('existingImages', image.path);
                    }

                    setImageProcessingCount((prev) => Math.max(0, prev - 1));
                } catch (error) {
                    console.error(`Lỗi xử lý hình ảnh ${index + 1}:`, error);
                }
            }

            console.log('Đang gửi dữ liệu quà tặng đến máy chủ...');

            // Gửi request (không thay đổi)
            const response = await fetch(`${HOST}/api/v1/gifts`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Không set Content-Type khi dùng FormData
                },
                body: giftFormData
            });

            // Phần còn lại giữ nguyên
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create gift set');
            }

            showToast('Tạo bộ quà tặng thành công!', 'success');

            setTimeout(() => {
                router.push('/seller/gift');
            }, 2000);

        } catch (err) {
            // Xử lý lỗi (không thay đổi)
            console.error('Error creating gift:', err);
            const errorMessage = err instanceof Error ? err.message : 'Không thể tạo bộ quà tặng';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
            setImageProcessingCount(0);
        }
    };

    // Format price
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <Header />
                <main className='flex-1 p-6 overflow-auto'>
                    {/* Header with title */}
                    <div className='flex justify-between items-center mb-8'>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-900'>Tạo Bộ Quà Tặng</h1>
                            <p className='mt-1 text-sm text-gray-500'>Thiết lập quà tặng mới với đầy đủ thông tin và sản phẩm</p>
                        </div>
                        <button
                            onClick={() => router.push('/seller/gifts')}
                            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Quay Lại
                        </button>
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
                                <X className='h-5 w-5' />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow overflow-hidden'>
                        <div className='p-6 border-b border-gray-200'>
                            <h2 className='text-lg font-medium text-gray-900 mb-4'>Thông tin cơ bản</h2>

                            {/* Basic information */}
                            <div className='grid grid-cols-1 gap-6'>
                                <div>
                                    <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1.5'>
                                        Tên bộ quà tặng <span className='text-red-500'>*</span>
                                    </label>
                                    <input
                                        id='name'
                                        type='text'
                                        required
                                        value={gift.name}
                                        onChange={(e) => setGift(prev => ({ ...prev, name: e.target.value }))}
                                        className={`w-full px-3 py-2 border border-red-500' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                                        placeholder='Nhập tên bộ quà tặng'
                                    />
                                </div>

                                <div>
                                    <label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-1.5'>
                                        Mô tả
                                    </label>
                                    <textarea
                                        id='description'
                                        rows={3}
                                        value={gift.description}
                                        onChange={(e) => setGift(prev => ({ ...prev, description: e.target.value }))}
                                        className={`w-full px-3 py-2 border 'border-red-500' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`} placeholder='Nhập mô tả chi tiết về bộ quà tặng'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images section - cải tiến UI giống với Step1 */}
                        <div className='p-6 border-b border-gray-200'>
                            <h2 className='text-lg font-medium text-gray-900 mb-4'>Hình ảnh và Video</h2>

                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    <span className='text-red-500'>*</span> Hình ảnh bộ quà tặng
                                </label>
                                <div className='border border-dashed border-gray-300 rounded-md p-6'>
                                    {/* Image Preview Grid */}
                                    {gift.images.length > 0 && (
                                        <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mb-4'>
                                            {gift.images.map((image, index) => (
                                                <div key={index} className='relative group'>
                                                    {/* Use a fixed aspect ratio container */}
                                                    <div className='aspect-square w-full max-w-[150px] h-[150px] relative rounded-md bg-gray-100 overflow-hidden'>
                                                        <Image
                                                            src={image.preview || image.path || '/placeholder.png'}
                                                            alt={`Gift image ${index + 1}`}
                                                            fill={true}
                                                            className='object-cover transition-all duration-200'
                                                        />
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => removeImage(index)}
                                                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600'
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload area */}
                                    <div className='flex flex-col items-center justify-center py-4'>
                                        {imageUploading ? (
                                            // Show loader when images are uploading
                                            <div className='flex flex-col items-center p-4'>
                                                <Loader2 className='h-8 w-8 animate-spin text-amber-500 mb-2' />
                                                <p className='text-sm text-gray-500'>
                                                    {imageProcessingCount > 0
                                                        ? `Đang xử lý ${imageProcessingCount} hình ảnh...`
                                                        : 'Đang xử lý hình ảnh...'}
                                                </p>
                                            </div>
                                        ) : gift.images.length < 9 ? (
                                            <>
                                                <label className='cursor-pointer flex flex-col items-center'>
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        className='h-8 w-8 text-gray-400'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                        stroke='currentColor'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                                        />
                                                    </svg>
                                                    <p className='mt-2 text-sm text-gray-500'>
                                                        Thêm hình ảnh
                                                    </p>
                                                    <input
                                                        type='file'
                                                        accept='image/jpeg,image/png,image/webp,image/jpg'
                                                        multiple
                                                        className='hidden'
                                                        onChange={handleImageUpload}
                                                        disabled={imageUploading}
                                                    />
                                                </label>
                                                <p className='mt-2 text-xs text-gray-500 text-center'>
                                                    Định dạng: JPG, JPEG, PNG, WEBP. Kích thước tối đa: 5MB/ảnh
                                                </p>
                                            </>
                                        ) : (
                                            <p className='text-amber-600 text-sm'>
                                                Đã đạt giới hạn tối đa 9 hình ảnh
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {imageError && (
                                    <p className='text-red-500 text-xs mt-1'>{imageError}</p>
                                )}
                            </div>

                            {/* Video URL Input */}
                            <div className='mt-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Video (tùy chọn)
                                </label>
                                <input
                                    type='text'
                                    value={gift.video}
                                    onChange={(e) => setGift(prev => ({ ...prev, video: e.target.value }))}
                                    placeholder='Nhập URL video (YouTube, TikTok, ...)'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500'
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    Video sẽ giúp khách hàng hiểu rõ hơn về bộ quà tặng của bạn
                                </p>
                            </div>
                        </div>

                        {/* Product selection section */}
                        <div className='p-6 border-b border-gray-200'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-lg font-medium text-gray-900'>Sản phẩm trong bộ quà tặng</h2>
                                <button
                                    type='button'
                                    onClick={() => setIsProductSelectOpen(!isProductSelectOpen)}
                                    className='px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center'
                                >
                                    <Plus className='h-4 w-4 mr-1' />
                                    {isProductSelectOpen ? 'Đóng' : 'Thêm sản phẩm'}
                                </button>
                            </div>

                            {/* Selected products list */}
                            {selectedProducts.length > 0 ? (
                                <div className='mb-4 border rounded-md overflow-hidden'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                        <thead className='bg-gray-50'>
                                            <tr>
                                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                    Sản phẩm
                                                </th>
                                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                    Chi tiết
                                                </th>
                                                <th scope='col' className='relative px-6 py-3'>
                                                    <span className='sr-only'>Xóa</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='bg-white divide-y divide-gray-200'>
                                            {selectedProducts.map(product => (
                                                <tr key={product.id}>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <div className='flex items-center'>
                                                            <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                                                                <Image
                                                                    src={product.images?.[0]?.path || '/placeholder.png'}
                                                                    alt={`Product ${product.id}`}
                                                                    width={40}
                                                                    height={40}
                                                                    className='h-full w-full object-cover'
                                                                />
                                                            </div>
                                                            <div className='ml-4'>
                                                                <div className='text-sm font-medium text-gray-900'>
                                                                    ID: {product.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 whitespace-nowrap'>
                                                        <div className='text-sm text-gray-900'>
                                                            {product.size && <span className='mr-2'>{product.size}</span>}
                                                            {product.type && <span className='mr-2'>{product.type}</span>}
                                                            {product.values && <span>{product.values}</span>}
                                                        </div>
                                                        <div className='text-sm text-gray-500'>
                                                            Số lượng: {product.quantities}
                                                        </div>
                                                    </td>

                                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                                        <button
                                                            type='button'
                                                            onClick={() => toggleProductSelection(product)}
                                                            className='text-red-600 hover:text-red-900'
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                            ) : (
                                <div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                                    <ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
                                    <h3 className='mt-2 text-sm font-medium text-gray-900'>Chưa có sản phẩm</h3>
                                    <p className='mt-1 text-sm text-gray-500'>Bắt đầu bằng cách thêm sản phẩm vào bộ quà tặng.</p>
                                    <div className='mt-6'>
                                        <button
                                            type='button'
                                            onClick={() => setIsProductSelectOpen(true)}
                                            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                                        >
                                            <Plus className='h-5 w-5 mr-2' />
                                            Thêm sản phẩm
                                        </button>
                                    </div>
                                </div>
                            )}



                            {/* Product search and selection */}
                            {isProductSelectOpen && (
                                <div className='mt-4 border rounded-lg overflow-hidden'>
                                    <div className='bg-gray-50 px-4 py-3 border-b'>
                                        <div className='flex items-center'>
                                            <div className='flex-grow'>
                                                <input
                                                    type='text'
                                                    placeholder='Tìm kiếm sản phẩm...'
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className={`w-full px-3 py-2 border border-red-500' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`} />
                                            </div>
                                            <div className='ml-4'>
                                                <span className='text-sm text-gray-500'>
                                                    {filteredProducts.length} sản phẩm
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='max-h-80 overflow-y-auto'>
                                        {loading ? (
                                            <div className='flex justify-center items-center p-8'>
                                                <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500'></div>
                                            </div>
                                        ) : filteredProducts.length === 0 ? (
                                            <div className='p-8 text-center text-gray-500'>
                                                {searchTerm
                                                    ? `Không tìm thấy sản phẩm phù hợp với "${searchTerm}"`
                                                    : 'Không có sản phẩm nào khả dụng'}
                                            </div>
                                        ) : (
                                            <table className='min-w-full divide-y divide-gray-200'>
                                                <thead className='bg-white'>
                                                    <tr>
                                                        <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                            Sản phẩm
                                                        </th>
                                                        <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                            Chi tiết
                                                        </th>

                                                        <th scope='col' className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                            Chọn
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className='bg-white divide-y divide-gray-200'>
                                                    {filteredProducts.map(product => {
                                                        const isSelected = selectedProducts.some(p => p.id === product.id);
                                                        return (
                                                            <tr key={product.id} className={isSelected ? 'bg-amber-50' : ''}>
                                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                                    <div className='flex items-center'>
                                                                        <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                                                                            <Image
                                                                                src={product.images?.[0]?.path || '/placeholder.png'}
                                                                                alt={`Product ${product.id}`}
                                                                                width={40}
                                                                                height={40}
                                                                                className='h-full w-full object-cover'
                                                                            />
                                                                        </div>
                                                                        <div className='ml-4'>
                                                                            <div className='text-sm font-medium text-gray-900'>
                                                                                ID: {product.id}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                                    <div className='text-sm text-gray-900'>
                                                                        {product.size && <span className='mr-2'>{product.size}</span>}
                                                                        {product.type && <span className='mr-2'>{product.type}</span>}
                                                                        {product.values && <span>{product.values}</span>}
                                                                    </div>
                                                                    <div className='text-sm text-gray-500'>
                                                                        Số lượng: {product.quantities}
                                                                    </div>
                                                                </td>

                                                                <td className='px-6 py-4 whitespace-nowrap text-center'>
                                                                    <button
                                                                        type='button'
                                                                        onClick={() => toggleProductSelection(product)}
                                                                        className={`px-3 py-1 rounded text-sm ${isSelected
                                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        {isSelected ? 'Đã chọn' : 'Chọn'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Date range section */}
                        <div className='p-6 border-b border-gray-200'>
                            <h2 className='text-lg font-medium text-gray-900 mb-4'>Thời gian khuyến mãi</h2>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {/* Start date */}
                                <div ref={startDateRef} className="relative">
                                    <div className='flex items-center text-gray-700 mb-1.5'>
                                        <Calendar size={16} className='mr-2' />
                                        <label className='text-sm font-medium'>
                                            Ngày bắt đầu <span className='text-red-500'>*</span>
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStartDateOpen(!startDateOpen)}
                                        className={`flex items-center justify-between w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white text-left focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                                    >
                                        <span>
                                            {gift.start_date ? format(gift.start_date, 'dd/MM/yyyy') : 'Chọn ngày'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </button>

                                    {startDateOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 p-2">
                                            <input
                                                type="date"
                                                value={gift.start_date ? format(gift.start_date, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const date = new Date(e.target.value);
                                                        setGift(prev => ({ ...prev, start_date: date }));
                                                    } else {
                                                        setGift(prev => ({ ...prev, start_date: null }));
                                                    }
                                                    setStartDateOpen(false);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* End date */}
                                <div ref={endDateRef} className="relative">
                                    <div className='flex items-center text-gray-700 mb-1.5'>
                                        <Calendar size={16} className='mr-2' />
                                        <label className='text-sm font-medium'>
                                            Ngày kết thúc <span className='text-red-500'>*</span>
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEndDateOpen(!endDateOpen)}
                                        className={`flex items-center justify-between w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-white text-left focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                                    >
                                        <span>
                                            {gift.end_date ? format(gift.end_date, 'dd/MM/yyyy') : 'Chọn ngày'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </button>

                                    {endDateOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 p-2">
                                            <input
                                                type="date"
                                                value={gift.end_date ? format(gift.end_date, 'yyyy-MM-dd') : ''}
                                                min={gift.start_date ? format(gift.start_date, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const date = new Date(e.target.value);
                                                        if (!gift.start_date || date >= gift.start_date) {
                                                            setGift(prev => ({ ...prev, end_date: date }));
                                                            setEndDateOpen(false);
                                                        } else {
                                                            showToast('Ngày kết thúc phải sau ngày bắt đầu', 'error');
                                                        }
                                                    } else {
                                                        setGift(prev => ({ ...prev, end_date: null }));
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Price section */}
                        <div className='p-6 border-b border-gray-200'>
                            <h2 className='text-lg font-medium text-gray-900 mb-4'>Thông tin giá bộ quà tặng</h2>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <div className='flex items-center text-gray-700 mb-1.5'>
                                        <DollarSign size={16} className='mr-2' />
                                        <label htmlFor='base_price' className='text-sm font-medium'>
                                            Giá gốc <span className='text-red-500'>*</span>
                                        </label>
                                    </div>
                                    <div className='mt-1 relative rounded-md shadow-sm'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        </div>
                                        <input
                                            id='base_price'
                                            required
                                            value={gift.base_price}
                                            onChange={(e) => setGift(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                                            className={`w-full px-3 py-2 border border-red-500' : 'border-gray-300'
                                            } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`} placeholder='0'
                                        />
                                        <div className='absolute inset-y-0 right-0 flex items-center'>
                                            <label htmlFor='currency' className='sr-only'>Tiền tệ</label>
                                            <span className='px-3 py-2 text-gray-500 text-sm'>VND</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex items-center text-gray-700 mb-1.5'>
                                        <DollarSign size={16} className='mr-2' />
                                        <label htmlFor='discount_price' className='text-sm font-medium'>
                                            Phần trăm giảm giá (%) <span className='text-red-500'>*</span>
                                        </label>
                                    </div>
                                    <div className='mt-1 relative rounded-md shadow-sm'>
                                        <input
                                            id='discount_price'
                                            required
                                            min="0"
                                            max="100"
                                            value={gift.discount_price}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value) || 0;
                                                // Giới hạn giá trị từ 0-100%
                                                const clampedValue = Math.min(Math.max(value, 0), 100);
                                                setGift(prev => ({ ...prev, discount_price: clampedValue }));
                                            }}
                                            className={`w-full px-3 py-2 border ${gift.discount_price < 0 || gift.discount_price > 100 ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                                            placeholder='0'
                                        />
                                        <div className='absolute inset-y-0 right-0 flex items-center'>
                                            <span className='px-3 py-2 text-gray-500 text-sm'>%</span>
                                        </div>
                                    </div>
                                    {(gift.discount_price < 0 || gift.discount_price > 100) && (
                                        <p className='mt-1 text-sm text-red-600'>
                                            Phần trăm giảm giá phải từ 0% đến 100%
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className='mt-4'>
                                <p className='text-sm text-gray-500'>
                                    {gift.discount_price > 0 ? (
                                        <>
                                            <span className='font-medium'>Giá sau giảm:</span>
                                            <span className='text-green-600 font-medium ml-1'>
                                                {formatPrice(gift.base_price * (1 - gift.discount_price / 100))}
                                            </span>
                                            <span className='ml-1'>(Giảm {gift.discount_price}%)</span>
                                        </>
                                    ) : (
                                        'Thiết lập phần trăm giảm giá để mời gọi khách hàng!'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Submit section */}
                        <div className='p-6 flex justify-end'>
                            <button
                                type='button'
                                onClick={() => router.push('/seller/gifts')}
                                className='mx-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                            >
                                Hủy
                            </button>
                            <button
                                type='submit'
                                disabled={loading}
                                className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className='flex items-center'>
                                        <div className='animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full'></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    'Tạo bộ quà tặng'
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>

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