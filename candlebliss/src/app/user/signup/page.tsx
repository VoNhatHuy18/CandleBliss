'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SignUpPage() {
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [showRePassword, setShowRePassword] = useState<boolean>(false);

   // State lưu giá trị input
   const [phone, setPhone] = useState<string>('');
   const [email, setEmail] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [rePassword, setRePassword] = useState<string>('');
   const [firstName, setFirstName] = useState<string>('');
   const [lastName, setLastName] = useState<string>('');

   // State lưu thông báo lỗi
   const [phoneError, setPhoneError] = useState<string>('');
   const [emailError, setEmailError] = useState<string>('');
   const [passwordError, setPasswordError] = useState<string>('');
   const [rePasswordError, setRePasswordError] = useState<string>('');
   const [firstNameError, setFirstNameError] = useState<string>('');
   const [lastNameError, setLastNameError] = useState<string>('');
   const [apiError, setApiError] = useState<string>(''); // Lỗi từ server
   const [isLoading, setIsLoading] = useState<boolean>(false); // Loading trạng thái

   // Biểu thức regex
   const phoneRegex = /^(0[1-9]|84[1-9])\d{8}$/;
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
   };

   const toggleRePasswordVisibility = (): void => {
      setShowRePassword(!showRePassword);
   };

   const validatePhone = (value: string): void => {
      setPhone(value);
      if (!value) {
         setPhoneError('Số điện thoại không được để trống');
      } else if (!phoneRegex.test(value)) {
         setPhoneError('Số điện thoại không hợp lệ');
      } else {
         setPhoneError('');
      }
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
      if (rePassword) {
         validateRePassword(rePassword, value);
      }
   };

   const validateRePassword = (value: string, pass?: string): void => {
      setRePassword(value);
      const currentPassword = pass || password;
      if (!value) {
         setRePasswordError('Vui lòng xác nhận mật khẩu');
      } else if (value !== currentPassword) {
         setRePasswordError('Mật khẩu xác nhận không khớp');
      } else {
         setRePasswordError('');
      }
   };

   const validateFirstName = (value: string): void => {
      setFirstName(value);
      if (!value.trim()) {
         setFirstNameError('Tên không được để trống');
      } else {
         setFirstNameError('');
      }
   };

   const validateLastName = (value: string): void => {
      setLastName(value);
      if (!value.trim()) {
         setLastNameError('Họ không được để trống');
      } else {
         setLastNameError('');
      }
   };

   // Thêm hàm validate form
   const validateForm = () => {
      let isValid = true;

      // Validate họ tên
      if (!firstName.trim()) {
         setFirstNameError('Tên không được để trống');
         isValid = false;
      }

      if (!lastName.trim()) {
         setLastNameError('Họ không được để trống');
         isValid = false;
      }

      // Validate số điện thoại
      if (!phone) {
         setPhoneError('Số điện thoại không được để trống');
         isValid = false;
      } else if (!phoneRegex.test(phone)) {
         setPhoneError('Số điện thoại không hợp lệ');
         isValid = false;
      }

      // Validate email
      if (!email) {
         setEmailError('Email không được để trống');
         isValid = false;
      } else if (!emailRegex.test(email)) {
         setEmailError('Email không hợp lệ');
         isValid = false;
      }

      // Validate mật khẩu
      if (!password) {
         setPasswordError('Mật khẩu không được để trống');
         isValid = false;
      } else if (!passwordRegex.test(password)) {
         setPasswordError(
            'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
         );
         isValid = false;
      }

      // Validate nhập lại mật khẩu
      if (!rePassword) {
         setRePasswordError('Vui lòng xác nhận mật khẩu');
         isValid = false;
      } else if (rePassword !== password) {
         setRePasswordError('Mật khẩu xác nhận không khớp');
         isValid = false;
      }

      return isValid;
   };

   // Xử lý khi submit form
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setIsLoading(true);
      setApiError('');

      try {
         const response = await fetch('http://localhost:3000/api/v1/auth/email/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email,
               password,
               firstName,
               lastName,
               phone,
            }),
         });

         let data;
         const contentType = response.headers.get('content-type');
         
         // Kiểm tra xem response có phải là JSON không trước khi parse
         if (contentType && contentType.includes('application/json')) {
            try {
               data = await response.json();
            } catch (jsonError) {
               console.error('JSON parsing error:', jsonError);
               throw new Error('Lỗi dữ liệu từ server');
            }
         } else {
            // Nếu không phải JSON, đọc dưới dạng text
            const textResponse = await response.text();
            console.log('Non-JSON response:', textResponse);
            data = { message: 'Lỗi định dạng phản hồi từ server' };
         }

         if (!response.ok) {
            // Xử lý các mã lỗi cụ thể
            if (response.status === 409) {
               setEmailError('Email này đã được sử dụng');
               setApiError('');
            } else if (response.status === 400) {
               setApiError(data?.message || 'Dữ liệu không hợp lệ');
            } else {
               throw new Error(data?.message || 'Email đã được sử dụng');
            }
            return;
         }

         // Hiển thị thông báo thành công và điều hướng
         sessionStorage.setItem('registerEmail', email);
         sessionStorage.setItem('registerPhone', phone);
         window.location.href = '/user/otp';
      } catch (error: any) {
         console.error('Registration error:', error);
         setApiError(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className='min-h-screen flex flex-col'>
         <NavBar />
         <hr className='border-b-2 border-b-[#F1EEE9]' />

         <div
            className='flex-grow bg-cover bg-center px-4 py-8 md:py-12'
            style={{ backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")` }}
         >
            <div className='container mx-auto flex justify-center md:justify-end'>
               <div className='w-full max-w-md md:w-96 md:mr-12 lg:mr-24'>
                  <form
                     className='bg-white p-6 md:p-8 rounded-lg shadow-md w-full'
                     onSubmit={handleSubmit}
                  >
                     <h2 className='text-xl md:text-2xl font-bold mb-6 text-center text-[#553C26]'>
                        Đăng Ký
                     </h2>

                     {/* Hiển thị lỗi API */}
                     {apiError && <p className='text-red-500 text-center mb-4'>{apiError}</p>}

                     {/* Họ và Tên */}
                     <div className='flex space-x-4 mb-4'>
                        <div className='w-1/2'>
                           <label
                              htmlFor='lastName'
                              className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                           >
                              Họ
                           </label>
                           <input
                              type='text'
                              id='lastName'
                              className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                                 lastNameError ? 'border-red-500' : 'border-[#553C26]'
                              }`}
                              placeholder='Nhập họ'
                              value={lastName}
                              onChange={(e) => validateLastName(e.target.value)}
                           />
                           {lastNameError && (
                              <p className='text-red-500 text-xs md:text-sm mt-1'>
                                 {lastNameError}
                              </p>
                           )}
                        </div>

                        <div className='w-1/2'>
                           <label
                              htmlFor='firstName'
                              className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                           >
                              Tên
                           </label>
                           <input
                              type='text'
                              id='firstName'
                              className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                                 firstNameError ? 'border-red-500' : 'border-[#553C26]'
                              }`}
                              placeholder='Nhập tên'
                              value={firstName}
                              onChange={(e) => validateFirstName(e.target.value)}
                           />
                           {firstNameError && (
                              <p className='text-red-500 text-xs md:text-sm mt-1'>
                                 {firstNameError}
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Phone Input */}
                     <div className='mb-4'>
                        <label
                           htmlFor='phone'
                           className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                        >
                           Số điện thoại
                        </label>
                        <input
                           type='text'
                           id='phone'
                           className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                              phoneError ? 'border-red-500' : 'border-[#553C26]'
                           }`}
                           placeholder='Nhập số điện thoại của bạn'
                           value={phone}
                           onChange={(e) => validatePhone(e.target.value)}
                        />
                        {phoneError && (
                           <p className='text-red-500 text-xs md:text-sm mt-1'>{phoneError}</p>
                        )}
                     </div>

                     {/* Email Input */}
                     <div className='mb-4'>
                        <label
                           htmlFor='email'
                           className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                        >
                           Email
                        </label>
                        <input
                           type='email'
                           id='email'
                           className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                              emailError ? 'border-red-500' : 'border-[#553C26]'
                           }`}
                           placeholder='Nhập Email'
                           value={email}
                           onChange={(e) => validateEmail(e.target.value)}
                        />
                        {emailError && (
                           <p className='text-red-500 text-xs md:text-sm mt-1'>{emailError}</p>
                        )}
                     </div>

                     {/* Password Input */}
                     <div className='mb-4'>
                        <label
                           htmlFor='password'
                           className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                        >
                           Mật Khẩu
                        </label>
                        <div className='relative'>
                           <input
                              type={showPassword ? 'text' : 'password'}
                              id='password'
                              className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                                 passwordError ? 'border-red-500' : 'border-[#553C26]'
                              }`}
                              placeholder='Nhập mật khẩu'
                              value={password}
                              onChange={(e) => validatePassword(e.target.value)}
                           />
                           <button
                              type='button'
                              onClick={togglePasswordVisibility}
                              className='absolute right-3 top-1/2 transform -translate-y-1/2'
                           >
                              {showPassword ? (
                                 <EyeSlashIcon className='h-4 w-4 md:h-5 md:w-5' />
                              ) : (
                                 <EyeIcon className='h-4 w-4 md:h-5 md:w-5' />
                              )}
                           </button>
                        </div>
                        {passwordError && (
                           <p className='text-red-500 text-xs md:text-sm mt-1'>{passwordError}</p>
                        )}
                     </div>

                     {/* Confirm Password Input */}
                     <div className='mb-6'>
                        <label
                           htmlFor='repassword'
                           className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'
                        >
                           Xác Nhận Mật Khẩu
                        </label>
                        <div className='relative'>
                           <input
                              type={showRePassword ? 'text' : 'password'}
                              id='repassword'
                              className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base ${
                                 rePasswordError ? 'border-red-500' : 'border-[#553C26]'
                              }`}
                              placeholder='Xác nhận mật khẩu'
                              value={rePassword}
                              onChange={(e) => validateRePassword(e.target.value)}
                           />
                           <button
                              type='button'
                              onClick={toggleRePasswordVisibility}
                              className='absolute right-3 top-1/2 transform -translate-y-1/2'
                           >
                              {showRePassword ? (
                                 <EyeSlashIcon className='h-4 w-4 md:h-5 md:w-5' />
                              ) : (
                                 <EyeIcon className='h-4 w-4 md:h-5 md:w-5' />
                              )}
                           </button>
                        </div>
                        {rePasswordError && (
                           <p className='text-red-500 text-xs md:text-sm mt-1'>{rePasswordError}</p>
                        )}
                     </div>

                     {/* Submit Button - thêm hiệu ứng loading */}
                     <button
                        type='submit'
                        className='w-full bg-[#553C26] text-white py-2 rounded-lg hover:bg-[#3e2b1a] transition-colors duration-300 text-sm md:text-base flex justify-center items-center'
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <>
                              <svg
                                 className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                                 xmlns='http://www.w3.org/2000/svg'
                                 fill='none'
                                 viewBox='0 0 24 24'
                              >
                                 <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                 ></circle>
                                 <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                 ></path>
                              </svg>
                              Đang xử lý...
                           </>
                        ) : (
                           'Đăng Ký'
                        )}
                     </button>

                     {/* Divider with Logo */}
                     <div className='flex items-center my-4'>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                        <div className='mx-2'>
                           <Image
                              src='/images/logo.png'
                              alt='Candle Bliss Logo'
                              width={40}
                              height={40}
                              className='h-8 w-8 md:h-10 md:w-10'
                           />
                        </div>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                     </div>

                     {/* Social Login */}
                     <p className='text-center font-paci text-sm md:text-lg text-[#553C26] mb-4'>
                        Đăng nhập bằng tài khoản khác
                     </p>
                     <div className='flex justify-center'>
                        <button className='h-8 md:h-10 w-32 md:w-40 flex justify-center items-center border border-[#553C26] rounded-lg'>
                           <Image
                              src='/images/google.png'
                              alt='Google Logo'
                              width={50}
                              height={50}
                              className=' md:h-5 md:w-16'
                           />
                        </button>
                     </div>

                     {/* Sign In Link */}
                     <Link href='/user/signin'>
                        <p className='text-center text-sm md:text-lg text-[#553C26] hover:underline mt-4'>
                           Đã có tài khoản? Đăng nhập
                        </p>
                     </Link>
                  </form>
               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
