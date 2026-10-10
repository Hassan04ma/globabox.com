import React from 'react';
import { ShieldCheck, Percent, ArrowRight, PackageOpen } from 'lucide-react';
import { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface EconomicPacksSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onExploreMore: () => void;
}

export default function EconomicPacksSection({
  language,
  products,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
  onExploreMore,
}: EconomicPacksSectionProps) {
  const isRtl = language === "ar";

  // Filter for products belonging to the "offres_packs" category
  const economicPacks = products.filter((p) => p.category === 'offres_packs');

  if (economicPacks.length === 0) return null;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 to-[#0b162c] text-white my-10 relative overflow-hidden"
      id="economic-packs-section"
    >
      {/* Decorative vector overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-5 border-b border-blue-820/65">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-md mb-3 uppercase tracking-wider shadow-md">
              <Percent className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? "باقات التوفير الكبرى" : "PACKS ÉCONOMIQUES - MAXI COMPLETS"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {isRtl ? "باقات اقتصادية لشراء هادف ومثالي" : "Nos Packs Économiques Tout-en-Un"}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium font-sans">
              {isRtl 
                ? "وفر المال واشترِ عتاداً متكاملاً (خيمة، كيس نوم، وموقد) في باقة واحدة مدمجة مع شحن مجاني وسريع لكافة أنحاء المغرب." 
                : "Équipez-vous au complet en économisant gros ! Nos packs combinés de matériel de camping et bivouac professionnel incluent tout le nécessaire d'outdoor."}
            </p>
          </div>

          <button
            onClick={onExploreMore}
            className="text-xs font-black text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 cursor-pointer group shrink-0 self-start md:self-end"
          >
            <span>{isRtl ? "اكتشف جميع باقاتنا" : "Voir tous les packs avantage"}</span>
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Persuasion Badge Banner */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <PackageOpen className="text-orange-500 w-5 h-5" />
            <span className="font-semibold">{isRtl ? "عدّة متكاملة في شحنة واحدة" : "Tout l'équipement livré ensemble"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="text-orange-500 w-5 h-5" />
            <span className="font-semibold">{isRtl ? "توفير يصل حتى 45% مقارنة بالشراء الفردي" : "Jusqu'à 45% d'Économie réelle"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-orange-500 w-5 h-5" />
            <span className="font-semibold">{isRtl ? "شحن مجاني فوري مضمون لجميع المدن" : "Livraison Express 100% Gratuite"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {economicPacks.map((product) => (
            <div 
              key={product.id} 
              className="bg-slate-900/40 backdrop-blur-md rounded-3xl overflow-hidden p-1.5 border border-white/10 shadow-lg hover:border-orange-500/20 transition-all duration-300"
            >
              <ProductCard
                product={product}
                language={language}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
                onInstantOrder={onInstantOrder}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
