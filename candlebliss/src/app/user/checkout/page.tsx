'use client';

import React, { useState, useEffect } from 'react';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import Header from '@/app/components/user/nav/page';
import Image from 'next/image';
import Link from 'next/link';
import {
   ChevronLeftIcon,
   ChevronRightIcon,
   MapPinIcon,
   CreditCardIcon,
   TruckIcon,
   ShoppingBagIcon,
   PlusIcon,
   MinusIcon,
   XMarkIcon,
   EyeIcon,
   CheckIcon,
   ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, PencilIcon } from 'lucide-react';

export default function CheckoutPage() {
   // States
   const [selectedPayment, setSelectedPayment] = useState('cod');
   const [showAddressModal, setShowAddressModal] = useState(false);
   const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment, 3: Review
   const [showBankPayments, setShowBankPayments] = useState(false);
   const [acceptTerms, setAcceptTerms] = useState(false);
   const [addresses, setAddresses] = useState([
      {
         id: 1,
         name: 'Nguyễn Văn A',
         phone: '0901234567',
         address: '123 Đường Lê Lợi, Phường Bến Nghé',
         district: 'Quận 1',
         city: 'TP. Hồ Chí Minh',
         isDefault: true,
      },
      {
         id: 2,
         name: 'Nguyễn Văn A',
         phone: '0909876543',
         address: '456 Đường Nguyễn Huệ, Phường Bến Nghé',
         district: 'Quận 1',
         city: 'TP. Hồ Chí Minh',
         isDefault: false,
      },
   ]);
   const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
   const [showAddressList, setShowAddressList] = useState(false);
   const [newAddress, setNewAddress] = useState({
      name: '',
      phone: '',
      address: '',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      isDefault: false,
   });

   const [formErrors, setFormErrors] = useState({
      name: '',
      phone: '',
      address: '',
   });

   useEffect(() => {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
         setSelectedAddress(defaultAddress.id);
      } else if (addresses.length > 0) {
         setSelectedAddress(addresses[0].id);
      }
   }, [addresses]);

   // Sample data
   const cartItems = [
      {
         id: 1,
         name: 'GIỎ TRUYỀN THỐNG 01 - COMBO 9KG',
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
         name: 'GIỎ TRUYỀN THỐNG 02 - COMBO 5KG',
         price: 85000,
         quantity: 2,
         image: '/images/image.png',
         type: 'Mùi hương: Hoa nhài',
         options: [
            { name: 'Kích thước', value: 'Vừa' },
            { name: 'Màu sắc', value: 'Hồng pastel' },
         ],
      },
      {
         id: 3,
         name: 'NẾN THƠM TINH DẦU - 150G',
         price: 45000,
         quantity: 1,
         image: '/images/image.png',
         type: 'Mùi hương: Vanilla',
         options: [{ name: 'Loại', value: 'Nến thủy tinh' }],
      },
   ];

   // Payment methods with actual logo paths
   const paymentMethods = [
      { id: 'vnpay', name: 'VNPay', logo: '/images/payment/vnpay.png' },
      { id: 'momo', name: 'MoMo', logo: '/images/payment/momo.png' },
      { id: 'zalopay', name: 'ZaloPay', logo: '/images/payment/zalopay.png' },
      { id: 'shoppepay', name: 'ShoppePay', logo: '/images/payment/shopeepay.png' },
      { id: 'viettel', name: 'Viettel Money', logo: '/images/payment/viettel.png' },
      { id: 'viettinbank', name: 'VietinBank', logo: '/images/payment/viettinbank.png' },
      { id: 'vcb', name: 'Vietcombank', logo: '/images/payment/vietcombank.png' },
      { id: 'techcombank', name: 'Techcombank', logo: '/images/payment/techcombank.png' },
      { id: 'bidv', name: 'BIDV', logo: '/images/payment/bidv.png' },
      { id: 'sacombank', name: 'Sacombank', logo: '/images/payment/sacombank.png' },
      { id: 'mbbank', name: 'MB Bank', logo: '/images/payment/mbbank.png' },
   ];

   // Calculate totals
   const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
   const shipping = 20000;
   const discount = 10000;
   const total = subtotal + shipping - discount;

   // Sample address
   const address = {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
      city: 'TP. Hồ Chí Minh',
      isDefault: true,
   };

   // Format currency
   const formatCurrency = (amount: number | bigint) => {
      return (
         new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', '')
            .trim() + '₫'
      );
   };

   return (
      <div className='bg-gray-50 min-h-screen flex flex-col'>
         {/* Header */}
         <Header />

         {/* Main Content */}
         <div className='container max-w-7xl mx-auto px-4 py-8 flex-grow'>
            {/* Checkout Header */}
            <div className='mb-8'>
               <h1 className='text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6'>
                  Thanh Toán Đơn Hàng
               </h1>

               {/* Breadcrumb - Mobile */}
               <div className='md:hidden container mx-auto px-4 text-sm mb-4'>
                  <div className='flex items-center space-x-2'>
                     <Link
                        href='/'
                        className='text-gray-500 hover:text-amber-600 transition-colors'
                     >
                        Trang chủ
                     </Link>
                     <span className='text-gray-400'>/</span>
                     <Link
                        href='/user/cart'
                        className='text-gray-500 hover:text-amber-600 transition-colors'
                     >
                        Giỏ hàng
                     </Link>
                     <span className='text-gray-400'>/</span>
                     <span className='text-gray-700 font-medium'>Thanh toán</span>
                  </div>
               </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-8'>
               {/* Left column - Order details */}
               <div className='w-full lg:w-2/3'>
                  {/* Address */}

                  <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                     <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold flex items-center'>
                           <span className='bg-amber-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-3'>
                              1
                           </span>
                           Địa Chỉ Giao Hàng
                        </h2>

                        <button
                           onClick={() => setShowAddressModal(true)}
                           className='text-amber-600 hover:text-amber-800 text-sm font-medium'
                        >
                           + Thêm địa chỉ mới
                        </button>
                     </div>

                     {addresses.length > 0 ? (
                        <div className='space-y-3'>
                           {addresses
                              .filter((addr) => addr.id === selectedAddress)
                              .map((addr) => (
                                 <div
                                    key={addr.id}
                                    className='border rounded-lg p-4 bg-amber-50 border-amber-200 relative'
                                 >
                                    <div className='absolute top-4 right-4 flex items-center space-x-2'>
                                       <button className='text-gray-400 hover:text-amber-600'>
                                          <PencilIcon className='w-4 h-4' />
                                       </button>
                                    </div>

                                    <div className='flex items-start mb-2'>
                                       <div className='flex-grow'>
                                          <p className='font-medium'>
                                             {addr.name} | {addr.phone}
                                          </p>
                                       </div>
                                       {addr.isDefault && (
                                          <span className='bg-amber-100 text-amber-800 text-xs py-1 px-2 rounded ml-2'>
                                             Mặc định
                                          </span>
                                       )}
                                    </div>
                                    <p className='text-sm text-gray-600 mb-1'>{addr.address}</p>
                                    <p className='text-sm text-gray-600'>
                                       {addr.district}, {addr.city}
                                    </p>

                                    {addresses.length > 1 && (
                                       <div className='mt-3 flex justify-end'>
                                          <button
                                             onClick={() => setShowAddressList(!showAddressList)}
                                             className='text-amber-600 hover:text-amber-800 text-sm flex items-center'
                                          >
                                             Đổi địa chỉ
                                             <ChevronDownIcon
                                                className={`ml-1 w-4 h-4 transition-transform ${
                                                   showAddressList ? 'rotate-180' : ''
                                                }`}
                                             />
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              ))}

                           {/* Address List Dropdown */}
                           {showAddressList && (
                              <div className='bg-white border rounded-lg shadow-lg mt-2'>
                                 <div className='p-3 border-b'>
                                    <h3 className='font-medium text-sm'>Chọn địa chỉ giao hàng</h3>
                                 </div>

                                 <div className='max-h-60 overflow-y-auto'>
                                    {addresses
                                       .filter((addr) => addr.id !== selectedAddress)
                                       .map((addr) => (
                                          <div
                                             key={addr.id}
                                             className='p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer'
                                             onClick={() => {
                                                setSelectedAddress(addr.id);
                                                setShowAddressList(false);
                                             }}
                                          >
                                             <div className='flex justify-between items-start'>
                                                <div className='font-medium text-sm'>
                                                   {addr.name}
                                                </div>
                                                {addr.isDefault && (
                                                   <span className='text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded'>
                                                      Mặc định
                                                   </span>
                                                )}
                                             </div>
                                             <div className='text-xs text-gray-700 mt-1 mb-1'>
                                                {addr.phone}
                                             </div>
                                             <div className='text-xs text-gray-600'>
                                                {addr.address}, {addr.district}, {addr.city}
                                             </div>
                                          </div>
                                       ))}
                                 </div>

                                 <div className='p-3 border-t bg-gray-50'>
                                    <button
                                       onClick={() => {
                                          setShowAddressModal(true);
                                          setShowAddressList(false);
                                       }}
                                       className='w-full py-2 text-sm text-amber-600 hover:text-amber-800 flex items-center justify-center'
                                    >
                                       <PlusIcon className='w-4 h-4 mr-1' />
                                       Thêm địa chỉ mới
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div
                           className='border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50'
                           onClick={() => setShowAddressModal(true)}
                        >
                           <div className='bg-amber-50 rounded-full p-3 mb-3'>
                              <MapPinIcon className='w-6 h-6 text-amber-600' />
                           </div>
                           <p className='text-amber-700 font-medium mb-2'>
                              Chưa có địa chỉ giao hàng
                           </p>
                           <p className='text-gray-500 text-sm mb-4'>
                              Vui lòng thêm địa chỉ giao hàng để tiếp tục
                           </p>
                           <button className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors'>
                              Thêm địa chỉ mới
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Order Items */}
                  <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                     <div className='flex justify-between items-center mb-4'>
                        <h2 className='text-lg font-semibold flex items-center'>
                           <span className='bg-amber-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-3'>
                              2
                           </span>
                           Sản Phẩm
                        </h2>
                        <span className='text-sm text-gray-500'>{cartItems.length} sản phẩm</span>
                     </div>

                     <div className='space-y-4'>
                        {cartItems.map((item) => (
                           <div
                              key={item.id}
                              className='flex border-b pb-4 last:border-0 last:pb-0'
                           >
                              <div className='w-20 h-20 rounded-md overflow-hidden bg-gray-100 border flex-shrink-0'>
                                 <Image
                                    src={item.image || 'https://via.placeholder.com/80'}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className='w-full h-full object-cover'
                                 />
                              </div>
                              <div className='ml-4 flex-grow'>
                                 <div className='flex justify-between'>
                                    <h3 className='font-medium text-sm hover:text-amber-600 transition-colors'>
                                       <Link href={`/product/${item.id}`}>{item.name}</Link>
                                    </h3>
                                    <span className='text-amber-700 font-medium'>
                                       {formatCurrency(item.price)}
                                    </span>
                                 </div>
                                 <p className='text-xs text-gray-500 mt-1'>{item.type}</p>

                                 {item.options && item.options.length > 0 && (
                                    <div className='mt-2 space-y-1'>
                                       {item.options.map((option, idx) => (
                                          <p key={idx} className='text-xs text-gray-500'>
                                             <span className='inline-block'>{option.name}:</span>{' '}
                                             <span className='text-gray-700'>{option.value}</span>
                                          </p>
                                       ))}
                                    </div>
                                 )}

                                 <div className='flex justify-between items-center mt-2'>
                                    <span className='text-xs text-gray-500'>
                                       Số lượng: {item.quantity}
                                    </span>
                                    <span className='text-xs text-amber-600'>
                                       {formatCurrency(item.price * item.quantity)}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Payment Methods */}
                  <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                     <div className='flex items-center mb-4'>
                        <h2 className='text-lg font-semibold flex items-center'>
                           <span className='bg-amber-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-3'>
                              3
                           </span>
                           Phương Thức Thanh Toán
                        </h2>
                     </div>

                     <div className='space-y-3'>
                        {/* Cash on Delivery */}
                        <div
                           className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedPayment === 'cod'
                                 ? 'border-amber-500 bg-amber-50'
                                 : 'border-gray-200 hover:border-amber-300'
                           }`}
                           onClick={() => setSelectedPayment('cod')}
                        >
                           <div className='flex items-center'>
                              <div
                                 className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    selectedPayment === 'cod'
                                       ? 'border-amber-500'
                                       : 'border-gray-400'
                                 } mr-3`}
                              >
                                 {selectedPayment === 'cod' && (
                                    <div className='w-3 h-3 rounded-full bg-amber-500'></div>
                                 )}
                              </div>
                              <div className='flex items-center gap-2'>
                                 <div className='bg-amber-100 rounded-full p-1.5'>
                                    <ShoppingBagIcon className='w-4 h-4 text-amber-700' />
                                 </div>
                                 <div>
                                    <p className='font-medium text-sm'>Thanh toán khi nhận hàng</p>
                                    <p className='text-xs text-gray-500 mt-1'>
                                       Thanh toán bằng tiền mặt khi nhận được hàng
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Bank Transfer */}
                        <div>
                           <div
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                 selectedPayment === 'bank'
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300'
                              }`}
                              onClick={() => {
                                 setSelectedPayment('bank');
                                 setShowBankPayments(true);
                              }}
                           >
                              <div className='flex items-center justify-between'>
                                 <div className='flex items-center'>
                                    <div
                                       className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                          selectedPayment === 'bank'
                                             ? 'border-amber-500'
                                             : 'border-gray-400'
                                       } mr-3`}
                                    >
                                       {selectedPayment === 'bank' && (
                                          <div className='w-3 h-3 rounded-full bg-amber-500'></div>
                                       )}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                       <div className='bg-amber-100 rounded-full p-1.5'>
                                          <CreditCardIcon className='w-4 h-4 text-amber-700' />
                                       </div>
                                       <div>
                                          <p className='font-medium text-sm'>
                                             Thanh toán chuyển khoản ngân hàng
                                          </p>
                                          <p className='text-xs text-gray-500 mt-1'>
                                             Chuyển khoản trực tiếp qua ứng dụng ngân hàng
                                          </p>
                                       </div>
                                    </div>
                                 </div>

                                 <ChevronDownIcon
                                    className={`w-5 h-5 text-gray-500 transition-transform ${
                                       showBankPayments ? 'transform rotate-180' : ''
                                    }`}
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setShowBankPayments(!showBankPayments);
                                    }}
                                 />
                              </div>
                           </div>

                           {/* Bank options */}
                           {selectedPayment === 'bank' && showBankPayments && (
                              <div className='mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                                 <p className='text-center font-medium text-sm mb-3'>
                                    CHỌN PHƯƠNG TIỆN THANH TOÁN
                                 </p>
                                 <div className='grid grid-cols-4 sm:grid-cols-5 gap-2'>
                                    {paymentMethods.map((method) => (
                                       <div
                                          key={method.id}
                                          className='bg-white border rounded-md p-2 flex items-center justify-center hover:border-amber-500 cursor-pointer h-12'
                                       >
                                          <img
                                             src={
                                                method.logo ||
                                                `https://via.placeholder.com/60x30?text=${method.name}`
                                             }
                                             alt={method.name}
                                             className='max-h-6 max-w-full object-contain'
                                          />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right column - Order summary */}
               <div className='w-full lg:w-1/3'>
                  <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
                     <h2 className='text-lg font-semibold mb-5 pb-4 border-b'>Tổng thanh toán</h2>

                     <div className='space-y-3 text-sm'>
                        <div className='flex justify-between'>
                           <span className='text-gray-600'>Tổng tiền hàng:</span>
                           <span>{formatCurrency(subtotal)}</span>
                        </div>

                        <div className='flex justify-between'>
                           <span className='text-gray-600'>Phí vận chuyển:</span>
                           <span>{formatCurrency(shipping)}</span>
                        </div>

                        <div className='flex justify-between text-amber-600'>
                           <span>Giảm giá:</span>
                           <span>-{formatCurrency(discount)}</span>
                        </div>

                        <div className='pt-3 mt-3 border-t'>
                           <div className='flex justify-between items-center text-base'>
                              <span className='font-medium'>Tổng thanh toán:</span>
                              <span className='text-xl font-bold text-amber-800'>
                                 {formatCurrency(total)}
                              </span>
                           </div>
                           <p className='text-xs text-gray-500 text-right mt-1'>(Đã bao gồm VAT)</p>
                        </div>
                     </div>

                     {/* Terms and conditions */}
                     <div className='mt-6'>
                        <div className='flex items-start'>
                           <input
                              type='checkbox'
                              id='terms'
                              checked={acceptTerms}
                              onChange={() => setAcceptTerms(!acceptTerms)}
                              className='mt-1 text-amber-600 focus:ring-amber-500'
                           />
                           <label htmlFor='terms' className='ml-2 text-xs text-gray-500'>
                              Tôi đồng ý với{' '}
                              <a href='/terms' className='text-amber-600 hover:underline'>
                                 Điều khoản dịch vụ
                              </a>{' '}
                              và{' '}
                              <a href='/privacy' className='text-amber-600 hover:underline'>
                                 Chính sách bảo mật
                              </a>{' '}
                              của CandleBliss.
                           </label>
                        </div>
                     </div>

                     {/* Checkout button */}
                     <div className='mt-6'>
                        <button
                           className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-medium ${
                              acceptTerms && address
                                 ? 'bg-amber-800 hover:bg-amber-900'
                                 : 'bg-gray-400 cursor-not-allowed'
                           }`}
                           disabled={!acceptTerms || !address}
                        >
                           Đặt hàng ngay
                        </button>

                        {(!acceptTerms || !address) && (
                           <div className='flex items-center text-xs text-amber-600 mt-2'>
                              <ExclamationTriangleIcon className='w-4 h-4 mr-1' />
                              {!address
                                 ? 'Vui lòng thêm địa chỉ giao hàng'
                                 : 'Vui lòng đồng ý với điều khoản'}
                           </div>
                        )}
                     </div>

                     {/* Secure checkout message */}
                     <div className='flex items-center justify-center mt-6 text-gray-500 text-xs'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-4 w-4 mr-1'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6l4-2 4 2 4-2 4 2 4-2 4 2z'
                           />
                        </svg>
                        Thanh toán an toàn và bảo mật
                     </div>

                     {/* Benefits */}
                     <div className='mt-6 pt-6 border-t'>
                        <div className='space-y-3'>
                           <div className='flex items-center gap-3 text-sm text-gray-600'>
                              <div className='w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                 <TruckIcon className='w-4 h-4 text-amber-600' />
                              </div>
                              <div>
                                 <p className='font-medium'>Giao hàng miễn phí</p>
                                 <p className='text-xs text-gray-500'>Cho đơn hàng từ 500.000₫</p>
                              </div>
                           </div>

                           <div className='flex items-center gap-3 text-sm text-gray-600'>
                              <div className='w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 text-amber-600'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2 4-2 4 2z'
                                    />
                                 </svg>
                              </div>
                              <div>
                                 <p className='font-medium'>Đổi trả dễ dàng</p>
                                 <p className='text-xs text-gray-500'>Trong vòng 30 ngày</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Back to cart */}
                     <div className='mt-8 text-center'>
                        <Link
                           href='/user/cart'
                           className='inline-flex items-center text-sm text-amber-600 hover:text-amber-800 transition-colors'
                        >
                           <ChevronLeftIcon className='w-4 h-4 mr-1' />
                           Quay lại giỏ hàng
                        </Link>
                     </div>

                     {/* Action Buttons */}
                  </div>
               </div>
            </div>

            {/* Recently Viewed Products */}
            <div className='mt-16'>
               <h2 className='text-xl font-semibold mb-6'>Sản Phẩm Đã Xem Gần Đây</h2>
               <ViewedCarousel />
            </div>
         </div>

         {/* Address Modal */}
         {showAddressModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
                  <div className='flex justify-between items-center border-b p-4'>
                     <h3 className='text-lg font-medium'>Thêm địa chỉ mới</h3>
                     <button
                        onClick={() => setShowAddressModal(false)}
                        className='text-gray-400 hover:text-gray-600'
                     >
                        <XMarkIcon className='w-5 h-5' />
                     </button>
                  </div>

                  <form className='p-6' onSubmit={(e) => e.preventDefault()}>
                     <div className='grid grid-cols-2 gap-4'>
                        <div className='col-span-2 md:col-span-1'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Họ và tên <span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='text'
                              value={newAddress.name}
                              onChange={(e) =>
                                 setNewAddress({ ...newAddress, name: e.target.value })
                              }
                              className={`w-full px-3 py-2 border ${
                                 formErrors.name ? 'border-red-500' : 'border-gray-300'
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                              placeholder='Nguyễn Văn A'
                           />
                           {formErrors.name && (
                              <p className='mt-1 text-xs text-red-500'>{formErrors.name}</p>
                           )}
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Số điện thoại <span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='tel'
                              value={newAddress.phone}
                              onChange={(e) =>
                                 setNewAddress({ ...newAddress, phone: e.target.value })
                              }
                              className={`w-full px-3 py-2 border ${
                                 formErrors.phone ? 'border-red-500' : 'border-gray-300'
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                              placeholder='0901234567'
                           />
                           {formErrors.phone && (
                              <p className='mt-1 text-xs text-red-500'>{formErrors.phone}</p>
                           )}
                        </div>

                        <div className='col-span-2'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Địa chỉ cụ thể <span className='text-red-500'>*</span>
                           </label>
                           <input
                              type='text'
                              value={newAddress.address}
                              onChange={(e) =>
                                 setNewAddress({ ...newAddress, address: e.target.value })
                              }
                              className={`w-full px-3 py-2 border ${
                                 formErrors.address ? 'border-red-500' : 'border-gray-300'
                              } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                              placeholder='Số nhà, tên đường'
                           />
                           {formErrors.address && (
                              <p className='mt-1 text-xs text-red-500'>{formErrors.address}</p>
                           )}
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Quận/Huyện <span className='text-red-500'>*</span>
                           </label>
                           <select
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                              value={newAddress.district}
                              onChange={(e) =>
                                 setNewAddress({ ...newAddress, district: e.target.value })
                              }
                           >
                              <option value='Quận 1'>Quận 1</option>
                              <option value='Quận 2'>Quận 2</option>
                              <option value='Quận 3'>Quận 3</option>
                              <option value='Quận 4'>Quận 4</option>
                              <option value='Quận 5'>Quận 5</option>
                              <option value='Quận 6'>Quận 6</option>
                              <option value='Quận 7'>Quận 7</option>
                              <option value='Quận 8'>Quận 8</option>
                              <option value='Quận 9'>Quận 9</option>
                              <option value='Quận 10'>Quận 10</option>
                              <option value='Quận 11'>Quận 11</option>
                              <option value='Quận 12'>Quận 12</option>
                              <option value='Quận Bình Thạnh'>Quận Bình Thạnh</option>
                              <option value='Quận Gò Vấp'>Quận Gò Vấp</option>
                              <option value='Quận Tân Bình'>Quận Tân Bình</option>
                              <option value='Quận Tân Phú'>Quận Tân Phú</option>
                              <option value='Quận Phú Nhuận'>Quận Phú Nhuận</option>
                              <option value='Quận Bình Tân'>Quận Bình Tân</option>
                              <option value='Thủ Đức'>Thủ Đức</option>
                           </select>
                        </div>

                        <div className='col-span-2 md:col-span-1'>
                           <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Tỉnh/Thành phố <span className='text-red-500'>*</span>
                           </label>
                           <select
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                              value={newAddress.city}
                              onChange={(e) =>
                                 setNewAddress({ ...newAddress, city: e.target.value })
                              }
                           >
                              <option value='TP. Hồ Chí Minh'>TP. Hồ Chí Minh</option>
                              <option value='Hà Nội'>Hà Nội</option>
                              <option value='Đà Nẵng'>Đà Nẵng</option>
                              <option value='Hải Phòng'>Hải Phòng</option>
                              <option value='Cần Thơ'>Cần Thơ</option>
                              <option value='Huế'>Huế</option>
                              <option value='Nha Trang'>Nha Trang</option>
                              <option value='Đà Lạt'>Đà Lạt</option>
                              <option value='Bình Dương'>Bình Dương</option>
                              <option value='Đồng Nai'>Đồng Nai</option>
                           </select>
                        </div>

                        <div className='col-span-2'>
                           <label className='flex items-center mt-2 space-x-2'>
                              <input
                                 type='checkbox'
                                 checked={newAddress.isDefault}
                                 onChange={(e) =>
                                    setNewAddress({ ...newAddress, isDefault: e.target.checked })
                                 }
                                 className='h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                              />
                              <span className='text-sm text-gray-700'>
                                 Đặt làm địa chỉ mặc định
                              </span>
                           </label>
                        </div>
                     </div>

                     <div className='mt-6 flex justify-end space-x-3'>
                        <button
                           type='button'
                           onClick={() => {
                              setShowAddressModal(false);
                              setNewAddress({
                                 name: '',
                                 phone: '',
                                 address: '',
                                 district: 'Quận 1',
                                 city: 'TP. Hồ Chí Minh',
                                 isDefault: false,
                              });
                              setFormErrors({
                                 name: '',
                                 phone: '',
                                 address: '',
                              });
                           }}
                           className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50'
                        >
                           Hủy
                        </button>
                        <button
                           type='submit'
                           className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
                           onClick={() => {
                              // Form validation
                              const errors = {
                                 name: !newAddress.name ? 'Vui lòng nhập họ tên' : '',
                                 phone: !newAddress.phone ? 'Vui lòng nhập số điện thoại' : '',
                                 address: !newAddress.address ? 'Vui lòng nhập địa chỉ' : '',
                              };

                              setFormErrors(errors);

                              if (errors.name || errors.phone || errors.address) {
                                 return;
                              }

                              // Create new address with unique ID
                              const newAddressWithId = {
                                 ...newAddress,
                                 id: addresses.length
                                    ? Math.max(...addresses.map((a) => a.id)) + 1
                                    : 1,
                              };

                              // If this is the default address, update other addresses
                              let updatedAddresses;
                              if (newAddress.isDefault) {
                                 updatedAddresses = addresses.map((addr) => ({
                                    ...addr,
                                    isDefault: false,
                                 }));
                                 updatedAddresses.push(newAddressWithId);
                              } else {
                                 updatedAddresses = [...addresses, newAddressWithId];
                              }

                              setAddresses(updatedAddresses);
                              setSelectedAddress(newAddressWithId.id);

                              // Create toast notification
                              // toast.success('Địa chỉ đã được thêm thành công!');

                              // Reset form and close modal
                              setNewAddress({
                                 name: '',
                                 phone: '',
                                 address: '',
                                 district: 'Quận 1',
                                 city: 'TP. Hồ Chí Minh',
                                 isDefault: false,
                              });
                              setShowAddressModal(false);
                           }}
                        >
                           Lưu địa chỉ
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Footer */}
         <Footer />
      </div>
   );
}
