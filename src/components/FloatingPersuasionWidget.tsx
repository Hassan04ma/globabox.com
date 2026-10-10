import React, { useState, useEffect } from 'react';
import { ShoppingCart, MessageSquare, ArrowRight, ShieldCheck, Heart, AlertCircle, X } from 'lucide-react';
import { Language, CartItem } from '../types';
import { TRANSLATIONS } from '../translations';
import { WA_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface FloatingPersuasionWidgetProps {
  language: Language;
  cart: CartItem[];
  onOpenCart: () => void;
}

export default function FloatingPersuasionWidget({
  language,
  cart,
  onOpenCart,
}: FloatingPersuasionWidgetProps) {
  const isRtl = language === "ar";
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  // Exit Intent / Inactivity marketing trigger
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // If cursor leaves top of window (typical search bar / tab switch)
      if (e.clientY < 20 && !hasShownExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    const handleInactivity = () => {
      // Trigger if user is inactive for 45s
      if (Date.now() - lastActivity > 45000 && !hasShownExitIntent) {
        setShowExitIntent(true);
        setHasShownExitIntent(true);
      }
    };

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);

    const interval = setInterval(handleInactivity, 5000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [lastActivity, hasShownExitIntent]);

  return (
    <>
      {/* 1. Mobile Bottom Persistent Action Bar (High Converting UX) */}
      <div 
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] py-3 px-4 sm:hidden flex items-center justify-between gap-3 animate-fade-in"
      >
        {totalItems > 0 ? (
          // Sticky CTA to checkout with cart items
          <button
            onClick={onOpenCart}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 animate-bounce" />
            <span>
              {isRtl 
                ? `تأكيد الطلب الآن (${totalItems} سلع)` 
                : `Commander maintenant (${totalItems} articles)`}
            </span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          // Sticky Quick Assist WhatsApp Advisor CTA when cart is empty
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all"
          >
            <WhatsAppIcon className="w-4 h-4 text-white shrink-0 animate-pulse" />
            <span>
              {isRtl 
                ? "تحدث مع خبير تخييم على الواتساب" 
                : "Questions ? Parlez à un Expert Bivouac"}
            </span>
          </a>
        )}
      </div>

      {/* 2. Desktop & Tablet Floating Cart Badge Reminder */}
      {totalItems > 0 && (
        <button
          onClick={onOpenCart}
          className="fixed bottom-8 right-8 sm:right-36 md:right-44 lg:right-48 z-45 hidden sm:flex items-center gap-3 bg-[#0B1528] text-white pl-4 pr-5 py-3.5 rounded-full shadow-[0_15px_45px_rgba(11,21,40,0.3)] border border-blue-900 hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
        >
          <div className="relative">
            <span className="absolute -top-3.5 -right-3.5 bg-orange-600 text-white text-[10px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-[#0B1528]">
              {totalItems}
            </span>
            <ShoppingCart className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left font-sans">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider leading-none mb-0.5">
              {isRtl ? "سلتك النشطة" : "VOTRE PANIER"}
            </span>
            <span className="text-xs font-black text-white">
              {isRtl ? "اضغط لإتمام الشراء" : "Finaliser ma commande"}
            </span>
          </div>
        </button>
      )}

      {/* 3. High Converting Exit Intent Discount/Support Overlay Trigger */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-scale-up"
          >
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 font-black text-lg p-1 hover:bg-slate-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
                <ShieldCheck className="w-9 h-9 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-black tracking-widest text-[#f97316] uppercase bg-orange-50 px-3 py-1 rounded-full">
                  {isRtl ? "مساعدة فورية مجانية" : "HÉSITATION OU BESOIN D'URGENCE ?"}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-3 leading-tight font-sans">
                  {isRtl 
                    ? "هل تحتاج لمساعدة في اختيار الخيمة المناسبة؟" 
                    : "Besoin de conseils personnalisés avant de commander ?"}
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed font-sans">
                  {isRtl 
                    ? "فريق جلوبابوكس بالدار البيضاء جاهز لمساعدتك عبر الواتساب فوراً وإرسال صور حقيقية ومقاطع فيديو للمنتجات قبل إتمام الشراء والتوصيل." 
                    : "Nos conseillers Globabox basés au Maroc sont en ligne ! Nous pouvons vous envoyer des vraies vidéos des tentes ou l'épaisseur des sacs de couchage sur WhatsApp en 1 clic."}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center gap-2.5 text-slate-600 text-left text-[11px] font-sans font-medium">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <span>
                  {isRtl 
                    ? "التوصيل مجاني لجميع عروض التوفير والطلبات التي تتخطى 500 درهم." 
                    : "Rappel : La livraison est 100% Gratuite partout au Maroc à partir de 500 DH d'achat !"}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowExitIntent(false)}
                  className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/10 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {isRtl 
                      ? "تواصل عبر الواتساب مباشرة" 
                      : "Discuter avec nous sur WhatsApp"}
                  </span>
                </a>
                
                <button
                  onClick={() => setShowExitIntent(false)}
                  className="w-full py-2.5 text-[11px] text-slate-400 hover:text-slate-650 font-bold transition-colors"
                >
                  {isRtl ? "متابعة تصفح المتجر" : "Continuer mon shopping"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
