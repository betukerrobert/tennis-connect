import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/')}>
          ← Back
        </span>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Log in to your Tennis Connect account</p>
      </div>

      <div style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="your@email.com" />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Your password" />
        </div>

        <p style={styles.forgotPassword}>Forgot your password?</p>

        <button style={styles.button}>
          Log In
        </button>

        <p style={styles.signupText}>
          Don't have an account?{' '}
          <span style={styles.signupLink} onClick={() => navigate('/')}>
            Sign up
          </span>
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
  forgotPassword: {
    fontSize: '13px',
    color: '#2e7d32',
    textAlign: 'right',
    cursor: 'pointer',
    margin: '0',
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
  signupText: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
  },
  signupLink: {
    color: '#2e7d32',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Login;
