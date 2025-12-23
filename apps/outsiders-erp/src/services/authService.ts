import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'

export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   */
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Obtener usuario actual de la sesión
   */
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Obtener perfil completo del usuario
   */
  getUserProfile: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crear perfil de usuario
   */
  createUserProfile: async (userData: Omit<User, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar perfil de usuario
   */
  updateUserProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Registrar nuevo usuario
   */
  signUp: async (email: string, password: string, name: string, role: 'admin' | 'vendedor' = 'vendedor') => {
    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No se pudo crear el usuario')

    // Crear perfil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name,
        role,
        branch_id: null,
      }])
      .select()
      .single()

    if (profileError) throw profileError

    return { user: authData.user, profile }
  },

  /**
   * Cambiar contraseña
   */
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  /**
   * Solicitar recuperación de contraseña
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  },
}
