# Manriix — Race to Capture

Interactive gamified web app for the **Colombo Motor Show 2026**, built around **Manriix**, Sri Lanka's first autonomous photography and advertising robot.

Users scan a QR code, complete 4 challenges to earn points, and compete on a live leaderboard.

---

## Scoring

| Step | Challenge | Points |
|------|-----------|--------|
| 1 | Register your details | 100 |
| 2 | Follow on Instagram + screenshot | 150 |
| 3 | Race to Capture mini-game (15 sec) | 15 × captures |
| 4 | Record a hype video ⭐ | **300** |
| **Max** | | **~700** |

> The video is intentionally the highest-value step — it generates UGC for Manriix.

---

## Tech Stack

- **Frontend** React 18 + Vite + Tailwind CSS
- **Backend** Node.js + Express
- **Database** PostgreSQL
- **Media storage** Cloudinary (free tier)
- **Deployment** Render (single web service)

---

## Local Development

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally

### 2. Clone & install

```bash
git clone <repo>
cd manriix-race-to-capture
npm run install:all
```

### 3. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/manriix_rtc
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
INSTAGRAM_URL=https://www.instagram.com/manriix_robot/
```

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE manriix_rtc;"
```

The schema is auto-applied when the server starts.

### 5. Run

```bash
npm run dev
```

- React app: http://localhost:5173
- API server: http://localhost:5000

---

## Cloudinary Setup (free tier)

1. Sign up at https://cloudinary.com (no credit card needed)
2. Go to **Dashboard** → copy your **Cloud name**, **API Key**, **API Secret**
3. Add them to `.env`

Free tier gives you 25 GB storage / 25 GB bandwidth — easily sufficient for an event.

---

## Deployment on Render

### 1. Push code to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your-org/manriix-race-to-capture.git
git push -u origin main
```

### 2. Create a new Web Service on Render

1. Go to https://render.com → **New → Blueprint** (to use `render.yaml`)
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` and create both the web service and PostgreSQL database

### 3. Set environment variables

In the Render dashboard for your web service, add:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `INSTAGRAM_URL` | your Instagram profile URL |

The other variables (`DATABASE_URL`, `NODE_ENV`, point values) are already set in `render.yaml`.

### 4. Deploy

Render will build and deploy automatically. Your URL will be something like:
`https://manriix-race-to-capture.onrender.com`

---

## QR Code

Generate a QR code pointing to your Render URL. Place it at the Manriix booth.

The leaderboard is publicly accessible at `/leaderboard` — you can show it on a screen.

---

## Customising Points

Before the event, you can tune the scoring in Render's environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `STEP1_POINTS` | 100 | Registration bonus |
| `STEP2_POINTS` | 150 | Instagram follow bonus |
| `STEP4_POINTS` | 300 | Video upload bonus |
| `POINTS_PER_CAPTURE` | 15 | Points per car in the game |

No code changes needed — just update the env var and redeploy.

---

## Instagram URL

Set `INSTAGRAM_URL` in environment variables to your actual Instagram profile so the button on Step 2 links there correctly.

---

## Brand Assets

- `client/public/logo.png` — horizontal white logo
- `client/public/favicon.png` — camera + Manriix orange icon
- Brand orange: `#fbb238`
- Brand yellow: `#fed700`
- Fonts: Inter (body) + JetBrains Mono (accents/stats)
