'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiCalendar, FiTag, FiPercent, FiDollarSign, FiUsers, FiInfo, FiAlertCircle } from 'react-icons/fi';

import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

// Define voucher interface to match your API
interface Voucher {
   id: string;
   code: string;
   name: string;
   percent_off: number;
   amount_off: number;
   end_date: string;
   start_date: string;
   usage_limit: number | null;
   usage_count: number;
   min_order_value: number;
   description: string;
   applicable_products: string;
   isActive: boolean;
}

export default function VoucherDetail() {
   const params = useParams();
   const router = useRouter();
   const [voucher, setVoucher] = useState<Voucher | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   // Format currency
   const formatCurrency = (amount: number) => {
      return amount.toLocaleString('vi-VN') + ' VND';
   };

   // Format date để hiển thị
   const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   };

   // Fetch voucher details when component mounts
   useEffect(() => {
      const fetchVoucherDetails = async () => {
         setLoading(true);
         try {
            // Get authentication token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               router.push('/seller/signin');
               return;
            }

            // Fetch voucher data from API
            const response = await fetch(`http://68.183.226.198:3000/api/v1/vouchers/${params.id}`, {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               if (response.status === 404) {
                  throw new Error('Không tìm thấy voucher này');
               }
               throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setVoucher(data);
         } catch (err: any) {
            console.error('Failed to fetch voucher:', err);
            setError(err.message || 'Không thể tải thông tin voucher. Vui lòng thử lại sau.');
         } finally {
            setLoading(false);
         }
      };

      if (params.id) {
         fetchVoucherDetails();
      }
   }, [params.id, router]);

   // Determine if voucher is active
   const getVoucherStatus = () => {
      if (!voucher) return 'Không xác định';
      if (!voucher.isActive) return 'Đã hủy';

      const now = new Date();
      const endDate = new Date(voucher.end_date);
      const startDate = new Date(voucher.start_date);

      if (now < startDate) return 'Chưa bắt đầu';
      if (endDate < now) return 'Hết hạn';
      if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit)
         return 'Đã dùng hết';

      return 'Còn hiệu lực';
   };

   // Handle voucher deletion
   const handleDeleteVoucher = async () => {
      if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;

      try {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         const response = await fetch(`http://68.183.226.198:3000/api/v1/vouchers/${params.id}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error('Không thể xóa mã giảm giá');
         }

         alert('Xóa mã giảm giá thành công');
         router.push('/seller/vouchers');
      } catch (err) {
         console.error('Failed to delete voucher:', err);
         alert('Xóa mã giảm giá thất bại. Vui lòng thử lại sau.');
      }
   };

   // Handle toggle voucher active status
   const handleToggleStatus = async () => {
      try {
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
         const newStatus = !voucher?.isActive;

         const response = await fetch(`http://68.183.226.198:3000/api/v1/vouchers/${params.id}/status`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isActive: newStatus }),
         });

         if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái mã giảm giá');
         }

         // Update local state
         if (voucher) {
            setVoucher({ ...voucher, isActive: newStatus });
         }

         alert(newStatus ? 'Kích hoạt mã giảm giá thành công' : 'Tạm dừng mã giảm giá thành công');
      } catch (err) {
         console.error('Failed to update voucher status:', err);
         alert('Cập nhật trạng thái thất bại. Vui lòng thử lại sau.');
      }
   };

   // Render loading state
   if (loading) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16 flex items-center justify-center'>
                  <div className='w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin'></div>
               </div>
            </div>
         </div>
      );
   }

   // Render error state
   if (error) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16'>
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                     <FiAlertCircle className='h-16 w-16 text-red-400 mb-4' />
                     <h3 className='text-lg font-medium text-gray-600 mb-1'>Có lỗi xảy ra</h3>
                     <p className='text-gray-500 max-w-md'>{error}</p>
                     <Link href='/seller/vouchers'>
                        <button className='mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none'>
                           Quay lại danh sách
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // If no voucher found
   if (!voucher) {
      return (
         <div className='flex min-h-screen bg-[#f8f5f0]'>
            <div className='fixed left-0 top-0 h-full z-30'>
               <MenuSideBar />
            </div>
            <div className='flex-1 flex flex-col ml-64'>
               <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
                  <Header />
               </div>
               <div className='flex-1 p-6 mt-16'>
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                     <FiInfo className='h-16 w-16 text-gray-300 mb-4' />
                     <h3 className='text-lg font-medium text-gray-600 mb-1'>Không tìm thấy mã giảm giá</h3>
                     <p className='text-gray-500 max-w-md'>Mã giảm giá không tồn tại hoặc đã bị xóa</p>
                     <Link href='/seller/vouchers'>
                        <button className='mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none'>
                           Quay lại danh sách
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Get status display information
   const status = getVoucherStatus();
   const statusColor =
      status === 'Còn hiệu lực' ? 'text-green-600 bg-green-50' :
         status === 'Chưa bắt đầu' ? 'text-blue-600 bg-blue-50' :
            status === 'Đã hủy' ? 'text-red-600 bg-red-50' :
               'text-gray-600 bg-gray-100';

   return (
      <div className='flex min-h-screen bg-[#f8f5f0]'>
         {/* Sidebar cố định bên trái */}
         <div className='fixed left-0 top-0 h-full z-30'>
            <MenuSideBar />
         </div>

         {/* Phần nội dung chính với padding-left để tránh sidebar */}
         <div className='flex-1 flex flex-col ml-64'>
            {/* Header cố định phía trên */}
            <div className='fixed top-0 right-0 left-64 bg-white z-20 shadow-sm'>
               <Header />
            </div>
            {/* Main content */}
            <div className='flex-1 p-6 mt-16'>
               <Head>
                  <title>Chi tiết mã giảm giá - Candle Bliss</title>
               </Head>

               <div className='mb-6'>
                  <div className='text-sm mb-2'>
                     <Link href='/seller/vouchers' className='text-amber-600 hover:text-amber-800'>
                        Quản lý mã giảm giá
                     </Link>
                     <span className='mx-2 text-gray-400'>/</span>
                     <span className='text-gray-700'>Chi tiết mã giảm giá</span>
                  </div>
                  <h1 className='text-xl font-medium'>Chi tiết mã giảm giá</h1>
               </div>

               <div className='bg-white rounded-md shadow-sm p-6'>
                  <div className='flex flex-col md:flex-row gap-6'>
                     <div className='w-full md:w-2/3'>
                        <div className='mb-4'>
                           <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiTag className='mr-1 text-amber-600' />
                              Mã voucher:
                           </label>
                           <input
                              type='text'
                              value={voucher.code}
                              className='w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>



                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                           <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian bắt đầu:
                              </label>
                              <input
                                 type='text'
                                 value={formatDate(voucher.start_date)}
                                 className='w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                           </div>
                           <div>
                              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiCalendar className='mr-1 text-amber-600' />
                                 Thời gian kết thúc:
                              </label>
                              <input
                                 type='text'
                                 value={formatDate(voucher.end_date)}
                                 className='w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                           </div>
                        </div>

                        {voucher.percent_off > 0 ? (
                           <div className='mb-4'>
                              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiPercent className='mr-1 text-amber-600' />
                                 Mức giảm (%):
                              </label>
                              <div className='relative mt-1'>
                                 <input
                                    type='text'
                                    value={voucher.percent_off}
                                    className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                    readOnly
                                 />
                                 <div className='absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none'>
                                    <span className='text-gray-500'>%</span>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className='mb-4'>
                              <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                                 <FiDollarSign className='mr-1 text-amber-600' />
                                 Mức giảm (VND):
                              </label>
                              <input
                                 type='text'
                                 value={formatCurrency(voucher.amount_off)}
                                 className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                 readOnly
                              />
                           </div>
                        )}

                        <div className='mb-4'>
                           <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiDollarSign className='mr-1 text-amber-600' />
                              Giá trị tối thiểu:
                           </label>
                           <input
                              type='text'
                              value={formatCurrency(voucher.min_order_value)}
                              className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiUsers className='mr-1 text-amber-600' />
                              Số lượt sử dụng:
                           </label>
                           <div className='flex gap-4'>
                              <div className='flex-1'>
                                 <label className='text-xs text-gray-500'>Đã sử dụng</label>
                                 <input
                                    type='text'
                                    value={voucher.usage_count}
                                    className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm'
                                    readOnly
                                 />
                              </div>
                              <div className='flex-1'>
                                 <label className='text-xs text-gray-500'>Giới hạn</label>
                                 <input
                                    type='text'
                                    value={voucher.usage_limit === null ? 'Không giới hạn' : voucher.usage_limit}
                                    className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm'
                                    readOnly
                                 />
                              </div>
                           </div>
                        </div>

                        <div className='mb-4'>
                           <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiInfo className='mr-1 text-amber-600' />
                              Mô tả:
                           </label>
                           <textarea
                              value={voucher.description || 'Không có mô tả'}
                              className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              rows={3}
                              readOnly
                           />
                        </div>

                        <div className='mb-4'>
                           <label className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              <FiInfo className='mr-1 text-amber-600' />
                              Đối tượng áp dụng:
                           </label>
                           <input
                              type='text'
                              value={voucher.applicable_products || 'Tất cả sản phẩm'}
                              className='block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                              readOnly
                           />
                        </div>
                     </div>

                     <div className='w-full md:w-1/3'>
                        <div className='sticky top-24'>
                           <h2 className='text-lg font-medium mb-4 flex items-center'>
                              <FiTag className='mr-2 text-amber-600' /> Xem trước voucher
                           </h2>

                           {/* Phần preview voucher với thiết kế giống trang createvoucher */}
                           <div className='bg-white p-5 rounded-lg shadow-md border border-gray-200 mb-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
                              {/* Phần trang trí */}
                              <div className='absolute -top-10 -right-10 w-20 h-20 bg-amber-100 rounded-full'></div>
                              <div className='absolute -bottom-8 -left-8 w-16 h-16 bg-amber-50 rounded-full'></div>

                              <div className='flex items-center justify-between mb-3 relative z-10'>
                                 <div className='w-full'>
                                    <div className='flex justify-between mb-2'>
                                       <div className='text-sm font-semibold'>
                                          Mã Voucher:{' '}
                                          <span className='font-bold text-amber-600'>
                                             {voucher.code}
                                          </span>
                                       </div>
                                       <div className='bg-amber-50 p-1.5 rounded-full'>
                                          <svg
                                             xmlns='http://www.w3.org/2000/svg'
                                             width='20'
                                             height='20'
                                             viewBox='0 0 24 24'
                                             fill='none'
                                             stroke='currentColor'
                                             strokeWidth='2'
                                             strokeLinecap='round'
                                             strokeLinejoin='round'
                                             className='text-amber-500'
                                          >
                                             <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'></path>
                                          </svg>
                                       </div>
                                    </div>

                                    <div className='text-lg font-semibold my-2'>{voucher.name || voucher.code}</div>

                                    <div className='text-md font-semibold border-t border-dashed border-gray-200 pt-2 mt-2'>
                                       Giảm{' '}
                                       <span className='text-red-600 font-bold'>
                                          {voucher.percent_off > 0
                                             ? `${voucher.percent_off}%`
                                             : formatCurrency(voucher.amount_off)}
                                       </span>
                                    </div>

                                    <div className='flex justify-between mt-2'>
                                       <div className='text-xs'>
                                          Hạn sử dụng: {formatDate(voucher.end_date)}
                                       </div>
                                       <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                                          {status}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Thông tin chi tiết voucher */}
                              <div className='mt-4 border-t pt-4 text-xs text-gray-600'>
                                 <div className='mb-2 flex items-center'>
                                    <FiDollarSign className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Giá trị tối thiểu:</span>{' '}
                                    <span className='ml-1'>{formatCurrency(voucher.min_order_value)}</span>
                                 </div>
                                 <div className='mb-2 flex items-center'>
                                    <FiCalendar className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Thời gian:</span>{' '}
                                    <span className='ml-1'>
                                       {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}
                                    </span>
                                 </div>
                                 <div className='mb-2 flex items-center'>
                                    <FiUsers className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Lượt sử dụng:</span>{' '}
                                    <span className='ml-1'>
                                       {voucher.usage_count}/{voucher.usage_limit === null ? '∞' : voucher.usage_limit}
                                    </span>
                                 </div>
                                 <div className='flex items-center'>
                                    <FiInfo className='mr-1 text-amber-500' />
                                    <span className='font-medium'>Áp dụng:</span>{' '}
                                    <span className='ml-1'>{voucher.applicable_products || 'Tất cả sản phẩm'}</span>
                                 </div>
                              </div>
                           </div>

                           <div className='flex space-y-2 flex-col'>
                              <Link href={`/seller/vouchers/edit/${voucher.id}`}>
                                 <button className='px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 w-full mb-2'>
                                    Chỉnh sửa
                                 </button>
                              </Link>
                              <button
                                 onClick={handleToggleStatus}
                                 className={`px-4 py-2 ${voucher.isActive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 w-full mb-2`}
                              >
                                 {voucher.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                              </button>
                              <button
                                 onClick={handleDeleteVoucher}
                                 className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 w-full'
                              >
                                 Xóa mã
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
