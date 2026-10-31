/**
 * ============================================================================
 *  GENTLE COMPANY — SITE CONFIGURATION
 *  Every brand, product, navigation and page value the website shows lives
 *  here. Edit, save, refresh. See PRODUCT_CONFIGURATION.md for a guide.
 *
 *  THE RULE: anything set to null is simply not shown. The website never
 *  displays a placeholder, a "to be confirmed" note or an example value.
 *  Fill a field only with confirmed information, and it appears.
 *  `node tools/launch_check.mjs` lists everything still missing.
 * ============================================================================
 */

export const site = {
  // ---------------------------------------------------------------------------
  // The business. legalName/registeredAddress/gstin appear in the footer,
  // policies, product information and structured data once set.
  // ---------------------------------------------------------------------------
  company: {
    name: 'Gentle Company',
    legalName: null, // registered legal name, e.g. 'Gentle Company Private Limited'
    registeredAddress: null, // full registered office address
    cin: null,
    gstin: null,
    website: null, // e.g. 'https://www.gentlecompany.in' — enables sitemap.xml and canonical links
  },

  brand: {
    name: 'Gentle Company',
    wordmark: 'GENTLE COMPANY',
    tagline: 'Body and skin care, gently made.',
    description: 'Gentle Company makes body and skin care for India, beginning with Body Mist Nº 01.',
    logoSvg: 'assets/brand/gentle-company-wordmark.svg',
    trademarkCleared: false, // internal only (launch check)
  },

  locale: { lang: 'en-IN', currency: 'INR' },

  /** Announcement bar. Keep each under ~60 characters. Empty array hides it. */
  announcements: [
    { text: 'Body Mist Nº 01 — launching soon. Get first access', href: 'product.html?p=body-mist-no-01#notify' },
  ],

  // ---------------------------------------------------------------------------
  // Customer care. null hides an item.
  // ---------------------------------------------------------------------------
  contact: {
    email: null, // business inbox, e.g. 'care@gentlecompany.in'
    phone: null,
    whatsapp: null, // digits only, e.g. '9198xxxxxxxx' — adds a chat button
    hours: null, // e.g. 'Monday to Saturday, 10am – 6pm IST'
    grievanceOfficer: null, // { name, designation, email, phone } — required before selling
  },

  social: { instagram: null, youtube: null, pinterest: null, linkedin: null },

  // ---------------------------------------------------------------------------
  // Commerce. The shop opens when `enabled` is true AND a product is marked
  // available with a confirmed price. Until then the website shows
  // "Notify me" instead of a price or a bag — never a fake checkout.
  // Payments: Razorpay via /api/create-order + /api/verify-payment (Vercel),
  // with RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET set in Vercel. See README.
  // ---------------------------------------------------------------------------
  commerce: {
    enabled: false,
    checkout: { provider: 'razorpay' },
    buyNowEnabled: true,
    maxQuantityPerItem: 6,
    serviceNotes: [], // short lines under the purchase button, e.g. { text: 'Free delivery above ₹999' }
  },

  /** Delivery charges, used by the bag, checkout and payment server. ₹, null = not set. */
  shipping: {
    flatRate: null,
    freeAbove: null,
    cod: { enabled: false, fee: 0, maxOrderValue: 3000 },
    serviceableCountries: ['IN'],
  },

  /** Footer service band. Only confirmed promises. */
  servicePromises: [],

  // ---------------------------------------------------------------------------
  // Forms: early access, notify me and contact. provider 'api' posts to this
  // site's own /api/subscribe and /api/contact (Vercel functions → Brevo).
  // A success message appears ONLY when the server confirms the email was
  // stored or sent. See README → Email & forms.
  // ---------------------------------------------------------------------------
  forms: {
    provider: 'api',
    endpoint: null, // only for provider 'custom' or 'formspree'
    consentText: 'By signing up you agree to receive emails from Gentle Company. Unsubscribe anytime.',
  },

  analytics: { enabled: false },
};

// =============================================================================
//  CATALOGUE
// =============================================================================

/** Lines (collections). `tone` sets the card background colour family. */
export const collections = [
  {
    handle: 'body-care',
    name: 'Body Care',
    short: 'Body',
    tone: 'apricot',
    headline: 'Body care',
    intro: 'Mist, wash, lotion, scrub, butter and cream — one range for the body.',
    image: 'family_body',
    imageAlt: 'The Gentle Company body care range in apricot packaging: body mist, wash, lotion, scrub, butter and hand cream',
  },
  {
    handle: 'face-care',
    name: 'Face Care',
    short: 'Face',
    tone: 'milk',
    headline: 'Face care',
    intro: 'Cleanse, tone, treat, moisturise, protect.',
    image: 'family_face',
    imageAlt: 'The Gentle Company face care range in milk-white packaging: cleanser, toner, serum, moisturiser, sunscreen and mask',
  },
  {
    handle: 'lip-care',
    name: 'Lip Care',
    short: 'Lip',
    tone: 'rose',
    headline: 'Lip care',
    intro: 'A balm and a treatment, in rose.',
    image: 'family_lip',
    imageAlt: 'Gentle Company lip balm and lip treatment in rose packaging',
  },
];

/**
 * Products with their own product page. A product is purchasable only when
 * site.commerce.enabled is true, `available` is true and its variant has a
 * confirmed price. Every content field below is optional: null hides it.
 */
export const products = [
  {
    handle: 'body-mist-no-01',
    collection: 'body-care',
    category: 'Body Mist',
    name: 'Body Mist Nº 01',
    available: false, // set true at launch (with a price below)
    badge: 'First release',
    statusLabel: 'Launching soon',
    tagline: 'The first from Gentle Company.',
    shortDescription: 'A light, all-over mist for the body — the first release from Gentle Company.',
    /** Sizes. Fill size and price (₹ MRP incl. taxes) only when final. */
    variants: [{ id: 'bm01', size: null, price: null, compareAtPrice: null, sku: null, available: false }],
    /** Scent profile — shown only once the perfumer's brief is final. */
    scent: {
      name: null, // e.g. 'First Light'
      family: null, // e.g. 'Floral · Woody'
      mood: null, // three words, e.g. 'Bright · Soft · Warm'
      notes: null, // { top: ['…'], heart: ['…'], base: ['…'] }
    },
    highlights: null, // [{ title, text }] — only statements you can substantiate
    description: null, // ['paragraph', …] — longer copy for the Details section
    howToUse: null, // ['step', …] — as printed on the label
    ingredients: null, // full INCI list (string) from the approved formulation
    /** Legal Metrology declarations — rows with null are hidden. */
    productInformation: {
      'Net quantity': null,
      'MRP': null,
      'Manufactured by': null,
      'Marketed by': null,
      'Country of origin': null,
      'Best before / expiry': null,
      'Customer care': null,
    },
    images: [
      { key: 'pack_front', alt: 'Gentle Company Body Mist Nº 01: a clear glass bottle of apricot-coloured mist with a cocoa cap and a cream label' },
      { key: 'hero_portrait', alt: 'Body Mist Nº 01 on a travertine block against apricot plaster, in leaf-dappled sunlight' },
      { key: 'pack_angle', alt: 'Body Mist Nº 01 seen at an angle, showing the depth of the glass' },
      { key: 'detail_label', alt: 'Close-up of the label: GENTLE COMPANY, Body Mist, Nº 01' },
      { key: 'pack_open', alt: 'Body Mist Nº 01 with its cap off, showing the spray' },
      { key: 'vanity', alt: 'Body Mist Nº 01 on a ceramic tray on a marble vanity, beside a folded towel' },
      { key: 'mist', alt: 'A fine mist leaving the bottle in warm backlight' },
    ],
    /** Short customer-facing note on imagery (shown in Details). */
    packagingNote: 'Images show Gentle Company’s packaging design ahead of launch.',
    /** Moments — lifestyle images with one-line captions (no product claims). */
    moments: [
      { title: 'At the vanity', image: 'vanity' },
      { title: 'A fine mist', image: 'mist' },
      { title: 'The label', image: 'detail_label' },
      { title: 'Ready to wear', image: 'pack_open' },
    ],
    faqs: [
      {
        q: 'What is a body mist?',
        a: 'A body mist is a light fragrance made to be sprayed all over the body. Body mists typically contain less fragrance oil than a perfume, so they feel lighter and are made to be reapplied through the day.',
      },
      {
        q: 'When can I buy it?',
        a: 'Body Mist Nº 01 is launching soon. Leave your email on this page and we will write to you as soon as it is available.',
      },
    ],
    pairsWith: ['body-lotion', 'body-butter', 'hand-body-cream'],
    reviews: [], // only genuine, verifiable reviews
  },
];

/**
 * The rest of the range — shown with a status label, never purchasable.
 * `status`: 'coming-soon' | 'in-development'. `eta` stays null until real.
 */
export const upcoming = [
  // Body care
  { handle: 'body-wash', collection: 'body-care', name: 'Body Wash', format: 'Pump bottle', image: 'up_body_wash', line: 'For the shower.', status: 'in-development', eta: null },
  { handle: 'body-lotion', collection: 'body-care', name: 'Body Lotion', format: 'Tube', image: 'up_body_lotion', line: 'An everyday lotion.', status: 'in-development', eta: null },
  { handle: 'body-scrub', collection: 'body-care', name: 'Body Scrub', format: 'Jar', image: 'up_body_scrub', line: 'A weekly ritual.', status: 'in-development', eta: null },
  { handle: 'body-butter', collection: 'body-care', name: 'Body Butter', format: 'Jar', image: 'up_body_butter', line: 'A richer layer.', status: 'in-development', eta: null },
  { handle: 'hand-body-cream', collection: 'body-care', name: 'Hand & Body Cream', format: 'Tube', image: 'up_hand_cream', line: 'For the bag and the bedside.', status: 'in-development', eta: null },
  // Face care
  { handle: 'face-cleanser', collection: 'face-care', name: 'Cleanser', format: 'Pump bottle', image: 'up_cleanser', line: 'The first step.', status: 'in-development', eta: null },
  { handle: 'toner', collection: 'face-care', name: 'Toner', format: 'Bottle', image: 'up_toner', line: 'After cleansing.', status: 'in-development', eta: null },
  { handle: 'face-serum', collection: 'face-care', name: 'Serum', format: 'Dropper', image: 'up_serum', line: 'A focused step.', status: 'in-development', eta: null },
  { handle: 'moisturiser', collection: 'face-care', name: 'Moisturiser', format: 'Jar', image: 'up_moisturiser', line: 'To close the routine.', status: 'in-development', eta: null },
  { handle: 'sunscreen', collection: 'face-care', name: 'Sunscreen', format: 'Tube', image: 'up_sunscreen', line: 'For every day.', status: 'in-development', eta: null },
  { handle: 'face-masks', collection: 'face-care', name: 'Face Mask', format: 'Jar', image: 'up_mask', line: 'A slower moment.', status: 'in-development', eta: null },
  // Lip care
  { handle: 'lip-balm', collection: 'lip-care', name: 'Lip Balm', format: 'Stick', image: 'up_lip_balm', line: 'Daily, in rose.', status: 'in-development', eta: null },
  { handle: 'lip-treatment', collection: 'lip-care', name: 'Lip Treatment', format: 'Tube', image: 'up_lip_treatment', line: 'A richer care.', status: 'in-development', eta: null },
];

/** Customer-facing status labels. */
export const statusLabels = {
  'coming-soon': 'Coming soon',
  'in-development': 'In development',
};

// =============================================================================
//  NAVIGATION
// =============================================================================

export const navigation = {
  primary: [
    { label: 'Shop', href: 'shop.html', mega: 'all' },
    { label: 'Body', href: 'collection.html?c=body-care', mega: 'body-care' },
    { label: 'Face', href: 'collection.html?c=face-care', mega: 'face-care' },
    { label: 'Lip', href: 'collection.html?c=lip-care', mega: 'lip-care' },
    { label: 'Our Story', href: 'story.html' },
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
        { label: 'FAQs', href: 'faq.html' },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Shipping & returns', href: 'shipping-returns.html' },
        { label: 'Privacy policy', href: 'privacy.html' },
        { label: 'Terms & conditions', href: 'terms.html' },
      ],
    },
  ],
};

// =============================================================================
//  PAGE CONTENT — short by design: images lead, words support.
// =============================================================================

export const content = {
  home: {
    hero: {
      eyebrow: 'Body Mist Nº 01',
      title: 'Gentle, from the *first mist.*',
      text: 'The first release from Gentle Company. Launching soon.',
      primary: { label: 'Explore the mist', href: 'product.html?p=body-mist-no-01' },
      secondary: { label: 'Get launch updates', href: '#early-access' },
      image: 'hero_wide',
      imageMobile: 'hero_portrait',
      imageAlt: 'Gentle Company Body Mist Nº 01 on a travertine block against warm apricot plaster, in leaf-dappled sunlight',
    },
    shelf: { title: 'The collection', link: { label: 'Shop all', href: 'shop.html' } },
    categories: { title: 'Shop by category' },
    intro: {
      title: 'Care, *made gently.*',
      lines: ['Body and skin care for India.', 'One considered range, starting with a mist.'],
      image: 'ritual',
      imageAlt: 'Body Mist Nº 01 on a travertine bath ledge beside a folded linen towel, in leaf-dappled light',
      link: { label: 'Our story', href: 'story.html' },
    },
    experience: { eyebrow: 'Body Mist Nº 01', title: 'Made for the *everyday ritual.*' },
    future: {
      title: 'What comes next',
      text: 'The range in development. Tap a product to see where it stands.',
      image: 'lineup',
      imageAlt: 'The Gentle Company range on a long travertine shelf: body care in apricot, face care in milk white, lip care in rose',
    },
    earlyAccess: {
      title: 'Be first to know.',
      text: 'Launch news and early access. Nothing else.',
      interests: ['Body Mist', 'Body care', 'Face care', 'Lip care'],
      image: 'pack_angle',
    },
  },

  story: {
    hero: {
      title: 'Gentle, *by name.*',
      text: 'Gentle Company makes body and skin care for India — calm to use, honest to read, beautiful to keep.',
      image: 'lineup',
    },
    chapters: [
      { title: 'One range, one look', text: 'Every product shares one design: clear labels, cocoa caps and a colour for each line — apricot for body, milk for face, rose for lip.', image: 'family_body' },
      { title: 'Information in plain view', text: 'Each product page will list its full ingredients and label details. We publish what is confirmed, and nothing that isn’t.', image: 'detail_label' },
      { title: 'Starting with a mist', text: 'Our first release is Body Mist Nº 01. The rest of the range follows, one product at a time.', image: 'vanity' },
    ],
  },

  faqs: [
    {
      group: 'Our products',
      items: [
        { q: 'What can I buy right now?', a: 'Body Mist Nº 01 is our first product and is launching soon. Body, face and lip care are in development. Leave your email on any product or category page to hear first.' },
        { q: 'Where can I find the ingredients?', a: 'Each product page will list the full ingredients (INCI) from the final formulation, alongside the label information.' },
      ],
    },
    {
      group: 'Orders',
      items: [
        { q: 'Will anyone call me about a payment?', a: 'No. We will never call or message you asking for a payment, an OTP or card details. If this happens, please do not share any information.' },
      ],
    },
  ],
};
