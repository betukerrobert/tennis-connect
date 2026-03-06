import { sendMatchInviteNotification } from '../notificationService';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const theme = {
  navy: '#0a1628',
  accent: '#c8ff00',
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export default function ScheduleMatch() {
  const { userId } = useParams(); // receiver's user id
  const navigate = useNavigate();

  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [courtName, setCourtName] = useState('');
  const [courtAddress, setCourtAddress] = useState('');
  const [focused, setFocused] = useState(null);

  // Quick time slots
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00', '19:00', '20:00'];

  useEffect(() => {
    const fetchReceiver = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, utr_rating, location')
        .eq('id', userId)
        .single();
      if (data) setReceiver(data);
    };
    if (userId) fetchReceiver();
  }, [userId]);

  const canSend = date && time && courtName.trim();

  const handleSend = async () => {
    if (!canSend) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

const { data: insertedMatch, error } = await supabase.from('matches').insert({
  sender_id: user.id,
  receiver_id: userId,
  court_name: courtName.trim(),
  court_address: courtAddress.trim() || null,
  match_date: date,
  match_time: time,
  status: 'pending',
}).select().single();

if (error) throw error;

// Send push notification
await sendMatchInviteNotification(user.id, userId, {
  id: insertedMatch.id,
  match_date: date,
  match_time: time
});

setSent(true);
    } catch (err) {
      console.error('Schedule error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  if (sent) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.bgPattern} />
        <div style={styles.sentContainer}>
          <div style={styles.sentIcon}>🎾</div>
          <h2 style={styles.sentTitle}>Invite Sent!</h2>
          <p style={styles.sentSub}>
            {receiver?.full_name || 'Your opponent'} will be notified of your match request.
          </p>
          <div style={styles.sentCard}>
            <div style={styles.sentRow}>
              <span style={styles.sentLabel}>📅 Date</span>
              <span style={styles.sentValue}>{new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div style={styles.sentRow}>
              <span style={styles.sentLabel}>⏰ Time</span>
              <span style={styles.sentValue}>{time}</span>
            </div>
            <div style={styles.sentRow}>
              <span style={styles.sentLabel}>📍 Court</span>
              <span style={styles.sentValue}>{courtName}</span>
            </div>
          </div>
          <button style={styles.doneBtn} onClick={() => navigate(-1)}>Back to Profile</button>
          <button style={styles.matchesBtn} onClick={() => navigate('/matches')}>View My Matches</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgPattern} />

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div style={styles.headerContent}>
          <div style={styles.headerTitle}>Schedule a Match</div>
          {receiver && (
            <div style={styles.opponentRow}>
              <div style={styles.opponentAvatar}>
                {receiver.avatar_url
                  ? <img src={receiver.avatar_url} alt="" style={styles.avatarImg} />
                  : <span style={styles.avatarInitial}>{receiver.full_name?.[0]}</span>
                }
              </div>
              <div>
                <div style={styles.opponentName}>vs {receiver.full_name}</div>
                {receiver.utr_rating && (
                  <div style={styles.opponentUtr}>UTR {receiver.utr_rating}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={styles.form}>

        {/* Date */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>📅 Date</div>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onFocus={() => setFocused('date')}
            onBlur={() => setFocused(null)}
            style={{
              ...styles.input,
              ...(focused === 'date' ? styles.inputFocused : {}),
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Time */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>⏰ Time</div>
          <div style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                style={styles.timeSlot(time === slot)}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            onFocus={() => setFocused('time')}
            onBlur={() => setFocused(null)}
            style={{
              ...styles.input,
              marginTop: '10px',
              ...(focused === 'time' ? styles.inputFocused : {}),
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Court */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>📍 Court</div>
          <input
            placeholder="Court name (e.g. Central Park Tennis)"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            onFocus={() => setFocused('court')}
            onBlur={() => setFocused(null)}
            style={{
              ...styles.input,
              ...(focused === 'court' ? styles.inputFocused : {}),
              marginBottom: '10px',
            }}
          />
          <input
            placeholder="Address (optional)"
            value={courtAddress}
            onChange={(e) => setCourtAddress(e.target.value)}
            onFocus={() => setFocused('address')}
            onBlur={() => setFocused(null)}
            style={{
              ...styles.input,
              ...(focused === 'address' ? styles.inputFocused : {}),
            }}
          />
          <div style={styles.courtHint}>🏟️ Court finder integration coming soon</div>
        </div>

      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.sendBtn(!canSend || loading)}
          onClick={handleSend}
          disabled={!canSend || loading}
        >
          {loading ? 'Sending…' : `Send Match Invite to ${receiver?.full_name || 'Player'} 🎾`}
        </button>
      </div>
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
    backgroundImage: `radial-gradient(circle at 15% 85%, rgba(200,255,0,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 85% 15%, rgba(200,255,0,0.04) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  header: {
    padding: '48px 24px 24px',
    position: 'relative',
    zIndex: 1,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    fontFamily: theme.font,
    cursor: 'pointer',
    padding: '0',
    marginBottom: '16px',
    display: 'block',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  opponentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  opponentAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgba(200,255,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(200,255,0,0.3)',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial: { color: theme.accent, fontWeight: '700', fontSize: '16px' },
  opponentName: { color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' },
  opponentUtr: { color: theme.accent, fontSize: '12px', fontWeight: '600' },
  form: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    position: 'relative',
    zIndex: 1,
    overflowY: 'auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: theme.accent,
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    fontSize: '15px',
    fontFamily: theme.font,
    fontWeight: '400',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  inputFocused: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(200,255,0,0.05)',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  timeSlot: (selected) => ({
    padding: '10px 4px',
    borderRadius: '10px',
    border: `1.5px solid ${selected ? theme.accent : 'rgba(255,255,255,0.1)'}`,
    backgroundColor: selected ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.04)',
    color: selected ? theme.accent : 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    fontWeight: selected ? '700' : '400',
    fontFamily: theme.font,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s',
  }),
  courtHint: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.25)',
    marginTop: '4px',
  },
  footer: {
    padding: '16px 24px 48px',
    position: 'relative',
    zIndex: 1,
  },
  sendBtn: (disabled) => ({
    width: '100%',
    padding: '18px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: disabled ? 'rgba(200,255,0,0.25)' : theme.accent,
    color: disabled ? 'rgba(10,22,40,0.4)' : theme.navy,
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.2px',
  }),
  // Sent confirmation screen
  sentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    zIndex: 1,
    gap: '16px',
  },
  sentIcon: { fontSize: '64px' },
  sentTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sentSub: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.5',
  },
  sentCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '8px',
  },
  sentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  sentValue: { fontSize: '14px', color: '#fff', fontWeight: '600' },
  doneBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: theme.accent,
    color: theme.navy,
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: 'pointer',
    marginTop: '8px',
  },
  matchesBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    fontWeight: '500',
    fontFamily: theme.font,
    cursor: 'pointer',
  },
};
