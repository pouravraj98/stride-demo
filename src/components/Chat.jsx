import { useState, useRef, useEffect, useCallback } from 'react';
import { products } from '../data/products';
import { flow } from '../data/flow';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Sub-components ──

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

function OrderSummary() {
  const p = products[1];
  return (
    <div className="ch-card order-card">
      <div className="ch-card-head">Order Summary</div>
      <div className="ch-card-item">
        <div className="ch-card-item-img"><img src={p.image} alt={p.name} /></div>
        <div className="ch-card-item-info"><strong>{p.name}</strong><span>Size 10 &middot; Qty: 1</span></div>
        <span className="ch-card-item-price">${p.price}.00</span>
      </div>
      <div className="ch-card-divider" />
      <div className="ch-card-row"><span>Subtotal</span><span>${p.price}.00</span></div>
      <div className="ch-card-row"><span>Shipping</span><span>Free</span></div>
      <div className="ch-card-row"><span>Tax</span><span>$3.43</span></div>
      <div className="ch-card-divider" />
      <div className="ch-card-row total"><span>Total</span><span>$58.43</span></div>
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
      <div className="confirm-num">#ST-7293</div>
      <div className="ch-card-divider" />
      <div className="ch-card-row"><span>Item</span><span>White Court Sneaker &middot; Size 10</span></div>
      <div className="ch-card-row"><span>Total</span><span>$58.43</span></div>
      <div className="ch-card-row"><span>Delivery</span><span>Wed, April 9</span></div>
      <div className="ch-card-row"><span>Tracking</span><span>alex@email.com</span></div>
    </div>
  );
}

// ── Main Chat ──

export default function Chat({ open, onClose, onCartUpdate, onShowFinale }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const stepRef = useRef(0);
  const msgsEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const startedRef = useRef(false);

  const scrollBottom = useCallback(() => {
    setTimeout(() => msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      setTimeout(() => playAI(flow[0]), 500);
    }
  }, [open]);

  useEffect(() => { scrollBottom(); }, [messages, scrollBottom]);

  // ── Play AI messages ──
  async function playAI(step) {
    setBusy(true);

    if (step.showUpload) {
      for (const msg of step.ai) {
        addMessage({ type: 'typing' });
        await wait(800);
        setMessages((prev) => prev.slice(0, -1));
        addMessage({ type: 'ai', text: msg });
      }
      await wait(300);
      setShowUploadZone(true);
      setBusy(false);
      return;
    }

    const specialMarkers = ['__SCAN__', '__PRODUCT_0__', '__PRODUCTS_1_2__', '__ORDER__', '__HOME_ADDRESS__', '__OFFICE_ADDRESS__', '__PAYMENT__', '__PROCESSING__', '__CONFIRMED__'];

    for (let i = 0; i < step.ai.length; i++) {
      const msg = step.ai[i];
      await wait(i === 0 ? 500 : 400);

      if (msg === '__SCAN__') {
        addMessage({ type: 'scan' });
        await wait(2500);
        setMessages((prev) => prev.filter((m) => m.type !== 'scan'));
      } else if (msg.startsWith('__PRODUCT_') && !msg.includes('PRODUCTS')) {
        const idx = parseInt(msg.replace('__PRODUCT_', '').replace('__', ''));
        addMessage({ type: 'productCard', product: products[idx] });
      } else if (msg.startsWith('__PRODUCTS_')) {
        const indices = msg.replace('__PRODUCTS_', '').replace('__', '').split('_').map(Number);
        addMessage({ type: 'productCards', products: indices.map((j) => products[j]) });
      } else if (msg === '__ORDER__') {
        addMessage({ type: 'orderSummary' });
      } else if (msg === '__HOME_ADDRESS__') {
        addMessage({ type: 'homeAddress' });
      } else if (msg === '__OFFICE_ADDRESS__') {
        addMessage({ type: 'officeAddress' });
      } else if (msg === '__PAYMENT__') {
        addMessage({ type: 'payment' });
      } else if (msg === '__PROCESSING__') {
        addMessage({ type: 'processing' });
        await wait(2000);
        setMessages((prev) => prev.filter((m) => m.type !== 'processing'));
      } else if (msg === '__CONFIRMED__') {
        onCartUpdate(0);
        addMessage({ type: 'confirmation' });
      } else {
        addMessage({ type: 'typing' });
        await wait(Math.min(1800, 500 + msg.length * 5));
        setMessages((prev) => prev.slice(0, -1));
        addMessage({ type: 'ai', text: msg, cont: i > 0 && !specialMarkers.includes(step.ai[i - 1]) });
      }
    }

    await wait(300);
    setBusy(false);
    inputRef.current?.focus();
  }

  // ── Send message ──
  function handleSend() {
    if (busy || !inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    addMessage({ type: 'user', text });
    stepRef.current++;

    if (stepRef.current < flow.length) {
      if (flow[stepRef.current].ai.includes('__ORDER__')) onCartUpdate(1);
      playAI(flow[stepRef.current]);
    }
  }

  // ── File upload via native Finder ──
  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowUploadZone(false);
    setBusy(true);

    // Show progress with real filename
    const fileName = file.name;
    const fileSize = (file.size / (1024 * 1024)).toFixed(1);
    addMessage({ type: 'uploadProgress', fileName, fileSize });
    await wait(1400);
    setMessages((prev) => prev.filter((m) => m.type !== 'uploadProgress'));

    // Read the actual file and display it
    const reader = new FileReader();
    reader.onload = async (ev) => {
      addMessage({ type: 'uploadedImage', image: ev.target.result, fileName });
      await wait(600);
      stepRef.current++;
      if (stepRef.current < flow.length) {
        playAI(flow[stepRef.current]);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be picked again
    e.target.value = '';
  }

  function resetDemo() {
    stepRef.current = 0;
    setMessages([]);
    setInputValue('');
    setShowUploadZone(false);
    onCartUpdate(0);
    setBusy(false);
    startedRef.current = false;
    setTimeout(() => {
      startedRef.current = true;
      playAI(flow[0]);
    }, 400);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend();
  }

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
        return (
          <div key={idx} className="m m-user">
            <div className="m-av user-av">A</div>
            <div className="m-b user-b">{msg.text}</div>
          </div>
        );
      case 'typing':
        return (
          <div key={idx} className="typing"><AiAvatar /><div className="typing-dots"><span /><span /><span /></div></div>
        );
      case 'scan':
        return (
          <div key={idx} className="scan-anim">
            <div className="scan-bar"><div className="scan-bar-fill" /></div>
            <span className="scan-text">Analyzing image&hellip;</span>
          </div>
        );
      case 'productCard':
        return <div key={idx} className="ch-product"><ProductCardChat product={msg.product} /></div>;
      case 'productCards':
        return (
          <div key={idx} className="ch-products">
            {msg.products.map((p) => <ProductCardChat key={p.id} product={p} />)}
          </div>
        );
      case 'orderSummary':
        return <div key={idx} className="ch-special"><OrderSummary /></div>;
      case 'homeAddress':
        return <div key={idx} className="ch-special"><HomeAddressCard /></div>;
      case 'officeAddress':
        return <div key={idx} className="ch-special"><OfficeAddressCard /></div>;
      case 'payment':
        return <div key={idx} className="ch-special"><PaymentCard /></div>;
      case 'processing':
        return (
          <div key={idx} className="processing-anim">
            <div className="processing-spinner" />
            <span>Processing payment&hellip;</span>
          </div>
        );
      case 'confirmation':
        return <div key={idx} className="ch-special"><ConfirmationCard /></div>;
      case 'uploadProgress':
        return (
          <div key={idx} className="upload-progress">
            <div className="upload-progress-row">
              <div className="upload-progress-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              </div>
              <div className="upload-progress-info">
                <div className="upload-progress-name">{msg.fileName}</div>
                <div className="upload-progress-size">{msg.fileSize} MB</div>
              </div>
            </div>
            <div className="upload-progress-bar"><div className="upload-progress-fill" /></div>
          </div>
        );
      case 'uploadedImage':
        return (
          <div key={idx} className="uploaded-img">
            <div className="uploaded-img-wrap"><img src={msg.image} alt="Uploaded" /></div>
            <div className="upload-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {msg.fileName}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <div className={`chat-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`chat-popup${open ? ' open' : ''}`}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileSelected}
        />

        {/* Header */}
        <div className="ch-head">
          <div className="ch-av">S</div>
          <div className="ch-info">
            <h3>STRIDE AI</h3>
            <span className="ch-status">Online</span>
          </div>
          <button className="ch-restart" onClick={resetDemo} title="Restart conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button className="ch-close" onClick={onClose} title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Messages */}
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

        {/* Footer — no chips, just input */}
        <div className="ch-foot">
          <div className="inp-row">
            <button className="attach-btn" onClick={triggerFileInput} title="Upload image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={busy}
              autoComplete="off"
            />
            <button className="send-btn" disabled={busy || !inputValue.trim()} onClick={handleSend}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
