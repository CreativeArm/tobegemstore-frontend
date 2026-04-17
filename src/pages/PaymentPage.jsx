import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaCircleCheck,
  FaCopy,
  FaUpload,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { orderAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './PaymentPage.css';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [proofFile, setProofFile] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [orderRes, bankRes] = await Promise.all([
          orderAPI.getById(orderId),
          paymentAPI.getBankDetails()
        ]);
        setOrder(orderRes.data.order);
        setBankDetails(bankRes.data.bankDetails);
      } catch {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, navigate]);

  const handlePaystack = async () => {
    setProcessing(true);
    try {
      const { data } = await paymentAPI.initPaystack(orderId);
      // Redirect to Paystack
      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error('Failed to initialize payment');
      setProcessing(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    setProcessing(true);
    try {
      await paymentAPI.confirmBankTransfer({ orderId, proofOfPayment: proofFile });
      toast.success('Bank transfer submitted! We\'ll confirm within 24 hours.');
      navigate(`/order-confirmation/${orderId}`);
    } catch {
      toast.error('Failed to submit bank transfer details');
    } finally {
      setProcessing(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: 2 }}>LOADING ORDER</p>
    </div>
  );

  if (!order) return null;

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <div className="section-label">Payment</div>
          <h1 className="payment-title">Complete Your Payment</h1>
          <p className="payment-order-num">Order #{order.orderNumber}</p>
        </div>

        <div className="payment-grid">
          {/* LEFT: Payment Method */}
          <div className="payment-main">
            {/* PAYSTACK */}
            {order.paymentMethod === 'paystack' && (
              <div className="payment-method-card">
                <div className="method-header">
                  <span className="method-icon">🇳🇬</span>
                  <div>
                    <h2>Pay with Paystack</h2>
                    <p>Card, Bank Transfer, USSD, Mobile Money</p>
                  </div>
                </div>

                <div className="paystack-info">
                  <div className="info-row"><span>Amount</span><strong>{fmt(order.pricing.total)}</strong></div>
                  <div className="info-row"><span>Order</span><strong>#{order.orderNumber}</strong></div>
                  <div className="info-row"><span>Email</span><strong>{order.shippingAddress.email}</strong></div>
                </div>

                <div className="paystack-features">
                  {['256-bit SSL encryption', 'PCI DSS Compliant', 'Instant payment confirmation', '₦0 transaction fee'].map(f => (
                    <div key={f} className="feature-item"><FaCircleCheck size={14} /><span>{f}</span></div>
                  ))}
                </div>

                <button className="btn btn-gold btn-full btn-lg" onClick={handlePaystack} disabled={processing}>
                  {processing ? 'Redirecting...' : `Pay ${fmt(order.pricing.total)} with Paystack`}
                  <FaArrowUpRightFromSquare size={16} />
                </button>
              </div>
            )}

            {/* PAYPAL */}
            {order.paymentMethod === 'paypal' && (
              <div className="payment-method-card">
                <div className="method-header">
                  <span className="method-icon">🌍</span>
                  <div>
                    <h2>Pay with PayPal</h2>
                    <p>Secure international payment</p>
                  </div>
                </div>

                <div className="paypal-note">
                  <p>You'll be redirected to PayPal to complete your payment securely. Your order will be confirmed once payment is received.</p>
                </div>

                <div className="paystack-info">
                  <div className="info-row"><span>Amount (USD)</span><strong>${(order.pricing.total / 1650).toFixed(2)}</strong></div>
                  <div className="info-row"><span>Amount (NGN)</span><strong>{fmt(order.pricing.total)}</strong></div>
                </div>

                {/* PayPal Button Placeholder - integrate @paypal/react-paypal-js in production */}
                <button
                  className="btn btn-full btn-lg paypal-btn"
                  onClick={() => {
                    toast.success('In production, this redirects to PayPal checkout');
                    setTimeout(() => navigate(`/order-confirmation/${orderId}`), 2000);
                  }}
                  disabled={processing}
                >
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" style={{ height: 20 }} />
                  Pay with PayPal
                </button>
              </div>
            )}

            {/* BANK TRANSFER */}
            {order.paymentMethod === 'bank_transfer' && (
              <div className="payment-method-card">
                <div className="method-header">
                  <span className="method-icon">🏦</span>
                  <div>
                    <h2>Bank Transfer</h2>
                    <p>Transfer to our account and confirm below</p>
                  </div>
                </div>

                {bankDetails && (
                  <div className="bank-details">
                    <h3 className="bank-details-title">Transfer Details</h3>
                    {[
                      { label: 'Bank Name', value: bankDetails.bankName },
                      { label: 'Account Name', value: bankDetails.accountName },
                      { label: 'Account Number', value: bankDetails.accountNumber },
                      { label: 'Amount to Transfer', value: fmt(order.pricing.total) },
                      { label: 'Reference', value: order.orderNumber },
                    ].map(item => (
                      <div key={item.label} className="bank-detail-row">
                        <span className="bank-detail-label">{item.label}</span>
                        <div className="bank-detail-value">
                          <strong>{item.value}</strong>
                          <button className="copy-btn" onClick={() => copyText(item.value)}>
                            <FaCopy size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bank-transfer-steps">
                  <h3>How to Complete Payment</h3>
                  {[
                    'Transfer the exact amount shown above to our account',
                    'Use your order number as the payment reference',
                    'Upload your proof of payment below',
                    'We\'ll confirm and process your order within 24 hours'
                  ].map((step, i) => (
                    <div key={i} className="step-item">
                      <span className="step-num">{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="input-group">
                  <label className="input-label">Proof of Payment URL (screenshot link)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. https://drive.google.com/..."
                    value={proofFile}
                    onChange={e => setProofFile(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-gold btn-full btn-lg"
                  onClick={handleBankTransferSubmit}
                  disabled={processing}
                >
                  {processing ? 'Submitting...' : <><FaUpload size={16} /> I've Made the Transfer</>}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Summary */}
          <div className="payment-summary">
            <div className="order-summary">
              <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>Order Summary</h3>

              <div className="summary-items-mini">
                {order.items.map((item, i) => (
                  <div key={i} className="mini-item">
                    <img src={item.image} alt={item.name} className="mini-item-img" />
                    <div className="mini-item-info">
                      <p>{item.name}</p>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <span className="mini-item-price">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="summary-breakdown">
                <div className="total-row"><span>Subtotal</span><span>{fmt(order.pricing.subtotal)}</span></div>
                <div className="total-row"><span>Shipping</span><span className={order.pricing.shipping === 0 ? 'text-success' : ''}>{order.pricing.shipping === 0 ? 'FREE' : fmt(order.pricing.shipping)}</span></div>
                <div className="divider" />
                <div className="total-row grand"><span>Total</span><span>{fmt(order.pricing.total)}</span></div>
              </div>

              <div className="divider" />

              <div className="delivery-info">
                <h4>Delivery To</h4>
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
