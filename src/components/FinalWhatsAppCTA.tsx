import { MessageCircle, Phone, Headphones } from 'lucide-react';
import type { Language } from '../types';
import { triggerWhatsAppClick } from '../utils/analytics';
import { DISPLAY_PHONE, WHATSAPP_LINK } from '../data';

interface Props { language: Language; onWhatsAppOrder?: (params?: any)=>void; }

const copy = {
  fr: {badge:'SERVICE CLIENT',title:'Une question avant de commander ?',text:'Contactez GLOBABOX pour vous renseigner sur un produit, sa disponibilité ou sa livraison.',whatsapp:'Écrire sur WhatsApp',call:'Appeler le service client'},
  ar: {badge:'خدمة الزبناء',title:'عندك شي سؤال قبل ما تطلب؟',text:'تواصل مع جلوبابوكس باش تستفسر على المنتجات، التوفر أو التوصيل.',whatsapp:'تواصل عبر واتساب',call:'اتصل بخدمة الزبناء'},
  en: {badge:'CUSTOMER SUPPORT',title:'Need help before ordering?',text:'Contact GLOBABOX for product details, stock and delivery questions.',whatsapp:'Message on WhatsApp',call:'Call customer service'}
} as const;

export default function FinalWhatsAppCTA({language,onWhatsAppOrder}:Props) {
 const c=copy[language];
 return <section id="final-whatsapp-cta-section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" dir={language==='ar'?'rtl':'ltr'}>
   <div className="flex flex-col items-center justify-between gap-7 rounded-[26px] bg-[#104d43] px-6 py-10 text-white sm:px-10 lg:flex-row">
     <div className="max-w-xl text-center lg:text-start">
       <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-[#f4c75a]"><Headphones size={17}/>{c.badge}</div>
       <h2 className="text-2xl font-black sm:text-3xl">{c.title}</h2>
       <p className="mt-3 text-sm leading-7 text-white/80">{c.text}</p>
     </div>
     <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
       <button type="button" onClick={()=>{triggerWhatsAppClick('Final CTA Section'); if(onWhatsAppOrder){onWhatsAppOrder({source:'final_cta',customMessage:language==='ar'?'سلام، بغيت نستفسر على شي منتج فـ GLOBABOX.':'Bonjour, je souhaite des informations sur les produits GLOBABOX.'});}else{window.open(WHATSAPP_LINK,'_blank','noopener,noreferrer');}}} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f4c75a] px-5 text-sm font-bold text-[#193e38] hover:bg-yellow-300">
         <MessageCircle size={18}/>{c.whatsapp}
       </button>
       <a href={'tel:'+DISPLAY_PHONE} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/45 px-5 text-sm font-bold text-white hover:bg-white/10">
         <Phone size={17}/>{c.call}
       </a>
     </div>
   </div>
 </section>;
}
