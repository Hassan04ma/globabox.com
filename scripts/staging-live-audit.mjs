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
  // Live storefront should contain only authorized, published catalog entries.
  // Never treat standalone demonstration pages as a launch readiness criterion.
  const readiness=await get('/api/launch-readiness');
  assert([200,503].includes(readiness.response.status),'Readiness endpoint HTTP '+readiness.response.status);
  assert(readiness.value && typeof readiness.value === 'object','Missing launch readiness response');
  assert(readiness.value.demoCatalogEnabled !== true,'Bundled sample catalog is enabled: disable STORE_DEMO_CATALOG before launch');
  checks.push('Demo product fallback disabled');

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
  assert(products.value.every(p=>p.isActive===true),'Public endpoint leaked draft or unverified product(s)');
  assert(products.value.every(p=>!String(p.id||'').startsWith('gb_source_')),'Public endpoint exposes sourced test products');
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
