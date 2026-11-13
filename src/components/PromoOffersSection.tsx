import { ArrowUpRight, BadgePercent } from 'lucide-react';
import type { Product, Language } from '../types';
import ProductCard from './ProductCard';

interface PromoOffersSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}

const copy = {
  fr: { eyebrow: 'BONS PLANS', title: 'Les offres à découvrir', desc: 'Des réductions sur une sélection de produits disponibles. Les prix affichés font foi.' },
  ar: { eyebrow: 'العروض', title: 'اكتشف عروض جلوبابوكس', desc: 'تخفيضات على منتجات مختارة ومتوفرة. الثمن المعروض هو المعتمد.' },
  en: { eyebrow: 'SPECIAL OFFERS', title: 'Deals worth discovering', desc: 'Selected items at discounted prices. The displayed prices apply.' }
} as const;

export default function PromoOffersSection({language, products, onViewDetails, onAddToCart, onInstantOrder}: PromoOffersSectionProps) {
  const offers = products.filter(p => p.inStock !== false && p.isActive !== false && Number(p.originalPrice || 0) > Number(p.price)).slice(0,4);
  if (offers.length === 0) return null;
  const c = copy[language];
  return (
    <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'} id="promo-offers-section">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff5d8] px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#98701c]"><BadgePercent size={15} />{c.eyebrow}</span>
          <h2 className="mt-2 text-2xl font-black text-[#193e38] sm:text-3xl">{c.title}</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{c.desc}</p>
        </div>
        <ArrowUpRight size={20} className="hidden text-[#104d43] sm:block" aria-hidden="true"/>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {offers.map(product=>(
          <ProductCard key={product.id} product={product} language={language} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onInstantOrder={onInstantOrder} />
        ))}
      </div>
    </section>
  );
}
