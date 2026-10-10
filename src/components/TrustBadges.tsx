import { PhoneCall, ShieldCheck, Truck, RefreshCw, HelpCircle, MessageSquare, MapPin, CheckCircle2, Headphones } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import WhatsAppIcon from './WhatsAppIcon';

interface TrustBadgesProps {
  language: Language;
}

export default function TrustBadges({ language }: TrustBadgesProps) {
  const isRtl = language === "ar";
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const badges = [
    {
      id: "cod",
      icon: <ShieldCheck className="w-8 h-8 text-orange-500 shrink-0" />,
      titleKey: "trust_cod_title",
      descKey: "trust_cod_desc"
    },
    {
      id: "morocco",
      icon: <MapPin className="w-8 h-8 text-orange-500 shrink-0" />,
      titleKey: "trust_morocco_delivery_title",
      descKey: "trust_morocco_delivery_desc"
    },
    {
      id: "free",
      icon: <Truck className="w-8 h-8 text-orange-500 shrink-0" />,
      titleKey: "trust_free_delivery_title",
      descKey: "trust_free_delivery_desc"
    },
    {
      id: "whatsapp",
      icon: <WhatsAppIcon className="w-8 h-8 text-orange-500 shrink-0 animate-pulse fill-current" />,
      titleKey: "trust_whatsapp_title",
      descKey: "trust_whatsapp_desc"
    },
    {
      id: "support",
      icon: <Headphones className="w-8 h-8 text-orange-500 shrink-0" />,
      titleKey: "trust_fast_support_title",
      descKey: "trust_fast_support_desc"
    },
    {
      id: "verified",
      icon: <CheckCircle2 className="w-8 h-8 text-orange-500 shrink-0" />,
      titleKey: "trust_verified_products_title",
      descKey: "trust_verified_products_desc"
    }
  ];

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 my-8 max-w-7xl mx-auto shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
          >
            <div className="p-3 bg-[#0B1528] rounded-xl border border-blue-900/40 group-hover:border-orange-500 transition-colors shrink-0">
              {badge.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-1 group-hover:text-orange-600 transition-colors">
                {t(badge.titleKey)}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {t(badge.descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Notice Board */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <HelpCircle className="w-4 h-4 text-orange-500" />
          <span className="font-semibold">{t('safetyNoticeDelivery')}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">RÉSEAU DE DISTRIBUTION SÉCURISÉ</span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>SSL Sécurisé</span>
            </span>
            <span className="text-slate-350 select-none">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
              <span>Paiement à la livraison Maroc</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
