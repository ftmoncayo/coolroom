const express = require('express')
const prisma = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')
const { getCommonGroundPeople } = require('./discover')
const { formatActivities } = require('../lib/activityFeed')
const { buildConnectionStatusMap } = require('../lib/connectionStatus')
const { resolveScopeForRequest, resolveScopeAncestors, profileLocationWhere } = require('../lib/location')

const router = express.Router()
router.use(requireAuth)

const SUGGESTION_LIMIT = 5
const ACTIVITY_LIMIT = 50
const SIGNUP_LIMIT = 20

router.get('/feed', async (req, res) => {
  // Both the activity scope and the suggestion scope default to the viewer's
  // own profile location when unfiltered - fetch that profile (at most) once
  // up front and hand it to both resolveScopeForRequest calls, rather than
  // each independently re-fetching the identical row.
  const needsDefaultScope = req.query.scopeType === undefined && req.query.scopeId === undefined
  const needsDefaultSuggestionScope =
    req.query.suggestionScopeType === undefined && req.query.suggestionScopeId === undefined
  const viewerProfile =
    needsDefaultScope || needsDefaultSuggestionScope
      ? await prisma.profile.findUnique({ where: { userId: req.userId }, include: { suburb: true } })
      : null

  const [scope, suggestionScope] = await Promise.all([
    resolveScopeForRequest(req, '', true, viewerProfile),
    resolveScopeForRequest(req, 'suggestion', true, viewerProfile),
  ])
  const [scopeAncestors, suggestionScopeAncestors] = await Promise.all([
    resolveScopeAncestors(scope),
    resolveScopeAncestors(suggestionScope),
  ])

  // statusByUserId also gives us connectionUserIds (every 'connected' entry)
  // for free, and is handed to getCommonGroundPeople below so it doesn't
  // have to re-fetch the same connectionRequest rows for the suggestions
  // computation.
  const [statusByUserId, [venueFollows, businessFollows, managedVenues, managedBusinesses, workedVenues]] =
    await Promise.all([
      buildConnectionStatusMap(req.userId),
      Promise.all([
        prisma.venueFollow.findMany({ where: { userId: req.userId } }),
        prisma.businessFollow.findMany({ where: { userId: req.userId } }),
        prisma.venueManager.findMany({ where: { userId: req.userId }, select: { venueId: true } }),
        prisma.businessManager.findMany({ where: { userId: req.userId }, select: { businessId: true } }),
        prisma.experience.findMany({
          where: { profile: { userId: req.userId } },
          select: { venueId: true },
          distinct: ['venueId'],
        }),
      ]),
    ])

  const connectionUserIds = [...statusByUserId.entries()]
    .filter(([, v]) => v.status === 'connected')
    .map(([id]) => id)

  const followedVenueIds = venueFollows.map((f) => f.venueId)
  const favouritedVenueIds = new Set(venueFollows.filter((f) => f.isFavourite).map((f) => f.venueId))
  const followedBusinessIds = businessFollows.map((f) => f.businessId)
  const favouritedBusinessIds = new Set(
    businessFollows.filter((f) => f.isFavourite).map((f) => f.businessId),
  )

  // Notice/Job reach: assigned managers of a venue/business, plus (venues only)
  // anyone with a current/previous Experience there, see NOTICE_POSTED and
  // JOB_POSTED activity even if they don't follow the venue/business.
  const noticeReachVenueIds = [
    ...new Set([...managedVenues.map((m) => m.venueId), ...workedVenues.map((w) => w.venueId)]),
  ]
  const noticeReachBusinessIds = managedBusinesses.map((m) => m.businessId)
  const venueReachTypes = ['NOTICE_POSTED', 'JOB_POSTED']

  const orConditions = [
    connectionUserIds.length > 0 ? { actorUserId: { in: connectionUserIds } } : null,
    followedVenueIds.length > 0 ? { venueId: { in: followedVenueIds } } : null,
    followedBusinessIds.length > 0 ? { businessId: { in: followedBusinessIds } } : null,
    noticeReachVenueIds.length > 0
      ? { type: { in: venueReachTypes }, venueId: { in: noticeReachVenueIds } }
      : null,
    noticeReachBusinessIds.length > 0
      ? { type: 'NOTICE_POSTED', businessId: { in: noticeReachBusinessIds } }
      : null,
    // Every other activity type is reach-through-others-only (a feed shows
    // what your network is doing, not your own actions) - but there's only
    // ever one CONNECTION_MADE row per connection now, actored by whoever
    // sent the request (see routes/connections.js), and it needs to reach
    // both participants. The accepter already sees it via the "connected to
    // the actor" rule above; this is what lets the sender see it too.
    { type: 'CONNECTION_MADE', actorUserId: req.userId },
  ].filter(Boolean)

  // Mirrors the existing Posts city filter, generalized to any of the four
  // location levels: an activity is attributed to its actor the same way a
  // Post is attributed to its author, so filtering by the actor's own
  // profile location is the natural analogue. Actor-less activities (and
  // ones whose actor has no location) are excluded once a filter is active,
  // since their placement can't be confirmed.
  const profileScopeWhere = scopeAncestors ? profileLocationWhere(scopeAncestors) : null

  // These three don't depend on each other - the main activity query and the
  // signup query filter on disjoint `type`s, and the suggestions computation
  // only needs scope + the already-fetched statusByUserId - so run them
  // concurrently instead of one after another.
  const [activities, signupActivitiesRaw, commonGroundPeople] = await Promise.all([
    orConditions.length
      ? prisma.activity.findMany({
          where: {
            type: { notIn: ['SIGNUP', 'PROFILE_UPDATED'] },
            AND: [
              { OR: orConditions },
              { OR: [{ actorUserId: null }, { actorUser: { isBlocked: false } }] },
              ...(profileScopeWhere ? [{ actorUser: { profile: profileScopeWhere } }] : []),
            ],
          },
          include: {
            actorUser: { include: { profile: { include: { city: true } } } },
            venue: { select: { id: true, name: true } },
            business: { select: { id: true, name: true } },
            notice: true,
            job: { select: { id: true, title: true } },
            experience: { select: { roleTitle: true } },
          },
          // Ordering/limiting by lastEngagementAt (not createdAt) so a notice
          // bumped by a fresh comment can resurface even if its original post
          // time would otherwise put it outside the take window.
          orderBy: { lastEngagementAt: 'desc' },
          take: ACTIVITY_LIMIT,
        })
      : [],
    prisma.activity.findMany({
      where: {
        type: 'SIGNUP',
        actorUserId: { not: req.userId },
        actorUser: { isBlocked: false, ...(profileScopeWhere ? { profile: profileScopeWhere } : {}) },
      },
      include: { actorUser: { include: { profile: { include: { city: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: SIGNUP_LIMIT,
    }),
    getCommonGroundPeople(req.userId, suggestionScopeAncestors, { statusByUserId }),
  ])

  const [feed, signupFeed] = await Promise.all([
    formatActivities(activities, {
      isFavourited: (a) =>
        (a.venueId && favouritedVenueIds.has(a.venueId)) ||
        (a.businessId && favouritedBusinessIds.has(a.businessId)),
    }),
    formatActivities(signupActivitiesRaw),
  ])

  const suggestions = commonGroundPeople.slice(0, SUGGESTION_LIMIT)

  const combinedActivities = [...feed, ...signupFeed].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  res.json({ activities: combinedActivities, suggestions })
})

// A permalink for a single Activity, independent of any feed's pagination or
// audience-reach rules - if you have a link to it (e.g. from a COMMENT
// notification), you're either its actor or someone who already commented
// on it. PROFILE_UPDATED is excluded the same way it's excluded everywhere
// else (see lib/activityFeed.js), since it's never actually emitted anymore.
router.get('/activities/:id', async (req, res) => {
  const activity = await prisma.activity.findUnique({
    where: { id: req.params.id },
    include: {
      actorUser: { include: { profile: { include: { city: true } } } },
      venue: { select: { id: true, name: true } },
      business: { select: { id: true, name: true } },
      notice: true,
      job: { select: { id: true, title: true } },
      experience: { select: { roleTitle: true } },
    },
  })
  if (!activity || activity.type === 'PROFILE_UPDATED') {
    return res.status(404).json({ error: 'Activity not found' })
  }

  const [formatted] = await formatActivities([activity])
  res.json({ activity: formatted })
})

module.exports = router
