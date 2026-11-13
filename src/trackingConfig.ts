/** Validated PUBLIC vendor pixel IDs only; never store secrets or tokens. */
export interface TrackingConfig {
 metaPixelId:string; tikTokPixelId:string; googleAnalyticsId:string;
 googleAdsId:string; googleAdsConversionLabel:string; googleTagManagerId:string;
 pinterestTagId:string; snapPixelId:string; googleSearchConsoleId:string;
}
export type TrackingKey=keyof TrackingConfig;
export const DEFAULT_TRACKING_CONFIG:TrackingConfig={
 metaPixelId:'',tikTokPixelId:'',googleAnalyticsId:'',
 googleAdsId:'',googleAdsConversionLabel:'',googleTagManagerId:'',
 pinterestTagId:'',snapPixelId:'',googleSearchConsoleId:''
};
export const TRACKING_FIELDS:Array<{key:TrackingKey;name:string;example:string;description:string;category:'analytics'|'marketing'|'verification'}>=[
 {key:'metaPixelId',name:'Meta Pixel · Facebook / Instagram',example:'123456789012345',description:'Pages, produits, panier, commandes',category:'marketing'},
 {key:'googleAnalyticsId',name:'Google Analytics 4',example:'G-XXXXXXXXXX',description:'Audiences et e-commerce GA4',category:'analytics'},
 {key:'googleTagManagerId',name:'Google Tag Manager',example:'GTM-ABCDEFG',description:'Conteneur de balises à paramétrer dans Google',category:'marketing'},
 {key:'googleAdsId',name:'Google Ads',example:'AW-123456789',description:'Mesure des conversions Google Ads',category:'marketing'},
 {key:'googleAdsConversionLabel',name:'Google Ads · label conversion',example:'AbCdEfGhIj',description:'Label de conversion Purchase associé au tag Google Ads',category:'marketing'},
 {key:'tikTokPixelId',name:'TikTok Pixel',example:'CABCDEF1234567890123',description:'Pages et événements du panier',category:'marketing'},
 {key:'pinterestTagId',name:'Pinterest Tag',example:'1234567890123',description:'Pages, panier et checkout',category:'marketing'},
 {key:'snapPixelId',name:'Snapchat Pixel',example:'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',description:'Pages et événements de vente',category:'marketing'},
 {key:'googleSearchConsoleId',name:'Search Console · code public',example:'abcdefg_1234567',description:'Vérification manuelle conseillée via DNS',category:'verification'}
];
const patterns:Record<TrackingKey,RegExp>={
 metaPixelId:/^[0-9]{8,22}$/,
 tikTokPixelId:/^[A-Z0-9]{10,40}$/,
 googleAnalyticsId:/^G-[A-Z0-9]{5,20}$/,
 googleAdsId:/^AW-[0-9]{8,20}$/,
 googleAdsConversionLabel:/^[A-Za-z0-9_-]{4,100}$/,
 googleTagManagerId:/^GTM-[A-Z0-9]{4,20}$/,
 pinterestTagId:/^[0-9]{8,22}$/,
 snapPixelId:/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
 googleSearchConsoleId:/^[A-Za-z0-9_-]{6,160}$/
};
export const isTrackingIdValid=(key:TrackingKey,value:string)=>!value||patterns[key].test(value.trim());
export function validateTrackingConfig(input:unknown):TrackingConfig|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const obj=input as Record<string,unknown>;
 if(Object.keys(obj).some(key=>!(key in DEFAULT_TRACKING_CONFIG)))return null;
 const c={...DEFAULT_TRACKING_CONFIG};
 for(const key of Object.keys(c) as TrackingKey[]){
  const value=obj[key];if(value!==undefined&&typeof value!=='string')return null;
  const id=typeof value==='string'?value.trim():'';
  if(id.length>180||!isTrackingIdValid(key,id))return null;
  c[key]=id;
 }
 if(c.googleAdsConversionLabel&&!c.googleAdsId)return null;
 return c;
}
export function getSafeTrackingConfig(input:unknown):TrackingConfig{
 return validateTrackingConfig(input)||{...DEFAULT_TRACKING_CONFIG};
}
