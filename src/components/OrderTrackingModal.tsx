import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Phone, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  BadgeCheck, 
  XCircle, 
  HelpCircle,
  Coins,
  AlertCircle
} from 'lucide-react';
import { Language, Order } from '../types';
import { WA_LINK, ORDER_SUPPORT_NUMBER, WHATSAPP_NUMBER, DISPLAY_PHONE, WHATSAPP_LINK } from '../data';
import WhatsAppIcon from './WhatsAppIcon';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function OrderTrackingModal({ isOpen, onClose, language }: OrderTrackingModalProps) {
  const [orderRefInput, setOrderRefInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isRtl = language === 'ar';

  useEffect(() => {
    if (!isOpen) {
      setOrderRefInput('');
      setPhoneInput('');
      setMatchedOrders([]);
      setSelectedOrder(null);
      setHasSearched(false);
      setIsLoading(false);
      setValidationError(null);
    }
  }, [isOpen]);

  const t = {
    title: {
      fr: "Suivi de Commande",
      ar: "تتبع طلبك",
      en: "Track Your Order"
    },
    subtitle: {
      fr: "Suivez l'état de votre colis Globabox en temps réel partout au Maroc.",
      ar: "تابع حالة شحنتك من جلوبابوكس مباشرة وفي أي مكان في المغرب.",
      en: "Track your Globabox package status in real-time anywhere in Morocco."
    },
    orderRefLabel: {
      fr: "Référence ou N° de commande",
      ar: "رقم الطلب أو المرجع",
      en: "Order Reference or ID"
    },
    orderRefPlaceholder: {
      fr: "Ex: GB-123456 ou 171889",
      ar: "مثال: GB-123456 أو 171889",
      en: "e.g. GB-123456 or 171889"
    },
    phoneLabel: {
      fr: "Numéro de téléphone",
      ar: "رقم الهاتف",
      en: "Phone Number"
    },
    phonePlaceholder: {
      fr: "Ex: 0612345678",
      ar: "مثال: 0612345678",
      en: "e.g. 0612345678"
    },
    formHelp: {
      fr: "Saisissez l'un ou l'autre de ces champs pour localiser votre commande.",
      ar: "أدخل أحد هذه الحقول لتحديد موقع طلبك.",
      en: "Enter either of these fields to locate your order."
    },
    validationRequired: {
      fr: "Veuillez remplir au moins un champ (Référence ou N° de Téléphone) pour lancer la recherche.",
      ar: "يرجى ملء حقل واحد على الأقل (رقم الطلب أو رقم الهاتف) لبدء البحث.",
      en: "Please fill in at least one field (Order reference or Phone number) to start searching."
    },
    btnSearch: {
      fr: "Rechercher mon colis",
      ar: "بحث عن طلبي",
      en: "Track My Package"
    },
    searching: {
      fr: "Recherche en cours...",
      ar: "جاري البحث...",
      en: "Searching..."
    },
    noResults: {
      fr: "Aucune commande trouvée. Vérifiez votre numéro de commande ou votre téléphone.",
      ar: "لم يتم العثور على أي طلب. المرجو التأكد من رقم الطلب أو رقم الهاتف.",
      en: "No order found. Please check your order reference or phone number."
    },
    multipleFound: {
      fr: "Plusieurs commandes trouvées. Sélectionnez celle que vous souhaitez suivre :",
      ar: "تم العثور على عدة طلبيات. اختر الطلب المراد تتبعه :",
      en: "Multiple orders found. Select the one you want to track:"
    },
    orderRef: {
      fr: "Commande",
      ar: "الطلب رقم",
      en: "Order"
    },
    orderDate: {
      fr: "Date du commande",
      ar: "تاريخ الطلب",
      en: "Order Date"
    },
    paymentMethod: {
      fr: "Mode de paiement",
      ar: "طريقة الدفع",
      en: "Payment Method"
    },
    codValue: {
      fr: "Paiement à la livraison (Cash on Delivery)",
      ar: "الدفع عند الاستلام",
      en: "Cash on delivery"
    },
    backToSearch: {
      fr: "Faire une nouvelle recherche",
      ar: "البحث مجدداً",
      en: "New Search"
    },
    needHelp: {
      fr: "Une question ou besoin de modifier l'adresse de livraison de votre colis ?",
      ar: "هل لديك سؤال أو ترغب في تعديل تفاصيل أو عنوان التوصيل لطلبكم ؟",
      en: "Any question or need to update your package delivery details?"
    },
    contactSupport: {
      fr: "Contacter le support WhatsApp",
      ar: "التواصل مع الدعم عبر واتساب",
      en: "Contact WhatsApp Support"
    },
    subtotalLabel: {
      fr: "Sous-total",
      ar: "المجموع الفرعي",
      en: "Subtotal"
    },
    shippingLabel: {
      fr: "Livraison",
      ar: "الشحن",
      en: "Shipping"
    },
    shippingFree: {
      fr: "Gratuit",
      ar: "مجاني",
      en: "Free"
    },
    totalLabel: {
      fr: "Total à régler",
      ar: "المجموع الكلي",
      en: "Grand Total"
    },
    clientLabel: {
      fr: "Client",
      ar: "الزبون",
      en: "Customer"
    },
    cityLabel: {
      fr: "Ville",
      ar: "المدينة",
      en: "City"
    },
    contentsLabel: {
      fr: "Détails du colis",
      ar: "محتوى الطرد",
      en: "Package Details"
    },
    statusTitle: {
      fr: "État actuel",
      ar: "الحالة الحالية",
      en: "Current Status"
    }
  };

  const statusLabelMap = {
    fr: {
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée"
    },
    ar: {
      pending: "في انتظار التأكيد",
      confirmed: "تم التأكيد",
      processing: "قيد التجهيز",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغاة"
    },
    en: {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled"
    }
  };

  const statusDescMap = {
    fr: {
      pending: "Votre commande est enregistrée et en attente de traitement.",
      confirmed: "Notre service client a validé vos détails de livraison.",
      processing: "Votre colis est soigneusement préparé et emballé au dépôt.",
      shipped: "Votre colis est confié au transporteur. Livraison en cours.",
      delivered: "Votre colis a été remis en mains propres et payé. Merci !",
      cancelled: "Cette commande a été annulée ou suspendue."
    },
    ar: {
      pending: "تم تسجيل طلبك بنجاح وفي انتظار المعالجة.",
      confirmed: "قوم فريقنا بتأكيد معلوماتك وتأهيل شحنتك.",
      processing: "يتم الآن معاينة واختبار منتجك وتغليفه بمستودعنا بالدار البيضاء.",
      shipped: "تم تسليم شحنتك للموزع. التوصيل جارٍ الآن إلى عنوانك.",
      delivered: "تم استلام الطلبية وتفقدها والتسديد بنجاح. شكراً لثقتكم !",
      cancelled: "تم إلغاء هذا الطلب أو تعليقه."
    },
    en: {
      pending: "Your order has been registered and awaits processing.",
      confirmed: "Our customer service has validated your delivery details.",
      processing: "Your package is being carefully prepared and packed at our warehouse.",
      shipped: "Your package is with the prompt courier. Delivery underway.",
      delivered: "Your package has been successfully delivered and paid for. Thank you!",
      cancelled: "This order has been cancelled or suspended."
    }
  };

  const getTxt = (key: keyof typeof t) => {
    return t[key][language] || t[key]['fr'];
  };

  const cleanPhoneString = (phone: string) => {
    let cleaned = phone.replace(/[+\-\s()]/g, '');
    if (cleaned.startsWith('212')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setHasSearched(true);
    setSelectedOrder(null);

    const refQuery = orderRefInput.trim().toLowerCase();
    const phoneQuery = phoneInput.trim();

    if (!refQuery && !phoneQuery) {
      setValidationError(getTxt('validationRequired'));
      setMatchedOrders([]);
      return;
    }

    // Customer tracking must not read all private orders or local cached PII.
    // Keep self-service lookup disabled until a scoped, rate-limited API is available.
    setMatchedOrders([]);
    setValidationError(language === 'ar'
      ? 'التتبع عبر الموقع غير متوفر مؤقتاً. تواصل معنا عبر واتساب مع رقم طلبك.'
      : language === 'en'
        ? 'Online tracking is temporarily unavailable. Contact us on WhatsApp with your order reference.'
        : 'Suivi en ligne temporairement indisponible. Contactez-nous sur WhatsApp avec votre référence.');
    setIsLoading(false);
  };

  const handleSupportClick = (orderId?: string) => {
    const text = orderId 
      ? `Bonjour, je souhaite suivre ma commande n° ${orderId}`
      : `Bonjour, je souhaite suivre ma commande Globabox.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noreferrer');
  };

  // Stepper elements layout
  const renderTimeline = (order: Order) => {
    const isCancelled = order.status === 'cancelled';

    // Steps list
    const stepsList: ('pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered')[] = [
      'pending', 
      'confirmed', 
      'processing', 
      'shipped', 
      'delivered'
    ];

    const getStepIndex = (status: string) => {
      switch (status) {
        case 'pending': return 0;
        case 'confirmed': return 1;
        case 'processing': return 2;
        case 'shipped': return 3;
        case 'delivered': return 4;
        default: return 0;
      }
    };

    const activeIndex = getStepIndex(order.status);

    const getIcon = (key: string, className: string) => {
      switch (key) {
        case 'pending': return <Clock className={className} />;
        case 'confirmed': return <CheckCircle className={className} />;
        case 'processing': return <Package className={className} />;
        case 'shipped': return <Truck className={className} />;
        case 'delivered': return <BadgeCheck className={className} />;
        default: return <Clock className={className} />;
      }
    };

    return (
      <div className="space-y-6 relative mt-4">
        {/* If the order is cancelled, we render a highly visible red notice at the top of the stepper */}
        {isCancelled && (
          <div className="p-4 bg-red-950/40 border border-red-500/35 rounded-2xl flex items-start gap-3.5 text-left mb-6 animate-pulse">
            <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans">
              <h5 className="font-black text-red-400 text-xs uppercase tracking-wider">
                {statusLabelMap[language].cancelled}
              </h5>
              <p className="text-[11px] text-red-200/90 leading-relaxed font-medium">
                {statusDescMap[language].cancelled}
              </p>
            </div>
          </div>
        )}

        {/* Stepper Connector Line */}
        {!isCancelled && (
          <div className={`absolute ${isRtl ? 'right-[21px]' : 'left-[21px]'} top-5 bottom-5 w-0.5 bg-slate-800 pointer-events-none`}>
            <div 
              className="absolute top-0 w-full bg-emerald-500 transition-all duration-750"
              style={{ height: `${(activeIndex / (stepsList.length - 1)) * 100}%` }}
            />
          </div>
        )}

        {stepsList.map((stepKey, idx) => {
          const isCompleted = !isCancelled && idx < activeIndex;
          const isActive = !isCancelled && idx === activeIndex;
          const isMuted = isCancelled || idx > activeIndex;

          const stepTitle = statusLabelMap[language][stepKey];
          const stepDesc = statusDescMap[language][stepKey];

          let iconWrapperClass = "bg-slate-900 border-2 border-slate-700 text-slate-500";
          
          if (isCompleted) {
            iconWrapperClass = "bg-emerald-500 border-2 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10";
          } else if (isActive) {
            iconWrapperClass = "bg-orange-500 border-2 border-orange-400 text-white shadow-xl shadow-orange-500/20 scale-110 animate-pulse-slow";
          }

          return (
            <div key={stepKey} className="flex gap-4 items-start relative z-10">
              {/* Stepper Circle Icon */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${iconWrapperClass}`}>
                {getIcon(stepKey, "w-5 h-5")}
              </div>

              {/* Status details text info */}
              <div className="flex-1 min-w-0 pt-1 text-left">
                <span className={`text-xs font-black tracking-tight block ${isActive ? 'text-orange-400 font-extrabold' : isCompleted ? 'text-slate-100' : 'text-slate-500'}`}>
                  {stepTitle}
                </span>
                <p className={`text-[10px] leading-relaxed mt-0.5 ${isActive ? 'text-slate-200' : isCompleted ? 'text-slate-405 font-medium' : 'text-slate-600'}`}>
                  {stepDesc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getComputedSubtotal = (order: Order) => {
    if (order.subtotal && order.subtotal > 0) return order.subtotal;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getComputedShipping = (order: Order, subtotal: number) => {
    if (order.shippingCost !== undefined) return order.shippingCost;
    if (order.freeShipping) return 0;
    const diff = order.total - subtotal;
    return diff > 0 ? diff : 0;
  };

  return (
    <div 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0b1528] text-white border border-[#22395e]/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Glow decorative graphics */}
        <div className="absolute top-0 -left-20 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="relative p-5 md:p-6 border-b border-[#1c2e4a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white leading-tight font-sans">
                {getTxt('title')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-md font-sans leading-none">
                {getTxt('subtitle')}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#13223c]/40 hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Scroll Area */}
        <div className="p-5 md:p-6 overflow-y-auto no-scrollbar flex-1 space-y-5">
          
          {/* Validation errors alerts */}
          {validationError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-semibold rounded-xl text-left flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Search Inputs Interface */}
          {!selectedOrder && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <p className="text-[11px] text-slate-400">
                  {getTxt('formHelp')}
                </p>

                {/* Double inputs layout */}
                <div className="space-y-3">
                  
                  {/* Order reference block */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black tracking-wider uppercase text-slate-300">
                      {getTxt('orderRefLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={getTxt('orderRefPlaceholder')}
                        value={orderRefInput}
                        onChange={(e) => setOrderRefInput(e.target.value)}
                        className={`w-full bg-[#13223c] text-white placeholder-slate-500 text-xs py-2.5 px-4 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 border border-[#22395e] transition-all font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                  </div>

                  {/* OR divider label */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-[#1c2e4a]"></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{language === 'ar' ? 'أو' : 'OU'}</span>
                    <div className="flex-1 h-[1px] bg-[#1c2e4a]"></div>
                  </div>

                  {/* Phone number block */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black tracking-wider uppercase text-slate-300">
                      {getTxt('phoneLabel')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={getTxt('phonePlaceholder')}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className={`w-full bg-[#13223c] text-white placeholder-slate-500 text-xs py-2.5 px-4 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 border border-[#22395e] transition-all font-sans ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-810 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-orange-950/40 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <Search className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isLoading ? getTxt('searching') : getTxt('btnSearch')}</span>
                </button>
              </form>

              {/* Multiple orders or search reports */}
              {hasSearched && (
                <div className="space-y-3 pt-2">
                  {matchedOrders.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                      <Clock className="w-7 h-7 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-center">
                        {getTxt('noResults')}
                      </p>
                    </div>
                  ) : matchedOrders.length > 1 ? (
                    <div className="space-y-2 text-left">
                      <p className="text-[11px] font-bold text-slate-300">
                        {getTxt('multipleFound')}
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                        {matchedOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="bg-[#13223c]/50 hover:bg-[#1e3254]/50 border border-[#22395e]/50 hover:border-orange-500/40 rounded-xl p-3 text-left w-full transition-all flex items-center justify-between text-xs outline-none group cursor-pointer"
                          >
                            <div className="space-y-1 font-sans">
                              <span className="font-mono font-black text-white group-hover:text-orange-400 transition-colors">
                                #{order.reference || order.id}
                              </span>
                              <div className="text-slate-400 text-[10px] flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>{new Date(order.date || Date.now()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="font-bold text-slate-200 block">
                                {order.total} DH
                              </span>
                              <span className={`text-[10px] uppercase font-bold tracking-wide ${order.status === 'delivered' ? 'text-emerald-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-orange-400'}`}>
                                {statusLabelMap[language][order.status] || order.status}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Active tracking overview card */}
          {selectedOrder && (
            <div className="space-y-5 animate-fade-in text-left">
              
              {/* Reset to fresh search form capsule */}
              <div className="flex items-center justify-between border-b border-[#1c2e4a] pb-3 shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-bold transition-all cursor-pointer"
                >
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? '' : 'rotate-180'}`} />
                  <span>{getTxt('backToSearch')}</span>
                </button>
                <div className="bg-[#13223c] px-3 py-1 rounded-full border border-[#22395e] text-[10px] tracking-wide text-slate-300 font-mono font-bold">
                  #{selectedOrder.reference || selectedOrder.id}
                </div>
              </div>

              {/* Clean tracking core block card */}
              <div className="bg-[#13223c]/40 rounded-2xl p-4 border border-[#22395e]/30 font-sans text-xs space-y-3.5">
                
                {/* Meta details checklist */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-450 block text-[9px] uppercase tracking-wider">
                      {getTxt('clientLabel')}
                    </span>
                    <strong className="font-bold text-slate-100 block">
                      {selectedOrder.fullName}
                    </strong>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {selectedOrder.phoneNumber}
                    </span>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-slate-450 block text-[9px] uppercase tracking-wider">
                      {getTxt('cityLabel')}
                    </span>
                    <strong className="font-bold text-slate-100 block">
                      {selectedOrder.city}
                    </strong>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {selectedOrder.deliveryAddress}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#1c2e4a] pt-3.5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-450 block text-[9px] uppercase tracking-wider">
                      {getTxt('orderDate')}
                    </span>
                    <span className="text-slate-200 block font-medium">
                      {new Date(selectedOrder.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-slate-450 block text-[9px] uppercase tracking-wider">
                      {getTxt('paymentMethod')}
                    </span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 select-none">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{getTxt('codValue')}</span>
                    </span>
                  </div>
                </div>

                {/* Subproducts items checklist */}
                <div className="border-t border-[#1c2e4a] pt-3.5 space-y-2">
                  <span className="text-slate-450 block text-[9px] uppercase tracking-wider font-bold">
                    {getTxt('contentsLabel')}
                  </span>
                  <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                    {selectedOrder.items && selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#13223c] px-1.5 py-0.5 rounded text-slate-300 font-mono text-[9px] font-black">
                            {it.quantity}x
                          </span>
                          <span className="text-slate-200 font-medium truncate max-w-[190px]">
                            {it.productName}
                          </span>
                        </div>
                        <span className="font-bold text-slate-350">
                          {it.price * it.quantity} DH
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & calculations section */}
                {(() => {
                  const subTotalVal = getComputedSubtotal(selectedOrder);
                  const shippingVal = getComputedShipping(selectedOrder, subTotalVal);

                  return (
                    <div className="border-t border-[#1c2e4a] pt-3.5 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{getTxt('subtotalLabel')}</span>
                        <span>{subTotalVal} DH</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{getTxt('shippingLabel')}</span>
                        <span className={shippingVal === 0 ? 'text-emerald-400 font-bold' : ''}>
                          {shippingVal === 0 ? getTxt('shippingFree') : `${shippingVal} DH`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-white font-black border-t border-[#1c2e4a] pt-2">
                        <span className="text-slate-200">{getTxt('totalLabel')}</span>
                        <span className="text-orange-400 text-sm font-mono">{selectedOrder.total} DH</span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Status Stepper Container */}
              <div className="bg-[#0e1b33] rounded-2xl p-4 border border-[#1b2d4c]/80 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2e4a] pb-2.5">
                  <h4 className="text-xs font-black tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{getTxt('statusTitle')}</span>
                  </h4>
                  
                  {/* Badge top indicator */}
                  <span className={`text-[10px] font-serif font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                    selectedOrder.status === 'delivered' 
                      ? 'bg-emerald-505/10 text-emerald-400 border border-emerald-500/25' 
                      : selectedOrder.status === 'cancelled'
                        ? 'bg-red-505/10 text-red-400 border border-red-500/25 animate-pulse'
                        : 'bg-orange-505/10 text-orange-400 border border-orange-500/25'
                  }`}>
                    {statusLabelMap[language][selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
                {renderTimeline(selectedOrder)}
              </div>

            </div>
          )}

          {/* Core Support Contacts and Reassurances Block */}
          <div className="pt-4 border-t border-[#1c2e4a] text-center space-y-3 shrink-0">
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed font-sans font-medium">
              {getTxt('needHelp')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleSupportClick(selectedOrder?.id)}
                className="flex-1 py-3 bg-[#13223c] hover:bg-[#1e3254] border border-[#22395e] text-emerald-400 hover:text-emerald-300 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{getTxt('contactSupport')}</span>
              </button>
              
              <a
                href={`tel:${ORDER_SUPPORT_NUMBER}`}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-950 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-850 shrink-0"
              >
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>{ORDER_SUPPORT_NUMBER}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
