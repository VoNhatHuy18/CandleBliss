'use client';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { useProductForm } from '@/app/context/ProductFormContext';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Định nghĩa interface cho variant
interface Variant {
   type: string;
   value: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
}

export default function Step3() {
   const router = useRouter();
   const { formData, updateFormData } = useProductForm();
   const [basePrice, setBasePrice] = useState('');
   const [discountPrice, setDiscountPrice] = useState('');
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   const [variants, setVariants] = useState<Variant[]>(formData.variants || []);
   const [isActive] = useState(false);
   const [videoUrl, setVideoUrl] = useState('');
   const [promotion, setPromotion] = useState('');

   // Debug the entire formData object
   console.log('Complete formData:', formData);

   // Access data from Step 1
   const { name, description, category, images } = formData;

   // Toggle expanded state of a variant
   const toggleVariantExpanded = (index: number) => {
      const updatedVariants = [...variants];
      updatedVariants[index].isExpanded = !updatedVariants[index].isExpanded;
      setVariants(updatedVariants);
   };

   // Add this function to your Step3 component
   const handleSubmit = async () => {
      try {
         // 1. Get token
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            alert('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            router.push('/seller/signin');
            return;
         }

         // 2. Create FormData object for product
         const formData = new FormData();
         formData.append('name', name);
         formData.append('description', description);
         formData.append('video', videoUrl);

         // 3. Process each blob URL into actual file objects
         for (const blobUrl of images) {
            if (!blobUrl || !blobUrl.startsWith('blob:')) continue;
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
            formData.append('images', file);
         }

         // 4. Create the product
         console.log('Creating product...');
         const productResponse = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
               Authorization: `Bearer ${token}`,
            },
            body: formData,
         });

         if (!productResponse.ok) {
            const errorText = await productResponse.text();
            throw new Error(`Product creation failed: ${errorText}`);
         }

         // 5. Get the created product ID
         const createdProduct = await productResponse.json();
         const productId = createdProduct.id;
         console.log('Product created successfully with ID:', productId);

         // 6. Create product details for each variant
         for (const variant of variants) {
            console.log('Creating product detail for variant:', variant);

            // Create FormData for product detail
            const detailFormData = new FormData();
            detailFormData.append('product_id', String(productId));
            detailFormData.append('size', variant.size || '');
            detailFormData.append('type', variant.type || '');
            detailFormData.append('quantities', String(variant.quantity || 0));
            detailFormData.append('isActive', String(isActive));

            // Add variant images if any
            if (variant.images && variant.images.length > 0) {
               for (const imgUrl of variant.images) {
                  if (imgUrl.startsWith('blob:')) {
                     const imgResponse = await fetch(imgUrl);
                     const imgBlob = await imgResponse.blob();
                     const imgFile = new File([imgBlob], `variant-${Date.now()}.jpg`, {
                        type: imgBlob.type,
                     });
                     detailFormData.append('images', imgFile);
                  }
               }
            }

            const detailResponse = await fetch('http://localhost:3000/api/product-details', {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               body: detailFormData,
            });

            if (!detailResponse.ok) {
               const errorText = await detailResponse.text();
               throw new Error(`Product detail creation failed: ${errorText}`);
            }

            const createdDetail = await detailResponse.json();
            console.log('Product detail created:', createdDetail);

            // 7. Create pricing for each product detail
            console.log('Creating pricing for product detail:', createdDetail.id);

            // Format dates properly for the API
            const formattedStartDate = startDate || new Date().toISOString().split('T')[0];
            const formattedEndDate =
               endDate ||
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const priceData = {
               base_price: Number(basePrice) || 0,
               discount_price: Number(discountPrice) || 0,
               start_date: formattedStartDate,
               end_date: formattedEndDate,
               productId: createdDetail.id,
               isActive: true,
            };

            const priceResponse = await fetch('http://localhost:3000/api/v1/prices', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(priceData),
            });

            if (!priceResponse.ok) {
               const errorText = await priceResponse.text();
               throw new Error(`Price creation failed: ${errorText}`);
            }

            console.log('Price created successfully');
         }

         // 8. Success! Navigate back to products page
         alert('Sản phẩm đã được tạo thành công!');
         router.push('/seller/products');
      } catch (error) {
         console.error('Error creating product:', error);
         alert(`Lỗi khi tạo sản phẩm: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
   };

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Sidebar */}
         <MenuSideBar />

         <div className='flex-1 flex flex-col overflow-hidden'>
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
                                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                           </div>
                           <span>Cài đặt giá cho sản phẩm</span>
                        </div>
                     </div>
                  </div>

                  <h1 className='text-2xl font-medium mb-4'>Thông tin cơ bản</h1>

                  <div className='flex flex-col'>
                     {/* Product name field */}
                     <div className='mb-4 flex justify-items-center'>
                        <label className='text-sm font-medium mb-1 w-60'>
                           Tên sản phẩm:<span className='text-red-500'>*</span>
                        </label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md'
                           value={name || ''}
                           readOnly
                        />
                     </div>

                     {/* Product description */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-60'>
                           Danh mục:<span className='text-red-500'>*</span>
                        </label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md'
                           value={category || ''}
                           readOnly
                        />
                     </div>

                     {/* Product images */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-52'>
                           Hình ảnh sản phẩm:<span className='text-red-500'>*</span>
                        </label>
                        <div className='flex flex-wrap gap-2 mt-2'>
                           {images && images.length > 0 ? (
                              images.map((image, index) => (
                                  <div key={index} className='relative'>
                                    <Image
                                       src={image}
                                       alt={`Product ${index + 1}`}
                                       className='w-24 h-24 object-cover rounded border'
                                       width={96}
                                       height={96}
                                    />
                                  </div>
                              ))
                           ) : (
                              <div className='w-24 h-24 border rounded flex items-center justify-center bg-gray-100'>
                                 <span className='text-gray-400 text-xs '>Chưa có ảnh</span>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Video URL field */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-60'>
                           Video sản phẩm:
                        </label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md'
                           placeholder='Ví dụ: URL sản phẩm'
                           value={videoUrl}
                           onChange={(e) => setVideoUrl(e.target.value)}
                        />
                     </div>

                     {/* Product description field */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-60'>
                           Mô tả sản phẩm:<span className='text-red-500'>*</span>
                        </label>
                        <textarea
                           className='w-full p-2 border rounded-md'
                           rows={6}
                           value={description || ''}
                           readOnly
                        ></textarea>
                     </div>
                  </div>

                  {/* Variants section */}
                  <div className='mb-6'>
                     <div className='space-y-4'>
                        {variants.map((variant, index) => (
                           <div key={index} className='border border-black rounded-lg'>
                              {/* Accordion Header */}
                              <div
                                 className='flex justify-between items-center p-4 cursor-pointer'
                                 onClick={() => toggleVariantExpanded(index)}
                              >
                                 <div className='font-medium'>
                                    {variant.type || 'Biến thể không tên'}
                                    {variant.value && ` - ${variant.value}`}
                                 </div>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className={`h-5 w-5 transform transition-transform ${
                                       variant.isExpanded ? 'rotate-180' : ''
                                    }`}
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M19 9l-7 7-7-7'
                                    />
                                 </svg>
                              </div>

                              {/* Accordion Content */}
                              {variant.isExpanded && (
                                 <div className='p-4 border-t border-gray-200'>
                                    <div className='grid grid-cols-2 gap-4'>
                                       <div>
                                          <label className='block text-sm font-medium mb-1'>
                                             Phân loại:
                                          </label>
                                          <input
                                             type='text'
                                             value={variant.type || ''}
                                             className='w-full p-2 border rounded-md'
                                             readOnly
                                          />
                                       </div>
                                       <div>
                                          <label className='block text-sm font-medium mb-1'>
                                             Giá trị:
                                          </label>
                                          <input
                                             type='text'
                                             value={variant.value || ''}
                                             className='w-full p-2 border rounded-md'
                                             readOnly
                                          />
                                       </div>
                                       <div>
                                          <label className='block text-sm font-medium mb-1'>
                                             Size:
                                          </label>
                                          <input
                                             type='text'
                                             value={variant.size || ''}
                                             className='w-full p-2 border rounded-md'
                                             readOnly
                                          />
                                       </div>
                                       <div>
                                          <label className='block text-sm font-medium mb-1'>
                                             Số lượng:
                                          </label>
                                          <input
                                             type='number'
                                             value={variant.quantity || 0}
                                             className='w-full p-2 border rounded-md'
                                             readOnly
                                          />
                                       </div>
                                    </div>

                                    {/* Variant Images */}
                                    {variant.images && variant.images.length > 0 && (
                                       <div className='mt-4'>
                                          <label className='block text-sm font-medium mb-2'>
                                             Hình ảnh:
                                          </label>
                                          <div className='flex gap-2'>
                                              {variant.images.map((img, imgIndex) => (
                                                <Image
                                                   key={imgIndex}
                                                   src={img}
                                                   alt={`Variant ${index + 1} image ${
                                                     imgIndex + 1
                                                   }`}
                                                   className='w-20 h-20 object-cover rounded border'
                                                   width={80}
                                                   height={80}
                                                />
                                              ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Additional product information section */}
                  <div className='mb-6'>
                     <h3 className='text-md font-bold mb-2'>Thông tin chi tiết sản phẩm khác</h3>

                     {/* Price setting section */}
                     <div className='mb-6'>
                        <h3 className='text-md font-semibold mb-2'>Cài đặt giá cho sản phẩm</h3>

                        {/* Giá gốc */}
                        <div className='mb-4'>
                           <label className='block text-sm mb-1'>
                              Giá gốc<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='number'
                              className='w-full p-2 border rounded-md'
                              value={basePrice}
                              onChange={(e) => setBasePrice(e.target.value)}
                              placeholder='Nhập giá gốc'
                              required
                           />
                        </div>

                        {/* Giá khuyến mãi */}
                        <div className='mb-4'>
                           <label className='block text-sm mb-1'>Giá khuyến mãi</label>
                           <input
                              type='number'
                              className='w-full p-2 border rounded-md'
                              value={discountPrice}
                              onChange={(e) => setDiscountPrice(e.target.value)}
                              placeholder='Nhập giá khuyến mãi (nếu có)'
                           />
                        </div>

                        {/* Ngày áp dụng */}
                        <div className='mb-4'>
                           <label className='block text-sm mb-1'>
                              Ngày áp dụng<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='date'
                              className='w-full p-2 border rounded-md'
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              required
                           />
                        </div>

                        {/* Ngày kết thúc */}
                        <div className='mb-4'>
                           <label className='block text-sm mb-1'>
                              Ngày kết thúc<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='date'
                              className='w-full p-2 border rounded-md'
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              required
                           />
                        </div>
                     </div>

                     {/* SKU section */}
                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Khuyến mãi</label>
                        <select
                           className='w-full p-2 border rounded-md'
                           value={promotion}
                           onChange={(e) => setPromotion(e.target.value)}
                        >
                           <option value=''>Lựa chọn</option>
                           <option value='discount'>Giảm giá</option>
                           <option value='combo'>Combo</option>
                        </select>
                     </div>

                     {/* Warehouse field */}
                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Giá bán</label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md'
                           value={basePrice}
                           readOnly
                        />
                     </div>
                  </div>

                  {/* Form buttons */}
                  <div className='flex justify-end gap-2 mt-6'>
                     <button
                        onClick={() => {
                           // Cập nhật formData với giá trị hiện tại trước khi quay lại
                           updateFormData({
                              ...formData,
                              variants: variants, // Lưu variants hiện tại vào formData
                           });
                           // Đợi cập nhật formData hoàn tất trước khi chuyển trang
                           setTimeout(() => {
                              router.push('/seller/products/createproduct/step2');
                           }, 100);
                        }}
                        className='px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100'
                     >
                        Quay lại
                     </button>
                     <button
                        onClick={() => {
                           updateFormData({
                              name: '',
                              description: '',
                              category: '',
                              images: [],
                              variants: [],
                           });
                           window.location.href = '/seller/products';
                        }}
                        className='px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100'
                     >
                        Hủy
                     </button>
                     <button
                        className='px-4 py-2 bg-blue-600 text-white rounded-md'
                        onClick={handleSubmit}
                     >
                        Tạo sản phẩm
                     </button>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
}
