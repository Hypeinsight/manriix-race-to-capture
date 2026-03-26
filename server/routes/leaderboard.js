const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/leaderboard — public, anyone with the QR code can view
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        first_name,
        last_name,
        company_name,
        total_points,
        step1_points,
        step2_points,
        step3_points,
        step4_points,
        game_captures,
        step1_completed,
        step2_completed,
        step3_completed,
        step4_completed,
        created_at
      FROM participants
      ORDER BY total_points DESC, created_at ASC
      LIMIT 500
    `);

    const leaderboard = rows.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json({ leaderboard, total: rows.length });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
