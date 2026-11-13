import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, House, ShoppingBag, Truck } from 'lucide-react';
import type { Language } from '../types';

interface Props { language:Language; onShopAll:()=>void; onSelectDepartment:(id:string)=>void; }

const slides=[
  {
    id:'all', image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1700&q=85',
    picture:'Maison & Décoration',
    color:'#102f2b',
    copy:{
      fr:{tag:'GLOBABOX · MAROC',title:'Tout pour votre maison, et bien plus.',description:'Des idées pour votre intérieur, vos accessoires et vos envies du quotidien.',button:'Voir tous les produits'},
      ar:{tag:'GLOBABOX · المغرب',title:'كل ما يحتاجه منزلك وأكثر.',description:'اكتشف اختيارات عملية للمنزل، الإكسسوارات والحياة اليومية.',button:'جميع المنتجات'},
      en:{tag:'GLOBABOX · MOROCCO',title:'A better everyday starts at home.',description:'Discover great ideas for home, accessories and everyday essentials.',button:'Shop all products'}
    }
  },
  {
    id:'maison',image:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1700&q=85',
    picture:'Ambiance maison',
    color:'#314137',
    copy:{
      fr:{tag:'MAISON & DÉCORATION',title:'Un intérieur qui vous ressemble.',description:'Explorez notre univers maison et créez un espace agréable au quotidien.',button:'Découvrir la maison'},
      ar:{tag:'المنزل والديكور',title:'دارك تستاهل اللمسة الزوينة.',description:'تصفح قسم المنزل والديكور لاكتشاف أفكار جديدة.',button:'تصفح قسم المنزل'},
      en:{tag:'HOME & DECOR',title:'Create a space you love.',description:'Explore home finds and simple ideas for everyday living.',button:'Explore home'}
    }
  },
  {
    id:'cuisine',image:'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1700&q=85',
    picture:'Cuisine familiale',
    color:'#394a40',
    copy:{
      fr:{tag:'CUISINE & QUOTIDIEN',title:'De belles idées pour la cuisine.',description:'Des accessoires pratiques à découvrir pour vos préparations et vos repas.',button:'Découvrir la cuisine'},
      ar:{tag:'المطبخ والأواني',title:'أفكار عملية لمطبخك.',description:'اكتشف قسم المطبخ والأدوات اللي كتعاونك فاليوميات.',button:'تصفح قسم المطبخ'},
      en:{tag:'KITCHEN & DINING',title:'Everyday kitchen inspiration.',description:'Explore useful cooking and dining essentials.',button:'Explore kitchen'}
    }
  }
] as const;

export default function HomeBannerSlider({language,onShopAll,onSelectDepartment}:Props){
 const [active,setActive]=useState(0);
 useEffect(()=>{
   const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),6500);
   return ()=>window.clearInterval(timer);
 },[]);
 const slide=slides[active],copy=slide.copy[language];
 const action=()=>slide.id==='all'?onShopAll():onSelectDepartment(slide.id);
 const direction=language==='ar'?'rtl':'ltr';
 return <section aria-label={language==='ar'?'عروض المتجر':'Store highlights'} className="mx-auto max-w-7xl px-4 pb-3 pt-6 sm:px-6 lg:px-8" dir={direction}>
   <div className="relative isolate min-h-[340px] overflow-hidden rounded-[26px] bg-[#104d43] sm:min-h-[420px] lg:min-h-[475px]">
     {slides.map((s,i)=><img key={s.id} src={s.image} alt={s.picture} loading={i===0?'eager':'lazy'} className={'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out '+(i===active?'opacity-100':'opacity-0')} aria-hidden={i!==active}/>)}
     <div className={'absolute inset-0 '+(language==='ar'?'bg-gradient-to-l':'bg-gradient-to-r')+' from-[#102f2b]/95 via-[#102f2b]/80 to-[#102f2b]/20'} />
     <div className="relative z-10 flex min-h-[340px] max-w-[660px] flex-col justify-center px-7 py-12 text-white sm:min-h-[420px] sm:px-12 lg:min-h-[475px] lg:px-16">
       <span className="mb-5 w-fit rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[.16em] text-[#f7d885] sm:text-xs">{copy.tag}</span>
       <h1 key={'h-'+active} className="max-w-[600px] text-3xl font-black leading-[1.2] tracking-tight sm:text-[44px] lg:text-[53px]">{copy.title}</h1>
       <p className="mt-5 max-w-[470px] text-sm leading-7 text-white/85 sm:text-base">{copy.description}</p>
       <div className="mt-8 flex flex-wrap gap-3">
         <button onClick={action} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f4c75a] px-6 text-sm font-extrabold text-[#163e34] transition hover:bg-yellow-300">
           <ShoppingBag size={17}/>{copy.button}{language==='ar'?<ArrowLeft size={16}/>:<ArrowRight size={16}/>}
         </button>
         {slide.id!=='all'&&<button onClick={onShopAll} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/50 px-6 text-sm font-bold text-white hover:bg-white/10">{language==='ar'?'جميع المنتجات':language==='en'?'All products':'Tous les produits'}</button>}
       </div>
     </div>
     <div className="absolute bottom-5 end-5 z-20 flex items-center gap-2">
       <button type="button" onClick={()=>setActive(i=>(i+slides.length-1)%slides.length)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm hover:bg-black/45"><ChevronLeft size={20}/></button>
       <button type="button" onClick={()=>setActive(i=>(i+1)%slides.length)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm hover:bg-black/45"><ChevronRight size={20}/></button>
     </div>
     <div className="absolute bottom-7 start-7 z-20 flex gap-2 sm:start-12 lg:start-16">{slides.map((s,i)=><button key={s.id} type="button" onClick={()=>setActive(i)} aria-label={'Slide '+(i+1)} aria-current={i===active} className={'h-1.5 rounded-full transition-all '+(i===active?'w-9 bg-[#f4c75a]':'w-4 bg-white/60 hover:bg-white')}/>)}</div>
   </div>
   <div className="grid grid-cols-1 gap-3 py-4 text-xs font-semibold text-[#21463e] sm:grid-cols-3">
     <div className="flex items-center gap-2 rounded-xl bg-[#f5f8f5] px-5 py-3"><Truck size={18}/>{language==='ar'?'التوصيل داخل المغرب':language==='en'?'Delivery across Morocco':'Livraison au Maroc'}</div>
     <div className="flex items-center gap-2 rounded-xl bg-[#f5f8f5] px-5 py-3"><ShoppingBag size={18}/>{language==='ar'?'الدفع عند الاستلام':language==='en'?'Cash on delivery':'Paiement à la livraison'}</div>
     <div className="flex items-center gap-2 rounded-xl bg-[#f5f8f5] px-5 py-3"><House size={18}/>{language==='ar'?'تسوق سهل ومنظم':language==='en'?'Simple shopping':'Shopping simple et pratique'}</div>
   </div>
 </section>;
}
