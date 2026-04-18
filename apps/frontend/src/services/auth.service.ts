import { supabase } from '../lib/supabase'
import { User } from '../lib/database.types'

function split_email(email: string): string {
  return email.split('@')[0] || ''
}

export const authService = {
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Try to get existing profile
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) throw error

    // If profile exists, return it
    if (profile) return profile

    // Auto-create profile row if it doesn't exist yet
    // (the DB trigger should create it, but this is a fallback)
    const newProfile = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || split_email(user.email!),
      role: 'user',
    }

    const { data: created, error: insertError } = await supabase
      .from('users')
      .upsert(newProfile, { onConflict: 'id' })
      .select()
      .single()

    if (insertError) throw insertError
    return created
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
