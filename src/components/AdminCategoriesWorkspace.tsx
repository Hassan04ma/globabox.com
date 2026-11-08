import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Check, ChevronLeft, ChevronRight, ImageOff, LayoutGrid, Package,
  Pencil, Plus, RefreshCw, Search, Upload, X
} from 'lucide-react';
import type { Category, Product } from '../types';

type ManagedCategory = Category & { isActive?: boolean };
type Editor = {
  id: string; fr: string; ar: string; en: string;
  descriptionFr: string; descriptionAr: string; descriptionEn: string;
  image: string; active: boolean;
};
const emptyEditor: Editor = {
  id: '', fr: '', ar: '', en: '', descriptionFr: '',
  descriptionAr: '', descriptionEn: '', image: '', active: true
};
const normalizeId = (s:string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64);

interface Props {
  categories: Category[];
  products: Product[];
  onCategoriesChange: (categories: Category[]) => void;
}

export default function AdminCategoriesWorkspace({categories,products,onCategoriesChange}:Props) {
  const [all,setAll]=useState<ManagedCategory[]>(categories);
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(8);
  const [editing,setEditing]=useState(false);
  const [newCategory,setNewCategory]=useState(false);
  const [form,setForm]=useState<Editor>(emptyEditor);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const r=await fetch('/api/admin/categories',{credentials:'same-origin',cache:'no-store'});
      if (!r.ok) throw new Error(r.status===401?'Session administrateur expirée':'Erreur de chargement HTTP '+r.status);
      const data=await r.json();
      if(!Array.isArray(data)) throw new Error('Liste de catégories invalide');
      setAll(data);
      onCategoriesChange(data.filter((c:ManagedCategory)=>c.isActive!==false));
    } catch(e) {setError(e instanceof Error?e.message:'Connexion impossible');}
    finally {setLoading(false);}
  };
  useEffect(()=>{void refresh();},[]);

  const visible=useMemo(()=>all.filter(c=>{
    const q=search.trim().toLowerCase();
    return !q || [c.id,c.name.fr,c.name.ar,c.name.en].some(v=>String(v||'').toLowerCase().includes(q));
  }),[all,search]);
  const maxPage=Math.max(1,Math.ceil(visible.length/pageSize));
  const safePage=Math.min(page,maxPage);
  const pageItems=visible.slice((safePage-1)*pageSize,safePage*pageSize);
  const publishedProducts=products.filter(p=>p.isActive!==false);
  const counts=new Map<string,number>();
  for(const p of publishedProducts) counts.set(p.category,(counts.get(p.category)||0)+1);
  const activeCount=all.filter(c=>c.isActive!==false).length;
  const withProducts=all.filter(c=>(counts.get(c.id)||0)>0).length;
  const withImages=all.filter(c=>!!c.image).length;

  const beginEdit=(category:ManagedCategory)=>{
    setNewCategory(false);setEditing(true);setError('');setMessage('');
    setForm({
      id:category.id,fr:category.name.fr,ar:category.name.ar,en:category.name.en,
      descriptionFr:category.description?.fr||'',descriptionAr:category.description?.ar||'',
      descriptionEn:category.description?.en||'',image:category.image,active:category.isActive!==false
    });
  };
  const beginAdd=()=>{setNewCategory(true);setEditing(true);setError('');setMessage('');setForm(emptyEditor);};
  const cancel=()=>{setEditing(false);setNewCategory(false);setError('');};
  const upload=async(file:File|undefined)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
      setError('Choisissez une image JPEG, PNG ou WebP.');return;
    }
    if(file.size>750000){setError('Image trop volumineuse (max 750 Ko).');return;}
    setUploading(true);setError('');
    try {
      const r=await fetch('/api/admin/media',{
        method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file
      });
      const data:any=await r.json();
      if(!r.ok||typeof data.url!=='string')throw new Error(data.error||'Téléversement impossible');
      // Store a stable same-origin URL; the GET endpoint is publicly readable.
      const u=new URL(data.url,location.origin);
      if(u.origin!==location.origin)throw new Error('URL de média inattendue');
      setForm(current=>({...current,image:u.pathname}));
    }catch(e){setError(e instanceof Error?e.message:'Erreur de téléversement');}
    finally{setUploading(false);}
  };
  const save=async(e:FormEvent)=>{
    e.preventDefault();setError('');setMessage('');
    const id=newCategory?form.id.trim():form.id;
    if(!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(id)){setError('Identifiant requis : 2 à 64 caractères (a-z, 0-9, tiret).');return;}
    if(!form.fr.trim()||!form.image.trim()){setError('Nom français et image requis.');return;}
    setSaving(true);
    try {
      const body={
        id,name:{fr:form.fr.trim(),ar:form.ar.trim()||form.fr.trim(),en:form.en.trim()||form.fr.trim()},
        image:form.image.trim(),isActive:form.active,
        description:{fr:form.descriptionFr.trim(),ar:form.descriptionAr.trim(),en:form.descriptionEn.trim()}
      };
      const r=await fetch(newCategory?'/api/admin/categories':'/api/admin/categories/'+encodeURIComponent(id),{
        method:newCategory?'POST':'PUT',credentials:'same-origin',
        headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
      });
      const data:any=await r.json();
      if(!r.ok)throw new Error(data.error||'Échec de sauvegarde HTTP '+r.status);
      const updated=all.some(c=>c.id===id)?all.map(c=>c.id===id?data.category:c):[...all,data.category];
      setAll(updated);
      onCategoriesChange(updated.filter(c=>c.isActive!==false));
      setEditing(false);setNewCategory(false);
      setMessage('Catégorie enregistrée dans la base D1 et disponible sur la boutique.');
    }catch(e){setError(e instanceof Error?e.message:'Erreur de sauvegarde');}
    finally{setSaving(false);}
  };
  const inputClass='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100';
  const card='rounded-2xl border border-slate-200 bg-white shadow-sm';
  const stats=[
    {title:'Total des catégories',value:all.length,icon:LayoutGrid},
    {title:'Catégories actives',value:activeCount,icon:Check},
    {title:'Avec produits publiés',value:withProducts,icon:Package},
    {title:'Images configurées',value:withImages,icon:ImageOff}
  ];
  return (
    <div className="min-h-full bg-[#f5f7fc] p-4 text-slate-900 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Catalogue / Administration</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#101d37]">Catégories</h2>
            <p className="mt-1 text-sm text-slate-500">Organisez vos catégories et leurs images. Les modifications sont sauvegardées dans Cloudflare D1.</p>
          </div>
          <button type="button" onClick={beginAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
            <Plus size={18}/> Ajouter une catégorie
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map(({title,value,icon:Icon})=>(
            <div key={title} className={card+' flex items-center gap-3 p-4 sm:p-5'}>
              <span className="rounded-xl bg-orange-50 p-2.5 text-orange-600"><Icon size={21}/></span>
              <div><p className="text-xs leading-5 text-slate-500">{title}</p><strong className="mt-0.5 block text-2xl text-[#101d37]">{value}</strong></div>
            </div>
          ))}
        </div>

        {message&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</p>}
        {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className={card+' min-w-0 overflow-hidden'}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                Afficher
                <select aria-label="Éléments par page" className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-800" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}>
                  <option value={8}>8</option><option value={16}>16</option><option value={32}>32</option>
                </select>
                éléments
              </div>
              <div className="flex items-center gap-2">
                <label className="relative">
                  <Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400"/>
                  <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Rechercher une catégorie…" aria-label="Rechercher une catégorie" className="w-48 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-orange-400 sm:w-64"/>
                </label>
                <button onClick={()=>void refresh()} disabled={loading} title="Actualiser les catégories" aria-label="Actualiser les catégories" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={18} className={loading?'animate-spin':''}/></button>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead><tr className="bg-[#f7f9fd] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Image</th><th className="px-3 py-3">Catégorie</th><th className="px-3 py-3 text-center">Produits</th><th className="px-3 py-3">Statut</th><th className="px-4 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {pageItems.map(cat=>(
                    <tr key={cat.id} className="border-t border-slate-100 hover:bg-orange-50/30">
                      <td className="px-5 py-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {cat.image?<img src={cat.image} loading="lazy" alt="" className="h-full w-full object-cover"/>:<ImageOff size={18} className="text-slate-400"/>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-[#162541]">{cat.name.fr}</p>
                        <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-500" dir="auto">{cat.name.ar||cat.description?.fr||cat.id}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-slate-700">{counts.get(cat.id)||0}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cat.isActive!==false?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive!==false?'bg-emerald-500':'bg-slate-400'}`}/>{cat.isActive!==false?'Active':'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={()=>beginEdit(cat)} aria-label={'Modifier '+cat.name.fr} title="Modifier"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600">
                          <Pencil size={15}/> Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length===0&&<tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Aucune catégorie trouvée.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
              <span>{visible.length===0?'0 résultat':`Affichage de ${(safePage-1)*pageSize+1} à ${Math.min(safePage*pageSize,visible.length)} sur ${visible.length} catégories`}</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Page précédente" disabled={safePage<=1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft size={17}/></button>
                <span className="rounded-lg bg-orange-600 px-3 py-2 font-bold text-white">{safePage} / {maxPage}</span>
                <button type="button" aria-label="Page suivante" disabled={safePage>=maxPage} onClick={()=>setPage(p=>p+1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight size={17}/></button>
              </div>
            </div>
          </section>

          <section className={card+' h-fit p-5'}>
            <div className="mb-4 flex items-start justify-between gap-2">
              <div><h3 className="text-lg font-bold text-[#101d37]">{editing?(newCategory?'Ajouter une catégorie':'Modifier la catégorie'):'Gestion des catégories'}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{editing?'Les modifications seront visibles sur le site après enregistrement.':'Choisissez Modifier ou Ajouter pour gérer les catégories.'}</p>
              </div>
              {editing&&<button type="button" aria-label="Annuler" onClick={cancel} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>}
            </div>
            {!editing ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                <LayoutGrid size={30} className="mx-auto text-orange-400"/>
                <p className="mt-3 text-sm font-semibold text-slate-700">Sélectionnez une catégorie</p>
                <p className="mt-1 text-xs text-slate-500">Vous pouvez modifier ses noms, son image et son statut.</p>
                <button type="button" onClick={beginAdd} className="mt-5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500">Ajouter une catégorie</button>
              </div>
            ):(
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label htmlFor="cat-id" className="mb-1.5 block text-xs font-semibold text-slate-700">Identifiant technique</label>
                  <input id="cat-id" className={inputClass} value={form.id} disabled={!newCategory} required
                    onChange={e=>setForm(c=>({...c,id:normalizeId(e.target.value)}))} placeholder="ex: accessoires-auto"/>
                </div>
                <div><label htmlFor="cat-fr" className="mb-1.5 block text-xs font-semibold text-slate-700">Nom français *</label>
                  <input id="cat-fr" className={inputClass} required maxLength={200} value={form.fr} onChange={e=>setForm(c=>({...c,fr:e.target.value,id:newCategory&&!c.id?normalizeId(e.target.value):c.id}))} placeholder="Ex: Maison & Déco"/></div>
                <div><label htmlFor="cat-ar" className="mb-1.5 block text-xs font-semibold text-slate-700">Nom arabe</label>
                  <input id="cat-ar" dir="rtl" className={inputClass} maxLength={200} value={form.ar} onChange={e=>setForm(c=>({...c,ar:e.target.value}))}/></div>
                <div><label htmlFor="cat-en" className="mb-1.5 block text-xs font-semibold text-slate-700">Nom anglais</label>
                  <input id="cat-en" className={inputClass} maxLength={200} value={form.en} onChange={e=>setForm(c=>({...c,en:e.target.value}))}/></div>
                <div><label htmlFor="cat-desc" className="mb-1.5 block text-xs font-semibold text-slate-700">Description (français)</label>
                  <textarea id="cat-desc" rows={3} className={inputClass+' resize-y'} maxLength={500} value={form.descriptionFr} onChange={e=>setForm(c=>({...c,descriptionFr:e.target.value}))}/></div>
                <div><label htmlFor="cat-desc-ar" className="mb-1.5 block text-xs font-semibold text-slate-700">Description (العربية)</label>
                  <textarea id="cat-desc-ar" dir="rtl" rows={2} className={inputClass+' resize-y'} maxLength={500} value={form.descriptionAr} onChange={e=>setForm(c=>({...c,descriptionAr:e.target.value}))}/></div>
                <div><label htmlFor="cat-desc-en" className="mb-1.5 block text-xs font-semibold text-slate-700">Description (English)</label>
                  <textarea id="cat-desc-en" rows={2} className={inputClass+' resize-y'} maxLength={500} value={form.descriptionEn} onChange={e=>setForm(c=>({...c,descriptionEn:e.target.value}))}/></div>
                <div>
                  <label htmlFor="cat-image" className="mb-1.5 block text-xs font-semibold text-slate-700">Image de la catégorie *</label>
                  {form.image&&<img src={form.image} alt="Aperçu de la catégorie" className="mb-2 h-28 w-full rounded-xl border border-slate-200 bg-slate-100 object-cover"/>}
                  <input id="cat-image" className={inputClass} value={form.image} onChange={e=>setForm(c=>({...c,image:e.target.value}))} placeholder="https://... ou /api/product-media/..."/>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-600">
                    <Upload size={17}/>{uploading?'Téléversement en cours…':'Importer une image (JPG, PNG, WebP · 750 Ko max)'}
                    <input type="file" disabled={uploading} className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={e=>void upload(e.target.files?.[0])}/>
                  </label>
                </div>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
                  Visible sur la boutique
                  <input type="checkbox" checked={form.active} onChange={e=>setForm(c=>({...c,active:e.target.checked}))} className="h-5 w-5 accent-orange-600"/>
                </label>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving||uploading} className="min-w-0 flex-1 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-50">
                    {saving?'Enregistrement…':'Enregistrer'}
                  </button>
                  <button type="button" onClick={cancel} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
