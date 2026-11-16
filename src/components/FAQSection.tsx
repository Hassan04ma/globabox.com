import { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import type { Language } from '../types';

type Q = { q:string; a:string };
const copy: Record<Language,{title:string;subtitle:string;questions:Q[]}> = {
  fr: {
    title:'Questions fréquentes',subtitle:'Les informations essentielles pour commander en toute confiance.',
    questions:[
      {q:'Comment payer ma commande ?',a:'Le paiement se fait en espèces à la livraison. Aucun paiement en ligne n’est nécessaire.'},
      {q:'Quels sont les frais de livraison ?',a:'La livraison coûte 35 DH pour une commande inférieure à 500 DH. Elle est offerte à partir de 500 DH. Le total est affiché avant validation.'},
      {q:'Où livrez-vous ?',a:'Nous organisons la livraison au Maroc. La disponibilité pour votre adresse et le délai estimé sont confirmés avec vous avant expédition.'},
      {q:'Comment puis-je suivre ma commande ?',a:'Utilisez « Suivre ma commande » sur le site avec votre référence, ou contactez notre service client.'},
      {q:'Puis-je commander sur WhatsApp ?',a:'Oui, vous pouvez contacter GLOBABOX sur WhatsApp pour demander des informations. Une conversation WhatsApp seule ne constitue pas une commande enregistrée sur le site.'}
    ]
  },
  ar: {
    title:'الأسئلة الشائعة',subtitle:'كل ما تحتاج معرفته قبل إتمام الطلب.',
    questions:[
      {q:'كيفاش نخلص الطلبية؟',a:'الدفع نقداً عند الاستلام، وما كاين حتى دفع إلكتروني ضروري.'},
      {q:'شحال ثمن التوصيل؟',a:'التوصيل بـ35 درهم للطلبات أقل من 500 درهم، ومجاني ابتداءً من 500 درهم. المجموع كيظهر قبل تأكيد الطلب.'},
      {q:'واش التوصيل متوفر للمدينة ديالي؟',a:'كننظمو التوصيل داخل المغرب، وكنأكدو معاك إمكانية التوصيل للعنوان ديالك والمدة المتوقعة قبل الإرسال.'},
      {q:'كيفاش نتبع الطلبية؟',a:'استعمل «تتبع الطلب» فالموقع بالمرجع ديال الطلبية أو تواصل مع خدمة الزبناء.'},
      {q:'واش نقدر نتواصل عبر واتساب؟',a:'نعم، تقدر تسول عبر واتساب على المنتجات والتوصيل. غير المحادثة بوحدها ما كتعتبرش طلبية مسجلة فالموقع.'}
    ]
  },
  en: {
    title:'Frequently asked questions',subtitle:'The essentials for a clear shopping experience.',
    questions:[
      {q:'How do I pay?',a:'You pay in cash on delivery. No online payment is required.'},
      {q:'How much is delivery?',a:'Delivery costs 35 MAD for orders below 500 MAD and is free from 500 MAD. The total is shown before checkout.'},
      {q:'Where do you deliver?',a:'We organize delivery within Morocco. We confirm service availability at your address and estimated timing before dispatch.'},
      {q:'How can I track my order?',a:'Use Track Order on the website with your reference number, or contact customer support.'},
      {q:'Can I order via WhatsApp?',a:'You can contact us on WhatsApp for assistance. A WhatsApp conversation alone is not a recorded website order.'}
    ]
  }
};

export default function FAQSection({language}:{language:Language}) {
  const [open, setOpen]=useState<number|null>(0);
  const c=copy[language];
  return (
    <section id="faq-section" dir={language==='ar'?'rtl':'ltr'} className="border-t border-slate-100 bg-[#f6f8f6] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <CircleHelp className="mx-auto mb-3 text-[#104d43]" size={27}/>
          <h2 className="text-2xl font-extrabold text-[#193e38] sm:text-3xl">{c.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{c.subtitle}</p>
        </div>
        <div className="space-y-3">
          {c.questions.map((item,i)=><div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button type="button" onClick={()=>setOpen(open===i?null:i)} aria-expanded={open===i}
              className="flex w-full items-center justify-between gap-4 p-4 text-start text-sm font-bold text-slate-800 hover:text-[#104d43]">
              {item.q}<ChevronDown size={18} className={'shrink-0 transition-transform '+(open===i?'rotate-180 text-[#104d43]':'text-slate-400')}/>
            </button>
            {open===i&&<p className="border-t border-slate-100 px-4 py-4 text-sm leading-7 text-slate-600">{item.a}</p>}
          </div>)}
        </div>
      </div>
    </section>
  );
}
