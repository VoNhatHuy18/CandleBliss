'use client';
import React, { useEffect, useState } from 'react';

type ToastProps = {
   show: boolean;
   message: string;
   type: 'success' | 'error' | 'info';
   onClose: () => void;
   duration?: number;
   position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
};

const Toast: React.FC<ToastProps> = ({
   show,
   message,
   type,
   onClose,
   duration = 3000,
   position = 'top-right', // Mặc định hiển thị ở góc trên bên phải
}) => {
   const [animation, setAnimation] = useState<'fadeIn' | 'fadeOut' | ''>('');

   useEffect(() => {
      if (show) {
         setAnimation('fadeIn');

         // Auto-hide after duration
         const timer = setTimeout(() => {
            setAnimation('fadeOut');

            // Wait for animation to complete before calling onClose
            setTimeout(() => {
               onClose();
               setAnimation('');
            }, 300);
         }, duration);

         return () => clearTimeout(timer);
      }
   }, [show, duration, onClose]);

   if (!show) return null;

   // Xác định class cho vị trí hiển thị
   const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
   };

   // Xác định animation name dựa trên vị trí
   const animationName = position.startsWith('top') ? 'toastTopAnimation' : 'toastBottomAnimation';

   return (
      <>
         <style jsx global>{`
            @keyframes toastTopAnimation-in {
               0% {
                  opacity: 0;
                  transform: translateY(-10px);
               }
               100% {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes toastTopAnimation-out {
               0% {
                  opacity: 1;
                  transform: translateY(0);
               }
               100% {
                  opacity: 0;
                  transform: translateY(-10px);
               }
            }

            @keyframes toastBottomAnimation-in {
               0% {
                  opacity: 0;
                  transform: translateY(10px);
               }
               100% {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes toastBottomAnimation-out {
               0% {
                  opacity: 1;
                  transform: translateY(0);
               }
               100% {
                  opacity: 0;
                  transform: translateY(10px);
               }
            }
         `}</style>

         <div
            className={`fixed ${
               positionClasses[position]
            } px-6 py-3 rounded-md shadow-lg flex items-center ${
               type === 'success'
                  ? 'bg-green-500 text-white'
                  : type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
            style={{
               zIndex: 1000,
               animation:
                  animation === 'fadeIn'
                     ? `${animationName}-in 0.3s ease-in-out forwards`
                     : animation === 'fadeOut'
                     ? `${animationName}-out 0.3s ease-in-out forwards`
                     : 'none',
            }}
         >
            {type === 'success' && (
               <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     strokeWidth='2'
                     d='M5 13l4 4L19 7'
                  ></path>
               </svg>
            )}
            {type === 'error' && (
               <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     strokeWidth='2'
                     d='M6 18L18 6M6 6l12 12'
                  ></path>
               </svg>
            )}
            {type === 'info' && (
               <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     strokeWidth='2'
                     d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  ></path>
               </svg>
            )}

            <span>{message}</span>

            <button
               className='ml-4 focus:outline-none'
               onClick={() => {
                  setAnimation('fadeOut');
                  setTimeout(onClose, 300);
               }}
            >
               <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
               >
                  <path
                     strokeLinecap='round'
                     strokeLinejoin='round'
                     strokeWidth='2'
                     d='M6 18L18 6M6 6l12 12'
                  ></path>
               </svg>
            </button>
         </div>
      </>
   );
};

export default Toast;
