import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roleColors } from '../theme';
import { supabase } from '../supabase';

function Chat() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setCurrentUser(user);

      // Load the other person's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('id', otherUserId)
        .single();
      if (profile) setOtherProfile(profile);

      // Mark as read and immediately fire event so Layout clears the dot
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('read', false);
      window.dispatchEvent(new Event('messages-read'));

      // Load messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs);
      setLoading(false);
    };
    load();
  }, [otherUserId, navigate]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('chat-' + otherUserId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`,
      }, async (payload) => {
        if (payload.new.sender_id === otherUserId) {
          setMessages(prev => [...prev, payload.new]);
          // Mark it as read immediately since user is looking at the chat
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('id', payload.new.id);
          window.dispatchEvent(new Event('messages-read'));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, otherUserId]);

  const sendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    const text = input.trim();
    setInput('');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: otherUserId,
        content: text,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
      </div>
    );
  }

  if (!otherProfile) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: '#9aa0ac', fontSize: '14px' }}>User not found.</p>
        <span style={{ cursor: 'pointer', color: '#0a1628', fontSize: '13px' }} onClick={() => navigate(-1)}>← Go back</span>
      </div>
    );
  }

  const accentColor = roleColors[otherProfile.role] || '#0a1628';
  const initials = otherProfile.full_name?.charAt(0) || '?';

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/messages')}>←</span>
        <div
          style={{ ...styles.avatarWrapper, cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${otherUserId}`)}
        >
          {otherProfile.avatar_url ? (
            <img src={otherProfile.avatar_url} alt="" style={styles.avatarImg} />
          ) : (
            <div style={{ ...styles.avatar, backgroundColor: accentColor }}>
              {initials}
            </div>
          )}
        </div>
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${otherUserId}`)}
        >
          <h2 style={styles.headerName}>{otherProfile.full_name || 'Unknown'}</h2>
          <span style={styles.headerRole}>{otherProfile.role ? otherProfile.role.charAt(0).toUpperCase() + otherProfile.role.slice(1) : 'Member'}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messageList}>
        {messages.length === 0 && (
          <div style={styles.emptyChat}>
            <p style={styles.emptyChatText}>No messages yet — say hello! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.sender_id === currentUser?.id;
          return (
            <div
              key={msg.id}
              style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}
            >
              <div style={{
                ...styles.messageBubble,
                backgroundColor: mine ? '#0a1628' : 'white',
                color: mine ? '#c8ff00' : '#0a1628',
                borderBottomRightRadius: mine ? '4px' : '18px',
                borderBottomLeftRadius: mine ? '18px' : '4px',
                boxShadow: mine ? 'none' : '0 2px 8px rgba(10,22,40,0.08)',
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          style={{ ...styles.sendBtn, backgroundColor: input.trim() ? '#0a1628' : '#e0e4ea' }}
          onClick={sendMessage}
        >
          <span style={{ color: input.trim() ? '#c8ff00' : '#9aa0ac', fontSize: '18px' }}>➤</span>
        </button>
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
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '12px',
  },
  loadingSpinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e0e4ea',
    borderTop: '3px solid #0a1628',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backButton: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '22px',
    cursor: 'pointer',
    fontWeight: '700',
  },
  avatarWrapper: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '800',
    margin: '0 0 2px 0',
  },
  headerRole: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },
  messageList: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  emptyChatText: {
    fontSize: '13px',
    color: '#9aa0ac',
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '11px 15px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderTop: '1px solid #f0f2f5',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '999px',
    border: '2px solid #e0e4ea',
    fontSize: '14px',
    outline: 'none',
    color: '#0a1628',
    transition: 'border-color 0.2s ease',
  },
  sendBtn: {
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s ease',
  },
};

export default Chat;