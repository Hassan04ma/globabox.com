import { Product, Category } from './data';

export type { Product, Category };

export type Language = "fr" | "ar" | "en";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  cityName: string;
}

export interface CheckoutForm {
  fullName: string;
  phoneNumber: string;
  city: string;
  deliveryAddress: string;
  notes?: string;
}

export interface Order {
  id: string;
  reference: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  deliveryAddress: string;
  notes?: string;
  items: {
    productName: string;
    productId: string;
    price: number;
    quantity: number;
    image: string;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  finalTotal?: number;
  freeShipping?: boolean;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  whatsappMessage?: string;
  source?: string;
  syncStatus?: 'synced' | 'failed' | 'not-configured';
}

export interface TranslationDict {
  [key: string]: {
    fr: string;
    ar: string;
    en: string;
  };
}
