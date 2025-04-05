'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  // Redirect to home page on component mount
  useEffect(() => {
    router.push('/user/home');
  }, [router]);
  
  // Show a brief loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F1EEE9]">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-700 border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
        <h2 className="text-xl font-medium text-gray-700">Đang chuyển hướng đến trang chủ...</h2>
      </div>
    </div>
  );
}