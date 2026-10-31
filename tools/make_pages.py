"""Generate the thin HTML shells for every page.

Each page is identical apart from its <title>, description and data-page;
all content is rendered from site.config.js by assets/js/app.js. Run this
after changing the shared <head> (fonts, favicon, meta) — not needed for
content edits.

    python3 tools/make_pages.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = "Rūh"  # fallback only; JS sets the real title from site.config.js
HOME_TITLE = "Rūh by GentleCare — Scent and skin, in softer light"

PAGES = [
    ("index.html", "home", None, HOME_TITLE, "Rūh, a GentleCare brand, makes calm, sensory body and skin care rituals — beginning with Body Mist Nº 01."),
    ("shop.html", "shop", None, f"Shop all — {BRAND}", "Shop Body Mist Nº 01 and discover the body, face and lip care in development."),
    ("product.html", "product", None, f"Body Mist Nº 01 — {BRAND}", "A light veil of scent for the hours between."),
    ("collection.html", "collection", None, f"Collection — {BRAND}", "Body, face and lip care."),
    ("story.html", "story", None, f"Our story — {BRAND}", "Care, as a quiet ritual."),
    ("journal.html", "journal", None, f"Journal — {BRAND}", "Notes on scent, skin and ritual."),
    ("article.html", "article", None, f"Journal — {BRAND}", "Notes on scent, skin and ritual."),
    ("contact.html", "contact", None, f"Contact — {BRAND}", "Get in touch."),
    ("faq.html", "faq", None, f"FAQs — {BRAND}", "Answers about our products, orders, delivery and returns."),
    ("shipping-returns.html", "policy", "shipping", f"Shipping & Returns — {BRAND}", "Delivery and returns."),
    ("privacy.html", "policy", "privacy", f"Privacy Policy — {BRAND}", "How we handle your data."),
    ("terms.html", "policy", "terms", f"Terms & Conditions — {BRAND}", "Terms of use."),
    ("search.html", "search", None, f"Search — {BRAND}", "Search the site."),
    ("checkout.html", "checkout", None, f"Checkout — {BRAND}", "Checkout."),
    ("order.html", "order", None, f"Order confirmed — {BRAND}", "Order confirmation."),
    ("account.html", "account", None, f"Account — {BRAND}", "Your account."),
    ("404.html", "notfound", None, f"Page not found — {BRAND}", "Page not found."),
]

TEMPLATE = """<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f6f1ea">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/og-image.jpg">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/bodoni-moda-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/jost-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/main.css">
<script type="module" src="assets/js/app.js"></script>
</head>
<body data-page="{page}"{policy}>
<a class="skip-link" href="#main">Skip to content</a>
<div id="site-header"></div>
<main id="main" tabindex="-1"></main>
<div id="site-footer"></div>
<noscript><p style="padding:24px;font-family:sans-serif">This site needs JavaScript enabled to display its content.</p></noscript>
</body>
</html>
"""

for filename, page, policy, title, desc in PAGES:
    html = TEMPLATE.format(title=title, desc=desc, page=page, policy=f' data-policy="{policy}"' if policy else "")
    (ROOT / filename).write_text(html, encoding="utf-8")
    print("wrote", filename)
