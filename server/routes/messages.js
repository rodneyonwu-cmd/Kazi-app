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

    // Group by conversation (office-provider pair) — keep latest message + unread count
    const conversationMap = new Map();
    const unreadCounts = {};
    const myRole = user.office ? 'OFFICE' : 'PROVIDER';

    for (const msg of messages) {
      const key = `${msg.officeId}-${msg.providerId}`;
      if (!conversationMap.has(key)) {
        conversationMap.set(key, msg);
        unreadCounts[key] = 0;
      }
      // Count messages sent TO me that I haven't read
      if (!msg.read && msg.fromRole !== myRole) {
        unreadCounts[key]++;
      }
    }

    const convos = Array.from(conversationMap.entries()).map(([key, msg]) => ({
      ...msg,
      unreadCount: unreadCounts[key] || 0,
    }));

    res.json(convos);
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

// GET /api/messages/unread-count – count unread messages for current user
router.get('/unread-count', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { office: true, provider: true },
    });
    if (!user) return res.json({ count: 0 });

    // Unread = messages NOT from me that are unread
    const where = { read: false };
    if (user.office) {
      where.officeId = user.office.id;
      where.fromRole = 'PROVIDER'; // messages FROM providers TO this office
    } else if (user.provider) {
      where.providerId = user.provider.id;
      where.fromRole = 'OFFICE'; // messages FROM offices TO this provider
    }

    const count = await prisma.message.count({ where });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages – send a message
router.post('/', async (req, res) => {
  try {
    let { officeId, providerId, body } = req.body;
    console.log('[POST /api/messages] officeId:', officeId, 'providerId:', providerId, 'body length:', body?.length);

    if (!body?.trim()) {
      return res.status(400).json({ error: 'Message body is required' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { office: true, provider: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Auto-resolve missing IDs from the logged-in user's profile
    // If officeId is provided (messaging a specific office), the sender must be the provider
    // If providerId is provided (messaging a specific provider), the sender must be the office
    if (officeId && !providerId) {
      // Sender is provider side — fill in their provider ID
      if (user.provider) {
        providerId = user.provider.id;
      } else {
        // User has no provider record — create one on the fly for testing
        console.log('[POST /api/messages] Auto-creating provider for user:', user.id);
        const provider = await prisma.provider.create({ data: { userId: user.id, role: 'Dental Professional' } });
        providerId = provider.id;
      }
    } else if (providerId && !officeId) {
      // Sender is office side — fill in their office ID
      if (user.office) {
        officeId = user.office.id;
      } else {
        console.log('[POST /api/messages] Auto-creating office for user:', user.id);
        const office = await prisma.office.create({ data: { userId: user.id, name: 'My Office' } });
        officeId = office.id;
      }
    } else if (!officeId && !providerId) {
      return res.status(400).json({ error: 'Please specify who you want to message.' });
    }

    const fromRole = user.office ? 'OFFICE' : user.provider ? 'PROVIDER' : user.role;

    const message = await prisma.message.create({
      data: {
        officeId,
        providerId,
        fromRole,
        body: body.trim(),
      },
      include: {
        office: { include: { user: { select: { firstName: true, lastName: true } } } },
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    console.log('[POST /api/messages] Created message:', message.id);
    res.status(201).json(message);
  } catch (err) {
    console.error('[POST /api/messages] Error:', err.message);
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
