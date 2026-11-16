# GLOBABOX — Brand & storefront guide

## Brand
GLOBABOX is a general online store for Morocco. It must never be presented as a camping-only retailer or a replica of another store.

- Wordmark: `/brand/globabox-logo.svg` (public/brand)
- Symbol/favicon: `/brand/globabox-mark.svg`
- Primary deep green: `#104D43`
- Dark text: `#193E38`
- Warm yellow accent: `#F4C75A`
- Secondary accent: `#25776B`
- Background: `#FFFFFF`; neutral sections `#F6F8F6`
- Tone: clear, helpful, trustworthy, practical, never exaggerated.
- Strapline: "Votre shopping, simplifié" / "اختيارات ذكية لكل يوم" / "Smart finds, everyday".
- Typography: existing site Inter, with Arabic fallback.

## Catalog principles
- New general categories: technology, kitchen, beauty, auto, fashion and home organization.
- Keep all existing outdoor categories, product IDs and order data, including old D1 category overrides.
- Merchandising sections must show actual available stock rather than filler/demo products.
- A newly created category with no products must display an honest empty state, not fake inventory.
- Do not import product pictures or text from competitor stores without permission.

## Commerce and trust
- Morocco COD checkout stays backed by Cloudflare Workers + D1; do not change auth or orders schema as part of visual work.
- Shipping is manually organized until the AMEEX integration is verified.
- Existing policies: 35 MAD delivery below 500 MAD; free from 500 MAD unless order quote policy is intentionally revised and tested.
- Never show fake testimonials, unverified reviews, simulated order notifications or fake countdowns.
- Never claim courier handoff, delivery times or cancellation windows without policy confirmation.

## Before merging
1. npm install --no-audit --no-fund
2. npm run lint
3. npx tsx tests/orderQuote.test.ts
4. npx tsx tests/workerApi.test.ts
5. npm run build:cloudflare
6. bash scripts/test-local-d1.sh
7. npx wrangler deploy --dry-run
8. Manual browser/mobile review, incl. Arabic RTL, cart, checkout, admin and categories.
9. Verify staging checkout and product images before production deployment.

## Ownership
GLOBABOX brand artwork here is original and editable SVG; reference store layouts are for broad UX inspiration only.
