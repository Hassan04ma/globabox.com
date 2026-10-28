import { Grid2X2 } from 'lucide-react';
import { Category, Language } from '../types';
import { CATEGORIES, PRODUCTS } from '../data';
import { TRANSLATIONS } from '../translations';

interface CategoryGridProps {
  language: Language;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories?: Category[];
}

export default function CategoryGrid({
  language,
  selectedCategory,
  setSelectedCategory,
  categories = CATEGORIES,
}: CategoryGridProps) {
  const isRtl = language === "ar";
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
    >
      <div className="flex items-center gap-2 mb-6">
        <Grid2X2 className="w-5 h-5 text-slate-700" />
        <h2 className="text-xl font-black tracking-tight text-slate-900 font-sans">
          {t('categoryTitle')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`group overflow-hidden rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col relative aspect-[1/1] hover:shadow-md shadow-sm ${
                isSelected
                  ? 'border-slate-900 ring-1 ring-slate-900/15 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-400'
              }`}
            >
              {/* Permanent elegant gradient overlay for text readability - around 45% to 80% opacity overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/45 group-hover:from-slate-950/90 group-hover:via-slate-950/60 group-hover:to-slate-950/50 transition-colors duration-300 z-10" />
              
              <img
                src={cat.image}
                alt={cat.name[language]}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
              />

              {/* Title and details clearly visible from start */}
              <div className="relative z-20 flex flex-col items-center justify-center h-full p-3 select-none">
                <span 
                  className={`text-xs md:text-sm font-black text-white group-hover:text-white transition-colors uppercase tracking-tight text-center ${
                    isSelected ? 'text-white' : ''
                  }`}
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {cat.name[language]}
                </span>
                
                {/* Product Count indicator */}
                {(() => {
                  const localProductsRaw = typeof window !== 'undefined' ? localStorage.getItem('globabox_products_v1') : null;
                  let allProducts = PRODUCTS; try { if (localProductsRaw) allProducts = JSON.parse(localProductsRaw); } catch { /* use bundled catalog */ }
                  const count = allProducts.filter((p: any) => p.category === cat.id).length;
                  return (
                    <span 
                      className="text-[9px] font-mono font-bold text-slate-100 mt-1.5 bg-black/60 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-xs select-none"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                    >
                      {language === 'ar' ? `${count} منتجات` : language === 'en' ? `${count} items` : `${count} articles`}
                    </span>
                  );
                })()}

                <span 
                  className="text-[9px] uppercase tracking-widest text-slate-100 mt-2 block group-hover:text-white group-hover:translate-x-0.5 transition-all font-black"
                  style={{ textShadow: '0 1.5px 3px rgba(0,0,0,0.95)' }}
                >
                  {language === 'ar' ? 'تصفح الفئة ←' : (language === 'en' ? 'explore →' : 'découvrir →')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
