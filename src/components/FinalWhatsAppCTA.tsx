import React from 'react';
import { MessageSquare, PhoneCall, CheckCircle, Flame } from 'lucide-react';
import { Language } from '../types';
import { triggerWhatsAppClick } from '../utils/analytics';
import { DISPLAY_PHONE, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface FinalWhatsAppCTAProps {
  language: Language;
  onWhatsAppOrder?: (params?: any) => void;
}

export default function FinalWhatsAppCTA({ language, onWhatsAppOrder }: FinalWhatsAppCTAProps) {
  const isRtl = language === "ar";
  const supportNumber = DISPLAY_PHONE;
  const waLink = WHATSAPP_LINK;

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="final-whatsapp-cta-section"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-[#0B1528] to-slate-900 rounded-3xl border border-blue-900 p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 shadow-2xl relative">
        {/* Animated ambient blob */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl -mr-20 -mt-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl -ml-20 -mb-20 -z-10" />

        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-405 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{isRtl ? "خدمة مبيعات فورية متوفرة الآن" : "SUPPORT MAROC EN DIRECT SUR WHATSAPP"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {isRtl ? "هل تفضل الطلب والاستفسار مباشرة عبر واتساب ؟" : "Vous préférez commander directement sur WhatsApp ?"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-semibold">
            {isRtl 
              ? "إذا واجهت أي صعوبة في استخدام السلة والطلب من الموقع، أو لديك أسئلة بخصوص مقاسات تينت وخيمة الكامبينغ، فإن وكلائنا متصلون الآن لمساعدتك خطوة بخطوة بالصور والفيديو !"
              : "Nos conseillers clientèle basés au Maroc sont en ligne ! Que ce soit pour poser des questions sur les dimensions de nos tentes de camping, demander des photos réelles ou commander sans passer par le panier, nous sommes là."}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? "رد فوري في أقل من 10 دقائق" : "Réponse en moins de 10 minutes"}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? "توصيل آمن لجميع مدن المملكة" : "Expédition le jour-même"}</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-4 justify-center">
          {/* Main Huge WhatsApp CTA button */}
          <button
            onClick={() => {
              triggerWhatsAppClick('Final CTA Section');
              if (onWhatsAppOrder) {
                onWhatsAppOrder({ source: 'final_cta' });
              } else {
                window.open(waLink, '_blank', 'noreferrer');
              }
            }}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-3 shadow-xl transform hover:scale-103 active:scale-97 cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
            <div className="text-left font-sans leading-tight">
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">
                {isRtl ? "اطلب عبر المراسلة" : "COMMANDER PAR WHATSAPP"}
              </span>
              <span className="text-xs font-black">{supportNumber}</span>
            </div>
          </button>

          {/* Phone call support fallback CTA */}
          <a
            href={`tel:${supportNumber}`}
            className="w-full sm:w-auto px-8 py-4 bg-[#122037] border border-[#213757] text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-3 hover:bg-[#1a2e4e]"
          >
            <PhoneCall className="w-4 h-4 text-orange-400" />
            <div className="text-left leading-tight">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">
                {isRtl ? "اتصال مباشر" : "S'ENTRETENIR PAR TÉLÉPHONE"}
              </span>
              <span className="text-xs font-mono font-bold text-white">{supportNumber}</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
