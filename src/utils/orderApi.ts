import type { Order } from '../types';

/**
 * A checkout succeeds only after the first-party backend has persisted an order.
 * Do not treat an opaque "no-cors" Google Apps Script request as proof of success,
 * or transmit customer details to an unverified fallback destination.
 */
export async function saveOrderToBackend(order: Order): Promise<{
  success: boolean;
  error?: string;
  syncStatus: 'synced' | 'failed';
  savedOrder?: Order;
}> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      return { success: false, syncStatus: 'failed', error: 'Le serveur a refusé la commande (' + response.status + ').' };
    }

    const data = await response.json().catch(() => null);
    if (data?.success !== true || typeof data?.order?.id !== 'string' || !data.order.id) {
      return { success: false, syncStatus: 'failed', error: 'La sauvegarde de la commande n’a pas été confirmée.' };
    }

    // The first-party database confirmed the write. A secondary Sheets export,
    // if enabled on the server, has its own independent status.
    return { success: true, syncStatus: 'synced', savedOrder: data.order as Order };
  } catch (error) {
    console.error('[GLOBABOX] Order persistence failed', error);
    return { success: false, syncStatus: 'failed', error: 'Connexion au serveur impossible. Veuillez réessayer.' };
  }
}
