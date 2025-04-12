'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Toast from '@/app/components/ui/toast/Toast';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import AuthService from '@/app/utils/authService';

// Cấu hình chung cho API - dễ dàng thay đổi cổng hoặc domain khi cần
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://68.183.226.198:3000';

export default function SignInPage() {
   const router = useRouter();
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [email, setEmail] = useState<string>('');
   const [password, setPassword] = useState<string>('');
   const [emailError, setEmailError] = useState<string>('');
   const [passwordError, setPasswordError] = useState<string>('');
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [apiError, setApiError] = useState<string>('');
   const [toast, setToast] = useState<{
      show: boolean;
      message: string;
      type: 'success' | 'error' | 'info';
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
   }>({
      show: false,
      message: '',
      type: 'info',
      position: 'top-right',
   });

   // Kiểm tra nếu người dùng đã đăng nhập thì chuyển hướng
   useEffect(() => {
      if (AuthService.isAuthenticated()) {
         router.push('/user/home');
      }
   }, [router]);

   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   // Điều chỉnh yêu cầu mật khẩu nếu cần
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

   // Hàm tiện ích hiển thị Toast
   const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({
         show: true,
         message,
         type,
         position: 'top-right',
      });

      // Tự động ẩn toast sau 5 giây
      setTimeout(() => {
         setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
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
         // Sử dụng proxy qua rewrites
         const response = await fetch(`${API_URL}/api/v1/auth/email/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email,
               password,
            }),
         });

         // Xử lý response
         let data;

         // Kiểm tra nếu response là rỗng hoặc status là 204 No Content
         if (response.status === 204 || response.headers.get('content-length') === '0') {
            data = {};
         } else {
            try {
               // Clone the response before attempting to read it
               const responseClone = response.clone();

               try {
                  data = await response.json();
               } catch (error) {
                  console.error('JSON parsing error:', error);

                  // Now we can safely read as text from the cloned response
                  const textResponse = await responseClone.text();
                  console.log('Response as text:', textResponse);

                  showToastMessage('Lỗi dữ liệu từ server', 'error');
                  throw new Error('Lỗi dữ liệu từ server');
               }
            } catch (error) {
               console.error('Response processing error:', error);
               showToastMessage('Lỗi xử lý phản hồi từ server', 'error');
               throw error;
            }
         }

         // Xử lý các trường hợp lỗi
         if (!response.ok) {
            if (response.status === 401) {
               showToastMessage('Email hoặc mật khẩu không chính xác', 'error');
               setApiError('Email hoặc mật khẩu không chính xác');
            } else if (response.status === 403) {
               showToastMessage('Tài khoản của bạn đã bị khóa', 'error');
               setApiError('Tài khoản của bạn đã bị khóa');
            } else if (response.status === 400) {
               showToastMessage(data?.message || 'Dữ liệu đăng nhập không hợp lệ', 'error');
               setApiError(data?.message || 'Dữ liệu đăng nhập không hợp lệ');
            } else {
               throw new Error(data?.message || 'Đăng nhập thất bại');
            }
            return;
         }

         // Đăng nhập thành công - lưu token
         if (data.token && data.refreshToken) {
            AuthService.setTokens(data.token, data.refreshToken);

            // Nếu API trả về thông tin người dùng, lưu lại
            if (data.user) {
               // Đảm bảo lưu userId
               const userInfo = {
                  ...data.user,
                  id: data.user.id, // Đảm bảo userId được lưu
               };
               AuthService.saveUserInfo(userInfo);

               // Lưu userId vào localStorage để dễ dàng truy cập
               localStorage.setItem('userId', data.user.id.toString());

               console.log('User authenticated successfully with ID:', data.user.id);
            } else {
               // Nếu API không trả về thông tin user, thực hiện request bổ sung để lấy thông tin
               try {
                  // Lấy thông tin user sau khi đăng nhập thành công
                  const userResponse = await fetch('/api/v1/auth/me', {
                     method: 'GET',
                     headers: {
                        Authorization: `Bearer ${data.token}`,
                        'Content-Type': 'application/json',
                     },
                  });

                  if (userResponse.ok) {
                     const userData = await userResponse.json();

                     // Lưu thông tin user vào AuthService
                     AuthService.saveUserInfo(userData);

                     // Lưu userId vào localStorage để dễ dàng truy cập
                     localStorage.setItem('userId', userData.id.toString());

                     console.log('User information retrieved with ID:', userData.id);
                  } else {
                     console.warn('Failed to fetch additional user information');
                  }
               } catch (error) {
                  console.error('Error fetching user details:', error);
               }
            }

            showToastMessage('Đăng nhập thành công!', 'success');

            // Reset form sau khi đăng nhập thành công
            setEmail('');
            setPassword('');

            // Chuyển hướng sau khi đăng nhập thành công
            setTimeout(() => {
               router.push('/user/home');
            }, 1500);
         } else {
            // Trường hợp đặc biệt: Có thể API trả về thành công nhưng không có token
            // (ví dụ: cần xác minh OTP)
            if (response.ok) {
               showToastMessage(
                  data?.message || 'Đăng nhập thành công, cần thêm thông tin xác minh',
                  'success',
               );

               // Xử lý các trường hợp đặc biệt (nếu có)
               if (data.requiresOtp) {
                  // Lưu email để tiện sử dụng trong trang OTP
                  sessionStorage.setItem('verifyEmail', email);
                  router.push('/user/otp');
               }
            } else {
               throw new Error('Token không hợp lệ từ server');
            }
         }
      } catch (error: unknown) {
         const errorMessage =
            error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại sau.';

         console.error('Login error:', error);

         // Kiểm tra lỗi CORS cụ thể
         if (
            errorMessage &&
            (errorMessage.includes('Failed to fetch') ||
               errorMessage.includes('NetworkError') ||
               errorMessage.includes('CORS'))
         ) {
            showToastMessage(
               'Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.',
               'error',
            );
         } else {
            showToastMessage(errorMessage, 'error');
         }

         setApiError(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   // Đăng nhập với Google
   const handleGoogleLogin = async () => {
      try {
         // Mở cửa sổ mới để tránh vấn đề CORS với OAuth redirect
         window.location.href = `${API_URL}/api/v1/auth/google`;
      } catch (error) {
         console.error('Google login error:', error);
         showToastMessage('Đăng nhập bằng Google thất bại', 'error');
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

            {/* Form đăng nhập */}
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
                        disabled={isLoading}
                        className='w-full bg-[#553C26] text-white py-2 mb-2 rounded-lg hover:bg-[#3e2b1a] disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center'
                     >
                        {isLoading ? (
                           <>
                              <svg
                                 className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
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
                           'Đăng Nhập'
                        )}
                     </button>
                     {apiError && (
                        <p className='text-red-500 text-sm text-center mb-3'>{apiError}</p>
                     )}

                     <div className='flex items-center'>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                        <div className='mx-2'>
                           <Image
                              src='/images/logo.png'
                              alt='Candle Bliss Logo'
                              className='h-10'
                              width={40}
                              height={40}
                           />
                        </div>
                        <div className='flex-grow border-t border-[#553C26]'></div>
                     </div>
                     <p className='flex justify-center font-paci text-lg text-[#553C26]'>
                        Đăng nhập bằng tài khoản khác
                     </p>
                     <div className='flex justify-center items-center'>
                        <button
                           type='button'
                           onClick={handleGoogleLogin}
                           className='h-10 w-40 flex justify-center items-center my-2 border border-[#553C26] rounded-lg hover:bg-gray-100'
                        >
                           <Image
                              src='/images/google.png'
                              alt='Google login'
                              width={50}
                              height={50}
                           />
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
