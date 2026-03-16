import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 12;
const PADDLE_H = 70;
const BALL_SIZE = 10;
const WINNING_SCORE = 18;
const PLAYER_SPEED = 6;

// Tiers — tuned so INSANE is hard but beatable with skill
// aiSpeed has a small error margin built in via jitter in the game loop
const TIERS = [
  { minGoals: 0,  label: 'EASY',   color: '#22c55e', ballSpeed: 3.2, aiSpeed: 1.8, aiError: 18 },
  { minGoals: 3,  label: 'MEDIUM', color: '#f59e0b', ballSpeed: 4.4, aiSpeed: 3.0, aiError: 12 },
  { minGoals: 7,  label: 'HARD',   color: '#ef4444', ballSpeed: 5.6, aiSpeed: 4.4, aiError: 7  },
  { minGoals: 12, label: 'INSANE', color: '#a855f7', ballSpeed: 7.0, aiSpeed: 5.8, aiError: 3  },
];

function getTier(totalGoals) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalGoals >= TIERS[i].minGoals) return TIERS[i];
  }
  return TIERS[0];
}

function Pong() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const gameStateRef = useRef(null);
  const animFrameRef = useRef(null);
  const keysRef = useRef({});
  const aiJitterRef = useRef(0); // AI reaction error offset

  const [screen, setScreen] = useState('menu');
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [currentTier, setCurrentTier] = useState(TIERS[0]);
  const [winner, setWinner] = useState(null);
  const [justLevelledUp, setJustLevelledUp] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [alreadyWonToday, setAlreadyWonToday] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ── Load user + check if already won today ───────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('pong_last_win_date')
        .eq('id', user.id)
        .single();
      if (profile?.pong_last_win_date) {
        const today = new Date().toISOString().split('T')[0];
        if (profile.pong_last_win_date === today) setAlreadyWonToday(true);
      }
    };
    loadUser();
  }, []);

  // ── Grant daily swipe reward ─────────────────────────────────────────
  const grantSwipeReward = useCallback(async () => {
    if (!currentUser || alreadyWonToday) return;
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase
      .from('profiles')
      .select('pong_bonus_swipes')
      .eq('id', currentUser.id)
      .single();
    const current = profile?.pong_bonus_swipes || 0;
    await supabase
      .from('profiles')
      .update({
        pong_bonus_swipes: current + 1,
        pong_last_win_date: today,
      })
      .eq('id', currentUser.id);
    setRewardGranted(true);
    setAlreadyWonToday(true);
  }, [currentUser, alreadyWonToday]);

  const initGameState = useCallback(() => {
    const tier = TIERS[0];
    return {
      player: { x: 20, y: CANVAS_H / 2 - PADDLE_H / 2, score: 0, totalGoals: 0 },
      ai:     { x: CANVAS_W - 20 - PADDLE_W, y: CANVAS_H / 2 - PADDLE_H / 2, score: 0 },
      ball: {
        x: CANVAS_W / 2,
        y: CANVAS_H / 2,
        vx: tier.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        vy: tier.ballSpeed * (Math.random() > 0.5 ? 0.7 : -0.7),
      },
      tier,
      running: true,
    };
  }, []);

  const resetBall = useCallback((state, scoredSide) => {
    state.ball.x = CANVAS_W / 2;
    state.ball.y = CANVAS_H / 2;
    state.ball.vx = state.tier.ballSpeed * (scoredSide === 'player' ? -1 : 1);
    state.ball.vy = state.tier.ballSpeed * (Math.random() > 0.5 ? 0.7 : -0.7);
    // Reset AI jitter on each point
    aiJitterRef.current = (Math.random() - 0.5) * state.tier.aiError;
  }, []);

  const draw = useCallback((ctx, state) => {
    const { player, ai, ball, tier } = state;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Dotted center line
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 52px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(player.score, CANVAS_W / 2 - 80, 65);
    ctx.fillText(ai.score, CANVAS_W / 2 + 80, 65);

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText('YOU', CANVAS_W / 2 - 80, 80);
    ctx.fillText('CPU', CANVAS_W / 2 + 80, 80);

    // Tier badge
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = tier.color;
    ctx.fillText(`● ${tier.label}`, CANVAS_W / 2, 97);

    // Player paddle (lime glow)
    ctx.shadowColor = '#c8ff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#c8ff00';
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // AI paddle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(ai.x, ai.y, PADDLE_W, PADDLE_H, 4);
    ctx.fill();

    // Ball glow
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    if (!state || !state.running) return;

    const { player, ai, ball } = state;

    // Player keyboard
    if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) {
      player.y = Math.max(0, player.y - PLAYER_SPEED);
    }
    if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) {
      player.y = Math.min(CANVAS_H - PADDLE_H, player.y + PLAYER_SPEED);
    }

    // AI movement — tracks ball with jitter error so it's beatable
    const aiCenter = ai.y + PADDLE_H / 2;
    const targetY = ball.y + aiJitterRef.current;
    if (aiCenter < targetY - 4) ai.y = Math.min(CANVAS_H - PADDLE_H, ai.y + state.tier.aiSpeed);
    else if (aiCenter > targetY + 4) ai.y = Math.max(0, ai.y - state.tier.aiSpeed);

    // Slowly drift jitter so AI doesn't lock perfectly
    aiJitterRef.current += (Math.random() - 0.5) * 1.5;
    aiJitterRef.current = Math.max(-state.tier.aiError, Math.min(state.tier.aiError, aiJitterRef.current));

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.y - BALL_SIZE / 2 <= 0) { ball.y = BALL_SIZE / 2; ball.vy *= -1; }
    if (ball.y + BALL_SIZE / 2 >= CANVAS_H) { ball.y = CANVAS_H - BALL_SIZE / 2; ball.vy *= -1; }

    // Player paddle collision
    if (
      ball.x - BALL_SIZE / 2 <= player.x + PADDLE_W &&
      ball.x - BALL_SIZE / 2 >= player.x &&
      ball.y >= player.y && ball.y <= player.y + PADDLE_H
    ) {
      ball.x = player.x + PADDLE_W + BALL_SIZE / 2;
      ball.vx = Math.abs(ball.vx) * 1.04;
      ball.vy = state.tier.ballSpeed * ((ball.y - player.y) / PADDLE_H - 0.5) * 2;
    }

    // AI paddle collision
    if (
      ball.x + BALL_SIZE / 2 >= ai.x &&
      ball.x + BALL_SIZE / 2 <= ai.x + PADDLE_W &&
      ball.y >= ai.y && ball.y <= ai.y + PADDLE_H
    ) {
      ball.x = ai.x - BALL_SIZE / 2;
      ball.vx = -Math.abs(ball.vx) * 1.04;
      ball.vy = state.tier.ballSpeed * ((ball.y - ai.y) / PADDLE_H - 0.5) * 2;
    }

    // Cap speed
    const max = state.tier.ballSpeed * 2.5;
    if (Math.abs(ball.vx) > max) ball.vx = max * Math.sign(ball.vx);
    if (Math.abs(ball.vy) > max) ball.vy = max * Math.sign(ball.vy);

    // Scoring
    if (ball.x < 0) {
      ai.score += 1;
      setScores({ player: player.score, ai: ai.score });
      if (ai.score >= WINNING_SCORE) {
        state.running = false;
        setWinner('ai');
        setScreen('gameover');
        draw(ctx, state);
        return;
      }
      resetBall(state, 'ai');
    }

    if (ball.x > CANVAS_W) {
      player.score += 1;
      player.totalGoals += 1;
      const newTier = getTier(player.totalGoals);
      if (newTier.label !== state.tier.label) {
        state.tier = newTier;
        setCurrentTier(newTier);
        setJustLevelledUp(true);
        setTimeout(() => setJustLevelledUp(false), 2000);
      }
      setScores({ player: player.score, ai: ai.score });
      if (player.score >= WINNING_SCORE) {
        state.running = false;
        setWinner('player');
        setScreen('gameover');
        draw(ctx, state);
        grantSwipeReward();
        return;
      }
      resetBall(state, 'player');
    }

    draw(ctx, state);
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [draw, resetBall, grantSwipeReward]);

  // ── Touch / mouse controls ───────────────────────────────────────────
  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !gameStateRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_H / rect.height;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const y = (clientY - rect.top) * scaleY;
    gameStateRef.current.player.y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, y - PADDLE_H / 2));
  }, []);

  const startGame = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    gameStateRef.current = initGameState();
    aiJitterRef.current = 0;
    setScores({ player: 0, ai: 0 });
    setCurrentTier(TIERS[0]);
    setWinner(null);
    setJustLevelledUp(false);
    setRewardGranted(false);
    setScreen('playing');
  }, [initGameState]);

  const togglePause = useCallback(() => {
    if (!gameStateRef.current) return;
    if (screen === 'playing') {
      gameStateRef.current.running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setScreen('paused');
    } else if (screen === 'paused') {
      gameStateRef.current.running = true;
      setScreen('playing');
    }
  }, [screen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key] = true;
      if (e.key === 'Escape') togglePause();
      if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [togglePause]);

  useEffect(() => {
    if (screen === 'playing') animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [screen, gameLoop]);

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.backBtn} onClick={() => {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          navigate('/discovery');
        }}>← Back</span>
        <div style={styles.headerCenter}>
          <div style={styles.retroLogo}>
            <span style={styles.retroPaddle}>▌</span>
            <span style={styles.retroBall}>●</span>
            <span style={styles.retroPaddle}>▐</span>
          </div>
          <h1 style={styles.title}>PONG</h1>
          <p style={styles.subtitle}>Tennis Connect Mini Game</p>
        </div>
        {(screen === 'playing' || screen === 'paused') ? (
          <button style={styles.pauseBtn} onClick={togglePause}>
            {screen === 'paused' ? '▶' : '⏸'}
          </button>
        ) : <div style={{ width: 44 }} />}
      </div>

      {/* Controls bar */}
      <div style={styles.controlsBar}>
        <span>📱 Touch & drag on mobile</span>
        <span>🖱 Mouse · ↑↓ keys · W/S</span>
      </div>

      {/* Canvas */}
      <div style={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={styles.canvas}
          onMouseMove={screen === 'playing' ? handlePointerMove : undefined}
          onTouchMove={screen === 'playing' ? handlePointerMove : undefined}
          onTouchStart={screen === 'playing' ? handlePointerMove : undefined}
        />

        {/* ── Menu overlay ── */}
        {screen === 'menu' && (
          <div style={styles.overlay}>
            <p style={styles.overlayTitle}>▌●▐ PONG</p>

            <div style={styles.infoBox}>
              <p style={styles.infoBoxHeading}>HOW TO WIN</p>
              <p style={styles.infoBoxText}>
                First to <strong style={{ color: '#c8ff00' }}>{WINNING_SCORE} points</strong> wins the game.
                Beat the CPU and earn a <strong style={{ color: '#c8ff00' }}>free Swipe Mode</strong> — one per day!
              </p>
            </div>

            <div style={styles.tierList}>
              <p style={styles.tierListHeading}>DIFFICULTY PROGRESSION</p>
              {TIERS.map((t, i) => (
                <div key={t.label} style={styles.tierRow}>
                  <span style={{ ...styles.tierDot, color: t.color }}>●</span>
                  <span style={styles.tierLabel}>{t.label}</span>
                  <span style={styles.tierWhen}>
                    {i === 0 ? 'from the start' : `at ${t.minGoals} goals`}
                  </span>
                </div>
              ))}
            </div>

            {alreadyWonToday && (
              <p style={styles.alreadyWonNote}>✓ You've already earned your free swipe today!</p>
            )}

            <button style={styles.startBtn} onClick={startGame}>START GAME</button>
          </div>
        )}

        {/* ── Paused overlay ── */}
        {screen === 'paused' && (
          <div style={styles.overlay}>
            <p style={styles.overlayTitle}>⏸ PAUSED</p>
            <div style={styles.scoreRow}>
              <div style={styles.scoreBlock}>
                <span style={styles.scoreBig}>{scores.player}</span>
                <span style={styles.scoreLabel}>YOU</span>
              </div>
              <span style={styles.scoreDash}>—</span>
              <div style={styles.scoreBlock}>
                <span style={styles.scoreBig}>{scores.ai}</span>
                <span style={styles.scoreLabel}>CPU</span>
              </div>
            </div>
            <span style={{ color: currentTier.color, fontFamily: "'Courier New', monospace", fontSize: '13px' }}>
              ● {currentTier.label}
            </span>
            <button style={styles.startBtn} onClick={togglePause}>RESUME</button>
            <button style={styles.secondaryBtn} onClick={() => setScreen('menu')}>QUIT TO MENU</button>
          </div>
        )}

        {/* ── Game over overlay ── */}
        {screen === 'gameover' && (
          <div style={styles.overlay}>
            <p style={styles.overlayTitle}>
              {winner === 'player' ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
            </p>

            <div style={styles.scoreRow}>
              <div style={styles.scoreBlock}>
                <span style={styles.scoreBig}>{scores.player}</span>
                <span style={styles.scoreLabel}>YOU</span>
              </div>
              <span style={styles.scoreDash}>—</span>
              <div style={styles.scoreBlock}>
                <span style={styles.scoreBig}>{scores.ai}</span>
                <span style={styles.scoreLabel}>CPU</span>
              </div>
            </div>

            <span style={{ color: currentTier.color, fontFamily: "'Courier New', monospace", fontSize: '12px' }}>
              ● Reached {currentTier.label}
            </span>

            {/* Swipe reward message */}
            {winner === 'player' && (
              <div style={styles.rewardBox}>
                {rewardGranted ? (
                  <>
                    <p style={styles.rewardTitle}>🎉 Free Swipe Unlocked!</p>
                    <p style={styles.rewardText}>You earned a free Swipe Mode for today. Come back tomorrow to win another!</p>
                  </>
                ) : alreadyWonToday ? (
                  <>
                    <p style={styles.rewardTitle}>✓ Already earned today</p>
                    <p style={styles.rewardText}>You already claimed your free swipe today. Come back tomorrow!</p>
                  </>
                ) : null}
              </div>
            )}

            {winner === 'ai' && (
              <p style={styles.loseHint}>Beat the CPU to earn a free daily Swipe Mode 🎾</p>
            )}

            <button style={styles.startBtn} onClick={startGame}>PLAY AGAIN</button>
            <button style={styles.secondaryBtn} onClick={() => setScreen('menu')}>MENU</button>
          </div>
        )}
      </div>

      {/* Status bar */}
      {(screen === 'playing' || screen === 'paused') && (
        <div style={styles.statusBar}>
          <span style={{ color: currentTier.color, fontWeight: '700' }}>● {currentTier.label}</span>
          {justLevelledUp && (
            <span style={{ color: currentTier.color, fontWeight: '700' }}>⚡ LEVEL UP!</span>
          )}
          <span style={{ color: '#9aa0ac' }}>ESC to pause</span>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    maxWidth: '640px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  backBtn: {
    fontSize: '13px',
    color: '#9aa0ac',
    cursor: 'pointer',
    fontWeight: '500',
    width: 44,
  },
  headerCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
  },
  retroLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '2px',
  },
  retroPaddle: {
    fontSize: '20px',
    color: '#c8ff00',
    fontFamily: "'Courier New', monospace",
    lineHeight: 1,
  },
  retroBall: {
    fontSize: '10px',
    color: '#ffffff',
    fontFamily: "'Courier New', monospace",
  },
  title: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0a1628',
    letterSpacing: '6px',
    fontFamily: "'Courier New', monospace",
  },
  subtitle: {
    margin: '0',
    fontSize: '10px',
    color: '#9aa0ac',
    letterSpacing: '0.5px',
    fontFamily: "'Courier New', monospace",
  },
  pauseBtn: {
    backgroundColor: '#0a1628',
    color: '#c8ff00',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    width: 44,
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#f4f6f8',
    borderRadius: '8px',
    padding: '9px 14px',
    marginBottom: '10px',
    fontSize: '12px',
    color: '#5a6270',
    fontWeight: '500',
  },
  canvasWrapper: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    backgroundColor: '#000',
    lineHeight: 0,
  },
  canvas: {
    width: '100%',
    height: 'auto',
    display: 'block',
    touchAction: 'none',
    cursor: 'none',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    padding: '20px',
    overflowY: 'auto',
  },
  overlayTitle: {
    margin: '0',
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '3px',
  },
  infoBox: {
    backgroundColor: 'rgba(200,255,0,0.07)',
    border: '1px solid rgba(200,255,0,0.2)',
    borderRadius: '10px',
    padding: '12px 18px',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
  },
  infoBoxHeading: {
    margin: '0 0 6px 0',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1.5px',
  },
  infoBoxText: {
    margin: '0',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: "'Courier New', monospace",
    lineHeight: '1.6',
  },
  tierList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '300px',
  },
  tierListHeading: {
    margin: '0 0 2px 0',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1.5px',
    textAlign: 'center',
  },
  tierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tierDot: {
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    flexShrink: 0,
  },
  tierLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'Courier New', monospace",
    width: '64px',
  },
  tierWhen: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: "'Courier New', monospace",
  },
  alreadyWonNote: {
    margin: '0',
    fontSize: '12px',
    color: '#22c55e',
    fontFamily: "'Courier New', monospace",
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#c8ff00',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '13px 40px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '2px',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.45)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    padding: '10px 24px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '1px',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  scoreBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  scoreBig: {
    fontSize: '52px',
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: "'Courier New', monospace",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '2px',
  },
  scoreDash: {
    fontSize: '28px',
    color: 'rgba(255,255,255,0.15)',
    fontFamily: "'Courier New', monospace",
  },
  rewardBox: {
    backgroundColor: 'rgba(200,255,0,0.08)',
    border: '1px solid rgba(200,255,0,0.25)',
    borderRadius: '10px',
    padding: '12px 18px',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
  },
  rewardTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#c8ff00',
    fontFamily: "'Courier New', monospace",
  },
  rewardText: {
    margin: '0',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: "'Courier New', monospace",
    lineHeight: '1.6',
  },
  loseHint: {
    margin: '0',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: "'Courier New', monospace",
    textAlign: 'center',
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    padding: '0 4px',
    fontSize: '11px',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '0.5px',
  },
};

export default Pong;
