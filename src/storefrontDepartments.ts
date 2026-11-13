import type { Category } from './types';

/**
 * Public merchandising departments. This changes only the customer-facing
 * navigation. D1 products, categories, old orders and admin are untouched.
 * Photo subjects reflect each department; no products are invented.
 */
export const STORE_DEPARTMENTS: Category[] = [
  {
    id: 'maison',
    name: {fr:'Maison & Déco',ar:'المنزل والديكور',en:'Home & Decor'},
    image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'cuisine',
    name: {fr:'Cuisine & Maison',ar:'المطبخ والأواني',en:'Kitchen & Dining'},
    image:'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'technologie',
    name: {fr:'Électronique & Tech',ar:'الإلكترونيات والتقنية',en:'Electronics & Tech'},
    image:'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'beaute',
    name: {fr:'Beauté & Bien-être',ar:'الجمال والعناية',en:'Beauty & Care'},
    image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'mode',
    name: {fr:'Mode & Accessoires',ar:'الموضة والإكسسوارات',en:'Fashion & Accessories'},
    image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'automobile',
    name: {fr:'Auto & Accessoires',ar:'السيارات والإكسسوارات',en:'Car Accessories'},
    image:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'sport_loisirs',
    name: {fr:'Sport & Fitness',ar:'الرياضة واللياقة',en:'Sports & Fitness'},
    image:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'enfants',
    name: {fr:'Bébé & Enfants',ar:'الأطفال والرضع',en:'Baby & Kids'},
    image:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'jardin',
    name: {fr:'Jardin & Extérieur',ar:'الحديقة والبيت',en:'Garden & Outdoor Home'},
    image:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&h=700&q=82'
  },
  {
    id: 'bureau',
    name: {fr:'Bureau & Organisation',ar:'المكتب والتنظيم',en:'Office & Organization'},
    image:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&h=700&q=82'
  }
];

/** Existing D1 categories used by the old camping/outdoor site, not shown publicly. */
export const HIDDEN_LEGACY_CATEGORIES = new Set([
  'sacs_trekking','camping','tentes','sacs_de_couchage',
  'rechauds','tables_chaises','chasse','peche',
  'outdoor-tools','chaussures','moins_99','offres_packs'
]);

/** Existing related categories consolidated rather than repeated in navigation. */
export const CATEGORY_GROUPS: Record<string,string[]> = {
  maison: ['maison','rangement'],
  mode: ['mode','casquettes'],
  sport_loisirs: ['sport_loisirs'],
  technologie: ['technologie'],
  cuisine: ['cuisine'],
  beaute: ['beaute'],
  automobile: ['automobile'],
  enfants: ['enfants'],
  jardin: ['jardin'],
  bureau: ['bureau']
};

export const isPublicStoreCategory = (id: string) =>
  Object.values(CATEGORY_GROUPS).some(ids => ids.includes(id)) && !HIDDEN_LEGACY_CATEGORIES.has(id);

export const matchesStoreDepartment = (productCategory: string, departmentId: string) =>
  (CATEGORY_GROUPS[departmentId] || [departmentId]).includes(productCategory);
