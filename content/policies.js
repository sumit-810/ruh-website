/**
 * Policy pages for Gentle Company, written for an Indian D2C seller.
 * Have them reviewed by a lawyer before launch.
 *
 * {{tokens}} are filled from site.config.js (company, contact, shipping).
 * [Square brackets] mark business decisions still to be made; they are
 * highlighted on the page and `node tools/launch_check.mjs` blocks launch
 * while any remain.
 *
 * Frameworks reflected: Consumer Protection Act 2019 and Consumer Protection
 * (E-Commerce) Rules 2020 (incl. the 2026 amendment, in force 1 Jan 2027),
 * Digital Personal Data Protection Act 2023 and DPDP Rules 2025, Legal
 * Metrology (Packaged Commodities) Rules 2011.
 */
export const policies = {
  updated: null, // e.g. '1 December 2026' — the date these policies take effect

  /**
   * Which policies are published. A policy marked false shows a short notice
   * that it will be published before the first order, never draft text.
   * Privacy is published now because the site already collects email sign-ups.
   */
  published: { privacy: true, shipping: false, terms: false },

  shipping: {
    title: 'Shipping & Returns',
    intro: 'How your order reaches you, what it costs, and what happens if something isn’t right. Products are sold by {{seller}}.',
    sections: [
      { h: 'Where we deliver', p: 'We deliver to serviceable PIN codes across India. Serviceability is checked when you enter your address at checkout. We currently do not ship outside India.' },
      { h: 'Delivery charges', p: '{{deliveryCharges}} The full amount, including any delivery charge, is shown before you pay. There are no hidden charges.' },
      { h: 'Dispatch and delivery times', p: 'Orders are dispatched within [2] working days of payment confirmation. Delivery usually takes [3–7] working days depending on your location. We send tracking details by email or SMS once your order ships. Our delivery partner is [courier partner].' },
      { h: 'Payment methods', p: 'UPI, credit and debit cards, net banking and wallets, processed securely by Razorpay. {{codLine}} We never ask for your OTP, PIN or card details by phone, email or WhatsApp.' },
      { h: 'Cancelling an order', p: 'You can cancel an order at any time before it is dispatched by writing to {{email}} with your order reference. We refund the full amount to your original payment method within [5–7] working days of cancellation. Once an order has been dispatched it can no longer be cancelled, but the returns terms below still apply.' },
      {
        h: 'Returns',
        p: 'Because fragrance and skin care are personal-care products, we can only accept returns in these cases:',
        list: [
          'The product arrived damaged, leaking or defective.',
          'You received the wrong product or the wrong quantity.',
          'The product is past its best-before or use-by date on arrival.',
          '[Unopened products in their original seal, returned within 7 days of delivery — confirm or remove]',
        ],
      },
      { h: 'How to report a problem', p: 'Write to {{email}} within [48 hours] of delivery with your order reference and photos (and, if possible, an unboxing video) showing the issue. We confirm within two working days what happens next.' },
      { h: 'Return shipping costs', p: 'When a return is due to our error — damaged, defective, wrong or expired items — we arrange and pay for the pickup or reimburse the return postage. [State the policy for change-of-mind returns of unopened items, if offered, including who pays return shipping.]' },
      { h: 'Refunds and replacements', p: 'Once a return is approved you can choose a replacement (subject to stock) or a refund. Refunds go to your original payment method within [7] working days of approval; cash-on-delivery orders are refunded by bank transfer or UPI to an account you nominate.' },
      { h: 'Best-before dates', p: 'Every product page and pack shows the best-before or use-by date, the net quantity, the MRP and the country of origin. We do not dispatch products with less than [12] months of shelf life remaining.' },
      { h: 'Questions and complaints', p: 'For anything about an order, write to {{email}}. If you are not satisfied with our response, you can contact our Grievance Officer: {{grievance}} (see our Terms for how complaints are handled).' },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy explains what personal data {{seller}} collects through this website, why, who we share it with, and the rights you have under the Digital Personal Data Protection Act, 2023.',
    sections: [
      { h: 'Who is responsible', p: '{{sellerNamed}} is the Data Fiduciary for personal data collected on this website. {{addressLine}}You can reach us {{contactRoute}}.' },
      {
        h: 'What we collect',
        list: [
          'Contact details: name, email address and mobile number.',
          'Delivery details: postal address and PIN code.',
          'Order details: products purchased, amounts, order and payment references. Card, UPI and bank details are collected and processed by our payment partner Razorpay — we never see or store them.',
          'Messages you send us, and your email preferences if you join our list.',
          'Information your browser stores on your own device to run the site (for example your bag and recently viewed items, in local storage).',
        ],
      },
      {
        h: 'Why we use it',
        list: [
          'To take payment for, deliver and support your orders (necessary to perform the purchase you request).',
          'To keep the records the law requires, such as tax invoices.',
          'To reply to messages and resolve complaints.',
          'To send launch news and offers by email — only with your consent, which you can withdraw at any time using the unsubscribe link or by writing to us.',
          'To prevent fraud and keep the website secure.',
        ],
      },
      { h: 'Consent', p: 'Where we rely on your consent (for example, marketing emails), we ask for it clearly and separately, and withdrawing it is as easy as giving it. Withdrawing consent does not affect processing that took place before.' },
      {
        h: 'Who we share it with',
        p: 'We share only what each partner needs to do their job, under contract:',
        list: [
          'Razorpay — payment processing.',
          'Vercel — website hosting.',
          'Brevo — storing email sign-ups and sending our emails, with your consent.',
          'Our delivery partner — delivering your order, once our shop is open.',
          'Government or regulatory authorities, where the law requires it.',
        ],
        after: 'We do not sell your personal data.',
      },
      { h: 'How long we keep it', p: 'Order and invoice records are kept for as long as tax and consumer-protection laws require. Marketing data is kept until you withdraw consent. Other data is deleted when it is no longer needed for the purpose it was collected for.' },
      { h: 'Security', p: 'We use reasonable security safeguards, including encrypted (HTTPS) connections and access controls. Payments are handled by Razorpay, a PCI-DSS compliant payment gateway. If a personal data breach occurs, we will inform affected people and the Data Protection Board of India as the law requires.' },
      {
        h: 'Your rights',
        list: [
          'Access a summary of the personal data we hold about you and how we use it.',
          'Correct, complete or update your data.',
          'Ask us to erase your data, unless we must keep it by law.',
          'Withdraw consent at any time.',
          'Nominate another person to exercise these rights on your behalf in case of death or incapacity.',
          'Have your grievances addressed by us, and complain to the Data Protection Board of India.',
        ],
        after: 'To exercise any of these rights, contact us {{contactRoute}}.',
      },
      { h: 'Children', p: '{{brand}} products and this website are intended for adults. We do not knowingly collect personal data from anyone under 18 without verifiable consent from a parent or guardian.' },
      { h: 'Local storage and analytics', p: 'This website stores small preferences, such as recently viewed items, in your browser’s local storage; this data stays on your device. We do not use advertising cookies or analytics tracking.' },
      { h: 'Changes to this policy', p: 'We will post any changes here and update the date below. If a change materially affects how we use your data, we will tell you.' },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    intro: 'These terms apply when you use this website and buy {{brand}} products from {{seller}}. Nothing in them limits your rights under the Consumer Protection Act, 2019.',
    sections: [
      { h: 'About us', p: '{{brand}} is a brand of {{seller}}, {{address}}. {{registration}} Customer care: {{email}}.' },
      { h: 'Using this website', p: 'You agree to give accurate information when you order and not to misuse the website. To place an order you must be at least 18, or order with the involvement of a parent or guardian.' },
      { h: 'Products and descriptions', p: 'We describe our products accurately and list the full ingredients, net quantity, MRP, best-before date, country of origin and marketer details on each product page and pack. Colours and finishes can look slightly different on screen. Always read the label before use.' },
      { h: 'Prices', p: 'All prices are in Indian rupees and are the maximum retail price (MRP), inclusive of all taxes. Delivery charges, if any, are shown before you pay. If a product is listed at an obviously wrong price, we will contact you and you may cancel for a full refund.' },
      { h: 'Orders', p: 'An online order is confirmed once your payment is verified and you see a confirmation with an order reference. A cash-on-delivery order is confirmed when we contact you to confirm it. We may cancel an order (with a full refund) if a product becomes unavailable, if there was a pricing error, or if we suspect fraud.' },
      { h: 'Payments', p: 'Payments are processed by Razorpay. We do not store card, UPI or bank details. We will never ask for your OTP or PIN.' },
      { h: 'Delivery, cancellations, returns and refunds', p: 'These are set out in our Shipping & Returns policy, which forms part of these terms.' },
      { h: 'Using our products safely', p: 'Our products are for external use only. Patch test before first use, avoid the eyes and broken or irritated skin, and stop using a product if irritation occurs. Information on this website is not medical advice.' },
      { h: 'Reviews', p: 'We publish only genuine reviews from customers and never pay for or write reviews without clear disclosure. We do not edit reviews to change their meaning.' },
      { h: 'Intellectual property', p: 'The {{brand}} name and logo, and the text, images and design of this website belong to {{seller}} and may not be used without our written permission.' },
      { h: 'Liability', p: 'We are responsible for losses that are a foreseeable result of our breaking these terms or failing to use reasonable care. We are not responsible for losses caused by events outside our reasonable control. This does not exclude any liability that cannot be excluded under Indian law.' },
      {
        h: 'Complaints and grievance redressal',
        p: 'If something goes wrong, please write to {{email}} first. You can also contact our Grievance Officer: {{grievance}}.',
        list: [
          'We acknowledge every complaint within 48 hours of receiving it.',
          'We give you a copy of your complaint as we have recorded it.',
          'We aim to resolve it within one month of receipt.',
        ],
        after: 'If you are not satisfied, you can contact the National Consumer Helpline (1915, consumerhelpline.gov.in) or approach the Consumer Commission.',
      },
      { h: 'Governing law', p: 'These terms are governed by the laws of India. Courts at [city] have jurisdiction, without affecting your right to approach a Consumer Commission where you live.' },
      { h: 'Changes', p: 'We may update these terms. The version in force when you place an order applies to that order.' },
    ],
  },
};
