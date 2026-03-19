import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { roleColors, roleLabels } from '../theme';
import { sendConnectionRequestNotification } from '../notificationService';

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [matchStats, setMatchStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setCurrentUser(user);

      const [{ data: prof }, { data: conn }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('connections').select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      ]);

      if (prof) setProfile(prof);
      if (conn) {
        const relevant = conn.find(c =>
          (c.sender_id === user.id && c.receiver_id === id) ||
          (c.receiver_id === user.id && c.sender_id === id)
        );
        setConnection(relevant || null);
      }

      // Fetch this player's connections count
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`);
      setConnectionsCount(count || 0);

      // Fetch this player's match stats
      const { data: matches } = await supabase
        .from('matches')
        .select('id, match_date, result, court_name, status, sender_id, receiver_id')
        .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
        .order('match_date', { ascending: false });

      if (matches) {
        const today = new Date().toISOString().split('T')[0];
        const past = matches.filter(m => m.match_date < today && m.status === 'accepted');
        const withResult = past.filter(m => m.result);
        const wins = withResult.filter(m => m.result === 'win').length;
        const losses = withResult.filter(m => m.result === 'loss').length;
        const winPct = withResult.length > 0 ? Math.round((wins / withResult.length) * 100) : null;
        const courts = past.filter(m => m.court_name).map(m => m.court_name);
        const courtCounts = courts.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
        const favCourt = Object.keys(courtCounts).sort((a, b) => courtCounts[b] - courtCounts[a])[0] || null;
        if (past.length > 0) setMatchStats({ total: past.length, wins, losses, winPct, favCourt });
      }

      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const getConnectionStatus = () => {
    if (!connection) return null;
    if (connection.status === 'accepted') return 'accepted';
    if (connection.sender_id === currentUser?.id) return 'pending_sent';
    return 'pending_received';
  };

  const handleConnect = async () => {
    if (!currentUser || connecting) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({ sender_id: currentUser.id, receiver_id: id, status: 'pending' })
        .select().single();
      if (!error && data) {
        setConnection(data);
        await sendConnectionRequestNotification(currentUser.id, id);
      }
    } catch (err) {
      console.error('Connect error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleAccept = async () => {
    if (!connection) return;
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connection.id)
      .select().single();
    if (!error && data) setConnection(data);
  };

  const handleMessage = () => {
    navigate(`/chat/${id}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#9aa0ac', fontSize: '14px' }}>Profile not found.</p>
      </div>
    );
  }

  const accentColor = roleColors[profile.role] || '#0a1628';
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const status = getConnectionStatus();

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate(-1)}>← Back</span>
        <h1 style={styles.headerTitle}>Profile</h1>
        <div style={{ width: '48px' }} />
      </div>

      {/* Hero */}
      <div style={styles.profileHero}>
        <div style={styles.avatarWrapper}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={styles.avatarPhoto} />
          ) : (
            <div style={{ ...styles.avatarLarge, backgroundColor: accentColor }}>
              {initials}
            </div>
          )}
        </div>

        <h2 style={styles.name}>{profile.full_name || 'Unknown'}</h2>

        <span style={{ ...styles.roleBadge, backgroundColor: accentColor + '25', color: accentColor, border: `1px solid ${accentColor}40` }}>
          {roleLabels[profile.role] || 'Member'}
        </span>

        {profile.location && (
          <p style={styles.location}>📍 {profile.location}</p>
        )}

        {profile.utr_rating && (
          <div style={styles.utrBadge}>UTR {profile.utr_rating}</div>
        )}
      </div>

      {/* Stats Row */}
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
          <span style={styles.statValue}>{matchStats ? matchStats.total : '—'}</span>
          <span style={styles.statLabel}>Matches</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionsRow}>
        {status === 'accepted' && (
          <>
            <button style={styles.connectedBtn} disabled>Connected ✓</button>
            <button style={styles.actionBtn} onClick={() => navigate(`/schedule/${id}`)}>🎾 Schedule</button>
            <button style={styles.actionBtn} onClick={handleMessage}>💬 Message</button>
          </>
        )}
        {status === 'pending_sent' && (
          <button style={styles.pendingBtn} disabled>Request Sent…</button>
        )}
        {status === 'pending_received' && (
          <button style={styles.accentBtn} onClick={handleAccept}>Accept Request ✓</button>
        )}
        {!status && (
          <button style={styles.accentBtn} onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Sending…' : '+ Connect'}
          </button>
        )}
      </div>

      {/* About */}
      {profile.bio && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>About</h3>
          <p style={styles.bio}>{profile.bio}</p>
        </div>
      )}

      {/* Match Stats */}
      {matchStats && (
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

      {/* Details */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Details</h3>
        <div style={styles.detailsGrid}>
          {[
            { label: 'Level', value: profile.level },
            { label: 'Availability', value: profile.availability },
            { label: 'Play Style', value: profile.play_style },
            { label: 'Dominant Hand', value: profile.dominant_hand },
            { label: 'Preferred Surface', value: profile.preferred_surface },
            { label: 'Age', value: profile.age },
          ].filter(d => d.value).map(d => (
            <div key={d.label} style={styles.detailItem}>
              <span style={styles.detailLabel}>{d.label}</span>
              <span style={styles.detailValue}>{d.value}</span>
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

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingBottom: '32px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e0e4ea',
    borderTop: '3px solid #0a1628',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '20px 20px 0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    width: '48px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
    letterSpacing: '-0.2px',
  },
  profileHero: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '20px 20px 32px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatarWrapper: { marginBottom: '4px' },
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
  statsRow: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(10,22,40,0.06)',
    margin: '16px 16px 0 16px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '16px',
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
  actionsRow: {
    display: 'flex',
    gap: '10px',
    padding: '16px 16px 0 16px',
    flexWrap: 'wrap',
  },
  accentBtn: {
    flex: 1,
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    border: 'none',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  connectedBtn: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: 'none',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'default',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  pendingBtn: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    color: '#9aa0ac',
    border: '1.5px solid #e0e4ea',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'default',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'white',
    color: '#0a1628',
    border: '1.5px solid #e0e4ea',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  section: {
    margin: '16px 16px 0 16px',
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
};

export default UserProfile;