import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaBagShopping,
  FaHeart,
  FaShieldHalved,
  FaTruck,
  FaArrowsRotate,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
} from 'react-icons/fa6';
import { productAPI, userAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import './ProductPage.css';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getBySlug(slug);
        setProduct(data.product);
        // Load related
        const relRes = await productAPI.getAll({ category: data.product.category, limit: 4 });
        setRelated(relRes.data.products.filter(p => p._id !== data.product._id).slice(0, 4));
        // Set defaults
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0].name);
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor || null, selectedSize || null);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setWishlisted(p => !p);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡');
    } catch { toast.error('Failed'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await productAPI.addReview(product._id, reviewForm);
      toast.success('Review submitted!');
      const { data } = await productAPI.getBySlug(slug);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const nextImg = () => setImgIdx(i => (i + 1) % (product.images?.length || 1));
  const prevImg = () => setImgIdx(i => (i - 1 + (product.images?.length || 1)) % (product.images?.length || 1));

  const discountPct = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const stars = (rating) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  if (loading) return <div className="loading-screen" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;
  if (!product) return <div className="loading-screen"><p>Product not found</p></div>;

  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main Product */}
        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`gallery-thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={img.url} alt={img.alt || product.name} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="gallery-main">
              <img
                src={product.images?.[imgIdx]?.url || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="gallery-img"
              />
              {/* Badges */}
              <div className="gallery-badges">
                {product.isNew && <span className="badge badge-new">New</span>}
                {discountPct > 0 && <span className="badge badge-sale">-{discountPct}%</span>}
                {product.isBestseller && <span className="badge badge-gold">Bestseller</span>}
              </div>
              {product.images?.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImg}><FaChevronLeft size={20} /></button>
                  <button className="gallery-nav next" onClick={nextImg}><FaChevronRight size={20} /></button>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="product-info-panel">
            <p className="product-cat-label">{product.category}</p>
            <h1 className="product-main-title">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="product-rating-row">
                <span className="stars" style={{ fontSize: 16 }}>{stars(product.rating)}</span>
                <span className="rating-val">{product.rating}</span>
                <span className="rating-num">({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="product-price-block">
              <span className="product-main-price">{fmt(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="product-compare-price">{fmt(product.comparePrice)}</span>
                  <span className="discount-badge">-{discountPct}% OFF</span>
                </>
              )}
            </div>

            <p className="product-short-desc">{product.shortDescription}</p>

            <div className="divider" />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="variant-group">
                <p className="variant-label">Color: <strong>{selectedColor}</strong></p>
                <div className="color-options">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      className={`color-swatch ${selectedColor === c.name ? 'active' : ''}`}
                      style={{ background: c.hex || c.name }}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="variant-group">
                <p className="variant-label">Size: <strong>{selectedSize}</strong></p>
                <div className="size-options">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="variant-group">
              <p className="variant-label">Quantity</p>
              <div className="qty-row">
                <div className="qty-control-lg">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><FaMinus size={14} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}><FaPlus size={14} /></button>
                </div>
                <span className={`stock-info ${product.stock <= 5 ? 'low' : ''}`}>
                  {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions-row">
              <button
                className="btn btn-gold btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FaBagShopping size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                className={`btn btn-outline wishlist-toggle ${wishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
                title="Add to Wishlist"
              >
                <FaHeart size={18} />
              </button>
            </div>

            {/* Perks */}
            <div className="product-perks">
              <div className="perk"><FaTruck size={15} /><span>Free shipping over ₦50,000</span></div>
              <div className="perk"><FaShieldHalved size={15} /><span>Authentic quality guaranteed</span></div>
              <div className="perk"><FaArrowsRotate size={15} /><span>7-day easy returns</span></div>
            </div>

            {/* Meta */}
            {product.material && <p className="product-meta">Material: <strong>{product.material}</strong></p>}
            {product.brand && <p className="product-meta">Brand: <strong>{product.brand}</strong></p>}
            {product.sku && <p className="product-meta">SKU: <strong>{product.sku}</strong></p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tab-nav">
            {['description', 'features', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && <span className="tab-count">({product.numReviews})</span>}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>{product.description}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="tab-pane">
                {product.features?.length > 0 ? (
                  <ul className="features-list">
                    {product.features.map((f, i) => <li key={i}><span>✦</span>{f}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No additional features listed.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane reviews-tab">
                {/* Review Form */}
                {isAuthenticated && (
                  <form onSubmit={handleReview} className="review-form">
                    <h3>Write a Review</h3>
                    <div className="rating-input">
                      {[5,4,3,2,1].map(r => (
                        <button key={r} type="button" className={`star-btn ${reviewForm.rating >= r ? 'active' : ''}`} onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>★</button>
                      ))}
                    </div>
                    <textarea className="input-field" rows="4" placeholder="Share your experience with this product..." value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} required />
                    <button type="submit" className="btn btn-gold" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {product.reviews?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
                  ) : (
                    product.reviews.map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-avatar">{r.name[0]}</div>
                          <div>
                            <strong>{r.name}</strong>
                            <div className="stars" style={{ fontSize: 12 }}>{stars(r.rating)}</div>
                          </div>
                          <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-section">
            <div className="section-label">You May Also Like</div>
            <h2 className="section-title" style={{ marginBottom: 32, marginTop: 8 }}>Related Products</h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
