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
    <article
      id={`product-card-${product.id}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10"
    >
      <button
        type="button"
        onClick={() => onViewDetails(product)}
        aria-label={`${t('btnViewingProduct')}: ${product.name[language] || product.name.fr || ''}`}
        className="relative block w-full overflow-hidden bg-slate-50 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
      >
        <div className="aspect-[4/3] w-full overflow-hidden">
          <ProductImage
            src={product.image}
            fallbackSrc={product.fallbackImage}
            alt={product.name[language] || product.name.fr || 'GLOBABOX product'}
            loading="lazy"
            language={language}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            containerClassName="h-full w-full"
          />
        </div>
        {discountPercent > 0 && (
          <span className="absolute start-3 top-3 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="min-h-[2.75rem] text-start text-sm font-semibold leading-6 text-slate-900 line-clamp-2 transition-colors hover:text-[#104d43] focus-visible:outline-none focus-visible:underline"
        >
          {product.name[language] || product.name.fr}
        </button>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-slate-100 pt-3">
          <span className="text-xl font-extrabold tracking-tight text-[#193e38]">
            {product.price.toLocaleString('fr-MA')} <small className="text-xs font-semibold">DH</small>
          </span>
          {discountPercent > 0 && product.originalPrice && (
            <del className="text-sm font-medium text-slate-400">
              {product.originalPrice.toLocaleString('fr-MA')} DH
            </del>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#dce9e1] bg-white px-3 py-2 text-xs font-bold text-[#104d43] transition-colors hover:border-[#104d43] hover:bg-[#104d43] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#104d43] focus-visible:ring-offset-2"
        >
          {language === 'ar' ? 'عرض تفاصيل المنتج' : language === 'en' ? 'View product details' : 'Voir le produit'}
        </button>
      </div>
    </article>
  );
}
