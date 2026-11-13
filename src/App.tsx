import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { MessageSquare, Phone, ArrowUp, ShoppingBag, ShieldCheck, Check, ShoppingCart, Home, LayoutGrid, MapPin, Truck, RefreshCw, HelpCircle, FileText, Lock, Star, Flame, Compass, BadgeCheck } from 'lucide-react';
import { Language, CartItem, CheckoutForm, Order, Product } from './types';
import { PRODUCTS, CATEGORIES, ORDER_SUPPORT_NUMBER, WA_LINK, DISPLAY_PHONE, WHATSAPP_NUMBER, WHATSAPP_LINK } from './data';
import { TRANSLATIONS } from './translations';

// Subcomponents
import Header from './components/Header';
import HomeBannerSlider from './components/HomeBannerSlider';
import StoreSidebar from './components/StoreSidebar';
import StoreInfoPage from './components/StoreInfoPage';
import { STORE_SUBCATEGORIES, matchesSubcategory } from './storefrontSubcategories';
import { STORE_DEPARTMENTS, isPublicStoreCategory, matchesStoreDepartment } from './storefrontDepartments';

import ProductCard from './components/ProductCard';
import TrustBadges from './components/TrustBadges';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';
import DeliveryBanner from './components/DeliveryBanner';

import WhatsAppIcon from './components/WhatsAppIcon';
import StoreFooter from './components/StoreFooter';

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
  const [selectedSubcategory, setSelectedSubcategory] = useState(() => new URLSearchParams(window.location.search).get('subcategory') || '');
  const [infoPage, setInfoPage] = useState<string|null>(() => new URLSearchParams(window.location.search).get('page'));
  const [filterType, setFilterType] = useState<'all' | 'bestsellers' | 'newarrivals'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'price_low_high' | 'price_high_low'>('newest');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // Reset a child filter whenever the parent department is cleared (e.g. header All Products).
  useEffect(() => {
    if (!selectedCategory && selectedSubcategory) setSelectedSubcategory('');
  }, [selectedCategory, selectedSubcategory]);

  // Persistent data states
  const [products, setProducts] = useState<any[]>([]);

  // Live category metadata is served by D1; keep bundled defaults only as a network fallback.
  const [categories, setCategories] = useState<any[]>(CATEGORIES);

  useEffect(() => {
    fetch('/api/categories', {cache:'no-store'})
      .then(async response => {
        if (!response.ok) throw new Error('Categories HTTP ' + response.status);
        return response.json();
      })
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .catch(error => console.warn('[GLOBABOX CATEGORIES] Using bundled fallback:',error));
  }, []);

  // Admin-only order state: never hydrate customers' private orders from browser storage.
  const [orders, setOrders] = useState<Order[]>([]);

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
    const initialSubcategory = searchParams.get('subcategory');
    if(initialSubcategory) setSelectedSubcategory(initialSubcategory);
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

  // Load non-sensitive storefront configuration only; order data belongs to the authenticated admin session.
  useEffect(() => {
    // Fetch config status
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Config route not OK');
        return res.json();
      })
      .then((config: unknown) => {
        const configured = !!(config && typeof config === 'object' && 'isConfigured' in config && config.isConfigured);
        setIsOrdersApiConfigured(configured);
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
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('category');
    searchParams.delete('subcategory');
    searchParams.delete('product');
    if (selectedProduct) {
      searchParams.set('product', selectedProduct.id);
    } else if (selectedCategory) {
      searchParams.set('category', selectedCategory);
      if (selectedSubcategory) searchParams.set('subcategory', selectedSubcategory);
    }
    
    const query = searchParams.toString();
    const newRelativePathQuery = window.location.pathname + (query ? `?${query}` : '');
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [selectedProduct, selectedCategory, selectedSubcategory]);

  // Keep full policy pages shareable and responsive to browser back/forward.
  useEffect(() => {
    const syncLocation = () => {
      const query = new URLSearchParams(window.location.search);
      setInfoPage(query.get('page'));
      setSelectedCategory(query.get('category') || '');
      setSelectedSubcategory(query.get('subcategory') || '');
    };
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);

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
      ? "جلوبابوكس | متجر إلكتروني عام بالمغرب" 
      : "Globabox | Boutique en ligne multi-catégories au Maroc";
    
    let metaDesc = language === "ar"
      ? "تسوق منتجات متنوعة للمنزل والتكنولوجيا والحياة اليومية من جلوبابوكس، مع الدفع عند الاستلام بالمغرب."
      : "Découvrez des produits pour la maison, les accessoires, la technologie et le quotidien au Maroc, avec paiement à la livraison.";

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
    // An empty WhatsApp enquiry is support, not a fabricated product order.
    const activeItems: CartItem[] = items;

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
    if (!whatsappMessage && activeItems.length === 0) {
      whatsappMessage = language === 'ar'
        ? 'سلام جلوبابوكس، بغيت نستفسر على المنتجات المتوفرة والتوصيل.'
        : language === 'en'
        ? 'Hello GLOBABOX, I would like information about your available products and delivery.'
        : 'Bonjour GLOBABOX, je souhaite des informations sur vos produits disponibles et la livraison.';
    }
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

    // WhatsApp button is a lead, not a confirmed order.
    // Do not manufacture customer records or save private details to localStorage.
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
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

    const confirmedOrder = persisted.savedOrder!;
    // Use the server-generated order ID, reference, item prices and delivery total.
    const confirmedSuccessData = {
      ...successData,
      reference: confirmedOrder.reference,
      subtotal: confirmedOrder.subtotal,
      shippingCost: confirmedOrder.shippingCost,
      total: confirmedOrder.total,
      freeShipping: confirmedOrder.freeShipping
    };
    // The order lives in D1; admin fetches it only after authentication.
    // Clear the cart only after building/local saving of order object is completed
    setCart([]);

    // The server confirmed persistence; now show success and store a local cache
    sessionStorage.setItem('globabox_last_success_order', JSON.stringify(confirmedSuccessData));
    setOrderSuccessData(confirmedSuccessData);
    setIsSuccessModalOpen(true);
    setIsCartOpen(false);
    console.log("[ORDER UI] success modal opened");

    // Trigger purchase events (lead and completed purchase tracking)
    triggerPurchase(
      confirmedOrder.reference, 
      confirmedOrder.items.map((it: any) => ({
        id: it.productId,
        name: it.productName,
        price: it.price,
        quantity: it.quantity
      })), 
      confirmedOrder.total
    );


  };

  // Step-by-step filter operations
  const activeProducts = products.filter(p => p.isActive !== false && p.isActive !== 'FALSE' && isPublicStoreCategory(p.category));
  const afterCategory = selectedCategory 
    ? activeProducts.filter(p => matchesStoreDepartment(p.category, selectedCategory)) 
    : activeProducts;

  // Apply search and sorting
  const filteredProducts = afterCategory.filter((product) => {
    if (selectedCategory && selectedSubcategory && !matchesSubcategory(product,selectedSubcategory)) return false;
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
  
  const activeCategoryObj = STORE_DEPARTMENTS.find(cat => cat.id === selectedCategory) || categories.find(cat => cat.id === selectedCategory);
  const activeSubcategoryObj=STORE_SUBCATEGORIES.find(sub=>sub.id===selectedSubcategory && sub.parent===selectedCategory);
  const categoryName = activeSubcategoryObj ? activeSubcategoryObj.name[language] : activeCategoryObj ? (activeCategoryObj.name[language] || activeCategoryObj.name['fr']) : (selectedCategory ? (language === 'ar' ? 'القسم' : language === 'en' ? 'Category' : 'Catégorie') : '');

  return (
    <div 
      className="min-h-screen bg-white text-slate-900 selection:bg-teal-700 selection:text-white transition-colors duration-300"
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
      <div className="h-[151px] md:h-[103px]"></div>

      {infoPage ? (
        <StoreInfoPage language={language} page={infoPage}
          onSelectPage={(tab)=>{setInfoPage(tab);window.history.pushState(null,'','?page='+encodeURIComponent(tab));window.scrollTo({top:0,behavior:'smooth'});}}
          onBackToShop={()=>{setInfoPage(null);window.history.pushState(null,'','/');setSelectedCategory('');setSelectedSubcategory('');window.scrollTo({top:0,behavior:'smooth'});}}/>
      ) : (<>
      {/* Store hero: rotating home-and-lifestyle promotions, each with a working catalog action. */}
      {!selectedCategory && !searchTerm && (
        <HomeBannerSlider
          language={language}
          onShopAll={handleScrollToCatalog}
          onSelectDepartment={(id) => {setSelectedCategory(id);setSelectedSubcategory(''); window.requestAnimationFrame(handleScrollToCatalog);}}
        />
      )}

      {/* Single category navigation, always on the left beside catalog on desktop. */}
      <div className="flex w-full max-w-none flex-col gap-6 px-4 pb-10 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8 2xl:gap-10 2xl:px-10" dir="ltr">
        <StoreSidebar
          language={language}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelect={(id) => {setSelectedCategory(id);setSelectedSubcategory('');window.requestAnimationFrame(handleScrollToCatalog);}}
          onSelectSubcategory={(parent,child) => {setSelectedCategory(parent);setSelectedSubcategory(child);window.requestAnimationFrame(handleScrollToCatalog);}}
          products={products}
        />

      {/* 4. Main Catalog Section & Filtering */}
      <main 
        id="product-catalog"
        ref={catalogRef} 
        className="min-w-0 w-full flex-1 scroll-mt-32 pt-1 pb-10"
      >
        <div dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Catalog Header with Tabs & Counter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {selectedCategory ? (
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  
                  {language === 'ar' 
                    ? `منتجات فئة: ${categoryName}`
                    : language === 'en'
                    ? `Products in category: ${categoryName}`
                    : `Produits de la catégorie: ${categoryName}`
                  }
                </h2>
                <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1 font-medium">
                  {language === 'ar'
                    ? `اكتشف منتجات ${categoryName} مع الدفع عند الاستلام وتأكيد إمكانية التوصيل قبل الإرسال.`
                    : language === 'en'
                    ? `Explore ${categoryName} products with cash on delivery; delivery options are confirmed before dispatch.`
                    : `Découvrez notre sélection ${categoryName}, avec paiement à la livraison et disponibilité du transport confirmée avant l'expédition.`
                  }
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1.5">
                  {filteredProducts.length} {language==='ar'?'منتج':language==='en'?(filteredProducts.length===1?'product':'products'):(filteredProducts.length===1?'produit':'produits')}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                  {t('allProductsTitle')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredProducts.length} {t('cartItemsCount')} {t('allCategoriesLabel').toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Only show merchandising filters supported by real published product data. */}
          <div className="flex max-w-full flex-wrap items-center gap-2 self-start" aria-label={language==='ar'?'فرز وتصفية المنتجات':'Filtrer et trier les produits'}>
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-[#f6f8f6] p-1">
              <button type="button" onClick={() => setFilterType('all')}
                aria-pressed={filterType==='all'}
                className={'rounded-lg px-3 py-2 text-xs font-bold transition '+(filterType==='all'?'bg-[#104d43] text-white shadow-sm':'text-slate-600 hover:bg-white')}>
                {t('filterAll')}
              </button>
              {activeProducts.some(p=>p.bestSeller) && (
                <button type="button" onClick={() => setFilterType('bestsellers')}
                  aria-pressed={filterType==='bestsellers'}
                  className={'rounded-lg px-3 py-2 text-xs font-bold transition '+(filterType==='bestsellers'?'bg-[#104d43] text-white shadow-sm':'text-slate-600 hover:bg-white')}>
                  {t('filterBestSellers')}
                </button>
              )}
              {activeProducts.some(p=>p.newArrival) && (
                <button type="button" onClick={() => setFilterType('newarrivals')}
                  aria-pressed={filterType==='newarrivals'}
                  className={'rounded-lg px-3 py-2 text-xs font-bold transition '+(filterType==='newarrivals'?'bg-[#104d43] text-white shadow-sm':'text-slate-600 hover:bg-white')}>
                  {t('filterNewArrivals')}
                </button>
              )}
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">
              <span>{language==='ar'?'ترتيب':language==='en'?'Sort by':'Trier'}</span>
              <select value={sortOption} onChange={e=>setSortOption(e.target.value as typeof sortOption)}
                aria-label={language==='ar'?'ترتيب المنتجات':'Sort products'}
                className="max-w-[175px] bg-transparent py-2 text-xs font-semibold text-[#104d43] outline-none">
                <option value="newest">{language==='ar'?'الأحدث':language==='en'?'Newest':'Nouveautés'}</option>
                <option value="price_low_high">{language==='ar'?'الثمن: من الأقل للأعلى':language==='en'?'Price: low to high':'Prix croissant'}</option>
                <option value="price_high_low">{language==='ar'?'الثمن: من الأعلى للأقل':language==='en'?'Price: high to low':'Prix décroissant'}</option>
              </select>
            </label>
          </div>
        </div>

                {/* Search is in the header; catalog sorting stays here. Categories are only in the left sidebar. */}
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
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-700 font-sans leading-relaxed">
              {selectedCategory ? (
                language === 'ar'
                  ? `عذراً، لا توجد منتجات متوفرة في هذه الفئة حالياً.`
                  : language === 'en'
                  ? `No products available in this category at the moment.`
                  : `Aucun produit disponible dans cette catégorie pour le moment.`
              ) : activeProducts.length===0 ? (
                language==='ar'?'لا توجد حالياً منتجات منشورة في المتجر.':language==='en'?'There are no published products in the store yet.':'Aucun produit publié dans la boutique pour le moment.'
              ) : (
                t('noProductsFound')
              )}
            </p>
            {activeProducts.length>0 && (
              <button type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="mt-6 rounded-xl bg-[#104d43] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c3730]">
                {language === 'ar' ? 'عرض جميع المنتجات' : language === 'en' ? 'View all products' : 'Voir tous les produits'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[2100px]:grid-cols-6">
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
        </div>
      </main>
      </div>

      {/* 5.1 Real Moroccan Customer Reviews Section (Social Proof) */}


      {/* 5.2 Comprehensive Interactive FAQs */}
      <FAQSection language={language} />

      {/* 5.3 Closing Highly Polished WhatsApp & Direct-Call CTA */}
      <FinalWhatsAppCTA language={language} />
      </>)}

      {/* 6. Professional public storefront footer */}
      <StoreFooter
        language={language}
        onHome={() => { setInfoPage(null);window.history.pushState(null,'','/');setSelectedCategory('');setSelectedSubcategory('');setSearchTerm('');setFilterType('all');window.scrollTo({top: 0, behavior: 'smooth'}); }}
        onBrowse={()=>{setInfoPage(null);window.history.pushState(null,'','/');setSelectedCategory('');setSelectedSubcategory('');window.requestAnimationFrame(handleScrollToCatalog);}}
        onTrack={() => setIsTrackingOpen(true)}
        onCart={() => setIsCartOpen(true)}
        onLegal={(tab) => { setInfoPage(tab);window.history.pushState(null,'','?page='+encodeURIComponent(tab));window.scrollTo({top:0,behavior:'smooth'}); }}
      />

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

      {/* Small, unobtrusive return-to-top action after the user scrolls down. */}
      {showScrollTop && !isCartOpen && !isTrackingOpen && !isSuccessModalOpen && !selectedProduct && !isAdminOpen && (
        <button type="button"
          onClick={() => window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'})}
          aria-label={language === 'ar' ? 'الرجوع لأعلى الصفحة' : language === 'en' ? 'Back to top' : 'Retour en haut'}
          title={language === 'ar' ? 'الرجوع للفوق' : language === 'en' ? 'Back to top' : 'Retour en haut'}
          className="fixed bottom-5 end-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#b9dbc7] bg-[#104d43] text-white shadow-[0_6px_24px_rgba(11,48,39,.25)] transition-colors hover:bg-[#0b382f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#104d43] sm:bottom-7 sm:end-7">
          <ArrowUp size={21} strokeWidth={2.5}/>
        </button>
      )}

    </div>
  );
}
