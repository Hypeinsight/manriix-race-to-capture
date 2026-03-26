require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const db         = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  /\.onrender\.com$/,
  /\.manriix\.com$/,
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    const ok = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down' },
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/participants', require('./routes/participants'));
app.use('/api/leaderboard',  require('./routes/leaderboard'));
app.use('/api/admin',        require('./routes/admin'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const distPath = path.join(__dirname, '../client/dist');
  const distExists = fs.existsSync(distPath);
  console.log(`Static files path: ${distPath} (exists: ${distExists})`);
  if (!distExists) {
    console.error('WARNING: client/dist not found — frontend will not be served correctly');
  }
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(503).send('App build not found. Please redeploy.');
    }
    res.sendFile(indexPath);
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function initDb(retries = 8, delayMs = 4000) {
  const fs = require('fs');
  const sql = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8');
  for (let i = 1; i <= retries; i++) {
    try {
      await db.query(sql);
      console.log('✓ Database schema ready');
      return;
    } catch (err) {
      console.warn(`DB not ready (attempt ${i}/${retries}): ${err.message}`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => console.log(`✓ Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start after retries:', err.message);
    process.exit(1);
  }
}

start();
