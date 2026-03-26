import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, ChevronRight, Play } from 'lucide-react';
import { useParticipant } from '../context/ParticipantContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import api from '../lib/api.js';

const RANK_STYLE = {
  1: { color: '#FFD700', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)', label: '01' },
  2: { color: '#C0C0C0', bg: 'rgba(192,192,192,0.06)', border: 'rgba(192,192,192,0.2)', label: '02' },
  3: { color: '#CD7F32', bg: 'rgba(205,127,50,0.06)', border: 'rgba(205,127,50,0.2)', label: '03' },
};

function formatRank(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function completionDots(row) {
  return [row.step1_completed, row.step2_completed, row.step3_completed, row.step4_completed];
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { participant } = useParticipant();

  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data: res } = await api.get('/leaderboard');
      setData(res.leaderboard);
      setTotal(res.total);
      setLastRefresh(new Date());
    } catch {
      setError('Could not load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  // Find current user rank
  const myRank = participant ? data.find(r => r.id === participant.id)?.rank : null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <img src="/logo.png" alt="Manriix" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={load}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 2, padding: '6px 10px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            <RefreshCw size={12} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem 5rem' }}>
        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(254,215,0,0.08)',
            border: '1px solid rgba(254,215,0,0.2)',
            borderRadius: 2, padding: '4px 14px',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'rgba(254,215,0,0.7)',
            marginBottom: '1rem',
          }}>
            <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
            Live · {total} participant{total !== 1 ? 's' : ''}
          </div>
          <h1 style={{
            fontFamily: 'Inter', fontWeight: 100,
            fontSize: 'clamp(2.5rem, 12vw, 4.5rem)',
            lineHeight: 0.9, color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}>
            Leader<br /><span style={{ color: '#fed700' }}>board</span>
          </h1>
          {lastRefresh && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, fontFamily: '"JetBrains Mono"' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* My rank highlight */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(254,215,0,0.06)',
              border: '1px solid rgba(254,215,0,0.2)',
              borderRadius: 2, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }}>Your rank</span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 20, fontWeight: 500, color: '#fed700',
            }}>
              {formatRank(myRank)}
            </span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 2, padding: '0.75rem 1rem', fontSize: 13,
            color: '#f87171', marginBottom: '1rem',
            fontFamily: '"JetBrains Mono", monospace',
          }}>{error}</div>
        )}

        {/* Loading skeleton */}
        {loading && data.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                background: 'rgb(20,20,20)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 2, padding: '1rem',
                height: 72,
                animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        )}

        {/* Leaderboard rows */}
        <AnimatePresence>
          {data.map((row, i) => {
            const rs = RANK_STYLE[row.rank] || { color: 'rgba(255,255,255,0.3)', bg: 'transparent', border: 'rgba(255,255,255,0.06)', label: String(row.rank).padStart(2,'0') };
            const isMe = participant && row.id === participant.id;
            const dots = completionDots(row);
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                style={{
                  background: isMe ? 'rgba(254,215,0,0.05)' : rs.bg,
                  border: `1px solid ${isMe ? 'rgba(254,215,0,0.3)' : rs.border}`,
                  borderRadius: 2,
                  padding: '14px 16px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Rank */}
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 100,
                  fontSize: row.rank <= 3 ? 28 : 18,
                  color: rs.color,
                  lineHeight: 1,
                  minWidth: 36,
                  flexShrink: 0,
                }}>
                  {rs.label}
                </span>

                {/* Name / company */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 400, color: '#fff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 4,
                  }}>
                    {row.first_name} {row.last_name}
                    {isMe && <span style={{ marginLeft: 8, fontSize: 10, color: '#fed700', fontFamily: '"JetBrains Mono"', border: '1px solid rgba(254,215,0,0.3)', padding: '1px 6px', borderRadius: 2 }}>YOU</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {row.company_name && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: '"JetBrains Mono"', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                        {row.company_name}
                      </span>
                    )}
                    {/* Step completion dots */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {dots.map((done, di) => (
                        <span key={di} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: done ? (di === 3 ? '#fed700' : '#22c55e') : 'rgba(255,255,255,0.12)',
                          display: 'inline-block',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 18, fontWeight: 500,
                  color: rs.color,
                  flexShrink: 0,
                }}>
                  {row.total_points}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && data.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Trophy size={36} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: '"JetBrains Mono"' }}>
              No participants yet. Be the first!
            </p>
          </div>
        )}

        {/* CTA for non-participants */}
        {!participant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: '2rem' }}
          >
            <button
              onClick={() => navigate('/step/1')}
              className="btn-primary w-full"
              style={{ fontSize: 14 }}
            >
              <Play size={14} /> Join the competition <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
