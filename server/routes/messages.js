import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/messages/conversations – list conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true, office: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const where = {};
    if (user.office) where.officeId = user.office.id;
    else if (user.provider) where.providerId = user.provider.id;

    // Get latest message per conversation partner
    const messages = await prisma.message.findMany({
      where,
      include: {
        office: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation (office-provider pair)
    const conversationMap = new Map();
    for (const msg of messages) {
      const key = `${msg.officeId}-${msg.providerId}`;
      if (!conversationMap.has(key)) {
        conversationMap.set(key, msg);
      }
    }

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:officeId/:providerId – get thread between office and provider
router.get('/:officeId/:providerId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        officeId: req.params.officeId,
        providerId: req.params.providerId,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages – send a message
router.post('/', async (req, res) => {
  try {
    const { officeId, providerId, body } = req.body;
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });

    const message = await prisma.message.create({
      data: {
        officeId,
        providerId,
        fromRole: user.role,
        body,
      },
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/messages/:id/read – mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/messages/read-all – mark all messages in a thread as read
router.patch('/read-all/:officeId/:providerId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
    // Mark messages as read where current user is the recipient
    const oppositeRole = user.role === 'OFFICE' ? 'PROVIDER' : 'OFFICE';

    await prisma.message.updateMany({
      where: {
        officeId: req.params.officeId,
        providerId: req.params.providerId,
        fromRole: oppositeRole,
        read: false,
      },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
