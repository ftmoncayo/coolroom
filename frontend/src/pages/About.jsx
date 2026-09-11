import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const TABS = [
  { id: 'why', label: 'Why Staffie' },
  { id: 'how-to', label: 'How to Use This' },
  { id: 'privacy', label: 'Data & Privacy' },
]

// Copy to be supplied - see conversation. Deliberately left empty rather
// than filled with placeholder text.
function WhyStaffieContent() {
  return null
}

function GuideSection({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <div className="flex flex-col gap-2 text-sm text-text-muted">{children}</div>
    </div>
  )
}

function HowToUseContent() {
  return (
    <div className="flex flex-col gap-8">
      <GuideSection title="Build your profile">
        <p>
          Head to your <Link to="/profile" className="text-accent hover:underline">Profile</Link> and fill in
          your ID Card (professional title, location, right to work, cultural identity, languages spoken),
          add an "About Me" introduction, and log your Experience — the venues you've worked at and when.
        </p>
        <p>
          Add Skills and Knowledge Bank entries for what you can do and what you know. Each one starts as
          self-declared until someone who's actually seen you work vouches for it.
        </p>
      </GuideSection>

      <GuideSection title="Get endorsed">
        <p>Skills and Knowledge Bank items move through tiers as people vouch for them:</p>
        <ul className="list-disc pl-5">
          <li>Self-declared — just you, until someone endorses it.</li>
          <li>Upskilling — credited automatically once you confirm attendance at relevant training or events.</li>
          <li>Tick (peer-endorsed) — a colleague who's worked alongside you vouches for it.</li>
          <li>Star (manager-endorsed) — a verified manager at a venue you've worked vouches for it, the highest tier.</li>
        </ul>
        <p>
          From your Profile's Endorsements section, use "Request Endorsements" to ask eligible colleagues or
          managers to back a Skill or Knowledge Bank item. Once something is already Tick, only Managers get
          asked next — a second peer endorsement can't raise it further. Once it's Star, it's maxed out and
          isn't sent out again.
        </p>
      </GuideSection>

      <GuideSection title="See who's viewed your profile">
        <p>
          Your own <Link to="/profile" className="text-accent hover:underline">Profile</Link> shows a "Who's
          Viewed Your Profile" section — a running total for the last 30 days, plus who they were where
          that's known. You'll also get a notification summing up any new views since you were last here.
        </p>
        <p>
          Turn on "Browse anonymously" (in the profile edit form) to hide your name when you view other
          people's profiles. It's a two-way trade: with it on, your own viewer list drops to a count too —
          no named viewers, since seeing who viewed you and staying anonymous yourself don't come together.
        </p>
      </GuideSection>

      <GuideSection title="Connect with people you've worked with">
        <p>
          Find colleagues via <Link to="/connections" className="text-accent hover:underline">People</Link>,
          a venue's page, or{' '}
          <Link to="/discover" className="text-accent hover:underline">Discover People</Link> (suggestions
          based on shared skills, venues, and mutual connections), and send a connection request. Once
          accepted, you'll see each other's activity, can message directly, and become eligible to endorse
          one another's skills where your work history overlaps.
        </p>
      </GuideSection>

      <GuideSection title="Follow venues and businesses">
        <p>
          Browse <Link to="/venues" className="text-accent hover:underline">Venues</Link> and{' '}
          <Link to="/businesses" className="text-accent hover:underline">Businesses</Link>, and follow (or
          favourite) the ones you care about to see their notices, job postings, and events in your Home
          feed. If nobody manages a venue or business yet, you can request to manage it from its page — once
          approved, you can post notices, jobs, and events on its behalf, and endorse the people who've
          worked there.
        </p>
      </GuideSection>

      <GuideSection title="Find jobs, events, and training">
        <p>
          <Link to="/jobs" className="text-accent hover:underline">Jobs</Link> and{' '}
          <Link to="/events" className="text-accent hover:underline">Events</Link> are filtered to your
          location by default — use the location filter on each page to widen or narrow the scope. Express
          interest in an event to be asked afterwards whether you attended; confirming attendance for
          training-related events builds your Upskilling tier automatically.
        </p>
      </GuideSection>

      <GuideSection title="Your Home feed">
        <p>
          <Link to="/home" className="text-accent hover:underline">Home</Link> brings it together: recent
          activity from your network, notices posted to your area, people worth connecting with in your
          industry, and what's coming up in jobs, events, and training near you.
        </p>
      </GuideSection>

      <GuideSection title="Messages and notifications">
        <p>
          <Link to="/messages" className="text-accent hover:underline">Messages</Link> are for direct
          conversations with your connections.{' '}
          <Link to="/notifications" className="text-accent hover:underline">Notifications</Link> tell you
          about connection requests, endorsement requests and confirmations, new profile views, comments and
          nods on your activity, and anything else that needs your attention.
        </p>
      </GuideSection>

      <GuideSection title="Feedback and reporting">
        <p>
          Something not working, or an idea for the app? Use{' '}
          <Link to="/feedback" className="text-accent hover:underline">Feedback</Link>. If you come across a
          profile, post, or comment that shouldn't be there, use the Report option on that item to flag it
          for review.
        </p>
      </GuideSection>
    </div>
  )
}

// Copy to be supplied - see conversation. Deliberately left empty rather
// than filled with placeholder text.
function DataPrivacyContent() {
  return null
}

function About() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.id === requestedTab) ? requestedTab : 'why',
  )

  function handleTabChange(id) {
    setActiveTab(id)
    setSearchParams({ tab: id }, { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <h1 className="text-2xl font-semibold text-text">About Staffie</h1>

        <div className="flex gap-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'why' && <WhyStaffieContent />}
        {activeTab === 'how-to' && <HowToUseContent />}
        {activeTab === 'privacy' && <DataPrivacyContent />}
      </div>
    </div>
  )
}

export default About
