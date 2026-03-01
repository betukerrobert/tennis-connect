import { useState, useRef } from 'react';
import { roleColors, roleLabels } from '../theme';

const SWIPE_USERS = [
  { id: 1, name: 'Alex Johnson', role: 'player', level: 'Intermediate', location: 'London, UK', bio: 'Looking for a hitting partner on weekends. Play 3x per week. Love competitive rallies!', available: 'Weekends', age: 28 },
  { id: 2, name: 'Sarah Williams', role: 'coach', level: 'Pro Coach', location: 'Manchester, UK', bio: '10 years coaching experience. Work with all levels from beginner to competitive.', available: 'Mon-Fri', age: 35 },
  { id: 3, name: 'City Tennis Club', role: 'venue', level: '6 Courts', location: 'Birmingham, UK', bio: 'Indoor and outdoor courts available. Floodlit evenings. Booking required.', available: 'Daily 7am-10pm', age: null },
  { id: 4, name: 'Marco Rossi', role: 'player', level: 'Advanced', location: 'London, UK', bio: 'Competitive player looking for high level sparring partners. ITF rated.', available: 'Evenings', age: 24 },
  { id: 5, name: 'Emma Davis', role: 'coach', level: 'Certified Coach', location: 'London, UK', bio: 'Specialist in junior development and beginner adults. Patient and encouraging style.', available: 'Weekdays', age: 31 },
  { id: 6, name: 'Wimbledon Park TC', role: 'venue', level: '12 Courts', location: 'London, UK', bio: 'Premium club with grass and hard courts. Floodlit. Cafe on site.', available: 'Daily 8am-9pm', age: null },
];

function SwipeMode({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const dragStart = useRef(null);

  const current = SWIPE_USERS[currentIndex];
  const next = SWIPE_USERS[currentIndex + 1];
  const remaining = SWIPE_USERS.length - currentIndex;

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStart.current = clientX;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging || dragStart.current === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - dragStart.current);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragX) > 80) {
      dragX > 0 ? handleConnect() : handleSkip();
    } else {
      setDragX(0);
    }
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleConnect = () => {
    setDragX(500);
    setTimeout(() => {
      if (Math.random() > 0.5) setShowMatch(true);
      else nextCard();
    }, 280);
  };

  const handleSkip = () => {
    setDragX(-500);
    setTimeout(() => nextCard(), 280);
  };

  const nextCard = () => {
    setDragX(0);
    setCurrentIndex(i => i + 1);
  };

  const rotation = dragX * 0.07;
  const cardOpacity = Math.max(0, 1 - Math.abs(dragX) / 400);
  const connectOpacity = Math.min(1, Math.max(0, dragX / 80));
  const skipOpacity = Math.min(1, Math.max(0, -dragX / 80));

  if (showMatch && current) {
    return (
      <div style={styles.matchScreen}>
        <div style={styles.matchContent}>
          <div style={styles.matchEmoji}>🎾</div>
          <h2 style={styles.matchTitle}>It's a Match</h2>
          <p style={styles.matchSubtitle}>You and {current.name} both want to connect</p>
          <div style={styles.matchAvatars}>
            <div style={{ ...styles.matchAvatar, backgroundColor: '#c8ff00', color: '#0a1628' }}>R</div>
            <span style={styles.matchHeart}>♥</span>
            <div style={{ ...styles.matchAvatar, backgroundColor: roleColors[current.role] }}>
              {current.name.charAt(0)}
            </div>
          </div>
          <button style={styles.matchMsgBtn} onClick={() => { setShowMatch(false); nextCard(); }}>
            Send a Message
          </button>
          <button style={styles.matchSkipBtn} onClick={() => { setShowMatch(false); nextCard(); }}>
            Keep Swiping
          </button>
        </div>
      </div>
    );
  }

  if (!current || currentIndex >= SWIPE_USERS.length) {
    return (
      <div style={styles.emptyScreen}>
        <div style={styles.emptyEmoji}>🎾</div>
        <h2 style={styles.emptyTitle}>You've seen everyone</h2>
        <p style={styles.emptySubtitle}>Check back later for new people near you.</p>
        <button style={styles.emptyBtn} onClick={onClose}>Back to Browse</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.closeBtn} onClick={onClose}>← Browse</button>
        <h2 style={styles.headerTitle}>Swipe Mode</h2>
        <span style={styles.counter}>{remaining} left</span>
      </div>

      {/* Card stack */}
      <div style={styles.cardStack}>

        {/* Card behind */}
        {next && (
          <div style={styles.cardBehind}>
            <div style={{ ...styles.cardAvatarLarge, backgroundColor: roleColors[next.role], height: '180px' }}>
              {next.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Main card */}
        <div
          style={{
            ...styles.card,
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: cardOpacity,
            transition: isDragging ? 'none' : 'all 0.28s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Swipe indicators on card */}
          <div style={{ ...styles.swipeLabel, ...styles.connectLabel, opacity: connectOpacity }}>
            Connect
          </div>
          <div style={{ ...styles.swipeLabel, ...styles.skipLabel, opacity: skipOpacity }}>
            Skip
          </div>

          <div style={{ ...styles.cardAvatarLarge, backgroundColor: roleColors[current.role] }}>
            {current.name.charAt(0)}
          </div>

          <div style={styles.cardBody}>
            <div style={styles.cardNameRow}>
              <h2 style={styles.cardName}>{current.name}</h2>
              {current.age && <span style={styles.cardAge}>{current.age}</span>}
            </div>
            <span style={{ ...styles.roleBadge, backgroundColor: roleColors[current.role] + '15', color: roleColors[current.role] }}>
              {roleLabels[current.role]}
            </span>
            <p style={styles.cardBio}>{current.bio}</p>
            <div style={styles.cardTags}>
              <span style={styles.tag}>📍 {current.location}</span>
              <span style={styles.tag}>⭐ {current.level}</span>
              <span style={styles.tag}>🕐 {current.available}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons + labels */}
      <div style={styles.actionsWrapper}>
        <div style={styles.actionCol}>
          <span style={styles.hintText}>Skip</span>
          <button style={styles.skipBtn} onClick={handleSkip}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ ...styles.actionCol, alignItems: 'center' }}>
          <span style={{ ...styles.hintText, opacity: 0 }}>·</span>
          <div style={styles.centerDot}>🎾</div>
        </div>

        <div style={{ ...styles.actionCol, alignItems: 'flex-end' }}>
          <span style={styles.hintText}>Connect</span>
          <button style={styles.connectBtn} onClick={handleConnect}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>

      <p style={styles.hint}>← Swipe left to skip · Swipe right to connect →</p>

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    paddingBottom: '20px',
  },
  header: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 10px 20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    color: '#0a1628',
    cursor: 'pointer',
    padding: '0',
    letterSpacing: '0.2px',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0a1628',
    margin: '0',
    letterSpacing: '-0.2px',
  },
  counter: {
    fontSize: '12px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  cardStack: {
    position: 'relative',
    width: '340px',
    height: '460px',
    marginTop: '10px',
  },
  card: {
    position: 'absolute',
    width: '340px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 6px 32px rgba(10,22,40,0.12)',
    overflow: 'hidden',
    userSelect: 'none',
    top: 0, left: 0,
    zIndex: 2,
  },
  cardBehind: {
    position: 'absolute',
    width: '340px',
    height: '460px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 2px 16px rgba(10,22,40,0.07)',
    overflow: 'hidden',
    top: 0, left: 0,
    zIndex: 1,
    transform: 'scale(0.95) translateY(12px)',
    opacity: 0.7,
  },
  swipeLabel: {
    position: 'absolute',
    top: '20px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '5px 12px',
    borderRadius: '8px',
    border: '1.5px solid',
    zIndex: 10,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  connectLabel: {
    left: '16px',
    color: '#22c55e',
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
    transform: 'rotate(-12deg)',
  },
  skipLabel: {
    right: '16px',
    color: '#ef4444',
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
    transform: 'rotate(12deg)',
  },
  cardAvatarLarge: {
    width: '100%',
    height: '190px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '68px',
    fontWeight: '300',
    color: 'white',
  },
  cardBody: {
    padding: '16px 20px 20px 20px',
  },
  cardNameRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '6px',
  },
  cardName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0a1628',
    margin: '0',
    letterSpacing: '-0.3px',
  },
  cardAge: {
    fontSize: '16px',
    color: '#9aa0ac',
    fontWeight: '300',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '11px',
    padding: '3px 10px',
    borderRadius: '999px',
    fontWeight: '500',
    marginBottom: '10px',
    letterSpacing: '0.3px',
  },
  cardBio: {
    fontSize: '13px',
    color: '#5a6270',
    lineHeight: '1.6',
    margin: '0 0 12px 0',
    fontWeight: '400',
  },
  cardTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    backgroundColor: '#f4f6f8',
    color: '#9aa0ac',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    fontWeight: '400',
  },
  actionsWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '300px',
    marginTop: '28px',
  },
  actionCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  },
  hintText: {
    fontSize: '11px',
    color: '#9aa0ac',
    fontWeight: '400',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  skipBtn: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: '1.5px solid #ef444440',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(239,68,68,0.12)',
    transition: 'transform 0.15s ease',
  },
  connectBtn: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    backgroundColor: '#c8ff00',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(200,255,0,0.3)',
    transition: 'transform 0.15s ease',
  },
  centerDot: {
    fontSize: '28px',
    opacity: 0.3,
  },
  hint: {
    fontSize: '11px',
    color: '#9aa0ac',
    marginTop: '16px',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: '0.3px',
  },
  matchScreen: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  matchContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '360px',
  },
  matchEmoji: { fontSize: '56px', marginBottom: '16px' },
  matchTitle: {
    color: '#c8ff00',
    fontSize: '30px',
    fontWeight: '300',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  matchSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: '0 0 32px 0',
    fontWeight: '300',
  },
  matchAvatars: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
  },
  matchAvatar: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '600',
    color: 'white',
  },
  matchHeart: {
    fontSize: '24px',
    color: '#c8ff00',
  },
  matchMsgBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '15px 40px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '10px',
    letterSpacing: '0.2px',
  },
  matchSkipBtn: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    padding: '12px 40px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    width: '100%',
  },
  emptyScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 24px',
    textAlign: 'center',
    backgroundColor: '#f4f6f8',
  },
  emptyEmoji: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '22px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
  emptySubtitle: { fontSize: '13px', color: '#9aa0ac', margin: '0 0 32px 0', lineHeight: '1.6', fontWeight: '400' },
  emptyBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '13px 32px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default SwipeMode;
