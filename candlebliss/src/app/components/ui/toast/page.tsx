'use client';

import { useState, useEffect } from 'react';

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
   position = 'top-right',
}) => {
   const [animation, setAnimation] = useState<'fadeIn' | 'fadeOut' | ''>('');

   useEffect(() => {
      if (show) {
         setAnimation('fadeIn');

         // Auto-hide after duration
         const timer = setTimeout(() => {
            setAnimation('fadeOut');
            setTimeout(onClose, 300); // Đợi animation kết thúc rồi đóng
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

   // Xác định màu nền dựa trên loại thông báo
   const bgColorClass = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
   };

   return (
      <div
         className={`fixed ${positionClasses[position]} z-50 p-4 rounded-lg shadow-lg text-white ${bgColorClass[type]} min-w-[300px] max-w-md flex items-center justify-between ${animation === 'fadeIn' ? 'animate-fadeIn' : 'animate-fadeOut'
            }`}
      >
         <div className="flex-1">
            {message}
         </div>
         <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
            <svg
               className="w-5 h-5"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>

         <style jsx global>{`
            @keyframes fadeIn {
               from { opacity: 0; transform: translateY(-20px); }
               to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
               from { opacity: 1; transform: translateY(0); }
               to { opacity: 0; transform: translateY(-20px); }
            }
            
            .animate-fadeIn {
               animation: fadeIn 0.3s ease-in-out forwards;
            }
            
            .animate-fadeOut {
               animation: fadeOut 0.3s ease-in-out forwards;
            }
         `}</style>
      </div>
   );
};

export default Toast;
