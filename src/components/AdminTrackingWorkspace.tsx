import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Info, RefreshCw, Save, ShieldCheck, XCircle } from 'lucide-react';
import { DEFAULT_TRACKING_CONFIG, TRACKING_FIELDS, validateTrackingConfig, type TrackingConfig } from '../trackingConfig';

type Status='idle'|'loading'|'saving'|'error'|'saved';
export default function AdminTrackingWorkspace(){
 const [form,setForm]=useState<TrackingConfig>({...DEFAULT_TRACKING_CONFIG});
 const [status,setStatus]=useState<Status>('idle');
 const [error,setError]=useState('');
 const [loaded,setLoaded]=useState(false);
 const load=async()=>{
  setStatus('loading');setError('');
  try{
    const res=await fetch('/api/admin/tracking-config',{credentials:'same-origin',cache:'no-store'});
    if(!res.ok)throw new Error(res.status===401?'Session administrateur expirée':'Chargement impossible (HTTP '+res.status+')');
    const data=await res.json() as {config?:unknown;success?:boolean;error?:string};
    const parsed=validateTrackingConfig(data?.config);
    if(!parsed)throw new Error('Données de tracking invalides sur le serveur');
    setForm(parsed);setLoaded(true);setStatus('idle');
  }catch(err){setError(err instanceof Error?err.message:'Connexion impossible');setStatus('error');}
 };
 useEffect(()=>{void load();},[]);
 const save=async()=>{
  const validated=validateTrackingConfig(form);
  if(!validated){setError('Corrigez les identifiants invalides. Les URL et les clés secrètes ne sont pas acceptées.');setStatus('error');return;}
  setStatus('saving');setError('');
  try {
    const res=await fetch('/api/admin/tracking-config',{
     method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},
     body:JSON.stringify(validated)
    });
    const data=await res.json() as {config?:unknown;success?:boolean;error?:string};
    if(!res.ok||!data.success)throw new Error(data.error||'Sauvegarde D1 non confirmée (HTTP '+res.status+')');
    setForm(validateTrackingConfig(data.config)||validated);setStatus('saved');
  }catch(err){setError(err instanceof Error?err.message:'Erreur lors de la sauvegarde');setStatus('error');}
 };
 const count=TRACKING_FIELDS.filter(field=>field.key!=='googleAdsConversionLabel'&&form[field.key]).length;
 const fieldClass='min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-[#193e38] placeholder:text-slate-400 focus:border-[#104d43] focus:outline-none focus:ring-2 focus:ring-[#104d43]/10';
 return <div className="space-y-6">
    <header className="rounded-[22px] border border-[#dce9e0] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
       <div><p className="text-[11px] font-black uppercase tracking-[.14em] text-[#30836e]">GLOBABOX · MARKETING</p>
        <h2 className="mt-2 flex items-center gap-3 text-2xl font-black text-[#193e38]"><BarChart3 size={25} className="text-[#104d43]"/>Pixels & statistiques</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Centralisez les identifiants publics de mesure publicitaire. Enregistrés dans Cloudflare D1, ils sont accessibles sur l'ensemble du site, pas seulement votre navigateur.</p>
       </div>
       <span className="rounded-xl bg-[#edf6f0] px-4 py-3 text-xs font-extrabold text-[#104d43]">{count} identification(s)</span>
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d3e6da] bg-[#f3f8f4] p-4 text-xs leading-6 text-[#335e4a]">
       <ShieldCheck size={21} className="mt-0.5 shrink-0"/>
       <span>Les pixels ne sont chargés qu'après consentement du visiteur. Mettre un identifiant ici ne confirme pas que le compte publicitaire reçoit des événements : vérifiez chaque plateforme avec son outil de diagnostic. Utilisez des identifiants publics uniquement, jamais des jetons API ou secrets.</span>
      </div>
    </header>
    {error&&<p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700"><XCircle size={18}/>{error}</p>}
    {status==='saved'&&<p role="status" className="flex items-center gap-2 rounded-xl border border-[#b7dec4] bg-[#edf9f1] p-4 text-xs font-bold text-[#156844]"><CheckCircle2 size={18}/>Paramètres enregistrés et confirmés dans D1. Tester les événements dans chaque plateforme.</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      {TRACKING_FIELDS.map(field=><section key={field.key} className="rounded-[18px] border border-[#dce9e0] bg-white p-5 shadow-sm">
       <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={'tracking-'+field.key} className="text-sm font-extrabold text-[#193e38]">{field.name}</label>
        <span className={'rounded-full px-2.5 py-1 text-[10px] font-bold '+(form[field.key]?'bg-[#e4f6e9] text-[#197047]':'bg-slate-100 text-slate-600')}>{form[field.key]?'ID saisi':'Non configuré'}</span>
       </div>
       <input id={'tracking-'+field.key} type="text" spellCheck={false} autoComplete="off"
        disabled={!loaded||status==='saving'} value={form[field.key]}
        onChange={e=>{setForm(current=>({...current,[field.key]:e.target.value}));if(status==='saved')setStatus('idle');}}
        className={fieldClass} placeholder={field.example}/>
       <p className="mt-3 text-xs leading-6 text-slate-500">{field.description}</p>
      </section>)}
    </div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
     <strong className="flex items-center gap-2"><Info size={17}/>À savoir</strong>
     <p className="mt-2">Google Tag Manager peut aussi charger des pixels : si vous l'utilisez, configurez les événements et le consentement dans le conteneur, sans dupliquer les tags. Google Search Console : la vérification DNS est recommandée (le code indiqué ici ne vérifie pas automatiquement votre propriété). Les API Conversions serveur nécessitent une configuration distincte et sécurisée.</p>
    </div>
    <footer className="flex flex-wrap justify-between gap-3 rounded-[18px] border border-[#dce9e0] bg-white p-4 sm:p-5">
      <button type="button" disabled={status==='saving'} onClick={()=>void load()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#104d43] hover:bg-[#eff7f0] disabled:opacity-50"><RefreshCw size={18} className={status==='loading'?'animate-spin':''}/>Recharger D1</button>
      <button type="button" disabled={!loaded||status==='saving'||status==='loading'} onClick={()=>void save()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-6 text-sm font-extrabold text-white hover:bg-[#0b3931] disabled:opacity-50"><Save size={18}/>{status==='saving'?'Enregistrement…':'Enregistrer dans Cloudflare D1'}</button>
    </footer>
  </div>;
}
