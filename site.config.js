/**
 * ============================================================================
 *  SITE CONFIGURATION — the single place to edit brand, product and content.
 * ============================================================================
 *
 *  Everything the website displays comes from this file (plus long-form
 *  journal articles in content/journal.js). No build step is needed: edit,
 *  save, refresh.
 *
 *  PROVISIONAL CONTENT
 *  Values marked  // PROVISIONAL  are placeholders created for the design.
 *  They are NOT business facts. Replace them before launch, then set
 *  `previewMode: false`. While previewMode is true the site shows a small
 *  "Preview" badge and labels placeholder sections, so nobody mistakes them
 *  for final information. See PRODUCT_CONFIGURATION.md for the full list.
 *
 *  Never add claims (longevity, dermatologist-tested, clinical results,
 *  certifications, reviews, order counts) unless you hold evidence for them.
 */

export const site = {
  /**
   * Preview mode shows the "Preview build" badge and labels placeholder
   * content. Set to false only when `node tools/launch_check.mjs` passes.
   * With previewMode false, anything still flagged provisional is hidden.
   */
  previewMode: true,

  // ---------------------------------------------------------------------------
  // Company — the business that sells the products (seller / data fiduciary).
  // Shown in the footer, product information, policies and structured data.
  // ---------------------------------------------------------------------------
  company: {
    name: 'GentleCare',
    legalName: null, // REQUIRED — registered name, e.g. 'GentleCare Private Limited'
    registeredAddress: null, // REQUIRED — full registered office address
    cin: null, // company identification number, if incorporated
    gstin: null, // GST registration number
    website: null, // e.g. 'https://www.your-domain.in' (used in policies and SEO)
  },

  // ---------------------------------------------------------------------------
  // Brand — Rūh is a brand of the company above.
  // ---------------------------------------------------------------------------
  brand: {
    name: 'Rūh', // working brand name
    trademarkCleared: false, // set true once the trademark search/filing is done
    wordmark: 'RŪH', // text fallback when the SVG logo can't be used
    logoSvg: 'assets/brand/ruh-wordmark.svg', // master logo file (also inlined in the header)
    endorsement: 'A GentleCare brand', // shown in the footer and on Our Story
    tagline: 'Scent and skin, in softer light.',
    description:
      'Rūh, a GentleCare brand, makes calm, sensory body and skin care rituals for everyday life — beginning with Body Mist Nº 01.',
    nameMeaning:
      'In Hindi and Urdu, rūh means soul. In the Indian attar tradition, a ruh is the purest distilled essence of a flower or root.',
    foundedYear: null, // e.g. 2026 — not shown until set
  },

  locale: {
    lang: 'en-IN',
    currency: 'INR',
  },

  // ---------------------------------------------------------------------------
  // Announcement bar (rotates). Keep each under ~60 characters.
  // ---------------------------------------------------------------------------
  announcements: [
    { text: 'Body Mist Nº 01 — our first ritual, now available', href: 'product.html?p=body-mist-no-01' },
    { text: 'Join the list for early access to what comes next', href: 'index.html#early-access' },
    { text: 'Secure checkout with UPI, cards and net banking', href: 'shipping-returns.html' },
  ],

  // ---------------------------------------------------------------------------
  // Customer care & social — null hides an item.
  // ---------------------------------------------------------------------------
  contact: {
    email: null, // REQUIRED — your business inbox, e.g. 'care@your-domain.in'
    phone: null, // e.g. '+91 98xxxxxxxx'
    whatsapp: null, // digits only, e.g. '9198xxxxxxxx' — shows a chat button when set
    hours: 'Monday to Saturday, 10am – 6pm IST', // PROVISIONAL — confirm
    responseTime: 'We reply within two working days.', // PROVISIONAL — confirm
    /** Grievance officer (Consumer Protection (E-Commerce) Rules) — REQUIRED. */
    grievanceOfficer: null, // { name: '…', designation: 'Grievance Officer', email: '…', phone: '…' }
  },

  social: {
    instagram: null, // e.g. 'https://instagram.com/ruh.gentlecare'
    handle: null, // e.g. '@ruh.gentlecare'
    pinterest: null,
    youtube: null,
    linkedin: null,
  },

  // ---------------------------------------------------------------------------
  // Commerce. Prices are in rupees, inclusive of all taxes (MRP).
  // ---------------------------------------------------------------------------
  commerce: {
    /**
     * checkout.provider:
     *  'razorpay' — live payments via Razorpay (UPI, cards, net banking, wallets).
     *               Needs the site deployed on Netlify with RAZORPAY_KEY_ID and
     *               RAZORPAY_KEY_SECRET set (see README → Payments). Until the
     *               payment server is reachable, preview builds fall back to a
     *               clearly labelled demo and never take money.
     *  'demo'     — always the labelled demo
     *  'shopify'  — send the bag to a Shopify cart permalink (set shopifyDomain + variant ids)
     */
    checkout: { provider: 'razorpay', shopifyDomain: null },
    /** Shows "Buy now" on product pages (skips the bag, goes to checkout). */
    buyNowEnabled: true,
    maxQuantityPerItem: 6,
    /** Short notes under Add to bag. `provisional` ones are hidden when previewMode is false. */
    serviceNotes: [
      { text: 'Secure payment: UPI, cards, net banking and wallets via Razorpay' },
      { text: 'Delivery timelines shown at checkout', provisional: true },
    ],
  },

  /**
   * Delivery charges (server-side and in the bag). All amounts in ₹.
   * flatRate null = free delivery on every order (launch check will remind you).
   */
  shipping: {
    flatRate: null, // PROVISIONAL — e.g. 79
    freeAbove: null, // PROVISIONAL — e.g. 999 (also drives the progress meter in the bag)
    cod: { enabled: false, fee: 0, maxOrderValue: 3000 }, // cash on delivery via Netlify Forms
    serviceableCountries: ['IN'],
  },

  /** Footer service band. `provisional` items are marked in preview and hidden in production. */
  servicePromises: [
    { icon: 'lock', title: 'Secure checkout', text: 'UPI, cards, net banking and wallets, processed by Razorpay.' },
    { icon: 'leaf', title: 'Full ingredient lists', text: 'Published for every product, in plain view.' },
    { icon: 'truck', title: 'Across India', text: 'Delivery partners and timelines to be confirmed.', provisional: true },
  ],

  // ---------------------------------------------------------------------------
  // Forms (newsletter, waitlist / notify me, contact, cash-on-delivery orders).
  // provider: 'netlify' | 'formspree' | 'custom' | 'none'
  //  - netlify:   Netlify Forms (submissions in the Netlify dashboard + email
  //               notifications). Form definitions live in netlify-forms.html.
  //               On a local preview nothing is sent and the visitor is told so.
  //  - formspree: POSTs JSON to `endpoint` (https://formspree.io/f/xxxx)
  //  - custom:    POSTs JSON to `endpoint` (Klaviyo/Brevo/Mailchimp proxy, your API…)
  //  - none:      validates, then says plainly that nothing was sent
  // A success message is shown ONLY when the endpoint responds with 2xx.
  // ---------------------------------------------------------------------------
  forms: {
    provider: 'netlify',
    endpoint: null,
    consentText: 'By joining, you agree to receive emails from Rūh by GentleCare. Unsubscribe anytime.',
  },

  analytics: { enabled: false }, // add your analytics snippet in assets/js/app.js when ready
};

// =============================================================================
//  CATALOGUE
// =============================================================================

/**
 * Collections group products and upcoming items. `status` controls display.
 * Images reference keys in assets/js/data/images.js (generated renders).
 */
export const collections = [
  {
    handle: 'body-care',
    name: 'Body Care',
    nav: 'Shop',
    status: 'live', // has at least one available product
    eyebrow: 'Body care',
    headline: 'Rituals for the body, one at a time.',
    intro:
      'Our body collection begins with Body Mist Nº 01. Washes, lotions, scrubs and butters are in development — each designed to sit alongside the first.', // PROVISIONAL
    image: 'up_group_body',
    imageAlt: 'Blank plaster forms of a pump bottle, tubes and jars standing in patterned window light — concept forms only',
  },
  {
    handle: 'face-care',
    name: 'Face Care',
    nav: 'Skincare',
    status: 'coming-soon',
    eyebrow: 'Skincare · Coming soon',
    headline: 'Face care, considered from the first step.',
    intro:
      'A small, complete face routine is in development: cleanse, tone, treat, moisturise, protect. Join the list to hear first when it is ready.', // PROVISIONAL
    image: 'up_group_face',
    imageAlt: 'Blank plaster and frosted-glass forms of skincare bottles and jars in jaali light — concept forms only',
  },
  {
    handle: 'lip-care',
    name: 'Lip Care',
    nav: 'Skincare',
    status: 'coming-soon',
    eyebrow: 'Lip care · Coming soon',
    headline: 'Small things, done beautifully.',
    intro: 'A lip balm and a lip treatment are in development. Join the list to be first to know.', // PROVISIONAL
    image: 'up_group_lip',
    imageAlt: 'Blank forms of a lip balm and a small tube on a rose-washed ledge — concept forms only',
  },
];

/**
 * Products available to buy. Add another object to launch a product —
 * it appears in the shop, search, its collection and gets its own page at
 * product.html?p=<handle>.
 */
export const products = [
  {
    handle: 'body-mist-no-01',
    collection: 'body-care',
    available: true,
    badge: 'New',
    name: 'Body Mist Nº 01',
    scentName: 'First Light', // PROVISIONAL
    scentDescriptor: 'A luminous veil of citrus, white florals and soft woods', // PROVISIONAL
    shortDescription:
      'A light veil of scent for the hours between — after the shower, on the way out, whenever the day asks for a pause.', // PROVISIONAL
    description: [
      // PROVISIONAL — rewrite with the perfumer's final brief
      'Body Mist Nº 01 is the first of our rituals: a body mist composed to feel bright at first touch and settle into something softer and warmer as it rests on skin.',
      'A body mist is lighter than a perfume by design, so it is made to be returned to — misted after the shower, again before you step out, and whenever you want the day to feel a little slower.',
    ],
    /** Sizes. The size selector only appears when more than one is listed. */
    variants: [
      {
        id: 'bm01-100',
        size: '100 ml',
        netQuantity: '100 ml',
        price: 1295, // PROVISIONAL — MRP in ₹ incl. all taxes
        compareAtPrice: null, // set only for a genuine, time-bound price reduction
        sku: null,
        shopifyVariantId: null,
        available: true,
      },
    ],
    family: 'Floral · Woody', // PROVISIONAL
    mood: 'Bright, calm, clean-skinned', // PROVISIONAL
    wearIt: ['After the shower', 'Before stepping out', 'A pause in the afternoon', 'Travel and gifting'], // PROVISIONAL
    notes: {
      // PROVISIONAL placeholders — replace with the perfumer's actual notes
      top: ['Bergamot', 'Pink grapefruit'],
      heart: ['Jasmine sambac', 'Orange blossom'],
      base: ['Sandalwood', 'Soft musk'],
    },
    benefits: [
      // PROVISIONAL — keep to what you can substantiate
      { title: 'A light, airy veil', text: 'Composed as a body mist — lighter than a perfume, made for re-application through the day.' },
      { title: 'Made to layer', text: 'Designed to sit alongside the body care that follows it.' },
      { title: 'An object to keep', text: 'A frosted bottle with a terracotta cap, made to be left out in the light.' },
    ],
    howToUse: [
      // PROVISIONAL — confirm with the formulator
      'Hold the bottle about 15–20 cm from the body.',
      'Mist over moisturised skin — the décolleté, arms and pulse points.',
      'Return to it through the day whenever you want to.',
      'For external use only. Avoid eyes and broken or irritated skin.',
    ],
    ingredients: null, // PROVISIONAL — paste the final INCI list (string) from the approved formulation
    ingredientsNote:
      'This ingredient list is subject to change. Always refer to the product label for the most accurate information.',
    productInformation: {
      // Legal Metrology declarations — all required before launch
      'Net quantity': '100 ml', // PROVISIONAL
      'MRP': 'Inclusive of all taxes',
      'Manufactured by': null,
      'Marketed by': null,
      'Country of origin': null,
      'Best before / expiry': null,
      'Customer care': null,
    },
    images: [
      { key: 'pack_front', alt: 'Body Mist Nº 01 concept bottle — frosted glass with a terracotta cap, front view' },
      { key: 'hero_portrait', alt: 'The concept bottle on a travertine block, lit by sunlight through a jaali screen' },
      { key: 'pack_angle', alt: 'The concept bottle at an angle on a warm backdrop' },
      { key: 'detail_label', alt: 'Close-up of the printed label in patterned light' },
      { key: 'pack_open', alt: 'The concept bottle with its cap removed, showing the spray actuator' },
      { key: 'mist', alt: 'Fine mist leaving the concept bottle in warm window light' },
    ],
    imageDisclaimer: 'Concept render — final packaging may differ.', // remove once real photography exists
    faqs: [
      {
        q: 'How long does the scent last on skin?',
        a: 'We will publish results from our own wear tests before making any claim. As a rule, body mists are lighter than perfumes — they typically contain around 1–5% fragrance oil, compared with roughly 15–20% for an eau de parfum — so Nº 01 is made to be re-applied through the day.',
      },
      {
        q: 'Can I use it on sensitive skin?',
        a: 'Safety and skin-compatibility information will be added here once testing is complete. Until then, please check the full ingredient list and patch test on a small area first. For external use only.', // PROVISIONAL
      },
      {
        q: 'Is it a perfume?',
        a: 'No. It is a body mist: lighter, airier and made for frequent use. Think of it as a veil rather than a statement.',
      },
      {
        q: 'Is it suitable for gifting?',
        a: 'Yes — gift packaging and gift-message options will be confirmed before launch.', // PROVISIONAL
      },
    ],
    pairsWith: ['body-lotion', 'body-butter', 'hand-body-cream'],
    /** Customer reviews. Only add real, verifiable reviews (or connect a reviews app). */
    reviews: [],
    provisional: {
      name: false,
      scent: true,
      price: true,
      description: true,
      notes: true,
      benefits: true,
      howToUse: true,
      ingredients: true,
      information: true,
    },
  },
];

/**
 * Upcoming products — visible and discoverable, never purchasable.
 * `eta` stays null until a date is real.
 */
export const upcoming = [
  // Body care
  { handle: 'body-wash', collection: 'body-care', name: 'Body Wash', format: 'Pump bottle', image: 'up_body_wash', intro: 'A daily wash for the body, designed to begin the ritual that Nº 01 completes.', eta: null },
  { handle: 'body-lotion', collection: 'body-care', name: 'Body Lotion', format: 'Tube', image: 'up_body_lotion', intro: 'An everyday lotion to wear beneath your mist.', eta: null },
  { handle: 'body-scrub', collection: 'body-care', name: 'Body Scrub', format: 'Jar', image: 'up_body_scrub', intro: 'A weekly ritual for smoother-feeling skin.', eta: null },
  { handle: 'body-butter', collection: 'body-care', name: 'Body Butter', format: 'Jar', image: 'up_body_butter', intro: 'A richer layer for evenings and drier days.', eta: null },
  { handle: 'hand-body-cream', collection: 'body-care', name: 'Hand & Body Cream', format: 'Tube', image: 'up_hand_cream', intro: 'A small cream for bags, desks and bedside tables.', eta: null },
  // Face care
  { handle: 'face-cleanser', collection: 'face-care', name: 'Face Cleanser', format: 'Pump bottle', image: 'up_cleanser', intro: 'The first step of a calm face routine.', eta: null, theme: 'Cleansing' },
  { handle: 'toner', collection: 'face-care', name: 'Toner', format: 'Bottle', image: 'up_toner', intro: 'A light second step after cleansing.', eta: null },
  { handle: 'face-serum', collection: 'face-care', name: 'Face Serum', format: 'Dropper', image: 'up_serum', intro: 'A focused treatment step — details when the formula is final.', eta: null },
  { handle: 'moisturiser', collection: 'face-care', name: 'Moisturiser', format: 'Jar', image: 'up_moisturiser', intro: 'A daily moisturiser to close the routine.', eta: null, theme: 'Hydration' },
  { handle: 'sunscreen', collection: 'face-care', name: 'Sunscreen', format: 'Tube', image: 'up_sunscreen', intro: 'Everyday sun protection — SPF and PA ratings will be published only once tested.', eta: null, theme: 'Sun protection' },
  { handle: 'face-masks', collection: 'face-care', name: 'Face Masks', format: 'Jar', image: 'up_mask', intro: 'An occasional, slower ritual for the face.', eta: null },
  // Lip care
  { handle: 'lip-balm', collection: 'lip-care', name: 'Lip Balm', format: 'Stick', image: 'up_lip_balm', intro: 'A daily balm for the bag and the bedside.', eta: null },
  { handle: 'lip-treatment', collection: 'lip-care', name: 'Lip Treatment', format: 'Tube', image: 'up_lip_treatment', intro: 'A more nourishing treatment for lips.', eta: null },
];

// =============================================================================
//  NAVIGATION
// =============================================================================

export const navigation = {
  primary: [
    {
      label: 'Shop',
      href: 'shop.html',
      mega: {
        columns: [
          { title: 'Body care', collection: 'body-care', items: ['body-mist-no-01', 'body-wash', 'body-lotion', 'body-scrub', 'body-butter', 'hand-body-cream'] },
        ],
        feature: { product: 'body-mist-no-01', image: 'pack_angle' },
        tile: { label: 'Explore what comes next', href: 'collection.html?c=body-care', image: 'up_group_body' },
      },
    },
    {
      label: 'Skincare',
      href: 'collection.html?c=face-care',
      mega: {
        columns: [
          { title: 'Face care', collection: 'face-care', items: ['face-cleanser', 'toner', 'face-serum', 'moisturiser', 'sunscreen', 'face-masks'] },
          { title: 'Lip care', collection: 'lip-care', items: ['lip-balm', 'lip-treatment'] },
        ],
        tile: { label: 'Skincare is coming — join the list', href: 'collection.html?c=face-care#waitlist', image: 'up_group_face' },
      },
    },
    { label: 'Our Story', href: 'story.html' },
    { label: 'Journal', href: 'journal.html' },
    { label: 'Contact', href: 'contact.html' },
  ],
  footer: [
    {
      title: 'Shop',
      links: [
        { label: 'Body Mist Nº 01', href: 'product.html?p=body-mist-no-01' },
        { label: 'Shop all', href: 'shop.html' },
        { label: 'Body care', href: 'collection.html?c=body-care' },
        { label: 'Face care', href: 'collection.html?c=face-care' },
        { label: 'Lip care', href: 'collection.html?c=lip-care' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Our story', href: 'story.html' },
        { label: 'Journal', href: 'journal.html' },
        { label: 'Contact', href: 'contact.html' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'FAQs', href: 'faq.html' },
        { label: 'Shipping & returns', href: 'shipping-returns.html' },
        { label: 'Account', href: 'account.html' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy policy', href: 'privacy.html' },
        { label: 'Terms & conditions', href: 'terms.html' },
      ],
    },
  ],
};

// =============================================================================
//  PAGE CONTENT
// =============================================================================

export const content = {
  home: {
    hero: {
      eyebrow: 'Body Mist Nº 01 · First Light',
      title: 'A softer light, *worn on skin.*', // *…* renders in italic
      text: 'Our first ritual is a body mist — a light veil of scent for after the shower, on the way out, and whenever the day asks for a pause.',
      primary: { label: 'Shop Body Mist', href: 'product.html?p=body-mist-no-01' },
      secondary: { label: 'Discover our world', href: 'story.html' },
      image: 'hero_wide',
      imageMobile: 'hero_portrait',
      imageAlt: 'A frosted body mist bottle with a terracotta cap on a travertine block, in warm sunlight falling through a carved jaali screen',
    },
    intro: {
      eyebrow: 'The house',
      // [img:key] inserts a small inline image pill
      statement:
        'We make body and skin care for the [img:detail_label] unhurried moments — composed with restraint, lit by [img:wall_light] Indian light, and meant to be returned to.',
      text: 'One product at a time, each one complete. Full ingredient lists in plain view. One honest price.', // PROVISIONAL commitments
      link: { label: 'Read our story', href: 'story.html' },
    },
    featured: {
      eyebrow: 'The first ritual',
      title: 'Body Mist Nº 01',
    },
    scent: {
      eyebrow: 'The composition',
      title: 'How *First Light* unfolds',
      text: 'Every fragrance moves through three stages. The first impression is bright and brief; the heart is the character; the trail is what stays closest to skin.',
      image: 'mist',
      imageAlt: 'A fine mist leaving the bottle in warm, patterned light',
    },
    ritual: {
      eyebrow: 'The ritual',
      title: 'Four moments, *one bottle.*',
      steps: [
        // PROVISIONAL usage guidance — confirm with the formulator
        { title: 'After the shower', text: 'Begin on clean, moisturised skin, when the day is still quiet.', image: 'ritual_ledge' },
        { title: 'At the pulse points', text: 'Mist over the décolleté, wrists and the inside of the elbows.', image: 'detail_cap' },
        { title: 'Layered', text: 'Wear it over body care that follows the same calm — our lotions are on their way.', image: 'up_body_lotion' },
        { title: 'Returned to', text: 'A body mist is light by design. Keep it close, and return to it through the day.', image: 'niche' },
      ],
    },
    future: {
      eyebrow: 'What comes next',
      title: 'A complete ritual, *in the making.*',
      text: 'Body Mist Nº 01 is the beginning. These are the categories we are developing — none are available yet, and we will only share details once they are final.',
      tiles: [
        { label: 'Body care', note: '5 in development', href: 'collection.html?c=body-care', image: 'up_group_body' },
        { label: 'Face care', note: '6 in development', href: 'collection.html?c=face-care', image: 'up_group_face' },
        { label: 'Hydration', note: 'Moisturiser', href: 'collection.html?c=face-care#moisturiser', image: 'up_moisturiser' },
        { label: 'Cleansing', note: 'Cleanser & toner', href: 'collection.html?c=face-care#face-cleanser', image: 'up_cleanser' },
        { label: 'Sun protection', note: 'Sunscreen', href: 'collection.html?c=face-care#sunscreen', image: 'up_sunscreen' },
        { label: 'Lip care', note: 'Balm & treatment', href: 'collection.html?c=lip-care', image: 'up_group_lip' },
      ],
    },
    philosophy: {
      eyebrow: 'What we believe',
      title: 'Quiet luxury, *honestly made.*',
      image: 'niche',
      imageAlt: 'The bottle standing in an arched limewash niche, lit through a jaali screen',
      pillars: [
        // PROVISIONAL — confirm each commitment before launch
        { title: 'Ritual over routine', text: 'Small, sensory moments rather than ten-step regimes.' },
        { title: 'Fewer, better things', text: 'We launch one product at a time, and only when it is ready.' },
        { title: 'Candour', text: 'Full ingredient lists, plain-language facts, and no claims we cannot prove.' },
        { title: 'One honest price', text: 'No inflated MRPs and no permanent "sales" — the price is the price.' },
      ],
    },
    earlyAccess: {
      eyebrow: 'Early access',
      title: 'Be the first to discover *what comes next.*',
      text: 'Join the list for launch news, early access to new rituals, and the occasional letter from the studio.',
      interests: ['Body care', 'Face care', 'Lip care'],
      image: 'wall_light',
    },
    social: {
      eyebrow: 'In the light',
      title: 'Seen in softer light',
      images: ['hero_portrait', 'detail_label', 'ritual_ledge', 'pack_angle', 'niche', 'up_group_lip'],
    },
  },

  story: {
    hero: {
      eyebrow: 'Our story',
      title: 'Care, as a *quiet ritual.*',
      text: 'Rūh began with a simple idea: that the most ordinary moments of care — after a shower, before stepping out — deserve beauty, calm and honesty.', // PROVISIONAL
      image: 'niche',
    },
    chapters: [
      {
        eyebrow: 'The name',
        title: 'Rūh — *the essence.*',
        text: [
          'In Hindi and Urdu, rūh means soul. In the attar workshops of Kannauj, a ruh is the purest distillation of a flower or root — ruh gulab, ruh khus.',
          'We chose it because we want every product to feel like the essence of a moment, not an addition to a routine.', // PROVISIONAL
        ],
        image: 'detail_label',
      },
      {
        eyebrow: 'Light as a material',
        title: 'Made in *Indian light.*',
        text: [
          'Our world is drawn from the architecture of light: the carved jaali screens of old havelis and stepwells, which turn hard sun into soft, patterned shade.',
          'It is a reminder of what we want our products to do — take the edge off the day, and leave something beautiful in its place.',
        ],
        image: 'wall_light',
      },
      {
        eyebrow: 'How we work',
        title: 'Fewer, *better things.*',
        text: [
          'We are launching with a single body mist, and growing slowly into body, face and lip care. Each product will arrive with its full ingredient list, clear instructions and no claims we cannot stand behind.', // PROVISIONAL
        ],
        image: 'up_group_body',
      },
    ],
    company: {
      eyebrow: 'The company',
      title: 'Made by *GentleCare.*',
      text: [
        'Rūh is a brand of GentleCare. The name is the standard we hold ourselves to: care that is gentle on skin, honest in what it says, and considered in how it is made.', // PROVISIONAL — confirm company wording
        'GentleCare will grow Rūh one ritual at a time — body first, then face and lip — with every formula, ingredient list and price published in plain view.', // PROVISIONAL
      ],
      image: 'pack_angle',
    },
    founderNote: {
      eyebrow: "A note from the founders",
      text: null, // PROVISIONAL — add the founders' own words here; hidden until set (a placeholder shows in preview mode)
      signature: null,
    },
  },

  /** Site-wide FAQs (faq.html). Product FAQs live on the product. */
  faqs: [
    {
      group: 'Our products',
      items: [
        { q: 'What is available right now?', a: 'Body Mist Nº 01 is our first product. Body, face and lip care are in development — you can join the list on each category page to hear first.' },
        { q: 'Where are your products made?', a: 'Manufacturing details will be published here and on each product page before launch.' }, // PROVISIONAL
        { q: 'Are your products tested on animals?', a: 'We will only state our testing and certification status once it is formally verified.' }, // PROVISIONAL
        { q: 'Where can I find the ingredients?', a: 'Every product page includes the full ingredient list (INCI) from the final formulation.' },
      ],
    },
    {
      group: 'Orders & delivery',
      items: [
        { q: 'Where do you deliver?', a: 'Across India, to serviceable PIN codes. Dispatch and delivery times are on our Shipping & Returns page.' },
        { q: 'Which payment methods do you accept?', a: 'UPI, credit and debit cards, net banking and wallets, processed securely by Razorpay. We never see or store your card or bank details.' },
        { q: 'Can I cancel my order?', a: 'Yes — any time before it is dispatched. Write to us with your order reference and we refund the full amount to your original payment method.' },
        { q: 'Will someone call me to confirm payment?', a: 'We will never call or message you asking for a payment, OTP or card details outside our website. If this happens, please do not share any information and contact us.' },
      ],
    },
    {
      group: 'Returns',
      items: [
        { q: 'Can I return a product?', a: 'Because these are personal-care products, we accept returns for items that arrive damaged, leaking, defective, incorrect or past their best-before date. Report the problem with photos within 48 hours of delivery and we will replace or refund it. Full details are on the Shipping & Returns page.' }, // PROVISIONAL — confirm window and change-of-mind policy
        { q: 'I have a complaint. Who do I contact?', a: 'Write to customer care first. If you are not satisfied, our Grievance Officer acknowledges complaints within 48 hours and aims to resolve them within one month — contact details are on the Contact page.' },
      ],
    },
  ],

  // Policy pages (shipping, privacy, terms) live in content/policies.js.
};
