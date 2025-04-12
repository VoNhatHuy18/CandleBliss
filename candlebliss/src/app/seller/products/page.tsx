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

// Format price helper function
const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(price);
};

// Thêm hàm tính giá sau khi đã giảm
const calculateDiscountedPrice = (basePrice: number, discountPercentage: number | null): number => {
   if (!basePrice || !discountPercentage || discountPercentage <= 0) return basePrice;
   // Tính giá sau khuyến mãi từ phần trăm
   const discountAmount = (basePrice * discountPercentage) / 100;
   return basePrice - discountAmount;
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

// Badge Component
const Badge = ({
   count,
   variant = 'default',
}: {
   count: number;
   variant?: 'default' | 'success' | 'warning' | 'danger';
}) => {
   const colors = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-800',
   };

   return (
      <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${colors[variant]}`}>{count}</span>
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

// ProductTable Component
const ProductTable = ({
   products,
   loading,
   fetchAllProductData,
   handleEditProduct,
   handleDeleteProduct,
   getCategoryNameById,
}: {
   products: ProductViewModel[];
   loading: boolean;
   fetchAllProductData: () => Promise<void>;
   handleEditProduct: (productId: number) => void;
   handleDeleteProduct: (productId: number) => void;
   getCategoryNameById: (categoryId: number | undefined) => Promise<string>;
   showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) => {
   const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
   const [detailPrices, setDetailPrices] = useState<
      Record<
         number,
         {
            base_price: number;
            discount_price: number | null;
            end_date: string | null;
         }
      >
   >({});
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

   // Thêm hàm định dạng ngày
   const formatDate = (dateString: string | null): string => {
      if (!dateString) return '—';

      try {
         const date = new Date(dateString);
         return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
         }).format(date);
      } catch {
         return dateString || '—';
      }
   };

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
                        end_date: priceData[0].end_date || null, // Thêm thông tin end_date
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

   // Thêm hàm kiểm tra khuyến mãi hết hạn
   const isPromotionExpired = (endDate: string | null): boolean => {
      if (!endDate) return false;

      try {
         const now = new Date();
         const promotionEndDate = new Date(endDate);
         return now > promotionEndDate;
      } catch {
         return false;
      }
   };

   return (
      <div className='bg-white rounded-lg shadow overflow-hidden'>
         {/* Table Header with search and actions */}
         <div className='border-b border-gray-200 px-6 py-4'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
               <div className='flex-1 w-full md:w-auto md:max-w-md relative'>
                  <div className='relative flex '>
                     <input
                        type='text'
                        placeholder='Tìm sản phẩm theo tên, ID, danh mục...'
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
                        className='p-2 text-gray-500 hover:text-amber-600 rounded-lg  transition-colors pl-5'
                        title='Làm mới'
                     >
                        <ArrowPathIcon className='h-5 w-5' />
                     </button>
                  </div>
                  {searchTerm && (
                     <div className='absolute mt-1 text-xs text-gray-500'>
                        Tìm thấy {filteredProducts.length} kết quả
                     </div>
                  )}
               </div>

               <div className='flex items-center space-x-2'>
                  <button
                     onClick={() => router.push('/seller/products/createproduct/step1')}
                     className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 shadow-sm'
                  >
                     <PlusIcon className='h-4 w-4 mr-1.5' />
                     Thêm sản phẩm
                  </button>
               </div>
            </div>
         </div>

         {loading ? (
            <div className='p-6'>
               <TableSkeleton />
            </div>
         ) : filteredProducts.length === 0 ? (
            searchTerm ? (
               <div className='p-10 text-center'>
                  <p className='text-gray-500'>
                     Không tìm thấy sản phẩm phù hợp với từ khóa: {searchTerm}
                  </p>
                  <button
                     onClick={() => setSearchTerm('')}
                     className='mt-2 text-amber-600 hover:text-amber-800 font-medium'
                  >
                     Xóa từ khóa
                  </button>
               </div>
            ) : (
               <EmptyState
                  message='Chưa có sản phẩm nào'
                  actionLabel='Thêm sản phẩm đầu tiên'
                  onAction={() => router.push('/seller/products/createproduct/step1')}
               />
            )
         ) : (
            <div>
               {/* Header */}
               <div className='hidden md:grid grid-cols-6 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <div className='col-span-2'>Sản phẩm</div>
                  <div>Mã sản phẩm</div>
                  <div>Số lượng phiên bản</div>
                  <div>Trạng thái</div>
                  <div className='text-right'>Thao tác</div>
               </div>

               {/* Product rows */}
               {filteredProducts.map((product) => {
                  const totalVariants = product.details?.length || 0;
                  const activeVariants = product.details?.filter((d) => d.isActive)?.length || 0;
                  const isExpanded = expandedProduct === product.id;
                  const isDetailLoading = detailLoading[product.id] || false;

                  return (
                     <div
                        key={product.id}
                        className='border-b last:border-b-0 transition hover:bg-gray-50/50'
                     >
                        {/* Main product row */}
                        <div className='grid grid-cols-1 md:grid-cols-6 px-6 py-4'>
                           {/* Mobile view */}
                           <div className='md:hidden flex justify-between items-center mb-3'>
                              <div className='flex items-center'>
                                 <button
                                    onClick={() => toggleProductExpansion(product.id)}
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
                                 <div className='h-10 w-10 bg-gray-200 rounded-md overflow-hidden'>
                                    {product.images && product.images.length > 0 ? (
                                       <Image
                                          src={product.images[0].path}
                                          alt={product.name}
                                          width={40}
                                          height={40}
                                          className='object-cover h-full w-full'
                                          onError={(e) => {
                                             const target = e.target as HTMLImageElement;
                                             target.src = '/placeholder.png';
                                          }}
                                       />
                                    ) : (
                                       <div className='flex items-center justify-center h-full w-full text-gray-400'>
                                          <PlusIcon className='h-5 w-5' />
                                       </div>
                                    )}
                                 </div>
                                 <div className='ml-3'>
                                    <p className='text-sm font-medium text-gray-800'>
                                       {product.name}
                                    </p>
                                    <p className='text-xs text-gray-500 mt-0.5'>#{product.id}</p>
                                 </div>
                              </div>
                              <div className='flex space-x-2'>
                                 <button
                                    onClick={() => handleEditProduct(product.id)}
                                    className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded'
                                    title='Chỉnh sửa'
                                 >
                                    <PencilIcon className='h-4 w-4' />
                                 </button>
                                 <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                    title='Xóa'
                                 >
                                    <TrashIcon className='h-4 w-4' />
                                 </button>
                              </div>
                           </div>

                           <div className='col-span-2 flex items-center'>
                              <button
                                 onClick={() => toggleProductExpansion(product.id)}
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
                                    {product.images && product.images.length > 0 ? (
                                       <Image
                                          src={product.images[0].path}
                                          alt={product.name}
                                          width={48}
                                          height={48}
                                          className='object-cover h-full w-full'
                                          onError={(e) => {
                                             const target = e.target as HTMLImageElement;
                                             target.src = '/placeholder.png';
                                          }}
                                       />
                                    ) : (
                                       <div className='flex items-center justify-center h-full w-full text-gray-400'>
                                          <PlusIcon className='h-5 w-5' />
                                       </div>
                                    )}
                                 </div>
                                 <div className='truncate'>
                                    <p className='text-sm font-medium text-gray-800 truncate'>
                                       {product.name}
                                    </p>
                                    <p className='text-xs text-gray-500 mt-1 truncate'>
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

                           <div className='hidden md:flex items-center'>
                              <span className='text-sm text-gray-700'>#{product.id}</span>
                           </div>

                           <div className='hidden md:flex items-center'>
                              <div className='text-sm text-gray-700'>
                                 {totalVariants > 0 && (
                                    <Badge
                                       count={activeVariants}
                                       variant={activeVariants > 0 ? 'success' : 'warning'}
                                    />
                                 )}
                                 <span> Phiên bản</span>
                              </div>
                           </div>

                           <div className='hidden md:flex items-center'>
                              <span
                                 className={`px-2.5 py-1 text-xs rounded-full ${
                                    activeVariants > 0
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

                           <div className='hidden md:flex items-center justify-end space-x-2'>
                              <button
                                 onClick={() => handleEditProduct(product.id)}
                                 className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded'
                                 title='Chỉnh sửa'
                              >
                                 <PencilIcon className='h-4 w-4' />
                              </button>
                              <button
                                 onClick={() => handleDeleteProduct(product.id)}
                                 className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded'
                                 title='Xóa'
                              >
                                 <TrashIcon className='h-4 w-4' />
                              </button>
                           </div>

                           {/* Mobile info */}
                           <div className='md:hidden grid grid-cols-2 gap-2 text-sm mt-2'>
                              <div>
                                 <span className='text-gray-500'>Phiên bản: </span>
                                 <span className='text-gray-700'>{totalVariants}</span>
                                 {totalVariants > 0 && (
                                    <Badge
                                       count={activeVariants}
                                       variant={activeVariants > 0 ? 'success' : 'warning'}
                                    />
                                 )}
                              </div>
                              <div className='text-right'>
                                 <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                       activeVariants > 0
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
                              <div className='col-span-2 text-xs text-gray-500 mt-1'>
                                 <span>Danh mục: </span>
                                 <span className='text-gray-700'>
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
                           <div className='p-4 bg-gray-50 border-t'>
                              <div className='flex justify-between items-center mb-3'>
                                 <h4 className='text-sm font-medium'>Chi tiết sản phẩm</h4>
                              </div>

                              {isDetailLoading ? (
                                 <div className='py-4 flex justify-center'>
                                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700'></div>
                                 </div>
                              ) : product.details && product.details.length > 0 ? (
                                 <div className='overflow-x-auto rounded-lg border border-gray-200'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                       <thead className='bg-gray-100'>
                                          <tr>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Mã phiên bản
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Kích thước
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Loại
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Giá trị
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Tồn kho
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Giá gốc
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Giá ưu đãi
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Hạn khuyến mãi
                                             </th>
                                             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Trạng thái
                                             </th>
                                          </tr>
                                       </thead>
                                       <tbody className='bg-white divide-y divide-gray-200'>
                                          {product.details.map((detail) => {
                                             const priceInfo = detailPrices[detail.id] || {
                                                base_price: 0,
                                                discount_price: null,
                                                end_date: null,
                                             };
                                             const promotionExpired = isPromotionExpired(
                                                priceInfo.end_date,
                                             );

                                             // Nếu khuyến mãi đã hết hạn, không hiển thị giá khuyến mãi
                                             const effectiveDiscountPrice = promotionExpired
                                                ? null
                                                : priceInfo.discount_price;

                                             return (
                                                <tr
                                                   key={detail.id}
                                                   className='hover:bg-gray-50 transition-colors'
                                                >
                                                   {/* Các cột khác giữ nguyên */}
                                                   <td className='px-6 py-4 whitespace-nowrap'>
                                                      <div className='flex items-center'>
                                                         <div className='h-10 w-10 flex-shrink-0 mr-3 border rounded-full overflow-hidden'>
                                                            {/* Nội dung cũ */}
                                                         </div>
                                                         <span className='text-gray-900 text-sm'>
                                                            #{detail.id}
                                                         </span>
                                                      </div>
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                                                      {detail.size || '—'}
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                                                      {detail.type || '—'}
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                                                      {detail.values || '—'}
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                                      <span
                                                         className={`font-medium ${
                                                            detail.quantities === 0
                                                               ? 'text-red-500'
                                                               : 'text-gray-700'
                                                         }`}
                                                      >
                                                         {detail.quantities}
                                                      </span>
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                                                      {priceInfo.base_price
                                                         ? formatPrice(priceInfo.base_price)
                                                         : '—'}
                                                   </td>
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                                      {priceInfo.base_price ? (
                                                         <div>
                                                            {effectiveDiscountPrice &&
                                                            effectiveDiscountPrice > 0 ? (
                                                               <>
                                                                  {/* Hiển thị giá sau khi giảm */}
                                                                  <div className='flex items-center'>
                                                                     <span className='font-medium text-amber-600'>
                                                                        {formatPrice(
                                                                           calculateDiscountedPrice(
                                                                              priceInfo.base_price,
                                                                              effectiveDiscountPrice,
                                                                           ),
                                                                        )}
                                                                     </span>
                                                                     <span className='ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded'>
                                                                        -{effectiveDiscountPrice}%
                                                                     </span>
                                                                  </div>
                                                                  {/* Hiển thị giá gốc có gạch ngang */}
                                                                  <div className='mt-1'>
                                                                     <span className='text-xs text-gray-500 line-through'>
                                                                        {formatPrice(
                                                                           priceInfo.base_price,
                                                                        )}
                                                                     </span>
                                                                  </div>
                                                               </>
                                                            ) : (
                                                               /* Nếu không có giảm giá hoặc khuyến mãi hết hạn thì chỉ hiển thị giá gốc */
                                                               <span className='text-gray-700'>
                                                                  {formatPrice(
                                                                     priceInfo.base_price,
                                                                  )}
                                                               </span>
                                                            )}
                                                         </div>
                                                      ) : (
                                                         <span className='text-gray-400'>—</span>
                                                      )}
                                                   </td>

                                                   {/* CỘT MỚI: Thời gian kết thúc khuyến mãi */}
                                                   <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                                      {priceInfo.end_date ? (
                                                         <div>
                                                            <span
                                                               className={
                                                                  promotionExpired
                                                                     ? 'text-red-500'
                                                                     : 'text-gray-700'
                                                               }
                                                            >
                                                               {formatDate(priceInfo.end_date)}
                                                            </span>
                                                            {promotionExpired && (
                                                               <span className='block text-xs text-red-500 mt-0.5'>
                                                                  Đã kết thúc
                                                               </span>
                                                            )}
                                                         </div>
                                                      ) : (
                                                         <span className='text-gray-400'>—</span>
                                                      )}
                                                   </td>

                                                   <td className='px-6 py-4 whitespace-nowrap'>
                                                      <span
                                                         className={`px-2 py-1 text-xs rounded-full ${
                                                            detail.isActive
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
                                 <div className='text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200'>
                                    <p>
                                       Sản phẩm này chưa có phiên bản. Hãy thêm phiên bản để bắt đầu
                                       bán.
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

// First, add a helper function to check if a promotion is still active
const isPromotionActive = (endDate: string | null | undefined): boolean => {
   if (!endDate) return true; // If no end date, consider it always active
   try {
      const now = new Date();
      const promotionEndDate = new Date(endDate);
      return now <= promotionEndDate;
   } catch {
      return true; // If date parsing fails, assume it's active
   }
};

export default function ProductManagement() {
   const [products, setProducts] = useState<ProductViewModel[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<string>('Tất cả');
   const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
   const [productToDelete, setProductToDelete] = useState<number | null>(null);

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
   const tabs: { id: keyof typeof tabCounts; label: string }[] = [
      { id: 'Tất cả', label: 'Tất cả' },
      { id: 'Hoạt động', label: 'Đang bán' },
      { id: 'Khuyến Mãi', label: 'Khuyến mãi' },
      { id: 'Hết hàng', label: 'Hết hàng' },
   ];

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
         case 'Khuyến Mãi':
            return products.filter((product) => {
               // Check if any product pricing has an active discount
               return product.pricing?.some((price) => {
                  // Check if there's a discount price
                  const hasDiscount = price.discount_price > 0;

                  // Check if the promotion is still active (not expired)
                  const isActive = isPromotionActive(price.end_date);

                  return hasDiscount && isActive;
               });
            });
         case 'Hết hàng':
            return products.filter((product) => {
               // Calculate total quantity for this specific product
               const totalQuantity =
                  product.details?.reduce((sum, detail) => {
                     // Ensure quantities is treated as a number
                     const quantity =
                        detail?.quantities !== undefined ? Number(detail.quantities) : 0;
                     return sum + quantity;
                  }, 0) || 0;
               return totalQuantity === 0;
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
         'Khuyến Mãi': products.filter((p) =>
            p.pricing?.some(
               (price) => price.discount_price > 0 && isPromotionActive(price.end_date),
            ),
         ).length,
         'Hết hàng': products.filter((p) => {
            const totalQuantity =
               p.details?.reduce((sum, d) => sum + (Number(d.quantities) || 0), 0) || 0;
            return totalQuantity === 0;
         }).length,
      };
   }, [products]);

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSideBar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 p-6 overflow-auto'>
               {/* Header with title and add button */}
               <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
                  <div>
                     <h1 className='text-2xl font-semibold text-gray-800'>Quản lý sản phẩm</h1>
                  </div>
               </div>

               {/* Filter tabs with counts */}
               <div className='mb-6'>
                  <div className='border-b border-gray-200'>
                     <nav className='-mb-px flex flex-wrap gap-y-2'>
                        {tabs.map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center mr-6 ${
                                 activeTab === tab.id
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                           >
                              {tab.label}
                              {!loading && (
                                 <span
                                    className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                                       activeTab === tab.id
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-gray-100 text-gray-600'
                                    }`}
                                 >
                                    {tabCounts[tab.id]}
                                 </span>
                              )}
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

               <ProductTable
                  products={filteredProducts}
                  loading={loading}
                  fetchAllProductData={fetchAllProductData}
                  handleEditProduct={handleEditProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  getCategoryNameById={getCategoryNameById}
                  showToast={showToast} // Add this prop
               />
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
