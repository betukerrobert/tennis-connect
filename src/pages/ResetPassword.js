import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { theme } from '../theme';

function ResetPassword() {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState('form'); // 'form' | 'success'
  const [sessionReady, setSessionReady] = useState(false);

  const [form, setForm] = useState({
    password: '',
    confirm: '',
  });

  // Supabase sends the recovery token in the URL hash.
  // We listen for the PASSWORD_RECOVERY event which fires automatically
  // when the page loads with that token present.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.password || !form.confirm) {
      setError('Please fill in both fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!sessionReady) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password,
      });
      if (updateError) throw updateError;
      setScreen('success');
    } catch (err) {
      setError('Something went wrong. Your reset link may have expired — please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/login')}>← Back to Login</span>
        <h1 style={styles.title}>
          {screen === 'success' ? 'Password Updated' : 'Set New Password'}
        </h1>
        <p style={styles.subtitle}>
          {screen === 'success'
            ? 'Your password has been changed successfully'
            : 'Choose a strong password for your account'}
        </p>
      </div>

      <div style={styles.form}>

        {screen === 'form' && (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: focused === 'password' ? theme.colors.accent : '#e0e4ea',
                  boxShadow: focused === 'password' ? `0 0 0 3px ${theme.colors.accent}18` : 'none',
                  transition: 'all 0.2s ease',
                }}
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: focused === 'confirm' ? theme.colors.accent : '#e0e4ea',
                  boxShadow: focused === 'confirm' ? `0 0 0 3px ${theme.colors.accent}18` : 'none',
                  transition: 'all 0.2s ease',
                }}
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => handleChange('confirm', e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </>
        )}

        {screen === 'success' && (
          <>
            <div style={styles.successBox}>
              <div style={styles.successIcon}>✓</div>
              <p style={styles.successText}>
                You can now log in with your new password.
              </p>
            </div>

            <button
              style={{
                ...styles.button,
                backgroundColor: '#0a1628',
                color: '#c8ff00',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/login')}
            >
              Go to Login →
            </button>
          </>
        )}

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
  successBox: {
    backgroundColor: 'white',
    border: '1.5px solid #e0e4ea',
    borderRadius: '14px',
    padding: '28px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  successIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    fontSize: '22px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: '14px',
    color: '#5a6270',
    margin: '0',
    lineHeight: '1.5',
  },
};

export default ResetPassword;
