import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import tennisBg from '../assets/14507181_3840_2160_25fps.mp4';

function Home() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const roles = [
    { id: 'player', icon: '🎾', title: 'Player', desc: 'Find sparring partners & coaches', color: theme.colors.playerBlue },
    { id: 'coach', icon: '🧑‍🏫', title: 'Coach', desc: 'Find players & hitting partners', color: theme.colors.coachPurple },
    { id: 'venue', icon: '🏟️', title: 'Venue', desc: 'List your courts & facilities', color: theme.colors.venueOrange },
  ];

  return (
    <div style={styles.page}>

      {/* FULL SCREEN VIDEO HERO */}
      <div style={styles.hero}>
        <video
          style={styles.video}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={tennisBg} type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div style={styles.overlay} />

        {/* Hero text */}
        <div style={styles.heroContent}>
          <div style={styles.badge}>🎾 The Tennis Network</div>
          <h1 style={styles.heroTitle}>
            Find Your
            <span style={styles.heroAccent}> Perfect</span>
            <br />Tennis Match
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with players, coaches and venues near you
          </p>
        </div>

        {/* Scroll hint */}
        <div style={styles.scrollHint}>
          <span style={styles.scrollText}>scroll down</span>
          <span style={styles.scrollArrow}>↓</span>
        </div>
      </div>

      {/* CONTENT BELOW VIDEO */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>

          <p style={styles.sectionLabel}>I AM A...</p>

          <div style={styles.rolesContainer}>
            {roles.map(role => (
              <div
                key={role.id}
                style={{
                  ...styles.roleCard,
                  transform: hovered === role.id ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
                  boxShadow: hovered === role.id
                    ? `0 12px 40px rgba(10,22,40,0.18), 4px 0 0 ${role.color} inset`
                    : `0 4px 16px rgba(10,22,40,0.08), 4px 0 0 ${role.color} inset`,
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/signup/' + role.id)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={styles.roleLeft}>
                  <div style={{ ...styles.roleIconBox, backgroundColor: role.color + '18' }}>
                    <span style={styles.roleIcon}>{role.icon}</span>
                  </div>
                  <div>
                    <h3 style={styles.roleTitle}>{role.title}</h3>
                    <p style={styles.roleDesc}>{role.desc}</p>
                  </div>
                </div>
                <div style={{ ...styles.roleArrow, color: role.color }}>›</div>
              </div>
            ))}
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>already a member?</span>
            <div style={styles.dividerLine} />
          </div>

          <button style={styles.loginBtn} onClick={() => navigate('/login')}>
            Log In
          </button>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    margin: '0',
    padding: '0',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
  },
  hero: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(160deg, rgba(10,22,40,0.80) 0%, rgba(10,22,40,0.50) 60%, rgba(10,22,40,0.75) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 40px',
  },
  badge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200,255,0,0.15)',
    color: '#c8ff00',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '6px 16px',
    borderRadius: '999px',
    marginBottom: '20px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    border: '1px solid rgba(200,255,0,0.3)',
  },
  heroTitle: {
    color: 'white',
    fontSize: 'clamp(36px, 6vw, 72px)',
    fontWeight: '800',
    margin: '0 0 16px 0',
    lineHeight: '1.1',
    letterSpacing: '-1px',
  },
  heroAccent: {
    color: '#c8ff00',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 'clamp(14px, 2vw, 18px)',
    margin: '0',
    lineHeight: '1.6',
    maxWidth: '480px',
  },
  scrollHint: {
    position: 'absolute',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    zIndex: 2,
    animation: 'bounce 2s infinite',
  },
  scrollText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  scrollArrow: {
    color: '#c8ff00',
    fontSize: '18px',
  },
  contentWrapper: {
    backgroundColor: '#f4f6f8',
    padding: '40px 20px 60px 20px',
  },
  content: {
    maxWidth: '560px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9aa0ac',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  rolesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  roleLeft: {
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
  roleIcon: {
    fontSize: '26px',
  },
  roleTitle: {
    margin: '0 0 4px 0',
    fontSize: '17px',
    fontWeight: '700',
    color: '#0a1628',
  },
  roleDesc: {
    margin: '0',
    fontSize: '13px',
    color: '#9aa0ac',
  },
  roleArrow: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
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
  loginBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#0a1628',
    padding: '16px',
    borderRadius: '14px',
    border: '2px solid #0a1628',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

export default Home;
