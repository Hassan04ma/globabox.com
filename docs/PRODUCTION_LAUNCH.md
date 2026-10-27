# GLOBABOX production launch checklist

**Status:** NOT RELEASED. This file is an operational checklist, not a permission to deploy.

## Environments
- Customer domain: `globabox.com`, currently observed opening a Shopify storefront/password page (27 October 2026). **Do not change DNS until ready.**
- New frontend on Cloudflare Worker: `globabox-com`; its existing public `workers.dev` URL is a visual smoke test, **not proof of production checkout**.
- Staging: `globabox-staging`, separate `globabox-staging-db`, with existing `test.globabox.com`.
- Branch chain: PR #2 `security-and-import-prep` targets `main`; PR #3 `fix/checkout-confirmation-2026-10-27` targets `security-and-import-prep`. **Both are Draft.** Both must be safely merged in order when fully approved; do not simply merge PR #3 into `main` with assumptions about PR #2.

## Mandatory no-go gates
- [ ] Staging **deployed Worker runtime** is running the expected commit (PR preview builds alone do not update its production deployment).
- [ ] D1 **staging** migrations applied, and a test COD checkout inserted into remote staging D1. Inspect exact saved row and verify the confirmation ID matches. Clean up only the known test record.
- [ ] Admin login/logout and sessions tested end-to-end on HTTPS using staging-only `ADMIN_PASSWORD` (12+ characters), `ADMIN_SESSION_SECRET` (32+ random characters), and optional `ADMIN_USERNAME`. Configure with Cloudflare encrypted **Runtime Secrets**, never `wrangler.jsonc`, GitHub, or chat messages.
- [ ] Rates/abuse protection configured for login and POST `/api/orders` using an enforceable server/edge rate limit and request size bounds.
- [ ] Products verified with supplier for stock, actual sale prices, accurate images, shipping SLA and returns. Do not expose unverified demo products as purchasable.
- [ ] Branding and intended catalog confirmed: current site screenshot shows outdoor/camping product positioning, not a general marketplace. Agree final categories and hero claims.
- [ ] Real support WhatsApp number, contact information, privacy and return policy verified.
- [ ] Backup current production Cloudflare D1 (if populated) and Shopify products/orders/customer data as needed; document rollback.
- [ ] Confirm GitHub Actions and two Cloudflare preview build checks green on **the final commit**.
- [ ] Validate production Worker **before** cutover at its workers.dev URL: admin, checkout, product availability, empty catalog, errors, TLS.

## Domain cutover — only after all gates
1. In Cloudflare dashboard open the `globabox.com` **zone** → DNS → Records; record current A/AAAA/CNAME records for `@` and `www`, plus any MX/TXT email-related records, and current registrar/nameservers.
2. Confirm domain is an active Cloudflare zone under the correct account. **Keep MX, SPF, DKIM and other unrelated records unchanged.**
3. Shopify may use conflicting A/CNAME records. Cloudflare Workers custom domains cannot be attached to an existing CNAME hostname; reconcile exact conflicting records only when prepared for switching.
4. In `globabox-com` → Domains → Add Domain, attach `globabox.com` once the production Worker is validated. Separately attach `www.globabox.com` (or configure a clear 301 canonical redirect) after checking its existing DNS and SSL.
5. Confirm homepage, catalog, checkout and admin routes on both hostnames, TLS/HTTPS, no stale Shopify password page, and order persistence in production D1 with a controlled test record. Verify analytics.
6. For rollback, restore the recorded prior DNS/hostname routing (and restore prior Worker deployment if needed). **Do not shut down Shopify or discard backups** before validation.

## Operational notes
- Never publish staging secrets or use staging DB as a production binding.
- Never perform production D1 migrations without knowing the current schema and making backups.
- Do not treat all-green CI and local SQLite-D1 tests as a substitute for a successful real remote D1 write.
- Do not accept paid traffic until order capture, operational fulfillment and support are ready.
