'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { useCart } from '@/app/contexts/CartContext';
import { HOST } from '@/app/constants/api';

// Interfaces
interface CartItem {
   id: number;
   detailId?: number;
   name: string;
   price: number;
   quantity: number;
   image: string;
   type: string;
   size: string;
   value: string;
   options?: { name: string; value: string, type: string }[];
   productDetailId?: number;
   totalPrice?: number;
   isGift?: boolean;
   productDetails?: {
      id: number;
      detailId: number;
      name: string;
      price: number;
      quantity: number;
      image: string;
      type: string;
      size: string;
      value: string;
      options: { name: string; value: string, type: string }[];
   }[];
}

interface ApiCartItem {
   id: number;
   productDetailId: number;
   quantity: number;
   totalPrice: number;
   cartId: number;
}

interface Cart {
   id: number;
   userId: number;
   status: string;
   totalQuantity: string;
   totalPrice: string;
   cartItems: ApiCartItem[];
}

// Format price helper function
const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(price);
};

// Thêm hàm tạo giỏ hàng mới sau khi thanh toán thành công

export default function CartPage() {
   const router = useRouter();
   const { updateCartBadge } = useCart();
   const [cartItems, setCartItems] = useState<CartItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [totalQuantity, setTotalQuantity] = useState(0);
   const [totalPrice, setTotalPrice] = useState(0);
   const [userId, setUserId] = useState<number | null>(null);
   const [apiCart, setApiCart] = useState<Cart | null>(null);
   const [syncing, setSyncing] = useState(false);
   const [syncMessage, setSyncMessage] = useState('');
   interface ProductDetail {
      id: number;
      name: string;
      stock: number;
      price: number;
      [key: string]: string | number | boolean | undefined; // Add additional fields if necessary
   }

   const [productDetails, setProductDetails] = useState<Record<number, ProductDetail>>({});
   const [orderCompleted, setOrderCompleted] = useState(false);

   // First, declare mergeCartsWithApi since syncCartWithApi depends on it
   const mergeCartsWithApi = useCallback(
      async (apiCart: Cart, localItems: CartItem[]) => {
         try {
            setSyncMessage('Đang đồng bộ sản phẩm...');

            for (const item of localItems) {
               // Check if item already exists in API cart
               const existsInApi = apiCart.cartItems.some(
                  (apiItem) => apiItem.productDetailId === item.detailId,
               );

               if (!existsInApi) {
                  try {
                     // Sửa endpoint để phù hợp với API của bạn
                     // POST /api/cart/{cartId}/add-item/{productDetailId}
                     const addResponse = await fetch(
                        `${HOST}/api/cart/${apiCart.id}/add-item/${item.detailId}`,
                        {
                           method: 'POST',
                           headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                           },
                           body: JSON.stringify({
                              quantity: item.quantity,
                           }),
                        },
                     );

                     if (!addResponse.ok) {
                        const errorText = await addResponse.text();
                        console.error('Error adding item to cart:', errorText);
                     }
                  } catch (fetchError) {
                     console.error('Network error adding item:', fetchError);
                  }
               }
            }

            // Refresh API cart data using GET /api/cart/{cartId}
            try {
               const updatedCartResponse = await fetch(
                  `${HOST}/api/cart/${apiCart.id}`,
               );
               if (updatedCartResponse.ok) {
                  // Thêm kiểm tra phản hồi trước khi phân tích JSON
                  const responseText = await updatedCartResponse.text();

                  // Chỉ phân tích JSON nếu phản hồi không rỗng
                  if (responseText && responseText.trim()) {
                     try {
                        const updatedCart = JSON.parse(responseText);
                        setApiCart(updatedCart);
                     } catch (jsonError) {
                        console.error(
                           'Error parsing updated cart response:',
                           jsonError,
                           'Response was:',
                           responseText,
                        );
                     }
                  } else {
                     console.log('Empty response when fetching updated cart');
                  }
               }
            } catch (fetchError) {
               console.error('Network error refreshing cart:', fetchError);
            }

            setSyncMessage('Đồng bộ hoàn tất!');
            setTimeout(() => setSyncMessage(''), 2000);
         } catch (err) {
            console.error('Error merging carts:', err);
            setSyncMessage('Lỗi khi đồng bộ. Xin thử lại sau.');
         }
      },
      [setSyncMessage, setApiCart],
   );

   // Then declare syncCartWithApi
   const syncCartWithApi = useCallback(async () => {
      // Get either real userId or guest ID

      try {
         setSyncing(true);
         setSyncMessage('Đang đồng bộ giỏ hàng...');

         // For guests, we only use local storage cart
         if (!userId) {
            // Skip API interaction and just use local cart
            setSyncing(false);
            setSyncMessage('');
            return;
         }

         // Fetch user's cart from API
         let response;
         try {
            response = await fetch(`${HOST}/api/cart/user/${userId}`);
         } catch (fetchError) {
            console.error('Network error fetching cart:', fetchError);
            setSyncMessage('Lỗi kết nối với máy chủ');
            setSyncing(false);
            return;
         }

         // Handle cart creation regardless of whether one already exists
         if (!response.ok) {
            // If no cart exists or any other error, try creating a new cart
            try {
               console.log('Creating new cart for user:', userId);
               const createCartResponse = await fetch(`${HOST}/api/cart`, {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                  },
                  body: JSON.stringify({ userId }),
               });

               if (createCartResponse.ok) {
                  // Get response as text first
                  const responseText = await createCartResponse.text();

                  // Only try to parse if there's actual content
                  if (responseText && responseText.trim()) {
                     try {
                        const newCart = JSON.parse(responseText);
                        console.log('New cart created:', newCart);
                        setApiCart(newCart);

                        // Add local items to the new cart if any
                        if (cartItems.length > 0) {
                           await mergeCartsWithApi(newCart, cartItems);
                        } else {
                           setSyncMessage('Giỏ hàng mới đã được tạo');
                           setTimeout(() => setSyncMessage(''), 2000);
                        }
                     } catch (jsonError) {
                        console.error('Error parsing create cart response:', jsonError);
                        setSyncMessage('Giỏ hàng đã được tạo (định dạng phản hồi không hợp lệ)');
                        // Nếu JSON không hợp lệ, vẫn thử tải lại giỏ hàng
                        fetchUserCart(userId);
                     }
                  } else {
                     console.log('Empty response from create cart API');
                     setSyncMessage('Giỏ hàng đã được tạo thành công');
                     // Nếu phản hồi rỗng, vẫn thử tải lại giỏ hàng
                     fetchUserCart(userId);
                  }
               } else {
                  const errorText = await createCartResponse.text();
                  console.error('Error creating cart:', errorText);
                  setSyncMessage('Không thể tạo giỏ hàng mới');
               }
            } catch (createError) {
               console.error('Error creating new cart:', createError);
               setSyncMessage('Lỗi khi tạo giỏ hàng mới');
            }
         } else {
            // Cart exists, process normally
            try {
               // Get response as text first
               const responseText = await response.text();

               // Only try to parse if there's actual content
               if (responseText && responseText.trim()) {
                  try {
                     const userCart = JSON.parse(responseText);
                     console.log('Existing cart found:', userCart);
                     setApiCart(userCart);

                     // If we have a remote cart and local items, we should merge them
                     if (userCart && cartItems.length > 0) {
                        await mergeCartsWithApi(userCart, cartItems);
                     }
                  } catch (jsonError) {
                     console.error(
                        'Error parsing API response:',
                        jsonError,
                        'Response was:',
                        responseText,
                     );
                     setSyncMessage('Lỗi định dạng phản hồi từ máy chủ');
                  }
               } else {
                  console.log('Empty response from get cart API');
                  setSyncMessage('Giỏ hàng trống hoặc không có dữ liệu');
               }
            } catch (textError) {
               console.error('Error reading response text:', textError);
               setSyncMessage('Lỗi đọc phản hồi từ máy chủ');
            }
         }

         setSyncing(false);
         setSyncMessage('');
      } catch (err) {
         console.error('Error syncing with API cart:', err);
         setSyncing(false);
         setSyncMessage('Đồng bộ thất bại. Xin thử lại sau.');
      }
   }, [
      userId,
      orderCompleted,
      setSyncMessage,
      setSyncing,
      setApiCart,
      cartItems,
      mergeCartsWithApi,
   ]);

   // Now, declare createNewCart which might use the above functions
   const createNewCart = useCallback(async () => {
      if (!userId) return null;

      try {
         setSyncMessage('Đang tạo giỏ hàng mới...');

         const token = localStorage.getItem('token');
         if (!token) return null;

         const createResponse = await fetch(`${HOST}/api/cart`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
         });

         if (createResponse.ok) {
            const responseText = await createResponse.text();
            if (responseText && responseText.trim()) {
               try {
                  const newCart = JSON.parse(responseText);
                  console.log('New cart created after order:', newCart);
                  setApiCart(newCart);
                  setSyncMessage('Giỏ hàng mới đã được tạo');
                  setTimeout(() => setSyncMessage(''), 2000);
                  return newCart;
               } catch (jsonError) {
                  console.error('Error parsing create cart response:', jsonError);
               }
            }
         }
         return null;
      } catch (error) {
         console.error('Error creating new cart:', error);
         setSyncMessage('Lỗi khi tạo giỏ hàng mới');
         return null;
      }
   }, [userId, setSyncMessage, setApiCart]); // Chỉ tạo lại khi các dependency thay đổi

   // Load user data and cart on mount
   useEffect(() => {
      const loadCart = async () => {
         try {
            setLoading(true);

            // Check if user is logged in by looking for userId in localStorage
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
               setUserId(parseInt(storedUserId));

               // Check if order was just completed (flagged in localStorage)
               const orderJustCompleted = localStorage.getItem('orderCompleted') === 'true';
               if (orderJustCompleted) {
                  // Clear the flag
                  localStorage.removeItem('orderCompleted');
                  setOrderCompleted(true);

                  // Create new cart for the user and clear local cart
                  localStorage.setItem('cart', '[]');
                  setCartItems([]);
                  calculateTotals([]);

                  // Create a new cart in API
                  await createNewCart();
               }
            }

            // Get cart from localStorage
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(localCart);

            // Calculate totals
            calculateTotals(localCart);

            setLoading(false);
         } catch (err) {
            console.error('Error loading cart:', err);
            setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
            setLoading(false);
         }
      };

      loadCart();
   }, [createNewCart]); // Add createNewCart to the dependency array

   // Fetch product details for all cart items
   useEffect(() => {
      const fetchProductDetails = async () => {
         if (cartItems.length === 0) return;

         const detailIds = cartItems.map((item) => item.detailId);
         const uniqueDetailIds = [...new Set(detailIds)];

         const detailsMap: Record<number, ProductDetail> = {};

         for (const detailId of uniqueDetailIds) {
            if (typeof detailId === 'undefined') continue;
            try {
               // Fetch product detail info
               const response = await fetch(
                  `${HOST}/api/product-details/${detailId}`,
               );
               if (response.ok) {
                  const detail = await response.json();
                  detailsMap[detailId] = detail;
               }
            } catch (err) {
               console.error(`Error fetching details for product detail ${detailId}:`, err);
            }
         }

         setProductDetails(detailsMap);
      };

      fetchProductDetails();
   }, [cartItems]);

   // If user is logged in, fetch API cart and sync with local
   useEffect(() => {
      if (userId && !orderCompleted) {
         syncCartWithApi();
      }

      // Reset orderCompleted state sau khi đã xử lý
      if (orderCompleted) {
         setOrderCompleted(false);
      }
   }, [userId, cartItems.length, orderCompleted, syncCartWithApi]);

   // Fetch user cart
   const fetchUserCart = async (userId: number) => {
      try {
         const response = await fetch(`${HOST}/api/cart/user/${userId}`);

         if (response.ok) {
            const responseText = await response.text();
            if (responseText && responseText.trim()) {
               try {
                  const userCart = JSON.parse(responseText);
                  setApiCart(userCart);
                  return userCart;
               } catch (jsonError) {
                  console.error('Error parsing user cart:', jsonError);
                  return null;
               }
            }
         }
         return null;
      } catch (error) {
         console.error('Error fetching user cart:', error);
         return null;
      }
   };

   // Calculate totals
   const calculateTotals = (items: CartItem[]) => {
      const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const price = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      setTotalQuantity(quantity);
      setTotalPrice(price);
   };

   // Update quantity
   const updateQuantity = (index: number, newQuantity: number) => {
      if (newQuantity < 0) return;

      const updatedItems = [...cartItems];
      const oldQuantity = updatedItems[index].quantity;

      if (newQuantity === 0) {
         // If quantity becomes zero, remove from local cart
         removeItem(index);
         return;
      }

      updatedItems[index].quantity = newQuantity;
      setCartItems(updatedItems);

      // Update localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));

      // Recalculate totals
      calculateTotals(updatedItems);

      // Update badge - adjust by the difference in quantity
      const quantityDifference = newQuantity - oldQuantity;
      if (quantityDifference !== 0) {
         const currentBadge = localStorage.getItem('cartBadge');
         if (currentBadge) {
            const newBadgeCount = Math.max(0, parseInt(currentBadge) + quantityDifference);
            updateCartBadge(newBadgeCount);
         }
      }

      // If logged in, update API cart item
      updateApiCartItem(updatedItems[index]);
   };

   // Update API cart item
   const updateApiCartItem = async (item: CartItem) => {
      if (!userId || !apiCart) return;

      try {
         // Use the add-item endpoint with the updated quantity
         await fetch(
            `${HOST}/api/cart/${apiCart.id}/add-item/${item.detailId}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
               },
               body: JSON.stringify({
                  quantity: item.quantity,
               }),
            },
         );
      } catch (err) {
         console.error('Error updating API cart item:', err);
      }
   };

   // Remove item
   const removeItem = async (index: number) => {
      const itemToRemove = cartItems[index];
      const updatedItems = cartItems.filter((_, i) => i !== index);

      setCartItems(updatedItems);
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      calculateTotals(updatedItems);

      // Update badge when removing an item - subtract the quantity from badge
      updateCartBadge(totalQuantity - itemToRemove.quantity);

      // If logged in, remove from API cart by setting quantity to 0
      if (userId && apiCart) {
         try {
            await fetch(
               `${HOST}/api/cart/${apiCart.id}/add-item/${itemToRemove.detailId}`,
               {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                  },
                  body: JSON.stringify({
                     quantity: 0, // Setting quantity to 0 will remove the item
                  }),
               },
            );
         } catch (err) {
            console.error('Error removing item from API cart:', err);
         }
      }
   };

   // Handle checkout
   const handleCheckout = async () => {
      if (cartItems.length === 0) {
         alert('Giỏ hàng của bạn đang trống!');
         return;
      }

      // Check if any items are out of stock
      const outOfStockItems = cartItems.filter(item => {
         const productDetail = item.detailId ? productDetails[item.detailId] : undefined;
         return productDetail && productDetail.stock <= 0;
      });

      if (outOfStockItems.length > 0) {
         alert(`Một số sản phẩm trong giỏ hàng của bạn đã hết hàng. Vui lòng xóa các sản phẩm này trước khi tiếp tục.`);
         return;
      }

      // Check for both userId and token
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      console.log('Checkout initiated', { token: !!token, userId: storedUserId || 0 });

      // New behavior: Allow guest checkout with userId = 0
      if (!storedUserId || !token) {
         // Save cart to localStorage before redirecting
         localStorage.setItem('cart', JSON.stringify(cartItems));


         // Set a flag to indicate this is a guest checkout with userId = 0
         localStorage.setItem('isGuestCheckout', 'true');
         localStorage.setItem('guestUserId', '0'); // Explicitly store guest userId as 0

         // Redirect directly to checkout page
         router.push('/user/checkout');
         return;
      }

      // Existing flow for logged-in users
      // If no API cart but user is logged in, create one
      if (!apiCart && storedUserId) {
         try {
            setSyncMessage('Đang chuẩn bị đơn hàng...');

            // Create a new cart
            const createResponse = await fetch(`${HOST}/api/cart`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({ userId: parseInt(storedUserId) }),
            });

            if (createResponse.ok) {
               // Check for response content
               const responseText = await createResponse.text();
               let newCart;

               if (responseText && responseText.trim()) {
                  try {
                     newCart = JSON.parse(responseText);
                  } catch (e) {
                     console.error('Invalid JSON in create cart response:', e);
                  }
               }

               // If we couldn't parse the response, try fetching the cart instead
               if (!newCart) {
                  newCart = await fetchUserCart(parseInt(storedUserId));
               }

               if (newCart) {
                  // If we have local items, add them to the new cart
                  if (cartItems.length > 0 && newCart) {
                     await mergeCartsWithApi(newCart, cartItems);
                  }

                  // Proceed to checkout
                  router.push('/user/checkout');
                  return;
               }
            }

            // If we get here, something went wrong
            setSyncMessage('');
            alert('Không thể tạo giỏ hàng. Vui lòng thử lại sau.');
         } catch (error) {
            console.error('Error in checkout flow:', error);
            setSyncMessage('');
            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
         }
      } else {
         // We already have an API cart, proceed normally
         router.push('/user/checkout');
      }
   };


   if (loading) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />
            <div className='container mx-auto px-4 py-12 flex justify-center items-center'>
               <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
            </div>
            <Footer />
         </div>
      );
   }

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <Header />

         <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-medium mb-6'>Giỏ hàng của bạn</h1>

            {/* Notification when cart is newly created after order */}
            {orderCompleted && (
               <div className='mb-4 p-3 bg-green-50 text-green-700 rounded-md'>
                  Đơn hàng của bạn đã được đặt thành công. Chúng tôi đã tạo giỏ hàng mới cho bạn.
               </div>
            )}

            {/* Sync message */}
            {syncMessage && (
               <div className={`mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center ${syncing ? 'justify-between' : 'justify-center'
                  }`}
               >
                  <span>{syncMessage}</span>
                  {syncing && (
                     <div className='animate-spin h-5 w-5 border-2 border-blue-700 rounded-full border-t-transparent'></div>
                  )}
               </div>
            )}

            {/* Error message */}
            {error && <div className='mb-4 p-3 bg-red-50 text-red-700 rounded-md'>{error}</div>}

            {cartItems.length === 0 ? (
               <div className='bg-white rounded-lg shadow p-8 text-center'>
                  <div className='flex flex-col items-center justify-center'>
                     <div className='text-gray-500 mb-4'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-24 w-24 mx-auto'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                           strokeWidth={2}
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                           />
                        </svg>
                     </div>
                     <h2 className='text-xl font-medium mb-2'>Giỏ hàng của bạn đang trống</h2>
                     <p className='text-gray-500 mb-6'>
                        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                     </p>
                     <Link
                        href='/user/products'
                        className='px-6 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 transition'
                     >
                        Khám phá sản phẩm
                     </Link>
                  </div>
               </div>
            ) : (
               <div className='flex flex-col lg:flex-row gap-6'>
                  {/* Cart Items */}
                  <div className='lg:w-3/4'>
                     <div className='bg-white rounded-lg shadow overflow-hidden'>
                        {/* Header */}
                        <div className='p-4 border-b border-gray-200 hidden md:grid md:grid-cols-12 text-gray-500 font-medium'>
                           <div className='md:col-span-6'>Sản phẩm</div>
                           <div className='md:col-span-2 text-center'>Đơn giá</div>
                           <div className='md:col-span-2 text-center'>Số lượng</div>
                           <div className='md:col-span-2 text-center'>Thành tiền</div>
                        </div>

                        {/* Items */}
                        <div className='divide-y divide-gray-100'>
                           {cartItems.map((item, index) => {
                              // Check if we have stock information for this item
                              const productDetail = item.detailId ? productDetails[item.detailId] : undefined;
                              const isOutOfStock = productDetail && productDetail.stock <= 0;

                              return (
                                 <div
                                    key={`${item.id}-${item.detailId || index}`}
                                    className='p-4 hover:bg-gray-50'
                                 >
                                    <div className='md:grid md:grid-cols-12 gap-4'>
                                       {/* Product info */}
                                       <div className='md:col-span-6 flex mb-4 md:mb-0'>
                                          <div className='relative w-20 h-20 bg-gray-100 rounded'>
                                             <Image
                                                src={item.image || '/images/placeholder.jpg'}
                                                alt={item.name}
                                                layout='fill'
                                                objectFit='contain'
                                                className='p-2'
                                             />
                                          </div>
                                          <div className='ml-4 flex-1'>
                                             <Link
                                                href={item.isGift ? `/user/gifts/${item.id}` : `/user/products/${item.id}`}
                                                className='text-gray-800 font-medium hover:text-orange-700'
                                             >
                                                {item.isGift ? `🎁 ${item.name}` : item.name}
                                             </Link>

                                             {/* Hiển thị thông tin cho sản phẩm thường */}
                                             {!item.isGift && item.options && (
                                                <div className='text-sm text-gray-500 mt-1'>
                                                   {/* Extract size from options */}
                                                   {item.options.find((opt) => opt.name === 'Kích thước') && (
                                                      <div className='flex items-center'>
                                                         <span className='text-gray-500'>
                                                            Kích thước:
                                                         </span>
                                                         <span className='text-gray-700 ml-1'>
                                                            {
                                                               item.options.find(
                                                                  (opt) => opt.name === 'Kích thước',
                                                               )?.value
                                                            }
                                                         </span>
                                                      </div>
                                                   )}

                                                   {/* Extract fragrance/value from options */}
                                                   {item.type && (
                                                      <div className='flex items-center'>
                                                         <span className='text-gray-500'>
                                                            {item.type}:
                                                         </span>
                                                         <span className='text-gray-700 ml-1'>
                                                            {
                                                               item.options.find(
                                                                  (opt) =>
                                                                     opt.name === item.type ||
                                                                     opt.name === 'Giá trị' ||
                                                                     opt.name === 'Chất liệu' ||
                                                                     opt.name === 'Mùi hương',
                                                               )?.value || item.value || ''
                                                            }
                                                         </span>
                                                      </div>
                                                   )}
                                                </div>
                                             )}

                                             {/* Hiển thị thông tin cho gift */}
                                             {item.isGift && item.productDetails && (
                                                <div className='mt-2'>
                                                   <div className='text-xs text-gray-500 font-medium mb-1'>
                                                      Bao gồm {item.productDetails.length} sản phẩm:
                                                   </div>
                                                   <div className='text-xs text-gray-500 max-h-20 overflow-y-auto pl-2 border-l-2 border-amber-200'>
                                                      {item.productDetails.slice(0, 3).map((product, idx) => (
                                                         <div key={`gift-product-${product.id}-${idx}`} className='mb-1'>
                                                            • {product.name}
                                                            {product.size ? ` (${product.size})` : ''}
                                                            {product.type ? ` - ${product.type}: ${product.value || ''}` : ''}
                                                         </div>
                                                      ))}
                                                      {item.productDetails.length > 3 && (
                                                         <div className='text-amber-600 hover:underline cursor-pointer'>
                                                            + {item.productDetails.length - 3} sản phẩm khác
                                                         </div>
                                                      )}
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       {/* Phần giá và số lượng giữ nguyên */}
                                       <div className='md:col-span-2 flex items-center justify-between md:justify-center mb-2 md:mb-0'>
                                          <span className='md:hidden text-gray-500'>Đơn giá:</span>
                                          <span className='font-medium'>
                                             {formatPrice(item.price)}
                                          </span>
                                       </div>

                                       <div className='md:col-span-2 flex items-center justify-between md:justify-center mb-2 md:mb-0'>
                                          <div className='flex border border-gray-300 rounded'>
                                             <button
                                                className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                             >
                                                -
                                             </button>
                                             <input
                                                min={1}
                                                className='w-14 text-center border-x border-gray-300 outline-none'
                                                value={item.quantity}
                                                onChange={e => {
                                                   const val = parseInt(e.target.value, 10);
                                                   if (!isNaN(val) && val > 0) {
                                                      updateQuantity(index, val);
                                                   }
                                                }}
                                             />
                                             <button
                                                className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                             >
                                                +
                                             </button>
                                          </div>
                                       </div>

                                       <div className='md:col-span-2 flex items-center justify-between md:justify-center'>
                                          <span className='md:hidden text-gray-500'>Thành tiền:</span>
                                          <span className='text-red-600 font-medium'>
                                             {formatPrice(item.price * item.quantity)}
                                          </span>
                                       </div>
                                    </div>

                                    {/* Add stock warning if applicable */}
                                    {isOutOfStock && (
                                       <div className="mt-2 text-red-600 text-sm">
                                          Sản phẩm này hiện đã hết hàng
                                       </div>
                                    )}

                                    {/* Actions */}
                                    <div className='flex justify-end mt-3'>
                                       <button
                                          className='text-gray-500 hover:text-red-600 text-sm flex items-center'
                                          onClick={() => removeItem(index)}
                                       >
                                          <svg
                                             className='w-4 h-4 mr-1'
                                             fill='none'
                                             stroke='currentColor'
                                             viewBox='0 0 24 24'
                                             xmlns='http://www.w3.org/2000/svg'
                                          >
                                             <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth='2'
                                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                             ></path>
                                          </svg>
                                          Xóa
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Order Summary */}
                  <div className='lg:w-1/4'>
                     <div className='bg-white rounded-lg shadow p-5'>
                        <h2 className='text-lg font-medium mb-4'>Thông tin đơn hàng</h2>

                        <div className='space-y-3 mb-4'>
                           <div className='flex justify-between'>
                              <span className='text-gray-600'>
                                 Tạm tính ({totalQuantity} sản phẩm)
                              </span>
                              <span>{formatPrice(totalPrice)}</span>
                           </div>
                        </div>

                        <div className='border-t border-gray-200 pt-3 mb-5'>
                           <div className='flex justify-between items-center'>
                              <span className='font-medium'>Tổng cộng</span>
                              <span className='text-xl font-medium text-red-600'>
                                 {formatPrice(totalPrice)}
                              </span>
                           </div>
                        </div>

                        <button
                           className={`w-full py-3 ${syncing
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-orange-700 hover:bg-orange-800'
                              } text-white rounded transition`}
                           onClick={handleCheckout}
                           disabled={syncing}
                        >
                           {syncing ? 'Đang xử lý...' : userId ? 'Tiến hành đặt hàng' : 'Đặt hàng không cần đăng nhập'}
                        </button>

                        {!userId && (
                           <div className="mt-3 text-center text-sm text-gray-600">
                              <p>Hoặc</p>
                              <Link href='/user/signin?redirect=/user/cart' className="text-orange-700 hover:underline font-medium">
                                 Đăng nhập để đặt hàng
                              </Link>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>

         <Footer />
      </div>
   );
}
