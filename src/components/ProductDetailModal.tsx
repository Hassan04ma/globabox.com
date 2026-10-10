import { useState, useEffect } from 'react';
import { X, ShoppingCart, MessageSquare, Star, BadgeCheck, Compass, ChevronLeft, ChevronRight, Truck, ShieldCheck, Flame, Info, Phone, Zap, Clock, Plus, Minus } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { getProductSocialProof } from '../utils/socialProof';
import { triggerWhatsAppClick } from '../utils/analytics';
import { WHATSAPP_NUMBER } from '../data';
import ProductImage from './ProductImage';
import WhatsAppIcon from './WhatsAppIcon';

interface ProductDetailModalProps {
  product: Product | null;
  language: Language;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onInstantCheckout: (product: Product, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onWhatsAppOrder?: (params: any) => void;
}

export default function ProductDetailModal({
  product,
  language,
  onClose,
  onAddToCart,
  onInstantCheckout,
  onWhatsAppOrder,
}: ProductDetailModalProps) {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'guarantees'>('info');
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
      setSelectedImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  const isRtl = language === "ar";
  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const isOutOfStock = product.inStock === false || product.stockStatus === 'out_of_stock';
  const isLimited = !isOutOfStock && product.stockStatus === 'limited';

  // Compile image list safely, including automatic image folder detection
  const imageGallery = product.images && product.images.length > 0
    ? product.images
    : (product.additionalImages && product.additionalImages.length > 0)
      ? [product.image, ...product.additionalImages].filter(Boolean)
      : [
          product.image,
          `/products/${product.id}/1.png`,
          `/products/${product.id}/2.png`,
          `/products/${product.id}/3.png`
        ].filter(Boolean);

  const getFallbackForImage = (imgUrl: string) => {
    if (!imgUrl) return undefined;
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return undefined;
    }
    const idx = imageGallery.indexOf(imgUrl);
    if (idx !== -1 && product.fallbackImages && product.fallbackImages[idx]) {
      return product.fallbackImages[idx];
    }
    return product.fallbackImage;
  };

  const visibleGallery = imageGallery.filter((img) => img === product.image || !failedImages[img]);
  const currentImageIdx = visibleGallery.indexOf(selectedImage);

  const handlePrevImage = () => {
    if (visibleGallery.length <= 1) return;
    const newIdx = (currentImageIdx - 1 + visibleGallery.length) % visibleGallery.length;
    setSelectedImage(visibleGallery[newIdx]);
  };

  const handleNextImage = () => {
    if (visibleGallery.length <= 1) return;
    const newIdx = (currentImageIdx + 1) % visibleGallery.length;
    setSelectedImage(visibleGallery[newIdx]);
  };

  // WhatsApp order builder
  const handleWhatsAppDirectOrder = () => {
    const savedCity = localStorage.getItem('customer_city') || '';
    const subtotalVal = product.price * quantity;
    const shippingCostVal = subtotalVal >= 500 ? 0 : 35;
    const totalVal = subtotalVal + shippingCostVal;
    const isFree = subtotalVal >= 500;
    const deliveryStr = isFree ? 'Livraison gratuite' : `${shippingCostVal} DH`;

    let orderSpec = product.name[language] || product.name['fr'];
    if (selectedSize || selectedColor) {
      const parts = [];
      if (selectedSize) parts.push(`Taille: ${selectedSize}`);
      if (selectedColor) parts.push(`Couleur: ${selectedColor}`);
      orderSpec += ` (${parts.join(', ')})`;
    }

    const messageText = `Bonjour Globabox, je souhaite confirmer ma commande.

INFORMATIONS CLIENT:
Nom: WhatsApp Customer
Téléphone: 
Ville: ${savedCity}
Adresse: 

PRODUITS COMMANDÉS:

1. ${orderSpec}
   Quantité: ${quantity}
   Prix unitaire: ${product.price} DH
   Total produit: ${subtotalVal} DH

LIVRAISON:
${deliveryStr}

RÉSUMÉ:
Sous-total: ${subtotalVal} DH
Livraison: ${deliveryStr}
Total à payer: ${totalVal} DH

PAIEMENT:
Paiement à la livraison

Merci de confirmer la disponibilité et la livraison.`;

    triggerWhatsAppClick(`Product Detail Modal Fast Order WA - Product: ${product.id}`);

    if (onWhatsAppOrder) {
      onWhatsAppOrder({
        items: [{
          product,
          quantity,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined
        }],
        customMessage: messageText,
        source: 'product_detail_whatsapp'
      });
    } else {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
      window.open(url, '_blank', 'noreferrer');
    }
  };

  // UI translation helpers for the new items
  const localTxt = {
    deliveryTitleByLang: {
      fr: "Livraison Rapide Gratuite",
      ar: "شحن سريع ومجاني",
      en: "Free Fast Shipping"
    },
    deliveryDescByLang: {
      fr: "• Livraison 24h/48h selon la ville (Casablanca, Rabat, Marrakech, Agadir, Tanger, Fès, Meknès, Oujda, Laâyoune, etc.)\n• Paiement 100% à la livraison (En espèces après réception)\n• Confirmation de commande rapide par appel téléphonique ou WhatsApp.",
      ar: "• التوصيل خلال 24/48 ساعة حسب المدينة (الدار البيضاء، الرباط، مراكش، أكادير، طنجة، فاس، مكناس، وجدة، العيون، إلخ.)\n• الدفع عند الاستلام 100٪ (نقداً بعد فحص السلعة)\n• تأكيد سريع للطلب عبر اتصال هاتفي أو واتساب.",
      en: "• Delivery in 24h/48h depending on city (Casablanca, Rabat, Marrakech, Agadir, Tanger, Fès, Meknès, Oujda, Laâyoune, etc.)\n• 100% Cash on Delivery (Pay cash on receipt)\n• Fast order verification via phone call or WhatsApp."
    },
    codBadgeByLang: {
      fr: "Paiement à la Livraison Actif",
      ar: "الدفع عند الاستلام مفعّل",
      en: "Cash on Delivery Active"
    },
    specificationsTitle: {
      fr: "Caractéristiques & Fiche Technique",
      ar: "المواصفات التقنية والخصائص",
      en: "Technical Specifications"
    }
  };

  const getLocalText = (obj: Record<string, string>) => {
    return obj[language] || obj['fr'];
  };

  return (
    <div
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#070d1a]/90 backdrop-blur-md shadow-2xl flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500 animate-spin-slow" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0B1528] font-sans">
              {t('brandName')} • {product.category.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl focus:outline-none hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Side: Images Section */}
          <div className="space-y-4">
            {/* Main Stage Image */}
            <div className="aspect-[4/3] rounded-2xl bg-[#0b1528] overflow-hidden border border-slate-200/80 flex items-center justify-center relative group">
              <ProductImage
                src={selectedImage}
                fallbackSrc={getFallbackForImage(selectedImage)}
                alt={`${product.name[language] || product.name.fr || ''} | ${product.category} | ${product.price} MAD - Globabox`}
                loading="eager"
                language={language}
                className="w-full h-full object-cover select-none"
                containerClassName="aspect-[4/3] w-full"
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [selectedImage]: true }));
                }}
              />

              {/* Left & Right Navigation Arrows */}
              {!failedImages[selectedImage] && visibleGallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-10`}
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-10`}
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              {!failedImages[selectedImage] && visibleGallery.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/75 text-white font-mono font-extrabold text-[11px] px-2.5 py-1 rounded-full tracking-wider z-10 shadow-sm">
                  {currentImageIdx + 1} / {visibleGallery.length}
                </div>
              )}
            </div>

            {/* Gallery Selector Grid */}
            {visibleGallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {visibleGallery.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                      selectedImage === img
                        ? 'border-orange-500 shadow-md ring-2 ring-orange-500/10'
                        : 'border-slate-200/80 hover:border-slate-350'
                    }`}
                  >
                    <ProductImage
                      src={img}
                      fallbackSrc={getFallbackForImage(img)}
                      alt={`${product.name[language] || product.name.fr || ''} | ${product.category} | ${product.price} MAD - Galerie ${idx + 1}`}
                      loading="lazy"
                      language={language}
                      className="w-full h-full object-cover"
                      containerClassName="aspect-square w-full"
                      onError={() => {
                        setFailedImages((prev) => ({ ...prev, [img]: true }));
                      }}
                    />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-orange-600/5 mix-blend-multiply" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Safety Badges & COD Info Block */}
            <div className="bg-emerald-50/50 border border-emerald-100/60 p-4 rounded-2xl flex items-start gap-3 mt-4">
              <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-700">
                <span className="font-black text-emerald-800 uppercase tracking-wide block mb-0.5 flex items-center gap-1 select-none">
                  <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                  <span>{getLocalText(localTxt.codBadgeByLang)}</span>
                </span>
                <span className="font-medium text-slate-650">
                  {t('safetyNoticeDelivery')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Product Status Badges */}
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                {isOutOfStock ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-red-100 text-red-650 border border-red-200 rounded-lg font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 inline-block"></span>
                    <span>{t('stock_out_of_stock')}</span>
                  </span>
                ) : isLimited ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-amber-100 text-amber-805 border border-amber-200/80 rounded-lg font-sans flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    <span>{t('stock_limited')}</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
                    <span>{t('stock_in_stock')}</span>
                  </span>
                )}
                {product.bestSeller && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-orange-600 text-white rounded-md font-sans flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{t('filterBestSellers')}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name[language]}
              </h2>

              {/* Pricing Section (Price + Old Price clearly visible) */}
              <div className="flex items-baseline gap-2.5 my-3 bg-slate-50/70 py-2.5 px-4 rounded-xl border border-slate-100 inline-flex">
                <span className="text-2xl font-extrabold font-mono text-orange-600">
                  {product.price} {t('moroccoCurrency')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-semibold text-slate-400 line-through font-mono">
                    {product.originalPrice} {t('moroccoCurrency')}
                  </span>
                )}
              </div>

              {/* Delivery and Cash on Delivery Badge */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 my-3 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {getLocalText(localTxt.deliveryTitleByLang)}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-600 font-sans whitespace-pre-line">
                    {getLocalText(localTxt.deliveryDescByLang)}
                  </p>
                </div>
              </div>

              {/* Product Characteristics Tabs */}
              <div className="flex border-b border-slate-100 mb-3.5 mt-5">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all mr-4 cursor-pointer font-sans ${
                    activeTab === 'info'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {t('productDetailsTab')}
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all mr-4 cursor-pointer font-sans ${
                    activeTab === 'specs'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {getLocalText(localTxt.specificationsTitle)}
                </button>
                <button
                  onClick={() => setActiveTab('guarantees')}
                  className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer font-sans ${
                    activeTab === 'guarantees'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {t('productSafetyTab')}
                </button>
              </div>

              {/* Tab Body */}
              <div className="min-h-[120px] text-xs leading-relaxed text-slate-600 font-sans">
                {activeTab === 'info' && (
                  <p className="whitespace-pre-line leading-relaxed">{product.description[language]}</p>
                )}
                {activeTab === 'specs' && (
                  <div className="space-y-2">
                    {product.features?.[language]?.length > 0 ? (
                      <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                        {product.features[language].map((feat, i) => (
                          <li key={i} className="leading-relaxed">{feat}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic">
                        <Info className="w-4 h-4" />
                        <span>Fiche descriptive complète disponible sur demande par WhatsApp</span>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'guarantees' && (
                  <div className="space-y-2.5 text-slate-700">
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{t('trust_cod_title')}</strong> : {t('trust_cod_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{t('trust_morocco_delivery_title')}</strong> : {t('trust_morocco_delivery_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{t('trust_free_delivery_title')}</strong> : {t('trust_free_delivery_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{t('trust_whatsapp_title')}</strong> : {t('trust_whatsapp_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>{t('trust_fast_support_title')}</strong> : {t('trust_fast_support_desc')}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Operational Actions */}
            <div className="mt-6 pt-4 border-t border-slate-150 space-y-4">
              {/* Sizing & Colors support */}
              {!isOutOfStock && (
                <div className="space-y-3 pb-2">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-[#0B1528] uppercase tracking-wider">
                        {language === "ar" ? "اللون المتاح" : language === "en" ? "Available Color" : "Couleur disponible"} :
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.colors.map((color) => {
                          const isHex = color.startsWith('#');
                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                selectedColor === color
                                  ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500/25'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-350'
                              }`}
                            >
                              {isHex && (
                                <span 
                                  className="w-3 h-3 rounded-full border border-black/10 inline-block" 
                                  style={{ backgroundColor: color }}
                                />
                              )}
                              <span>{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-[#0B1528] uppercase tracking-wider">
                        {language === "ar" ? "المقاس المتاح" : language === "en" ? "Available Size" : "Taille disponible"} :
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              selectedSize === size
                                ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500/25'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-350'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isOutOfStock && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold text-[#0B1528] uppercase tracking-wider">{t('qtyLabel')} :</span>
                  <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 hover:bg-slate-200 text-slate-800 font-bold focus:outline-none text-sm transition-colors cursor-pointer flex items-center justify-center select-none"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="px-5 text-sm font-black text-[#0B1528] font-mono select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-2 hover:bg-slate-200 text-slate-800 font-bold focus:outline-none text-sm transition-colors cursor-pointer flex items-center justify-center select-none"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* Social Proof Alerts */}
              {!isOutOfStock && (
                <div style={{ direction: isRtl ? 'rtl' : 'ltr' }} className="space-y-1.5 bg-rose-50/40 border border-rose-100/60 rounded-2xl p-3">
                  <div className="text-xs text-rose-900 font-extrabold flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-600 animate-pulse shrink-0 mt-0.5" />
                    <span className="leading-snug">{t('trust_ordered_today')}</span>
                  </div>
                  
                  {getProductSocialProof(product, language) && (
                    <div className="text-[11px] text-indigo-900 font-extrabold flex items-center gap-1.5 pt-1.5 border-t border-indigo-100/30">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                      <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{getProductSocialProof(product, language)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons Layer */}
              {isOutOfStock ? (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-sm font-black py-4 px-4 rounded-2xl cursor-not-allowed flex flex-col items-center justify-center gap-1.5 text-center select-none w-full shadow-inner animate-scale-up">
                  <Clock className="w-5 h-5 text-slate-450 shrink-0" />
                  <span className="text-sm font-black text-slate-700">{t('stock_soon_available')}</span>
                  <p className="text-[11px] text-slate-450 font-medium font-sans leading-relaxed">
                    {language === 'ar' 
                      ? 'هذا المنتج غير متوفر حالياً في المخزن، وسيتم توفيره قريباً.' 
                      : 'Cet article est temporairement en rupture de stock. Re-visitez ultérieurement.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* 1. Buy Now Form Auto-checkout */}
                    <button
                      onClick={() => {
                        onInstantCheckout(product, quantity, selectedSize || undefined, selectedColor || undefined);
                        onClose();
                      }}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs py-4 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-orange-600/10 hover:scale-[1.01]"
                    >
                      <ShoppingCart className="w-4 h-4 text-white shrink-0" />
                      <span>{t('btnOrderNow')} - {product.price * quantity} {t('moroccoCurrency')}</span>
                    </button>

                    {/* 2. Direct order via WhatsApp */}
                    <button
                      onClick={handleWhatsAppDirectOrder}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-4 px-4 rounded-xl transition-all border border-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 hover:scale-[1.01]"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                      <span>{t('btnOrderWhatsApp')}</span>
                    </button>
                  </div>

                  {/* Add to Standard Shopping Cart Drawer */}
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                    <span>{t('btnAddToCart')} ({t('viewCartButton')})</span>
                  </button>
                </div>
              )}

              {/* Trust badges footer inside modal */}
              <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-slate-150 text-[10px] text-slate-655 font-bold font-sans">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{t('trust_cod_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Compass className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{t('trust_morocco_delivery_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{t('trust_free_delivery_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-orange-500 shrink-0 fill-current" />
                  <span>{t('trust_whatsapp_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{t('trust_fast_support_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <Star className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                   <span>{t('trust_verified_products_title')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
