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

export { clerk };
