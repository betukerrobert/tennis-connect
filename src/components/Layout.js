import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/discovery', icon: '🔍', label: 'Discover' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  // Pages that don't show navigation
  const noNavPages = ['/', '/login', '/signup/player', '/signup/coach', '/signup/venue'];
  const showNav = !noNavPages.includes(location.pathname) && !location.pathname.startsWith('/signup');

  if (!showNav) return <div>{children}</div>;

  if (isDesktop) {
    return (
      <div style={styles.desktopWrapper}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo} onClick={() => navigate('/discovery')}>
            <span style={styles.logoIcon}>🎾</span>
            <span style={styles.logoText}>Tennis<br/>Connect</span>
          </div>

          <nav style={styles.sidebarNav}>
            {navItems.map(item => (
              <div
                key={item.path}
                style={{
                  ...styles.sidebarNavItem,
                  backgroundColor: isActive(item.path) ? 'rgba(200,255,0,0.1)' : 'transparent',
                  borderLeft: isActive(item.path) ? '3px solid #c8ff00' : '3px solid transparent',
                }}
                onClick={() => navigate(item.path)}
              >
                <span style={styles.sidebarNavIcon}>{item.icon}</span>
                <span style={{
                  ...styles.sidebarNavLabel,
                  color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive(item.path) ? '700' : '400',
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>

          <div style={styles.sidebarFooter}>
            <div style={styles.sidebarProfile}>
              <div style={styles.sidebarAvatar}>R</div>
              <div>
                <p style={styles.sidebarName}>Robert</p>
                <p style={styles.sidebarPlan}>Free Plan</p>
              </div>
            </div>
            <button style={styles.upgradeBtn} onClick={() => navigate('/profile')}>
              Upgrade ⚡
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.desktopMain}>
          <div style={styles.desktopContent}>
            {children}
          </div>
        </div>

      </div>
    );
  }

  // MOBILE layout
  return (
    <div style={styles.mobileWrapper}>
      {children}
      <div style={styles.bottomNav}>
        {navItems.map(item => (
          <div
            key={item.path}
            style={styles.navItem}
            onClick={() => navigate(item.path)}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={{
              ...styles.navLabel,
              color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.4)',
              fontWeight: isActive(item.path) ? 'bold' : 'normal',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  // DESKTOP
  desktopWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '28px 24px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.3px',
  },
  sidebarNav: {
    flex: 1,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sidebarNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '13px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sidebarNavIcon: {
    fontSize: '20px',
  },
  sidebarNavLabel: {
    fontSize: '15px',
    letterSpacing: '0.2px',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sidebarProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sidebarAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '800',
    flexShrink: 0,
  },
  sidebarName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 2px 0',
  },
  sidebarPlan: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: '0',
  },
  upgradeBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    width: '100%',
  },
  desktopMain: {
    marginLeft: '260px',
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
  },
  desktopContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 32px',
  },

  // MOBILE
  mobileWrapper: {
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingBottom: '80px',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0 16px 0',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '3px',
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default Layout;
