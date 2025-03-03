'use client';
import { useProductForm } from '@/app/context/ProductFormContext';

export default function Step3() {
   const { formData } = useProductForm();

   // Debug the entire formData object
   console.log('Complete formData:', formData);

   // Access data from Step 1
   const { name, description, category, images } = formData;

   // Access data from Step 2
   const variants = formData.variants;

   console.log('Product name from Step 1:', name);
   console.log('Product description from Step 1:', description);
   console.log('Product category from Step 1:', category);
   console.log('Product images from Step 1:', images);
   console.log('Variants from Step 2:', variants);

   return (
      <div>
         <h1>Step 3: Pricing{name ? ` for ${name}` : ''}</h1>

         {/* Display product info if available */}
         {name && <p>Product Name: {name}</p>}
         {description && <p>Description: {description}</p>}
         {category && <p>Category: {category}</p>}

         {/* Display product images if available */}
         {images && images.length > 0 && (
            <div className='mt-4'>
               <h2 className='text-lg font-medium mb-2'>Product Images</h2>
               <div className='flex flex-wrap gap-2'>
                  {images.map((image, index) => (
                     <img
                        key={index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className='w-24 h-24 object-cover rounded border'
                     />
                  ))}
               </div>
            </div>
         )}

         {/* Rest of your component */}
      </div>
   );
}
