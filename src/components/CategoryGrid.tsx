import { ArrowUpRight, Grid2X2, ImageOff } from 'lucide-react';
import type { Category, Language } from '../types';
import { CATEGORIES } from '../data';

interface CategoryGridProps {
  language: Language;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories?: Category[];
}

const label = {
  fr: { title: 'Nos univers', subtitle: 'Explorez les catégories de notre boutique', explore: 'Découvrir' },
  ar: { title: 'تسوق حسب القسم', subtitle: 'اكتشف أقسام متجر جلوبابوكس', explore: 'تصفح القسم' },
  en: { title: 'Shop by category', subtitle: 'Find the products you need', explore: 'Explore' }
} as const;

export default function CategoryGrid({
  language, selectedCategory, setSelectedCategory, categories = CATEGORIES
}: CategoryGridProps) {
  const c = label[language];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={c.title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#104d43]"><Grid2X2 size={18}/><span className="text-xs font-extrabold uppercase tracking-[.15em]">GLOBABOX</span></div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{c.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{c.subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((cat) => {
          const selected = selectedCategory === cat.id;
          return (
            <button
              type="button" key={cat.id}
              onClick={() => {setSelectedCategory(cat.id); window.requestAnimationFrame(() => document.getElementById('product-catalog')?.scrollIntoView({behavior:'smooth',block:'start'}));}}
              className={'group overflow-hidden rounded-2xl border bg-white text-start shadow-[0_3px_18px_rgba(0,0,0,.035)] transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#104d43] ' + (selected ? 'border-[#104d43] ring-2 ring-[#104d43]/15' : 'border-slate-200 hover:border-[#a1c1b6]')}
              aria-pressed={selected}
            >
              <div className="relative aspect-[1.35/1] overflow-hidden bg-[#eef2ee]">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name[language] || cat.name.fr} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400"><ImageOff size={29} /></div>
                )}
              </div>
              <div className="flex min-h-[76px] flex-col justify-center px-3 py-3 sm:px-4">
                <span className="line-clamp-2 text-sm font-bold text-[#193e38]">{cat.name[language] || cat.name.fr}</span>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#25776b]">{c.explore}<ArrowUpRight size={13}/></span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
