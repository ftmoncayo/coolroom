import { Link } from 'react-router-dom'

function personName(profile) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}

function PersonCard({ person, extra, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-section-people p-4">
      <div>
        <Link to={`/profile/${person.id}`} className="font-semibold text-section-people-text hover:underline">
          {personName(person.profile) || person.email}
        </Link>
        <p className="text-sm text-section-people-text/70">{person.profile.professionalTitle}</p>
        <p className="text-sm text-section-people-text/60">{person.profile.city?.name || 'No city set'}</p>
      </div>

      {extra && <p className="text-sm text-section-people-text/60">{extra}</p>}

      {children && <div>{children}</div>}
    </div>
  )
}

export default PersonCard
