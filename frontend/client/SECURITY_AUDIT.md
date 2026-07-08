# The Beacher Café — Security & Code Audit Report

**Date:** June 22, 2026  
**Auditor:** Claude Code  
**Scope:** Full-stack audit — backend (Express/MongoDB), frontend (React), Cloudinary integration  
**Scale:** ~10 employees, ~100 max concurrent users (internal tool)

---

## 1. Executive Summary

The codebase is well-structured for its scale and shows genuine security thinking: bcrypt password hashing, JWT with role/status claims, layered reservation security, proper Cloudinary cleanup, and role-gated routes throughout.

However, there are **four critical issues that block deployment:**

- Secrets (MongoDB credentials, JWT secret, Cloudinary keys, Resend API key) are committed to the repo in `backend/.env`
- CORS accepts all origins with no restriction
- One employee-listing endpoint has zero auth protection
- Frontend API URLs are hardcoded to `localhost:5000` in several files

Additionally, npm audit reports **5 HIGH vulnerabilities** in multer, cloudinary, and path-to-regexp. None of these are architectural — they are all fixable in a focused half-day session. Once addressed, this app is safe to deploy.

**Overall health:** Good foundation, critical deployment gaps.  
**Estimated time to production-ready:** 6–8 hours of focused work.

---

## 2. Codebase Map

### Directory Structure

```
backend/
├── index.js                    — Express entry point, route mounting, MongoDB connect
├── middleware/auth.js           — verifyToken, requireAdmin, requireCoAdminOrAdmin, requireAccepted
├── config/
│   ├── cloudinary.js           — Multer + CloudinaryStorage setup, 5MB limit, MIME filter
│   └── email.js                — Resend email templates (reservation confirmations)
├── routes/
│   ├── user.js                 — Auth (register/login) + employee management
│   ├── menu.js                 — Menu CRUD + notification triggers
│   ├── upload.js               — Single Cloudinary upload + delete by publicId
│   ├── gallery.js              — Gallery image CRUD (public GET, protected write)
│   ├── specials.js             — Daily specials CRUD with active toggle
│   ├── reservations.js         — Public reservation creation + protected management
│   ├── notifications.js        — Role-filtered notification retrieval and read tracking
│   └── settings.js             — Café hours/rules (public GET, admin-only PUT)
├── model/
│   ├── employeeSchema.js       — role enum (admin/coadmin/employee), status enum (pending/accepted/rejected)
│   ├── menuSchema.js           — name, price, category, isSpecial, available, displayOrder
│   ├── ReservationSchema.js    — name, email, phone, guests, date, time, notes, status
│   ├── galleryImage.js         — imageUrl, publicId, caption, order, uploadedBy
│   ├── specialSchema.js        — title, price, description, imageUrl, publicId, active, displayOrder
│   ├── notificationSchema.js   — type, visibleTo, readBy[], triggeredBy, metadata
│   └── settingSchema.js        — per-day hours (mon–sun), maxPartySize, maxDaysAhead, phone, address, announcement
├── utils/cronjobs.js           — Daily cron: delete pending accounts after 3 days + related notifications
├── controller/userSchema.js    — DEAD FILE: stale duplicate of employeeSchema with broken bcrypt import
└── .env                        — ⚠️ COMMITTED with real credentials (see Section 3)

frontend/client/src/
├── App.jsx                     — Route definitions, PrivateRoute wrapper
├── pages/context/AuthContext.jsx — User + token state, localStorage persistence
├── utils/PrivateRoute.jsx      — Status/role gating (pending screen, inactive screen)
├── pages/Dashboard/
│   ├── Dashboard.jsx           — Sidebar layout + nested routes
│   ├── Members.jsx             — Employee management UI
│   ├── Menueditor.jsx          — Menu CRUD
│   ├── GalleryManager.jsx      — Tabbed Gallery + Specials editor
│   ├── Settings.jsx            — Hours, announcement, maxPartySize
│   └── ReservationList.jsx     — Reservation list + status changes
└── components/
    ├── NotificationBell.jsx    — Polls /api/notifications
    └── useSettings.jsx         — Shared settings hook (address, hours, announcement)
```

---

### Route & Auth Table

| Method  | Route                             | Auth              | Role          | Notes                                                |
| ------- | --------------------------------- | ----------------- | ------------- | ---------------------------------------------------- |
| POST    | `/api/user/register`              | None              | None          | Creates pending employee                             |
| POST    | `/api/user/login`                 | None              | None          | Returns JWT                                          |
| **GET** | **`/api/user/`**                  | **None**          | **None**      | ⚠️ **CRITICAL — returns full team roster to anyone** |
| GET     | `/api/user/pending`               | verifyToken       | admin         | Pending approvals                                    |
| PATCH   | `/api/user/approve/:id`           | verifyToken       | admin         | Approve employee                                     |
| DELETE  | `/api/user/reject/:id`            | verifyToken       | admin         | Reject + delete                                      |
| PATCH   | `/api/user/promote/:id`           | verifyToken       | admin         | Change role                                          |
| PATCH   | `/api/user/deactivate/:id`        | verifyToken       | admin         | Deactivate                                           |
| GET     | `/api/menu`                       | None              | None          | Public menu                                          |
| GET     | `/api/menu/:id`                   | None              | None          | Public single item                                   |
| POST    | `/api/menu`                       | verifyToken       | admin/coadmin | Create item                                          |
| PUT     | `/api/menu/:id`                   | verifyToken       | admin/coadmin | Update item                                          |
| PATCH   | `/api/menu/:id/availability`      | verifyToken       | admin/coadmin | Toggle available                                     |
| DELETE  | `/api/menu/:id`                   | verifyToken       | admin/coadmin | Delete item                                          |
| POST    | `/api/upload`                     | verifyToken       | admin/coadmin | Upload to Cloudinary                                 |
| DELETE  | `/api/upload`                     | verifyToken       | admin/coadmin | Delete from Cloudinary                               |
| GET     | `/api/gallery`                    | None              | None          | Public gallery                                       |
| POST    | `/api/gallery`                    | verifyToken       | admin/coadmin | Save image metadata                                  |
| PATCH   | `/api/gallery/:id`                | verifyToken       | admin/coadmin | Update caption/order                                 |
| DELETE  | `/api/gallery/:id`                | verifyToken       | admin/coadmin | Delete from Cloudinary + DB                          |
| GET     | `/api/specials`                   | None              | None          | Public specials                                      |
| POST    | `/api/specials`                   | verifyToken       | admin/coadmin | Create special                                       |
| PUT     | `/api/specials/:id`               | verifyToken       | admin/coadmin | Update special                                       |
| PATCH   | `/api/specials/:id/active`        | verifyToken       | admin/coadmin | Toggle active                                        |
| DELETE  | `/api/specials/:id`               | verifyToken       | admin/coadmin | Delete + Cloudinary cleanup                          |
| POST    | `/api/reservations`               | Rate limit (3/hr) | None          | Public booking with honeypot                         |
| GET     | `/api/reservations`               | verifyToken       | admin/coadmin | List all                                             |
| PATCH   | `/api/reservations/:id/status`    | verifyToken       | admin/coadmin | Update status + email                                |
| DELETE  | `/api/reservations/:id`           | verifyToken       | admin/coadmin | Delete                                               |
| GET     | `/api/notifications`              | verifyToken       | any accepted  | Role-filtered list                                   |
| GET     | `/api/notifications/unread-count` | verifyToken       | any accepted  | Count unread                                         |
| PATCH   | `/api/notifications/read-all`     | verifyToken       | any accepted  | Mark all read                                        |
| PATCH   | `/api/notifications/:id/read`     | verifyToken       | any accepted  | Mark one read                                        |
| GET     | `/api/settings`                   | None              | None          | Public (hours, address)                              |
| PUT     | `/api/settings`                   | verifyToken       | admin         | Update settings                                      |

---

### Data Models & Relationships

```
Employee
  ├── _id, name, email, phone, password
  ├── role: "admin" | "coadmin" | "employee"
  ├── status: "pending" | "accepted" | "rejected"
  └── approvalExpiresAt (used by cron cleanup)

MenuItem
  ├── name, price (Number), description
  ├── category: "breakfast" | "lunch" | "dessert" | "drinks" | "specials"
  ├── isSpecial (bool), available (bool), displayOrder
  └── imageUrl (optional, hero cards only)

Reservation
  ├── name, email, phone, guests, notes
  ├── date (String), time (String)
  └── status: "pending" | "confirmed" | "cancelled" | "completed"

Notification
  ├── type, message, relatedId
  ├── triggeredBy → Employee
  ├── visibleTo: "owner" | "coadmin" | "all"
  └── readBy: [Employee._id]  (array for per-user independent read tracking)

Gallery
  ├── imageUrl, publicId (Cloudinary)
  ├── caption, order
  └── uploadedBy → Employee  ⚠️ (currently ref: "User" — broken, should be "Employee")

Special
  ├── title, price, description
  ├── imageUrl, publicId (Cloudinary)
  ├── active (bool), displayOrder
  └── createdBy → Employee

Settings (singleton)
  ├── hours: { mon: { open, close, closed }, tue: ..., ... }
  ├── maxPartySize, maxDaysAhead
  └── phone, address, announcement
```

---

## 3. Security Findings

| Item                             | Status     | File:Line                                 | Severity | Recommendation                                                                                                         |
| -------------------------------- | ---------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Passwords hashed with bcryptjs   | ✅ PASS    | `routes/user.js:41`                       | —        | 10-round salt. Correct.                                                                                                |
| `password` field `select: false` | ❌ FAIL    | `model/employeeSchema.js:8`               | HIGH     | Add `select: false` — without it, any `.find()` that forgets to exclude password leaks hashes                          |
| JWT secret from env              | ✅ PASS    | `middleware/auth.js:30`                   | —        | Uses `process.env.JWT_SECRET`. Not hardcoded.                                                                          |
| JWT expiry                       | ✅ PASS    | `routes/user.js:142`                      | —        | 7 days (`expiresIn: "7d"`). Fine for internal tool.                                                                    |
| Token storage (client-side)      | ✅ PASS    | `context/AuthContext.jsx:33`              | —        | localStorage. Acceptable for internal staff tool.                                                                      |
| Rate limiting on auth routes     | ❌ FAIL    | `routes/user.js`                          | MEDIUM   | No limiter on `/login` or `/register`. Copy pattern from reservations.js — 5 attempts / 15 min.                        |
| Rate limiting on reservations    | ✅ PASS    | `routes/reservations.js:26`               | —        | 3 per hour per IP. Correct.                                                                                            |
| Input validation on user input   | ✅ PASS    | `routes/user.js:29`, `reservations.js:56` | —        | Trim, required checks, email regex, phone required.                                                                    |
| NoSQL injection via findById     | ✅ PASS    | All routes                                | —        | Mongoose ObjectId validation prevents injection on all ID params.                                                      |
| CORS config                      | ❌ FAIL    | `index.js:22`                             | CRITICAL | `cors()` with no options = `Access-Control-Allow-Origin: *`. Restrict to `process.env.FRONTEND_URL`.                   |
| Security headers (helmet)        | ❌ FAIL    | `index.js`                                | MEDIUM   | Not installed. Missing X-Frame-Options, CSP, HSTS, nosniff. `npm install helmet` + `app.use(helmet())`.                |
| RBAC: GET /api/user/ unguarded   | ❌ FAIL    | `routes/user.js:175`                      | CRITICAL | Returns full team roster (name, email, phone, role, status) to anonymous requests. Add `verifyToken, requireAccepted`. |
| All other write/admin routes     | ✅ PASS    | All routes                                | —        | Correctly guarded with verifyToken + role middleware.                                                                  |
| Hardcoded localhost in frontend  | ❌ FAIL    | `login.jsx:31`, `register.jsx:30`         | CRITICAL | These two files do not read `VITE_API_URL` — always hit localhost. Cannot deploy without fixing.                       |
| Secrets committed to repo        | ❌ FAIL    | `backend/.env`                            | CRITICAL | MongoDB password, JWT_SECRET, Cloudinary keys, Resend key all in git history. Rotate all + remove.                     |
| `.gitignore` covers `.env`       | ⚠️ PARTIAL | `backend/.gitignore:9`                    | HIGH     | `.env` is listed but already tracked. `git rm --cached` doesn't retroactively remove from history.                     |
| Gallery model `ref: "User"`      | ❌ FAIL    | `model/galleryImage.js:12`                | MEDIUM   | Mongoose model is `"Employee"` not `"User"`. `.populate()` returns null silently. Fix: `ref: "Employee"`.              |
| Stale duplicate schema file      | ❌ FAIL    | `controller/userSchema.js`                | LOW      | Dead code. Imports non-existent `bcrypt` (not `bcryptjs`). Delete it.                                                  |
| Error messages expose internals  | ⚠️ WARN    | Multiple catch blocks                     | LOW      | `error.message` returned to client can expose Mongoose/Cloudinary internals. Wrap with env check in production.        |
| Forgot-password flow             | NOT FOUND  | —                                         | MEDIUM   | No reset endpoint. Acceptable for MVP. Employees locked out permanently without admin intervention.                    |

---

## 4. Vulnerabilities & Bugs (by severity)

### Critical

#### 1. Unprotected `GET /api/user/` — deanonymizes entire team 00

**File:** `backend/routes/user.js:175`

Any unauthenticated HTTP request returns every employee's name, email, phone number, role, and status. This is the most immediately harmful bug — a public API that exposes your full staff directory.

**Fix:**

```js
// Before
router.get("/", async (req, res) => { ... });

// After
router.get("/", verifyToken, requireAccepted, async (req, res) => { ... });
```

---

#### 2. Secrets committed to `backend/.env`

**File:** `backend/.env`

MongoDB connection string (with password), JWT_SECRET (a full JWT token being used as a secret — structurally incorrect), Cloudinary API secret, and Resend API key are all in version control. These must be treated as already compromised.

**Fix steps:**

1. Remove from git: `git rm --cached backend/.env && git commit -m "Remove .env from tracking"`
2. If already pushed: `git push --force-with-lease` (coordinate with any collaborators)
3. Rotate every credential: MongoDB password, generate a new random JWT_SECRET (use `openssl rand -base64 32`), regenerate Cloudinary API key, regenerate Resend API key
4. Create `backend/.env.example` with placeholder values for documentation
5. Store real values in environment variables on the server or a secrets manager

---

#### 3. CORS accepts all origins

**File:** `backend/index.js:22`

`cors()` with no options sets `Access-Control-Allow-Origin: *`. Any website can make authenticated requests to the API on behalf of your logged-in staff.

**Fix:**

```js
// Before
app.use(cors());

// After
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

---

#### 4. Hardcoded `localhost:5000` in login and register

**Files:** `frontend/client/src/pages/login.jsx:31`, `register.jsx:30`

These two files do not read from `VITE_API_URL`. They will always target localhost. The dashboard files use the env var correctly — these two were written earlier and never updated.

**Fix:** Replace hardcoded URL with `import.meta.env.VITE_API_URL || "http://localhost:5000"` in both files, matching the pattern used in Dashboard and other components.

---

### High

#### 5. npm audit: 5 HIGH vulnerabilities

| Package                      | Issue                                          | Impact                  |
| ---------------------------- | ---------------------------------------------- | ----------------------- |
| `cloudinary < 2.7.0`         | Arbitrary argument injection via `&` in params | Affects upload pipeline |
| `multer 1.0.0–2.1.1`         | DoS via deeply nested field names              | File upload endpoint    |
| `path-to-regexp 8.0.0–8.3.0` | ReDoS via sequential optional groups           | All routing             |
| `picomatch ≤ 2.3.1`          | ReDoS + glob injection                         | Build tooling           |
| `brace-expansion`            | Hangs on large numeric ranges                  | Build tooling           |

**Fix:** `cd backend && npm audit fix --force`, then retest file uploads (multer and cloudinary are major components). Retest all routes after path-to-regexp upgrade.

---

#### 6. `password` field not marked `select: false`

**File:** `backend/model/employeeSchema.js:8`

If any future route calls `.find()` and forgets to exclude the password field, bcrypt hashes appear in API responses. There is no default protection.

**Fix:**

```js
password: { type: String, required: true, select: false },
```

---

#### 7. Gallery model `ref: "User"` is wrong

**File:** `backend/model/galleryImage.js:12`

The Mongoose model is registered as `"Employee"` but `uploadedBy` has `ref: "User"`. Any `.populate("uploadedBy")` call returns null silently.

**Fix:**

```js
uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
```

---

### Medium

#### 8. No rate limiting on `/login` or `/register`

**File:** `backend/routes/user.js`

Brute-force and credential stuffing are trivially possible. The rate limiter is already installed and used on reservations — this is a 10-line copy-paste.

**Fix:**

```js
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many attempts. Try again in 15 minutes." },
});

router.post("/login", authLimiter, async (req, res) => { ... });
router.post("/register", authLimiter, async (req, res) => { ... });
```

---

#### 9. No security headers (helmet not installed)

**File:** `backend/index.js`

Missing: `X-Frame-Options` (clickjacking), `X-Content-Type-Options` (MIME sniffing), `Strict-Transport-Security` (forces HTTPS), `Content-Security-Policy` (XSS protection).

**Fix:**

```bash
npm install helmet
```

```js
import helmet from "helmet";
app.use(helmet());
```

---

#### 10. No forgot-password flow

No password reset endpoint exists. If an employee forgets their password, only the admin can deactivate and re-invite them. Acceptable for MVP but should be added before broad rollout.

---

### Low

#### 11. `controller/userSchema.js` is dead code

**File:** `backend/controller/userSchema.js`

Stale duplicate of `employeeSchema.js`. Imports `bcrypt` (not `bcryptjs`, which is what's installed — would crash if run). Defines a pre-save hook that never executes. Should be deleted entirely.

---

#### 12. Error messages expose internals 00

Multiple catch blocks return `error.message` directly to the client. In production, this can expose Mongoose validation errors, Cloudinary API error details, and stack trace fragments.

**Fix:**

```js
catch (error) {
  console.error(error); // log internally
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development"
      ? error.message
      : "Internal server error",
  });
}
```

---

## 5. Deployment Blockers & Time Estimate

### Must fix before any deployment

| Task                                                     | File(s)                           | Est. Time    |
| -------------------------------------------------------- | --------------------------------- | ------------ |
| Remove `.env` from git, rotate all credentials           | `backend/.env`                    | 30 min       |
| Restrict CORS to frontend URL                            | `backend/index.js:22`             | 10 min       |
| Add `verifyToken` to `GET /api/user/`                    | `backend/routes/user.js:175`      | 5 min        |
| Fix `login.jsx` and `register.jsx` to use `VITE_API_URL` | `login.jsx:31`, `register.jsx:30` | 15 min       |
| `npm audit fix --force` + retest uploads and routes      | `backend/package.json`            | 30 min       |
| `npm install helmet` + `app.use(helmet())`               | `backend/index.js`                | 10 min       |
| Verify production build uses correct API URL             | `frontend/.env`                   | 20 min       |
| **Total**                                                |                                   | **~2 hours** |

---

### Should fix before users touch it

| Task                                          | File(s)                     | Est. Time   |
| --------------------------------------------- | --------------------------- | ----------- |
| Rate limit `/login` and `/register`           | `routes/user.js`            | 15 min      |
| `password: { select: false }` on schema       | `model/employeeSchema.js:8` | 5 min       |
| Fix Gallery `ref: "User"` → `ref: "Employee"` | `model/galleryImage.js:12`  | 5 min       |
| Sanitize error messages in catch blocks       | Multiple routes             | 20 min      |
| Delete `controller/userSchema.js`             | `controller/userSchema.js`  | 2 min       |
| **Total**                                     |                             | **~50 min** |

---

### Nice to have (post-launch)

| Task                                                   | Est. Time |
| ------------------------------------------------------ | --------- |
| Forgot-password / password reset flow                  | ~1 hr     |
| Request logging (morgan or similar)                    | 30 min    |
| Environment-specific build configs (`.env.production`) | 30 min    |
| Automated tests                                        | 4+ hrs    |

---

## 6. Prioritized Action List

### Phase 1 — Critical (blockers, do now)

1. **Rotate all credentials + remove `.env` from git history** — do this first; nothing else matters if the keys are already out 11
2. **Fix `GET /api/user/`** — add `verifyToken, requireAccepted` (two words, one line) 00
3. **Fix CORS** — one object argument to `cors()` 11
4. **Fix `login.jsx` and `register.jsx`** — replace hardcoded URL with `import.meta.env.VITE_API_URL` 11
5. **`npm audit fix --force`** — then retest gallery and specials uploads 11
6. **Add helmet** — `npm install helmet`, `app.use(helmet())` 11

### Phase 2 — High (same day)

7. **Rate limit auth routes** — copy pattern from reservations.js 11
8. **`password: { select: false }`** — one word on the schema 11
9. **Fix Gallery `ref: "Employee"`** — three characters 11
10. **Delete `controller/userSchema.js`** — dead code 00

### Phase 3 — Medium (before release)

11. **Sanitize error messages for production** 00
12. **Add forgot-password flow** 00
13. **Add request logging** 00

### Phase 4 — Nice to have (post-launch)

14. Migrate from localStorage to httpOnly cookies
15. Add automated tests (integration + E2E)
16. Set up environment-specific build configs

---

## 7. Codebase Strengths (no changes needed)

The following are implemented correctly and require no action:

- **Bcrypt password hashing** — 10-round salt, correct usage
- **JWT auth** — 7-day expiry, role + status claims embedded in token to avoid extra DB calls
- **Layered reservation security** — rate limiting + honeypot + date/time validation + duplicate prevention + email confirmation
- **Status-based access control** — pending users cannot access dashboard (enforced both frontend and backend)
- **Role hierarchy** — admin > coadmin > employee with correct route guards throughout
- **Notification visibility filtering** — role-based access per notification type
- **Image handling** — Cloudinary cleanup on delete, 5MB size limit, MIME type allowlist
- **Input validation** — trimming, type coercion, enum validation on categories
- **Graceful failures** — notification errors don't block operations; email failures are logged, not thrown
- **Cron job cleanup** — auto-deletes pending signups after 3 days with related notifications
- **Email confirmations** — async sends with templates for reservation flow
- **Shared upload endpoint** — two-step pattern (file → Cloudinary, URL → DB) serves gallery, specials, and menu uniformly

---

_End of report. All file:line references are relative to the project root._
