# GLOBABOX general-store staging build trigger

Triggered on 2026-11-13 after selecting `rebuild/globabox-full-20261113` as the Git production branch for the **globabox-staging** Worker in Cloudflare.

Purpose: request Cloudflare Workers Builds to run the existing build and deploy commands for `globabox-staging`, producing a new preview experience on `test.globabox.com`. This commit changes only this documentation and does **not** modify application code, DNS, the main branch, or customer order data.

Required post-deploy checks: build logs, selected Worker name and D1 binding, screenshot verification, catalog and checkout checks. Production `globabox.com` remains unchanged pending validated test deployment and production backup.
