import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
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

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=75&w=1200",
  "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=75&w=1200",
  "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&q=75&w=1200"
];

export default function Hero({ language, onExploreClick, onWhatsAppOrder }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRtl = language === "ar";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const handleBestSellersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("best-sellers-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      onExploreClick();
    }
  };

  const badgeOffer = {
    fr: "Livraison 24/48h + Paiement à la livraison",
    ar: "توصيل خلال 24/48 ساعة + الدفع عند الاستلام",
    en: "24/48h Delivery + Cash on Delivery"
  }[language] || "Livraison 24/48h + Paiement à la livraison";

  const textBestSellers = {
    fr: "Voir les meilleures ventes",
    ar: "عرض الأكثر مبيعاً",
    en: "View Best Sellers"
  }[language] || "Voir les meilleures ventes";

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="relative h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden bg-neutral-950 flex flex-col justify-end"
    >
      {/* Background Slides */}
      {HERO_IMAGES.map((img, index) => {
        const altTexts = language === 'ar' ? [
          "جلوبابوكس المغرب - معدات التخييم والكشتات الاحترافية",
          "جلوبابوكس المغرب - خيام مقاومة للماء، أكياس نوم ومعدات المشي الجبلي",
          "جلوبابوكس المغرب - لوازم الصيد البري والبحري والأنشطة الخارجية"
        ] : [
          "Globabox Maroc - Matériel de bivouac et équipement camping professionnel",
          "Globabox Maroc - Tentes imperméables, sacs de couchage et matériel de randonnée",
          "Globabox Maroc - Matériel de chasse, pêche et équipement plein air"
        ];
        return (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === currentIndex ? 'opacity-100 scale-[1.02] z-0' : 'opacity-0 scale-100 -z-10'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            {/* Dark read-optimized overlays */}
            <div className="absolute inset-0 bg-black/55 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-[#070d1a]/85 to-transparent z-10" />
            <img
              src={img}
              alt={altTexts[index]}
              referrerPolicy="no-referrer"
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}

      {/* Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 w-full animate-fade-in">
        {/* Badges Container */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Urgent Promo Strip */}
          <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[11px] md:text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase leading-normal tracking-wide animate-pulse">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300 shrink-0" />
            <span>{t('bannerPromoFr')}</span>
          </div>

          {/* Delivery & CoD Offer Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#070d1a]/80 border border-orange-500/35 text-orange-400 text-[11px] md:text-sm font-black px-4 py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
            <span>{badgeOffer}</span>
          </div>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-sans tracking-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-100 font-sans leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
            {/* CTA 1: Voir les meilleures ventes */}
            <button
              onClick={handleBestSellersClick}
              className="px-7 py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer group shrink-0"
              id="hero-bestsellers-btn"
            >
              <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 fill-amber-300 text-amber-300 animate-pulse" />
              <span>{textBestSellers}</span>
            </button>

            {/* CTA 2: Order instantly on Whatsapp */}
            <button
              onClick={(e) => {
                e.preventDefault();
                triggerWhatsAppClick('Hero Layout Button');
                if (onWhatsAppOrder) {
                  onWhatsAppOrder({ source: 'hero' });
                } else {
                  window.open(WHATSAPP_LINK, "_blank", "noreferrer");
                }
              }}
              className="px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 text-sm transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
              id="hero-whatsapp-btn"
            >
              <WhatsAppIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] text-white shrink-0" />
              <span>{t('btnOrderWhatsApp')}</span>
            </button>

            {/* CTA 3: Scroll to catalog */}
            <button
              onClick={onExploreClick}
              className="px-7 py-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-slate-100 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
              id="hero-explore-shop-btn"
            >
              <span>{t('btnDiscover')}</span>
              <ArrowRight className={`w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Manual Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 z-20 flex justify-between pointer-events-none">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-neutral-900/50 hover:bg-neutral-800 text-white flex items-center justify-center border border-neutral-800/40 pointer-events-auto cursor-pointer focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-neutral-900/50 hover:bg-neutral-800 text-white flex items-center justify-center border border-neutral-800/40 pointer-events-auto cursor-pointer focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 right-8 z-20 flex gap-2">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? 'bg-orange-600 w-6' : 'bg-neutral-700'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
