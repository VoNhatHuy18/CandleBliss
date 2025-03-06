'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

interface ProductDetailClientProps {
   productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
   const router = useRouter();
   const [product, setProduct] = useState<Product | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchProductDetails = async () => {
         try {
            setLoading(true);
            setError(null);

            // Fetch product basic info
            const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
            if (!productResponse.ok) {
               console.error('Product API Error:', await productResponse.text());
               throw new Error('Không thể tải thông tin sản phẩm');
            }
            const productData = await productResponse.json();

            // Fetch product details từ endpoint mới
            const detailsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-details/product/${productId}`);
            if (!detailsResponse.ok) {
               console.error('Details API Error:', await detailsResponse.text());
               throw new Error('Không thể tải chi tiết sản phẩm');
            }
            const detailsData = await detailsResponse.json();

            // Log response data for debugging
            console.log('Product Data:', productData);
            console.log('Details Data:', detailsData);

            // Combine all data with safe checks
            const fullProductData = {
               ...productData,
               details: Array.isArray(detailsData) ? detailsData : [detailsData].filter(Boolean),
            };

            setProduct(fullProductData);
            console.log('Full Product Data:', fullProductData);
         } catch (err) {
            console.error('Detailed Error:', err);
            setError(err instanceof Error ? err.message : 'Không thể tải thông tin sản phẩm');
            setProduct(null);
         } finally {
            setLoading(false);
         }
      };

      fetchProductDetails();
   }, [productId]);

   if (loading) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
         </div>
      );
   }

   if (!product) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="text-red-500">{error}</div>
         </div>
      );
   }

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSideBar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />

            <main className='flex-1 p-6 overflow-auto'>
               <div className='max-w-4xl mx-auto'>
                  <div className='bg-white rounded-lg shadow p-6'>
                     <h2 className='text-xl font-semibold mb-6'>Thông tin chi tiết</h2>

                     {/* Thông tin cơ bản */}
                     <div className='space-y-4 mb-6'>
                        <div>
                           <label className='block text-sm font-medium mb-1'>Tên sản phẩm *</label>
                           <input
                              type='text'
                              value={product.name}
                              readOnly
                              className='w-full p-2 border rounded-md bg-gray-50'
                           />
                        </div>
                        <div>
                           <label className='block text-sm font-medium mb-1'>Mô tả *</label>
                           <textarea
                              value={product.description}
                              readOnly
                              rows={3}
                              className='w-full p-2 border rounded-md bg-gray-50'
                           />
                        </div>
                        <div>
                           <label className='block text-sm font-medium mb-1'>Hình đại diện sản phẩm *</label>
                           <div className='flex gap-4'>
                              {/* {product.images.map((image, index) => (
                                 <div key={index} className='relative w-24 h-24 rounded-lg overflow-hidden'>
                                    <Image
                                       src={image.path}
                                       alt={`Product ${index + 1}`}
                                       fill
                                       className='object-cover'
                                    />
                                 </div>
                              ))} */}
                           </div>
                        </div>
                        <div>
                           <label className='block text-sm font-medium mb-1'>Video sản phẩm</label>
                           {product.video && (
                              <input
                                 type='text'
                                 value={product.video}
                                 readOnly
                                 className='w-full p-2 border rounded-md bg-gray-50'
                              />
                           )}
                        </div>
                     </div>

                     {/* Thông tin chi tiết sản phẩm */}
                     <div className='mb-6'>
                        <h3 className='text-lg font-medium mb-4'>Thông tin chi tiết sản phẩm</h3>
                        <div className='space-y-4'>
                           {/* {product.details.map((variant, index) => (
                              <div key={index} className='border rounded-lg p-4'>
                                 <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                       <label className='block text-sm font-medium mb-1'>Phân loại</label>
                                       <input
                                          type='text'
                                          value={variant.type}
                                          readOnly
                                          className='w-full p-2 border rounded-md bg-gray-50'
                                       />
                                    </div>
                                    <div>
                                       <label className='block text-sm font-medium mb-1'>Size</label>
                                       <input
                                          type='text'
                                          value={variant.size}
                                          readOnly
                                          className='w-full p-2 border rounded-md bg-gray-50'
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className='block text-sm font-medium mb-1'>Số lượng</label>
                                    <input
                                       type='number'
                                       value={variant.quantities}
                                       readOnly
                                       className='w-full p-2 border rounded-md bg-gray-50'
                                    />
                                 </div>
                              </div>
                           ))} */}
                        </div>
                     </div>

                     {/* Các giá của sản phẩm */}
                     <div className='mb-6'>
                        <h3 className='text-lg font-medium mb-4'>Các giá của sản phẩm</h3>
                        <div className='space-y-4'>
                           <div>
                              <label className='block text-sm font-medium mb-1'>Khuyến mãi</label>
                              <input
                                 type='text'
                                 value="Giảm 40%"
                                 readOnly
                                 className='w-full p-2 border rounded-md bg-gray-50'
                              />
                           </div>
                           <div>
                              <label className='block text-sm font-medium mb-1'>Giá bán</label>
                              <div className='flex items-center gap-2'>
                                 <input
                                    type='text'
                                    value="100,000"
                                    readOnly
                                    className='flex-1 p-2 border rounded-md bg-gray-50'
                                 />
                                 <span>VND</span>
                              </div>
                           </div>
                           <div>
                              <label className='block text-sm font-medium mb-1'>Ngày bắt đầu</label>
                              <input
                                 type='date'
                                 value="2024-01-01"
                                 readOnly
                                 className='w-full p-2 border rounded-md bg-gray-50'
                              />
                           </div>
                           <div>
                              <label className='block text-sm font-medium mb-1'>Ngày kết thúc</label>
                              <input
                                 type='date'
                                 value="2024-12-31"
                                 readOnly
                                 className='w-full p-2 border rounded-md bg-gray-50'
                              />
                           </div>
                           <div>
                              <label className='block text-sm font-medium mb-1'>Giá thành bán</label>
                              <div className='flex items-center gap-2'>
                                 <input
                                    type='text'
                                    value="60,000"
                                    readOnly
                                    className='flex-1 p-2 border rounded-md bg-gray-50'
                                 />
                                 <span>VND</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className='flex justify-end space-x-4'>
                        <button
                           onClick={() => router.back()}
                           className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
                        >
                           Quay lại
                        </button>
                        <button
                           onClick={() => router.push(`/seller/products/edit/${productId}`)}
                           className='px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600'
                        >
                           Chỉnh sửa
                        </button>
                     </div>
                  </div>
               </div>
            </main>
         </div>
      </div>
   );
} 