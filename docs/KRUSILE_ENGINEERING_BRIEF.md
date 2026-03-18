# Krusile Engineering Brief — E-BPHTB System

**Author:** Krusile (Senior Systems Architect)  
**Scope:** High-performance web, notification architecture, security audit, backend optimization  
**Stack context:** Node.js/Express, PostgreSQL, static HTML/JS frontend, Socket.IO (separate), no Redis

---

## 1. High-Performance Web Generation

### Current State
- **Frontend:** Static HTML/CSS/vanilla JS served via `express.static`; no build pipeline (Vite mentioned in TA docs but not in repo).
- **No SSR/SSG:** Every page is full document load; no code-splitting or lazy-loading at build time.
- **Core Web Vitals risk:** Unoptimized assets, no critical-CSS inlining, polling every 5s for notifications adds load.

### Target: Sub-Second Load + Strong Core Web Vitals

**1.1 Asset & Delivery**

- **Critical path:** Inline above-the-fold CSS in `<head>`, defer non-critical CSS and JS.
- **Caching:** Set strong cache headers for immutable assets (e.g. hashed filenames):
  - `Cache-Control: public, max-age=31536000, immutable` for `/design-n-script/`, `/asset/` (once you add content hashes).
- **Compression:** Ensure gzip/Brotli on static files (Express: `compression` middleware).
- **Images:** Use responsive images (`srcset`, `sizes`) and modern formats (WebP/AVIF) where supported; lazy-load below the fold.

**1.2 Frontend Build (Recommended)**

Introduce a minimal build step so you can:

- Bundle and minify JS (e.g. Vite in library mode or esbuild).
- Generate hashed filenames for long-term caching.
- Optionally: extract and inline critical CSS for key routes.

First Contentful Paint (FCP) and Largest Contentful Paint (LCP) improvement:

\[
\text{LCP (target)} \leq 2.5\,\text{s} \quad\Rightarrow\quad \text{prioritize LCP resource (e.g. hero/table), preload font/hero image}
\]

- Preload the single largest image or font used for LCP: `<link rel="preload" as="image" href="...">`.
- Avoid loading notification script in `<head>`; load it after initial paint (e.g. `defer` or inject after `DOMContentLoaded`).

**1.3 Notification Polling vs. Web**

- Polling `/api/notifications/unread` every 5s hurts TTFB and increases server load under many concurrent users.
- Prefer **WebSocket (or SSE)** for real-time notifications so the client does not repeatedly open HTTP connections; this also improves Total Blocking Time (TBT) by reducing timer-driven work on the main thread.

**1.4 Metrics to Track**

- **LCP** < 2.5s, **FID/INP** < 100ms, **CLS** < 0.1.
- Measure with Lighthouse (CI or periodic) and Real User Monitoring (RUM) if you have a front-end analytics layer.

---

## 2. Notification System Architecture

### Current State
- Notifications: **DB-driven** (`notifications` / `sys_notifications`); **polling** on `/api/notifications/unread`; **Socket.IO** in `backend/ping-notification-api.js` (separate process); notification warehouse tries to `import('socket.io')` and may not share an `io` instance with the main app.
- **No Redis:** No distributed cache, no queue; scaling beyond one app instance will not share session or notification state.

### Design: Robust Notification Engine (Concept: Go + Redis)

If you introduce a **dedicated notification service** (e.g. in Go) and Redis:

**2.1 Components**

1. **Redis**
   - **Pub/Sub:** One channel per user or per division (e.g. `notif:user:{userid}` or `notif:divisi:LTB`). Backend publishes; clients subscribe via WebSocket gateway.
   - **Queue (optional):** For reliable delivery: push to a Redis list (e.g. `notif:queue`), worker(s) pop, persist to DB and publish to Redis; decouples “write to DB” from “push to client.”
   - **Rate limiting:** Sliding window in Redis (e.g. `notif:rl:{userid}`) to avoid notification storms.

2. **Go service (conceptual)**
   - Listens to Redis Pub/Sub (or queue).
   - Maintains WebSocket connections (e.g. Gorilla WebSocket or similar); maps `user_id` → set of connections.
   - On message from Redis: fan-out to all connections for that user/division.
   - Handles connection lifecycle (auth, heartbeat, cleanup). Exposes a small HTTP API for “send notification” that writes to DB (or queue) and publishes to Redis.

3. **Existing Node app**
   - Instead of (or in addition to) writing only to DB and hoping polling/WebSocket sees it: after inserting into `notifications`, **publish to Redis** (e.g. `notif:user:{userid}`) with payload. Go service (or a Node WebSocket gateway) subscribed to Redis pushes to connected clients.

**2.2 Node-Only Variant (No Go)**

- Add **Redis** to the stack.
- **Single HTTP + WebSocket server:** Mount Socket.IO (or raw WebSocket) on the same Express server so one process handles both HTTP and WS (no “ping API separate from main app”).
- **Flow:**  
  - On notification create: (1) INSERT into PostgreSQL, (2) publish event to Redis channel `notif:user:{userid}` (and optionally `notif:divisi:{divisi}`).  
  - A small subscriber in the same Node process (or a dedicated worker) subscribes to Redis and calls `io.to(room).emit(...)` so all clients in that room get the notification.
- **Rooms:** Join socket to room by `userid` (and optionally `divisi`) on auth. When Redis message arrives, emit to the corresponding room(s).
- **Delivery guarantee:** For “at least once” delivery, keep DB as source of truth; on client connect, send last N notifications (or unread count) from DB, then rely on real-time for new ones.

**2.3 Formulas (throughput)**

Let \( \lambda \) = notification creation rate (per second), \( \mu \) = consumer throughput. For stability:

\[
\mu > \lambda \quad \text{and} \quad \text{queue depth} = \int (\lambda - \mu)\,dt \quad \text{bounded (e.g. by max list length in Redis)}
\]

Use Redis LIST with bounded length (e.g. `LTRIM`) to avoid unbounded growth; add monitoring (queue depth, consumer lag).

---

## 3. Security for Civil Account Data (GDPR / ISO 27001)

### Current State (from codebase)
- **Encryption at rest:** AES-256-GCM for sensitive files (e.g. KTP) in `secure_storage.js`; key from `FILE_ENCRYPTION_KEY`; IV and auth tag stored with metadata.
- **Session:** Express session; cookie `httpOnly: false`, `secure: false` (documented as “for debugging”) — **critical to fix.**
- **Auth:** bcrypt for passwords; session-based auth; JWT used in ping API; no app-wide API rate limit.
- **Sensitive data exposure:** `/api/profile` reportedly returns password (hash) — must be removed.
- **Access control:** Admin-only access to secure file retrieval; file access logging present.

### Audit Checklist (GDPR / ISO 27001–aligned)

**3.1 Data Classification & Minimisation**
- Classify civil account data (e.g. KTP, NPWP, names, addresses) as **personal/sensitive**.
- Ensure only fields necessary for the business process are stored and displayed; do not return password (or hash) in any API response.

**3.2 Lawfulness & Purpose**
- Document legal basis (e.g. consent, contract, legal obligation) and purpose for each data category.
- Retention: define and enforce retention periods; auto-delete or anonymise after the period (e.g. cron job + DB cleanup).

**3.3 Encryption**
- **At rest:** Current AES-256-GCM for sensitive files is strong; ensure `FILE_ENCRYPTION_KEY` is 32-byte (or 64 hex), rotated via procedure, and not in code.
- **In transit:** TLS 1.2+ only; HSTS; `secure: true` on cookies in production.
- **Key management:** Prefer a KMS (e.g. AWS KMS, GCP KMS) for envelope encryption of `FILE_ENCRYPTION_KEY` in production rather than raw env var.

**3.4 Access Control & Session**
- Set cookie flags: `httpOnly: true`, `secure: true` (production), `sameSite: 'strict'` (or `'lax'` if cross-origin login required).
- Implement role-based access; audit logs for access to sensitive data (you have file access logs; extend to API access to civil data if not already).
- Session fixation: regenerate session ID after login (express-session supports this).

**3.5 Integrity & Availability**
- DB backups, point-in-time recovery; test restore.
- Integrity: GCM auth tag already protects ciphertext; ensure metadata (e.g. `fileId`, `userId`) is validated before decrypt.

**3.6 Breach & Subject Rights**
- Process for breach notification (e.g. 72h where applicable).
- Procedures (and APIs) for data subject access, rectification, erasure (“right to be forgotten”): e.g. export and delete user data; purge or anonymise in DB and in secure storage.

**3.7 Operational Security**
- No global API rate limit today: add one (e.g. per IP and per user) to reduce brute-force and abuse.
- CORS: allow only needed origins; use `credentials: true` only when required and with explicit allowlist.
- Fix path traversal: serve uploads via safe path resolution (e.g. `req.params[0]` normalized, no `..`, bound to upload root).
- Remove or stub `sendNotificationToLtb` if undefined; avoid runtime errors that can leak stack traces.

---

## 4. Backend Optimization

### 4.1 Bottlenecks Identified

| Area | Issue | Impact |
|------|--------|--------|
| **DB** | No Redis; every notification read hits PostgreSQL. | Under load, many polling clients → high QPS on `notifications` table. |
| **Session** | Session store in PostgreSQL; no cache. | Every authenticated request may hit DB for session. |
| **Rate limiting** | Only on reset-password and profile; no global API limiter. | API abuse, brute force, no per-user fairness. |
| **WebSocket** | Socket.IO in separate server; main app may not have shared `io`. | Real-time notifications unreliable or missing. |
| **Logging** | `console.log` per query in `db.js` (every query logged). | I/O and log volume under high QPS. |
| **Heavy routes** | Some routes do multiple serial DB calls (e.g. booking + user + notifications). | Latency adds up; no batching or parallelisation. |

### 4.2 Eliminating Bottlenecks

**4.2.1 API layer**
- Add **global rate limiter** (e.g. `express-rate-limit` with a store). For multi-instance: use Redis store (e.g. `rate-limit-redis`) so limit is shared.
- **CORS:** Set `origin: allowedOrigins`, `credentials: true` explicitly where needed; avoid `*` with credentials.
- **Path traversal:** Serve static/uploads from a dedicated route; resolve path with `path.join(root, normalizedPath)` and ensure result stays under `root` (e.g. `path.relative(root, resolved)?.startsWith('..')` → 400).

**4.2.2 Database**
- **Indexes:** Ensure indexes on `notifications(user_id, created_at)`, `notifications(status, user_id)`, and on booking/status columns used in `triggerNotificationByStatus` and list APIs.
- **Connection pool:** Current pool (max 20) is reasonable; monitor pool usage and DB CPU; if many long-running queries, consider statement timeouts (you have 30s) and query cancellation for slow requests.
- **Avoid SELECT ... FOR UPDATE on GET:** Use FOR UPDATE only in write/transaction flows; remove from read-only GET handlers.
- **N+1:** In routes that return lists with related data, use JOINs or batched queries instead of per-item queries.

**4.2.3 Notification path**
- **Short term:** Reduce polling frequency where acceptable (e.g. 10–15s) and ensure notification list endpoint is indexed and returns only needed columns.
- **Medium term:** Single process with Socket.IO + Redis pub/sub so one write to DB + one Redis publish updates all connected clients without polling.

**4.2.4 Logging**
- In production, avoid logging every query in hot path; use a logger with levels and log queries at `debug` or only when `duration > threshold`.
- Structured logs (JSON) with request id, user id, route, duration for tracing and monitoring.

### 4.3 Clean, Testable, Maintainable Code

**4.3.1 Structure**
- **Layered:** Controllers → Services → Repositories (DB). Keep SQL in repositories; business logic (e.g. `triggerNotificationByStatus`) in services; controllers only handle HTTP and call services.
- **Dependency injection:** Pass `pool`, `logger`, `notificationService` into routers so tests can inject mocks.
- **Config:** Centralise env (e.g. `config/index.js`); no `process.env` scattered in business logic.

**4.3.2 Testing**
- **Unit:** Services and repositories with mocked `pool` and notification client.
- **Integration:** Supertest against Express app with test DB (or transactions rolled back); test auth, notification create, and critical GETs.
- **E2E (optional):** Critical flows (e.g. login → create booking → trigger notification) with real browser or API client.

**4.3.3 Consistency**
- Resolve table naming (`ppat_*` vs `pat_*`); pick one schema and migrate.
- Normalise date format (e.g. ISO in API and DB); avoid mixed `'01052025'` and `'dd-mm-yyyy'`.
- Unify session key for photo (`fotoprofil` vs `foto`); use boolean for `persetujuan` in DB.

**4.3.4 Technical debt (from index.js audit)**
- Fix: logger before morgan; single session middleware with store; remove password from profile response; stub or implement `sendNotificationToLtb`; fix PDF generator and path joins; correct email subject “SSPD”.

---

## 5. Priority Order (Recommendation)

1. **Security (immediate):** Cookie flags, remove password from profile, path traversal fix, global rate limit.
2. **Stability:** Single server with Socket.IO + Redis for notifications; fix WebSocket wiring so warehouse and main app share the same `io`.
3. **Performance:** Indexes on notification and booking tables; reduce query logging in production; add compression for static assets.
4. **Front-end:** Build step + hashed assets, critical CSS, preload LCP resource, defer notification script.
5. **Maintainability:** Layered structure, DI, config centralisation, and tests for new code.

---

## 6. Summary

| Pillar | Action |
|--------|--------|
| **Web performance** | Build pipeline, hashed assets, critical CSS, preload LCP, compression; move from polling to WebSocket/SSE. |
| **Notifications** | Introduce Redis; single process HTTP+WS; publish on notification create; rooms by user/division; optional Go service later. |
| **Security** | Harden cookies; no password in API; rate limit; CORS; path safety; KMS for encryption key in prod; document retention and subject rights. |
| **Backend** | Global rate limit; DB indexes; no FOR UPDATE on GET; structured logging; layered design; tests and config centralisation. |

This keeps the technology stack robust, scalable, and aligned with both performance goals and civil data protection standards.
