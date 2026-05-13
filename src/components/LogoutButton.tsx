'use client'

import { createClient } from '@/lib/supabase/client' // Adjust path to your client config
import { LogOut } from 'lucide-react'
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
            className="text-gray-600 hover:text-red-500 flex items-center gap-2">
            <LogOut size={18} />
            Logout
        </button>
    )
}