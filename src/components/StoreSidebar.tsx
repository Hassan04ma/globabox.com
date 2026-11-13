import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronRight, Grid2X2 } from 'lucide-react';
import type { Language, Product, Category } from '../types';
import { CATEGORY_GROUPS, STORE_DEPARTMENTS } from '../storefrontDepartments';
import { getStoreSubcategories, matchesSubcategory } from '../storefrontSubcategories';

interface Props {
 language:Language;
 selectedCategory:string;
 selectedSubcategory:string;
 onSelect:(id:string)=>void;
 onSelectSubcategory:(parentId:string,subcatId:string)=>void;
 products:Product[];
}

const copy={
 fr:{title:'Rayons & catégories',all:'Tous les produits',subtitle:'Parcourir nos univers',everything:'Tous les articles',items:'articles'},
 ar:{title:'الأقسام والمنتجات',all:'جميع المنتجات',subtitle:'تسوق حسب القسم',everything:'جميع منتجات القسم',items:'منتج'},
 en:{title:'Shop departments',all:'All products',subtitle:'Explore departments',everything:'View all in category',items:'items'}
} as const;

export default function StoreSidebar({language,selectedCategory,selectedSubcategory,onSelect,onSelectSubcategory,products}:Props){
 const t=copy[language];
 const [expanded,setExpanded]=useState<string|null>(selectedCategory||null);
 const countFor=(id:string)=>products.filter(p=>p.isActive!==false&&(CATEGORY_GROUPS[id]||[id]).includes(p.category)).length;
 const subcountFor=(subId:string,parent:string)=>products.filter(p=>p.isActive!==false&&(CATEGORY_GROUPS[parent]||[parent]).includes(p.category)&&matchesSubcategory(p,subId)).length;
 const section=(mobile=false)=>(
  <div className="space-y-2">
   <button type="button" onClick={()=>{onSelect('');setExpanded(null);}} className={'mb-2 flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-xs font-extrabold '+(!selectedCategory?'bg-[#104d43] text-white':'bg-[#edf5f2] text-[#104d43] hover:bg-[#dfece4]')}>
     {t.all}<Grid2X2 size={16}/>
   </button>
   {STORE_DEPARTMENTS.map((category:Category)=>{
    const active=selectedCategory===category.id,open=expanded===category.id,subs=getStoreSubcategories(category.id);
    return <div key={category.id} className={'overflow-hidden rounded-xl border transition-colors '+(active?'border-[#97bead] bg-[#f3f8f4]':'border-slate-100 bg-white')}>
      <div className="flex items-center gap-1.5 p-1.5">
       <button type="button" onClick={()=>{onSelect(category.id);setExpanded(category.id);}}
        className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-start hover:bg-[#edf6f1]" aria-current={active?'page':undefined}>
        <img src={category.image} alt="" loading="lazy" className="h-[46px] w-[49px] shrink-0 rounded-lg bg-slate-100 object-cover"/>
        <span className="min-w-0 flex-1">
          <span className={'block text-[11px] font-bold leading-4 sm:text-xs '+(active?'text-[#104d43]':'text-[#263d36]')}>{category.name[language]||category.name.fr}</span>
          <span className="mt-1 block text-[10px] text-slate-500">{countFor(category.id)} {t.items}</span>
        </span>
       </button>
       {subs.length>0&&<button type="button" onClick={()=>setExpanded(open?null:category.id)} aria-label={(open?'Collapse ':'Expand ')+(category.name[language]||category.name.fr)}
        aria-expanded={open} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#104d43] hover:bg-[#e1eee7]">
         {open?<ChevronDown size={16}/>:<ChevronRight size={16} className={language==='ar'?'rotate-180':''}/>}
       </button>}
      </div>
      {open&&subs.length>0&&<div className="space-y-0.5 border-t border-[#e4eee8] bg-white px-2 pb-2 pt-1.5">
       <button type="button" onClick={()=>onSelect(category.id)} className={'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-[11px] font-bold '+(active&&!selectedSubcategory?'bg-[#e9f3ed] text-[#104d43]':'text-slate-600 hover:bg-slate-50')}>{t.everything}<ArrowUpRight size={12}/></button>
       {subs.map(sub=>{
        const selected=active&&selectedSubcategory===sub.id;
        return <button type="button" key={sub.id} onClick={()=>{setExpanded(category.id);onSelectSubcategory(category.id,sub.id);}}
         aria-current={selected?'page':undefined}
         className={'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-[11px] transition-colors '+(selected?'bg-[#104d43] font-bold text-white':'text-slate-600 hover:bg-[#edf5f2] hover:text-[#104d43]')}>
          <span>{sub.name[language]||sub.name.fr}</span><span className={'shrink-0 text-[10px] '+(selected?'text-white/75':'text-slate-400')}>{subcountFor(sub.id,category.id)}</span>
         </button>;
       })}
      </div>}
    </div>;
   })}
  </div>
 );
 return <aside className="w-full shrink-0 lg:w-[266px] xl:w-[278px]" dir={language==='ar'?'rtl':'ltr'} aria-label={t.title}>
   <div className="hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,.035)] lg:sticky lg:top-[115px] lg:block">
    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4 text-[#104d43]"><Grid2X2 size={19}/><div><h2 className="text-sm font-black">{t.title}</h2><span className="text-[11px] text-slate-500">{t.subtitle}</span></div></div>
    <div className="max-h-[min(70vh,760px)] overflow-y-auto pe-1">{section()}</div>
   </div>
   <details className="rounded-xl border border-slate-200 bg-white lg:hidden">
    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-[#104d43] [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><Grid2X2 size={18}/>{t.title}</span><ChevronDown size={17}/></summary>
    <div className="max-h-[60vh] overflow-y-auto border-t border-slate-100 p-3">{section(true)}</div>
   </details>
 </aside>;
}
