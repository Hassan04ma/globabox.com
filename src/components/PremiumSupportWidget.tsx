import React, { useState, useEffect, useRef } from 'react';
import { Headset, Phone, Package, X, MessageSquare, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import WhatsAppIcon from './WhatsAppIcon';

interface PremiumSupportWidgetProps {
  language: Language;
  onOpenTracking: () => void;
  phoneNumber: string;
  whatsappLink: string;
  onWhatsAppOrder?: (params?: any) => void;
}

export default function PremiumSupportWidget({
  language,
  onOpenTracking,
  phoneNumber,
  whatsappLink,
  onWhatsAppOrder,
}: PremiumSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isRtl = language === 'ar';

  // Translations
  const labels = {
    fr: {
      help: "Besoin d'aide ?",
      title: "Assistance Globabox",
      subtitle: "Service client disponible 7j/7",
      whatsapp: "Commander par WhatsApp",
      whatsappSub: "Réponse instantanée 24h/24",
      call: "Appeler maintenant",
      callSub: "Tél: " + phoneNumber,
      track: "Suivre ma commande",
      trackSub: "Statut de votre colis en direct",
      close: "Fermer",
    },
    ar: {
      help: "هل تحتاج مساعدة؟",
      title: "دعم جلوبابوكس",
      subtitle: "خدمة الزبناء متوفرة 7 أيام/7",
      whatsapp: "الطلب عبر الواتساب",
      whatsappSub: "رد فوري على مدار الساعة",
      call: "اتصل بنا الآن",
      callSub: "الهاتف: " + phoneNumber,
      track: "تتبع طلبي",
      trackSub: "تتبع حالة شحنتك مباشرة",
      close: "إغلاق",
    },
    en: {
      help: "Need help?",
      title: "Globabox Support",
      subtitle: "Customer service 7 days/7",
      whatsapp: "Order via WhatsApp",
      whatsappSub: "Instant reply 24/7",
      call: "Call us now",
      callSub: "Tel: " + phoneNumber,
      track: "Track my order",
      trackSub: "Check your package status",
      close: "Close",
    },
  }[language] || {
    help: "Besoin d'aide ?",
    title: "Assistance Globabox",
    subtitle: "Service client disponible 7j/7",
    whatsapp: "Commander par WhatsApp",
    whatsappSub: "Réponse instantanée 24h/24",
    call: "Appeler maintenant",
    callSub: "Tél: " + phoneNumber,
    track: "Suivre ma commande",
    trackSub: "Statut de votre colis en direct",
    close: "Fermer",
  };

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hide tooltip after some time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  // Handler for custom WhatsApp click tracking if analytics gets triggered
  const handleWhatsAppClick = () => {
    setIsOpen(false);
    if (onWhatsAppOrder) {
      onWhatsAppOrder({ source: 'floating_widget' });
    } else {
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCallClick = () => {
    setIsOpen(false);
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleTrackClick = () => {
    setIsOpen(false);
    onOpenTracking();
  };

  return (
    <>
      <style>{`
        .premium-support-widget {
          position: fixed;
          z-index: 50;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Mobile Screen Constraints (< 480px) */
        @media (max-width: 480px) {
          .premium-support-widget {
            bottom: calc(110px + env(safe-area-inset-bottom, 0px)) !important;
            ${isRtl ? 'left: 32px !important; right: auto !important;' : 'right: 32px !important; left: auto !important;'}
          }
          .support-btn-action {
            width: 48px !important;
            height: 48px !important;
          }
          .support-icon-action {
            width: 22px !important;
            height: 22px !important;
          }
          .premium-support-popup {
            ${isRtl ? 'left: -8px !important; right: auto !important;' : 'right: -8px !important; left: auto !important;'}
            width: 290px !important;
            bottom: 60px !important;
          }
          .premium-support-tooltip {
            ${isRtl ? 'left: -8px !important; right: auto !important;' : 'right: -8px !important; left: auto !important;'}
            bottom: 60px !important;
          }
        }
        
        /* Tablet Screen Constraints (481px to 1024px) */
        @media (min-width: 481px) and (max-width: 1024px) {
          .premium-support-widget {
            bottom: calc(100px + env(safe-area-inset-bottom, 0px)) !important;
            ${isRtl ? 'left: 32px !important; right: auto !important;' : 'right: 32px !important; left: auto !important;'}
          }
          .support-btn-action {
            width: 56px !important;
            height: 56px !important;
          }
          .support-icon-action {
            width: 25px !important;
            height: 25px !important;
          }
          .premium-support-popup {
            bottom: 68px !important;
          }
          .premium-support-tooltip {
            bottom: 68px !important;
          }
        }
        
        /* Desktop Screen Constraints (> 1024px) */
        @media (min-width: 1025px) {
          .premium-support-widget {
            bottom: 32px !important;
            ${isRtl ? 'left: 48px !important; right: auto !important;' : 'right: 48px !important; left: auto !important;'}
          }
          .support-btn-action {
            width: 64px !important;
            height: 64px !important;
          }
          .support-icon-action {
            width: 28px !important;
            height: 28px !important;
          }
          .premium-support-popup {
            bottom: 76px !important;
          }
          .premium-support-tooltip {
            bottom: 76px !important;
          }
        }
      `}</style>

      <div 
        ref={widgetRef}
        className="premium-support-widget font-sans font-medium"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`absolute premium-support-popup ${
                isRtl ? 'left-0' : 'left-0 sm:left-auto sm:right-0'
              } w-[310px] sm:w-[340px] bg-[#0B1528] text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-800 overflow-hidden select-none`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-[#12223c] p-4.5 pb-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md shadow-orange-500/5">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide text-slate-100 uppercase">{labels.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{labels.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/30"
                  aria-label={labels.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Premium Mini Widget Actions List */}
              <div className="p-3.5 space-y-2 max-h-[380px] overflow-y-auto">
                
                {/* Option 1: WhatsApp (Primary Accent - Green color ONLY) */}
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#0F352E]/30 hover:bg-[#128C7E]/20 border border-[#165A4F]/40 hover:border-[#128C7E]/40 transition-all select-none text-left cursor-pointer group hover:translate-y-[-1px] duration-200"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#128C7E] flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-5.5 h-5.5 text-white shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 justify-start">
                      <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-wide">
                        {labels.whatsapp}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    </div>
                    <p className="text-[10px] text-emerald-500/80 font-medium truncate mt-0.5">{labels.whatsappSub}</p>
                  </div>
                </button>

                {/* Option 2: Telephone Call (Premium Navy Theme / Orange Accent hover) */}
                <button
                  onClick={handleCallClick}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#13223B]/30 hover:bg-slate-800/40 border border-[#1d355c]/30 hover:border-orange-500/20 transition-all select-none text-left cursor-pointer group hover:translate-y-[-1px] duration-200"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-950/20 group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-orange-400 transition-colors uppercase tracking-wide block">
                      {labels.call}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium font-mono truncate mt-0.5">{labels.callSub}</p>
                  </div>
                </button>

                {/* Option 3: Track My Order (Premium Navy Theme / Orange Accent hover) */}
                <button
                  onClick={handleTrackClick}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-[#13223B]/30 hover:bg-slate-800/40 border border-[#1d355c]/30 hover:border-orange-500/20 transition-all select-none text-left cursor-pointer group hover:translate-y-[-1px] duration-200"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 border border-slate-700 shadow-md group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-orange-400 transition-colors uppercase tracking-wide block">
                      {labels.track}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{labels.trackSub}</p>
                  </div>
                </button>

              </div>

              {/* Bottom mini disclaimer */}
              <div className="bg-slate-900/60 p-2 text-center border-t border-slate-800/50">
                <span className="text-[8.5px] font-semibold text-slate-500 tracking-wider uppercase">GLOBABOX.COM MAROC</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Support Interactive Launcher Button */}
        <div className="relative flex flex-col items-center select-none">
          
          {/* Tooltip text bubble above the button */}
          <AnimatePresence>
            {showTooltip && !isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute premium-support-tooltip ${
                  isRtl ? 'left-0 origin-bottom-left' : 'left-0 sm:left-auto sm:right-0 origin-bottom-right'
                } whitespace-nowrap bg-gradient-to-r from-slate-900 to-[#12223c] text-white border border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 px-4 py-2.5 rounded-2xl text-[11px] font-black tracking-tight flex items-center gap-2 cursor-pointer select-none transition-all active:scale-[0.98] outline-none`}
                onClick={() => {
                  setIsOpen(true);
                  setShowTooltip(false);
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span>{labels.help}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Action Circle Trigger Button */}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setShowTooltip(false);
            }}
            className={`relative support-btn-action rounded-full bg-[#0B1528] text-white border-2 border-slate-800 hover:border-orange-500 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.35)] cursor-pointer select-none outline-none overflow-hidden transition-all duration-300 ${
              isOpen ? 'rotate-90 border-orange-500 scale-95 shadow-none' : 'hover:scale-105 active:scale-95'
            }`}
            aria-expanded={isOpen}
            title={labels.title}
          >
            {/* Subtle spinning accent ring */}
            <span className="absolute inset-0 bg-radial-gradient from-transparent via-orange-500/5 to-transparent rounded-full animate-pulse pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-6 h-6 text-orange-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="widget-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {/* Ping warning dot to draw attention */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                  
                  <Headset className="support-icon-action text-orange-400 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </>
  );
}
