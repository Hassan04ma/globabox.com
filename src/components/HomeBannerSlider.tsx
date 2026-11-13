
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Banknote, ChevronLeft, ChevronRight, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import type { Language } from '../types';
import { STORE_DEPARTMENTS } from '../storefrontDepartments';

interface Props { language:Language; onShopAll:()=>void; onSelectDepartment:(id:string)=>void; }
type Text = {tag:string;title:string;description:string;button:string;all:string;discover:string};
type Slide = {id:string;destination:string|null;categories:string[];theme:'dark'|'light'|'blue';copy:Record<Language,Text>};

const slides:Slide[]=[
 {id:'globabox',destination:null,categories:['maison','cuisine','technologie','beaute'],theme:'dark',copy:{
   fr:{tag:'GLOBABOX · BOUTIQUE MULTI-CATÉGORIES AU MAROC',title:'Un seul magasin. Plein de découvertes.',description:'Maison, cuisine, technologie, beauté, mode et accessoires : explorez nos rayons pour tous les besoins du quotidien.',button:'Voir tous les produits',all:'Maison & décoration',discover:'Nos univers'},
   ar:{tag:'GLOBABOX · متجر إلكتروني عام بالمغرب',title:'متجر واحد، واختيارات كثيرة.',description:'المنزل، المطبخ، الإلكترونيات، الجمال، الموضة والإكسسوارات. أقسام متنوعة لكل الاحتياجات اليومية.',button:'جميع المنتجات',all:'المنزل والديكور',discover:'اكتشف الأقسام'},
   en:{tag:'GLOBABOX · YOUR MOROCCAN MULTI-CATEGORY STORE',title:'One store. So many useful finds.',description:'Home, kitchen, electronics, beauty, fashion and accessories. Explore everyday essentials all in one place.',button:'Shop all products',all:'Home & decor',discover:'Explore departments'}
 }},
 {id:'home',destination:'maison',categories:['maison','cuisine','eclairage','entretien'],theme:'light',copy:{
   fr:{tag:'MAISON · CUISINE · DÉCORATION',title:'Tout pour la maison et la cuisine.',description:'Organisation, ustensiles, éclairage, nettoyage : découvrez des catégories pour aménager chaque pièce.',button:'Découvrir la maison',all:'Tous les produits',discover:'Univers Maison'},
   ar:{tag:'المنزل · المطبخ · الديكور',title:'كل ما يخص المنزل والمطبخ.',description:'التنظيم، أواني المطبخ، الإنارة والتنظيف: اكتشف أقسام كتعاونك تجهز كل ركن فالدار.',button:'تصفح قسم المنزل',all:'جميع المنتجات',discover:'عالم المنزل'},
   en:{tag:'HOME · KITCHEN · DECOR',title:'Everyday ideas for your home.',description:'Explore kitchen essentials, storage, lighting and cleaning accessories for a practical home.',button:'Explore home',all:'All products',discover:'Home departments'}
 }},
 {id:'lifestyle',destination:'technologie',categories:['technologie','beaute','automobile','mode'],theme:'blue',copy:{
   fr:{tag:'TECH · BEAUTÉ · ACCESSOIRES',title:'Les essentiels tech et lifestyle.',description:'Électronique, soin personnel, accessoires auto et mode : trouvez facilement le rayon qui vous convient.',button:'Découvrir la technologie',all:'Tous les produits',discover:'Nos sélections'},
   ar:{tag:'التكنولوجيا · الجمال · الإكسسوارات',title:'التكنولوجيا والإكسسوارات فمتجر واحد.',description:'الإلكترونيات، العناية الشخصية، لوازم السيارات والموضة: تصفح الأقسام حسب احتياجاتك.',button:'تصفح الإلكترونيات',all:'جميع المنتجات',discover:'اختيارات متنوعة'},
   en:{tag:'TECH · BEAUTY · ACCESSORIES',title:'Smart everyday accessories.',description:'Discover electronics, personal care, auto accessories and fashion across our departments.',button:'Explore electronics',all:'All products',discover:'Lifestyle departments'}
 }}
];

const appearance={
 dark:{bg:'bg-[#103e35] border-[#235f51]',text:'text-white',sub:'text-white/80',tag:'bg-white/10 text-[#f4c75a] border-white/20',primary:'bg-[#f4c75a] text-[#153d35] hover:bg-yellow-300',secondary:'border-white/40 text-white hover:bg-white/10',hint:'text-white/70'},
 light:{bg:'bg-[#f8f3e7] border-[#e7e0ce]',text:'text-[#193e38]',sub:'text-[#52645d]',tag:'bg-white/70 text-[#856227] border-[#dbc79b]',primary:'bg-[#104d43] text-white hover:bg-[#0c3831]',secondary:'border-[#93b1a4] text-[#104d43] hover:bg-white',hint:'text-[#4b6459]'},
 blue:{bg:'bg-[#1b3947] border-[#244c5d]',text:'text-white',sub:'text-white/80',tag:'bg-white/10 text-[#f4c75a] border-white/20',primary:'bg-[#f4c75a] text-[#153d35] hover:bg-yellow-300',secondary:'border-white/40 text-white hover:bg-white/10',hint:'text-white/70'}
} as const;

export default function HomeBannerSlider({language,onShopAll,onSelectDepartment}:Props){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{
   if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),7200);
   return ()=>window.clearInterval(timer);
 },[paused]);
 const slide=slides[active],c=slide.copy[language],palette=appearance[slide.theme];
 const rtl=language==='ar';
 const go=(id:string|null)=>id?onSelectDepartment(id):onShopAll();
 return <section className="w-full max-w-none px-4 pb-4 pt-6 sm:px-6 lg:px-8 2xl:px-10" dir={rtl?'rtl':'ltr'} aria-label={rtl?'عروض المتجر':'Découvrir GLOBABOX'}>
  <div className={'relative isolate overflow-hidden rounded-[26px] border shadow-[0_10px_35px_rgba(16,50,43,.08)] '+palette.bg}
    onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
    onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false);}}>
   <div className="relative grid min-h-[530px] items-center gap-8 px-6 pb-[88px] pt-10 sm:px-10 lg:min-h-[500px] lg:grid-cols-2 lg:gap-10 lg:px-12 lg:pt-8 2xl:gap-16 2xl:px-16">
    <div className="max-w-[700px]">
     <p className={'mb-5 inline-flex max-w-full rounded-full border px-4 py-2 text-[10px] font-extrabold leading-5 tracking-[.08em] sm:text-xs '+palette.tag}>{c.tag}</p>
     <h1 className={'max-w-[700px] text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl 2xl:text-[56px] '+palette.text}>{c.title}</h1>
     <p className={'mt-5 max-w-[590px] text-sm leading-7 sm:text-base sm:leading-8 '+palette.sub}>{c.description}</p>
     <div className="mt-8 flex flex-wrap gap-3">
       <button type="button" onClick={()=>go(slide.destination)} className={'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold shadow-sm transition '+palette.primary}><ShoppingBag size={18}/>{c.button}{rtl?<ArrowLeft size={16}/>:<ArrowRight size={16}/>}</button>
       <button type="button" onClick={()=>slide.destination?onShopAll():go('maison')} className={'inline-flex min-h-12 items-center justify-center rounded-xl border px-5 text-sm font-bold transition '+palette.secondary}>{c.all}</button>
     </div>
    </div>
    <div className="relative">
      <div className="mb-3 flex items-center justify-between"><span className={'text-[11px] font-extrabold tracking-widest '+palette.hint}>{c.discover}</span><span className={'text-[11px] font-semibold '+palette.hint}>{active+1} / {slides.length}</span></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
       {slide.categories.map((id,index)=>{
        const cat=STORE_DEPARTMENTS.find(d=>d.id===id);
        if(!cat)return null;
        return <button key={id} type="button" onClick={()=>go(id)} aria-label={cat.name[language]} className="group relative min-h-[138px] overflow-hidden rounded-[19px] border-2 border-white/75 bg-white text-start shadow-[0_7px_18px_rgba(0,0,0,.15)] transition hover:-translate-y-1 hover:shadow-xl sm:min-h-[168px] lg:min-h-[176px]">
         <img src={cat.image} loading={index<2?'eager':'lazy'} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"/>
         <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102b26]/95 via-[#102b26]/75 to-transparent px-3 pb-3 pt-10 text-[12px] font-extrabold leading-5 text-white sm:px-4 sm:pb-4 sm:text-sm">{cat.name[language]}</span>
        </button>;
       })}
      </div>
    </div>
   </div>
   <div className="absolute bottom-5 inset-x-6 z-10 flex items-center justify-between sm:inset-x-10 lg:inset-x-12 2xl:inset-x-16">
      <div className="flex gap-2" role="group" aria-label="Slides">
        {slides.map((s,i)=><button key={s.id} type="button" onClick={()=>setActive(i)} aria-current={active===i?'true':undefined} aria-label={(rtl?'السلايد ':'Slide ')+(i+1)} className={'h-2 rounded-full transition-all '+(active===i?'w-10 bg-[#f4c75a]':'w-5 bg-slate-400/60 hover:bg-[#f4c75a]/80')}/>)}
      </div>
      <div className="flex gap-2">
       <button type="button" onClick={()=>setActive(i=>(i+slides.length-1)%slides.length)} aria-label={rtl?'السلايد السابق':'Previous slide'} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-[#104d43] shadow-sm transition hover:bg-[#f4c75a]"><ChevronLeft size={21}/></button>
       <button type="button" onClick={()=>setActive(i=>(i+1)%slides.length)} aria-label={rtl?'السلايد التالي':'Next slide'} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-[#104d43] shadow-sm transition hover:bg-[#f4c75a]"><ChevronRight size={21}/></button>
      </div>
   </div>
  </div>
  <div className="grid grid-cols-1 gap-3 pt-4 text-xs font-bold text-[#21463e] sm:grid-cols-3">
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f5f8f5] px-5 py-3"><Truck size={18}/>{rtl?'التوصيل داخل المغرب':language==='en'?'Delivery in Morocco':'Livraison au Maroc'}</div>
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f5f8f5] px-5 py-3"><Banknote size={18}/>{rtl?'الدفع عند الاستلام':language==='en'?'Cash on delivery':'Paiement à la livraison'}</div>
    <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f5f8f5] px-5 py-3"><PackageCheck size={18}/>{rtl?'ثمن التوصيل واضح قبل التأكيد':language==='en'?'Shipping fee shown before checkout':'Frais affichés avant validation'}</div>
  </div>
 </section>;
}
