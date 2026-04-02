import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/shifts – list shifts (with filters)
router.get('/', async (req, res) => {
  try {
    const { role, status, city, state, minRate, date } = req.query;
    const where = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (minRate) where.hourlyRate = { gte: parseFloat(minRate) };
    if (date) where.date = new Date(date);
    if (city || state) {
      where.office = {};
      if (city) where.office.city = city;
      if (state) where.office.state = state;
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        office: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { date: 'asc' },
    });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shifts/:id
router.get('/:id', async (req, res) => {
  try {
    const shift = await prisma.shift.findUnique({
      where: { id: req.params.id },
      include: {
        office: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        applications: {
          include: {
            provider: {
              include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            },
          },
        },
        booking: true,
      },
    });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shifts – create a shift (office only)
router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { office: true },
    });

    // If user has an office but role isn't set, fix it
    if (user?.office && user.role !== 'OFFICE') {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'OFFICE' } });
    }

    if (!user?.office) return res.status(403).json({ error: 'Only offices can create shifts. Please complete onboarding first.' });

    const { role, date, startTime, endTime, hourlyRate, description, software, isRapidFill } = req.body;
    const shift = await prisma.shift.create({
      data: {
        officeId: user.office.id,
        role: role || 'Dental Hygienist',
        date: new Date(date),
        startTime: startTime || '8:00 AM',
        endTime: endTime || '5:00 PM',
        hourlyRate: typeof hourlyRate === 'number' ? hourlyRate : parseFloat(hourlyRate) || 0,
        description: description || null,
        software: software || [],
        isRapidFill: isRapidFill || false,
      },
    });
    res.status(201).json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shifts/:id – update shift
router.patch('/:id', async (req, res) => {
  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shifts/:id – cancel shift
router.delete('/:id', async (req, res) => {
  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
