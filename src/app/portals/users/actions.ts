

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
//import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {

  /*  //1. check if the user is an admin and authorized to create users
    const supabaseClient = await createClient()
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) {
        return { error: "Failed to authenticate user" }
    }
    // Check if user has admin role in your DB before proceeding
    if (!user || user.email !== 'helpdesk@slowey.ie') {
        return { error: "Unauthorized" }
    }*/

    const supabase = await createAdminClient()


  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      },
  })

  if (authError) return { error: authError.message }

  revalidatePath('/portals/users')
  return { success: true }
}

export async function updateUser(userId: string, formData: FormData) {
    const supabaseAdmin = createAdminClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { first_name: firstName, last_name: lastName } }
    )

    if (authError) return { error: authError.message }

    revalidatePath('/portals/users')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Delete Error:', error.message)
        return { error: error.message }
    }

    revalidatePath('/portals/users')
    return { success: true }
}