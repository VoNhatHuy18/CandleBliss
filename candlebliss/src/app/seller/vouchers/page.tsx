'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/app/components/seller/header/page';
import MenuSidebar from '@/app/components/seller/menusidebar/page';
import VoucherTag from '@/app/components/seller/vouchertags/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define the voucher interface to match your API response
interface Voucher {
   id: string;
   code: string;
   percent_off: number;
   amount_off: number;
   end_date: string;
   start_date: string;
   usage_limit: number;
   usage_count?: number; // How many times the voucher has been used
   min_order_value: number;
   isActive: boolean;
}

export default function VoucherPage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [vouchers, setVouchers] = useState<Voucher[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const router = useRouter();

   // Add this state for advanced search
   const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
   const [filterOptions, setFilterOptions] = useState({
      status: 'all', // 'all', 'active', 'expired', 'used'
   });

   // Fetch vouchers when component mounts
   useEffect(() => {
      const fetchVouchers = async () => {
         setLoading(true);
         try {
            // Get authentication token
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               router.push('/seller/signin');
               return;
            }

            // Fetch vouchers data from API
            const response = await fetch('http://localhost:3000/api/v1/vouchers', {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setVouchers(data);
         } catch (err) {
            console.error('Failed to fetch vouchers:', err);
            setError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.');
         } finally {
            setLoading(false);
         }
      };

      fetchVouchers();
   }, [router]);

   // Format date for display
   const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   };

   // Determine voucher status
   const getVoucherStatus = (voucher: Voucher) => {
      if (!voucher.isActive) return 'Hết hiệu lực';

      const now = new Date();
      const endDate = new Date(voucher.end_date);

      if (endDate < now) return 'Hết hạn';

      if (voucher.usage_limit && voucher.usage_count && voucher.usage_count >= voucher.usage_limit)
         return 'Đã dùng hết';

      return 'Còn hiệu lực';
   };

   // Add this function to handle advanced filtering
   const getFilteredVouchers = () => {
      return vouchers.filter((voucher) => {
         // First filter by search term (code)
         const searchMatch =
            searchTerm.trim() === '' ||
            voucher.code.toLowerCase().includes(searchTerm.toLowerCase().trim());

         // Then filter by status if needed
         let statusMatch = true;
         if (filterOptions.status !== 'all') {
            const status = getVoucherStatus(voucher).toLowerCase();

            if (filterOptions.status === 'active' && status !== 'còn hiệu lực') {
               statusMatch = false;
            } else if (filterOptions.status === 'expired' && status !== 'hết hạn') {
               statusMatch = false;
            } else if (filterOptions.status === 'used' && status !== 'đã dùng hết') {
               statusMatch = false;
            }
         }

         return searchMatch && statusMatch;
      });
   };

   // Update the filteredVouchers constant to use this function
   const filteredVouchers = getFilteredVouchers();

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSidebar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />

            {/* Content area */}
            <main className='flex-1 overflow-auto p-4'>
               {/* Search and action bar */}
               <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                     <div className='relative flex-1 w-full flex'>
                        <input
                           type='text'
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           placeholder='Tìm kiếm theo mã voucher...'
                           className='w-full px-4 py-2.5 pl-10 border border-r-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all'
                           onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        />
                        <span className='absolute left-3 top-3 text-gray-400'>
                           <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth={2}
                                 d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                              />
                           </svg>
                        </span>

                        {/* Search button */}
                        <button className='px-4 bg-amber-500 text-white border border-amber-500 rounded-r-lg hover:bg-amber-600 transition-all'>
                           Tìm
                        </button>

                        {/* Clear search button - only show when there's text */}
                        {searchTerm && (
                           <button
                              onClick={() => setSearchTerm('')}
                              className='ml-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all'
                           >
                              Xóa
                           </button>
                        )}
                     </div>

                     {/* Advanced search toggle */}
                     <div className=''>
                        <button
                           onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                           className='flex items-center text-amber-600 hover:text-amber-700 transition-all text-sm'
                        >
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
                                 d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                              />
                           </svg>
                           {showAdvancedSearch ? 'Ẩn bộ lọc' : 'Lọc nâng cao'}
                        </button>
                     </div>

                     <div className='flex gap-3 w-full sm:w-auto'>
                        <Link href='/seller/vouchers/createvoucher'>
                           <button className='flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all shadow-sm flex-1 sm:flex-none'>
                              <svg
                                 xmlns='http://www.w3.org/2000/svg'
                                 className='h-5 w-5 mr-2'
                                 fill='none'
                                 viewBox='0 0 24 24'
                                 stroke='currentColor'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                 />
                              </svg>
                              Thêm mới
                           </button>
                        </Link>
                     </div>
                  </div>

                  {/* Advanced search options */}
                  {showAdvancedSearch && (
                     <div className='w-full mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                           {/* Status filter */}
                           <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                 Trạng thái
                              </label>
                              <select
                                 value={filterOptions.status}
                                 onChange={(e) =>
                                    setFilterOptions({ ...filterOptions, status: e.target.value })
                                 }
                                 className='w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300'
                              >
                                 <option value='all'>Tất cả trạng thái</option>
                                 <option value='active'>Còn hiệu lực</option>
                                 <option value='expired'>Hết hạn</option>
                                 <option value='used'>Đã dùng hết</option>
                              </select>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Content container */}
               <div className='bg-white rounded-lg shadow-sm p-6'>
                  {/* Title section with counter */}
                  <div className='flex items-center justify-between border-b pb-4 mb-6'>
                     <h2 className='text-xl font-semibold text-gray-800'>Mã Giảm Giá</h2>
                     <span className='bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full'>
                        {filteredVouchers.length} mã
                     </span>
                  </div>

                  {/* Loading state */}
                  {loading && (
                     <div className='flex flex-col items-center justify-center py-12'>
                        <div className='w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-4'></div>
                        <p className='text-gray-600'>Đang tải dữ liệu...</p>
                     </div>
                  )}

                  {/* Error state */}
                  {!loading && error && (
                     <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-16 w-16 text-red-400 mb-4'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                           />
                        </svg>
                        <h3 className='text-lg font-medium text-gray-600 mb-1'>Có lỗi xảy ra</h3>
                        <p className='text-gray-500 max-w-md'>{error}</p>
                     </div>
                  )}

                  {/* Empty state - no results found */}
                  {!loading && !error && filteredVouchers.length === 0 && (
                     <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-16 w-16 text-gray-300 mb-4'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                           />
                        </svg>
                        <h3 className='text-lg font-medium text-gray-600 mb-1'>
                           {searchTerm ? 'Không tìm thấy mã voucher' : 'Chưa có mã giảm giá nào'}
                        </h3>
                        <p className='text-gray-500 max-w-md'>
                           {searchTerm
                              ? `Không tìm thấy mã voucher "${searchTerm}". Vui lòng kiểm tra lại mã.`
                              : 'Bạn chưa tạo mã giảm giá nào. Nhấn nút "Thêm mới" để tạo mã giảm giá đầu tiên.'}
                        </p>
                     </div>
                  )}

                  {/* Voucher grid when we have data */}
                  {!loading && !error && filteredVouchers.length > 0 && (
                     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                        {filteredVouchers.map((voucher) => (
                           <div key={voucher.id} className='flex flex-col'>
                              <VoucherTag
                                 id={voucher.id}
                                 code={voucher.code}
                                 discount={
                                    voucher.percent_off > 0
                                       ? `${voucher.percent_off}%`
                                       : `${voucher.amount_off.toLocaleString('vi-VN')}đ`
                                 }
                                 expiryDate={formatDate(voucher.end_date)}
                                 status={getVoucherStatus(voucher)}
                              />
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
