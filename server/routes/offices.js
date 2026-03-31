import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/offices – list offices (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { city, state, specialty } = req.query;
    const where = {};
    if (city) where.city = city;
    if (state) where.state = state;
    if (specialty) where.specialty = specialty;

    const offices = await prisma.office.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offices/:id
router.get('/:id', async (req, res) => {
  try {
    const office = await prisma.office.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } },
        shifts: { where: { status: 'OPEN' }, orderBy: { date: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!office) return res.status(404).json({ error: 'Office not found' });
    res.json(office);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offices – create office profile for current user
router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const office = await prisma.office.create({
      data: { userId: user.id, ...req.body },
    });
    res.status(201).json(office);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/offices/:id
router.patch('/:id', async (req, res) => {
  try {
    const office = await prisma.office.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(office);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offices/:id/save-provider
router.post('/:id/save-provider', async (req, res) => {
  try {
    const { providerId } = req.body;
    const saved = await prisma.savedProvider.create({
      data: { officeId: req.params.id, providerId },
    });
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already saved' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/offices/:id/save-provider/:providerId
router.delete('/:id/save-provider/:providerId', async (req, res) => {
  try {
    await prisma.savedProvider.delete({
      where: {
        officeId_providerId: {
          officeId: req.params.id,
          providerId: req.params.providerId,
        },
      },
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offices/:id/saved-providers
router.get('/:id/saved-providers', async (req, res) => {
  try {
    const saved = await prisma.savedProvider.findMany({
      where: { officeId: req.params.id },
      include: {
        provider: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
