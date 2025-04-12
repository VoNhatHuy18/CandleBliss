'use client';
import { useState, KeyboardEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/app/context/ProductFormContext';

// Define the variant interface
interface Variant {
   type: string;
   values: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
   detailId?: number; // Thêm field này để lưu ID của product detail
}

// Add a LoadingOverlay component
const LoadingOverlay = ({ message = 'Đang xử lý...' }: { message?: string }) => (
   <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center'>
         <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4'></div>
         <p className='text-gray-700'>{message}</p>
      </div>
   </div>
);

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
   const [errors, setErrors] = useState<{ [key: string]: string }>({});
   const [isFormValid, setIsFormValid] = useState<boolean>(true);
   const [isLoading, setIsLoading] = useState(false);
   const [loadingMessage, setLoadingMessage] = useState('Đang xử lý...');

   // Validation rules
   const VALIDATION_RULES = {
      type: {
         required: true,
      },
      values: {
         required: true,
      },
      size: {
         required: true,
      },
      quantity: {
         required: true,
         min: 0,
      },
      images: {
         maxFiles: 5,
         allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
         maxSize: 5 * 1024 * 1024, // 5MB
      },
   };

   // Validate a single field
   const validateField = (field: string, value: string | number): string => {
      const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];

      if (!rules) return '';

      // Kiểm tra các trường hợp khác nhau của rules
      if ('required' in rules && rules.required && !value) {
         return `${field} không được để trống`;
      }

      if (typeof value === 'string') {
         if (
            'minLength' in rules &&
            typeof rules.minLength === 'number' &&
            value.length < rules.minLength
         ) {
            return `${field} phải có ít nhất ${rules.minLength} ký tự`;
         }
         if (
            'maxLength' in rules &&
            typeof rules.maxLength === 'number' &&
            value.length > rules.maxLength
         ) {
            return `${field} không được vượt quá ${rules.maxLength} ký tự`;
         }
      }

      if (typeof value === 'number') {
         if ('min' in rules && typeof rules.min === 'number' && value < rules.min) {
            return `${field} không được nhỏ hơn ${rules.min}`;
         }
         if ('max' in rules && typeof rules.max === 'number' && value > rules.max) {
            return `${field} không được lớn hơn ${rules.max}`;
         }
      }

      return '';
   };

   // Function to add a new variant row
   const addVariant = () => {
      if (!newVariantType || !newVariantValue) {
         setErrors({
            ...errors,
            newVariant: 'Vui lòng nhập đầy đủ thông tin phân loại và giá trị',
         });
         return;
      }
      setErrors({});
      setVariants([...variants, { type: '', values: '', isExpanded: false, images: [] }]);
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
      const error = validateField(field, value);
      setErrors({
         ...errors,
         [`${field}_${index}`]: error,
      });

      const updatedVariants = [...variants];
      if (field === 'type') {
         updatedVariants[index].type = value;
      } else if (field === 'values') {
         updatedVariants[index].values = value;
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
               values: newVariantValue, // Changed from value to values
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

      // Validate file type and size
      const invalidFiles = Array.from(files).filter((file) => {
         if (!VALIDATION_RULES.images.allowedTypes.includes(file.type)) {
            setErrors({
               ...errors,
               [`images_${index}`]: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF',
            });
            return true;
         }
         if (file.size > VALIDATION_RULES.images.maxSize) {
            setErrors({
               ...errors,
               [`images_${index}`]: 'Kích thước file không được vượt quá 5MB',
            });
            return true;
         }
         return false;
      });

      if (invalidFiles.length > 0) return;

      const updatedVariants = [...variants];

      // Initialize images array if it doesn't exist
      if (!updatedVariants[index].images) {
         updatedVariants[index].images = [];
      }

      // Check maximum number of images
      if (
         (updatedVariants[index].images?.length || 0) + files.length >
         VALIDATION_RULES.images.maxFiles
      ) {
         setErrors({
            ...errors,
            [`images_${index}`]: `Không thể tải lên quá ${VALIDATION_RULES.images.maxFiles} ảnh`,
         });
         return;
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
   const handleNext = async () => {
      // Validate all variants
      let hasErrors = false;
      const newErrors: { [key: string]: string } = {};

      variants.forEach((variant, index) => {
         ['type', 'values', 'size', 'quantity'].forEach((field) => {
            const value = variant[field as keyof Variant];
            const error = validateField(
               field,
               typeof value === 'string' || typeof value === 'number' ? value : '',
            );
            if (error) {
               newErrors[`${field}_${index}`] = error;
               hasErrors = true;
            }
         });
      });

      if (hasErrors) {
         setErrors(newErrors);
         setIsFormValid(false);
         return;
      }

      // Set loading state to true before starting the process
      setIsLoading(true);
      setLoadingMessage('Đang chuẩn bị xử lý dữ liệu sản phẩm...');

      try {
         // Lấy token và productId từ context
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            alert('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            router.push('/seller/signin');
            return;
         }

         const productId = formData.productId;
         if (!productId) {
            alert('Không tìm thấy thông tin sản phẩm. Vui lòng quay lại bước 1.');
            router.push('/seller/products/createproduct/step1');
            return;
         }

         // Tạo một bản sao của variants để cập nhật detailId
         const updatedVariants = [...variants];

         // Lưu từng biến thể vào database
         for (let i = 0; i < updatedVariants.length; i++) {
            setLoadingMessage(`Đang xử lý phiên bản ${i + 1}/${updatedVariants.length}...`);
            const variant = updatedVariants[i];

            // Tạo FormData cho biến thể sản phẩm
            const detailFormData = new FormData();
            detailFormData.append('product_id', String(productId));
            detailFormData.append('size', variant.size || '');
            detailFormData.append('type', variant.type || '');
            detailFormData.append('values', variant.values || '');
            detailFormData.append('quantities', String(variant.quantity || 0));
            detailFormData.append('isActive', 'true');

            // Thêm hình ảnh cho biến thể nếu có
            if (variant.images && variant.images.length > 0) {
               setLoadingMessage(`Đang xử lý hình ảnh cho phiên bản ${i + 1}...`);
               for (const imgUrl of variant.images) {
                  if (imgUrl.startsWith('blob:')) {
                     try {
                        const imgResponse = await fetch(imgUrl);
                        const imgBlob = await imgResponse.blob();
                        const imgFile = new File([imgBlob], `variant-${Date.now()}.jpg`, {
                           type: imgBlob.type,
                        });
                        detailFormData.append('images', imgFile);
                     } catch (error) {
                        console.error('Error processing variant image:', error);
                     }
                  }
               }
            }

            // Gửi request tạo chi tiết sản phẩm
            setLoadingMessage(`Đang lưu thông tin phiên bản ${i + 1}...`);
            const detailResponse = await fetch('http://68.183.226.198:3000/api/product-details', {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
               body: detailFormData,
            });

            if (!detailResponse.ok) {
               const errorText = await detailResponse.text();
               console.error('Product detail creation failed:', errorText);
               alert(`Lỗi khi tạo chi tiết sản phẩm: ${errorText}`);
               setIsLoading(false);
               return;
            }

            // Lưu ID của biến thể vào đối tượng variant
            const createdDetail = await detailResponse.json();
            updatedVariants[i].detailId = createdDetail.id;
         }

         // Cập nhật variants trong state với các detailId mới
         setVariants(updatedVariants);

         // Cập nhật dữ liệu trong context với IDs của các biến thể
         setLoadingMessage('Đang cập nhật dữ liệu...');
         updateFormData({
            ...formData,
            variants: updatedVariants, // Sử dụng updatedVariants thay vì variants
         });

         // Chuyển đến bước tiếp theo
         setLoadingMessage('Hoàn tất! Đang chuyển hướng...');
         router.push('/seller/products/createproduct/step3');
      } catch (error) {
         console.error('Error creating product variants:', error);
         alert(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className='flex h-screen bg-gray-50'>
         {/* Show the loading overlay when isLoading is true */}
         {isLoading && <LoadingOverlay message={loadingMessage} />}

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
                                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                              />
                              {errors.type && (
                                 <p className='text-red-500 text-xs mt-1'>{errors.type}</p>
                              )}
                           </div>

                           <div className='w-2/5'>
                              <label className='block text-sm font-medium mb-1'>Giá trị</label>
                              <input
                                 type='text'
                                 placeholder='Giá trị tự do và ấn Enter để thêm thuộc tính'
                                 value={newVariantValue}
                                 onChange={(e) => setNewVariantValue(e.target.value)}
                                 onKeyPress={handleKeyPress}
                                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                 ${errors.value ? 'border-red-500' : 'border-gray-300'}`}
                              />
                              {errors.value && (
                                 <p className='text-red-500 text-xs mt-1'>{errors.value}</p>
                              )}
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
                                       {variant.values && ` - ${variant.values}`}
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
                                                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                                   ${
                                                      errors[`type_${index}`]
                                                         ? 'border-red-500'
                                                         : 'border-gray-300'
                                                   }`}
                                                   placeholder='Nhập phân loại'
                                                />
                                                {errors[`type_${index}`] && (
                                                   <p className='text-red-500 text-xs mt-1'>
                                                      {errors[`type_${index}`]}
                                                   </p>
                                                )}
                                             </div>
                                             <div className='w-1/2 pl-2'>
                                                <label className='block text-sm font-medium mb-1'>
                                                   Giá trị:
                                                </label>
                                                <input
                                                   type='text'
                                                   value={variant.values || ''} // Changed from variant.value to variant.values
                                                   onChange={(e) =>
                                                      handleVariantChange(
                                                         index,
                                                         'values', // Changed from 'value' to 'values'
                                                         e.target.value,
                                                      )
                                                   }
                                                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                                   ${
                                                      errors[`values_${index}`] // Changed from value_${index} to values_${index}
                                                         ? 'border-red-500'
                                                         : 'border-gray-300'
                                                   }`}
                                                   placeholder='Nhập giá trị'
                                                />
                                                {errors[`values_${index}`] && ( // Changed from value_${index} to values_${index}
                                                   <p className='text-red-500 text-xs mt-1'>
                                                      {errors[`values_${index}`]}
                                                   </p>
                                                )}
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
                                                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                                   ${
                                                      errors[`size_${index}`]
                                                         ? 'border-red-500'
                                                         : 'border-gray-300'
                                                   }`}
                                                   placeholder='Nhập size hoặc màu sắc'
                                                />
                                                {errors[`size_${index}`] && (
                                                   <p className='text-red-500 text-xs mt-1'>
                                                      {errors[`size_${index}`]}
                                                   </p>
                                                )}
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
                                                   className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 
                                                   ${
                                                      errors[`quantity_${index}`]
                                                         ? 'border-red-500'
                                                         : 'border-gray-300'
                                                   }`}
                                                />
                                                {errors[`quantity_${index}`] && (
                                                   <p className='text-red-500 text-xs mt-1'>
                                                      {errors[`quantity_${index}`]}
                                                   </p>
                                                )}
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
                        disabled={!isFormValid}
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
