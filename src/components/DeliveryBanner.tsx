import React from 'react';
import { Truck, ShieldCheck, CheckSquare, Clock, Phone, Send } from 'lucide-react';
import { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WA_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface DeliveryBannerProps {
  language: Language;
}

export default function DeliveryBanner({ language }: DeliveryBannerProps) {
  const isRtl = language === "ar";

  const content = {
    fr: {
      tag: "SERVICE DE LIVRAISON OFFICIEL MAROC",
      title: "Expédition Sécurisée & Rapide à Domicile",
      desc: "Nous expédions vos colis avec le plus grand soin depuis notre point d'expédition pour garantir une livraison sans soucis.",
      items: [
        {
          icon: <Clock className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Livraison selon la destination",
          desc: "Les délais de livraison sont confirmés lors de la validation de votre commande."
        },
        {
          icon: <Truck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Toutes les villes desservies",
          desc: "Casablanca, Rabat, Marrakech, Agadir, Tanger, Fès, Meknès, Oujda, Laâyoune, etc. et centres limitrophes."
        },
        {
          icon: <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Paiement à la livraison",
          desc: "Aucun paiement en ligne requis. Vous payez en toute sécurité en espèces lors de la réception de votre colis."
        },
        {
          icon: <Send className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Confirmation par appel ou WhatsApp",
          desc: "Après votre commande, notre service client valide rapidement vos détails par appel vocal ou message WhatsApp."
        }
      ],
      supportLabel: "Support direct par Téléphone & WhatsApp :",
      supportTitle: "CONSEILS OU COMMANDES ?"
    },
    ar: {
      tag: "خدمة التوصيل الرسمية بالمغرب",
      title: "شحن آمن وضمان كامل حتى باب منزلك",
      desc: "نقوم بتجهيز وشحن طلبياتكم بكل عناية من مستودعنا المركزي بالدار البيضاء لضمان وصولها سليمة.",
      items: [
        {
          icon: <Clock className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "توصيل خلال 24/48 ساعة حسب المدينة",
          desc: "شحن سريع لجميع الطلبيات. التوصيل في غضون 24 ساعة للدار البيضاء والرباط، و48 ساعة كأقصى حد لباقي المدن."
        },
        {
          icon: <Truck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "تغطية شاملة لجميع المدن المغربية",
          desc: "الدار البيضاء، الرباط، مراكش، أكادير، طنجة، فاس، مكناس، وجدة، العيون وغيرها من المناطق."
        },
        {
          icon: <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "الدفع عند الاستلام نقداً",
          desc: "لا داعي للدفع المسبق عبر الإنترنت. ادفع نقداً بأمان للموزع بعد استلام ومعاينة طلبيتك."
        },
        {
          icon: <Send className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "تأكيد فوري عبر اتصال أو واتساب",
          desc: "بعد تقديم طلبك، يتصل بك فريقنا هاتفياً أو عبر واتساب لتأكيد معلومات التوصيل والعنوان."
        }
      ],
      supportLabel: "الدعم المباشر عبر الهاتف والواتساب :",
      supportTitle: "استفسار أو طلب مباشر؟"
    },
    en: {
      tag: "OFFICIAL MOROCCO SHIPPING SERVICE",
      title: "Secure & Swift Courier Delivery Directly to Your Door",
      desc: "Your packages are inspected and shipped with utmost care from our dispatch location.",
      items: [
        {
          icon: <Clock className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Delivery timing by destination",
          desc: "We confirm delivery timings before dispatch."
        },
        {
          icon: <Truck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "All cities & provinces covered",
          desc: "Casablanca, Rabat, Marrakech, Agadir, Tanger, Fès, Meknès, Oujda, Laâyoune, etc."
        },
        {
          icon: <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Cash on delivery (COD)",
          desc: "No online payment or deposit needed. Pay safely in cash to the courier only when you receive your box."
        },
        {
          icon: <Send className="w-5 h-5 text-orange-500 shrink-0" />,
          title: "Confirmation by call or WhatsApp",
          desc: "Every order is verified immediately via voice phone call or WhatsApp before dispatching."
        }
      ],
      supportLabel: "Live support via Phone & WhatsApp:",
      supportTitle: "DIRECT ASSISTANCE"
    }
  };

  const current = content[language] || content.fr;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 my-6"
    >
      <div className="bg-gradient-to-br from-slate-900 to-[#101D35] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        
        {/* Subtle glowing backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 text-orange-400 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider border border-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span>{current.tag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md">
              {current.desc}
            </p>

            {/* Support Callout Box */}
            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{current.supportTitle}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a 
                  href={`tel:${ORDER_SUPPORT_NUMBER}`}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold font-sans transition-all active:scale-95"
                >
                  <Phone size={14} className="text-orange-500" />
                  <span className="font-mono text-sm tracking-wide">{ORDER_SUPPORT_NUMBER}</span>
                </a>
                <a 
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all active:scale-95 shadow-md shadow-emerald-950/20"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                  <span>WhatsApp Live</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Grid of specific conditions from the checklist */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.items.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3.5 hover:border-orange-500/30 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#09111F] border border-blue-900/40 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-colors">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
