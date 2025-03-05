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

export default function GiftManagement() {
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
                     <input
                        type='text'
                        placeholder='Tìm kiếm'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                     />
                  </div>
                  <div className='flex-1'>
                     <select
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                     >
                        <option className='hidden'>Danh mục</option>
                        <option>Nến thơm</option>
                        <option>Tinh dầu</option>
                        <option>Phụ kiện nến</option>
                     </select>
                  </div>
                  <button
                     className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
                     onClick={() => {
                        // Reset filters
                        setSearchTerm('');
                        setSelectedCategory('');
                        setPagination({ ...pagination, currentPage: 1 });
                     }}
                  >
                     Đặt lại
                  </button>
                  <Link href='/seller/products/createproduct/step1'>
                     <button className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center'>
                        <span className='mr-1'>+</span> Tạo sản phẩm mới
                     </button>
                  </Link>
               </div>

               {/* Error message */}
               {error && (
                  <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4'>
                     {error}
                  </div>
               )}

               {/* Products table */}
               <div className='overflow-hidden border border-gray-200 rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-200'>
                     <thead className='bg-gray-50'>
                        <tr>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              STT
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Mã sản phẩm
                           </th>
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
                              Tên sản phẩm
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Danh mục
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Khuyến mãi
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Số lượng
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Trạng thái
                           </th>
                           <th
                              scope='col'
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                           >
                              Hành động
                           </th>
                        </tr>
                     </thead>
                     <tbody className='bg-white divide-y divide-gray-200'>
                        {loading ? (
                           <tr>
                              <td colSpan={9} className='px-6 py-4 text-center'>
                                 <div className='flex justify-center'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500'></div>
                                 </div>
                              </td>
                           </tr>
                        ) : products.length > 0 ? (
                           products.map((product) => (
                              <tr key={product.id} className='hover:bg-gray-50'>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {product.id}
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'></td>
                                 <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='h-12 w-12 rounded bg-gray-200 flex items-center justify-center overflow-hidden'>
                                       {product.images?.length > 0 ? (
                                          <Image
                                             src={product.images[0].path}
                                             alt={product.name}
                                             width={48} // Kích thước tối đa của ảnh
                                             height={48}
                                             className='object-cover rounded'
                                          />
                                       ) : (
                                          <span className='text-gray-500'>🕯️</span> // Placeholder nếu không có ảnh
                                       )}
                                    </div>
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                    {product.name}
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {product.category}
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {product.discount && product.discount > 0
                                       ? `${product.discount}%`
                                       : '0%'}
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                    {(product.stock ?? 0).toLocaleString()}
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap'>
                                    <span
                                       className={`px-2 py-1 w-28 justify-center inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                          product.status as ProductStatus,
                                       )}`}
                                    >
                                       {product.status}
                                    </span>
                                 </td>
                                 <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:underline'>
                                    <Link href='/'>
                                       <span>Xem chi tiết</span>
                                    </Link>
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td
                                 colSpan={9}
                                 className='px-6 py-4 text-center text-sm text-gray-500'
                              >
                                 Không có sản phẩm nào phù hợp với điều kiện tìm kiếm
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

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
