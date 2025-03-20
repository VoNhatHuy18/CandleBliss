'use client';

import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import MenuProfile from '@/app/components/user/menuprofile/page';

export default function Profile() {
   const [isEditing, setIsEditing] = useState(false); // Modal state for editing profile
   const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // Modal state for address
   const [editingAddress, setEditingAddress] = useState<Record<string, any>>({}); // Address being edited
   const [formData, setFormData] = useState({
      name: 'Mai Xuân Toàn',
      email: 'mai******@gmail.com',
      phone: '0333084060',
      birthday: '28.09.2000',
      gender: 'male',
   });
   const [addresses, setAddresses] = useState([
      {
         id: 1,
         name: 'Mai Xuân Toàn',
         address: '1135 Huỳnh Tấn Phát',
         city: 'TP Hồ Chí Minh - Quận 7 - Phường Phú Thuận',
         phone: '0333084060',
      },
   ]);

   const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleAddressChange = (e: { target: { name: any; value: any; }; }) => {
      const { name, value } = e.target;
      setEditingAddress((prev) => ({ ...(prev || {}), [name]: value }));
   };

   const handleSaveProfile = () => {
      setIsEditing(false);
   };

   const handleAddOrEditAddress = () => {
      if (editingAddress && editingAddress.id) {
         // Edit existing address
         setAddresses((prev) =>
            prev.map((addr) =>
               addr.id === editingAddress.id ? { ...addr, ...editingAddress } : addr
            )
         );
      } else {
         // Add new address
         setAddresses((prev) => [
            ...prev,
            {
               id: Date.now(),
               name: editingAddress.name || '',
               address: editingAddress.address || '',
               city: editingAddress.city || '',
               phone: editingAddress.phone || '',
            },
         ]);
      }
      setIsAddressModalOpen(false);
      setEditingAddress({});
   };

   const handleDeleteAddress = (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
         setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      }
   };

   return (
      <div className='flex flex-col min-h-screen bg-gray-50'>
         <Head>
            <title>Thông tin cá nhân | Candle Bliss</title>
            <meta name='description' content='Thông tin cá nhân Candle Bliss' />
         </Head>

         {/* Header */}
         <Header />

         {/* Breadcrumb */}
         <div className='bg-gray-100 py-3'>
            <div className='container mx-auto px-4'>
               <nav className='flex items-center text-sm'>
                  <Link href='/' className='hover:text-amber-600'>
                     Trang chủ
                  </Link>
                  <span className='mx-2 text-gray-400'>{'>'}</span>
                  <span className='text-gray-500'>Thông tin cá nhân</span>
               </nav>
            </div>
         </div>

         {/* Main Content */}
         <main className='flex-grow container mx-auto px-4 py-6'>
            <div className='flex flex-col md:flex-row gap-8'>
               {/* Sidebar */}
               <MenuProfile />

               {/* Main Section */}
               <div className='w-full md:w-3/4 space-y-6'>
                  {/* Account Information */}
                  <section className='bg-white p-6 rounded-lg shadow-sm border'>
                     <h2 className='text-xl font-semibold text-gray-800 mb-4'>Thông tin tài khoản</h2>
                     <div className='flex justify-between items-center'>
                        <div>
                           <p className='text-gray-700'>Họ tên: {formData.name}</p>
                           <p className='text-gray-700'>Email: {formData.email}</p>
                           <p className='text-gray-700'>Số điện thoại: {formData.phone}</p>
                           <p className='text-gray-700'>Ngày sinh: {formData.birthday}</p>
                        </div>
                        <button
                           className='text-amber-600 flex items-center hover:text-amber-800'
                           onClick={() => setIsEditing(true)}
                        >
                           <FaPencilAlt className='mr-1' />
                           <span>Chỉnh sửa</span>
                        </button>
                     </div>
                  </section>

                  {/* Shipping Address */}
                  <section className='bg-white p-6 rounded-lg shadow-sm border'>
                     <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>Địa chỉ giao hàng</h3>
                        <button
                           className='text-amber-600 flex items-center text-sm hover:text-amber-800'
                           onClick={() => {
                              setEditingAddress({ name: '', address: '', city: '', phone: '' });
                              setIsAddressModalOpen(true);
                           }}
                        >
                           <FaPlus className='mr-1' />
                           <span>Thêm địa chỉ mới</span>
                        </button>
                     </div>
                     <div className='space-y-4'>
                        {addresses.map((addr) => (
                           <div key={addr.id} className='border p-4 rounded-lg flex justify-between items-center'>
                              <div>
                                 <p className='text-gray-700'>Họ tên: {addr.name}</p>
                                 <p className='text-gray-700'>Địa chỉ: {addr.address}</p>
                                 <p className='text-gray-700'>Tỉnh/Thành: {addr.city}</p>
                                 <p className='text-gray-700'>Số điện thoại: {addr.phone}</p>
                              </div>
                              <div className='flex space-x-2'>
                                 <button
                                    className='text-amber-600 hover:text-amber-800'
                                    onClick={() => {
                                       setEditingAddress(addr);
                                       setIsAddressModalOpen(true);
                                    }}
                                 >
                                    <FaPencilAlt />
                                 </button>
                                 <button
                                    className='text-red-600 hover:text-red-800'
                                    onClick={() => handleDeleteAddress(addr.id)}
                                 >
                                    <FaTrash />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>
            </div>
         </main>

         {/* Footer */}
         <Footer />

         {/* Address Modal */}
         {isAddressModalOpen && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
               <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
                  <h2 className='text-lg font-semibold text-gray-800 mb-4'>
                     {editingAddress?.id ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                  </h2>
                  <div className='space-y-4'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Họ tên</label>
                        <input
                           type='text'
                           name='name'
                           value={editingAddress?.name || ''}
                           onChange={handleAddressChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Địa chỉ</label>
                        <input
                           type='text'
                           name='address'
                           value={editingAddress?.address || ''}
                           onChange={handleAddressChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Tỉnh/Thành</label>
                        <input
                           type='text'
                           name='city'
                           value={editingAddress?.city || ''}
                           onChange={handleAddressChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Số điện thoại</label>
                        <input
                           type='tel'
                           name='phone'
                           value={editingAddress?.phone || ''}
                           onChange={handleAddressChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                  </div>
                  <div className='mt-6 flex justify-end space-x-4'>
                     <button
                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
                        onClick={() => setIsAddressModalOpen(false)}
                     >
                        Hủy
                     </button>
                     <button
                        className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
                        onClick={handleAddOrEditAddress}
                     >
                        Lưu
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Profile Modal */}
         {isEditing && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
               <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md'>
                  <h2 className='text-lg font-semibold text-gray-800 mb-4'>Chỉnh sửa thông tin</h2>
                  <div className='space-y-4'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Họ tên</label>
                        <input
                           type='text'
                           name='name'
                           value={formData.name}
                           onChange={handleInputChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Số điện thoại</label>
                        <input
                           type='tel'
                           name='phone'
                           value={formData.phone}
                           onChange={handleInputChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700'>Ngày sinh</label>
                        <input
                           type='text'
                           name='birthday'
                           value={formData.birthday}
                           onChange={handleInputChange}
                           className='w-full px-4 py-2 border rounded-md focus:ring-amber-500 focus:border-amber-500'
                        />
                     </div>
                  </div>
                  <div className='mt-6 flex justify-end space-x-4'>
                     <button
                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'
                        onClick={() => setIsEditing(false)}
                     >
                        Hủy
                     </button>
                     <button
                        className='px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700'
                        onClick={handleSaveProfile}
                     >
                        Lưu
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
