import { useState } from 'react';
import { theme, roleColors, roleLabels } from '../theme';
import SwipeMode from '../components/SwipeMode';

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

  if (swipeMode) {
    return <SwipeMode onClose={() => setSwipeMode(false)} />;
  }

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

      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Discover</h1>
          <p style={styles.location}>📍 London, UK</p>
        </div>
        <button style={styles.swipeModeBtn} onClick={() => setSwipeMode(true)}>
          🎾 Swipe Mode
        </button>
      </div>

      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
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
              border: filter === f.id ? `2px solid ${theme.colors.primary}` : '2px solid #e0e4ea',
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

      <div style={styles.feed}>
        {filtered.length === 0 ? (
          <div style={styles.noResults}>
            <span style={styles.noResultsEmoji}>🔍</span>
            <p style={styles.noResultsText}>No results found for "{search}"</p>
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
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0a1628',
    margin: '0 0 4px 0',
  },
  location: {
    color: '#9aa0ac',
    fontSize: '13px',
    margin: '0',
  },
  swipeModeBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '10px 16px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(10,22,40,0.2)',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
    marginBottom: '16px',
  },
  searchIcon: { fontSize: '16px' },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#0a1628',
    flex: 1,
    backgroundColor: 'transparent',
  },
  clearSearch: {
    fontSize: '14px',
    color: '#9aa0ac',
    cursor: 'pointer',
    fontWeight: '700',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '700',
  },
  resultsCount: {
    fontSize: '12px',
    color: '#9aa0ac',
    margin: '0 0 12px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  feed: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '18px',
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
  metaItem: { fontSize: '12px', color: '#9aa0ac' },
  metaDot: { color: '#9aa0ac' },
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
  availability: { fontSize: '12px', color: '#9aa0ac' },
  connectBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '8px 18px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  noResults: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  noResultsEmoji: { fontSize: '48px' },
  noResultsText: { fontSize: '15px', color: '#9aa0ac', margin: '0' },
  clearBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '10px 24px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },
};

export default Discovery;
