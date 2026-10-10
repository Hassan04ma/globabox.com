import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';
import { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface PromoOffersSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}

export default function PromoOffersSection({
  language,
  products,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
}: PromoOffersSectionProps) {
  const isRtl = language === "ar";

  // Simulate a live countdown timer returning remaining hours, minutes, seconds for today's deal
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 6 hours for continuous urgency simulation
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products with a valid originalPrice that is higher than current price
  const discountedProducts = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 4);

  if (discountedProducts.length === 0) return null;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="promo-offers-section"
    >
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-orange-200/60 rounded-3xl p-6 sm:p-10 shadow-[0_15px_40px_-15px_rgba(249,115,22,0.1)] relative overflow-hidden">
        {/* Abstract shapes and gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 pb-6 border-b border-orange-200/40">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md mb-3.5 uppercase tracking-wide shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white animate-bounce" />
              <span>{isRtl ? "تخفيضات محددة الوقت" : "OFFRES DU MOMENT - FLASH SALES"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isRtl ? "عروض حصرية وخصومات اليوم الكبرى" : "Nos Offres Chocs du Moment"}
            </h2>
            <p className="text-xs text-slate-500 mt-1 pb-1 font-medium font-sans">
              {isRtl 
                ? "مجموعة من السلع الممتازة بأسعار منخفضة لمدّة وجيزة للغاية. سارع قبل نفاد الكمية ومخازن المستودع!" 
                : "Bénéficiez de réductions folles sur notre équipement premium d'outdoor au Maroc. Offres éphémères dans la limite des stocks disponibles."}
            </p>
          </div>

          {/* Active Live Urgency Countdown Timer */}
          <div className="flex items-center gap-3 bg-white border border-orange-200 p-3.5 rounded-2xl shadow-sm self-start lg:self-center shrink-0">
            <div className="w-9 h-9 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider leading-none mb-1">
                {isRtl ? "ينتهي العرض الخاص في" : "Fin de l'offre dans :"}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-800 font-black font-mono">
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-sm min-w-[28px] text-center">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-orange-600 animate-pulse">:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-sm min-w-[28px] text-center">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-orange-600 animate-pulse">:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-sm min-w-[28px] text-center">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {discountedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
              onInstantOrder={onInstantOrder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
