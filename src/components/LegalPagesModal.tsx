import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleHelp, FileText, Mail, MapPin, PhoneCall, RotateCcw, ShieldCheck, Truck, X } from 'lucide-react';
import type { Language } from '../types';
import { ORDER_SUPPORT_NUMBER, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface Props { isOpen:boolean; onClose:()=>void; initialTab?:string; language?:Language; }
export type TabKey = 'about'|'delivery'|'returns'|'cgv'|'privacy'|'contact';
export const policyKeys:TabKey[]=['about','delivery','returns','cgv','privacy','contact'];
const icons={about:CircleHelp,delivery:Truck,returns:RotateCcw,cgv:FileText,privacy:ShieldCheck,contact:PhoneCall};
export const policyContent:Record<Language,{title:string;subtitle:string;labels:Record<TabKey,string>;pages:Record<TabKey,string[]>;support:string;call:string;location:string;note:string}> = {
 fr:{
  title:'Informations et politiques',subtitle:'Des réponses claires avant votre commande.',
  labels:{about:'À propos',delivery:'Livraison',returns:'Retours & échanges',cgv:'Conditions de vente',privacy:'Confidentialité',contact:'Contact'},
  pages:{
   about:['GLOBABOX est une boutique en ligne marocaine multi-catégories. Nous proposons des produits du quotidien, des accessoires et des articles pour la maison.','Les prix, descriptions et disponibilités doivent être confirmés sur chaque fiche produit. Notre service client peut vous renseigner avant votre commande.'],
   delivery:['Nous organisons la livraison au Maroc selon la disponibilité du service à votre destination. Le délai estimé est communiqué lors de la confirmation.','La livraison est facturée 35 DH pour les commandes inférieures à 500 DH et offerte à partir de 500 DH, sous réserve du total indiqué avant validation.','Le paiement est effectué en espèces à la livraison. Aucune durée de livraison fixe n’est garantie sur cette page.'],
   returns:['Si votre produit est endommagé, défectueux ou différent de la commande, contactez notre service client en indiquant votre référence et, si nécessaire, des photos.','Toute demande de retour ou d’échange est examinée conformément aux conditions applicables à la commande et à la réglementation en vigueur. Ne renvoyez pas de colis avant d’avoir reçu les instructions de retour.'],
   cgv:['Avant validation, vérifiez le produit, la quantité, le prix total, les frais de livraison et l’adresse de réception.','Une commande est enregistrée lorsque le site confirme sa réception et lui attribue une référence. La disponibilité et l’expédition peuvent faire l’objet d’une confirmation complémentaire.','Le paiement en espèces est réalisé à la livraison. Les droits légaux applicables au consommateur restent en vigueur.'],
   privacy:['Pour traiter la commande, GLOBABOX collecte les informations nécessaires, notamment le nom, le numéro de téléphone, la ville, l’adresse de livraison et les détails du panier.','Ces informations sont utilisées pour traiter et suivre la commande et peuvent être transmises aux prestataires de livraison strictement lorsque nécessaire.','Pour une demande liée à vos données personnelles, contactez notre service client. Ne transmettez jamais de mot de passe ou de données bancaires par WhatsApp.'],
   contact:['Vous pouvez nous contacter pour demander des précisions sur un produit, vérifier la disponibilité, suivre une commande ou signaler un problème.','Notre service intervient pour les commandes destinées au Maroc. La zone de livraison est confirmée selon l’adresse communiquée.']
  },
  support:'Écrire sur WhatsApp',call:'Appeler',location:'Zone desservie : Maroc',note:'Pour toute question sur une commande, indiquez votre référence.'
 },
 ar:{
  title:'المعلومات والسياسات',subtitle:'معلومات واضحة قبل إتمام الطلب.',
  labels:{about:'من نحن',delivery:'التوصيل',returns:'الإرجاع والتبديل',cgv:'شروط البيع',privacy:'الخصوصية',contact:'التواصل'},
  pages:{
   about:['جلوبابوكس متجر إلكتروني مغربي متعدد الأقسام، كيوفر منتجات منزلية وإكسسوارات ومنتجات للاستعمال اليومي.','الثمن والوصف والتوفر كيبانو فصفحة كل منتج، وتقدر تتواصل معنا للاستفسار قبل الشراء.'],
   delivery:['كننظمو التوصيل داخل المغرب حسب توفر الخدمة فالوجهة ديالك، وكنأكدو المدة المتوقعة قبل الإرسال.','مصاريف التوصيل 35 درهم للطلبات أقل من 500 درهم، ومجانية ابتداءً من 500 درهم، حسب المجموع اللي كيبان قبل تأكيد الطلب.','الدفع نقداً عند الاستلام، وما كنضمنوش مدة ثابتة للتوصيل فهاد الصفحة.'],
   returns:['إلى توصلك منتج متضرر أو مختلف على الطلب، تواصل مع خدمة الزبناء وقدم مرجع الطلبية وصور المنتج عند الحاجة.','كنعالجو طلبات الإرجاع والتبديل حسب شروط الطلب والقانون المعمول به. ما ترجعش الطرد حتى توصلك التعليمات من خدمة الزبناء.'],
   cgv:['قبل تأكيد الطلب، راجع المنتج والكمية والثمن الكامل ومصاريف التوصيل والعنوان.','الطلبية كتكون مسجلة ملي كيأكد الموقع الاستلام وكيعطيك مرجع. التوفر والإرسال ممكن يحتاجو تأكيد إضافي.','الدفع نقداً عند الاستلام، مع احترام الحقوق القانونية للمستهلك.'],
   privacy:['باش نعالجو الطلبية، كنحتاجو الاسم ورقم الهاتف والمدينة والعنوان ومعلومات المنتجات المطلوبة.','كتستعمل هاد المعلومات لمعالجة الطلب وتتبعو، وممكن نشاركو الضروري منها مع شركة التوصيل لتنفيذ الخدمة.','إلى عندك سؤال على المعطيات الشخصية، تواصل مع خدمة الزبناء. ما تصيفط حتى كلمة سر أو معلومات بنكية عبر واتساب.'],
   contact:['تقدر تتواصل معنا على المنتجات والتوفر وتتبع الطلبات والمشاكل المتعلقة بالشراء.','الخدمة موجهة للطلبات داخل المغرب، وإمكانية التوصيل كتتأكد حسب العنوان ديالك.']
  },
  support:'واتساب',call:'اتصال',location:'منطقة الخدمة: المغرب',note:'إلى عندك سؤال على الطلبية، عطينا المرجع ديالها.'
 },
 en:{
  title:'Information & policies',subtitle:'Clear answers before you place an order.',
  labels:{about:'About',delivery:'Delivery',returns:'Returns',cgv:'Terms of sale',privacy:'Privacy',contact:'Contact'},
  pages:{
   about:['GLOBABOX is a Moroccan multi-category online store offering home goods, accessories and everyday products.','Prices, descriptions and availability are presented on each product page. Contact support for assistance before ordering.'],
   delivery:['We organize delivery within Morocco, subject to availability for your destination. Estimated timing is confirmed before dispatch.','Delivery is 35 MAD for orders under 500 MAD and free from 500 MAD, subject to the total displayed before checkout.','Payment is in cash on delivery. No fixed delivery-time guarantee is made here.'],
   returns:['If an item arrives damaged, defective or different from your order, contact support with your order reference and photos if needed.','Return and exchange requests are reviewed under the applicable order terms and law. Please do not send parcels back before receiving return instructions.'],
   cgv:['Review items, quantities, total price, delivery costs and your address before checkout.','An order is recorded when the website acknowledges it and provides a reference. Stock and dispatch may require further confirmation.','Payment is in cash on delivery. Applicable statutory consumer rights remain in effect.'],
   privacy:['GLOBABOX processes the details necessary to fulfill orders, including your name, phone, city, delivery address and basket.','Details are used to handle and track orders and may be shared with delivery partners when necessary to fulfill the shipment.','Contact support for questions about your personal information. Never send passwords or banking information over WhatsApp.'],
   contact:['Contact us for product information, availability, tracking or any problem with your order.','Orders are served within Morocco and delivery availability depends on your destination.']
  },
  support:'Message on WhatsApp',call:'Call us',location:'Service area: Morocco',note:'Include your order reference when contacting us about an order.'
 }
};

export default function LegalPagesModal({isOpen,onClose,initialTab='about',language='fr'}:Props){
  const [active,setActive]=useState<TabKey>(policyKeys.includes(initialTab as TabKey)?initialTab as TabKey:'about');
  useEffect(()=>{if(isOpen)setActive(policyKeys.includes(initialTab as TabKey)?initialTab as TabKey:'about');},[initialTab,isOpen]);
  useEffect(()=>{
    if(!isOpen)return;
    const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};
    document.addEventListener('keydown',esc);
    return()=>document.removeEventListener('keydown',esc);
  },[isOpen,onClose]);
  if(!isOpen)return null;
  const c=policyContent[language];
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071d17]/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div role="dialog" aria-modal="true" aria-label={c.title} dir={language==='ar'?'rtl':'ltr'} className="flex h-[min(90vh,760px)] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-[#104d43] px-5 py-5 text-white sm:px-7">
          <div><h2 className="text-lg font-black sm:text-xl">{c.title}</h2><p className="mt-1 text-xs text-white/75">{c.subtitle}</p></div>
          <button type="button" onClick={onClose} aria-label={language==='ar'?'إغلاق':'Close'} className="rounded-xl p-2 hover:bg-white/15"><X size={22}/></button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-slate-200 bg-[#f5f8f5] p-3 md:w-[220px] md:flex-col md:border-b-0 md:border-e" aria-label={c.title}>
            {policyKeys.map(key=>{
              const Icon=icons[key];
              return <button type="button" key={key} onClick={()=>setActive(key)} aria-current={active===key?'page':undefined}
                className={'flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-start text-xs font-bold transition md:w-full '+(active===key?'bg-[#104d43] text-white':'bg-white text-slate-700 hover:bg-[#e6efea]')}>
                <Icon size={17}/><span>{c.labels[key]}</span>
              </button>;
            })}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8">
            <h3 className="mb-5 border-b border-slate-100 pb-4 text-2xl font-black text-[#193e38]">{c.labels[active]}</h3>
            <div className="space-y-4">{c.pages[active].map((paragraph,i)=><p key={i} className="text-sm leading-8 text-slate-700">{paragraph}</p>)}</div>
            {active==='contact' && <div className="mt-8 grid gap-3">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border border-[#b9ddc5] bg-[#edf9f0] px-4 text-sm font-bold text-[#15533f] hover:bg-[#dff3e3]"><WhatsAppIcon className="h-5 w-5"/>{c.support}<ArrowUpRight size={15}/></a>
              <a href={'tel:'+ORDER_SUPPORT_NUMBER} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 text-sm font-bold text-[#193e38] hover:bg-slate-50"><PhoneCall size={18}/>{c.call} <span dir="ltr">{ORDER_SUPPORT_NUMBER}</span></a>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"><MapPin size={18}/>{c.location}</div>
            </div>}
            <div className="mt-8 rounded-xl bg-[#f6f8f6] px-4 py-3 text-xs leading-6 text-slate-600">{c.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
