'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Store, Loader2, Check, X } from 'lucide-react'
import { createStoreWithUsers } from '../actions'
import { createClient } from '@/lib/supabase/client'


interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    // This matches the joined data from our junction table check
    restaurant_members?: { store_id: string }[];
}

// Defining the props/state structure
type UserList = Profile[];

export default function AddStorePage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [availableUsers, setAvailableUsers] = useState<UserList>([])
    const [linkedUsers, setLinkedUsers] = useState<UserList>([])

    useEffect(() => {
        async function getUnassignedUsers() {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, restaurant_members(store_id)')

            if (data) {
                // If restaurant_members is an empty array, they aren't linked to any store.
                const unassigned = data.filter(
                    (profile: Profile) => !profile.restaurant_members || profile.restaurant_members.length === 0
                )
                setAvailableUsers(unassigned)
            }
        }
        getUnassignedUsers()
    }, [])

    const linkUser = (user: Profile) => {
        setLinkedUsers([...linkedUsers, user])
        setAvailableUsers(availableUsers.filter(u => u.id !== user.id))
    }

    const unlinkUser = (user: Profile) => {
        setAvailableUsers([...availableUsers, user])
        setLinkedUsers(linkedUsers.filter(u => u.id !== user.id))
    }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

      const formData = new FormData(e.currentTarget)
      const userIds = linkedUsers.map(user => user.id)
      const result = await createStoreWithUsers(formData, userIds)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/portals/stores')
    }
  }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Store className="text-blue-600" /> Store Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Store Name</label>
                            <input name="name" required className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500" placeholder="Main Street Hub" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Plan</label>
                            <select name="plan" className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white">
                                <option value="Basic">Basic</option>
                                <option value="Pro">Premium</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Linking Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Available Users */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2">
                            <UserPlus size={18} /> Available Users
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {availableUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-blue-50 transition-colors">
                                    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                    <button type="button" onClick={() => linkUser(user)} className="p-1.5 bg-white rounded-lg text-blue-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Linked Users */}
                    <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-100">
                        <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                            Linked to Store
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {linkedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl text-white">
                                    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                    <button type="button" onClick={() => unlinkUser(user)} className="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {linkedUsers.length === 0 && <p className="text-blue-200 text-sm italic">No users linked yet...</p>}
                        </div>
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'Save Store & Assignments'}
                </button>
            </form>
        </div>
    )
}