'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteStore } from './actions'

export default function DeleteStoreButton({ storeId, storeName }: { storeId: string, storeName: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm(`Delete ${storeName}? This will disconnect any users currently assigned to this store.`)) {
      setLoading(true)
      const result = await deleteStore(storeId)
      if (result?.error) {
        alert(result.error)
        setLoading(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}