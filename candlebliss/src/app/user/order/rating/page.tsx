'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import Toast from '@/app/components/ui/toast/Toast';
import AuthService from '@/app/utils/authService';
import { HOST } from '@/app/constants/api';

// Interface for order item
interface OrderItem {
   id: number;
   status: string;
   unit_price: string;
   product_detail_id: number;
   quantity: number;
   totalPrice: string;
   // Removed duplicate 'product_id' declaration
   product?: {
      id: number;
      name: string;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
   product_detail?: {
      id: number;
      size: string;
      type: string;
      values: string;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
   productDetailData?: {
      id: number;
      size: string;
      type: string;
      values: string;
      images: Array<{
         id: string;
         path: string;
         public_id: string;
      }>;
   };
   rating?: number;
   review?: string;
   product_id?: number;
}

// Interface for order
interface Order {
   id: number;
   order_code: string;
   user_id: number;
   status: string;
   address: string;
   total_quantity: number;
   total_price: string;
   discount: string;
   ship_price: string;
   method_payment: string;
   createdAt: string;
   updatedAt: string;
   item: OrderItem[];
   __entity: string;
   rating?: number | null;
}

// Add Rating interface to match the API structure
interface Rating {
   id?: number;
   product_id: number | null;
   order_id: number;
   user_id: number;
   comment: string;
   rating: number;
   avg_rating?: number;
}

// Format price helper function
const formatPrice = (price: string | number): string => {
   const numPrice = typeof price === 'string' ? parseFloat(price) : price;
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
   }).format(numPrice);
};

// Format date helper function
const formatDate = (dateString: string): string => {
   const date = new Date(dateString);
   return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
};

// Create a wrapper component that will be the default export
export default function OrderRatingPage() {
   return (
      <Suspense fallback={<LoadingUI />}>
         <OrderRatingContent />
      </Suspense>
   );
}

// Loading UI component extracted for reuse
function LoadingUI() {
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

// Add a helper function to process product images in different formats
const processProductImages = (
   images:
      | Array<{ id: string; path: string; public_id: string }>
      | { id: string; path: string; public_id: string }
      | null
      | undefined,
) => {
   if (!images) return [];

   // If images is an array
   if (Array.isArray(images)) {
      return images;
   }

   // If images is a single object
   if (typeof images === 'object' && images.path) {
      return [images];
   }

   return [];
};

// Main component content moved here
function OrderRatingContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const orderId = searchParams.get('orderId');

   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [ratings, setRatings] = useState<Record<number, number>>({});
   const [reviews, setReviews] = useState<Record<number, string>>({});
   const [toast, setToast] = useState({
      show: false,
      message: '',
      type: 'info' as 'success' | 'error' | 'info',
   });
   const [userId, setUserId] = useState<number | null>(null);
   const [fetchedProducts, setFetchedProducts] = useState<Record<string, boolean>>({});
   const [userRatedProducts, setUserRatedProducts] = useState<Record<number, boolean>>({});
   const [userRatings, setUserRatings] = useState<Rating[]>([]);

   // Toast message function
   const showToastMessage = useCallback((message: string, type: 'success' | 'error' | 'info') => {
      setToast({
         show: true,
         message,
         type,
      });

      setTimeout(() => {
         setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
   }, []);

   // Fetch completed orders for the user
   const fetchProductDetails = useCallback(
      async (order: Order) => {
         try {
            const token = AuthService.getToken();
            if (!token) return;

            let hasUpdates = false;
            const updatedOrderItems = [...order.item];

            for (const item of updatedOrderItems) {
               console.log(
                  `Processing item with product_id: ${item.product_id}, product_detail_id: ${item.product_detail_id}`,
               );

               // First try to fetch product directly using product_id
               if (item.product_id && !fetchedProducts[item.product_id]) {
                  try {
                     console.log(`Fetching product with ID: ${item.product_id}`);
                     const productResponse = await fetch(
                        `${HOST}/api/products/${item.product_id}`,
                        {
                           headers: {
                              Authorization: `Bearer ${token}`,
                           },
                        },
                     );

                     if (productResponse.ok) {
                        const productData = await productResponse.json();
                        console.log(`Product data fetched:`, productData);

                        // Set the product information, handle both array and object formats for images
                        item.product = {
                           id: productData.id,
                           name: productData.name || 'Sản phẩm không tên',
                           images: processProductImages(productData.images),
                        };

                        // Mark product as fetched
                        setFetchedProducts((prev) => ({
                           ...prev,
                           [item.product_id!]: true,
                        }));

                        hasUpdates = true;
                     } else {
                        console.error(
                           `Error fetching product ${item.product_id}, status: ${productResponse.status}`,
                        );
                     }
                  } catch (productError) {
                     console.error(
                        `Failed to fetch product for product_id ${item.product_id}:`,
                        productError,
                     );
                  }
               }
            }

            // Update order with fetched data if any updates were made
            if (hasUpdates) {
               const updatedOrder = { ...order, item: updatedOrderItems };
               setSelectedOrder(updatedOrder);

               // Initialize ratings and reviews after fetching product details
               const initialRatings: Record<number, number> = {};
               const initialReviews: Record<number, string> = {};

               updatedOrderItems.forEach((item) => {
                  const key = item.product?.id || item.id;
                  initialRatings[key] = 5;
                  initialReviews[key] = '';
               });

               setRatings(initialRatings);
               setReviews(initialReviews);
            }

            // Check for saved drafts after setting initial ratings
            const draftUpdates = {
               ratings: { ...ratings },
               reviews: { ...reviews },
            };

            let hasDrafts = false;

            order.item.forEach((item) => {
               if (item.product?.id) {
                  // Check for previous saved drafts
                  const draft = getRatingDraft(order.id, item.product.id);
                  if (draft) {
                     hasDrafts = true;
                     draftUpdates.ratings[item.product.id] = draft.rating;
                     draftUpdates.reviews[item.product.id] = draft.review;
                  }
               }
            });

            // Only update state once with all changes
            if (hasDrafts) {
               setRatings(draftUpdates.ratings);
               setReviews(draftUpdates.reviews);
            }
         } catch (error) {
            console.error('Error fetching product details:', error);
         }
      },
      [fetchedProducts],
   );

   const fetchOrderDetails = useCallback(
      async (id: number) => {
         try {
            setLoading(true);
            const token = AuthService.getToken();
            if (!token) {
               showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
               router.push('/user/signin');
               return;
            }

            const response = await fetch(`${HOST}/api/orders/${id}?id=${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               throw new Error('Không thể tải thông tin đơn hàng');
            }

            const orderData: Order = await response.json();
            setSelectedOrder(orderData);

            // Fetch product details for all items
            await fetchProductDetails(orderData);

            // Extract product IDs to fetch ratings
            const productIds = orderData.item
               .filter((item) => item.product?.id)
               .map((item) => item.product!.id);

            // Fetch existing ratings for these products
            if (productIds.length > 0) {
               await fetchExistingRatings(productIds);
            } else {
               // Initialize with default values if no productIds
               const initialRatings: Record<number, number> = {};
               const initialReviews: Record<number, string> = {};

               orderData.item.forEach((item) => {
                  // Use item ID as key for now if no product ID
                  const key = item.product?.id || item.id;
                  initialRatings[key] = 5;
                  initialReviews[key] = '';
               });

               setRatings(initialRatings);
               setReviews(initialReviews);
            }

            orderData.item.forEach((item) => {
               if (item.product?.id) {
                  // Check for previous saved drafts
                  const draft = getRatingDraft(orderData.id, item.product.id);
                  if (draft) {
                     // Update the existing ratings/reviews rather than reinitializing
                     setRatings((prev) => ({
                        ...prev,
                        ...(item.product?.id !== undefined
                           ? { [item.product.id]: draft.rating }
                           : {}),
                     }));
                     setReviews((prev) => ({
                        ...prev,
                        ...(item.product?.id !== undefined
                           ? { [item.product.id]: draft.review }
                           : {}),
                     }));
                  }
               }
            });
         } catch (error) {
            console.error('Error fetching order details:', error);
            showToastMessage('Không thể tải thông tin đơn hàng', 'error');
         } finally {
            setLoading(false);
         }
      },
      [router, showToastMessage, fetchProductDetails],
   );

   // Cập nhật hàm fetchCompletedOrders để bao gồm việc kiểm tra trạng thái đánh giá
   const fetchCompletedOrders = useCallback(async () => {
      try {
         setLoading(true);
         const userIdStr = localStorage.getItem('userId');
         if (!userIdStr) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         const uid = parseInt(userIdStr);
         setUserId(uid);

         const token = AuthService.getToken();
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         // We'll skip trying to fetch user rating history since we don't have that API

         // Get all completed orders of the user
         const response = await fetch(`${HOST}/api/orders?user_id=${uid}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng');
         }

         const data = await response.json();
         console.log('Fetched orders:', data);

         // Lọc để chỉ lấy các đơn hàng có status "Hoàn thành"
         const completedOrdersData = Array.isArray(data)
            ? data.filter((order) => order.status === 'Hoàn thành')
            : data.status === 'Hoàn thành'
            ? [data]
            : [];

         // Filter orders based on their completion date and whether they have ratings
         const filteredCompletedOrders = completedOrdersData.filter((order) => {
            // Check if any item in the order already has a rating
            const hasRating = order.item.some(
               (item: { rating: undefined }) => item.rating !== undefined,
            );

            // Check if order was completed within the last 3 days
            const completionDate = new Date(order.updatedAt);
            const currentDate = new Date();
            const daysDiff = Math.floor(
               (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            // Show orders that either have ratings or were completed within 3 days
            return hasRating || daysDiff <= 3;
         });

         console.log('Filtered completed orders:', filteredCompletedOrders);
         setCompletedOrders(filteredCompletedOrders);

         // Initialize userRatedProducts based on order items with ratings
         const ratedProducts: Record<number, boolean> = {};
         filteredCompletedOrders.forEach((order) => {
            order.item.forEach((item: { product: { id: string | number }; rating: undefined }) => {
               if (item.product?.id && item.rating !== undefined) {
                  if (typeof item.product.id === 'number') {
                     ratedProducts[item.product.id] = true;
                  }
               }
            });
         });
         setUserRatedProducts(ratedProducts);

         // If there's an orderId in the URL, fetch its details
         if (orderId) {
            fetchOrderDetails(parseInt(orderId));
         }
      } catch (error) {
         console.error('Error fetching orders:', error);
         showToastMessage('Không thể tải danh sách đơn hàng', 'error');
      } finally {
         setLoading(false);
      }
   }, [router, showToastMessage, orderId, fetchOrderDetails]);

   // Thêm hàm kiểm tra có đánh giá nào được lưu trong localStorage cho đơn hàng
   const hasRatingInLocalStorage = (orderId: number) => {
      try {
         // First check the new structured storage
         const ratingsStorageKey = 'completed_ratings';
         const existingRatingsStr = localStorage.getItem(ratingsStorageKey);
         if (existingRatingsStr) {
            const existingRatings = JSON.parse(existingRatingsStr);
            // Check if any key starts with this orderId
            const orderPrefix = `${orderId}_`;
            for (const key in existingRatings) {
               if (key.startsWith(orderPrefix)) {
                  return true;
               }
            }
         }

         // Then check the old method for backward compatibility
         const userIdStr = localStorage.getItem('userId');
         if (!userIdStr) return false;

         // Check all keys in localStorage
         for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Check rating_draft keys
            if (key && key.startsWith(`rating_draft_${orderId}_`)) {
               return true;
            }
         }

         // Check in rated_products
         const ratedProductsStr = localStorage.getItem('rated_products');
         if (ratedProductsStr) {
            const ratedProducts = JSON.parse(ratedProductsStr);
            for (const key in ratedProducts) {
               if (key.includes(`_${orderId}_`)) {
                  return true;
               }
            }
         }

         return false;
      } catch (error) {
         console.error('Error checking localStorage for ratings:', error);
         return false;
      }
   };

   // Fetch existing ratings for an order
   // Removed duplicate declaration of getCurrentUser

   const fetchExistingRatings = useCallback(
      async (productIds: number[]) => {
         try {
            const token = AuthService.getToken();
            const userData = await getCurrentUser();

            if (!token || !userData || !userData.id) return;

            const uid = userData.id;

            // First check user's own ratings
            const userRatingsResponse = await fetch(`${HOST}/api/rating/user/${uid}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (userRatingsResponse.ok) {
               const userRatings = await userRatingsResponse.json();
               console.log("User's existing ratings:", userRatings);

               // Track which products the user has already rated
               const ratedProducts: Record<number, boolean> = {};
               userRatings.forEach((rating: { product_id?: number }) => {
                  if (rating.product_id) {
                     ratedProducts[rating.product_id] = true;
                  }
               });
               setUserRatedProducts(ratedProducts);
            }

            // Then get all ratings for the products
            const response = await fetch(`${HOST}/api/rating/get-by-product`, {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(productIds.map((id) => ({ product_id: id }))),
            });

            if (!response.ok) {
               throw new Error('Failed to fetch ratings');
            }

            const ratingsData: Rating[] = await response.json();

            // Initialize ratings state with existing ratings
            const initialRatings: Record<number, number> = {};
            const initialReviews: Record<number, string> = {};

            ratingsData.forEach((rating) => {
               if (rating.product_id) {
                  // Only use ratings from other users for display,
                  // user's own ratings are already in userRatedProducts
                  if (!userRatedProducts[rating.product_id]) {
                     initialRatings[rating.product_id] = rating.rating || 5;
                     initialReviews[rating.product_id] = rating.comment || '';
                  }
               }
            });

            setRatings(initialRatings);
            setReviews(initialReviews);
         } catch (error) {
            console.error('Error fetching ratings:', error);
         }
      },
      [userId],
   );

   // Add this function after other fetch functions
   const getCurrentUser = useCallback(async () => {
      try {
         const token = AuthService.getToken();
         if (!token) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return null;
         }

         const response = await fetch(`${HOST}/api/v1/auth/me`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });

         if (!response.ok) {
            throw new Error('Không thể lấy thông tin người dùng');
         }

         const userData = await response.json();
         console.log('User data from API:', userData);

         // Validate user ID
         if (!userData || !userData.id) {
            console.error('Invalid user data structure:', userData);
            return null;
         }

         console.log('Setting user ID to:', userData.id);
         setUserId(userData.id);
         return userData;
      } catch (error) {
         console.error('Error fetching user data:', error);
         return null;
      }
   }, [router, showToastMessage]);

   // Then modify your useEffect
   useEffect(() => {
      // Get current user first, then fetch ratings, then fetch orders
      getCurrentUser().then(() => {
         fetchCompletedOrders();
      });
   }, [getCurrentUser, fetchCompletedOrders]);

   // Handle star rating change
   const handleRatingChange = (itemId: number, rating: number) => {
      setRatings((prev) => ({
         ...prev,
         [itemId]: rating,
      }));

      // Lưu nháp đánh giá
      if (selectedOrder) {
         const item = selectedOrder.item.find((i) => i.product?.id === itemId || i.id === itemId);
         if (item && item.product?.id) {
            saveRatingDraft(selectedOrder.id, item.product.id, rating, reviews[itemId] || '');
         }
      }
   };

   // Handle review text change
   const handleReviewChange = (itemId: number, text: string) => {
      setReviews((prev) => ({
         ...prev,
         [itemId]: text,
      }));

      // Lưu nháp nhận xét
      if (selectedOrder) {
         const item = selectedOrder.item.find((i) => i.product?.id === itemId || i.id === itemId);
         if (item && item.product?.id) {
            saveRatingDraft(selectedOrder.id, item.product.id, ratings[itemId] || 5, text);
         }
      }
   };

   // Thêm localStorage để lưu dữ liệu đã nhập
   const saveRatingDraft = useCallback(
      (orderId: number, productId: number, rating: number, review: string) => {
         try {
            const key = `rating_draft_${orderId}_${productId}`;
            const data = { rating, review, timestamp: new Date().getTime() };
            localStorage.setItem(key, JSON.stringify(data));
         } catch (error) {
            console.error('Error saving rating draft:', error);
         }
      },
      [],
   );

   // Lấy dữ liệu nháp từ localStorage
   const getRatingDraft = useCallback((orderId: number, productId: number) => {
      try {
         const key = `rating_draft_${orderId}_${productId}`;
         const savedData = localStorage.getItem(key);
         if (savedData) {
            const data = JSON.parse(savedData);
            // Chỉ sử dụng dữ liệu nháp trong vòng 7 ngày
            const isValid = new Date().getTime() - data.timestamp < 7 * 24 * 60 * 60 * 1000;
            if (isValid) {
               return { rating: data.rating, review: data.review };
            } else {
               localStorage.removeItem(key); // Xóa dữ liệu quá hạn
            }
         }
         return null;
      } catch (error) {
         console.error('Error retrieving rating draft:', error);
         return null;
      }
   }, []);

   // Add this function to store information about rated products
   const markProductAsRated = (orderId: number, productId: number) => {
      try {
         // Get existing rated products or initialize empty object
         const ratedProductsStr = localStorage.getItem('rated_products') || '{}';
         const ratedProducts = JSON.parse(ratedProductsStr);

         // Structure: { "userId_orderId_productId": timestamp }
         const userIdStr = localStorage.getItem('userId');
         const key = `${userIdStr}_${orderId}_${productId}`;
         ratedProducts[key] = new Date().getTime();

         // Save back to localStorage
         localStorage.setItem('rated_products', JSON.stringify(ratedProducts));
      } catch (error) {
         console.error('Error marking product as rated:', error);
      }
   };

   // Add this function to check if a product has been rated
   const hasUserRatedProduct = useCallback(
      (productId: number) => {
         // Check if product was rated in current session
         return userRatedProducts[productId] === true;
      },
      [userRatedProducts],
   );

   // Update submitRating function to handle "already rated" errors
   const submitRating = async (orderId: number, itemId: number) => {
      try {
         setSubmitting(true);

         const userData = await getCurrentUser();
         const token = AuthService.getToken();

         if (!token || !userData || !userData.id) {
            showToastMessage('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
            router.push('/user/signin');
            return;
         }

         const uid = userData.id;
         console.log('Authenticated User ID:', uid);

         const item = selectedOrder?.item.find((i) => i.id === itemId);
         if (!item || !item.product?.id) {
            showToastMessage('Không tìm thấy thông tin sản phẩm', 'error');
            return;
         }

         const productId = item.product.id;
         const rating = ratings[productId] || 5;
         const comment = reviews[productId] || '';

         // Log what we're sending
         const ratingData = {
            product_id: productId,
            order_id: orderId,
            user_id: uid,
            comment: comment,
            rating: rating,
         };

         console.log('Submitting rating data:', ratingData);

         // Try different format options to see which one works:
         let submitSuccess = false;

         // Option 1: Send as a single object (not in an array)
         try {
            const response = await fetch(`${HOST}/api/rating/upsert`, {
               method: 'POST',
               headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(ratingData), // Send as a single object
            });

            if (response.ok) {
               console.log('Single object format succeeded');
               const successResponse = await response.text();
               console.log('Success response:', successResponse);
               submitSuccess = true;
            } else {
               console.log('Single object format failed, trying array format...');
            }
         } catch (error) {
            console.error('Error with single object format:', error);
         }

         // If that fails, try with the array format
         if (!submitSuccess) {
            try {
               const arrayResponse = await fetch(`${HOST}/api/rating/upsert`, {
                  method: 'POST',
                  headers: {
                     Authorization: `Bearer ${token}`,
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify([ratingData]), // Send as array with one object
               });

               if (arrayResponse.ok) {
                  console.log('Array format succeeded');
                  const successResponse = await arrayResponse.text();
                  console.log('Success response:', successResponse);
                  submitSuccess = true;
               } else {
                  const errorText = await arrayResponse.text();
                  console.error('Rating submission error:', errorText);
                  throw new Error('Không thể gửi đánh giá');
               }
            } catch (error) {
               console.error('Error with array format:', error);
               throw error;
            }
         }

         if (submitSuccess) {
            // IMPORTANT: Store completed rating data in localStorage for persistence between sessions
            // This is the key addition that helps persist rating state between refreshes
            persistRatingToLocalStorage(orderId, productId, rating, comment);

            // Update UI to show rating was submitted
            setUserRatedProducts((prev) => ({
               ...prev,
               [productId]: true,
            }));

            // Add the new rating to our userRatings state
            setUserRatings((prev) => [...prev, ratingData]);

            showToastMessage('Đánh giá của bạn đã được gửi thành công', 'success');

            // Update UI
            if (selectedOrder) {
               const updatedItems = selectedOrder.item.map((i) =>
                  i.id === itemId ? { ...i, rating: rating, review: comment } : i,
               );

               setSelectedOrder({
                  ...selectedOrder,
                  item: updatedItems,
               });
            }

            // Redirect after success with a delay to show the success message
            setTimeout(() => {
               goBackToList();
            }, 2000);
         }
      } catch (error) {
         console.error('Error submitting rating:', error);
         showToastMessage('Không thể gửi đánh giá', 'error');
      } finally {
         setSubmitting(false);
      }
   };

   // Add a new function to persist rating data to localStorage in a structured way
   const persistRatingToLocalStorage = (
      orderId: number,
      productId: number,
      rating: number,
      comment: string,
   ) => {
      try {
         // Get existing ratings or initialize empty object
         const ratingsStorageKey = 'completed_ratings';
         const existingRatingsStr = localStorage.getItem(ratingsStorageKey) || '{}';
         const existingRatings = JSON.parse(existingRatingsStr);

         // Create a unique key for this order-product combination
         const ratingKey = `${orderId}_${productId}`;

         // Store rating information
         existingRatings[ratingKey] = {
            order_id: orderId,
            product_id: productId,
            rating: rating,
            comment: comment,
            timestamp: new Date().toISOString(),
         };

         // Save back to localStorage
         localStorage.setItem(ratingsStorageKey, JSON.stringify(existingRatings));

         // Also mark as rated in rated_products for backward compatibility
         markProductAsRated(orderId, productId);

         console.log('Rating persisted to localStorage');
      } catch (error) {
         console.error('Error persisting rating to localStorage:', error);
      }
   };

   useEffect(() => {
      // Initialize rated products from API data
      if (selectedOrder && userRatings.length > 0) {
         const initialRatedProducts: Record<number, boolean> = {};
         selectedOrder.item.forEach((item) => {
            if (item.product?.id) {
               initialRatedProducts[item.product.id] = hasUserRatedProduct(item.product.id);
            }
         });
         setUserRatedProducts(initialRatedProducts);
      }
   }, [selectedOrder, userRatings, hasUserRatedProduct]);

   // Khi quay lại, đổi view thành 'list' và xóa selectedOrder
   const goBackToList = () => {
      setSelectedOrder(null);
   };

   // Star rating component
   const StarRating = ({
      itemId,
      productId,
      value,
      onChange,
   }: {
      itemId: number;
      productId?: number;
      value: number;
      onChange: (id: number, rating: number) => void;
   }) => {
      // Use productId as the key if available, otherwise use itemId
      const id = productId || itemId;

      return (
         <div className='flex items-center'>
            {[1, 2, 3, 4, 5].map((star) => (
               <button
                  key={star}
                  type='button'
                  className='focus:outline-none'
                  onClick={() => onChange(id, star)}
               >
                  <svg
                     xmlns='http://www.w3.org/2000/svg'
                     className={`h-8 w-8 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                     fill='currentColor'
                     viewBox='0 0 24 24'
                  >
                     <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                     />
                  </svg>
               </button>
            ))}
         </div>
      );
   };

   // Thêm một hàm để kiểm tra xem đơn hàng đã được đánh giá chưa
   const isOrderRated = useCallback(
      (order: Order) => {
         // Method 1: Check API data - if the order item already has a rating from the server
         const hasExistingRating = order.item.some((item) => item.rating !== undefined);
         if (hasExistingRating) return true;

         // Method 2: Check session data - if user rated during this session
         const hasSessionRating = order.item.some(
            (item) => item.product?.id && userRatedProducts[item.product.id],
         );
         if (hasSessionRating) return true;

         // Method 3: Check localStorage for persistent storage between sessions
         return hasRatingInLocalStorage(order.id);
      },
      [userRatedProducts],
   );

   // Show order selection UI if no order is selected
   if (!loading && !selectedOrder && completedOrders.length > 0) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />

            <div className='container mx-auto px-4 pt-4 pb-2'>
               <nav className='flex' aria-label='Breadcrumb'>
                  <ol className='inline-flex items-center space-x-1 md:space-x-3'>
                     <li className='inline-flex items-center'>
                        <Link
                           href='/'
                           className='inline-flex items-center text-sm text-gray-700 hover:text-orange-600'
                        >
                           <svg
                              className='w-3 h-3 mr-2.5'
                              aria-hidden='true'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                           >
                              <path d='m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z' />
                           </svg>
                           Trang chủ
                        </Link>
                     </li>
                     <li>
                        <div className='flex items-center'>
                           <svg
                              className='w-3 h-3 text-gray-400 mx-1'
                              aria-hidden='true'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 6 10'
                           >
                              <path
                                 stroke='currentColor'
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='m1 9 4-4-4-4'
                              />
                           </svg>
                           <Link
                              href='/user/profile'
                              className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                           >
                              Tài khoản
                           </Link>
                        </div>
                     </li>
                     <li>
                        <div className='flex items-center'>
                           <svg
                              className='w-3 h-3 text-gray-400 mx-1'
                              aria-hidden='true'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 6 10'
                           >
                              <path
                                 stroke='currentColor'
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='m1 9 4-4-4-4'
                              />
                           </svg>
                           <Link
                              href='/user/order'
                              className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                           >
                              Đơn hàng của tôi
                           </Link>
                        </div>
                     </li>
                     <li aria-current='page'>
                        <div className='flex items-center'>
                           <svg
                              className='w-3 h-3 text-gray-400 mx-1'
                              aria-hidden='true'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 6 10'
                           >
                              <path
                                 stroke='currentColor'
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='m1 9 4-4-4-4'
                              />
                           </svg>
                           <span className='ml-1 text-sm font-medium text-orange-600 md:ml-2'>
                              Đánh giá sản phẩm
                           </span>
                        </div>
                     </li>
                     {selectedOrder && (
                        <li aria-current='page'>
                           <div className='flex items-center'>
                              <svg
                                 className='w-3 h-3 text-gray-400 mx-1'
                                 aria-hidden='true'
                                 xmlns='http://www.w3.org/2000/svg'
                                 fill='none'
                                 viewBox='0 0 6 10'
                              >
                                 <path
                                    stroke='currentColor'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='m1 9 4-4-4-4'
                                 />
                              </svg>
                              {/* <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">#{selectedOrder.order_code}</span> */}
                           </div>
                        </li>
                     )}
                  </ol>
               </nav>
            </div>

            <div className='fixed top-4 right-4 z-50'>
               <Toast
                  show={toast.show}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast((prev) => ({ ...prev, show: false }))}
               />
            </div>

            <div className='container mx-auto px-4 py-8'>
               <h1 className='text-2xl font-medium mb-6'>Đánh giá sản phẩm</h1>
               <p className='text-gray-600 mb-6'>Chọn một đơn hàng để đánh giá:</p>

               <div className='space-y-4'>
                  {completedOrders.map((order) => (
                     <div
                        key={order.id}
                        className='bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow'
                        onClick={() => fetchOrderDetails(order.id)}
                     >
                        <div className='p-4 border-b border-gray-100'>
                           <div className='flex justify-between items-center'>
                              <div>
                                 <p className='text-sm text-gray-500'>
                                    Mã đơn hàng:{' '}
                                    <span className='font-medium text-gray-800'>
                                       {order.order_code}
                                    </span>
                                 </p>
                                 <p className='text-sm text-gray-500'>
                                    Ngày đặt:{' '}
                                    <span className='font-medium text-gray-800'>
                                       {formatDate(order.createdAt)}
                                    </span>
                                 </p>
                              </div>
                              <div>
                                 <span className='px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-green-50 text-green-700 border border-green-200'>
                                    {order.status}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className='p-4 flex justify-between items-center'>
                           <div>
                              <p className='text-sm'>
                                 Tổng:{' '}
                                 <span className='font-medium text-orange-600'>
                                    {formatPrice(order.total_price)}
                                 </span>
                              </p>
                              <p className='text-sm text-gray-500'>
                                 {order.total_quantity} sản phẩm
                              </p>
                           </div>
                           <button
                              className={`px-4 py-2 rounded-md ${
                                 isOrderRated(order)
                                    ? 'bg-gray-400 text-white'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                              disabled={isOrderRated(order)}
                           >
                              {isOrderRated(order) ? 'Đã đánh giá' : 'Đánh giá'}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <Footer />
         </div>
      );
   }

   // Loading state
   if (loading) {
      return <LoadingUI />;
   }

   // No completed orders
   if (!loading && completedOrders.length === 0) {
      return (
         <div className='bg-[#F1EEE9] min-h-screen'>
            <Header />
            <div className='container mx-auto px-4 py-8'>
               <h1 className='text-2xl font-medium mb-6'>Đánh giá sản phẩm</h1>
               <div className='bg-white rounded-lg shadow p-8 text-center'>
                  <div className='flex flex-col items-center'>
                     <div className='bg-amber-50 inline-flex p-4 rounded-full mb-4'>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           className='h-8 w-8 text-amber-600'
                           fill='none'
                           viewBox='0 0 24 24'
                           stroke='currentColor'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                           />
                        </svg>
                     </div>
                     <h3 className='text-xl font-medium mb-2'>
                        Bạn chưa có đơn hàng đã hoàn thành
                     </h3>
                     <p className='text-gray-500 mb-6'>
                        Khi đơn hàng của bạn được chuyển sang trạng thái Hoàn thành, bạn có thể đánh
                        giá sản phẩm tại đây.
                     </p>
                     <Link
                        href='/user/order'
                        className='bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700'
                     >
                        Xem đơn hàng của tôi
                     </Link>
                  </div>
               </div>
            </div>
            <Footer />
         </div>
      );
   }

   // Rating UI for selected order
   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <Header />

         <div className='container mx-auto px-4 pt-4 pb-2'>
            <nav className='flex' aria-label='Breadcrumb'>
               <ol className='inline-flex items-center space-x-1 md:space-x-3'>
                  <li className='inline-flex items-center'>
                     <Link
                        href='/'
                        className='inline-flex items-center text-sm text-gray-700 hover:text-orange-600'
                     >
                        <svg
                           className='w-3 h-3 mr-2.5'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='currentColor'
                           viewBox='0 0 20 20'
                        >
                           <path d='m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z' />
                        </svg>
                        Trang chủ
                     </Link>
                  </li>
                  <li>
                     <div className='flex items-center'>
                        <svg
                           className='w-3 h-3 text-gray-400 mx-1'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='none'
                           viewBox='0 0 6 10'
                        >
                           <path
                              stroke='currentColor'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='m1 9 4-4-4-4'
                           />
                        </svg>
                        <Link
                           href='/user'
                           className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                        >
                           Tài khoản
                        </Link>
                     </div>
                  </li>
                  <li>
                     <div className='flex items-center'>
                        <svg
                           className='w-3 h-3 text-gray-400 mx-1'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='none'
                           viewBox='0 0 6 10'
                        >
                           <path
                              stroke='currentColor'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='m1 9 4-4-4-4'
                           />
                        </svg>
                        <Link
                           href='/user/order'
                           className='ml-1 text-sm text-gray-700 hover:text-orange-600 md:ml-2'
                        >
                           Đơn hàng của tôi
                        </Link>
                     </div>
                  </li>
                  <li aria-current='page'>
                     <div className='flex items-center'>
                        <svg
                           className='w-3 h-3 text-gray-400 mx-1'
                           aria-hidden='true'
                           xmlns='http://www.w3.org/2000/svg'
                           fill='none'
                           viewBox='0 0 6 10'
                        >
                           <path
                              stroke='currentColor'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='m1 9 4-4-4-4'
                           />
                        </svg>
                        <span className='ml-1 text-sm font-medium text-orange-600 md:ml-2'>
                           Đánh giá sản phẩm
                        </span>
                     </div>
                  </li>
                  {selectedOrder && (
                     <li aria-current='page'>
                        <div className='flex items-center'>
                           <svg
                              className='w-3 h-3 text-gray-400 mx-1'
                              aria-hidden='true'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 6 10'
                           >
                              <path
                                 stroke='currentColor'
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 strokeWidth='2'
                                 d='m1 9 4-4-4-4'
                              />
                           </svg>
                           <span className='ml-1 text-sm font-medium text-orange-600 md:ml-2'>
                              #{selectedOrder.order_code}
                           </span>
                        </div>
                     </li>
                  )}
               </ol>
            </nav>
         </div>

         <div className='fixed top-4 right-4 z-50'>
            <Toast
               show={toast.show}
               message={toast.message}
               type={toast.type}
               onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
         </div>

         <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center mb-6'>
               <button onClick={goBackToList} className='mr-4 text-gray-500 hover:text-gray-700'>
                  <svg
                     xmlns='http://www.w3.org/2000/svg'
                     className='h-6 w-6'
                     fill='none'
                     viewBox='0 0 24 24'
                     stroke='currentColor'
                  >
                     <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 19l-7-7m0 0l7-7m-7 7h18'
                     />
                  </svg>
               </button>
               <h1 className='text-2xl font-medium'>Đánh giá sản phẩm</h1>
            </div>

            {selectedOrder && (
               <div className='bg-white rounded-lg shadow overflow-hidden mb-6'>
                  <div className='p-4 border-b border-gray-100'>
                     <div className='flex justify-between items-center'>
                        <div>
                           <p className='text-sm text-gray-500'>
                              Mã đơn hàng:{' '}
                              <span className='font-medium text-gray-800'>
                                 {selectedOrder.order_code}
                              </span>
                           </p>
                           <p className='text-sm text-gray-500'>
                              Ngày đặt:{' '}
                              <span className='font-medium text-gray-800'>
                                 {formatDate(selectedOrder.createdAt)}
                              </span>
                           </p>
                        </div>
                        <div>
                           <span className='px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full bg-green-50 text-green-700 border border-green-200'>
                              {selectedOrder.status}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className='p-4'>
                     <h2 className='text-lg font-medium mb-4'>Sản phẩm cần đánh giá</h2>
                     <div className='space-y-6'>
                        {selectedOrder.item.map((item) => {
                           const productId = item.product?.id;
                           const ratingKey = productId || item.id;

                           return (
                              <div
                                 key={item.id}
                                 className='border-b border-gray-100 pb-6 last:border-b-0'
                              >
                                 <div className='flex items-start'>
                                    <div className='relative w-20 h-20 bg-gray-100 rounded'>
                                       <Image
                                          src={
                                             item.product?.images?.[0]?.path ||
                                             '/images/default-product.png'
                                          }
                                          alt={
                                             item.product?.name ||
                                             `Sản phẩm #${item.product_detail_id}`
                                          }
                                          fill
                                          sizes='80px'
                                          style={{ objectFit: 'contain' }}
                                          className='p-2'
                                       />
                                    </div>
                                    <div className='ml-4 flex-1'>
                                       <h3 className='font-medium'>
                                          {item.product?.name ||
                                             `Sản phẩm #${item.product_detail_id}`}
                                       </h3>
                                       {(item.productDetailData || item.product_detail) && (
                                          <p className='text-sm text-gray-500'>
                                             {item.productDetailData?.size ||
                                                item.product_detail?.size}{' '}
                                             -{' '}
                                             {item.productDetailData?.values ||
                                                item.product_detail?.values}
                                          </p>
                                       )}
                                       <p className='text-sm text-gray-500 mt-1'>
                                          Số lượng: {item.quantity} | Đơn giá:{' '}
                                          {formatPrice(item.unit_price)}
                                       </p>
                                    </div>
                                 </div>

                                 <div className='mt-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                       Đánh giá sao
                                    </label>
                                    <StarRating
                                       itemId={item.id}
                                       productId={productId}
                                       value={ratings[ratingKey] || 5}
                                       onChange={handleRatingChange}
                                    />
                                 </div>

                                 <div className='mt-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                                       Nhận xét của bạn
                                    </label>
                                    <textarea
                                       className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
                                       rows={3}
                                       placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...'
                                       value={reviews[ratingKey] || ''}
                                       onChange={(e) =>
                                          handleReviewChange(ratingKey, e.target.value)
                                       }
                                    />
                                 </div>

                                 <div className='mt-4 flex justify-end'>
                                    <button
                                       className={`px-4 py-2 ${
                                          (productId && userRatedProducts[productId]) ||
                                          item.rating !== undefined ||
                                          getRatingDraft(selectedOrder.id, productId || 0)?.rating
                                             ? 'bg-gray-400 text-white'
                                             : 'bg-orange-500 text-white hover:bg-orange-600'
                                       } rounded-md disabled:opacity-70 disabled:cursor-not-allowed`}
                                       onClick={() => submitRating(selectedOrder.id, item.id)}
                                       disabled={
                                          submitting ||
                                          (productId && userRatedProducts[productId]) ||
                                          item.rating !== undefined ||
                                          getRatingDraft(selectedOrder.id, productId || 0)?.rating
                                       }
                                    >
                                       {(productId && userRatedProducts[productId]) ||
                                       item.rating !== undefined ||
                                       getRatingDraft(selectedOrder.id, productId || 0)?.rating
                                          ? 'Đã đánh giá'
                                          : 'Gửi đánh giá'}
                                    </button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  <div className='p-4 bg-gray-50 flex justify-between items-center'>
                     <button
                        onClick={goBackToList}
                        className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'
                     >
                        Quay lại
                     </button>
                  </div>
               </div>
            )}
         </div>

         <Footer />
      </div>
   );
}
