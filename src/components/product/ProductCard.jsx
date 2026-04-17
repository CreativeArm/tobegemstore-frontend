import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaBagShopping, FaEye } from 'react-icons/fa6';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

const formatPrice = (n) => `₦${Number(n).toLocaleString()}`;

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please sign in to save items'); return; }
    try {
      await userAPI.toggleWishlist(product._id);
      setWishlisted(p => !p);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const discountPct = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const stars = '★'.repeat(Math.round(product.rating || 0)) + '☆'.repeat(5 - Math.round(product.rating || 0));
  const primaryImage = product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image';
  const secondaryImage = product.images?.[1]?.url || primaryImage;

  return (
    <Link to={`/product/${product.slug || product._id}`} className="product-card">
      <div className="product-image-wrap">
        {!imgLoaded && <div className="skeleton product-img-skeleton" />}
        <img
          src={primaryImage}
          alt={product.name}
          className={`product-img ${imgLoaded ? 'loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
        />
        <img
          src={secondaryImage}
          alt={product.name}
          className={`product-img product-img-secondary ${imgLoaded ? 'loaded' : ''}`}
        />

        {/* Badges */}
        <div className="product-badges">
          {product.isNew && <span className="badge badge-new">New</span>}
          {discountPct > 0 && <span className="badge badge-sale">-{discountPct}%</span>}
          {product.isBestseller && <span className="badge badge-gold">Bestseller</span>}
        </div>

        {/* Stock Warning */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="low-stock-warning">Only {product.stock} left!</div>
        )}
        {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}

        {/* Hover Actions */}
        <div className="product-actions">
          <button
            className={`action-btn wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Add to Wishlist"
          >
            <FaHeart size={16} />
          </button>
          <Link
            to={`/product/${product.slug || product._id}`}
            className="action-btn"
            onClick={e => e.stopPropagation()}
            title="Quick View"
          >
            <FaEye size={16} />
          </Link>
          <button
            className="action-btn cart-action-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            title="Add to Cart"
          >
            <FaBagShopping size={16} />
          </button>
        </div>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        {product.rating > 0 && (
          <div className="product-rating">
            <span className="stars" style={{ fontSize: 12 }}>{stars}</span>
            <span className="rating-count">({product.numReviews})</span>
          </div>
        )}

        <div className="product-pricing">
          <span className="price">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="price-compare">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        <button
          className="btn btn-gold btn-sm add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FaBagShopping size={14} />
          {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
