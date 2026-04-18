import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { User, Branch } from '@/lib/types'

export const userService = {
  /**
   * Obtener todos los usuarios del sistema con su sucursal
   */
  getUsers: async (): Promise<(User & { branch?: Branch })[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*, branch:branches(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Crear usuario en Auth + perfil en tabla users.
   * Requiere VITE_SUPABASE_SERVICE_KEY configurado.
   */
  createUser: async (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'vendedor',
    branchId: string | null
  ): Promise<User> => {
    if (!supabaseAdmin) {
      throw new Error('Service key no configurada. Agrega VITE_SUPABASE_SERVICE_KEY al .env')
    }

    // Crear usuario en Supabase Auth sin afectar la sesión actual
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // No requiere confirmar email
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No se pudo crear el usuario en Auth')

    // Crear perfil en tabla users (usando admin para saltear RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([{ id: authData.user.id, email, name, role, branch_id: branchId }])
      .select()
      .single()

    if (profileError) {
      // Si falla el perfil, eliminar el usuario de Auth para no dejar datos huérfanos
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return profile
  },

  /**
   * Actualizar nombre, rol y/o sucursal de un usuario
   */
  updateUser: async (
    userId: string,
    updates: { name?: string; role?: 'admin' | 'vendedor'; branch_id?: string | null }
  ): Promise<User> => {
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
   * Eliminar usuario de Auth y su perfil
   * Requiere VITE_SUPABASE_SERVICE_KEY configurado.
   */
  deleteUser: async (userId: string): Promise<void> => {
    if (!supabaseAdmin) {
      throw new Error('Service key no configurada. Agrega VITE_SUPABASE_SERVICE_KEY al .env')
    }

    // Eliminar perfil primero (FK constraint)
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (profileError) throw profileError

    // Eliminar de Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError
  },

  /**
   * Resetear contraseña de un usuario
   * Requiere VITE_SUPABASE_SERVICE_KEY configurado.
   */
  resetPassword: async (userId: string, newPassword: string): Promise<void> => {
    if (!supabaseAdmin) {
      throw new Error('Service key no configurada. Agrega VITE_SUPABASE_SERVICE_KEY al .env')
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) throw error
  },
}
