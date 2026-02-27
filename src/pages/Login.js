import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

function Login() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/')}>← Back</span>
        <h1 style={styles.title}>Welcome Back 👋</h1>
        <p style={styles.subtitle}>Log in to your Tennis Connect account</p>
      </div>

      <div style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={{
              ...styles.input,
              borderColor: focused === 'email' ? theme.colors.accent : '#e0e4ea',
              boxShadow: focused === 'email' ? `0 0 0 3px ${theme.colors.accent}22` : 'none',
              transition: 'all 0.2s ease',
            }}
            type="email"
            placeholder="your@email.com"
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={{
              ...styles.input,
              borderColor: focused === 'password' ? theme.colors.accent : '#e0e4ea',
              boxShadow: focused === 'password' ? `0 0 0 3px ${theme.colors.accent}22` : 'none',
              transition: 'all 0.2s ease',
            }}
            type="password"
            placeholder="Your password"
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
        </div>

        <p style={styles.forgotPassword}>Forgot your password?</p>

        <button style={styles.button} onClick={() => navigate('/discovery')}>
          Log In →
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>don't have an account?</span>
          <div style={styles.dividerLine} />
        </div>

        <button style={styles.signupBtn} onClick={() => navigate('/')}>
          Create Account
        </button>

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
  },
  header: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '24px 20px 40px 20px',
  },
  backButton: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'block',
    marginBottom: '20px',
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    margin: '0',
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
    fontSize: '12px',
    fontWeight: '700',
    color: '#5a6270',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e0e4ea',
    fontSize: '15px',
    backgroundColor: 'white',
    outline: 'none',
    color: '#0a1628',
  },
  forgotPassword: {
    fontSize: '13px',
    color: '#0a1628',
    textAlign: 'right',
    cursor: 'pointer',
    margin: '0',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e4ea',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9aa0ac',
    whiteSpace: 'nowrap',
  },
  signupBtn: {
    backgroundColor: 'transparent',
    color: '#0a1628',
    padding: '15px',
    borderRadius: '14px',
    border: '2px solid #0a1628',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default Login;
