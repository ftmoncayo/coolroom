import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/home" replace />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
      <h1 className="text-4xl font-semibold text-text">Coolroom</h1>
      <p className="text-xl text-text-muted">A network built for hospitality.</p>
      <p className="max-w-xl text-text-muted">
        Build a real profile, connect with people you've actually worked with, and get recognized for
        your skills by the people who've seen them firsthand. Find venues, businesses, jobs, and
        training relevant to where you work.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent-hover"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="rounded border border-border-strong px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover"
        >
          Sign Up
        </Link>
      </div>
      <Link to="/about" className="text-sm text-text-muted hover:text-accent hover:underline">
        About Coolroom
      </Link>
    </div>
  )
}

export default Home
