export interface Product {
  id: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  price: number; // in DH
  originalPrice?: number;
  description: {
    fr: string;
    ar: string;
    en: string;
  };
  features: {
    fr: string[];
    ar: string[];
    en: string[];
  };
  category: string;
  image: string;
  images: string[];
  fallbackImage?: string;
  fallbackImages?: string[];
  additionalImages: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockStatus?: 'in_stock' | 'limited' | 'out_of_stock';
  bestSeller?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  isActive?: boolean;
  visibilityChanged?: boolean;
  sortOrder?: number;
  createdAt?: string;
  sizes?: string[];
  colors?: string[];
}

export interface Category {
  id: string;
  name: {
    fr: string;
    ar: string;
    en: string;
  };
  image: string;
  description?: {
    fr: string;
    ar: string;
    en: string;
  };
}

export const CATEGORIES: Category[] = [
  { id: 'sacs_trekking', name: {fr:'Sacs à dos Trekking',ar:'حقائب الظهر للرحلات',en:'Trekking Backpacks'},
    image:'', description:{fr:'Sacs à dos de randonnée et voyage.',ar:'حقائب ظهر للتخييم والرحلات والسفر.',en:'Backpacks for travel and hiking.'} },
  {
    id: "camping",
    name: { fr: "Camping", ar: "التخييم", en: "Camping" },
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Matériel de camping professionnel pour le bivouac et l'outdoor au Maroc.",
      ar: "معدات تخييم برية احترافية للمبيت الخارجي في المغرب.",
      en: "Professional camping gear for bivouac and outdoor adventures in Morocco."
    }
  },
  {
    id: "tentes",
    name: { fr: "Tentes", ar: "الخيام", en: "Tents" },
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Tentes imperméables, robustes et faciles à installer de 2 à 8 personnes.",
      ar: "خيام مقاومة للماء، متينة وسهلة التركيب لـ 2 إلى 8 أشخاص.",
      en: "Waterproof, robust and easy to set up tents for 2 to 8 people."
    }
  },
  {
    id: "sacs_de_couchage",
    name: { fr: "Sacs de couchage", ar: "أكياس النوم", en: "Sleeping Bags" },
    image: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Sacs de couchage chauds, compacts et confortables pour vos nuits à la belle étoile.",
      ar: "أكياس نوم دافئة، مدمجة ومريحة لياليك تحت النجوم.",
      en: "Warm, compact, and comfortable sleeping bags for sleeping under the stars."
    }
  },
  {
    id: "casquettes",
    name: { fr: "Casquettes", ar: "قبعats", en: "Caps" },
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Casquettes de protection solaire légères et ventilées pour vos randonnées.",
      ar: "قبعات خفيفة ومقواة للحماية من الشمس ومناسبة للمشي الطويل.",
      en: "Lightweight and ventilated caps for sun protection during hikes."
    }
  },
  {
    id: "chaussures",
    name: { fr: "Chaussures", ar: "أحذية", en: "Shoes" },
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Chaussures de randonnée robustes et confortables pour tous types de terrains marocains.",
      ar: "أحذية مشي متينة ومريحة لجميع أنواع التضاريس المغربية.",
      en: "Robust and comfortable hiking shoes for all types of Moroccan terrain."
    }
  },
  {
    id: "rechauds",
    name: { fr: "Réchauds & Cuisine", ar: "مواقد ومطابخ", en: "Stoves & Kitchen" },
    image: "https://images.unsplash.com/photo-1598048604770-5bfa37b1cc11?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Réchauds à gaz, ustensiles de cuisine légers et accessoires en aluminium.",
      ar: "مواقد غاز وأواني طبخ خفيفة وإكسسوارات من الألمنيوم للتخييم.",
      en: "Gas stoves, lightweight cooking utensils, and aluminum outdoor kitchen accessories."
    }
  },
  {
    id: "tables_chaises",
    name: { fr: "Tables & Chaises", ar: "طاولات وكراسي", en: "Tables & Chairs" },
    image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Tables pliantes légères, chaises de camping ultra compactes et pliables.",
      ar: "طاولات قابلة للطي وكراسي تخييم مدمجة وخفيفة الوزن.",
      en: "Lightweight folding tables and ultra-compact, foldable camping chairs."
    }
  },
  {
    id: "chasse",
    name: { fr: "Chasse & Nature", ar: "الصيد والطبيعة", en: "Hunting & Nature" },
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Équipement de chasse, vêtements de camouflage, jumelles et accessoires nature.",
      ar: "معدات صيد بري، ملابس تمويه، مناظير وإكسسوارات طبيعية.",
      en: "Hunting gear, camouflage clothing, binoculars, and wilderness accessories."
    }
  },
  {
    id: "peche",
    name: { fr: "Pêche", ar: "صيد السمك", en: "Fishing" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Cannes à pêche, moulinets, leurres et accessoires de pêche de qualité.",
      ar: "قصبات صيد، بكرات، طعوم وإكسسوارات صيد ذات جودة عالية للبحار والوديان.",
      en: "Quality fishing rods, reels, lures, and fishing accessories."
    }
  },
  {
    id: "accessoires",
    name: { fr: "Accessoires", ar: "أكسسوارات", en: "Accessories" },
    image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Accessoires indispensables d'outdoor, lampes frontales, gourdes et boussoles.",
      ar: "ملحقات برية لا غنى عنها، مصابيح رأس، مطارات مياه وبوصلات.",
      en: "Must-have outdoor accessories, headlamps, water bottles, and compasses."
    }
  },
  {
    id: "outdoor-tools",
    name: { fr: "Outdoor Tools", ar: "أدوات ومعدات برية", en: "Outdoor Tools" },
    image: "https://images.unsplash.com/photo-1540324155974-72413d906757?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Outils et équipements indispensables d'outdoor, lampes frontales, couteaux et boussoles.",
      ar: "أدوات ومعدات ضرورية للتخييم والرحلات ومصابيح رأس.",
      en: "Essential outdoor tools, headlamps, knives and pocket tools."
    }
  },
  {
    id: "maison",
    name: { fr: "Maison", ar: "للمنزل", en: "Home Outdoor" },
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Solutions pratiques d'outdoor pour le jardin, balcon et la maison.",
      ar: "حلول برية وخارجية عملية للحديقة والشرفة والمنزل.",
      en: "Practical outdoor solutions for the garden, balcony, and home."
    }
  },
  {
    id: "sport_loisirs",
    name: { fr: "Sport & Loisirs", ar: "الرياضة والترفيه", en: "Sport & Leisure" },
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Équipements sportifs et sacs à dos résistants pour vos activités de loisirs.",
      ar: "حقائب ظهر ومعدات رياضية متينة لأنشطتك الترفيهية والرياضية.",
      en: "Durable sports equipment and backpacks for your leisure activities."
    }
  },
  {
    id: "moins_99",
    name: { fr: "Moins 99 DH", ar: "أقل من 99 درهم", en: "Under 99 DH" },
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Une sélection de gadgets et accessoires d'outdoor indispensables à moins de 99 DH.",
      ar: "تشكيلة من الملحقات البرية والأدوات الأساسية بأقل من 99 درهم.",
      en: "A selection of indispensable outdoor gadgets and accessories for under 99 DH."
    }
  },
  {
    id: "offres_packs",
    name: { fr: "Offres Packs", ar: "عروض الحزم", en: "Pack Offers" },
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=400",
    description: {
      fr: "Packs économiques et combos d'équipements pour économiser au maximum.",
      ar: "حزم ومجموعات اقتصادية لتوفير المال والحصول على التجهيز الكامل.",
      en: "Value bundle packs and multi-item combos to maximize outdoor savings."
    }
  }
];

export const PRODUCTS: Product[] = [
  // ==================== 1. BEST SELLERS FIRST ====================
  {
    id: "tente-dome-camping-2-3-personnes",
    name: {
      fr: "Tente Dôme Camping 2-3 Personnes - Montage Rapide",
      ar: "خيمة دوم للتخييم 2-3 أشخاص سهلة التركيب",
      en: "2-3 Person Dome Camping Tent - Quick Setup"
    },
    price: 400,
    originalPrice: 499,
    description: {
      fr: "Profitez de vos sorties camping, bivouac, pêche ou voyage avec cette tente dôme pratique et confortable. Son design léger et son montage rapide la rendent idéale pour les aventures en plein air, les week-ends en nature et les sorties en famille ou entre amis. Elle offre un bon espace intérieur, une entrée large et une structure stable pour une utilisation simple et efficace.",
      ar: "استمتع برحلات التخييم والسفر والصيد مع هذه الخيمة العملية والمريحة. تصميمها الخفيف وسهولة تركيبها يجعلها مناسبة للرحلات في الطبيعة، الويكاند، والسفر مع العائلة أو الأصدقاء. توفر مساحة داخلية جيدة ومدخلًا واسعًا وهيكلًا ثابتًا للاستعمال السهل والمريح.",
      en: "Enjoy camping, bivouac, fishing trips, and outdoor adventures with this practical dome tent. Its lightweight design and quick setup make it ideal for weekends in nature, family trips, and outdoor activities. It offers comfortable interior space, a wide entrance, and a stable structure for easy use."
    },
    features: {
      fr: [
        "Convient pour 2 à 3 personnes",
        "Montage rapide et facile",
        "Entrée large et confortable",
        "Design léger et pratique",
        "Idéale pour camping, pêche, voyage et nature",
        "Facile à transporter",
        "Structure stable pour les sorties outdoor"
      ],
      ar: [
        "مناسبة لشخصين إلى 3 أشخاص",
        "سهلة وسريعة التركيب",
        "مدخل واسع ومريح",
        "تصميم خفيف وعملي",
        "مثالية للتخييم والصيد والسفر والطبيعة",
        "سهلة الحمل والتنقل",
        "هيكل ثابت ومناسب للأنشطة الخارجية"
      ],
      en: [
        "Suitable for 2 to 3 people",
        "Quick and easy setup",
        "Wide and comfortable entrance",
        "Lightweight and practical design",
        "Ideal for camping, fishing, travel, and nature trips",
        "Easy to carry",
        "Stable structure for outdoor use"
      ]
    },
    category: "tentes",
    image: "/products/tente-dome-camping-2-3-personnes/1.png",
    images: [
      "/products/tente-dome-camping-2-3-personnes/1.png",
      "/products/tente-dome-camping-2-3-personnes/2.png",
      "/products/tente-dome-camping-2-3-personnes/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.9,
    reviewsCount: 124,
    inStock: true,
    bestSeller: true,
    newArrival: true,
    sizes: ["2-3 personnes", "4 places (+150 DH)"],
    colors: ["Vert militaire", "Bleu Cobalt"]
  },
  {
    id: "tente-dome-3p",
    name: {
      fr: "Tente Dôme Imperméable 3 Personnes",
      ar: "خيمة دوم مضادة للماء لـ 3 أشخاص",
      en: "Waterproof 3-Person Dome Tent"
    },
    price: 499,
    originalPrice: 650,
    description: {
      fr: "Conçue pour vos aventures en montagne et camping, cette tente est robuste, spacieuse, imperméable et offre un montage rapide en moins de 5 minutes.",
      ar: "تم تصميم هذه الخيمة لتناسب مغامراتك في الجبال والتخييم، وهي متينة وواسعة ومقاومة للماء وسهلة التركيب في أقل من 5 دقائق.",
      en: "Designed for mountain adventures and camping, this tent is robust, spacious, waterproof and sets up in less than 5 minutes."
    },
    features: {
      fr: ["Imperméabilité Schmerber 3000mm", "Double toit pour éviter la condensation", "Arceaux en fibre de verre haute résistance", "Sac de transport inclus"],
      ar: ["مقاومة للماء 3000 ملم", "سقف مزدوج لمنع التكثيف", "أعمدة متينة للغاية من ألياف الزجاج", "حقيبة حمل مرفقة"],
      en: ["3000mm waterproof rating", "Double layout roof prevents condensation", "High strength fiberglass poles", "Carry bag included"]
    },
    category: "tentes",
    image: "/products/tente-dome-3p/1.png",
    images: [
      "/products/tente-dome-3p/1.png",
      "/products/tente-dome-3p/2.png",
      "/products/tente-dome-3p/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 42,
    inStock: true,
    bestSeller: true
  },
  {
    id: "sac-couchage-extreme",
    name: {
      fr: "Sac de Couchage Grand Froid -10°C",
      ar: "كيس نوم للطقس شديد البرودة -10 درجات",
      en: "Cold Weather -10°C Sleeping Bag"
    },
    price: 349,
    originalPrice: 450,
    description: {
      fr: "Affrontez confortablement les nuits les plus froides de l'Atlas marocain. Rembourrage thermique haute densité de type momie avec collerette anti-froid.",
      ar: "واجه بثقة الليالي الأكثر برودة في الأطلس المغربي. حشو حراري عالي الكثافة على شكل مومياء مع ياقة مانعة للبرد.",
      en: "Comfortably handle the coldest nights in the Moroccan Atlas. Mummy-style high density thermal filling with draft collar."
    },
    features: {
      fr: ["Température confort 0°C / Limite -10°C", "Tissu extérieur déperlant indéchirable", "Capuche ajustable avec cordon", "Fermeture double curseur autobloquant"],
      ar: ["حرارة الراحة 0° درجة / الحد الأقصى -10° درجات", "قماش نسيج خارجي طارد للماء ومقاوم للتمزق", "غطاء رأس قابل للتعديل برباط", "سحاب ذو اتجاهين للإغلاق التلقائي"],
      en: ["Comfort rating 0°C / Extreme limit -10°C", "Ripstop water-repellent outer shell", "Adjustable hood with drawstring", "Dual-slider auto-locking zip"]
    },
    category: "sacs_de_couchage",
    image: "/products/sac-couchage-extreme/1.png",
    images: [
      "/products/sac-couchage-extreme/1.png",
      "/products/sac-couchage-extreme/2.png",
      "/products/sac-couchage-extreme/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.9,
    reviewsCount: 18,
    inStock: true,
    bestSeller: true
  },
  {
    id: "lanterne-led-solaire",
    name: {
      fr: "Lanterne de Camping Solaire Rechargeable USB",
      ar: "مصباح تخييم يشحن بالطاقة الشمسية و USB",
      en: "Solar & USB Rechargeable Camping Lantern"
    },
    price: 180,
    originalPrice: 250,
    description: {
      fr: "Lanterne ultra-lumineuse avec panneau solaire intégré et batterie externe pour recharger vos téléphones en plein bivouac.",
      ar: "فانوس فائق الإضاءة مزود بلوح شمسي مدمج ومخزن طاقة لشحن الهواتف in عمق المعسكر.",
      en: "Ultra-bright lantern with integrated solar panel and power bank functionality to recharge your phones at camp."
    },
    features: {
      fr: ["Puissance 800 Lumens réglable", "Batterie interne rechargeable 4400mAh", "Panneau solaire de secours pliable", "Résistance à la pluie IPX5"],
      ar: ["إضاءة 800 لومن قابلة للتعديل", "بطارية داخلية قابلة لإعادة الشحن 4400 مللي أمبير", "لوح طاقة شمسية للطوارئ", "مقاوم للمطر بمعيار IPX5"],
      en: ["Adjustable 800 Lumens brightness", "4400mAh internal rechargeable battery", "Emergency backing solar panel", "IPX5 rainproof protection"]
    },
    category: "camping",
    image: "/products/lanterne-led-solaire/1.png",
    images: [
      "/products/lanterne-led-solaire/1.png",
      "/products/lanterne-led-solaire/2.png",
      "/products/lanterne-led-solaire/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.7,
    reviewsCount: 33,
    inStock: true,
    bestSeller: true
  },
  {
    id: "boots-trekk-pro",
    name: {
      fr: "Chaussures de Randonnée Trekking Pro",
      ar: "حذاء للمشي لمسافات طويلة وتريكنغ برو",
      en: "Trekking Pro Hiking Boots"
    },
    price: 550,
    originalPrice: 750,
    description: {
      fr: "Chaussures montantes imperméables avec semelle Vibram tout-terrain. Idéal pour de longues randonnées en montagne rocheuse.",
      ar: "حذاء برقبة مرتفعة مقاوم للماء مع نعل بميزة امتصاص الصدم الصدمات لكل التضاريس. خيار رائع لمسافات طويلة في الجبال الصخرية.",
      en: "High-top waterproof outdoor boots with extreme grip Vibram outer sole. Ideal for lengthy treks on jagged mountains."
    },
    features: {
      fr: ["Membrane imper-respirante double couche", "Semelle antidérapante crantée", "Protection pare-pierres intégrale"],
      ar: ["غشاء عازل ومسامي مزدوج الطبقة", "نعل خشن مانع للانزلاق", "حماية مدمجة ضد الصخور والحصى"],
      en: ["Double-layer waterproof-breathable liner", "High-traction deep-groove rubber sole", "All-around stone guard bumper"]
    },
    category: "chaussures",
    image: "/products/boots-trekk-pro/1.png",
    images: [
      "/products/boots-trekk-pro/1.png",
      "/products/boots-trekk-pro/2.png",
      "/products/boots-trekk-pro/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1461141346587-763ab02bced9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1461141346587-763ab02bced9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.8,
    reviewsCount: 31,
    inStock: true,
    bestSeller: true,
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Marron Bivouac", "Gris Anthracite"]
  },
  {
    id: "rechaud-et-popote",
    name: {
      fr: "Pack Réchaud à Gaz + Kit Cuisine complet",
      ar: "باقة موقد الغاز + طقم أواني المطبخ المتكامل",
      en: "Gas Stove + Complete Camping Kitchen Cookware"
    },
    price: 299,
    originalPrice: 399,
    description: {
      fr: "L'ensemble ultime pour cuisiner vos repas chauds n'importe où. Comprend un mini réchaud pliable piézoélectrique et des casseroles gigognes en aluminium anodisé.",
      ar: "المجموعة الأتم لطهي وجباتك الساخنة في أي مكان. تشتمل على موقد غاز صغير قابل للطي وبورسلين طهي متداخل خفيف الوزن.",
      en: "The ultimate kit to cook hot meals anywhere. Includes a piezo-ignition folding gas mini stove and nesting lightweight anodized helper pots."
    },
    features: {
      fr: ["Réchaud ultra-compact flamme réglable", "Comprend : 1 casserole, 1 poêle, 2 bols, couverts pliants et louche", "Poignées isolées thermiquement", "Poids total seulement 420g dans sa housse"],
      ar: ["موقد فائق الصغر بشعلة قابلة للضبط", "يشمل: قدر، مقلاة، وعاءين، أدوات مائدة قابلة للطي ومغرفة", "مقابض معزولة حرارياً لحماية يديك", "وزن إجمالي 420 غرام فقط في كيس الضغط"],
      en: ["Ultra-compact stove with micro control valve", "Includes: 1 pot, 1 frying pan, 2 bowls, folding cutlery and spatula", "Heat-resistant foldable handles", "Total package weight only 420g in carry pouch"]
    },
    category: "rechauds",
    image: "/products/rechaud-et-popote/1.png",
    images: [
      "/products/rechaud-et-popote/1.png",
      "/products/rechaud-et-popote/2.png",
      "/products/rechaud-et-popote/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1598048604770-5bfa37b1cc11?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.8,
    reviewsCount: 19,
    inStock: true,
    bestSeller: true
  },
  {
    id: "rechaud-gaz-camping",
    name: {
      fr: "Réchaud gaz camping avec cartouche",
      ar: "موقد غاز للتخييم مع قارورة",
      en: "Camping Gas Stove with Cartridge"
    },
    price: 289,
    originalPrice: 320,
    description: {
      fr: "Réchaud portable pratique pour cuisiner facilement pendant le camping, les sorties nature et les voyages.",
      ar: "موقد غاز محمول عملي للطبخ أثناء التخييم والرحلات والسفر.",
      en: "Portable camping gas stove for easy outdoor cooking, camping and travel."
    },
    features: {
      fr: [
        "Léger et facile à transporter",
        "Compatible avec cartouche de gaz",
        "Idéal pour camping, bivouac, pêche et randonnées",
        "Structure métallique stable",
        "Facile à installer et à utiliser"
      ],
      ar: [
        "خفيف وسهل الحمل",
        "متوافق مع قارورة الغاز",
        "مناسب للتخييم والصيد والرحلات",
        "هيكل معدني ثابت",
        "سهل التركيب والاستعمال"
      ],
      en: [
        "Lightweight and easy to carry",
        "Compatible with gas cartridge",
        "Ideal for camping, fishing and hiking",
        "Stable metal structure",
        "Easy to install and use"
      ]
    },
    category: "rechauds",
    image: "/products/rechaud-gaz-camping/1.png",
    images: [
      "/products/rechaud-gaz-camping/1.png",
      "/products/rechaud-gaz-camping/2.png",
      "/products/rechaud-gaz-camping/3.png",
      "/products/rechaud-gaz-camping/4.png",
      "/products/rechaud-gaz-camping/5.png",
      "/products/rechaud-gaz-camping/6.png",
      "/products/rechaud-gaz-camping/7.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1598048604770-5bfa37b1cc11?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1598048604770-5bfa37b1cc11?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "/products/rechaud-gaz-camping/2.png",
      "/products/rechaud-gaz-camping/3.png",
      "/products/rechaud-gaz-camping/4.png",
      "/products/rechaud-gaz-camping/5.png",
      "/products/rechaud-gaz-camping/6.png",
      "/products/rechaud-gaz-camping/7.png"
    ],
    rating: 4.8,
    reviewsCount: 35,
    inStock: true,
    stockStatus: "in_stock",
    bestSeller: true,
    newArrival: true
  },
  {
    id: "lampe-frontale-rechargeable",
    name: {
      fr: "Lampe frontale rechargeable LED",
      ar: "مصباح رأس قابل للشحن LED",
      en: "Rechargeable LED Headlamp"
    },
    price: 249,
    originalPrice: 300,
    description: {
      fr: "Lampe frontale rechargeable puissante, idéale pour camping, pêche, randonnée, travaux de nuit et situations d’urgence.",
      ar: "مصباح رأس قوي قابل للشحن، مناسب للتخييم والصيد والمشي الليلي والأعمال الليلية والطوارئ.",
      en: "Powerful rechargeable headlamp, ideal for camping, fishing, hiking, night work and emergencies."
    },
    features: {
      fr: [
        "Éclairage LED puissant",
        "Rechargeable par câble USB",
        "Bandeau réglable confortable",
        "Idéale pour camping, randonnée et pêche",
        "Batterie incluse selon disponibilité du pack",
        "Pratique pour les travaux de nuit"
      ],
      ar: [
        "إضاءة LED قوية",
        "قابلة للشحن عبر USB",
        "حزام رأس قابل للتعديل ومريح",
        "مناسبة للتخييم والرحلات والصيد",
        "بطاريات مرفقة حسب توفر الباك",
        "عملية للأعمال الليلية"
      ],
      en: [
        "Powerful LED lighting",
        "USB rechargeable",
        "Comfortable adjustable head strap",
        "Ideal for camping, hiking and fishing",
        "Batteries included depending on pack availability",
        "Practical for night work"
      ]
    },
    category: "outdoor-tools",
    image: "/products/lampe-frontale-rechargeable/1.png",
    images: [
      "/products/lampe-frontale-rechargeable/1.png",
      "/products/lampe-frontale-rechargeable/2.png",
      "/products/lampe-frontale-rechargeable/3.png",
      "/products/lampe-frontale-rechargeable/4.png",
      "/products/lampe-frontale-rechargeable/5.png",
      "/products/lampe-frontale-rechargeable/6.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1540324155974-72413d906757?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1533630800539-7561f224b2aa?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "/products/lampe-frontale-rechargeable/2.png",
      "/products/lampe-frontale-rechargeable/3.png",
      "/products/lampe-frontale-rechargeable/4.png",
      "/products/lampe-frontale-rechargeable/5.png",
      "/products/lampe-frontale-rechargeable/6.png"
    ],
    rating: 4.8,
    reviewsCount: 42,
    inStock: true,
    stockStatus: "in_stock",
    bestSeller: true,
    newArrival: true
  },
  {
    id: "matelas-gonflable-camping",
    name: {
      fr: "Matelas gonflable camping avec oreiller",
      ar: "مرتبة تخييم قابلة للنفخ مع وسادة",
      en: "Inflatable Camping Sleeping Pad with Pillow"
    },
    price: 249,
    originalPrice: 300,
    description: {
      fr: "Matelas gonflable léger et confortable avec oreiller intégré, idéal pour le camping, les voyages, la randonnée et les nuits en plein air.",
      ar: "مرتبة تخييم خفيفة ومريحة قابلة للنفخ مع وسادة مدمجة، مناسبة للتخييم والسفر والرحلات والمبيت في الهواء الطلق.",
      en: "Lightweight and comfortable inflatable sleeping pad with integrated pillow, ideal for camping, travel, hiking and outdoor sleeping."
    },
    features: {
      fr: [
        "Matelas gonflable avec oreiller intégré",
        "Léger, compact et facile à transporter",
        "Surface alvéolée confortable",
        "Idéal pour camping, trekking et bivouac",
        "Livré avec housse de rangement",
        "Facile à gonfler et à dégonfler"
      ],
      ar: [
        "مرتبة قابلة للنفخ مع وسادة مدمجة",
        "خفيفة وسهلة الحمل",
        "سطح مريح بتصميم سداسي",
        "مناسبة للتخييم والرحلات والمبيت",
        "مرفقة بكيس للتخزين",
        "سهلة النفخ والتفريغ"
      ],
      en: [
        "Inflatable sleeping pad with integrated pillow",
        "Lightweight and easy to carry",
        "Comfortable honeycomb surface",
        "Ideal for camping, trekking and bivouac",
        "Comes with storage bag",
        "Easy to inflate and deflate"
      ]
    },
    category: "sacs_de_couchage",
    image: "/products/matelas-gonflable-camping/1.png",
    images: [
      "/products/matelas-gonflable-camping/1.png",
      "/products/matelas-gonflable-camping/2.png",
      "/products/matelas-gonflable-camping/3.png",
      "/products/matelas-gonflable-camping/4.png",
      "/products/matelas-gonflable-camping/5.png",
      "/products/matelas-gonflable-camping/6.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "/products/matelas-gonflable-camping/2.png",
      "/products/matelas-gonflable-camping/3.png",
      "/products/matelas-gonflable-camping/4.png",
      "/products/matelas-gonflable-camping/5.png",
      "/products/matelas-gonflable-camping/6.png"
    ],
    rating: 4.8,
    reviewsCount: 29,
    inStock: true,
    stockStatus: "in_stock",
    bestSeller: true,
    newArrival: true
  },
  {
    id: "allume-feu-mag",
    name: {
      fr: "Allume-Feu de Survie Magnésium XXL",
      ar: "مفتاح إشعال النار التكتيكي مغنسيوم الحجم الكبير",
      en: "XXL Outdoor Survival Magnesium Fire Starter"
    },
    price: 65,
    originalPrice: 99,
    description: {
      fr: "Idéal pour allumer votre réchaud ou feu de camp en toutes conditions de vent, d'altitude, de pluie ou de froid.",
      ar: "مثالي لإشعال مواقد الغاز أو نار التخييم تحت كافة ظروف الرياح، الارتفاع، المطر أو حتى البرد القارس.",
      en: "Reliably strike high temperature sparks in any wind, altitude, rain or extreme chill."
    },
    features: {
      fr: ["Génère des étincelles à 3000°C", "Plus de 15 000 coups d'utilisation garantie", "Comprend sifflet de survie et micro-règle", "Cordelette paracorde tressée"],
      ar: ["يولد شرارات بدرجة حرارة 3000 مئوية", "مضمون للاستخدام لأكثر من 15,000 ضربة", "يحتوي صافرة طوارئ ومسطرة مصغرة", "حبل عسكري باراكورد مضفر"],
      en: ["Generates sparks exceeding 3000°C", "Over 15,000 strikes guaranteed durability", "Includes a loud emergency whistle and micro rule", "Paracord lanyard loop"]
    },
    category: "accessoires",
    image: "/products/allume-feu-mag/1.png",
    images: [
      "/products/allume-feu-mag/1.png",
      "/products/allume-feu-mag/2.png",
      "/products/allume-feu-mag/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.9,
    reviewsCount: 54,
    inStock: true,
    bestSeller: true
  },
  {
    id: "pack-bivouac-essentiel",
    name: {
      fr: "Pack Bivouac Essentiel (Tente + Sac + Réchaud)",
      ar: "حزمة المبيت الأساسية (خيمة + كيس نوم + موقد غاز)",
      en: "Essential Off-Grid Pack (Tent + sleeping bag + Gas Stove)"
    },
    price: 999,
    originalPrice: 1450,
    description: {
      fr: "Le pack tout-en-un idéal pour vous équiper complet à prix défiant toute concurrence. L'indispensable pour vos premières aventures au Maroc !",
      ar: "الباقة المتكاملة الكل في واحد المثالية للاستعداد للرحلات بسعر استثنائي لا يقارن بالأسواق. الخيار الفارق لمغامراتك الأولى بالمملكة !",
      en: "The full-stack perfect matching package to save on camping start gear. Absolutely necessary for beginners exploring Moroccan beauty."
    },
    features: {
      fr: ["1x Tente Dôme 3p", "1x Sac de Couchage Momie Confortable", "1x Réchaud Mini Piezo", "Livraison Express Offerte gratuite partout au Maroc"],
      ar: ["خيمة دوم تسع 3 أشخاص", "كيس نوم نومي فاخر عازل", "موقد غاز ميني بيزو صغير ومتين", "توصيل سريع مجاني بالكامل لكافة المدن بالمغرب"],
      en: ["1x 3-Person Waterproof Dome Tent", "1x Cozy Mummy Temperature Sleeping Bag", "1x Ultra-compact Piezo Ignitor Gas Stove", "Free Express Delivery Included anywhere in Morocco"]
    },
    category: "offres_packs",
    image: "/products/pack-bivouac-essentiel/1.png",
    images: [
      "/products/pack-bivouac-essentiel/1.png",
      "/products/pack-bivouac-essentiel/2.png",
      "/products/pack-bivouac-essentiel/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.9,
    reviewsCount: 68,
    inStock: true,
    stockStatus: 'limited',
    bestSeller: true
  },

  // ==================== 2. NEW ARRIVALS SECOND ====================
  {
    id: "tente-popup-2p",
    name: {
      fr: "Tente Pop-Up Instantanée 2 places",
      ar: "خيمة منبثقة فورية لشخصين",
      en: "Instant 2-Person Pop-Up Tent"
    },
    price: 380,
    originalPrice: 480,
    description: {
      fr: "Installez votre campement en 2 secondes chrono avec cette tente pop-up ultra-pratique. Résistante au vent et idéale pour les bivouacs d'été.",
      ar: "جهز معسكرك في ثانيتين فقط مع هذه الخيمة المنبثقة العملية لغاية. مقاومة للرياح ومثالية للمخيمات الصيفية.",
      en: "Set up your camp in just 2 seconds with this highly convenient pop-up tent. Wind-resistant and perfect for summer bivouacs."
    },
    features: {
      fr: ["Montage instantané 2 secondes", "Protection UV UPF 30+", "Moustiquaire intégrée intégrale", "Légère : seulement 2.4 kg"],
      ar: ["تركيب fouri في ثانيتين", "حماية من الأشعة فوق البنفسجية UPF 30+", "شبكة مدمجة للحماية من البعوض", "خفيفة الوزن: 2.4 كجم فقط"],
      en: ["Instant 2-second setup", "UPF 30+ UV protection", "Integrated insect mesh window", "Lightweight: only 2.4 kg"]
    },
    category: "tentes",
    image: "/products/tente-popup-2p/1.png",
    images: [
      "/products/tente-popup-2p/1.png",
      "/products/tente-popup-2p/2.png",
      "/products/tente-popup-2p/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1537225228614-56cf355be37c?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1537225228614-56cf355be37c?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 29,
    inStock: true,
    newArrival: true
  },
  {
    id: "pack-canne-peche-moulinet",
    name: {
      fr: "Canne à Pêche Télescopique + Moulinet",
      ar: "صنارة صيد تلسكوبية + بكرة دوارة مدمجة",
      en: "Telescopic Fishing Rod + Spinning Reel Kit"
    },
    price: 320,
    originalPrice: 450,
    description: {
      fr: "Canne télescopique légère fabriquée en fibre de carbone ultra-résistante avec moulinet fluide pré-rempli.",
      ar: "عصا تلسكوبية خفيفة الوزن مصنوعة من ألياف الكربون فائقة القوة مع بكرة ممتازة مجهزة بالخيط.",
      en: "Lightweight flexible telescopic rod engineered from carbon fiber and containing pre-spooled matching high-gear reel."
    },
    features: {
      fr: ["Taille compacte pliée de seulement 45cm", "Anneaux de guidage céramiques anti-friction", "Moulinet réversible gauche/droite", "Fil de pêche robuste inclus"],
      ar: ["حجم مدمج مطوي يبلغ 45 سم فقط", "حلقات توجيه سيراميك لتقليل الاحتكاك", "بكرة قابلة لتعديل يمين أو يسار", "خيط صيد قوي محمل مسبقاً"],
      en: ["Collapsed length only 45cm for ultra-portability", "Frictionless ceramic guides", "Left/right interchangeable handle reel", "Tested lines ready to fish"]
    },
    category: "peche",
    image: "/products/pack-canne-peche-moulinet/1.png",
    images: [
      "/products/pack-canne-peche-moulinet/1.png",
      "/products/pack-canne-peche-moulinet/2.png",
      "/products/pack-canne-peche-moulinet/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.6,
    reviewsCount: 16,
    inStock: true,
    newArrival: true
  },

  // ==================== 3. PACKS ÉCONOMIQUES ====================
  // (Main pack-bivouac-essentiel is in Best Sellers to give top-of-catalog prominence)

  // ==================== 4. CAMPING CATEGORIES ====================
  {
    id: "hamac-bivouac-moustiquaire",
    name: {
      fr: "Hamac Suspendu Double avec Moustiquaire",
      ar: "أرجوحة شبكية معلقة مزدوجة بمظلة ناموسية",
      en: "Double Camping Hammock with Mosquito Net"
    },
    price: 260,
    originalPrice: 350,
    description: {
      fr: "Dormez à la belle étoile protégés des insectes. Fabriqué en nylon de parachute ultra-solide, avec sangles de fixation rapides incluses.",
      ar: "نّم تحت النجوم محميًا تمامًا من الحشرات. مصنوع من نايلون المظلات القوي للغاية مع أحزمة وخطافات سريعة.",
      en: "Sleep under the stars securely protected from insects. Crafted from parachute grade heavy duty nylon with straps included."
    },
    features: {
      fr: ["Capacité maximale de charge : 250 kg", "Moustiquaire fine à fermeture éclair zip", "Tissu nylon respirant à séchage rapide", "Mousquetons en acier inoxydable inclus"],
      ar: ["حمولة قصوى: 250 كجم", "شبكة حشرات دقيقة بسحاب إغلاق", "نسيج نايلون يسمح بمرور الهواء وسريع الجفاف", "خطافات مقاومة للصدأ متضمنة"],
      en: ["Max weight load standard: 250 kg", "Micro mesh zippered insect shield", "Breathable quick-drying nylon material", "Stainless steel carabiners included"]
    },
    category: "camping",
    image: "/products/hamac-bivouac-moustiquaire/1.png",
    images: [
      "/products/hamac-bivouac-moustiquaire/1.png",
      "/products/hamac-bivouac-moustiquaire/2.png",
      "/products/hamac-bivouac-moustiquaire/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1576014131795-d440191a8e8b?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.5,
    reviewsCount: 15,
    inStock: true
  },
  {
    id: "chaise-pliant-ultra-back",
    name: {
      fr: "Chaise de Camping Pliante Ultra-Légère",
      ar: "كرسي تخييم قابل للطي ومريح للغاية",
      en: "Ultra-Light Folding Camping Chair"
    },
    price: 199,
    originalPrice: 280,
    description: {
      fr: "Confort supérieur avec son dossier haut incliné. Se plie de manière extrêmement compacte pour s'adapter à vos randonnées à pied ou à moto.",
      ar: "راحة فائقة بفضل مسند الظهر المرتفع والمنحني. يطوى بتصميم مدمج ليناسب حقائب الظهر أو ركوب الدراجات.",
      en: "Excellent body relaxation with contoured high support back. Collapses beautifully small to pack for hiking or biking trips."
    },
    features: {
      fr: ["Structure robuste en alliage d'aluminium aviation", "Tissu respirant avec empiècements en maille", "Porte-gobelet latéral intégré", "Poids supporté : jusqu'à 130 kg"],
      ar: ["هيكل متين من ألمنيوم الطيران المتطور", "نسيج ممتاز متداخل التهوية", "مكان لحمل الأكواب جانبي", "تتحمل وزن يصل إلى 130 كجم"],
      en: ["Heavy duty aviation-grade aluminum frame", "Breathable mesh panels ventilation", "Integrated side drink mesh pouch", "Comfortably weights up to 130 kg"]
    },
    category: "tables_chaises",
    image: "/products/chaise-pliant-ultra-back/1.png",
    images: [
      "/products/chaise-pliant-ultra-back/1.png",
      "/products/chaise-pliant-ultra-back/2.png",
      "/products/chaise-pliant-ultra-back/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.7,
    reviewsCount: 25,
    inStock: true
  },

  // ==================== 5. TRAVEL ====================
  {
    id: "gourde-thermos-isotherme",
    name: {
      fr: "Gourde Isotherme Acier Inox double paroi",
      ar: "قارورة مياه حافظة للحرارة ستانلس ستيل مزدوجة",
      en: "Double-Wall Stainless Steel Insulated Thermos"
    },
    price: 130,
    originalPrice: 180,
    description: {
      fr: "Conserve vos boissons glacées ou votre café chaud pendant 24h lors du camping, de randonnées ou au bureau.",
      ar: "تحفظ مشروباتك مثلجة أو قهوتك ساخنة لمدة 24 ساعة للرحلات، التخييم، أو استهلاك المكتب اليومي.",
      en: "Keeps draft beverages ice-cold or piping hot for up to 24 hours while outdoors or working."
    },
    features: {
      fr: ["Acier inoxydable 18/8 alimentaire premium", "Isolation sous vide sans condensation thermique", "Sans BPA et étanche à 100%", "Bouchon sport ergonomique interchangeable"],
      ar: ["ستانلس ستيل غذائي ممتاز فئة 18/8", "عزل تام يمنع رطوبة الزجاجة الخارجية", "خالية من المركبات الضارة ومحكمة الإغلاق", "غطاء رياضي مريح قابل للاستبدال"],
      en: ["18/8 food-grade premium stainless steel", "Vacuum insulation prevents condensation on shell", "100% leakproof and BPA-free", "Universal accessory cap included"]
    },
    category: "maison",
    image: "/products/gourde-thermos-isotherme/1.png",
    images: [
      "/products/gourde-thermos-isotherme/1.png",
      "/products/gourde-thermos-isotherme/2.png",
      "/products/gourde-thermos-isotherme/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.8,
    reviewsCount: 38,
    inStock: true
  },

  // ==================== 6. OUTDOOR TOOLS ====================
  {
    id: "jumelles-pro-hd",
    name: {
      fr: "Jumelles Professionnelles Nature HD 10x42",
      ar: "منظار احترافي عالي الدقة للطبيعة 10x42",
      en: "Nature HD 10x42 Professional Binoculars"
    },
    price: 450,
    originalPrice: 650,
    description: {
      fr: "Idéales pour observer l'Atlas, les oiseaux et la faune sauvage avec une clarté et un grossissement et contraste époustouflant.",
      ar: "ممتازة لمراقبة جبال الأطلس، والطيور والحياة البرية بوضوح مذهل ومستوى تبئير ممتاز.",
      en: "Perfect for scanning the Atlas, birdwatching and wildlife viewing with brilliant detail and deep contrast."
    },
    features: {
      fr: ["Grossissement puissant 10x avec objectif 42mm", "Prismes BAK4 multicouches haute luminosité", "Étanche à l'eau et anti-buée", "Sangle & sacoche de transport de luxe"],
      ar: ["تكبير قوي 10 مرات مع عدسة 42 مم", "منشورات BAK4 لتمرير الضوء بوضوح", "مقاوم كلي للمياه والضباب الداخلي", "حزام مريح وحقيبة حماية متميزة"],
      en: ["Powerful 10x magnification with 42mm lenses", "Multi-coated BAK4 prisms for brighter optics", "Waterproof and fog-proof gas filled body", "Premium neck strap and travel case included"]
    },
    category: "chasse",
    image: "/products/jumelles-pro-hd/1.png",
    images: [
      "/products/jumelles-pro-hd/1.png",
      "/products/jumelles-pro-hd/2.png",
      "/products/jumelles-pro-hd/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1590760432174-8b01083ccae4?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.9,
    reviewsCount: 14,
    inStock: true
  },
  {
    id: "batons-trekking-carbon",
    name: {
      fr: "Bâtons de Randonnée Télescopiques Carbone",
      ar: "عصي مشي للمسافات الطويلة قابلة للسحب كربون",
      en: "Carbon Fiber Telescopic Hiking Poles"
    },
    price: 240,
    originalPrice: 320,
    description: {
      fr: "Légers et robustes, ils répartissent la charge et préservent vos genoux en descente et montée.",
      ar: "خفيفة وقوية الوزن، تعيد توزيع الأحمال وتضمن سلامة الركبتين والمفاصل صعوداً وهبوطاً.",
      en: "Ultra-weightless carbon fiber sticks helping relieve joint fatigue during steep hikes."
    },
    features: {
      fr: ["Système de verrouillage rapide Fast-Lock", "Poignée ergonomique en liège anti-sueur", "Embouts interchangeables : asphalte, terre, neige", "Longueur ajustable de 65cm à 135cm"],
      ar: ["نظام قفل ميكانيكي سريع وسهل", "مقبض فلين مريح مانع لتعرق اليد", "رؤوس بديلة كاملة: للثلج، التراب، الأسفلت", "طول يتعدل من 65 سم إلى 135 سم"],
      en: ["Anti-slipping easy Fast-Lock system", "Sweat-wicking authentic grip cork handle", "Includes exchangeable tips: snow, trail, hard ground", "Adjustable length: 65cm to 135cm"]
    },
    category: "sport_loisirs",
    image: "/products/batons-trekking-carbon/1.png",
    images: [
      "/products/batons-trekking-carbon/1.png",
      "/products/batons-trekking-carbon/2.png",
      "/products/batons-trekking-carbon/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.7,
    reviewsCount: 20,
    inStock: true
  },

  // ==================== 7. ACCESSORIES ====================
  {
    id: "casquette-tactique-cam",
    name: {
      fr: "Casquette Tactique Camouflage Militaire",
      ar: "قبعة تكتيكية عسكرية مموهة",
      en: "Tactical Military Camouflage Cap"
    },
    price: 110,
    originalPrice: 150,
    description: {
      fr: "Casquette résistante et aérée idéale pour la chasse, la randonnée ou l'aventure dans le désert.",
      ar: "قبعة متينة ومقاومة للتمزق ومثالية للصيد، والمشي لمasfates طويلة أو المغامرات في الصحراء.",
      en: "Tear-resistant ventilated cap perfect for hunting, trekking or desert tours."
    },
    features: {
      fr: ["Tissu Ripstop anti-déchirure", "Emplacements velcro pour badges", "Sangle ajustable à l'arrière"],
      ar: ["قماش ريبستوب مقاوم للتمزق", "مواقع فيلكرو للشعارات", "حزام خلفي قابل للتعديل"],
      en: ["Anti-tear Ripstop textile", "Velcro panels for patches", "Adjustable strap closure"]
    },
    category: "casquettes",
    image: "/products/casquette-tactique-cam/1.png",
    images: [
      "/products/casquette-tactique-cam/1.png",
      "/products/casquette-tactique-cam/2.png",
      "/products/casquette-tactique-cam/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600"
    ],
    additionalImages: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600"
    ],
    rating: 4.6,
    reviewsCount: 22,
    inStock: true,
    sizes: ["Taille Unique (Ajustable)"],
    colors: ["Camouflage Désert", "Vert Olive", "Noir Noir"]
  },
  {
    id: "trousse-secours-voyage",
    name: {
      fr: "Trousse de Secours Compacte de Survie",
      ar: "حقيبة إسعافات أولية لرحلات التخييم",
      en: "Compact Tactical First Aid Travel Kit"
    },
    price: 89,
    originalPrice: 120,
    description: {
      fr: "Trousse médicale zippée contenant les essentiels d'urgence indispensables lors des activités de plein air.",
      ar: "حقيبة طبية بسحاب تحتوي على الضروريات الطبية المطلوبة لضمان سلامتك عند السفر والتنزه.",
      en: "Water-resistant zipper container loaded with the core emergency medical tools you need in the woods."
    },
    features: {
      fr: ["Contenu 45 pièces (pansements, compresses, ciseaux...)", "Résistant à l'eau de pluie légère", "Passant ceinture pratique à l'arrière"],
      ar: ["تضم 45 قطعة طبية (ضمادات، كمادات، مقص، ملقط...)", "مقاومة لرش المياه الطفيفة والرطوبة", "حلقة ذكية لتعليق بالحقيبة أو الحزام"],
      en: ["Contains 45 medical utility pieces", "Water-resistant canvas nylon bag", "A belt loop and D-ring attachments"]
    },
    category: "moins_99",
    image: "/products/trousse-secours-voyage/1.png",
    images: [
      "/products/trousse-secours-voyage/1.png",
      "/products/trousse-secours-voyage/2.png",
      "/products/trousse-secours-voyage/3.png"
    ],
    fallbackImage: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=600",
    fallbackImages: [],
    additionalImages: [],
    rating: 4.7,
    reviewsCount: 46,
    inStock: false,
    stockStatus: 'out_of_stock'
  }
];

export const DISPLAY_PHONE = "0649264408";
export const WHATSAPP_NUMBER = "212649264408";
export const WHATSAPP_LINK = "https://wa.me/212649264408";

export const ORDER_SUPPORT_NUMBER = DISPLAY_PHONE;
export const WA_LINK = WHATSAPP_LINK;

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", 
  "Kénitra", "Tétouan", "Safi", "Temara", "Inezgane", "Laâyoune", "Nador", "Khouribga", 
  "Béni Mellal", "El Jadida", "Mohammédia", "Taza", "Khemisset", "Ouarzazate", "Taroudant", 
  "Chefchaouen", "Dakhla", "Essaouira", "Errachidia", "Ifrane", "Al Hoceima"
];
