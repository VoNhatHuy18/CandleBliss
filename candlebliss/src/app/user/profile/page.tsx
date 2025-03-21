"use client";

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

import Image from "next/image";

// Nội dung cho từng tab
const ProfileContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Thông tin cá nhân</h2>

      <div className="flex flex-col md:flex-row gap-8">
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

const OrdersContent = () => (
   <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Quản lý đơn hàng</h2>

      <div className="bg-amber-50 p-4 rounded-lg mb-6 flex items-center">
         <div className="mr-4 text-amber-600">
            <FaShoppingBag size={20} />
         </div>
         <p className="text-amber-800">Bạn có 3 đơn hàng đang được xử lý</p>
      </div>

      <div className="space-y-4">
         {[1, 2, 3].map((order) => (
            <div key={order} className="border rounded-lg p-4 hover:shadow-md transition">
               <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Đơn hàng #{1000 + order}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order === 1 ? "bg-blue-100 text-blue-800" :
                     order === 2 ? "bg-amber-100 text-amber-800" :
                        "bg-green-100 text-green-800"
                     }`}>
                     {order === 1 ? "Đang giao" : order === 2 ? "Đang xử lý" : "Hoàn thành"}
                  </span>
               </div>
               <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Ngày đặt: {`${20 + order}/03/2025`}</span>
                  <span>Tổng tiền: {320000 + order * 50000}đ</span>
               </div>
               <button className="text-amber-600 text-sm font-medium flex items-center hover:underline">
                  Xem chi tiết <FaChevronRight size={12} className="ml-1" />
               </button>
            </div>
         ))}
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

const UserProfile = () => {
   const [activeContent, setActiveContent] = useState<JSX.Element>(<ProfileContent />);
   const [selectedTab, setSelectedTab] = useState("profile");

   const handleTabChange = (tab: string, content: JSX.Element) => {
      setSelectedTab(tab);
      setActiveContent(content);
   };

   return (
      <>
         <Header />
         <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
               <MenuProfile
                  selectedTab={selectedTab}
                  onTabChange={(tab, content) => handleTabChange(tab, content)}
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
   onTabChange: (tab: string, content: JSX.Element) => void;
}

const MenuProfile: React.FC<MenuProfileProps> = ({ selectedTab, onTabChange }) => {
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

   const menuItems = [
      {
         label: "Thông tin cá nhân",
         icon: FaUser,
         tab: "profile",
         content: <ProfileContent />
      },
      {
         label: "Quản lý đơn hàng",
         icon: FaShoppingBag,
         tab: "orders",
         content: <OrdersContent />,
         badge: 3,
      },
      {
         label: "Sản phẩm yêu thích",
         icon: FaHeart,
         tab: "wishlist",
         content: <WishlistContent />,
      },
      {
         label: "Địa chỉ của tôi",
         icon: FaAddressBook,
         tab: "addresses",
         content: <AddressesContent />,
      },
      {
         label: "Đánh giá sản phẩm",
         icon: FaStar,
         tab: "reviews",
         content: <ReviewsContent />,
         badge: 2,
      },
      {
         label: "Hỗ trợ & Góp ý",
         icon: FaHeadset,
         tab: "support",
         content: <SupportContent />,
         badge: 1,
      }
      ,
   ];

   // Xử lý khi chọn tab
   const handleTabSelect = (tab: string) => {
      if (tab === "logout") {
         setShowLogoutConfirm(true);
         return;
      }

      // Find the selected menu item by tab and pass its content to parent component
      const selectedMenuItem = menuItems.find(item => item.tab === tab);
      if (selectedMenuItem && selectedMenuItem.content) {
         onTabChange(tab, selectedMenuItem.content);
      }
   };



   return (
      <div className="w-full md:w-1/4">
         <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            {/* User profile card */}
            <div className="py-5 border-b bg-gradient-to-r from-amber-50 to-amber-100">
               <div className="flex items-center">

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
                     <button
                        className={`flex items-center w-full py-3.5 px-5 transition duration-150
                           ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                           : selectedTab === item.tab
                              ? "font-medium text-amber-700"
                              : "text-gray-700 hover:bg-amber-50"
                           }`}
                        onClick={() => handleTabSelect(item.tab)}
                     >

                        <span>{item.label}</span>
                        {item.badge && (
                           <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {item.badge}
                           </span>
                        )}
                     </button>
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


      </div>
   );
};

export default UserProfile;