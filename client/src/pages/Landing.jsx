import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Camera, Instagram, Video, ChevronRight, Zap } from 'lucide-react';
import { useParticipant } from '../context/ParticipantContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { playClick } from '../lib/sounds.js';

const STEPS = [
  { icon: Zap,       label: 'Register',        pts: '100 pts',  color: '#fbb238' },
  { icon: Instagram, label: 'Follow Instagram', pts: '150 pts',  color: '#e1306c' },
  { icon: Camera,    label: 'Race to Capture',  pts: '15 pts / capture', color: '#fed700' },
  { icon: Video,     label: 'Record your hype', pts: '300 pts',  color: '#fbb238', hot: true },
];

export default function Landing() {
  const navigate = useNavigate();
  const { participant, getResumeStep } = useParticipant();

  const handleStart = () => {
    playClick();
    if (participant) {
      const next = getResumeStep();
      if (next) navigate(`/step/${next}`);
      else navigate('/complete');
    } else {
      navigate('/step/1');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-dark-bg dark:bg-dark-bg">

      {/* ── Animated speed lines background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-brand-orange/20"
            style={{ top: `${8 + i * 9}%`, left: '-100%', width: `${60 + (i % 5) * 20}px` }}
            animate={{ left: ['−200px', '120vw'] }}
            transition={{
              duration: 1.2 + (i % 3) * 0.4,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'linear',
            }}
          />
        ))}
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-96 h-96 rounded-full blur-3xl opacity-10"
             style={{ background: 'radial-gradient(circle, #fbb238 0%, transparent 70%)' }} />
      </div>

      {/* ── Header ── */}
      <header className="relative flex items-center justify-between px-5 pt-6 pb-2">
        <img src="/logo.png" alt="Manriix" className="h-8 w-auto"
             style={{ filter: 'brightness(0) invert(1)' }} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leaderboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange
                       border border-brand-orange/30 rounded-lg px-3 py-1.5
                       hover:bg-brand-orange/10 transition-colors"
          >
            <Trophy size={13} /> Leaderboard
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 py-8 text-center">

        {/* Event badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold
                     bg-brand-orange/10 text-brand-orange border border-brand-orange/25 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          Colombo Motor Show 2026
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display font-black text-white dark:text-white leading-none
                     text-[clamp(3rem,14vw,5rem)] uppercase tracking-tight mb-3"
        >
          Race to<br />
          <span style={{ color: '#fbb238' }}>Capture</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 dark:text-gray-400 max-w-xs leading-relaxed mb-8"
        >
          Complete 4 challenges with&nbsp;
          <span className="text-brand-orange font-semibold">Manriix</span>,
          Sri Lanka's first autonomous photography &amp; advertising robot.
          Top the leaderboard and&nbsp;<span className="text-white font-semibold">win a prize.</span>
        </motion.p>

        {/* Step cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm grid grid-cols-2 gap-3 mb-8"
        >
          {STEPS.map(({ icon: Icon, label, pts, color, hot }, i) => (
            <div
              key={i}
              className="relative rounded-2xl p-4 text-left border bg-dark-card dark:bg-dark-card border-dark-border dark:border-dark-border"
              style={hot ? { borderColor: 'rgba(251,178,56,0.4)', background: 'rgba(251,178,56,0.06)' } : {}}
            >
              {hot && (
                <span className="absolute -top-2 -right-1 bg-brand-orange text-gray-900
                                 text-[10px] font-black px-2 py-0.5 rounded-full">
                  MOST PTS
                </span>
              )}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                   style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-400 leading-snug mb-1">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{pts}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 300 }}
          className="w-full max-w-sm flex flex-col gap-3"
        >
          <button
            onClick={handleStart}
            className="btn-primary w-full text-lg py-4 font-display font-bold uppercase tracking-wider animate-pulse-glow"
          >
            {participant ? 'Resume My Journey' : 'Start Your Journey'}
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="btn-secondary w-full text-sm"
          >
            <Trophy size={15} /> View Leaderboard
          </button>
        </motion.div>

        {/* Max points hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-5 text-xs text-gray-600 dark:text-gray-600"
        >
          Up to <span className="text-brand-yellow font-bold">700 points</span> available
        </motion.p>
      </div>
    </div>
  );
}
