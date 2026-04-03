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
          description: 'Product index from the catalog (0-9)',
        },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'show_product_detail',
    description: 'Show detailed product view with description, features, and customer reviews. Use when user asks for more information, details, or reviews about a product. All products have detail data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_id: {
          type: 'INTEGER',
          description: 'Product index (0-9). Full detail with images/reviews only available for index 1.',
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
  {
    name: 'show_order_status',
    description: 'Show order status card with timeline for a specific order. Use when user asks about a specific order.',
    parameters: {
      type: 'OBJECT',
      properties: {
        order_id: {
          type: 'STRING',
          description: 'Order ID like "ST-4821", "ST-5102", or "ST-5387"',
        },
      },
      required: ['order_id'],
    },
  },
  {
    name: 'show_all_orders',
    description: 'Show all past orders as summary cards. Use when user asks "whats my order status", "my orders", or a general question about orders without specifying which one. This shows all orders so the user can pick one.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];
