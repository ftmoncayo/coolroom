import { NavRow } from './SectionRows'

function personName(profile) {
  if (!profile) return null
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}

// A person row for use inside a RowList (people panels on Home, Discover,
// Connections, Connections in Common). The whole row opens the profile;
// `children` are inline controls (Connect, Message, Remove...) that sit
// above the row's link, so tapping one never also navigates.
function PersonCard({ person, extra, children }) {
  const name = personName(person.profile) || person.email

  return (
    <NavRow to={`/profile/${person.id}`} label={name} controls={children}>
      <p className="font-medium text-text">{name}</p>
      {person.profile ? (
        <>
          <p className="text-sm text-text-muted">{person.profile.professionalTitle}</p>
          <p className="text-sm text-text-faint">{person.profile.city?.name || 'No city set'}</p>
        </>
      ) : (
        <p className="text-sm text-text-faint">Hasn't set up their profile yet</p>
      )}
      {extra && <p className="text-sm text-text-faint">{extra}</p>}
    </NavRow>
  )
}

export default PersonCard
