/**
 * Display.jsx — Portrait kiosk / digital-signage page
 * Designed for a vertical screen (1080 × 1920 or similar) at the booth.
 *
 * ► Drop your QR code image at:  client/public/qr.png
 * ► Navigate to /display on the display screen.
 *
 * Layout (top → bottom):
 *   Header bar  (7vh)
 *   Top QR      (19vh)
 *   Step carousel (1fr)
 *   Leaderboard   (1fr)
 *   Bottom QR   (10vh)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Instagram, Camera, Video, RefreshCw } from 'lucide-react';
import api from '../lib/api.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const STEP_MS  = 7000;   // ms each step is shown
const LB_MS    = 20_000; // leaderboard refresh interval

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: 1, Icon: Zap, color: '#fbb238',
    title: 'Register',
    desc:  'Enter your name, email & company to start competing instantly.',
    pts:   '+100 pts',
  },
  {
    num: 2, Icon: Instagram, color: '#e1306c',
    title: 'Follow on Instagram',
    desc:  'Follow @manriix_ and upload a screenshot as proof.',
    pts:   '+150 pts',
  },
  {
    num: 3, Icon: Camera, color: '#fed700',
    title: 'Race to Capture',
    desc:  'Tap cars as they zoom past in our 15-second mini-game!',
    pts:   '+15 pts each',
  },
  {
    num: 4, Icon: Video, color: '#fbb238',
    title: 'Record a Hype Video',
    desc:  'Film yourself with Manriix and upload it. Highest value step!',
    pts:   '+300 pts ⭐',
    hot:   true,
  },
];

// ─── Rank colours ─────────────────────────────────────────────────────────────
const RC = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

// ═══════════════════════════════════════════════════════════════════════════════
// Step visual previews
// Each component is re-mounted every time its step becomes active (key changes).
// ═══════════════════════════════════════════════════════════════════════════════

function RegisterPreview() {
  const fields = [
    { label: 'FIRST NAME', value: 'Amara Silva' },
    { label: 'EMAIL',      value: 'amara@example.com' },
    { label: 'COMPANY',    value: 'EV Drive Lanka' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {fields.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.45, duration: 0.35 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {f.label}
          </span>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '8px 12px', fontSize: 13, color: '#fff', overflow: 'hidden' }}>
            <motion.span
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ delay: i * 0.45 + 0.15, duration: 0.5 }}
              style={{ display: 'block', whiteSpace: 'nowrap' }}
            >
              {f.value}
            </motion.span>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, type: 'spring', stiffness: 220 }}
        style={{
          marginTop: 6, padding: '9px 14px',
          background: 'rgba(251,178,56,0.12)', border: '1px solid rgba(251,178,56,0.35)',
          borderRadius: 4, textAlign: 'center',
          fontFamily: 'JetBrains Mono', fontSize: 12, color: '#fbb238', letterSpacing: '0.08em',
        }}
      >
        ✓  REGISTERED  ·  +100 PTS UNLOCKED
      </motion.div>
    </div>
  );
}

function InstagramPreview() {
  const [followed, setFollowed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFollowed(true), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Profile card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          📸
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>@manriix_robot</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sri Lanka's autonomous photo robot</div>
        </div>
        <motion.div
          animate={{
            background: followed
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg,#f09433,#bc1888)',
          }}
          transition={{ duration: 0.35 }}
          style={{
            padding: '7px 16px', borderRadius: 7, flexShrink: 0,
            border: followed ? '1px solid rgba(255,255,255,0.2)' : 'none',
            fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600,
            color: '#fff', letterSpacing: '0.04em', cursor: 'default',
          }}
        >
          {followed ? '✓ Following' : 'Follow'}
        </motion.div>
      </div>
      {/* Upload confirmation */}
      <AnimatePresence>
        {followed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '10px 14px', background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.25)', borderRadius: 6, fontFamily: 'JetBrains Mono', fontSize: 12, color: '#e1306c', textAlign: 'center', letterSpacing: '0.06em' }}>
              📤  SCREENSHOT UPLOADED  ·  +150 PTS
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GamePreview() {
  const CARS = [
    { y: '20%', delay: 0,   dur: 3.0, emoji: '🚗' },
    { y: '52%', delay: 1.0, dur: 2.5, emoji: '🚕' },
    { y: '80%', delay: 0.4, dur: 3.6, emoji: '🚙' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Race track */}
      <div style={{ position: 'relative', height: 110, background: 'rgba(254,215,0,0.03)', borderRadius: 8, border: '1px solid rgba(254,215,0,0.14)', overflow: 'hidden' }}>
        {/* Lane dividers */}
        {[34, 67].map(p => (
          <div key={p} style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.05)', top: `${p}%` }} />
        ))}
        {/* Cars */}
        {CARS.map((c, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', top: c.y, fontSize: 22, transform: 'translateY(-50%)' }}
            animate={{ x: ['-30px', '105%'] }}
            transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'linear' }}
          >
            {c.emoji}
          </motion.div>
        ))}
        {/* Camera cursor */}
        <motion.div
          style={{ position: 'absolute', fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(254,215,0,1))', zIndex: 10, pointerEvents: 'none' }}
          animate={{ x: [10, 70, 130, 70, 10], y: [8, 42, 70, 28, 8] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          📷
        </motion.div>
        {/* +15 float */}
        <motion.span
          style={{ position: 'absolute', right: 18, top: 20, fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 15, color: '#fed700' }}
          animate={{ y: [-2, -30], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: 1.4, ease: 'easeOut' }}
        >
          +15
        </motion.span>
        {/* 15 SEC label */}
        <div style={{ position: 'absolute', top: 7, right: 10, fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(254,215,0,0.4)', letterSpacing: '0.1em' }}>
          15 SEC
        </div>
        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            style={{ height: '100%', background: 'linear-gradient(90deg,#fed700,#fbb238)', borderRadius: '0 2px 2px 0' }}
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em' }}>
        <span>TAP CARS WITH YOUR CAMERA</span>
        <span>15 PTS EACH</span>
      </div>
    </div>
  );
}

function VideoPreview() {
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => {
        if (s >= 15) { clearInterval(id); setDone(true); return s; }
        return s + 1;
      });
    }, 380); // fast-forward so 15s → ~6s on screen
    return () => clearInterval(id);
  }, []);
  const timer = `0:${String(secs).padStart(2, '0')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 18px', background: 'rgba(239,68,68,0.04)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
      {/* Record button */}
      <motion.div
        animate={{ boxShadow: done ? 'none' : ['0 0 0 0 rgba(239,68,68,0.6)', '0 0 0 14px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
        transition={{ duration: 1.1, repeat: Infinity }}
        style={{ width: 64, height: 64, borderRadius: '50%', background: done ? 'rgba(239,68,68,0.25)' : '#ef4444', border: '3px solid rgba(239,68,68,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}
      >
        🎥
      </motion.div>
      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <motion.div
            animate={{ opacity: done ? 0 : [1, 0.15, 1] }}
            transition={{ duration: 0.85, repeat: Infinity }}
            style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }}
          />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 300, color: done ? 'rgba(255,255,255,0.4)' : '#fff', lineHeight: 1 }}>
            {timer}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {done ? 'DONE' : 'REC'}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#ef4444,#fbb238)' }}
            animate={{ width: `${Math.min((secs / 15) * 100, 100)}%` }}
            transition={{ duration: 0.38 }}
          />
        </div>
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 8, fontFamily: 'JetBrains Mono', fontSize: 12, color: '#fbb238', letterSpacing: '0.06em' }}
            >
              ⭐  +300 PTS — HIGHEST REWARD
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Map step index → visual component
const VISUALS = [RegisterPreview, InstagramPreview, GamePreview, VideoPreview];

// ═══════════════════════════════════════════════════════════════════════════════
// Leaderboard row
// ═══════════════════════════════════════════════════════════════════════════════
function LeaderRow({ row, i }) {
  const color = RC[row.rank] ?? 'rgba(255,255,255,0.32)';
  const dots  = [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.36), duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: row.rank <= 3 ? `${RC[row.rank]}0b` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${row.rank <= 3 ? RC[row.rank] + '28' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 4, flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 100, fontSize: row.rank <= 3 ? 22 : 15, color, lineHeight: 1, minWidth: 28, flexShrink: 0 }}>
        {String(row.rank).padStart(2, '0')}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
          {row.first_name} {row.last_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {row.company_name && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
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
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 500, color, flexShrink: 0 }}>
        {row.total_points}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QR Code block (reused top + bottom)
// ═══════════════════════════════════════════════════════════════════════════════
function QrBlock({ size = 140, label = 'SCAN TO PLAY', compact = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 14 : 20, justifyContent: 'center' }}>
      {/* QR image */}
      <div style={{
        padding: 10, background: '#fff', borderRadius: 8, flexShrink: 0,
        boxShadow: '0 0 0 2px rgba(251,178,56,0.5), 0 0 24px rgba(251,178,56,0.25)',
      }}>
        <img
          src="/qr.png"
          alt="QR Code"
          width={size}
          height={size}
          style={{ display: 'block' }}
          onError={e => {
            // Placeholder if qr.png not yet added
            e.currentTarget.style.background = '#141414';
            e.currentTarget.alt = 'Place qr.png in client/public/';
          }}
        />
      </div>
      {/* CTA text */}
      {!compact && (
        <div>
          <div style={{ fontWeight: 100, fontSize: 'clamp(26px, 3.2vw, 46px)', lineHeight: 1.0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Scan to<br /><span style={{ color: '#fbb238' }}>Play</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 8, letterSpacing: '0.06em' }}>
            race.manriix.com
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Up to 700 pts', 'Win prizes'].map(t => (
              <span key={t} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, background: 'rgba(254,215,0,0.07)', border: '1px solid rgba(254,215,0,0.2)', borderRadius: 3, padding: '4px 10px', color: '#fed700', letterSpacing: '0.07em' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {compact && (
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#fbb238', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em' }}>
            race.manriix.com
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Display component
// ═══════════════════════════════════════════════════════════════════════════════
export default function Display() {
  const [stepIdx,      setStepIdx]      = useState(0);
  const [lb,           setLb]           = useState([]);
  const [total,        setTotal]        = useState(0);
  const [lbLoading,    setLbLoading]    = useState(true);
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [now,          setNow]          = useState(new Date());

  // ── Step auto-advance ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setStepIdx(i => (i + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  // ── Live clock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Leaderboard ────────────────────────────────────────────────────────────
  const loadLb = useCallback(async () => {
    try {
      const { data } = await api.get('/leaderboard');
      setLb(data.leaderboard.slice(0, 9));
      setTotal(data.total);
      setLastRefresh(new Date());
    } catch { /* silent */ }
    finally { setLbLoading(false); }
  }, []);

  useEffect(() => { loadLb(); }, [loadLb]);
  useEffect(() => {
    const id = setInterval(loadLb, LB_MS);
    return () => clearInterval(id);
  }, [loadLb]);

  const step    = STEPS[stepIdx];
  const Visual  = VISUALS[stepIdx];

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#000', color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid',
      gridTemplateRows: '7vh 19vh 1fr 1fr 10vh',
      userSelect: 'none',
    }}>

      {/* ── Animated background ──────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', height: 1, background: 'rgba(251,178,56,0.1)', top: `${8 + i * 13}%`, width: 50 + i * 22 }}
            animate={{ x: ['-200px', '110vw'] }}
            transition={{ duration: 1.5 + (i % 3) * 0.45, repeat: Infinity, delay: i * 0.35, ease: 'linear' }}
          />
        ))}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,178,56,0.055) 0%, transparent 70%)' }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 1 — Header
      ══════════════════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <img src="/logo.png" alt="Manriix" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 100, fontSize: 'clamp(13px,1.6vw,20px)', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
            Race to <span style={{ color: '#fbb238' }}>Capture</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(9px,1vw,11px)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 1 }}>
            MOTOR &amp; EV TECHNOLOGY SHOW 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}
            />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#22c55e', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 2 — Top QR code
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <QrBlock size={130} compact={false} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 3 — Step carousel
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '14px 24px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Carousel header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            How to play
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === stepIdx ? 22 : 6, background: i === stepIdx ? step.color : 'rgba(255,255,255,0.18)' }}
                transition={{ duration: 0.3 }}
                style={{ height: 6, borderRadius: 3 }}
              />
            ))}
          </div>
        </div>

        {/* Animated step card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', gap: 10,
              background: `${step.color}08`, border: `1px solid ${step.color}22`,
              borderRadius: 10, padding: '14px 18px', overflow: 'hidden',
            }}>
              {/* Step number + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 100, fontSize: 'clamp(38px,5vh,58px)', color: step.color, lineHeight: 1 }}>
                  {String(step.num).padStart(2, '0')}
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <step.Icon size={16} style={{ color: step.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 'clamp(15px,1.8vh,22px)', fontWeight: 300 }}>{step.title}</span>
                    {step.hot && (
                      <span style={{ background: '#fbb238', color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.08em', flexShrink: 0 }}>
                        MOST PTS
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: step.color, letterSpacing: '0.04em' }}>
                    {step.pts}
                  </div>
                </div>
              </div>
              {/* Description */}
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontWeight: 300, flexShrink: 0, margin: 0 }}>
                {step.desc}
              </p>
              {/* Visual preview */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <Visual />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 4 — Live leaderboard
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '12px 24px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* LB header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} style={{ color: '#fed700' }} />
            <span style={{ fontWeight: 100, fontSize: 'clamp(18px,2.2vh,28px)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              Leader<span style={{ color: '#fed700' }}>board</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.07em' }}>
              {total} player{total !== 1 ? 's' : ''}
              {lastRefresh ? ` · ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
            <RefreshCw size={10} style={{ color: 'rgba(255,255,255,0.2)', animation: lbLoading ? 'spin 0.8s linear infinite' : 'none' }} />
          </div>
        </div>

        {/* Rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden', minHeight: 0 }}>
          {lbLoading && lb.length === 0 ? (
            [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 46, borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : lb.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.22)', textAlign: 'center', letterSpacing: '0.06em' }}>
                No participants yet.<br />Be the first to scan!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {lb.map((row, i) => <LeaderRow key={row.id} row={row} i={i} />)}
            </AnimatePresence>
          )}
        </div>

        {/* Prize note */}
        <div style={{ flexShrink: 0, marginTop: 8, textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Top 3 players win exclusive Manriix prizes
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ROW 5 — Bottom QR code (smaller, reminder)
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 28px',
        background: 'rgba(251,178,56,0.03)',
        borderTop: '1px solid rgba(251,178,56,0.1)',
      }}>
        <QrBlock size={56} compact label="SCAN & COMPETE" />
      </section>

    </div>
  );
}
