// Plain, unboxed section block used across Profile/Venue/Home: an all-caps
// heading with no card/border wrapper, matching how Recent Activity already
// rendered before this became the standard everywhere.
function Section({ id, title, action, children }) {
  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold uppercase tracking-wide text-text">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export default Section
