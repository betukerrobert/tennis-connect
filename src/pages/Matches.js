import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const theme = {
  navy: '#0a1628',
  accent: '#c8ff00',
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const statusConfig = {
  pending:     { label: 'Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  accepted:    { label: 'Confirmed ✓', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  declined:    { label: 'Declined',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  rescheduled: { label: 'New Time ⟳',  color: '#c8ff00', bg: 'rgba(200,255,0,0.1)' },
};

const resultConfig = {
  win:  { label: 'Won',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  loss: { label: 'Lost', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  draw: { label: 'Draw', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

export default function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [recordingResult, setRecordingResult] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          sender:profiles!matches_sender_id_fkey(id, full_name, avatar_url, utr_rating),
          receiver:profiles!matches_receiver_id_fkey(id, full_name, avatar_url, utr_rating)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('match_date', { ascending: true });

      if (!error && data) setMatches(data);

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('match_id')
        .eq('rater_id', user.id);

      if (ratingsData) setRatings(ratingsData.map(r => r.match_id));
      setLoading(false);
    };
    fetchMatches();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = matches.filter(m => m.match_date >= today && m.status !== 'declined');
  const past = matches.filter(m => m.match_date < today || m.status === 'declined');
  const displayed = tab === 'upcoming' ? upcoming : past;

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  };

  const handleRateClick = (e, matchId, opponentId) => {
    e.stopPropagation();
    navigate(`/rate-player/${matchId}/${opponentId}`);
  };

  const handleOpponentClick = (e, opponentId) => {
    e.stopPropagation();
    navigate(`/profile/${opponentId}`);
  };

  const handleRecordResult = async (e, matchId, result) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('matches')
      .update({ result })
      .eq('id', matchId);
    if (!error) {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, result } : m));
    }
    setRecordingResult(null);
  };

  // Stats for past tab
  const pastStats = () => {
    const played = past.filter(m => m.status === 'accepted' && m.result);
    const wins = played.filter(m => m.result === 'win').length;
    const losses = played.filter(m => m.result === 'loss').length;
    const draws = played.filter(m => m.result === 'draw').length;
    const winPct = played.length > 0 ? Math.round((wins / played.length) * 100) : null;
    const courts = past.filter(m => m.court_name).map(m => m.court_name);
    const courtCounts = courts.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
    const favCourt = Object.keys(courtCounts).sort((a, b) => courtCounts[b] - courtCounts[a])[0] || null;
    return { played: played.length, wins, losses, draws, winPct, favCourt };
  };

  if (loading) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: 'center', alignItems: 'center' }}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const stats = pastStats();

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Matches</h1>
        <button style={styles.newBtn} onClick={() => navigate('/discovery')}>+ New</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['upcoming', 'past'].map(t => (
          <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {/* Stats bar — only on past tab */}
      {tab === 'past' && past.length > 0 && (
        <div style={styles.statsBar}>
          <div style={styles.statChip}>
            <span style={styles.statChipVal}>{past.length}</span>
            <span style={styles.statChipLabel}>Played</span>
          </div>
          <div style={styles.statChipDivider} />
          <div style={styles.statChip}>
            <span style={{ ...styles.statChipVal, color: '#10b981' }}>{stats.wins}</span>
            <span style={styles.statChipLabel}>Wins</span>
          </div>
          <div style={styles.statChipDivider} />
          <div style={styles.statChip}>
            <span style={{ ...styles.statChipVal, color: '#ef4444' }}>{stats.losses}</span>
            <span style={styles.statChipLabel}>Losses</span>
          </div>
          <div style={styles.statChipDivider} />
          <div style={styles.statChip}>
            <span style={styles.statChipVal}>{stats.winPct !== null ? `${stats.winPct}%` : '—'}</span>
            <span style={styles.statChipLabel}>Win Rate</span>
          </div>
        </div>
      )}

      {/* Favourite court — only if we have one */}
      {tab === 'past' && stats.favCourt && (
        <div style={styles.favCourt}>
          <span style={styles.favCourtIcon}>📍</span>
          <span style={styles.favCourtText}>Favourite court: <strong>{stats.favCourt}</strong></span>
        </div>
      )}

      {/* List */}
      <div style={styles.list}>
        {displayed.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🎾</div>
            <div style={styles.emptyText}>
              {tab === 'upcoming' ? 'No upcoming matches' : 'No past matches'}
            </div>
            <div style={styles.emptySub}>
              {tab === 'upcoming' ? 'Find a player and schedule a match!' : ''}
            </div>
          </div>
        ) : (
          displayed.map(match => {
            const isReceiver = match.receiver_id === currentUser?.id;
            const opponent = isReceiver ? match.sender : match.receiver;
            const status = statusConfig[match.status] || statusConfig.pending;
            const isPendingForMe = match.status === 'pending' && isReceiver;
            const isRescheduledForMe = match.status === 'rescheduled' && !isReceiver;
            const isPastMatch = match.match_date < today;
            const isAccepted = match.status === 'accepted';
            const hasRated = ratings.includes(match.id);
            const showRateButton = tab === 'past' && isPastMatch && isAccepted && !hasRated;
            const showResultRecorder = tab === 'past' && isPastMatch && isAccepted && !match.result;
            const isRecording = recordingResult === match.id;

            return (
              <div
                key={match.id}
                style={styles.card}
                onClick={() => navigate(`/match-invite/${match.id}`)}
              >
                <div style={styles.cardLeft}>
                  <div style={styles.cardAvatar} onClick={(e) => handleOpponentClick(e, opponent?.id)}>
                    {opponent?.avatar_url
                      ? <img src={opponent.avatar_url} alt="" style={styles.avatarImg} />
                      : <span style={styles.avatarInitial}>{opponent?.full_name?.[0]}</span>
                    }
                  </div>
                </div>

                <div style={styles.cardMiddle}>
                  <div style={{ ...styles.cardName, cursor: 'pointer' }} onClick={(e) => handleOpponentClick(e, opponent?.id)}>
                    {opponent?.full_name}
                  </div>
                  <div style={styles.cardDetails}>
                    <span>📅 {formatDate(match.match_date)}</span>
                    <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                    <span>⏰ {match.match_time?.slice(0, 5)}</span>
                  </div>
                  <div style={styles.cardCourt}>📍 {match.court_name}</div>

                  {/* Result badge */}
                  {match.result && resultConfig[match.result] && (
                    <div style={{ ...styles.resultBadge, color: resultConfig[match.result].color, backgroundColor: resultConfig[match.result].bg }}>
                      {resultConfig[match.result].label}
                    </div>
                  )}

                  {/* Record result */}
                  {showResultRecorder && !isRecording && (
                    <button style={styles.recordBtn} onClick={(e) => { e.stopPropagation(); setRecordingResult(match.id); }}>
                      + Record Result
                    </button>
                  )}

                  {isRecording && (
                    <div style={styles.resultPicker} onClick={e => e.stopPropagation()}>
                      <span style={styles.resultPickerLabel}>How did it go?</span>
                      <div style={styles.resultBtns}>
                        <button style={{ ...styles.resultBtn, backgroundColor: '#10b981' }} onClick={(e) => handleRecordResult(e, match.id, 'win')}>🏆 Won</button>
                        <button style={{ ...styles.resultBtn, backgroundColor: '#ef4444' }} onClick={(e) => handleRecordResult(e, match.id, 'loss')}>Lost</button>
                        <button style={{ ...styles.resultBtn, backgroundColor: '#f59e0b' }} onClick={(e) => handleRecordResult(e, match.id, 'draw')}>Draw</button>
                      </div>
                    </div>
                  )}

                  {/* Rate Player */}
                  {showRateButton && (
                    <button style={styles.rateBtn} onClick={(e) => handleRateClick(e, match.id, opponent.id)}>
                      ⭐ Rate Player
                    </button>
                  )}

                  {tab === 'past' && isPastMatch && isAccepted && hasRated && (
                    <div style={styles.ratedLabel}>✓ Rated</div>
                  )}
                </div>

                <div style={styles.cardRight}>
                  <div style={{ ...styles.statusBadge, color: status.color, backgroundColor: status.bg }}>
                    {status.label}
                  </div>
                  {(isPendingForMe || isRescheduledForMe) && <div style={styles.actionDot} />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    fontFamily: theme.font,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 20px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: theme.navy,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  newBtn: {
    backgroundColor: theme.accent,
    color: theme.navy,
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    padding: '0 20px',
    gap: '8px',
    marginBottom: '12px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: active ? theme.navy : 'rgba(10,22,40,0.06)',
    color: active ? '#fff' : 'rgba(10,22,40,0.4)',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    fontFamily: theme.font,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  statsBar: {
    backgroundColor: 'white',
    borderRadius: '14px',
    margin: '0 20px 10px 20px',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(10,22,40,0.06)',
  },
  statChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statChipVal: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.navy,
    letterSpacing: '-0.3px',
  },
  statChipLabel: {
    fontSize: '9px',
    color: '#9aa0ac',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '500',
  },
  statChipDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: '#e0e4ea',
  },
  favCourt: {
    margin: '0 20px 12px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 4px rgba(10,22,40,0.06)',
  },
  favCourtIcon: { fontSize: '14px' },
  favCourtText: {
    fontSize: '12px',
    color: '#5a6270',
    fontWeight: '400',
  },
  list: {
    flex: 1,
    padding: '0 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardLeft: { flexShrink: 0 },
  cardAvatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgba(10,22,40,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(10,22,40,0.06)',
    cursor: 'pointer',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial: { color: theme.navy, fontWeight: '700', fontSize: '16px' },
  cardMiddle: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  cardName: { fontSize: '15px', fontWeight: '600', color: theme.navy },
  cardDetails: { fontSize: '12px', color: 'rgba(10,22,40,0.5)', display: 'flex', alignItems: 'center' },
  cardCourt: { fontSize: '12px', color: 'rgba(10,22,40,0.4)' },
  resultBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '999px',
    alignSelf: 'flex-start',
    marginTop: '5px',
    letterSpacing: '0.3px',
  },
  recordBtn: {
    backgroundColor: 'transparent',
    color: theme.navy,
    border: '1.5px solid #e0e4ea',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: theme.font,
    cursor: 'pointer',
    marginTop: '6px',
  },
  resultPicker: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  resultPickerLabel: {
    fontSize: '11px',
    color: '#9aa0ac',
    fontWeight: '500',
  },
  resultBtns: {
    display: 'flex',
    gap: '6px',
  },
  resultBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'white',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
  rateBtn: {
    backgroundColor: theme.accent,
    color: theme.navy,
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: 'pointer',
    marginTop: '6px',
    alignSelf: 'flex-start',
  },
  ratedLabel: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '4px',
  },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    letterSpacing: '0.2px',
  },
  actionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.accent,
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '10px',
  },
  emptyIcon: { fontSize: '48px' },
  emptyText: { fontSize: '17px', fontWeight: '600', color: theme.navy },
  emptySub: { fontSize: '14px', color: 'rgba(10,22,40,0.4)', textAlign: 'center' },
  loadingDot: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    border: `3px solid ${theme.accent}`,
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
};