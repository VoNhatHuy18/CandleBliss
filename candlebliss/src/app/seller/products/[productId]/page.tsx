import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetail({ params }: { params: { productId: string } }) {
   const resolvedParams = await Promise.resolve(params);
   
   return (
      <Suspense fallback={
         <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
         </div>
      }>
         <ProductDetailClient productId={resolvedParams.productId} />
      </Suspense>
   );
}
