"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaSpinner,
    FaExclamationTriangle,
    FaAddressBook,
    FaPlus
} from "react-icons/fa";

import Header from "@/app/components/user/nav/page";
import Footer from "@/app/components/user/footer/page";
import ViewedCarousel from "@/app/components/user/viewedcarousel/page";
import MenuProfile from "@/app/components/user/menuprofile/page";
import Toast from "@/app/components/ui/toast/page";

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

interface UserInfo {
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const [newAddress, setNewAddress] = useState<Address>({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false
    });

    const [provinces, setProvinces] = useState<{ id: string, name: string }[]>([]);
    const [districts, setDistricts] = useState<{ id: string, name: string }[]>([]);
    const [wards, setWards] = useState<{ id: string, name: string }[]>([]);

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
    });

    const [showAddAddressForm, setShowAddAddressForm] = useState(false);

    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);

    const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);

                const storedUserId = localStorage.getItem('userId');

                if (!storedUserId) {
                    router.push("/user/signin?redirect=/user/profile/address");
                    return;
                }

                const userIdNum = parseInt(storedUserId);
                setUserId(userIdNum);

                await loadUserInfo(userIdNum);
                await loadUserAddresses(userIdNum);
                await fetchProvinces();

            } catch (err) {
                if (err instanceof Error && err.message === "Unauthorized") {
                    router.push("/user/signin?redirect=/user/profile/address");
                    return;
                }
                setError("Không thể tải dữ liệu địa chỉ. Vui lòng thử lại sau.");
                showToastMessage("Không thể tải dữ liệu địa chỉ.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        initialize();
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/user/signin?redirect=/user/profile/address");
            return;
        }

        setIsAuthenticated(true);
        setCheckingAuth(false);
    }, [router]);

    const getUserNameAndPhone = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { fullName: '', phone: '' };

            const response = await fetch(`http://68.183.226.198:3000/api/v1/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();

                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                const phone = user.phone?.toString() || '';

                return { fullName, phone };
            }

            return { fullName: '', phone: '' };
        } catch (error) {
            console.error("Error fetching user info:", error);
            return { fullName: '', phone: '' };
        }
    };

    const loadUserInfo = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No authentication token found");
            }

            // Use relative URL path instead of hardcoded IP
            const response = await fetch(`/api/v1/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                throw new Error("Unauthorized");
            }

            if (response.status === 403) {
                throw new Error("Forbidden: You don't have permission to access this resource");
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.status}`);
            }

            const userData = await response.json();
            setUserInfo({
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone
            });

            setNewAddress(prev => ({
                ...prev,
                fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                phone: userData.phone?.toString() || ''
            }));

        } catch (error) {
            console.error("Error loading user info:", error);
            throw error;
        }
    };

    const findAddressesByUserId = async (userId: number) => {
        try {
            setIsLoading(true);

            const token = localStorage.getItem('token');
            if (!token) return [];

            const addressStorageKey = `user_${userId}_addresses`;
            const storedAddressesStr = localStorage.getItem(addressStorageKey);

            if (storedAddressesStr) {
                const storedAddresses = JSON.parse(storedAddressesStr);
                console.log(`Found ${storedAddresses.length} complete addresses in localStorage`);

                if (storedAddresses.length > 0) {
                    try {
                        const firstAddress = storedAddresses[0];
                        const checkResponse = await fetch(`/api/v1/address/${firstAddress.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (checkResponse.ok) {
                            console.log("Verified addresses from localStorage are valid");
                            return storedAddresses;
                        } else {
                            console.log("Addresses in localStorage may be outdated, fetching from server");
                        }
                    } catch (e) {
                        console.log("Error checking address validity:", e);
                    }
                }
            }

            const userAddressIdsString = localStorage.getItem(`user_${userId}_addressIds`);
            const userAddressIds = userAddressIdsString ? JSON.parse(userAddressIdsString) : [];

            console.log(`Found ${userAddressIds.length} saved address IDs for user ${userId}`);

            if (userAddressIds.length === 0) {
                console.log('No saved address IDs found, trying to retrieve addresses from API');
                const addressPromises = [];
                const maxAddressIdToTry = 20;

                for (let id = 1; id <= maxAddressIdToTry; id++) {
                    addressPromises.push(
                        fetch(`/api/v1/address/${id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                            .then(response => {
                                if (response.ok) {
                                    return response.json();
                                }
                                return null;
                            })
                            .catch(() => null)
                    );
                }

                const results = await Promise.all(addressPromises);
                const foundAddressIds = [];

                for (const data of results) {
                    if (data && (data.userId === userId || data.user?.id === userId)) {
                        foundAddressIds.push(data.id);
                    }
                }

                if (foundAddressIds.length > 0) {
                    localStorage.setItem(`user_${userId}_addressIds`, JSON.stringify(foundAddressIds));
                    console.log(`Found and saved ${foundAddressIds.length} address IDs`);
                    userAddressIds.push(...foundAddressIds);
                }
            }

            const addressPromises = userAddressIds.map((id: any) =>
                fetch(`/api/v1/address/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        }
                        return null;
                    })
                    .catch(() => null)
            );

            const addressesData = await Promise.all(addressPromises);

            const validAddresses = addressesData
                .filter(data => data && (data.userId === userId || data.user?.id === userId))
                .map(data => {
                    const receiverName = data.fullName ||
                        (data.user ?
                            `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() :
                            (userInfo ?
                                `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''))

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
                });

            if (validAddresses.length > 0) {
                localStorage.setItem(addressStorageKey, JSON.stringify(validAddresses));
                console.log(`Saved ${validAddresses.length} complete addresses to localStorage`);
            }

            if (validAddresses.length !== userAddressIds.length) {
                const validIds = validAddresses.map(addr => addr.id);
                localStorage.setItem(`user_${userId}_addressIds`, JSON.stringify(validIds));
                console.log(`Updated valid address IDs: ${validIds.length} addresses`);
            }

            return validAddresses;

        } catch (error) {
            console.error("Error fetching user addresses:", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const loadUserAddresses = async (userId: number) => {
        try {
            const validAddresses = await findAddressesByUserId(userId);
            console.log('Valid addresses found:', validAddresses.length);

            if (validAddresses.length > 0) {
                setAddresses(validAddresses);
                setShowAddAddressForm(false);

                showToastMessage(`Đã tìm thấy ${validAddresses.length} địa chỉ`, 'info');
            } else {
                setAddresses([]);

                if (userId) {
                    try {
                        const { fullName, phone } = await getUserNameAndPhone(userId);
                        setNewAddress(prev => ({
                            ...prev,
                            fullName: fullName,
                            phone: phone,
                            isDefault: true
                        }));
                    } catch (error) {
                        console.error("Error getting user name and phone:", error);
                    }
                }

                setShowAddAddressForm(true);
                showToastMessage('Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới', 'info');
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            setError("Không thể tải địa chỉ. Vui lòng thử lại sau.");
            showToastMessage("Không thể tải địa chỉ. Vui lòng thử lại sau.", "error");

            setNewAddress(prev => ({
                ...prev,
                isDefault: true
            }));
            setShowAddAddressForm(true);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            if (response.ok) {
                const data = await response.json();
                setProvinces(data.map((p: any) => ({ id: p.code, name: p.name })));
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
            setProvinces([
                { id: '1', name: 'Hà Nội' },
                { id: '2', name: 'TP. Hồ Chí Minh' },
                { id: '3', name: 'Đà Nẵng' }
            ]);
        }
    };

    const fetchDistricts = async (provinceId: string) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
            if (response.ok) {
                const data = await response.json();
                setDistricts(data.districts.map((d: any) => ({ id: d.code, name: d.name })));
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
            setDistricts([
                { id: '1', name: 'Quận 1' },
                { id: '2', name: 'Quận 2' },
                { id: '3', name: 'Quận 3' }
            ]);
        }
    };

    const fetchWards = async (districtId: string) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
            if (response.ok) {
                const data = await response.json();
                setWards(data.wards.map((w: any) => ({ id: w.code, name: w.name })));
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
            setWards([
                { id: '1', name: 'Phường 1' },
                { id: '2', name: 'Phường 2' },
                { id: '3', name: 'Phường 3' }
            ]);
        }
    };

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

            const addressUserId = addressData.user?.id || addressData.userId;
            const currentUserId = userId || parseInt(localStorage.getItem('userId') || '0');

            if (addressUserId === currentUserId) {
                const receiverName = addressData.fullName ||
                    (addressData.user ?
                        `${addressData.user.firstName || ''} ${addressData.user.lastName || ''}`.trim() :
                        (userInfo ?
                            `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''))

                const receiverPhone = addressData.phone ||
                    (addressData.user?.phone?.toString() ||
                        userInfo?.phone?.toString() || '')

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

    const updateAddress = async (addressData: any) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }

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

            const userIdStr = addressData.userId.toString();
            const addressStorageKey = `user_${userIdStr}_addresses`;

            const existingAddressesStr = localStorage.getItem(addressStorageKey);
            const existingAddresses = existingAddressesStr ? JSON.parse(existingAddressesStr) : [];

            const fullAddressData = {
                id: savedAddress.id,
                fullName: addressData.fullName,
                phone: addressData.phone,
                province: addressData.province,
                district: addressData.district,
                ward: addressData.ward,
                streetAddress: addressData.street,
                isDefault: addressData.isDefault,
                userId: addressData.userId
            };

            if (isUpdate) {
                const addressIndex = existingAddresses.findIndex((addr: any) => addr.id === savedAddress.id);
                if (addressIndex >= 0) {
                    existingAddresses[addressIndex] = fullAddressData;
                } else {
                    existingAddresses.push(fullAddressData);
                }
            } else {
                existingAddresses.push(fullAddressData);
            }

            localStorage.setItem(addressStorageKey, JSON.stringify(existingAddresses));
            console.log(`Saved full address data for ID: ${savedAddress.id} to localStorage`);

            const idsStorageKey = `user_${userIdStr}_addressIds`;
            const existingIdsStr = localStorage.getItem(idsStorageKey);
            const existingIds = existingIdsStr ? JSON.parse(existingIdsStr) : [];

            if (!isUpdate && !existingIds.includes(savedAddress.id)) {
                existingIds.push(savedAddress.id);
                localStorage.setItem(idsStorageKey, JSON.stringify(existingIds));
            }

            return savedAddress;
        } catch (error) {
            console.error(`Error ${addressData.id ? 'updating' : 'creating'} address:`, error);
            throw error;
        }
    };

    const deleteAddress = async (addressId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`http://68.183.226.198:3000/api/v1/address/${addressId}`, {
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

            const userIdStr = localStorage.getItem('userId') || '0';

            const idsStorageKey = `user_${userIdStr}_addressIds`;
            const existingIdsStr = localStorage.getItem(idsStorageKey);
            if (existingIdsStr) {
                const existingIds = JSON.parse(existingIdsStr);
                const updatedIds = existingIds.filter((id: number) => id !== addressId);
                localStorage.setItem(idsStorageKey, JSON.stringify(updatedIds));
            }

            const addressStorageKey = `user_${userIdStr}_addresses`;
            const existingAddressesStr = localStorage.getItem(addressStorageKey);
            if (existingAddressesStr) {
                const existingAddresses = JSON.parse(existingAddressesStr);
                const updatedAddresses = existingAddresses.filter((addr: any) => addr.id !== addressId);
                localStorage.setItem(addressStorageKey, JSON.stringify(updatedAddresses));
            }

            return true;
        } catch (error) {
            console.error('Error deleting address:', error);
            throw error;
        }
    };

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

        setNewAddress(prev => ({
            ...prev,
            province: provinceName,
            district: '',
            ward: ''
        }));

        fetchDistricts(provinceId);

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

    const handleAddNewAddress = async () => {
        try {
            if (userId) {
                const { fullName, phone } = await getUserNameAndPhone(userId);

                setNewAddress({
                    fullName: fullName,
                    phone: phone,
                    province: '',
                    district: '',
                    ward: '',
                    streetAddress: '',
                    isDefault: addresses.length === 0
                });
            }

            setShowAddAddressForm(true);
        } catch (error) {
            console.error("Error preparing new address form:", error);

            setNewAddress({
                fullName: userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : '',
                phone: userInfo?.phone?.toString() || '',
                province: '',
                district: '',
                ward: '',
                streetAddress: '',
                isDefault: addresses.length === 0
            });

            setShowAddAddressForm(true);
        }
    };

    const handleCancelAddAddress = () => {
        if (addresses.length > 0) {
            setShowAddAddressForm(false);
            setNewAddress({
                fullName: userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : '',
                phone: userInfo?.phone?.toString() || '',
                province: '',
                district: '',
                ward: '',
                streetAddress: '',
                isDefault: false
            });
            setError(null);
        } else {
            showToastMessage('Bạn cần có ít nhất một địa chỉ', 'info');
        }
    };

    const handleEditAddress = async (address: Address) => {
        try {
            setIsLoading(true);

            const addressData = await fetchAddressById(address.id!);

            if (addressData) {
                const matchedProvince = provinces.find(p => p.name.toLowerCase() === addressData.province.toLowerCase());
                if (matchedProvince) {
                    await fetchDistricts(matchedProvince.id);

                    const matchedDistrict = districts.find(d => d.name.toLowerCase() === addressData.district.toLowerCase());
                    if (matchedDistrict) {
                        await fetchWards(matchedDistrict.id);
                    }
                }

                setCurrentAddress(addressData);
                setNewAddress(addressData);
                setShowAddAddressForm(true);
            } else {
                setError("Không thể tải thông tin địa chỉ");
                showToastMessage("Không thể tải thông tin địa chỉ", "error");
            }
        } catch (error) {
            console.error('Error in handleEditAddress:', error);
            setError("Đã xảy ra lỗi khi tải thông tin địa chỉ");
            showToastMessage("Đã xảy ra lỗi khi tải thông tin địa chỉ", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (address: Address) => {
        setCurrentAddress(address);
        setShowDeleteModal(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newAddress.fullName || !newAddress.phone || !newAddress.province ||
            !newAddress.district || !newAddress.ward || !newAddress.streetAddress) {
            setError("Vui lòng điền đầy đủ thông tin địa chỉ");
            showToastMessage("Vui lòng điền đầy đủ thông tin địa chỉ", "error");
            return;
        }

        const phoneString = String(newAddress.phone);
        const phoneRegex = /([3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phoneString)) {
            setError("Số điện thoại không hợp lệ");
            showToastMessage("Số điện thoại không hợp lệ", "error");
            return;
        }

        try {
            setIsLoading(true);

            const addressData = {
                id: newAddress.id,
                fullName: String(newAddress.fullName).trim(),
                phone: String(newAddress.phone).trim(),
                province: String(newAddress.province).toLowerCase(),
                district: String(newAddress.district).toLowerCase(),
                ward: String(newAddress.ward).toLowerCase(),
                street: String(newAddress.streetAddress),
                userId: userId || parseInt(localStorage.getItem('userId') || '0'),
                isDefault: newAddress.isDefault
            };

            console.log('Sending address data:', addressData);

            const savedAddress = await updateAddress(addressData);

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

            if (newAddress.id) {
                setAddresses(prev => prev.map(addr =>
                    addr.id === formattedAddress.id ? formattedAddress : addr
                ));
                showToastMessage("Địa chỉ đã được cập nhật thành công", "success");
            } else {
                setAddresses(prev => [...prev, formattedAddress]);
                showToastMessage("Địa chỉ mới đã được thêm thành công", "success");
            }

            if (formattedAddress.isDefault) {
                setAddresses(prev =>
                    prev.map(addr =>
                        addr.id !== formattedAddress.id ? { ...addr, isDefault: false } : addr
                    )
                );
            }

            setShowAddAddressForm(false);
            setCurrentAddress(null);
            setError(null);

            if (userId) {
                try {
                    const { fullName, phone } = await getUserNameAndPhone(userId);
                    setNewAddress({
                        fullName: fullName,
                        phone: phone,
                        province: '',
                        district: '',
                        ward: '',
                        streetAddress: '',
                        isDefault: addresses.length === 0
                    });
                } catch (error) {
                    setNewAddress({
                        fullName: userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : '',
                        phone: userInfo?.phone?.toString() || '',
                        province: '',
                        district: '',
                        ward: '',
                        streetAddress: '',
                        isDefault: addresses.length === 0
                    });
                }
            }

        } catch (err) {
            setError("Không thể lưu địa chỉ. Vui lòng thử lại.");
            showToastMessage("Không thể lưu địa chỉ. Vui lòng thử lại.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async () => {
        if (!currentAddress) return;

        try {
            setIsLoading(true);
            await deleteAddress(currentAddress.id!);

            setAddresses(prev => prev.filter(addr => addr.id !== currentAddress.id));
            setShowDeleteModal(false);
            setError(null);
            showToastMessage("Địa chỉ đã được xóa thành công", "success");

            if (addresses.length <= 1) {
                if (userId) {
                    try {
                        const { fullName, phone } = await getUserNameAndPhone(userId);
                        setNewAddress({
                            fullName: fullName,
                            phone: phone,
                            province: '',
                            district: '',
                            ward: '',
                            streetAddress: '',
                            isDefault: true
                        });
                    } catch (error) {
                        setNewAddress({
                            fullName: userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : '',
                            phone: userInfo?.phone?.toString() || '',
                            province: '',
                            district: '',
                            ward: '',
                            streetAddress: '',
                            isDefault: true
                        });
                    }
                }
                setShowAddAddressForm(true);
            }
        } catch (err) {
            setError("Không thể xóa địa chỉ. Vui lòng thử lại.");
            showToastMessage("Không thể xóa địa chỉ. Vui lòng thử lại.", "error");
        } finally {
            setIsLoading(false);
        }
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
        return null;
    }

    return (
        <>
            <Header />

            <div className='fixed top-4 right-4 z-50'>
                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <MenuProfile selectedTab="addresses" />
                    <div className="w-full md:w-3/4">
                        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <h2 className="text-2xl font-semibold text-gray-800">Địa chỉ của tôi</h2>
                                {!showAddAddressForm && (
                                    <button
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center"
                                        onClick={handleAddNewAddress}
                                    >
                                        <FaPlus className="mr-1" /> Thêm địa chỉ mới
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-96">
                                    <div className="text-center">
                                        <FaSpinner className="animate-spin text-amber-600 text-3xl mx-auto mb-4" />
                                        <p className="text-gray-500">Đang tải địa chỉ...</p>
                                    </div>
                                </div>
                            ) : error && !showAddAddressForm ? (
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
                            ) : showAddAddressForm ? (
                                <form onSubmit={handleSaveAddress} className="space-y-4">
                                    <h3 className="text-lg font-semibold mb-3">
                                        {newAddress.id ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={newAddress.fullName}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={newAddress.phone}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                                        <select
                                            name="province"
                                            value={provinces.find(p => p.name === newAddress.province)?.id || ''}
                                            onChange={handleProvinceChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
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
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
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
                                            value={newAddress.streetAddress}
                                            onChange={handleInputChange}
                                            placeholder="Số nhà, tên đường..."
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            required
                                        />
                                    </div>



                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex space-x-3 pt-3">
                                        <button
                                            type="button"
                                            onClick={handleCancelAddAddress}
                                            className={`flex-1 py-2 border border-gray-300 rounded-md text-gray-700 
                                            ${addresses.length === 0 && !newAddress.id
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                                    : 'hover:bg-gray-50'}`}
                                            disabled={addresses.length === 0 && !newAddress.id}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-center"
                                        >
                                            {isLoading && <FaSpinner className="animate-spin mr-2" />}
                                            {newAddress.id ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                                        </button>
                                    </div>
                                </form>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="mb-4 flex justify-center">
                                        <FaAddressBook className="text-gray-300 text-4xl" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
                                    <button
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                                        onClick={handleAddNewAddress}
                                    >
                                        Thêm địa chỉ mới
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="border rounded-lg p-4 relative hover:border-amber-300 transition-colors">
                                            {address.isDefault && (
                                                <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                                                    Mặc định
                                                </span>
                                            )}
                                            <div className="flex justify-between mb-3">
                                                <div>
                                                    <h3 className="font-medium">{address.fullName}</h3>
                                                    <p className="text-gray-600 text-sm">{address.phone}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-2 border-t pt-2">
                                                {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                                            </p>
                                            <div className="flex space-x-3 mt-3 pt-2 border-t border-gray-100">
                                                <button
                                                    className="text-amber-600 text-sm font-medium hover:underline"
                                                    onClick={() => handleEditAddress(address)}
                                                >
                                                    Chỉnh sửa
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    className="text-gray-600 text-sm font-medium hover:underline"
                                                    onClick={() => openDeleteModal(address)}
                                                    disabled={address.isDefault && addresses.length > 1}
                                                >
                                                    Xóa
                                                </button>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ViewedCarousel />
            <Footer />

            {showDeleteModal && currentAddress && (
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
        </>
    );
}