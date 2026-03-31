import { Webhook } from 'svix';

// Verifies Clerk webhook signatures using svix.
export function verifyWebhook(req, res, next) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const wh = new Webhook(secret);
  const headers = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };

  try {
    const payload = wh.verify(JSON.stringify(req.body), headers);
    req.webhookEvent = payload;
    next();
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }
}
