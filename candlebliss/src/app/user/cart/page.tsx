'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

// Định nghĩa interface cho CartItem
interface CartItem {
   id: number;
   detailId: number;
   name: string;
   price: number;
   quantity: number;
   image: string;
   type: string;
   options: {
      name: string;
      value: string;
   }[];
}

export default function ShoppingCart() {
   // Thay thế dữ liệu mẫu bằng dữ liệu từ localStorage
   const [cartItems, setCartItems] = useState<CartItem[]>([]);

   // Lấy dữ liệu giỏ hàng từ localStorage khi component được mount
   useEffect(() => {
      try {
         const storedCartItems = JSON.parse(localStorage.getItem('cart') || '[]');
         setCartItems(storedCartItems);
      } catch (error) {
         console.error('Error loading cart data:', error);
         setCartItems([]);
      }
   }, []);

   const [voucher, setVoucher] = useState('');
   const [voucherError, setVoucherError] = useState('');
   const [voucherSuccess, setVoucherSuccess] = useState('');
   const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
   const [showAddressList, setShowAddressList] = useState(false);
   const [showAddressModal, setShowAddressModal] = useState(false);
   const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
   const [discount, setDiscount] = useState(0);
   const [voucherLoading, setVoucherLoading] = useState(false);
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

   // Thêm state để lưu danh sách gợi ý voucher
   const [suggestedVouchers, setSuggestedVouchers] = useState<any[]>([]);
   const [showVoucherSuggestions, setShowVoucherSuggestions] = useState(false);

   // Subtotal (tổng phụ) vẫn giữ nguyên
   const subtotal = useMemo(() => cartItems.reduce((total, item) => total + item.price * item.quantity, 0), [cartItems]);

   // Thêm useEffect để lấy danh sách voucher gợi ý khi component mount
   useEffect(() => {
      const fetchSuggestedVouchers = async () => {
         try {
            // Vì không có endpoint public nên chúng ta sẽ lấy tất cả voucher (có thể cần token)
            const token = localStorage.getItem('token');

            if (!token) {
               console.warn('Không có token để lấy danh sách voucher');
               return;
            }

            const response = await fetch('http://localhost:3000/api/v1/vouchers', {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
               }
            });

            if (!response.ok) {
               throw new Error('Không thể tải danh sách voucher');
            }

            const allVouchers = await response.json();

            // Lọc voucher có hiệu lực và có thể áp dụng
            const currentDate = new Date();
            const validVouchers = allVouchers.filter((voucher: { start_date: string | number | Date; end_date: string | number | Date; usage_limit: number; usage_count: number; min_order_value: number; hasOwnProperty: (arg0: string) => any; isActive: any; }) => {
               // Kiểm tra ngày hiệu lực
               const startDate = new Date(voucher.start_date);
               const endDate = new Date(voucher.end_date);
               const dateValid = currentDate >= startDate && currentDate <= endDate;

               // Kiểm tra số lần sử dụng
               const usageValid = !voucher.usage_limit || (voucher.usage_count < voucher.usage_limit);

               // Kiểm tra giá trị đơn hàng tối thiểu
               const minOrderValid = !voucher.min_order_value || subtotal >= voucher.min_order_value;

               // Kiểm tra trạng thái kích hoạt
               const isActiveValid = !voucher.hasOwnProperty('isActive') || voucher.isActive;

               return dateValid && usageValid && minOrderValid && isActiveValid;
            });

            setSuggestedVouchers(validVouchers);
         } catch (error) {
            console.error('Không thể tải danh sách mã giảm giá gợi ý:', error);
         }
      };

      // Chỉ fetch nếu người dùng đã đăng nhập và có sản phẩm trong giỏ hàng
      if (cartItems.length > 0) {
         fetchSuggestedVouchers();
      }
   }, [cartItems, subtotal]); // subtotal is now memoized and safe to use here

   const [updatingItem, setUpdatingItem] = useState<{ id: number, detailId: number } | null>(null);

   // Handle quantity change - cập nhật cả state và localStorage
   const updateQuantity = (id: number, detailId: number, newQuantity: number) => {
      if (newQuantity < 1) newQuantity = 1;
      if (newQuantity > 10) newQuantity = 10;

      // Set loading state
      setUpdatingItem({ id, detailId });

      // Update cart with slight delay to show loading
      setTimeout(() => {
         const updatedItems = cartItems.map((item) =>
            (item.id === id && item.detailId === detailId)
               ? { ...item, quantity: newQuantity }
               : item
         );

         setCartItems(updatedItems);
         localStorage.setItem('cart', JSON.stringify(updatedItems));
         setUpdatingItem(null);
      }, 300);
   };

   // Handle item removal - xóa khỏi cả state và localStorage
   const removeItem = (id: number, detailId: number) => {
      const updatedItems = cartItems.filter(
         (item) => !(item.id === id && item.detailId === detailId)
      );

      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
   };

   // Apply voucher
   const applyVoucher = async () => {
      // Reset các trạng thái thông báo
      setVoucherError('');
      setVoucherSuccess('');

      if (!voucher) {
         setVoucherError('Vui lòng nhập mã giảm giá');
         return;
      }

      setVoucherLoading(true);

      try {
         // Lấy token từ localStorage (nếu có)
         const token = localStorage.getItem('token');

         // Gọi API để kiểm tra voucher bằng code
         const response = await fetch(`http://localhost:3000/api/v1/vouchers/code/${voucher}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
         });

         // Nếu không tìm thấy voucher
         if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Mã giảm giá không hợp lệ');
         }

         // Lấy dữ liệu voucher
         const voucherData = await response.json();

         // Kiểm tra ngày bắt đầu và kết thúc của voucher
         const currentDate = new Date();
         const startDate = new Date(voucherData.start_date);
         const endDate = new Date(voucherData.end_date);

         if (currentDate < startDate) {
            throw new Error('Mã giảm giá chưa có hiệu lực');
         }

         if (currentDate > endDate) {
            throw new Error('Mã giảm giá đã hết hạn');
         }

         // Kiểm tra số lần sử dụng
         if (voucherData.usage_limit && voucherData.usage_count >= voucherData.usage_limit) {
            throw new Error('Mã giảm giá đã hết lượt sử dụng');
         }

         // Kiểm tra giá trị đơn hàng tối thiểu
         if (voucherData.min_order_value && subtotal < voucherData.min_order_value) {
            throw new Error(`Giá trị đơn hàng tối thiểu để áp dụng mã này là ${voucherData.min_order_value.toLocaleString('vi-VN')}₫`);
         }

         // Kiểm tra trạng thái kích hoạt
         if (voucherData.hasOwnProperty('isActive') && !voucherData.isActive) {
            throw new Error('Mã giảm giá này hiện không khả dụng');
         }

         // Xác định giá trị giảm giá
         let discountAmount = 0;

         if (voucherData.percent_off > 0) {
            // Giảm giá theo phần trăm
            discountAmount = Math.min((subtotal * voucherData.percent_off) / 100, voucherData.max_discount || Infinity);
            setVoucherSuccess(`Áp dụng mã giảm giá thành công: Giảm ${voucherData.percent_off}%`);
         } else if (voucherData.amount_off > 0) {
            // Giảm giá theo số tiền cố định
            discountAmount = Math.min(voucherData.amount_off, subtotal);
            setVoucherSuccess(`Áp dụng mã giảm giá thành công: Giảm ${voucherData.amount_off.toLocaleString('vi-VN')}₫`);
         } else {
            throw new Error('Mã giảm giá không hợp lệ');
         }

         // Cập nhật state
         setAppliedVoucher(voucherData);
         setDiscount(discountAmount);

      } catch (error) {
         console.error('Lỗi khi áp dụng voucher:', error);
         setVoucherError(error instanceof Error ? error.message : 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      } finally {
         setVoucherLoading(false);
      }
   };

   // Thêm hàm để hủy áp dụng voucher
   const removeVoucher = () => {
      setVoucher('');
      setAppliedVoucher(null);
      setDiscount(0);
      setVoucherSuccess('');
      setVoucherError('');
   };

   // Cập nhật phần tính giá trị giỏ hàng
   // Subtotal (tổng phụ) vẫn giữ nguyên
   // Discount không còn là giá trị cố định mà dựa vào voucher đã áp dụng
   // (đã cập nhật trong hàm applyVoucher)

   // Final total
   const totalPrice = subtotal - discount;

   // Calculate number of items
   const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

   // Cập nhật phần render để sử dụng cartItems mới
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
                                 key={`${item.id}-${item.detailId}`} // Sử dụng id + detailId làm key
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
                                             <Link href={`/user/products/${item.id}`}>{item.name}</Link>
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

                                          {/* Nút xóa sản phẩm - hiển thị trên mobile */}
                                          <div className='mt-3 md:hidden'>
                                             <button
                                                onClick={() => removeItem(item.id, item.detailId)}
                                                className='flex items-center text-sm text-red-500 hover:text-red-600 transition-colors'
                                             >
                                                <TrashIcon className='h-4 w-4 mr-1' />
                                                <span>Xóa</span>
                                             </button>
                                          </div>
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
                                          onClick={() => updateQuantity(item.id, item.detailId, item.quantity - 1)}
                                          className='px-1 py-2 text-gray-600 hover:bg-gray-100 transition-colors'
                                          aria-label='Giảm số lượng'
                                          disabled={updatingItem?.id === item.id && updatingItem?.detailId === item.detailId}
                                       >
                                          <MinusIcon className='h-3 w-3' />
                                       </button>
                                       <input
                                          value={
                                             updatingItem?.id === item.id && updatingItem?.detailId === item.detailId
                                                ? '...'
                                                : item.quantity
                                          }
                                          onChange={(e) =>
                                             updateQuantity(item.id, item.detailId, parseInt(e.target.value) || 1)
                                          }
                                          className='w-12 text-center border-x py-1 text-sm focus:outline-none'
                                          disabled={updatingItem?.id === item.id && updatingItem?.detailId === item.detailId}
                                          min='1'
                                          max='10'
                                       />
                                       <button
                                          onClick={() => updateQuantity(item.id, item.detailId, item.quantity + 1)}
                                          className='px-1 py-2 text-gray-600 hover:bg-gray-100 transition-colors'
                                          aria-label='Tăng số lượng'
                                       >
                                          <PlusIcon className='h-3 w-3' />
                                       </button>
                                    </div>
                                 </div>

                                 {/* Total + Delete - Desktop */}
                                 <div className='hidden md:flex md:col-span-2 justify-end items-center gap-3'>
                                    <div className='text-gray-800 font-medium'>
                                       {(item.price * item.quantity).toLocaleString()}₫
                                    </div>
                                    <button
                                       onClick={() => removeItem(item.id, item.detailId)}
                                       className='text-red-500 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full'
                                       aria-label='Xóa sản phẩm'
                                    >
                                       <TrashIcon className='h-4 w-4' />
                                    </button>
                                 </div>

                                 {/* Price + Total - Mobile */}
                                 <div className='grid grid-cols-2 md:hidden col-span-1 text-sm'>
                                    <div>
                                       <span className='text-gray-500'>Đơn giá:</span>
                                       <div className='font-medium text-amber-600'>{item.price.toLocaleString()}₫</div>
                                    </div>
                                    <div className='text-right'>
                                       <span className='text-gray-500'>Tổng:</span>
                                       <div className='font-medium'>{(item.price * item.quantity).toLocaleString()}₫</div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Continue Shopping Button */}
                        <div className='mt-6'>
                           <Link
                              href='/user/products'
                              className='inline-flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors'
                           >
                              <ArrowLeftIcon className='h-4 w-4' />
                              <span>Tiếp tục mua sắm</span>
                           </Link>
                        </div>
                     </div>
                     {/* Order Summary */}
                     <div className='w-full lg:w-1/3'>
                        <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
                           <h2 className='text-lg font-semibold mb-5 pb-4 border-b'>
                              Thông Tin Đơn Hàng
                           </h2>

                           {/* Voucher Code Input với thêm nút xóa voucher */}
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
                                    disabled={appliedVoucher !== null} // Vô hiệu hóa khi đã áp dụng voucher
                                 />
                                 {appliedVoucher ? (
                                    <button
                                       onClick={removeVoucher}
                                       className='bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-r-lg transition-colors border border-gray-300 border-l-0'
                                    >
                                       Hủy
                                    </button>
                                 ) : (
                                    <button
                                       onClick={applyVoucher}
                                       disabled={voucherLoading} // Vô hiệu hóa khi đang loading
                                       className='bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-r-lg transition-colors flex items-center'
                                    >
                                       {voucherLoading ? (
                                          <>
                                             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                             </svg>
                                             Đang xử lý
                                          </>
                                       ) : (
                                          'Áp dụng'
                                       )}
                                    </button>
                                 )}
                              </div>
                              {voucherError && (
                                 <p className='text-red-500 text-xs mt-1'>{voucherError}</p>
                              )}
                              {voucherSuccess && (
                                 <p className='text-green-600 text-xs mt-1'>{voucherSuccess}</p>
                              )}
                           </div>

                           {/* Thêm phần hiển thị gợi ý voucher sau phần nhập mã */}
                           <div className='mt-2'>
                              <button
                                 onClick={() => setShowVoucherSuggestions(!showVoucherSuggestions)}
                                 className='text-amber-600 text-xs underline focus:outline-none'
                              >
                                 {showVoucherSuggestions ? 'Ẩn gợi ý' : 'Xem các mã giảm giá hiện có'}
                              </button>

                              {showVoucherSuggestions && suggestedVouchers.length > 0 && (
                                 <div className='mt-2 p-3 border border-dashed border-amber-300 rounded-lg bg-amber-50'>
                                    <p className='text-xs font-medium text-gray-700 mb-2'>Mã giảm giá hiện có:</p>
                                    <div className='flex flex-wrap gap-2'>
                                       {suggestedVouchers.map((voucher) => (
                                          <div
                                             key={voucher.id}
                                             onClick={() => setVoucher(voucher.code)}
                                             className='cursor-pointer px-2 py-1 bg-white text-xs border border-amber-200 rounded-md hover:bg-amber-100 transition-colors'
                                          >
                                             <div className='font-mono font-medium text-amber-700'>{voucher.code}</div>
                                             <div className='text-gray-600 text-[10px] whitespace-nowrap'>
                                                {voucher.percent_off > 0
                                                   ? `Giảm ${voucher.percent_off}%`
                                                   : `Giảm ${voucher.amount_off.toLocaleString('vi-VN')}₫`
                                                }
                                                {voucher.min_order_value > 0 && (
                                                   <span> | Tối thiểu {voucher.min_order_value.toLocaleString('vi-VN')}₫</span>
                                                )}
                                             </div>
                                             <div className='text-gray-500 text-[9px]'>
                                                HSD: {new Date(voucher.end_date).toLocaleDateString('vi-VN')}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {showVoucherSuggestions && suggestedVouchers.length === 0 && (
                                 <div className='mt-2 p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50'>
                                    <p className='text-xs text-gray-500'>Hiện không có mã giảm giá nào.</p>
                                 </div>
                              )}
                           </div>

                           {/* Order Calculations */}
                           <div className='space-y-3 text-sm'>
                              <div className='flex justify-between'>
                                 <span className='text-gray-600'>Tạm tính:</span>
                                 <span>{subtotal.toLocaleString()}₫</span>
                              </div>

                              {/* Cập nhật phần hiển thị giảm giá */}
                              {discount > 0 && (
                                 <div className='flex justify-between text-green-600'>
                                    <span>Giảm giá:</span>
                                    <span>-{discount.toLocaleString('vi-VN')}₫</span>
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
                              <Link href='/user/checkout'>
                                 <button
                                    onClick={() => {
                                       // Lưu thông tin giỏ hàng và voucher để sử dụng ở trang thanh toán
                                       if (appliedVoucher) {
                                          // Chỉ lưu những thông tin cần thiết
                                          const voucherInfo = {
                                             id: appliedVoucher.id,
                                             code: appliedVoucher.code,
                                             percent_off: appliedVoucher.percent_off,
                                             amount_off: appliedVoucher.amount_off,
                                             discountAmount: discount // Lưu số tiền đã giảm
                                          };
                                          localStorage.setItem('appliedVoucher', JSON.stringify(voucherInfo));
                                       } else {
                                          // Xóa voucher cũ nếu không có voucher mới
                                          localStorage.removeItem('appliedVoucher');
                                       }
                                    }}
                                    className='w-full bg-amber-800 hover:bg-amber-900 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2'
                                 >
                                    <ShoppingBagIcon className='h-5 w-5' />
                                    Thanh Toán Ngay
                                 </button>
                              </Link>
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
                     <Link href='/user/products'>
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
