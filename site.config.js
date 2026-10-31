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
  /** Shows the preview badge + "placeholder" labels. Set false at launch. */
  previewMode: true,

  // ---------------------------------------------------------------------------
  // Brand
  // ---------------------------------------------------------------------------
  brand: {
    name: 'Rūh', // PROVISIONAL working name — trademark clearance required
    wordmark: 'RŪH', // text wordmark used in header/footer when no logo file is set
    logoSrc: null, // e.g. 'assets/img/logo.svg' to use a supplied logo instead
    tagline: 'Scent and skin, in softer light.', // PROVISIONAL
    description:
      'Rūh is a body and skin care house making calm, sensory rituals for everyday life — beginning with Body Mist Nº 01.', // PROVISIONAL
    nameMeaning:
      'In Hindi and Urdu, rūh means soul. In the Indian attar tradition, a ruh is the purest distilled essence of a flower or root.',
    foundedYear: null, // e.g. 2026 — not shown until set
    legalName: null, // e.g. 'Example Private Limited' — used in footer & product information
  },

  locale: {
    lang: 'en-IN',
    currency: 'INR',
  },

  // ---------------------------------------------------------------------------
  // Announcement bar (rotates). Keep each under ~60 characters.
  // ---------------------------------------------------------------------------
  announcements: [
    { text: 'Body Mist Nº 01 — our first ritual, now available', href: 'product.html?p=body-mist-no-01' }, // PROVISIONAL
    { text: 'Join the list for early access to what comes next', href: 'index.html#early-access' },
    { text: 'Delivery across India — details at checkout', href: 'shipping-returns.html' }, // PROVISIONAL
  ],

  // ---------------------------------------------------------------------------
  // Contact & social — null hides an item.
  // ---------------------------------------------------------------------------
  contact: {
    email: 'hello@example.com', // PROVISIONAL — replace with real inbox
    phone: null, // e.g. '+91 00000 00000'
    whatsapp: null, // e.g. '910000000000' (digits only)
    hours: 'Monday to Saturday, 10am – 6pm IST', // PROVISIONAL
    responseTime: 'We aim to reply within two working days.', // PROVISIONAL
    address: null, // registered / grievance address — required before launch
    grievanceOfficer: null, // { name, email } — required for Indian e-commerce
  },

  social: {
    instagram: null, // e.g. 'https://instagram.com/yourhandle'
    handle: null, // e.g. '@yourhandle' — shown in the social section if set
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
     *  'demo'    — clearly labelled demo page, no payment taken (current)
     *  'shopify' — send the bag to a Shopify cart permalink (set shopifyDomain + variant ids)
     *  'custom'  — POST the bag to `checkout.url` (your own backend / gateway)
     */
    checkout: { provider: 'demo', url: null, shopifyDomain: null },
    /** Shows "Buy now" on product pages. Only enable with a real checkout. */
    buyNowEnabled: false,
    maxQuantityPerItem: 6,
    /** Free-shipping threshold in ₹, or null to hide the progress meter. */
    freeShippingThreshold: null, // PROVISIONAL — e.g. 999
    /** Short promises shown under the add-to-bag button. Empty array hides them. */
    serviceNotes: [
      'Delivery timelines confirmed at checkout', // PROVISIONAL
      'Secure payments via UPI, cards and net banking once checkout is connected', // PROVISIONAL
    ],
  },

  /** Footer service band. `provisional: true` items are marked in preview mode. */
  servicePromises: [
    { icon: 'gift', title: 'Gift-ready', text: 'Packaging details to be confirmed.', provisional: true },
    { icon: 'truck', title: 'Across India', text: 'Delivery partners and timelines to be confirmed.', provisional: true },
    { icon: 'leaf', title: 'Full ingredient lists', text: 'Published for every product, in plain view.', provisional: true },
  ],

  // ---------------------------------------------------------------------------
  // Forms (newsletter, waitlist, contact).
  // provider: 'none' | 'formspree' | 'netlify' | 'custom'
  //  - none:      validates, then tells the visitor plainly that nothing was sent
  //  - formspree: POSTs JSON to `endpoint` (https://formspree.io/f/xxxx)
  //  - netlify:   POSTs url-encoded data to '/' with form-name (Netlify Forms)
  //  - custom:    POSTs JSON to `endpoint` (Klaviyo/Mailchimp proxy, your API…)
  // A success message is shown ONLY when the endpoint responds with 2xx.
  // ---------------------------------------------------------------------------
  forms: {
    provider: 'none',
    endpoint: null,
    consentText:
      'By joining, you agree to receive emails from us. Unsubscribe anytime. See our privacy policy.',
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
        { q: 'Where do you deliver?', a: 'Delivery coverage, partners and timelines will be confirmed before launch and shown at checkout.' }, // PROVISIONAL
        { q: 'Which payment methods will you accept?', a: 'We plan to accept UPI, cards and net banking through a secure payment gateway. Payment options will be confirmed at launch.' }, // PROVISIONAL
        { q: 'Will someone call me to confirm payment?', a: 'We will never call or message you asking for a payment, OTP or card details outside our website. If this happens, please do not share any information and contact us.' },
      ],
    },
    {
      group: 'Returns',
      items: [
        { q: 'What is your returns policy?', a: 'Our returns and refunds policy is being finalised. It will be published on the Shipping & Returns page before launch.' }, // PROVISIONAL
      ],
    },
  ],

  /** Legal/policy pages: rendered from these outlines until real text is supplied. */
  policies: {
    shipping: {
      title: 'Shipping & Returns',
      intro: 'This page will set out exactly how and when your order reaches you, and what happens if something is not right. The details below are placeholders to be completed before launch.',
      sections: [
        { h: 'Delivery areas', p: '[To be confirmed — e.g. all serviceable PIN codes in India.]' },
        { h: 'Dispatch & delivery times', p: '[To be confirmed — dispatch time in working days, and typical delivery windows by region.]' },
        { h: 'Shipping charges', p: '[To be confirmed — flat rate and/or free-shipping threshold.]' },
        { h: 'Cash on delivery', p: '[To be confirmed — whether COD is offered and any charges.]' },
        { h: 'Returns & refunds', p: '[To be confirmed — eligibility (e.g. damaged or incorrect items), time window, process and refund timelines.]' },
        { h: 'Damaged or missing items', p: '[To be confirmed — how to report, evidence required, resolution time.]' },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      intro: 'This policy will explain what personal data we collect, why, and how you can control it. It must be completed with legal advice (including India’s Digital Personal Data Protection Act, 2023) before launch.',
      sections: [
        { h: 'Who we are', p: '[Legal entity name, registered address and contact for privacy requests.]' },
        { h: 'What we collect', p: '[e.g. contact details, delivery address, order history, device and analytics data.]' },
        { h: 'How we use it', p: '[e.g. fulfilling orders, customer support, marketing with consent, fraud prevention.]' },
        { h: 'Sharing', p: '[e.g. payment gateway, delivery partners, email provider — list processors.]' },
        { h: 'Your rights', p: '[Access, correction, erasure, withdrawal of consent, grievance redressal.]' },
        { h: 'Cookies & local storage', p: 'This website stores your bag and recently viewed items in your browser’s local storage so they persist between visits. [Add analytics/cookie details if used.]' },
        { h: 'Grievance officer', p: '[Name, email and address of the grievance officer.]' },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      intro: 'These terms will govern the use of this website and purchases made through it. They must be completed with legal advice before launch.',
      sections: [
        { h: 'About these terms', p: '[Entity name, applicability, acceptance.]' },
        { h: 'Products & pricing', p: 'Prices are shown in Indian rupees and are inclusive of all taxes (MRP). [Add errors, availability and quantity limits clauses.]' },
        { h: 'Orders & payment', p: '[Order acceptance, payment methods, cancellations.]' },
        { h: 'Shipping & returns', p: 'See our Shipping & Returns page.' },
        { h: 'Intellectual property', p: '[Ownership of content, imagery and trademarks.]' },
        { h: 'Liability', p: '[Limitation of liability, product use and safety.]' },
        { h: 'Governing law', p: '[Jurisdiction and dispute resolution.]' },
      ],
    },
  },
};
