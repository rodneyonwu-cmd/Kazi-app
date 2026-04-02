import { createClerkClient, verifyToken } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware that requires a valid Clerk session.
// Attaches `req.auth` with { userId (clerkId), sessionId }.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.auth = { userId: payload.sub, sessionId: payload.sid };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware that tries to authenticate but does not reject if auth fails.
// Attaches `req.auth` if token is valid, otherwise sets `req.auth = null`.
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.auth = null;
    return next();
  }

  const token = header.split(' ')[1];
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    req.auth = { userId: payload.sub, sessionId: payload.sid };
  } catch {
    req.auth = null;
  }
  next();
}

export { clerk };
