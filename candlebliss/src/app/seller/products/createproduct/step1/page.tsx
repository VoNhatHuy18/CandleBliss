'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/app/context/ProductFormContext';

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
      formData.selectedCategory || null
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
   const [videoUrl, setVideoUrl] = useState(formData.videoUrl || '');
   const [errors, setErrors] = useState({
      name: '',
      category: '',
      description: '',
      images: '',
   });
   const [isLoading, setIsLoading] = useState(false);

   // Thêm kiểm tra token khi component mount
   // filepath: /d:/New folder/candlebliss/src/app/seller/products/createproduct/step1/page.tsx

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
      try {
         setIsCategoriesLoading(true);
         setCategoryError('');

         // Lấy token từ localStorage hoặc sessionStorage
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            setCategoryError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            return;
         }

         const response = await fetch('http://localhost:3000/api/categories', {
            headers: {
               'Authorization': `Bearer ${token}`
            },
            // Thêm tùy chọn để không tự động theo chuyển hướng
            redirect: 'manual'
         });

         // Xử lý mã trạng thái cụ thể
         if (response.status === 302) {
            // Phiên đăng nhập đã hết hạn hoặc token không hợp lệ
            // Xóa token cũ
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');

            setCategoryError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');

            // Tùy chọn: Chuyển hướng người dùng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
               router.push('/seller/signin');
            }, 2000);

            return;
         }

         if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
         }

         const data = await response.json();
         setCategories(data);

         // Nếu đã chọn category trước đó, tải thông tin chi tiết
         if (formData.selectedCategory?.id) {
            fetchCategoryById(formData.selectedCategory.id);
         }
      } catch (error) {
         console.error('Error fetching categories:', error);

         // Kiểm tra xem lỗi có phải là do mạng không
         if (error instanceof TypeError && error.message.includes('network')) {
            setCategoryError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.');
         } else {
            setCategoryError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
         }
      } finally {
         setIsCategoriesLoading(false);
      }
   };

   // Hàm lấy thông tin chi tiết của một danh mục theo ID
   const fetchCategoryById = async (categoryId: number) => {
      try {
         setIsCategoryDetailLoading(true);

         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            return null;
         }

         const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            },
            // Thêm tùy chọn để không tự động theo chuyển hướng
            redirect: 'manual'
         });

         // Xử lý mã trạng thái cụ thể
         if (response.status === 302) {
            // Phiên đăng nhập đã hết hạn hoặc token không hợp lệ
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');

            setCategoryError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            return null;
         }

         if (!response.ok) {
            throw new Error(`Failed to fetch category details: ${response.status}`);
         }

         const categoryData = await response.json();
         setSelectedCategory(categoryData);
         return categoryData;
      } catch (error) {
         console.error(`Error fetching category details for ID ${categoryId}:`, error);
         return null;
      } finally {
         setIsCategoryDetailLoading(false);
      }
   };

   

   // Xử lý khi người dùng chọn một danh mục
   const handleCategorySelect = async (category: Category) => {
      try {
         // Hiển thị thông tin cơ bản trước
         setSelectedCategory(category);
         setIsCategoryDropdownOpen(false);
         setErrors((prev) => ({ ...prev, category: '' }));

         // Sau đó tải thông tin chi tiết
         await fetchCategoryById(category.id);
      } catch (error) {
         console.error('Error selecting category:', error);
      }
   };

   // Handle image upload
   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageError(null);
      const files = e.target.files;

      if (!files) return;

      // Check if adding these files would exceed the 9 image limit
      if (productImages.length + files.length > 9) {
         setImageError('Chỉ được phép tải lên tối đa 9 hình ảnh');
         return;
      }

      // Process each file
      const newImages = Array.from(files)
         .map((file) => {
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
               setImageError('Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP');
               return null;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
               setImageError('Kích thước ảnh không được vượt quá 5MB');
               return null;
            }

            return URL.createObjectURL(file);
         })
         .filter((image) => image !== null) as string[];

      setProductImages((prev) => [...prev, ...newImages]);
      setErrors((prev) => ({ ...prev, images: '' }));

      // Reset the input value so the same file can be selected again
      e.target.value = '';
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

         // Tạo FormData để gửi dữ liệu bao gồm hình ảnh
         const productFormData = new FormData();
         productFormData.append('name', name.trim());
         productFormData.append('description', description || '');

         // Thêm categoryId nếu đã chọn danh mục
         if (selectedCategory) {
            productFormData.append('categoryId', selectedCategory.id.toString());
         }

         if (videoUrl) {
            productFormData.append('video', videoUrl);
         }

         // Xử lý và thêm các hình ảnh
         let hasImages = false;
         for (const blobUrl of productImages) {
            if (!blobUrl || !blobUrl.startsWith('blob:')) continue;
            try {
               const response = await fetch(blobUrl);
               const blob = await response.blob();
               const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
               productFormData.append('images', file);
               hasImages = true;
            } catch (error) {
               console.error('Error processing image:', error);
               alert('Lỗi khi xử lý hình ảnh sản phẩm');
            }
         }

         // Kiểm tra có hình ảnh không
         if (!hasImages) {
            setErrors((prev) => ({ ...prev, images: 'Vui lòng tải lên ít nhất 1 hình ảnh' }));
            setIsLoading(false);
            return;
         }

         // Gửi request tạo sản phẩm với categoryId đã được đính kèm
         const productResponse = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
            },
            body: productFormData,
         });

         if (!productResponse.ok) {
            const errorData = await productResponse.json().catch(() => null);
            const errorText = await productResponse.text().catch(() => 'Unknown error');
            console.error('Product creation failed:', errorData || errorText);
            alert(`Lỗi khi tạo sản phẩm: ${errorData?.message || errorText}`);
            setIsLoading(false);
            return;
         }

         // Lấy ID sản phẩm đã tạo
         const createdProduct = await productResponse.json();
         const productId = createdProduct.id;

         // Cập nhật dữ liệu trong context và thêm productId vào để các bước tiếp theo sử dụng
         updateFormData({
            name,
            description,
            selectedCategory, // Lưu toàn bộ đối tượng danh mục được chọn
            images: productImages,
            videoUrl,
            productId: productId,
         });

         // Chuyển đến bước tiếp theo
         router.push('/seller/products/createproduct/step2');
      } catch (error) {
         console.error('Error creating product:', error);
         alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
         setIsLoading(false);
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
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                     <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p>{categoryError}</p>
                     </div>
                     <p className="mt-2 text-sm">Đang chuyển hướng đến trang đăng nhập...</p>
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
                              placeholder='Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật'
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
                                 type="button"
                                 onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                 className={`w-full px-3 py-2 text-left border ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white flex justify-between items-center`}
                              >
                                 <span className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
                                    {selectedCategory ? selectedCategory.name : 'Chọn danh mục sản phẩm'}
                                 </span>
                                 <ChevronDown className="h-4 w-4 text-gray-500" />
                              </button>

                              {isCategoryDropdownOpen && (
                                 <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-auto">
                                    {isCategoriesLoading ? (
                                       <div className="px-4 py-2 text-sm text-gray-500">
                                          <div className="flex items-center">
                                             <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
                                             Đang tải danh mục...
                                          </div>
                                       </div>
                                    ) : categoryError ? (
                                       <div className="px-4 py-2 text-sm text-red-500">
                                          {categoryError}
                                       </div>
                                    ) : categories.length === 0 ? (
                                       <div className="px-4 py-2 text-sm text-gray-500">
                                          Không có danh mục nào. Bạn có thể thêm danh mục mới.
                                       </div>
                                    ) : (
                                       <>
                                          {categories.map((category) => (
                                             <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => handleCategorySelect(category)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategory?.id === category.id ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                                                   }`}
                                             >
                                                {category.name}
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

                        {/* Display Selected Category Details */}
                        {selectedCategory && (
                           <div className="p-3 bg-gray-50 rounded-md relative">
                              {isCategoryDetailLoading && (
                                 <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                                 </div>
                              )}
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Thông tin danh mục đã chọn</h4>
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-sm text-gray-600">{selectedCategory.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{selectedCategory.description}</p>
                                 </div>
                                 <div className="text-xs text-gray-400">
                                    ID: {selectedCategory.id}
                                 </div>
                              </div>
                           </div>
                        )}

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
                                 <div className='grid grid-cols-3 gap-4 mb-4'>
                                    {productImages.map((image, index) => (
                                       <div key={index} className='relative group'>
                                          <div className='aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-100'>
                                             <Image
                                                src={image}
                                                alt={`Product image ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className='object-cover w-full h-full'
                                             />
                                          </div>
                                          <button
                                             type='button'
                                             onClick={() => removeImage(index)}
                                             className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600'
                                          >
                                             <X size={16} />
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                              )}

                              {/* Upload area */}
                              <div className='flex flex-col items-center justify-center'>
                                 {productImages.length < 9 ? (
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
                                          />
                                       </label>
                                    </>
                                 ) : (
                                    <p className='text-amber-600 text-sm'>
                                       Đã đạt giới hạn 9 hình ảnh
                                    </p>
                                 )}
                                 <p className='text-xs text-gray-400 mt-1'>
                                    ({productImages.length}/9)
                                 </p>
                                 {imageError && (
                                    <p className='text-red-500 text-xs mt-2'>{imageError}</p>
                                 )}
                                 {errors.images && (
                                    <p className='text-red-500 text-xs mt-2'>{errors.images}</p>
                                 )}
                              </div>
                           </div>
                           <p className='text-xs text-gray-500 mt-1'>
                              Hỗ trợ: JPG, JPEG, PNG, WEBP (Tối đa 5MB/ảnh)
                           </p>
                        </div>

                        {/* Product Video */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Video sản phẩm:
                           </label>
                           <input
                              type='text'
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              placeholder='Link video về sản phẩm'
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500'
                           />
                        </div>

                        {/* Product Description */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Mô tả sản phẩm
                           </label>
                           <textarea
                              rows={6}
                              placeholder='Mô tả chi tiết về sản phẩm'
                              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'
                                 } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                              value={description}
                              onChange={(e) => {
                                 setDescription(e.target.value);
                                 setErrors((prev) => ({ ...prev, description: '' }));
                              }}
                           ></textarea>
                           {errors.description && (
                              <p className='text-red-500 text-xs mt-1'>{errors.description}</p>
                           )}
                           <div className='text-right text-xs text-gray-500 mt-1'>
                              {description.length}/3000
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Form Navigation */}
                  <div className='flex justify-end'>
                     <button
                        type="button"
                        className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center'
                        onClick={handleNext}
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Đang xử lý...
                           </>
                        ) : (
                           "Tiếp theo"
                        )}
                     </button>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
