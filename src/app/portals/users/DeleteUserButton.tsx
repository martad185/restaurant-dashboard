'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteUser } from './actions'

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        const confirmDelete = confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)

        if (confirmDelete) {
            setIsDeleting(true)
            const result = await deleteUser(userId)
            if (result?.error) {
                alert(`Error: ${result.error}`)
                setIsDeleting(false)
            }
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            title="Delete User"
        >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    )
}