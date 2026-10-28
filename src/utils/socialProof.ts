import { Product } from '../types';

// Activity counts must come from real, server-verified analytics.
// Do not derive visitor counts or recent orders from product IDs/localStorage.
export function getProductSocialProof(_product: Product, _language: 'fr' | 'ar' | 'en' = 'fr'): string {
  return '';
}
