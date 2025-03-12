'use client';

// ProductPage.jsx
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';

export default function ProductPage() {
   const [quantity, setQuantity] = useState(1);
   const [activeTab, setActiveTab] = useState(0);
   const [activeThumbnail, setActiveThumbnail] = useState(0);

   const productImages = [
      '/images/candle-main.jpg',
      '/images/candle-2.jpg',
      '/images/candle-3.jpg',
      '/images/candle-4.jpg',
      '/images/candle-5.jpg',
   ];

   const relatedProducts = [
      {
         id: 1,
         name: 'Nến Thơm Quế',
         price: '200.000đ',
         image: '/images/related-1.jpg',
      },
      {
         id: 2,
         name: 'Nến Thơm Nhũ Đồi',
         price: '300.000đ',
         image: '/images/related-2.jpg',
      },
      {
         id: 3,
         name: 'Nến Thơm Cà Phê',
         price: '280.000đ',
         image: '/images/related-3.jpg',
      },
      {
         id: 4,
         name: 'Nến Thơm Thư Giãn',
         price: '220.000đ',
         image: '/images/related-4.jpg',
      },
      {
         id: 5,
         name: 'Nến Thơm Trà Trắng',
         price: '260.000đ',
         image: '/images/related-5.jpg',
      },
   ];

   const sameAuthorProducts = [
      {
         id: 1,
         name: 'Nến thơm gỗ đàn hương',
         price: '250.000đ',
         image: '/images/product-side-1.jpg',
         stock: 'Còn hàng',
      },
      {
         id: 2,
         name: 'Nến thơm gỗ đàn hương',
         price: '250.000đ',
         image: '/images/product-side-2.jpg',
         stock: 'Còn hàng',
      },
      {
         id: 3,
         name: 'Nến thơm gỗ đàn hương',
         price: '250.000đ',
         image: '/images/product-side-3.jpg',
         stock: 'Còn hàng',
      },
      {
         id: 4,
         name: 'Nến thơm gỗ đàn hương',
         price: '250.000đ',
         image: '/images/product-side-4.jpg',
         stock: 'Còn hàng',
      },
      {
         id: 5,
         name: 'Nến thơm gỗ đàn hương',
         price: '250.000đ',
         image: '/images/product-side-5.jpg',
         stock: 'Còn hàng',
      },
   ];

   const recommendedProducts = [
      {
         id: 1,
         name: 'Tinh dầu Bạch Đàn Chanh',
         price: '120.000đ',
         originalPrice: '150.000đ',
         image: '/images/recommended-1.jpg',
         discount: '20%',
      },
      {
         id: 2,
         name: 'Tinh dầu Bạch Đàn Chanh',
         price: '120.000đ',
         originalPrice: '150.000đ',
         image: '/images/recommended-2.jpg',
         discount: '20%',
      },
      {
         id: 3,
         name: 'Tinh dầu Bạch Đàn Chanh',
         price: '120.000đ',
         originalPrice: '150.000đ',
         image: '/images/recommended-3.jpg',
         discount: '20%',
      },
      {
         id: 4,
         name: 'Tinh dầu Bạch Đàn Chanh',
         price: '120.000đ',
         originalPrice: '150.000đ',
         image: '/images/recommended-4.jpg',
         discount: '20%',
      },
   ];

   const decreaseQuantity = () => {
      if (quantity > 1) {
         setQuantity(quantity - 1);
      }
   };

   const increaseQuantity = () => {
      setQuantity(quantity + 1);
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         {/* Header */}
         <Header />

         {/* Breadcrumbs */}
         <div className='container mx-auto px-4 py-2 text-sm'>
            <div className='flex items-center text-gray-500'>
               <Link href='/' className='hover:text-orange-700'>
                  Trang chủ
               </Link>
               <span className='mx-2'>/</span>
               <Link href='/user/products' className='hover:text-orange-700'>
                  Sản phẩm
               </Link>
               <span className='mx-2'>/</span>
               <span className='text-gray-700 font-medium'>Nến thơm gỗ đàn</span>
            </div>
         </div>

         {/* Product Section */}
         <div className='container mx-auto px-4 py-6'>
            <div className='flex flex-col md:flex-row -mx-4'>
               {/* Product Images */}
               <div className='md:w-1/2 px-4 mb-6'>
                  <div className='relative bg-gray-100 mb-4 h-96'>
                     <Image
                        src={productImages[activeThumbnail]}
                        alt='Nến thơm gỗ đàn'
                        layout='fill'
                        objectFit='contain'
                        className='p-4'
                     />
                  </div>
                  <div className='flex -mx-2'>
                     {productImages.map((img, index) => (
                        <div
                           key={index}
                           className={`px-2 w-1/5 cursor-pointer ${
                              activeThumbnail === index ? 'ring-2 ring-orange-500' : ''
                           }`}
                           onClick={() => setActiveThumbnail(index)}
                        >
                           <div className='relative bg-gray-100 h-16'>
                              <Image
                                 src={img}
                                 alt={`Nến thơm gỗ đàn thumbnail ${index + 1}`}
                                 layout='fill'
                                 objectFit='contain'
                                 className='p-1'
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Product Details */}
               <div className='md:w-1/2 px-4'>
                  <h1 className='text-3xl font-medium mb-2'>Nến Thơm Gỗ Đàn</h1>
                  <div className='flex items-center mb-4'>
                     <div className='flex items-center'>
                        <span className='text-gray-500 text-sm mr-2'>Mã SP: KT-123</span>
                        <span className='mx-2 text-gray-300'>|</span>
                        <div className='flex items-center text-sm'>
                           <span className={quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                              {quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                           </span>
                           <span className='text-gray-500 ml-1'>(100 sản phẩm)</span>
                        </div>
                     </div>
                  </div>

                  <div className='mb-6 bg-gray-50 p-4 rounded'>
                     <div className='flex items-center'>
                        <span className='text-red-600 text-2xl font-medium'>228.000 VNĐ</span>
                        <span className='ml-2 text-gray-500 line-through'>285.000 VNĐ</span>
                        <div className='bg-red-600 text-white text-xs px-2 py-1 rounded ml-2'>
                           Giảm 20%
                        </div>
                     </div>
                  </div>

                  <div className='mb-6'>
                     <div className='flex items-center mb-4'>
                        <span className='text-gray-700 w-24 font-medium'>Số lượng:</span>
                        <div className='flex shadow-sm'>
                           <button
                              className='border border-gray-300 px-3 py-1 rounded-l hover:bg-gray-100'
                              onClick={decreaseQuantity}
                           >
                              -
                           </button>
                           <input
                              type='text'
                              className='border-t border-b border-gray-300 w-12 text-center'
                              value={quantity}
                              readOnly
                           />
                           <button
                              className='border border-gray-300 px-3 py-1 rounded-r hover:bg-gray-100'
                              onClick={increaseQuantity}
                           >
                              +
                           </button>
                        </div>
                     </div>
                     {/* New Fragrance Field */}
                     <div className='flex items-center mb-4'>
                        <span className='text-gray-700 w-24 font-medium'>Mùi hương:</span>
                        <div className='flex flex-wrap gap-2'>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50'>
                              <input
                                 type='radio'
                                 name='fragrance'
                                 className='mr-1.5'
                                 defaultChecked
                              />
                              <span>Gỗ đàn hương</span>
                           </label>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50'>
                              <input type='radio' name='fragrance' className='mr-1.5' />
                              <span>Quế</span>
                           </label>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50'>
                              <input type='radio' name='fragrance' className='mr-1.5' />
                              <span>Cà phê</span>
                           </label>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50'>
                              <input type='radio' name='fragrance' className='mr-1.5' />
                              <span>Trà trắng</span>
                           </label>
                        </div>
                     </div>

                     {/* New Size Field */}
                     <div className='flex items-center mb-4'>
                        <span className='text-gray-700 w-24 font-medium'>Kích thước:</span>
                        <div className='flex gap-2'>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer'>
                              <input type='radio' name='size' className='mr-1.5' defaultChecked />
                              <span>S</span>
                           </label>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer'>
                              <input type='radio' name='size' className='mr-1.5' />
                              <span>M</span>
                           </label>
                           <label className='flex items-center border border-gray-300 rounded px-3 py-1.5 cursor-pointer'>
                              <input type='radio' name='size' className='mr-1.5' />
                              <span>L</span>
                           </label>
                        </div>
                     </div>

                     <div className='grid grid-cols-2 gap-3 mb-4'>
                        <button className='flex justify-center items-center bg-white border border-gray-300 py-2.5 text-sm text-gray-700 rounded hover:bg-gray-50 transition'>
                           <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-4 w-4 mr-1'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth={2}
                                 d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                              />
                           </svg>
                           <span>Thêm vào giỏ hàng</span>
                        </button>
                        <button className='flex justify-center items-center bg-white border border-gray-300 py-2.5 text-sm text-gray-700 rounded hover:bg-gray-50 transition'>
                           <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-4 w-4 mr-1'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth={2}
                                 d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                              />
                           </svg>
                           <span>Thêm vào yêu thích</span>
                        </button>
                     </div>

                     <div className='grid grid-cols-1 gap-3 mb-2'>
                        <button className='bg-orange-700 border border-orange-700 py-3 text-sm text-white rounded hover:bg-orange-800 transition font-medium'>
                           Mua ngay
                        </button>
                        <button className='bg-orange-50 border border-orange-700 py-3 text-sm text-orange-700 rounded hover:bg-orange-100 transition font-medium'>
                           Nhắn tin với shop
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Same Author Products */}
            <div className='mt-10'>
               <h2 className='text-xl font-medium mb-5 flex items-center'>
                  <span className='w-1 h-5 bg-orange-700 inline-block mr-2'></span>
                  Sản phẩm cùng nhóm
               </h2>
               <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
                  {sameAuthorProducts.map((product) => (
                     <div
                        key={product.id}
                        className='border border-gray-200 rounded p-3 hover:shadow-md transition'
                     >
                        <Link href={`/user/products/${product.id}`}>
                           <div>
                              <div className='relative h-24 w-full mb-2'>
                                 <Image
                                    src={product.image}
                                    alt={product.name}
                                    layout='fill'
                                    objectFit='cover'
                                    className='rounded'
                                 />
                              </div>
                              <div className='text-xs text-gray-500'>KT-123</div>
                              <div className='text-sm font-medium truncate'>{product.name}</div>
                              <div className='text-sm text-orange-700 font-medium mt-1'>
                                 {product.price}
                              </div>
                              <div className='text-xs text-green-600 mt-1'>{product.stock}</div>
                           </div>
                        </Link>
                     </div>
                  ))}
               </div>
            </div>

            {/* Product Description */}
            <div className='mt-10 bg-white shadow rounded'>
               <div className='border-b border-gray-200'>
                  <div className='container mx-auto px-4'>
                     <ul className='flex flex-wrap'>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${
                              activeTab === 0
                                 ? 'border-b-2 border-orange-500 text-orange-700'
                                 : 'text-gray-600 hover:text-orange-700'
                           }`}
                           onClick={() => setActiveTab(0)}
                        >
                           Mô Tả Sản Phẩm
                        </li>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${
                              activeTab === 1
                                 ? 'border-b-2 border-orange-500 text-orange-700'
                                 : 'text-gray-600 hover:text-orange-700'
                           }`}
                           onClick={() => setActiveTab(1)}
                        >
                           Thông Tin Chi Tiết
                        </li>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${
                              activeTab === 2
                                 ? 'border-b-2 border-orange-500 text-orange-700'
                                 : 'text-gray-600 hover:text-orange-700'
                           }`}
                           onClick={() => setActiveTab(2)}
                        >
                           Đánh Giá từ Khách Hàng
                        </li>
                     </ul>
                  </div>
               </div>

               <div className='p-6'>
                  {activeTab === 0 && (
                     <div>
                        <p className='mb-6 text-gray-700 leading-relaxed'>
                           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo
                           ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis
                           dis parturient montes, nascetur ridiculus mus.
                        </p>

                        <div className='my-6 flex flex-col md:flex-row gap-6'>
                           <div className='relative h-64 md:w-1/2 rounded overflow-hidden'>
                              <Image
                                 src='/images/candle-description-1.jpg'
                                 alt='Candle description'
                                 layout='fill'
                                 objectFit='cover'
                              />
                           </div>
                           <div className='md:w-1/2'>
                              <h3 className='font-medium text-lg mb-3'>Chất Liệu Cao Cấp</h3>
                              <p className='text-gray-700 leading-relaxed'>
                                 Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
                                 sem. Nulla consequat massa quis enim. Donec pede justo, fringilla
                                 vel, aliquet nec, vulputate eget, arcu.
                              </p>
                           </div>
                        </div>

                        <p className='mb-6 text-gray-700 leading-relaxed'>
                           In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam
                           dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus.
                           Vivamus elementum semper nisi.
                        </p>

                        <div className='my-6 flex flex-col md:flex-row gap-6'>
                           <div className='md:w-1/2'>
                              <h3 className='font-medium text-lg mb-3'>Hương Thơm Đặc Biệt</h3>
                              <p className='text-gray-700 leading-relaxed'>
                                 Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
                                 enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a,
                                 tellus.
                              </p>
                           </div>
                           <div className='relative h-64 md:w-1/2 rounded overflow-hidden'>
                              <Image
                                 src='/images/candle-description-2.jpg'
                                 alt='Candle description'
                                 layout='fill'
                                 objectFit='cover'
                              />
                           </div>
                        </div>

                        <p className='text-gray-700 leading-relaxed'>
                           Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean
                           imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper
                           ultricies nisi. Nam eget dui. Etiam rhoncus.
                        </p>
                     </div>
                  )}

                  {activeTab === 1 && (
                     <div className='bg-white'>
                        <table className='w-full border-collapse'>
                           <tbody>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium w-1/3'>Thương hiệu</td>
                                 <td className='py-3'>CandleBliss</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Xuất xứ</td>
                                 <td className='py-3'>Việt Nam</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Khối lượng</td>
                                 <td className='py-3'>200g</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Thành phần</td>
                                 <td className='py-3'>
                                    Sáp đậu nành, tinh dầu thiên nhiên, bấc cotton
                                 </td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Thời gian cháy</td>
                                 <td className='py-3'>40-50 giờ</td>
                              </tr>
                              <tr>
                                 <td className='py-3 font-medium'>Hướng dẫn sử dụng</td>
                                 <td className='py-3'>
                                    Thắp nến trong không gian thoáng mát, tránh xa vật dễ cháy
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  )}

                  {activeTab === 2 && (
                     <div>
                        {/* Reviews Summary */}
                        <div className='flex flex-col md:flex-row border-b pb-6 mb-6'>
                           <div className='md:w-1/3 mb-6 md:mb-0'>
                              <div className='flex flex-col items-center'>
                                 <div className='text-5xl font-medium text-orange-700'>4.8</div>
                                 <div className='flex mt-2 mb-1'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                       <svg
                                          key={star}
                                          xmlns='http://www.w3.org/2000/svg'
                                          className={`h-5 w-5 ${
                                             star <= 4 ? 'text-yellow-400' : 'text-gray-300'
                                          }`}
                                          viewBox='0 0 20 20'
                                          fill='currentColor'
                                       >
                                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                       </svg>
                                    ))}
                                 </div>
                                 <div className='text-sm text-gray-500'>38 đánh giá</div>
                              </div>
                           </div>

                           <div className='md:w-2/3'>
                              <div className='space-y-2'>
                                 <div className='flex items-center'>
                                    <div className='w-20 text-sm text-gray-600'>5 sao</div>
                                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                       <div className='bg-yellow-400 h-full w-4/5'></div>
                                    </div>
                                    <div className='w-12 text-right text-sm text-gray-600'>80%</div>
                                 </div>
                                 <div className='flex items-center'>
                                    <div className='w-20 text-sm text-gray-600'>4 sao</div>
                                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                       <div className='bg-yellow-400 h-full w-3/5'></div>
                                    </div>
                                    <div className='w-12 text-right text-sm text-gray-600'>15%</div>
                                 </div>
                                 <div className='flex items-center'>
                                    <div className='w-20 text-sm text-gray-600'>3 sao</div>
                                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                       <div className='bg-yellow-400 h-full w-1/5'></div>
                                    </div>
                                    <div className='w-12 text-right text-sm text-gray-600'>5%</div>
                                 </div>
                                 <div className='flex items-center'>
                                    <div className='w-20 text-sm text-gray-600'>2 sao</div>
                                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                       <div className='bg-yellow-400 h-full w-0'></div>
                                    </div>
                                    <div className='w-12 text-right text-sm text-gray-600'>0%</div>
                                 </div>
                                 <div className='flex items-center'>
                                    <div className='w-20 text-sm text-gray-600'>1 sao</div>
                                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                                       <div className='bg-yellow-400 h-full w-0'></div>
                                    </div>
                                    <div className='w-12 text-right text-sm text-gray-600'>0%</div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Filter Reviews */}
                        <div className='flex flex-wrap gap-2 mb-6'>
                           <button className='px-4 py-1.5 bg-orange-50 text-orange-700 border border-orange-300 rounded-full text-sm font-medium hover:bg-orange-100'>
                              Tất cả (38)
                           </button>
                           <button className='px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-full text-sm hover:bg-gray-50'>
                              5 Sao (30)
                           </button>
                           <button className='px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-full text-sm hover:bg-gray-50'>
                              4 Sao (6)
                           </button>
                           <button className='px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-full text-sm hover:bg-gray-50'>
                              3 Sao (2)
                           </button>
                           <button className='px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-full text-sm hover:bg-gray-50'>
                              Có Hình Ảnh (12)
                           </button>
                        </div>

                        {/* Reviews List */}
                        <div className='space-y-6'>
                           {/* Review 1 */}
                           <div className='border-b pb-6'>
                              <div className='flex items-center mb-2'>
                                 <div className='w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden'>
                                    <Image
                                       src='/images/avatar-1.jpg'
                                       alt='User'
                                       width={32}
                                       height={32}
                                    />
                                 </div>
                                 <div className='font-medium'>Nguyễn Văn A</div>
                              </div>

                              <div className='flex items-center mb-2'>
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                       key={star}
                                       xmlns='http://www.w3.org/2000/svg'
                                       className='h-4 w-4 text-yellow-400'
                                       viewBox='0 0 20 20'
                                       fill='currentColor'
                                    >
                                       <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                 ))}
                                 <span className='text-sm text-gray-500 ml-2'>26/02/2025</span>
                              </div>

                              <div className='mb-3'>
                                 <div className='text-sm mb-2'>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded'>
                                       Mùi: Gỗ đàn hương
                                    </span>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2'>
                                       Kích thước: M
                                    </span>
                                 </div>
                                 <p className='text-gray-700'>
                                    Sản phẩm rất thơm, mình đốt mỗi buổi tối khoảng 2 tiếng, dùng
                                    được hơn 3 tuần rồi mà vẫn còn nhiều. Hương thơm lan tỏa rất
                                    nhanh và giữ được khá lâu.
                                 </p>
                              </div>

                              <div className='flex flex-wrap gap-2'>
                                 <div className='relative h-20 w-20 rounded overflow-hidden'>
                                    <Image
                                       src='/images/review-img-1.jpg'
                                       alt='Review image'
                                       layout='fill'
                                       objectFit='cover'
                                       className='hover:opacity-90 cursor-pointer'
                                    />
                                 </div>
                                 <div className='relative h-20 w-20 rounded overflow-hidden'>
                                    <Image
                                       src='/images/review-img-2.jpg'
                                       alt='Review image'
                                       layout='fill'
                                       objectFit='cover'
                                       className='hover:opacity-90 cursor-pointer'
                                    />
                                 </div>
                              </div>
                           </div>

                           {/* Review 2 */}
                           <div className='border-b pb-6'>
                              <div className='flex items-center mb-2'>
                                 <div className='w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden'>
                                    <Image
                                       src='/images/avatar-2.jpg'
                                       alt='User'
                                       width={32}
                                       height={32}
                                    />
                                 </div>
                                 <div className='font-medium'>Trần Thị B</div>
                              </div>

                              <div className='flex items-center mb-2'>
                                 {[1, 2, 3, 4].map((star) => (
                                    <svg
                                       key={star}
                                       xmlns='http://www.w3.org/2000/svg'
                                       className='h-4 w-4 text-yellow-400'
                                       viewBox='0 0 20 20'
                                       fill='currentColor'
                                    >
                                       <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                 ))}
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 text-gray-300'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                 >
                                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                 </svg>
                                 <span className='text-sm text-gray-500 ml-2'>15/02/2025</span>
                              </div>

                              <div className='mb-3'>
                                 <div className='text-sm mb-2'>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded'>
                                       Mùi: Quế
                                    </span>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2'>
                                       Kích thước: L
                                    </span>
                                 </div>
                                 <p className='text-gray-700'>
                                    Nến thơm rất thích, mùi quế thoang thoảng dễ chịu. Giảm 1 sao vì
                                    đóng gói hơi đơn giản.
                                 </p>
                              </div>
                           </div>

                           {/* Review 3 */}
                           <div>
                              <div className='flex items-center mb-2'>
                                 <div className='w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden'>
                                    <Image
                                       src='/images/avatar-3.jpg'
                                       alt='User'
                                       width={32}
                                       height={32}
                                    />
                                 </div>
                                 <div className='font-medium'>Lê Văn C</div>
                              </div>

                              <div className='flex items-center mb-2'>
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                       key={star}
                                       xmlns='http://www.w3.org/2000/svg'
                                       className='h-4 w-4 text-yellow-400'
                                       viewBox='0 0 20 20'
                                       fill='currentColor'
                                    >
                                       <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                    </svg>
                                 ))}
                                 <span className='text-sm text-gray-500 ml-2'>05/02/2025</span>
                              </div>

                              <div>
                                 <div className='text-sm mb-2'>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded'>
                                       Mùi: Gỗ đàn hương
                                    </span>
                                    <span className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2'>
                                       Kích thước: S
                                    </span>
                                 </div>
                                 <p className='text-gray-700'>
                                    Mua tặng bạn, bạn rất thích. Nến cháy đều, không bị khói đen,
                                    hương thơm nhẹ nhàng rất dễ chịu. Sẽ ủng hộ shop nhiều lần nữa.
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* Pagination */}
                        <div className='flex justify-center mt-8'>
                           <nav className='flex items-center'>
                              <button className='px-2 py-1 border border-gray-300 rounded-l-md text-gray-700 hover:bg-gray-50'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                 >
                                    <path
                                       fillRule='evenodd'
                                       d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                                       clipRule='evenodd'
                                    />
                                 </svg>
                              </button>
                              <button className='px-3 py-1 border-t border-b border-gray-300 bg-orange-50 text-orange-700'>
                                 1
                              </button>
                              <button className='px-3 py-1 border-t border-b border-gray-300 text-gray-700 hover:bg-gray-50'>
                                 2
                              </button>
                              <button className='px-3 py-1 border-t border-b border-gray-300 text-gray-700 hover:bg-gray-50'>
                                 3
                              </button>
                              <button className='px-2 py-1 border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50'>
                                 <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                 >
                                    <path
                                       fillRule='evenodd'
                                       d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                       clipRule='evenodd'
                                    />
                                 </svg>
                              </button>
                           </nav>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Related Products */}
            <ViewedCarousel />
         </div>

         {/* Footer */}
         <Footer />
      </div>
   );
}
