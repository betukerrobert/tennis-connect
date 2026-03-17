import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleColors, roleLabels } from '../theme';
import { supabase } from '../supabase';

function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all messages involving this user, ordered by most recent
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url, role)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messages) { setLoading(false); return; }

      // Deduplicate into one conversation per other user
      const seen = new Set();
      const convos = [];
      for (const msg of messages) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (seen.has(otherId)) continue;
        seen.add(otherId);
        const otherProfile = msg.sender_id === user.id ? msg.receiver : msg.sender;
        const unread = msg.receiver_id === user.id && msg.read === false;
        convos.push({
          otherId,
          otherProfile,
          lastMessage: msg.content,
          time: formatTime(msg.created_at),
          unread,
        });
      }

      setConversations(convos);

      // Mark all messages received by this user as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      // Tell Layout to clear the dot immediately
      window.dispatchEvent(new Event('messages-read'));

      setLoading(false);
    };
    load();
  }, []);

  const formatTime = (isoStr) => {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Messages</h1>
        <span style={styles.composeBtn}>✏️</span>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
        </div>
      ) : conversations.length === 0 ? (
        <div style={styles.emptyContainer}>
          <span style={{ fontSize: '40px' }}>💬</span>
          <p style={styles.emptyText}>No messages yet</p>
          <p style={styles.emptySub}>Connect with players to start chatting</p>
          <button style={styles.discoverBtn} onClick={() => navigate('/discovery')}>
            Find Players
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {conversations.map(conv => {
            const profile = conv.otherProfile;
            const role = profile?.role;
            return (
              <div
                key={conv.otherId}
                style={styles.messageRow}
                onClick={() => navigate('/chat/' + conv.otherId)}
              >
                {/* Tappable avatar → opens profile */}
                <div
                  style={{ ...styles.avatar, backgroundColor: roleColors[role] || '#0a1628', overflow: 'hidden' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/profile/${conv.otherId}`); }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile?.full_name?.charAt(0) || '?'
                  )}
                </div>

                <div style={styles.messageInfo}>
                  <div style={styles.messageTop}>
                    {/* Tappable name → opens profile */}
                    <span
                      style={{ ...styles.messageName, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${conv.otherId}`); }}
                    >
                      {profile?.full_name || 'Unknown'}
                    </span>
                    <span style={styles.messageTime}>{conv.time}</span>
                  </div>
                  <div style={styles.messageBottom}>
                    <span style={{
                      ...styles.messagePreview,
                      fontWeight: conv.unread ? '700' : '400',
                      color: conv.unread ? '#0a1628' : '#9aa0ac',
                    }}>
                      {conv.lastMessage}
                    </span>
                    {conv.unread && <div style={styles.unreadDot} />}
                  </div>
                  {role && (
                    <span style={{ ...styles.rolePill, backgroundColor: (roleColors[role] || '#0a1628') + '18', color: roleColors[role] || '#0a1628' }}>
                      {roleLabels[role]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '60px 20px',
  },
  loadingSpinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e0e4ea',
    borderTop: '3px solid #0a1628',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    gap: '10px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0a1628',
    margin: '0',
  },
  emptySub: {
    fontSize: '13px',
    color: '#9aa0ac',
    margin: '0',
  },
  discoverBtn: {
    marginTop: '8px',
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '600',
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
    cursor: 'pointer',
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
};

export default Messages;