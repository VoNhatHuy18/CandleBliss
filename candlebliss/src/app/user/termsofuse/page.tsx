"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

export default function TermsOfUsePage() {
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
                                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Điều khoản sử dụng</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-medium mb-6">Điều khoản sử dụng</h1>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-600">
                                Cập nhật lần cuối: 28/04/2025
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">1. Giới thiệu</h2>
                            <p className="text-gray-700 mb-4">
                                Chào mừng bạn đến với CandleBliss của chúng tôi. Khi bạn truy cập vào trang web của chúng tôi tại https://candlebliss.vn, và sử dụng các dịch vụ của chúng tôi, bạn đồng ý tuân thủ những điều khoản và điều kiện sau đây, bao gồm cả những điều khoản và điều kiện bổ sung và các chính sách được tham chiếu ở đây và/hoặc có sẵn qua hyperlink. Những Điều khoản sử dụng này áp dụng cho tất cả người dùng trang web, bao gồm nhưng không giới hạn, người dùng là khách hàng, người dùng là người bán hoặc nhà cung cấp nội dung.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Vui lòng đọc kỹ Điều khoản sử dụng này trước khi truy cập hoặc sử dụng trang web của chúng tôi. Bằng việc truy cập hoặc sử dụng bất kỳ phần nào của trang web, bạn đồng ý chịu sự ràng buộc của những Điều khoản sử dụng này. Nếu bạn không đồng ý với tất cả các điều khoản và điều kiện của thỏa thuận này, bạn không thể truy cập trang web hoặc sử dụng bất kỳ dịch vụ nào.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">2. Điều khoản mua hàng</h2>
                            <p className="text-gray-700 mb-4">
                                Bằng cách đặt hàng với chúng tôi, bạn đang xác nhận rằng bạn đã đọc, hiểu và đồng ý với những điều khoản được nêu trong tài liệu này.
                            </p>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.1 Đủ tuổi để mua hàng</h3>
                            <p className="text-gray-700 mb-4">
                                Bạn phải ít nhất 18 tuổi để mua hàng từ trang web này. Nếu bạn dưới 18 tuổi, bạn có thể sử dụng trang web này chỉ với sự tham gia của cha mẹ hoặc người giám hộ.
                            </p>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.2 Giá cả và thanh toán</h3>
                            <p className="text-gray-700 mb-4">
                                Tất cả giá sản phẩm được hiển thị trên trang web của chúng tôi đều bao gồm thuế VAT (nếu có) và được tính bằng đồng Việt Nam (VND). Chúng tôi có quyền thay đổi giá sản phẩm bất kỳ lúc nào mà không cần thông báo trước. Bất kỳ thay đổi nào sẽ không ảnh hưởng đến các đơn hàng mà chúng tôi đã xác nhận.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Chúng tôi chấp nhận các phương thức thanh toán sau:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Thanh toán khi nhận hàng (COD)</li>
                                <li>Chuyển khoản ngân hàng</li>
                                <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)</li>
                                <li>Ví điện tử (MoMo, ZaloPay, VNPay)</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-6 mb-2">2.3 Đơn hàng và xác nhận</h3>
                            <p className="text-gray-700 mb-4">
                                Sau khi bạn đặt hàng, chúng tôi sẽ gửi email xác nhận đơn hàng cho bạn. Email này sẽ bao gồm chi tiết đơn hàng và tổng số tiền phải thanh toán. Việc chúng tôi chấp nhận đơn đặt hàng của bạn chỉ xảy ra khi chúng tôi gửi email xác nhận đơn hàng.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Chúng tôi có quyền từ chối hoặc hủy bỏ đơn đặt hàng của bạn vì bất kỳ lý do gì vào bất kỳ lúc nào. Một số tình huống có thể dẫn đến việc đơn hàng của bạn bị hủy bao gồm, nhưng không giới hạn ở:
                            </p>

                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Sản phẩm không có sẵn</li>
                                <li>Lỗi trong mô tả hoặc giá sản phẩm</li>
                                <li>Lỗi trong đơn đặt hàng của bạn</li>
                                <li>Nghi ngờ gian lận hoặc đơn hàng trái phép</li>
                            </ul>

                            <h2 className="text-xl font-medium mt-8 mb-4">3. Tài khoản người dùng</h2>
                            <p className="text-gray-700 mb-4">
                                Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật mọi lúc. Việc không làm như vậy sẽ cấu thành vi phạm Điều khoản sử dụng, có thể dẫn đến chấm dứt tài khoản của bạn trên trang web của chúng tôi ngay lập tức.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Bạn có trách nhiệm bảo mật mật khẩu đã chọn để truy cập và sử dụng trang web và tất cả các hoạt động xảy ra dưới tài khoản của bạn. Bạn đồng ý thông báo cho chúng tôi ngay lập tức về bất kỳ vi phạm bảo mật hoặc sử dụng trái phép tài khoản của bạn.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">4. Quyền sở hữu trí tuệ</h2>
                            <p className="text-gray-700 mb-4">
                                Trang web và tất cả nội dung, tính năng và chức năng của nó (bao gồm nhưng không giới hạn ở tất cả thông tin, phần mềm, văn bản, hiển thị, hình ảnh, video và âm thanh, cũng như thiết kế, lựa chọn và sắp xếp) là tài sản của CandleBliss, các bên cấp phép hoặc các nhà cung cấp nội dung khác và được bảo vệ bởi các luật sở hữu trí tuệ Việt Nam và quốc tế.
                            </p>

                            <p className="text-gray-700 mb-4">
                                Bạn không được sao chép, sửa đổi, phân phối, bán, cho thuê, cho mượn, thực hiện công khai, truyền, xuất bản, điều chỉnh, chỉnh sửa, biên dịch hoặc tạo ra các tác phẩm phái sinh dựa trên bất kỳ tài liệu nào từ trang web mà không có sự cho phép trước bằng văn bản từ CandleBliss.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">5. Chính sách đổi trả và hoàn tiền</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi mong muốn bạn hoàn toàn hài lòng với mua hàng của mình. Nếu vì bất kỳ lý do gì bạn không hoàn toàn hài lòng, chúng tôi chấp nhận đổi trả và hoàn tiền theo các điều kiện sau:
                            </p>

                            <h3 className="text-lg font-medium mt-6 mb-2">5.1 Điều kiện đổi trả</h3>
                            <ul className="list-disc pl-5 text-gray-700 mb-4">
                                <li>Sản phẩm phải được trả lại trong vòng 7 ngày kể từ ngày nhận hàng</li>
                                <li>Sản phẩm phải còn nguyên trạng, chưa được sử dụng và còn nguyên bao bì</li>
                                <li>Phải có hóa đơn mua hàng hoặc bằng chứng mua hàng</li>
                                <li>Sản phẩm khuyến mãi, giảm giá đặc biệt có thể không được áp dụng đổi trả</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-6 mb-2">5.2 Quy trình đổi trả</h3>
                            <p className="text-gray-700 mb-4">
                                Để tiến hành đổi trả, vui lòng liên hệ với bộ phận Chăm sóc Khách hàng của chúng tôi qua email support@candlebliss.vn hoặc số điện thoại 1900 xxxx để được hướng dẫn chi tiết về quy trình đổi trả.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">6. Giới hạn trách nhiệm</h2>
                            <p className="text-gray-700 mb-4">
                                Trong mọi trường hợp, CandleBliss, các giám đốc, nhân viên, đối tác, đại lý, nhà cung cấp hoặc các bên liên kết của chúng tôi sẽ không chịu trách nhiệm pháp lý đối với bất kỳ thiệt hại nào (bao gồm, nhưng không giới hạn ở, thiệt hại do mất dữ liệu hoặc lợi nhuận, hoặc do gián đoạn kinh doanh) phát sinh từ việc sử dụng hoặc không thể sử dụng các tài liệu trên trang web của chúng tôi, ngay cả khi CandleBliss hoặc đại diện được ủy quyền của CandleBliss đã được thông báo bằng miệng hoặc bằng văn bản về khả năng xảy ra thiệt hại đó.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">7. Luật áp dụng và giải quyết tranh chấp</h2>
                            <p className="text-gray-700 mb-4">
                                Các Điều khoản sử dụng này sẽ được điều chỉnh và giải thích theo luật pháp của Việt Nam, mà không tính đến xung đột các quy định pháp luật. Bất kỳ hành động pháp lý hoặc thủ tục tố tụng nào phát sinh từ, hoặc liên quan đến, các Điều khoản này hoặc trang web này sẽ được đưa ra độc quyền tại tòa án có thẩm quyền tại Việt Nam.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">8. Thay đổi điều khoản sử dụng</h2>
                            <p className="text-gray-700 mb-4">
                                Chúng tôi có quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều khoản này bất cứ lúc nào. Nếu sửa đổi là quan trọng, chúng tôi sẽ cố gắng thông báo trước ít nhất 30 ngày trước khi bất kỳ điều khoản mới có hiệu lực. Việc bạn tiếp tục truy cập hoặc sử dụng trang web của chúng tôi sau khi những sửa đổi có hiệu lực đồng nghĩa với việc bạn đồng ý bị ràng buộc bởi các điều khoản đã sửa đổi.
                            </p>

                            <h2 className="text-xl font-medium mt-8 mb-4">9. Liên hệ</h2>
                            <p className="text-gray-700 mb-4">
                                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
                            </p>

                            <ul className="list-none pl-0 text-gray-700 mb-4">
                                <li><strong>CandleBliss</strong></li>
                                <li>Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
                                <li>Email: legal@candlebliss.vn</li>
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