import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

// Layout
import Layout from '@/components/layout/Layout'

// Pages
import LoginPage from '@/pages/LoginPage'
import BranchSelectionPage from '@/pages/BranchSelectionPage'

// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then(m => ({ default: m.ProductsPage })))
const SalesPage = lazy(() => import('@/pages/SalesPage').then(m => ({ default: m.SalesPage })))
const StockPage = lazy(() => import('@/pages/StockPage').then(m => ({ default: m.StockPage })))
const CashPage = lazy(() => import('@/pages/CashPage').then(m => ({ default: m.CashPage })))
const DropsPage = lazy(() => import('@/pages/DropsPage').then(m => ({ default: m.DropsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadUser, isLoading } = useAuth()

  useEffect(() => {
    loadUser()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Branch Required Route
function BranchRequiredRoute({ children }: { children: React.ReactNode }) {
  const { activeBranch } = useAuth()

  if (!activeBranch) {
    return <Navigate to="/branch-selection" replace />
  }

  return <>{children}</>
}

function App() {
  const { loadUser } = useAuth()

  // Cargar sesión al iniciar la aplicación
  useEffect(() => {
    loadUser()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/branch-selection"
            element={
              <ProtectedRoute>
                <BranchSelectionPage />
              </ProtectedRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <BranchRequiredRoute>
                  <Layout />
                </BranchRequiredRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="cash" element={<CashPage />} />
            <Route path="drops" element={<DropsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#FF6B35',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
