# GLOBABOX — security and deployment checklist

This branch is NOT production-ready. Do not deploy until the issues below are fixed and tested.

## Critical blockers

- `server.ts` exposes `POST /api/products`, `PUT /api/products/:id`, and `DELETE /api/products/:id` without server-side authentication.
- `GET /api/orders`, `PUT /api/orders/:id`, `DELETE /api/orders/:id`, and `DELETE /api/orders-clear` require server-side admin authentication. Public checkout (`POST /api/orders`) must remain available, with validation and rate limiting.
- `AdminPanel.tsx` uses a client-side password/sessionStorage gate; it must not be treated as authorization for backend operations. Do not put secret admin passwords in `VITE_*` variables.
- Review `/api/config` and prevent private integration URLs or secrets from being exposed to customers.
- This repository is public. Do not commit `.env`, API keys, credentials, or customer data. Rotate any credentials that may have been committed.

## Next changes

1. Introduce server-side admin auth (prefer sessions or a trusted identity provider); enforce it for all private APIs.
2. Validate imported product data, prevent duplicates, and keep imported products unpublished until approved.
3. Replace local JSON storage with persistent managed storage for production, and test backup/recovery.
4. Run TypeScript/build, endpoint authentication tests, checkout/order tests before deployment.

The original site and main branch are intentionally left untouched.
