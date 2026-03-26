import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Video, Image, Lock, Trash2, Shuffle, Trophy } from 'lucide-react';
import api from '../lib/api.js';

const STEPS = ['Reg', 'IG', 'Game', 'Video'];
const stepKeys = ['step1_completed','step2_completed','step3_completed','step4_completed'];

function Dot({ done, gold }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: done ? (gold ? '#fed700' : '#22c55e') : 'rgba(255,255,255,0.1)',
      flexShrink: 0,
    }} />
  );
}

export default function Admin() {
  const [secret, setSecret]   = useState('');
  const [authed, setAuthed]   = useState(false);
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [drawState, setDrawState] = useState({ phase: 'idle', winner: null, highlightIdx: -1 });
  const drawTimerRef = useRef(null);

  // Reset draw whenever the participant list changes
  useEffect(() => {
    setDrawState({ phase: 'idle', winner: null, highlightIdx: -1 });
  }, [data]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (drawTimerRef.current) clearTimeout(drawTimerRef.current); }, []);

  const load = useCallback(async (key) => {
    setLoading(true); setError('');
    try {
      const { data: res } = await api.get('/admin/participants', {
        headers: { 'x-admin-secret': key },
      });
      setData(res.participants);
      setTotal(res.total);
      setAuthed(true);
    } catch (err) {
      const msg = err.response?.status === 401 ? 'Wrong password.' : 'Failed to load.';
      setError(msg);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    load(secret);
  };

  const downloadCSV = () => {
    const url = `/api/admin/participants.csv?secret=${encodeURIComponent(secret)}`;
    window.open(url, '_blank');
  };

  const deleteParticipant = async (p) => {
    if (!window.confirm(`Delete ${p.first_name} ${p.last_name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/participants/${p.id}`, { headers: { 'x-admin-secret': secret } });
      setData(prev => prev.filter(x => x.id !== p.id));
      setTotal(prev => prev - 1);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const runDraw = useCallback((tiedLeaders) => {
    if (tiedLeaders.length < 2) return;
    if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    const n = tiedLeaders.length;
    const winnerIdx = Math.floor(Math.random() * n);
    const totalSteps = n * 4 + winnerIdx; // 4 full rounds then land on winner
    let step = 0;
    setDrawState({ phase: 'spinning', winner: null, highlightIdx: 0 });
    const tick = () => {
      step++;
      const curIdx = step % n;
      const progress = step / totalSteps;
      const delay = 60 + Math.pow(progress, 1.8) * 540; // ease out 60ms → 600ms
      if (step >= totalSteps) {
        setDrawState({ phase: 'done', winner: tiedLeaders[winnerIdx], highlightIdx: winnerIdx });
      } else {
        setDrawState(prev => ({ ...prev, highlightIdx: curIdx }));
        drawTimerRef.current = setTimeout(tick, delay);
      }
    };
    drawTimerRef.current = setTimeout(tick, 60);
  }, []);

  const resetDraw = () => {
    if (drawTimerRef.current) clearTimeout(drawTimerRef.current);
    setDrawState({ phase: 'idle', winner: null, highlightIdx: -1 });
  };

  // ── Login gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Manriix" style={{ height: 28, filter: 'brightness(0) invert(1)', margin: '0 auto 1.5rem', display: 'block' }} />
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Admin Dashboard
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Admin password"
                className="input"
                style={{ paddingLeft: 38 }}
                autoFocus
              />
            </div>
            {error && (
              <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '0.75rem', fontFamily: '"JetBrains Mono"' }}>{error}</p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading || !secret}>
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const videoCount    = data.filter(p => p.step4_completed).length;
  const igCount       = data.filter(p => p.step2_completed).length;
  const avgScore      = total ? Math.round(data.reduce((s, p) => s + p.total_points, 0) / total) : 0;
  const maxScore      = data.length > 0 ? data[0].total_points : 0;
  const tiedLeaders   = data.filter(p => p.total_points === maxScore);
  const hasTie        = tiedLeaders.length >= 2;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: 'rgb(13,13,13)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo.png" alt="Manriix" style={{ height: 24, filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'rgba(255,215,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(254,215,0,0.1)', border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '6px 12px', color: '#fed700', fontSize: '12px', cursor: 'pointer', fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Download size={12} /> Export CSV
          </button>
          <button onClick={() => load(secret)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2, padding: '6px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer', fontFamily: '"JetBrains Mono"' }}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Participants', value: total, color: '#fff' },
            { label: 'Videos submitted', value: videoCount, color: '#fed700' },
            { label: 'IG followers', value: igCount, color: '#fbb238' },
            { label: 'Avg score', value: avgScore, color: '#22c55e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgb(20,20,20)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, padding: '1rem' }}>
              <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '28px', fontWeight: 100, color, lineHeight: 1, margin: '0 0 4px' }}>{value}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tie Breaker Draw */}
        {hasTie && (
          <div style={{ marginBottom: '1.5rem', background: 'rgb(20,20,20)', border: '1px solid rgba(254,215,0,0.25)', borderRadius: 2, padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(254,215,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Tie Breaker</p>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  {tiedLeaders.length} participants tied at <span style={{ color: '#fed700', fontWeight: 600 }}>{maxScore} pts</span>
                </p>
              </div>
              <button
                onClick={drawState.phase === 'idle' ? () => runDraw(tiedLeaders) : drawState.phase === 'done' ? resetDraw : undefined}
                disabled={drawState.phase === 'spinning'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: drawState.phase === 'done' ? 'rgba(34,197,94,0.1)' : 'rgba(254,215,0,0.1)',
                  border: `1px solid ${drawState.phase === 'done' ? 'rgba(34,197,94,0.35)' : 'rgba(254,215,0,0.35)'}`,
                  borderRadius: 2, padding: '8px 18px',
                  color: drawState.phase === 'done' ? '#22c55e' : '#fed700',
                  fontSize: '12px', cursor: drawState.phase === 'spinning' ? 'default' : 'pointer',
                  fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
                  opacity: drawState.phase === 'spinning' ? 0.6 : 1,
                }}
              >
                {drawState.phase === 'done' ? <Trophy size={12} /> : <Shuffle size={12} />}
                {drawState.phase === 'idle' ? 'Run Draw' : drawState.phase === 'spinning' ? 'Drawing…' : 'Reset'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tiedLeaders.map((p, i) => {
                const isHighlit = drawState.phase === 'spinning' && drawState.highlightIdx === i;
                const isWinner  = drawState.phase === 'done' && drawState.winner?.id === p.id;
                return (
                  <div key={p.id} style={{
                    padding: '8px 14px', borderRadius: 2,
                    border: `1px solid ${isWinner ? 'rgba(254,215,0,0.6)' : isHighlit ? 'rgba(251,178,56,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: isWinner ? 'rgba(254,215,0,0.1)' : isHighlit ? 'rgba(251,178,56,0.08)' : 'transparent',
                    transition: 'border-color 0.06s, background 0.06s',
                  }}>
                    <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: isWinner ? '#fed700' : isHighlit ? '#fbb238' : '#fff', fontWeight: isWinner ? 600 : 400, margin: 0, whiteSpace: 'nowrap' }}>
                      {isWinner && '🏆 '}{p.first_name} {p.last_name}
                    </p>
                    {p.company_name && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', fontFamily: '"JetBrains Mono"' }}>{p.company_name}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'rgb(14,14,14)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {['#','Name','Company','Email','Phone','Score','Steps','Game','Media','Time',''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.25)', fontFamily: '"JetBrains Mono"' }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 400, whiteSpace: 'nowrap' }}>{p.first_name} {p.last_name}</td>
                  <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{p.company_name || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <a href={`mailto:${p.email}`} style={{ color: '#fbb238', textDecoration: 'none' }}>{p.email}</a>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{p.phone || '—'}</td>
                  <td style={{ padding: '10px 14px', fontFamily: '"JetBrains Mono"', color: '#fed700', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.total_points}</td>
                  {/* Step dots */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {stepKeys.map((k, si) => <Dot key={k} done={p[k]} gold={si === 3} />)}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: '"JetBrains Mono"', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                    {p.game_captures ?? 0}×
                  </td>
                  {/* Media links */}
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {p.instagram_screenshot_url && (
                        <a href={p.instagram_screenshot_url} target="_blank" rel="noreferrer"
                           title="Instagram screenshot"
                           style={{ color: '#e1306c', display: 'flex', alignItems: 'center' }}>
                          <Image size={14} />
                        </a>
                      )}
                      {p.video_url && (
                        <a href={p.video_url} target="_blank" rel="noreferrer"
                           title="View video"
                           style={{ color: '#fed700', display: 'flex', alignItems: 'center' }}>
                          <Video size={14} />
                        </a>
                      )}
                      {!p.instagram_screenshot_url && !p.video_url && (
                        <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '11px' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: '"JetBrains Mono"', whiteSpace: 'nowrap' }}>
                    {new Date(p.created_at).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      onClick={() => deleteParticipant(p)}
                      title="Delete participant"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 2, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono"', fontSize: '12px' }}>
                    No participants yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '0.75rem', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: '"JetBrains Mono"' }}>
          Step dots: Reg · IG · Game · <span style={{ color: '#fed700' }}>Video</span> &nbsp;|&nbsp; Click 🎥 or 📷 icons to view media
        </p>
      </div>
    </div>
  );
}
