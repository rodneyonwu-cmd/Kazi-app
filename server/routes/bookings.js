import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/bookings – list bookings for current user
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true, office: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const where = {};
    if (user.provider) where.providerId = user.provider.id;
    else if (user.office) where.officeId = user.office.id;

    const { status } = req.query;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        shift: true,
        office: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        shift: true,
        office: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        reviews: true,
      },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id – complete or cancel
router.patch('/:id', async (req, res) => {
  try {
    const { status, cancelledBy, cancelNote } = req.body;
    const data = { status };
    if (cancelledBy) data.cancelledBy = cancelledBy;
    if (cancelNote) data.cancelNote = cancelNote;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data,
    });

    // If completed, also mark the shift as completed
    if (status === 'COMPLETED') {
      await prisma.shift.update({
        where: { id: booking.shiftId },
        data: { status: 'COMPLETED' },
      });
    }

    // If cancelled, re-open the shift
    if (status === 'CANCELLED') {
      await prisma.shift.update({
        where: { id: booking.shiftId },
        data: { status: 'OPEN' },
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
