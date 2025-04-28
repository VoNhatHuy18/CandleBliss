"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function PrivacyPolicyPage() {
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
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Chính sách bảo mật</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-medium mb-6">Chính sách bảo mật</h1>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-600">
                                Cập nhật lần cuối: 28/04/2025
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">1. Giới thiệu</h2>
                            <p className="text-gray-700 mb-4">
                                CandleBliss của chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân mà bạn chia sẻ với chúng tôi. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ, xử lý và bảo vệ thông tin cá nhân mà bạn cung cấp khi sử dụng trang web của chúng tôi (https://candlebliss.vn) và các dịch vụ liên quan.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Bằng cách truy cập hoặc sử dụng trang web của chúng tôi, bạn đồng ý với việc thu thập và sử dụng thông tin của bạn theo chính sách này. Nếu bạn không đồng ý với chính sách này, vui lòng không sử dụng trang web của chúng tôi.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">2. Thông tin chúng tôi thu thập</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi thu thập thông tin từ bạn khi bạn đăng ký tài khoản, thực hiện mua hàng, đăng ký nhận thông tin cập nhật qua email, tham gia khảo sát, hoặc khi bạn liên hệ với chúng tôi. Thông tin chúng tôi thu thập có thể bao gồm:
                            </p>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.1 Thông tin cá nhân</h3>
                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Họ tên</li>
                                <li>Địa chỉ email</li>
                                <li>Số điện thoại</li>
                                <li>Địa chỉ giao hàng và hóa đơn</li>
                                <li>Thông tin thanh toán (số thẻ tín dụng, tài khoản ngân hàng)</li>
                                <li>Ngày sinh (nếu bạn cung cấp)</li>
                                <li>Giới tính (nếu bạn cung cấp)</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.2 Thông tin tự động</h3>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi cũng tự động thu thập một số thông tin khi bạn truy cập trang web của chúng tôi, bao gồm:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Địa chỉ IP</li>
                                <li>Loại trình duyệt</li>
                                <li>Thiết bị bạn sử dụng để truy cập trang web</li>
                                <li>Thời gian và ngày truy cập</li>
                                <li>Trang bạn đã xem</li>
                                <li>Hành vi mua sắm và lịch sử duyệt web</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.3 Cookies và công nghệ theo dõi</h3>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm của bạn trên trang web của chúng tôi, phân tích cách bạn sử dụng trang web, và cá nhân hóa nội dung và quảng cáo. Bạn có thể kiểm soát việc sử dụng cookies thông qua cài đặt trình duyệt của mình.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">3. Cách chúng tôi sử dụng thông tin của bạn</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Xử lý đơn đặt hàng của bạn và cung cấp các sản phẩm và dịch vụ bạn yêu cầu</li>
                                <li>Thiết lập và quản lý tài khoản của bạn</li>
                                <li>Gửi thông báo về đơn hàng, giao hàng và hỗ trợ</li>
                                <li>Gửi thông tin về sản phẩm, dịch vụ, khuyến mãi mà chúng tôi nghĩ bạn có thể quan tâm</li>
                                <li>Cải thiện trang web và dịch vụ của chúng tôi</li>
                                <li>Tùy chỉnh trải nghiệm của bạn trên trang web</li>
                                <li>Phát hiện và ngăn chặn gian lận</li>
                                <li>Tuân thủ các nghĩa vụ pháp lý của chúng tôi</li>
                            </ul>

                            <h2 className="text-xl font-medium mt-8 mb-4">4. Chia sẻ thông tin của bạn</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho các bên thứ ba mà không có sự đồng ý của bạn, ngoại trừ trong các trường hợp sau:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>
                                    <strong>Đối tác dịch vụ:</strong> Chúng tôi có thể chia sẻ thông tin với các công ty và cá nhân đáng tin cậy thực hiện các dịch vụ thay mặt chúng tôi (như xử lý thanh toán, giao hàng, phân tích dữ liệu, hỗ trợ khách hàng).
                                </li>
                                <li>
                                    <strong>Đối tác kinh doanh:</strong> Chúng tôi có thể chia sẻ thông tin với các đối tác kinh doanh để cung cấp các sản phẩm, dịch vụ hoặc khuyến mãi cho bạn.
                                </li>
                                <li>
                                    <strong>Tuân thủ pháp luật:</strong> Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi pháp luật hoặc nếu chúng tôi tin rằng việc tiết lộ đó là cần thiết để bảo vệ quyền của chúng tôi, bảo vệ an toàn của bạn hoặc người khác, điều tra gian lận, hoặc đáp ứng yêu cầu của chính phủ.
                                </li>
                                <li>
                                    <strong>Chuyển giao kinh doanh:</strong> Trong trường hợp sáp nhập, mua lại hoặc bán tài sản, thông tin của bạn có thể được chuyển giao như một phần của giao dịch đó.
                                </li>
                            </ul>

                            <h2 className="text-xl font-medium mt-8 mb-4">5. Bảo mật thông tin</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, sử dụng, tiết lộ, thay đổi hoặc phá hủy. Tuy nhiên, không có phương thức truyền dữ liệu qua Internet hoặc phương thức lưu trữ điện tử nào là an toàn 100%. Do đó, mặc dù chúng tôi cố gắng sử dụng các phương tiện thương mại chấp nhận được để bảo vệ thông tin của bạn, chúng tôi không thể đảm bảo an ninh tuyệt đối.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">6. Quyền của bạn</h2>
                            <p className="text-gray-700 mb-4">
                                Tùy thuộc vào luật pháp hiện hành, bạn có thể có các quyền sau liên quan đến thông tin cá nhân của mình:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Quyền truy cập và nhận bản sao thông tin cá nhân của bạn</li>
                                <li>Quyền yêu cầu sửa chữa hoặc cập nhật thông tin cá nhân không chính xác</li>
                                <li>Quyền yêu cầu xóa thông tin cá nhân của bạn</li>
                                <li>Quyền hạn chế hoặc phản đối việc xử lý thông tin của bạn</li>
                                <li>Quyền rút lại sự đồng ý của bạn</li>
                                <li>Quyền khiếu nại với cơ quan bảo vệ dữ liệu</li>
                            </ul>

                            <p className="text-gray-700 mb-4">
                                Để thực hiện bất kỳ quyền nào của bạn, vui lòng liên hệ với chúng tôi theo thông tin liên hệ bên dưới.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">7. Lựa chọn tiếp thị</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi có thể gửi cho bạn thông tin về các sản phẩm, dịch vụ, và khuyến mãi mà chúng tôi tin rằng có thể quan trọng với bạn. Bạn có thể chọn không nhận các thông tin tiếp thị này bất cứ lúc nào bằng cách:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Cập nhật tùy chọn liên lạc trong tài khoản của bạn</li>
                                <li>Liên hệ với chúng tôi qua thông tin liên hệ bên dưới</li>
                            </ul>

                            <h2 className="text-xl font-medium mt-8 mb-4">8. Chính sách dành cho trẻ em</h2>
                            <p className="text-gray-700 mb-4">
                                Trang web của chúng tôi không dành cho trẻ em dưới 13 tuổi và chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn là phụ huynh hoặc người giám hộ và tin rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ với chúng tôi để chúng tôi có thể thực hiện các bước cần thiết để xóa thông tin đó.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">9. Liên kết đến trang web khác</h2>
                            <p className="text-gray-700 mb-4">
                                Trang web của chúng tôi có thể chứa các liên kết đến các trang web khác không được điều hành bởi chúng tôi. Nếu bạn nhấp vào liên kết của bên thứ ba, bạn sẽ được chuyển hướng đến trang web của bên thứ ba đó. Chúng tôi khuyên bạn nên xem xét Chính sách Bảo mật của mọi trang web bạn truy cập. Chúng tôi không có quyền kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc thực tiễn của bất kỳ trang web hoặc dịch vụ của bên thứ ba nào.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">10. Thay đổi đối với chính sách bảo mật này</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng Chính sách Bảo mật mới trên trang này và cập nhật ngày Cập nhật lần cuối ở đầu Chính sách Bảo mật này. Bạn nên xem lại Chính sách Bảo mật này định kỳ để cập nhật về các thay đổi.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">11. Liên hệ</h2>
                            <p className="text-gray-700 mb-4">
                                Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này, vui lòng liên hệ với chúng tôi:
                            </p>

                            <ul className="list-none pl-0 text-gray-700 mb-4">
                                <li><strong>CandleBliss</strong></li>
                                <li>Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
                                <li>Email: privacy@candlebliss.vn</li>
                                <li>Điện thoại: 1900 xxxx</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                            Trở về trang chủ
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}