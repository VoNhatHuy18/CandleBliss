'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { UserIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useCart } from '@/app/contexts/CartContext';
import { HOST } from '@/app/constants/api';

// Loading component
const NavBarLoading = () => (
   <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
      <div className='animate-pulse h-12 w-48 bg-gray-200 rounded'></div>
      <div className='flex space-x-4'>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
         <div className='animate-pulse h-6 w-6 bg-gray-200 rounded-full'></div>
      </div>
   </div>
);

// Interfaces definitions
interface DecodedToken {
   name: string;
   exp: number;
   id?: number;
   [key: string]: string | number | undefined;
}

interface CartItem {
   productDetailId: number;
   quantity: number;
   name?: string;
   price?: number;
   image?: string;
}

interface Cart {
   items: CartItem[];
   total?: number;
   userId?: number;
}

interface Category {
   id: number;
   name: string;
   description: string;
}

// Thêm interface cho sản phẩm gợi ý
interface SuggestedProduct {
   id: number;
   name: string;
   rating: number;
   imageUrl: string;
}

// Create a client component that uses searchParams
function SearchParamsHandler({ onUpdate }: { onUpdate: (productDetailId: number | null) => void }) {
   const searchParams = useSearchParams();

   useEffect(() => {
      const pdIdParam = searchParams.get('productDetailId');
      if (pdIdParam) {
         const pdId = parseInt(pdIdParam);
         onUpdate(isNaN(pdId) ? null : pdId);
      } else {
         onUpdate(null);
      }
   }, [searchParams, onUpdate]);

   return null;
}

// Main NavBar component
function NavBarContent() {
   // Thêm state cho sản phẩm gợi ý
   const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);
   const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

   const { localCartBadge, setLocalCartBadge, updateCartBadge } = useCart();

   const [showSearchInput, setShowSearchInput] = useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [userName, setUserName] = useState<string | null>(null);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [cartItemCount, setCartItemCount] = useState(0);
   const [productDetailCounts, setProductDetailCounts] = useState<{ [key: number]: number }>({});
   const [currentProductDetailId, setCurrentProductDetailId] = useState<number | null>(null);
   const [categories, setCategories] = useState<Category[]>([]);
   const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
   const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
   interface Product {
      id: number;
      name: string;
      images?: { path: string }[];
      // Add other fields as needed
   }
   const [allProducts, setAllProducts] = useState<Product[]>([]);

   const router = useRouter();
   const pathname = usePathname();

   // Handle update from SearchParamsHandler
   const handleSearchParamsUpdate = useCallback((productDetailId: number | null) => {
      setCurrentProductDetailId(productDetailId);
   }, []);

   // Your existing functions
   const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
   };

   const toggleUserMenu = () => {
      setShowUserMenu(!showUserMenu);
   };

   const handleLogout = useCallback(() => {
      // Clear all authentication data
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');

      // Clear all cart-related data
      localStorage.removeItem('cartBadge');
      localStorage.removeItem('cart'); // Clear the local cart items
      localStorage.removeItem('orderCompleted');

      // Reset states
      setIsLoggedIn(false);
      setUserName(null);
      setUserId(null);
      setShowUserMenu(false);
      updateCartBadge(0); // Reset cart badge using context method

      router.push('/user/home');
   }, [router, updateCartBadge]);


   const checkAuthStatus = useCallback(() => {
      const token = localStorage.getItem('token');

      if (token) {
         try {
            const decoded = jwtDecode<DecodedToken>(token);

            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
               console.log('Token expired, logging out and clearing cart data');
               // Token expired - clear all cart and authentication data
               localStorage.removeItem('userToken');
               localStorage.removeItem('token');
               localStorage.removeItem('refreshToken');
               localStorage.removeItem('userId');

               // Clear all cart-related data
               localStorage.removeItem('cartBadge');
               localStorage.removeItem('cart');
               localStorage.removeItem('orderCompleted');

               // Reset states
               setIsLoggedIn(false);
               setUserName(null);
               setUserId(null);
               updateCartBadge(0);

               // Don't need to call the full handleLogout since we've already cleared everything
               // Just need to handle redirects if necessary
               if (pathname === '/user/profile' || pathname.startsWith('/user/orders')) {
                  router.push('/user/signin');
               }
               return;
            }

            setIsLoggedIn(true);
            setUserName(decoded.name || 'User');

            if (decoded.id) {
               setUserId(decoded.id);
               localStorage.setItem('userId', decoded.id.toString());
            }
         } catch (error) {
            console.error('Invalid token:', error);
            // Same cleanup as above for invalid tokens
            localStorage.removeItem('userToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('cartBadge');
            localStorage.removeItem('cart');
            localStorage.removeItem('orderCompleted');

            setIsLoggedIn(false);
            setUserName(null);
            setUserId(null);
            updateCartBadge(0);

            if (pathname === '/user/profile' || pathname.startsWith('/user/orders')) {
               router.push('/user/signin');
            }
         }
      } else {
         setIsLoggedIn(false);
         setUserName(null);
         setUserId(null);

         if (pathname === '/user/profile' || pathname.startsWith('/user/orders')) {
            router.push('/user/signin');
         }
      }
   }, [pathname, router, updateCartBadge]);

   useEffect(() => {
      checkAuthStatus();
   }, [checkAuthStatus]);

   const fetchCartItemCount = useCallback(async () => {
      if (!userId) return;

      try {
         const response = await fetch(`${HOST}/api/cart/user/${userId}`);

         if (response.ok) {
            const cartData = (await response.json()) as Cart;
            if (cartData && cartData.items) {
               const count = cartData.items.reduce(
                  (total: number, item: CartItem) => total + (item.quantity || 0),
                  0,
               );
               setCartItemCount(count);

               // Use updateCartBadge from context which also updates localStorage
               if (count > 0) {
                  updateCartBadge(count);
               }

               const detailCounts: { [key: number]: number } = {};
               cartData.items.forEach((item: CartItem) => {
                  if (item.productDetailId) {
                     detailCounts[item.productDetailId] = item.quantity || 0;
                  }
               });
               setProductDetailCounts(detailCounts);
            }
         }
      } catch (error) {
         console.error('Error fetching cart count:', error);
      }
   }, [userId, updateCartBadge]); // Add updateCartBadge to dependencies

   useEffect(() => {
      if (isLoggedIn && userId) {
         fetchCartItemCount();
      } else {
         setCartItemCount(0);
         setProductDetailCounts({});
      }
   }, [isLoggedIn, userId, pathname, fetchCartItemCount]);

   useEffect(() => {
      if (cartItemCount > 0) {
         localStorage.setItem('cartBadge', cartItemCount.toString());
      }
   }, [cartItemCount]);

   // Remove or modify this useEffect if you're managing the badge through context
   // You can either remove it completely or keep it for double-safety
   useEffect(() => {
      if (cartItemCount > 0) {
         updateCartBadge(cartItemCount);
      }
   }, [cartItemCount, updateCartBadge]);

   const getProductDetailCount = (productDetailId: number | null): number => {
      if (!productDetailId) return 0;
      return productDetailCounts[productDetailId] || 0;
   };

   const handleUserIconClick = (e: React.MouseEvent) => {
      e.preventDefault();

      if (isLoggedIn) {
         if (window.innerWidth >= 1024) {
            toggleUserMenu();
         } else {
            router.push('/user/profile');
            setMobileMenuOpen(false);
         }
      } else {
         router.push('/user/signin');
         setMobileMenuOpen(false);
      }
   };

   const handleCartClick = async (e: React.MouseEvent) => {
      e.preventDefault();

      if (isLoggedIn && userId) {
         try {
            const response = await fetch(`${HOST}/api/cart/user/${userId}`);

            if (!response.ok) {
               console.log('Creating new cart for user:', userId);

               const createCartResponse = await fetch(`${HOST}/api/cart`, {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                  },
                  body: JSON.stringify({ userId }),
               });

               if (createCartResponse.ok) {
                  console.log('New cart created successfully');
                  // Khởi tạo badge là 0 nếu tạo mới giỏ hàng
                  updateCartBadge(0);
               } else {
                  console.error('Failed to create cart:', await createCartResponse.text());
               }
            } else {
               // Nếu giỏ hàng tồn tại, cập nhật badge từ API
               try {
                  const cartData = await response.json();
                  if (cartData && cartData.items) {
                     const count = cartData.items.reduce(
                        (total: number, item: CartItem) => total + (item.quantity || 0),
                        0
                     );
                     updateCartBadge(count);
                  }
               } catch (err) {
                  console.error('Error parsing cart data:', err);
               }
            }

            router.push('/user/cart');
         } catch (error) {
            console.error('Error handling cart:', error);
            router.push('/user/cart');
         }
      } else {
         // Cho người dùng chưa đăng nhập, truy cập trực tiếp trang giỏ hàng
         // thay vì chuyển đến trang đăng nhập
         router.push('/user/cart');
      }
   };

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();

      if (searchQuery.trim()) {
         router.push(`/user/products?search=${encodeURIComponent(searchQuery.trim())}`);
         closeSearchInput();
         setSuggestedKeywords([]); // Xóa từ khóa gợi ý khi tìm kiếm

         if (mobileMenuOpen) {
            setMobileMenuOpen(false);
         }
      }
   };

   const fetchCategories = useCallback(async () => {
      try {
         setCategories([]); // Reset categories before fetching

         console.log('Fetching categories...');
         const response = await fetch(`${HOST}/api/categories`);

         console.log('Categories API response status:', response.status);

         let categoriesData;

         if (response.status === 302) {
            // Xử lý trường hợp API trả về status 302 nhưng vẫn có dữ liệu
            const responseText = await response.text();
            console.log('Received 302 response with text:', responseText);

            try {
               // Thử parse responseText trực tiếp thành JSON
               categoriesData = JSON.parse(responseText);
               console.log('Successfully parsed categories from 302 response:', categoriesData);
            } catch (parseError) {
               console.error('Failed to parse categories from 302 response:', parseError);

               // Trích xuất JSON array từ text nếu có chứa dấu [] 
               if (responseText.includes('[') && responseText.includes(']')) {
                  const jsonStart = responseText.indexOf('[');
                  const jsonEnd = responseText.lastIndexOf(']') + 1;
                  const jsonString = responseText.substring(jsonStart, jsonEnd);

                  try {
                     categoriesData = JSON.parse(jsonString);
                     console.log('Extracted categories from 302 response text:', categoriesData);
                  } catch (nestedError) {
                     console.error('Failed to extract categories from 302 response text:', nestedError);
                     throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
                  }
               } else {
                  throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
               }
            }
         } else if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);

            // Trích xuất JSON array từ error response
            if (errorText.includes('[') && errorText.includes(']')) {
               const jsonStart = errorText.indexOf('[');
               const jsonEnd = errorText.lastIndexOf(']') + 1;
               const jsonString = errorText.substring(jsonStart, jsonEnd);

               try {
                  categoriesData = JSON.parse(jsonString);
                  console.log('Extracted categories from error response:', categoriesData);
               } catch (parseError) {
                  console.error('Failed to extract categories from error response:', parseError);
                  throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
               }
            } else {
               throw new Error(`Không thể tải danh mục sản phẩm (${response.status}): ${errorText}`);
            }
         } else {
            // Trường hợp thông thường: API trả về status success
            categoriesData = await response.json();
            console.log('Categories loaded successfully:', categoriesData);
         }

         if (Array.isArray(categoriesData)) {
            console.log('Setting categories:', categoriesData);
            setCategories(categoriesData);
         } else {
            console.error('Categories data is not an array:', categoriesData);
            setCategories([]);
         }
      } catch (error) {
         console.error('Error fetching categories:', error);

         // Trích xuất dữ liệu danh mục từ thông báo lỗi nếu có chứa JSON
         const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';

         if (errorMessage.includes('[{') && errorMessage.includes('"}]')) {
            try {
               // Trích xuất JSON từ thông báo lỗi
               const jsonStart = errorMessage.indexOf('[');
               const jsonEnd = errorMessage.lastIndexOf(']') + 1;
               const jsonString = errorMessage.substring(jsonStart, jsonEnd);

               const extractedData = JSON.parse(jsonString);
               console.log('Successfully extracted categories from error message:', extractedData);

               if (Array.isArray(extractedData)) {
                  setCategories(extractedData);
                  return; // Thoát sớm vì đã xử lý thành công dữ liệu
               }
            } catch (parseError) {
               console.error('Failed to parse categories from error message:', parseError);
            }
         }

         // Nếu không thể trích xuất được dữ liệu từ lỗi, gán mảng rỗng
         setCategories([]);
      }
   }, []);

   useEffect(() => {
      fetchCategories();
   }, [fetchCategories]);

   useEffect(() => {
      // Listen for badge updates from anywhere in the application
      const handleBadgeUpdate = (event: CustomEvent) => {
         const { count } = event.detail;
         // Update your state with the new count
         setLocalCartBadge(count);
      };

      // Add event listener with proper type casting
      window.addEventListener('cartBadgeUpdated', handleBadgeUpdate as EventListener);

      // Load initial badge from localStorage
      const savedBadge = localStorage.getItem('cartBadge');
      if (savedBadge) {
         setLocalCartBadge(parseInt(savedBadge));
      }

      // Cleanup event listener
      return () => {
         window.removeEventListener('cartBadgeUpdated', handleBadgeUpdate as EventListener);
      };
   }, []);

   // Thêm hàm lấy sản phẩm gợi ý
   const fetchSuggestedProducts = useCallback(async () => {
      if (isLoadingSuggestions) return;
      setIsLoadingSuggestions(true);

      try {
         // Lấy danh sách sản phẩm
         const productsResponse = await fetch(`${HOST}/api/products`);
         if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
         }
         const productsData = await productsResponse.json();

         // Đảm bảo productsData là một mảng
         if (!Array.isArray(productsData)) {
            throw new Error('Products data is not an array');
         }

         // Lấy IDs của tất cả sản phẩm
         const productIds = productsData.map(product => product.id);

         // Lấy ratings cho tất cả sản phẩm
         const ratingsPromises = productIds.map(id =>
            fetch(`${HOST}/api/rating/get-by-product`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ product_id: id }),
            }).then(res => res.ok ? res.json() : [])
         );

         const ratingsResults = await Promise.all(ratingsPromises);

         // Kết hợp sản phẩm với ratings
         const productsWithRatings = productIds.map((id, index) => {
            const product = productsData.find((p: { id: number; name: string; images?: { path: string }[] }) => p.id === id);
            const ratings = ratingsResults[index];

            if (!product) return null;

            // Tính rating trung bình
            let avgRating = 0;
            if (Array.isArray(ratings) && ratings.length > 0) {
               const totalRating = ratings.reduce(
                  (sum, item) => sum + (item.rating || item.avg_rating || 0),
                  0
               );
               avgRating = totalRating / ratings.length;
            }

            return {
               id,
               name: product.name,
               rating: avgRating,
               imageUrl: Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0].path
                  : (product.images?.path || '/images/placeholder.jpg')
            };
         }).filter(Boolean) as SuggestedProduct[];

         // Lọc sản phẩm có rating từ 4 đến 5 sao
         const highRatedProducts = productsWithRatings
            .filter(product => product.rating >= 4 && product.rating <= 5)
            .sort((a, b) => b.rating - a.rating) // Sắp xếp theo rating cao nhất
            .slice(0, 5); // Chỉ lấy 5 sản phẩm

         setSuggestedProducts(highRatedProducts);
      } catch (error) {
         console.error('Error fetching suggested products:', error);
         setSuggestedProducts([]);
      } finally {
         setIsLoadingSuggestions(false);
      }
   }, [isLoadingSuggestions]);

   // Khi người dùng click vào icon tìm kiếm
   const handleSearchIconClick = () => {
      const newShowSearchInput = !showSearchInput;
      setShowSearchInput(newShowSearchInput);

      // Nếu đang mở ô tìm kiếm, lấy gợi ý sản phẩm
      if (newShowSearchInput) {
         fetchSuggestedProducts();
      }
   };

   // Thêm hàm mới để đóng thanh tìm kiếm
   const closeSearchInput = () => {
      setShowSearchInput(false);
   };

   // Thêm hàm xử lý click ra ngoài thanh tìm kiếm
   useEffect(() => {
      // Chỉ thêm event listener khi thanh tìm kiếm đang mở
      if (!showSearchInput) return;

      const handleClickOutside = (event: MouseEvent) => {
         // Kiểm tra xem click có phải là bên ngoài vùng tìm kiếm không
         const searchContainer = document.getElementById('search-container');
         const searchButton = document.getElementById('search-button');

         if (searchContainer &&
            !searchContainer.contains(event.target as Node) &&
            searchButton &&
            !searchButton.contains(event.target as Node)) {
            closeSearchInput();
            setSuggestedKeywords([]); // Xóa từ khóa gợi ý khi đóng modal
         }
      };

      // Thêm event listener
      document.addEventListener('mousedown', handleClickOutside);

      // Dọn dẹp event listener khi component unmount hoặc thanh tìm kiếm đóng
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [showSearchInput]);

   useEffect(() => {
      const loadAllProducts = async () => {
         try {
            const response = await fetch(`${HOST}/api/products`);
            if (response.ok) {
               const products = await response.json();
               if (Array.isArray(products)) {
                  setAllProducts(products);
               }
            }
         } catch (error) {
            console.error('Error loading products for keyword suggestions:', error);
         }
      };

      loadAllProducts();
   }, []);

   // Thay thế hàm fetchSuggestedKeywords hiện tại bằng hàm mới:
   const fetchSuggestedKeywords = useCallback(async (query: string) => {
      if (!query || query.trim().length < 2) {
         setSuggestedKeywords([]);
         return;
      }

      setIsLoadingKeywords(true);

      // Tìm từ khóa từ danh sách sản phẩm đã có
      const searchTermLower = query.toLowerCase();
      const matchingKeywords: string[] = [];

      allProducts.forEach(product => {
         const productName = product.name?.toLowerCase() || '';

         if (productName.includes(searchTermLower)) {
            matchingKeywords.push(product.name);
         }

         // Tách từ và phân tích
         const words = productName.split(/\s+/);
         words.forEach((word: string) => {
            if (word.startsWith(searchTermLower) && word !== searchTermLower && !matchingKeywords.includes(word)) {
               matchingKeywords.push(word);
            }
         });
      });

      // Nếu có đủ từ khóa từ sản phẩm, trả về kết quả
      if (matchingKeywords.length >= 3) {
         setSuggestedKeywords(matchingKeywords.slice(0, 5));
         setIsLoadingKeywords(false);
         return;
      }

      // Nếu không có đủ từ khóa, kết hợp với AI
      try {
         // Gọi API AI để lấy gợi ý bổ sung
         const aiResponse = await fetch(`${window.location.origin}/api/chatbot`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               message: `Gợi ý 5 từ khóa tìm kiếm liên quan đến "${query}" cho cửa hàng nến thơm, đặc biệt là các loại nến thơm, tinh dầu, đèn xông tinh dầu, phụ kiện decor. Chỉ trả về danh sách từ khóa, không cần giải thích thêm.`
            }),
         });

         if (aiResponse.ok) {
            const data = await aiResponse.json();
            if (data.result) {
               const aiKeywords = parseKeywordsFromAIResponse(data.result);

               // Kết hợp từ khóa từ sản phẩm và AI, loại bỏ trùng lặp
               const combinedKeywords = [...new Set([...matchingKeywords, ...aiKeywords])];
               setSuggestedKeywords(combinedKeywords.slice(0, 5));
            } else {
               // Nếu AI không trả về kết quả, dùng chỉ từ khóa từ sản phẩm
               setSuggestedKeywords(matchingKeywords.slice(0, 5));
            }
         } else {
            // Nếu gọi API thất bại, dùng chỉ từ khóa từ sản phẩm
            setSuggestedKeywords(matchingKeywords.slice(0, 5));
         }
      } catch (error) {
         console.error('Error fetching AI keyword suggestions:', error);
         // Nếu có lỗi, dùng chỉ từ khóa từ sản phẩm
         setSuggestedKeywords(matchingKeywords.slice(0, 5));
      } finally {
         setIsLoadingKeywords(false);
      }
   }, [allProducts]);

   // Hàm phân tích từ khóa từ phản hồi của AI
   const parseKeywordsFromAIResponse = (response: string): string[] => {
      // Cố gắng phân tích xem AI trả về dạng gì (array, list, text)
      try {
         // Thử xem phản hồi có phải là JSON không
         const jsonMatch = response.match(/\[.*?\]/);
         if (jsonMatch) {
            const jsonString = jsonMatch[0];
            return JSON.parse(jsonString);
         }

         // Nếu không phải JSON, tìm danh sách được đánh số hoặc dấu gạch đầu dòng
         const lines = response.split('\n').map(line => line.trim());
         const keywordLines = lines.filter(line =>
            line.match(/^(\d+\.|\-|\*)\s+/) || // Dòng bắt đầu với số, dấu gạch ngang hoặc dấu sao
            (line.length > 0 && !line.includes(' ') && !line.includes(':')) // Hoặc dòng chỉ chứa một từ
         );

         if (keywordLines.length > 0) {
            return keywordLines.map(line =>
               line.replace(/^(\d+\.|\-|\*)\s+/, '') // Loại bỏ số thứ tự hoặc dấu đầu dòng
            );
         }

         // Nếu không tìm thấy dạng nào, tách thành các phần riêng biệt
         return response
            .split(/[,.\n]/)
            .map(part => part.trim())
            .filter(part => part.length > 0 && part.length < 30); // Chỉ lấy phần có ý nghĩa
      } catch (error) {
         console.error('Error parsing keywords from AI response:', error);
         return [];
      }
   };

   // Cập nhật hàm xử lý khi người dùng nhập từ khóa
   const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Nếu người dùng đã nhập ít nhất 2 ký tự, gọi API để lấy gợi ý từ khóa
      if (value.length >= 2) {
         // Debounce để tránh gọi API quá nhiều
         const handler = setTimeout(() => {
            fetchSuggestedKeywords(value);
         }, 500);

         return () => clearTimeout(handler);
      } else {
         setSuggestedKeywords([]);
      }
   };

   // Cập nhật để xử lý khi người dùng chọn từ khóa
   const selectKeywordSuggestion = (keyword: string) => {
      setSearchQuery(keyword);
      // Ẩn danh sách từ khóa gợi ý
      setSuggestedKeywords([]);
      // Thực hiện tìm kiếm ngay lập tức
      router.push(`/user/products?search=${encodeURIComponent(keyword.trim())}`);
      closeSearchInput();

      if (mobileMenuOpen) {
         setMobileMenuOpen(false);
      }
   };

   useEffect(() => {
      // Đồng bộ localCartBadge từ localStorage khi component mount
      const syncBadgeFromLocalStorage = () => {
         // Nếu người dùng đã đăng nhập, đã xử lý ở useEffect khác
         if (isLoggedIn) return;

         // Cho người dùng chưa đăng nhập, đọc giỏ hàng từ localStorage
         try {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localCart.length > 0) {
               const localCount = localCart.reduce(
                  (total: number, item: { quantity?: number }) => total + (item.quantity || 0),
                  0
               );
               setLocalCartBadge(localCount);
               localStorage.setItem('cartBadge', localCount.toString());
            } else {
               setLocalCartBadge(0);
               localStorage.removeItem('cartBadge');
            }
         } catch (error) {
            console.error('Error syncing cart badge from localStorage:', error);
            setLocalCartBadge(0);
         }
      };

      // Gọi ngay khi component mount
      syncBadgeFromLocalStorage();

      // Cũng lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi từ tab khác
      const handleStorageChange = (event: StorageEvent) => {
         if (event.key === 'cart') {
            syncBadgeFromLocalStorage();
         }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
         window.removeEventListener('storage', handleStorageChange);
      };
   }, [isLoggedIn, setLocalCartBadge]);

   return (
      <>
         {/* This is where we'll use the Suspense component to handle searchParams */}
         <Suspense fallback={null}>
            <SearchParamsHandler onUpdate={handleSearchParamsUpdate} />
         </Suspense>

         {/* Rest of your original JSX remains the same */}
         <div className='bg-[#F1EEE9] flex justify-between items-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-60 py-2'>
            <div className='flex items-center'>
               <Link href='/user/home'>
                  <div className='cursor-pointer'>
                     <Image
                        src={'/images/logoCoChu.png'}
                        alt='Candle Bliss Logo'
                        height={62}
                        width={253}
                        className='cursor-pointer w-auto h-10 md:h-12 lg:h-auto'
                     />
                  </div>
               </Link>
            </div>

            <div className='flex items-center space-x-4 md:space-x-6 lg:hidden'>
               <button
                  onClick={handleSearchIconClick}
                  className='text-[#553C26]'
               >
                  <MagnifyingGlassIcon className='size-5' />
               </button>
               <button onClick={handleCartClick} className='text-[#553C26] relative'>
                  <ShoppingBagIcon className='size-5' />
                  {/* Hiển thị badge cho cả người dùng đã đăng nhập và chưa đăng nhập */}
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                     {currentProductDetailId && getProductDetailCount(currentProductDetailId) > 0
                        ? getProductDetailCount(currentProductDetailId)
                        : localCartBadge > 0 ? localCartBadge : cartItemCount > 0 ? cartItemCount : null}
                  </span>
               </button>
               <button onClick={toggleMobileMenu} className='text-[#553C26]'>
                  {mobileMenuOpen ? (
                     <XMarkIcon className='size-6' />
                  ) : (
                     <Bars3Icon className='size-6' />
                  )}
               </button>
            </div>

            <nav className='hidden lg:flex space-x-5 xl:space-x-10 text-[#553C26] items-center'>
               <Link href='/user/home'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Trang Chủ
                  </button>
               </Link>
               <div className='relative group'>
                  <Link href='/user/products'>
                     <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                        Sản Phẩm
                     </button>
                  </Link>
                  <div className='absolute hidden group-hover:block bg-[#F1EEE9] shadow-lg rounded-lg w-36 font-semibold z-50'>
                     {categories.map((category, index) => (
                        <React.Fragment key={category.id}>
                           <Link
                              href={`/user/products/category/${category.id}`}
                              className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'
                           >
                              {category.name}
                           </Link>
                           {index < categories.length - 1 && <hr className='border-[#553C26]' />}
                        </React.Fragment>
                     ))}
                     <hr className='border-[#553C26]' />
                  </div>
               </div>
               <Link href='/user/gifts'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Combo Khuyến Mãi
                  </button>
               </Link>
               <Link href='/user/vouchers'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Mã Giảm Giá
                  </button>
               </Link>
               <Link href='/user/aboutshop'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Về Chúng Tôi
                  </button>
               </Link>
               <Link href='https://www.facebook.com/vo.huy.5283' target='_blank'>
                  <button className='text-base xl:text-lg hover:text-[#FF9900] focus:font-semibold focus:text-[#FF9900] font-mont hover:font-semibold'>
                     Liên Hệ
                  </button>
               </Link>
               <div className='relative items-center flex'>
                  {showSearchInput && (
                     <div className='relative'>
                        <form onSubmit={handleSearch} className='flex items-center'>
                           <input
                              type='text'
                              className='p-2 border border-[#553C26] rounded-lg'
                              placeholder='Nhấn Enter để tìm kiếm...'
                              value={searchQuery}
                              onChange={handleSearchInputChange}
                              autoFocus
                           />
                           <button type='submit' className='ml-2 text-[#553C26]'>
                              <MagnifyingGlassIcon className='size-5' />
                           </button>
                           <button
                              onClick={closeSearchInput}
                              className='ml-2 p-2   rounded-lg text-red-600'
                           >
                              <XMarkIcon className='size-5' />
                           </button>
                        </form>

                        {/* Hiển thị gợi ý sản phẩm */}
                        {showSearchInput && (
                           <div className='absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg w-80 z-50'>
                              {/* Hiển thị gợi ý từ khóa khi người dùng đang nhập */}
                              {searchQuery.length >= 2 && (
                                 <div className='py-2 px-3 border-b border-amber-100'>
                                    {isLoadingKeywords ? (
                                       <div className='flex justify-center items-center py-2'>
                                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700'></div>
                                       </div>
                                    ) : suggestedKeywords.length > 0 ? (
                                       <>
                                          <p className='text-sm font-medium text-amber-800 mb-1'>Từ khóa gợi ý:</p>
                                          <div className='flex flex-wrap gap-1'>
                                             {suggestedKeywords.map((keyword, index) => {
                                                // Kiểm tra xem từ khóa có phải là sản phẩm thực không
                                                const isRealProduct = allProducts.some(product => product.name === keyword);

                                                return (
                                                   <button
                                                      key={index}
                                                      className={`text-xs rounded-full px-2 py-1 flex items-center ${isRealProduct
                                                         ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                                         : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                                                         }`}
                                                      onClick={() => selectKeywordSuggestion(keyword)}
                                                   >
                                                      <span className="mr-1">{isRealProduct ? '🔍' : '✨'}</span> {keyword}
                                                   </button>
                                                );
                                             })}
                                          </div>
                                       </>
                                    ) : null}
                                 </div>
                              )}

                              {/* Hiển thị sản phẩm gợi ý khi có kết quả và không đang nhập từ khóa */}
                              {suggestedProducts.length > 0 && (
                                 <>
                                    <div className='py-2 px-3 bg-amber-50 border-b border-amber-100'>
                                       <p className='text-sm font-medium text-amber-800'>Sản phẩm nổi bật</p>
                                    </div>
                                    <div className='max-h-80 overflow-y-auto'>
                                       {isLoadingSuggestions ? (
                                          <div className='flex justify-center items-center py-4'>
                                             <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-amber-700'></div>
                                          </div>
                                       ) : (
                                          suggestedProducts.map(product => (
                                             <Link
                                                href={`/user/products/${product.id}`}
                                                key={product.id}
                                                onClick={() => {
                                                   closeSearchInput();
                                                   if (mobileMenuOpen) {
                                                      setMobileMenuOpen(false);
                                                   }
                                                }}
                                             >
                                                <div className='flex items-center p-2 hover:bg-gray-50'>
                                                   {product.imageUrl && (
                                                      <div className='w-12 h-12 rounded overflow-hidden mr-3'>
                                                         <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            width={48}
                                                            height={48}
                                                            className='object-cover w-full h-full'
                                                         />
                                                      </div>
                                                   )}
                                                   <div>
                                                      <p className='text-sm font-medium text-gray-800'>{product.name}</p>
                                                      <div className='flex items-center'>
                                                         {/* Hiển thị rating */}
                                                         {[1, 2, 3, 4, 5].map((star) => (
                                                            <svg
                                                               key={star}
                                                               xmlns='http://www.w3.org/2000/svg'
                                                               className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                               viewBox='0 0 20 20'
                                                               fill='currentColor'
                                                            >
                                                               <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                                            </svg>
                                                         ))}
                                                         <span className='text-xs text-gray-500 ml-1'>
                                                            ({product.rating.toFixed(1)})
                                                         </span>
                                                      </div>
                                                   </div>
                                                </div>
                                             </Link>
                                          ))
                                       )}
                                    </div>
                                    <div className='border-t border-gray-100 py-2 px-3'>
                                       <Link
                                          href='/user/products'
                                          className='text-xs text-amber-600 hover:text-amber-700 font-medium'
                                          onClick={() => {
                                             closeSearchInput();
                                             if (mobileMenuOpen) {
                                                setMobileMenuOpen(false);
                                             }
                                          }}
                                       >
                                          Xem tất cả sản phẩm
                                       </Link>
                                    </div>
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                  )}
                  {/* Icon tìm kiếm desktop */}
                  {!showSearchInput && (
                     <button
                        id="search-button"
                        onClick={handleSearchIconClick}
                        className='ml-2 text-[#553C26]'
                     >
                        <MagnifyingGlassIcon className='size-5' />
                     </button>
                  )}


               </div>
               <button onClick={handleCartClick} className='text-[#553C26] relative'>
                  <ShoppingBagIcon className='size-5' />
                  {/* Hiển thị badge cho cả người dùng đã đăng nhập và chưa đăng nhập */}
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                     {currentProductDetailId && getProductDetailCount(currentProductDetailId) > 0
                        ? getProductDetailCount(currentProductDetailId)
                        : localCartBadge > 0 ? localCartBadge : cartItemCount > 0 ? cartItemCount : null}
                  </span>
               </button>

               <div className='relative'>
                  <button
                     onClick={handleUserIconClick}
                     className={`text-[#553C26] p-2 rounded-full ${isLoggedIn ? 'bg-amber-100' : ''
                        }`}
                  >
                     <UserIcon className='size-5' />
                  </button>

                  {isLoggedIn && showUserMenu && (
                     <div className='absolute top-full right-0 mt-1 bg-[#F1EEE9] rounded-md shadow-lg w-48 py-2 z-50'>
                        <Link href='/user/profile'>
                           <div className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8] border-b border-amber-200'>
                              Hồ sơ cá nhân
                           </div>
                        </Link>
                        <Link href='/user/profile/resetpassword'>
                           <div className='block px-4 py-2 text-[#553C26] hover:bg-[#E2DED8]'>
                              Thay đổi mật khâu
                           </div>
                        </Link>
                        <button
                           onClick={handleLogout}
                           className='w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-amber-200 mt-1'
                        >
                           Đăng xuất
                        </button>
                     </div>
                  )}

                  {isLoggedIn && !showUserMenu && (
                     <div className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full'></div>
                  )}
               </div>
            </nav>
         </div>

         {mobileMenuOpen && (
            <div className='lg:hidden bg-[#F1EEE9] py-4 px-4 sm:px-6 md:px-12 shadow-md'>
               {showSearchInput && (
                  <div className='mb-4'>
                     <form onSubmit={handleSearch} className='flex items-center'>
                        <input
                           type='text'
                           className='w-full p-2 border border-[#553C26] rounded-lg'
                           placeholder='Tìm kiếm...'
                           value={searchQuery}
                           onChange={handleSearchInputChange}
                        />
                        <button
                           type='submit'
                           className='ml-2 p-2 bg-amber-100 rounded-lg text-[#553C26]'
                        >
                           <MagnifyingGlassIcon className='size-5' />
                        </button>
                     </form>

                     {/* Hiển thị gợi ý sản phẩm trên mobile */}
                     {showSearchInput && suggestedProducts.length > 0 && (
                        <div className='mt-2 bg-white rounded-md shadow-sm'>
                           <div className='py-2 px-3 bg-amber-50 border-b border-amber-100'>
                              <p className='text-sm font-medium text-amber-800'>Sản phẩm nổi bật</p>
                           </div>
                           <div className='max-h-60 overflow-y-auto'>
                              {isLoadingSuggestions ? (
                                 <div className='flex justify-center items-center py-4'>
                                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-amber-700'></div>
                                 </div>
                              ) : (
                                 suggestedProducts.map(product => (
                                    <Link
                                       href={`/user/products/${product.id}`}
                                       key={product.id}
                                       onClick={() => {
                                          setShowSearchInput(false);
                                          setMobileMenuOpen(false);
                                       }}
                                    >
                                       <div className='flex items-center p-2 hover:bg-gray-50'>
                                          {product.imageUrl && (
                                             <div className='w-12 h-12 rounded overflow-hidden mr-3'>
                                                <Image
                                                   src={product.imageUrl}
                                                   alt={product.name}
                                                   width={48}
                                                   height={48}
                                                   className='object-cover w-full h-full'
                                                />
                                             </div>
                                          )}
                                          <div>
                                             <p className='text-sm font-medium text-gray-800'>{product.name}</p>
                                             <div className='flex items-center'>
                                                {/* Rating */}
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                   <svg
                                                      key={star}
                                                      xmlns='http://www.w3.org/2000/svg'
                                                      className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                      viewBox='0 0 20 20'
                                                      fill='currentColor'
                                                   >
                                                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                                   </svg>
                                                ))}
                                                <span className='text-xs text-gray-500 ml-1'>
                                                   ({product.rating.toFixed(1)})
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    </Link>
                                 ))
                              )}
                           </div>
                           <div className='border-t border-gray-100 py-2 px-3'>
                              <Link
                                 href='/user/products'
                                 className='text-xs text-amber-600 hover:text-amber-700 font-medium'
                                 onClick={() => {
                                    closeSearchInput();
                                    if (mobileMenuOpen) {
                                       setMobileMenuOpen(false);
                                    }
                                 }}
                              >
                                 Xem tất cả sản phẩm
                              </Link>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               <nav className='flex flex-col space-y-4'>
                  <Link href='/user/home' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Trang Chủ
                     </span>
                  </Link>
                  <div className='relative'>
                     <Link href='/user/products' onClick={toggleMobileMenu}>
                        <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                           Sản Phẩm
                        </span>
                     </Link>
                     <div className='ml-4 mt-2 space-y-2'>
                        {categories.map((category) => (
                           <Link
                              key={category.id}
                              href={`/user/products/category/${category.id}`}
                              onClick={toggleMobileMenu}
                           >
                              <span className='block text-[#553C26] hover:text-[#FF9900]'>
                                 {category.name}
                              </span>
                           </Link>
                        ))}
                        <Link href='/products/accessories' onClick={toggleMobileMenu}>
                           <span className='block text-[#553C26] hover:text-[#FF9900]'>
                              Quà Tặng
                           </span>
                        </Link>
                     </div>
                  </div>
                  <Link href='/about' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Về Chúng Tôi
                     </span>
                  </Link>
                  <Link href='https://www.facebook.com/' target='_blank' onClick={toggleMobileMenu}>
                     <span className='block text-[#553C26] text-lg font-mont hover:text-[#FF9900]'>
                        Liên Hệ
                     </span>
                  </Link>

                  <div className='pt-3 mt-2 border-t border-amber-200'>
                     {!isLoggedIn ? (
                        <>
                           <Link href='/user/signin' onClick={toggleMobileMenu}>
                              <div className='block py-2 px-4 text-[#553C26] text-lg font-bold bg-amber-100 hover:bg-amber-200 rounded-md mb-2'>
                                 Đăng Nhập
                              </div>
                           </Link>
                           <Link href='/user/signup' onClick={toggleMobileMenu}>
                              <div className='block py-2 px-4 text-amber-600 text-lg border border-amber-400 rounded-md hover:bg-amber-50 text-center'>
                                 Đăng Ký
                              </div>
                           </Link>
                        </>
                     ) : (
                        <>
                           <div className='py-2 px-4 bg-amber-50 rounded-md mb-3'>
                              <p className='text-amber-800 text-sm'>Xin chào,</p>
                              <p className='font-bold text-[#553C26]'>{userName}</p>
                           </div>

                           <Link href='/user/profile' onClick={toggleMobileMenu}>
                              <div className='flex items-center py-2 text-[#553C26] hover:text-amber-700'>
                                 <UserIcon className='size-5 mr-2' />
                                 <span>Hồ Sơ Cá Nhân</span>
                              </div>
                           </Link>

                           <Link href='/user/orders' onClick={toggleMobileMenu}>
                              <div className='flex items-center py-2 text-[#553C26] hover:text-amber-700'>
                                 <ShoppingBagIcon className='size-5 mr-2' />
                                 <span>Đơn Hàng Của Tôi</span>
                              </div>
                           </Link>

                           <button
                              onClick={() => {
                                 handleLogout();
                                 toggleMobileMenu();
                              }}
                              className='flex items-center w-full py-2 text-red-600 hover:text-red-700 mt-3'
                           >
                              <XMarkIcon className='size-5 mr-2' />
                              <span>Đăng Xuất</span>
                           </button>
                        </>
                     )}
                  </div>
               </nav>
            </div>
         )}
      </>
   );
}

// Export wrapper with Suspense
export default function NavBar() {
   return (
      <Suspense fallback={<NavBarLoading />}>
         <NavBarContent />
      </Suspense>
   );
}
