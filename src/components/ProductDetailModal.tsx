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
      fr: "Livraison : 35 DH sous 500 DH, gratuite dès 500 DH",
      ar: "التوصيل: 35 درهم لأقل من 500، ومجاني ابتداءً من 500 درهم",
      en: "Delivery: 35 DH below 500 DH, free from 500 DH"
    },
    deliveryDescByLang: {
      fr: "• 35 DH de livraison sous 500 DH d'achat ; gratuite dès 500 DH.\n• Délais et disponibilité à confirmer avant l'expédition.\n• Paiement à la livraison après confirmation.",
      ar: "• التوصيل 35 درهم للطلبات أقل من 500 درهم، ومجاني ابتداءً من 500 درهم.\n• يتم تأكيد الآجال والتوفر قبل الإرسال.\n• الدفع عند الاستلام بعد تأكيد الطلب.",
      en: "• Delivery costs 35 DH below 500 DH, and is free from 500 DH.\n• Timing and availability confirmed before dispatch.\n• Cash on delivery after order confirmation."
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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm shadow-2xl flex items-center justify-center p-3 sm:p-5"
    >
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#104d43]" aria-hidden="true" />
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
            <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center relative group">
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
                        ? 'border-[#176b5c] shadow-md ring-2 ring-[#176b5c]/10'
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
                      <div className="absolute inset-0 bg-[#104d43]/5 mix-blend-multiply" />
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
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-25"></span>
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
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#104d43] text-white rounded-md font-sans flex items-center gap-1 shadow-sm">
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
                <span className="text-2xl font-bold font-mono text-[#104d43]">
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
                <div className="p-2 rounded-xl bg-[#e5efe9] text-[#104d43] shrink-0">
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
              <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-4 mt-5">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer font-sans ${
                    activeTab === 'info'
                      ? 'bg-[#eaf2ed] text-[#104d43] ring-1 ring-[#104d43]/10'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {t('productDetailsTab')}
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer font-sans ${
                    activeTab === 'specs'
                      ? 'bg-[#eaf2ed] text-[#104d43] ring-1 ring-[#104d43]/10'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {getLocalText(localTxt.specificationsTitle)}
                </button>
                <button
                  onClick={() => setActiveTab('guarantees')}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer font-sans ${
                    activeTab === 'guarantees'
                      ? 'bg-[#eaf2ed] text-[#104d43] ring-1 ring-[#104d43]/10'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
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
                      <ShieldCheck className="w-4 h-4 text-[#176b5c] shrink-0" />
                      <span><strong>{t('trust_cod_title')}</strong> : {t('trust_cod_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#176b5c] shrink-0" />
                      <span><strong>{t('trust_morocco_delivery_title')}</strong> : {t('trust_morocco_delivery_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#176b5c] shrink-0" />
                      <span><strong>{t('trust_free_delivery_title')}</strong> : {t('trust_free_delivery_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#176b5c] shrink-0" />
                      <span><strong>{t('trust_whatsapp_title')}</strong> : {t('trust_whatsapp_desc')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#176b5c] shrink-0" />
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
                                  ? 'border-[#176b5c] bg-[#f0f6f2] text-[#104d43] ring-1 ring-[#176b5c]/20'
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
                                ? 'border-[#176b5c] bg-[#f0f6f2] text-[#104d43] ring-1 ring-[#176b5c]/20'
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

              {/* Only show authentic, verified activity metrics. */}
              {!isOutOfStock && !!getProductSocialProof(product, language) && (
                <div style={{ direction: isRtl ? 'rtl' : 'ltr' }} className="space-y-1.5 bg-rose-50/40 border border-rose-100/60 rounded-2xl p-3">
                  <div className="text-xs text-rose-900 font-extrabold flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{t('trust_ordered_today')}</span>
                  </div>
                  
                  {getProductSocialProof(product, language) && (
                    <div className="text-[11px] text-indigo-900 font-extrabold flex items-center gap-1.5 pt-1.5 border-t border-indigo-100/30">
                      <span className="flex h-2 w-2 relative">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-25"></span>
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
                      className="w-full bg-[#104d43] hover:bg-[#176b5c] text-white font-extrabold text-xs py-4 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#104d43]/10 hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4 text-white shrink-0" />
                      <span>{t('btnOrderNow')} - {product.price * quantity} {t('moroccoCurrency')}</span>
                    </button>

                    {/* 2. Direct order via WhatsApp */}
                    <button
                      onClick={handleWhatsAppDirectOrder}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-4 px-4 rounded-xl transition-all border border-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 hover:shadow-md"
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

              {/* Live customer reviews: ratings are stored per product in D1. */}
              <ProductReviews productId={product.id} product={product} language={language} />

              {/* Trust badges footer inside modal */}
              <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-slate-150 text-[10px] text-slate-655 font-bold font-sans">
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#176b5c] shrink-0" />
                  <span>{t('trust_cod_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Compass className="w-3.5 h-3.5 text-[#176b5c] shrink-0" />
                  <span>{t('trust_morocco_delivery_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Truck className="w-3.5 h-3.5 text-[#176b5c] shrink-0" />
                  <span>{t('trust_free_delivery_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#176b5c] shrink-0 fill-current" />
                  <span>{t('trust_whatsapp_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-[#176b5c] shrink-0" />
                  <span>{t('trust_fast_support_title')}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <Star className="w-3.5 h-3.5 text-[#176b5c] shrink-0" />
                   <span>{t('trust_verified_products_title')}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );

function ProductReviews({ productId, product, language }: { productId: string; product: Product; language: Language }) {
  const [reviews, setReviews] = useState<Array<{id:string; name:string; rating:number; comment:string; createdAt:string; verified:boolean}>>([]);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [phone, setPhone] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadReviews = () => {
    fetch(`/api/products/${encodeURIComponent(productId)}/reviews`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('reviews load failed')))
      .then(data => { if (Array.isArray(data?.reviews)) setReviews(data.reviews); })
      .catch(() => setReviews([]));
  };

  useEffect(() => { loadReviews(); }, [productId]);

  const submitReview = async () => {
    if (!comment.trim()) {
      setMessage(language === 'ar' ? 'كتب تعليقك أولاً.' : language === 'en' ? 'Please write a comment first.' : 'Écrivez votre commentaire.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({rating,name:name.trim(),comment:comment.trim(),orderReference:orderReference.trim(),phone:phone.trim()})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Review submission failed');
      setMessage(language === 'ar' ? 'تم إرسال تقييمك بنجاح.' : language === 'en' ? 'Your review was submitted.' : 'Votre avis a été envoyé.');
      setComment('');
      setOrderReference('');
      setPhone('');
      setShowForm(false);
      loadReviews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review submission failed');
    } finally {
      setSaving(false);
    }
  };

  const avg = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : Number(product.rating || 0);
  const count = reviews.length || Number(product.reviewsCount || 0);

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={language === 'ar' ? 'آراء العملاء' : language === 'en' ? 'Customer reviews' : 'Avis clients'}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
            {language === 'ar' ? 'آراء العملاء' : language === 'en' ? 'Customer reviews' : 'Avis clients'}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-black text-slate-900">{avg.toFixed(1)}</span>
            <div className="flex items-center gap-0.5" aria-label={`Rating ${avg.toFixed(1)} out of 5`}>
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={14} className={star <= Math.round(avg) ? 'fill-[#176b5c] text-[#176b5c]' : 'text-slate-300'} />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">({count})</span>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(v => !v)} className="rounded-full bg-[#f0f6f2] px-3 py-1.5 text-[10px] font-bold text-[#104d43] hover:bg-[#e4efe9]">
          {language === 'ar' ? 'قيّم المنتج' : language === 'en' ? 'Rate this product' : 'Évaluer le produit'}
        </button>
      </div>

      {showForm && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">{language === 'ar' ? 'النجوم' : language === 'en' ? 'Stars' : 'Étoiles'}</p>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} out of 5`} className="p-1">
                  <Star size={21} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder={language === 'ar' ? 'الاسم (اختياري)' : language === 'en' ? 'Name (optional)' : 'Nom (optionnel)'} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#176b5c]/20" />
          <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={1000} rows={3} placeholder={language === 'ar' ? 'اكتب رأيك في المنتوج...' : language === 'en' ? 'Write your review...' : 'Écrivez votre avis...'} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#176b5c]/20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={orderReference} onChange={e => setOrderReference(e.target.value)} maxLength={50} placeholder={language === 'ar' ? 'مرجع الطلب للتأكيد (اختياري)' : language === 'en' ? 'Order reference for verification (optional)' : 'Référence de commande (optionnel)'} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" />
            <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} inputMode="tel" placeholder={language === 'ar' ? 'الهاتف للتأكيد (اختياري)' : language === 'en' ? 'Phone for verification (optional)' : 'Téléphone pour vérification (optionnel)'} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500">{message}</span>
            <button type="button" disabled={saving} onClick={submitReview} className="rounded-lg bg-[#104d43] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60">
              {saving ? (language === 'ar' ? 'جاري الإرسال...' : language === 'en' ? 'Sending...' : 'Envoi...') : (language === 'ar' ? 'إرسال التقييم' : language === 'en' ? 'Submit review' : 'Envoyer l’avis')}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {reviews.length ? reviews.slice(0, 5).map(review => (
          <div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{review.name || (language === 'ar' ? 'زبون' : 'Customer')}</span>
                {review.verified && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">{language === 'ar' ? 'مشتري مؤكد' : language === 'en' ? 'Verified purchase' : 'Achat vérifié'}</span>}
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(star => <Star key={star} size={12} className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
              </div>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{review.comment}</p>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">
            {language === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج.' : language === 'en' ? 'No reviews yet. Be the first to review this product.' : 'Aucun avis pour le moment. Soyez le premier à évaluer ce produit.'}
          </div>
        )}
      </div>
    </section>
  );
}
}
