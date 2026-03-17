import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { theme } from '../theme';

function Login() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login' | 'forgot' | 'sent'

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [resetEmail, setResetEmail] = useState('');

  const handleChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (loginError) throw loginError;

      navigate('/discovery');

    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setResetEmail(form.email); // pre-fill with whatever they typed
    setError(null);
    setScreen('forgot');
  };

  const handleSendReset = async () => {
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setScreen('sent');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── SENT SCREEN ───────────────────────────────────────────────
  if (screen === 'sent') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.backButton} onClick={() => { setScreen('login'); setError(null); }}>← Back to Login</span>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>Password reset instructions sent</p>
        </div>
        <div style={styles.form}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✉️</div>
            <p style={styles.successText}>
              We sent a reset link to <strong>{resetEmail}</strong>. Click the link in the email to set a new password.
            </p>
            <p style={styles.successHint}>
              Didn't get it? Check your spam folder.
            </p>
          </div>
          <button
            style={{ ...styles.button, backgroundColor: '#0a1628', color: '#c8ff00', cursor: 'pointer' }}
            onClick={() => { setScreen('login'); setError(null); }}
          >
            Back to Login →
          </button>
        </div>
      </div>
    );
  }

  // ─── FORGOT SCREEN ─────────────────────────────────────────────
  if (screen === 'forgot') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.backButton} onClick={() => { setScreen('login'); setError(null); }}>← Back to Login</span>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>We'll send you a link to reset your password</p>
        </div>
        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={{
                ...styles.input,
                borderColor: focused === 'resetEmail' ? theme.colors.accent : '#e0e4ea',
                boxShadow: focused === 'resetEmail' ? `0 0 0 3px ${theme.colors.accent}18` : 'none',
                transition: 'all 0.2s ease',
              }}
              type="email"
              placeholder="your@email.com"
              value={resetEmail}
              onChange={e => { setResetEmail(e.target.value); setError(null); }}
              onFocus={() => setFocused('resetEmail')}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === 'Enter' && handleSendReset()}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <button
            style={{
              ...styles.button,
              backgroundColor: loading ? '#e0e4ea' : '#0a1628',
              color: loading ? '#9aa0ac' : '#c8ff00',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSendReset}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link →'}
          </button>
        </div>
      </div>
    );
  }

  // ─── LOGIN SCREEN ──────────────────────────────────────────────
  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/')}>← Back</span>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Log in to your Tennis Connect account</p>
      </div>

      <div style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={{
              ...styles.input,
              borderColor: focused === 'email' ? theme.colors.accent : '#e0e4ea',
              boxShadow: focused === 'email' ? `0 0 0 3px ${theme.colors.accent}18` : 'none',
              transition: 'all 0.2s ease',
            }}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={{
              ...styles.input,
              borderColor: focused === 'password' ? theme.colors.accent : '#e0e4ea',
              boxShadow: focused === 'password' ? `0 0 0 3px ${theme.colors.accent}18` : 'none',
              transition: 'all 0.2s ease',
            }}
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <p style={styles.forgotPassword} onClick={handleForgotPassword}>
          Forgot your password?
        </p>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <button
          style={{
            ...styles.button,
            backgroundColor: loading ? '#e0e4ea' : '#0a1628',
            color: loading ? '#9aa0ac' : '#c8ff00',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In →'}
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'block',
    marginBottom: '20px',
    fontWeight: '500',
  },
  title: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '300',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    margin: '0',
    fontWeight: '400',
  },
  form: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#5a6270',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  input: {
    padding: '13px 14px',
    borderRadius: '11px',
    border: '1.5px solid #e0e4ea',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    color: '#0a1628',
    fontWeight: '400',
  },
  forgotPassword: {
    fontSize: '12px',
    color: '#0a1628',
    textAlign: 'right',
    cursor: 'pointer',
    margin: '0',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#ef4444',
    fontWeight: '400',
  },
  button: {
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.2px',
    transition: 'all 0.2s ease',
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
    fontSize: '11px',
    color: '#9aa0ac',
    whiteSpace: 'nowrap',
    fontWeight: '400',
  },
  signupBtn: {
    backgroundColor: 'transparent',
    color: '#0a1628',
    padding: '14px',
    borderRadius: '12px',
    border: '1.5px solid #0a1628',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  successBox: {
    backgroundColor: 'white',
    border: '1.5px solid #e0e4ea',
    borderRadius: '14px',
    padding: '28px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  successIcon: {
    fontSize: '36px',
  },
  successText: {
    fontSize: '14px',
    color: '#0a1628',
    margin: '0',
    lineHeight: '1.6',
  },
  successHint: {
    fontSize: '12px',
    color: '#9aa0ac',
    margin: '0',
  },
};

export default Login;
