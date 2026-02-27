import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/signup/' + role);
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.logo}>Tennis Connect</h1>
        <p style={styles.tagline}>Find players, coaches and venues near you</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>I am a...</h2>
        <div style={styles.rolesContainer}>

          <div style={styles.roleCard} onClick={() => handleRoleSelect('player')}>
            <div>
              <h3 style={styles.roleTitle}>Player</h3>
              <p style={styles.roleDesc}>Find sparring partners and coaches</p>
            </div>
            <span style={styles.arrow}>›</span>
          </div>

          <div style={styles.roleCard} onClick={() => handleRoleSelect('coach')}>
            <div>
              <h3 style={styles.roleTitle}>Coach</h3>
              <p style={styles.roleDesc}>Find players and hitting partners</p>
            </div>
            <span style={styles.arrow}>›</span>
          </div>

          <div style={styles.roleCard} onClick={() => handleRoleSelect('venue')}>
            <div>
              <h3 style={styles.roleTitle}>Venue</h3>
              <p style={styles.roleDesc}>List your courts and facilities</p>
            </div>
            <span style={styles.arrow}>›</span>
          </div>

        </div>
      </div>

      <p style={styles.loginText}>
        Already have an account?{' '}
        <span style={styles.loginLink} onClick={() => navigate('/login')}>
          Log in
        </span>
      </p>

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
    justifyContent: 'space-between',
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
  arrow: {
    fontSize: '24px',
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  loginText: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
    marginTop: '24px',
  },
  loginLink: {
    color: '#2e7d32',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Home;
