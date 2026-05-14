import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { User, Branch } from '@/lib/types'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  activeBranch: Branch | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setActiveBranch: (branch: Branch) => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeBranch: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (authError) throw authError

          if (!authData.user) {
            throw new Error('No se pudo obtener el usuario')
          }

          // Obtener perfil del usuario
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (profileError) throw profileError

          // Solo admin y vendedor pueden acceder al ERP
          if (profile.role === 'user') {
            await supabase.auth.signOut()
            throw new Error('No tienes permisos para acceder al sistema ERP')
          }

          set({
            user: profile,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Sesión iniciada correctamente')
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false })
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
          toast.error(message)
          throw error
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })
          
          const { error } = await supabase.auth.signOut()
          
          // "Auth session missing" significa que la sesión ya expiró/fue invalidada.
          // En ese caso limpiamos el estado local igualmente.
          if (error && !error.message.includes('session')) throw error

          set({
            user: null,
            activeBranch: null,
            isAuthenticated: false,
            isLoading: false,
          })

          toast.success('Sesión cerrada correctamente')
        } catch (error) {
          set({ isLoading: false })
          const message = error instanceof Error ? error.message : 'Error al cerrar sesión'
          toast.error(message)
          throw error
        }
      },

      loadUser: async () => {
        try {
          set({ isLoading: true })

          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            set({ isLoading: false, isAuthenticated: false })
            return
          }

          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) throw error

          // Solo admin y vendedor pueden acceder al ERP
          if (profile.role === 'user') {
            await supabase.auth.signOut()
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }

          set({
            user: profile,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setActiveBranch: (branch: Branch) => {
        set({ activeBranch: branch })
        toast.success(`Sucursal ${branch.name} seleccionada`)
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const isAuth = !!session
        set({ isAuthenticated: isAuth })
        return isAuth
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        // activeBranch NO se persiste: si la sucursal fue modificada/eliminada en DB
        // el ERP redirigiría a BranchSelectionPage y cargaría el estado fresco.
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
