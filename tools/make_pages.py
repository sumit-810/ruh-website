"""Generate the thin HTML shells for every page.

Each page is identical apart from its <title>, description and data-page;
all content is rendered from site.config.js by assets/js/app.js. Run this
after changing the shared <head> (fonts, favicon, meta) — not needed for
content edits.

    python3 tools/make_pages.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = "Gentle Company"  # fallback only; JS sets the real title from site.config.js
HOME_TITLE = "Gentle Company — Body and skin care, gently made"
DESC = "Gentle Company makes body and skin care for India, beginning with Body Mist Nº 01."
NOINDEX = {"search", "checkout", "order", "notfound"}

PAGES = [
    ("index.html", "home", None, HOME_TITLE, DESC),
    ("shop.html", "shop", None, f"Shop all — {BRAND}", "Body Mist Nº 01 and the Gentle Company range: body, face and lip care."),
    ("product.html", "product", None, f"Body Mist Nº 01 — {BRAND}", "Body Mist Nº 01 — the first release from Gentle Company."),
    ("collection.html", "collection", None, f"Collection — {BRAND}", "Body, face and lip care from Gentle Company."),
    ("story.html", "story", None, f"Our Story — {BRAND}", "Gentle Company makes body and skin care for India."),
    ("journal.html", "journal", None, f"Journal — {BRAND}", "Notes on scent, skin and everyday care."),
    ("article.html", "article", None, f"Journal — {BRAND}", "Notes on scent, skin and everyday care."),
    ("contact.html", "contact", None, f"Contact — {BRAND}", "Get in touch with Gentle Company."),
    ("faq.html", "faq", None, f"FAQs — {BRAND}", "Answers about Gentle Company products and orders."),
    ("shipping-returns.html", "policy", "shipping", f"Shipping & Returns — {BRAND}", "Delivery and returns."),
    ("privacy.html", "policy", "privacy", f"Privacy Policy — {BRAND}", "How Gentle Company handles your data."),
    ("terms.html", "policy", "terms", f"Terms & Conditions — {BRAND}", "Terms of use."),
    ("search.html", "search", None, f"Search — {BRAND}", "Search the site."),
    ("checkout.html", "checkout", None, f"Checkout — {BRAND}", "Checkout."),
    ("order.html", "order", None, f"Order confirmed — {BRAND}", "Order confirmation."),
    ("404.html", "notfound", None, f"Page not found — {BRAND}", "Page not found."),
]

TEMPLATE = """<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f6f2ec">{robots}
<meta property="og:site_name" content="Gentle Company">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/cormorant-garamond.woff2" as="font" type="font/woff2" crossorigin>
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
    robots = '\n<meta name="robots" content="noindex">' if page in NOINDEX else ""
    html = TEMPLATE.format(title=title, desc=desc, page=page, robots=robots, policy=f' data-policy="{policy}"' if policy else "")
    (ROOT / filename).write_text(html, encoding="utf-8")
    print("wrote", filename)
