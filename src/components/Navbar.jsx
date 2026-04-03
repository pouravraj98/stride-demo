export default function Navbar({ cartCount }) {
  return (
    <nav className="nav">
      <span className="nav-logo">STRIDE</span>
      <div className="nav-links">
        <a className="active">Shop</a>
        <a>Sneakers</a>
        <a>Apparel</a>
        <a>New Arrivals</a>
      </div>
      <div className="nav-actions">
        <button className="nav-icon" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button className="nav-icon cart-wrap" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span className={`cart-badge${cartCount > 0 ? ' show' : ''}`}>{cartCount}</span>
        </button>
        <span className="nav-user">A</span>
      </div>
    </nav>
  );
}
