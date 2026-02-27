import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DUMMY_USERS = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'player',
    level: 'Intermediate',
    location: 'London, UK',
    bio: 'Looking for a hitting partner on weekends. Play 3x per week.',
    available: 'Weekends',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'coach',
    level: 'Pro Coach',
    location: 'Manchester, UK',
    bio: '10 years coaching experience. Work with all levels from beginner to competitive.',
    available: 'Mon-Fri',
  },
  {
    id: 3,
    name: 'City Tennis Club',
    role: 'venue',
    level: '6 Courts',
    location: 'Birmingham, UK',
    bio: 'Indoor and outdoor courts available. Floodlit evenings. Booking required.',
    available: 'Daily 7am-10pm',
  },
  {
    id: 4,
    name: 'Marco Rossi',
    role: 'player',
    level: 'Advanced',
    location: 'London, UK',
    bio: 'Competitive player looking for sparring partners at a high level.',
    available: 'Evenings',
  },
  {
    id: 5,
    name: 'Emma Davis',
    role: 'coach',
    level: 'Certified Coach',
    location: 'London, UK',
    bio: 'Specialist in junior development and beginner adults. Patient and encouraging.',
    available: 'Weekdays',
  },
];

const roleColors = {
  player: '#1565c0',
  coach: '#6a1b9a',
  venue: '#e65100',
};

const roleLabels = {
  player: 'Player',
  coach: 'Coach',
  venue: 'Venue',
};

function Discovery() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? DUMMY_USERS
    : DUMMY_USERS.filter(u => u.role === filter);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.logo}>Tennis Connect</h1>
        <p style={styles.location}>📍 London, UK</p>
      </div>

      <div style={styles.filterRow}>
        {['all', 'player', 'coach', 'venue'].map(f => (
          <button
            key={f}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? '#2e7d32' : 'white',
              color: filter === f ? 'white' : '#333',
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : roleLabels[f] + 's'}
          </button>
        ))}
      </div>

      <div style={styles.feed}>
        {filtered.map(user => (
          <div key={user.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div style={styles.avatar}>
                {user.name.charAt(0)}
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardName}>{user.name}</h3>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: roleColors[user.role],
                }}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <p style={styles.cardBio}>{user.bio}</p>
            <div style={styles.cardMeta}>
              <span style={styles.metaItem}>📍 {user.location}</span>
              <span style={styles.metaItem}>⭐ {user.level}</span>
              <span style={styles.metaItem}>🕐 {user.available}</span>
            </div>
            <button style={styles.connectBtn}>
              Connect
            </button>
          </div>
        ))}
      </div>

      <div style={styles.bottomNav}>
        <div style={styles.navItem}>
          <span style={styles.navIcon}>🔍</span>
          <span style={styles.navLabel}>Discover</span>
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
    fontFamily: 'Arial, sans-serif',
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingBottom: '80px',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '20px',
    margin: '0',
  },
  location: {
    color: 'white',
    fontSize: '13px',
    margin: '0',
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  filterBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  feed: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardName: {
    margin: '0',
    fontSize: '16px',
    color: '#1a1a1a',
  },
  roleBadge: {
    color: 'white',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    display: 'inline-block',
    fontWeight: 'bold',
  },
  cardBio: {
    fontSize: '13px',
    color: '#555',
    margin: '0 0 10px 0',
    lineHeight: '1.4',
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  metaItem: {
    fontSize: '12px',
    color: '#888',
  },
  connectBtn: {
    width: '100%',
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'white',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '11px',
    color: '#888',
    marginTop: '2px',
  },
};

export default Discovery;
