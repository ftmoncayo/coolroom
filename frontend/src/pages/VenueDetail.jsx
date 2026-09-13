import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import VenueForm from '../components/venue/VenueForm'
import VerificationBadge from '../components/venue/VerificationBadge'
import VenueManagersPanel from '../components/venue/VenueManagersPanel'
import PendingManagerRequests from '../components/venue/PendingManagerRequests'
import VenueWorkers from '../components/venue/VenueWorkers'
import VenueTypeIcon from '../components/venue/VenueTypeIcon'
import Tag from '../components/Tag'
import AboutSection from '../components/AboutSection'
import NominateManagerButton from '../components/NominateManagerButton'
import PostNoticeBox from '../components/PostNoticeBox'
import ActivityItem from '../components/ActivityItem'
import ShowMore from '../components/ShowMore'
import PastEvents from '../components/event/PastEvents'
import Section from '../components/Section'

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function isTrainingCategory(event) {
  return (event.category?.name || '').trim().toLowerCase() === 'training'
}

function VenueJobCard({ job, canManage, onApply, applying }) {
  return (
    <div className="rounded border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/jobs/${job.id}`} className="font-medium text-text hover:text-accent hover:underline">
            {job.title}
          </Link>
          <p className="mt-1 whitespace-pre-wrap text-sm text-text-faint">{job.description}</p>
        </div>
        {canManage ? (
          <Link
            to={`/jobs/${job.id}`}
            className="shrink-0 text-sm text-accent hover:text-accent-hover hover:underline"
          >
            Manage
          </Link>
        ) : job.hasApplied ? (
          <span className="shrink-0 rounded border border-accent px-3 py-1.5 text-sm font-medium text-accent">
            Applied
          </span>
        ) : (
          <button
            type="button"
            disabled={applying}
            onClick={() => onApply(job.id)}
            className="shrink-0 rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        )}
      </div>
      {(job.skills.length > 0 || job.knowledgeAreas.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills.map((s) => (
            <Tag key={s.id}>{s.name}</Tag>
          ))}
          {job.knowledgeAreas.map((k) => (
            <Tag key={k.id}>{k.name}</Tag>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm text-text-faint">
        {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
      </p>
    </div>
  )
}

function VenueDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [venue, setVenue] = useState(null)
  const [activity, setActivity] = useState([])
  const [jobs, setJobs] = useState([])
  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applyingId, setApplyingId] = useState('')

  useEffect(() => {
    api
      .fetchVenue(id)
      .then(setVenue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function refreshActivity() {
    return api.fetchVenueActivity(id).then(setActivity)
  }

  function refreshJobs() {
    return api.fetchJobs({ venueId: id, status: 'OPEN', scope: null }).then(setJobs)
  }

  useEffect(() => {
    refreshActivity().catch(() => {})
    refreshJobs().catch(() => {})
    api
      .fetchEvents({ ownerType: 'VENUE', ownerId: id, when: 'upcoming', scope: null })
      .then((all) => setEvents(all.filter((e) => !isTrainingCategory(e))))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSave(data) {
    const updated = await api.updateVenue(id, data)
    setVenue(updated)
    setEditing(false)
  }

  async function handleSaveAbout(about) {
    const updated = await api.saveVenueAbout(id, about)
    setVenue(updated)
  }

  async function handleToggleFollow() {
    const isFollowing = venue.isFollowing ? await api.unfollowVenue(id) : await api.followVenue(id)
    setVenue((prev) => ({ ...prev, isFollowing, isFavourite: isFollowing ? prev.isFavourite : false }))
  }

  async function handleToggleFavourite() {
    const result = await api.favouriteVenue(id)
    setVenue((prev) => ({ ...prev, isFollowing: result.isFollowing, isFavourite: result.isFavourite }))
  }

  async function handleApply(jobId) {
    setApplyingId(jobId)
    try {
      await api.applyToJob(jobId)
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, hasApplied: true } : j)))
    } catch (err) {
      setError(err.message)
    } finally {
      setApplyingId('')
    }
  }

  if (loading) return null

  if (error && !venue) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {error && <p className="text-sm text-danger">{error}</p>}

        {editing ? (
          <VenueForm initial={venue} isEditing onSubmit={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-text-muted"
              aria-hidden="true"
            >
              <VenueTypeIcon venueTypeName={venue.venueType?.name} className="h-7 w-7" />
            </div>
            <div className="flex min-w-[12rem] flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-text">{venue.name}</h1>
                <VerificationBadge status={venue.verificationStatus} />
                {venue.canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-accent hover:text-accent-hover hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm text-text-muted">{venue.venueType?.name}</p>
              <p className="text-sm text-text-faint">
                {[venue.suburb?.name, venue.city?.name, venue.city?.state?.name, venue.city?.state?.country?.name]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
              {venue.specialties.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {venue.specialties.map((s) => (
                    <Tag key={s.id}>{s.name}</Tag>
                  ))}
                </div>
              )}
              {venue.hasExperienceHere && (
                <Link
                  to={`/invite?venueId=${id}`}
                  className="text-sm text-accent hover:text-accent-hover hover:underline"
                >
                  Invite a coworker
                </Link>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={
                  venue.isFollowing
                    ? 'rounded border border-border-strong px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover'
                    : 'rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-text hover:bg-accent-hover'
                }
              >
                {venue.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                type="button"
                onClick={handleToggleFavourite}
                aria-label={venue.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                className={
                  venue.isFavourite
                    ? 'rounded border border-accent px-3 py-1.5 text-sm text-accent'
                    : 'rounded border border-border-strong px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover'
                }
              >
                {venue.isFavourite ? '★ Favourited' : '☆ Favourite'}
              </button>
            </div>
          </div>
        )}

        {!venue.canEdit && venue.managerCount === 0 && (
          <NominateManagerButton
            label="Request to manage this venue"
            onSubmit={(message) => api.nominateVenueManager(id, message)}
          />
        )}

        <Section title="Our Story & Culture">
          <AboutSection
            about={venue.about}
            canEdit={venue.canEdit}
            onSave={handleSaveAbout}
            emptyMessage={venue.canEdit ? 'Add an introduction for this venue.' : 'No introduction added yet.'}
            plain
          />
        </Section>

        <Section
          title="Updates and Announcements"
          action={
            venue.canEdit && (
              <Link
                to={`/venues/${id}/jobs/new`}
                className="text-sm text-accent hover:text-accent-hover hover:underline"
              >
                + Post a job
              </Link>
            )
          }
        >
          {venue.isManager && (
            <PostNoticeBox onSubmit={(content) => api.postVenueNotice(id, content)} onPosted={refreshActivity} />
          )}
          <ShowMore
            items={activity}
            initialCount={5}
            incrementCount={5}
            emptyMessage="No updates yet."
            renderItem={(item) => <ActivityItem key={item.id} activity={item} />}
          />
        </Section>

        <Section
          title="Events"
          action={
            venue.canEdit && (
              <Link
                to={`/venues/${id}/events/new`}
                className="text-sm text-accent hover:text-accent-hover hover:underline"
              >
                + Create event
              </Link>
            )
          }
        >
          {events.length === 0 && <p className="text-sm text-text-faint">No upcoming events.</p>}
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center justify-between gap-3 rounded border border-border p-4 hover:border-border-strong hover:bg-surface-hover"
              >
                <div>
                  <p className="font-medium text-text">{event.title}</p>
                  <p className="text-sm text-text-faint">
                    {formatDateTime(event.startAt)} · {event.category.name}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-text-faint">
                  {event.interestCount} interested
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Who We Are Looking For">
          {jobs.length === 0 && <p className="text-sm text-text-faint">No open roles right now.</p>}
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <VenueJobCard
                key={job.id}
                job={job}
                canManage={venue.canEdit}
                onApply={handleApply}
                applying={applyingId === job.id}
              />
            ))}
          </div>
        </Section>

        <Section title="Staff">
          <VenueWorkers venueId={id} />
        </Section>

        <Section title="Past Events">
          <PastEvents ownerType="VENUE" ownerId={id} canEdit={venue.canEdit} />
        </Section>

        {venue.canManageNominations && <PendingManagerRequests venueId={id} />}

        {(user?.isAdmin || user?.isVenueAdmin) && <VenueManagersPanel venueId={id} />}

        {venue.verifiedManagers?.length > 0 && (
          <p className="text-sm text-text-muted">
            {venue.name} is managed by:{' '}
            {venue.verifiedManagers.map((manager, i) => (
              <span key={manager.id}>
                {i > 0 && ', '}
                <Link
                  to={`/profile/${manager.id}`}
                  className="text-success hover:text-success-hover hover:underline"
                >
                  {manager.name}
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}

export default VenueDetail
