'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useCart } from '@/app/contexts/CartContext';
import { HOST } from '@/app/constants/api';

// Loading component
const NavBarLoading = () => (
   <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
      <div className='animate-pulse h-12 w-48 bg-gray-200 rounded'></div>
      <div className='flex space-x-4'>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
      </div>
   </div>
);

// Interfaces definitions
interface DecodedToken {
   name: string;
   exp: number;
   id?: number;
   [key: string]: string | number | undefined;
}

interface CartItem {
   productDetailId: number;
   quantity: number;
   name?: string;
   price?: number;
   image?: string;
}

interface Cart {
   items: CartItem[];
   total?: number;
   userId?: number;
}

interface Category {
   id: number;
   name: string;
   description: string;
}

// Create a client component that uses searchParams
function SearchParamsHandler({ onUpdate }: { onUpdate: (productDetailId: number | null) => void }) {
   const searchParams = useSearchParams();

   useEffect(() => {
      const pdIdParam = searchParams.get('productDetailId');
      if (pdIdParam) {
         const pdId = parseInt(pdIdParam);
         onUpdate(isNaN(pdId) ? null : pdId);
      } else {
         onUpdate(null);
      }
   }, [searchParams, onUpdate]);

   return null;
}

// Main NavBar component
function NavBarContent() {
   const { localCartBadge, setLocalCartBadge, updateCartBadge } = useCart();

   const [showSearchInput, setShowSearchInput] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [userName, setUserName] = useState<string | null>(null);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [cartItemCount, setCartItemCount] = useState(0);
   const [productDetailCounts, setProductDetailCounts] = useState<{ [key: number]: number }>({});
   const [currentProductDetailId, setCurrentProductDetailId] = useState<number | null>(null);
   const [categories, setCategories] = useState<Category[]>([]);

   const router = useRouter();
   const pathname = usePathname();

   // Handle update from SearchParamsHandler
   const handleSearchParamsUpdate = useCallback((productDetailId: number | null) => {
      setCurrentProductDetailId(productDetailId);
   }, []);

   // Your existing functions
   const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
   };

   const toggleUserMenu = () => {
      setShowUserMenu(!showUserMenu);
   };

   const handleLogout = useCallback(() => {
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('cartBadge'); // Clear badge on logout

      setIsLoggedIn(false);
      setUserName(null);
      setUserId(null);
      setShowUserMenu(false);
      updateCartBadge(0); // Use context method to reset badge

      router.push('/user/home');
   }, [router, updateCartBadge]); // Add updateCartBadge to dependencies


   const checkAuthStatus = useCallback(() => {
      const token = localStorage.getItem('token');

      if (token) {
         try {
            const decoded = jwtDecode<DecodedToken>(token);

            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
               handleLogout();
               return;
            }

            setIsLoggedIn(true);
            setUserName(decoded.name || 'User');

            if (decoded.id) {
               setUserId(decoded.id);
               localStorage.setItem('userId', decoded.id.toString());
            }
         } catch (error) {
            console.error('Invalid token:', error);
            handleLogout();
         }
      } else {
         setIsLoggedIn(false);
         setUserName(null);
         setUserId(null);

         if (pathname === '/user/profile' || pathname.startsWith('/user/orders')) {
            router.push('/user/signin');
         }
      }
   }, [pathname, router, handleLogout]);

   useEffect(() => {
      checkAuthStatus();
   }, [checkAuthStatus]);

   const fetchCartItemCount = useCallback(async () => {
      if (!userId) return;

      try {
         const response = await fetch(`${HOST}/api/cart/user/${userId}`);

         if (response.ok) {
            const cartData = (await response.json()) as Cart;
            if (cartData && cartData.items) {
               const count = cartData.items.reduce(
                  (total: number, item: CartItem) => total + (item.quantity || 0),
                  0,
               );
               setCartItemCount(count);

               // Use updateCartBadge from context which also updates localStorage
               if (count > 0) {
                  updateCartBadge(count);
               }

               const detailCounts: { [key: number]: number } = {};
               cartData.items.forEach((item: CartItem) => {
                  if (item.productDetailId) {
                     detailCounts[item.productDetailId] = item.quantity || 0;
                  }
               });
               setProductDetailCounts(detailCounts);
            }
         }
      } catch (error) {
         console.error('Error fetching cart count:', error);
      }
   }, [userId, updateCartBadge]); // Add updateCartBadge to dependencies

   useEffect(() => {
      if (isLoggedIn && userId) {
         fetchCartItemCount();
      } else {
         setCartItemCount(0);
         setProductDetailCounts({});
      }
   }, [isLoggedIn, userId, pathname, fetchCartItemCount]);

   useEffect(() => {
      if (cartItemCount > 0) {
         localStorage.setItem('cartBadge', cartItemCount.toString());
      }
   }, [cartItemCount]);

   // Remove or modify this useEffect if you're managing the badge through context
   // You can either remove it completely or keep it for double-safety
   useEffect(() => {
      if (cartItemCount > 0) {
         updateCartBadge(cartItemCount);
      }
   }, [cartItemCount, updateCartBadge]);

   const getProductDetailCount = (productDetailId: number | null): number => {
      if (!productDetailId) return 0;
      return productDetailCounts[productDetailId] || 0;
   };

   const handleUserIconClick = (e: React.MouseEvent) => {
      e.preventDefault();

      if (isLoggedIn) {
         if (window.innerWidth >= 1024) {
            toggleUserMenu();
         } else {
            router.push('/user/profile');
            setMobileMenuOpen(false);
         }
      } else {
         router.push('/user/signin');
         setMobileMenuOpen(false);
      }
   };

   const handleCartClick = async (e: React.MouseEvent) => {
      e.preventDefault();

      if (isLoggedIn && userId) {
         try {
            const response = await fetch(`${HOST}/api/cart/user/${userId}`);

            if (!response.ok) {
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
                  console.log('New cart created successfully');
               } else {
                  console.error('Failed to create cart:', await createCartResponse.text());
               }
            } else {
               console.log('User cart found');
            }

            router.push('/user/cart');
         } catch (error) {
            console.error('Error handling cart:', error);
            router.push('/user/cart');
         }
      } else {
         router.push('/user/signin?redirect=/user/cart');
      }
   };

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();

      if (searchQuery.trim()) {
         router.push(`/user/products?search=${encodeURIComponent(searchQuery.trim())}`);

         if (window.innerWidth < 1024) {
            setShowSearchInput(false);
         }

         if (mobileMenuOpen) {
            setMobileMenuOpen(false);
         }
      }
   };

   const fetchCategories = useCallback(async () => {
      try {
         setCategories([]); // Reset categories before fetching

         console.log('Fetching categories...');
         const response = await fetch(`${HOST}/api/categories`);

         console.log('Categories API response status:', response.status);

         let categoriesData;

         if (response.status === 302) {
            // Xử lý trường hợp API trả về status 302 nhưng vẫn có dữ liệu
            const responseText = await response.text();
            console.log('Received 302 response with text:', responseText);

            try {
               // Thử parse responseText trực tiếp thành JSON
               categoriesData = JSON.parse(responseText);
               console.log('Successfully parsed categories from 302 response:', categoriesData);
            } catch (parseError) {
               console.error('Failed to parse categories from 302 response:', parseError);

               // Trích xuất JSON array từ text nếu có chứa dấu [] 
               if (responseText.includes('[') && responseText.includes(']')) {
                  const jsonStart = responseText.indexOf('[');
                  const jsonEnd = responseText.lastIndexOf(']') + 1;
                  const jsonString = responseText.substring(jsonStart, jsonEnd);

                  try {
                     categoriesData = JSON.parse(jsonString);
                     console.log('Extracted categories from 302 response text:', categoriesData);
                  } catch (nestedError) {
                     console.error('Failed to extract categories from 302 response text:', nestedError);
                     throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
                  }
               } else {
                  throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
               }
            }
         } else if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);

            // Trích xuất JSON array từ error response
            if (errorText.includes('[') && errorText.includes(']')) {
               const jsonStart = errorText.indexOf('[');
               const jsonEnd = errorText.lastIndexOf(']') + 1;
               const jsonString = errorText.substring(jsonStart, jsonEnd);

               try {
                  categoriesData = JSON.parse(jsonString);
                  console.log('Extracted categories from error response:', categoriesData);
               } catch (parseError) {
                  console.error('Failed to extract categories from error response:', parseError);
                  throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
               }
            } else {
               throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
            }
         } else {
            // Trường hợp thông thường: API trả về status success
            categoriesData = await response.json();
            console.log('Categories loaded successfully:', categoriesData);
         }

         if (Array.isArray(categoriesData)) {
            console.log('Setting categories:', categoriesData);
            setCategories(categoriesData);
         } else {
            console.error('Categories data is not an array:', categoriesData);
            setCategories([]);
         }
      } catch (error) {
         console.error('Error fetching categories:', error);

         // Trích xuất dữ liệu danh mục từ thông báo lỗi nếu có chứa JSON
         const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';

         if (errorMessage.includes('[{') && errorMessage.includes('"}]')) {
            try {
               // Trích xuất JSON từ thông báo lỗi
               const jsonStart = errorMessage.indexOf('[');
               const jsonEnd = errorMessage.lastIndexOf(']') + 1;
               const jsonString = errorMessage.substring(jsonStart, jsonEnd);

               const extractedData = JSON.parse(jsonString);
               console.log('Successfully extracted categories from error message:', extractedData);

               if (Array.isArray(extractedData)) {
                  setCategories(extractedData);
                  return; // Thoát sớm vì đã xử lý thành công dữ liệu
               }
            } catch (parseError) {
               console.error('Failed to parse categories from error message:', parseError);
            }
         }

         // Nếu không thể trích xuất được dữ liệu từ lỗi, gán mảng rỗng
         setCategories([]);
      }
   }, []);

   useEffect(() => {
      fetchCategories();
   }, [fetchCategories]);

   useEffect(() => {
      // Listen for badge updates from anywhere in the application
      const handleBadgeUpdate = (event: CustomEvent) => {
         const { count } = event.detail;
         // Update your state with the new count
         setLocalCartBadge(count);
      };

      // Add event listener with proper type casting
      window.addEventListener('cartBadgeUpdated', handleBadgeUpdate as EventListener);

      // Load initial badge from localStorage
      const savedBadge = localStorage.getItem('cartBadge');
      if (savedBadge) {
         setLocalCartBadge(parseInt(savedBadge));
      }

      // Cleanup event listener
      return () => {
         window.removeEventListener('cartBadgeUpdated', handleBadgeUpdate as EventListener);
      };
   }, []);

   return (
      <>
         {/* This is where we'll use the Suspense component to handle searchParams */}
         <Suspense fallback={null}>
            <SearchParamsHandler onUpdate={handleSearchParamsUpdate} />
         </Suspense>

         {/* Rest of your original JSX remains the same */}
         <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
            <div className='flex items-center'>
               <Link href='/user/home'>
                  <div className='cursor-pointer'>
                     <Image
                        src={'/images/logoCoChu.png'}
                        alt='Candle Bliss Logo'
                        height={62}
                        width={253}
                        className='cursor-pointer w-auto h-10 md:h-12 lg:h-auto'
                     />
                  </div>
               </Link>
            </div>

            <div className='flex items-center space-x-4 md:space-x-6 lg:hidden'>
               <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className='text-[#553C26]'
               >
                  <MagnifyingGlassIcon className='size-5' />
               </button>
               <button onClick={handleCartClick} className='text-[#553C26] relative'>
                  <ShoppingBagIcon className='size-5' />
                  {isLoggedIn && (
                     // Đơn giản hóa điều kiện hiển thị, ưu tiên hiển thị badge sản phẩm chi tiết, nếu không có thì hiển thị badge tổng
                     <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                        {currentProductDetailId && getProductDetailCount(currentProductDetailId) > 0
                           ? getProductDetailCount(currentProductDetailId)
                           : localCartBadge > 0 ? localCartBadge : cartItemCount > 0 ? cartItemCount : null}
                     </span>
                  )}
               </button>
               <button onClick={toggleMobileMenu} className='text-[#553C26]'>
                  {mobileMenuOpen ? (
                     <XMarkIcon className='size-6' />
                  ) : (
                     <Bars3Icon className='size-6' />
                  )}
               </button>
            </div>

            <nav className='hidden lg:flex space-x-5 xl:space-x-10 text-[#553C26] items-center'>
               <Link href='/user/home'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Trang Chủ
                  </button>
               </Link>
               <div className='relative group'>
                  <Link href='/user/products'>
                     <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                        Sản Phẩm
                     </button>
                  </Link>
                  <div className='absolute hidden group-hover:block bg-[#F1EEE9] shadow-lg rounded-lg w-36 font-semibold z-50'>
                     {categories.map((category, index) => (
                        <React.Fragment key={category.id}>
                           <Link
                              href={`/user/products/category/${category.id}`}
                              className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                           >
                              {category.name}
                           </Link>
                           {index < categories.length - 1 && <hr className='border-[#553C26]' />}
                        </React.Fragment>
                     ))}
                     <hr className='border-[#553C26]' />
                  </div>
               </div>
               <Link href='/user/products/vouchers'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Mã Giảm Giá
                  </button>
               </Link>
               <Link href='/user/aboutshop'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Về Chúng Tôi
                  </button>
               </Link>
               <Link href='https://www.facebook.com/' target='_blank'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Liên Hệ
                  </button>
               </Link>
               <div className='relative items-center flex'>
                  {showSearchInput && (
                     <form onSubmit={handleSearch} className='flex items-center'>
                        <input
                           type='text'
                           className='p-2 border border-[#553C26] rounded-lg'
                           placeholder='Nhấn Enter để tìm kiếm...'
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type='submit' className='ml-2 text-[#553C26]'>
                           <MagnifyingGlassIcon className='size-5' />
                        </button>
                     </form>
                  )}
                  {!showSearchInput && (
                     <button
                        onClick={() => setShowSearchInput(true)}
                        className='ml-2 text-[#553C26]'
                     >
                        <MagnifyingGlassIcon className='size-5' />
                     </button>
                  )}
               </div>
               <button onClick={handleCartClick} className='text-[#553C26] relative'>
                  <ShoppingBagIcon className='size-5' />
                  {isLoggedIn && (
                     // Đơn giản hóa điều kiện hiển thị, ưu tiên hiển thị badge sản phẩm chi tiết, nếu không có thì hiển thị badge tổng
                     <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                        {currentProductDetailId && getProductDetailCount(currentProductDetailId) > 0
                           ? getProductDetailCount(currentProductDetailId)
                           : localCartBadge > 0 ? localCartBadge : cartItemCount > 0 ? cartItemCount : null}
                     </span>
                  )}
               </button>

               <div className='relative'>
                  <button
                     onClick={handleUserIconClick}
                     className={`text-[#553C26] p-2 rounded-full ${isLoggedIn ? 'bg-amber-100' : ''
                        }`}
                  >
                     <UserIcon className='size-5' />
                  </button>

                  {isLoggedIn && showUserMenu && (
                     <div className='absolute top-full right-0 mt-1 bg-[#F1EEE9] rounded-md shadow-lg w-48 py-2 z-50'>
                        <Link href='/user/profile'>
                           <div className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8] border-b border-amber-200'>
                              Hồ sơ cá nhân
                           </div>
                        </Link>
                        <Link href='/user/profile/resetpassword'>
                           <div className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'>
                              Thay đổi mật khâu
                           </div>
                        </Link>
                        <button
                           onClick={handleLogout}
                           className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-amber-200 mt-1'
                        >
                           Đăng xuất
                        </button>
                     </div>
                  )}

                  {isLoggedIn && !showUserMenu && (
                     <div className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full'></div>
                  )}
               </div>
            </nav>
         </div>

         {mobileMenuOpen && (
            <div className='lg:hidden bg-[#F1EEE9] py-4 px-4 sm:px-6 md:px-12 shadow-md'>
               {showSearchInput && (
                  <form onSubmit={handleSearch} className='mb-4 flex items-center'>
                     <input
                        type='text'
                        className='w-full p-2 border border-[#553C26] rounded-lg'
                        placeholder='Tìm kiếm...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <button
                        type='submit'
                        className='ml-2 p-2 bg-amber-100 rounded-lg text-[#553C26]'
                     >
                        <MagnifyingGlassIcon className='size-5' />
                     </button>
                  </form>
               )}
               <nav className='flex flex-col space-y-4'>
                  <Link href='/user/home' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Trang Chủ
                     </span>
                  </Link>
                  <div className='relative'>
                     <Link href='/user/product' onClick={toggleMobileMenu}>
                        <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                           Sản Phẩm
                        </span>
                     </Link>
                     <div className='ml-4 mt-2 space-y-2'>
                        {categories.map((category) => (
                           <Link
                              key={category.id}
                              href={`/user/products/category/${category.id}`}
                              onClick={toggleMobileMenu}
                           >
                              <span className='block text-[#553C26] hover:text-[#FF9900]'>
                                 {category.name}
                              </span>
                           </Link>
                        ))}
                        <Link href='/products/accessories' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Quà Tặng
                           </span>
                        </Link>
                     </div>
                  </div>
                  <Link href='/about' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Về Chúng Tôi
                     </span>
                  </Link>
                  <Link href='https://www.facebook.com/' target='_blank' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Liên Hệ
                     </span>
                  </Link>

                  <div className='pt-3 mt-2 border-t border-amber-200'>
                     {!isLoggedIn ? (
                        <>
                           <Link href='/user/signin' onClick={toggleMobileMenu}>
                              <div className='block py-2 px-4 text-[#553C26] text-lg font-bold bg-amber-100 hover:bg-amber-200 rounded-md mb-2'>
                                 Đăng Nhập
                              </div>
                           </Link>
                           <Link href='/user/signup' onClick={toggleMobileMenu}>
                              <div className='block py-2 px-4 text-amber-600 text-lg border border-amber-400 rounded-md hover:bg-amber-50 text-center'>
                                 Đăng Ký
                              </div>
                           </Link>
                        </>
                     ) : (
                        <>
                           <div className='py-2 px-4 bg-amber-50 rounded-md mb-3'>
                              <p className='text-amber-800 text-sm'>Xin chào,</p>
                              <p className='font-bold text-[#553C26]'>{userName}</p>
                           </div>

                           <Link href='/user/profile' onClick={toggleMobileMenu}>
                              <div className='flex items-center py-2 text-[#553C26] hover:text-amber-700'>
                                 <UserIcon className='size-5 mr-2' />
                                 <span>Hồ Sơ Cá Nhân</span>
                              </div>
                           </Link>

                           <Link href='/user/orders' onClick={toggleMobileMenu}>
                              <div className='flex items-center py-2 text-[#553C26] hover:text-amber-700'>
                                 <ShoppingBagIcon className='size-5 mr-2' />
                                 <span>Đơn Hàng Của Tôi</span>
                              </div>
                           </Link>

                           <button
                              onClick={() => {
                                 handleLogout();
                                 toggleMobileMenu();
                              }}
                              className='flex items-center w-full py-2 text-red-600 hover:text-red-700 mt-3'
                           >
                              <XMarkIcon className='size-5 mr-2' />
                              <span>Đăng Xuất</span>
                           </button>
                        </>
                     )}
                  </div>
               </nav>
            </div>
         )}
      </>
   );
}

// Export wrapper with Suspense
export default function NavBar() {
   return (
      <Suspense fallback={<NavBarLoading />}>
         <NavBarContent />
      </Suspense>
   );
}
