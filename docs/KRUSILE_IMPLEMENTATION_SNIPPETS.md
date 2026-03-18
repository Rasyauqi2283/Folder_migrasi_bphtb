# Krusile — Implementation Snippets

Concrete patterns to implement the Engineering Brief. Use as reference; adapt to your project layout.

---

## 1. Global API Rate Limiter (Node + in-memory or Redis)

```javascript
// In index.js, before mounting API routes
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis'; // optional: npm i rate-limit-redis
import { createClient } from 'redis';

// Option A: In-memory (single instance only)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Option B: Redis store (multi-instance)
// const redis = createClient({ url: process.env.REDIS_URL });
// await redis.connect();
// const globalLimiter = rateLimit({
//   store: new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) }),
//   windowMs: 60 * 1000,
//   max: 100,
//   standardHeaders: true,
// });
// app.use('/api/', globalLimiter);
app.use('/api/', globalLimiter);
```

---

## 2. Session Cookie Hardening (Production)

```javascript
// When creating express-session
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: pgStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,   // set true
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  name: 'bappenda.sid',
};
app.use(session(sessionConfig));
```

---

## 3. Redis Pub/Sub for Notifications (Node)

After inserting a row into `notifications`, publish so a WebSocket gateway can push to clients.

```javascript
// notif_publisher.js
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
await redis.connect();

const NOTIF_CHANNEL_PREFIX = 'notif:user:';

export async function publishNotification(userId, payload) {
  const channel = `${NOTIF_CHANNEL_PREFIX}${userId}`;
  await redis.publish(channel, JSON.stringify(payload));
}
```

```javascript
// In notification_service.js, after INSERT into notifications
import { publishNotification } from './notif_publisher.js';

// After you have recipient user ids (e.g. from divisi or direct)
for (const userId of recipientUserIds) {
  await publishNotification(userId, {
    id: notif.id,
    title: notif.title,
    message: notif.message,
    created_at: notif.created_at,
  });
}
```

Subscriber (e.g. in the same process that holds Socket.IO):

```javascript
// notif_subscriber.js
import { createClient } from 'redis';
// io = your Socket.IO server instance

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

await redis.subscribe('notif:user:*', (channel, message) => {
  const payload = JSON.parse(message);
  const userId = channel.replace('notif:user:', '');
  io.to(`user:${userId}`).emit('notification', payload);
});
```

Note: Redis `SUBSCRIBE` does not support wildcards; you either subscribe per channel (e.g. one subscriber per user) or use a single channel and include `userId` in the message and fan-out in the subscriber.

Simpler single-channel pattern:

```javascript
// Publish: redis.publish('notifications', JSON.stringify({ userId, ...payload }));
// Subscriber:
await redis.subscribe('notifications', (ch, message) => {
  const { userId, ...payload } = JSON.parse(message);
  io.to(`user:${userId}`).emit('notification', payload);
});
```

---

## 4. Safe File Serve (Avoid Path Traversal)

```javascript
// Serve uploads only from a fixed root; normalize path
import path from 'path';

const UPLOADS_ROOT = path.resolve(__dirname, 'public', 'uploads');

app.get('/uploads/*', (req, res) => {
  const requested = req.params[0] || '';
  const resolved = path.resolve(UPLOADS_ROOT, requested);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    return res.status(400).send('Invalid path');
  }
  res.sendFile(resolved, { maxAge: '1d' }, (err) => {
    if (err) res.status(err.status || 500).end();
  });
});
```

---

## 5. Profile Response — Exclude Password

In profile endpoint, never send `password` or `password_hash`:

```javascript
// When returning user profile
const { password, ...safeUser } = userRow;
res.json({ success: true, user: safeUser });
```

---

## 6. DB Query Logging — Production

Avoid logging every query in production; use level and threshold:

```javascript
// db.js
const logQuery = (text, durationMs) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Query (${durationMs}ms):`, text.split('\n')[0]);
  } else if (durationMs > 1000) {
    logger.warn({ durationMs, query: text.split('\n')[0] }, 'Slow query');
  }
};
```

---

## 7. Go Notification Service (Conceptual Layout)

If you later add a small Go service for WebSocket + Redis:

- **HTTP:** `POST /notify` — accepts `{ user_id, title, message }`; validates; writes to PostgreSQL (or pushes to Redis queue); publishes to Redis channel.
- **WebSocket:** `/ws` — client sends auth (e.g. JWT or session id); server maps `user_id` to connection; subscribes to Redis `notif:user:{user_id}`; on message, writes to WebSocket.
- **Redis:** Use `go-redis`; subscribe in a goroutine; fan-out to connected clients. Use a sync.Map or channel to store `user_id -> []*Connection`.
- **Deployment:** Run alongside Node; Node publishes to Redis after DB insert; Go serves WebSocket and subscribes to Redis. Clients connect to Go for real-time and still use Node for REST.

This keeps the “notification engine” resilient and scalable while your main app remains Node.
