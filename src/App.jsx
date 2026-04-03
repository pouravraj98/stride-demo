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

      {/* AI FAB */}
      <button
        className={`ai-fab${chatOpen ? ' hidden' : ''}`}
        onClick={() => setChatOpen(true)}
        title="Ask AI Stylist"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          <path d="M8 10h.01M12 10h.01M16 10h.01"/>
        </svg>
      </button>

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
