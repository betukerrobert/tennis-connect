import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const theme = {
  navy: '#0a1628',
  accent: '#c8ff00',
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export default function MatchInvite() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // Suggest new time state
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestDate, setSuggestDate] = useState('');
  const [suggestTime, setSuggestTime] = useState('');
  const [focused, setFocused] = useState(null);
  const [done, setDone] = useState(null); // 'accepted' | 'declined' | 'rescheduled'

  useEffect(() => {
    const fetchMatch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          sender:profiles!matches_sender_id_fkey(id, full_name, avatar_url, utr_rating, location),
          receiver:profiles!matches_receiver_id_fkey(id, full_name, avatar_url, utr_rating, location)
        `)
        .eq('id', matchId)
        .single();

      if (!error && data) setMatch(data);
      setLoading(false);
    };
    fetchMatch();
  }, [matchId]);

  const isReceiver = match?.receiver_id === currentUser?.id;
  const opponent = match ? (isReceiver ? match.sender : match.receiver) : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const handleAccept = async () => {
    setActing(true);
    const { error } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId);
    if (!error) setDone('accepted');
    setActing(false);
  };

  const handleDecline = async () => {
    setActing(true);
    const { error } = await supabase
      .from('matches')
      .update({ status: 'declined' })
      .eq('id', matchId);
    if (!error) setDone('declined');
    setActing(false);
  };

  const handleSuggest = async () => {
    if (!suggestDate || !suggestTime) return;
    setActing(true);
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'rescheduled',
        suggested_date: suggestDate,
        suggested_time: suggestTime,
      })
      .eq('id', matchId);
    if (!error) setDone('rescheduled');
    setActing(false);
  };

  const handleAcceptSuggestion = async () => {
    setActing(true);
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'accepted',
        match_date: match.suggested_date,
        match_time: match.suggested_time,
        suggested_date: null,
        suggested_time: null,
      })
      .eq('id', matchId);
    if (!error) setDone('accepted');
    setActing(false);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.font }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading…</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.font }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Match not found.</div>
      </div>
    );
  }

  // Done screen
  if (done) {
    const messages = {
      accepted: { icon: '✅', title: 'Match Confirmed!', sub: `You're on for ${formatDate(match.match_date)} at ${match.match_time?.slice(0,5)}` },
      declined: { icon: '❌', title: 'Match Declined', sub: 'The invite has been declined.' },
      rescheduled: { icon: '⟳', title: 'New Time Suggested', sub: `You suggested ${formatDate(suggestDate)} at ${suggestTime}. Waiting for confirmation.` },
    };
    const msg = messages[done];
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: theme.font, gap: '16px' }}>
        <div style={{ fontSize: '64px' }}>{msg.icon}</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>{msg.title}</div>
        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: '1.5' }}>{msg.sub}</div>
        <button style={{ marginTop: '16px', padding: '16px 32px', borderRadius: '12px', border: 'none', backgroundColor: theme.accent, color: theme.navy, fontSize: '15px', fontWeight: '700', fontFamily: theme.font, cursor: 'pointer' }} onClick={() => navigate('/matches')}>
          View All Matches
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgPattern} />

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.headerLabel}>
          {isReceiver ? 'Match Invite' : 'Match Details'}
        </div>
      </div>

      {/* Opponent */}
      <div style={styles.opponentSection}>
        <div style={styles.vsLabel}>vs</div>
        <div style={styles.opponentAvatar}>
          {opponent?.avatar_url
            ? <img src={opponent.avatar_url} alt="" style={styles.avatarImg} />
            : <span style={styles.avatarInitial}>{opponent?.full_name?.[0]}</span>
          }
        </div>
        <div style={styles.opponentName}>{opponent?.full_name}</div>
        {opponent?.utr_rating && (
          <div style={styles.opponentUtr}>UTR {opponent.utr_rating}</div>
        )}
      </div>

      {/* Match Details Card */}
      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📅</span>
          <div>
            <div style={styles.detailLabel}>Date</div>
            <div style={styles.detailValue}>{formatDate(match.match_date)}</div>
          </div>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>⏰</span>
          <div>
            <div style={styles.detailLabel}>Time</div>
            <div style={styles.detailValue}>{match.match_time?.slice(0, 5)}</div>
          </div>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📍</span>
          <div>
            <div style={styles.detailLabel}>Court</div>
            <div style={styles.detailValue}>{match.court_name}</div>
            {match.court_address && (
              <div style={styles.detailSub}>{match.court_address}</div>
            )}
          </div>
        </div>

        {/* Suggested time (if rescheduled) */}
        {match.status === 'rescheduled' && match.suggested_date && (
          <>
            <div style={styles.divider} />
            <div style={{ ...styles.detailRow, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={styles.suggestionBadge}>⟳ New time suggested</div>
              <div style={styles.detailValue}>
                {formatDate(match.suggested_date)} at {match.suggested_time?.slice(0,5)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status badge */}
      <div style={styles.statusRow}>
        <div style={{
          ...styles.statusBadge,
          backgroundColor: match.status === 'accepted' ? 'rgba(16,185,129,0.1)' : match.status === 'declined' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          color: match.status === 'accepted' ? '#10b981' : match.status === 'declined' ? '#ef4444' : '#f59e0b',
        }}>
          {match.status === 'accepted' ? '✓ Confirmed' : match.status === 'declined' ? '✗ Declined' : match.status === 'rescheduled' ? '⟳ Awaiting confirmation' : '⏳ Pending response'}
        </div>
      </div>

      {/* Actions — only for receiver when pending */}
      {isReceiver && match.status === 'pending' && !showSuggest && (
        <div style={styles.actions}>
          <button style={styles.acceptBtn} onClick={handleAccept} disabled={acting}>
            {acting ? '…' : '✓ Accept'}
          </button>
          <button style={styles.suggestBtn} onClick={() => setShowSuggest(true)}>
            ⟳ Suggest New Time
          </button>
          <button style={styles.declineBtn} onClick={handleDecline} disabled={acting}>
            {acting ? '…' : '✗ Decline'}
          </button>
        </div>
      )}

      {/* Sender accepts suggestion */}
      {!isReceiver && match.status === 'rescheduled' && (
        <div style={styles.actions}>
          <button style={styles.acceptBtn} onClick={handleAcceptSuggestion} disabled={acting}>
            {acting ? '…' : '✓ Accept New Time'}
          </button>
          <button style={styles.declineBtn} onClick={handleDecline} disabled={acting}>
            {acting ? '…' : '✗ Decline'}
          </button>
        </div>
      )}

      {/* Suggest new time form */}
      {showSuggest && (
        <div style={styles.suggestForm}>
          <div style={styles.suggestTitle}>Suggest a new time</div>

          <input
            type="date"
            min={today}
            value={suggestDate}
            onChange={(e) => setSuggestDate(e.target.value)}
            onFocus={() => setFocused('sdate')}
            onBlur={() => setFocused(null)}
            style={{ ...styles.input, ...(focused === 'sdate' ? styles.inputFocused : {}), colorScheme: 'dark', marginBottom: '10px' }}
          />
          <input
            type="time"
            value={suggestTime}
            onChange={(e) => setSuggestTime(e.target.value)}
            onFocus={() => setFocused('stime')}
            onBlur={() => setFocused(null)}
            style={{ ...styles.input, ...(focused === 'stime' ? styles.inputFocused : {}), colorScheme: 'dark', marginBottom: '14px' }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ ...styles.acceptBtn, flex: 1, opacity: (!suggestDate || !suggestTime) ? 0.4 : 1 }}
              onClick={handleSuggest}
              disabled={!suggestDate || !suggestTime || acting}
            >
              Send Suggestion
            </button>
            <button
              style={{ ...styles.declineBtn, flex: 1 }}
              onClick={() => setShowSuggest(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: theme.navy,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.font,
    position: 'relative',
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(200,255,0,0.05) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  header: {
    padding: '48px 24px 16px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backBtn: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px', fontFamily: theme.font,
    cursor: 'pointer', padding: 0,
  },
  headerLabel: {
    fontSize: '13px', fontWeight: '600',
    color: theme.accent, letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  opponentSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 24px 28px',
    position: 'relative',
    zIndex: 1,
    gap: '8px',
  },
  vsLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' },
  opponentAvatar: {
    width: '80px', height: '80px',
    borderRadius: '50%', overflow: 'hidden',
    backgroundColor: 'rgba(200,255,0,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `3px solid ${theme.accent}`,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial: { color: theme.accent, fontWeight: '700', fontSize: '28px' },
  opponentName: { fontSize: '22px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px' },
  opponentUtr: { fontSize: '13px', color: theme.accent, fontWeight: '600' },
  detailsCard: {
    margin: '0 24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '4px 0',
  },
  detailIcon: { fontSize: '18px', flexShrink: 0, marginTop: '2px' },
  detailLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' },
  detailValue: { fontSize: '15px', color: '#fff', fontWeight: '500' },
  detailSub: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '12px 0' },
  suggestionBadge: {
    fontSize: '12px', fontWeight: '600',
    color: theme.accent,
    backgroundColor: 'rgba(200,255,0,0.1)',
    padding: '4px 10px', borderRadius: '6px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 24px 0',
    position: 'relative',
    zIndex: 1,
  },
  statusBadge: {
    fontSize: '12px', fontWeight: '600',
    padding: '6px 14px', borderRadius: '8px',
    letterSpacing: '0.3px',
  },
  actions: {
    padding: '20px 24px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    zIndex: 1,
  },
  acceptBtn: {
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: theme.accent,
    color: theme.navy,
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
  suggestBtn: {
    padding: '16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(200,255,0,0.3)',
    backgroundColor: 'transparent',
    color: theme.accent,
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
  declineBtn: {
    padding: '16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(239,68,68,0.3)',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
  suggestForm: {
    padding: '0 24px 48px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  suggestTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '14px',
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    fontSize: '15px',
    fontFamily: theme.font,
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  inputFocused: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(200,255,0,0.05)',
  },
};
