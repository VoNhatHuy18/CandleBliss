'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
    CheckCircleIcon as ExclamationCircleIcon,
    ArrowLeftIcon,
    PrinterIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon as X
} from '@heroicons/react/24/outline';
import Toast from '@/app/components/ui/toast/Toast';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { HOST } from '@/app/constants/api';

// Interfaces
interface OrderItem {
    id: number;
    status: string;
    unit_price: string;
    product_detail_id: number;
    product_id: string;
    quantity: number;
    totalPrice: string;
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
    __entity: string;
}

// Thêm vào interface Order để hỗ trợ thông tin khách hàng
interface Order {
    id: number;
    order_code: string;
    user_id: number;
    cancelReason: string | null;
    status: string;
    address: string;
    total_quantity: number;
    total_price: string;
    discount: string;
    ship_price: string;
    voucher_id: string;
    method_payment: string;
    cancel_images: string[] | null;
    createdAt: string;
    updatedAt: string;
    item: OrderItem[];
    __entity: string;
    // Thêm thông tin khách hàng
    customer_name?: string;
    customer_phone?: string;
}

// Order status colors
const orderStatusColors: Record<string, { bg: string; text: string; border: string }> = {
    'Đơn hàng vừa được tạo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Đang chờ thanh toán': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Thanh toán thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Thanh toán thành công': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Đang xử lý': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Đã đặt hàng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Đang giao hàng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Đã huỷ': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Đổi trả hàng': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Đã chấp nhận đổi trả': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Đã hoàn thành đổi trả và hoàn tiền': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Đã từ chối đổi trả': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Trả hàng hoàn tiền': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Đang chờ hoàn tiền': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Hoàn tiền thành công': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Hoàn tiền thất bại': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

// Helper functions
const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(numPrice);
};

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

// First, add this new helper function after the existing formatDate function
const processOrderStatusHistory = (order: Order) => {
    // Create a default timeline based on order status
    return generateDefaultStatusTimeline(order);
};

// Add this function to generate default status timeline
const generateDefaultStatusTimeline = (order: Order) => {
    // Define possible status flows
    const orderStatusFlows = {
        // COD flow
        cod: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Hoàn thành'
        ],
        // Online payment successful flow
        onlinePaymentSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang chờ thanh toán',
            'Thanh toán thành công',
            'Đang giao hàng',
            'Hoàn thành'
        ],
        // Online payment failed flow
        onlinePaymentFailed: [
            'Đơn hàng vừa được tạo',
            'Đang chờ thanh toán',
            'Thanh toán thất bại',
            'Đã hủy'
        ],
        // Return success flow
        returnSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Đổi trả hàng',
            'Xác nhận đổi trả',
            'Đang giao hàng',
            'Đổi trả thành công'
        ],
        // Return fail flow
        returnFail: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Đổi trả hàng',
            'Từ chối đổi trả',
            'Đổi trả thất bại'
        ],
        // Refund success flow
        refundSuccess: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Trả hàng hoàn tiền',
            'Đang chờ hoàn tiền',
            'Hoàn tiền thành công'
        ],
        // Refund fail flow
        refundFail: [
            'Đơn hàng vừa được tạo',
            'Đang xử lý',
            'Đang giao hàng',
            'Đã giao hàng',
            'Trả hàng hoàn tiền',
            'Đang chờ hoàn tiền',
            'Hoàn tiền thất bại'
        ],
    };

    // Select appropriate flow based on current status
    let orderStatusFlow = orderStatusFlows.cod; // Default to COD flow

    // Check for special statuses to determine the flow
    if (order.status === 'Đã hủy') {
        // Special case for canceled orders
        return [
            {
                status: 'Đơn hàng vừa được tạo',
                updatedAt: order.createdAt
            },
            {
                status: 'Đã hủy',
                updatedAt: order.updatedAt
            }
        ];
    }

    // Determine flow based on current status
    if (['Đang chờ thanh toán', 'Thanh toán thành công'].includes(order.status)) {
        orderStatusFlow = orderStatusFlows.onlinePaymentSuccess;
    }
    else if (order.status === 'Thanh toán thất bại') {
        orderStatusFlow = orderStatusFlows.onlinePaymentFailed;
    }
    else if (['Đổi trả hàng', 'Xác nhận đổi trả', 'Đổi trả thành công'].includes(order.status)) {
        orderStatusFlow = orderStatusFlows.returnSuccess;
    }
    else if (['Từ chối đổi trả', 'Đổi trả thất bại'].includes(order.status)) {
        orderStatusFlow = orderStatusFlows.returnFail;
    }
    else if (['Trả hàng hoàn tiền', 'Đang chờ hoàn tiền', 'Hoàn tiền thành công'].includes(order.status)) {
        orderStatusFlow = orderStatusFlows.refundSuccess;
    }
    else if (order.status === 'Hoàn tiền thất bại') {
        orderStatusFlow = orderStatusFlows.refundFail;
    }

    // Find current status position in flow
    const currentStatusIndex = orderStatusFlow.indexOf(order.status);

    if (currentStatusIndex === -1) {
        // Case: status not in flow
        return [
            {
                status: 'Đơn hàng vừa được tạo',
                updatedAt: order.createdAt
            },
            {
                status: order.status,
                updatedAt: order.updatedAt
            }
        ];
    }

    // Calculate time between created and updated date
    const createTime = new Date(order.createdAt).getTime();
    const updateTime = new Date(order.updatedAt).getTime();

    // Create timeline from creation to current status
    const timeline = [];

    // Calculate average time between statuses
    const timePerStatus = (updateTime - createTime) / (currentStatusIndex || 1);

    // Add all statuses up to current status
    for (let i = 0; i <= currentStatusIndex; i++) {
        timeline.push({
            status: orderStatusFlow[i],
            updatedAt: i === 0
                ? order.createdAt
                : i === currentStatusIndex
                    ? order.updatedAt
                    : new Date(createTime + timePerStatus * i).toISOString()
        });
    }

    return timeline;
};

// Add this right below the existing nextPossibleStatuses object (outside of the component)
const nextPossibleStatuses: Record<string, string[]> = {
    'Đơn hàng vừa được tạo': ['Đang chờ thanh toán', 'Đã huỷ'],
    'Đang chờ thanh toán': ['Thanh toán thành công', 'Thanh toán thất bại', 'Đang xử lý', 'Đã huỷ'],
    'Thanh toán thành công': ['Đang xử lý', 'Đã huỷ'],
    'Thanh toán thất bại': [],
    'Đang xử lý': ['Đang giao hàng', 'Đã huỷ'],
    'Đang giao hàng': ['Hoàn thành', 'Đổi trả hàng'],
    'Đã đặt hàng': ['Đang xử lý', 'Đã huỷ'],
    'Đổi trả hàng': ['Đã chấp nhận đổi trả', 'Đã từ chối đổi trả'],
    'Đã chấp nhận đổi trả': ['Đã hoàn thành đổi trả và hoàn tiền'],
    'Đang chờ hoàn tiền': ['Hoàn tiền thành công', 'Hoàn tiền thất bại'],
    'Hoàn tiền thành công': ['Đã hoàn thành đổi trả và hoàn tiền'],
    'Hoàn tiền thất bại': ['Đổi trả hàng'],
    'Đã huỷ': [], // Không thể chuyển tiếp
    'Hoàn thành': [], // Không thể chuyển tiếp
    'Đã từ chối đổi trả': [], // Không thể chuyển tiếp
};

// Main component
export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchedProducts, setFetchedProducts] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });
    const [customerInfoFetched, setCustomerInfoFetched] = useState(false);

    // Add near the beginning of your OrderDetailPage component
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    // Add this inside your OrderDetailPage component

    // Update the list of valid statuses to match exactly what the API expects
    const validOrderStatuses = [
        'Đơn hàng vừa được tạo',
        'Đang chờ thanh toán',
        'Thanh toán thất bại',
        'Thanh toán thành công',
        'Đang chờ hoàn tiền',
        'Hoàn tiền thành công',
        'Hoàn tiền thất bại',
        'Đang xử lý',
        'Đang giao hàng',
        'Đã đặt hàng',
        'Hoàn thành',
        'Đã huỷ',
        'Đổi trả hàng'
    ];

    // Handle status update
    const handleUpdateOrderStatus = async () => {
        if (!order || !newStatus) return;

        // Validate the status to ensure it's in the allowed list
        if (!validOrderStatuses.includes(newStatus)) {
            showToastMessage(`Trạng thái "${newStatus}" không hợp lệ`, 'error');
            return;
        }

        try {
            setUpdating(true);
            const token = localStorage.getItem('token');

            if (!token) {
                showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                return;
            }

            // Use query parameter for status instead of JSON body
            const encodedStatus = encodeURIComponent(newStatus);
            const response = await fetch(
                `${HOST}/api/orders/${order.id}/status?status=${encodedStatus}`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            // Handle specific error codes
            if (response.status === 422) {
                const errorData = await response.json();
                showToastMessage(errorData.errors?.status || 'Trạng thái không hợp lệ', 'error');
                return;
            }

            if (!response.ok) {
                throw new Error('Không thể cập nhật trạng thái đơn hàng');
            }

            // Update order state with new status
            setOrder(prevOrder => {
                if (!prevOrder) return null;
                return {
                    ...prevOrder,
                    status: newStatus,
                    updatedAt: new Date().toISOString() // Update the timestamp
                };
            });

            showToastMessage('Cập nhật trạng thái đơn hàng thành công', 'success');
            setShowUpdateStatusModal(false);
            setNewStatus('');
        } catch (error) {
            console.error('Error updating order status:', error);
            showToastMessage('Không thể cập nhật trạng thái đơn hàng', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Toast message helper
    const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    // Fetch order data
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                    router.push('/seller/login');
                    return;
                }

                // Updated API URL format
                const response = await fetch(
                    `${HOST}/api/orders/{id}?id=${params.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Không thể tải thông tin đơn hàng');
                }

                const data = await response.json();
                setOrder(data);

                // Fetch product details for each item
                if (data.item && data.item.length > 0) {
                    fetchProductData(data);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                showToastMessage('Không thể tải thông tin đơn hàng', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchOrderDetails();
        }
    }, [params.id, router]);

    // Fetch product data for order items
    const fetchProductData = async (orderData: Order) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        let hasUpdates = false;
        const updatedOrder = { ...orderData };

        for (const item of updatedOrder.item) {
            if (item.product_id && !fetchedProducts[item.product_id]) {
                try {
                    const productResponse = await fetch(
                        `${HOST}/api/products/${item.product_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (productResponse.ok) {
                        const productData = await productResponse.json();

                        // Set product information
                        item.product = {
                            id: productData.id,
                            name: productData.name || "Sản phẩm không tên",
                            images: productData.images || []
                        };

                        // Find matching product detail
                        const matchingDetail = productData.details?.find(
                            (detail: { id: number; size: string; type: string; values: string; images: Array<{ id: string; path: string; public_id: string }> }) => detail.id === item.product_detail_id
                        );

                        if (matchingDetail) {
                            item.product_detail = {
                                id: matchingDetail.id,
                                size: matchingDetail.size,
                                type: matchingDetail.type,
                                values: matchingDetail.values,
                                images: matchingDetail.images || []
                            };
                        }

                        // Mark product as fetched
                        setFetchedProducts((prev) => ({
                            ...prev,
                            [item.product_id]: true,
                        }));

                        hasUpdates = true;
                    }
                } catch (productError) {
                    console.error(`Failed to fetch product for product_id ${item.product_id}:`, productError);
                }
            }
        }

        if (hasUpdates) {
            setOrder(updatedOrder);
        }
    };

    // Thêm useEffect để fetch thông tin khách hàng
    useEffect(() => {
        if (order?.user_id && !customerInfoFetched) {
            fetchCustomerInfo(order.user_id);
        }
    }, [order?.user_id, customerInfoFetched]);

    // Sửa hàm fetch thông tin khách hàng
    const fetchCustomerInfo = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${HOST}/api/v1/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log("Customer data fetched:", userData); // Debug log

                // Cập nhật thông tin khách hàng vào order với hàm cập nhật state đảm bảo
                setOrder(prevOrder => {
                    if (!prevOrder) return null;
                    return {
                        ...prevOrder,
                        customer_name: userData.firstName && userData.lastName
                            ? `${userData.firstName} ${userData.lastName}`
                            : userData.firstName || userData.lastName || userData.username || 'Không có thông tin',
                        customer_phone: userData.phone ? userData.phone.toString() : 'Không có thông tin'
                    };
                });
                setCustomerInfoFetched(true);  // Mark as fetched
            }
        } catch (error) {
            console.error('Error fetching customer info:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - thêm fixed để cố định khi cuộn */}
            <div className="print:hidden fixed h-full z-40">
                <MenuSideBar />
            </div>

            {/* Thêm div chiếm chỗ có kích thước giống MenuSidebar để layout không bị lệch */}
            <div className="print:hidden">
                <div className="invisible">
                    <MenuSideBar />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header - thêm fixed và print:hidden */}
                <div className="sticky top-0 z-30 print:hidden">
                    <Header />
                </div>

                {/* Phần còn lại giữ nguyên */}
                <div className="flex-1 px-6 py-4 overflow-auto">
                    {/* Toast notification */}
                    <div className="fixed top-20 right-4 z-50 print:hidden">
                        <Toast
                            show={toast.show}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                        />
                    </div>

                    {/* Loading state */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : !order ? (
                        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-xl font-semibold text-red-600">Không tìm thấy đơn hàng</h1>
                            <p className="mt-2">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.</p>
                            <button
                                onClick={() => router.back()}
                                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Quay lại
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto">
                            {/* Header with back button - ẩn khi in */}
                            <div className="flex items-center mb-6 print:hidden">
                                <button
                                    onClick={() => router.back()}
                                    className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <ArrowLeftIcon className="h-5 w-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-semibold">Chi tiết đơn hàng</h1>
                                    <p className="text-sm text-gray-500">Mã đơn: #{order.order_code}</p>
                                </div>
                            </div>

                            {/* Thêm tiêu đề khi in */}
                            <div className="hidden print:block mb-6 text-center">
                                <h1 className="text-2xl font-bold">HÓA ĐƠN BÁN HÀNG</h1>
                                <p className="text-sm text-gray-700 mt-1">Mã đơn: #{order.order_code} - Ngày: {formatDate(order.createdAt)}</p>
                            </div>

                            {/* Order summary card */}
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 print:shadow-none print:border-0">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h2 className="text-lg font-medium mb-2">Thông tin đơn hàng</h2>
                                        <p className="text-gray-600 mb-1">Mã đơn hàng: <span className="font-medium text-gray-900">{order.order_code}</span></p>
                                        <p className="text-gray-600 mb-1">Ngày đặt: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
                                        <p className="text-gray-600">Cập nhật lần cuối: <span className="font-medium text-gray-900">{formatDate(order.updatedAt)}</span></p>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center mb-4">
                                            {order.method_payment && (
                                                <div className="flex items-center mr-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                                    <Image
                                                        src={
                                                            order.method_payment === 'COD'
                                                                ? '/images/logo.png'
                                                                : order.method_payment === 'BANKING'
                                                                    ? '/images/bank.png'
                                                                    : '/images/momo-logo.png'
                                                        }
                                                        alt={order.method_payment}
                                                        width={18}
                                                        height={18}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        {order.method_payment === 'COD'
                                                            ? 'Thanh toán khi nhận hàng'
                                                            : order.method_payment === 'BANKING'
                                                                ? 'Chuyển khoản ngân hàng'
                                                                : 'Ví MoMo'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`px-4 py-1.5 rounded-full ${orderStatusColors[order.status]?.bg || 'bg-gray-100'} ${orderStatusColors[order.status]?.text || 'text-gray-700'} ${orderStatusColors[order.status]?.border || 'border-gray-200'} border font-medium print:hidden`}>
                                                {order.status}
                                            </div>
                                        </div>


                                    </div>
                                </div>

                                {/* Customer information - Thêm thông tin khách hàng */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h2 className="text-lg font-medium mb-3">Thông tin khách hàng</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <p className="text-gray-700">ID Khách hàng: <span className="font-medium">{order.user_id}</span></p>
                                        {order.customer_name && (
                                            <p className="text-gray-700">Tên khách hàng: <span className="font-medium">{order.customer_name}</span></p>
                                        )}
                                        {order.customer_phone && (
                                            <p className="text-gray-700">Số điện thoại:
                                                <span className="font-medium print:hidden">
                                                    {order.customer_phone}
                                                </span>
                                                <span className="font-medium hidden print:inline">
                                                    {order.customer_phone.slice(0, -3) + '***'}
                                                </span>
                                            </p>
                                        )}
                                        <p className="text-gray-700 md:col-span-2">Địa chỉ giao hàng:
                                            <span className="font-medium print:hidden">
                                                {order.address}
                                            </span>
                                            <span className="font-medium hidden print:inline">
                                                {"*** " + order.address.split(', ').slice(-2).join(', ')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order timeline - ẩn khi in */}
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 print:hidden">
                                <h2 className="text-lg font-medium mb-6">Tiến trình đơn hàng</h2>

                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>

                                    {/* Timeline Steps */}
                                    {processOrderStatusHistory(order).map((statusUpdate, index) => {
                                        const statusColor = orderStatusColors[statusUpdate.status] || {
                                            bg: 'bg-gray-50',
                                            text: 'text-gray-700',
                                            border: 'border-gray-200'
                                        };

                                        const isCancelled = statusUpdate.status === 'Đã hủy';
                                        const isCompleted = statusUpdate.status === 'Hoàn thành';
                                        const isPaymentFailed = statusUpdate.status === 'Thanh toán thất bại';
                                        const isRefundFailed = statusUpdate.status === 'Hoàn tiền thất bại';

                                        // Determine appropriate icon
                                        let StatusIcon = CheckCircleIcon;
                                        if (isCancelled || isPaymentFailed || isRefundFailed) {
                                            StatusIcon = ExclamationCircleIcon;
                                        }

                                        return (
                                            <div key={index} className="relative flex items-start mb-8">
                                                <div className={`flex items-center justify-center w-6 h-6 rounded-full z-10 
                                                    ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                                                    <StatusIcon className="h-4 w-4" />
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className={`font-medium ${isCancelled || isPaymentFailed || isRefundFailed
                                                        ? 'text-red-600'
                                                        : isCompleted
                                                            ? 'text-green-600'
                                                            : ''
                                                        }`}>
                                                        {statusUpdate.status}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(statusUpdate.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Cancellation reason if available */}
                                {order.cancelReason && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start">
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-red-700">Lý do hủy/đổi trả:</p>
                                                <p className="text-red-600 mt-1">{order.cancelReason}</p>

                                                {/* Display cancellation/return images if available */}
                                                {order.cancel_images && order.cancel_images.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-red-700 mb-2">Hình ảnh đính kèm:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {order.cancel_images.map((image, index) => (
                                                                <div key={index} className="relative w-20 h-20 border border-red-200 rounded-md overflow-hidden">
                                                                    <Image
                                                                        src={image}
                                                                        alt={`Hình ảnh hủy/đổi trả ${index + 1}`}
                                                                        fill
                                                                        style={{ objectFit: 'cover' }}
                                                                        className="rounded-md"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order items */}
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 print:shadow-none print:border-0 print:p-0">
                                <h2 className="text-lg font-medium mb-6">Sản phẩm trong đơn hàng</h2>

                                <div className="space-y-5">
                                    {order.item.map((item) => (
                                        <div key={item.id} className="flex border-b border-gray-100 pb-5">
                                            {/* Product image with better container */}
                                            <div className="relative w-24 h-24 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src={item.product?.images?.[0]?.path || '/images/default-product.png'}
                                                    alt={item.product?.name || `Sản phẩm #${item.product_detail_id}`}
                                                    fill
                                                    sizes="96px"
                                                    style={{ objectFit: 'contain' }}
                                                    className="p-2"
                                                />
                                            </div>

                                            {/* Product details */}
                                            <div className="ml-4 flex-1">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {item.product?.name || `Sản phẩm #${item.product_detail_id}`}
                                                        </p>
                                                        {item.product_detail && (
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-sm px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                                    {item.product_detail.size}
                                                                </span>
                                                                <span className="text-sm px-2 py-0.5 bg-gray-50 rounded-md border border-gray-100">
                                                                    {item.product_detail.values}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-orange-600 font-medium">
                                                        {formatPrice(item.totalPrice)}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between mt-3">
                                                    <span className="text-sm text-gray-500">
                                                        Đơn giá: {formatPrice(item.unit_price)}
                                                    </span>
                                                    <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-md">
                                                        Số lượng: x{item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order totals */}
                                <div className="mt-6 border-t border-gray-200 pt-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tổng số sản phẩm:</span>
                                        <span>{order.total_quantity}</span>
                                    </div>

                                    {parseFloat(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm mt-3">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="text-green-600">-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm mt-3">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span>{formatPrice(order.ship_price)}</span>
                                    </div>

                                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                                        <span className="text-lg font-medium">Tổng thanh toán:</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-orange-600">
                                                {formatPrice(order.total_price)}
                                            </span>


                                        </div>
                                    </div>

                                    {/* Thêm phần chữ ký khi in */}
                                    <div className="hidden print:block mt-16">
                                        <div className="flex justify-between">
                                            <div className="text-center w-1/3">
                                                <p className="font-medium">Người lập phiếu</p>
                                                <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                                            </div>
                                            <div className="text-center w-1/3">
                                                <p className="font-medium">Người mua hàng</p>
                                                <p className="text-sm text-gray-600">(Ký, ghi rõ họ tên)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons - ẩn khi in */}
                            <div className="flex justify-end gap-3 mb-8 print:hidden">
                                <button
                                    onClick={() => router.back()}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Quay lại
                                </button>
                                {/* Update status button - only show if order is not in final state */}
                                {order.status !== 'Hoàn thành' && order.status !== 'Đã huỷ' && (
                                    <button
                                        onClick={() => setShowUpdateStatusModal(true)}
                                        className="flex items-center bg-[#442C08] text-white px-3 py-1.5 rounded-md hover:bg-opacity-90 print:hidden"
                                    >
                                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                        Cập nhật trạng thái
                                    </button>
                                )}
                                {/* Print order button - only show if status is "Đang xử lý" */}
                                {order.status === 'Đang xử lý' && (
                                    <button
                                        onClick={() => window.print()}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center"
                                    >
                                        <PrinterIcon className="h-4 w-4 mr-1" /> In đơn hàng
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Status update modal */}
            {showUpdateStatusModal && order && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-white rounded-lg p-5 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-medium">Cập nhật trạng thái đơn hàng</h2>
                            <button
                                onClick={() => setShowUpdateStatusModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">Mã đơn hàng:</p>
                                    <p className="text-sm font-medium">{order.order_code}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-600">Ngày đặt:</p>
                                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-600">Trạng thái hiện tại:</p>
                                    <p
                                        className={`text-sm ${orderStatusColors[order.status]?.text || 'text-gray-700'
                                            }`}
                                    >
                                        {order.status}
                                    </p>
                                </div>

                                {/* Display cancellation reason if available */}
                                {order.status === 'Đã huỷ' && order.cancelReason && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Lý do huỷ đơn:</p>
                                        <p className="text-sm text-red-600 mt-1">{order.cancelReason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Rest of the modal content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn trạng thái mới:
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#442C08] text-sm"
                                >
                                    <option value="">-- Chọn trạng thái --</option>
                                    {nextPossibleStatuses[order.status]?.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                {/* Trạng thái tiếp theo gợi ý */}
                                <div className="mt-3">
                                    <p className="text-sm text-gray-500">Các trạng thái tiếp theo:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {nextPossibleStatuses[order.status]?.map((status) => (
                                            <button
                                                key={status}
                                                className={`px-3 py-1.5 text-sm rounded-full border
                                      ${newStatus === status
                                                        ? 'bg-[#442C08] text-white border-[#442C08]'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                onClick={() => setNewStatus(status)}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowUpdateStatusModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateOrderStatus}
                                disabled={!newStatus || updating}
                                className={`px-4 py-2 rounded-md text-white flex items-center text-sm ${newStatus && !updating
                                    ? 'bg-[#442C08] hover:bg-opacity-90'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {updating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Đang xử lý
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Xác nhận
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>


    );
}