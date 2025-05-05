'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import { HOST } from '@/app/constants/api';

export default function ForgotPasswordPage() {
   const router = useRouter();

   // State for form
   const [email, setEmail] = useState('');
   const [emailError, setEmailError] = useState('');

   // Loading state
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Toast state
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });

   // Email regex
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

   const validateEmail = (value: string) => {
      setEmail(value);
      if (!value) {
         setEmailError('Email không được để trống');
         return false;
      } else if (!emailRegex.test(value)) {
         setEmailError('Email không hợp lệ');
         return false;
      } else {
         setEmailError('');
         return true;
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateEmail(email)) {
         return;
      }

      setIsSubmitting(true);

      try {
         const response = await fetch(`${HOST}/api/v1/auth/forgot/password`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
         });

         // Safely parse response
         let data;
         const responseText = await response.text();

         if (responseText) {
            try {
               data = JSON.parse(responseText);
            } catch (err) {
               console.error('JSON parse error:', err);
            }
         }

         if (response.ok) {
            // Success - redirect to notice page
            router.push(`/user/forgotpassword/notice?email=${encodeURIComponent(email)}`);
         } else {
            // Handle errors
            if (response.status === 404) {
               setToast({
                  show: true,
                  message: 'Email này không tồn tại trong hệ thống. Vui lòng kiểm tra lại.',
                  type: 'error',
               });
            } else {
               const errorMessage = data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.';
               setToast({
                  show: true,
                  message: errorMessage,
                  type: 'error',
               });
            }
         }
      } catch (error) {
         console.error('Password reset request error:', error);
         setToast({
            show: true,
            message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
            type: 'error',
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className='min-h-screen flex flex-col'>
         {/* Toast notification */}
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

         <div
            className='flex-grow bg-cover bg-center bg-no-repeat px-4 py-8 md:py-12'
            style={{
               backgroundImage: `url("https://i.imgur.com/i3IlpOo.png")`,
            }}
         >
            <div className='container mx-auto flex justify-center md:justify-end'>
               <div className='w-full max-w-md md:w-96 md:mr-12 lg:mr-24'>
                  <form
                     className='bg-white p-6 md:p-8 rounded-lg shadow-md w-full'
                     onSubmit={handleSubmit}
                  >
                     <h1 className='text-2xl font-semibold text-[#553C26] mb-6 text-center'>
                        Quên mật khẩu
                     </h1>
                     <div className='space-y-4'>
                        {/* Email Field */}
                        <div>
                           <label className='block text-[#553C26] mb-2'>Email của bạn</label>
                           <input
                              type='email'
                              placeholder='Nhập email'
                              className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                              value={email}
                              onChange={(e) => validateEmail(e.target.value)}
                           />
                           {emailError && <p className='text-red-500 text-sm mt-1'>{emailError}</p>}

                           <p className="mt-2 text-sm text-gray-600">
                              Chúng tôi sẽ gửi một email với hướng dẫn đặt lại mật khẩu đến địa chỉ email của bạn.
                           </p>
                        </div>

                        {/* Submit Button */}
                        <button
                           type='submit'
                           disabled={isSubmitting}
                           className={`w-full bg-[#553C26] text-white py-3 rounded-lg hover:bg-[#442f1e] transition-colors mt-6 
                           ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                           {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận'}
                        </button>

                        <div className="text-center mt-4">
                           <Link
                              href="/user/login"
                              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                           >
                              Quay lại trang đăng nhập
                           </Link>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </div>
         <Footer />
      </div>
   );
}
