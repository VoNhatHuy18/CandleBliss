'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
   ArrowLeftIcon,
   ExclamationCircleIcon,
   CheckCircleIcon,
   ShoppingBagIcon,
   TagIcon,
   CreditCardIcon,
   TruckIcon,
   PhoneIcon,
   InformationCircleIcon
} from '@heroicons/react/24/outline';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

// Interfaces for data structures
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

interface Address {
   id: number;
   userId: number;
   fullName: string;
   phone: string;
   provinceId: number;
   provinceName: string;
   districtId: number;
   districtName: string;
   wardId: number;
   wardName: string;
   streetAddress: string;
   isDefault: boolean;
}

interface PaymentMethod {
   id: string;
   name: string;
   description: string;
   icon: React.ReactNode;
}

export default function CheckoutPage() {
   // State for cart data
   const router = useRouter();
   const [cart, setCart] = useState<Cart | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [discount, setDiscount] = useState(0);
   const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
   const [cartId, setCartId] = useState<number | null>(null);
   const [userId, setUserId] = useState<number | null>(null);

   // State for shipping details
   const [addresses, setAddresses] = useState<Address[]>([]);
   const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
   const [showAddressForm, setShowAddressForm] = useState(false);
   const [provinces, setProvinces] = useState<any[]>([]);
   const [districts, setDistricts] = useState<any[]>([]);
   const [wards, setWards] = useState<any[]>([]);

   // Form state for new address
   const [newAddress, setNewAddress] = useState({
      fullName: '',
      phone: '',
      provinceId: 0,
      provinceName: '',
      districtId: 0,
      districtName: '',
      wardId: 0,
      wardName: '',
      streetAddress: '',
      isDefault: false
   });

   // State for payment
   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
   const [orderNotes, setOrderNotes] = useState('');
   const [agreeToTerms, setAgreeToTerms] = useState(false);
   const [placingOrder, setPlacingOrder] = useState(false);
   const [orderSuccess, setOrderSuccess] = useState(false);
   const [orderId, setOrderId] = useState<number | null>(null);

   // Payment methods
   const paymentMethods: PaymentMethod[] = [
      {
         id: 'cod',
         name: 'Thanh toán khi nhận hàng (COD)',
         description: 'Quý khách sẽ thanh toán bằng tiền mặt khi nhận hàng',
         icon: <TruckIcon className="w-6 h-6 text-amber-500" />
      },
      {
         id: 'bank_transfer',
         name: 'Chuyển khoản ngân hàng',
         description: 'Chuyển khoản đến tài khoản ngân hàng của chúng tôi',
         icon: <CreditCardIcon className="w-6 h-6 text-amber-500" />
      },
      {
         id: 'online_payment',
         name: 'Thanh toán trực tuyến',
         description: 'Thanh toán qua cổng thanh toán VNPay',
         icon: <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.6569 19 21 17.6569 21 16V8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V16C3 17.6569 4.34315 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
         </svg>
      }
   ];

   // Shipping methods
   const [shippingMethods, setShippingMethods] = useState([
      { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 30000, estimatedDays: '3-5' },
      { id: 'express', name: 'Giao hàng nhanh', price: 50000, estimatedDays: '1-2' }
   ]);
   const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');

   // Get shipping price based on selected method
   const getShippingPrice = () => {
      const method = shippingMethods.find(m => m.id === selectedShippingMethod);
      return method ? method.price : 0;
   };

   // Format currency for display
   const formatCurrency = (amount: number): string => {
      return amount.toLocaleString('vi-VN') + '₫';
   };

   // Calculate subtotal, shipping, and total
   const subtotal = cart?.totalPrice || 0;
   const shippingPrice = getShippingPrice();
   const freeShippingThreshold = 500000; // Free shipping for orders over 500,000 VND
   const actualShippingPrice = subtotal >= freeShippingThreshold ? 0 : shippingPrice;
   const total = subtotal - discount + actualShippingPrice;

   // Get user data and cart ID from localStorage when component mounts
   useEffect(() => {
      try {
         const userData = JSON.parse(localStorage.getItem('user') || '{}');
         if (userData && userData.id) {
            setUserId(userData.id);
         }

         const storedCartId = localStorage.getItem('cartId');
         if (storedCartId) {
            setCartId(parseInt(storedCartId));
         }

         // Get applied voucher from localStorage if exists
         const storedVoucher = localStorage.getItem('appliedVoucher');
         if (storedVoucher) {
            const voucherData = JSON.parse(storedVoucher);
            setAppliedVoucher(voucherData);
            setDiscount(voucherData.discountAmount || 0);
         }
      } catch (error) {
         console.error('Error parsing data from localStorage:', error);
      }
   }, []);

   // State để kiểm tra lỗi cơ sở dữ liệu
   const [databaseError, setDatabaseError] = useState<boolean>(false);
   const [errorDetails, setErrorDetails] = useState<string>('');

   // Fetch cart data from API
   useEffect(() => {
      const fetchCart = async () => {
         setLoading(true);

         try {
            if (!cartId) {
               throw new Error('Không tìm thấy thông tin giỏ hàng');
            }

            const token = localStorage.getItem('token');
            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               return;
            }

            const response = await fetch(`http://localhost:3000/api/cart/${cartId}`, {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
            });

            // Nếu response không ok, kiểm tra và xử lý lỗi
            if (!response.ok) {
               if (response.status === 500) {
                  // Xử lý lỗi từ server
                  const errorData = await response.json();
                  console.error('Server error:', errorData);

                  // Kiểm tra lỗi cụ thể về bảng cart_item
                  if (errorData.message && (
                     errorData.message.includes("relation") &&
                     errorData.message.includes("cart_item") &&
                     errorData.message.includes("does not exist")
                  )) {
                     setDatabaseError(true);
                     setErrorDetails('Bảng cart_item chưa được tạo trong cơ sở dữ liệu');
                     throw new Error('Hệ thống đang được bảo trì. Chúng tôi sẽ khắc phục sớm nhất có thể.');
                  }
               }
               throw new Error(`Lỗi: ${response.status}`);
            }

            const data = await response.json();

            // Check if cart exists and has items
            if (!data || !data.cartItems || data.cartItems.length === 0) {
               setError('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.');
               setLoading(false);
               return;
            }

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
         } catch (err: any) {
            console.error('Failed to fetch cart:', err);

            // Xử lý cụ thể cho lỗi "cart_item does not exist"
            if (databaseError) {
               setError('Hệ thống đang được bảo trì. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.');
            } else if (err.message.includes('cơ sở dữ liệu')) {
               setError(err.message);
            } else {
               setError('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
            }
         } finally {
            setLoading(false);
         }
      };

      if (cartId) {
         fetchCart();
      }
   }, [cartId, databaseError]);

   // Fetch user addresses
   useEffect(() => {
      const fetchAddresses = async () => {
         if (!userId) return;

         try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/users/${userId}/addresses`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error(`Error fetching addresses: ${response.status}`);
            }

            const data = await response.json();
            setAddresses(data);

            // Set default address as selected
            const defaultAddress = data.find((addr: Address) => addr.isDefault);
            if (defaultAddress) {
               setSelectedAddressId(defaultAddress.id);
            } else if (data.length > 0) {
               setSelectedAddressId(data[0].id);
            } else {
               // No addresses found, show address form
               setShowAddressForm(true);
            }
         } catch (error) {
            console.error('Failed to fetch addresses:', error);
         }
      };

      fetchAddresses();
   }, [userId]);

   // Fetch provinces, districts, and wards for address form
   useEffect(() => {
      const fetchProvinces = async () => {
         try {
            const response = await fetch('http://localhost:3000/api/locations/provinces');
            if (!response.ok) {
               throw new Error('Failed to fetch provinces');
            }
            const data = await response.json();
            setProvinces(data);
         } catch (error) {
            console.error('Error fetching provinces:', error);
         }
      };

      fetchProvinces();
   }, []);

   // Fetch districts when province changes
   useEffect(() => {
      const fetchDistricts = async () => {
         if (newAddress.provinceId <= 0) {
            setDistricts([]);
            return;
         }

         try {
            const response = await fetch(`http://localhost:3000/api/locations/districts/${newAddress.provinceId}`);
            if (!response.ok) {
               throw new Error('Failed to fetch districts');
            }
            const data = await response.json();
            setDistricts(data);
         } catch (error) {
            console.error('Error fetching districts:', error);
         }
      };

      fetchDistricts();
   }, [newAddress.provinceId]);

   // Fetch wards when district changes
   useEffect(() => {
      const fetchWards = async () => {
         if (newAddress.districtId <= 0) {
            setWards([]);
            return;
         }

         try {
            const response = await fetch(`http://localhost:3000/api/locations/wards/${newAddress.districtId}`);
            if (!response.ok) {
               throw new Error('Failed to fetch wards');
            }
            const data = await response.json();
            setWards(data);
         } catch (error) {
            console.error('Error fetching wards:', error);
         }
      };

      fetchWards();
   }, [newAddress.districtId]);

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

   // Handle province change
   const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const provinceId = parseInt(e.target.value);
      const provinceName = e.target.options[e.target.selectedIndex].text;

      setNewAddress({
         ...newAddress,
         provinceId,
         provinceName,
         districtId: 0,
         districtName: '',
         wardId: 0,
         wardName: ''
      });
   };

   // Handle district change
   const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const districtId = parseInt(e.target.value);
      const districtName = e.target.options[e.target.selectedIndex].text;

      setNewAddress({
         ...newAddress,
         districtId,
         districtName,
         wardId: 0,
         wardName: ''
      });
   };

   // Handle ward change
   const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const wardId = parseInt(e.target.value);
      const wardName = e.target.options[e.target.selectedIndex].text;

      setNewAddress({
         ...newAddress,
         wardId,
         wardName
      });
   };

   // Save new address
   const saveNewAddress = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      if (!newAddress.fullName || !newAddress.phone || !newAddress.provinceId ||
         !newAddress.districtId || !newAddress.wardId || !newAddress.streetAddress) {
         alert('Vui lòng điền đầy đủ thông tin địa chỉ');
         return;
      }

      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`http://localhost:3000/api/users/${userId}/addresses`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               ...newAddress,
               userId
            }),
         });

         if (!response.ok) {
            throw new Error('Failed to save address');
         }

         const savedAddress = await response.json();

         // Update addresses list and select the new address
         setAddresses([...addresses, savedAddress]);
         setSelectedAddressId(savedAddress.id);
         setShowAddressForm(false);

         // Reset form
         setNewAddress({
            fullName: '',
            phone: '',
            provinceId: 0,
            provinceName: '',
            districtId: 0,
            districtName: '',
            wardId: 0,
            wardName: '',
            streetAddress: '',
            isDefault: false
         });
      } catch (error) {
         console.error('Error saving address:', error);
         alert('Không thể lưu địa chỉ. Vui lòng thử lại sau.');
      }
   };

   // Handle place order
   const placeOrder = async () => {
      // Validate required fields
      if (!selectedAddressId) {
         alert('Vui lòng chọn địa chỉ giao hàng');
         return;
      }

      if (!selectedPaymentMethod) {
         alert('Vui lòng chọn phương thức thanh toán');
         return;
      }

      if (!agreeToTerms) {
         alert('Vui lòng đồng ý với điều khoản và điều kiện');
         return;
      }

      setPlacingOrder(true);

      try {
         const token = localStorage.getItem('token');

         // Create order
         const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               userId,
               cartId,
               addressId: selectedAddressId,
               paymentMethod: selectedPaymentMethod,
               shippingMethod: selectedShippingMethod,
               shippingPrice: actualShippingPrice,
               discount: discount,
               subtotal: subtotal,
               total: total,
               notes: orderNotes,
               voucherId: appliedVoucher?.id || null
            }),
         });

         if (!response.ok) {
            // Xử lý lỗi HTTP
            if (response.status === 500) {
               const errorData = await response.json();
               console.error('Server error during order placement:', errorData);

               // Kiểm tra lỗi liên quan đến cart_item
               if (errorData.message &&
                  errorData.message.includes("relation") &&
                  errorData.message.includes("cart_item") &&
                  errorData.message.includes("does not exist")) {
                  throw new Error("Hệ thống đang gặp sự cố với cơ sở dữ liệu giỏ hàng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
               } else {
                  throw new Error('Lỗi máy chủ khi xử lý đơn hàng. Vui lòng thử lại sau.');
               }
            }
            throw new Error(`Lỗi: ${response.status}`);
         }

         const orderData = await response.json();

         // Handle different payment methods
         if (selectedPaymentMethod === 'online_payment') {
            // Redirect to payment gateway
            window.location.href = `http://localhost:3000/api/payments/vnpay?orderId=${orderData.id}&amount=${total}`;
            return;
         }

         // For COD and bank transfer
         setOrderSuccess(true);
         setOrderId(orderData.id);

         // Clear cart and voucher from localStorage
         localStorage.removeItem('cartId');
         localStorage.removeItem('appliedVoucher');

      } catch (error: any) {
         console.error('Error placing order:', error);

         // Hiển thị thông báo lỗi cụ thể hơn
         if (error.message && error.message.includes('cơ sở dữ liệu')) {
            alert(error.message);
         } else if (error.message && error.message.includes('cart_item')) {
            alert("Hệ thống đang gặp sự cố kỹ thuật với giỏ hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ qua hotline 1900 xxxx xxx.");
         } else {
            alert(error.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
         }
      } finally {
         setPlacingOrder(false);
      }
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

                  {databaseError ? (
                     <div className="mb-8">
                        <div className="flex items-center justify-center mb-4">
                           <div className="relative">
                              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                                 <InformationCircleIcon className="w-12 h-12 text-amber-500" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border-2 border-white">
                                 <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 </svg>
                              </div>
                           </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
                           <h3 className="font-medium text-amber-800 mb-2">Thông báo bảo trì hệ thống</h3>
                           <p className="text-gray-700 mb-2">
                              Hệ thống đang được nâng cấp để phục vụ quý khách tốt hơn. Chúng tôi đang khắc phục lỗi cơ sở dữ liệu và sẽ hoàn thành trong thời gian sớm nhất.
                           </p>
                           <p className="text-gray-700">
                              Thời gian dự kiến hoàn thành: <span className="font-medium">Trong vòng 24 giờ tới</span>
                           </p>
                        </div>

                        <div className="border rounded-lg p-4 divide-y">
                           <div className="pb-4">
                              <h3 className="font-medium text-gray-800 mb-2">Các phương thức đặt hàng thay thế:</h3>
                              <ul className="space-y-2">
                                 <li className="flex items-start">
                                    <PhoneIcon className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                       <p className="font-medium">Đặt hàng qua hotline</p>
                                       <p className="text-sm text-gray-600">1900 xxxx xxx (8:00 - 22:00)</p>
                                    </div>
                                 </li>
                                 <li className="flex items-start">
                                    <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                       <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    <div>
                                       <p className="font-medium">Đặt hàng qua Facebook</p>
                                       <a href="https://facebook.com/candlebliss" className="text-sm text-amber-600 hover:underline">facebook.com/candlebliss</a>
                                    </div>
                                 </li>
                                 <li className="flex items-start">
                                    <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                       <path d="M12.042 23.648c-7.813 0-12.042-4.876-12.042-11.171 0-6.727 4.762-12.125 13.276-12.125 6.214 0 10.724 4.038 10.724 9.601 0 8.712-10.33 11.012-9.812 6.042-.71 1.108-1.854 2.354-4.053 2.354-2.516 0-4.08-1.842-4.08-4.807 0-4.444 2.921-8.199 6.379-8.199 1.659 0 2.8.876 3.277 2.221l.464-1.632h2.338c-.244.832-2.321 8.527-2.321 8.527-.648 2.666 1.35 2.713 3.122 1.297 3.329-2.58 3.501-9.327-.998-12.141-4.821-2.891-15.795-1.102-15.795 8.693 0 5.611 3.95 9.381 9.829 9.381 3.436 0 5.542-.93 7.295-1.948l1.177 1.698c-1.711.966-4.461 2.209-8.78 2.209zm-2.344-14.305c-.715 1.34-1.177 3.076-1.177 4.424 0 3.61 3.522 3.633 5.252.239.712-1.394 1.171-3.171 1.171-4.529 0-2.917-3.495-3.434-5.246-.134z" />
                                    </svg>
                                    <div>
                                       <p className="font-medium">Đặt hàng qua email</p>
                                       <a href="mailto:order@candlebliss.com" className="text-sm text-amber-600 hover:underline">order@candlebliss.com</a>
                                    </div>
                                 </li>
                              </ul>
                           </div>

                           <div className="pt-4">
                              <h3 className="font-medium text-gray-800 mb-2">Thông tin kỹ thuật cho quản trị viên:</h3>
                              <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-auto">
                                 <p className="text-red-600">Error: relation "cart_item" does not exist</p>
                                 <p className="text-gray-600 mt-1">{errorDetails}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className='flex flex-col sm:flex-row justify-center gap-4'>
                        <Link href="/" className='px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition-colors'>
                           Quay về trang chủ
                        </Link>
                        <Link
                           href="/user/cart"
                           className='px-6 py-2 bg-amber-600 hover:bg-amber-700 rounded-md font-medium text-white transition-colors'
                        >
                           Quay lại giỏ hàng
                        </Link>
                     </div>
                  )}
               </div>
            </div>
            <Footer />
         </div>
      );
   }

   // Render order success state
   if (orderSuccess) {
      return (
         <div className='bg-gray-50 min-h-screen flex flex-col'>
            <Header />
            <div className='container mx-auto flex-grow px-4 py-12'>
               <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center'>
                  <div className='text-green-500 mb-4'>
                     <CheckCircleIcon className='w-16 h-16 mx-auto' />
                  </div>
                  <h2 className='text-2xl font-semibold mb-4'>Đặt hàng thành công!</h2>
                  <p className='text-gray-600 mb-2'>Cảm ơn bạn đã đặt hàng tại CandleBliss.</p>
                  <p className='text-gray-600 mb-6'>Mã đơn hàng của bạn: <span className='font-semibold text-amber-600'>#{orderId}</span></p>

                  <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left'>
                     <h3 className='font-medium text-amber-800 mb-2'>Thông tin đơn hàng:</h3>
                     <ul className='space-y-1 text-sm text-gray-600'>
                        <li>• Tổng thanh toán: <span className='font-medium'>{formatCurrency(total)}</span></li>
                        <li>• Phương thức thanh toán: <span className='font-medium'>{
                           selectedPaymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                              selectedPaymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                                 'Thanh toán trực tuyến'
                        }</span></li>
                        <li>• Email xác nhận đã được gửi đến địa chỉ email của bạn</li>
                     </ul>
                  </div>

                  <div className='flex flex-col sm:flex-row justify-center gap-4'>
                     <Link href="/user/account/orders" className='px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-md font-medium text-white transition-colors'>
                        Xem đơn hàng của tôi
                     </Link>
                     <Link href="/" className='px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition-colors'>
                        Tiếp tục mua sắm
                     </Link>
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
            <h1 className='text-2xl font-bold text-center mb-8'>Thanh toán</h1>

            {/* Breadcrumb navigation */}
            <div className='text-sm mb-8 hidden md:block'>
               <div className='max-w-6xl mx-auto'>
                  <Link href='/' className='text-gray-500 hover:text-amber-600 transition-colors'>Trang chủ</Link>
                  <span className='mx-2 text-gray-400'>/</span>
                  <Link href='/user/cart' className='text-gray-500 hover:text-amber-600 transition-colors'>Giỏ hàng</Link>
                  <span className='mx-2 text-gray-400'>/</span>
                  <span className='text-gray-700 font-medium'>Thanh toán</span>
               </div>
            </div>

            {/* Back to cart button - Mobile */}
            <div className='md:hidden mb-6'>
               <Link
                  href='/user/cart'
                  className='inline-flex items-center text-amber-600 font-medium'
               >
                  <ArrowLeftIcon className='w-4 h-4 mr-1' />
                  Quay lại giỏ hàng
               </Link>
            </div>

            <div className='max-w-6xl mx-auto'>
               <div className='flex flex-col lg:flex-row gap-6'>
                  {/* Shipping and Payment - Left column */}
                  <div className='lg:w-2/3 space-y-6'>
                     {/* Shipping address section */}
                     <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6'>
                        <h2 className='text-lg font-semibold mb-4 flex items-center'>
                           <TruckIcon className='w-5 h-5 mr-2 text-amber-600' />
                           Địa chỉ giao hàng
                        </h2>

                        {/* Address selection */}
                        {addresses.length > 0 && !showAddressForm && (
                           <div className='mb-4'>
                              <div className='space-y-3'>
                                 {addresses.map((address) => (
                                    <div
                                       key={address.id}
                                       className={`border rounded-lg p-3 cursor-pointer ${selectedAddressId === address.id
                                          ? 'border-amber-500 bg-amber-50'
                                          : 'border-gray-200 hover:border-amber-300'
                                          }`}
                                       onClick={() => setSelectedAddressId(address.id)}
                                    >
                                       <div className='flex items-start'>
                                          <div className={`w-4 h-4 mt-1 rounded-full flex-shrink-0 mr-3 ${selectedAddressId === address.id
                                             ? 'bg-amber-500 ring-2 ring-amber-200'
                                             : 'border-2 border-gray-300'
                                             }`}></div>
                                          <div className='flex-grow'>
                                             <div className='flex justify-between'>
                                                <span className='font-medium'>{address.fullName}</span>
                                                {address.isDefault && (
                                                   <span className='text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded'>Mặc định</span>
                                                )}
                                             </div>
                                             <div className='text-gray-600 text-sm mt-1'>{address.phone}</div>
                                             <div className='text-gray-600 text-sm mt-1'>
                                                {address.streetAddress}, {address.wardName}, {address.districtName}, {address.provinceName}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              <button
                                 onClick={() => setShowAddressForm(true)}
                                 className='mt-4 text-amber-600 font-medium hover:text-amber-700 flex items-center'
                              >
                                 <span className='mr-1'>+</span> Thêm địa chỉ mới
                              </button>
                           </div>
                        )}

                        {/* New address form */}
                        {showAddressForm && (
                           <form onSubmit={saveNewAddress} className='space-y-4 bg-gray-50 p-4 rounded-lg'>
                              <h3 className='font-medium'>Thêm địa chỉ mới</h3>

                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Họ tên người nhận</label>
                                    <input
                                       type='text'
                                       value={newAddress.fullName}
                                       onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                       className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                       required
                                    />
                                 </div>

                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                                    <input
                                       type='tel'
                                       value={newAddress.phone}
                                       onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                       className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                       required
                                    />
                                 </div>
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-1'>Tỉnh/Thành phố</label>
                                 <select
                                    value={newAddress.provinceId || ''}
                                    onChange={handleProvinceChange}
                                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                    required
                                 >
                                    <option value=''>Chọn Tỉnh/Thành phố</option>
                                    {provinces.map(province => (
                                       <option key={province.id} value={province.id}>
                                          {province.name}
                                       </option>
                                    ))}
                                 </select>
                              </div>

                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Quận/Huyện</label>
                                    <select
                                       value={newAddress.districtId || ''}
                                       onChange={handleDistrictChange}
                                       className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                       required
                                       disabled={!newAddress.provinceId}
                                    >
                                       <option value=''>Chọn Quận/Huyện</option>
                                       {districts.map(district => (
                                          <option key={district.id} value={district.id}>
                                             {district.name}
                                          </option>
                                       ))}
                                    </select>
                                 </div>

                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phường/Xã</label>
                                    <select
                                       value={newAddress.wardId || ''}
                                       onChange={handleWardChange}
                                       className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                       required
                                       disabled={!newAddress.districtId}
                                    >
                                       <option value=''>Chọn Phường/Xã</option>
                                       {wards.map(ward => (
                                          <option key={ward.id} value={ward.id}>
                                             {ward.name}
                                          </option>
                                       ))}
                                    </select>
                                 </div>
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ cụ thể</label>
                                 <input
                                    type='text'
                                    value={newAddress.streetAddress}
                                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                                    placeholder='Số nhà, tên đường, khu vực'
                                    className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500'
                                    required
                                 />
                              </div>

                              <div className='flex items-center'>
                                 <input
                                    id='default-address'
                                    type='checkbox'
                                    checked={newAddress.isDefault}
                                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                    className='w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                                 />
                                 <label htmlFor='default-address' className='ml-2 text-sm text-gray-700'>
                                    Đặt làm địa chỉ mặc định
                                 </label>
                              </div>

                              <div className='flex gap-3'>
                                 <button
                                    type='submit'
                                    className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md'
                                 >
                                    Lưu địa chỉ
                                 </button>

                                 <button
                                    type='button'
                                    onClick={() => {
                                       setShowAddressForm(false);
                                       // Reset form
                                       setNewAddress({
                                          fullName: '',
                                          phone: '',
                                          provinceId: 0,
                                          provinceName: '',
                                          districtId: 0,
                                          districtName: '',
                                          wardId: 0,
                                          wardName: '',
                                          streetAddress: '',
                                          isDefault: false
                                       });
                                    }}
                                    className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md'
                                 >
                                    Hủy
                                 </button>
                              </div>
                           </form>
                        )}
                     </div>

                     {/* Shipping method section */}
                     <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6'>
                        <h2 className='text-lg font-semibold mb-4 flex items-center'>
                           <TruckIcon className='w-5 h-5 mr-2 text-amber-600' />
                           Phương thức vận chuyển
                        </h2>

                        <div className='space-y-3'>
                           {shippingMethods.map((method) => (
                              <div
                                 key={method.id}
                                 className={`border rounded-lg p-3 cursor-pointer ${selectedShippingMethod === method.id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300'
                                    }`}
                                 onClick={() => setSelectedShippingMethod(method.id)}
                              >
                                 <div className='flex items-center'>
                                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mr-3 ${selectedShippingMethod === method.id
                                       ? 'bg-amber-500 ring-2 ring-amber-200'
                                       : 'border-2 border-gray-300'
                                       }`}></div>
                                    <div className='flex-grow'>
                                       <span className='font-medium'>{method.name}</span>
                                       <div className='text-gray-500 text-sm'>
                                          Thời gian giao hàng: {method.estimatedDays} ngày làm việc
                                       </div>
                                    </div>
                                    <div className='text-amber-700 font-medium'>
                                       {subtotal >= freeShippingThreshold
                                          ? 'Miễn phí'
                                          : formatCurrency(method.price)
                                       }
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {subtotal >= freeShippingThreshold && (
                           <div className='mt-3 text-sm text-green-600 flex items-center'>
                              <CheckCircleIcon className='w-4 h-4 mr-1' />
                              Đơn hàng của bạn được miễn phí vận chuyển
                           </div>
                        )}
                     </div>

                     {/* Payment method section */}
                     <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6'>
                        <h2 className='text-lg font-semibold mb-4 flex items-center'>
                           <CreditCardIcon className='w-5 h-5 mr-2 text-amber-600' />
                           Phương thức thanh toán
                        </h2>

                        <div className='space-y-3'>
                           {paymentMethods.map((method) => (
                              <div
                                 key={method.id}
                                 className={`border rounded-lg p-3 cursor-pointer ${selectedPaymentMethod === method.id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300'
                                    }`}
                                 onClick={() => setSelectedPaymentMethod(method.id)}
                              >
                                 <div className='flex items-start'>
                                    <div className={`w-4 h-4 mt-1 rounded-full flex-shrink-0 mr-3 ${selectedPaymentMethod === method.id
                                       ? 'bg-amber-500 ring-2 ring-amber-200'
                                       : 'border-2 border-gray-300'
                                       }`}></div>
                                    <div className='flex-grow'>
                                       <div className='flex items-center'>
                                          <span className='mr-2'>{method.icon}</span>
                                          <span className='font-medium'>{method.name}</span>
                                       </div>
                                       <div className='text-gray-500 text-sm mt-1'>
                                          {method.description}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {selectedPaymentMethod === 'bank_transfer' && (
                           <div className='mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200'>
                              <h3 className='font-medium text-sm mb-2'>Thông tin tài khoản:</h3>
                              <ul className='text-sm space-y-1 text-gray-600'>
                                 <li>• Ngân hàng: <span className='font-medium'>Vietcombank</span></li>
                                 <li>• Số tài khoản: <span className='font-medium'>1234567890</span></li>
                                 <li>• Chủ tài khoản: <span className='font-medium'>CÔNG TY TNHH CANDLEBLISS</span></li>
                                 <li>• Nội dung chuyển khoản: <span className='font-medium'>Ghi rõ họ tên và số điện thoại</span></li>
                              </ul>
                           </div>
                        )}
                     </div>

                     {/* Order notes */}
                     <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6'>
                        <h2 className='text-lg font-semibold mb-4'>Ghi chú đơn hàng</h2>
                        <textarea
                           value={orderNotes}
                           onChange={(e) => setOrderNotes(e.target.value)}
                           placeholder='Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn.'
                           className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 h-24'
                        ></textarea>
                     </div>
                  </div>

                  {/* Order summary - Right column */}
                  <div className='lg:w-1/3'>
                     <div className='sticky top-6'>
                        <div className='bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6'>
                           <h2 className='text-lg font-semibold mb-4'>Thông tin đơn hàng</h2>

                           {/* Order items */}
                           <div className='border-b pb-4 mb-4'>
                              <div className='max-h-60 overflow-y-auto space-y-3 pr-2'>
                                 {cart?.cartItems.map((item) => (
                                    <div key={item.id} className='flex items-start'>
                                       <div className='w-16 h-16 bg-gray-100 border rounded-md overflow-hidden flex-shrink-0'>
                                          <Image
                                             src={item.product?.image || 'https://via.placeholder.com/64'}
                                             alt={item.product?.name || 'Product image'}
                                             width={64}
                                             height={64}
                                             className='w-full h-full object-cover'
                                          />
                                       </div>
                                       <div className='ml-3 flex-grow'>
                                          <div className='flex justify-between'>
                                             <div>
                                                <h3 className='text-sm font-medium text-gray-800 line-clamp-2'>
                                                   {item.product?.name || 'Product Name'}
                                                </h3>
                                                <p className='text-xs text-gray-500'>
                                                   {item.product?.type || 'Product Type'}
                                                </p>
                                                {item.product?.options && item.product.options.length > 0 && (
                                                   <div className='text-xs text-gray-500'>
                                                      {item.product.options.map((option, idx) => (
                                                         <span key={idx}>
                                                            {option.name}: {option.value}
                                                            {item.product?.options && idx < item.product.options.length - 1 ? ', ' : ''}
                                                         </span>
                                                      ))}
                                                   </div>
                                                )}
                                             </div>
                                             <div className='text-sm'>
                                                <span className='text-gray-600'>x{item.quantity}</span>
                                             </div>
                                          </div>
                                          <div className='mt-1 text-sm text-amber-700 font-medium'>
                                             {formatCurrency(item.totalPrice)}
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Applied voucher */}
                           {appliedVoucher && (
                              <div className='border-b pb-4 mb-4'>
                                 <div className='flex items-center justify-between text-sm'>
                                    <div className='flex items-center text-amber-600'>
                                       <TagIcon className='w-4 h-4 mr-1' />
                                       <span>Mã giảm giá: <span className='font-medium'>{appliedVoucher.code}</span></span>
                                    </div>
                                    <span className='text-amber-600'>-{formatCurrency(discount)}</span>
                                 </div>
                              </div>
                           )}

                           {/* Order totals */}
                           <div className='space-y-2'>
                              <div className='flex justify-between text-sm'>
                                 <span className='text-gray-600'>Tạm tính:</span>
                                 <span>{formatCurrency(subtotal)}</span>
                              </div>

                              {discount > 0 && (
                                 <div className='flex justify-between text-sm'>
                                    <span className='text-gray-600'>Giảm giá:</span>
                                    <span className='text-amber-600'>-{formatCurrency(discount)}</span>
                                 </div>
                              )}

                              <div className='flex justify-between text-sm'>
                                 <span className='text-gray-600'>Phí vận chuyển:</span>
                                 <span>
                                    {actualShippingPrice === 0
                                       ? <span className='text-green-600'>Miễn phí</span>
                                       : formatCurrency(actualShippingPrice)
                                    }
                                 </span>
                              </div>

                              <div className='pt-3 mt-2 border-t flex justify-between items-center'>
                                 <span className='font-medium'>Tổng thanh toán:</span>
                                 <div className='text-right'>
                                    <div className='text-xl font-semibold text-amber-800'>{formatCurrency(total)}</div>
                                    <div className='text-xs text-gray-500'>(Đã bao gồm VAT)</div>
                                 </div>
                              </div>
                           </div>

                           {/* Terms and conditions */}
                           <div className='mt-6'>
                              <div className='flex items-start'>
                                 <input
                                    id='terms'
                                    type='checkbox'
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className='w-4 h-4 mt-1 text-amber-600 focus:ring-amber-500 border-gray-300 rounded'
                                 />
                                 <label htmlFor='terms' className='ml-2 text-sm text-gray-600'>
                                    Tôi đã đọc và đồng ý với <Link href="/terms" className='text-amber-600 hover:text-amber-700'>điều khoản và điều kiện</Link> của CandleBliss
                                 </label>
                              </div>
                           </div>

                           {/* Place order button */}
                           <button
                              onClick={placeOrder}
                              disabled={placingOrder || !agreeToTerms}
                              className='w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-md font-medium flex items-center justify-center'
                           >
                              {placingOrder ? (
                                 <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                              ) : null}
                              Đặt hàng
                           </button>

                           {/* Back to cart */}
                           <div className='mt-4 text-center'>
                              <Link
                                 href='/user/cart'
                                 className='text-sm text-amber-600 hover:text-amber-700'
                              >
                                 Quay lại giỏ hàng
                              </Link>
                           </div>

                           {/* Secure payments */}
                           <div className='mt-6 pt-6 border-t'>
                              <div className='flex items-center justify-center mb-4'>
                                 <svg className='w-5 h-5 text-green-600 mr-1.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                                 </svg>
                                 <span className='text-sm font-medium'>Thanh toán an toàn & bảo mật</span>
                              </div>

                              {/* Payment method logos */}
                              <div className='flex flex-wrap justify-center gap-2'>
                                 <div className='w-12 h-8 bg-gray-100 rounded-md'></div>
                                 <div className='w-12 h-8 bg-gray-100 rounded-md'></div>
                                 <div className='w-12 h-8 bg-gray-100 rounded-md'></div>
                                 <div className='w-12 h-8 bg-gray-100 rounded-md'></div>
                                 <div className='w-12 h-8 bg-gray-100 rounded-md'></div>
                              </div>
                           </div>
                        </div>

                        {/* Technical issues notice */}
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800'>
                           <div className='flex items-start'>
                              <svg className='w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              <div>
                                 <p>Hệ thống đang được nâng cấp. Nếu bạn gặp vấn đề khi thanh toán, vui lòng liên hệ với chúng tôi qua hotline: <strong>1900 xxxx xxx</strong></p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Footer */}
         <Footer />
      </div>
   );
}