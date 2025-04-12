'use client';

import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Eye, Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/app/components/user/nav/page';
import Footer from '@/app/components/user/footer/page';

interface ProductImage {
   id: string;
   path: string;
   public_id: string;
}

interface ProductDetail {
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

interface Category {
   id: number;
   name: string;
   description: string;
}

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage | ProductImage[];
   category_id?: number;
   categories?: Category[];
}

interface ProductCardProps {
   title: string;
   description: string;
   price: string;
   discountPrice?: string;
   rating: number;
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
   onAddToCart,
}: ProductCardProps & { id: number }) => {
   const renderStars = () => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 0; i < fullStars; i++) {
         stars.push(<Star key={`star-${i}`} className='w-4 h-4 fill-yellow-400 text-yellow-400' />);
      }

      if (hasHalfStar) {
         stars.push(
            <StarHalf key='half-star' className='w-4 h-4 fill-yellow-400 text-yellow-400' />,
         );
      }

      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
         stars.push(<Star key={`empty-star-${i}`} className='w-4 h-4 text-yellow-400' />);
      }

      return stars;
   };

   const formatPrice = (value: string) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   };

   return (
      <div className='rounded-lg bg-white p-3 shadow-lg hover:shadow-md transition-shadow'>
         <div className='relative aspect-square overflow-hidden rounded-lg group'>
            <Image
               src={imageUrl}
               alt={title}
               height={400}
               width={400}
               className='h-full w-full object-cover transition-all duration-300 group-hover:blur-sm'
            />
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
               <button
                  onClick={() => onAddToCart && onAddToCart(id, variants?.[0]?.detailId)}
                  className='bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-200 border border-black'
               >
                  <ShoppingCart className='w-4 h-4' />
                  <span>Thêm vào giỏ</span>
               </button>
            </div>
         </div>
         <div className='mt-3'>
            <h3 className='text-sm font-medium text-gray-700 mb-1'>{title}</h3>
            <p className='text-xs text-gray-500 line-clamp-2 mb-1'>{description}</p>
            <div className='flex items-center'>{renderStars()}</div>
            <div className='mt-1'>
               {discountPrice ? (
                  <div className='flex items-center gap-2'>
                     <p className='text-sm font-medium text-red-600'>
                        {formatPrice(discountPrice)}đ
                     </p>
                     <p className='text-xs text-gray-500 line-through'>{formatPrice(price)}đ</p>
                  </div>
               ) : (
                  <p className='text-sm font-medium text-red-600'>{formatPrice(price)}đ</p>
               )}
            </div>
         </div>
      </div>
   );
};

export default function ScentsPage() {
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
   const [categoryName, setCategoryName] = useState<string>('Phụ Kiện Nến');
   const [categoryId, setCategoryId] = useState<number | null>(null);

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const response = await fetch('http://68.183.226.198:3000/api/categories');
            
            let categoriesData;
            
            if (response.status === 302) {
               // Handle 302 redirect - extract data from the response if possible
               const responseText = await response.text();
               
               if (responseText.includes('[') && responseText.includes(']')) {
                  const jsonStart = responseText.indexOf('[');
                  const jsonEnd = responseText.lastIndexOf(']') + 1;
                  const jsonString = responseText.substring(jsonStart, jsonEnd);
                  
                  try {
                     categoriesData = JSON.parse(jsonString);
                     console.log('Extracted categories from 302 response text:', categoriesData);
                  } catch (error) {
                     console.error('Failed to parse categories from 302 response:', error);
                     throw new Error('Không thể xử lý dữ liệu danh mục từ máy chủ');
                  }
               }
            } else if (!response.ok) {
               const errorText = await response.text();
               
               if (errorText.includes('[') && errorText.includes(']')) {
                  const jsonStart = errorText.indexOf('[');
                  const jsonEnd = errorText.lastIndexOf(']') + 1;
                  const jsonString = errorText.substring(jsonStart, jsonEnd);
                  
                  try {
                     categoriesData = JSON.parse(jsonString);
                  } catch (error) {
                     console.error('Failed to parse categories from error response:', error);
                     throw new Error(`Không thể tải danh mục sản phẩm: ${errorText}`);
                  }
               } else {
                  throw new Error(`Không thể tải danh mục sản phẩm: ${response.status}`);
               }
            } else {
               categoriesData = await response.json();
            }
            
            if (Array.isArray(categoriesData)) {
               console.log('All categories:', categoriesData.map(c => c.name).join(', '));
               
               // First, try to find an exact match for accessories
               // Using popular variations of "Phụ Kiện Nến" in Vietnamese
               const accessoriesKeywords = [
                  'phụ kiện nến', 
                  'phụ kiện', 
                  'accessories', 
                  'candle accessories',
                  'đế nến',
                  'giá đỡ nến',
                  'đèn nến'
               ];
               
               let accessoriesCategory = null;
               
               // Look for exact matches first
               for (const keyword of accessoriesKeywords) {
                  accessoriesCategory = categoriesData.find(cat => 
                     cat.name && cat.name.trim().toLowerCase() === keyword
                  );
                  if (accessoriesCategory) break;
               }
               
               // If no exact match, look for categories containing these keywords
               if (!accessoriesCategory) {
                  for (const keyword of accessoriesKeywords) {
                     accessoriesCategory = categoriesData.find(cat => 
                        cat.name && cat.name.toLowerCase().includes(keyword)
                     );
                     if (accessoriesCategory) break;
                  }
               }
               
               if (accessoriesCategory) {
                  console.log('Found accessories category:', accessoriesCategory.name, 'with ID:', accessoriesCategory.id);
                  setCategoryId(accessoriesCategory.id);
                  setCategoryName(accessoriesCategory.name);
               } else {
                  console.log('No accessories category found, using default name');
                  // Keep the default name
               }
            }
         } catch (error) {
            console.error('Error fetching categories:', error);
            // Continue with default category name
         }
      };
      
      fetchCategories();
   }, []);

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            // Fetch all products first
            const productsResponse = await fetch('http://68.183.226.198:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            // Normalize product data
            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            // Filter products specifically for accessories category
            let filteredProducts = normalizedProducts;
            
            if (categoryId) {
               // Filter by exact category ID match (primary filtering)
               filteredProducts = normalizedProducts.filter(product => 
                  product.category_id === categoryId ||
                  product.categories?.some(cat => cat.id === categoryId)
               );
            } else {
               // Fallback filtering by name if no category ID is found
               const accessoriesKeywords = [
                  'phụ kiện', 
                  'accessories', 
                  'đế nến', 
                  'giá đỡ', 
                  'holder', 
                  'stand', 
                  'đèn nến',
                  'dụng cụ'
               ];
               
               filteredProducts = normalizedProducts.filter(product => {
                  // Check if product name or description contains keywords related to accessories
                  const nameMatches = product.name && 
                     accessoriesKeywords.some(keyword => 
                        product.name.toLowerCase().includes(keyword.toLowerCase())
                     );
                  
                  // Check if product description contains keywords related to accessories
                  const descMatches = product.description && 
                     accessoriesKeywords.some(keyword => 
                        product.description.toLowerCase().includes(keyword.toLowerCase())
                     );
                  
                  // Check if product belongs to a category with accessories-related name
                  const categoryMatches = product.categories?.some(cat => 
                     cat.name && accessoriesKeywords.some(keyword => 
                        cat.name.toLowerCase().includes(keyword.toLowerCase())
                     )
                  );
                  
                  return nameMatches || descMatches || categoryMatches;
               });
            }

            console.log(`Found ${filteredProducts.length} accessories products in category ${categoryName}`);

            try {
               const pricesResponse = await fetch('http://68.183.226.198:3000/api/v1/prices', {
                  headers: {
                     Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
                  },
               });
               
               if (!pricesResponse.ok) {
                  console.warn('Could not fetch prices, using default values');
                  const mappedProducts = filteredProducts.map((product) => {
                     const imageUrl =
                        product.images && product.images.length > 0 ? product.images[0].path : null;

                     return {
                        id: product.id,
                        title: product.name,
                        description: product.description,
                        price: '0',
                        rating: 4.5,
                        imageUrl: imageUrl || '/images/placeholder.jpg',
                     };
                  });
                  setProducts(mappedProducts);
                  setLoading(false);
                  return;
               }

               const pricesData: Price[] = await pricesResponse.json();

               const mappedProducts = filteredProducts.map((product) => {
                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;

                  const productPrices = pricesData.filter((price) => {
                     if (!price.product_detail) return false;
                     return price.product_detail && price.product_detail.id;
                  });

                  let basePrice = '0';
                  let discountPrice: string | undefined = undefined;

                  if (productPrices.length > 0) {
                     productPrices.sort((a, b) => Number(a.base_price) - Number(b.base_price));
                     basePrice = productPrices[0].base_price.toString();

                     const discountPrices = productPrices
                        .filter(price => price.discount_price && Number(price.discount_price) > 0)
                        .sort((a, b) => Number(a.discount_price) - Number(b.discount_price));

                     if (discountPrices.length > 0) {
                        discountPrice = discountPrices[0].discount_price.toString();
                     }
                  }

                  const variants = productPrices.map(price => {
                     const detail = price.product_detail;
                     return {
                        detailId: detail.id,
                        size: detail.size,
                        type: detail.type,
                        basePrice: price.base_price.toString(),
                        discountPrice: price.discount_price ? price.discount_price.toString() : undefined,
                        inStock: detail.quantities > 0 && detail.isActive
                     };
                  });

                  return {
                     id: product.id,
                     title: product.name,
                     description: product.description,
                     price: basePrice,
                     discountPrice: discountPrice,
                     rating: 4.5,
                     imageUrl: imageUrl || '/images/placeholder.jpg',
                     variants: variants
                  };
               });

               setProducts(mappedProducts);
            } catch (priceErr) {
               console.warn('Error fetching prices:', priceErr);
               const mappedProducts = filteredProducts.map((product) => ({
                  id: product.id,
                  title: product.name,
                  description: product.description,
                  price: '0',
                  rating: 4.5,
                  imageUrl: product.images?.[0]?.path || '/images/placeholder.jpg',
               }));
               setProducts(mappedProducts);
            }
         } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, [categoryId, categoryName]);

   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
   };

   const handleAddToCart = (productId: number, detailId?: number) => {
      console.log('Add to cart clicked for product ID:', productId, 'Detail ID:', detailId);

      // Find the product in the list
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Find either the specified variant or use the first one
      const variant = detailId
         ? product.variants?.find(v => v.detailId === detailId)
         : product.variants?.[0];

      if (!variant) {
         // If no variant exists, use main product info
         const cartItem = {
            productId: product.id,
            name: product.title,
            price: product.discountPrice || product.price,
            quantity: 1,
            imageUrl: product.imageUrl
         };

         // Add to localStorage or your cart logic
         const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
         cartItems.push(cartItem);
         localStorage.setItem('cart', JSON.stringify(cartItems));

         alert('Đã thêm sản phẩm vào giỏ hàng!');
      } else {
         // If variant exists
         const cartItem = {
            productId: product.id,
            name: product.title,
            detailId: variant.detailId,
            size: variant.size,
            type: variant.type,
            price: variant.discountPrice || variant.basePrice,
            quantity: 1,
            imageUrl: product.imageUrl
         };

         // Add to localStorage or your cart logic
         const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
         cartItems.push(cartItem);
         localStorage.setItem('cart', JSON.stringify(cartItems));

         alert('Đã thêm sản phẩm vào giỏ hàng!');
      }
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <NavBar />
         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>S Ả N P H Ẩ M</p>
            <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>{categoryName}</p>
         </div>

         {/* Mobile menu button */}
         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
           
            {/* Main content */}
            <div className='flex-1 px-4 lg:px-8'>
               {loading && (
                  <div className='flex justify-center items-center h-64'>
                     <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
                  </div>
               )}

               {error && (
                  <div className='bg-red-50 text-red-700 p-4 rounded-md my-4 text-center'>
                     {error}
                  </div>
               )}

               {!loading && !error && products.length === 0 && (
                  <div className='text-center py-10'>
                     <p className='text-gray-500 mb-2'>Không tìm thấy phụ kiện nến nào trong danh mục này</p>
                     <p className='text-sm text-gray-400'>Các sản phẩm mới sẽ sớm được cập nhật</p>
                  </div>
               )}

               <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {products.map((product) => (
                     <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description || ''}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        rating={product.rating}
                        imageUrl={product.imageUrl}
                        variants={product.variants}
                        onViewDetail={handleViewDetail}
                        onAddToCart={handleAddToCart}
                     />
                  ))}
               </div>

               {!loading && !error && products.length > 0 && (
                  <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                     <button className='px-3 py-1 bg-gray-200 rounded-md text-gray-700 font-medium'>
                        1
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        2
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        3
                     </button>
                     <button className='px-3 py-1 hover:bg-gray-100 rounded-md text-gray-700'>
                        4
                     </button>
                  </div>
               )}
            </div>
         </div>

         <Footer />
      </div>
   );
}