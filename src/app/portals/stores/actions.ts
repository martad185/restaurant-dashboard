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

        // 1. Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData.user?.id;

        const masterRows = [{ restaurant_id: newStoreId, user_id: currentUserId, role: "master" }]

        const { error: masterError } = await supabase
            .from('restaurant_members')
            .insert(masterRows)

        if (masterError) return { error: `Store created, but failed to link master user: ${masterError.message}` }
          
        const memberRows = selectedUserIds.map((userId) => ({
            restaurant_id: newStoreId,
            user_id: userId,
            role: "admin",
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

export async function updateStore(
    storeId: string,
    formData: FormData,
    newUserIds: string[]
) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const plan = formData.get('plan') as string
    const slug = formData.get('slug') as string

    // 1. Update Store Details
    const { error: storeError } = await supabase
        .from('stores')
        .update({ name, plan, slug })
        .eq('id', storeId)

    if (storeError) return { error: storeError.message }

    // 2. Sync Members (The "Wipe and Replace" strategy is simplest)
    // First, remove all existing members for this store
    await supabase.from('restaurant_members').delete().eq('store_id', storeId)

    // Then, insert the new selection
    if (newUserIds.length > 0) {
        const memberRows = newUserIds.map(id => ({
            store_id: storeId,
            user_id: id
        }))
        const { error: memberError } = await supabase.from('restaurant_members').insert(memberRows)
        if (memberError) return { error: memberError.message }
    }

    revalidatePath('/portals/stores')
    return { success: true }
}