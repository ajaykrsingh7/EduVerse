import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast, Toast } from './AdminComponents';

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="ad-settings-row">
    <div>
      <div className="ad-settings-row__label">{label}</div>
      {desc && <div className="ad-settings-row__desc">{desc}</div>}
    </div>
    <label className="ad-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="ad-toggle__slider" />
    </label>
  </div>
);

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast, show, clear } = useToast();

  const [profile, setProfile] = useState({
    fullName: user?.full_name || '',
    email:    user?.email || '',
    password: '',
    confirmPassword: '',
  });

  const [platform, setPlatform] = useState({
    maintenanceMode:      false,
    allowRegistrations:   true,
    emailNotifications:   true,
    autoApproveMentors:   false,
    requireEmailVerify:   false,
    showPricingPage:      true,
  });

  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    if (profile.password && profile.password !== profile.confirmPassword) {
      show('Passwords do not match', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = { fullName: profile.fullName };
      if (profile.password) payload.password = profile.password;
      await authAPI.updateMe(payload);
      show('Profile updated successfully');
      setProfile(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      show(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const platChange = (key, val) => setPlatform(p => ({ ...p, [key]: val }));

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Admin Profile ───────────────────────────────────────────── */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Admin Profile</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: 'var(--ad-surface2)', borderRadius: 10 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--ad-primary-g)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff',
              boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
            }}>
              {user?.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{user?.full_name}</div>
              <div style={{ fontSize: 13, color: 'var(--ad-muted)' }}>{user?.email}</div>
              <span className="ad-pill ad-pill--danger" style={{ marginTop: 6, display: 'inline-block' }}>Administrator</span>
            </div>
          </div>

          <div className="ad-form-group">
            <label className="ad-form-label">Full Name</label>
            <input className="ad-form-input" value={profile.fullName}
              onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Email Address</label>
            <input className="ad-form-input" value={profile.email} disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div className="ad-divider" />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ad-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Change Password</div>
          <div className="ad-form-group">
            <label className="ad-form-label">New Password</label>
            <input className="ad-form-input" type="password" placeholder="Leave blank to keep current"
              value={profile.password}
              onChange={e => setProfile(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Confirm New Password</label>
            <input className="ad-form-input" type="password" placeholder="Repeat new password"
              value={profile.confirmPassword}
              onChange={e => setProfile(p => ({ ...p, confirmPassword: e.target.value }))} />
          </div>
          <button className="ad-btn ad-btn--primary" onClick={handleProfileSave} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? 'Saving…' : 'Save Profile Changes'}
          </button>
        </div>

        {/* ── Platform Settings ───────────────────────────────────────── */}
        <div>
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div className="admin-card__header">
              <div className="admin-card__title">Platform Settings</div>
            </div>

            <div className="ad-settings-section">
              <h3>Registration &amp; Access</h3>
              <p>Control who can sign up and access the platform.</p>
              <ToggleRow label="Allow New Registrations" desc="Let users create accounts"
                checked={platform.allowRegistrations} onChange={v => platChange('allowRegistrations', v)} />
              <ToggleRow label="Require Email Verification" desc="New users must verify their email"
                checked={platform.requireEmailVerify} onChange={v => platChange('requireEmailVerify', v)} />
              <ToggleRow label="Auto-Approve Mentor Applications" desc="Skip manual review process"
                checked={platform.autoApproveMentors} onChange={v => platChange('autoApproveMentors', v)} />
            </div>

            <div className="ad-settings-section">
              <h3>Notifications</h3>
              <p>Configure platform notification behaviour.</p>
              <ToggleRow label="Email Notifications" desc="Send emails for enrollments and updates"
                checked={platform.emailNotifications} onChange={v => platChange('emailNotifications', v)} />
              <ToggleRow label="Show Pricing Page" desc="Display pricing plans to visitors"
                checked={platform.showPricingPage} onChange={v => platChange('showPricingPage', v)} />
            </div>

            <div className="ad-settings-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <h3 style={{ color: 'var(--ad-warning)' }}>⚠ Maintenance Mode</h3>
              <p>When enabled, the public site shows a maintenance message.</p>
              <ToggleRow label="Enable Maintenance Mode" desc="Only admins can access the site"
                checked={platform.maintenanceMode} onChange={v => platChange('maintenanceMode', v)} />
            </div>
          </div>

          {/* ── Danger zone ─────────────────────────────────────────── */}
          <div className="admin-card" style={{ border: '1px solid rgba(255,107,107,0.3)' }}>
            <div className="admin-card__header">
              <div className="admin-card__title" style={{ color: 'var(--ad-accent)' }}>🚨 Danger Zone</div>
            </div>
            {[
              { label: 'Clear Newsletter List',  desc: 'Remove all newsletter subscriptions permanently.',     btn: 'Clear List' },
              { label: 'Delete All Reviews',     desc: 'Permanently delete all course and mentor reviews.',     btn: 'Delete Reviews' },
              { label: 'Reset Demo Data',        desc: 'Restore the database to seeded demo state.',           btn: 'Reset Demo' },
            ].map(item => (
              <div key={item.label} className="ad-settings-row" style={{ borderBottom: '1px solid rgba(255,107,107,0.1)' }}>
                <div>
                  <div className="ad-settings-row__label">{item.label}</div>
                  <div className="ad-settings-row__desc">{item.desc}</div>
                </div>
                <button
                  className="ad-btn ad-btn--danger ad-btn--sm"
                  onClick={() => show(`"${item.label}" is disabled in demo mode`, 'error')}
                >
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;