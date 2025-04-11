'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/page';

// Interfaces
interface CartItem {
  id: number;
  detailId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: string;
  options: { name: string; value: string }[];
}

// Thêm vào interface ở đầu file page.tsx trong trang checkout
// Cập nhật interface Voucher để phù hợp với API response
interface Voucher {
  id: number;
  code: string;
  description: string;
  amount_off: string;  // Dạng chuỗi số thập phân, ví dụ "0.00"
  percent_off: string; // Dạng chuỗi số thập phân, ví dụ "20.00"
  min_order_value: string; // Dạng chuỗi số thập phân
  max_voucher_amount: string; // Giới hạn tối đa cho giảm giá
  usage_limit: number;
  usage_per_customer: number;
  start_date: string;
  end_date: string;
  applicable_categories: string | null; // Danh mục áp dụng
  new_customers_only: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
}

interface Address {
  id?: number;
  fullName: string; // Tên người nhận
  phone: string; // Số điện thoại người nhận
  province: string;
  district: string;
  ward: string;
  streetAddress: string; // Map với "street" trong API
  isDefault?: boolean;
  userId?: number; // Thêm để gửi lên API, không cho phép null
}

interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Format price helper function
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);
};

// Thêm hàm kiểm tra tính hợp lệ của voucher
const isVoucherValid = (voucher: Voucher, currentSubTotal: number): { valid: boolean; message?: string } => {
  // Kiểm tra voucher có đang hoạt động không
  if (!voucher.isActive || voucher.isDeleted) {
    return { valid: false, message: 'Mã giảm giá không có hiệu lực' };
  }

  // Kiểm tra thời gian hiệu lực
  const now = new Date();
  const startDate = new Date(voucher.start_date);
  const endDate = new Date(voucher.end_date);

  if (now < startDate) {
    return {
      valid: false,
      message: `Mã giảm giá sẽ có hiệu lực từ ngày ${startDate.toLocaleDateString('vi-VN')}`
    };
  }

  if (now > endDate) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn' };
  }

  // Kiểm tra giá trị đơn hàng tối thiểu
  const minOrderValue = parseFloat(voucher.min_order_value);
  if (minOrderValue > currentSubTotal) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${formatPrice(minOrderValue)} để áp dụng mã này. Bạn cần thêm ${formatPrice(minOrderValue - currentSubTotal)} nữa.`
    };
  }

  // Voucher hợp lệ
  return { valid: true };
};

// Thêm hàm tính toán số tiền giảm giá
const calculateDiscountAmount = (voucher: Voucher, currentSubTotal: number): number => {
  let discountAmount = 0;

  if (parseFloat(voucher.percent_off) > 0) {
    // Áp dụng giảm giá theo phần trăm
    const percentOff = parseFloat(voucher.percent_off);
    const calculatedDiscount = (percentOff / 100) * currentSubTotal;

    // Kiểm tra và áp dụng giới hạn tối đa của voucher nếu có
    const maxAmount = parseFloat(voucher.max_voucher_amount);
    if (maxAmount > 0) {
      discountAmount = Math.min(calculatedDiscount, maxAmount);
    } else {
      discountAmount = calculatedDiscount;
    }
  } else if (parseFloat(voucher.amount_off) > 0) {
    // Áp dụng giảm giá trực tiếp
    discountAmount = parseFloat(voucher.amount_off);
  }

  // Làm tròn xuống để tránh số thập phân và đảm bảo không giảm quá giá trị đơn hàng
  discountAmount = Math.floor(discountAmount);
  discountAmount = Math.min(discountAmount, currentSubTotal); // Đảm bảo không giảm quá giá trị đơn hàng

  return discountAmount;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTotal, setSubTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(30000); // Mặc định phí ship
  const [totalPrice, setTotalPrice] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // Thông tin người dùng
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Thông tin giao hàng
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  // Form tạo địa chỉ mới
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
    isDefault: false
  });

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANKING'>('COD');

  // Ghi chú đơn hàng
  const [orderNote, setOrderNote] = useState('');

  // Trạng thái toast thông báo
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  // Danh sách các tỉnh/thành phố, quận/huyện, phường/xã (giả lập)
  const [provinces, setProvinces] = useState<{ id: string, name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string, name: string }[]>([]);
  const [wards, setWards] = useState<{ id: string, name: string }[]>([]);

  // Thêm vào phần state của trang checkout
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discount, setDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Thêm hàm hiện toast message 
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      show: true,
      message,
      type,
    });

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Thêm hàm xóa địa chỉ
  const deleteAddress = async (addressId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
        router.push('/user/signin');
        return false;
      }

      const response = await fetch(`http://68.183.226.198:3000/api/v1/address/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Không thể xóa địa chỉ';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  // Cập nhật hàm handleDeleteAddress để xóa địa chỉ khỏi cả hai dạng lưu trữ
  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
      try {
        setLoading(true);
        const success = await deleteAddress(addressId);

        if (success) {
          // Xóa địa chỉ khỏi danh sách
          setAddresses(prev => prev.filter(addr => addr.id !== addressId));

          // Xóa ID địa chỉ khỏi cả hai dạng lưu trữ trong localStorage
          if (userId) {
            // 1. Cập nhật danh sách ID
            const idsStorageKey = `user_${userId}_addressIds`;
            const existingIdsStr = localStorage.getItem(idsStorageKey);
            if (existingIdsStr) {
              const existingIds = JSON.parse(existingIdsStr);
              const updatedIds = existingIds.filter((id: number) => id !== addressId);
              localStorage.setItem(idsStorageKey, JSON.stringify(updatedIds));
              console.log(`Removed address ID ${addressId} from IDs list in localStorage`);
            }

            // 2. Cập nhật danh sách địa chỉ đầy đủ
            const addressStorageKey = `user_${userId}_addresses`;
            const existingAddressesStr = localStorage.getItem(addressStorageKey);
            if (existingAddressesStr) {
              const existingAddresses = JSON.parse(existingAddressesStr);
              const updatedAddresses = existingAddresses.filter((addr: any) => addr.id !== addressId);
              localStorage.setItem(addressStorageKey, JSON.stringify(updatedAddresses));
              console.log(`Removed address ID ${addressId} from full address list in localStorage`);
            }
          }

          // Nếu địa chỉ đang được chọn bị xóa, chọn địa chỉ khác
          if (selectedAddressId === addressId) {
            if (addresses.length > 1) {
              const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
              const defaultAddress = remainingAddresses.find(addr => addr.isDefault);
              setSelectedAddressId(defaultAddress?.id ?? remainingAddresses[0]?.id ?? null);
            } else {
              setSelectedAddressId(null);
              setShowAddAddressForm(true);
            }
          }

          showToastMessage('Đã xóa địa chỉ thành công', 'success');
        }
      } catch (error: any) {
        console.error('Error deleting address:', error);
        showToastMessage(error.message || 'Không thể xóa địa chỉ', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Thêm hàm xử lý khi chọn địa chỉ giao hàng
  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);

    // Tìm địa chỉ được chọn để tính phí vận chuyển
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      const newShippingFee = calculateShippingFee(selectedAddress.province);
      setShippingFee(newShippingFee);
      // Cập nhật tổng tiền
      setTotalPrice(subTotal + newShippingFee - discount);
      showToastMessage('Đã chọn địa chỉ giao hàng', 'info');
    }
  };

  // Thêm hàm xử lý thay đổi form địa chỉ
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  // Thêm hàm xử lý thay đổi tỉnh/thành phố
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;

    // Cập nhật tỉnh/thành phố trong form
    setNewAddress(prev => ({
      ...prev,
      province: provinceName,
      district: '', // Reset quận/huyện
      ward: '' // Reset phường/xã
    }));

    // Tải danh sách quận/huyện
    fetchDistricts(provinceId);

    // Reset danh sách phường/xã
    setWards([]);
  };

  // Cập nhật hàm tính phí vận chuyển dựa trên địa chỉ
  const calculateShippingFee = (province: string): number => {
    // Kiểm tra nếu tỉnh/thành phố là TP.HCM (với nhiều cách viết khác nhau)
    const hcmVariations = [
      'hồ chí minh',
      'ho chi minh',
      'tp hcm',
      'tp. hcm',
      'tp.hcm',
      'thành phố hồ chí minh',
      'thanh pho ho chi minh'
    ];

    // Chuyển đổi tên thành phố sang chữ thường để so sánh
    const normalizedProvince = province.toLowerCase().trim();

    // Nếu là TP.HCM thì phí ship là 20.000đ, ngược lại là 30.000đ
    return hcmVariations.includes(normalizedProvince) ? 20000 : 30000;
  };

  useEffect(() => {
    const init = async () => {
      // Lấy thông tin userId từ localStorage
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        // Nếu không có userId, chuyển về trang đăng nhập
        router.push('/user/signin');
        return;
      }

      const userId = parseInt(storedUserId);
      setUserId(userId);

      try {
        setLoading(true);

        // Lấy thông tin người dùng trước
        await loadUserInfo(userId);

        // Sau đó tải địa chỉ của họ
        await loadUserAddresses(userId);

        // Cuối cùng tải tỉnh thành để chuẩn bị cho form
        await fetchProvinces();

      } catch (error) {
        console.error('Error initializing data:', error);
        showToastMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
      } finally {
        setLoading(false);
      }

      // Tải giỏ hàng từ localStorage
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length === 0) {
        // Nếu giỏ hàng trống, chuyển về trang giỏ hàng
        router.push('/user/cart');
        return;
      }

      // Đảm bảo tất cả detailId là số
      const validatedCart = localCart.map((item: { detailId: any; }) => ({
        ...item,
        detailId: Number(item.detailId)
      }));

      setCartItems(validatedCart);

      // Tính toán giá trị đơn hàng
      const subtotal = validatedCart.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubTotal(subtotal);
      setTotalPrice(subtotal + shippingFee);
    };

    init();
  }, []);

  // Thêm vào useEffect để load voucher đã áp dụng từ cart
  useEffect(() => {
    // Lấy voucher đã áp dụng từ localStorage nếu có
    const savedVoucher = localStorage.getItem('appliedVoucher');
    if (savedVoucher) {
      try {
        const voucherData = JSON.parse(savedVoucher);

        // Kiểm tra voucher còn hợp lệ không
        const now = new Date();
        const startDate = new Date(voucherData.start_date);
        const endDate = new Date(voucherData.end_date);

        if (now < startDate || now > endDate || !voucherData.isActive) {
          // Voucher hết hạn hoặc vô hiệu, xóa khỏi localStorage
          localStorage.removeItem('appliedVoucher');
          showToastMessage('Mã giảm giá đã hết hạn hoặc không còn hiệu lực', 'error');
          return;
        }

        // Kiểm tra giá trị đơn hàng tối thiểu
        const minOrderValue = parseFloat(voucherData.min_order_value);
        if (minOrderValue > subTotal) {
          localStorage.removeItem('appliedVoucher');
          showToastMessage(`Đơn hàng tối thiểu ${formatPrice(minOrderValue)} để áp dụng mã này`, 'error');
          return;
        }

        // Tính lại số tiền giảm giá dựa trên giá trị đơn hàng hiện tại
        const recalculatedDiscount = calculateDiscountAmount(voucherData, subTotal);

        // Làm tròn và cập nhật state
        setAppliedVoucher(voucherData);
        setVoucherCode(voucherData.code);
        setDiscount(recalculatedDiscount);

        // Cập nhật lại localStorage với số tiền giảm giá mới
        localStorage.setItem('appliedVoucher', JSON.stringify({
          ...voucherData,
          discountAmount: recalculatedDiscount
        }));
      } catch (error) {
        console.error('Error parsing saved voucher:', error);
        localStorage.removeItem('appliedVoucher');
      }
    }
  }, [subTotal]);

  // Thêm useEffect để cập nhật tổng tiền khi có discount
  useEffect(() => {
    // Tính tổng tiền = subtotal + shippingFee - discount
    setTotalPrice(subTotal + shippingFee - discount);
  }, [subTotal, shippingFee, discount]);

  // Load thông tin người dùng
  const loadUserInfo = async (userId: number) => {
    try {
      const response = await fetch(`http://68.183.226.198:3000/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        setUserInfo({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        });

        // Pre-fill new address form with user info
        setNewAddress(prev => ({
          ...prev,
          fullName: `${user.firstName} ${user.lastName}`,
          phone: user.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      showToastMessage('Không thể tải thông tin người dùng', 'error');
    }
  };

  // Thêm hàm này vào phần các hàm tiện ích của bạn
  const getUserNameAndPhone = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { fullName: '', phone: '' };

      const response = await fetch(`http://68.183.226.198:3000/api/v1/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();

        // Tạo tên đầy đủ từ firstName và lastName
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        // Lấy số điện thoại nếu có
        const phone = user.phone?.toString() || '';

        return { fullName, phone };
      }

      return { fullName: '', phone: '' };
    } catch (error) {
      console.error("Error fetching user info:", error);
      return { fullName: '', phone: '' };
    }
  };

  // Cập nhật hàm findAddressesByUserId để sử dụng thông tin đầy đủ từ localStorage
  const findAddressesByUserId = async (userId: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) return [];

      // Thử lấy địa chỉ đầy đủ từ localStorage trước
      const addressStorageKey = `user_${userId}_addresses`;
      const storedAddressesStr = localStorage.getItem(addressStorageKey);

      if (storedAddressesStr) {
        const storedAddresses = JSON.parse(storedAddressesStr);
        console.log(`Found ${storedAddresses.length} complete addresses in localStorage`);

        if (storedAddresses.length > 0) {
          // Kiểm tra nhanh một địa chỉ đầu tiên để xác nhận vẫn còn tồn tại trên server
          try {
            const firstAddress = storedAddresses[0];
            const checkResponse = await fetch(`http://68.183.226.198:3000/api/v1/address/${firstAddress.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            // Nếu địa chỉ đầu tiên vẫn tồn tại, giả định các địa chỉ khác cũng vậy
            if (checkResponse.ok) {
              console.log("Verified addresses from localStorage are valid");
              // Sử dụng thông tin đầy đủ từ localStorage
              return storedAddresses;
            } else {
              console.log("Addresses in localStorage may be outdated, fetching from server");
            }
          } catch (e) {
            console.log("Error checking address validity:", e);
          }
        }
      }

      // Nếu không có trong localStorage hoặc dữ liệu không còn hợp lệ, tiếp tục với logic hiện tại
      console.log("Using ID-based approach to fetch addresses");

      // Lấy danh sách các ID địa chỉ đã biết từ localStorage
      const userAddressIdsString = localStorage.getItem(`user_${userId}_addressIds`);
      const userAddressIds = userAddressIdsString ? JSON.parse(userAddressIdsString) : [];

      console.log(`Found ${userAddressIds.length} saved address IDs for user ${userId}`);

      // Còn lại là logic hiện tại để tìm và lấy địa chỉ
      // ...

      // Nếu không có địa chỉ nào trong localStorage, thử tìm kiếm các địa chỉ từ API
      if (userAddressIds.length === 0) {
        console.log('No saved address IDs found, trying to retrieve addresses from API');
        // Thử tìm địa chỉ trong một khoảng ID nhỏ (1-10) để tìm địa chỉ đầu tiên
        const addressPromises = [];
        const maxAddressIdToTry = 10; // Giới hạn số lượng địa chỉ cần kiểm tra ban đầu

        for (let id = 1; id <= maxAddressIdToTry; id++) {
          addressPromises.push(
            fetch(`http://68.183.226.198:3000/api/v1/address/${id}`, {
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

        // Lọc và tìm các địa chỉ thuộc về userId
        for (const data of results) {
          if (data && (data.userId === userId || data.user?.id === userId)) {
            foundAddressIds.push(data.id);
          }
        }

        // Lưu danh sách ID vào localStorage để sử dụng trong tương lai
        if (foundAddressIds.length > 0) {
          localStorage.setItem(`user_${userId}_addressIds`, JSON.stringify(foundAddressIds));
          console.log(`Found and saved ${foundAddressIds.length} address IDs`);
          // Cập nhật lại danh sách ID
          userAddressIds.push(...foundAddressIds);
        }
      }

      // Lấy chi tiết của từng địa chỉ đã biết ID
      const addressPromises = userAddressIds.map((id: any) =>
        fetch(`http://68.183.226.198:3000/api/v1/address/${id}`, {
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

      // Lọc ra các địa chỉ còn tồn tại và thuộc về userId
      const validAddresses = addressesData
        .filter(data => data && (data.userId === userId || data.user?.id === userId))
        .map(data => ({
          id: data.id,
          fullName: data.fullName || `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim(),
          phone: data.phone || userInfo?.phone?.toString() || '',
          province: data.province || '',
          district: data.district || '',
          ward: data.ward || '',
          streetAddress: data.street || '',
          isDefault: data.isDefault || false,
          userId: userId
        }));

      // Lưu đầy đủ thông tin địa chỉ vào localStorage
      if (validAddresses.length > 0) {
        localStorage.setItem(addressStorageKey, JSON.stringify(validAddresses));
        console.log(`Saved ${validAddresses.length} complete addresses to localStorage`);
      }

      // Cập nhật lại danh sách ID địa chỉ hợp lệ trong localStorage
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
      setLoading(false);
    }
  };

  // Sử dụng hàm này trong loadUserAddresses
  const loadUserAddresses = async (userId: number) => {
    try {
      setLoading(true);

      // Tìm các địa chỉ thuộc người dùng
      const validAddresses = await findAddressesByUserId(userId);
      console.log('Valid addresses found:', validAddresses.length);

      if (validAddresses.length > 0) {
        // Người dùng có địa chỉ
        setAddresses(validAddresses);
        setShowAddAddressForm(false); // Ẩn form thêm địa chỉ
        console.log('Loaded addresses:', validAddresses);
        showToastMessage(`Đã tìm thấy ${validAddresses.length} địa chỉ giao hàng`, 'info');

        // Nếu có địa chỉ mặc định, chọn địa chỉ đó
        const defaultAddress = validAddresses.find((addr: { isDefault: any; }) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id ?? null);
          // Cập nhật phí vận chuyển dựa trên địa chỉ mặc định
          const newShippingFee = calculateShippingFee(defaultAddress.province);
          setShippingFee(newShippingFee);
          // Cập nhật tổng tiền
          setTotalPrice(subTotal + newShippingFee - discount);
        } else if (validAddresses.length > 0) {
          // Nếu không có địa chỉ mặc định, chọn địa chỉ đầu tiên
          setSelectedAddressId(validAddresses[0].id ?? null);
          // Cập nhật phí vận chuyển dựa trên địa chỉ đầu tiên
          const newShippingFee = calculateShippingFee(validAddresses[0].province);
          setShippingFee(newShippingFee);
          // Cập nhật tổng tiền
          setTotalPrice(subTotal + newShippingFee - discount);
        }
      } else {
        // Không có địa chỉ
        setAddresses([]);
        // Khi không có địa chỉ, hiển thị form thêm mới và đặt isDefault thành true
        setNewAddress(prev => ({
          ...prev,
          isDefault: true // Địa chỉ đầu tiên luôn là mặc định
        }));
        setShowAddAddressForm(true);
        showToastMessage('Vui lòng thêm địa chỉ giao hàng mới', 'info');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
      // Khi gặp lỗi, hiển thị form thêm mới và đặt isDefault thành true
      setNewAddress(prev => ({
        ...prev,
        isDefault: true // Địa chỉ đầu tiên luôn là mặc định
      }));
      setShowAddAddressForm(true);
      showToastMessage('Không thể tải địa chỉ giao hàng, vui lòng tạo mới', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách tỉnh/thành phố từ API
  const fetchProvinces = async () => {
    try {
      // Thay thế bằng API thực tế
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      if (response.ok) {
        const data = await response.json();
        setProvinces(data.map((p: any) => ({ id: p.code, name: p.name })));
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Dữ liệu mẫu nếu API lỗi
      setProvinces([
        { id: '1', name: 'Hà Nội' },
        { id: '2', name: 'TP. Hồ Chí Minh' },
        { id: '3', name: 'Đà Nẵng' }
      ]);
    }
  };

  // Tải danh sách quận/huyện dựa trên tỉnh/thành phố
  const fetchDistricts = async (provinceId: string) => {
    try {
      // Thay thế bằng API thực tế
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts.map((d: any) => ({ id: d.code, name: d.name })));
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      // Dữ liệu mẫu nếu API lỗi
      setDistricts([
        { id: '1', name: 'Quận 1' },
        { id: '2', name: 'Quận 2' },
        { id: '3', name: 'Quận 3' }
      ]);
    }
  };

  // Tải danh sách phường/xã dựa trên quận/huyện
  const fetchWards = async (districtId: string) => {
    try {
      // Thay thế bằng API thực tế
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
      if (response.ok) {
        const data = await response.json();
        setWards(data.wards.map((w: any) => ({ id: w.code, name: w.name })));
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Dữ liệu mẫu nếu API lỗi
      setWards([
        { id: '1', name: 'Phường 1' },
        { id: '2', name: 'Phường 2' },
        { id: '3', name: 'Phường 3' }
      ]);
    }
  };

  // Hàm lấy địa chỉ cụ thể theo ID
  const fetchAddressById = async (addressId: number) => {
    try {
      console.log(`Fetching address with ID: ${addressId}`);

      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return null;
      }

      const response = await fetch(`http://68.183.226.198:3000/api/v1/address/${addressId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Nếu không tìm thấy địa chỉ hoặc có lỗi khác, trả về null
      if (!response.ok) {
        if (response.status !== 404) {
          console.error(`Error fetching address ${addressId}: ${response.status}`);
        }
        return null;
      }

      const addressData = await response.json();
      console.log('Fetched address data:', addressData);

      // Kiểm tra nếu địa chỉ thuộc user hiện tại
      // Nếu trong addressData có user.id hoặc userId, kiểm tra với userId hiện tại
      const addressUserId = addressData.user?.id || addressData.userId;

      if (addressUserId === userId) {
        // Lấy tên người nhận từ trường fullName nếu có, hoặc từ thông tin người dùng
        const receiverName = addressData.fullName ||
          (addressData.user ?
            `${addressData.user.firstName || ''} ${addressData.user.lastName || ''}`.trim() :
            (userInfo ?
              `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : ''))

        // Lấy số điện thoại từ địa chỉ hoặc từ thông tin người dùng
        const receiverPhone = addressData.phone ||
          (addressData.user?.phone?.toString() ||
            userInfo?.phone?.toString() || '')

        // Định dạng lại dữ liệu theo interface Address
        const formattedAddress: Address = {
          id: addressData.id,
          fullName: receiverName,
          phone: receiverPhone,
          province: addressData.province || '',
          district: addressData.district || '',
          ward: addressData.ward || '',
          streetAddress: addressData.street || '', // Chuyển đổi street thành streetAddress
          isDefault: addressData.isDefault || false,
          userId: userId as number
        };

        return formattedAddress;
      }

      // Nếu địa chỉ không thuộc người dùng hiện tại
      return null;
    } catch (error) {
      console.error('Error fetching address by ID:', error);
      return null;
    }
  };

  // Hàm xử lý khi cần sửa địa chỉ
  const handleEditAddress = async (addressId: number) => {
    try {
      setLoading(true);

      // Lấy thông tin địa chỉ và kiểm tra quyền
      const address = await fetchAddressById(addressId);

      if (address) {
        // Tìm province trong danh sách để có thể hiển thị đúng trong select
        const matchedProvince = provinces.find(p => p.name.toLowerCase() === address.province.toLowerCase());
        if (matchedProvince) {
          // Load quận/huyện dựa trên tỉnh/thành phố
          await fetchDistricts(matchedProvince.id);

          // Sau khi tải quận/huyện, tìm quận/huyện hiện tại
          const matchedDistrict = districts.find(d => d.name.toLowerCase() === address.district.toLowerCase());
          if (matchedDistrict) {
            // Load phường/xã dựa trên quận/huyện
            await fetchWards(matchedDistrict.id);
          }
        }

        // Cập nhật form địa chỉ
        setNewAddress(address);
        setShowAddAddressForm(true);
      } else {
        showToastMessage('Không thể tải thông tin địa chỉ', 'error');
      }
    } catch (error) {
      console.error('Error in handleEditAddress:', error);
      showToastMessage('Đã xảy ra lỗi khi tải thông tin địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm updateAddress để lưu thông tin đầy đủ về địa chỉ vào localStorage
  const updateAddress = async (addressData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
        router.push('/user/signin');
        return null;
      }

      // Xác định xem đây là cập nhật hay tạo mới
      const isUpdate = !!addressData.id;
      const url = isUpdate
        ? `http://68.183.226.198:3000/api/v1/address/${addressData.id}`
        : 'http://68.183.226.198:3000/api/v1/address';

      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const savedAddress = await response.json();

        // Lưu hoặc cập nhật địa chỉ vào localStorage
        const userIdStr = addressData.userId.toString();
        const addressStorageKey = `user_${userIdStr}_addresses`;

        // Lấy danh sách địa chỉ hiện có từ localStorage
        const existingAddressesStr = localStorage.getItem(addressStorageKey);
        const existingAddresses = existingAddressesStr ? JSON.parse(existingAddressesStr) : [];

        // Tạo đối tượng địa chỉ đầy đủ để lưu vào localStorage
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
          // Nếu là cập nhật, thay thế địa chỉ cũ trong mảng
          const addressIndex = existingAddresses.findIndex((addr: any) => addr.id === savedAddress.id);
          if (addressIndex >= 0) {
            existingAddresses[addressIndex] = fullAddressData;
          } else {
            // Trường hợp không tìm thấy trong mảng (hiếm gặp), thêm mới
            existingAddresses.push(fullAddressData);
          }
        } else {
          // Nếu là địa chỉ mới, thêm vào mảng
          existingAddresses.push(fullAddressData);
        }

        // Lưu danh sách địa chỉ đầy đủ vào localStorage
        localStorage.setItem(addressStorageKey, JSON.stringify(existingAddresses));
        console.log(`Saved full address data for ID: ${savedAddress.id} to localStorage`);

        // Vẫn duy trì danh sách IDs để tương thích ngược
        const idsStorageKey = `user_${userIdStr}_addressIds`;
        const existingIdsStr = localStorage.getItem(idsStorageKey);
        const existingIds = existingIdsStr ? JSON.parse(existingIdsStr) : [];

        if (!isUpdate && !existingIds.includes(savedAddress.id)) {
          existingIds.push(savedAddress.id);
          localStorage.setItem(idsStorageKey, JSON.stringify(existingIds));
        }

        return savedAddress;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Không thể ${isUpdate ? 'cập nhật' : 'tạo'} địa chỉ`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Cập nhật hàm lưu địa chỉ
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newAddress.fullName || !newAddress.phone || !newAddress.province ||
      !newAddress.district || !newAddress.ward || !newAddress.streetAddress) {
      showToastMessage('Vui lòng điền đầy đủ thông tin địa chỉ', 'error');
      return;
    }

    // Chuyển đổi phone thành chuỗi để đảm bảo có thể dùng regex
    const phoneString = String(newAddress.phone);

    // Validate số điện thoại Việt Nam
    const phoneRegex = /([3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneString)) {
      showToastMessage('Số điện thoại không hợp lệ', 'error');
      return;
    }

    try {
      // Hiển thị loading state
      setLoading(true);

      // Chuẩn bị dữ liệu để gửi lên API
      const addressData = {
        id: newAddress.id, // Thêm ID nếu đang cập nhật, undefined nếu là địa chỉ mới
        fullName: String(newAddress.fullName).trim(), // Đảm bảo tên được cắt khoảng trắng và là chuỗi
        phone: String(newAddress.phone).trim(), // Đảm bảo số điện thoại là chuỗi và được cắt khoảng trắng
        province: String(newAddress.province).toLowerCase(), // API lưu tên tỉnh/thành phố viết thường
        district: String(newAddress.district).toLowerCase(), // API lưu tên quận/huyện viết thường
        ward: String(newAddress.ward).toLowerCase(), // API lưu tên phường/xã viết thường
        street: String(newAddress.streetAddress), // Đổi tên field để phù hợp với API
        userId: userId as number, // Đảm bảo userId là number không phải null
        isDefault: newAddress.isDefault
      };

      console.log('Sending address data:', addressData);

      const savedAddress = await updateAddress(addressData);

      if (!savedAddress) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      console.log('Saved address from API:', savedAddress);

      // Chuyển đổi dữ liệu trả về để phù hợp với interface Address
      const formattedAddress: Address = {
        id: savedAddress.id,
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        province: savedAddress.province,
        district: savedAddress.district,
        ward: savedAddress.ward,
        streetAddress: savedAddress.street, // Chuyển đổi street thành streetAddress
        isDefault: savedAddress.isDefault,
        userId: userId as number
      };

      // Cập nhật danh sách địa chỉ
      if (newAddress.id) {
        // Nếu là cập nhật, thay thế địa chỉ cũ
        setAddresses(prev => prev.map(addr => addr.id === newAddress.id ? formattedAddress : addr));
        showToastMessage('Địa chỉ đã được cập nhật thành công', 'success');
      } else {
        // Nếu là thêm mới, thêm vào danh sách
        setAddresses(prev => [...prev, formattedAddress]);
        showToastMessage('Địa chỉ mới đã được thêm thành công', 'success');
      }

      // Chọn địa chỉ vừa tạo/cập nhật
      setSelectedAddressId(formattedAddress.id ?? null);

      // Cập nhật phí vận chuyển dựa trên địa chỉ mới
      const newShippingFee = calculateShippingFee(formattedAddress.province);
      setShippingFee(newShippingFee);
      setTotalPrice(subTotal + newShippingFee - discount);

      // Ẩn form thêm địa chỉ
      setShowAddAddressForm(false);

      // Nếu đây là địa chỉ mặc định mới, cập nhật toàn bộ danh sách
      if (formattedAddress.isDefault) {
        // Cập nhật các địa chỉ khác thành không mặc định trong state
        setAddresses(prev => prev.map(addr =>
          addr.id !== formattedAddress.id
            ? { ...addr, isDefault: false }
            : addr
        ));
      }

      // Làm mới form địa chỉ cho lần thêm mới tiếp theo
      setNewAddress({
        fullName: userInfo?.firstName + ' ' + userInfo?.lastName || '',
        phone: userInfo?.phone?.toString() || '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: addresses.length === 0
      });

    } catch (error: any) {
      console.error('Error saving address:', error);
      showToastMessage(error.message || 'Không thể lưu địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật lại hàm applyVoucher với các hàm trợ giúp
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setApplyingVoucher(true);
      setVoucherError('');

      // Bước 1: Lấy tất cả vouchers
      const allVouchersResponse = await fetch(`http://68.183.226.198:3000/api/v1/vouchers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!allVouchersResponse.ok) {
        throw new Error('Không thể lấy danh sách mã giảm giá');
      }

      const allVouchers = await allVouchersResponse.json();

      // Tìm ID của voucher theo mã code
      const matchingVoucher = allVouchers.find((v: any) =>
        v.code.toLowerCase() === voucherCode.trim().toLowerCase());

      if (!matchingVoucher) {
        throw new Error('Mã giảm giá không tồn tại');
      }

      // Bước 2: Lấy thông tin chi tiết của voucher theo ID
      const voucherDetailResponse = await fetch(`http://68.183.226.198:3000/api/v1/vouchers/${matchingVoucher.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!voucherDetailResponse.ok) {
        throw new Error('Không thể lấy thông tin mã giảm giá');
      }

      const voucher = await voucherDetailResponse.json();

      // Kiểm tra tính hợp lệ của voucher
      const validationResult = isVoucherValid(voucher, subTotal);
      if (!validationResult.valid) {
        throw new Error(validationResult.message);
      }

      // Tính toán số tiền giảm giá
      const discountAmount = calculateDiscountAmount(voucher, subTotal);

      // Cập nhật state với voucher và số tiền giảm giá
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
      setDiscount(discountAmount);

      // Lưu voucher đã áp dụng vào localStorage để sử dụng ở trang khác
      localStorage.setItem('appliedVoucher', JSON.stringify({
        ...voucher,
        discountAmount
      }));

      // Hiển thị thông báo thành công
      showToastMessage(`Đã áp dụng mã giảm giá: ${voucher.code}`, 'success');
    } catch (error: any) {
      console.error('Error applying voucher:', error);
      setVoucherError(error.message || 'Không thể áp dụng mã giảm giá');
      setAppliedVoucher(null);
      setDiscount(0);
      localStorage.removeItem('appliedVoucher');
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Hàm xóa voucher đã áp dụng
  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setDiscount(0);
    localStorage.removeItem('appliedVoucher');
    showToastMessage('Đã xóa mã giảm giá', 'info');
  };

  // Cập nhật hàm handlePlaceOrder với xử lý lỗi Redis tốt hơn
  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showAddAddressForm) {
      showToastMessage('Vui lòng chọn địa chỉ giao hàng', 'error');
      return;
    }

    if (showAddAddressForm) {
      showToastMessage('Vui lòng lưu địa chỉ giao hàng trước khi đặt hàng', 'error');
      return;
    }

    try {
      setLoading(true);

      // Lấy thông tin địa chỉ đã chọn
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Không tìm thấy địa chỉ giao hàng');
      }

      // Format địa chỉ thành chuỗi theo định dạng mới
      const formattedAddress = `${selectedAddress.streetAddress}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;

      // Chuyển đổi định dạng item theo yêu cầu API mới
      const formattedItems = cartItems.map(item => {
        // Đảm bảo product_detail_id là số
        let productDetailId = Number(item.detailId);

        // Kiểm tra nếu chuyển đổi không thành công (NaN)
        if (isNaN(productDetailId)) {
          console.error(`Invalid product_detail_id: ${item.detailId}`);
          productDetailId = 0; // Đặt giá trị mặc định hoặc có thể throw error
        }

        return {
          quantity: item.quantity,
          product_detail_id: productDetailId
        };
      });

      // Tạo dữ liệu đơn hàng mới
      const newOrderData = {
        user_id: Number(userId),
        address: formattedAddress,
        voucher_code: appliedVoucher?.code || undefined,
        item: formattedItems
      };

      console.log('Đang tạo đơn hàng mới:', newOrderData);

      // Gọi API để tạo đơn hàng mới
      const response = await fetch('http://68.183.226.198:3000/api/orders', {
        method: 'POST', // Sử dụng POST để tạo mới
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(newOrderData)
      });

      if (!response) {
        throw new Error('Không thể kết nối đến máy chủ.');
      }

      if (response.ok) {
        const newOrder = await response.json();
        console.log('Đơn hàng mới đã được tạo:', newOrder);

        // Xóa giỏ hàng và voucher sau khi đặt hàng thành công
        localStorage.setItem('cart', '[]');
        localStorage.removeItem('appliedVoucher');

        showToastMessage('Đặt hàng thành công!', 'success');

        // Chuyển hướng đến trang chi tiết đơn hàng
        setTimeout(() => {
          router.push(`/user/order`);
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);

        // Xử lý các mã lỗi cụ thể từ API
        if (response.status === 400) {
          // Xử lý lỗi 400
          throw new Error(errorData.message || 'Thông tin đơn hàng không hợp lệ');
        } else if (response.status === 401) {
          showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
          setTimeout(() => router.push('/user/signin'), 2000);
          return;
        } else if (response.status === 404) {
          throw new Error('Một số sản phẩm trong giỏ hàng không còn tồn tại');
        } else if (response.status === 409) {
          throw new Error(errorData.message || 'Một số sản phẩm không còn đủ số lượng');
        } else if (response.status === 422) {
          // Xử lý lỗi validation
          let errorMessage = 'Dữ liệu đơn hàng không hợp lệ: ';

          if (errorData.errors?.item) {
            // Kiểm tra lỗi chi tiết trong item
            const itemErrors = Object.values(errorData.errors.item).map((err: any) => {
              // Lấy thông báo lỗi từ các trường
              const errorMessages = Object.values(err).join(', ');
              return errorMessages;
            }).join('; ');

            errorMessage += itemErrors || 'ID sản phẩm không hợp lệ';
          } else {
            errorMessage += errorData.message || 'Vui lòng kiểm tra lại thông tin đơn hàng';
          }

          throw new Error(errorMessage);
        } else {
          throw new Error(errorData.message || 'Không thể tạo đơn hàng. Vui lòng thử lại sau');
        }
      }
    } catch (error: any) {
      console.error('Error creating new order:', error);
      showToastMessage(error.message || 'Đặt hàng thất bại. Vui lòng thử lại', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm xử lý khi nhấn nút "Thêm địa chỉ mới"
  const handleAddNewAddress = async () => {
    try {
      // Trước khi hiển thị form, lấy thông tin người dùng để điền sẵn
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

      // Nếu có lỗi, vẫn hiển thị form với thông tin trống
      setNewAddress({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: addresses.length === 0
      });

      setShowAddAddressForm(true);
    }
  };

  if (loading) {
    return (
      <div className='bg-[#F1EEE9] min-h-screen'>
        <Header />
        <div className='container mx-auto px-4 py-12 flex justify-center items-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;

    setNewAddress(prev => ({ ...prev, district: districtName }));
    fetchWards(districtId);
    setNewAddress(prev => ({ ...prev, ward: '' }));
  };

  // Thêm handler cho việc thay đổi phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    const wardName = e.target.options[e.target.selectedIndex].text;

    setNewAddress(prev => ({ ...prev, ward: wardName }));
  };

  return (
    <div className='bg-[#F1EEE9] min-h-screen'>
      <Header />

      {/* Toast notification */}
      <div className='fixed top-4 right-4 z-50'>
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      </div>

      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-medium mb-6'>Thanh Toán</h1>

        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left column - Shipping address and payment method */}
          <div className='lg:w-2/3'>
            {/* Shipping addresses section */}
            <div className='bg-white rounded-lg shadow p-6 mb-6'>
              <h2 className='text-xl font-medium mb-4'>Địa chỉ giao hàng</h2>

              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              )}

              {!loading && (
                <>
                  {/* Hiển thị dropdown địa chỉ nếu có và không đang hiện form thêm mới */}
                  {addresses.length > 0 && !showAddAddressForm ? (
                    <div className='mb-4'>
                      <div className='relative'>
                        <select
                          value={selectedAddressId || ''}
                          onChange={(e) => handleAddressSelect(Number(e.target.value))}
                          className='w-full border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white appearance-none'
                        >
                          {addresses.map(address => (
                            <option key={address.id} value={address.id}>
                              {address.fullName} | {address.phone} | {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                              {address.isDefault ? ' (Mặc định)' : ''}
                            </option>
                          ))}
                        </select>
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
                          </svg>
                        </div>
                      </div>
                      {/* Hiện thị địa chỉ đã chọn chi tiết */}
                      {selectedAddressId && (
                        <div className='mt-4 border rounded-lg p-4 bg-gray-50'>
                          {(() => {
                            const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                            return selectedAddress ? (
                              <div>
                                <div className='flex justify-between'>
                                  <div className='font-medium'>
                                    <div className="text-base text-gray-800">
                                      <span className="font-semibold">Người nhận:</span> {selectedAddress.fullName || 'Không có tên'}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      <span className="font-semibold">Điện thoại:</span> {selectedAddress.phone || 'Không có số điện thoại'}
                                    </div>
                                  </div>
                                  {selectedAddress.isDefault && (
                                    <span className='text-sm text-orange-600 bg-orange-100 px-2 py-1 h-fit rounded-full'>Mặc định</span>
                                  )}
                                </div>
                                <div className='text-gray-600 text-sm mt-2 border-t border-gray-200 pt-2'>
                                  <span className="font-semibold">Địa chỉ:</span> {selectedAddress.streetAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                                </div>
                                <div className='flex mt-2 pt-2 border-t border-gray-200 justify-between'>
                                  <button
                                    className='text-orange-600 text-sm hover:underline'
                                    onClick={() => handleEditAddress(selectedAddress.id!)}
                                  >
                                    Chỉnh sửa
                                  </button>

                                  {/* Chỉ hiển thị nút xóa khi có nhiều hơn 1 địa chỉ hoặc địa chỉ hiện tại không phải mặc định */}
                                  {(addresses.length > 1 || !selectedAddress.isDefault) && (
                                    <button
                                      className='text-red-600 text-sm hover:underline'
                                      onClick={() => handleDeleteAddress(selectedAddress.id!)}
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Nút thêm địa chỉ mới */}
                      <button
                        onClick={handleAddNewAddress}
                        className='mt-4 flex items-center justify-center w-full border border-dashed border-gray-300 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200'
                      >
                        <svg className='w-5 h-5 text-orange-600 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                        <span className='text-orange-600 font-medium'>Thêm địa chỉ mới</span>
                      </button>
                    </div>
                  ) : (
                    /* Hiển thị form thêm địa chỉ nếu không có địa chỉ hoặc đang chọn thêm mới */
                    showAddAddressForm && (
                      <form onSubmit={handleSaveAddress} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {/* Thông tin người nhận */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Họ tên người nhận</label>
                            <input
                              type='text'
                              name='fullName'
                              value={newAddress.fullName}
                              onChange={handleAddressChange}
                              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Số điện thoại</label>
                            <input
                              type='tel'
                              name='phone'
                              value={newAddress.phone}
                              onChange={handleAddressChange}
                              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                            />
                          </div>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Tỉnh/Thành phố</label>
                          <select
                            name='province'
                            value={provinces.find(p => p.name === newAddress.province)?.id || ''}
                            onChange={handleProvinceChange}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                          >
                            <option value=''>-- Chọn Tỉnh/Thành phố --</option>
                            {provinces.map(province => (
                              <option key={province.id} value={province.id}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Quận/Huyện</label>
                          <select
                            name='district'
                            value={districts.find(d => d.name === newAddress.district)?.id || ''}
                            onChange={handleDistrictChange}
                            disabled={!newAddress.province}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100'
                          >
                            <option value=''>-- Chọn Quận/Huyện --</option>
                            {districts.map(district => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Phường/Xã</label>
                          <select
                            name='ward'
                            value={wards.find(w => w.name === newAddress.ward)?.id || ''}
                            onChange={handleWardChange}
                            disabled={!newAddress.district}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100'
                          >
                            <option value=''>-- Chọn Phường/Xã --</option>
                            {wards.map(ward => (
                              <option key={ward.id} value={ward.id}>
                                {ward.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>Địa chỉ cụ thể</label>
                          <input
                            type='text'
                            name='streetAddress'
                            value={newAddress.streetAddress}
                            onChange={handleAddressChange}
                            placeholder='Số nhà, tên đường...'
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                          />
                        </div>

                        {/* Nút lưu và hủy */}
                        <div className='flex space-x-3 pt-3'>
                          <button
                            type='button'
                            onClick={() => {
                              setShowAddAddressForm(false);
                              if (addresses.length > 0) {
                                // Nếu có địa chỉ, chỉ ẩn form
                                const defaultAddress = addresses.find(addr => addr.isDefault);
                                if (defaultAddress) {
                                  setSelectedAddressId(defaultAddress.id ?? null);
                                } else {
                                  setSelectedAddressId(addresses[0].id ?? null);
                                }
                              }
                            }}
                            disabled={addresses.length === 0 && !newAddress.id} // Disable nút hủy khi không có địa chỉ và đang thêm mới
                            className={`flex-1 py-2 border border-gray-300 rounded-md text-gray-700 
                              ${addresses.length === 0 && !newAddress.id
                                ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                : 'hover:bg-gray-50'}`}
                          >
                            Hủy
                          </button>
                          <button
                            type='submit'
                            className='flex-1 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500'
                          >
                            {newAddress.id ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                          </button>
                        </div>
                      </form>
                    )
                  )}
                </>
              )}
            </div>

            {/* Payment methods */}
            <div className='bg-white rounded-lg shadow p-6 mb-6'>
              <h2 className='text-xl font-medium mb-4'>Phương thức thanh toán</h2>

              <div className='space-y-3'>
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className='flex items-center'>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'COD' ? 'border-orange-500' : 'border-gray-400'}`}>
                      {paymentMethod === 'COD' && (
                        <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>Thanh toán khi nhận hàng (COD)</p>
                      <p className='text-sm text-gray-600 mt-1'>Bạn chỉ phải thanh toán khi nhận được hàng</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'BANKING' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('BANKING')}
                >
                  <div className='flex items-center'>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'BANKING' ? 'border-orange-500' : 'border-gray-400'}`}>
                      {paymentMethod === 'BANKING' && (
                        <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>Chuyển khoản ngân hàng</p>
                      <p className='text-sm text-gray-600 mt-1'>Thanh toán qua chuyển khoản ngân hàng</p>
                    </div>
                  </div>

                  {paymentMethod === 'BANKING' && (
                    <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm'>
                      <p className='font-medium'>Thông tin chuyển khoản:</p>
                      <p>Ngân hàng: <span className='font-medium'>VietComBank</span></p>
                      <p>Số tài khoản: <span className='font-medium'>0123456789</span></p>
                      <p>Chủ tài khoản: <span className='font-medium'>CÔNG TY TNHH CANDLE BLISS</span></p>
                      <p className='mt-2'>Nội dung chuyển khoản: <span className='font-medium'>[Tên của bạn] - [Số điện thoại]</span></p>
                    </div>
                  )}
                </div>

              </div>

              {/* Ghi chú đơn hàng */}
              <div className='mt-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Ghi chú đơn hàng (không bắt buộc)</label>
                <textarea
                  name='orderNote'
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder='Nhập ghi chú cho đơn hàng của bạn...'
                  rows={3}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                ></textarea>
              </div>
            </div>


          </div>

          {/* Right column - Order summary */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-lg shadow p-6 sticky top-6'>
              <h2 className='text-xl font-medium mb-4'>Thông tin đơn hàng</h2>

              <div className='max-h-80 overflow-y-auto mb-4'>
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.detailId}`} className='flex py-3 border-b border-gray-100'>
                    <div className='relative w-16 h-16 bg-gray-100 rounded'>
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        layout='fill'
                        objectFit='contain'
                        className='p-2'
                      />
                      <span className='absolute -top-2 -right-2 bg-gray-700 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center'>
                        {item.quantity}
                      </span>
                    </div>
                    <div className='ml-3 flex-1'>
                      <p className='font-medium text-sm line-clamp-2'>{item.name}</p>

                      <div className='text-xs text-gray-500 mt-1'>
                        {/* Show product options */}
                        {item.options?.map((option, idx) => (
                          <p key={idx}>{option.name}: {option.value}</p>
                        ))}
                      </div>

                      <div className='flex justify-between mt-1'>
                        <span className='text-sm'>{formatPrice(item.price)}</span>
                        <span className='text-sm text-orange-600 font-medium'>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price calculation */}
              <div className='space-y-2 text-sm mb-4'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Tạm tính sản phẩm</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Phí vận chuyển</span>
                  <div className='text-right'>
                    <span>{formatPrice(shippingFee)}</span>
                    <div className='text-xs text-gray-500 mt-1'>
                      {shippingFee === 20000 ?
                        '(TP. Hồ Chí Minh)' :
                        '(Tỉnh/thành phố khác)'}
                    </div>
                  </div>
                </div>

                {/* Phần nhập và áp dụng voucher */}
                <div className='pt-3 border-t border-gray-100'>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      placeholder='Nhập mã giảm giá'
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      disabled={!!appliedVoucher || applyingVoucher}
                      className='flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'
                    />
                    {!appliedVoucher ? (
                      <button
                        onClick={applyVoucher}
                        disabled={applyingVoucher}
                        className='bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-orange-700 disabled:bg-gray-400'
                      >
                        {applyingVoucher ? '...' : 'Áp dụng'}
                      </button>
                    ) : (
                      <button
                        onClick={removeVoucher}
                        className='bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700'
                      >
                        Hủy
                      </button>
                    )}
                  </div>

                  {/* Hiển thị lỗi */}
                  {voucherError && (
                    <div className='text-red-500 text-xs mt-1'>{voucherError}</div>
                  )}

                  {/* Hiển thị voucher đã áp dụng */}
                  {appliedVoucher && (
                    <div className='mt-2 border border-green-200 rounded-md overflow-hidden'>
                      <div className='bg-green-50 p-3 border-b border-green-200'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center'>
                            <span className='bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded'>
                              {appliedVoucher.code}
                            </span>
                            <span className='text-green-700 font-medium text-sm ml-2'>
                              {appliedVoucher.percent_off && Number(appliedVoucher.percent_off) > 0
                                ? `Giảm ${appliedVoucher.percent_off}%`
                                : `Giảm ${formatPrice(Number(appliedVoucher.amount_off))}`}
                            </span>
                          </div>
                          <span className='text-green-700 font-medium'>-{formatPrice(discount)}</span>
                        </div>
                      </div>

                      <div className='bg-white p-3 text-xs space-y-1'>
                        {/* Mô tả voucher */}
                        {appliedVoucher.description && (
                          <p className='text-gray-700'>{appliedVoucher.description}</p>
                        )}

                        {/* Giá trị đơn hàng tối thiểu */}
                        <p className='text-gray-600'>
                          Đơn hàng tối thiểu: {formatPrice(Number(appliedVoucher.min_order_value))}
                        </p>

                        {/* Giới hạn giảm giá tối đa nếu có */}
                        {Number(appliedVoucher.max_voucher_amount) > 0 && (
                          <p className='text-gray-600'>
                            Giảm tối đa: {formatPrice(Number(appliedVoucher.max_voucher_amount))}
                          </p>
                        )}

                        {/* Thời hạn sử dụng */}
                        <p className='text-gray-600'>
                          Hiệu lực đến: {new Date(appliedVoucher.end_date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hiển thị số tiền giảm giá */}
                {appliedVoucher && (
                  <div className='flex justify-between text-green-700'>
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className='border-t border-gray-200 pt-3 mb-4'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>Tổng thanh toán</span>
                  <span className='text-xl font-bold text-orange-600'>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className='w-full py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center'
              >
                {loading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-2 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt hàng'
                )}
              </button>

              <p className='text-center text-sm text-gray-500 mt-4'>
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <Link href='/user/terms' className='text-orange-600 hover:underline'>
                  Điều khoản dịch vụ
                </Link>{' '}
                của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}