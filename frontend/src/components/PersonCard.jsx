import { Link } from 'react-router-dom'
import { CONTENT_TYPES, contentTypeCardStyle } from '../lib/contentTypeColors'

function personName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}

function PersonCard({ person, extra, children }) {
  return (
    <div className="flex flex-col gap-3 rounded p-4" style={contentTypeCardStyle(CONTENT_TYPES.PEOPLE)}>
      <div>
        <Link to={`/profile/${person.id}`} className="font-medium text-text hover:underline">
          {personName(person.profile) || person.email}
        </Link>
        <p className="text-sm text-text-muted">{person.profile.professionalTitle}</p>
        <p className="text-sm text-text-faint">{person.profile.city?.name || 'No city set'}</p>
      </div>

      {extra && <p className="text-sm text-text-faint">{extra}</p>}

      {children && <div>{children}</div>}
    </div>
  )
}

export default PersonCard
