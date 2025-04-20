'use client';

import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

// Define an interface for user data
interface UserData {
   firstName: string;
   lastName: string;
   photo?: {
      data?: string;
   };
   // Add other properties you might use
}

export default function Header() {
   const [showDropdown, setShowDropdown] = useState(false);
   const [currentDateTime, setCurrentDateTime] = useState(new Date());
   const [isMounted, setIsMounted] = useState(false);
   const [userData, setUserData] = useState<UserData | null>(null);
   const [avatarUrl, setAvatarUrl] = useState<string>('/images/logo.png');
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      setIsMounted(true);

      // Load user data and avatar
      const loadUserData = async () => {
         try {
            setIsLoading(true);

            // Get user data from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
               const parsedUser = JSON.parse(storedUser);
               setUserData(parsedUser);

               // If user has photo with base64 data, use it directly
               if (parsedUser.photo && parsedUser.photo.data) {
                  setAvatarUrl(parsedUser.photo.data);
               }
            } else {
               // Fetch from API if not in localStorage
               const token = localStorage.getItem('token');
               if (token) {
                  const response = await fetch('/api/v1/auth/me', {
                     headers: {
                        Authorization: `Bearer ${token}`,
                     },
                  });

                  if (response.ok) {
                     const user = await response.json();
                     setUserData(user);

                     // Update avatar if available
                     if (user.photo && user.photo.data) {
                        setAvatarUrl(user.photo.data);
                     }

                     // Save to localStorage for future use
                     localStorage.setItem('user', JSON.stringify(user));
                  }
               }
            }
         } catch (error) {
            console.error('Error loading user data:', error);
         } finally {
            setIsLoading(false);
         }
      };

      loadUserData();

      const timer = setInterval(() => {
         setCurrentDateTime(new Date());
      }, 1000);

      // Clean up the interval on component unmount
      return () => clearInterval(timer);
   }, []);

   // Format the date and time for display - simplified to avoid locale issues
   const formatDate = () => {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const day = days[currentDateTime.getDay()];
      const date = currentDateTime.getDate();
      const month = currentDateTime.getMonth() + 1; 
      const year = currentDateTime.getFullYear();

      return `${day}, ${date} ${month} ${year}`;
   };

   const formatTime = () => {
      const hours = currentDateTime.getHours().toString().padStart(2, '0');
      const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
      const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
   };

   return (
      <>
         {/* Header */}
         <header className='bg-gradient-to-r from-[#F1EEE9] to-[#442C08] shadow'>
            <div className='flex justify-between items-center p-4'>
               {/* Today section with calendar icon */}
               <div className='flex items-center bg-amber-50 rounded-lg px-4 py-2'>
                  <div className='flex items-center mr-4'>
                     <Calendar size={18} className='text-amber-800' />
                     <span className='ml-2 text-amber-800 text-sm'>Hôm nay,</span>
                  </div>
                  <div className='text-lg font-semibold text-amber-800'>{formatDate()}</div>
               </div>

               {/* Right side of header */}
               <div className='flex items-center'>

                  {/* User dropdown with avatar */}
                  <div className='relative'>
                     <button
                        className='flex items-center bg-white rounded-lg p-1 shadow-sm'
                        onClick={() => setShowDropdown(!showDropdown)}
                     >
                        <div className='relative w-10 h-10'>
                           {isLoading ? (
                              <div className='w-10 h-10 rounded-full flex items-center justify-center bg-gray-100'>
                                 <FaSpinner className='animate-spin text-amber-600' size={16} />
                              </div>
                           ) : (
                              <Image
                                 src={avatarUrl}
                                 alt='Avatar'
                                 width={40}
                                 height={40}
                                 className='rounded-full object-cover'
                                 onError={() => setAvatarUrl('/images/logo.png')}
                              />
                           )}
                        </div>
                        <div className='ml-2 mr-1'>
                           <div className='text-sm font-medium text-gray-700'>
                              {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
                           </div>
                           <div className='text-xs text-gray-500'>
                              {isMounted ? formatTime() : ''}
                           </div>
                        </div>
                     </button>

                     {showDropdown && (
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10'>
                           <div className='py-1'>
                              <a
                                 href='/user/profile'
                                 className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                 Trang cá nhân
                              </a>
                              <a
                                 href='#'
                                 className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                 Cài đặt
                              </a>
                              <a
                                 href='/'
                                 target='_blank'
                                 rel='noopener noreferrer'
                                 className='block px-4 py-2 text-sm text-emerald-600 hover:bg-gray-100'
                              >
                                 Xem cửa hàng
                              </a>
                              <hr className='my-1' />
                              <a
                                 href='#'
                                 onClick={(e) => {
                                    e.preventDefault();
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    window.location.href = '/seller/signin';
                                 }}
                                 className='block px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                              >
                                 Đăng xuất
                              </a>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </header>
      </>
   );
}
