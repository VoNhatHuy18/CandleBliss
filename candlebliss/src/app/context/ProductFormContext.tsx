'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Define your interfaces
interface Variant {
   type: string;
   value: string;
   isExpanded?: boolean;
   size?: string;
   images?: string[];
   quantity?: number;
}

interface ProductFormData {
   // Step 1 data
   name: string;
   description: string;
   category: string;
   images: string[];
   // Step 2 data
   variants: Variant[];
   // Step 3 data
   price?: number;
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
