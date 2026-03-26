import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { playFanfare } from '../lib/sounds.js';
import { useParticipant } from '../context/ParticipantContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const STEPS = [
  { label: 'Register',          key: 'step1_points', done: 'step1_completed' },
  { label: 'Follow Instagram',  key: 'step2_points', done: 'step2_completed' },
  { label: 'Race to Capture',   key: 'step3_points', done: 'step3_completed' },
  { label: 'Video',             key: 'step4_points', done: 'step4_completed' },
];

export default function Complete() {
  const navigate    = useNavigate();
  const { participant } = useParticipant();

  useEffect(() => { playFanfare(); }, []);

  if (!participant) { navigate('/'); return null; }

  const total = participant.total_points || 0;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgb(13,13,13)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <img src="/logo.png" alt="Manriix" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        maxWidth: 520, margin: '0 auto', width: '100%',
      }}>
        {/* Animated grid bg (like manriix.com hero) */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(254,215,0,0.08)',
              border: '1px solid rgba(254,215,0,0.2)',
              borderRadius: 2,
              padding: '5px 16px',
              marginBottom: '1.5rem',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'rgba(254,215,0,0.8)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fed700', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Journey complete
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: 'Inter', fontWeight: 100,
              fontSize: 'clamp(2.5rem, 12vw, 5rem)',
              lineHeight: 0.9, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            You're on<br />
            <span style={{ color: '#fed700' }}>the Board</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontWeight: 300 }}
          >
            Hi <strong style={{ color: '#fff', fontWeight: 500 }}>{participant.first_name}</strong>! Your final score is:
          </motion.p>

          {/* Big score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            style={{ marginBottom: '2rem' }}
          >
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 100,
              fontSize: 'clamp(5rem, 25vw, 9rem)',
              color: '#fed700',
              lineHeight: 1,
              textShadow: '0 0 60px rgba(254,215,0,0.3)',
            }}>
              {total}
            </p>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginTop: '4px',
            }}>
              points
            </p>
          </motion.div>

          {/* Step breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ background:'rgb(20,20,20)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'2px', padding:'1.25rem 1.5rem', textAlign:'left' }}>
              {STEPS.map(({ label, key, done }, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: participant[done] ? '#22c55e' : 'rgba(255,255,255,0.15)',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: participant[done] ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                      {label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: participant[done] ? '#fed700' : 'rgba(255,255,255,0.2)',
                    fontWeight: 500,
                  }}>
                    {participant[done] ? `+${participant[key]}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65, type: 'spring' }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}
          >
            <button
              onClick={() => navigate('/leaderboard')}
              className="btn-primary w-full"
              style={{ fontSize: '14px', padding: '14px' }}
            >
              <Trophy size={16} /> View Leaderboard <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                width:'100%', padding:'14px',
                background:'transparent',
                border:'1px solid rgba(255,255,255,0.18)',
                borderRadius:'2px',
                color:'rgba(255,255,255,0.7)',
                fontFamily:'"JetBrains Mono",monospace',
                fontSize:'12px',
                textTransform:'uppercase',
                letterSpacing:'0.1em',
                cursor:'pointer',
              }}
            >
              Back to home
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
