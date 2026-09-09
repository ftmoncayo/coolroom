import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api'
import BusinessForm from '../components/business/BusinessForm'

function BusinessCreate() {
  const navigate = useNavigate()

  async function handleSubmit(data) {
    const business = await api.createBusiness(data)
    navigate(`/businesses/${business.id}`)
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-text">Create business</h1>

        <BusinessForm onSubmit={handleSubmit} submitLabel="Create business" />
      </div>
    </div>
  )
}

export default BusinessCreate
