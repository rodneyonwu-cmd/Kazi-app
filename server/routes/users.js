import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/users/me – get current user by clerkId
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { office: true, provider: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me – update current user profile
router.patch('/me', async (req, res) => {
  try {
    const { firstName, lastName, phone, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { clerkId: req.auth.userId },
      data: { firstName, lastName, phone, avatarUrl },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id – get any user by id (for admin / public profiles)
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { office: true, provider: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
