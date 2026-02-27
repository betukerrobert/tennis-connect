import { useNavigate } from 'react-router-dom';

const DUMMY_MESSAGES = [
  {
    id: 1,
    name: 'Alex Johnson',
    lastMessage: 'Hey, are you free this Saturday?',
    time: '2m ago',
    unread: true,
    role: 'Player',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    lastMessage: 'I can do a trial session on Monday!',
    time: '1h ago',
    unread: true,
    role: 'Coach',
  },
  {
    id: 3,
    name: 'City Tennis Club',
    lastMessage: 'Court 3 is available from 6pm.',
    time: '3h ago',
    unread: false,
    role: 'Venue',
  },
  {
    id: 4,
    name: 'Marco Rossi',
    lastMessage: 'Great match yesterday!',
    time: 'Yesterday',
    unread: false,
    role: 'Player',
  },
];

function Messages() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Messages</h1>
      </div>

      <div style={styles.list}>
        {DUMMY_MESSAGES.map(msg => (
          <div
            key={msg.id}
            style={styles.messageRow}
            onClick={() => navigate('/chat/' + msg.id)}
          >
            <div style={styles.avatar}>
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
                  fontWeight: msg.unread ? 'bold' : 'normal',
                  color: msg.unread ? '#333' : '#888',
                }}>
                  {msg.lastMessage}
                </span>
                {msg.unread && <div style={styles.unreadDot} />}
              </div>
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
          <span style={{...styles.navLabel, color: '#2e7d32', fontWeight: 'bold'}}>Messages</span>
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
    fontFamily: 'Arial, sans-serif',
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingBottom: '80px',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: '20px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '20px',
    margin: '0',
  },
  list: {
    backgroundColor: 'white',
    marginTop: '12px',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    backgroundColor: '#2e7d32',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  messageInfo: {
    flex: 1,
    minWidth: 0,
  },
  messageTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  messageName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: '12px',
    color: '#aaa',
  },
  messageBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '280px',
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    backgroundColor: '#2e7d32',
    flexShrink: 0,
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'white',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  navIcon: {
    fontSize: '22px',
  },
  navLabel: {
    fontSize: '11px',
    color: '#888',
    marginTop: '2px',
  },
};

export default Messages;
