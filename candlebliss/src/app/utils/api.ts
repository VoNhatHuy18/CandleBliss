/**
 * API utility functions for the Candlebliss application
 */

/**
 * Format a number as Vietnamese currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Calculate discount percentage
 * @param basePrice - Original price
 * @param discountPrice - Discounted price
 * @returns Percentage as number or null if no valid discount
 */
export const calculateDiscountPercent = (basePrice: number, discountPrice: number) => {
  if (!basePrice || !discountPrice || basePrice <= discountPrice) return null;
  return Math.round((1 - discountPrice / basePrice) * 100);
};

/**
 * Normalize product images to always return an array
 * @param images - Image or array of images
 * @returns Array of images
 */
export const normalizeImages = (images: any) => {
  if (!images) return [];
  return Array.isArray(images) ? images : [images];
};

/**
 * Format product ID with leading zeros
 * @param id - Product ID
 * @param digits - Number of digits (default: 2)
 * @returns Formatted ID string
 */
export const formatProductId = (id: number | string, digits: number = 2) => {
  return String(id).padStart(digits, '0');
};
