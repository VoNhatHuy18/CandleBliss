// Fixed page component for product detail
'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

// Define correct props interface for App Router
interface ProductDetailPageProps {
   params: {
      productId: string;
   };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
   const { productId } = params;
   const [product, setProduct] = useState<any>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      async function fetchProductDetails() {
         try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
               setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
               return;
            }

            // Fetch product data
            const productResponse = await fetch(`http://localhost:3000/api/products/${productId}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });

            if (!productResponse.ok) {
               throw new Error(`Failed to fetch product: ${productResponse.status}`);
            }

            const productData = await productResponse.json();

            // Fetch product details
            const detailsResponse = await fetch(
               `http://localhost:3000/api/product-details/product/${productId}`,
               {
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               },
            );

            if (detailsResponse.ok) {
               const detailsData = await detailsResponse.json();

               // Process details
               const details = Array.isArray(detailsData) ? detailsData : [detailsData];

               // Set product with details
               setProduct({
                  ...productData,
                  details,
               });
            } else {
               setProduct(productData);
            }
         } catch (err) {
            console.error('Error fetching product details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load product details');
         } finally {
            setLoading(false);
         }
      }

      fetchProductDetails();
   }, [productId]);

   if (loading) {
      return (
         <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
               <Header />
               <main className='flex-1 p-6 overflow-auto'>
                  <div className='w-full h-40 flex items-center justify-center'>
                     <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500'></div>
                  </div>
               </main>
            </div>
         </div>
      );
   }

   if (error || !product) {
      return (
         <div className='flex h-screen bg-gray-50'>
            <MenuSideBar />
            <div className='flex-1 flex flex-col overflow-hidden'>
               <Header />
               <main className='flex-1 p-6 overflow-auto'>
                  <div className='bg-red-50 text-red-800 p-4 rounded-lg mb-6'>
                     {error || 'Không tìm thấy sản phẩm'}
                  </div>
               </main>
            </div>
         </div>
      );
   }

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSideBar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 p-6 overflow-auto'>
               <h1 className='text-2xl font-semibold text-gray-800 mb-6'>Chi tiết sản phẩm</h1>

               {/* Render your product details here */}
               <div className='bg-white rounded-lg shadow p-6'>
                  <h2 className='text-xl font-bold'>{product.name}</h2>
                  <p className='text-gray-600 mt-2'>{product.description}</p>

                  {/* Add the rest of your product detail UI */}
               </div>
            </main>
         </div>
      </div>
   );
}
