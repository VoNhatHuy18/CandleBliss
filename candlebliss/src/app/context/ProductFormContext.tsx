'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Định nghĩa interface cho variant
interface Variant {
   type: string;
   value: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
}

// Định nghĩa interface cho form data
interface ProductFormData {
   name: string;
   description: string;
   category: string;
   images: string[];
   videoUrl?: string;
   price?: number;
   variants: Variant[];
}

// Initialize with default values
const defaultFormData: ProductFormData = {
   name: '',
   description: '',
   category: '',
   images: [],
   variants: [],
   };

interface ProductFormContextType {
   formData: ProductFormData;
   updateFormData: (data: Partial<ProductFormData>) => void;
}

const ProductFormContext = createContext<ProductFormContextType>({
   formData: defaultFormData,
   updateFormData: () => {},
});

export function ProductFormProvider({ children }: { children: ReactNode }) {
   const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

   const updateFormData = (data: Partial<ProductFormData>) => {
      setFormData((prevData) => ({
         ...prevData,
         ...data,
      }));
   };

   return (
      <ProductFormContext.Provider value={{ formData, updateFormData }}>
         {children}
      </ProductFormContext.Provider>
   );
}

export const useProductForm = () => useContext(ProductFormContext);
