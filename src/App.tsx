import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { MessageSquare, Phone, ArrowUp, ShoppingBag, ShieldCheck, Check, ShoppingCart, Home, LayoutGrid, MapPin, Truck, RefreshCw, HelpCircle, FileText, Lock, Star, Flame, Compass, BadgeCheck } from 'lucide-react';
import { Language, CartItem, CheckoutForm, Order, Product } from './types';
import { PRODUCTS, CATEGORIES, ORDER_SUPPORT_NUMBER, WA_LINK, DISPLAY_PHONE, WHATSAPP_NUMBER, WHATSAPP_LINK } from './data';
import { TRANSLATIONS } from './translations';

// Subcomponents
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
import TrustBadges from './components/TrustBadges';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';
import DeliveryBanner from './components/DeliveryBanner';
import PremiumSupportWidget from './components/PremiumSupportWidget';
import WhatsAppIcon from './components/WhatsAppIcon';

// Lazy loaded modal components for performance optimization
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LegalPagesModal = lazy(() => import('./components/LegalPagesModal'));
const ExitIntentModal = lazy(() => import('./components/ExitIntentModal'));
const OrderTrackingModal = lazy(() => import('./components/OrderTrackingModal'));

// Marketing tracking and pixels
import { 
  initAnalytics, 
  triggerPageView, 
  triggerViewContent, 
  triggerAddToCart, 
  triggerPurchase, 
  triggerWhatsAppClick 
} from './utils/analytics';
import { saveOrderToBackend } from './utils/orderApi';

// Conversion optimization sections
import BestSellersSection from './components/BestSellersSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import PromoOffersSection from './components/PromoOffersSection';
import PromoCampSection from './components/PromoCampSection';
import EconomicPacksSection from './components/EconomicPacksSection';
import Under99Section from './components/Under99Section';
import FreeDeliverySection from './components/FreeDeliverySection';
import WhyChooseGlobabox from './components/WhyChooseGlobabox';
import CustomerReviews from './components/CustomerReviews';
import FAQSection from './components/FAQSection';
import FinalWhatsAppCTA from './components/FinalWhatsAppCTA';
import FloatingPersuasionWidget from './components/FloatingPersuasionWidget';
import ProductFilters from './components/ProductFilters';

// Helper to normalize text: lowercase, remove accents, and normalize Arabic
function normalizeText(str: string): string {
  if (!str) return '';
  // 1. Convert to lower case and decompose Unicode accents
  let normalized = String(str).toLowerCase().normalize('NFD');
  // 2. Remove combining diacritical marks
  normalized = normalized.replace(/[\u0300-\u036f]/g, '');
  // 3. Normalize Arabic characters
  normalized = normalized
    .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics
    .replace(/[أإآٱ]/g, 'ا')        // Normalize Alifs to bare Alif
    .replace(/ة/g, 'ه')            // Normalize Teh Marbuta to Heh
    .replace(/[ىي]/g, 'ي');         // Normalize Alef Maksura to Yeh
  
  return normalized;
}

// Helper to generate singular forms of French words to support simple plurals
function getSingularForms(word: string): string[] {
  const forms = [word];
  if (word.length > 3) {
    if (word.endsWith('s')) {
      forms.push(word.slice(0, -1));
    } else if (word.endsWith('x')) {
      forms.push(word.slice(0, -1));
      if (word.endsWith('aux')) {
        forms.push(word.slice(0, -3) + 'al');
      }
    }
  }
  return forms;
}

// Extract all multilingual fields into a unified searchable text block
function getSearchableText(product: any, categories: any[] = []): string {
  const texts: string[] = [];

  // 1. Product ID
  if (product.id) texts.push(String(product.id));

  // 2. Category
  if (product.category) {
    texts.push(String(product.category));
    // Multilingual category lookup
    if (Array.isArray(categories)) {
      const catObj = categories.find((c: any) => c && c.id === product.category);
      if (catObj) {
        if (catObj.name) {
          if (typeof catObj.name === 'object') {
            if (catObj.name.fr) texts.push(String(catObj.name.fr));
            if (catObj.name.ar) texts.push(String(catObj.name.ar));
            if (catObj.name.en) texts.push(String(catObj.name.en));
          } else {
            texts.push(String(catObj.name));
          }
        }
      }
    }
  }

  // 3. Name (nested name object & flat properties)
  if (product.name) {
    if (typeof product.name === 'object') {
      if (product.name.fr) texts.push(String(product.name.fr));
      if (product.name.ar) texts.push(String(product.name.ar));
      if (product.name.en) texts.push(String(product.name.en));
    } else {
      texts.push(String(product.name));
    }
  }
  if (product.name_fr) texts.push(String(product.name_fr));
  if (product.name_ar) texts.push(String(product.name_ar));
  if (product.name_en) texts.push(String(product.name_en));

  // 4. Title
  if (product.title) texts.push(String(product.title));

  // 5. Description (nested description object & flat properties)
  if (product.description) {
    if (typeof product.description === 'object') {
      if (product.description.fr) texts.push(String(product.description.fr));
      if (product.description.ar) texts.push(String(product.description.ar));
      if (product.description.en) texts.push(String(product.description.en));
    } else {
      texts.push(String(product.description));
    }
  }
  if (product.description_fr) texts.push(String(product.description_fr));
  if (product.description_ar) texts.push(String(product.description_ar));
  if (product.description_en) texts.push(String(product.description_en));

  // 6. Features (nested features object, arrays & flat properties)
  if (product.features) {
    if (typeof product.features === 'object' && !Array.isArray(product.features)) {
      if (product.features.fr) {
        if (Array.isArray(product.features.fr)) {
          texts.push(...product.features.fr.map(String));
        } else {
          texts.push(String(product.features.fr));
        }
      }
      if (product.features.ar) {
        if (Array.isArray(product.features.ar)) {
          texts.push(...product.features.ar.map(String));
        } else {
          texts.push(String(product.features.ar));
        }
      }
      if (product.features.en) {
        if (Array.isArray(product.features.en)) {
          texts.push(...product.features.en.map(String));
        } else {
          texts.push(String(product.features.en));
        }
      }
    } else if (Array.isArray(product.features)) {
      texts.push(...product.features.map(String));
    } else {
      texts.push(String(product.features));
    }
  }

  if (product.features_fr) {
    if (Array.isArray(product.features_fr)) {
      texts.push(...product.features_fr.map(String));
    } else {
      texts.push(String(product.features_fr));
    }
  }
  if (product.features_ar) {
    if (Array.isArray(product.features_ar)) {
      texts.push(...product.features_ar.map(String));
    } else {
      texts.push(String(product.features_ar));
    }
  }
  if (product.features_en) {
    if (Array.isArray(product.features_en)) {
      texts.push(...product.features_en.map(String));
    } else {
      texts.push(String(product.features_en));
    }
  }

  return texts.join(' ');
}

export default function App() {
  // Main states
  const [language, setLanguage] = useState<Language>('fr');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bestsellers' | 'newarrivals'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'price_low_high' | 'price_high_low'>('newest');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Persistent data states
  const [products, setProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('globabox_products_v1');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [categories, setCategories] = useState<any[]>(() => {
    const saved = localStorage.getItem('globabox_categories_v1');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('globabox_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersApiConfigured, setIsOrdersApiConfigured] = useState<boolean>(false);

  // Cart & checkout states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Success screen state
  const [orderSuccessData, setOrderSuccessData] = useState<{
    reference: string;
    form: CheckoutForm;
    items: CartItem[];
    total: number;
    subtotal?: number;
    shippingCost?: number;
    freeShipping?: boolean;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('globabox_last_success_order');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading from sessionStorage:', e);
    }
    return null;
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(() => {
    try {
      return !!sessionStorage.getItem('globabox_last_success_order');
    } catch (e) {
      return false;
    }
  });

  // Legal modal states
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalActiveTab, setLegalActiveTab] = useState('about');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // UI Utilities
  const [showScrollTop, setShowScrollTop] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize marketing tracking pixel containers (Facebook, TikTok, GA4, Search Console) on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views when core SPA state coordinates route views dynamically
  useEffect(() => {
    let virtualPage = '/';
    if (isAdminOpen) {
      virtualPage = '/admin';
    } else if (selectedProduct) {
      virtualPage = `/products/${selectedProduct.id}`;
    } else if (selectedCategory) {
      virtualPage = `/categories/${selectedCategory}`;
    } else if (searchTerm) {
      virtualPage = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
    triggerPageView(virtualPage);
  }, [isAdminOpen, selectedProduct?.id, selectedCategory, searchTerm]);

  // Track product views (ViewContent)
  useEffect(() => {
    if (selectedProduct) {
      triggerViewContent({
        id: selectedProduct.id,
        name: selectedProduct.name[language] || selectedProduct.name['fr'],
        price: selectedProduct.price,
        category: selectedProduct.category
      });
    }
  }, [selectedProduct?.id]);

  // Parse initial clean URL search queries for category or product sharing on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialProduct = searchParams.get('product');
    const initialCategory = searchParams.get('category');
    if (searchParams.get('admin') === 'true') {
      setIsAdminOpen(true);
    }

    if (initialProduct) {
      const found = products.find(p => p.id === initialProduct);
      if (found) {
        setSelectedProduct(found);
      }
    } else if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [products]);

  // Load orders list from our Express backend as the source of truth for permanent storage
  useEffect(() => {
    // Fetch orders from backend
    fetch('/api/orders')
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve orders from server');
        return res.json();
      })
      .then(serverOrders => {
        if (Array.isArray(serverOrders)) {
          setOrders(serverOrders);
          localStorage.setItem('globabox_orders', JSON.stringify(serverOrders));
        }
      })
      .catch(err => {
        console.warn('[GLOBABOX BACKEND] Could not load orders from server, using local cache:', err);
      });

    // Fetch config status
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Config route not OK');
        return res.json();
      })
      .then(config => {
        setIsOrdersApiConfigured(!!config.isConfigured);
      })
      .catch(err => {
        console.warn('[GLOBABOX CONFIG] Failed to load server config info:', err);
      });
  }, []);

  // Load products from the server-side API (Google Sheets managed with local fallbacks)
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('API returned error');
        return res.json();
      })
      .then(fetchedProducts => {
        if (Array.isArray(fetchedProducts)) {
          // The server catalogue is authoritative, including an intentional empty list.
          // Do not revive obsolete products from browser localStorage.
          setProducts(fetchedProducts);
          localStorage.removeItem('globabox_products_v1');
        }
      })
      .catch(err => {
        console.warn('[GLOBABOX CATALOG SYNC] Could not load products from API, staying with initial client fallback:', err);
      });
  }, []);

  // Update dynamic clean URL route params without full page reload
  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (selectedProduct) {
      searchParams.set('product', selectedProduct.id);
    } else if (selectedCategory) {
      searchParams.set('category', selectedCategory);
    }
    
    const query = searchParams.toString();
    const newRelativePathQuery = window.location.pathname + (query ? `?${query}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [selectedProduct, selectedCategory]);

  // Log search input changes
  useEffect(() => {
    console.log(`[SEARCH INPUT] value changed: "${searchTerm}"`);
  }, [searchTerm]);

  // Handle SEO metadata (Dynamic Titles and Custom Meta descriptions per category/product)
  useEffect(() => {
    const categoryMetaDescriptions: Record<string, Record<Language, string>> = {
      camping: {
        fr: "Equipements de camping Globabox Maroc. Tentes, sacs d'expédition et matériel de bivouac professionnel au Maroc. Commandez maintenant avec paiement à la livraison.",
        ar: "مستلزمات التخييم من جلوبابوكس المغرب. خيام، حقائب نوم ومعدات كشتات احترافية بالمغرب مع خدمة الدفع عند الاستلام.",
        en: "Outdoor camping gear by Globabox Morocco. Best quality tents, sleeping bags, and survival backpacks in Morocco. Order with Cash on Delivery."
      },
      tentes: {
        fr: "Tentes imperméables haut de gamme chez Globabox Maroc. Idéal pour le camping de groupe, la randonnée en dôme et les bivouacs extrêmes.",
        ar: "أفضل خامات الخيام المقاومة للمطر والرياح بالمغرب من جلوبابوكس. مخصصة للتخييم العائلي والرحلات الطويلة.",
        en: "Premium waterproof tents at Globabox Morocco. Perfect for group camping, dome treks, and extreme night bivouacs."
      },
      sacs_de_couchage: {
        fr: "Sacs de couchage et matelas de bivouac pour des nuits au chaud de -5°C à 15°C. Produits de confiance chez Globabox Maroc.",
        ar: "أكياس نوم دافئة ومقاومة للبرد القارس من جلوبابوكس المغرب. استمتع بنوم مريح في الهواء الطلق.",
        en: "Keep warm with sleeping bags and camping mats, rated for -5°C to 15°C from Globabox Morocco."
      },
      casquettes: {
        fr: "Sélection de casquettes robustes anti-UV de style tactique ou décontracté chez Globabox Maroc. Livraison express.",
        ar: "تشكيلة قبعات متينة واقية من الشمس وأنيقة من جلوبابوكس المغرب. شحن وتوصيل سريع وعاجل.",
        en: "Shop high durability anti-UV sun caps and tactical headwear at Globabox Morocco."
      },
      chaussures: {
        fr: "Chaussures de randonnée antidérapantes, étanches et robustes pour tous vos treks. Par Globabox Maroc.",
        ar: "أحذية تسلق ومشي جبلية مانعة للانزلاق ومقاومة للماء من جلوبابوكس المغرب.",
        en: "Waterproof, slip-resistant trail hiking shoes for secure grip. Curated by Globabox Morocco."
      },
      rechauds: {
        fr: "Réchauds à gaz compacts, vaisselle de camping et ustensiles de cuisine d'extérieur chez Globabox.",
        ar: "مواقد غاز محمولة وأواني طبخ ذكية للتخييم والرحلات من جلوبابوكس المغرب.",
        en: "Compact camping stoves, portable gas cookers, and thermal outdoor cookware by Globabox."
      },
      tables_chaises: {
        fr: "Tables pliantes et chaises de camping ultra-légères en aluminium. Robustesse garantie chez Globabox Maroc.",
        ar: "طاولات قابلة للطي وكراسي تخييم خفيفة ومريحة من الألمنيوم من جلوبابوكس.",
        en: "Heavy-duty aluminum folding tables and lightweight camping chairs by Globabox Morocco."
      },
      chasse: {
        fr: "Matériel professionnel de chasse et d'observation de la nature au Maroc chez Globabox. Jumelles, sacs de camouflage.",
        ar: "معدات صيد بري احترافية وأدوات مراقبة الطبيعة بالمغرب. مناظير وألبسة تمويه من جلوبابوكس.",
        en: "Professional hunting accessories, waterproof binoculars, and camouflage items by Globabox Morocco."
      },
      peche: {
        fr: "Equipement de pêche de précision au Maroc chez Globabox. Cannes, moulinets et appâts certifiés.",
        ar: "لوازم صيد سمك دقيقة وعالية الجود بالمغرب من جلوبابوكس. قصبات ومحركات صيد معتمدة.",
        en: "High precision fishing gear in Morocco by Globabox. Rods, reels, and premium lures."
      },
      accessoires: {
        fr: "Accessoires indispensables d'outdoor, lampes torches solaires et outils multifonctions par Globabox Maroc.",
        ar: "أكسسوارات رحلات يعتمد عليها، مصابيح طاقة شمسية ومعدات حتمية متنوعة من جلوبابوكس.",
        en: "Essential multipurpose survival tools, compasses, and solar LED torches from Globabox Morocco."
      },
      maison: {
        fr: "Ameublement et luminaires d'extérieur pour équiper votre jardin ou votre terrasse au Maroc, par Globabox.",
        ar: "أثاث خارجي مريح وإضاءات مميزة للحديقة والشرفات بالمغرب من جلوبابوكس.",
        en: "Comfortable outdoor furniture, hammocks, and decor lights for your house terrace by Globabox."
      },
      sport_loisirs: {
        fr: "Equipement sportif, fitness d'extérieur et loisirs de plein air de qualité supérieure chez Globabox Maroc.",
        ar: "أجهزة رياضية وترفيهية وأدوات كشتة للأنشطة البدنية المفتوحة بالمغرب من جلوبابوكس.",
        en: "Premium active outdoor fitness sports gear and health leisure accessories by Globabox Morocco."
      }
    };

    let titleText = language === "ar" 
      ? "جلوبابوكس | متجر مستلزمات التخييم، الكشتات والأنشطة الخارجية بالمغرب" 
      : "Globabox | Boutique Matériel Camping, Bivouac & Outdoor Maroc";
    
    let metaDesc = language === "ar"
      ? "جلوبابوكس هي الماركة المفضلة لمعدات المغامرات والتخييم، الصيد والرحلات بالمغرب. توصيل مجاني ودفع كاش آمن عند الاستلام."
      : "Globabox est la marque d'équipement d'extérieur préférée au Maroc pour le camping, la randonnée, la pêche et la chasse. Livraison gratuite et paiement de confiance à la livraison.";

    if (selectedProduct) {
      if (selectedProduct.id === "tente-dome-camping-2-3-personnes") {
        titleText = "Tente Dôme Camping 2-3 Personnes | Globabox Maroc";
        metaDesc = "Commandez la tente dôme camping 2-3 personnes chez Globabox Maroc. Montage rapide, design pratique, idéale pour camping, pêche et voyage. Prix 400 DH au lieu de 499 DH avec paiement à la livraison.";
      } else {
        const prodName = selectedProduct.name[language] || selectedProduct.name['fr'];
        titleText = `${prodName} | ${language === "ar" ? "جلوبابوكس المغرب" : "Globabox Maroc"}`;
        
        const prodDesc = selectedProduct.description[language] || selectedProduct.description['fr'];
        metaDesc = language === "ar"
          ? `${prodDesc.substring(0, 150)}... اطلب الآن على جلوبابوكس مع الدفع الآمن عند الاستلام وتأكيد فوري لطلبيتك.`
          : `${prodDesc.substring(0, 150)}... Commandez sur Globabox avec paiement à la livraison sécurisé et confirmation instantanée.`;
      }
    } else if (selectedCategory) {
      const categoryTranslations: Record<string, string> = {
        camping: language === "ar" ? "التخييم وباقاته" : language === "en" ? "Camping Essentials" : "Matériel de Camping",
        tentes: language === "ar" ? "الخيام المبرومة" : language === "en" ? "Professional Tents" : "Tentes & Abris",
        sacs_de_couchage: language === "ar" ? "أكياس نوم السفر" : language === "en" ? "Thermal Sleeping Bags" : "Sacs de Couchage",
        casquettes: language === "ar" ? "قبعات رياضية" : language === "en" ? "Outdoor Headwear" : "Casquettes & Chapeaux",
        chaussures: language === "ar" ? "أحذية الرحلات" : language === "en" ? "Trekking Shoes" : "Chaussures Outdoors",
        rechauds: language === "ar" ? "مواقد غاز السفر" : language === "en" ? "Camping Stoves" : "Réchauds & Cuisine d'extérieur",
        tables_chaises: language === "ar" ? "طاولات سفر مريحة" : language === "en" ? "Folding Furniture" : "Tables & Chaises de bivouac",
        chasse: language === "ar" ? "لوازم صيد بري" : language === "en" ? "Tactical Hunting" : "Chasse & Observation",
        peche: language === "ar" ? "لوازم صيد بحري" : language === "en" ? "Fishing Tackle" : "Equipement de Pêche",
        accessoires: language === "ar" ? "أكسسوارات الكشتة" : language === "en" ? "Survival Accessories" : "Accessoires de Survie",
        maison: language === "ar" ? "المستلزمات المنزلية" : language === "en" ? "Home Terrace Outdoor" : "Maison & Jardin",
        sport_loisirs: language === "ar" ? "الرياضات المتنوعة" : language === "en" ? "Active Leisure" : "Sport & Loisirs"
      };
      
      const catFriendlyName = categoryTranslations[selectedCategory] || selectedCategory;
      titleText = `${catFriendlyName} | ${language === "ar" ? "جلوبابوكس المغرب" : "Globabox Maroc"}`;
      
      const catMeta = categoryMetaDescriptions[selectedCategory];
      if (catMeta && catMeta[language]) {
        metaDesc = catMeta[language];
      }
    }

    // Set page title
    document.title = titleText;

    // Set page meta description
    let metaDescriptionEl = document.head.querySelector('meta[name="description"]');
    if (!metaDescriptionEl) {
      metaDescriptionEl = document.createElement('meta');
      metaDescriptionEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionEl);
    }
    metaDescriptionEl.setAttribute('content', metaDesc);
  }, [selectedProduct, selectedCategory, language]);

  const handleScrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    sessionStorage.removeItem('globabox_last_success_order');
    setOrderSuccessData(null);
  };

  const t = (key: string) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  const isRtl = language === "ar";

  // Cart actions
  const handleAddToCart = (product: any, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSize, selectedColor }];
    });
    
    // Trigger marketing and analytics pixel
    triggerAddToCart({
      id: product.id,
      name: product.name[language] || product.name['fr'],
      price: product.price,
      category: product.category
    }, quantity);

    // Trigger small notifier / or open drawer
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Instant Order Drawer Direct shortcut: Adds item to cart & instantly opens checkout drawer
  const handleInstantCheckout = (product: any, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    setCart((prev) => {
      // Clear or preserve other items? Let's preserve but ensure this item exists in the cart with requested quantity
      const otherItems = prev.filter((item) => !(item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor));
      return [...otherItems, { product, quantity, selectedSize, selectedColor }];
    });

    // Trigger marketing and analytics pixel
    triggerAddToCart({
      id: product.id,
      name: product.name[language] || product.name['fr'],
      price: product.price,
      category: product.category
    }, quantity);

    setIsCartOpen(true);
  };

  // Unified WhatsApp order and lead savior backend proxy
  const handleWhatsAppOrderSubmit = async ({
    items = [],
    form = {},
    customMessage = '',
    source = 'whatsapp'
  }: {
    items?: CartItem[];
    form?: Partial<CheckoutForm>;
    customMessage?: string;
    source?: string;
  } = {}) => {
    // Fallback if empty (generic lead)
    const activeItems: CartItem[] = items.length > 0 
      ? items 
      : [{ 
          product: (products[0] || PRODUCTS[0]) as Product, 
          quantity: 1 
        }];

    const finalForm: CheckoutForm = {
      fullName: form?.fullName?.trim() || "WhatsApp Customer",
      phoneNumber: form?.phoneNumber?.trim() || "",
      city: form?.city?.trim() || "",
      deliveryAddress: form?.deliveryAddress?.trim() || "",
      notes: form?.notes || ""
    };

    const subtotalVal = activeItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
    const shippingCostVal = subtotalVal >= 500 ? 0 : 35;
    const totalVal = subtotalVal + shippingCostVal;
    const isFree = subtotalVal >= 500;
    const deliveryStr = isFree ? 'Livraison gratuite' : `${shippingCostVal} DH`;

    // Generate WhatsApp pre-filled text
    let whatsappMessage = customMessage || "";
    if (!whatsappMessage) {
      const productBlocks = activeItems.map((it, idx) => {
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

      whatsappMessage = `Bonjour Globabox, je souhaite confirmer ma commande.

INFORMATIONS CLIENT:
Nom: ${finalForm.fullName}
Téléphone: ${finalForm.phoneNumber || 'Non spécifié'}
Ville: ${finalForm.city || 'Non spécifiée'}
Adresse: ${finalForm.deliveryAddress || 'Non spécifiée'}

PRODUITS COMMANDÉS:

${productBlocks}

LIVRAISON:
${deliveryStr}

RÉSUMÉ:
Sous-total: ${subtotalVal} DH
Livraison: ${deliveryStr}
Total à payer: ${totalVal} DH

PAIEMENT:
Paiement à la livraison

Merci de confirmer la disponibilité et la livraison.`;
    }

    // Create real Order object
    const newOrder: Order = {
      id: `ORD-WA-${Date.now()}`,
      reference: `GB-WA-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: finalForm.fullName,
      phoneNumber: finalForm.phoneNumber,
      city: finalForm.city,
      deliveryAddress: finalForm.deliveryAddress,
      notes: finalForm.notes || "",
      items: activeItems.map((it) => ({
        productName: it.product.name[language] || it.product.name['fr'],
        productId: it.product.id,
        price: it.product.price,
        quantity: it.quantity,
        image: it.product.image,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor
      })),
      total: totalVal,
      subtotal: subtotalVal,
      shippingCost: shippingCostVal,
      finalTotal: totalVal,
      freeShipping: isFree,
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      } as any),
      status: 'pending',
      paymentMethod: 'Cash on delivery',
      whatsappMessage: whatsappMessage,
      source: 'whatsapp',
      syncStatus: 'not-configured'
    };

    // Save locally
    const initialOrdersList = [newOrder, ...orders];
    setOrders(initialOrdersList);
    localStorage.setItem('globabox_orders', JSON.stringify(initialOrdersList));

    // Redirect to whatsapp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappLink = `https://api.whatsapp.com/send?phone=+${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');

    // Sync to backend sheets
    try {
      await saveOrderToBackend(newOrder);
    } catch (err) {
      console.warn("WhatsApp order sync failed:", err);
    }
  };

  const handleOrderSuccess = async (successData: any) => {
    console.log("[ORDER SUBMIT] form valid");

    // Generate pre-filled WhatsApp text blocks
    const subtotalVal = successData.subtotal !== undefined ? successData.subtotal : successData.total;
    const shippingCostVal = successData.shippingCost !== undefined ? successData.shippingCost : 0;
    const totalVal = successData.total;
    const isFree = successData.freeShipping !== undefined ? successData.freeShipping : true;

    const productBlocks = successData.items.map((it: any, idx: number) => {
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

    const deliveryStr = isFree ? 'Livraison gratuite' : `${shippingCostVal} DH`;

    const whatsappMessage = `Bonjour Globabox, je souhaite confirmer ma commande.

INFORMATIONS CLIENT:
Nom: ${successData.form.fullName}
Téléphone: ${successData.form.phoneNumber}
Ville: ${successData.form.city}
Adresse: ${successData.form.deliveryAddress}

PRODUITS COMMANDÉS:

${productBlocks}

LIVRAISON:
${deliveryStr}

RÉSUMÉ:
Sous-total: ${subtotalVal} DH
Livraison: ${deliveryStr}
Total à payer: ${totalVal} DH

PAIEMENT:
Paiement à la livraison

Merci de confirmer la disponibilité et la livraison.`;

    // Generate order record for persistent admin dashboard
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      reference: successData.reference || `GB-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: successData.form.fullName,
      phoneNumber: successData.form.phoneNumber,
      city: successData.form.city,
      deliveryAddress: successData.form.deliveryAddress,
      notes: successData.form.notes || "",
      items: successData.items.map((it: any) => ({
        productName: it.product.name[language] || it.product.name['fr'],
        productId: it.product.id,
        price: it.product.price,
        quantity: it.quantity,
        image: it.product.image,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor
      })),
      total: totalVal,
      subtotal: subtotalVal,
      shippingCost: shippingCostVal,
      finalTotal: totalVal,
      freeShipping: isFree,
      date: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'pending',
      paymentMethod: 'Cash on delivery',
      whatsappMessage: whatsappMessage,
      source: 'website',
      syncStatus: 'not-configured'
    };

    console.log("[ORDER CREATE] order object created");

    // Do not show a success screen or clear the cart until the database confirms the write.
    const persisted = await saveOrderToBackend(newOrder);
    if (!persisted.success) {
      throw new Error(persisted.error || 'Commande non enregistrée. Veuillez réessayer.');
    }

    // Save locally first to ensure a reliable contingency backup is immediately captured
    const initialOrdersList = [newOrder, ...orders];
    setOrders(initialOrdersList);
    localStorage.setItem('globabox_orders', JSON.stringify(initialOrdersList));
    console.log("[ORDER LOCAL] saved to localStorage");

    // Clear the cart only after building/local saving of order object is completed
    setCart([]);

    // The server confirmed persistence; now show success and store a local cache
    sessionStorage.setItem('globabox_last_success_order', JSON.stringify(successData));
    setOrderSuccessData(successData);
    setIsSuccessModalOpen(true);
    setIsCartOpen(false);
    console.log("[ORDER UI] success modal opened");

    // Trigger purchase events (lead and completed purchase tracking)
    triggerPurchase(
      newOrder.reference, 
      successData.items.map((it: any) => ({
        id: it.product.id,
        name: it.product.name[language] || it.product.name['fr'],
        price: it.product.price,
        quantity: it.quantity
      })), 
      successData.total
    );


  };

  // Step-by-step filter operations
  const activeProducts = products.filter(p => p.isActive !== false && p.isActive !== 'FALSE');
  const afterCategory = selectedCategory 
    ? activeProducts.filter(p => p.category === selectedCategory) 
    : activeProducts;

  // Apply search and sorting
  const filteredProducts = afterCategory.filter((product) => {
    // 2. Search term match
    if (searchTerm.trim() !== '') {
      const normProductText = normalizeText(getSearchableText(product, categories));
      const normSearchQuery = normalizeText(searchTerm);
      const searchWords = normSearchQuery.split(/\s+/).filter(Boolean);
      
      const match = searchWords.every(word => {
        const forms = getSingularForms(word);
        return forms.some(form => normProductText.includes(form));
      });
      
      if (!match) {
        return false;
      }
    }
    // 3. Filters
    if (filterType === 'bestsellers' && !product.bestSeller) {
      return false;
    }
    if (filterType === 'newarrivals') {
      const isNew = product.createdAt 
        ? (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7 
        : !!product.newArrival;
      if (!isNew) {
        return false;
      }
    }
    // 4. Price range filters
    if (minPrice !== '' && product.price < Number(minPrice)) {
      return false;
    }
    if (maxPrice !== '' && product.price > Number(maxPrice)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOption === 'price_low_high') {
      return a.price - b.price;
    }
    if (sortOption === 'price_high_low') {
      return b.price - a.price;
    }
    // newest sort
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    if (numA !== numB) {
      return numB - numA;
    }
    return b.id.localeCompare(a.id);
  });

  // Log search results in development
  if (process.env.NODE_ENV !== 'production' || (import.meta as any).env.DEV) {
    console.log(`[SEARCH FILTER] query: "${searchTerm}"`);
    console.log(`[SEARCH FILTER] active products: ${activeProducts.length}`);
    console.log(`[SEARCH FILTER] after category: ${afterCategory.length}`);
    console.log(`[SEARCH FILTER] final matches: ${filteredProducts.length}`);
    console.log(`[SEARCH RENDER] rendering product ids: [${filteredProducts.map(p => p.id).join(', ')}]`);
  }

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const activeCategoryObj = categories.find(cat => cat.id === selectedCategory);
  const categoryName = activeCategoryObj ? (activeCategoryObj.name[language] || activeCategoryObj.name['fr']) : '';

  return (
    <div 
      className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white transition-colors duration-300 pb-20 md:pb-0"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* 1. Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        categories={categories}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Spacing Offset for Fixed Header */}
      <div className="h-[145px] md:h-[115px]"></div>

      {/* 2. Hero Section */}
      {!selectedCategory && !searchTerm && (
        <Hero 
          language={language} 
          onExploreClick={handleScrollToCatalog} 
          onWhatsAppOrder={handleWhatsAppOrderSubmit}
        />
      )}

      {/* 3. Category Grid Selector */}
      <CategoryGrid
        language={language}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          handleScrollToCatalog();
        }}
        categories={categories}
      />

      {/* 3.05 Delivery Info & Reassurance Banner */}
      <DeliveryBanner language={language} />

      {/* 3.08 Active Flash Discounts/Hot Deals ("Offres du moment") */}
      {!selectedCategory && !searchTerm && (
        <PromoOffersSection
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
        />
      )}

      {/* Special Camping Offer spotlight ad block for the new Dome Tent */}
      {!selectedCategory && !searchTerm && (
        <PromoCampSection
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
          onWhatsAppOrder={handleWhatsAppOrderSubmit}
        />
      )}

      {/* 3.1 Best Selling Products Showcase (High converting) */}
      {!selectedCategory && !searchTerm && (
        <BestSellersSection
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
          onExploreMore={handleScrollToCatalog}
        />
      )}

      {/* 3.15 Economic Combo Packs ("Packs économiques" - High AOV) */}
      {!selectedCategory && !searchTerm && (
        <EconomicPacksSection
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
          onExploreMore={handleScrollToCatalog}
        />
      )}

      {/* 3.2 New Arrivals Showcase (High converting) */}
      {!selectedCategory && !searchTerm && (
        <NewArrivalsSection
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
          onExploreMore={handleScrollToCatalog}
        />
      )}

      {/* 3.25 Under 99 DH Impulse Pocket Area ("Moins de 99 DH") */}
      {!selectedCategory && !searchTerm && (
        <Under99Section
          language={language}
          products={products}
          onViewDetails={(prod) => setSelectedProduct(prod)}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
        />
      )}

      {/* 3.28 Detailed Free Shipping policy layout ("Livraison gratuite") */}
      <FreeDeliverySection language={language} />

      {/* 3.3 Why Choose Globabox Trust & Reassurance Block */}
      <WhyChooseGlobabox language={language} />

      {/* 4. Main Catalog Section & Filtering */}
      <main 
        ref={catalogRef} 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scrolls-offset-padding"
      >
        {/* Catalog Header with Tabs & Counter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {selectedCategory ? (
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  ⛺{" "}
                  {language === 'ar' 
                    ? `منتجات فئة: ${categoryName}`
                    : language === 'en'
                    ? `Products in category: ${categoryName}`
                    : `Produits de la catégorie: ${categoryName}`
                  }
                </h2>
                <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1 font-medium">
                  {language === 'ar'
                    ? `اكتشف تشكيلتنا من جلوبابوكس لـ ${categoryName} مع توصيل سريع لجميع المدن المغربية والدفع عند الاستلام.`
                    : language === 'en'
                    ? `Discover our Globabox selection for ${categoryName} with express shipping across Morocco and safe cash on delivery.`
                    : `Découvrez notre sélection Globabox pour ${categoryName} avec livraison partout au Maroc et paiement à la livraison.`
                  }
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                  ID: {selectedCategory} • {filteredProducts.length} {filteredProducts.length > 1 ? 'produits' : 'produit'}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  ⛺ {t('allProductsTitle')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredProducts.length} {t('cartItemsCount')} {t('allCategoriesLabel').toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Subtype filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-205 shrink-0 self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0b1528] text-white shadow-sm'
                  : 'text-slate-650 hover:text-slate-900'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setFilterType('bestsellers')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterType === 'bestsellers'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-650 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1"><Flame size={12} className="shrink-0 text-orange-400" /> <span>{t('filterBestSellers')}</span></span>
            </button>
            <button
              onClick={() => setFilterType('newarrivals')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterType === 'newarrivals'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-650 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1"><Star size={12} className="shrink-0 text-amber-300" /> <span>{t('filterNewArrivals')}</span></span>
            </button>
          </div>
        </div>

        {/* Global Catalog Search, Categories & Pricing filter system */}
        <ProductFilters
          language={language}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortOption={sortOption}
          setSortOption={setSortOption}
          productsFoundCount={filteredProducts.length}
        />

        {/* Debugging Panel for Search */}
        {searchTerm && (process.env.NODE_ENV !== 'production' || (import.meta as any).env.DEV) && (
          <div className="mb-6 p-3 bg-amber-50/50 text-amber-900 text-xs rounded-2xl font-mono text-center border border-amber-200/40 shadow-sm flex items-center justify-center gap-1.5 animate-scale-up">
            <span className="animate-pulse">🔍</span>
            <span>Recherche : <strong className="text-amber-955">"{searchTerm}"</strong> — Résultats : <strong className="text-[#0b1528] font-sans font-extrabold">{filteredProducts.length}</strong></span>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm px-4">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-slate-700 font-sans leading-relaxed">
              {selectedCategory ? (
                language === 'ar'
                  ? `عذراً، لا توجد منتجات متوفرة في هذه الفئة حالياً.`
                  : language === 'en'
                  ? `No products available in this category at the moment.`
                  : `Aucun produit disponible dans cette catégorie pour le moment.`
              ) : (
                t('noProductsFound')
              )}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-6 px-5 py-2.5 bg-[#0b1528] hover:bg-[#1a2d4c] text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm cursor-pointer"
            >
              {language === 'ar' ? 'عرض كل المنتجات' : language === 'en' ? 'Show all products' : 'Toutes les catégories'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                language={language}
                onViewDetails={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod) => handleAddToCart(prod, 1)}
                onInstantOrder={(prod) => handleInstantCheckout(prod, 1)}
                onWhatsAppOrder={handleWhatsAppOrderSubmit}
              />
            ))}
          </div>
        )}

        {/* 5. Reassurance Giga Trust Badges */}
        <TrustBadges language={language} />
      </main>

      {/* 5.1 Real Moroccan Customer Reviews Section (Social Proof) */}
      <CustomerReviews language={language} />

      {/* 5.2 Comprehensive Interactive FAQs */}
      <FAQSection language={language} />

      {/* 5.3 Closing Highly Polished WhatsApp & Direct-Call CTA */}
      <FinalWhatsAppCTA language={language} onWhatsAppOrder={handleWhatsAppOrderSubmit} />

      {/* 6. Professional High-Converting Footer */}
      <footer 
        className="bg-[#0b1528] border-t border-[#1c2e4a] text-slate-300 text-xs py-12 px-6"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-white shadow-md border border-orange-500/20 relative overflow-hidden">
                <span className="text-xs font-black font-sans tracking-tight text-white z-10 flex items-center">G<span className="text-amber-300 font-serif font-black">B</span></span>
                <span className="absolute bottom-0 text-[8px] opacity-40 font-mono text-white/50 select-none z-0">▲</span>
              </div>
              <span className="text-base font-black text-white tracking-widest">{t('brandName')}</span>
            </div>
            <p className="leading-relaxed text-xs text-slate-400 mb-4">
              {t('footerAbout')}
            </p>
            <div className="pt-1">
              <a 
                href="https://www.globabox.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-500 hover:text-orange-400 font-mono font-bold text-xs tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                🌐 www.globabox.com
              </a>
            </div>
          </div>

          <div>
            <span className="text-white font-bold text-xs uppercase tracking-widest block mb-4">{t('footerQuickLinks')}</span>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => { setSelectedCategory(''); setSearchTerm(''); }} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left flex items-center gap-1.5"
                >
                  <Home size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "الرئيسية" : "Accueil"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={handleScrollToCatalog} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left flex items-center gap-1.5"
                >
                  <ShoppingBag size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "متجر المستلزمات" : "Découvrir la boutique"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setLegalActiveTab('about'); setIsLegalModalOpen(true); }} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left flex items-center gap-1.5"
                >
                  <Star size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "نبذة عن جلوبابوكس" : "À propos de nous"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setLegalActiveTab('delivery'); setIsLegalModalOpen(true); }} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left flex items-center gap-1.5"
                >
                  <Truck size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "معلومات التوصيل" : "Info Livraison & Suivi"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsTrackingOpen(true)} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left text-orange-400 font-bold flex items-center gap-1.5"
                >
                  <MapPin size={14} className="text-orange-550 shrink-0 animate-bounce" />
                  <span>{language === "ar" ? "تتبع طلبيتك الآن" : "Suivre ma commande"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className="hover:text-amber-400 hover:underline transition-colors block text-left flex items-center gap-1.5"
                >
                  <ShoppingCart size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "السلة المباشرة" : "Panier client"}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsAdminOpen(true)} 
                  className="hover:text-[#f97316] text-[#94a3b8] hover:underline transition-colors block text-left font-bold flex items-center gap-1.5"
                >
                  <Lock size={14} className="text-orange-550 shrink-0" />
                  <span>{language === "ar" ? "لوحة الإدارة جلوبابوكس" : "Administration Globabox"}</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-white font-bold text-xs uppercase tracking-widest block mb-4">Garantie & Securité</span>
            <div className="space-y-2 leading-relaxed font-sans text-slate-400 text-xs">
              <p className="flex items-center gap-2"><MapPin size={13} className="text-orange-500 shrink-0" /> <span>{t('footerLocation')}</span></p>
              <p className="flex items-start gap-2"><ShieldCheck size={13} className="text-orange-500 shrink-0 mt-0.5" /> <span>{t('paymentOnDeliveryBadge')} - {language === "ar" ? "افحص سلعك قبل الدفع" : "Inspectez vos produits à la réception."}</span></p>
              <p className="flex items-center gap-2"><Truck size={13} className="text-orange-500 shrink-0" /> <span>{t('expressDeliveryBadge')} (24h - 48h)</span></p>
            </div>
          </div>

          <div>
            <span className="text-white font-bold text-xs uppercase tracking-widest block mb-4">
              {t('footerContactTitle')}
            </span>
            <div className="space-y-3 font-sans">
              <a
                href={`tel:${ORDER_SUPPORT_NUMBER}`}
                className="flex items-center gap-2 text-white font-mono font-bold text-sm bg-blue-950/80 border border-blue-900/60 p-2.5 rounded-xl hover:text-orange-400 transition-colors"
               >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>{ORDER_SUPPORT_NUMBER}</span>
              </a>
              <p className="text-[11px] leading-relaxed text-slate-400 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-orange-500 shrink-0" /> <span>{t('footerSchedule')}</span>
              </p>
              <div className="flex gap-2 items-center">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-400">{language === "ar" ? "وكلاء واتساب متصلون الآن" : "Conseillers WhatsApp en ligne"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {t('brandName')} - Premium Store Maroc. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <button 
              onClick={() => { setLegalActiveTab('about'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <Compass size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>À propos</span>
            </button>
            <button 
              onClick={() => { setLegalActiveTab('delivery'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <Truck size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>Livraison</span>
            </button>
            <button 
              onClick={() => { setLegalActiveTab('returns'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <RefreshCw size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>Retours</span>
            </button>
            <button 
              onClick={() => { setLegalActiveTab('cgv'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <FileText size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>Conditions (CGV)</span>
            </button>
            <button 
              onClick={() => { setLegalActiveTab('privacy'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <ShieldCheck size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>Confidentialité</span>
            </button>
            <button 
              onClick={() => { setLegalActiveTab('contact'); setIsLegalModalOpen(true); }}
              className="hover:text-amber-500 hover:underline transition-colors bg-transparent border-none cursor-pointer flex items-center text-[11px]"
            >
              <Phone size={11} className="shrink-0 mr-1 text-orange-500" />
              <span>Contact</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 7. Premium Floating Support Widget */}
      <PremiumSupportWidget
        language={language}
        onOpenTracking={() => setIsTrackingOpen(true)}
        phoneNumber={ORDER_SUPPORT_NUMBER}
        whatsappLink={WA_LINK}
        onWhatsAppOrder={handleWhatsAppOrderSubmit}
      />

      {/* 7.5 Mobile-Optimized Bottom Action Navigation Bar (Visible only on mobile) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-45 bg-[#070d1a] border-t border-[#1a2d4c]/80 py-2.5 px-2 flex items-center justify-around shadow-[0_-10px_35px_rgba(0,0,0,0.5)] md:hidden pb-safe font-sans"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        {/* Navigation Action 1: Accueil */}
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setFilterType('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-slate-300 hover:text-orange-500 active:scale-95 transition-all select-none min-h-[44px] outline-none group"
        >
          <Home className="w-[22px] h-[22px] mb-1 text-slate-300 group-hover:text-orange-500 transition-colors" />
          <span className="text-[10px] font-black tracking-wider uppercase">
            {language === 'ar' ? 'الرئيسية' : (language === 'en' ? 'Home' : 'Accueil')}
          </span>
        </button>

        {/* Navigation Action 2: Catégories */}
        <button
          onClick={() => {
            const el = document.getElementById('product-filters-container') || catalogRef.current;
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-slate-300 hover:text-orange-500 active:scale-95 transition-all select-none min-h-[44px] outline-none group"
        >
          <LayoutGrid className="w-[22px] h-[22px] mb-1 text-slate-300 group-hover:text-orange-500 transition-colors" />
          <span className="text-[10px] font-black tracking-wider uppercase">
            {language === 'ar' ? 'الأقسام' : (language === 'en' ? 'Categories' : 'Catégories')}
          </span>
        </button>

        {/* Navigation Action 3: Panier */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-slate-300 hover:text-orange-500 active:scale-95 transition-all select-none min-h-[44px] outline-none relative group"
        >
          <div className="relative">
            <ShoppingCart className="w-[22px] h-[22px] mb-1 text-slate-300 group-hover:text-orange-500 transition-colors" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-3.5 bg-orange-600 text-white text-[9px] font-black w-[18px] h-[18px] rounded-full border border-[#070d1a] flex items-center justify-center shadow animate-pulse select-none">
                {totalCartItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase">
            {language === 'ar' ? 'السلة' : 'Panier'}
          </span>
        </button>

        {/* Navigation Action 4: WhatsApp */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerWhatsAppClick('Mobile Bottom Action Bar - Sticky Tab');
            handleWhatsAppOrderSubmit({ source: 'mobile_bottom_bar_whatsapp' });
          }}
          className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all select-none min-h-[44px] outline-none group cursor-pointer"
        >
          <WhatsAppIcon className="w-[22px] h-[22px] mb-1 text-emerald-500 group-hover:text-emerald-400 transition-colors shrink-0" />
          <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400">
            {language === 'ar' ? 'واتساب' : 'WhatsApp'}
          </span>
        </button>
      </div>

      {/* 8. Floating Scroll to Top button */}
      {showScrollTop && (
        <>
          <style>{`
            .back-to-top-btn {
              position: fixed;
              z-index: 40;
              transition: all 0.3s ease;
            }
            @media (max-width: 480px) {
              .back-to-top-btn {
                bottom: calc(182px + env(safe-area-inset-bottom, 0px)) !important;
                ${language === 'ar' ? 'left: 32px !important; right: auto !important;' : 'right: 32px !important; left: auto !important;'}
              }
            }
            @media (min-width: 481px) and (max-width: 1024px) {
              .back-to-top-btn {
                bottom: calc(180px + env(safe-area-inset-bottom, 0px)) !important;
                ${language === 'ar' ? 'left: 32px !important; right: auto !important;' : 'right: 32px !important; left: auto !important;'}
              }
            }
            @media (min-width: 1025px) {
              .back-to-top-btn {
                bottom: 112px !important;
                ${language === 'ar' ? 'left: 48px !important; right: auto !important;' : 'right: 48px !important; left: auto !important;'}
              }
            }
          `}</style>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="back-to-top-btn bg-[#0B1528] border border-slate-800 text-white hover:text-orange-500 hover:border-orange-500 p-3 rounded-full hover:bg-slate-900 transition-all shadow-xl duration-200 hover:scale-110 active:scale-95"
          >
            <ArrowUp size={16} />
          </button>
        </>
      )}

      {/* 9. Interactive sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        language={language}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
        onWhatsAppOrder={handleWhatsAppOrderSubmit}
      />

      {/* 10. Product detailed specs modal */}
      <Suspense fallback={null}>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            language={language}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onInstantCheckout={handleInstantCheckout}
            onWhatsAppOrder={handleWhatsAppOrderSubmit}
          />
        )}
      </Suspense>

      {/* 11. Rich Checkout Success Screen Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        onContinueShopping={() => {
          handleCloseSuccessModal();
          handleScrollToCatalog();
        }}
        onGoHome={() => {
          handleCloseSuccessModal();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTracking={() => {
          handleCloseSuccessModal();
          setIsTrackingOpen(true);
        }}
        language={language}
        orderData={orderSuccessData}
      />

      {/* 11.5 Order tracking modal */}
      <Suspense fallback={null}>
        {isTrackingOpen && (
          <OrderTrackingModal
            isOpen={isTrackingOpen}
            onClose={() => setIsTrackingOpen(false)}
            language={language}
          />
        )}
      </Suspense>

      {/* 12. Full-featured, Persistent Administration Panel */}
      <Suspense fallback={null}>
        {isAdminOpen && (
          <AdminPanel
            language={language}
            onClose={() => setIsAdminOpen(false)}
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
            orders={orders}
            setOrders={setOrders}
            isOrdersApiConfigured={isOrdersApiConfigured}
          />
        )}
      </Suspense>

      {/* 13. Legal and Trust Pages Modal */}
      <Suspense fallback={null}>
        {isLegalModalOpen && (
          <LegalPagesModal
            isOpen={isLegalModalOpen}
            onClose={() => setIsLegalModalOpen(false)}
            initialTab={legalActiveTab}
            language={language}
          />
        )}
      </Suspense>

      {/* 14. Marketing High-Converting Persistent Persistent/Floating widgets */}
      <FloatingPersuasionWidget
        language={language}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 15. Exit Intent Offer Modal (Desktop / Mobile tracking) */}
      <Suspense fallback={null}>
        <ExitIntentModal
          language={language}
          onExploreOffers={handleScrollToCatalog}
          onWhatsAppOrder={handleWhatsAppOrderSubmit}
        />
      </Suspense>
    </div>
  );
}
