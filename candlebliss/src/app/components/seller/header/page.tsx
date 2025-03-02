'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, Search, Bell } from 'lucide-react';

export default function Header() {
   const [showDropdown, setShowDropdown] = useState(false);
   const [currentDateTime, setCurrentDateTime] = useState(new Date());
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);

      const timer = setInterval(() => {
         setCurrentDateTime(new Date());
      }, 1000);

      // Clean up the interval on component unmount
      return () => clearInterval(timer);
   }, []);

   // Format the date and time for display - simplified to avoid locale issues
   const formatDate = () => {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const months = [
         'Tháng 1',
         'Tháng 2',
         'Tháng 3',
         'Tháng 4',
         'Tháng 5',
         'Tháng 6',
         'Tháng 7',
         'Tháng 8',
         'Tháng 9',
         'Tháng 10',
         'Tháng 11',
         'Tháng 12',
      ];

      const day = days[currentDateTime.getDay()];
      const date = currentDateTime.getDate();
      const month = months[currentDateTime.getMonth()];
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
                  {/* Search */}
                  <div className='mr-4 relative'>
                     <input
                        type='text'
                        placeholder='Search...'
                        className='pl-8 pr-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:border-amber-500'
                     />
                     <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
                        <Search size={16} className='text-gray-400' />
                     </div>
                  </div>

                  {/* Notifications */}
                  <div className='mr-4 relative'>
                     <Bell size={20} className='text-gray-600' />
                     <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                        3
                     </span>
                  </div>

                  {/* User dropdown */}
                  <div className='relative'>
                     <button
                        className='flex items-center bg-white rounded-lg p-1 shadow-sm'
                        onClick={() => setShowDropdown(!showDropdown)}
                     >
                        <div className='ml-2 mr-1'>
                           <div className='text-sm font-medium text-gray-700'>Thảo Vy</div>
                           <div className='text-xs text-gray-500'>
                              {isMounted ? formatTime() : ''}
                           </div>
                        </div>
                     </button>

                     {showDropdown && (
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10'>
                           <div className='py-1'>
                              <a
                                 href='#'
                                 className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                 Profile
                              </a>
                              <a
                                 href='#'
                                 className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                 Settings
                              </a>
                              <a
                                 href='#'
                                 className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                              >
                                 Logout
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
