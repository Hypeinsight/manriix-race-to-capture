const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { screenshotUpload, videoUpload, uploadToCloudinary } = require('../middleware/upload');
const { notifyRegistration, notifyVideoSubmission } = require('../utils/email');

const STEP1_POINTS      = parseInt(process.env.STEP1_POINTS)      || 100;
const STEP2_POINTS      = parseInt(process.env.STEP2_POINTS)      || 150;
const POINTS_PER_CAPTURE = parseInt(process.env.POINTS_PER_CAPTURE) || 15;
const STEP4_POINTS      = parseInt(process.env.STEP4_POINTS)      || 300;

// ─── POST /api/participants ─── register (step 1) ───────────────────────────
router.post('/', async (req, res) => {
  const { firstName, lastName, companyName, email, phone } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'First name, last name and email are required' });
  }

  const emailLower = email.toLowerCase().trim();

  try {
    // Allow re-entry by email (tab closed, QR rescanned, etc.)
    const existing = await db.query(
      'SELECT * FROM participants WHERE email = $1',
      [emailLower]
    );
    if (existing.rows.length > 0) {
      return res.json({ participant: existing.rows[0], resumed: true });
    }

    const result = await db.query(
      `INSERT INTO participants
         (first_name, last_name, company_name, email, phone, step1_points, total_points)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [
        firstName.trim(),
        lastName.trim(),
        companyName?.trim() || '',
        emailLower,
        phone?.trim() || '',
        STEP1_POINTS,
      ]
    );
    notifyRegistration(result.rows[0]); // fire-and-forget
    res.status(201).json({ participant: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── GET /api/participants/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM participants WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ participant: result.rows[0] });
  } catch (err) {
    console.error('Get participant error:', err);
    res.status(500).json({ error: 'Failed to fetch participant' });
  }
});

// ─── POST /api/participants/:id/instagram ─── step 2 ─────────────────────────
router.post('/:id/instagram', screenshotUpload.single('screenshot'), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM participants WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    if (rows[0].step2_completed) {
      return res.json({ participant: rows[0], alreadyCompleted: true });
    }
    if (!req.file) return res.status(400).json({ error: 'Screenshot file is required' });

    const upload = await uploadToCloudinary(req.file.buffer, {
      folder:          'manriix-rtc/instagram-proofs',
      resource_type:   'image',
      transformation:  [{ width: 1080, crop: 'limit', quality: 'auto:good' }],
    });

    const result = await db.query(
      `UPDATE participants
       SET step2_completed = TRUE,
           step2_points    = $1,
           total_points    = total_points + $1,
           instagram_screenshot_url = $2,
           updated_at      = NOW()
       WHERE id = $3
       RETURNING *`,
      [STEP2_POINTS, upload.secure_url, req.params.id]
    );
    res.json({ participant: result.rows[0] });
  } catch (err) {
    console.error('Instagram step error:', err);
    res.status(500).json({ error: 'Failed to process Instagram step' });
  }
});

// ─── POST /api/participants/:id/game ─── step 3 ──────────────────────────────
router.post('/:id/game', async (req, res) => {
  const { captures } = req.body;

  if (typeof captures !== 'number' || captures < 0 || captures > 60) {
    return res.status(400).json({ error: 'Invalid captures value' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM participants WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    if (rows[0].step3_completed) {
      return res.json({ participant: rows[0], alreadyCompleted: true });
    }

    const stepPoints = captures * POINTS_PER_CAPTURE;

    const result = await db.query(
      `UPDATE participants
       SET step3_completed = TRUE,
           step3_points    = $1,
           total_points    = total_points + $1,
           game_captures   = $2,
           updated_at      = NOW()
       WHERE id = $3
       RETURNING *`,
      [stepPoints, captures, req.params.id]
    );
    res.json({ participant: result.rows[0] });
  } catch (err) {
    console.error('Game step error:', err);
    res.status(500).json({ error: 'Failed to save game score' });
  }
});

// ─── POST /api/participants/:id/video ─── step 4 (most valuable) ─────────────────
router.post('/:id/video', (req, res, next) => {
  videoUpload.single('video')(req, res, err => {
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Video is too large. Please keep it under 50 MB (about 60 seconds on a phone).' });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM participants WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    if (rows[0].step4_completed) {
      return res.json({ participant: rows[0], alreadyCompleted: true });
    }
    if (!req.file) return res.status(400).json({ error: 'Video file is required' });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ error: 'Media storage not configured. Please contact the event team.' });
    }

    const upload = await uploadToCloudinary(req.file.buffer, {
      folder:        'manriix-rtc/videos',
      resource_type: 'video',
    });

    const result = await db.query(
      `UPDATE participants
       SET step4_completed = TRUE,
           step4_points    = $1,
           total_points    = total_points + $1,
           video_url       = $2,
           updated_at      = NOW()
       WHERE id = $3
       RETURNING *`,
      [STEP4_POINTS, upload.secure_url, req.params.id]
    );
    notifyVideoSubmission(result.rows[0]); // fire-and-forget
    res.json({ participant: result.rows[0] });
  } catch (err) {
    console.error('Video step error:', err);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

module.exports = router;
