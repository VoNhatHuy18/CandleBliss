'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';
import { incrementCartBadge } from '@/app/utils/cartBadgeManager';
import { HOST } from '@/app/constants/api';

interface ProductImage {
   id: string;
   path: string;
   public_id: string;
}

interface User {
   id: number;
   firstName: string;
   lastName: string;
   photo?: {
      path: string;
   };
}

interface ProductDetail {
   id: number;
   size: string;
   type: string;
   values: string;
   quantities: number;
   images: ProductImage[];
   isActive: boolean;
   productId?: number;
}

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage[] | ProductImage;
   details?: ProductDetail[];
   ratings?: ProductRating[];  // Thêm trường ratings nếu API trả về
}

interface CartItem {
   id: number;
   detailId: number;
   name: string;
   price: number;
   quantity: number;
   image: string;
   type: string;
   options: {
      name: string;
      value: string;
   }[];
}
interface ProductRating {
   id: number;
   product_id: number;
   user_id: number;
   user_name?: string; // Tên người dùng
   avatar?: string;    // Avatar người dùng
   rating: number;     // Số sao đánh giá (1-5)
   comment: string;    // Nội dung đánh giá
   created_at: string; // Ngày đánh giá
}

const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(price);
};

const calculateDiscountedPrice = (basePrice: number, discountPercentage: number | null) => {
   if (!discountPercentage || discountPercentage <= 0) return basePrice;
   return basePrice - basePrice * (discountPercentage / 100);
};

// Thêm component hiển thị sao
const StarDisplay = ({ rating }: { rating: number }) => {
   return (
      <div className="flex">
         {[1, 2, 3, 4, 5].map((star) => (
            <svg
               key={star}
               xmlns="http://www.w3.org/2000/svg"
               className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
               viewBox="0 0 20 20"
               fill="currentColor"
            >
               <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
               />
            </svg>
         ))}
      </div>
   );
};

export default function ProductDetailPage() {
   const params = useParams();
   const router = useRouter();
   const productId = params.id;

   const [quantity, setQuantity] = useState(1);
   const [activeTab, setActiveTab] = useState(0);
   const [activeThumbnail, setActiveThumbnail] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [product, setProduct] = useState<Product | null>(null);
   const [selectedSize, setSelectedSize] = useState<string>('');
   const [selectedType, setSelectedType] = useState<string>('');
   const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
   const [detailPrices, setDetailPrices] = useState<
      Record<
         number,
         {
            base_price: number;
            discount_price: number | null;
            start_date?: string;
            end_date?: string;
         }
      >
   >({});
   const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
   const [showCartNotification, setShowCartNotification] = useState(false);
   const [productRatings, setProductRatings] = useState<ProductRating[]>([]);
   const [loadingRatings, setLoadingRatings] = useState(false);

   const selectedDetail = selectedDetailId
      ? productDetails.find((detail) => detail.id === selectedDetailId)
      : null;

   useEffect(() => {
      setActiveThumbnail(0);
   }, [selectedDetailId]);

   const fetchDetailPrices = async (details: ProductDetail[]) => {
      try {
         const pricesMap: Record<
            number,
            {
               base_price: number;
               discount_price: number | null;
               start_date?: string;
               end_date?: string;
            }
         > = {};

         for (const detail of details) {
            if (detail && typeof detail.id === 'number') {
               try {
                  const priceResponse = await fetch(
                     `${HOST}/api/v1/prices/product-detail/${detail.id}`,
                     {
                        headers: {
                           Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                     },
                  );

                  if (priceResponse.ok) {
                     const priceData = await priceResponse.json();
                     console.log(`Giá cho chi tiết ${detail.id}:`, priceData);

                     if (Array.isArray(priceData) && priceData.length > 0) {
                        priceData.sort((a, b) => {
                           const aPrice = Number(a.base_price);
                           const bPrice = Number(b.base_price);
                           if (isNaN(aPrice) || isNaN(bPrice)) return 0;
                           return aPrice - bPrice;
                        });

                        const priceInfo = priceData[0];

                        pricesMap[detail.id] = {
                           base_price: Number(priceInfo.base_price) || 0,
                           discount_price: priceInfo.discount_price,
                           start_date: priceInfo.start_date,
                           end_date: priceInfo.end_date,
                        };
                     } else {
                        pricesMap[detail.id] = {
                           base_price: 0,
                           discount_price: null,
                        };
                     }
                  } else {
                     console.warn(
                        `Không thể lấy giá cho chi tiết ${detail.id}, sử dụng giá mặc định`,
                     );
                     pricesMap[detail.id] = {
                        base_price: 0,
                        discount_price: null,
                     };
                  }
               } catch (error) {
                  console.error(`Lỗi khi lấy giá cho chi tiết ${detail.id}:`, error);
                  pricesMap[detail.id] = {
                     base_price: 0,
                     discount_price: null,
                  };
               }
            }
         }

         console.log('Đã lấy thông tin giá cho tất cả chi tiết:', pricesMap);
         setDetailPrices(pricesMap);
      } catch (error) {
         console.error('Lỗi khi lấy giá chi tiết sản phẩm:', error);
      }
   };

   const processProductData = useCallback((productData: Product) => {
      try {
         console.log('Đang xử lý dữ liệu sản phẩm:', productData);

         // Xử lý ratings nếu có từ API sản phẩm
         if (productData.ratings && Array.isArray(productData.ratings)) {
            console.log('Đánh giá sản phẩm:', productData.ratings.length, 'đánh giá');
            setProductRatings(productData.ratings);
         } else {
            console.log('Sản phẩm không có đánh giá từ API');
            setProductRatings([]);
         }

         const normalizedImages = Array.isArray(productData.images)
            ? productData.images
            : productData.images
               ? [productData.images]
               : [];

         console.log('Ảnh sản phẩm sau khi chuẩn hóa:', normalizedImages.length, 'ảnh');

         const updatedProduct = {
            ...productData,
            images: normalizedImages,
         };

         setProduct(updatedProduct);

         if (productData.details && productData.details.length > 0) {
            console.log('Sản phẩm có', productData.details.length, 'chi tiết');
            setProductDetails(productData.details);

            const activeDetails = productData.details.filter((detail) => detail.isActive);
            if (activeDetails.length > 0) {
               const firstActiveDetail = activeDetails[0];
               console.log('Chi tiết mặc định:', firstActiveDetail);
               setSelectedDetailId(firstActiveDetail.id);
               setSelectedSize(firstActiveDetail.size);
               setSelectedType(firstActiveDetail.type);
            }

            fetchDetailPrices(productData.details);
         } else {
            console.log('Sản phẩm không có chi tiết, tạo chi tiết mặc định');
            const defaultDetail = {
               id: 0,
               size: 'Standard',
               type: 'Default',
               values: '',
               quantities: 100,
               images: [],
               isActive: true,
               productId: productData.id,
            };

            setProductDetails([defaultDetail]);
            setSelectedDetailId(0);
            setSelectedSize('Standard');
            setSelectedType('Default');

            setDetailPrices({
               0: {
                  base_price: 0,
                  discount_price: null,
               },
            });
         }

         setLoading(false);
      } catch (error) {
         console.error('Lỗi khi xử lý dữ liệu sản phẩm:', error);
         setError('Lỗi khi xử lý dữ liệu sản phẩm');
         setLoading(false);
      }
   }, []);

   // Thay thế hoặc cập nhật phương thức fetchProductRatings
   const fetchProductRatings = useCallback(async (productId: string | string[]) => {
      try {
         console.log('Đang lấy đánh giá cho sản phẩm ID:', productId);
         await tryFetchRatingsDirectly(productId);
      } catch (error) {
         console.error('Lỗi khi lấy đánh giá:', error);
         setProductRatings([]);
         setLoadingRatings(false);
      }
   }, []);

   // Thêm phương thức dự phòng để gọi API đánh giá trực tiếp
   const tryFetchRatingsDirectly = async (productId: string | string[]) => {
      try {
         console.log('Thử gọi API đánh giá trực tiếp cho sản phẩm ID:', productId);
         setLoadingRatings(true);

         // Fetch ratings
         const ratingResponse = await fetch(`${HOST}/api/rating/get-by-product`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: parseInt(productId as string) })
         });

         if (!ratingResponse.ok) {
            const errorText = await ratingResponse.text();
            console.error('Không thể lấy đánh giá từ API rating:', ratingResponse.status, errorText);
            setProductRatings([]);
            setLoadingRatings(false);
            return;
         }

         const data = await ratingResponse.json();
         console.log('Dữ liệu đánh giá từ API rating:', data);

         if (!Array.isArray(data)) {
            console.error('Định dạng đánh giá không hợp lệ:', typeof data);
            setProductRatings([]);
            setLoadingRatings(false);
            return;
         }

         // Lọc các đánh giá có thông tin hợp lệ
         const validRatings = data.filter(rating =>
            rating.user_id && (rating.comment || rating.rating || rating.avg_rating)
         );

         console.log('Các đánh giá hợp lệ:', validRatings);

         // Fetch all users at once
         const users = await fetchAllUsers();
         console.log('Users fetched:', users.length);



         const userMap = users.reduce((map: Record<number, User>, user: User) => {
            map[user.id] = user;
            return map;
         }, {});

         // Combine ratings with user information
         const formattedRatings = validRatings.map(rating => {
            const user = userMap[rating.user_id];
            return {
               id: rating.id,
               product_id: parseInt(productId as string),
               user_id: rating.user_id,
               user_name: user ? `${user.firstName} ${user.lastName}` : `Khách hàng ${rating.user_id}`,
               avatar: user?.photo?.path || null,
               rating: rating.rating || rating.avg_rating || 5,
               comment: rating.comment || '',
               created_at: rating.created_at || new Date().toISOString()
            };
         });

         console.log('Formatted ratings with user info:', formattedRatings);
         setProductRatings(formattedRatings);
      } catch (error) {
         console.error('Lỗi khi gọi API rating trực tiếp:', error);
         setProductRatings([]);
      } finally {
         setLoadingRatings(false);
      }
   };

   // Add this function to fetch all users with proper authentication
   const fetchAllUsers = async () => {
      try {
         // Get token from localStorage
         const token = localStorage.getItem('token');

         const response = await fetch(`${HOST}/api/v1/users`, {
            headers: {
               'Authorization': `Bearer ${token || ''}`
            }
         });

         if (!response.ok) {
            console.warn(`Could not fetch users information: ${response.status}`);
            return [];
         }

         const result = await response.json();
         return result.data || [];
      } catch (error) {
         console.error('Error fetching users information:', error);
         return [];
      }
   };

   useEffect(() => {
      const fetchProductDetail = async () => {
         try {
            setLoading(true);

            if (!productId) {
               setError('ID sản phẩm không hợp lệ');
               setLoading(false);
               return;
            }

            console.log('Đang lấy thông tin sản phẩm với ID:', productId);

            try {
               const productResponse = await fetch(
                  `${HOST}/api/products/${productId}`,
               );

               if (!productResponse.ok) {
                  setError(`Không tìm thấy sản phẩm có ID ${productId}`);
                  setLoading(false);
                  return;
               }

               const productData: Product = await productResponse.json();
               console.log('Dữ liệu sản phẩm:', productData);

               processProductData(productData);

               // Tải hình ảnh chi tiết cho tất cả các phiên bản sản phẩm
               if (productData.details && productData.details.length > 0) {
                  // Tải tuần tự để tránh đồng thời quá nhiều request
                  for (const detail of productData.details) {
                     if (detail.isActive) {
                        await fetchProductDetailImages(detail.id);
                     }
                  }
               }
            } catch (fetchErr) {
               console.error('Lỗi khi lấy thông tin sản phẩm:', fetchErr);
               setError(fetchErr instanceof Error ? fetchErr.message : 'Lỗi kết nối tới máy chủ');
               setLoading(false);
            }
         } catch (err) {
            console.error('Lỗi trong quá trình lấy chi tiết sản phẩm:', err);
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            setLoading(false);
         }
      };

      fetchProductDetail();
   }, [productId, processProductData]); // Include processProductData as a dependency

   useEffect(() => {
      if (product && (!Array.isArray(product.images) || product.images.length === 0)) {
         setProduct((prev) => {
            if (!prev) return null;
            return {
               ...prev,
               images: [
                  {
                     id: '0',
                     path: '/images/placeholder.jpg',
                     public_id: 'placeholder',
                  },
               ],
            };
         });
      }
   }, [product]);

   useEffect(() => {
      if (product && (!productDetails || productDetails.length === 0)) {
         const defaultDetail = {
            id: 0,
            size: 'Standard',
            type: 'Default',
            values: '',
            quantities: 100,
            images: [],
            isActive: true,
            productId: product.id,
         };

         setProductDetails([defaultDetail]);
         setSelectedDetailId(0);
         setSelectedSize('Standard');
         setSelectedType('Default');

         setDetailPrices({
            0: {
               base_price: 0,
               discount_price: null,
            },
         });
      }
   }, [product, productDetails]);

   useEffect(() => {
      if (productDetails.length > 0) {
         const matchingDetail = productDetails.find(
            (detail) =>
               detail.size === selectedSize && detail.type === selectedType && detail.isActive,
         );

         if (matchingDetail) {
            setSelectedDetailId(matchingDetail.id);
         } else {
            const sameSize = productDetails.find(
               (detail) => detail.size === selectedSize && detail.isActive,
            );

            if (sameSize) {
               setSelectedDetailId(sameSize.id);
               setSelectedType(sameSize.type);
            } else {
               const firstActive = productDetails.find((detail) => detail.isActive);
               if (firstActive) {
                  setSelectedDetailId(firstActive.id);
                  setSelectedSize(firstActive.size);
                  setSelectedType(firstActive.type);
               }
            }
         }
      }
   }, [selectedSize, selectedType, productDetails]);

   useEffect(() => {
      if (productDetails.length > 0 && selectedDetail?.values) {
         const matchingDetail = productDetails.find(
            (detail) =>
               detail.size === selectedSize &&
               detail.values === selectedDetail.values &&
               detail.isActive,
         );

         if (matchingDetail) {
            setSelectedDetailId(matchingDetail.id);
            setSelectedType(matchingDetail.type);
         } else {
            const sameSize = productDetails.find(
               (detail) => detail.size === selectedSize && detail.isActive,
            );

            if (sameSize) {
               setSelectedDetailId(sameSize.id);
               setSelectedType(sameSize.type);
            } else {
               const firstActive = productDetails.find((detail) => detail.isActive);
               if (firstActive) {
                  setSelectedDetailId(firstActive.id);
                  setSelectedSize(firstActive.size);
                  setSelectedType(firstActive.type);
               }
            }
         }
      }
   }, [selectedSize, productDetails, selectedDetail]);

   useEffect(() => {
      if (productId) {
         fetchProductRatings(productId);
      }
   }, [productId, fetchProductRatings]);

   useEffect(() => {
      if (activeTab === 2 && productId) {
         fetchProductRatings(productId);
      }
   }, [activeTab, productId, fetchProductRatings]);

   // Thêm useEffect để gọi API khi component load hoặc khi productId thay đổi
   useEffect(() => {
      if (productId) {
         console.log('ProductId changed, fetching ratings for:', productId);
         fetchProductRatings(productId);
      }
   }, [productId, fetchProductRatings]);

   // Cũng nên gọi lại khi người dùng chọn tab đánh giá
   useEffect(() => {
      if (activeTab === 2 && productId) {
         console.log('Rating tab selected, fetching ratings for:', productId);
         fetchProductRatings(productId);
      }
   }, [activeTab, productId, fetchProductRatings]);

   // Thêm hàm để tải chi tiết sản phẩm từ API
   const fetchProductDetailImages = async (detailId: number) => {
      try {
         console.log('Tải hình ảnh chi tiết cho ID:', detailId);

         // Gọi API lấy chi tiết sản phẩm
         const response = await fetch(
            `${HOST}/api/product-details/${detailId}`
         );

         if (!response.ok) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', response.status);
            return null;
         }

         const detailData = await response.json();
         console.log('Dữ liệu chi tiết sản phẩm:', detailData);

         if (detailData && detailData.images && detailData.images.length > 0) {
            // Cập nhật chi tiết sản phẩm
            setProductDetails(prev =>
               prev.map(detail =>
                  detail.id === detailId
                     ? { ...detail, images: detailData.images }
                     : detail
               )
            );
            return detailData.images;
         }

         return null;
      } catch (error) {
         console.error('Lỗi khi tải hình ảnh chi tiết:', error);
         return null;
      }
   };

   // Khi người dùng chọn phiên bản sản phẩm, tải hình ảnh chi tiết nếu chưa có
   useEffect(() => {
      if (selectedDetailId !== null) {
         const currentDetail = productDetails.find(d => d.id === selectedDetailId);
         if (currentDetail && (!currentDetail.images || currentDetail.images.length === 0)) {
            fetchProductDetailImages(selectedDetailId);
         }
      }
   }, [selectedDetailId]);

   const selectedPriceInfo =
      selectedDetailId && detailPrices[selectedDetailId]
         ? detailPrices[selectedDetailId]
         : { base_price: 0, discount_price: null };

   const availableSizes = [
      ...new Set(productDetails.filter((detail) => detail.isActive).map((detail) => detail.size)),
   ];

   const allValues = [
      ...new Set(
         productDetails
            .filter((detail) => detail.isActive && detail.values)
            .map((detail) => detail.values),
      ),
   ];

   const isValueAvailableForSize = (value: string) => {
      return productDetails.some(
         (detail) => detail.size === selectedSize && detail.values === value && detail.isActive,
      );
   };

   const decreaseQuantity = () => {
      if (quantity > 1) {
         setQuantity(quantity - 1);
      }
   };

   const increaseQuantity = () => {
      const maxQuantity = selectedDetail?.quantities || 100;
      if (quantity < maxQuantity) {
         setQuantity(quantity + 1);
      }
   };

   const handleAddToCart = () => {
      if (!product || !selectedDetail) return;

      const basePrice = selectedPriceInfo.base_price || 0;
      const discountPercentage = selectedPriceInfo.discount_price || null;

      // Check if discount is valid based on dates
      let useDiscount = false;
      if (discountPercentage && selectedPriceInfo.start_date && selectedPriceInfo.end_date) {
         const now = new Date();
         const startDate = new Date(selectedPriceInfo.start_date);
         const endDate = new Date(selectedPriceInfo.end_date);

         // Only apply discount if current date is within range
         useDiscount = now >= startDate && now <= endDate;
      }

      // Apply discount only if it's valid
      let price = useDiscount ? calculateDiscountedPrice(basePrice, discountPercentage) : basePrice;

      if (isNaN(price)) {
         price = 0;
         console.warn('Invalid price detected, using 0 as default');
      }

      const cartItem = {
         id: product.id,
         detailId: selectedDetail.id,
         name: product.name,
         price: price,
         quantity: quantity,
         image:
            selectedDetail.images && selectedDetail.images.length > 0
               ? selectedDetail.images[0].path
               : Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0].path
                  : '/images/placeholder.jpg',
         type: `Loại: ${selectedDetail.type}`,
         options: [
            { name: 'Kích thước', value: selectedDetail.size },
            { name: 'Loại', value: selectedDetail.type },
            ...(selectedDetail.values ? [{ name: 'Giá trị', value: selectedDetail.values }] : []),
         ],
      };

      // ...rest of your cart logic
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

      const existingItemIndex = cartItems.findIndex(
         (item: CartItem) => item.id === cartItem.id && item.detailId === cartItem.detailId,
      );

      if (existingItemIndex >= 0) {
         cartItems[existingItemIndex].quantity += cartItem.quantity;
      } else {
         cartItems.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cartItems));

      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
      incrementCartBadge(quantity);
   };

   const handleBuyNow = () => {
      handleAddToCart();
      router.push('/user/cart');
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

   if (error || !product) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />
            <div className='container mx-auto px-4 py-12'>
               <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center'>
                  {error || 'Không tìm thấy thông tin sản phẩm'}
               </div>
               <div className='text-center mt-6'>
                  <Link href='/user/products' className='text-orange-700 hover:underline'>
                     Quay lại trang sản phẩm
                  </Link>
               </div>
            </div>
            <Footer />
         </div>
      );
   }

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         {/* Header */}
         <Header />

         {/* Breadcrumbs */}
         <div className='container mx-auto px-4 py-2 text-sm'>
            <div className='flex items-center text-gray-500'>
               <Link href='/' className='hover:text-orange-700'>
                  Trang chủ
               </Link>
               <span className='mx-2'>/</span>
               <Link href='/user/products' className='hover:text-orange-700'>
                  Sản phẩm
               </Link>
               <span className='mx-2'>/</span>
               <span className='text-gray-700 font-medium'>{product.name}</span>
            </div>
         </div>

         {/* Product Section */}
         <div className='container mx-auto px-4 py-6'>
            <div className='flex flex-col md:flex-row -mx-4'>
               {/* Product Images */}
               <div className='md:w-1/2 px-4 mb-6'>
                  {/* Main Product Image */}
                  <div className='relative bg-white mb-4 h-96 rounded-lg shadow-sm'>
                     <Image
                        src={(() => {
                           const combinedImages = [
                              ...(selectedDetail?.images || []),
                              ...(Array.isArray(product.images) ? product.images : []),
                           ];

                           return (
                              combinedImages[activeThumbnail]?.path || '/images/placeholder.jpg'
                           );
                        })()}
                        alt={product.name}
                        layout='fill'
                        objectFit='contain'
                        className='p-4'
                     />

                     {/* Image source indicator */}
                     {activeThumbnail >= 0 && (
                        <div className='absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded'>
                           {activeThumbnail < (selectedDetail?.images?.length || 0)
                              ? ` ${selectedDetail?.size} - ${selectedDetail?.values}`
                              : 'Sản phẩm'}
                        </div>
                     )}
                  </div>

                  {/* Thumbnails Gallery - Show all images in a single row */}
                  <div className='flex flex-wrap -mx-1 overflow-x-auto pb-2'>
                     {/* Map all images with their detail metadata */}
                     {productDetails.map(
                        (detail) =>
                           detail.isActive &&
                           detail.images &&
                           detail.images.length > 0 &&
                           detail.images.map((img, detailImgIndex) => (
                              <div
                                 key={`detail-${detail.id}-${detailImgIndex}`}
                                 className={`p-1 w-1/6 cursor-pointer ${selectedDetailId === detail.id &&
                                    activeThumbnail === detailImgIndex
                                    ? 'ring-2 ring-orange-500'
                                    : ''
                                    }`}
                                 onClick={() => {
                                    setSelectedDetailId(detail.id);
                                    setSelectedSize(detail.size);
                                    setSelectedType(detail.type);
                                    setActiveThumbnail(detailImgIndex);
                                 }}
                              >
                                 <div className='relative bg-white h-16 rounded shadow-sm'>
                                    <Image
                                       src={img.path || '/images/placeholder.jpg'}
                                       alt={`${product.name} - ${detail.size} ${detail.values}`}
                                       layout='fill'
                                       objectFit='contain'
                                       className='p-1'
                                    />
                                    {/* Show detail info on thumbnail */}
                                    <div className='absolute bottom-0 right-0 left-0 bg-black bg-opacity-30 text-white text-xs px-1 text-center truncate'>
                                       {detail.size} - {detail.values || detail.type}
                                    </div>
                                 </div>
                              </div>
                           )),
                     )}

                     {/* Product generic images */}
                     {Array.isArray(product.images) &&
                        product.images.map((img, productImgIndex) => (
                           <div
                              key={`product-${productImgIndex}`}
                              className={`p-1 w-1/6 cursor-pointer ${activeThumbnail ===
                                 (selectedDetail?.images?.length || 0) + productImgIndex
                                 ? 'ring-2 ring-orange-500'
                                 : ''
                                 }`}
                              onClick={() => {
                                 const detailImagesLength = selectedDetail?.images?.length || 0;
                                 setActiveThumbnail(detailImagesLength + productImgIndex);
                              }}
                           >
                              <div className='relative bg-white h-16 rounded shadow-sm'>
                                 <Image
                                    src={img.path || '/images/placeholder.jpg'}
                                    alt={`${product.name} image ${productImgIndex + 1}`}
                                    layout='fill'
                                    objectFit='contain'
                                    className='p-1'
                                 />
                                 <div className='absolute bottom-0 right-0 left-0 bg-black bg-opacity-30 text-white text-xs px-1 text-center'>
                                    Sản phẩm
                                 </div>
                              </div>
                           </div>
                        ))}
                  </div>
               </div>

               {/* Product Details */}
               <div className='md:w-1/2 px-4'>
                  <h1 className='text-3xl font-medium mb-2'>{product.name}</h1>
                  <div className='flex items-center mb-4'>
                     <div className='flex items-center'>
                        <span className='text-gray-500 text-sm mr-2'>Mã SP: {product.id}</span>
                        <span className='mx-2 text-gray-300'>|</span>
                        <div className='flex items-center text-sm'>
                           <span
                              className={
                                 selectedDetail?.isActive && selectedDetail?.quantities > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                              }
                           >
                              {selectedDetail?.isActive && selectedDetail?.quantities > 0
                                 ? 'Còn hàng'
                                 : 'Hết hàng'}
                           </span>
                           {selectedDetail && (
                              <span className='text-gray-500 ml-1'>
                                 ({selectedDetail.quantities} sản phẩm)
                              </span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className='mb-6 bg-gray-50 p-4 rounded'>
                     {selectedPriceInfo && (
                        <div className='flex items-center'>
                           {(() => {
                              // Check if discount is valid
                              let isDiscountValid = false;
                              if (
                                 selectedPriceInfo.discount_price &&
                                 selectedPriceInfo.start_date &&
                                 selectedPriceInfo.end_date
                              ) {
                                 const now = new Date();
                                 const startDate = new Date(selectedPriceInfo.start_date);
                                 const endDate = new Date(selectedPriceInfo.end_date);
                                 isDiscountValid = now >= startDate && now <= endDate;
                              }

                              // Show discounted price only if discount is valid
                              if (
                                 selectedPriceInfo.discount_price &&
                                 Number(selectedPriceInfo.discount_price) > 0 &&
                                 isDiscountValid
                              ) {
                                 return (
                                    <>
                                       <span className='text-red-600 text-2xl font-medium'>
                                          {formatPrice(
                                             calculateDiscountedPrice(
                                                selectedPriceInfo.base_price,
                                                selectedPriceInfo.discount_price,
                                             ),
                                          )}
                                       </span>
                                       <span className='ml-2 text-gray-500 line-through'>
                                          {formatPrice(selectedPriceInfo.base_price)}
                                       </span>
                                       <div className='bg-red-600 text-white text-xs px-2 py-1 rounded ml-2'>
                                          Giảm {selectedPriceInfo.discount_price}%
                                       </div>
                                    </>
                                 );
                              } else {
                                 return (
                                    <span className='text-red-600 text-2xl font-medium'>
                                       {formatPrice(selectedPriceInfo.base_price)}
                                    </span>
                                 );
                              }
                           })()}
                        </div>
                     )}
                  </div>

                  <div className='mb-6'>
                     {/* Size Field */}
                     {availableSizes.length > 0 && (
                        <div className='flex items-center mb-4'>
                           <span className='text-gray-700 w-24 font-medium'>Kích thước:</span>
                           <div className='flex gap-2'>
                              {availableSizes.map((size) => (
                                 <label
                                    key={size}
                                    className={`flex items-center border ${selectedSize === size
                                       ? 'border-orange-500 bg-orange-50'
                                       : 'border-gray-300'
                                       } rounded px-3 py-1.5 cursor-pointer`}
                                 >
                                    <input
                                       type='radio'
                                       name='size'
                                       className='mr-1.5'
                                       checked={selectedSize === size}
                                       onChange={() => {
                                          setSelectedSize(size);
                                          setActiveThumbnail(0);
                                       }}
                                    />
                                    <span>{size}</span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Values Field - Show all values but disable those not available for selected size */}
                     {allValues.length > 0 && (
                        <div className='flex items-center mb-4'>
                           <span className='text-gray-700 w-24 font-medium'>
                              {selectedDetail?.type}:
                           </span>
                           <div className='flex flex-wrap gap-2'>
                              {allValues.map((value) => {
                                 const isAvailable = isValueAvailableForSize(value);
                                 const isSelected = selectedDetail?.values === value;

                                 return (
                                    <label
                                       key={value}
                                       className={`flex items-center border ${isSelected
                                          ? 'border-orange-500 bg-orange-50'
                                          : isAvailable
                                             ? 'border-gray-300 hover:bg-gray-50'
                                             : 'border-gray-200 bg-gray-100'
                                          } rounded px-3 py-1.5 ${isAvailable
                                             ? 'cursor-pointer'
                                             : 'opacity-50 cursor-not-allowed'
                                          }`}
                                    >
                                       <input
                                          type='radio'
                                          name='values'
                                          className='mr-1.5'
                                          checked={isSelected}
                                          onChange={() => {
                                             if (isAvailable) {
                                                const detailWithValue = productDetails.find(
                                                   (detail) =>
                                                      detail.size === selectedSize &&
                                                      detail.values === value &&
                                                      detail.isActive,
                                                );

                                                if (detailWithValue) {
                                                   setSelectedDetailId(detailWithValue.id);
                                                   setSelectedType(detailWithValue.type);
                                                   setActiveThumbnail(0);
                                                }
                                             }
                                          }}
                                          disabled={!isAvailable}
                                       />
                                       <span>{value}</span>
                                    </label>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Quantity */}
                     <div className='flex items-center mb-4'>
                        <span className='text-gray-700 w-24 fưont-medium'>Số lượng:</span>
                        <div className='flex shadow-sm'>
                           <button
                              className='border border-gray-300 px-3 py-1 rounded-l hover:bg-gray-100'
                              onClick={decreaseQuantity}
                              disabled={
                                 !selectedDetail?.isActive || selectedDetail?.quantities <= 0
                              }
                           >
                              -
                           </button>
                           <input
                              type='text'
                              className='border-t border-b border-gray-300 w-12 text-center'
                              value={quantity}
                              readOnly
                           />
                           <button
                              className='border border-gray-300 px-3 py-1 rounded-r hover:bg-gray-100'
                              onClick={increaseQuantity}
                              disabled={
                                 !selectedDetail?.isActive || selectedDetail?.quantities <= 0
                              }
                           >
                              +
                           </button>
                        </div>
                     </div>

                     {/* Action Buttons */}


                     <div className='grid grid-cols-1 gap-3 mb-2'>
                        <button
                           className='flex justify-center items-center bg-white border border-gray-300 py-2.5 text-sm text-gray-700 rounded hover:bg-gray-50 transition disabled:opacity-50'
                           onClick={handleAddToCart}
                           disabled={!selectedDetail?.isActive || selectedDetail?.quantities <= 0}
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
                                 d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                              />
                           </svg>
                           <span>Thêm vào giỏ hàng</span>
                        </button>
                        <button
                           className='bg-orange-700 border border-orange-700 py-3 text-sm text-white rounded hover:bg-orange-800 transition font-medium disabled:opacity-50 disabled:hover:bg-orange-700'
                           onClick={handleBuyNow}
                           disabled={!selectedDetail?.isActive || selectedDetail?.quantities <= 0}
                        >
                           Mua ngay
                        </button>
                        <button className='bg-orange-50 border border-orange-700 py-3 text-sm text-orange-700 rounded hover:bg-orange-100 transition font-medium'>
                           Nhắn tin với shop
                        </button>

                     </div>
                  </div>
               </div>
            </div>

            {/* Product Description */}
            <div className='mt-10 bg-white shadow rounded'>
               <div className='border-b border-gray-200'>
                  <div className='container mx-auto px-4'>
                     <ul className='flex flex-wrap'>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${activeTab === 0
                              ? 'border-b-2 border-orange-500 text-orange-700'
                              : 'text-gray-600 hover:text-orange-700'
                              }`}
                           onClick={() => setActiveTab(0)}
                        >
                           Mô Tả Sản Phẩm
                        </li>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${activeTab === 1
                              ? 'border-b-2 border-orange-500 text-orange-700'
                              : 'text-gray-600 hover:text-orange-700'
                              }`}
                           onClick={() => setActiveTab(1)}
                        >
                           Thông Tin Chi Tiết
                        </li>
                        <li
                           className={`mr-8 py-4 cursor-pointer font-medium text-base transition-colors ${activeTab === 2
                              ? 'border-b-2 border-orange-500 text-orange-700'
                              : 'text-gray-600 hover:text-orange-700'
                              }`}
                           onClick={() => setActiveTab(2)}
                        >
                           Đánh Giá từ Khách Hàng
                        </li>
                     </ul>
                  </div>
               </div>

               <div className='p-6'>
                  {activeTab === 0 && (
                     <div>
                        <p className='mb-6 text-gray-700 leading-relaxed'>
                           {product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
                        </p>
                     </div>
                  )}

                  {activeTab === 1 && (
                     <div className='bg-white'>
                        <table className='w-full border-collapse'>
                           <tbody>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium w-1/3'>Thương hiệu</td>
                                 <td className='py-3'>CandleBliss</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Xuất xứ</td>
                                 <td className='py-3'>Việt Nam</td>
                              </tr>

                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Kích thước</td>
                                 <td className='py-3'>{selectedDetail?.size || 'N/A'}</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>{selectedDetail?.type}</td>
                                 <td className='py-3'>
                                    {selectedDetail?.values || 'Không có thông tin'}
                                 </td>
                              </tr>
                              <tr>
                                 <td className='py-3 font-medium'>Hướng dẫn sử dụng</td>
                                 <td className='py-3'>
                                    Thắp nến trong không gian thoáng mát, tránh xa vật dễ cháy
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  )}

                  {activeTab === 2 && (
                     <div>
                        {loadingRatings ? (
                           <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                              <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
                           </div>
                        ) : productRatings && productRatings.length > 0 ? (
                           <div className="space-y-6">
                              {/* Thống kê đánh giá */}
                              <div className="flex items-center justify-between border-b pb-4">
                                 <div>
                                    <h3 className="text-lg font-medium">Đánh giá từ khách hàng</h3>
                                    <p className="text-gray-500 text-sm">{productRatings.length} đánh giá</p>
                                 </div>
                                 <div className="flex items-center">
                                    <div className="flex mr-2">
                                       {Array(5).fill(0).map((_, i) => (
                                          <svg
                                             key={i}
                                             xmlns="http://www.w3.org/2000/svg"
                                             className={`h-5 w-5 ${i < Math.round(productRatings.reduce((sum, rating) => sum + rating.rating, 0) / productRatings.length) ? 'text-yellow-400' : 'text-gray-300'}`}
                                             viewBox="0 0 20 20"
                                             fill="currentColor"
                                          >
                                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                       ))}
                                    </div>
                                    <span className="font-medium">
                                       {(productRatings.reduce((sum, rating) => sum + rating.rating, 0) / productRatings.length).toFixed(1)}
                                       /5
                                    </span>
                                 </div>
                              </div>

                              {/* Phân tích theo số sao */}
                              <div className="mt-4 mb-6">
                                 {[5, 4, 3, 2, 1].map(star => {
                                    const count = productRatings.filter(r => r.rating === star).length;
                                    const percentage = Math.round((count / productRatings.length) * 100);

                                    return (
                                       <div key={star} className="flex items-center mb-1">
                                          <div className="w-12 text-sm">{star} sao</div>
                                          <div className="flex-1 mx-3">
                                             <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div
                                                   className="bg-yellow-400 h-full rounded-full"
                                                   style={{ width: `${percentage}%` }}
                                                ></div>
                                             </div>
                                          </div>
                                          <div className="w-12 text-sm text-right">{count}</div>
                                       </div>
                                    );
                                 })}
                              </div>

                              {/* Danh sách đánh giá */}
                              <div className="space-y-6">
                                 {productRatings.map((rating) => (
                                    <div key={rating.id} className="border-b pb-4 last:border-0">
                                       <div className="flex items-start">
                                          <div className="mr-4">
                                             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                                {rating.avatar ? (
                                                   <Image
                                                      src={rating.avatar}
                                                      alt={rating.user_name || 'User'}
                                                      width={40}
                                                      height={40}
                                                      className="rounded-full"
                                                   />
                                                ) : (
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                   </svg>
                                                )}
                                             </div>
                                          </div>
                                          <div className="flex-1">
                                             <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium">{rating.user_name || `Khách hàng ${rating.user_id}`}</h4>
                                                <span className="text-xs text-gray-500">
                                                   {rating.created_at ? new Date(rating.created_at).toLocaleDateString('vi-VN') : 'Không có ngày'}
                                                </span>
                                             </div>
                                             <StarDisplay rating={rating.rating} />
                                             <p className="mt-2 text-gray-700">{rating.comment || 'Không có bình luận'}</p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-8 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                              <p className="mt-2">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* Related Products */}
            <ViewedCarousel />
         </div>

         {/* Footer */}
         <Footer />

         {showCartNotification && (
            <div className='fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 animate-fade-in-out'>
               <div className='flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                     <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                     />
                  </svg>
                  <span>Đã thêm sản phẩm vào giỏ hàng!</span>
               </div>
            </div>
         )}
      </div>
   );
}
