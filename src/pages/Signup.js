import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme, roleColors } from '../theme';

function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(null);

  const roleLabels = { player: 'Player', coach: 'Coach', venue: 'Venue' };
  const roleIcons = { player: '🎾', coach: '🧑‍🏫', venue: '🏟️' };
  const accentColor = roleColors[role] || theme.colors.accent;

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'City or town' },
  ];

  return (
    <div style={styles.container}>

      <div style={{ ...styles.header, background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1a2d4a 100%)` }}>
        <span style={styles.backButton} onClick={() => navigate('/')}>← Back</span>
        <div style={styles.headerContent}>
          <div style={{ ...styles.roleIconBox, backgroundColor: accentColor + '22', border: `2px solid ${accentColor}44` }}>
            <span style={styles.roleIconLarge}>{roleIcons[role]}</span>
          </div>
          <div>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Joining as a{' '}
              <span style={{ color: accentColor, fontWeight: 'bold' }}>
                {roleLabels[role]}
              </span>
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
                boxShadow: focused === field.id ? `0 0 0 3px ${accentColor}22` : 'none',
                transition: 'all 0.2s ease',
              }}
              type={field.type}
              placeholder={field.placeholder}
              onFocus={() => setFocused(field.id)}
              onBlur={() => setFocused(null)}
            />
          </div>
        ))}

        <button
          style={{ ...styles.button, backgroundColor: accentColor }}
          onClick={() => navigate('/discovery')}
        >
          Create Account →
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'block',
    marginBottom: '20px',
    fontWeight: '600',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  roleIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleIconLarge: {
    fontSize: '28px',
  },
  title: {
    color: 'white',
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 4px 0',
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
  button: {
    color: '#0a1628',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
  },
  terms: {
    fontSize: '11px',
    color: '#9aa0ac',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};

export default Signup;
