import { useEffect, useState } from 'react'
import * as api from '../lib/api'
import LocationScopeFilter from '../components/LocationScopeFilter'
import useLocationScopeFilter from '../hooks/useLocationScopeFilter'
import { Panel } from '../components/Section'
import { NavRow, RowList } from '../components/SectionRows'
import { CONTENT_TYPES } from '../lib/contentTypeColors'

function JobRow({ job }) {
  return (
    <NavRow
      to={`/jobs/${job.id}`}
      label={job.title}
      meta={
        job.hasApplied && (
          <span className="shrink-0 rounded border border-accent px-2 py-0.5 text-xs font-medium text-accent">
            Applied
          </span>
        )
      }
    >
      <p className="font-medium text-text">{job.title}</p>
      <p className="text-sm text-text-muted">
        {job.venue.name}
        {job.venue.isFavourite && (
          <span className="ml-2 text-accent" title="Favourited venue">
            ★
          </span>
        )}
        {!job.venue.isFavourite && job.venue.isFollowing && (
          <span className="ml-2 text-xs text-text-faint">Following</span>
        )}
      </p>
      <p className="mt-1 text-sm text-text-faint">
        {job.skillMatchCount} skill{job.skillMatchCount === 1 ? '' : 's'} matched, {job.knowledgeMatchCount}{' '}
        knowledge area{job.knowledgeMatchCount === 1 ? '' : 's'} matched
      </p>
      <p className="text-sm text-text-faint">
        {job.mutualConnectionsAtVenue} mutual connection{job.mutualConnectionsAtVenue === 1 ? '' : 's'} at this
        venue
      </p>
      <p className="text-sm text-text-faint">
        {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
      </p>
    </NavRow>
  )
}

function MyJobRow({ job }) {
  return (
    <NavRow
      to={`/jobs/${job.id}`}
      label={job.title}
      meta={
        job.status === 'CLOSED' && (
          <span className="shrink-0 rounded border border-border-strong px-2 py-0.5 text-xs text-text-muted">
            Closed
          </span>
        )
      }
    >
      <p className="font-medium text-text">{job.title}</p>
      <p className="text-sm text-text-muted">{job.venue.name}</p>
      <p className="text-sm text-text-faint">
        {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
      </p>
    </NavRow>
  )
}

function JobsDirectory({ mine = false }) {
  const [jobs, setJobs] = useState([])
  const [sort, setSort] = useState('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { selection, setSelection, scope } = useLocationScopeFilter()

  useEffect(() => {
    setLoading(true)
    // "My Jobs" is never location-filtered - it's every job at venues the
    // viewer manages, regardless of location, so it must explicitly opt out
    // (null) rather than omit scope (which would default to the viewer's
    // own location server-side - see resolveScopeForRequest).
    api
      .fetchJobs({ scope: mine ? null : scope, sort: mine ? undefined : sort, mine })
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sort, mine, scope])

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">{mine ? 'My jobs' : 'Jobs'}</h1>

        {!mine && (
          <div className="flex flex-wrap items-center gap-4">
            <LocationScopeFilter {...selection} onChange={setSelection} />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-faint">Sort:</span>
              <button
                onClick={() => setSort('recent')}
                className={`rounded px-3 py-1 ${
                  sort === 'recent' ? 'bg-accent text-accent-text' : 'text-text-muted hover:bg-surface-hover'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSort('match')}
                className={`rounded px-3 py-1 ${
                  sort === 'match' ? 'bg-accent text-accent-text' : 'text-text-muted hover:bg-surface-hover'
                }`}
              >
                Best Match
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        {!loading && jobs.length === 0 && (
          <p className="text-sm text-text-faint">
            {mine ? 'No jobs posted at venues you manage yet.' : 'No jobs found.'}
          </p>
        )}
        {jobs.length > 0 && (
          <Panel contentType={CONTENT_TYPES.JOB}>
            <RowList>
              {jobs.map((job) => (mine ? <MyJobRow key={job.id} job={job} /> : <JobRow key={job.id} job={job} />))}
            </RowList>
          </Panel>
        )}
      </div>
    </div>
  )
}

export default JobsDirectory
