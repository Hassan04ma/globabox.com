# GLOBABOX AI Landing Pages — implementation and release status

## Goal
Add an AI-assisted landing-page studio inside the existing authenticated Admin. The merchant can upload product photos, optionally provide a product name and known prices, and generate an editable Arabic, French and English sales-page draft.

## Implemented in the feature branch
- Dedicated Landing Pages workspace in the authenticated Admin.
- Upload and store 1–10 product photos through the existing authenticated media endpoint.
- Server-side OpenAI Responses API vision generation using the `OPENAI_API_KEY` Cloudflare secret, with Workers AI binding as a fallback.
- Structured JSON output for Arabic, French and English copy, FAQs, benefits, limitations and visual design tokens.
- Draft creation, editing, language switching, mobile/desktop preview and explicit save/publish actions.
- Additive D1 `landing_pages` migration; existing product and order tables are not replaced.
- Public `/lp/<slug>` rendering for published pages only, with product status/stock/price rechecked at request time.
- COD order submission through the existing server-side quote and D1 order persistence path, with page attribution recorded on the order.
- Publishing requires a mapped active product with available stock; customer details are not rendered in public page HTML.

## Merchant workflow
1. Upload product photos and optionally enter a known name and prices.
2. Generate a multilingual draft. AI output remains a draft and must be checked by the merchant.
3. Edit copy, FAQ, benefits, limitations and design; preview Arabic/French/English and mobile/desktop.
4. Map the page to an active, in-stock store product.
5. Save as draft or explicitly publish.
6. Customers submit the COD form; server-side order pricing and shipping are calculated from the mapped product, not trusted from the browser.

## AI truthfulness and security
- The current Worker implementation uses `OPENAI_API_KEY` or the Cloudflare Workers AI binding. It does not use `GEMINI_API_KEY`.
- Keep provider credentials server-side only. Never expose keys in React, HTML, client bundles, logs or Git.
- Treat image and merchant text as untrusted input. Validate model output and field lengths before saving.
- Do not invent product specifications, certifications, guarantees, reviews, delivery promises, scarcity or unverified discounts.
- AI output is always a draft. It must not publish automatically or change product price/stock.
- Keep image type/size, request size and generation rate bounded. Do not fetch arbitrary external image URLs from the Worker.

## Storage and order safety
- Apply `0002_landing_pages.sql` additively only. Never delete or rewrite existing products, orders, tracking or customer records.
- Use the existing `orders` table and server-side order quote/validation path; do not create a second order database.
- Customer tracking continues through the existing order reference and phone verification.
- Public pages must not expose customer PII or unpublished draft content.
- Order totals and shipping must be derived server-side. The page slug is stored as order attribution.

## Verification status
- Latest verified GitHub Actions run #393 completed successfully, including lint, order quote tests, Worker API tests, Cloudflare build, local D1 migration test and Wrangler deploy dry-run.
- These checks do not prove a deployed staging end-to-end flow.
- Still required before production: apply the additive migration to staging; verify Admin session and AI provider configuration; run generate → edit → map product → publish → language switch → invalid/valid COD form → Admin order visibility → customer tracking; verify mobile/accessibility and production data preservation.
- Visual section reordering and analytics/conversion recommendations are not complete in this branch and must not be represented as implemented.

## Release policy
- Keep the feature on its branch until staging end-to-end verification passes.
- Do not run the migration against Production or deploy to the live store until staging blockers are closed and the merchant approves the release.
