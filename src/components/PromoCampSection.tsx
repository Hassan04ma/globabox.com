import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, MessageSquare, Check, Flame, Clock, Truck, ShieldCheck } from 'lucide-react';
import { Product, Language } from '../types';
import { WHATSAPP_NUMBER } from '../data';

interface PromoCampSectionProps {
  language: Language;
  products: Product[];
  onViewDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function PromoCampSection({
  language,
  products,
  onViewDetails,
  onInstantOrder,
  onWhatsAppOrder
}: PromoCampSectionProps) {
  const isRtl = language === "ar";
  
  // Find our specific tent product
  const tentProduct = products.find(p => p.id === "tente-dome-camping-2-3-personnes");

  // Timer simulation for special urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 12 });

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
          return { hours: 6, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!tentProduct) return null;

  // Render text based on language selection
  const title = {
    fr: "Offre spéciale camping",
    ar: "عرض خاص للتخييم",
    en: "Special Camping Offer"
  }[language] || "Offre spéciale camping";

  const subtitle = {
    fr: "Profitez de vos sorties camping avec une tente pratique, légère et facile à installer.",
    ar: "استمتع برحلات التخييم مع خيمة عملية، خفيفة وسهلة التركيب.",
    en: "Enjoy camping trips with a practical, lightweight, and easy-to-install tent."
  }[language] || "";

  const whatsappMessage = `Bonjour Globabox, je souhaite confirmer ma commande.

INFORMATIONS CLIENT:
Nom: 
Téléphone: 
Ville: 
Adresse: 

PRODUITS COMMANDÉS:

1. Tente Dôme Camping 2-3 Personnes
   Quantité: 1
   Prix unitaire: 400 DH
   Total produit: 400 DH

LIVRAISON:
35 DH

RÉSUMÉ:
Sous-total: 400 DH
Livraison: 35 DH
Total à payer: 435 DH

PAIEMENT:
Paiement à la livraison

Merci de confirmer la disponibilité et la livraison.`;

  const handleWhatsAppClick = () => {
    if (onWhatsAppOrder) {
      onWhatsAppOrder({
        items: [{ product: tentProduct, quantity: 1 }],
        customMessage: whatsappMessage,
        source: 'promo_camping'
      });
    } else {
      const encoded = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noreferrer');
    }
  };

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="special-promo-camping-section"
    >
      <div className="mb-8 text-center md:text-start md:flex md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs md:text-sm font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full uppercase tracking-wider mb-2.5 inline-flex items-center gap-1.5">
            <Flame size={14} className="text-rose-600 shrink-0" />
            <span>{language === 'ar' ? "تخفيضات كبرى" : language === 'en' ? "Unmissable Deal" : "Super Promo"}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1528] tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/90 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.08)] relative overflow-hidden">
        {/* Visual elements */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-orange-200/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Column 1: Image Showcase Area */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative aspect-square rounded-2xl bg-white overflow-hidden border border-slate-200 shadow-sm group">
              <img 
                src={tentProduct.image} 
                alt={tentProduct.name[language]} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-rose-600 text-white font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
                  {language === 'ar' ? 'عرض خاص' : language === 'en' ? 'Special offer' : 'Offre spéciale'}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 z-10 bg-black/75 text-white/95 text-[10px] font-mono px-2 py-1 rounded-md backdrop-blur-xs select-none">
                100% {language === 'ar' ? "مضمون" : "Garantie"}
              </div>
            </div>

            {/* Micro Thumbnail indicators */}
            <div className="grid grid-cols-4 gap-2">
              {tentProduct.additionalImages?.slice(0, 4).map((imgUrl, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img 
                    src={imgUrl} 
                    alt="thumbnail" 
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Product Copy & Value Area */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Live Count */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs px-3.5 py-2 rounded-xl mb-4 self-start font-medium backdrop-blur-xs">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>
                {language === 'ar' ? "العرض صالح حتى نهاية المخزون!" : language === 'en' ? "Stock running low - limited offer!" : "Offre valable dans la limite des stocks!"}
              </span>
              <span className="font-mono bg-slate-950 text-white px-2 py-0.5 rounded ml-1 text-[11px] font-bold">
                {timeLeft.hours}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {tentProduct.name[language] || tentProduct.name['fr']}
            </h2>

            {/* Stars and feedback */}
            <div className="flex items-center gap-1.5 mt-2 mb-4">
              <div className="flex items-center text-amber-400 font-bold">
                ★ ★ ★ ★ ★
              </div>
              <span className="text-[11px] font-mono font-black text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">
                4.9/5 • 124 {language === 'ar' ? 'تقييم' : 'avis'} ⛺
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                400 <span className="text-lg font-bold">DH</span>
              </span>
              <span className="text-base text-slate-405 line-through">
                499 DH
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                {language === 'ar' ? 'وفر 99 درهم' : language === 'en' ? 'Save 99 DH' : 'Économisez 99 DH'} (-20%)
              </span>
            </div>

            {/* Short Decs */}
            <p className="text-slate-650 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              {tentProduct.description[language] || tentProduct.description['fr']}
            </p>

            {/* Solid bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pb-8 mb-8 border-b border-slate-200/70">
              {tentProduct.features[language]?.map((feat: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              
              {/* Order Instant Check Out */}
              <button
                onClick={() => onInstantOrder(tentProduct)}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 fill-white" />
                <span>
                  {language === 'ar' ? "اطلب الآن (الدفع عند الاستلام)" : language === 'en' ? "Buy Now (Cash on Delivery)" : "Commander maintenant"}
                </span>
              </button>

              {/* View product in modal */}
              <button
                onClick={() => onViewDetails(tentProduct)}
                className="bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.98] text-slate-800 py-3.5 px-5 rounded-2xl font-extrabold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>
                  {language === 'ar' ? "تفاصيل المنتوج" : language === 'en' ? "View Details" : "Voir le produit"}
                </span>
              </button>

              {/* WhatsApp Orders */}
              <button
                onClick={handleWhatsAppClick}
                className="bg-[#25d366] hover:bg-[#20ba5a] active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm shadow-[0_8px_20px_-6px_rgba(37,211,102,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>
                  {language === 'ar' ? "اطلب عبر الواتساب" : language === 'en' ? "Order on WhatsApp" : "Commander via WhatsApp"}
                </span>
              </button>

            </div>

            {/* Secure Badges footer */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6 text-[11px] text-slate-400 font-bold border-t border-slate-200/40 pt-4">
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-orange-500 shrink-0" />
                <span>{language === 'ar' ? "توصيل سريع مجاني" : "Livraison gratuite partout au Maroc"}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-orange-500 shrink-0" />
                <span>{language === 'ar' ? "الدفع عند الاستلام كاش" : "Paiement à la livraison cash"}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-orange-500 shrink-0" />
                <span>{language === 'ar' ? "دعم متواصل 7/24" : "Support Client (24/7)"}</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
