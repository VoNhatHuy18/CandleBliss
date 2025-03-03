// src/app/services/api.ts

// Define Product interface
export interface Product {
   id: number;
   name: string;
   images: ProductImage[];
   // Add these back as they're used in your page.tsx
   sku?: string;
   category?: string;
   price?: number;
   discount?: number;
   stock?: number;
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
   const params = new URLSearchParams();
   params.append('page', page.toString());
   params.append('limit', limit.toString());

   // Add the additional parameters to the API request
   if (searchTerm) {
      params.append('search', searchTerm);
   }

   if (selectedCategory) {
      params.append('category', selectedCategory);
   }

   // Map activeTab to appropriate API parameters
   if (activeTab === 'Khuyến Mãi') {
      params.append('discount', 'true');
   } else if (activeTab === 'Hết hàng') {
      params.append('outOfStock', 'true');
   }

   const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
      { headers: { 'Content-Type': 'application/json' } },
   );

   if (!response.ok) {
      throw new Error('Failed to fetch products');
   }

   const result = await response.json();

   // Check the structure of the response and adjust accordingly
   const responseData = Array.isArray(result) ? result : result.data || [];

   // Convert API response to match Product interface
   let products: Product[] = responseData.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku || 'N/A',
      category: item.category || 'Unknown',
      price: item.price || 0,
      discount: item.discount || 0,
      stock: item.stock || 0,
      status: item.status || 'Không hoạt động',
      // Add images from the API response
      images: Array.isArray(item.images) ? item.images : [],
   }));

   // Additional client-side filtering for Khuyến Mãi tab
   if (activeTab === 'Khuyến Mãi') {
      products = products.filter((product) => product.discount && product.discount > 0);
   } else if (activeTab === 'Hết hàng') {
      // Only show products with "Không hoạt động" status (which means they're out of stock)
      products = products.filter((product) => product.status === 'Không hoạt động');
   }

   return {
      data: products,
      meta: result.meta || { total: products.length },
   };
}
