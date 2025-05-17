'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
   FaUser,
   FaShoppingBag,
   FaAddressBook,
   FaStar,
   FaHeadset,
   FaSignOutAlt,
   FaUserCog,
} from 'react-icons/fa';

import { fetchUserProfile } from '@/app/utils/api';
import type { User } from '@/app/user/profile/types';

interface MenuProfileProps {
   selectedTab: string;
}

const MenuProfile: React.FC<MenuProfileProps> = ({ selectedTab }) => {
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const router = useRouter();
   const [userData, setUserData] = useState<User | null>(null);
   const [isAdmin, setIsAdmin] = useState(false);

   useEffect(() => {
      // Get the current user's name and role to display in the menu header
      const getUserInfo = async () => {
         try {
            const user = await fetchUserProfile();
            setUserData(user);

            // Check if user has admin role
            const isAdminUser =
               user.role &&
               (user.role.name.toLowerCase() === 'admin' ||
                  user.role.name.toLowerCase().includes('admin'));
            setIsAdmin(isAdminUser);
         } catch (error) {
            console.error('Failed to fetch user info for menu', error);
         }
      };

      getUserInfo();
   }, []);

   const menuItems = [
      {
         label: 'Thông tin cá nhân',
         icon: FaUser,
         tab: 'profile',
         path: '/user/profile',
      },
      {
         label: 'Quản lý đơn hàng',
         icon: FaShoppingBag,
         tab: 'orders',
         path: '/user/order',
      },
      {
         label: 'Địa chỉ của tôi',
         icon: FaAddressBook,
         tab: 'addresses',
         path: '/user/profile/address',
      },
      {
         label: 'Đánh giá sản phẩm',
         icon: FaStar,
         tab: 'reviews',
         path: '/user/order/rating',
      },
      {
         label: 'Hỗ trợ & Góp ý',
         icon: FaHeadset,
         tab: 'support',
         path: '/user/profile/support',
      },
      // Add Admin Dashboard button when user is admin
      ...(isAdmin
         ? [
            {
               label: 'Quản trị viên',
               icon: FaUserCog,
               tab: 'admin-dashboard',
               path: '/seller/dashboard',
               isHighlighted: true,
            },
         ]
         : []),
      {
         label: 'Đăng xuất',
         icon: FaSignOutAlt,
         tab: 'logout',
         isDanger: true,
      },
   ];

   const handleTabSelect = (tab: string, path?: string) => {
      if (tab === 'logout') {
         setShowLogoutConfirm(true);
         return;
      }

      if (path) {
         router.push(path);
      }
   };

   const handleLogout = () => {
      localStorage.removeItem('token');
      router.push('/user/signin');
      setShowLogoutConfirm(false);
   };

   return (
      <div className='w-full md:w-1/4'>
         <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
            <div className='py-5 border-b bg-gradient-to-r from-amber-50 to-amber-100'>
               <div className='flex items-center'>
                  <div className='h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 ml-5'>
                     <FaUser size={20} />
                  </div>
                  <div className='ml-4'>
                     <h3 className='font-medium text-gray-800'>Xin chào,</h3>
                     <p className='text-amber-700 font-semibold'>
                        {userData ? `${userData.firstName} ${userData.lastName}` : '...'}
                     </p>
                  </div>
               </div>
            </div>

            <div>
               {menuItems.map((item) => (
                  <div
                     key={item.tab}
                     className={`border-b last:border-none ${selectedTab === item.tab ? 'bg-amber-50' : ''
                        }`}
                  >
                     {item.path ? (
                        <Link href={item.path}>
                           <div
                              className={`flex items-center w-full py-3.5 px-5 transition duration-150 ${item.isDanger
                                 ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                 : item.isHighlighted
                                    ? 'font-medium text-purple-700 bg-purple-50 hover:bg-purple-100'
                                    : selectedTab === item.tab
                                       ? 'font-medium text-amber-700'
                                       : 'text-gray-700 hover:bg-amber-50'
                                 }`}
                           >
                              <item.icon
                                 className={`mr-3 ${item.isDanger
                                    ? 'text-red-500'
                                    : item.isHighlighted
                                       ? 'text-purple-600'
                                       : selectedTab === item.tab
                                          ? 'text-amber-600'
                                          : 'text-gray-500'
                                    }`}
                              />
                              <span>{item.label}</span>

                           </div>
                        </Link>
                     ) : (
                        <button
                           className={`flex items-center w-full py-3.5 px-5 transition duration-150 ${item.isDanger
                              ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                              : item.isHighlighted
                                 ? 'font-medium text-purple-700 bg-purple-50 hover:bg-purple-100'
                                 : selectedTab === item.tab
                                    ? 'font-medium text-amber-700'
                                    : 'text-gray-700 hover:bg-amber-50'
                              }`}
                           onClick={() => handleTabSelect(item.tab, item.path)}
                        >
                           <item.icon
                              className={`mr-3 ${item.isDanger
                                 ? 'text-red-500'
                                 : item.isHighlighted
                                    ? 'text-purple-600'
                                    : selectedTab === item.tab
                                       ? 'text-amber-600'
                                       : 'text-gray-500'
                                 }`}
                           />
                           <span>{item.label}</span>

                        </button>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Support section */}
         <div className='mt-4 bg-white p-5 rounded-lg border shadow-sm'>
            <h3 className='font-medium text-gray-800 mb-2'>Cần hỗ trợ?</h3>
            <p className='text-gray-600 text-sm mb-3'>
               Chúng tôi luôn sẵn sàng giúp đỡ bạn với mọi vấn đề.
            </p>
            <div className='flex space-x-2'>
               <Link
                  href='/user/profile/support'
                  className='text-amber-600 hover:text-amber-700 text-sm font-medium'
               >
                  Liên hệ ngay
               </Link>
               <span className='text-gray-400'>|</span>
               <Link
                  href='/user/profile/support'
                  target='_blank'
                  className='text-amber-600 hover:text-amber-700 text-sm font-medium'
               >
                  Câu hỏi thường gặp
               </Link>
            </div>
         </div>

         {showLogoutConfirm && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
               <div className='bg-white rounded-lg p-6 max-w-sm mx-4 md:mx-0'>
                  <h3 className='text-lg font-medium text-gray-900 mb-3'>Xác nhận đăng xuất</h3>
                  <p className='text-gray-600 mb-5'>
                     Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình?
                  </p>
                  <div className='flex justify-end space-x-3'>
                     <button
                        className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
                        onClick={() => setShowLogoutConfirm(false)}
                     >
                        Hủy
                     </button>
                     <button
                        className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
                        onClick={handleLogout}
                     >
                        Đăng xuất
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default MenuProfile;
