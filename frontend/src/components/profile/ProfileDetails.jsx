import { useState } from 'react'
import LocationCascade from '../LocationCascade'
import { initialLocationSelection, rightToWorkLabel } from '../../lib/location'
import { IdCardShell, IdPhotoFrame, initials } from './IdCard'

const inputClass = 'rounded border border-border-strong bg-bg px-3 py-2 text-text focus:border-accent'
const labelClass = 'flex flex-col gap-1 text-sm text-text-muted'

// Edit mode for the identity card above (name/location/title/right to
// work/cultural identity/languages) plus the profile-level fields that
// live outside the card even in the read view (Instagram, browse
// anonymously). Same card shell as the read-only IdentityCard so editing
// doesn't swap to a differently-shaped form.
function ProfileDetails({ profile, onSave, onCancel }) {
  const [firstName, setFirstName] = useState(profile?.firstName || '')
  const [lastName, setLastName] = useState(profile?.lastName || '')
  const initialLocation = initialLocationSelection(profile)
  const [country, setCountry] = useState(initialLocation.country)
  const [state, setState] = useState(initialLocation.state)
  const [city, setCity] = useState(initialLocation.city)
  const [suburb, setSuburb] = useState(initialLocation.suburb)
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professionalTitle || '')
  const [rightToWork, setRightToWork] = useState(profile?.rightToWork ?? false)
  const [culturalIdentity, setCulturalIdentity] = useState(profile?.culturalIdentity || '')
  const [languages, setLanguages] = useState(profile?.languages || '')
  const [instagram, setInstagram] = useState(profile?.instagram || '')
  const [browseAnonymously, setBrowseAnonymously] = useState(profile?.browseAnonymously ?? false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleCountryChange(newCountry) {
    setCountry(newCountry)
    setState(null)
    setCity(null)
    setSuburb(null)
  }

  function handleStateChange(newState) {
    setState(newState)
    setCity(null)
    setSuburb(null)
  }

  function handleCityChange(newCity) {
    setCity(newCity)
    setSuburb(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSave({
        firstName,
        lastName,
        countryId: country?.id || null,
        stateId: state?.id || null,
        cityId: city?.id || null,
        suburbId: suburb?.id || null,
        professionalTitle,
        rightToWork,
        culturalIdentity,
        languages,
        instagram,
        browseAnonymously,
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <IdCardShell>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <IdPhotoFrame>{initials({ firstName, lastName })}</IdPhotoFrame>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <h2 className="text-xl font-semibold uppercase tracking-wide text-text sm:pr-20">
              {profile ? 'Edit profile' : 'Complete your profile'}
            </h2>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                First name
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Last name (optional)
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className={labelClass}>
              Professional title
              <input
                type="text"
                required
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LocationCascade
                country={country}
                state={state}
                city={city}
                suburb={suburb}
                onCountryChange={handleCountryChange}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                onSuburbChange={setSuburb}
                suburbLabel="Suburb (optional)"
              />

              <label className={`${labelClass} sm:col-span-2`}>
                Cultural identity / background (optional)
                <textarea
                  value={culturalIdentity}
                  onChange={(e) => setCulturalIdentity(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Languages spoken (optional)
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Spanish"
                  className={inputClass}
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  checked={rightToWork}
                  onChange={(e) => setRightToWork(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                {rightToWorkLabel(country?.name)}
              </label>
            </div>
          </div>
        </div>
      </IdCardShell>

      <label className={labelClass}>
        Instagram (optional)
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@handle or full URL"
          className={inputClass}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={browseAnonymously}
          onChange={(e) => setBrowseAnonymously(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-accent"
        />
        <span>
          Browse anonymously
          <span className="block text-xs text-text-faint">
            Hides your name when you view other people's profiles. In exchange, you won't see who's named
            in your own "Who's viewed your profile" list either — just the total count.
          </span>
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-accent px-4 py-2 font-medium text-accent-text hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        {profile && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border-strong px-4 py-2 text-text-muted hover:bg-surface-hover"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ProfileDetails
