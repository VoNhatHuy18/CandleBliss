'use client';
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SignUpPage() {
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [showRePassword, setShowRePassword] = useState<boolean>(false);
   
   // Các state để lưu giá trị input
   const [phone, setPhone] = useState<string>('');
   const [email, setEmail] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [rePassword, setRePassword] = useState<string>('');
   
   // Các state để lưu thông báo lỗi
   const [phoneError, setPhoneError] = useState<string>('');
   const [emailError, setEmailError] = useState<string>('');
   const [passwordError, setPasswordError] = useState<string>('');
   const [rePasswordError, setRePasswordError] = useState<string>('');
   
   // Biểu thức chính quy
   const phoneRegex = /^(0[1-9]|84[1-9])\d{8}$/; // Số điện thoại Việt Nam (10 số, bắt đầu bằng 0 hoặc 84)
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
   };

   const toggleRePasswordVisibility = (): void => {
      setShowRePassword(!showRePassword);
   };
   
   // Hàm kiểm tra số điện thoại
   const validatePhone = (value: string): void => {
      setPhone(value);
      if (!value) {
         setPhoneError('Số điện thoại không được để trống');
      } else if (!phoneRegex.test(value)) {
         setPhoneError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số điện thoại Việt Nam');
      } else {
         setPhoneError('');
      }
   };
   
   // Hàm kiểm tra email
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
   
   // Hàm kiểm tra mật khẩu
   const validatePassword = (value: string): void => {
      setPassword(value);
      if (!value) {
         setPasswordError('Mật khẩu không được để trống');
      } else if (!passwordRegex.test(value)) {
         setPasswordError(
            'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
         );
      } else {
         setPasswordError('');
      }
      
      // Kiểm tra lại mật khẩu xác nhận nếu đã nhập
      if (rePassword) {
         validateRePassword(rePassword, value);
      }
   };
   
   // Hàm kiểm tra xác nhận mật khẩu
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
   
   // Xử lý khi submit form
   const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      
      // Kiểm tra lại tất cả trường dữ liệu
      validatePhone(phone);
      validateEmail(email);
      validatePassword(password);
      validateRePassword(rePassword);
      
      // Chỉ tiếp tục nếu không có lỗi
      if (!phoneError && !emailError && !passwordError && !rePasswordError && 
          phone && email && password && rePassword) {
         console.log('Đăng ký thành công!');
         // Có thể chuyển hướng đến trang OTP tại đây
         window.location.href = '/otp';
      }
   };
   
   return (
      <div className='min-h-screen flex flex-col'>
         <NavBar />
         <hr className='border-b-2 border-b-[#F1EEE9]' />

         {/* Background container với responsive height */}
         <div
            className='flex-grow bg-cover bg-center bg-no-repeat px-4 py-8 md:py-12'
            style={{
               backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")`,
            }}
         >
            {/* Form container với responsive positioning */}
            <div className='container mx-auto flex justify-center md:justify-end'>
               <div className='w-full max-w-md md:w-96 md:mr-12 lg:mr-24'>
                  <form className='bg-white p-6 md:p-8 rounded-lg shadow-md w-full' onSubmit={handleSubmit}>
                     <h2 className='text-xl md:text-2xl font-bold mb-6 text-center text-[#553C26]'>Đăng Ký</h2>
                     
                     {/* Phone Input */}
                     <div className='mb-4'>
                        <label htmlFor='phone' className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'>
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
                        {phoneError && <p className='text-red-500 text-xs md:text-sm mt-1'>{phoneError}</p>}
                     </div>

                     {/* Email Input */}
                     <div className='mb-4'>
                        <label htmlFor='email' className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'>
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
                        {emailError && <p className='text-red-500 text-xs md:text-sm mt-1'>{emailError}</p>}
                     </div>

                     {/* Password Input */}
                     <div className='mb-4'>
                        <label htmlFor='password' className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'>
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
                        {passwordError && <p className='text-red-500 text-xs md:text-sm mt-1'>{passwordError}</p>}
                     </div>

                     {/* Confirm Password Input */}
                     <div className='mb-6'>
                        <label htmlFor='repassword' className='block text-[#553C26] mb-2 text-sm md:text-base font-medium'>
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
                        {rePasswordError && <p className='text-red-500 text-xs md:text-sm mt-1'>{rePasswordError}</p>}
                     </div>

                     {/* Submit Button */}
                     <button
                        type='submit'
                        className='w-full bg-[#553C26] text-white py-2 rounded-lg hover:bg-[#3e2b1a] text-sm md:text-base'
                     >
                        Đăng Ký
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
                     <Link href="/user/signin">
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