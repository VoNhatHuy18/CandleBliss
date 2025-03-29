'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
   TrashIcon,
   MinusIcon,
   PlusIcon,
   ExclamationCircleIcon,
   ShoppingBagIcon,
   TagIcon,
   ArrowRightIcon
} from '@heroicons/react/24/outline';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';

// Interfaces for cart data structures
interface CartItem {
   id: number;
   cartId: number;
   productDetailId: number;
   quantity: number;
   totalPrice: number;
   product?: {
      id: number;
      name: string;
      image: string;
      type: string;
      options?: {
         name: string;
         value: string;
      }[];
   };
}

interface Cart {
   id: number;
   userId: number;
   status: string;
   totalPrice: number;
   totalQuantity: number;
   cartItems: CartItem[];
   createdAt: string;
   updatedAt: string;
}

export default function ShoppingCart() {
   // States
   const router = useRouter();
   const [cart, setCart] = useState<Cart | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [voucher, setVoucher] = useState('');
   const [voucherError, setVoucherError] = useState('');
   const [voucherSuccess, setVoucherSuccess] = useState('');
   const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
   const [discount, setDiscount] = useState(0);
   const [voucherLoading, setVoucherLoading] = useState(false);
   const [updatingItem, setUpdatingItem] = useState<number | null>(null);
   const [suggestedVouchers, setSuggestedVouchers] = useState<any[]>([]);
   const [showVoucherSuggestions, setShowVoucherSuggestions] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);

   // Fetch user ID from localStorage when component mounts
   useEffect(() => {
      try {
         const userData = JSON.parse(localStorage.getItem('user') || '{}');
         if (userData && userData.id) {
            setUserId(userData.id);
         }
      } catch (error) {
         console.error('Error parsing user data from localStorage:', error);
      }
   }, []);

   // Fetch cart data from API
   useEffect(() => {
      const fetchCart = async () => {
         setLoading(true);
         try {
            const token = localStorage.getItem('token');
            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               return;
            }

            const response = await fetch(`http://localhost:3000/api/cart/user/${userId}`, {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               if (response.status === 404) {
                  // If cart doesn't exist, create a new one
                  await createNewCart();
                  return;
               }
               throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            // Check if cart exists and has items
            if (!data || !data.cartItems || data.cartItems.length === 0) {
               setCart({
                  ...data,
                  cartItems: [],
                  totalPrice: 0,
                  totalQuantity: 0
               });
               setLoading(false);
               return;
            }

            // Store cartId in localStorage for checkout
            localStorage.setItem('cartId', data.id.toString());

            // Fetch product details for each cart item
            const cartItemsWithDetails = await Promise.all(
               data.cartItems.map(async (item: CartItem) => {
                  const productDetails = await fetchProductDetails(item.productDetailId);
                  return {
                     ...item,
                     product: productDetails,
                  };
               })
            );

            setCart({
               ...data,
               cartItems: cartItemsWithDetails,
            });

            // Check if there's a previously applied voucher
            const storedVoucher = localStorage.getItem('appliedVoucher');
            if (storedVoucher) {
               const voucherData = JSON.parse(storedVoucher);
               setAppliedVoucher(voucherData);

               // Calculate discount based on voucher type
               let discountAmount = 0;
               if (voucherData.percent_off > 0) {
                  discountAmount = (data.totalPrice * voucherData.percent_off) / 100;
               } else if (voucherData.amount_off > 0) {
                  discountAmount = voucherData.amount_off;
               }

               setDiscount(discountAmount);

               // Update the stored voucher with the discount amount
               const updatedVoucher = {
                  ...voucherData,
                  discountAmount: discountAmount
               };
               localStorage.setItem('appliedVoucher', JSON.stringify(updatedVoucher));
            }

         } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
         } finally {
            setLoading(false);
         }
      };

      if (userId) {
         fetchCart();
      }
   }, [userId]);

   // Create a new cart
   const createNewCart = async () => {
      if (!userId) return;

      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
         });

         if (!response.ok) {
            throw new Error(`Error creating cart: ${response.status}`);
         }

         const newCart = await response.json();

         // Store cart ID in localStorage
         localStorage.setItem('cartId', newCart.id.toString());

         setCart({
            ...newCart,
            cartItems: [],
         });
      } catch (err) {
         console.error('Failed to create cart:', err);
         setError('Không thể tạo giỏ hàng mới. Vui lòng thử lại sau.');
      } finally {
         setLoading(false);
      }
   };

   // Function to fetch product details
   const fetchProductDetails = async (productDetailId: number) => {
      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`http://localhost:3000/api/products/details/${productDetailId}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error(`Error fetching product details: ${response.status}`);
         }

         return await response.json();
      } catch (error) {
         console.error(`Error fetching details for product ${productDetailId}:`, error);
         // Return placeholder data if API fails
         return {
            id: productDetailId,
            name: "Sản phẩm",
            image: "https://via.placeholder.com/80",
            type: "Loại sản phẩm",
            options: []
         };
      }
   };

   // Calculate subtotal from cart data
   const subtotal = useMemo(() => {
      if (!cart) return 0;
      return cart.totalPrice || 0;
   }, [cart]);

   // Effect to fetch suggested vouchers when cart changes
   useEffect(() => {
      const fetchSuggestedVouchers = async () => {
         if (!cart || cart.cartItems.length === 0) return;

         try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/v1/vouchers/suggested?minValue=${subtotal}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error(`Error fetching suggested vouchers: ${response.status}`);
            }

            const data = await response.json();
            setSuggestedVouchers(data);
         } catch (error) {
            console.error('Failed to fetch suggested vouchers:', error);
         }
      };

      // Only fetch if user is logged in and has items in cart
      if (cart && cart.cartItems.length > 0) {
         fetchSuggestedVouchers();
      }
   }, [cart, subtotal]);

   // Handle quantity change with API integration
   const updateQuantity = async (productDetailId: number, newQuantity: number) => {
      if (!cart) return;
      if (newQuantity < 1) newQuantity = 1;
      if (newQuantity > 10) newQuantity = 10;

      // Set loading state for this specific item
      setUpdatingItem(productDetailId);

      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`http://localhost:3000/api/cart/${cart.id}/add-item/${productDetailId}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQuantity }),
         });

         if (!response.ok) {
            throw new Error(`Error updating quantity: ${response.status}`);
         }

         const updatedCart = await response.json();

         // Fetch product details for the updated cart items
         const cartItemsWithDetails = await Promise.all(
            updatedCart.cartItems.map(async (item: CartItem) => {
               const productDetails = await fetchProductDetails(item.productDetailId);
               return {
                  ...item,
                  product: productDetails,
               };
            })
         );

         const newCart = {
            ...updatedCart,
            cartItems: cartItemsWithDetails,
         };

         setCart(newCart);

         // Recalculate discount if a voucher is applied
         if (appliedVoucher) {
            let newDiscount = 0;
            if (appliedVoucher.percent_off > 0) {
               newDiscount = (newCart.totalPrice * appliedVoucher.percent_off) / 100;
            } else if (appliedVoucher.amount_off > 0) {
               newDiscount = appliedVoucher.amount_off;
            }

            setDiscount(newDiscount);

            // Update the stored voucher with new discount amount
            const updatedVoucher = {
               ...appliedVoucher,
               discountAmount: newDiscount
            };
            localStorage.setItem('appliedVoucher', JSON.stringify(updatedVoucher));
            setAppliedVoucher(updatedVoucher);
         }

      } catch (err) {
         console.error('Failed to update cart item:', err);
         // You might want to show an error message to the user
      } finally {
         setUpdatingItem(null);
      }
   };

   // Handle item removal with API integration
   const removeItem = async (productDetailId: number) => {
      if (!cart) return;

      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`http://localhost:3000/api/cart/${cart.id}/add-item/${productDetailId}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: 0 }), // Quantity 0 will remove the item
         });

         if (!response.ok) {
            throw new Error(`Error removing item: ${response.status}`);
         }

         const updatedCart = await response.json();

         // If there are items in cart, fetch their product details
         if (updatedCart.cartItems && updatedCart.cartItems.length > 0) {
            const cartItemsWithDetails = await Promise.all(
               updatedCart.cartItems.map(async (item: CartItem) => {
                  const productDetails = await fetchProductDetails(item.productDetailId);
                  return {
                     ...item,
                     product: productDetails,
                  };
               })
            );

            const newCart = {
               ...updatedCart,
               cartItems: cartItemsWithDetails,
            };

            setCart(newCart);

            // Recalculate discount if a voucher is applied
            if (appliedVoucher) {
               let newDiscount = 0;
               if (appliedVoucher.percent_off > 0) {
                  newDiscount = (newCart.totalPrice * appliedVoucher.percent_off) / 100;
               } else if (appliedVoucher.amount_off > 0) {
                  newDiscount = appliedVoucher.amount_off;
               }

               setDiscount(newDiscount);

               // Update the stored voucher with new discount amount
               const updatedVoucher = {
                  ...appliedVoucher,
                  discountAmount: newDiscount
               };
               localStorage.setItem('appliedVoucher', JSON.stringify(updatedVoucher));
               setAppliedVoucher(updatedVoucher);
            }
         } else {
            // If cart is empty
            setCart({
               ...updatedCart,
               cartItems: [],
               totalPrice: 0,
               totalQuantity: 0
            });

            // Clear voucher if cart is now empty
            setAppliedVoucher(null);
            setDiscount(0);
            localStorage.removeItem('appliedVoucher');
         }
      } catch (err) {
         console.error('Failed to remove cart item:', err);
         // You might want to show an error message to the user
      }
   };

   // Apply voucher
   const applyVoucher = async () => {
      // Reset notification states
      setVoucherError('');
      setVoucherSuccess('');

      if (!voucher) {
         setVoucherError('Vui lòng nhập mã giảm giá');
         return;
      }

      setVoucherLoading(true);

      try {
         // Get token from localStorage
         const token = localStorage.getItem('token');

         // Call API to check voucher by code
         const response = await fetch(`http://localhost:3000/api/v1/vouchers/code/${voucher}`, {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
               ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
         });

         // If voucher not found
         if (!response.ok) {
            if (response.status === 404) {
               setVoucherError('Mã giảm giá không tồn tại');
            } else {
               const errorData = await response.json();
               setVoucherError(errorData.message || 'Không thể kiểm tra mã giảm giá');
            }
            return;
         }

         // Get voucher data
         const voucherData = await response.json();

         // Check voucher start and end dates
         const currentDate = new Date();
         const startDate = new Date(voucherData.start_date);
         const endDate = new Date(voucherData.end_date);

         if (currentDate < startDate) {
            setVoucherError(`Mã giảm giá chỉ có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')}`);
            return;
         }

         if (currentDate > endDate) {
            setVoucherError('Mã giảm giá đã hết hạn');
            return;
         }

         // Check if the cart total meets the minimum order value
         if (subtotal < voucherData.min_order_value) {
            setVoucherError(`Giá trị đơn hàng tối thiểu phải từ ${voucherData.min_order_value.toLocaleString('vi-VN')}đ để sử dụng mã này`);
            return;
         }

         // Check usage limit
         if (voucherData.usage_limit !== null && voucherData.usage_count >= voucherData.usage_limit) {
            setVoucherError('Mã giảm giá đã hết lượt sử dụng');
            return;
         }

         // Calculate discount amount based on voucher type
         let discountAmount = 0;
         if (voucherData.percent_off > 0) {
            discountAmount = (subtotal * voucherData.percent_off) / 100;
         } else if (voucherData.amount_off > 0) {
            discountAmount = voucherData.amount_off;
         }

         // Store voucher data with calculated discount for checkout
         const voucherWithDiscount = {
            ...voucherData,
            discountAmount: discountAmount
         };

         localStorage.setItem('appliedVoucher', JSON.stringify(voucherWithDiscount));

         // Update state with applied voucher
         setAppliedVoucher(voucherWithDiscount);
         setDiscount(discountAmount);
         setVoucherSuccess(`Áp dụng mã giảm giá thành công! Bạn tiết kiệm được ${discountAmount.toLocaleString('vi-VN')}đ`);
         setVoucher(''); // Clear input field
      } catch (error) {
         console.error('Voucher application error:', error);
         setVoucherError('Đã xảy ra lỗi khi áp dụng mã giảm giá');
      } finally {
         setVoucherLoading(false);
      }
   };

   // Remove applied voucher
   const removeVoucher = () => {
      setAppliedVoucher(null);
      setDiscount(0);
      setVoucherSuccess('');
      localStorage.removeItem('appliedVoucher');
   };

   // Final total with discount applied
   const totalPrice = subtotal - discount;

   // Calculate number of items
   const itemCount = cart ? cart.totalQuantity : 0;

   // Format currency for display
   const formatCurrency = (amount: number): string => {
      return amount.toLocaleString('vi-VN') + '₫';
   };

   // Function to handle proceeding to checkout
   const proceedToCheckout = () => {
      if (!cart || cart.cartItems.length === 0) {
         alert('Giỏ hàng của bạn đang trống');
         return;
      }

      // Store cart ID in localStorage for checkout page
      localStorage.setItem('cartId', cart.id.toString());

      // Navigate to checkout page
      router.push('/user/checkout');
   };

   // Render loading state
   if (loading) {
      return (
         <div className='bg-gray-50 min-h-screen flex flex-col'>
            <Header />
            <div className='container mx-auto flex-grow px-4 py-12 flex justify-center items-center'>
               <div className='w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin'></div>
            </div>
            <Footer />
         </div>
      );
   }

   // Render error state
   if (error) {
      return (
         <div className='bg-gray-50 min-h-screen flex flex-col'>
            <Header />
            <div className='container mx-auto flex-grow px-4 py-12'>
               <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center'>
                  <div className='text-red-500 mb-4'>
                     <ExclamationCircleIcon className='w-16 h-16 mx-auto' />
                  </div>
                  <h2 className='text-xl font-semibold mb-4'>Đã xảy ra lỗi</h2>
                  <p className='text-gray-600 mb-6'>{error}</p>
                  <div className='flex justify-center space-x-4'>
                     <Link href="/" className='px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition-colors'>
                        Quay về trang chủ
                     </Link>
                      <button
                        onClick={() => router.push('/user/signin')}
                        className='px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-md font-medium text-white transition-colors'
                      >
                        Đăng nhập
                      </button>
                  </div>
               </div>
            </div>
            <Footer />
         </div>
      );
   }

   return (
      <div className='bg-gray-50 min-h-screen flex flex-col'>
         {/* Header */}
         <Header />

         {/* Main content */}
         <div className='container mx-auto px-4 py-8 flex-grow'>
            <h1 className='text-2xl font-bold text-center mb-8'>Giỏ hàng của bạn</h1>

            {/* Breadcrumb navigation */}
            <div className='text-sm mb-8 hidden md:block'>
               <div className='max-w-6xl mx-auto'>
                  <Link href='/' className='text-gray-500 hover:text-amber-600 transition-colors'>Trang chủ</Link>
                  <span className='mx-2 text-gray-400'>/</span>
                  <span className='text-gray-700 font-medium'>Giỏ hàng</span>
               </div>
            </div>

            {/* Empty cart state */}
            {(!cart || cart.cartItems.length === 0) && (
               <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center'>
                  <div className='w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                     <ShoppingBagIcon className='w-12 h-12 text-amber-500' />
                  </div>
                  <h2 className='text-xl font-semibold mb-2'>Giỏ hàng của bạn đang trống</h2>
                  <p className='text-gray-500 mb-6'>Hãy khám phá các sản phẩm nến thơm tuyệt vời của chúng tôi và thêm vào giỏ hàng</p>
                  <Link href="/products" className='inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors'>
                     Khám phá sản phẩm
                  </Link>

                  {/* Recently viewed products */}
                  <div className='mt-16 pt-8 border-t'>
                     <h3 className='text-lg font-semibold mb-6'>Sản phẩm đã xem gần đây</h3>
                     <ViewedCarousel />
                  </div>
               </div>
            )}

            {/* Cart with items */}
            {cart && cart.cartItems.length > 0 && (
               <div className='max-w-6xl mx-auto'>
                  <div className='flex flex-col lg:flex-row gap-6'>
                     {/* Cart items - Left column */}
                     <div className='lg:w-2/3'>
                        <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-6'>
                           {/* Cart header */}
                           <div className='p-4 sm:p-6 border-b'>
                              <div className='flex justify-between items-center'>
                                 <h2 className='text-lg font-semibold'>Giỏ hàng của bạn ({itemCount} sản phẩm)</h2>
                                 <button
                                    onClick={() => router.push('/products')}
                                    className='text-amber-600 hover:text-amber-800 text-sm font-medium'
                                 >
                                    Tiếp tục mua sắm
                                 </button>
                              </div>
                           </div>

                           {/* Cart items list */}
                           <div className='divide-y'>
                              {cart.cartItems.map((item) => (
                                 <div key={item.id} className='p-4 sm:p-6'>
                                    <div className='flex flex-col sm:flex-row'>
                                       {/* Product image */}
                                       <div className='w-full sm:w-20 h-20 mb-4 sm:mb-0 flex justify-center sm:justify-start'>
                                          <div className='w-20 h-20 rounded-md overflow-hidden bg-gray-100 border'>
                                             <Image
                                                src={item.product?.image || 'https://via.placeholder.com/80'}
                                                alt={item.product?.name || 'Product image'}
                                                width={80}
                                                height={80}
                                                className='w-full h-full object-cover'
                                             />
                                          </div>
                                       </div>

                                       {/* Product details */}
                                       <div className='flex-grow sm:ml-4'>
                                          <div className='flex flex-col sm:flex-row justify-between'>
                                             {/* Product name and options */}
                                             <div className='mb-3 sm:mb-0'>
                                                <h3 className='font-medium text-gray-800 mb-1 hover:text-amber-600 transition-colors'>
                                                   <Link href={`/products/${item.productDetailId}`}>
                                                      {item.product?.name || 'Product Name'}
                                                   </Link>
                                                </h3>
                                                <p className='text-sm text-gray-500 mb-2'>
                                                   {item.product?.type || 'Product Type'}
                                                </p>

                                                {/* Product options/variants */}
                                                {item.product?.options && item.product.options.length > 0 && (
                                                   <div className='text-xs text-gray-500 mb-3'>
                                                      {item.product.options.map((option, idx) => (
                                                         <div key={idx}>
                                                            {option.name}: <span className='text-gray-700'>{option.value}</span>
                                                         </div>
                                                      ))}
                                                   </div>
                                                )}
                                             </div>

                                             {/* Price */}
                                             <div className='text-amber-700 font-medium'>
                                                {formatCurrency(item.totalPrice)}
                                             </div>
                                          </div>

                                          {/* Quantity control and remove */}
                                          <div className='flex justify-between items-center mt-3 sm:mt-4'>
                                             <div className='flex items-center border rounded-md'>
                                                <button
                                                   onClick={() => updateQuantity(item.productDetailId, item.quantity - 1)}
                                                   disabled={item.quantity <= 1 || updatingItem === item.productDetailId}
                                                   className='w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-600 disabled:text-gray-300'
                                                >
                                                   <MinusIcon className='w-4 h-4' />
                                                </button>
                                                <div className='w-10 h-8 flex items-center justify-center border-x'>
                                                   {updatingItem === item.productDetailId ? (
                                                      <div className='w-4 h-4 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin'></div>
                                                   ) : (
                                                      <span>{item.quantity}</span>
                                                   )}
                                                </div>
                                                <button
                                                   onClick={() => updateQuantity(item.productDetailId, item.quantity + 1)}
                                                   disabled={item.quantity >= 10 || updatingItem === item.productDetailId}
                                                   className='w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-600 disabled:text-gray-300'
                                                >
                                                   <PlusIcon className='w-4 h-4' />
                                                </button>
                                             </div>

                                             <button
                                                onClick={() => removeItem(item.productDetailId)}
                                                className='text-gray-400 hover:text-red-500 transition-colors'
                                             >
                                                <TrashIcon className='w-5 h-5' />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Voucher section - Mobile only */}
                        <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 lg:hidden'>
                           <h2 className='text-lg font-semibold mb-4'>Mã giảm giá</h2>
                           {appliedVoucher ? (
                              <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex justify-between items-center'>
                                 <div>
                                    <div className='flex items-center'>
                                       <TagIcon className='w-4 h-4 text-amber-600 mr-2' />
                                       <span className='font-medium'>{appliedVoucher.code}</span>
                                    </div>
                                    <p className='text-sm text-gray-600 mt-1'>
                                       {appliedVoucher.percent_off > 0
                                          ? `Giảm ${appliedVoucher.percent_off}%`
                                          : `Giảm ${formatCurrency(appliedVoucher.amount_off)}`
                                       }
                                    </p>
                                 </div>
                                 <button
                                    onClick={removeVoucher}
                                    className='text-gray-400 hover:text-red-500'
                                 >
                                    <TrashIcon className='w-5 h-5' />
                                 </button>
                              </div>
                           ) : (
                              <div className='flex items-stretch'>
                                 <input
                                    type='text'
                                    value={voucher}
                                    onChange={(e) => setVoucher(e.target.value)}
                                    placeholder='Nhập mã giảm giá'
                                    className='flex-grow px-3 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                 />
                                 <button
                                    onClick={applyVoucher}
                                    disabled={voucherLoading}
                                    className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-r-md focus:outline-none disabled:bg-gray-400'
                                 >
                                    {voucherLoading ? (
                                       <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                    ) : (
                                       'Áp dụng'
                                    )}
                                 </button>
                              </div>
                           )}

                           {voucherError && (
                              <div className='text-red-500 text-sm mt-2 flex items-center'>
                                 <ExclamationCircleIcon className='w-4 h-4 mr-1' />
                                 {voucherError}
                              </div>
                           )}

                           {voucherSuccess && (
                              <div className='text-green-600 text-sm mt-2'>
                                 {voucherSuccess}
                              </div>
                           )}

                           {suggestedVouchers.length > 0 && !appliedVoucher && (
                              <div className='mt-4'>
                                 <button
                                    onClick={() => setShowVoucherSuggestions(!showVoucherSuggestions)}
                                    className='text-amber-600 text-sm font-medium flex items-center'
                                 >
                                    {showVoucherSuggestions ? 'Ẩn mã giảm giá gợi ý' : 'Xem mã giảm giá phù hợp'}
                                    <svg
                                       className={`ml-1 w-4 h-4 transform transition-transform ${showVoucherSuggestions ? 'rotate-180' : ''}`}
                                       fill='none'
                                       viewBox='0 0 24 24'
                                       stroke='currentColor'
                                    >
                                       <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                    </svg>
                                 </button>

                                 {showVoucherSuggestions && (
                                    <div className='mt-3 space-y-2'>
                                       {suggestedVouchers.map((v) => (
                                          <div
                                             key={v.id}
                                             className='border border-dashed border-amber-300 rounded-md p-2 bg-amber-50 cursor-pointer hover:bg-amber-100'
                                             onClick={() => {
                                                setVoucher(v.code);
                                                setShowVoucherSuggestions(false);
                                             }}
                                          >
                                             <div className='flex justify-between'>
                                                <span className='font-medium text-amber-800'>{v.code}</span>
                                                <span className='text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded'>
                                                   {v.percent_off > 0
                                                      ? `Giảm ${v.percent_off}%`
                                                      : `Giảm ${v.amount_off.toLocaleString('vi-VN')}đ`}
                                                </span>
                                             </div>
                                             <div className='text-xs text-gray-500 mt-1'>
                                                Đơn tối thiểu {v.min_order_value.toLocaleString('vi-VN')}đ
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>

                        {/* Order summary - Mobile only */}
                        <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 lg:hidden'>
                           <h2 className='text-lg font-semibold mb-4'>Tổng thanh toán</h2>
                           <div className='space-y-2'>
                              <div className='flex justify-between'>
                                 <span className='text-gray-600'>Tạm tính:</span>
                                 <span>{formatCurrency(subtotal)}</span>
                              </div>
                              {discount > 0 && (
                                 <div className='flex justify-between text-amber-600'>
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(discount)}</span>
                                 </div>
                              )}
                              <div className='pt-2 mt-2 border-t flex justify-between font-semibold'>
                                 <span>Tổng tiền:</span>
                                 <span className='text-lg text-amber-800'>{formatCurrency(totalPrice)}</span>
                              </div>
                           </div>
                           <button
                              onClick={proceedToCheckout}
                              className='w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium flex items-center justify-center'
                           >
                              Tiến hành thanh toán
                              <ArrowRightIcon className='w-4 h-4 ml-2' />
                           </button>
                        </div>
                     </div>

                     {/* Order summary and voucher - Right column */}
                     <div className='lg:w-1/3'>
                        <div className='sticky top-6'>
                           {/* Voucher section - Desktop only */}
                           <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 hidden lg:block'>
                              <h2 className='text-lg font-semibold mb-4'>Mã giảm giá</h2>
                              {appliedVoucher ? (
                                 <div className='bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex justify-between items-center'>
                                    <div>
                                       <div className='flex items-center'>
                                          <TagIcon className='w-4 h-4 text-amber-600 mr-2' />
                                          <span className='font-medium'>{appliedVoucher.code}</span>
                                       </div>
                                       <p className='text-sm text-gray-600 mt-1'>
                                          {appliedVoucher.percent_off > 0
                                             ? `Giảm ${appliedVoucher.percent_off}%`
                                             : `Giảm ${formatCurrency(appliedVoucher.amount_off)}`
                                          }
                                       </p>
                                    </div>
                                    <button
                                       onClick={removeVoucher}
                                       className='text-gray-400 hover:text-red-500'
                                    >
                                       <TrashIcon className='w-5 h-5' />
                                    </button>
                                 </div>
                              ) : (
                                 <div className='flex items-stretch'>
                                    <input
                                       type='text'
                                       value={voucher}
                                       onChange={(e) => setVoucher(e.target.value)}
                                       placeholder='Nhập mã giảm giá'
                                       className='flex-grow px-3 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                    />
                                    <button
                                       onClick={applyVoucher}
                                       disabled={voucherLoading}
                                       className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-r-md focus:outline-none disabled:bg-gray-400'
                                    >
                                       {voucherLoading ? (
                                          <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                       ) : (
                                          'Áp dụng'
                                       )}
                                    </button>
                                 </div>
                              )}

                              {voucherError && (
                                 <div className='text-red-500 text-sm mt-2 flex items-center'>
                                    <ExclamationCircleIcon className='w-4 h-4 mr-1' />
                                    {voucherError}
                                 </div>
                              )}

                              {voucherSuccess && (
                                 <div className='text-green-600 text-sm mt-2'>
                                    {voucherSuccess}
                                 </div>
                              )}

                              {suggestedVouchers.length > 0 && !appliedVoucher && (
                                 <div className='mt-4'>
                                    <button
                                       onClick={() => setShowVoucherSuggestions(!showVoucherSuggestions)}
                                       className='text-amber-600 text-sm font-medium flex items-center'
                                    >
                                       {showVoucherSuggestions ? 'Ẩn mã giảm giá gợi ý' : 'Xem mã giảm giá phù hợp'}
                                       <svg
                                          className={`ml-1 w-4 h-4 transform transition-transform ${showVoucherSuggestions ? 'rotate-180' : ''}`}
                                          fill='none'
                                          viewBox='0 0 24 24'
                                          stroke='currentColor'
                                       >
                                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                       </svg>
                                    </button>

                                    {showVoucherSuggestions && (
                                       <div className='mt-3 space-y-2'>
                                          {suggestedVouchers.map((v) => (
                                             <div
                                                key={v.id}
                                                className='border border-dashed border-amber-300 rounded-md p-2 bg-amber-50 cursor-pointer hover:bg-amber-100'
                                                onClick={() => {
                                                   setVoucher(v.code);
                                                   setShowVoucherSuggestions(false);
                                                }}
                                             >
                                                <div className='flex justify-between'>
                                                   <span className='font-medium text-amber-800'>{v.code}</span>
                                                   <span className='text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded'>
                                                      {v.percent_off > 0
                                                         ? `Giảm ${v.percent_off}%`
                                                         : `Giảm ${v.amount_off.toLocaleString('vi-VN')}đ`}
                                                   </span>
                                                </div>
                                                <div className='text-xs text-gray-500 mt-1'>
                                                   Đơn tối thiểu {v.min_order_value.toLocaleString('vi-VN')}đ
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>

                           {/* Order summary - Desktop */}
                           <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 hidden lg:block'>
                              <h2 className='text-lg font-semibold mb-4'>Tổng thanh toán</h2>
                              <div className='space-y-3'>
                                 <div className='flex justify-between'>
                                    <span className='text-gray-600'>Tạm tính:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                 </div>
                                 {discount > 0 && (
                                    <div className='flex justify-between text-amber-600'>
                                       <span>Giảm giá:</span>
                                       <span>-{formatCurrency(discount)}</span>
                                    </div>
                                 )}
                                 <div className='pt-3 mt-1 border-t'>
                                    <div className='flex justify-between font-semibold'>
                                       <span>Tổng tiền:</span>
                                       <span className='text-xl text-amber-800'>{formatCurrency(totalPrice)}</span>
                                    </div>
                                    <p className='text-xs text-gray-500 text-right mt-1'>(Đã bao gồm VAT)</p>
                                 </div>
                              </div>
                              <button
                                 onClick={proceedToCheckout}
                                 className='w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium flex items-center justify-center'
                              >
                                 Tiến hành thanh toán
                                 <ArrowRightIcon className='w-4 h-4 ml-2' />
                              </button>

                              {/* Additional information */}
                              <div className='mt-6 pt-6 border-t'>
                                 <div className='text-sm text-gray-600'>
                                    <div className='flex items-start mb-3'>
                                       <div className='w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-3'>
                                          <svg className='w-4 h-4 text-amber-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                             <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                          </svg>
                                       </div>
                                       <div>
                                          <p className='font-medium'>Miễn phí vận chuyển</p>
                                          <p className='text-xs text-gray-500'>Cho đơn hàng từ 500.000₫</p>
                                       </div>
                                    </div>

                                    <div className='flex items-start'>
                                       <div className='w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-3'>
                                          <svg className='w-4 h-4 text-amber-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                             <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                                          </svg>
                                       </div>
                                       <div>
                                          <p className='font-medium'>Thanh toán an toàn</p>
                                          <p className='text-xs text-gray-500'>Hỗ trợ nhiều phương thức thanh toán</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Recently viewed products */}
            <div className='mt-16'>
               <h2 className='text-xl font-semibold mb-6'>Sản phẩm đã xem gần đây</h2>
               <ViewedCarousel />
            </div>
         </div>

         {/* Fixed checkout button - Mobile */}
         {cart && cart.cartItems.length > 0 && (
            <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-20'>
               <div className='flex justify-between items-center mb-2'>
                  <span className='text-gray-700'>Tổng tiền:</span>
                  <span className='text-lg font-bold text-amber-800'>{formatCurrency(totalPrice)}</span>
               </div>
               <button
                  onClick={proceedToCheckout}
                  className='w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium flex items-center justify-center'
               >
                  Tiến hành thanh toán
                  <ArrowRightIcon className='w-4 h-4 ml-2' />
               </button>
            </div>
         )}

         {/* Footer */}
         <Footer />
      </div>
   );
}

// Mock data for payment methods
const paymentMethods = [
   { id: 1, name: 'Vietcombank', logo: '/images/payment/vietcombank.png' },
   { id: 2, name: 'VPBank', logo: '/images/payment/vpbank.png' },
   { id: 3, name: 'Techcombank', logo: '/images/payment/techcombank.png' },
   { id: 4, name: 'BIDV', logo: '/images/payment/bidv.png' },
   { id: 5, name: 'Agribank', logo: '/images/payment/agribank.png' },
   { id: 6, name: 'Sacombank', logo: '/images/payment/sacombank.png' },
   { id: 7, name: 'TPBank', logo: '/images/payment/tpbank.png' },
   { id: 8, name: 'MB Bank', logo: '/images/payment/mbbank.png' },
   { id: 9, name: 'ACB', logo: '/images/payment/acb.png' },
   { id: 10, name: 'VietinBank', logo: '/images/payment/vietinbank.png' },
];
