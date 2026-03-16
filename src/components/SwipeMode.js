import { useState, useRef, useEffect } from 'react';
import { roleColors, roleLabels } from '../theme';
import { supabase } from '../supabase';

const FREE_DAILY_SWIPES = 10;

function SwipeMode({ onClose, users = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const dragStart = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [swipesUsed, setSwipesUsed] = useState(0);
  const [swipesAllowed, setSwipesAllowed] = useState(FREE_DAILY_SWIPES);
  const [bonusSwipes, setBonusSwipes] = useState(0);
  const [loadingLimits, setLoadingLimits] = useState(true);

  // ── Load swipe limits from Supabase ─────────────────────────────────
  useEffect(() => {
    const loadLimits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingLimits(false); return; }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('pong_bonus_swipes, swipe_last_reset_date, swipes_used_today')
        .eq('id', user.id)
        .single();

      if (!profile) { setLoadingLimits(false); return; }

      const today = new Date().toISOString().split('T')[0];
      const bonus = profile.pong_bonus_swipes || 0;
      let usedToday = profile.swipes_used_today || 0;

      // Reset daily counter if it's a new day
      if (profile.swipe_last_reset_date !== today) {
        await supabase
          .from('profiles')
          .update({ swipes_used_today: 0, swipe_last_reset_date: today })
          .eq('id', user.id);
        usedToday = 0;
      }

      setBonusSwipes(bonus);
      setSwipesUsed(usedToday);
      setSwipesAllowed(FREE_DAILY_SWIPES + bonus);
      setLoadingLimits(false);
    };
    loadLimits();
  }, []);

  // ── Record a swipe in Supabase ───────────────────────────────────────
  const recordSwipe = async () => {
    if (!currentUser) return;
    const newUsed = swipesUsed + 1;
    setSwipesUsed(newUsed);

    // If using a bonus swipe, deduct it
    const newBonus = newUsed > FREE_DAILY_SWIPES ? Math.max(0, bonusSwipes - 1) : bonusSwipes;
    if (newUsed > FREE_DAILY_SWIPES && bonusSwipes > 0) {
      setBonusSwipes(newBonus);
      await supabase
        .from('profiles')
        .update({ swipes_used_today: newUsed, pong_bonus_swipes: newBonus })
        .eq('id', currentUser.id);
    } else {
      await supabase
        .from('profiles')
        .update({ swipes_used_today: newUsed })
        .eq('id', currentUser.id);
    }
  };

  const swipesLeft = Math.max(0, swipesAllowed - swipesUsed);
  const outOfSwipes = !loadingLimits && swipesLeft === 0;

  // Filter out current user from the swipe deck
  const deck = users.filter(u => u.id !== currentUser?.id);
  const current = deck[currentIndex];
  const next = deck[currentIndex + 1];
  const remaining = Math.min(swipesLeft, deck.length - currentIndex);

  const handleDragStart = (e) => {
    if (outOfSwipes) return;
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
    if (outOfSwipes) return;
    recordSwipe();
    setDragX(500);
    setTimeout(() => {
      if (Math.random() > 0.5) setShowMatch(true);
      else nextCard();
    }, 280);
  };

  const handleSkip = () => {
    if (outOfSwipes) return;
    recordSwipe();
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

  // ── Match screen ─────────────────────────────────────────────────────
  if (showMatch && current) {
    return (
      <div style={styles.matchScreen}>
        <div style={styles.matchContent}>
          <div style={styles.matchEmoji}>🎾</div>
          <h2 style={styles.matchTitle}>It's a Match</h2>
          <p style={styles.matchSubtitle}>You and {current.full_name} both want to connect</p>
          <div style={styles.matchAvatars}>
            <div style={{ ...styles.matchAvatar, backgroundColor: '#c8ff00', color: '#0a1628' }}>R</div>
            <span style={styles.matchHeart}>♥</span>
            <div style={{ ...styles.matchAvatar, backgroundColor: roleColors[current.role] || '#0a1628' }}>
              {current.full_name?.charAt(0) || '?'}
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

  // ── Loading ───────────────────────────────────────────────────────────
  if (loadingLimits) {
    return (
      <div style={styles.emptyScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: '#9aa0ac', fontSize: '13px', marginTop: '16px' }}>Loading...</p>
      </div>
    );
  }

  // ── Out of swipes screen ─────────────────────────────────────────────
  if (outOfSwipes) {
    return (
      <div style={styles.emptyScreen}>
        <div style={styles.emptyEmoji}>⏳</div>
        <h2 style={styles.emptyTitle}>No swipes left today</h2>
        <p style={styles.emptySubtitle}>
          You've used all {FREE_DAILY_SWIPES} free swipes for today.
          {bonusSwipes === 0
            ? ' Beat the CPU in Pong to earn a bonus swipe!'
            : ` You have ${bonusSwipes} bonus swipe${bonusSwipes > 1 ? 's' : ''} — refresh to use them.`
          }
        </p>
        <button style={styles.pongBtn} onClick={onClose}>
          🏓 Play Pong to earn more
        </button>
        <button style={{ ...styles.emptyBtn, marginTop: '10px' }} onClick={onClose}>
          Back to Browse
        </button>
      </div>
    );
  }

  // ── Empty deck ───────────────────────────────────────────────────────
  if (!current || currentIndex >= deck.length) {
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

      {/* Swipe limit bar */}
      <div style={styles.limitBar}>
        <div style={styles.limitBarInner}>
          <span style={styles.limitText}>
            {swipesLeft} swipe{swipesLeft !== 1 ? 's' : ''} remaining today
          </span>
          {bonusSwipes > 0 && (
            <span style={styles.bonusBadge}>+{bonusSwipes} bonus 🏓</span>
          )}
        </div>
        <div style={styles.limitTrack}>
          <div style={{
            ...styles.limitFill,
            width: `${Math.min(100, (swipesLeft / swipesAllowed) * 100)}%`,
            backgroundColor: swipesLeft <= 3 ? '#ef4444' : '#c8ff00',
          }} />
        </div>
      </div>

      {/* Card stack */}
      <div style={styles.cardStack}>

        {next && (
          <div style={styles.cardBehind}>
            <div style={{ ...styles.cardAvatarLarge, backgroundColor: roleColors[next.role] || '#0a1628', height: '180px' }}>
              {next.avatar_url
                ? <img src={next.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : next.full_name?.charAt(0) || '?'
              }
            </div>
          </div>
        )}

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
          <div style={{ ...styles.swipeLabel, ...styles.connectLabel, opacity: connectOpacity }}>Connect</div>
          <div style={{ ...styles.swipeLabel, ...styles.skipLabel, opacity: skipOpacity }}>Skip</div>

          <div style={{ ...styles.cardAvatarLarge, backgroundColor: roleColors[current.role] || '#0a1628' }}>
            {current.avatar_url
              ? <img src={current.avatar_url} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover' }} />
              : current.full_name?.charAt(0) || '?'
            }
          </div>

          <div style={styles.cardBody}>
            <div style={styles.cardNameRow}>
              <h2 style={styles.cardName}>{current.full_name || 'Unknown'}</h2>
              {current.age && <span style={styles.cardAge}>{current.age}</span>}
            </div>
            <span style={{ ...styles.roleBadge, backgroundColor: (roleColors[current.role] || '#0a1628') + '15', color: roleColors[current.role] || '#0a1628' }}>
              {roleLabels[current.role]}
            </span>
            {current.bio && <p style={styles.cardBio}>{current.bio}</p>}
            <div style={styles.cardTags}>
              {current.location && <span style={styles.tag}>📍 {current.location}</span>}
              {current.level && <span style={styles.tag}>⭐ {current.level}</span>}
              {current.availability && <span style={styles.tag}>🕐 {current.availability}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actionsWrapper}>
        <div style={styles.actionCol}>
          <span style={styles.hintText}>Skip</span>
          <button style={styles.skipBtn} onClick={handleSkip}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
    background: 'none', border: 'none', fontSize: '13px',
    fontWeight: '500', color: '#0a1628', cursor: 'pointer', padding: '0',
  },
  headerTitle: {
    fontSize: '16px', fontWeight: '600', color: '#0a1628',
    margin: '0', letterSpacing: '-0.2px',
  },
  counter: { fontSize: '12px', color: '#9aa0ac', fontWeight: '400' },

  // Swipe limit bar
  limitBar: {
    width: '100%',
    maxWidth: '340px',
    marginBottom: '12px',
  },
  limitBarInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  limitText: { fontSize: '11px', color: '#9aa0ac', fontWeight: '400' },
  bonusBadge: {
    fontSize: '11px',
    color: '#0a1628',
    backgroundColor: '#c8ff00',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '600',
  },
  limitTrack: {
    height: '3px',
    backgroundColor: '#e0e4ea',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  limitFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },

  cardStack: {
    position: 'relative',
    width: '340px',
    height: '460px',
    marginTop: '4px',
  },
  card: {
    position: 'absolute',
    width: '340px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 6px 32px rgba(10,22,40,0.12)',
    overflow: 'hidden',
    userSelect: 'none',
    top: 0, left: 0, zIndex: 2,
  },
  cardBehind: {
    position: 'absolute',
    width: '340px', height: '460px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 2px 16px rgba(10,22,40,0.07)',
    overflow: 'hidden',
    top: 0, left: 0, zIndex: 1,
    transform: 'scale(0.95) translateY(12px)',
    opacity: 0.7,
  },
  swipeLabel: {
    position: 'absolute', top: '20px', fontSize: '13px', fontWeight: '600',
    padding: '5px 12px', borderRadius: '8px', border: '1.5px solid',
    zIndex: 10, letterSpacing: '1px', textTransform: 'uppercase',
  },
  connectLabel: {
    left: '16px', color: '#22c55e', borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)', transform: 'rotate(-12deg)',
  },
  skipLabel: {
    right: '16px', color: '#ef4444', borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)', transform: 'rotate(12deg)',
  },
  cardAvatarLarge: {
    width: '100%', height: '190px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '68px', fontWeight: '300', color: 'white', overflow: 'hidden',
  },
  cardBody: { padding: '16px 20px 20px 20px' },
  cardNameRow: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' },
  cardName: { fontSize: '20px', fontWeight: '600', color: '#0a1628', margin: '0', letterSpacing: '-0.3px' },
  cardAge: { fontSize: '16px', color: '#9aa0ac', fontWeight: '300' },
  roleBadge: {
    display: 'inline-block', fontSize: '11px', padding: '3px 10px',
    borderRadius: '999px', fontWeight: '500', marginBottom: '10px',
  },
  cardBio: { fontSize: '13px', color: '#5a6270', lineHeight: '1.6', margin: '0 0 12px 0', fontWeight: '400' },
  cardTags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tag: { backgroundColor: '#f4f6f8', color: '#9aa0ac', fontSize: '11px', padding: '4px 10px', borderRadius: '999px' },
  actionsWrapper: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', width: '300px', marginTop: '28px',
  },
  actionCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' },
  hintText: { fontSize: '11px', color: '#9aa0ac', fontWeight: '400', letterSpacing: '0.5px', textTransform: 'uppercase' },
  skipBtn: {
    width: '58px', height: '58px', borderRadius: '50%', backgroundColor: 'white',
    border: '1.5px solid #ef444440', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(239,68,68,0.12)',
  },
  connectBtn: {
    width: '58px', height: '58px', borderRadius: '50%', backgroundColor: '#c8ff00',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(200,255,0,0.3)',
  },
  centerDot: { fontSize: '28px', opacity: 0.3 },
  hint: { fontSize: '11px', color: '#9aa0ac', marginTop: '16px', textAlign: 'center', letterSpacing: '0.3px' },
  matchScreen: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  matchContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 24px', textAlign: 'center', width: '100%', maxWidth: '360px',
  },
  matchEmoji: { fontSize: '56px', marginBottom: '16px' },
  matchTitle: { color: '#c8ff00', fontSize: '30px', fontWeight: '300', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  matchSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 32px 0', fontWeight: '300' },
  matchAvatars: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' },
  matchAvatar: { width: '68px', height: '68px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '600', color: 'white' },
  matchHeart: { fontSize: '24px', color: '#c8ff00' },
  matchMsgBtn: {
    backgroundColor: '#c8ff00', color: '#0a1628', padding: '15px 40px',
    borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', width: '100%', marginBottom: '10px',
  },
  matchSkipBtn: {
    backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)',
    padding: '12px 40px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px',
    fontWeight: '400', cursor: 'pointer', width: '100%',
  },
  emptyScreen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh',
    padding: '40px 24px', textAlign: 'center', backgroundColor: '#f4f6f8',
  },
  loadingSpinner: {
    width: '32px', height: '32px',
    border: '3px solid #e0e4ea', borderTop: '3px solid #0a1628',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  emptyEmoji: { fontSize: '56px', marginBottom: '16px' },
  emptyTitle: { fontSize: '22px', fontWeight: '600', color: '#0a1628', margin: '0 0 8px 0' },
  emptySubtitle: { fontSize: '13px', color: '#9aa0ac', margin: '0 0 32px 0', lineHeight: '1.6', fontWeight: '400' },
  pongBtn: {
    backgroundColor: '#0a1628', color: '#c8ff00', padding: '13px 32px',
    borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  emptyBtn: {
    backgroundColor: 'white', color: '#9aa0ac', padding: '13px 32px',
    borderRadius: '12px', border: '1.5px solid #e0e4ea', fontSize: '14px',
    fontWeight: '500', cursor: 'pointer',
  },
};

export default SwipeMode;
