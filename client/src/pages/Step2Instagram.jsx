import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Upload, CheckCircle2, ChevronRight, ExternalLink, ImagePlus } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { useParticipant } from '../context/ParticipantContext.jsx';
import api from '../lib/api.js';
import { playStepComplete } from '../lib/sounds.js';

const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/manriix_/';

export default function Step2Instagram() {
  const navigate = useNavigate();
  const { participant, updateParticipant } = useParticipant();

  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const inputRef = useRef(null);

  if (!participant) { navigate('/step/1'); return null; }

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (f.size > 10 * 1024 * 1024)   { setError('File must be under 10 MB.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please upload a screenshot first.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      const { data } = await api.post(`/participants/${participant.id}/instagram`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateParticipant(data.participant);
      playStepComplete();
      navigate('/step/3');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout step={2}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="step-badge"><Instagram size={11} /> Step 2 of 4</span>
            <span className="points-pill">+150 pts</span>
          </div>
          <h2 className="font-display font-black text-3xl text-white dark:text-white uppercase tracking-tight leading-tight">
            Follow<br />
            <span style={{ color: '#fbb238' }}>@Manriix</span>
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
            Follow us on Instagram, take a screenshot showing you follow us, then upload it here.
          </p>
        </div>

        {/* Step 1: Open Instagram */}
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
              <Instagram size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white dark:text-white">Open Instagram</p>
              <p className="text-xs text-gray-400">and follow @Manriix</p>
            </div>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-sm py-3"
          >
            Open @Manriix on Instagram <ExternalLink size={14} />
          </a>
        </div>

        {/* Step 2: Upload screenshot */}
        <div className="card mb-4">
          <p className="text-sm font-semibold text-white dark:text-white mb-3">
            Upload your follow screenshot
          </p>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                        flex flex-col items-center justify-center gap-3 py-8
                        ${preview
                          ? 'border-brand-orange/60 bg-brand-orange/5'
                          : 'border-dark-border hover:border-brand-orange/40 hover:bg-dark-surface'}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Screenshot preview"
                     className="max-h-40 rounded-lg object-contain" />
                <p className="text-xs text-brand-orange font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Screenshot ready
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-dark-border flex items-center justify-center">
                  <ImagePlus size={22} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white dark:text-white font-medium">Tap to upload screenshot</p>
                  <p className="text-xs text-gray-500 mt-1">PNG or JPG · max 10 MB</p>
                </div>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>Uploading… <span className="w-4 h-4 border-2 border-gray-900/40 border-t-gray-900 rounded-full animate-spin" /></>
          ) : (
            <>Claim 150 pts &amp; Continue <ChevronRight size={18} /></>
          )}
        </button>

        {/* Skip option (honest — they lose the points) */}
        <button
          onClick={() => navigate('/step/3')}
          className="w-full mt-3 text-xs py-2 transition-colors hover:opacity-80"
          style={{ color: 'rgba(239,68,68,0.55)' }}
        >
          ⚠ Skip this step — you'll miss 150 pts
        </button>
      </motion.div>
    </Layout>
  );
}
