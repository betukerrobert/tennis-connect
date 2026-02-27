import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DUMMY_CHATS = {
  1: {
    name: 'Alex Johnson',
    messages: [
      { id: 1, text: 'Hey! I saw your profile, want to hit some balls this weekend?', mine: false },
      { id: 2, text: 'Hey Alex! Sure, sounds great!', mine: true },
      { id: 3, text: 'Are you free this Saturday?', mine: false },
    ],
  },
  2: {
    name: 'Sarah Williams',
    messages: [
      { id: 1, text: 'Hi! I checked your profile, I think I can really help you improve your game.', mine: false },
      { id: 2, text: 'That sounds amazing, what are your rates?', mine: true },
      { id: 3, text: 'I can do a trial session on Monday!', mine: false },
    ],
  },
  3: {
    name: 'City Tennis Club',
    messages: [
      { id: 1, text: 'Hello! Thanks for your interest in our club.', mine: false },
      { id: 2, text: 'Do you have courts available this evening?', mine: true },
      { id: 3, text: 'Court 3 is available from 6pm.', mine: false },
    ],
  },
  4: {
    name: 'Marco Rossi',
    messages: [
      { id: 1, text: 'Great match yesterday!', mine: false },
      { id: 2, text: 'Thanks! You were tough to beat haha', mine: true },
    ],
  },
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

  if (!chat) {
    return <div style={{ padding: '20px' }}>Chat not found</div>;
  }

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <span style={styles.backButton} onClick={() => navigate('/messages')}>
          ←
        </span>
        <div style={styles.avatar}>{chat.name.charAt(0)}</div>
        <h2 style={styles.headerName}>{chat.name}</h2>
      </div>

      <div style={styles.messageList}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.mine ? 'flex-end' : 'flex-start',
              backgroundColor: msg.mine ? '#2e7d32' : 'white',
              color: msg.mine ? 'white' : '#1a1a1a',
            }}
          >
            {msg.text}
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
        <button style={styles.sendBtn} onClick={sendMessage}>
          ➤
        </button>
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
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backButton: {
    color: 'white',
    fontSize: '22px',
    cursor: 'pointer',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  headerName: {
    color: 'white',
    fontSize: '18px',
    margin: '0',
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
    padding: '10px 14px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Chat;
