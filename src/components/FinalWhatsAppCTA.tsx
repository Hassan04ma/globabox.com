import { ArrowUpRight, Headphones, MapPin, PhoneCall } from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

const copy={
 fr:{tag:'CONTACT & ASSISTANCE',title:'Besoin d’informations ?',text:'Une question sur un produit, une commande ou une livraison ? Choisissez le moyen de contact qui vous convient.',wa:'WhatsApp',call:'Téléphone',area:'Zone de livraison',morocco:'Maroc'},
 ar:{tag:'التواصل والمساعدة',title:'محتاج شي معلومة؟',text:'عندك سؤال على منتج أو طلبية أو التوصيل؟ اختار الطريقة المناسبة للتواصل.',wa:'واتساب',call:'الهاتف',area:'منطقة التوصيل',morocco:'المغرب'},
 en:{tag:'CONTACT & SUPPORT',title:'How can we help?',text:'Questions about products, orders or delivery? Choose your preferred contact option.',wa:'WhatsApp',call:'Phone',area:'Delivery area',morocco:'Morocco'}
} as const;

export default function FinalWhatsAppCTA({language}:{language:Language}){
 const t=copy[language];
 return <section id="store-contact" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir={language==='ar'?'rtl':'ltr'}>
  <div className="rounded-[26px] border border-[#dce9e1] bg-[#f5f9f6] p-6 sm:p-9">
    <div className="mb-7 max-w-2xl">
      <p className="mb-2 text-[11px] font-extrabold tracking-[.15em] text-[#247565]">{t.tag}</p>
      <h2 className="text-2xl font-black text-[#193e38] sm:text-3xl">{t.title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{t.text}</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="group flex min-h-[104px] items-center gap-4 rounded-2xl border border-[#c5e6d0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#25d366] hover:shadow-md">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25d366] text-white"><WhatsAppIcon className="h-6 w-6"/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#143f32]">{t.wa}</span><span className="mt-1 block text-[11px] text-slate-500">GLOBABOX Support</span></span><ArrowUpRight size={18} className="text-[#104d43]"/>
      </a>
      <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="group flex min-h-[104px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#104d43] hover:shadow-md">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f2ec] text-[#104d43]"><PhoneCall size={23}/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#143f32]">{t.call}</span><span dir="ltr" className="mt-1 block text-xs text-slate-500">{ORDER_SUPPORT_NUMBER}</span></span><ArrowUpRight size={18} className="text-[#104d43]"/>
      </a>
      <div className="flex min-h-[104px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff3d1] text-[#956d18]"><MapPin size={23}/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#143f32]">{t.area}</span><span className="mt-1 block text-xs text-slate-500">{t.morocco}</span></span>
      </div>
    </div>
  </div>
 </section>;
}
