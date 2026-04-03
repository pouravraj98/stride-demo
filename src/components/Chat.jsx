import { useState, useRef, useEffect, useCallback } from 'react';
import { products } from '../data/products';
import { flow } from '../data/flow';
import { sendMessage, userMessage, modelMessage } from '../services/gemini';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const LIVE_MODE = !!(import.meta.env.VITE_DEEPSEEK_KEY || import.meta.env.VITE_OPENAI_KEY || import.meta.env.VITE_GEMINI_KEY);

// ── Sub-components (unchanged) ──

function AiAvatar() {
  return <div className="m-av ai-av">S</div>;
}

function ProductCardChat({ product }) {
  return (
    <div className="ch-pcard">
      <div className="ch-pcard-img"><img src={product.image} alt={product.name} /></div>
      <div className="ch-pcard-body">
        <div className="ch-pcard-name">{product.name}</div>
        <div className="ch-pcard-meta"><span className="star">&#9733;</span> {product.rating} &middot; {product.reviews} reviews</div>
        <div className="ch-pcard-row">
          <span className="ch-pcard-price">${product.price}</span>
          <span className="ch-pcard-stock">In Stock</span>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ productId = 1, size = '10' }) {
  const p = products[productId];
  const subtotal = p.price;
  const tax = 3.43;
  const total = (subtotal + tax).toFixed(2);
  return (
    <div className="ch-card order-card">
      <div className="ch-card-head">Order Summary</div>
      <div className="ch-card-item">
        <div className="ch-card-item-img"><img src={p.image} alt={p.name} /></div>
        <div className="ch-card-item-info"><strong>{p.name}</strong><span>Size {size} &middot; Qty: 1</span></div>
        <span className="ch-card-item-price">${subtotal}.00</span>
      </div>
      <div className="ch-card-divider" />
      <div className="ch-card-row"><span>Subtotal</span><span>${subtotal}.00</span></div>
      <div className="ch-card-row"><span>Shipping</span><span>Free</span></div>
      <div className="ch-card-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
      <div className="ch-card-divider" />
      <div className="ch-card-row total"><span>Total</span><span>${total}</span></div>
    </div>
  );
}

function HomeAddressCard() {
  return (
    <div className="ch-card address-card">
      <div className="ch-card-icon">&#127968;</div>
      <div>
        <div className="ch-card-label">Home</div>
        <strong>Alex Johnson</strong>
        <div className="ch-card-sub">456 Oak Ave, Apt 2B</div>
        <div className="ch-card-sub">Austin, TX 78701</div>
      </div>
    </div>
  );
}

function OfficeAddressCard() {
  return (
    <div className="ch-card address-card">
      <div className="ch-card-icon">&#127970;</div>
      <div>
        <div className="ch-card-label">Office</div>
        <strong>Alex Johnson</strong>
        <div className="ch-card-sub">200 Congress Ave, Suite 400</div>
        <div className="ch-card-sub">Austin, TX 78701</div>
      </div>
    </div>
  );
}

function PaymentCard() {
  return (
    <div className="ch-card payment-card">
      <div className="ch-card-icon">&#128179;</div>
      <div>
        <strong>Visa ending in &bull;&bull;&bull;&bull; 4242</strong>
        <div className="ch-card-sub">Expires 09/28</div>
      </div>
    </div>
  );
}

function ConfirmationCard() {
  return (
    <div className="ch-card confirm-card">
      <div className="confirm-icon">&#10003;</div>
      <strong>Order Confirmed</strong>
      <div className="confirm-num">#ST-{Math.floor(1000 + Math.random() * 9000)}</div>
      <div className="ch-card-divider" />
      <div className="ch-card-row"><span>Delivery</span><span>Wed, April 9</span></div>
      <div className="ch-card-row"><span>Tracking</span><span>alex@email.com</span></div>
    </div>
  );
}

// Order history data with timeline steps
const orderHistory = {
  'ST-4821': {
    id: 'ST-4821', status: 'Delivered', statusColor: 'green',
    item: { name: 'Reebok Classic Leather', size: '10', color: 'Black', image: products[0].image },
    arrival: 'Delivered Friday, March 28',
    timeline: [
      { label: 'Order Confirmed', detail: 'March 25', state: 'done' },
      { label: 'Shipped via UPS', detail: 'March 26 · 1Z999AA10312345678', state: 'done' },
      { label: 'Austin Distribution Center', detail: 'March 27', state: 'done' },
      { label: 'Delivered', detail: 'March 28, 2:15 PM', state: 'done' },
    ],
  },
  'ST-5102': {
    id: 'ST-5102', status: 'In Transit', statusColor: 'blue',
    item: { name: 'Essential Crew Tee + Levi\'s 501', size: 'M / 32x32', color: 'Black / Indigo', image: products[5].image },
    arrival: 'Arriving Saturday, April 5',
    timeline: [
      { label: 'Order Confirmed', detail: 'March 30', state: 'done' },
      { label: 'Shipped via UPS', detail: 'March 31 · 1Z999AA10123456784', state: 'done' },
      { label: 'Austin Sorting Facility', detail: 'In transit · Updated 3h ago', state: 'current' },
      { label: 'Delivered', detail: 'Expected April 5', state: 'pending' },
    ],
  },
  'ST-5387': {
    id: 'ST-5387', status: 'Processing', statusColor: 'orange',
    item: { name: 'Performance Joggers', size: 'M', color: 'Black', image: products[9].image },
    arrival: 'Estimated Tuesday, April 8',
    timeline: [
      { label: 'Order Confirmed', detail: 'April 2', state: 'done' },
      { label: 'Preparing for Shipment', detail: 'Processing', state: 'current' },
      { label: 'Shipped', detail: 'Pending', state: 'pending' },
      { label: 'Delivered', detail: 'Expected April 8', state: 'pending' },
    ],
  },
};

function OrderStatusCard({ orderId }) {
  const order = orderHistory[orderId];
  if (!order) return null;
  const colors = { green: '#2d8a4e', blue: '#2563eb', orange: '#d97706' };
  const bgColors = { green: 'rgba(45,138,78,.08)', blue: 'rgba(37,99,235,.08)', orange: 'rgba(217,119,6,.08)' };
  const c = colors[order.statusColor];
  const bg = bgColors[order.statusColor];

  return (
    <div className="ch-card order-status-card">
      {/* Header */}
      <div className="os-header">
        <span className="os-id">#{order.id}</span>
        <span className="os-status" style={{ color: c, background: bg }}>{order.status}</span>
      </div>

      {/* Product */}
      <div className="os-product">
        <div className="os-product-img"><img src={order.item.image} alt={order.item.name} /></div>
        <div className="os-product-info">
          <strong>{order.item.name}</strong>
          <span>Size {order.item.size} &middot; {order.item.color}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="os-timeline">
        {order.timeline.map((step, i) => (
          <div key={i} className={`os-step os-step-${step.state}`}>
            <div className="os-step-track">
              <div className="os-step-dot" style={step.state === 'done' || step.state === 'current' ? { borderColor: c, background: step.state === 'done' ? c : '#fff' } : {}} />
              {i < order.timeline.length - 1 && <div className="os-step-line" style={step.state === 'done' ? { background: c } : {}} />}
            </div>
            <div className="os-step-content">
              <div className="os-step-label">{step.label}</div>
              <div className="os-step-detail">{step.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrival */}
      <div className="os-arrival" style={{ background: bg, borderColor: c }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{ color: c }}>{order.arrival}</span>
      </div>
    </div>
  );
}

function AllOrdersCard() {
  const orders = Object.values(orderHistory);
  const colors = { green: '#2d8a4e', blue: '#2563eb', orange: '#d97706' };
  const bgColors = { green: 'rgba(45,138,78,.08)', blue: 'rgba(37,99,235,.08)', orange: 'rgba(217,119,6,.08)' };
  return (
    <div className="os-all-orders">
      {orders.map((order) => (
        <div key={order.id} className="ch-card os-mini-card">
          <div className="os-header">
            <span className="os-id">#{order.id}</span>
            <span className="os-status" style={{ color: colors[order.statusColor], background: bgColors[order.statusColor] }}>{order.status}</span>
          </div>
          <div className="os-product" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            <div className="os-product-img"><img src={order.item.image} alt={order.item.name} /></div>
            <div className="os-product-info">
              <strong>{order.item.name}</strong>
              <span>{order.item.color} &middot; Size {order.item.size}</span>
            </div>
          </div>
          <div className="os-mini-arrival">{order.arrival}</div>
        </div>
      ))}
    </div>
  );
}

function ProductDetail({ product, onExpandImage }) {
  const imgs = product.images || [product.image];
  const stars = (n) => '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);
  return (
    <>
      <div className="pd-scroll">
        {imgs.map((img, i) => (
          <div key={i} className="pd-scroll-item" onClick={() => onExpandImage(product, i)}>
            <img src={img} alt={`${product.name} view ${i + 1}`} />
            <div className="pd-scroll-expand">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </div>
          </div>
        ))}
      </div>
      <div className="ch-card product-detail">
        <div className="pd-info">
          <div className="pd-name">{product.name}</div>
          <div className="pd-meta">
            <span className="pd-price">${product.price}.00</span>
            <span className="pd-rating"><span className="star">{'\u2605'}</span> {product.rating} ({product.reviews} reviews)</span>
          </div>
          {product.description && <p className="pd-desc">{product.description}</p>}
          {product.features && (
            <>
              <div className="pd-section-title">Key Features</div>
              <ul className="pd-features">{product.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </>
          )}
          {product.customerReviews && (
            <>
              <div className="pd-section-title">Customer Reviews</div>
              <div className="pd-reviews">
                {product.customerReviews.map((r, i) => (
                  <div key={i} className="pd-review">
                    <div className="pd-review-stars">{stars(r.rating)}</div>
                    <p className="pd-review-text">&ldquo;{r.text}&rdquo;</p>
                    <span className="pd-review-author">&mdash; {r.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Chat component ──

export default function Chat({ open, onClose, onCartUpdate, onShowFinale }) {
  const [messages, setMessages] = useState([]);       // UI messages
  const [inputValue, setInputValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [isLive, setIsLive] = useState(LIVE_MODE);   // toggle scripted vs AI

  // Scripted mode refs
  const stepRef = useRef(0);

  // Live mode: Gemini conversation history
  const historyRef = useRef([]);

  const msgsEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const startedRef = useRef(false);
  const pendingImageRef = useRef(null); // { base64, mimeType }

  const scrollBottom = useCallback((toElement) => {
    setTimeout(() => {
      if (toElement) {
        toElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const container = document.querySelector('.ch-msgs');
        if (container) container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Start conversation
  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      if (isLive) {
        sendInitialMessage();
      } else {
        setTimeout(() => playAI(flow[0]), 500);
      }
    }
  }, [open]);

  useEffect(() => { scrollBottom(); }, [messages, scrollBottom]);

  // Mobile keyboard scroll
  useEffect(() => {
    if (!open) return;
    const doScroll = () => { const c = document.querySelector('.ch-msgs'); if (c) c.scrollTop = c.scrollHeight; };
    const vv = window.visualViewport;
    if (vv) vv.addEventListener('resize', () => setTimeout(doScroll, 50));
    const input = inputRef.current;
    const onFocus = () => { setTimeout(doScroll, 100); setTimeout(doScroll, 400); };
    if (input) input.addEventListener('focus', onFocus);
    return () => { if (vv) vv.removeEventListener('resize', doScroll); if (input) input.removeEventListener('focus', onFocus); };
  }, [open]);

  // ════════════════════════════════════════
  // LIVE MODE — Real Gemini AI
  // ════════════════════════════════════════

  async function sendInitialMessage() {
    setBusy(true);
    addMessage({ type: 'typing' });

    try {
      // Send empty initial to get greeting
      const userMsg = userMessage('Hi, I just opened the chat.');
      historyRef.current = [userMsg];
      const response = await sendMessage(historyRef.current);
      setMessages((prev) => prev.filter((m) => m.type !== 'typing'));

      // Store model response in history
      historyRef.current.push(modelMessage(response.rawParts));

      // Render response
      await renderAIResponse(response);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
      addMessage({ type: 'ai', text: "Hey! I'm your STRIDE stylist. I can identify products from a photo, find your perfect fit, or put together a look. What can I help with?" });
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  async function sendLiveMessage(text, imageBase64 = null, imageMimeType = null) {
    setBusy(true);
    addMessage({ type: 'typing' });

    try {
      const userMsg = userMessage(text || 'Here is an image I uploaded.', imageBase64, imageMimeType);
      historyRef.current.push(userMsg);
      const response = await sendMessage(historyRef.current, imageBase64, imageMimeType);
      setMessages((prev) => prev.filter((m) => m.type !== 'typing'));

      // Store model response in history
      historyRef.current.push(modelMessage(response.rawParts));

      // Render response
      await renderAIResponse(response);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
      addMessage({ type: 'ai', text: "Sorry, I had a moment. Could you try again?" });
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  async function renderAIResponse(response) {
    // Process text parts and tool calls in order
    for (const text of response.textParts) {
      if (text.trim()) {
        addMessage({ type: 'ai', text: text.trim() });
        await wait(200);
      }
    }

    for (const tool of response.toolCalls) {
      await handleToolCall(tool);
      await wait(300);
    }
  }

  async function handleToolCall(tool) {
    const { name, args } = tool;
    switch (name) {
      case 'show_product': {
        const p = products[args.product_id];
        if (p) addMessage({ type: 'productCard', product: p });
        break;
      }
      case 'show_product_detail': {
        const p = products[args.product_id];
        if (p) addMessage({ type: 'productDetail', product: p });
        // Scroll to top of detail card
        await wait(80);
        const el = document.querySelector('.ch-msgs').lastElementChild;
        if (el) scrollBottom(el);
        break;
      }
      case 'show_products': {
        const prods = (args.product_ids || []).map(id => products[id]).filter(Boolean);
        if (prods.length) addMessage({ type: 'productCards', products: prods });
        break;
      }
      case 'show_order_summary': {
        onCartUpdate(1);
        addMessage({ type: 'orderSummary', productId: args.product_id, size: args.size });
        await wait(80);
        const el = document.querySelector('.ch-msgs').lastElementChild;
        if (el) scrollBottom(el);
        break;
      }
      case 'show_address': {
        addMessage({ type: args.type === 'office' ? 'officeAddress' : 'homeAddress' });
        break;
      }
      case 'show_payment': {
        addMessage({ type: 'payment' });
        break;
      }
      case 'process_order': {
        addMessage({ type: 'processing' });
        await wait(2000);
        setMessages((prev) => prev.filter((m) => m.type !== 'processing'));
        onCartUpdate(0);
        addMessage({ type: 'confirmation' });
        break;
      }
      case 'show_order_status': {
        addMessage({ type: 'orderStatus', orderId: args.order_id });
        break;
      }
      case 'show_all_orders': {
        addMessage({ type: 'allOrders' });
        break;
      }
    }
  }

  // ════════════════════════════════════════
  // SCRIPTED MODE (unchanged logic)
  // ════════════════════════════════════════

  async function playAI(step) {
    setBusy(true);
    if (step.showUpload) {
      for (const msg of step.ai) {
        addMessage({ type: 'typing' }); await wait(800);
        setMessages((prev) => prev.slice(0, -1));
        addMessage({ type: 'ai', text: msg });
      }
      await wait(300);
      setShowUploadZone(true);
      setBusy(false);
      return;
    }
    const specialMarkers = ['__SCAN__','__PRODUCT_0__','__PRODUCT_DETAIL_1__','__PRODUCTS_1_2__','__ORDER__','__HOME_ADDRESS__','__OFFICE_ADDRESS__','__PAYMENT__','__PROCESSING__','__CONFIRMED__'];
    for (let i = 0; i < step.ai.length; i++) {
      const msg = step.ai[i];
      await wait(i === 0 ? 500 : 400);
      if (msg === '__SCAN__') {
        addMessage({ type: 'scan' }); await wait(2500);
        setMessages((prev) => prev.filter((m) => m.type !== 'scan'));
      } else if (msg.startsWith('__PRODUCT_DETAIL_')) {
        const idx = parseInt(msg.replace('__PRODUCT_DETAIL_','').replace('__',''));
        addMessage({ type: 'productDetail', product: products[idx] });
        await wait(80); const el = document.querySelector('.ch-msgs').lastElementChild;
        if (el) scrollBottom(el); await wait(200); continue;
      } else if (msg.startsWith('__PRODUCTS_')) {
        const indices = msg.replace('__PRODUCTS_','').replace('__','').split('_').map(Number);
        addMessage({ type: 'productCards', products: indices.map(j => products[j]) });
      } else if (msg.startsWith('__PRODUCT_')) {
        const idx = parseInt(msg.replace('__PRODUCT_','').replace('__',''));
        addMessage({ type: 'productCard', product: products[idx] });
      } else if (msg === '__ORDER__') {
        addMessage({ type: 'orderSummary' });
        await wait(80); const el = document.querySelector('.ch-msgs').lastElementChild;
        if (el) scrollBottom(el); await wait(200); continue;
      } else if (msg === '__HOME_ADDRESS__') { addMessage({ type: 'homeAddress' });
      } else if (msg === '__OFFICE_ADDRESS__') { addMessage({ type: 'officeAddress' });
      } else if (msg === '__PAYMENT__') { addMessage({ type: 'payment' });
      } else if (msg === '__PROCESSING__') {
        addMessage({ type: 'processing' }); await wait(2000);
        setMessages((prev) => prev.filter((m) => m.type !== 'processing'));
      } else if (msg === '__CONFIRMED__') { onCartUpdate(0); addMessage({ type: 'confirmation' });
      } else {
        addMessage({ type: 'typing' }); await wait(Math.min(1800, 500 + msg.length * 5));
        setMessages((prev) => prev.slice(0, -1));
        addMessage({ type: 'ai', text: msg, cont: i > 0 && !specialMarkers.includes(step.ai[i-1]) });
      }
    }
    await wait(300); setBusy(false); inputRef.current?.focus();
  }

  // ════════════════════════════════════════
  // USER INPUT (works for both modes)
  // ════════════════════════════════════════

  function handleSend() {
    if (busy || !inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    addMessage({ type: 'user', text });

    if (isLive) {
      sendLiveMessage(text);
    } else {
      stepRef.current++;
      if (stepRef.current < flow.length) {
        if (flow[stepRef.current].ai.includes('__ORDER__')) onCartUpdate(1);
        playAI(flow[stepRef.current]);
      }
    }
  }

  // ── File upload ──
  function triggerFileInput() { fileInputRef.current?.click(); }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadZone(false);
    setBusy(true);

    const fileName = file.name;
    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
    addMessage({ type: 'uploadProgress', fileName, fileSize });
    await wait(1400);
    setMessages((prev) => prev.filter((m) => m.type !== 'uploadProgress'));

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      addMessage({ type: 'uploadedImage', image: dataUrl, fileName });

      if (isLive) {
        // Extract base64 and mime type, send to Gemini vision
        const [header, base64] = dataUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        await wait(400);
        addMessage({ type: 'scan' });
        await sendLiveMessage('I uploaded this image. Can you identify what product this is?', base64, mimeType);
        setMessages((prev) => prev.filter((m) => m.type !== 'scan'));
      } else {
        await wait(600);
        stepRef.current++;
        if (stepRef.current < flow.length) playAI(flow[stepRef.current]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function resetDemo() {
    stepRef.current = 0;
    historyRef.current = [];
    setMessages([]); setInputValue(''); setShowUploadZone(false);
    onCartUpdate(0); setBusy(false); startedRef.current = false;
    setTimeout(() => {
      startedRef.current = true;
      if (isLive) sendInitialMessage();
      else playAI(flow[0]);
    }, 400);
  }

  function handleKeyDown(e) { if (e.key === 'Enter') handleSend(); }

  // ── Render message ──
  function renderMessage(msg, idx) {
    switch (msg.type) {
      case 'ai':
        return msg.cont ? (
          <div key={idx} className="m-cont"><div className="m-b ai-b">{msg.text}</div></div>
        ) : (
          <div key={idx} className="m m-ai"><AiAvatar /><div className="m-b ai-b">{msg.text}</div></div>
        );
      case 'user':
        return <div key={idx} className="m m-user"><div className="m-av user-av">A</div><div className="m-b user-b">{msg.text}</div></div>;
      case 'typing':
        return <div key={idx} className="typing"><AiAvatar /><div className="typing-dots"><span /><span /><span /></div></div>;
      case 'scan':
        return <div key={idx} className="scan-anim"><div className="scan-bar"><div className="scan-bar-fill" /></div><span className="scan-text">Analyzing image&hellip;</span></div>;
      case 'productCard':
        return <div key={idx} className="ch-product"><ProductCardChat product={msg.product} /></div>;
      case 'productCards':
        return <div key={idx} className="ch-products">{msg.products.map(p => <ProductCardChat key={p.id} product={p} />)}</div>;
      case 'productDetail':
        return <div key={idx} className="pd-detail-wrap"><ProductDetail product={msg.product} onExpandImage={(p, i) => setExpanded({ product: p, imgIdx: i })} /></div>;
      case 'orderSummary':
        return <div key={idx} className="ch-special"><OrderSummary productId={msg.productId} size={msg.size} /></div>;
      case 'homeAddress':
        return <div key={idx} className="ch-special"><HomeAddressCard /></div>;
      case 'officeAddress':
        return <div key={idx} className="ch-special"><OfficeAddressCard /></div>;
      case 'payment':
        return <div key={idx} className="ch-special"><PaymentCard /></div>;
      case 'processing':
        return <div key={idx} className="processing-anim"><div className="processing-spinner" /><span>Processing payment&hellip;</span></div>;
      case 'confirmation':
        return <div key={idx} className="ch-special"><ConfirmationCard /></div>;
      case 'orderStatus':
        return <div key={idx} className="ch-special"><OrderStatusCard orderId={msg.orderId} /></div>;
      case 'allOrders':
        return <div key={idx} className="ch-special"><AllOrdersCard /></div>;
      case 'uploadProgress':
        return (
          <div key={idx} className="upload-progress">
            <div className="upload-progress-row">
              <div className="upload-progress-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
              <div className="upload-progress-info"><div className="upload-progress-name">{msg.fileName}</div><div className="upload-progress-size">{msg.fileSize} MB</div></div>
            </div>
            <div className="upload-progress-bar"><div className="upload-progress-fill" /></div>
          </div>
        );
      case 'uploadedImage':
        return (
          <div key={idx} className="uploaded-img">
            <div className="uploaded-img-wrap"><img src={msg.image} alt="Uploaded" /></div>
            <div className="upload-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{msg.fileName}</div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <>
      <div className={`chat-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`chat-popup${open ? ' open' : ''}`}>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileSelected} />
        <div className="ch-head">
          <div className="ch-av">S</div>
          <div className="ch-info">
            <h3>STRIDE AI</h3>
            <span className="ch-status">{isLive ? 'Live AI' : 'Demo Mode'}</span>
          </div>
          <button className="ch-mode" onClick={() => { setIsLive(!isLive); resetDemo(); }} title={isLive ? 'Switch to scripted' : 'Switch to live AI'}>
            {isLive ? '🤖' : '📝'}
          </button>
          <button className="ch-restart" onClick={resetDemo} title="Restart conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button className="ch-close" onClick={onClose} title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="ch-msgs">
          {messages.map((msg, i) => renderMessage(msg, i))}
          {showUploadZone && (
            <div className="upload-area">
              <div className="upload-drop" onClick={triggerFileInput}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span className="upload-drop-text">Drag &amp; drop an image here</span>
                <span className="upload-drop-or">or</span>
                <button className="upload-drop-btn" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>Browse Files</button>
                <span className="upload-drop-sub">Supports JPG, PNG, HEIC</span>
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Expanded image viewer */}
        {expanded && (() => {
          const imgs = expanded.product.images || [expanded.product.image];
          const idx = expanded.imgIdx;
          return (
            <div className="pd-expanded">
              <div className="pd-expanded-header"><span>{expanded.product.name}</span><button className="pd-expanded-close" onClick={() => setExpanded(null)}>&#10005;</button></div>
              <div className="pd-expanded-body">
                <img src={imgs[idx]} alt={expanded.product.name} />
                {imgs.length > 1 && (<><button className="pd-expanded-arrow pd-expanded-prev" onClick={() => setExpanded(e => ({...e, imgIdx: (e.imgIdx-1+imgs.length)%imgs.length}))}>&#8249;</button><button className="pd-expanded-arrow pd-expanded-next" onClick={() => setExpanded(e => ({...e, imgIdx: (e.imgIdx+1)%imgs.length}))}>&#8250;</button></>)}
              </div>
              <div className="pd-expanded-thumbs">{imgs.map((img,i) => (<div key={i} className={`pd-expanded-thumb${i===idx?' active':''}`} onClick={() => setExpanded(e => ({...e,imgIdx:i}))}><img src={img} alt={`View ${i+1}`} /></div>))}</div>
            </div>
          );
        })()}

        <div className="ch-foot">
          <div className="inp-row">
            <button className="attach-btn" onClick={triggerFileInput} title="Upload image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input ref={inputRef} type="text" placeholder="Type a message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} disabled={busy} autoComplete="off" />
            <button className="send-btn" disabled={busy || !inputValue.trim()} onClick={handleSend}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
