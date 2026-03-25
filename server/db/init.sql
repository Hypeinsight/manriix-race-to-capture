CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  company_name    VARCHAR(200) DEFAULT '',
  email           VARCHAR(200) UNIQUE NOT NULL,
  phone           VARCHAR(50)  DEFAULT '',

  -- Step completion flags
  step1_completed BOOLEAN DEFAULT TRUE,
  step2_completed BOOLEAN DEFAULT FALSE,
  step3_completed BOOLEAN DEFAULT FALSE,
  step4_completed BOOLEAN DEFAULT FALSE,

  -- Per-step points
  step1_points    INTEGER DEFAULT 0,
  step2_points    INTEGER DEFAULT 0,
  step3_points    INTEGER DEFAULT 0,
  step4_points    INTEGER DEFAULT 0,
  total_points    INTEGER DEFAULT 0,

  -- Media
  instagram_screenshot_url TEXT,
  video_url                TEXT,
  game_captures            INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_email        ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_total_points ON participants(total_points DESC);
