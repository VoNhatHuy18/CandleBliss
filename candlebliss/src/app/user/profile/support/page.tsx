"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'policy'>('faq');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simulate form submission
        setSubmitStatus('success');

        // Reset form after submission
        setTimeout(() => {
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setSubmitStatus(null);
        }, 3000);
    };

    return (
        <div className="bg-[#F1EEE9] min-h-screen flex flex-col">
            <Header />

            {/* Breadcrumb navigation */}
            <div className='container mx-auto px-4 pt-4 pb-2'>
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/user/home" className="inline-flex items-center text-sm text-gray-700 hover:text-orange-600">
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
                                <Link href="/user/profile" className="ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2">
                                    Tài khoản
                                </Link>
                            </div>
                        </li>

                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Hỗ trợ</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <h1 className="text-3xl font-medium mb-6">Trung tâm hỗ trợ</h1>

                {/* Tab navigation */}
                <div className="mb-6 border-b border-gray-200">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('faq')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'faq'
                                    ? 'text-orange-600 border-orange-600'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            >
                                Câu hỏi thường gặp
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'contact'
                                    ? 'text-orange-600 border-orange-600'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            >
                                Liên hệ hỗ trợ
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                onClick={() => setActiveTab('policy')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'policy'
                                    ? 'text-orange-600 border-orange-600'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                            >
                                Chính sách & Điều khoản
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div>
                            <h2 className="text-xl font-medium mb-4">Câu hỏi thường gặp</h2>

                            <div className="space-y-4">
                                {/* FAQ Items */}
                                <details className="group border-b pb-4">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                        <span>Làm thế nào để đặt hàng?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                        Để đặt hàng trên CandleBliss, bạn chỉ cần chọn sản phẩm yêu thích, thêm vào giỏ hàng và tiến hành thanh toán.
                                        Bạn có thể thanh toán bằng nhiều phương thức khác nhau như thẻ tín dụng, chuyển khoản ngân hàng hoặc thanh toán khi nhận hàng (COD).
                                    </p>
                                </details>

                                <details className="group border-b pb-4">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                        <span>Chính sách đổi trả hàng như thế nào?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                        CandleBliss chấp nhận đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi, hư hỏng hoặc không đúng mô tả.
                                        Sản phẩm đổi trả phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ bao bì, nhãn mác ban đầu.
                                    </p>
                                </details>

                                <details className="group border-b pb-4">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                        <span>Thời gian giao hàng mất bao lâu?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                        Thời gian giao hàng phụ thuộc vào địa chỉ nhận hàng của bạn. Đối với các khu vực nội thành, thời gian giao hàng thường từ 1-3 ngày làm việc.
                                        Đối với các khu vực ngoại thành và tỉnh thành khác, thời gian giao hàng có thể từ 3-7 ngày làm việc.
                                    </p>
                                </details>

                                <details className="group border-b pb-4">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                        <span>Làm thế nào để theo dõi đơn hàng?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                        Bạn có thể theo dõi đơn hàng của mình bằng cách đăng nhập vào tài khoản và truy cập mục Đơn hàng của tôi.
                                        Tại đây, bạn sẽ thấy thông tin chi tiết về trạng thái đơn hàng và quá trình vận chuyển.
                                    </p>
                                </details>

                                <details className="group pb-4">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                                        <span>Tôi quên mật khẩu đăng nhập thì phải làm sao?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </span>
                                    </summary>
                                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                                        Nếu bạn quên mật khẩu, bạn có thể sử dụng chức năng Quên mật khẩu trên trang đăng nhập.
                                        Hệ thống sẽ gửi cho bạn một email với hướng dẫn cách đặt lại mật khẩu mới. Nếu bạn không nhận được email,
                                        vui lòng kiểm tra thư mục spam hoặc liên hệ trực tiếp với bộ phận hỗ trợ khách hàng.
                                    </p>
                                </details>
                            </div>
                        </div>
                    )}

                    {/* Contact Support Tab */}
                    {activeTab === 'contact' && (
                        <div>
                            <h2 className="text-xl font-medium mb-4">Liên hệ hỗ trợ</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Họ tên</label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                                placeholder="Nguyễn Văn A"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                                placeholder="example@email.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">Chủ đề</label>
                                            <input
                                                type="text"
                                                id="subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                                placeholder="Tiêu đề yêu cầu hỗ trợ"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">Nội dung</label>
                                            <textarea
                                                id="message"
                                                rows={4}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                                                placeholder="Mô tả chi tiết vấn đề của bạn..."
                                                required
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                        >
                                            Gửi yêu cầu
                                        </button>

                                        {submitStatus === 'success' && (
                                            <div className="p-4 mt-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                                                Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!
                                            </div>
                                        )}

                                        {submitStatus === 'error' && (
                                            <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                                                Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau!
                                            </div>
                                        )}
                                    </form>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-4">Thông tin liên hệ</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-6 w-6 text-orange-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 text-base">
                                                <p className="font-medium text-gray-900">Địa chỉ</p>
                                                <p className="mt-1 text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-6 w-6 text-orange-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 text-base">
                                                <p className="font-medium text-gray-900">Số điện thoại</p>
                                                <p className="mt-1 text-gray-600">+84 28 1234 5678</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-6 w-6 text-orange-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 text-base">
                                                <p className="font-medium text-gray-900">Email</p>
                                                <p className="mt-1 text-gray-600">support@candlebliss.vn</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-6 w-6 text-orange-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 text-base">
                                                <p className="font-medium text-gray-900">Giờ làm việc</p>
                                                <p className="mt-1 text-gray-600">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                                                <p className="mt-1 text-gray-600">Thứ 7: 9:00 - 12:00</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium mb-4">Mạng xã hội</h3>
                                        <div className="flex space-x-4">
                                            <a href="#" className="text-gray-600 hover:text-orange-600">
                                                <span className="sr-only">Facebook</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">
                                                <span className="sr-only">Instagram</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">
                                                <span className="sr-only">Twitter</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                </svg>
                                            </a>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">
                                                <span className="sr-only">YouTube</span>
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Policies Tab */}
                    {activeTab === 'policy' && (
                        <div>
                            <h2 className="text-xl font-medium mb-4">Chính sách & Điều khoản</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Chính sách đổi trả</h3>
                                    <p className="text-gray-600 mb-4">
                                        CandleBliss cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng. Chúng tôi chấp nhận đổi trả sản phẩm trong các trường hợp sau:
                                    </p>
                                    <ul className="list-disc pl-5 text-gray-600">
                                        <li className="mb-2">Sản phẩm bị lỗi, hư hỏng do nhà sản xuất.</li>
                                        <li className="mb-2">Sản phẩm không đúng với mô tả hoặc hình ảnh trên website.</li>
                                        <li className="mb-2">Sản phẩm được gửi không đúng với đơn đặt hàng.</li>
                                        <li>Thời gian áp dụng đổi trả: trong vòng 7 ngày kể từ ngày nhận hàng.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Chính sách bảo mật</h3>
                                    <p className="text-gray-600 mb-4">
                                        CandleBliss cam kết bảo vệ thông tin cá nhân của khách hàng và tuân thủ các quy định pháp luật về bảo mật thông tin. Chúng tôi thu thập, sử dụng và bảo vệ thông tin của khách hàng như sau:
                                    </p>
                                    <ul className="list-disc pl-5 text-gray-600">
                                        <li className="mb-2">Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và nâng cao trải nghiệm mua sắm.</li>
                                        <li className="mb-2">Thông tin cá nhân của khách hàng sẽ được bảo mật và không chia sẻ cho bên thứ ba nếu không có sự đồng ý của khách hàng.</li>
                                        <li className="mb-2">Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của khách hàng.</li>
                                        <li>Khách hàng có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Điều khoản sử dụng</h3>
                                    <p className="text-gray-600 mb-4">
                                        Khi sử dụng website CandleBliss, khách hàng đồng ý với các điều khoản sau:
                                    </p>
                                    <ul className="list-disc pl-5 text-gray-600">
                                        <li className="mb-2">Khách hàng phải cung cấp thông tin chính xác khi đăng ký tài khoản và đặt hàng.</li>
                                        <li className="mb-2">Khách hàng không được sử dụng website cho các mục đích bất hợp pháp hoặc gây hại.</li>
                                        <li className="mb-2">Nội dung và hình ảnh trên website thuộc quyền sở hữu của CandleBliss và không được sao chép, sử dụng nếu không có sự cho phép.</li>
                                        <li>CandleBliss có quyền thay đổi các điều khoản sử dụng mà không cần thông báo trước.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">Phương thức thanh toán</h3>
                                    <p className="text-gray-600 mb-4">
                                        CandleBliss chấp nhận nhiều phương thức thanh toán khác nhau để tạo thuận lợi cho khách hàng:
                                    </p>
                                    <ul className="list-disc pl-5 text-gray-600">
                                        <li className="mb-2">Thanh toán khi nhận hàng (COD)</li>
                                        <li className="mb-2">Chuyển khoản ngân hàng</li>
                                        <li className="mb-2">Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)</li>
                                        <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}