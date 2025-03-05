'use client';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { useProductForm } from '@/app/context/ProductFormContext';
import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
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
   const [price, setPrice] = useState('');
   const [variants, setVariants] = useState<Variant[]>(formData.variants || []);
   const [isActive, setIsActive] = useState(false);

   // Debug the entire formData object
   console.log('Complete formData:', formData);

   // Access data from Step 1
   const { name, description, category, images } = formData;

   const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
      setPrice(e.target.value);
   };

   const handleSubmit = async () => {
      try {
         // Gửi dữ liệu lên API
         const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               name,
               description,
               category,
               images,
               variants,
               price: Number(price) || 0,
            }),
         });

         if (response.ok) {
            // Chuyển hướng đến trang danh sách sản phẩm
            router.push('/seller/products');
         } else {
            console.error('Failed to create product');
         }
      } catch (error) {
         console.error('Error:', error);
      }
   };

   // Toggle expanded state of a variant
   const toggleVariantExpanded = (index: number) => {
      const updatedVariants = [...variants];
      updatedVariants[index].isExpanded = !updatedVariants[index].isExpanded;
      setVariants(updatedVariants);
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
                        <label className=' text-sm font-medium mb-1 w-60'>
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
                                    <img
                                       src={image}
                                       alt={`Product ${index + 1}`}
                                       className='w-24 h-24 object-cover rounded border'
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
                                                <img
                                                   key={imgIndex}
                                                   src={img}
                                                   alt={`Variant ${index + 1} image ${
                                                      imgIndex + 1
                                                   }`}
                                                   className='w-20 h-20 object-cover rounded border'
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

                        <div className=''>
                           <label className='block text-sm '>Thêm giá cho sản phẩm</label>
                        </div>
                     </div>

                     {/* SKU section */}
                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Khuyến mãi</label>
                        <select className='w-full p-2 border rounded-md'>
                           <option value=''>Lựa chọn</option>
                        </select>
                     </div>

                     {/* Warehouse field */}
                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Giá bán</label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md'
                           value={price}
                           onChange={handlePriceChange}
                        />
                     </div>

                     {/* Tax fields */}
                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Ngày áp dụng</label>
                        <input type='date' className='w-full p-2 border rounded-md' />
                     </div>

                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Ngày kết thúc</label>
                        <input type='date' className='w-full p-2 border rounded-md' />
                     </div>

                     <div className='mb-4'>
                        <label className='block text-sm mb-1'>Giá thành tiên</label>
                        <input type='text' className='w-full p-2 border rounded-md' />
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
