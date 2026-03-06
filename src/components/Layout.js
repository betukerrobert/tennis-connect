import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { supabase } from '../supabase';
import { requestNotificationPermission, onMessageListener } from '../notificationService';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [notifications, setNotifications] = useState({
    matches: false,
    messages: false,
  });

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
      
      // Request notification permission when user is logged in
      await requestNotificationPermission(user.id);
      
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

    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        console.log('Received foreground message:', payload);
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'Tennis Connect', {
            body: payload.notification?.body,
            icon: '/logo192.png'
          });
        }
        // Refresh notification counts
        fetchNotifications();
      })
      .catch((err) => console.log('Failed to receive foreground message:', err));
  }, []);

  // ── Redirect to onboarding if profile is incomplete ──────────────────
  useEffect(() => {
    const checkOnboarding = async () => {
      const skipPaths = ['/', '/login', '/onboarding'];
      if (skipPaths.includes(location.pathname) || location.pathname.startsWith('/signup')) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single();
      if (profile && profile.onboarding_complete === false) {
        navigate('/onboarding');
      }
    };
    checkOnboarding();
  }, [location.pathname, navigate]);

  // ── Fetch notification state ──────────────────────────────────────────
  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Pending match invites received by me
    const { data: pendingMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    // 2. Suggested new times sent to me (I am sender, status is rescheduled)
    const { data: rescheduledMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('sender_id', user.id)
      .eq('status', 'rescheduled');

    // 3. Pending connection requests received by me
    const { data: pendingConnections } = await supabase
      .from('connections')
      .select('id')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    const hasMatchNotif =
      (pendingMatches?.length > 0) ||
      (rescheduledMatches?.length > 0);

    const hasConnectionNotif = pendingConnections?.length > 0;

    setNotifications({
      matches: hasMatchNotif,
      // Show connection dot on Discovery since that's where you accept
      discovery: hasConnectionNotif,
    });
  };

  useEffect(() => {
    fetchNotifications();
    // Re-check every time the page changes
  }, [location.pathname]);
  // ─────────────────────────────────────────────────────────────────────

  const navItems = [
    {
      path: '/discovery', label: 'Discover',
      notif: notifications.discovery,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    },
    {
      path: '/matches', label: 'Matches',
      notif: notifications.matches,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      path: '/messages', label: 'Messages',
      notif: false,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      path: '/profile', label: 'Profile',
      notif: false,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
  ];

  const noNavPages = ['/', '/login', '/onboarding'];
  const showNav = !noNavPages.includes(location.pathname)
    && !location.pathname.startsWith('/signup')
    && !location.pathname.startsWith('/schedule')
    && !location.pathname.startsWith('/match-invite');

  const isActive = (path) => location.pathname === path;

  if (!showNav) return <div>{children}</div>;

  if (isDesktop) {
    return (
      <div style={styles.desktopWrapper}>
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
                <span style={{ color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.4)', position: 'relative' }}>
                  {item.icon}
                  {item.notif && <span style={styles.sidebarDot} />}
                </span>
                <span style={{
                  ...styles.sidebarNavLabel,
                  color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.55)',
                  fontWeight: isActive(item.path) ? '600' : '400',
                }}>
                  {item.label}
                </span>
                {item.notif && <span style={styles.sidebarNotifDot} />}
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
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span style={{ color: isActive(item.path) ? '#c8ff00' : 'rgba(255,255,255,0.35)' }}>
                {item.icon}
              </span>
              {item.notif && <span style={styles.mobileDot} />}
            </div>
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
    position: 'relative',
  },
  sidebarNavLabel: {
    fontSize: '14px',
    letterSpacing: '0.1px',
    flex: 1,
  },
  sidebarDot: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: '1.5px solid #0a1628',
  },
  sidebarNotifDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    flexShrink: 0,
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
  mobileDot: {
    position: 'absolute',
    top: '-1px',
    right: '-1px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: '1.5px solid #0a1628',
  },
  navLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
};

export default Layout;
