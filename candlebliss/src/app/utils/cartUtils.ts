import { HOST } from '../constants/api';
import { useCart } from '../contexts/CartContext';

export const useCartActions = () => {
   const { incrementCartBadge } = useCart();

   const addToCart = async (
      productDetailId: number,
      quantity: number,
      userId: number,
   ): Promise<{ success: boolean; message: string }> => {
      if (!userId) {
         return { success: false, message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' };
      }

      try {
         const response = await fetch(`${HOST}/api/cart/item`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: JSON.stringify({
               productDetailId,
               quantity,
               userId,
            }),
         });

         if (response.ok) {
            // Cập nhật badge ngay lập tức
            incrementCartBadge(quantity);
            return { success: true, message: 'Đã thêm sản phẩm vào giỏ hàng' };
         }

         return {
            success: false,
            message: `Không thể thêm vào giỏ hàng: ${await response.text()}`,
         };
      } catch (error) {
         console.error('Error adding to cart:', error);
         return {
            success: false,
            message: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng',
         };
      }
   };

   return { addToCart };
};
