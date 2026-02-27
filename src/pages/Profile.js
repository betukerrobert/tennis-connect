import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
        <span style={styles.editBtn}>Edit</span>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.avatarLarge}>R</div>
        <h2 style={styles.name}>Robert</h2>
        <span style={styles.roleBadge}>Player</span>
        <p style={styles.location}>📍 London, UK</p>
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
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Level</span>
            <span style={styles.detailValue}>Intermediate</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Availability</span>
            <span style={styles.detailValue}>Weekends</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Play Style</span>
            <span style={styles.detailValue}>Baseline</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Member Since</span>
            <span style={styles.detailValue}>Feb 2026</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Subscription</h3>
        <div style={styles.subscriptionCard}>
          <div>
            <p style={styles.planName}>Free Plan</p>
            <p style={styles.planDesc}>5 connections per month</p>
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
          <span style={{...styles.navLabel, color: '#2e7d32', fontWeight: 'bold'}}>Profile</span>
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
  headerTitle: {
    color: 'white',
    fontSize: '20px',
    margin: '0',
  },
  editBtn: {
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
  },
  name: {
    margin: '0',
    fontSize: '22px',
    color: '#1a1a1a',
  },
  roleBadge: {
    backgroundColor: '#1565c0',
    color: 'white',
    fontSize: '12px',
    padding: '3px 10px',
    borderRadius: '10px',
    fontWeight: 'bold',
  },
  location: {
    margin: '0',
    fontSize: '13px',
    color: '#888',
  },
  section: {
    padding: '16px',
    marginTop: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  bio: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.5',
    backgroundColor: 'white',
    padding: '14px',
    borderRadius: '10px',
    margin: '0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  detailItem: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#aaa',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    margin: '0',
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
  },
  planDesc: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#888',
  },
  upgradeBtn: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: 'white',
    color: '#e53935',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #e53935',
    fontSize: '15px',
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

export default Profile;
