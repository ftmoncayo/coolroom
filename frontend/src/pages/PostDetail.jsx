import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import PostItem from '../components/PostItem'

function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .fetchPost(id)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    await api.deletePost(id)
    setPost(null)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Post</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        {post ? (
          <PostItem post={post} canDelete={Boolean(user?.isAdmin)} onDelete={handleDelete} />
        ) : (
          !error && <p className="text-sm text-text-faint">This post no longer exists.</p>
        )}
      </div>
    </div>
  )
}

export default PostDetail
