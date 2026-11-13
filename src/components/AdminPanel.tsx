import React, { useEffect, useState } from 'react';
import { Package, ClipboardList, Settings, Plus, Trash2, Edit2, CheckCircle2, RefreshCw, X, Search, ChevronRight, Ban, Truck, ShieldCheck, CornerDownRight, BarChart3, MapPin, Phone, ShoppingCart, BadgeCheck, Compass } from 'lucide-react';
import { Product, Category, Order, Language } from '../types';
import { MOROCCAN_CITIES, ORDER_SUPPORT_NUMBER, WHATSAPP_NUMBER } from '../data';
import AdminTrackingWorkspace from './AdminTrackingWorkspace';
import ProductImage from './ProductImage';
import AdminWorkspaceLayout from './AdminWorkspaceLayout';
import AdminCategoriesWorkspace from './AdminCategoriesWorkspace';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'marketing'>('dashboard');

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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette commande ?')) return;
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE', credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);

    } catch (err) {
      console.error('[GLOBABOX] Order deletion failed', err);
      alert("La commande n'a pas été supprimée sur le serveur.");
    }
  };

  // Export Orders to CSV helper
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("Aucune de vos commandes Globabox n'est disponible pour l'export.");
      return;
    }

    // Prepare headers
    const headers = [
      "ID Commande",
      "Reference",
      "Date",
      "Statut",
      "Nom Complet",
      "Telephone",
      "Ville",
      "Adresse",
      "Notes",
      "Produits Commandes",
      "Sous-total (DH)",
      "Livraison (DH)",
      "Livraison Gratuite",
      "Total Final (DH)"
    ];

    // Build the rows
    const rows = orders.map(order => {
      const itemsListStr = order.items
        .map(it => `${it.productName} (x${it.quantity})`)
        .join(' + ');

      // Clean string values from double quotes to avoid CSV formatting corruption
      const cleanName = (order.fullName || '').replace(/"/g, '""');
      const cleanPhone = (order.phoneNumber || '').replace(/"/g, '""');
      const cleanCity = (order.city || '').replace(/"/g, '""');
      const cleanAddress = (order.deliveryAddress || '').replace(/"/g, '""');
      const cleanNotes = (order.notes || '').replace(/"/g, '""');
      const cleanItems = itemsListStr.replace(/"/g, '""');

      const subtotalVal = order.subtotal !== undefined 
        ? order.subtotal 
        : (order.total >= 500 ? order.total : Math.max(0, order.total - 35));
      const shippingCostVal = order.shippingCost !== undefined 
        ? order.shippingCost 
        : (order.total >= 500 ? 0 : 35);
      const isFreeStr = order.freeShipping !== undefined 
        ? (order.freeShipping ? "Oui" : "Non") 
        : (order.total >= 500 ? "Oui" : "Non");

      return [
        `"${order.id}"`,
        `"${order.reference}"`,
        `"${order.date}"`,
        `"${order.status}"`,
        `"${cleanName}"`,
        `"${cleanPhone}"`,
        `"${cleanCity}"`,
        `"${cleanAddress}"`,
        `"${cleanNotes}"`,
        `"${cleanItems}"`,
        subtotalVal,
        shippingCostVal,
        `"${isFreeStr}"`,
        order.total
      ];
    });

    // Concatenate headers and lines with BOM header for accurate Excel encoding compatibility
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(line => line.join(','))].join('\n');

    // Trigger file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `globabox_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          typeof p.image === 'string' && /^https:\/\//.test(p.image));
        if (!valid) {
          alert('Produits invalides : ID, nom français, prix, catégorie et URL image HTTPS obligatoires.');
          return;
        }
        if (!window.confirm('Importer ' + parsed.length + ' produit(s) en BROUILLON sur Cloudflare D1 ? Les doublons seront ignorés.')) return;
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
    if (!productForm.image.trim()) {
      alert("L'image principale du produit est obligatoire.");
      return;
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

  // Filters calculation
  const filteredOrders = orders.filter(o => {
    const matchesQuery = 
      o.fullName.toLowerCase().includes(orderQuery.toLowerCase()) ||
      o.phoneNumber.includes(orderQuery) ||
      o.id.toLowerCase().includes(orderQuery.toLowerCase());
    
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
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'products') { setEditingProduct(null); setIsAddingProduct(false); }
      }}
      onClose={onClose}
      onLogout={handleLogout}
      ordersCount={orders.length}
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
      <div className={activeTab === 'categories' ? 'min-h-full bg-[#f5f8f6]' : 'min-h-full bg-[#f5f8f6] p-4 text-[#193e38] sm:p-6 xl:p-8'}>
        
        {/* VIEW 0: Dashboard, optimized for daily order and catalog management. */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <section className="flex flex-col justify-between gap-4 rounded-[24px] border border-[#dce9e0] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#33866d]">GLOBABOX · ESPACE MARCHAND</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#143b32] sm:text-3xl">Bienvenue sur votre tableau de bord</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5c7368]">Gérez les commandes, préparez vos expéditions manuelles et publiez les produits de votre boutique.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => {handleStartAddProduct();setActiveTab('products');}} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-5 text-sm font-extrabold text-white hover:bg-[#0b3830]"><Plus size={18}/>Ajouter un produit</button>
                <button type="button" onClick={() => {setOrderStatusFilter('pending');setActiveTab('orders');}} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#b6d4c2] bg-white px-5 text-sm font-bold text-[#104d43] hover:bg-[#ecf6ef]"><ClipboardList size={18}/>Commandes à traiter</button>
              </div>
            </section>

            <section aria-label="Indicateurs du magasin" className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {[
                {label:'Commandes reçues',value:statTotalOrders,unit:'commandes',icon:ClipboardList,color:'text-[#104d43]',bg:'bg-[#e5f4e9]'},
                {label:'À confirmer',value:statNewOrders,unit:'en attente',icon:RefreshCw,color:'text-[#987126]',bg:'bg-[#fff2d3]'},
                {label:'En préparation',value:statConfirmedOnly+statProcessingOrders,unit:'à expédier',icon:Package,color:'text-[#4476a1]',bg:'bg-[#eaf2f9]'},
                {label:'Expédiées',value:statShippedOrders,unit:'en livraison',icon:Truck,color:'text-[#4b719d]',bg:'bg-[#edf2f9]'},
                {label:'Livrées',value:statDeliveredOrders,unit:'terminées',icon:CheckCircle2,color:'text-[#137a4a]',bg:'bg-[#e8f7ed]'},
                {label:'Total livré',value:statTotalRevenue.toLocaleString('fr-MA'),unit:'DH · commandes livrées',icon:BarChart3,color:'text-[#104d43]',bg:'bg-[#e5f4e9]'}
              ].map(({label,value,unit,icon:Icon,color,bg})=>(
                <div key={label} className="rounded-[18px] border border-[#e1eae4] bg-white p-4 shadow-[0_4px_15px_rgba(17,56,40,.035)]">
                  <span className={'inline-flex h-10 w-10 items-center justify-center rounded-xl '+bg+' '+color}><Icon size={20}/></span>
                  <p className="mt-4 text-[11px] font-semibold text-slate-500">{label}</p>
                  <strong className="mt-1 block text-2xl font-black text-[#193e38]">{value}</strong>
                  <span className="mt-1 block text-[10px] text-slate-500">{unit}</span>
                </div>
              ))}
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]">
              <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#dce9e0] bg-white shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div><h3 className="text-base font-black text-[#193e38]">Dernières commandes</h3><p className="mt-1 text-xs text-slate-500">Les commandes enregistrées et récupérées depuis D1</p></div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleRefreshOrders} disabled={isRefreshing} aria-label="Actualiser les commandes" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-[#104d43] hover:bg-[#f1f8f3] disabled:opacity-50"><RefreshCw size={16} className={isRefreshing?'animate-spin':''}/></button>
                    <button type="button" onClick={()=>setActiveTab('orders')} className="rounded-lg bg-[#eaf5ed] px-3 py-2 text-xs font-extrabold text-[#104d43] hover:bg-[#dceee1]">Toutes les commandes</button>
                  </div>
                </header>
                {refreshError&&<p className="mx-5 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">{refreshError}</p>}
                {refreshSuccess&&<p className="mx-5 mt-4 rounded-xl border border-[#bde0ca] bg-[#eff9f2] px-3 py-2 text-xs text-[#147548]" role="status">{refreshSuccess}</p>}
                <div className="divide-y divide-slate-100">
                  {orders.slice(0,6).map(order=>(
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs hover:bg-[#f8fbf9]">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-[#193e38]">{order.fullName||'Client'} <span className="ms-2 font-mono text-[11px] font-semibold text-slate-500">{order.reference}</span></p>
                        <p className="mt-1 text-slate-500">{order.city} · {String(order.date||'').slice(0,24)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-[#193e38]">{Number(order.total||0).toFixed(2)} DH</span>
                        <span className={'rounded-full px-3 py-1 text-[11px] font-bold '+(order.status==='delivered'?'bg-[#e4f5ea] text-[#147249]':order.status==='cancelled'?'bg-red-50 text-red-700':order.status==='pending'?'bg-amber-50 text-amber-700':'bg-[#ecf2fb] text-[#315d8a]')}>{({pending:'En attente',confirmed:'Confirmée',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'} as Record<string,string>)[order.status]||order.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length===0&&<div className="px-5 py-14 text-center"><ClipboardList size={27} className="mx-auto text-[#8fae9d]"/><p className="mt-3 text-sm font-bold text-[#446257]">Aucune commande à afficher</p><p className="mt-1 text-xs text-slate-500">Les nouvelles commandes enregistrées sur le serveur apparaîtront ici.</p></div>}
                </div>
              </section>

              <section className="space-y-4">
                <div className="rounded-[22px] border border-[#dce9e0] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-black text-[#193e38]"><Package size={19} className="text-[#104d43]"/>Catalogue produits</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f3f7f4] p-4"><p className="text-[11px] text-slate-500">Produits enregistrés</p><strong className="mt-1 block text-2xl font-black text-[#193e38]">{adminProducts.length}</strong></div>
                    <div className="rounded-xl bg-[#f3f7f4] p-4"><p className="text-[11px] text-slate-500">Publiés</p><strong className="mt-1 block text-2xl font-black text-[#193e38]">{adminProducts.filter(p=>p.isActive===true).length}</strong></div>
                    <div className="rounded-xl bg-[#f3f7f4] p-4"><p className="text-[11px] text-slate-500">Brouillons</p><strong className="mt-1 block text-2xl font-black text-[#193e38]">{adminProducts.filter(p=>p.isActive!==true).length}</strong></div>
                    <div className="rounded-xl bg-[#f3f7f4] p-4"><p className="text-[11px] text-slate-500">Hors stock</p><strong className="mt-1 block text-2xl font-black text-[#193e38]">{adminProducts.filter(p=>!p.inStock||p.stockStatus==='out_of_stock').length}</strong></div>
                  </div>
                  <button type="button" onClick={()=>setActiveTab('products')} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#b9d8c5] bg-[#edf7f0] text-xs font-extrabold text-[#104d43] hover:bg-[#dfefe4]">Gérer les produits <ChevronRight size={16}/></button>
                </div>
                <div className="rounded-[22px] border border-[#dce9e0] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-black text-[#193e38]"><Truck size={19} className="text-[#104d43]"/>Expédition manuelle</div>
                  <p className="mt-2 text-xs leading-6 text-[#60776c]">Confirmez les coordonnées, préparez le colis, puis mettez à jour le statut de la commande. Aucun envoi automatique à AMEEX.</p>
                  <button type="button" onClick={()=>{setOrderStatusFilter('confirmed');setActiveTab('orders');}} className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-extrabold text-[#104d43] underline underline-offset-4">Voir les commandes confirmées <ChevronRight size={15}/></button>
                </div>
              </section>
            </div>

            <details className="rounded-[22px] border border-[#dce9e0] bg-white shadow-sm">
              <summary className="cursor-pointer list-none rounded-[22px] p-5 text-sm font-black text-[#193e38] [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-3"><ShieldCheck size={19} className="text-[#104d43]"/>Vérifications techniques et préparation au lancement <ChevronRight size={16} className="text-slate-400"/></span>
              </summary>
              <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
                <div className="rounded-xl bg-[#f6f9f7] p-4"><h4 className="text-sm font-bold text-[#193e38]">Écriture D1 distante</h4><p className="mt-1 text-xs leading-6 text-slate-500">Test technique d'écriture/lecture/nettoyage sans commande client.</p>
                  <p className="mt-2 text-xs font-bold text-[#426753]">{d1ProbeStatus==='success'?'Test validé':d1ProbeStatus==='error'?'Échec de vérification':'Non testé dans cette session'}</p>
                  <button type="button" disabled={d1ProbeStatus==='running'} onClick={runD1Probe} className="mt-3 rounded-lg bg-[#104d43] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{d1ProbeStatus==='running'?'Vérification…':'Tester D1'}</button>
                </div>
                <div className="rounded-xl bg-[#f6f9f7] p-4"><h4 className="text-sm font-bold text-[#193e38]">Diagnostic paiement à la livraison</h4><p className="mt-1 text-xs leading-6 text-slate-500">Vérifie les calculs et une commande fictive suivie de son nettoyage.</p>
                  {checkoutDiagnostic&&<p className="mt-2 text-xs font-bold text-[#426753]">{checkoutDiagnostic.error|| (checkoutDiagnostic.success?'Test validé · '+checkoutDiagnostic.total+' DH':'Non validé')}</p>}
                  <button type="button" disabled={checkoutDiagnosticBusy} onClick={runCheckoutDiagnostic} className="mt-3 rounded-lg bg-[#104d43] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{checkoutDiagnosticBusy?'Test…':'Tester Checkout D1'}</button>
                </div>
                <div className="rounded-xl bg-[#f6f9f7] p-4"><h4 className="text-sm font-bold text-[#193e38]">AMEEX Sandbox</h4><p className="mt-1 text-xs leading-6 text-slate-500">Contrôle des clés et de la lecture des villes. La livraison reste manuelle.</p>
                  <p className="mt-2 text-xs leading-6 text-[#426753]">{ameexStatus}</p>
                  <button type="button" disabled={ameexBusy} onClick={checkAmeexSandbox} className="mt-3 rounded-lg border border-[#aacdbb] px-4 py-2.5 text-xs font-bold text-[#104d43] disabled:opacity-50">Tester connexion sandbox</button>
                  <button type="button" disabled={ameexBusy} onClick={runAmeexSandboxParcel} className="mt-3 ms-2 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-[#426753] disabled:opacity-50">Tester colis fictif</button>
                </div>
                <div className="rounded-xl bg-[#f6f9f7] p-4"><h4 className="text-sm font-bold text-[#193e38]">État du Worker</h4>
                  <p className="mt-2 text-xs leading-6 text-[#426753]">{launchStatus?.databaseReady===true?'Base D1 accessible':'Connexion D1 non vérifiée'} · {launchStatus?.adminConfigured===true?'Authentification configurée':'Authentification à vérifier'}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">Un test de commande réel sur staging et une sauvegarde D1 restent nécessaires avant le lancement.</p>
                </div>
                <button type="button" onClick={exportOrdersToCSV} className="col-span-full flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#b9d8c5] bg-[#edf7f0] px-4 text-sm font-bold text-[#104d43] hover:bg-[#ddefe3]"><ClipboardList size={17}/>Exporter les commandes en CSV</button>
              </div>
            </details>
          </div>
        )}

        {/* VIEW 1: Customer orders and manual delivery management */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <header className="flex flex-col justify-between gap-4 rounded-[22px] border border-[#dce9e0] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#38866e]">GESTION DES VENTES</p>
                <h3 className="mt-1 flex items-center gap-2 text-xl font-black text-[#193e38]"><ClipboardList size={22} className="text-[#104d43]"/>Toutes les commandes</h3>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">Les commandes sont chargées depuis Cloudflare D1. Validez, préparez et marquez les livraisons manuellement.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleRefreshOrders} disabled={isRefreshing}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#104d43] px-4 text-xs font-bold text-white transition hover:bg-[#0a3d33] disabled:opacity-50">
                  <RefreshCw size={16} className={isRefreshing?'animate-spin':''}/>{isRefreshing?'Actualisation…':'Actualiser'}
                </button>
                <button type="button" onClick={exportOrdersToCSV} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#b8d6c1] bg-white px-4 text-xs font-bold text-[#104d43] hover:bg-[#eff7f1]">
                  <ClipboardList size={16}/>Exporter CSV
                </button>
              </div>
            </header>
            {refreshSuccess&&<p role="status" className="rounded-xl border border-[#c1e2cd] bg-[#eef9f2] px-4 py-3 text-xs font-bold text-[#166943]">{refreshSuccess}</p>}
            {refreshError&&<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{refreshError}</p>}
            {launchStatus?.databaseReady!==true&&<p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">L’état de la connexion D1 est à vérifier avant de modifier une commande.</p>}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ['Toutes',statTotalOrders,'all'],
                ['À confirmer',statNewOrders,'pending'],
                ['En préparation',statProcessingOrders+statConfirmedOnly,'processing'],
                ['Expédiées',statShippedOrders,'shipped']
              ].map(([label,value,status])=>
                <button type="button" key={String(status)} onClick={()=>setOrderStatusFilter(String(status))}
                  className={'rounded-2xl border px-4 py-4 text-start shadow-sm transition '+(orderStatusFilter===status?'border-[#8ab99a] bg-[#ebf6ee]':'border-slate-200 bg-white hover:border-[#bbd7c6]')}>
                  <span className="block text-[11px] font-bold text-slate-500">{label}</span>
                  <strong className="mt-1 block text-2xl font-black text-[#193e38]">{value}</strong>
                </button>
              )}
            </div>
            <div className="grid gap-3 rounded-[20px] border border-[#dce9e0] bg-white p-4 shadow-sm md:grid-cols-3">
              <label className="relative">
                <Search size={17} className="pointer-events-none absolute start-3 top-3.5 text-slate-400"/>
                <input type="search" value={orderQuery} onChange={e=>setOrderQuery(e.target.value)}
                  placeholder="Référence, client ou téléphone…" aria-label="Rechercher une commande"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] ps-10 pe-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
              </label>
              <select value={orderStatusFilter} onChange={e=>setOrderStatusFilter(e.target.value)} aria-label="Filtrer par statut"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] px-3 text-sm font-semibold text-[#193e38] outline-none focus:border-[#104d43]">
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="cancelled">Annulées</option>
              </select>
              <select value={orderCityFilter} onChange={e=>setOrderCityFilter(e.target.value)} aria-label="Filtrer par ville"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-[#fafcfa] px-3 text-sm text-[#193e38] outline-none focus:border-[#104d43]">
                <option value="all">Toutes les villes</option>
                {MOROCCAN_CITIES.map(city=><option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600">
              <span><strong className="text-[#193e38]">{filteredOrders.length}</strong> commande(s) affichée(s) sur {statTotalOrders}</span>
              <span>Montant des commandes affichées : <strong className="text-[#104d43]">{filteredOrders.reduce((total,order)=>total+Number(order.total||0),0).toLocaleString('fr-MA')} DH</strong> <span className="text-slate-400">(non encaissé inclus)</span></span>
            </div>
            {filteredOrders.length===0?(
              <div className="rounded-2xl border border-[#dce9e0] bg-white px-4 py-16 text-center">
                <ClipboardList size={34} className="mx-auto text-[#a6c2ae]"/>
                <h4 className="mt-3 text-sm font-bold text-[#193e38]">Aucune commande trouvée</h4>
                <p className="mt-1 text-xs text-slate-500">Essayez de modifier les filtres ou d'actualiser les commandes.</p>
                <button type="button" onClick={()=>{setOrderQuery('');setOrderStatusFilter('all');setOrderCityFilter('all');}} className="mt-4 rounded-xl bg-[#edf6f0] px-4 py-2.5 text-xs font-bold text-[#104d43] hover:bg-[#dcefe3]">Réinitialiser les filtres</button>
              </div>
            ):(
              <div className="space-y-3">
                {filteredOrders.map(order=>(
                  <article key={order.id} className="overflow-hidden rounded-[20px] border border-[#dbe8e0] bg-white shadow-[0_5px_18px_rgba(19,62,42,.035)]">
                    <div className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#104d43]"><Package size={20}/></span>
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-black text-[#193e38]">{order.reference}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">{order.fullName||'Client'} · {order.city}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{String(order.date||'')} · {order.items.reduce((sum,item)=>sum+item.quantity,0)} article(s)</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-black text-[#104d43]">{Number(order.total||0).toFixed(2)} DH</span>
                        <select value={order.status} onChange={e=>void handleUpdateOrderStatus(order.id,e.target.value as Order['status'])}
                          aria-label={'État commande '+order.reference}
                          className={'min-h-10 rounded-xl border px-3 text-xs font-extrabold outline-none '+(order.status==='delivered'?'border-[#b9e3c7] bg-[#eff9f2] text-[#16744a]':order.status==='cancelled'?'border-red-200 bg-red-50 text-red-700':'border-[#d7e4d9] bg-[#f6f9f7] text-[#193e38]')}>
                          <option value="pending">En attente</option><option value="confirmed">Confirmée</option>
                          <option value="processing">En préparation</option><option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option><option value="cancelled">Annulée</option>
                        </select>
                      </div>
                    </div>
                    <details className="group border-t border-slate-100">
                      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-xs font-bold text-[#104d43] hover:bg-[#f7faf8] [&::-webkit-details-marker]:hidden">
                        Afficher les détails et les informations de livraison
                        <ChevronRight size={17} className="transition-transform group-open:rotate-90"/>
                      </summary>
                      <div className="grid gap-5 border-t border-slate-100 bg-[#fcfdfc] px-5 py-5 text-sm md:grid-cols-3">
                        <div>
                          <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Client</h4>
                          <p className="font-semibold text-[#193e38]">{order.fullName}</p>
                          <a href={'tel:'+order.phoneNumber} dir="ltr" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#104d43] hover:underline"><Phone size={16}/>{order.phoneNumber}</a>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Livraison manuelle</h4>
                          <p className="flex items-start gap-2 text-xs leading-6 text-[#526b5e]"><MapPin size={16} className="mt-1 shrink-0 text-[#104d43]"/>{order.city}, {order.deliveryAddress}</p>
                          {order.notes&&<p className="mt-2 rounded-lg bg-[#edf6ef] p-3 text-xs leading-6 text-[#526b5e]">Notes : {order.notes}</p>}
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Articles de la commande</h4>
                          <div className="space-y-2">{order.items.map((item,i)=><div key={item.productId+'-'+i} className="flex justify-between gap-2 border-b border-slate-100 pb-2 text-xs text-[#193e38]">
                            <span className="min-w-0 flex-1">{item.productName} × {item.quantity}</span><span className="shrink-0 font-bold">{item.price} DH</span>
                          </div>)}</div>
                          <p className="mt-3 text-xs font-black text-[#104d43]">Total : {order.total} DH</p>
                        </div>
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 md:col-span-3">
                          <button type="button" onClick={()=>void handleDeleteOrder(order.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-bold text-rose-700 hover:bg-rose-50"><Trash2 size={16}/>Supprimer la commande</button>
                          <p className="self-center text-xs text-slate-500">Les changements de statut sont enregistrés dans D1 avant mise à jour de l'interface.</p>
                        </div>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">

            {/* Environment warning */}
            <div className="rounded-2xl border border-[#e5d4ac] bg-[#fffcf2] p-4 text-amber-800">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 text-[#8a641d] mt-0.5 text-xs font-bold leading-none">!</div>
                <div>
                  <h4 className="text-xs font-black font-sans uppercase text-amber-800">Produits enregistrés dans Cloudflare D1</h4>
                  <p className="text-xs font-semibold leading-relaxed font-sans mt-0.5 text-slate-600">
                    Les ajouts, modifications, suppressions et imports de produits sont enregistrés côté serveur dans D1. Les nouveaux produits restent en brouillon jusqu’à publication explicite. Les catégories sont gérées dans Cloudflare D1 depuis l'onglet Catégories.
                  </p>
                </div>
              </div>
            </div>

            {/* Catalogue Control & Backup Center */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#193e38]">Importation et sauvegarde des produits</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans">Sauvegardez, clonez et restaurez vos fiches produits via des backups CSV ou JSON standard</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Export JSON */}
                <button
                  type="button"
                  onClick={exportProductsToJSON}
                  className="bg-[#f8fbf9] hover:bg-[#1a2d4c] text-[#193e38] text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
                >
                  📥 Export JSON
                </button>
                
                {/* Export CSV */}
                <button
                  type="button"
                  onClick={exportProductsToCSV}
                  className="bg-[#f8fbf9] hover:bg-[#1a2d4c] text-[#193e38] text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
                >
                  📥 Export CSV
                </button>

                {/* Import JSON hidden input & trigger */}
                <label className="bg-[#104d43]/10 hover:bg-[#104d43]/20 text-[#147657] text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer">
                  📤 Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProductsFromJSON}
                    className="hidden"
                  />
                </label>

                {/* Import CSV hidden input & trigger */}
                <label className="bg-[#104d43]/10 hover:bg-[#104d43]/20 text-[#147657] text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer">
                  📤 Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importProductsFromCSV}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {/* Shopify-style product editor: essential fields first, advanced options collapsible. */}
            {(isAddingProduct || editingProduct) && (
              <section id="gb-product-editor" className="overflow-hidden rounded-[22px] border border-[#cfdfd4] bg-[#f6faf7] shadow-sm">
                <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce9df] bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#32856e]">GLOBABOX / PRODUITS</p>
                    <h3 className="mt-1 text-lg font-black text-[#193e38]">{editingProduct?'Modifier le produit':'Ajouter un produit'}</h3>
                    <p className="mt-1 text-xs text-slate-500">{editingProduct?'Modifiez les informations et enregistrez vos changements.':'Votre nouveau produit sera d’abord enregistré en brouillon.'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={'rounded-full px-3 py-1.5 text-xs font-extrabold '+(editingProduct&&productForm.isActive?'bg-[#e6f6eb] text-[#166b45]':'bg-amber-50 text-amber-700')}>{editingProduct&&productForm.isActive?'Publié':'Brouillon'}</span>
                    <button type="button" onClick={()=>{setEditingProduct(null);setIsAddingProduct(false);}} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">Fermer</button>
                  </div>
                </header>
                <form onSubmit={handleSaveProduct} className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,.75fr)]">
                  <div className="min-w-0 space-y-5">
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <h4 className="mb-4 text-base font-black text-[#193e38]">Informations du produit</h4>
                      <label htmlFor="gb-product-title" className="mb-1.5 block text-xs font-extrabold text-[#385647]">Nom du produit *</label>
                      <input id="gb-product-title" required maxLength={220} value={productForm.nameFr}
                        onChange={e=>setProductForm({...productForm,nameFr:e.target.value})}
                        placeholder="Ex. Organisateur de cuisine multifonction" className="mb-4 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#193e38] outline-none focus:border-[#104d43]"/>
                      <label htmlFor="gb-product-description" className="mb-1.5 block text-xs font-extrabold text-[#385647]">Description du produit</label>
                      <textarea id="gb-product-description" rows={7} maxLength={6000} value={productForm.descFr}
                        onChange={e=>setProductForm({...productForm,descFr:e.target.value})}
                        placeholder="Expliquez les avantages, les caractéristiques, les dimensions, le contenu du colis et l'utilisation réelle du produit."
                        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#193e38] outline-none focus:border-[#104d43]"/>
                      <p className="mt-2 text-[11px] text-slate-500">Décrivez uniquement les caractéristiques vérifiées. Pas de promesses non confirmées.</p>
                    </section>
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div><h4 className="text-base font-black text-[#193e38]">Photos et galerie</h4>
                          <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · 750 Ko par image · 8 images par sélection.</p></div>
                      </div>
                      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#bad7c5] bg-[#f6fbf7] p-4 text-center text-xs font-bold text-[#104d43] hover:bg-[#edf7f0]">
                        <Plus size={24}/>{mediaUploading?'Téléversement des images…':'Ajouter des images depuis votre ordinateur'}
                        <input type="file" multiple accept="image/webp,image/jpeg,image/png" className="sr-only"
                          disabled={mediaUploading} onChange={e=>{void uploadProductPhotos(e.target.files);e.target.value='';}}/>
                      </label>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {productForm.image&&<div className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-[#93c2a6] bg-white">
                          <img src={productForm.image} alt="Image principale" className="h-full w-full object-contain"/>
                          <span className="absolute bottom-0 inset-x-0 bg-[#104d43] py-1 text-center text-[10px] font-bold text-white">Principale</span>
                        </div>}
                        {productForm.additionalImages.map((image,i)=><div key={image+'-'+i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <img src={image} alt={'Galerie '+(i+1)} className="h-full w-full object-contain"/>
                          <button type="button" onClick={()=>setProductForm({...productForm,image,additionalImages:[productForm.image,...productForm.additionalImages.filter((_,j)=>j!==i)].filter(Boolean)})}
                            className="absolute bottom-0 start-0 bg-[#104d43] px-2 py-1 text-[10px] text-white" title="Définir comme principale">1ère</button>
                          <button type="button" onClick={()=>setProductForm({...productForm,additionalImages:productForm.additionalImages.filter((_,j)=>j!==i)})}
                            className="absolute end-1 top-1 rounded-full bg-white p-1 text-red-700 shadow" aria-label="Retirer image"><X size={13}/></button>
                        </div>)}
                      </div>
                      <details className="mt-4 rounded-xl bg-[#f5f8f6] p-3">
                        <summary className="cursor-pointer text-xs font-bold text-[#104d43]">Ajouter une image par lien URL</summary>
                        <label className="mt-3 block text-xs text-slate-500">Image principale</label>
                        <input value={productForm.image} onChange={e=>setProductForm({...productForm,image:e.target.value})}
                          placeholder="https://..." className="mt-1 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-[#193e38]"/>
                        <label className="mt-3 block text-xs text-slate-500">Autres photos (une URL par ligne)</label>
                        <textarea rows={3} value={productForm.additionalImages.join('\n')}
                          onChange={e=>setProductForm({...productForm,additionalImages:e.target.value.split(/\n/).map(v=>v.trim()).filter(Boolean)})}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#193e38]"/>
                      </details>
                    </section>
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <h4 className="mb-4 text-base font-black text-[#193e38]">Prix et disponibilité</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-[#385647]">Prix de vente (DH) *
                          <input type="number" min="0.01" step="0.01" required value={productForm.price||''}
                            onChange={e=>setProductForm({...productForm,price:Number(e.target.value)})}
                            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-[#193e38] outline-none focus:border-[#104d43]"/>
                        </label>
                        <label className="text-xs font-bold text-[#385647]">Prix barré (facultatif)
                          <input type="number" min="0" step="0.01" value={productForm.originalPrice||''}
                            onChange={e=>setProductForm({...productForm,originalPrice:Number(e.target.value)})}
                            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
                        </label>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">La livraison est calculée au passage de commande (35 DH en dessous de 500 DH).</p>
                    </section>
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <h4 className="mb-4 text-base font-black text-[#193e38]">Tags et mots-clés</h4>
                      <label htmlFor="gb-product-tags" className="mb-2 block text-xs font-bold text-[#385647]">Étiquettes produit</label>
                      <input id="gb-product-tags" type="text" value={tagsInput}
                        onChange={e=>setTagsInput(e.target.value)}
                        placeholder="Ex. rangement, cuisine, maison, organisation"
                        className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
                      <p className="mt-2 text-xs text-slate-500">Séparez les mots-clés par une virgule. Ils servent à la recherche interne et à l'organisation du catalogue.</p>
                      {tagsInput.split(',').some(tag=>tag.trim())&&<div className="mt-3 flex flex-wrap gap-2">{tagsInput.split(',').map(tag=>tag.trim()).filter(Boolean).map((tag,i)=><span key={tag+i} className="rounded-full bg-[#e9f5ee] px-3 py-1 text-[11px] font-bold text-[#104d43]">{tag}</span>)}</div>}
                    </section>
                    <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <summary className="cursor-pointer text-base font-black text-[#193e38]">Référencement Google (SEO) · facultatif</summary>
                      <div className="mt-4 space-y-4">
                        <label className="block text-xs font-bold text-[#385647]">Titre SEO
                          <input maxLength={100} value={productForm.seoTitle} onChange={e=>setProductForm({...productForm,seoTitle:e.target.value})}
                            placeholder={productForm.nameFr||'Titre affiché dans Google'} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-[#193e38]"/>
                        </label>
                        <label className="block text-xs font-bold text-[#385647]">Meta description
                          <textarea rows={3} maxLength={320} value={productForm.seoDescription} onChange={e=>setProductForm({...productForm,seoDescription:e.target.value})}
                            placeholder="Résumé court et précis de votre produit." className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-[#193e38]"/>
                        </label>
                        <div className="rounded-xl border border-slate-200 bg-[#f8faf8] p-4">
                          <p className="truncate text-[15px] font-bold text-[#225fba]">{productForm.seoTitle||productForm.nameFr||'Nom du produit'}</p>
                          <p className="mt-1 text-xs text-[#2e8056]">globabox.com/?product={encodeURIComponent(productForm.id||'produit')}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{productForm.seoDescription||productForm.descFr||'Aperçu du produit dans les moteurs de recherche.'}</p>
                        </div>
                        <p className="text-xs leading-6 text-slate-500">L’aperçu SEO est indicatif. L’indexation réelle dépend du rendu et de la configuration technique du site.</p>
                      </div>
                    </details>
                    <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm sm:p-6">
                      <summary className="cursor-pointer text-base font-black text-[#193e38]">Traductions & caractéristiques · facultatif</summary>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="text-xs font-bold text-[#385647]">Nom en arabe
                          <input dir="rtl" value={productForm.nameAr} onChange={e=>setProductForm({...productForm,nameAr:e.target.value})}
                            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
                        </label>
                        <label className="text-xs font-bold text-[#385647]">Nom en anglais
                          <input value={productForm.nameEn} onChange={e=>setProductForm({...productForm,nameEn:e.target.value})}
                            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
                        </label>
                        <label className="text-xs font-bold text-[#385647]">Description en arabe
                          <textarea dir="rtl" rows={4} value={productForm.descAr} onChange={e=>setProductForm({...productForm,descAr:e.target.value})}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
                        </label>
                        <label className="text-xs font-bold text-[#385647]">Description en anglais
                          <textarea rows={4} value={productForm.descEn} onChange={e=>setProductForm({...productForm,descEn:e.target.value})}
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
                        </label>
                        {(['fr','ar','en'] as const).map(lang=>{
                          const prop=lang==='fr'?'featuresFr':lang==='ar'?'featuresAr':'featuresEn';
                          return <label key={lang} className="text-xs font-bold text-[#385647]">Caractéristiques {lang.toUpperCase()} (une par ligne)
                            <textarea rows={4} dir={lang==='ar'?'rtl':'ltr'} value={productForm[prop].join('\n')}
                              onChange={e=>setProductForm({...productForm,[prop]:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)})}
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-[#193e38]"/>
                          </label>;
                        })}
                      </div>
                    </details>
                  </div>
                  <aside className="min-w-0 space-y-5 xl:sticky xl:top-[86px] xl:self-start">
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
                      <h4 className="mb-4 text-base font-black text-[#193e38]">Statut de vente</h4>
                      {editingProduct?<label className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f9f6] p-3 text-xs font-bold text-[#193e38]">
                        {productForm.isActive?'Publié sur le site':'Brouillon · Non visible'}
                        <input type="checkbox" checked={productForm.isActive} onChange={e=>setProductForm({...productForm,isActive:e.target.checked})} className="h-5 w-5 accent-[#104d43]"/>
                      </label>:<p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">Le nouveau produit sera enregistré en brouillon. Vous pourrez le publier après validation des photos, du prix et du stock.</p>}
                      <label className="mt-4 block text-xs font-bold text-[#385647]">Disponibilité
                        <select value={productForm.stockStatus} onChange={e=>setProductForm({...productForm,stockStatus:e.target.value as typeof productForm.stockStatus})}
                          className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                          <option value="in_stock">En stock</option><option value="limited">Stock limité</option><option value="out_of_stock">Rupture de stock</option>
                        </select>
                      </label>
                      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                        {([['bestSeller','Meilleure vente'],['newArrival','Nouveauté'],['featured','Mis en avant']] as const).map(([field,label])=>
                          <label key={field} className="flex items-center justify-between text-xs font-bold text-[#385647]">{label}
                            <input type="checkbox" checked={productForm[field]} onChange={e=>setProductForm({...productForm,[field]:e.target.checked})} className="h-4 w-4 accent-[#104d43]"/>
                          </label>)}
                      </div>
                    </section>
                    <section className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
                      <h4 className="mb-4 text-base font-black text-[#193e38]">Organisation</h4>
                      <label className="block text-xs font-bold text-[#385647]">Catégorie principale *
                        <select value={productForm.category} onChange={e=>setProductForm({...productForm,category:e.target.value,subcategory:''})}
                          className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                          <optgroup label="Rayons de la boutique">
                            {STORE_DEPARTMENTS.map(category=><option key={category.id} value={category.id}>{categories.find(c=>c.id===category.id)?.name.fr||category.name.fr}</option>)}
                          </optgroup>
                          {categories.some(c=>c.id===productForm.category&&!STORE_DEPARTMENTS.some(dept=>dept.id===c.id))&&<optgroup label="Catégorie historique"><option value={productForm.category}>{productForm.category}</option></optgroup>}
                        </select>
                      </label>
                      <label className="mt-4 block text-xs font-bold text-[#385647]">Sous-catégorie
                        <select value={productForm.subcategory} onChange={e=>setProductForm({...productForm,subcategory:e.target.value})}
                          className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-[#193e38]">
                          <option value="">Aucune</option>
                          {getStoreSubcategories(productForm.category).map(sub=><option key={sub.id} value={sub.id}>{sub.name.fr}</option>)}
                        </select>
                      </label>
                    </section>
                    <details className="rounded-2xl border border-[#dfe9e2] bg-white p-5 shadow-sm">
                      <summary className="cursor-pointer text-base font-black text-[#193e38]">Inventaire & références</summary>
                      <div className="mt-4 space-y-4">
                        <label className="block text-xs font-bold text-[#385647]">SKU (référence interne)
                          <input value={productForm.sku} maxLength={80} onChange={e=>setProductForm({...productForm,sku:e.target.value})}
                            placeholder="Ex. GB-CUI-001" className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
                        </label>
                        <label className="block text-xs font-bold text-[#385647]">Code-barres (facultatif)
                          <input value={productForm.barcode} maxLength={80} onChange={e=>setProductForm({...productForm,barcode:e.target.value})}
                            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-[#193e38]"/>
                        </label>
                        <label className="block text-xs font-bold text-[#385647]">Identifiant technique
                          <input disabled={Boolean(editingProduct)} value={productForm.id}
                            onChange={e=>setProductForm({...productForm,id:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,'-')})}
                            className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-[#f7faf8] px-3 font-mono text-xs text-[#193e38]"/>
                        </label>
                      </div>
                    </details>
                    <div className="rounded-2xl border border-[#c9e1d1] bg-white p-4 shadow-sm">
                      <button type="submit" disabled={mediaUploading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 text-sm font-black text-white hover:bg-[#0b3931] disabled:opacity-50">
                        <CheckCircle2 size={18}/>{editingProduct?'Enregistrer les changements':'Enregistrer le brouillon'}
                      </button>
                      <button type="button" onClick={()=>{setEditingProduct(null);setIsAddingProduct(false);}} className="mt-2 min-h-10 w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50">Annuler</button>
                      <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">Enregistrement sur Cloudflare D1. Vérifiez votre fiche après sauvegarde.</p>
                    </div>
                  </aside>
                </form>
              </section>
            )}

            {/* Shopify-style listing: search, status, images and clear actions. */}
            <section className="overflow-hidden rounded-[22px] border border-[#d9e7df] bg-white shadow-sm">
              <header className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h3 className="text-lg font-black text-[#193e38]">Liste des produits</h3>
                  <p className="mt-1 text-xs text-slate-500">Recherchez, modifiez et organisez votre catalogue depuis un seul endroit.</p>
                </div>
                <button type="button" onClick={handleStartAddProduct}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#104d43] px-5 text-xs font-extrabold text-white hover:bg-[#0b3931]">
                  <Plus size={17}/>Ajouter un produit
                </button>
              </header>
              <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_210px] sm:p-5">
                <label className="relative">
                  <Search size={19} className="pointer-events-none absolute start-4 top-3.5 text-slate-400"/>
                  <input type="search" value={productQuery} onChange={e=>setProductQuery(e.target.value)}
                    placeholder="Rechercher par nom, référence, catégorie ou tag…" aria-label="Rechercher un produit"
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#fcfdfc] ps-12 pe-4 text-sm text-[#193e38] outline-none focus:border-[#104d43]"/>
                </label>
                <select value={productStatusFilter} onChange={e=>setProductStatusFilter(e.target.value as typeof productStatusFilter)}
                  aria-label="Filtrer par statut"
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-[#fcfdfc] px-4 text-xs font-bold text-[#193e38] outline-none focus:border-[#104d43]">
                  <option value="all">Tous les produits ({adminProducts.length})</option>
                  <option value="published">Publiés ({adminProducts.filter(p=>p.isActive===true).length})</option>
                  <option value="draft">Brouillons ({adminProducts.filter(p=>p.isActive!==true).length})</option>
                  <option value="outofstock">Rupture de stock ({adminProducts.filter(p=>!p.inStock||p.stockStatus==='out_of_stock').length})</option>
                </select>
              </div>
              <p className="border-b border-slate-100 px-5 py-3 text-xs font-semibold text-[#64796c]">{filteredProductsList.length} produit(s) correspondant à la recherche · Données du catalogue D1</p>
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse text-start text-xs">
                  <thead className="bg-[#f5f9f6] text-[11px] font-extrabold text-[#527263]">
                    <tr>
                      <th className="px-5 py-4 text-start">Produit</th>
                      <th className="px-4 py-4 text-start">Catégorie</th>
                      <th className="px-4 py-4 text-start">Statut</th>
                      <th className="px-4 py-4 text-start">Stock</th>
                      <th className="px-4 py-4 text-end">Prix</th>
                      <th className="px-5 py-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eee9]">
                    {filteredProductsList.map(prod=><tr key={prod.id} className="hover:bg-[#f9fcfa]">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2ece5] bg-[#f3f7f4]">
                            {prod.image?<img src={prod.image} loading="lazy" alt="" className="h-full w-full object-contain"/>:<Package size={23} className="text-[#91aa9b]"/>}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[330px] truncate text-sm font-extrabold text-[#193e38]">{prod.name?.fr||prod.id}</p>
                            <p className="mt-1 font-mono text-[11px] text-slate-500">{prod.sku||prod.id}</p>
                            {Boolean(prod.tags?.length)&&<p className="mt-1 max-w-[300px] truncate text-[11px] text-[#658274]">{prod.tags?.slice(0,3).join(' · ')}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block text-xs font-semibold text-[#193e38]">{categories.find(cat=>cat.id===prod.category)?.name.fr||STORE_DEPARTMENTS.find(cat=>cat.id===prod.category)?.name.fr||prod.category}</span>
                        {prod.subcategory&&<span className="mt-1 block text-[11px] text-slate-500">{getStoreSubcategories(prod.category).find(sub=>sub.id===prod.subcategory)?.name.fr||prod.subcategory}</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={'inline-flex rounded-full px-3 py-1.5 text-[11px] font-extrabold '+(prod.isActive===true?'bg-[#e7f6ec] text-[#176b45]':'bg-amber-50 text-amber-700')}>{prod.isActive===true?'Publié':'Brouillon'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={'text-[11px] font-bold '+(!prod.inStock||prod.stockStatus==='out_of_stock'?'text-red-700':prod.stockStatus==='limited'?'text-amber-700':'text-[#17714c]')}>
                          {!prod.inStock||prod.stockStatus==='out_of_stock'?'Rupture':prod.stockStatus==='limited'?'Stock limité':'En stock'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <strong className="whitespace-nowrap text-sm text-[#193e38]">{prod.price.toFixed(2)} DH</strong>
                        {prod.originalPrice&&prod.originalPrice>prod.price&&<span className="mt-1 block text-[11px] text-slate-400 line-through">{prod.originalPrice.toFixed(2)} DH</span>}
                      </td>
                      <td className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={()=>handleStartEditProduct(prod)} className="min-h-10 rounded-xl border border-[#bed9c8] bg-[#f0f8f2] px-4 text-xs font-extrabold text-[#104d43] hover:bg-[#e0f0e5]">Modifier</button>
                          <button type="button" onClick={()=>handleDeleteProduct(prod.id)} aria-label={'Retirer '+(prod.name?.fr||prod.id)} title="Retirer du catalogue"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-red-600 hover:bg-red-50"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>)}
                    {filteredProductsList.length===0&&<tr><td colSpan={6} className="px-5 py-16 text-center">
                      <Package size={33} className="mx-auto text-[#9db5a3]"/>
                      <h4 className="mt-4 text-base font-black text-[#193e38]">Aucun produit trouvé</h4>
                      <p className="mt-2 text-xs text-slate-500">{adminProducts.length===0?'Commencez par ajouter votre premier produit.':'Essayez un autre filtre ou une autre recherche.'}</p>
                      <button type="button" onClick={()=>{setProductQuery('');setProductStatusFilter('all');}} className="mt-4 rounded-xl border border-[#b8d8c4] px-4 py-2.5 text-xs font-bold text-[#104d43]">Effacer les filtres</button>
                    </td></tr>}
                  </tbody>
                </table>
              </div>
            </section>


          </div>
        )}

        {/* Category CRUD, search, image and D1 persistence. */}
        {activeTab === 'categories' && (
          <AdminCategoriesWorkspace
            categories={categories}
            products={adminProducts}
            onCategoriesChange={setCategories}
          />
        )}

        {activeTab === 'marketing' && <AdminTrackingWorkspace/>}

      </div>
    </AdminWorkspaceLayout>
  );
}
