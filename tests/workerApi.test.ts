import assert from 'node:assert/strict';
import worker from '../cloudflare/worker';
import {validateTrackingConfig,DEFAULT_TRACKING_CONFIG} from '../src/trackingConfig';

const savedOrders: any[] = [];
let savedTrackingConfig:string|null=null;
const db = {
  prepare(sql: string) {
    const execute = (...params: unknown[]) => ({
      async first() {
        if(sql.includes('FROM store_settings'))return savedTrackingConfig?{data_json:savedTrackingConfig}:null;
        if (sql.includes("UPPER(json_extract(data_json, '$.reference'))")) {
          const matched=savedOrders.find(o=>o.reference?.toUpperCase()===params[0]);
          return matched ? {data_json:JSON.stringify(matched)} : null;
        }
        if (sql.includes('FROM orders WHERE id=?')) {
          const matched=savedOrders.find(o=>o.id===params[0]);
          return matched ? {data_json:JSON.stringify(matched)} : null;
        }
        return null;
      },
      async all() {
        if (sql.includes('FROM category_overrides')) return { results: [] };
        if (sql.includes('FROM products')) return { results: [] };
        if (sql.includes('FROM orders')) return { results: savedOrders.map(order => ({data_json: JSON.stringify(order)})) };
        throw new Error('Unexpected all(): ' + sql);
      },
      async run() {
        if(sql.startsWith('CREATE TABLE IF NOT EXISTS store_settings'))return {success:true,meta:{changes:0}};
        if(sql.startsWith('INSERT INTO store_settings')){savedTrackingConfig=String(params[0]);return {success:true,meta:{changes:1}};}
        if (sql.startsWith('CREATE TABLE IF NOT EXISTS category_overrides')) return {success:true,meta:{changes:0}};
        if (sql.startsWith('DELETE FROM orders')) {
          const i=savedOrders.findIndex(o=>o.id===params[0]);
          if(i>=0)savedOrders.splice(i,1);
          return {success:true,meta:{changes:i>=0?1:0}};
        }
        if (sql.startsWith('INSERT INTO products')) return {success:true,meta:{changes:1}};
        if (sql.startsWith('INSERT INTO orders')) {
          savedOrders.push(JSON.parse(params[3] as string));
          return { success: true, meta: { changes: 1 } };
        }
        throw new Error('Unexpected run(): ' + sql);
      }
    });
    return { ...execute(), bind: (...params: unknown[]) => execute(...params) };
  }
} as any;
const env = {
  ADMIN_RATE_LIMITER: {limit: async () => ({success:true})},
  CHECKOUT_RATE_LIMITER: {limit: async () => ({success:true})},
  STORE_DEMO_CATALOG: 'true',
  DB: db,
  STORE_ACCEPTING_ORDERS: 'true',
  ASSETS: { fetch: async () => new Response('assets') },
} as any;

const request = (path: string, init?: RequestInit) =>
  worker.fetch(new Request('https://preview.example.test' + path, init), env);

const publishedCatalogWhenUnconfigured = await worker.fetch(
  new Request('https://preview.example.test/api/products'),
  {...env, STORE_DEMO_CATALOG: undefined}
);
assert.equal(publishedCatalogWhenUnconfigured.status,200);
assert.deepEqual(await publishedCatalogWhenUnconfigured.json(), [],
  'Unverified bundled samples must never appear in the real store');

const forbiddenOrders = await request('/api/orders');
assert.equal(forbiddenOrders.status, 401, 'Unidentified customers cannot list orders');
assert.equal((await request('/api/admin/products')).status, 401, 'Admin catalog is private');
assert.equal((await request('/api/admin/categories')).status, 401, 'Category editing is private');
assert.equal((await request('/api/admin/categories', {
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id:'unsafe-change',name:{fr:'Unauthorized'},image:'https://example.test/image.jpg'})
})).status, 401, 'Public visitors cannot create a category');
const publicCategories=await request('/api/categories');
assert.equal(publicCategories.status,200,'Public category list is readable');
const publicCategoryItems=await publicCategories.json() as any[];
assert.equal(publicCategoryItems.length,13,'Public catalog shows thirteen active main store departments');
assert.equal(publicCategoryItems.some(c=>c.id==='cuisine'),true);
assert.equal(publicCategoryItems.some(c=>c.id==='camping'),false,'Legacy camping categories remain private in admin');
assert.equal((await request('/api/products/demo', {method:'DELETE'})).status, 401,
  'Public visitors cannot remove products');

// Tracking configuration never publishes private keys or allows untrusted writes.
const trackingGet=await request('/api/tracking-config');
assert.equal(trackingGet.status,200,'Visitor can read only public tracking IDs');
assert.deepEqual((await trackingGet.json() as any).config,DEFAULT_TRACKING_CONFIG);
assert.equal((await request('/api/admin/tracking-config')).status,401,'Tracking admin private');
assert.equal((await request('/api/admin/tracking-config',{
 method:'PUT',headers:{'Content-Type':'application/json'},
 body:JSON.stringify({...DEFAULT_TRACKING_CONFIG,metaPixelId:'123456789123456'})
})).status,401,'Anonymous users cannot update pixels');
assert.equal((await request('/api/tracking-config',{
 method:'PUT',headers:{'Content-Type':'application/json'},
 body:JSON.stringify(DEFAULT_TRACKING_CONFIG)
})).status,404,'Public tracking setting changes forbidden');
assert.equal(validateTrackingConfig({...DEFAULT_TRACKING_CONFIG,metaPixelId:'123456789123456'})?.metaPixelId,
 '123456789123456','Valid Meta ID accepted');
assert.equal(validateTrackingConfig({...DEFAULT_TRACKING_CONFIG,metaPixelId:'https://malicious.example.test'}),null,
 'Script URL rejected in place of Meta pixel ID');
assert.equal(validateTrackingConfig({...DEFAULT_TRACKING_CONFIG,webhookUrl:'https://example.com/collect'}),null,
 'Private webhook URL cannot be stored with tracking IDs');
assert.equal(savedTrackingConfig,null,'Unauthorized tracking changes never write D1');

// Any unconfigured public launch must fail closed, even if the request is otherwise valid.
const gatePayload = {
  fullName:'Client Exemple',phoneNumber:'0612345678',city:'Agadir',
  deliveryAddress:'Rue Test 10 Agadir',
  items:[{productId:'tente-dome-camping-2-3-personnes',quantity:1}],
  subtotal:400,shippingCost:35,total:435
};
const launchClosed = await worker.fetch(new Request('https://preview.example.test/api/orders', {
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(gatePayload)
}), {...env, STORE_ACCEPTING_ORDERS:undefined});
assert.equal(launchClosed.status,503,'Checkout is off until explicitly enabled');
assert.equal(savedOrders.length,0,'Closed checkout never saves an order');

const item = { productId: 'tente-dome-camping-2-3-personnes', quantity: 1, price: 1, productName: 'FAKE' };
const makePayload = (extra: Record<string, unknown> = {}) => ({
  fullName: 'Client Exemple',
  phoneNumber: '0612345678',
  city: 'Agadir',
  deliveryAddress: 'Rue Test 10 Agadir',
  items: [item],
  subtotal: 400,
  shippingCost: 35,
  total: 435,
  ...extra
});
const checkout = async (body: unknown) => request('/api/orders', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
});

const badTotal = await checkout(makePayload({total: 1}));
assert.equal(badTotal.status, 409, 'Tampered price must not be saved');
assert.equal(savedOrders.length, 0);

const badProduct = await checkout(makePayload({items: [{ productId:'does-not-exist',quantity:1 }]}));
assert.equal(badProduct.status, 409);
assert.equal(savedOrders.length, 0);

// Fake writes must not be accepted if D1 fails to confirm success.
const failedWritesDb={
  prepare:(sql:string)=>({
    bind:(...params:unknown[])=>({
      run:async()=>({success:false,meta:{changes:0}}),
      all:async()=>({results:[]}),
      first:async()=>null
    }),
    all:async()=>({results:[]}),first:async()=>null
  })
};
const unverified=await worker.fetch(new Request('https://preview.example.test/api/orders',{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(makePayload())
}),{...env,DB:failedWritesDb});
assert.notEqual(unverified.status,201,'Do not claim checkout success for failed D1 writes');

const response = await checkout(makePayload());
assert.equal(response.status, 201, 'Valid COD order is accepted');
const data = await response.json() as any;
assert.equal(data.success, true);
assert.equal(data.order.id.length > 0, true);
assert.equal(data.order.total, 435);
assert.equal(data.order.shippingCost, 35);
assert.equal(data.order.items[0].price, 400, 'Server price overrides spoofed browser price');
assert.equal(data.order.items[0].productName, 'Tente Dôme Camping 2-3 Personnes - Montage Rapide');
assert.equal(savedOrders.length, 1);
assert.equal(savedOrders[0].id, data.order.id, 'Persisted order ID matches response');

const freeResponse = await checkout(makePayload({
  items: [{productId:'tente-dome-camping-2-3-personnes',quantity:2}],
  subtotal:800, shippingCost:0, total:800
}));
assert.equal(freeResponse.status, 201);
assert.equal((await freeResponse.json() as any).order.freeShipping,true);
assert.equal(savedOrders.length,2);

// Public tracking must require a reference and matching telephone, without exposing customer PII.
const track=async (body:unknown, customEnv=env) =>
  worker.fetch(new Request('https://preview.example.test/api/track-order',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
  }),customEnv);
const savedRef=data.order.reference;
const validTracking=await track({reference:savedRef.toLowerCase(),phone:'+212612345678'});
assert.equal(validTracking.status,200,'Valid order reference + same telephone can track');
const tracked=await validTracking.json() as any;
assert.equal(tracked.tracking.status,'pending');
assert.equal(tracked.tracking.total,435);
assert.equal(tracked.tracking.itemCount,1);
assert.equal(tracked.tracking.reference,savedRef);
assert.equal(JSON.stringify(tracked).includes('Client Exemple'),false,'No customer name in tracking response');
assert.equal(JSON.stringify(tracked).includes('Rue Test'),false,'No address in tracking response');
assert.equal(JSON.stringify(tracked).includes('0612345678'),false,'No telephone in tracking response');
assert.equal((await track({reference:savedRef,phone:'0699999999'})).status,404,'Mismatched phone cannot track');
assert.equal((await track({reference:'GB-UNKNOWN1',phone:'0612345678'})).status,404,'Unknown reference cannot track');
assert.equal((await track({reference:'GB-123',phone:'0612345678'})).status,400,'Invalid reference rejected');
assert.equal((await track({reference:savedRef,phone:'not-phone'})).status,400,'Invalid telephone rejected');
assert.equal((await track({reference:savedRef,phone:'0612345678'}, {...env,CHECKOUT_RATE_LIMITER:undefined})).status,503,
  'Without rate limiting binding, public tracking fails closed');
assert.equal((await request('/api/track-order')).status,404,'GET tracking endpoint is not exposed');

// A trusted admin creating a product cannot make it public in a single POST.
const adminEnv = {...env, ADMIN_API_KEY:'ci_dummy_admin_api_key_very_long_not_a_secret_00001'};
const draft = await worker.fetch(new Request('https://preview.example.test/api/products', {
  method:'POST',headers:{'Content-Type':'application/json','x-admin-api-key':'ci_dummy_admin_api_key_very_long_not_a_secret_00001'},
  body:JSON.stringify({id:'safe-demo-draft',name:{fr:'Draft Test'},price:99,
    image:'https://example.test/draft.jpg',isActive:true})
}),adminEnv);
assert.equal(draft.status,200);
const draftPayload = await draft.json() as any;
assert.equal(draftPayload.product.isActive,false,'New admin products cannot auto-publish');
console.log('Worker API smoke tests passed: admin protection, tampering, persisted checkout, free delivery and draft creation, privacy-safe customer tracking');
