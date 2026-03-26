/**
 * Display.jsx — Portrait kiosk display
 * Drop QR at client/public/qr.png · Open /display on the screen
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Instagram, Camera, Video, RefreshCw } from 'lucide-react';
import api from '../lib/api.js';

const RC    = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
const LB_MS = 20_000;

// ═══════════════════════════════════════════════════════════════════════════════
// Step bottom-animations — clean geometric, no emojis
// ═══════════════════════════════════════════════════════════════════════════════

/** Step 1 — form fields fill in one by one */
function Step1Visual() {
  const fields = ['FIRST NAME', 'EMAIL ADDRESS', 'COMPANY'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {fields.map((label, i) => (
        <div key={label}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginBottom: 5 }}>
            {label}
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: '#fbb238', borderRadius: 2, originX: 0 }}
              animate={{ scaleX: [0, 1, 1, 0] }}
              transition={{ duration: 4.5, times: [0, 0.3, 0.75, 1], delay: i * 0.55, repeat: Infinity, repeatDelay: 0.4 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Step 2 — Instagram profile + animated follow button */
function Step2Visual() {
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFollowed(f => !f), followed ? 2200 : 2800);
    return () => clearTimeout(t);
  }, [followed]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {/* Avatar ring */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Instagram size={28} color="#fff" />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 10, letterSpacing: '-0.01em' }}>
          @manriix_
        </div>
        <motion.div
          animate={{
            background: followed ? 'rgba(34,197,94,0.1)' : 'linear-gradient(60deg,#fed700,#ffed4a)',
            color: followed ? '#22c55e' : '#0d0d0d',
          }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 2,
            fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            border: followed ? '1px solid rgba(34,197,94,0.25)' : 'none',
          }}
        >
          {followed ? '✓ FOLLOWING' : 'FOLLOW'}
        </motion.div>
      </div>
    </div>
  );
}

/** Step 3 — minimal race track: lane lines + coloured rectangles + crosshair */
function Step3Visual() {
  const cars = [
    { top: '18%', color: '#e53e3e', dur: 2.8, delay: 0   },
    { top: '50%', color: '#3182ce', dur: 3.5, delay: 0.9 },
    { top: '82%', color: '#38a169', dur: 2.4, delay: 1.7 },
  ];
  return (
    <div style={{ position: 'relative', height: 100, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(254,215,0,0.14)', borderRadius: 4, overflow: 'hidden' }}>
      {/* Lane dividers */}
      {[34, 67].map(p => (
        <div key={p} style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', top: `${p}%` }} />
      ))}

      {/* Cars */}
      {cars.map((c, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', top: c.top, transform: 'translateY(-50%)', width: 34, height: 16, borderRadius: 3, background: c.color }}
          animate={{ x: ['-40px', 'calc(100% + 40px)'] }}
          transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'linear' }}
        />
      ))}

      {/* Crosshair */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(254,215,0,0.75)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(254,215,0,0.75)' }} />
        {[
          { top: 0, left: 0,   bt: true, bl: true  },
          { top: 0, right: 0,  bt: true, br: true  },
          { bottom: 0, left: 0,  bb: true, bl: true },
          { bottom: 0, right: 0, bb: true, br: true },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', width: 9, height: 9,
            ...(b.top    !== undefined ? { top: b.top }       : {}),
            ...(b.bottom !== undefined ? { bottom: b.bottom } : {}),
            ...(b.left   !== undefined ? { left: b.left }     : {}),
            ...(b.right  !== undefined ? { right: b.right }   : {}),
            borderTop:    b.bt ? '2px solid rgba(254,215,0,0.85)' : 'none',
            borderBottom: b.bb ? '2px solid rgba(254,215,0,0.85)' : 'none',
            borderLeft:   b.bl ? '2px solid rgba(254,215,0,0.85)' : 'none',
            borderRight:  b.br ? '2px solid rgba(254,215,0,0.85)' : 'none',
          }} />
        ))}
      </div>

      {/* Timer bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg,#fed700,#fbb238)', borderRadius: '0 2px 2px 0' }}
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div style={{ position: 'absolute', top: 6, right: 10, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(254,215,0,0.45)', letterSpacing: '0.1em' }}>15 SEC</div>
    </div>
  );
}

/** Step 4 — pulsing record button + live timer */
function Step4Visual() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s >= 15 ? 0 : s + 1), 550);
    return () => clearInterval(id);
  }, []);
  const mm = `0:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* Record button */}
      <motion.div
        style={{ width: 68, height: 68, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.55)', '0 0 0 18px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
        transition={{ duration: 1.3, repeat: Infinity }}
      />

      {/* REC + timer */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <motion.div
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }}
          />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#ef4444', letterSpacing: '0.14em' }}>REC</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, color: '#fff', fontWeight: 300, marginLeft: 6 }}>{mm}</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg,#ef4444,#fbb238)', borderRadius: 3 }}
            animate={{ width: `${(secs / 15) * 100}%` }}
            transition={{ duration: 0.55 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  { id: 's1', type: 'step', num: 1, Icon: Zap,      color: '#fbb238', pts: '+100 pts',          title: 'Register',  titleAccent: 'Your Details', desc: 'Scan the QR code, enter your name, email and company at the Manriix booth. Points are awarded the moment you register.',                                                     Visual: Step1Visual, ms: 7000 },
  { id: 's2', type: 'step', num: 2, Icon: Instagram, color: '#e1306c', pts: '+150 pts',          title: 'Follow',    titleAccent: '@Manriix',     desc: 'Follow @manriix_ on Instagram, take a screenshot showing you follow us, and upload it to claim your points.',                                                               Visual: Step2Visual, ms: 7000 },
  { id: 's3', type: 'step', num: 3, Icon: Camera,    color: '#fed700', pts: '+15 pts / capture', title: 'Race to',   titleAccent: 'Capture',      desc: 'Play our 15-second mini-game. Tap cars as they race across the screen. Hit the Manriix robot to unlock a ×2 or ×3 multiplier!',                                         Visual: Step3Visual, ms: 7000 },
  { id: 's4', type: 'step', num: 4, Icon: Video,     color: '#fbb238', pts: '+300 pts',          title: 'Record a',  titleAccent: 'Hype Video',   desc: 'Film a short video with Manriix and upload it. The highest-value step — 300 points and your best shot at winning a prize.', hot: true, Visual: Step4Visual, ms: 7000 },
  { id: 'lb', type: 'lb', ms: 14000 },
];

// ─── Step slide ───────────────────────────────────────────────────────────────
function StepSlide({ slide }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '28px 40px 24px', minHeight: 0, overflow: 'hidden',
    }}>
      {/* Text block — sits at top, visual pushed to bottom via marginTop:auto */}
      <div>
        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'JetBrains Mono', fontSize: 13, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: slide.color,
            background: `${slide.color}14`, border: `1px solid ${slide.color}40`,
            borderRadius: 2, padding: '5px 12px',
          }}>
            <slide.Icon size={10} /> Step {slide.num} of 4
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#fed700', background: 'rgba(254,215,0,0.1)',
            border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '5px 12px',
          }}>
            {slide.pts}
          </span>
          {slide.hot && (
            <span style={{
              background: '#fbb238', color: '#000',
              fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              borderRadius: 3, padding: '5px 12px',
            }}>
              MOST PTS
            </span>
          )}
        </div>

        {/* Large number */}
        <div style={{
          fontFamily: 'JetBrains Mono', fontWeight: 100,
          fontSize: 'clamp(90px,12vh,160px)', color: slide.color,
          lineHeight: 1, marginBottom: 16,
        }}>
          {String(slide.num).padStart(2, '0')}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Inter', fontWeight: 100,
          fontSize: 'clamp(2.8rem,6.5vh,7rem)',
          lineHeight: 0.9, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '-0.02em',
          margin: '0 0 22px',
        }}>
          {slide.title}<br />
          <span style={{ color: slide.color }}>{slide.titleAccent}</span>
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(17px,2.4vh,28px)',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.65, fontWeight: 300,
          margin: 0, maxWidth: 700,
        }}>
          {slide.desc}
        </p>
      </div>

      {/* Visual animation — pushed to bottom */}
      <div style={{
        marginTop: 'auto', paddingTop: 28,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <slide.Visual />
      </div>
    </div>
  );
}

// ─── Leaderboard row (large — designed to flex-fill available height) ─────────
function LeaderRow({ row }) {
  const color = RC[row.rank] ?? 'rgba(255,255,255,0.32)';
  const dots  = [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
  return (
    <div style={{
      flex: 1, minHeight: 0,
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '0 24px',
      background: row.rank <= 3 ? `${RC[row.rank]}0c` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${row.rank <= 3 ? RC[row.rank] + '28' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 4,
    }}>
      {/* Rank */}
      <span style={{
        fontFamily: 'JetBrains Mono', fontWeight: 100, lineHeight: 1,
        fontSize: row.rank <= 3 ? 'clamp(36px,5.5vh,68px)' : 'clamp(24px,3.5vh,44px)',
        color, minWidth: '12%', flexShrink: 0,
      }}>
        {String(row.rank).padStart(2, '0')}
      </span>

      {/* Name + company + dots */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'clamp(16px,2.4vh,32px)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4vh' }}>
          {row.first_name} {row.last_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {row.company_name && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(10px,1.3vh,17px)', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>
              {row.company_name}
            </span>
          )}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {dots.map((d, di) => (
              <span key={di} style={{ width: 8, height: 8, borderRadius: '50%', background: d ? (di === 3 ? '#fed700' : '#22c55e') : 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Points */}
      <span style={{
        fontFamily: 'JetBrains Mono', fontWeight: 500, lineHeight: 1,
        fontSize: 'clamp(22px,3.8vh,50px)',
        color, flexShrink: 0,
      }}>
        {row.total_points}
      </span>
    </div>
  );
}

// ─── Leaderboard slide ────────────────────────────────────────────────────────
function LbSlide({ lb, total, loading, lastRefresh }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '20px 32px 20px', minHeight: 0, overflow: 'hidden',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy size={22} style={{ color: '#fed700' }} />
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 100,
            fontSize: 'clamp(2rem,4.5vh,5rem)',
            lineHeight: 1, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0,
          }}>
            Leader<span style={{ color: '#fed700' }}>board</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
            {total} competing{lastRefresh ? ` · ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
          <RefreshCw size={11} style={{ color: 'rgba(255,255,255,0.2)', animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
        </div>
      </div>

      {/* Rows — each row gets equal share of available height */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
        {loading && lb.length === 0 ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ flex: 1, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
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

      <div style={{ flexShrink: 0, marginTop: 10, fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.18)', textAlign: 'center', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
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

  useEffect(() => {
    const t = setTimeout(() => setSlideIdx(i => (i + 1) % SLIDES.length), SLIDES[slideIdx].ms);
    return () => clearTimeout(t);
  }, [slideIdx]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadLb = useCallback(async () => {
    try {
      const { data } = await api.get('/leaderboard');
      setLb(data.leaderboard.slice(0, 5));
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
      gridTemplateRows: '6vh 36vh 1fr',
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
        <img
          src="/qr.png" alt="QR Code"
          style={{ display: 'block', height: '88%', width: 'auto', maxWidth: '90%', objectFit: 'contain' }}
          onError={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.height = '88%'; }}
        />
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
                animate={{ width: i === slideIdx ? 20 : 6, background: i === slideIdx ? (s.type === 'lb' ? '#fed700' : s.color) : 'rgba(255,255,255,0.18)' }}
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
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22 }}
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
