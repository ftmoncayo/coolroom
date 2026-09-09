const express = require('express')
const prisma = require('../lib/prisma')
const { requireAuth, requireAdminOrModerator } = require('../middleware/auth')
const { displayName } = require('../lib/displayName')

const router = express.Router()
router.use(requireAuth)

const TARGET_TYPES = ['MESSAGE', 'POST', 'NOTICE', 'COMMENT', 'PROFILE']
const REASON_CATEGORIES = ['HARASSMENT', 'SPAM', 'INAPPROPRIATE', 'OTHER']

// Resolves a report's target directly by id, one query scoped to exactly the
// reported row - for MESSAGE this deliberately never touches the
// Conversation or any other Message in it, so a report can never expose the
// rest of a private thread to whoever reviews it. Returns null if the
// target no longer exists (deleted since the report was filed, say).
async function loadTarget(targetType, targetId) {
  switch (targetType) {
    case 'MESSAGE': {
      const message = await prisma.message.findUnique({
        where: { id: targetId },
        select: { id: true, content: true, senderUserId: true },
      })
      return message && { authorUserId: message.senderUserId, preview: message.content }
    }
    case 'POST': {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true, content: true, authorUserId: true },
      })
      return post && { authorUserId: post.authorUserId, preview: post.content }
    }
    case 'NOTICE': {
      const notice = await prisma.notice.findUnique({
        where: { id: targetId },
        select: { id: true, content: true, authorUserId: true },
      })
      return notice && { authorUserId: notice.authorUserId, preview: notice.content }
    }
    case 'COMMENT': {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true, content: true, authorUserId: true },
      })
      return comment && { authorUserId: comment.authorUserId, preview: comment.content }
    }
    case 'PROFILE': {
      // targetId is the reported User's id directly (there's no separate
      // "profile report" object to delete - moderators block the user
      // instead, see DELETE .../content below).
      const user = await prisma.user.findUnique({ where: { id: targetId }, include: { profile: true } })
      return user && { authorUserId: user.id, preview: displayName(user) }
    }
    default:
      return null
  }
}

router.post('/reports', async (req, res) => {
  const { targetType, targetId, reasonCategory, detail } = req.body || {}

  if (!TARGET_TYPES.includes(targetType)) {
    return res.status(400).json({ error: 'targetType must be one of ' + TARGET_TYPES.join(', ') })
  }
  if (!REASON_CATEGORIES.includes(reasonCategory)) {
    return res.status(400).json({ error: 'reasonCategory must be one of ' + REASON_CATEGORIES.join(', ') })
  }
  if (typeof targetId !== 'string' || !targetId.trim()) {
    return res.status(400).json({ error: 'targetId is required' })
  }

  const trimmedTargetId = targetId.trim()
  if (!(await loadTarget(targetType, trimmedTargetId))) {
    return res.status(404).json({ error: 'Nothing found to report' })
  }

  const report = await prisma.report.create({
    data: {
      reporterUserId: req.userId,
      targetType,
      targetId: trimmedTargetId,
      reasonCategory,
      detail: typeof detail === 'string' && detail.trim() ? detail.trim() : null,
    },
  })

  res.status(201).json({ report: { id: report.id } })
})

router.get('/admin/reports', requireAdminOrModerator, async (req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { reporterUser: { include: { profile: true } } },
  })

  const result = []
  for (const r of reports) {
    // Reporter identity is for admin/moderator accountability only - never
    // surfaced to the person being reported, since this whole response is
    // already gated to requireAdminOrModerator.
    const target = await loadTarget(r.targetType, r.targetId)
    result.push({
      id: r.id,
      targetType: r.targetType,
      targetPreview: target ? target.preview : null,
      targetAuthorUserId: target ? target.authorUserId : null,
      targetDeleted: !target,
      reasonCategory: r.reasonCategory,
      detail: r.detail,
      status: r.status,
      createdAt: r.createdAt,
      reporter: { id: r.reporterUser.id, name: displayName(r.reporterUser) },
    })
  }

  res.json({ reports: result })
})

router.put('/admin/reports/:id/resolve', requireAdminOrModerator, async (req, res) => {
  const existing = await prisma.report.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    return res.status(404).json({ error: 'Report not found' })
  }

  const updated = await prisma.report.update({
    where: { id: existing.id },
    data: { status: existing.status === 'OPEN' ? 'RESOLVED' : 'OPEN' },
  })
  res.json({ report: { id: updated.id, status: updated.status } })
})

router.delete('/admin/reports/:id/content', requireAdminOrModerator, async (req, res) => {
  const existing = await prisma.report.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    return res.status(404).json({ error: 'Report not found' })
  }
  if (existing.targetType === 'PROFILE') {
    return res.status(400).json({ error: 'A profile report has no separate content to delete - block the user instead' })
  }

  const modelByTargetType = { MESSAGE: 'message', POST: 'post', NOTICE: 'notice', COMMENT: 'comment' }
  // deleteMany (not delete) so a target already removed by some other means
  // doesn't throw - this still resolves the report either way.
  await prisma[modelByTargetType[existing.targetType]].deleteMany({ where: { id: existing.targetId } })

  const updated = await prisma.report.update({ where: { id: existing.id }, data: { status: 'RESOLVED' } })
  res.json({ report: { id: updated.id, status: updated.status } })
})

module.exports = router
