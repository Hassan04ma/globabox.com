// Read-only GLOBABOX staging audit. Never mutates D1, checkout or existing orders.
const origin=process.env.GLOBABOX_STAGING_URL || 'https://test.globabox.com';
const timeout=12_000;
const get=async path=>{
  const response=await fetch(origin+path,{headers:{accept:path==='/'?'text/html':'application/json','user-agent':'GLOBABOX-Staging-Audit/1.0'},signal:AbortSignal.timeout(timeout),redirect:'follow'});
  const body=await response.text();
  let value=null;try{value=JSON.parse(body)}catch{}
  return {response,body,value};
};
const assert=(condition,description)=>{if(!condition)throw Error(description);};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const checks=[];
for(let attempt=1;attempt<=5;attempt++){
 try{
  const home=await get('/');
  assert(home.response.status===200,'Homepage status '+home.response.status);
  assert(/<html/i.test(home.body),'Homepage must serve HTML');
  checks.push('Home 200 (HTML)');
  // Verify the complete 13-department QA page is deployed; this is a LOCAL simulation only.
  // HTTP 200 without the expected content is not enough to confirm the current deployment.
  const qa=await get('/catalogue-test.html');
  assert(qa.response.status===200,'13-product QA page HTTP '+qa.response.status);
  assert(qa.body.includes('13 références proposées') && qa.body.includes('function showCart()') && qa.body.includes('function confirmTest()'),'13-product QA page missing or outdated');
  assert(qa.body.includes('Aucune commande sauvegardée dans Cloudflare D1'),'QA page must disclose no real order is saved');
  const match=qa.body.match(/const products=(\[[\s\S]*?\]);\s*const cart=new Map\(\)/);
  assert(!!match,'13-product embedded catalog not found');
  const qaProducts=JSON.parse(match[1]);
  assert(qaProducts.length===13,'Expected 13 QA products, got '+qaProducts.length);
  assert(new Set(qaProducts.map(p=>p.category)).size===13,'Expected one distinct department per QA product');
  assert(qaProducts.every(p=>p.id&&p.title&&Number(p.price)>0&&p.illustration),'QA product data incomplete');
  checks.push('13 unique QA products + local cart/COD simulation deployed (no D1 write)');

  const categories=await get('/api/categories');
  assert(categories.response.status===200,'Categories HTTP '+categories.response.status);
  assert(Array.isArray(categories.value),'Categories must be an array');
  const unique=new Set(categories.value.map(c=>c.id));
  assert(unique.size===categories.value.length,'Duplicate public categories');
  assert(categories.value.length===13,'Expected 13 public departments, got '+categories.value.length);
  checks.push('13 distinct public categories');

  const products=await get('/api/products');
  assert(products.response.status===200,'Products HTTP '+products.response.status);
  assert(Array.isArray(products.value),'Products must be an array');
  assert(products.value.every(p=>p.isActive!==false),'Public endpoint leaked draft product(s)');
  checks.push(products.value.length+' publicly visible products (drafts excluded)');

  const unauthorized=await get('/api/admin/products');
  assert(unauthorized.response.status===401,'Admin data must require authentication; got '+unauthorized.response.status);
  checks.push('Admin products protected (401)');

  const tracking=await get('/api/tracking-config');
  assert(tracking.response.status===200,'Public tracking configuration HTTP '+tracking.response.status);
  assert(tracking.value?.config&&typeof tracking.value.config==='object','Tracking configuration missing');
  assert(!('apiToken' in tracking.value.config),'Tracking endpoint exposed private key');
  checks.push('Public tracking identifiers only');

  console.log('PASS '+origin+'\n'+checks.map(s=>'✔ '+s).join('\n'));
  process.exit(0);
 }catch(error){
  checks.length=0;
  console.log('Attempt '+attempt+'/5: '+(error instanceof Error?error.message:String(error)));
  if(attempt===5){process.exitCode=1;break;}
  await wait(10000);
 }
}
