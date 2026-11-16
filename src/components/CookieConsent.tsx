import { useState } from 'react';
import { Cookie, Settings2, ShieldCheck, X } from 'lucide-react';
import { getTrackingConsent, saveTrackingConsent } from '../utils/analytics';
import type { Language } from '../types';

const copy={
 fr:{title:'Respect de votre vie privée',intro:'GLOBABOX utilise les cookies nécessaires au fonctionnement de la boutique. Les mesures d’audience et pixels publicitaires sont facultatifs.',custom:'Personnaliser',all:'Tout accepter',reject:'Refuser les cookies facultatifs',save:'Enregistrer mon choix',analytics:'Mesure d’audience',marketing:'Publicité et pixels',required:'Cookies essentiels',mandatory:'Toujours actifs',details:'Les cookies essentiels assurent le panier et la sécurité. Vous pouvez modifier votre choix à tout moment.',manage:'Cookies'},
 ar:{title:'احترام خصوصيتك',intro:'جلوبابوكس كتستعمل ملفات ضرورية لخدمة المتجر. التحليلات والبيكسلات الإعلانية اختيارية.',custom:'تخصيص الاختيارات',all:'قبول الكل',reject:'رفض التتبع الاختياري',save:'حفظ الاختيار',analytics:'قياس الزيارات',marketing:'الإعلانات والبيكسلات',required:'ملفات ضرورية',mandatory:'مفعلة دائماً',details:'الملفات الضرورية كتخدم السلة والأمان. تقدر تبدّل اختيارك فأي وقت.',manage:'الكوكيز'},
 en:{title:'Your privacy matters',intro:'GLOBABOX uses essential cookies for the store. Analytics and advertising pixels are optional.',custom:'Customize',all:'Accept all',reject:'Reject optional cookies',save:'Save my choices',analytics:'Audience analytics',marketing:'Advertising pixels',required:'Essential cookies',mandatory:'Always on',details:'Essential cookies support the cart and security. You can change your choices at any time.',manage:'Cookie settings'}
} as const;
export default function CookieConsent({language}:{language:Language}){
 const [decision,setDecision]=useState(()=>getTrackingConsent());
 const [settings,setSettings]=useState(false);
 const [analytics,setAnalytics]=useState(false);
 const [marketing,setMarketing]=useState(false);
 const t=copy[language];
 const submit=(a:boolean,m:boolean)=>{saveTrackingConsent({analytics:a,marketing:m});setDecision(getTrackingConsent());setSettings(false);};
 return <>
  <button type="button" onClick={()=>{setAnalytics(Boolean(getTrackingConsent()?.analytics));setMarketing(Boolean(getTrackingConsent()?.marketing));setSettings(true);}}
    className="fixed bottom-4 start-4 z-30 flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 text-[11px] font-bold text-[#104d43] shadow-sm hover:bg-[#f2f8f4]" aria-label={t.manage}>
    <Cookie size={16}/><span className="hidden sm:inline">{t.manage}</span>
  </button>
  {(!decision||settings)&&<div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#10241a]/45 p-3 sm:items-center" role="presentation">
    <section role="dialog" aria-modal="true" aria-label={t.title} dir={language==='ar'?'rtl':'ltr'}
      className="w-full max-w-xl rounded-[22px] border border-[#d5e5d9] bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf5ee] text-[#104d43]"><ShieldCheck size={24}/></span>
        {decision&&<button type="button" onClick={()=>setSettings(false)} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button>}
      </div>
      <h2 className="mt-4 text-xl font-black text-[#193e38]">{t.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{t.intro}</p>
      {settings&&<div className="mt-5 space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f8f5] px-4 py-3 text-sm text-[#193e38]"><span>{t.required}</span><strong className="text-[11px] text-[#104d43]">{t.mandatory}</strong></div>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#193e38]">{t.analytics}<input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} className="h-5 w-5 accent-[#104d43]"/></label>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#193e38]">{t.marketing}<input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} className="h-5 w-5 accent-[#104d43]"/></label>
        <p className="text-xs leading-6 text-slate-500">{t.details}</p>
      </div>}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={()=>submit(false,false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-[#193e38] hover:bg-slate-50">{t.reject}</button>
        {settings?<button type="button" onClick={()=>submit(analytics,marketing)} className="min-h-11 flex-1 rounded-xl bg-[#104d43] px-4 text-xs font-extrabold text-white hover:bg-[#0b3931]">{t.save}</button>:<>
         <button type="button" onClick={()=>setSettings(true)} className="min-h-11 rounded-xl border border-[#b5d7c1] px-4 text-xs font-bold text-[#104d43] hover:bg-[#f2f8f4]"><Settings2 size={15} className="me-2 inline"/>{t.custom}</button>
         <button type="button" onClick={()=>submit(true,true)} className="min-h-11 flex-1 rounded-xl bg-[#104d43] px-4 text-xs font-extrabold text-white hover:bg-[#0b3931]">{t.all}</button>
        </>}
      </div>
    </section>
   </div>}
 </>;
}
