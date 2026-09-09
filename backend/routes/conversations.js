const express = require('express')
const prisma = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')
const { displayName } = require('../lib/displayName')

const router = express.Router()
router.use(requireAuth)

const userWithProfileInclude = { profile: true }

// userAId/userBId are always stored sorted so the same pair can never create
// two Conversation rows regardless of who starts it (see the @@unique on the
// model) - this is the one place that ordering is decided.
function sortedPair(a, b) {
  return a < b ? [a, b] : [b, a]
}

async function areConnected(userId1, userId2) {
  const existing = await prisma.connectionRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 },
      ],
    },
  })
  return Boolean(existing)
}

function formatParticipant(user) {
  return {
    id: user.id,
    email: user.email,
    name: displayName(user),
  }
}

function otherParticipant(conversation, userId) {
  return conversation.userAId === userId ? conversation.userB : conversation.userA
}

async function findConversationForParticipant(id, userId) {
  const conversation = await prisma.conversation.findUnique({ where: { id } })
  if (!conversation || (conversation.userAId !== userId && conversation.userBId !== userId)) {
    return null
  }
  return conversation
}

router.post('/conversations', async (req, res) => {
  const { toUserId } = req.body || {}
  if (typeof toUserId !== 'string' || !toUserId.trim()) {
    return res.status(400).json({ error: 'toUserId is required' })
  }
  const targetId = toUserId.trim()
  if (targetId === req.userId) {
    return res.status(400).json({ error: 'You cannot message yourself' })
  }
  if (!(await areConnected(req.userId, targetId))) {
    return res.status(403).json({ error: 'You can only message people you are connected with' })
  }

  const [userAId, userBId] = sortedPair(req.userId, targetId)
  const include = {
    userA: { include: userWithProfileInclude },
    userB: { include: userWithProfileInclude },
  }

  let conversation = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    include,
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { userAId, userBId }, include })
  }

  res.status(201).json({
    conversation: {
      id: conversation.id,
      participant: formatParticipant(otherParticipant(conversation, req.userId)),
    },
  })
})

router.get('/conversations', async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: req.userId }, { userBId: req.userId }] },
    include: {
      userA: { include: userWithProfileInclude },
      userB: { include: userWithProfileInclude },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const unreadCounts = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderUserId: { not: req.userId },
      readAt: null,
    },
    _count: { _all: true },
  })
  const unreadByConversationId = new Map(unreadCounts.map((u) => [u.conversationId, u._count._all]))

  const result = conversations
    .map((c) => {
      const lastMessage = c.messages[0] || null
      return {
        id: c.id,
        participant: formatParticipant(otherParticipant(c, req.userId)),
        lastMessage: lastMessage
          ? { content: lastMessage.content, senderUserId: lastMessage.senderUserId, createdAt: lastMessage.createdAt }
          : null,
        unreadCount: unreadByConversationId.get(c.id) || 0,
        // Not part of the response - only used to sort, stripped below.
        sortAt: lastMessage ? lastMessage.createdAt : c.createdAt,
      }
    })
    .sort((a, b) => new Date(b.sortAt) - new Date(a.sortAt))
    .map(({ sortAt, ...rest }) => rest)

  res.json({ conversations: result })
})

router.get('/conversations/:id/messages', async (req, res) => {
  const conversation = await findConversationForParticipant(req.params.id, req.userId)
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  const [messages, participantRow] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: conversation.userAId === req.userId ? conversation.userBId : conversation.userAId },
      include: userWithProfileInclude,
    }),
  ])

  // Viewing the thread is what marks the other participant's messages read -
  // simple, and matches every unread indicator elsewhere in the app being
  // cleared by opening the thing it points at rather than a separate action.
  await prisma.message.updateMany({
    where: { conversationId: conversation.id, senderUserId: { not: req.userId }, readAt: null },
    data: { readAt: new Date() },
  })

  res.json({
    conversation: { id: conversation.id, participant: formatParticipant(participantRow) },
    messages: messages.map((m) => ({
      id: m.id,
      senderUserId: m.senderUserId,
      content: m.content,
      createdAt: m.createdAt,
      readAt: m.readAt,
    })),
  })
})

router.post('/conversations/:id/messages', async (req, res) => {
  const { content } = req.body || {}
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  const conversation = await findConversationForParticipant(req.params.id, req.userId)
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' })
  }

  const otherUserId = conversation.userAId === req.userId ? conversation.userBId : conversation.userAId
  // Existing history stays visible either way (the GET route above has no
  // connection check) - only sending a new message requires still being
  // connected.
  if (!(await areConnected(req.userId, otherUserId))) {
    return res.status(403).json({ error: 'You are no longer connected with this person' })
  }

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderUserId: req.userId, content: content.trim() },
  })

  res.status(201).json({
    message: {
      id: message.id,
      senderUserId: message.senderUserId,
      content: message.content,
      createdAt: message.createdAt,
      readAt: message.readAt,
    },
  })
})

module.exports = router
