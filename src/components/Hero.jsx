import { HERO_IMAGE } from '../data/products';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img src={HERO_IMAGE} alt="" />
      </div>
      <div className="hero-content">
        <span className="hero-tag">New Season</span>
        <h1>Step into<br />your style</h1>
        <p>From classic sneakers to everyday essentials. Find your perfect fit — or let our AI stylist do it for you.</p>
        <button className="hero-cta">Shop Collection</button>
      </div>
    </section>
  );
}
