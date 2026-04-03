// Conversation flow — no chips, user types everything.
// Special markers in ai array render rich UI components.

export const flow = [
  {
    // Step 0: Welcome
    ai: [
      "Hey! I'm your STRIDE stylist. I can identify products from a photo, find your perfect fit, or put together a look. What can I help with?",
    ],
  },
  {
    // Step 1: Upload prompt (user said "I saw sneakers...")
    ai: ['Sure! Upload a photo and I\u2019ll identify them for you.'],
    showUpload: true,
  },
  {
    // Step 2: Scan + identify (after upload)
    ai: [
      '__SCAN__',
      'Found them! Those are Reebok Classic Leather sneakers.',
      '__PRODUCT_0__',
      'We have them in stock, sizes 8\u201313. Want to add to cart, or should I find similar styles at a different price?',
    ],
  },
  {
    // Step 3: Ask size (user said "find similar under $60")
    ai: ['I\u2019ve got some great options in that range. What\u2019s your size?'],
  },
  {
    // Step 4: Show alternatives (user said "size 10")
    ai: [
      'Here are 2 great alternatives under $60 in Size 10:',
      '__PRODUCTS_1_2__',
      'The White Court is the closest match \u2014 clean, versatile, goes with everything. The Canvas Low-Top is more casual and relaxed. Which one?',
    ],
  },
  {
    // Step 5: Added to cart (user said "go with the White Court")
    ai: [
      'White Court Sneaker, Size 10 \u2014 added to your cart \u2713',
      'Anything else you\u2019d like to add, or should I proceed to checkout?',
    ],
  },
  {
    // Step 6: Order summary + address (user said "no, checkout" / "proceed to checkout")
    ai: [
      'Here\u2019s your order summary:',
      '__ORDER__',
      'Ship to your home address?',
      '__HOME_ADDRESS__',
    ],
  },
  {
    // Step 7: Office address + payment (user said "no, send to office")
    ai: [
      'Got it! Shipping to your office instead:',
      '__OFFICE_ADDRESS__',
      'Pay with your card on file?',
      '__PAYMENT__',
    ],
  },
  {
    // Step 8: Processing + confirmed (user said "yes")
    ai: [
      '__PROCESSING__',
      '__CONFIRMED__',
      'Your order is on its way! What else can I help you with?',
    ],
  },
];
