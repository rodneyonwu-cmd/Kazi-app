import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/reviews – list reviews for a provider or office
router.get('/', async (req, res) => {
  try {
    const { providerId, officeId } = req.query;
    const where = {};
    if (providerId) where.providerId = providerId;
    if (officeId) where.officeId = officeId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        booking: { include: { shift: true } },
        office: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        provider: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews – create a review for a completed booking
router.post('/', async (req, res) => {
  try {
    const { bookingId, rating, comment, tags } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        officeId: booking.officeId,
        providerId: booking.providerId,
        rating,
        comment,
        tags: tags || [],
      },
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
