'use client';
import React, { Suspense } from 'react'; // Add Suspense import
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/app/components/user/carousel/page';
import AccessoriesCarousel from '@/app/components/user/accessoriescarousel/page';
import TrendingCarousel from '@/app/components/user/trendingcarousel/page';
import RotatingImages from '@/app/components/user/rotatingimages/page';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

// Fallback loading components
const LoadingSpinner = () => (
   <div className='flex justify-center items-center p-4'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#553C26]'></div>
   </div>
);

export default function HomePage() {
   return (
      <>
         <div className='bg-[#F1EEE9] min-h-screen'>
            {/* Wrap NavBar in Suspense in case it's using useSearchParams */}
            <Suspense fallback={<LoadingSpinner />}>
               <NavBar />
            </Suspense>

            {/* Hero Section */}
            <div className='flex flex-col lg:flex-row bg-[#F1EEE9] px-4 lg:px-0'>
               <div className='w-full lg:w-auto lg:px-32'>
                  <Suspense fallback={<LoadingSpinner />}>
                     <Carousel />
                  </Suspense>
               </div>
               <div className='py-8 lg:py-52'>
                  <p className='text-[#553C26] font-mont font-semibold py-4'>What&apos;s new?</p>
                  <p className='text-[#553C26] font-mont font-bold text-2xl lg:text-4xl py-2'>
                     Hãy cùng khám phá các loại nến thơm
                  </p>
                  <p className='text-[#553C26] font-mont font-bold text-2xl lg:text-4xl pb-4'>
                     cùng chúng tôi!
                  </p>
                  <p className='text-[#553C26] font-mont pb-4'>
                     Tìm kiếm sản phẩm yêu thích trong bộ sưu tập nến thơm đặc biệt của chúng tôi!
                  </p>
                  <Link href='/user/products'>
                  <button className='font-mont h-8 w-36 bg-[#553C26] text-white rounded-2xl hover:animate-pulse'>
                     Xem thêm
                     <ChevronRightIcon className='h-4 w-5 inline' />
                  </button>
                  </Link>
               </div>
            </div>

            {/* Divider */}
            <div className='flex items-center justify-center py-1 pb-5 px-4'>
               <div className='flex-grow'></div>
               <div>
                  <Image
                     src={'/images/logo2.png'}
                     alt='Logo'
                     height={20}
                     width={20}
                     style={{ height: 'auto', width: '20px' }}
                  />
               </div>
               <div className='flex-grow border-t border-[#553C26] w-full lg:w-96'></div>
            </div>

            {/* Trending Section */}
            <div className='px-4 lg:px-0'>
               <p className='text-center text-[#555659] text-lg font-mont'>T R E N D I N G</p>
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  Những sản phẩm bán chạy
               </p>
               <Suspense fallback={<LoadingSpinner />}>
                  <TrendingCarousel />
               </Suspense>

               {/* Sale Banner */}
               <div className='px-4 lg:px-0 pb-10'>
                  <Image
                     src={'/images/sale.png'}
                     alt='sale-off'
                     height={380}
                     width={1700}
                     className='w-full h-auto object-cover'
                  />
               </div>
            </div>

            {/* About Section */}
            <div className='bg-[#A5978E] py-8 lg:py-16'>
               <div className='flex flex-col lg:flex-row justify-center items-center gap-7 px-4 lg:px-0 lg:w-3/4 mx-auto'>
                  <div className='w-full lg:w-1/2'>
                     <h1 className='text-xl lg:text-2xl font-mont font-semibold text-white pb-2'>
                        Về Chúng tôi
                     </h1>
                     <p className='text-white font-mont text-base lg:text-lg'>
                        Mỗi ngọn nến trong bộ sưu tập của chúng tôi là một kiệt tác của nghệ thuật
                        và tính xác thực. Chúng tôi tự hào tạo ra những ngọn nến không chỉ đẹp về
                        mặt thẩm mỹ mà còn có ý thức bảo vệ môi trường. Cam kết sử dụng vật liệu tự
                        nhiên, bền vững của chúng tôi đảm bảo rằng mỗi ngọn nến bạn thắp đều là sự
                        đón nhận nhẹ nhàng của bản chất thiên nhiên.
                     </p>
                  </div>
                  <Suspense fallback={<LoadingSpinner />}>
                     <RotatingImages />
                  </Suspense>
               </div>
            </div>

            {/* Accessories Section */}
            <div className='px-4 lg:px-0 py-8'>
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  Nến Thơm
               </p>
               <Suspense fallback={<LoadingSpinner />}>
                  <AccessoriesCarousel />
               </Suspense>
            </div>

            {/* Text Page and Banner Images */}
            <div className='space-y-4 px-4 lg:px-8'>
               <div className='max-w-[1920px] mx-auto'>
                  <Image
                     src={'/images/TextPage1.png'}
                     height={555}
                     width={1700}
                     alt='Text page'
                     className='w-full h-auto object-cover'
                  />
               </div>
               <div className='max-w-[1920px] mx-auto'>
                  <Image
                     src={'/images/Banner.png'}
                     height={110}
                     width={2500}
                     alt='Banner'
                     className='w-full h-auto object-cover'
                  />
               </div>
            </div>

            {/* Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 lg:p-20'>
               <div className='bg-white p-6 lg:p-8'>
                  <p className='text-center text-xl lg:text-3xl font-mont mb-6 pt-8 lg:pt-24'>
                     Tiết lộ bí mật của thiên nhiên
                  </p>
                  <div className='border-t border-[#2C292640] w-3/4 mx-auto mb-6'></div>
                  <p className='text-center p-4 lg:p-12'>
                     Trong thâm tâm, chúng tôi đam mê chế tác nến tỏa ra vẻ đẹp tự nhiên và trân
                     trọng những báu vật của trái đất. Mỗi cây nến của chúng tôi là bản giao hưởng
                     của các thành phần tự nhiên được lựa chọn tỉ mỉ, được chọn để truyền sự mê hoặc
                     vào không gian của bạn.
                  </p>
                  <p className='text-center pb-8 lg:pb-24 p-4 lg:p-12'>
                     Từ sự ôm ấp dịu dàng của cánh đồng hoa oải hương đến hương vị sảng khoái của
                     vườn cây họ cam quýt, hương thơm của chúng tôi có nguồn gốc từ tinh dầu nguyên
                     chất. Sáp của chúng tôi, hỗn hợp từ đậu nành và sáp ong có nguồn gốc bền vững,
                     cháy sạch và trung thực, không chứa độc tố. Mỗi bấc chúng tôi sử dụng đều được
                     chế tác cẩn thận từ cotton, đảm bảo cháy nhẹ nhàng, đều đặn.
                  </p>
                  <button className='bg-[#DDA15E] h-8 w-36 text-white hover:animate-pulse mx-auto block'>
                     Đọc Thêm
                  </button>
               </div>
               <div className='relative h-full'>
                  <Image
                     src={'/images/Pictures.png'}
                     height={791}
                     width={845}
                     alt=''
                     className='w-full h-full object-cover'
                  />
               </div>
            </div>

            {/* Image Section */}
            <div className='max-w-max mx-auto px-4 lg:px-0'>
               <Image
                  src={'/images/image6.png'}
                  height={110}
                  width={2500}
                  alt='Banner image'
                  className='w-full h-auto object-cover'
               />
            </div>

            {/* Contact Section */}
            <div className='px-4 lg:px-8 py-8'>
               <div
                  className='w-full bg-cover bg-center py-12 lg:py-24 px-4 lg:px-8 '
                  style={{
                     backgroundImage: `url(/images/Shadow.png)`,
                     minHeight: '400px',
                  }}
               >
                  <div className='max-w-4xl mx-auto text-center text-white'>
                     <h2 className='text-2xl lg:text-3xl font-mont '>
                        Liên hệ ngay với Candle Bliss
                     </h2>
                     <h2 className='text-2xl lg:text-3xl font-mont mb-8'>để biết thêm chi tiết</h2>
                     <p className='font-mont mb-8 px-4 lg:px-0'>
                        Khám phá sự quyến rũ của nến thơm tại Candle Bliss – nơi những mùi hương mê
                        hoặc và thiết kế tinh tế hòa quyện, mang đến sự ấm áp và sang trọng cho mọi
                        không gian. Hãy để mỗi ngọn nến trở thành một phần trong câu chuyện của bạn.
                        Liên hệ ngay hôm nay để cùng chúng tôi lan tỏa ánh sáng và hương thơm đặc
                        biệt!.
                     </p>
                     <button className='h-10 w-40 bg-[#DDA15E] text-white hover:bg-orange-600'>
                        Liên Hệ !
                     </button>
                  </div>
               </div>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
               <Footer />
            </Suspense>
         </div>
      </>
   );
}
