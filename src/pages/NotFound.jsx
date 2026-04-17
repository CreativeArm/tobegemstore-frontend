import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 300, color: 'var(--gold)', opacity: 0.3, lineHeight: 1 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 400, lineHeight: 1.7 }}>
        The page you're looking for doesn't exist. Perhaps you'd like to explore our collection instead.
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-gold">Go Home</Link>
        <Link to="/shop" className="btn btn-outline">Browse Shop</Link>
      </div>
    </div>
  );
}
