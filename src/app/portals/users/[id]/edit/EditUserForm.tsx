'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser } from '../../actions'
import { Loader2, Save } from 'lucide-react'

export interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
}

interface EditUserFormProps {
    profile: UserProfile;
}

export default function EditUserForm({ profile }: EditUserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateUser(profile.id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/portals/users')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">First Name</label>
          <input 
            name="firstName" 
            defaultValue={profile.first_name ?? ''} 
            required 
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Last Name</label>
          <input 
            name="lastName" 
            defaultValue={profile.last_name ?? ''} 
            required 
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" 
          />
        </div>
      </div>

      <div className="space-y-2 opacity-60">
        <label className="text-sm font-semibold text-gray-600">Email (Read Only)</label>
        <input 
          value={profile.email} 
          disabled 
          className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-not-allowed" 
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button 
        disabled={loading}
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
      </button>
    </form>
  )
}