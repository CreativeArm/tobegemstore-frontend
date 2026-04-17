import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
} from 'react-icons/fa6';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-gem">◆</span>
              <span>Tobegem<span style={{ color: 'var(--gold)' }}>Store</span></span>
            </Link>
            <p className="footer-tagline">
              Curated luxury accessories for the modern woman. Every piece tells a story.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link"><FaInstagram size={18} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link"><FaFacebookF size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link"><FaXTwitter size={18} /></a>
            </div>
          </div>

          {/* Shop */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              {[['Earrings','earrings'],['Necklaces','necklaces'],['Bracelets','bracelets'],['Rings','rings'],['Wristwatches','wristwatches'],['Lip Gloss','lipgloss']].map(([label,val]) => (
                <li key={val}><Link to={`/shop/${val}`}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="footer-col">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/profile">Profile Settings</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact">
              <li><FaEnvelope size={15} /><a href="mailto:hello@tobegemstore.com">hello@tobegemstore.com</a></li>
              <li><FaPhone size={15} /><a href="tel:+2348000000000">+234 800 000 0000</a></li>
              <li><FaLocationDot size={15} /><span>Lagos, Nigeria</span></li>
            </ul>
            <div className="footer-newsletter">
              <p>Get exclusive deals in your inbox</p>
              <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Your email address" className="newsletter-input" />
                <button type="submit" className="btn btn-gold btn-sm">Join</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TobegemStore. All rights reserved.</p>
          <div className="footer-badges">
            <span className="payment-badge">🔒 Secure Payments</span>
            <span className="payment-badge">🚚 Fast Delivery</span>
            <span className="payment-badge">✨ Quality Assured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
