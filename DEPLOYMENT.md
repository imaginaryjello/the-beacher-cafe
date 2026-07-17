# The Beacher Café — Deployment Guide

From local project to a production website real customers can use, and a
portfolio piece worth showing. Work the phases in order — each one builds on
the previous.

**Architecture at a glance**

```
Customer browser
      │
      ▼
Vercel (frontend — Vite/React static build, free)
      │  VITE_API_URL
      ▼
Render (backend — Express API, free/starter)
      │                    │              │
      ▼                    ▼              ▼
MongoDB Atlas         Cloudinary       Resend
(database, free M0)   (images)         (email)
```

---

## Phase 0 — Launch blockers (do these first)

These will actively break or embarrass the product in production.

### 0.1 Resend is in sandbox mode — customer emails will NOT arrive
`backend/config/email.js` sends from `onboarding@resend.dev`. In this mode
Resend **only delivers to the email address that owns the Resend account**.
A real customer booking a table gets nothing.

Fix:
1. Buy/control a domain (see 2.4).
2. Resend dashboard → Domains → Add domain → add the DNS records they give
   you (SPF + DKIM, usually 3 records).
3. Change `FROM` to `The Beacher Café <reservations@yourdomain.com>`.
4. Send a test reservation to a Gmail address and confirm it lands in the
   inbox, not spam.

### 0.2 Watermarked stock image in the repo
`frontend/client/public/image copy 9.png` (3.1 MB) is a Vecteezy stock
texture **with visible watermarks**. It's no longer referenced — delete it.
Audit the other `image copy *.png` files: anything from a stock site needs a
license or replacement with your own photos (you have great real ones now).

### 0.3 Browser tab says "client" with a Vite logo
`frontend/client/index.html` still has `<title>client</title>` and the Vite
favicon. Minimum fix:

```html
<title>The Beacher Café — Est. 1986 · Queen St E, Toronto</title>
<meta name="description" content="A neighbourhood café in the Beaches since 1986. All-day breakfast, famous Hollandaise, and a table that's always ready for you. Reserve online." />
<link rel="icon" href="/favicon.png" />
<!-- Social link previews -->
<meta property="og:title" content="The Beacher Café — Est. 1986" />
<meta property="og:description" content="All-day breakfast in the Beaches. Reserve your table." />
<meta property="og:image" content="https://yourdomain.com/beacherfront.webp" />
<meta property="og:type" content="website" />
```

### 0.4 Image weight — 15 MB in /public
Phones on café Wi-Fi will crawl. `steakegg.png` alone is 2.6 MB and it's a
background. Convert the big PNGs to WebP (like your new photos already are)
and rename the `image copy N.png` files to meaningful names as you go:

```bash
# from frontend/client/public — requires cwebp (libwebp-tools)
cwebp -q 80 steakegg.png -o steakegg.webp
```
Then update the references. Target: no single image over ~300 KB, whole
folder under ~4 MB.

---

## Phase 1 — Security hardening

Most of the big items are already in place (helmet, rate limiting on auth +
reservations, bcrypt, JWT with role/status claims, anti-enumeration on
forgot-password, honeypot, hashed single-use reset tokens, `select: false`
on secrets, 0 npm vulnerabilities). What remains:

1. **`app.set("trust proxy", 1)`** in `backend/index.js`, before the rate
   limiters. Render/Railway sit behind a proxy; without this,
   express-rate-limit sees every visitor as one IP — the proxy's — and one
   scraper can lock out ALL customers from the reservation form.
2. **Strong JWT secret in prod** — generate a fresh one, never reuse dev's:
   `openssl rand -base64 48`. Set it only in the host's env dashboard.
3. **Rotate anything that ever leaked** — if `.env` values were ever pasted
   into a chat/commit/screenshot, rotate them (Mongo password, Cloudinary
   secret, Resend key, JWT secret). Check history: `git log --all --full-history -- "*.env"`.
4. **CORS** — already env-driven. In prod set `FRONTEND_URL=https://yourdomain.com`
   (exact origin, no trailing slash). Verify a request from another origin fails.
5. **Atlas hygiene** — dedicated DB user with `readWrite` on this database
   only (not admin). Network access: PaaS IPs are dynamic, so you'll likely
   allow `0.0.0.0/0` — that makes the password the only wall; make it long
   and random.
6. **Registration flow** — anyone can register, but new accounts are
   `pending` until the owner approves, and the register page is labelled
   "Join the Team". Good enough for launch; watch for junk signups.
7. Optional, post-launch: `express-mongo-sanitize`, a global rate limiter,
   shorter JWT + refresh tokens.

---

## Phase 2 — Hosting, step by step

Free-tier friendly; the one paid thing worth considering is noted.

### 2.1 MongoDB Atlas (likely already there)
- M0 free cluster is fine to start.
- **Know this:** M0 has *no automatic backups*. Before real reservations
  flow, either upgrade to M10 or set up a scheduled `mongodump` (GitHub
  Action cron works) to cloud storage. Losing a week of reservations is a
  real-business problem, not a demo problem.

### 2.2 Backend → Render
1. Push the repo to GitHub.
2. Render → New → Web Service → connect repo.
   - Root directory: `backend`
   - Build: `npm install` · Start: `npm start` (already `node index.js` ✓)
3. Environment variables (Render dashboard, never in git):
   `MONGO_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`, `PORT` (Render
   injects one — your code already reads `process.env.PORT` ✓).
4. **Free-tier catch:** the service spins down after ~15 min idle; the next
   visitor waits up to a minute. For a portfolio demo, acceptable (or ping it
   every 10 min with UptimeRobot). For the real café, the ~$7/mo starter
   instance is the correct call — a customer who waits 50 s is a lost booking.

### 2.3 Frontend → Vercel
1. Vercel → New Project → same repo.
   - Root directory: `frontend/client` · Framework: Vite (auto-detected)
2. Env var: `VITE_API_URL=https://<your-render-service>.onrender.com`
   (Remember: **every `VITE_*` var is public** — bundled into the JS anyone
   can read. Secrets never go here.)
3. **SPA rewrite — required.** React Router owns the URLs; without this,
   refreshing `/menu` or opening the emailed `/reset-password?token=…` link
   404s. Add `frontend/client/vercel.json`:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
4. After the first deploy, set Render's `FRONTEND_URL` to the real frontend
   URL (custom domain once attached) and redeploy the backend — CORS and the
   password-reset links in emails both depend on it.

### 2.4 Domain
- Attach it to Vercel (site) — e.g. `yourdomain.com`; backend can stay on
  `*.onrender.com` or get `api.yourdomain.com`.
- The same domain gets verified in Resend (Phase 0.1) — one domain purchase
  unlocks both.
- HTTPS is automatic on both platforms.

### 2.5 Deploy order (first launch)
1. Atlas ready → 2. Backend live on Render (test `GET /api/settings` in a
   browser) → 3. Frontend live on Vercel pointing at it → 4. `FRONTEND_URL`
   updated + backend redeployed → 5. Resend domain verified → 6. Full
   walkthrough (checklist below).

---

## Phase 3 — Product polish

- **Per-page titles**: a small `useEffect(() => { document.title = "Menu — The Beacher Café"; }, [])`
  per page (or `react-helmet-async`). Matters for tabs, history, SEO.
- **`loading="lazy"`** on below-the-fold images (gallery masonry, murals).
- **Replace `alert()`** in login/register with the inline error style used
  everywhere else — last blocking-popup UX in the app.
- **Lighthouse** (Chrome DevTools) on `/`, `/menu`, `/reservations`:
  after the image work, aim 90+ Performance / 90+ Accessibility. Fix what it
  flags; it's a checklist generator.
- **robots.txt + sitemap**: allow `/`, `/menu`, `/about`, `/reservations`;
  `Disallow: /dashboard`.
- **Privacy note**: you collect name/email/phone from real customers — a
  short `/privacy` page (what's collected, why, contact to delete) is both
  good practice and expected for a Canadian business (PIPEDA).
- **Google Business**: once live, add the site link to the café's Google
  listing — that's where locals will actually find it.

## Phase 4 — Operations (an hour, prevents disasters)

| Concern | Tool (free) | Setup |
|---|---|---|
| Site down? | UptimeRobot | Ping `/api/settings` every 5 min, email on fail |
| Errors in prod | Sentry free tier | Frontend SDK + Express middleware |
| DB health | Atlas built-in alerts | Enable connection/storage alerts |
| Backups | GitHub Action cron + `mongodump` | Until on a paid Atlas tier |
| Deploy safety | Vercel preview deploys | Every PR gets its own URL — test before merge |

## Phase 5 — Portfolio presentation

The engineering is done; this is what makes people *see* it.

1. **README overhaul** — the repo's landing page: hero screenshot, one-line
   pitch, live URL, feature list (public site + role-based dashboard), the
   architecture diagram above, stack badges, and a "decisions" section — the
   JWT role/status claims, `readBy` notifications, blocked-dates flow,
   graceful degradation with static fallbacks, Cloudinary two-step upload.
   Interviewers read the *why*, not the file tree.
2. **Demo account** — reviewers won't register and wait for approval. Seed a
   `demo@…` co-admin (safe: can't touch Settings/staff) and put the
   credentials in the README. Keep the real owner account private.
3. **Screenshots/GIF** — mobile + desktop of home, menu, reservation flow,
   and the dashboard. A 60–90 s screen recording of a reservation being made
   and then confirmed in the dashboard (with the email arriving) tells the
   whole story.
4. **Tiny CI** — `.github/workflows/ci.yml` running `npm run lint` and
   `npm run build` on PRs. Small effort, reads as professionalism.
5. **Write-up** — a short case study (README section or blog post):
   problem → constraints → decisions → result. This is what separates
   "built a CRUD app" from "shipped a product for a real 40-year-old café".

---

## Launch-day checklist

- [ ] Reservation submitted from a phone on the live site
- [ ] Confirmation email received by a *customer* address (not yours)
- [ ] Owner confirms it in the dashboard → customer gets the confirmed email
- [ ] Blocked date rejects a booking with the call-us message
- [ ] Password reset email arrives and the link works on the live domain
- [ ] Register → shows as pending → owner approves → new user can log in
- [ ] Menu/specials/gallery edits in dashboard appear on the public site
- [ ] Refresh on `/menu` and `/reset-password?token=x` — no 404 (SPA rewrite)
- [ ] Request from a foreign origin is CORS-blocked
- [ ] Rate limit: 4th reservation attempt in an hour is rejected (and other
      visitors are NOT — proves `trust proxy` is right)
- [ ] Lighthouse ≥ 90 on `/` after image optimization
- [ ] UptimeRobot green, Sentry receiving events, backup job ran once
