'use client'

import { createClient } from '@/lib/supabase/client' // Adjust path to your client config
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()

        if (!error) {
            // Refresh to clear any server-side sessions and redirect
            router.push('/login')
            router.refresh()
        } else {
            console.error('Error logging out:', error.message)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
            Logout
        </button>
    )
}