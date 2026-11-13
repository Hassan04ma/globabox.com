import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Menu, X, Truck, Phone, PackageCheck, LayoutGrid, ArrowRight } from 'lucide-react';
import type { Language, CartItem, Category } from '../types';
import { CATEGORIES, ORDER_SUPPORT_NUMBER } from '../data';

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

const copy = {
  fr: {
    delivery: 'Livraison partout au Maroc · Paiement à la réception',
    search: 'Rechercher un produit, une catégorie...',
    browse: 'Toutes les catégories',
    home: 'Accueil',
    offers: 'Offres',
    tracking: 'Suivre ma commande',
    cart: 'Mon panier',
    contact: 'Service client',
    close: 'Fermer le menu',
    menu: 'Ouvrir le menu',
    noCategories: 'Les catégories seront bientôt disponibles',
    navigation: 'Navigation'
  },
  ar: {
    delivery: 'التوصيل لجميع أنحاء المغرب · الدفع عند الاستلام',
    search: 'قلب على منتج أو قسم...',
    browse: 'جميع الأقسام',
    home: 'الرئيسية',
    offers: 'العروض',
    tracking: 'تتبع الطلب',
    cart: 'سلة التسوق',
    contact: 'خدمة الزبناء',
    close: 'إغلاق القائمة',
    menu: 'فتح القائمة',
    noCategories: 'الأقسام ستتوفر قريباً',
    navigation: 'القائمة'
  },
  en: {
    delivery: 'Delivery across Morocco · Cash on delivery',
    search: 'Search products and categories...',
    browse: 'All categories',
    home: 'Home',
    offers: 'Offers',
    tracking: 'Track order',
    cart: 'My cart',
    contact: 'Customer service',
    close: 'Close menu',
    menu: 'Open menu',
    noCategories: 'Categories coming soon',
    navigation: 'Navigation'
  }
} as const;

export default function Header({
  language, setLanguage, searchTerm, onSearchChange, selectedCategory,
  setSelectedCategory, cart, setIsCartOpen, categories = CATEGORIES, onOpenTracking
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const c = copy[language];
  const isRtl = language === 'ar';
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!menuOpen && !categoryOpen) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setCategoryOpen(false); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen, categoryOpen]);

  const chooseCategory = (id: string) => {
    setSelectedCategory(id);
    setMenuOpen(false);
    setCategoryOpen(false);
    if (id) {
      window.requestAnimationFrame(() => document.getElementById('product-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goOffers = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    document.getElementById('promo-offers-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const searchBox = (mobile = false) => (
    <div className={'relative w-full ' + (mobile ? '' : 'max-w-xl')}>
      <Search size={18} className={'pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-500 ' + (isRtl ? 'right-4' : 'left-4')} />
      <input
        type="search"
        aria-label={c.search}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={c.search}
        className={'h-11 w-full rounded-xl border border-slate-200 bg-[#f6f8f6] px-11 text-sm text-slate-900 outline-none transition focus:border-[#21776a] focus:bg-white focus:ring-2 focus:ring-[#21776a]/10 ' + (isRtl ? 'text-right' : 'text-left')}
      />
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#104d43] text-white">
        <div className="mx-auto flex min-h-[31px] max-w-7xl items-center justify-between gap-3 px-4 text-[10px] font-semibold sm:px-6 sm:text-xs lg:px-8">
          <span className="flex items-center gap-2"><Truck size={13} aria-hidden="true" />{c.delivery}</span>
          <a className="hidden items-center gap-1.5 text-white/90 hover:text-white sm:flex" href={'tel:' + ORDER_SUPPORT_NUMBER}>
            <Phone size={12} aria-hidden="true" /><span dir="ltr">{ORDER_SUPPORT_NUMBER}</span>
          </a>
        </div>
      </div>

      <div className="mx-auto flex h-[66px] max-w-7xl items-center gap-3 px-4 sm:px-6 md:h-[73px] lg:gap-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#104d43] hover:bg-slate-50 lg:hidden"
          aria-label={c.menu}
          aria-expanded={menuOpen}
        ><Menu size={21} /></button>
        <a href="/" onClick={(e) => { e.preventDefault(); chooseCategory(''); onSearchChange(''); }} className="shrink-0" aria-label="Globabox — home">
          <img src="/brand/globabox-logo.svg" alt="GLOBABOX" className="h-10 w-[155px] object-contain object-left sm:w-[180px] lg:h-[52px] lg:w-[207px]" />
        </a>
        <div className="hidden min-w-0 flex-1 justify-center md:flex">{searchBox()}</div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-lg border border-slate-200 bg-white p-1 sm:flex" role="group" aria-label="Language">
            {(['fr', 'ar', 'en'] as Language[]).map((lang) => (
              <button type="button" key={lang} onClick={() => setLanguage(lang)} aria-pressed={language === lang}
                className={'min-h-8 rounded-md px-2 text-xs font-bold transition ' + (language === lang ? 'bg-[#104d43] text-white' : 'text-slate-600 hover:bg-slate-100')}>
                {lang === 'ar' ? 'ع' : lang.toUpperCase()}
              </button>
            ))}
          </div>
          {onOpenTracking && (
            <button onClick={onOpenTracking} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#104d43] hover:bg-slate-100 xl:flex">
              <PackageCheck size={18} />{c.tracking}
            </button>
          )}
          <button type="button" onClick={() => setIsCartOpen(true)} className="relative flex h-11 items-center gap-2 rounded-xl bg-[#104d43] px-3 text-white transition hover:bg-[#0b3931] sm:px-4" aria-label={c.cart}>
            <ShoppingCart size={19} />
            <span className="hidden text-xs font-bold sm:inline">{c.cart}</span>
            {itemCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4c75a] px-1 text-[10px] font-black text-[#183f37]">{itemCount}</span>}
          </button>
        </div>
      </div>

      <div className="mx-auto border-t border-slate-100 px-4 pb-3 pt-1 md:hidden">{searchBox(true)}</div>
      <nav className="hidden border-t border-slate-100 bg-white md:block" aria-label={c.navigation}>
        <div className="mx-auto flex h-[44px] max-w-7xl items-center gap-5 px-6 lg:px-8">
          <div className="relative shrink-0">
            <button onClick={() => setCategoryOpen((open) => !open)} aria-expanded={categoryOpen}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#edf5f2] px-3 text-xs font-extrabold text-[#104d43] hover:bg-[#dcece5]">
              <LayoutGrid size={16} />{c.browse}<span className="text-xs">{categoryOpen ? '−' : '+'}</span>
            </button>
            {categoryOpen && (
              <div className="absolute top-[42px] z-50 w-[420px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => chooseCategory(cat.id)}
                      className={'rounded-lg border px-3 py-3 text-start text-xs font-medium transition hover:border-[#21776a] hover:bg-[#edf5f2] ' + (selectedCategory === cat.id ? 'border-[#21776a] bg-[#edf5f2] text-[#104d43]' : 'border-slate-100 text-slate-700')}>
                      {cat.name[language] || cat.name.fr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => chooseCategory('')} className="shrink-0 text-xs font-bold text-[#104d43] hover:underline">{c.home}</button>
          <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap py-2 [scrollbar-width:none]">
            {categories.slice(0, 12).map(cat => (
              <button key={cat.id} onClick={() => chooseCategory(cat.id)} className={'shrink-0 text-xs transition hover:text-[#104d43] ' + (selectedCategory === cat.id ? 'font-extrabold text-[#104d43]' : 'font-medium text-slate-600')}>
                {cat.name[language] || cat.name.fr}
              </button>
            ))}
          </div>
          <button onClick={goOffers} className="shrink-0 text-xs font-bold text-[#bb8c25]">{c.offers}</button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a1d18]/60 lg:hidden" role="presentation" onClick={() => setMenuOpen(false)}>
          <div className={'absolute inset-y-0 w-[min(90vw,380px)] overflow-y-auto bg-white p-5 shadow-2xl ' + (isRtl ? 'right-0' : 'left-0')}
            role="dialog" aria-modal="true" aria-label={c.navigation} onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
              <img src="/brand/globabox-logo.svg" alt="GLOBABOX" className="h-11 w-44 object-contain" />
              <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg border border-slate-200 p-2 text-slate-700" aria-label={c.close}><X size={19} /></button>
            </div>
            <div className="mb-4 flex gap-2">
              {(['fr','ar','en'] as Language[]).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={'rounded-lg px-3 py-2 text-xs font-bold ' + (lang === language ? 'bg-[#104d43] text-white' : 'bg-slate-100 text-slate-700')}>{lang === 'ar' ? 'العربية' : lang.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => chooseCategory('')} className="mb-2 flex w-full items-center justify-between rounded-xl bg-[#edf5f2] px-4 py-3 text-sm font-bold text-[#104d43]">{c.home}<ArrowRight size={16}/></button>
            <p className="my-4 text-xs font-bold uppercase tracking-wide text-slate-500">{c.browse}</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => chooseCategory(cat.id)} className="min-h-12 rounded-xl border border-slate-200 p-3 text-start text-xs font-semibold text-slate-700 hover:border-[#21776a] hover:bg-slate-50">
                  {cat.name[language] || cat.name.fr}
                </button>
              ))}
              {!categories.length && <p className="col-span-2 text-sm text-slate-500">{c.noCategories}</p>}
            </div>
            {onOpenTracking && <button onClick={() => { setMenuOpen(false); onOpenTracking(); }} className="mt-5 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#104d43]"><PackageCheck size={18}/>{c.tracking}</button>}
            <a href={'tel:' + ORDER_SUPPORT_NUMBER} className="mt-4 flex items-center gap-2 text-sm text-slate-600"><Phone size={15}/>{c.contact}: <span dir="ltr">{ORDER_SUPPORT_NUMBER}</span></a>
          </div>
        </div>
      )}
    </header>
  );
}
