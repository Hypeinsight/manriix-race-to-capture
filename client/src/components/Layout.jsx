import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function Layout({ children, step = 0, totalSteps = 4 }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      {/* ── Header — matches manriix.com exactly (pure black bg) ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between"
        style={{
          background: 'rgb(13,13,13)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 20px',
        }}
      >
        <button onClick={() => navigate('/')} className="focus:outline-none">
          <img
            src="/logo.png"
            alt="Manriix"
            style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
        </button>
        <ThemeToggle />
      </header>

      {/* ── Progress ── */}
      {step > 0 && (
        <div className="max-w-lg mx-auto px-4">
          <ProgressBar current={step} total={totalSteps} />
        </div>
      )}

      {/* ── Content ── */}
      <main className="max-w-lg mx-auto px-4 pb-20">
        {children}
      </main>
    </div>
  );
}
