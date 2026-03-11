-- OurMoments PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  partner_name TEXT,
  anniversary_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photoboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT,
  frame_style TEXT,
  love_note TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photoboxes_user_id ON photoboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_photoboxes_public_slug ON photoboxes(public_slug);
CREATE INDEX IF NOT EXISTS idx_photoboxes_created_at ON photoboxes(created_at DESC);
