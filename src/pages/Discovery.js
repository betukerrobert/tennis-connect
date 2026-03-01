import { useState } from 'react';
import { theme, roleColors, roleLabels } from '../theme';
import SwipeMode from '../components/SwipeMode';
import Logo from '../components/Logo';

const DUMMY_USERS = [
  { id: 1, name: 'Alex Johnson', role: 'player', level: 'Intermediate', location: 'London, UK', bio: 'Looking for a hitting partner on weekends. Play 3x per week.', available: 'Weekends' },
  { id: 2, name: 'Sarah Williams', role: 'coach', level: 'Pro Coach', location: 'Manchester, UK', bio: '10 years coaching experience. Work with all levels from beginner to competitive.', available: 'Mon-Fri' },
  { id: 3, name: 'City Tennis Club', role: 'venue', level: '6 Courts', location: 'Birmingham, UK', bio: 'Indoor and outdoor courts available. Floodlit evenings. Booking required.', available: 'Daily 7am-10pm' },
  { id: 4, name: 'Marco Rossi', role: 'player', level: 'Advanced', location: 'London, UK', bio: 'Competitive player looking for sparring partners at a high level.', available: 'Evenings' },
  { id: 5, name: 'Emma Davis', role: 'coach', level: 'Certified Coach', location: 'London, UK', bio: 'Specialist in junior development and beginner adults. Patient and encouraging.', available: 'Weekdays' },
];

function Discovery() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pressed, setPressed] = useState(null);
  const [swipeMode, setSwipeMode] = useState(false);

  if (swipeMode) return <SwipeMode onClose={() => setSwipeMode(false)} />;

  const filtered = DUMMY_USERS.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase()) ||
      u.level.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'player', label: 'Players' },
    { id: 'coach', label: 'Coaches' },
    { id: 'venue', label: 'Venues' },
  ];

  return (
    <div style={styles.container}>

      {/* Header with Logo */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <Logo size="md" dark={true} />
          <span style={styles.locationPill}>📍 London, UK</span>
        </div>
        <button style={styles.swipeModeBtn} onClick={() => setSwipeMode(true)}>
          Swipe Mode
        </button>
      </div>

      {/* Page title */}
      <h1 style={styles.pageTitle}>Discover</h1>
      <p style={styles.pageSubtitle}>Find players, coaches and venues near you</p>

      {/* Search */}
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

      {/* Filters */}
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

      <p style={styles.resultsCount}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''} near you
      </p>

      {/* Cards */}
      <div style={styles.feed}>
        {filtered.length === 0 ? (
          <div style={styles.noResults}>
            <p style={styles.noResultsText}>No results for "{search}"</p>
            <button style={styles.clearBtn} onClick={() => setSearch('')}>Clear Search</button>
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
                <div style={{ ...styles.avatar, backgroundColor: roleColors[user.role] }}>
                  {user.name.charAt(0)}
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardNameRow}>
                    <h3 style={styles.cardName}>{user.name}</h3>
                    <span style={{ ...styles.roleBadge, backgroundColor: roleColors[user.role] + '15', color: roleColors[user.role] }}>
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
                <button style={styles.connectBtn}>Connect</button>
              </div>
            </div>
          ))
        )}
      </div>

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
    letterSpacing: '0.3px',
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
    letterSpacing: '0.3px',
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
    letterSpacing: '0.2px',
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
    letterSpacing: '0.3px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
    letterSpacing: '0.2px',
  },
  noResults: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  noResultsText: { fontSize: '14px', color: '#9aa0ac', margin: '0', fontWeight: '400' },
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
