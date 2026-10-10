import { CheckCircle, X, ShieldAlert, MessageSquare, Compass, Info, ShoppingBag } from 'lucide-react';
import { CartItem, Language, CheckoutForm } from '../types';
import { TRANSLATIONS } from '../translations';
import { triggerWhatsAppClick } from '../utils/analytics';
import { WHATSAPP_NUMBER, DISPLAY_PHONE } from '../data';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  orderData: {
    reference: string;
    form: CheckoutForm;
    items: CartItem[];
    subtotal?: number;
    shippingCost?: number;
    total: number;
    freeShipping?: boolean;
  } | null;
  onContinueShopping?: () => void;
  onGoHome?: () => void;
  onOpenTracking?: () => void;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  language,
  orderData,
  onContinueShopping,
  onGoHome,
  onOpenTracking,
}: OrderSuccessModalProps) {
  if (!isOpen || !orderData) return null;

  const isRtl = language === "ar";
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const { reference, form, items, total, subtotal, shippingCost, freeShipping } = orderData;

  // Derive display values safely to handle older orders
  const finalSubtotal = subtotal !== undefined ? subtotal : (total >= 500 ? total : Math.max(0, total - 35));
  const finalShippingCost = shippingCost !== undefined ? shippingCost : (total >= 500 ? 0 : 35);
  const isFreeDelivery = freeShipping !== undefined ? freeShipping : (total >= 500);

  const navTranslations = {
    backToShop: {
      fr: "Retour à la boutique",
      ar: "العودة إلى المتجر",
      en: "Back to Shop",
    },
    continueShopping: {
      fr: "Continuer mes achats",
      ar: "متابعة التسوق",
      en: "Continue Shopping",
    },
    home: {
      fr: "Accueil",
      ar: "الرئيسية",
      en: "Home",
    },
    trackOrder: {
      fr: "Suivre ma commande",
      ar: "تتبع طلبي",
      en: "Track My Order",
    }
  };

  const getTranslation = (key: 'backToShop' | 'continueShopping' | 'home' | 'trackOrder') => {
    return navTranslations[key]?.[language] || navTranslations[key]?.['fr'];
  };

  // Build WhatsApp pre-filled confirmation text blocks
  const handleWhatsAppConfirm = () => {
    const productBlocks = items.map((it, idx) => {
      let name = it.product.name[language] || it.product.name['fr'];
      if (it.selectedSize || it.selectedColor) {
        const parts = [];
        if (it.selectedSize) parts.push(`Taille: ${it.selectedSize}`);
        if (it.selectedColor) parts.push(`Couleur: ${it.selectedColor}`);
        name += ` (${parts.join(', ')})`;
      }
      const productTotal = it.product.price * it.quantity;
      return `${idx + 1}. ${name}\n   Quantité: ${it.quantity}\n   Prix unitaire: ${it.product.price} DH\n   Total produit: ${productTotal} DH`;
    }).join('\n\n');

    const deliveryStr = isFreeDelivery ? 'Livraison gratuite' : `${finalShippingCost} DH`;

    const messageText = `Bonjour Globabox, je souhaite confirmer ma commande.

INFORMATIONS CLIENT:
Nom: ${form.fullName}
Téléphone: ${form.phoneNumber}
Ville: ${form.city}
Adresse: ${form.deliveryAddress}

PRODUITS COMMANDÉS:

${productBlocks}

LIVRAISON:
${deliveryStr}

RÉSUMÉ:
Sous-total: ${finalSubtotal} DH
Livraison: ${deliveryStr}
Total à payer: ${total} DH

PAIEMENT:
Paiement à la livraison

Merci de confirmer la disponibilité et la livraison.`;

    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    triggerWhatsAppClick(`Order Success Modal Confirm - Ref: ${reference}`);
    window.open(waUrl, '_blank', 'noreferrer');
  };

  return (
    <div
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="fixed inset-0 z-50 bg-[#070d1a]/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl text-center flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Absolute Close Icon */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-4 text-center scrollbar-thin">
          
          {/* Globabox brand header */}
          <div className="flex items-center justify-center gap-1.5 opacity-85 select-none mt-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-white text-[10px] font-black font-sans">G</div>
            <span className="text-xs font-black text-slate-800 tracking-widest font-sans">GLOBABOX.COM</span>
          </div>

          {/* Success Icon Badge */}
          <div className="mx-auto w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center border border-orange-200 shadow-sm relative shrink-0">
            <CheckCircle className="w-8 h-8 text-orange-600 animate-bounce" />
          </div>

          {/* Modal Head text */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {isRtl ? 'شكراً لكم على طلبكم !' : 'Merci pour votre commande !'}
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-sans px-2">
              {t('orderSuccessDesc')}{' '}
              <span className="font-mono text-orange-600 font-bold bg-slate-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-slate-200 inline-block mt-1">
                {reference}
              </span>
            </p>
          </div>

          {/* Order Details Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 text-left space-y-2 text-xs font-sans">
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'الزبون :' : 'Client :'}</span>
              <span className="text-slate-850 font-bold">{form.fullName}</span>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'الهاتف :' : 'Téléphone :'}</span>
              <span className="text-slate-850 font-mono font-bold">{form.phoneNumber}</span>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'المدينة :' : 'Ville :'}</span>
              <span className="text-orange-600 font-bold">{form.city}</span>
            </div>
            <div className={`flex justify-between items-start pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500 shrink-0 mr-4">{isRtl ? 'العنوان :' : 'Adresse :'}</span>
              <span className="text-slate-800 text-right leading-relaxed">{form.deliveryAddress}</span>
            </div>
            <div className="pb-1.5 border-b border-slate-150 text-[11px] space-y-1">
              <span className="text-slate-500 block mb-1">{isRtl ? 'المنتجات :' : 'Produits :'}</span>
              <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/60 max-h-[110px] overflow-y-auto scrollbar-thin">
                {items.map((item, idx) => {
                  const name = item.product.name[language] || item.product.name['fr'];
                  const details = [];
                  if (item.selectedSize) details.push(item.selectedSize);
                  if (item.selectedColor) details.push(item.selectedColor);
                  const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
                  return (
                    <div key={idx} className="flex justify-between font-semibold text-slate-800 text-[10.5px]">
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        • {name}{detailStr} <span className="text-slate-400 font-mono font-normal">x{item.quantity}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">{(item.product.price * item.quantity)} DH</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'المجموع الفرعي :' : 'Sous-total :'}</span>
              <span className="text-slate-800 font-mono font-semibold">{finalSubtotal} DH</span>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'الشحن :' : 'Livraison :'}</span>
              <span className="font-semibold font-mono text-slate-800">
                {isFreeDelivery ? (isRtl ? 'شحن مجاني' : 'Livraison gratuite') : `${finalShippingCost} DH`}
              </span>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'طريقة الدفع :' : 'Paiement :'}</span>
              <span className="text-slate-800 font-semibold">{isRtl ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</span>
            </div>
            <div className={`flex justify-between items-center pb-1.5 border-b border-slate-150`}>
              <span className="text-slate-500">{isRtl ? 'حالة الطلب :' : 'Statut :'}</span>
              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {isRtl ? 'في انتظار التأكيد' : 'En attente de confirmation'}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-sm pt-1 text-slate-900">
              <span>{t('totalLabel')} :</span>
              <span className="font-mono text-base sm:text-lg text-orange-600">{total} DH</span>
            </div>
          </div>

          {/* Informative Instructions */}
          <div className="text-xs text-slate-650 leading-relaxed font-sans px-1 space-y-3">
            <p>{t('orderSuccessNext')}</p>
            <div className="bg-orange-50/70 border border-orange-200/50 p-3 rounded-xl text-[11px] text-orange-950 flex gap-2 items-start justify-center">
              <span className="inline-flex items-center gap-1 shrink-0 ring-1 ring-orange-500/15 rounded px-1.5 py-0.5 bg-orange-100 font-bold text-orange-700">
                <Info size={11} />
                <span>Info</span>
              </span>
              <p className="text-left font-medium leading-normal">
                {t('orderSuccessWhatsAppOption')}
              </p>
            </div>
          </div>

        </div>

        {/* Sticky/Fixed Bottom Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 sm:p-5 flex flex-col space-y-2.5 shrink-0">
          
          {/* Confirmer sur WhatsApp */}
          <button
            onClick={handleWhatsAppConfirm}
            className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-extrabold text-xs sm:text-sm py-3 px-6 rounded-2xl transition-all shadow-md shadow-emerald-100 cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Custom WhatsApp Icon */}
            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.261 2.266 3.504 5.279 3.504 8.486 0 6.657-5.338 11.997-12.007 11.997-2.005-.001-3.973-.501-5.727-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.514 0 10.012-4.486 10.012-10 0-2.672-1.037-5.184-2.922-7.07C16.65 1.65 14.134.61 11.534.61c-5.518 0-10.016 4.486-10.016 10 0 1.83.475 3.62 1.39 5.2l-.23 1.28L1.6 22.4l4.3-1.12.3-.12 1.25.75-.804-1.756zM18.1 14.5c-.35-.18-2.2-1.08-2.55-1.2-.35-.12-.6-.18-.85.18-.25.36-.95 1.2-1.15 1.4-.2.25-.4.25-.75.05-.35-.18-1.5-.55-2.85-1.75-1.05-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.72.15-.17.35-.4.5-.6.15-.2.2-.35.3-.5.1-.15.05-.3-.02-.45-.07-.15-.6-1.45-.82-1.98-.22-.53-.45-.45-.62-.46-.16 0-.35-.01-.55-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5s1.1 2.9 1.2 3.1c.15.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 2.2-.9 2.5-1.75.3-.85.3-1.57.2-1.72-.1-.05-.3-.15-.65-.35z" />
            </svg> 
            <span>{isRtl ? 'تأكيد على الواتساب' : 'Confirmer sur WhatsApp'}</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenTracking || onClose}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
            >
              <Info className="w-4 h-4 text-orange-600" />
              <span>{isRtl ? 'تتبع طلبي' : 'Suivre ma commande'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>{isRtl ? 'العودة للمتجر' : 'Retour à la boutique'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
