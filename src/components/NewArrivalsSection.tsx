import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface NewArrivalsSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onExploreMore: () => void;
}

export default function NewArrivalsSection({
  language,
  products,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
  onExploreMore
}: NewArrivalsSectionProps) {
  const isRtl = language === "ar";
  
  // Filter for new arrival products (explicitly set as newArrival or created within the last 7 days)
  const newArrivals = products.filter(p => {
    if (p.createdAt) {
      const diffDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return !!p.newArrival;
  }).slice(0, 4);

  if (newArrivals.length === 0) return null;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-b border-slate-800 text-white"
      id="new-arrivals-section"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-900/80 text-[#a5b4fc] text-[10px] font-black px-2.5 py-1 rounded-md mb-2.5 uppercase tracking-wide border border-blue-800/40">
              <Compass className="w-3.5 h-3.5" />
              <span>{isRtl ? "تجهيزات وصلت حديثاً" : "NOUVEAUTÉS EXCLUSIVES"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isRtl ? "وصل حديثاً لمستودعاتنا" : "Nouveautés & Équipements Récents"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium select-none">
              {isRtl 
                ? "أحدث ابتكارات وإكسسوارات ومستلزمات التخييم لرحلتك القادمة." 
                : "Explorez nos nouveaux arrivages d'équipements de bivouac, conçus pour les passionnés du grand air marocain."}
            </p>
          </div>

          <button
            onClick={onExploreMore}
            className="text-xs font-black text-[#a5b4fc] hover:text-white transition-colors flex items-center gap-1 cursor-pointer group shrink-0"
          >
            <span>{isRtl ? "اكتشف الجديد بالكامل" : "Voir tous les nouveaux arrivages"}</span>
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
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
