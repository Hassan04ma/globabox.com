import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Trash2, Tag, Percent, DollarSign, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Grid, X, Compass } from 'lucide-react';
import { Language, Category } from '../types';
import { CATEGORIES } from '../data';
import CategoryIcon from './CategoryIcon';

interface ProductFiltersProps {
  language: Language;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  minPrice: number | '';
  setMinPrice: (price: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (price: number | '') => void;
  sortOption: 'newest' | 'price_low_high' | 'price_high_low';
  setSortOption: (option: 'newest' | 'price_low_high' | 'price_high_low') => void;
  productsFoundCount: number;
}

export default function ProductFilters({
  language,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortOption,
  setSortOption,
  productsFoundCount,
}: ProductFiltersProps) {
  const isRtl = language === "ar";
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(true);

  const t = {
    searchLabel: isRtl ? "ابحث عن منتج بالاسم..." : "Rechercher par nom...",
    filterByPrice: isRtl ? "تصفية حسب السعر" : "Filtrer par Prix",
    minPrice: isRtl ? "السعر الأدنى" : "Prix min",
    maxPrice: isRtl ? "السعر الأقصى" : "Prix max",
    sortBy: isRtl ? "ترتيب حسب" : "Trier par",
    sortNewest: isRtl ? "الأحدث" : "Plus récent",
    sortPriceAsc: isRtl ? "السعر: من الأقل إلى الأكثر" : "Prix : Croissant",
    sortPriceDesc: isRtl ? "السعر: من الأكثر إلى الأقل" : "Prix : Décroissant",
    categoriesLabel: isRtl ? "الأقسام" : "Catégories",
    allCategories: isRtl ? "كل السلع" : "Tous les produits",
    clearFilters: isRtl ? "مسح التصفية" : "Réinitialiser",
    foundCount: isRtl 
      ? `تم العثور على ${productsFoundCount} منتج` 
      : `${productsFoundCount} produit${productsFoundCount > 1 ? 's' : ''} trouvé${productsFoundCount > 1 ? 's' : ''}`,
    advancedFilters: isRtl ? "تصفية متقدمة" : "Filtres avancés",
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAllCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      // Force scroll arrows to render reliably
      setIsOverflowing(true);
    }
  };

  const handleScrollClick = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const isContainerRtl = language === 'ar';
      let scrollAmount = direction === 'left' ? -220 : 220;
      if (isContainerRtl) {
        // Reverse direction scroll for Arabic RTL Layouts
        scrollAmount = -scrollAmount;
      }
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      const timer = setTimeout(checkScroll, 150);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [language]);

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== '' || minPrice !== '' || maxPrice !== '' || sortOption !== 'newest';


  return (
    <div 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-5 sm:p-6 mb-8 transition-all hover:border-slate-300"
      id="product-filters-container"
    >
      {/* Search Input, Sort & Category filter combo */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* 1. Search Bar */}
        <div className="md:col-span-5 relative">
          <label className="sr-only">{t.searchLabel}</label>
          <input
            type="text"
            placeholder={t.searchLabel}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 text-slate-800 placeholder-slate-455 text-sm py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 border border-slate-200 transition-all font-medium font-sans ${
              isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
            }`}
          />
          <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-3 text-slate-400 w-4.5 h-4.5`} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-2 px-2 py-1 rounded bg-slate-200 text-slate-600 hover:text-slate-800 font-bold font-mono text-[9px]`}
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. Sorting Dropdown */}
        <div className="md:col-span-4 relative">
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className={`w-full appearance-none bg-slate-50 text-slate-800 text-sm py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 border border-slate-200 transition-all font-semibold ${
                isRtl ? 'pr-10 pl-8 text-right' : 'pl-10 pr-8 text-left'
              }`}
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="price_low_high">{t.sortPriceAsc}</option>
              <option value="price_high_low">{t.sortPriceDesc}</option>
            </select>
            <ArrowUpDown className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-3 text-slate-400 w-4 h-4 pointer-events-none`} />
            <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-3.5 pointer-events-none text-slate-400`}>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.576 0 0.436 0.445 0.408 1.197 0 1.615l-4.695 4.502c-0.266 0.256-0.62 0.383-0.973 0.383s-0.707-0.127-0.973-0.383l-4.695-4.502c-0.408-0.418-0.436-1.17 0-1.615z"/></svg>
            </div>
          </div>
        </div>

        {/* 3. Filter Toggle Button & Clear Button */}
        <div className="md:col-span-3 flex gap-2 w-full">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              showAdvanced || minPrice !== '' || maxPrice !== ''
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-350'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t.advancedFilters}</span>
            {(minPrice !== '' || maxPrice !== '') && (
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 transition-colors text-xs font-bold cursor-pointer"
              title={t.clearFilters}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Advanced Price Slider & Bounds Panel */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale-up">
          <div>
            <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase block mb-1.5 leading-none">
              {t.filterByPrice}
            </span>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={t.minPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono font-medium"
                />
                <span className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-2 text-[10px] text-slate-400 font-bold`}>DH</span>
              </div>
              <span className="text-slate-400 text-xs">─</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={t.maxPrice}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono font-medium"
                />
                <span className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-2 text-[10px] text-slate-400 font-bold`}>DH</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-medium text-slate-500 pt-5 sm:pt-0">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.allCategories}</span>
              <span className="text-xs font-black text-slate-800 font-mono mt-0.5">{t.foundCount}</span>
            </div>
            <div className="w-8.5 h-8.5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 animate-pulse shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Horizontal categories list inside catalog filter */}
      <div className="mt-5 pt-4 border-t border-slate-150 relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none">
              {t.categoriesLabel}
            </span>
            <span className="text-[10px] bg-emerald-100/80 text-emerald-700 border border-emerald-200/50 px-1.5 py-0.5 rounded-lg font-black animate-pulse">
              UI updated
            </span>
          </div>
          
          {/* All categories dropdown toggle inside catalog filters */}
          <div className="relative z-35 shrink-0">
            <button
              onClick={() => setIsAllCategoriesOpen(!isAllCategoriesOpen)}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold rounded-full bg-[#1b2f59] text-white border border-[#2d4d87] hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all duration-300 cursor-pointer whitespace-nowrap group font-sans shadow-sm"
            >
              <Grid size={11} className="text-white group-hover:text-white transition-colors" />
              <span>{language === 'ar' ? 'جميع الفئات' : (language === 'en' ? 'All categories' : 'Toutes les catégories')}</span>
              <ChevronDown size={10} className={`transition-transform duration-250 text-slate-205 group-hover:text-white ${isAllCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isAllCategoriesOpen && (
              <div 
                className={`absolute top-full mt-2 z-40 bg-[#121f3d] border border-[#233e75] rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.5)] p-5 w-[calc(100vw-2rem)] sm:w-[540px] md:w-[620px] max-h-[75vh] overflow-y-auto no-scrollbar animate-fade-in ${
                  isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                }`}
              >
                {/* Header row with dynamic title, subtitle, and close button */}
                <div className="flex items-start justify-between gap-4 mb-4 border-b border-[#233e75]/50 pb-3">
                  <div>
                    <h4 className="text-sm md:text-base font-extrabold text-orange-400">
                      {language === 'ar' ? 'اختر فئة لتصفح المنتجات' : (language === 'en' ? 'Select a Category' : 'Sélectionnez une catégorie')}
                    </h4>
                    <p className="text-[11px] text-slate-350 mt-1 font-medium leading-relaxed">
                      {language === 'ar' 
                        ? 'اختر فئة لعرض المنتجات المناسبة التي تبحث عنها.' 
                        : (language === 'en' 
                          ? 'Choose a category to display the corresponding products.' 
                          : 'Choisissez une catégorie pour afficher les produits correspondants.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAllCategoriesOpen(false)}
                    className="p-1 px-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-orange-600/20 hover:text-orange-400 transition-all cursor-pointer border border-[#2d4d87]/60 hover:border-[#233e75] shrink-0"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Subcategories grid */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSelectedCategory(''); setIsAllCategoriesOpen(false); }}
                    className={`col-span-1 min-h-[44px] px-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs md:text-[13px] font-extrabold cursor-pointer ${
                      selectedCategory === ''
                        ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                        : 'bg-[#182847] text-white border-[#2f4a7c] hover:bg-[#20345d] hover:border-orange-500/40 hover:text-white'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
                    <span>{t.allCategories}</span>
                  </button>
                  
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setIsAllCategoriesOpen(false); }}
                        className={`col-span-1 min-h-[44px] px-3.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm text-xs md:text-[13px] font-extrabold cursor-pointer ${
                          isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'
                        } ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                            : 'bg-[#182847] text-white border-[#2f4a7c] hover:bg-[#20345d] hover:border-[#2d4d87] hover:text-white'
                        }`}
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        <CategoryIcon categoryId={cat.id} className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate flex-1 whitespace-normal leading-snug line-clamp-2">{cat.name[language] || cat.name['fr']}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories container styled as a premium nested card */}
        <div className="relative bg-white border border-slate-200/90 p-2.5 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-between gap-1">
          
          {/* Scroll Left Button */}
          {isOverflowing && (
            <button
              onClick={() => handleScrollClick('left')}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all shadow-md z-20 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} strokeWidth={3} className="text-white" />
            </button>
          )}

          {/* Scrolling Wrapper */}
          <div className="relative flex-1 overflow-hidden min-w-0">
            {/* Soft left & right overlays for nice fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              dir={isRtl ? "rtl" : "ltr"}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x whitespace-nowrap px-3 w-full"
            >
              <button
                onClick={() => setSelectedCategory('')}
                dir={isRtl ? 'rtl' : 'ltr'}
                className={`px-3.5 py-1.5 text-[11px] font-extrabold rounded-full transition-all duration-300 whitespace-nowrap uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-orange-600 text-white border border-orange-500 shadow-md shadow-orange-600/20 scale-[1.01]'
                    : 'bg-[#182847] text-white border border-[#2f4a7c] hover:bg-[#20345d] hover:border-orange-500/40 hover:text-white hover:scale-[1.01]'
                }`}
              >
                {t.allCategories}
              </button>
              
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={`px-3.5 py-1.5 text-[11px] font-extrabold rounded-full transition-all duration-300 whitespace-nowrap uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white border border-orange-500 shadow-md shadow-orange-600/20 scale-[1.01]'
                        : 'bg-[#182847] text-white border border-[#2f4a7c] hover:bg-[#20345d] hover:border-orange-500/50 hover:text-white hover:scale-[1.01]'
                    }`}
                  >
                    {cat.name[language] || cat.name['fr']}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scroll Right Button */}
          {isOverflowing && (
            <button
              onClick={() => handleScrollClick('right')}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all shadow-md z-20 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} strokeWidth={3} className="text-white" />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
