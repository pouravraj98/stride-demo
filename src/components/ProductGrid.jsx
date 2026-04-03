import { products } from '../data/products';

function ProductCard({ product }) {
  return (
    <div className="pcard">
      {product.badge && (
        <div className={`pcard-badge${product.badge === 'New' ? ' new' : ''}`}>
          {product.badge}
        </div>
      )}
      <div className="pcard-img">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="pcard-body">
        <div className="pcard-cat">{product.category}</div>
        <div className="pcard-name">{product.name}</div>
        <div className="pcard-rat">
          <span className="star">&#9733;</span> {product.rating} ({product.reviews})
        </div>
        <div className="pcard-bottom">
          <span className="pcard-price">${product.price}</span>
          <button className="pcard-atc">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <section className="section">
      <div className="sec-head">
        <h2>Bestsellers</h2>
        <a href="#">View All &rarr;</a>
      </div>
      <div className="pgrid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
