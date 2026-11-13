import { useMemo, useState, type ReactNode, type RefObject } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CreditCard, Headphones, LayoutGrid, PackageCheck, Search, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Truck } from 'lucide-react';
import type { Category, Language, Product } from '../types';
import ProductImage from './ProductImage';

type FilterType = 'all' | 'bestsellers' | 'newarrivals';
type SortType = 'newest' | 'price_low_high' | 'price_high_low';
interface Props {
  language: Language;
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: FilterType;
  setFilterType: (filter: FilterType) => void;
  sortOption: SortType;
  setSortOption: (value: SortType) => void;
  minPrice: number | '';
  setMinPrice: (value: number | '') => void;
  maxPrice: number | '';
  setMaxPrice: (value: number | '') => void;
  onExplore: () => void;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  catalogRef: RefObject<HTMLDivElement | null>;
}
const messages = {
  fr: {
    eyebrow: 'Votre sélection GLOBABOX', heroTitle: 'Les bons produits. Au bon prix.',
    heroText: 'Découvrez des articles utiles pour la maison, la technologie, le quotidien et vos loisirs. Achetez en toute simplicité au Maroc.',
    shop: 'Explorer la boutique', promotions: 'Voir les offres',
    techEyebrow: 'TECH & ACCESSOIRES', tech: 'La technologie au quotidien',
    homeEyebrow: 'MAISON & PRATIQUE', home: 'Des idées pour chaque jour',
    categories: 'Toutes les catégories', categorySubtitle: 'Explorez nos univers',
    offers: 'Offres du moment', offersSubtitle: 'Les produits disponibles à prix intéressants',
    latest: 'Notre catalogue', latestSubtitle: 'Des produits sélectionnés pour vous',
    all: 'Tous les produits', bestseller: 'Meilleures ventes', newest: 'Nouveautés',
    browse: 'Découvrir', order: 'Acheter maintenant', add: 'Ajouter au panier',
    details: 'Voir le produit', from: 'À partir de',
    out: 'Rupture de stock', free: 'Livraison offerte dès 500 DH',
    cod: 'Paiement à la livraison', delivery: 'Livraison au Maroc',
    help: 'Assistance client', noProducts: 'Aucun produit disponible pour cette sélection.',
    reset: 'Voir tous les produits', search: 'Rechercher un produit...',
    sort: 'Trier par', sortNewest: 'Récents', sortLow: 'Prix croissant', sortHigh: 'Prix décroissant',
    min: 'Prix min.', max: 'Prix max.', results: 'produits',
    more: 'Parcourir le catalogue', collection: 'Des sélections pour vous',
    selection: 'Sélection du moment', featured: 'À découvrir', category: 'Catégorie',
    inStock: 'En stock', promo: 'Promo'
  },
  ar: {
    eyebrow: 'اختيارات GLOBABOX', heroTitle: 'منتجات مفيدة. بأثمنة مناسبة.',
    heroText: 'اكتشف منتجات للمنزل، والتكنولوجيا، والاستعمال اليومي والترفيه. تسوق بسهولة في جميع أنحاء المغرب.',
    shop: 'تصفح المتجر', promotions: 'شاهد العروض',
    techEyebrow: 'التكنولوجيا والإكسسوارات', tech: 'تكنولوجيا تسهل حياتك',
    homeEyebrow: 'المنزل والحياة اليومية', home: 'منتجات عملية لكل يوم',
    categories: 'جميع الأقسام', categorySubtitle: 'تصفح حسب الفئة',
    offers: 'عروض مختارة', offersSubtitle: 'منتجات متوفرة بأثمنة مناسبة',
    latest: 'منتجات المتجر', latestSubtitle: 'تشكيلة مختارة من أجلك',
    all: 'جميع المنتجات', bestseller: 'الأكثر مبيعاً', newest: 'وصل حديثاً',
    browse: 'اكتشف', order: 'اشتر الآن', add: 'أضف للسلة',
    details: 'تفاصيل المنتج', from: 'ابتداء من',
    out: 'نفدت الكمية', free: 'توصيل مجاني ابتداء من 500 درهم',
    cod: 'الدفع عند الاستلام', delivery: 'توصيل داخل المغرب',
    help: 'مساعدة الزبناء', noProducts: 'لا توجد منتجات متوفرة في هذا الاختيار حالياً.',
    reset: 'عرض جميع المنتجات', search: 'قلب على شي منتوج...',
    sort: 'ترتيب حسب', sortNewest: 'الأحدث', sortLow: 'الثمن من الأقل', sortHigh: 'الثمن من الأعلى',
    min: 'أقل ثمن', max: 'أعلى ثمن', results: 'منتج',
    more: 'تصفح المنتجات', collection: 'اختيارات تناسبك',
    selection: 'منتجات مختارة', featured: 'اكتشف المزيد', category: 'القسم',
    inStock: 'متوفر', promo: 'تخفيض'
  },
  en: {
    eyebrow: 'GLOBABOX PICKS', heroTitle: 'Useful products. Better value.',
    heroText: 'Explore products for home, technology, everyday essentials and leisure. Shop easily across Morocco.',
    shop: 'Explore the store', promotions: 'See the deals',
    techEyebrow: 'TECH & ACCESSORIES', tech: 'Technology for everyday life',
    homeEyebrow: 'HOME & LIFESTYLE', home: 'Better everyday essentials',
    categories: 'All categories', categorySubtitle: 'Shop by department',
    offers: 'Selected deals', offersSubtitle: 'Available items at attractive prices',
    latest: 'Shop our products', latestSubtitle: 'Curated for you',
    all: 'All products', bestseller: 'Best sellers', newest: 'New arrivals',
    browse: 'Explore', order: 'Buy now', add: 'Add to cart',
    details: 'Product details', from: 'From',
    out: 'Out of stock', free: 'Free shipping from 500 MAD',
    cod: 'Cash on delivery', delivery: 'Delivery in Morocco',
    help: 'Customer support', noProducts: 'No products available in this selection right now.',
    reset: 'View all products', search: 'Search products...',
    sort: 'Sort by', sortNewest: 'Newest', sortLow: 'Lowest price', sortHigh: 'Highest price',
    min: 'Min price', max: 'Max price', results: 'products',
    more: 'Browse catalog', collection: 'Curated collections',
    selection: 'Featured selection', featured: 'Discover more', category: 'Category',
    inStock: 'In stock', promo: 'Deal'
  }
};

function StoreProductCard({ product, language, onViewDetails, onAddToCart, onInstantOrder }: {
  key?: string;
  product: Product; language: Language;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}) {
  const t = messages[language];
  const unavailable = product.inStock === false || product.stockStatus === 'out_of_stock';
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5">
      <button type="button" onClick={() => onViewDetails(product)} className="relative block w-full overflow-hidden bg-slate-50 text-start" aria-label={t.details + ': ' + (product.name[language] || product.name.fr)}>
        <div className="aspect-[1.1/1] w-full">
          <ProductImage src={product.image} fallbackSrc={product.fallbackImage}
            alt={product.name[language] || product.name.fr} language={language}
            loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            containerClassName="h-full w-full" />
        </div>
        {discount > 0 && <span className="absolute start-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-extrabold text-white">-{discount}%</span>}
        {unavailable && <span className="absolute end-3 top-3 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-white">{t.out}</span>}
      </button>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <button type="button" onClick={() => onViewDetails(product)} className="min-h-[3rem] text-start text-sm font-semibold leading-6 text-slate-900 transition-colors hover:text-red-600 line-clamp-2">
          {product.name[language] || product.name.fr}
        </button>
        <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-relaxed text-slate-500">{product.description?.[language] || product.description?.fr || ''}</p>
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-950">{product.price.toLocaleString('fr-MA')} <small className="text-[11px] font-semibold">DH</small></span>
            {discount > 0 && <del className="text-xs text-slate-400">{product.originalPrice?.toLocaleString('fr-MA')} DH</del>}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <button type="button" disabled={unavailable} onClick={() => onInstantOrder(product)} className="min-h-10 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {unavailable ? t.out : t.order}
            </button>
            <button type="button" disabled={unavailable} onClick={() => onAddToCart(product)} aria-label={t.add}
              className="flex min-h-10 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40">
              <ShoppingCart size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BlockTitle({ title, subtitle, language, extra }: { title: string; subtitle: string; language: Language; extra?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-red-600">{subtitle}</p><h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[28px]">{title}</h2></div>
      {extra}
    </div>
  );
}

export default function GeneralStorefront({
  language, products, filteredProducts, categories, selectedCategory, setSelectedCategory,
  searchTerm, setSearchTerm, filterType, setFilterType, sortOption, setSortOption,
  minPrice, setMinPrice, maxPrice, setMaxPrice, onExplore, onViewDetails, onAddToCart,
  onInstantOrder, catalogRef
}: Props) {
  const t = messages[language];
  const [showAllCategories, setShowAllCategories] = useState(false);
  const isHome = !selectedCategory && !searchTerm;
  const activeCategories = useMemo(() => categories.filter(c => (c as Category & {isActive?: boolean}).isActive !== false), [categories]);
  const namedCategory = activeCategories.find(c => c.id === selectedCategory);
  const pickedOffers = useMemo(() => products.filter(p => p.isActive !== false && p.inStock !== false && p.stockStatus !== 'out_of_stock' && !!p.originalPrice && p.originalPrice > p.price).slice(0, 4), [products]);
  const selectedCategories = showAllCategories ? activeCategories : activeCategories.slice(0, 10);
  const changeCategory = (id: string) => {
    setSelectedCategory(id);
    setShowAllCategories(false);
    window.requestAnimationFrame(() => onExplore());
  };
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setFilterType('all');
    setMinPrice('');
    setMaxPrice('');
  };
  return (
    <div className="bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isHome && (
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8" aria-label={t.selection}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.55fr_1fr] lg:gap-4">
            <div className="relative flex min-h-[365px] items-center overflow-hidden rounded-3xl bg-[#111c31] sm:min-h-[410px]">
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1300&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/15" />
              <div className="relative z-10 max-w-xl px-7 py-12 text-start sm:px-11">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white"><Sparkles size={14} /> {t.eyebrow}</p>
                <h1 className="max-w-lg text-3xl font-black leading-[1.17] tracking-tight text-white sm:text-5xl">{t.heroTitle}</h1>
                <p className="mt-5 max-w-md text-sm leading-7 text-slate-200 sm:text-base">{t.heroText}</p>
                <button type="button" onClick={onExplore} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-red-700">
                  {t.shop} {language === 'ar' ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
              <button type="button" onClick={() => changeCategory('electronique')} className="relative flex min-h-[192px] overflow-hidden rounded-3xl bg-[#e7f2fa] text-start">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85" alt="" className="absolute bottom-0 end-0 h-full w-2/3 object-cover opacity-85" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#e7f2fa] via-[#e7f2fa]/90 to-transparent" />
                <span className="relative z-10 flex max-w-[70%] flex-col items-start justify-center gap-2 p-6"><span className="text-[10px] font-extrabold tracking-widest text-blue-800">{t.techEyebrow}</span><strong className="text-xl font-black leading-tight text-slate-900">{t.tech}</strong><span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blue-800">{t.browse}<ArrowUpRight size={13}/></span></span>
              </button>
              <button type="button" onClick={() => changeCategory('maison')} className="relative flex min-h-[192px] overflow-hidden rounded-3xl bg-[#f5efe6] text-start">
                <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=700&q=85" alt="" className="absolute bottom-0 end-0 h-full w-2/3 object-cover opacity-80" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#f5efe6] via-[#f5efe6]/90 to-transparent" />
                <span className="relative z-10 flex max-w-[72%] flex-col items-start justify-center gap-2 p-6"><span className="text-[10px] font-extrabold tracking-widest text-amber-800">{t.homeEyebrow}</span><strong className="text-xl font-black leading-tight text-slate-900">{t.home}</strong><span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-900">{t.browse}<ArrowUpRight size={13}/></span></span>
              </button>
            </div>
          </div>
        </section>
      )}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8" aria-label={t.categories}>
        <BlockTitle title={t.categories} subtitle={t.categorySubtitle} language={language} extra={
          activeCategories.length > 10 ?
            <button type="button" onClick={() => setShowAllCategories(v => !v)} className="flex items-center gap-1 text-xs font-bold text-red-600">{showAllCategories ? t.browse : t.categories}<ChevronDown size={16}/></button> : undefined
        } />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
          {selectedCategories.map(cat => (
            <button type="button" key={cat.id} onClick={() => changeCategory(cat.id)} aria-pressed={selectedCategory === cat.id}
              className={'group min-w-0 rounded-xl border p-2.5 text-center transition-all hover:border-red-300 hover:shadow-md ' + (selectedCategory === cat.id ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-slate-50/60')}>
              <span className="mx-auto mb-2 block aspect-square w-full overflow-hidden rounded-lg bg-white"><img loading="lazy" src={cat.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" /></span>
              <span className="block line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-slate-800">{cat.name[language] || cat.name.fr}</span>
            </button>
          ))}
        </div>
      </section>
      {isHome && pickedOffers.length > 0 && (
        <section className="border-y border-slate-100 bg-[#fbfbfc] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BlockTitle title={t.offers} subtitle={t.offersSubtitle} language={language} extra={<button type="button" onClick={onExplore} className="inline-flex items-center gap-2 text-sm font-bold text-red-600">{t.more}<ArrowUpRight size={16}/></button>} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
              {pickedOffers.map(product => <StoreProductCard key={product.id} product={product} language={language} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onInstantOrder={onInstantOrder} />)}
            </div>
          </div>
        </section>
      )}
      <section ref={catalogRef} id="globabox-catalog" className="mx-auto max-w-7xl scroll-mt-36 px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <BlockTitle title={namedCategory ? (namedCategory.name[language] || namedCategory.name.fr) : t.latest} subtitle={t.latestSubtitle} language={language} />
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(['all','bestsellers','newarrivals'] as const).map(option => <button key={option} type="button" onClick={() => setFilterType(option)}
              className={'min-h-9 rounded-lg px-3 text-xs font-bold transition-colors ' + (filterType === option ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900')}>
              {option === 'all' ? t.all : option === 'bestsellers' ? t.bestseller : t.newest}
            </button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[190px] flex-1 sm:max-w-[260px]">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t.search} aria-label={t.search}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 ps-9 pe-3 text-xs outline-none focus:border-red-500" />
            </div>
            <select value={sortOption} onChange={e => setSortOption(e.target.value as SortType)} aria-label={t.sort} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-red-500">
              <option value="newest">{t.sortNewest}</option><option value="price_low_high">{t.sortLow}</option><option value="price_high_low">{t.sortHigh}</option>
            </select>
          </div>
        </div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">{filteredProducts.length} {t.results}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <SlidersHorizontal size={14} />
            <input type="number" min={0} value={minPrice} onChange={e => setMinPrice(e.target.value ? Math.max(0, Number(e.target.value)) : '')} placeholder={t.min} aria-label={t.min} className="w-24 rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-red-500" />
            <span>–</span>
            <input type="number" min={0} value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Math.max(0, Number(e.target.value)) : '')} placeholder={t.max} aria-label={t.max} className="w-24 rounded-lg border border-slate-200 px-2 py-2 outline-none focus:border-red-500" />
            <span>DH</span>
          </div>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {filteredProducts.map(product => <StoreProductCard key={product.id} product={product} language={language} onViewDetails={onViewDetails} onAddToCart={onAddToCart} onInstantOrder={onInstantOrder} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <ShoppingBag size={34} className="mb-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">{t.noProducts}</h3>
            <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700">{t.reset}</button>
          </div>
        )}
      </section>
      <section className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[{Icon:Truck,title:t.delivery,detail:t.free},{Icon:CreditCard,title:t.cod,detail:t.cod},{Icon:ShieldCheck,title:t.collection,detail:t.selection},{Icon:Headphones,title:t.help,detail:t.help}].map(({Icon,title,detail},i) =>
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><Icon size={22}/></span><div><p className="text-sm font-extrabold text-slate-900">{title}</p><p className="mt-0.5 text-xs text-slate-500">{detail}</p></div></div>)}
        </div>
      </section>
    </div>
  );
}
