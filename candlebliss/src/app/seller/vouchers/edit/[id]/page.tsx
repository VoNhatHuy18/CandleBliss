'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiInfo, FiAlertCircle, FiSave } from 'react-icons/fi';
import { HOST } from '@/app/constants/api';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

// Define voucher interface
interface Voucher {
   id: string;
   code: string;
   name: string;
   percent_off: number;
   amount_off: number;
   end_date: string;
   start_date: string;
   usage_limit: number | null;
   usage_count: number;
   min_order_value: number;
   description: string;
   applicable_products: string;
   isActive: boolean;
}

export default function EditVoucher() {
   const params = useParams();
   const router = useRouter();
   const [originalVoucher, setOriginalVoucher] = useState<Voucher | null>(null);
   const [voucher, setVoucher] = useState<Voucher | null>(null);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');
   const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
   const [hasLimitedUses, setHasLimitedUses] = useState(true);

   // Format date for inputs (YYYY-MM-DD)
   const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
   };

   // Fetch voucher details when component mounts
   useEffect(() => {
      const fetchVoucherDetails = async () => {
         setLoading(true);
         try {
            // Get authentication token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               router.push('/seller/signin');
               return;
            }

            // Fetch voucher data from API
            const response = await fetch(
               `${HOST}/api/v1/vouchers/${params.id}`,
               {
                  method: 'GET',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (!response.ok) {
               if (response.status === 404) {
                  throw new Error('Không tìm thấy voucher này');
               }
               throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setOriginalVoucher(data);
            setVoucher(data);

            // Set initial form state based on voucher data
            setDiscountType(data.percent_off > 0 ? 'percent' : 'fixed');
            setHasLimitedUses(data.usage_limit !== null);
         } catch (err: unknown) {
            if (err instanceof Error) {
               console.error('Failed to fetch voucher:', err.message);
               setError(err.message || 'Không thể tải thông tin voucher. Vui lòng thử lại sau.');
            } else {
               console.error('Failed to fetch voucher:', err);
               setError('Không thể tải thông tin voucher. Vui lòng thử lại sau.');
            }
         } finally {
            setLoading(false);
         }
      };

      if (params.id) {
         fetchVoucherDetails();
      }
   }, [params.id, router]);

   // Handle input changes
   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
   ) => {
      if (!voucher) return;

      const { name, value } = e.target;

      // For number inputs, parse value as a number
      if (
         ['percent_off', 'amount_off', 'min_order_value', 'usage_limit'].includes(name) &&
         value !== ''
      ) {
         const numValue = parseFloat(value);
         setVoucher({ ...voucher, [name]: numValue });
      } else {
         setVoucher({ ...voucher, [name]: value });
      }
   };

   // Handle discount type change
   const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const type = e.target.value as 'percent' | 'fixed';
      setDiscountType(type);

      if (!voucher) return;

      if (type === 'percent') {
         setVoucher({ ...voucher, percent_off: voucher.percent_off || 10, amount_off: 0 });
      } else {
         setVoucher({ ...voucher, percent_off: 0, amount_off: voucher.amount_off || 10000 });
      }
   };

   // Handle usage limit change
   const handleUsageLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hasLimit = e.target.value === 'limited';
      setHasLimitedUses(hasLimit);

      if (!voucher) return;

      if (hasLimit) {
         setVoucher({ ...voucher, usage_limit: voucher.usage_limit || 100 });
      } else {
         setVoucher({ ...voucher, usage_limit: null });
      }
   };

   // Handle form submission
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!voucher) return;

      setSubmitting(true);

      try {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');

         // Only include fields that have changed in update request
         const changedFields: Record<string, string | number | boolean | null> = {};

         Object.keys(voucher).forEach((key) => {
            const voucherKey = key as keyof Voucher;
            if (originalVoucher && voucher[voucherKey] !== originalVoucher[voucherKey]) {
               changedFields[voucherKey] = voucher[voucherKey];
            }
         });

         // Skip update if nothing changed
         if (Object.keys(changedFields).length === 0) {
            alert('Không có thông tin nào được thay đổi.');
            router.push(`/seller/vouchers/${params.id}`);
            return;
         }

         // Send update request to API
         const response = await fetch(`${HOST}/api/v1/vouchers/${params.id}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(changedFields),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Cập nhật thất bại');
         }

         alert('Cập nhật mã giảm giá thành công');
         router.push(`/seller/vouchers/${params.id}`);
      } catch (err: unknown) {
         if (err instanceof Error) {
            console.error('Failed to update voucher:', err.message);
         } else {
            console.error('Failed to update voucher:', err);
         }
         if (err instanceof Error) {
            setError(err.message || 'Không thể cập nhật mã giảm giá. Vui lòng thử lại sau.');
         } else {
            setError('Không thể cập nhật mã giảm giá. Vui lòng thử lại sau.');
         }
      } finally {
         setSubmitting(false);
      }
   };

   // Check if current date is past voucher's end date
   const isVoucherExpired = () => {
      if (!voucher) return false;
      const now = new Date();
      const endDate = new Date(voucher.end_date);
      return endDate < now;
   };

   // Handle cancel button
   const handleCancel = () => {
      if (JSON.stringify(voucher) !== JSON.stringify(originalVoucher)) {
         if (confirm('Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?')) {
            router.push(`/seller/vouchers/${params.id}`);
         }
      } else {
         router.push(`/seller/vouchers/${params.id}`);
      }
   };

   // Render loading state
   if (loading) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16 flex items-center justify-center'>
                  <div className='w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin'></div>
               </div>
            </div>
         </div>
      );
   }

   // Render error state
   if (error) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16'>
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                     <FiAlertCircle className='h-16 w-16 text-red-400 mb-4' />
                     <h3 className='text-lg font-medium text-gray-600 mb-1'>Có lỗi xảy ra</h3>
                     <p className='text-gray-500 max-w-md'>{error}</p>
                     <Link href='/seller/vouchers'>
                        <button className='mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none'>
                           Quay lại danh sách
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // If no voucher found
   if (!voucher) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16'>
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                     <FiInfo className='h-16 w-16 text-gray-300 mb-4' />
                     <h3 className='text-lg font-medium text-gray-600 mb-1'>
                        Không tìm thấy mã giảm giá
                     </h3>
                     <p className='text-gray-500 max-w-md'>
                        Mã giảm giá không tồn tại hoặc đã bị xóa
                     </p>
                     <Link href='/seller/vouchers'>
                        <button className='mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none'>
                           Quay lại danh sách
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className='flex min-h-screen bg-[#f8f5f0]'>
         {/* Sidebar cố định bên trái */}
         <div className='fixed left-0 top-0 h-full z-30'>
            <MenuSideBar />
         </div>

         {/* Phần nội dung chính */}
         <div className='flex-1 flex flex-col ml-64'>
            {/* Header cố định phía trên */}
            <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
               <Header />
            </div>

            {/* Main content */}
            <div className='flex-1 p-6 mt-16'>
               <Head>
                  <title>Chỉnh sửa mã giảm giá - Candle Bliss</title>
               </Head>

               <div className='mb-6'>
                  <div className='text-sm mb-2'>
                     <Link href='/seller/vouchers' className='text-amber-600 hover:text-amber-800'>
                        Quản lý mã giảm giá
                     </Link>
                     <span className='mx-2 text-gray-400'>/</span>
                     <Link
                        href={`/seller/vouchers/${voucher.id}`}
                        className='text-amber-600 hover:text-amber-800'
                     >
                        Chi tiết mã giảm giá
                     </Link>
                     <span className='mx-2 text-gray-400'>/</span>
                     <span className='text-gray-700'>Chỉnh sửa</span>
                  </div>
                  <h1 className='text-xl font-medium'>Chỉnh sửa mã giảm giá</h1>
               </div>

               {isVoucherExpired() && (
                  <div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md'>
                     <div className='flex items-center text-amber-700'>
                        <FiAlertCircle className='h-5 w-5 mr-2' />
                        <p>
                           Mã giảm giá này đã hết hạn. Bạn có thể cập nhật ngày hết hạn để kích hoạt
                           lại.
                        </p>
                     </div>
                  </div>
               )}

               <form onSubmit={handleSubmit}>
                  <div className='bg-white rounded-md shadow-sm p-6 mb-6'>
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                           <h2 className='text-lg font-medium mb-4'>Thông tin cơ bản</h2>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Mã voucher
                              </label>
                              <input
                                 type='text'
                                 name='code'
                                 value={voucher.code}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 required
                                 placeholder='Nhập mã voucher'
                              />
                              <p className='text-xs text-gray-500 mt-1'>
                                 Mã voucher là duy nhất và được sử dụng để áp dụng giảm giá.
                              </p>
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Tên mã giảm giá
                              </label>
                              <input
                                 type='text'
                                 name='name'
                                 value={voucher.name || ''}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 placeholder='Nhập tên mã giảm giá (tùy chọn)'
                              />
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Mô tả
                              </label>
                              <textarea
                                 name='description'
                                 value={voucher.description || ''}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 rows={3}
                                 placeholder='Nhập mô tả cho mã giảm giá (tùy chọn)'
                              />
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Đối tượng áp dụng
                              </label>
                              <input
                                 type='text'
                                 name='applicable_products'
                                 value={voucher.applicable_products || ''}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 placeholder='Ví dụ: Tất cả sản phẩm, Nến thơm, v.v.'
                              />
                              <p className='text-xs text-gray-500 mt-1'>
                                 Để trống nếu áp dụng cho tất cả sản phẩm.
                              </p>
                           </div>
                        </div>

                        <div>
                           <h2 className='text-lg font-medium mb-4'>Thiết lập giảm giá</h2>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                 Loại giảm giá
                              </label>
                              <div className='flex gap-4'>
                                 <label className='flex items-center'>
                                    <input
                                       type='radio'
                                       name='discountType'
                                       value='percent'
                                       checked={discountType === 'percent'}
                                       onChange={handleDiscountTypeChange}
                                       className='mr-2 h-4 w-4 text-amber-600'
                                    />
                                    Phần trăm (%)
                                 </label>
                                 <label className='flex items-center'>
                                    <input
                                       type='radio'
                                       name='discountType'
                                       value='fixed'
                                       checked={discountType === 'fixed'}
                                       onChange={handleDiscountTypeChange}
                                       className='mr-2 h-4 w-4 text-amber-600'
                                    />
                                    Số tiền cố định
                                 </label>
                              </div>
                           </div>

                           {discountType === 'percent' ? (
                              <div className='mb-4'>
                                 <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Giảm giá (%)
                                 </label>
                                 <div className='relative'>
                                    <input
                                       type='number'
                                       name='percent_off'
                                       value={voucher.percent_off}
                                       onChange={handleChange}
                                       min='0'
                                       max='100'
                                       step='1'
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-10'
                                       required
                                    />
                                    <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500'>
                                       %
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className='mb-4'>
                                 <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Giảm giá (VND)
                                 </label>
                                 <input
                                    type='number'
                                    name='amount_off'
                                    value={voucher.amount_off}
                                    onChange={handleChange}
                                    min='0'
                                    step='1000'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                    required
                                 />
                              </div>
                           )}

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Giá trị đơn hàng tối thiểu (VND)
                              </label>
                              <input
                                 type='number'
                                 name='min_order_value'
                                 value={voucher.min_order_value}
                                 onChange={handleChange}
                                 min='0'
                                 step='1000'
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 required
                              />
                              <p className='text-xs text-gray-500 mt-1'>
                                 Đơn hàng phải có giá trị lớn hơn hoặc bằng giá trị này để áp dụng
                                 mã giảm giá.
                              </p>
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Thời gian bắt đầu
                              </label>
                              <input
                                 type='date'
                                 name='start_date'
                                 value={formatDateForInput(voucher.start_date)}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 required
                              />
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Thời gian kết thúc
                              </label>
                              <input
                                 type='date'
                                 name='end_date'
                                 value={formatDateForInput(voucher.end_date)}
                                 onChange={handleChange}
                                 className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 required
                              />
                           </div>

                           <div className='mb-4'>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                 Giới hạn sử dụng
                              </label>
                              <div className='flex gap-4 mb-3'>
                                 <label className='flex items-center'>
                                    <input
                                       type='radio'
                                       name='usageLimit'
                                       value='limited'
                                       checked={hasLimitedUses}
                                       onChange={handleUsageLimitChange}
                                       className='mr-2 h-4 w-4 text-amber-600'
                                    />
                                    Có giới hạn
                                 </label>
                                 <label className='flex items-center'>
                                    <input
                                       type='radio'
                                       name='usageLimit'
                                       value='unlimited'
                                       checked={!hasLimitedUses}
                                       onChange={handleUsageLimitChange}
                                       className='mr-2 h-4 w-4 text-amber-600'
                                    />
                                    Không giới hạn
                                 </label>
                              </div>

                              {hasLimitedUses && (
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                       Số lượt sử dụng tối đa
                                    </label>
                                    <input
                                       type='number'
                                       name='usage_limit'
                                       value={voucher.usage_limit || ''}
                                       onChange={handleChange}
                                       min='1'
                                       step='1'
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                       required={hasLimitedUses}
                                    />
                                    <div className='flex items-center mt-2 text-sm text-gray-600'>
                                       <span>Đã sử dụng: {voucher.usage_count || 0}</span>
                                       <span className='mx-2'>|</span>
                                       <span>
                                          Còn lại:{' '}
                                          {(voucher.usage_limit || 0) - (voucher.usage_count || 0)}
                                       </span>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className='flex justify-between'>
                     <button
                        type='button'
                        onClick={handleCancel}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none'
                     >
                        Hủy
                     </button>
                     <button
                        type='submit'
                        disabled={submitting}
                        className='px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none flex items-center'
                     >
                        {submitting ? (
                           <>
                              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                              Đang lưu...
                           </>
                        ) : (
                           <>
                              <FiSave className='mr-2' />
                              Lưu thay đổi
                           </>
                        )}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}
