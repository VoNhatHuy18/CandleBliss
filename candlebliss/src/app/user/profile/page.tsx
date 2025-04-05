"use client";

<<<<<<< HEAD
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
=======
import React, { useState, useEffect, JSX } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
   FaUser,
   FaShoppingBag,
   FaStar,
   FaHeadset,
   FaSignOutAlt,
   FaAddressBook,
   FaHeart,
   FaChevronRight
} from "react-icons/fa";

import Header from "@/app/components/user/nav/page";
import Footer from "@/app/components/user/footer/page";
import ViewedCarousel from "@/app/components/user/viewedcarousel/page";
>>>>>>> ce22191061c859f1dca86f7ad4479ce84adbced1

import Image from "next/image";
import Link from "next/link";

// Nội dung cho từng tab
const ProfileContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Thông tin cá nhân</h2>

      <div className="flex flex-col md:flex-row gap-8">
         <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
               <Image
                  src=""
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-amber-100"
               />
               <button className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600">
                  <FaUser size={14} />
               </button>
            </div>
            <h3 className="text-xl font-semibold">Mai Xuân Toàn</h3>
            <p className="text-gray-500">Thành viên từ 03/2023</p>
         </div>

         <div className="w-full md:w-2/3">
            <form className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                     <input type="text" defaultValue="Mai Xuân Toàn" className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                     <input type="email" defaultValue="maixuantoan@gmail.com" className="w-full p-3 border rounded-lg" readOnly />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                     <input type="tel" defaultValue="0912345678" className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                     <input type="date" defaultValue="1990-01-01" className="w-full p-3 border rounded-lg" />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                  <textarea className="w-full p-3 border rounded-lg" rows={3}
                     defaultValue="Tôi yêu thích mùi hương từ nến thơm tự nhiên."></textarea>
               </div>

               <div className="pt-2">
                  <button type="submit" className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                     Lưu thay đổi
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
);



const WishlistContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Sản phẩm yêu thích</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border rounded-lg overflow-hidden hover:shadow-md transition group">
               <div className="relative h-48">
                  <div className="absolute inset-0 bg-gray-200"></div>
                  <button className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-2 shadow-sm">
                     <FaHeart />
                  </button>
               </div>
               <div className="p-4">
                  <h3 className="font-medium mb-2 group-hover:text-amber-600">Nến thơm lavender {item}</h3>
                  <p className="text-amber-600 font-medium mb-2">{180000 + item * 20000}đ</p>
                  <button className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                     Thêm vào giỏ hàng
                  </button>
               </div>
            </div>
         ))}
      </div>
   </div>
);

const AddressesContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center pb-4 border-b">
         <h2 className="text-2xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
         <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            Thêm địa chỉ mới
         </button>
      </div>

      <div className="space-y-4">
         {[
            { id: 1, name: "Nhà riêng", address: "123 Nguyễn Văn Linh, Quận 7, TP. HCM", phone: "0912345678", isDefault: true },
            { id: 2, name: "Văn phòng", address: "456 Lê Lợi, Quận 1, TP. HCM", phone: "0987654321", isDefault: false }
         ].map((address) => (
            <div key={address.id} className="border rounded-lg p-4 relative">
               {address.isDefault && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                     Mặc định
                  </span>
               )}
               <div className="mb-3">
                  <h3 className="font-medium">{address.name}</h3>
               </div>
               <p className="text-gray-600 mb-2">{address.address}</p>
               <p className="text-gray-600 mb-4">SĐT: {address.phone}</p>
               <div className="flex space-x-3">
                  <button className="text-amber-600 text-sm font-medium hover:underline">Chỉnh sửa</button>
                  <span className="text-gray-300">|</span>
                  <button className="text-gray-600 text-sm font-medium hover:underline">Xóa</button>
                  {!address.isDefault && (
                     <>
                        <span className="text-gray-300">|</span>
                        <button className="text-amber-600 text-sm font-medium hover:underline">Đặt làm mặc định</button>
                     </>
                  )}
               </div>
            </div>
         ))}
      </div>
   </div>
);

const ReviewsContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Đánh giá sản phẩm</h2>

      <div className="bg-amber-50 p-4 rounded-lg mb-6 flex items-center">
         <div className="mr-4 text-amber-600">
            <FaStar size={20} />
         </div>
         <p className="text-amber-800">Bạn có 2 sản phẩm cần đánh giá</p>
      </div>

      <div className="space-y-6">
         {[1, 2].map((review) => (
            <div key={review} className="border rounded-lg p-4">
               <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded mr-3"></div>
                  <div>
                     <h3 className="font-medium">Nến thơm hương vanilla {review}</h3>
                     <p className="text-gray-500 text-sm">Đã mua ngày {10 + review}/03/2025</p>
                  </div>
               </div>

               <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-2">Đánh giá của bạn:</p>
                  <div className="flex">
                     {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                           key={star}
                           className={star <= 4 ? "text-amber-500" : "text-gray-300"}
                           size={20}
                        />
                     ))}
                  </div>
               </div>

               <textarea
                  className="w-full p-3 border rounded-lg mb-3"
                  placeholder="Viết đánh giá của bạn..."
                  rows={3}
                  defaultValue={review === 1 ? "Sản phẩm rất thơm, thời gian cháy lâu đúng như mô tả." : ""}
               ></textarea>

               <div className="flex justify-end">
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                     {review === 1 ? "Chỉnh sửa đánh giá" : "Gửi đánh giá"}
                  </button>
               </div>
            </div>
         ))}
      </div>
   </div>
);

const SupportContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Hỗ trợ & Góp ý</h2>

      <div className="space-y-6">
         <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
               <FaHeadset className="mr-2" />
               Liên hệ hỗ trợ
            </h3>
            <p className="text-gray-600 mb-4">
               Bạn cần giúp đỡ? Hãy liên hệ với đội ngũ hỗ trợ của chúng tôi qua các kênh sau:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="border bg-white p-3 rounded-lg">
                  <p className="font-medium">Hotline</p>
                  <p className="text-amber-600">1900 1234</p>
               </div>
               <div className="border bg-white p-3 rounded-lg">
                  <p className="font-medium">Email</p>
                  <p className="text-amber-600">support@candlebliss.com</p>
               </div>
            </div>
         </div>

         <div>
            <h3 className="font-medium text-gray-800 mb-3">Gửi góp ý</h3>
            <form className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input type="text" className="w-full p-3 border rounded-lg" placeholder="Nhập tiêu đề góp ý" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea className="w-full p-3 border rounded-lg" rows={5} placeholder="Nhập nội dung góp ý của bạn"></textarea>
               </div>
               <div>
                  <button type="submit" className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                     Gửi góp ý
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
);

<<<<<<< HEAD
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
=======
const UserProfile = () => {
   const [activeContent, setActiveContent] = useState<JSX.Element>(<ProfileContent />);
   const [selectedTab, setSelectedTab] = useState("profile");
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      // Kiểm tra URL query param để xác định tab hiện tại
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');

      if (tabParam && tabParam !== 'orders') {
         // Xác định tab nếu không phải orders (orders sẽ chuyển hướng)
         const availableTabs = ["profile", "wishlist", "addresses", "reviews", "support"];
         if (availableTabs.includes(tabParam)) {
            handleTabChange(tabParam);
         }
      }
   }, [pathname]);

   const handleTabChange = (tab: string) => {
      if (tab === "orders") {
         router.push("/user/order");
         return;
      }

      setSelectedTab(tab);

      // Cập nhật nội dung theo tab
      switch (tab) {
         case "profile":
            setActiveContent(<ProfileContent />);
            break;
         case "wishlist":
            setActiveContent(<WishlistContent />);
            break;
         case "addresses":
            setActiveContent(<AddressesContent />);
            break;
         case "reviews":
            setActiveContent(<ReviewsContent />);
            break;
         case "support":
            setActiveContent(<SupportContent />);
            break;
         default:
            setActiveContent(<ProfileContent />);
      }

      // Cập nhật URL
      router.push(`${pathname}?tab=${tab}`, { scroll: false });
   };

   return (
      <>
         <Header />
         <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
               <MenuProfile
                  selectedTab={selectedTab}
                  onTabChange={handleTabChange}
               />
               <div className="w-full md:w-3/4">
                  {activeContent}
               </div>
            </div>
         </div>
         <ViewedCarousel />
         <Footer />
      </>
   );
};

interface MenuProfileProps {
   selectedTab: string;
   onTabChange: (tab: string) => void;
}

const MenuProfile: React.FC<MenuProfileProps> = ({ selectedTab, onTabChange }) => {
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const router = useRouter();

   const menuItems = [
      {
         label: "Thông tin cá nhân",
         icon: FaUser,
         tab: "profile",
      },
      {
         label: "Quản lý đơn hàng",
         icon: FaShoppingBag,
         tab: "orders",
         badge: 3,
         externalLink: true
      },
      {
         label: "Sản phẩm yêu thích",
         icon: FaHeart,
         tab: "wishlist",
      },
      {
         label: "Địa chỉ của tôi",
         icon: FaAddressBook,
         tab: "addresses",
      },
      {
         label: "Đánh giá sản phẩm",
         icon: FaStar,
         tab: "reviews",
         badge: 2,
      },
      {
         label: "Hỗ trợ & Góp ý",
         icon: FaHeadset,
         tab: "support",
         badge: 1,
      },
      {
         label: "Đăng xuất",
         icon: FaSignOutAlt,
         tab: "logout",
         isDanger: true
      }
   ];

   // Xử lý khi chọn tab
   const handleTabSelect = (tab: string) => {
      if (tab === "logout") {
         setShowLogoutConfirm(true);
         return;
      }

      // Gọi hàm callback để đặt tab mới
      onTabChange(tab);
   };

   const handleLogout = () => {
      // Xử lý logic đăng xuất
      localStorage.removeItem("token");
      router.push('/user/signin');
      setShowLogoutConfirm(false);
   };

   return (
      <div className="w-full md:w-1/4">
         <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            {/* User profile card */}
            <div className="py-5 border-b bg-gradient-to-r from-amber-50 to-amber-100">
               <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 ml-5">
                     <FaUser size={20} />
                  </div>
                  <div className="ml-4">
                     <h3 className="font-medium text-gray-800">Xin chào,</h3>
                     <p className="text-amber-700 font-semibold">Mai Xuân Toàn</p>
                  </div>
               </div>
            </div>

            {/* Menu list */}
            <div>
               {menuItems.map((item) => (
                  <div
                     key={item.tab}
                     className={`border-b last:border-none ${selectedTab === item.tab ? "bg-amber-50" : ""}`}
                  >
                     {item.externalLink ? (
                        <Link href="/user/order">
                           <div
                              className={`flex items-center w-full py-3.5 px-5 transition duration-150 ${item.isDanger
                                 ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                                 : "text-gray-700 hover:bg-amber-50"
                                 }`}
                           >
                              <item.icon className="mr-3 text-gray-500" />
                              <span>{item.label}</span>
                              {item.badge && (
                                 <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    {item.badge}
                                 </span>
                              )}
                           </div>
                        </Link>
                     ) : (
                        <button
                           className={`flex items-center w-full py-3.5 px-5 transition duration-150 ${item.isDanger
                              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                              : selectedTab === item.tab
                                 ? "font-medium text-amber-700"
                                 : "text-gray-700 hover:bg-amber-50"
                              }`}
                           onClick={() => handleTabSelect(item.tab)}
                        >
                           <item.icon className={`mr-3 ${item.isDanger
                              ? "text-red-500"
                              : selectedTab === item.tab
                                 ? "text-amber-600"
                                 : "text-gray-500"
                              }`} />
                           <span>{item.label}</span>
                           {item.badge && (
                              <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                 {item.badge}
                              </span>
                           )}
                        </button>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Need support card */}
         <div className="mt-4 bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">Cần hỗ trợ?</h3>
            <p className="text-gray-600 text-sm mb-3">
               Chúng tôi luôn sẵn sàng giúp đỡ bạn với mọi vấn đề.
            </p>
            <div className="flex space-x-2">
               <button
                  onClick={() => handleTabSelect("support")}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
               >
                  Liên hệ ngay
               </button>
               <span className="text-gray-400">|</span>
               <button
                  onClick={() => window.open("/faq", "_blank")}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
               >
                  Câu hỏi thường gặp
               </button>
            </div>
         </div>

         {/* Logout confirmation modal */}
         {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-sm mx-4 md:mx-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Xác nhận đăng xuất</h3>
                  <p className="text-gray-600 mb-5">
                     Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình?
                  </p>
                  <div className="flex justify-end space-x-3">
                     <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        onClick={() => setShowLogoutConfirm(false)}
>>>>>>> ce22191061c859f1dca86f7ad4479ce84adbced1
                     >
                        Hủy
                     </button>
                     <button
<<<<<<< HEAD
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
=======
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleLogout}
                     >
                        Đăng xuất
>>>>>>> ce22191061c859f1dca86f7ad4479ce84adbced1
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default UserProfile;