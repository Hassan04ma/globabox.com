import {
  ArrowUpRight, CreditCard, Home, MessageCircle, PackageCheck,
  Phone, ShieldCheck, ShoppingBag, ShoppingCart, Truck
} from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_LINK } from '../data';

interface StoreFooterProps {
  language: Language;
  onHome: () => void;
  onBrowse: () => void;
  onTrack: () => void;
  onCart: () => void;
  onLegal: (tab: string) => void;
}

const copy = {
  fr: {
    about: 'Globabox sélectionne des produits pour le quotidien, la maison et les loisirs. Commandez en ligne avec paiement à la livraison au Maroc.',
    nav: 'Navigation',
    home: 'Accueil',
    shop: 'Découvrir la boutique',
    track: 'Suivre ma commande',
    cart: 'Mon panier',
    deliveryReturns: 'Livraison et retours',
    contactLink: 'Nous contacter',
    assurance: 'Livraison et paiement',
    nationwide: 'Livraison au Maroc',
    cod: 'Paiement à la livraison',
    fees: 'Frais affichés avant confirmation de commande',
    timing: 'Délais précisés lors de la confirmation',
    contact: 'Service client',
    hours: 'Tous les jours : 8h00 – 22h00',
    whatsapp: 'Contacter sur WhatsApp',
    copyright: 'Tous droits réservés.',
    aboutLink: 'À propos',
    deliveryLink: 'Livraison',
    returnsLink: 'Retours',
    terms: 'Conditions générales',
    privacy: 'Confidentialité',
    legalContact: 'Contact'
  },
  ar: {
    about: 'جلوبابوكس متجر إلكتروني لمنتجات الحياة اليومية والمنزل والترفيه. تسوق بسهولة مع الدفع عند الاستلام داخل المغرب.',
    nav: 'روابط مهمة',
    home: 'الرئيسية',
    shop: 'تصفح المتجر',
    track: 'تتبع طلبي',
    cart: 'سلة المشتريات',
    deliveryReturns: 'التوصيل والإرجاع',
    contactLink: 'اتصل بنا',
    assurance: 'التوصيل والدفع',
    nationwide: 'التوصيل داخل المغرب',
    cod: 'الدفع عند الاستلام',
    fees: 'مصاريف التوصيل واضحة قبل تأكيد الطلب',
    timing: 'تأكيد مدة التوصيل عند تأكيد الطلبية',
    contact: 'خدمة الزبناء',
    hours: 'يومياً: 08:00 – 22:00',
    whatsapp: 'تواصل معنا عبر واتساب',
    copyright: 'جميع الحقوق محفوظة.',
    aboutLink: 'من نحن',
    deliveryLink: 'التوصيل',
    returnsLink: 'الإرجاع',
    terms: 'شروط البيع',
    privacy: 'الخصوصية',
    legalContact: 'التواصل'
  },
  en: {
    about: 'Globabox offers a selection of everyday, home and leisure products. Shop online in Morocco with cash on delivery.',
    nav: 'Quick links',
    home: 'Home',
    shop: 'Browse the store',
    track: 'Track my order',
    cart: 'My cart',
    deliveryReturns: 'Shipping and returns',
    contactLink: 'Contact us',
    assurance: 'Delivery and payment',
    nationwide: 'Delivery in Morocco',
    cod: 'Cash on delivery',
    fees: 'Delivery fees shown before checkout confirmation',
    timing: 'Delivery timing confirmed with your order',
    contact: 'Customer support',
    hours: 'Daily: 8:00 AM – 10:00 PM',
    whatsapp: 'Chat on WhatsApp',
    copyright: 'All rights reserved.',
    aboutLink: 'About',
    deliveryLink: 'Delivery',
    returnsLink: 'Returns',
    terms: 'Terms of sale',
    privacy: 'Privacy',
    legalContact: 'Contact'
  }
};

export default function StoreFooter({
  language, onHome, onBrowse, onTrack, onCart, onLegal
}: StoreFooterProps) {
  const c = copy[language] || copy.fr;
  const rtl = language === 'ar';

  const navButton = (label: string, Icon: typeof Home, onClick: () => void) => (
    <button type="button" onClick={onClick}
      className="group inline-flex w-fit items-center gap-2 rounded py-1 text-start text-sm text-slate-300 transition-colors hover:text-[#f4c75a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
      <Icon size={15} className="shrink-0 text-slate-500 transition-colors group-hover:text-[#f4c75a]" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );

  const legalButton = (label: string, tab: string) => (
    <button type="button" onClick={() => onLegal(tab)}
      className="rounded py-1 text-xs text-slate-400 transition-colors hover:text-[#f4c75a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
      {label}
    </button>
  );

  return (
    <footer dir={rtl ? 'rtl' : 'ltr'} className="border-t border-[#123f36] bg-[#123f36] px-5 py-12 text-slate-300 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <section aria-label="Globabox">
          <div className="mb-5 flex items-center gap-3">
            <img src="/brand/globabox-mark.svg" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
            <span className="text-xl font-extrabold tracking-wide text-white">GLOBABOX</span>
          </div>
          <p className="max-w-xs text-sm leading-7 text-slate-400">{c.about}</p>
          <a href="https://globabox.com" className="mt-5 inline-flex items-center gap-1.5 rounded font-medium text-[#f4c75a] hover:text-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
            globabox.com <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </section>

        <nav aria-label={c.nav}>
          <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-white">{c.nav}</h2>
          <div className="flex flex-col items-start gap-2">
            {navButton(c.home, Home, onHome)}
            {navButton(c.shop, ShoppingBag, onBrowse)}
            {navButton(c.track, PackageCheck, onTrack)}
            {navButton(c.cart, ShoppingCart, onCart)}
            {navButton(c.deliveryReturns, Truck, () => onLegal('delivery'))}
            {navButton(c.contactLink, Phone, () => onLegal('contact'))}
          </div>
        </nav>

        <section aria-label={c.assurance}>
          <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-white">{c.assurance}</h2>
          <div className="space-y-4 text-sm leading-6 text-slate-400">
            <p className="flex items-start gap-3"><Truck size={18} className="mt-0.5 shrink-0 text-[#f4c75a]" aria-hidden="true" /><span>{c.nationwide}</span></p>
            <p className="flex items-start gap-3"><CreditCard size={18} className="mt-0.5 shrink-0 text-[#f4c75a]" aria-hidden="true" /><span>{c.cod}</span></p>
            <p className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#f4c75a]" aria-hidden="true" /><span>{c.fees}</span></p>
            <p className="flex items-start gap-3"><PackageCheck size={18} className="mt-0.5 shrink-0 text-[#f4c75a]" aria-hidden="true" /><span>{c.timing}</span></p>
          </div>
        </section>

        <section aria-label={c.contact}>
          <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-white">{c.contact}</h2>
          <a href={'tel:' + ORDER_SUPPORT_NUMBER}
            className="flex w-fit items-center gap-3 rounded-xl border border-slate-700 bg-[#1b594e] px-4 py-3 text-base font-bold text-white transition-colors hover:border-[#f4c75a] hover:text-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
            <Phone size={18} className="shrink-0 text-[#f4c75a]" aria-hidden="true" />
            <span dir="ltr">{ORDER_SUPPORT_NUMBER}</span>
          </a>
          <p className="mt-4 text-sm text-slate-400">{c.hours}</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-700/50 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
            <MessageCircle size={18} aria-hidden="true" />{c.whatsapp}
          </a>
        </section>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-800 pt-7 text-center sm:flex-row sm:text-start">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Globabox. {c.copyright}</p>
        <nav aria-label={c.terms}>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 sm:justify-end">
            {legalButton(c.aboutLink, 'about')}
            {legalButton(c.deliveryLink, 'delivery')}
            {legalButton(c.returnsLink, 'returns')}
            {legalButton(c.terms, 'cgv')}
            {legalButton(c.privacy, 'privacy')}
            {legalButton(c.legalContact, 'contact')}
          </div>
        </nav>
      </div>
    </footer>
  );
}
