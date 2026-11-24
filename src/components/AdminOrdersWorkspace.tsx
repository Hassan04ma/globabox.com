import { ClipboardList, Search, RefreshCw, Package, ChevronRight, Phone, MapPin, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { Order } from '../types';
import { MOROCCAN_CITIES } from '../data';
import AdminShippingEditor from './AdminShippingEditor';

interface Props {
 language:'ar'|'fr'|'en';
 orders:Order[];
 filteredOrders:Order[];
 totalOrders:number;
 pendingOrders:number;
 processingOrders:number;
 confirmedOrders:number;
 shippedOrders:number;
 orderQuery:string; setOrderQuery:(value:string)=>void;
 orderStatusFilter:string; setOrderStatusFilter:(value:string)=>void;
 orderCityFilter:string; setOrderCityFilter:(value:string)=>void;
 selectedOrderIds:Set<string>;
 handleBulkConfirmOrders:()=>void; clearOrderSelection:()=>void;
 toggleSelectAllVisibleOrders:()=>void; toggleOrderSelection:(id:string)=>void;
 handleUpdateOrderStatus:(id:string,status:Order['status'])=>Promise<void>;
 handleCancelOrder:(id:string)=>Promise<void>;
 handleRefreshOrders:()=>void; exportOrdersToCSV:()=>void;
 isRefreshing:boolean; refreshSuccess:string|null; refreshError:string|null;
 databaseReady:boolean|undefined;
 formatMoroccoDate:(value?:string|null)=>string;
 setOrders:Dispatch<SetStateAction<Order[]>>;
}
export default function AdminOrdersWorkspace(p:Props){
 const {language,orders,filteredOrders,totalOrders,pendingOrders,processingOrders,confirmedOrders,shippedOrders,
 orderQuery,setOrderQuery,orderStatusFilter,setOrderStatusFilter,orderCityFilter,setOrderCityFilter,
 selectedOrderIds,handleBulkConfirmOrders,clearOrderSelection,
 toggleSelectAllVisibleOrders,toggleOrderSelection,handleUpdateOrderStatus,handleCancelOrder,
 handleRefreshOrders,exportOrdersToCSV,isRefreshing,refreshSuccess,refreshError,databaseReady,
 formatMoroccoDate,setOrders}=p;
 const statTotalOrders=totalOrders, statNewOrders=pendingOrders, statProcessingOrders=processingOrders, statConfirmedOnly=confirmedOrders, statShippedOrders=shippedOrders;
 const launchStatus={databaseReady};
 return (
<div dir={language==='ar'?'rtl':'ltr'} lang={language} className="space-y-5">
  <header className="flex flex-col justify-between gap-4 rounded-[16px] border border-[#e0e8e5] bg-white p-5 shadow-[0_2px_10px_rgba(16,43,32,.025)] sm:flex-row sm:items-center sm:p-6">
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#38866e]">GESTION DES VENTES</p>
      <h3 className="mt-1 flex items-center gap-2 text-xl font-black text-[#193e38]"><ClipboardList size={22} className="text-[#104d43]"/>Toutes les commandes</h3>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">Les commandes sont chargées depuis Cloudflare D1. Validez, préparez et marquez les livraisons manuellement.</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={handleRefreshOrders} disabled={isRefreshing}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-4 text-xs font-bold text-white transition hover:bg-[#0a3d33] disabled:opacity-50">
        <RefreshCw size={16} className={isRefreshing?'animate-spin':''}/>{isRefreshing?'Actualisation…':'Actualiser'}
      </button>
      <button type="button" onClick={exportOrdersToCSV} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#b8d6c1] bg-white px-4 text-xs font-bold text-[#104d43] hover:bg-[#eff7f1]">
        <ClipboardList size={16}/>Exporter CSV
      </button>
    </div>
  </header>
  {refreshSuccess&&<p role="status" className="rounded-xl border border-[#c1e2cd] bg-[#eef9f2] px-4 py-3 text-xs font-bold text-[#166943]">{refreshSuccess}</p>}
  {refreshError&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{refreshError}</p>}
  {launchStatus?.databaseReady!==true&&<p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">L’état de la connexion D1 est à vérifier avant de modifier une commande.</p>}
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {[
      ['Toutes',statTotalOrders,'all'],
      ['À confirmer',statNewOrders,'pending'],
      ['En préparation',statProcessingOrders+statConfirmedOnly,'processing'],
      ['Expédiées',statShippedOrders,'shipped']
    ].map(([label,value,status])=>
      <button type="button" key={String(status)} onClick={()=>setOrderStatusFilter(String(status))}
        className={'rounded-[14px] border px-4 py-4 text-start shadow-[0_2px_9px_rgba(15,43,31,.02)] transition '+(orderStatusFilter===status?'border-[#9ac7ad] bg-[#eaf5ef]':'border-[#e0e8e5] bg-white hover:border-[#c0d9c9]')}>
        <span className="block text-[11px] font-bold text-slate-500">{label}</span>
        <strong className="mt-1 block text-2xl font-black text-[#193e38]">{value}</strong>
      </button>
    )}
  </div>
  <div className="grid gap-3 rounded-[14px] border border-[#e0e8e5] bg-white p-4 shadow-[0_2px_9px_rgba(15,43,31,.02)] md:grid-cols-3">
    <label className="relative">
      <Search size={17} className="pointer-events-none absolute start-3 top-3.5 text-slate-400"/>
      <input type="search" value={orderQuery} onChange={e=>setOrderQuery(e.target.value)}
        placeholder="Référence, client ou téléphone…" aria-label="Rechercher une commande"
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] ps-10 pe-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
    </label>
    <select value={orderStatusFilter} onChange={e=>setOrderStatusFilter(e.target.value)} aria-label="Filtrer par statut"
      className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] px-3 text-sm font-semibold text-[#193e38] outline-none focus:border-[#104d43]">
      <option value="all">Tous les statuts</option>
      <option value="pending">En attente</option>
      <option value="confirmed">Confirmées</option>
      <option value="processing">En préparation</option>
      <option value="shipped">Expédiées</option>
      <option value="delivered">Livrées</option>
      <option value="cancelled">Annulées</option>
    </select>
    <select value={orderCityFilter} onChange={e=>setOrderCityFilter(e.target.value)} aria-label="Filtrer par ville"
      className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] px-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]">
      <option value="all">Toutes les villes</option>
      {MOROCCAN_CITIES.map(city=><option key={city} value={city}>{city}</option>)}
    </select>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600">
    <span><strong className="text-[#193e38]">{filteredOrders.length}</strong> commande(s) affichée(s) sur {statTotalOrders}</span>
    <span>Montant des commandes affichées : <strong className="text-[#104d43]">{filteredOrders.reduce((total,order)=>total+Number(order.total||0),0).toLocaleString('fr-MA')} DH</strong> <span className="text-slate-400">(non encaissé inclus)</span></span>
  </div>
  {selectedOrderIds.size > 0 && (
    <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-[#dce8df] bg-[#f3f8f4] px-4 py-3">
      <span className="me-2 text-xs font-extrabold text-[#193e38]">{selectedOrderIds.size} sélectionnée(s)</span>
      <button type="button" onClick={handleBulkConfirmOrders}
        className="min-h-10 rounded-xl bg-[#104d43] px-4 text-xs font-extrabold text-white hover:bg-[#0b3931]">
        Confirmer la sélection
      </button>
      <button type="button" onClick={clearOrderSelection}
        className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">
        Désélectionner
      </button>
    </div>
  )}
  {filteredOrders.length===0?(
    <section className="gb-empty-orders flex flex-col items-center justify-center rounded-[16px] border border-[#e0e8e5] bg-white px-5 py-9 text-center shadow-[0_2px_8px_rgba(14,48,37,.02)]">
      <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[18px] bg-[#edf4f0] text-[#4b8b70]"><ClipboardList size={27}/></span>
      <h4 className="mt-4 text-[16px] font-extrabold text-[#213a36]">{statTotalOrders===0?'Aucune commande pour le moment':'Aucune commande ne correspond aux filtres'}</h4>
      <p className="mt-2 max-w-lg text-[12px] leading-6 text-[#718684]">
        {statTotalOrders===0?'Lorsqu’un client passe une commande sur la boutique, elle apparaît ici après enregistrement dans Cloudflare D1.':'Modifiez les critères de recherche pour consulter davantage de commandes.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={()=>{setOrderQuery('');setOrderStatusFilter('all');setOrderCityFilter('all');}}
          className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-[#d4e5da] bg-[#f1f8f3] px-4 text-xs font-bold text-[#225240] hover:bg-[#e7f2e9]">Effacer les filtres</button>
        <button type="button" onClick={handleRefreshOrders} disabled={isRefreshing}
          className="inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-[#dce5e1] bg-white px-4 text-xs font-bold text-[#3e5850] hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={14} className={isRefreshing?'animate-spin':''}/>Actualiser</button>
      </div>
    </section>
  ):(
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[14px] border border-[#dfe8e4] bg-white shadow-[0_2px_9px_rgba(15,43,31,.025)]">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-[#f5f9f6] px-5 py-3">
          <input
            type="checkbox"
            checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.has(o.id))}
            ref={el => { if (el) el.indeterminate = filteredOrders.some(o => selectedOrderIds.has(o.id)) && !filteredOrders.every(o => selectedOrderIds.has(o.id)); }}
            onChange={toggleSelectAllVisibleOrders}
            aria-label="Sélectionner toutes les commandes visibles"
            className="h-4 w-4 accent-[#104d43]"
          />
          <span className="text-xs font-extrabold text-[#527263]">Sélectionner toutes les commandes affichées</span>
        </div>
        <div className="divide-y divide-[#e8eee9]">
      {filteredOrders.map(order=>(
        <article key={order.id} className={selectedOrderIds.has(order.id) ? 'gb-order-card overflow-hidden bg-[#f2f8f4]' : 'gb-order-card overflow-hidden bg-white'}>
          <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <input
                type="checkbox"
                checked={selectedOrderIds.has(order.id)}
                onChange={() => toggleOrderSelection(order.id)}
                aria-label={'Sélectionner la commande '+order.reference}
                className="mt-3 h-4 w-4 shrink-0 accent-[#104d43]"
              />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#104d43]"><Package size={20}/></span>
              <div className="min-w-0">
                <p className="font-mono text-sm font-black text-[#193e38]">{order.reference}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{order.fullName||'Client'} · {order.city}</p>
                <p className="mt-1 text-[11px] text-slate-500">{formatMoroccoDate(order.createdAt || order.date)} · {order.items.reduce((sum,item)=>sum+item.quantity,0)} article(s)</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-black text-[#104d43]">{Number(order.total||0).toFixed(2)} DH</span>
              <select value={order.status} onChange={e=>void handleUpdateOrderStatus(order.id,e.target.value as Order['status'])}
                aria-label={'État commande '+order.reference}
                className={'min-h-10 rounded-xl border px-3 text-xs font-extrabold outline-none '+(order.status==='delivered'?'border-[#b9e3c7] bg-[#eff9f2] text-[#16744a]':order.status==='cancelled'?'border-red-200 bg-red-50 text-red-700':'border-[#d7e4d9] bg-[#f6f9f7] text-[#193e38]')}>
                <option value="pending">En attente</option><option value="confirmed">Confirmée</option>
                <option value="processing">En préparation</option><option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option><option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
          <details className="group border-t border-slate-100">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-xs font-bold text-[#104d43] hover:bg-[#f7faf8] [&::-webkit-details-marker]:hidden">
              Afficher les détails et les informations de livraison
              <ChevronRight size={17} className="transition-transform group-open:rotate-90"/>
            </summary>
            <div className="grid gap-5 border-t border-slate-100 bg-[#fcfdfc] px-5 py-5 text-sm md:grid-cols-3">
              <div>
                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Client</h4>
                <p className="font-semibold text-[#193e38]">{order.fullName}</p>
                <a href={'tel:'+order.phoneNumber} dir="ltr" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#104d43] hover:underline"><Phone size={16}/>{order.phoneNumber}</a>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Livraison manuelle</h4>
                <p className="flex items-start gap-2 text-xs leading-6 text-[#526b5e]"><MapPin size={16} className="mt-1 shrink-0 text-[#104d43]"/>{order.city}, {order.deliveryAddress}</p>
                {order.notes&&<p className="mt-2 rounded-lg bg-[#edf6ef] p-3 text-xs leading-6 text-[#526b5e]">Notes : {order.notes}</p>}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Articles de la commande</h4>
                <div className="space-y-2">{order.items.map((item,i)=><div key={item.productId+'-'+i} className="flex justify-between gap-2 border-b border-slate-100 pb-2 text-xs text-[#193e38]">
                  <span className="min-w-0 flex-1">{item.productName} × {item.quantity}</span><span className="shrink-0 font-bold">{item.price} DH</span>
                </div>)}</div>
                <p className="mt-3 text-xs font-black text-[#104d43]">Total : {order.total} DH</p>
              </div>
              <AdminShippingEditor order={order} onSaved={saved=>setOrders(current=>current.map(item=>item.id===saved.id?saved:item))}/>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 md:col-span-3">
                <button type="button" onClick={()=>void handleCancelOrder(order.id)} disabled={order.status==='cancelled'} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 size={16}/>Annuler la commande</button>
                <button type="button" onClick={async()=>{if(!window.confirm('Masquer cette commande de l’Admin ? Elle restera conservée dans D1 et ne sera plus affichée après Actualiser.'))return; try{const response=await fetch('/api/orders/'+encodeURIComponent(order.id),{method:'DELETE',credentials:'same-origin'}); if(!response.ok)throw new Error('Archive failed'); setOrders(current=>current.filter(item=>item.id!==order.id));}catch{alert('La commande n’a pas pu être masquée. Actualisez puis réessayez.');}}} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"><Trash2 size={16}/>Masquer de l’Admin</button>
                <p className="self-center text-xs text-slate-500">Annuler = statut conservé. Masquer = retiré de la vue Admin uniquement, jamais supprimé de D1.</p>
              </div>
            </div>
          </details>
        </article>
      ))}
        </div>
      </div>
    </div>
  )}
</div>
 );
}
