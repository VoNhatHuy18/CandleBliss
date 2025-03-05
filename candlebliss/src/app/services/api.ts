// src/app/services/api.ts

// Define Product interface
export interface Product {
   id: number;
   name: string;
   description: string;
   video: string;
   images: ProductImage[];
   details: ProductDetails[];
   pricing: ProductPricing;
   category?: string;
   status?: 'Hoạt động' | 'Không hoạt động';
}

// Add this to your types or update the existing Product interface
interface ProductImage {
   id: string;
   path: string;
   public_id: string;
   createdAt: string;
   updatedAt: string;
   deletedAt: string | null;
   isDeleted: boolean;
   __entity: string;
}

// Định nghĩa interface cho Product Details
interface ProductDetails {
   id: number;
   size: string;
   type: string;
   quantities: number;
   images: ProductImage[];
   isActive: boolean;
}

// Định nghĩa interface cho Product Pricing
interface ProductPricing {
   id: number;
   base_price: number;
   discount_price: number;
   start_date: string;
   end_date: string;
}

export type ApiResponse = {
   data: Product[];
   meta?: {
      total: number;
      // other meta fields
   };
};

export async function fetchProducts(
   page = 1,
   limit = 10,
   searchTerm = '',
   selectedCategory = '',
   activeTab = 'Tất cả',
): Promise<ApiResponse> {
   try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (searchTerm) {
         params.append('search', searchTerm);
      }

      if (selectedCategory) {
         params.append('category', selectedCategory);
      }

      // Gọi API products
      const productResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
         { headers: { 'Content-Type': 'application/json' } },
      );

      if (!productResponse.ok) {
         throw new Error('Failed to fetch products');
      }

      const productResult = await productResponse.json();
      const productsData = Array.isArray(productResult) ? productResult : productResult.data || [];

      // Lấy thông tin chi tiết cho từng sản phẩm
      const productsWithDetails = await Promise.all(
         productsData.map(async (product: Product) => {
            try {
               // Gọi API chi tiết sản phẩm theo ID
               const detailsResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/product-details/${product.id}`,
                  { headers: { 'Content-Type': 'application/json' } },
               );

               if (!detailsResponse.ok) {
                  console.warn(`Failed to fetch details for product ${product.id}`);
                  return product;
               }

               const detailsData = await detailsResponse.json();

               // Kết hợp thông tin chi tiết vào sản phẩm
               return {
                  ...product,
                  details: Array.isArray(detailsData) ? detailsData : [detailsData],
               };
            } catch (error) {
               console.error(`Error fetching details for product ${product.id}:`, error);
               return product;
            }
         }),
      );

      // Xử lý lọc theo tab
      let filteredProducts = productsWithDetails;
      if (activeTab === 'Khuyến Mãi') {
         filteredProducts = productsWithDetails.filter(
            (product: Product) => product.pricing?.discount_price > 0
         );
      } else if (activeTab === 'Hết hàng') {
         filteredProducts = productsWithDetails.filter(
            (product: Product) => {
               if (!product.details || product.details.length === 0) {
                  return false;
               }
               return product.details.some(detail => detail.quantities === 0);
            }
         );
      } else if (activeTab === 'Tất cả') {
         filteredProducts = productsWithDetails;
      }

      return {
         data: filteredProducts,
         meta: productResult.meta || { total: filteredProducts.length },
      };
   } catch (error: unknown) {
      if (error instanceof Error) {
         console.error('Fetch error:', error);
         throw new Error(`Failed to fetch products: ${error.message}`);
      }
      console.error('Fetch error:', error);
      throw new Error('Failed to fetch products: Unknown error');
   }
}
