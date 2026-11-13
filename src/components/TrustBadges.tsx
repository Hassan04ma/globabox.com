import { Headphones, ShieldCheck, Truck, PackageCheck } from 'lucide-react';
import type { Language } from '../types';

const content = {
  fr: {
    a:'Paiement à la réception', ad:'Réglez votre commande en espèces à la livraison.',
    b:'Livraison organisée au Maroc', bd:'La destination et les délais sont confirmés avant expédition.',
    c:'Frais clairs', cd:'35 DH sous 500 DH, livraison offerte dès 500 DH.',
    d:'Besoin d’aide ?', dd:'Contactez notre service client pour des questions sur les produits.'
  },
  ar: {
    a:'الدفع عند الاستلام', ad:'خلص الطلبية نقداً منين توصلك.',
    b:'توصيل داخل المغرب', bd:'كنأكدو معاك التوصيل والمدة المتوقعة قبل الإرسال.',
    c:'ثمن التوصيل واضح', cd:'35 درهم للطلبات أقل من 500 درهم، ومجاني ابتداءً من 500 درهم.',
    d:'محتاج مساعدة؟', dd:'تواصل مع خدمة الزبناء للاستفسار على المنتجات.'
  },
  en: {
    a:'Cash on delivery', ad:'Pay for your order in cash at delivery.',
    b:'Delivery within Morocco', bd:'We confirm destination and timing before dispatch.',
    c:'Clear shipping costs', cd:'35 MAD under 500 MAD; free shipping from 500 MAD.',
    d:'Questions?', dd:'Contact our customer support for product information.'
  }
} as const;

export default function TrustBadges({language}:{language:Language}) {
  const t=content[language];
  const items=[
    {icon:ShieldCheck,title:t.a,description:t.ad},
    {icon:Truck,title:t.b,description:t.bd},
    {icon:PackageCheck,title:t.c,description:t.cd},
    {icon:Headphones,title:t.d,description:t.dd}
  ];
  return <section dir={language==='ar'?'rtl':'ltr'} aria-label="GLOBABOX service" className="mx-auto my-10 max-w-7xl rounded-2xl border border-slate-200 bg-[#f6f8f6] px-5 py-6">
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item,i)=><div key={i} className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#104d43] shadow-sm"><item.icon size={21}/></div>
        <div><h3 className="text-sm font-bold text-[#193e38]">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p></div>
      </div>)}
    </div>
  </section>;
}
