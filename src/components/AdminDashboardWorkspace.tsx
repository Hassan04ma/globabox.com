import { ArrowDownRight, ArrowUpRight, BarChart3, Boxes, CheckCircle2, Clock3, Package, Plus, RefreshCw, ShoppingBag, Truck, Wallet } from 'lucide-react';
import type { Order, Product } from '../types';

interface Bucket { label:string; revenue:number; orders:number }
interface Props {
  orders:Order[];
  products:Product[];
  totalOrders:number;
  pendingOrders:number;
  preparingOrders:number;
  shippedOrders:number;
  deliveredOrders:number;
  deliveredRevenue:number;
  currentRevenue:number;
  currentOrders:number;
  averageOrderValue:number;
  revenueChange:number|null;
  periodLabel:string;
  buckets:Bucket[];
  topProducts:[string,number][];
  isRefreshing:boolean;
  refreshError:string|null;
  refreshSuccess:string|null;
  onRefresh:()=>void;
  onNewProduct:()=>void;
  onOrders:()=>void;
  onProducts:()=>void;
}
const money=(n:number)=>new Intl.NumberFormat('fr-MA',{maximumFractionDigits:0}).format(n)+' DH';
const statusLabel=(status:string)=>({pending:'En attente',confirmed:'Confirmée',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'} as Record<string,string>)[status]||status;
const dateLabel=(value?:string)=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-MA',{timeZone:'Africa/Casablanca',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)};
export default function AdminDashboardWorkspace(p:Props){
 const active=p.products.filter(x=>x.isActive===true).length;
 const drafts=p.products.length-active;
 const max=Math.max(1,...p.buckets.map(x=>x.revenue));
 const maxOrders=Math.max(1,...p.buckets.map(x=>x.orders));
 const stats=[
  {label:'Commandes',value:String(p.totalOrders),hint:'Toutes les commandes',icon:ShoppingBag,accent:'blue'},
  {label:'À traiter',value:String(p.pendingOrders),hint:'En attente de confirmation',icon:Clock3,accent:'amber'},
  {label:'En préparation',value:String(p.preparingOrders),hint:'À préparer manuellement',icon:Package,accent:'violet'},
  {label:'Expédiées',value:String(p.shippedOrders),hint:'En cours de livraison',icon:Truck,accent:'cyan'},
  {label:'Livrées',value:String(p.deliveredOrders),hint:'Commandes terminées',icon:CheckCircle2,accent:'green'},
  {label:'Chiffre livré',value:money(p.deliveredRevenue),hint:'Total réellement livré',icon:Wallet,accent:'green'},
  {label:'Produits actifs',value:String(active),hint:'Visibles sur la boutique',icon:Boxes,accent:'blue'},
  {label:'Brouillons',value:String(drafts),hint:'Non publiés',icon:Package,accent:'slate'}
 ] as const;
 return <div className="space-y-6 p-4 sm:p-6 xl:p-8">
  <section className="relative overflow-hidden rounded-[26px] bg-[#102f2b] p-6 text-white shadow-[0_18px_50px_rgba(16,47,43,.14)] sm:p-8">
   <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[38px] border-white/[.045]"/>
   <div className="pointer-events-none absolute -bottom-32 right-36 h-64 w-64 rounded-full bg-[#c69b50]/10 blur-2xl"/>
   <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
    <div className="max-w-2xl">
     <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-[#d7b56f]">GLOBABOX · ESPACE DE PILOTAGE</p>
     <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-[38px]">Bonjour, bienvenue dans votre boutique.</h2>
     <p className="mt-3 max-w-xl text-sm leading-7 text-[#c0d2cc]">Suivez vos ventes, traitez les commandes et gardez votre catalogue sous contrôle depuis un seul espace.</p>
    </div>
    <div className="flex flex-wrap gap-2">
     <button type="button" onClick={p.onNewProduct} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d9b56c] px-5 text-xs font-extrabold text-[#18352e] hover:bg-[#e8c77f]"><Plus size={17}/>Ajouter un produit</button>
     <button type="button" onClick={p.onOrders} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/[.07] px-5 text-xs font-bold text-white hover:bg-white/[.13]">Voir les commandes</button>
    </div>
   </div>
   <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-[#c0d2cc]">
    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#6ed49b]"/>Vue des données en direct</span>
    <span>Heure du Maroc · Africa/Casablanca</span>
    <span>Devise : MAD (DH)</span>
   </div>
  </section>

  <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-4">
   {stats.map(({label,value,hint,icon:Icon,accent})=><article key={label} className="group rounded-2xl border border-[#e4e9e6] bg-white p-4 shadow-[0_2px_12px_rgba(20,45,35,.025)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
    <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#71817a]">{label}</span><span className={'flex h-9 w-9 items-center justify-center rounded-xl '+(accent==='green'?'bg-[#e9f6ee] text-[#258456]':accent==='amber'?'bg-[#fff4e4] text-[#b37b2b]':accent==='violet'?'bg-[#f2edfb] text-[#8064b0]':accent==='cyan'?'bg-[#e9f5f8] text-[#36849a]':accent==='blue'?'bg-[#edf3fa] text-[#547da7]':'bg-[#f0f2f1] text-[#687871]')}><Icon size={18}/></span></div>
    <strong className="mt-4 block break-words text-[25px] font-black tracking-tight text-[#203a32] sm:text-[29px]">{value}</strong>
    <p className="mt-1 text-[10px] leading-5 text-[#8a9891]">{hint}</p>
   </article>)}
  </section>

  <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.8fr)]">
   <article className="min-w-0 rounded-[22px] border border-[#e3e9e5] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8a9a91]">ANALYSE DES VENTES</p><h3 className="mt-1 text-lg font-black text-[#203a32]">Performance commerciale</h3><p className="mt-1 text-xs text-[#839088]">{p.periodLabel} · données des commandes serveur</p></div>
     <div className="rounded-xl bg-[#edf6ef] px-3 py-2 text-[10px] font-bold text-[#276848]">DH · MAD</div>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
     <div className="rounded-xl bg-[#f6f8f6] p-3"><p className="text-[10px] text-[#819087]">CA livré sur la période</p><strong className="mt-1 block text-lg font-black text-[#203a32]">{money(p.currentRevenue)}</strong></div>
     <div className="rounded-xl bg-[#f6f8f6] p-3"><p className="text-[10px] text-[#819087]">Commandes reçues</p><strong className="mt-1 block text-lg font-black text-[#203a32]">{p.currentOrders}</strong></div>
     <div className="col-span-2 rounded-xl bg-[#f6f8f6] p-3 sm:col-span-1"><p className="text-[10px] text-[#819087]">Panier moyen livré</p><strong className="mt-1 block text-lg font-black text-[#203a32]">{money(p.averageOrderValue)}</strong></div>
    </div>
    <div className="mt-6">
     <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-extrabold text-[#52645a]">Évolution du chiffre d’affaires livré</h4><span className={'inline-flex items-center gap-1 text-[11px] font-extrabold '+(p.revenueChange===null?'text-slate-400':p.revenueChange>=0?'text-[#258456]':'text-[#c35a50]')}>{p.revenueChange===null?'Pas de comparaison':<>{p.revenueChange>=0?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {Math.abs(p.revenueChange).toFixed(1)}%</>}</span></div>
     <div className="flex h-44 items-end gap-1.5 border-b border-[#e8eeea] pb-5">
      {p.buckets.map((b,i)=><div key={i} title={b.label+' · '+money(b.revenue)} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div className="w-full rounded-t-md bg-gradient-to-t from-[#1c604b] to-[#75b995] transition-all" style={{height:b.revenue>0?Math.max(4,b.revenue/max*118)+'px':'2px'}}/><span className="mt-2 truncate text-center text-[9px] text-[#87948d]">{p.buckets.length>18?(i%3===0?b.label:''):b.label}</span></div>)}
     </div>
    </div>
   </article>
   <article className="rounded-[22px] border border-[#e3e9e5] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8a9a91]">SUIVI DES VENTES</p><h3 className="mt-1 text-lg font-black text-[#203a32]">État des commandes</h3></div><BarChart3 size={20} className="text-[#51866b]"/></div>
    {(['pending','confirmed','processing','shipped','delivered','cancelled'] as const).map((status,i)=>{const count=p.orders.filter(o=>o.status===status).length;const pct=p.totalOrders?count/p.totalOrders*100:0;return <div key={status} className="mt-4"><div className="mb-1.5 flex justify-between text-[11px]"><span className="font-semibold text-[#627269]">{statusLabel(status)}</span><strong className="text-[#2d4338]">{count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#edf1ee]"><div className="h-full rounded-full bg-[#4d9671]" style={{width:pct+'%'}}/></div></div>})}
    <div className="mt-6 rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] text-[#849189]">À suivre en priorité</p><p className="mt-1 text-sm font-black text-[#203a32]">{p.pendingOrders} commande(s) en attente</p><button type="button" onClick={p.onOrders} className="mt-2 text-[11px] font-extrabold text-[#246849] underline underline-offset-4">Ouvrir les commandes</button></div>
   </article>
  </section>

  <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,.9fr)]">
   <article className="min-w-0 overflow-hidden rounded-[22px] border border-[#e3e9e5] bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#8a9a91]">ACTIVITÉ RÉCENTE</p><h3 className="mt-1 text-base font-black text-[#203a32]">Dernières commandes</h3></div><div className="flex gap-2"><button type="button" onClick={p.onRefresh} disabled={p.isRefreshing} aria-label="Actualiser les commandes" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e8e3] text-[#3e7258] hover:bg-[#f3f8f4] disabled:opacity-50"><RefreshCw size={15} className={p.isRefreshing?'animate-spin':''}/></button><button type="button" onClick={p.onOrders} className="rounded-lg bg-[#edf6ef] px-3 text-[11px] font-extrabold text-[#286849]">Tout voir</button></div></header>
    {p.refreshError&&<p role="alert" className="mx-5 mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{p.refreshError}</p>}{p.refreshSuccess&&<p role="status" className="mx-5 mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700">{p.refreshSuccess}</p>}
    <div className="divide-y divide-[#edf0ed]">{p.orders.slice(0,5).map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate text-xs font-extrabold text-[#2b4338]">{o.fullName||'Client'} <span className="ms-2 font-mono text-[10px] text-[#8b9990]">{o.reference}</span></p><p className="mt-1 text-[10px] text-[#89968e]">{o.city} · {dateLabel(o.createdAt||o.date)}</p></div><div className="flex items-center gap-2"><strong className="text-xs text-[#2b4338]">{money(Number(o.finalTotal??o.total??0))}</strong><span className={'rounded-full px-2.5 py-1 text-[9px] font-extrabold '+(o.status==='delivered'?'bg-[#e8f5ed] text-[#27744b]':o.status==='cancelled'?'bg-rose-50 text-rose-700':o.status==='pending'?'bg-amber-50 text-amber-700':'bg-[#eef3f8] text-[#42688b]')}>{statusLabel(o.status)}</span></div></div>)}
    {p.orders.length===0&&<div className="px-5 py-12 text-center"><ShoppingBag size={28} className="mx-auto text-[#a4b5aa]"/><p className="mt-3 text-sm font-bold text-[#3b5848]">Aucune commande pour le moment</p><p className="mt-1 text-xs text-[#8a9890]">Les nouvelles commandes apparaîtront ici automatiquement.</p></div>}</div>
   </article>
   <div className="space-y-5">
    <article className="rounded-[22px] border border-[#e3e9e5] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-base font-black text-[#203a32]">Catalogue produits</h3><Package size={19} className="text-[#4a8666]"/></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] text-[#819087]">Total produits</p><strong className="mt-1 block text-2xl font-black text-[#203a32]">{p.products.length}</strong></div><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] text-[#819087]">Actifs</p><strong className="mt-1 block text-2xl font-black text-[#203a32]">{active}</strong></div></div><button type="button" onClick={p.onProducts} className="mt-4 min-h-10 w-full rounded-xl border border-[#cbded0] text-xs font-extrabold text-[#286849] hover:bg-[#f3f8f4]">Gérer le catalogue</button></article>
    <article className="rounded-[22px] border border-[#e3e9e5] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Truck size={19} className="text-[#4a8666]"/><h3 className="text-base font-black text-[#203a32]">Expédition manuelle</h3></div><p className="mt-2 text-xs leading-6 text-[#74847a]">Préparez les colis et mettez à jour les statuts depuis la section Commandes. Aucun envoi automatique n’est déclenché.</p><button type="button" onClick={p.onOrders} className="mt-3 text-xs font-extrabold text-[#286849] underline underline-offset-4">Gérer les expéditions</button></article>
    <article className="rounded-[22px] border border-[#e3e9e5] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-[#203a32]">Meilleures ventes</h3><BarChart3 size={18} className="text-[#4a8666]"/></div>{p.topProducts.length?p.topProducts.map(([name,qty])=><div key={name} className="flex justify-between gap-2 border-b border-[#edf0ed] py-2 text-[11px]"><span className="truncate text-[#66766d]">{name}</span><strong className="shrink-0 text-[#2c493a]">{qty} unité(s)</strong></div>):<p className="mt-3 text-xs text-[#87948d]">Les produits vendus apparaîtront après les premières livraisons.</p>}</article>
   </div>
  </section>
 </div>;
}
