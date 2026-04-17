// WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa6';
import { userAPI } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    userAPI.getWishlist()
      .then(r => setWishlist(r.data.wishlist))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <FaHeart size={60} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 20px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-secondary)', marginBottom: 12 }}>Sign in to see your wishlist</h2>
        <Link to="/login" className="btn btn-gold" style={{ marginTop: 8 }}>Sign In</Link>
      </div>
    );
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      <div className="section-label" style={{ marginBottom: 8 }}>Saved Items</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 400, marginBottom: 40 }}>My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <FaHeart size={60} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--text-secondary)', marginBottom: 12 }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Save items you love by clicking the heart icon</p>
          <Link to="/shop" className="btn btn-gold">Browse Collection</Link>
        </div>
      ) : (
        <div className="products-grid">
          {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
