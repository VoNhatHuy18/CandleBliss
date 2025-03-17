'use client';
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';

import Toast from '@/app/components/ui/toast/page';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SignInPage() {
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [email, setEmail] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [emailError, setEmailError] = useState<string>('');
   const [passwordError, setPasswordError] = useState<string>('');
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [apiError, setApiError] = useState<string>('');
   const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
   const [toast, setToast] = useState<{
      show: boolean;
      message: string;
      type: 'success' | 'error' | 'info';
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
   }>({
      show: false,
      message: '',
      type: 'info',
      position: 'top-right', // Mặc định
   });

   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
   };

   const validateEmail = (value: string): void => {
      setEmail(value);
      if (!value) {
         setEmailError('Email không được để trống');
      } else if (!emailRegex.test(value)) {
         setEmailError('Email không hợp lệ');
      } else {
         setEmailError('');
      }
   };

   const validatePassword = (value: string): void => {
      setPassword(value);
      if (!value) {
         setPasswordError('Mật khẩu không được để trống');
      } else if (!passwordRegex.test(value)) {
         setPasswordError(
            'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
         );
      } else {
         setPasswordError('');
      }
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate input trước khi gửi request
      validateEmail(email);
      validatePassword(password);

      if (emailError || passwordError || !email || !password) {
         return;
      }

      setIsLoading(true);
      setApiError('');

      try {
         const response = await fetch('http://localhost:3000/api/v1/auth/email/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email,
               password,
            }),
         });

         let data;
         try {
            data = await response.json();
         } catch (error) {
            console.error('JSON parsing error:', error);
            setToast({
               show: true,
               message: 'Lỗi dữ liệu từ server',
               type: 'error',
            });
            throw new Error('Lỗi dữ liệu từ server');
         }

         if (!response.ok) {
            if (response.status === 401) {
               setToast({
                  show: true,
                  message: 'Email hoặc mật khẩu không chính xác',
                  type: 'error',
               });
               setApiError('Email hoặc mật khẩu không chính xác');
            } else if (response.status === 403) {
               setToast({
                  show: true,
                  message: 'Tài khoản của bạn đã bị khóa',
                  type: 'error',
               });
               setApiError('Tài khoản của bạn đã bị khóa');
            } else if (response.status === 400) {
               setToast({
                  show: true,
                  message: data?.message || 'Dữ liệu đăng nhập không hợp lệ',
                  type: 'error',
               });
               setApiError(data?.message || 'Dữ liệu đăng nhập không hợp lệ');
            } else {
               throw new Error(data?.message || 'Đăng nhập thất bại');
            }
            return;
         }

         // Xử lý đăng nhập thành công
         setLoginSuccess(true);

         setToast({
            show: true,
            message: 'Đăng nhập thành công!',
            type: 'success',
         });

         // Lưu token vào localStorage
         if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userToken', data.token); // Thêm userToken để navbar có thể kiểm tra
         }

         if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
         }

         // Chuyển hướng sau khi đăng nhập thành công
         setTimeout(() => {
            window.location.href = '/user/home';
         }, 1500); // Tăng lên 1.5s để người dùng có thể thấy thông báo thành công
      } catch (error: any) {
         console.error('Login error:', error);
         setToast({
            show: true,
            message: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.',
            type: 'error',
         });
         setApiError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <div className='fixed top-4 right-4 z-50'>
            <Toast
               show={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
         </div>
         <div className='mx-auto'>
            <NavBar />
            <hr className='border-b-2 border-b-[#F1EEE9]' />

            {/* Form đăng ký */}
            <div
               className='h-full w-full bg-local'
               style={{
                  backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '800px',
               }}
            >
               <div className='flex justify-end items-center h-full relative right-52'>
                  <form className='bg-white p-8 rounded-lg shadow-md w-96' onSubmit={handleSubmit}>
                     <h2 className='text-2xl font-bold mb-6 text-center text-[#553C26]'>
                        Đăng Nhập
                     </h2>

                     <div className='mb-4'>
                        <label
                           htmlFor='email'
                           className='block text-[#553C26] mb-2 text-base font-medium'
                        >
                           Email
                        </label>
                        <input
                           type='email'
                           id='email'
                           className={`w-full px-3 py-2 border rounded-lg ${
                              emailError ? 'border-red-500' : 'border-[#553C26]'
                           }`}
                           placeholder='Nhập Email hoặc số điện thoại'
                           value={email}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              validateEmail(e.target.value)
                           }
                        />
                        {emailError && (
                           <p className='text-red-500 text-sm mt-1 break-words'>{emailError}</p>
                        )}
                     </div>

                     <div className='mb-2'>
                        <label
                           htmlFor='password'
                           className='block text-[#553C26] mb-2 text-base font-medium'
                        >
                           Mật Khẩu
                        </label>

                        <div className='flex justify-between items-center relative'>
                           <input
                              type={showPassword ? 'text' : 'password'}
                              id='password'
                              className={`w-full px-3 py-2 border rounded-lg ${
                                 passwordError ? 'border-red-500' : 'border-[#553C26]'
                              }`}
                              placeholder='Nhập mật khẩu'
                              value={password}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                 validatePassword(e.target.value)
                              }
                           />
                           <button
                              type='button'
                              onClick={togglePasswordVisibility}
                              className='absolute right-3'
                           >
                              {showPassword ? (
                                 <EyeSlashIcon className='size-4' />
                              ) : (
                                 <EyeIcon className='size-4' />
                              )}
                           </button>
                        </div>
                        {passwordError && (
                           <div className='text-red-500 text-sm mt-1 whitespace-normal break-words max-w-full'>
                              {passwordError}
                           </div>
                        )}
                     </div>
                     <Link href='/user/forgotpassword'>
                        <p className='flex justify-end mr-4 pb-2 text-[#553C26] hover:underline'>
                           Quên mật khẩu?
                        </p>
                     </Link>
                     <button
                        type='submit'
                        className='w-full bg-[#553C26] text-white py-2 mb-2 rounded-lg hover:bg-[#3e2b1a]'
                     >
                        Đăng Nhập
                     </button>
                     <div className='flex items-center'>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                        <div className='mx-2'>
                           <Image
                              src='/images/logo.png'
                              alt='Candle Bliss Logo'
                              className='h-10'
                              width={0}
                              height={0}
                           />
                        </div>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                     </div>
                     <p className='flex justify-center font-paci text-lg text-[#553C26]'>
                        Đăng nhập bằng tài khoản khác
                     </p>
                     <div className='flex justify-center items-center'>
                        <button className='h-10 w-40 flex justify-center items-center my-2 border border-[#553C26] rounded-lg'>
                           <Image src='/images/google.png' alt='' width={50} height={50} />
                        </button>
                     </div>
                     <Link href='/user/signup'>
                        <p className='flex justify-center text-lg text-[#553C26] hover:underline'>
                           Chưa có tài khoản? Đăng ký
                        </p>
                     </Link>
                  </form>
               </div>
            </div>
            <Footer />
         </div>
      </>
   );
}
