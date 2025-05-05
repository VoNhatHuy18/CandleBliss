'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon } from 'lucide-react';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import { HOST } from '@/app/constants/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const token = params.token as string;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error states
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Loading state
    const [isResetting, setIsResetting] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    // Password visibility states
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Regular expression for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Validation functions
    const validatePassword = (value: string) => {
        setNewPassword(value);
        if (!value) {
            setPasswordError('Mật khẩu không được để trống');
            return false;
        } else if (!passwordRegex.test(value)) {
            setPasswordError(
                'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
            );
            return false;
        } else {
            setPasswordError('');
            return true;
        }
    };

    const validateConfirmPassword = (value: string) => {
        setConfirmPassword(value);
        if (!value) {
            setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
            return false;
        } else if (value !== newPassword) {
            setConfirmPasswordError('Mật khẩu xác nhận không khớp');
            return false;
        } else {
            setConfirmPasswordError('');
            return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isPasswordValid = validatePassword(newPassword);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

        if (!isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        setIsResetting(true);

        try {
            const response = await fetch(`${HOST}/api/v1/auth/reset/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: newPassword,
                    hash: token
                }),
            });

            // Safely parse response
            let data;
            try {
                const responseText = await response.text();
                if (responseText) {
                    data = JSON.parse(responseText);
                }
            } catch (err) {
                console.error('JSON parse error:', err);
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Không thể đặt lại mật khẩu');
            }

            // Success - show message and redirect
            setToast({
                show: true,
                message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.',
                type: 'success',
            });

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                router.push('/user/login');
            }, 2000);
        } catch (error: unknown) {
            console.error('Password reset error:', error);

            let errorMessage = 'Không thể đặt lại mật khẩu, vui lòng thử lại sau.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setToast({
                show: true,
                message: errorMessage,
                type: 'error',
            });
        } finally {
            setIsResetting(false);
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
                                    <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Đặt lại mật khẩu</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className='max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
                        <h1 className='text-2xl font-semibold text-[#553C26] mb-6 text-center'>
                            Đặt lại mật khẩu
                        </h1>

                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* New Password Field */}
                            <div>
                                <label className='block text-[#553C26] font-medium mb-2'>Mật khẩu mới</label>
                                <div className='relative'>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder='Nhập mật khẩu mới'
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                                        value={newPassword}
                                        onChange={(e) => validatePassword(e.target.value)}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2'
                                    >
                                        <EyeIcon className='h-5 w-5 text-gray-500' />
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className='text-red-500 text-sm mt-1'>{passwordError}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className='block text-[#553C26] font-medium mb-2'>Nhập lại mật khẩu</label>
                                <div className='relative'>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder='Nhập lại mật khẩu mới'
                                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                                        value={confirmPassword}
                                        onChange={(e) => validateConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2'
                                    >
                                        <EyeIcon className='h-5 w-5 text-gray-500' />
                                    </button>
                                </div>
                                {confirmPasswordError && (
                                    <p className='text-red-500 text-sm mt-1'>{confirmPasswordError}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                disabled={isResetting}
                                className={`w-full bg-[#553C26] text-white py-3 rounded-lg hover:bg-[#442f1e] transition-colors 
                        ${isResetting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isResetting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/user/signin"
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                >
                                    Quay lại trang đăng nhập
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}