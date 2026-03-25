const nodemailer = require('nodemailer');

// Transporter is created lazily so missing SMTP config doesn't crash the server
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
}

/**
 * Send a notification email to the internal team.
 * Silently no-ops if SMTP is not configured.
 */
async function notify(subject, html) {
  const transporter = getTransporter();
  if (!transporter || !process.env.NOTIFY_EMAIL) return;

  try {
    await transporter.sendMail({
      from:    `"Manriix Race to Capture" <${process.env.SMTP_USER}>`,
      to:      process.env.NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    // Log but never let email failure break the API
    console.warn('Email notification failed:', err.message);
  }
}

// ── Pre-built notification templates ─────────────────────────────────────────

function notifyRegistration(p) {
  return notify(
    `🏁 New participant: ${p.first_name} ${p.last_name}`,
    `
    <div style="font-family:Inter,sans-serif;max-width:520px;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;">
      <h2 style="color:#fed700;margin:0 0 24px;font-weight:300;font-size:22px;">New Participant Registered</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-size:14px;">${p.first_name} ${p.last_name}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Company</td><td style="padding:8px 0;font-size:14px;">${p.company_name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${p.email}" style="color:#fbb238;">${p.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Phone</td><td style="padding:8px 0;font-size:14px;">${p.phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Points</td><td style="padding:8px 0;font-size:14px;color:#fed700;font-weight:600;">+${p.step1_points} pts</td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.25);">Colombo Motor Show 2026 · Manriix Race to Capture</p>
    </div>
    `
  );
}

function notifyVideoSubmission(p) {
  return notify(
    `🎥 Video submitted: ${p.first_name} ${p.last_name} — ${p.total_points} pts`,
    `
    <div style="font-family:Inter,sans-serif;max-width:520px;background:#0d0d0d;color:#fff;padding:32px;border-radius:8px;">
      <h2 style="color:#fed700;margin:0 0 8px;font-weight:300;font-size:22px;">Video Submitted</h2>
      <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0 0 24px;">This is your most valuable UGC step.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-size:14px;">${p.first_name} ${p.last_name}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Company</td><td style="padding:8px 0;font-size:14px;">${p.company_name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${p.email}" style="color:#fbb238;">${p.email}</a></td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Total score</td><td style="padding:8px 0;font-size:16px;color:#fed700;font-weight:700;">${p.total_points} pts</td></tr>
        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.45);font-size:13px;">Video</td><td style="padding:8px 0;font-size:13px;"><a href="${p.video_url}" style="color:#fbb238;">View on Cloudinary</a></td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.25);">Colombo Motor Show 2026 · Manriix Race to Capture</p>
    </div>
    `
  );
}

module.exports = { notify, notifyRegistration, notifyVideoSubmission };
