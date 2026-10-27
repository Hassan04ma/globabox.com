import assert from 'node:assert/strict';
import { quoteOrder } from '../cloudflare/orderQuote';

const product = {
  id: 'p1', name: {fr:'Produit test'}, price: 465, image: 'https://example.com/p.jpg',
  inStock: true, isActive: true
};
const order = {
  fullName: 'Client Test', phoneNumber: '0612345678', city: 'Agadir',
  deliveryAddress: 'Rue 10 Quartier Test', notes: '',
  items: [{productId:'p1', productName:'fake name', price:1, quantity:1}],
  subtotal:465, shippingCost:35, total:500
};
const ok = quoteOrder(order,[product]);
assert.equal(ok.ok,true);
if (ok.ok) {
  assert.equal(ok.order.items[0].price,465);
  assert.equal(ok.order.items[0].productName,'Produit test');
  assert.equal(ok.order.total,500);
  assert.equal(ok.order.shippingCost,35);
}
const free = quoteOrder({...order,items:[{...order.items[0],quantity:2}],subtotal:930,shippingCost:0,total:930},[product]);
assert.equal(free.ok,true);
if (free.ok) assert.equal(free.order.freeShipping,true);
assert.equal(quoteOrder({...order,total:1},[product]).ok,false);
assert.equal(quoteOrder({...order,items:[{...order.items[0],quantity:0}]},[product]).ok,false);
assert.equal(quoteOrder({...order,items:[{...order.items[0],productId:'missing'}]},[product]).ok,false);
assert.equal(quoteOrder({...order,phoneNumber:'1234'},[product]).ok,false);
assert.equal(quoteOrder(order,[{...product,isActive:false}]).ok,false);
assert.equal(quoteOrder(order,[{...product,inStock:false}]).ok,false);
// Boundary of free delivery: exactly 500 MAD must have zero shipping.
const thresholdProduct = {...product, id:'p500', price:500};
const exactThreshold = quoteOrder({
  ...order,
  items:[{productId:'p500', quantity:1}],
  subtotal:500, shippingCost:0, total:500
}, [thresholdProduct]);
assert.equal(exactThreshold.ok, true);
if (exactThreshold.ok) assert.equal(exactThreshold.order.shippingCost, 0);

// A browser cannot force a 35 MAD delivery fee when delivery should be free.
assert.equal(quoteOrder({
  ...order,
  items:[{productId:'p500', quantity:1}],
  subtotal:500, shippingCost:35, total:535
}, [thresholdProduct]).ok, false);

// Server must not accept a product marked out of stock, even if active.
assert.equal(quoteOrder(order,[{...product,stockStatus:'out_of_stock'}]).ok,false);
console.log('COD quote validation: 11 cases passed');
