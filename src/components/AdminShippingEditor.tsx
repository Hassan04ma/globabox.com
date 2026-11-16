import { useState } from 'react';
import { CheckCircle2, Save, Truck } from 'lucide-react';
import type { Order } from '../types';

interface Props {order:Order; onSaved:(next:Order)=>void;}
export default function AdminShippingEditor({order,onSaved}:Props) {
 const [carrier,setCarrier]=useState(order.shipping?.carrier||'');
 const [trackingNumber,setTrackingNumber]=useState(order.shipping?.trackingNumber||'');
 const [internalNote,setInternalNote]=useState(order.shipping?.internalNote||'');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const save=async()=>{
  setError('');setMessage('');setBusy(true);
  try {
    const response=await fetch('/api/orders/'+encodeURIComponent(order.id),{
      method:'PUT',credentials:'same-origin',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({shipping:{carrier:carrier.trim(),trackingNumber:trackingNumber.trim(),internalNote:internalNote.trim()}})
    });
    const payload=await response.json() as {success?:boolean;order?:Order;error?:string};
    if(!response.ok||!payload.success||!payload.order)throw new Error(payload.error||'Échec de la mise à jour');
    onSaved(payload.order);
    setMessage('Informations de livraison enregistrées dans D1');
  }catch(e){setError(e instanceof Error?e.message:'Impossible de sauvegarder');}
  finally{setBusy(false);}
 };
 return <section className="rounded-xl border border-[#d9e7df] bg-white p-4 md:col-span-3">
   <h4 className="flex items-center gap-2 text-sm font-black text-[#193e38]"><Truck size={18} className="text-[#104d43]"/>Suivi de livraison manuel</h4>
   <p className="mt-1 text-[11px] leading-5 text-slate-500">Indiquez le transporteur et la référence réelle. Seuls ces deux champs seront visibles par le client après vérification de sa commande. Les notes restent privées.</p>
   <div className="mt-4 grid gap-3 md:grid-cols-3">
    <label className="text-xs font-bold text-[#385647]">Transporteur
      <input value={carrier} maxLength={100} onChange={e=>setCarrier(e.target.value)} placeholder="Ex. Livraison interne" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
    </label>
    <label className="text-xs font-bold text-[#385647]">Référence du colis
      <input value={trackingNumber} maxLength={100} onChange={e=>setTrackingNumber(e.target.value)} placeholder="Référence donnée par le transporteur" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
    </label>
    <label className="text-xs font-bold text-[#385647]">Note interne (privée)
      <input value={internalNote} maxLength={500} onChange={e=>setInternalNote(e.target.value)} placeholder="Ex. Confirmation téléphonique effectuée" className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
    </label>
   </div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
     <div>{message&&<p role="status" className="flex items-center gap-2 text-xs font-bold text-[#176d47]"><CheckCircle2 size={16}/>{message}</p>}
       {error&&<p role="alert" className="text-xs font-bold text-red-700">{error}</p>}</div>
     <button type="button" disabled={busy} onClick={()=>void save()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#104d43] px-5 text-xs font-extrabold text-white hover:bg-[#0b3931] disabled:opacity-60"><Save size={16}/>{busy?'Enregistrement…':'Enregistrer le suivi'}</button>
   </div>
 </section>;
}
