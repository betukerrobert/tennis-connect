import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const PLAYER_STEPS = 7;
const COACH_STEPS = 7;

const theme = {
  bg: '#f4f6f8',
  navy: '#0a1628',
  accent: '#c8ff00',
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: theme.navy,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.font,
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(200,255,0,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(200,255,0,0.04) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  progressBar: {
    padding: '48px 32px 0',
    position: 'relative',
    zIndex: 1,
  },
  progressTrack: {
    display: 'flex',
    gap: '6px',
  },
  progressDot: (active, done) => ({
    flex: 1,
    height: '3px',
    borderRadius: '2px',
    backgroundColor: done || active ? theme.accent : 'rgba(255,255,255,0.15)',
    transition: 'background-color 0.3s ease',
  }),
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px 32px 32px',
    position: 'relative',
    zIndex: 1,
  },
  stepLabel: {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: theme.accent,
    marginBottom: '12px',
    fontWeight: '600',
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.15',
    marginBottom: '8px',
  },
  subheading: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '40px',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '18px 20px',
    fontSize: '17px',
    fontFamily: theme.font,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  inputFocused: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(200,255,0,0.05)',
  },
  pillRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  pill: (selected) => ({
    flex: '1 1 auto',
    padding: '16px 20px',
    borderRadius: '14px',
    border: `1.5px solid ${selected ? theme.accent : 'rgba(255,255,255,0.12)'}`,
    backgroundColor: selected ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
    color: selected ? theme.accent : 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    fontWeight: selected ? '600' : '400',
    fontFamily: theme.font,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  }),
  surfaceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  surfaceCard: (selected) => ({
    padding: '24px 16px',
    borderRadius: '16px',
    border: `1.5px solid ${selected ? theme.accent : 'rgba(255,255,255,0.12)'}`,
    backgroundColor: selected ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
    color: selected ? theme.accent : 'rgba(255,255,255,0.6)',
    fontFamily: theme.font,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  }),
  surfaceEmoji: {
    fontSize: '32px',
  },
  surfaceLabel: (selected) => ({
    fontSize: '15px',
    fontWeight: selected ? '600' : '400',
  }),
  ageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  ageBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: '#fff',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  ageDisplay: {
    flex: 1,
    textAlign: 'center',
    fontSize: '48px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-1px',
  },
  sliderContainer: {
    paddingTop: '8px',
  },
  slider: {
    width: '100%',
    height: '6px',
    appearance: 'none',
    WebkitAppearance: 'none',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
  },
  utrValue: {
    fontSize: '64px',
    fontWeight: '700',
    color: theme.accent,
    letterSpacing: '-2px',
    lineHeight: '1',
    marginBottom: '4px',
  },
  utrLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '28px',
  },
  utrDescriptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginTop: '24px',
  },
  utrTier: (active) => ({
    padding: '10px 8px',
    borderRadius: '10px',
    backgroundColor: active ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(200,255,0,0.3)' : 'transparent'}`,
    textAlign: 'center',
  }),
  utrTierLabel: (active) => ({
    fontSize: '11px',
    fontWeight: '600',
    color: active ? theme.accent : 'rgba(255,255,255,0.3)',
    letterSpacing: '0.5px',
  }),
  utrTierRange: (active) => ({
    fontSize: '10px',
    color: active ? 'rgba(200,255,0,0.7)' : 'rgba(255,255,255,0.2)',
    marginTop: '2px',
  }),
  photoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  avatarCircle: (hasPhoto) => ({
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: `2px dashed ${hasPhoto ? theme.accent : 'rgba(255,255,255,0.2)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  }),
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  locationBtn: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 20px',
    borderRadius: '14px',
    border: `1.5px solid ${active ? theme.accent : 'rgba(255,255,255,0.12)'}`,
    backgroundColor: active ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.05)',
    color: active ? theme.accent : 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    fontWeight: active ? '600' : '400',
    fontFamily: theme.font,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.2s',
    marginBottom: '12px',
  }),
  locationText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  footer: {
    padding: '0 32px 48px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryBtn: (disabled) => ({
    width: '100%',
    padding: '18px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: disabled ? 'rgba(200,255,0,0.3)' : theme.accent,
    color: disabled ? 'rgba(10,22,40,0.4)' : theme.navy,
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: theme.font,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.3px',
  }),
  skipBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    fontFamily: theme.font,
    cursor: 'pointer',
    padding: '8px',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    padding: '18px 20px',
    fontSize: '15px',
    fontFamily: theme.font,
    fontWeight: '400',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
    lineHeight: '1.6',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
};

const utrTiers = [
  { label: 'Beginner', range: '1–4' },
  { label: 'Intermediate', range: '5–8' },
  { label: 'Advanced', range: '9–12' },
  { label: 'Pro', range: '13–16' },
];

const surfaces = [
  { value: 'Hard', emoji: '🔵', label: 'Hard' },
  { value: 'Clay', emoji: '🟠', label: 'Clay' },
  { value: 'Grass', emoji: '🟢', label: 'Grass' },
  { value: 'Indoor', emoji: '🏢', label: 'Indoor' },
];

const specialisations = [
  { value: 'Beginner', emoji: '🌱', label: 'Beginner' },
  { value: 'Intermediate', emoji: '🎯', label: 'Intermediate' },
  { value: 'Advanced', emoji: '🏆', label: 'Advanced' },
  { value: 'Kids', emoji: '👦', label: 'Kids' },
];

function getUtrTier(val) {
  if (val <= 4) return 0;
  if (val <= 8) return 1;
  if (val <= 12) return 2;
  return 3;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [role, setRole] = useState(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Shared fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Player-only fields
  const [dominantHand, setDominantHand] = useState('');
  const [preferredSurface, setPreferredSurface] = useState('');
  const [utr, setUtr] = useState(5);

  // Coach-only fields
  const [coachSpecialisation, setCoachSpecialisation] = useState('');
  const [coachingRate, setCoachingRate] = useState('');
  const [coachingExperience, setCoachingExperience] = useState('');
  const [bio, setBio] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (data) setRole(data.role);
    };
    fetchRole();
  }, []);

  const totalSteps = role === 'coach' ? COACH_STEPS : PLAYER_STEPS;

  const canProceed = () => {
    if (role === 'coach') {
      switch (step) {
        case 1: return name.trim().length >= 2;
        case 2: return age >= 10 && age <= 80 && gender !== '';
        case 3: return true;
        case 4: return coachSpecialisation !== '';
        case 5: return true;
        case 6: return true;
        case 7: return true;
        default: return false;
      }
    } else {
      switch (step) {
        case 1: return name.trim().length >= 2;
        case 2: return age >= 10 && age <= 80 && gender !== '';
        case 3: return true;
        case 4: return dominantHand !== '';
        case 5: return true;
        case 6: return true;
        case 7: return true;
        default: return false;
      }
    }
  };

  const handleGPS = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Your location';
          const country = data.address?.country_code?.toUpperCase() || '';
          setLocationLabel(`${city}${country ? ', ' + country : ''}`);
        } catch {
          setLocationLabel('Location saved');
        }
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setLocationLabel('');
      }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatar_url = null;
      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('Avatars')
          .upload(path, photoFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from('Avatars')
            .getPublicUrl(path);
          avatar_url = urlData.publicUrl;
        }
      }

      if (role === 'coach') {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: name.trim() || null,
            age,
            gender: gender || null,
            latitude,
            longitude,
            location: locationLabel || null,
            coaching_specialisation: coachSpecialisation || null,
            coaching_rate: coachingRate ? parseFloat(coachingRate) : null,
            coaching_experience: coachingExperience ? parseInt(coachingExperience) : null,
            also_coaches: true,
            bio: bio || null,
            ...(avatar_url && { avatar_url }),
            onboarding_complete: true,
          })
          .eq('id', user.id);
        if (error) console.error('Coach onboarding save error:', error);
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: name.trim() || null,
            age,
            gender: gender || null,
            latitude,
            longitude,
            location: locationLabel || null,
            dominant_hand: dominantHand || null,
            preferred_surface: preferredSurface || null,
            utr_rating: utr,
            ...(avatar_url && { avatar_url }),
            onboarding_complete: true,
          })
          .eq('id', user.id);
        if (error) console.error('Player onboarding save error:', error);
      }

      navigate('/discovery');
    } catch (err) {
      console.error('Onboarding error:', err);
      navigate('/discovery');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else handleFinish();
  };

  const handleSkip = () => {
    if (step < totalSteps) setStep(s => s + 1);
    else handleFinish();
  };

  // ── Player steps ────────────────────────────────────────────────────
  const renderPlayerStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div style={styles.stepLabel}>Step 1 of {totalSteps}</div>
            <div style={styles.heading}>What's your name?</div>
            <div style={styles.subheading}>This is how other players will find you.</div>
            <input
              style={{ ...styles.input, ...(focusedInput === 'name' ? styles.inputFocused : {}) }}
              placeholder="First name"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              autoFocus
            />
          </>
        );
      case 2:
        return (
          <>
            <div style={styles.stepLabel}>Step 2 of {totalSteps}</div>
            <div style={styles.heading}>Age & gender</div>
            <div style={styles.subheading}>Helps us find the right match for you.</div>
            <div style={styles.ageRow}>
              <button style={styles.ageBtn} onClick={() => setAge(a => Math.max(10, a - 1))}>−</button>
              <div style={styles.ageDisplay}>{age}</div>
              <button style={styles.ageBtn} onClick={() => setAge(a => Math.min(80, a + 1))}>+</button>
            </div>
            <div style={{ height: '28px' }} />
            <div style={styles.pillRow}>
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} style={styles.pill(gender === g)} onClick={() => setGender(g)}>{g}</button>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div style={styles.stepLabel}>Step 3 of {totalSteps}</div>
            <div style={styles.heading}>Where are you based?</div>
            <div style={styles.subheading}>We'll show you players nearby.</div>
            <button style={styles.locationBtn(!!locationLabel)} onClick={handleGPS} disabled={locLoading}>
              <span style={{ fontSize: '20px' }}>{locLoading ? '⏳' : locationLabel ? '📍' : '🎯'}</span>
              <span>{locLoading ? 'Getting location…' : locationLabel ? locationLabel : 'Use my current location'}</span>
            </button>
            <div style={styles.locationText}>
              Your location is only shared as approximate distance — never your exact address.
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div style={styles.stepLabel}>Step 4 of {totalSteps}</div>
            <div style={styles.heading}>Dominant hand?</div>
            <div style={styles.subheading}>Left or right — it matters on the court.</div>
            <div style={styles.pillRow}>
              {['Left', 'Right'].map(h => (
                <button
                  key={h}
                  style={{ ...styles.pill(dominantHand === h), fontSize: '17px', padding: '22px' }}
                  onClick={() => setDominantHand(h)}
                >
                  {h === 'Left' ? '🫲 Left' : '🫱 Right'}
                </button>
              ))}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div style={styles.stepLabel}>Step 5 of {totalSteps}</div>
            <div style={styles.heading}>Preferred surface?</div>
            <div style={styles.subheading}>Where do you love to play most?</div>
            <div style={styles.surfaceGrid}>
              {surfaces.map(s => (
                <div
                  key={s.value}
                  style={styles.surfaceCard(preferredSurface === s.value)}
                  onClick={() => setPreferredSurface(preferredSurface === s.value ? '' : s.value)}
                >
                  <span style={styles.surfaceEmoji}>{s.emoji}</span>
                  <span style={styles.surfaceLabel(preferredSurface === s.value)}>{s.label}</span>
                </div>
              ))}
            </div>
          </>
        );
      case 6: {
        const tierIndex = getUtrTier(utr);
        return (
          <>
            <div style={styles.stepLabel}>Step 6 of {totalSteps}</div>
            <div style={styles.heading}>Your UTR rating</div>
            <div style={styles.subheading}>Universal Tennis Rating — drag to set your level.</div>
            <div style={styles.utrValue}>{utr}</div>
            <div style={styles.utrLabel}>UTR</div>
            <div style={styles.sliderContainer}>
              <style>{`
                input[type=range].utr-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 26px; height: 26px;
                  border-radius: 50%;
                  background: ${theme.accent};
                  cursor: pointer;
                  box-shadow: 0 0 0 4px rgba(200,255,0,0.2);
                }
                input[type=range].utr-slider::-webkit-slider-runnable-track {
                  height: 6px; border-radius: 3px;
                  background: linear-gradient(to right, ${theme.accent} ${((utr - 1) / 15) * 100}%, rgba(255,255,255,0.15) ${((utr - 1) / 15) * 100}%);
                }
              `}</style>
              <input
                type="range" className="utr-slider"
                min={1} max={16} value={utr}
                onChange={e => setUtr(Number(e.target.value))}
                style={{ ...styles.slider, background: 'transparent' }}
              />
            </div>
            <div style={styles.utrDescriptions}>
              {utrTiers.map((tier, i) => (
                <div key={tier.label} style={styles.utrTier(i === tierIndex)}>
                  <div style={styles.utrTierLabel(i === tierIndex)}>{tier.label}</div>
                  <div style={styles.utrTierRange(i === tierIndex)}>{tier.range}</div>
                </div>
              ))}
            </div>
          </>
        );
      }
      case 7:
        return (
          <>
            <div style={styles.stepLabel}>Step 7 of {totalSteps}</div>
            <div style={styles.heading}>Add a photo</div>
            <div style={styles.subheading}>Players with photos get 3× more connection requests.</div>
            <div style={styles.photoArea}>
              <div style={styles.avatarCircle(!!photoPreview)} onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="avatar" style={styles.avatarImg} />
                ) : (
                  <div style={styles.photoPlaceholder}>
                    <span style={{ fontSize: '32px' }}>📷</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Tap to upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              {photoPreview && (
                <button
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', padding: '10px 20px', fontSize: '13px', fontFamily: theme.font, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change photo
                </button>
              )}
            </div>
          </>
        );
      default: return null;
    }
  };

  // ── Coach steps ─────────────────────────────────────────────────────
  const renderCoachStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div style={styles.stepLabel}>Step 1 of {totalSteps}</div>
            <div style={styles.heading}>What's your name?</div>
            <div style={styles.subheading}>This is how players will find you.</div>
            <input
              style={{ ...styles.input, ...(focusedInput === 'name' ? styles.inputFocused : {}) }}
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              autoFocus
            />
          </>
        );
      case 2:
        return (
          <>
            <div style={styles.stepLabel}>Step 2 of {totalSteps}</div>
            <div style={styles.heading}>Age & gender</div>
            <div style={styles.subheading}>Helps players know who they're working with.</div>
            <div style={styles.ageRow}>
              <button style={styles.ageBtn} onClick={() => setAge(a => Math.max(18, a - 1))}>−</button>
              <div style={styles.ageDisplay}>{age}</div>
              <button style={styles.ageBtn} onClick={() => setAge(a => Math.min(80, a + 1))}>+</button>
            </div>
            <div style={{ height: '28px' }} />
            <div style={styles.pillRow}>
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} style={styles.pill(gender === g)} onClick={() => setGender(g)}>{g}</button>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div style={styles.stepLabel}>Step 3 of {totalSteps}</div>
            <div style={styles.heading}>Where are you based?</div>
            <div style={styles.subheading}>Players nearby will be able to find you.</div>
            <button style={styles.locationBtn(!!locationLabel)} onClick={handleGPS} disabled={locLoading}>
              <span style={{ fontSize: '20px' }}>{locLoading ? '⏳' : locationLabel ? '📍' : '🎯'}</span>
              <span>{locLoading ? 'Getting location…' : locationLabel ? locationLabel : 'Use my current location'}</span>
            </button>
            <div style={styles.locationText}>
              Your location is only shared as approximate distance — never your exact address.
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div style={styles.stepLabel}>Step 4 of {totalSteps}</div>
            <div style={styles.heading}>Who do you coach?</div>
            <div style={styles.subheading}>Select the level you specialise in.</div>
            <div style={styles.surfaceGrid}>
              {specialisations.map(s => (
                <div
                  key={s.value}
                  style={styles.surfaceCard(coachSpecialisation === s.value)}
                  onClick={() => setCoachSpecialisation(s.value)}
                >
                  <span style={styles.surfaceEmoji}>{s.emoji}</span>
                  <span style={styles.surfaceLabel(coachSpecialisation === s.value)}>{s.label}</span>
                </div>
              ))}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div style={styles.stepLabel}>Step 5 of {totalSteps}</div>
            <div style={styles.heading}>Rate & experience</div>
            <div style={styles.subheading}>Let players know what to expect.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Hourly Rate (€)</div>
                <input
                  style={{ ...styles.input, ...(focusedInput === 'rate' ? styles.inputFocused : {}) }}
                  type="number"
                  placeholder="e.g. 40"
                  value={coachingRate}
                  onChange={e => setCoachingRate(e.target.value)}
                  onFocus={() => setFocusedInput('rate')}
                  onBlur={() => setFocusedInput(null)}
                  min="0"
                />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Years of Experience</div>
                <input
                  style={{ ...styles.input, ...(focusedInput === 'exp' ? styles.inputFocused : {}) }}
                  type="number"
                  placeholder="e.g. 5"
                  value={coachingExperience}
                  onChange={e => setCoachingExperience(e.target.value)}
                  onFocus={() => setFocusedInput('exp')}
                  onBlur={() => setFocusedInput(null)}
                  min="0"
                />
              </div>
            </div>
          </>
        );
      case 6:
        return (
          <>
            <div style={styles.stepLabel}>Step 6 of {totalSteps}</div>
            <div style={styles.heading}>Tell us about yourself</div>
            <div style={styles.subheading}>A great bio helps players decide to book you.</div>
            <textarea
              style={{ ...styles.textarea, ...(focusedInput === 'bio' ? styles.inputFocused : {}), minHeight: '140px' }}
              placeholder="e.g. Former competitive player with 8 years of coaching experience. I focus on technique, footwork and match strategy..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              onFocus={() => setFocusedInput('bio')}
              onBlur={() => setFocusedInput(null)}
              rows={5}
            />
          </>
        );
      case 7:
        return (
          <>
            <div style={styles.stepLabel}>Step 7 of {totalSteps}</div>
            <div style={styles.heading}>Add a photo</div>
            <div style={styles.subheading}>Coaches with photos get booked 3× more often.</div>
            <div style={styles.photoArea}>
              <div style={styles.avatarCircle(!!photoPreview)} onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="avatar" style={styles.avatarImg} />
                ) : (
                  <div style={styles.photoPlaceholder}>
                    <span style={{ fontSize: '32px' }}>📷</span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Tap to upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              {photoPreview && (
                <button
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', padding: '10px 20px', fontSize: '13px', fontFamily: theme.font, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change photo
                </button>
              )}
            </div>
          </>
        );
      default: return null;
    }
  };

  // Show loading state while role is being fetched
  if (role === null) {
    return (
      <div style={{ ...styles.wrapper, alignItems: 'center', justifyContent: 'center' }}>
        <div style={styles.bgPattern} />
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.15)', borderTop: `3px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const isLastStep = step === totalSteps;
  const btnLabel = saving ? 'Saving…' : isLastStep ? (role === 'coach' ? 'Start Coaching 📋' : 'Start Playing 🎾') : 'Continue';

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgPattern} />
      <div style={styles.progressBar}>
        <div style={styles.progressTrack}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={styles.progressDot(i + 1 === step, i + 1 < step)} />
          ))}
        </div>
      </div>
      <div style={styles.content}>
        {role === 'coach' ? renderCoachStep() : renderPlayerStep()}
      </div>
      <div style={styles.footer}>
        <button
          style={styles.primaryBtn(!canProceed() || saving)}
          onClick={handleNext}
          disabled={saving}
        >
          {btnLabel}
        </button>
        <button style={styles.skipBtn} onClick={handleSkip}>
          {isLastStep ? 'Skip for now' : 'Skip this step'}
        </button>
      </div>
    </div>
  );
}