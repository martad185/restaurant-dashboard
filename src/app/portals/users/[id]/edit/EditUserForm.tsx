'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser } from '../../actions'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'

export interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    password: string | null;
}

interface EditUserFormProps {
    profile: UserProfile;
}

export default function EditUserForm({ profile }: EditUserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
      setLoading(true)
      setError(null)
    
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

       <div className="space-y-2 opacity-60">
              <label className="text-sm font-semibold text-gray-600 flex justify-between">
                  <span>Password</span>
                  <span className="text-xs text-gray-400 font-normal">Leave blank to keep unchanged</span>
              </label>
              <div className="relative">
                  <input
                      name="password"
                      //value={profile.password ?? ''}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      minLength={6}
                      className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
              </div>
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