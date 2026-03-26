/**
 * Display.jsx — Portrait kiosk display (v2 rewrite)
 * Designed for a vertical screen at the event booth.
 *
 * ► Drop your QR image at client/public/qr.png
 * ► Open /display on the screen browser
 *
 * Grid rows: 6vh header | 24vh top-QR | 2fr step-carousel | 1.5fr leaderboard | 9vh bottom-QR
 * Each step card: left = big number + title + meta / right = faithful app-screen recreation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Zap, Instagram, Camera, Video, RefreshCw,
  User, Mail, Building2, ExternalLink, ImagePlus, Mic, Upload, ChevronRight,
} from 'lucide-react';
import api from '../lib/api.js';

// ─── Config ───────────────────────────────────────────────────────────────────
const STEP_MS = 8000;
const LB_MS   = 20_000;

// ─── Rank colours ─────────────────────────────────────────────────────────────
const RC = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

// ─── Design tokens (matches index.css / real app exactly) ────────────────────
const tok = {
  stepBadge: (col, bg, bdr) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:       col ?? '#fbb238',
    background:  bg  ?? 'rgba(251,178,56,0.08)',
    border:      `1px solid ${bdr ?? 'rgba(251,178,56,0.2)'}`,
    borderRadius: 2, padding: '4px 10px',
  }),
  pill: {
    display: 'inline-flex', alignItems: 'center',
    fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#fed700', background: 'rgba(254,215,0,0.1)',
    border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '4px 10px',
  },
  card: {
    background: 'rgb(20,20,20)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 4, padding: '9px 12px', fontSize: 12,
    color: 'rgba(255,255,255,0.85)', fontWeight: 300,
    width: '100%', boxSizing: 'border-box',
  },
  btnPrimary: {
    width: '100%', padding: '11px 16px',
    background: 'linear-gradient(60deg,#fed700,#ffed4a)',
    borderRadius: 2, border: 'none',
    color: '#0d0d0d', fontWeight: 600, fontSize: 12,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    boxSizing: 'border-box',
  },
};

// ─── Shared step-card wrapper ─────────────────────────────────────────────────
function StepLayout({ num, color, Icon, pts, title, titleAccent, desc, children }) {
  return (
    <div style={{
      flex: 1, display: 'grid', gridTemplateColumns: '32% 68%',
      overflow: 'hidden', minHeight: 0,
    }}>
      {/* Left: big number + meta */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '20px 28px 20px 24px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono', fontWeight: 100,
          fontSize: 'clamp(52px,7vh,82px)', color, lineHeight: 1,
          display: 'block', marginBottom: 14,
        }}>
          {String(num).padStart(2, '0')}
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <span style={tok.stepBadge(color, `${color}14`, `${color}40`)}>
            <Icon size={9} /> Step {num} of 4
          </span>
          <span style={tok.pill}>{pts}</span>
        </div>

        <h3 style={{
          fontFamily: 'Inter', fontWeight: 100,
          fontSize: 'clamp(1.5rem,2.8vh,2.6rem)',
          lineHeight: 0.92, color: '#fff',
          textTransform: 'uppercase', letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>
          {title}<br />
          <span style={{ color }}>{titleAccent}</span>
        </h3>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
          {desc}
        </p>
      </div>

      {/* Right: app screen */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '16px 24px', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Field component (matches .input from real app) ───────────────────────────
function Field({ label, value, show, IconEl }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        ...tok.input,
        transition: 'border-color 0.35s',
        borderColor: show ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.1)',
        position: 'relative',
        paddingLeft: IconEl ? 30 : 12,
      }}>
        {IconEl && (
          <IconEl size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)' }} />
        )}
        <motion.span animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.38 }}>
          {value}
        </motion.span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Register (mirrors Step1Register.jsx)
// ═══════════════════════════════════════════════════════════════════════════════
function Step1Screen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const delays = [700, 550, 550, 550, 700, 2200];
    const t = setTimeout(() => setPhase(p => p >= 5 ? 0 : p + 1), delays[phase] ?? 600);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <StepLayout num={1} color="#fbb238" Icon={Zap} pts="+100 pts"
      title="Tell Us" titleAccent="About You"
      desc="Register your name, email & company to start competing instantly.">

      <div style={{ ...tok.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="First Name *"  value="Kavin"  show={phase >= 1} IconEl={User} />
          <Field label="Last Name *"   value="Perera" show={phase >= 1} IconEl={User} />
        </div>
        <Field label="Company (optional)" value="EV Drive Lanka"      show={phase >= 2} IconEl={Building2} />
        <Field label="Email Address *"    value="kavin@example.com"   show={phase >= 3} IconEl={Mail} />

        <motion.div
          style={tok.btnPrimary}
          animate={{ opacity: phase >= 4 ? 1 : 0.35 }}
          transition={{ duration: 0.3 }}
        >
          Continue <ChevronRight size={14} />
        </motion.div>

        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ padding: '9px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 11, color: '#22c55e', textAlign: 'center', letterSpacing: '0.06em' }}
            >
              ✓  REGISTERED  ·  +100 PTS UNLOCKED
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Follow on Instagram (mirrors Step2Instagram.jsx)
// ═══════════════════════════════════════════════════════════════════════════════
function Step2Screen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const delays = [2400, 1800, 1600, 1000];
    const t = setTimeout(() => setPhase(p => p >= 3 ? 0 : p + 1), delays[phase] ?? 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const followed = phase >= 1;

  return (
    <StepLayout num={2} color="#e1306c" Icon={Instagram} pts="+150 pts"
      title="Follow" titleAccent="@Manriix"
      desc="Follow @manriix_ on Instagram and upload a screenshot as proof.">

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Instagram card — mirrors real Step2 card exactly */}
        <div style={{ ...tok.card, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Instagram size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#fff', margin: '0 0 2px' }}>Open Instagram</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>and follow @manriix_</p>
            </div>
          </div>
          <motion.div
            animate={{
              background: followed ? 'rgba(34,197,94,0.08)' : 'linear-gradient(60deg,#fed700,#ffed4a)',
              color: followed ? '#22c55e' : '#0d0d0d',
            }}
            transition={{ duration: 0.35 }}
            style={{ ...tok.btnPrimary, borderRadius: 2, border: followed ? '1px solid rgba(34,197,94,0.2)' : 'none' }}
          >
            {followed
              ? <><span>✓</span> Following @manriix_</>
              : <>Open @Manriix on Instagram <ExternalLink size={13} /></>}
          </motion.div>
        </div>

        {/* Upload zone — mirrors dashed zone in Step2 */}
        <div style={{ ...tok.card, padding: '14px 16px' }}>
          <p style={{ fontWeight: 600, fontSize: 12, color: '#fff', margin: '0 0 10px' }}>
            Upload your follow screenshot
          </p>
          <div style={{
            border: `2px dashed ${phase >= 2 ? 'rgba(251,178,56,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8, padding: '16px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            background: phase >= 2 ? 'rgba(251,178,56,0.04)' : 'transparent',
            transition: 'all 0.4s',
          }}>
            <AnimatePresence mode="wait">
              {phase < 2 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImagePlus size={16} color="rgba(255,255,255,0.35)" />
                  </div>
                  <p style={{ fontSize: 12, color: '#fff', margin: 0, fontWeight: 500 }}>Tap to upload screenshot</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'JetBrains Mono' }}>PNG or JPG · max 10 MB</p>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>📷</span>
                  <p style={{ fontSize: 12, color: '#fbb238', fontWeight: 600, margin: 0 }}>Screenshot ready ✓</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {phase >= 3 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={tok.btnPrimary}>
              Claim 150 pts &amp; Continue <ChevronRight size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Race to Capture (mirrors Step3Game.jsx)
// ═══════════════════════════════════════════════════════════════════════════════
function Step3Screen() {
  const CARS = [
    { y: '18%', dur: 3.2, delay: 0,   emoji: '🚗' },
    { y: '52%', dur: 2.6, delay: 1.1, emoji: '🚕' },
    { y: '82%', dur: 3.8, delay: 0.4, emoji: '🚙' },
  ];

  return (
    <StepLayout num={3} color="#fed700" Icon={Camera} pts="15 pts / capture"
      title="Race to" titleAccent="Capture"
      desc="Tap cars as they zoom past. Capture the Manriix robot for a ×2 or ×3 score multiplier. 15 seconds only!">

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Instructions panel — mirrors rgb(14,14,14) card from Step3 */}
        <div style={{ background: 'rgb(14,14,14)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, padding: '10px 14px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 7px' }}>
            How to play
          </p>
          {[
            'Wait for a car to enter the viewfinder in the centre — tap to capture it.',
            'Spot the Manriix robot to unlock a ×2 or ×3 score multiplier for your next 3 captures.',
            '15 seconds only — one attempt — most captures wins.',
          ].map((txt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 5 : 0 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#fbb238', fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>{i + 1}</span>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', margin: 0, lineHeight: 1.5, fontWeight: 300 }}>{txt}</p>
            </div>
          ))}
        </div>

        {/* Game canvas area — animated preview */}
        <div style={{ position: 'relative', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', minHeight: 110, flex: 1 }}>
          {/* Lane dividers */}
          {[34, 67].map(p => (
            <div key={p} style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(255,255,255,0.04)', top: `${p}%` }} />
          ))}

          {/* Cars animate left → right */}
          {CARS.map((c, i) => (
            <motion.div key={i}
              style={{ position: 'absolute', top: c.y, fontSize: 22, transform: 'translateY(-50%)', zIndex: 3 }}
              animate={{ x: ['-30px', '110%'] }}
              transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'linear' }}
            >
              {c.emoji}
            </motion.div>
          ))}

          {/* Crosshair (central viewfinder — matches GameCanvas) */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 48, height: 48, zIndex: 5, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(254,215,0,0.7)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(254,215,0,0.7)' }} />
            {/* Corner brackets */}
            {[
              { top: 0, left: 0,   borderTop: true,    borderLeft: true   },
              { top: 0, right: 0,  borderTop: true,    borderRight: true  },
              { bottom: 0, left: 0,  borderBottom: true, borderLeft: true  },
              { bottom: 0, right: 0, borderBottom: true, borderRight: true },
            ].map((b, i) => (
              <div key={i} style={{
                position: 'absolute', width: 9, height: 9,
                ...(b.top    !== undefined ? { top: b.top }       : {}),
                ...(b.bottom !== undefined ? { bottom: b.bottom } : {}),
                ...(b.left   !== undefined ? { left: b.left }     : {}),
                ...(b.right  !== undefined ? { right: b.right }   : {}),
                borderTop:    b.borderTop    ? '2px solid rgba(254,215,0,0.85)' : 'none',
                borderBottom: b.borderBottom ? '2px solid rgba(254,215,0,0.85)' : 'none',
                borderLeft:   b.borderLeft   ? '2px solid rgba(254,215,0,0.85)' : 'none',
                borderRight:  b.borderRight  ? '2px solid rgba(254,215,0,0.85)' : 'none',
              }} />
            ))}
          </div>

          {/* +15 score pop */}
          <motion.span
            style={{ position: 'absolute', right: 16, top: 18, fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: '#fed700', zIndex: 6 }}
            animate={{ y: [0, -26], opacity: [0, 1, 0] }}
            transition={{ duration: 1.0, repeat: Infinity, delay: 1.3, ease: 'easeOut' }}
          >
            +15
          </motion.span>

          {/* HUD labels */}
          <div style={{ position: 'absolute', top: 6, left: 10, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em' }}>RACE TO CAPTURE</div>
          <div style={{ position: 'absolute', top: 6, right: 10, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(254,215,0,0.45)', letterSpacing: '0.1em' }}>15 SEC</div>

          {/* Timer bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg,#fed700,#fbb238)', borderRadius: '0 2px 2px 0' }}
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Record a Hype Video (mirrors Step4Video.jsx)
// ═══════════════════════════════════════════════════════════════════════════════
const PROMPT_TEXT = `"I'm so excited to be here at the Motor and EV Technology Show 2026 — meet Manriix, Sri Lanka's first autonomous photography and advertising robot!"`;

function Step4Screen() {
  const [mode, setMode] = useState('choose'); // choose | record | done
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (mode === 'choose') {
      const t = setTimeout(() => { setMode('record'); setSecs(0); }, 2400);
      return () => clearTimeout(t);
    }
    if (mode === 'record') {
      if (secs >= 12) {
        const t = setTimeout(() => setMode('done'), 500);
        return () => clearTimeout(t);
      }
      const id = setInterval(() => setSecs(s => s + 1), 380);
      return () => clearInterval(id);
    }
    if (mode === 'done') {
      const t = setTimeout(() => { setMode('choose'); setSecs(0); }, 3200);
      return () => clearTimeout(t);
    }
  }, [mode, secs]);

  const timer = `0:${String(secs).padStart(2, '0')}`;

  return (
    <StepLayout num={4} color="#fbb238" Icon={Video} pts="+300 pts ⭐"
      title="Share Your" titleAccent="Excitement"
      desc="Film a short hype video with Manriix and upload it. The most valuable step — worth 300 points!">

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Script card — matches real darkCard + gold border from Step4 */}
        <div style={{ ...tok.card, borderColor: 'rgba(254,215,0,0.2)', background: 'rgba(254,215,0,0.04)', padding: '12px 16px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,215,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>
            Say this in your video
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 300, margin: 0 }}>
            {PROMPT_TEXT}
          </p>
        </div>

        {/* Mode view */}
        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* 2-col grid — matches real Step4 choose layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { I: Mic,    label: 'Record now', sub: 'Use camera',  col: '#fed700', bg: 'rgba(254,215,0,0.1)',  bdr: 'rgba(254,215,0,0.2)'  },
                  { I: Upload, label: 'Upload file', sub: 'From device', col: '#fbb238', bg: 'rgba(251,178,56,0.1)', bdr: 'rgba(251,178,56,0.2)' },
                ].map(({ I, label, sub, col, bg, bdr }) => (
                  <div key={label} style={{ ...tok.card, padding: '18px 10px', textAlign: 'center', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 2, background: bg, border: `1px solid ${bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <I size={18} style={{ color: col }} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#fff', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'JetBrains Mono' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {mode === 'record' && (
            <motion.div key="record" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ ...tok.card, padding: '14px 16px' }}>
                {/* Fake viewfinder */}
                <div style={{ width: '100%', height: 80, background: '#000', borderRadius: 2, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <span style={{ fontSize: 28 }}>🤳</span>
                  {/* REC badge */}
                  <div style={{ position: 'absolute', top: 7, right: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <motion.div animate={{ opacity: [1, 0.1, 1] }} transition={{ duration: 0.85, repeat: Infinity }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#ef4444', letterSpacing: '0.1em' }}>REC</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 7, left: 9, fontFamily: 'JetBrains Mono', fontSize: 14, color: '#fff', fontWeight: 300 }}>{timer}</div>
                </div>
                {/* Recording progress */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg,#ef4444,#fbb238)', borderRadius: 2 }}
                    animate={{ width: `${Math.min((secs / 15) * 100, 100)}%` }}
                    transition={{ duration: 0.38 }}
                  />
                </div>
                {/* Stop button — matches real app style */}
                <div style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 2, color: '#f87171', fontFamily: 'JetBrains Mono', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', cursor: 'default' }}>
                  ■ Stop Recording
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div style={{ ...tok.card, borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.03)', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: 30, margin: '0 0 10px' }}>🎉</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#22c55e', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                  Video ready — uploading…
                </p>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                  <motion.div style={{ height: '100%', background: '#fed700', borderRadius: 2 }}
                    initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.6 }} />
                </div>
                <div style={tok.btnPrimary}>Claim 300 pts &amp; Finish <ChevronRight size={14} /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepLayout>
  );
}

// ─── Step registry ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, color: '#fbb238', Screen: Step1Screen },
  { id: 2, color: '#e1306c', Screen: Step2Screen },
  { id: 3, color: '#fed700', Screen: Step3Screen },
  { id: 4, color: '#fbb238', Screen: Step4Screen },
];

// ─── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderRow({ row, i }) {
  const color = RC[row.rank] ?? 'rgba(255,255,255,0.32)';
  const dots  = [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.22 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 14px',
        background: row.rank <= 3 ? `${RC[row.rank]}0c` : 'rgba(255,255,255,0.02)',
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
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
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

// ─── QR block (shared top + bottom) ──────────────────────────────────────────
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

      {/* Speed lines BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', height: 1, background: 'rgba(251,178,56,0.07)', top: `${10 + i * 15}%`, width: 50 + i * 24 }}
            animate={{ x: ['-200px', '110vw'] }}
            transition={{ duration: 1.6 + (i % 3) * 0.4, repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
          />
        ))}
      </div>

      {/* ROW 1 — Header */}
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

      {/* ROW 2 — Top QR */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)',
      }}>
        <QrBlock size={132} compact={false} />
      </section>

      {/* ROW 3 — Step carousel */}
      <section style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden', minHeight: 0,
      }}>
        {/* Section label + progress dots */}
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

        {/* Animated step */}
        <div style={{
          flex: 1, overflow: 'hidden', minHeight: 0,
          background: `${step.color}04`,
          borderLeft: `3px solid ${step.color}45`,
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <step.Screen />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ROW 4 — Leaderboard */}
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

      {/* ROW 5 — Bottom QR */}
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
