import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCapture, playMiss, playShutter, playCarWhoosh, playTick, playGameOver, startEngine } from '../lib/sounds.js';

const GAME_DURATION  = 15;    // seconds
const CAPTURE_W      = 130;   // capture zone width px
const PTS_PER_CAPTURE = 15;

const CAR_COLORS = ['#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#a8dadc','#8338ec','#fb8500'];
const CAR_TYPES  = ['sports','gt','muscle'];

// ─── Car drawing ──────────────────────────────────────────────────────────────

function drawWheel(ctx, x, y, r) {
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a)*r*0.2, y + Math.sin(a)*r*0.2);
    ctx.lineTo(x + Math.cos(a)*r*0.58, y + Math.sin(a)*r*0.58);
    ctx.stroke();
  }
}

function drawSportsCar(ctx, cx, by, w, h, color) {
  const l = cx - w / 2, r = cx + w / 2;
  const wr = h * 0.21, wy = by - wr * 0.8;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, by + 2, w * 0.42, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // lower body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w * 0.06, by - h * 0.35);
  ctx.lineTo(l, by - h * 0.3);
  ctx.lineTo(l, by - wr * 1.4);
  ctx.lineTo(r, by - wr * 1.4);
  ctx.lineTo(r, by - h * 0.3);
  ctx.lineTo(r - w * 0.03, by - h * 0.35);
  ctx.closePath(); ctx.fill();
  // cabin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w*0.1, by - h*0.35);
  ctx.lineTo(l + w*0.17, by - h*0.85);
  ctx.lineTo(r - w*0.17, by - h*0.85);
  ctx.lineTo(r - w*0.08, by - h*0.35);
  ctx.closePath(); ctx.fill();
  // darkened roof detail
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(l + w*0.18, by - h*0.35);
  ctx.lineTo(l + w*0.22, by - h*0.82);
  ctx.lineTo(r - w*0.22, by - h*0.82);
  ctx.lineTo(r - w*0.1, by - h*0.35);
  ctx.closePath(); ctx.fill();
  // windows
  ctx.fillStyle = 'rgba(120,210,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(l + w*0.19, by - h*0.37);
  ctx.lineTo(l + w*0.23, by - h*0.79);
  ctx.lineTo(cx - w*0.02, by - h*0.79);
  ctx.lineTo(cx - w*0.02, by - h*0.37);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + w*0.02, by - h*0.37);
  ctx.lineTo(cx + w*0.02, by - h*0.79);
  ctx.lineTo(r - w*0.23, by - h*0.79);
  ctx.lineTo(r - w*0.11, by - h*0.37);
  ctx.closePath(); ctx.fill();
  // headlight
  ctx.fillStyle = '#ffe87a'; ctx.shadowColor = '#ffe87a'; ctx.shadowBlur = 8;
  ctx.fillRect(l + 2, by - h*0.55, w*0.09, h*0.18);
  // taillight
  ctx.fillStyle = '#ff3300'; ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 6;
  ctx.fillRect(r - w*0.11, by - h*0.55, w*0.09, h*0.18);
  ctx.shadowBlur = 0;
  // wheels
  drawWheel(ctx, l + w*0.2, wy, wr);
  drawWheel(ctx, r - w*0.2, wy, wr);
}

function drawGTCar(ctx, cx, by, w, h, color) {
  const l = cx - w/2, r = cx + w/2;
  const wr = h * 0.23, wy = by - wr * 0.85;
  ctx.save(); ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, by+2, w*0.44, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // low wide body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w*0.04, by - h*0.25);
  ctx.lineTo(l, by - h*0.18);
  ctx.lineTo(l, by - wr*1.5);
  ctx.lineTo(r, by - wr*1.5);
  ctx.lineTo(r, by - h*0.18);
  ctx.lineTo(r - w*0.04, by - h*0.25);
  ctx.closePath(); ctx.fill();
  // cabin (flatter/wider than sports)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w*0.08, by - h*0.25);
  ctx.lineTo(l + w*0.2, by - h*0.75);
  ctx.lineTo(r - w*0.2, by - h*0.75);
  ctx.lineTo(r - w*0.06, by - h*0.25);
  ctx.closePath(); ctx.fill();
  // window
  ctx.fillStyle = 'rgba(100,200,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(l + w*0.21, by - h*0.27);
  ctx.lineTo(l + w*0.25, by - h*0.72);
  ctx.lineTo(r - w*0.25, by - h*0.72);
  ctx.lineTo(r - w*0.12, by - h*0.27);
  ctx.closePath(); ctx.fill();
  // spoiler
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(r - w*0.12, by - h*0.8, w*0.1, h*0.06);
  // lights
  ctx.fillStyle = '#fff8aa'; ctx.shadowColor = '#ffe87a'; ctx.shadowBlur = 10;
  ctx.fillRect(l + 1, by - h*0.5, w*0.11, h*0.14);
  ctx.fillStyle = '#ff2200'; ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 8;
  ctx.fillRect(r - w*0.13, by - h*0.5, w*0.11, h*0.14);
  ctx.shadowBlur = 0;
  drawWheel(ctx, l + w*0.19, wy, wr);
  drawWheel(ctx, r - w*0.19, wy, wr);
}

function drawMuscleCar(ctx, cx, by, w, h, color) {
  const l = cx - w/2, r = cx + w/2;
  const wr = h * 0.22, wy = by - wr * 0.85;
  ctx.save(); ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, by+2, w*0.43, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // longer body, more upright
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w*0.05, by - h*0.4);
  ctx.lineTo(l, by - h*0.3);
  ctx.lineTo(l, by - wr*1.5);
  ctx.lineTo(r, by - wr*1.5);
  ctx.lineTo(r, by - h*0.3);
  ctx.lineTo(r - w*0.04, by - h*0.4);
  ctx.closePath(); ctx.fill();
  // tall cabin
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(l + w*0.12, by - h*0.4);
  ctx.lineTo(l + w*0.15, by - h*0.92);
  ctx.lineTo(r - w*0.15, by - h*0.92);
  ctx.lineTo(r - w*0.1, by - h*0.4);
  ctx.closePath(); ctx.fill();
  // window
  ctx.fillStyle = 'rgba(140,220,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(l + w*0.17, by - h*0.42);
  ctx.lineTo(l + w*0.2, by - h*0.88);
  ctx.lineTo(r - w*0.2, by - h*0.88);
  ctx.lineTo(r - w*0.14, by - h*0.42);
  ctx.closePath(); ctx.fill();
  // stripe
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(l + w*0.06, by - h*0.6, w*0.88, h*0.1);
  // lights
  ctx.fillStyle = '#ffee55'; ctx.shadowColor = '#ffe87a'; ctx.shadowBlur = 9;
  ctx.fillRect(l + 2, by - h*0.6, w*0.1, h*0.2);
  ctx.fillStyle = '#ff4400'; ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 7;
  ctx.fillRect(r - w*0.12, by - h*0.6, w*0.1, h*0.2);
  ctx.shadowBlur = 0;
  drawWheel(ctx, l + w*0.18, wy, wr);
  drawWheel(ctx, r - w*0.18, wy, wr);
}

const CAR_DRAWERS = { sports: drawSportsCar, gt: drawGTCar, muscle: drawMuscleCar };

// ─── Background drawing ───────────────────────────────────────────────────────

function drawScene(ctx, cw, ch, t) {
  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, ch * 0.4);
  skyGrad.addColorStop(0, '#050508');
  skyGrad.addColorStop(1, '#0a0a12');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, cw, ch * 0.4);

  // Grandstand blocks (static silhouettes, slightly scrolled)
  const offset = (t * 40) % 120;
  ctx.fillStyle = 'rgba(18,18,30,0.9)';
  for (let i = -1; i < cw / 120 + 2; i++) {
    const bx = i * 120 - offset;
    const bh = 30 + (i % 3) * 22;
    ctx.fillRect(bx, ch * 0.4 - bh, 108, bh);
    // windows
    ctx.fillStyle = 'rgba(255,215,0,0.25)';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        if ((i + row + col) % 3 !== 0) {
          ctx.fillRect(bx + 6 + col * 16, ch * 0.4 - bh + 6 + row * 8, 5, 4);
        }
      }
    }
    ctx.fillStyle = 'rgba(18,18,30,0.9)';
  }

  // Road
  const roadTop = ch * 0.40;
  const roadH   = ch * 0.52;
  const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadTop + roadH);
  roadGrad.addColorStop(0, '#1a1a1a');
  roadGrad.addColorStop(1, '#111');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, roadTop, cw, roadH);

  // Lane markings (animated)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([32, 22]);
  ctx.lineDashOffset = -((t * 350) % 54);
  const laneH = roadH / 3;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, roadTop + i * laneH);
    ctx.lineTo(cw, roadTop + i * laneH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Curbs (animated red/white stripes)
  const curbW = 36;
  const curbOff = (t * 200) % curbW;
  for (let i = -1; i <= cw / curbW + 1; i++) {
    const x = i * curbW - curbOff;
    ctx.fillStyle = i % 2 === 0 ? '#cc1100' : '#ffffff';
    ctx.fillRect(x, roadTop,         curbW, 7);
    ctx.fillRect(x, roadTop + roadH - 7, curbW, 7);
  }

  // Ground below road
  ctx.fillStyle = '#0a140a';
  ctx.fillRect(0, roadTop + roadH, cw, ch - roadTop - roadH);
}

function drawSpeedLines(ctx, cw, ch, t) {
  for (let i = 0; i < 12; i++) {
    const y    = 10 + i * (ch / 12);
    const len  = 25 + (i % 4) * 30;
    const x    = cw + 60 - ((t * 900 + i * 97) % (cw + 250));
    const alpha = 0.05 + (i % 3) * 0.05;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
}

// ─── GameCanvas component ─────────────────────────────────────────────────────

export default function GameCanvas({ onComplete }) {
  const canvasRef   = useRef(null);
  const stateRef    = useRef({
    cars: [], particles: [], scorePopups: [],
    startTime: null, lastSpawn: 0, nextSpawnDelay: 1800,
    captures: 0, animId: null, isRunning: false,
    flashAlpha: 0, missShake: 0, t: 0,
    captureZoneFlash: 0,
    lastTickSecond: -1,   // for countdown beeps
    engine: null,         // engine ambience handle
  });
  const [phase, setPhase]      = useState('idle');   // idle | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [captures, setCaptures] = useState(0);

  // ── Setup canvas size ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const w = Math.min(canvas.parentElement.clientWidth, 520);
      canvas.width  = w;
      canvas.height = Math.round(w * 0.75);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  const tick = useCallback((ts) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !s.isRunning) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width, ch = canvas.height;

    // Delta time
    if (!s.prevTs) s.prevTs = ts;
    const dt = Math.min((ts - s.prevTs) / 1000, 0.05);
    s.prevTs = ts;
    s.t += dt;

    // Timer
    const elapsed = (ts - s.startTime) / 1000;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    setTimeLeft(Math.ceil(remaining));

    if (remaining <= 0) {
      s.isRunning = false;
      s.engine?.stop(); s.engine = null;
      playGameOver();
      setPhase('done');
      onComplete(s.captures);
      return;
    }

    // ── Progressive difficulty ─────────────────────────────────────────────
    // difficulty: 0 at start → 1 at end
    const difficulty = Math.min(elapsed / GAME_DURATION, 1);

    // Spawn delay: 1100ms → 280ms (starts brisk, ends very intense)
    const minDelay = 1100 - difficulty * 820;
    const maxDelay = minDelay + 350;

    // Speed: cw/0.72s → cw/0.22s (3.3× faster at end)
    const minCross = 0.72 - difficulty * 0.50;

    // Update engine pitch every 0.5s
    if (s.engine && Math.floor(elapsed * 2) !== Math.floor((elapsed - dt) * 2)) {
      s.engine.setSpeed(difficulty);
    }

    // Countdown beeps in last 5 seconds
    const curSecond = Math.ceil(remaining);
    if (remaining <= 5 && curSecond !== s.lastTickSecond) {
      s.lastTickSecond = curSecond;
      playTick(remaining <= 1);
    }

    // Spawn cars
    if (ts - s.lastSpawn > s.nextSpawnDelay) {
      const roadTop = ch * 0.40, laneH = (ch * 0.52) / 3;
      const lane    = Math.floor(Math.random() * 3);
      const laneY   = roadTop + (lane + 0.78) * laneH;
      const w       = 145 + Math.random() * 40;
      const h       = w * 0.32;
      const carSpeed = cw / (minCross + Math.random() * 0.2);
      s.cars.push({
        id:    ts,
        x:     cw + w / 2 + 20,
        y:     laneY,
        w, h,
        speed: carSpeed,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        type:  CAR_TYPES[Math.floor(Math.random() * CAR_TYPES.length)],
        captured: false,
        whooshed: false,
      });
      s.lastSpawn = ts;
      s.nextSpawnDelay = minDelay + Math.random() * (maxDelay - minDelay);
    }

    // Play whoosh when car fully enters screen from right
    s.cars.forEach(car => {
      if (!car.whooshed && car.x < cw - car.w * 0.3) {
        car.whooshed = true;
        playCarWhoosh(car.speed / (cw / 0.7));
      }
    });

    // Update cars
    s.cars.forEach(c => { c.x -= c.speed * dt; });
    s.cars = s.cars.filter(c => c.x > -c.w);

    // Update particles
    s.particles.forEach(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 120 * dt;
      p.alpha -= dt * 1.8;
      p.r = Math.max(0, p.r - dt * 6);
    });
    s.particles = s.particles.filter(p => p.alpha > 0);

    // Update score popups
    s.scorePopups.forEach(p => { p.y -= 60 * dt; p.alpha -= dt * 1.5; });
    s.scorePopups = s.scorePopups.filter(p => p.alpha > 0);

    // Fade flash
    s.flashAlpha  = Math.max(0, s.flashAlpha - dt * 4);
    s.captureZoneFlash = Math.max(0, s.captureZoneFlash - dt * 5);
    s.missShake   = Math.max(0, s.missShake - dt * 6);

    // ── Draw ──────────────────────────────────────────────────────────────────
    ctx.save();

    // Shake on miss
    if (s.missShake > 0) {
      ctx.translate(
        Math.sin(s.t * 80) * 4 * s.missShake,
        0
      );
    }

    drawScene(ctx, cw, ch, s.t);
    drawSpeedLines(ctx, cw, ch, s.t);

    // Draw cars with motion blur
    s.cars.forEach(car => {
      const draw = CAR_DRAWERS[car.type];
      if (!draw) return;
      // Ghost copies for motion blur
      for (let g = 3; g >= 1; g--) {
        ctx.save();
        ctx.globalAlpha = 0.08 * (4 - g);
        draw(ctx, car.x + g * car.w * 0.12, car.y, car.w, car.h, car.color);
        ctx.restore();
      }
      draw(ctx, car.x, car.y, car.w, car.h, car.color);
    });

    // Particles
    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Capture zone (viewfinder)
    const czX = (cw - CAPTURE_W) / 2;
    const roadTop = ch * 0.40;
    const roadH   = ch * 0.52;
    const czY = roadTop + 2;
    const czH = roadH - 4;
    const czGlow = s.captureZoneFlash > 0 ? s.captureZoneFlash : 0;
    const cornerLen = 18;
    const czColor = czGlow > 0
      ? `rgba(254,215,0,${0.9 * czGlow + 0.3})`
      : 'rgba(255,255,255,0.5)';

    ctx.strokeStyle = czColor;
    ctx.lineWidth = czGlow > 0 ? 2.5 : 1.5;
    if (czGlow > 0) {
      ctx.shadowColor = '#fed700';
      ctx.shadowBlur = 16 * czGlow;
    }
    // Corner brackets
    const drawCorner = (x, y, dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cornerLen, y);
      ctx.stroke();
    };
    drawCorner(czX, czY, 1, 1);
    drawCorner(czX + CAPTURE_W, czY, -1, 1);
    drawCorner(czX, czY + czH, 1, -1);
    drawCorner(czX + CAPTURE_W, czY + czH, -1, -1);
    ctx.shadowBlur = 0;

    // Crosshair
    const midX = czX + CAPTURE_W / 2;
    const midY = czY + czH / 2;
    ctx.strokeStyle = czColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(midX - 12, midY); ctx.lineTo(midX + 12, midY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, midY - 12); ctx.lineTo(midX, midY + 12); ctx.stroke();
    ctx.setLineDash([]);

    // Score popups
    s.scorePopups.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fed700';
      ctx.font = `bold 22px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    });

    // Screen flash on capture
    if (s.flashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = s.flashAlpha * 0.55;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    }

    // ── HUD ───────────────────────────────────────────────────────────────────
    const timerRatio  = remaining / GAME_DURATION;
    const timerColor  = timerRatio > 0.5 ? '#fed700' : timerRatio > 0.25 ? '#fbb238' : '#ef4444';

    // Timer bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, cw, 6);
    ctx.fillStyle = timerColor;
    if (timerRatio < 0.3) { ctx.shadowColor = timerColor; ctx.shadowBlur = 10; }
    ctx.fillRect(0, 0, cw * timerRatio, 6);
    ctx.shadowBlur = 0;

    // Timer number (JetBrains Mono)
    ctx.fillStyle = timerColor;
    ctx.font = `bold 28px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(Math.ceil(remaining).toString().padStart(2, '0'), cw - 12, 40);

    // Capture count
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `bold 22px "JetBrains Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`×${s.captures}`, 12, 40);

    ctx.restore();

    s.animId = requestAnimationFrame(tick);
  }, [onComplete]);

  // ── Start game ─────────────────────────────────────────────────────────────────────
  const startGame = () => {
    const s = stateRef.current;
    // Stop any previous engine
    s.engine?.stop();
    s.cars = []; s.particles = []; s.scorePopups = [];
    s.captures = 0; s.flashAlpha = 0; s.missShake = 0;
    s.captureZoneFlash = 0; s.lastSpawn = 0; s.nextSpawnDelay = 1800;
    s.lastTickSecond = -1;
    s.isRunning = true; s.prevTs = null; s.t = 0;
    s.startTime = performance.now();
    s.engine = startEngine();
    setCaptures(0); setTimeLeft(GAME_DURATION); setPhase('playing');
    s.animId = requestAnimationFrame(tick);
  };

  // ── Handle capture attempt ──────────────────────────────────────────────────
  const handleCapture = useCallback((e) => {
    const s = stateRef.current;
    if (!s.isRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.width, ch = canvas.height;
    const czX = (cw - CAPTURE_W) / 2;
    const roadTop = ch * 0.40, roadH = ch * 0.52;

    // Check hit
    let hit = false;
    for (const car of s.cars) {
      const carLeft  = car.x - car.w / 2;
      const carRight = car.x + car.w / 2;
      const overlapX = carRight > czX && carLeft < czX + CAPTURE_W;
      if (overlapX && !car.captured) {
        car.captured = true;
        hit = true;
        s.captures++;
        s.flashAlpha = 1;
        s.captureZoneFlash = 1;
        playCapture();
        setCaptures(s.captures);
        // Particles burst
        const midX = czX + CAPTURE_W / 2;
        const midY = roadTop + roadH / 2;
        for (let i = 0; i < 18; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 80 + Math.random() * 160;
          s.particles.push({
            x: midX + (Math.random()-0.5)*40,
            y: midY + (Math.random()-0.5)*30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 60,
            color: Math.random() > 0.5 ? '#fed700' : '#fbb238',
            r: 3 + Math.random() * 4,
            alpha: 1,
          });
        }
        s.scorePopups.push({
          x: midX,
          y: midY - 20,
          text: `+${PTS_PER_CAPTURE}`,
          alpha: 1,
        });
        break;
      }
    }
    if (!hit) {
      s.missShake = 0.8;
      playMiss();
    } else {
      playShutter(); // extra tactile shutter on every tap that hits
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      s.isRunning = false;
      s.engine?.stop();
      if (s.animId) cancelAnimationFrame(s.animId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        id="game-canvas"
        style={{
          width: '100%',
          display: 'block',
          borderRadius: '2px',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: phase === 'playing' ? 'crosshair' : 'default',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onClick={phase === 'playing' ? handleCapture : undefined}
        onTouchStart={phase === 'playing' ? (e) => { e.preventDefault(); handleCapture(e); } : undefined}
      />

      {/* Idle / countdown overlay */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.75)',
              borderRadius: '2px',
              gap: '1rem',
            }}
          >
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              15 seconds · tap to capture
            </p>
            <button
              onClick={startGame}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '12px 32px', minWidth: '180px' }}
            >
              Start Race
            </button>
            <p style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Cars cross at 200km/h
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
