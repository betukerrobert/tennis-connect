import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

const tennisBg = 'https://www.pexels.com/download/video/34230186/';

// Player → clean tennis racket, 4 strokes
const PlayerIcon = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="11" cy="10" rx="7" ry="8.5" stroke={color} strokeWidth="1.6" fill="none"/>
    <line x1="4.2" y1="10" x2="17.8" y2="10" stroke={color} strokeWidth="1" opacity="0.5"/>
    <line x1="11" y1="1.8" x2="11" y2="18.2" stroke={color} strokeWidth="1" opacity="0.5"/>
    <line x1="15.5" y1="16.5" x2="22" y2="23" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="22.5" cy="23.5" r="1" fill={color}/>
  </svg>
);

// Coach → whistle, 3 strokes
const CoachIcon = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 14 C5 10 8 7 12 7 L19 7 C20.1 7 21 7.9 21 9 L21 11 C21 12.1 20.1 13 19 13 L12 13 C10 13 8.5 14.5 8.5 16.5 C8.5 18.8 6.5 20.5 4.5 19.5 C3 18.8 3 16 5 14 Z"
      stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"
    />
    <circle cx="15.5" cy="10" r="1.2" stroke={color} strokeWidth="1.2" fill="none"/>
    <line x1="21" y1="10" x2="24" y2="10" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// Venue → tennis court top-down
const VenueIcon = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="22" height="18" rx="0.8" stroke={color} strokeWidth="1.6" fill="none"/>
    <line x1="13" y1="4" x2="13" y2="22" stroke={color} strokeWidth="1.6"/>
    <line x1="2" y1="13" x2="24" y2="13" stroke={color} strokeWidth="1"/>
    <line x1="6" y1="4" x2="6" y2="22" stroke={color} strokeWidth="0.9"/>
    <line x1="20" y1="4" x2="20" y2="22" stroke={color} strokeWidth="0.9"/>
  </svg>
);

function Home() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const roles = [
    { id: 'player', icon: PlayerIcon, title: 'Player', desc: 'Find sparring partners & coaches', color: theme.colors.playerBlue },
    { id: 'coach',  icon: CoachIcon,  title: 'Coach',  desc: 'Find players & grow your business', color: theme.colors.coachPurple },
    { id: 'venue',  icon: VenueIcon,  title: 'Venue',  desc: 'List your courts & facilities', color: theme.colors.venueOrange },
  ];

  return (
    <div style={styles.page}>

      <div style={styles.hero}>
        <video style={styles.video} autoPlay muted loop playsInline>
          <source src={tennisBg} type="video/mp4" />
        </video>
        <div style={styles.overlay} />
        <div style={styles.heroContent}>
          <div style={styles.badge}>The Tennis Network</div>
          <h1 style={styles.heroTitle}>
            Find Your<span style={styles.heroAccent}> Perfect</span><br />Tennis Match
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with players, coaches and venues near you
          </p>
        </div>
        <div style={styles.scrollHint}>
          <span style={styles.scrollText}>scroll down</span>
          <span style={styles.scrollArrow}>↓</span>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          <p style={styles.sectionLabel}>I am a...</p>

          <div style={styles.rolesContainer}>
            {roles.map(role => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  style={{
                    ...styles.roleCard,
                    transform: hovered === role.id ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hovered === role.id
                      ? `0 8px 32px rgba(10,22,40,0.12), 3px 0 0 ${role.color} inset`
                      : `0 2px 12px rgba(10,22,40,0.06), 3px 0 0 ${role.color} inset`,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => navigate('/signup/' + role.id)}
                  onMouseEnter={() => setHovered(role.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div style={styles.roleLeft}>
                    <div style={{ ...styles.roleIconBox, backgroundColor: role.color + '12' }}>
                      <Icon color={role.color} />
                    </div>
                    <div>
                      <h3 style={styles.roleTitle}>{role.title}</h3>
                      <p style={styles.roleDesc}>{role.desc}</p>
                    </div>
                  </div>
                  <div style={{ color: role.color, fontSize: '20px', opacity: 0.5 }}>›</div>
                </div>
              );
            })}
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
    top: '0', left: '0',
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(160deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.52) 60%, rgba(10,22,40,0.76) 100%)',
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
    backgroundColor: 'rgba(200,255,0,0.12)',
    color: '#c8ff00',
    fontSize: '11px',
    fontWeight: '500',
    padding: '5px 14px',
    borderRadius: '999px',
    marginBottom: '20px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    border: '1px solid rgba(200,255,0,0.25)',
  },
  heroTitle: {
    color: 'white',
    fontSize: 'clamp(34px, 5.5vw, 68px)',
    fontWeight: '300',
    margin: '0 0 16px 0',
    lineHeight: '1.12',
    letterSpacing: '-0.5px',
  },
  heroAccent: {
    color: '#c8ff00',
    fontWeight: '600',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 'clamp(13px, 1.8vw, 16px)',
    margin: '0',
    lineHeight: '1.7',
    fontWeight: '300',
    maxWidth: '420px',
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
  },
  scrollText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: '400',
  },
  scrollArrow: { color: '#c8ff00', fontSize: '16px' },
  contentWrapper: {
    backgroundColor: '#f4f6f8',
    padding: '48px 20px 60px 20px',
  },
  content: {
    maxWidth: '560px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#9aa0ac',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  rolesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '36px',
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  roleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  roleIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleTitle: {
    margin: '0 0 3px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0a1628',
    letterSpacing: '-0.2px',
  },
  roleDesc: {
    margin: '0',
    fontSize: '12px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#e0e4ea' },
  dividerText: {
    fontSize: '11px',
    color: '#9aa0ac',
    whiteSpace: 'nowrap',
    fontWeight: '400',
    letterSpacing: '0.3px',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    color: '#0a1628',
    padding: '15px',
    borderRadius: '12px',
    border: '1.5px solid #0a1628',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
};

export default Home;