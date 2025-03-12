'use client';

import React, { useState } from 'react';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import Header from '@/app/components/user/nav/page';
import Image from 'next/image';
import Link from 'next/link';
import {
   TrashIcon,
   PencilIcon,
   PlusIcon,
   MinusIcon,
   ArrowLeftIcon,
   ShoppingBagIcon,
   HeartIcon,
   ChevronDownIcon,
   MapPinIcon,
} from '@heroicons/react/24/outline';

export default function ShoppingCart() {
   // Sample product data
   const [cartItems, setCartItems] = useState([
      {
         id: 1,
         name: 'GIỎ TRUYỀN THÔNG 01 - COMBO 9KG',
         price: 120000,
         quantity: 1,
         image: '/images/image.png',
         type: 'Mùi hương: Hương sen đào',
         options: [
            { name: 'Kích thước', value: 'Lớn' },
            { name: 'Màu sắc', value: 'Trắng ngà' },
         ],
      },
      {
         id: 2,
         name: 'GIỎ TRUYỀN THÔNG 01 - COMBO 9KG',
         price: 120000,
         quantity: 2,
         image: '/images/image.png',
         type: 'Mùi hương: Hương sen đào',
         options: [
            { name: 'Kích thước', value: 'Trung bình' },
            { name: 'Màu sắc', value: 'Hồng nhạt' },
         ],
      },
   ]);

   const [voucher, setVoucher] = useState('');
   const [voucherError, setVoucherError] = useState('');
   const [voucherSuccess, setVoucherSuccess] = useState('');
   const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
   const [showAddressList, setShowAddressList] = useState(false);
   const [showAddressModal, setShowAddressModal] = useState(false);
   const addresses = [
      {
         id: 1,
         name: 'Nguyen Van A',
         phone: '0123456789',
         address: '123 Street',
         district: 'District 1',
         city: 'Ho Chi Minh City',
         isDefault: true,
      },
      {
         id: 2,
         name: 'Nguyen Van B',
         phone: '0987654321',
         address: '456 Street',
         district: 'District 2',
         city: 'Ho Chi Minh City',
         isDefault: false,
      },
   ];

   // Handle quantity change
   const updateQuantity = (id: number, newQuantity: number) => {
      if (newQuantity < 1) newQuantity = 1;
      if (newQuantity > 10) newQuantity = 10;

      setCartItems(
         cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)),
      );
   };

   // Handle item removal
   const removeItem = (id: number) => {
      setCartItems(cartItems.filter((item) => item.id !== id));
   };

   // Apply voucher
   const applyVoucher = () => {
      if (!voucher) {
         setVoucherError('Vui lòng nhập mã giảm giá');
         return;
      }

      // Example validation - in real app, this would check against valid codes
      if (voucher === 'SALE10') {
         setVoucherSuccess('Áp dụng mã giảm giá thành công: Giảm 10%');
         setVoucherError('');
      } else {
         setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
         setVoucherSuccess('');
      }
   };

   // Calculate subtotal
   const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

   // Discount (if voucher is applied)
   const discount = voucherSuccess ? subtotal * 0.1 : 0;

   // Final total
   const totalPrice = subtotal - discount;

   // Calculate number of items
   const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

   return (
      <div className='bg-gray-50 min-h-screen flex flex-col'>
         {/* Header */}
         <Header />

         {/* Main Content */}
         <div className='flex-grow'>
            {/* Breadcrumb */}
            <div className='container mx-auto px-4 py-4 text-sm'>
               <div className='flex items-center space-x-2'>
                  <Link href='/user/home' className='text-gray-500 hover:text-amber-600 transition-colors'>
                     Trang chủ
                  </Link>
                  <span className='text-gray-400'>/</span>
                  <span className='text-gray-700 font-medium'>Giỏ hàng</span>
               </div>
            </div>

            <div className='container mx-auto px-4 py-6 max-w-7xl'>
               <div className='flex items-center justify-between mb-8'>
                  <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>
                     Giỏ Hàng Của Tôi
                  </h1>
                  <span className='text-sm text-gray-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100'>
                     {itemCount} sản phẩm
                  </span>
               </div>

               {cartItems.length > 0 ? (
                  <div className='flex flex-col lg:flex-row gap-8'>
                     {/* Cart Items */}
                     <div className='w-full lg:w-2/3'>
                        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                           {/* Cart Header */}
                           <div className='bg-gray-50 px-6 py-4 border-b text-sm font-medium text-gray-700 hidden md:grid md:grid-cols-12'>
                              <div className='col-span-6'>Sản phẩm</div>
                              <div className='col-span-2 text-center'>Đơn giá</div>
                              <div className='col-span-2 text-center'>Số lượng</div>
                              <div className='col-span-2 text-right'>Tổng tiền</div>
                           </div>

                           {/* Cart Items */}
                           {cartItems.map((item) => (
                              <div
                                 key={item.id}
                                 className='px-6 py-6 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center'
                              >
                                 {/* Product Info - Mobile & Desktop */}
                                 <div className='col-span-1 md:col-span-6'>
                                    <div className='flex gap-4'>
                                       <div className='w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border'>
                                          <Image
                                             src={item.image}
                                             alt={item.name}
                                             width={96}
                                             height={96}
                                             className='w-full h-full object-cover'
                                          />
                                       </div>
                                       <div className='flex-grow'>
                                          <h3 className='font-medium text-gray-800 mb-1 hover:text-amber-600 transition-colors'>
                                             <Link href={`/product/${item.id}`}>{item.name}</Link>
                                          </h3>
                                          <p className='text-sm text-gray-500 mb-2'>{item.type}</p>

                                          {item.options && item.options.length > 0 && (
                                             <div className='space-y-1 mb-2'>
                                                {item.options.map((option, idx) => (
                                                   <div key={idx} className='text-xs text-gray-500'>
                                                      <span className='inline-block w-20'>
                                                         {option.name}:
                                                      </span>
                                                      <span className='font-medium text-gray-700'>
                                                         {option.value}
                                                      </span>
                                                   </div>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Price - Desktop */}
                                 <div className='hidden md:block md:col-span-2 text-center'>
                                    <div className='text-amber-600 font-medium'>
                                       {item.price.toLocaleString()}₫
                                    </div>
                                 </div>

                                 {/* Quantity - All screens */}
                                 <div className='col-span-1 md:col-span-2 flex justify-center'>
                                    <div className='flex items-center border rounded-lg overflow-hidden'>
                                       <button
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className='px-1 py-2 text-gray-600 hover:bg-gray-100 transition-colors'
                                          aria-label='Giảm số lượng'
                                       >
                                          <MinusIcon className='h-3 w-3' />
                                       </button>
                                       <input
                                          value={item.quantity}
                                          onChange={(e) =>
                                             updateQuantity(item.id, parseInt(e.target.value) || 1)
                                          }
                                          className='w-12 text-center border-x py-1 text-sm focus:outline-none'
                                          min='1'
                                          max=''
                                       />
                                       <button
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className='px-1 py-2 text-gray-600 hover:bg-gray-100 transition-colors'
                                          aria-label='Tăng số lượng'
                                       >
                                          <PlusIcon className='h-3 w-3' />
                                       </button>
                                    </div>
                                 </div>

                                 {/* Total - Desktop */}
                                 <div className='hidden md:flex md:col-span-2 justify-end items-center gap-3'>
                                    <div className='text-gray-800 font-medium'>
                                       {(item.price * item.quantity).toLocaleString()}₫
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Continue Shopping Button */}
                        <div className='mt-6'>
                           <Link
                              href='/user/product'
                              className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors'
                           >
                              <ArrowLeftIcon className='h-4 w-4' />
                              <span>Tiếp tục mua sắm</span>
                           </Link>
                        </div>
                     </div>
                     de
                     {/* Order Summary */}
                     <div className='w-full lg:w-1/3'>
                        <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
                           <h2 className='text-lg font-semibold mb-5 pb-4 border-b'>
                              Thông Tin Đơn Hàng
                           </h2>

                           {/* Voucher Code Input */}
                           <div className='mb-6'>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                 Mã giảm giá
                              </label>
                              <div className='flex'>
                                 <input
                                    type='text'
                                    value={voucher}
                                    onChange={(e) => setVoucher(e.target.value)}
                                    placeholder='Nhập mã giảm giá'
                                    className='flex-grow rounded-l-lg border-r-0 border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 px-4 py-2 text-sm focus:outline-none'
                                 />
                                 <button
                                    onClick={applyVoucher}
                                    className='bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-r-lg transition-colors'
                                 >
                                    Áp dụng
                                 </button>
                              </div>
                              {voucherError && (
                                 <p className='text-red-500 text-xs mt-1'>{voucherError}</p>
                              )}
                              {voucherSuccess && (
                                 <p className='text-green-600 text-xs mt-1'>{voucherSuccess}</p>
                              )}
                           </div>

                           {/* Order Calculations */}
                           <div className='space-y-3 text-sm'>
                              <div className='flex justify-between'>
                                 <span className='text-gray-600'>Tạm tính:</span>
                                 <span>{subtotal.toLocaleString()}₫</span>
                              </div>

                              {discount > 0 && (
                                 <div className='flex justify-between text-green-600'>
                                    <span>Giảm giá:</span>
                                    <span>-{discount.toLocaleString()}₫</span>
                                 </div>
                              )}

                              <div className='text-gray-500'>
                                 <div className='flex justify-between'>
                                    <span>Phí vận chuyển:</span>
                                    <span>Tính khi thanh toán</span>
                                 </div>
                              </div>

                              <div className='pt-3 mt-3 border-t border-dashed'>
                                 <div className='flex justify-between items-center'>
                                    <span className='font-medium'>Tổng cộng:</span>
                                    <span className='text-xl font-bold text-amber-700'>
                                       {totalPrice.toLocaleString()}₫
                                    </span>
                                 </div>
                                 <div className='text-xs text-gray-500 text-right mt-1'>
                                    (Đã bao gồm thuế VAT)
                                 </div>
                              </div>
                           </div>

                           {/* Action Buttons */}
                           <div className='mt-6 space-y-3'>
                              <button className='w-full bg-amber-800 hover:bg-amber-900 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2'>
                                 <ShoppingBagIcon className='h-5 w-5' />
                                 Thanh Toán Ngay
                              </button>
                           </div>

                           {/* Benefits */}
                           <div className='mt-6 pt-6 border-t'>
                              <div className='grid grid-cols-2 gap-4'>
                                 <div className='flex items-center gap-2'>
                                    <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
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
                                             d='M5 13l4 4L19 7'
                                          />
                                       </svg>
                                    </div>
                                    <span className='text-xs'>Giao hàng toàn quốc</span>
                                 </div>
                                 <div className='flex items-center gap-2'>
                                    <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
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
                                             d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                                          />
                                       </svg>
                                    </div>
                                    <span className='text-xs'>Bảo mật thanh toán</span>
                                 </div>
                                 <div className='flex items-center gap-2'>
                                    <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
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
                                             d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                                          />
                                       </svg>
                                    </div>
                                    <span className='text-xs'>Đổi trả dễ dàng</span>
                                 </div>
                                 <div className='flex items-center gap-2'>
                                    <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
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
                                             d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                          />
                                       </svg>
                                    </div>
                                    <span className='text-xs'>Hỗ trợ 24/7</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  // Empty cart state
                  <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                     <div className='flex justify-center mb-4'>
                        <div className='h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center'>
                           <ShoppingBagIcon className='h-12 w-12 text-amber-600' />
                        </div>
                     </div>
                     <h2 className='text-2xl font-medium text-gray-800 mb-3'>
                        Giỏ hàng của bạn đang trống
                     </h2>
                     <p className='text-gray-500 mb-6'>
                        Thêm sản phẩm vào giỏ hàng để tiến hành mua sắm
                     </p>
                     <Link href='/user/product'>
                        <button className='bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors'>
                           Tiếp Tục Mua Sắm
                        </button>
                     </Link>
                  </div>
               )}

               {/* Recently Viewed Products */}
               <div className='mt-16'>
                  <ViewedCarousel />
               </div>
            </div>
         </div>

         {/* Footer */}
         <Footer />
      </div>
   );
}
