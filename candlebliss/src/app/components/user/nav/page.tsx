'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

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

   const router = useRouter();
   const pathname = usePathname();

   // Rest of your component code
   // ...

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

      setIsLoggedIn(false);
      setUserName(null);
      setUserId(null);
      setShowUserMenu(false);

      router.push('/user/home');
   }, [router]);

   // Rest of your functions and useEffects
   // ...

   // Keep all your original code, just replacing the searchParams usage
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
         const response = await fetch(`http://68.183.226.198:3000/api/cart/user/${userId}`);

         if (response.ok) {
            const cartData = (await response.json()) as Cart;
            if (cartData && cartData.items) {
               const count = cartData.items.reduce(
                  (total: number, item: CartItem) => total + (item.quantity || 0),
                  0,
               );
               setCartItemCount(count);

               const detailCounts: { [key: number]: number } = {};
               cartData.items.forEach((item: CartItem) => {
                  if (item.productDetailId) {
                     detailCounts[item.productDetailId] = item.quantity || 0;
                  }
               });
               setProductDetailCounts(detailCounts);
            } else {
               setCartItemCount(0);
               setProductDetailCounts({});
            }
         } else {
            setCartItemCount(0);
            setProductDetailCounts({});
         }
      } catch (error) {
         console.error('Error fetching cart count:', error);
         setCartItemCount(0);
         setProductDetailCounts({});
      }
   }, [userId]);

   useEffect(() => {
      if (isLoggedIn && userId) {
         fetchCartItemCount();
      } else {
         setCartItemCount(0);
         setProductDetailCounts({});
      }
   }, [isLoggedIn, userId, pathname, fetchCartItemCount]);

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
            const response = await fetch(`http://68.183.226.198:3000/api/cart/user/${userId}`);

            if (!response.ok) {
               console.log('Creating new cart for user:', userId);

               const createCartResponse = await fetch('http://68.183.226.198:3000/api/cart', {
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
                  {isLoggedIn &&
                     (currentProductDetailId
                        ? getProductDetailCount(currentProductDetailId) > 0 && (
                             <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                {getProductDetailCount(currentProductDetailId)}
                             </span>
                          )
                        : cartItemCount > 0 && (
                             <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                {cartItemCount}
                             </span>
                          ))}
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
                     <Link
                        href='/user/products/candles'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Nến Thơm
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/user/products/scents'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Tinh Dầu
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/user/products/accessories'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Phụ Kiện Nến
                     </Link>
                     <hr className='border-[#553C26]' />
                     <Link
                        href='/products/accessories'
                        className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                     >
                        Quà Tặng
                     </Link>
                  </div>
               </div>
               <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                  Về Chúng Tôi
               </button>
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
                  {isLoggedIn &&
                     (currentProductDetailId
                        ? getProductDetailCount(currentProductDetailId) > 0 && (
                             <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                {getProductDetailCount(currentProductDetailId)}
                             </span>
                          )
                        : cartItemCount > 0 && (
                             <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                                {cartItemCount}
                             </span>
                          ))}
               </button>

               <div className='relative'>
                  <button
                     onClick={handleUserIconClick}
                     className={`text-[#553C26] p-2 rounded-full ${
                        isLoggedIn ? 'bg-amber-100' : ''
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
                        <Link href='/user/products/candles' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Nến Thơm
                           </span>
                        </Link>
                        <Link href='/products/holders' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Tinh Dầu
                           </span>
                        </Link>
                        <Link href='/products/scents' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Phụ Kiện Nến
                           </span>
                        </Link>
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
