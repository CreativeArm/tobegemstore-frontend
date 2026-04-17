import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaWandMagicSparkles,
  FaShieldHalved,
  FaTruck,
  FaArrowsRotate,
} from "react-icons/fa6";
import { productAPI } from "../utils/api";
import ProductCard from "../components/product/ProductCard";
import "./HomePage.css";

const categories = [
  { label: "Earrings", value: "earrings", icon: "◉", color: "#c9a84c" },
  { label: "Necklaces", value: "necklaces", icon: "◈", color: "#9d62c2" },
  { label: "Bracelets", value: "bracelets", icon: "◌", color: "#c9a84c" },
  { label: "Rings", value: "rings", icon: "◎", color: "#e8c97a" },
  { label: "Wristwatches", value: "wristwatches", icon: "⊡", color: "#9d62c2" },
  { label: "Lip Gloss", value: "lipgloss", icon: "◆", color: "#c9a84c" },
  { label: "Anklets", value: "anklets", icon: "⊕", color: "#e8c97a" },
  {
    label: "Hair Accessories",
    value: "hair-accessories",
    icon: "✦",
    color: "#9d62c2",
  },
];

const perks = [
  {
    icon: <FaTruck size={22} />,
    title: "Free Shipping",
    desc: "On orders over ₦50,000",
  },
  {
    icon: <FaShieldHalved size={22} />,
    title: "Authentic Quality",
    desc: "Certified luxury pieces",
  },
  {
    icon: <FaArrowsRotate size={22} />,
    title: "7-Day Returns",
    desc: "Hassle-free returns",
  },
  {
    icon: <FaWandMagicSparkles size={22} />,
    title: "Gift Wrapping",
    desc: "Complimentary for all orders",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [featRes, bestRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getAll({ bestseller: true, limit: 4 }),
        ]);
        setFeatured(featRes.data.products.slice(0, 4));
        setBestsellers(bestRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Parallax on hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.setProperty("--parallax-y", `${scrollY * 0.3}px`);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  "--delay": `${i * 0.3}s`,
                  "--x": `${Math.random() * 100}%`,
                  "--y": `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="hero-content container">
          <div className="hero-eyebrow">
            <span className="eyebrow-gem">◆</span>
            <span>New Collection 2026</span>
          </div>
          <h1 className="hero-title">
            Adorned in <br />
            <em>Pure Luxury</em>
          </h1>
          <p className="hero-subtitle">
            Discover handpicked jewelry, accessories & beauty essentials crafted
            for the modern goddess.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-gold btn-lg">
              Shop Collection <FaArrowRight size={18} />
            </Link>
            <Link to="/shop?featured=true" className="btn btn-ghost btn-lg">
              View Featured
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>5K+</strong>
              <span>Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>200+</strong>
              <span>Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>4.9★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== PERKS STRIP ===== */}
      <section className="perks-strip">
        <div className="container perks-grid">
          {perks.map((p, i) => (
            <div key={i} className="perk-item">
              <span className="perk-icon">{p.icon}</span>
              <div>
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section container home-categories">
        <div className="section-label">Categories</div>
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/shop/${cat.value}`}
              className="category-card"
            >
              <span
                className="category-icon"
                style={{ "--cat-color": cat.color }}
              >
                {cat.icon}
              </span>
              <span className="category-label">{cat.label}</span>
              <FaArrowRight size={14} className="category-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section container home-featured">
        <div className="section-header">
          <div>
            <div className="section-label">Handpicked</div>
            <h2 className="section-title">Featured Collection</h2>
          </div>
          <Link to="/shop?featured=true" className="btn btn-outline btn-sm">
            View All <FaArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="products-grid home-featured-grid">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="skeleton home-featured-skeleton"
              />
            ))}
          </div>
        ) : (
          <div className="products-grid home-featured-grid">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ===== BANNER ===== */}
      <section className="promo-banner">
        <div className="banner-glow" />
        <div className="container banner-content">
          <p className="banner-eyebrow">Limited Time Offer</p>
          <h2 className="banner-title">Free Shipping on Orders Over ₦50,000</h2>
          <p className="banner-sub">
            Plus enjoy up to 30% off on selected items this season
          </p>
          <Link to="/shop" className="btn btn-gold btn-lg">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ===== BESTSELLERS ===== */}
      <section className="section container">
        <div className="section-header">
          <div>
            <div className="section-label">Top Picks</div>
            <h2 className="section-title">Bestsellers</h2>
          </div>
          <Link to="/shop?bestseller=true" className="btn btn-outline btn-sm">
            View All <FaArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 420, borderRadius: "var(--radius-lg)" }}
              />
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {bestsellers.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ===== TESTIMONIAL ===== */}
      <section className="section container testimonials-section">
        <div className="section-label">Testimonials</div>
        <h2
          className="section-title"
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          What Our Clients Say
        </h2>
        <div className="testimonials-grid">
          {[
            {
              name: "Amaka O.",
              rating: 5,
              text: "Absolutely gorgeous earrings! The quality is outstanding and delivery was so fast. Will definitely shop again.",
            },
            {
              name: "Chidinma E.",
              rating: 5,
              text: "My wristwatch arrived beautifully packaged. Looks even better in person. TobegemStore never disappoints!",
            },
            {
              name: "Ngozi A.",
              rating: 5,
              text: "The pearl necklace I bought for my wedding was stunning. Got so many compliments. 10/10 recommend!",
            },
          ].map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="stars" style={{ fontSize: 14, marginBottom: 12 }}>
                {"★".repeat(t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name[0]}</div>
                <span>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
