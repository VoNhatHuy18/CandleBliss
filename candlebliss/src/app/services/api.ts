// src/app/services/api.ts

// Define Product interface
export interface Product {
   id: number;
   sku: string;
   name: string;
   category: string;
   price: number;
   discount: number;
   stock: number;
   status: 'Hoạt động' | 'Không hoạt động';
}

export interface ApiResponse<T> {
   data: T[];
   meta: {
      total: number;
      page: number;
      limit: number;
   };
}

export async function fetchProducts(
   page = 1,
   limit = 10,
   search?: string,
   category?: string,
   tab?: string,
): Promise<ApiResponse<Product>> {
   // Build query params
   const params = new URLSearchParams();
   params.append('page', page.toString());
   params.append('limit', limit.toString());

   if (search) params.append('search', search);
   if (category && category !== 'Danh mục') params.append('category', category);
   if (tab === 'Khuyến Mãi') params.append('hasDiscount', 'true');
   if (tab === 'Hết hàng') params.append('status', 'Không hoạt động');

   // Make API request
   const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
      {
         headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
      },
   );

   if (!response.ok) {
      throw new Error('Failed to fetch products');
   }

   return response.json();
}
