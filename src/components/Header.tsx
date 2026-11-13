import { Search, ShoppingCart, Truck, Phone, PackageCheck } from 'lucide-react';
import type { Language, CartItem, Category } from '../types';
import { ORDER_SUPPORT_NUMBER } from '../data';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  categories?: Category[];
  onOpenTracking?: () => void;
}

const copy = {
 fr:{delivery:'Livraison au Maroc · Paiement à la réception',search:'Rechercher un produit...',track:'Suivre ma commande',cart:'Mon panier',all:'Tous les produits'},
 ar:{delivery:'التوصيل داخل المغرب · الدفع عند الاستلام',search:'قلب على شي منتج...',track:'تتبع طلبي',cart:'سلة التسوق',all:'جميع المنتجات'},
 en:{delivery:'Delivery in Morocco · Cash on delivery',search:'Search products...',track:'Track order',cart:'My cart',all:'All products'}
} as const;

export default function Header({language,setLanguage,searchTerm,onSearchChange,setSelectedCategory,cart,setIsCartOpen,onOpenTracking}:HeaderProps){
 const c=copy[language],rtl=language==='ar';
 const count=cart.reduce((sum,item)=>sum+item.quantity,0);
 const searchInput=()=><div className="relative w-full">
    <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-500"/>
    <input type="search" value={searchTerm} aria-label={c.search} placeholder={c.search} onChange={e=>onSearchChange(e.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-[#f6f8f6] py-2 pe-4 ps-11 text-sm text-slate-900 outline-none transition focus:border-[#104d43] focus:bg-white focus:ring-2 focus:ring-[#104d43]/10"/>
  </div>;
 const all=()=>{setSelectedCategory('');onSearchChange('');window.requestAnimationFrame(()=>document.getElementById('product-catalog')?.scrollIntoView({behavior:'smooth',block:'start'}));};
 return <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md" dir={rtl?'rtl':'ltr'}>
    <div className="bg-[#104d43] text-white">
      <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-between gap-3 px-4 text-[10px] font-semibold sm:px-6 sm:text-xs lg:px-8">
        <span className="flex items-center gap-2"><Truck size={14}/>{c.delivery}</span>
        <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="hidden items-center gap-1.5 sm:flex"><Phone size={12}/><span dir="ltr">{ORDER_SUPPORT_NUMBER}</span></a>
      </div>
    </div>
    <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <a href="/" onClick={e=>{e.preventDefault();setSelectedCategory('');onSearchChange('');window.scrollTo({top:0,behavior:'smooth'});}} aria-label="GLOBABOX — home" className="shrink-0">
        <img src="/brand/globabox-logo.svg" alt="GLOBABOX" className="h-10 w-[151px] object-contain sm:w-[185px] lg:h-[52px] lg:w-[207px]"/>
      </a>
      <div className="hidden min-w-0 flex-1 md:block">{searchInput()}</div>
      <button type="button" onClick={all} className="hidden shrink-0 text-xs font-bold text-[#104d43] hover:underline lg:block">{c.all}</button>
      <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <div role="group" aria-label="Language" className="flex rounded-lg border border-slate-200 bg-white p-1">
          {(['fr','ar','en'] as Language[]).map(lang=><button type="button" key={lang} onClick={()=>setLanguage(lang)} aria-pressed={lang===language}
            className={'min-h-8 rounded-md px-2 text-[11px] font-bold '+(language===lang?'bg-[#104d43] text-white':'text-slate-600 hover:bg-slate-100')}>{lang.toUpperCase()}</button>)}
        </div>
        {onOpenTracking && <button type="button" onClick={onOpenTracking} className="hidden items-center gap-2 rounded-lg px-2 text-xs font-semibold text-[#104d43] hover:bg-[#f1f6f3] xl:inline-flex"><PackageCheck size={18}/>{c.track}</button>}
        <button type="button" onClick={()=>setIsCartOpen(true)} className="relative flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-3 text-white transition hover:bg-[#0b3931] sm:px-4" aria-label={c.cart}>
          <ShoppingCart size={19}/><span className="hidden text-xs font-bold sm:inline">{c.cart}</span>
          {count>0&&<span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4c75a] px-1 text-[10px] font-black text-[#193e38]">{count}</span>}
        </button>
      </div>
    </div>
    <div className="mx-auto max-w-7xl border-t border-slate-100 px-4 pb-3 pt-2 md:hidden">{searchInput()}</div>
  </header>;
}
