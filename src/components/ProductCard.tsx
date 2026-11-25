import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import ProductImage from './ProductImage';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function ProductCard({ product, language, onViewDetails }: ProductCardProps) {
  const isRtl = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article id={`product-card-${product.id}`} dir={isRtl ? 'rtl' : 'ltr'}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#e8eee9] bg-white shadow-[0_3px_16px_rgba(20,55,43,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#c6d9cd] hover:shadow-[0_16px_35px_rgba(20,55,43,.12)]">
      <button type="button" onClick={() => onViewDetails(product)}
        aria-label={`${t('btnViewingProduct')}: ${product.name[language] || product.name.fr || ''}`}
        className="relative block w-full overflow-hidden bg-[#f8faf8] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#104d43]">
        <div className="aspect-square w-full overflow-hidden p-2 sm:p-3">
          <ProductImage src={product.image} fallbackSrc={product.fallbackImage}
            alt={product.name[language] || product.name.fr || 'GLOBABOX product'} loading="lazy"
            language={language} className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.045]"
            containerClassName="h-full w-full"/>
        </div>
        {discountPercent > 0 && <span className="absolute start-3 top-3 rounded-full bg-[#b94735] px-3 py-1.5 text-[10px] font-black tracking-wide text-white shadow-sm">-{discountPercent}%</span>}
        <span className="absolute bottom-3 end-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/95 text-[#17483c] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17}/></span>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <button type="button" onClick={() => onViewDetails(product)}
          className="min-h-[2.7rem] text-start text-[13px] font-semibold leading-5 text-[#263d35] line-clamp-2 transition-colors hover:text-[#0e5949] focus-visible:outline-none focus-visible:underline sm:text-sm">
          {product.name[language] || product.name.fr}
        </button>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-[#edf1ed] pt-3">
          <span className="text-lg font-black tracking-tight text-[#123f34] sm:text-xl">{product.price.toLocaleString('fr-MA')} <small className="text-[11px] font-bold">DH</small></span>
          {discountPercent > 0 && product.originalPrice && <del className="text-xs font-medium text-slate-400">{product.originalPrice.toLocaleString('fr-MA')} DH</del>}
        </div>
        <button type="button" onClick={() => onViewDetails(product)}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#edf5ef] px-3 py-2 text-xs font-extrabold text-[#17483c] transition-colors hover:bg-[#104d43] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#104d43] focus-visible:ring-offset-2">
          <ShoppingBag size={15}/>{language === 'ar' ? 'اكتشف المنتج' : language === 'en' ? 'View product' : 'Voir le produit'}
        </button>
      </div>
    </article>
  );
}
