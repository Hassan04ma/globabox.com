import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight, BarChart3, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  Command, ExternalLink, LayoutDashboard, LogOut, Menu, Package, Plus, Search, ShieldCheck,
  Store, Tags, Truck, X
} from 'lucide-react';
import '../adminPlatform.css';

type AdminTab='dashboard'|'orders'|'products'|'categories'|'marketing';
interface Props{
 activeTab:AdminTab; onTabChange:(tab:AdminTab)=>void;
 onClose:()=>void;onLogout:()=>void;
 ordersCount:number;pendingOrders:number;productsCount:number;categoriesCount:number;
 databaseReady:boolean|undefined; showProductAction:boolean;
 onNewProduct:()=>void; onPrepareProduct:()=>void;
 onPendingOrders:()=>void;onRefreshOrders:()=>void;isRefreshing:boolean;
 children:ReactNode;
}
const tabs=[
 {id:'dashboard' as const,label:'Vue d’ensemble',sub:'Dashboard',icon:LayoutDashboard,group:'GÉNÉRAL'},
 {id:'orders' as const,label:'Commandes',sub:'Livraison & paiements',icon:ClipboardList,group:'COMMERCE'},
 {id:'products' as const,label:'Produits',sub:'Catalogue & inventaire',icon:Package,group:'COMMERCE'},
 {id:'categories' as const,label:'Collections',sub:'Rayons & catégories',icon:Tags,group:'COMMERCE'},
 {id:'marketing' as const,label:'Marketing',sub:'Pixels & acquisition',icon:BarChart3,group:'DÉVELOPPEMENT'}
];
export default function AdminWorkspaceLayout({
 activeTab,onTabChange,onClose,onLogout,ordersCount,pendingOrders,productsCount,
 categoriesCount,databaseReady,showProductAction,onNewProduct,onPendingOrders,children
}:Props){
 const [mobileOpen,setMobileOpen]=useState(false);
 const [quickSearch,setQuickSearch]=useState('');
 const [searchFocused,setSearchFocused]=useState(false);
 const searchRef=useRef<HTMLInputElement>(null);
 const isStaging=typeof window!=='undefined'&&
  (window.location.hostname.startsWith('test.')||window.location.hostname.includes('staging'));
 const current=tabs.find(t=>t.id===activeTab)||tabs[0];
 const count=(id:AdminTab)=>id==='orders'?ordersCount:id==='products'?productsCount:id==='categories'?categoriesCount:null;
 const select=(id:AdminTab)=>{onTabChange(id);setMobileOpen(false);setSearchFocused(false);setQuickSearch('');};
 const matches=tabs.filter(tab=>(tab.label+' '+tab.sub+' '+tab.group).toLowerCase().includes(quickSearch.toLowerCase()));
 useEffect(()=>{
  const listener=(e:KeyboardEvent)=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchRef.current?.focus();setSearchFocused(true);}
    if(e.key==='Escape'){setMobileOpen(false);setSearchFocused(false);}
  };
  window.addEventListener('keydown',listener);
  return ()=>window.removeEventListener('keydown',listener);
 },[]);
 const nav=<div className="flex h-full min-h-0 flex-col">
  <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/10 px-6">
    <img src="/brand/globabox-mark.svg" alt="" className="h-11 w-11 shrink-0 rounded-[12px] bg-white p-1"/>
    <div className="min-w-0">
      <p className="text-[19px] font-black leading-tight tracking-tight text-white">GLOBA<span className="text-[#e5ba55]">BOX</span></p>
      <p className="mt-0.5 text-[11px] font-medium tracking-wide text-[#95aeaa]">COMMERCE CONSOLE</p>
    </div>
    <button type="button" className="ms-auto rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden" onClick={()=>setMobileOpen(false)} aria-label="Fermer le menu"><X size={20}/></button>
  </div>
  <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-5 gb-admin-side-scroll">
    <div className="mx-2 mb-6 flex items-center gap-3 rounded-[13px] border border-white/15 bg-white/[.07] px-3 py-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#294e49] text-[#8af0c1]"><Store size={20}/></span>
      <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold text-white">Ma boutique</span><span className="block truncate text-[11px] text-[#a3b9b6]">GLOBABOX · Maroc</span></span>
      <ChevronDown size={15} className="text-[#8ea7a3]"/>
    </div>
    <nav aria-label="Navigation de l’administration">
      {(['GÉNÉRAL','COMMERCE','DÉVELOPPEMENT'] as const).map(group=><div key={group} className="mb-6">
        <p className="mb-2 px-4 text-[10px] font-extrabold tracking-[.17em] text-[#829b9a]">{group}</p>
        <div className="space-y-1">{tabs.filter(t=>t.group===group).map(tab=>{
          const Icon=tab.icon,selected=activeTab===tab.id,n=count(tab.id);
          return <button type="button" key={tab.id} onClick={()=>select(tab.id)}
            aria-current={selected?'page':undefined}
            className={'group flex min-h-[47px] w-full items-center gap-3 rounded-[11px] px-3.5 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e4b85a] '+
              (selected?'bg-[#2e6559] text-white shadow-[inset_3px_0_0_#8ee9b6]':'text-[#b4c9c4] hover:bg-white/[.09] hover:text-white')}>
            <Icon size={19} strokeWidth={selected?2.25:1.85} className={selected?'text-[#b0f5cf]':'text-[#96ada9]'}/>
            <span className="flex-1 text-[13px] font-semibold">{tab.label}</span>
            {n!==null&&<span className={'min-w-7 rounded-md px-2 py-1 text-center text-[11px] font-bold '+(selected?'bg-white/15 text-white':'bg-[#2a3e47] text-[#adbfbd]')}>{n}</span>}
          </button>;
        })}</div>
      </div>)}
    </nav>
    <div className="mx-2 mt-9 rounded-[14px] border border-[#3b5955] bg-[#233b3b] p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold text-[#b4efd0]"><Truck size={17}/>Expédition manuelle</div>
      <p className="mt-2 text-[12px] leading-5 text-[#b9cac5]">{pendingOrders===0?'Aucune commande en attente.':pendingOrders+' commande(s) à confirmer.'}</p>
      <button type="button" onClick={onPendingOrders} className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-[12px] font-bold text-white underline decoration-[#81c4a1] underline-offset-4">Gérer les commandes <ArrowUpRight size={14}/></button>
    </div>
  </div>
  <div className="shrink-0 border-t border-white/10 px-4 py-4">
    <div className="flex items-center gap-3 px-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#375e54] text-sm font-extrabold text-[#e8fbec]">GB</span>
      <div className="flex-1"><p className="text-xs font-bold text-white">Administrateur</p><p className="text-[11px] text-[#9bb2ac]">Accès sécurisé</p></div>
      <button type="button" onClick={onLogout} title="Déconnexion" aria-label="Déconnexion" className="rounded-xl p-2 text-[#a8c1ba] hover:bg-white/10 hover:text-white"><LogOut size={18}/></button>
    </div>
  </div>
 </div>;
 return <div className="gb-admin-platform fixed inset-0 z-[80] flex h-[100dvh] min-h-0 overflow-hidden bg-[#f3f5f7] text-[#1f2937]">
   <aside className="hidden h-full w-[252px] shrink-0 bg-[#142b32] lg:block xl:w-[266px]">{nav}</aside>
   {mobileOpen&&<div className="fixed inset-0 z-[110] bg-[#101e23]/70 lg:hidden" onMouseDown={()=>setMobileOpen(false)}>
     <aside role="dialog" aria-label="Menu principal" aria-modal="true" className="h-full w-[min(85vw,290px)] bg-[#142b32] shadow-2xl" onMouseDown={e=>e.stopPropagation()}>{nav}</aside>
   </div>}
   <div className="flex min-h-0 min-w-0 flex-1 flex-col">
     <header className="relative z-30 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-[#e2e7e8] bg-white px-4 sm:px-6 xl:px-8">
       <div className="flex min-w-0 items-center gap-3">
         <button type="button" className="rounded-xl border border-slate-200 p-2 text-[#365549] hover:bg-[#edf6f0] lg:hidden" onClick={()=>setMobileOpen(true)} aria-label="Ouvrir le menu"><Menu size={21}/></button>
         <div className="flex min-w-0 items-center gap-2 text-[13px]">
           <span className="hidden font-medium text-[#7b898d] sm:inline">Espace marchand</span>
           <ChevronRight size={15} className="hidden text-[#a5b1b2] sm:inline"/>
           <span className="truncate font-bold text-[#203d34]">{current.label}</span>
         </div>
         {isStaging&&<span className="hidden rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-800 md:inline">TEST</span>}
       </div>
       <div className="flex shrink-0 items-center gap-2.5">
         <div className="relative hidden md:block">
           <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#8c9c9c]"/>
           <input ref={searchRef} value={quickSearch} onFocus={()=>setSearchFocused(true)} onBlur={()=>window.setTimeout(()=>setSearchFocused(false),120)}
             onChange={e=>setQuickSearch(e.target.value)} type="search" placeholder="Accès rapide aux sections…"
             aria-label="Rechercher une section d’administration"
             className="h-10 w-[220px] rounded-[10px] border border-[#e1e8e5] bg-[#f8faf9] ps-9 pe-3 text-xs text-[#1d3d35] outline-none focus:border-[#92c5a7] xl:w-[280px]"/>
           {searchFocused&&<div className="absolute end-0 top-12 z-40 w-[320px] overflow-hidden rounded-xl border border-[#e0e8e2] bg-white py-2 shadow-xl">
             <p className="px-4 py-2 text-[10px] font-extrabold tracking-widest text-slate-400">ACCÈS RAPIDE</p>
             {matches.map(item=><button type="button" key={item.id} onMouseDown={e=>e.preventDefault()} onClick={()=>select(item.id)}
               className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-xs font-semibold text-[#2b5346] hover:bg-[#eff6f0]">
               <item.icon size={16}/>{item.label}<ChevronRight size={14} className="ms-auto text-slate-400"/>
             </button>)}
             {matches.length===0&&<p className="px-4 py-3 text-xs text-slate-500">Aucune section trouvée.</p>}
           </div>}
         </div>
         <span className={'hidden items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-bold lg:inline-flex '+(databaseReady===true?'bg-[#e7f7eb] text-[#1b6946]':databaseReady===false?'bg-amber-50 text-amber-800':'bg-slate-100 text-slate-500')}>
           <span className={'h-2 w-2 rounded-full '+(databaseReady===true?'bg-[#34a36d]':databaseReady===false?'bg-amber-500':'bg-slate-400')}/>
           {databaseReady===true?'D1 connectée':databaseReady===false?'D1 à vérifier':'D1 non vérifiée'}
         </span>
         <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-xl border border-[#e0e8e3] px-3 text-xs font-bold text-[#36564a] hover:bg-[#f2f8f4]"><ExternalLink size={17}/><span className="hidden xl:inline">Voir la boutique</span></a>
         <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0e8e3] text-[#6a8276] hover:bg-slate-100" aria-label="Fermer l’administration"><X size={19}/></button>
       </div>
     </header>
     <div className="flex min-h-0 min-w-0 flex-1 flex-col">
       <section className="flex shrink-0 flex-col gap-3 border-b border-[#e1e7e5] bg-white px-5 pb-5 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-7 xl:px-9">
         <div className="min-w-0">
           <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#6e8d80]">GLOBABOX / COMMERCE</p>
           <h1 className="mt-1 text-[27px] font-extrabold leading-tight tracking-tight text-[#1d2f30]">{current.label}</h1>
           <p className="mt-1 text-xs text-[#728389]">{current.sub}</p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
           {showProductAction&&<button type="button" onClick={onNewProduct} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#174d40] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0f3b31]"><Plus size={18}/>Nouveau produit</button>}
           {activeTab==='orders'&&<button type="button" onClick={onPendingOrders} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#d6e2db] bg-white px-4 text-xs font-bold text-[#315448] hover:bg-[#f1f8f4]"><ClipboardList size={16}/>À traiter {pendingOrders>0?'('+pendingOrders+')':''}</button>}
         </div>
       </section>
       <main id="gb-admin-content" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#f3f5f7]">
         <div className="mx-auto w-full max-w-[1580px]">{children}</div>
       </main>
     </div>
   </div>
 </div>;
}
