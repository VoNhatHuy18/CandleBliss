import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function Footer() {
   return (
      <footer className='bg-[#F1EEE9] py-6 md:py-8'>
         <div className='container mx-auto px-4'>
            {/* Grid container with responsive columns */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12'>
               {/* Logo and Description Section */}
               <div className='text-center md:text-left'>
                  <div className='flex justify-center md:justify-start mb-4'>
                     <Image
                        src='/images/logoCoChu.png'
                        alt='Candle Bliss Logo'
                        height={62}
                        width={253}
                        className='h-12 md:h-16 w-auto'
                     />
                  </div>
                  <div className='space-y-2'>
                     <p className='text-[#542700] font-semibold font-mont text-sm md:text-base'>
                        Khám phá thế giới nến thơm tinh tế tại Candel Bliss. Sẽ mang đến các sản phẩm nến chất lượng cao, 
                        an toàn, thân thiện môi trường. Giao hàng toàn quốc - Hỗ trợ 24/7.
                     </p>
                     {/* <p className='text-[#542700] font-semibold font-mont text-sm md:text-base'>
                        Sẽ mang đến các sản phẩm nến chất lượng cao, 
                        an toàn, thân thiện môi trường.
                     </p>
                     <p className='text-[#542700] font-semibold font-mont text-sm md:text-base'>
                        Giúp không gian sống của bạn thêm ấm áp và thư giãn.
                     </p>
                     <p className='text-[#542700] font-semibold font-mont text-sm md:text-base'>
                        Giao hàng toàn quốc - Hỗ trợ 24/7.
                     </p> */}
                  </div>
               </div>

               {/* Categories Section */}
               <div className='text-center md:text-left'>
                  <h4 className='font-semibold text-base font-mont text-[#542700] mb-2'>
                     Danh Mục
                  </h4>
                  <hr className='w-full border-[#542700] mb-4' />
                  <ul className='space-y-2 text-[#542700] text-sm md:text-base font-medium'>
                     {[
                        { href: '', text: 'Trang Chủ' },
                        { href: '', text: 'Sản Phẩm' },
                        { href: '', text: 'Bài Viết' },
                        { href: '', text: 'Liên Hệ' }
                     ].map((item, index) => (
                        <li key={index}>
                           <Link href={item.href} className='hover:text-[#FF9900] transition-colors'>
                              {item.text}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Policies Section */}
               <div className='text-center md:text-left'>
                  <h4 className='font-semibold text-base font-mont text-[#542700] mb-2'>
                     Chính Sách
                  </h4>
                  <hr className='w-full border-[#542700] mb-4' />
                  <ul className='space-y-2 text-[#542700] text-sm md:text-base font-medium'>
                     {[
                        { href: '/user/termsofuse', text: 'Điều khoản sử dụng' },
                        { href: '/user/privacypolicy', text: 'Chính sách bảo mật' },
                        { href: '/user/paymentmethod', text: 'Hình thức thanh toán' },
                        { href: '/exchangepolicy', text: 'Hình thức đổi trả' },
                        { href: '/shipping', text: 'Chính sách vận chuyển' }
                     ].map((item, index) => (
                        <li key={index}>
                           <Link href={item.href} className='hover:text-[#FF9900] transition-colors'>
                              {item.text}
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Contact Information Section */}
               <div className='text-center md:text-left'>
                  <h4 className='font-semibold text-base font-mont text-[#542700] mb-2'>
                     Thông Tin Liên Hệ
                  </h4>
                  <hr className='w-full border-[#542700] mb-4' />
                  <div className='space-y-3 text-[#542700] text-sm md:text-base font-medium'>
                     <p>Email: candlebliss@gmail.com</p>
                     <p>Số điện thoại: 0393877052</p>
                     <p className='break-words'>
                        Địa chỉ: 12 Nguyễn Văn Bảo, Phường 04, 
                        Quận Gò Vấp, Thành phố Hồ Chí Minh, 
                        Việt Nam
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   );
}