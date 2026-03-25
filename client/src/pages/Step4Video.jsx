import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Upload, CheckCircle2, ChevronRight, Mic, Square, PlayCircle } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useParticipant } from '../context/ParticipantContext.jsx';
import api from '../lib/api.js';

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

    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      const { data } = await api.post(`/participants/${participant.id}/video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateParticipant(data.participant);
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
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
            Record a short video — this is the <strong style={{ color: '#fed700', fontWeight: 500 }}>most valuable step</strong>.
            Your video could be featured by Manriix!
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
        {mode === 'choose' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setMode('record')}
              className="card"
              style={{ textAlign: 'center', cursor: 'pointer', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mic size={24} style={{ color: '#fed700' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>Record now</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Use camera</p>
            </button>
            <button
              onClick={() => setMode('upload')}
              className="card"
              style={{ textAlign: 'center', cursor: 'pointer', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
              <Upload size={24} style={{ color: '#fbb238' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>Upload file</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>From device</p>
            </button>
          </div>
        )}

        {/* Record mode */}
        {mode === 'record' && !hasVideo && (
          <div className="card mb-4">
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
          <div className="card mb-4">
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(255,255,255,0.15)',
                borderRadius: '2px',
                padding: '2.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '0.75rem',
              }}
            >
              <Upload size={28} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '14px', color: '#fff' }}>Tap to select video</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>MP4, MOV, WEBM · max 200 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <button
              onClick={() => setMode('choose')}
              style={{ width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', padding: '8px', fontFamily: '"JetBrains Mono"' }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Preview of recorded/uploaded video */}
        {hasVideo && preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-4"
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
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
            {loading ? (
              <>Uploading… <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /></>
            ) : (
              <>Claim 300 pts &amp; Finish <ChevronRight size={16} /></>
            )}
          </button>
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
