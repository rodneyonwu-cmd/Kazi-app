import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ── Constants ─────────────────────────────────────────────
const VALID_GROUP_IDS = new Set(['hacks', 'events', 'breakroom', 'da-only']);
const VALID_ROLE_TYPES = new Set(['dentist', 'rdh', 'da', 'fo']);
const VALID_VOTE_DIRECTIONS = new Set(['up', 'down']);

// ── Verification gate ─────────────────────────────────────
// All Lounge endpoints check that the caller is a verified provider.
// TODO: implement real verification check once `Provider.verified`
// (or equivalent) lands. For now we treat every authenticated
// provider as verified.
async function requireVerifiedProvider(req, res, next) {
  if (!req.auth?.userId) return res.status(401).json({ error: 'Authentication required' });
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: { provider: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.provider) return res.status(403).json({ error: 'Lounge is for providers only' });
    // const isVerified = user.provider.verified === true;
    const isVerified = true; // TODO: implement verification check
    if (!isVerified) return res.status(403).json({ error: 'Verification required' });
    req.user = user;
    next();
  } catch (err) {
    console.error('[lounge.js] requireVerifiedProvider', err);
    res.status(500).json({ error: err.message });
  }
}

router.use(requireVerifiedProvider);

// ── Helpers ───────────────────────────────────────────────

// Strip author info on anonymous threads/replies before serializing.
function maskAuthor(record) {
  if (!record.isAnonymous) return record;
  const masked = { ...record };
  delete masked.authorId;
  masked.author = { anon: true, name: 'Anonymous Member' };
  return masked;
}

// Compute aggregate vote info for a thread relative to the requesting user.
function computeThreadVoteAggregates(thread, userId) {
  const upvotes = thread.votes.filter((v) => v.direction === 'up').length;
  const downvotes = thread.votes.filter((v) => v.direction === 'down').length;
  const myVote = thread.votes.find((v) => v.userId === userId)?.direction || null;
  return { score: upvotes - downvotes, upvotes, downvotes, vote: myVote };
}

// ── GET /api/lounge/threads ───────────────────────────────
// Query: ?scope=feed|<groupId> &role=<roleType>?
router.get('/threads', async (req, res) => {
  try {
    const { scope = 'feed', role } = req.query;

    if (scope !== 'feed' && !VALID_GROUP_IDS.has(scope)) {
      return res.status(400).json({ error: 'Invalid scope' });
    }

    const where = { scope };
    if (scope === 'feed' && role && role !== 'all') {
      if (!VALID_ROLE_TYPES.has(role)) return res.status(400).json({ error: 'Invalid role' });
      where.roleType = role;
    }

    const threads = await prisma.loungeThread.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        votes: true,
        _count: { select: { replies: true } },
      },
    });

    const serialized = threads.map((t) => {
      const aggregates = computeThreadVoteAggregates(t, req.user.id);
      const { votes: _votes, _count, authorId, ...rest } = t;
      return {
        ...maskAuthor({ ...rest, authorId, isAnonymous: t.isAnonymous }),
        ...aggregates,
        replyCount: _count.replies,
      };
    });

    res.json(serialized);
  } catch (err) {
    console.error('[lounge.js] GET /threads', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/lounge/threads/:id ───────────────────────────
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await prisma.loungeThread.findUnique({
      where: { id: req.params.id },
      include: {
        votes: true,
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { votes: true },
        },
        poll: { include: { options: { orderBy: { order: 'asc' }, include: { votes: true } } } },
      },
    });
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const aggregates = computeThreadVoteAggregates(thread, req.user.id);
    const { votes: _v, replies, poll, authorId, ...rest } = thread;

    const serializedReplies = replies.map((r) => {
      const myLike = r.votes.some((v) => v.userId === req.user.id);
      const { votes: _vv, authorId: _aid, ...replyRest } = r;
      return {
        ...maskAuthor({ ...replyRest, authorId: _aid, isAnonymous: r.isAnonymous }),
        likes: r.votes.length,
        liked: myLike,
      };
    });

    let serializedPoll = null;
    if (poll) {
      const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
      const myVoteOption = poll.options.find((o) => o.votes.some((v) => v.userId === req.user.id));
      serializedPoll = {
        closesAt: poll.closesAt,
        votedOptionId: myVoteOption?.id || null,
        totalVotes,
        options: poll.options.map((o) => ({
          id: o.id,
          label: o.label,
          order: o.order,
          votes: o.votes.length,
          pct: totalVotes === 0 ? 0 : Math.round((o.votes.length / totalVotes) * 100),
        })),
      };
    }

    res.json({
      ...maskAuthor({ ...rest, authorId, isAnonymous: thread.isAnonymous }),
      ...aggregates,
      replies: serializedReplies,
      poll: serializedPoll,
    });
  } catch (err) {
    console.error('[lounge.js] GET /threads/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/threads ──────────────────────────────
// Body: { scope, roleType?, title?, body, isAnonymous, poll? }
router.post('/threads', async (req, res) => {
  try {
    const { scope, roleType, title, body, isAnonymous, poll } = req.body;

    if (!body || typeof body !== 'string') return res.status(400).json({ error: 'Body required' });
    if (scope !== 'feed' && !VALID_GROUP_IDS.has(scope)) return res.status(400).json({ error: 'Invalid scope' });
    if (scope === 'feed' && roleType && !VALID_ROLE_TYPES.has(roleType)) return res.status(400).json({ error: 'Invalid roleType' });

    const thread = await prisma.loungeThread.create({
      data: {
        authorId: req.user.id,
        scope,
        roleType: scope === 'feed' ? (roleType || null) : null,
        title: title || null,
        body,
        isAnonymous: !!isAnonymous,
        ...(poll && Array.isArray(poll.options) && poll.options.length >= 2
          ? {
              poll: {
                create: {
                  closesAt: poll.closesAt ? new Date(poll.closesAt) : null,
                  options: {
                    create: poll.options.map((label, i) => ({ label: String(label), order: i })),
                  },
                },
              },
            }
          : {}),
      },
    });

    res.status(201).json(thread);
  } catch (err) {
    console.error('[lounge.js] POST /threads', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/threads/:id/vote ─────────────────────
// Body: { direction: 'up' | 'down' | null }
router.post('/threads/:id/vote', async (req, res) => {
  try {
    const { direction } = req.body;
    const threadId = req.params.id;

    const exists = await prisma.loungeThread.findUnique({ where: { id: threadId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Thread not found' });

    if (direction === null) {
      await prisma.loungeVote.deleteMany({ where: { threadId, userId: req.user.id } });
      return res.json({ ok: true, vote: null });
    }
    if (!VALID_VOTE_DIRECTIONS.has(direction)) return res.status(400).json({ error: 'Invalid direction' });

    await prisma.loungeVote.upsert({
      where: { threadId_userId: { threadId, userId: req.user.id } },
      update: { direction },
      create: { threadId, userId: req.user.id, direction },
    });
    res.json({ ok: true, vote: direction });
  } catch (err) {
    console.error('[lounge.js] POST /threads/:id/vote', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/threads/:id/replies ──────────────────
// Body: { text, isAnonymous? }
router.post('/threads/:id/replies', async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text required' });

    const exists = await prisma.loungeThread.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Thread not found' });

    const reply = await prisma.loungeReply.create({
      data: {
        threadId: req.params.id,
        authorId: req.user.id,
        text,
        isAnonymous: !!isAnonymous,
      },
    });
    res.status(201).json(maskAuthor(reply));
  } catch (err) {
    console.error('[lounge.js] POST /threads/:id/replies', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/replies/:id/like ─────────────────────
// Toggles the calling user's like on a reply.
router.post('/replies/:id/like', async (req, res) => {
  try {
    const replyId = req.params.id;
    const exists = await prisma.loungeReply.findUnique({ where: { id: replyId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Reply not found' });

    const existing = await prisma.loungeReplyVote.findUnique({
      where: { replyId_userId: { replyId, userId: req.user.id } },
    });
    if (existing) {
      await prisma.loungeReplyVote.delete({ where: { id: existing.id } });
      return res.json({ ok: true, liked: false });
    }
    await prisma.loungeReplyVote.create({ data: { replyId, userId: req.user.id } });
    res.json({ ok: true, liked: true });
  } catch (err) {
    console.error('[lounge.js] POST /replies/:id/like', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/threads/:id/poll-vote ────────────────
// Body: { optionId }
router.post('/threads/:id/poll-vote', async (req, res) => {
  try {
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId required' });

    const poll = await prisma.loungePoll.findUnique({
      where: { threadId: req.params.id },
      include: { options: { select: { id: true } } },
    });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const isValidOption = poll.options.some((o) => o.id === optionId);
    if (!isValidOption) return res.status(400).json({ error: 'Option does not belong to this poll' });

    // Enforce single vote per user across the poll's options
    await prisma.loungePollVote.deleteMany({
      where: { userId: req.user.id, pollOption: { pollId: poll.id } },
    });
    await prisma.loungePollVote.create({ data: { pollOptionId: optionId, userId: req.user.id } });
    res.json({ ok: true, votedOptionId: optionId });
  } catch (err) {
    console.error('[lounge.js] POST /threads/:id/poll-vote', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/groups/:id/join ──────────────────────
router.post('/groups/:id/join', async (req, res) => {
  try {
    const groupId = req.params.id;
    if (!VALID_GROUP_IDS.has(groupId)) return res.status(400).json({ error: 'Invalid group' });

    await prisma.loungeGroupMembership.upsert({
      where: { userId_groupId: { userId: req.user.id, groupId } },
      update: {},
      create: { userId: req.user.id, groupId },
    });
    res.json({ ok: true, joined: true });
  } catch (err) {
    console.error('[lounge.js] POST /groups/:id/join', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/groups/:id/leave ─────────────────────
router.post('/groups/:id/leave', async (req, res) => {
  try {
    const groupId = req.params.id;
    if (!VALID_GROUP_IDS.has(groupId)) return res.status(400).json({ error: 'Invalid group' });

    await prisma.loungeGroupMembership.deleteMany({
      where: { userId: req.user.id, groupId },
    });
    res.json({ ok: true, joined: false });
  } catch (err) {
    console.error('[lounge.js] POST /groups/:id/leave', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/lounge/groups/me ─────────────────────────────
// Returns the list of group ids the caller has joined.
router.get('/groups/me', async (req, res) => {
  try {
    const memberships = await prisma.loungeGroupMembership.findMany({
      where: { userId: req.user.id },
      select: { groupId: true },
    });
    res.json(memberships.map((m) => m.groupId));
  } catch (err) {
    console.error('[lounge.js] GET /groups/me', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lounge/threads/:id/bookmark ─────────────────
router.post('/threads/:id/bookmark', async (req, res) => {
  try {
    const threadId = req.params.id;
    const exists = await prisma.loungeThread.findUnique({ where: { id: threadId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: 'Thread not found' });

    await prisma.loungeBookmark.upsert({
      where: { userId_threadId: { userId: req.user.id, threadId } },
      update: {},
      create: { userId: req.user.id, threadId },
    });
    res.json({ ok: true, bookmarked: true });
  } catch (err) {
    console.error('[lounge.js] POST /threads/:id/bookmark', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/lounge/threads/:id/bookmark ───────────────
router.delete('/threads/:id/bookmark', async (req, res) => {
  try {
    await prisma.loungeBookmark.deleteMany({
      where: { userId: req.user.id, threadId: req.params.id },
    });
    res.json({ ok: true, bookmarked: false });
  } catch (err) {
    console.error('[lounge.js] DELETE /threads/:id/bookmark', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
