import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { requireAuth, optionalAuth } from './middleware/auth.js';
import usersRouter from './routes/users.js';
import officesRouter from './routes/offices.js';
import providersRouter from './routes/providers.js';
import shiftsRouter from './routes/shifts.js';
import applicationsRouter from './routes/applications.js';
import bookingsRouter from './routes/bookings.js';
import messagesRouter from './routes/messages.js';
import reviewsRouter from './routes/reviews.js';
import webhooksRouter from './routes/webhooks.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    // Allow configured production URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ── Health check ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Webhooks (no auth required) ─────────────────────
app.use('/api/webhooks', webhooksRouter);

// ── Auth-protected routes ───────────────────────────
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/offices', optionalAuth, officesRouter);
app.use('/api/providers', optionalAuth, providersRouter);
app.use('/api/shifts', requireAuth, shiftsRouter);
app.use('/api/applications', requireAuth, applicationsRouter);
app.use('/api/bookings', requireAuth, bookingsRouter);
app.use('/api/messages', requireAuth, messagesRouter);
app.use('/api/reviews', requireAuth, reviewsRouter);
app.use('/api/notifications', requireAuth, notificationsRouter);

// ── Error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Kazi API running on http://localhost:${PORT}`);
});
