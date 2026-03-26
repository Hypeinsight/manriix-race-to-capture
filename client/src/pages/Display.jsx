/**
 * Display.jsx — Portrait kiosk display
 * Designed for a vertical screen at the event booth.
 *
 * ► Drop your QR image at client/public/qr.png
 * ► Open /display on the screen browser
 *
 * Grid rows: 6vh header | 24vh top-QR | 2fr step-carousel | 1.5fr leaderboard | 9vh bottom-QR
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Instagram, Camera, Video, RefreshCw } from 'lucide-react';
import api from '../lib/api.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const STEP_MS = 7000;
const LB_MS   = 20_000;

// ─── Rank colours ─────────────────────────────────────────────────────────────
const RC = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: 1, Icon: Zap, color: '#fbb238',
    pts: '+100 pts',
    title: 'Register', titleAccent: 'Your Details',
    desc: 'Scan the QR code, enter your name, email and company at the Manriix booth. Points are awarded the moment you register.',
  },
  {
    num: 2, Icon: Instagram, color: '#e1306c',
    pts: '+150 pts',
    title: 'Follow', titleAccent: '@Manriix',
    desc: 'Open Instagram and follow @manriix_ — then take a screenshot showing you follow us and upload it to claim your points.',
  },
  {
    num: 3, Icon: Camera, color: '#fed700',
    pts: '+15 pts per capture',
    title: 'Race to', titleAccent: 'Capture',
    desc: 'Play our 15-second mini-game. Tap cars as they zoom across the screen. Spot the Manriix robot to unlock a ×2 or ×3 score multiplier!',
  },
  {
    num: 4, Icon: Video, color: '#fbb238',
    pts: '+300 pts',
    title: 'Record a', titleAccent: 'Hype Video',
    desc: 'Film a short video with Manriix and upload it. This is the highest-value step — worth 300 points and the best shot at winning a prize.',
    hot: true,
  },
];

// ─── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderRow({ row, i }) {
  const color = RC[row.rank] ?? 'rgba(255,255,255,0.32)';
  const dots  = [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.22 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 14px',
        background: row.rank <= 3 ? `${RC[row.rank]}0c` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${row.rank <= 3 ? RC[row.rank] + '28' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 4, flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 100, fontSize: row.rank <= 3 ? 22 : 15, color, lineHeight: 1, minWidth: 30, flexShrink: 0 }}>
        {String(row.rank).padStart(2, '0')}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
          {row.first_name} {row.last_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.company_name && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
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

// ─── QR block ─────────────────────────────────────────────────────────────────
function QrBlock({ size = 140, compact = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 16 : 28, justifyContent: 'center' }}>
      <motion.div
        animate={{ boxShadow: ['0 0 0 0 rgba(251,178,56,0.5)', '0 0 0 10px rgba(251,178,56,0)', '0 0 0 0 rgba(251,178,56,0)'] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{ padding: 12, background: '#fff', borderRadius: 10, flexShrink: 0 }}
      >
        <img
          src="/qr.png" alt="QR Code"
          width={size} height={size}
          style={{ display: 'block' }}
          onError={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.width = `${size}px`; e.currentTarget.style.height = `${size}px`; }}
        />
      </motion.div>
      {!compact ? (
        <div>
          <div style={{ fontWeight: 100, fontSize: 'clamp(28px,3.5vw,52px)', lineHeight: 1.0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Scan to<br /><span style={{ color: '#fbb238' }}>Play</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, letterSpacing: '0.06em' }}>
            race.manriix.com
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {['Up to 700 pts', 'Top 3 win prizes'].map(t => (
              <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, background: 'rgba(254,215,0,0.07)', border: '1px solid rgba(254,215,0,0.2)', borderRadius: 3, padding: '4px 10px', color: '#fed700', letterSpacing: '0.07em' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#fbb238', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            Scan &amp; Compete
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em' }}>
            race.manriix.com
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════
export default function Display() {
  const [stepIdx,     setStepIdx]     = useState(0);
  const [lb,          setLb]          = useState([]);
  const [total,       setTotal]       = useState(0);
  const [lbLoading,   setLbLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [now,         setNow]         = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setStepIdx(i => (i + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadLb = useCallback(async () => {
    try {
      const { data } = await api.get('/leaderboard');
      setLb(data.leaderboard.slice(0, 8));
      setTotal(data.total);
      setLastRefresh(new Date());
    } catch { /* silent */ }
    finally { setLbLoading(false); }
  }, []);

  useEffect(() => { loadLb(); }, [loadLb]);
  useEffect(() => { const id = setInterval(loadLb, LB_MS); return () => clearInterval(id); }, [loadLb]);

  const step = STEPS[stepIdx];

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#000', color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid',
      gridTemplateRows: '6vh 24vh 2fr 1.5fr 9vh',
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

      {/* ── ROW 2: Top QR ───────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <QrBlock size={132} compact={false} />
      </section>

      {/* ── ROW 3: Step carousel (text only) ────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden', minHeight: 0,
        background: `${step.color}04`,
        borderLeft: `3px solid ${step.color}45`,
      }}>
        {/* Progress bar header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 24px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            How to play — step {stepIdx + 1} of {STEPS.length}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((s, i) => (
              <motion.div key={i}
                animate={{ width: i === stepIdx ? 20 : 6, background: i === stepIdx ? s.color : 'rgba(255,255,255,0.18)' }}
                transition={{ duration: 0.3 }}
                style={{ height: 5, borderRadius: 3 }}
              />
            ))}
          </div>
        </div>

        {/* Step card — text only */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', padding: '24px 36px',
              minHeight: 0, overflow: 'hidden',
            }}
          >
            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: step.color,
                background: `${step.color}14`, border: `1px solid ${step.color}40`,
                borderRadius: 2, padding: '4px 10px',
              }}>
                <step.Icon size={9} /> Step {step.num} of 4
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#fed700', background: 'rgba(254,215,0,0.1)',
                border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '4px 10px',
              }}>
                {step.pts}
              </span>
              {step.hot && (
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

            {/* Large step number */}
            <div style={{
              fontFamily: 'JetBrains Mono', fontWeight: 100,
              fontSize: 'clamp(64px,9vh,110px)', color: step.color,
              lineHeight: 1, marginBottom: 14,
            }}>
              {String(step.num).padStart(2, '0')}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 100,
              fontSize: 'clamp(2rem,4.2vh,4.5rem)',
              lineHeight: 0.92, color: '#fff',
              textTransform: 'uppercase', letterSpacing: '-0.02em',
              margin: '0 0 20px',
            }}>
              {step.title}<br />
              <span style={{ color: step.color }}>{step.titleAccent}</span>
            </h2>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(14px,1.9vh,20px)',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7, fontWeight: 300,
              margin: 0, maxWidth: 580,
            }}>
              {step.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── ROW 4: Leaderboard ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '10px 24px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden', minHeight: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={15} style={{ color: '#fed700' }} />
            <span style={{ fontWeight: 100, fontSize: 'clamp(16px,2vh,24px)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              Leader<span style={{ color: '#fed700' }}>board</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
              {total} competing{lastRefresh ? ` · ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
            <RefreshCw size={9} style={{ color: 'rgba(255,255,255,0.2)', animation: lbLoading ? 'spin 0.8s linear infinite' : 'none' }} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden', minHeight: 0 }}>
          {lbLoading && lb.length === 0 ? (
            [...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 44, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : lb.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', letterSpacing: '0.06em' }}>
                No participants yet — be the first!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {lb.map((row, i) => <LeaderRow key={row.id} row={row} i={i} />)}
            </AnimatePresence>
          )}
        </div>

        <div style={{ flexShrink: 0, marginTop: 6, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.18)', textAlign: 'center', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
          Top 3 players win exclusive Manriix prizes
        </div>
      </section>

      {/* ── ROW 5: Bottom QR ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 28px',
        background: 'rgba(251,178,56,0.03)',
        borderTop: '1px solid rgba(251,178,56,0.08)',
      }}>
        <QrBlock size={52} compact />
      </section>

    </div>
  );
}
