import { Grid2X2, ArrowUpRight, ImageOff } from 'lucide-react';
import { Category, Language } from '../types';
import { CATEGORIES } from '../data';
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <Grid2X2 className="w-5 h-5 text-teal-700" />
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
              className={`group overflow-hidden rounded-2xl border text-center transition-all duration-300 cursor-pointer flex flex-col relative aspect-[4/5] sm:aspect-square hover:-translate-y-1 shadow-sm hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                isSelected
                  ? 'border-teal-700 ring-2 ring-teal-700/25 shadow-sm'
                  : 'border-slate-200 bg-slate-900 hover:border-orange-500/40'
              }`}
            >
              {/* Permanent elegant gradient overlay for text readability - around 45% to 80% opacity overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/15 to-slate-950/5 group-hover:from-slate-950/95 group-hover:via-slate-950/25 group-hover:to-slate-950/10 transition-colors duration-300 z-10" />
              
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name[language] || cat.name.fr}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500" aria-hidden="true">
                  <ImageOff size={30} />
                </span>
              )}

              {/* Title and details clearly visible from start */}
              <div className="relative z-20 flex flex-col items-center justify-end h-full p-3 pb-5 select-none">
                <span 
                  className={`text-xs md:text-sm font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight text-center ${
                    isSelected ? 'text-orange-400' : ''
                  }`}
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {cat.name[language]}
                </span>
                
                <span className="mt-2 flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                  <ArrowUpRight size={12} aria-hidden="true" />
                  {language === 'ar' ? 'تصفح القسم' : language === 'en' ? 'Explore category' : 'Découvrir'}
                </span>

              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
