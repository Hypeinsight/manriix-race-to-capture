/**
 * Display.jsx — Portrait kiosk display
 *
 * ► Drop QR image at client/public/qr.png
 * ► Open /display on the screen browser
 *
 * Grid: 6vh header | 20vh QR | 1fr unified carousel
 *
 * Carousel slides (variable timing):
 *   Step 1   7 s
 *   Step 2   7 s
 *   Step 3   7 s
 *   Step 4   7 s
 *   Leaderboard  14 s  ← longer stay
 *   → loops
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Instagram, Camera, Video, RefreshCw } from 'lucide-react';
import api from '../lib/api.js';

// ─── Rank colours ─────────────────────────────────────────────────────────────
const RC = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
const LB_MS = 20_000;

// ─── Slide definitions ────────────────────────────────────────────────────────
// ms = how long this slide stays on screen
const SLIDES = [
  { id: 's1', type: 'step', num: 1, Icon: Zap,      color: '#fbb238', pts: '+100 pts',         title: 'Register',  titleAccent: 'Your Details', desc: 'Scan the QR code, enter your name, email and company at the Manriix booth. Points are awarded the moment you register.',                                                    ms: 7000 },
  { id: 's2', type: 'step', num: 2, Icon: Instagram, color: '#e1306c', pts: '+150 pts',         title: 'Follow',    titleAccent: '@Manriix',     desc: 'Open Instagram and follow @manriix_ — take a screenshot showing you follow us and upload it to claim your points.',                                                        ms: 7000 },
  { id: 's3', type: 'step', num: 3, Icon: Camera,    color: '#fed700', pts: '+15 pts / capture', title: 'Race to',   titleAccent: 'Capture',      desc: 'Play our 15-second mini-game. Tap cars as they zoom across the screen. Spot the Manriix robot to unlock a ×2 or ×3 score multiplier!',                               ms: 7000 },
  { id: 's4', type: 'step', num: 4, Icon: Video,     color: '#fbb238', pts: '+300 pts',         title: 'Record a',  titleAccent: 'Hype Video',   desc: 'Film a short video with Manriix and upload it. This is the highest-value step — worth 300 points and your best shot at winning a prize.', hot: true, ms: 7000 },
  { id: 'lb', type: 'lb', ms: 14000 },
];

// ─── Step slide ───────────────────────────────────────────────────────────────
function StepSlide({ slide }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '20px 36px',
      minHeight: 0, overflow: 'hidden',
    }}>
      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: slide.color,
          background: `${slide.color}14`, border: `1px solid ${slide.color}40`,
          borderRadius: 2, padding: '4px 10px',
        }}>
          <slide.Icon size={9} /> Step {slide.num} of 4
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#fed700', background: 'rgba(254,215,0,0.1)',
          border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '4px 10px',
        }}>
          {slide.pts}
        </span>
        {slide.hot && (
          <span style={{
            background: '#fbb238', color: '#000',
            fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            borderRadius: 3, padding: '4px 10px',
          }}>
            MOST PTS
          </span>
        )}
      </div>

      {/* Large number */}
      <div style={{
        fontFamily: 'JetBrains Mono', fontWeight: 100,
        fontSize: 'clamp(72px,10vh,130px)', color: slide.color,
        lineHeight: 1, marginBottom: 14,
      }}>
        {String(slide.num).padStart(2, '0')}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: 'Inter', fontWeight: 100,
        fontSize: 'clamp(2.2rem,5vh,5.5rem)',
        lineHeight: 0.9, color: '#fff',
        textTransform: 'uppercase', letterSpacing: '-0.02em',
        margin: '0 0 18px',
      }}>
        {slide.title}<br />
        <span style={{ color: slide.color }}>{slide.titleAccent}</span>
      </h2>

      {/* Description */}
      <p style={{
        fontSize: 'clamp(15px,2vh,22px)',
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 1.65, fontWeight: 300,
        margin: 0, maxWidth: 600,
      }}>
        {slide.desc}
      </p>
    </div>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderRow({ row, i }) {
  const color = RC[row.rank] ?? 'rgba(255,255,255,0.32)';
  const dots  = [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 16px',
        background: row.rank <= 3 ? `${RC[row.rank]}0c` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${row.rank <= 3 ? RC[row.rank] + '28' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 3,
      }}
    >
      <span style={{
        fontFamily: 'JetBrains Mono', fontWeight: 100,
        fontSize: row.rank <= 3 ? 24 : 16, color, lineHeight: 1,
        minWidth: 32, flexShrink: 0,
      }}>
        {String(row.rank).padStart(2, '0')}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
          {row.first_name} {row.last_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.company_name && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
              {row.company_name}
            </span>
          )}
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {dots.map((d, di) => (
              <span key={di} style={{ width: 5, height: 5, borderRadius: '50%', background: d ? (di === 3 ? '#fed700' : '#22c55e') : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
        </div>
      </div>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 17, fontWeight: 500, color, flexShrink: 0 }}>
        {row.total_points}
      </span>
    </motion.div>
  );
}

// ─── Leaderboard slide ────────────────────────────────────────────────────────
function LbSlide({ lb, total, loading, lastRefresh }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '20px 32px', minHeight: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={20} style={{ color: '#fed700' }} />
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 100,
            fontSize: 'clamp(2rem,4vh,4rem)',
            lineHeight: 1, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Leader<span style={{ color: '#fed700' }}>board</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
            {total} competing{lastRefresh ? ` · ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
          <RefreshCw size={10} style={{ color: 'rgba(255,255,255,0.2)', animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
        </div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden', minHeight: 0 }}>
        {loading && lb.length === 0 ? (
          [...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 52, borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          ))
        ) : lb.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.06em' }}>
              No participants yet — be the first to scan!
            </p>
          </div>
        ) : (
          lb.map((row, i) => <LeaderRow key={row.id} row={row} i={i} />)
        )}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, marginTop: 12, fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
        Top 3 players win exclusive Manriix prizes · Up to 700 pts available
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════
export default function Display() {
  const [slideIdx,    setSlideIdx]    = useState(0);
  const [lb,          setLb]          = useState([]);
  const [total,       setTotal]       = useState(0);
  const [lbLoading,   setLbLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [now,         setNow]         = useState(new Date());

  // Variable-duration slide advance
  useEffect(() => {
    const t = setTimeout(
      () => setSlideIdx(i => (i + 1) % SLIDES.length),
      SLIDES[slideIdx].ms,
    );
    return () => clearTimeout(t);
  }, [slideIdx]);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Leaderboard — always refreshes in background
  const loadLb = useCallback(async () => {
    try {
      const { data } = await api.get('/leaderboard');
      setLb(data.leaderboard.slice(0, 10));
      setTotal(data.total);
      setLastRefresh(new Date());
    } catch { /* silent */ }
    finally { setLbLoading(false); }
  }, []);

  useEffect(() => { loadLb(); }, [loadLb]);
  useEffect(() => { const id = setInterval(loadLb, LB_MS); return () => clearInterval(id); }, [loadLb]);

  const slide     = SLIDES[slideIdx];
  const stepColor = slide.type === 'step' ? slide.color : '#fed700';

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#000', color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid',
      gridTemplateRows: '6vh 20vh 1fr',
      userSelect: 'none',
    }}>

      {/* Speed lines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', height: 1, background: 'rgba(251,178,56,0.07)', top: `${10 + i * 15}%`, width: 50 + i * 24 }}
            animate={{ x: ['-200px', '110vw'] }}
            transition={{ duration: 1.6 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
          />
        ))}
      </div>

      {/* ── ROW 1: Header ───────────────────────────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <img src="/logo.png" alt="Manriix" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 100, fontSize: 'clamp(12px,1.5vw,18px)', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
            Race to <span style={{ color: '#fbb238' }}>Capture</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(8px,0.9vw,10px)', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', marginTop: 1 }}>
            MOTOR &amp; EV TECHNOLOGY SHOW 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#22c55e', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </header>

      {/* ── ROW 2: QR ───────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <motion.div
          animate={{ boxShadow: ['0 0 0 0 rgba(251,178,56,0.5)', '0 0 0 12px rgba(251,178,56,0)', '0 0 0 0 rgba(251,178,56,0)'] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{ padding: 12, background: '#fff', borderRadius: 10 }}
        >
          <img
            src="/qr.png" alt="QR Code"
            width={170} height={170}
            style={{ display: 'block' }}
            onError={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.width = '170px'; e.currentTarget.style.height = '170px'; }}
          />
        </motion.div>
      </section>

      {/* ── ROW 3: Unified carousel ─────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minHeight: 0,
        background: `${stepColor}04`,
        borderLeft: `3px solid ${stepColor}45`,
        transition: 'background 0.6s ease, border-color 0.6s ease',
      }}>

        {/* Slide indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 24px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {slide.type === 'step' ? `How to play — step ${slide.num} of 4` : 'Live standings'}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {SLIDES.map((s, i) => (
              <motion.div key={s.id}
                animate={{
                  width: i === slideIdx ? 20 : 6,
                  background: i === slideIdx
                    ? (s.type === 'lb' ? '#fed700' : s.color)
                    : 'rgba(255,255,255,0.18)',
                }}
                transition={{ duration: 0.3 }}
                style={{ height: 5, borderRadius: 3 }}
              />
            ))}
          </div>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            {slide.type === 'step' ? (
              <StepSlide slide={slide} />
            ) : (
              <LbSlide lb={lb} total={total} loading={lbLoading} lastRefresh={lastRefresh} />
            )}
          </motion.div>
        </AnimatePresence>

      </section>
    </div>
  );
}
