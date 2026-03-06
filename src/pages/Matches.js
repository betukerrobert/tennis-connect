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

export default function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming'); // upcoming | past
  const [currentUser, setCurrentUser] = useState(null);
  const [ratings, setRatings] = useState([]);

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

      // Fetch ratings given by current user
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

  if (loading) {
    return (
      <div style={{ ...styles.wrapper, justifyContent: 'center', alignItems: 'center' }}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

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
            
            // Show Rate button on past accepted matches that haven't been rated yet
            const isPastMatch = match.match_date < today;
            const isAccepted = match.status === 'accepted';
            const hasRated = ratings.includes(match.id);
            const showRateButton = tab === 'past' && isPastMatch && isAccepted && !hasRated;

            return (
              <div
                key={match.id}
                style={styles.card}
                onClick={() => navigate(`/match-invite/${match.id}`)}
              >
                <div style={styles.cardLeft}>
                  <div style={styles.cardAvatar}>
                    {opponent?.avatar_url
                      ? <img src={opponent.avatar_url} alt="" style={styles.avatarImg} />
                      : <span style={styles.avatarInitial}>{opponent?.full_name?.[0]}</span>
                    }
                  </div>
                </div>

                <div style={styles.cardMiddle}>
                  <div style={styles.cardName}>{opponent?.full_name}</div>
                  <div style={styles.cardDetails}>
                    <span>📅 {formatDate(match.match_date)}</span>
                    <span style={{ margin: '0 6px', opacity: 0.3 }}>·</span>
                    <span>⏰ {match.match_time?.slice(0, 5)}</span>
                  </div>
                  <div style={styles.cardCourt}>📍 {match.court_name}</div>
                  
                  {/* Rate Player Button */}
                  {showRateButton && (
                    <button
                      style={styles.rateBtn}
                      onClick={(e) => handleRateClick(e, match.id, opponent.id)}
                    >
                      ⭐ Rate Player
                    </button>
                  )}
                  
                  {/* Already Rated */}
                  {tab === 'past' && isPastMatch && isAccepted && hasRated && (
                    <div style={styles.ratedLabel}>✓ Rated</div>
                  )}
                </div>

                <div style={styles.cardRight}>
                  <div style={{ ...styles.statusBadge, color: status.color, backgroundColor: status.bg }}>
                    {status.label}
                  </div>
                  {(isPendingForMe || isRescheduledForMe) && (
                    <div style={styles.actionDot} />
                  )}
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
    marginBottom: '16px',
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
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s',
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
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial: { color: theme.navy, fontWeight: '700', fontSize: '16px' },
  cardMiddle: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  cardName: { fontSize: '15px', fontWeight: '600', color: theme.navy },
  cardDetails: { fontSize: '12px', color: 'rgba(10,22,40,0.5)', display: 'flex', alignItems: 'center' },
  cardCourt: { fontSize: '12px', color: 'rgba(10,22,40,0.4)' },
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
