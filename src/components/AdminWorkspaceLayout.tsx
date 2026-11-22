import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight, BarChart3, ChevronRight,
  ClipboardCheck, ClipboardList, Command, ExternalLink, LayoutDashboard, Users,
  LogOut, Menu, Package, Plus, Search, Store,
  Tags, Truck
} from 'lucide-react';
import '../adminPlatform.css';

type AdminTab='dashboard'|'orders'|'customers'|'products'|'categories'|'marketing'|'operations';
interface Props{
 language:'ar'|'fr'|'en';
 activeTab:AdminTab; onTabChange:(tab:AdminTab)=>void;
 onClose:()=>void;onLogout:()=>void;
 ordersCount:number;pendingOrders:number;productsCount:number;categoriesCount:number;customersCount:number;
 databaseReady:boolean|undefined; showProductAction:boolean;
 onNewProduct:()=>void; onPrepareProduct:()=>void;
 onPendingOrders:()=>void;onRefreshOrders:()=>void;isRefreshing:boolean;
 children:ReactNode;
}
const navigation=[
 {id:'dashboard' as const,label:'Vue d’ensemble',description:'Activité et indicateurs',icon:LayoutDashboard,group:'VOTRE BOUTIQUE'},
 {id:'orders' as const,label:'Commandes',description:'Suivi et traitement',icon:ClipboardList,group:'VENTES'},
 {id:'customers' as const,label:'Clients',description:'Historique et fidélité',icon:Users,group:'VENTES'},
 {id:'products' as const,label:'Produits',description:'Catalogue et inventaire',icon:Package,group:'VENTES'},
 {id:'categories' as const,label:'Collections',description:'Rayons et catégories',icon:Tags,group:'VENTES'},
 {id:'marketing' as const,label:'Marketing',description:'Pixels et acquisition',icon:BarChart3,group:'CROISSANCE'},
 {id:'operations' as const,label:'Opérations',description:'Qualité et préparation',icon:ClipboardCheck,group:'CROISSANCE'}
];
const subtitles:Record<AdminTab,string>={
 dashboard:'Vue globale de votre activité commerciale',
 orders:'Consultez, confirmez et suivez les commandes clients',
 customers:'Retrouvez les clients à partir de leurs commandes et de leur historique',
 products:'Gérez vos fiches, vos prix et vos disponibilités',
 categories:'Organisez les rayons et la navigation de la boutique',
 marketing:'Configurez les outils de mesure et de publicité',
 operations:'Contrôlez la préparation et la qualité de la boutique'
};
export default function AdminWorkspaceLayout({
 language,activeTab,onTabChange,onClose,onLogout,ordersCount,pendingOrders,productsCount,
 categoriesCount,customersCount,databaseReady,showProductAction,onNewProduct,onPendingOrders,children
}:Props){
 const copy=language==='ar'?{
 groups:['متجرك','المبيعات','النمو'],
 labels:{dashboard:'نظرة عامة',orders:'الطلبات',customers:'العملاء',products:'المنتجات',categories:'التصنيفات',marketing:'التسويق',operations:'العمليات'},
 descriptions:{dashboard:'نشاط المتجر والمؤشرات',orders:'تتبع ومعالجة الطلبات',customers:'سجل العملاء والوفاء',products:'الكتالوج والمخزون',categories:'الأقسام والتصنيفات',marketing:'القياس والإعلانات',operations:'الجودة وتجهيز الطلبات'},
 subtitles:{dashboard:'نظرة شاملة على نشاطك التجاري',orders:'راجع طلبات العملاء وأكدها وتابع توصيلها',customers:'بيانات العملاء المستخرجة من الطلبات',products:'أدر المنتجات والأسعار والتوفر',categories:'نظم أقسام المتجر وتصفحه',marketing:'إعداد أدوات القياس والإعلانات',operations:'راقب جودة المتجر وتجهيز الطلبات'},
 store:'متجري',admin:'إدارة المتجر',quick:'بحث سريع في الأقسام…',quickTitle:'التنقل السريع',noResults:'لا توجد نتائج',db:['قاعدة البيانات متصلة','يجب التحقق من قاعدة البيانات','لم يتم التحقق من القاعدة'],view:'عرض المتجر',newProduct:'منتج جديد',toProcess:'طلبات قيد المعالجة',secure:'جلسة آمنة',administrator:'المسؤول',logout:'تسجيل الخروج',shipping:'التوصيل اليدوي',nonePending:'لا توجد طلبات تنتظر المعالجة',attention:'طلب يحتاج إلى متابعة',openOrders:'فتح الطلبات',merchant:'مساحة التاجر',menu:'فتح القائمة',closeMenu:'إغلاق القائمة'
}:language==='en'?{
 groups:['YOUR STORE','SALES','GROWTH'],
 labels:{dashboard:'Overview',orders:'Orders',customers:'Customers',products:'Products',categories:'Collections',marketing:'Marketing',operations:'Operations'},
 descriptions:{dashboard:'Store activity and metrics',orders:'Track and process orders',customers:'Customer history and loyalty',products:'Catalog and inventory',categories:'Store departments and navigation',marketing:'Analytics and advertising',operations:'Quality and fulfillment'},
 subtitles:{dashboard:'A complete view of your store activity',orders:'Review, confirm and track customer orders',customers:'Customer records derived from orders',products:'Manage product listings, prices and availability',categories:'Organize your store departments',marketing:'Configure analytics and advertising tools',operations:'Monitor store quality and fulfillment'},
 store:'My store',admin:'STORE ADMIN',quick:'Search sections…',quickTitle:'QUICK NAVIGATION',noResults:'No results found',db:['Database connected','Database needs checking','Database not verified'],view:'View store',newProduct:'New product',toProcess:'Orders to process',secure:'Secure session',administrator:'Administrator',logout:'Log out',shipping:'Manual shipping',nonePending:'No orders need attention.',attention:'order(s) need attention.',openOrders:'Open orders',merchant:'Merchant workspace',menu:'Open menu',closeMenu:'Close menu'
}:{
 groups:['VOTRE BOUTIQUE','VENTES','CROISSANCE'],
 labels:{dashboard:'Vue d’ensemble',orders:'Commandes',customers:'Clients',products:'Produits',categories:'Collections',marketing:'Marketing',operations:'Opérations'},
 descriptions:{dashboard:'Activité et indicateurs',orders:'Suivi et traitement',customers:'Historique et fidélité',products:'Catalogue et inventaire',categories:'Rayons et catégories',marketing:'Pixels et acquisition',operations:'Qualité et préparation'},
 subtitles:{dashboard:'Vue globale de votre activité commerciale',orders:'Consultez, confirmez et suivez les commandes clients',customers:'Retrouvez les clients à partir de leurs commandes et de leur historique',products:'Gérez vos fiches, vos prix et vos disponibilités',categories:'Organisez les rayons et la navigation de la boutique',marketing:'Configurez les outils de mesure et de publicité',operations:'Contrôlez la préparation et la qualité de la boutique'},
 store:'Ma boutique',admin:'COMMERCE ADMIN',quick:'Rechercher une section…',quickTitle:'NAVIGATION RAPIDE',noResults:'Aucun résultat.',db:['Base connectée','Base à vérifier','Base non vérifiée'],view:'Voir la boutique',newProduct:'Nouveau produit',toProcess:'À traiter',secure:'Session sécurisée',administrator:'Administrateur',logout:'Déconnexion',shipping:'Expédition manuelle',nonePending:'Aucune commande à traiter.',attention:'commande(s) nécessitent votre attention.',openOrders:'Ouvrir les commandes',merchant:'Espace marchand',menu:'Ouvrir le menu',closeMenu:'Fermer le menu'
};
 const localizedNavigation=navigation.map(item=>({...item,label:copy.labels[item.id],description:copy.descriptions[item.id],group:item.group===navigation[0].group?copy.groups[0]:item.group===navigation[1].group?copy.groups[1]:copy.groups[2]}));
 const localizedSubtitles=copy.subtitles;
 const [mobileOpen,setMobileOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [searchOpen,setSearchOpen]=useState(false);
 const searchRef=useRef<HTMLInputElement>(null);
 const isStaging=typeof window!=='undefined'&&
  (window.location.hostname.startsWith('test.')||window.location.hostname.includes('staging')||window.location.hostname.includes('admin-rebuild'));
 const current=localizedNavigation.find(item=>item.id===activeTab)||localizedNavigation[0];
 const filtered=useMemo(()=>localizedNavigation.filter(item=>(item.label+' '+item.description+' '+item.group).toLowerCase().includes(query.toLowerCase())),[query,language]);
 const count=(id:AdminTab)=>id==='orders'?ordersCount:id==='customers'?customersCount:id==='products'?productsCount:id==='categories'?categoriesCount:null;
 const select=(id:AdminTab)=>{onTabChange(id);setMobileOpen(false);setSearchOpen(false);setQuery('');};
 useEffect(()=>{
  const content=document.getElementById('gb-admin-content');
  if(content)content.scrollTo({top:0,left:0,behavior:'auto'});
  requestAnimationFrame(()=>content?.focus({preventScroll:true}));
 },[activeTab]);
 useEffect(()=>{
  const listener=(event:KeyboardEvent)=>{
   if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchRef.current?.focus();setSearchOpen(true);}
   if(event.key==='Escape'){setMobileOpen(false);setSearchOpen(false);}
  };
  window.addEventListener('keydown',listener);
  return()=>window.removeEventListener('keydown',listener);
 },[]);
 const sidebar=<div className="flex h-full min-h-0 bg-white text-[#30445a]">
  <div className="flex w-[64px] shrink-0 flex-col items-center gap-2 bg-[#ed6b2f] py-4 text-white">
   <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white text-[#ed6b2f]"><img src="/brand/globabox-mark.svg" alt="GLOBABOX" className="h-7 w-7 object-contain"/></div>
   {localizedNavigation.map(item=>{const Icon=item.icon;const active=activeTab===item.id;return <button key={item.id} type="button" onClick={()=>select(item.id)} aria-label={item.label} title={item.label} aria-current={active?'page':undefined} className={'flex h-11 w-11 items-center justify-center rounded-xl transition '+(active?'bg-white text-[#ed6b2f] shadow-md':'text-white/90 hover:bg-white/20')}><Icon size={19}/></button>;})}
   <div className="mt-auto flex flex-col gap-2">
    <button type="button" onClick={onLogout} aria-label={copy.logout} title={copy.logout} className="flex h-11 w-11 items-center justify-center rounded-xl text-white/90 hover:bg-white/20"><LogOut size={19}/></button>
   </div>
  </div>
  <div className="flex min-w-0 flex-1 flex-col">
   <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[#e5eaf0] px-4">
    <img src="/brand/globabox-logo.svg" alt="GLOBABOX" className="h-9 max-w-[145px] object-contain"/>
    <span className="ms-auto rounded-full bg-[#fff2eb] px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-[#d85d25]">{copy.admin}</span>
   </div>
   <div className="border-b border-[#e9edf2] px-3 py-3">
    <div className="flex items-center gap-3 rounded-lg bg-[#f7f8fa] px-3 py-3">
     <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0e8] text-[#e66b32]"><Store size={18}/></span>
     <span className="min-w-0"><span className="block truncate text-xs font-bold text-[#263b52]">{copy.store}</span><span className="mt-0.5 block text-[10px] text-[#8291a2]">GLOBABOX · Maroc</span></span>
    </div>
   </div>
   <nav aria-label={copy.quickTitle} className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
    {copy.groups.map(group=><section key={group} className="mb-5">
     <p className="mb-2 px-3 text-[9px] font-extrabold tracking-[.16em] text-[#9aa7b5]">{group}</p>
     <div className="space-y-1">{localizedNavigation.filter(item=>item.group===group).map(item=>{
      const Icon=item.icon,active=activeTab===item.id,n=count(item.id);
      return <button key={item.id} type="button" onClick={()=>select(item.id)} aria-current={active?'page':undefined} className={'group flex min-h-[43px] w-full items-center gap-3 rounded-lg px-3 text-start transition '+(active?'bg-[#fff0e8] text-[#dc642d] font-bold':'text-[#607187] hover:bg-[#f5f7f9] hover:text-[#263b52]')}>
       <Icon size={17}/><span className="min-w-0 flex-1 text-[12px] font-semibold">{item.label}</span>
       {n!==null&&<span className={'min-w-6 rounded-md px-1.5 py-1 text-center text-[10px] font-extrabold '+(active?'bg-[#ed6b2f] text-white':'bg-[#eef1f5] text-[#718096]')}>{n}</span>}
      </button>;
     })}</div>
    </section>)}
    <div className="mx-1 mt-5 rounded-lg border border-[#f4d4c4] bg-[#fff8f4] p-3">
     <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#c95c2b]"><Truck size={15}/>{copy.shipping}</div>
     <p className="mt-2 text-[10px] leading-5 text-[#7d8794]">{pendingOrders===0?copy.nonePending:pendingOrders+' '+copy.attention}</p>
     <button type="button" onClick={()=>{onPendingOrders();setMobileOpen(false);}} className="mt-2 text-[10px] font-bold text-[#d65f2b] underline underline-offset-4">{copy.openOrders}</button>
    </div>
   </nav>
   <div className="shrink-0 border-t border-[#e9edf2] p-3">
    <div className="flex items-center gap-3 rounded-lg px-2 py-1">
     <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0e8] text-[11px] font-black text-[#dc642d]">GB</span>
     <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold text-[#34465b]">{copy.administrator}</span><span className="mt-0.5 block text-[10px] text-[#93a0ae]">{copy.secure}</span></span>
     <button type="button" onClick={onLogout} aria-label={copy.logout} title={copy.logout} className="rounded-lg p-2 text-[#8190a0] hover:bg-[#fff0e8] hover:text-[#d65f2b]"><LogOut size={17}/></button>
    </div>
   </div>
  </div>
 </div>;
 return <div dir={language==='ar'?'rtl':'ltr'} lang={language} className="gb-admin-platform fixed inset-0 z-[80] flex h-[100dvh] min-h-0 overflow-hidden bg-[#f4f6f5] text-[#1d302b]">
  <aside className="hidden h-full w-[324px] shrink-0 lg:block">{sidebar}</aside>
  {mobileOpen&&<div className="fixed inset-0 z-[110] bg-[#0b1c18]/65 backdrop-blur-[2px] lg:hidden" onMouseDown={()=>setMobileOpen(false)}>
   <aside role="dialog" aria-modal="true" aria-label="القائمة الرئيسية" className="h-full w-[min(94vw,360px)] shadow-2xl" onMouseDown={event=>event.stopPropagation()}>{sidebar}</aside>
  </div>}
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
   <header className="z-30 flex min-h-[68px] shrink-0 items-center justify-between gap-3 border-b border-[#e4eae6] bg-white px-4 sm:px-6 xl:px-8">
    <div className="flex min-w-0 items-center gap-3">
     <button type="button" onClick={()=>setMobileOpen(true)} aria-label={copy.menu} className="rounded-xl border border-[#e1e9e3] p-2 text-[#315c4b] hover:bg-[#f0f6f1] lg:hidden"><Menu size={19}/></button>
     <div className="min-w-0"><div className="flex items-center gap-2 text-[11px] text-[#82918a]"><span className="hidden sm:inline">{copy.merchant}</span><ChevronRight size={13} className="hidden sm:inline"/><span className="truncate font-bold text-[#375b4b]">{current.label}</span></div></div>
     {isStaging&&<span className="hidden rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-black tracking-[.12em] text-amber-800 sm:inline-flex">ENVIRONNEMENT TEST</span>}
    </div>
    <div className="flex shrink-0 items-center gap-2">
     <div className="relative hidden md:block">
      <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#8a9b91]"/>
      <input ref={searchRef} type="search" value={query} onFocus={()=>setSearchOpen(true)} onBlur={()=>window.setTimeout(()=>setSearchOpen(false),120)} onChange={event=>setQuery(event.target.value)} placeholder={copy.quick} aria-label={copy.quick} className="h-10 w-[220px] rounded-xl border border-[#e5ebe6] bg-[#f8faf8] ps-9 pe-14 text-[11px] outline-none focus:border-[#8ab89a] xl:w-[260px]"/>
      <kbd className="absolute end-2 top-1/2 -translate-y-1/2 rounded border border-[#e0e7e1] bg-white px-1.5 py-0.5 text-[9px] text-[#829187]"><Command size={10} className="inline"/> K</kbd>
      {searchOpen&&<div className="absolute end-0 top-12 z-50 w-[300px] overflow-hidden rounded-xl border border-[#e3eae5] bg-white p-2 shadow-xl"><p className="px-3 py-2 text-[9px] font-black tracking-[.16em] text-[#91a097]">{copy.quickTitle}</p>{filtered.map(item=><button key={item.id} type="button" onMouseDown={event=>event.preventDefault()} onClick={()=>select(item.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-xs font-bold text-[#315b49] hover:bg-[#eff6f0]"><item.icon size={16}/>{item.label}<ChevronRight size={13} className="ms-auto"/></button>)}{filtered.length===0&&<p className="px-3 py-4 text-xs text-[#829187]">{copy.noResults}</p>}</div>}
     </div>
     <span className={'hidden items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-bold lg:inline-flex '+(databaseReady===true?'bg-[#eaf6ed] text-[#26734c]':databaseReady===false?'bg-amber-50 text-amber-800':'bg-[#f0f3f1] text-[#77857d]')}><span className={'h-1.5 w-1.5 rounded-full '+(databaseReady===true?'bg-[#35a36b]':databaseReady===false?'bg-amber-500':'bg-[#a5b1aa]')}/>{databaseReady===true?copy.db[0]:databaseReady===false?copy.db[1]:copy.db[2]}</span>
     <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e9e4] px-3 text-[11px] font-bold text-[#315b49] hover:bg-[#f2f7f3]"><ExternalLink size={15}/><span className="hidden xl:inline">{copy.view}</span></a>
     
    </div>
   </header>
   <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <section className="flex shrink-0 flex-col justify-between gap-4 border-b border-[#e5ebe6] bg-white px-5 py-5 sm:flex-row sm:items-center sm:px-7 xl:px-9">
     <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#729181]">GLOBABOX / {copy.admin}</p><h1 className="mt-1 text-[25px] font-black tracking-[-.04em] text-[#18372c] sm:text-[29px]">{current.label}</h1><p className="mt-1 text-[11px] text-[#84928a]">{localizedSubtitles[activeTab]}</p></div>
     <div className="flex flex-wrap items-center gap-2">
      {showProductAction&&(activeTab==='dashboard'||activeTab==='products')&&<button type="button" onClick={onNewProduct} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#174d3d] px-4 text-[11px] font-extrabold text-white shadow-sm hover:bg-[#103b30]"><Plus size={16}/>{copy.newProduct}</button>}
      {activeTab==='orders'&&<button type="button" onClick={onPendingOrders} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 text-[11px] font-bold text-[#315b49] hover:bg-[#f1f7f2]"><ClipboardList size={15}/>{copy.toProcess} {pendingOrders>0?'('+pendingOrders+')':''}</button>}
     </div>
    </section>
    <main id="gb-admin-content" tabIndex={-1} aria-label="Contenu de l’administration" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#f4f6f5] focus:outline-none">
     <div className="mx-auto w-full max-w-[1680px]">{children}</div>
    </main>
   </div>
  </div>
 </div>;
}
