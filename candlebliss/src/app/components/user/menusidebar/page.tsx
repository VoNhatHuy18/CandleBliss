"use client"

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MenuItemProps {
  label: string;
  children?: ReactNode;
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

const MenuItem = ({ label, children, icon: Icon }: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
          <span className="text-gray-700">{label}</span>
        </div>
        {children && (
          isOpen ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>
      {children && isOpen && (
        <div className="pl-8">
          {children}
        </div>
      )}
    </div>
  );
};

const MenuSidebar = () => {
  return (
    <div className="w-64 bg-[#F1EEE9]  border border-[#553C2680] rounded-lg shadow-xl  ">
      <MenuItem 
        label="Nến Thơm Thiên Nhiên" 
        icon={(props) => (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            {...props}
          >
            <path d="M12 6.5c1.5-2 3.5-3 5.5-3 3.3 0 6 2.7 6 6 0 4.5-5 8.5-11.5 14C5.5 18 .5 14 .5 9.5c0-3.3 2.7-6 6-6 2 0 4 1 5.5 3z" />
          </svg>
        )}
      />
      
      <MenuItem 
        label="Tinh Dầu Khuếch Tán" 
        icon={(props) => (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            {...props}
          >
            <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
          </svg>
        )}
      >
        <MenuItem label="Tinh Dầu Khuếch Tán" />
        <MenuItem label="Túi Thơm" />
        <MenuItem label="Sáp Thơm" />
      </MenuItem>

      <MenuItem 
        label="Phụ Kiện Nến" 
        icon={(props) => (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            {...props}
          >
            <path d="M12 2v20M7 4v16M17 4v16" />
          </svg>
        )}
      />

      <MenuItem 
        label="Set Quà Tặng" 
        icon={(props) => (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            {...props}
          >
            <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        )}
      />
    </div>
  );
};

export default MenuSidebar;