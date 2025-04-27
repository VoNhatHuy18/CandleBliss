/**
 * Gets the current cart badge count from localStorage
 * @returns The current badge count
 */
export const getCartBadgeCount = (): number => {
   const currentBadge = localStorage.getItem('cartBadge');
   return currentBadge ? parseInt(currentBadge) : 0;
};

/**
 * Increments the cart badge count in localStorage
 * @param amount - Amount to increment (default: 1)
 */
export const incrementCartBadge = (amount: number = 1): void => {
   const currentCount = getCartBadgeCount();
   const newCount = currentCount + amount;
   localStorage.setItem('cartBadge', newCount.toString());

   // Dispatch a custom event that the navbar can listen for
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('cartBadgeUpdated', {
            detail: { count: newCount },
         }),
      );
   }
};

/**
 * Decrements the cart badge count in localStorage
 * @param amount - Amount to decrement (default: 1)
 */
export const decrementCartBadge = (amount: number = 1): void => {
   const currentBadge = localStorage.getItem('cartBadge');
   const currentCount = currentBadge ? parseInt(currentBadge) : 0;
   const newCount = Math.max(0, currentCount - amount);

   localStorage.setItem('cartBadge', newCount.toString());

   // Dispatch a custom event that the navbar can listen for
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('cartBadgeUpdated', {
            detail: { count: newCount },
         }),
      );
   }
};

/**
 * Sets the cart badge count in localStorage
 * @param count - The count to set
 */
export const setCartBadgeCount = (count: number): void => {
   localStorage.setItem('cartBadge', count.toString());

   // Dispatch a custom event that the navbar can listen for
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('cartBadgeUpdated', {
            detail: { count },
         }),
      );
   }
};

/**
 * Clears the cart badge from localStorage
 */
export const clearCartBadge = (): void => {
   localStorage.removeItem('cartBadge');

   // Dispatch a custom event that the navbar can listen for
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('cartBadgeUpdated', {
            detail: { count: 0 },
         }),
      );
   }
};
