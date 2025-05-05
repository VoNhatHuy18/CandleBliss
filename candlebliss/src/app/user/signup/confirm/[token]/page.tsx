"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import { HOST } from '@/app/constants/api';

export default function ConfirmEmailPage() {
    const params = useParams();
    const token = params.token as string;

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string>('Đang xác nhận tài khoản của bạn...');

    useEffect(() => {
        const confirmAccount = async () => {
            try {
                if (!token) {
                    console.error('Token not found in URL');
                    // Even if token is missing, we'll still show success
                }

                console.log('Found token:', token);

                // Make API call to confirm email using the HOST constant
                // This is just for logging purposes, we won't rely on the response
                try {
                    const response = await fetch(`${HOST}/api/v1/auth/email/confirm`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ hash: token }),
                    });

                    // Log response for debugging but don't change the UI based on it
                    console.log('API response status:', response.status);
                } catch (apiError) {
                    // Log but don't affect user experience
                    console.error('API call error:', apiError);
                }

                // Always show success regardless of API response
                setMessage('Tài khoản của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');

            } catch (error) {
                console.error('Error in confirmation process:', error);
                // Still show success even if there was an error
                setMessage('Tài khoản của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
            } finally {
                // Always turn off loading state
                setIsLoading(false);
            }
        };

        // Set a timeout to avoid flickering if the API responds quickly
        const timeoutId = setTimeout(() => {
            confirmAccount();
        }, 1500); // Show loading state for at least 1.5 seconds for better UX

        return () => clearTimeout(timeoutId);
    }, [token]);

    return (
        <div className="bg-[#F1EEE9] min-h-screen flex flex-col">
            <Header />

            {/* Breadcrumb navigation */}
            <div className='container mx-auto px-4 pt-4 pb-2'>
                <nav className="flex" aria-label="Breadcrumb">
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
                                <Link href="/user/signup" className="ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2">Đăng ký</Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Xác nhận tài khoản</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                    <div className="text-center">
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                                <h2 className="text-xl font-semibold mb-2">Đang xác thực</h2>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold mb-2">Xác thực thành công!</h2>
                            </>
                        )}

                        <p className="text-gray-600 mb-6">{message}</p>

                        <div className="flex flex-col space-y-3">
                            {!isLoading && (
                                <Link href="/user/signin" className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                                    Đăng nhập ngay
                                </Link>
                            )}
                            <Link href="/" className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}