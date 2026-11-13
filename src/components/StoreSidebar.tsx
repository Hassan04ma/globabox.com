import { ChevronDown, Grid2X2, ArrowUpRight } from 'lucide-react';
import type { Category, Language, Product } from '../types';
import { STORE_DEPARTMENTS, CATEGORY_GROUPS } from '../storefrontDepartments';

interface Props {
  language: Language;
  selectedCategory: string;
  onSelect: (id:string)=>void;
  products: Product[];
}

const copy={
 fr:{title:'Nos catégories',all:'Tous les produits',desc:'Explorez nos rayons'},
 ar:{title:'تسوق حسب القسم',all:'جميع المنتجات',desc:'اكتشف أقسام المتجر'},
 en:{title:'Shop categories',all:'All products',desc:'Explore our departments'}
} as const;

export default function StoreSidebar({language,selectedCategory,onSelect,products}:Props){
  const c=copy[language];
  const activeCounts=(id:string)=>products.filter(p=>p.isActive!==false && (CATEGORY_GROUPS[id]||[id]).includes(p.category)).length;
  const options=STORE_DEPARTMENTS;
  const links=(mobile=false)=>(
    <div className={mobile?'grid grid-cols-2 gap-2 sm:grid-cols-3':'space-y-2'}>
      {options.map((category:Category)=>{
        const selected=selectedCategory===category.id;
        return <button key={category.id} type="button" onClick={()=>onSelect(category.id)} aria-pressed={selected}
          className={'group flex items-center gap-3 rounded-xl border p-2 text-start transition-all hover:border-[#94bdad] hover:bg-[#edf6f1] '+(selected?'border-[#104d43] bg-[#e6f2ec] shadow-sm':'border-slate-100 bg-white')}>
          <img src={category.image} alt={category.name[language]||category.name.fr} loading="lazy"
            className="h-[54px] w-[58px] shrink-0 rounded-lg bg-slate-100 object-cover sm:h-[62px] sm:w-[65px]"/>
          <span className="min-w-0 flex-1">
            <span className={'block text-[11px] font-bold leading-4 sm:text-xs '+(selected?'text-[#104d43]':'text-[#263d36]')}>{category.name[language]||category.name.fr}</span>
            <span className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">{activeCounts(category.id)} {language==='ar'?'منتج':language==='en'?'items':'articles'} <ArrowUpRight size={11} className="opacity-0 transition-opacity group-hover:opacity-100"/></span>
          </span>
        </button>;
      })}
    </div>
  );
  return <aside aria-label={c.title} className="w-full shrink-0 lg:w-[266px] xl:w-[278px]" dir={language==='ar'?'rtl':'ltr'}>
    <div className="hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,.035)] lg:sticky lg:top-[135px] lg:block">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4 text-[#104d43]"><Grid2X2 size={19}/><div><h2 className="text-sm font-black">{c.title}</h2><span className="text-[11px] text-slate-500">{c.desc}</span></div></div>
      <button type="button" onClick={()=>onSelect('')} className={'mb-3 flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs font-extrabold '+(!selectedCategory?'bg-[#104d43] text-white':'bg-[#edf5f2] text-[#104d43] hover:bg-[#dfece4]')}>{c.all}<Grid2X2 size={16}/></button>
      <div className="max-h-[min(68vh,690px)] overflow-y-auto pe-1">{links()}</div>
    </div>
    <details id="mobile-shop-departments" className="rounded-xl border border-slate-200 bg-white lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-[#104d43] [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><Grid2X2 size={18}/>{c.title}</span><ChevronDown size={17}/></summary>
      <div className="border-t border-slate-100 p-3">
        <button type="button" onClick={()=>onSelect('')} className="mb-3 w-full rounded-xl bg-[#edf5f2] px-3 py-2.5 text-start text-xs font-bold text-[#104d43]">{c.all}</button>
        {links(true)}
      </div>
    </details>
  </aside>;
}
