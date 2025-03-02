// pages/index.tsx

'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

// Define types for our data
type ProductStatus = 'Hoạt động' | 'Không hoạt động';
type TabType = 'Tất cả' | 'Khuyến Mãi' | 'Hết hàng';

interface Product {
   id: number;
   sku: string;
   name: string;
   category: string;
   price: number;
   discount: number;
   stock: number;
   status: ProductStatus;
}

export default function ProductManagement() {
   const [products] = useState<Product[]>([
      {
         id: 1,
         sku: 'A01',
         name: 'Nến thơm chanh',
         category: 'Nến thơm',
         price: 250000,
         discount: 10,
         stock: 10,
         status: 'Không hoạt động',
      },
      {
         id: 2,
         sku: 'A02',
         name: 'Nến thơm trà trắng',
         category: 'Nến thơm',
         price: 250000,
         discount: 10,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 3,
         sku: 'A03',
         name: 'Nến thơm thiên nhiên',
         category: 'Nến thơm',
         price: 250000,
         discount: 0,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 4,
         sku: 'A04',
         name: 'Bộ đựng cụ nến',
         category: 'Phụ kiện nến',
         price: 250000,
         discount: 0,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 5,
         sku: 'A05',
         name: 'Tinh dầu trà trắng',
         category: 'Tinh dầu',
         price: 250000,
         discount: 0,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 6,
         sku: 'A06',
         name: 'Tinh dầu bưởi',
         category: 'Tinh dầu',
         price: 250000,
         discount: 0,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 7,
         sku: 'A07',
         name: 'Tinh dầu xả',
         category: 'Tinh dầu',
         price: 250000,
         discount: 0,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 8,
         sku: 'A08',
         name: 'Tinh dầu chanh',
         category: 'Tinh dầu',
         price: 250000,
         discount: 30,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 9,
         sku: 'A09',
         name: 'Tinh dầu chanh',
         category: 'Tinh dầu',
         price: 250000,
         discount: 30,
         stock: 250000,
         status: 'Hoạt động',
      },
      {
         id: 10,
         sku: 'A19',
         name: 'Nến thơm sả chanh',
         category: 'Nến thơm',
         price: 250000,
         discount: 50,
         stock: 10,
         status: 'Hoạt động',
      },
   ]);

   const [activeTab, setActiveTab] = useState<TabType>('Tất cả');
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [selectedCategory, setSelectedCategory] = useState<string>('');

   const tabs: TabType[] = ['Tất cả', 'Khuyến Mãi', 'Hết hàng'];

   function getStatusColor(status: ProductStatus): string {
      if (status === 'Hoạt động') return 'bg-green-100 text-green-800';
      return 'bg-red-100 text-red-800';
   }

   // Filter and sort products based on active tab
   const getFilteredProducts = (): Product[] => {
      let filteredProducts = [...products];

      // Apply search filter if search term exists
      if (searchTerm.trim() !== '') {
         filteredProducts = filteredProducts.filter(
            (product) =>
               product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
         );
      }

      // Apply category filter if a category is selected
      if (selectedCategory && selectedCategory !== 'Danh mục') {
         filteredProducts = filteredProducts.filter(
            (product) => product.category === selectedCategory,
         );
      }

      // Apply tab-specific filtering and sorting
      switch (activeTab) {
         case 'Khuyến Mãi':
            // Sort products by discount percentage (low to high)

            return (filteredProducts = filteredProducts.filter((product) => product.discount > 0));

         case 'Hết hàng':
            // Only show products with 'Không hoạt động' status
            return filteredProducts.filter((product) => product.status === 'Không hoạt động');

         default: // 'Tất cả'
            return filteredProducts;
      }
   };

   const displayedProducts = getFilteredProducts();

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
                     }}
                  >
                     Đặt lại
                  </button>
                  <Link href='/seller/products/createproduct'>
                     <button className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center'>
                        <span className='mr-1'>+</span> Tạo sản phẩm mới
                     </button>
                  </Link>
               </div>

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
                        {displayedProducts.map((product) => (
                           <tr key={product.id} className='hover:bg-gray-50'>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                 {product.id}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                 {product.sku}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                 <div className='h-12 w-12 rounded bg-gray-200 flex items-center justify-center'>
                                    <span className='text-gray-500'>🕯️</span>
                                 </div>
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                 {product.name}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                 {product.category}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                 {product.discount > 0 ? `${product.discount}%` : '0%'}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                 {product.stock.toLocaleString()}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                 <span
                                    className={`px-2 py-1 w-28 justify-center inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                       product.status,
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
                        ))}
                        {displayedProducts.length === 0 && (
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
            </main>
         </div>
      </div>
   );
}
