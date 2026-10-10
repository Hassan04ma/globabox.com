import { Router } from 'express';
import { createHash } from 'node:crypto';
import { requireAdminApiKey } from './adminAuth';

export function importProductsRouter(readProducts: () => any[], writeProducts: (items: any[]) => void) {
  const router = Router();
  router.post('/', requireAdminApiKey, (req, res) => {
    const incoming = req.body?.products;
    if (!Array.isArray(incoming) || !incoming.length || incoming.length > 50)
      return res.status(400).json({ error: 'Provide 1–50 products' });
    const all = readProducts();
    const created: string[] = [], skipped: string[] = [], rejected: number[] = [];
    for (const [i, p] of incoming.entries()) {
      let source: URL, image: URL;
      try { source = new URL(p.sourceUrl); image = new URL(p.image); }
      catch { rejected.push(i); continue; }
      if (source.protocol !== 'https:' || !['atwache.ma','www.atwache.ma'].includes(source.hostname) ||
          image.protocol !== 'https:' || typeof p.name?.fr !== 'string' || !p.name.fr.trim() ||
          typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price <= 0) {
        rejected.push(i); continue;
      }
      if (all.some(x => x.sourceUrl === source.href)) { skipped.push(source.href); continue; }
      const id = 'atwache_' + createHash('sha256').update(source.href).digest('hex').slice(0,16);
      all.push({id,sourceUrl:source.href,supplier:'Atwache',isActive:false,price:p.price,
        name:{fr:p.name.fr,ar:p.name.ar || p.name.fr,en:p.name.en || p.name.fr},
        description:{fr:p.description?.fr || '',ar:p.description?.ar || '',en:p.description?.en || ''},
        image:image.href,images:[image.href],category:p.category || 'camping',
        features:{fr:[],ar:[],en:[]},inStock:true,rating:0,reviewsCount:0});
      created.push(id);
    }
    if (created.length) writeProducts(all);
    return res.json({created,skipped,rejected,status:'draft'});
  });
  return router;
}
