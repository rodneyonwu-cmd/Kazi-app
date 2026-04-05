import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// Admin guard: require ADMIN role
const adminGuard = async (req, res, next) => {
  if (!req.auth?.userId) return res.status(401).json({ error: 'Authentication required' });
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    req.adminUser = user;
    next();
  } catch (err) {
    console.error('[admin.js adminGuard]', err);
    res.status(500).json({ error: err.message });
  }
};

const logAction = async (adminId, action, targetType, targetId, details) => {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, targetType, targetId, details },
    });
  } catch (err) {
    console.error('[admin.js logAction]', err);
  }
};

// GET /api/admin/stats – platform-wide counts
router.get('/stats', adminGuard, async (req, res) => {
  try {
    const [totalUsers, totalOffices, totalProviders, totalShifts, totalBookings, totalApplications, totalMessages, completedBookings] = await Promise.all([
      prisma.user.count(),
      prisma.office.count(),
      prisma.provider.count(),
      prisma.shift.count(),
      prisma.booking.count(),
      prisma.application.count(),
      prisma.message.count(),
      prisma.booking.findMany({ where: { status: 'COMPLETED' }, include: { shift: true } }),
    ]);

    const totalRevenue = completedBookings.reduce((sum, b) => {
      const parse = (t) => { if (!t) return 0; const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; let h = +m[1], mi = +m[2]; if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h + mi / 60; };
      const hours = parse(b.shift?.endTime) - parse(b.shift?.startTime);
      return sum + (hours > 0 && b.shift?.hourlyRate ? hours * b.shift.hourlyRate : 0);
    }, 0);

    const pendingVerifications = await prisma.credential.count({ where: { verified: false } });
    const openShifts = await prisma.shift.count({ where: { status: 'OPEN' } });

    res.json({
      totalUsers, totalOffices, totalProviders, totalShifts, totalBookings,
      totalApplications, totalMessages, totalRevenue: Math.round(totalRevenue),
      pendingVerifications, openShifts,
    });
  } catch (err) {
    console.error('[admin.js GET /stats]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users – list all users
router.get('/users', adminGuard, async (req, res) => {
  try {
    const { role, search, limit } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      include: {
        office: { include: { _count: { select: { shifts: true, bookings: true } } } },
        provider: { include: { _count: { select: { bookings: true, reviews: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });
    res.json(users);
  } catch (err) {
    console.error('[admin.js GET /users]', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/suspend – toggle suspension
router.patch('/users/:id/suspend', adminGuard, async (req, res) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended: !!suspended },
    });
    await logAction(req.adminUser.id, suspended ? 'SUSPEND_USER' : 'REINSTATE_USER', 'USER', req.params.id, `${user.email}`);
    res.json(user);
  } catch (err) {
    console.error('[admin.js suspend]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id – delete a user
router.delete('/users/:id', adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAction(req.adminUser.id, 'DELETE_USER', 'USER', req.params.id, user.email);
    res.status(204).end();
  } catch (err) {
    console.error('[admin.js DELETE /users]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/verification – list credentials pending review
router.get('/verification', adminGuard, async (req, res) => {
  try {
    const credentials = await prisma.credential.findMany({
      where: { verified: false },
      include: {
        provider: { include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(credentials);
  } catch (err) {
    console.error('[admin.js GET /verification]', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/credentials/:id/approve – approve a credential
router.patch('/credentials/:id/approve', adminGuard, async (req, res) => {
  try {
    const credential = await prisma.credential.update({
      where: { id: req.params.id },
      data: { verified: true },
    });
    await logAction(req.adminUser.id, 'APPROVE_CREDENTIAL', 'CREDENTIAL', req.params.id, credential.type);
    res.json(credential);
  } catch (err) {
    console.error('[admin.js approve]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/credentials/:id – reject/remove a credential
router.delete('/credentials/:id', adminGuard, async (req, res) => {
  try {
    const credential = await prisma.credential.findUnique({ where: { id: req.params.id } });
    await prisma.credential.delete({ where: { id: req.params.id } });
    await logAction(req.adminUser.id, 'REJECT_CREDENTIAL', 'CREDENTIAL', req.params.id, credential?.type || '');
    res.status(204).end();
  } catch (err) {
    console.error('[admin.js DELETE /credentials]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/shifts – all shifts
router.get('/shifts', adminGuard, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { role: { contains: search, mode: 'insensitive' } },
        { office: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        office: true,
        _count: { select: { applications: true } },
        booking: { include: { provider: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(shifts);
  } catch (err) {
    console.error('[admin.js GET /shifts]', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/shifts/:id/cancel – admin cancel shift
router.patch('/shifts/:id/cancel', adminGuard, async (req, res) => {
  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    await logAction(req.adminUser.id, 'CANCEL_SHIFT', 'SHIFT', req.params.id, shift.role);
    res.json(shift);
  } catch (err) {
    console.error('[admin.js cancel shift]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bookings – all bookings
router.get('/bookings', adminGuard, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        shift: true,
        office: true,
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    console.error('[admin.js GET /bookings]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/reviews – all reviews
router.get('/reviews', adminGuard, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        office: true,
        provider: { include: { user: { select: { firstName: true, lastName: true } } } },
        booking: { include: { shift: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    console.error('[admin.js GET /reviews]', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', adminGuard, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    await logAction(req.adminUser.id, 'DELETE_REVIEW', 'REVIEW', req.params.id, '');
    res.status(204).end();
  } catch (err) {
    console.error('[admin.js DELETE /reviews]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/billing – office plan breakdown
router.get('/billing', adminGuard, async (req, res) => {
  try {
    const offices = await prisma.office.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true, createdAt: true } },
        _count: { select: { shifts: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const planCounts = offices.reduce((acc, o) => {
      const plan = o.plan || 'free';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});
    res.json({ offices, planCounts });
  } catch (err) {
    console.error('[admin.js GET /billing]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit – audit log
router.get('/audit', adminGuard, async (req, res) => {
  try {
    const { limit } = req.query;
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 100,
    });
    res.json(logs);
  } catch (err) {
    console.error('[admin.js GET /audit]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/check – verify current user is admin
router.get('/check', async (req, res) => {
  try {
    if (!req.auth?.userId) return res.json({ isAdmin: false });
    const user = await prisma.user.findUnique({ where: { clerkId: req.auth.userId } });
    res.json({ isAdmin: user?.role === 'ADMIN' });
  } catch (err) {
    console.error('[admin.js check]', err);
    res.json({ isAdmin: false });
  }
});

export default router;
