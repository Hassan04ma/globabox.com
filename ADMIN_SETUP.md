# GLOBABOX admin deployment checklist

This feature is NOT deployed. Work remains on branch `security-and-import-prep`.

Set **server-only** environment variables (never `VITE_` and never commit their values):

- `ADMIN_USERNAME`: admin login name (defaults to `admin`)
- `ADMIN_PASSWORD`: a unique password at least 12 characters
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters
- `ADMIN_API_KEY`: a different random secret of at least 32 characters, used by the Python importer only

New endpoints: `POST /api/admin/login`, `GET /api/admin/session`, `POST /api/admin/logout`, `POST /api/import-products` (private, creates drafts).

Important: The current Express server uses local `products.json` and `orders.json`; Cloudflare Workers deployment will require a compatible runtime and persistent storage (e.g. D1/R2). Do not deploy this branch before end-to-end validation. Ensure product/order admin actions succeed via cookie, public checkout works, and drafts never appear publicly. Add rate limiting to login and review CSRF protections before launch.
