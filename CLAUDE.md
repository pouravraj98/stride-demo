# STRIDE Demo — Architecture Guide

## What is this?
A conversational commerce prototype for CometChat stakeholder demos. A fictional sneaker/apparel store "STRIDE" with an AI stylist agent that does visual search, product recommendations, and in-chat checkout.

**Live:** https://pouravraj98.github.io/stride-demo/
**Stack:** React 18 + Vite 5, deployed via GitHub Pages (auto-deploys on push to main).

---

## File Map

### Data (edit these to change products or conversation)
| File | What it controls |
|------|-----------------|
| `src/data/products.js` | Product catalog: names, prices, ratings, images (Target CDN), sizes. Product index 1 (White Court) has extra `images`, `description`, `features`, `customerReviews` for the detail view. |
| `src/data/flow.js` | Conversation steps array. Each step has `ai` (array of messages/markers), optional `showUpload`. User types anything → advances to next step. Special markers like `__PRODUCT_0__` render rich UI. |

### Special Markers in flow.js
| Marker | Renders | Handled in Chat.jsx |
|--------|---------|-------------------|
| `__SCAN__` | Scanning progress bar animation (2.5s) | ~line 233 |
| `__PRODUCT_0__` | Single product card (index 0 = Reebok) | ~line 247 |
| `__PRODUCT_DETAIL_1__` | Full product detail: horizontal image carousel + info + features + reviews (index 1 = White Court) | ~line 237 |
| `__PRODUCTS_1_2__` | Two product cards side by side | ~line 241 |
| `__ORDER__` | Order summary card (White Court, $58.43 total) | ~line 250 |
| `__HOME_ADDRESS__` | Home address card (456 Oak Ave, Austin) | ~line 255 |
| `__OFFICE_ADDRESS__` | Office address card (200 Congress Ave, Austin) | ~line 257 |
| `__PAYMENT__` | Visa ••••4242 payment card | ~line 259 |
| `__PROCESSING__` | Spinner + "Processing payment..." (2s) | ~line 261 |
| `__CONFIRMED__` | Order confirmed card (#ST-7293) | ~line 265 |

### Components
| File | Lines | What it does |
|------|-------|-------------|
| `src/App.jsx` | 77 | Layout orchestrator. Holds `chatOpen`, `cartCount`, `showFinale` state. Renders Navbar, Hero, TrustBar, ProductGrid, floating AI bar, Chat, Finale. Locks body scroll when chat open. |
| `src/App.css` | 686 | **ALL styles** — nav, hero, trust, products, floating bar, chat popup, messages, cards, product detail, expanded image, finale, responsive breakpoints. |
| `src/components/Chat.jsx` | 537 | **The big one.** All chat logic: message state, flow progression, AI message playback with typing indicators, file upload (native Finder), product cards, order/address/payment cards, product detail with horizontal carousel + expandable images, scroll management, mobile keyboard handling. |
| `src/components/Navbar.jsx` | 20 | Site nav: STRIDE logo, links, search/cart/profile icons. Cart badge shows/hides. |
| `src/components/Hero.jsx` | 15 | Hero banner: Unsplash background image, headline, CTA. |
| `src/components/ProductGrid.jsx` | 40 | Bestsellers section: 4-column grid of 8 products with badges, hover effects, Add to Cart. |
| `src/components/Finale.jsx` | 12 | "The Last Interface — Built with CometChat" overlay (currently disabled in flow). |
| `src/index.css` | 15 | Base reset, fonts (DM Serif Display + Plus Jakarta Sans), body styles. |
| `src/main.jsx` | 10 | React entry point. |

### Key Sections in Chat.jsx
| What | Where |
|------|-------|
| Sub-components (ProductCardChat, OrderSummary, HomeAddressCard, OfficeAddressCard, PaymentCard, ConfirmationCard, ProductDetail) | Lines 1–155 |
| Main Chat component state | ~line 160 |
| scrollBottom function | ~line 165 |
| Mobile keyboard handling (visualViewport) | ~line 190 |
| playAI function (processes flow steps) | ~line 210 |
| handleSend (user sends message) | ~line 275 |
| File upload (triggerFileInput, handleFileSelected) | ~line 285 |
| resetDemo | ~line 310 |
| renderMessage switch | ~line 325 |
| JSX return (popup structure) | ~line 420 |

### Key Sections in App.css
| What | Where |
|------|-------|
| CSS variables | Lines 1–20 |
| Nav styles | ~line 22 |
| Hero styles | ~line 60 |
| Trust bar | ~line 90 |
| Product grid + cards | ~line 100 |
| AI floating bar (dark, shimmer, glow) | ~line 130 |
| Chat popup container | ~line 148 |
| Chat header (sticky) | ~line 160 |
| Chat messages, bubbles | ~line 185 |
| Typing indicator | ~line 205 |
| Scan animation | ~line 215 |
| Upload zone, progress, uploaded image | ~line 230 |
| Processing spinner | ~line 280 |
| Product cards in chat | ~line 290 |
| Rich cards (order, address, payment, confirm) | ~line 315 |
| Chat footer + input | ~line 355 |
| Product detail (horizontal carousel, expanded view) | ~line 390 |
| Finale overlay | ~line 450 |
| Responsive — tablet (≤1024px) | ~line 480 |
| Responsive — mobile (≤640px) | ~line 500 |

---

## Conversation Flow (what the presenter types)

| Step | User types | AI shows |
|------|-----------|----------|
| 0 | *(auto)* | Welcome message |
| 1 | "I saw some sneakers I want to find" | Upload prompt + upload zone |
| 2 | *(picks file from Finder)* | Scan animation → identified product card |
| 3 | "Find me something similar under $60" | "What's your size?" |
| 4 | "Size 10" | Two product cards + comparison |
| 5 | "Tell me more about the White Court" | Horizontal image carousel + detail card |
| 6 | "Yes, add it to my cart" | "Added ✓ Anything else?" |
| 7 | "No, checkout" | Order summary + home address card |
| 8 | "No, send it to my office" | Office address + payment card |
| 9 | "Yes" | Processing → confirmation card |

## Product Images
All from Target CDN: `https://target.scene7.com/is/image/Target/GUEST_{id}?wid=400&hei=400&fmt=pjpeg`
- White Court Sneaker has 4 alternate angle images for the carousel (side, other side, top-down, sole)
- Blurry "user photo" for upload demo saved at: `/Users/admin/Desktop/sneaker_photo.jpg`

## Deployment
Push to `main` → GitHub Actions builds + deploys to Pages automatically (~60s).
Workflow: `.github/workflows/deploy.yml`
Vite base path: `/stride-demo/` (in `vite.config.js`)
