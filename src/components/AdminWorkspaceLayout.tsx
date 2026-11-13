import { useState, type ReactNode } from 'react';
import {
  BarChart3, CheckCircle2, ClipboardList, ExternalLink, LayoutDashboard,
  LogOut, Menu, Package, Plus, RefreshCw, ShieldCheck, Tags, X
} from 'lucide-react';

type AdminTab='dashboard'|'orders'|'products'|'categories'|'marketing';

interface AdminWorkspaceLayoutProps {
  activeTab:AdminTab;
  onTabChange:(tab:AdminTab)=>void;
  onClose:()=>void;
  onLogout:()=>void;
  ordersCount:number;
  pendingOrders:number;
  productsCount:number;
  categoriesCount:number;
  databaseReady:boolean|undefined;
  showProductAction:boolean;
  onNewProduct:()=>void;
  onPrepareProduct:()=>void;
  onPendingOrders:()=>void;
  onRefreshOrders:()=>void;
  isRefreshing:boolean;
  children:ReactNode;
}

const sections=[
 {id:'dashboard' as const,label:'Tableau de bord',sub:'نظرة عامة',icon:LayoutDashboard},
 {id:'orders' as const,label:'Commandes',sub:'الطلبات والشحن',icon:ClipboardList},
 {id:'products' as const,label:'Produits',sub:'المنتجات والمخزون',icon:Package},
 {id:'categories' as const,label:'Catégories',sub:'الأقسام والصور',icon:Tags},
 {id:'marketing' as const,label:'Marketing',sub:'التسويق والتحليلات',icon:BarChart3}
];

export default function AdminWorkspaceLayout({
 activeTab,onTabChange,onClose,onLogout,ordersCount,pendingOrders,
 productsCount,categoriesCount,databaseReady,showProductAction,
 onNewProduct,onPendingOrders,onRefreshOrders,isRefreshing,children
}:AdminWorkspaceLayoutProps){
 const [menuOpen,setMenuOpen]=useState(false);
 const selected=sections.find(s=>s.id===activeTab)??sections[0];
 const select=(id:AdminTab)=>{onTabChange(id);setMenuOpen(false);};
 const count=(id:AdminTab)=>id==='orders'?ordersCount:id==='products'?productsCount:id==='categories'?categoriesCount:null;
 const navigation=(mobile:boolean)=><nav aria-label={mobile?'Menu mobile administration':'Navigation administration'} className="space-y-1">
  {sections.map(section=>{
   const Icon=section.icon,active=section.id===activeTab,n=count(section.id);
   return <button type="button" key={section.id} onClick={()=>select(section.id)}
    aria-current={active?'page':undefined}
    className={'group flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c764] '+(active?'bg-[#e5f3eb] font-extrabold text-[#104d43]':'text-[#526d62] hover:bg-[#f2f7f4] hover:text-[#104d43]')}>
     <Icon size={19} className={active?'text-[#104d43]':'text-[#78978b]'} aria-hidden="true"/>
     <span className="min-w-0 flex-1"><span className="block text-sm">{section.label}</span><span className="block text-[11px] font-normal text-slate-500">{section.sub}</span></span>
     {n!==null&&<span className={'rounded-md px-2 py-1 text-[11px] font-extrabold '+(active?'bg-white text-[#104d43]':'bg-[#edf3ef] text-[#567366]')}>{n}</span>}
  </button>;
  })}
 </nav>;
 return <div className="fixed inset-0 z-[80] flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#f5f8f6] text-[#193e38]">
  <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-[#dce8e0] bg-white px-4 sm:px-6">
   <div className="flex min-w-0 items-center gap-3">
    <button type="button" className="rounded-lg border border-slate-200 p-2 text-[#104d43] hover:bg-[#f2f7f4] lg:hidden" onClick={()=>setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu size={21}/></button>
    <img src="/brand/globabox-mark.svg" alt="" className="h-10 w-10 shrink-0 rounded-xl"/>
    <div className="min-w-0"><h1 className="truncate text-base font-black tracking-tight sm:text-lg">GLOBA<span className="text-[#997526]">BOX</span> <span className="font-medium text-slate-400">/ Admin</span></h1>
      <p className="hidden text-[11px] text-slate-500 sm:block">Espace marchand · Gestion sécurisée</p></div>
   </div>
   <div className="flex shrink-0 items-center gap-2">
    <div className={'hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold md:flex '+(databaseReady===true?'border-[#bddfc9] bg-[#eff9f2] text-[#196943]':databaseReady===false?'border-amber-200 bg-amber-50 text-amber-800':'border-slate-200 bg-slate-50 text-slate-500')}>
     {databaseReady===true?<CheckCircle2 size={15}/>:<ShieldCheck size={15}/>}
     {databaseReady===true?'D1 connectée':databaseReady===false?'D1 à vérifier':'D1 non vérifiée'}
    </div>
    <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Voir la boutique" title="Voir la boutique" className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-[#104d43] hover:bg-[#f1f8f3]"><ExternalLink size={17}/><span className="hidden xl:inline">Voir la boutique</span></a>
    <button type="button" onClick={onLogout} title="Déconnexion" aria-label="Déconnexion" className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-[#566b63] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><LogOut size={17}/><span className="hidden xl:inline">Déconnexion</span></button>
    <button type="button" onClick={onClose} title="Fermer l'administration" aria-label="Fermer l'administration" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#566b63] hover:bg-slate-100"><X size={19}/></button>
   </div>
  </header>
  <div className="flex min-h-0 flex-1">
   <aside className="hidden w-[264px] shrink-0 flex-col border-e border-[#dce8e0] bg-white px-4 py-6 lg:flex">
    <p className="mb-4 px-3 text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">ESPACE MARCHAND</p>
    {navigation(false)}
    <div className="mt-auto rounded-2xl border border-[#d2e8d9] bg-[#f2f8f4] p-4">
      <span className="flex items-center gap-2 text-sm font-extrabold text-[#104d43]"><ShieldCheck size={18}/>Gestion des commandes</span>
      <p className="mt-2 text-xs leading-6 text-[#577363]">{pendingOrders} commande(s) en attente. Expéditions gérées manuellement.</p>
      <button type="button" onClick={()=>{onPendingOrders();setMenuOpen(false);}} className="mt-3 inline-flex min-h-9 items-center text-xs font-extrabold text-[#104d43] underline underline-offset-4 hover:text-[#0d352d]">Voir les commandes à traiter</button>
    </div>
   </aside>
   {menuOpen&&<div className="fixed inset-0 z-[100] bg-[#081c15]/50 lg:hidden" onMouseDown={()=>setMenuOpen(false)}>
      <aside className="flex h-full w-[min(84vw,320px)] flex-col bg-white p-5 shadow-2xl" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Menu d'administration">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-base font-black text-[#104d43]">GLOBABOX · ADMIN</span><button type="button" onClick={()=>setMenuOpen(false)} aria-label="Fermer le menu" className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div>
        {navigation(true)}
        <button type="button" onClick={()=>{onPendingOrders();setMenuOpen(false);}} className="mt-auto rounded-xl bg-[#e8f5ec] px-4 py-3 text-sm font-bold text-[#104d43]">{pendingOrders} commandes en attente</button>
      </aside>
    </div>}
   <div className="flex min-w-0 flex-1 flex-col">
    <div className="flex shrink-0 flex-col gap-3 border-b border-[#e0eae3] bg-[#fbfdfb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
     <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#3e8570]">GLOBABOX / ADMINISTRATION</p>
      <h2 className="mt-1 text-xl font-black tracking-tight text-[#193e38]">{selected.label}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{selected.sub}</p>
     </div>
     <div className="flex flex-wrap items-center gap-2">
      {(activeTab==='dashboard'||activeTab==='products') && showProductAction&&<button type="button" onClick={onNewProduct} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#104d43] px-4 text-xs font-extrabold text-white transition hover:bg-[#0b3830]"><Plus size={17}/>Ajouter un produit</button>}
      {(activeTab==='dashboard'||activeTab==='orders')&&<button type="button" onClick={onRefreshOrders} disabled={isRefreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#355a4a] hover:border-[#b8d7c2] hover:bg-[#f1f8f3] disabled:opacity-50"><RefreshCw size={16} className={isRefreshing?'animate-spin':''}/>{isRefreshing?'Actualisation…':'Actualiser commandes'}</button>}
     </div>
    </div>
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f5f8f6]">{children}</main>
   </div>
  </div>
 </div>;
}
