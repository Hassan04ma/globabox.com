import assert from 'node:assert/strict';

// Integration test against Wrangler dev + a local SQLite-backed D1 instance.
// NEVER point this script at a public URL or a remote production database.
const base = process.env.GB_TEST_BASE_URL;
if (!base || !/^http:\/\/127\.0\.0\.1:\d{2,5}$/.test(base)) {
  throw new Error('GB_TEST_BASE_URL must be localhost 127.0.0.1 (not remote).');
}
const fetchPath = (path: string, init?: RequestInit) => fetch(base + path, init);
const placeOrder = (payload: unknown) => fetchPath('/api/orders', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify(payload)
});
const order = {
  fullName: 'Client Integration Test',
  phoneNumber: '0612345678',
  city: 'Agadir',
  deliveryAddress: 'Rue Exemple 10, Agadir',
  items: [{productId:'tente-dome-camping-2-3-personnes',quantity:1,price:1}],
  subtotal:400, shippingCost:35, total:435
};

const products = await fetchPath('/api/products');
assert.equal(products.status, 200, 'Public catalog is available');
const catalog = await products.json() as any[];
assert.ok(catalog.some(p => p.id === 'tente-dome-camping-2-3-personnes'));

assert.equal((await fetchPath('/api/orders')).status, 401, 'Orders list is private');
assert.equal((await fetchPath('/api/admin/products')).status, 401, 'Draft product catalog is private');
assert.equal((await fetchPath('/api/products/fake', {method:'DELETE'})).status, 401,
  'Admin-only mutations are blocked');
assert.equal((await fetchPath('/api/admin/session')).status, 200, 'Admin session route exists');

const forgedTotal = await placeOrder({...order,total:1});
assert.equal(forgedTotal.status, 409, 'Browser cannot tamper with the grand total');

const unavailable = await placeOrder({...order,items:[{productId:'not-in-catalog',quantity:1}]});
assert.equal(unavailable.status, 409, 'Unavailable products cannot be ordered');

const valid = await placeOrder(order);
assert.equal(valid.status,201,'Valid cash-on-delivery order was persisted in local D1');
const response = await valid.json() as any;
assert.equal(response.success,true);
assert.match(response.order.id,/^[a-f\d-]{36}$/);
assert.equal(response.order.status,'pending');
assert.equal(response.order.total,435);
assert.equal(response.order.shippingCost,35);
assert.equal(response.order.items[0].price,400,'Server catalog price supersedes client value');

const free = await placeOrder({...order,
  items:[{productId:'tente-dome-camping-2-3-personnes',quantity:2}],
  subtotal:800,shippingCost:0,total:800
});
assert.equal(free.status,201,'Second order stored locally');
const freeData = await free.json() as any;
assert.equal(freeData.order.total,800);
assert.equal(freeData.order.freeShipping,true);
// Authenticate using disposable credentials injected into the local Worker only.
const origin = base;
const login = await fetchPath('/api/admin/login', {
  method:'POST', headers:{'Content-Type':'application/json','Origin':origin},
  body:JSON.stringify({username:'ci_test_admin',password:'CI_Only_Not_A_Real_Password_2026'})
});
assert.equal(login.status,200,'Local admin login succeeds');
const cookie = login.headers.get('set-cookie')?.split(';')[0];
assert.ok(cookie?.startsWith('gb_admin='),'Admin cookie issued');
const adminHeaders = {'Cookie':cookie!, 'Origin':origin};
const adminList = await fetchPath('/api/orders', {headers:adminHeaders});
assert.equal(adminList.status,200,'Authenticated admin reads saved orders');
const saved = await adminList.json() as any[];
assert.equal(saved.length,2,'D1 persisted both test orders');
const update = await fetchPath('/api/orders/' + encodeURIComponent(response.order.id), {
  method:'PUT',headers:{...adminHeaders,'Content-Type':'application/json'},
  body:JSON.stringify({status:'confirmed'})
});
assert.equal(update.status,200,'Admin can confirm order');
assert.equal((await update.json() as any).order.status,'confirmed');
const drafts = await fetchPath('/api/admin/products', {headers:adminHeaders});
assert.equal(drafts.status,200,'Admin can list draft products');
const logout = await fetchPath('/api/admin/logout',{method:'POST',headers:adminHeaders});
assert.equal(logout.status,200,'Admin logout succeeds');
const logoutCookie = logout.headers.get('set-cookie');
assert.ok(logoutCookie?.includes('Max-Age=0'),'Admin logout invalidates cookie');

console.log('Local D1 HTTP integration passed: auth, persisted checkout, admin login, order update and logout');
