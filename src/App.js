import './App.css';

function App() {
  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.logo}>Tennis Connect</h1>
        <p style={styles.tagline}>Find players, coaches and venues near you</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>I am a...</h2>
        <div style={styles.rolesContainer}>

          <div style={styles.roleCard}>
            <div>
              <h3 style={styles.roleTitle}>Player</h3>
              <p style={styles.roleDesc}>Find sparring partners and coaches</p>
            </div>
          </div>

          <div style={styles.roleCard}>
            <div>
              <h3 style={styles.roleTitle}>Coach</h3>
              <p style={styles.roleDesc}>Find players and hitting partners</p>
            </div>
          </div>

          <div style={styles.roleCard}>
            <div>
              <h3 style={styles.roleTitle}>Venue</h3>
              <p style={styles.roleDesc}>List your courts and facilities</p>
            </div>
          </div>

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
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: '40px 20px',
    textAlign: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '28px',
    margin: '0',
  },
  tagline: {
    color: 'white',
    fontSize: '14px',
    marginTop: '8px',
  },
  section: {
    padding: '24px 16px',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '16px',
  },
  rolesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  roleTitle: {
    margin: '0',
    fontSize: '18px',
    color: '#1a1a1a',
  },
  roleDesc: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#888',
  },
};

export default App;
