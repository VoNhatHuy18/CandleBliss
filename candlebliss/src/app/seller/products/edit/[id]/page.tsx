'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';
import Toast from '@/app/components/ui/toast/page';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon,
    TrashIcon,
    ArrowPathIcon,
    PhotoIcon,
    XMarkIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

// Cập nhật interface Image để khớp với cấu trúc dữ liệu trả về
interface Image {
    id: string;
    path: string;
    public_id: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: null;
    isDeleted?: boolean;
    __entity?: string; // Thêm trường này đúng với dữ liệu trả về
}

interface ProductDetail {
    id: number;
    size: string;
    type: string;
    values: string;
    quantities: number;
    images: Image[];
    isActive: boolean;
}

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Price {
    id?: number;
    base_price: number;
    discount_price: number | null;
    product_detail_id?: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    video: string;
    images: Image[];
    category_id: number;
    details: ProductDetail[];
}

export default function EditProduct() {
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string[]>(['basic', 'variants', 'images']);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info'
    });

    // Form state
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        video: string;
        category_id: number;
    }>({
        name: '',
        description: '',
        video: '',
        category_id: 0
    });

    // Variant pricing state
    const [detailPrices, setDetailPrices] = useState<Record<number, Price>>({});

    // File uploads
    const [productImages, setProductImages] = useState<File[]>([]);
    const [variantImageUploads, setVariantImageUploads] = useState<Record<number, File[]>>({});
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isCategoryDetailLoading, setIsCategoryDetailLoading] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Variant management
    const [variantsToDelete, setVariantsToDelete] = useState<number[]>([]);
    const [newVariants, setNewVariants] = useState<{
        size: string;
        type: string;
        values: string;
        quantities: number;
        isActive: boolean;
        price: {
            base_price: number;
            discount_price: number | null;
        };
        images: File[];
    }[]>([]);

    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    // Show toast message
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    // Toggle section expansion
    const toggleSection = (section: string) => {
        setExpandedSection(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    // Trong useEffect ban đầu khi tải chi tiết sản phẩm
    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!productId) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                if (!token) {
                    showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                    router.push('/seller/signin');
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Không thể lấy thông tin sản phẩm: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Initial product data:', data);

                // Kiểm tra cấu trúc images và ghi log
                if (data.images) {
                    console.log('Initial product images:', data.images);
                    console.log('Image structure sample:', data.images[0]);
                }

                // Normalize the product data
                const normalizedProduct = {
                    ...data,
                    images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
                    details: data.details || [],
                };

                setProduct(normalizedProduct);

                // Initialize form data
                setFormData({
                    name: normalizedProduct.name || '',
                    description: normalizedProduct.description || '',
                    video: normalizedProduct.video || '',
                    category_id: normalizedProduct.category_id || 0
                });

                // Fetch pricing for each variant
                if (normalizedProduct.details && normalizedProduct.details.length > 0) {
                    fetchProductDetailPrices(normalizedProduct.details);
                }

                // Fetch categories
                fetchCategories();
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(err instanceof Error ? err.message : 'Không thể tải thông tin sản phẩm');
                showToast('Không thể tải thông tin sản phẩm', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [productId, router]);
    // Fetch categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            setCategoryError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
            return;
        }

        try {
            setIsCategoriesLoading(true);
            setCategoryError('');

            console.log('Fetching categories with token:', token ? 'Token exists' : 'No token');

            const response = await fetch('http://localhost:3000/api/categories', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Categories API response status:', response.status);

            let categoriesData;

            if (response.status === 302) {
                // Special case: API returns redirect status but includes data
                const responseText = await response.text();
                console.log('Received 302 response with text:', responseText);

                try {
                    // Try to parse the response text directly as JSON
                    categoriesData = JSON.parse(responseText);
                    console.log('Successfully parsed categories from 302 response:', categoriesData);
                } catch (parseError) {
                    console.error('Failed to parse categories from 302 response:', parseError);

                    // Try to extract JSON array from the text if it contains array markers
                    if (responseText.includes('[') && responseText.includes(']')) {
                        const jsonStart = responseText.indexOf('[');
                        const jsonEnd = responseText.lastIndexOf(']') + 1;
                        const jsonString = responseText.substring(jsonStart, jsonEnd);

                        try {
                            categoriesData = JSON.parse(jsonString);
                            console.log('Extracted categories from 302 response text:', categoriesData);
                        } catch (nestedError) {
                            console.error('Failed to extract categories from 302 response text:', nestedError);
                            throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
                        }
                    } else {
                        throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
                    }
                }
            } else if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);

                // Try to extract JSON array from error response if it contains array markers
                if (errorText.includes('[') && errorText.includes(']')) {
                    const jsonStart = errorText.indexOf('[');
                    const jsonEnd = errorText.lastIndexOf(']') + 1;
                    const jsonString = errorText.substring(jsonStart, jsonEnd);

                    try {
                        categoriesData = JSON.parse(jsonString);
                        console.log('Extracted categories from error response:', categoriesData);
                    } catch (parseError) {
                        console.error('Failed to extract categories from error response:', parseError);
                        throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
                    }
                } else {
                    throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
                }
            } else {
                // Normal case: API returns success status
                categoriesData = await response.json();
                console.log('Categories loaded successfully:', categoriesData);
            }

            if (Array.isArray(categoriesData)) {
                console.log('Setting categories:', categoriesData);
                setCategories(categoriesData);
                setCategoryError(''); // Clear any previous error
            } else {
                console.error('Categories data is not an array:', categoriesData);
                setCategories([]);
                setCategoryError('Định dạng dữ liệu danh mục không hợp lệ');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);

            // Try to extract category data from error message if it contains JSON
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';

            if (errorMessage.includes('[{') && errorMessage.includes('"}]')) {
                try {
                    // Extract JSON from error message by finding the first '[' and last ']'
                    const jsonStart = errorMessage.indexOf('[');
                    const jsonEnd = errorMessage.lastIndexOf(']') + 1;
                    const jsonString = errorMessage.substring(jsonStart, jsonEnd);

                    const extractedData = JSON.parse(jsonString);
                    console.log('Successfully extracted categories from error message:', extractedData);

                    if (Array.isArray(extractedData)) {
                        setCategories(extractedData);
                        setCategoryError(''); // Clear error since we successfully extracted the data
                        return; // Exit early since we've handled the data
                    }
                } catch (parseError) {
                    console.error('Failed to parse categories from error message:', parseError);
                }
            }

            setCategoryError('Không thể tải danh mục: ' + errorMessage);
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const handleCategorySelect = async (category: Category) => {
        try {
            setIsCategoryDetailLoading(true);
            console.log('Selected category:', category);

            // Update formData with the selected category
            setFormData(prev => ({ ...prev, category_id: category.id }));
            setIsCategoryDropdownOpen(false);

            // Fetch detailed category information if needed
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/categories/${category.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error(`Failed to fetch category details: ${response.status}`);
                return;
            }

            const categoryDetail = await response.json();
            console.log('Received category detail:', categoryDetail);

            // Update the categories list with the detailed info
            if (categoryDetail && categoryDetail.id) {
                setCategories(prev => {
                    const updatedCategories = [...prev];
                    const index = updatedCategories.findIndex(c => c.id === categoryDetail.id);
                    if (index !== -1) {
                        updatedCategories[index] = categoryDetail;
                    } else {
                        updatedCategories.push(categoryDetail);
                    }
                    return updatedCategories;
                });
            }
        } catch (error) {
            console.error('Error fetching category details:', error);
        } finally {
            setIsCategoryDetailLoading(false);
        }
    };

    const handleCategoryDropdownToggle = () => {
        if (!isCategoryDropdownOpen) {
            // Tính toán vị trí cho dropdown khi nó được mở
            const button = document.getElementById('category-dropdown-button');
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        }
        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
    };

    // Fetch prices for product details
    const fetchProductDetailPrices = async (details: ProductDetail[]) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            // Fetch prices for each product detail
            const pricePromises = details.map(async (detail) => {
                try {
                    const response = await fetch(`http://localhost:3000/api/v1/prices/product-detail/${detail.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const priceData = await response.json();

                        if (Array.isArray(priceData) && priceData.length > 0) {
                            return {
                                detail_id: detail.id,
                                price: {
                                    id: priceData[0].id,
                                    base_price: parseFloat(priceData[0].base_price),
                                    discount_price: priceData[0].discount_price ? parseFloat(priceData[0].discount_price) : null,
                                    product_detail_id: detail.id
                                }
                            };
                        }
                    }
                    return {
                        detail_id: detail.id,
                        price: {
                            base_price: 0,
                            discount_price: null,
                            product_detail_id: detail.id
                        }
                    };
                } catch (error) {
                    return {
                        detail_id: detail.id,
                        price: {
                            base_price: 0,
                            discount_price: null,
                            product_detail_id: detail.id
                        }
                    };
                }
            });

            const prices = await Promise.all(pricePromises);

            // Update state with fetched prices
            const pricesObj: Record<number, Price> = {};
            prices.forEach(({ detail_id, price }) => {
                pricesObj[detail_id] = price;
            });

            setDetailPrices(pricesObj);
        } catch (error) {
            console.error("Error fetching product detail prices:", error);
        }
    };

    // Handle input changes for basic product info
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'category_id' ? parseInt(value) : value
        }));
    };

    // Handle variant changes
    const handleVariantChange = (index: number, field: string, value: string | number | boolean) => {
        if (!product) return;

        const updatedDetails = [...product.details];
        updatedDetails[index] = {
            ...updatedDetails[index],
            [field]: value
        };

        setProduct({
            ...product,
            details: updatedDetails
        });
    };

    // Handle price changes
    const handlePriceChange = (detailId: number, field: 'base_price' | 'discount_price', value: string) => {
        const numericValue = value === '' ? (field === 'discount_price' ? null : 0) : parseFloat(value);

        setDetailPrices(prev => ({
            ...prev,
            [detailId]: {
                ...prev[detailId],
                [field]: numericValue
            }
        }));
    };

    // Handle new variant changes
    const handleNewVariantChange = (index: number, field: string, value: string | number | boolean) => {
        const updatedVariants = [...newVariants];

        if (field === 'base_price' || field === 'discount_price') {
            updatedVariants[index] = {
                ...updatedVariants[index],
                price: {
                    ...updatedVariants[index].price,
                    [field]: field === 'discount_price' && value === '' ? null : parseFloat(value as string)
                }
            };
        } else {
            updatedVariants[index] = {
                ...updatedVariants[index],
                [field]: value
            };
        }

        setNewVariants(updatedVariants);
    };

    // Add new variant
    const addNewVariant = () => {
        setNewVariants([
            ...newVariants,
            {
                size: '',
                type: '',
                values: '',
                quantities: 0,
                isActive: true,
                price: {
                    base_price: 0,
                    discount_price: null
                },
                images: []
            }
        ]);
    };

    // Remove new variant
    const removeNewVariant = (index: number) => {
        setNewVariants(newVariants.filter((_, i) => i !== index));
    };

    // Mark variant for deletion
    const markVariantForDeletion = (id: number) => {
        setVariantsToDelete(prev => [...prev, id]);
    };

    // Restore variant from deletion
    const restoreVariant = (id: number) => {
        setVariantsToDelete(prev => prev.filter(variantId => variantId !== id));
    };

    const handleProductImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const filesArray = Array.from(e.target.files);
                setProductImages(filesArray);

                // Tạo FormData với hình ảnh
                const formData = new FormData();

                // Thay vì gửi product_id như một trường riêng, 
                // backend có thể đã cấu hình để tự động liên kết hình ảnh với sản phẩm
                // dựa trên ID sản phẩm trong URL
                filesArray.forEach(file => {
                    formData.append('images', file);
                });

                console.log('Upload images for product ID:', productId);
                showToast('Đang tải lên hình ảnh...', 'info');

                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Upload failed (${response.status}): ${errorText}`);
                    throw new Error(`Không thể tải lên hình ảnh: ${response.statusText}`);
                }

                // Lấy dữ liệu sản phẩm đã cập nhật từ response
                const updatedProduct = await response.json();
                console.log('Product updated with new images:', updatedProduct);

                // Kiểm tra dữ liệu trả về
                if (updatedProduct && updatedProduct.images) {
                    console.log('Received images:', updatedProduct.images);
                } else {
                    console.warn('No images returned in the response');
                }

                // Tải lại dữ liệu sản phẩm để đảm bảo hiển thị đúng
                await refetchProductDetails();

                setProductImages([]);
                showToast('Đã tải lên hình ảnh thành công', 'success');
            } catch (error) {
                console.error('Error uploading images:', error);
                showToast(`Lỗi tải lên hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
            }
        }
    };

    const refetchProductDetails = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            console.log('Refetching product details for ID:', productId);

            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Không thể tải lại thông tin sản phẩm: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Refetched product data:', data);

            // Normalize the product data
            const normalizedProduct = {
                ...data,
                images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
                details: data.details || [],
            };

            console.log('Normalized images:', normalizedProduct.images);

            // Cập nhật state sản phẩm
            setProduct(normalizedProduct);

            // Cập nhật formData
            setFormData({
                name: normalizedProduct.name || '',
                description: normalizedProduct.description || '',
                video: normalizedProduct.video || '',
                category_id: normalizedProduct.category_id || 0
            });

            // Nếu có chi tiết, tải lại giá
            if (normalizedProduct.details && normalizedProduct.details.length > 0) {
                fetchProductDetailPrices(normalizedProduct.details);
            }
        } catch (error) {
            console.error('Error refetching product details:', error);
            showToast(`Không thể tải lại thông tin sản phẩm: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
        }
    };
    const removeProductImage = async (imageId: string) => {
        try {
            if (!product) return;

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            console.log('Removing image with ID:', imageId);

            // Tạo FormData với thông tin hình ảnh cần xóa
            const formData = new FormData();
            formData.append('image_id', imageId);
            formData.append('action', 'remove_image'); // Đảm bảo backend hiểu đây là hành động xóa ảnh

            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('Remove image response status:', response.status);

            if (!response.ok) {
                throw new Error(`Không thể xóa hình ảnh: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Remove image response:', result);

            // Tải lại dữ liệu sản phẩm để cập nhật state đúng
            await refetchProductDetails();

            showToast('Đã xóa hình ảnh thành công', 'success');
        } catch (error) {
            console.error('Error removing image:', error);
            showToast(`Lỗi xóa hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
        }
    };






    // Thêm hàm xử lý việc tải lên hình ảnh cho chi tiết sản phẩm
    const handleVariantImageUpload = (detailId: number, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setVariantImageUploads(prev => ({
                ...prev,
                [detailId]: [...(prev[detailId] || []), ...filesArray]
            }));
        }
    };

    // Hàm xóa hình ảnh trước khi tải lên
    const removeVariantUploadImage = (detailId: number, imageIndex: number) => {
        setVariantImageUploads(prev => {
            const updatedFiles = [...(prev[detailId] || [])];
            updatedFiles.splice(imageIndex, 1);
            return { ...prev, [detailId]: updatedFiles };
        });
    };

    const updateDetailPrice = async (detailId: number, priceData: Price) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return false;

            const response = await fetch(`http://localhost:3000/api/v1/prices/product-detail/${detailId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base_price: priceData.base_price,
                    discount_price: priceData.discount_price
                })
            });

            if (!response.ok) {
                console.error(`Price update failed: ${response.statusText}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error updating price:", error);
            return false;
        }
    };
    const uploadDetailImages = async (detailId: number, files: File[]) => {
        if (files.length === 0) return true;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return false;

            // Sử dụng FormData để gửi cả thông tin cập nhật và hình ảnh
            const formData = new FormData();

            // Thêm hình ảnh vào FormData
            files.forEach(file => {
                formData.append('images', file);
            });

            // Sử dụng API PATCH /api/product-details/{id}
            const response = await fetch(`http://localhost:3000/api/product-details/${detailId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Không cần set Content-Type khi dùng FormData
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Image upload failed (${response.status}): ${errorText}`);
                showToast(`Không thể tải lên hình ảnh: ${response.statusText}`, 'error');
                return false;
            }

            const result = await response.json();
            console.log('Images uploaded successfully:', result);
            return true;
        } catch (error) {
            console.error("Error uploading images:", error);
            showToast(`Lỗi tải lên hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
            return false;
        }
    };





    // Bổ sung chức năng cập nhật chi tiết sản phẩm vào hàm handleSubmit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!product) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
                router.push('/seller/signin');
                return;
            }

            // 1. Cập nhật thông tin cơ bản và chi tiết sản phẩm
            const updatedDetails = product.details.map(detail => {
                return {
                    id: detail.id,
                    size: detail.size,
                    type: detail.type,
                    values: detail.values,
                    quantities: detail.quantities,
                    isActive: detail.isActive
                };
            }).filter(detail => !variantsToDelete.includes(detail.id));

            const newDetailsData = newVariants.map(variant => ({
                size: variant.size,
                type: variant.type,
                values: variant.values,
                quantities: variant.quantities,
                isActive: variant.isActive,
                price: {
                    base_price: variant.price.base_price,
                    discount_price: variant.price.discount_price
                }
            }));

            const priceUpdates = Object.entries(detailPrices).map(([detailId, price]) => ({
                product_detail_id: parseInt(detailId),
                base_price: price.base_price,
                discount_price: price.discount_price
            }));

            const updateData = {
                name: formData.name,
                description: formData.description,
                video: formData.video,
                category_id: formData.category_id,
                details: updatedDetails,
                new_details: newDetailsData,
                prices: priceUpdates,
                variants_to_delete: variantsToDelete,
                keep_existing_images: true
            };

            console.log('Sending update data:', updateData);

            // Lưu sản phẩm chính trước
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Update failed (${response.status}): ${errorText}`);
                throw new Error(`Không thể cập nhật sản phẩm: ${response.statusText}`);
            }

            const updatedProduct = await response.json();
            console.log('Product updated successfully:', updatedProduct);

            // 2. Cập nhật chi tiết từng phiên bản sản phẩm
            showToast('Đã cập nhật sản phẩm, đang cập nhật chi tiết...', 'info');

            // Lấy danh sách chi tiết cần cập nhật (không bao gồm các chi tiết đã xóa)
            const detailsToUpdate = product.details.filter(detail => !variantsToDelete.includes(detail.id));

            // Promise.all để cập nhật song song các chi tiết
            const detailUpdatePromises = detailsToUpdate.map(async (detail) => {
                try {
                    // Chuẩn bị dữ liệu cập nhật cho chi tiết
                    const detailData: any = {
                        size: detail.size,
                        type: detail.type,
                        values: detail.values,
                        quantities: detail.quantities,
                        isActive: detail.isActive
                    };

                    // Thêm thông tin giá nếu có
                    if (detailPrices[detail.id]) {
                        detailData.base_price = detailPrices[detail.id].base_price;
                        if (detailPrices[detail.id].discount_price !== null &&
                            detailPrices[detail.id].discount_price !== undefined) {
                            detailData.discount_price = detailPrices[detail.id].discount_price;
                        }
                    }

                    console.log(`Updating product detail ${detail.id} with:`, detailData);

                    // Gửi request cập nhật chi tiết
                    const detailResponse = await fetch(`http://localhost:3000/api/product-details/${detail.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(detailData)
                    });

                    if (!detailResponse.ok) {
                        const errorText = await detailResponse.text();
                        console.error(`Detail update failed for ID ${detail.id} (${detailResponse.status}): ${errorText}`);
                        throw new Error(`Không thể cập nhật chi tiết sản phẩm ID ${detail.id}: ${detailResponse.statusText}`);
                    }

                    const updatedDetail = await detailResponse.json();
                    console.log(`Product detail ${detail.id} updated successfully:`, updatedDetail);
                    return true;
                } catch (error) {
                    console.error(`Error updating detail ${detail.id}:`, error);
                    return false;
                }
            });

            // Chờ tất cả các chi tiết được cập nhật
            const detailResults = await Promise.all(detailUpdatePromises);

            // Kiểm tra kết quả cập nhật chi tiết
            const allDetailsUpdated = detailResults.every(result => result === true);
            if (!allDetailsUpdated) {
                showToast('Một số chi tiết sản phẩm không được cập nhật đầy đủ', 'info');
            }

            // 3. Tải lên hình ảnh cho sản phẩm nếu có
            if (productImages.length > 0) {
                await uploadProductImages();
            }

            // 4. Tải lên hình ảnh cho các chi tiết sản phẩm hiện có
            const variantImagePromises = Object.entries(variantImageUploads).map(async ([detailId, files]) => {
                if (files.length > 0) {
                    return uploadDetailImages(parseInt(detailId), files);
                }
                return true;
            });

            // Chờ tất cả các hình ảnh chi tiết được tải lên
            await Promise.all(variantImagePromises);

            showToast('Cập nhật sản phẩm và chi tiết thành công', 'success');

            // Tải lại thông tin sản phẩm để hiển thị chính xác
            await refetchProductDetails();

            // Chuyển hướng sau khi hoàn thành
            setTimeout(() => {
                router.push(`/seller/products/${productId}`);
            }, 1500);

        } catch (err) {
            console.error("Error updating product:", err);
            setError(err instanceof Error ? err.message : 'Không thể cập nhật sản phẩm');
            showToast(err instanceof Error ? err.message : 'Không thể cập nhật sản phẩm', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Thêm hàm để tải lên hình ảnh cho sản phẩm chính
    const uploadProductImages = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return false;

            const formData = new FormData();

            productImages.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Product image upload failed (${response.status}): ${errorText}`);
                showToast(`Không thể tải lên hình ảnh sản phẩm: ${response.statusText}`, 'error');
                return false;
            }

            setProductImages([]); // Xóa danh sách hình ảnh sau khi tải lên thành công
            return true;
        } catch (error) {
            console.error("Error uploading product images:", error);
            showToast(`Lỗi tải lên hình ảnh sản phẩm: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
            return false;
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading && !product) {
        return (
            <div className='flex h-screen bg-gray-50'>
                <MenuSideBar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 p-6 overflow-auto'>
                        <div className="animate-pulse">
                            <div className="h-8 w-2/3 bg-gray-200 rounded mb-6"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4 w-1/4"></div>
                            <div className="h-24 bg-gray-200 rounded mb-6"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4 w-1/3"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4 w-1/2"></div>
                        </div>
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
                        <div className="bg-red-50 p-4 rounded-lg text-red-800 mb-6">
                            <h2 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h2>
                            <p>{error}</p>
                            <button
                                onClick={() => router.push(`/seller/products/${productId}`)}
                                className="mt-4 flex items-center text-red-700 hover:text-red-900"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Quay lại thông tin sản phẩm
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className='flex h-screen bg-gray-50'>
                <MenuSideBar />
                <div className='flex-1 flex flex-col overflow-hidden'>
                    <Header />
                    <main className='flex-1 p-6 overflow-auto'>
                        <div className="text-center py-12">
                            <h2 className="text-xl font-medium text-gray-700">Không tìm thấy sản phẩm</h2>
                            <button
                                onClick={() => router.push('/seller/products')}
                                className="mt-4 inline-flex items-center text-amber-600 hover:text-amber-800"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Quay lại danh sách sản phẩm
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
                <Header />
                <main className='flex-1 p-6 overflow-auto'>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <button
                                onClick={() => router.push(`/seller/products/${productId}`)}
                                className="inline-flex items-center text-gray-600 hover:text-amber-600"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Quay lại thông tin sản phẩm
                            </button>
                            <h1 className="text-2xl font-bold mt-2">Chỉnh sửa sản phẩm</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            <div
                                className="px-6 py-4 flex justify-between items-center cursor-pointer border-b"
                                onClick={() => toggleSection('basic')}
                            >
                                <h3 className="font-medium text-gray-800">Thông tin cơ bản</h3>
                                <div>
                                    {expandedSection.includes('basic') ? (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {expandedSection.includes('basic') && (
                                <div className="p-6 space-y-4">

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            tên sản phẩm
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả sản phẩm
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                                            Video (URL)
                                        </label>
                                        <input
                                            type="text"
                                            id="video"
                                            name="video"
                                            value={formData.video}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Danh mục <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <button
                                                id="category-dropdown-button"
                                                type="button"
                                                onClick={handleCategoryDropdownToggle}
                                                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white flex justify-between items-center"
                                            >
                                                <span className={formData.category_id ? 'text-gray-900' : 'text-gray-400'}>
                                                    {categories.find(c => c.id === formData.category_id)?.name || 'Chọn danh mục sản phẩm'}
                                                </span>
                                                {isCategoriesLoading ? (
                                                    <ArrowPathIcon className="h-4 w-4 text-amber-500 animate-spin" />
                                                ) : (
                                                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                                )}
                                            </button>

                                            {isCategoryDropdownOpen && typeof window !== 'undefined' && createPortal(
                                                <div className="fixed inset-0 z-50">
                                                    <div
                                                        className="absolute inset-0"
                                                        onClick={() => setIsCategoryDropdownOpen(false)}
                                                    ></div>
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: `${dropdownPosition.top}px`,
                                                            left: `${dropdownPosition.left}px`,
                                                            width: `${dropdownPosition.width}px`,
                                                            zIndex: 60,
                                                            maxHeight: '240px',
                                                        }}
                                                        className="bg-white shadow-xl rounded-md border border-gray-200 py-1 overflow-auto"
                                                    >
                                                        {categories.length === 0 ? (
                                                            <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                                                                {isCategoriesLoading ? (
                                                                    <>
                                                                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                                                                        Đang tải danh mục...
                                                                    </>
                                                                ) : (
                                                                    categoryError || 'Không có danh mục nào'
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-60 overflow-y-auto">
                                                                {categories.map((category) => (
                                                                    <button
                                                                        key={category.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleCategorySelect(category);
                                                                            setIsCategoryDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${formData.category_id === category.id
                                                                            ? 'bg-amber-50 text-amber-700'
                                                                            : 'text-gray-700'
                                                                            }`}
                                                                    >
                                                                        {category.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>,
                                                document.body
                                            )}
                                        </div>
                                        {categoryError && (
                                            <p className="mt-1 text-xs text-red-500">{categoryError}</p>
                                        )}
                                        {formData.category_id && categories.length > 0 && !categoryError && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Danh mục hiện tại: <span className="font-medium text-amber-700">{categories.find(c => c.id === formData.category_id)?.name || (isCategoryDetailLoading ? 'Đang tải...' : 'Không tìm thấy')}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {expandedSection.includes('images') && (
                                <div className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hình ảnh hiện tại
                                        </label>

                                        {product.images && product.images.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {product.images.map((image, index) => {
                                                    console.log(`Rendering image ${index}:`, image);
                                                    return (
                                                        <div key={image.id || index} className="relative group">
                                                            <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                                                                <Image
                                                                    src={image.path}
                                                                    alt={`Product image ${index + 1}`}
                                                                    width={200}
                                                                    height={200}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        console.error(`Error loading image: ${image.path}`);
                                                                        e.currentTarget.src = "/placeholder-image.jpg";
                                                                    }}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeProductImage(image.id)}
                                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <XMarkIcon className="h-4 w-4 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 italic">Chưa có hình ảnh</div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thêm hình ảnh mới
                                        </label>

                                        <div className="mt-2 flex items-center">
                                            <label className="flex items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                <div className="space-y-1 text-center">
                                                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                                                    <div className="text-xs text-gray-500">
                                                        <span>Chọn ảnh</span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleProductImageUpload}
                                                />
                                            </label>
                                        </div>

                                        {productImages.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh sẽ tải lên:</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                                    {productImages.map((file, index) => (
                                                        <div key={index} className="relative group">
                                                            <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                                                                <Image
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`New product image ${index + 1}`}
                                                                    width={200}
                                                                    height={200}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <XMarkIcon className="h-4 w-4 text-gray-500" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>



                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            <div
                                className="px-6 py-4 flex justify-between items-center cursor-pointer border-b"
                                onClick={() => toggleSection('variants')}
                            >
                                <h3 className="font-medium text-gray-800">Phiên bản sản phẩm</h3>
                                <div>
                                    {expandedSection.includes('variants') ? (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                                    )}
                                </div>
                            </div>

                            {expandedSection.includes('variants') && (
                                <div className="p-6">
                                    {product.details && product.details.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="text-sm font-medium text-gray-700 mb-4">Phiên bản hiện tại</h4>

                                            <div className="space-y-6">
                                                {product.details.map((detail, index) => (
                                                    <div
                                                        key={detail.id}
                                                        className={`border rounded-md p-4 ${variantsToDelete.includes(detail.id) ? 'bg-red-50 border-red-200' : ''}`}
                                                    >
                                                        {variantsToDelete.includes(detail.id) ? (
                                                            <div className="mb-4 bg-red-100 text-red-800 p-3 rounded-md flex items-center">
                                                                <TrashIcon className="h-5 w-5 mr-2" />
                                                                <span>Phiên bản này sẽ bị xóa</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => restoreVariant(detail.id)}
                                                                    className="ml-auto text-red-800 hover:text-red-900 flex items-center"
                                                                >
                                                                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                                                                    <span>Khôi phục</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => markVariantForDeletion(detail.id)}
                                                                className="float-right text-gray-500 hover:text-red-600"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Kích thước
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.size}
                                                                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Loại
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.type}
                                                                    onChange={(e) => handleVariantChange(index, 'type', e.target.value)}
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá trị
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={detail.values}
                                                                    onChange={(e) => handleVariantChange(index, 'values', e.target.value)}
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Số lượng
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={detail.quantities}
                                                                    onChange={(e) => handleVariantChange(index, 'quantities', parseInt(e.target.value))}
                                                                    min="0"
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá cơ bản
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={detailPrices[detail.id]?.base_price || 0}
                                                                    onChange={(e) => handlePriceChange(detail.id, 'base_price', e.target.value)}
                                                                    min="0"
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá khuyến mãi
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={detailPrices[detail.id]?.discount_price || ''}
                                                                    onChange={(e) => handlePriceChange(detail.id, 'discount_price', e.target.value)}
                                                                    min="0"
                                                                    className={`w-full p-2 border rounded-md ${variantsToDelete.includes(detail.id) ? 'bg-red-50' : ''}`}
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mb-4">
                                                            <label className="inline-flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={detail.isActive}
                                                                    onChange={(e) => handleVariantChange(index, 'isActive', e.target.checked)}
                                                                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                                                                    disabled={variantsToDelete.includes(detail.id)}
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">Hiển thị</span>
                                                            </label>
                                                        </div>

                                                        <div className="mt-4">
                                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                                Hình ảnh phiên bản
                                                            </label>

                                                            {/* Hiển thị hình ảnh hiện có */}
                                                            {detail.images && detail.images.length > 0 && (
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                                                    {detail.images.map((image, imgIndex) => (
                                                                        <div key={image.id || imgIndex} className="relative group">
                                                                            <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                                                                                <Image
                                                                                    src={image.path}
                                                                                    alt={`Variant image ${imgIndex + 1}`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Input để tải lên hình ảnh mới */}
                                                            {!variantsToDelete.includes(detail.id) && (
                                                                <>
                                                                    <div className="mt-2">
                                                                        <label className="flex items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                                            <div className="space-y-1 text-center">
                                                                                <PhotoIcon className="mx-auto h-6 w-6 text-gray-400" />
                                                                                <div className="text-xs text-gray-500">
                                                                                    <span>Thêm ảnh</span>
                                                                                </div>
                                                                            </div>
                                                                            <input
                                                                                type="file"
                                                                                className="hidden"
                                                                                accept="image/*"
                                                                                multiple
                                                                                onChange={(e) => handleVariantImageUpload(detail.id, e)}
                                                                            />
                                                                        </label>
                                                                    </div>

                                                                    {/* Hiển thị hình ảnh đã chọn để tải lên */}
                                                                    {variantImageUploads[detail.id]?.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <h5 className="text-xs font-medium text-gray-700 mb-2">Sẽ tải lên:</h5>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                                {variantImageUploads[detail.id].map((file, imgIndex) => (
                                                                                    <div key={imgIndex} className="relative group">
                                                                                        <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                                                                                            <Image
                                                                                                src={URL.createObjectURL(file)}
                                                                                                alt={`New variant image ${imgIndex + 1}`}
                                                                                                width={100}
                                                                                                height={100}
                                                                                                className="w-full h-full object-cover"
                                                                                            />
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => removeVariantUploadImage(detail.id, imgIndex)}
                                                                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        >
                                                                                            <XMarkIcon className="h-3 w-3 text-gray-500" />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Nút cập nhật */}
                                                        {!variantsToDelete.includes(detail.id) && (
                                                            <div className="mt-4 border-t pt-4">
                                                                <div className="flex justify-end space-x-2">
                                                                    {variantImageUploads[detail.id]?.length > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={async () => {
                                                                                const success = await uploadDetailImages(detail.id, variantImageUploads[detail.id]);
                                                                                if (success) {
                                                                                    showToast('Đã tải lên hình ảnh cho phiên bản thành công', 'success');
                                                                                    setVariantImageUploads(prev => {
                                                                                        const updated = { ...prev };
                                                                                        delete updated[detail.id];
                                                                                        return updated;
                                                                                    });
                                                                                    await refetchProductDetails();
                                                                                }
                                                                            }}
                                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none"
                                                                        >
                                                                            Tải ảnh lên
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-medium text-gray-700">Thêm phiên bản mới</h4>
                                            <button
                                                type="button"
                                                onClick={addNewVariant}
                                                className="inline-flex items-center px-3 py-1.5 border border-amber-600 text-sm rounded-md text-amber-700 bg-white hover:bg-amber-50"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                Thêm phiên bản
                                            </button>
                                        </div>

                                        {newVariants.length > 0 && (
                                            <div className="space-y-6 mt-4">
                                                {newVariants.map((variant, index) => (
                                                    <div key={index} className="border rounded-md p-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewVariant(index)}
                                                            className="float-right text-gray-500 hover:text-red-600"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Kích thước
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.size}
                                                                    onChange={(e) => handleNewVariantChange(index, 'size', e.target.value)}
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Loại
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.type}
                                                                    onChange={(e) => handleNewVariantChange(index, 'type', e.target.value)}
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá trị
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.values}
                                                                    onChange={(e) => handleNewVariantChange(index, 'values', e.target.value)}
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Số lượng
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.quantities}
                                                                    onChange={(e) => handleNewVariantChange(index, 'quantities', parseInt(e.target.value))}
                                                                    min="0"
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá cơ bản
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.price.base_price}
                                                                    onChange={(e) => handleNewVariantChange(index, 'base_price', e.target.value)}
                                                                    min="0"
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Giá khuyến mãi
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.price.discount_price || ''}
                                                                    onChange={(e) => handleNewVariantChange(index, 'discount_price', e.target.value)}
                                                                    min="0"
                                                                    className="w-full p-2 border rounded-md"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mb-4">
                                                            <label className="inline-flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={variant.isActive}
                                                                    onChange={(e) => handleNewVariantChange(index, 'isActive', e.target.checked)}
                                                                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">Hiển thị</span>
                                                            </label>
                                                        </div>

                                                        <div className="mt-4">
                                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                                Hình ảnh phiên bản
                                                            </label>


                                                            {/* Thêm nút để tải lên hình ảnh cho phiên bản mới */}
                                                            <div className="mt-2">
                                                                <label className="flex items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                                                                    <div className="space-y-1 text-center">
                                                                        <PhotoIcon className="mx-auto h-6 w-6 text-gray-400" />
                                                                        <div className="text-xs text-gray-500">
                                                                            <span>Thêm ảnh</span>
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        multiple
                                                                        onChange={(e) => {
                                                                            // Xử lý tải lên hình ảnh cho phiên bản mới
                                                                            if (e.target.files && e.target.files.length > 0) {
                                                                                const filesArray = Array.from(e.target.files);
                                                                                setNewVariants(prev => {
                                                                                    const updated = [...prev];
                                                                                    updated[index] = {
                                                                                        ...updated[index],
                                                                                        images: [...updated[index].images, ...filesArray]
                                                                                    };
                                                                                    return updated;
                                                                                });
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>

                                                            {/* Hiển thị hình ảnh đã chọn để tải lên cho phiên bản mới */}
                                                            {variant.images.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h5 className="text-xs font-medium text-gray-700 mb-2">Sẽ tải lên:</h5>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                        {variant.images.map((file, imgIndex) => (
                                                                            <div key={imgIndex} className="relative group">
                                                                                <div className="aspect-square overflow-hidden rounded-md border border-gray-200">
                                                                                    <Image
                                                                                        src={URL.createObjectURL(file)}
                                                                                        alt={`New variant image ${imgIndex + 1}`}
                                                                                        width={100}
                                                                                        height={100}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        // Xử lý xóa hình ảnh đã tải lên cho phiên bản mới
                                                                                        setNewVariants(prev => {
                                                                                            const updated = [...prev];
                                                                                            const updatedImages = [...updated[index].images];
                                                                                            updatedImages.splice(imgIndex, 1);
                                                                                            updated[index] = {
                                                                                                ...updated[index],
                                                                                                images: updatedImages
                                                                                            };
                                                                                            return updated;
                                                                                        });
                                                                                    }}
                                                                                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    <XMarkIcon className="h-3 w-3 text-gray-500" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={() => router.push(`/seller/products/${productId}`)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang lưu...
                                    </div>
                                ) : (
                                    'Lưu thay đổi'
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>

            {
                toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(prev => ({ ...prev, show: false }))}
                        show={toast.show}
                    />
                )
            }
        </div >
    );
}