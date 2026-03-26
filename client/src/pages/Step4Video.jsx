import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, CheckCircle2, ChevronRight, Mic, Square } from 'lucide-react';

// Explicit dark card style — avoids button/forms-plugin white background conflicts
const darkCard = {
  background: 'rgb(20,20,20)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '2px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};
import Layout from '../components/Layout.jsx';
import { useParticipant } from '../context/ParticipantContext.jsx';
import api from '../lib/api.js';
import { playFanfare } from '../lib/sounds.js';

const PROMPT = `"I'm so excited to be here at the Colombo Motor Show 2026 — and even more excited to meet Manriix, Sri Lanka's first autonomous photography and advertising robot!"`;

export default function Step4Video() {
  const navigate = useNavigate();
  const { participant, updateParticipant } = useParticipant();

  const [mode, setMode]           = useState('choose'); // choose | record | upload
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded]   = useState(null);     // blob
  const [uploaded, setUploaded]   = useState(null);     // file
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError]         = useState('');
  const fileRef      = useRef(null);
  const mediaRef     = useRef(null);
  const streamRef    = useRef(null);
  const chunksRef    = useRef([]);
  const videoPreview = useRef(null);

  if (!participant) { navigate('/step/1'); return null; }

  // ── Browser recording ──────────────────────────────────────────────────────
  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoPreview.current) {
        videoPreview.current.srcObject = stream;
        videoPreview.current.play();
      }
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecorded(blob);
        setPreview(URL.createObjectURL(blob));
        // stop stream
        stream.getTracks().forEach(t => t.stop());
        if (videoPreview.current) videoPreview.current.srcObject = null;
      };
      mr.start();
      setRecording(true);
    } catch {
      setError('Camera access denied. Please use the upload option instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      setRecording(false);
    }
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('Please select a video file.'); return; }
    if (f.size > 200 * 1024 * 1024) { setError('Video must be under 200 MB.'); return; }
    setUploaded(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const videoFile = uploaded
      ? uploaded
      : recorded
        ? new File([recorded], 'recording.webm', { type: 'video/webm' })
        : null;

    if (!videoFile) { setError('Please record or upload a video first.'); return; }

    setLoading(true); setUploadPct(0); setError('');
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      const { data } = await api.post(`/participants/${participant.id}/video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
        },
      });
      updateParticipant(data.participant);
      playFanfare();
      navigate('/complete');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasVideo = recorded || uploaded;

  return (
    <Layout step={4}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="step-badge" style={{ color: '#fed700', background: 'rgba(254,215,0,0.1)', borderColor: 'rgba(254,215,0,0.25)' }}>
              <Video size={11} /> Step 4 of 4
            </span>
            <span className="points-pill" style={{ fontSize: '13px', fontWeight: 700 }}>+300 pts</span>
          </div>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 100,
            fontSize: 'clamp(2rem, 8vw, 3rem)', lineHeight: 0.9,
            color: '#fff', textTransform: 'uppercase',
            letterSpacing: '-0.02em', marginBottom: '0.5rem',
          }}>
            Share Your<br />
            <span style={{ color: '#fed700' }}>Excitement</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.6 }}>
            Record a short video — this is the <strong style={{ color: '#fed700', fontWeight: 500 }}>most valuable step</strong>.
            Keep it <strong style={{ color: '#fff', fontWeight: 400 }}>under 30 seconds</strong> for fastest upload.
          </p>
        </div>

        {/* Script card */}
        <div className="card mb-4" style={{ borderColor: 'rgba(254,215,0,0.2)', background: 'rgba(254,215,0,0.04)' }}>
          <p style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: 'rgba(255,215,0,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '0.75rem',
          }}>
            Say this in your video
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic', fontWeight: 300 }}>
            {PROMPT}
          </p>
        </div>

        {/* Choose mode */}
        {mode === 'choose' && !hasVideo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              onClick={() => setMode('record')}
              style={{ ...darkCard, padding: '1.75rem 1rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(254,215,0,0.3)'; e.currentTarget.style.boxShadow='rgba(254,215,0,0.08) 0 0 20px -6px inset'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ width:46,height:46,borderRadius:'2px',background:'rgba(254,215,0,0.1)',border:'1px solid rgba(254,215,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Mic size={20} style={{ color: '#fed700' }} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff', margin: 0 }}>Record now</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily:'"JetBrains Mono"' }}>Use camera</p>
            </div>
            <div
              onClick={() => setMode('upload')}
              style={{ ...darkCard, padding: '1.75rem 1rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(251,178,56,0.3)'; e.currentTarget.style.boxShadow='rgba(251,178,56,0.08) 0 0 20px -6px inset'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ width:46,height:46,borderRadius:'2px',background:'rgba(251,178,56,0.1)',border:'1px solid rgba(251,178,56,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Upload size={20} style={{ color: '#fbb238' }} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff', margin: 0 }}>Upload file</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily:'"JetBrains Mono"' }}>From device</p>
            </div>
          </div>
        )}

        {/* Record mode */}
        {mode === 'record' && !hasVideo && (
          <div style={{ ...darkCard, padding: '1.25rem', marginBottom: '1rem' }}>
            {/* Video preview */}
            <video
              ref={videoPreview}
              muted
              playsInline
              style={{ width: '100%', borderRadius: '2px', background: '#000', maxHeight: '200px', objectFit: 'cover', marginBottom: '1rem' }}
            />
            {!recording ? (
              <button onClick={startRecording} className="btn-primary w-full" style={{ marginBottom: '0.5rem' }}>
                <Mic size={16} /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  width: '100%', padding: '12px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '2px',
                  color: '#f87171',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <Square size={14} /> Stop Recording
              </button>
            )}
            <button
              onClick={() => setMode('choose')}
              style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', padding: '8px', fontFamily: '"JetBrains Mono"' }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Upload mode */}
        {mode === 'upload' && !hasVideo && (
          <div style={{ ...darkCard, padding: '1.25rem', marginBottom: '1rem' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '2px', padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(254,215,0,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
            >
              <div style={{ width:46,height:46,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem' }}>
                <Upload size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
              <p style={{ fontSize: '14px', color: '#fff', margin: '0 0 4px', fontWeight: 400 }}>Tap to select video</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily:'"JetBrains Mono"' }}>MP4 · MOV · WEBM · max 200 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setMode('choose')} style={{ background:'none',border:'none',color:'rgba(255,255,255,0.25)',fontSize:'11px',cursor:'pointer',fontFamily:'"JetBrains Mono"',letterSpacing:'0.06em' }}>← Back</button>
            </div>
          </div>
        )}

        {/* Preview of recorded/uploaded video */}
        {hasVideo && preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...darkCard, borderColor:'rgba(34,197,94,0.2)', background:'rgba(34,197,94,0.03)', padding:'1.25rem', marginBottom:'1rem' }}
          >
            <video
              src={preview}
              controls
              playsInline
              style={{ width: '100%', borderRadius: '2px', maxHeight: '220px', objectFit: 'cover', marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '13px', color: '#22c55e', fontFamily: '"JetBrains Mono"', fontWeight: 500 }}>
                Video ready
              </span>
            </div>
            <button
              onClick={() => { setRecorded(null); setUploaded(null); setPreview(null); setMode('choose'); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', cursor: 'pointer', fontFamily: '"JetBrains Mono"', padding: 0 }}
            >
              Record / upload again
            </button>
          </motion.div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '2px', padding: '0.75rem 1rem', fontSize: '14px',
            color: '#f87171', marginBottom: '1rem',
          }}>{error}</div>
        )}

        {hasVideo && (
          <>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
              {loading
                ? <>Uploading {uploadPct > 0 ? `${uploadPct}%` : '…'} <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /></>
                : <>Claim 300 pts &amp; Finish <ChevronRight size={16} /></>}
            </button>
            {loading && (
              <div style={{ marginTop: '0.5rem', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadPct}%`, background: '#fed700', transition: 'width 0.3s', borderRadius: 2 }} />
              </div>
            )}
          </>
        )}

        {/* Skip */}
        <button
          onClick={() => navigate('/complete')}
          style={{ width: '100%', marginTop: '0.75rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '11px', cursor: 'pointer', fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px' }}
        >
          Skip (miss 300 pts)
        </button>
      </motion.div>
    </Layout>
  );
}
