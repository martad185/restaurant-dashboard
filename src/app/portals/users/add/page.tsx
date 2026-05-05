'use client'

import { createUser } from '../actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AddUserPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await createUser(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/portals/users')
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-12">
            <div className="max-w-2xl mx-auto">
                <Link href="/portals/users" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
                    <ChevronLeft size={20} /> Back to Users
                </Link>

                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-[#EFF6FF] p-3 rounded-2xl text-blue-600">
                            <UserPlus size={28} />
                        </div>
                        <h1 className="text-2xl font-bold">Add New User</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600">First Name</label>
                                <input name="firstName" required className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600">Last Name</label>
                                <input name="lastName" required className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Email Address</label>
                            <input name="email" type="email" required className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600">Initial Password</label>
                            <input name="password" type="password" required className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" />
                        </div>

                        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Create User Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}