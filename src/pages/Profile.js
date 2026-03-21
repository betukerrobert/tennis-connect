import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { roleColors, roleLabels } from '../theme';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({});
  const [matchStats, setMatchStats] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const fileInputRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProfile(); fetchMatchStats(); fetchConnectionsCount(); }, []);

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

  const fetchConnectionsCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count, error } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (!error) setConnectionsCount(count || 0);
  };

  const fetchMatchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: matches } = await supabase
      .from('matches')
      .select('id, match_date, result, court_name, status, sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('match_date', { ascending: false });

    if (!matches) return;

    const today = new Date().toISOString().split('T')[0];
    const past = matches.filter(m => m.match_date < today && m.status === 'accepted');
    const withResult = past.filter(m => m.result);
    const wins = withResult.filter(m => m.result === 'win').length;
    const losses = withResult.filter(m => m.result === 'loss').length;
    const winPct = withResult.length > 0 ? Math.round((wins / withResult.length) * 100) : null;
    const courts = past.filter(m => m.court_name).map(m => m.court_name);
    const courtCounts = courts.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
    const favCourt = Object.keys(courtCounts).sort((a, b) => courtCounts[b] - courtCounts[a])[0] || null;

    setMatchStats({ total: past.length, wins, losses, winPct, favCourt });
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
        preferred_surface: form.preferred_surface,
        age: form.age ? parseInt(form.age) : null,
        open_to_sparring: form.open_to_sparring || false,
        sparring_rate: form.sparring_rate ? parseFloat(form.sparring_rate) : null,
        also_coaches: form.also_coaches || false,
        coaching_rate: form.coaching_rate ? parseFloat(form.coaching_rate) : null,
        coaching_specialisation: form.coaching_specialisation || null,
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, ...form });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      setForm(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    } catch (err) {
      console.error('Upload error:', err.message);
    } finally {
      setUploading(false);
    }
  };

  // Save extras immediately on toggle (no need to be in edit mode)
  const handleToggleSparring = async () => {
    const newVal = !profile.open_to_sparring;
    setProfile(prev => ({ ...prev, open_to_sparring: newVal }));
    setForm(prev => ({ ...prev, open_to_sparring: newVal }));
    await supabase.from('profiles').update({ open_to_sparring: newVal }).eq('id', profile.id);
  };

  const handleToggleCoaching = async () => {
    const newVal = !profile.also_coaches;
    setProfile(prev => ({ ...prev, also_coaches: newVal }));
    setForm(prev => ({ ...prev, also_coaches: newVal }));
    await supabase.from('profiles').update({ also_coaches: newVal }).eq('id', profile.id);
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

  const surfaceOptions = ['Hard', 'Clay', 'Grass', 'Indoor'];
  const specialisationOptions = ['Beginner', 'Intermediate', 'Advanced', 'Kids'];

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <span style={styles.editBtn} onClick={() => editing ? handleSave() : setEditing(true)}>
          {saving ? 'Saving...' : editing ? 'Save ✓' : 'Edit ✏️'}
        </span>
      </div>

      <div style={styles.profileHero}>
        <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={styles.avatarPhoto} />
          ) : (
            <div style={{ ...styles.avatarLarge, backgroundColor: accentColor }}>
              {initials}
            </div>
          )}
          <div style={styles.avatarOverlay}>
            {uploading ? '⏳' : '📷'}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
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

        {/* Extra badges shown in hero */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {profile.open_to_sparring && (
            <span style={styles.extraBadge}>⚡ Sparring</span>
          )}
          {profile.also_coaches && (
            <span style={{ ...styles.extraBadge, backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}>📋 Coach</span>
          )}
        </div>

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

        {profile.utr_rating && (
          <div style={styles.utrBadge}>UTR {profile.utr_rating}</div>
        )}
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{connectionsCount}</span>
          <span style={styles.statLabel}>Connections</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          {profile.total_ratings > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={styles.statValue}>{profile.average_rating}</span>
                <span style={{ fontSize: '16px' }}>⭐</span>
              </div>
              <span style={styles.statLabel}>{profile.total_ratings} Rating{profile.total_ratings !== 1 ? 's' : ''}</span>
            </>
          ) : (
            <>
              <span style={styles.statValue}>—</span>
              <span style={styles.statLabel}>No Ratings</span>
            </>
          )}
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>Free</span>
          <span style={styles.statLabel}>Plan</span>
        </div>
      </div>

      {/* My Matches button */}
      <div style={styles.section}>
        <button style={styles.matchesBtn} onClick={() => navigate('/matches')}>
          🎾 My Matches
        </button>
      </div>

      {/* Match Stats */}
      {matchStats && matchStats.total > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Match Stats</h3>
          <div style={styles.statsCard}>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={styles.statBoxVal}>{matchStats.total}</span>
                <span style={styles.statBoxLabel}>Played</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ ...styles.statBoxVal, color: '#10b981' }}>{matchStats.wins}</span>
                <span style={styles.statBoxLabel}>Wins</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ ...styles.statBoxVal, color: '#ef4444' }}>{matchStats.losses}</span>
                <span style={styles.statBoxLabel}>Losses</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statBoxVal}>{matchStats.winPct !== null ? `${matchStats.winPct}%` : '—'}</span>
                <span style={styles.statBoxLabel}>Win Rate</span>
              </div>
            </div>
            {matchStats.favCourt && (
              <div style={styles.favCourtRow}>
                <span>📍</span>
                <span style={styles.favCourtText}>Favourite court: <strong>{matchStats.favCourt}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

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

          {/* Preferred Surface */}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Preferred Surface</span>
            {editing ? (
              <select
                style={styles.detailEditSelect}
                value={form.preferred_surface || ''}
                onChange={e => setForm({ ...form, preferred_surface: e.target.value })}
              >
                <option value="">Select...</option>
                {surfaceOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <span style={styles.detailValue}>{profile.preferred_surface || '—'}</span>
            )}
          </div>

          {/* Age */}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Age</span>
            {editing ? (
              <input
                style={styles.detailEditInput}
                type="number"
                value={form.age || ''}
                onChange={e => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 28"
                min="10"
                max="99"
              />
            ) : (
              <span style={styles.detailValue}>{profile.age || '—'}</span>
            )}
          </div>

          {profile.dominant_hand && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Dominant Hand</span>
              <span style={styles.detailValue}>{profile.dominant_hand}</span>
            </div>
          )}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Member Since</span>
            <span style={styles.detailValue}>
              {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Extras Section ─────────────────────────────────────────── */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Extras</h3>

        {/* Sparring Toggle */}
        <div style={styles.extraCard}>
          <div style={styles.extraCardTop}>
            <div style={styles.extraCardLeft}>
              <div style={{ ...styles.extraIconBox, backgroundColor: 'rgba(200,255,0,0.1)' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
              </div>
              <div>
                <p style={styles.extraTitle}>Open to Sparring</p>
                <p style={styles.extraDesc}>Let others book you as a sparring partner</p>
              </div>
            </div>
            <div
              style={{ ...styles.toggle, backgroundColor: profile.open_to_sparring ? '#c8ff00' : '#e0e4ea' }}
              onClick={handleToggleSparring}
            >
              <div style={{ ...styles.toggleKnob, transform: profile.open_to_sparring ? 'translateX(20px)' : 'translateX(2px)' }} />
            </div>
          </div>

          {profile.open_to_sparring && (
            <div style={styles.extraFields}>
              <div style={styles.extraFieldRow}>
                <span style={styles.extraFieldLabel}>Hourly Rate (€)</span>
                {editing ? (
                  <input
                    style={styles.extraFieldInput}
                    type="number"
                    value={form.sparring_rate || ''}
                    onChange={e => setForm({ ...form, sparring_rate: e.target.value })}
                    placeholder="e.g. 15"
                    min="0"
                  />
                ) : (
                  <span
                    style={profile.sparring_rate ? styles.extraFieldValue : styles.extraFieldNotSet}
                    onClick={() => { if (!profile.sparring_rate) setEditing(true); }}
                  >
                    {profile.sparring_rate ? `€${profile.sparring_rate}/hr` : 'Tap to set rate ✏️'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coaching Toggle */}
        <div style={{ ...styles.extraCard, marginTop: '10px' }}>
          <div style={styles.extraCardTop}>
            <div style={styles.extraCardLeft}>
              <div style={{ ...styles.extraIconBox, backgroundColor: 'rgba(168,85,247,0.1)' }}>
                <span style={{ fontSize: '20px' }}>📋</span>
              </div>
              <div>
                <p style={styles.extraTitle}>I Also Coach</p>
                <p style={styles.extraDesc}>Show up as a coach on your profile</p>
              </div>
            </div>
            <div
              style={{ ...styles.toggle, backgroundColor: profile.also_coaches ? '#a855f7' : '#e0e4ea' }}
              onClick={handleToggleCoaching}
            >
              <div style={{ ...styles.toggleKnob, transform: profile.also_coaches ? 'translateX(20px)' : 'translateX(2px)' }} />
            </div>
          </div>

          {profile.also_coaches && (
            <div style={styles.extraFields}>
              <div style={styles.extraFieldRow}>
                <span style={styles.extraFieldLabel}>Hourly Rate (€)</span>
                {editing ? (
                  <input
                    style={styles.extraFieldInput}
                    type="number"
                    value={form.coaching_rate || ''}
                    onChange={e => setForm({ ...form, coaching_rate: e.target.value })}
                    placeholder="e.g. 40"
                    min="0"
                  />
                ) : (
                  <span
                    style={profile.coaching_rate ? styles.extraFieldValue : styles.extraFieldNotSet}
                    onClick={() => { if (!profile.coaching_rate) setEditing(true); }}
                  >
                    {profile.coaching_rate ? `€${profile.coaching_rate}/hr` : 'Tap to set rate ✏️'}
                  </span>
                )}
              </div>
              <div style={styles.extraFieldRow}>
                <span style={styles.extraFieldLabel}>Specialisation</span>
                {editing ? (
                  <select
                    style={styles.extraFieldSelect}
                    value={form.coaching_specialisation || ''}
                    onChange={e => setForm({ ...form, coaching_specialisation: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {specialisationOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span
                    style={profile.coaching_specialisation ? styles.extraFieldValue : styles.extraFieldNotSet}
                    onClick={() => { if (!profile.coaching_specialisation) setEditing(true); }}
                  >
                    {profile.coaching_specialisation || 'Tap to set ✏️'}
                  </span>
                )}
              </div>
            </div>
          )}
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
  avatarWrapper: {
    position: 'relative',
    cursor: 'pointer',
    marginBottom: '4px',
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
  },
  avatarPhoto: {
    width: '76px',
    height: '76px',
    borderRadius: '20px',
    objectFit: 'cover',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    backgroundColor: '#c8ff00',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
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
  extraBadge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    fontWeight: '500',
    letterSpacing: '0.3px',
    backgroundColor: 'rgba(200,255,0,0.15)',
    color: '#c8ff00',
    border: '1px solid rgba(200,255,0,0.3)',
  },
  utrBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#c8ff00',
    backgroundColor: 'rgba(200,255,0,0.12)',
    padding: '4px 12px',
    borderRadius: '999px',
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
  matchesBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    letterSpacing: '0.2px',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '8px',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  statBoxVal: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0a1628',
    letterSpacing: '-0.3px',
  },
  statBoxLabel: {
    fontSize: '9px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '500',
  },
  favCourtRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingTop: '8px',
    borderTop: '1px solid #f0f2f5',
    fontSize: '13px',
  },
  favCourtText: {
    fontSize: '12px',
    color: '#5a6270',
    fontWeight: '400',
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
  detailEditSelect: {
    border: 'none',
    borderBottom: '1.5px solid #e0e4ea',
    padding: '4px 0',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    width: '100%',
  },
  extraCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
  },
  extraCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  extraIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  extraTitle: {
    margin: '0 0 2px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
  },
  extraDesc: {
    margin: '0',
    fontSize: '11px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  toggle: {
    width: '44px',
    height: '26px',
    borderRadius: '999px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
  extraFields: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid #f0f2f5',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  extraFieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraFieldLabel: {
    fontSize: '12px',
    color: '#5a6270',
    fontWeight: '500',
  },
  extraFieldValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0a1628',
  },
  extraFieldNotSet: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#9aa0ac',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
  },
  extraFieldInput: {
    border: 'none',
    borderBottom: '1.5px solid #e0e4ea',
    padding: '4px 8px',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    width: '80px',
    textAlign: 'right',
  },
  extraFieldSelect: {
    border: 'none',
    borderBottom: '1.5px solid #e0e4ea',
    padding: '4px 0',
    fontSize: '13px',
    color: '#0a1628',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    width: '140px',
    textAlign: 'right',
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