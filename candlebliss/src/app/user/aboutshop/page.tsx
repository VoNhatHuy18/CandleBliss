'use client';

import React from 'react';
import Image from 'next/image';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import TrendingCarousel from '@/app/components/user/trendingcarousel/page';

export default function AboutShop() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F1EEE9]">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="relative w-full h-[300px] md:h-[400px] mb-12 rounded-lg overflow-hidden">
                    <Image
                        src="/images/PC1920_1080 (1).png"
                        alt="CandleBliss Shop"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-800/70 to-transparent flex items-center">
                        <div className="px-8 md:px-16">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white">
                                Về CandleBliss
                            </h1>
                            <p className="text-white/90 text-lg md:text-xl max-w-md">
                                Mang ánh sáng ấm áp và hương thơm tinh tế vào không gian sống của bạn
                            </p>
                        </div>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-medium text-amber-900 mb-6 text-center">Câu chuyện của chúng tôi</h2>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="order-2 md:order-1">
                            <p className="text-gray-700 mb-4">
                                CandleBliss ra đời vào năm 2025 với niềm đam mê mang đến những sản phẩm nến thơm thủ công chất lượng cao, thân thiện với môi trường và an toàn cho sức khỏe.
                            </p>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi bắt đầu từ một xưởng sản xuất nhỏ với niềm tin rằng mỗi không gian sống đều xứng đáng được làm ấm áp bởi ánh nến và được bao phủ bởi những hương thơm tự nhiên, tinh tế.
                            </p>
                            <p className="text-gray-700">
                                Từ việc lựa chọn nguyên liệu, sáp ong hữu cơ, tinh dầu thiên nhiên đến thiết kế bao bì thân thiện với môi trường, mỗi bước trong quy trình sản xuất của chúng tôi đều hướng đến sự bền vững và chất lượng.
                            </p>
                        </div>

                        <div className="order-1 md:order-2 relative h-[350px] w-full rounded-lg overflow-hidden">
                            <Image
                                src="/images/Banner.png"
                                alt="Quy trình sản xuất nến thơm CandleBliss"
                                fill
                                className="object-fill"
                            />
                        </div>
                    </div>
                </div>

                {/* Our Values */}
                <div className="mb-16 bg-amber-50 py-12 px-6 rounded-lg">
                    <h2 className="text-2xl md:text-3xl font-medium text-amber-900 mb-10 text-center">Giá trị cốt lõi</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-amber-900 mb-2">Thủ công chất lượng</h3>
                            <p className="text-gray-600">
                                Mỗi sản phẩm đều được chế tác thủ công với sự tỉ mỉ và tâm huyết, đảm bảo chất lượng đồng nhất.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-amber-900 mb-2">Thân thiện môi trường</h3>
                            <p className="text-gray-600">
                                Chúng tôi cam kết sử dụng nguyên liệu tự nhiên, bền vững và bao bì tái chế để bảo vệ môi trường.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-amber-900 mb-2">Trải nghiệm khách hàng</h3>
                            <p className="text-gray-600">
                                Chúng tôi luôn đặt trải nghiệm và sự hài lòng của khách hàng lên hàng đầu trong mọi quyết định.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Our Products */}
                <div className="mb-16">
                    <TrendingCarousel />
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
                    <h2 className="text-2xl md:text-3xl font-medium text-amber-900 mb-6 text-center">Liên hệ với chúng tôi</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-700 mb-6">
                                Nếu bạn có bất kỳ câu hỏi hay đề xuất nào, đừng ngần ngại liên hệ với chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Địa chỉ</h3>
                                        <p className="text-gray-600">12 Nguyễn Văn Bảo, Phường 04, Quận Gò Vấp, Thành phố Hồ Chí Minh, Việt Nam</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Email</h3>
                                        <p className="text-gray-600">info@candlebliss.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">Điện thoại</h3>
                                        <p className="text-gray-600">+84 123 456 789</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-medium text-gray-800 mb-2">Theo dõi chúng tôi</h3>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-200 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-200 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-200 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 hover:bg-amber-200 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}