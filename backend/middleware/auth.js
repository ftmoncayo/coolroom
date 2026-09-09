const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

async function requireAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

async function requireAdminOrVenueAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user || (!user.isAdmin && !user.isVenueAdmin)) {
    return res.status(403).json({ error: 'Admin or venue admin access required' })
  }
  next()
}

// Moderators get a narrow slice of admin power (the Reports queue, resolving
// reports, deleting flagged content, and - via this same check reused on the
// existing block/unblock routes - blocking/unblocking a user) but nothing
// else; every other admin-only route stays on requireAdmin alone.
async function requireAdminOrModerator(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user || (!user.isAdmin && !user.isModerator)) {
    return res.status(403).json({ error: 'Admin or moderator access required' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin, requireAdminOrVenueAdmin, requireAdminOrModerator }
