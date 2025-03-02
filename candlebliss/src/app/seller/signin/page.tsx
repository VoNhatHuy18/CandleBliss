'use client';

// pages/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function Login() {
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
   };

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      // Xử lý đăng nhập tại đây
      console.log({ email, password, rememberMe });
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

               <form onSubmit={handleSubmit}>
                  <div className='mb-4'>
                     <label htmlFor='email' className='block text-gray-700 mb-1'>
                        Email
                     </label>
                     <input
                        type='email'
                        id='email'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                        placeholder='johndo@gmail.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
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
                           className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500'
                           placeholder='••••••••••'
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                        />
                        <button
                           type='button'
                           className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500'
                           onClick={togglePasswordVisibility}
                        >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>
                  <div className='mb-6'>
                     <label className='flex items-center'>
                        <input
                           type='checkbox'
                           className='rounded border-gray-300 text-amber-800 focus:ring-amber-500 h-4 w-4'
                           checked={rememberMe}
                           onChange={() => setRememberMe(!rememberMe)}
                        />
                        <span className='ml-2 text-sm text-gray-700'>Ghi nhớ mật khẩu</span>
                     </label>
                  </div>
                  <Link href='/seller/dashboard'>
                     <button
                        type='submit'
                        className='w-full bg-amber-800 text-white py-2 px-4 rounded-md hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
                     >
                        Đăng nhập
                     </button>
                  </Link>
               </form>
            </div>
         </main>
      </div>
   );
}
