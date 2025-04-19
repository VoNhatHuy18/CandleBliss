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
    ArchiveBoxIcon,
    CubeIcon,
    TicketIcon,
    ExclamationTriangleIcon,
    ClipboardIcon,
} from '@heroicons/react/24/outline';

interface Image {
    id: string;
    path: string;
    public_id: string;
}

interface ProductDetail {
    id: number;
    size: string;
    type: string;
    values: string;
    quantities: number;
    images: Image[];
    product?: Product; // Replace 'Product' with the correct type if known
    isActive: boolean;
}

interface Price {
    id: number;
    base_price: number;
    discount_price: number;
    end_date?: string | null; // Add end_date here
    product_detail: {
        end_date: string | null | undefined;
        id: number;
        productId: number;
    };
}

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    video: string;
    images: Image[] | Image;
    category_id?: number; // Thêm trường này
    details?: ProductDetail[];
    pricing?: Price[];
    categories?: Category[];
}

interface ProductViewModel extends Product {
    details: ProductDetail[];
    pricing: Price[];
    images: Image[];
    categories: Category[];
}




// Interface để thống kê tồn kho
interface InventorySummary {
    totalProducts: number;
    totalVariants: number;
    activeVariants: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
}

// Format price helper function
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(price);
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
                Tạo sản phẩm đầu tiên để bắt đầu quản lý kho hàng và theo dõi doanh số
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

// Component hiển thị thống kê kho hàng
const WarehouseSummary = ({ summary }: { summary: InventorySummary }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-amber-100 p-2 rounded-full mb-2">
                    <CubeIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.totalProducts}</div>
                <div className="text-sm text-gray-500 text-center">Sản phẩm</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-blue-100 p-2 rounded-full mb-2">
                    <TicketIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.totalVariants}</div>
                <div className="text-sm text-gray-500 text-center">Phiên bản</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-green-100 p-2 rounded-full mb-2">
                    <ArchiveBoxIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.activeVariants}</div>
                <div className="text-sm text-gray-500 text-center">Đang kinh doanh</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-purple-100 p-2 rounded-full mb-2">
                    <ClipboardIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.totalStock}</div>
                <div className="text-sm text-gray-500 text-center">Tổng tồn kho</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-yellow-100 p-2 rounded-full mb-2">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.lowStockItems}</div>
                <div className="text-sm text-gray-500 text-center">Sắp hết hàng (≤10)</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                <div className="bg-red-100 p-2 rounded-full mb-2">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{summary.outOfStockItems}</div>
                <div className="text-sm text-gray-500 text-center">Hết hàng</div>
            </div>
        </div>
    );
};

// Component Modal tạo phiếu nhập kho
const StockReceiptModal = ({
    isOpen,
    onClose,
    onSave,
    products,
    loading,
    preSelectedProductId,
    preSelectedVariantId,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (receiptData: {
        supplier: string;
        notes: string;
        createdAt: string;
        items: Array<{
            product_id: number;
            product_detail_id: number;
            product_name: string;
            variant_info: string;
            quantity: number;
            cost_per_unit: number;
        }>;
        totalItems: number;
        totalCost: number;
    }) => Promise<void>;
    products: ProductViewModel[];
    loading: boolean;
    preSelectedProductId?: number | null;
    preSelectedVariantId?: number | null;
}) => {
    const [supplier, setSupplier] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(preSelectedProductId || null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(preSelectedVariantId || null);
    const [quantity, setQuantity] = useState(1);
    const [costPerUnit, setCostPerUnit] = useState(0);

    const [items, setItems] = useState<Array<{
        product_id: number;
        product_detail_id: number;
        product_name: string;
        variant_info: string;
        quantity: number;
        cost_per_unit: number;
    }>>([]);

    // Lọc sản phẩm đã chọn
    const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

    // Reset form khi đóng modal
    useEffect(() => {
        if (!isOpen) {
            setSupplier('');
            setNotes('');
            setSelectedProductId(null);
            setSelectedVariantId(null);
            setQuantity(1);
            setCostPerUnit(0);
            setItems([]);
        }
    }, [isOpen]);

    // Hàm thêm sản phẩm vào danh sách nhập kho
    const addItem = () => {
        if (!selectedProductId || !selectedVariantId || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        const variant = product.details?.find(d => d.id === selectedVariantId);
        if (!variant) return;

        const variantInfo = `${variant.size || ''} ${variant.type || ''} ${variant.values || ''}`.trim();

        setItems(prev => [...prev, {
            product_id: selectedProductId,
            product_detail_id: selectedVariantId,
            product_name: product.name,
            variant_info: variantInfo || `#${selectedVariantId}`,
            quantity,
            cost_per_unit: costPerUnit
        }]);

        // Reset form for next item
        setSelectedVariantId(null);
        setQuantity(1);
        setCostPerUnit(0);
    };

    // Hàm xóa sản phẩm khỏi danh sách
    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Hàm lưu phiếu nhập kho
    const handleSave = async () => {
        if (items.length === 0) return;

        const receiptData = {
            supplier,
            notes,
            createdAt: new Date().toISOString(),
            items,
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
            totalCost: items.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0)
        };

        await onSave(receiptData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Tạo phiếu nhập kho</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 120px)" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nhà cung cấp
                            </label>
                            <input
                                type="text"
                                value={supplier}
                                onChange={e => setSupplier(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Tên nhà cung cấp"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Ghi chú phiếu nhập"
                            />
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 mb-4">
                        <h4 className="text-sm font-medium mb-3">Thêm sản phẩm vào phiếu nhập</h4>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sản phẩm
                                </label>
                                <select
                                    value={selectedProductId || ''}
                                    onChange={e => {
                                        setSelectedProductId(e.target.value ? Number(e.target.value) : null);
                                        setSelectedVariantId(null);
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">Chọn sản phẩm</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phiên bản
                                </label>
                                <select
                                    value={selectedVariantId || ''}
                                    onChange={e => setSelectedVariantId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    disabled={!selectedProductId}
                                >
                                    <option value="">Chọn phiên bản</option>
                                    {selectedProduct?.details?.map(detail => (
                                        <option key={detail.id} value={detail.id}>
                                            {`${detail.size || ''} ${detail.type || ''} ${detail.values || ''}`.trim() || `#${detail.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    min={1}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    disabled={!selectedVariantId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá nhập (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={costPerUnit}
                                    onChange={e => setCostPerUnit(Number(e.target.value))}
                                    min={0}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    disabled={!selectedVariantId}
                                />
                            </div>

                            <div className="flex justify-end items-end">
                                <button
                                    onClick={addItem}
                                    disabled={!selectedVariantId || quantity < 1}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-sm font-medium mb-3">Danh sách sản phẩm nhập kho</h4>

                    {items.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md text-gray-500">
                            Chưa có sản phẩm nào trong phiếu nhập
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phiên bản</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm">{item.product_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{item.variant_info}</td>
                                            <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-right">{item.cost_per_unit.toLocaleString()} VNĐ</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">{(item.quantity * item.cost_per_unit).toLocaleString()} VNĐ</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-3 text-sm font-medium">Tổng cộng</td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">
                                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                                        </td>
                                        <td className="px-4 py-3"></td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">
                                            {items.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0).toLocaleString()} VNĐ
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={items.length === 0 || loading}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : (
                            'Lưu phiếu nhập kho'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component bộ lọc kho hàng
const InventoryFilters = ({
    activeTab,
    setActiveTab,
    tabCounts
}: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabCounts: Record<string, number>;
}) => {
    const tabs = [
        { id: 'Tất cả', label: 'Tất cả sản phẩm' },    
        { id: 'Hoạt động', label: 'Đang bán' },
        { id: 'Sắp hết', label: 'Sắp hết hàng' },
        { id: 'Hết hàng', label: 'Hết hàng' },
    ];

    return (
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <div className="overflow-x-auto">
                <div className="min-w-max">
                    <div className="border-b flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 px-5 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-b-2 border-amber-500 text-amber-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tabCounts[tab.id] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ProductTable Component
const ProductTable = ({
    products,
    loading,
    fetchAllProductData,
    handleEditProduct,
    handleDeleteProduct,
    getCategoryNameById,
    openStockReceiptModal,
}: {
    products: ProductViewModel[];
    loading: boolean;
    fetchAllProductData: () => Promise<void>;
    handleEditProduct: (productId: number) => void;
    handleDeleteProduct: (productId: number) => void;
    getCategoryNameById: (categoryId: number | undefined) => Promise<string>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    openStockReceiptModal: (productId: number, variantId: number | null) => void;
}) => {
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
    const [detailPrices, setDetailPrices] = useState<Record<number, {
        base_price: number;
        discount_price: number | null;
        end_date: string | null;
    }>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [detailLoading, setDetailLoading] = useState<Record<number, boolean>>({});
    const [categoryNames, setCategoryNames] = useState<Record<number, string>>({});
    const router = useRouter();

    // Filter products based on search term
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;

        const lowerCaseSearch = searchTerm.toLowerCase().trim();
        return products.filter(
            (product) =>
                product.name.toLowerCase().includes(lowerCaseSearch) ||
                product.id.toString().includes(lowerCaseSearch) ||
                product.categories?.some((cat) => cat.name.toLowerCase().includes(lowerCaseSearch)),
        );
    }, [products, searchTerm]);

    // Fetch price details when a product is expanded
    useEffect(() => {
        if (expandedProduct !== null) {
            fetchProductDetailPrices(expandedProduct);
        }
    }, [expandedProduct]);



    // Fetch price details for a specific product
    const fetchProductDetailPrices = async (productId: number) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            const product = products.find((p) => p.id === productId);
            if (!product || !product.details) return;

            // Update loading state for this product's details
            setDetailLoading((prev) => ({ ...prev, [productId]: true }));

            // Fetch prices for each product detail using the new endpoint
            const pricePromises = product.details.map(async (detail) => {
                try {
                    const response = await fetch(
                        `http://68.183.226.198:3000/api/v1/prices/product-detail/${detail.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    );

                    if (response.ok) {
                        const priceData = await response.json();

                        if (Array.isArray(priceData) && priceData.length > 0) {
                            // Endpoint trả về mảng, lấy giá mới nhất (phần tử đầu tiên)
                            return {
                                detailId: detail.id,
                                base_price: parseFloat(priceData[0].base_price),
                                discount_price: priceData[0].discount_price
                                    ? parseFloat(priceData[0].discount_price)
                                    : null,
                                end_date: priceData[0].end_date || null,
                            };
                        }
                    }
                    return { detailId: detail.id, base_price: 0, discount_price: null, end_date: null };
                } catch {
                    return { detailId: detail.id, base_price: 0, discount_price: null, end_date: null };
                }
            });

            const prices = await Promise.all(pricePromises);

            // Update state with fetched prices
            const pricesObj: Record<
                number,
                { base_price: number; discount_price: number | null; end_date: string | null }
            > = {};
            prices.forEach((price) => {
                pricesObj[price.detailId] = {
                    base_price: price.base_price,
                    discount_price: price.discount_price,
                    end_date: price.end_date,
                };
            });

            setDetailPrices((prev) => ({ ...prev, ...pricesObj }));
        } catch (error) {
            console.error('Error fetching product detail prices:', error);
        } finally {
            // Stop loading state for this product's details
            setDetailLoading((prev) => ({ ...prev, [productId]: false }));
        }
    };

    // Fetch category names
    useEffect(() => {
        const fetchCategoryNames = async () => {
            const uniqueCategoryIds: number[] = [];

            // Thu thập tất cả category_id từ sản phẩm
            products.forEach((product) => {
                if (product.category_id && !uniqueCategoryIds.includes(product.category_id)) {
                    uniqueCategoryIds.push(product.category_id);
                } else if (product.categories && product.categories.length > 0) {
                    // Backup: Nếu không có category_id, thử lấy từ categories array
                    const catId = product.categories[0].id;
                    if (catId && !uniqueCategoryIds.includes(catId)) {
                        uniqueCategoryIds.push(catId);
                    }
                }
            });

            const categoryNamesMap: Record<number, string> = {};

            await Promise.all(
                uniqueCategoryIds.map(async (categoryId) => {
                    try {
                        const name = await getCategoryNameById(categoryId);
                        categoryNamesMap[categoryId] = name;
                    } catch (error) {
                        console.error(`Lỗi khi lấy tên danh mục ${categoryId}:`, error);
                        categoryNamesMap[categoryId] = `ID: ${categoryId}`;
                    }
                }),
            );

            setCategoryNames(categoryNamesMap);
        };

        if (products.length > 0) {
            fetchCategoryNames();
        }
    }, [products, getCategoryNameById]);

    // Toggle product expansion
    const toggleProductExpansion = useCallback((productId: number) => {
        setExpandedProduct((prev) => (prev === productId ? null : productId));
    }, []);

    // Refresh data
    const handleRefresh = useCallback(() => {
        fetchAllProductData();
    }, [fetchAllProductData]);




    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header with search and actions */}
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full md:w-auto md:max-w-md relative">
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Tìm sản phẩm theo tên, ID, danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-gray-500 hover:text-amber-600 rounded-lg transition-colors pl-5"
                                title="Làm mới"
                            >
                                <ArrowPathIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {searchTerm && (
                            <div className="absolute mt-1 text-xs text-gray-500">
                                Tìm thấy {filteredProducts.length} kết quả
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {loading ? (
                <div className="p-6">
                    <TableSkeleton />
                </div>
            ) : filteredProducts.length === 0 ? (
                searchTerm ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500">
                            Không tìm thấy sản phẩm phù hợp với từ khóa: {searchTerm}
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-amber-600 hover:text-amber-800 font-medium"
                        >
                            Xóa từ khóa
                        </button>
                    </div>
                ) : (
                    <EmptyState
                        message="Chưa có sản phẩm nào"
                        actionLabel="Thêm sản phẩm đầu tiên"
                        onAction={() => router.push('/seller/products/createproduct/step1')}
                    />
                )
            ) : (
                <div>
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-6 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-2">Sản phẩm</div>
                        <div>Mã sản phẩm</div>
                        <div>Tồn kho</div>
                        <div>Trạng thái</div>
                        <div className="text-right">Thao tác</div>
                    </div>

                    {/* Product rows */}
                    {filteredProducts.map((product) => {
                        const totalStock = product.details?.reduce((sum, detail) => sum + (Number(detail.quantities) || 0), 0) || 0;
                        const activeVariants = product.details?.filter((d) => d.isActive)?.length || 0;
                        const totalVariants = product.details?.length || 0;
                        const isExpanded = expandedProduct === product.id;
                        const isDetailLoading = detailLoading[product.id] || false;
                        const lowStock = product.details?.filter((d) => Number(d.quantities) > 0 && Number(d.quantities) <= 10).length || 0;
                        const outOfStock = product.details?.filter((d) => Number(d.quantities) === 0).length || 0;

                        return (
                            <div
                                key={product.id}
                                className="border-b last:border-b-0 transition hover:bg-gray-50/50"
                            >
                                {/* Main product row */}
                                <div className="grid grid-cols-1 md:grid-cols-6 px-6 py-4">
                                    {/* Mobile view */}
                                    <div className="md:hidden flex justify-between items-center mb-3">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleProductExpansion(product.id)}
                                                className="mr-2 text-gray-500 hover:text-amber-600"
                                                aria-expanded={isExpanded}
                                                aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDownIcon className="h-5 w-5" />
                                                ) : (
                                                    <ChevronRightIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                            <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0].path}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover h-full w-full"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                        <PlusIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">#{product.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditProduct(product.id)}
                                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex items-center">
                                        <button
                                            onClick={() => toggleProductExpansion(product.id)}
                                            className="mr-3 text-gray-500 hover:text-amber-600 hidden md:block"
                                            aria-expanded={isExpanded}
                                            aria-label={isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết'}
                                        >
                                            {isExpanded ? (
                                                <ChevronDownIcon className="h-5 w-5" />
                                            ) : (
                                                <ChevronRightIcon className="h-5 w-5" />
                                            )}
                                        </button>

                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-gray-200 rounded-md overflow-hidden mr-3 flex-shrink-0 border">
                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0].path}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover h-full w-full"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                        <PlusIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {product.category_id
                                                        ? categoryNames[product.category_id]
                                                            ? `${categoryNames[product.category_id]} `
                                                            : `Đang tải... (ID: ${product.category_id})`
                                                        : product.categories && product.categories.length > 0
                                                            ? `${product.categories[0].name} `
                                                            : 'Chưa có danh mục'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center">
                                        <span className="text-sm text-gray-700">#{product.id}</span>
                                    </div>

                                    <div className="hidden md:flex items-center">
                                        <div className="text-sm font-medium">
                                            <span className={totalStock > 0 ? "text-gray-700" : "text-red-600"}>
                                                {totalStock}
                                            </span>
                                            {lowStock > 0 && (
                                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                                                    {lowStock} sắp hết
                                                </span>
                                            )}
                                            {outOfStock > 0 && (
                                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                                                    {outOfStock} hết hàng
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center">
                                        <span
                                            className={`px-2.5 py-1 text-xs rounded-full ${activeVariants > 0
                                                ? 'bg-green-100 text-green-800'
                                                : totalVariants === 0
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {activeVariants > 0
                                                ? 'Đang kinh doanh'
                                                : totalVariants === 0
                                                    ? 'Chưa có phiên bản'
                                                    : 'Chưa kinh doanh'}
                                        </span>
                                    </div>

                                    <div className="hidden md:flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleEditProduct(product.id)}
                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                            title="Xóa"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Mobile info */}
                                    <div className="md:hidden grid grid-cols-2 gap-2 text-sm mt-2">
                                        <div>
                                            <span className="text-gray-500">Tồn kho: </span>
                                            <span className={totalStock > 0 ? "text-gray-700" : "text-red-600"}>
                                                {totalStock}
                                            </span>
                                            {lowStock > 0 && (
                                                <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                                                    {lowStock} sắp hết
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${activeVariants > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : totalVariants === 0
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {activeVariants > 0
                                                    ? 'Đang kinh doanh'
                                                    : totalVariants === 0
                                                        ? 'Chưa có phiên bản'
                                                        : 'Chưa kinh doanh'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-xs text-gray-500 mt-1">
                                            <span>Danh mục: </span>
                                            <span className="text-gray-700">
                                                {product.category_id
                                                    ? categoryNames[product.category_id] ||
                                                    `Đang tải... (ID: ${product.category_id})`
                                                    : product.categories && product.categories.length > 0
                                                        ? `${product.categories[0].name} (ID: ${product.categories[0].id})`
                                                        : 'Chưa có danh mục'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="p-4 bg-gray-50 border-t">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-medium">Chi tiết kho hàng</h4>
                                        </div>

                                        {isDetailLoading ? (
                                            <div className="py-4 flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700"></div>
                                            </div>
                                        ) : product.details && product.details.length > 0 ? (
                                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Mã phiên bản
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Kích thước
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Loại
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Giá trị
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Tồn kho
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Giá gốc
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Trạng thái
                                                            </th>

                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {product.details.map((detail) => {
                                                            const priceInfo = detailPrices[detail.id] || {
                                                                base_price: 0,
                                                                discount_price: null,
                                                                end_date: null,
                                                            };
                                                            return (
                                                                <tr
                                                                    key={detail.id}
                                                                    className="hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div className="h-10 w-10 flex-shrink-0 mr-3 border rounded-full overflow-hidden">
                                                                                {detail.images && detail.images.length > 0 ? (
                                                                                    <Image
                                                                                        src={detail.images[0].path}
                                                                                        alt={`Variant ${detail.id}`}
                                                                                        width={40}
                                                                                        height={40}
                                                                                        className="h-full w-full object-cover"
                                                                                        onError={(e) => {
                                                                                            const target = e.target as HTMLImageElement;
                                                                                            target.src = '/placeholder.png';
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                                        <PlusIcon className="h-5 w-5" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-gray-900 text-sm">
                                                                                #{detail.id}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                        {detail.size || '—'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                        {detail.type || '—'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                        {detail.values || '—'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                        {Number(detail.quantities) === 0 ? (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                                Hết hàng
                                                                            </span>
                                                                        ) : Number(detail.quantities) <= 10 ? (
                                                                            <div className="flex items-center">
                                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                                                                    Sắp hết ({detail.quantities})
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => openStockReceiptModal(product.id, detail.id)}
                                                                                    className="text-xs text-amber-600 hover:text-amber-800"
                                                                                    title="Nhập thêm hàng"
                                                                                >
                                                                                    <PlusIcon className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="font-medium text-gray-700">
                                                                                {detail.quantities}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                        {priceInfo.base_price
                                                                            ? formatPrice(priceInfo.base_price)
                                                                            : '—'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span
                                                                            className={`px-2 py-1 text-xs rounded-full ${detail.isActive
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-gray-100 text-gray-800'
                                                                                }`}
                                                                        >
                                                                            {detail.isActive
                                                                                ? 'Đang bán'
                                                                                : 'Ngừng bán'}
                                                                        </span>
                                                                    </td>

                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                                                <p>
                                                    Sản phẩm này chưa có phiên bản. Hãy thêm phiên bản để bắt đầu nhập kho.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function Warehouse() {
    const [products, setProducts] = useState<ProductViewModel[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Tất cả');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
        totalProducts: 0,
        totalVariants: 0,
        activeVariants: 0,
        totalStock: 0,
        lowStockItems: 0,
        outOfStockItems: 0
    });

    const calculateInventorySummary = useCallback(() => {
        if (!products.length) return;

        let totalVariants = 0;
        let activeVariants = 0;
        let totalStock = 0;
        let lowStockItems = 0;
        let outOfStockItems = 0;

        products.forEach(product => {
            if (product.details && product.details.length > 0) {
                totalVariants += product.details.length;

                product.details.forEach(detail => {
                    if (detail.isActive) {
                        activeVariants++;
                    }

                    const stockQuantity = Number(detail.quantities) || 0;
                    totalStock += stockQuantity;

                    if (stockQuantity === 0) {
                        outOfStockItems++;
                    } else if (stockQuantity <= 10) { // Ngưỡng thấp là 10 sản phẩm
                        lowStockItems++;
                    }
                });
            }
        });

        setInventorySummary({
            totalProducts: products.length,
            totalVariants,
            activeVariants,
            totalStock,
            lowStockItems,
            outOfStockItems
        });
    }, [products]);

    useEffect(() => {
        calculateInventorySummary();
    }, [calculateInventorySummary, products]);

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    const router = useRouter();

    useEffect(() => {
        fetchAllProductData();
    }, []);

    const fetchAllProductData = useCallback(async () => {
        try {
            // Get token from localStorage or sessionStorage
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

            // 1. Fetch all products first to get IDs
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products', {
                headers: headers,
            });

            if (!productsResponse.ok) {
                throw new Error(`Failed to fetch products: ${productsResponse.status}`);
            }

            const productsData = await productsResponse.json();

            // 2. Fetch complete details for each product using the detailed endpoint
            const detailedProductsPromises = productsData.map(async (product: Product) => {
                try {
                    const detailResponse = await fetch(
                        `http://68.183.226.198:3000/api/products/${product.id}`,
                        {
                            headers: headers,
                        },
                    );

                    if (!detailResponse.ok) {
                        return {
                            ...product,
                            images: Array.isArray(product.images)
                                ? product.images
                                : product.images
                                    ? [product.images]
                                    : [],
                            details: [],
                            pricing: [],
                            categories: product.categories || [],
                        };
                    }

                    const detailData = await detailResponse.json();

                    // Process the detailed product data
                    return {
                        ...detailData,
                        images: Array.isArray(detailData.images)
                            ? detailData.images
                            : detailData.images
                                ? [detailData.images]
                                : [],
                        details: detailData.details || [],
                        pricing: [], // We'll fetch pricing separately
                        categories: detailData.categories || [],
                    };
                } catch {
                    return {
                        ...product,
                        images: Array.isArray(product.images)
                            ? product.images
                            : product.images
                                ? [product.images]
                                : [],
                        details: [],
                        pricing: [],
                        categories: product.categories || [],
                    };
                }
            });

            const detailedProducts = await Promise.all(detailedProductsPromises);

            // Create a map for easier lookup
            const productsMap = new Map();
            detailedProducts.forEach((product) => {
                productsMap.set(product.id, product);
            });

            // 3. Fetch all prices
            try {
                const allPricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                    headers: headers,
                });

                if (allPricesResponse.ok) {
                    const allPricesData = await allPricesResponse.json();

                    // Process all prices and add them to the appropriate products
                    if (Array.isArray(allPricesData)) {
                        allPricesData.forEach((price: Price) => {
                            if (price && price.product_detail && price.product_detail.productId) {
                                const product = productsMap.get(price.product_detail.productId);
                                if (product) {
                                    if (!Array.isArray(product.pricing)) {
                                        product.pricing = [];
                                    }
                                    product.pricing.push(price);
                                }
                            }
                        });
                    }
                }
            } catch (priceError) {
                console.error('Error fetching prices:', priceError);
                // Continue without price data
            }

            // Convert the map values back to an array
            const productsWithDetails = Array.from(productsMap.values()) as ProductViewModel[];
            setProducts(productsWithDetails);
        } catch (err) {
            console.error('Error fetching product data:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategoryNameById = useCallback(
        async (categoryId: number | undefined): Promise<string> => {
            if (!categoryId) return 'Chưa có danh mục';

            // Kiểm tra nếu đã có trong cache
            const cachedCategory = categories.find((c) => c.id === categoryId);
            if (cachedCategory && cachedCategory.name) {
                return cachedCategory.name;
            }

            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return `ID: ${categoryId}`;

                // Sửa lại URL API endpoint đúng với cấu trúc của bạn
                const response = await fetch(
                    `http://68.183.226.198:3000/api/categories/${categoryId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    console.error(`Không thể lấy thông tin danh mục ID: ${categoryId}`);
                    return `ID: ${categoryId}`;
                }

                const categoryData = await response.json();

                // Cập nhật cache categories
                if (categoryData && categoryData.name) {
                    setCategories((prev) => {
                        const exists = prev.some((c) => c.id === categoryId);
                        if (!exists) {
                            return [...prev, categoryData];
                        }
                        return prev.map((c) => (c.id === categoryId ? categoryData : c));
                    });

                    return categoryData.name;
                }

                return `ID: ${categoryId}`;
            } catch (error) {
                console.error(`Lỗi khi lấy thông tin danh mục ${categoryId}:`, error);
                return `ID: ${categoryId}`;
            }
        },
        [categories],
    );

    // Handle edit product
    const handleEditProduct = useCallback(
        (productId: number) => {
            router.push(`/seller/products/${productId}`);
        },
        [router],
    );

    // Handle delete product confirmation
    const handleDeleteProduct = useCallback(
        (productId: number) => {
            const productToDelete = products.find((product) => product.id === productId);

            if (productToDelete) {
                // Set the product ID to delete
                setProductToDelete(productId);

                // Show the confirmation modal with product details
                setIsDeleteConfirmOpen(true);
            } else {
                const errorMessage = `Không tìm thấy thông tin sản phẩm ID: ${productId}`;
                setError(errorMessage);
                showToast(errorMessage, 'error');
            }
        },
        [products],
    );

    // Confirm delete product
    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                router.push('/seller/signin');
                return;
            }

            // First, we'll make a DELETE request to the API
            const response = await fetch(
                `http://68.183.226.198:3000/api/products/${productToDelete}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            // Check if the deletion was successful
            if (response.ok) {
                // Remove the product from local state to update UI immediately
                setProducts((prev) => prev.filter((product) => product.id !== productToDelete));

                // Show success message with toast instead of alert
                showToast('Sản phẩm đã được xóa thành công', 'success');

                // Close the modal
                setIsDeleteConfirmOpen(false);
                setProductToDelete(null);

                // Refresh the product list to ensure everything is in sync
                await fetchAllProductData();
            } else {
                // If deletion failed, get error details
                let errorMessage = 'Không thể xóa sản phẩm';

                try {
                    // Try to parse error response as JSON
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If response isn't valid JSON, try to get text
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || errorMessage;
                    } catch {
                        // If all else fails, use status text
                        errorMessage = `Không thể xóa sản phẩm (${response.status}: ${response.statusText})`;
                    }
                }

                throw new Error(errorMessage);
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            setError(err instanceof Error ? err.message : 'Không thể xóa sản phẩm');
            showToast(err instanceof Error ? err.message : 'Không thể xóa sản phẩm', 'error');
        } finally {
            setLoading(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    // Filter products based on active tab
    const filteredProducts = useMemo(() => {
        switch (activeTab) {
            case 'Hoạt động':
                return products.filter((product) => product.details?.some((detail) => detail.isActive));
            case 'Sắp hết':
                return products.filter((product) => {
                    // Có ít nhất một phiên bản sắp hết hàng (1-10) nhưng không hết hàng
                    return product.details?.some((detail) => {
                        const quantity = Number(detail.quantities) || 0;
                        return quantity > 0 && quantity <= 10;
                    }) && !product.details?.every((detail) => Number(detail.quantities) === 0);
                });
            case 'Hết hàng':
                return products.filter((product) => {
                    // Tất cả các phiên bản đều hết hàng hoặc không có phiên bản nào
                    return !product.details?.length ||
                        product.details.every((detail) => Number(detail.quantities) === 0);
                });
            case 'Khuyến mãi':
                return products.filter((product) => {
                    return product.pricing?.some((price) => {
                        // Check if there's a discount price
                        const hasDiscount = price.discount_price > 0;

                        // Check if the promotion is still active (not expired)
                        const isActive = isPromotionActive(price.end_date);

                        return hasDiscount && isActive;
                    });
                });
            default:
                return products;
        }
    }, [products, activeTab]);

    // Get counts for each tab
    const tabCounts = useMemo(() => {
        return {
            'Tất cả': products.length,
            'Hoạt động': products.filter((p) => p.details?.some((d) => d.isActive)).length,
            'Sắp hết': products.filter((p) =>
                p.details?.some(d => {
                    const quantity = Number(d.quantities) || 0;
                    return quantity > 0 && quantity <= 10;
                }) && !p.details?.every(d => Number(d.quantities) === 0)
            ).length,
            'Hết hàng': products.filter((p) =>
                !p.details?.length || p.details?.every((d) => Number(d.quantities) === 0)
            ).length,
            'Khuyến mãi': products.filter((p) =>
                p.pricing?.some(
                    (price) => price.discount_price > 0 && isPromotionActive(price.end_date),
                ),
            ).length,
        };
    }, [products]);

    const handleCreateReceipt = async (receiptData: {
        supplier: string;
        notes: string;
        createdAt: string;
        items: Array<{
            product_id: number;
            product_detail_id: number;
            product_name: string;
            variant_info: string;
            quantity: number;
            cost_per_unit: number;
        }>;
        totalItems: number;
        totalCost: number;
    }) => {
        setIsProcessing(true);
        try {
            // Giả lập API call - trong thực tế bạn sẽ gọi API thực sự
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Cập nhật số lượng sản phẩm trong kho
            const updatedProducts = [...products];

            // Với mỗi sản phẩm được nhập, cập nhật số lượng tồn kho
            receiptData.items.forEach((item: { product_id: number; product_detail_id: number; product_name: string; variant_info: string; quantity: number; cost_per_unit: number }) => {
                for (const product of updatedProducts) {
                    if (product.details) {
                        const detailIndex = product.details.findIndex(d => d.id === item.product_detail_id);
                        if (detailIndex !== -1) {
                            // Cộng dồn số lượng nhập
                            const currentQuantity = Number(product.details[detailIndex].quantities) || 0;
                            product.details[detailIndex].quantities = currentQuantity + item.quantity;
                            break;
                        }
                    }
                }
            });

            // Cập nhật state sản phẩm
            setProducts(updatedProducts);

            // Cập nhật lại thống kê
            calculateInventorySummary();

            showToast('Nhập kho thành công', 'success');
            setIsReceiptModalOpen(false);
        } catch (error) {
            console.error('Lỗi khi tạo phiếu nhập kho:', error);
            showToast('Có lỗi xảy ra khi tạo phiếu nhập kho', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <MenuSideBar />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <Header />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
                        <div>
                            <h1 className='text-2xl font-semibold text-gray-800'>Quản lý kho</h1>
                            <p className='text-gray-500 mt-1'>Quản lý tồn kho của bạn</p>
                        </div>
                        <div className='mt-4 md:mt-0 flex gap-2'>

                            <button
                                onClick={() => setIsReceiptModalOpen(true)}
                                className='bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center shadow-sm transition-colors'
                            >
                                <PlusIcon className='w-5 h-5 mr-2' />
                                Tạo phiếu nhập kho
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị thống kê tồn kho */}
                    <WarehouseSummary summary={inventorySummary} />

                    {/* Thêm bộ lọc tại đây */}
                    <InventoryFilters
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tabCounts={tabCounts}
                    />

                    {/* Phần bảng sản phẩm */}
                    <ProductTable
                        products={filteredProducts}
                        loading={loading}
                        fetchAllProductData={fetchAllProductData}
                        handleEditProduct={handleEditProduct}
                        handleDeleteProduct={handleDeleteProduct}
                        getCategoryNameById={getCategoryNameById}
                        showToast={showToast}
                        openStockReceiptModal={(productId, variantId) => {
                            setSelectedProductId(productId);
                            setSelectedVariantId(variantId);
                            setIsReceiptModalOpen(true);
                        }}
                    />

                    {/* Các modal */}
                    {isReceiptModalOpen && (
                        <StockReceiptModal
                            isOpen={isReceiptModalOpen}
                            onClose={() => {
                                setIsReceiptModalOpen(false);
                                setSelectedProductId(null);
                                setSelectedVariantId(null);
                            }}
                            onSave={handleCreateReceipt}
                            products={products}
                            loading={isProcessing}
                            preSelectedProductId={selectedProductId}
                            preSelectedVariantId={selectedVariantId}
                        />
                    )}

                    {/* Delete confirmation modal */}
                    {isDeleteConfirmOpen && (
                        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                            <div className='bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-xl'>
                                <div className='mb-5 text-center'>
                                    <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                                        <TrashIcon className='h-6 w-6 text-red-600' />
                                    </div>
                                    <h3 className='text-lg font-medium text-gray-900'>Xác nhận xóa sản phẩm</h3>
                                    {productToDelete && (
                                        <p className='font-medium text-gray-800 mt-1'>
                                            {products.find((p) => p.id === productToDelete)?.name}
                                        </p>
                                    )}
                                    <p className='text-sm text-gray-500 mt-2'>
                                        Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác và
                                        sẽ xóa tất cả phiên bản, giá và thông tin liên quan.
                                    </p>
                                </div>
                                <div className='flex justify-end space-x-3'>
                                    <button
                                        className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                                        onClick={() => {
                                            setIsDeleteConfirmOpen(false);
                                            setProductToDelete(null);
                                        }}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center'
                                        onClick={confirmDeleteProduct}
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
                                            'Xóa sản phẩm'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
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
                </main>
            </div>
        </div>
    );
}

// Check if a promotion is still active based on end date
function isPromotionActive(end_date: string | null | undefined) {
    if (!end_date) return true; // If no end date, consider it always active
    try {
        const now = new Date();
        const promotionEndDate = new Date(end_date);
        return now <= promotionEndDate;
    } catch {
        return true; // If date parsing fails, assume it's active
    }
}