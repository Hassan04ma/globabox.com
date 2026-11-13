import { DEFAULT_TRACKING_CONFIG, getSafeTrackingConfig, type TrackingConfig } from '../trackingConfig';

export type TrackingConsent = { analytics: boolean; marketing: boolean; updatedAt: string };
const CONSENT_KEY='globabox_tracking_consent_v2';
let config: TrackingConfig={...DEFAULT_TRACKING_CONFIG};
let loaded=false;
let loadingPromise:Promise<void>|null=null;
let injected=false;
type AnalyticsWindow=Window & {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void;_fbq?:unknown;ttq?:any;pintrk?:(...args:unknown[])=>void;snaptr?:(...args:unknown[])=>void};
const win=()=>window as AnalyticsWindow;

export function getTrackingConsent():TrackingConsent|null {
  if(typeof window==='undefined')return null;
  try {
    const raw=window.localStorage.getItem(CONSENT_KEY);
    if(!raw)return null;
    const saved=JSON.parse(raw);
    if(typeof saved?.analytics!=='boolean'||typeof saved?.marketing!=='boolean')return null;
    return {analytics:saved.analytics,marketing:saved.marketing,updatedAt:String(saved.updatedAt||'')};
  } catch {return null;}
}

export function saveTrackingConsent(choice:{analytics:boolean;marketing:boolean}):void {
  if(typeof window==='undefined')return;
  const old=getTrackingConsent();
  window.localStorage.setItem(CONSENT_KEY,JSON.stringify({...choice,updatedAt:new Date().toISOString()}));
  // Revoking consent must stop any further events. A reload unloads existing vendor scripts.
  if(old && (old.analytics!==choice.analytics || old.marketing!==choice.marketing)) {
    window.location.reload();return;
  }
  void initAnalytics().then(()=>triggerPageView(window.location.pathname+window.location.search));
}

export const getTrackingConfig=()=>config;
export const isTrackerValid=(id:string)=>Boolean(id&&id.trim()&&!id.toLowerCase().includes('placeholder'));

function addScript(id:string,src:string):void {
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;script.async=true;script.src=src;document.head.appendChild(script);
}
function setGtag(){
  win().dataLayer=win().dataLayer||[];
  if(!win().gtag)win().gtag=(...args:unknown[])=>{win().dataLayer!.push(args);};
}
function activateTags():void {
  if(injected || typeof window==='undefined')return;
  const consent=getTrackingConsent();
  if(!consent || (!consent.analytics&&!consent.marketing))return;
  injected=true;
  // A GTM container can inject both marketing and analytics tags. Only allow
  // it after both opt-ins; with partial consent load individual permitted tags.
  const gtmEnabled=Boolean(config.googleTagManagerId && consent.analytics && consent.marketing);
  if(gtmEnabled){
    win().dataLayer=win().dataLayer||[];
    win().dataLayer.push({event:'globabox_consent',analytics:consent.analytics,marketing:consent.marketing});
    addScript('gb-gtm','https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(config.googleTagManagerId));
  }
  // Only Google direct tags when no GTM container is set, to prevent duplicate tracking.
  if(!gtmEnabled && (config.googleAnalyticsId&&consent.analytics || config.googleAdsId&&consent.marketing)){
    setGtag();
    win().gtag!('js',new Date());
    // Explicit denied defaults for the categories not accepted.
    win().gtag!('consent','default',{
      analytics_storage:consent.analytics?'granted':'denied',
      ad_storage:consent.marketing?'granted':'denied',
      ad_user_data:consent.marketing?'granted':'denied',
      ad_personalization:consent.marketing?'granted':'denied'
    });
    if(config.googleAnalyticsId&&consent.analytics)win().gtag!('config',config.googleAnalyticsId,{send_page_view:false});
    if(config.googleAdsId&&consent.marketing)win().gtag!('config',config.googleAdsId);
    addScript('gb-google-tag','https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(
      config.googleAnalyticsId&&consent.analytics?config.googleAnalyticsId:config.googleAdsId
    ));
  }
  if(consent.marketing) {
    if(config.metaPixelId) {
      const w=win() as any;
      if(!w.fbq) {
        const f:any=(...args:any[])=>{if(f.callMethod)f.callMethod.apply(f,args);else f.queue.push(args);};
        f.queue=[];f.loaded=true;f.version='2.0';w.fbq=f;w._fbq=f;
      }
      w.fbq('init',config.metaPixelId);
      addScript('gb-meta-pixel','https://connect.facebook.net/en_US/fbevents.js');
    }
    if(config.tikTokPixelId) {
      const w=win() as any, ttq:any=w.ttq||[];
      w.TiktokAnalyticsObject='ttq';w.ttq=ttq;
      ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
      ttq.setAndDefer=(obj:any,method:string)=>{obj[method]=(...args:any[])=>obj.push([method,...args]);};
      for(const method of ttq.methods)ttq.setAndDefer(ttq,method);
      ttq.load=(id:string)=>{
        ttq._i=ttq._i||{};ttq._i[id]=[];ttq._i[id]._u='https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._t=ttq._t||{};ttq._t[id]=Date.now();ttq._o=ttq._o||{};ttq._o[id]={};
        addScript('gb-tiktok','https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+encodeURIComponent(id)+'&lib=ttq');
      };
      ttq.load(config.tikTokPixelId);
    }
    if(config.pinterestTagId) {
      const w=win() as any;
      if(!w.pintrk){const q:any=(...args:any[])=>q.queue.push(args);q.queue=[];q.version='3.0';w.pintrk=q;}
      w.pintrk('load',config.pinterestTagId);
      addScript('gb-pinterest','https://s.pinimg.com/ct/core.js');
    }
    if(config.snapPixelId) {
      const w=win() as any;
      if(!w.snaptr){const q:any=(...args:any[])=>q.handleRequest?q.handleRequest.apply(q,args):q.queue.push(args);q.queue=[];q.version='1.0';w.snaptr=q;}
      w.snaptr('init',config.snapPixelId,{});
      addScript('gb-snap','https://sc-static.net/scevent.min.js');
    }
  }
}
export async function initAnalytics():Promise<void>{
  if(typeof window==='undefined')return;
  if(!loadingPromise) {
    loadingPromise=(async()=>{
      try{
        const response=await fetch('/api/tracking-config',{cache:'no-store'});
        if(response.ok){
          const data=await response.json() as {config?:unknown}|null;
          config=getSafeTrackingConfig(data?.config);
        }
      }catch{config={...DEFAULT_TRACKING_CONFIG};}
      loaded=true;
    })();
  }
  await loadingPromise;
  activateTags();
}
const granted=(type:'analytics'|'marketing')=>Boolean(getTrackingConsent()?.[type]);
const send=(name:string,values:Record<string,unknown>={})=>{
  if(typeof window==='undefined')return;
  if(!loaded){void initAnalytics().then(()=>send(name,values));return;}
  activateTags();
  if(granted('analytics')&&config.googleAnalyticsId&&!document.getElementById('gb-gtm')&&win().gtag)
    win().gtag!('event',name==='PageView'?'page_view':name==='ViewContent'?'view_item':name==='AddToCart'?'add_to_cart':name==='InitiateCheckout'?'begin_checkout':name==='Purchase'?'purchase':name==='WhatsAppClick'?'generate_lead':name,values);
  if(granted('marketing')){
    const w=win();
    if(config.metaPixelId&&w.fbq)w.fbq('track',name==='WhatsAppClick'?'Lead':name,values);
    if(config.tikTokPixelId&&w.ttq)(name==='PageView'?w.ttq.page():w.ttq.track(name==='Purchase'?'PlaceAnOrder':name==='WhatsAppClick'?'Contact':name,values));
    if(config.pinterestTagId&&w.pintrk)w.pintrk('track',name==='Purchase'?'checkout':name==='AddToCart'?'addtocart':'pagevisit',values);
    if(config.snapPixelId&&w.snaptr)w.snaptr('track',name==='Purchase'?'PURCHASE':name==='AddToCart'?'ADD_CART':name==='ViewContent'?'VIEW_CONTENT':'PAGE_VIEW',values);
    if(config.googleAdsId&&config.googleAdsConversionLabel&&!document.getElementById('gb-gtm')&&w.gtag&&name==='Purchase')
      w.gtag('event','conversion',{send_to:config.googleAdsId+'/'+config.googleAdsConversionLabel,...values});
  }
  if(config.googleTagManagerId && document.getElementById('gb-gtm'))
    win().dataLayer?.push({event:'globabox_'+name.toLowerCase(),...values});
};
export function triggerPageView(path:string){
  if(path.startsWith('/admin'))return;
  send('PageView',{page_path:path,page_title:typeof document!=='undefined'?document.title:''});
}
export function triggerViewContent(product:{id:string;name:string;price:number;category?:string}){
  send('ViewContent',{content_ids:[product.id],content_name:product.name,content_category:product.category||'',content_type:'product',currency:'MAD',value:product.price,
    items:[{item_id:product.id,item_name:product.name,item_category:product.category,price:product.price,quantity:1}]});
}
export function triggerAddToCart(product:{id:string;name:string;price:number;category?:string},quantity=1){
  send('AddToCart',{content_ids:[product.id],content_name:product.name,content_category:product.category||'',content_type:'product',currency:'MAD',value:product.price*quantity,quantity,
    items:[{item_id:product.id,item_name:product.name,price:product.price,quantity}]});
}
export function triggerInitiateCheckout(cartItems:any[],totalPrice:number){
  send('InitiateCheckout',{content_ids:cartItems.map(x=>x.id),content_type:'product',currency:'MAD',value:totalPrice,
    items:cartItems.map(x=>({item_id:x.id,item_name:x.name,price:x.price,quantity:x.quantity}))});
}
export function triggerPurchase(reference:string,cartItems:any[],totalPrice:number){
  send('Purchase',{transaction_id:reference,order_ref:reference,content_ids:cartItems.map(x=>x.id),content_type:'product',currency:'MAD',value:totalPrice,
    items:cartItems.map(x=>({item_id:x.id,item_name:x.name,price:x.price,quantity:x.quantity}))});
}
export function triggerWhatsAppClick(label='Support Button'){send('WhatsAppClick',{click_label:label});}
