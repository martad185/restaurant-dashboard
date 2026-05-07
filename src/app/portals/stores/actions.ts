'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteStore(storeId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', storeId)

  if (error) return { error: error.message }

  revalidatePath('/portals/stores')
  return { success: true }
}