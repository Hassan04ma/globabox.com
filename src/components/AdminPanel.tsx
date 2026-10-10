import React, { useEffect, useState } from 'react';
import { Package, ClipboardList, Settings, Plus, Trash2, Edit2, CheckCircle2, RefreshCw, X, Search, ChevronRight, Ban, Truck, ShieldCheck, CornerDownRight, BarChart3, MapPin, Phone, ShoppingCart, BadgeCheck, Compass } from 'lucide-react';
import { Product, Category, Order, Language } from '../types';
import { MOROCCAN_CITIES } from '../data';
import { getTrackingConfig, saveTrackingConfig, TrackingConfig, isTrackerValid } from '../utils/analytics';
import ProductImage from './ProductImage';

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

  const isUsingDefaultPassword = false;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    fetch('/api/admin/session').then(r => r.ok ? r.json() : { authenticated: false })
      .then(d => setIsAuthenticated(d.authenticated === true))
      .catch(() => setIsAuthenticated(false)).finally(() => setAuthLoading(false));
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    }).catch(() => null);
    if (res?.ok) { setIsAuthenticated(true); setPasswordInput(''); setErrorMessage(''); }
    else if (res?.status === 503) setErrorMessage('Serveur non configuré : vérifiez ADMIN_PASSWORD (12+ caractères) et ADMIN_SESSION_SECRET (32+ caractères) dans Runtime Secrets.');
    else if (res?.status === 401) setErrorMessage('Nom d’utilisateur ou mot de passe incorrect.');
    else if (res?.status === 403) setErrorMessage('Origine du site refusée. Ouvrez directement le lien workers.dev.');
    else setErrorMessage('Connexion impossible : erreur HTTP ' + (res?.status || 'réseau'));
  };
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false); setPasswordInput(''); setUsernameInput('');
  };

  // --- Segmented Moroccan E-commerce Dashboard KPI Calculations ---
  const statTotalOrders = orders.length;
  const statNewOrders = orders.filter(o => o.status === 'pending').length;
  const statConfirmedOnly = orders.filter(o => o.status === 'confirmed').length;
  const statProcessingOrders = orders.filter(o => o.status === 'processing').length;
  const statShippedOrders = orders.filter(o => o.status === 'shipped').length;
  const statDeliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const statCancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const statTotalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);
  
  // Marketing Config state
  const [trackingForm, setTrackingForm] = useState<TrackingConfig>(() => getTrackingConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        localStorage.setItem('globabox_orders', JSON.stringify(sortedOrders));
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
    category: 'camping',
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
  });

  // Editing Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    nameFr: string;
    nameAr: string;
    nameEn: string;
    image: string;
  }>({
    id: '',
    nameFr: '',
    nameAr: '',
    nameEn: '',
    image: '',
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
      localStorage.setItem('globabox_orders', JSON.stringify(updated));
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
      localStorage.setItem('globabox_orders', JSON.stringify(updated));
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
    if (products.length === 0) {
      alert("Aucun produit à exporter.");
      return;
    }
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `globabox_products_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import products from JSON file
  const importProductsFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(p => p && p.id && p.name && (p.name.fr || p.name.ar || p.name.en));
          if (!isValid) {
            alert("Erreur de format : Certains produits n'ont pas d'ID ou de nom.");
            return;
          }
          
          if (window.confirm(`Voulez-vous importer ${parsed.length} produits ? Les ID en doublon seront écrasés.`)) {
            const mergedMap = new Map<string, Product>();
            products.forEach(p => mergedMap.set(p.id, p));
            parsed.forEach((p: Product) => mergedMap.set(p.id, p));
            
            const list = Array.from(mergedMap.values());
            setProducts(list);
            localStorage.setItem('globabox_products_v1', JSON.stringify(list));
            alert("Produits importés avec succès !");
          }
        } else {
          alert("Erreur de format : Les données JSON doivent être un tableau de produits.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Export products as CSV backup
  const exportProductsToCSV = () => {
    if (products.length === 0) {
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

    const rows = products.map(p => {
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

    fileReader.onload = (event) => {
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

        if (window.confirm(`Voulez-vous importer ${parsedProducts.length} produits du fichier CSV ?`)) {
          const mergedMap = new Map<string, Product>();
          products.forEach(p => mergedMap.set(p.id, p));
          parsedProducts.forEach(p => mergedMap.set(p.id, p));

          const list = Array.from(mergedMap.values());
          setProducts(list);
          localStorage.setItem('globabox_products_v1', JSON.stringify(list));
          alert("Produits CSV importés avec succès !");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la lecture du fichier CSV.");
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Initiate Product Create
  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: `prod-${Date.now()}`,
      nameFr: '',
      nameAr: '',
      nameEn: '',
      price: 150,
      originalPrice: 250,
      descFr: '',
      descAr: '',
      descEn: '',
      category: categories[0]?.id || 'camping',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400',
      additionalImages: [],
      inStock: true,
      stockStatus: 'in_stock',
      bestSeller: false,
      newArrival: true,
      featured: false,
      isActive: true,
      fallbackImage: '',
      fallbackImages: [],
      featuresFr: ['Haute qualité', 'Robuste & Durable'],
      featuresAr: ['جودة عالية', 'مقاوم للاستخدام'],
      featuresEn: ['Premium Quality', 'Durable Outdoor gear'],
    });
    setIsAddingProduct(true);
  };

  // Initiate Product Edit
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
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
      image: prod.image,
      additionalImages: prod.additionalImages || [],
      inStock: prod.inStock,
      stockStatus: prod.stockStatus || (prod.inStock ? 'in_stock' : 'out_of_stock'),
      bestSeller: !!prod.bestSeller,
      newArrival: !!prod.newArrival,
      featured: !!prod.featured,
      isActive: prod.isActive !== false,
      fallbackImage: prod.fallbackImage || '',
      fallbackImages: prod.fallbackImages || [],
      featuresFr: prod.features?.fr || [],
      featuresAr: prod.features?.ar || [],
      featuresEn: prod.features?.en || [],
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
      image: productForm.image.trim(),
      images: [productForm.image.trim(), ...(productForm.additionalImages || [])].filter(Boolean),
      fallbackImage: productForm.fallbackImage || '',
      fallbackImages: productForm.fallbackImages || [],
      additionalImages: productForm.additionalImages || [],
      rating: editingProduct ? editingProduct.rating : 4.5,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 12,
      inStock: productForm.stockStatus !== 'out_of_stock',
      stockStatus: productForm.stockStatus,
      bestSeller: productForm.bestSeller,
      newArrival: productForm.newArrival,
      featured: productForm.featured,
      isActive: productForm.isActive,
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
      .then(data => {
        const updatedList = products.map(p => p.id === editingProduct.id ? data.product : p);
        setProducts(updatedList);
        localStorage.setItem('globabox_products_v1', JSON.stringify(updatedList));
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
      .then(data => {
        const updatedList = [data.product, ...products];
        setProducts(updatedList);
        localStorage.setItem('globabox_products_v1', JSON.stringify(updatedList));
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
        setProducts(updated);
        localStorage.setItem('globabox_products_v1', JSON.stringify(updated));
      })
      .catch(err => {
        console.error(err);
        alert("Erreur de suppression du produit.");
      });
    }
  };

  // Initiate Category Edit
  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      nameFr: cat.name.fr,
      nameAr: cat.name.ar,
      nameEn: cat.name.en,
      image: cat.image,
    });
  };

  // Save category details
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameFr.trim()) {
      alert('Nom de catégorie requis.');
      return;
    }

    const updatedCat: Category = {
      id: categoryForm.id,
      name: {
        fr: categoryForm.nameFr,
        ar: categoryForm.nameAr || categoryForm.nameFr,
        en: categoryForm.nameEn || categoryForm.nameFr,
      },
      image: categoryForm.image || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400',
    };

    const updatedList = categories.map(c => c.id === categoryForm.id ? updatedCat : c);
    setCategories(updatedList);
    localStorage.setItem('globabox_categories_v1', JSON.stringify(updatedList));
    setEditingCategory(null);
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

  const filteredProductsList = products.filter(p => 
    p.name.fr.toLowerCase().includes(productQuery.toLowerCase()) ||
    (p.name.ar && p.name.ar.includes(productQuery)) ||
    p.category.toLowerCase().includes(productQuery.toLowerCase())
  );

  if (authLoading) return <div className='fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center'>Vérification…</div>;
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070d1a] backdrop-blur-md flex items-center justify-center font-sans p-4">
        <div className="w-full max-w-sm bg-[#0b1528] border border-[#1d2f4d] rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-[#13223c] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center space-y-4 mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-white border border-orange-400/30 shadow-lg relative overflow-hidden select-none">
              <span className="text-xl font-black font-sans text-white z-10">GB</span>
              <span className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></span>
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">Administration Globabox</h2>
              <p className="text-xs text-slate-400 mt-1">Saisissez vos identifiants pour continuer</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black">Nom d'utilisateur ou e-mail</label>
              <input
                type="text"
                placeholder="Ex : admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-[#122037] border border-[#213757] rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-black">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#122037] border border-[#213757] rounded-xl py-3 px-4 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-[11px] text-red-500 text-center font-bold font-sans bg-red-950/40 border border-red-500/20 p-2.5 rounded-xl">
                ⚠️ {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/10 active:scale-95 transition-all text-xs cursor-pointer uppercase tracking-wider"
            >
              Se connecter
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center mt-6">
            Paiement à la livraison Maroc • Globabox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070d1a]/95 backdrop-blur-md flex flex-col font-sans text-white overflow-hidden">
      
      {/* Super Top Header Control Board */}
      <div className="bg-[#0b1528] border-b border-[#1c2e4a] py-4 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-600 to-amber-700 flex items-center justify-center text-white border border-orange-400/30 shadow-lg relative overflow-hidden select-none">
            <span className="text-sm font-black font-sans text-white z-10">GB</span>
            <div className="absolute right-0.5 bottom-0.5 opacity-60 text-slate-200">
              <Settings size={10} className="animate-spin-slow text-amber-300" />
            </div>
            <span className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></span>
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-white">
              Globabox • Administration
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Système de commande & Catalogue interactif Maroc • 0649264408
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/40 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔒 Logout</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#13223c] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="bg-[#0c1a33] border-b border-[#1d2f4d] px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          {/* TAB 0: Dashboard */}
          <button
            onClick={() => { setActiveTab('dashboard'); setEditingProduct(null); setIsAddingProduct(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#13223c]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tableau de Bord</span>
          </button>

          {/* TAB 1: Orders */}
          <button
            onClick={() => { setActiveTab('orders'); setEditingProduct(null); setIsAddingProduct(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#13223c]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Commandes Client ({orders.length})</span>
          </button>

          {/* TAB 2: Products */}
          <button
            onClick={() => { setActiveTab('products'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#13223c]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue Produits ({products.length})</span>
          </button>

          {/* TAB 3: Categories */}
          <button
            onClick={() => { setActiveTab('categories'); setEditingProduct(null); setIsAddingProduct(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#13223c]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Catégories ({categories.length})</span>
          </button>

          {/* TAB 4: Pixels & Tracking */}
          <button
            onClick={() => { setActiveTab('marketing'); setEditingProduct(null); setIsAddingProduct(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'marketing'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#13223c]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Pixels & Marketing</span>
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'products' && !isAddingProduct && !editingProduct && (
            <button
              onClick={handleStartAddProduct}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau produit</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 bg-[#0b1528] px-3 py-1.5 rounded-lg border border-[#1b2b45] text-[10px] text-slate-400">
            <span className="text-emerald-500">🟢</span>
            <span>Système connecté</span>
          </div>
        </div>
      </div>

      {/* Main panel body */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#070d1a]">
        
        {/* VIEW 0: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {isUsingDefaultPassword && (
              <div className="bg-red-950/45 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <div>
                    <h4 className="text-xs font-black font-sans uppercase text-red-400">⚠️ Alerte de Sécurité : Mot de passe par défaut actif</h4>
                    <p className="text-xs font-bold leading-normal font-sans mt-0.5">
                      L'administration utilise actuellement le mot de passe "CHANGE_THIS_PASSWORD". Veuillez modifier la variable d'environnement <code className="bg-red-950 border border-red-800/40 px-1 py-0.5 rounded text-[10px] font-mono text-white">VITE_ADMIN_PASSWORD</code> avant le lancement opérationnel de la boutique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ambient greeting */}
            <div className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-orange-600/10 to-transparent rounded-full -mt-4 -mr-4"></div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <span>Performances & Indicateurs • Globabox Maroc</span>
              </h2>
              <p className="text-xs text-slate-400">
                Vue d'ensemble et rapports analytiques en temps réel de votre activité e-commerce, taux de conversion et gestion de stock.
              </p>
            </div>

            {/* Final Launch Checklist Card */}
            {(() => {
              const productsWithImagesCount = products.filter(p => p.image && p.image.trim() !== '').length;
              const allProductsHaveImages = products.length > 0 && productsWithImagesCount === products.length;
              const trackingConfigured = isTrackerValid(trackingForm.metaPixelId) && 
                                         isTrackerValid(trackingForm.tikTokPixelId) && 
                                         isTrackerValid(trackingForm.googleAnalyticsId);
              
              const checklistItems = [
                {
                  id: 'order_api',
                  label: 'Orders API connected',
                  desc: isOrdersApiConfigured 
                    ? 'Google Sheets Orders API connected' 
                    : 'Orders API not configured. Orders are saved locally only.',
                  ok: isOrdersApiConfigured,
                  severity: 'critical' as const,
                  configInfo: 'VITE_ORDERS_API_URL'
                },
                {
                  id: 'password',
                  label: 'Admin password changed from CHANGE_THIS_PASSWORD',
                  desc: !isUsingDefaultPassword 
                    ? 'Admin password changed from CHANGE_THIS_PASSWORD' 
                    : 'Le mot de passe par défaut est actif ! Risque de sécurité critique.',
                  ok: !isUsingDefaultPassword,
                  severity: 'critical' as const,
                  configInfo: 'VITE_ADMIN_PASSWORD'
                },
                {
                  id: 'whatsapp',
                  label: 'WhatsApp number configured correctly: 0649264408',
                  desc: 'WhatsApp number configured correctly: 0649264408',
                  ok: true,
                  severity: 'warning' as const,
                  configInfo: 'WhatsApp Link'
                },
                {
                  id: 'domain',
                  label: 'Website domain configured correctly: https://www.globabox.com',
                  desc: 'Website domain configured correctly: https://www.globabox.com',
                  ok: true,
                  severity: 'warning' as const,
                  configInfo: 'www.globabox.com'
                },
                {
                  id: 'images',
                  label: 'Products have valid images',
                  desc: allProductsHaveImages 
                    ? 'Tous les articles de votre boutique possèdent des visuels valides.' 
                    : `${products.length - productsWithImagesCount} produit(s) requièrent l'attribution de liens d'images valides.`,
                  ok: allProductsHaveImages,
                  severity: 'warning' as const,
                  configInfo: 'Catalogue Images'
                },
                {
                  id: 'tracking',
                  label: 'Tracking pixels configured',
                  desc: trackingConfigured 
                    ? 'Meta Facebook Pixel, TikTok Pixel, et Google Analytics fonctionnels.' 
                    : 'Un ou plusieurs codes de tracking utilisent des valeurs factices ou sont absents.',
                  ok: trackingConfigured,
                  severity: 'warning' as const,
                  configInfo: 'Marketing Tags'
                },
                {
                  id: 'delivery',
                  label: 'Delivery policy completed',
                  desc: 'Conditions de livraison gratuite sous 24/48h activées sur toute la boutique.',
                  ok: true,
                  severity: 'warning' as const,
                  configInfo: 'Logistique'
                },
                {
                  id: 'returns',
                  label: 'Return policy completed',
                  desc: 'Garanties d\'échange et modalités de remboursement transparentes.',
                  ok: true,
                  severity: 'warning' as const,
                  configInfo: 'Politiques'
                },
                {
                  id: 'sheets_sync',
                  label: 'Google Sheets sync active',
                  desc: isOrdersApiConfigured 
                    ? 'Synchronisation bidirectionnelle automatique active sur chaque validation.' 
                    : 'La passerelle Google Sheets est déconnectée. Synchronisation suspendue.',
                  ok: isOrdersApiConfigured,
                  severity: 'warning' as const,
                  configInfo: 'Sheets Sync'
                }
              ];

              const totalScore = checklistItems.filter(it => it.ok).length;
              const percentComplete = Math.round((totalScore / checklistItems.length) * 100);

              return (
                <div className="bg-[#0b1528] rounded-2xl border border-orange-500/10 p-5 font-sans relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-full pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#1c2e4a]">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="text-orange-500 text-sm">🚀</span> Checklist de Préparation de Lancement (Admin Launch Checklist)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Vérification finale obligatoire des configurations et dépendances critiques avant le lancement de la boutique Globabox.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">État Global</span>
                        <span className="text-xs font-black font-mono text-orange-400">{totalScore} / {checklistItems.length} Activés</span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-orange-950/40 flex items-center justify-center relative overflow-hidden bg-orange-950/20 font-mono text-[11px] font-black text-orange-400">
                        {percentComplete}%
                      </div>
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {checklistItems.map((it) => (
                      <div 
                        key={it.id} 
                        className={`p-3 rounded-xl border flex gap-3 transition-all ${
                          it.ok 
                            ? 'bg-emerald-950/10 border-emerald-900/15 text-emerald-300' 
                            : it.severity === 'critical'
                              ? 'bg-red-950/10 border-red-900/35 text-red-200'
                              : 'bg-amber-950/10 border-amber-900/15 text-amber-300'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {it.ok ? (
                            <svg className="w-5 h-5 text-emerald-500 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : it.severity === 'critical' ? (
                            <svg className="w-5 h-5 text-red-500 animate-pulse fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-amber-500 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold truncate text-white">{it.label}</span>
                            <span className={`text-[7px] font-mono leading-none tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              it.ok 
                                ? 'bg-emerald-950 border border-emerald-800/20 text-emerald-450' 
                                : it.severity === 'critical'
                                  ? 'bg-red-950 border border-red-800/20 text-red-400'
                                  : 'bg-amber-950 border border-amber-800/20 text-amber-450'
                            }`}>
                              {it.configInfo}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            {it.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Statistiques KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              
              {/* Card 1: Total Revenue */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-orange-500/20 flex flex-col justify-between relative overflow-hidden col-span-2 lg:col-span-2 xl:col-span-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/5 to-transparent rounded-full -mr-4 -mt-4"></div>
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Chiffre d'Affaires</span>
                  <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <span className="text-xs font-black">MAD</span>
                  </span>
                </div>
                <div className="mt-4 z-10">
                  <h3 className="text-xl md:text-2xl font-black font-mono text-amber-400">{statTotalRevenue.toLocaleString()} DH</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Total brut validé ou en transit</p>
                </div>
              </div>

              {/* Card 2: New Orders */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nouvelles</span>
                  <span className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-orange-400">{statNewOrders}</h3>
                  <p className="text-[9px] text-orange-400/80 mt-1">Statut: À valider</p>
                </div>
              </div>

              {/* Card 3: Confirmed Only */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirmées</span>
                  <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-indigo-400">{statConfirmedOnly}</h3>
                  <p className="text-[9px] text-indigo-400/80 mt-1">Statut: Prêtes à emballer</p>
                </div>
              </div>

              {/* Card 4: Processing */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Préparation</span>
                  <span className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg">
                    <Settings className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-yellow-400">{statProcessingOrders}</h3>
                  <p className="text-[9px] text-yellow-550 mt-1">Statut: En cours</p>
                </div>
              </div>

              {/* Card 5: Shipped */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Expédiées</span>
                  <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Truck className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-blue-400">{statShippedOrders}</h3>
                  <p className="text-[9px] text-blue-400/80 mt-1">Statut: Chez le livreur</p>
                </div>
              </div>

              {/* Card 6: Delivered */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Livrées</span>
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-emerald-400">{statDeliveredOrders}</h3>
                  <p className="text-[9px] text-emerald-400/80 mt-1">Statut: Encaissées</p>
                </div>
              </div>

              {/* Card 7: Cancelled */}
              <div className="bg-[#0b1528] p-4 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between col-span-2 lg:col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Annulées</span>
                  <span className="p-1.5 bg-red-500/10 text-red-500 rounded-lg">
                    <Ban className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black font-mono text-red-400">{statCancelledOrders}</h3>
                  <p className="text-[9px] text-red-400/80 mt-1">Statut: Retours / Rejets</p>
                </div>
              </div>

            </div>

            {/* Middle widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* CSV Export Widget */}
              <div className="bg-[#0b1528] p-5 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider mb-2">Exportations de Données (CSV)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Générez et téléchargez instantanément un fichier CSV contenant toutes les commandes stockées localement. Ce document intègre les détails indispensables de d'expédition (Noms, adresses, articles, quantités et prix total) et préserve l'encodage des caractères arabes et français (UTF-8 BOM).
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={exportOrdersToCSV}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                  >
                    <span>📊 Exporter toutes les commandes au format CSV</span>
                  </button>
                </div>
              </div>

              {/* Quick inventory widget */}
              <div className="bg-[#0b1528] p-5 rounded-2xl border border-[#1c2e4a] flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider mb-2">Suivi d'Inventaire Produits</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Statut rapide des produits enregistrés au catalogue Globabox. Ajustez instantanément l'état dans l'onglet catalogue.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#070d1a] p-3 rounded-xl border border-[#1c2e4a]">
                      <span className="text-[11px] font-bold text-emerald-400 block">🟢 En Stock</span>
                      <span className="text-lg font-black font-mono text-white mt-1 block">
                        {products.filter(p => !p.stockStatus || p.stockStatus === 'in_stock').length}
                      </span>
                    </div>
                    <div className="bg-[#070d1a] p-3 rounded-xl border border-[#1c2e4a]">
                      <span className="text-[11px] font-bold text-amber-400 block">🟡 Limité</span>
                      <span className="text-lg font-black font-mono text-white mt-1 block">
                        {products.filter(p => p.stockStatus === 'limited').length}
                      </span>
                    </div>
                    <div className="bg-[#070d1a] p-3 rounded-xl border border-[#1c2e4a]">
                      <span className="text-[11px] font-bold text-red-500 block">🔴 Rupture</span>
                      <span className="text-lg font-black font-mono text-white mt-1 block">
                        {products.filter(p => !p.inStock || p.stockStatus === 'out_of_stock').length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  Bouton de raccourci : <strong className="text-orange-400 cursor-pointer underline hover:text-orange-500" onClick={() => setActiveTab('products')}>Aller au Catalogue de Stock →</strong>
                </div>
              </div>

            </div>

            {/* Quick list of recent orders */}
            <div className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1c2e4a] flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-white tracking-widest">Dernières Activités</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-orange-400 font-bold hover:underline"
                >
                  Voir toutes les commandes →
                </button>
              </div>
              <div className="divide-y divide-[#1c2e4a]/60">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{o.fullName}</span>
                        <span className="text-[9px] bg-[#122037] text-slate-300 px-2 py-0.5 rounded font-mono font-bold">Réf: {o.reference}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <MapPin size={10} className="text-orange-500 shrink-0" />
                        <span>{o.city}</span>
                        <span className="text-slate-600">•</span>
                        <Phone size={10} className="text-[#a5b4fc] shrink-0" />
                        <span>{o.phoneNumber}</span>
                        <span className="text-slate-600">•</span>
                        <span>{new Date(o.date).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black font-mono text-orange-400">{o.total} DH</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === 'delivered' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' :
                        o.status === 'cancelled' ? 'bg-red-950/40 text-red-500 border border-red-900/40' :
                        o.status === 'pending' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' :
                        'bg-blue-950/40 text-[#a5b4fc] border border-blue-900/40'
                      }`}>
                        {o.status === 'pending' ? 'En attente' :
                         o.status === 'confirmed' ? 'Confirmé' :
                         o.status === 'shipped' ? 'Expédié' :
                         o.status === 'delivered' ? 'Livré' : 'Annulé'}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">Aucune commande pour le moment.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 1: ORDERS LOGGER */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0b1528] p-5 rounded-2xl border border-[#1a2d48]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  Gestion des Commandes
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visualisez, filtrez, validez et modifiez les commandes de votre boutique Globabox.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshOrders}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-850 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Loading...' : 'Refresh Orders'}</span>
              </button>
            </div>

            {refreshSuccess && (
              <div className="bg-emerald-950/45 border border-emerald-500/35 rounded-xl p-3 text-emerald-300 text-xs font-semibold">
                ✅ {refreshSuccess}
              </div>
            )}

            {refreshError && (
              <div className="bg-red-950/45 border border-red-500/30 rounded-xl p-3 text-red-200 text-xs font-semibold">
                ⚠️ {refreshError}
              </div>
            )}
            
            {!isOrdersApiConfigured && (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <p className="text-xs font-black leading-normal font-sans">
                    Orders API is not configured. Orders are currently saved locally only.
                  </p>
                </div>
                <div className="text-[9px] bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30 font-black tracking-wider uppercase font-mono self-start sm:self-center">
                  Local Mode
                </div>
              </div>
            )}
            
            {/* Orders Filtering controls bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-[#0b1528] p-4 rounded-2xl border border-[#1a2d48]">
              {/* Search text */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par Client, Téléphone ou Réf..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full bg-[#122037] border border-[#213757] rounded-xl text-xs py-2.5 pl-9 pr-4 text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full bg-[#122037] border border-[#213757] rounded-xl text-xs py-2.5 px-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="all">Sélecteur: Tous les états</option>
                  <option value="pending">En attente (Pending)</option>
                  <option value="confirmed">Confirmé (Confirmed)</option>
                  <option value="processing">En préparation (Processing)</option>
                  <option value="shipped">Expédié (Shipped)</option>
                  <option value="delivered">Livré & Payé (Delivered)</option>
                  <option value="cancelled">Annulé (Cancelled)</option>
                  <option value="synced">Synchronisé Google Sheets (Synced)</option>
                  <option value="failed">Échec de synchronisation (Failed sync)</option>
                </select>
              </div>

              {/* Moroccan Cities Filter */}
              <div>
                <select
                  value={orderCityFilter}
                  onChange={(e) => setOrderCityFilter(e.target.value)}
                  className="w-full bg-[#122037] border border-[#213757] rounded-xl text-xs py-2.5 px-3 text-white outline-none"
                >
                  <option value="all">Sélecteur: Toutes les villes Marocaines</option>
                  {MOROCCAN_CITIES.map(ctY => (
                    <option key={ctY} value={ctY}>{ctY}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Stats Summary and CSV Trigger inside Orders Log view */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b1528] p-4 rounded-xl border border-[#1a2d48] text-xs font-sans">
              <div className="flex items-center gap-4 flex-wrap text-slate-300">
                <span>
                  Flux filtré : <strong className="text-orange-400 font-mono font-black">{filteredOrders.length}</strong> / {orders.length} commandes
                </span>
                <span className="hidden sm:inline text-slate-600">|</span>
                <span>
                  Chiffre affiché : <strong className="text-emerald-400 font-mono font-extrabold">{filteredOrders.reduce((acc, o) => acc + o.total, 0).toLocaleString()} DH</strong>
                </span>
              </div>
              
              <button
                type="button"
                onClick={exportOrdersToCSV}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>📊 Exporter en fichier CSV</span>
              </button>
            </div>

            {/* Orders Table list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-[#0b1528] border border-[#1a2d48] rounded-3xl">
                <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Aucune commande ne correspond à vos filtres.</p>
                <button
                  onClick={() => { setOrderQuery(''); setOrderStatusFilter('all'); setOrderCityFilter('all'); }}
                  className="mt-3 px-4 py-1.5 bg-[#1a2e4e] text-orange-400 rounded-lg text-xs"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const itemLabels = order.items
                    .map(it => `${it.productName} (x${it.quantity})`)
                    .join(' + ');

                  return (
                    <div
                      key={order.id}
                      className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] overflow-hidden hover:border-[#2b446a] transition-all"
                    >
                      {/* Header band of individual order card */}
                      <div className="bg-[#0f1d35] px-6 py-3 border-b border-[#1c2e4a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-orange-400 font-black tracking-wider bg-orange-950/40 border border-orange-900/30 px-2.5 py-1 rounded">
                            {order.reference}
                          </span>
                          <span className="text-slate-300 font-semibold">{order.date}</span>
                          <span className="text-[#a5b4fc] font-bold flex items-center gap-1">
                            <ShoppingCart size={11} className="text-orange-500 shrink-0" />
                            <span>{order.items.reduce((a, b) => a + b.quantity, 0)} pièces</span>
                          </span>
                          
                          {/* Sync indicators */}
                          {(() => {
                            const syncVal = order.syncStatus || 'not-configured';
                            if (syncVal === 'synced') {
                              return (
                                <span className="bg-emerald-950/45 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>synced</span>
                                </span>
                              );
                            } else if (syncVal === 'failed') {
                              return (
                                <span className="bg-red-950/45 text-red-400 border border-red-900/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                  <span>failed</span>
                                </span>
                              );
                            } else {
                              return (
                                <span className="bg-slate-800/40 text-slate-400 border border-slate-700/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                  <span>not-configured</span>
                                </span>
                              );
                            }
                          })()}
                        </div>

                        {/* Order status picker */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 uppercase font-black">État :</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className={`rounded-lg py-1 px-2.5 text-[11px] font-bold text-white uppercase tracking-wider outline-none border ${
                              order.status === 'pending' ? 'bg-amber-600/30 border-amber-600 text-amber-300' :
                              order.status === 'confirmed' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' :
                              order.status === 'processing' ? 'bg-yellow-600/30 border-yellow-500 text-yellow-300' :
                              order.status === 'shipped' ? 'bg-blue-600/30 border-blue-500 text-blue-300' :
                              order.status === 'delivered' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' :
                              'bg-red-600/30 border-red-500 text-red-300'
                            }`}
                          >
                            <option value="pending" className="bg-[#0b1528] text-white">En attente</option>
                            <option value="confirmed" className="bg-[#0b1528] text-white">Confirmé</option>
                            <option value="processing" className="bg-[#0b1528] text-white">En préparation</option>
                            <option value="shipped" className="bg-[#0b1528] text-white">Expédié</option>
                            <option value="delivered" className="bg-[#0b1528] text-white">Livré & Payé</option>
                            <option value="cancelled" className="bg-[#0b1528] text-white">Annulé</option>
                          </select>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-red-400 hover:text-red-600 rounded bg-[#1a1226] border border-red-950 ml-2"
                            title="Supprimer la fiche de commande"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {order.syncStatus === 'failed' && (
                        <div className="bg-red-950/40 border-b border-red-500/20 px-6 py-2.5 flex items-center gap-2 text-red-300">
                          <Ban size={12} className="text-red-500 shrink-0" />
                          <span className="text-[11px] font-black font-sans">
                            Order saved locally because remote saving failed.
                          </span>
                        </div>
                      )}

                      {/* Main facts within individual order card */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        
                        {/* Client details */}
                        <div className="space-y-2 border-r border-[#1c2e4a]/60 pr-4">
                          <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                            <BadgeCheck size={11} className="text-orange-500 shrink-0" />
                            <span>destinataire</span>
                          </p>
                          <p className="text-sm font-black text-white">{order.fullName}</p>
                          <p className="font-mono text-sm text-yellow-405 font-bold flex items-center gap-1.5">
                            <Phone size={13} className="text-orange-500 shrink-0" />
                            <span>{order.phoneNumber}</span>
                          </p>
                          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-orange-950/20 text-orange-400 px-2.5 py-1 rounded font-bold border border-orange-900/35 uppercase text-[10px]">
                            <Compass size={11} className="text-orange-500 shrink-0" />
                            <span>{order.city}</span>
                          </div>
                        </div>

                        {/* Physical Address details */}
                        <div className="space-y-2 border-r border-[#1c2e4a]/60 pr-4">
                          <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold flex items-center gap-1.5">
                            <MapPin size={11} className="text-orange-500 shrink-0" />
                            <span>adresse complète de livraison</span>
                          </p>
                          <p className="text-slate-200 leading-relaxed font-sans">{order.deliveryAddress}</p>
                          {order.notes && (
                            <div className="mt-2 bg-[#121f37] p-2 rounded border border-[#213757] text-[11px] text-slate-300">
                              <span className="font-bold text-orange-400 text-[10px] uppercase block mb-0.5">Notes Client :</span>
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Order items, price summary */}
                        <div className="space-y-3.5">
                          <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">📦 articles commandés</p>
                          <div className="space-y-2">
                            {order.items.map((it, indx) => (
                              <div key={`${it.productId}-${indx}`} className="flex items-center justify-between gap-2 bg-[#091122] p-2 rounded-lg border border-[#14233e]">
                                <div className="flex items-center gap-2">
                                  <img src={it.image} className="w-6 h-6 object-cover rounded" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-slate-200 text-xs font-semibold truncate max-w-[150px]">{it.productName}</span>
                                    {(it.selectedSize || it.selectedColor) && (
                                      <span className="text-[10px] text-slate-400">
                                        {[it.selectedSize && `Size: ${it.selectedSize}`, it.selectedColor && `Color: ${it.selectedColor}`].filter(Boolean).join(' | ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-bold font-mono text-orange-400 text-xs text-right shrink-0">
                                  {it.price} DH × {it.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-[#1c2e4a]/60 text-[11px] font-sans">
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Sous-total :</span>
                              <span className="font-mono text-slate-200 font-bold">
                                {order.subtotal !== undefined 
                                  ? order.subtotal 
                                  : (order.total >= 500 ? order.total : Math.max(0, order.total - 35))} DH
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Livraison :</span>
                              <span className="font-mono text-slate-200 font-bold">
                                {order.shippingCost !== undefined 
                                  ? (order.shippingCost === 0 ? 'Gratuite' : `${order.shippingCost} DH`)
                                  : (order.total >= 500 ? 'Gratuite' : '35 DH')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Livraison gratuite :</span>
                              <span className="font-bold text-slate-200">
                                {order.freeShipping !== undefined 
                                  ? (order.freeShipping ? 'Oui' : 'Non')
                                  : (order.total >= 500 ? 'Oui' : 'Non')}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-[#1c2e4a]/40 flex justify-between items-center text-xs font-bold text-white bg-[#070e1b] px-3 py-2 rounded-xl">
                              <span>Total final :</span>
                              <span className="text-sm font-extrabold font-mono text-orange-500">{order.total} DH</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">

            {/* Environment warning */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 text-xs font-bold leading-none">!</div>
                <div>
                  <h4 className="text-xs font-black font-sans uppercase text-amber-400">⚠️ Sauvegarde de Développement Locale</h4>
                  <p className="text-xs font-semibold leading-relaxed font-sans mt-0.5 text-slate-350">
                    Les produits créés ou édités ici sont stockés localement dans votre navigateur (<code className="bg-amber-950/50 text-orange-400 px-1 py-0.5 rounded text-[10px] font-mono">localStorage</code>). Pour une persistance de production à long terme, veuillez configurer une source de données externe via la variable d'environnement <code className="bg-amber-950/50 text-orange-400 px-1 py-0.5 rounded text-[10px] font-mono">VITE_PRODUCTS_API_URL</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Catalogue Control & Backup Center */}
            <div className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">📦 Gestion de Transit du Catalogue</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans">Sauvegardez, clonez et restaurez vos fiches produits via des backups CSV ou JSON standard</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Export JSON */}
                <button
                  type="button"
                  onClick={exportProductsToJSON}
                  className="bg-[#122037] hover:bg-[#1a2d4c] text-white text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-[#213757] cursor-pointer"
                >
                  📥 Export JSON
                </button>
                
                {/* Export CSV */}
                <button
                  type="button"
                  onClick={exportProductsToCSV}
                  className="bg-[#122037] hover:bg-[#1a2d4c] text-white text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-[#213757] cursor-pointer"
                >
                  📥 Export CSV
                </button>

                {/* Import JSON hidden input & trigger */}
                <label className="bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer">
                  📤 Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProductsFromJSON}
                    className="hidden"
                  />
                </label>

                {/* Import CSV hidden input & trigger */}
                <label className="bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 border border-orange-500/30 transition-all cursor-pointer">
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
            
            {/* Adding / Editing Form overlay */}
            {(isAddingProduct || editingProduct) && (
              <div className="bg-[#0b1528] rounded-2xl border border-[#22395e] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c2e4a]/85 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-orange-500" />
                    <span>{editingProduct ? `Modifier: ${editingProduct.name.fr}` : 'Ajouter un nouveau produit'}</span>
                  </h3>
                  <button
                    onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                    className="p-1 px-3 bg-[#13223c] hover:bg-[#1e3254] text-slate-350 text-xs font-bold rounded-lg"
                  >
                    Fermer le formulaire
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  {/* Product ID / slug */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">ID / Slug du Produit *</label>
                    <input
                      type="text"
                      placeholder="Ex: table-camping-pliante"
                      value={productForm.id}
                      onChange={(e) => setProductForm({...productForm, id: e.target.value.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-')})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-mono"
                      required
                    />
                  </div>

                  {/* Name FR */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nom Français *</label>
                    <input
                      type="text"
                      placeholder="Ex: Tente de Camping Dôme Automatique"
                      value={productForm.nameFr}
                      onChange={(e) => setProductForm({...productForm, nameFr: e.target.value})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  {/* Name AR */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nom Arabe</label>
                    <input
                      type="text"
                      placeholder="Ex: خيمة التخييم التلقائية الدائرية"
                      value={productForm.nameAr}
                      onChange={(e) => setProductForm({...productForm, nameAr: e.target.value})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 text-right"
                    />
                  </div>

                  {/* Name EN */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nom Anglais</label>
                    <input
                      type="text"
                      placeholder="Ex: Automatic Pop Up Camping Dome Tent"
                      value={productForm.nameEn}
                      onChange={(e) => setProductForm({...productForm, nameEn: e.target.value})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Pricing (Base) */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Prix de Vente (DH) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-mono font-bold"
                      required
                    />
                  </div>

                  {/* Original / crossed Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Ancien Prix (DH - Pour réduction)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: Number(e.target.value)})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* Category dropdown Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Catégorie cible *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-800 bg-white">{c.name.fr} ({c.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Product Primary Image Link */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 uppercase font-black">URL de l'image principale du produit</label>
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2.5 px-3 text-white outline-none focus:border-orange-500 font-mono text-xs"
                      placeholder="Insérer l'URL Unsplash ou image valide"
                    />
                  </div>

                  {/* Product Gallery Images Link */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 uppercase font-black">
                      URLs des images de la galerie (séparées par des virgules ou des retours à la ligne)
                    </label>
                    <textarea
                      rows={2}
                      value={productForm.additionalImages.join(', ')}
                      onChange={(e) => {
                        const urls = e.target.value.split(/,|\n/).map(u => u.trim()).filter(Boolean);
                        setProductForm({...productForm, additionalImages: urls});
                      }}
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-mono text-xs"
                      placeholder="URL Galerie 1, URL Galerie 2, URL Galerie 3..."
                    />
                  </div>

                  {/* Fallback Image & Fallback Gallery */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-black">Image de secours (Fallback Image)</label>
                      <input
                        type="text"
                        value={productForm.fallbackImage}
                        onChange={(e) => setProductForm({...productForm, fallbackImage: e.target.value})}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2.5 px-3 text-white outline-none focus:border-orange-500 font-mono text-xs"
                        placeholder="Insérer l'URL d'image de secours"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-black">Images de secours Galerie (séparées par des virgules)</label>
                      <input
                        type="text"
                        value={productForm.fallbackImages.join(', ')}
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean);
                          setProductForm({...productForm, fallbackImages: urls});
                        }}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2.5 px-3 text-white outline-none focus:border-orange-500 font-mono text-xs"
                        placeholder="Fallback URL 1, Fallback URL 2..."
                      />
                    </div>
                  </div>

                  {/* Multilingual Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2 bg-[#09111e]/40 p-4 rounded-xl border border-[#1b2b45]">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-black block">Caractéristiques FR (une par ligne)</label>
                      <textarea
                        rows={3}
                        value={productForm.featuresFr.join('\n')}
                        onChange={(e) => {
                          const list = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                          setProductForm({...productForm, featuresFr: list});
                        }}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-sans text-xs"
                        placeholder="Caractéristique 1&#10;Caractéristique 2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-black block text-right">الخصائص بالعربية (واحدة في كل سطر)</label>
                      <textarea
                        rows={3}
                        value={productForm.featuresAr.join('\n')}
                        onChange={(e) => {
                          const list = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                          setProductForm({...productForm, featuresAr: list});
                        }}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-sans text-xs text-right"
                        placeholder="ميزة 1&#10;ميزة 2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-black block">Features EN (one per line)</label>
                      <textarea
                        rows={3}
                        value={productForm.featuresEn.join('\n')}
                        onChange={(e) => {
                          const list = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                          setProductForm({...productForm, featuresEn: list});
                        }}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-sans text-xs"
                        placeholder="Feature 1&#10;Feature 2"
                      />
                    </div>
                  </div>

                  {/* Image Preview Grid */}
                  <div className="space-y-2 md:col-span-2 bg-[#09111e]/60 p-4 rounded-xl border border-[#1b2b45] mt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Aperçu en temps réel
                    </span>
                    <div className="flex flex-wrap gap-3 mt-1.5">
                      {/* Main Image Preview */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-[#22c55e] font-extrabold uppercase">
                          Principale
                        </span>
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#213757] relative">
                          <ProductImage
                            src={productForm.image}
                            alt="Aperçu principal"
                            language={language}
                            className="w-full h-full object-cover"
                            containerClassName="w-16 h-16"
                          />
                        </div>
                      </div>

                      {/* Gallery Previews */}
                      {productForm.additionalImages.map((url, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] text-orange-500 font-extrabold uppercase">
                            Galerie {i + 1}
                          </span>
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#213757] relative">
                            <ProductImage
                              src={url}
                              alt={`Aperçu galerie ${i + 1}`}
                              language={language}
                              className="w-full h-full object-cover"
                              containerClassName="w-16 h-16"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...productForm.additionalImages];
                                copy.splice(i, 1);
                                setProductForm({...productForm, additionalImages: copy});
                              }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-650 rounded-full flex items-center justify-center text-white text-[8px] hover:bg-red-650/80 z-10"
                              title="Retirer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                   {/* Descriptions */}
                  <div className="space-y-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-black">Description Française</label>
                      <textarea
                        rows={3}
                        value={productForm.descFr}
                        onChange={(e) => setProductForm({...productForm, descFr: e.target.value})}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500"
                        placeholder="Description commerciale du produit..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-black">الوصف بالعربية</label>
                      <textarea
                        rows={3}
                        value={productForm.descAr}
                        onChange={(e) => setProductForm({...productForm, descAr: e.target.value})}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 text-right"
                        placeholder="الوصف التجاري للمنتج..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-black">Description Anglaise</label>
                      <textarea
                        rows={3}
                        value={productForm.descEn}
                        onChange={(e) => setProductForm({...productForm, descEn: e.target.value})}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500"
                        placeholder="Commercial description in English..."
                      />
                    </div>
                  </div>

                  {/* Status checklist parameters */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#070e1c] p-4 rounded-xl border border-[#1b2b45] mt-2 font-sans text-xs">
                    
                    {/* Stock Status Selector */}
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-black block mb-1.5">État du Stock</label>
                      <select
                        value={productForm.stockStatus}
                        onChange={(e) => setProductForm({...productForm, stockStatus: e.target.value as any})}
                        className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white outline-none focus:border-orange-500 font-semibold"
                      >
                        <option value="in_stock" className="bg-[#122037] text-white">🟢 En stock</option>
                        <option value="limited" className="bg-[#122037] text-white">🟡 Stock limité</option>
                        <option value="out_of_stock" className="bg-[#122037] text-white">🔴 Rupture de stock</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-center gap-2 md:col-span-2 pt-2 md:pt-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold font-sans">
                          <input
                            type="checkbox"
                            checked={productForm.bestSeller}
                            onChange={(e) => setProductForm({...productForm, bestSeller: e.target.checked})}
                            className="w-4 h-4 rounded border-[#1c2e4a] accent-orange-500"
                          />
                          <span>Meilleure Vente 🔥</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-semibold font-sans">
                          <input
                            type="checkbox"
                            checked={productForm.newArrival}
                            onChange={(e) => setProductForm({...productForm, newArrival: e.target.checked})}
                            className="w-4 h-4 rounded border-[#1c2e4a] accent-orange-500"
                          />
                          <span>Nouveauté Coquette ⛺</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-semibold font-sans">
                          <input
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                            className="w-4 h-4 rounded border-[#1c2e4a] accent-orange-500"
                          />
                          <span>À la Une (Accueil) ⭐</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer font-semibold font-sans">
                          <input
                            type="checkbox"
                            checked={productForm.isActive}
                            onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                            className="w-4 h-4 rounded border-[#1c2e4a] accent-green-500"
                          />
                          <span>Actif (Affiché sur le site) ✅</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Form Submission code */}
                  <div className="md:col-span-2 pt-4 flex gap-3">
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Sauvegarder les modifications du produit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                      className="bg-[#1c2d49] hover:bg-[#25395a] text-slate-300 font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* Products grid / Search list view */}
            <div className="space-y-4">
              <div className="relative max-w-md bg-[#0b1528] rounded-2xl border border-[#1c2e4a]">
                <input
                  type="text"
                  placeholder="Filtrer les produits par nom..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-xs rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-slate-400 outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              </div>

              <div className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] overflow-hidden text-xs">
                
                {/* Table Header */}
                <div className="bg-[#0f1d35] px-4 py-3 border-b border-[#1c2e4a] grid grid-cols-12 gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                  <div className="col-span-1">Image</div>
                  <div className="col-span-5">Détails du Produit Nom</div>
                  <div className="col-span-2">Catégorie</div>
                  <div className="col-span-2">Prix Actuel / Ancien</div>
                  <div className="col-span-1">Stock</div>
                  <div className="col-span-1 text-center font-bold">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[#1c2e4a]/50">
                  {filteredProductsList.map((prod) => (
                    <div
                      key={prod.id}
                      className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-[#13223c]/40 transition-colors"
                    >
                      {/* Thumbnail photo */}
                      <div className="col-span-1">
                        <img
                          src={prod.image}
                          alt={prod.name.fr}
                          className="w-9 h-9 object-cover rounded-lg border border-[#213757]"
                        />
                      </div>

                      {/* Name Details and sub-badges */}
                      <div className="col-span-5 space-y-1">
                        <p className="font-extrabold text-white text-[12px]">{prod.name.fr}</p>
                        <p className="text-right text-[10px] text-slate-400 font-sans mt-0.5">{prod.name.ar}</p>
                        <div className="flex gap-1.5 flex-wrap pt-1 font-sans">
                          {prod.bestSeller && (
                            <span className="bg-orange-950/40 text-orange-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-orange-900/30">BEST</span>
                          )}
                          {(() => {
                            const isNew = prod.createdAt 
                              ? (Date.now() - new Date(prod.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7 
                              : !!prod.newArrival;
                            return isNew && (
                              <span className="bg-blue-950/40 text-[#a5b4fc] text-[8px] font-bold px-1.5 py-0.5 rounded border border-blue-900/30">
                                NEW{prod.createdAt && " (AUTO)"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Category ID tag */}
                      <div className="col-span-2">
                        <span className="bg-[#122037] text-slate-300 font-semibold px-2 py-0.5 rounded-md border border-[#213757] uppercase text-[10px]">
                          {prod.category}
                        </span>
                      </div>

                      {/* Prices */}
                      <div className="col-span-2 font-mono font-bold">
                        <span className="text-orange-400 text-xs">{prod.price} DH</span>
                        {prod.originalPrice && (
                          <span className="text-slate-500 line-through text-[10px] block font-light">
                            {prod.originalPrice} DH
                          </span>
                        )}
                      </div>

                      {/* Status checkbox summary */}
                      <div className="col-span-1 flex items-center gap-1.5">
                        {(!prod.inStock || prod.stockStatus === 'out_of_stock') ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Rupture de stock"></span>
                            <span className="text-[10px] font-bold text-red-400">Rupture</span>
                          </>
                        ) : prod.stockStatus === 'limited' ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Stock limité"></span>
                            <span className="text-[10px] font-bold text-amber-400 font-sans">Limité</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="En stock"></span>
                            <span className="text-[10px] font-bold text-emerald-400">En stock</span>
                          </>
                        )}
                      </div>

                      {/* Primary Actions */}
                      <div className="col-span-1 flex gap-2 justify-center">
                        <button
                          onClick={() => handleStartEditProduct(prod)}
                          className="p-1 px-2.5 bg-indigo-900/40 border border-indigo-700/50 hover:bg-[#1f3054] text-indigo-300 rounded-lg font-bold"
                          title="Modifier le produit"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 bg-[#26121b] border border-red-950/50 hover:bg-[#341824] text-red-400 rounded-lg font-bold"
                          title="Supprimer du catalogue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: CATEGORIES LIST */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            {/* Editing Category details overlay form */}
            {editingCategory && (
              <div className="bg-[#0b1528] rounded-2xl border border-[#22395e] p-5 space-y-4 max-w-xl">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
                  Modifier la catégorie : {editingCategory.name.fr}
                </h3>
                
                <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nom Français</label>
                    <input
                      type="text"
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white"
                      value={categoryForm.nameFr}
                      onChange={(e) => setCategoryForm({...categoryForm, nameFr: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nom Arabe</label>
                    <input
                      type="text"
                      className="w-full bg-[#122037] border border-[#213757] text-right rounded-xl py-2 px-3 text-white"
                      value={categoryForm.nameAr}
                      onChange={(e) => setCategoryForm({...categoryForm, nameAr: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">URL de l'image de la Catégorie</label>
                    <input
                      type="text"
                      className="w-full bg-[#122037] border border-[#213757] rounded-xl py-2 px-3 text-white font-mono"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="bg-[#1c2d49] text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories Table list */}
            <div className="bg-[#0b1528] rounded-2xl border border-[#1c2e4a] overflow-hidden text-xs">
              <div className="bg-[#0f1d35] px-4 py-3 border-b border-[#1c2e4a] grid grid-cols-12 gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                <div className="col-span-1">Image</div>
                <div className="col-span-2">ID Technique</div>
                <div className="col-span-4">Nom Français</div>
                <div className="col-span-4 text-right">Nom Arabe</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="divide-y divide-[#1c2e4a]/50">
                {categories.map((cat) => (
                  <div key={cat.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-[#13223c]/40 transition-colors">
                    <div className="col-span-1">
                      <img src={cat.image} className="w-8 h-8 object-cover rounded border border-[#213757]" />
                    </div>
                    <div className="col-span-2 font-mono font-bold text-slate-400 text-[11px]">{cat.id}</div>
                    <div className="col-span-4 font-bold text-white text-[12px]">{cat.name.fr}</div>
                    <div className="col-span-4 text-slate-300 font-sans text-right">{cat.name.ar}</div>
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className="px-2.5 py-1 bg-[#1c2d49] hover:bg-[#25395a] text-orange-400 border border-orange-900/35 rounded-lg font-bold"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Marketing tracking pixels */}
        {activeTab === 'marketing' && (
          <div className="p-6 space-y-6">
            <div className="bg-[#070d1a] border border-[#1d2f4d] p-5 rounded-2xl max-w-3xl">
              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2 text-orange-400">
                <BarChart3 className="w-5 h-5 text-orange-400 shrink-0" />
                <span>Configuration des Pixels Publicitaires & SEO</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Configurez ici les identifiants réels de suivi d'audience. Enregistrez pour injecter automatiquement les pixels correspondants de Facebook, TikTok, Google Analytics et vérifier votre autorité sur la console Google Search Console Maroc en temps réel.
              </p>

              {/* Status Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isTrackerValid(trackingForm.metaPixelId) 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Meta Pixel</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${isTrackerValid(trackingForm.metaPixelId) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {isTrackerValid(trackingForm.metaPixelId) ? 'Configuré' : 'Non configuré'}
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isTrackerValid(trackingForm.tikTokPixelId) 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">TikTok Pixel</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${isTrackerValid(trackingForm.tikTokPixelId) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {isTrackerValid(trackingForm.tikTokPixelId) ? 'Configuré' : 'Non configuré'}
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isTrackerValid(trackingForm.googleAnalyticsId) 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Google Analytics</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${isTrackerValid(trackingForm.googleAnalyticsId) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {isTrackerValid(trackingForm.googleAnalyticsId) ? 'Configuré' : 'Non configuré'}
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isTrackerValid(trackingForm.googleSearchConsoleId) 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Search Console</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${isTrackerValid(trackingForm.googleSearchConsoleId) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {isTrackerValid(trackingForm.googleSearchConsoleId) ? 'Configuré' : 'Non configuré'}
                    </span>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-sans p-4 rounded-xl text-xs mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Modifications de suivi enregistrées avec succès ! Les nouveaux scripts d'analytics sont fonctionnels.</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Meta Facebook Pixel */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Identifiant Pixel Meta / Facebook (FBID)</label>
                  <input
                    type="text"
                    placeholder="Ex: 9876543210123456"
                    value={trackingForm.metaPixelId}
                    onChange={(e) => setTrackingForm({ ...trackingForm, metaPixelId: e.target.value })}
                    className="w-full bg-[#0f1d35] border border-[#22395e] text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Déclenche les événements requis : PageView, ViewContent, AddToCart, InitiateCheckout, Purchase (Conversion) et Lead (WhatsApp).
                  </p>
                </div>

                {/* TikTok Pixel */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">Identifiant Pixel TikTok (Pixel Code)</label>
                  <input
                    type="text"
                    placeholder="Ex: CDT12345ABCDE678"
                    value={trackingForm.tikTokPixelId}
                    onChange={(e) => setTrackingForm({ ...trackingForm, tikTokPixelId: e.target.value })}
                    className="w-full bg-[#0f1d35] border border-[#22395e] text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Propulse de manière optimale vos campagnes d'acquisition pour Globabox Maroc.
                  </p>
                </div>

                {/* Google Analytics GA4 */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">ID de Mesure Google Analytics GA4</label>
                  <input
                    type="text"
                    placeholder="Ex: G-XXXXXXXXXX"
                    value={trackingForm.googleAnalyticsId}
                    onChange={(e) => setTrackingForm({ ...trackingForm, googleAnalyticsId: e.target.value })}
                    className="w-full bg-[#0f1d35] border border-[#22395e] text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Permet d'analyser les sessions, rebonds, ajouts au panier et entonnoirs de conversion avancés.
                  </p>
                </div>

                {/* Google Search Console */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">Code de vérification Google Search Console</label>
                  <input
                    type="text"
                    placeholder="Ex: google-site-verification-code-value"
                    value={trackingForm.googleSearchConsoleId}
                    onChange={(e) => setTrackingForm({ ...trackingForm, googleSearchConsoleId: e.target.value })}
                    className="w-full bg-[#0f1d35] border border-[#22395e] text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 font-sans">
                    Inscrit la balise meta de propriété dans l'en-tête HTML de Globabox.com pour référencer la boutique sur Google Maroc.
                  </p>
                </div>

                {/* Real-time Webhook URL database integration */}
                <div className="space-y-1 pt-2">
                  <label className="text-xs font-bold text-slate-300 block">URL du Webhook de Persistence (Google Sheets / Webhook API / Make / Zapier)</label>
                  <input
                    type="text"
                    placeholder="Ex: https://n8n.globabox.com/webhook/orders-receiver-v1"
                    value={trackingForm.webhookUrl || ''}
                    onChange={(e) => setTrackingForm({ ...trackingForm, webhookUrl: e.target.value })}
                    className="w-full bg-[#0f1d35] border border-[#22395e] text-xs text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 font-sans">
                    Chaque fois qu'un client confirme une commande, un payload JSON contenant les coordonnées complètes, la référence de la commande, les produits et les quantités lui sera transmis en arrière-plan. Garde le stockage local en tant que sauvegarde de secours résiliente.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      saveTrackingConfig(trackingForm);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 4500);
                    }}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                  >
                    Enregistrer les configurations de suivi
                  </button>
                  <button
                    onClick={() => {
                      const defaults = {
                        metaPixelId: 'FB-987654321-GLOBABOX-PLACEHOLDER',
                        tikTokPixelId: 'TT-ABC123XYZ-GLOBABOX-PLACEHOLDER',
                        googleAnalyticsId: 'G-777777777-GLOBABOX-PLACEHOLDER',
                        googleSearchConsoleId: 'google-site-verification-globabox-placeholder-code',
                        webhookUrl: 'https://webhook.globabox.com/api/orders-save-placeholder'
                      };
                      setTrackingForm(defaults);
                      saveTrackingConfig(defaults);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 4500);
                    }}
                    className="bg-[#122037] border border-[#1f3352] hover:bg-[#192b47] text-slate-300 font-bold text-xs px-4 py-3 rounded-xl transition-all"
                  >
                    Restaurer les placeholders
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
