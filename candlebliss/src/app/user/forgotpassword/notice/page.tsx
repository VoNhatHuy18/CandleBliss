"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

// Tạo component riêng để sử dụng useSearchParams
function EmailNoticeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'địa chỉ email của bạn';

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
                <div className="mx-auto mb-4 rounded-full bg-orange-100 p-3 w-16 h-16 flex items-center justify-center">
                    <svg className="h-10 w-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <h2 className="text-2xl font-semibold mb-4">Kiểm tra email của bạn</h2>

                <div className="mb-6 text-gray-600 space-y-4">
                    <p>
                        Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <span className="font-medium text-gray-900">{email}</span>.
                    </p>
                    <p>
                        Vui lòng kiểm tra hộp thư đến và nhấp vào liên kết Đặt lại mật khẩu trong email để tiếp tục.
                    </p>
                    <div className="border-l-4 border-orange-200 bg-orange-50 p-4 text-sm text-left">
                        <p>
                            <span className="font-medium">Lưu ý:</span> Liên kết đặt lại mật khẩu chỉ có hiệu lực trong 24 giờ. Nếu bạn không thấy email trong hộp thư đến, vui lòng kiểm tra thư mục Spam hoặc Thư rác.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                    <button
                        onClick={() => window.location.href = "https://yopmail.com/en/wm"}
                        className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        Mở Gmail
                    </button>
                    <Link href="/user/login" className="inline-flex justify-center items-center px-4 py-2 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors">
                        Đến trang đăng nhập
                    </Link>
                    <Link href="/" className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Fallback component khi đang loading
function LoadingState() {
    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
                <div className="mx-auto mb-4 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
                <h2 className="text-xl font-semibold mb-4">Đang tải...</h2>
            </div>
        </div>
    );
}

export default function ForgotPasswordNoticePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <hr className='border-b-2 border-b-[#F1EEE9]' />

            <div className="flex-grow bg-[#F1EEE9] px-4 py-8">
                <div className="container mx-auto">
                    {/* Breadcrumb navigation */}
                    <nav className="flex mb-6" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="inline-flex items-center text-sm text-gray-700 hover:text-orange-600">
                                    <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                                    </svg>
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                    </svg>
                                    <Link href="/user/forgotpassword" className="ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2">Quên mật khẩu</Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                    </svg>
                                    <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Kiểm tra email</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    {/* Bọc phần sử dụng useSearchParams trong Suspense */}
                    <Suspense fallback={<LoadingState />}>
                        <EmailNoticeContent />
                    </Suspense>
                </div>
            </div>

            <Footer />
        </div>
    );
}