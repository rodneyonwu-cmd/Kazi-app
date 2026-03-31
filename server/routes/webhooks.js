import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { verifyWebhook } from '../middleware/clerkWebhook.js';

const router = Router();

// POST /api/webhooks/clerk – sync Clerk users to the database
router.post('/clerk', verifyWebhook, async (req, res) => {
  const event = req.webhookEvent;
  const { type, data } = event;

  try {
    switch (type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = data;
        const primaryEmail = email_addresses?.[0]?.email_address;
        const role = unsafe_metadata?.role || 'PROVIDER';

        await prisma.user.create({
          data: {
            clerkId: id,
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            avatarUrl: image_url || null,
            role: role,
          },
        });
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const primaryEmail = email_addresses?.[0]?.email_address;

        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            avatarUrl: image_url || null,
          },
        });
        break;
      }

      case 'user.deleted': {
        const { id } = data;
        await prisma.user.delete({ where: { clerkId: id } }).catch(() => {
          // User may not exist in our DB yet
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Webhook error (${type}):`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
