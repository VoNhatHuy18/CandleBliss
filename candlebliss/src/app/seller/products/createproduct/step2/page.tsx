'use client';
import { useState, KeyboardEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/app/context/ProductFormContext';

// Define the variant interface
interface Variant {
   type: string;
   value: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
}

export default function Step2() {
   const router = useRouter();
   const { formData, updateFormData } = useProductForm();

   // Initialize variants from context if available
   const [variants, setVariants] = useState<Variant[]>(
      formData.variants.length > 0 ? formData.variants : [],
   );

   // State for new variant type and value fields
   const [newVariantType, setNewVariantType] = useState<string>('');
   const [newVariantValue, setNewVariantValue] = useState<string>('');

   // Function to add a new variant row
   const addVariant = () => {
      setVariants([...variants, { type: '', value: '', isExpanded: false, images: [] }]);
   };

   // Function to remove a variant row
   const removeVariant = (indexToRemove: number) => {
      // Don't remove if it's the last variant
      if (variants.length <= 0) return;

      // Filter out the variant at the specified index
      setVariants(variants.filter((_, index) => index !== indexToRemove));
   };

   // Function to handle input changes with type annotations
   const handleVariantChange = (index: number, field: string, value: string) => {
      const updatedVariants = [...variants];
      if (field === 'type') {
         updatedVariants[index].type = value;
      } else if (field === 'value') {
         updatedVariants[index].value = value;
      } else if (field === 'size') {
         updatedVariants[index].size = value;
      } else if (field === 'quantity') {
         updatedVariants[index].quantity = parseInt(value) || 0;
      }
      setVariants(updatedVariants);
   };

   // Toggle expanded state of a variant
   const toggleVariantExpanded = (index: number) => {
      const updatedVariants = [...variants];
      updatedVariants[index].isExpanded = !updatedVariants[index].isExpanded;
      setVariants(updatedVariants);
   };

   // Handle Enter key press for adding new variant type and value
   const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newVariantType.trim() && newVariantValue.trim()) {
         // Add the new variant with the entered type and value
         setVariants([
            ...variants,
            {
               type: newVariantType,
               value: newVariantValue,
               isExpanded: true,
               size: '',
               images: [],
               quantity: 0,
            },
         ]);

         // Clear the input fields
         setNewVariantType('');
         setNewVariantValue('');
      }
   };

   // Handle image upload
   const handleImageUpload = (index: number, e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const updatedVariants = [...variants];

      // Initialize images array if it doesn't exist
      if (!updatedVariants[index].images) {
         updatedVariants[index].images = [];
      }

      // Create URLs for the selected images
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file));

      // Add new image URLs to the variant
      updatedVariants[index].images = [...(updatedVariants[index].images || []), ...imageUrls];

      setVariants(updatedVariants);
   };

   // Remove an image from a variant
   const removeImage = (variantIndex: number, imageIndex: number) => {
      const updatedVariants = [...variants];
      if (updatedVariants[variantIndex].images) {
         updatedVariants[variantIndex].images = updatedVariants[variantIndex].images?.filter(
            (_, idx) => idx !== imageIndex,
         );
         setVariants(updatedVariants);
      }
   };

   // Handle next button click
   const handleNext = () => {
      // Save current variants to context
      updateFormData({ variants });

      // Navigate to next step
      router.push('/seller/products/createproduct/step3');
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

                  <div className='p-4'>
                     <div className='mb-4'>
                        <div className='flex flex-col mb-1 border-b '>
                           <span className='font-medium p-1'>Thông tin chi tiết sản phẩm</span>
                           <span className='text-sm  font-semibold text-[#050226] p-2'>
                              Thêm mới các phân loại sẽ giúp sản phẩm có nhiều lựa chọn hơn như màu
                              sắc, mùi hương, kích thước.
                           </span>
                        </div>

                        {/* Variant Type & Value Fields */}
                        <div className='flex justify-between items-center mb-4'>
                           <div className='w-2/5 pr-4'>
                              <label className='block text-sm font-medium mb-1'>Phân Loại</label>
                              <input
                                 type='text'
                                 placeholder='Tạo phân loại'
                                 value={newVariantType}
                                 onChange={(e) => setNewVariantType(e.target.value)}
                                 onKeyPress={handleKeyPress}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                              />
                           </div>

                           <div className='w-2/5'>
                              <label className='block text-sm font-medium mb-1'>Giá trị</label>
                              <input
                                 type='text'
                                 placeholder='Giá trị tự do và ấn Enter để thêm thuộc tính'
                                 value={newVariantValue}
                                 onChange={(e) => setNewVariantValue(e.target.value)}
                                 onKeyPress={handleKeyPress}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                              />
                           </div>
                        </div>

                        <div className='flex items-center text-amber-600 mb-4'>
                           <button
                              className='flex items-center text-sm font-medium'
                              onClick={addVariant}
                           >
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5 mr-1'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 4v16m8-8H4'
                                 />
                              </svg>
                              Thêm phân loại sản phẩm khác
                           </button>
                        </div>

                        {/* Chi tiết phiên bản */}
                        <div className='mt-8 mb-4'>
                           <h3 className='font-medium text-lg mb-4'>Chi tiết phiên bản</h3>
                           {/* Accordion items for variants */}

                           {variants.map((variant, index) => (
                              <div key={index} className='border border-gray-200 rounded-lg mb-4'>
                                 {/* Accordion Header */}
                                 <div className='flex justify-between items-center p-4'>
                                    <div
                                       className='font-medium flex-grow cursor-pointer'
                                       onClick={() => toggleVariantExpanded(index)}
                                    >
                                       {index + 1}. {variant.type || 'Phiên bản mới'}
                                       {variant.value && ` - ${variant.value}`}
                                    </div>
                                    <div className='flex items-center'>
                                       <button
                                          className='text-red-600 mr-4 hover:text-red-800'
                                          onClick={() => removeVariant(index)}
                                          title='Xóa phiên bản'
                                       >
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
                                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                             />
                                          </svg>
                                       </button>
                                       <svg
                                          xmlns='http://www.w3.org/2000/svg'
                                          className={`h-5 w-5 transform cursor-pointer ${
                                             variant.isExpanded ? 'rotate-180' : ''
                                          }`}
                                          fill='none'
                                          viewBox='0 0 24 24'
                                          stroke='currentColor'
                                          onClick={() => toggleVariantExpanded(index)}
                                       >
                                          <path
                                             strokeLinecap='round'
                                             strokeLinejoin='round'
                                             strokeWidth={2}
                                             d='M19 9l-7 7-7-7'
                                          />
                                       </svg>
                                    </div>
                                 </div>

                                 {/* Accordion Content */}
                                 {variant.isExpanded && (
                                    <div className='p-4 border-t border-gray-200'>
                                       <div className='mb-4'>
                                          <div className='flex justify-between mb-4'>
                                             <div className='w-1/2 pr-2'>
                                                <label className='block text-sm font-medium mb-1'>
                                                   Phân loại:
                                                </label>
                                                <input
                                                   type='text'
                                                   value={variant.type || ''}
                                                   onChange={(e) =>
                                                      handleVariantChange(
                                                         index,
                                                         'type',
                                                         e.target.value,
                                                      )
                                                   }
                                                   className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                                                   placeholder='Nhập phân loại'
                                                />
                                             </div>
                                             <div className='w-1/2 pl-2'>
                                                <label className='block text-sm font-medium mb-1'>
                                                   Giá trị:
                                                </label>
                                                <input
                                                   type='text'
                                                   value={variant.value || ''}
                                                   onChange={(e) =>
                                                      handleVariantChange(
                                                         index,
                                                         'value',
                                                         e.target.value,
                                                      )
                                                   }
                                                   className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                                                   placeholder='Nhập giá trị'
                                                />
                                             </div>
                                          </div>

                                          <div className='flex justify-between mb-4'>
                                             <div className='w-1/2 pr-2'>
                                                <label className='block text-sm font-medium mb-1'>
                                                   Size:
                                                </label>
                                                <input
                                                   type='text'
                                                   value={variant.size || ''}
                                                   onChange={(e) =>
                                                      handleVariantChange(
                                                         index,
                                                         'size',
                                                         e.target.value,
                                                      )
                                                   }
                                                   className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                                                   placeholder='Nhập size hoặc màu sắc'
                                                />
                                             </div>
                                             <div className='w-1/2 pl-2'>
                                                <label className='block text-sm font-medium mb-1'>
                                                   Số lượng:
                                                </label>
                                                <input
                                                   type='number'
                                                   value={variant.quantity || 0}
                                                   onChange={(e) =>
                                                      handleVariantChange(
                                                         index,
                                                         'quantity',
                                                         e.target.value,
                                                      )
                                                   }
                                                   placeholder='0'
                                                   className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                                                />
                                             </div>
                                          </div>

                                          <div className='mb-4'>
                                             <label className='block text-sm font-medium mb-1'>
                                                Hình ảnh
                                             </label>
                                             <div className='flex flex-wrap gap-2 mb-2'>
                                                {variant.images &&
                                                   variant.images.map((img, imgIndex) => (
                                                      <div
                                                         key={imgIndex}
                                                         className='w-16 h-16 border border-gray-300 rounded overflow-hidden relative group'
                                                      >
                                                         <Image
                                                            src={img}
                                                            alt={`${variant.type} image ${
                                                               imgIndex + 1
                                                            }`}
                                                            width={64}
                                                            height={64}
                                                            className='object-cover'
                                                         />
                                                         <button
                                                            className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                                            onClick={() =>
                                                               removeImage(index, imgIndex)
                                                            }
                                                            title='Xóa hình ảnh'
                                                         >
                                                            <svg
                                                               xmlns='http://www.w3.org/2000/svg'
                                                               className='h-3 w-3'
                                                               fill='none'
                                                               viewBox='0 0 24 24'
                                                               stroke='currentColor'
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
                                                   ))}
                                                <label className='w-16 h-16 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50'>
                                                   <svg
                                                      xmlns='http://www.w3.org/2000/svg'
                                                      className='h-6 w-6 text-gray-400'
                                                      fill='none'
                                                      viewBox='0 0 24 24'
                                                      stroke='currentColor'
                                                   >
                                                      <path
                                                         strokeLinecap='round'
                                                         strokeLinejoin='round'
                                                         strokeWidth={2}
                                                         d='M12 4v16m8-8H4'
                                                      />
                                                   </svg>
                                                   <input
                                                      type='file'
                                                      className='hidden'
                                                      accept='image/*'
                                                      multiple
                                                      onChange={(e) => handleImageUpload(index, e)}
                                                   />
                                                </label>
                                             </div>
                                             <p className='text-xs text-gray-500'>
                                                Nhấp vào biểu tượng + để thêm hình ảnh. Tối đa 5
                                                hình.
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className='flex justify-end'>
                     <button
                        onClick={handleNext}
                        className='px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 font-medium'
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
