import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/providers – list providers (with filters)
router.get('/', async (req, res) => {
  try {
    const { role, city, state, verified } = req.query;
    const where = {};
    if (role) where.role = role;
    if (city) where.city = city;
    if (state) where.state = state;
    if (verified !== undefined) where.verified = verified === 'true';

    const providers = await prisma.provider.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { reliabilityScore: 'desc' },
    });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/providers/:id
router.get('/:id', async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, email: true } },
        credentials: true,
        availability: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers – create provider profile
router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const provider = await prisma.provider.create({
      data: { userId: user.id, ...req.body },
    });
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/providers/:id
router.patch('/:id', async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Availability ────────────────────────────────────
// GET /api/providers/:id/availability
router.get('/:id/availability', async (req, res) => {
  try {
    const slots = await prisma.availability.findMany({
      where: { providerId: req.params.id },
      orderBy: [{ dayOfWeek: 'asc' }, { date: 'asc' }],
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/:id/availability
router.post('/:id/availability', async (req, res) => {
  try {
    const slot = await prisma.availability.create({
      data: { providerId: req.params.id, ...req.body },
    });
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/:id/availability/:slotId
router.delete('/:id/availability/:slotId', async (req, res) => {
  try {
    await prisma.availability.delete({ where: { id: req.params.slotId } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Credentials ─────────────────────────────────────
// GET /api/providers/:id/credentials
router.get('/:id/credentials', async (req, res) => {
  try {
    const credentials = await prisma.credential.findMany({
      where: { providerId: req.params.id },
    });
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/:id/credentials
router.post('/:id/credentials', async (req, res) => {
  try {
    const credential = await prisma.credential.create({
      data: { providerId: req.params.id, ...req.body },
    });
    res.status(201).json(credential);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Saved Offices ───────────────────────────────────
// POST /api/providers/:id/save-office
router.post('/:id/save-office', async (req, res) => {
  try {
    const { officeId } = req.body;
    const saved = await prisma.savedOffice.create({
      data: { providerId: req.params.id, officeId },
    });
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already saved' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/:id/save-office/:officeId
router.delete('/:id/save-office/:officeId', async (req, res) => {
  try {
    await prisma.savedOffice.delete({
      where: {
        providerId_officeId: {
          providerId: req.params.id,
          officeId: req.params.officeId,
        },
      },
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/providers/:id/saved-offices
router.get('/:id/saved-offices', async (req, res) => {
  try {
    const saved = await prisma.savedOffice.findMany({
      where: { providerId: req.params.id },
      include: {
        office: {
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
