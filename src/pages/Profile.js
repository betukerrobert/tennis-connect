import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { roleColors, roleLabels } from '../theme';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/'); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
      setForm(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        bio: form.bio,
        location: form.location,
        level: form.level,
        availability: form.availability,
        play_style: form.play_style,
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...form });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Profile not found.</p>
      </div>
    );
  }

  const accentColor = roleColors[profile.role] || '#0a1628';
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <span style={styles.editBtn} onClick={() => editing ? handleSave() : setEditing(true)}>
          {saving ? 'Saving...' : editing ? 'Save ✓' : 'Edit ✏️'}
        </span>
      </div>

      <div style={styles.profileHero}>
        <div style={{ ...styles.avatarLarge, backgroundColor: accentColor }}>
          {initials}
        </div>

        {editing ? (
          <input
            style={styles.editInput}
            value={form.full_name || ''}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            placeholder="Your full name"
          />
        ) : (
          <h2 style={styles.name}>{profile.full_name || 'No name set'}</h2>
        )}

        <span style={{ ...styles.roleBadge, backgroundColor: accentColor + '25', color: accentColor, border: `1px solid ${accentColor}40` }}>
          {roleLabels[profile.role] || 'Member'}
        </span>

        {editing ? (
          <input
            style={styles.editInput}
            value={form.location || ''}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="Your location"
          />
        ) : (
          <p style={styles.location}>📍 {profile.location || 'No location set'}</p>
        )}
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>0</span>
          <span style={styles.statLabel}>Connections</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>New</span>
          <span style={styles.statLabel}>Member</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>Free</span>
          <span style={styles.statLabel}>Plan</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>About</h3>
        {editing ? (
          <textarea
            style={styles.editTextarea}
            value={form.bio || ''}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell others about yourself..."
            rows={3}
          />
        ) : (
          <p style={styles.bio}>
            {profile.bio || 'No bio yet — tap Edit to add one!'}
          </p>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Details</h3>
        <div style={styles.detailsGrid}>
          {[
            { label: 'Level', key: 'level', placeholder: 'e.g. Intermediate' },
            { label: 'Availability', key: 'availability', placeholder: 'e.g. Weekends' },
            { label: 'Play Style', key: 'play_style', placeholder: 'e.g. Baseline' },
          ].map(d => (
            <div key={d.key} style={styles.detailItem}>
              <span style={styles.detailLabel}>{d.label}</span>
              {editing ? (
                <input
                  style={styles.detailEditInput}
                  value={form[d.key] || ''}
                  onChange={e => setForm({ ...form, [d.key]: e.target.value })}
                  placeholder={d.placeholder}
                />
              ) : (
                <span style={styles.detailValue}>{profile[d.key] || '—'}</span>
              )}
            </div>
          ))}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Member Since</span>
            <span style={styles.detailValue}>
              {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {editing && (
        <div style={styles.section}>
          <button style={styles.cancelBtn} onClick={() => { setEditing(false); setForm(profile); }}>
            Cancel
          </button>
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.subscriptionCard}>
          <div style={styles.planLeft}>
            <div style={styles.planIconBox}>⚡</div>
            <div>
              <p style={styles.planName}>Free Plan</p>
              <p style={styles.planDesc}>5 connections per month</p>
            </div>
          </div>
          <button style={styles.upgradeBtn}>Upgrade</button>
        </div>
      </div>

      <div style={styles.section}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    paddingBottom: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e0e4ea',
    borderTop: '3px solid #0a1628',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '13px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '300',
    color: '#0a1628',
    margin: '0',
    letterSpacing: '-0.5px',
  },
  editBtn: {
    color: '#0a1628',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
    backgroundColor: '#f4f6f8',
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1.5px solid #e0e4ea',
  },
  profileHero: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    borderRadius: '20px',
    padding: '28px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  avatarLarge: {
    width: '76px',
    height: '76px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '4px',
  },
  name: {
    margin: '0',
    fontSize: '22px',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '-0.3px',
  },
  roleBadge: {
    fontSize: '11px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  location: {
    margin: '0',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'white',
    outline: 'none',
    width: '80%',
    textAlign: 'center',
  },
  statsRow: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(10,22,40,0.06)',
    marginBottom: '16px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0a1628',
    letterSpacing: '-0.3px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '400',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#e0e4ea',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 10px 0',
  },
  bio: {
    fontSize: '13px',
    color: '#5a6270',
    lineHeight: '1.6',
    backgroundColor: 'white',
    padding: '14px',
    borderRadius: '12px',
    margin: '0',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
    fontWeight: '400',
  },
  editTextarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1.5px solid #e0e4ea',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    resize: 'none',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    boxSizing: 'border-box',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  detailItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
  },
  detailLabel: {
    fontSize: '10px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
    letterSpacing: '-0.2px',
  },
  detailEditInput: {
    border: 'none',
    borderBottom: '1.5px solid #e0e4ea',
    padding: '4px 0',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#9aa0ac',
    padding: '13px',
    borderRadius: '12px',
    border: '1.5px solid #e0e4ea',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  subscriptionCard: {
    backgroundColor: '#0a1628',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  planIconBox: { fontSize: '22px' },
  planName: {
    margin: '0 0 2px 0',
    fontWeight: '600',
    fontSize: '14px',
    color: 'white',
  },
  planDesc: {
    margin: '0',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },
  upgradeBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '8px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#ef4444',
    padding: '13px',
    borderRadius: '12px',
    border: '1.5px solid #ef444440',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default Profile;
