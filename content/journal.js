/**
 * Journal articles. Each article: slug, title, dek (standfirst), date (ISO or
 * null), readingTime, image (key from assets/js/data/images.js), body (array
 * of blocks: { p }, { h }, { quote }, { list: [] }).
 *
 * These launch articles are educational and make no product claims.
 */
export const journal = [
  {
    slug: 'how-to-wear-a-body-mist',
    title: 'How to wear a body mist',
    dek: 'A body mist is lighter than a perfume by design. Here is how to make the most of it.',
    category: 'Ritual',
    date: null,
    readingTime: '4 min read',
    image: 'ritual_ledge',
    body: [
      { p: 'A body mist is not a weaker perfume. It is a different object, made for a different rhythm: lighter, airier, and designed to be returned to through the day rather than applied once in the morning.' },
      { h: 'Start with skin that is ready' },
      { p: 'Scent tends to sit better on skin that is clean and moisturised than on skin that is dry. Many people mist straight after a shower, once a body lotion has settled in.' },
      { h: 'Mist, don’t drench' },
      { p: 'Hold the bottle a little away from the body so the mist falls as a fine veil rather than a single wet spot. The décolleté, arms and pulse points — wrists, the inside of the elbows, behind the knees — are good places to begin.' },
      { h: 'Return to it' },
      { p: 'Because a mist is light, it is meant to be re-applied. Keep it on a bedside table, in a desk drawer or in a bag, and treat the second and third spritz of the day as small pauses rather than corrections.' },
      { h: 'In heat and humidity' },
      { p: 'Warm, humid weather changes how any fragrance behaves on skin. Lighter, fresher compositions often feel more comfortable in the heat, and more frequent, smaller applications tend to feel better than one heavy one.' },
      { quote: 'Treat each spritz as a small pause in the day, not a top-up.' },
      { p: 'Always follow the directions on the product label, avoid the eyes and broken skin, and patch test if your skin is sensitive.' },
    ],
  },
  {
    slug: 'reading-a-scent-pyramid',
    title: 'Top, heart, base: reading a scent pyramid',
    dek: 'Why a fragrance smells different after ten minutes than it does after an hour — and how to use that when you choose one.',
    category: 'Fragrance notes',
    date: null,
    readingTime: '5 min read',
    image: 'mist',
    body: [
      { p: 'Perfumers describe a fragrance in three stages, often drawn as a pyramid. The stages overlap rather than switch on and off, but the idea is simple: different materials evaporate at different speeds.' },
      { h: 'The top: the first impression' },
      { p: 'Top notes are the lightest and most volatile. Citrus peels, fresh herbs and sparkling fruits often sit here. They are what you notice in the first moments — bright, and quick to fade.' },
      { h: 'The heart: the character' },
      { p: 'Heart (or middle) notes emerge as the top notes lift. Florals such as jasmine and rose, and soft spices, commonly live here. This is the stage most people mean when they describe what a fragrance “smells like”.' },
      { h: 'The base: the trail' },
      { p: 'Base notes are the heaviest and slowest to evaporate — woods such as sandalwood and cedar, resins, vanilla and musks. They give a fragrance its depth and are what stays closest to skin.' },
      { h: 'Using the pyramid when you shop' },
      { list: ['Read the heart notes first — they describe the main character.', 'Look at the base for how it will feel later in the day.', 'Treat the top notes as an introduction, not the whole story.'] },
      { p: 'A pyramid is a map, not a promise: skin, weather and how much you apply all change how a scent unfolds.' },
    ],
  },
  {
    slug: 'body-mist-or-perfume',
    title: 'Body mist or perfume?',
    dek: 'The real difference is concentration — and that changes how, when and how often to wear each.',
    category: 'Know-how',
    date: null,
    readingTime: '3 min read',
    image: 'pack_angle',
    body: [
      { p: 'Body mists and perfumes can share the same notes, but they are built differently. The main difference is how much fragrance oil each contains.' },
      { h: 'Concentration, in short' },
      { list: ['Body mists are commonly described as containing around 1–5% fragrance oil.', 'An eau de parfum is commonly around 15–20%.', 'Exact figures vary by brand and formula.'] },
      { p: 'That is why a mist feels airier and fades sooner, and why it is designed to be re-applied, while a perfume is applied in smaller amounts and worn longer.' },
      { h: 'When a mist makes sense' },
      { p: 'Mists suit warm days, layering, offices and close quarters, and moments when you want something softer than a perfume. Many people keep both — a perfume for evenings, a mist for everything in between.' },
      { h: 'Layering the two' },
      { p: 'If you wear both, mist first and apply perfume sparingly afterwards, or keep them to different moments of the day. There are no rules — only what feels right on your skin.' },
    ],
  },
];
