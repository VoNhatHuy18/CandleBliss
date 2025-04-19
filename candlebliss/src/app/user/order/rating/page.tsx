'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import AuthService from '@/app/utils/authService';

// Interface for order item
interface OrderItem {
    id: number;
    status: string;
    unit_price: string;
    product_detail_id: number;
    quantity: number;
    totalPrice: string;
    // Removed duplicate 'product_id' declaration
    product?: {
        id: number;
        name: string;
        images: Array<{
            id: string;
            path: string;
            public_id: string;
        }>;
    };
    product_detail?: {
        id: number;
        size: string;
        type: string;
        values: string;
        images: Array<{
            id: string;
            path: string;
            public_id: string;
        }>;
    };
    productDetailData?: {
        id: number;
        size: string;
        type: string;
        values: string;
        images: Array<{
            id: string;
            path: string;
            public_id: string;
        }>;
    };
    rating?: number;
    review?: string;
    product_id?: number;
}

// Interface for order
interface Order {
    id: number;
    order_code: string;
    user_id: number;
    status: string;
    address: string;
    total_quantity: number;
    total_price: string;
    discount: string;
    ship_price: string;
    method_payment: string;
    createdAt: string;
    updatedAt: string;
    item: OrderItem[];
    __entity: string;
    rating?: number | null;
}

// Add Rating interface to match the API structure
interface Rating {
    id?: number;
    product_id: number | null;
    order_id: number;
    user_id: number;
    comment: string;
    rating: number;
    avg_rating?: number;
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
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Create a wrapper component that will be the default export
export default function OrderRatingPage() {
    return (
        <Suspense fallback={<LoadingUI />}>
            <OrderRatingContent />
        </Suspense>
    );
}

// Loading UI component extracted for reuse
function LoadingUI() {
    return (
        <div className="bg-[#F1EEE9] min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
            <Footer />
        </div>
    );
}

// Add a helper function to process product images in different formats
const processProductImages = (images: Array<{ id: string; path: string; public_id: string }> | { id: string; path: string; public_id: string } | null | undefined) => {
    if (!images) return [];

    // If images is an array
    if (Array.isArray(images)) {
        return images;
    }

    // If images is a single object
    if (typeof images === 'object' && images.path) {
        return [images];
    }

    return [];
};

// Main component content moved here
function OrderRatingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [ratings, setRatings] = useState<Record<number, number>>({});
    const [reviews, setReviews] = useState<Record<number, string>>({});
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });
    const [userId, setUserId] = useState<number | null>(null);
    const [fetchedProducts, setFetchedProducts] = useState<Record<string, boolean>>({});
    const [userRatedProducts, setUserRatedProducts] = useState<Record<number, boolean>>({});

    // Toast message function
    const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    // Fetch completed orders for the user
    const fetchProductDetails = useCallback(async (order: Order) => {
        try {
            const token = AuthService.getToken();
            if (!token) return;

            let hasUpdates = false;
            const updatedOrderItems = [...order.item];

            for (const item of updatedOrderItems) {
                console.log(`Processing item with product_id: ${item.product_id}, product_detail_id: ${item.product_detail_id}`);

                // First try to fetch product directly using product_id
                if (item.product_id && !fetchedProducts[item.product_id]) {
                    try {
                        console.log(`Fetching product with ID: ${item.product_id}`);
                        const productResponse = await fetch(
                            `http://68.183.226.198:3000/api/products/${item.product_id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            console.log(`Product data fetched:`, productData);

                            // Set the product information, handle both array and object formats for images
                            item.product = {
                                id: productData.id,
                                name: productData.name || "Sản phẩm không tên",
                                images: processProductImages(productData.images),
                            };

                            // Mark product as fetched
                            setFetchedProducts((prev) => ({
                                ...prev,
                                [item.product_id!]: true,
                            }));

                            hasUpdates = true;
                        } else {
                            console.error(`Error fetching product ${item.product_id}, status: ${productResponse.status}`);
                        }
                    } catch (productError) {
                        console.error(`Failed to fetch product for product_id ${item.product_id}:`, productError);
                    }
                }
            }

            // Update order with fetched data if any updates were made
            if (hasUpdates) {
                const updatedOrder = { ...order, item: updatedOrderItems };
                setSelectedOrder(updatedOrder);

                // Initialize ratings and reviews after fetching product details
                const initialRatings: Record<number, number> = {};
                const initialReviews: Record<number, string> = {};

                updatedOrderItems.forEach(item => {
                    const key = item.product?.id || item.id;
                    initialRatings[key] = 5;
                    initialReviews[key] = '';
                });

                setRatings(initialRatings);
                setReviews(initialReviews);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    }, [fetchedProducts]);

    const fetchOrderDetails = useCallback(async (id: number) => {
        try {
            setLoading(true);
            const token = AuthService.getToken();
            if (!token) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                router.push('/user/signin');
                return;
            }

            const response = await fetch(
                `http://68.183.226.198:3000/api/orders/${id}?id=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Không thể tải thông tin đơn hàng');
            }

            const orderData: Order = await response.json();
            setSelectedOrder(orderData);

            // Fetch product details for all items
            await fetchProductDetails(orderData);

            // Extract product IDs to fetch ratings
            const productIds = orderData.item
                .filter(item => item.product?.id)
                .map(item => item.product!.id);

            // Fetch existing ratings for these products
            if (productIds.length > 0) {
                await fetchExistingRatings(productIds);
            } else {
                // Initialize with default values if no productIds
                const initialRatings: Record<number, number> = {};
                const initialReviews: Record<number, string> = {};

                orderData.item.forEach(item => {
                    // Use item ID as key for now if no product ID
                    const key = item.product?.id || item.id;
                    initialRatings[key] = 5;
                    initialReviews[key] = '';
                });

                setRatings(initialRatings);
                setReviews(initialReviews);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            showToastMessage('Không thể tải thông tin đơn hàng', 'error');
        } finally {
            setLoading(false);
        }
    }, [router, showToastMessage, fetchProductDetails]);

    const fetchCompletedOrders = useCallback(async () => {
        try {
            const userIdStr = localStorage.getItem('userId');
            if (!userIdStr) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                router.push('/user/signin');
                return;
            }

            const uid = parseInt(userIdStr);
            setUserId(uid);

            const token = AuthService.getToken();
            if (!token) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                router.push('/user/signin');
                return;
            }

            const encodedStatus = encodeURIComponent('Hoàn thành');

            // Use uid directly instead of userId from state
            const response = await fetch(
                `http://68.183.226.198:3000/api/orders/status?status=${encodedStatus}&user_id=${uid}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Không thể tải danh sách đơn hàng đã hoàn thành');
            }

            const data: Order[] = await response.json();
            setCompletedOrders(Array.isArray(data) ? data : [data]); // Handle both array or single object response

            // If orderId is provided in URL, fetch the specific order
            if (orderId) {
                fetchOrderDetails(parseInt(orderId));
            }
        } catch (error) {
            console.error('Error fetching completed orders:', error);
            showToastMessage('Không thể tải danh sách đơn hàng đã hoàn thành', 'error');
        } finally {
            setLoading(false);
        }
    }, [router, showToastMessage, orderId, fetchOrderDetails]);

    // Fetch existing ratings for an order
    // Removed duplicate declaration of getCurrentUser

    const fetchExistingRatings = useCallback(async (productIds: number[]) => {
        try {
            const token = AuthService.getToken();
            const userData = await getCurrentUser();

            if (!token || !userData || !userData.id) return;

            const uid = userData.id;

            // First check user's own ratings
            const userRatingsResponse = await fetch(
                `http://68.183.226.198:3000/api/rating/user/${uid}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (userRatingsResponse.ok) {
                const userRatings = await userRatingsResponse.json();
                console.log("User's existing ratings:", userRatings);

                // Track which products the user has already rated
                const ratedProducts: Record<number, boolean> = {};
                userRatings.forEach((rating: { product_id?: number }) => {
                    if (rating.product_id) {
                        ratedProducts[rating.product_id] = true;
                    }
                });
                setUserRatedProducts(ratedProducts);
            }

            // Then get all ratings for the products
            const response = await fetch(`http://68.183.226.198:3000/api/rating/get-by-product`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productIds.map(id => ({ product_id: id })))
            });

            if (!response.ok) {
                throw new Error('Failed to fetch ratings');
            }

            const ratingsData: Rating[] = await response.json();

            // Initialize ratings state with existing ratings
            const initialRatings: Record<number, number> = {};
            const initialReviews: Record<number, string> = {};

            ratingsData.forEach(rating => {
                if (rating.product_id) {
                    // Only use ratings from other users for display,
                    // user's own ratings are already in userRatedProducts
                    if (!userRatedProducts[rating.product_id]) {
                        initialRatings[rating.product_id] = rating.rating || 5;
                        initialReviews[rating.product_id] = rating.comment || '';
                    }
                }
            });

            setRatings(initialRatings);
            setReviews(initialReviews);

        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    }, [userId]);

    // Add this function after other fetch functions
    const getCurrentUser = useCallback(async () => {
        try {
            const token = AuthService.getToken();
            if (!token) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                router.push('/user/signin');
                return null;
            }

            const response = await fetch('http://68.183.226.198:3000/api/v1/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể lấy thông tin người dùng');
            }

            const userData = await response.json();
            console.log('User data from API:', userData);

            // Validate user ID
            if (!userData || !userData.id) {
                console.error('Invalid user data structure:', userData);
                return null;
            }

            console.log('Setting user ID to:', userData.id);
            setUserId(userData.id);
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }, [router, showToastMessage]);

    // Update useEffect
    useEffect(() => {
        // Get current user first, then fetch orders
        getCurrentUser().then(() => {
            fetchCompletedOrders();
        });
    }, [getCurrentUser, fetchCompletedOrders]);

    // Handle star rating change
    const handleRatingChange = (itemId: number, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [itemId]: rating
        }));
    };

    // Handle review text change
    const handleReviewChange = (itemId: number, text: string) => {
        setReviews(prev => ({
            ...prev,
            [itemId]: text
        }));
    };

    // Update submitRating function to handle "already rated" errors
    const submitRating = async (orderId: number, itemId: number) => {
        try {
            setSubmitting(true);

            const userData = await getCurrentUser();
            const token = AuthService.getToken();

            if (!token || !userData || !userData.id) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                router.push('/user/signin');
                return;
            }

            const uid = userData.id;
            console.log("Authenticated User ID:", uid);

            const item = selectedOrder?.item.find(i => i.id === itemId);
            if (!item || !item.product?.id) {
                showToastMessage('Không tìm thấy thông tin sản phẩm', 'error');
                return;
            }

            const productId = item.product.id;
            const rating = ratings[productId] || 5;
            const comment = reviews[productId] || '';

            // Log what we're sending
            const ratingData = {
                product_id: productId,
                order_id: orderId,
                user_id: uid,
                comment: comment,
                rating: rating
            };

            console.log('Submitting rating data:', ratingData);

            // Try different format options to see which one works:

            // Option 1: Send as a single object (not in an array)
            const response = await fetch(
                `http://68.183.226.198:3000/api/rating/upsert`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ratingData),  // Send as a single object
                }
            );

            // If that fails, try with the array format
            if (!response.ok) {
                console.log('Single object format failed, trying array format...');

                const arrayResponse = await fetch(
                    `http://68.183.226.198:3000/api/rating/upsert`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify([ratingData]),  // Send as array with one object
                    }
                );

                if (!arrayResponse.ok) {
                    const errorText = await arrayResponse.text();
                    console.error('Rating submission error:', errorText);
                    throw new Error('Không thể gửi đánh giá');
                } else {
                    console.log('Array format succeeded');
                    const successResponse = await arrayResponse.text();
                    console.log('Success response:', successResponse);
                }
            } else {
                console.log('Single object format succeeded');
                const successResponse = await response.text();
                console.log('Success response:', successResponse);
            }

            // Update UI to show rating was submitted
            setUserRatedProducts(prev => ({
                ...prev,
                [productId]: true
            }));

            showToastMessage('Đánh giá của bạn đã được gửi thành công', 'success');

            // Update UI
            if (selectedOrder) {
                const updatedItems = selectedOrder.item.map(i =>
                    i.id === itemId
                        ? { ...i, rating: rating, review: comment }
                        : i
                );

                setSelectedOrder({
                    ...selectedOrder,
                    item: updatedItems
                });
            }

            // Redirect after success with a delay to show the success message
            setTimeout(() => {
                router.push('/user/order');
            }, 2000);

        } catch (error) {
            console.error('Error submitting rating:', error);
            showToastMessage('Không thể gửi đánh giá', 'error');
        } finally {
            setSubmitting(false);
        }
    };



    // Star rating component
    const StarRating = ({
        itemId,
        productId,
        value,
        onChange
    }: {
        itemId: number,
        productId?: number,
        value: number,
        onChange: (id: number, rating: number) => void
    }) => {
        // Use productId as the key if available, otherwise use itemId
        const id = productId || itemId;

        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none"
                        onClick={() => onChange(id, star)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-8 w-8 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    // Show order selection UI if no order is selected
    if (!loading && !selectedOrder && completedOrders.length > 0) {
        return (
            <div className="bg-[#F1EEE9] min-h-screen">
                <Header />

                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        show={toast.show}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    />
                </div>

                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-medium mb-6">Đánh giá sản phẩm</h1>
                    <p className="text-gray-600 mb-6">Chọn một đơn hàng để đánh giá:</p>

                    <div className="space-y-4">
                        {completedOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => fetchOrderDetails(order.id)}>
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Mã đơn hàng: <span className="font-medium text-gray-800">{order.order_code}</span>
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Ngày đặt: <span className="font-medium text-gray-800">{formatDate(order.createdAt)}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm">Tổng: <span className="font-medium text-orange-600">{formatPrice(order.total_price)}</span></p>
                                        <p className="text-sm text-gray-500">{order.total_quantity} sản phẩm</p>
                                    </div>
                                    <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                                        {order.rating ? 'Xem đánh giá' : 'Đánh giá'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    // Loading state
    if (loading) {
        return <LoadingUI />;
    }

    // No completed orders
    if (!loading && completedOrders.length === 0) {
        return (
            <div className="bg-[#F1EEE9] min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-2xl font-medium mb-6">Đánh giá sản phẩm</h1>
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-medium mb-2">Bạn chưa có đơn hàng đã hoàn thành</h3>
                            <p className="text-gray-500 mb-6">
                                Hãy mua sắm và hoàn thành đơn hàng để có thể đánh giá sản phẩm
                            </p>
                            <Link
                                href="/user/order"
                                className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700"
                            >
                                Quay lại đơn hàng
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Rating UI for selected order
    return (
        <div className="bg-[#F1EEE9] min-h-screen">
            <Header />

            <div className="fixed top-4 right-4 z-50">
                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.push('/user/order')}
                        className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-medium">Đánh giá sản phẩm</h1>
                </div>

                {selectedOrder && (
                    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Mã đơn hàng: <span className="font-medium text-gray-800">{selectedOrder.order_code}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Ngày đặt: <span className="font-medium text-gray-800">{formatDate(selectedOrder.createdAt)}</span>
                                    </p>
                                </div>
                                <div>
                                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h2 className="text-lg font-medium mb-4">Sản phẩm cần đánh giá</h2>
                            <div className="space-y-6">
                                {selectedOrder.item.map((item) => {
                                    const productId = item.product?.id;
                                    const ratingKey = productId || item.id;

                                    return (
                                        <div key={item.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                            <div className="flex items-start">
                                                <div className="relative w-20 h-20 bg-gray-100 rounded">
                                                    <Image
                                                        src={
                                                            item.product?.images?.[0]?.path ||
                                                            '/images/default-product.png'
                                                        }
                                                        alt={item.product?.name || `Sản phẩm #${item.product_detail_id}`}
                                                        fill
                                                        sizes="80px"
                                                        style={{ objectFit: 'contain' }}
                                                        className="p-2"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="font-medium">
                                                        {item.product?.name || `Sản phẩm #${item.product_detail_id}`}
                                                    </h3>
                                                    {(item.productDetailData || item.product_detail) && (
                                                        <p className="text-sm text-gray-500">
                                                            {item.productDetailData?.size || item.product_detail?.size}{' '}
                                                            - {item.productDetailData?.values || item.product_detail?.values}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Số lượng: {item.quantity} | Đơn giá: {formatPrice(item.unit_price)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Đánh giá sao
                                                </label>
                                                <StarRating
                                                    itemId={item.id}
                                                    productId={productId}
                                                    value={ratings[ratingKey] || 5}
                                                    onChange={handleRatingChange}
                                                />
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nhận xét của bạn
                                                </label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    rows={3}
                                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                                    value={reviews[ratingKey] || ''}
                                                    onChange={(e) => handleReviewChange(ratingKey, e.target.value)}
                                                />
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                                                    onClick={() => submitRating(selectedOrder.id, item.id)}
                                                    disabled={submitting || (productId && userRatedProducts[productId]) || item.rating !== undefined}

                                                >
                                                    {(productId && userRatedProducts[productId]) || item.rating !== undefined
                                                        ? 'Đã đánh giá'
                                                        : 'Gửi đánh giá'
                                                    }
                                                </button>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-between items-center">
                            <Link
                                href="/user/order"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Quay lại
                            </Link>

                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div >
    );
}