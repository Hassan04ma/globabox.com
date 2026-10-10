import { Product, Order } from '../types';

function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getProductSocialProof(product: Product, language: 'fr' | 'ar' | 'en' = 'fr'): string {
  // If product is out of stock, do not show order/social proof message.
  if (!product.inStock || product.stockStatus === 'out_of_stock') {
    return '';
  }

  // Check if real order data exists in localStorage
  let actualCount = 0;
  try {
    const savedOrdersRaw = localStorage.getItem('globabox_orders');
    if (savedOrdersRaw) {
      const orders: Order[] = JSON.parse(savedOrdersRaw);
      // Count how many times this product is part of any order
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.productId === product.id) {
              actualCount += item.quantity || 1;
            }
          });
        }
      });
    }
  } catch (e) {
    console.error('Failed to parse orders for social proof', e);
  }

  // 1. If real order data exists for this product (actualCount > 0)
  if (actualCount > 0) {
    if (language === 'ar') {
      return `قام ${actualCount} عميل بطلب هذا المنتج اليوم`;
    } else if (language === 'en') {
      return `${actualCount} ${actualCount === 1 ? 'person' : 'people'} ordered this item today`;
    } else {
      return `${actualCount} ${actualCount === 1 ? 'personne a' : 'personnes ont'} commandé cet article aujourd'hui`;
    }
  }

  // 2. Fallback to safe, stable, deterministic social proof (no claim of fake orders)
  const code = getHashCode(product.id);
  
  // Decide stable count based on product traits
  let minVal = 3;
  let maxVal = 7;
  if (product.newArrival) {
    minVal = 1;
    maxVal = 3;
  } else if (product.bestSeller) {
    minVal = 8;
    maxVal = 18;
  } else if (product.originalPrice && product.originalPrice > product.price) {
    // Promo product
    minVal = 5;
    maxVal = 15;
  }

  const stableCount = minVal + (code % (maxVal - minVal + 1));

  if (product.bestSeller) {
    const templateIdx = code % 2;
    if (templateIdx === 0) {
      if (language === 'ar') {
        return `${stableCount} أشخاص يتصفحون هذا المنتج الأكثر مبيعاً الآن`;
      } else if (language === 'en') {
        return `${stableCount} people are viewing this bestseller today`;
      } else {
        return `${stableCount} personnes consultent ce best-seller aujourd’hui`;
      }
    } else {
      if (language === 'ar') {
        return `${stableCount} عمليات إضافة إلى السلة مؤخراً`;
      } else if (language === 'en') {
        return `${stableCount} additions to cart recently`;
      } else {
        return `${stableCount} ajouts au panier récemment`;
      }
    }
  } else {
    const templateIdx = code % 4;
    if (templateIdx === 0) {
      if (language === 'ar') {
        return `${stableCount} أشخاص يشاهدون هذا المنتج اليوم`;
      } else if (language === 'en') {
        return `${stableCount} people are viewing this item today`;
      } else {
        return `${stableCount} personnes consultent cet article aujourd’hui`;
      }
    } else if (templateIdx === 1) {
      if (language === 'ar') {
        return `قام ${stableCount} أشخاص بإضافة هذا المنتج للسلة مؤخراً`;
      } else if (language === 'en') {
        return `${stableCount} people added this item to cart recently`;
      } else {
        return `${stableCount} personnes ont ajouté cet article au panier récemment`;
      }
    } else if (templateIdx === 2) {
      if (language === 'ar') {
        return `${stableCount} أشخاص مهتمون بهذا المنتج حالياً`;
      } else if (language === 'en') {
        return `${stableCount} people are interested in this product`;
      } else {
        return `${stableCount} personnes s’intéressent à ce produit`;
      }
    } else {
      if (language === 'ar') {
        return `منتج محبوب ويحظى باهتمام كبير اليوم`;
      } else if (language === 'en') {
        return `Highly viewed product today`;
      } else {
        return `Produit très consulté aujourd’hui`;
      }
    }
  }
}
