import React from 'react';
import { Tag, Sparkles, AlertCircle } from 'lucide-react';
import { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface Under99SectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}

export default function Under99Section({
  language,
  products,
  onViewDetails,
  onAddToCart,
  onInstantOrder,
}: Under99SectionProps) {
  const isRtl = language === "ar";

  // Filter for products having a price strictly under 99 DH or belonging to the "moins_99" category
  const under99Products = products.filter(
    (p) => p.price < 99 || p.category === 'moins_99'
  ).slice(0, 4);

  if (under99Products.length === 0) return null;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="under-99-section"
    >
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-[0_10px_35px_rgb(0,0,0,0.02)] hover:border-slate-300 transition-all duration-300">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg mb-3 uppercase tracking-wide border border-green-200/40">
              <Tag className="w-3.5 h-3.5" />
              <span>{isRtl ? "أقل من 99 درهم" : "ESPACE MOINS DE 99 DH"}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {isRtl ? "مستلزمات الحماية والنجاة بأقل من 99 درهم" : "Le Coin des Bonnes Affaires à moins de 99 DH"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 pb-1 font-medium font-sans">
              {isRtl 
                ? "أكسسوارات حتمية، أدوات نجاة، ومعدات إضافية بأسعار معقولة ومناسبة لا تزيد عن 99 درهم." 
                : "Petit budget ? Trouvez l'accessoire de survie ou de camping universel sans vous ruiner. Produits de haute utilité à mini prix."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 font-bold self-start">
            <Sparkles className="w-4 h-4 text-green-600 animate-spin" />
            <span>{isRtl ? "جودة مضمونة بأوفر التكاليف" : "Idéal pour compléter votre panier !"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {under99Products.map((product) => (
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
