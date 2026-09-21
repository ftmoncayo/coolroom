import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import IdentityCard from '../components/profile/IdCard'
import ProfileDetails from '../components/profile/ProfileDetails'
import SkillsEditor from '../components/profile/SkillsEditor'
import KnowledgeAreaEditor from '../components/profile/KnowledgeAreaEditor'
import RequestEndorsementsPanel from '../components/profile/RequestEndorsementsPanel'
import ExperienceEditor from '../components/profile/ExperienceEditor'
import TrainingHistory from '../components/profile/TrainingHistory'
import CertificationsEditor from '../components/profile/CertificationsEditor'
import ConnectionsList from '../components/profile/ConnectionsList'
import ProfileViewers from '../components/profile/ProfileViewers'
import AboutSection from '../components/AboutSection'
import ActivityItem from '../components/ActivityItem'
import ShowMore from '../components/ShowMore'
import Section from '../components/Section'
import { instagramHandle, instagramUrl } from '../lib/instagram'
import { CONTENT_TYPES } from '../lib/contentTypeColors'

function Profile() {
  const location = useLocation()
  const { user } = useAuth()
  const { refreshProfile: refreshSharedProfile } = useProfile()
  const [profile, setProfile] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingDetails, setEditingDetails] = useState(false)
  const [inviteVenue, setInviteVenue] = useState(() => {
    try {
      const raw = localStorage.getItem('coolroom_invite_venue')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [prefillVenue, setPrefillVenue] = useState(null)
  const [showEndorsementPanel, setShowEndorsementPanel] = useState(false)

  function handleDismissInviteVenue() {
    localStorage.removeItem('coolroom_invite_venue')
    setInviteVenue(null)
  }

  function handleAddInviteExperience() {
    setPrefillVenue(inviteVenue)
    handleDismissInviteVenue()
  }

  useEffect(() => {
    api
      .fetchProfile()
      .then((data) => {
        setProfile(data.profile)
        if (!data.profile) setEditingDetails(true)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    api.fetchUserActivity(user.id).then(setActivity).catch(() => {})
  }, [user])

  // Lets a notification link straight to "#skills" or "#knowledge-bank"
  // (e.g. an endorsement confirmation) - a plain hash in the URL doesn't
  // auto-scroll on its own once React Router has already rendered the page,
  // so it needs a nudge once the section it points to actually exists.
  useEffect(() => {
    if (loading || !location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [loading, location.hash])

  async function refresh() {
    const data = await api.fetchProfile()
    setProfile(data.profile)
  }

  async function handleSaveDetails(data) {
    const result = await api.saveProfile(data)
    setProfile(result.profile)
    setEditingDetails(false)
    // Name/location can change here - keep the shared context (nav display
    // name, every page's default location-scope filter) in sync rather than
    // showing stale data until the next full app load.
    refreshSharedProfile()
  }

  async function handleAddSkill(name) {
    await api.addSkill(name)
    await refresh()
  }

  async function handleRemoveSkill(name) {
    await api.removeSkill(name)
    await refresh()
  }

  async function handleAddKnowledgeArea(name) {
    await api.addKnowledgeArea(name)
    await refresh()
  }

  async function handleRemoveKnowledgeArea(name) {
    await api.removeKnowledgeArea(name)
    await refresh()
  }

  async function handleCreateExperience(data) {
    await api.createExperience(data)
    await refresh()
  }

  async function handleUpdateExperience(id, data) {
    await api.updateExperience(id, data)
    await refresh()
  }

  async function handleDeleteExperience(id) {
    await api.deleteExperience(id)
    await refresh()
  }

  async function handleCreateCertification(data) {
    await api.createCertification(data)
    await refresh()
  }

  async function handleUpdateCertification(id, data) {
    await api.updateCertification(id, data)
    await refresh()
  }

  async function handleDeleteCertification(id) {
    await api.deleteCertification(id)
    await refresh()
  }

  async function handleSaveAbout(about) {
    const updated = await api.saveProfileAbout(about)
    setProfile(updated)
  }

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {error && <p className="text-sm text-danger">{error}</p>}

        {inviteVenue && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent bg-surface p-4">
            <p className="text-sm text-text">
              Did you work at <span className="font-medium">{inviteVenue.name}</span>?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddInviteExperience}
                className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover"
              >
                Add to your experience
              </button>
              <button
                type="button"
                onClick={handleDismissInviteVenue}
                className="text-sm text-text-muted hover:text-text"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {editingDetails ? (
          <ProfileDetails
            profile={profile}
            onSave={handleSaveDetails}
            onCancel={profile ? () => setEditingDetails(false) : undefined}
          />
        ) : (
          <>
            <IdentityCard profile={profile} isOwn onEdit={() => setEditingDetails(true)} />

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-faint">
              <span>
                {profile?.connectionsCount ?? 0} connection{profile?.connectionsCount === 1 ? '' : 's'}
              </span>
              {profile?.instagram && (
                <a
                  href={instagramUrl(profile.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-hover hover:underline"
                >
                  {instagramHandle(profile.instagram)}
                </a>
              )}
            </div>

            <Section title="About Me" topRule>
              <AboutSection
                about={profile?.about}
                canEdit={Boolean(profile)}
                onSave={handleSaveAbout}
                emptyMessage={
                  profile
                    ? 'Add an introduction to tell people about yourself.'
                    : 'Complete your profile above before adding an introduction.'
                }
                plain
              />
            </Section>

            {profile && (
              <Section title="Who's Viewed Your Profile" topRule>
                <ProfileViewers browseAnonymously={profile.browseAnonymously} />
              </Section>
            )}
          </>
        )}

        <Section title="Recent Activity" topRule>
          <ShowMore
            items={activity}
            initialCount={2}
            incrementCount={5}
            emptyMessage="No activity yet."
            renderItem={(item) => <ActivityItem key={item.id} activity={item} />}
          />
        </Section>

        <Section title="Experience" contentType={CONTENT_TYPES.EXPERIENCE} topRule>
          <ExperienceEditor
            profile={profile}
            experiences={profile?.experiences || []}
            onCreate={handleCreateExperience}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
            prefillVenue={prefillVenue}
          />
        </Section>

        <Section id="skills" title="Skills" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT} topRule>
          <SkillsEditor profile={profile} onAdd={handleAddSkill} onRemove={handleRemoveSkill} />
        </Section>

        <Section id="knowledge-bank" title="Knowledge Bank" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT} topRule>
          <KnowledgeAreaEditor
            profile={profile}
            onAdd={handleAddKnowledgeArea}
            onRemove={handleRemoveKnowledgeArea}
          />
        </Section>

        <Section title="Certifications" contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT} topRule>
          <CertificationsEditor
            profile={profile}
            certifications={profile?.certifications || []}
            onCreate={handleCreateCertification}
            onUpdate={handleUpdateCertification}
            onDelete={handleDeleteCertification}
          />
        </Section>

        {profile && (
          <Section
            title="Endorsements"
            contentType={CONTENT_TYPES.SKILL_KNOWLEDGE_CERT}
            topRule
            action={
              <button
                type="button"
                onClick={() => setShowEndorsementPanel((prev) => !prev)}
                className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover"
              >
                {showEndorsementPanel ? 'Hide' : 'Request Endorsements'}
              </button>
            }
          >
            <p className="text-sm text-text-faint">
              Ask colleagues or managers to endorse your skills and knowledge areas.
            </p>
            {showEndorsementPanel && (
              <RequestEndorsementsPanel profile={profile} onClose={() => setShowEndorsementPanel(false)} />
            )}
          </Section>
        )}

        <Section title="Training" contentType={CONTENT_TYPES.TRAINING} topRule>
          <TrainingHistory />
        </Section>

        <Section title="Connections" contentType={CONTENT_TYPES.PEOPLE} topRule>
          <ConnectionsList />
        </Section>
      </div>
    </div>
  )
}

export default Profile
