import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { supabase } from '../supabase';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Silently update user's location in the background ────────────────
  useEffect(() => {
    const updateLocation = async () => {
      if (!navigator.geolocation) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await supabase
            .from('profiles')
            .update({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            })
            .eq('id', user.id);
        },
        (err) => console.log('Location not available:', err.message),
        { timeout: 10000 }
      );
    };

    updateLocation();
  }, []); // runs once when Layout mounts
  // ─────────────────────────────────────────────────────────────────────

  const navItems = [
    {
      path: '/discovery', label: 'Discover',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    },
    {
      path: '/messages', label: 'Messages',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      path: '/profile', label: 'Profile',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  const noNavPages = ['/', '/login'];
  const showNav = !noNavPages.includes(location.pathname) && !location.pathname.startsWith('/signup');
  const isActive = (path) => location.pathname === path;

  if (!showNav) return <div>{children}</div>;

  if (isDesktop) {
    return (
      <div style={styles.desktopWrapper}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogoArea} onClick={() => navigate('/discovery')}>
            <Logo size="md" dark={false} />
          </div>

          <nav style={styles.sidebarNav}>
            {navItems.map(item => (
              <div
                key={item.path}
                style={{
                  ...styles.sidebarNavItem,
                  backgroundColor: isActive(item.path) ? 'rgba(200,255,0,0.08)' : 'transparent',
                  borderLeft: isActive(item.path) ? '2px solid #c8ff00' : '2px solid transparent',
                }}
                onClick={() => navigate(item.path)}
              >
                <span style={{ color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.4)' }}>
                  {item.icon}
                </span>
                <span style={{
                  ...styles.sidebarNavLabel,
                  color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive(item.path) ? '600' : '400',
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
          <div key={item.path} style={styles.navItem} onClick={() => navigate(item.path)}>
            <span style={{ color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.35)' }}>
              {item.icon}
            </span>
            <span style={{
              ...styles.navLabel,
              color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.35)',
              fontWeight: isActive(item.path) ? '600' : '400',
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
  desktopWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
  },
  sidebarLogoArea: {
    padding: '28px 20px 24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
  },
  sidebarNav: {
    flex: 1,
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sidebarNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sidebarNavLabel: {
    fontSize: '14px',
    letterSpacing: '0.1px',
  },
  sidebarFooter: {
    padding: '18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sidebarProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  sidebarName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    margin: '0 0 2px 0',
  },
  sidebarPlan: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '11px',
    margin: '0',
    fontWeight: '400',
  },
  upgradeBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '9px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    letterSpacing: '0.2px',
  },
  desktopMain: {
    marginLeft: '240px',
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
  },
  desktopContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px',
  },
  mobileWrapper: {
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingBottom: '72px',
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0 14px 0',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '3px',
  },
  navLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
};

export default Layout;