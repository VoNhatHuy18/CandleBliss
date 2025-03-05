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
               {products && products.length > 0 ? (
                  products.map((product, index) => {
                     return (
                        <tr key={product.id} className='hover:bg-gray-50 transition-colors'>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {index + 1}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {product.id.toString().padStart(2, '0')}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden'>
                                 {product.details?.[0]?.images && product.details[0].images.length > 0 ? (
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
                                 {product.details?.[0]?.type || 'N/A'}
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
                                       {formatCurrency(product.pricing.base_price || 0)}
                                    </span>
                                 </div>
                              ) : (
                                 <span className='text-sm text-gray-500'>-</span>
                              )}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              {product.details?.[0]?.quantities || 0}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='flex flex-col gap-1'>
                                 <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                       ${product.details?.[0]?.isActive
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                       }`}
                                 >
                                    {product.details?.[0]?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                 </span>
                                 {product.details?.[0]?.quantities === 0 && (
                                    <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'>
                                       Hết hàng
                                    </span>
                                 )}
                              </div>
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
                     );
                  })
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

   // 1. Hàm lọc sản phẩm theo tab
   const filterProductsByTab = (products: Product[], tab: TabType) => {
      switch (tab) {
         case 'Khuyến Mãi':
            return products.filter(product => {
               if (!product.pricing || !product.pricing.discount_price) {
                  return false;
               }
               return (
                  product.pricing.discount_price > 0 &&
                  product.pricing.discount_price < product.pricing.base_price
               );
            });

         case 'Hết hàng':
            return products.filter(product => {
               const productDetails = product.details?.[0];
               if (!productDetails) return false;
               return (
                  productDetails.quantities === 0 &&
                  productDetails.isActive === false
               );
            });

         case 'Tất cả':
         default:
            return products;
      }
   };

   // 2. Hàm load sản phẩm
   const loadProducts = async () => {
      try {
         const token = localStorage.getItem('token');
         const API_URL = process.env.NEXT_PUBLIC_API_URL;

         // Fetch products
         const productsResponse = await fetch(`${API_URL}/products`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
         const productsData = await productsResponse.json();

         // Fetch details cho mỗi product
         const productsWithDetails = await Promise.all(
            productsData.map(async (product: Product) => {
               const detailsResponse = await fetch(`${API_URL}/product-details/${product.id}`, {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               });
               const details = await detailsResponse.json();

               const formattedDetails = Array.isArray(details) ? details.map(detail => ({
                  images: detail.images || [],
                  type: detail.type || '',
                  quantities: detail.quantities || 0,
                  isActive: detail.isActive || false
               })) : [{
                  images: details.images || [],
                  type: details.type || '',
                  quantities: details.quantities || 0,
                  isActive: details.isActive || false
               }];

               return {
                  ...product,
                  details: formattedDetails
               };
            })
         );

         return productsWithDetails;
      } catch (error) {
         console.error('Error loading products:', error);
         throw error;
      }
   };

   // 3. Hàm load và lọc sản phẩm
   const loadAndFilterProducts = async () => {
      setLoading(true);
      try {
         const allProducts = await loadProducts();
         const filteredProducts = filterProductsByTab(allProducts, activeTab);
         
         console.log(`Filtered products for tab ${activeTab}:`, filteredProducts);
         setProducts(filteredProducts);

         // Cập nhật pagination
         const total = filteredProducts.length;
         setPagination(prev => ({
            ...prev,
            totalPages: Math.ceil(total / prev.limit) || 1,
            totalItems: total,
         }));

         setError(null);
      } catch (error) {
         console.error('Lỗi khi tải và lọc sản phẩm:', error);
         setError('Có lỗi xảy ra khi tải và lọc sản phẩm');
         setProducts([]);
      } finally {
         setLoading(false);
      }
   };

   // 4. useEffect để load và lọc sản phẩm khi tab thay đổi
   useEffect(() => {
      loadAndFilterProducts();
   }, [activeTab]);

   // 5. Hàm xử lý khi click vào tab
   const handleTabChange = (tab: TabType) => {
      setActiveTab(tab);
   };

   // Debounce search and category filter changes
   useEffect(() => {
      const timer = setTimeout(() => {
         if (pagination.currentPage === 1) {
            loadAndFilterProducts();
         } else {
            // Reset to first page when filters change
            setPagination({ ...pagination, currentPage: 1 });
         }
      }, 500);

      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchTerm, selectedCategory]);

   // Thêm useEffect để lọc sản phẩm khi selectedCategory thay đổi
   useEffect(() => {
      const filterProducts = () => {
         const filtered = products.filter((product) => {
            // Nếu không có category được chọn, hiển thị tất cả
            if (!selectedCategory) return true;
            // Lọc theo type
            return product.details?.[0]?.type === selectedCategory;
               });

         setProducts(filtered);
      };

      if (selectedCategory) {
         filterProducts();
      } else {
         // Nếu không có category được chọn, load lại tất cả sản phẩm
         loadAndFilterProducts();
      }
   }, [selectedCategory]);

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
                           onClick={() => handleTabChange(tab)}
                           className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                              tab === activeTab
                                 ? 'border-amber-500 text-amber-600'
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                           }`}
                        >
                           <span>{tab}</span>
                           {tab === activeTab && products.length > 0 && (
                              <span className='ml-2 bg-amber-100 text-amber-600 px-2 py-1 rounded-full text-xs'>
                                 {products.length}
                              </span>
                           )}
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
                           onChange={(e) => {
                              const value = e.target.value;
                              setSearchTerm(value);
                              // Lọc sản phẩm theo tên khi người dùng nhập
                              const filtered = products.filter(product => 
                                 product.name.toLowerCase().includes(value.toLowerCase())
                              );
                              setProducts(filtered);
                           }}
                           className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                        />
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                           <svg
                              className='h-5 w-5 text-gray-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                              />
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
                        <option value=''>Tất cả loại sản phẩm</option>
                        {products
                           // Lấy tất cả các type từ details của mỗi sản phẩm
                           .reduce((types: string[], product) => {
                              if (product.details?.[0]?.type) {
                                 // Thêm type mới nếu chưa tồn tại trong mảng
                                 if (!types.includes(product.details[0].type)) {
                                    types.push(product.details[0].type);
                                 }
                              }
                              return types;
                           }, [])
                           // Sắp xếp các type theo thứ tự alphabet
                           .sort()
                           // Tạo các option cho select box
                           .map((type) => (
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
