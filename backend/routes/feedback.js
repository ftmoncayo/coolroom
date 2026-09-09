const express = require('express')
const prisma = require('../lib/prisma')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth)

const CATEGORIES = ['WORKING_WELL', 'NOT_WORKING', 'SUGGESTION', 'OTHER']

function formatFeedback(entry) {
  return {
    id: entry.id,
    category: entry.category,
    message: entry.message,
    reviewed: entry.reviewed,
    createdAt: entry.createdAt,
    author: {
      id: entry.authorUser.id,
      email: entry.authorUser.email,
      profile: entry.authorUser.profile
        ? { firstName: entry.authorUser.profile.firstName, lastName: entry.authorUser.profile.lastName }
        : null,
    },
  }
}

router.post('/feedback', async (req, res) => {
  const { category, message } = req.body || {}

  if (typeof category !== 'string' || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'category must be one of ' + CATEGORIES.join(', ') })
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const entry = await prisma.feedback.create({
    data: { authorUserId: req.userId, category, message: message.trim() },
  })

  res.status(201).json({ feedback: { id: entry.id } })
})

router.get('/admin/feedback', requireAdmin, async (req, res) => {
  const entries = await prisma.feedback.findMany({
    include: { authorUser: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ feedback: entries.map(formatFeedback) })
})

router.put('/admin/feedback/:id/reviewed', requireAdmin, async (req, res) => {
  const existing = await prisma.feedback.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    return res.status(404).json({ error: 'Feedback not found' })
  }

  const updated = await prisma.feedback.update({
    where: { id: existing.id },
    data: { reviewed: !existing.reviewed },
    include: { authorUser: { include: { profile: true } } },
  })

  res.json({ feedback: formatFeedback(updated) })
})

module.exports = router
