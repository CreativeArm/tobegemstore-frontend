import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FaBagShopping,
  FaMagnifyingGlass,
  FaUser,
  FaHeart,
  FaBars,
  FaXmark,
  FaChevronDown,
  FaRightFromBracket,
  FaBox,
  FaGear,
} from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const categories = [
  { label: 'Earrings', value: 'earrings' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Bracelets', value: 'bracelets' },
  { label: 'Rings', value: 'rings' },
  { label: 'Wristwatches', value: 'wristwatches' },
  { label: 'Lip Gloss', value: 'lipgloss' },
  { label: 'Anklets', value: 'anklets' },
  { label: 'Hair Accessories', value: 'hair-accessories' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, setIsOpen } = useCart();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const shopRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (shopRef.current && !shopRef.current.contains(e.target)) setShopOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-gem">◆</span>
            <span className="logo-text">Tobegem<span>Store</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>

            <div className="nav-dropdown" ref={shopRef}>
              <button className="nav-link dropdown-trigger" onClick={() => setShopOpen(p => !p)}>
                Shop <FaChevronDown size={14} className={shopOpen ? 'rotated' : ''} />
              </button>
              {shopOpen && (
                <div className="dropdown-menu">
                  <Link to="/shop" className="dropdown-item all" onClick={() => setShopOpen(false)}>
                    All Products
                  </Link>
                  <div className="dropdown-divider" />
                  {categories.map(cat => (
                    <Link
                      key={cat.value}
                      to={`/shop/${cat.value}`}
                      className="dropdown-item"
                      onClick={() => setShopOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/shop?featured=true" className="nav-link">Featured</NavLink>
            <NavLink to="/shop?new=true" className="nav-link">New Arrivals</NavLink>
          </div>

          {/* Toolbar: hidden on mobile except hamburger — full set in slide-out drawer */}
          <div className="navbar-icons">
            <div className="navbar-toolbar-desktop">
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(p => !p)} aria-label="Search">
                <FaMagnifyingGlass size={18} />
              </button>

              <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
                <FaHeart size={18} />
              </Link>

              <button type="button" className="icon-btn cart-btn" onClick={() => setIsOpen(true)} aria-label="Cart">
                <FaBagShopping size={18} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </button>

              {isAuthenticated ? (
                <div className="nav-dropdown" ref={userRef}>
                  <button type="button" className="icon-btn user-btn" onClick={() => setUserOpen(p => !p)}>
                    <FaUser size={18} />
                    <span className="user-name">{user?.firstName}</span>
                  </button>
                  {userOpen && (
                    <div className="dropdown-menu user-dropdown">
                      <div className="dropdown-header">
                        <p className="dropdown-name">{user?.firstName} {user?.lastName}</p>
                        <p className="dropdown-email">{user?.email}</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item" onClick={() => setUserOpen(false)}>
                        <FaGear size={14} /> My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setUserOpen(false)}>
                        <FaBox size={14} /> My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setUserOpen(false)}>
                        <FaHeart size={14} /> Wishlist
                      </Link>
                      <div className="dropdown-divider" />
                      <button type="button" className="dropdown-item danger" onClick={() => { logout(); setUserOpen(false); }}>
                        <FaRightFromBracket size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm nav-signin-desktop">
                  Sign In
                </Link>
              )}
            </div>

            <button
              type="button"
              className="icon-btn mobile-toggle"
              onClick={() => setMobileOpen(p => !p)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              {mobileOpen ? <FaXmark size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="search-bar">
            <form onSubmit={handleSearch} className="search-form container">
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search earrings, necklaces, watches..."
                className="search-input"
              />
              <button type="submit" className="btn btn-gold btn-sm">Search</button>
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)}>
                <FaXmark size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile slide-in drawer (from left) */}
        <div
          className={`mobile-drawer-overlay ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden={!mobileOpen}
        >
          <aside
            id="mobile-drawer"
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-top">
              <span className="mobile-drawer-title">Menu</span>
              <button
                type="button"
                className="icon-btn mobile-drawer-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <FaXmark size={22} />
              </button>
            </div>

            <div className="mobile-drawer-quick">
              <button
                type="button"
                className="mobile-drawer-quick-btn"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
              >
                <FaMagnifyingGlass size={20} />
                <span>Search</span>
              </button>
              <Link
                to="/wishlist"
                className="mobile-drawer-quick-btn"
                onClick={() => setMobileOpen(false)}
              >
                <FaHeart size={20} />
                <span>Wishlist</span>
              </Link>
              <button
                type="button"
                className="mobile-drawer-quick-btn mobile-drawer-cart"
                onClick={() => {
                  setMobileOpen(false);
                  setIsOpen(true);
                }}
              >
                <FaBagShopping size={20} />
                <span>Cart</span>
                {itemCount > 0 && <span className="mobile-drawer-cart-badge">{itemCount}</span>}
              </button>
            </div>

            <nav className="mobile-drawer-nav" aria-label="Main">
              <NavLink
                to="/"
                className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                end
              >
                Home
              </NavLink>
              <Link to="/shop" className="mobile-link" onClick={() => setMobileOpen(false)}>
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  to={`/shop/${cat.value}`}
                  className="mobile-link sub"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
              <Link to="/shop?featured=true" className="mobile-link" onClick={() => setMobileOpen(false)}>
                Featured
              </Link>
              <Link to="/shop?new=true" className="mobile-link" onClick={() => setMobileOpen(false)}>
                New Arrivals
              </Link>
            </nav>

            <div className="mobile-drawer-account">
              {isAuthenticated ? (
                <>
                  <div className="mobile-drawer-user">
                    <FaUser size={18} />
                    <div>
                      <p className="mobile-drawer-user-name">{user?.firstName} {user?.lastName}</p>
                      <p className="mobile-drawer-user-email">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="mobile-link" onClick={() => setMobileOpen(false)}>
                    <FaGear size={16} /> My Profile
                  </Link>
                  <Link to="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>
                    <FaBox size={16} /> My Orders
                  </Link>
                  <button
                    type="button"
                    className="mobile-link danger"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    <FaRightFromBracket size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-outline btn-sm mobile-drawer-signin" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </aside>
        </div>
      </nav>
      <div className="navbar-spacer" />
    </>
  );
}
