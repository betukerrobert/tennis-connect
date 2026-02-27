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
  const [cards, setCards] = useState(SWIPE_USERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const dragStart = useRef(null);
  const cardRef = useRef(null);

  const current = cards[currentIndex];
  const remaining = cards.length - currentIndex;

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
      if (dragX > 0) {
        handleConnect();
      } else {
        handleSkip();
      }
    } else {
      setDragX(0);
    }
    setIsDragging(false);
    dragStart.current = null;
  };

  const handleConnect = () => {
    setLastAction('connect');
    setDragX(500);
    setTimeout(() => {
      // 50% chance of match for demo
      if (Math.random() > 0.5) {
        setShowMatch(true);
      } else {
        nextCard();
      }
    }, 300);
  };

  const handleSkip = () => {
    setLastAction('skip');
    setDragX(-500);
    setTimeout(() => {
      nextCard();
    }, 300);
  };

  const nextCard = () => {
    setDragX(0);
    setLastAction(null);
    setCurrentIndex(i => i + 1);
  };

  const rotation = dragX * 0.08;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 400);

  const connectOpacity = Math.min(1, Math.max(0, dragX / 80));
  const skipOpacity = Math.min(1, Math.max(0, -dragX / 80));

  if (showMatch) {
    return (
      <div style={styles.matchScreen}>
        <div style={styles.matchContent}>
          <div style={styles.matchEmoji}>🎾</div>
          <h2 style={styles.matchTitle}>It's a Match!</h2>
          <p style={styles.matchSubtitle}>You and {current?.name} both want to connect!</p>
          <div style={styles.matchAvatars}>
            <div style={{ ...styles.matchAvatar, backgroundColor: '#c8ff00', color: '#0a1628' }}>R</div>
            <span style={styles.matchHeart}>💛</span>
            <div style={{ ...styles.matchAvatar, backgroundColor: roleColors[current?.role] }}>
              {current?.name.charAt(0)}
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

  if (!current || currentIndex >= cards.length) {
    return (
      <div style={styles.emptyScreen}>
        <div style={styles.emptyEmoji}>🎾</div>
        <h2 style={styles.emptyTitle}>You've seen everyone!</h2>
        <p style={styles.emptySubtitle}>Check back later for new players, coaches and venues near you.</p>
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

        {/* Background card (next) */}
        {cards[currentIndex + 1] && (
          <div style={{ ...styles.card, ...styles.cardBehind }}>
            <div style={{ ...styles.cardAvatar, backgroundColor: roleColors[cards[currentIndex + 1].role] }}>
              {cards[currentIndex + 1].name.charAt(0)}
            </div>
          </div>
        )}

        {/* Main swipeable card */}
        <div
          ref={cardRef}
          style={{
            ...styles.card,
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: opacity,
            transition: isDragging ? 'none' : 'all 0.3s ease',
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
          {/* CONNECT label */}
          <div style={{ ...styles.swipeLabel, ...styles.connectLabel, opacity: connectOpacity }}>
            CONNECT ✓
          </div>

          {/* SKIP label */}
          <div style={{ ...styles.swipeLabel, ...styles.skipLabel, opacity: skipOpacity }}>
            SKIP ✗
          </div>

          {/* Card content */}
          <div style={{ ...styles.cardAvatarLarge, backgroundColor: roleColors[current.role] }}>
            {current.name.charAt(0)}
          </div>

          <div style={styles.cardBody}>
            <div style={styles.cardNameRow}>
              <h2 style={styles.cardName}>{current.name}</h2>
              {current.age && <span style={styles.cardAge}>{current.age}</span>}
            </div>
            <span style={{ ...styles.roleBadge, backgroundColor: roleColors[current.role] + '20', color: roleColors[current.role] }}>
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

      {/* Action buttons */}
      <div style={styles.actions}>
        <button style={styles.skipBtn} onClick={handleSkip}>
          <span style={styles.btnIcon}>✕</span>
        </button>
        <button style={styles.connectBtn} onClick={handleConnect}>
          <span style={styles.btnIcon}>🎾</span>
        </button>
      </div>

      <p style={styles.hint}>Swipe right to connect · Swipe left to skip</p>

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 10px 20px',
    maxWidth: '480px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0a1628',
    cursor: 'pointer',
    padding: '0',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0a1628',
    margin: '0',
  },
  counter: {
    fontSize: '13px',
    color: '#9aa0ac',
    fontWeight: '600',
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
    borderRadius: '24px',
    boxShadow: '0 8px 40px rgba(10,22,40,0.15)',
    overflow: 'hidden',
    userSelect: 'none',
    top: 0,
    left: 0,
  },
  cardBehind: {
    transform: 'scale(0.95) translateY(16px)',
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '460px',
    opacity: 0.6,
  },
  swipeLabel: {
    position: 'absolute',
    top: '24px',
    fontSize: '22px',
    fontWeight: '800',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '3px solid',
    zIndex: 10,
    letterSpacing: '1px',
  },
  connectLabel: {
    left: '20px',
    color: '#22c55e',
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.1)',
    transform: 'rotate(-15deg)',
  },
  skipLabel: {
    right: '20px',
    color: '#ef4444',
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.1)',
    transform: 'rotate(15deg)',
  },
  cardAvatarLarge: {
    width: '100%',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '72px',
    fontWeight: '800',
    color: 'white',
  },
  cardBody: {
    padding: '16px 20px 20px 20px',
  },
  cardNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  cardName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0a1628',
    margin: '0',
  },
  cardAge: {
    fontSize: '18px',
    color: '#9aa0ac',
    fontWeight: '400',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '12px',
    padding: '3px 10px',
    borderRadius: '999px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  cardBio: {
    fontSize: '14px',
    color: '#5a6270',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  cardTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    backgroundColor: '#f4f6f8',
    color: '#5a6270',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    fontWeight: '600',
  },
  cardAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
  },
  actions: {
    display: 'flex',
    gap: '32px',
    marginTop: '28px',
    alignItems: 'center',
  },
  skipBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: '2px solid #ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(239,68,68,0.2)',
    transition: 'transform 0.15s ease',
  },
  connectBtn: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#0a1628',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(10,22,40,0.3)',
    transition: 'transform 0.15s ease',
  },
  btnIcon: {
    fontSize: '26px',
  },
  hint: {
    fontSize: '12px',
    color: '#9aa0ac',
    marginTop: '16px',
    textAlign: 'center',
  },
  // Match screen
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
  },
  matchEmoji: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  matchTitle: {
    color: '#c8ff00',
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  matchSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '15px',
    margin: '0 0 32px 0',
  },
  matchAvatars: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
  },
  matchAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
  },
  matchHeart: {
    fontSize: '32px',
  },
  matchMsgBtn: {
    backgroundColor: '#c8ff00',
    color: '#0a1628',
    padding: '16px 40px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '12px',
  },
  matchSkipBtn: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    padding: '12px 40px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  // Empty screen
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
  emptyEmoji: { fontSize: '64px', marginBottom: '16px' },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#0a1628', margin: '0 0 8px 0' },
  emptySubtitle: { fontSize: '14px', color: '#9aa0ac', margin: '0 0 32px 0', lineHeight: '1.5' },
  emptyBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    padding: '14px 32px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
  },
};

export default SwipeMode;
