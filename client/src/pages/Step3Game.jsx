import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useParticipant } from '../context/ParticipantContext.jsx';
import GameCanvas from '../game/GameCanvas.jsx';
import api from '../lib/api.js';
import { useState } from 'react';

export default function Step3Game() {
  const navigate = useNavigate();
  const { participant, updateParticipant } = useParticipant();
  const [result, setResult] = useState(null);   // { captures, points } after game ends
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!participant) { navigate('/step/1'); return null; }

  const handleGameComplete = (captures, points) => {
    setResult({ captures, points });
  };

  const handleContinue = async () => {
    if (!result) return;
    setSaving(true); setError('');
    try {
      const { data } = await api.post(`/participants/${participant.id}/game`, {
        captures: result.captures,
        points:   result.points,
      });
      updateParticipant(data.participant);
      navigate('/step/4');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save score. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout step={3}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="step-badge"><Camera size={11} /> Step 3 of 4</span>
            <span className="points-pill">15 pts / capture</span>
            <span className="points-pill" style={{ background: 'rgba(251,178,56,0.15)', color: '#fbb238', border: '1px solid rgba(251,178,56,0.3)' }}>×2–×3 robots</span>
          </div>
          <h2 style={{
            fontFamily: 'Inter',
            fontWeight: 100,
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            lineHeight: 0.9,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
          }}>
            Race to<br />
            <span style={{ color: '#fed700' }}>Capture</span>
          </h2>
          {result && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              Round complete! See your score below.
            </p>
          )}
        </div>

        {/* Instructions — shown before the game starts */}
        {!result && (
          <div style={{ background: 'rgb(14,14,14)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.75rem' }}>How to play</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                'Wait for a car to enter the viewfinder in the centre of the screen.',
                'Tap the screen to capture it - timing is everything.',
                'Spot the Manriix robot and capture it to unlock a x2 or x3 score multiplier for your next 3 captures.',
                '15 seconds only - one attempt - most points wins.',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: '#fbb238', fontWeight: 700, minWidth: 16, paddingTop: 1, flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55, fontWeight: 300 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game area */}
        {!result ? (
          <GameCanvas onComplete={handleGameComplete} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260 }}
          >
            {/* Score reveal */}
            <div style={{ background:'rgb(20,20,20)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'2px', padding:'2.5rem 1.5rem', textAlign:'center', marginBottom:'1rem' }}>
              <p className="section-label mx-auto mb-4">Round Complete</p>
              <p style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 100,
                fontSize: 'clamp(4rem, 20vw, 7rem)',
                color: '#fed700',
                lineHeight: 1,
              }}>
                {result.captures}
              </p>
              <p style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginTop: '0.5rem',
              }}>
                {result.captures === 1 ? 'capture' : 'captures'}
              </p>
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(254,215,0,0.08)',
                border: '1px solid rgba(254,215,0,0.2)',
                borderRadius: '2px',
                display: 'inline-block',
              }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: '#fed700',
                }}>
                  +{result.points} pts
                </span>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '2px',
                padding: '0.75rem 1rem',
                fontSize: '14px',
                color: '#f87171',
                marginBottom: '1rem',
              }}>{error}</div>
            )}

            <button onClick={handleContinue} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : <>Save Score & Continue <ChevronRight size={16} /></>}
            </button>

            <p style={{
              textAlign: 'center',
              marginTop: '0.75rem',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: '"JetBrains Mono", monospace',
            }}>
              Best score wins — one attempt only
            </p>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
