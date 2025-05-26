'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Toast from '@/app/components/ui/toast/Toast';

// Update the VoucherTag props in the VoucherTags.tsx file
interface VoucherTagProps {
   id: string;
   code: string;
   discount: string;
   description: string;
   minOrderValue: string;
   maxVoucherAmount: string;
   usageLimit: number;
   usagePerCustomer: number;
   startDate: string;
   endDate: string;
   status: string;
   newCustomersOnly: boolean;
   newCustomerText?: string | null; // Add this new prop
   isEligible?: boolean; // Add this new prop
   isVipOnly?: boolean; // Add new prop for VIP-only vouchers
   isUserVip?: boolean; // Add new prop to know if current user is VIP
}

const VoucherTag: React.FC<VoucherTagProps> = ({
   code,
   discount,
   description,
   minOrderValue,
   maxVoucherAmount,
   usageLimit,
   usagePerCustomer,
   startDate,
   endDate,
   status,
   newCustomersOnly,
}) => {
   const [showDetails, setShowDetails] = useState(false);
   const [showToast, setShowToast] = useState(false);

   // Format number to VND currency
   const formatCurrency = (value: string) => {
      return parseInt(value).toLocaleString('vi-VN') + 'đ';
   };

   // Handle copy to clipboard with toast notification
   const handleCopyCode = () => {
      if (navigator?.clipboard?.writeText) {
         navigator.clipboard
            .writeText(code)
            .then(() => {
               setShowToast(true);
            })
            .catch((err) => {
               console.error('Không thể sao chép mã:', err);
               fallbackCopyToClipboard(code);
            });
      } else {
         fallbackCopyToClipboard(code);
      }
   };

   // Fallback copy method using textarea
   const fallbackCopyToClipboard = (text: string) => {
      try {
         const textarea = document.createElement('textarea');
         textarea.value = text;
         document.body.appendChild(textarea);
         textarea.select();
         document.execCommand('copy');
         document.body.removeChild(textarea);
         setShowToast(true);
      } catch (err) {
         console.error('Fallback: Không thể sao chép mã:', err);
      }
   };

   return (
      <>
         <div className='relative border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-all'>
            <div className='flex'>
               {/* Left side with curved edge and candle icon */}
               <div className='relative w-16 flex items-center justify-center py-6 border-r border-dashed border-gray-200 bg-amber-50'>
                  <Image
                     src='/images/logo.png'
                     width={50}
                     height={50}
                     alt='Candle Bliss Logo'
                     className='w-max h-max'
                  />
               </div>

               {/* Right side with voucher info */}
               <div className='flex-1 p-4'>
                  {/* Top section with discount highlight */}
                  <div className='flex justify-between items-start mb-2'>
                     <div className='flex flex-col'>
                        <span className='text-sm font-medium text-gray-500'>Mã Voucher:</span>
                        <div className='flex items-center'>
                           <span className='font-bold text-lg text-gray-800'>{code}</span>
                           <button
                              onClick={handleCopyCode}
                              className='ml-2 text-amber-500 hover:text-amber-600'
                              aria-label='Sao chép mã giảm giá'
                           >
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-4 w-4'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                 />
                              </svg>
                           </button>
                        </div>
                     </div>
                     <div className='px-3 py-1 bg-red-100 text-red-600 font-bold rounded-full text-sm'>
                        {discount}
                     </div>
                  </div>

                  {/* Description */}
                  <div className='text-sm text-gray-700 font-medium mb-2'>{description}</div>

                  {/* Minimum order and maximum discount */}
                  <div className='text-xs text-gray-600 mb-2 flex flex-wrap gap-2'>
                     <div className='bg-gray-100 px-2 py-1 rounded-md'>
                        Đơn tối thiểu:{' '}
                        <span className='font-semibold'>{formatCurrency(minOrderValue)}</span>
                     </div>
                     <div className='bg-gray-100 px-2 py-1 rounded-md'>
                        Giảm tối đa:{' '}
                        <span className='font-semibold'>{formatCurrency(maxVoucherAmount)}</span>
                     </div>
                  </div>

                  {/* Expiry and status */}
                  <div className='flex justify-between items-center mt-3 text-sm'>
                     <div className='text-gray-600'>HSD: {endDate}</div>
                     <div className='flex items-center'>
                        <span
                           className={`py-1 px-2 rounded-full text-xs font-medium ${status === 'Còn hiệu lực'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                              }`}
                        >
                           {status}
                        </span>
                     </div>
                  </div>

                  {/* Conditional new customer badge */}
                  {newCustomersOnly && (
                     <div className='absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg'>
                        Đơn hàng đầu tiên
                     </div>
                  )}

                  {/* Toggle details button */}
                  <button
                     onClick={() => setShowDetails(!showDetails)}
                     className='mt-2 text-amber-500 hover:text-amber-600 text-sm flex items-center'
                  >
                     {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                     <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className={`h-4 w-4 ml-1 transition-transform ${showDetails ? 'rotate-180' : ''
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
                  </button>

                  {/* Additional details when expanded */}
                  {showDetails && (
                     <div className='mt-3 pt-3 border-t border-dashed border-gray-200 text-xs text-gray-600 space-y-2'>
                        <div className='flex justify-between'>
                           <span>Thời gian áp dụng:</span>
                           <span className='font-medium'>
                              {startDate} - {endDate}
                           </span>
                        </div>
                        <div className='flex justify-between'>
                           <span>Số lượt sử dụng còn lại:</span>
                           <span className='font-medium'>{usageLimit}</span>
                        </div>
                        <div className='flex justify-between'>
                           <span>Sử dụng tối đa/khách hàng:</span>
                           <span className='font-medium'>{usagePerCustomer}</span>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Toast notification */}
         <Toast
            show={showToast}
            message={`Mã "${code}" đã được sao chép `}
            type='success'
            duration={2000}
            onClose={() => setShowToast(false)}
            position='top-right'
         />
      </>
   );
};

export default VoucherTag;
