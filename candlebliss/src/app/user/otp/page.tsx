'use client';
import React from 'react';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Image from 'next/image';

export default function OTPPage() {
   return (
      <div>
         <NavBar />
         <hr className='border-b-2 border-b-[#F1EEE9]' />

         {/* Form đăng ký */}
         <div
            className='min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center md:justify-end md:pr-60 p-4'
            style={{ backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")` }}
         >
            <div className='bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm md:max-w-lg'>
               <h2 className='text-2xl font-bold mb-6 text-center text-[#553C26]'>Đăng Ký</h2>

               <div className='mb-4'>
                  <label
                     htmlFor='otp'
                     className='block text-[#553C26] mb-2 text-base font-medium'
                  >
                     Nhập mã xác thực
                  </label>
                  <input
                     type='text'
                     id='otp'
                     className='w-full px-3 py-2 border rounded-lg border-[#553C26]'
                     placeholder='Nhập mã xác thực'
                  />
               </div>
               <button
                  type='submit'
                  className='w-full bg-[#553C26] text-white py-2 mb-2 rounded-lg hover:bg-[#3e2b1a]'
               >
                  Đăng Ký
               </button>

               <div className='flex items-center my-4'>
                  <div className='flex-grow border-t border-[#553C26]'></div>
                  <div className='mx-2'>
                     <Image
                        src='/images/logo.png'
                        alt='Candle Bliss Logo'
                        width={40}
                        height={40}
                        className='h-10'
                     />
                  </div>
                  <div className='flex-grow border-t border-[#553C26]'></div>
               </div>

               <p className='text-center font-paci text-lg text-[#553C26]'>
                  Đăng nhập bằng tài khoản khác
               </p>
               <div className='flex justify-center items-center mt-4'>
                  <button className='h-10 w-24 md:w-40 flex justify-center items-center border border-[#553C26] rounded-lg'>
                     <Image src='/images/google.png' width={50} height={50} alt='Google Login' />
                  </button>
               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
