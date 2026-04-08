import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import api from '../api'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await api.patch('/auth/profile', { firstName, lastName })
      updateUser(res.data)
      setMessage('Profile updated successfully.')
    } catch (error: unknown) {
      console.error('Failed to update profile', error)
      let errorMsg = 'Failed to update profile.'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const responseData = (error as { response: { data?: { error?: string } } }).response?.data
        errorMsg = responseData?.error || errorMsg
      } else if (error instanceof Error) {
        errorMsg = error.message
      }
      
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Profile
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="card-elevated p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-heading font-semibold text-text-primary mb-6">
          Personal Information
        </h2>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field w-full"
                placeholder="e.g. Aiden"
              />
              <p className="text-xs text-text-muted mt-2">
                This is how the AI assistant will address you.
              </p>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Username
            </label>
            <input
              type="text"
              value={user?.username || ''}
              className="input-field w-full opacity-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-text-muted mt-2">
              Username cannot be changed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-field w-full opacity-50 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || (firstName === (user?.firstName || '') && lastName === (user?.lastName || ''))}
              className="glass-button-primary px-8 py-2.5 rounded-lg disabled:opacity-50 transition-all font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
