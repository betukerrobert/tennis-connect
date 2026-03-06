import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import StarRating from '../components/StarRating';

const theme = {
  navy: '#0a1628',
  accent: '#c8ff00',
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export default function RatePlayer() {
  const { matchId, opponentId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [match, setMatch] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch opponent profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', opponentId)
        .single();

      if (profileData) setOpponent(profileData);

      // Fetch match details
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchData) setMatch(matchData);

      setLoading(false);
    };

    fetchData();
  }, [matchId, opponentId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          match_id: matchId,
          rater_id: user.id,
          rated_user_id: opponentId,
          rating: rating,
          review: review.trim() || null,
        });

      if (insertError) throw insertError;

      // Calculate new average rating for opponent
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_user_id', opponentId);

      if (allRatings) {
        const totalRatings = allRatings.length;
        const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (sumRatings / totalRatings).toFixed(2);

        // Update opponent's profile
        await supabase
          .from('profiles')
          .update({
            average_rating: avgRating,
            total_ratings: totalRatings,
          })
          .eq('id', opponentId);
      }

      setSuccess(true);
    } catch (err) {
      console.error('Rating error:', err);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingDot} />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Rating Submitted!</h2>
          <p style={styles.successText}>
            Thanks for rating {opponent?.full_name}. Your feedback helps build a better tennis community.
          </p>
          <button style={styles.doneBtn} onClick={() => navigate('/matches')}>
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.title}>Rate Player</h1>
      </div>

      {/* Opponent Info */}
      <div style={styles.opponentCard}>
        <div style={styles.opponentAvatar}>
          {opponent?.avatar_url ? (
            <img src={opponent.avatar_url} alt="" style={styles.avatarImg} />
          ) : (
            <span style={styles.avatarInitial}>{opponent?.full_name?.[0]}</span>
          )}
        </div>
        <div style={styles.opponentInfo}>
          <div style={styles.opponentName}>{opponent?.full_name}</div>
          {opponent?.utr_rating && (
            <div style={styles.opponentUtr}>UTR {opponent.utr_rating}</div>
          )}
        </div>
      </div>

      {/* Match Details */}
      {match && (
        <div style={styles.matchCard}>
          <div style={styles.matchRow}>
            <span>📅 Date</span>
            <span>{new Date(match.match_date + 'T00:00:00').toLocaleDateString('en-GB')}</span>
          </div>
          <div style={styles.matchRow}>
            <span>⏰ Time</span>
            <span>{match.match_time?.slice(0, 5)}</span>
          </div>
          <div style={styles.matchRow}>
            <span>📍 Court</span>
            <span>{match.court_name}</span>
          </div>
        </div>
      )}

      {/* Rating Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>How was your match?</h3>
        <div style={styles.ratingContainer}>
          <StarRating rating={rating} onRatingChange={setRating} size={48} />
          {rating > 0 && (
            <div style={styles.ratingLabel}>
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Great!'}
              {rating === 3 && '👌 Good'}
              {rating === 2 && '😐 Okay'}
              {rating === 1 && '👎 Not great'}
            </div>
          )}
        </div>
      </div>

      {/* Review Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Leave a review (optional)</h3>
        <textarea
          style={styles.textarea}
          placeholder="Share your experience playing with this person..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <div style={styles.charCount}>{review.length}/500</div>
      </div>

      {/* Submit Button */}
      <div style={styles.footer}>
        <button
          style={styles.submitBtn(rating === 0 || submitting)}
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    fontFamily: theme.font,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  loadingDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `3px solid ${theme.accent}`,
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    padding: '24px 20px 16px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(10,22,40,0.5)',
    fontSize: '14px',
    fontFamily: theme.font,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '12px',
    display: 'block',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: theme.navy,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  opponentCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    margin: '0 20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
  },
  opponentAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgba(10,22,40,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(200,255,0,0.3)',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarInitial: {
    color: theme.navy,
    fontWeight: '700',
    fontSize: '24px',
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.navy,
    marginBottom: '4px',
  },
  opponentUtr: {
    fontSize: '13px',
    fontWeight: '600',
    color: theme.accent,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '16px',
    margin: '0 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 1px 4px rgba(10,22,40,0.05)',
  },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'rgba(10,22,40,0.6)',
  },
  section: {
    padding: '0 20px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: theme.navy,
    marginBottom: '12px',
  },
  ratingContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
  },
  ratingLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.navy,
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1.5px solid #e0e4ea',
    fontSize: '14px',
    color: theme.navy,
    fontFamily: theme.font,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  charCount: {
    fontSize: '11px',
    color: 'rgba(10,22,40,0.4)',
    textAlign: 'right',
    marginTop: '6px',
  },
  footer: {
    padding: '0 20px 32px',
  },
  submitBtn: (disabled) => ({
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: disabled ? 'rgba(200,255,0,0.3)' : theme.accent,
    color: disabled ? 'rgba(10,22,40,0.4)' : theme.navy,
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  }),
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 20px',
    gap: '20px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: theme.accent,
    color: theme.navy,
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: theme.navy,
    margin: 0,
  },
  successText: {
    fontSize: '15px',
    color: 'rgba(10,22,40,0.6)',
    textAlign: 'center',
    lineHeight: '1.6',
    maxWidth: '300px',
  },
  doneBtn: {
    backgroundColor: theme.accent,
    color: theme.navy,
    border: 'none',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: 'pointer',
    marginTop: '8px',
  },
};
