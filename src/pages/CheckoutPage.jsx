import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaLocationDot,
  FaArrowRight,
  FaCreditCard,
  FaRegNoteSticky,
  FaBoxOpen,
  FaNairaSign,
  FaGlobe,
  FaBuildingColumns,
  FaLock,
} from 'react-icons/fa6';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [notes, setNotes] = useState('');

  const set = (k) => (e) => setAddress(a => ({ ...a, [k]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state'];
    for (const field of required) {
      if (!address[field]) { toast.error(`Please fill in your ${field}`); return; }
    }

    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        color: i.color,
        size: i.size
      }));

      const { data } = await orderAPI.create({
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        pricing: { subtotal, shipping, tax: 0, discount: 0, total },
        notes
      });

      clearCart();
      navigate(`/payment/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h2>Your cart is empty</h2>
          <button className="btn btn-gold" onClick={() => navigate('/shop')} style={{ marginTop: 20 }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <div className="section-label">Checkout</div>
          <h1 className="checkout-title">Complete Your Order</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* LEFT: Shipping & Payment */}
          <div className="checkout-left">
            {/* Shipping Address */}
            <div className="checkout-section">
              <h3 className="checkout-section-title"><FaLocationDot size={18} /> Shipping Address</h3>
              <div className="checkout-form-grid">
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input className="input-field" value={address.firstName} onChange={set('firstName')} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input className="input-field" value={address.lastName} onChange={set('lastName')} required />
                </div>
                <div className="input-group full">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input-field" value={address.email} onChange={set('email')} required />
                </div>
                <div className="input-group full">
                  <label className="input-label">Phone Number</label>
                  <input type="tel" className="input-field" placeholder="+234 800 000 0000" value={address.phone} onChange={set('phone')} required />
                </div>
                <div className="input-group full">
                  <label className="input-label">Street Address</label>
                  <input className="input-field" placeholder="123 Main St, Apartment 4B" value={address.street} onChange={set('street')} required />
                </div>
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input className="input-field" value={address.city} onChange={set('city')} required />
                </div>
                <div className="input-group">
                  <label className="input-label">State</label>
                  <input className="input-field" value={address.state} onChange={set('state')} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Country</label>
                  <input className="input-field" value={address.country} onChange={set('country')} required />
                </div>
                <div className="input-group">
                  <label className="input-label">ZIP / Postal Code</label>
                  <input className="input-field" value={address.zipCode} onChange={set('zipCode')} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3 className="checkout-section-title"><FaCreditCard size={18} /> Payment Method</h3>
              <div className="payment-options">
                {[
                  { value: 'paystack', label: 'Paystack', desc: 'Pay with card, bank transfer or USSD via Paystack', icon: <FaNairaSign size={16} /> },
                  { value: 'paypal', label: 'PayPal', desc: 'Pay securely with your PayPal account', icon: <FaGlobe size={16} /> },
                  { value: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct transfer to our bank account', icon: <FaBuildingColumns size={16} /> },
                ].map(opt => (
                  <label key={opt.value} className={`payment-option ${paymentMethod === opt.value ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={e => setPaymentMethod(e.target.value)} />
                    <span className="payment-icon">{opt.icon}</span>
                    <div>
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="checkout-section">
              <h3 className="checkout-section-title"><FaRegNoteSticky size={18} /> Order Notes (Optional)</h3>
              <textarea className="input-field" rows="3" placeholder="Any special instructions for your order?" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="checkout-right">
            <div className="order-summary">
              <h3 className="checkout-section-title"><FaBoxOpen size={18} /> Order Summary</h3>

              <div className="summary-items">
                {items.map(item => (
                  <div key={`${item.productId}-${item.color}-${item.size}`} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <p className="summary-item-name">{item.name}</p>
                      {(item.color || item.size) && (
                        <p className="summary-item-variant">
                          {item.color}{item.color && item.size && ' · '}{item.size}
                        </p>
                      )}
                    </div>
                    <span className="summary-item-price">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="checkout-totals">
                <div className="total-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
                </div>
                <div className="total-row"><span>Tax</span><span>₦0</span></div>
                <div className="divider" />
                <div className="total-row grand"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Placing Order...' : <>Place Order <FaArrowRight size={16} /></>}
              </button>

              <p className="checkout-security"><FaLock size={12} /> Your payment information is encrypted and secure</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
