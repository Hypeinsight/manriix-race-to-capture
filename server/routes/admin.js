const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Simple secret-key middleware
function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return res.status(503).json({ error: 'Admin not configured' });
  const provided = req.headers['x-admin-secret'] || req.query.secret;
  if (provided !== secret) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET /api/admin/participants — full list with all fields
router.get('/participants', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id, first_name, last_name, company_name, email, phone,
        step1_completed, step2_completed, step3_completed, step4_completed,
        step1_points, step2_points, step3_points, step4_points, total_points,
        game_captures, instagram_screenshot_url, video_url,
        created_at
      FROM participants
      ORDER BY total_points DESC, created_at ASC
    `);
    res.json({ participants: rows, total: rows.length });
  } catch (err) {
    console.error('Admin list error:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// GET /api/admin/participants.csv — download as CSV
router.get('/participants.csv', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT first_name, last_name, company_name, email, phone,
             total_points, step1_points, step2_points, step3_points, step4_points,
             game_captures,
             step2_completed AS instagram_followed,
             step4_completed AS video_submitted,
             video_url, created_at
      FROM participants
      ORDER BY total_points DESC, created_at ASC
    `);

    const headers = [
      'First Name','Last Name','Company','Email','Phone',
      'Total Points','Reg Pts','Instagram Pts','Game Pts','Video Pts',
      'Game Captures','Instagram Followed','Video Submitted',
      'Video URL','Registered At',
    ];

    const escape = v => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const lines = [
      headers.join(','),
      ...rows.map(r => [
        r.first_name, r.last_name, r.company_name, r.email, r.phone,
        r.total_points, r.step1_points, r.step2_points, r.step3_points, r.step4_points,
        r.game_captures, r.instagram_followed ? 'Yes' : 'No',
        r.video_submitted ? 'Yes' : 'No', r.video_url,
        new Date(r.created_at).toISOString(),
      ].map(escape).join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="manriix-participants.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Failed to export' });
  }
});

module.exports = router;
