import assert from 'node:assert/strict';
import worker from '../cloudflare/worker';

const savedOrders: any[] = [];
const db = {
  prepare(sql: string) {
    const execute = (...params: unknown[]) => ({
      async all() {
        if (sql.includes('FROM products')) return { results: [] };
        if (sql.includes('FROM orders')) return { results: savedOrders.map(order => ({data_json: JSON.stringify(order)})) };
        throw new Error('Unexpected all(): ' + sql);
      },
      async run() {
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
  DB: db,
  STORE_ACCEPTING_ORDERS: 'true',
  ASSETS: { fetch: async () => new Response('assets') },
} as any;

const request = (path: string, init?: RequestInit) =>
  worker.fetch(new Request('https://preview.example.test' + path, init), env);

const forbiddenOrders = await request('/api/orders');
assert.equal(forbiddenOrders.status, 401, 'Unidentified customers cannot list orders');
assert.equal((await request('/api/admin/products')).status, 401, 'Admin catalog is private');
assert.equal((await request('/api/products/demo', {method:'DELETE'})).status, 401,
  'Public visitors cannot remove products');

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

console.log('Worker API smoke tests passed: admin protection, tampering, persisted checkout, free delivery');
