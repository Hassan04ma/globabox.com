import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpLeft, ArrowUpRight, ArrowDownRight, ArrowRight, BarChart3, CheckCircle2, Clock3, Package, Plus, ShoppingBag, Truck } from 'lucide-react';
import type { Order, Product } from '../types';

type Period = '7d' | '30d' | '90d';
interface Props {
  orders: Order[];
  products: Product[];
  onOrders: () => void;
  onProducts: () => void;
  onNewProduct: () => void;
  onPendingOrders: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  language: 'ar' | 'fr' | 'en' | string;
}
const money = (value:number) => new Intl.NumberFormat('fr-MA',{maximumFractionDigits:0}).format(value) + ' DH';
const dateOf = (order:Order) => { const d=new Date(order.createdAt || order.date); return Number.isNaN(d.getTime())?null:d; };
const statusText:Record<string,string>={pending:'En attente',confirmed:'Confirmée',processing:'En préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'};
const statusClass:Record<string,string>={pending:'bg-amber-50 text-amber-700',confirmed:'bg-blue-50 text-blue-700',processing:'bg-violet-50 text-violet-700',shipped:'bg-cyan-50 text-cyan-700',delivered:'bg-emerald-50 text-emerald-700',cancelled:'bg-slate-100 text-slate-600'};
export default function AdminDashboardWorkspace({orders,products,onOrders,onProducts,onNewProduct,onPendingOrders,onRefresh,refreshing,language}:Props){
 const [period,setPeriod]=useState<Period>('7d');
 const rtl=language==='ar';
 const now=new Date();
 const days=period==='7d'?7:period==='30d'?30:90;
 const start=new Date(now);start.setDate(start.getDate()-(days-1));start.setHours(0,0,0,0);
 const previousStart=new Date(start);previousStart.setDate(previousStart.getDate()-days);
 const current=useMemo(()=>orders.filter(o=>{const d=dateOf(o);return !!d&&d>=start&&d<=now;}),[orders,period]);
 const previous=useMemo(()=>orders.filter(o=>{const d=dateOf(o);return !!d&&d>=previousStart&&d<start;}),[orders,period]);
 const revenue=(items:Order[])=>items.filter(o=>o.status==='delivered').reduce((sum,o)=>sum+Number(o.finalTotal??o.total??0),0);
 const currentRevenue=revenue(current),previousRevenue=revenue(previous);
 const change=previousRevenue>0?(currentRevenue-previousRevenue)/previousRevenue*100:null;
 const pending=orders.filter(o=>o.status==='pending').length;
 const delivered=orders.filter(o=>o.status==='delivered').length;
 const published=products.filter(p=>p.isActive===true).length;
 const drafts=products.length-published;
 const buckets=useMemo(()=>{
  const count=period==='7d'?7:period==='30d'?10:12;
  const span=period==='7d'?1:period==='30d'?3:8;
  return Array.from({length:count},(_,i)=>{
   const d=new Date(start);d.setDate(d.getDate()+i*span);
   const end=new Date(d);end.setDate(end.getDate()+span);
   const rows=current.filter(o=>{const od=dateOf(o);return !!od&&od>=d&&od<end;});
   return {label:period==='7d'?new Intl.DateTimeFormat('fr-MA',{weekday:'short'}).format(d):new Intl.DateTimeFormat('fr-MA',{day:'2-digit',month:'short'}).format(d),revenue:revenue(rows),orders:rows.length};
  });
 },[orders,period]);
 const max=Math.max(1,...buckets.map(b=>b.revenue));
 const best=useMemo(()=>{
  const map=new Map<string,number>();
  current.filter(o=>o.status==='delivered').forEach(o=>o.items?.forEach(item=>map.set(item.productName,(map.get(item.productName)||0)+Number(item.quantity||0))));
  return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);
 },[current]);
 const recent=[...orders].sort((a,b)=>(dateOf(b)?.getTime()||0)-(dateOf(a)?.getTime()||0)).slice(0,6);
 const label=rtl?{hello:'نظرة عامة',title:'مرحباً بك في لوحة متجرك',desc:'تابع المبيعات والطلبات والمنتجات من مكان واحد.',orders:'الطلبات',products:'المنتجات',sales:'المبيعات المحصلة',waiting:'طلبات تنتظر التأكيد',published:'منتجات منشورة',drafts:'مسودات',performance:'أداء المتجر',recent:'أحدث الطلبات',top:'المنتجات الأكثر مبيعاً',all:'عرض الكل',add:'إضافة منتج',refresh:'تحديث',empty:'لا توجد طلبات خلال هذه الفترة',periods:['7 أيام','30 يوماً','90 يوماً']}:language==='en'?{hello:'OVERVIEW',title:'Welcome to your store',desc:'Track sales, orders and products in one place.',orders:'Orders',products:'Products',sales:'Delivered sales',waiting:'Awaiting confirmation',published:'Published products',drafts:'Drafts',performance:'Store performance',recent:'Recent orders',top:'Top-selling products',all:'View all',add:'Add product',refresh:'Refresh',empty:'No orders in this period',periods:['7 days','30 days','90 days']} :
  {hello:'VUE D’ENSEMBLE',title:'Bienvenue dans votre boutique',desc:'Suivez vos ventes, vos commandes et votre catalogue au même endroit.',orders:'Commandes',products:'Produits',sales:'Ventes livrées',waiting:'À confirmer',published:'Produits publiés',drafts:'Brouillons',performance:'Performance de la boutique',recent:'Commandes récentes',top:'Meilleures ventes',all:'Tout afficher',add:'Ajouter un produit',refresh:'Actualiser',empty:'Aucune commande sur cette période',periods:['7 jours','30 jours','90 jours']};
 return <div dir={rtl?'rtl':'ltr'} className="space-y-6 text-slate-800">
  <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
   <div><p className="text-[11px] font-bold tracking-[.16em] text-emerald-700">{label.hello}</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{label.title}</h2><p className="mt-2 text-sm text-slate-500">{label.desc}</p></div>
   <div className="flex flex-wrap gap-2"><button onClick={onNewProduct} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#174d40] px-4 text-sm font-semibold text-white hover:bg-[#103c32]"><Plus size={16}/>{label.add}</button><button onClick={onRefresh} disabled={refreshing} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{refreshing?'…':label.refresh}</button></div>
  </section>
  <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
   {[{title:label.orders,value:orders.length,sub:'Total enregistré',icon:ShoppingBag,tone:'text-blue-700 bg-blue-50',click:onOrders},{title:label.sales,value:money(revenue(orders)),sub:delivered+' livrées',icon:BarChart3,tone:'text-emerald-700 bg-emerald-50',click:onOrders},{title:label.waiting,value:pending,sub:'Action requise',icon:Clock3,tone:'text-amber-700 bg-amber-50',click:onPendingOrders},{title:label.published,value:published,sub:drafts+' '+label.drafts.toLowerCase(),icon:Package,tone:'text-violet-700 bg-violet-50',click:onProducts}].map(({title,value,sub,icon:Icon,tone,click})=><button key={title} onClick={click} className="rounded-xl border border-slate-200 bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-500">{title}</span><span className={'rounded-lg p-2 '+tone}><Icon size={18}/></span></div><strong className="mt-4 block text-2xl font-bold tracking-tight text-slate-900">{value}</strong><span className="mt-1 block text-xs text-slate-400">{sub}</span></button>)}
  </section>
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
   <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">{label.performance}</h3><p className="mt-1 text-xs text-slate-500">Chiffre d’affaires des commandes livrées · DH</p></div><div className="flex rounded-lg bg-slate-100 p-1">{(['7d','30d','90d'] as Period[]).map((p,i)=><button key={p} onClick={()=>setPeriod(p)} className={'rounded-md px-3 py-2 text-xs font-semibold '+(period===p?'bg-white text-slate-900 shadow-sm':'text-slate-500')}>{label.periods[i]}</button>)}</div></div>
   <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]"><div className="min-w-0"><div className="mb-3 flex items-end gap-3"><strong className="text-3xl font-bold text-slate-900">{money(currentRevenue)}</strong><span className={'mb-1 text-xs font-semibold '+(change===null?'text-slate-400':change>=0?'text-emerald-700':'text-rose-700')}>{change===null?'—':(change>0?'+':'')+change.toFixed(1)+'%'}</span></div><div className="flex h-40 items-end gap-2 border-b border-slate-100 pb-1">{buckets.map((b,i)=><div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end"><div title={money(b.revenue)} className="w-full rounded-t-md bg-emerald-600/80 transition-all" style={{height:b.revenue?Math.max(4,b.revenue/max*126)+'px':'2px'}}/><span className="mt-2 truncate text-center text-[10px] text-slate-400">{b.label}</span></div>)}</div></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-1"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Commandes sur la période</p><strong className="mt-1 block text-2xl font-bold">{current.length}</strong></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Panier moyen livré</p><strong className="mt-1 block text-2xl font-bold">{money(delivered?revenue(orders)/delivered:0)}</strong></div></div></div>
  </section>
  <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
   <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">{label.recent}</h3><button onClick={onOrders} className="text-xs font-semibold text-emerald-800 hover:underline">{label.all}</button></div>{recent.length?<div className="divide-y divide-slate-100">{recent.map(o=><div key={o.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[1fr_120px_100px]"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{o.fullName||'Client'}</p><p className="mt-1 truncate text-xs text-slate-400">#{o.reference||o.id} · {o.city||'—'}</p></div><span className={'hidden w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex '+(statusClass[o.status]||statusClass.pending)}>{statusText[o.status]||o.status}</span><strong className="text-end text-sm font-bold text-slate-900">{money(Number(o.finalTotal??o.total??0))}</strong></div>)}</div>:<p className="p-8 text-center text-sm text-slate-400">{label.empty}</p>}</div>
   <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">{label.top}</h3><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Truck size={18}/></span></div>{best.length?<div className="mt-4 divide-y divide-slate-100">{best.map(([name,qty],i)=><div key={name} className="flex items-center gap-3 py-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{i+1}</span><span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{name}</span><strong className="text-sm">{qty} u.</strong></div>)}</div>:<p className="py-8 text-center text-sm text-slate-400">Aucune vente livrée sur la période.</p>}<button onClick={onProducts} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:underline">{label.products}<ArrowRight size={14}/></button></div>
  </section>
 </div>;
}
