import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/Base';
import './MyEnrollments.css';

// Helper
const ProgressBar = ({ percent }) => (
  <div className="me-progress">
    <div className="me-progress__fill" style={{ width: `${percent}%` }} />
    <span className="me-progress__label">{percent}%</span>
  </div>
);

const PlanBadge = ({ name }) => {
  const colors = { basic: '#3B82F6', standard: '#8B5CF6', premium: '#F59E0B' };
  return (
    <span style={{
      background: (colors[name] || '#6B7280') + '20',
      color: colors[name] || '#6B7280',
      border: `1px solid ${colors[name] || '#6B7280'}40`,
      padding: '3px 12px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      textTransform: 'uppercase',
    }}>
      <i className="fa-solid fa-crown" style={{ marginRight: 5 }} />
      {name}
    </span>
  );
};

// Subscription Card
const SubscriptionCard = ({ sub }) => {
  if (!sub) return (
    <div className="me-sub-card me-sub-card--empty">
      <div className="me-sub-card__icon">
        <i className="fa-solid fa-crown" />
      </div>
      <div>
        <h3>No Active Subscription</h3>
        <p>Subscribe to a plan to unlock HD lessons, practice questions, free books, and more.</p>
      </div>
      <Link to="/pricing" className="me-sub-card__cta">
        <i className="fa-solid fa-arrow-right" /> View Plans
      </Link>
    </div>
  );

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(sub.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
  ));
  const daysTotal  = 30;
  const daysUsed   = daysTotal - daysLeft;
  const timePercent = Math.min(100, Math.round((daysUsed / daysTotal) * 100));

  const features = [
    { icon: 'fa-film',           label: 'HD Lessons',          val: sub.hd_lessons },
    { icon: 'fa-file-pen',       label: 'Official Exams',       val: sub.official_exams },
    { icon: 'fa-pen-to-square',  label: 'Practice Questions',   val: sub.practice_questions },
    { icon: 'fa-book',           label: 'Free Books',           val: sub.free_books },
    { icon: 'fa-circle-question',label: 'Quizzes',              val: sub.has_quizzes  ? 'Included' : '—' },
    { icon: 'fa-chalkboard-user',label: 'Personal Instructor',  val: sub.has_instructor ? 'Included' : '—' },
  ];

  return (
    <div className="me-sub-card me-sub-card--active">
      <div className="me-sub-card__header">
        <div className="me-sub-card__title-row">
          <div className="me-sub-card__icon me-sub-card__icon--active">
            <i className="fa-solid fa-crown" />
          </div>
          <div>
            <h3>
              <PlanBadge name={sub.plan_name} />
            </h3>
            <p className="me-sub-card__dates">
              <i className="fa-solid fa-calendar-check" style={{ marginRight: 5, color: 'var(--success, #21C55D)' }} />
              Active until {new Date(sub.expires_at).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div className="me-sub-card__days-badge">
            <strong>{daysLeft}</strong>
            <span>days left</span>
          </div>
        </div>

        {/* Time remaining bar */}
        <div className="me-sub-time-bar">
          <div className="me-sub-time-bar__fill" style={{ width: `${100 - timePercent}%` }} />
        </div>
      </div>

      <div className="me-sub-features">
        {features.map(f => (
          <div key={f.label} className="me-sub-feature">
            <i className={`fa-solid ${f.icon}`} />
            <div>
              <div className="me-sub-feature__val">{f.val}</div>
              <div className="me-sub-feature__label">{f.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/pricing" className="me-sub-card__upgrade">
        <i className="fa-solid fa-arrow-up" /> Upgrade Plan
      </Link>
    </div>
  );
};

/* ── Course Card (enrollment view) ──────────────────────────────────────── */
const EnrolledCourseCard = ({ enr }) => {
  const navigate = useNavigate();

  return (
    <div className="me-course-card">
      <div className="me-course-card__thumb">
        {enr.thumbnail
          ? <img src={enr.thumbnail} alt={enr.title} />
          : (
            <div className="me-course-card__thumb-placeholder">
              <i className="fa-solid fa-graduation-cap" />
            </div>
          )
        }
        {enr.is_free && (
          <span className="me-course-card__free-badge">
            <i className="fa-solid fa-star" /> Free
          </span>
        )}
      </div>

      <div className="me-course-card__body">
        <div className="me-course-card__category">
          <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />
          {enr.category}
        </div>
        <h3 className="me-course-card__title"
          onClick={() => navigate(enr.is_free ? `/learn/${enr.course_id}` : `/courses/${enr.course_id}`)}
        >
          {enr.title}
        </h3>
        <p className="me-course-card__mentor">
          <i className="fa-solid fa-chalkboard-user" style={{ marginRight: 5 }} />
          {enr.mentor_name}
        </p>

        <div className="me-course-card__meta">
          <span>
            <i className="fa-solid fa-film" style={{ marginRight: 4 }} />
            {enr.lessons || 0} lessons
          </span>
          <span>
            <i className="fa-solid fa-globe" style={{ marginRight: 4 }} />
            {enr.language || 'English'}
          </span>
          <span>
            <i className="fa-solid fa-star" style={{ color: '#F59E0B', marginRight: 4 }} />
            {Number(enr.rating || 4.8).toFixed(1)}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
            <span>
              <i className="fa-solid fa-check-circle" style={{ marginRight: 4, color: 'var(--success, #21C55D)' }} />
              {enr.lessons_completed || 0} / {enr.total_lessons || enr.lessons || 0} lessons
            </span>
            <span style={{ fontWeight: 700, color: enr.progress_percent >= 100 ? 'var(--success, #21C55D)' : 'var(--primary)' }}>
              {enr.progress_percent || 0}%
            </span>
          </div>
          <ProgressBar percent={enr.progress_percent || 0} />
        </div>
      </div>

      <div className="me-course-card__footer">
        <span className="me-course-card__enrolled-date">
          <i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />
          Enrolled {new Date(enr.enrolled_at).toLocaleDateString()}
        </span>
        <button
          className="me-course-card__cta"
          onClick={() => navigate(enr.is_free ? `/learn/${enr.course_id}` : `/courses/${enr.course_id}`)}
        >
          {enr.progress_percent >= 100
            ? <><i className="fa-solid fa-rotate-right" /> Review</>
            : enr.progress_percent > 0
            ? <><i className="fa-solid fa-play" /> Continue</>
            : <><i className="fa-solid fa-play" /> Start</>
          }
        </button>
      </div>
    </div>
  );
};

/* ── Subscription History ────────────────────────────────────────────────── */
const SubHistoryTable = ({ history }) => {
  if (!history?.length) return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
      <i className="fa-solid fa-receipt" style={{ fontSize: 36, opacity: 0.3, display: 'block', marginBottom: 12 }} />
      No subscription history yet.
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="me-history-table">
        <thead>
          <tr>
            <th><i className="fa-solid fa-box" style={{ marginRight: 6 }} />Plan</th>
            <th><i className="fa-solid fa-dollar-sign" style={{ marginRight: 6 }} />Price</th>
            <th><i className="fa-solid fa-calendar-plus" style={{ marginRight: 6 }} />Started</th>
            <th><i className="fa-solid fa-calendar-xmark" style={{ marginRight: 6 }} />Expires</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(s => (
            <tr key={s.id}>
              <td>
                <PlanBadge name={s.plan_name} />
              </td>
              <td style={{ fontWeight: 700, color: 'var(--accent)' }}>${s.price}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(s.starts_at).toLocaleDateString()}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(s.expires_at).toLocaleDateString()}</td>
              <td>
                {s.is_active && new Date(s.expires_at) > new Date()
                  ? <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <i className="fa-solid fa-circle" style={{ fontSize: 7 }} /> Active
                    </span>
                  : <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                      Expired
                    </span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────────────────────── */
const MyEnrollmentsPage = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab] = useState('courses');

  // useEffect(() => {
  //   if (!user) { navigate('/login'); return; }
  //   enrollmentAPI.getMyDashboard()
  //     .then(res => setData(res.data))
  //     .catch(() => {})
  //     .finally(() => setLoading(false));
  // }, [user]);

  useEffect(() => {
  if (!user) { navigate('/login'); return; }
  setData(null);
  setLoading(true);
  enrollmentAPI.getMyDashboard()
    .then(res => setData(res.data))
    .catch(() => setData({ subscription: null, enrollments: [], subHistory: [], orderHistory: [] }))
    .finally(() => setLoading(false));
}, [user?.id]);  // key on user.id, not user object

  if (!user) return null;
  if (loading) return <Spinner />;

  const { subscription, enrollments = [], subHistory = [] } = data || {};
  const inProgress = enrollments.filter(e => e.progress_percent > 0 && e.progress_percent < 100);
  const notStarted = enrollments.filter(e => !e.progress_percent || e.progress_percent === 0);
  const completed  = enrollments.filter(e => e.progress_percent >= 100);

  const tabs = [
    { key: 'courses',      label: 'My Courses',         icon: 'fa-graduation-cap', count: enrollments.length },
    { key: 'subscription', label: 'My Subscription',    icon: 'fa-crown',          count: null },
    { key: 'history',      label: 'Payment History',    icon: 'fa-receipt',        count: subHistory.length },
  ];

  return (
    <div className="me-page">
      {/* Page header */}
      <div className="me-header">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 12 }}>
            <Link to="/">Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span className="active">My Learning</span>
          </div>
          <div className="me-header-inner">
            <div>
              <h1 className="me-page-title">
                <i className="fa-solid fa-book-open-reader" style={{ marginRight: 12, color: 'var(--primary)' }} />
                My Learning
              </h1>
              <p className="me-page-sub">Track your progress, manage your subscription, and continue learning.</p>
            </div>
            <div className="me-header-stats">
              {[
                { icon: 'fa-graduation-cap',  label: 'Enrolled',    val: enrollments.length,    color: 'var(--primary)' },
                { icon: 'fa-spinner',          label: 'In Progress', val: inProgress.length,     color: '#F59E0B' },
                { icon: 'fa-circle-check',     label: 'Completed',   val: completed.length,      color: '#21C55D' },
              ].map(s => (
                <div key={s.label} className="me-stat">
                  <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: 22, marginBottom: 4, display: 'block' }} />
                  <strong>{s.val}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container me-body">
        {/* Tabs */}
        <div className="me-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`me-tab ${activeTab === t.key ? 'me-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`fa-solid ${t.icon}`} />
              {t.label}
              {t.count !== null && (
                <span className="me-tab__count">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── My Courses tab ──────────────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div>
            {enrollments.length === 0 ? (
              <div className="me-empty">
                <i className="fa-solid fa-book-open" />
                <h3>No courses enrolled yet</h3>
                <p>Browse our courses and start learning today.</p>
                <Link to="/courses" className="me-empty-btn">
                  <i className="fa-solid fa-search" /> Browse Courses
                </Link>
              </div>
            ) : (
              <>
                {/* Continue learning */}
                {inProgress.length > 0 && (
                  <section className="me-section">
                    <h2 className="me-section-title">
                      <i className="fa-solid fa-play-circle" style={{ color: '#F59E0B' }} />
                      Continue Learning
                      <span className="me-section-badge">{inProgress.length}</span>
                    </h2>
                    <div className="me-courses-grid">
                      {inProgress.map(e => <EnrolledCourseCard key={e.enrollment_id} enr={e} />)}
                    </div>
                  </section>
                )}

                {/* Not started */}
                {notStarted.length > 0 && (
                  <section className="me-section">
                    <h2 className="me-section-title">
                      <i className="fa-solid fa-inbox" style={{ color: 'var(--primary)' }} />
                      Not Started Yet
                      <span className="me-section-badge">{notStarted.length}</span>
                    </h2>
                    <div className="me-courses-grid">
                      {notStarted.map(e => <EnrolledCourseCard key={e.enrollment_id} enr={e} />)}
                    </div>
                  </section>
                )}

                {/* Completed */}
                {completed.length > 0 && (
                  <section className="me-section">
                    <h2 className="me-section-title">
                      <i className="fa-solid fa-trophy" style={{ color: '#21C55D' }} />
                      Completed
                      <span className="me-section-badge me-section-badge--green">{completed.length}</span>
                    </h2>
                    <div className="me-courses-grid">
                      {completed.map(e => <EnrolledCourseCard key={e.enrollment_id} enr={e} />)}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Subscription tab ────────────────────────────────────────── */}
        {activeTab === 'subscription' && (
          <div>
            <SubscriptionCard sub={subscription} />

            {!subscription && (
              <div className="me-plans-preview">
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 20 }}>
                  <i className="fa-solid fa-bolt" style={{ color: '#F59E0B', marginRight: 8 }} />
                  Available Plans
                </h2>
                <div className="me-plans-grid">
                  {[
                    { name: 'basic',    price: 200,  color: '#3B82F6', features: ['3 HD lessons', '1 Official exam', '100 Practice questions', '1 Free book'] },
                    { name: 'standard', price: 600,  color: '#8B5CF6', features: ['8 HD lessons', '2 Official exams', '200 Practice questions', '3 Free books', 'Quizzes included'] },
                    { name: 'premium',  price: 1200, color: '#F59E0B', features: ['15 HD lessons', '3 Official exams', '300 Practice questions', '5 Free books', 'Quizzes & Assignments', 'Personal Instructor'] },
                  ].map(plan => (
                    <div key={plan.name} className="me-plan-card" style={{ borderColor: plan.color + '40', '--plan-color': plan.color }}>
                      <div className="me-plan-card__icon" style={{ background: plan.color + '15', color: plan.color }}>
                        <i className="fa-solid fa-crown" />
                      </div>
                      <h3 style={{ textTransform:'capitalize', color: 'var(--text-dark)', fontSize: 18, fontWeight: 700 }}>{plan.name}</h3>
                      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-dark)', margin: '8px 0 16px' }}>${plan.price}</div>
                      <ul style={{ listStyle: 'none', marginBottom: 20 }}>
                        {plan.features.map(f => (
                          <li key={f} style={{ fontSize: 13, color: 'var(--text-muted)', padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fa-solid fa-check" style={{ color: plan.color }} />{f}
                          </li>
                        ))}
                      </ul>
                      <Link to="/pricing" style={{ display:'block', textAlign:'center', padding:'11px', background: plan.color, color:'#fff', borderRadius:'var(--radius)', fontWeight:700, fontSize:14, transition:'var(--transition)' }}>
                        <i className="fa-solid fa-cart-shopping" style={{ marginRight: 6 }} />
                        Get {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Payment history tab ──────────────────────────────────────── */}
        {activeTab === 'history' && (
  <div className="me-card">
    <h2 className="me-section-title" style={{ borderBottom:'1px solid var(--border)', paddingBottom:16, marginBottom:20 }}>
      <i className="fa-solid fa-receipt" style={{ color:'var(--primary)' }} />
      Payment & Transaction History
    </h2>

    {/* Subscription history */}
    {subHistory?.length > 0 && (
      <>
        <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-dark)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <i className="fa-solid fa-crown" style={{ color:'#8B5CF6' }} /> Plan Subscriptions
        </h3>
        <SubHistoryTable history={subHistory} />
        <div style={{ marginTop:24 }} />
      </>
    )}

    {/* Order/checkout history */}
    <h3 style={{ fontSize:14, fontWeight:700, color:'var(--text-dark)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
      <i className="fa-solid fa-cart-shopping" style={{ color:'var(--primary)' }} /> Course & Book Purchases
    </h3>
    {data?.orderHistory?.length > 0 ? (
      <div style={{ overflowX:'auto' }}>
        <table className="me-history-table">
          <thead>
            <tr>
              <th><i className="fa-solid fa-hashtag" style={{ marginRight:5 }} />Order ID</th>
              <th><i className="fa-solid fa-box" style={{ marginRight:5 }} />Items</th>
              <th><i className="fa-solid fa-dollar-sign" style={{ marginRight:5 }} />Amount</th>
              <th><i className="fa-solid fa-key" style={{ marginRight:5 }} />Reference</th>
              <th><i className="fa-solid fa-calendar" style={{ marginRight:5 }} />Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.orderHistory.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight:700, color:'var(--text-dark)' }}>#{o.id}</td>
                <td style={{ maxWidth:200, fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                  title={o.items_summary}>
                  <i className="fa-solid fa-layer-group" style={{ marginRight:5, color:'var(--primary)' }} />
                  {o.item_count} item{o.item_count > 1 ? 's' : ''}
                </td>
                <td style={{ fontWeight:700, color:'var(--accent)', fontSize:15 }}>${Number(o.total_amount).toFixed(2)}</td>
                <td style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>
                  {o.payment_ref || '—'}
                </td>
                <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                  {new Date(o.paid_at || o.created_at).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                </td>
                <td>
                  <span style={{ background:'#D1FAE5', color:'#065F46', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:4 }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize:8 }} /> Paid
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>
        <i className="fa-solid fa-receipt" style={{ fontSize:36, opacity:0.3, display:'block', marginBottom:10 }} />
        No purchase history yet.
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default MyEnrollmentsPage;