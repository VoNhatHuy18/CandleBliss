'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface VoucherTagProps {
   id: string;
   code: string;
   discount: string;
   expiryDate: string;
   status: string;
}

const VoucherTag: React.FC<VoucherTagProps> = ({ id, code, discount, expiryDate, status }) => {
   const router = useRouter();

   const handleVoucherClick = () => {
      router.push(`/seller/vouchers/${id || code}`);
   };

   return (
      <div 
         className='relative border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer hover:border-amber-300'
         onClick={handleVoucherClick}
      >
         <div className='flex'>
            {/* Left side with curved edge and candle icon */}
            <div className='relative w-16 flex items-center justify-center py-4 border-r border-dashed border-gray-200'>
               <Image src='/images/logo.png' width={50} height={50} alt='Candle Bliss Logo' className='w-max h-max' />
            </div>

            {/* Right side with voucher info */}
            <div className='flex-1 p-3'>
               <div className='text-sm text-gray-700 font-medium mb-1.5'>
                  Mã Voucher: <span className='font-bold'>{code}</span>
               </div>

               <div className='font-medium mb-1.5'>
                  Giảm <span className='text-red-500 font-bold'>{discount}</span> 
               </div>

               <div className='text-sm text-gray-600 mb-1.5'>HSD: {expiryDate}</div>

               <div className='text-sm flex items-center'>
                  <span className='mr-2 text-gray-600'>Tình Trạng:</span>
                  <span
                     className={`font-medium ${
                        status === 'Còn hiệu lực' ? 'text-green-600' : 'text-red-500'
                     }`}
                  >
                     {status}
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default VoucherTag;