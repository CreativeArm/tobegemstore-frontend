import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaCircleCheck,
  FaBox,
  FaTruck,
  FaLocationDot,
  FaClock,
  FaArrowRight,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaClipboardList,
  FaGear,
  FaChampagneGlasses,
  FaCircleXmark,
} from 'react-icons/fa6';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './OrderPages.css';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

// ================= ORDER CONFIRMATION =================
export function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(orderId)
      .then(r => setOrder(r.data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!order) return null;

  return (
    <div className="order-page">
      <div className="container">
        <div className="confirmation-hero">
          <div className="confirm-icon-wrap">
            <FaCircleCheck size={52} className="confirm-icon" />
          </div>
          <h1 className="confirm-title">Order Placed!</h1>
          <p className="confirm-subtitle">Thank you, {order.shippingAddress.firstName}! Your order is confirmed.</p>
          <div className="confirm-order-num">Order #{order.orderNumber}</div>
        </div>

        <div className="order-detail-grid">
          {/* Items */}
          <div className="order-detail-card">
            <h3 className="order-card-title"><FaBox size={16} /> Order Items ({order.items.length})</h3>
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <img src={item.image} alt={item.name} className="order-item-img" />
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-meta">Qty: {item.quantity}{item.color && ` · ${item.color}`}{item.size && ` · ${item.size}`}</p>
                  </div>
                  <span className="order-item-price">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row-sm"><span>Subtotal</span><span>{fmt(order.pricing.subtotal)}</span></div>
              <div className="total-row-sm"><span>Shipping</span><span className={order.pricing.shipping === 0 ? 'text-success' : ''}>{order.pricing.shipping === 0 ? 'FREE' : fmt(order.pricing.shipping)}</span></div>
              <div className="divider" />
              <div className="total-row-sm grand"><span>Total</span><span>{fmt(order.pricing.total)}</span></div>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="order-detail-card">
              <h3 className="order-card-title"><FaLocationDot size={16} /> Delivery Address</h3>
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>

            <div className="order-detail-card">
              <h3 className="order-card-title"><FaClock size={16} /> What's Next?</h3>
              <div className="next-steps">
                {[
                  { emoji: '📧', text: 'A confirmation email has been sent to ' + order.shippingAddress.email },
                  { emoji: '✅', text: 'Your payment will be verified within 24 hours' },
                  { emoji: '📦', text: 'Order will be processed and shipped within 2-3 business days' },
                  { emoji: '🚚', text: 'Expect delivery within 3-7 business days' },
                ].map((s, i) => (
                  <div key={i} className="next-step"><span>{s.emoji}</span><p>{s.text}</p></div>
                ))}
              </div>
            </div>

            <div className="confirm-actions">
              <Link to={`/track/${order.orderNumber}`} className="btn btn-gold btn-full">
                <FaTruck size={16} /> Track Order
              </Link>
              <Link to="/orders" className="btn btn-outline btn-full">View All Orders</Link>
              <Link to="/shop" className="btn btn-ghost btn-full">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= MY ORDERS =================
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(r => setOrders(r.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const closeCancelModal = useCallback(() => {
    if (!cancelSubmitting) setCancelTargetId(null);
  }, [cancelSubmitting]);

  useEffect(() => {
    if (!cancelTargetId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeCancelModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelTargetId, closeCancelModal]);

  const statusColors = {
    pending: '#fbbf24', confirmed: '#60a5fa', processing: '#a78bfa',
    shipped: '#34d399', out_for_delivery: '#f97316', delivered: '#4ade80',
    cancelled: '#f87171', returned: '#94a3b8'
  };

  const confirmCancelOrder = async () => {
    if (!cancelTargetId) return;
    setCancelSubmitting(true);
    try {
      await orderAPI.cancel(cancelTargetId);
      setOrders(prev => prev.map(o => o._id === cancelTargetId ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled');
      setCancelTargetId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const cancelTargetOrder = cancelTargetId
    ? orders.find((o) => o._id === cancelTargetId)
    : null;

  return (
    <div className="order-page">
      {cancelTargetId && (
        <div
          className="modal-backdrop cancel-order-backdrop"
          onClick={closeCancelModal}
          role="presentation"
        >
          <div
            className="cancel-order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cancel-order-modal-icon">
              <FaTriangleExclamation size={28} aria-hidden />
            </div>
            <h2 id="cancel-order-title" className="cancel-order-modal-title">
              Cancel this order?
            </h2>
            <p className="cancel-order-modal-text">
              {cancelTargetOrder
                ? `Order #${cancelTargetOrder.orderNumber} will be cancelled. This can’t be undone.`
                : 'This order will be cancelled. This can’t be undone.'}
            </p>
            <div className="cancel-order-modal-actions">
              <button
                type="button"
                className="btn btn-ghost cancel-order-modal-btn"
                onClick={closeCancelModal}
                disabled={cancelSubmitting}
              >
                Keep order
              </button>
              <button
                type="button"
                className="btn btn-danger cancel-order-modal-btn"
                onClick={confirmCancelOrder}
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? 'Cancelling…' : 'Yes, cancel order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="page-header">
          <div className="section-label">Account</div>
          <h1 className="page-title">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <FaBox size={60} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <h3>No orders yet</h3>
            <p>When you place an order, it will appear here</p>
            <Link to="/shop" className="btn btn-gold">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="order-num">#{order.orderNumber}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="status-badge" style={{ '--status-color': statusColors[order.status] || '#aaa' }}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="payment-status-badge" style={{ color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-card-items">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className="order-thumb" title={item.name} />
                  ))}
                  {order.items.length > 3 && (
                    <div className="order-thumb-more">+{order.items.length - 3}</div>
                  )}
                  <div className="order-card-summary">
                    <p>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                    <p className="order-card-total">{fmt(order.pricing.total)}</p>
                  </div>
                </div>

                <div className="order-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/order-confirmation/${order._id}`)}>
                    View Details <FaArrowRight size={14} />
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/track/${order.orderNumber}`)}>
                    <FaTruck size={14} /> Track
                  </button>
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelTargetId(order._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================= ORDER TRACKING =================
export function OrderTracking() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(orderNumber || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (orderNumber) {
      orderAPI.track(orderNumber)
        .then(r => setOrder(r.data.order))
        .catch(() => toast.error('Order not found'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/track/${searchInput.trim()}`);
  };

  const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIdx = STATUSES.indexOf(order?.status);

  const STATUS_LABELS = {
    pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing',
    shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered'
  };

  const TRACK_STEP_ICONS = {
    pending: FaClipboardList,
    confirmed: FaCircleCheck,
    processing: FaGear,
    shipped: FaBox,
    out_for_delivery: FaTruck,
    delivered: FaChampagneGlasses,
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="order-page">
      <div className="container">
        <div className="page-header">
          <div className="section-label">Tracking</div>
          <h1 className="page-title">Track Your Order</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="track-search">
          <input className="input-field track-input" placeholder="Enter your order number (e.g. TBG-12345678-001)" value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button type="submit" className="btn btn-gold"><FaMagnifyingGlass size={16} /> Track</button>
        </form>

        {order && (
          <div className="tracking-content">
            <div className="tracking-header">
              <div>
                <h2>Order #{order.orderNumber}</h2>
                <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              {order.trackingNumber && (
                <div className="tracking-num">
                  <span>Tracking #</span>
                  <strong>{order.trackingNumber}</strong>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {order.status !== 'cancelled' && (
              <div className="tracking-progress" aria-label="Order status progress">
                {STATUSES.map((s, i) => {
                  const StepIcon = TRACK_STEP_ICONS[s];
                  const isDone = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div
                      key={s}
                      className={`progress-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                      style={{ '--step-i': i }}
                    >
                      <div className="progress-icon">
                        <StepIcon size={20} strokeWidth={2} aria-hidden />
                      </div>
                      <span className="progress-label">{STATUS_LABELS[s]}</span>
                      {i < STATUSES.length - 1 && (
                        <div
                          className={`progress-line ${i < currentIdx ? 'done' : ''}`}
                          style={{ '--segment-i': i }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="cancelled-banner">
                <FaCircleXmark size={20} aria-hidden />
                <span>This order has been cancelled</span>
              </div>
            )}

            {/* Timeline */}
            <div className="tracking-timeline">
              <h3 className="timeline-title">Order Timeline</h3>
              {[...order.trackingEvents].reverse().map((event, i) => (
                <div key={i} className={`timeline-event ${i === 0 ? 'latest' : ''}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{event.status.replace('_', ' ').toUpperCase()}</strong>
                      <span className="timeline-time">{new Date(event.timestamp).toLocaleString('en-NG')}</span>
                    </div>
                    <p>{event.description}</p>
                    {event.location && (
                      <span className="timeline-location">
                        <FaLocationDot size={12} aria-hidden />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Items Preview */}
            <div className="tracking-items">
              <h3>Items in This Order</h3>
              {order.items.map((item, i) => (
                <div key={i} className="track-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <span>Qty: {item.quantity} · {fmt(item.price)}</span>
                  </div>
                  <strong>{fmt(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderConfirmation;
