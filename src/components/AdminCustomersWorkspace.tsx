import { useMemo, useState } from 'react';
import { Search, Users, ShoppingBag, Wallet, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import type { Order } from '../types';

interface Props { orders:Order[]; language:'fr'|'ar'|'en'; }
interface Customer { key:string; name:string; phone:string; city:string; orders:Order[]; spent:number; lastDate:number; }
const money=(n:number)=>new Intl.NumberFormat('fr-MA',{maximumFractionDigits:0}).format(n)+' DH';
const dateValue=(o:Order)=>{const d=new Date(o.createdAt||o.date);return Number.isNaN(d.getTime())?0:d.getTime();};
export default function AdminCustomersWorkspace({orders,language}:Props){
 const [query,setQuery]=useState('');
 const [sort,setSort]=useState<'recent'|'orders'|'spent'>('recent');
 const ar=language==='ar';
 const customers=useMemo(()=>{
  const map=new Map<string,Customer>();
  orders.forEach(order=>{
   const phone=String(order.phoneNumber||'').trim();
   const key=phone.replace(/\s+/g,'')||'order:'+order.id;
   const row=map.get(key)||{key,name:order.fullName||'—',phone,city:order.city||'—',orders:[],spent:0,lastDate:0};
   row.orders.push(order);row.lastDate=Math.max(row.lastDate,dateValue(order));
   if(order.status==='delivered')row.spent+=Number(order.finalTotal??order.total??0);
   if(!row.name&&order.fullName)row.name=order.fullName;
   if(row.city==='—'&&order.city)row.city=order.city;
   map.set(key,row);
  });
  return [...map.values()];
 },[orders]);
 const filtered=customers.filter(c=>[c.name,c.phone,c.city].some(v=>v.toLowerCase().includes(query.trim().toLowerCase())));
 const sorted=[...filtered].sort((a,b)=>sort==='orders'?b.orders.length-a.orders.length:sort==='spent'?b.spent-a.spent:b.lastDate-a.lastDate);
 const totalSpent=customers.reduce((n,c)=>n+c.spent,0);
 const repeat=customers.filter(c=>c.orders.length>1).length;
 const labels=ar?{eyebrow:'العملاء',title:'قاعدة بيانات العملاء',desc:'ملخص العملاء المستخرج من الطلبات المسجلة. لا يتم إنشاء ملفات عملاء وهمية.',search:'ابحث بالاسم أو الهاتف أو المدينة',all:'كل العملاء',repeat:'عملاء متكررون',sales:'مبيعات محصلة',name:'العميل',phone:'الهاتف',city:'المدينة',orders:'الطلبات',spent:'المبلغ المحصل',last:'آخر طلب',sortRecent:'الأحدث نشاطاً',sortOrders:'عدد الطلبات',sortSpent:'الأعلى إنفاقاً',empty:'لا يوجد عملاء مطابقون'}:
 {eyebrow:'RELATION CLIENT',title:'Clients',desc:'Une vue consolidée des clients à partir des commandes enregistrées. Aucun profil fictif n’est créé.',search:'Rechercher par nom, téléphone ou ville',all:'Clients enregistrés',repeat:'Clients récurrents',sales:'Ventes encaissées',name:'Client',phone:'Téléphone',city:'Ville',orders:'Commandes',spent:'Total livré',last:'Dernière commande',sortRecent:'Activité récente',sortOrders:'Nombre de commandes',sortSpent:'Dépenses élevées',empty:'Aucun client correspondant'}:language==='en'?{eyebrow:'CUSTOMER RELATIONSHIPS',title:'Customers',desc:'A consolidated customer view based on recorded orders. No fictional profiles are created.',search:'Search by name, phone or city',all:'Registered customers',repeat:'Returning customers',sales:'Collected sales',name:'Customer',phone:'Phone',city:'City',orders:'Orders',spent:'Delivered total',last:'Last order',sortRecent:'Recent activity',sortOrders:'Order count',sortSpent:'Highest spend',empty:'No matching customers'};
 return <div dir={ar?'rtl':'ltr'} className="space-y-5 p-4 text-slate-800 sm:p-6 xl:p-7">
  <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[11px] font-bold tracking-[.16em] text-emerald-700">{labels.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{labels.title}</h2><p className="mt-2 text-sm text-slate-500">{labels.desc}</p></header>
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
   {[{label:labels.all,value:customers.length,icon:Users},{label:labels.repeat,value:repeat,icon:ShoppingBag},{label:labels.sales,value:money(totalSpent),icon:Wallet}].map(({label,value,icon:Icon})=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><Icon size={18} className="text-emerald-700"/></div><strong className="mt-3 block text-2xl font-bold text-slate-900">{value}</strong></div>)}
  </section>
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
   <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
    <label className="relative block min-w-0 flex-1"><Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={labels.search} className="h-10 w-full rounded-lg border border-slate-200 ps-9 pe-3 text-sm outline-none focus:border-emerald-700"/></label>
    <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"><option value="recent">{labels.sortRecent}</option><option value="orders">{labels.sortOrders}</option><option value="spent">{labels.sortSpent}</option></select>
   </div>
   <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-start text-sm"><thead className="bg-slate-50 text-[11px] font-bold text-slate-500"><tr><th className="px-4 py-3 text-start">{labels.name}</th><th className="px-4 py-3 text-start">{labels.phone}</th><th className="px-4 py-3 text-start">{labels.city}</th><th className="px-4 py-3 text-center">{labels.orders}</th><th className="px-4 py-3 text-end">{labels.spent}</th><th className="px-4 py-3 text-end">{labels.last}</th></tr></thead><tbody className="divide-y divide-slate-100">{sorted.map(c=><tr key={c.key} className="hover:bg-slate-50/70"><td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td><td className="px-4 py-3"><a href={'tel:'+c.phone} className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-800"><Phone size={13}/>{c.phone||'—'}</a></td><td className="px-4 py-3 text-slate-600"><span className="inline-flex items-center gap-1"><MapPin size={13}/>{c.city}</span></td><td className="px-4 py-3 text-center font-semibold">{c.orders.length}</td><td className="px-4 py-3 text-end font-semibold">{money(c.spent)}</td><td className="px-4 py-3 text-end text-xs text-slate-500">{c.lastDate?new Intl.DateTimeFormat(ar?'ar-MA':'fr-MA',{dateStyle:'medium',timeZone:'Africa/Casablanca'}).format(c.lastDate):'—'}</td></tr>)}</tbody></table></div>
   {sorted.length===0&&<p className="p-10 text-center text-sm text-slate-400">{labels.empty}</p>}
   <footer className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">{sorted.length} / {customers.length}</footer>
  </section>
 </div>;
}
