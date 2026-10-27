#!/usr/bin/env python3
"""Import REVIEWED Atwache products from a JSON file into the GLOBABOX server.

This does not scrape supplier pages. First prepare data you have permission to reuse.
All imports must remain drafts and be reviewed before publishing.
"""
import argparse
import json
import os
import sys
import urllib.request

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("json_file", help="JSON file containing a products array")
    parser.add_argument("--send", action="store_true", help="Send draft products (default: validation only)")
    args = parser.parse_args()
    with open(args.json_file, encoding="utf-8") as f:
        payload = json.load(f)
    products = payload.get("products")
    if not isinstance(products, list) or not (1 <= len(products) <= 50):
        raise SystemExit("Expected 1-50 entries in 'products'")
    for product in products:
        assert product.get("id") and product.get("sourceUrl") and product.get("name", {}).get("fr")
        assert isinstance(product.get("price"), (int, float)) and product["price"] > 0
        assert product["sourceUrl"].startswith("https://atwache.ma/")
    if not args.send:
        print(f"Validated {len(products)} products; dry run only (no changes sent)")
        return
    url = os.environ.get("GLOBABOX_API_URL", "").rstrip("/")
    key = os.environ.get("GLOBABOX_ADMIN_API_KEY", "")
    if not url.startswith("https://") or len(key) < 32:
        raise SystemExit("Set HTTPS GLOBABOX_API_URL and GLOBABOX_ADMIN_API_KEY (>=32 chars) privately")
    req = urllib.request.Request(
        url + "/api/import-products",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-admin-api-key": key},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as response:
        print(response.read().decode("utf-8"))

if __name__ == "__main__":
    main()
