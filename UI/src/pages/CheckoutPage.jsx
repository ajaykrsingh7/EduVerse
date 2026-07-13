import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import './Checkout.css';

const formatCard = (val) =>
  val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const STEPS = ['Review Order', 'Payment', 'Confirmation'];

// ── Step indicator ─────────────────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="ck-steps">
    {STEPS.map((s, i) => (
      <div key={s} className={`ck-step ${step > i ? 'ck-step--done' : ''} ${step === i + 1 ? 'ck-step--active' : ''}`}>
        <div className="ck-step__circle">
          {step > i + 1
            ? <i className="fa-solid fa-check" />
            : <span>{i + 1}</span>
          }
        </div>
        <span className="ck-step__label">{s}</span>
        {i < STEPS.length - 1 && <div className="ck-step__line" />}
      </div>
    ))}
  </div>
);

// ── Order item row ─────────────────────────────────────────────────────────
const OrderItemRow = ({ item }) => {
  const ICONS = { course: 'fa-graduation-cap', book: 'fa-book', plan: 'fa-crown' };
  const COLORS = { course: '#7B2FBE', book: '#3B82F6', plan: '#F59E0B' };
  return (
    <div className="ck-order-item">
      <div className="ck-order-item__icon" style={{ background: (COLORS[item.type] || '#6B7280') + '18' }}>
        <i className={`fa-solid ${ICONS[item.type] || 'fa-tag'}`} style={{ color: COLORS[item.type] || '#6B7280' }} />
      </div>
      <div className="ck-order-item__info">
        <p className="ck-order-item__title">{item.title}</p>
        <span className="ck-order-item__type">
          <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />
          {item.type}
        </span>
      </div>
      <div className="ck-order-item__price">₹{Number(item.price).toFixed(2)}</div>
    </div>
  );
};

// ── Card input with icon ───────────────────────────────────────────────────
const CardInput = ({ name, value, onChange, placeholder, type = 'text', maxLength, icon }) => (
  <div className="ck-input-wrap">
    {icon && <i className={`fa-solid ${icon} ck-input-icon`} />}
    <input
      className={`ck-input ${icon ? 'ck-input--with-icon' : ''}`}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete="off"
    />
  </div>
);

// ── Main checkout page ─────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [order, setOrder]     = useState(null);

  const [payment, setPayment] = useState({
    cardHolder: user?.full_name || '',
    cardNumber: '',
    expiry:     '',
    cvv:        '',
  });

  const onPayChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = formatCard(value);
    if (name === 'expiry')     value = value.replace(/\D/g,'').slice(0,4).replace(/(.{2})/,'$1/').slice(0,5);
    if (name === 'cvv')        value = value.replace(/\D/g,'').slice(0,4);
    setPayment(p => ({ ...p, [name]: value }));
  };

  const handlePay = async () => {
    if (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.cardHolder) {
      setError('Please fill in all payment fields.'); return;
    }
    setError(''); setLoading(true);
    try {
      const res = await ordersAPI.checkout({
        items: items.map(({ id, type, title, price }) => ({ id, type, title, price })),
        paymentDetails: { cardNumber: payment.cardNumber },
      });
      setOrder(res.data.order);
      clearCart();
      setStep(3);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) { navigate('/login'); return null; }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 3) return (
    <div className="ck-page">
      <div className="ck-container">
        <StepBar step={3} />
        <div className="ck-success-card">
          <div className="ck-success-ring">
            <div className="ck-success-icon">
              <i className="fa-solid fa-check" />
            </div>
          </div>
          <h2 className="ck-success-title">Payment Successful!</h2>
          <p className="ck-success-sub">Your order has been confirmed and is ready.</p>
          {order && (
            <div className="ck-success-ref">
              <i className="fa-solid fa-receipt" style={{ marginRight: 8, color: 'var(--primary)' }} />
              Order reference: <strong>{order.payment_ref || `ORD-${order.id}`}</strong>
            </div>
          )}
          <div className="ck-success-actions">
            <button className="ck-btn ck-btn--primary" onClick={() => navigate('/my-learning')}>
              <i className="fa-solid fa-book-open-reader" /> My Learning
            </button>
            <button className="ck-btn ck-btn--outline" onClick={() => navigate('/courses')}>
              <i className="fa-solid fa-search" /> Browse More
            </button>
            <button className="ck-btn ck-btn--ghost" onClick={() => navigate('/')}>
              <i className="fa-solid fa-house" /> Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) return (
    <div className="ck-page">
      <div className="ck-container">
        <div className="ck-empty-card">
          <div className="ck-empty-icon">
            <i className="fa-solid fa-cart-shopping" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add some courses, books, or a plan before checking out.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="ck-btn ck-btn--primary" onClick={() => navigate('/courses')}>
              <i className="fa-solid fa-graduation-cap" /> Browse Courses
            </button>
            <button className="ck-btn ck-btn--outline" onClick={() => navigate('/shop')}>
              <i className="fa-solid fa-book" /> Book Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ck-page">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="ck-hero">
        <div className="ck-container">
          <div className="ck-breadcrumb">
            <Link to="/"><i className="fa-solid fa-house" style={{ marginRight: 5 }} />Home</Link>
            <i className="fa-solid fa-chevron-right" />
            <Link to="/shop"><i className="fa-solid fa-cart-shopping" style={{ marginRight: 5 }} />Cart</Link>
            <i className="fa-solid fa-chevron-right" />
            <span>Checkout</span>
          </div>
          <h1 className="ck-hero-title">
            <i className="fa-solid fa-lock" style={{ marginRight: 10, fontSize: 24 }} />
            Secure Checkout
          </h1>
          <p className="ck-hero-sub">Your payment is protected by 256-bit SSL encryption</p>
        </div>
      </div>

      <div className="ck-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <StepBar step={step} />

        <div className="ck-layout">
          {/* ── Left: step content ──────────────────────────── */}
          <div className="ck-main">

            {/* STEP 1 — Review order */}
            {step === 1 && (
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-header__icon">
                    <i className="fa-solid fa-clipboard-list" />
                  </div>
                  <div>
                    <h2 className="ck-card-title">Review Your Order</h2>
                    <p className="ck-card-sub">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
                  </div>
                </div>

                <div className="ck-items-list">
                  {items.map(item => <OrderItemRow key={`${item.type}-${item.id}`} item={item} />)}
                </div>

                <div className="ck-divider" />

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="ck-btn ck-btn--ghost" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left" /> Back to Cart
                  </button>
                  <button className="ck-btn ck-btn--primary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                    Continue to Payment <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="ck-card">
                <div className="ck-card-header">
                  <div className="ck-card-header__icon">
                    <i className="fa-solid fa-credit-card" />
                  </div>
                  <div>
                    <h2 className="ck-card-title">Payment Details</h2>
                    <p className="ck-card-sub">Enter your card information below</p>
                  </div>
                </div>

                {/* Demo notice */}
                <div className="ck-demo-notice">
                  <i className="fa-solid fa-flask" style={{ color: '#D97706', marginRight: 8 }} />
                  <div>
                    <strong>Demo Mode</strong> — Use any card number to simulate a successful payment.
                    Use <code>0000 0000 0000 0000</code> to test a declined card.
                  </div>
                </div>

                {error && (
                  <div className="ck-error-msg">
                    <i className="fa-solid fa-circle-xmark" style={{ marginRight: 8 }} />{error}
                  </div>
                )}

                {/* Card type selector (visual only) */}
                <div className="ck-card-brands">
                  {['visa','mastercard','amex','discover'].map(brand => (
                    <div key={brand} className="ck-card-brand">
                      <i className={`fa-brands fa-cc-${brand}`} />
                    </div>
                  ))}
                </div>

                <div className="ck-form-group">
                  <label className="ck-label">
                    <i className="fa-solid fa-user" style={{ marginRight: 6, color: 'var(--primary)' }} />
                    Card Holder Name
                  </label>
                  <CardInput name="cardHolder" value={payment.cardHolder} onChange={onPayChange}
                    placeholder="John Smith" icon="fa-user" />
                </div>

                <div className="ck-form-group">
                  <label className="ck-label">
                    <i className="fa-solid fa-credit-card" style={{ marginRight: 6, color: 'var(--primary)' }} />
                    Card Number
                  </label>
                  <CardInput name="cardNumber" value={payment.cardNumber} onChange={onPayChange}
                    placeholder="1234  5678  9012  3456" maxLength={19} icon="fa-credit-card" />
                </div>

                <div className="ck-form-row">
                  <div className="ck-form-group">
                    <label className="ck-label">
                      <i className="fa-solid fa-calendar" style={{ marginRight: 6, color: 'var(--primary)' }} />
                      Expiry Date
                    </label>
                    <CardInput name="expiry" value={payment.expiry} onChange={onPayChange}
                      placeholder="MM/YY" maxLength={5} icon="fa-calendar" />
                  </div>
                  <div className="ck-form-group">
                    <label className="ck-label">
                      <i className="fa-solid fa-lock" style={{ marginRight: 6, color: 'var(--primary)' }} />
                      CVV
                    </label>
                    <CardInput name="cvv" value={payment.cvv} onChange={onPayChange}
                      placeholder="•••" maxLength={4} type="password" icon="fa-lock" />
                  </div>
                </div>

                <div className="ck-security-note">
                  <i className="fa-solid fa-shield-halved" style={{ color: '#21C55D' }} />
                  <span>Your payment info is encrypted and never stored on our servers.</span>
                </div>

                <div className="ck-divider" />

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="ck-btn ck-btn--ghost" onClick={() => setStep(1)}>
                    <i className="fa-solid fa-arrow-left" /> Back
                  </button>
                  <button
                    className="ck-btn ck-btn--pay"
                    onClick={handlePay}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Processing...</>
                      : <><i className="fa-solid fa-lock" /> Pay ${total.toFixed(2)} Securely</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order summary ─────────────────────────── */}
          <aside className="ck-summary">
            <div className="ck-summary-card">
              <h3 className="ck-summary-title">
                <i className="fa-solid fa-receipt" style={{ marginRight: 8, color: 'var(--primary)' }} />
                Order Summary
              </h3>

              {items.map(item => (
                <div key={`${item.type}-${item.id}`} className="ck-summary-row">
                  <span className="ck-summary-row__name">{item.title}</span>
                  <span className="ck-summary-row__price">₹{Number(item.price).toFixed(2)}</span>
                </div>
              ))}

              <div className="ck-summary-divider" />

              <div className="ck-summary-row ck-summary-row--subtotal">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="ck-summary-row" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <span><i className="fa-solid fa-tag" style={{ marginRight: 4 }} />Discount</span>
                <span style={{ color: '#21C55D' }}>₹0.00</span>
              </div>

              <div className="ck-summary-divider" />

              <div className="ck-summary-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Trust badges */}
              <div className="ck-trust-badges">
                {[
                  { icon: 'fa-shield-halved', label: 'SSL Secured' },
                  { icon: 'fa-rotate-left',   label: '30-day Refund' },
                  { icon: 'fa-headset',       label: '24/7 Support' },
                ].map(b => (
                  <div key={b.label} className="ck-trust-badge">
                    <i className={`fa-solid ${b.icon}`} />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help box */}
            <div className="ck-help-box">
              <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)', fontSize: 20, marginBottom: 8, display: 'block' }} />
              <strong style={{ fontSize: 14, color: 'var(--text-dark)' }}>Need help?</strong>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 10px' }}>Our support team is available 24/7</p>
              <a href="mailto:support@eduverse.co" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: 4 }} />support@eduverse.co
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;