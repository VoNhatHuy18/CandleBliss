'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import { incrementCartBadge } from '@/app/utils/cartBadgeManager';
import { HOST } from '@/app/constants/api';
import { useCart } from '@/app/contexts/CartContext';

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

// Interface cho chi tiết sản phẩm trong quà tặng
interface ProductDetail {
    id: number;
    name?: string;
    size?: string;
    type?: string;
    values?: string;
    quantities?: number;
    images?: GiftImage[];
    isActive?: boolean;
    base_price?: number;
    discount_price?: number;
    productId?: number;
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
    productDetails?: ProductDetail[];
}

// Format giá với định dạng tiền tệ Việt Nam
const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(numPrice);
};

// Tính giá sau khi áp dụng phần trăm giảm giá
const calculateDiscountedPrice = (basePrice: string | number, discountPercent: string | number): number => {
    const basePriceNum = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
    const discountPercentNum = typeof discountPercent === 'string' ? parseFloat(discountPercent) : discountPercent;

    if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

    return basePriceNum * (1 - discountPercentNum / 100);
};

export default function GiftDetailPage() {
    const params = useParams();
    const router = useRouter();
    const giftId = params.id as string;

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [activeThumbnail, setActiveThumbnail] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gift, setGift] = useState<Gift | null>(null);
    const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Inside your component
    const { updateCartBadge } = useCart();

    // Kiểm tra quà tặng có đang hoạt động không
    const isGiftActive = () => {
        if (!gift) return false;

        const now = new Date();
        const start = new Date(gift.start_date);
        const end = new Date(gift.end_date);

        return now >= start && now <= end;
    };

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Hàm để lấy chi tiết sản phẩm - cải tiến từ phiên bản seller
    const fetchProductDetails = async (productIds: number[]) => {
        if (!productIds || productIds.length === 0) {
            console.log("Không có ID sản phẩm để lấy thông tin");
            return;
        }

        try {
            console.log("Đang lấy thông tin chi tiết cho sản phẩm có ID:", productIds);

            // Xây dựng URL với nhiều tham số ids
            let apiUrl = `${HOST}/api/product-details/list-product-detail`;

            // Thêm mỗi ID như một tham số truy vấn riêng biệt
            // Định dạng: ?ids=34&ids=35&ids=36
            const queryParams = productIds.map(id => `ids=${id}`).join('&');
            apiUrl = `${apiUrl}?${queryParams}`;

            console.log("API URL:", apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                console.error(`Không thể lấy thông tin chi tiết sản phẩm: ${response.status} ${response.statusText}`);
                return;
            }

            // Parse phản hồi JSON
            const data = await response.json();
            console.log("Thông tin chi tiết sản phẩm:", data);

            // Cập nhật state với tất cả thông tin chi tiết sản phẩm đã lấy
            setProductDetails(data);
        } catch (err) {
            console.error('Lỗi khi lấy thông tin chi tiết sản phẩm:', err);
        }
    };

    // Tải chi tiết quà tặng và sản phẩm bên trong
    useEffect(() => {
        const fetchGiftDetail = async () => {
            try {
                setLoading(true);

                if (!giftId) {
                    setError('ID quà tặng không hợp lệ');
                    setLoading(false);
                    return;
                }

                console.log('Đang lấy thông tin quà tặng với ID:', giftId);

                // Fetch gift details using v1 API
                const giftResponse = await fetch(`${HOST}/api/v1/gifts/${giftId}`);

                if (!giftResponse.ok) {
                    throw new Error(`Không tìm thấy quà tặng có ID ${giftId}`);
                }

                // Log ra phản hồi thô cho mục đích gỡ lỗi
                const responseText = await giftResponse.text();
                console.log("Raw gift response:", responseText);

                let giftData;
                try {
                    giftData = JSON.parse(responseText);
                } catch (e) {
                    console.error("Không thể phân tích JSON quà tặng:", e);
                    throw new Error("Phản hồi JSON từ server không hợp lệ");
                }

                console.log("Dữ liệu quà tặng phân tích:", giftData);

                // Xử lý phản hồi có thể là mảng (tương tự trang seller)
                const finalGiftData = Array.isArray(giftData) && giftData.length > 0 ? giftData[0] : giftData;
                console.log("Dữ liệu quà tặng cuối cùng:", finalGiftData);

                setGift(finalGiftData);

                // Tìm ID sản phẩm trong mảng 'products'
                if (finalGiftData?.products && finalGiftData.products.length > 0) {
                    console.log("Tìm thấy sản phẩm:", finalGiftData.products);
                    await fetchProductDetails(finalGiftData.products);
                } else {
                    console.log("Không tìm thấy ID sản phẩm trong dữ liệu quà tặng");
                }

                // Save view to history
                saveGiftView(finalGiftData.id);

            } catch (err) {
                console.error('Lỗi khi lấy thông tin quà tặng:', err);
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin quà tặng');
            } finally {
                setLoading(false);
            }
        };

        fetchGiftDetail();
    }, [giftId]);

    // Kiểm tra sản phẩm yêu thích
    useEffect(() => {
        if (gift?.id) {
            const favorites = JSON.parse(localStorage.getItem('favoriteGifts') || '[]');
            setIsFavorite(favorites.includes(gift.id));
        }
    }, [gift?.id]);

    // Nếu không có hình, đặt hình placeholder
    useEffect(() => {
        if (gift && (!gift.images || gift.images.length === 0)) {
            setGift((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    images: [{
                        id: '0',
                        path: '/images/placeholder.jpg',
                        public_id: 'placeholder',
                    }],
                };
            });
        }
    }, [gift]);

    // Lưu lịch sử xem quà tặng
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

        const updatedViews = views
            .sort((a: GiftViewHistoryItem, b: GiftViewHistoryItem) => b.lastViewed - a.lastViewed)
            .slice(0, 50);

        localStorage.setItem('giftViewHistory', JSON.stringify(updatedViews));
    };

    // Thêm/xóa quà tặng khỏi danh sách yêu thích
    const toggleFavorite = () => {
        if (!gift) return;

        const favorites = JSON.parse(localStorage.getItem('favoriteGifts') || '[]');

        if (isFavorite) {
            const updatedFavorites = favorites.filter((favId: string) => favId !== gift.id);
            localStorage.setItem('favoriteGifts', JSON.stringify(updatedFavorites));
        } else {
            favorites.push(gift.id);
            localStorage.setItem('favoriteGifts', JSON.stringify(favorites));
        }

        setIsFavorite(!isFavorite);
    };

    // Giảm số lượng
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Tăng số lượng
    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Thêm vào giỏ hàng
    const handleAddToCart = () => {
        if (!gift) return;

        // Tính giá sau khi giảm giá
        const basePrice = parseFloat(gift.base_price);
        const discountPercent = parseFloat(gift.discount_price);
        const finalPrice = calculateDiscountedPrice(basePrice, discountPercent);

        // Định nghĩa kiểu cho options
        type CartItemOption = { name: string; value: string; type: string };

        // Tạo đối tượng sản phẩm trong giỏ hàng với chi tiết đầy đủ
        const cartItem = {
            id: gift.id,
            name: gift.name,
            price: finalPrice,
            quantity: quantity,
            image: gift.images && gift.images.length > 0
                ? gift.images[0].path
                : '/images/placeholder.jpg',
            isGift: true,
            // Lưu toàn bộ thông tin chi tiết sản phẩm
            productDetails: productDetails.map(detail => ({
                id: detail.id,
                detailId: detail.id,
                name: detail.name || detail.values || `Sản phẩm #${detail.id}`,
                price: detail.base_price || 0,
                quantity: 1,
                image: detail.images && detail.images.length > 0
                    ? detail.images[0].path
                    : '/images/placeholder.jpg',
                type: detail.type || '',
                size: detail.size || '',
                value: detail.values || '',
                options: [] as CartItemOption[]
            }))
        };

        // Thêm options cho mỗi sản phẩm
        cartItem.productDetails = cartItem.productDetails.map(product => {
            const options: CartItemOption[] = [];
            if (product.size) {
                options.push({
                    name: 'Kích thước',
                    value: product.size,
                    type: 'size'
                });
            }
            if (product.type && product.value) {
                options.push({
                    name: product.type,
                    value: product.value,
                    type: 'type'
                });
            }
            return { ...product, options };
        });

        // Lưu vào localStorage
        interface CartItem {
            id: string;
            name: string;
            price: number;
            quantity: number;
            image: string;
            isGift: boolean;
            productDetails: ProductDetail[];
        }
        const cartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = cartItems.findIndex(
            (item) => item.id === cartItem.id && item.isGift === true
        );

        if (existingItemIndex >= 0) {
            cartItems[existingItemIndex].quantity += cartItem.quantity;
        } else {
            cartItems.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));

        // Hiển thị thông báo
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        incrementCartBadge(quantity);
    };

    // Mua ngay
    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/user/cart');
    };

    // Add this function to your GiftDetailPage component
    // Define the type for cart item options
    interface CartItemOption {
        name: string;
        value: string;
        type: string;
    }

    // Define CartItem type for use in this function
    interface CartItem {
        id: number;
        detailId: number;
        name: string;
        price: number;
        quantity: number;
        image: string;
        type: string;
        size: string;
        value: string;
        options: CartItemOption[];
    }

    const addProductToCart = (product: ProductDetail) => {
        try {
            // Create a properly formatted options array
            const options = [];

            if (product.size) {
                options.push({
                    name: 'Kích thước',
                    value: product.size,
                    type: 'size'
                });
            }

            if (product.type && product.values) {
                options.push({
                    name: product.type,
                    value: product.values,
                    type: 'type'
                });
            }

            // Create item for cart with proper structure matching CartItem interface
            const cartItem = {
                id: product.id,
                detailId: product.id,
                name: product.name || product.values || `Sản phẩm #${product.id}`,
                price: product.base_price || 0,
                quantity: 1,
                image: product.images && product.images.length > 0
                    ? product.images[0].path
                    : '/images/placeholder.jpg',
                type: product.type || '',
                size: product.size || '',
                value: product.values || '',
                options: options, // Use the properly initialized options array
            };

            // Get current cart items
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');

            // Check if product already exists in cart
            const existingItemIndex = cart.findIndex((item: CartItem) =>
                item.detailId === cartItem.detailId
            );

            if (existingItemIndex >= 0) {
                // Increment quantity if item already exists
                cart[existingItemIndex].quantity += 1;
            } else {
                // Add new item
                cart.push(cartItem);
            }

            // Save updated cart
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart badge
            const currentBadge = localStorage.getItem('cartBadge');
            const newBadgeCount = currentBadge ? parseInt(currentBadge) + 1 : 1;
            localStorage.setItem('cartBadge', newBadgeCount.toString());

            // If you're using a context for the cart, update it
            if (typeof updateCartBadge === 'function') {
                updateCartBadge(newBadgeCount);
            }

            // Show notification
            setShowCartNotification(true);
            setTimeout(() => setShowCartNotification(false), 3000);
        } catch (error) {
            console.error("Error adding product to cart:", error);
            alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
        }
    };

    // Hiển thị loading state
    if (loading) {
        return (
            <div className='bg-[#F1EEE9] min-h-screen'>
                <Header />
                <div className='container mx-auto px-4 py-12 flex justify-center items-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
                </div>
                <Footer />
            </div>
        );
    }

    // Hiển thị lỗi
    if (error || !gift) {
        return (
            <div className='bg-[#F1EEE9] min-h-screen'>
                <Header />
                <div className='container mx-auto px-4 py-12'>
                    <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center'>
                        {error || 'Không tìm thấy thông tin bộ quà tặng'}
                    </div>
                    <div className='text-center mt-6'>
                        <Link href='/user/gifts' className='text-orange-700 hover:underline'>
                            Quay lại trang quà tặng
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Tính giá sau khi giảm giá
    const basePrice = parseFloat(gift.base_price);
    const discountPercent = parseFloat(gift.discount_price);
    const hasDiscount = discountPercent > 0;
    const discountedPrice = calculateDiscountedPrice(gift.base_price, gift.discount_price);

    return (
        <div className='bg-[#F1EEE9] min-h-screen'>
            {/* Header */}
            <Header />

            {/* Breadcrumbs */}
            <div className='container mx-auto px-4 py-2 text-sm'>
                <div className='flex items-center text-gray-500'>
                    <Link href='/' className='hover:text-orange-700'>
                        Trang chủ
                    </Link>
                    <span className='mx-2'>/</span>
                    <Link href='/user/gifts' className='hover:text-orange-700'>
                        Bộ quà tặng
                    </Link>
                    <span className='mx-2'>/</span>
                    <span className='text-gray-700 font-medium'>{gift.name}</span>
                </div>
            </div>

            {/* Gift Section */}
            <div className='container mx-auto px-4 py-6'>
                <div className='flex flex-col md:flex-row -mx-4'>
                    {/* Gift Images */}
                    <div className='md:w-1/2 px-4 mb-6'>
                        {/* Main Gift Image */}
                        <div className='relative bg-white mb-4 h-96 rounded-lg shadow-sm'>
                            <Image
                                src={gift.images && gift.images.length > activeThumbnail
                                    ? gift.images[activeThumbnail].path
                                    : '/images/placeholder.jpg'}
                                alt={gift.name}
                                layout='fill'
                                objectFit='contain'
                                className='p-4'
                            />

                            {/* Image source indicator */}
                            {gift.images && gift.images.length > 0 && (
                                <div className='absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded'>
                                    {activeThumbnail + 1}/{gift.images.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails Gallery */}
                        {gift.images && gift.images.length > 1 && (
                            <div className='flex flex-wrap -mx-1 overflow-x-auto pb-2'>
                                {gift.images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={`p-1 w-1/6 cursor-pointer ${activeThumbnail === index ? 'ring-2 ring-orange-500' : ''
                                            }`}
                                        onClick={() => setActiveThumbnail(index)}
                                    >
                                        <div className='relative bg-white h-16 rounded shadow-sm'>
                                            <Image
                                                src={image.path}
                                                alt={`${gift.name} - hình ${index + 1}`}
                                                layout='fill'
                                                objectFit='contain'
                                                className='p-1'
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Video link if available */}
                        {gift.video && (
                            <div className="mt-4">
                                <a
                                    href={gift.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M10 4a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1h-6a1 1 0 01-1-1V4zm2 2v6l4-3-4-3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Xem video giới thiệu
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Gift Details */}
                    <div className='md:w-1/2 px-4'>
                        <h1 className='text-3xl font-medium mb-2'>{gift.name}</h1>
                        <div className='flex items-center mb-4'>
                            <div className='flex items-center'>
                                <span className='text-gray-500 text-sm mr-2'>Mã quà tặng: {gift.id}</span>
                                <span className='mx-2 text-gray-300'>|</span>
                                <div className='flex items-center text-sm'>
                                    <span
                                        className={isGiftActive() ? 'text-green-600' : 'text-red-600'}
                                    >
                                        {isGiftActive() ? 'Đang diễn ra' : 'Không khả dụng'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Gift Status & Date range */}
                        <div className='flex flex-wrap items-center mb-4'>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 ${isGiftActive()
                                    ? 'bg-green-100 text-green-800'
                                    : new Date() < new Date(gift.start_date)
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {isGiftActive()
                                    ? 'Đang diễn ra'
                                    : new Date() < new Date(gift.start_date)
                                        ? 'Sắp diễn ra'
                                        : 'Đã kết thúc'}
                            </span>
                            <span className='text-sm text-gray-600'>
                                {formatDate(gift.start_date)} - {formatDate(gift.end_date)}
                            </span>
                        </div>

                        {/* Gift Price */}
                        <div className='mb-6 bg-gray-50 p-4 rounded'>
                            <div className='flex items-center'>
                                {hasDiscount ? (
                                    <>
                                        <span className='text-red-600 text-2xl font-medium'>
                                            {formatPrice(discountedPrice)}
                                        </span>
                                        <span className='ml-2 text-gray-500 line-through'>
                                            {formatPrice(basePrice)}
                                        </span>
                                        <div className='bg-red-600 text-white text-xs px-2 py-1 rounded ml-2'>
                                            Giảm {discountPercent}%
                                        </div>
                                    </>
                                ) : (
                                    <span className='text-red-600 text-2xl font-medium'>
                                        {formatPrice(basePrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className='mb-6'>
                            <div className='flex items-center mb-4'>
                                <span className='text-gray-700 w-24 font-medium'>Số lượng:</span>
                                <div className='flex shadow-sm'>
                                    <button
                                        className='border border-gray-300 px-3 py-1 rounded-l hover:bg-gray-100'
                                        onClick={decreaseQuantity}
                                        disabled={!isGiftActive()}
                                    >
                                        -
                                    </button>
                                    <input
                                        type='text'
                                        className='border-t border-b border-gray-300 w-12 text-center'
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        className='border border-gray-300 px-3 py-1 rounded-r hover:bg-gray-100'
                                        onClick={increaseQuantity}
                                        disabled={!isGiftActive()}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Gift Products List */}
                            <div className='mb-6'>
                                <h3 className='text-gray-700 font-medium mb-2'>
                                    Bao gồm {productDetails.length} sản phẩm:
                                </h3>
                                <div className='bg-amber-50 p-3 rounded-md'>
                                    <ul className='list-disc pl-5 space-y-1'>
                                        {productDetails.length > 0 ? (
                                            productDetails.map((product) => (
                                                <li key={product.id} className='text-gray-700'>
                                                    {product.name || product.values || `Sản phẩm #${product.id}`}
                                                    <span className='text-sm text-gray-500 ml-2'>
                                                        {product.size && `Size: ${product.size}`}
                                                        {product.type && `, ${product.type}`}
                                                        {product.values && `: ${product.values}`}
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className='text-gray-500 italic'>Không có thông tin chi tiết sản phẩm</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='grid grid-cols-1 gap-3 mb-2'>
                                <div className='flex space-x-3'>
                                    <button
                                        className='flex-1 flex justify-center items-center bg-white border border-gray-300 py-2.5 text-sm text-gray-700 rounded hover:bg-gray-50 transition disabled:opacity-50'
                                        onClick={handleAddToCart}
                                        disabled={!isGiftActive()}
                                    >
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-4 w-4 mr-1'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                                            />
                                        </svg>
                                        <span>Thêm vào giỏ hàng</span>
                                    </button>
                                    <button
                                        className='flex-1 bg-orange-700 border border-orange-700 py-3 text-sm text-white rounded hover:bg-orange-800 transition font-medium disabled:opacity-50 disabled:hover:bg-orange-700'
                                        onClick={handleBuyNow}
                                        disabled={!isGiftActive()}
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                                <div className='grid grid-cols-2 gap-3'>
                                    <button
                                        className={`py-2 px-4 rounded-lg flex items-center justify-center ${isFavorite
                                            ? 'bg-pink-100 text-pink-700 border border-pink-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                            } transition-colors`}
                                        onClick={toggleFavorite}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-pink-700' : 'fill-none'}`}
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                        {isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                                    </button>

                                    <button
                                        className="py-2 px-4 rounded-lg flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
                                        onClick={() => {
                                            navigator.share({
                                                title: gift.name,
                                                text: gift.description,
                                                url: window.location.href,
                                            }).catch((err) => {
                                                console.error('Error sharing:', err);
                                            });
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                            />
                                        </svg>
                                        Chia sẻ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gift Description */}
                <div className='mt-10 bg-white shadow rounded'>
                    <div className='border-b border-gray-200'>
                        <div className='container mx-auto px-4'>
                            <ul className='flex flex-wrap'>
                                <li
                                    className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${activeTab === 0
                                        ? 'border-b-2 border-orange-500 text-orange-700'
                                        : 'text-gray-600 hover:text-orange-700'
                                        }`}
                                    onClick={() => setActiveTab(0)}
                                >
                                    Mô Tả Quà Tặng
                                </li>
                                <li
                                    className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${activeTab === 1
                                        ? 'border-b-2 border-orange-500 text-orange-700'
                                        : 'text-gray-600 hover:text-orange-700'
                                        }`}
                                    onClick={() => setActiveTab(1)}
                                >
                                    Thông Tin Sản Phẩm
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className='p-6'>
                        {activeTab === 0 && (
                            <div>
                                <p className='mb-6 text-gray-700 leading-relaxed'>
                                    {gift.description || 'Không có mô tả chi tiết cho bộ quà tặng này.'}
                                </p>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className='bg-white'>
                                <h3 className="font-medium text-lg mb-4">Chi tiết các sản phẩm trong bộ quà tặng:</h3>

                                {productDetails.length > 0 ? (
                                    <>
                                        {/* Danh sách sản phẩm dạng thẻ với hình ảnh */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                            {productDetails.map((detail) => (
                                                <div key={detail.id} className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow">
                                                    <div className="relative aspect-square overflow-hidden rounded-md mb-3 bg-white">
                                                        {detail.images && detail.images.length > 0 ? (
                                                            <Image
                                                                src={detail.images[0].path}
                                                                alt={detail.name || detail.values || `Sản phẩm #${detail.id}`}
                                                                layout="fill"
                                                                objectFit="contain"
                                                                className="p-2"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/images/placeholder.jpg';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full bg-gray-100">
                                                                <p className="text-gray-400 text-sm">Không có hình ảnh</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium text-gray-800 mb-1 truncate">
                                                        {detail.name || detail.values || `Sản phẩm #${detail.id}`}
                                                    </h4>
                                                    <div className="text-sm space-y-1">
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Mã SP:</span> #{detail.id}
                                                        </p>
                                                        {detail.size && (
                                                            <p className="text-gray-600">
                                                                <span className="font-medium">Kích thước:</span> {detail.size}
                                                            </p>
                                                        )}
                                                        {detail.type && (
                                                            <p className="text-gray-600">
                                                                <span className="font-medium">{detail.type}:</span> {detail.values}
                                                            </p>
                                                        )}

                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Bảng chi tiết sản phẩm */}
                                        <div className="overflow-x-auto">
                                            <h4 className="font-medium text-base mb-3">Chi tiết kỹ thuật:</h4>
                                            <table className='w-full border-collapse'>
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="py-2 px-4 text-left border-b">STT</th>
                                                        <th className="py-2 px-4 text-left border-b">Mã sản phẩm</th>
                                                        <th className="py-2 px-4 text-left border-b">Tên</th>
                                                        <th className="py-2 px-4 text-left border-b">Kích thước</th>
                                                        <th className="py-2 px-4 text-left border-b">Loại</th>
                                                        <th className="py-2 px-4 text-left border-b">Giá trị</th>
                                                        <th className="py-2 px-4 text-left border-b">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productDetails.map((detail, index) => (
                                                        <tr key={detail.id} className="border-b hover:bg-gray-50">
                                                            <td className="py-3 px-4">{index + 1}</td>
                                                            <td className="py-3 px-4">#{detail.id}</td>
                                                            <td className="py-3 px-4">{detail.name || detail.values || `Sản phẩm #${detail.id}`}</td>
                                                            <td className="py-3 px-4">{detail.size || '—'}</td>
                                                            <td className="py-3 px-4">{detail.type || '—'}</td>
                                                            <td className="py-3 px-4">{detail.values || '—'}</td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() => addProductToCart(detail)}
                                                                    className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 rounded text-sm transition-colors"
                                                                    disabled={!isGiftActive()}
                                                                >
                                                                    + Thêm vào giỏ
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
                                        <p>Không có thông tin chi tiết về sản phẩm trong bộ quà tặng này.</p>
                                    </div>
                                )}

                                {/* Thông tin chung */}
                                <div className="mt-6">
                                    <h3 className="font-medium text-lg mb-4">Thông tin chung:</h3>
                                    <table className='w-full border-collapse'>
                                        <tbody>
                                            <tr className='border-b'>
                                                <td className='py-3 font-medium w-1/3'>Thương hiệu</td>
                                                <td className='py-3'>CandleBliss</td>
                                            </tr>
                                            <tr className='border-b'>
                                                <td className='py-3 font-medium'>Xuất xứ</td>
                                                <td className='py-3'>Việt Nam</td>
                                            </tr>
                                            <tr className='border-b'>
                                                <td className='py-3 font-medium'>Thời gian khuyến mãi</td>
                                                <td className='py-3'>
                                                    {formatDate(gift.start_date)} - {formatDate(gift.end_date)}
                                                </td>
                                            </tr>
                                            <tr className='border-b'>
                                                <td className='py-3 font-medium'>Số sản phẩm trong bộ</td>
                                                <td className='py-3'>{productDetails.length || gift.products.length} sản phẩm</td>
                                            </tr>
                                            <tr className='border-b'>
                                                <td className='py-3 font-medium'>Tình trạng</td>
                                                <td className='py-3'>
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isGiftActive()
                                                            ? 'bg-green-100 text-green-800'
                                                            : new Date() < new Date(gift.start_date)
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {isGiftActive()
                                                            ? 'Đang diễn ra'
                                                            : new Date() < new Date(gift.start_date)
                                                                ? 'Sắp diễn ra'
                                                                : 'Đã kết thúc'}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <ViewedCarousel />
            </div>

            {/* Footer */}
            <Footer />

            {/* Cart Notification */}
            {showCartNotification && (
                <div className='fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 animate-fade-in-out'>
                    <div className='flex items-center'>
                        <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span>Đã thêm bộ quà tặng vào giỏ hàng!</span>
                    </div>
                </div>
            )}
        </div>
    );
}