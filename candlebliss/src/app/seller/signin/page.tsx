'use client';

// pages/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Login() {
   const router = useRouter();
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   
   // Validation states
   const [emailError, setEmailError] = useState('');
   const [passwordError, setPasswordError] = useState('');
   
   // Regex patterns
   const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
   const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   const validateEmail = (email: string) => {
      if (!email) {
         setEmailError('Email không được để trống');
         return false;
      }
      if (!EMAIL_REGEX.test(email)) {
         setEmailError('Email không hợp lệ');
         return false;
      }
      setEmailError('');
      return true;
   };

   const validatePassword = (password: string) => {
      if (!password) {
         setPasswordError('Mật khẩu không được để trống');
         return false;
      }
      if (!PASSWORD_REGEX.test(password)) {
         setPasswordError(
            'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
         );
         return false;
      }
      setPasswordError('');
      return true;
   };

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      
      // Validate form before submitting
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);
      
      if (!isEmailValid || !isPasswordValid) {
         return;
      }

      setLoading(true);

      try {
         const response = await fetch(`http://localhost:3000/api/v1/auth/email/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
         }

         // Lưu token vào localStorage nếu "Ghi nhớ mật khẩu" được chọn
         if (rememberMe) {
            localStorage.setItem('token', data.token);
         } else {
            sessionStorage.setItem('token', data.token);
         }

         // Lưu thông tin user
         localStorage.setItem('user', JSON.stringify(data.user));

         // Chuyển hướng đến trang dashboard
         router.push('/seller/dashboard');
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng nhập');
      } finally {
         setLoading(false);
      }
   };

   // Validate on input change
   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      if (value) validateEmail(value);
   };

   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);
      if (value) validatePassword(value);
   };

   return (
      <div className='min-h-screen bg-[#f5f2eb] flex flex-col'>
         <Head>
            <title>Đăng nhập - Candel Bliss</title>
            <link rel='icon' href='/favicon.ico' />
         </Head>

         {/* Header */}
         <header className='bg-[#f5f2eb] border-b border-amber-200'>
            <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
               <div className='flex items-center'>
                  <Image
                     src={'/images/logoCoChu.png'}
                     alt='Candle Bliss Logo'
                     height={62}
                     width={253}
                     className='cursor-pointer'
                  />
               </div>
               <div>
                  <span className='text-amber-800'>Doanh Nghiệp</span>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <main className='flex-1 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg p-8 w-full max-w-md border border-amber-200'>
               <div className='flex justify-center mb-8'>
                  <div className='text-center'>
                     <div className='flex items-center justify-center'>
                        <Image
                           src={'/images/logoCoChu.png'}
                           alt='Candle Bliss Logo'
                           height={62}
                           width={253}
                           className='cursor-pointer'
                        />
                     </div>
                  </div>
               </div>

               {error && (
                  <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
                     {error}
                  </div>
               )}

               <form onSubmit={handleSubmit}>
                  <div className='mb-4'>
                     <label htmlFor='email' className='block text-gray-700 mb-1'>
                        Email
                     </label>
                     <input
                        type='email'
                        id='email'
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                           emailError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder='johndo@gmail.com'
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={loading}
                     />
                     {emailError && (
                        <p className='mt-1 text-sm text-red-500'>{emailError}</p>
                     )}
                  </div>
                  <div className='mb-4 relative'>
                     <div className='flex justify-between items-center mb-1'>
                        <label htmlFor='password' className='block text-gray-700'>
                           Mật Khẩu
                        </label>
                        <Link
                           href='/forgot-password'
                           className='text-xs text-gray-600 hover:text-amber-800'
                        >
                           Quên mật khẩu?
                        </Link>
                     </div>
                     <div className='relative'>
                        <input
                           type={showPassword ? 'text' : 'password'}
                           id='password'
                           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              passwordError ? 'border-red-500' : 'border-gray-300'
                           }`}
                           placeholder='••••••••••'
                           value={password}
                           onChange={handlePasswordChange}
                           required
                           disabled={loading}
                        />
                        <button
                           type='button'
                           className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500'
                           onClick={togglePasswordVisibility}
                        >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                     {passwordError && (
                        <p className='mt-1 text-sm text-red-500'>{passwordError}</p>
                     )}
                  </div>
                  <div className='mb-6'>
                     <label className='flex items-center'>
                        <input
                           type='checkbox'
                           className='rounded border-gray-300 text-amber-800 focus:ring-amber-500 h-4 w-4'
                           checked={rememberMe}
                           onChange={() => setRememberMe(!rememberMe)}
                           disabled={loading}
                        />
                        <span className='ml-2 text-sm text-gray-700'>Ghi nhớ mật khẩu</span>
                     </label>
                  </div>
                  <button
                     type='submit'
                     className='w-full bg-amber-800 text-white py-2 px-4 rounded-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
                     disabled={loading || !!emailError || !!passwordError}
                  >
                     {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
               </form>
            </div>
         </main>
      </div>
   );
}
