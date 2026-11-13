/**
 * Public business contact address.
 *
 * Configure VITE_CONTACT_EMAIL in the Cloudflare staging/production BUILD environment
 * only after a real Gmail mailbox has been created and tested. Never publish
 * an unverified or invented address.
 *
 * Public by nature: do not use this setting for passwords or private data.
 */
const candidate = String((import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env?.VITE_CONTACT_EMAIL || '').trim().toLowerCase();

export const CONTACT_EMAIL =
  /^[a-z0-9][a-z0-9.+_-]{0,62}@gmail\.com$/.test(candidate) ? candidate : '';

export const CONTACT_EMAIL_LINK = CONTACT_EMAIL
  ? 'mailto:' + CONTACT_EMAIL
  : '';
