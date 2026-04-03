import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/applications – list applications for current user
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true, office: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let where = {};
    if (user.provider) {
      where.providerId = user.provider.id;
    } else if (user.office) {
      where.shift = { officeId: user.office.id };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        shift: {
          include: {
            office: {
              include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            },
          },
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/applications – apply for a shift
router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!user.provider) {
      // Auto-create a provider profile for testing
      console.log('[POST /api/applications] Auto-creating provider profile for user:', user.id);
      const provider = await prisma.provider.create({ data: { userId: user.id, role: 'Dental Professional' } });
      user.provider = provider;
    }

    const { shiftId, note } = req.body;
    if (!shiftId) return res.status(400).json({ error: 'Shift ID is required.' });

    // Check shift exists and is open
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return res.status(404).json({ error: 'Shift not found.' });
    if (shift.status !== 'OPEN') return res.status(400).json({ error: 'This shift is no longer accepting applications.' });

    // Check for duplicate application
    const existing = await prisma.application.findFirst({
      where: { shiftId, providerId: user.provider.id },
    });
    if (existing) return res.status(409).json({ error: 'You have already applied to this shift.' });

    const application = await prisma.application.create({
      data: { shiftId, providerId: user.provider.id, note },
    });
    console.log('[POST /api/applications] Created application:', application.id, 'for shift:', shiftId);
    res.status(201).json(application);
  } catch (err) {
    console.error('[POST /api/applications] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/applications/:id – accept/decline/withdraw
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    // If accepted, create a booking and mark shift as filled
    if (status === 'ACCEPTED') {
      const app = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: { shift: true },
      });

      await prisma.$transaction([
        prisma.booking.create({
          data: {
            shiftId: app.shiftId,
            officeId: app.shift.officeId,
            providerId: app.providerId,
          },
        }),
        prisma.shift.update({
          where: { id: app.shiftId },
          data: { status: 'FILLED' },
        }),
        // Decline other pending applications for this shift
        prisma.application.updateMany({
          where: {
            shiftId: app.shiftId,
            id: { not: req.params.id },
            status: 'PENDING',
          },
          data: { status: 'DECLINED' },
        }),
      ]);
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
