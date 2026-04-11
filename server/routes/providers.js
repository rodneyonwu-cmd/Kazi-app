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

// Helper: resolve current user's provider, lazy-provisioning a row if missing.
// Returns the User+Provider as fetched, or throws on no auth.
async function getOrCreateMyProvider(clerkId) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      provider: {
        include: {
          bookings: { where: { status: 'COMPLETED' } },
          reviews: true,
          applications: { where: { status: 'PENDING' } },
          credentials: { orderBy: { createdAt: 'asc' } },
          availability: true,
          providerSkills: { orderBy: { name: 'asc' } },
          experiences: { orderBy: { name: 'asc' } },
          languages: { orderBy: { name: 'asc' } },
        },
      },
    },
  });

  if (!user) {
    // No User row at all yet — webhook hasn't fired. Create with role PROVIDER.
    user = await prisma.user.create({
      data: { clerkId, email: `${clerkId}@placeholder.kazi`, role: 'PROVIDER' },
      include: {
        provider: {
          include: {
            bookings: true, reviews: true, applications: true,
            credentials: true, availability: true,
            providerSkills: true, experiences: true, languages: true,
          },
        },
      },
    });
  }

  if (!user.provider) {
    await prisma.provider.create({
      data: { userId: user.id, role: 'Dental Professional' },
    });
    // Re-fetch with the new provider attached
    user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        provider: {
          include: {
            bookings: { where: { status: 'COMPLETED' } },
            reviews: true,
            applications: { where: { status: 'PENDING' } },
            credentials: { orderBy: { createdAt: 'asc' } },
            availability: true,
            providerSkills: { orderBy: { name: 'asc' } },
            experiences: { orderBy: { name: 'asc' } },
            languages: { orderBy: { name: 'asc' } },
          },
        },
      },
    });
  }

  return user;
}

// GET /api/providers/me – get current user's provider profile with stats
// Lazy-provisions a Provider row if one doesn't exist yet (no 404).
router.get('/me', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
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
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// ── Provider /me chip relations: certifications, skills, experience, languages

// POST /api/providers/me/certifications – add a certification (uses existing Credential model)
router.post('/me/certifications', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const { name, expirationDate, fileUrl } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    await prisma.credential.create({
      data: {
        providerId: user.provider.id,
        type: name.trim(),
        fileUrl: fileUrl || null,
        expiresAt: expirationDate ? new Date(expirationDate) : null,
      },
    });
    const credentials = await prisma.credential.findMany({
      where: { providerId: user.provider.id },
      orderBy: { createdAt: 'asc' },
    });
    res.status(201).json(credentials);
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/me/certifications/:id – remove a certification
router.delete('/me/certifications/:id', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    // Verify ownership
    const cred = await prisma.credential.findUnique({ where: { id: req.params.id } });
    if (!cred || cred.providerId !== user.provider.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    await prisma.credential.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/me/skills – add one or more skills (multi-select)
router.post('/me/skills', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const namesInput = Array.isArray(req.body?.names) ? req.body.names : [];
    const names = namesInput
      .map((n) => (typeof n === 'string' ? n.trim() : ''))
      .filter(Boolean);
    if (names.length === 0) {
      return res.status(400).json({ error: 'names array required' });
    }
    await prisma.skill.createMany({
      data: names.map((name) => ({ providerId: user.provider.id, name })),
      skipDuplicates: true,
    });
    const skills = await prisma.skill.findMany({
      where: { providerId: user.provider.id },
      orderBy: { name: 'asc' },
    });
    res.status(201).json(skills);
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/me/skills/:id – remove a skill
router.delete('/me/skills/:id', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const row = await prisma.skill.findUnique({ where: { id: req.params.id } });
    if (!row || row.providerId !== user.provider.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/me/experience – add one or more experience areas
router.post('/me/experience', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const namesInput = Array.isArray(req.body?.names) ? req.body.names : [];
    const names = namesInput
      .map((n) => (typeof n === 'string' ? n.trim() : ''))
      .filter(Boolean);
    if (names.length === 0) {
      return res.status(400).json({ error: 'names array required' });
    }
    await prisma.experience.createMany({
      data: names.map((name) => ({ providerId: user.provider.id, name })),
      skipDuplicates: true,
    });
    const experiences = await prisma.experience.findMany({
      where: { providerId: user.provider.id },
      orderBy: { name: 'asc' },
    });
    res.status(201).json(experiences);
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/me/experience/:id – remove an experience area
router.delete('/me/experience/:id', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const row = await prisma.experience.findUnique({ where: { id: req.params.id } });
    if (!row || row.providerId !== user.provider.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/me/languages – add a language with level
router.post('/me/languages', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const { name, level } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!level || typeof level !== 'string') {
      return res.status(400).json({ error: 'level is required' });
    }
    const allowedLevels = ['Native', 'Fluent', 'Conversational', 'Basic'];
    if (!allowedLevels.includes(level)) {
      return res.status(400).json({ error: `level must be one of ${allowedLevels.join(', ')}` });
    }
    await prisma.language.upsert({
      where: { providerId_name: { providerId: user.provider.id, name: name.trim() } },
      update: { level },
      create: { providerId: user.provider.id, name: name.trim(), level },
    });
    const languages = await prisma.language.findMany({
      where: { providerId: user.provider.id },
      orderBy: { name: 'asc' },
    });
    res.status(201).json(languages);
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/me/languages/:id – remove a language
router.delete('/me/languages/:id', authGuard, async (req, res) => {
  try {
    const user = await getOrCreateMyProvider(req.auth.userId);
    const row = await prisma.language.findUnique({ where: { id: req.params.id } });
    if (!row || row.providerId !== user.provider.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    await prisma.language.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/providers – list providers (with filters)
router.get('/', authGuard, async (req, res) => {
  try {
    const { role, city, state, verified, availableOn } = req.query;
    const where = {};

    // Hide mock pros in production
    if (process.env.NODE_ENV === 'production') {
      where.isMock = false;
    }
    if (role) where.role = role;
    if (city) where.city = city;
    if (state) where.state = state;
    if (verified !== undefined) where.verified = verified === 'true';

    // Filter by availability on a specific date (YYYY-MM-DD)
    if (availableOn) {
      const startOfDay = new Date(`${availableOn}T00:00:00.000Z`);
      const endOfDay = new Date(`${availableOn}T23:59:59.999Z`);
      const dayOfWeek = startOfDay.getUTCDay();

      // Providers who have weekly availability for this day of week, OR a specific
      // date record for this date (availability records mark the day as available).
      const availabilityRecords = await prisma.availability.findMany({
        where: {
          OR: [
            { dayOfWeek },
            { date: { gte: startOfDay, lte: endOfDay } },
          ],
        },
        select: { providerId: true },
      });
      const availableIds = [...new Set(availabilityRecords.map(a => a.providerId))];

      // Exclude providers already booked on this date
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED'] },
          shift: { date: { gte: startOfDay, lte: endOfDay } },
        },
        select: { providerId: true },
      });
      const bookedIds = new Set(bookings.map(b => b.providerId));

      where.id = { in: availableIds.filter(id => !bookedIds.has(id)) };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
          bookings: { where: { status: 'COMPLETED' }, select: { id: true, status: true } },
          availability: true,
          credentials: true,
        },
        orderBy: [{ isMock: 'desc' }, { reliabilityScore: 'desc' }, { avgRating: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({ providers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/providers/avatar – upload profile photo
router.post('/avatar', authGuard, upload.single('file'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true },
    });
    if (!user?.provider) return res.status(404).json({ error: 'Provider not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const avatarUrl = `/uploads/${file.filename}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });
    res.json({ avatarUrl });
  } catch (err) {
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/:id/availability/:slotId
router.delete('/:id/availability/:slotId', authGuard, async (req, res) => {
  try {
    await prisma.availability.delete({ where: { id: req.params.slotId } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/providers/:id/credentials/:credId
router.delete('/:id/credentials/:credId', authGuard, async (req, res) => {
  try {
    await prisma.credential.delete({ where: { id: req.params.credId } });
    res.status(204).end();
  } catch (err) {
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
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
    console.error('[providers.js]' , err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
