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
   PencilIcon,
   TrashIcon,
   EyeIcon,
   PlusIcon,
} from '@heroicons/react/24/outline';

// Định nghĩa các interface
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
   product?: Product; // Replace 'any' with the 'Product' interface
   isActive: boolean;
}

interface Price {
   id: number;
   base_price: number;
   discount_price: number;
   product_detail: {
      id: number;
      productId: number;
   };
   promotion_deadline?: string; // Add this field for promotion deadline
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
   category_id?: number;
   details?: ProductDetail[];
   pricing?: Price[];
   categories?: Category[];
}

// Format price helper function
const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(price);
};

// Update the helper function to check if promotion is still active
const isPromotionActive = (deadline?: string | null): boolean => {
   if (!deadline) return true; // If no deadline set (undefined or null), promotion is always active
   const deadlineDate = new Date(deadline);
   const now = new Date();
   return deadlineDate > now;
};

// Skeleton loader component
const ProductDetailSkeleton = () => {
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
         <div className='h-12 bg-gray-200 rounded-lg mt-8 mb-6'></div>
         <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className='h-32 bg-gray-100 rounded-lg'></div>
            ))}
         </div>
      </div>
   );
};

// Component hiển thị hình ảnh chi tiết sản phẩm
const DetailImagesPreview = ({ detailId, detailImagesCache }: { detailId: number; detailImagesCache: Record<number, Image[]> }) => {
   const images = detailImagesCache[detailId] || [];

   if (images.length === 0) {
      return (
         <div className="flex justify-center items-center h-20 w-20 bg-gray-100 rounded border">
            <svg
               xmlns="http://www.w3.org/2000/svg"
               className="h-6 w-6 text-gray-400"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
               />
            </svg>
         </div>
      );
   }

   return (
      <div className="flex space-x-2 overflow-x-auto">
         {images.map((image, index) => (
            <div
               key={image.id}
               className="relative h-20 w-20 flex-shrink-0 border rounded overflow-hidden"
            >
               <Image
                  src={image.path}
                  alt={`Chi tiết sản phẩm ${detailId}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = '/placeholder.png';
                  }}
               />
               {images.length > 1 && index === 0 && (
                  <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tl">
                     +{images.length - 1}
                  </div>
               )}
            </div>
         ))}
      </div>
   );
};

export default function ProductDetail() {
   const [product, setProduct] = useState<Product | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [expandedSection, setExpandedSection] = useState<string>('details');
   const [detailImagesCache, setDetailImagesCache] = useState<Record<number, Image[]>>({});
   const [detailPrices, setDetailPrices] = useState<
      Record<
         number,
         {
            base_price: number;
            discount_price: number | null;
            promotion_deadline?: string | null;
         }
      >
   >({});
   const [detailLoading, setDetailLoading] = useState<Record<number, boolean>>({});
   const [categoryName, setCategoryName] = useState<string>('');
   const [activeImageIndex, setActiveImageIndex] = useState(0);
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   const params = useParams();
   const router = useRouter();
   const productId = params.id as string;

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

   // Fetch product details
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

            const response = await fetch(`http://68.183.226.198:3000/api/products/${productId}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error(`Không thể lấy thông tin sản phẩm: ${response.statusText}`);
            }

            const data = await response.json();

            // Normalize the product data
            const normalizedProduct = {
               ...data,
               images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
               details: data.details || [],
               pricing: data.pricing || [],
               categories: data.categories || [],
            };

            setProduct(normalizedProduct);

            // Fetch category name if category_id exists
            if (normalizedProduct.category_id) {
               fetchCategoryName(normalizedProduct.category_id);
            } else if (normalizedProduct.categories && normalizedProduct.categories.length > 0) {
               setCategoryName(normalizedProduct.categories[0].name);
            }

            // If product details exist, fetch their prices and images
            if (normalizedProduct.details && normalizedProduct.details.length > 0) {
               fetchProductDetailPrices(normalizedProduct.details);

               // Tải hình ảnh cho tất cả chi tiết sản phẩm
               for (const detail of normalizedProduct.details) {
                  if (detail.isActive) {
                     await fetchDetailImages(detail.id);
                  }
               }
            }
         } catch (err) {
            console.error('Error fetching product details:', err);
            setError(err instanceof Error ? err.message : 'Không thể tải thông tin sản phẩm');
            showToast('Không thể tải thông tin sản phẩm', 'error');
         } finally {
            setLoading(false);
         }
      };

      fetchProductDetail();
   }, [productId, router]);

   // Fetch category name
   const fetchCategoryName = async (categoryId: number) => {
      try {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) return;

         const response = await fetch(`http://68.183.226.198:3000/api/categories/${categoryId}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (response.ok) {
            const category = await response.json();
            setCategoryName(category.name);
         }
      } catch (error) {
         console.error('Error fetching category name:', error);
      }
   };

   // Fetch prices for product details
   const fetchProductDetailPrices = async (details: ProductDetail[]) => {
      try {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) return;

         const allDetailsLoading: Record<number, boolean> = {};
         details.forEach((detail) => {
            allDetailsLoading[detail.id] = true;
         });
         setDetailLoading(allDetailsLoading);

         // Fetch prices for each product detail
         const pricePromises = details.map(async (detail) => {
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
                     return {
                        detailId: detail.id,
                        base_price: parseFloat(priceData[0].base_price),
                        discount_price: priceData[0].discount_price
                           ? parseFloat(priceData[0].discount_price)
                           : null,
                        promotion_deadline: priceData[0].end_date || null, // Map end_date to promotion_deadline
                     };
                  }
               }
               return {
                  detailId: detail.id,
                  base_price: 0,
                  discount_price: null,
                  promotion_deadline: null,
               };
            } catch {
               return {
                  detailId: detail.id,
                  base_price: 0,
                  discount_price: null,
                  promotion_deadline: null,
               };
            }
         });

         const prices = await Promise.all(pricePromises);

         // Update state with fetched prices
         const pricesObj: Record<
            number,
            {
               base_price: number;
               discount_price: number | null;
               promotion_deadline?: string | null;
            }
         > = {};
         prices.forEach((price) => {
            pricesObj[price.detailId] = {
               base_price: price.base_price,
               discount_price: price.discount_price,
               promotion_deadline: price.promotion_deadline,
            };
         });

         setDetailPrices(pricesObj);

         // Reset loading state
         const allDetailsNotLoading: Record<number, boolean> = {};
         details.forEach((detail) => {
            allDetailsNotLoading[detail.id] = false;
         });
         setDetailLoading(allDetailsNotLoading);
      } catch (error) {
         console.error('Error fetching product detail prices:', error);
         // Reset loading state on error
         const allDetailsNotLoading: Record<number, boolean> = {};
         details.forEach((detail) => {
            allDetailsNotLoading[detail.id] = false;
         });
         setDetailLoading(allDetailsNotLoading);
      }
   };

   // Thêm hàm để tải hình ảnh cho chi tiết sản phẩm
   const fetchDetailImages = async (detailId: number) => {
      console.log('Đang tải hình ảnh cho chi tiết ID:', detailId);

      try {
         // Bỏ qua nếu đã có trong cache
         if (detailImagesCache[detailId]?.length > 0) {
            console.log('Đã có hình ảnh trong cache cho chi tiết ID:', detailId);
            return detailImagesCache[detailId];
         }

         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            console.log('Không tìm thấy token xác thực');
            return null;
         }

         const response = await fetch(
            `http://68.183.226.198:3000/api/product-details/${detailId}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         console.log('Phản hồi API chi tiết sản phẩm:', response.status);

         if (!response.ok) {
            console.error(`Không thể tải hình ảnh chi tiết: ${response.status}`);
            return null;
         }

         const detailData = await response.json();
         console.log('Dữ liệu chi tiết sản phẩm:', detailData);

         if (detailData && detailData.images && detailData.images.length > 0) {
            console.log(`Đã tìm thấy ${detailData.images.length} hình ảnh cho chi tiết ID ${detailId}`);

            // Cập nhật cache
            setDetailImagesCache(prev => ({
               ...prev,
               [detailId]: detailData.images
            }));

            return detailData.images;
         } else {
            console.log('Không tìm thấy hình ảnh cho chi tiết sản phẩm');
            return [];
         }
      } catch (error) {
         console.error('Lỗi khi tải hình ảnh chi tiết:', error);
         return null;
      }
   };

   // Navigate to edit product page
   const handleEditProduct = () => {
      router.push(`/seller/products/edit/${productId}`);
   };

   // Handle delete product
   const handleDeleteProduct = () => {
      setIsDeleteConfirmOpen(true);
   };

   // Confirm delete product
   const confirmDeleteProduct = async () => {
      try {
         setLoading(true);
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');

         if (!token) {
            showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
            router.push('/seller/signin');
            return;
         }

         const response = await fetch(`http://68.183.226.198:3000/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         if (response.ok) {
            showToast('Sản phẩm đã được xóa thành công', 'success');
            // Navigate back to products page after successful deletion
            setTimeout(() => {
               router.push('/seller/products');
            }, 1500);
         } else {
            let errorMessage = 'Không thể xóa sản phẩm';

            try {
               const errorData = await response.json();
               errorMessage = errorData.message || errorMessage;
            } catch {
               errorMessage = `Không thể xóa sản phẩm (${response.status}: ${response.statusText})`;
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

   // View product in store front
   const viewProductInStore = () => {
      router.push(`/user/products/${productId}`);
   };

   if (loading && !product) {
      return (
         <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
               <Header />
               <main className='flex-1 p-6 overflow-auto'>
                  <ProductDetailSkeleton />
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
                        onClick={() => router.push('/seller/products')}
                        className='mt-4 flex items-center text-red-700 hover:text-red-900'
                     >
                        <ArrowLeftIcon className='h-4 w-4 mr-2' />
                        Quay lại danh sách sản phẩm
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
                  <div className='text-center py-12'>
                     <h2 className='text-xl font-medium text-gray-700'>Không tìm thấy sản phẩm</h2>
                     <button
                        onClick={() => router.push('/seller/products')}
                        className='mt-4 inline-flex items-center text-amber-600 hover:text-amber-800'
                     >
                        <ArrowLeftIcon className='h-4 w-4 mr-2' />
                        Quay lại danh sách sản phẩm
                     </button>
                  </div>
               </main>
            </div>
         </div>
      );
   }

   // Calculate product stats
   const totalVariants = product.details?.length || 0;
   const activeVariants = product.details?.filter((d) => d.isActive)?.length || 0;
   const totalStock =
      product.details?.reduce((sum, detail) => sum + (detail.quantities || 0), 0) || 0;

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSideBar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 p-6 overflow-auto'>
               {/* Back button and actions */}
               <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
                  <button
                     onClick={() => router.push('/seller/products')}
                     className='inline-flex items-center text-gray-600 hover:text-amber-600'
                  >
                     <ArrowLeftIcon className='h-4 w-4 mr-2' />
                     Quay lại danh sách sản phẩm
                  </button>

                  <div className='flex gap-2'>
                     <button
                        onClick={viewProductInStore}
                        className='inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50'
                     >
                        <EyeIcon className='h-4 w-4 mr-1.5' />
                        Xem trang sản phẩm
                     </button>
                     <button
                        onClick={handleEditProduct}
                        className='inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700'
                     >
                        <PencilIcon className='h-4 w-4 mr-1.5' />
                        Chỉnh sửa
                     </button>
                     <button
                        onClick={handleDeleteProduct}
                        className='inline-flex items-center px-3 py-1.5 border border-red-600 text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700'
                     >
                        <TrashIcon className='h-4 w-4 mr-1.5' />
                        Xóa
                     </button>
                  </div>
               </div>

               {/* Product overview card */}
               <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-6'>
                  <div className='p-6'>
                     <div className='flex flex-col md:flex-row gap-8'>
                        {/* Image gallery */}
                        <div className='w-full md:w-1/3'>
                           <div className='bg-gray-100 rounded-lg mb-4 aspect-square overflow-hidden'>
                              {product.images &&
                                 Array.isArray(product.images) &&
                                 product.images.length > 0 ? (
                                 <Image
                                    src={product.images[activeImageIndex].path}
                                    alt={product.name}
                                    width={500}
                                    height={500}
                                    className='object-cover w-full h-full'
                                    onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.src = '/placeholder.png';
                                    }}
                                 />
                              ) : product.images && !Array.isArray(product.images) ? (
                                 <Image
                                    src={product.images.path}
                                    alt={product.name}
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
                           {product.images &&
                              Array.isArray(product.images) &&
                              product.images.length > 1 && (
                                 <div className='flex space-x-2 overflow-x-auto pb-2'>
                                    {product.images.map((image, index) => (
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
                                             alt={`${product.name} - ảnh ${index + 1}`}
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

                        {/* Product info */}
                        <div className='w-full md:w-2/3'>
                           <h1 className='text-2xl font-bold text-gray-800 mb-2'>{product.name}</h1>

                           <div className='text-sm text-gray-500 flex items-center gap-3 mb-4'>
                              <span>ID: #{product.id}</span>
                              <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                              <span>Danh mục: {categoryName || 'Chưa phân loại'}</span>
                           </div>

                           {/* Stats cards */}
                           <div className='grid grid-cols-3 gap-4 mb-6'>
                              <div className='bg-amber-50 p-4 rounded-lg'>
                                 <p className='text-amber-800 font-medium'>{totalVariants}</p>
                                 <p className='text-amber-600 text-sm'>Tổng số phiên bản</p>
                              </div>

                              <div className='bg-green-50 p-4 rounded-lg'>
                                 <p className='text-green-800 font-medium'>{activeVariants}</p>
                                 <p className='text-green-600 text-sm'>Phiên bản đang bán</p>
                              </div>

                              <div className='bg-blue-50 p-4 rounded-lg'>
                                 <p className='text-blue-800 font-medium'>{totalStock}</p>
                                 <p className='text-blue-600 text-sm'>Tổng số lượng</p>
                              </div>
                           </div>

                           {/* Description */}
                           <div>
                              <h3 className='text-sm font-medium text-gray-700 mb-2'>
                                 Mô tả sản phẩm
                              </h3>
                              <div className='text-gray-600 text-sm prose prose-sm max-w-none'>
                                 {product.description ? (
                                    <p>{product.description}</p>
                                 ) : (
                                    <p className='text-gray-400 italic'>Chưa có mô tả</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-6'>
                  <div
                     className='px-6 py-4 flex justify-between items-center cursor-pointer border-b'
                     onClick={() => toggleSection('details')}
                  >
                     <h3 className='font-medium text-gray-800'>Chi tiết phiên bản sản phẩm</h3>
                     <div>
                        {expandedSection === 'details' ? (
                           <ChevronDownIcon className='h-5 w-5 text-gray-500' />
                        ) : (
                           <ChevronRightIcon className='h-5 w-5 text-gray-500' />
                        )}
                     </div>
                  </div>

                  {expandedSection === 'details' && (
                     <div className='px-6 py-4'>
                        {product.details && product.details.length > 0 ? (
                           <div>
                              <div className='overflow-x-auto'>
                                 <table className='min-w-full divide-y divide-gray-200'>
                                    <thead className='bg-gray-50'>
                                       <tr>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Hình ảnh
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Phiên bản
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Kích thước
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Loại
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Giá gốc
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Giá bán
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Kho
                                          </th>
                                          <th
                                             scope='col'
                                             className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                          >
                                             Trạng thái
                                          </th>
                                       </tr>
                                    </thead>
                                    <tbody className='bg-white divide-y divide-gray-200'>
                                       {product.details.map((detail, index) => {
                                          const priceInfo = detailPrices[detail.id] || {
                                             base_price: 0,
                                             discount_price: null,
                                          };
                                          const isLoading = detailLoading[detail.id] || false;

                                          return (
                                             <tr
                                                key={detail.id}
                                                className={
                                                   index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                }
                                             >
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                   <DetailImagesPreview detailId={detail.id} detailImagesCache={detailImagesCache} />
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                                   {detail.values || `Phiên bản ${index + 1}`}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                   {detail.size || '—'}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                   {detail.type || '—'}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                   {isLoading ? (
                                                      <div className='h-4 w-16 bg-gray-200 rounded animate-pulse'></div>
                                                   ) : (
                                                      formatPrice(priceInfo.base_price)
                                                   )}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                   {isLoading ? (
                                                      <div className='h-4 w-16 bg-gray-200 rounded animate-pulse'></div>
                                                   ) : priceInfo.discount_price &&
                                                      isPromotionActive(
                                                         priceInfo.promotion_deadline,
                                                      ) ? (
                                                      <div>
                                                         <span className='font-medium text-red-600'>
                                                            {formatPrice(
                                                               priceInfo.base_price *
                                                               (1 -
                                                                  priceInfo.discount_price /
                                                                  100),
                                                            )}
                                                         </span>
                                                         <span className='ml-2 text-xs line-through text-gray-400'>
                                                            {formatPrice(priceInfo.base_price)}
                                                         </span>
                                                         <span className='ml-1 text-xs text-red-500'>
                                                            (-{priceInfo.discount_price}%)
                                                         </span>

                                                         {priceInfo.promotion_deadline && (
                                                            <div className='mt-1 text-xs'>
                                                               <span className='text-green-600'>
                                                                  KM đến:{' '}
                                                                  {new Date(
                                                                     priceInfo.promotion_deadline,
                                                                  ).toLocaleDateString('vi-VN')}
                                                               </span>
                                                            </div>
                                                         )}
                                                      </div>
                                                   ) : priceInfo.discount_price &&
                                                      !isPromotionActive(
                                                         priceInfo.promotion_deadline,
                                                      ) ? (
                                                      <div>
                                                         <span className='font-medium text-gray-900'>
                                                            {formatPrice(priceInfo.base_price)}
                                                         </span>

                                                         {priceInfo.promotion_deadline && (
                                                            <div className='mt-1 text-xs'>
                                                               <span className='text-gray-500'>
                                                                  KM đã hết hạn (
                                                                  {new Date(
                                                                     priceInfo.promotion_deadline,
                                                                  ).toLocaleDateString('vi-VN')}
                                                                  )
                                                               </span>
                                                            </div>
                                                         )}
                                                      </div>
                                                   ) : (
                                                      formatPrice(priceInfo.base_price)
                                                   )}
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                   <span
                                                      className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full
                                  ${detail.quantities > 10
                                                            ? 'bg-green-100 text-green-800'
                                                            : detail.quantities > 0
                                                               ? 'bg-yellow-100 text-yellow-800'
                                                               : 'bg-red-100 text-red-800'
                                                         }
                                `}
                                                   >
                                                      {detail.quantities} sản phẩm
                                                   </span>
                                                </td>
                                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                   <span
                                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full
                                  ${detail.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                         }
                                `}
                                                   >
                                                      {detail.isActive ? 'Đang bán' : 'Tạm ngừng'}
                                                   </span>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        ) : (
                           <div className='bg-amber-50 p-4 rounded-lg text-center'>
                              <p className='text-amber-800'>Sản phẩm này chưa có phiên bản nào.</p>
                              <button
                                 onClick={handleEditProduct}
                                 className='mt-2 inline-flex items-center text-amber-700 hover:text-amber-900'
                              >
                                 <PlusIcon className='h-4 w-4 mr-1.5' />
                                 Thêm phiên bản mới
                              </button>
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
                              Xác nhận xóa sản phẩm
                           </h3>
                           <p className='font-medium text-gray-800 mt-1'>{product.name}</p>
                           <p className='text-sm text-gray-500 mt-2'>
                              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn
                              tác và sẽ xóa tất cả phiên bản, giá và thông tin liên quan.
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
