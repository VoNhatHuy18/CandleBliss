'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import AuthService from '@/app/utils/authService';
import Toast from '@/app/components/ui/toast/page';

export default function Profile() {
   const router = useRouter();
   const [userName, setUserName] = useState<string>('');
   const [userEmail, setUserEmail] = useState<string>('');
   const [isLoading, setIsLoading] = useState<boolean>(true);

   const [toast, setToast] = useState<{
      show: boolean;
      message: string;
      type: 'success' | 'error' | 'info';
   }>({
      show: false,
      message: '',
      type: 'info',
   });

   useEffect(() => {
      // Kiểm tra xem người dùng đã đăng nhập chưa
      if (!AuthService.isAuthenticated()) {
         router.push('/user/signin');
         return;
      }

      // Lấy thông tin người dùng từ localStorage hoặc từ API
      const userInfo = AuthService.getUserInfo();
      if (userInfo) {
         setUserName(`${userInfo.firstName || ''} ${userInfo.lastName || ''}`);
         setUserEmail(userInfo.email || '');
      }

      setIsLoading(false);
   }, [router]);

   const handleLogout = () => {
      AuthService.logout();
      setToast({
         show: true,
         message: 'Đăng xuất thành công',
         type: 'success',
      });

      setTimeout(() => {
         router.push('/user/home');
      }, 1000);
   };

   if (isLoading) {
      return (
         <div className='min-h-screen flex items-center justify-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#553C26]'></div>
         </div>
      );
   }

   return (
      <div className='min-h-screen flex flex-col bg-[#F9F6F3]'>
         <div className='fixed top-4 right-4 z-50'>
            <Toast
               show={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
         </div>

         <NavBar />
         <hr className='border-b-2 border-b-[#F1EEE9]' />

         <div className='container mx-auto px-4 py-8 flex-grow'>
            <div className='bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto'>
               <h1 className='text-2xl font-bold text-[#553C26] mb-6'>Hồ Sơ Cá Nhân</h1>

               <div className='space-y-4'>
                  <div>
                     <h2 className='text-lg font-semibold text-[#553C26]'>Họ và tên</h2>
                     <p className='text-gray-700'>{userName || 'Chưa cập nhật'}</p>
                  </div>

                  <div>
                     <h2 className='text-lg font-semibold text-[#553C26]'>Email</h2>
                     <p className='text-gray-700'>{userEmail || 'Chưa cập nhật'}</p>
                  </div>

                  <div className='pt-6'>
                     <button
                        onClick={handleLogout}
                        className='bg-[#553C26] text-white py-2 px-4 rounded hover:bg-[#3e2b1a] transition-colors'
                     >
                        Đăng xuất
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
}
