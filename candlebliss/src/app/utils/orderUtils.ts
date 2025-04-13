/**
 * Updates the payment method for an existing order and sets appropriate status
 * @param orderId - The ID of the order to update
 * @param paymentMethod - The new payment method ('COD', 'BANKING', or 'MOMO')
 * @returns Promise with the updated order data
 */
export async function updateOrderPaymentMethod(
   orderId: number,
   paymentMethod: 'COD' | 'BANKING' | 'MOMO',
): Promise<{ id: number; status: string; payment_method: string }> {
   try {
      const token = localStorage.getItem('token');
      if (!token) {
         throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      }

      // First update the payment method
      const paymentResponse = await fetch(
         `http://68.183.226.198:3000/api/orders/${orderId}/method-payment`,
         {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               payment_method: paymentMethod,
            }),
         },
      );

      if (!paymentResponse.ok) {
         const errorData = await paymentResponse.json().catch(() => ({}));
         throw new Error(
            errorData.message ||
               `Không thể cập nhật phương thức thanh toán. (Mã lỗi: ${paymentResponse.status})`,
         );
      }

      // If payment method is COD, update status to "Đang xử lý"
      if (paymentMethod === 'COD') {
         const statusResponse = await fetch(
            `http://68.183.226.198:3000/api/orders/${orderId}/status`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({
                  status: 'Đang xử lý',
               }),
            },
         );

         if (!statusResponse.ok) {
            console.error('Failed to update order status after setting COD payment');
            // We don't throw here to not break the flow if only status update fails
         }
      }

      // Fetch and return the updated order data
      const updatedOrderResponse = await fetch(`http://68.183.226.198:3000/api/orders/${orderId}`, {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      if (!updatedOrderResponse.ok) {
         throw new Error('Không thể lấy thông tin đơn hàng sau khi cập nhật');
      }

      return await updatedOrderResponse.json();
   } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
   }
}
