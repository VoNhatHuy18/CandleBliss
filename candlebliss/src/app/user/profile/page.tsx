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
   FaChevronRight,
   FaSpinner,
   FaExclamationTriangle
} from "react-icons/fa";

import Header from "@/app/components/user/nav/page";
import Footer from "@/app/components/user/footer/page";
import ViewedCarousel from "@/app/components/user/viewedcarousel/page";
>>>>>>> ce22191061c859f1dca86f7ad4479ce84adbced1

import Image from "next/image";
import Link from "next/link";

// User interface based on API response
interface UserRole {
   id: number;
   name: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   isDeleted: boolean;
   __entity: string;
}

interface UserStatus {
   id: number;
   name: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   isDeleted: boolean;
   __entity: string;
}

interface User {
   id: number;
   email: string;
   provider: string;
   socialId: null | string;
   firstName: string;
   lastName: string;
   role: UserRole;
   status: UserStatus;
   createdAt: string;
   updatedAt: string;
   deletedAt: null | string;
   phone: number;
}

interface Address {
   id?: number;
   fullName: string;
   phone: string;
   province: string;
   district: string;
   ward: string;
   streetAddress: string;
   isDefault?: boolean;
   userId?: number;
}

// API service for user data with authentication
const fetchUserProfile = async (): Promise<User> => {
   try {
      const token = localStorage.getItem("token");

      if (!token) {
         throw new Error("No authentication token found");
      }

      const response = await fetch('/api/v1/auth/me', {
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (response.status === 401) {
         throw new Error("Unauthorized");
      }

      if (!response.ok) {
         throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      return await response.json();
   } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
   }
};

// Update user profile function
const updateUserProfile = async (userData: any): Promise<User> => {
   try {
      const token = localStorage.getItem("token");

      if (!token) {
         throw new Error("No authentication token found");
      }

      const response = await fetch('/api/v1/users/profile', {
         method: 'PUT',
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(userData)
      });

      if (response.status === 401) {
         throw new Error("Unauthorized");
      }

      if (!response.ok) {
         throw new Error(`Failed to update user data: ${response.status}`);
      }

      return await response.json();
   } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
   }
};

// Profile content component with API integration
const ProfileContent: React.FC = () => {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [isSaving, setIsSaving] = useState(false);
   const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      phone: ""
   });
   const router = useRouter();

   useEffect(() => {
      const getUserData = async () => {
         try {
            setIsLoading(true);
            const userData = await fetchUserProfile();
            setUser(userData);
            setFormData({
               firstName: userData.firstName,
               lastName: userData.lastName,
               phone: userData.phone ? userData.phone.toString() : ""
            });
            setError(null);
         } catch (err) {
            if (err instanceof Error && err.message === "Unauthorized") {
               // Redirect to login if unauthorized
               router.push("/user/signin?redirect=/user/profile");
               return;
            }
            setError("Could not load profile data. Please try again later.");
         } finally {
            setIsLoading(false);
         }
      };

      getUserData();
   }, [router]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
         ...formData,
         [name]: value
      });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      try {
         // Format the data for submission
         const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone ? parseInt(formData.phone, 10) : undefined
         };
         
         await updateUserProfile(updateData);
         // Refresh user data after update
         const userData = await fetchUserProfile();
         setUser(userData);
         alert("Profile updated successfully");
      } catch (err) {
         if (err instanceof Error && err.message === "Unauthorized") {
            router.push("/user/signin?redirect=/user/profile");
            return;
         }
         alert("Failed to update profile. Please try again.");
      } finally {
         setIsSaving(false);
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-96">
            <div className="text-center">
               <FaSpinner className="animate-spin text-amber-600 text-3xl mx-auto mb-4" />
               <p className="text-gray-500">Loading profile information...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
               <FaExclamationTriangle className="mt-1 mr-3 flex-shrink-0" />
               <div>
                  <p className="font-medium mb-1">Could not load profile</p>
                  <p>{error}</p>
                  <button
                     className="mt-2 text-sm font-medium underline"
                     onClick={() => window.location.reload()}
                  >
                     Try again
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!user) return null;

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
         .toString()
         .padStart(2, "0")}/${date.getFullYear()}`;
   };

   const fullName = `${user.firstName} ${user.lastName}`;

   return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
         <h2 className="text-2xl font-semibold text-gray-800 pb-4 border-b">Thông tin cá nhân</h2>

         <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
               <div className="relative w-32 h-32 mb-4">
                  <Image
                     src="/default-avatar.png"
                     alt="Profile picture"
                     width={128}
                     height={128}
                     className="rounded-full object-cover border-4 border-amber-100"
                  />
                  <button className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600">
                     <FaUser size={14} />
                  </button>
               </div>
               <h3 className="text-xl font-semibold">{fullName}</h3>
               <p className="text-gray-500">Thành viên từ {formatDate(user.createdAt)}</p>
               <div className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                  {user.role.name}
               </div>
            </div>

            <div className="w-full md:w-2/3">
               <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                        <input
                           type="text"
                           name="firstName"
                           value={formData.firstName}
                           onChange={handleInputChange}
                           className="w-full p-3 border rounded-lg"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                        <input
                           type="text"
                           name="lastName"
                           value={formData.lastName}
                           onChange={handleInputChange}
                           className="w-full p-3 border rounded-lg"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                           type="email"
                           value={user.email}
                           className="w-full p-3 border rounded-lg bg-gray-50"
                           readOnly
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                           type="tel"
                           name="phone"
                           value={formData.phone}
                           onChange={handleInputChange}
                           className="w-full p-3 border rounded-lg"
                        />
                     </div>
                  </div>

                  <div className="pt-2 flex items-center">
                     <button
                        type="submit"
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center"
                        disabled={isSaving}
                     >
                        {isSaving && <FaSpinner className="animate-spin mr-2" />}
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                     </button>

                     {user.status.name === "Inactive" && (
                        <div className="ml-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm">
                           Tài khoản chưa kích hoạt
                        </div>
                     )}
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

// Updated AddressesContent component with enhanced address handling
const AddressesContent = () => {
   const [addresses, setAddresses] = useState<Address[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
   const [userInfo, setUserInfo] = useState<any>(null);

   // Form for new address
   const [newAddress, setNewAddress] = useState<Address>({
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
      isDefault: false
   });

   // Location data
   const [provinces, setProvinces] = useState<{ id: string, name: string }[]>([]);
   const [districts, setDistricts] = useState<{ id: string, name: string }[]>([]);
   const [wards, setWards] = useState<{ id: string, name: string }[]>([]);

   const router = useRouter();

   // Fetch user info and addresses on component mount
   useEffect(() => {
      const initialize = async () => {
         try {
            setIsLoading(true);

            // Get the user ID from localStorage
            const storedUserId = localStorage.getItem('userId');

            if (!storedUserId) {
               router.push("/user/signin?redirect=/user/profile?tab=addresses");
               return;
            }

            const userId = parseInt(storedUserId);

            // First fetch user info
            await loadUserInfo(userId);

            // Then fetch user addresses
            await loadUserAddresses(userId);

            // Finally fetch provinces for the form
            await fetchProvinces();

         } catch (err) {
            if (err instanceof Error && err.message === "Unauthorized") {
               router.push("/user/signin?redirect=/user/profile?tab=addresses");
               return;
            }
            setError("Không thể tải dữ liệu địa chỉ. Vui lòng thử lại sau.");
         } finally {
            setIsLoading(false);
         }
      };

      initialize();
   }, [router]);

   // Load user information
   const loadUserInfo = async (userId: number) => {
      try {
         const token = localStorage.getItem('token');

         if (!token) {
            throw new Error("No authentication token found");
         }

         const response = await fetch(`/api/v1/auth/me`, {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
            },
         });

         if (response.status === 401) {
            throw new Error("Unauthorized");
         }

         if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
         }

         const userData = await response.json();
         setUserInfo(userData);

         // Pre-fill the new address form with user info
         setNewAddress(prev => ({
            ...prev,
            fullName: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone?.toString() || ''
         }));

      } catch (error) {
         console.error("Error loading user info:", error);
         throw error;
      }
   };

   // Find addresses by user ID - similar to checkout page approach
   const findAddressesByUserId = async (userId: number) => {
      try {
         const token = localStorage.getItem('token');
         if (!token) return [];

         // Create an array with possible IDs
         const addressIds = Array.from({ length: 20 }, (_, i) => i + 1);

         // Get all addresses and check ownership
         const addressPromises = addressIds.map(id =>
            fetch(`/api/v1/address/${id}`, {
               headers: { 'Authorization': `Bearer ${token}` }
            })
               .then(res => res.ok ? res.json() : null)
               .then(data => {
                  if (!data) return null;

                  // Check if address belongs to current user
                  const addressUserId = data.user?.id || data.userId;

                  if (addressUserId === userId) {
                     // Get recipient info
                     const receiverName = data.fullName ||
                        (data.user ?
                           `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() :
                           (userInfo ?
                              `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''))

                     // Get phone number
                     const receiverPhone = data.phone ||
                        (data.user?.phone?.toString() ||
                           userInfo?.phone?.toString() || '')

                     return {
                        id: data.id,
                        fullName: receiverName,
                        phone: receiverPhone,
                        province: data.province || '',
                        district: data.district || '',
                        ward: data.ward || '',
                        streetAddress: data.street || '',
                        isDefault: data.isDefault || false,
                        userId: userId
                     };
                  }
                  return null;
               })
               .catch(() => null)
         );

         const results = await Promise.all(addressPromises);
         return results.filter(addr => addr !== null) as Address[];

      } catch (error) {
         console.error("Error searching addresses:", error);
         return [];
      }
   };

   // Load user addresses - similar to checkout page
   const loadUserAddresses = async (userId: number) => {
      try {
         // Find addresses that belong to the user
         const validAddresses = await findAddressesByUserId(userId);
         console.log('Valid addresses found:', validAddresses.length);

         if (validAddresses.length > 0) {
            setAddresses(validAddresses);
         } else {
            // No addresses
            setAddresses([]);

            // When there are no addresses, set isDefault to true for the new address form
            setNewAddress(prev => ({
               ...prev,
               isDefault: true
            }));
         }
      } catch (error) {
         console.error('Error loading addresses:', error);
         setError("Không thể tải địa chỉ. Vui lòng thử lại sau.");
      }
   };

   // Load provinces from API
   const fetchProvinces = async () => {
      try {
         const response = await fetch('https://provinces.open-api.vn/api/p/');
         if (response.ok) {
            const data = await response.json();
            setProvinces(data.map((p: any) => ({ id: p.code, name: p.name })));
         }
      } catch (error) {
         console.error('Error fetching provinces:', error);
         // Sample data if API fails
         setProvinces([
            { id: '1', name: 'Hà Nội' },
            { id: '2', name: 'TP. Hồ Chí Minh' },
            { id: '3', name: 'Đà Nẵng' }
         ]);
      }
   };

   // Load districts based on province
   const fetchDistricts = async (provinceId: string) => {
      try {
         const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
         if (response.ok) {
            const data = await response.json();
            setDistricts(data.districts.map((d: any) => ({ id: d.code, name: d.name })));
         }
      } catch (error) {
         console.error('Error fetching districts:', error);
         // Sample data if API fails
         setDistricts([
            { id: '1', name: 'Quận 1' },
            { id: '2', name: 'Quận 2' },
            { id: '3', name: 'Quận 3' }
         ]);
      }
   };

   // Load wards based on district
   const fetchWards = async (districtId: string) => {
      try {
         const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
         if (response.ok) {
            const data = await response.json();
            setWards(data.wards.map((w: any) => ({ id: w.code, name: w.name })));
         }
      } catch (error) {
         console.error('Error fetching wards:', error);
         // Sample data if API fails
         setWards([
            { id: '1', name: 'Phường 1' },
            { id: '2', name: 'Phường 2' },
            { id: '3', name: 'Phường 3' }
         ]);
      }
   };

   // Get a specific address by ID
   const fetchAddressById = async (addressId: number) => {
      try {
         console.log(`Fetching address with ID: ${addressId}`);

         const token = localStorage.getItem('token');
         if (!token) {
            throw new Error("No authentication token found");
         }

         const response = await fetch(`/api/v1/address/${addressId}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            if (response.status === 401) {
               throw new Error("Unauthorized");
            }
            throw new Error(`Failed to fetch address: ${response.status}`);
         }

         const addressData = await response.json();

         // Check if address belongs to current user
         const addressUserId = addressData.user?.id || addressData.userId;
         const currentUserId = parseInt(localStorage.getItem('userId') || '0');

         if (addressUserId === currentUserId) {
            // Get recipient name
            const receiverName = addressData.fullName ||
               (addressData.user ?
                  `${addressData.user.firstName || ''} ${addressData.user.lastName || ''}`.trim() :
                  (userInfo ?
                     `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''))

            // Get phone number
            const receiverPhone = addressData.phone ||
               (addressData.user?.phone?.toString() ||
                  userInfo?.phone?.toString() || '')

            // Format data according to Address interface
            const formattedAddress: Address = {
               id: addressData.id,
               fullName: receiverName,
               phone: receiverPhone,
               province: addressData.province || '',
               district: addressData.district || '',
               ward: addressData.ward || '',
               streetAddress: addressData.street || '',
               isDefault: addressData.isDefault || false,
               userId: currentUserId
            };

            return formattedAddress;
         }

         return null;
      } catch (error) {
         console.error('Error fetching address by ID:', error);
         throw error;
      }
   };

   // Update or create an address
   const updateAddress = async (addressData: any) => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            throw new Error("No authentication token found");
         }

         // Determine if this is an update or a new address
         const isUpdate = !!addressData.id;
         const url = isUpdate
            ? `/api/v1/address/${addressData.id}`
            : '/api/v1/address';

         const method = isUpdate ? 'PATCH' : 'POST';

         const response = await fetch(url, {
            method: method,
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
         });

         if (response.status === 401) {
            throw new Error("Unauthorized");
         }

         if (!response.ok) {
            throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} address: ${response.status}`);
         }

         const savedAddress = await response.json();
         return savedAddress;
      } catch (error) {
         console.error(`Error ${addressData.id ? 'updating' : 'creating'} address:`, error);
         throw error;
      }
   };

   // Delete an address
   const deleteAddress = async (addressId: number) => {
      try {
         const token = localStorage.getItem('token');
         if (!token) {
            throw new Error("No authentication token found");
         }

         const response = await fetch(`/api/v1/address/${addressId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (response.status === 401) {
            throw new Error("Unauthorized");
         }

         if (!response.ok) {
            throw new Error(`Failed to delete address: ${response.status}`);
         }

         return true;
      } catch (error) {
         console.error('Error deleting address:', error);
         throw error;
      }
   };

   // Form input handlers
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
         const target = e.target as HTMLInputElement;
         setNewAddress(prev => ({ ...prev, [name]: target.checked }));
      } else {
         setNewAddress(prev => ({ ...prev, [name]: value }));
      }
   };

   const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const provinceId = e.target.value;
      const provinceName = e.target.options[e.target.selectedIndex].text;

      // Update province in form
      setNewAddress(prev => ({
         ...prev,
         province: provinceName,
         district: '', // Reset district
         ward: '' // Reset ward
      }));

      // Load districts
      fetchDistricts(provinceId);

      // Reset wards
      setWards([]);
   };

   const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const districtId = e.target.value;
      const districtName = e.target.options[e.target.selectedIndex].text;

      setNewAddress(prev => ({ ...prev, district: districtName }));
      fetchWards(districtId);
      setNewAddress(prev => ({ ...prev, ward: '' }));
   };

   const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const wardId = e.target.value;
      const wardName = e.target.options[e.target.selectedIndex].text;

      setNewAddress(prev => ({ ...prev, ward: wardName }));
   };

   // Open add modal
   const openAddModal = () => {
      setNewAddress({
         fullName: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '',
         phone: userInfo?.phone?.toString() || '',
         province: '',
         district: '',
         ward: '',
         streetAddress: '',
         isDefault: addresses.length === 0 // First address is default
      });
      setShowAddModal(true);
   };

   // Open edit modal
   const openEditModal = async (address: Address) => {
      try {
         setIsLoading(true);

         // Get address info and check permissions
         const addressData = await fetchAddressById(address.id!);

         if (addressData) {
            // Find province in list
            const matchedProvince = provinces.find(p => p.name.toLowerCase() === addressData.province.toLowerCase());
            if (matchedProvince) {
               // Load districts based on province
               await fetchDistricts(matchedProvince.id);

               // After loading districts, find current district
               const matchedDistrict = districts.find(d => d.name.toLowerCase() === addressData.district.toLowerCase());
               if (matchedDistrict) {
                  // Load wards based on district
                  await fetchWards(matchedDistrict.id);
               }
            }

            setCurrentAddress(addressData);
            setNewAddress(addressData);
            setShowEditModal(true);
         } else {
            setError("Không thể tải thông tin địa chỉ");
         }
      } catch (error) {
         console.error('Error in openEditModal:', error);
         setError("Đã xảy ra lỗi khi tải thông tin địa chỉ");
      } finally {
         setIsLoading(false);
      }
   };

   // Open delete modal
   const openDeleteModal = (address: Address) => {
      setCurrentAddress(address);
      setShowDeleteModal(true);
   };

   // Handle add address
   const handleAddAddress = async (e: React.FormEvent) => {
      e.preventDefault();

      // Form validation
      if (!newAddress.fullName || !newAddress.phone || !newAddress.province ||
         !newAddress.district || !newAddress.ward || !newAddress.streetAddress) {
         setError("Vui lòng điền đầy đủ thông tin địa chỉ");
         return;
      }

      // Vietnamese phone validation 
      const phoneString = String(newAddress.phone);
      const phoneRegex = /([3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneString)) {
         setError("Số điện thoại không hợp lệ");
         return;
      }

      try {
         setIsLoading(true);

         // Prepare data for API
         const addressData = {
            fullName: String(newAddress.fullName).trim(),
            phone: String(newAddress.phone).trim(),
            province: String(newAddress.province).toLowerCase(),
            district: String(newAddress.district).toLowerCase(),
            ward: String(newAddress.ward).toLowerCase(),
            street: String(newAddress.streetAddress), // Change field name for API
            userId: parseInt(localStorage.getItem('userId') || '0'),
            isDefault: newAddress.isDefault
         };

         const savedAddress = await updateAddress(addressData);

         // Convert returned data to match Address interface
         const formattedAddress: Address = {
            id: savedAddress.id,
            fullName: newAddress.fullName,
            phone: newAddress.phone,
            province: savedAddress.province,
            district: savedAddress.district,
            ward: savedAddress.ward,
            streetAddress: savedAddress.street,
            isDefault: savedAddress.isDefault,
            userId: parseInt(localStorage.getItem('userId') || '0')
         };

         // Add to address list
         setAddresses(prev => [...prev, formattedAddress]);

         // If this is default, update other addresses
         if (formattedAddress.isDefault) {
            setAddresses(prev =>
               prev.map(addr =>
                  addr.id !== formattedAddress.id ? { ...addr, isDefault: false } : addr
               )
            );
         }

         // Reset form and close modal
         setShowAddModal(false);
         setError(null);
      } catch (err) {
         setError("Không thể thêm địa chỉ. Vui lòng thử lại.");
      } finally {
         setIsLoading(false);
      }
   };

   // Handle update address
   const handleUpdateAddress = async (e: React.FormEvent) => {
      e.preventDefault();

      // Form validation
      if (!newAddress.fullName || !newAddress.phone || !newAddress.province ||
         !newAddress.district || !newAddress.ward || !newAddress.streetAddress) {
         setError("Vui lòng điền đầy đủ thông tin địa chỉ");
         return;
      }

      // Vietnamese phone validation
      const phoneString = String(newAddress.phone);
      const phoneRegex = /([3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneString)) {
         setError("Số điện thoại không hợp lệ");
         return;
      }

      if (!currentAddress) return;

      try {
         setIsLoading(true);

         // Prepare data for API
         const addressData = {
            id: currentAddress.id,
            fullName: String(newAddress.fullName).trim(),
            phone: String(newAddress.phone).trim(),
            province: String(newAddress.province).toLowerCase(),
            district: String(newAddress.district).toLowerCase(),
            ward: String(newAddress.ward).toLowerCase(),
            street: String(newAddress.streetAddress), // Change field name for API
            userId: parseInt(localStorage.getItem('userId') || '0'),
            isDefault: newAddress.isDefault
         };

         const updatedAddress = await updateAddress(addressData);

         // Convert returned data to match Address interface
         const formattedAddress: Address = {
            id: updatedAddress.id,
            fullName: newAddress.fullName,
            phone: newAddress.phone,
            province: updatedAddress.province,
            district: updatedAddress.district,
            ward: updatedAddress.ward,
            streetAddress: updatedAddress.street,
            isDefault: updatedAddress.isDefault,
            userId: parseInt(localStorage.getItem('userId') || '0')
         };

         // Update address list
         setAddresses(prev =>
            prev.map(addr =>
               addr.id === formattedAddress.id ? formattedAddress : addr
            )
         );

         // If this is default, update other addresses
         if (formattedAddress.isDefault) {
            setAddresses(prev =>
               prev.map(addr =>
                  addr.id !== formattedAddress.id ? { ...addr, isDefault: false } : addr
               )
            );
         }

         // Reset and close modal
         setShowEditModal(false);
         setError(null);
      } catch (err) {
         setError("Không thể cập nhật địa chỉ. Vui lòng thử lại.");
      } finally {
         setIsLoading(false);
      }
   };

   // Handle delete address
   const handleDeleteAddress = async () => {
      if (!currentAddress) return;

      try {
         setIsLoading(true);
         await deleteAddress(currentAddress.id!);

         // Remove from address list
         setAddresses(prev => prev.filter(addr => addr.id !== currentAddress.id));
         setShowDeleteModal(false);
         setError(null);
      } catch (err) {
         setError("Không thể xóa địa chỉ. Vui lòng thử lại.");
      } finally {
         setIsLoading(false);
      }
   };

   // Handle set default
   const handleSetDefault = async (address: Address) => {
      try {
         setIsLoading(true);

         // Update address to be default
         const addressData = {
            id: address.id,
            isDefault: true
         };

         await updateAddress(addressData);

         // Update local state
         setAddresses(prev =>
            prev.map(addr => ({
               ...addr,
               isDefault: addr.id === address.id
            }))
         );

         setError(null);
      } catch (err) {
         setError("Không thể đặt địa chỉ mặc định. Vui lòng thử lại.");
      } finally {
         setIsLoading(false);
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-96">
            <div className="text-center">
               <FaSpinner className="animate-spin text-amber-600 text-3xl mx-auto mb-4" />
               <p className="text-gray-500">Đang tải địa chỉ...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
               <FaExclamationTriangle className="mt-1 mr-3 flex-shrink-0" />
               <div>
                  <p className="font-medium mb-1">Lỗi khi tải địa chỉ</p>
                  <p>{error}</p>
                  <button
                     className="mt-2 text-sm font-medium underline"
                     onClick={() => window.location.reload()}
                  >
                     Thử lại
                  </button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
         <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
            <button
               className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center"
               onClick={openAddModal}
            >
               <span className="mr-1">+</span> Thêm địa chỉ mới
            </button>
         </div>

         {addresses.length === 0 ? (
            <div className="text-center py-8">
               <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
               <button
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  onClick={openAddModal}
               >
                  Thêm địa chỉ mới
               </button>
            </div>
         ) : (
            <div className="space-y-4">
               {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 relative">
                     {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                           Mặc định
                        </span>
                     )}
                     <div className="mb-3">
                        <h3 className="font-medium">{address.fullName}</h3>
                        <p className="text-gray-600 text-sm">{address.phone}</p>
                     </div>
                     <p className="text-gray-600 mb-2">
                        {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                     </p>
                     <div className="flex space-x-3 mt-3 pt-2 border-t border-gray-100">
                        <button
                           className="text-amber-600 text-sm font-medium hover:underline"
                           onClick={() => openEditModal(address)}
                        >
                           Chỉnh sửa
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                           className="text-gray-600 text-sm font-medium hover:underline"
                           onClick={() => openDeleteModal(address)}
                        >
                           Xóa
                        </button>
                        {!address.isDefault && (
                           <>
                              <span className="text-gray-300">|</span>
                              <button
                                 className="text-amber-600 text-sm font-medium hover:underline"
                                 onClick={() => handleSetDefault(address)}
                              >
                                 Đặt làm mặc định
                              </button>
                           </>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Add Address Modal */}
         {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm địa chỉ mới</h3>
                  <form onSubmit={handleAddAddress}>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận</label>
                           <input
                              type="text"
                              name="fullName"
                              required
                              value={newAddress.fullName}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                           <input
                              type="text"
                              name="phone"
                              required
                              value={newAddress.phone}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                           <select
                              name="province"
                              value={provinces.find(p => p.name === newAddress.province)?.id || ''}
                              onChange={handleProvinceChange}
                              className="w-full p-2 border rounded"
                              required
                           >
                              <option value="">-- Chọn Tỉnh/Thành phố --</option>
                              {provinces.map(province => (
                                 <option key={province.id} value={province.id}>
                                    {province.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                           <select
                              name="district"
                              value={districts.find(d => d.name === newAddress.district)?.id || ''}
                              onChange={handleDistrictChange}
                              disabled={!newAddress.province}
                              className="w-full p-2 border rounded disabled:bg-gray-100"
                              required
                           >
                              <option value="">-- Chọn Quận/Huyện --</option>
                              {districts.map(district => (
                                 <option key={district.id} value={district.id}>
                                    {district.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                           <select
                              name="ward"
                              value={wards.find(w => w.name === newAddress.ward)?.id || ''}
                              onChange={handleWardChange}
                              disabled={!newAddress.district}
                              className="w-full p-2 border rounded disabled:bg-gray-100"
                              required
                           >
                              <option value="">-- Chọn Phường/Xã --</option>
                              {wards.map(ward => (
                                 <option key={ward.id} value={ward.id}>
                                    {ward.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                           <input
                              type="text"
                              name="streetAddress"
                              required
                              value={newAddress.streetAddress}
                              onChange={handleInputChange}
                              placeholder="Số nhà, tên đường..."
                              className="w-full p-2 border rounded"
                           />
                        </div>

                        <div className="flex items-center">
                           <input
                              type="checkbox"
                              id="isDefault"
                              name="isDefault"
                              checked={newAddress.isDefault}
                              onChange={handleInputChange}
                              className="mr-2"
                           />
                           <label htmlFor="isDefault" className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
                        </div>
                     </div>

                     {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                           {error}
                        </div>
                     )}

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           type="button"
                           onClick={() => {
                              setShowAddModal(false);
                              setError(null);
                           }}
                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                           Hủy
                        </button>
                        <button
                           type="submit"
                           disabled={isLoading}
                           className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
                        >
                           {isLoading && <FaSpinner className="animate-spin mr-2" />}
                           Lưu địa chỉ
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Edit Address Modal */}
         {showEditModal && currentAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa địa chỉ</h3>
                  <form onSubmit={handleUpdateAddress}>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận</label>
                           <input
                              type="text"
                              name="fullName"
                              required
                              value={newAddress.fullName}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                           <input
                              type="text"
                              name="phone"
                              required
                              value={newAddress.phone}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                           />
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                           <select
                              name="province"
                              value={provinces.find(p => p.name === newAddress.province)?.id || ''}
                              onChange={handleProvinceChange}
                              className="w-full p-2 border rounded"
                              required
                           >
                              <option value="">-- Chọn Tỉnh/Thành phố --</option>
                              {provinces.map(province => (
                                 <option key={province.id} value={province.id}>
                                    {province.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                           <select
                              name="district"
                              value={districts.find(d => d.name === newAddress.district)?.id || ''}
                              onChange={handleDistrictChange}
                              disabled={!newAddress.province}
                              className="w-full p-2 border rounded disabled:bg-gray-100"
                              required
                           >
                              <option value="">-- Chọn Quận/Huyện --</option>
                              {districts.map(district => (
                                 <option key={district.id} value={district.id}>
                                    {district.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                           <select
                              name="ward"
                              value={wards.find(w => w.name === newAddress.ward)?.id || ''}
                              onChange={handleWardChange}
                              disabled={!newAddress.district}
                              className="w-full p-2 border rounded disabled:bg-gray-100"
                              required
                           >
                              <option value="">-- Chọn Phường/Xã --</option>
                              {wards.map(ward => (
                                 <option key={ward.id} value={ward.id}>
                                    {ward.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                           <input
                              type="text"
                              name="streetAddress"
                              required
                              value={newAddress.streetAddress}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                           />
                        </div>

                        <div className="flex items-center">
                           <input
                              type="checkbox"
                              id="editIsDefault"
                              name="isDefault"
                              checked={newAddress.isDefault}
                              onChange={handleInputChange}
                              className="mr-2"
                           />
                           <label htmlFor="editIsDefault" className="text-sm text-gray-700">
                              Đặt làm địa chỉ mặc định
                           </label>
                        </div>
                     </div>

                     {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                           {error}
                        </div>
                     )}

                     <div className="mt-6 flex justify-end space-x-3">
                        <button
                           type="button"
                           onClick={() => {
                              setShowEditModal(false);
                              setError(null);
                           }}
                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                           Hủy
                        </button>
                        <button
                           type="submit"
                           disabled={isLoading}
                           className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
                        >
                           {isLoading && <FaSpinner className="animate-spin mr-2" />}
                           Lưu thay đổi
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Delete Confirmation Modal */}
         {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Xác nhận xóa</h3>
                  <p className="text-gray-600 mb-5">
                     Bạn có chắc chắn muốn xóa địa chỉ này?
                  </p>
                  <div className="flex justify-end space-x-3">
                     <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        onClick={() => setShowDeleteModal(false)}
                     >
                        Hủy
                     </button>
                     <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                        onClick={handleDeleteAddress}
                        disabled={isLoading}
                     >
                        {isLoading && <FaSpinner className="animate-spin mr-2" />}
                        Xóa địa chỉ
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

// Existing components (WishlistContent, ReviewsContent, SupportContent, etc.) remain unchanged

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
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [checkingAuth, setCheckingAuth] = useState(true);

   useEffect(() => {
      // Check authentication status
      const token = localStorage.getItem("token");
      if (!token) {
         router.push("/user/signin?redirect=/user/profile");
         return;
      }

      // Verify token validity (simplified)
      setIsAuthenticated(true);
      setCheckingAuth(false);

      // Handle tab selection from URL
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");

      if (tabParam && tabParam !== "orders") {
         const availableTabs = ["profile", "wishlist", "addresses", "reviews", "support"];
         if (availableTabs.includes(tabParam)) {
            handleTabChange(tabParam);
         }
      }
   }, [pathname, router]);

   const handleTabChange = (tab: string) => {
      if (tab === "orders") {
         router.push("/user/order");
         return;
      }

      setSelectedTab(tab);

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

      router.push(`${pathname}?tab=${tab}`, { scroll: false });
   };

   if (checkingAuth) {
      return (
         <>
            <Header />
            <div className="container mx-auto px-4 py-16 flex justify-center">
               <div className="text-center">
                  <FaSpinner className="animate-spin text-amber-600 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải thông tin người dùng...</p>
               </div>
            </div>
            <Footer />
         </>
      );
   }

   if (!isAuthenticated) {
      return null; // Will redirect in the useEffect
   }

   return (
      <>
         <Header />
         <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">
               <MenuProfile
                  selectedTab={selectedTab}
                  onTabChange={handleTabChange}
               />
               <div className="w-full md:w-3/4">{activeContent}</div>
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
   const [userData, setUserData] = useState<User | null>(null);

   useEffect(() => {
      // Get the current user's name to display in the menu header
      const getUserInfo = async () => {
         try {
            const user = await fetchUserProfile();
            setUserData(user);
         } catch (error) {
            console.error("Failed to fetch user info for menu", error);
         }
      };

      getUserInfo();
   }, []);

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
         externalLink: true,
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
         isDanger: true,
      },
   ];

   const handleTabSelect = (tab: string) => {
      if (tab === "logout") {
         setShowLogoutConfirm(true);
         return;
      }

      onTabChange(tab);
   };

   const handleLogout = () => {
      localStorage.removeItem("token");
      router.push("/user/signin");
      setShowLogoutConfirm(false);
   };

   return (
      <div className="w-full md:w-1/4">
         <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="py-5 border-b bg-gradient-to-r from-amber-50 to-amber-100">
               <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 ml-5">
                     <FaUser size={20} />
                  </div>
                  <div className="ml-4">
                     <h3 className="font-medium text-gray-800">Xin chào,</h3>
                     <p className="text-amber-700 font-semibold">
                        {userData ? `${userData.firstName} ${userData.lastName}` : "..."}
                     </p>
                  </div>
               </div>
            </div>

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
                           <item.icon
                              className={`mr-3 ${item.isDanger
                                 ? "text-red-500"
                                 : selectedTab === item.tab
                                    ? "text-amber-600"
                                    : "text-gray-500"
                                 }`}
                           />
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

         {/* Support section remains unchanged */}
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