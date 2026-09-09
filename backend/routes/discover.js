const express = require('express')
const prisma = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')
const {
  buildConnectionStatusMap,
  connectionStatusFor,
  buildConnectionsAdjacencyFor,
} = require('../lib/connectionStatus')
const { resolveScopeForRequest, resolveScopeAncestors, profileLocationWhere } = require('../lib/location')

const router = express.Router()
router.use(requireAuth)

function formatProfile(profile) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    professionalTitle: profile.professionalTitle,
    city: profile.city,
  }
}

// Priority order for common-ground ranking: shared venues, then shared
// connections, then shared skills, then shared knowledge areas.
function compareShared(a, b) {
  if (b.shared.venues !== a.shared.venues) return b.shared.venues - a.shared.venues
  if (b.shared.connections !== a.shared.connections) return b.shared.connections - a.shared.connections
  if (b.shared.skills !== a.shared.skills) return b.shared.skills - a.shared.skills
  return b.shared.knowledgeAreas - a.shared.knowledgeAreas
}

// `precomputed.statusByUserId`, when passed, is used instead of a fresh
// buildConnectionStatusMap fetch - lets a caller that already computed the
// viewer's own connection-status map for something else (e.g. feed.js, which
// needs it anyway to filter the activity feed) reuse it here instead of
// re-fetching the identical rows.
async function getCommonGroundPeople(userId, scopeAncestors = null, { statusByUserId: precomputed } = {}) {
  const [myProfile, statusByUserId, profiles] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: { skills: true, knowledgeAreas: true, experiences: { select: { venueId: true } } },
    }),
    precomputed || buildConnectionStatusMap(userId),
    prisma.profile.findMany({
      where: {
        userId: { not: userId },
        user: { isBlocked: false },
        ...profileLocationWhere(scopeAncestors),
      },
      include: {
        user: true,
        city: true,
        skills: true,
        knowledgeAreas: true,
        experiences: { select: { venueId: true } },
      },
    }),
  ])

  const mySkillIds = new Set((myProfile?.skills || []).map((s) => s.id))
  const myKnowledgeAreaIds = new Set((myProfile?.knowledgeAreas || []).map((k) => k.id))
  const myVenueIds = new Set((myProfile?.experiences || []).map((e) => e.venueId))

  // The viewer's own connections come straight out of statusByUserId (no
  // extra query needed); only the candidates' connections require a fetch,
  // and it's scoped to just this page of candidates rather than every
  // accepted connection on the platform.
  const myConnections = new Set(
    [...statusByUserId.entries()].filter(([, v]) => v.status === 'connected').map(([id]) => id),
  )
  const candidateAdjacency = await buildConnectionsAdjacencyFor(profiles.map((p) => p.userId))

  const people = profiles
    .map((p) => {
      const sharedSkills = p.skills.filter((s) => mySkillIds.has(s.id)).length
      const sharedKnowledgeAreas = p.knowledgeAreas.filter((k) => myKnowledgeAreaIds.has(k.id)).length
      const theirVenueIds = new Set(p.experiences.map((e) => e.venueId))
      const sharedVenues = [...theirVenueIds].filter((id) => myVenueIds.has(id)).length
      const theirConnections = candidateAdjacency.get(p.userId) || new Set()
      const mutualConnections = [...myConnections].filter((id) => theirConnections.has(id)).length

      return {
        id: p.user.id,
        email: p.user.email,
        profile: formatProfile(p),
        ...connectionStatusFor(statusByUserId, p.userId),
        shared: {
          venues: sharedVenues,
          connections: mutualConnections,
          skills: sharedSkills,
          knowledgeAreas: sharedKnowledgeAreas,
          total: sharedSkills + sharedKnowledgeAreas + sharedVenues + mutualConnections,
        },
      }
    })
    .filter((person) => person.connectionStatus !== 'connected')

  people.sort(compareShared)

  return people
}

router.get('/discover/people', async (req, res) => {
  const lens = req.query.lens === 'common' ? 'common' : 'near'
  const scope = await resolveScopeForRequest(req)
  const scopeAncestors = await resolveScopeAncestors(scope)

  if (lens === 'common') {
    const people = await getCommonGroundPeople(req.userId, scopeAncestors)
    return res.json({ lens, people })
  }

  const statusByUserId = await buildConnectionStatusMap(req.userId)

  const profiles = await prisma.profile.findMany({
    where: {
      userId: { not: req.userId },
      user: { isBlocked: false },
      ...profileLocationWhere(scopeAncestors),
    },
    include: { user: true, city: true },
    orderBy: { firstName: 'asc' },
  })

  const people = profiles
    .map((p) => ({
      id: p.user.id,
      email: p.user.email,
      profile: formatProfile(p),
      ...connectionStatusFor(statusByUserId, p.userId),
    }))
    .filter((person) => person.connectionStatus !== 'connected')

  res.json({ lens, people })
})

module.exports = router
module.exports.getCommonGroundPeople = getCommonGroundPeople
module.exports.compareShared = compareShared
