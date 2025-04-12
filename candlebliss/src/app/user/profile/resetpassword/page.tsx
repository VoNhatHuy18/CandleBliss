'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';

import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import MenuProfile from '@/app/components/user/menuprofile/page';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ResetPasswordContent: React.FC = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);
   const [formData, setFormData] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
   });
   const [showOldPassword, setShowOldPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [passwordValidation, setPasswordValidation] = useState({
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
   });

   const router = useRouter();

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
         ...formData,
         [name]: value,
      });

      if (name === 'newPassword') {
         setPasswordValidation({
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            special: /[@$!%*?&]/.test(value),
         });
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (!passwordRegex.test(formData.newPassword)) {
         setError('Mật khẩu không đáp ứng các yêu cầu bảo mật');
         setIsLoading(false);
         return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
         setError('Mật khẩu xác nhận không khớp');
         setIsLoading(false);
         return;
      }

      try {
         const userId = localStorage.getItem('userId');
         if (!userId) {
            throw new Error('User ID not found');
         }

         const response = await fetch(`/api/v1/auth/me`, {
            method: 'PATCH',
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               password: formData.newPassword,
               oldPassword: formData.oldPassword,
            }),
         });

         const responseData = await response.json();

         if (!response.ok) {
            if (responseData.message?.includes('Password incorrect')) {
               setError('Mật khẩu hiện tại không chính xác');
            } else {
               setError('Đã xảy ra lỗi khi thay đổi mật khẩu');
            }
            setIsLoading(false);
            return;
         }

         setSuccess('Đổi mật khẩu thành công');
         setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
         });
         setPasswordValidation({
            length: false,
            lowercase: false,
            uppercase: false,
            number: false,
            special: false,
         });
      } catch (err) {
         if (err instanceof Error && err.message === 'Unauthorized') {
            router.push('/user/signin?redirect=/user/profile/resetpassword');
            return;
         }
         setError('Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className='space-y-6 bg-white p-6 rounded-lg shadow-sm'>
         <h2 className='text-2xl font-semibold text-gray-800 pb-4 border-b'>Đổi mật khẩu</h2>

         <div className='max-w-md mx-auto'>
            <form className='space-y-5' onSubmit={handleSubmit}>
               {error && (
                  <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center'>
                     <FaExclamationTriangle className='mr-2' />
                     <span>{error}</span>
                  </div>
               )}

               {success && (
                  <div className='p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center'>
                     <FaCheckCircle className='mr-2' />
                     <span>{success}</span>
                  </div>
               )}

               <div className='space-y-4'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Mật khẩu hiện tại
                     </label>
                     <div className='relative'>
                        <input
                           type={showOldPassword ? 'text' : 'password'}
                           name='oldPassword'
                           value={formData.oldPassword}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg pr-10'
                           required
                        />
                        <button
                           type='button'
                           className='absolute inset-y-0 right-0 pr-3 flex items-center'
                           onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                           {showOldPassword ? (
                              <FaEyeSlash className='text-gray-500' />
                           ) : (
                              <FaEye className='text-gray-500' />
                           )}
                        </button>
                     </div>
                  </div>

                  <div>
                     <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Mật khẩu mới
                     </label>
                     <div className='relative'>
                        <input
                           type={showNewPassword ? 'text' : 'password'}
                           name='newPassword'
                           value={formData.newPassword}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg pr-10'
                           required
                        />
                        <button
                           type='button'
                           className='absolute inset-y-0 right-0 pr-3 flex items-center'
                           onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                           {showNewPassword ? (
                              <FaEyeSlash className='text-gray-500' />
                           ) : (
                              <FaEye className='text-gray-500' />
                           )}
                        </button>
                     </div>

                     <div className='mt-2 text-sm text-gray-600 space-y-1'>
                        <p className='font-medium'>Mật khẩu phải có:</p>
                        <ul className='pl-1 space-y-1'>
                           <li
                              className={`flex items-center ${
                                 passwordValidation.length ? 'text-green-600' : 'text-gray-500'
                              }`}
                           >
                              {passwordValidation.length ? (
                                 <FaCheckCircle className='mr-2 text-green-500' />
                              ) : (
                                 <span className='h-4 w-4 mr-2 rounded-full border border-gray-300'></span>
                              )}
                              Ít nhất 8 ký tự
                           </li>
                           <li
                              className={`flex items-center ${
                                 passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'
                              }`}
                           >
                              {passwordValidation.lowercase ? (
                                 <FaCheckCircle className='mr-2 text-green-500' />
                              ) : (
                                 <span className='h-4 w-4 mr-2 rounded-full border border-gray-300'></span>
                              )}
                              Ít nhất 1 chữ cái thường (a-z)
                           </li>
                           <li
                              className={`flex items-center ${
                                 passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'
                              }`}
                           >
                              {passwordValidation.uppercase ? (
                                 <FaCheckCircle className='mr-2 text-green-500' />
                              ) : (
                                 <span className='h-4 w-4 mr-2 rounded-full border border-gray-300'></span>
                              )}
                              Ít nhất 1 chữ cái hoa (A-Z)
                           </li>
                           <li
                              className={`flex items-center ${
                                 passwordValidation.number ? 'text-green-600' : 'text-gray-500'
                              }`}
                           >
                              {passwordValidation.number ? (
                                 <FaCheckCircle className='mr-2 text-green-500' />
                              ) : (
                                 <span className='h-4 w-4 mr-2 rounded-full border border-gray-300'></span>
                              )}
                              Ít nhất 1 chữ số (0-9)
                           </li>
                           <li
                              className={`flex items-center ${
                                 passwordValidation.special ? 'text-green-600' : 'text-gray-500'
                              }`}
                           >
                              {passwordValidation.special ? (
                                 <FaCheckCircle className='mr-2 text-green-500' />
                              ) : (
                                 <span className='h-4 w-4 mr-2 rounded-full border border-gray-300'></span>
                              )}
                              Ít nhất 1 ký tự đặc biệt (@$!%*?&)
                           </li>
                        </ul>
                     </div>
                  </div>

                  <div>
                     <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Xác nhận mật khẩu mới
                     </label>
                     <div className='relative'>
                        <input
                           type={showConfirmPassword ? 'text' : 'password'}
                           name='confirmPassword'
                           value={formData.confirmPassword}
                           onChange={handleInputChange}
                           className='w-full p-3 border rounded-lg pr-10'
                           required
                        />
                        <button
                           type='button'
                           className='absolute inset-y-0 right-0 pr-3 flex items-center'
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                           {showConfirmPassword ? (
                              <FaEyeSlash className='text-gray-500' />
                           ) : (
                              <FaEye className='text-gray-500' />
                           )}
                        </button>
                     </div>
                  </div>
               </div>

               <div className='pt-4'>
                  <button
                     type='submit'
                     className='px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center justify-center w-full'
                     disabled={isLoading}
                  >
                     {isLoading && <FaSpinner className='animate-spin mr-2' />}
                     {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

const ResetPassword = () => {
   const [checkingAuth, setCheckingAuth] = useState(true);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
         router.push('/user/signin?redirect=/user/profile/resetpassword');
         return;
      }

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
      return null;
   }

   return (
      <>
         <Header />
         <div className='container mx-auto px-4 py-8'>
            <div className='flex flex-col md:flex-row gap-6'>
               <MenuProfile selectedTab='resetpassword' />
               <div className='w-full md:w-3/4'>
                  <ResetPasswordContent />
               </div>
            </div>
         </div>
         <ViewedCarousel />
         <Footer />
      </>
   );
};

export default ResetPassword;
