import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, roleColors, roleLabels } from '../theme';
import SwipeMode from '../components/SwipeMode';
import Logo from '../components/Logo';
import { supabase } from '../supabase';
import { sendConnectionRequestNotification } from '../notificationService';

// ── Haversine formula — calculates distance in km between two coordinates ──
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}
// ──────────────────────────────────────────────────────────────────────────

function Discovery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pressed, setPressed] = useState(null);
  const [swipeMode, setSwipeMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data } = await supabase
      .from('profiles')
      .select('latitude, longitude')
      .eq('id', user.id)
      .single();

    if (data) setMyProfile(data);

    const { data: conns } = await supabase
      .from('connections')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (conns) setConnections(conns);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const getConnectionStatus = (otherUserId) => {
    const conn = connections.find(c =>
      (c.sender_id === currentUser?.id && c.receiver_id === otherUserId) ||
      (c.receiver_id === currentUser?.id && c.sender_id === otherUserId)
    );
    if (!conn) return null;
    if (conn.status === 'accepted') return 'accepted';
    if (conn.sender_id === currentUser?.id) return 'pending_sent';
    return 'pending_received';
  };

  const handleConnect = async (otherUserId) => {
    if (!currentUser || connecting) return;
    setConnecting(otherUserId);
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({ sender_id: currentUser.id, receiver_id: otherUserId, status: 'pending' })
        .select()
        .single();

      if (!error && data) {
        setConnections(prev => [...prev, data]);
        
        // Send push notification
        await sendConnectionRequestNotification(currentUser.id, otherUserId);
      }
    } catch (err) {
      console.error('Connect error:', err);
    } finally {
      setConnecting(null);
    }
  };

  const handleAccept = async (otherUserId) => {
    const conn = connections.find(c =>
      c.sender_id === otherUserId && c.receiver_id === currentUser?.id
    );
    if (!conn) return;
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', conn.id)
      .select()
      .single();

    if (!error && data) {
      setConnections(prev => prev.map(c => c.id === data.id ? data : c));
    }
  };

  if (swipeMode) return <SwipeMode onClose={() => setSwipeMode(false)} users={users} />;

  const filtered = users
    .filter(u => {
      if (currentUser && u.id === currentUser.id) return false;
      const matchesFilter = filter === 'all' || u.role === filter;
      const matchesSearch = search === '' ||
        (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (u.location && u.location.toLowerCase().includes(search.toLowerCase())) ||
        (u.level && u.level.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    })
    .map(u => {
      if (
        myProfile?.latitude && myProfile?.longitude &&
        u.latitude && u.longitude
      ) {
        const km = getDistanceKm(myProfile.latitude, myProfile.longitude, u.latitude, u.longitude);
        return { ...u, distanceKm: km };
      }
      return { ...u, distanceKm: null };
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'player', label: 'Players' },
    { id: 'coach', label: 'Coaches' },
    { id: 'venue', label: 'Venues' },
  ];

  return (
    <div style={styles.container}>

      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <Logo size="md" dark={true} />
          {myProfile?.latitude
            ? <span style={styles.locationPill}>📍 Location active</span>
            : <span style={styles.locationPill}>📍 Enable location for nearby results</span>
          }
        </div>
        <button style={styles.swipeModeBtn} onClick={() => setSwipeMode(true)}>
          Swipe Mode
        </button>
      </div>

      <h1 style={styles.pageTitle}>Discover</h1>
      <p style={styles.pageSubtitle}>Find players, coaches and venues near you</p>

      <div style={styles.searchBar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0ac" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search by name, location or level..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <span style={styles.clearSearch} onClick={() => setSearch('')}>✕</span>
        )}
      </div>

      <div style={styles.filterRow}>
        {filters.map(f => (
          <button
            key={f.id}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f.id ? theme.colors.primary : 'white',
              color: filter === f.id ? theme.colors.accent : theme.colors.gray600,
              border: filter === f.id ? `1.5px solid ${theme.colors.primary}` : '1.5px solid #e0e4ea',
              transition: 'all 0.15s ease',
            }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Finding people near you...</p>
        </div>
      ) : (
        <>
          <p style={styles.resultsCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} near you
          </p>

          <div style={styles.feed}>
            {filtered.length === 0 ? (
              <div style={styles.noResults}>
                {search ? (
                  <>
                    <p style={styles.noResultsText}>No results for "{search}"</p>
                    <button style={styles.clearBtn} onClick={() => setSearch('')}>Clear Search</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '40px' }}>🎾</span>
                    <p style={styles.noResultsText}>No players found yet.</p>
                    <p style={styles.noResultsSubtext}>Be the first to invite friends!</p>
                  </>
                )}
              </div>
            ) : (
              filtered.map(user => (
                <div
                  key={user.id}
                  style={{
                    ...styles.card,
                    transform: pressed === user.id ? 'scale(0.98)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={() => setPressed(user.id)}
                  onMouseUp={() => setPressed(null)}
                  onMouseLeave={() => setPressed(null)}
                >
                  <div style={styles.cardTop}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" style={styles.avatarPhoto} />
                    ) : (
                      <div style={{ ...styles.avatar, backgroundColor: roleColors[user.role] || '#0a1628' }}>
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div style={styles.cardInfo}>
                      <div style={styles.cardNameRow}>
                        <h3 style={styles.cardName}>{user.full_name || 'Unknown'}</h3>
                        {user.role && (
                          <span style={{ ...styles.roleBadge, backgroundColor: roleColors[user.role] + '15', color: roleColors[user.role] }}>
                            {roleLabels[user.role]}
                          </span>
                        )}
                      </div>
                      <div style={styles.cardMeta}>
                        {user.distanceKm !== null
                          ? <span style={styles.metaItem}>📍 {formatDistance(user.distanceKm)}</span>
                          : user.location
                            ? <span style={styles.metaItem}>📍 {user.location}</span>
                            : null
                        }
                        {user.level && <>
                          <span style={styles.metaDot}>·</span>
                          <span style={styles.metaItem}>⭐ {user.level}</span>
                        </>}
                        {user.utr_rating && <>
                          <span style={styles.metaDot}>·</span>
                          <span style={styles.metaItem}>UTR {user.utr_rating}</span>
                        </>}
                        {user.average_rating > 0 && <>
                          <span style={styles.metaDot}>·</span>
                          <span style={styles.metaItem}>{user.average_rating} ⭐</span>
                        </>}
                      </div>
                    </div>
                  </div>
                  {user.bio && <p style={styles.cardBio}>{user.bio}</p>}
                  <div style={styles.cardFooter}>
                    {user.availability && <span style={styles.availability}>🕐 {user.availability}</span>}
                    {(() => {
                      const status = getConnectionStatus(user.id);
                      if (status === 'accepted') return (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={styles.connectedBtn} disabled>Connected ✓</button>
                          <button
                            style={styles.scheduleBtn}
                            onClick={(e) => { e.stopPropagation(); navigate(`/schedule/${user.id}`); }}
                          >
                            🎾
                          </button>
                        </div>
                      );
                      if (status === 'pending_sent') return (
                        <button style={styles.pendingBtn} disabled>Pending…</button>
                      );
                      if (status === 'pending_received') return (
                        <button style={styles.acceptBtn} onClick={() => handleAccept(user.id)}>Accept ✓</button>
                      );
                      return (
                        <button
                          style={styles.connectBtn}
                          onClick={() => handleConnect(user.id)}
                          disabled={connecting === user.id}
                        >
                          {connecting === user.id ? '...' : 'Connect'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  topBarLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  locationPill: {
    fontSize: '11px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  swipeModeBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(10,22,40,0.18)',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '300',
    color: '#0a1628',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#9aa0ac',
    margin: '0 0 20px 0',
    fontWeight: '400',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    padding: '11px 14px',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
    marginBottom: '14px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0a1628',
    flex: 1,
    backgroundColor: 'transparent',
    fontWeight: '400',
  },
  clearSearch: {
    fontSize: '13px',
    color: '#9aa0ac',
    cursor: 'pointer',
    fontWeight: '500',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: '999px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
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
  resultsCount: {
    fontSize: '11px',
    color: '#9aa0ac',
    margin: '0 0 12px 0',
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  feed: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '18px',
    boxShadow: '0 2px 10px rgba(10,22,40,0.06)',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  avatarPhoto: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  cardName: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a1628',
    letterSpacing: '-0.2px',
  },
  roleBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '500',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  metaItem: { fontSize: '11px', color: '#9aa0ac' },
  metaDot: { color: '#e0e4ea' },
  cardBio: {
    fontSize: '12.5px',
    color: '#5a6270',
    margin: '0 0 12px 0',
    lineHeight: '1.6',
    fontWeight: '400',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availability: { fontSize: '11px', color: '#9aa0ac' },
  connectBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '7px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  connectedBtn: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '7px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'default',
  },
  scheduleBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '7px 10px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  pendingBtn: {
    backgroundColor: '#f4f6f8',
    color: '#9aa0ac',
    padding: '7px 16px',
    borderRadius: '999px',
    border: '1.5px solid #e0e4ea',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'default',
  },
  acceptBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '7px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  noResults: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '10px',
    textAlign: 'center',
  },
  noResultsText: { fontSize: '14px', color: '#9aa0ac', margin: '0', fontWeight: '400' },
  noResultsSubtext: { fontSize: '12px', color: '#c8ff00', margin: '0', fontWeight: '500' },
  clearBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '9px 22px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Discovery;
