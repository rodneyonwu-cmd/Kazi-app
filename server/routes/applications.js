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
    if (!user?.provider) return res.status(403).json({ error: 'Only providers can apply' });

    const { shiftId, note } = req.body;
    const application = await prisma.application.create({
      data: { shiftId, providerId: user.provider.id, note },
    });
    res.status(201).json(application);
  } catch (err) {
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
