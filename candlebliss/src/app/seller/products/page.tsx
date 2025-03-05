// pages/index.tsx

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { fetchProducts, ApiResponse, Product } from '@/app/services/api';

// Define types for our data
type ProductStatus = 'Hoạt động' | 'Không hoạt động';
type TabType = 'Tất cả' | 'Khuyến Mãi' | 'Hết hàng';

// Tạo component ProductTable riêng để dễ quản lý
const ProductTable = ({ products, loading }: { products: Product[]; loading: boolean }) => {
   const columns = [
      { header: 'STT', key: 'id' },
      { header: 'Mã SP', key: 'sku' },
      { header: 'Hình ảnh', key: 'image' },
      { header: 'Tên sản phẩm', key: 'name' },
      { header: 'Danh mục', key: 'category' },
      { header: 'Giá gốc', key: 'price' },
      { header: 'Giá KM', key: 'discount' },
      { header: 'Số lượng', key: 'quantity' },
      { header: 'Trạng thái', key: 'status' },
      { header: 'Thao tác', key: 'actions' },
   ];

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: 'VND',
      }).format(amount);
   };

   if (loading) {
      return (
         <div className='w-full h-40 flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500'></div>
         </div>
      );
   }

   return (
      <div className='overflow-x-auto rounded-lg shadow'>
         <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
               <tr>
                  {columns.map((column) => (
                     <th
                        key={column.key}
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                     >
                        {column.header}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
               {products.length > 0 ? (
                  products.map((product, index) => (
                     <tr key={product.id} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                           {index + 1}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                           {product.id.toString().padStart(2, '0')}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           <div className='h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden'>
                             {product.details.length > 0 ? (
                                 <Image
                                    src={product.details[0].images[0].path}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className='object-cover rounded-lg hover:scale-110 transition-transform'
                                 />
                              ) : (
                                 <span className='text-gray-500 text-xl'>🕯️</span>
                              )}
                           </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           <div className='text-sm font-medium text-gray-900 hover:text-amber-600'>
                              {product.name}
                           </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           <div className='text-sm text-gray-500'>
                              {Array.isArray(product.details)
                                 ? [...new Set(product.details.map((detail) => detail.type))].join(
                                      ', ',
                                   )
                                 : 'Không có'}
                           </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                           {formatCurrency(product.pricing?.base_price || 0)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           {product.pricing?.discount_price > 0 ? (
                              <div className='flex flex-col'>
                                 <span className='text-sm text-red-600 font-medium'>
                                    {formatCurrency(product.pricing.discount_price)}
                                 </span>
                                 <span className='text-xs text-gray-400 line-through'>
                                    {formatCurrency(product.pricing.base_price)}
                                 </span>
                              </div>
                           ) : (
                              <span className='text-sm text-gray-500'>-</span>
                           )}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           {product.details.reduce((total, detail) => total + (detail.quantities || 0), 0)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                           <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                 ${
                                    product.status === 'Hoạt động'
                                       ? 'bg-green-100 text-green-800'
                                       : 'bg-red-100 text-red-800'
                                 }`}
                           >
                              {product.status}
                           </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                           <div className='flex space-x-3'>
                              <Link
                                 href={`/seller/products/${product.id}`}
                                 className='text-amber-600 hover:text-amber-900'
                              >
                                 Chi tiết
                              </Link>
                           </div>
                        </td>
                     </tr>
                  ))
               ) : (
                  <tr>
                     <td
                        colSpan={columns.length}
                        className='px-6 py-4 text-center text-sm text-gray-500'
                     >
                        Không có sản phẩm nào phù hợp với điều kiện tìm kiếm
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
   );
};

export default function ProductManagement() {
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<TabType>('Tất cả');
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [selectedCategory, setSelectedCategory] = useState<string>('');
   const [pagination, setPagination] = useState({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10,
   });
   const [productTypes, setProductTypes] = useState<string[]>([]);

   const tabs: TabType[] = ['Tất cả', 'Khuyến Mãi', 'Hết hàng'];

   // Function to load products from API
   const loadProducts = async () => {
      try {
         setLoading(true);
         const response = await fetchProducts(
            pagination.currentPage,
            pagination.limit,
            searchTerm,
            selectedCategory,
            activeTab,
         );
         console.log(response);
         setProducts(response.data || []);

         // Safely access meta.total with fallback values
         const total = response?.meta?.total || 0;
         setPagination({
            ...pagination,
            totalPages: Math.ceil(total / pagination.limit) || 1,
            totalItems: total,
         });
         setError(null);
      } catch (err) {
         setError('Failed to load products. Please try again later.');
         console.error(err);
         setProducts([]); // Reset products on error
      } finally {
         setLoading(false);
      }
   };

   // Load products on initial render and when filters change
   useEffect(() => {
      loadProducts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeTab, pagination.currentPage]);

   // Debounce search and category filter changes
   useEffect(() => {
      const timer = setTimeout(() => {
         if (pagination.currentPage === 1) {
            loadProducts();
         } else {
            // Reset to first page when filters change
            setPagination({ ...pagination, currentPage: 1 });
         }
      }, 500);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchTerm, selectedCategory]);

   // Hàm lấy danh sách type từ API
   const loadProductTypes = async () => {
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-types`);
         if (response.ok) {
            const data = await response.json();
            setProductTypes(data);
         }
      } catch (error) {
         console.error('Error loading product types:', error);
      }
   };

   // Load product types khi component mount
   useEffect(() => {
      loadProductTypes();
   }, []);

   function getStatusColor(status: ProductStatus): string {
      if (status === 'Hoạt động') return 'bg-green-100 text-green-800';
      return 'bg-red-100 text-red-800';
   }

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Sidebar */}
         <MenuSideBar />

         <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Header */}
            <Header />

            {/* Content */}
            <main className='flex-1 overflow-auto bg-white p-6'>
               <h2 className='text-lg font-medium text-gray-900 mb-4'>Tất cả sản phẩm</h2>

               {/* Tabs */}
               <div className='border-b border-gray-200 mb-4'>
                  <div className='flex'>
                     {tabs.map((tab, index) => (
                        <button
                           key={index}
                           onClick={() => setActiveTab(tab)}
                           className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                              tab === activeTab
                                 ? 'border-amber-500 text-amber-600'
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                           }`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Search and filters */}
               <div className='flex items-center mb-6 space-x-4'>
                  <div className='flex-1'>
                     <div className='relative'>
                        <input
                           type='text'
                           placeholder='Tìm kiếm theo tên sản phẩm'
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        />
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                           <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <div className='flex-1'>
                     <select
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                     >
                        <option value='' className='hidden'>Tất cả loại sản phẩm</option>
                        {/* Hiển thị các type từ API */}
                        {Array.from(new Set(products.flatMap(p => 
                           p.details.map(d => d.type)
                        ))).map((type) => (
                           <option key={type} value={type}>
                              {type}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className='flex space-x-2'>
                     <button
                        className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center'
                        onClick={() => {
                           setSearchTerm('');
                           setSelectedCategory('');
                           setPagination({ ...pagination, currentPage: 1 });
                        }}
                     >
                        <svg className='h-5 w-5 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                           <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                        </svg>
                        Đặt lại
                     </button>

                     <Link href='/seller/products/createproduct/step1'>
                        <button className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center'>
                           <span className='mr-1'>+</span> Tạo sản phẩm mới
                        </button>
                     </Link>
                  </div>
               </div>

               {/* Hiển thị số lượng kết quả tìm kiếm */}
               {searchTerm && (
                  <div className='mb-4 text-sm text-gray-600'>
                     Tìm thấy {products.length} sản phẩm cho từ khóa "{searchTerm}"
                  </div>
               )}

               {/* Error message */}
               {error && (
                  <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4'>
                     {error}
                  </div>
               )}

               {/* Products table */}
               <ProductTable products={products} loading={loading} />

               {/* Pagination */}
               {!loading && products.length > 0 && (
                  <div className='flex justify-between items-center mt-4'>
                     <p className='text-sm text-gray-700'>
                        Hiển thị <span className='font-medium'>{products.length}</span> trên{' '}
                        <span className='font-medium'>{pagination.totalItems}</span> sản phẩm
                     </p>
                     <div className='flex justify-end space-x-2'>
                        <button
                           onClick={() =>
                              setPagination({
                                 ...pagination,
                                 currentPage: Math.max(1, pagination.currentPage - 1),
                              })
                           }
                           disabled={pagination.currentPage === 1}
                           className={`px-3 py-1 rounded ${
                              pagination.currentPage === 1
                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                           }`}
                        >
                           Trước
                        </button>
                        <span className='px-3 py-1 bg-amber-500 text-white rounded'>
                           {pagination.currentPage}
                        </span>
                        <button
                           onClick={() =>
                              setPagination({
                                 ...pagination,
                                 currentPage: Math.min(
                                    pagination.totalPages,
                                    pagination.currentPage + 1,
                                 ),
                              })
                           }
                           disabled={pagination.currentPage === pagination.totalPages}
                           className={`px-3 py-1 rounded ${
                              pagination.currentPage === pagination.totalPages
                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                           }`}
                        >
                           Sau
                        </button>
                     </div>
                  </div>
               )}
            </main>
         </div>
      </div>
   );
}
