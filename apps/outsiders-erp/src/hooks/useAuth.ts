import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const {
    user,
    activeBranch,
    isLoading,
    isAuthenticated,
    login,
    logout,
    loadUser,
    setActiveBranch,
    checkAuth,
  } = useAuthStore()

  const isAdmin = user?.role === 'admin'
  const isVendedor = user?.role === 'vendedor'

  return {
    user,
    activeBranch,
    isLoading,
    isAuthenticated,
    isAdmin,
    isVendedor,
    login,
    logout,
    loadUser,
    setActiveBranch,
    checkAuth,
  }
}
