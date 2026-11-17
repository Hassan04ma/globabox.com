import { Package, ChevronRight, Plus, CheckCircle2, Search, Trash2, X } from 'lucide-react';
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';
import type { Product, Category } from '../types';
import { STORE_DEPARTMENTS } from '../storefrontDepartments';
import { getStoreSubcategories } from '../storefrontSubcategories';

interface Props {
 language:'ar'|'fr'|'en';
 adminProducts:Product[]; categories:Category[]; filteredProductsList:Product[];
 selectedProductIds:Set<string>; productQuery:string; setProductQuery:(v:string)=>void;
 productStatusFilter:'all'|'published'|'draft'|'outofstock'; setProductStatusFilter:(v:'all'|'published'|'draft'|'outofstock')=>void;
 editingProduct:Product|null; isAddingProduct:boolean; productForm:any; setProductForm:Dispatch<SetStateAction<any>>;
 setEditingProduct:(p:Product|null)=>void; setIsAddingProduct:(v:boolean)=>void;
 mediaUploading:boolean; tagsInput:string; setTagsInput:(v:string)=>void;
 handleSaveProduct:(e:FormEvent)=>void; handleStartAddProduct:()=>void;
 handleStartEditProduct:(p:Product)=>void; handleDeleteProduct:(id:string)=>void;
 handleBulkPublishProducts:()=>void; handleBulkDeleteProducts:()=>void; clearProductSelection:()=>void;
 toggleSelectAllVisibleProducts:()=>void; toggleProductSelection:(id:string)=>void;
 exportProductsToJSON:()=>void; exportProductsToCSV:()=>void;
 importProductsFromJSON:(e:ChangeEvent<HTMLInputElement>)=>void;
 importProductsFromCSV:(e:ChangeEvent<HTMLInputElement>)=>void;
 uploadProductPhotos:(files:FileList|null)=>Promise<void>;
}
export default function AdminProductsWorkspace(p:Props){
 const {language,adminProducts,categories,filteredProductsList,selectedProductIds,productQuery,setProductQuery,
 productStatusFilter,setProductStatusFilter,editingProduct,isAddingProduct,productForm,setProductForm,
 setEditingProduct,setIsAddingProduct,mediaUploading,tagsInput,setTagsInput,handleSaveProduct,
 handleStartAddProduct,handleStartEditProduct,handleDeleteProduct,handleBulkPublishProducts,
 handleBulkDeleteProducts,clearProductSelection,toggleSelectAllVisibleProducts,toggleProductSelection,
 exportProductsToJSON,exportProductsToCSV,importProductsFromJSON,importProductsFromCSV,uploadProductPhotos}=p;
 return (
<div dir={language==='ar'?'rtl':'ltr'} lang={language} className="space-y-6">

  {/* Operational backup tools stay available without crowding the product form. */}
  <details className="group overflow-hidden rounded-xl border border-[#dce6df] bg-white shadow-[0_2px_8px_rgba(20,55,39,.02)]">
    <summary className="flex min-h-[45px] cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-xs font-bold text-[#31584a] hover:bg-[#f5faf6] sm:px-5">
      <span className="inline-flex items-center gap-2"><Package size={16} className="text-[#618c75]"/>Outils du catalogue <span className="hidden font-normal text-slate-500 sm:inline">· Importer, exporter et sauvegarder</span></span>
      <ChevronRight size={16} className="text-slate-500 transition-transform group-open:rotate-90"/>
    </summary>
    <div className="flex flex-wrap items-center gap-2 border-t border-[#e7eee9] px-4 py-3 sm:px-5">
      
                      <button type="button" onClick={exportProductsToJSON} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#31584a] hover:bg-[#f2f8f4]">Exporter JSON</button>
      <button type="button" onClick={exportProductsToCSV} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-[#31584a] hover:bg-[#f2f8f4]">Exporter CSV</button>
      <label className="cursor-pointer rounded-lg border border-[#b9d7c2] bg-[#edf7f0] px-3 py-2.5 text-xs font-bold text-[#195c41] hover:bg-[#e0f1e5]">
        Importer JSON<input type="file" accept=".json,application/json" onChange={importProductsFromJSON} className="sr-only"/>
      </label>
      <label className="cursor-pointer rounded-lg border border-[#b9d7c2] bg-[#edf7f0] px-3 py-2.5 text-xs font-bold text-[#195c41] hover:bg-[#e0f1e5]">
        Importer CSV<input type="file" accept=".csv,text/csv" onChange={importProductsFromCSV} className="sr-only"/>
      </label>
      <p className="basis-full text-[11px] leading-5 text-[#738a7a]">Les modifications sont sauvegardées dans Cloudflare D1. Les nouveaux produits restent en brouillon jusqu'à publication.</p>
    </div>
  </details>

  {/* Shopify-style product editor: essential fields first, advanced options collapsible. */}
  {(isAddingProduct || editingProduct) && (
    <section id="gb-product-editor" className="rounded-[18px] border border-[#dce6df] bg-[#f4f7f5] shadow-[0_2px_12px_rgba(18,55,34,.04)]">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-t-[18px] border-b border-[#dce9df] bg-white px-5 py-4 sm:px-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#32856e]">GLOBABOX / PRODUITS</p>
          <h3 className="mt-1 text-lg font-black text-[#193e38]">{editingProduct?'Modifier le produit':'Ajouter un produit'}</h3>
          <p className="mt-1 text-xs text-slate-500">{editingProduct?'Modifiez les informations et enregistrez vos changements.':'Votre nouveau produit sera d’abord enregistré en brouillon.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={'rounded-full px-3 py-1.5 text-xs font-extrabold '+(editingProduct&&productForm.isActive?'bg-[#e6f6eb] text-[#166b45]':'bg-amber-50 text-amber-700')}>{editingProduct&&productForm.isActive?'Publié':'Brouillon'}</span>
          <button type="button" onClick={()=>{setEditingProduct(null);setIsAddingProduct(false);}} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Fermer</button>
        </div>
      </header>
      <form onSubmit={handleSaveProduct} className="grid items-start gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Informations du produit</h4>
            <label htmlFor="gb-product-title" className="mb-1.5 block text-xs font-extrabold text-[#385647]">Nom du produit *</label>
            <input id="gb-product-title" required maxLength={220} value={productForm.nameFr}
              onChange={e=>setProductForm({...productForm,nameFr:e.target.value})}
              placeholder="Ex. Organisateur de cuisine multifonction" className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#193e38] outline-none focus:border-[#104d43]"/>
          </section>
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h4 className="text-base font-black text-[#193e38]">Photos et galerie</h4>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · 750 Ko par image · 8 images par sélection.</p></div>
            </div>
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#bad7c5] bg-[#f6fbf7] p-4 text-center text-xs font-bold text-[#104d43] hover:bg-[#edf7f0]">
              <Plus size={24}/>{mediaUploading?'Téléversement des images…':'Ajouter des images depuis votre ordinateur'}
              <input type="file" multiple accept="image/webp,image/jpeg,image/png" className="sr-only"
                disabled={mediaUploading} onChange={e=>{void uploadProductPhotos(e.target.files);e.target.value='';}}/>
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              {productForm.image&&<div className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[#93c2a6] bg-white">
                <img src={productForm.image} alt="Image principale" className="h-full w-full object-contain"/>
                <span className="absolute bottom-0 inset-x-0 bg-[#104d43] py-1 text-center text-[10px] font-bold text-white">Principale</span>
              </div>}
              {productForm.additionalImages.map((image,i)=><div key={image+'-'+i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img src={image} alt={'Galerie '+(i+1)} className="h-full w-full object-contain"/>
                <button type="button" onClick={()=>setProductForm({...productForm,image,additionalImages:[productForm.image,...productForm.additionalImages.filter((_,j)=>j!==i)].filter(Boolean)})}
                  className="absolute bottom-0 start-0 bg-[#104d43] px-2 py-1 text-[10px] text-white" title="Définir comme principale">1ère</button>
                <button type="button" onClick={()=>setProductForm({...productForm,additionalImages:productForm.additionalImages.filter((_,j)=>j!==i)})}
                  className="absolute end-1 top-1 rounded-full bg-white p-1 text-red-700 shadow" aria-label="Retirer image"><X size={13}/></button>
              </div>)}
            </div>
            <details className="mt-4 rounded-xl bg-[#f5f8f6] p-3">
              <summary className="cursor-pointer text-xs font-bold text-[#104d43]">Ajouter une image par lien URL</summary>
              <label className="mt-3 block text-xs text-slate-500">Image principale</label>
              <input value={productForm.image} onChange={e=>setProductForm({...productForm,image:e.target.value})}
                placeholder="https://..." className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-[#193e38]"/>
              <label className="mt-3 block text-xs text-slate-500">Autres photos (une URL par ligne)</label>
              <textarea rows={3} value={productForm.additionalImages.join('\n')}
                onChange={e=>setProductForm({...productForm,additionalImages:e.target.value.split(/\n/).map(v=>v.trim()).filter(Boolean)})}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#193e38]"/>
            </details>
          </section>
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Description détaillée</h4>
            <label htmlFor="gb-product-description" className="mb-1.5 block text-xs font-extrabold text-[#385647]">Description du produit</label>
            <textarea id="gb-product-description" rows={5} maxLength={6000} value={productForm.descFr}
              onChange={e=>setProductForm({...productForm,descFr:e.target.value})}
              placeholder="Expliquez les avantages, les caractéristiques, les dimensions, le contenu du colis et l'utilisation réelle du produit."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#193e38] outline-none focus:border-[#104d43]"/>
            <p className="mt-2 text-[11px] text-slate-500">Décrivez uniquement les caractéristiques vérifiées. Pas de promesses non confirmées.</p>
          </section>
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Prix et disponibilité</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#385647]">Prix de vente (DH) *
                <input type="number" min="0.01" step="0.01" required value={productForm.price||''}
                  onChange={e=>setProductForm({...productForm,price:Number(e.target.value)})}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-[#193e38] outline-none focus:border-[#104d43]"/>
              </label>
              <label className="text-xs font-bold text-[#385647]">Prix barré (facultatif)
                <input type="number" min="0" step="0.01" value={productForm.originalPrice||''}
                  onChange={e=>setProductForm({...productForm,originalPrice:Number(e.target.value)})}
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">La livraison est calculée au passage de commande (35 DH en dessous de 500 DH).</p>
          </section>
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Tags et mots-clés</h4>
            <label htmlFor="gb-product-tags" className="mb-2 block text-xs font-bold text-[#385647]">Étiquettes produit</label>
            <input id="gb-product-tags" type="text" value={tagsInput}
              onChange={e=>setTagsInput(e.target.value)}
              placeholder="Ex. rangement, cuisine, maison, organisation"
              className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
            <p className="mt-2 text-xs text-slate-500">Séparez les mots-clés par une virgule. Ils servent à la recherche interne et à l'organisation du catalogue.</p>
            {tagsInput.split(',').some(tag=>tag.trim())&&<div className="mt-3 flex flex-wrap gap-2">{tagsInput.split(',').map(tag=>tag.trim()).filter(Boolean).map((tag,i)=><span key={tag+i} className="rounded-full bg-[#e9f5ee] px-3 py-1 text-[11px] font-bold text-[#104d43]">{tag}</span>)}</div>}
          </section>
          <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <summary className="cursor-pointer text-base font-black text-[#193e38]">Référencement Google (SEO) · facultatif</summary>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-[#385647]">Titre SEO
                <input maxLength={100} value={productForm.seoTitle} onChange={e=>setProductForm({...productForm,seoTitle:e.target.value})}
                  placeholder={productForm.nameFr||'Titre affiché dans Google'} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38]"/>
              </label>
              <label className="block text-xs font-bold text-[#385647]">Meta description
                <textarea rows={3} maxLength={320} value={productForm.seoDescription} onChange={e=>setProductForm({...productForm,seoDescription:e.target.value})}
                  placeholder="Résumé court et précis de votre produit." className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-[#193e38]"/>
              </label>
              <div className="rounded-xl border border-slate-200 bg-[#f8faf8] p-4">
                <p className="truncate text-[15px] font-bold text-[#225fba]">{productForm.seoTitle||productForm.nameFr||'Nom du produit'}</p>
                <p className="mt-1 text-xs text-[#2e8056]">globabox.com/?product={encodeURIComponent(productForm.id||'produit')}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{productForm.seoDescription||productForm.descFr||'Aperçu du produit dans les moteurs de recherche.'}</p>
              </div>
              <p className="text-xs leading-6 text-slate-500">L’aperçu SEO est indicatif. L’indexation réelle dépend du rendu et de la configuration technique du site.</p>
            </div>
          </details>
          <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
            <summary className="cursor-pointer text-base font-black text-[#193e38]">Traductions & caractéristiques · facultatif</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#385647]">Nom en arabe
                <input dir="rtl" value={productForm.nameAr} onChange={e=>setProductForm({...productForm,nameAr:e.target.value})}
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
              </label>
              <label className="text-xs font-bold text-[#385647]">Nom en anglais
                <input value={productForm.nameEn} onChange={e=>setProductForm({...productForm,nameEn:e.target.value})}
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
              </label>
              <label className="text-xs font-bold text-[#385647]">Description en arabe
                <textarea dir="rtl" rows={4} value={productForm.descAr} onChange={e=>setProductForm({...productForm,descAr:e.target.value})}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
              </label>
              <label className="text-xs font-bold text-[#385647]">Description en anglais
                <textarea rows={4} value={productForm.descEn} onChange={e=>setProductForm({...productForm,descEn:e.target.value})}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
              </label>
              {(['fr','ar','en'] as const).map(lang=>{
                const prop=lang==='fr'?'featuresFr':lang==='ar'?'featuresAr':'featuresEn';
                return <label key={lang} className="text-xs font-bold text-[#385647]">Caractéristiques {lang.toUpperCase()} (une par ligne)
                  <textarea rows={4} dir={lang==='ar'?'rtl':'ltr'} value={productForm[prop].join('\n')}
                    onChange={e=>setProductForm({...productForm,[prop]:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)})}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
                </label>;
              })}
            </div>
          </details>
        </div>
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-5 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-[#dfe9e2] bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <h4 className="text-sm font-black text-[#193e38]">Aperçu du produit</h4>
              <span className="text-[10px] font-bold text-[#6c8476]">Temps réel</span>
            </header>
            <div className="p-4">
              <div className="flex min-h-[155px] items-center justify-center overflow-hidden rounded-xl border border-[#e4ede7] bg-[#f4f7f5]">
                {productForm.image?<img src={productForm.image} alt="Aperçu de la photo principale" className="h-[170px] w-full object-contain p-2"/>:
                  <div className="flex flex-col items-center gap-2 text-[#86a092]"><Package size={36} strokeWidth={1.5}/><span className="text-xs">Votre photo principale</span></div>}
              </div>
              <p className="mt-3 line-clamp-2 min-h-[22px] text-sm font-extrabold leading-6 text-[#193e38]">{productForm.nameFr.trim()||'Nom du produit'}</p>
              <p className="mt-1 text-lg font-black text-[#104d43]">{productForm.price>0?productForm.price.toLocaleString('fr-MA',{minimumFractionDigits:2,maximumFractionDigits:2})+' DH':'— DH'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#edf6f0] px-2.5 py-1 text-[10px] font-bold text-[#315f4c]">{categories.find(c=>c.id===productForm.category)?.name.fr||STORE_DEPARTMENTS.find(c=>c.id===productForm.category)?.name.fr||'Sans catégorie'}</span>
                <span className={'rounded-full px-2.5 py-1 text-[10px] font-bold '+(editingProduct&&productForm.isActive?'bg-[#e4f7eb] text-[#17734b]':'bg-amber-50 text-amber-800')}>{editingProduct&&productForm.isActive?'Publié':'Brouillon'}</span>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">Aperçu indicatif. Enregistrez puis vérifiez le produit sur la boutique.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Statut de vente</h4>
            {editingProduct?<label className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f9f6] p-3 text-xs font-bold text-[#193e38]">
              {productForm.isActive?'Publié sur le site':'Brouillon · Non visible'}
              <input type="checkbox" checked={productForm.isActive} onChange={e=>setProductForm({...productForm,isActive:e.target.checked})} className="h-5 w-5 accent-[#104d43]"/>
            </label>:<p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">Le nouveau produit sera enregistré en brouillon. Vous pourrez le publier après validation des photos, du prix et du stock.</p>}
            {editingProduct?.id.startsWith('gb_source_') && <div className="mt-4 rounded-xl border border-[#e7d5a9] bg-[#fffaf0] p-4">
              <h5 className="text-xs font-black text-[#674d1d]">Contrôle de publication · Produit sourcé</h5>
              <p className="mt-1 text-[11px] leading-5 text-[#745f39]">Les six photos doivent montrer exactement l'article vendu et être autorisées. Vérifiez fournisseur, stock et prix avant publication.</p>
              <label className="mt-3 block text-[11px] font-bold text-[#6f5d3b]">Fournisseur validé
                <input value={productForm.supplier} onChange={e=>setProductForm({...productForm,supplier:e.target.value})} placeholder="Nom réel du fournisseur"
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#dbcba6] bg-white px-3 text-xs text-[#193e38]"/>
              </label>
              <label className="mt-3 block text-[11px] font-bold text-[#6f5d3b]">Lien de référence
                <input value={productForm.sourceUrl} onChange={e=>setProductForm({...productForm,sourceUrl:e.target.value})}
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#dbcba6] bg-white px-3 text-xs text-[#193e38]"/>
              </label>
              <label className="mt-3 flex items-start gap-2 text-[11px] font-bold leading-5 text-[#674d1d]">
                <input type="checkbox" checked={!productForm.needsSupplierVerification} onChange={e=>setProductForm({...productForm,needsSupplierVerification:!e.target.checked})} className="mt-1 accent-[#104d43]"/>
                J'ai vérifié le fournisseur, le modèle, le stock et le prix.
              </label>
              <label className="mt-2 flex items-start gap-2 text-[11px] font-bold leading-5 text-[#674d1d]">
                <input type="checkbox" checked={productForm.imageRightsConfirmed} onChange={e=>setProductForm({...productForm,imageRightsConfirmed:e.target.checked})} className="mt-1 accent-[#104d43]"/>
                Je possède ou j'ai le droit d'utiliser les 6 photos de ce modèle précis.
              </label>
              <label className="mt-2 flex items-start gap-2 text-[11px] font-bold leading-5 text-[#674d1d]">
                <input type="checkbox" checked={productForm.readyToPublish} onChange={e=>setProductForm({...productForm,readyToPublish:e.target.checked})} className="mt-1 accent-[#104d43]"/>
                La description et la disponibilité sont vérifiées ; la fiche est prête.
              </label>
            </div>}
            <label className="mt-4 block text-xs font-bold text-[#385647]">Disponibilité
              <select value={productForm.stockStatus} onChange={e=>setProductForm({...productForm,stockStatus:e.target.value as typeof productForm.stockStatus})}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                <option value="in_stock">En stock</option><option value="limited">Stock limité</option><option value="out_of_stock">Rupture de stock</option>
              </select>
            </label>
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              {([['bestSeller','Meilleure vente'],['newArrival','Nouveauté'],['featured','Mis en avant']] as const).map(([field,label])=>
                <label key={field} className="flex items-center justify-between text-xs font-bold text-[#385647]">{label}
                  <input type="checkbox" checked={productForm[field]} onChange={e=>setProductForm({...productForm,[field]:e.target.checked})} className="h-4 w-4 accent-[#104d43]"/>
                </label>)}
            </div>
          </section>
          <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
            <h4 className="mb-4 text-base font-black text-[#193e38]">Organisation</h4>
            <label className="block text-xs font-bold text-[#385647]">Catégorie principale *
              <select value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value,subcategory:''})}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                <optgroup label="Rayons de la boutique">
                  {STORE_DEPARTMENTS.map(category=><option key={category.id} value={category.id}>{categories.find(c=>c.id===category.id)?.name.fr||category.name.fr}</option>)}
                </optgroup>
                {categories.some(c=>c.id===productForm.category&&!STORE_DEPARTMENTS.some(dept=>dept.id===c.id))&&<optgroup label="Catégorie historique"><option value={productForm.category}>{productForm.category}</option></optgroup>}
              </select>
            </label>
            <label className="mt-4 block text-xs font-bold text-[#385647]">Sous-catégorie
              <select value={productForm.subcategory} onChange={e=>setProductForm({...productForm,subcategory:e.target.value})}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                <option value="">Aucune</option>
                {getStoreSubcategories(productForm.category).map(sub=><option key={sub.id} value={sub.id}>{sub.name.fr}</option>)}
              </select>
            </label>
          </section>
          <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-base font-black text-[#193e38]">Inventaire & références</summary>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-[#385647]">SKU (référence interne)
                <input value={productForm.sku} maxLength={80} onChange={e=>setProductForm({...productForm,sku:e.target.value})}
                  placeholder="Ex. GB-CUI-001" className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
              </label>
              <label className="block text-xs font-bold text-[#385647]">Code-barres (facultatif)
                <input value={productForm.barcode} maxLength={80} onChange={e=>setProductForm({...productForm,barcode:e.target.value})}
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
              </label>
              <label className="block text-xs font-bold text-[#385647]">Identifiant technique
                <input disabled={Boolean(editingProduct)} value={productForm.id}
                  onChange={e=>setProductForm({...productForm,id:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,'-')})}
                  className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-[#f7faf8] px-3 font-mono text-xs text-[#193e38]"/>
              </label>
            </div>
          </details>

        </aside>
        <footer className="sticky bottom-0 z-20 col-span-full flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#c9e1d1] bg-white/95 px-4 py-3 shadow-[0_-5px_25px_rgba(22,60,40,.08)] backdrop-blur sm:px-5">
          <p className="flex min-w-0 items-center gap-2 text-[11px] leading-5 text-[#667f70]"><CheckCircle2 size={16} className="shrink-0 text-[#237953]"/>{editingProduct?'Enregistrement des modifications dans D1':'Création en brouillon dans Cloudflare D1'}</p>
          <div className="flex flex-1 justify-end gap-2 sm:flex-none">
            <button type="button" onClick={()=>{setEditingProduct(null);setIsAddingProduct(false);}} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#486658] hover:bg-[#f2f7f4]">Annuler</button>
            <button type="submit" disabled={mediaUploading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-5 text-xs font-extrabold text-white hover:bg-[#0b3931] disabled:cursor-wait disabled:opacity-50"><CheckCircle2 size={17}/>{editingProduct?'Enregistrer':'Enregistrer le brouillon'}</button>
          </div>
        </footer>
      </form>
    </section>
  )}

  {/* Shopify-style listing: search, status, images and clear actions. */}
  {!isAddingProduct && !editingProduct && (
  <section className="overflow-hidden rounded-[22px] border border-[#d9e7df] bg-white shadow-sm">
    <header className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
      <div>
        <h3 className="text-lg font-black text-[#193e38]">Liste des produits</h3>
        <p className="mt-1 text-xs text-slate-500">Recherchez, modifiez et organisez votre catalogue depuis un seul endroit.</p>
      </div>
      <button type="button" onClick={handleStartAddProduct}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 text-xs font-extrabold text-white hover:bg-[#0b3931]">
        <Plus size={17}/>Ajouter un produit
      </button>
    </header>
    <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_210px] sm:p-5">
      <label className="relative">
        <Search size={19} className="pointer-events-none absolute start-4 top-3.5 text-slate-400"/>
        <input type="search" value={productQuery} onChange={e=>setProductQuery(e.target.value)}
          placeholder="Rechercher par nom, référence, catégorie ou tag…" aria-label="Rechercher un produit"
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#fcfdfc] ps-12 pe-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
      </label>
      <select value={productStatusFilter} onChange={e=>setProductStatusFilter(e.target.value as typeof productStatusFilter)}
        aria-label="Filtrer par statut"
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#fcfdfc] px-4 text-xs font-bold text-[#193e38] outline-none focus:border-[#104d43]">
        <option value="all">Tous les produits ({adminProducts.length})</option>
        <option value="published">Publiés ({adminProducts.filter(p=>p.isActive===true).length})</option>
        <option value="draft">Brouillons ({adminProducts.filter(p=>p.isActive!==true).length})</option>
        <option value="outofstock">Rupture de stock ({adminProducts.filter(p=>!p.inStock||p.stockStatus==='out_of_stock').length})</option>
      </select>
    </div>
    <p className="border-b border-slate-100 px-5 py-3 text-xs font-semibold text-[#64796c]">{filteredProductsList.length} produit(s) correspondant à la recherche · Données du catalogue D1</p>
    {selectedProductIds.size > 0 && (
      <div className="flex flex-wrap items-center gap-2 border-b border-[#dce8df] bg-[#f3f8f4] px-4 py-3 sm:px-5">
        <span className="me-2 text-xs font-extrabold text-[#193e38]">{selectedProductIds.size} sélectionné(s)</span>
        <button type="button" onClick={handleBulkPublishProducts}
          className="min-h-10 rounded-xl bg-[#104d43] px-4 text-xs font-extrabold text-white hover:bg-[#0b3931]">
          Confirmer / publier
        </button>
        <button type="button" onClick={handleBulkDeleteProducts}
          className="min-h-10 rounded-xl border border-rose-200 bg-white px-4 text-xs font-extrabold text-rose-700 hover:bg-rose-50">
          Supprimer la sélection
        </button>
        <button type="button" onClick={clearProductSelection}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">
          Désélectionner
        </button>
      </div>
    )}
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-start text-xs">
        <thead className="bg-[#f5f9f6] text-[11px] font-extrabold text-[#527263]">
          <tr>
            <th className="w-12 px-4 py-4 text-center">
              <input
                type="checkbox"
                checked={filteredProductsList.length > 0 && filteredProductsList.every(p => selectedProductIds.has(p.id))}
                ref={el => { if (el) el.indeterminate = filteredProductsList.some(p => selectedProductIds.has(p.id)) && !filteredProductsList.every(p => selectedProductIds.has(p.id)); }}
                onChange={toggleSelectAllVisibleProducts}
                aria-label="Sélectionner tous les produits visibles"
                className="h-4 w-4 accent-[#104d43]"
              />
            </th>
            <th className="px-5 py-4 text-start">Produit</th>
            <th className="px-4 py-4 text-start">Catégorie</th>
            <th className="px-4 py-4 text-start">Statut</th>
            <th className="px-4 py-4 text-start">Stock</th>
            <th className="px-4 py-4 text-end">Prix</th>
            <th className="px-5 py-4 text-end">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8eee9]">
          {filteredProductsList.map(prod=><tr key={prod.id} className={selectedProductIds.has(prod.id) ? 'bg-[#f2f8f4] hover:bg-[#edf6f0]' : 'hover:bg-[#f9fcfa]'}>
            <td className="w-12 px-4 py-4 text-center">
              <input
                type="checkbox"
                checked={selectedProductIds.has(prod.id)}
                onChange={() => toggleProductSelection(prod.id)}
                aria-label={'Sélectionner '+(prod.name?.fr||prod.id)}
                className="h-4 w-4 accent-[#104d43]"
              />
            </td>
            <td className="px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2ece5] bg-[#f3f7f4]">
                  {prod.image?<img src={prod.image} loading="lazy" alt="" className="h-full w-full object-contain"/>:<Package size={23} className="text-[#91aa9b]"/>}
                </div>
                <div className="min-w-0">
                  <p className="max-w-[330px] truncate text-sm font-extrabold text-[#193e38]">{prod.name?.fr||prod.id}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">{prod.sku||prod.id}</p>
                  {Boolean(prod.tags?.length)&&<p className="mt-1 max-w-[300px] truncate text-[11px] text-[#658274]">{prod.tags?.slice(0,3).join(' · ')}</p>}
                </div>
              </div>
            </td>
            <td className="px-4 py-4">
              <span className="block text-xs font-semibold text-[#193e38]">{categories.find(cat=>cat.id===prod.category)?.name.fr||STORE_DEPARTMENTS.find(cat=>cat.id===prod.category)?.name.fr||prod.category}</span>
              {prod.subcategory&&<span className="mt-1 block text-[11px] text-slate-500">{getStoreSubcategories(prod.category).find(sub=>sub.id===prod.subcategory)?.name.fr||prod.subcategory}</span>}
            </td>
            <td className="px-4 py-4">
              <span className={'inline-flex rounded-full px-3 py-1.5 text-[11px] font-extrabold '+(prod.isActive===true?'bg-[#e7f6ec] text-[#176b45]':'bg-amber-50 text-amber-700')}>{prod.isActive===true?'Publié':'Brouillon'}</span>
            </td>
            <td className="px-4 py-4">
              <span className={'text-[11px] font-bold '+(!prod.inStock||prod.stockStatus==='out_of_stock'?'text-red-700':prod.stockStatus==='limited'?'text-amber-700':'text-[#17714c]')}>
                {!prod.inStock||prod.stockStatus==='out_of_stock'?'Rupture':prod.stockStatus==='limited'?'Stock limité':'En stock'}
              </span>
            </td>
            <td className="px-4 py-4 text-end">
              <strong className="whitespace-nowrap text-sm text-[#193e38]">{prod.price.toFixed(2)} DH</strong>
              {prod.originalPrice&&prod.originalPrice>prod.price&&<span className="mt-1 block text-[11px] text-slate-400 line-through">{prod.originalPrice.toFixed(2)} DH</span>}
            </td>
            <td className="px-5 py-4 text-end">
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={()=>handleStartEditProduct(prod)} className="min-h-10 rounded-xl border border-[#bed9c8] bg-[#f0f8f2] px-4 text-xs font-extrabold text-[#104d43] hover:bg-[#e0f0e5]">Modifier</button>
                <button type="button" onClick={()=>handleDeleteProduct(prod.id)} aria-label={'Retirer '+(prod.name?.fr||prod.id)} title="Retirer du catalogue"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button>
              </div>
            </td>
          </tr>)}
          {filteredProductsList.length===0&&<tr><td colSpan={7} className="px-5 py-16 text-center">
            <Package size={33} className="mx-auto text-[#9db5a3]"/>
            <h4 className="mt-4 text-base font-black text-[#193e38]">Aucun produit trouvé</h4>
            <p className="mt-2 text-xs text-slate-500">{adminProducts.length===0?'Commencez par ajouter votre premier produit.':'Essayez un autre filtre ou une autre recherche.'}</p>
            <button type="button" onClick={()=>{setProductQuery('');setProductStatusFilter('all');}} className="mt-4 rounded-xl border border-[#b8d8c4] px-4 py-2.5 text-xs font-bold text-[#104d43]">Effacer les filtres</button>
          </td></tr>}
        </tbody>
      </table>
    </div>
  </section>
  )}

</div>
 );
}
