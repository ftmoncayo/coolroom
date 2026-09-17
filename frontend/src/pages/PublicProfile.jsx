import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import ReportButton from '../components/ReportButton'
import AboutSection from '../components/AboutSection'
import ConnectionButton from '../components/ConnectionButton'
import Tag from '../components/Tag'
import TagLevelInfo from '../components/TagLevelInfo'
import PersonCard from '../components/PersonCard'
import ActivityItem from '../components/ActivityItem'
import ShowMore from '../components/ShowMore'
import Section from '../components/Section'
import ProfileHeader from '../components/profile/ProfileHeader'
import VenueTypeIcon from '../components/venue/VenueTypeIcon'
import { locationCountryName, rightToWorkLabel } from '../lib/location'
import { sortByLevel } from '../lib/levelLabel'
import { CONTENT_TYPES, contentTypeCardStyle } from '../lib/contentTypeColors'

function formatDate(value) {
  if (!value) return ''
  return value.slice(0, 10)
}

function PublicProfile() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { refreshUnreadCount } = useNotifications()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId === user?.id) {
      navigate('/profile', { replace: true })
      return
    }
    setLoading(true)
    setError('')
    api
      .fetchPublicProfile(userId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    api.fetchUserActivity(userId).then(setActivity).catch(() => {})
  }, [userId, user?.id, navigate])

  async function handleConnect() {
    const request = await api.requestConnection(userId)
    setData((prev) => ({
      ...prev,
      connectionStatus: request.status === 'PENDING' ? 'pending-sent' : prev.connectionStatus,
    }))
  }

  async function handleAccept() {
    await api.acceptConnectionRequest(data.connectionRequestId)
    setData((prev) => ({ ...prev, connectionStatus: 'connected' }))
    refreshUnreadCount()
  }

  async function handleDecline() {
    await api.declineConnectionRequest(data.connectionRequestId)
    setData((prev) => ({ ...prev, connectionStatus: 'none', connectionRequestId: null }))
    refreshUnreadCount()
  }

  async function handleRemove() {
    await api.removeConnection(userId)
    setData((prev) => ({ ...prev, connectionStatus: 'none', connectionRequestId: null }))
  }

  async function handleMessage() {
    const conversation = await api.startConversation(userId)
    navigate(`/messages/${conversation.id}`)
  }

  if (loading) return null

  if (error) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-danger">{error}</p>
        </div>
      </div>
    )
  }

  if (data.unavailable) {
    return (
      <div className="min-h-screen bg-bg px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-text-faint">This profile is unavailable.</p>
        </div>
      </div>
    )
  }

  const { profile } = data

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <ProfileHeader
          profile={profile}
          connectionsCount={profile.connectionsCount}
          extraStat={[
            `${data.mutualConnections.length} connection${data.mutualConnections.length === 1 ? '' : 's'} in common`,
            `${data.sharedVenuesCount} venue${data.sharedVenuesCount === 1 ? '' : 's'} in common`,
          ]}
        >
          <ConnectionButton
            status={data.connectionStatus}
            onConnect={handleConnect}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
          {data.connectionStatus === 'connected' && (
            <>
              <button
                type="button"
                onClick={handleMessage}
                className="rounded border border-border-strong px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
              >
                Message
              </button>
              <button type="button" onClick={handleRemove} className="text-sm text-danger hover:underline">
                Remove connection
              </button>
            </>
          )}
        </ProfileHeader>

        <Section title="About Me">
          <AboutSection about={profile.about} canEdit={false} emptyMessage="Nothing here yet." plain />
        </Section>

        <Section title="ID Card">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-text-faint">Cultural identity / background</dt>
              <dd className="text-text">{profile.culturalIdentity || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-faint">Languages spoken</dt>
              <dd className="text-text">{profile.languages || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-faint">{rightToWorkLabel(locationCountryName(profile))}</dt>
              <dd className="text-text">{profile.rightToWork ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Recent Activity">
          <ShowMore
            items={activity}
            initialCount={2}
            incrementCount={5}
            emptyMessage="No activity yet."
            renderItem={(item) => <ActivityItem key={item.id} activity={item} />}
          />
        </Section>

        <Section title="Experience" contentType={CONTENT_TYPES.EXPERIENCE}>
          <div className="flex flex-col gap-3">
            {profile.experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex items-start gap-3 rounded p-4"
                style={contentTypeCardStyle(CONTENT_TYPES.EXPERIENCE)}
              >
                <VenueTypeIcon
                  venueTypeName={exp.venue.venueType?.name}
                  className="mt-1 h-5 w-5 shrink-0 text-text-faint"
                />
                <div>
                  <p className="font-medium text-text">{exp.roleTitle}</p>
                  <Link
                    to={`/venues/${exp.venue.id}`}
                    className="text-sm text-accent hover:text-accent-hover hover:underline"
                  >
                    {exp.venue.name}
                  </Link>
                  <p className="text-sm text-text-faint">
                    {formatDate(exp.startDate)} – {exp.isCurrent ? 'Current' : formatDate(exp.endDate) || '—'}
                  </p>
                </div>
              </div>
            ))}
            {profile.experiences.length === 0 && (
              <p className="text-sm text-text-faint">No experience added yet.</p>
            )}
          </div>
        </Section>

        <Section title="Skills" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT} action={<TagLevelInfo />}>
          <div className="flex flex-wrap gap-2">
            {sortByLevel(profile.skills).map((skill) => (
              <Tag key={skill.id} level={skill.level}>
                {skill.name}
              </Tag>
            ))}
            {profile.skills.length === 0 && <p className="text-sm text-text-faint">No skills added yet.</p>}
          </div>
        </Section>

        <Section title="Knowledge Bank" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT} action={<TagLevelInfo />}>
          <div className="flex flex-wrap gap-2">
            {sortByLevel(profile.knowledgeAreas).map((area) => (
              <Tag key={area.id} level={area.level}>
                {area.name}
              </Tag>
            ))}
            {profile.knowledgeAreas.length === 0 && (
              <p className="text-sm text-text-faint">No knowledge areas added yet.</p>
            )}
          </div>
        </Section>

        <Section title="Certifications" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT}>
          <div className="flex flex-col gap-3">
            {profile.certifications.map((cert) => (
              <div
                key={cert.id}
                className="rounded p-4"
                style={contentTypeCardStyle(CONTENT_TYPES.SKILL_KNOWLEDGE_CERT)}
              >
                <p className="font-medium text-text">{cert.certificationType?.name}</p>
                <p className="text-sm text-text-faint">
                  Issued {formatDate(cert.issueDate)}
                  {cert.expiryDate ? ` · Expires ${formatDate(cert.expiryDate)}` : ''}
                </p>
              </div>
            ))}
            {profile.certifications.length === 0 && (
              <p className="text-sm text-text-faint">No certifications added yet.</p>
            )}
          </div>
        </Section>

        <Section title="Connections in Common" contentType={CONTENT_TYPES.PEOPLE}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.mutualConnections.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
            {data.mutualConnections.length === 0 && (
              <p className="text-sm text-text-faint">No connections in common yet.</p>
            )}
          </div>
        </Section>

        <div className="flex justify-end">
          <ReportButton targetType="PROFILE" targetId={userId} />
        </div>
      </div>
    </div>
  )
}

export default PublicProfile
