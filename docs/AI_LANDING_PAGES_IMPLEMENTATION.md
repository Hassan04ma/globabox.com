# GLOBABOX AI Landing Pages — implementation and release status

## Product decisions approved by the merchant (2026-11-25)
These are binding requirements for the feature:
- **Image strategy: both.** Preserve authentic product photos and create additional AI-generated marketing/illustrative visuals. Generated visuals must be visibly distinguished in the editor and must never be represented as documentary product photos. Never alter product identity, ports, controls, dimensions, packaging, included accessories or other factual details. If a generated visual could mislead, omit it and request a real reference image.
- **Publishing: automatic, but gated.** After generation and validation, the system may publish automatically only when all required checks pass. Any uncertain product identity, unsupported claim, unverified image, missing product mapping, stock issue, missing price confirmation or failed order-flow check must block publication and leave the page as a draft/needs-review state. No silent bypass.
- **Price: manual confirmation.** The merchant must enter and explicitly confirm the final selling price for each landing page before publication. Do not infer, generate, copy or change a price automatically from the product record. The checkout/order backend must use a server-validated confirmed price and the existing order quote rules; the browser must never be trusted for totals. Compare-at price/discount is optional and must also be manually confirmed and evidence-backed.
- The merchant's desired input is a product photo (or set of photos); optional known facts are allowed, but the AI should do the research, writing, layout and page assembly without requiring the merchant to write copy or design sections.

## Goal
Build a complete AI sales-page studio inside the existing authenticated GLOBABOX Admin. The merchant uploads product photo(s), confirms the final selling price, and the system creates a complete Arabic, French and English landing page with authentic and clearly labeled generated visuals, content, layout, gallery, FAQs, usage guide, order form and responsive previews.

## Required end-to-end workflow
1. Upload 1–10 authentic product photos. Accept optional product name, packaging photos, manuals or verified specifications.
2. Analyze the product images and identify the product only when confidence is sufficient. Separate observed facts, externally verified facts, merchant-provided facts and unknowns.
3. Research and draft accurate product content in Arabic, French and English: product introduction, problem/use case, benefits, features, specifications, usage instructions, FAQ, known limitations and calls to action.
4. Build the complete page automatically with responsive layout, section order, copy, real-photo gallery, and generated marketing/illustrative assets. Generated assets must be labeled as AI-generated in the admin and must not imply unverified functionality or included accessories.
5. Show a required manual selling-price confirmation step. No price may be published until the merchant confirms it. Any discount/comparison price also requires separate confirmation.
6. Run automated validation: unsupported claims, fabricated reviews/ratings/guarantees/certifications, price mismatch, product mismatch, image mismatch, missing translations, accessibility/mobile layout, broken assets, missing product mapping, inactive/out-of-stock product, and order endpoint validation.
7. If every required gate passes, auto-publish. Otherwise save as draft/needs review and explain exactly what is missing. The merchant can edit any section/image and retry validation.
8. Bind the page to the existing product and existing order system. Public COD order form captures only required delivery details and consent; customer data remains private. Server calculates totals and persists the order in the existing D1 orders table.
9. Provide page list, preview, edit, pause/unpublish, status/reason, page attribution, visits/orders/conversion analytics and audit trail in Admin.

## Current implementation in the feature branch (not all requirements complete)
- Dedicated Landing Pages workspace in authenticated Admin.
- Upload and store 1–10 product photos through the existing authenticated media endpoint.
- Server-side OpenAI Responses API vision generation using the `OPENAI_API_KEY` Cloudflare secret, with Workers AI binding as a fallback.
- Structured JSON output for Arabic, French and English copy, FAQs, benefits, limitations and visual design tokens.
- Draft creation, editing, language switching, mobile/desktop preview and explicit save/publish actions.
- Additive D1 `landing_pages` migration; existing product and order tables are not replaced.
- Public `/lp/<slug>` rendering for published pages only, with product status/stock/price rechecked at request time.
- COD order submission through the existing server-side quote and D1 order persistence path, with page attribution recorded on the order.
- Publishing currently requires a mapped active product with available stock.

## Gaps against the approved requirements
- AI-generated image asset creation is not yet implemented/verified; current gallery support is not equivalent to an AI image-generation pipeline.
- Automatic publish after validation is not implemented; current workspace uses manual save/publish.
- Required manual price confirmation is not safely enforced as a distinct publication gate. The current UI accepts a price field, but that is not sufficient proof of explicit confirmation.
- Full page sections and visual layout/section editing are incomplete; current public renderer does not yet demonstrate every requested section (problem/solution, full specifications, usage steps, limitations, image captions and trust content).
- Research/provenance and claim-level verification are not yet implemented.
- Full staging E2E, analytics/conversion recommendations, accessibility and mobile QA remain outstanding.

## AI truthfulness and security
- The current Worker implementation uses `OPENAI_API_KEY` or the Cloudflare Workers AI binding. It does not use `GEMINI_API_KEY`.
- Keep provider credentials server-side only. Never expose keys in React, HTML, client bundles, logs or Git.
- Treat image and merchant text as untrusted input. Validate model output and field lengths before saving.
- Do not invent product specifications, certifications, guarantees, reviews, delivery promises, scarcity or unverified discounts.
- AI output must not alter store product price or stock. The landing-page price requires explicit merchant confirmation.
- Keep image type/size, request size and generation rate bounded. Do not fetch arbitrary external image URLs from the Worker.
- Distinguish authentic uploaded/source images from AI-generated illustrative images in storage, Admin UI and page metadata.

## Storage and order safety
- Apply `0002_landing_pages.sql` additively only. Never delete or rewrite existing products, orders, tracking or customer records.
- Use the existing `orders` table and server-side order quote/validation path; do not create a second order database.
- Customer tracking continues through the existing order reference and phone verification.
- Public pages must not expose customer PII or unpublished draft content.
- Order totals and shipping must be derived server-side from a validated, confirmed price and the existing shipping/quote rules. The page slug is stored as order attribution.

## Verification status
- GitHub Actions run #393 passed the build and associated checks, including lint, order quote tests, Worker API tests, Cloudflare build, local D1 migration test and Wrangler deploy dry-run.
- A successful build/preview deployment is not proof that the end-to-end feature works.
- Still required before production: implement the approved gaps above; apply the additive migration to staging; verify Admin session and AI provider configuration; run upload → analysis/research → generated visuals → manual price confirmation → complete page assembly → validation → gated auto-publish → language switch → valid/invalid COD order → Admin order visibility → customer tracking; verify mobile/accessibility, image provenance and production data preservation.
- Do not represent incomplete items as implemented.

## Release policy
- Keep the feature on its branch until the approved requirements and staging end-to-end verification pass.
- Do not run the migration against Production or deploy to the live store until staging blockers are closed. Production release must preserve all existing products, orders, tracking and customer records.
