import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useNotifications } from '../context/NotificationsContext'
import * as api from '../lib/api'
import ActivityItem from '../components/ActivityItem'
import PostItem from '../components/PostItem'
import PersonCard from '../components/PersonCard'
import ConnectionButton from '../components/ConnectionButton'
import SearchCombobox from '../components/SearchCombobox'
import ShowMore from '../components/ShowMore'
import LocationScopeFilter from '../components/LocationScopeFilter'
import useLocationScopeFilter from '../hooks/useLocationScopeFilter'
import Section from '../components/Section'
import VenueTypeIcon from '../components/venue/VenueTypeIcon'

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function HomeEventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex items-center justify-between gap-3 rounded border border-border p-4 hover:border-border-strong hover:bg-surface-hover"
    >
      <div>
        <p className="font-medium text-text">{event.title}</p>
        <p className="text-sm text-text-faint">
          {event.owner.name} · {formatDateTime(event.startAt)}
        </p>
      </div>
      <span className="shrink-0 text-sm text-text-faint">{event.interestCount} interested</span>
    </Link>
  )
}

function RecommendedJobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex items-center gap-3 rounded border border-border p-4 hover:border-border-strong hover:bg-surface-hover"
    >
      <VenueTypeIcon venueTypeName={job.venue.venueType?.name} className="h-6 w-6 shrink-0 text-text-faint" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text">{job.title}</p>
        <p className="text-sm text-text-faint">{job.venue.name}</p>
      </div>
      <span className="shrink-0 text-sm text-text-faint">
        {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
      </span>
    </Link>
  )
}

function MoreLink({ to }) {
  return (
    <Link to={to} className="text-sm text-accent hover:text-accent-hover hover:underline">
      More
    </Link>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { refreshUnreadCount } = useNotifications()
  const [activities, setActivities] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [posts, setPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [trainingEvents, setTrainingEvents] = useState([])
  const [trainingCategoryId, setTrainingCategoryId] = useState(null)
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [cityTouched, setCityTouched] = useState(false)
  const [cityOverride, setCityOverride] = useState(null)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [feedLoading, setFeedLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [error, setError] = useState('')
  const activityFilter = useLocationScopeFilter()
  const suggestionFilter = useLocationScopeFilter()

  // Derived (not synced via effect) so it reflects the shared profile the
  // instant it loads, on the same render - no lag for the posts effect
  // below to race against. Still user-editable via the post composer's own
  // city picker, independent of the Activity/Suggestions location filters.
  const cityFilter = cityTouched ? cityOverride : profile?.city || null
  // Assume complete while the shared profile is still loading, so the
  // banner doesn't flash on for a moment before the real value is known.
  const profileComplete = profileLoading ? true : Boolean(profile?.professionalTitle)
  const loading = feedLoading || postsLoading

  function handleCityFilterChange(city) {
    setCityTouched(true)
    setCityOverride(city)
  }

  // Scope now defaults server-side (see resolveScopeForRequest on the
  // backend) when the viewer hasn't touched the filter, so this fires
  // immediately on mount - no need to wait on a profile fetch first.
  useEffect(() => {
    setFeedLoading(true)
    api
      .fetchFeed({ scope: activityFilter.scope, suggestionScope: suggestionFilter.scope })
      .then((data) => {
        setActivities(data.activities)
        setSuggestions(data.suggestions)
      })
      .catch((err) => setError(err.message))
      .finally(() => setFeedLoading(false))
  }, [activityFilter.scope, suggestionFilter.scope])

  // Runs in parallel with the feed fetch above, not after it - but waits on
  // profileLoading so "no city yet" (still loading) isn't mistaken for
  // "genuinely no city" (nothing to fetch) and left showing a premature
  // empty state.
  useEffect(() => {
    if (profileLoading) return
    if (!cityFilter) {
      setPosts([])
      setPostsLoading(false)
      return
    }
    setPostsLoading(true)
    api
      .fetchPosts(cityFilter.id)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setPostsLoading(false))
  }, [cityFilter, profileLoading])

  // Events/Training/Now Recruiting all default to the viewer's own profile
  // location (same server-side default the Events/Jobs directories
  // themselves fall back on) - no manual filter control here, just the one
  // always-on default scope, which is also what makes each section's "More"
  // link to the full directory land on the same results with zero query
  // params needed: both sides resolve the identical default independently.
  useEffect(() => {
    api
      .fetchRecommendedEvents()
      .then((data) => {
        setUpcomingEvents(data.events)
        setTrainingEvents(data.training)
        setTrainingCategoryId(data.trainingCategoryId)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api
      .fetchRecommendedJobs()
      .then(setRecommendedJobs)
      .catch(() => {})
  }, [])

  function updateSuggestion(userId, changes) {
    setSuggestions((prev) => prev.map((p) => (p.id === userId ? { ...p, ...changes } : p)))
  }

  async function handleConnect(person) {
    const request = await api.requestConnection(person.id)
    updateSuggestion(person.id, {
      connectionStatus: request.status === 'PENDING' ? 'pending-sent' : person.connectionStatus,
    })
  }

  async function handleAccept(person) {
    await api.acceptConnectionRequest(person.connectionRequestId)
    updateSuggestion(person.id, { connectionStatus: 'connected' })
    refreshUnreadCount()
  }

  async function handleDecline(person) {
    await api.declineConnectionRequest(person.connectionRequestId)
    updateSuggestion(person.id, { connectionStatus: 'none', connectionRequestId: null })
    refreshUnreadCount()
  }

  async function handleCreatePost(e) {
    e.preventDefault()
    if (!postContent.trim()) return
    setPostError('')
    setPosting(true)
    try {
      await api.createPost(postContent.trim())
      setPostContent('')
      if (cityFilter) {
        setPosts(await api.fetchPosts(cityFilter.id))
      }
    } catch (err) {
      setPostError(err.message)
    } finally {
      setPosting(false)
    }
  }

  async function handleDeletePost(id) {
    await api.deletePost(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const feedItems = useMemo(() => {
    const activityItems = activities.map((a) => ({
      kind: 'activity',
      id: `activity-${a.id}`,
      createdAt: a.createdAt,
      data: a,
    }))
    const postItems = posts.map((p) => ({ kind: 'post', id: `post-${p.id}`, createdAt: p.createdAt, data: p }))

    return [...activityItems, ...postItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [activities, posts])

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text">Home</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/invite" className="text-accent hover:text-accent-hover hover:underline">
              Invite someone
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        {!profileComplete && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent bg-surface p-4">
            <p className="text-sm text-text">
              Your profile is incomplete — add your name, title, and city so people can find you.
            </p>
            <Link
              to="/profile"
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover"
            >
              Create your profile
            </Link>
          </div>
        )}

        <Section
          title="Updates and Announcements"
          action={<LocationScopeFilter {...activityFilter.selection} onChange={activityFilter.setSelection} />}
        >
          <form onSubmit={handleCreatePost} className="flex flex-col gap-3 border-b border-border pb-6">
            {postError && <p className="text-sm text-danger">{postError}</p>}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share a notice with your city..."
              rows={3}
              className="rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent"
            />
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                City
                <div className="w-56">
                  <SearchCombobox
                    fetchOptions={api.fetchCities}
                    onSelect={handleCityFilterChange}
                    allowCreate={false}
                    initialQuery={cityFilter?.name || ''}
                    placeholder="Search for a city..."
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={posting || !postContent.trim()}
                className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          {!loading && (
            <ShowMore
              items={feedItems}
              initialCount={5}
              incrementCount={5}
              emptyMessage="No activity yet. Connect with people, follow venues or businesses, or post a notice to see updates here."
              renderItem={(item) =>
                item.kind === 'post' ? (
                  <PostItem
                    key={item.id}
                    post={item.data}
                    canDelete={Boolean(user?.isAdmin)}
                    onDelete={handleDeletePost}
                  />
                ) : (
                  <ActivityItem key={item.id} activity={item.data} />
                )
              }
            />
          )}
        </Section>

        <Section title="Events" action={<MoreLink to="/events" />}>
          {upcomingEvents.length === 0 && <p className="text-sm text-text-faint">No upcoming events.</p>}
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event) => (
              <HomeEventCard key={event.id} event={event} />
            ))}
          </div>
        </Section>

        <Section
          title="Training"
          action={
            <MoreLink
              to={trainingCategoryId ? `/events?categoryId=${trainingCategoryId}&categoryName=Training` : '/events'}
            />
          }
        >
          {trainingEvents.length === 0 && <p className="text-sm text-text-faint">No upcoming training.</p>}
          <div className="flex flex-col gap-3">
            {trainingEvents.map((event) => (
              <HomeEventCard key={event.id} event={event} />
            ))}
          </div>
        </Section>

        <Section title="Now Recruiting" action={<MoreLink to="/jobs" />}>
          {recommendedJobs.length === 0 && (
            <p className="text-sm text-text-faint">No open roles near you right now.</p>
          )}
          <div className="flex flex-col gap-3">
            {recommendedJobs.map((job) => (
              <RecommendedJobCard key={job.id} job={job} />
            ))}
          </div>
        </Section>

        {!loading && (
          <Section
            title="People in Your Industry"
            action={<LocationScopeFilter {...suggestionFilter.selection} onChange={suggestionFilter.setSelection} />}
          >
            {suggestions.length === 0 && <p className="text-sm text-text-faint">No one to show yet.</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {suggestions.map((person) => (
                <PersonCard key={person.id} person={person}>
                  <ConnectionButton
                    status={person.connectionStatus}
                    onConnect={() => handleConnect(person)}
                    onAccept={() => handleAccept(person)}
                    onDecline={() => handleDecline(person)}
                  />
                </PersonCard>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export default Dashboard
