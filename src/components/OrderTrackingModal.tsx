import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, Clock3, Headphones, MapPin, Package, PackageCheck, PhoneCall, Search, ShieldCheck, Truck, X, XCircle } from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_NUMBER } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface Props {isOpen:boolean;onClose:()=>void;language:Language;}
type Stage='pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled';
interface TrackingResult {reference:string;status:Stage;date:string|null;total:number|null;itemCount:number;source:'store';courierTrackingAvailable:boolean;carrier?:string;trackingNumber?:string;}

const stages:Exclude<Stage,'cancelled'>[]=['pending','confirmed','processing','shipped','delivered'];
const labels={
 fr:{
  title:'Suivi de commande',intro:'Retrouvez les informations de votre commande GLOBABOX.',
  secure:'Recherche sécurisée',ref:'Référence de commande',phone:'Téléphone utilisé pour la commande',
  refHint:'Exemple : GB-FEEF2AA6',phoneHint:'Exemple : 0612345678',
  explain:'Saisissez la référence et le numéro de téléphone utilisés lors de votre achat.',
  action:'Consulter ma commande',busy:'Recherche en cours…',
  invalid:'Saisissez une référence GB-… et un numéro marocain valide.',
  notFound:'Commande introuvable. Vérifiez la référence et le téléphone, puis réessayez.',
  unavailable:'Le suivi est temporairement indisponible. Réessayez ou contactez le support.',
  ready:'Votre commande',current:'Statut actuel',placed:'Date de commande',items:'Articles',total:'Total enregistré',
  noCourier:'Ce statut est mis à jour par GLOBABOX. Le suivi GPS du transporteur n’est pas disponible ici.',
  contact:'Besoin d’aide ?',whatsapp:'Nous écrire sur WhatsApp',call:'Appeler',again:'Nouvelle recherche',
  privacy:'Vos coordonnées et votre adresse ne sont pas affichées.',
  pending:'En attente',confirmed:'Confirmée',processing:'En préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée',
  dateUnknown:'Date indisponible'
 },
 ar:{
  title:'تتبع الطلبية',intro:'شوف آخر حالة ديال الطلبية المسجلة عند GLOBABOX.',
  secure:'تتبع آمن',ref:'مرجع الطلبية',phone:'رقم الهاتف اللي طلبتي به',
  refHint:'مثال: GB-FEEF2AA6',phoneHint:'مثال: 0612345678',
  explain:'دخل مرجع الطلبية ورقم الهاتف المستعمل عند الشراء باش تشوف الحالة.',
  action:'تتبع الطلبية',busy:'جاري البحث…',
  invalid:'دخل مرجع GB-… ورقم هاتف مغربي صحيح.',
  notFound:'ما لقيناش الطلبية بهاد المرجع ورقم الهاتف. تأكد من المعلومات وعاود.',
  unavailable:'التتبع غير متوفر مؤقتاً. عاود المحاولة أو تواصل مع خدمة الزبناء.',
  ready:'طلبيتك',current:'الحالة الحالية',placed:'تاريخ الطلبية',items:'عدد المنتجات',total:'المجموع المسجل',
  noCourier:'هاد الحالة كيتحكم فيها فريق GLOBABOX، وماشي تتبع مباشر GPS ديال شركة التوصيل.',
  contact:'محتاج مساعدة؟',whatsapp:'تواصل عبر واتساب',call:'اتصل بنا',again:'بحث جديد',
  privacy:'ما كنظهروش العنوان والمعلومات الشخصية ديالك.',
  pending:'في انتظار التأكيد',confirmed:'تم التأكيد',processing:'قيد التجهيز',shipped:'تم الشحن',delivered:'تم التسليم',cancelled:'ملغاة',
  dateUnknown:'التاريخ غير متوفر'
 },
 en:{
  title:'Track your order',intro:'Check the latest GLOBABOX order status.',
  secure:'Secure lookup',ref:'Order reference',phone:'Phone used at checkout',
  refHint:'Example: GB-FEEF2AA6',phoneHint:'Example: 0612345678',
  explain:'Enter both the order reference and phone number used at checkout.',
  action:'Track my order',busy:'Searching…',
  invalid:'Enter your GB-… reference and a valid Moroccan phone number.',
  notFound:'Order not found. Please double-check the reference and phone number.',
  unavailable:'Tracking is temporarily unavailable. Please retry or contact support.',
  ready:'Your order',current:'Current status',placed:'Order date',items:'Items',total:'Recorded total',
  noCourier:'This status is updated by GLOBABOX. Live courier GPS tracking is not available here.',
  contact:'Need help?',whatsapp:'Message us on WhatsApp',call:'Call support',again:'New search',
  privacy:'Your address and private contact details are not shown.',
  pending:'Pending',confirmed:'Confirmed',processing:'Preparing',shipped:'Shipped',delivered:'Delivered',cancelled:'Cancelled',
  dateUnknown:'Date unavailable'
 }
} as const;
const icons={pending:Clock3,confirmed:CheckCircle2,processing:Package,shipped:Truck,delivered:PackageCheck};
const validPhone=(value:string)=>/^(?:(?:\+|00)212|0)[5-7][0-9]{8}$/.test(value.replace(/[.\s-]/g,''));

export default function OrderTrackingModal({isOpen,onClose,language}:Props){
 const [reference,setReference]=useState('');
 const [phone,setPhone]=useState('');
 const [result,setResult]=useState<TrackingResult|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const abort=useRef<AbortController|null>(null);
 const firstInput=useRef<HTMLInputElement|null>(null);
 const t=labels[language],rtl=language==='ar';
 useEffect(()=>{
  if(!isOpen){abort.current?.abort();setReference('');setPhone('');setResult(null);setError('');setLoading(false);return;}
  firstInput.current?.focus();
  const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
  document.addEventListener('keydown',esc);
  return()=>{document.removeEventListener('keydown',esc);abort.current?.abort();};
 },[isOpen,onClose]);

 const search=async(event:FormEvent)=>{
  event.preventDefault();
  setResult(null);setError('');
  const ref=reference.trim().toUpperCase(),number=phone.trim();
  if(!/^GB-[A-Z0-9-]{6,36}$/.test(ref)||!validPhone(number)){setError(t.invalid);return;}
  abort.current?.abort();
  const controller=new AbortController();abort.current=controller;
  setLoading(true);
  try{
   const response=await fetch('/api/track-order',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({reference:ref,phone:number}),signal:controller.signal});
   const payload=await response.json().catch(()=>null) as {success?:boolean;tracking?:TrackingResult}|null;
   if(controller.signal.aborted)return;
   if(response.ok&&payload?.success&&payload?.tracking){setResult(payload.tracking as TrackingResult);}
   else setError(response.status===404?t.notFound:t.unavailable);
  }catch(err){if(!controller.signal.aborted)setError(t.unavailable);}
  finally{if(!controller.signal.aborted)setLoading(false);}
 };
 const whatsapp=()=>{
  const msg=language==='ar'
   ? 'سلام، بغيت نستفسر على الطلبية ديالي '+reference.trim().toUpperCase()
   : 'Bonjour, je souhaite des informations sur ma commande '+reference.trim().toUpperCase();
  window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
 };
 if(!isOpen)return null;
 const stage=result?.status;
 const index=stage&&stage!=='cancelled'?stages.indexOf(stage):-1;
 return <div role="presentation" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071b17]/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
   <div role="dialog" aria-modal="true" aria-label={t.title} dir={rtl?'rtl':'ltr'}
    className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
    <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-[#f8faf8] px-5 py-5 sm:px-8">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e5f1e9] text-[#104d43]"><PackageCheck size={25}/></span>
        <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[.14em] text-[#25766b]">GLOBABOX · {t.secure}</p>
         <h2 className="text-xl font-black text-[#193e38] sm:text-2xl">{t.title}</h2>
         <p className="mt-1 text-xs leading-6 text-slate-500">{t.intro}</p>
        </div>
      </div>
      <button type="button" onClick={onClose} aria-label={rtl?'إغلاق':'Close'} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-[#edf5f2]"><X size={19}/></button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
      {!result ? <form onSubmit={search} className="mx-auto max-w-lg space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-[#d7e9df] bg-[#f4faf6] p-4 text-xs leading-6 text-[#315448]"><ShieldCheck size={20} className="mt-1 shrink-0 text-[#104d43]"/>{t.explain}</div>
        <div><label htmlFor="gb-track-ref" className="mb-2 block text-xs font-extrabold text-[#193e38]">{t.ref}</label>
          <div className="relative"><ClipboardList size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input ref={firstInput} id="gb-track-ref" value={reference} onChange={e=>setReference(e.target.value)}
              autoComplete="off" maxLength={39} placeholder={t.refHint}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white ps-11 pe-4 text-sm font-semibold text-[#193e38] outline-none focus:border-[#104d43] focus:ring-2 focus:ring-[#104d43]/10" dir="ltr"/>
          </div>
        </div>
        <div><label htmlFor="gb-track-phone" className="mb-2 block text-xs font-extrabold text-[#193e38]">{t.phone}</label>
          <div className="relative"><PhoneCall size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="gb-track-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={32}
              onChange={e=>setPhone(e.target.value)} placeholder={t.phoneHint}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white ps-11 pe-4 text-sm text-[#193e38] outline-none focus:border-[#104d43] focus:ring-2 focus:ring-[#104d43]/10" dir="ltr"/>
          </div>
        </div>
        {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 font-semibold text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 text-sm font-extrabold text-white transition hover:bg-[#0c3931] disabled:cursor-wait disabled:opacity-70">
          <Search size={19}/>{loading?t.busy:t.action}
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-slate-500"><ShieldCheck size={15}/>{t.privacy}</p>
      </form> : <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#b7dbca] bg-[#f0f8f3] p-5">
          <div><p className="mb-1 text-xs font-semibold text-[#42675a]">{t.ready}</p>
            <h3 className="text-xl font-black text-[#104d43]" dir="ltr">{result.reference}</h3>
            <p className="mt-2 text-sm font-semibold text-[#214e42]">{t.current}: {t[result.status]}</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#104d43]">{t[result.status]}</span>
        </div>
        {stage==='cancelled'?<div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><XCircle size={21}/>{t.cancelled}</div>
        :<ol className="grid gap-2 sm:grid-cols-5" aria-label={t.current}>
          {stages.map((key,i)=>{
            const Icon=icons[key],completed=i<=index;
            return <li key={key} aria-current={i===index?'step':undefined} className={'flex items-center gap-2 rounded-xl border p-3 sm:flex-col sm:items-start '+(completed?'border-[#a6d0b9] bg-[#edf7f0] text-[#104d43]':'border-slate-200 bg-white text-slate-400')}>
              <span className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-full '+(completed?'bg-[#104d43] text-white':'bg-slate-100 text-slate-400')}>{i<index?<Check size={18}/>:<Icon size={18}/>}</span>
              <span className="text-xs font-bold">{t[key]}</span>
            </li>;
          })}
         </ol>}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-[11px] text-slate-500">{t.placed}</p><p className="mt-2 text-sm font-bold text-[#193e38]">{result.date?new Date(result.date).toLocaleDateString(language==='ar'?'ar-MA':language==='en'?'en-GB':'fr-FR'):t.dateUnknown}</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-[11px] text-slate-500">{t.items}</p><p className="mt-2 text-sm font-bold text-[#193e38]">{result.itemCount}</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-[11px] text-slate-500">{t.total}</p><p className="mt-2 text-sm font-bold text-[#193e38]">{result.total!==null?result.total.toFixed(2)+' DH':'—'}</p></div>
        </div>
        {result.courierTrackingAvailable&&result.carrier&&result.trackingNumber&&
          <div className="rounded-xl border border-[#b7dbca] bg-[#f2f9f4] p-4 text-sm text-[#193e38]">
            <p className="flex items-center gap-2 font-bold"><Truck size={18} className="text-[#104d43]"/>{language==='ar'?'معلومات شركة التوصيل':language==='en'?'Delivery details':'Informations de livraison'}</p>
            <p className="mt-2 text-xs">{language==='ar'?'شركة التوصيل':language==='en'?'Carrier':'Transporteur'}: <strong>{result.carrier}</strong></p>
            <p className="mt-1 break-all font-mono text-xs">{language==='ar'?'رقم التتبع':language==='en'?'Tracking reference':'Référence du colis'}: <strong>{result.trackingNumber}</strong></p>
            <p className="mt-2 text-[11px] text-[#6b8172]">{t.noCourier}</p>
          </div>}
        {!result.courierTrackingAvailable&&<div className="flex items-start gap-3 rounded-xl bg-[#f5f8f5] px-4 py-3 text-xs leading-6 text-slate-600"><Truck size={18} className="mt-1 shrink-0 text-[#104d43]"/>{t.noCourier}</div>}
        <button type="button" onClick={()=>{setResult(null);setError('');}} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#104d43] hover:bg-slate-50">{rtl?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {t.again}</button>
      </div>}
      <div className="mt-7 border-t border-slate-100 pt-6">
        <p className="mb-3 text-xs font-bold text-[#193e38]">{t.contact}</p>
        <div className="grid gap-3 sm:grid-cols-2">
         <button type="button" onClick={whatsapp} className="flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#b4e3c5] bg-[#eff9f0] px-4 text-xs font-bold text-[#14613f] transition hover:bg-[#e2f6e7]"><WhatsAppIcon className="h-5 w-5"/>{t.whatsapp}</button>
         <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="flex min-h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#104d43] transition hover:bg-slate-50"><PhoneCall size={18}/>{t.call}</a>
        </div>
      </div>
    </div>
  </div>
 </div>;
}
