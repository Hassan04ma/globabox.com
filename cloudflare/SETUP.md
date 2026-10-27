# GLOBABOX — Cloudflare D1 setup (PREPARATION ONLY)

The production Cloudflare Worker is still connected to branch `main`. Do not switch branches or update DNS yet.

1. In Cloudflare Dashboard open **Storage & databases → D1 SQL Database → Create database**.
2. Name it `globabox-db`. Record the Database ID from its Overview, and keep account credentials private.
3. Under the new database, open Console and execute the SQL from `cloudflare/migrations/0001_init.sql` (or apply using Wrangler when available).
4. Go to **Compute → Workers & Pages → globabox-com → Settings → Bindings** and add a **D1 database** binding named `DB`, selecting `globabox-db`.
5. The example configuration in `cloudflare/wrangler.example.jsonc` is a template, NOT an active deployment config. It references `cloudflare/worker.ts`, which must be implemented and tested before enabling it.
6. Later: migrate all existing records, verify counts and order status, use D1-backed API handlers, protect admin operations with securely stored secrets, test checkout end to end and back up old orders.
7. Only after successful staging tests merge to main and consider custom-domain migration.

IMPORTANT: Creating a database and a binding alone does NOT make the current Express server use D1. The current backend writes to local JSON files and requires refactoring for the Workers runtime.
