'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/app/contexts/ProductFormContext';
import { HOST } from '@/app/constants/api';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { X, ChevronDown, Loader2 } from 'lucide-react';

// Interface cho danh mục
interface Category {
   id: number;
   name: string;
   description: string;
   createdAt?: string;
   updatedAt?: string;
   deletedAt?: string | null;
   isDeleted?: boolean;
   __entity?: string;
}

export default function Step1() {
   const router = useRouter();
   const { formData, updateFormData } = useProductForm();

   const [name, setName] = useState(formData.name || '');
   const [description, setDescription] = useState(formData.description || '');
   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
      formData.selectedCategory || null,
   );
   // State cho dropdown
   const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
   // State cho danh sách danh mục từ API
   const [categories, setCategories] = useState<Category[]>([]);
   const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
   const [isCategoryDetailLoading, setIsCategoryDetailLoading] = useState(false);
   const [categoryError, setCategoryError] = useState('');

   // Add state for images
   const [productImages, setProductImages] = useState<string[]>(formData.images || []);
   const [imageError, setImageError] = useState<string | null>(null);
   const [videoUrl, setVideoUrl] = useState(formData.videoUrl || 'https://www.youtube.com/')
   const [errors, setErrors] = useState({
      name: '',
      category: '',
      description: '',
      images: '',
   });
   const [isLoading, setIsLoading] = useState(false);

   const [imageUploading, setImageUploading] = useState(false);
   const [imageProcessingCount, setImageProcessingCount] = useState(0);

   useEffect(() => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
         setCategoryError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
         router.push('/seller/signin');
         return;
      }

      fetchCategories();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Loại bỏ router khỏi dependency array và thêm eslint-disable comment

   // Hàm fetch danh sách danh mục
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

         const response = await fetch(`${HOST}/api/categories`, {
            headers: {
               Authorization: `Bearer ${token}`,
               'Content-Type': 'application/json',
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
                  throw new Error(
                     `Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`,
                  );
               }
            } else {
               throw new Error(
                  `Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`,
               );
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
   const handleOpenCategoryDropdown = () => {
      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
   };

   // Xử lý khi người dùng chọn một danh mục
   const handleCategorySelect = async (category: Category) => {
      try {
         setIsCategoryDetailLoading(true);
         console.log('Selected category:', category);
         setSelectedCategory(category); // Set the category immediately for better UX
         setErrors((prev) => ({ ...prev, category: '' }));
         setIsCategoryDropdownOpen(false);

         // Fetch detailed category information if needed
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         const response = await fetch(`${HOST}/api/categories/${category.id}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            console.error(`Failed to fetch category details: ${response.status}`);
            // We already set the category above, so no need to throw an error
            return;
         }

         const categoryDetail = await response.json();
         console.log('Received category detail:', categoryDetail);

         // Only update if we get valid data back
         if (categoryDetail && categoryDetail.id) {
            setSelectedCategory(categoryDetail);
         }
      } catch (error) {
         console.error('Error fetching category details:', error);
         // We already set the category at the beginning, so no need to do anything else
      } finally {
         setIsCategoryDetailLoading(false);
      }
   };

   // Handle image upload
   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageError(null);
      const files = e.target.files;

      if (!files || files.length === 0) return;

      // Check if adding these files would exceed the 9 image limit
      if (productImages.length + files.length > 9) {
         setImageError('Chỉ được phép tải lên tối đa 9 hình ảnh');
         return;
      }

      setImageUploading(true);
      setImageProcessingCount(files.length);

      try {
         // Process each file
         const filesToProcess = Array.from(files);
         const processedImages: string[] = [];

         for (const file of filesToProcess) {
            try {
               // Validate file type
               if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                  setImageError('Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP');
                  continue;
               }

               // Validate file size (max 5MB)
               if (file.size > 5 * 1024 * 1024) {
                  setImageError('Kích thước ảnh không được vượt quá 5MB');
                  continue;
               }

               // Create object URL
               const objectUrl = URL.createObjectURL(file);
               processedImages.push(objectUrl);

               // Artificial delay to show loading state (can be removed in production)
               await new Promise((resolve) => setTimeout(resolve, 300));

               setImageProcessingCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
               console.error('Error processing image:', error);
            }
         }

         setProductImages((prev) => [...prev, ...processedImages]);
         setErrors((prev) => ({ ...prev, images: '' }));
      } catch (error) {
         console.error('Error during image upload:', error);
         setImageError('Có lỗi xảy ra khi xử lý hình ảnh.');
      } finally {
         setImageUploading(false);
         setImageProcessingCount(0);
         // Reset the input value so the same file can be selected again
         e.target.value = '';
      }
   };

   // Remove an image
   const removeImage = (indexToRemove: number) => {
      setProductImages((prev) => {
         // Revoke the object URL to avoid memory leaks
         URL.revokeObjectURL(prev[indexToRemove]);
         return prev.filter((_, index) => index !== indexToRemove);
      });
   };

   const validateForm = () => {
      let isValid = true;
      const newErrors = {
         name: '',
         category: '',
         description: '',
         images: '',
      };

      if (!name.trim()) {
         newErrors.name = 'Vui lòng nhập tên sản phẩm';
         isValid = false;
      }

      if (!selectedCategory) {
         newErrors.category = 'Vui lòng chọn danh mục';
         isValid = false;
      }

      if (!description.trim()) {
         newErrors.description = 'Vui lòng nhập mô tả sản phẩm';
         isValid = false;
      }

      if (productImages.length === 0) {
         newErrors.images = 'Vui lòng tải lên ít nhất 1 hình ảnh';
         isValid = false;
      }

      setErrors(newErrors);
      return isValid;
   };

   const handleNext = async () => {
      if (!validateForm()) {
         return;
      }

      try {
         setIsLoading(true);

         // Lấy token xác thực
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            alert('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            router.push('/seller/signin');
            return;
         }

         // Đảm bảo productImages luôn là một mảng hợp lệ
         const safeProductImages = Array.isArray(productImages) ? productImages : [];

         // Hiển thị thông báo tiến trình
         // Tạo FormData để upload
         console.log('Chuẩn bị dữ liệu sản phẩm...');
         const productFormData = new FormData();
         productFormData.append('name', name.trim());
         productFormData.append('description', description.trim());

         // Thêm categoryId nếu đã chọn danh mục
         if (selectedCategory) {
            const categoryId = parseInt(selectedCategory.id.toString());
            console.log(`Thêm danh mục: ${selectedCategory.name} (ID: ${categoryId})`);
            productFormData.append('category_id', categoryId.toString());
         }

         if (videoUrl && videoUrl.trim() !== '') {
            console.log('Thêm video URL:', videoUrl);
            productFormData.append('video', videoUrl);
         }

         // Xử lý và thêm các hình ảnh
         let hasImages = false;
         console.log(`Xử lý ${safeProductImages.length} hình ảnh...`);
         setImageProcessingCount(safeProductImages.length);

         for (const [index, blobUrl] of safeProductImages.entries()) {
            if (!blobUrl || !blobUrl.startsWith('blob:')) {
               console.log(`Bỏ qua hình ảnh không hợp lệ: ${blobUrl}`);
               setImageProcessingCount((prev) => Math.max(0, prev - 1));
               continue;
            }

            try {
               console.log(`Đang xử lý hình ảnh ${index + 1}/${safeProductImages.length}...`);
               const response = await fetch(blobUrl);
               const blob = await response.blob();
               const fileName = `image-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 10)}.jpg`;
               const file = new File([blob], fileName, { type: blob.type });
               productFormData.append('images', file);
               hasImages = true;
               setImageProcessingCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
               console.error(`Lỗi xử lý hình ảnh ${index + 1}:`, error);
               setImageProcessingCount((prev) => Math.max(0, prev - 1));
            }
         }

         // Kiểm tra có hình ảnh không - nhưng chỉ nếu hình ảnh bắt buộc
         if (!hasImages && productImages.length > 0) {
            console.error('Không thể xử lý hình ảnh nào');
            setImageError('Không thể xử lý hình ảnh. Vui lòng thử lại với hình ảnh khác.');
            setIsLoading(false);
            return;
         }

         console.log('Đang gửi dữ liệu sản phẩm đến máy chủ...');

         // Gửi request tạo sản phẩm
         const productResponse = await fetch(`${HOST}/api/products`, {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
               // Không set Content-Type khi dùng FormData, trình duyệt sẽ tự thêm với boundary
            },
            body: productFormData,
         });

         console.log('Phản hồi từ máy chủ:', productResponse.status);

         if (!productResponse.ok) {
            const errorText = await productResponse.text();
            throw new Error(`Lỗi khi tạo sản phẩm (${productResponse.status}): ${errorText}`);
         }

         // Lấy dữ liệu từ response
         const productData = await productResponse.json();

         // Trích xuất ID sản phẩm từ phản hồi
         const productId = productData.id;

         console.log('Sản phẩm đã được tạo thành công với ID:', productId);

         // Cập nhật dữ liệu trong context
         console.log('Hoàn tất tạo sản phẩm, cập nhật dữ liệu...');
         updateFormData({
            name,
            description,
            selectedCategory,
            images: safeProductImages,
            videoUrl,
            productId: productId, // Sử dụng productId từ response API
         });

         console.log('Chuyển hướng đến bước tiếp theo...');
         // Chuyển đến bước tiếp theo
         router.push('/seller/products/createproduct/step2');
      } catch (error) {
         console.error('Error creating product:', error);
         alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
         setIsLoading(false);
         setImageProcessingCount(0);
      }
   };

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Sidebar */}
         <MenuSideBar />

         <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className='flex-1 p-6 overflow-auto'>
               {categoryError && categoryError.includes('Phiên làm việc đã hết hạn') && (
                  <div className='mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700'>
                     <div className='flex items-center'>
                        <svg className='h-5 w-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                           <path
                              fillRule='evenodd'
                              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                              clipRule='evenodd'
                           />
                        </svg>
                        <p>{categoryError}</p>
                     </div>
                     <p className='mt-2 text-sm'>Đang chuyển hướng đến trang đăng nhập...</p>
                  </div>
               )}
               {/* Breadcrumb */}
               <div className='text-sm mb-6'>
                  <Link href='/seller/products' className='text-gray-500 hover:text-amber-800'>
                     Tất cả sản phẩm
                  </Link>
                  <span className='mx-2 text-gray-400'>/</span>
                  <span className='text-gray-700'>Tạo sản phẩm mới</span>
               </div>

               {/* Product Creation Form */}
               <div className='bg-white rounded-lg shadow p-6'>
                  <h2 className='text-xl font-semibold mb-6 text-center'>Tạo sản phẩm</h2>

                  {/* Tabs */}
                  <div className='flex justify-between border-b border-gray-200 mb-6'>
                     <div className='flex-1 text-center pb-4 border-b-2 border-amber-500 text-amber-800 font-medium'>
                        <div className='flex flex-col items-center'>
                           <div className='w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-2'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                           </div>
                           <span>Thông tin cơ bản</span>
                        </div>
                     </div>

                     <div className='flex-1 text-center pb-4 text-gray-500'>
                        <div className='flex flex-col items-center'>
                           <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-2'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                 />
                              </svg>
                           </div>
                           <span>Thông tin chi tiết sản phẩm</span>
                        </div>
                     </div>

                     <div className='flex-1 text-center pb-4 text-gray-500'>
                        <div className='flex flex-col items-center'>
                           <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-2'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                           </div>
                           <span>Cài đặt giá cho sản phẩm</span>
                        </div>
                     </div>
                  </div>

                  {/* Basic Information Form */}
                  <div className='mb-8'>
                     <h3 className='text-lg font-medium mb-4'>Thông tin cơ bản</h3>

                     <div className='space-y-4'>
                        {/* Product Name */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Tên sản phẩm
                           </label>
                           <input
                              type='text'
                              value={name}
                              onChange={(e) => {
                                 setName(e.target.value);
                                 setErrors((prev) => ({ ...prev, name: '' }));
                              }}
                              placeholder='Tên sản phẩm '
                              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                 } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                           />
                           {errors.name && (
                              <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
                           )}
                        </div>

                        {/* Category Dropdown */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Danh mục
                           </label>
                           <div className='relative'>
                              <button
                                 type='button'
                                 onClick={handleOpenCategoryDropdown}
                                 className={`w-full px-3 py-2 text-left border ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white flex justify-between items-center`}
                              >
                                 <span
                                    className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}
                                 >
                                    {selectedCategory
                                       ? selectedCategory.name || `Danh mục ${selectedCategory.id}`
                                       : 'Chọn danh mục sản phẩm'}
                                 </span>
                                 <ChevronDown className='h-4 w-4 text-gray-500' />
                              </button>

                              {isCategoryDropdownOpen && (
                                 <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-auto'>
                                    {isCategoriesLoading ? (
                                       <div className='px-4 py-2 text-sm text-gray-500'>
                                          <div className='flex items-center'>
                                             <Loader2 className='h-4 w-4 mr-2 animate-spin text-amber-500' />
                                             Đang tải danh mục...
                                          </div>
                                       </div>
                                    ) : categories.length === 0 ? (
                                       <div className='px-4 py-2 text-sm text-gray-500'>
                                          {categoryError ? (
                                             <div className='text-red-500'>{categoryError}</div>
                                          ) : (
                                             'Không có danh mục nào. Bạn có thể thêm danh mục mới.'
                                          )}
                                       </div>
                                    ) : (
                                       <>
                                          {categories.map((category) => (
                                             <button
                                                key={category.id}
                                                type='button'
                                                onClick={() => handleCategorySelect(category)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategory?.id === category.id
                                                   ? 'bg-amber-50 text-amber-700'
                                                   : 'text-gray-700'
                                                   }`}
                                                disabled={isCategoryDetailLoading}
                                             >
                                                {isCategoryDetailLoading &&
                                                   selectedCategory?.id === category.id && (
                                                      <Loader2 className='inline h-3 w-3 mr-2 animate-spin' />
                                                   )}
                                                {category.name || `Danh mục ${category.id}`}
                                             </button>
                                          ))}
                                       </>
                                    )}
                                 </div>
                              )}
                           </div>
                           {errors.category && (
                              <p className='text-red-500 text-xs mt-1'>{errors.category}</p>
                           )}
                           <p className='text-xs text-gray-500 mt-1'>
                              Chọn danh mục phù hợp cho sản phẩm của bạn
                           </p>
                        </div>
                        {/* Product Image - Updated with functionality */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Hình ảnh chi tiết sản phẩm:
                           </label>
                           <div
                              className={`border border-dashed ${errors.images ? 'border-red-500' : 'border-gray-300'
                                 } rounded-md p-6`}
                           >
                              {/* Image Preview Grid */}
                              {productImages.length > 0 && (
                                 <div className='grid grid-cols-8 gap-2 mb-4'>
                                    {productImages.map((image, index) => (
                                       <div key={index} className='relative group'>
                                          {/* Use a fixed aspect ratio container with smaller dimensions */}
                                          <div className='aspect-square w-full max-w-[150px] h-[150px] relative rounded-md bg-gray-100 overflow-hidden'>
                                             <Image
                                                src={image}
                                                alt={`Product image ${index + 1}`}
                                                fill={true}
                                                className='transition-all duration-200'
                                             />
                                          </div>
                                          <button
                                             type='button'
                                             onClick={() => removeImage(index)}
                                             className='absolute -top-2  bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600'
                                          >
                                             <X size={16} />
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                              )}

                              {/* Upload area */}
                              <div className='flex flex-col items-center justify-center'>
                                 {imageUploading ? (
                                    // Show loader when images are uploading
                                    <div className='flex flex-col items-center p-4'>
                                       <Loader2 className='h-8 w-8 animate-spin text-amber-500 mb-2' />
                                       <p className='text-sm text-gray-500'>
                                          {imageProcessingCount > 0
                                             ? `Đang xử lý ${imageProcessingCount} hình ảnh...`
                                             : 'Đang xử lý hình ảnh...'}
                                       </p>
                                    </div>
                                 ) : productImages.length < 9 ? (
                                    <>
                                       <label className='cursor-pointer flex flex-col items-center'>
                                          <svg
                                             xmlns='http://www.w3.org/2000/svg'
                                             className='h-8 w-8 text-gray-400'
                                             fill='none'
                                             viewBox='0 0 24 24'
                                             stroke='currentColor'
                                          >
                                             <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                             />
                                          </svg>
                                          <p className='mt-2 text-sm text-gray-500'>
                                             Thêm hình ảnh
                                          </p>
                                          <input
                                             type='file'
                                             accept='image/jpeg,image/png,image/webp,image/jpg'
                                             multiple
                                             className='hidden'
                                             onChange={handleImageUpload}
                                             disabled={imageUploading}
                                          />
                                       </label>
                                    </>
                                 ) : (
                                    <p className='text-amber-600 text-sm'>
                                       Đã đạt giới hạn tối đa 9 hình ảnh
                                    </p>
                                 )}
                                 <p className='mt-2 text-xs text-gray-500 text-center'>
                                    Định dạng: JPG, JPEG, PNG, WEBP. Kích thước tối đa: 5MB/ảnh
                                 </p>
                              </div>
                           </div>
                           {errors.images && (
                              <p className='text-red-500 text-xs mt-1'>{errors.images}</p>
                           )}
                           {imageError && <p className='text-red-500 text-xs mt-1'>{imageError}</p>}
                        </div>

                        {/* Video URL */}
                        <div hidden={true}>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Video sản phẩm (tùy chọn)
                           </label>
                           <input
                              type='text'
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder='Nhập URL video (YouTube, TikTok, ...)'
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500'
                           />
                           <p className='text-xs text-gray-500 mt-1'>
                              Video sẽ giúp khách hàng hiểu rõ hơn về sản phẩm của bạn
                           </p>
                        </div>

                        {/* Product Description */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Mô tả sản phẩm
                           </label>
                           <textarea
                              rows={5}
                              value={description}
                              onChange={(e) => {
                                 setDescription(e.target.value);
                                 setErrors((prev) => ({ ...prev, description: '' }));
                              }}
                              placeholder='Mô tả chi tiết về sản phẩm, tính năng, đặc điểm nổi bật...'
                              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'
                                 } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                           />
                           {errors.description && (
                              <p className='text-red-500 text-xs mt-1'>{errors.description}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Next/Cancel Buttons */}
                  <div className='flex justify-end space-x-4'>
                     <Link
                        href='/seller/products'
                        className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                     >
                        Hủy
                     </Link>
                     <button
                        onClick={handleNext}
                        disabled={isLoading}
                        className='px-6 py-2 bg-amber-500 rounded-md text-white hover:bg-amber-600 disabled:bg-amber-300 flex items-center'
                     >
                        {isLoading ? (
                           <>
                              <Loader2 className='animate-spin h-4 w-4 mr-2' />
                              Đang xử lý...
                           </>
                        ) : (
                           'Tiếp theo'
                        )}
                     </button>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
