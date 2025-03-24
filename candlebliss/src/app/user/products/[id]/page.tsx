'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ViewedCarousel from '@/app/components/user/viewedcarousel/page';

// Interfaces
interface ProductImage {
   id: string;
   path: string;
   public_id: string;
}

interface ProductDetail {
   id: number;
   size: string;
   type: string;
   quantities: number;
   images: ProductImage[];
   isActive: boolean;
   productId?: number;
}

interface Price {
   id: number;
   base_price: number;
   discount_price: number | null;
   start_date: string;
   end_date: string;
   product_detail: ProductDetail;
}

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage[] | ProductImage;
   details?: ProductDetail[];
}

// Format price helper function
const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
   }).format(price);
};

// Calculate discount percentage
const calculateDiscountPercentage = (basePrice: number, discountPrice: number) => {
   if (!discountPrice || basePrice <= 0) return 0;
   return Math.round(((basePrice - discountPrice) / basePrice) * 100);
};

export default function ProductDetailPage() {
   const params = useParams();
   const router = useRouter();
   const productId = params.id;

   // States
   const [quantity, setQuantity] = useState(1);
   const [activeTab, setActiveTab] = useState(0);
   const [activeThumbnail, setActiveThumbnail] = useState(0);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [product, setProduct] = useState<Product | null>(null);
   const [selectedSize, setSelectedSize] = useState<string>('');
   const [selectedType, setSelectedType] = useState<string>('');
   const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
   const [detailPrices, setDetailPrices] = useState<Record<number, { base_price: number, discount_price: number | null }>>({});
   const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
   const [showCartNotification, setShowCartNotification] = useState(false);

   // Fetch product detail
   useEffect(() => {
      const fetchProductDetail = async () => {
         try {
            setLoading(true);

            // Validate product ID
            if (!productId) {
               setError("ID sản phẩm không hợp lệ");
               setLoading(false);
               return;
            }

            console.log("Đang lấy thông tin sản phẩm với ID:", productId);

            // Fetch product info directly with ID
            try {
               // Trường hợp: productId là ID số
               const productResponse = await fetch(`http://localhost:3000/api/products/${productId}`);

               if (!productResponse.ok) {
                  setError(`Không tìm thấy sản phẩm có ID ${productId}`);
                  setLoading(false);
                  return;
               }

               const productData: Product = await productResponse.json();
               console.log("Dữ liệu sản phẩm:", productData);

               // Xử lý dữ liệu sản phẩm
               processProductData(productData);
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
   }, [productId]);

   // Hàm xử lý dữ liệu sản phẩm
   const processProductData = (productData: Product) => {
      try {
         console.log("Đang xử lý dữ liệu sản phẩm:", productData);

         // Normalize product images
         const normalizedImages = Array.isArray(productData.images)
            ? productData.images
            : productData.images ? [productData.images] : [];

         // Log thông tin ảnh
         console.log("Ảnh sản phẩm sau khi chuẩn hóa:", normalizedImages.length, "ảnh");

         // Update product with normalized images
         const updatedProduct = {
            ...productData,
            images: normalizedImages
         };

         setProduct(updatedProduct);

         // Xử lý chi tiết sản phẩm
         if (productData.details && productData.details.length > 0) {
            console.log("Sản phẩm có", productData.details.length, "chi tiết");
            setProductDetails(productData.details);

            // Set default selected detail
            const activeDetails = productData.details.filter(detail => detail.isActive);
            if (activeDetails.length > 0) {
               const firstActiveDetail = activeDetails[0];
               console.log("Chi tiết mặc định:", firstActiveDetail);
               setSelectedDetailId(firstActiveDetail.id);
               setSelectedSize(firstActiveDetail.size);
               setSelectedType(firstActiveDetail.type);
            }

            // Fetch prices for all details
            fetchDetailPrices(productData.details);
         } else {
            console.log("Sản phẩm không có chi tiết, tạo chi tiết mặc định");
            // Xử lý trường hợp không có chi tiết
            const defaultDetail = {
               id: 0,
               size: 'Standard',
               type: 'Default',
               quantities: 100,
               images: [],
               isActive: true,
               productId: productData.id
            };

            setProductDetails([defaultDetail]);
            setSelectedDetailId(0);
            setSelectedSize('Standard');
            setSelectedType('Default');

            // Tạo giá mặc định
            setDetailPrices({
               0: {
                  base_price: 0,
                  discount_price: null
               }
            });
         }

         setLoading(false);
      } catch (error) {
         console.error("Lỗi khi xử lý dữ liệu sản phẩm:", error);
         setError("Lỗi khi xử lý dữ liệu sản phẩm");
         setLoading(false);
      }
   };

   // Xử lý khi không có ảnh trong product
   useEffect(() => {
      if (product && (!Array.isArray(product.images) || product.images.length === 0)) {
         setProduct(prev => {
            if (!prev) return null;
            return {
               ...prev,
               images: [{
                  id: '0',
                  path: '/images/placeholder.jpg',
                  public_id: 'placeholder'
               }]
            };
         });
      }
   }, [product]);

   // Cải thiện xử lý khi không có chi tiết sản phẩm
   useEffect(() => {
      if (product && (!productDetails || productDetails.length === 0)) {
         // Nếu không có chi tiết sản phẩm, tạo một chi tiết mặc định
         const defaultDetail = {
            id: 0,
            size: 'Standard',
            type: 'Default',
            quantities: 100,
            images: [],
            isActive: true,
            productId: product.id
         };

         setProductDetails([defaultDetail]);
         setSelectedDetailId(0);
         setSelectedSize('Standard');
         setSelectedType('Default');

         // Tạo giá mặc định
         setDetailPrices({
            0: {
               base_price: 0,
               discount_price: null
            }
         });
      }
   }, [product, productDetails]);

   // Fetch prices for product details
   const fetchDetailPrices = async (details: ProductDetail[]) => {
      try {
         // Tạo map để lưu giá chi tiết sản phẩm
         const pricesMap: Record<number, { base_price: number, discount_price: number | null }> = {};

         // Fetch giá cho từng chi tiết sản phẩm
         for (const detail of details) {
            if (detail && typeof detail.id === 'number') {
               try {
                  // Sử dụng API endpoint mới để lấy giá theo detailId
                  const priceResponse = await fetch(`http://localhost:3000/api/v1/prices/product-detail/${detail.id}`, {
                     headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
                     }
                  });

                  if (priceResponse.ok) {
                     const priceData = await priceResponse.json();
                     console.log(`Giá cho chi tiết ${detail.id}:`, priceData);

                     if (Array.isArray(priceData) && priceData.length > 0) {
                        // Sắp xếp theo giá cơ bản (nếu có nhiều giá)
                        priceData.sort((a, b) => {
                           const aPrice = Number(a.base_price);
                           const bPrice = Number(b.base_price);
                           if (isNaN(aPrice) || isNaN(bPrice)) return 0;
                           return aPrice - bPrice;
                        });

                        // Lấy giá thấp nhất
                        const priceInfo = priceData[0];

                        // Lưu thông tin giá
                        pricesMap[detail.id] = {
                           base_price: Number(priceInfo.base_price) || 0,
                           discount_price: priceInfo.discount_price ? Number(priceInfo.discount_price) : null
                        };
                     } else {
                        // Không có giá, đặt giá mặc định
                        pricesMap[detail.id] = {
                           base_price: 0,
                           discount_price: null
                        };
                     }
                  } else {
                     console.warn(`Không thể lấy giá cho chi tiết ${detail.id}, sử dụng giá mặc định`);
                     pricesMap[detail.id] = {
                        base_price: 0,
                        discount_price: null
                     };
                  }
               } catch (error) {
                  console.error(`Lỗi khi lấy giá cho chi tiết ${detail.id}:`, error);
                  pricesMap[detail.id] = {
                     base_price: 0,
                     discount_price: null
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

   // Update selected detail when size or type changes
   useEffect(() => {
      if (productDetails.length > 0) {
         // Find detail matching selected size and type
         const matchingDetail = productDetails.find(
            detail => detail.size === selectedSize && detail.type === selectedType && detail.isActive
         );

         if (matchingDetail) {
            setSelectedDetailId(matchingDetail.id);
         } else {
            // If no exact match, find closest match with same size
            const sameSize = productDetails.find(
               detail => detail.size === selectedSize && detail.isActive
            );

            if (sameSize) {
               setSelectedDetailId(sameSize.id);
               setSelectedType(sameSize.type);
            } else {
               // Still no match, just pick the first active detail
               const firstActive = productDetails.find(detail => detail.isActive);
               if (firstActive) {
                  setSelectedDetailId(firstActive.id);
                  setSelectedSize(firstActive.size);
                  setSelectedType(firstActive.type);
               }
            }
         }
      }
   }, [selectedSize, selectedType, productDetails]);

   // Get selected detail object
   const selectedDetail = selectedDetailId
      ? productDetails.find(detail => detail.id === selectedDetailId)
      : null;

   // Get price info for selected detail
   const selectedPriceInfo = selectedDetailId && detailPrices[selectedDetailId]
      ? detailPrices[selectedDetailId]
      : { base_price: 0, discount_price: null };

   // Get unique sizes and types for filtering
   const availableSizes = [...new Set(
      productDetails
         .filter(detail => detail.isActive)
         .map(detail => detail.size)
   )];

   const availableTypes = [...new Set(
      productDetails
         .filter(detail => detail.isActive && detail.size === selectedSize)
         .map(detail => detail.type)
   )];

   // Handle quantity changes
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

   // Handle add to cart
   const handleAddToCart = () => {
      if (!product || !selectedDetail) return;

      // Đảm bảo giá là number hợp lệ
      let price = selectedPriceInfo.discount_price || selectedPriceInfo.base_price;
      if (isNaN(price)) {
         price = 0;
         console.warn("Invalid price detected, using 0 as default");
      }

      // Tạo đối tượng cartItem phù hợp với cấu trúc giỏ hàng
      const cartItem = {
         id: product.id, // Sử dụng id sản phẩm
         detailId: selectedDetail.id, // Lưu detail ID để sau này có thể chọn đúng variant
         name: product.name,
         price: price,
         quantity: quantity,
         image: selectedDetail.images && selectedDetail.images.length > 0
            ? selectedDetail.images[0].path
            : Array.isArray(product.images) && product.images.length > 0
               ? product.images[0].path
               : '/images/placeholder.jpg',
         type: `Mùi hương: ${selectedDetail.type}`,
         options: [
            { name: 'Kích thước', value: selectedDetail.size },
            { name: 'Loại', value: selectedDetail.type }
         ]
      };

      console.log('Add to cart:', cartItem);

      // Cập nhật localStorage
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

      // Kiểm tra xem item đã tồn tại trong giỏ hàng chưa
      const existingItemIndex = cartItems.findIndex(
         (item: any) => item.id === cartItem.id && item.detailId === cartItem.detailId
      );

      if (existingItemIndex >= 0) {
         // Nếu sản phẩm đã tồn tại, chỉ cập nhật số lượng
         cartItems[existingItemIndex].quantity += cartItem.quantity;
      } else {
         // Thêm mới vào giỏ hàng
         cartItems.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Hiển thị thông báo
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
   };

   // Handle buy now
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
                  <div className='relative bg-white mb-4 h-96 rounded-lg shadow-sm'>
                     <Image
                        src={
                           Array.isArray(product.images) && product.images.length > 0 && activeThumbnail < product.images.length
                              ? product.images[activeThumbnail]?.path || '/images/placeholder.jpg'
                              : '/images/placeholder.jpg'
                        }
                        alt={product.name}
                        layout='fill'
                        objectFit='contain'
                        className='p-4'
                     />
                  </div>
                  <div className='flex -mx-2'>
                     {Array.isArray(product.images) && product.images.map((img, index: number) => (
                        <div
                           key={index}
                           className={`px-2 w-1/5 cursor-pointer ${activeThumbnail === index ? 'ring-2 ring-orange-500' : ''
                              }`}
                           onClick={() => setActiveThumbnail(index)}
                        >
                           <div className='relative bg-white h-16 rounded'>
                              <Image
                                 src={img.path || '/images/placeholder.jpg'}
                                 alt={`${product.name} thumbnail ${index + 1}`}
                                 layout='fill'
                                 objectFit='contain'
                                 className='p-1'
                              />
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
                           <span className={selectedDetail?.isActive && selectedDetail?.quantities > 0 ? 'text-green-600' : 'text-red-600'}>
                              {selectedDetail?.isActive && selectedDetail?.quantities > 0 ? 'Còn hàng' : 'Hết hàng'}
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
                           {selectedPriceInfo.discount_price ? (
                              <>
                                 <span className='text-red-600 text-2xl font-medium'>
                                    {formatPrice(selectedPriceInfo.discount_price)}
                                 </span>
                                 <span className='ml-2 text-gray-500 line-through'>
                                    {formatPrice(selectedPriceInfo.base_price)}
                                 </span>
                                 <div className='bg-red-600 text-white text-xs px-2 py-1 rounded ml-2'>
                                    Giảm {calculateDiscountPercentage(
                                       selectedPriceInfo.base_price,
                                       selectedPriceInfo.discount_price
                                    )}%
                                 </div>
                              </>
                           ) : (
                              <span className='text-red-600 text-2xl font-medium'>
                                 {formatPrice(selectedPriceInfo.base_price)}
                              </span>
                           )}
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
                                       onChange={() => setSelectedSize(size)}
                                    />
                                    <span>{size}</span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Fragrance/Type Field */}
                     {availableTypes.length > 0 && (
                        <div className='flex items-center mb-4'>
                           <span className='text-gray-700 w-24 font-medium'>Mùi hương:</span>
                           <div className='flex flex-wrap gap-2'>
                              {availableTypes.map((type) => (
                                 <label
                                    key={type}
                                    className={`flex items-center border ${selectedType === type
                                       ? 'border-orange-500 bg-orange-50'
                                       : 'border-gray-300'
                                       } rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50`}
                                 >
                                    <input
                                       type='radio'
                                       name='fragrance'
                                       className='mr-1.5'
                                       checked={selectedType === type}
                                       onChange={() => setSelectedType(type)}
                                    />
                                    <span>{type}</span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Quantity */}
                     <div className='flex items-center mb-4'>
                        <span className='text-gray-700 w-24 font-medium'>Số lượng:</span>
                        <div className='flex shadow-sm'>
                           <button
                              className='border border-gray-300 px-3 py-1 rounded-l hover:bg-gray-100'
                              onClick={decreaseQuantity}
                              disabled={!selectedDetail?.isActive || selectedDetail?.quantities <= 0}
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
                              disabled={!selectedDetail?.isActive || selectedDetail?.quantities <= 0}
                           >
                              +
                           </button>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className='grid grid-cols-2 gap-3 mb-4'>
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
                           className='flex justify-center items-center bg-white border border-gray-300 py-2.5 text-sm text-gray-700 rounded hover:bg-gray-50 transition'
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
                                 d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                              />
                           </svg>
                           <span>Thêm vào yêu thích</span>
                        </button>
                     </div>

                     <div className='grid grid-cols-1 gap-3 mb-2'>
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
                                 <td className='py-3 font-medium'>Loại</td>
                                 <td className='py-3'>{selectedDetail?.type || 'N/A'}</td>
                              </tr>
                              <tr className='border-b'>
                                 <td className='py-3 font-medium'>Kích thước</td>
                                 <td className='py-3'>{selectedDetail?.size || 'N/A'}</td>
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
                        <div className='text-center py-8 text-gray-500'>
                           Chưa có đánh giá nào cho sản phẩm này.
                        </div>
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
            <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50 animate-fade-in-out">
               <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Đã thêm sản phẩm vào giỏ hàng!</span>
               </div>
            </div>
         )}
      </div>
   );
}
