import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpLeft, Banknote, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import type { Language, Category } from '../types';
import { STORE_DEPARTMENTS } from '../storefrontDepartments';

interface Props {
  language: Language;
  categories: Category[];
  onShopAll: () => void;
  onSelectDepartment: (id: string) => void;
}

type SlideCopy = { eyebrow: string; title: string; description: string; primary: string; secondary: string; collection: string };
type Slide = { id: string; categories: string[]; copy: Record<Language, SlideCopy> };

const slides: Slide[] = [
  {
    id: 'home',
    categories: ['maison', 'cuisine', 'eclairage', 'entretien'],
    copy: {
      fr: { eyebrow: 'GLOBABOX · LE SHOPPING EN TOUTE SIMPLICITÉ', title: 'De belles idées pour chaque espace de votre maison.', description: 'Découvrez des essentiels pour la maison, la cuisine et le quotidien. Des univers à explorer, une expérience simple et des prix affichés clairement.', primary: 'Explorer la boutique', secondary: 'Voir la maison', collection: 'L’univers maison' },
      ar: { eyebrow: 'GLOBABOX · تسوق أسهل كل يوم', title: 'أفكار جميلة لكل ركن في منزلك.', description: 'اكتشف اختيارات متنوعة للمنزل والمطبخ والحياة اليومية، مع تجربة تسوق سهلة وأثمنة واضحة.', primary: 'اكتشف المتجر', secondary: 'تسوق المنزل', collection: 'عالم المنزل' },
      en: { eyebrow: 'GLOBABOX · SHOP WITH EASE', title: 'Fresh finds for every corner of your home.', description: 'Explore useful home, kitchen and everyday essentials in a simple store experience with clear prices.', primary: 'Explore the store', secondary: 'Shop home', collection: 'The home edit' }
    }
  },
  {
    id: 'tech',
    categories: ['technologie', 'beaute', 'mode', 'bureau'],
    copy: {
      fr: { eyebrow: 'TECHNOLOGIE · BEAUTÉ · STYLE', title: 'Les accessoires qui font la différence.', description: 'Parcourez nos univers technologie, beauté, mode et bureau pour trouver les accessoires utiles à votre quotidien.', primary: 'Découvrir les produits', secondary: 'Explorer la technologie', collection: 'Tech & lifestyle' },
      ar: { eyebrow: 'التكنولوجيا · الجمال · الأناقة', title: 'إكسسوارات صغيرة بتأثير كبير.', description: 'تصفح أقسام التكنولوجيا والجمال والموضة والمكتب واكتشف منتجات مفيدة لحياتك اليومية.', primary: 'اكتشف المنتجات', secondary: 'قسم التكنولوجيا', collection: 'التكنولوجيا ونمط الحياة' },
      en: { eyebrow: 'TECH · BEAUTY · STYLE', title: 'Smart accessories. Everyday inspiration.', description: 'Browse technology, beauty, fashion and office essentials selected for everyday use.', primary: 'Discover products', secondary: 'Explore technology', collection: 'Tech & lifestyle' }
    }
  },
  {
    id: 'family',
    categories: ['automobile', 'sport_loisirs', 'enfants', 'animaux'],
    copy: {
      fr: { eyebrow: 'AUTO · SPORT · FAMILLE', title: 'Prêt pour toutes vos envies et aventures.', description: 'Des accessoires auto aux loisirs et aux essentiels de la famille, explorez les catégories qui vous ressemblent.', primary: 'Voir tous les produits', secondary: 'Explorer le sport', collection: 'Pour vos activités' },
      ar: { eyebrow: 'السيارات · الرياضة · العائلة', title: 'استعد لكل نشاط ومغامرة.', description: 'من إكسسوارات السيارات إلى الرياضة ومستلزمات العائلة، اكتشف الأقسام التي تناسب احتياجاتك.', primary: 'شاهد جميع المنتجات', secondary: 'اكتشف الرياضة', collection: 'لعالمك وأنشطتك' },
      en: { eyebrow: 'AUTO · SPORT · FAMILY', title: 'Ready for the things you love to do.', description: 'From car accessories to sports, leisure and family essentials, explore collections made for everyday life.', primary: 'Shop all products', secondary: 'Explore sports', collection: 'For your everyday' }
    }
  },
  {
    id: 'discover',
    categories: ['jardin', 'bureau', 'animaux', 'eclairage'],
    copy: {
      fr: { eyebrow: 'JARDIN · BUREAU · ANIMAUX', title: 'Encore plus d’univers à découvrir.', description: 'Inspirez-vous, explorez de nouvelles catégories et trouvez facilement les produits qui vous facilitent la vie.', primary: 'Parcourir la boutique', secondary: 'Explorer le jardin', collection: 'À découvrir aussi' },
      ar: { eyebrow: 'الحديقة · المكتب · الحيوانات', title: 'عوالم أخرى تستحق الاكتشاف.', description: 'اكتشف أقساماً متنوعة ومنتجات عملية تساعدك في تفاصيل الحياة اليومية.', primary: 'تصفح المتجر', secondary: 'اكتشف الحديقة', collection: 'اكتشف المزيد' },
      en: { eyebrow: 'GARDEN · OFFICE · PETS', title: 'There is always something more to discover.', description: 'Explore more categories and find practical products that make everyday moments easier.', primary: 'Browse the store', secondary: 'Explore garden', collection: 'More to explore' }
    }
  }
];

export default function HomeBannerSlider({ language, categories, onShopAll, onSelectDepartment }: Props) {
  const [active, setActive] = useState(0);
  const rtl = language === 'ar';

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 6200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];
  const copy = slide.copy[language] || slide.copy.fr;
  const go = (id?: string) => id ? onSelectDepartment(id) : onShopAll();
  const categoryData = slide.categories.map(id => {
    const category = categories.find(item => item.id === id) || STORE_DEPARTMENTS.find(item => item.id === id);
    return category ? { id, category } : null;
  }).filter((item): item is { id: string; category: Category } => Boolean(item));

  return (
    <section className="w-full px-3 pb-5 pt-5 sm:px-5 lg:px-8 lg:pb-7" dir={rtl ? 'rtl' : 'ltr'} aria-label="GLOBABOX featured collections">
      <div className="relative isolate mx-auto max-w-[1680px] overflow-hidden rounded-[28px] bg-[#102f2a] shadow-[0_22px_65px_rgba(15,55,45,.16)] sm:rounded-[34px]">
        <div className="pointer-events-none absolute -start-28 -top-32 h-96 w-96 rounded-full bg-[#d6ae52]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 end-1/4 h-96 w-96 rounded-full bg-[#5ba18a]/20 blur-3xl" />
        <div key={slide.id} className="relative grid min-h-[620px] grid-cols-1 items-center gap-8 px-5 py-7 sm:px-8 sm:py-9 lg:min-h-[570px] lg:grid-cols-[.88fr_1.12fr] lg:gap-10 lg:px-12 lg:py-10 xl:px-16">
          <div className="relative z-10 max-w-[620px] self-center text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-extrabold tracking-[.13em] text-[#f5d77e] shadow-sm sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#f5d77e] shadow-[0_0_12px_rgba(245,215,126,.8)]" />
              {copy.eyebrow}
            </div>
            <h1 className="max-w-[650px] text-[34px] font-black leading-[1.12] tracking-[-.035em] sm:text-5xl lg:text-[54px] xl:text-[62px]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-[530px] text-sm leading-7 text-white/75 sm:text-base sm:leading-8">{copy.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={onShopAll} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#f2cf70] px-5 py-3 text-sm font-extrabold text-[#173a32] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#ffdf8c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <ShoppingBag size={18} />{copy.primary}<ArrowDownRight size={17} className={rtl ? 'rotate-90' : ''}/>
              </button>
              <button type="button" onClick={() => go(slide.categories[0])} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/60 hover:bg-white/10">
                {copy.secondary}<ArrowUpLeft size={17} className={rtl ? 'rotate-180' : ''}/>
              </button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-white/65">
              <span className="flex items-center gap-2"><Truck size={15}/>{rtl ? 'توصيل داخل المغرب' : language === 'en' ? 'Delivery across Morocco' : 'Livraison au Maroc'}</span>
              <span className="flex items-center gap-2"><Banknote size={15}/>{rtl ? 'الدفع عند الاستلام' : language === 'en' ? 'Cash on delivery' : 'Paiement à la livraison'}</span>
            </div>
          </div>

          <div className="relative min-w-0 self-stretch">
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-white/60 sm:text-xs">
              <span>{copy.collection}</span>
              <span>{String(active + 1).padStart(2, '0')} <span className="text-white/35">/ {String(slides.length).padStart(2, '0')}</span></span>
            </div>
            <div className="grid h-[390px] grid-cols-2 grid-rows-3 gap-3 sm:h-[440px] sm:gap-4 lg:h-full lg:min-h-[440px]">
              {categoryData.map(({ id, category }, index) => (
                <a key={id} href={'/?category=' + encodeURIComponent(id)}
                  onClick={event => { if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); go(id); }}
                  aria-label={category.name[language] || category.name.fr}
                  className={'group relative isolate min-h-0 overflow-hidden rounded-[20px] border border-white/20 bg-[#244d43] shadow-[0_12px_30px_rgba(0,0,0,.22)] transition duration-500 hover:-translate-y-1 hover:border-white/50 hover:shadow-2xl sm:rounded-[24px] ' + (index === 0 ? 'row-span-3' : 'row-span-1')}>
                  <img src={category.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                  <span className="absolute inset-0 bg-gradient-to-t from-[#081d18]/90 via-[#081d18]/15 to-transparent"/>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white sm:p-4">
                    <span className="text-sm font-extrabold leading-snug drop-shadow sm:text-base">{category.name[language] || category.name.fr}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur transition group-hover:bg-[#f2cf70] group-hover:text-[#173a32]"><ArrowUpLeft size={16} className={rtl ? 'rotate-180' : ''}/></span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-white/10" aria-hidden="true">
          <div key={active} className="h-full w-full origin-left bg-[#f2cf70] animate-globabox-progress" />
        </div>
      </div>
      <div className="mx-auto mt-4 grid max-w-[1680px] grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e5eee8] bg-white px-4 py-3 text-xs font-bold text-[#234b40] shadow-[0_3px_15px_rgba(18,55,43,.035)]"><Truck size={19}/>{rtl ? 'التوصيل داخل المغرب' : language === 'en' ? 'Delivery across Morocco' : 'Livraison au Maroc'}</div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#e5eee8] bg-white px-4 py-3 text-xs font-bold text-[#234b40] shadow-[0_3px_15px_rgba(18,55,43,.035)]"><Banknote size={19}/>{rtl ? 'الدفع عند الاستلام' : language === 'en' ? 'Cash on delivery' : 'Paiement à la livraison'}</div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#e5eee8] bg-white px-4 py-3 text-xs font-bold text-[#234b40] shadow-[0_3px_15px_rgba(18,55,43,.035)]"><PackageCheck size={19}/>{rtl ? 'مصاريف التوصيل واضحة' : language === 'en' ? 'Clear delivery fees' : 'Frais de livraison clairs'}</div>
      </div>
    </section>
  );
}
