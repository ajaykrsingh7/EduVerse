import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/Base';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, refreshUser, updateUserLocally } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    fullName:        '',
    email:           '',
    avatar:          '',
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfile(p => ({ ...p, fullName: user.full_name || '', email: user.email || '' }));
  }, [user]);

  const onFC = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
  e.preventDefault();
  setError(''); setSaved(false); setLoading(true);
  try {
    const payload = {};
    if (profile.fullName !== user.full_name) payload.fullName = profile.fullName;
    if (profile.avatar)                       payload.avatar   = profile.avatar;
    if (profile.newPassword) {
      if (profile.newPassword !== profile.confirmPassword) {
        setError('New passwords do not match.'); setLoading(false); return;
      }
      if (profile.newPassword.length < 6) {
        setError('Password must be at least 6 characters.'); setLoading(false); return;
      }
      payload.password = profile.newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setSaved(true); setLoading(false); return;
    }

    await authAPI.updateMe(payload);

    // Optimistically update context so Navbar re-renders immediately
    updateUserLocally({
      full_name: payload.fullName || user.full_name,
      avatar:    payload.avatar   || user.avatar,
    });

    // Then do a real refresh from server
    await refreshUser();

    setSaved(true);
    setProfile(p => ({ ...p, newPassword: '', confirmPassword: '' }));
    setTimeout(() => setSaved(false), 3000);
  } catch (err) {
    setError(err.message || 'Failed to save profile.');
  } finally {
    setLoading(false);
  }
};
  const handleLogout = () => { logout(); navigate('/'); };

  if (!user) return null;

  const TABS = [
    { key: 'profile',   label: 'Profile',           icon: 'fa-user' },
    { key: 'security',  label: 'Security',          icon: 'fa-lock' },
    { key: 'activity',  label: 'Activity',          icon: 'fa-clock-rotate-left' },
  ];

  return (
    <div className="pp-page">
      {/* Header */}
      <div className="pp-hero">
        <div className="container">
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <Link to="/">Home</Link>
            <span style={{ margin: '0 6px' }}>/</span>
            <span className="active">My Profile</span>
          </div>

          <div className="pp-hero-inner">
            <div className="pp-avatar-wrap">
              <div className="pp-avatar">
                {profile.avatar || user.avatar
                  ? <img src={profile.avatar || user.avatar} alt={user.full_name} />
                  : <i className="fa-solid fa-user" />
                }
              </div>
              <div className="pp-avatar-badge">
                <i className={`fa-solid fa-${user.role === 'admin' ? 'shield-halved' : user.role === 'mentor' ? 'chalkboard-user' : 'graduation-cap'}`} />
              </div>
            </div>
            <div className="pp-hero-info">
              <h1 className="pp-hero-name">{user.full_name}</h1>
              <p className="pp-hero-email">
                <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} />
                {user.email}
              </p>
              <div className="pp-hero-badges">
                <span className={`pp-role-badge pp-role-badge--${user.role}`}>
                  <i className={`fa-solid fa-${user.role === 'admin' ? 'shield-halved' : user.role === 'mentor' ? 'chalkboard-user' : 'user'}`} />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="pp-joined-badge">
                  <i className="fa-solid fa-calendar" />
                  Member since {user.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                </span>
              </div>
            </div>

            <div className="pp-hero-actions">
              {user.role === 'mentor' && (
                <button className="pp-action-btn pp-action-btn--primary" onClick={() => navigate('/mentor')}>
                  <i className="fa-solid fa-chalkboard-user" /> Mentor Dashboard
                </button>
              )}
              <Link to="/my-learning" className="pp-action-btn pp-action-btn--outline">
                <i className="fa-solid fa-book-open-reader" /> My Learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container pp-body">
        <div className="pp-layout">
          {/* Sidebar */}
          <aside className="pp-sidebar">
            <nav className="pp-nav">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`pp-nav-item ${activeTab === t.key ? 'pp-nav-item--active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  <i className={`fa-solid ${t.icon}`} />
                  {t.label}
                </button>
              ))}
              <div className="pp-nav-divider" />
              <Link to="/my-learning" className="pp-nav-item">
                <i className="fa-solid fa-book-open-reader" /> My Learning
              </Link>
              <Link to="/pricing" className="pp-nav-item">
                <i className="fa-solid fa-crown" /> Subscription
              </Link>
              <div className="pp-nav-divider" />
              <button className="pp-nav-item pp-nav-item--danger" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Main */}
          <div className="pp-main">
            {/* ── Profile Tab ──────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="pp-card">
                <div className="pp-card-header">
                  <h2><i className="fa-solid fa-user-pen" style={{ marginRight: 8, color: 'var(--primary)' }} />Edit Profile</h2>
                </div>

                {saved && (
                  <div className="pp-success">
                    <i className="fa-solid fa-circle-check" /> Profile updated successfully!
                  </div>
                )}
                {error && (
                  <div className="pp-error">
                    <i className="fa-solid fa-triangle-exclamation" /> {error}
                  </div>
                )}

                <form onSubmit={handleSaveProfile}>
                  {/* Avatar */}
                  <div className="pp-avatar-section">
                    <div className="pp-avatar-preview">
                      {profile.avatar || user.avatar
                        ? <img src={profile.avatar || user.avatar} alt="preview" />
                        : <i className="fa-solid fa-user" />
                      }
                    </div>
                    <div className="pp-avatar-input">
                      <label className="pp-form-label">
                        <i className="fa-solid fa-image" style={{ marginRight: 6 }} />
                        Profile Photo URL (Unsplash recommended)
                      </label>
                      <input
                        className="pp-form-input"
                        name="avatar"
                        value={profile.avatar}
                        onChange={onFC}
                        placeholder="https://images.unsplash.com/photo-xxx?w=200&h=200&fit=crop"
                      />
                      <p className="pp-input-hint">
                        <i className="fa-solid fa-circle-info" style={{ marginRight: 4, color: 'var(--primary)' }} />
                        Use any image URL. Try <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>unsplash.com</a> for free photos.
                      </p>
                    </div>
                  </div>

                  <div className="pp-form-grid">
                    <div className="pp-form-group">
                      <label className="pp-form-label">
                        <i className="fa-solid fa-user" style={{ marginRight: 6 }} />
                        Full Name *
                      </label>
                      <input className="pp-form-input" name="fullName" value={profile.fullName} onChange={onFC} required />
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">
                        <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} />
                        Email Address
                      </label>
                      <input className="pp-form-input" value={profile.email} disabled
                        style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                      <p className="pp-input-hint">Email cannot be changed. Contact support if needed.</p>
                    </div>
                  </div>

                  <button type="submit" className="pp-save-btn" disabled={loading}>
                    <i className="fa-solid fa-floppy-disk" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Security Tab ─────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="pp-card">
                <div className="pp-card-header">
                  <h2><i className="fa-solid fa-lock" style={{ marginRight: 8, color: 'var(--primary)' }} />Security Settings</h2>
                </div>

                {saved && <div className="pp-success"><i className="fa-solid fa-circle-check" /> Password updated!</div>}
                {error && <div className="pp-error"><i className="fa-solid fa-triangle-exclamation" /> {error}</div>}

                <form onSubmit={handleSaveProfile}>
                  <div className="pp-security-section">
                    <h3>
                      <i className="fa-solid fa-key" style={{ color: 'var(--primary)', marginRight: 8 }} />
                      Change Password
                    </h3>
                    <p>Leave blank if you don't want to change your password.</p>
                  </div>

                  <div className="pp-form-group">
                    <label className="pp-form-label">New Password</label>
                    <input className="pp-form-input" name="newPassword" type="password"
                      value={profile.newPassword} onChange={onFC}
                      placeholder="Enter new password (min. 6 characters)" />
                  </div>
                  <div className="pp-form-group">
                    <label className="pp-form-label">Confirm New Password</label>
                    <input className="pp-form-input" name="confirmPassword" type="password"
                      value={profile.confirmPassword} onChange={onFC}
                      placeholder="Repeat new password" />
                  </div>

                  <button type="submit" className="pp-save-btn" disabled={loading}>
                    <i className="fa-solid fa-shield-halved" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                {/* Security info */}
                <div className="pp-security-info">
                  <h3><i className="fa-solid fa-circle-info" style={{ color: '#3B82F6', marginRight: 8 }} />Account Information</h3>
                  <div className="pp-info-grid">
                    {[
                      { icon: 'fa-user',           label: 'Account Role',     val: user.role },
                      { icon: 'fa-envelope',       label: 'Email',            val: user.email },
                      { icon: 'fa-calendar-plus',  label: 'Member Since',     val: user.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
                      { icon: 'fa-shield-halved',  label: '2FA',              val: 'Not enabled' },
                    ].map(row => (
                      <div key={row.label} className="pp-info-row">
                        <i className={`fa-solid ${row.icon}`} style={{ color: 'var(--primary)', width: 18 }} />
                        <span className="pp-info-label">{row.label}</span>
                        <span className="pp-info-val">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="pp-danger-zone">
                  <h3><i className="fa-solid fa-triangle-exclamation" style={{ color: '#EF4444', marginRight: 8 }} />Danger Zone</h3>
                  <div className="pp-danger-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>Sign out of all devices</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Invalidates all active sessions across your devices.</div>
                    </div>
                    <button className="pp-danger-btn" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Activity Tab ─────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="pp-card">
                <div className="pp-card-header">
                  <h2><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: 'var(--primary)' }} />Recent Activity</h2>
                </div>
                <div className="pp-activity-list">
                  {[
                    { icon: 'fa-user-plus',     color: '#8B5CF6', text: 'Account created',                 time: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently' },
                    { icon: 'fa-book',           color: '#3B82F6', text: 'Profile information updated',     time: 'Recently' },
                    { icon: 'fa-graduation-cap', color: '#10B981', text: 'Enrolled in a new course',        time: 'Recently' },
                    { icon: 'fa-star',           color: '#F59E0B', text: 'Left a course review',            time: 'Recently' },
                  ].map((a, i) => (
                    <div key={i} className="pp-activity-item">
                      <div className="pp-activity-icon" style={{ background: a.color + '18', color: a.color }}>
                        <i className={`fa-solid ${a.icon}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 500 }}>{a.text}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pp-quick-links">
                  <h3><i className="fa-solid fa-bolt" style={{ color: '#F59E0B', marginRight: 8 }} />Quick Links</h3>
                  {[
                    { to: '/my-learning',  icon: 'fa-book-open-reader', label: 'My Learning & Courses' },
                    { to: '/courses',      icon: 'fa-search',           label: 'Browse Courses' },
                    { to: '/learn',        icon: 'fa-graduation-cap',   label: 'Free Courses' },
                    { to: '/pricing',      icon: 'fa-crown',            label: 'Upgrade Plan' },
                    { to: '/become-a-mentor', icon: 'fa-chalkboard-user', label: 'Become a Mentor' },
                  ].map(l => (
                    <Link key={l.to} to={l.to} className="pp-quick-link">
                      <i className={`fa-solid ${l.icon}`} style={{ color: 'var(--primary)', width: 18 }} />
                      {l.label}
                      <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;