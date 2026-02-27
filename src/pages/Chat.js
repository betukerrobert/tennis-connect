import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roleColors } from '../theme';

const DUMMY_CHATS = {
  1: { name: 'Alex Johnson', role: 'player', messages: [
    { id: 1, text: 'Hey! I saw your profile, want to hit some balls this weekend?', mine: false },
    { id: 2, text: 'Hey Alex! Sure, sounds great!', mine: true },
    { id: 3, text: 'Are you free this Saturday?', mine: false },
  ]},
  2: { name: 'Sarah Williams', role: 'coach', messages: [
    { id: 1, text: 'Hi! I checked your profile, I think I can really help you improve your game.', mine: false },
    { id: 2, text: 'That sounds amazing, what are your rates?', mine: true },
    { id: 3, text: 'I can do a trial session on Monday!', mine: false },
  ]},
  3: { name: 'City Tennis Club', role: 'venue', messages: [
    { id: 1, text: 'Hello! Thanks for your interest in our club.', mine: false },
    { id: 2, text: 'Do you have courts available this evening?', mine: true },
    { id: 3, text: 'Court 3 is available from 6pm.', mine: false },
  ]},
  4: { name: 'Marco Rossi', role: 'player', messages: [
    { id: 1, text: 'Great match yesterday!', mine: false },
    { id: 2, text: 'Thanks! You were tough to beat haha', mine: true },
  ]},
};

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chat = DUMMY_CHATS[id];
  const [messages, setMessages] = useState(chat ? chat.messages : []);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: messages.length + 1, text: input, mine: true }]);
    setInput('');
  };

  if (!chat) return <div style={{ padding: '20px' }}>Chat not found</div>;

  const accentColor = roleColors[chat.role];

  return (
    <div style={styles.container}>

      <div style={{ ...styles.header, borderBottom: `3px solid ${accentColor}` }}>
        <span style={styles.backButton} onClick={() => navigate('/messages')}>←</span>
        <div style={{ ...styles.avatar, backgroundColor: accentColor }}>
          {chat.name.charAt(0)}
        </div>
        <div>
          <h2 style={styles.headerName}>{chat.name}</h2>
          <span style={{ ...styles.onlineStatus, color: accentColor }}>● Online</span>
        </div>
      </div>

      <div style={styles.messageList}>
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.mine ? 'flex-end' : 'flex-start',
              animation: index === messages.length - 1 ? 'fadeIn 0.2s ease' : 'none',
            }}
          >
            <div style={{
              ...styles.messageBubble,
              backgroundColor: msg.mine ? '#0a1628' : 'white',
              color: msg.mine ? '#c8ff00' : '#0a1628',
              borderBottomRightRadius: msg.mine ? '4px' : '18px',
              borderBottomLeftRadius: msg.mine ? '18px' : '4px',
              boxShadow: msg.mine ? 'none' : '0 2px 8px rgba(10,22,40,0.08)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

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
    flexShrink: 0,
  },
  headerName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '800',
    margin: '0 0 2px 0',
  },
  onlineStatus: {
    fontSize: '11px',
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
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
