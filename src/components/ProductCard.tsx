import { Product, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import ProductImage from './ProductImage';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function ProductCard({ product, language, onViewDetails, onAddToCart }: ProductCardProps) {
  const isRtl = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article id={'product-card-'+product.id} dir={isRtl?'rtl':'ltr'}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe0d8] hover:shadow-[0_14px_36px_rgba(16,77,67,.12)]">
      <button type="button" onClick={()=>onViewDetails(product)} aria-label={t('btnViewingProduct')+': '+(product.name[language]||product.name.fr||'')}
        className="relative block w-full overflow-hidden bg-[#f7f8f7] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#104d43]">
        <div className="aspect-[1/1] w-full overflow-hidden">
          <ProductImage src={product.image} fallbackSrc={product.fallbackImage} alt={product.name[language]||product.name.fr||'GLOBABOX product'}
            loading="lazy" language={language} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" containerClassName="h-full w-full"/>
        </div>
        {discountPercent>0 && <span className="absolute start-3 top-3 rounded-full bg-[#104d43] px-2.5 py-1.5 text-[10px] font-black text-white">-{discountPercent}%</span>}
      </button>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
        <button type="button" onClick={()=>onViewDetails(product)} className="min-h-[2.8rem] text-start text-sm font-bold leading-5 text-[#193e38] line-clamp-2 hover:text-[#104d43]">
          {product.name[language]||product.name.fr}
        </button>
        <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <span className="text-xl font-black tracking-tight text-[#104d43]">{product.price.toLocaleString('fr-MA')} <small className="text-[11px] font-bold">DH</small></span>
            {discountPercent>0&&product.originalPrice&&<del className="ms-2 text-xs font-medium text-slate-400">{product.originalPrice.toLocaleString('fr-MA')} DH</del>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={()=>onViewDetails(product)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-extrabold text-slate-700 hover:border-[#104d43] hover:text-[#104d43]">
            <Eye size={15}/>{language==='ar'?'التفاصيل':language==='en'?'Details':'Détails'}
          </button>
          <button type="button" onClick={()=>onAddToCart(product)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#104d43] px-2 text-[11px] font-extrabold text-white hover:bg-[#0b3931]">
            <ShoppingCart size={15}/>{language==='ar'?'أضف للسلة':language==='en'?'Add to cart':'Ajouter'}
          </button>
        </div>
      </div>
    </article>
  );
}
