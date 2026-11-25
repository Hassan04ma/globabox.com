# GLOBABOX AI Landing Pages — implementation plan

## Goal
Add an AI-assisted landing-page studio inside the existing authenticated Admin. The merchant can upload a product photo, optionally provide a product name, sale price and comparison price, and ask AI to prepare a professional sales page in Arabic, French and English.

## Merchant workflow
1. Upload a product image (reuse the existing authenticated `POST /api/admin/media` endpoint).
2. Enter any known facts: product name, selling price, comparison price, stock/product record, target audience and campaign notes. Unknown values remain suggestions, never facts.
3. Generate a first draft with AI. The draft contains:
   - Three-language headline, subheadline, CTA, product description and FAQ.
   - Benefits and differentiators grounded in supplied facts.
   - A clearly labelled "points to verify / limitations" section. Do not invent product specifications, guarantees, certifications, reviews, delivery promises or scarcity.
   - Suggested sale price and comparison price only as optional recommendations, with a clear "merchant approval required" state.
   - Mobile-first section order, image placement, trust and COD form copy.
4. Edit the generated copy and layout, preview each language, save as draft, and explicitly publish.
5. Publish under `https://globabox.com/lp/<slug>`. The page includes an Arabic / Français / English selector and a COD form.
6. The order form must use the existing order-validation and D1 orders pipeline, require a mapped active product with verified price and stock, and preserve order reference + phone-based customer tracking. The page slug / campaign attribution is stored as order source metadata.

## Admin workspace
Add a dedicated "Landing Pages" navigation item, separate from the existing Marketing / Pixel settings. The builder should include:
- AI creation from image and optional merchant inputs.
- Draft / published / paused states.
- Page list, preview, edit, duplicate and unpublish.
- Language tabs with RTL Arabic and LTR French / English.
- A product mapping control. A page may be designed without a product mapping, but its order form cannot be activated until it maps to a published, in-stock product.
- UTM and campaign attribution fields.
- Page analytics (views, form starts, submitted orders) only after event collection is implemented and privacy/cookie requirements are reviewed.

## AI integration and security
- Use a server-side Gemini API integration (the project already includes `@google/genai`; the Cloudflare Worker must use a server-only `GEMINI_API_KEY` secret or a supported server-side REST call).
- Never expose the API key to React, HTML, client bundles, logs, or Git.
- If the key is missing, show a clear Admin-only configuration error; manual page editing remains available.
- Treat image and merchant text as untrusted input. Validate model JSON and lengths before saving.
- AI output is always a draft. No automatic publication or automatic price/stock change.
- Limit image size/type, generation rate and request size. Do not fetch arbitrary external image URLs from the Worker (SSRF protection).

## Storage and order safety
- Add a new D1 `landing_pages` table through an additive migration only. Do not modify or replace existing products, orders, tracking, or customer tables.
- Store page content and publication state separately from product records.
- Do not create a second order database. Use the existing `orders` table and existing server-side order quote/validation path.
- Customer tracking continues to use the existing order reference + phone verification. Public page responses must never expose customer PII or admin draft content.
- Record `source='landing-page'`, page slug and permitted UTM values on the order without changing the order total calculation.
- Include a staging-only end-to-end test: generate/save draft, publish, language switch, invalid form rejection, valid COD order, Admin visibility, and customer tracking. Verify existing order counts and records are unchanged by migrations.

## Release gates
- TypeScript and production build pass.
- Worker endpoint auth tests pass; all write/admin routes require the existing server-side admin session.
- Gemini secret is configured as a Cloudflare secret in staging first.
- D1 migration is applied to staging only first; production D1 remains untouched until explicit release approval.
- Page publishing, order creation, and tracking are verified on staging before a production deployment.
- Do not merge or deploy to production automatically.
