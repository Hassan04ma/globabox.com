import { ArrowRight, ArrowUpRight, CheckCircle2, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import type { Language } from '../types';

interface HeroProps {
  language: Language;
  onExploreClick: () => void;
  onWhatsAppOrder?: (params?: any) => void;
}

const text = {
  fr: {
    eyebrow: 'GLOBABOX · VOTRE BOUTIQUE AU MAROC',
    title: 'Les essentiels du quotidien, au bon prix.',
    subtitle: 'Maison, technologie, accessoires, sport et bien plus. Découvrez une sélection pratique, avec des prix clairs et une commande facile.',
    discover: 'Découvrir les produits', support: 'Besoin de conseils ?',
    sideTitle: 'Des trouvailles pour chaque envie.',
    sideBody: 'Explorez nos catégories et commandez depuis chez vous.',
    categories: 'Toutes les catégories',
    feature1: 'Paiement à la livraison', feature2: 'Livraison partout au Maroc',
    feature3: 'Offerte dès 500 DH'
  },
  ar: {
    eyebrow: 'GLOBABOX · متجرك الإلكتروني بالمغرب',
    title: 'كل ما تحتاجه، بثمن مناسب.',
    subtitle: 'منتجات المنزل، التكنولوجيا، الإكسسوارات، الرياضة والمزيد. اختيارات متنوعة، أثمنة واضحة، وطلب سهل من دارك.',
    discover: 'تصفح المنتجات', support: 'محتاج مساعدة؟',
    sideTitle: 'منتجات متنوعة لكل احتياجاتك.',
    sideBody: 'اكتشف الأقسام وطلب المنتجات اللي عجباتك بسهولة.',
    categories: 'جميع الأقسام',
    feature1: 'الدفع عند الاستلام', feature2: 'التوصيل بالمغرب',
    feature3: 'مجاني ابتداءً من 500 درهم'
  },
  en: {
    eyebrow: 'GLOBABOX · YOUR MOROCCAN ONLINE STORE',
    title: 'Everyday essentials. Better value.',
    subtitle: 'Home, tech, accessories, sports and more. Discover useful finds, clear prices and a simple shopping experience.',
    discover: 'Shop products', support: 'Need help?',
    sideTitle: 'Discover your next favorite find.',
    sideBody: 'Explore categories and order conveniently from home.',
    categories: 'All categories',
    feature1: 'Cash on delivery', feature2: 'Delivery across Morocco',
    feature3: 'Free from 500 MAD'
  }
} as const;

export default function Hero({ language, onExploreClick, onWhatsAppOrder }: HeroProps) {
  const c = text[language] || text.fr;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 pb-5 sm:px-6 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={c.eyebrow}>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative isolate min-h-[390px] overflow-hidden rounded-[28px] bg-[#102c38] px-6 py-10 text-white sm:px-10 sm:py-14 lg:min-h-[470px]">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102c38]/95 via-[#102c38]/85 to-[#102c38]/40" />
          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center">
            <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[.1em]">{c.eyebrow}</p>
            <h1 className="max-w-[600px] text-4xl font-extrabold leading-[1.14] tracking-tight sm:text-5xl lg:text-[54px]">{c.title}</h1>
            <p className="mt-5 max-w-[500px] text-sm leading-7 text-white/85 sm:text-base">{c.subtitle}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button onClick={onExploreClick} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#f8ce46] px-6 py-3 text-sm font-bold text-[#172c33] transition hover:bg-yellow-300">
                {c.discover}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button onClick={() => onWhatsAppOrder?.({source:'hero_support',customMessage: language==='ar' ? 'سلام GLOBABOX، بغيت مساعدة بخصوص المنتجات المتوفرة.' : 'Bonjour GLOBABOX, je souhaite des renseignements sur vos produits.'})} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                {c.support}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-4">
          <button onClick={onExploreClick} className="group relative min-h-[205px] overflow-hidden rounded-[26px] bg-[#edf2f0] p-7 text-start">
            <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=850&q=80" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e7f0ed] via-[#e7f0ed]/90 to-transparent" />
            <div className="relative max-w-[270px]">
              <span className="text-[11px] font-bold uppercase tracking-[.15em] text-[#356b66]">GLOBABOX PICKS</span>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-[#1c3439]">{c.sideTitle}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-600">{c.sideBody}</p>
            </div>
          </button>
          <button onClick={onExploreClick} className="group relative flex min-h-[205px] items-end overflow-hidden rounded-[26px] bg-[#f7e6bc] p-7 text-start">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=850&q=80" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7e6bc] via-[#f7e6bc]/75 to-transparent" />
            <div className="relative flex w-full items-end justify-between gap-3">
              <div><span className="text-[11px] font-semibold tracking-widest text-[#806625]">SHOP ALL</span><h2 className="mt-1 text-2xl font-extrabold text-[#263b3c]">{c.categories}</h2></div>
              <span className="rounded-full bg-white p-3 text-slate-800 shadow-sm"><ArrowUpRight className="h-5 w-5" /></span>
            </div>
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-semibold text-slate-700 sm:grid-cols-3 sm:gap-5">
        <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-teal-700"/>{c.feature1}</div>
        <div className="flex items-center gap-3"><Truck className="h-5 w-5 text-teal-700"/>{c.feature2}</div>
        <div className="flex items-center gap-3"><PackageCheck className="h-5 w-5 text-teal-700"/>{c.feature3}</div>
      </div>
    </section>
  );
}
