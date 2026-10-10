import React from 'react';
import { Language } from '../types';

// Persistent configurable Tracking IDs using localStorage fallback so admins can customize them easily
export interface TrackingConfig {
  metaPixelId: string;
  tikTokPixelId: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  webhookUrl?: string;
}

export const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  metaPixelId: 'FB-987654321-GLOBABOX-PLACEHOLDER',
  tikTokPixelId: 'TT-ABC123XYZ-GLOBABOX-PLACEHOLDER',
  googleAnalyticsId: 'G-777777777-GLOBABOX-PLACEHOLDER',
  googleSearchConsoleId: 'google-site-verification-globabox-placeholder-code',
  webhookUrl: 'https://api.globabox.com/webhooks/orders'
};

// Get current active config
export function getTrackingConfig(): TrackingConfig {
  if (typeof window === 'undefined') return DEFAULT_TRACKING_CONFIG;
  const stored = localStorage.getItem('globabox_tracking_config');
  if (stored) {
    try {
      return { ...DEFAULT_TRACKING_CONFIG, ...JSON.parse(stored) };
    } catch (e) {
      return DEFAULT_TRACKING_CONFIG;
    }
  }
  return DEFAULT_TRACKING_CONFIG;
}

// Save active config (used in settings panel)
export function saveTrackingConfig(config: TrackingConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('globabox_tracking_config', JSON.stringify(config));
  
  // Re-trigger tags injection
  initAnalytics();
}

/**
 * Validates a tracking ID to ensure it is not a dummy, empty, placeholder, or template ID.
 */
export function isTrackerValid(id: string): boolean {
  if (!id) return false;
  const normalized = id.toUpperCase().trim();
  if (normalized === '') return false;
  if (normalized.includes('PLACEHOLDER')) return false;
  if (normalized.includes('YOUR_')) return false;
  if (normalized.includes('TEMPLATE')) return false;
  if (normalized.includes('TEST')) return false;
  if (normalized.includes('DEMO')) return false;
  if (normalized.includes('FB-987654321')) return false;
  if (normalized.includes('TT-ABC123XYZ')) return false;
  if (normalized.includes('G-777777777')) return false;
  if (normalized.includes('SITE-VERIFICATION-GLOBABOX-PLACEHOLDER')) return false;
  return true;
}

// Development logger helper
const logEvent = (eventName: string, params?: any) => {
  console.log(
    `%c[GLOBABOX PIXEL TRACKER] 📊 Triggered -> ${eventName}`,
    'background: #1e293b; color: #f97316; font-weight: bold; padding: 4px 8px; rounded: 4px;',
    params || ''
  );
};

/**
 * Initialize and load marketing scripts on demand.
 * Sets up GTAG, Meta Pixel (FBQ), and TikTok Pixel (TTQ) script blocks as requested.
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const config = getTrackingConfig();

  // 1. Inject Search Console Verification Header dynamically if it does not exist
  let metaTag = document.getElementById('gsc-verification') as HTMLMetaElement;
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.id = 'gsc-verification';
    metaTag.name = 'google-site-verification';
    document.head.appendChild(metaTag);
  }
  metaTag.content = isTrackerValid(config.googleSearchConsoleId) ? config.googleSearchConsoleId : 'disabled';

  // 2. Setup Google Analytics Script Block (GTAG)
  if (isTrackerValid(config.googleAnalyticsId)) {
    const gaScriptId = 'gtag-script';
    const gaScript = document.getElementById(gaScriptId);
    if (!gaScript) {
      const scriptEl = document.createElement('script');
      scriptEl.id = gaScriptId;
      scriptEl.async = true;
      scriptEl.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
      document.head.appendChild(scriptEl);

      // Create window data layer
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtagFn = function (..._args: any[]) {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag = gtagFn;
      gtagFn('js', new Date());
      gtagFn('config', config.googleAnalyticsId);
    }
  }

  // 3. Setup Meta Facebook Pixel Block (FBQ)
  if (isTrackerValid(config.metaPixelId)) {
    const fbScriptId = 'fb-pixel-script';
    const fbScript = document.getElementById(fbScriptId);
    if (!fbScript) {
      // standard pixel boilerplate
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode!.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      (window as any).fbq('init', config.metaPixelId);
    }
  }

  // 4. Setup TikTok Pixel Block (TTQ)
  if (isTrackerValid(config.tikTokPixelId)) {
    const ttScriptId = 'tt-pixel-script';
    const ttScript = document.getElementById(ttScriptId);
    if (!ttScript) {
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (ts: any, ev: any) {
          ts[ev] = function () {
            ts.push([ev].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.instance = function (ts: any) {
          for (var e = ttq._i[ts] || [], n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(e, ttq.methods[n]);
          }
          return e;
        };
        ttq.load = function (e: any, n: any) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var o = d.createElement('script');
          o.type = 'text/javascript';
          o.async = !0;
          o.src = i + '?sdkid=' + e + '&lib=' + t;
          var a = d.getElementsByTagName('script')[0];
          a.parentNode!.insertBefore(o, a);
        };
      })(window, document, 'ttq');

      (window as any).ttq.load(config.tikTokPixelId);
      (window as any).ttq.page();
    }
  }
}

/**
 * Event Trigger 1: PageView
 */
export function triggerPageView(path: string) {
  logEvent('PageView', { path });
  
  const config = getTrackingConfig();

  // GA4 pageview
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title
    });
  }

  // Meta standard PageView
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'PageView');
  }

  // TikTok standard Page
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.page();
  }
}

/**
 * Event Trigger 2: ViewContent (Viewing product page/popup)
 */
export function triggerViewContent(product: { id: string; name: string; price: number; category?: string }) {
  const eventParams = {
    content_name: product.name,
    content_category: product.category || 'Camping & Adventure',
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'MAD'
  };

  logEvent('ViewContent', eventParams);

  const config = getTrackingConfig();

  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'view_item', {
      currency: 'MAD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1
      }]
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'ViewContent', eventParams);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.track('ViewContent', {
      contents: [{
        content_id: product.id,
        content_name: product.name,
        price: product.price,
        quantity: 1
      }],
      value: product.price,
      currency: 'MAD'
    });
  }
}

/**
 * Event Trigger 3: AddToCart
 */
export function triggerAddToCart(
  product: { id: string; name: string; price: number; category?: string },
  quantity: number = 1
) {
  const eventParams = {
    content_name: product.name,
    content_category: product.category || 'Camping & Adventure',
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: 'MAD',
    quantity: quantity
  };

  logEvent('AddToCart', eventParams);

  const config = getTrackingConfig();

  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'add_to_cart', {
      currency: 'MAD',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'AddToCart', eventParams);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.track('AddToCart', {
      contents: [{
        content_id: product.id,
        content_name: product.name,
        price: product.price,
        quantity: quantity
      }],
      value: product.price * quantity,
      currency: 'MAD'
    });
  }
}

/**
 * Event Trigger 4: InitiateCheckout
 */
export function triggerInitiateCheckout(cartItems: any[], totalPrice: number) {
  const contentIds = cartItems.map(item => item.id);
  const eventParams = {
    content_ids: contentIds,
    content_type: 'product',
    value: totalPrice,
    currency: 'MAD',
    num_items: cartItems.length
  };

  logEvent('InitiateCheckout', eventParams);

  const config = getTrackingConfig();

  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'MAD',
      value: totalPrice,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'InitiateCheckout', eventParams);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.track('InitiateCheckout', {
      contents: cartItems.map(item => ({
        content_id: item.id,
        content_name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      value: totalPrice,
      currency: 'MAD'
    });
  }
}

/**
 * Event Trigger 5: Purchase / Lead (Triggered on successful checkout)
 */
export function triggerPurchase(orderReference: string, cartItems: any[], totalPrice: number) {
  const contentIds = cartItems.map(item => item.id);
  const eventParams = {
    content_ids: contentIds,
    content_type: 'product',
    value: totalPrice,
    currency: 'MAD',
    num_items: cartItems.length,
    order_ref: orderReference
  };

  logEvent('Purchase', eventParams);

  const config = getTrackingConfig();

  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: orderReference,
      currency: 'MAD',
      value: totalPrice,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'Purchase', eventParams);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.track('PlaceAnOrder', {
      contents: cartItems.map(item => ({
        content_id: item.id,
        content_name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      value: totalPrice,
      currency: 'MAD'
    });
  }
}

/**
 * Event Trigger 6: WhatsAppClick (Direct communication trigger)
 */
export function triggerWhatsAppClick(label: string = 'Support Button') {
  const eventParams = {
    click_label: label,
    time: new Date().toISOString()
  };

  logEvent('WhatsAppClick', eventParams);

  const config = getTrackingConfig();

  // GA4 custom event
  if (typeof window !== 'undefined' && (window as any).gtag && isTrackerValid(config.googleAnalyticsId)) {
    (window as any).gtag('event', 'whatsapp_click', {
      click_label: label
    });
    (window as any).gtag('event', 'generate_lead', {
      click_label: label
    });
  }

  // Meta Pixel Custom Lead
  if (typeof window !== 'undefined' && (window as any).fbq && isTrackerValid(config.metaPixelId)) {
    (window as any).fbq('track', 'Lead', {
      content_name: 'WhatsApp Contact',
      content_category: label
    });
  }

  // TikTok Custom Click Tracker
  if (typeof window !== 'undefined' && (window as any).ttq && isTrackerValid(config.tikTokPixelId)) {
    (window as any).ttq.track('Contact', {
      type: 'whatsapp',
      label: label
    });
  }
}
