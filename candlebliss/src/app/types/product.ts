export interface Image {
   id: string;
   path: string;
   public_id: string;
}

export interface Product {
   id: number;
   name: string;
   description: string;
   video?: string;
   images: Image[];
}

export interface ProductDetail {
   id: string;
   size: string;
   type: string;
   quantities: number;
   images?: { path: string }[];
   isActive: boolean;
   productId?: number;
}

export interface ProductPrice {
   base_price: number;
   discount_price: number;
   start_date?: string;
   end_date?: string;
   productId: number;
}

export interface CompleteProductInfo {
   product: {
      id: string;
      name: string;
      description: string;
      video?: string;
      images?: { path: string }[];
   };
   details: ProductDetail[];
   price?: {
      base_price: number;
      discount_price: number;
      start_date?: string;
      end_date?: string;
   };
}
