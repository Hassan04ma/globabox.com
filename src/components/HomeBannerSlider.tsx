
import { useEffect, useState } from 'react';
import { ArrowDown, Banknote, ChevronLeft, ChevronRight, PackageCheck, Pause, Play, ShoppingBag, Truck } from 'lucide-react';
import type { Language, Category } from '../types';
import { STORE_DEPARTMENTS } from '../storefrontDepartments';

interface Props { language:Language; categories:Category[]; onShopAll:()=>void; onSelectDepartment:(id:string)=>void; }
type Text = {tag:string;title:string;description:string;button:string;all:string;discover:string};
type Slide = {id:string;destination:string|null;categories:string[];theme:'dark'|'light'|'blue';copy:Record<Language,Text>};


/**
 * Each of the 13 public departments appears in exactly one slide.
 * The images below represent categories, not products or offers.
 */
const slides: Slide[] = [
 {id:'home',destination:null,categories:['maison','cuisine','eclairage','entretien'],theme:'dark',copy:{
   fr:{tag:'GLOBABOX · BOUTIQUE MULTI-CATÉGORIES AU MAROC',title:'Maison, cuisine & vie quotidienne.',description:'Découvrez notre boutique en ligne : maison et décoration, cuisine, éclairage et entretien. Chaque image mène directement à son rayon.',button:'Tous les produits',all:'Découvrir la maison',discover:'Rayons maison'},
   ar:{tag:'GLOBABOX · متجر إلكتروني عام بالمغرب',title:'منتجات المنزل والمطبخ والحياة اليومية.',description:'جلوبابوكس متجر عام فيه المنزل والديكور، المطبخ، الإنارة والتنظيف. كل صورة كتوصلك مباشرة للقسم ديالها.',button:'جميع المنتجات',all:'قسم المنزل',discover:'أقسام المنزل'},
   en:{tag:'GLOBABOX · MULTI-CATEGORY ONLINE STORE',title:'Everything for home and everyday living.',description:'Discover home decor, kitchen essentials, lighting and cleaning. Select any category image to explore its products.',button:'All products',all:'Explore home',discover:'Home categories'}
 }},
 {id:'tech',destination:null,categories:['technologie','beaute','mode'],theme:'light',copy:{
   fr:{tag:'ÉLECTRONIQUE · BEAUTÉ · MODE',title:'Tech, beauté et accessoires.',description:'Des catégories pour les achats du quotidien : électronique, soin et mode. Choisissez une image pour ouvrir le bon rayon.',button:'Tous les produits',all:'Explorer la technologie',discover:'Rayons tech & lifestyle'},
   ar:{tag:'الإلكترونيات · الجمال · الموضة',title:'التكنولوجيا، الجمال والإكسسوارات.',description:'من الأجهزة والإلكترونيات للعناية الشخصية والموضة. ضغط على الصورة باش تمشي مباشرة للتصنيف.',button:'جميع المنتجات',all:'قسم الإلكترونيات',discover:'أقسام متنوعة'},
   en:{tag:'ELECTRONICS · BEAUTY · FASHION',title:'Technology, beauty and style.',description:'Discover electronics, personal care and fashion. Every category image takes you directly to its product listings.',button:'All products',all:'Explore electronics',discover:'Tech & lifestyle categories'}
 }},
 {id:'family',destination:null,categories:['automobile','sport_loisirs','enfants'],theme:'blue',copy:{
   fr:{tag:'AUTO · SPORT · ENFANTS',title:'Des trouvailles pour toutes vos activités.',description:'Explorez les accessoires automobiles, le sport et les articles pour les enfants. Un clic sur une image ouvre sa catégorie.',button:'Tous les produits',all:'Explorer les accessoires auto',discover:'Rayons auto, sport & famille'},
   ar:{tag:'السيارات · الرياضة · الأطفال',title:'منتجات للسيارات والرياضة والعائلة.',description:'إكسسوارات السيارات، اللياقة، ومستلزمات الأطفال. كل صورة كتديك لمنتجات القسم مباشرة.',button:'جميع المنتجات',all:'قسم السيارات',discover:'أقسام السيارات والعائلة'},
   en:{tag:'AUTO · SPORTS · KIDS',title:'Useful finds for active families.',description:'Explore car accessories, sport and fitness, and kids essentials. Open any category by selecting its image.',button:'All products',all:'Explore car accessories',discover:'Auto, sport & family'}
 }},
 {id:'discover',destination:null,categories:['jardin','bureau','animaux'],theme:'light',copy:{
   fr:{tag:'JARDIN · BUREAU · ANIMAUX',title:'Pour le jardin, le bureau et vos compagnons.',description:'Découvrez les accessoires de jardin, l’organisation du bureau et les articles pour animaux. Chaque visuel est un lien vers son rayon.',button:'Tous les produits',all:'Explorer le jardin',discover:'Autres univers'},
   ar:{tag:'الحديقة · المكتب · الحيوانات الأليفة',title:'الحديقة، المكتب ومستلزمات الحيوانات.',description:'تسوق أقسام الحديقة، تنظيم المكتب ولوازم الحيوانات الأليفة. ضغط على أي صورة باش تشوف القسم.',button:'جميع المنتجات',all:'قسم الحديقة',discover:'باقي الأقسام'},
   en:{tag:'GARDEN · OFFICE · PETS',title:'Explore more ways to shop.',description:'Browse garden accessories, office organisation and pet supplies. Tap any image to open its department.',button:'All products',all:'Explore garden',discover:'More departments'}
 }}
];

const appearance={
 dark:{bg:'bg-[#103e35] border-[#235f51]',text:'text-white',sub:'text-white/80',tag:'bg-white/10 text-[#f4c75a] border-white/20',primary:'bg-[#f4c75a] text-[#153d35] hover:bg-yellow-300',secondary:'border-white/40 text-white hover:bg-white/10',hint:'text-white/70'},
 light:{bg:'bg-[#f8f3e7] border-[#e7e0ce]',text:'text-[#193e38]',sub:'text-[#52645d]',tag:'bg-white/70 text-[#856227] border-[#dbc79b]',primary:'bg-[#104d43] text-white hover:bg-[#0c3831]',secondary:'border-[#93b1a4] text-[#104d43] hover:bg-white',hint:'text-[#4b6459]'},
 blue:{bg:'bg-[#1b3947] border-[#244c5d]',text:'text-white',sub:'text-white/80',tag:'bg-white/10 text-[#f4c75a] border-white/20',primary:'bg-[#f4c75a] text-[#153d35] hover:bg-yellow-300',secondary:'border-white/40 text-white hover:bg-white/10',hint:'text-white/70'}
} as const;

export default function HomeBannerSlider({language,categories,onShopAll,onSelectDepartment}:Props){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{
   if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),5500);
   return ()=>window.clearInterval(timer);
 },[paused]);
 const slide=slides[active],c=slide.copy[language],palette=appearance[slide.theme];
 const rtl=language==='ar';
 const go=(id:string|null)=>id?onSelectDepartment(id):onShopAll();
 return <section className="w-full max-w-none px-4 pb-4 pt-6 sm:px-6 lg:px-8 2xl:px-10" dir={rtl?'rtl':'ltr'} aria-label={rtl?'عروض المتجر':'Découvrir GLOBABOX'}>
  <div className={'relative isolate overflow-hidden rounded-[26px] border shadow-[0_10px_35px_rgba(16,50,43,.08)] '+palette.bg}>
   <div className="relative grid min-h-[530px] items-center gap-8 px-6 pb-[88px] pt-10 sm:px-10 lg:min-h-[500px] lg:grid-cols-2 lg:gap-10 lg:px-12 lg:pt-8 2xl:gap-16 2xl:px-16">
    <div className="max-w-[700px]">
     <p className={'mb-5 inline-flex max-w-full rounded-full border px-4 py-2 text-[10px] font-extrabold leading-5 tracking-[.08em] sm:text-xs '+palette.tag}>{c.tag}</p>
     <h1 className={'max-w-[700px] text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl 2xl:text-[56px] '+palette.text}>{c.title}</h1>
     <p className={'mt-5 max-w-[590px] text-sm leading-7 sm:text-base sm:leading-8 '+palette.sub}>{c.description}</p>
     <div className="mt-8 flex flex-wrap gap-3">
       <button type="button" onClick={()=>go(slide.destination)} className={'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold shadow-sm transition '+palette.primary}><ShoppingBag size={18}/>{c.button}<ArrowDown size={17}/></button>
       <button type="button" onClick={()=>go(slide.categories[0])} className={'inline-flex min-h-12 items-center justify-center rounded-xl border px-5 text-sm font-bold transition '+palette.secondary}>{c.all}</button>
     </div>
    </div>
    <div className="relative">
      <div className="mb-3 flex items-center justify-between"><span className={'text-[11px] font-extrabold tracking-widest '+palette.hint}>{c.discover}</span><span className={'text-[11px] font-semibold '+palette.hint}>{active+1} / {slides.length}</span></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
       {slide.categories.map((id,index)=>{
        const cat=categories.find(d=>d.id===id) || STORE_DEPARTMENTS.find(d=>d.id===id);
        if(!cat)return null;
        return <a key={id} href={'/?category='+encodeURIComponent(id)} onClick={event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();go(id);}} aria-label={cat.name[language]} className={'group relative min-h-[138px] overflow-hidden rounded-[19px] border-2 border-white/75 bg-white text-start shadow-[0_7px_18px_rgba(0,0,0,.15)] transition hover:-translate-y-1 hover:shadow-xl sm:min-h-[168px] lg:min-h-[176px] '+(slide.categories.length===3&&index===2?'col-span-2 sm:col-span-2':'')}>
         <img src={cat.image} loading={index<2?'eager':'lazy'} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/>
         <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102b26]/95 via-[#102b26]/75 to-transparent px-3 pb-3 pt-10 text-[12px] font-extrabold leading-5 text-white sm:px-4 sm:pb-4 sm:text-sm">{cat.name[language]}</span>
        </a>;
       })}
      </div>
    </div>
   </div>
   <div className="absolute bottom-5 inset-x-6 z-10 flex items-center justify-between sm:inset-x-10 lg:inset-x-12 2xl:inset-x-16">
      <div className="flex gap-2" role="group" aria-label="Slides">
        {slides.map((s,i)=><button key={s.id} type="button" onClick={()=>setActive(i)} aria-current={active===i?'true':undefined} aria-label={(rtl?'السلايد ':'Slide ')+(i+1)} className={'h-2 rounded-full transition-all '+(active===i?'w-10 bg-[#f4c75a]':'w-5 bg-slate-400/60 hover:bg-[#f4c75a]/80')}/>)}
      </div>
      <div className="flex gap-2">
       <button type="button" onClick={()=>setPaused(value=>!value)} aria-label={paused?(rtl?'تشغيل السلايدات تلقائياً':language==='en'?'Resume automatic slides':'Reprendre les diapositives automatiques'):(rtl?'إيقاف السلايدات مؤقتاً':language==='en'?'Pause automatic slides':'Mettre les diapositives en pause')} aria-pressed={paused} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-[#104d43] shadow-sm transition hover:bg-[#f4c75a]">{paused?<Play size={19}/>:<Pause size={19}/>}</button>
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
