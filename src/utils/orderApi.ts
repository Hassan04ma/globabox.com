import { Order } from '../types';
import { getTrackingConfig } from './analytics';

/**
 * Sends the order directly to Google Apps Script endpoint from the browser.
 * Uses no-cors to handle redirect and avoid preflight issues inside sandboxed environments.
 */
async function sendDirectAppsScript(order: Order): Promise<{ success: boolean; syncStatus: 'synced' | 'failed' }> {
  // Converted to target specific Google Sheets integration defined by the user
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbw3pALOotIQZCWeDdNHERbfIL9OIooOo5KMVwamtxawRLfeu9IlUoE1Ep5tROB5oMLgBg/exec";

  const productNames = (order.items || []).map((it: any) => {
    const details = [];
    if (it.selectedSize) details.push(it.selectedSize);
    if (it.selectedColor) details.push(it.selectedColor);
    const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
    return `${it.productName || ''}${detailStr}`;
  }).join(', ');

  const productIds = (order.items || []).map((it: any) => it.productId || '').join(', ');
  const quantities = (order.items || []).map((it: any) => it.quantity || 1).join(', ');
  const productPrices = (order.items || []).map((it: any) => `${it.price || 0} DH`).join(', ');

  const flatPayload = {
    orderId: order.id,
    reference: order.reference,
    date: order.date,
    customerName: order.fullName,
    customerPhone: order.phoneNumber,
    city: order.city,
    address: order.deliveryAddress,
    notes: order.notes || '',
    productNames,
    productIds,
    quantities,
    productPrices,
    subtotal: order.subtotal || order.total || 0,
    shippingCost: order.shippingCost || 0,
    finalTotal: order.finalTotal || order.total || 0,
    paymentMethod: order.paymentMethod || 'Cash on delivery',
    status: order.status || 'pending',
    whatsappMessage: order.whatsappMessage || '',
    source: order.source || 'checkout'
  };

  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(flatPayload)
    });

    console.log("[ORDER SHEETS] direct Apps Script fallback submitted");
    return { success: true, syncStatus: 'synced' };
  } catch (err: any) {
    console.error("[ORDER SHEETS] direct Apps Script fallback failed:", err);
    return { success: false, syncStatus: 'failed' };
  }
}

/**
 * Saves order data to a real production backend/webhook in addition to localStorage.
 * Integrates dynamically with custom endpoints, webhook configurations, or Google Sheets scripts.
 */
export async function saveOrderToBackend(order: Order): Promise<{ success: boolean; error?: string; syncStatus?: 'synced' | 'failed' | 'not-configured' }> {
  console.log("[ORDER SHEETS] trying /api/orders");

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[GLOBABOX BACKEND] ✅ Express server responded successfully:`, data);
      
      if (data.syncStatus === 'synced') {
        return { 
          success: true, 
          syncStatus: 'synced',
          error: data.syncError 
        };
      } else {
        console.log("[ORDER SHEETS] /api/orders unavailable, using direct Apps Script fallback");
        const fallbackResult = await sendDirectAppsScript(order);
        return {
          success: fallbackResult.success,
          syncStatus: fallbackResult.syncStatus
        };
      }
    } else {
      console.warn(`[ORDER SHEETS] /api/orders unavailable, using direct Apps Script fallback (Status ${response.status})`);
      const fallbackResult = await sendDirectAppsScript(order);
      return {
        success: fallbackResult.success,
        syncStatus: fallbackResult.syncStatus
      };
    }
  } catch (err: any) {
    console.warn("[ORDER SHEETS] /api/orders unavailable, using direct Apps Script fallback (Network/Server Offline)");
    const fallbackResult = await sendDirectAppsScript(order);
    return {
      success: fallbackResult.success,
      syncStatus: fallbackResult.syncStatus
    };
  }
}

