import { useState } from 'react';
import { Star, ShoppingCart, MessageSquare, Flame, Truck, ShieldCheck, Clock, Zap, Eye, Percent } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { getProductSocialProof } from '../utils/socialProof';
import { WHATSAPP_LINK } from '../data';
import ProductImage from './ProductImage';
import WhatsAppIcon from './WhatsAppIcon';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function ProductCard({
  product,
  language,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
  onWhatsAppOrder,
}: ProductCardProps) {
  const isRtl = language === "ar";
  const [imageError, setImageError] = useState(false);
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  // Convert prices to beautiful formats
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.inStock === false || product.stockStatus === 'out_of_stock';
  const isLimited = !isOutOfStock && product.stockStatus === 'limited';

  const renderStockBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 text-red-600 text-[9px] font-black uppercase font-sans shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>{t('stock_out_of_stock')}</span>
        </span>
      );
    }
    if (isLimited) {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5 text-amber-700 text-[9px] font-black uppercase font-sans shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span>{t('stock_limited')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 text-emerald-700 text-[9px] font-black uppercase font-sans shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-555"></span>
        <span>{t('stock_in_stock')}</span>
      </span>
    );
  };

  return (
    <div
      id={`product-card-${product.id}`}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="group bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(30,41,59,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col relative"
    >
      {/* Promotional Labels & Tags */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap justify-between items-start gap-1.5 pointer-events-none">
        <div className="flex flex-wrap gap-1">
          {product.bestSeller && (
            <span className="bg-orange-600 text-white text-[10px] uppercase font-extrabold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-white" />
              {t('filterBestSellers')}
            </span>
          )}
          {(() => {
            const isNew = product.createdAt 
              ? (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7 
              : !!product.newArrival;
            return isNew && (
              <span className="bg-blue-900 text-white text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-lg shadow-md">
                {t('filterNewArrivals')}
              </span>
            );
          })()}
        </div>
        {discountPercent > 0 && (
          <span className="bg-red-650 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-md self-start shrink-0 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{t('badge_promo')} -{discountPercent}%</span>
          </span>
        )}
      </div>

      {/* Product Image Stage */}
      <div 
        onClick={() => onViewDetails(product)}
        className="aspect-[4/3] w-full overflow-hidden bg-[#0b1528] relative cursor-pointer"
      >
        <ProductImage
          src={product.image}
          fallbackSrc={product.fallbackImage}
          alt={`${product.name[language] || product.name.fr || ''} | ${product.category} | ${product.price} MAD - Globabox Maroc`}
          loading="lazy"
          language={language}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          containerClassName="aspect-[4/3] w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-xs bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-medium z-10">
            {t('btnViewingProduct')}
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-450">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                ({product.reviewsCount})
              </span>
            </div>
            {renderStockBadge()}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-2 min-h-[40px] leading-snug font-sans"
          >
            {product.name[language]}
          </h3>

          {/* Tag Description */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed font-normal">
            {product.description[language]}
          </p>

          {/* Micro Conversion Elements: Free Delivery Badge & Secure COD Badge */}
          <div className="flex flex-wrap gap-1 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-100/80 px-2 py-1 rounded-lg text-blue-900 text-[9px] font-extrabold font-sans select-none shadow-sm">
              <Truck size={12} className="text-blue-600 shrink-0" />
              <span>{t('badge_free_delivery')}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100/80 border border-slate-200 px-2 py-1 rounded-lg text-slate-700 text-[9px] font-extrabold font-sans select-none shadow-sm">
              <ShieldCheck size={12} className="text-slate-500 shrink-0" />
              <span>COD Maroc</span>
            </span>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100/80">
          <div className="flex items-center justify-between mb-3.5 gap-2">
            <span className="text-lg font-black font-mono text-[#0B1528] bg-slate-50 border border-slate-200 px-3.5 py-1 rounded-xl shadow-sm text-center">
              {product.price} {t('moroccoCurrency')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-405 line-through font-mono font-medium">
                {product.originalPrice} {t('moroccoCurrency')}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Commandé aujourd'hui style trust message */}
            {!isOutOfStock && getProductSocialProof(product, language) && (
              <div className="text-[9.5px] bg-rose-50/70 border border-rose-100 rounded-xl px-2.5 py-2 text-rose-800 font-bold mb-1 flex items-center gap-1.5 leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
                <Zap size={11} className="text-rose-600 shrink-0 select-none" />
                <span>{getProductSocialProof(product, language)}</span>
              </div>
            )}

            {isOutOfStock ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-black py-2.5 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-center select-none w-full shadow-inner">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>{t('stock_soon_available')}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Quick checkout direct drawer order button (Vibrant Orange CTA) */}
                  <button
                    onClick={() => onInstantOrder(product)}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-black py-3 sm:py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center shadow-lg hover:shadow-orange-500/20 shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
                    title={t('btnOrderNow')}
                  >
                    <ShoppingCart size={14} className="text-white shrink-0" />
                    <span>{t('btnOrderNow')}</span>
                  </button>

                  {/* Classic add to cart (Vibrant Blue CTA) */}
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-bold py-3 sm:py-2.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/5 hover:bg-[#0c1a30] min-h-[44px]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
                    <span>{t('btnAddToCart')}</span>
                  </button>
                </div>

                {/* Direct Order by WhatsApp (Emerald Green CTA) */}
                <button
                  onClick={() => {
                    if (onWhatsAppOrder) {
                      onWhatsAppOrder({
                        items: [{ product, quantity: 1 }],
                        source: 'product_card_whatsapp'
                      });
                    } else {
                      window.open(WHATSAPP_LINK, '_blank', 'noreferrer');
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow hover:scale-[1.02] active:scale-[0.98] min-h-[38px]"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{t('btnOrderWhatsApp')}</span>
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => onViewDetails(product)}
            className="w-full mt-3 py-2 text-slate-400 hover:text-slate-650 text-[10px] uppercase tracking-wider font-extrabold hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 flex items-center justify-center gap-1.5"
          >
            <Eye size={12} className="text-slate-400 shrink-0" />
            <span>{t('productSpecsTab')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
