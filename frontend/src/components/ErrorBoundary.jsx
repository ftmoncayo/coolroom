import { Component } from 'react'

// Without this, an uncaught render error anywhere in a routed page (like the
// null-profile crash that took out PersonCard) unmounts the ENTIRE app,
// including TopNav - the whole screen goes blank with no way to navigate
// away. This scopes the blast radius to "this page failed to load" and
// resets itself on the next route change, so the rest of the app (and
// getting to a different page) keeps working.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error rendering page:', error, info)
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg px-4 py-10">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-danger">Something went wrong loading this page.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
