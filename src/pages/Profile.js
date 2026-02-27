import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

function Profile() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <span style={styles.editBtn}>Edit ✏️</span>
      </div>

      <div style={styles.profileHero}>
        <div style={styles.avatarLarge}>R</div>
        <h2 style={styles.name}>Robert</h2>
        <span style={styles.roleBadge}>🎾 Player</span>
        <p style={styles.location}>📍 London, UK</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>12</span>
          <span style={styles.statLabel}>Connections</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>4.8</span>
          <span style={styles.statLabel}>Rating</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>3</span>
          <span style={styles.statLabel}>Sessions</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>About</h3>
        <p style={styles.bio}>
          Passionate tennis player looking for hitting partners and coaches.
          Play 3-4 times per week. Love competitive matches!
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Details</h3>
        <div style={styles.detailsGrid}>
          {[
            { label: 'Level', value: 'Intermediate' },
            { label: 'Availability', value: 'Weekends' },
            { label: 'Play Style', value: 'Baseline' },
            { label: 'Member Since', value: 'Feb 2026' },
          ].map(d => (
            <div key={d.label} style={styles.detailItem}>
              <span style={styles.detailLabel}>{d.label}</span>
              <span style={styles.detailValue}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

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
        <button style={styles.logoutBtn} onClick={() => navigate('/')}>
          Log Out
        </button>
      </div>

      <div style={styles.bottomNav}>
        <div style={styles.navItem} onClick={() => navigate('/discovery')}>
          <span style={styles.navIcon}>🔍</span>
          <span style={styles.navLabel}>Discover</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate('/messages')}>
          <span style={styles.navIcon}>💬</span>
          <span style={styles.navLabel}>Messages</span>
        </div>
        <div style={styles.navItem}>
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabelActive}>Profile</span>
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
  headerTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '800',
    margin: '0',
  },
  editBtn: {
    color: '#c8ff00',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '700',
  },
  profileHero: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '0 20px 32px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  avatarLarge: {
    width: '84px',
    height: '84px',
    borderRadius: '24px',
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '38px',
    fontWeight: '800',
    marginBottom: '4px',
  },
  name: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '800',
    color: 'white',
  },
  roleBadge: {
    backgroundColor: 'rgba(200,255,0,0.15)',
    color: '#c8ff00',
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontWeight: '700',
    border: '1px solid rgba(200,255,0,0.3)',
  },
  location: {
    margin: '0',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
  },
  statsRow: {
    backgroundColor: 'white',
    margin: '16px',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(10,22,40,0.07)',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0a1628',
  },
  statLabel: {
    fontSize: '11px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#e0e4ea',
  },
  section: {
    padding: '0 16px 16px 16px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0',
  },
  bio: {
    fontSize: '14px',
    color: '#5a6270',
    lineHeight: '1.6',
    backgroundColor: 'white',
    padding: '14px',
    borderRadius: '14px',
    margin: '0',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  detailItem: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.05)',
  },
  detailLabel: {
    fontSize: '10px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0a1628',
  },
  subscriptionCard: {
    backgroundColor: '#0a1628',
    borderRadius: '16px',
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
  planIconBox: {
    fontSize: '24px',
  },
  planName: {
    margin: '0 0 2px 0',
    fontWeight: '700',
    fontSize: '15px',
    color: 'white',
  },
  planDesc: {
    margin: '0',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  upgradeBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '9px 18px',
    borderRadius: '999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#ef4444',
    padding: '14px',
    borderRadius: '14px',
    border: '2px solid #ef4444',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
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
  navIcon: { fontSize: '22px' },
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

export default Profile;
