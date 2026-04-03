import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Chat from './components/Chat';
import Finale from './components/Finale';
import './App.css';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showFinale, setShowFinale] = useState(false);

  return (
    <>
      <Navbar cartCount={cartCount} />
      <Hero />

      {/* Trust bar */}
      <div className="trust">
        <span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Free Shipping Over $50
        </span>
        <span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          30-Day Returns
        </span>
        <span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Authentic Products
        </span>
      </div>

      <ProductGrid />

      {/* AI Floating Bar */}
      <div className={`ai-bar${chatOpen ? ' hidden' : ''}`} onClick={() => setChatOpen(true)}>
        <div className="ai-bar-preview">
          <div className="ai-bar-preview-avatar">S</div>
          <div className="ai-bar-preview-msg">
            Hey! I'm your STRIDE stylist. I can identify products from a photo, find your perfect fit, or put together a look. What can I help with?
          </div>
        </div>
        <div className="ai-bar-inner">
          <div className="ai-bar-left">
            <div className="ai-bar-avatar">S</div>
            <div className="ai-bar-info">
              <div className="ai-bar-name">STRIDE AI <span className="ai-bar-status">Online</span></div>
              <div className="ai-bar-desc">Find products, identify shoes from a photo, or get styled</div>
            </div>
          </div>
          <div className="ai-bar-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span>Ask me anything...</span>
          </div>
        </div>
      </div>

      {/* Chat */}
      <Chat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onCartUpdate={setCartCount}
        onShowFinale={() => setShowFinale(true)}
      />

      {/* Finale */}
      <Finale show={showFinale} />
    </>
  );
}
