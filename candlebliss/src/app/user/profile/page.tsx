'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaExclamationTriangle, FaUser } from 'react-icons/fa';

import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import MenuProfile from '@/app/components/user/menuprofile/MenuProfile';

import Image from 'next/image';
import { fetchUserProfile } from '@/app/utils/api';
import type { User } from './types';

// Profile content component with API integration
const ProfileContent: React.FC = () => {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isSaving, setIsSaving] = useState(false);
   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
   });
   const router = useRouter();

   useEffect(() => {
      const getUserData = async () => {
         try {
            setIsLoading(true);
            const userData = await fetchUserProfile();
            setUser(userData);

            if (userData.id) {
               localStorage.setItem('userId', userData.id.toString());
            }

            setFormData({
               firstName: userData.firstName || '',
               lastName: userData.lastName || '',
               email: userData.email || '',
               phone: userData.phone ? userData.phone.toString() : '',
            });
            setError(null);
         } catch (err) {
            if (err instanceof Error && err.message === 'Unauthorized') {
               router.push('/user/signin?redirect=/user/profile');
               return;
            }
            setError('Could not load profile data. Please try again later.');
         } finally {
            setIsLoading(false);
         }
      };

      getUserData();
   }, [router]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
         ...formData,
         [name]: value,
      });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setError(null);

      try {
         // Only include the fields we want to update (exclude email)
         const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone ? parseInt(formData.phone, 10) : undefined,
         };

         const response = await fetch(`/api/v1/users/${user?.id}`, {
            method: 'PATCH',
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
         });

         const responseData = await response.json();

         if (!response.ok) {
            if (
               responseData.status === 422 &&
               responseData.errors?.email === 'emailAlreadyExists'
            ) {
               setError('Email đã được sử dụng. Vui lòng sử dụng email khác.');
            } else {
               setError('Đã xảy ra lỗi khi cập nhật thông tin.');
            }
            return;
         }

         // Refresh user data
         const userData = await fetchUserProfile();
         setUser(userData);

         // Update form data
         setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone ? userData.phone.toString() : '',
         });

         alert('Cập nhật thông tin thành công');
      } catch (err) {
         if (err instanceof Error && err.message === 'Unauthorized') {
            router.push('/user/signin?redirect=/user/profile');
            return;
         }
         setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      } finally {
         setIsSaving(false);
      }
   };

   if (isLoading) {
      return (
         <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-96'>
            <div className='text-center'>
               <FaSpinner className='animate-spin text-amber-600 text-3xl mx-auto mb-4' />
               <p className='text-gray-500'>Loading profile information...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm'>
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start'>
               <FaExclamationTriangle className='mt-1 mr-3 flex-shrink-0' />
               <div>
                  <p className='font-medium mb-1'>Could not load profile</p>
                  <p>{error}</p>
                  <button
                     className='mt-2 text-sm font-medium underline'
                     onClick={() => window.location.reload()}
                  >
                     Try again
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!user) return null;

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
         .toString()
         .padStart(2, '0')}/${date.getFullYear()}`;
   };

   const fullName = `${user.firstName} ${user.lastName}`;

   return (
      <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm'>
         <h2 className='text-2xl font-semibold text-gray-800 pb-4 border-b'>Thông tin cá nhân</h2>

         <div className='flex flex-col md:flex-row gap-8'>
            <div className='w-full md:w-1/3 flex flex-col items-center'>
               <div className='relative w-32 h-32 mb-4'>
                  <Image
                     src='/default-avatar.png'
                     alt='Profile picture'
                     width={128}
                     height={128}
                     className='rounded-full object-cover border-4 border-amber-100'
                  />
                  <button className='absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600'>
                     <FaUser size={14} />
                  </button>
               </div>
               <h3 className='text-xl font-semibold'>{fullName}</h3>
               <p className='text-gray-500'>Thành viên từ {formatDate(user.createdAt)}</p>
               <div className='mt-2 flex gap-2'>
                  <div className='px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm'>
                     {user.role.name}
                  </div>
               </div>
            </div>

            <div className='w-full md:w-2/3'>
               <form className='space-y-4' onSubmit={handleSubmit}>
                  {error && (
                     <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md'>
                        {error}
                     </div>
                  )}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Họ</label>
                        <input
                           type='text'
                           name='firstName'
                           value={formData.firstName}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Tên</label>
                        <input
                           type='text'
                           name='lastName'
                           value={formData.lastName}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Email
                        </label>
                        <input
                           type='email'
                           name='email'
                           value={formData.email}
                           className='w-full p-3 border rounded-lg bg-gray-50'
                           readOnly
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                           Số điện thoại
                        </label>
                        <input
                           type='tel'
                           name='phone'
                           value={formData.phone}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg'
                        />
                     </div>
                  </div>

                  <div className='pt-2 flex items-center'>
                     <button
                        type='submit'
                        className='px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center'
                        disabled={isSaving}
                     >
                        {isSaving && <FaSpinner className='animate-spin mr-2' />}
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                     </button>

                     {user.status.name === 'Inactive' && (
                        <div className='ml-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm'>
                           Tài khoản chưa kích hoạt
                        </div>
                     )}
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

const UserProfile = () => {
   const [checkingAuth, setCheckingAuth] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const router = useRouter();

   useEffect(() => {
      // Check authentication status
      const token = localStorage.getItem('token');
      if (!token) {
         router.push('/user/signin?redirect=/user/profile');
         return;
      }

      // Verify token validity (simplified)
      setIsAuthenticated(true);
      setCheckingAuth(false);
   }, [router]);

   if (checkingAuth) {
      return (
         <>
            <Header />
            <div className='container mx-auto px-4 py-16 flex justify-center'>
               <div className='text-center'>
                  <FaSpinner className='animate-spin text-amber-600 text-4xl mx-auto mb-4' />
                  <p className='text-gray-600'>Đang tải thông tin người dùng...</p>
               </div>
            </div>
            <Footer />
         </>
      );
   }

   if (!isAuthenticated) {
      return null; // Will redirect in the useEffect
   }

   return (
      <>
         <Header />
         <div className='container mx-auto px-4 py-8'>
            <div className='flex flex-col md:flex-row gap-6'>
               <MenuProfile selectedTab='profile' />
               <div className='w-full md:w-3/4'>
                  <ProfileContent />
               </div>
            </div>
         </div>
         <ViewedCarousel />
         <Footer />
      </>
   );
};

export default UserProfile;
