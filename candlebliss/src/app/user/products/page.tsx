'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Eye, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';
import ChatBot from '@/app/components/user/chatbot/ChatBot';
import { HOST } from '@/app/constants/api';
import StarRating from '@/app/components/StarRating';
import { hybridCache } from '@/app/utils/hybridCache';

interface ProductImage {
   id: string;
   path: string;
   public_id: string;
}

interface ProductDetail {
   productId: number;
   id: number;
   size: string;
   type: string;
   values: string;
   quantities: number;
   images: ProductImage[];
   isActive: boolean;
}

interface Price {
   id: number;
   base_price: number;
   discount_price: number;
   start_date: string;
   end_date: string;
   product_detail: ProductDetail;
}

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage | ProductImage[];
   details?: ProductDetail[]; // Add the 'details' property as optional
   reviewCount?: number; // Add this
}

interface ProductCardProps {
   title: string;
   description: string;
   price: string;
   discountPrice?: string;
   rating: number;
   reviewCount?: number;
   imageUrl: string;
   variants?: Array<{
      detailId: number;
      size: string;
      type: string;
      basePrice: string;
      discountPrice?: string;
      inStock: boolean;
   }>;
   onViewDetail?: (productId: number) => void;
   onAddToCart?: (productId: number, detailId?: number) => void;
}

// Add these interfaces before the ProductCard component
interface PriceRange {
   min: number;
   max: number;
   label: string;
}

interface SortOption {
   value: string;
   label: string;
}

interface PriceRange {
   min: number;
   max: number;
   label: string;
   hasDiscount?: boolean; // Add this property
}


// Update ProductCard component to ensure consistent sizing
const ProductCard = ({
   id,
   title,
   description,
   price,
   discountPrice,
   rating,
   imageUrl,
   variants,
   onViewDetail,
}: ProductCardProps & { id: number }) => {
   const [selectedVariant, setSelectedVariant] = useState(
      variants && variants.length > 0 ? variants[0].detailId : null,
   );
   const [showVariantOptions, setShowVariantOptions] = useState(false);

   // Add this function to use setSelectedVariant
   const handleVariantChange = (variantId: number) => {
      setSelectedVariant(variantId);
      setShowVariantOptions(false);
   };

   const renderVariantOptions = () => {
      if (showVariantOptions && variants) {
         return (
            <div className='mt-1 space-y-1'>
               {variants.map((variant) => (
                  <button
                     key={variant.detailId}
                     className={`text-xs px-2 py-1 border rounded ${selectedVariant === variant.detailId
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300'
                        }`}
                     onClick={() => handleVariantChange(variant.detailId)}
                  >
                     {variant.size} - {variant.type}
                  </button>
               ))}
            </div>
         );
      }
      return null;
   };

   const renderStars = () => {
      return <StarRating rating={rating} size="sm" showCount={false} />;
   };

   const formatPrice = (value: string | number) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   };

   // Cập nhật hàm tính giá sau khi áp dụng phần trăm giảm giá
   const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
      const basePriceNum = parseFloat(basePrice);
      const discountPercentNum = parseFloat(discountPercent);

      if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

      // Tính giá sau khi giảm: basePrice * (1 - discount/100)
      const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
      return discountedPrice;
   };

   // Lấy thông tin giá hiển thị dựa trên product-detail
   const getDisplayPrice = () => {
      // Nếu có variants và đã chọn một variant
      if (variants && variants.length > 0) {
         // Sử dụng variant được chọn nếu có, ngược lại sử dụng variant đầu tiên
         const activeVariant = selectedVariant
            ? variants.find((v) => v.detailId === selectedVariant)
            : variants[0];

         if (activeVariant) {
            const actualDiscountPrice = activeVariant.discountPrice
               ? calculateDiscountedPrice(activeVariant.basePrice, activeVariant.discountPrice)
               : null;

            return {
               basePrice: activeVariant.basePrice,
               discountPrice: actualDiscountPrice,
               discountPercent: activeVariant.discountPrice,
            };
         }
      }

      // Fallback nếu không có variant hoặc không thể tìm thấy variant đã chọn
      const actualDiscountPrice = discountPrice
         ? calculateDiscountedPrice(price, discountPrice)
         : null;

      return {
         basePrice: price,
         discountPrice: actualDiscountPrice,
         discountPercent: discountPrice,
      };
   };

   // Get the display price values
   const { basePrice, discountPrice: calculatedDiscountPrice, discountPercent } = getDisplayPrice();

   return (
      <div className='rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow h-full flex flex-col'>
         <div className='relative aspect-square overflow-hidden rounded-lg group'>
            <Image
               src={imageUrl}
               alt={title}
               height={400}
               width={400}
               className='h-full w-full object-cover transition-all duration-300 group-hover:blur-sm'
            />

            {/* Badge giảm giá */}
            {discountPercent && parseInt(discountPercent) > 0 && (
               <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium'>
                  -{discountPercent}%
               </div>
            )}

            <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
               <Link href={`/user/products/${id}`}>
                  <button
                     onClick={() => onViewDetail && onViewDetail(id)}
                     className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black'
                  >
                     <Eye className='w-4 h-4' />
                     <span>Xem chi tiết</span>
                  </button>
               </Link>
            </div>
         </div>

         <div className='mt-3 flex-grow flex flex-col'>
            <h3 className='text-sm font-medium text-gray-700 mb-1 truncate whitespace-nowrap overflow-hidden'>
               {title}
            </h3>
            <p className='text-xs text-gray-500 line-clamp-2 mb-1 min-h-[2rem]'>{description}</p>
            <div className='flex items-center'>{renderStars()}</div>

            {/* Hiển thị tùy chọn variants */}
            {variants && variants.length > 0 && (
               <div className='mt-2'>
                  {/* Toggle button to show/hide variant options */}
                  <button
                     className='text-xs text-gray-600 hover:text-orange-700 mb-1 flex items-center'
                     onClick={() => setShowVariantOptions(!showVariantOptions)}
                  ></button>
                  {renderVariantOptions()}
               </div>
            )}

            {/* Hiển thị giá */}
            <div className='mt-auto pt-2'>
               {(() => {
                  // Nếu có giảm giá
                  if (
                     discountPercent &&
                     parseInt(discountPercent) > 0 &&
                     calculatedDiscountPrice !== null
                  ) {
                     return (
                        <div className='flex items-center'>
                           <span className='text-red-600 text-sm font-medium'>
                              {formatPrice(calculatedDiscountPrice)}đ
                           </span>
                           <span className='ml-1.5 text-gray-500 text-xs line-through'>
                              {formatPrice(basePrice)}đ
                           </span>
                           <div className='bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ml-1.5'>
                              -{discountPercent}%
                           </div>
                        </div>
                     );
                  }
                  // Không có giảm giá
                  else {
                     return (
                        <span className='text-red-600 text-sm font-medium'>
                           {formatPrice(basePrice)}đ
                        </span>
                     );
                  }
               })()}
            </div>
         </div>
      </div>
   );
};

// Create a client component that uses searchParams
function ProductSearch({ onSearch }: { onSearch: (query: string) => void }) {
   const searchParams = useSearchParams();
   const searchQuery = searchParams.get('search') || '';

   // Sửa useEffect này để ngăn vòng lặp vô hạn
   useEffect(() => {
      // Chỉ gọi onSearch khi searchQuery thực sự thay đổi
      if (searchQuery !== undefined) {
         onSearch(searchQuery);
      }
   }, [searchParams]); // Bỏ onSearch ra khỏi dependency array

   return null; // This component doesn't render anything, just processes the search
}

// Hàm fetchRatingsForProducts đã có trong code hiện tại và đã cập nhật đúng rồi,
// nhưng để chắc chắn, hãy kiểm tra xem nó có đúng định dạng sau không:

const fetchRatingsForProducts = async (productIds: number[]) => {
   if (!productIds.length) return {};

   try {
      const ratingPromises = productIds.map((id) =>
         fetch(`${HOST}/api/rating/get-by-product`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: id }),
         }).then((res) => (res.ok ? res.json() : [])),
      );

      const ratingsResults = await Promise.all(ratingPromises);

      // Map ratings and review counts to product IDs
      const ratingsMap: Record<number, { rating: number; reviewCount: number }> = {};

      productIds.forEach((id, index) => {
         const productRatings = ratingsResults[index];
         if (Array.isArray(productRatings) && productRatings.length > 0) {
            const totalRating = productRatings.reduce(
               (sum, item) => sum + (item.rating || item.avg_rating || 0),
               0,
            );
            ratingsMap[id] = {
               rating: productRatings.length > 0 ? totalRating / productRatings.length : 0,
               reviewCount: productRatings.length,
            };
         } else {
            ratingsMap[id] = { rating: 0, reviewCount: 0 }; // Default rating
         }
      });

      return ratingsMap;
   } catch (error) {
      console.error('Error fetching ratings batch:', error);
      return {};
   }
};


// Thêm vào file page.tsx
interface RecommendedProductsProps {
   allProducts: Array<{
      id: number;
      title: string;
      description: string;
      price: string;
      discountPrice?: string;
      rating: number;
      imageUrl: string;
      reviewCount?: number;
      variants?: Array<{
         detailId: number;
         size: string;
         type: string;
         basePrice: string;
         discountPrice?: string;
         inStock: boolean;
      }>;
   }>;
   currentSearchTerm: string;
   onViewDetail: (productId: number) => void; // Thêm prop này
}

const RecommendedProducts = ({ allProducts, currentSearchTerm, onViewDetail }: RecommendedProductsProps) => {
   const [recommendations, setRecommendations] = useState<typeof allProducts>([]);
   const [currentSlide, setCurrentSlide] = useState(0);
   const itemsPerSlide = 4; // Mỗi trang hiển thị 4 sản phẩm

   useEffect(() => {
      // Kết hợp cả hai loại khuyến nghị (tìm kiếm và sản phẩm đã xem)
      const getCombinedRecommendations = () => {
         // Lấy khuyến nghị dựa trên lịch sử xem từ hybridCache
         const viewHistory = hybridCache.getViewHistory();

         // Khởi tạo mảng sản phẩm đề xuất
         let recommendedProducts: typeof allProducts = [];

         // 1. Thêm các sản phẩm đã xem gần đây (tối đa 2 sản phẩm)
         const recentlyViewedProducts = viewHistory
            .sort((a, b) => b.lastViewed - a.lastViewed)
            .slice(0, 4)
            .map(v => allProducts.find(p => p.id === v.productId))
            .filter((p): p is typeof allProducts[0] => Boolean(p));

         recommendedProducts = [...recentlyViewedProducts];

         // 2. Thêm các sản phẩm tương tự với sản phẩm đã xem
         if (recentlyViewedProducts.length > 0) {
            const similarProducts: Record<number, { product: typeof allProducts[0], score: number }> = {};

            allProducts.forEach(product => {
               // Bỏ qua các sản phẩm đã xem
               if (recentlyViewedProducts.some((p) => p.id === product.id)) return;

               let totalScore = 0;
               recentlyViewedProducts.forEach(viewedProduct => {
                  totalScore += getSimilarityScore(viewedProduct, product);
               });

               if (totalScore > 0) {
                  similarProducts[product.id] = { product, score: totalScore };
               }
            });

            // Lấy các sản phẩm có điểm tương đồng cao nhất
            const recommendedSimilarProducts = Object.values(similarProducts)
               .sort((a, b) => b.score - a.score)
               .map(item => item.product)
               .slice(0, 4);

            recommendedProducts = [...recommendedProducts, ...recommendedSimilarProducts];
         }

         // 3. Thêm các sản phẩm dựa trên từ khóa tìm kiếm
         if (currentSearchTerm.trim()) {
            // Nếu có từ khóa hiện tại, tìm các sản phẩm tương tự
            const terms = currentSearchTerm.toLowerCase().split(' ')
               .filter(term => term.length > 2);

            if (terms.length > 0) {
               // Tìm sản phẩm khớp với từng từ trong từ khóa
               let searchBasedProducts: typeof allProducts = [];

               terms.forEach(term => {
                  const matchingProducts = allProducts.filter(product =>
                     product.title.toLowerCase().includes(term) ||
                     (product.description && product.description.toLowerCase().includes(term))
                  );

                  searchBasedProducts = [...searchBasedProducts, ...matchingProducts];
               });

               // Loại bỏ các sản phẩm đã xuất hiện trong kết quả tìm kiếm chính xác
               const exactMatches = allProducts.filter(product =>
                  product.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
                  (product.description && product.description.toLowerCase().includes(currentSearchTerm.toLowerCase()))
               );

               const exactMatchIds = new Set(exactMatches.map(p => p.id));
               searchBasedProducts = searchBasedProducts.filter(p => !exactMatchIds.has(p.id));

               // Thêm vào danh sách đề xuất
               recommendedProducts = [...recommendedProducts, ...searchBasedProducts];
            }
         } else {
            // Nếu không có từ khóa hiện tại, lấy từ lịch sử tìm kiếm
            const searchHistory = hybridCache.getSearchHistory();

            if (searchHistory.length > 0) {
               // Sắp xếp lịch sử tìm kiếm theo số lần tìm kiếm
               const topSearches = searchHistory.sort((a, b) => b.count - a.count).slice(0, 2);

               // Tìm sản phẩm phù hợp với các từ khóa phổ biến
               let searchHistoryProducts: typeof allProducts = [];

               topSearches.forEach(search => {
                  const term = search.term.toLowerCase();
                  const matchingProducts = allProducts.filter(product =>
                     product.title.toLowerCase().includes(term) ||
                     (product.description && product.description.toLowerCase().includes(term))
                  );

                  searchHistoryProducts = [...searchHistoryProducts, ...matchingProducts];
               });

               // Thêm vào danh sách đề xuất
               recommendedProducts = [...recommendedProducts, ...searchHistoryProducts];
            }
         }

         // 4. Loại bỏ sản phẩm trùng lặp và lấy tối đa 8 sản phẩm
         return Array.from(new Set(recommendedProducts.map(p => p.id)))
            .map(id => recommendedProducts.find(p => p.id === id)!)
            .slice(0, 8);
      };

      // Lấy danh sách sản phẩm đề xuất kết hợp
      const combinedRecommendations = getCombinedRecommendations();
      setRecommendations(combinedRecommendations);
      setCurrentSlide(0); // Reset slide về đầu
   }, [allProducts, currentSearchTerm]);

   if (recommendations.length === 0) return null;

   // Tính tổng số trang của carousel
   const totalSlides = Math.ceil(recommendations.length / itemsPerSlide);

   // Lấy các sản phẩm cho trang hiện tại
   const visibleProducts = recommendations.slice(
      currentSlide * itemsPerSlide,
      (currentSlide * itemsPerSlide) + itemsPerSlide
   );

   // Hàm xử lý chuyển slide trước và sau
   const goToNextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
   };

   const goToPrevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
   };

   // Hàm chuyển đến slide cụ thể
   const goToSlide = (slideIndex: number) => {
      setCurrentSlide(slideIndex);
   };

   return (
      <div className="mt-10 mb-6">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
               Có thể bạn sẽ thích
            </h3>
         </div>

         {/* Carousel Container */}
         <div className="relative">
            {/* Carousel Navigation Buttons - luôn hiển thị nếu có nhiều hơn 4 sản phẩm */}
            {recommendations.length > 4 && (
               <>
                  <button
                     onClick={goToPrevSlide}
                     className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                     aria-label="Previous items"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                     </svg>
                  </button>

                  <button
                     onClick={goToNextSlide}
                     className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                     aria-label="Next items"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                     </svg>
                  </button>
               </>
            )}

            {/* Hiển thị sản phẩm trong trang hiện tại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
               {visibleProducts.map((product) => (
                  <div key={`rec-${product.id}`} className="h-full">
                     <ProductCard
                        id={product.id}
                        title={product.title}
                        description={product.description || ''}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        rating={product.rating}
                        reviewCount={product.reviewCount || 0}
                        imageUrl={product.imageUrl}
                        variants={product.variants}
                        onViewDetail={onViewDetail}
                     />
                  </div>
               ))}
            </div>

            {/* Carousel Indicators */}
            {recommendations.length > 4 && (
               <div className="flex justify-center gap-1 mt-4">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                     <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-colors ${index === currentSlide ? 'bg-amber-500' : 'bg-gray-300 hover:bg-gray-400'
                           }`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

// Thêm vào RecommendedProducts
// Logic tính độ tương đồng dựa trên các thuộc tính sản phẩm
const getSimilarityScore = (product1: RecommendedProductsProps['allProducts'][0], product2: RecommendedProductsProps['allProducts'][0]) => {
   let score = 0;

   // 1. Điểm cho tên sản phẩm tương tự (cải tiến)
   const title1Words = product1.title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
   const title2Words = product2.title.toLowerCase().split(/\s+/).filter(word => word.length > 2);

   // Tính số từ chung giữa hai tiêu đề (chỉ tính từ có ít nhất 3 chữ cái)
   const commonTitleWords = title1Words.filter(word => title2Words.includes(word)).length;

   // Điểm cao hơn cho tên tương tự
   if (commonTitleWords > 0) {
      // Tỷ lệ từ chung trên tổng số từ
      const titleSimilarityRatio = commonTitleWords / Math.max(title1Words.length, title2Words.length);
      score += commonTitleWords * 3 + (titleSimilarityRatio * 5);
   }

   // 2. Điểm cho khoảng giá tương tự (cải tiến)
   const price1 = parseFloat(product1.price);
   const price2 = parseFloat(product2.price);

   // Tính tỷ lệ chênh lệch giá
   const priceDiff = Math.abs(price1 - price2);
   const priceRatio = priceDiff / Math.max(price1, price2);

   // Điểm cao cho sản phẩm có giá gần nhau
   if (priceRatio <= 0.1) { // Giá chênh lệch ≤ 10%
      score += 5;
   } else if (priceRatio <= 0.2) { // Giá chên lệch ≤ 20%
      score += 3;
   } else if (priceRatio <= 0.3) { // Giá chênh lệch ≤ 30%
      score += 1;
   }

   // 3. Điểm cho đánh giá tương tự
   const ratingDiff = Math.abs(product1.rating - product2.rating);
   if (ratingDiff <= 0.5) score += 1;

   return score;
};

export default function ProductPage() {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [products, setProducts] = useState<
      Array<{
         id: number;
         title: string;
         description: string;
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
         reviewCount?: number;
         variants?: Array<{
            detailId: number;
            size: string;
            type: string;
            basePrice: string;
            discountPrice?: string;
            inStock: boolean;
         }>;
      }>
   >([]);
   const [filteredProducts, setFilteredProducts] = useState<
      Array<{
         id: number;
         title: string;
         description: string;
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
         reviewCount?: number; // Added reviewCount property here
         variants?: Array<{
            detailId: number;
            size: string;
            type: string;
            basePrice: string;
            discountPrice?: string;
            inStock: boolean;
         }>;
      }>
   >([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [networkError, setNetworkError] = useState<boolean>(false); // Add network error state
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);
   const [sortOption, setSortOption] = useState<string>('default');

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 24;

   // Thêm state để lưu trữ sản phẩm gốc theo đúng thứ tự ban đầu
   const [originalProducts, setOriginalProducts] = useState<
      Array<{
         id: number;
         title: string;
         description: string;
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
         reviewCount?: number; // Add the reviewCount property here
         variants?: Array<{
            detailId: number;
            size: string;
            type: string;
            basePrice: string;
            discountPrice?: string;
            inStock: boolean;
         }>;
      }>
   >([]);

   // Define price ranges for filtering
   const priceRanges: PriceRange[] = [
      { min: 0, max: 100000, label: 'Dưới 100K' },
      { min: 100000, max: 300000, label: '100K - 300K' },
      { min: 300000, max: 500000, label: '300K - 500K' },
      { min: 500000, max: 1000000, label: '500K - 1 triệu' },
      { min: 1000000, max: Infinity, label: 'Trên 1 triệu' },
   ];

   // Define sorting options
   const sortOptions: SortOption[] = [
      { value: 'default', label: 'Mặc định' },
      { value: 'price-asc', label: 'Giá tăng dần' },
      { value: 'price-desc', label: 'Giá giảm dần' },
      { value: 'name-asc', label: 'Tên A-Z' },
      { value: 'name-desc', label: 'Tên Z-A' },
   ];

   const getPaginatedProducts = () => {
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      return filteredProducts.slice(startIndex, endIndex);
   };

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   // Sửa hàm applyFiltersAndSort để xử lý đúng việc sắp xếp mặc định
   const applyFiltersAndSort = (
      products: Array<{
         id: number;
         title: string;
         description: string;
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
         reviewCount?: number; // Make sure reviewCount is used here
         variants?: Array<{
            detailId: number;
            size: string;
            type: string;
            basePrice: string;
            discountPrice?: string;
            inStock: boolean;
         }>;
      }>,
      originalList: Array<{
         id: number;
         title: string;
         description: string;
         price: string;
         discountPrice?: string;
         rating: number;
         imageUrl: string;
         reviewCount?: number; // Make sure reviewCount is used here
         variants?: Array<{
            detailId: number;
            size: string;
            type: string;
            basePrice: string;
            discountPrice?: string;
            inStock: boolean;
         }>;
      }>,
      query: string,
      priceRange: PriceRange | null,
      sort: string,
   ) => {
      // First filter by search query
      let result;

      // Nếu chọn sắp xếp mặc định, dùng thứ tự ban đầu từ originalProducts
      if (sort === 'default') {
         // Chỉ lọc originalProducts mà không sắp xếp
         result = [...originalList];
      } else {
         // Nếu không phải mặc định, dùng sản phẩm hiện tại
         result = [...products];
      }

      // Áp dụng bộ lọc tìm kiếm
      if (query.trim()) {
         const searchLower = query.toLowerCase();
         result = result.filter((product) => {
            return (
               product.title.toLowerCase().includes(searchLower) ||
               (product.description && product.description.toLowerCase().includes(searchLower))
            );
         });
      }

      // Apply discount filter if selected
      if (priceRange?.hasDiscount === true) {
         result = result.filter((product) => {
            // Check if the product has a discount
            if (product.discountPrice && parseFloat(product.discountPrice) > 0) {
               return true;
            }

            // Check if any variant has a discount
            if (product.variants && product.variants.length > 0) {
               return product.variants.some(
                  (variant) => variant.discountPrice && parseFloat(variant.discountPrice) > 0,
               );
            }

            return false;
         });
      }
      // Áp dụng bộ lọc giá nếu không phải là bộ lọc khuyến mãi
      else if (priceRange && priceRange.min !== undefined && priceRange.max !== undefined) {
         result = result.filter((product) => {
            // Get actual price considering discounts
            const productPrice = product.discountPrice
               ? parseFloat(
                  calculateDiscountedPrice(product.price, product.discountPrice).toString(),
               )
               : parseFloat(product.price);

            return productPrice >= priceRange.min && productPrice <= priceRange.max;
         });
      }

      // Áp dụng sắp xếp (ngoại trừ mặc định)
      if (sort !== 'default') {
         switch (sort) {
            case 'rating-desc':
               result.sort((a, b) => {
                  // First sort by rating (highest first)
                  if (b.rating !== a.rating) {
                     return b.rating - a.rating;
                  }
                  // If ratings are equal, sort by number of reviews (highest first)
                  return (b.reviewCount || 0) - (a.reviewCount || 0);
               });
               break;
            case 'price-asc':
               result.sort((a, b) => {
                  const priceA = a.discountPrice
                     ? calculateDiscountedPrice(a.price, a.discountPrice)
                     : parseFloat(a.price);
                  const priceB = b.discountPrice
                     ? calculateDiscountedPrice(b.price, b.discountPrice)
                     : parseFloat(b.price);
                  return priceA - priceB;
               });
               break;
            case 'price-desc':
               result.sort((a, b) => {
                  const priceA = a.discountPrice
                     ? calculateDiscountedPrice(a.price, a.discountPrice)
                     : parseFloat(a.price);
                  const priceB = b.discountPrice
                     ? calculateDiscountedPrice(b.price, b.discountPrice)
                     : parseFloat(b.price);
                  return priceB - priceA;
               });
               break;
            case 'name-asc':
               result.sort((a, b) => a.title.localeCompare(b.title));
               break;
            case 'name-desc':
               result.sort((a, b) => b.title.localeCompare(a.title));
               break;
         }
      }

      return result;
   };

   // Helper function to calculate discounted price
   const calculateDiscountedPrice = (basePrice: string, discountPercent: string) => {
      const basePriceNum = parseFloat(basePrice);
      const discountPercentNum = parseFloat(discountPercent);

      if (isNaN(discountPercentNum) || discountPercentNum <= 0) return basePriceNum;

      const discountedPrice = basePriceNum * (1 - discountPercentNum / 100);
      return discountedPrice;
   };

   // Replace the existing search useEffect with this combined filtering and sorting useEffect
   useEffect(() => {
      // Reset to first page when filters change
      setCurrentPage(1);

      // Apply filters and sorting
      const newFilteredProducts = applyFiltersAndSort(
         products,
         originalProducts,
         searchQuery,
         selectedPriceRange,
         sortOption,
      );

      setFilteredProducts(newFilteredProducts);
   }, [searchQuery, selectedPriceRange, sortOption, products]);

   // phần xử lý dữ liệu API để lưu sản phẩm gốc
   useEffect(() => {
      const fetchProducts = async () => {
         try {
            setNetworkError(false); // Reset network error state

            // 1. Lấy danh sách sản phẩm cơ bản
            const productsResponse = await fetch(`${HOST}/api/products`);
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            // Chuẩn hóa danh sách sản phẩm
            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // 2. Lấy thêm thông tin về giá
            try {
               // Fetch prices dat
               const pricesResponse = await fetch(`${HOST}/api/v1/prices`, {
                  headers: {
                     Authorization: 'Bearer ' + localStorage.getItem('token'),
                  },
               });
               if (!pricesResponse.ok) {
                  throw new Error('Failed to fetch prices');
               }

               const pricesData: Price[] = await pricesResponse.json();
               console.log('Total prices found:', pricesData.length);

               // 3. Tạo mapping giữa productId và mảng prices
               const productPricesMap: { [productId: number]: Price[] } = {};

               // Nhóm prices theo productId trong product_detail
               pricesData.forEach((price) => {
                  if (price.product_detail && price.product_detail.productId) {
                     const productId = price.product_detail.productId;
                     if (!productPricesMap[productId]) {
                        productPricesMap[productId] = [];
                     }
                     productPricesMap[productId].push(price);
                  }
               });

               console.log(
                  'Product price mappings created for',
                  Object.keys(productPricesMap).length,
                  'products',
               );
               const productIds = normalizedProducts.map((p) => p.id);
               const ratingsMap = await fetchRatingsForProducts(productIds);
               // 4. Xây dựng mảng sản phẩm hiển thị với thông tin giá
               const mappedProducts = await Promise.all(
                  normalizedProducts.map(async (product) => {
                     console.log(`Processing product ${product.id}: ${product.name}`);

                     // Default values
                     let basePrice = '0';
                     let discountPrice: string | undefined = undefined;
                     let variants: Array<{
                        detailId: number;
                        size: string;
                        type: string;
                        basePrice: string;
                        discountPrice?: string;
                        inStock: boolean;
                     }> = [];

                     // Lấy ảnh đầu tiên làm ảnh hiển thị
                     const imageUrl =
                        product.images && product.images.length > 0 ? product.images[0].path : null;

                     // Tìm giá dựa trên productId
                     const productPrices = productPricesMap[product.id] || [];

                     if (productPrices.length > 0) {
                        console.log(
                           `Found ${productPrices.length} prices for product ${product.id}`,
                        );

                        // Tạo variants từ productPrices
                        variants = productPrices.map((price) => {
                           const detail = price.product_detail;
                           return {
                              detailId: detail.id,
                              size: detail.size || 'Default',
                              type: detail.type || 'Standard',
                              basePrice: price.base_price.toString(),
                              discountPrice: price.discount_price
                                 ? price.discount_price.toString()
                                 : undefined,
                              inStock: detail.quantities > 0 && detail.isActive,
                           };
                        });

                        // Sắp xếp theo giá từ thấp đến cao
                        variants.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));

                        // Lấy giá thấp nhất làm giá mặc định
                        if (variants.length > 0) {
                           basePrice = variants[0].basePrice;
                           discountPrice = variants[0].discountPrice;
                        }
                     } else {
                        console.log(`No prices found for product ${product.id} - fetching details`);

                        // Nếu không có giá, thử lấy chi tiết từ API riêng
                        try {
                           const detailResponse = await fetch(`${HOST}/api/products/${product.id}`);
                           if (detailResponse.ok) {
                              const detailData = await detailResponse.json();

                              if (detailData.details && detailData.details.length > 0) {
                                 console.log(
                                    `Found ${detailData.details.length} details from specific API`,
                                 );

                                 // Tìm giá cho từng detail trong details
                                 const detailIds = detailData.details.map(
                                    (d: ProductDetail) => d.id,
                                 );

                                 // Lấy prices cho các detail này từ pricesData
                                 const detailPrices = pricesData.filter(
                                    (price) =>
                                       price.product_detail &&
                                       detailIds.includes(price.product_detail.id),
                                 );

                                 if (detailPrices.length > 0) {
                                    // Tạo variants từ detailPrices
                                    variants = detailPrices.map((price) => {
                                       const detail = price.product_detail;
                                       return {
                                          detailId: detail.id,
                                          size: detail.size || 'Default',
                                          type: detail.type || 'Standard',
                                          basePrice: price.base_price.toString(),
                                          discountPrice: price.discount_price
                                             ? price.discount_price.toString()
                                             : undefined,
                                          inStock: detail.quantities > 0 && detail.isActive,
                                       };
                                    });

                                    // Sắp xếp theo giá từ thấp đến cao
                                    variants.sort(
                                       (a, b) => Number(a.basePrice) - Number(b.basePrice),
                                    );

                                    if (variants.length > 0) {
                                       basePrice = variants[0].basePrice;
                                       discountPrice = variants[0].discountPrice;
                                    }
                                 }
                              }
                           }
                        } catch (detailErr) {
                           console.error(
                              `Error fetching details for product ${product.id}:`,
                              detailErr,
                           );
                        }
                     }
                     try {
                        // Lấy rating từ API (tương tự như trong trang product detail)
                        const ratingResponse = await fetch(`${HOST}/api/rating/get-by-product`, {
                           method: 'POST',
                           headers: {
                              'Content-Type': 'application/json',
                           },
                           body: JSON.stringify({ product_id: product.id }),
                        });

                        if (ratingResponse.ok) {
                           const ratingsData = await ratingResponse.json();
                           if (Array.isArray(ratingsData) && ratingsData.length > 0) {
                              // Tính rating trung bình từ tất cả các đánh giá
                              const totalRating = ratingsData.reduce(
                                 (sum, item) => sum + (item.rating || item.avg_rating || 0),
                                 0,
                              );

                              // Assign directly to ratingsMap instead of unused productRating variable
                              ratingsMap[product.id] = {
                                 rating:
                                    ratingsData.length > 0 ? totalRating / ratingsData.length : 5,
                                 reviewCount: ratingsData.length,
                              };
                           }
                        }
                     } catch (ratingErr) {
                        console.error(`Lỗi khi lấy rating cho sản phẩm ${product.id}:`, ratingErr);
                     }

                     // Inside your product mapping code, modify to include reviewCount:
                     return {
                        id: product.id,
                        title: product.name,
                        description: product.description,
                        price: basePrice,
                        discountPrice: discountPrice,
                        rating: ratingsMap[product.id]?.rating || 0,
                        reviewCount: ratingsMap[product.id]?.reviewCount || 0, // Add reviewCount here
                        imageUrl: imageUrl || '/images/placeholder.jpg',
                        variants: variants.length > 0 ? variants : undefined,
                     };
                  }),
               );

               // Sort the products by rating before setting to state
               mappedProducts.sort((a, b) => {
                  // First sort by rating (highest first)
                  if (b.rating !== a.rating) {
                     return b.rating - a.rating;
                  }
                  // If ratings are equal, sort by number of reviews (highest first)
                  return (b.reviewCount || 0) - (a.reviewCount || 0);
               });

               setOriginalProducts(mappedProducts); // Store sorted products as original list
               setProducts(mappedProducts);
               setFilteredProducts(mappedProducts);
            } catch (priceErr) {
               console.error('Error fetching prices:', priceErr);
               if (priceErr instanceof TypeError && priceErr.message.includes('Failed to fetch')) {
                  setNetworkError(true);
               }
               setError(priceErr instanceof Error ? priceErr.message : 'Failed to fetch prices');
            }
         } catch (err) {
            console.error('Error fetching products:', err);
            // Detect network errors specifically
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
               setNetworkError(true);
            }
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (loading) return;

      const newSortOption = event.target.value;
      setSortOption(newSortOption);

      if (products.length > 0 && originalProducts.length > 0) {
         const productsToSort = newSortOption === 'default' ? originalProducts : products;

         const newFilteredProducts = applyFiltersAndSort(
            productsToSort,
            originalProducts,
            searchQuery,
            selectedPriceRange,
            newSortOption,
         );

         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1);
      }
   };

   // Do the same for price range changes to make them immediate too
   const handlePriceRangeChange = (range: PriceRange | null) => {
      if (loading) return;

      setSelectedPriceRange(range);

      if (products.length > 0 && originalProducts.length > 0) {
         const productsToFilter = sortOption === 'default' ? originalProducts : products;

         const newFilteredProducts = applyFiltersAndSort(
            productsToFilter,
            originalProducts,
            searchQuery,
            range,
            sortOption,
         );

         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1); // Reset to first page when filter changes
      }
   };

   // Modify the search handler similarly
   const handleSearch = (query: string) => {
      if (loading) return;

      // Lưu từ khóa tìm kiếm vào hybridCache
      hybridCache.saveSearchTerm(query);

      setSearchQuery(query);

      if (products.length > 0 && originalProducts.length > 0) {
         const productsToFilter = sortOption === 'default' ? originalProducts : products;
         const newFilteredProducts = applyFiltersAndSort(
            productsToFilter,
            originalProducts,
            query,
            selectedPriceRange,
            sortOption,
         );
         setFilteredProducts(newFilteredProducts);
         setCurrentPage(1);
      }
   };

   // Simplify the useEffect to only respond to changes in base products
   // since we're now handling filtering and sorting directly in handlers
   useEffect(() => {
      if (products.length > 0 && originalProducts.length > 0) {
         const newFilteredProducts = applyFiltersAndSort(
            products,
            originalProducts,
            searchQuery,
            selectedPriceRange,
            sortOption,
         );
         setFilteredProducts(newFilteredProducts);
      }
   }, [products, originalProducts]); // Only depend on products array, not filters/sort

   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
      hybridCache.saveProductView(productId);
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <Head>
            <title>Sản phẩm</title>
            <meta name='description' content='Sản phẩm' />
            <link rel='icon' href='/favicon.ico' />
         </Head>
         <ChatBot />
         <NavBar />

         {/* Wrap the search params usage in Suspense */}
         <Suspense fallback={<div>Loading search results...</div>}>
            <ProductSearch onSearch={handleSearch} />
         </Suspense>

         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>S Ả N P H Ẩ M</p>
            {searchQuery ? (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  KẾT QUẢ TÌM KIẾM: &ldquo;{searchQuery}&rdquo;
               </p>
            ) : (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  TẤT CẢ SẢN PHẨM
               </p>
            )}
         </div>

         {/* Add network error alert message */}
         {networkError && (
            <div className='max-w-7xl mx-auto px-4 mb-6'>
               <div className='bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md'>
                  <div className='flex items-center'>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                     </svg>
                     <div>
                        <p className='text-sm font-medium text-orange-800'>
                           Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn và thử lại.
                        </p>
                        <button
                           onClick={() => window.location.reload()}
                           className='mt-2 text-xs font-medium text-orange-800 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-md transition-colors'
                        >
                           Tải lại trang
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
            {/* Price Filter Sidebar - show/hide on mobile with animation */}
            <div
               className={`lg:w-64 lg:block fixed lg:relative top-0 left-0 h-full lg:h-auto z-40 bg-white lg:bg-transparent shadow-lg lg:shadow-none overflow-y-auto transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                  } px-4 pt-16 lg:pt-0 lg:px-8 mb-6`}
            >
               <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <h3 className='font-medium text-gray-800 mb-3'>Lọc sản phẩm</h3>

                  <div className='mb-5'>
                     <h4 className='text-sm font-medium text-gray-700 mb-2'>Khoảng giá</h4>
                     <div className='space-y-2'>
                        <div className='flex items-center'>
                           <button
                              onClick={() => handlePriceRangeChange(null)}
                              className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === null
                                 ? 'bg-amber-100 text-amber-800'
                                 : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                           >
                              Tất cả
                           </button>
                        </div>

                        {priceRanges.map((range, idx) => (
                           <div key={idx} className='flex items-center'>
                              <button
                                 onClick={() => handlePriceRangeChange(range)}
                                 className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange === range
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                              >
                                 {range.label}
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className='mb-5'>
                     <h4 className='text-sm font-medium text-gray-700 mb-2'>Khuyến mãi</h4>
                     <div className='space-y-2'>
                        <div className='flex items-center'>
                           <button
                              onClick={() =>
                                 handlePriceRangeChange({
                                    min: 0,
                                    max: Infinity,
                                    label: 'Sản phẩm khuyến mãi',
                                    hasDiscount: true,
                                 })
                              }
                              className={`text-sm w-full py-2 px-3 text-left rounded-md transition-colors ${selectedPriceRange?.hasDiscount === true
                                 ? 'bg-amber-100 text-amber-800'
                                 : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                           >
                              Đang giảm giá
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className='flex-1 px-4 lg:px-8'>
               {/* Add sorting dropdown and product count */}
               <div className='flex justify-between items-center mb-6'>
                  <p className='text-sm text-gray-600'>
                     {filteredProducts.length} sản phẩm
                     {searchQuery ? ` cho "${searchQuery}"` : ''}
                     {selectedPriceRange
                        ? selectedPriceRange.hasDiscount
                           ? ' đang được giảm giá'
                           : ` trong khoảng giá ${selectedPriceRange.label}`
                        : ''}
                  </p>

                  <div className='flex items-center'>
                     <label htmlFor='sort' className='text-sm text-gray-600 mr-2'>
                        Sắp xếp:
                     </label>
                     <select
                        id='sort'
                        className='text-sm border rounded-md py-1.5 px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500'
                        value={sortOption}
                        onChange={handleSortChange}
                     >
                        {sortOptions.map((option) => (
                           <option key={option.value} value={option.value}>
                              {option.label}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               {loading && (
                  <div className='flex justify-center items-center h-64'>
                     <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
                  </div>
               )}

               {error && !networkError && (
                  <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center max-w-7xl mx-auto'>
                     {error}
                  </div>
               )}

               {!loading && !error && filteredProducts.length === 0 && (
                  <div className='text-center py-10'>
                     <div>
                        <p className='text-gray-600 mb-4'>
                           Không tìm thấy sản phẩm phù hợp
                           {searchQuery ? ` với "${searchQuery}"` : ''}
                           {selectedPriceRange
                              ? ` trong khoảng giá ${selectedPriceRange.label}`
                              : ''}
                        </p>
                        <button
                           className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'
                           onClick={() => {
                              setSearchQuery('');
                              setSelectedPriceRange(null);
                              setSortOption('default');
                           }}
                        >
                           Xem tất cả sản phẩm
                        </button>
                     </div>
                  </div>
               )}

               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {getPaginatedProducts().map((product) => (
                     <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description || ''}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        rating={product.rating}
                        reviewCount={product.reviewCount || 0}
                        imageUrl={product.imageUrl}
                        variants={product.variants}
                        onViewDetail={handleViewDetail}
                     />
                  ))}
               </div>

               {/* Phân trang */}
               {!loading && !error && filteredProducts.length > productsPerPage && (
                  <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                           key={page}
                           className={`px-3 py-1 ${currentPage === page ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                              } rounded-md text-gray-700`}
                           onClick={() => setCurrentPage(page)}
                        >
                           {page}
                        </button>
                     ))}
                  </div>
               )}

               {/* Thêm component khuyến nghị sau kết quả tìm kiếm/danh sách sản phẩm */}
               {filteredProducts.length > 0 && (
                  <RecommendedProducts
                     allProducts={originalProducts}
                     currentSearchTerm={searchQuery}
                     onViewDetail={handleViewDetail} // Thêm prop này
                  />
               )}
            </div>
         </div>

         {/* Add a semi-transparent overlay when sidebar is open on mobile */}
         {isSidebarOpen && (
            <div
               className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden'
               onClick={() => setIsSidebarOpen(false)}
            />
         )}

         <Footer />
      </div>
   );

}
