'use client';

import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Eye, Menu, X, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage | ProductImage[];
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

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 25;

   const getPaginatedProducts = () => {
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      return filteredProducts.slice(startIndex, endIndex);
   };

   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

   const searchParams = useSearchParams();
   const searchQuery = searchParams.get('search') || '';

   useEffect(() => {
      const fetchProducts = async () => {
         try {
            const productsResponse = await fetch('http://localhost:3000/api/products');
            if (!productsResponse.ok) {
               throw new Error('Failed to fetch products');
            }
            const productsData: Product[] = await productsResponse.json();

            const normalizedProducts = productsData.map((product) => ({
               ...product,
               images: Array.isArray(product.images) ? product.images : [product.images],
            }));

            console.log('Normalized Products data:', normalizedProducts);

            normalizedProducts.forEach((product, index) => {
               console.log(`Product ${index}: ${product.name}`);
               console.log(`  - Has images:`, product.images.length > 0);
               if (product.images && product.images.length > 0) {
                  console.log(`  - First image path:`, product.images[0].path);
               }
            });

            try {
               const pricesResponse = await fetch('http://localhost:3000/api/v1/prices', {
                  headers: {
                     Authorization: 'Bearer ' + localStorage.getItem('token'),
                  },
               });
               if (!pricesResponse.ok) {
                  console.warn('Could not fetch prices, using default values');
                  const mappedProducts = normalizedProducts.map((product) => {
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
                  setFilteredProducts(mappedProducts);
                  return;
               }

               const pricesData: Price[] = await pricesResponse.json();

               console.log("Price data structure:", pricesData.length > 0 ? pricesData[0] : "No prices");

               const mappedProducts = normalizedProducts.map((product) => {
                  console.log(`Mapping product ${product.id}: ${product.name}`);

                  const imageUrl =
                     product.images && product.images.length > 0 ? product.images[0].path : null;
                  console.log(`  - Image path:`, imageUrl);


                  const productPrices = pricesData.filter((price) => {
                     if (!price.product_detail) return false;


                     return price.product_detail && price.product_detail.id;
                  });

                  console.log(`  - Found ${productPrices.length} prices for product`);

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

                     console.log(`  - Selected base price: ${basePrice}`);
                     console.log(`  - Selected discount price: ${discountPrice || 'None'}`);
                  }

                  console.log(`  - Final imageUrl:`, imageUrl || '/images/placeholder.jpg');

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
               setFilteredProducts(mappedProducts);
            } catch (priceErr) {
               console.warn('Error fetching prices:', priceErr);
               const mappedProducts = normalizedProducts.map((product) => ({
                  id: product.id,
                  title: product.name,
                  description: product.description,
                  price: '0',
                  rating: 4.5,
                  imageUrl: product.images?.[0]?.path || '/images/placeholder.jpg',
               }));
               setProducts(mappedProducts);
               setFilteredProducts(mappedProducts);
            }
         } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
         } finally {
            setLoading(false);
         }
      };

      fetchProducts();
   }, []);

   useEffect(() => {
      if (!searchQuery.trim()) {
         setFilteredProducts(products);
         return;
      }

      const filtered = products.filter(product => {
         const searchLower = searchQuery.toLowerCase();
         return (
            product.title.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower))
         );
      });

      setFilteredProducts(filtered);
   }, [searchQuery, products]);

   const handleViewDetail = (productId: number) => {
      console.log('View detail clicked for product ID:', productId);
   };

   return (
      <div className='bg-[#F1EEE9] min-h-screen'>
         <NavBar />
         <div className='px-4 lg:px-0 py-8'>
            <p className='text-center text-[#555659] text-lg font-mont'>S Ả N P H Ẩ M</p>
            {searchQuery ? (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  KẾT QUẢ TÌM KIẾM: "{searchQuery}"
               </p>
            ) : (
               <p className='text-center font-mont font-semibold text-xl lg:text-3xl pb-4'>
                  TẤT CẢ SẢN PHẨM
               </p>
            )}
         </div>

         <button
            className='lg:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-md'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         <div className='flex flex-col lg:flex-row max-w-7xl mx-auto'>
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

               {!loading && !error && filteredProducts.length === 0 && (
                  <div className='text-center py-10'>
                     {searchQuery ? (
                        <div>
                           <p className='text-gray-600 mb-4'>Không tìm thấy sản phẩm phù hợp với "{searchQuery}"</p>
                           <Link href='/user/products'>
                              <button className='px-6 py-2 bg-amber-100 hover:bg-amber-200 text-[#553C26] rounded-md transition-colors'>
                                 Xem tất cả sản phẩm
                              </button>
                           </Link>
                        </div>
                     ) : (
                        <p className='text-gray-500'>Không có sản phẩm nào</p>
                     )}
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
                        imageUrl={product.imageUrl}
                        variants={product.variants}
                        onViewDetail={handleViewDetail}
                     />
                  ))}
               </div>

               {!loading && !error && filteredProducts.length > productsPerPage && !searchQuery && (
                  <div className='flex justify-center items-center gap-2 mt-8 pb-8'>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                           key={page}
                           className={`px-3 py-1 ${currentPage === page
                                 ? 'bg-gray-200 font-medium'
                                 : 'hover:bg-gray-100'
                              } rounded-md text-gray-700`}
                           onClick={() => setCurrentPage(page)}
                        >
                           {page}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <Footer />
      </div>
   );
}
