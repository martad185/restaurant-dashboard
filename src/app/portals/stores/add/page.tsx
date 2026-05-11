'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Store, Loader2, Check, X, Search, ChevronDown } from 'lucide-react'
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
    const [searchTerm, setSearchTerm] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filteredUsers = availableUsers.filter(user =>
        `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        async function getUnassignedUsers() {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email')

            if (data) {
                // If restaurant_members is an empty array, they aren't linked to any store.
                /*const unassigned = data.filter(
                    (profile: Profile) => !profile.restaurant_members || profile.restaurant_members.length === 0
                )*/
                setAvailableUsers(data)
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
                {/* }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Available Users 
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

                    {/* Linked Users 
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
                */}


                {/* User Selection Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <UserPlus className="text-blue-600" size={20} /> Assign Users to Store
                    </h2>

                    <div className="relative" ref={dropdownRef}>
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Search Unassigned Users</label>

                        {/* Search Input / Trigger */}
                        <div
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2 w-full p-3.5 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 transition-all cursor-text bg-gray-50/50"
                        >
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="bg-transparent outline-none w-full text-sm"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setIsOpen(true)
                                }}
                            />
                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in duration-150">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                linkUser(user)
                                                setSearchTerm('')
                                                setIsOpen(false)
                                            }}
                                            className="flex items-center justify-between w-full p-3 hover:bg-blue-50 rounded-xl transition-colors group text-left"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <Check size={16} className="text-blue-600 opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-gray-500 text-center">No unassigned users found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Linked Users "Pills" (The 'Possibility to Unlink' part) */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {linkedUsers.map(user => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 bg-blue-600 text-white pl-4 pr-2 py-2 rounded-full text-sm font-medium animate-in slide-in-from-top-1"
                            >
                                <span>{user.first_name} {user.last_name}</span>
                                <button
                                    type="button"
                                    onClick={() => unlinkUser(user)}
                                    className="hover:bg-blue-500 p-1 rounded-full transition-colors"
                                    title="Unlink User"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {linkedUsers.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No users selected for this store yet.</p>
                        )}
                    </div>
                </div>



                <button disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'Save Store & Assignments'}
                </button>
            </form>
        </div>
    )
}