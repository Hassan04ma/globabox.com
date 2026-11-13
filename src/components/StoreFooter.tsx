import {
  ArrowUpRight, CircleHelp, FileText, House, MapPin, PackageSearch,
  PhoneCall, RotateCcw, ShieldCheck, ShoppingBag, ShoppingCart, Truck
} from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface StoreFooterProps {
  language: Language;
  onHome: () => void;
  onBrowse: () => void;
  onTrack: () => void;
  onCart: () => void;
  onLegal: (tab: string) => void;
}

const messages = {
  fr: {
    tagline:'Le quotidien, en mieux.',
    intro:'Une boutique en ligne marocaine pensée pour vos besoins de tous les jours, avec des achats simples et des informations claires.',
    policy:'Informations & politiques',about:'À propos de nous',shipping:'Livraison et frais',returns:'Retours & échanges',
    terms:'Conditions de vente',privacy:'Confidentialité',contactPolicy:'Informations de contact',
    shop:'Votre boutique',home:'Accueil',browse:'Tous les produits',track:'Suivre mon colis',cart:'Mon panier',faq:'Questions fréquentes',
    contact:'Contact & assistance',whatsapp:'Écrire sur WhatsApp',call:'Nous appeler',
    zone:'Zone de livraison',morocco:'Maroc — disponibilité à confirmer selon la destination',
    notice:'Paiement à la livraison · Frais indiqués avant validation',rights:'Tous droits réservés.'
  },
  ar: {
    tagline:'كل يوم، اختيارات أفضل.',
    intro:'جلوبابوكس متجر مغربي للتسوق عبر الإنترنت، بمنتجات متنوعة وخطوات شراء واضحة وسهلة.',
    policy:'السياسات والمعلومات',about:'من نحن',shipping:'سياسة التوصيل',returns:'الإرجاع والتبديل',
    terms:'شروط البيع',privacy:'سياسة الخصوصية',contactPolicy:'معلومات التواصل',
    shop:'التسوق والخدمات',home:'الرئيسية',browse:'جميع المنتجات',track:'تتبع الطرد',cart:'سلة التسوق',faq:'الأسئلة الشائعة',
    contact:'التواصل والمساعدة',whatsapp:'مراسلتنا عبر واتساب',call:'اتصل بنا',
    zone:'منطقة التوصيل',morocco:'المغرب — التوصيل حسب توفر الخدمة لعنوانك',
    notice:'الدفع عند الاستلام · مصاريف التوصيل كتظهر قبل التأكيد',rights:'جميع الحقوق محفوظة.'
  },
  en: {
    tagline:'Better choices, every day.',
    intro:'A Moroccan online store for everyday shopping, with useful finds and a clear, simple ordering experience.',
    policy:'Policies & information',about:'About us',shipping:'Delivery information',returns:'Returns & exchanges',
    terms:'Terms of sale',privacy:'Privacy policy',contactPolicy:'Contact information',
    shop:'Shop & services',home:'Home',browse:'All products',track:'Track my parcel',cart:'My cart',faq:'Frequently asked questions',
    contact:'Contact & support',whatsapp:'Chat on WhatsApp',call:'Call us',
    zone:'Delivery area',morocco:'Morocco — service subject to destination confirmation',
    notice:'Cash on delivery · Delivery fees shown before confirmation',rights:'All rights reserved.'
  }
} as const;

export default function StoreFooter({language,onHome,onBrowse,onTrack,onCart,onLegal}:StoreFooterProps) {
  const c=messages[language];
  const linkClass='group flex w-full items-center gap-2.5 rounded-lg py-2 text-start text-[13px] text-white/70 transition-colors hover:text-[#f4c75a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4c75a]';
  const iconClass='shrink-0 text-[#b5d5c7] transition-colors group-hover:text-[#f4c75a]';
  const openFAQ=()=>document.getElementById('faq-section')?.scrollIntoView({behavior:'smooth',block:'start'});
  return (
    <footer className="border-t border-[#164f43] bg-[#103e35] text-white" dir={language==='ar'?'rtl':'ltr'}>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1.15fr] lg:gap-8 lg:px-8">
        <section aria-label="GLOBABOX" className="max-w-sm">
          <div className="mb-4 flex items-center gap-3">
            <img src="/brand/globabox-mark.svg" alt="" className="h-12 w-12 shrink-0 rounded-xl" loading="lazy" />
            <span className="text-[23px] font-black tracking-tight">GLOBA<span className="text-[#f4c75a]">BOX</span></span>
          </div>
          <p className="text-sm font-bold text-[#f4c75a]">{c.tagline}</p>
          <p className="mt-3 text-[13px] leading-7 text-white/70">{c.intro}</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-medium text-white/80">
            <ShieldCheck size={17} className="shrink-0 text-[#f4c75a]" />
            {c.notice}
          </div>
        </section>

        {/* Dedicated policy column directly after the brand — never a duplicate link list. */}
        <nav aria-label={c.policy}>
          <h2 className="mb-4 border-b border-white/15 pb-3 text-sm font-extrabold text-white">{c.policy}</h2>
          <div className="space-y-0.5">
            <button type="button" onClick={()=>onLegal('about')} className={linkClass}><CircleHelp size={17} className={iconClass}/>{c.about}</button>
            <button type="button" onClick={()=>onLegal('delivery')} className={linkClass}><Truck size={17} className={iconClass}/>{c.shipping}</button>
            <button type="button" onClick={()=>onLegal('returns')} className={linkClass}><RotateCcw size={17} className={iconClass}/>{c.returns}</button>
            <button type="button" onClick={()=>onLegal('cgv')} className={linkClass}><FileText size={17} className={iconClass}/>{c.terms}</button>
            <button type="button" onClick={()=>onLegal('privacy')} className={linkClass}><ShieldCheck size={17} className={iconClass}/>{c.privacy}</button>
            <button type="button" onClick={()=>onLegal('contact')} className={linkClass}><PhoneCall size={17} className={iconClass}/>{c.contactPolicy}</button>
          </div>
        </nav>

        <nav aria-label={c.shop}>
          <h2 className="mb-4 border-b border-white/15 pb-3 text-sm font-extrabold text-white">{c.shop}</h2>
          <div className="space-y-0.5">
            <button type="button" onClick={onHome} className={linkClass}><House size={17} className={iconClass}/>{c.home}</button>
            <button type="button" onClick={onBrowse} className={linkClass}><ShoppingBag size={17} className={iconClass}/>{c.browse}</button>
            <button type="button" onClick={onTrack} className={linkClass}><PackageSearch size={17} className={iconClass}/>{c.track}</button>
            <button type="button" onClick={onCart} className={linkClass}><ShoppingCart size={17} className={iconClass}/>{c.cart}</button>
            <button type="button" onClick={openFAQ} className={linkClass}><CircleHelp size={17} className={iconClass}/>{c.faq}</button>
          </div>
        </nav>

        <section aria-label={c.contact}>
          <h2 className="mb-4 border-b border-white/15 pb-3 text-sm font-extrabold text-white">{c.contact}</h2>
          <div className="space-y-3">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
              className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-[#3b7666] bg-[#1a5849] px-4 transition hover:border-[#f4c75a] hover:bg-[#206856]"
              aria-label={c.whatsapp}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#25d366] text-white"><WhatsAppIcon className="h-5 w-5"/></span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold">{c.whatsapp}</span><ArrowUpRight size={16} className="text-white/70"/>
            </a>
            <a href={'tel:'+ORDER_SUPPORT_NUMBER}
              className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-[#3b7666] bg-[#1a5849] px-4 transition hover:border-[#f4c75a] hover:bg-[#206856]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f4c75a]"><PhoneCall size={19}/></span>
              <span className="min-w-0 flex-1"><span className="block text-[11px] text-white/60">{c.call}</span><span className="block text-sm font-bold" dir="ltr">{ORDER_SUPPORT_NUMBER}</span></span>
            </a>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f4c75a]"><MapPin size={20}/></span>
              <div><p className="text-[12px] font-bold">{c.zone}</p><p className="mt-1 text-xs leading-5 text-white/65">{c.morocco}</p></div>
            </div>
          </div>
        </section>
      </div>
      <div className="border-t border-white/10 bg-[#0c332b]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-center text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} GLOBABOX. {c.rights}</p>
          <p>{c.notice}</p>
        </div>
      </div>
    </footer>
  );
}
