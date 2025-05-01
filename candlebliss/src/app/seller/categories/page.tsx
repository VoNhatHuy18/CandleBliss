'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/seller/header/page';
import MenuSidebar from '@/app/components/seller/menusidebar/page';
import { PlusCircle, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import Toast from '@/app/components/ui/toast/Toast';
import Link from 'next/link';
import { HOST } from '@/app/constants/api';

// Update the Category interface to match the actual API response structure
interface Category {
   id: number;
   name: string;
   description?: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   isDeleted: boolean;
   __entity: string;
}

interface ToastState {
   show: boolean;
   message: string;
   type: 'success' | 'error' | 'info';
}

// Update to the correct API endpoint

export default function CategoriesPage() {
   const [categories, setCategories] = useState<Category[]>([]);
   const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [formData, setFormData] = useState({
      name: '',
      description: '',
   });

   // Toast state
   const [toast, setToast] = useState<ToastState>({
      show: false,
      message: '',
      type: 'info',
   });

   // Show toast helper function
   const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({
         show: true,
         message,
         type,
      });
   };

   // Close toast
   const closeToast = () => {
      setToast((prev) => ({ ...prev, show: false }));
   };

   // Update the fetchCategories function to be more robust
   const fetchCategories = async () => {
      setIsLoading(true);
      try {
         const response = await fetch(`${HOST}/api/categories`, {
            headers: {
               'Cache-Control': 'no-store',
            },
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
                     console.error(
                        'Failed to extract categories from 302 response text:',
                        nestedError,
                     );
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
                  throw new Error(`Failed to fetch categories: ${response.status}`);
               }
            } else {
               throw new Error(`Failed to fetch categories: ${response.status}`);
            }
         } else {
            // Normal case: API returns success status
            categoriesData = await response.json();
            console.log('Categories loaded successfully:', categoriesData);
         }

         if (Array.isArray(categoriesData)) {
            console.log('Setting categories:', categoriesData);
            setCategories(categoriesData);
            setFilteredCategories(categoriesData);
         } else {
            console.error('Categories data is not an array:', categoriesData);
            setCategories([]);
            setFilteredCategories([]);
            showToast('Invalid category data format', 'error');
         }
      } catch (error) {
         console.error('Error fetching categories:', error);
         showToast('Failed to load categories', 'error');
         setCategories([]);
         setFilteredCategories([]);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchCategories();
   }, []);

   // Filter categories based on search term
   useEffect(() => {
      if (searchTerm.trim() === '') {
         setFilteredCategories(categories);
      } else {
         const lowercaseSearch = searchTerm.toLowerCase();
         const filtered = categories.filter(
            (category) =>
               category.name.toLowerCase().includes(lowercaseSearch) ||
               (category.description &&
                  category.description.toLowerCase().includes(lowercaseSearch)),
         );
         setFilteredCategories(filtered);
      }
   }, [searchTerm, categories]);

   // Handle form input changes
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   // Open modal for new category
   const openAddModal = () => {
      setCurrentCategory(null);
      setFormData({ name: '', description: '' });
      setIsModalOpen(true);
   };

   // Open modal for editing
   const openEditModal = (category: Category) => {
      setCurrentCategory(category);
      setFormData({
         name: category.name,
         description: category.description || '',
      });
      setIsModalOpen(true);
   };

   // Open delete confirmation modal
   const openDeleteModal = (category: Category) => {
      setCurrentCategory(category);
      setIsDeleteModalOpen(true);
   };

   // Submit form (create or update)
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name.trim()) {
         showToast('Category name is required', 'error');
         return;
      }

      try {
         if (currentCategory) {
            // Update existing category
            const response = await fetch(`${HOST}/api/categories/${currentCategory.id}`, {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store',
               },
               body: JSON.stringify(formData),
            });

            console.log('Update response status:', response.status);

            // Handle potential 302 redirect with data
            if (response.status === 302) {
               const responseText = await response.text();
               console.log('Received 302 response on update with text:', responseText);
               // Continue normally as the update might have succeeded
               showToast('Category updated successfully', 'success');
            } else if (!response.ok) {
               console.error('Update response status:', response.status);
               throw new Error(`Failed to update category: ${response.status}`);
            } else {
               showToast('Category updated successfully', 'success');
            }

            showToast('Category updated successfully', 'success');
         } else {
            // Create new category
            const response = await fetch(`${HOST}/api/categories`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-store',
               },
               body: JSON.stringify(formData),
            });

            console.log('Create response status:', response.status);

            // Handle potential 302 redirect with data
            if (response.status === 302) {
               const responseText = await response.text();
               console.log('Received 302 response on create with text:', responseText);
               // Continue normally as the creation might have succeeded
               showToast('Category created successfully', 'success');
            } else if (!response.ok) {
               console.error('Create response status:', response.status);
               throw new Error(`Failed to create category: ${response.status}`);
            } else {
               showToast('Category created successfully', 'success');
            }

            showToast('Category created successfully', 'success');
         }

         setIsModalOpen(false);
         fetchCategories();
      } catch (error) {
         console.error('Error saving category:', error);
         showToast('Failed to save category', 'error');
      }
   };

   // Delete category
   const handleDelete = async () => {
      if (!currentCategory) return;

      try {
         const response = await fetch(`${HOST}/api/categories/${currentCategory.id}`, {
            method: 'DELETE',
            headers: {
               'Cache-Control': 'no-store',
            },
         });

         console.log('Delete response status:', response.status);

         // Handle potential 302 redirect with data
         if (response.status === 302) {
            const responseText = await response.text();
            console.log('Received 302 response on delete with text:', responseText);
            // Continue normally as the deletion might have succeeded
            showToast('Category deleted successfully', 'success');
         } else if (!response.ok) {
            console.error('Delete response status:', response.status);
            throw new Error(`Failed to delete category: ${response.status}`);
         } else {
            showToast('Category deleted successfully', 'success');
         }

         showToast('Category deleted successfully', 'success');
         setIsDeleteModalOpen(false);
         fetchCategories();
      } catch (error) {
         console.error('Error deleting category:', error);
         showToast('Failed to delete category', 'error');
      }
   };

   return (
      <div className='min-h-screen bg-gray-50'>
         <Header />
         <div className='flex'>
            <MenuSidebar />
            <main className='flex-1 p-6'>
               {/* Breadcrumb */}
               <nav className='flex mb-4 text-sm' aria-label='Breadcrumb'>
                  <Link href='/seller/products' className='text-gray-500 hover:text-amber-800'>
                     Tất cả sản phẩm
                  </Link>
                  <span className='mx-2 text-gray-400'>/</span>
                  <span className='text-gray-700'>Tạo sản phẩm mới</span>
               </nav>

               <div className='bg-white rounded-lg shadow-md p-6'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
                     <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Quản lý danh mục</h1>
                        <p className='text-sm text-gray-500 mt-1'>
                           Tạo và quản lý các danh mục sản phẩm của bạn
                        </p>
                     </div>

                     <div className='flex flex-col sm:flex-row gap-3'>
                        <div className='relative'>
                           <input
                              type='text'
                              placeholder='Tìm kiếm danh mục...'
                              className='w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                           <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
                        </div>

                        <button
                           onClick={() => fetchCategories()}
                           className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors duration-200'
                        >
                           <RefreshCw size={16} />
                           <span>Làm mới</span>
                        </button>

                        <button
                           onClick={openAddModal}
                           className='flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200'
                        >
                           <PlusCircle size={16} />
                           <span>Thêm danh mục</span>
                        </button>
                     </div>
                  </div>

                  {isLoading ? (
                     <div className='flex flex-col items-center justify-center p-12'>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
                        <p className='text-gray-500'>Đang tải dữ liệu...</p>
                     </div>
                  ) : filteredCategories.length === 0 ? (
                     <div className='flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg'>
                        <div className='text-gray-400 bg-gray-100 rounded-full p-4 mb-4'>
                           <PlusCircle size={32} />
                        </div>
                        {searchTerm ? (
                           <>
                              <h3 className='text-lg font-medium text-gray-700 mb-1'>
                                 Không tìm thấy danh mục
                              </h3>
                              <p className='text-sm text-gray-500 mb-4 text-center'>
                                 Không có danh mục nào khớp với tìm kiếm {searchTerm}
                              </p>
                              <button
                                 onClick={() => setSearchTerm('')}
                                 className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                              >
                                 Xóa bộ lọc
                              </button>
                           </>
                        ) : (
                           <>
                              <h3 className='text-lg font-medium text-gray-700 mb-1'>
                                 Chưa có danh mục nào
                              </h3>
                              <p className='text-sm text-gray-500 mb-4 text-center'>
                                 Bắt đầu bằng cách tạo danh mục đầu tiên của bạn
                              </p>
                              <button
                                 onClick={openAddModal}
                                 className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                              >
                                 Thêm danh mục
                              </button>
                           </>
                        )}
                     </div>
                  ) : (
                     <>
                        <div className='overflow-x-auto border border-gray-200 rounded-lg'>
                           <table className='min-w-full divide-y divide-gray-200'>
                              <thead className='bg-gray-50'>
                                 <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                       Tên danh mục
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                       Mô tả
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                       Ngày tạo
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                       Trạng thái
                                    </th>
                                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                       Thao tác
                                    </th>
                                 </tr>
                              </thead>
                              <tbody className='bg-white divide-y divide-gray-200'>
                                 {filteredCategories.map((category) => (
                                    <tr key={category.id} className='hover:bg-gray-50'>
                                       <td className='px-6 py-4'>
                                          <div className='font-medium text-gray-900'>
                                             {category.name}
                                          </div>
                                       </td>
                                       <td className='px-6 py-4 text-gray-500 max-w-xs truncate'>
                                          {category.description || 'Không có mô tả'}
                                       </td>
                                       <td className='px-6 py-4 whitespace-nowrap text-gray-500'>
                                          {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                                       </td>
                                       <td className='px-6 py-4 whitespace-nowrap'>
                                          {category.isDeleted ? (
                                             <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'>
                                                Đã xóa
                                             </span>
                                          ) : (
                                             <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                                                Hoạt động
                                             </span>
                                          )}
                                       </td>
                                       <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                          <div className='flex justify-end space-x-2'>
                                             <button
                                                onClick={() => openEditModal(category)}
                                                className='p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors'
                                                title='Chỉnh sửa'
                                             >
                                                <Edit2 size={16} />
                                             </button>
                                             <button
                                                onClick={() => openDeleteModal(category)}
                                                className='p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors'
                                                title='Xóa'
                                             >
                                                <Trash2 size={16} />
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                        <div className='mt-4 text-center text-sm text-gray-500'>
                           Hiển thị {filteredCategories.length} / {categories.length} danh mục
                        </div>
                     </>
                  )}
               </div>
            </main>
         </div>

         {/* Add/Edit Modal */}
         {isModalOpen && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
               <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in-up'>
                  <div className='flex justify-between items-center mb-4'>
                     <h2 className='text-xl font-bold text-gray-800'>
                        {currentCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                     </h2>
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className='text-gray-400 hover:text-gray-600'
                     >
                        <svg
                           className='w-5 h-5'
                           fill='none'
                           stroke='currentColor'
                           viewBox='0 0 24 24'
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
                  <form onSubmit={handleSubmit}>
                     <div className='mb-4'>
                        <label
                           htmlFor='name'
                           className='block text-gray-700 text-sm font-medium mb-2'
                        >
                           Tên danh mục <span className='text-red-500'>*</span>
                        </label>
                        <input
                           type='text'
                           id='name'
                           name='name'
                           value={formData.name}
                           onChange={handleInputChange}
                           className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                           placeholder='Nhập tên danh mục'
                           required
                        />
                     </div>
                     <div className='mb-6'>
                        <label
                           htmlFor='description'
                           className='block text-gray-700 text-sm font-medium mb-2'
                        >
                           Mô tả
                        </label>
                        <textarea
                           id='description'
                           name='description'
                           value={formData.description}
                           onChange={handleInputChange}
                           className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                           rows={4}
                           placeholder='Mô tả chi tiết về danh mục này'
                        />
                        <p className='mt-1 text-xs text-gray-500'>
                           Mô tả ngắn gọn về danh mục sẽ giúp người dùng hiểu rõ hơn.
                        </p>
                     </div>
                     <div className='flex justify-end gap-2'>
                        <button
                           type='button'
                           onClick={() => setIsModalOpen(false)}
                           className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors'
                        >
                           Hủy bỏ
                        </button>
                        <button
                           type='submit'
                           className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                           {currentCategory ? 'Cập nhật' : 'Tạo danh mục'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {isDeleteModalOpen && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
               <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in-up'>
                  <div className='flex items-center mb-4'>
                     <div className='flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center'>
                        <Trash2 className='h-5 w-5 text-red-600' />
                     </div>
                     <h2 className='text-xl font-bold ml-3 text-gray-800'>Xác nhận xóa</h2>
                  </div>
                  <p className='mb-6 text-gray-600'>
                     Bạn có chắc chắn muốn xóa danh mục{' '}
                     <span className='font-semibold'>{currentCategory?.name}</span>? Hành động này
                     không thể hoàn tác.
                  </p>
                  <div className='flex justify-end gap-3'>
                     <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors'
                     >
                        Hủy
                     </button>
                     <button
                        onClick={handleDelete}
                        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                     >
                        Xác nhận xóa
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Custom Toast Component */}
         <Toast
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
            duration={3000}
            position='top-right'
         />
      </div>
   );
}
