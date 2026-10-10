import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'orders.json');
const PRODUCTS_DB_FILE = path.join(process.cwd(), 'products.json');

import { PRODUCTS as BASE_PRODUCTS } from './src/data';

function readLocalProducts(): any[] {
  try {
    if (!fs.existsSync(PRODUCTS_DB_FILE)) {
      writeLocalProducts(BASE_PRODUCTS);
      return BASE_PRODUCTS;
    }
    const data = fs.readFileSync(PRODUCTS_DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products from disk:', err);
    return BASE_PRODUCTS;
  }
}

function writeLocalProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_DB_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing products to disk:', err);
  }
}

function parseJsonOrCsv(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  const str = String(val).trim();
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }
  return str.split(/,|\n/).map(s => s.trim()).filter(Boolean);
}

app.use(express.json());

import { requireAdminApiKey } from './src/server/adminAuth';
import { importProductsRouter } from './src/server/importProducts';
// All administrative operations are protected on the server.
app.use('/api/products', (req, res, next) => req.method === 'GET' ? next() : requireAdminApiKey(req, res, next));
app.use('/api/orders-clear', requireAdminApiKey);
app.use('/api/orders', (req, res, next) => (req.method === 'POST' && req.path === '/') ? next() : requireAdminApiKey(req, res, next));


// Helper to read orders
function readOrders(): any[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders from disk:', err);
    return [];
  }
}

// Helper to write orders
function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing orders to disk:', err);
  }
}

// Ensure the DB file exists
if (!fs.existsSync(DB_FILE)) {
  writeOrders([]);
}

app.use('/api/import-products', importProductsRouter(readLocalProducts, writeLocalProducts));

// API Routes

// 0. Configuration Status Info for Admin Panel UI
app.get('/api/config', (req, res) => {
  const sheetsUrl = process.env.VITE_ORDERS_API_URL || process.env.ORDERS_API_URL || '';
  const productsUrl = process.env.VITE_PRODUCTS_API_URL || process.env.PRODUCTS_API_URL || '';
  res.json({
    isConfigured: !!(sheetsUrl && sheetsUrl.trim() !== ''),
    ordersApiUrl: sheetsUrl,
    isProductsConfigured: !!(productsUrl && productsUrl.trim() !== ''),
    productsApiUrl: productsUrl
  });
});

// Products API
app.get('/api/products', async (req, res) => {
  const sheetsUrl = process.env.VITE_PRODUCTS_API_URL || process.env.PRODUCTS_API_URL;
  
  if (sheetsUrl && sheetsUrl.trim() !== '') {
    try {
      console.log(`[PRODUCTS] loading from Google Sheets`);
      let targetUrl = sheetsUrl;
      if (!targetUrl.includes('sheet=')) {
        targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'sheet=Products';
      }
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(15000)
      });
      if (response.ok) {
        const remoteData = await response.json();
        if (Array.isArray(remoteData)) {
          console.log(`[PRODUCTS] loaded from Google Sheets`);
          
          const processed = remoteData.map((r: any) => {
            return {
              id: r.id,
              name: {
                fr: r.name_fr || '',
                ar: r.name_ar || '',
                en: r.name_en || ''
              },
              price: Number(r.price || 0),
              originalPrice: r.originalPrice ? Number(r.originalPrice) : undefined,
              category: r.category || '',
              stockStatus: r.stockStatus || 'in_stock',
              inStock: r.stockStatus !== 'out_of_stock',
              bestSeller: r.bestSeller === true || String(r.bestSeller).toLowerCase() === 'true',
              newArrival: r.newArrival === true || String(r.newArrival).toLowerCase() === 'true',
              description: {
                fr: r.description_fr || r.short_description_fr || '',
                ar: r.description_ar || r.short_description_ar || '',
                en: r.description_en || r.short_description_en || ''
              },
              image: r.image || '',
              images: parseJsonOrCsv(r.images || r.image),
              fallbackImage: r.fallbackImage || '',
              fallbackImages: parseJsonOrCsv(r.fallbackImages),
              features: {
                fr: parseJsonOrCsv(r.features_fr),
                ar: parseJsonOrCsv(r.features_ar),
                en: parseJsonOrCsv(r.features_en)
              },
              additionalImages: parseJsonOrCsv(r.images || r.image).slice(1),
              rating: Number(r.rating || 4.8),
              reviewsCount: Number(r.reviewsCount || 25),
              isActive: r.isActive !== undefined ? (r.isActive === true || String(r.isActive).toLowerCase() === 'true') : true,
              sortOrder: r.sortOrder !== undefined ? Number(r.sortOrder) : 0,
              createdAt: r.createdAt || '',
              updatedAt: r.updatedAt || ''
            };
          });

          writeLocalProducts(processed);
          return res.json(processed);
        }
      }
    } catch (err: any) {
      console.warn(`[PRODUCTS] Failed to load from Google Sheets:`, err.message);
    }
  }

  console.log(`[PRODUCTS] fallback to local data`);
  const products = readLocalProducts();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.id) {
    return res.status(400).json({ error: 'Product detail is missing' });
  }

  const localProducts = readLocalProducts();
  if (localProducts.some(p => p.id === newProduct.id)) {
    return res.status(400).json({ error: 'Product already exists' });
  }

  const updated = [newProduct, ...localProducts];
  writeLocalProducts(updated);
  console.log(`[ADMIN PRODUCTS] product created`);

  const sheetsUrl = process.env.VITE_PRODUCTS_API_URL || process.env.PRODUCTS_API_URL;
  if (sheetsUrl && sheetsUrl.trim() !== '') {
    try {
      const flatPayload = {
        action: 'create',
        id: newProduct.id,
        name_fr: newProduct.name?.fr || '',
        name_ar: newProduct.name?.ar || '',
        name_en: newProduct.name?.en || '',
        category: newProduct.category || '',
        price: Number(newProduct.price || 0),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : '',
        stockStatus: newProduct.stockStatus || 'in_stock',
        bestSeller: !!newProduct.bestSeller,
        newArrival: !!newProduct.newArrival,
        description_fr: newProduct.description?.fr || '',
        description_ar: newProduct.description?.ar || '',
        description_en: newProduct.description?.en || '',
        image: newProduct.image || '',
        images: JSON.stringify(newProduct.images || [newProduct.image]),
        fallbackImage: newProduct.fallbackImage || '',
        fallbackImages: JSON.stringify(newProduct.fallbackImages || []),
        features_fr: JSON.stringify(newProduct.features?.fr || []),
        features_ar: JSON.stringify(newProduct.features?.ar || []),
        features_en: JSON.stringify(newProduct.features?.en || []),
        isActive: newProduct.isActive !== undefined ? newProduct.isActive : true,
        sortOrder: newProduct.sortOrder !== undefined ? newProduct.sortOrder : 0,
        createdAt: newProduct.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flatPayload),
        signal: AbortSignal.timeout(10000)
      });
    } catch (err: any) {
      console.warn(`[PRODUCTS SYNC] sync failed on create:`, err.message);
    }
  }

  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  if (!updatedProduct) {
    return res.status(400).json({ error: 'Data is missing' });
  }

  const localProducts = readLocalProducts();
  const index = localProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    localProducts[index] = { ...localProducts[index], ...updatedProduct };
    writeLocalProducts(localProducts);
    console.log(`[ADMIN PRODUCTS] product updated`);

    const sheetsUrl = process.env.VITE_PRODUCTS_API_URL || process.env.PRODUCTS_API_URL;
    if (sheetsUrl && sheetsUrl.trim() !== '') {
      try {
        const p = localProducts[index];
        const flatPayload = {
          action: 'update',
          id: p.id,
          name_fr: p.name?.fr || '',
          name_ar: p.name?.ar || '',
          name_en: p.name?.en || '',
          category: p.category || '',
          price: Number(p.price || 0),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : '',
          stockStatus: p.stockStatus || 'in_stock',
          bestSeller: !!p.bestSeller,
          newArrival: !!p.newArrival,
          description_fr: p.description?.fr || '',
          description_ar: p.description?.ar || '',
          description_en: p.description?.en || '',
          image: p.image || '',
          images: JSON.stringify(p.images || [p.image]),
          fallbackImage: p.fallbackImage || '',
          fallbackImages: JSON.stringify(p.fallbackImages || []),
          features_fr: JSON.stringify(p.features?.fr || []),
          features_ar: JSON.stringify(p.features?.ar || []),
          features_en: JSON.stringify(p.features?.en || []),
          isActive: p.isActive !== undefined ? p.isActive : true,
          sortOrder: p.sortOrder !== undefined ? p.sortOrder : 0,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await fetch(sheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flatPayload),
          signal: AbortSignal.timeout(10000)
        });
      } catch (err: any) {
        console.warn(`[PRODUCTS SYNC] sync failed on update:`, err.message);
      }
    }
    res.json({ success: true, product: localProducts[index] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const localProducts = readLocalProducts();
  const index = localProducts.findIndex(p => p.id === id);

  if (index !== -1) {
    const filtered = localProducts.filter(p => p.id !== id);
    writeLocalProducts(filtered);
    console.log(`[ADMIN PRODUCTS] product disabled/deleted`);

    const sheetsUrl = process.env.VITE_PRODUCTS_API_URL || process.env.PRODUCTS_API_URL;
    if (sheetsUrl && sheetsUrl.trim() !== '') {
      try {
        await fetch(sheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            id: id
          }),
          signal: AbortSignal.timeout(10000)
        });
      } catch (err: any) {
        console.warn(`[PRODUCTS SYNC] sync failed on delete:`, err.message);
      }
    }
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// 1. Get all orders (Admin-only or persistent app pool)
app.get('/api/orders', async (req, res) => {
  const sheetsUrl = process.env.VITE_ORDERS_API_URL || process.env.ORDERS_API_URL;
  const localOrders = readOrders();

  if (sheetsUrl && sheetsUrl.trim() !== '') {
    try {
      console.log(`[BACKEND SPREADSHEET] Fetching real orders from Google Sheets: ${sheetsUrl}`);
      const response = await fetch(sheetsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30s timeout extension to handle cold starts
      });

      if (response.ok) {
        const remoteData = await response.json();
        if (Array.isArray(remoteData)) {
          console.log(`[BACKEND SPREADSHEET] ✅ Loaded ${remoteData.length} orders from Google Sheets.`);
          
          const remoteMap = new Map(remoteData.map((o: any) => [o.orderId || o.id, o]));

          // Map remote sheets schema back to Order format if flat
          const processedRemote: any[] = remoteData.map((r: any) => {
            // Check if it's already in Order schema, or flat
            if (r.id && Array.isArray(r.items)) {
              return { ...r, syncStatus: 'synced' };
            }
            
            // Reconstruct nested structure from flat format if retrieved from standard sheets columns
            return {
              id: r.orderId || r.id,
              reference: r.reference || `GB-${Math.floor(100000 + Math.random() * 900000)}`,
              fullName: r.customerName || r.fullName,
              phoneNumber: r.customerPhone || r.phoneNumber,
              city: r.city,
              deliveryAddress: r.address || r.deliveryAddress,
              notes: r.notes || '',
              total: Number(r.finalTotal || r.total || 0),
              subtotal: Number(r.subtotal || r.total || 0),
              shippingCost: Number(r.shippingCost || 0),
              finalTotal: Number(r.finalTotal || r.total || 0),
              freeShipping: r.freeShipping !== undefined ? (r.freeShipping === true || r.freeShipping === 'true') : true,
              date: r.date || '',
              status: r.status || 'pending',
              paymentMethod: r.paymentMethod || 'Cash on delivery',
              whatsappMessage: r.whatsappMessage || '',
              source: r.source || 'website',
              syncStatus: 'synced',
              items: r.items || [
                {
                  productName: r.productNames || 'Produit',
                  productId: r.productIds || '',
                  price: Number(r.productPrices ? String(r.productPrices).replace(/[^\d]/g, '') : 0),
                  quantity: Number(r.quantities || 1),
                  image: ''
                }
              ]
            };
          });

          // Merge: remote orders overwrite local orders by ID, but keep local unsynced orders
          const merged: any[] = [...processedRemote];
          for (const localOrder of localOrders) {
            const matchId = localOrder.id;
            if (!remoteMap.has(matchId)) {
              merged.push(localOrder);
            }
          }

          // Sort by date/timestamp descending
          merged.sort((a, b) => b.id.localeCompare(a.id));

          writeOrders(merged);
          return res.json(merged);
        }
      }
    } catch (err: any) {
      console.warn(`[BACKEND SPREADSHEET] Failed to fetch sheets orders. Falling back to local cache. Error:`, err.message);
    }
  }

  // Fallback to local cache if sheets fetch failed or is not configured
  res.json(localOrders);
});

// 2. Clear all orders
app.delete('/api/orders-clear', (req, res) => {
  writeOrders([]);
  res.json({ success: true, message: 'All orders cleared' });
});

// 3. Create a new order (saves locally and synchronizes to Google Sheets)
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.id) {
      return res.status(400).json({ error: 'Order details missing ID' });
    }

    const sheetsUrl = process.env.VITE_ORDERS_API_URL || process.env.ORDERS_API_URL;

    // Check if duplicate ID exists to prevent duplicate orders
    const initialOrders = readOrders();
    if (initialOrders.some(o => o.id === newOrder.id)) {
      console.log(`[BACKEND SPREADSHEET] Duplicate order ${newOrder.id} block/bypass triggered.`);
      return res.json({ 
        success: true, 
        order: initialOrders.find(o => o.id === newOrder.id), 
        syncStatus: 'synced',
        isConfigured: !!(sheetsUrl && sheetsUrl.trim() !== '')
      });
    }

    // Save locally to disk first (Crucial safeguard requested: always save locally first)
    let syncStatus: 'synced' | 'failed' | 'not-configured' = 'not-configured';
    newOrder.syncStatus = sheetsUrl && sheetsUrl.trim() !== '' ? 'pending' : 'not-configured';
    const updatedOrders = [newOrder, ...initialOrders];
    writeOrders(updatedOrders);
    console.log(`[BACKEND SPREADSHEET] ✅ Order ${newOrder.id} saved locally to disk first!`);

    let syncError = '';

    if (sheetsUrl && sheetsUrl.trim() !== '') {
      console.log(`[BACKEND SPREADSHEET] Configured sheets URL found: ${sheetsUrl}`);
      
      // Construct a flat payload for convenient spreadsheet insert
      const flatPayload = {
        orderId: newOrder.id,
        reference: newOrder.reference,
        date: newOrder.date,
        customerName: newOrder.fullName,
        customerPhone: newOrder.phoneNumber,
        city: newOrder.city,
        address: newOrder.deliveryAddress,
        notes: newOrder.notes || '',
        productNames: (newOrder.items || []).map((it: any) => {
          let details = it.productName || '';
          if (it.selectedSize) details += ` (Taille: ${it.selectedSize})`;
          if (it.selectedColor) details += ` (Couleur: ${it.selectedColor})`;
          return details;
        }).join('\n'),
        productIds: (newOrder.items || []).map((it: any) => it.productId || '').join(', '),
        quantities: (newOrder.items || []).map((it: any) => it.quantity || 1).join(', '),
        productPrices: (newOrder.items || []).map((it: any) => `${it.price || 0} DH`).join(', '),
        subtotal: newOrder.subtotal || newOrder.total || 0,
        shippingCost: newOrder.shippingCost || 0,
        finalTotal: newOrder.finalTotal || newOrder.total || 0,
        paymentMethod: newOrder.paymentMethod || 'Cash on delivery',
        status: newOrder.status || 'pending',
        whatsappMessage: newOrder.whatsappMessage || '',
        source: newOrder.source || 'website'
      };

      try {
        const response = await fetch(sheetsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(flatPayload),
          signal: AbortSignal.timeout(8000) // 8 second timeout to protect customer speed
        });

        if (response.ok) {
          console.log(`[BACKEND SPREADSHEET] ✅ Order ${newOrder.id} successfully sent to Google Sheets!`);
          syncStatus = 'synced';
        } else {
          console.error(`[BACKEND SPREADSHEET] ⚠️ Google Sheets responded with status: ${response.status}`);
          syncStatus = 'failed';
          syncError = `HTTP Status ${response.status}`;
        }
      } catch (fErr: any) {
        console.error(`[BACKEND SPREADSHEET] ❌ Failed to POST order to Google Sheets:`, fErr);
        syncStatus = 'failed';
        syncError = fErr.message || 'Network timeout or connection error';
      }

      // Update sync status on local disk after network completion
      const currentOrders = readOrders();
      const idx = currentOrders.findIndex(o => o.id === newOrder.id);
      if (idx !== -1) {
        currentOrders[idx].syncStatus = syncStatus;
        writeOrders(currentOrders);
        newOrder.syncStatus = syncStatus;
      }
    } else {
      console.log(`[BACKEND SPREADSHEET] ℹ️ Google Sheets URL not configured.`);
      syncStatus = 'not-configured';
    }

    res.json({ 
      success: true, 
      order: newOrder, 
      syncStatus, 
      syncError,
      isConfigured: !!(sheetsUrl && sheetsUrl.trim() !== '')
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// 4. Update an existing order (status modification, etc)
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  
  const orders = readOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updatedData };
    
    // Also sync the status update to Google Sheets if configured
    const sheetsUrl = process.env.VITE_ORDERS_API_URL || process.env.ORDERS_API_URL;
    if (sheetsUrl && sheetsUrl.trim() !== '') {
      try {
        console.log(`[BACKEND SPREADSHEET] Syncing order update for ${id} with status ${updatedData.status}`);
        await fetch(sheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateStatus',
            orderId: id,
            status: updatedData.status
          }),
          signal: AbortSignal.timeout(15000) // 15s timeout
        }).catch(err => console.warn('[BACKEND SPREADSHEET] Ignored updateStatus error:', err));
      } catch (err) {
        console.warn('[BACKEND SPREADSHEET] Pre-hook error during status sync:', err);
      }
    }

    writeOrders(orders);
    res.json({ success: true, order: orders[index] });
  } else {
    res.status(404).json({ error: `Order ${id} not found` });
  }
});

// 5. Delete a single order (management panel)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readOrders();
  const filtered = orders.filter(o => o.id !== id);
  
  if (orders.length !== filtered.length) {
    writeOrders(filtered);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: `Order ${id} not found` });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Globabox Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
