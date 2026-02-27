import { useParams, useNavigate } from 'react-router-dom';

function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();

  const roleLabels = {
    player: 'Player',
    coach: 'Coach',
    venue: 'Venue',
  };

  const handleSignup = () => {
    navigate('/discovery');
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/')}>
          ← Back
        </span>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Joining as a {roleLabels[role]}</p>
      </div>

      <div style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" placeholder="Your full name" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="your@email.com" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Create a password" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Location</label>
          <input style={styles.input} type="text" placeholder="City or town" />
        </div>

        <button style={styles.button} onClick={handleSignup}>
          Create Account
        </button>

        <p style={styles.terms}>
          By signing up you agree to our Terms of Service and Privacy Policy
        </p>

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
    padding: '40px 20px 30px 20px',
  },
  backButton: {
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    color: 'white',
    fontSize: '26px',
    margin: '0',
  },
  subtitle: {
    color: 'white',
    fontSize: '14px',
    marginTop: '6px',
  },
  form: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '16px',
    backgroundColor: 'white',
    outline: 'none',
  },
  button: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '16px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  terms: {
    fontSize: '12px',
    color: '#aaa',
    textAlign: 'center',
  },
};

export default Signup;
