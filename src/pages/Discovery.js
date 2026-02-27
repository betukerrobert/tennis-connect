import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme, roleColors, roleLabels } from '../theme';

const DUMMY_USERS = [
  { id: 1, name: 'Alex Johnson', role: 'player', level: 'Intermediate', location: 'London, UK', bio: 'Looking for a hitting partner on weekends. Play 3x per week.', available: 'Weekends' },
  { id: 2, name: 'Sarah Williams', role: 'coach', level: 'Pro Coach', location: 'Manchester, UK', bio: '10 years coaching experience. Work with all levels from beginner to competitive.', available: 'Mon-Fri' },
  { id: 3, name: 'City Tennis Club', role: 'venue', level: '6 Courts', location: 'Birmingham, UK', bio: 'Indoor and outdoor courts available. Floodlit evenings. Booking required.', available: 'Daily 7am-10pm' },
  { id: 4, name: 'Marco Rossi', role: 'player', level: 'Advanced', location: 'London, UK', bio: 'Competitive player looking for sparring partners at a high level.', available: 'Evenings' },
  { id: 5, name: 'Emma Davis', role: 'coach', level: 'Certified Coach', location: 'London, UK', bio: 'Specialist in junior development and beginner adults. Patient and encouraging.', available: 'Weekdays' },
];

function Discovery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [pressed, setPressed] = useState(null);

  const filtered = filter === 'all' ? DUMMY_USERS : DUMMY_USERS.filter(u => u.role === filter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'player', label: 'Players' },
    { id: 'coach', label: 'Coaches' },
    { id: 'venue', label: 'Venues' },
  ];

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.logo}>Tennis Connect</h1>
          <p style={styles.location}>📍 London, UK</p>
        </div>
        <div style={styles.notifBtn}>🔔</div>
      </div>

      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input style={styles.searchInput} placeholder="Search players, coaches, venues..." />
      </div>

      <div style={styles.filterRow}>
        {filters.map(f => (
          <button
            key={f.id}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f.id ? theme.colors.primary : 'white',
              color: filter === f.id ? theme.colors.accent : theme.colors.gray600,
              border: filter === f.id ? `2px solid ${theme.colors.primary}` : '2px solid #e0e4ea',
              transform: filter === f.id ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s ease',
            }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={styles.feed}>
        <p style={styles.resultsCount}>{filtered.length} results near you</p>
        {filtered.map(user => (
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
              <div style={{ ...styles.avatar, backgroundColor: roleColors[user.role] }}>
                {user.name.charAt(0)}
              </div>
              <div style={styles.cardInfo}>
                <div style={styles.cardNameRow}>
                  <h3 style={styles.cardName}>{user.name}</h3>
                  <span style={{ ...styles.roleBadge, backgroundColor: roleColors[user.role] + '18', color: roleColors[user.role] }}>
                    {roleLabels[user.role]}
                  </span>
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>📍 {user.location}</span>
                  <span style={styles.metaDot}>·</span>
                  <span style={styles.metaItem}>⭐ {user.level}</span>
                </div>
              </div>
            </div>

            <p style={styles.cardBio}>{user.bio}</p>

            <div style={styles.cardFooter}>
              <span style={styles.availability}>🕐 {user.available}</span>
              <button style={styles.connectBtn}>
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.bottomNav}>
        <div style={styles.navItem}>
          <span style={styles.navIcon}>🔍</span>
          <span style={styles.navLabelActive}>Discover</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate('/messages')}>
          <span style={styles.navIcon}>💬</span>
          <span style={styles.navLabel}>Messages</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate('/profile')}>
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabel}>Profile</span>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 2px 0',
    letterSpacing: '-0.3px',
  },
  location: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    margin: '0',
  },
  notifBtn: {
    fontSize: '20px',
    cursor: 'pointer',
  },
  searchBar: {
    margin: '16px',
    backgroundColor: 'white',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
  },
  searchIcon: {
    fontSize: '16px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#0a1628',
    flex: 1,
    backgroundColor: 'transparent',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    padding: '0 16px 16px 16px',
    overflowX: 'auto',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  feed: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  resultsCount: {
    fontSize: '12px',
    color: '#9aa0ac',
    margin: '0 0 4px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 12px rgba(10,22,40,0.07)',
    cursor: 'pointer',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
  },
  cardNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  cardName: {
    margin: '0',
    fontSize: '15px',
    fontWeight: '700',
    color: '#0a1628',
  },
  roleBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '700',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaItem: {
    fontSize: '12px',
    color: '#9aa0ac',
  },
  metaDot: {
    color: '#9aa0ac',
    fontSize: '12px',
  },
  cardBio: {
    fontSize: '13px',
    color: '#5a6270',
    margin: '0 0 14px 0',
    lineHeight: '1.5',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availability: {
    fontSize: '12px',
    color: '#9aa0ac',
  },
  connectBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '8px 18px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0 16px 0',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '3px',
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navLabelActive: {
    fontSize: '10px',
    color: '#c8ff00',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 'bold',
  },
};

export default Discovery;
