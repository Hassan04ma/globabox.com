import { ArrowLeft, ArrowRight, ChevronRight, Mail, MapPin, PhoneCall } from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';
import { CONTACT_EMAIL, CONTACT_EMAIL_LINK } from '../contactEmail';
import { policyContent, policyKeys, type TabKey } from './LegalPagesModal';

interface Props {
 language:Language;
 page:string;
 onSelectPage:(page:string)=>void;
 onBackToShop:()=>void;
}
const l={
 fr:{back:'Retour à la boutique',title:'Informations et politiques',subtitle:'Toutes les informations utiles pour commander chez GLOBABOX.',contact:'Parler au service client',call:'Appeler',email:'E-mail',area:'Zone de livraison : Maroc',updated:'Ces informations restent soumises aux conditions applicables à chaque commande.'},
 ar:{back:'الرجوع للمتجر',title:'المعلومات والسياسات',subtitle:'المعلومات اللي كتحتاج قبل ما تطلب من جلوبابوكس.',contact:'التواصل مع خدمة الزبناء',call:'اتصل بنا',email:'البريد الإلكتروني',area:'منطقة التوصيل: المغرب',updated:'تطبق كذلك الشروط والحقوق القانونية الخاصة بكل طلبية.'},
 en:{back:'Back to store',title:'Information and policies',subtitle:'Key information for shopping at GLOBABOX.',contact:'Contact customer support',call:'Call us',email:'Email',area:'Delivery area: Morocco',updated:'The applicable order terms and statutory rights also apply.'}
} as const;

export default function StoreInfoPage({language,page,onSelectPage,onBackToShop}:Props){
 const p=policyKeys.includes(page as TabKey)?page as TabKey:'about';
 const c=policyContent[language],t=l[language];
 return <main className="min-h-[65vh] bg-[#f8faf8] pb-16" dir={language==='ar'?'rtl':'ltr'} id="store-policy-page">
  <div className="border-b border-slate-200 bg-white">
    <div className="w-full max-w-none px-4 py-9 sm:px-6 lg:px-8">
      <button type="button" onClick={onBackToShop} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#104d43] hover:underline">{language==='ar'?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {t.back}</button>
      <h1 className="text-3xl font-black text-[#193e38] sm:text-4xl">{c.labels[p]}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.subtitle}</p>
    </div>
  </div>
  <div className="grid w-full max-w-none gap-7 px-4 pt-10 sm:px-6 lg:grid-cols-[250px_1fr] lg:px-8">
    <nav aria-label={t.title} className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="px-3 pb-3 pt-2 text-xs font-black text-[#193e38]">{t.title}</h2>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
        {policyKeys.map(key=><button type="button" key={key} onClick={()=>onSelectPage(key)} aria-current={key===p?'page':undefined}
          className={'flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2 text-start text-[12px] font-semibold '+(key===p?'bg-[#104d43] text-white':'text-slate-700 hover:bg-[#edf5f2]')}>
          <span>{c.labels[key]}</span><ChevronRight size={14} className={language==='ar'?'rotate-180':''}/>
        </button>)}
      </div>
    </nav>
    <article className="min-h-[460px] rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-9">
      <h2 className="border-b border-slate-100 pb-5 text-2xl font-black text-[#193e38]">{c.labels[p]}</h2>
      <div className="mt-6 space-y-5">{c.pages[p].map((paragraph,i)=><p className="text-sm leading-8 text-slate-700" key={i}>{paragraph}</p>)}</div>
      {(p==='contact'||p==='delivery'||p==='returns')&&<div className="mt-9 grid gap-3 border-t border-slate-100 pt-7 sm:grid-cols-2">
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-[#b3debe] bg-[#f0faf2] px-4 text-sm font-bold text-[#115337] hover:bg-[#e2f3e6]"><WhatsAppIcon className="h-5 w-5"/>{t.contact}</a>
        <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#193e38] hover:bg-slate-50"><PhoneCall size={19}/>{t.call}<span dir="ltr">{ORDER_SUPPORT_NUMBER}</span></a>
        {CONTACT_EMAIL && <a href={CONTACT_EMAIL_LINK} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-bold text-[#193e38] hover:bg-slate-50"><Mail size={18}/>{t.email}<span dir="ltr" className="break-all text-xs">{CONTACT_EMAIL}</span></a>}
        <p className="flex items-center gap-2 text-xs text-slate-500 sm:col-span-2"><MapPin size={16}/>{t.area}</p>
      </div>}
      <p className="mt-10 rounded-xl bg-[#f3f7f4] px-4 py-3 text-xs leading-6 text-slate-600">{t.updated}</p>
    </article>
  </div>
 </main>;
}
