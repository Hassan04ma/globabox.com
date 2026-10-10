import React from 'react';
import { Truck, ShieldCheck, HelpCircle, MapPin, BadgePercent, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WA_LINK } from '../data';

interface FreeDeliverySectionProps {
  language: Language;
}

export default function FreeDeliverySection({ language }: FreeDeliverySectionProps) {
  const isRtl = language === "ar";

  const data = {
    fr: {
      badge: "LIVRAISON GRATUITE & CONFORT MAXIMUM",
      title: "Profitez de la Livraison Gratuite Partout au Maroc !",
      desc: "À partir de 500 DH d'achat (ou pour tout achat de nos Packs Économiques), Globabox prend en charge l'intégralité des frais de transport directement chez vous. Aucune surprise à la livraison !",
      citiesTitle: "Villes principales desservies en 24h/48h :",
      cities: ["Casablanca", "Rabat", "Marrakech", "Agadir", "Tanger", "Fès", "Meknès", "Oujda", "Laâyoune", "Et partout au Maroc"],
      stats: [
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "0 DH de frais de livraison",
          sub: "Pour tous les articles éligibles"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "Paiement à réception",
          sub: "Payez cash après avoir vérifié le colis"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "Expédition sous 24h",
          sub: "Traitement ultra-rapide"
        }
      ],
      processTitle: "Comment ça fonctionne ?",
      process: [
        {
          step: "01",
          heading: "Validation rapide par appel ou WhatsApp",
          text: "Dès que vous validez votre commande sur le site, notre équipe vous contacte par appel direct ou par WhatsApp pour confirmer les informations de livraison avant de procéder à l'envoi."
        },
        {
          step: "02",
          heading: "Expédition sécurisée (24h/48h)",
          text: "Votre colis est soigneusement emballé au dépôt de Casablanca, remis à notre transporteur de confiance pour une livraison express chez vous en 24h/48h selon votre ville."
        },
        {
          step: "03",
          heading: "Vérification au déballage & Paiement",
          text: "Le livreur local vous contacte à votre arrivée. Vous bénéficiez d'un paiement à la livraison (COD) 100% sécurisé : vous payez uniquement après avoir inspecté le produit."
        }
      ]
    },
    ar: {
      badge: "الشحن المجاني والراحة والضمان",
      title: "استمتعوا بالتوصيل المجاني إلى جميع مدن المغرب بالكامل !",
      desc: "عند الشراء بقيمة 500 درهم أو أكثر (أو عند طلب أي من باقاتنا الاقتصادية)، تتكفل جلوبابوكس بدفع كامل مصاريف التوصيل حتى باب بيتكم. خالية من أي رسوم مفاجئة !",
      citiesTitle: "المدن المغطاة بالتوصيل السريع (24-48 ساعة):",
      cities: ["الدار البيضاء", "الرباط", "مراكش", "أكادير", "طنجة", "فاس", "مكناس", "وجدة", "العيون", "وجميع المدن الأخرى المغربية"],
      stats: [
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "0 درهم رسوم شحن",
          sub: "لكافة الطلبات المؤهلة والباقات"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "الدفع كاش عند الاستلام",
          sub: "افحص طلبيتك بيدك أولاً ثم ادفع"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "مستعد للشحن خلال 24 ساعة",
          sub: "خروج فوري وتتبع مباشر"
        }
      ],
      processTitle: "كيف تجري عملية التوصيل بموثوقية ؟",
      process: [
        {
          step: "01",
          heading: "تأكيد الطلب الفوري عبر الهاتف أو واتساب",
          text: "فور إرسال طلبيتك على الموقع، يتصل بك أحد وكلائنا عبر الهاتف أو الواتساب لتأكيد معلوماتك وعنوان التوصيل بدقة قبل عملية الشحن."
        },
        {
          step: "02",
          heading: "شحن سريع وآمن خلال 24/48 ساعة",
          text: "يتم تعبئة وتجهيز طلبيتك بعناية كبيرة بمركز التوزيع بالدار البيضاء، ثم تُسلم إلى شريكنا المعتمد لتصلك في 24 إلى 48 ساعة حسب مدينتك."
        },
        {
          step: "03",
          heading: "المعاينة باليد والدفع عند الاستلام",
          text: "يتصل بك الموزع قبل مجيئه. ميزة الدفع عند الاستلام (COD) تضمن لك فحص السلعة والتأكد من جودتها ومطابقتها قبل الدفع."
        }
      ]
    },
    en: {
      badge: "FREE SHIPPING & MAXIMUM TRUST ASSURANCE",
      title: "Enjoy 100% Free Shipping Anywhere in Morocco!",
      desc: "For purchases above 500 DH (or when ordering any of our economic bundles), Globabox bears all transport fees to your address. No hidden delivery costs, ever!",
      citiesTitle: "Major Cities Served within 24h/48h:",
      cities: ["Casablanca", "Rabat", "Marrakech", "Agadir", "Tanger", "Fes", "Meknes", "Oujda", "Laayoune", "And anywhere in Morocco"],
      stats: [
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "0 DH Shipping Fees",
          sub: "On all qualifying orders and packs"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "Cash on Delivery",
          sub: "Verify first and pay only when physically secure"
        },
        {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          label: "Dispatched within 24h",
          sub: "Ultra express handling"
        }
      ],
      processTitle: "How does it work?",
      process: [
        {
          step: "01",
          heading: "Order confirmation by phone or WhatsApp",
          text: "As soon as you validate your order, our dedicated team will contact you via a phone call or WhatsApp message to double-check details before packing."
        },
        {
          step: "02",
          heading: "Express Morocco delivery (24h/48h)",
          text: "Your order is prepared at our Casablanca depot and handed over to our delivery networks to reach your address in 24h/48h depending on the city."
        },
        {
          step: "03",
          heading: "Inspect upon receipt & Secure Cash on Delivery",
          text: "Our local courier rings you beforehand. Unbox, inspect your products, and hand over cash only once the details are perfectly verified."
        }
      ]
    }
  };

  const current = data[language] || data.fr;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="free-delivery-section"
    >
      <div className="bg-gradient-to-br from-[#0c1626] to-[#12233f] text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-blue-900/40">
        {/* Absolute glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
 
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase px-3 py-1.5 rounded-full tracking-wider border border-emerald-500/10">
              <Truck className="w-3.5 h-3.5 animate-bounce" />
              <span>{current.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {current.title}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
              {current.desc}
            </p>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              {current.stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{stat.sub}</span>
                </div>
              ))}
            </div>

            {/* Cities Tag List */}
            <div className="pt-5 border-t border-white/5 space-y-2">
              <h4 className="text-[11px] font-black uppercase text-orange-400 tracking-wider">
                {current.citiesTitle}
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {current.cities.map((city, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-bold bg-[#13223c] border border-blue-900/30 text-slate-200 py-1 px-2.5 rounded-lg hover:border-orange-500/30 transition-all cursor-default flex items-center gap-1 shrink-0"
                  >
                    <MapPin size={10} className="text-orange-500" />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Core Transport Step Guide */}
          <div className="lg:col-span-6 bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-white/10 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-400 border-b border-white/5 pb-3">
              {current.processTitle}
            </h3>

            <div className="space-y-5">
              {current.process.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-xl font-black text-orange-500/30 font-mono tracking-tight shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {step.heading}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
