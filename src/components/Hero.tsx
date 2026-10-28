import { ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { triggerWhatsAppClick } from '../utils/analytics';
import { WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface HeroProps {
  language: Language;
  onExploreClick: () => void;
  onWhatsAppOrder?: (params?: any) => void;
}

const copy = {
  fr: {
    kicker: 'Votre boutique en ligne au Maroc',
    heading: 'Le bon choix, pour chaque besoin.',
    description: 'Découvrez une sélection de produits pour le quotidien, la maison, les loisirs et bien plus. Une expérience d’achat simple, claire et pratique.',
    primary: 'Explorer les produits',
    secondary: 'Commander sur WhatsApp',
    delivery: 'Livraison au Maroc',
    payment: 'Paiement à la livraison',
    selection: 'Des catégories à découvrir',
    aside: 'Découvrez notre sélection',
    asideText: 'Explorez les différentes catégories et trouvez facilement ce dont vous avez besoin.'
  },
  ar: {
    kicker: 'متجرك الإلكتروني في المغرب',
    heading: 'اختيارات مناسبة لكل احتياجاتك.',
    description: 'اكتشف مجموعة متنوعة من المنتجات للحياة اليومية والمنزل والترفيه والمزيد، مع تجربة تسوق واضحة وسهلة.',
    primary: 'تصفح المنتجات',
    secondary: 'اطلب عبر واتساب',
    delivery: 'التوصيل داخل المغرب',
    payment: 'الدفع عند الاستلام',
    selection: 'تشكيلة متنوعة من المنتجات',
    aside: 'اكتشف مجموعتنا',
    asideText: 'تصفح مختلف الفئات واعثر بسهولة على المنتجات التي تناسب احتياجاتك.'
  },
  en: {
    kicker: 'Your online store in Morocco',
    heading: 'Great choices for every need.',
    description: 'Explore a range of products for everyday living, home, leisure and more, with a simple and convenient shopping experience.',
    primary: 'Explore products',
    secondary: 'Order on WhatsApp',
    delivery: 'Delivery across Morocco',
    payment: 'Cash on delivery',
    selection: 'Categories worth exploring',
    aside: 'Discover our collection',
    asideText: 'Browse different categories and find what fits your needs with ease.'
  }
};

export default function Hero({ language, onExploreClick, onWhatsAppOrder }: HeroProps) {
  const c = copy[language] ?? copy.fr;
  const isRtl = language === 'ar';
  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="relative overflow-hidden bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600">{c.kicker}</span>
            <h1 className="mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] font-bold text-slate-950">{c.heading}</h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-8 text-slate-600">{c.description}</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button id="hero-explore-shop-btn" onClick={onExploreClick} className="inline-flex justify-center items-center gap-2 rounded-xl bg-slate-950 px-7 py-4 text-white text-sm font-semibold hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
                {c.primary}<ArrowRight size={18} className={isRtl ? 'rotate-180' : ''} />
              </button>
              <button id="hero-whatsapp-btn" onClick={() => { triggerWhatsAppClick('Hero Layout Button'); if (onWhatsAppOrder) onWhatsAppOrder({source:'hero'}); else window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer'); }} className="inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                <WhatsAppIcon className="w-5 h-5" />{c.secondary}
              </button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><Truck size={17} className="text-slate-700" />{c.delivery}</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-slate-700" />{c.payment}</span>
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-slate-50 border border-slate-100 p-7 sm:p-10 lg:p-12 min-h-[320px] flex flex-col justify-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-slate-200 text-slate-900 shadow-sm"><ShoppingBag size={26} strokeWidth={1.7} /></div>
            <p className="mt-9 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">{c.selection}</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">{c.aside}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{c.asideText}</p>
            <button onClick={onExploreClick} className="mt-8 self-start inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:underline">{c.primary}<ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
