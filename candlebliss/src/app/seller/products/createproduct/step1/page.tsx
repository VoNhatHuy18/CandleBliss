// pages/admin/products/new.js

'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/app/context/ProductFormContext';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { X } from 'lucide-react';

export default function Step1() {
   const router = useRouter();
   const { formData, updateFormData } = useProductForm();

   const [name, setName] = useState(formData.name || '');
   const [description, setDescription] = useState(formData.description || '');
   const [category, setCategory] = useState(formData.category || '');
   // Add state for images
   const [productImages, setProductImages] = useState<string[]>(formData.images || []);
   const [imageError, setImageError] = useState<string | null>(null);
   const [videoUrl, setVideoUrl] = useState(formData.videoUrl || '');
   const [categoryDescription, setCategoryDescription] = useState('');
   const [errors, setErrors] = useState({
      name: '',
      category: '',
      description: '',
      images: '',
      categoryDescription: '',
   });
   const [isLoading, setIsLoading] = useState(false); // Thêm state isLoading

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
         categoryDescription: '',
      };

      if (!name.trim()) {
         newErrors.name = 'Vui lòng nhập tên sản phẩm';
         isValid = false;
      }

      if (!category) {
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

      if (!categoryDescription.trim()) {
         newErrors.categoryDescription = 'Vui lòng nhập mô tả danh mục';
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

         // Gửi request tạo sản phẩm
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

         // Tạo danh mục cho sản phẩm - cập nhật để chỉ gửi thông tin danh mục
         const categoryData = {
            name: category.trim(),
            description: categoryDescription.trim(),
            // Bỏ trường productId
         };

         // Gửi request tạo danh mục
         const categoryResponse = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
         });

         if (!categoryResponse.ok) {
            const errorData = await categoryResponse.json().catch(() => null);
            const errorText = await categoryResponse.text().catch(() => 'Unknown error');
            console.error('Category creation failed:', errorData || errorText);
            alert(`Lỗi khi tạo danh mục: ${errorData?.message || errorText}`);
            setIsLoading(false);
            return;
         }

         // Lấy ID danh mục đã tạo
         const createdCategory = await categoryResponse.json();
         const categoryId = createdCategory.id;

         // Cập nhật sản phẩm với categoryId
         const updateProductData = {
            categoryId: categoryId,
         };

         const updateProductResponse = await fetch(
            `http://localhost:3000/api/products/${productId}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(updateProductData),
            },
         );

         if (!updateProductResponse.ok) {
            const errorData = await updateProductResponse.json().catch(() => null);
            console.error('Product update failed:', errorData);
            alert(
               `Lỗi khi cập nhật sản phẩm với danh mục: ${errorData?.message || 'Unknown error'}`,
            );
            setIsLoading(false);
            return;
         }

         // Cập nhật dữ liệu trong context và thêm productId vào để các bước tiếp theo sử dụng
         updateFormData({
            name,
            description,
            category,
            categoryDescription, // Thêm mô tả danh mục
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

                        {/* Category */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Danh mục
                           </label>
                           <div className='relative'>
                              <input
                                 type='text'
                                 value={category}
                                 onChange={(e) => {
                                    setCategory(e.target.value);
                                    setErrors((prev) => ({ ...prev, category: '' }));
                                 }}
                                 placeholder='Nhập tên danh mục sản phẩm (vd: Nến thơm, Tinh dầu)'
                                 className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                              />
                              {errors.category && (
                                 <p className='text-red-500 text-xs mt-1'>{errors.category}</p>
                              )}
                           </div>
                           <p className='text-xs text-gray-500 mt-1'>
                              Nhập tên danh mục để phân loại sản phẩm của bạn
                           </p>
                        </div>

                        {/* Category Description - Thêm mới */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              <span className='text-red-500'>*</span> Mô tả danh mục
                           </label>
                           <textarea

                              rows={3}
                              value={categoryDescription}
                              onChange={(e) => {
                                 setCategoryDescription(e.target.value);
                                 setErrors((prev) => ({ ...prev, categoryDescription: '' }));
                              }}
                              placeholder='Mô tả ngắn gọn về danh mục sản phẩm'
                              className={`w-full px-3 py-2 border ${errors.categoryDescription ? 'border-red-500' : 'border-gray-300'
                                 } rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500`}
                           ></textarea>
                           {errors.categoryDescription && (
                              <p className='text-red-500 text-xs mt-1'>
                                 {errors.categoryDescription}
                              </p>
                           )}

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
                        className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
                        onClick={handleNext}
                     >
                        Tiếp theo
                     </button>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
