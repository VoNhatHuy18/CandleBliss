"use client";

import React, { useState } from "react";
import { FaUser, FaShoppingBag, FaStar, FaHeadset, FaSignOutAlt } from "react-icons/fa";

const MenuSidebar = () => {
  const [selectedTab, setSelectedTab] = useState("profile");

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
    },
    {
      label: "Đánh giá",
      icon: FaStar,
      tab: "reviews",
      badge: 2,
    },
    {
      label: "Hỗ trợ",
      icon: FaHeadset,
      tab: "support",
      badge: 1,
    },
    {
      label: "Đăng xuất",
      icon: FaSignOutAlt,
      tab: "logout",
    },
  ];

  return (
    <div className="w-full md:w-1/4">
      <div className="border rounded-lg overflow-hidden">
        {menuItems.map((item) => (
          <div key={item.tab} className="p-4 border-b last:border-none">
            <button
              className={`flex items-center w-full py-2 px-4 rounded-lg ${
                selectedTab === item.tab ? "bg-gray-100" : ""
              } hover:bg-gray-50`}
              onClick={() => setSelectedTab(item.tab)}
            >
              <item.icon className="mr-2" />
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
  );
};

export default MenuSidebar;