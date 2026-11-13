import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, LoaderCircle, MapPin, MessageSquare, Minus, PackageCheck, PhoneCall, Plus, ShieldCheck, ShoppingBag, ShoppingCart, Trash2, Truck, UserRound, X } from 'lucide-react';
import { CartItem, Language, CheckoutForm } from '../types';
import { TRANSLATIONS } from '../translations';
import { MOROCCAN_CITIES, WHATSAPP_LINK } from '../data';
import { triggerInitiateCheckout } from '../utils/analytics';
import WhatsAppIcon from './WhatsAppIcon';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderData: { reference: string; form: CheckoutForm; items: CartItem[]; subtotal?: number; shippingCost?: number; total: number; freeShipping?: boolean }) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  language,
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  onClearCart,
  onOrderSuccess,
  onWhatsAppOrder,
}: CartDrawerProps) {
  const isRtl = language === "ar";
  const copy = {
    fr: {
      title:'Votre panier',items:'articles',yourItems:'Articles sélectionnés',empty:'Votre panier est vide',
      emptyHint:'Explorez nos produits pour composer votre prochaine commande.',continue:'Continuer mes achats',
      subtotal:'Sous-total',delivery:'Livraison',free:'Offerte',total:'Total à payer',order:'Passer commande',
      customer:'Vos coordonnées',customerHelp:'Complétez ces informations pour confirmer votre commande.',
      details:'Récapitulatif',name:'Nom complet',phone:'Numéro de téléphone',city:'Ville de livraison',
      address:'Adresse de livraison',notes:'Instructions de livraison (facultatif)',
      namePlaceholder:'Nom et prénom',phonePlaceholder:'06XXXXXXXX',addressPlaceholder:'Rue, quartier, numéro, immeuble...',
      notesPlaceholder:'Précisions utiles pour le livreur',cityPlaceholder:'Choisir une ville',
      deliveryMessage:'Livraison au Maroc, selon la disponibilité pour votre destination.',
      next:'Il vous manque',toFree:'pour profiter de la livraison offerte.',
      unlocked:'Vous bénéficiez de la livraison offerte !',quantity:'Quantité',remove:'Retirer le produit',
      processing:'Enregistrement de la commande…',confirm:'Confirmer la commande',whatsapp:'Questions ? WhatsApp',
      terms:'J’ai lu et j’accepte les',termsLink:'conditions de vente',and:'et la',returnsLink:'politique de retour',
      payment:'Paiement en espèces à la livraison',privacy:'Vos coordonnées servent uniquement au traitement de la commande.',
      close:'Fermer le panier',clear:'Vider le panier',products:'produits'
    },
    ar: {
      title:'سلة التسوق',items:'منتج',yourItems:'المنتجات المختارة',empty:'سلتك فارغة',
      emptyHint:'تصفح المنتجات وأضف اللي عجبك للسلة باش تكمل الطلب.',continue:'مواصلة التسوق',
      subtotal:'مجموع المنتجات',delivery:'مصاريف التوصيل',free:'مجاني',total:'المجموع النهائي',order:'إتمام الطلب',
      customer:'معلومات التوصيل',customerHelp:'عمر المعلومات باش نسجلو الطلبية ديالك.',
      details:'ملخص الطلب',name:'الاسم الكامل',phone:'رقم الهاتف',city:'مدينة التوصيل',
      address:'عنوان التوصيل',notes:'ملاحظات للتوصيل (اختياري)',
      namePlaceholder:'الاسم والنسب',phonePlaceholder:'06XXXXXXXX',addressPlaceholder:'الزنقة، الحي، الرقم، العمارة...',
      notesPlaceholder:'تفاصيل إضافية للموزع',cityPlaceholder:'اختار المدينة',
      deliveryMessage:'التوصيل داخل المغرب حسب توفر الخدمة فالمدينة ديالك.',
      next:'باقي ليك',toFree:'باش تستافد من التوصيل المجاني.',
      unlocked:'تستافد دابا من التوصيل المجاني!',quantity:'الكمية',remove:'حذف المنتج',
      processing:'جاري تسجيل الطلبية…',confirm:'تأكيد الطلبية',whatsapp:'عندك سؤال؟ واتساب',
      terms:'قريت ووافقت على',termsLink:'شروط البيع',and:'و',returnsLink:'سياسة الإرجاع',
      payment:'الدفع نقداً عند الاستلام',privacy:'كنستعملو معلوماتك غير لمعالجة الطلبية.',
      close:'إغلاق السلة',clear:'تفريغ السلة',products:'منتجات'
    },
    en: {
      title:'Your cart',items:'items',yourItems:'Selected items',empty:'Your cart is empty',
      emptyHint:'Discover our catalog and add the products you like.',continue:'Continue shopping',
      subtotal:'Subtotal',delivery:'Delivery',free:'Free',total:'Total to pay',order:'Checkout',
      customer:'Delivery details',customerHelp:'Enter your details to confirm your order.',
      details:'Order summary',name:'Full name',phone:'Phone number',city:'Delivery city',
      address:'Delivery address',notes:'Delivery notes (optional)',
      namePlaceholder:'First and last name',phonePlaceholder:'06XXXXXXXX',addressPlaceholder:'Street, neighborhood, building...',
      notesPlaceholder:'Additional notes for the courier',cityPlaceholder:'Select a city',
      deliveryMessage:'Delivery across Morocco, subject to service availability for your destination.',
      next:'Add',toFree:'more to unlock free delivery.',
      unlocked:'Your delivery is now free!',quantity:'Quantity',remove:'Remove product',
      processing:'Saving your order…',confirm:'Confirm order',whatsapp:'Questions? WhatsApp',
      terms:'I have read and accept the',termsLink:'terms of sale',and:'and the',returnsLink:'returns policy',
      payment:'Cash on delivery',privacy:'Your details are used to process your order only.',
      close:'Close cart',clear:'Clear cart',products:'products'
    }
  }[language];
  const money = (value: number) => new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-MA', {maximumFractionDigits:2}).format(value) + ' DH';
  const orderCount = cart.reduce((sum,item)=>sum+item.quantity,0);
  const freeDeliveryRemaining = Math.max(0, 500 - cart.reduce((sum,item)=>sum+item.product.price*item.quantity,0));
  const inputClass = 'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#153e34] placeholder:text-slate-400 outline-none transition focus:border-[#104d43] focus:ring-2 focus:ring-[#104d43]/10';
  
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  // Form states
  const [fullName, setFullName] = useState(() => localStorage.getItem('customer_fullname') || '');
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('customer_phone') || '');
  const [city, setCity] = useState(() => localStorage.getItem('customer_city') || '');
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem('customer_address') || '');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms,setAcceptedTerms] = useState(false);

  // Sync to localStorage on change
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    localStorage.setItem('customer_fullname', val);
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    localStorage.setItem('customer_phone', val);
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    localStorage.setItem('customer_city', val);
  };

  const handleAddressChange = (val: string) => {
    setDeliveryAddress(val);
    localStorage.setItem('customer_address', val);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShipping = subtotal >= 500;
  const deliveryCost = freeShipping ? 0 : 35;
  const total = subtotal + deliveryCost;

  // Trigger InitiateCheckout event when cart is opened with items inside
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      triggerInitiateCheckout(cart, total);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validate and submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // 1. Name validation
    if (!fullName.trim()) {
      errors.fullName = language === 'ar' ? 'الاسم الكامل مطلوب.' : language === 'en' ? 'Full name is required.' : 'Le nom complet est obligatoire.';
    } else if (fullName.trim().length < 3) {
      errors.fullName = language === 'ar' ? 'يرجى إدخال اسم كامل صحيح (3 أحرف على الأقل).' : language === 'en' ? 'Please enter a valid full name (min 3 characters).' : 'Veuillez entrer un nom complet valide (minimum 3 caractères).';
    }

    // 2. Phone number validation
    const cleanPhone = phoneNumber.replace(/[\s.-]+/g, '');
    const phoneRegex = /^(?:(?:\+|00)?212|0)[5-7][0-9]{8}$/;
    if (!phoneNumber.trim()) {
      errors.phoneNumber = language === 'ar' ? 'رقم الهاتف مطلوب.' : language === 'en' ? 'Phone number is required.' : 'Le numéro de téléphone est obligatoire.';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phoneNumber = language === 'ar' ? 'رقم هاتف غير صحيح. يرجى إدخال رقم مغربي صالح (مثال: 0612345678).' : language === 'en' ? 'Invalid number. Moroccan mobile format required.' : 'Numéro invalide. Format marocain requis (Ex: 0612345678).';
    }

    // 3. City validation
    if (!city || city === "") {
      errors.city = language === 'ar' ? 'يرجى اختيار مدينة التسليم الخاصة بك.' : language === 'en' ? 'Please select your delivery city.' : 'Veuillez sélectionner votre ville de livraison.';
    }

    // 4. Address validation
    if (!deliveryAddress.trim()) {
      errors.deliveryAddress = language === 'ar' ? 'عنوان التسليم الدقيق مطلوب.' : language === 'en' ? 'Exact delivery address is required.' : "L'adresse exacte de livraison est obligatoire.";
    } else if (deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = language === 'ar' ? 'يرجى كتابة عنوان تسليم أكثر تفصيلاً.' : language === 'en' ? 'Please specify a more detailed delivery address.' : 'Veuillez préciser une adresse de livraison plus détaillée.';
    }

    // 5. Quantity validation
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (totalQuantity < 1) {
      errors.quantity = language === 'ar' ? 'يجب أن تكون الكمية الكلية 1 على الأقل.' : language === 'en' ? 'Ordered quantity must be at least 1.' : "La quantité commandée doit être d'au moins 1.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!acceptedTerms) {
      setFormErrors({submit:language === 'ar' ? 'يرجى الاطلاع والموافقة على شروط البيع وسياسة الإرجاع قبل الطلب.' : 'Veuillez accepter les conditions de vente et la politique de retour avant de commander.'});
      return;
    }
    setFormErrors({});

    // Generate random order reference code
    const randomRef = `GB-${Math.floor(Math.random() * 900000) + 100000}`;

    setIsSubmitting(true);

    try {
      // Pass up to show success
      await onOrderSuccess({
        reference: randomRef,
        form: { fullName, phoneNumber, city, deliveryAddress, notes },
        items: [...cart],
        subtotal: subtotal,
        shippingCost: deliveryCost,
        total: total,
        freeShipping: freeShipping,
      });

      // Clear form
      setFullName('');
      setPhoneNumber('');
      setCity('');
      setDeliveryAddress('');
      setNotes('');
      setAcceptedTerms(false);
    } catch (err) {
      console.error('[GLOBABOX] Order completion error:', err);
      setFormErrors({ submit: err instanceof Error ? err.message : (language === 'ar' ? 'تعذر تسجيل الطلب. حاول مرة أخرى.' : 'Commande non enregistrée. Réessayez.') });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[85] flex justify-end bg-[#0c2921]/65 backdrop-blur-[2px]"
      onMouseDown={(event) => { if(event.target===event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        dir={isRtl?'rtl':'ltr'}
        className="flex h-full w-full flex-col overflow-hidden border-slate-200 bg-[#f8faf8] shadow-2xl sm:max-w-[570px] sm:border-s"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#dce9e1] bg-white px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5f2ea] text-[#104d43]">
              <ShoppingBag size={23}/>
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-[#163f36]">{copy.title}</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{orderCount} {copy.items}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-[#f0f6f2] hover:text-[#104d43]">
            <X size={20}/>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
          {cart.length===0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c8e0d3] bg-[#eaf4ed] text-[#104d43]">
                <ShoppingCart size={36}/>
              </span>
              <h3 className="text-xl font-black text-[#163f36]">{copy.empty}</h3>
              <p className="max-w-xs text-sm leading-7 text-slate-500">{copy.emptyHint}</p>
              <button type="button" onClick={onClose} className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#104d43] px-7 text-sm font-extrabold text-white transition hover:bg-[#0b3931]">
                {copy.continue}{isRtl?<ArrowLeft size={17}/>:<ArrowRight size={17}/>}
              </button>
            </div>
          ) : (
            <div className="space-y-5 pb-7">
              <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(21,61,49,.04)] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#163f36]">
                    <ShoppingBag size={18} className="text-[#104d43]"/>{copy.yourItems}
                  </div>
                  <button type="button" onClick={onClearCart} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14}/>{copy.clear}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <article key={[item.product.id,item.selectedSize,item.selectedColor].join('-')}
                      className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-[#f2f6f3] sm:h-[92px] sm:w-[92px]">
                        {!item.product.image || failedImages[item.product.image] ? (
                          <PackageCheck className="text-[#9fb8ab]" size={29}/>
                        ) : (
                          <img src={item.product.image} alt={item.product.name[language]||item.product.name.fr}
                            loading="lazy" referrerPolicy="no-referrer"
                            onError={()=>setFailedImages(prev=>({...prev,[item.product.image]:true}))}
                            className="h-full w-full object-contain p-1.5"/>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[13px] font-bold leading-5 text-[#193e38]">{item.product.name[language]||item.product.name.fr}</p>
                        {(item.selectedSize||item.selectedColor)&&<p className="mt-1 text-[11px] text-slate-500">
                          {[item.selectedSize,item.selectedColor].filter(Boolean).join(' · ')}
                        </p>}
                        <p className="mt-2 text-sm font-black text-[#104d43]">{money(item.product.price * item.quantity)}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white" role="group" aria-label={copy.quantity}>
                            <button type="button" disabled={item.quantity<=1} aria-label={copy.quantity+' -'}
                              onClick={()=>onUpdateQuantity(item.product.id,Math.max(1,item.quantity-1))}
                              className="flex h-9 w-9 items-center justify-center text-[#104d43] hover:bg-[#edf5ef] disabled:opacity-30"><Minus size={15}/></button>
                            <span className="min-w-8 px-1 text-center text-xs font-black text-[#193e38]" aria-live="polite">{item.quantity}</span>
                            <button type="button" disabled={item.quantity>=99} aria-label={copy.quantity+' +'}
                              onClick={()=>onUpdateQuantity(item.product.id,Math.min(99,item.quantity+1))}
                              className="flex h-9 w-9 items-center justify-center text-[#104d43] hover:bg-[#edf5ef] disabled:opacity-30"><Plus size={15}/></button>
                          </div>
                          <button type="button" onClick={()=>onRemoveFromCart(item.product.id)} aria-label={copy.remove} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={15}/><span>{copy.remove}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d5e7da] bg-[#eef7ef] px-4 py-4">
                {freeShipping ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-[#104d43]">
                    <CheckCircle2 size={19}/>{copy.unlocked}
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-[#104d43]">
                      <span>{copy.next} <strong>{money(freeDeliveryRemaining)}</strong> {copy.toFree}</span>
                      <span className="shrink-0">{Math.round(Math.min(100,subtotal/500*100))}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.min(500,subtotal)} aria-valuemin={0} aria-valuemax={500}>
                      <div className="h-full rounded-full bg-[#104d43] transition-all" style={{width:Math.min(100,subtotal/500*100)+'%'}}/>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(21,61,49,.04)]">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-[#193e38]"><PackageCheck size={19} className="text-[#104d43]"/>{copy.details}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-slate-600"><span>{copy.subtotal}</span><span dir="ltr" className="font-semibold text-[#193e38]">{money(subtotal)}</span></div>
                  <div className="flex justify-between gap-4 text-slate-600"><span>{copy.delivery}</span><span dir="ltr" className={'font-semibold '+(freeShipping?'text-[#187851]':'text-[#193e38]')}>{freeShipping?copy.free:money(deliveryCost)}</span></div>
                  <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-extrabold text-[#193e38]">
                    <span>{copy.total}</span><span dir="ltr" className="text-[#104d43]">{money(total)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f4f8f5] p-3 text-xs leading-6 text-[#47675a]">
                  <Truck size={18} className="mt-1 shrink-0 text-[#104d43]"/>{copy.deliveryMessage}
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(21,61,49,.04)] sm:p-5">
                <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#104d43]"><MapPin size={21}/></span>
                  <div>
                    <h3 className="text-sm font-black text-[#193e38]">{copy.customer}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-500">{copy.customerHelp}</p>
                  </div>
                </div>
                <form onSubmit={handleSubmitOrder} className="space-y-4" noValidate>
                  {formErrors.submit&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-6 text-red-700">{formErrors.submit}</p>}
                  <div className="space-y-1.5">
                    <label htmlFor="cart-fullname" className="flex items-center gap-2 text-xs font-extrabold text-[#193e38]"><UserRound size={15} className="text-[#104d43]"/>{copy.name} *</label>
                    <input id="cart-fullname" type="text" autoComplete="name" maxLength={120} value={fullName}
                      placeholder={copy.namePlaceholder} onChange={e=>handleFullNameChange(e.target.value)} className={inputClass} required aria-invalid={!!formErrors.fullName}/>
                    {formErrors.fullName&&<p role="alert" className="text-xs text-red-600">{formErrors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cart-phone" className="flex items-center gap-2 text-xs font-extrabold text-[#193e38]"><PhoneCall size={15} className="text-[#104d43]"/>{copy.phone} *</label>
                    <input id="cart-phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" maxLength={32} value={phoneNumber}
                      placeholder={copy.phonePlaceholder} onChange={e=>handlePhoneChange(e.target.value)} className={inputClass} required aria-invalid={!!formErrors.phoneNumber}/>
                    {formErrors.phoneNumber&&<p role="alert" className="text-xs text-red-600">{formErrors.phoneNumber}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cart-city" className="flex items-center gap-2 text-xs font-extrabold text-[#193e38]"><MapPin size={15} className="text-[#104d43]"/>{copy.city} *</label>
                    <select id="cart-city" value={city} onChange={e=>handleCityChange(e.target.value)} className={inputClass} required aria-invalid={!!formErrors.city}>
                      <option value="" disabled>{copy.cityPlaceholder}</option>
                      {MOROCCAN_CITIES.map(item=><option key={item} value={item}>{item}</option>)}
                    </select>
                    {formErrors.city&&<p role="alert" className="text-xs text-red-600">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cart-address" className="flex items-center gap-2 text-xs font-extrabold text-[#193e38]"><MapPin size={15} className="text-[#104d43]"/>{copy.address} *</label>
                    <textarea id="cart-address" rows={2} maxLength={300} autoComplete="street-address"
                      value={deliveryAddress} placeholder={copy.addressPlaceholder} onChange={e=>handleAddressChange(e.target.value)}
                      className={inputClass+' resize-y'} required aria-invalid={!!formErrors.deliveryAddress}/>
                    {formErrors.deliveryAddress&&<p role="alert" className="text-xs text-red-600">{formErrors.deliveryAddress}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="cart-notes" className="flex items-center gap-2 text-xs font-extrabold text-[#193e38]"><MessageSquare size={15} className="text-[#104d43]"/>{copy.notes}</label>
                    <textarea id="cart-notes" rows={2} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)}
                      placeholder={copy.notesPlaceholder} className={inputClass+' resize-y'}/>
                  </div>
                  {formErrors.quantity&&<p role="alert" className="text-xs text-red-600">{formErrors.quantity}</p>}
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#f8faf8] p-4">
                    <input id="cart-terms" type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#104d43]"/>
                    <label htmlFor="cart-terms" className="text-xs leading-6 text-slate-600">
                      {copy.terms}{' '}
                      <a href="/?page=cgv" className="font-bold text-[#104d43] underline underline-offset-2 hover:text-[#0b3d32]">{copy.termsLink}</a>
                      {' '}{copy.and}{' '}
                      <a href="/?page=returns" className="font-bold text-[#104d43] underline underline-offset-2 hover:text-[#0b3d32]">{copy.returnsLink}</a>.
                    </label>
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3931] focus:outline-none focus:ring-4 focus:ring-[#104d43]/20 disabled:cursor-wait disabled:opacity-60">
                    {isSubmitting?<LoaderCircle size={18} className="animate-spin"/>:<CheckCircle2 size={19}/>}
                    {isSubmitting?copy.processing:copy.confirm} <span dir="ltr" className="ms-auto font-extrabold">{!isSubmitting&&money(total)}</span>
                  </button>
                  <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#47675a]">
                    <CreditCard size={16}/>{copy.payment}
                  </p>
                  <button type="button" onClick={() => {
                    if(onWhatsAppOrder) onWhatsAppOrder({items:cart,form:{
                      fullName:fullName||(language==='ar'?'زبون واتساب':'Client WhatsApp'),
                      phoneNumber:phoneNumber,city,deliveryAddress,notes
                    },source:'cart'});
                    else window.open(WHATSAPP_LINK,'_blank','noopener,noreferrer');
                  }} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#bde3c9] bg-[#eff9f1] px-4 py-3 text-sm font-extrabold text-[#177147] transition hover:bg-[#e3f5e8]">
                    <WhatsAppIcon className="h-5 w-5"/>{copy.whatsapp}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-slate-500"><ShieldCheck size={15}/>{copy.privacy}</p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
