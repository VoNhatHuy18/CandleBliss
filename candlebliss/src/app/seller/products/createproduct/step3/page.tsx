'use client';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import { useProductForm } from '@/app/context/ProductFormContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Toast from '@/app/components/ui/toast/Toast'; // Add Toast import

// Interface for variant that's compatible with both Step2 and Step3
interface Variant {
   type: string;
   values?: string; // From Step2
   value?: string; // For Step3 compatibility
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
   detailId?: number;
}

export default function Step3() {
   const router = useRouter();
   const { formData, updateFormData } = useProductForm();
   const [basePrice, setBasePrice] = useState('');
   const [discountPrice, setDiscountPrice] = useState('');
   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');
   const [variants, setVariants] = useState<Variant[]>(formData.variants || []);
   const [isActive] = useState(true);
   const [promotion] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [calculatedPrice, setCalculatedPrice] = useState('');

   // Add toast state
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   // Helper function to show toast messages
   const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({
         show: true,
         message,
         type,
      });
   };

   // Initialize dates if empty
   useEffect(() => {
      console.log('Received form data:', formData);

      if (!startDate) {
         setStartDate(new Date().toISOString().split('T')[0]);
      }
      if (!endDate) {
         const thirtyDaysLater = new Date();
         thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
         setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
      }

      // Set empty variants as expanded by default
      if (variants.length > 0) {
         const initializedVariants = variants.map((variant) => ({
            ...variant,
            isExpanded: variant.isExpanded !== undefined ? variant.isExpanded : true,
         }));
         setVariants(initializedVariants);
      }
   }, []);

   // Access data from previous steps
   const { name, description, selectedCategory, images, productId } = formData;
   const category = selectedCategory?.name || '';

   // Calculate display price whenever basePrice or discountPrice changes
   useEffect(() => {
      if (basePrice && discountPrice && Number(discountPrice) > 0 && Number(discountPrice) <= 100) {
         const discountAmount = (Number(basePrice) * Number(discountPrice)) / 100;
         const finalPrice = Number(basePrice) - discountAmount;
         setCalculatedPrice(finalPrice.toFixed(0));
      } else {
         setCalculatedPrice(basePrice);
      }
   }, [basePrice, discountPrice]);
   // Toggle expanded state of a variant
   const toggleVariantExpanded = (index: number) => {
      const updatedVariants = [...variants];
      updatedVariants[index].isExpanded = !updatedVariants[index].isExpanded;
      setVariants(updatedVariants);
   };

   // Validate form before submission
   const validateForm = () => {
      if (!basePrice || Number(basePrice) <= 0) {
         return false;
      }

      if (discountPrice && (Number(discountPrice) < 0 || Number(discountPrice) > 100)) {
         return false;
      }

      if (!startDate) {
         return false;
      }

      if (!endDate) {
         return false;
      }

      if (new Date(endDate) <= new Date(startDate)) {
         return false;
      }

      return true;
   };

   const handleSubmit = async () => {
      if (!validateForm()) {
         showToast('Vui lòng kiểm tra lại thông tin giá và ngày áp dụng', 'error');
         return;
      }

      setIsLoading(true);
      try {
         // Lấy token
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         if (!token) {
            showToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn', 'error');
            router.push('/seller/signin');
            return;
         }

         // Kiểm tra xem variants có tồn tại và có dữ liệu không
         if (!variants || variants.length === 0) {
            showToast('Không tìm thấy thông tin biến thể. Vui lòng quay lại bước 2.', 'error');
            router.push('/seller/products/createproduct/step2');
            return;
         }

         // Xử lý giá cho từng biến thể
         for (const variant of variants) {
            // Kiểm tra xem biến thể có detailId không
            if (!variant.detailId) {
               console.error('Missing detailId for variant:', variant);
               continue; // Bỏ qua biến thể này và tiếp tục với biến thể tiếp theo
            }

            // Định dạng ngày
            const formattedStartDate = startDate || new Date().toISOString().split('T')[0];
            const formattedEndDate =
               endDate ||
               new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Tạo dữ liệu giá
            const basePriceValue = Number(basePrice) || 0;
            const discountPercentageValue = Number(discountPrice) || 0;

            // THAY ĐỔI: Gửi giá trị phần trăm khuyến mãi thay vì giá sau khuyến mãi
            const priceData = {
               base_price: basePriceValue,
               discount_price: discountPercentageValue, // Gửi giá trị phần trăm khuyến mãi
               start_date: formattedStartDate,
               end_date: formattedEndDate,
               productId: variant.detailId,
               isActive: isActive,
            };

            console.log('Sending price data:', priceData); // Giúp debug

            // Gửi request tạo giá
            const priceResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(priceData),
            });

            if (!priceResponse.ok) {
               const errorData = await priceResponse.json().catch(() => null);
               const errorText = await priceResponse.text().catch(() => 'Unknown error');
               console.error('Price creation failed:', errorData || errorText);
               showToast(`Lỗi khi tạo giá sản phẩm: ${errorData?.message || errorText}`, 'error');
               setIsLoading(false);
               return;
            }
         }

         // Áp dụng khuyến mãi nếu có
         if (promotion) {
            // Thêm code xử lý khuyến mãi ở đây
         }

         // Cập nhật trạng thái hoạt động của sản phẩm
         const updateProductResponse = await fetch(
            `http://68.183.226.198:3000/api/products/${productId}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ isActive: true }),
            },
         );

         if (!updateProductResponse.ok) {
            console.error('Failed to update product status');
            showToast('Không thể cập nhật trạng thái sản phẩm', 'error');
         }

         // Success! Navigate back to products page
         showToast('Sản phẩm đã được tạo thành công!', 'success');

         // Reset form data
         updateFormData({
            name: '',
            description: '',
            categoryId: undefined,
            images: [],
            variants: [],
            productId: undefined, // Clear productId
         });

         router.push('/seller/products');
      } catch (error) {
         console.error('Error creating product pricing:', error);
         showToast(
            `Lỗi khi cài đặt giá sản phẩm: ${error instanceof Error ? error.message : 'Lỗi không xác định'
            }`,
            'error',
         );
      } finally {
         setIsLoading(false);
      }
   };

   // Update the cancel button onClick handler
   const handleCancel = () => {
      if (window.confirm('Bạn có chắc muốn hủy tạo sản phẩm không?')) {
         updateFormData({
            name: '',
            description: '',
            categoryId: undefined,
            images: [],
            variants: [],
         });
         router.push('/seller/products');
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

                  <h1 className='text-2xl font-medium mb-4'>Thông tin sản phẩm</h1>

                  <div className='flex flex-col'>
                     {/* Product name field */}
                     <div className='mb-4 flex justify-items-center'>
                        <label className='text-sm font-medium mb-1 w-60'>
                           Tên sản phẩm:<span className='text-red-500'>*</span>
                        </label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md bg-gray-50'
                           value={name || ''}
                           readOnly
                        />
                     </div>

                     {/* Product category */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-60'>
                           Danh mục:<span className='text-red-500'>*</span>
                        </label>
                        <input
                           type='text'
                           className='w-full p-2 border rounded-md bg-gray-50'
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



                     {/* Product description field */}
                     <div className='mb-4 flex'>
                        <label className='block text-sm font-medium mb-1 w-60'>
                           Mô tả sản phẩm:<span className='text-red-500'>*</span>
                        </label>
                        <textarea
                           className='w-full p-2 border rounded-md bg-gray-50'
                           rows={6}
                           value={description || ''}
                           readOnly
                        ></textarea>
                     </div>
                  </div>

                  {/* Variants section */}
                  <div className='mb-6'>
                     <h3 className='text-lg font-semibold mb-3'>Thông tin biến thể sản phẩm</h3>
                     <div className='space-y-4'>
                        {variants && variants.length > 0 ? (
                           variants.map((variant, index) => (
                              <div
                                 key={index}
                                 className='border rounded-lg overflow-hidden shadow-sm'
                              >
                                 {/* Accordion Header */}
                                 <div
                                    className='flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100'
                                    onClick={() => toggleVariantExpanded(index)}
                                 >
                                    <div className='font-medium'>
                                       {variant.type || 'Biến thể không tên'}
                                       {variant.value && ` - ${variant.value}`}
                                    </div>
                                    <svg
                                       xmlns='http://www.w3.org/2000/svg'
                                       className={`h-5 w-5 transform transition-transform ${variant.isExpanded ? 'rotate-180' : ''
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
                                    <div className='p-4 border-t'>
                                       <div className='grid grid-cols-2 gap-4'>
                                          <div>
                                             <label className='block text-sm font-medium mb-1'>
                                                Phân loại:
                                             </label>
                                             <input
                                                type='text'
                                                value={variant.type || ''}
                                                className='w-full p-2 border rounded-md bg-gray-50'
                                                readOnly
                                             />
                                          </div>
                                          <div>
                                             <label className='block text-sm font-medium mb-1'>
                                                Giá trị:
                                             </label>
                                             <input
                                                type='text'
                                                value={variant.values || variant.value || ''}
                                                className='w-full p-2 border rounded-md bg-gray-50'
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
                                                className='w-full p-2 border rounded-md bg-gray-50'
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
                                                className='w-full p-2 border rounded-md bg-gray-50'
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
                                             <div className='flex flex-wrap gap-2'>
                                                {variant.images.map((img, imgIndex) => (
                                                   <Image
                                                      key={imgIndex}
                                                      src={img}
                                                      alt={`Variant ${index + 1} image ${imgIndex + 1
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
                           ))
                        ) : (
                           <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
                              <p className='text-yellow-600'>Không có biến thể nào được tạo.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Price setting section */}
                  <div className='mb-6 p-4 border rounded-lg '>
                     <h3 className='text-lg font-semibold mb-4 '>Cài đặt giá cho sản phẩm</h3>

                     <div className='grid md:grid-cols-2 gap-4'>
                        {/* Giá gốc */}
                        <div className='mb-4'>
                           <label className='block text-sm font-medium mb-1'>
                              Giá gốc (VNĐ)<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='number'
                              className='w-full p-2 border rounded-md'
                              value={basePrice}
                              onChange={(e) => setBasePrice(e.target.value)}
                              placeholder='Nhập giá gốc'
                              required
                           />
                           <p className='text-xs text-gray-500 mt-1'>Giá bán gốc của sản phẩm</p>
                        </div>

                        {/* Phần trăm khuyến mãi */}
                        <div className='mb-4'>
                           <label className='block text-sm font-medium mb-1'>
                              Phần trăm khuyến mãi (%)
                           </label>
                           <input
                              type='number'
                              className='w-full p-2 border rounded-md'
                              value={discountPrice}
                              onChange={(e) => {
                                 const value = e.target.value;
                                 if (Number(value) >= 0 && Number(value) <= 100) {
                                    setDiscountPrice(value);
                                 }
                              }}
                              min='0'
                              max='100'
                              placeholder='Nhập % khuyến mãi (nếu có)'
                           />
                           <p className='text-xs text-gray-500 mt-1'>% giảm giá so với giá gốc</p>
                        </div>

                        {/* Ngày bắt đầu khuyến mãi */}
                        <div className='mb-4'>
                           <label className='block text-sm font-medium mb-1'>
                              Ngày bắt đầu<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='date'
                              className='w-full p-2 border rounded-md'
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              required
                           />
                           <p className='text-xs text-gray-500 mt-1'>Ngày áp dụng giá mới</p>
                        </div>

                        {/* Ngày kết thúc khuyến mãi */}
                        <div className='mb-4'>
                           <label className='block text-sm font-medium mb-1'>
                              Ngày kết thúc<span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='date'
                              className='w-full p-2 border rounded-md'
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              required
                           />
                           <p className='text-xs text-gray-500 mt-1'>Ngày kết thúc áp dụng giá này</p>
                        </div>
                     </div>

                     {/* Giá sẽ hiển thị */}
                     <div className='mt-6 p-3 bg-white rounded-md border border-blue-200'>
                        <div className='flex justify-between items-center'>
                           <span className='font-medium text-sm'>
                              Giá sẽ hiển thị cho khách hàng:
                           </span>
                           {discountPrice && Number(discountPrice) > 0 ? (
                              <div className='font-medium text-right'>
                                 <span className='font-bold text-lg text-blue-600'>
                                    {calculatedPrice
                                       ? `${Number(calculatedPrice).toLocaleString('vi-VN')} VNĐ`
                                       : '0 VNĐ'}
                                 </span>
                                 <div className='flex items-center mt-1 justify-end'>
                                    <span className='text-sm text-gray-500 line-through mr-2'>
                                       {basePrice
                                          ? `${Number(basePrice).toLocaleString('vi-VN')} VNĐ`
                                          : '0 VNĐ'}
                                    </span>
                                    <span className='text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded'>
                                       -{discountPrice}%
                                    </span>
                                 </div>
                              </div>
                           ) : (
                              <span className='font-bold text-lg text-blue-600'>
                                 {basePrice
                                    ? `${Number(basePrice).toLocaleString('vi-VN')} VNĐ`
                                    : '0 VNĐ'}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Form buttons */}
                  <div className='flex justify-end gap-2 mt-6'>
                     <button
                        onClick={() => {
                           // Update formData with current values before going back
                           updateFormData({
                              ...formData,
                              variants: variants.map((variant) => ({
                                 type: variant.type,
                                 values: variant.values || variant.value || '', // Ensure values is always a string, not undefined
                                 size: variant.size || '',
                                 images: variant.images || [],
                                 quantity: variant.quantity || 0,
                                 detailId: variant.detailId,
                                 isExpanded: variant.isExpanded,
                              })),
                           });
                           // Wait for formData update to complete before navigating
                           setTimeout(() => {
                              router.push('/seller/products/createproduct/step2');
                           }, 100);
                        }}
                        className='px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100'
                        disabled={isLoading}
                     >
                        Quay lại
                     </button>
                     <button
                        onClick={() => {
                           showToast('Bạn có chắc muốn hủy tạo sản phẩm không?', 'info');
                           // Wait a bit to show the toast before showing confirm dialog
                           setTimeout(() => {
                              handleCancel();
                           }, 100);
                        }}
                        className='px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100'
                        disabled={isLoading}
                     >
                        Hủy
                     </button>
                     <button
                        className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300'
                        onClick={handleSubmit}
                        disabled={isLoading}
                     >
                        {isLoading ? 'Đang xử lý...' : 'Tạo sản phẩm'}
                     </button>
                  </div>
               </div>
            </main>
            {/* Add Toast component at the end of your return statement */}
            <Toast
               show={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast((prev) => ({ ...prev, show: false }))}
               duration={3000}
               position='top-right'
            />
         </div>
      </div>
   );
}
