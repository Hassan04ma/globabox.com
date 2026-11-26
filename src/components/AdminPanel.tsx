import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Package, ClipboardList, Settings, Plus, Trash2, Edit2, CheckCircle2, RefreshCw, X, Search, ChevronRight, Ban, Truck, ShieldCheck, CornerDownRight, BarChart3, MapPin, Phone, ShoppingCart, BadgeCheck, Compass } from 'lucide-react';
import { Product, Category, Order, Language } from '../types';
import { MOROCCAN_CITIES, ORDER_SUPPORT_NUMBER, WHATSAPP_NUMBER } from '../data';
import AdminTrackingWorkspace from './AdminTrackingWorkspace';
import AdminShippingEditor from './AdminShippingEditor';
import ProductImage from './ProductImage';
import AdminWorkspaceLayout from './AdminWorkspaceLayout';
import AdminDashboardWorkspace from './AdminDashboardWorkspace';
import AdminCustomersWorkspace from './AdminCustomersWorkspace';
import AdminOrdersWorkspace from './AdminOrdersWorkspace';
import AdminProductsWorkspace from './AdminProductsWorkspace';
import AdminCategoriesWorkspace from './AdminCategoriesWorkspace';
import AdminLandingPagesWorkspace from './AdminLandingPagesWorkspace';
import { STORE_DEPARTMENTS, isPublicStoreCategory } from '../storefrontDepartments';
import { getStoreSubcategories } from '../storefrontSubcategories';

interface AdminPanelProps {
  language: Language;
  onClose: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  isOrdersApiConfigured?: boolean;
}

export default function AdminPanel({
  language,
  onClose,
  products,
  setProducts,
  categories,
  setCategories,
  orders,
  setOrders,
  isOrdersApiConfigured = false
}: AdminPanelProps) {
  // Dates are persisted in UTC; display them consistently in Morocco's local time.
  const formatMoroccoDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('fr-MA', {
      timeZone: 'Africa/Casablanca', day: '2-digit', month: '2-digit',
      year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'customers' | 'products' | 'categories' | 'marketing' | 'landing-pages'>('dashboard');

  const [launchStatus, setLaunchStatus] = useState<{databaseReady:boolean;adminConfigured:boolean;checkoutEnabled:boolean;checkoutVerified:boolean}|null>(null);
  const [d1ProbeStatus, setD1ProbeStatus] = useState<'idle'|'running'|'success'|'error'>('idle');
  const [checkoutDiagnostic,setCheckoutDiagnostic] = useState<{success?:boolean;total?:number;shippingCost?:number;cleanupVerified?:boolean;error?:string}|null>(null);
  const [checkoutDiagnosticBusy,setCheckoutDiagnosticBusy]=useState(false);
  const runCheckoutDiagnostic=async ()=>{
    setCheckoutDiagnosticBusy(true);
    try{
      const res=await fetch('/api/admin/checkout-diagnostic',{method:'POST',credentials:'same-origin'});
      const data:any=await res.json();
      setCheckoutDiagnostic(res.ok?data:{error:data.error||'HTTP '+res.status});
    }catch{setCheckoutDiagnostic({error:'Erreur réseau'});}
    finally{setCheckoutDiagnosticBusy(false);}
  };

  const checkAmeexSandbox = async () => {
    setAmeexBusy(true);
    setAmeexStatus('Vérification de session…');
    try {
      const sessionResponse=await fetch('/api/admin/session',{credentials:'same-origin',cache:'no-store'});
      const sessionInfo:any=await sessionResponse.json();
      if (!sessionInfo?.authenticated) {
        setIsAuthenticated(false);
        setAmeexStatus('Session expirée : reconnectez-vous à GLOBABOX.');
        return;
      }
      const statusResponse=await fetch('/api/admin/ameex-sandbox-status',{credentials:'same-origin',cache:'no-store'});
      if(statusResponse.status===401) {
        setIsAuthenticated(false);
        setAmeexStatus('Session expirée : reconnectez-vous.');
        return;
      }
      const status:any=await statusResponse.json();
      if(!statusResponse.ok) throw new Error('Statut API HTTP '+statusResponse.status);
      if(!status.configured) {
        setAmeexStatus('Clés test non reconnues sur le Worker déployé. Vérifiez les secrets AMEEX_API_ID et AMEEX_API_KEY_TEST.');
        return;
      }
      const citiesResponse=await fetch('/api/admin/ameex-sandbox-cities',{credentials:'same-origin',cache:'no-store'});
      const cities:any=await citiesResponse.json();
      // Display only server-sanitized response metadata within the admin UI.
      // Direct browser navigation to /api/admin/* may not share the working session.
      const shape=cities?.responseShape;
      const summary=shape && typeof shape === 'object'
        ? ' Type: '+String(shape.rootType ?? '?')+
          ' | Champs: '+(Array.isArray(shape.rootKeys) ? shape.rootKeys.map(String).join(', ') : '?')+
          ' | cities: '+String(shape.citiesType ?? '?')+
          ' | Nombre entrées: '+String(shape.citiesCount ?? '?')
        : ' (aucun diagnostic de format disponible)';
      setAmeexStatus(cities.authenticationUnverified ? 'AMEEX renvoie login/api au lieu des villes : authentification ou accès API à vérifier dans le compte GLOBABOX (clé TEST et API ID de la même entreprise). Aucun colis créé.' : citiesResponse.ok && cities.success
        ? 'Sandbox connecté ! Lecture villes validée (nombre : '+(cities.citiesCount ?? 'non fourni')+'). Aucun colis créé.'
        : (cities.reachable ? 'AMEEX accessible, format des villes non reconnu. '+summary : 'Clés détectées, mais lecture villes échouée (HTTP '+citiesResponse.status+', AMEEX '+(cities.upstreamStatus??'indisponible')+').'));
    } catch(e) {setAmeexStatus('Erreur de connexion : '+(e instanceof Error?e.message:'inconnue'));}
    finally{setAmeexBusy(false);}
  };
  const runAmeexSandboxParcel = async () => {
    if (!window.confirm('Créer UN colis fictif AMEEX SANDBOX ? Aucun client ni commande réelle ne sera utilisé. Ce test ne pourra pas être répété.')) return;
    setAmeexBusy(true);
    setAmeexStatus('Création du colis fictif dans le sandbox…');
    try {
      const res=await fetch('/api/admin/ameex-sandbox-parcel',{method:'POST',credentials:'same-origin'});
      const data:any=await res.json();
      setAmeexStatus(res.ok
        ? 'Test AMEEX Sandbox exécuté : HTTP '+data.httpStatus+'. '+(data.accepted?'Confirmation API explicite reçue.':'Statut de création non confirmé : vérifier dans Colis sandbox.')
        : 'Test non validé : '+(data.error||'HTTP '+res.status)+'. Ne pas réessayer automatiquement.');
    }catch{
      setAmeexStatus('Connexion interrompue : résultat indéterminé. Ne pas réessayer automatiquement.');
    }finally{setAmeexBusy(false);}
  };
  const runD1Probe = async () => {
    setD1ProbeStatus('running');
    try {
      const response = await fetch('/api/admin/verify-d1-write', {method:'POST', credentials:'same-origin'});
      const data:any = await response.json();
      setD1ProbeStatus(response.ok && data?.databaseWriteVerified === true ? 'success' : 'error');
    } catch {setD1ProbeStatus('error');}
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [ameexStatus, setAmeexStatus] = useState<string>('Non vérifié');
  const [ameexBusy, setAmeexBusy] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    fetch('/api/admin/session', {credentials:'same-origin',cache:'no-store'}).then(r => r.ok ? r.json() : { authenticated: false })
      .then((d: unknown) => setIsAuthenticated(!!(d && typeof d === 'object' && 'authenticated' in d && d.authenticated === true)))
      .catch(() => setIsAuthenticated(false)).finally(() => setAuthLoading(false));
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    }).catch(() => null);
    if (res?.ok) {
      // A successful login response is not enough: verify the session cookie was
      // actually persisted before displaying protected admin actions.
      const verified:any = await fetch('/api/admin/session', {credentials:'same-origin',cache:'no-store'})
        .then(r=>r.ok?r.json():null).catch(()=>null);
      if (verified?.authenticated === true) {
        setIsAuthenticated(true); setPasswordInput(''); setErrorMessage('');
      } else {
        setErrorMessage('Connexion acceptée, mais session non conservée. Autorisez les cookies de globabox.com, puis réessayez.');
      }
    }
    else if (res?.status === 503) setErrorMessage('Serveur non configuré : vérifiez ADMIN_PASSWORD (12+ caractères) et ADMIN_SESSION_SECRET (32+ caractères) dans Runtime Secrets.');
    else if (res?.status === 401) setErrorMessage('Nom d’utilisateur ou mot de passe incorrect.');
    else if (res?.status === 403) setErrorMessage('Origine du site refusée. Ouvrez directement le lien workers.dev.');
    else setErrorMessage('Connexion impossible : erreur HTTP ' + (res?.status || 'réseau'));
  };
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false); setOrders([]); setPasswordInput(''); setUsernameInput('');
  };

  useEffect(() => {
    if (!isAuthenticated) {setLaunchStatus(null);return;}
    fetch('/api/launch-readiness', {cache:'no-store'})
      .then(r => r.json()).then(data => setLaunchStatus(data)).catch(() => setLaunchStatus(null));
  }, [isAuthenticated]);

  // Orders are private: load them only after server-side admin authentication.
  useEffect(() => {
    if (!isAuthenticated) { setOrders([]); return; }
    fetch('/api/orders', {credentials:'same-origin'})
      .then(async r => { if(!r.ok) throw new Error('Orders HTTP ' + r.status); return r.json(); })
      .then(data => { if(Array.isArray(data)) setOrders(data); })
      .catch(err => { console.error('[ADMIN] Cannot load orders',err); setRefreshError('Impossible de charger les commandes'); });
  }, [isAuthenticated]);

  // --- Segmented Moroccan E-commerce Dashboard KPI Calculations ---
  const statTotalOrders = orders.length;
  const statNewOrders = orders.filter(o => o.status === 'pending').length;
  const statConfirmedOnly = orders.filter(o => o.status === 'confirmed').length;
  const statProcessingOrders = orders.filter(o => o.status === 'processing').length;
  const statShippedOrders = orders.filter(o => o.status === 'shipped').length;
  const statDeliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const statCancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const statTotalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0);
  

  // Dashboard analytics: real orders only, with calendar-aware periods and comparisons.
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d'|'15d'|'1m'|'4m'|'6m'|'1y'>('7d');
  const analyticsNow = new Date();
  const shiftCalendarMonth = (date: Date, delta: number) => {
    const shifted = new Date(date);
    const day = shifted.getDate();
    shifted.setDate(1);
    shifted.setMonth(shifted.getMonth() + delta);
    const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
    shifted.setDate(Math.min(day, lastDay));
    return shifted;
  };
  const analyticsMonthCount = analyticsPeriod === '4m' ? 4 : analyticsPeriod === '6m' ? 6 : analyticsPeriod === '1y' ? 12 : 0;
  const analyticsStart = new Date(analyticsNow);
  analyticsStart.setHours(0,0,0,0);
  if (analyticsPeriod === '7d') analyticsStart.setDate(analyticsStart.getDate() - 6);
  else if (analyticsPeriod === '15d') analyticsStart.setDate(analyticsStart.getDate() - 14);
  else if (analyticsPeriod === '1m') {
    const oneMonthAgo = shiftCalendarMonth(analyticsNow, -1);
    analyticsStart.setTime(oneMonthAgo.getTime());
    analyticsStart.setHours(0,0,0,0);
  } else {
    analyticsStart.setDate(1);
    analyticsStart.setMonth(analyticsStart.getMonth() - (analyticsMonthCount - 1));
  }
  const analyticsPreviousStart = analyticsMonthCount
    ? shiftCalendarMonth(analyticsStart, -analyticsMonthCount)
    : analyticsPeriod === '1m'
      ? shiftCalendarMonth(analyticsStart, -1)
      : new Date(analyticsStart.getTime() - (analyticsPeriod === '7d' ? 7 : 15) * 86400000);
  const getOrderDate = (order: Order) => {
    const parsed = new Date(order.createdAt || order.date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const currentPeriodOrders = orders.filter(order => { const d=getOrderDate(order); return !!d && d >= analyticsStart && d <= analyticsNow; });
  const previousPeriodOrders = orders.filter(order => { const d=getOrderDate(order); return !!d && d >= analyticsPreviousStart && d < analyticsStart; });
  const deliveredRevenue = (list: Order[]) => list.filter(o=>o.status==='delivered').reduce((sum,o)=>sum+Number(o.finalTotal ?? o.total ?? 0),0);
  const currentRevenue = deliveredRevenue(currentPeriodOrders);
  const previousRevenue = deliveredRevenue(previousPeriodOrders);
  const revenueChange = previousRevenue > 0 ? ((currentRevenue-previousRevenue)/previousRevenue)*100 : null;
  const currentDelivered = currentPeriodOrders.filter(o=>o.status==='delivered').length;
  const averageOrderValue = currentDelivered ? currentRevenue/currentDelivered : 0;
  const statusPercent = (status: Order['status']) => currentPeriodOrders.length ? currentPeriodOrders.filter(o=>o.status===status).length/currentPeriodOrders.length*100 : 0;
  const analyticsBuckets = (() => {
    const monthly = analyticsMonthCount > 0;
    const count = monthly ? analyticsMonthCount : Math.max(1, Math.floor((new Date(analyticsNow.getFullYear(),analyticsNow.getMonth(),analyticsNow.getDate()).getTime()-new Date(analyticsStart.getFullYear(),analyticsStart.getMonth(),analyticsStart.getDate()).getTime())/86400000)+1);
    const buckets = Array.from({length:count},(_,i)=>{
      const start = new Date(analyticsStart);
      if(monthly){ start.setDate(1); start.setMonth(start.getMonth()+i); }
      else start.setDate(start.getDate()+i);
      const end = new Date(start);
      if(monthly){ end.setMonth(end.getMonth()+1); end.setMilliseconds(-1); }
      else { end.setDate(end.getDate()+1); end.setMilliseconds(-1); }
      return {start,end,label:monthly?new Intl.DateTimeFormat('fr-FR',{month:'short',year:'2-digit'}).format(start):new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit'}).format(start),revenue:0,orders:0};
    });
    currentPeriodOrders.forEach(order=>{
      const d=getOrderDate(order); if(!d)return;
      const bucket=buckets.find(item=>d>=item.start&&d<=item.end);
      if(bucket){bucket.orders++;if(order.status==='delivered')bucket.revenue+=Number(order.finalTotal??order.total??0);}
    });
    return buckets;
  })();
  const maxAnalyticsRevenue = Math.max(1,...analyticsBuckets.map(b=>b.revenue));
  const maxAnalyticsOrders = Math.max(1,...analyticsBuckets.map(b=>b.orders));
  const topSellingProducts = (() => {
    const totals = new Map<string,number>();
    currentPeriodOrders.filter(o=>o.status==='delivered').forEach(o=>o.items?.forEach(item=>totals.set(item.productName,(totals.get(item.productName)||0)+Number(item.quantity||0))));
    return [...totals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  // Live Sync / Refresh orders logic
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null);

  const handleRefreshOrders = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    setRefreshSuccess(null);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Échec de la récupération des commandes depuis le serveur');
      const latestOrders = await res.json();
      if (Array.isArray(latestOrders)) {
        // Treat server storage as the absolute source of truth.
        // If server orders were cleared, this correctly clears client cache instead of resurrecting stale orders.
        const sortedOrders = [...latestOrders];
        sortedOrders.sort((a, b) => b.id.localeCompare(a.id));

        setOrders(sortedOrders);

        setRefreshSuccess('Commandes actualisées avec succès depuis le serveur');
        setTimeout(() => setRefreshSuccess(null), 5000);
      } else {
        throw new Error('Les données reçues du serveur ne sont pas valides.');
      }
    } catch (err: any) {
      console.error(err);
      setRefreshError(err.message || 'Erreur lors du rafraîchissement des commandes');
      setTimeout(() => setRefreshError(null), 6000);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Searching & Filtering Orders
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderCityFilter, setOrderCityFilter] = useState<string>('all');

  // Searching Products
  const [productQuery, setProductQuery] = useState('');
  const [tagsInput,setTagsInput] = useState('');
  const [productStatusFilter,setProductStatusFilter]=useState<'all'|'published'|'draft'|'outofstock'>('all');
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  // Bulk product selection/actions: supports selecting the whole filtered catalog (including 100+ products).
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [catalogLoadError, setCatalogLoadError] = useState('');
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/admin/products', { credentials: 'same-origin' })
      .then(async r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(items => { if (Array.isArray(items)) setAdminProducts(items); })
      .catch(err => { console.error('Admin catalog load error',err); setCatalogLoadError('Catalogue administrateur indisponible'); });
  }, [isAuthenticated]);


  // Editing Product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  // Ensure the editor is visible after selecting Add/Edit from a long catalog list.
  useEffect(()=>{
    if(activeTab!=='products'||(!isAddingProduct&&!editingProduct))return;
    const frame=window.requestAnimationFrame(()=>{
      document.getElementById('gb-product-editor')?.scrollIntoView({
        behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
        block:'start'
      });
    });
    return ()=>window.cancelAnimationFrame(frame);
  },[activeTab,isAddingProduct,editingProduct?.id]);

  const [productForm, setProductForm] = useState<{
    id: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    price: number;
    originalPrice: number;
    descFr: string;
    descAr: string;
    descEn: string;
    category: string;
    subcategory: string;
    image: string;
    additionalImages: string[];
    inStock: boolean;
    stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
    bestSeller: boolean;
    newArrival: boolean;
    featured: boolean;
    isActive: boolean;
    fallbackImage: string;
    fallbackImages: string[];
    featuresFr: string[];
    featuresAr: string[];
    featuresEn: string[];
    tags: string[];
    sku: string;
    barcode: string;
    seoTitle: string;
    seoDescription: string;
    needsSupplierVerification: boolean;
    imageRightsConfirmed: boolean;
    readyToPublish: boolean;
    sourceUrl: string;
    supplier: string;
    dimensionLength: number;
    dimensionWidth: number;
    dimensionHeight: number;
    dimensionUnit: 'mm' | 'cm' | 'm';
    weight: number;
    weightUnit: 'g' | 'kg';
    colorsInput: string;
    sizesInput: string;
    brand: string;
    model: string;
    material: string;
    capacity: string;
    power: string;
    voltage: string;
    compatibility: string;
    gender: string;
    ageGroup: string;
    pattern: string;
    style: string;
    packageContents: string;
    warranty: string;
    customAttributesText: string;
  }>({
    id: '',
    nameFr: '',
    nameAr: '',
    nameEn: '',
    price: 0,
    originalPrice: 0,
    descFr: '',
    descAr: '',
    descEn: '',
    category: 'maison',
    subcategory: '',
    image: '',
    additionalImages: [],
    inStock: true,
    stockStatus: 'in_stock',
    bestSeller: false,
    newArrival: false,
    featured: false,
    isActive: true,
    fallbackImage: '',
    fallbackImages: [],
    featuresFr: [],
    featuresAr: [],
    featuresEn: [],
    tags: [],sku: '',barcode: '',seoTitle: '',seoDescription: '',
    needsSupplierVerification:false,imageRightsConfirmed:false,readyToPublish:false,sourceUrl:'',supplier:'',
    dimensionLength:0,dimensionWidth:0,dimensionHeight:0,dimensionUnit:'cm',weight:0,weightUnit:'g',
    colorsInput:'',sizesInput:'',brand:'',model:'',material:'',capacity:'',power:'',voltage:'',compatibility:'',gender:'',ageGroup:'',pattern:'',style:'',packageContents:'',warranty:'',customAttributesText:'',
  });

  // Persist before updating the visible order; never report an unsaved state as successful.
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);

    } catch (err) {
      console.error('[GLOBABOX] Order status could not be saved', err);
      alert("La modification n'a pas été enregistrée. Veuillez actualiser les commandes.");
      setRefreshError("Modification non enregistrée sur le serveur");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const order=orders.find(item=>item.id===orderId);
    if(!order || order.status==='cancelled')return;
    if(!window.confirm('Annuler cette commande ? La commande et son historique resteront enregistrés dans D1.'))return;
    await handleUpdateOrderStatus(orderId,'cancelled');
  };

  // Export complete order records for spreadsheet use (Excel-compatible CSV).
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("Aucune commande visible dans l’Admin à exporter.");
      return;
    }
    const headers = [
      "ID Commande", "Référence", "Date commande", "Dernière mise à jour", "Statut",
      "Nom complet", "Téléphone", "Ville", "Adresse", "Notes client",
      "Produits commandés", "Sous-total (DH)", "Livraison (DH)", "Livraison gratuite",
      "Total final (DH)", "Mode de paiement", "Transporteur", "Numéro de suivi", "Note livraison"
    ];
    const csvCell = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      return '"' + text.replace(/"/g, '""') + '"';
    };
    const rows = orders.map(order => {
      const items = Array.isArray(order.items)
        ? order.items.map(item => `${item.productName} (x${item.quantity})`).join(' + ')
        : '';
      const subtotal = order.subtotal !== undefined
        ? order.subtotal
        : (order.total >= 500 ? order.total : Math.max(0, order.total - 35));
      const shippingCost = order.shippingCost !== undefined
        ? order.shippingCost
        : (order.total >= 500 ? 0 : 35);
      const freeShipping = order.freeShipping !== undefined
        ? order.freeShipping
        : order.total >= 500;
      return [
        order.id, order.reference, order.createdAt || order.date, order.shipping?.updatedAt || '',
        order.status, order.fullName, order.phoneNumber, order.city, order.deliveryAddress,
        order.notes, items, subtotal, shippingCost, freeShipping ? 'Oui' : 'Non',
        order.finalTotal ?? order.total, order.paymentMethod || '',
        order.shipping?.carrier || '', order.shipping?.trackingNumber || '',
        order.shipping?.internalNote || ''
      ].map(csvCell);
    });
    const csvContent = "\uFEFF" + [headers.map(csvCell).join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `globabox_commandes_completes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to parse complex CSV cells keeping quotes / commas separated correctly
  const parseCSVRow = (text: string): string[] => {
    const result: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cell += '"';
          i++; // Skip second quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cell);
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell);
    return result;
  };

  // Export the current admin product catalogue to a real Excel workbook.
  const exportProductsToExcel = () => {
    if (adminProducts.length === 0) {
      alert("Aucun produit à exporter.");
      return;
    }
    const rows = adminProducts.map(p => ({
      "ID": p.id,
      "Nom FR": p.name?.fr || "",
      "Nom AR": p.name?.ar || "",
      "Nom EN": p.name?.en || "",
      "Prix": p.price ?? "",
      "Ancien Prix": p.originalPrice ?? "",
      "Categorie": p.category || "",
      "Sous-categorie": p.subcategory || "",
      "Image Principale": p.image || "",
      "Images Galerie": (p.additionalImages || []).join(";"),
      "Etat Stock": p.stockStatus || (p.inStock ? "in_stock" : "out_of_stock"),
      "Meilleure Vente": p.bestSeller ? "TRUE" : "FALSE",
      "Nouveaute": p.newArrival ? "TRUE" : "FALSE",
      "En Vedette": p.featured ? "TRUE" : "FALSE",
      "Publie": p.isActive === true ? "TRUE" : "FALSE",
      "SKU": p.sku || "",
      "Code-barres": p.barcode || "",
      "Tags": (p.tags || []).join(";"),
      "Description FR": p.description?.fr || "",
      "Description AR": p.description?.ar || "",
      "Description EN": p.description?.en || "",
      "Caracteristiques FR": (p.features?.fr || []).join(";"),
      "Caracteristiques AR": (p.features?.ar || []).join(";"),
      "Caracteristiques EN": (p.features?.en || []).join(";"),
      "SEO Titre": p.seoTitle || "",
      "SEO Description": p.seoDescription || ""
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet["!cols"] = Object.keys(rows[0]).map(key => ({ wch: Math.min(38, Math.max(14, key.length + 3)) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Produits");
    XLSX.writeFile(workbook, `globabox_produits_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // Download a workbook template that matches the product export columns.
  const downloadProductsExcelTemplate = () => {
    const headers = ["ID","Nom FR","Nom AR","Nom EN","Prix","Ancien Prix","Categorie","Sous-categorie","Image Principale","Images Galerie","Etat Stock","Meilleure Vente","Nouveaute","En Vedette","Publie","SKU","Code-barres","Tags","Description FR","Description AR","Description EN","Caracteristiques FR","Caracteristiques AR","Caracteristiques EN","SEO Titre","SEO Description"];
    const sheet = XLSX.utils.aoa_to_sheet([headers]);
    sheet["!cols"] = headers.map(() => ({ wch: 22 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Produits");
    XLSX.writeFile(workbook, "modele_import_produits_globabox.xlsx");
  };

  // Import Excel rows as unpublished drafts. Existing IDs are never overwritten.
  const importProductsFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
      alert("Choisissez un fichier Excel .xlsx ou .xls.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) { alert("Le fichier Excel ne contient aucune feuille."); return; }
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
        if (!rows.length || rows.length > 200) {
          alert("Le fichier doit contenir entre 1 et 200 lignes de produits.");
          return;
        }
        const value = (row: Record<string, unknown>, key: string) => String(row[key] ?? "").trim();
        const existingIds = new Set(adminProducts.map(product => product.id));
        const seenIds = new Set<string>();
        const parsed: Product[] = [];
        let invalid = 0, duplicate = 0;
        const list = (raw: string) => raw.split(";").map(item => item.trim()).filter(Boolean);
        const truthy = (raw: string) => /^(true|1|oui|yes)$/i.test(raw);

        for (const row of rows) {
          const id = value(row, "ID");
          const nameFr = value(row, "Nom FR");
          const price = Number(value(row, "Prix").replace(",", "."));
          const category = value(row, "Categorie");
          const image = value(row, "Image Principale");
          if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) || !nameFr ||
              !Number.isFinite(price) || price <= 0 || !category ||
              (image && !image.toLowerCase().startsWith("https://"))) {
            invalid++;
            continue;
          }
          if (existingIds.has(id) || seenIds.has(id)) {
            duplicate++;
            continue;
          }
          seenIds.add(id);
          const gallery = list(value(row, "Images Galerie")).filter(url => url.toLowerCase().startsWith("https://"));
          const rawStock = value(row, "Etat Stock");
          const stockStatus = (["in_stock","out_of_stock","limited"].includes(rawStock) ? rawStock : "in_stock") as Product["stockStatus"];
          const descFr = value(row, "Description FR");
          const descAr = value(row, "Description AR") || descFr;
          const descEn = value(row, "Description EN") || descFr;
          const originalPriceValue = Number(value(row, "Ancien Prix").replace(",", "."));
          parsed.push({
            id,
            name: { fr: nameFr, ar: value(row, "Nom AR") || nameFr, en: value(row, "Nom EN") || nameFr },
            price,
            ...(Number.isFinite(originalPriceValue) && originalPriceValue > 0 ? { originalPrice: originalPriceValue } : {}),
            category,
            subcategory: value(row, "Sous-categorie"),
            image,
            images: [image, ...gallery].filter(Boolean),
            additionalImages: gallery,
            inStock: stockStatus !== "out_of_stock",
            stockStatus,
            bestSeller: truthy(value(row, "Meilleure Vente")),
            newArrival: truthy(value(row, "Nouveaute")),
            featured: truthy(value(row, "En Vedette")),
            description: { fr: descFr, ar: descAr, en: descEn },
            features: {
              fr: list(value(row, "Caracteristiques FR")),
              ar: list(value(row, "Caracteristiques AR")),
              en: list(value(row, "Caracteristiques EN"))
            },
            tags: list(value(row, "Tags")),
            sku: value(row, "SKU"),
            barcode: value(row, "Code-barres"),
            seoTitle: value(row, "SEO Titre"),
            seoDescription: value(row, "SEO Description"),
            rating: 0,
            reviewsCount: 0,
            isActive: false
          } as Product);
        }

        if (!parsed.length) {
          alert("Aucun produit valide. Vérifiez les colonnes ID, Nom FR, Prix et Categorie. Les identifiants déjà présents sont ignorés.");
          return;
        }
        if (!window.confirm("Importer " + parsed.length + " produit(s) comme BROUILLON(S) dans D1 ? Aucun produit ne sera publié ni remplacé.")) return;

        let created = 0, failed = 0;
        for (const product of parsed) {
          try {
            const response = await fetch("/api/products", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...product, isActive: false, visibilityChanged: false })
            });
            if (response.ok) created++;
            else if (response.status === 409) duplicate++;
            else failed++;
          } catch { failed++; }
        }
        const refreshed = await fetch("/api/admin/products", { credentials: "same-origin", cache: "no-store" });
        if (refreshed.ok) {
          const latest = await refreshed.json();
          if (Array.isArray(latest)) setAdminProducts(latest);
        }
        alert("Import terminé : " + created + " brouillon(s) enregistré(s), " + duplicate + " doublon(s) ignoré(s), " + (invalid + failed) + " ligne(s) invalide(s) ou rejetée(s).");
      } catch (error) {
        console.error("[GLOBABOX] Excel import failed", error);
        alert("Impossible de lire le fichier Excel. Utilisez le modèle GLOBABOX.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export products as JSON backup
  const exportProductsToJSON = () => {
    if (adminProducts.length === 0) {
      alert("Aucun produit à exporter.");
      return;
    }
    const dataStr = JSON.stringify(adminProducts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `globabox_products_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON into Cloudflare D1 as DRAFTS. Never show success for a
  // browser-only write or silently overwrite live products.
  const importProductsFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const parsed: unknown = JSON.parse(String(event.target?.result || ''));
        if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 200) {
          alert('Le fichier JSON doit contenir 1 à 200 produits.'); return;
        }
        const valid = parsed.every((p: any) =>
          p && typeof p.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(p.id) &&
          typeof p.name?.fr === 'string' && !!p.name.fr.trim() &&
          typeof p.price === 'number' && Number.isFinite(p.price) && p.price > 0 &&
          typeof p.category === 'string' && !!p.category.trim() &&
          typeof p.image === 'string' && (p.image === '' || /^https:\/\//.test(p.image)) &&
          p.isActive !== true);
        if (!valid) {
          alert('Import de brouillons uniquement : identifiant, nom français, prix indicatif et catégorie requis. Image facultative tant que la fiche n’est pas publiée.');
          return;
        }
        if (!window.confirm('Importer ' + parsed.length + ' BROUILLON(S) dans D1 ? Les prix et les stocks doivent être vérifiés avant publication. Les photos manquantes restent à ajouter.')) return;
        let saved = 0, failed = 0;
        for (const p of parsed) {
          try {
            const response = await fetch('/api/products', {
              method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
              body:JSON.stringify({...p,isActive:false,visibilityChanged:false})
            });
            if (response.ok) saved++; else failed++;
          } catch { failed++; }
        }
        const reload = await fetch('/api/admin/products', {credentials:'same-origin'});
        if (reload.ok) {
          const newProducts: unknown = await reload.json();
          if (Array.isArray(newProducts)) setAdminProducts(newProducts as Product[]);
        }
        alert('Import D1 terminé : ' + saved + ' brouillon(s) enregistré(s), ' + failed + ' ignoré(s)/rejeté(s).');
      } catch {
        alert('Erreur de lecture du fichier JSON ou d’accès à la base D1.');
      }
    };
    reader.readAsText(file);
  };



  // Export products as CSV backup
  const exportProductsToCSV = () => {
    if (adminProducts.length === 0) {
      alert("Aucun produit à exporter.");
      return;
    }

    const headers = [
      "ID",
      "Nom FR",
      "Nom AR",
      "Nom EN",
      "Prix",
      "Ancien Prix",
      "Categorie",
      "Image Principale",
      "Images Galerie",
      "Etat Stock",
      "Meilleure Vente",
      "Nouveaute",
      "En Vedette",
      "Description FR",
      "Description AR",
      "Description EN"
    ];

    const rows = adminProducts.map(p => {
      const cleanFieldName = (txt: string) => `"${(txt || '').replace(/"/g, '""').trim()}"`;
      
      const id = cleanFieldName(p.id);
      const nameFr = cleanFieldName(p.name?.fr || '');
      const nameAr = cleanFieldName(p.name?.ar || '');
      const nameEn = cleanFieldName(p.name?.en || '');
      const price = p.price || 0;
      const originalPrice = p.originalPrice || '';
      const category = cleanFieldName(p.category || '');
      const image = cleanFieldName(p.image || '');
      const gallery = cleanFieldName((p.additionalImages || []).join(';'));
      const stockStatus = cleanFieldName(p.stockStatus || (p.inStock ? 'in_stock' : 'out_of_stock'));
      const best = p.bestSeller ? "TRUE" : "FALSE";
      const news = p.newArrival ? "TRUE" : "FALSE";
      const feat = p.featured ? "TRUE" : "FALSE";
      const descFr = cleanFieldName(p.description?.fr || '');
      const descAr = cleanFieldName(p.description?.ar || '');
      const descEn = cleanFieldName(p.description?.en || '');

      return [
        id,
        nameFr,
        nameAr,
        nameEn,
        price,
        originalPrice,
        category,
        image,
        gallery,
        stockStatus,
        best,
        news,
        feat,
        descFr,
        descAr,
        descEn
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(line => line.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `globabox_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import products from CSV backup
  const importProductsFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines: string[] = [];
        let currentLine = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
              currentLine += '""';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === '\n' && !inQuotes) {
            lines.push(currentLine);
            currentLine = '';
          } else if (char !== '\r') {
            currentLine += char;
          }
        }
        if (currentLine) lines.push(currentLine);

        if (lines.length < 2) {
          alert("Le fichier CSV est vide ou invalide.");
          return;
        }

        const headersRow = parseCSVRow(lines[0].replace(/^\uFEFF/, ''));
        const headerIndices: Record<string, number> = {};
        headersRow.forEach((h, idx) => {
          headerIndices[h.trim()] = idx;
        });

        const requiredHeaders = ["ID", "Nom FR", "Prix", "Categorie", "Image Principale"];
        const missing = requiredHeaders.filter(h => headerIndices[h] === undefined);
        if (missing.length > 0) {
          alert(`Erreur de format : En-têtes obligatoires manquants : ${missing.join(', ')}`);
          return;
        }

        const parsedProducts: Product[] = [];
        for (let r = 1; r < lines.length; r++) {
          const rowText = lines[r].trim();
          if (!rowText) continue;
          const cells = parseCSVRow(rowText);
          
          const valOf = (header: string, fallback: string = ''): string => {
            const idx = headerIndices[header];
            return idx !== undefined && idx < cells.length ? cells[idx].trim() : fallback;
          };

          const id = valOf("ID");
          const nameFr = valOf("Nom FR");
          const priceStr = valOf("Prix");
          const category = valOf("Categorie");
          const image = valOf("Image Principale");

          if (!id || !nameFr || !priceStr || !category || !image) {
            continue;
          }

          const galleryStr = valOf("Images Galerie");
          const gallery = galleryStr ? galleryStr.split(';').map(u => u.trim()).filter(Boolean) : [];
          
          const oldPriceStr = valOf("Ancien Prix");
          const originalPrice = oldPriceStr ? Number(oldPriceStr) : undefined;
          
          const stockStatus = valOf("Etat Stock", "in_stock") as any;
          const bestSeller = valOf("Meilleure Vente").toUpperCase() === "TRUE";
          const newArrival = valOf("Nouveaute").toUpperCase() === "TRUE";
          const featured = valOf("En Vedette").toUpperCase() === "TRUE";

          const descFr = valOf("Description FR");
          const descAr = valOf("Description AR");
          const descEn = valOf("Description EN");

          const nameAr = valOf("Nom AR");
          const nameEn = valOf("Nom EN");

          const product: Product = {
            id,
            name: {
              fr: nameFr,
              ar: nameAr || nameFr,
              en: nameEn || nameFr
            },
            price: Number(priceStr),
            originalPrice,
            category,
            image,
            images: [image, ...gallery].filter(Boolean),
            additionalImages: gallery,
            inStock: stockStatus !== 'out_of_stock',
            stockStatus,
            bestSeller,
            newArrival,
            featured,
            description: {
              fr: descFr,
              ar: descAr || descFr,
              en: descEn || descFr
            },
            features: {
              fr: ['Haute qualité', 'Robuste & Durable'],
              ar: ['جودة عالية', 'مقاوم للاستخدام'],
              en: ['Premium Quality', 'Durable Outdoor gear']
            },
            rating: 4.5,
            reviewsCount: 15
          };

          parsedProducts.push(product);
        }

        if (parsedProducts.length === 0) {
          alert("Aucun produit valide trouvé dans le fichier CSV.");
          return;
        }

        if (window.confirm(`Importer ${parsedProducts.length} produits comme BROUILLONS dans la base D1 ?`)) {
          // Import into the server database, never localStorage-only, and never publish automatically.
          let created = 0, failed = 0;
          for (const product of parsedProducts) {
            if (!Number.isFinite(product.price) || product.price <= 0 ||
                !/^https:\/\//.test(product.image) || !/^[a-zA-Z0-9_-]{1,100}$/.test(product.id)) {
              failed++;
              continue;
            }
            try {
              const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ ...product, isActive: false })
              });
              if (!response.ok) { failed++; continue; }
              created++;
            } catch { failed++; }
          }
          const refreshed = await fetch('/api/admin/products', { credentials: 'same-origin' });
          if (refreshed.ok) {
            const all = await refreshed.json();
            if (Array.isArray(all)) setAdminProducts(all);
          }
          alert(`Import D1 terminé : ${created} brouillons créés, ${failed} rejetés. Aucun produit publié.`);
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la lecture du fichier CSV.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const [mediaUploading,setMediaUploading]=useState(false);
  const fillCamelDraft=()=>{
    setEditingProduct(null);
    setProductForm({
      id:'camel-electron-40',nameFr:'CAMEL ELECTRON 40 – Sac à dos Trekking 40L',
      nameAr:'حقيبة ظهر CAMEL ELECTRON 40 للرحلات – 40 لتر',
      nameEn:'CAMEL ELECTRON 40 – 40L Trekking Backpack',
      price:329,originalPrice:399,category:'sacs_trekking',
      descFr:'Sac à dos polyvalent de 40 L pour la randonnée, le voyage et le quotidien. Plusieurs compartiments, bretelles rembourrées réglables et dos ventilé. Bleu et orange. Accessoires illustratifs non inclus.',
      descAr:'حقيبة ظهر بسعة 40 لتر للتخييم والسفر والرحلات. جيوب متعددة وأحزمة كتف مبطنة وقابلة للتعديل وظهر شبكي للتهوية. اللون أزرق وبرتقالي. الإكسسوارات الظاهرة في الصور للتوضيح فقط.',
      descEn:'Versatile 40 L trekking backpack with multiple compartments, padded adjustable straps and breathable mesh back. Blue and orange. Photo props not included.',
      featuresFr:['Capacité annoncée 40 L','Poches multiples','Bretelles réglables et rembourrées','Dos en maille respirante'],
      featuresAr:['السعة المعلنة 40 لتر','جيوب متعددة','أحزمة مبطنة قابلة للتعديل','ظهر شبكي للتهوية'],
      featuresEn:['Advertised capacity 40 L','Multiple pockets','Adjustable padded straps','Breathable mesh back'],
      image:'',additionalImages:[],fallbackImage:'',fallbackImages:[],inStock:false,stockStatus:'out_of_stock',
      bestSeller:false,newArrival:false,featured:false,isActive:false,
      tags:[],sku:'',barcode:'',seoTitle:'',seoDescription:''
    });
    setIsAddingProduct(true);
  };
  const uploadProductPhotos=async (files:FileList|null)=>{
    if(!files?.length)return;
    setMediaUploading(true);
    const urls:string[]=[];
    try{
      for(const file of Array.from(files).slice(0,8)){
        if(!['image/webp','image/jpeg','image/png'].includes(file.type)||file.size>750000)
          throw new Error('Choisissez JPG, PNG ou WebP sous 750 Ko.');
        const response=await fetch('/api/admin/media',{method:'POST',credentials:'same-origin',
          headers:{'Content-Type':file.type},body:file});
        if(!response.ok)throw new Error('Upload refusé : HTTP '+response.status);
        const data:any=await response.json();
        if(typeof data?.url!=='string')throw new Error('Réponse image invalide');
        urls.push(data.url);
      }
      setProductForm(current=>({...current,image:current.image||urls[0],
        additionalImages:[...current.additionalImages,...urls.slice(current.image?0:1)]}));
      alert(urls.length+' photo(s) téléchargée(s) sur D1.');
    }catch(err){alert(err instanceof Error?err.message:'Erreur téléchargement');}
    finally{setMediaUploading(false);}
  };
  // Initiate Product Create
  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setTagsInput('');
    setProductForm({
      id: `prod-${Date.now()}`,
      nameFr: '',
      nameAr: '',
      nameEn: '',
      price: 0,
      originalPrice: 0,
      descFr: '',
      descAr: '',
      descEn: '',
      category: categories.find(c=>isPublicStoreCategory(c.id))?.id || STORE_DEPARTMENTS[0].id,
      subcategory: '',
      image: '',
      additionalImages: [],
      inStock: false,
      stockStatus: 'out_of_stock',
      bestSeller: false,
      newArrival: false,
      featured: false,
      isActive: false,
      fallbackImage: '',
      fallbackImages: [],
      featuresFr: [],
      featuresAr: [],
      featuresEn: [],
      tags: [],sku:'',barcode:'',seoTitle:'',seoDescription:'',
      needsSupplierVerification:false,imageRightsConfirmed:false,readyToPublish:false,sourceUrl:'',supplier:'',
      dimensionLength:0,dimensionWidth:0,dimensionHeight:0,dimensionUnit:'cm',weight:0,weightUnit:'g',
    });
    setIsAddingProduct(true);
  };

  // Initiate Product Edit
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setTagsInput((prod.tags || []).join(', '));
    setProductForm({
      id: prod.id,
      nameFr: prod.name.fr || '',
      nameAr: prod.name.ar || '',
      nameEn: prod.name.en || '',
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      descFr: prod.description.fr || '',
      descAr: prod.description.ar || '',
      descEn: prod.description.en || '',
      category: prod.category,
      subcategory: prod.subcategory || '',
      image: prod.image,
      additionalImages: prod.additionalImages || [],
      inStock: prod.inStock,
      stockStatus: prod.stockStatus || (prod.inStock ? 'in_stock' : 'out_of_stock'),
      bestSeller: !!prod.bestSeller,
      newArrival: !!prod.newArrival,
      featured: !!prod.featured,
      isActive: prod.isActive === true,
      fallbackImage: prod.fallbackImage || '',
      fallbackImages: prod.fallbackImages || [],
      featuresFr: prod.features?.fr || [],
      featuresAr: prod.features?.ar || [],
      featuresEn: prod.features?.en || [],
      tags:prod.tags || [],sku:prod.sku || '',barcode:prod.barcode || '',
      seoTitle:prod.seoTitle || '',seoDescription:prod.seoDescription || '',
      needsSupplierVerification:prod.needsSupplierVerification === true,
      imageRightsConfirmed:prod.imageRightsConfirmed === true,
      readyToPublish:prod.readyToPublish === true,
      sourceUrl:prod.sourceUrl || '',supplier:prod.supplier || '',
      dimensionLength:prod.dimensions?.length || 0,
      dimensionWidth:prod.dimensions?.width || 0,
      dimensionHeight:prod.dimensions?.height || 0,
      dimensionUnit:prod.dimensions?.unit || 'cm',
      weight:prod.dimensions?.weight || 0,
      weightUnit:prod.dimensions?.weightUnit || 'g',
      colorsInput:(prod.colors||[]).join(', '),sizesInput:(prod.sizes||[]).join(', '),
      brand:prod.brand||'',model:prod.model||'',material:prod.material||'',capacity:prod.capacity||'',power:prod.power||'',voltage:prod.voltage||'',compatibility:prod.compatibility||'',gender:prod.gender||'',ageGroup:prod.ageGroup||'',pattern:prod.pattern||'',style:prod.style||'',packageContents:prod.packageContents||'',warranty:prod.warranty||'',
      customAttributesText:Object.entries(prod.attributes||{}).map(([key,value])=>key+' = '+value).join('\n'),
    });
    setIsAddingProduct(false);
  };

  // Save/Update Product details
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // REQUIREMENT 9: Strict Validation
    if (!productForm.id.trim()) {
      alert("L'identifiant (Product ID / slug) est obligatoire.");
      return;
    }
    if (!productForm.nameFr.trim()) {
      alert("Le nom du produit en français est obligatoire.");
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      alert("Le prix du produit est obligatoire et doit être supérieur à zéro.");
      return;
    }
    if (!productForm.category.trim()) {
      alert("La catégorie du produit est obligatoire.");
      return;
    }
    if (!productForm.image.trim() && (productForm.isActive || !editingProduct)) {
      alert("L'image principale est obligatoire pour publier une fiche ou créer un produit classique. Les produits sourcés peuvent rester en brouillon sans photo.");
      return;
    }
    if (editingProduct?.id.startsWith('gb_source_') && productForm.isActive) {
      const gallery=new Set([productForm.image,...productForm.additionalImages].filter(url=>/^https:\/\//.test(url)));
      if(productForm.needsSupplierVerification || !productForm.imageRightsConfirmed ||
        !productForm.readyToPublish || !productForm.supplier.trim() ||
        productForm.stockStatus==='out_of_stock' || gallery.size < 6){
        alert('Publication impossible : fournisseur, stock, prix, droits des images et 6 photos distinctes doivent être confirmés.');
        return;
      }
    }

    const transformedProduct: Product = {
      id: productForm.id.trim(),
      name: {
        fr: productForm.nameFr.trim(),
        ar: productForm.nameAr.trim() || productForm.nameFr.trim(),
        en: productForm.nameEn.trim() || productForm.nameFr.trim(),
      },
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      description: {
        fr: productForm.descFr.trim(),
        ar: productForm.descAr.trim() || productForm.descFr.trim(),
        en: productForm.descEn.trim() || productForm.descFr.trim(),
      },
      features: {
        fr: productForm.featuresFr,
        ar: productForm.featuresAr,
        en: productForm.featuresEn,
      },
      category: productForm.category,
      subcategory: productForm.subcategory || undefined,
      tags:Array.from(new Set<string>(tagsInput.split(',').map((tag:string)=>tag.trim()).filter(Boolean))).slice(0,30),
      sku:productForm.sku.trim() || undefined,
      barcode:productForm.barcode.trim() || undefined,
      seoTitle:productForm.seoTitle.trim() || undefined,
      seoDescription:productForm.seoDescription.trim() || undefined,
      needsSupplierVerification:productForm.needsSupplierVerification,
      imageRightsConfirmed:productForm.imageRightsConfirmed,
      readyToPublish:productForm.readyToPublish,
      sourceUrl:productForm.sourceUrl.trim() || undefined,
      supplier:productForm.supplier.trim() || undefined,
      sizes:productForm.sizesInput.split(',').map((v:string)=>v.trim()).filter(Boolean),
      colors:productForm.colorsInput.split(',').map((v:string)=>v.trim()).filter(Boolean),
      brand:productForm.brand.trim()||undefined,model:productForm.model.trim()||undefined,material:productForm.material.trim()||undefined,
      capacity:productForm.capacity.trim()||undefined,power:productForm.power.trim()||undefined,voltage:productForm.voltage.trim()||undefined,
      compatibility:productForm.compatibility.trim()||undefined,gender:productForm.gender.trim()||undefined,ageGroup:productForm.ageGroup.trim()||undefined,
      pattern:productForm.pattern.trim()||undefined,style:productForm.style.trim()||undefined,packageContents:productForm.packageContents.trim()||undefined,warranty:productForm.warranty.trim()||undefined,
      attributes:(()=>{const entries=productForm.customAttributesText.split(/\\r?\\n/).map((line:string)=>{const split=line.indexOf('=');return split>0?[line.slice(0,split).trim(),line.slice(split+1).trim()] as const:null;}).filter((entry:any)=>entry&&entry[0]&&entry[1]);return entries.length?Object.fromEntries(entries):undefined;})(),
      dimensions: (productForm.dimensionLength>0 || productForm.dimensionWidth>0 || productForm.dimensionHeight>0 || productForm.weight>0) ? {
        ...(productForm.dimensionLength>0?{length:Number(productForm.dimensionLength)}:{}),
        ...(productForm.dimensionWidth>0?{width:Number(productForm.dimensionWidth)}:{}),
        ...(productForm.dimensionHeight>0?{height:Number(productForm.dimensionHeight)}:{}),
        unit:productForm.dimensionUnit,
        ...(productForm.weight>0?{weight:Number(productForm.weight)}:{}),
        weightUnit:productForm.weightUnit,
      } : undefined,
      image: productForm.image.trim(),
      images: [productForm.image.trim(), ...(productForm.additionalImages || [])].filter(Boolean),
      fallbackImage: productForm.fallbackImage || '',
      fallbackImages: productForm.fallbackImages || [],
      additionalImages: productForm.additionalImages || [],
      rating: editingProduct ? editingProduct.rating : 0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      inStock: productForm.stockStatus !== 'out_of_stock',
      stockStatus: productForm.stockStatus,
      bestSeller: productForm.bestSeller,
      newArrival: productForm.newArrival,
      featured: productForm.featured,
      isActive: editingProduct ? productForm.isActive : false,
      visibilityChanged: editingProduct ? productForm.isActive !== (editingProduct.isActive === true) : true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    if (editingProduct) {
      // Edit
      fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedProduct)
      })
      .then(res => {
        if (!res.ok) throw new Error("Erreur de mise à jour");
        return res.json();
      })
      .then((data: unknown) => {
        if (!data || typeof data !== 'object' || !('product' in data) || !data.product || typeof data.product !== 'object') throw new Error('Réponse de produit invalide');
        const updatedProduct = data.product as Product;
        setProducts(current => {
          const without = current.filter(p => p.id !== editingProduct.id);
          return updatedProduct.isActive !== false ? [updatedProduct, ...without] : without;
        });
        setAdminProducts(current => current.map(p => p.id === editingProduct.id ? updatedProduct : p));
        setEditingProduct(null);
        setIsAddingProduct(false);
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de la mise à jour du produit.");
      });
    } else {
      // Add new
      const isDuplicate = products.some(p => p.id === transformedProduct.id);
      if (isDuplicate) {
        alert("Un produit avec cet identifiant unique (ID / slug) existe déjà !");
        return;
      }

      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedProduct)
      })
      .then(res => {
        if (!res.ok) throw new Error("Erreur de création");
        return res.json();
      })
      .then((data: unknown) => {
        if (!data || typeof data !== 'object' || !('product' in data) || !data.product || typeof data.product !== 'object') throw new Error('Réponse de produit invalide');
        const updatedProduct = data.product as Product;
        // Newly created products are Draft in D1: never expose them on storefront state.
        if (updatedProduct.isActive === true) setProducts(current => [updatedProduct, ...current]);
        setAdminProducts(current => [updatedProduct, ...current]);
        setEditingProduct(null);
        setIsAddingProduct(false);
      })
      .catch(err => {
        console.error(err);
        alert("Erreur lors de la création du produit.");
      });
    }
  };

  // Bulk order selection/actions
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(current => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleSelectAllVisibleOrders = () => {
    setSelectedOrderIds(current => {
      const next = new Set(current);
      const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => next.has(o.id));
      if (allSelected) filteredOrders.forEach(o => next.delete(o.id));
      else filteredOrders.forEach(o => next.add(o.id));
      return next;
    });
  };

  const clearOrderSelection = () => setSelectedOrderIds(new Set());

  const handleBulkConfirmOrders = async () => {
    const ids: string[] = Array.from(selectedOrderIds);
    if (!ids.length) return;
    if (!window.confirm(`Confirmer ${ids.length} commande(s) sélectionnée(s) ?`)) return;

    let confirmed = 0, failed = 0;
    for (const id of ids) {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ status: 'confirmed' })
        });
        if (!response.ok) throw new Error('Confirm failed');
        confirmed++;
      } catch {
        failed++;
      }
    }

    setOrders(current => current.map(order => ids.includes(order.id) ? { ...order, status: 'confirmed' } : order));
    setSelectedOrderIds(new Set());
    setRefreshSuccess(`Confirmation terminée : ${confirmed} commande(s) confirmée(s), ${failed} échec(s).`);
    if (failed) setRefreshError(`${failed} commande(s) n'ont pas pu être confirmée(s).`);
  };

  const handleBulkDeleteOrders = async () => {
    const ids: string[] = Array.from(selectedOrderIds);
    if (!ids.length) return;
    if (!window.confirm(`Masquer ${ids.length} commande(s) sélectionnée(s) de l’Admin ? Les commandes resteront conservées dans D1 et pourront être récupérées.`)) return;

    let deleted = 0, failed = 0;
    for (const id of ids) {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'same-origin'
        });
        if (!response.ok) throw new Error('Delete failed');
        deleted++;
      } catch {
        failed++;
      }
    }

    setOrders(current => current.filter(order => !ids.includes(order.id)));
    setSelectedOrderIds(new Set());
    setRefreshSuccess(`Masquage terminé : ${deleted} commande(s) retirée(s) de l’Admin, ${failed} échec(s).`);
    if (failed) setRefreshError(`${failed} commande(s) n'ont pas pu être masquées.`);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Voulez-vous vraiment retirer ce produit du catalogue ?')) {
      fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) throw new Error("Erreur de suppression");
        const updated = products.filter(p => p.id !== productId);
        setAdminProducts(current => current.filter(p => p.id !== productId));
        setProducts(updated);
        // D1 is authoritative; no browser-only product cache.
      })
      .catch(err => {
        console.error(err);
        alert("Erreur de suppression du produit.");
      });
    }
  };

  // Bulk product selection/actions
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(current => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAllVisibleProducts = () => {
    setSelectedProductIds(current => {
      const next = new Set(current);
      const allSelected = filteredProductsList.length > 0 && filteredProductsList.every(p => next.has(p.id));
      if (allSelected) {
        filteredProductsList.forEach(p => next.delete(p.id));
      } else {
        filteredProductsList.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  const clearProductSelection = () => setSelectedProductIds(new Set());

  const handleBulkDeleteProducts = async () => {
    const ids = Array.from(selectedProductIds);
    if (!ids.length) return;
    if (!window.confirm(`Masquer ${ids.length} produit(s) sélectionné(s) de l’Admin ? Ils restent conservés dans D1 et ne seront plus affichés après actualisation.`)) return;

    let deleted = 0, failed = 0;
    for (const id of ids) {
      try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'same-origin' });
        if (!response.ok) throw new Error('Delete failed');
        deleted++;
      } catch {
        failed++;
      }
    }

    setAdminProducts(current => current.filter(p => !ids.includes(p.id)));
    setProducts(current => current.filter(p => !ids.includes(p.id)));
    setSelectedProductIds(new Set());
    alert(`Masquage terminé : ${deleted} produit(s) retiré(s) de l’Admin, ${failed} échec(s).`);
  };

  const handleBulkPublishProducts = async () => {
    const ids = Array.from(selectedProductIds);
    if (!ids.length) return;
    if (!window.confirm(`Confirmer et publier ${ids.length} produit(s) sélectionné(s) sur la boutique ?`)) return;

    let published = 0, failed = 0;
    const selectedProducts = adminProducts.filter(p => ids.includes(p.id));
    for (const product of selectedProducts) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...product,
            isActive: true,
            visibilityChanged: product.isActive !== true
          })
        });
        if (!response.ok) throw new Error('Publish failed');
        const data: any = await response.json();
        if (!data?.product) throw new Error('Invalid product response');
        published++;
      } catch {
        failed++;
      }
    }

    const refreshed = await fetch('/api/admin/products', { credentials: 'same-origin' });
    if (refreshed.ok) {
      const all = await refreshed.json();
      if (Array.isArray(all)) setAdminProducts(all);
    }
    setSelectedProductIds(new Set());
    alert(`Publication terminée : ${published} produit(s) confirmé(s)/publié(s), ${failed} échec(s).`);
  };

  // Filters calculation
  const filteredOrders = orders.filter(o => {
    // Older/imported orders may not contain every customer field. Keep the
    // administration workspace navigable even when legacy records are partial.
    const query = orderQuery.trim().toLocaleLowerCase();
    const searchable = [
      o.fullName, o.phoneNumber, o.id, o.reference, o.city,
      o.deliveryAddress
    ].map(value => String(value ?? '').toLocaleLowerCase());
    const matchesQuery = !query || searchable.some(value => value.includes(query));

    let matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    if (orderStatusFilter === 'synced') {
      matchesStatus = o.syncStatus === 'synced';
    } else if (orderStatusFilter === 'failed') {
      matchesStatus = o.syncStatus === 'failed';
    }
    const matchesCity = orderCityFilter === 'all' || o.city === orderCityFilter;

    return matchesQuery && matchesStatus && matchesCity;
  });

  const filteredProductsList = adminProducts.filter(p => {
    const q=productQuery.trim().toLowerCase();
    const matches=!q || [p.id,p.sku,p.name?.fr,p.name?.ar,p.name?.en,p.category,p.subcategory,...(p.tags||[])].some(x=>String(x||'').toLowerCase().includes(q));
    const statusMatches=productStatusFilter==='all' ||
      (productStatusFilter==='published' && p.isActive===true) ||
      (productStatusFilter==='draft' && p.isActive!==true) ||
      (productStatusFilter==='outofstock' && (!p.inStock || p.stockStatus==='out_of_stock'));
    return matches && statusMatches;
  });

  if (authLoading) return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#f4f8f5] text-sm font-bold text-[#104d43]">Vérification de la session administrateur…</div>;
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[80] flex min-h-[100dvh] items-center justify-center bg-[#eef5f0] p-4">
        <div className="relative w-full max-w-[440px] rounded-[25px] border border-[#d2e5d9] bg-white p-6 shadow-[0_20px_65px_rgba(15,58,41,.12)] sm:p-9">
          <button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-[#f1f7f3]"><X size={19}/></button>
          <div className="mb-8 text-center">
            <img src="/brand/globabox-mark.svg" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-sm"/>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[.18em] text-[#38866e]">GLOBABOX · ESPACE SÉCURISÉ</p>
            <h2 className="mt-2 text-2xl font-black text-[#173e34]">Administration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Connectez-vous pour gérer vos produits, commandes et expéditions.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="gb-admin-username" className="mb-2 block text-xs font-extrabold text-[#274c3e]">Identifiant</label>
              <input id="gb-admin-username" type="text" autoComplete="username" required value={usernameInput} onChange={e=>setUsernameInput(e.target.value)}
                placeholder="Nom d’utilisateur" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#173e34] outline-none focus:border-[#104d43] focus:ring-2 focus:ring-[#104d43]/15"/>
            </div>
            <div>
              <label htmlFor="gb-admin-password" className="mb-2 block text-xs font-extrabold text-[#274c3e]">Mot de passe</label>
              <input id="gb-admin-password" type="password" autoComplete="current-password" required value={passwordInput} onChange={e=>setPasswordInput(e.target.value)}
                placeholder="Votre mot de passe" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#173e34] outline-none focus:border-[#104d43] focus:ring-2 focus:ring-[#104d43]/15"/>
            </div>
            {errorMessage&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 font-semibold text-red-700">{errorMessage}</p>}
            <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 text-sm font-extrabold text-white transition hover:bg-[#0b3931]"><ShieldCheck size={18}/>Se connecter</button>
          </form>
          <p className="mt-6 text-center text-xs leading-6 text-slate-500">Accès réservé aux administrateurs autorisés de GLOBABOX.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminWorkspaceLayout
      language={language}
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'products') { setEditingProduct(null); setIsAddingProduct(false); }
      }}
      onClose={onClose}
      onLogout={handleLogout}
      ordersCount={orders.length}
      customersCount={new Set(orders.map(order => String(order.phoneNumber || '').replace(/\s+/g, '') || 'order:' + order.id)).size}
      pendingOrders={statNewOrders}
      productsCount={adminProducts.length}
      categoriesCount={categories.length}
      databaseReady={launchStatus?.databaseReady}
      showProductAction={!isAddingProduct && !editingProduct}
      onNewProduct={() => {handleStartAddProduct();setActiveTab('products');}}
      onPrepareProduct={fillCamelDraft}
      onPendingOrders={() => { setOrderStatusFilter('pending'); setActiveTab('orders'); }}
      onRefreshOrders={handleRefreshOrders}
      isRefreshing={isRefreshing}
    >
      {/* Keep current business screens and permissions, redesign navigation only. */}
      {/* Main panel body */}
      <div className={activeTab === 'categories' ? 'min-h-full bg-[#f3f5f7] p-4 sm:p-5 xl:p-7' : 'min-h-full bg-[#f3f5f7] p-4 text-[#213638] sm:p-5 xl:p-7'}>
        
        {activeTab === 'dashboard' && (
          <AdminDashboardWorkspace
            orders={orders}
            products={adminProducts}
            language={language}
            onOrders={() => setActiveTab('orders')}
            onProducts={() => setActiveTab('products')}
            onNewProduct={() => { handleStartAddProduct(); setActiveTab('products'); }}
            onPendingOrders={() => { setOrderStatusFilter('pending'); setActiveTab('orders'); }}
            onStatusFilter={(status) => { setOrderStatusFilter(status); setActiveTab('orders'); }}
            onRefresh={handleRefreshOrders}
            refreshing={isRefreshing}
          />
        )}

                {/* VIEW 1: Customer orders and manual delivery management */}
        {activeTab === 'orders' && (
          <AdminOrdersWorkspace
            language={language}
            orders={orders}
            filteredOrders={filteredOrders}
            totalOrders={statTotalOrders}
            pendingOrders={statNewOrders}
            processingOrders={statProcessingOrders}
            confirmedOrders={statConfirmedOnly}
            shippedOrders={statShippedOrders}
            orderQuery={orderQuery}
            setOrderQuery={setOrderQuery}
            orderStatusFilter={orderStatusFilter}
            setOrderStatusFilter={setOrderStatusFilter}
            orderCityFilter={orderCityFilter}
            setOrderCityFilter={setOrderCityFilter}
            selectedOrderIds={selectedOrderIds}
            handleBulkConfirmOrders={handleBulkConfirmOrders}
            clearOrderSelection={clearOrderSelection}
            toggleSelectAllVisibleOrders={toggleSelectAllVisibleOrders}
            toggleOrderSelection={toggleOrderSelection}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            handleCancelOrder={handleCancelOrder}
            handleRefreshOrders={handleRefreshOrders}
            exportOrdersToCSV={exportOrdersToCSV}
            isRefreshing={isRefreshing}
            refreshSuccess={refreshSuccess}
            refreshError={refreshError}
            databaseReady={launchStatus?.databaseReady}
            formatMoroccoDate={formatMoroccoDate}
            setOrders={setOrders}
          />
        )}

                {/* VIEW 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <AdminProductsWorkspace
            language={language}
            adminProducts={adminProducts}
            categories={categories}
            filteredProductsList={filteredProductsList}
            selectedProductIds={selectedProductIds}
            productQuery={productQuery}
            setProductQuery={setProductQuery}
            productStatusFilter={productStatusFilter}
            setProductStatusFilter={setProductStatusFilter}
            editingProduct={editingProduct}
            isAddingProduct={isAddingProduct}
            productForm={productForm}
            setProductForm={setProductForm}
            setEditingProduct={setEditingProduct}
            setIsAddingProduct={setIsAddingProduct}
            mediaUploading={mediaUploading}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}
            handleSaveProduct={handleSaveProduct}
            handleStartAddProduct={handleStartAddProduct}
            handleStartEditProduct={handleStartEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleBulkPublishProducts={handleBulkPublishProducts}
            handleBulkDeleteProducts={handleBulkDeleteProducts}
            clearProductSelection={clearProductSelection}
            toggleSelectAllVisibleProducts={toggleSelectAllVisibleProducts}
            toggleProductSelection={toggleProductSelection}
            exportProductsToJSON={exportProductsToJSON}
            exportProductsToCSV={exportProductsToCSV}
            exportProductsToExcel={exportProductsToExcel}
            importProductsFromJSON={importProductsFromJSON}
            importProductsFromCSV={importProductsFromCSV}
            importProductsFromExcel={importProductsFromExcel}
            downloadProductsExcelTemplate={downloadProductsExcelTemplate}
            uploadProductPhotos={uploadProductPhotos}
          />
        )}

                {/* Category CRUD, search, image and D1 persistence. */}
        {activeTab === 'categories' && (
          <AdminCategoriesWorkspace
            categories={categories}
            products={adminProducts}
            onCategoriesChange={setCategories}
          />
        )}

        {activeTab === 'customers' && <AdminCustomersWorkspace orders={orders} language={language} />}

        {activeTab === 'marketing' && <AdminTrackingWorkspace language={language} />}
        {activeTab === 'landing-pages' && <AdminLandingPagesWorkspace language={language} />}


      </div>
    </AdminWorkspaceLayout>
  );
}
