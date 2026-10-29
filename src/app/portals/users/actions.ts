

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
//import { createClient } from '@/lib/supabase/client'
import { revalidatePath } from 'next/cache'


/**Create User **/
export async function createUser(formData: FormData) {


    const supabase = await createAdminClient()


  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const username = formData.get('username') as string 

  // 1. Check if username already exists in the profiles table
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username) // case-insensitive check
        .maybeSingle()

    if (existingUser) {
        return { error: "This username is already taken. Please choose another one." }
    }

  // 2. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        username: username
      },
  })

  if (authError) return { error: authError.message }

  revalidatePath('/portals/users')
  return { success: true }
}


/**Update User **/
export async function updateUser(userId: string, formData: FormData) {

    if(!userId) {|| userId === "undefined"){
       return { error: "Invalid user ID provided." }
    }

    const supabaseAdmin = createAdminClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const password = formData.get('password') as string
    const username = (formData.get('username') as string)?.trim()

    if (!username) {
        return { error: "Username is required." }
    }

    // 1. Check if username is already taken by *another* user
    const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .neq('id', userId) // exclude the current user being edited
        .maybeSingle()

    if (existingUser) {
        return { error: "This username is already taken by another user." }
    }

    const updatePayload: { user_metadata: { username?: string; first_name: string; last_name: string }; password?: string } = {
        user_metadata: { username, first_name: firstName, last_name: lastName }
    }

    if (password && password.trim().length > 0) {
        if (password.length < 6) {
            return { error: "Password must be at least 6 characters." }
        }
        updatePayload.password = password
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updatePayload
    )

    if (authError) return { error: authError.message }

    revalidatePath('/portals/users')
    return { success: true }
}

/**Delete User **/
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