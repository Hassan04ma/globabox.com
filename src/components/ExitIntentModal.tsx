import React, { useState, useEffect } from 'react';
import { ShoppingBag, Flame, X, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { WHATSAPP_NUMBER } from '../data';

interface ExitIntentModalProps {
  language: Language;
  onExploreOffers: () => void;
  onWhatsAppOrder?: (params?: any) => void;
}

export default function ExitIntentModal({ language, onExploreOffers, onWhatsAppOrder }: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = language === 'ar';

  // Localized texts matching user requests with elegant Arabic & English translations
  const modalText = {
    title: {
      fr: "Avant de partir !",
      ar: "قبل أن تذهب !",
      en: "Before you go!"
    },
    message: {
      fr: "Profitez de nos offres Globabox avec paiement à la livraison partout au Maroc.",
      ar: "استفد من عروض Globabox المميزة مع الدفع عند الاستلام في جميع أنحاء المغرب.",
      en: "Enjoy our Globabox offers with cash on delivery anywhere in Morocco."
    },
    btnExplore: {
      fr: "Voir les offres",
      ar: "عرض العروض",
      en: "View Offers"
    },
    btnWhatsApp: {
      fr: "Commander sur WhatsApp",
      ar: "الطلب عبر واتساب",
      en: "Order on WhatsApp"
    },
    benefit1: {
      fr: "Livraison gratuite 24/48h",
      ar: "توصيل مجاني خلال 24/48 ساعة",
      en: "Free 24/48h delivery"
    },
    benefit2: {
      fr: "Paiement à la livraison sécurisé",
      ar: "الدفع عند الاستلام بكل أمان",
      en: "Secure cash on delivery"
    }
  };

  const getTxt = (key: keyof typeof modalText) => {
    return modalText[key][language] || modalText[key]['fr'];
  };

  useEffect(() => {
    // Check if shown in the past 24 hours to honor "Do not show it too many times."
    const lastShown = localStorage.getItem('globabox_exit_intent_shown_v1');
    if (lastShown) {
      const now = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (now - parseInt(lastShown, 10) < oneDayInMs) {
        return; // Suppressed within 24 hours
      }
    }

    let mobileLastScrollY = window.scrollY;
    let mobileScrollTriggered = false;

    // Trigger Popup
    const showPopup = () => {
      setIsOpen(true);
      localStorage.setItem('globabox_exit_intent_shown_v1', Date.now().toString());
    };

    // 1. Desktop: Mouse leaves viewport to the top (address bar, close button)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 30) {
        showPopup();
        cleanupListeners();
      }
    };

    // 2. Mobile: User scrolls up rapidly
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = mobileLastScrollY - currentScrollY;

      // If user has scrolled down a bit (> 350px) and scrolls up rapidly (> 45px in one frame/event)
      if (currentScrollY > 350 && scrollDiff > 45 && !mobileScrollTriggered) {
        mobileScrollTriggered = true;
        showPopup();
        cleanupListeners();
      }

      mobileLastScrollY = currentScrollY;
    };

    // Listeners binder
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const cleanupListeners = () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };

    return () => {
      cleanupListeners();
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleExploreClick = () => {
    setIsOpen(false);
    onExploreOffers();
  };

  const handleWhatsAppClick = () => {
    setIsOpen(false);
    const text = "Bonjour, je souhaite profiter des offres Globabox avec paiement à la livraison";
    if (onWhatsAppOrder) {
      onWhatsAppOrder({
        customMessage: text,
        source: 'exit_intent'
      });
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
    }
  };

  return (
    <div 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0b1528] text-white border border-teal-500/20 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 animate-scale-up">
        {/* Dynamic Glowing Accent Background */}
        <div className="absolute -top-24 -left-20 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 transition-colors cursor-pointer`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon / Badge */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg relative animate-pulse">
            <Flame className="w-8 h-8 fill-amber-300 text-amber-300" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Promo
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black tracking-tight text-white font-sans">
            {getTxt('title')}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto font-sans">
            {getTxt('message')}
          </p>
        </div>

        {/* Key trust badges */}
        <div className="my-6 bg-[#13223c]/50 rounded-2xl p-4 border border-[#22395e]/50 space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{getTxt('benefit1')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{getTxt('benefit2')}</span>
          </div>
        </div>

        {/* Actions Button Stack */}
        <div className="space-y-2.5">
          {/* Action 1: Commander sur WhatsApp */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow shrink-0 font-sans text-[11px] font-black">
              w
            </span>
            <span>{getTxt('btnWhatsApp')}</span>
          </button>

          {/* Action 2: Voir les offres */}
          <button
            onClick={handleExploreClick}
            className="w-full py-3.5 bg-[#13223c] hover:bg-[#1e3254] border border-[#22395e] text-slate-100 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-orange-500" />
            <span>{getTxt('btnExplore')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
