'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MenuSideBar from '@/app/components/seller/menusidebar/page';
import Header from '@/app/components/seller/header/page';

// Định nghĩa các interface
interface Image {
   id: string;
   path: string;
   public_id: string;
}

interface ProductDetail {
   id: number;
   size: string;
   type: string;
   quantities: number;
   images: Image[];
   product?: any;
   isActive: boolean;
}

interface Price {
   id: number;
   base_price: number;
   discount_price: number;
   product_detail: {
      id: number;
      productId: number;
   };
}

interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: Image | Image[];
   details?: ProductDetail[];
   pricing?: Price[];
}

interface ProductViewModel extends Product {
   details: ProductDetail[];
   pricing: Price[];
}

// Format price helper function
const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
   }).format(price);
};

// ProductTable Component
const ProductTable = ({
   products,
   loading,
   fetchAllProductData
}: {
   products: ProductViewModel[],
   loading: boolean,
   fetchAllProductData: () => Promise<void>
}) => {
   const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

   const toggleProductDetails = (productId: number) => {
      if (expandedProduct === productId) {
         setExpandedProduct(null);
      } else {
         setExpandedProduct(productId);
      }
   };

   // Tính toán các thông tin hiển thị cho từng sản phẩm
   const getProductDisplayInfo = (product: ProductViewModel) => {
      // Tính tổng số lượng
      const totalQuantity = product.details?.reduce((sum, detail) => {
         return sum + (detail?.quantities !== undefined ? Number(detail.quantities) : 0);
      }, 0) || 0;

      // Tìm giá thấp nhất và cao nhất
      let minPrice = Infinity;
      let maxPrice = 0;
      let minDiscountPrice = Infinity;
      let hasDiscount = false;

      product.pricing?.forEach(price => {
         if (price.base_price < minPrice) minPrice = price.base_price;
         if (price.base_price > maxPrice) maxPrice = price.base_price;

         if (price.discount_price > 0 && price.discount_price < price.base_price) {
            hasDiscount = true;
            if (price.discount_price < minDiscountPrice) {
               minDiscountPrice = price.discount_price;
            }
         }
      });

      // Kiểm tra trạng thái hoạt động
      const isActive = product.details?.some(detail => detail.isActive) || false;

      return {
         totalQuantity,
         minPrice: minPrice === Infinity ? 0 : minPrice,
         maxPrice,
         minDiscountPrice: minDiscountPrice === Infinity ? 0 : minDiscountPrice,
         hasDiscount,
         isActive
      };
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
         </div>
      );
   }

   if (products.length === 0) {
      return (
         <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Không có sản phẩm nào được tìm thấy.</p>
         </div>
      );
   }

   return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
         {/* Table header */}
         <div className="grid grid-cols-12 bg-gray-50 p-4 font-medium text-gray-600 border-b">
            <div className="col-span-4">Sản phẩm</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Giá</div>
            <div className="col-span-2 text-center">Trạng thái</div>
            <div className="col-span-2 text-center">Thao tác</div>
         </div>

         {/* Table body */}
         <div>
            {products.map((product) => {
               const { totalQuantity, minPrice, maxPrice, minDiscountPrice, hasDiscount, isActive } = getProductDisplayInfo(product);
               const mainImage = Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0].path
                  : '/images/placeholder.png';

               return (
                  <div key={product.id} className="border-b last:border-b-0">
                     {/* Main product row */}
                     <div className="grid grid-cols-12 items-center p-4 hover:bg-gray-50">
                        <div className="col-span-4">
                           <div className="flex items-center space-x-3">
                              <button
                                 onClick={() => toggleProductDetails(product.id)}
                                 className="text-gray-500 hover:text-amber-600"
                              >
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 transition-transform ${expandedProduct === product.id ? 'rotate-90' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                 </svg>
                              </button>

                              <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                 <Image
                                    src={mainImage}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover object-center"
                                    onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.src = '/images/placeholder.png';
                                    }}
                                 />
                              </div>

                              <div>
                                 <div className="font-medium text-gray-800">{product.name}</div>
                                 <div className="text-sm text-gray-500">
                                    {product.details?.length || 0} biến thể
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="col-span-2 text-center">
                           <span className={`${totalQuantity === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                              {totalQuantity}
                           </span>
                        </div>

                        <div className="col-span-2 text-center">
                           {hasDiscount ? (
                              <div>
                                 <span className="line-through text-gray-400 text-sm">
                                    {formatPrice(minPrice)}
                                 </span>
                                 <div className="text-red-500">
                                    {formatPrice(minDiscountPrice)}
                                 </div>
                              </div>
                           ) : (
                              <div className="text-gray-700">
                                 {minPrice === maxPrice
                                    ? formatPrice(minPrice)
                                    : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                              </div>
                           )}
                        </div>

                        <div className="col-span-2 text-center">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
                              {isActive ? 'Hoạt động' : 'Không hoạt động'}
                           </span>
                        </div>

                        <div className="col-span-2 text-center">
                           <div className="flex justify-center space-x-2">
                              <Link
                                 href={`/seller/products/${product.id}/edit`}
                                 className="text-amber-600 hover:text-amber-800"
                              >
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                 </svg>
                              </Link>

                              <button
                                 className="text-red-600 hover:text-red-800"
                                 onClick={async () => {
                                    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                                       try {
                                          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                                          if (!token) {
                                             alert('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                                             return;
                                          }

                                          // Trước tiên, xóa tất cả chi tiết sản phẩm
                                          if (product.details && product.details.length > 0) {
                                             // Hiển thị thông báo loading
                                             const loadingToast = document.createElement('div');
                                             loadingToast.className = 'fixed top-4 right-4 bg-amber-100 text-amber-700 p-4 rounded shadow-lg z-50';
                                             loadingToast.textContent = 'Đang xóa sản phẩm...';
                                             document.body.appendChild(loadingToast);

                                             // Xóa các mục liên quan
                                             console.log(`Deleting product ${product.id} and all related items...`);

                                             // Bước 1: Xóa giá cho mỗi chi tiết
                                             for (const detail of product.details) {
                                                // Tìm tất cả giá liên quan đến chi tiết này
                                                const relatedPrices = product.pricing.filter(
                                                   price => price.product_detail.id === detail.id
                                                );

                                                // Xóa từng giá
                                                for (const price of relatedPrices) {
                                                   const priceResponse = await fetch(`http://localhost:3000/api/v1/prices/${price.id}`, {
                                                      method: 'DELETE',
                                                      headers: {
                                                         'Authorization': `Bearer ${token}`,
                                                         'Content-Type': 'application/json'
                                                      }
                                                   });

                                                   if (!priceResponse.ok) {
                                                      console.error(`Failed to delete price ${price.id} with status:`, priceResponse.status);
                                                   } else {
                                                      console.log(`Successfully deleted price ${price.id}`);
                                                   }
                                                }

                                                // Bước 2: Xóa chi tiết sản phẩm
                                                const detailResponse = await fetch(`http://localhost:3000/api/product-details/${detail.id}`, {
                                                   method: 'DELETE',
                                                   headers: {
                                                      'Authorization': `Bearer ${token}`,
                                                      'Content-Type': 'application/json'
                                                   }
                                                });

                                                if (!detailResponse.ok) {
                                                   console.error(`Failed to delete product detail ${detail.id} with status:`, detailResponse.status);
                                                } else {
                                                   console.log(`Successfully deleted product detail ${detail.id}`);
                                                }
                                             }
                                          }

                                          // Bước 3: Cuối cùng xóa sản phẩm chính
                                          const productResponse = await fetch(`http://localhost:3000/api/products/${product.id}`, {
                                             method: 'DELETE',
                                             headers: {
                                                'Authorization': `Bearer ${token}`,
                                                'Content-Type': 'application/json'
                                             }
                                          });

                                          if (!productResponse.ok) {
                                             throw new Error(`Failed to delete product: ${productResponse.status}`);
                                          }

                                          console.log(`Successfully deleted product ${product.id}`);

                                          // Xóa thông báo loading nếu có
                                          const loadingToast = document.querySelector('.fixed.top-4.right-4');
                                          if (loadingToast) document.body.removeChild(loadingToast);

                                          // Hiển thị thông báo thành công
                                          const successToast = document.createElement('div');
                                          successToast.className = 'fixed top-4 right-4 bg-green-100 text-green-700 p-4 rounded shadow-lg z-50';
                                          successToast.textContent = 'Xóa sản phẩm thành công';
                                          document.body.appendChild(successToast);

                                          // Tự động làm mới dữ liệu sau khi xóa
                                          fetchAllProductData();

                                          // Tự động ẩn thông báo sau 3 giây
                                          setTimeout(() => {
                                             document.body.removeChild(successToast);
                                          }, 3000);

                                       } catch (error) {
                                          console.error('Error deleting product:', error);

                                          // Hiển thị thông báo lỗi
                                          const errorToast = document.createElement('div');
                                          errorToast.className = 'fixed top-4 right-4 bg-red-100 text-red-700 p-4 rounded shadow-lg z-50';
                                          errorToast.textContent = 'Đã xảy ra lỗi khi xóa sản phẩm';
                                          document.body.appendChild(errorToast);

                                          // Tự động ẩn thông báo lỗi sau 3 giây
                                          setTimeout(() => {
                                             document.body.removeChild(errorToast);
                                          }, 3000);
                                       }
                                    }
                                 }}
                              >
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Expanded details */}
                     {expandedProduct === product.id && (
                        <div className="p-4 bg-gray-50 border-t">
                           <h3 className="font-medium text-gray-700 mb-2">Chi tiết sản phẩm</h3>

                           {product.details && product.details.length > 0 ? (
                              <div className="overflow-x-auto">
                                 <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                       <tr>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Biến thể
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Kích thước
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Loại
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Số lượng
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Giá
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                             Trạng thái
                                          </th>
                                       </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                       {product.details.map((detail) => {
                                          // Tìm giá cho chi tiết sản phẩm này
                                          const detailPrice = product.pricing?.find(
                                             p => p.product_detail.id === detail.id
                                          );

                                          return (
                                             <tr key={detail.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                   <div className="flex items-center">
                                                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                                                         {detail.images && detail.images.length > 0 ? (
                                                            <Image
                                                               src={detail.images[0].path}
                                                               alt={`${product.name} - ${detail.size} - ${detail.type}`}
                                                               width={40}
                                                               height={40}
                                                               className="h-10 w-10 rounded-full object-cover"
                                                               onError={(e) => {
                                                                  const target = e.target as HTMLImageElement;
                                                                  target.src = '/images/placeholder.png';
                                                               }}
                                                            />
                                                         ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                                         )}
                                                      </div>
                                                      <span>#{detail.id}</span>
                                                   </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                   {detail.size}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                   {detail.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                   <span className={detail.quantities === 0 ? 'text-red-500 font-medium' : ''}>
                                                      {detail.quantities}
                                                   </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                   {detailPrice ? (
                                                      detailPrice.discount_price > 0 && detailPrice.discount_price < detailPrice.base_price ? (
                                                         <div>
                                                            <span className="line-through text-gray-400">
                                                               {formatPrice(detailPrice.base_price)}
                                                            </span>
                                                            <div className="text-red-500">
                                                               {formatPrice(detailPrice.discount_price)}
                                                            </div>
                                                         </div>
                                                      ) : (
                                                         <span className="text-gray-700">
                                                            {formatPrice(detailPrice.base_price)}
                                                         </span>
                                                      )
                                                   ) : (
                                                      <span className="text-gray-400 italic">Chưa có giá</span>
                                                   )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${detail.isActive
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-gray-100 text-gray-800'
                                                      }`}>
                                                      {detail.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                   </span>
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           ) : (
                              <p className="text-gray-500 italic">Không có chi tiết sản phẩm</p>
                           )}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default function ProductManagement() {
   const [products, setProducts] = useState<ProductViewModel[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<string>('Tất cả');

   const tabs = ['Tất cả', 'Hoạt động', 'Khuyến Mãi', 'Hết hàng'];

   useEffect(() => {
      fetchAllProductData();
   }, []);

   // Hàm giải mã JWT payload (chỉ dùng cho debug)
   function decodeJWTPayload(token: string) {
      try {
         const base64Url = token.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
         }).join(''));
         return JSON.parse(jsonPayload);
      } catch (e) {
         console.error('Error decoding JWT:', e);
         return null;
      }
   }

   const fetchAllProductData = async () => {
      try {
         // Lấy token từ cả localStorage và sessionStorage
         const token = localStorage.getItem('token') || sessionStorage.getItem('token');

         // Kiểm tra xem token có tồn tại không
         if (!token) {
            setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
            setLoading(false);
            return;
         }

         // Debug: Giải mã JWT để xem payload
         const jwtPayload = decodeJWTPayload(token);
         console.log('JWT payload:', jwtPayload);

         // In ra console để kiểm tra token (chỉ hiện một phần để bảo mật)
         console.log('Token being used:', token.substring(0, 15) + '...');

         // Đảm bảo header Authorization đúng format
         const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         };

         // In ra headers để kiểm tra
         console.log('Request headers:', headers);

         setLoading(true);

         // 1. Fetch all products first
         const productsResponse = await fetch('http://localhost:3000/api/products', {
            headers: headers
         });

         if (!productsResponse.ok) {
            console.error('Failed to fetch products with status:', productsResponse.status);
            const errorData = await productsResponse.json().catch(() => null);
            console.error('API error details:', errorData);
            throw new Error(`Failed to fetch products: ${productsResponse.status}`);
         }

         const productsData = await productsResponse.json();
         console.log('Products fetched:', productsData);

         // Initialize productsWithDetails with basic product data
         const initialProductsWithDetails = productsData.map((product: Product) => ({
            ...product,
            images: Array.isArray(product.images) ? product.images : [product.images],
            details: [],
            pricing: []
         }));

         // Create a map of products by ID for easier lookup
         const productsMap = new Map();
         initialProductsWithDetails.forEach((product: { id: any; }) => {
            productsMap.set(product.id, product);
         });

         // 2. Fetch details for all products in parallel
         const detailsPromises = productsData.map(async (product: Product) => {
            try {
               console.log(`Fetching details for product ID: ${product.id}`);

               const detailsResponse = await fetch(`http://localhost:3000/api/product-details/product/${product.id}`, {
                  headers: headers
               });

               console.log(`Product ${product.id} details response status:`, detailsResponse.status);

               if (!detailsResponse.ok) {
                  console.error(`Failed to fetch details for product ${product.id} with status:`, detailsResponse.status);
                  return { productId: product.id, details: [] };
               }

               const detailsData = await detailsResponse.json();
               console.log(`Product ${product.id} details fetched:`, detailsData);

               // Kiểm tra nếu detailsData là mảng rỗng
               if (Array.isArray(detailsData) && detailsData.length === 0) {
                  console.warn(`No details found for product ${product.id}`);
               }

               // Kiểm tra quantities trong mỗi chi tiết
               if (Array.isArray(detailsData)) {
                  detailsData.forEach(detail => {
                     if (detail.quantities === undefined) {
                        console.warn(`Detail ID ${detail.id} missing quantities property`);
                     } else {
                        console.log(`Detail ID ${detail.id} has ${detail.quantities} quantities`);
                     }
                  });
               }

               return { productId: product.id, details: Array.isArray(detailsData) ? detailsData : [] };
            } catch (error) {
               console.error(`Error fetching details for product ${product.id}:`, error);
               return { productId: product.id, details: [] };
            }
         });

         const productDetailsResults = await Promise.all(detailsPromises);

         // Add details to their respective products
         productDetailsResults.forEach(({ productId, details }) => {
            const product = productsMap.get(productId);
            if (product) {
               product.details = details;
            }
         });

         // 3. Fetch all prices
         const allPricesResponse = await fetch('http://localhost:3000/api/v1/prices', {
            headers: headers
         });

         if (!allPricesResponse.ok) {
            console.error('Failed to fetch prices with status:', allPricesResponse.status);
            throw new Error(`Failed to fetch prices: ${allPricesResponse.status}`);
         }

         const allPricesData = await allPricesResponse.json();
         console.log('All prices fetched:', allPricesData);

         // Process all prices and add them to the appropriate products
         allPricesData.forEach((price: Price) => {
            if (price && price.product_detail && price.product_detail.productId) {
               const product = productsMap.get(price.product_detail.productId);
               if (product) {
                  if (!Array.isArray(product.pricing)) {
                     product.pricing = [];
                  }
                  product.pricing.push(price);
               }
            }
         });

         // Convert the map values back to an array
         const productsWithDetails = Array.from(productsMap.values());

         setProducts(productsWithDetails);
         console.log('Products with details and pricing:', productsWithDetails);
      } catch (err) {
         console.error('Error fetching product data:', err);
         setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
         setLoading(false);
      }
   };

   // Filter products based on active tab
   const getFilteredProducts = () => {
      switch (activeTab) {
         case 'Hoạt động':
            return products.filter(product =>
               product.details?.some(detail => detail.isActive)
            );
         case 'Khuyến Mãi':
            return products.filter((product) =>
               product.pricing?.some(
                  (price) => price.discount_price > 0 && price.discount_price < price.base_price,
               ),
            );
         case 'Hết hàng':
            return products.filter((product) => {
               // Calculate total quantity for this specific product
               const totalQuantity =
                  product.details?.reduce((sum, detail) => {
                     // Ensure quantities is treated as a number
                     const quantity = detail?.quantities !== undefined ? Number(detail.quantities) : 0;
                     return sum + quantity;
                  }, 0) || 0;
               return totalQuantity === 0;
            });
         default:
            return products;
      }
   };

   const filteredProducts = getFilteredProducts();

   return (
      <div className='flex h-screen bg-gray-50'>
         <MenuSideBar />
         <div className='flex-1 flex flex-col overflow-hidden'>
            <Header />
            <main className='flex-1 p-6 overflow-auto'>
               {/* Filter tabs */}
               <div className="mb-6">
                  <div className="border-b border-gray-200">
                     <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                 ? 'border-amber-500 text-amber-600'
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                 }`}
                           >
                              {tab}
                           </button>
                        ))}
                     </nav>
                  </div>
               </div>

               {/* Header with title and add button */}
               <div className='flex justify-between items-center mb-6'>
                  <h1 className='text-2xl font-semibold text-gray-800'>Quản lý sản phẩm</h1>
                  <Link
                     href='/seller/products/createproduct/step1'
                     className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2'
                  >
                     <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                     >
                        <path
                           fillRule='evenodd'
                           d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                           clipRule='evenodd'
                        />
                     </svg>
                     Thêm sản phẩm
                  </Link>
               </div>

               {/* Error display */}
               {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                     {error}
                  </div>
               )}

               <ProductTable products={filteredProducts} loading={loading} fetchAllProductData={fetchAllProductData} />
            </main>
         </div>
      </div>
   );
}
