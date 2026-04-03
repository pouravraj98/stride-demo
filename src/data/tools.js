// Gemini function declarations — these trigger rich UI in the chat

export const toolDeclarations = [
  {
    name: 'show_product',
    description: 'Show a product card to the user. Use when recommending, identifying, or mentioning a specific product.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_id: {
          type: 'INTEGER',
          description: 'Product ID from the catalog (0-7)',
        },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'show_product_detail',
    description: 'Show detailed product view with image carousel, description, features, and customer reviews. Use when user asks for more information about a product. Only product ID 1 (White Court Sneaker) has full detail data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_id: {
          type: 'INTEGER',
          description: 'Product ID (0-7). Full detail only available for ID 1.',
        },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'show_products',
    description: 'Show multiple product cards for comparison. Use when suggesting alternatives or comparing options.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_ids: {
          type: 'ARRAY',
          items: { type: 'INTEGER' },
          description: 'Array of product IDs to show',
        },
      },
      required: ['product_ids'],
    },
  },
  {
    name: 'show_order_summary',
    description: 'Show the order summary card for checkout. Use when user wants to buy a product.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_id: {
          type: 'INTEGER',
          description: 'Product ID to purchase',
        },
        size: {
          type: 'STRING',
          description: 'Selected size',
        },
      },
      required: ['product_id', 'size'],
    },
  },
  {
    name: 'show_address',
    description: 'Show a shipping address card. The customer has two addresses on file: home and office.',
    parameters: {
      type: 'OBJECT',
      properties: {
        type: {
          type: 'STRING',
          enum: ['home', 'office'],
          description: '"home" for 456 Oak Ave or "office" for 200 Congress Ave',
        },
      },
      required: ['type'],
    },
  },
  {
    name: 'show_payment',
    description: 'Show the payment method card (Visa ending 4242). Use before asking user to confirm payment.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'process_order',
    description: 'Process the payment and show order confirmation. Use ONLY after user explicitly confirms they want to pay.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];
