import { Search, ShoppingCart, Truck, Phone, PackageCheck, UserRound, ChevronDown } from 'lucide-react';
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
 fr:{delivery:'Livraison partout au Maroc',search:'Que recherchez-vous aujourd’hui ?',track:'Suivre ma commande',cart:'Panier',all:'Tous les produits',categories:'Catégories',account:'Mon compte'},
 ar:{delivery:'التوصيل لجميع أنحاء المغرب',search:'شنو كتقلب عليه اليوم؟',track:'تتبع طلبي',cart:'السلة',all:'جميع المنتجات',categories:'الأقسام',account:'حسابي'},
 en:{delivery:'Delivery anywhere in Morocco',search:'What are you looking for today?',track:'Track my order',cart:'Cart',all:'All products',categories:'Categories',account:'My account'}
} as const;

export default function Header({language,setLanguage,searchTerm,onSearchChange,setSelectedCategory,cart,setIsCartOpen,categories=[],onOpenTracking}:HeaderProps){
 const c=copy[language],rtl=language==='ar';
 const count=cart.reduce((sum,item)=>sum+item.quantity,0);
 const visibleCategories=categories.filter(cat=>cat && cat.id).slice(0,10);
 const all=()=>{setSelectedCategory('');onSearchChange('');window.requestAnimationFrame(()=>document.getElementById('product-catalog')?.scrollIntoView({behavior:'smooth',block:'start'}));};
 const select=(id:string)=>{setSelectedCategory(id);onSearchChange('');window.requestAnimationFrame(()=>document.getElementById('product-catalog')?.scrollIntoView({behavior:'smooth',block:'start'}));};
 return <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white shadow-[0_2px_14px_rgba(15,23,42,.06)]" dir={rtl?'rtl':'ltr'}>
   <div className="bg-[#104d43] text-white">
     <div className="mx-auto flex min-h-8 max-w-[1600px] items-center justify-between gap-3 px-4 text-[10px] font-bold sm:px-6 sm:text-xs">
       <span className="flex items-center gap-2"><Truck size={14}/>{c.delivery} · {language==='ar'?'الدفع عند الاستلام':language==='en'?'Cash on delivery':'Paiement à la livraison'}</span>
       <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="hidden items-center gap-1.5 sm:flex"><Phone size={12}/><span dir="ltr">{ORDER_SUPPORT_NUMBER}</span></a>
     </div>
   </div>
   <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:gap-6">
     <a href="/" onClick={e=>{e.preventDefault();setSelectedCategory('');onSearchChange('');window.scrollTo({top:0,behavior:'smooth'});}} aria-label="GLOBABOX — home" className="shrink-0">
       <img src="/brand/globabox-logo.svg" alt="GLOBABOX" className="h-9 w-[142px] object-contain sm:h-11 sm:w-[175px]"/>
     </a>
     <div className="hidden min-w-0 flex-1 md:block">
       <div className="relative mx-auto max-w-[720px]">
         <Search size={19} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"/>
         <input type="search" value={searchTerm} aria-label={c.search} placeholder={c.search} onChange={e=>onSearchChange(e.target.value)}
           className="h-12 w-full rounded-full border border-slate-200 bg-[#f7f8f7] py-2 pe-5 ps-12 text-sm font-medium text-slate-900 outline-none transition focus:border-[#104d43] focus:bg-white focus:ring-4 focus:ring-[#104d43]/10"/>
       </div>
     </div>
     <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
       <button type="button" onClick={()=>onOpenTracking?.()} className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 lg:flex" title={c.track}><PackageCheck size={19}/><span>{c.track}</span></button>
       <button type="button" className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 xl:flex"><UserRound size={19}/><span>{c.account}</span></button>
       <div role="group" aria-label="Language" className="flex rounded-full border border-slate-200 bg-white p-0.5">
         {(['fr','ar','en'] as Language[]).map(lang=><button type="button" key={lang} onClick={()=>setLanguage(lang)} aria-pressed={lang===language}
           className={'min-h-8 rounded-full px-2 text-[10px] font-black '+(language===lang?'bg-[#104d43] text-white':'text-slate-500 hover:bg-slate-100')}>{lang.toUpperCase()}</button>)}
       </div>
       <button type="button" onClick={()=>setIsCartOpen(true)} className="relative flex min-h-11 items-center gap-2 rounded-full bg-[#104d43] px-3.5 text-white transition hover:bg-[#0b3931] sm:px-5" aria-label={c.cart}>
         <ShoppingCart size={19}/><span className="hidden text-xs font-extrabold sm:inline">{c.cart}</span>
         {count>0&&<span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4c75a] px-1 text-[10px] font-black text-[#193e38]">{count}</span>}
       </button>
     </div>
   </div>
   <div className="border-t border-slate-100 bg-white">
     <nav className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-4 py-2.5 no-scrollbar sm:px-6" aria-label={c.categories}>
       <button type="button" onClick={all} className={'shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition '+(!selectedCategory?'bg-[#104d43] text-white':'text-slate-700 hover:bg-slate-100')}>{c.all}</button>
       {visibleCategories.map(cat=><button key={cat.id} type="button" onClick={()=>select(cat.id)}
         className={'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition '+(selectedCategory===cat.id?'bg-[#e7f2ed] text-[#104d43]':'text-slate-600 hover:bg-slate-100')}>
         {cat.name?.[language] || cat.name?.fr || cat.id}
       </button>)}
       <span className="ms-auto hidden items-center gap-1 text-[10px] font-bold text-slate-400 xl:flex"><ChevronDown size={14}/>{c.categories}</span>
     </nav>
   </div>
   <div className="border-t border-slate-100 px-4 py-2.5 md:hidden">
     <div className="relative">
       <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"/>
       <input type="search" value={searchTerm} aria-label={c.search} placeholder={c.search} onChange={e=>onSearchChange(e.target.value)}
         className="h-11 w-full rounded-full border border-slate-200 bg-[#f7f8f7] py-2 pe-4 ps-11 text-sm outline-none focus:border-[#104d43] focus:ring-4 focus:ring-[#104d43]/10"/>
     </div>
   </div>
 </header>;
}
