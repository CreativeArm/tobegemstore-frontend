import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaXmark,
  FaPlus,
  FaMinus,
  FaBagShopping,
  FaTrashCan,
  FaArrowRight,
} from 'react-icons/fa6';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './CartModal.css';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export default function CartModal() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, shipping, total, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <FaBagShopping size={20} />
            <h2>Your Cart <span className="cart-count">{itemCount}</span></h2>
          </div>
          <button className="icon-btn" onClick={() => setIsOpen(false)}>
            <FaXmark size={20} />
          </button>
        </div>

        {/* Empty */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">◇</div>
            <h3>Your cart is empty</h3>
            <p>Discover our beautiful collection and add something special</p>
            <Link to="/shop" className="btn btn-gold" onClick={() => setIsOpen(false)}>
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="cart-items">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="cart-item">
                  <Link to={`/product/${item.slug || item.productId}`} onClick={() => setIsOpen(false)} className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </Link>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <Link to={`/product/${item.slug || item.productId}`} onClick={() => setIsOpen(false)} className="cart-item-name">
                          {item.name}
                        </Link>
                        {(item.color || item.size) && (
                          <p className="cart-item-variant">
                            {item.color && `Color: ${item.color}`}{item.color && item.size && ' · '}{item.size && `Size: ${item.size}`}
                          </p>
                        )}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                      >
                        <FaTrashCan size={14} />
                      </button>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}>
                          <FaMinus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <span className="cart-item-price">{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'free-shipping' : ''}>
                  {shipping === 0 ? 'FREE' : fmt(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="free-shipping-hint">
                  Add {fmt(50000 - subtotal)} more for free shipping
                </p>
              )}
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>

              <button className="btn btn-gold btn-full btn-lg checkout-btn" onClick={handleCheckout}>
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                <FaArrowRight size={16} />
              </button>

              <Link to="/shop" className="continue-shopping" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
