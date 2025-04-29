/**
 * API utility functions for the Candlebliss application
 */
import type { User } from '@/app/user/profile/types';
import { HOST } from '../constants/api';

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
export const normalizeImages = (images: unknown) => {
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

// API service for user data with authentication
export const fetchUserProfile = async (): Promise<User> => {
   try {
      const token = localStorage.getItem('token');

      if (!token) {
         throw new Error('No authentication token found');
      }

      const response = await fetch(`${HOST}/api/v1/auth/me`, {
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
      });

      if (response.status === 401) {
         throw new Error('Unauthorized');
      }

      if (!response.ok) {
         throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      return await response.json();
   } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
   }
};
