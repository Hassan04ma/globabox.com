import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingCart, ShieldCheck, MapPin, Phone, MessageSquare, Tag, Compass, Truck, Star, Sparkles, Plus, Minus, User, Home, FileText, CheckCircle } from 'lucide-react';
import { CartItem, Language, CheckoutForm } from '../types';
import { TRANSLATIONS } from '../translations';
import { MOROCCAN_CITIES, WHATSAPP_LINK, WHATSAPP_NUMBER } from '../data';
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
    } catch (err) {
      console.error('[GLOBABOX] Order completion error:', err);
      setFormErrors({ submit: err instanceof Error ? err.message : (language === 'ar' ? 'تعذر تسجيل الطلب. حاول مرة أخرى.' : 'Commande non enregistrée. Réessayez.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className={`fixed inset-0 z-50 bg-[#060b13]/85 backdrop-blur-md flex ${isRtl ? 'justify-start animate-slide-in-left' : 'justify-end animate-slide-in-right'}`}
    >
      <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-gradient-to-b from-[#0a1120] via-[#0d1626] to-[#0a1120] border-[#1d2d47] border-l border-r h-full flex flex-col shadow-2xl relative select-none">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-[#070d1a] border-b border-[#1c2e4a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase font-sans">
                {t('cartTitle')}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                {cart.length} {cart.length > 1 ? t('cartItemsCount') : (language === 'ar' ? 'منتج' : 'produit')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#13223c] rounded-xl cursor-pointer transition-all active:scale-90 border border-transparent hover:border-[#22395e]/60"
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-5 scroll-smooth scrollbar-thin">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-5">
              <div className="w-20 h-20 rounded-full bg-[#13223c]/60 flex items-center justify-center mx-auto border-2 border-[#22395e] shadow-lg">
                <ShoppingCart className="w-10 h-10 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-black text-white uppercase tracking-wider">{language === 'ar' ? 'سلتك فارغة' : 'Votre panier est vide'}</p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xs mx-auto">{t('cartEmpty')}</p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                <span>{t('continueShoppingBtn')}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Card 1: Product list (Votre Panier) */}
              <div className="bg-[#0e1726]/90 rounded-2xl border border-[#213757] p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#213757]/80">
                  <span className="text-[11px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    {language === 'ar' ? 'أصناف طلبيتك' : language === 'en' ? 'Your Items' : 'Vos articles sélectionnés'}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-slate-400 bg-[#080f1d] px-2.5 py-1 rounded-full border border-[#192b47]">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)} {language === 'ar' ? 'قطع' : 'pcs'}
                  </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 pl-1 scrollbar-thin">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-[#111e33] p-3 rounded-2xl border border-[#213757]/60 items-center justify-between hover:border-[#1e3455] transition-all group"
                    >
                      {/* Left: Product Image */}
                      <div className="w-14 h-14 rounded-xl bg-[#080e1a] overflow-hidden shrink-0 border border-[#213757] flex items-center justify-center relative shadow-inner">
                        {failedImages[item.product.image] || !item.product.image ? (
                          <div className="w-full h-full bg-[#13223c] flex items-center justify-center text-orange-400 font-black text-xs font-sans">
                            GB
                          </div>
                        ) : (
                          <img
                            src={item.product.image}
                            alt=""
                            onError={() => {
                              setFailedImages((prev) => ({ ...prev, [item.product.image]: true }));
                            }}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      
                      {/* Middle: Details */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black text-slate-100 leading-snug truncate group-hover:text-white transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
                          {item.product.name[language]}
                        </p>
                        
                        {(item.selectedSize || item.selectedColor) && (
                          <div className={`flex flex-wrap gap-1 mt-1 text-[9px] text-slate-350 font-bold font-sans ${isRtl ? 'justify-end' : 'justify-start'}`}>
                            {item.selectedSize && (
                              <span className="bg-[#192942] px-2 py-0.5 rounded-full border border-[#263e63] shrink-0">
                                {language === 'ar' ? 'المقاس: ' : language === 'en' ? 'Size: ' : 'Taille : '}{item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-[#192942] px-2 py-0.5 rounded-full border border-[#263e63] shrink-0">
                                {language === 'ar' ? 'اللون: ' : language === 'en' ? 'Color: ' : 'Couleur : '}{item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <p className={`text-[11px] font-black font-mono text-orange-400 mt-1 flex items-center gap-1 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                          <span>{item.product.price} {t('moroccoCurrency')}</span>
                          <span className="text-[9px] text-slate-400 font-sans">x {item.quantity}</span>
                        </p>
                      </div>

                      {/* Right: Quantity Adjusters + Delete */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                        {/* Up/Down buttons */}
                        <div className="flex items-center bg-[#070d1a] rounded-lg border border-[#213757] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 hover:bg-[#13223c] text-slate-400 hover:text-white cursor-pointer flex items-center justify-center transition-colors border-r border-[#213757]"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus size={10} strokeWidth={3} />
                          </button>
                          <span className="w-8 text-center text-xs font-black font-mono text-white select-none">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 hover:bg-[#13223c] text-slate-400 hover:text-white cursor-pointer flex items-center justify-center transition-colors border-l border-[#213757]"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus size={10} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Trash */}
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                          aria-label="Supprimer de la liste"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Free Shipping Progress Tracker */}
              {subtotal < 500 ? (
                <div className="bg-gradient-to-r from-[#1c1206] to-[#2c1d0c] border border-orange-500/25 p-4 rounded-2xl shadow-lg space-y-2.5">
                  <div className={`flex justify-between items-center text-[11px] font-black ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-amber-300 font-sans leading-tight">
                      {language === 'ar' 
                        ? `أضف ${500 - subtotal} درهم إضافية للاستفادة من التوصيل المجاني` 
                        : language === 'en'
                          ? `Add ${500 - subtotal} DH more to unlock Free Shipping`
                          : `Ajoutez encore ${500 - subtotal} DH pour bénéficier de la livraison gratuite.`}
                    </span>
                    <span className="font-mono text-[10px] text-orange-400 bg-orange-950/65 px-2 py-0.5 rounded border border-orange-500/20">
                      {Math.round((subtotal / 500) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#080e1a] h-2.5 rounded-full overflow-hidden border border-[#213757]/80">
                    <div 
                      className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 h-2.5 rounded-full transition-all duration-550 shadow-[0_0_10px_rgba(234,88,12,0.35)]" 
                      style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#071d15] to-[#0c3122] border border-emerald-500/35 p-3.5 rounded-2xl text-[11px] font-black text-emerald-300 flex items-center gap-2 justify-center font-sans shadow-md">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 animate-pulse" />
                  <span>
                    {language === 'ar' 
                      ? "تهانينا! لقد حصلت على توصيل مجاني لطلبك!" 
                      : language === 'en'
                        ? "Congratulations! You have unlocked FREE DELIVERY!"
                        : "Félicitations ! Livraison gratuite activée."}
                  </span>
                </div>
              )}

              {/* Card 3: Free Shipping / Delivery Notice Badge */}
              <div className="bg-slate-900/50 border border-[#22395e]/40 p-3 rounded-2xl text-[10px] text-slate-350 leading-relaxed font-bold font-sans flex items-center gap-2 shrink-0">
                <Truck className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                <span className="flex-1">
                  {language === 'ar'
                    ? "الشحن مجاني لجميع الطلبات بقيمة 500 درهم أو أكثر. الشحن العادي هو 35 درهم فقط لكافة مدن المغرب."
                    : language === 'en'
                      ? "Free delivery for orders of 500 DH+. Otherwise normal shipping is 35 DH all over Morocco."
                      : "La livraison est GRATUITE dès 500 DH d'achat. Sinon, les frais de livraison s'élèvent à seulement 35 DH partout au Maroc."}
                </span>
              </div>

              {/* Card 4: Detailed Order Summary Card */}
              <div className="bg-[#0c1424] border border-[#213757] p-4.5 rounded-2xl shadow-xl space-y-3 font-sans">
                <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-400">
                  <span>{t('subtotalLabel')}</span>
                  <span className="font-mono text-slate-100 font-extrabold">{subtotal} {t('moroccoCurrency')}</span>
                </div>
                
                <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-400 pb-3 border-b border-[#213757]/80">
                  <span>{t('deliveryCostLabel')}</span>
                  {freeShipping ? (
                    <span className="font-black text-emerald-400 text-[10px] uppercase bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
                      {language === 'ar' ? 'مجاني' : language === 'en' ? 'Free' : 'Gratuite'}
                    </span>
                  ) : (
                    <span className="font-mono font-black text-orange-400 bg-orange-950/20 px-2.5 py-0.5 rounded border border-orange-500/10">
                      35 {t('moroccoCurrency')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[12.5px] font-black text-slate-200 uppercase tracking-wider">{t('totalLabel')}</span>
                  <span className="font-mono text-orange-400 text-xl font-black">{total} {t('moroccoCurrency')}</span>
                </div>
              </div>

              {/* Card 5: Customer Checkout / Information Form Card */}
              <div className="bg-[#0c1424] border border-[#213757] p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
                
                {/* Section Header */}
                <div className={`flex items-start gap-2.5 border-b border-[#213757]/80 pb-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5 text-orange-400" />
                  </div>
                  <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-wider leading-tight">
                      {t('checkoutTitle')}
                    </h3>
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                      {t('checkoutSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Secure Information Notice */}
                <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl text-[10px] text-orange-200/90 leading-relaxed font-bold font-sans flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>
                    {language === 'ar' 
                      ? "الدفع نقدًا عند استلام الطرد الخاص بك. يرجى ملء الحقول التالية لتأكيد التوصيل."
                      : language === 'en'
                        ? "Secure 100% Cash on Delivery payment. Please fill out details below for quick shipping."
                        : "Paiement 100% sécurisé à la livraison (En Espèces). Veuillez renseigner ces champs pour débuter la livraison."}
                  </span>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  
                  {/* Full Name field */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <User className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{language === 'ar' ? 'الاسم الكامل *' : language === 'en' ? 'Full Name *' : 'Nom complet *'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('fullNamePlaceholder')}
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      className={`w-full bg-[#13223c] border ${formErrors.fullName ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[#253d66] focus:border-orange-500 focus:ring-orange-500/20'} text-xs text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                      required
                    />
                    {formErrors.fullName && (
                      <div className={`flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <span className="shrink-0 text-xs">⚠️</span>
                        <span className="font-sans leading-tight">{formErrors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{language === 'ar' ? 'رقم الهاتف المحمول *' : language === 'en' ? 'Mobile Phone *' : 'Téléphone portable *'}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full bg-[#13223c] border ${formErrors.phoneNumber ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[#253d66] focus:border-orange-500 focus:ring-orange-500/20'} text-xs text-white placeholder-slate-400 rounded-xl ${isRtl ? 'pl-20 pr-4 text-right' : 'pr-20 pl-4 text-left'} py-3 outline-none focus:ring-4 transition-all font-sans`}
                        required
                      />
                      <span className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-3 text-slate-400 text-[10px] font-extrabold flex items-center gap-1 bg-[#1a2f52] border border-[#2c4b7b] rounded-md px-2 py-0.5 select-none`}>
                        <span className="shrink-0">🇲🇦</span>
                        <span>{language === 'ar' ? 'المغرب' : 'Maroc'}</span>
                      </span>
                    </div>
                    {formErrors.phoneNumber && (
                      <div className={`flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <span className="shrink-0 text-xs">⚠️</span>
                        <span className="font-sans leading-tight">{formErrors.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* City Select Dropdown Field */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{language === 'ar' ? 'مدينة التوصيل *' : language === 'en' ? 'Delivery City *' : 'Ville de livraison *'}</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className={`w-full bg-[#13223c] border ${formErrors.city ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[#253d66] focus:border-orange-500 focus:ring-orange-500/20'} text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all font-sans cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                      required
                    >
                      <option value="" disabled className="text-slate-400 bg-[#0c1424]">
                        -- {t('selectCityText')} --
                      </option>
                      {MOROCCAN_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-[#0c1424] text-white py-2">
                          {c}
                        </option>
                      ))}
                    </select>
                    {formErrors.city && (
                      <div className={`flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <span className="shrink-0 text-xs">⚠️</span>
                        <span className="font-sans leading-tight">{formErrors.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Physical Address Field */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <Home className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{language === 'ar' ? 'العنوان الدقيق للتسليم *' : language === 'en' ? 'Exact Street Address *' : 'Adresse exacte de livraison *'}</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t('deliveryAddressPlaceholder')}
                      value={deliveryAddress}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className={`w-full bg-[#13223c] border ${formErrors.deliveryAddress ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[#253d66] focus:border-orange-500 focus:ring-orange-500/20'} text-xs text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all font-sans resize-none ${isRtl ? 'text-right' : 'text-left'}`}
                      required
                    />
                    {formErrors.deliveryAddress && (
                      <div className={`flex items-center gap-1.5 text-rose-400 text-[10px] font-bold mt-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <span className="shrink-0 text-xs">⚠️</span>
                        <span className="font-sans leading-tight">{formErrors.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes Field (Sizes, colors, etc.) */}
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{language === 'ar' ? 'ملاحظات إضافية (اختياري)' : language === 'en' ? 'Order Notes (Optional)' : 'Notes de commande (Optionnel)'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('notesPlaceholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`w-full bg-[#13223c] border border-[#253d66] focus:border-orange-500 focus:ring-orange-500/20 text-xs text-white placeholder-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-4 transition-all font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  {/* Global Quantity Warning */}
                  {formErrors.quantity && (
                    <div className="text-rose-400 text-[11px] font-black text-center bg-rose-950/20 border border-rose-900/30 py-2 px-3 rounded-xl">
                      {formErrors.quantity}
                    </div>
                  )}

                  {/* Action Buttons: Submit Form CTA */}
                  <div className="space-y-3 pt-2 select-none">
                    {/* CONFIRM COMMANDE BUTTON */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:via-orange-400 hover:to-amber-500 active:scale-[0.98] outline-none focus:ring-4 focus:ring-orange-500/20 text-white font-black text-xs sm:text-sm py-4 px-4 rounded-xl shadow-lg shadow-orange-950/25 transition-all flex items-center justify-center gap-2 tracking-wide uppercase ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{language === 'ar' ? 'جاري معالجة طلبكم...' : language === 'en' ? 'Processing...' : 'Traitement de votre commande...'}</span>
                        </span>
                      ) : (
                        <span>{t('btnConfirmOrder')}</span>
                      )}
                    </button>

                    {/* ORDER VIA WHATSAPP BUTTON (Green theme) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onWhatsAppOrder) {
                          onWhatsAppOrder({
                            items: cart,
                            form: {
                              fullName: fullName || (language === 'ar' ? 'زبون واتساب' : 'Client WhatsApp'),
                              phoneNumber: phoneNumber || "",
                              city: city || "",
                              deliveryAddress: deliveryAddress || "",
                              notes: notes || ""
                            },
                            source: 'cart'
                          });
                        } else {
                          window.open(WHATSAPP_LINK, '_blank', 'noreferrer');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-[#10b981] hover:from-emerald-500 hover:to-[#34d399] active:scale-[0.98] outline-none focus:ring-4 focus:ring-emerald-500/20 text-white font-black text-xs sm:text-sm py-4 px-4 rounded-xl shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2.5 tracking-wide uppercase"
                    >
                      <WhatsAppIcon className="w-4.5 h-4.5 text-white shrink-0" />
                      <span>{t('btnOrderWhatsApp')}</span>
                    </button>
                  </div>
                </form>

                {/* Card 6: Clean Trust Badges Inside Checkout Form Card */}
                <div className="pt-4 border-t border-[#213757]/80 grid grid-cols-2 gap-2 text-[9.5px] text-slate-300 font-bold font-sans">
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('trust_cod_title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <Compass className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('trust_morocco_delivery_title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <Truck className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('trust_free_delivery_title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <WhatsAppIcon className="w-4 h-4 text-orange-400 shrink-0 fill-current" />
                    <span>{t('trust_whatsapp_title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('trust_fast_support_title')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0b1528] px-2.5 py-2.5 rounded-xl border border-[#1e324e] hover:border-orange-500/25 transition-all">
                    <Star className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{t('trust_verified_products_title')}</span>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

