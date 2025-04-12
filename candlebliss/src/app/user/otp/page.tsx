'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Image from 'next/image';

// Loading component
const LoadingSpinner = () => (
   <div className='flex justify-center items-center p-4'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#553C26]'></div>
   </div>
);

// Search params handler component
function EmailFromParams({ onEmailLoaded }: { onEmailLoaded: (email: string) => void }) {
   const searchParams = useSearchParams();
   const email = searchParams.get('email') || '';

   useEffect(() => {
      onEmailLoaded(email);
   }, [email, onEmailLoaded]);

   return null;
}

// Main OTP component
function OTPContent({ email }: { email: string }) {
   const [otp, setOtp] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');

   const handleVerifyOTP = async () => {
      setLoading(true);
      setError('');
      setMessage('');

      try {
         const res = await fetch('/api/v1/auth/email/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
         });

         const data = await res.json();
         if (!res.ok) throw new Error(data.message || 'Xác thực thất bại');

         setMessage('Xác thực thành công! Đang chuyển hướng...');
         setTimeout(() => {
            window.location.href = '/dashboard'; // Chuyển hướng sau khi xác thực thành công
         }, 2000);
      } catch (err) {
         if (err instanceof Error) {
            setError(err.message);
         } else {
            setError('An unknown error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div
         className='min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center md:justify-end md:pr-60 p-4'
         style={{ backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")` }}
      >
         <div className='bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-sm md:max-w-lg'>
            <h2 className='text-2xl font-bold mb-6 text-center text-[#553C26]'>Xác thực OTP</h2>

            {message && <p className='text-green-600 text-center mb-4'>{message}</p>}
            {error && <p className='text-red-600 text-center mb-4'>{error}</p>}

            <div className='mb-4'>
               <label htmlFor='otp' className='block text-[#553C26] mb-2 text-base font-medium'>
                  Nhập mã xác thực (OTP)
               </label>
               <input
                  type='text'
                  id='otp'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg border-[#553C26]'
                  placeholder='Nhập mã OTP'
               />
            </div>

            <button
               onClick={handleVerifyOTP}
               className='w-full bg-[#553C26] text-white py-2 mb-2 rounded-lg hover:bg-[#3e2b1a] disabled:opacity-50'
               disabled={loading}
            >
               {loading ? 'Đang xác thực...' : 'Xác nhận'}
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
   );
}

// Main component that uses Suspense
export default function OTPPage() {
   const [userEmail, setUserEmail] = useState('');

   return (
      <div>
         <Suspense fallback={<LoadingSpinner />}>
            <NavBar />
         </Suspense>
         <hr className='border-b-2 border-b-[#F1EEE9]' />

         {/* Use Suspense boundary for the component that uses useSearchParams */}
         <Suspense fallback={<LoadingSpinner />}>
            <EmailFromParams onEmailLoaded={setUserEmail} />
         </Suspense>

         <OTPContent email={userEmail} />

         <Suspense fallback={<LoadingSpinner />}>
            <Footer />
         </Suspense>
      </div>
   );
}
