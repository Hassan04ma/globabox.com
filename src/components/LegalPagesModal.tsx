import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, Truck, RefreshCw, Layers, Phone, HelpCircle, Mail, MapPin, Clock, CheckCircle2, ChevronLeft, ChevronRight, Compass, MessageSquare, ShieldCheck, CheckSquare, Flame } from 'lucide-react';
import { ORDER_SUPPORT_NUMBER, WA_LINK, DISPLAY_PHONE, WHATSAPP_NUMBER, WHATSAPP_LINK } from '../data';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  language?: 'fr' | 'ar' | 'en';
}

export default function LegalPagesModal({ isOpen, onClose, initialTab = 'about', language = 'fr' }: LegalPagesModalProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  // Mobile Tab bar scroll state & ref
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(true);

  // Interactive Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set active tab on modal open
      setActiveTab(initialTab);
      setFormSubmitted(false);
    }
  }, [isOpen, initialTab]);

  const checkMobileScroll = () => {
    if (mobileScrollRef.current) {
      // Keep true to prevent iframe layout calculation delays
      setIsOverflowing(true);
    }
  };

  const handleMobileScrollClick = (direction: 'left' | 'right') => {
    if (mobileScrollRef.current) {
      const isContainerRtl = language === 'ar';
      let scrollAmount = 140;
      if (direction === 'left') {
        scrollAmount = -scrollAmount;
      }
      if (isContainerRtl) {
        // Invert direction for Arabic layout to navigate correctly
        scrollAmount = -scrollAmount;
      }
      mobileScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll active tab into view in mobile container
  const selectTab = (id: string) => {
    setActiveTab(id);
    setFormSubmitted(false);
    
    setTimeout(() => {
      const activeEl = document.getElementById(`tab-btn-${id}`);
      const scrollEl = mobileScrollRef.current;
      if (activeEl && scrollEl) {
        const offsetLeft = activeEl.offsetLeft;
        const width = activeEl.clientWidth;
        const scrollWidth = scrollEl.clientWidth;
        
        scrollEl.scrollTo({
          left: offsetLeft - (scrollWidth / 2) + (width / 2),
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkMobileScroll);
      const timer = setTimeout(checkMobileScroll, 150);
      window.addEventListener('resize', checkMobileScroll);
      return () => {
        el.removeEventListener('scroll', checkMobileScroll);
        window.removeEventListener('resize', checkMobileScroll);
        clearTimeout(timer);
      };
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'about', label: 'À propos de Globabox', icon: HelpCircle },
    { id: 'delivery', label: 'Politique de livraison', icon: Truck },
    { id: 'returns', label: 'Politique de retour & échange', icon: RefreshCw },
    { id: 'cgv', label: 'Conditions de vente (CGV)', icon: Layers },
    { id: 'privacy', label: 'Politique de confidentialité', icon: Shield },
    { id: 'contact', label: 'Contactez-nous', icon: Phone },
  ];

  const getTabLabel = (id: string, defaultLabel: string) => {
    const translations: Record<string, Record<'fr' | 'ar' | 'en', string>> = {
      about: { fr: 'À propos de Globabox', ar: 'حول Globabox', en: 'About Globabox' },
      delivery: { fr: 'Politique de livraison', ar: 'سياسة التوصيل', en: 'Delivery Policy' },
      returns: { fr: 'Politique de retour & échange', ar: 'الإرجاع والتبديل', en: 'Returns & Exchanges' },
      cgv: { fr: 'Conditions de vente (CGV)', ar: 'شروط البيع (CGV)', en: 'Terms of Sale (CGV)' },
      privacy: { fr: 'Politique de confidentialité', ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
      contact: { fr: 'Contactez-nous', ar: 'التواصل معنا', en: 'Contact Us' }
    };
    return translations[id]?.[language] || defaultLabel;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) return;
    
    // Simulate successful form submission & provide WhatsApp redirection option
    setFormSubmitted(true);
    
    // Optional automated WhatsApp redirection for immediate assistance
    const text = `Bonjour Globabox, je vous contacte depuis le site globabox.com :\nNom: ${contactName}\nTéléphone Equipe: ${contactPhone}\nMessage: ${contactMessage}`;
    const waUrl = `${WA_LINK}?text=${encodeURIComponent(text)}`;
    
    // Auto redirect after a brief display
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noreferrer');
    }, 1500);
  };

  const handleResetForm = () => {
    setContactName('');
    setContactPhone('');
    setContactMessage('');
    setFormSubmitted(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      <div className="bg-white text-slate-850 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/80 transform scale-100 transition-transform duration-300">
        
        {/* Header bar */}
        <div className="bg-gradient-to-r from-slate-900 to-[#0B1528] px-6 py-5 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <h2 className="text-base font-black tracking-widest uppercase">Espace Restreint & Confiance</h2>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Boutique Officielle Globabox Maroc • globabox.com</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            id="close-legal-pages-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Outer content container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Left responsive navigation */}
          {/* Mobile/Tablet Navigation - Horizontal Scroll */}
          <div className="md:hidden relative bg-slate-100 border-b border-slate-200/60 px-10 py-2.5 flex items-center shrink-0">
            {/* Left fade area */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none z-10" />

            {/* Left scroll button - always visible on overflow */}
            {isOverflowing && (
              <button
                onClick={() => handleMobileScrollClick('left')}
                className="absolute left-1 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 shadow-md hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} strokeWidth={3} className="text-white" />
              </button>
            )}

            {/* Scrolling container - locked to LTR scroll mechanism for 100% reliable cross-device functionality config */}
            <div
              ref={mobileScrollRef}
              onScroll={checkMobileScroll}
              dir="ltr"
              className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x whitespace-nowrap"
            >
              {tabs.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => selectTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isActive 
                        ? 'bg-orange-600 text-white border border-orange-500 shadow-md shadow-orange-600/10 scale-[1.01]' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <IconComp size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{getTabLabel(tab.id, tab.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* Right fade area */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none z-10" />

            {/* Right scroll button - always visible on overflow */}
            {isOverflowing && (
              <button
                onClick={() => handleMobileScrollClick('right')}
                className="absolute right-1 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B1528] text-white border-2 border-orange-500 shadow-md hover:bg-orange-600 hover:border-orange-600 active:scale-95 transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} strokeWidth={3} className="text-white" />
              </button>
            )}
          </div>

          {/* Desktop Navigation - Left Sidebar */}
          <div className="hidden md:block w-72 bg-slate-50 border-r border-slate-200/80 p-4 shrink-0 flex flex-col justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Sections d'information</p>
              {tabs.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setFormSubmitted(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold text-left transition-all ${
                      isActive 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10' 
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    <IconComp size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Quick Trust Card */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-850 space-y-2 mt-auto">
              <div className="flex items-center gap-2 text-[10px] text-orange-400 font-extrabold tracking-wider uppercase">
                <ShieldCheck size={14} className="text-orange-500 shrink-0" />
                <span>CONFIRMATION IMMÉDIATE</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Toutes les commandes sont confirmées au téléphone par WhatsApp avant l'expédition pour éviter tout désagrément.
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-white p-6 sm:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Tab 1: About Globabox */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="border-b border-slate-105 pb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'حول Globabox' : 'À propos de Globabox'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'تعرف على متجرنا ومهمتنا لتوفير أفضل معدات التخييم والطبيعة بالمغرب' : 'Découvrez notre histoire et notre engagement pour l’esprit outdoor au Maroc'}
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
                  {language === 'ar' ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Globabox متجر إلكتروني مغربي متخصص في معدات التخييم، السفر، الطبيعة والمغامرات. هدفنا هو توفير منتجات عملية ومناسبة للزبناء داخل المغرب مع خدمة توصيل موثوقة والدفع عند الاستلام.
                      </p>
                      <p>
                        سواء كنتم تخططون لرحلة استكشافية جبلية، مغامرة في الصحراء، أو قضاء بضعة أيام ممتعة في الطبيعة، فإننا نهتم بانتقاء أفضل المنتجات المجرّبة من خيام وأكياس نوم وأدوات طبخ وسفر تسهل المغامرة وتضمن راحتكم.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-800">
                        Globabox est un magasin en ligne marocain spécialisé dans les équipements de camping, de voyage, de nature et de plein air (outdoor). Notre mission absolue est de vous proposer du matériel performant, ingénieux et robuste pour toutes vos sorties à travers le Maroc, avec un service de livraison d’une fiabilité inégalée et le paiement en espèces à la livraison.
                      </p>
                      <p>
                        Que vous planifiez un bivouac sous les étoiles dans le désert, une randonnée exigeante en montagne ou une simple escapade verte, nous sélectionnons méticuleusement du matériel adapté aux spécificités des amoureux d’aventure au Maroc.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 space-y-1.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <h4 className="font-bold text-orange-950 text-xs flex items-center gap-1.5">
                        <Compass size={14} className="text-orange-600 shrink-0" />
                        <span>{language === 'ar' ? 'انتقاء احترافي مجرب' : 'Sélection Professionnelle'}</span>
                      </h4>
                      <p className="text-[11px] text-orange-800 leading-normal">
                        {language === 'ar' 
                          ? 'نختار منتجاتنا بعناية لتناسب مختلف التضاريس والأجواء بالمغرب لتدوم طويلاً.' 
                          : 'Nos produits sont testés pour leur solidité face à tous les terrains marocains (montagnes, côtes, sable).'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Layers size={14} className="text-emerald-600 shrink-0" />
                        <span>{language === 'ar' ? 'شفافية كاملة وخدمة ممتازة' : 'Transparence Absolue'}</span>
                      </h4>
                      <p className="text-[11px] text-emerald-800 leading-normal">
                        {language === 'ar' 
                          ? 'توصيل لباب المنزل في كل مدن المغرب مع تأكيد سريع للطلب لضمان راحتكم.' 
                          : 'Nous encourageons la vérification de conformité du colis auprès de notre livreur partenaire.'}</p>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {language === 'ar' ? 'لماذا تتسوق من Globabox؟' : 'Pourquoi nous faire confiance ?'}
                  </h4>
                  <ul className="list-disc list-inside space-y-2 pl-1.5">
                    {language === 'ar' ? (
                      <>
                        <li><strong className="text-slate-900 font-bold">الدفع عند الاستلام فقط:</strong> لا تحتاج لبطاقة بنكية للشراء، ادفع نقداً بكل أمان بعد فحص طردك.</li>
                        <li><strong className="text-slate-900 font-bold">دعم رائع بالواتساب:</strong> مساعدونا متواجدون لمرافقتكم طيلة اليوم لتلبية متطلباتكم.</li>
                        <li><strong className="text-slate-900 font-bold">منتجات عملية:</strong> نوفر خياماً ومعدات ممتازة ومبتكرة تجعل من مغامراتكم متعة حقيقية.</li>
                      </>
                    ) : (
                      <>
                        <li><strong className="text-slate-900 font-bold">Aucun paiement en ligne requis :</strong> Nous pratiquons exclusivement le paiement à la livraison. Vous achetez sans stress.</li>
                        <li><strong className="text-slate-900 font-bold">Service client réactif :</strong> Nous sommes disponibles de 8h à 22h, 7j/7 sur WhatsApp ou par appel direct.</li>
                        <li><strong className="text-slate-900 font-bold">Origine contrôlée :</strong> Tous nos produits de marque sont stockés localement au Maroc pour garantir une livraison immédiate.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Delivery Policy */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'سياسة التوصيل والشحن' : 'Politique de livraison'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'الدفع عند الاستلام، فحص وتحقق من طلبكم وتوصيل سريع لكافة أرجاء المغرب' : 'Livraison rapide partout au Maroc, paiement à la livraison et conditions à jour'}
                  </p>
                </div>

                <div className="space-y-5 font-sans">
                  
                  {/* Moroccan Cities Cover Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-[#0B1528] text-sm flex items-center gap-2">
                      <MapPin className="text-orange-600 shrink-0 w-5 h-5" />
                      <span>
                        {language === 'ar' ? 'التوصيل متوفر إلى جميع المدن المغربية' : 'Livraison disponible partout au Maroc'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {language === 'ar' ? (
                        <>
                          <strong>الدفع عند الاستلام متاح.</strong> نقوم بتوصيل طلباتكم مباشرة إلى منازلكم أو مقراتكم في جميع المدن والقرى المغربية.
                          <span className="block mt-1.5 font-semibold text-slate-800">
                            الدار البيضاء، الرباط، مراكش، أكادير، طنجة، فاس، مكناس، وجدة، الناظور، العيون، الداخلة، تطوان، آسفي، الجديدة، بني ملال، ورزازات، وجميع المدن المغربية الأخرى.
                          </span>
                        </>
                      ) : (
                        <>
                          <strong>Livraison disponible partout au Maroc.</strong> Nous expédions votre commande d'équipement outdoor directement à votre domicile ou à votre lieu de travail partout au Maroc :
                          <span className="block mt-1.5 font-semibold text-slate-850">
                            Casablanca, Rabat, Marrakech, Agadir, Tanger, Fès, Meknès, Oujda, Nador, Laâyoune, Dakhla, Tétouan, Safi, El Jadida, Béni Mellal, Ouarzazate, et toutes les villes marocaines.
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Payment and Inspection on Delivery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/50 space-y-2">
                      <h4 className="font-extrabold text-orange-950 text-xs flex items-center gap-2">
                        <CheckSquare className="text-orange-600 shrink-0 w-4 h-4" />
                        <span>
                          {language === 'ar' ? 'الدفع عند الاستلام متاح' : 'Paiement à la livraison disponible'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-orange-900 leading-relaxed">
                        {language === 'ar' ? (
                          <span>الدفع عند الاستلام متاح كلياً لشراء آمن. لا يطلب منك أي دفع مسبق بالبطاقة، بل تدفع نقداً عند استلام سلعك.</span>
                        ) : (
                          <span><strong>Paiement à la livraison disponible.</strong> Vous payez en espèces uniquement au moment de la réception de votre colis auprès du coursier.</span>
                        )}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/50 space-y-2">
                      <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600 shrink-0 w-4 h-4" />
                        <span>
                          {language === 'ar' ? 'فحص ومعاينة الطرد' : 'Inspection du colis possible'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-900 leading-relaxed">
                        {language === 'ar' ? (
                          <span>يمكن للزبون فحص ومعاينة الطرد عند التوصيل والتأكد من سلامة المنتج وملاءمته قبل الدفع إذا كانت شركة التوصيل تدعم ذلك.</span>
                        ) : (
                          <span>Le client peut inspecter le colis à la livraison s'il est pris en charge par l'entreprise de livraison partenaire pour attester de la parfaite conformité.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Pricing / Shipping Fees Rules */}
                  <div className="p-4.5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2.5">
                    <h4 className="font-extrabold text-blue-950 text-xs flex items-center gap-2">
                      <Truck className="text-blue-600 shrink-0 w-4.5 h-4.5" />
                      <span>
                        {language === 'ar' ? 'تكلفة وأوقات الشحن والتوصيل' : 'Frais et délais de livraison'}
                      </span>
                    </h4>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {language === 'ar' ? (
                        <span>
                          الدفع عند الاستلام متوفر في جميع أنحاء المغرب. مصاريف التوصيل هي <strong>35 درهم</strong> للطلبات الأقل من 500 درهم، والتوصيل <strong>مجاني بالكامل</strong> ابتداءً من 500 درهم. قد تختلف مدة التوصيل باختلاف المدينة والبعد الجغرافي.
                        </span>
                      ) : (
                        <span>
                          Livraison disponible partout au Maroc. Paiement à la livraison disponible. Les frais de livraison sont de <strong>35 DH</strong> pour les commandes inférieures à 500 DH. La livraison est <strong>gratuite à partir de 500 DH</strong>. Les délais de livraison peuvent varier selon la ville.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Summary Footer Warning */}
                  <div className="text-[11px] text-slate-500 bg-slate-100/60 p-3 rounded-xl leading-normal border border-slate-200">
                    {language === 'ar' ? (
                      <span>تفاصيل الاتصال الرسمي بـ Globabox: الهاتف: <strong>{DISPLAY_PHONE}</strong> | موقع الويب: <strong>https://globabox.com</strong></span>
                    ) : (
                      <span>Contact officiel Globabox : Tél : <strong>{DISPLAY_PHONE}</strong> | WhatsApp: <strong>{WHATSAPP_LINK}</strong> | Web : <strong>https://globabox.com</strong></span>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Tab 3: Returns Policy */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'سياسة الإرجاع والاستبدال' : 'Politique de retour'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'ضمان الرضا، شروط الاسترجاع والاستبدال للمنتجات المستلمة' : 'Votre satisfaction garantie, procédure d\'échange et étapes d\'indemnisation'}
                  </p>
                </div>

                <div className="space-y-5 font-sans">
                  
                  {/* Detailed policy card */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <RefreshCw className="text-orange-600 shrink-0 w-5 h-5 animate-spin-slow" />
                      <span>
                        {language === 'ar' ? 'شروط الإرجاع والاستبدال' : 'Conditions de retour et d\'échange'}
                      </span>
                    </h4>

                    {/* Official Requested Return Policy text block */}
                    <div className="text-xs text-slate-700 space-y-3.5 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                      {language === 'ar' ? (
                        <div className="font-medium text-slate-800 space-y-2">
                          <p><strong>في Globabox، رضا زبنائنا هو أولويتنا.</strong> إذا توصلت بمنتج تالف، به عيب، أو مختلف عن طلبك، يرجى التواصل مع خدمة الزبناء عبر الواتساب مع تقديم رقم الطلب، رقم الهاتف، وصور واضحة للمنتج.</p>
                          <p>تتم مراجعة وقبول طلبات الإرجاع أو الاستبدال من طرف فريق دعم Globabox، بشرط أن يكون المنتج غير مستعمل كلياً وفي حالته الأصلية وتغليفه الأصلي.</p>
                        </div>
                      ) : (
                        <div className="font-medium text-slate-800 space-y-2">
                          <p><strong>Chez Globabox, la satisfaction de nos clients est importante.</strong> Si vous recevez un produit endommagé, défectueux ou différent de votre commande, veuillez contacter notre service client via WhatsApp avec votre numéro de commande, votre téléphone et des photos du produit.</p>
                          <p>Les retours ou échanges sont acceptés après vérification par l’équipe Globabox, à condition que le produit soit inutilisé, complet et dans son emballage d’origine.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs leading-relaxed text-slate-800 space-y-2">
<h5 className="font-bold">{language === 'ar' ? 'حق التراجع القانوني عن الشراء عن بُعد' : 'Droit légal de rétractation pour la vente à distance'}</h5>
<p>{language === 'ar'
? 'وفقاً للقانون المغربي 31-08، يحق للمستهلك من حيث المبدأ التراجع عن شراء عن بعد خلال 7 أيام من استلام السلعة دون الحاجة إلى تبرير، مع مراعاة الاستثناءات القانونية. قد تمتد المدة إلى 30 يوماً عند غياب التأكيد الكتابي المطلوب. تواصل معنا لممارسة حقك.'
: 'Conformément à la loi marocaine 31-08, le consommateur bénéficie en principe de 7 jours à compter de la réception pour se rétracter d’un achat à distance, sans justification, sous réserve des exceptions prévues par la loi. Le délai peut être de 30 jours lorsque la confirmation écrite exigée fait défaut. Contactez-nous pour exercer ce droit.'}</p>
<p>{language === 'ar' ? 'حق التراجع القانوني لا يخضع لموافقة المتجر المسبقة، وهو مختلف عن إرجاع السلع المعيبة.' : 'Le droit légal de rétractation n’est pas subordonné à l’approbation préalable de la boutique et reste distinct des réclamations pour défaut.'}</p>
</div>
{/* Specific Bullet Rules */}
                  <div className="p-4 rounded-xl bg-orange-50/45 border border-orange-200/40 text-xs text-orange-950 space-y-2">
                    <h5 className="font-bold">{language === 'ar' ? 'خطوات هامة لإرجاع أو استبدال منتجك :' : 'Pour faciliter votre demande d\'échange ou retour :'}</h5>
                    <ul className="list-disc list-inside space-y-1.5 pl-1">
                      {language === 'ar' ? (
                        <>
                          <li>يجب الاتصال بطلب الدعم أولاً لشرح الحالة قبل شحن أو إرجاع أي طرد.</li>
                          <li>تقديم وثائق الشراء وصور واضحة تظهر التلف أو العيب بالمنشور.</li>
                          <li>يجب أن يكون المنتج غير مستعمل، في علبته المغلقة الأصلية السليمة.</li>
                          <li>تخضع جميع الطلبات لمراجعة دقيقة من لدن فريق دعم ومراقبة الجودة لدينا.</li>
                        </>
                      ) : (
                        <>
                          <li>Veuillez impérativement contacter le support Globabox avant de renvoyer le produit.</li>
                          <li>Fournissez le numéro de commande, le numéro de téléphone et des photos claires du produit défectueux ou erroné.</li>
                          <li>Le produit doit être inutilisé, complet et conservé dans son état et emballage d'origine.</li>
                          <li>Chaque demande est soumise à l'approbation et à l'examen de notre équipe de support.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Official Store Contact Info Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3.5 shadow-md">
                    <h4 className="font-black text-xs text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span>{language === 'ar' ? 'التواصل المباشر مع دعم Globabox' : 'CONTACTER LE SUPPORT DE CONFIANCE'}</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                          {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                        </span>
                        <a href={`tel:${DISPLAY_PHONE}`} className="font-bold text-white font-mono hover:text-orange-400 transition-colors">
                          {DISPLAY_PHONE}
                        </a>
                      </div>

                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                          {language === 'ar' ? 'الواتساب للمساعدة' : 'WhatsApp Support'}
                        </span>
                        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-400 font-sans hover:underline truncate block">
                          {WHATSAPP_LINK}
                        </a>
                      </div>

                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                          {language === 'ar' ? 'موقعنا الرسمي' : 'Site Web'}
                        </span>
                        <a href="https://globabox.com" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:text-blue-300 font-mono">
                          globabox.com
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 4: Conditions de vente */}
            {activeTab === 'cgv' && (
              <div className="space-y-6">
                <div className="border-b border-slate-105 pb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'الشروط العامة للبيع' : 'Conditions Générales de Vente (CGV)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'ميثاق الثقة المتبادلة والقواعد المنظمة لمشترياتكم بالمتجر' : 'Règles claires de notre contrat commercial de confiance mutuelle au Maroc'}
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
                  {language === 'ar' ? (
                    <div className="space-y-3.5 text-slate-700">
                      <p>مرحباً بكم في موقع <strong>globabox.com</strong>. يخضع استخدامكم للموقع وشراء السلع للشروط والتفاهمات التالية بمجرد تأكيد الطلب لتوفير تجربة ممتازة:</p>
                      
                      <h4 className="font-bold text-slate-900 text-xs">1. شفافية ودقة الأسعار</h4>
                      <p>جميع أسعار السلع معروضة بشكل نهائي بالدرهم المغربي (DH). لا نقوم بفرض أي رسوم أو مصاريف مغلفة أو مخفية دون علمكم المسبق والمباشر عند الطلب.</p>
                      
                      <h4 className="font-bold text-slate-900 text-xs">2. نظام تأكيد الطلبات الصارم</h4>
                      <p>لضمان عدم حدوث أي خطأ في القياس أو العنوان، يتواصل معكم مركز الاتصال الهاتفي أو خدمة الدعم عبر الواتساب لتأكيد تفاصيل الطرد ونوعه قبل إرساله رسمياً للشحن.</p>
                      
                      <h4 className="font-bold text-slate-900 text-xs">3. الدفع نقداً عند استلام ومعاينة الطلب</h4>
                      <p>ندعم كلياً خيار الدفع نقداً عند الاستلام لضمان حماية مشترياتكم. يدفع الزبون القيمة الإجمالية المنصوص عليها في الفاتورة مباشرة للموزع بعد تسلم سلعته بنجاح.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-slate-705">
                      <p>
                        Les présentes conditions régissent de manière transparente les ventes d'équipements outdoor par la boutique en ligne <strong className="text-slate-905 font-bold">Globabox</strong> sur le site internet <strong className="text-orange-600 font-mono">globabox.com</strong>.
                      </p>

                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-slate">1. Tarifs et Prix des Articles</h4>
                      <p>
                        Tous les prix sont affichés de manière transparente en Dirham Marocain (DH). Les prix indiqués sur les fiches produits sont fermes et définitifs lors de la finalisation du panier. Aucun frais d'expédition imprévu ne sera exigé en cachette.
                      </p>

                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-slate">2. Processus de Commande & Confirmation</h4>
                      <p>
                        Le client crée sa sélection en ajoutant des articles à son panier en ligne, puis remplit ses coordonnées (Nom, Ville, Téléphone, Adresse) sur notre formulaire épuré. Suite à cela, un appel ou message de confirmation officiel est émis par nos agents de vente pour valider vos mesures et l'expédition exacte de votre colis.
                      </p>

                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-slate">3. Modalités de Règlement d'achat</h4>
                      <p>
                        Par souci de sécurité anti-fraude absolue, le paiement se fait uniquement et entièrement par <strong>espèces à la livraison (Cash on Delivery)</strong> directement auprès de l'agent livreur autorisé. Aucune avance par carte bancaire n'est de rigueur.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Politique de Confidentialité */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="border-b border-slate-105 pb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Politique de Confidentialité'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'التزامنا الكامل بحماية بياناتكم وهويتكم الرقمية بنسبة 100%' : 'Protection et traitement hautement sécurisé de vos coordonnées privées'}
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-650 leading-relaxed">
                  {language === 'ar' ? (
                    <div className="space-y-3.5 text-slate-750">
                      <p className="font-semibold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
                        تُستخدم بيانات الزبون فقط لمعالجة الطلبات والتوصيل. يتم استخدام رقم الهاتف والعنوان لتأكيد الطلب والتسليم. نحن لا نبيع البيانات لأطراف ثالثة، ويتم مشاركتها فقط مع شركاء التوصيل لغرض الشحن والتسليم.
                      </p>
                      
                      <h4 className="font-bold text-slate-900 text-xs text-sans">أمان وسرية معلوماتكم الرقمية</h4>
                      <p>نحن نحترم تماماً خصوصيتكم. البيانات التي تقدمونها طواعية على موقعنا (مثل الاسم الكامل، المدينة، العنوان، ورقم الهاتف) تتم حمايتها بشكل آمن وتُستخدم حصرياً لإتمام عملية الاتصال الهاتفي وتأكيد قياسات وتفاصيل منتجاتكم قبل شحنها.</p>
                      
                      <h4 className="font-bold text-slate-900 text-xs text-sans">عدم مشاركة المعلومات لأغراض دعائية</h4>
                      <p>نلتزم التزاماً غليظاً بعدم بيع أو تأجير أو مشاركة أو تداول أي من بيانات زبنائنا الشخصية مع شركات إعلانية أو أي أطراف ثالثة أخرى لأهداف تسويقية أو غير ذلك خارج نطاق التوصيل.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-slate-705">
                      <p className="font-semibold text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
                        Les données de nos clients sont utilisées uniquement pour le traitement des commandes et de la livraison. Le numéro de téléphone et l’adresse sont indispensables pour confirmer la commande et assurer son acheminement. Ces données ne sont jamais vendues à des tiers et sont partagées uniquement avec nos partenaires de livraison pour expédier votre colis.
                      </p>
                      
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-slate">Usage et Sécurité Absolue</h4>
                      <p>Nous limitons la collecte de renseignements au strict nécessaire pour dresser votre bordereau d’expédition et finaliser le dépôt de votre commande. Vos données restent archivées dans un environnement numérique sécurisé.</p>
                      
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-slate">Aucune revente à des tiers</h4>
                      <p>Globabox ne commercialise, ne loue, et ne divulgue sous aucun prétexte vos coordonnées privées à des fins publicitaires ou d’autres activités lucratives externes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 6: Contact & Form */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="border-b border-slate-105 pb-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {language === 'ar' ? 'اتصل بـ Globabox المغرب' : 'Contactez Globabox Maroc'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'ar' ? 'لديك أي تساؤل أو ترغب في استشارة حول منتج؟ نحن رهن إشارتكم' : 'Une question, un besoin de conseil produit ? Faites-nous votre demande immédiate'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Direct contact info */}
                  <div className="space-y-5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {language === 'ar' ? (
                        <span>خدمة الزبناء في المغرب رهن إشارتكم طيلة أيام الأسبوع من <strong>8:00 صباحاً إلى 10:00 مساءً</strong> للرد على جميع استفساراتكم.</span>
                      ) : (
                        <span>Notre service client marocain est disponible de <strong>8h00 à 22h00, 7j/7</strong> pour répondre à toutes vos interrogations.</span>
                      )}
                    </p>

                    <div className="space-y-3.5 font-sans">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'ar' ? 'الهاتف للاتصال المباشر' : 'Téléphone d\'appel direct'}
                          </p>
                          <a href={`tel:${ORDER_SUPPORT_NUMBER}`} className="text-sm font-black text-slate-900 font-mono hover:text-orange-500 transition-colors">
                            {ORDER_SUPPORT_NUMBER}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <MessageSquare size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'ar' ? 'خط الواتساب الرسمي' : 'Ligne WhatsApp Officielle'}
                          </p>
                          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-slate-900 font-mono hover:text-emerald-600 transition-colors">
                            {ORDER_SUPPORT_NUMBER}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Mail size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'ar' ? 'البريد الإلكتروني' : 'Courriel Électronique'}
                          </p>
                          <span className="text-xs text-slate-700">{language === 'ar' ? 'الدعم عبر الهاتف أو واتساب' : 'Assistance par téléphone ou WhatsApp'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <MapPin size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'ar' ? 'الموقع الجغرافي والدولة' : 'Siège Social & Pays'}
                          </p>
                          <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                            {language === 'ar' ? 'المغرب' : 'Maroc'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <Clock size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'ar' ? 'أوقات العمل المتاحة' : 'Heures d\'Assistance'}
                          </p>
                          <p className="text-xs text-slate-800 font-semibold">
                            {language === 'ar' ? 'كل يوم (الجمعة والسبت والأحد وكافة الأيام) • 08:00 - 22:00' : 'Tous les jours (Lundi – Dimanche) • 08:00 – 22:00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Simulated interactive message box with whatsapp redirection */}
                  <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl">
                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-3">
                      {language === 'ar' ? 'اكتب لنا مباشرة' : 'Écrivez-nous en direct'}
                    </h4>
                    
                    {!formSubmitted ? (
                      <form onSubmit={handleContactSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            {language === 'ar' ? 'الاسم الكامل للزبون' : 'Votre Nom Complet'}
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder={language === 'ar' ? 'مثال: محمد العلمي' : 'Ex: Mohamed Alami'} 
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            {language === 'ar' ? 'رقم الهاتف / واتساب الخاص بك' : 'Votre Numéro de Téléphone / WhatsApp'}
                          </label>
                          <input 
                            type="tel" 
                            required
                            placeholder={language === 'ar' ? 'مثال: 0612345678' : 'Ex: 0612345678'} 
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            {language === 'ar' ? 'تفاصيل رسالتك أو استفسارك' : 'Votre message'}
                          </label>
                          <textarea 
                            required
                            rows={3}
                            placeholder={language === 'ar' ? 'اكتب تساؤلاتك بشأن السلع، الألوان، المقاسات أو الشحن...' : 'Décrivez votre question, besoin de taille ou demande d\'information commerciale...'} 
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                          ></textarea>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 tracking-wider shadow-md active:scale-[0.98]"
                        >
                          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.261 2.266 3.504 5.279 3.504 8.486 0 6.657-5.338 11.997-12.007 11.997-2.005-.001-3.973-.501-5.727-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.514 0 10.012-4.486 10.012-10 0-2.672-1.037-5.184-2.922-7.07C16.65 1.65 14.134.61 11.534.61c-5.518 0-10.016 4.486-10.016 10 0 1.83.475 3.62 1.39 5.2l-.23 1.28L1.6 22.4l4.3-1.12.3-.12 1.25.75-.804-1.756zM18.1 14.5c-.35-.18-2.2-1.08-2.55-1.2-.35-.12-.6-.18-.85.18-.25.36-.95 1.2-1.15 1.4-.2.25-.4.25-.75.05-.35-.18-1.5-.55-2.85-1.75-1.05-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.72.15-.17.35-.4.5-.6.15-.2.2-.35.3-.5.1-.15.05-.3-.02-.45-.07-.15-.6-1.45-.82-1.98-.22-.53-.45-.45-.62-.46-.16 0-.35-.01-.55-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5s1.1 2.9 1.2 3.1c.15.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 2.2-.9 2.5-1.75.3-.85.3-1.57.2-1.72-.1-.05-.3-.15-.65-.35z" />
                          </svg>
                          <span>{language === 'ar' ? 'إرسال مباشر عبر واتساب' : 'Envoyer via WhatsApp Direct'}</span>
                        </button>
                      </form>
                    ) : (
                      <div className="py-6 text-center space-y-3.5 animate-scale-up">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto text-xl">
                          <CheckCircle2 size={24} />
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs">
                          {language === 'ar' ? 'تم إرسال النموذج بنجاح !' : 'Formulaire envoyé avec succès !'}
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                          {language === 'ar' ? (
                            <span>جاري إعداد التوجيه الآمن لخط الواتساب الرسمي لدردشة مباشرة مع أحد مندوبينا...</span>
                          ) : (
                            <span>Nous préparons la redirection sécurisée vers notre fil WhatsApp officiel pour que l'un de nos conseillers réponde en direct à votre message...</span>
                          )}
                        </p>
                        <button 
                          onClick={handleResetForm}
                          className="text-xs text-slate-500 underline hover:text-slate-800"
                        >
                          {language === 'ar' ? 'إرسال رسالة أخرى' : 'Envoyer un autre message'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
