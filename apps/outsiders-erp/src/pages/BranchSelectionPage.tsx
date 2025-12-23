import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { branchService } from '@/services/branchService'
import { Branch } from '@/lib/types'
import { MapPin, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BranchSelectionPage() {
  const navigate = useNavigate()
  const { setActiveBranch, user } = useAuth()
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      setLoading(true)
      const data = await branchService.getBranches()
      setBranches(data)
    } catch (error) {
      toast.error('Error al cargar sucursales')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch.id)
    setActiveBranch(branch)
    
    // Pequeño delay para mostrar la selección antes de navegar
    setTimeout(() => {
      navigate('/dashboard')
    }, 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando sucursales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto pt-12 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            Selecciona una Sucursal
          </h1>
          <p className="text-gray-400">
            Hola, <span className="text-accent font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Branches Grid */}
        {branches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-strong p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay sucursales disponibles
            </h3>
            <p className="text-gray-600">
              Contacta al administrador para que te asigne una sucursal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                disabled={selectedBranch === branch.id}
                className={`
                  bg-white rounded-xl p-6 text-left transition-all duration-200
                  hover:shadow-accent hover:scale-105 active:scale-95
                  ${selectedBranch === branch.id ? 'ring-4 ring-accent shadow-accent' : 'shadow-lg'}
                  disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-accent/10 rounded-lg p-3">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  {selectedBranch === branch.id ? (
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {branch.name}
                </h3>
                
                <p className="text-gray-600 text-sm flex items-start">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  {branch.address}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Logout */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  )
}
