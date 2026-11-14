import { AlertCircle, CheckCircle2, ClipboardCheck, ExternalLink, Package, RefreshCw, ShieldCheck, Truck, XCircle } from 'lucide-react';
import type { Order, Product } from '../types';

interface Props {
  products:Product[];
  orders:Order[];
  launchStatus:{databaseReady:boolean;adminConfigured:boolean;checkoutEnabled:boolean;checkoutVerified:boolean}|null;
  onOrders:()=>void;onProducts:()=>void;onReload:()=>void;
}
export default function AdminOperationsWorkspace({products,orders,launchStatus,onOrders,onProducts,onReload}:Props){
 const active=products.filter(p=>p.isActive===true);
 const drafts=products.filter(p=>p.isActive!==true);
 const sourced=products.filter(p=>p.id.startsWith('gb_source_'));
 const pending=orders.filter(o=>['pending','confirmed','processing'].includes(o.status));
 const noPhoto=products.filter(p=>!p.image);
 const noStock=products.filter(p=>!p.inStock||p.stockStatus==='out_of_stock');
 const unverified=sourced.filter(p=>p.needsSupplierVerification || !p.imageRightsConfirmed || !p.readyToPublish);
 const checks=[
  {name:'Base de données D1',done:launchStatus?.databaseReady===true,help:'La connexion doit fonctionner sur le Worker déployé.'},
  {name:'Authentification Admin',done:launchStatus?.adminConfigured===true,help:'La configuration existe ; la connexion réelle doit être testée.'},
  {name:'Produits publiés et disponibles',done:active.some(p=>p.inStock&&p.stockStatus!=='out_of_stock'),help:'Publiez seulement les produits avec prix, stock et médias vérifiés.'},
  {name:'Commande client de test',done:false,help:'Un diagnostic technique ne remplace pas une commande COD depuis le navigateur.'},
  {name:'Sauvegarde de production restaurable',done:false,help:'Un opérateur doit confirmer l’export et tester la restauration de globabox-db.'}
 ];
 return <div className="space-y-5">
   <section className="rounded-2xl border border-[#e0e7e3] bg-white p-5 shadow-sm sm:p-7">
    <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#327960]">GLOBABOX · OPÉRATIONS</p>
    <h2 className="mt-2 text-2xl font-black text-[#1c3832]">Centre de préparation de la boutique</h2>
    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">Suivez les actions nécessaires avant de commencer à vendre. Les chiffres viennent du catalogue et des commandes affichés par l’administration. Les étapes non vérifiées restent signalées.</p>
    <div className="mt-5 flex flex-wrap gap-2">
     <button type="button" onClick={onReload} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#104d43] hover:bg-[#f2f8f4]"><RefreshCw size={15}/>Actualiser les commandes</button>
     <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#104d43] px-4 text-xs font-bold text-white hover:bg-[#0b3931]"><ExternalLink size={15}/>Voir la boutique</a>
    </div>
   </section>
   <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {[
      {label:'Produits publiés',count:active.length,icon:Package},
      {label:'Brouillons',count:drafts.length,icon:ClipboardCheck},
      {label:'Sans image principale',count:noPhoto.length,icon:AlertCircle},
      {label:'Commandes à traiter',count:pending.length,icon:Truck}
    ].map(({label,count,icon:Icon})=><div key={label} className="rounded-xl border border-[#e0e7e3] bg-white p-4 shadow-sm">
      <Icon size={20} className="text-[#347960]"/><p className="mt-4 text-xs font-semibold text-slate-500">{label}</p><strong className="mt-1 block text-3xl font-black text-[#1c3832]">{count}</strong>
    </div>)}
   </div>
   <div className="grid gap-5 xl:grid-cols-2">
    <section className="rounded-2xl border border-[#e0e7e3] bg-white p-5 shadow-sm">
     <h3 className="flex items-center gap-2 text-base font-black text-[#193e38]"><ShieldCheck size={20} className="text-[#104d43]"/>Contrôles avant lancement</h3>
     <div className="mt-4 divide-y divide-slate-100">
      {checks.map(check=><div key={check.name} className="flex items-start gap-3 py-3">
       {check.done?<CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#168051]"/>:<XCircle size={19} className="mt-0.5 shrink-0 text-amber-600"/>}
       <div><p className="text-sm font-extrabold text-[#193e38]">{check.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{check.help}</p></div>
      </div>)}
     </div>
     <p className="mt-3 rounded-xl bg-[#fff7e9] px-4 py-3 text-xs leading-6 text-amber-800">La mise en ligne de la nouvelle version de production reste bloquée tant que les tests et la sauvegarde ne sont pas confirmés.</p>
    </section>
    <section className="rounded-2xl border border-[#e0e7e3] bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-black text-[#193e38]"><Package size={20} className="text-[#104d43]"/>Qualité du catalogue</h3>
      <div className="mt-4 space-y-3 text-sm">
       <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-600">Références source en brouillon</span><strong>{sourced.filter(p=>p.isActive!==true).length}</strong></div>
       <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-600">Sources / photos à confirmer</span><strong>{unverified.length}</strong></div>
       <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-600">Produits sans stock</span><strong>{noStock.length}</strong></div>
       <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-600">Total des produits</span><strong>{products.length}</strong></div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
       <button type="button" onClick={onProducts} className="min-h-11 rounded-xl bg-[#104d43] px-4 text-xs font-bold text-white hover:bg-[#0b3931]">Gérer les produits</button>
       <button type="button" onClick={onOrders} className="min-h-11 rounded-xl border border-[#bfd5c6] px-4 text-xs font-bold text-[#104d43] hover:bg-[#f2f8f4]">Gérer les commandes</button>
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-500">Les étapes de sécurité et de sauvegarde nécessitent une vérification réelle dans Cloudflare. Cette page ne prétend pas les avoir réalisées automatiquement.</p>
    </section>
   </div>
 </div>;
}
