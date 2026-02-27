import { useNavigate } from 'react-router-dom';
import { roleColors, roleLabels } from '../theme';

const DUMMY_MESSAGES = [
  { id: 1, name: 'Alex Johnson', lastMessage: 'Hey, are you free this Saturday?', time: '2m ago', unread: true, role: 'player' },
  { id: 2, name: 'Sarah Williams', lastMessage: 'I can do a trial session on Monday!', time: '1h ago', unread: true, role: 'coach' },
  { id: 3, name: 'City Tennis Club', lastMessage: 'Court 3 is available from 6pm.', time: '3h ago', unread: false, role: 'venue' },
  { id: 4, name: 'Marco Rossi', lastMessage: 'Great match yesterday!', time: 'Yesterday', unread: false, role: 'player' },
];

function Messages() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Messages</h1>
        <span style={styles.composeBtn}>✏️</span>
      </div>

      <div style={styles.list}>
        {DUMMY_MESSAGES.map(msg => (
          <div
            key={msg.id}
            style={styles.messageRow}
            onClick={() => navigate('/chat/' + msg.id)}
          >
            <div style={{ ...styles.avatar, backgroundColor: roleColors[msg.role] }}>
              {msg.name.charAt(0)}
            </div>
            <div style={styles.messageInfo}>
              <div style={styles.messageTop}>
                <span style={styles.messageName}>{msg.name}</span>
                <span style={styles.messageTime}>{msg.time}</span>
              </div>
              <div style={styles.messageBottom}>
                <span style={{
                  ...styles.messagePreview,
                  fontWeight: msg.unread ? '700' : '400',
                  color: msg.unread ? '#0a1628' : '#9aa0ac',
                }}>
                  {msg.lastMessage}
                </span>
                {msg.unread && <div style={styles.unreadDot} />}
              </div>
              <span style={{ ...styles.rolePill, backgroundColor: roleColors[msg.role] + '18', color: roleColors[msg.role] }}>
                {roleLabels[msg.role]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.bottomNav}>
        <div style={styles.navItem} onClick={() => navigate('/discovery')}>
          <span style={styles.navIcon}>🔍</span>
          <span style={styles.navLabel}>Discover</span>
        </div>
        <div style={styles.navItem}>
          <span style={styles.navIcon}>💬</span>
          <span style={styles.navLabelActive}>Messages</span>
        </div>
        <div style={styles.navItem} onClick={() => navigate('/profile')}>
          <span style={styles.navIcon}>👤</span>
          <span style={styles.navLabel}>Profile</span>
        </div>
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
    paddingBottom: '80px',
  },
  header: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '800',
    margin: '0',
  },
  composeBtn: {
    fontSize: '20px',
    cursor: 'pointer',
  },
  list: {
    marginTop: '12px',
    backgroundColor: 'white',
    borderRadius: '16px',
    margin: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(10,22,40,0.07)',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: '1px solid #f4f6f8',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '14px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800',
    flexShrink: 0,
  },
  messageInfo: {
    flex: 1,
    minWidth: 0,
  },
  messageTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '3px',
  },
  messageName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0a1628',
  },
  messageTime: {
    fontSize: '11px',
    color: '#9aa0ac',
  },
  messageBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  messagePreview: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '240px',
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    backgroundColor: '#c8ff00',
    flexShrink: 0,
    border: '2px solid #0a1628',
  },
  rolePill: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
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
  navIcon: { fontSize: '22px' },
  navLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navLabelActive: {
    fontSize: '10px',
    color: '#c8ff00',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 'bold',
  },
};

export default Messages;
