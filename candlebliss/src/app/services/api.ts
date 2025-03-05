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

      const detailsResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/product-details?${params.toString()}`,
         { headers: { 'Content-Type': 'application/json' } },
      );
      const detailsData = await detailsResponse.json();

      // Gọi API pricing
      const pricingResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/pricing?${params.toString()}`,
         { headers: { 'Content-Type': 'application/json' } },
      );
      const pricingData = await pricingResponse.json();

      // Xử lý lọc theo tab
      let filteredProducts = productsData;
      if (activeTab === 'Khuyến Mãi') {
         filteredProducts = filteredProducts.filter(
            (product: { pricing: { discount_price: number } }) => product.pricing && product.pricing.discount_price > 0,
         );
      } else if (activeTab === 'Hết hàng') {
         filteredProducts = filteredProducts.filter((product: { details: { quantities: number }[] }) =>
            product.details.every((detail: { quantities: number }) => detail.quantities === 0),
         );
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
