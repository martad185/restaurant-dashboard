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

export async function createStoreWithUsers(formData: FormData, selectedUserIds: string[]) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const plan = formData.get('plan') as string

    // 1. Create the Store
    const { data: store, error: storeError } = await supabase
        .from('restaurants')
        .insert([{ name, slug, plan }])
        .select('id')
        .single()

    if (storeError) return { error: storeError.message }

    const newStoreId = store.id

    // 2. Link selected users to this new store
    if (selectedUserIds.length > 0) {
        const memberRows = selectedUserIds.map((userId) => ({
            restaurant_id: newStoreId,
            user_id: userId,
        }))

        const { error: membersError } = await supabase
            .from('restaurant_members')
            .insert(memberRows)

        if (membersError) return { error: `Store created, but failed to link users: ${membersError.message}` }
    }

    revalidatePath('/portal/stores')
    revalidatePath('/portal/users')
    return { success: true }
}