# FSSF — First Special Service Force

Full-stack rebuild of the FSSF Pavlov VR unit website: React + Bootstrap frontend,
Node/Express API, PostgreSQL via Sequelize, Discord OAuth2 login, and a Discord bot
that keeps roles/ranks/roster in sync.

## Two frontends, pick one

- **`static-site/`** — plain HTML/CSS/JS, Bootstrap loaded from a CDN, no build
  step, no `npm install`. Just upload the folder to any static host (Netlify,
  GitHub Pages, S3/CloudFront, or your own nginx box) or open it locally.
  This is the simplest option if you don't want to run Node for the frontend.
- **`frontend/`** — the React + Vite version, functionally identical, if you'd
  rather work in React and are fine running `npm run build`.

Both talk to the same `backend/` API — pick whichever you want to host and
ignore the other folder.

## Stack

- **Frontend:** Plain HTML/CSS/JS (`static-site/`) or React 18 + Vite (`frontend/`) —
  both use the same "field manual" theme (`css/theme.css` / `src/styles/theme.css`)
- **Backend:** Node.js + Express, REST API under `/api/*`
- **Database:** PostgreSQL, accessed through Sequelize (ORM layer in `backend/src/models`)
- **Auth:** Discord OAuth2 (authorization-code flow) + JWT session cookie
- **Bot:** discord.js — role sync, live roster embed, `/roster` and `/events` slash commands

## Project layout

```
fssf-platform/
├── backend/
│   ├── server.js              # Express entrypoint
│   ├── src/
│   │   ├── config/            # db.js, discord.js (OAuth helpers), sync.js
│   │   ├── models/            # Sequelize models + associations (ORM layer)
│   │   ├── middleware/        # auth, permissions, file upload
│   │   └── routes/            # auth, events, roster, applications,
│   │                           promotions, gallery, aars, admin
│   ├── bot/                   # Discord bot: bot.js, roleSync.js, rosterEmbed.js
│   ├── sql/schema.sql         # Hand-written Postgres schema (alt. to sequelize sync)
│   └── uploads/gallery/       # Uploaded gallery images (served at /uploads/gallery)
├── frontend/
│   └── src/
│       ├── api/client.js      # Axios instance
│       ├── context/AuthContext.jsx
│       ├── components/        # Navbar, EventCard, RosterTable pieces, etc.
│       ├── pages/              # Public pages + admin/ (Command Dashboard)
│       └── styles/theme.css
└── docker-compose.yml         # Local Postgres for development
```

## Setup

### 1. Database

```bash
docker compose up -d          # starts Postgres and loads sql/schema.sql
```

Or point `DATABASE_URL` at any existing Postgres instance and either run
`sql/schema.sql` yourself or use `npm run db:sync` (Sequelize `sync({alter:true})`,
dev convenience only — the SQL file is the source of truth for production).

### 2. Discord application

In the [Discord Developer Portal](https://discord.com/developers/applications):

1. Create an application → **OAuth2** tab:
   - Add redirect URI: `http://localhost:4000/api/auth/discord/callback`
   - Note the **Client ID** and **Client Secret**
2. **Bot** tab: create a bot, note the **Bot Token**, enable the
   **Server Members Intent**.
3. Invite the bot to your server with `applications.commands` + `bot` scopes and
   `Manage Roles` permission (needed for rank/role sync).
4. Note your **Server (Guild) ID**, and the role IDs you want to map — set these in
   `.env` (`ROLE_MAP_*`, `RANK_ROLE_IDS`, `BOT_ROSTER_CHANNEL_ID`).

### 3. Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, Discord values
npm install
npm run dev                   # API + Discord bot on http://localhost:4000
```

The bot now starts automatically in the same process as the API — you don't
need a second terminal. If `DISCORD_BOT_TOKEN` / `DISCORD_GUILD_ID` aren't set
yet, it just logs a notice and skips itself; the API keeps running normally.
Set `ENABLE_BOT=false` in `.env` if you'd rather run the bot as a fully
separate process (`npm run bot` still works standalone).

### 4. Frontend — static site (no npm)

1. Open `static-site/js/config.js` and set `API_BASE` to your backend's URL, e.g.
   `http://localhost:4000/api` for local testing, or `https://api.yourdomain.com/api`
   once deployed.
2. Serve the `static-site/` folder as static files — any of these work:
   - Local testing: `cd static-site && python3 -m http.server 5173`, then open
     `http://localhost:5173`
   - Production: upload the whole `static-site/` folder to Netlify, GitHub
     Pages, S3+CloudFront, Cloudflare Pages, or drop it in nginx's webroot.
3. In `backend/.env`, set `CLIENT_URL` to wherever the static site is served
   from (no trailing slash), so CORS and the post-login redirect work. If the
   static site is on a **different domain** than the API, also set
   `CROSS_ORIGIN_CLIENT=true` in `backend/.env` — cross-domain cookies require
   this plus HTTPS on the API in production.

### 4b. Frontend — React version (needs npm)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173, proxies /api to :4000
```

For production, `npm run build` produces static files in `frontend/dist/` that
you can host the same way as `static-site/` — but then it's just a build step,
not something you re-run on every request.

## How the pieces fit together

- **Discord OAuth login flow:** `GET /api/auth/discord` redirects to Discord;
  `GET /api/auth/discord/callback` exchanges the code, pulls the user's guild
  roles, upserts a `users` row, and sets an httpOnly JWT cookie.
- **Role synchronization:** on every login the API maps the user's Discord roles
  to an app permission level (`recruit → member → nco → officer → admin`) and a
  rank, via `ROLE_MAP_*` / `RANK_ROLE_IDS`. The bot additionally re-syncs the
  *entire* guild on an interval (`BOT_SYNC_INTERVAL_MINUTES`) and pushes rank
  changes issued from the website back onto the member's Discord roles.
- **User/admin permission system:** `middleware/permissions.js` implements a
  5-level role hierarchy checked on every protected route
  (`requireRole('nco')`, etc.), mirrored on the frontend by `AuthContext.hasRole()`.
- **Event CRUD + signup system:** `routes/events.js` — NCO+ create/edit, Officer+
  delete, any logged-in member can sign up (with automatic waitlisting once
  `maxSlots` is hit).
- **Recruitment application workflow:** public submission → staff review queue
  (`pending → interview → accepted/rejected`) → auto-promotes an accepted
  applicant's linked account to `member`.
- **Roster/rank + promotion tracking:** `routes/roster.js` and
  `routes/promotions.js`; every promotion is logged with who issued it and why.
- **Gallery upload system:** `multer`-backed upload endpoint, member+ can post,
  NCO+ can delete.
- **AAR editor:** NCO+ draft/publish After Action Reports, linkable to a specific
  event.

## Notes before production use

- Set a strong, random `JWT_SECRET`.
- Put the app behind HTTPS and set `NODE_ENV=production` (cookies become
  `secure`).
- Gallery uploads currently write to local disk — swap `middleware/upload.js`
  for S3/R2 storage if you're deploying anywhere without persistent disk.
- Add rate limiting to the public `applications` and `gallery` upload endpoints.
