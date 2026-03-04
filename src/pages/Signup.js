import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { theme, roleColors } from '../theme';

function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    location: '',
  });

  const roleLabels = { player: 'Player', coach: 'Coach', venue: 'Venue' };
  const accentColor = roleColors[role] || theme.colors.accent;

  const fields = [
    { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'City or town' },
  ];

  const handleChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSignup = async () => {
    // Basic validation
    if (!form.full_name || !form.email || !form.password || !form.location) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1 — create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) throw signUpError;

      // Step 2 — save profile to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: form.full_name,
          role: role,
          location: form.location,
          subscription_tier: 'free',
        });

      if (profileError) throw profileError;

      // Success — go to onboarding
      navigate('/onboarding');

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={{ ...styles.header, background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1a2d4a 100%)` }}>
        <span style={styles.backButton} onClick={() => navigate('/')}>← Back</span>
        <div style={styles.headerContent}>
          <div style={{ ...styles.roleIconBox, backgroundColor: accentColor + '22', border: `1.5px solid ${accentColor}44` }}>
            <span style={{ fontSize: '22px' }}>
              {role === 'player' ? '🎾' : role === 'coach' ? '📋' : '🏟️'}
            </span>
          </div>
          <div>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Joining as a <span style={{ color: accentColor, fontWeight: '600' }}>{roleLabels[role]}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={styles.form}>

        {fields.map(field => (
          <div key={field.id} style={styles.inputGroup}>
            <label style={styles.label}>{field.label}</label>
            <input
              style={{
                ...styles.input,
                borderColor: focused === field.id ? accentColor : '#e0e4ea',
                boxShadow: focused === field.id ? `0 0 0 3px ${accentColor}18` : 'none',
                transition: 'all 0.2s ease',
              }}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.id]}
              onChange={e => handleChange(field.id, e.target.value)}
              onFocus={() => setFocused(field.id)}
              onBlur={() => setFocused(null)}
            />
          </div>
        ))}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        <button
          style={{
            ...styles.button,
            backgroundColor: loading ? '#e0e4ea' : accentColor,
            color: loading ? '#9aa0ac' : '#0a1628',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        <p style={styles.terms}>
          By signing up you agree to our Terms of Service and Privacy Policy
        </p>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <span style={{ color: accentColor, fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Log in
          </span>
        </p>

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
    padding: '24px 20px 32px 20px',
  },
  backButton: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'block',
    marginBottom: '20px',
    fontWeight: '500',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  roleIconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
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
    marginTop: '4px',
    letterSpacing: '0.2px',
    transition: 'all 0.2s ease',
  },
  terms: {
    fontSize: '11px',
    color: '#9aa0ac',
    textAlign: 'center',
    lineHeight: '1.5',
    fontWeight: '400',
  },
  loginLink: {
    fontSize: '13px',
    color: '#9aa0ac',
    textAlign: 'center',
    fontWeight: '400',
  },
};

export default Signup;
