'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Định nghĩa interface cho Category
interface Category {
   id: number;
   name: string;
   description: string;
}

// Định nghĩa interface cho variant
interface Variant {
   type: string;
   values: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
   detailId?: number; // Đảm bảo field này được thêm vào
}

// Định nghĩa interface cho form data
interface ProductFormData {
   name: string;
   description: string;
   // Thay thế các trường category riêng lẻ bằng đối tượng Category
   selectedCategory: Category | null;
   categoryId?: number; // Add this field to match what's used in page.tsx
   images: string[];
   basePrice?: string;
   discountPrice?: string;
   startDate?: string;
   endDate?: string;
   promotion?: string;
   variants: Variant[];
   productId?: number; // Thêm field này
}

// Initialize with default values
const defaultFormData: ProductFormData = {
   name: '',
   description: '',
   selectedCategory: null,
   images: [],
   variants: [],
};

interface ProductFormContextType {
   formData: ProductFormData;
   updateFormData: (data: Partial<ProductFormData>) => void;
   resetFormData: () => void;
   isFormComplete: () => boolean;
}

const ProductFormContext = createContext<ProductFormContextType>({
   formData: defaultFormData,
   updateFormData: () => { },
   resetFormData: () => { },
   isFormComplete: () => false,
});

export function ProductFormProvider({ children }: { children: ReactNode }) {
   // Thử khôi phục dữ liệu từ sessionStorage khi khởi tạo
   const [formData, setFormData] = useState<ProductFormData>(() => {
      if (typeof window !== 'undefined') {
         const savedData = sessionStorage.getItem('productFormData');
         if (savedData) {
            try {
               return JSON.parse(savedData);
            } catch (e) {
               console.error('Failed to parse saved form data:', e);
            }
         }
      }
      return defaultFormData;
   });

   // Lưu dữ liệu vào sessionStorage khi có thay đổi
   useEffect(() => {
      if (typeof window !== 'undefined') {
         sessionStorage.setItem('productFormData', JSON.stringify(formData));
      }
   }, [formData]);

   const updateFormData = (data: Partial<ProductFormData>) => {
      setFormData((prevData) => ({
         ...prevData,
         ...data,
      }));
   };

   const resetFormData = () => {
      setFormData(defaultFormData);
      if (typeof window !== 'undefined') {
         sessionStorage.removeItem('productFormData');
      }
   };

   const isFormComplete = () => {
      // Kiểm tra điều kiện tối thiểu để hoàn thành form
      const basicInfoComplete = formData.name &&
         formData.description &&
         formData.selectedCategory !== null;
      const hasImages = formData.images && formData.images.length > 0;
      const hasVariants = formData.variants && formData.variants.length > 0;
      const hasPrice = formData.basePrice && parseFloat(formData.basePrice) > 0;

      return Boolean(basicInfoComplete && hasImages && hasVariants && hasPrice);
   };

   return (
      <ProductFormContext.Provider
         value={{ formData, updateFormData, resetFormData, isFormComplete }}
      >
         {children}
      </ProductFormContext.Provider>
   );
}

export const useProductForm = () => useContext(ProductFormContext);
