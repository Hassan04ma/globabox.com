import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, MessageSquare, Compass, Eye, MapPin, Globe, Menu, X, ChevronLeft, ChevronRight, ChevronDown, Grid, Truck, Phone } from 'lucide-react';
import { Language, CartItem, Category } from '../types';
import CategoryIcon from './CategoryIcon';
import WhatsAppIcon from './WhatsAppIcon';
import { TRANSLATIONS } from '../translations';
import { CATEGORIES, ORDER_SUPPORT_NUMBER, WA_LINK } from '../data';
import { triggerWhatsAppClick } from '../utils/analytics';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  categories?: Category[];
  onOpenTracking?: () => void;
}

export default function Header({
  language,
  setLanguage,
  searchTerm,
  onSearchChange,
  selectedCategory,
  setSelectedCategory,
  cart,
  setIsCartOpen,
  categories = CATEGORIES,
  onOpenTracking,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(true);

  // Close dropdown if clicked outside
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
      // Keep it true to ensure visual arrows are always rendered regardless of iframe resize delays
      setIsOverflowing(true);
    }
  };

  const handleScrollClick = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const isContainerRtl = language === 'ar';
      let scrollAmount = direction === 'left' ? -220 : 220;
      if (isContainerRtl) {
        // Reverse direction for RTL scrolling context to scroll properly in both directions
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
      // Wait a tiny bit to make sure layout has settled
      const timer = setTimeout(checkScroll, 150);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [categories, language]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const isRtl = language === "ar";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#1d2d52]/95 backdrop-blur-lg shadow-lg border-b border-[#314a80]'
          : 'bg-[#132140]/92 backdrop-blur-md border-b border-[#233d70]'
      }`}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Top Bar (Moroccan Flag, Delivery Notification, Working Hours) */}
      <div className={`bg-[#122245] border-b border-[#223b70] text-[11px] md:text-xs text-slate-200 px-4 flex justify-between items-center tracking-normal font-sans transition-all duration-300 ${
        isScrolled ? 'py-1' : 'py-1.5'
      }`}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-3 bg-red-600 relative overflow-hidden rounded-[2px]" title="Maroc">
            <span className="absolute inset-0 flex items-center justify-center text-[7px] text-emerald-400">★</span>
          </span>
          <span className="flex items-center gap-1">
            <span>{t('expressDeliveryBadge')} - {t('paymentOnDeliveryBadge')}</span>
            <Truck size={12} className="text-orange-500 shrink-0" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block font-mono text-slate-300">{t('footerSchedule')}</span>
          <a
            href={`tel:${ORDER_SUPPORT_NUMBER}`}
            className="hover:underline font-mono text-slate-200 flex items-center gap-1 font-semibold"
          >
            <span className="flex items-center gap-1">
              <Phone size={11} className="text-orange-500 shrink-0" />
              <span>{ORDER_SUPPORT_NUMBER}</span>
            </span>
          </a>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        isScrolled ? 'py-1.5 md:py-2' : 'py-2 md:py-3'
      }`}>
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-300 hover:bg-neutral-800 focus:outline-none"
              id="mobile-menu-toggle-btn"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <a 
              href="#" 
              onClick={() => { setSelectedCategory(''); onSearchChange(''); }}
              className="flex items-center gap-2 group"
            >
              {/* Custom Globabox Logomark */}
              <div className={`rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 border border-orange-400/30 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden shrink-0 ${
                isScrolled ? 'w-8 h-8 md:w-9 md:h-9' : 'w-9.5 h-9.5 md:w-11 md:h-11'
              }`}>
                <span className={`font-black font-sans tracking-tighter text-white z-10 flex items-center transition-all duration-300 ${
                  isScrolled ? 'text-sm' : 'text-base md:text-lg'
                }`}>
                  G<span className="text-amber-300 font-serif font-black">B</span>
                </span>
                {/* Decorative mountain icon/lines background and glowing light effect */}
                <span className="absolute bottom-0 text-[10px] opacity-75 font-mono text-white/40 select-none z-0">▲</span>
                <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></span>
              </div>
              <div className="flex flex-col">
                <span className={`font-bold tracking-tight text-white leading-none transition-all duration-300 ${
                  isScrolled ? 'text-sm md:text-base' : 'text-base md:text-lg'
                }`}>
                  {t('brandName')}
                </span>
                <span className={`tracking-wide text-orange-400 font-medium uppercase font-sans transition-all duration-300 leading-none ${
                   isScrolled ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1'
                }`}>
                  {t('tagline')}
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Search Engine */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full bg-[#1b2f59] text-white placeholder-slate-400 text-sm py-1.5 md:py-2 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 border border-[#2d4d87] focus:border-orange-500 transition-all font-sans ${
                  isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
                }`}
              />
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`} />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-1 hover:bg-[#253e6c] rounded-full transition-colors flex items-center justify-center`}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Language Selector & Cart */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Language Switch Dropdown */}
            <div className="relative flex bg-[#1b2f59] rounded-lg p-0.5 border border-[#2d4d87]">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded transition-all ${
                  language === 'fr'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded transition-all ${
                  language === 'ar'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded transition-all ${
                  language === 'en'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {onOpenTracking && (
              <button
                onClick={onOpenTracking}
                className="p-1.5 px-2.5 md:p-2 md:px-4 rounded-xl bg-orange-600 hover:bg-orange-500 border border-orange-400/50 text-white font-extrabold hover:scale-[1.03] shadow-md shadow-orange-600/10 hover:shadow-orange-600/30 transition-all duration-300 cursor-pointer flex items-center gap-1 text-[10px] sm:text-xs shrink-0 animate-fade-in"
              >
                <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                <span>
                  {language === 'ar' ? 'تتبع طلبي' : (language === 'en' ? 'Track Order' : 'Suivre ma commande')}
                </span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-[#1b2f59] hover:bg-orange-600/25 border border-[#2d4d87] hover:border-orange-500 text-white hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5 md:gap-2"
              id="app-cart-trigger-btn"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-md">
                {totalCartItems}
              </span>
              <span className="hidden lg:inline text-xs font-semibold text-slate-200">
                {t('viewCartButton')}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Engine */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full bg-[#1b2f59] text-white placeholder-slate-400 text-xs py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 border border-[#2d4d87] transition-all pr-9 pl-9 ${
                isRtl ? 'text-right' : 'text-left'
              }`}
            />
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5`} />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 hover:bg-[#253e6c] rounded-full transition-colors flex items-center justify-center`}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar and dropdown navigation */}
        <div ref={dropdownRef} className="flex items-center gap-2 mt-2 border-t border-[#1c2e4a]/40 pt-2 relative">
          
          {/* Toutes les catégories dropdown menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsAllCategoriesOpen(!isAllCategoriesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-extrabold rounded-full bg-[#1b2f59] text-white border border-[#2d4d87] hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all duration-300 cursor-pointer whitespace-nowrap group font-sans"
            >
              <Grid size={12} className="text-white group-hover:text-white transition-colors" />
              <span>{language === 'ar' ? 'جميع الفئات' : (language === 'en' ? 'All categories' : 'Toutes les catégories')}</span>
              <ChevronDown size={11} className={`transition-transform duration-250 text-slate-200 group-hover:text-white ${isAllCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isAllCategoriesOpen && (
              <div className={`absolute top-full mt-2 z-50 bg-[#121f3d] border border-[#233e75] rounded-xl shadow-2xl p-4 w-[480px] max-w-[90vw] animate-fade-in ${
                isRtl ? 'right-0' : 'left-0'
              }`}>
                <p className="text-center text-[10px] uppercase tracking-wider text-slate-400 mb-3 font-extrabold pb-1.5 border-b border-[#233e75]/60">
                  {language === 'ar' ? 'اختر فئة لتصفح المنتجات' : (language === 'en' ? 'Choose a category to browse' : 'Sélectionnez une catégorie pour parcourir')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSelectedCategory(''); setIsAllCategoriesOpen(false); }}
                    className={`col-span-1 min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      selectedCategory === ''
                        ? 'bg-orange-600 text-white shadow shadow-orange-600/30'
                        : 'bg-[#182847] text-white border border-[#2f4a7c] hover:bg-orange-600/20 hover:text-white'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('allCategoriesLabel')}</span>
                  </button>
                  
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setIsAllCategoriesOpen(false); }}
                      className={`col-span-1 min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-orange-600 text-white shadow shadow-orange-600/30'
                          : 'bg-[#182847] text-white border border-[#2f4a7c] hover:bg-orange-600/20 hover:text-white'
                      } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      <CategoryIcon categoryId={cat.id} className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="truncate flex-1">{cat.name[language]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scroller section with manual navigation arrows */}
          <div className="relative flex-1 overflow-hidden min-w-0">
            {/* Soft left & right overlays for nice fade effect */}
            <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${isScrolled ? 'from-[#121f3d]' : 'from-[#0e1830]'} to-transparent pointer-events-none z-10`} />
            <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${isScrolled ? 'from-[#121f3d]' : 'from-[#0e1830]'} to-transparent pointer-events-none z-10`} />

            {/* Left scroll control button */}
            {isOverflowing && (
              <button
                onClick={() => handleScrollClick('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all shadow-md cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} strokeWidth={3} className="text-white" />
              </button>
            )}

            {/* Right scroll control button */}
            {isOverflowing && (
              <button
                onClick={() => handleScrollClick('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all shadow-md cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} strokeWidth={3} className="text-white" />
              </button>
            )}

            {/* Scrollable Container items row */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              dir={isRtl ? "rtl" : "ltr"}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x whitespace-nowrap px-4 w-full"
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
                {t('allCategoriesLabel')}
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`px-3.5 py-1.5 text-[11px] font-extrabold rounded-full transition-all duration-300 whitespace-nowrap uppercase tracking-wider flex items-center justify-center shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white border border-orange-500 shadow-md shadow-orange-600/20 scale-[1.01]'
                      : 'bg-[#182847] text-white border border-[#2f4a7c] hover:bg-[#20345d] hover:border-orange-500/40 hover:text-white hover:scale-[1.01]'
                  }`}
                >
                  {cat.name[language]}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile Drawer Slide Navigation Overlays */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#070d1a]/85 backdrop-blur-sm z-50 lg:hidden">
          <div className={`fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-4/5 max-w-sm bg-[#0b1528] p-6 flex flex-col border-[#1c2e4a] border-r`}>
            <div className="flex items-center justify-between pb-4 border-b border-[#1c2e4a]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-white font-black text-xs select-none">
                  G
                </div>
                <span className="text-white font-bold text-lg">{t('brandName')}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-4 space-y-4 overflow-y-auto flex-1 font-sans">
              <p className="text-xs text-orange-400 font-semibold uppercase">{t('categoryTitle')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setSelectedCategory(''); setIsMobileMenuOpen(false); }}
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
                    selectedCategory === '' ? 'bg-orange-600 text-white font-bold' : 'bg-[#13223c] text-slate-200'
                  } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t('allCategoriesLabel')}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
                      selectedCategory === cat.id ? 'bg-orange-600 text-white font-bold' : 'bg-[#13223c] text-slate-200'
                    } ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                  >
                    <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1">{cat.name[language]}</span>
                  </button>
                ))}
              </div>

              {onOpenTracking && (
                <button
                  onClick={() => { onOpenTracking(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/20 transition-all text-xs font-black"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{language === 'ar' ? 'تتبع طلبيتك الآن' : 'Suivre ma commande'}</span>
                  </span>
                  <span>➜</span>
                </button>
              )}

              <div className="border-t border-[#1c2e4a] pt-4 space-y-3">
                <p className="text-xs text-slate-400">{t('footerContactTitle')}</p>
                <p className="text-xs text-slate-200 font-mono flex items-center gap-1.5"><Phone size={13} className="text-orange-500 shrink-0" /> {ORDER_SUPPORT_NUMBER}</p>
                <p className="text-[11px] text-slate-500 font-mono">{t('footerSchedule')}</p>
                <a
                  href={WA_LINK}
                  onClick={() => triggerWhatsAppClick('Mobile Menu')}
                  className="inline-flex w-full justify-center items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2 rounded-xl transition-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
