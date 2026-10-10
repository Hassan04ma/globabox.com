import React from 'react';
import { Flame, ArrowRight } from 'lucide-react';
import { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface BestSellersSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onExploreMore: () => void;
}

export default function BestSellersSection({
  language,
  products,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
  onExploreMore
}: BestSellersSectionProps) {
  const isRtl = language === "ar";
  
  // Filter for best selling products
  const bestSellers = products.filter(p => p.bestSeller === true).slice(0, 4);

  if (bestSellers.length === 0) return null;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="best-sellers-section"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-850 text-[10px] font-black px-2.5 py-1 rounded-md mb-2.5 uppercase tracking-wide">
            <Flame className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
            <span>{isRtl ? "الأكثر مبيعاً بالمغرب" : "TOP VENTES MAROC"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRtl ? "المستلزمات الأكثر طلباً وشهرة" : "Nos Meilleures Ventes Exclusives"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium select-none">
            {isRtl 
              ? "معدات وتجهيزات برية حازت على أعلى التقييمات من زبنائنا في كافة المدن المغربية." 
              : "Les équipements outdoor plébiscités par nos clients campeurs aux quatre coins du Royaume."}
          </p>
        </div>

        <button
          onClick={onExploreMore}
          className="text-xs font-black text-orange-600 hover:text-orange-500 transition-colors flex items-center gap-1 cursor-pointer group shrink-0"
        >
          <span>{isRtl ? "عرض الكتالوج الكامل" : "Explorer tous nos équipements"}</span>
          <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bestSellers.map((product) => (
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
    </section>
  );
}
