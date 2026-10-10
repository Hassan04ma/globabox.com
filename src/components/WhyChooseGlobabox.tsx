import { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  ArrowRight,
  Smartphone,
  Sparkles,
  Compass,
  PhoneCall,
  ThumbsUp
} from 'lucide-react';
import { Language } from '../types';
import { WA_LINK } from '../data';

interface WhyChooseGlobaboxProps {
  language: Language;
}

export default function WhyChooseGlobabox({ language }: WhyChooseGlobaboxProps) {
  const isRtl = language === "ar";
  const [activeTab, setActiveTab] = useState<'why' | 'how' | 'delivery' | 'whatsapp' | 'quality'>('why');

  // 1. Pourquoi acheter chez Globabox Section Data
  const whyCards = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-orange-500" />,
      titleFr: "Paiement 100% sécurisé à la livraison",
      titleAr: "الدفع عند الاستلام المريح والمبسط بالمغرب",
      descFr: "Commandez en ligne sans carte bancaire. Vous ne payez en espèces au livreur qu'après réception de vos articles.",
      descAr: "اطلب بكل أريحية وثقة تامة، لن تقوم بدفع سنت واحد إلا بعد استلام طلبيتك وفحص جودتها بنفسك."
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-500" />,
      titleFr: "Livraison Express Express (24h - 48h)",
      titleAr: "شحن وتوصيل فوري سريع للغاية (خلال 24-48 ساعة)",
      descFr: "Profitez d'un envoi rapide et suivi directement de notre dépôt à Casablanca jusqu'à votre porte n'importe où au Maroc.",
      descAr: "نوفر شحن سريع يغطي كافة المدن والأقاليم المغربية مباشرة من مستودعنا المركزي بالدار البيضاء."
    },
    {
      icon: <Eye className="w-8 h-8 text-orange-500" />,
      titleFr: "Ouverture & Vérification avant paiement",
      titleAr: "إمكانية فتح الطرد وفحص السلع قبل الدفع",
      descFr: "L'expédition de confiance ! Chez Globabox, vous avez le droit d'ouvrir le colis et d'inspecter vos articles devant le livreur.",
      descAr: "نضمن حقك الكامل، لك الإذن المباشر لفتح العبوة أمام الموزع للتأكد من سلامة الأغراض قبل دفع ثمنها."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-500" />,
      titleFr: "Conseillers Humains WhatsApp 7j/7",
      titleAr: "خدمة عملاء ومبيعات متكاملة ومباشرة عبر الواتساب",
      descFr: "Vrais humains basés au Maroc ! Demandez des photos réelles des randonnées, posez vos questions, ou passez commande directement.",
      descAr: "راسلنا على الواتساب طيلة الأسبوع للحصول على صور حقيقية للسلع بالدقة الكاملة أو للاستفسار عن منتج."
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-orange-500" />,
      titleFr: "Garantie Échange & Retour sous 7 jours",
      titleAr: "سياسة استبدال مرنة وبسيطة للغاية خلال 7 أيام",
      descFr: "Le produit ne convient pas ou la taille est inadéquate ? Contactez-nous pour un échange rapide et sans tracas.",
      descAr: "هل المقاس غير مناسب أو تود تغيير الموديل؟ لدينا سياسة استبدال سلسة وسريعة لترضى عن معاملتنا."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      titleFr: "Matériel sélectionné & testé aux Atlas",
      titleAr: "مستلزمات برية منتقاة بعناية ومجربة جغرافياً",
      descFr: "Nous testons personnellement l'étanchéité de nos tentes et la robustesse de nos réchauds dans les conditions froides de l'Atlas.",
      descAr: "نقوم باختبار جودة الخيام ومقاومة مواقد الطبخ لحرارة وبرودة الأطلس والصحراء قبل عرضها بالمتجر."
    }
  ];

  // 2. Comment se passe la commande Section Data
  const orderSteps = [
    {
      step: "01",
      titleFr: "Validation en 1 Clic",
      titleAr: "تعبئة الطلب في دقيقة",
      descFr: "Remplissez le formulaire de commande avec votre nom et téléphone. Pas besoin de carte bancaire.",
      descAr: "املأ بيانات التوصيل البسيطة (الاسم، الهاتف، المدينة) بدون الحاجة لإدخال أي بطاقة دفع."
    },
    {
      step: "02",
      titleFr: "Appel de Confirmation",
      titleAr: "مكالمة لتأكيد العنوان",
      descFr: "Notre équipe marocaine vous appelle par téléphone sous 2 heures pour valider l'adresse et les tailles.",
      descAr: "يتصل بك فريق الدعم الفني لتأكيد المقاسات وتنسيق العنوان الدقيق للشحن بهدوء وسلاسة."
    },
    {
      step: "03",
      titleFr: "Emballage & Expédition",
      titleAr: "تغليف دقيق وفحص شامل",
      descFr: "Chaque produit est vérifié manuellement à Casablanca, emballé avec soin et expédié le jour même.",
      descAr: "نقوم بفحص سلامة السلعة، ثم تغليفها بمواد عازلة ضد الصدمات لتسليمها لأفضل شركات الشحن المغربية."
    },
    {
      step: "04",
      titleFr: "Livraison & Vérification",
      titleAr: "الاستلام والمعاينة والدفع",
      descFr: "Le livreur vous contacte près de chez vous. Ouvrez le paquet, vérifiez la conformité, puis payez en espèces.",
      descAr: "يتصل بك الموزع عند اقترابه. افتح طردك وافحصه بدقة، وعند الرضا التام ادفع القيمة نقداً."
    }
  ];

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-200/60 font-sans"
      id="why-choose-globabox-section"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Main Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0b1528] text-[#f97316] text-[10px] font-black uppercase px-3 py-1.5 rounded-full mb-3 tracking-wider border border-orange-500/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRtl ? "فضاء الثقة والضمانات" : "ESPACE CONFIANCE & RÉASSURANCE"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isRtl ? "تسوق بكل راحة وأمان مع جلوبابوكس المغرب" : "Pourquoi devriez-vous acheter chez Globabox ?"}
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            {isRtl 
              ? "نلتزم بتقديم تجربة تسوق شفافة خالية من التعقيدات، مع تغطية كاملة لخدمات الشحن السريع واسترجاع مرن." 
              : "Parce que votre satisfaction est notre priorité absolue, nous éliminons tous les risques liés aux achats en ligne."}
          </p>
        </div>

        {/* Dynamic Trust Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-slate-205 pb-4 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('why')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'why'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isRtl ? "لماذا جلوبابوكس ؟" : "Pourquoi acheter ?"}</span>
          </button>

          <button
            onClick={() => setActiveTab('how')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'how'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isRtl ? "كيف تتم العملية ؟" : "Comment commander ?"}</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{isRtl ? "توصيل الدفع عند الاستلام" : "Livraison & Paiement"}</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isRtl ? "خدمة مبيعات واتساب" : "Support WhatsApp"}</span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'quality'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{isRtl ? "منتجات مختارة بدقة" : "Sélection avec Soin"}</span>
          </button>
        </div>

        {/* --- TAB CONTENT AREA --- */}

        {/* 1. Pourquoi acheter chez Globabox */}
        {activeTab === 'why' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {whyCards.map((adv, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-orange-500/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-[#0B1528] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#f97316]/10 transition-colors">
                  {adv.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-2 font-sans tracking-tight">
                  {isRtl ? adv.titleAr : adv.titleFr}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  {isRtl ? adv.descAr : adv.descFr}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 2. Comment se passe la commande ? */}
        {activeTab === 'how' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-base font-black uppercase text-[#0b1528] tracking-widest mb-1">
                {isRtl ? "خطوات الطلب من البداية للرعاية" : "Le cycle de commande Globabox"}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? "أربع خطوات واضحة وموثوقة، خالية تماماً من التعقيدات المصرفية أو المخاوف." : "Voici comment se déroule votre commande de manière limpide de A à Z."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {orderSteps.map((s, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 relative shadow-sm hover:translate-y-[-2px] transition-transform">
                  <span className="absolute top-4 right-4 text-3xl font-black font-mono text-orange-500/10">
                    {s.step}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-600/10 text-orange-600 flex items-center justify-center text-xs font-black font-mono mb-4">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-2 font-sans">
                    {isRtl ? s.titleAr : s.titleFr}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                    {isRtl ? s.descAr : s.descFr}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-orange-50 border border-orange-200/55 p-4 rounded-xl text-center max-w-xl mx-auto">
              <p className="text-xs text-orange-950 font-semibold font-sans">
                {isRtl 
                  ? "💡 لا حاجة لاستخدام بطاقة الائتمان على موقعنا. طريقة الشراء آمنة وسهلة 100٪."
                  : "💡 Aucun paiement anticipé n'est exigé. Tout se déroule de manière saine et basée sur la confiance."}
              </p>
            </div>
          </div>
        )}

        {/* 3. Livraison et paiement à la livraison */}
        {activeTab === 'delivery' && (
          <div className="bg-[#0b1528] rounded-3xl border border-[#1c2e4a] p-6 md:p-8 relative overflow-hidden animate-fade-in text-white">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] bg-orange-600 text-white font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest inline-block">
                  {isRtl ? "شحن وتوصيل فوري بالمغرب" : "LIVRAISON EXPRESS & COD SECURE"}
                </span>
                <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                  {isRtl ? "مستعدون للتوصيل لكافة مدن ومناطق المغرب مجاناً" : "Réglez vos achats en espèces lors de la livraison à domicile"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isRtl
                    ? "نلتزم بشحن طلبياتكم بعناية تامة وخلال مدة تتراوح بين 24 إلى 48 ساعة فقط. شراكتنا الاستراتيجية مع أفضل موزعي الخدمات البريدية وموزعي التوصيل المحليين تضمن وصول الطرود لبيوتكم دون جهد أو عناء."
                    : "Votre commande est expédiée sous 24h à 48h de nos entrepôts. Notre livreur vous avertit par téléphone avant son passage à votre adresse. Vous bénéficiez d'un droit absolu de déballage et d'inspection avant de lui confier le règlement en espèces."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-2.5 bg-[#122037] border border-[#213757] p-3 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{isRtl ? "التوصيل مجاني لجميع الطلبات" : "Livraison 100% Gratuite"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-[#122037] border border-[#213757] p-3 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{isRtl ? "فحص المحتوى مسموح تماماً" : "Inspection ouverte autorisée"}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#122037] border border-[#213757] rounded-2xl p-5 space-y-4 text-slate-200">
                <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">
                  {isRtl ? "معلومات سياسة التوصيل المعتمدة" : "Charte d'expédition & Confiance"}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {isRtl 
                    ? "في حال وجود أي تلف ناتج عن الشحن، أو عدم مطابقة تامة للمواصفات المعروضة، يمكنك استبدال المنتج فوراً مجاناً دون دفع أي تكاليف إضافية."
                    : "Notre charte garantit une conformité parfaite. Tout dommage lié au transport ou déviation technique constatée à l'arrivée donne lieu à un échange instantané gratuit à nos frais."}
                </p>
                <div className="border-t border-slate-700/60 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600/10 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] block font-black text-white">{isRtl ? "تأمين شامل للطرود" : "Couverture Globale et Assurance"}</span>
                      <span className="text-[10px] text-slate-400">{isRtl ? "منتجاتنا مغلفة بعناية وبأغلفة خاصة" : "Conditionnements solides anti-chocs"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Service client WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-black uppercase px-3 py-1 rounded-full border border-emerald-200/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  <span>{isRtl ? "دعم بشري مباشر وسريع" : "TEAM CONSEIL WHATSAPP DIRECT"}</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight font-sans">
                  {isRtl ? "مستشارو جلوبابوكس في خدمتكم طيلة 7 أيام" : "Une Assistance humaine marocaine via WhatsApp"}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isRtl 
                    ? "هل تتردد في المقاس الصحيح؟ أو ترغب برؤية صور وفيديوهات حقيقية للخيام أو كراسي التخييم قبل إرسال طلبيتك؟ انقر فوراً على زر اتصال واتساب، وسيقوم ممثل خدمة العملاء لدينا محلياً بإرسال الصور والرد على كافة تفاصيلك بجودة وودية تامة."
                    : "Besoin d'aide pour choisir le volume d'un réchaud, d'une tente ou d'un sac à dos ? Vous aimeriez des photos réelles de l'équipement hors studio commercial ? Nos assistants spécialisés sont là pour vous guider en français et en darija. N'attendez plus ! Cliquez pour chatter."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span>{isRtl ? "📱 ابدأ محادثة مباشرة مع مستشارك الآن" : "📱 Contacter un conseiller sur WhatsApp"}</span>
                  </a>
                  <a
                    href="tel:0649264408"
                    className="border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <PhoneCall className="w-4 h-4 text-slate-600" />
                    <span>{isRtl ? "اتصل بنا هاتفياً" : "Appeler notre standard"}</span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs block font-black text-slate-900">{isRtl ? "دعم مخصص 100٪" : "Interlocuteurs Humains Marocains"}</span>
                    <span className="text-[11px] text-slate-500">{isRtl ? "لا نستخدم روبوتات رد آلي في المعاملات" : "Aucun robot de messagerie impersonnel"}</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 italic text-slate-600 text-xs font-sans">
                  &ldquo;{isRtl 
                    ? "لقد طلبت خيمة تخييم لـ 4 أشخاص وكنت خائفاً من جودة النسيج، خدمة العملاء أرسلوا لي فيديو واقعي من مستودعهم في كازا حتى وافقت ثم أرسلوا لي الطلب." 
                    : "L'équipe m'a envoyé de réelles prises de vue de la lampe frontale et du réchaud à gaz avant l'expédition de ma commande. Service impeccable et rassurant à Casa !"} &rdquo;
                  <cite className="block text-[10px] text-slate-450 font-bold mt-1.5 not-italic">— Imad, Casablanca</cite>
                </blockquote>
              </div>
            </div>
          </div>
        )}

        {/* 5. Produits sélectionnés avec soin */}
        {activeTab === 'quality' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 space-y-4">
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider inline-block">
                  {isRtl ? "معايير اختيار المنتجات الصارمة" : "PROCESSUS DE SÉLECTION RIGOUREUSE"}
                </span>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight font-sans">
                  {isRtl ? "مستلزمات برية مختارة ومنتقاة بعناية فائقة" : "Des Équipements Outdoor certifiés et de haute qualité"}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {isRtl
                    ? "لا توجد عشوائية في متجرنا. كل خيمة، كيس نوم، أو أداة طبخ يتم إخضاعها لسلسة اختبارات دقيقة من فريق متجر جلوبابوكس بالدار البيضاء. نتأكد من متانة الخيوط، جودة سحابات الإغلاق، مقاومة المواد للمياه، وقدرتها على تحمل الأجواء الصعبة كجبال الأطلس."
                    : "Aucun produit ne rejoint notre catalogue par hasard. Nos experts en équipements à Casablanca ouvrent chaque arrivage pour des tests physiques : imperméabilité des tentes dôme, solidité des coutures des sacs à dos, et stabilité des réchauds de camping. S'il ne répond pas à notre charte robuste, nous ne le mettons pas en vente."}
                </p>

                <ul className="space-y-2 text-xs text-slate-650 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{isRtl ? "✓ اختبار العزل الحراري ومقاومة الرطوبة العالية" : "🧠 Test d'étanchéité et d'imperméabilité des toiles"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{isRtl ? "✓ فحص يدوي لمعدات الطبخ ومخارج البوتان قبل التسليم" : "🔍 Inspection manuelle des brûleurs de réchauds"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{isRtl ? "✓ ضمان خلو الخياطة من أي تشوهات أو عيوب تصنيع" : "🛡️ Validation de robustesse des zips et des attaches"}</span>
                  </li>
                </ul>
              </div>

              <div className="order-1 lg:order-2 bg-[#0B1528] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                
                <div>
                  <h4 className="text-sm font-black text-orange-500 mb-2 font-sans tracking-wide">
                    {isRtl ? "التطوير البري المستمر" : "Engagement Qualité Globabox Marche"}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {isRtl 
                      ? "نهدف لتقديم أفضل مستلزمات الأنشطة الخارجية والبرية بالمملكة بأفضل تكاليف مدروسة دون التفريط بجودة المعايير المطلوبة."
                      : "Nous fournissons des tentes dômes, réchauds, et accessoires de camp de premier ordre. Pas de mauvaise surprise à la réception : les articles livrés correspondent exactement aux vidéos et photos fournies par l'équipe."}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
                  <span className="text-[11px] text-slate-200 font-sans">
                    {isRtl ? "دقة التصنيع واختبار المتانة في ظروف بيئية مغربية صعبة" : "Validation terrain rigoureuse pour votre sécurité outdoor."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
