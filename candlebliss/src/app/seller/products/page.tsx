'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/app/components/seller/header/page';
import MenuSideBar from '@/app/components/seller/menusidebar/page';

// Define interfaces based on your API responses
interface Image {
  id: string;
  path: string;
  public_id: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  video?: string;
  images: Image | Image[];
}

interface ProductDetail {
  id: number;
  size?: string;
  type?: string;
  quantities?: number;
  images?: Image[];
  product?: Product;
  isActive?: boolean;
  productId?: number; // Add productId to help with filtering
}

interface Price {
  id: number;
  base_price: number;
  discount_price: number;
  start_date: Date | string;
  end_date: Date | string;
  product_detail: ProductDetail;
}

// Combined product data for display
interface ProductViewModel {
  id: number;
  name: string;
  description: string;
  video?: string;
  images: Image[];
  details: ProductDetail[];
  pricing: Price[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductViewModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Tất cả');

  const tabs = ['Tất cả', 'Hoạt động', 'Khuyến Mãi', 'Hết hàng'];

  useEffect(() => {
    fetchAllProductData();
  }, []);

  const fetchAllProductData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
        setLoading(false);
        return;
      }

      // 1. Fetch all base products
      const productsResponse = await fetch('http://localhost:3000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }

      const productsData = await productsResponse.json();
      console.log('Products fetched:', productsData);

      // 2. Process each product to get details and pricing
      const productsWithDetails: ProductViewModel[] = await Promise.all(
        productsData.map(async (product: Product) => {
          // Prepare product view model with normalized image structure
          const productViewModel: ProductViewModel = {
            ...product,
            images: Array.isArray(product.images) ? product.images : [product.images],
            details: [],
            pricing: []
          };

          // Fetch product details
          try {
            const detailsResponse = await fetch(
              `http://localhost:3000/api/product-details/product/${product.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              // Make sure each detail has a reference to the product ID
              const processedDetails = Array.isArray(detailsData) ? detailsData : [detailsData];
              productViewModel.details = processedDetails.map(detail => ({
                ...detail,
                productId: product.id // Ensure productId is set
              }));
              
              // Fetch prices for each product detail
              const pricePromises = productViewModel.details.map(async (detail) => {
                try {
                  const priceResponse = await fetch(
                    `http://localhost:3000/api/v1/prices/product-detail/${detail.id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  
                  if (priceResponse.ok) {
                    const priceData = await priceResponse.json();
                    return Array.isArray(priceData) ? priceData : [priceData];
                  }
                  return [];
                } catch (error) {
                  console.warn(`Failed to fetch prices for detail ${detail.id}:`, error);
                  return [];
                }
              });
              
              const allPrices = await Promise.all(pricePromises);
              productViewModel.pricing = allPrices.flat();
            }
          } catch (error) {
            console.warn(`Failed to fetch details for product ${product.id}:`, error);
          }

          // If no prices were found by detail ID, try fetching by product ID
          if (productViewModel.pricing.length === 0) {
            try {
              const priceResponse = await fetch(
                `http://localhost:3000/api/v1/prices/product/${product.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (priceResponse.ok) {
                const priceData = await priceResponse.json();
                productViewModel.pricing = Array.isArray(priceData) ? priceData : [priceData];
              }
            } catch (error) {
              console.warn(`Failed to fetch prices for product ${product.id}:`, error);
            }
          }

          return productViewModel;
        })
      );

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
        return products.filter((product) => product.details?.some((detail) => detail.isActive));
      case 'Khuyến Mãi':
        return products.filter((product) =>
          product.pricing?.some(
            (price) => price.discount_price > 0 && price.discount_price < price.base_price
          )
        );
      case 'Hết hàng':
        return products.filter((product) => {
          // Calculate total quantity for this specific product
          const totalQuantity = product.details?.reduce(
            (sum, detail) => sum + (detail.quantities || 0),
            0
          ) || 0;
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

          {/* Error message if any */}
          {error && <div className='bg-red-50 text-red-800 p-4 rounded-lg mb-6'>{error}</div>}

          {/* Tabs */}
          <div className='border-b border-gray-200 mb-6'>
            <div className='flex'>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    tab === activeTab
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                  {tab === activeTab && (
                    <span className='ml-2 bg-amber-100 text-amber-600 px-2 py-1 rounded-full text-xs'>
                      {filteredProducts.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Products table */}
          <ProductTable products={filteredProducts} loading={loading} />
        </main>
      </div>
    </div>
  );
}

const ProductTable = ({ products, loading }: { products: ProductViewModel[]; loading: boolean }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='w-full h-40 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500'></div>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto shadow-md rounded-lg'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              STT
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Mã SP
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Hình ảnh
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Tên sản phẩm
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Loại
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Giá
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Khuyến mãi
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Số lượng
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Trạng thái
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {products.length > 0 ? (
            products.map((product, index) => {
              // Get first pricing info and detail
              const pricing = product.pricing?.[0];
              const detail = product.details?.[0];

              // Calculate total quantity across all variants with same product ID
              const totalQuantity = product.details?.reduce(
                (sum, detail) => {
                  // Only sum quantities if details belong to this product
                  if (detail.product?.id === product.id) {
                    return sum + (detail.quantities || 0);
                  }
                  return sum;
                }, 0
              ) || 0;

              // Check if any variant is active
              const isActive = product.details?.some((detail) => detail.isActive) || false;

              // Check if product has discount
              const hasDiscount =
                pricing &&
                pricing.discount_price > 0 &&
                pricing.discount_price < pricing.base_price;

              // Count variants 
              const variantCount = product.details?.filter(detail => 
                detail.product?.id === product.id 
              ).length || 0;

              return (
                <tr key={product.id} className='hover:bg-gray-50'>
                  {/* STT */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {index + 1}
                  </td>

                  {/* Mã SP */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {product.id.toString().padStart(2, '0')}
                  </td>

                  {/* Hình ảnh */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden'>
                      {product.images &&
                      product.images.length > 0 &&
                      product.images[0]?.path ? (
                        <Image
                          src={product.images[0].path}
                          alt={product.name}
                          width={64}
                          height={64}
                          className='object-cover rounded-lg hover:scale-110 transition-transform'
                        />
                      ) : (
                        <span className='text-gray-500 text-2xl'>🕯️</span>
                      )}
                    </div>
                  </td>

                  {/* Tên sản phẩm */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {product.name}
                    </div>
                  </td>

                  {/* Loại */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {detail?.type || 'N/A'}
                  </td>

                  {/* Giá */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {pricing ? formatCurrency(pricing.base_price) : '-'}
                  </td>

                  {/* Khuyến mãi */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {hasDiscount ? (
                      <div className='flex flex-col'>
                        <span className='text-sm text-red-600 font-medium'>
                          {formatCurrency(pricing.discount_price)}
                        </span>
                        <span className='text-xs text-green-600'>
                          {Math.round(
                            (1 - pricing.discount_price / pricing.base_price) * 100
                          )}
                          % giảm
                        </span>
                      </div>
                    ) : (
                      <span className='text-sm text-gray-500'>-</span>
                    )}
                  </td>

                  {/* Số lượng */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900 font-medium'>
                      {totalQuantity}
                    </div>
                    {variantCount > 1 && (
                      <div className='text-xs text-amber-600'>
                        {variantCount} biến thể
                      </div>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-col gap-1'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                      {totalQuantity === 0 && (
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'>
                          Hết hàng
                        </span>
                      )}
                      {hasDiscount && (
                        <span className='px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800'>
                          Khuyến mãi
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex flex-col space-y-2'>
                      <Link
                        href={`/seller/products/${product.id}`}
                        className='text-amber-600 hover:text-amber-900'
                      >
                        Chi tiết
                      </Link>
                      <button
                        className='text-blue-600 hover:text-blue-900'
                        onClick={() =>
                          (window.location.href = `/seller/products/edit/${product.id}`)
                        }
                      >
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={10} className='px-6 py-4 text-center text-sm text-gray-500'>
                Không có sản phẩm nào phù hợp với điều kiện tìm kiếm
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}