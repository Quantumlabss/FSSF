-- FSSF Platform PostgreSQL Schema
-- Run once against an empty database, or let Sequelize sync() create it for you in dev.

CREATE TYPE user_role AS ENUM ('recruit', 'member', 'nco', 'officer', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'interview', 'accepted', 'rejected');
CREATE TYPE event_type AS ENUM ('operation', 'training', 'selection', 'social', 'other');
CREATE TYPE signup_status AS ENUM ('confirmed', 'waitlist', 'declined');

-- ==========================
-- Users / Roster
-- ==========================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    discord_id      VARCHAR(32) UNIQUE NOT NULL,
    username        VARCHAR(100) NOT NULL,
    discriminator   VARCHAR(8),
    avatar_url      TEXT,
    email           VARCHAR(255),
    callsign        VARCHAR(100),
    role            user_role NOT NULL DEFAULT 'recruit',
    rank_id         INTEGER,
    position        VARCHAR(100),
    unit            VARCHAR(100) DEFAULT 'FSSF',
    join_date       DATE DEFAULT CURRENT_DATE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    last_login       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- Ranks (ordered hierarchy, synced from Discord roles)
-- ==========================
CREATE TABLE ranks (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    abbreviation    VARCHAR(20),
    tier            INTEGER NOT NULL,              -- lower = junior, higher = senior
    insignia_url    TEXT,
    discord_role_id VARCHAR(32),
    description     TEXT
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_rank FOREIGN KEY (rank_id) REFERENCES ranks(id) ON DELETE SET NULL;

-- ==========================
-- Promotions (audit trail)
-- ==========================
CREATE TABLE promotions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_rank_id     INTEGER REFERENCES ranks(id),
    new_rank_id     INTEGER NOT NULL REFERENCES ranks(id),
    issued_by       INTEGER REFERENCES users(id),
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- Events
-- ==========================
CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    event_type      event_type NOT NULL DEFAULT 'operation',
    map_name        VARCHAR(150),
    event_date      TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 90,
    max_slots       INTEGER,
    created_by      INTEGER REFERENCES users(id),
    banner_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_signups (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          signup_status NOT NULL DEFAULT 'confirmed',
    role_signup     VARCHAR(100),
    signed_up_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ==========================
-- Recruitment applications
-- ==========================
CREATE TABLE applications (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,
    discord_id          VARCHAR(32) NOT NULL,
    discord_username    VARCHAR(100) NOT NULL,
    age                 INTEGER,
    timezone            VARCHAR(50),
    hours_in_pavlov     INTEGER,
    experience          TEXT,
    why_join            TEXT,
    referral            VARCHAR(150),
    status              application_status NOT NULL DEFAULT 'pending',
    reviewed_by         INTEGER REFERENCES users(id),
    review_notes        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- Gallery
-- ==========================
CREATE TABLE gallery_images (
    id              SERIAL PRIMARY KEY,
    image_path      TEXT NOT NULL,
    caption         VARCHAR(255),
    event_id        INTEGER REFERENCES events(id) ON DELETE SET NULL,
    uploaded_by     INTEGER REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- After Action Reports
-- ==========================
CREATE TABLE aars (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER REFERENCES events(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    summary         TEXT,
    body_markdown   TEXT NOT NULL,
    outcome         VARCHAR(50),                    -- e.g. 'success', 'failure', 'partial'
    authored_by     INTEGER REFERENCES users(id),
    published       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_signups_event ON event_signups(event_id);

-- Seed base ranks
INSERT INTO ranks (name, abbreviation, tier) VALUES
    ('Recruit', 'RCT', 0),
    ('Private', 'PVT', 1),
    ('Corporal', 'CPL', 2),
    ('Sergeant', 'SGT', 3),
    ('Staff Sergeant', 'SSG', 4),
    ('Lieutenant', 'LT', 5),
    ('Captain', 'CPT', 6),
    ('Major', 'MAJ', 7),
    ('Colonel', 'COL', 8);
