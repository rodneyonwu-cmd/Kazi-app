import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

const router = Router();

const authGuard = (req, res, next) => {
  if (!req.auth?.userId) return res.status(401).json({ error: 'Authentication required' });
  next();
};

// GET /api/providers/me – get current user's provider profile with stats
router.get('/me', authGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: {
        provider: {
          include: {
            bookings: { where: { status: 'COMPLETED' } },
            reviews: true,
            applications: { where: { status: 'PENDING' } },
          },
        },
      },
    });
    if (!user?.provider) return res.status(404).json({ error: 'Provider not found' });

    const provider = user.provider;
    const completedShifts = provider.bookings.length;
    const pendingRequests = provider.applications.length;
    const avgRating = provider.reviews.length > 0
      ? (provider.reviews.reduce((sum, r) => sum + r.rating, 0) / provider.reviews.length).toFixed(1)
      : null;

    res.json({
      ...provider,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      stats: {
        rating: avgRating,
        reliability: provider.reliabilityScore,
        completedShifts,
        pendingRequests,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/providers – list providers (with filters)
router.get('/', authGuard, async (req, res) => {
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
router.get('/:id', authGuard, async (req, res) => {
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
    const email = req.body._email;
    let user = null;

    if (req.auth?.userId) {
      // Auth token is valid — find user by clerkId
      console.log('[POST /api/providers] clerkId:', req.auth.userId);
      user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
      if (!user && email) {
        console.log('[POST /api/providers] User not found by clerkId, creating for:', req.auth.userId);
        user = await prisma.user.create({
          data: { clerkId: req.auth.userId, email, role: 'PROVIDER' },
        });
      }
    }

    if (!user && email) {
      // No valid token — fall back to email lookup
      console.log('[POST /api/providers] No auth token, looking up user by email:', email);
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        try {
          const { clerk } = await import('../middleware/auth.js');
          const clerkUsers = await clerk.users.getUserList({ emailAddress: [email] });
          if (clerkUsers.data?.length > 0) {
            const clerkUser = clerkUsers.data[0];
            console.log('[POST /api/providers] Found Clerk user:', clerkUser.id);
            user = await prisma.user.create({
              data: { clerkId: clerkUser.id, email, role: 'PROVIDER', firstName: clerkUser.firstName, lastName: clerkUser.lastName },
            });
          }
        } catch (clerkErr) {
          console.error('[POST /api/providers] Clerk lookup failed:', clerkErr.message);
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Could not identify user. Please make sure you are signed in.' });
    }

    // Prevent duplicate provider profiles
    const existing = await prisma.provider.findUnique({ where: { userId: user.id } });
    if (existing) return res.status(409).json({ error: 'Provider profile already exists' });

    const { role, software, skills, hourlyRate, licenseNumber, city, state } = req.body;

    const [provider] = await prisma.$transaction([
      prisma.provider.create({
        data: { userId: user.id, role, software, skills, hourlyRate, licenseNumber, city, state },
      }),
      prisma.user.update({ where: { id: user.id }, data: { role: 'PROVIDER' } }),
    ]);
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/providers/me – update current user's provider profile
router.patch('/me', authGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true },
    });
    if (!user?.provider) return res.status(404).json({ error: 'Provider not found' });

    const allowed = ['role', 'bio', 'hourlyRate', 'travelRadius', 'city', 'state', 'zip', 'software', 'skills', 'resumeUrl', 'resumeName'];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const provider = await prisma.provider.update({
      where: { id: user.provider.id },
      data,
    });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/providers/:id
router.patch('/:id', authGuard, async (req, res) => {
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

// POST /api/providers/resume – upload resume
router.post('/resume', authGuard, upload.single('file'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true },
    });
    if (!user?.provider) return res.status(404).json({ error: 'Provider not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const provider = await prisma.provider.update({
      where: { id: user.provider.id },
      data: {
        resumeUrl: `/uploads/${file.filename}`,
        resumeName: file.originalname,
      },
    });
    res.json({ resumeUrl: provider.resumeUrl, resumeName: provider.resumeName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Availability ────────────────────────────────────
// GET /api/providers/:id/availability
router.get('/:id/availability', authGuard, async (req, res) => {
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
router.post('/:id/availability', authGuard, async (req, res) => {
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
router.delete('/:id/availability/:slotId', authGuard, async (req, res) => {
  try {
    await prisma.availability.delete({ where: { id: req.params.slotId } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Credentials ─────────────────────────────────────
// GET /api/providers/:id/credentials
router.get('/:id/credentials', authGuard, async (req, res) => {
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
router.post('/:id/credentials', authGuard, async (req, res) => {
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
router.post('/:id/save-office', authGuard, async (req, res) => {
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
router.delete('/:id/save-office/:officeId', authGuard, async (req, res) => {
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
router.get('/:id/saved-offices', authGuard, async (req, res) => {
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
