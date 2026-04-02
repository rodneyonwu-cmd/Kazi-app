import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Auth guard for all routes except POST / (onboarding)
const authGuard = (req, res, next) => {
  if (!req.auth?.userId) return res.status(401).json({ error: 'Authentication required' });
  next();
};

// GET /api/offices/me – get current user's office profile with stats
router.get('/me', authGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: {
        office: {
          include: {
            shifts: true,
            bookings: true,
            reviews: true,
            savedProviders: true,
          },
        },
      },
    });
    if (!user?.office) return res.status(404).json({ error: 'Office not found' });

    const office = user.office;
    const openShifts = office.shifts.filter(s => s.status === 'OPEN').length;
    const totalShifts = office.shifts.length;
    const completedBookings = office.bookings.filter(b => b.status === 'COMPLETED').length;
    const pendingBookings = office.bookings.filter(b => b.status === 'CONFIRMED').length;
    const avgRating = office.reviews.length > 0
      ? (office.reviews.reduce((sum, r) => sum + r.rating, 0) / office.reviews.length).toFixed(1)
      : null;

    res.json({
      ...office,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      stats: {
        openShifts,
        totalShifts,
        completedBookings,
        pendingBookings,
        savedProviders: office.savedProviders.length,
        rating: avgRating,
        reviewCount: office.reviews.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offices – list offices (with optional filters)
router.get('/', authGuard, async (req, res) => {
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
router.get('/:id', authGuard, async (req, res) => {
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
    const email = req.body._email;
    let user = null;

    if (req.auth?.userId) {
      // Auth token is valid — find user by clerkId
      console.log('[POST /api/offices] clerkId:', req.auth.userId);
      user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
      if (!user && email) {
        // Webhook hasn't fired yet — create user on the fly
        console.log('[POST /api/offices] User not found by clerkId, creating for:', req.auth.userId);
        user = await prisma.user.create({
          data: { clerkId: req.auth.userId, email, role: 'OFFICE' },
        });
      }
    }

    if (!user && email) {
      // No valid token — fall back to email lookup
      console.log('[POST /api/offices] No auth token, looking up user by email:', email);
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Try Clerk API to find the user by email and get their clerkId
        try {
          const { clerk } = await import('../middleware/auth.js');
          const clerkUsers = await clerk.users.getUserList({ emailAddress: [email] });
          if (clerkUsers.data?.length > 0) {
            const clerkUser = clerkUsers.data[0];
            console.log('[POST /api/offices] Found Clerk user:', clerkUser.id);
            user = await prisma.user.create({
              data: { clerkId: clerkUser.id, email, role: 'OFFICE', firstName: clerkUser.firstName, lastName: clerkUser.lastName },
            });
          }
        } catch (clerkErr) {
          console.error('[POST /api/offices] Clerk lookup failed:', clerkErr.message);
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Could not identify user. Please make sure you are signed in.' });
    }

    // Prevent duplicate office profiles
    const existing = await prisma.office.findUnique({ where: { userId: user.id } });
    if (existing) return res.status(409).json({ error: 'Office profile already exists' });

    const { name, specialty, software, address, city, state, zip, bio, plan, hiringRoles } = req.body;

    const [office] = await prisma.$transaction([
      prisma.office.create({
        data: { userId: user.id, name, specialty, software, address, city, state, zip, bio, plan, hiringRoles },
      }),
      prisma.user.update({ where: { id: user.id }, data: { role: 'OFFICE' } }),
    ]);
    res.status(201).json(office);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/offices/:id
router.patch('/:id', authGuard, async (req, res) => {
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
router.post('/:id/save-provider', authGuard, async (req, res) => {
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
router.delete('/:id/save-provider/:providerId', authGuard, async (req, res) => {
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
router.get('/:id/saved-providers', authGuard, async (req, res) => {
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
