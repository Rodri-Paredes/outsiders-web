import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Menu, User, LogOut, MapPin, ChevronDown } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const { user, activeBranch, logout, isAdmin } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleChangeBranch = () => {
    navigate('/branch-selection')
    setShowDropdown(false)
  }

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-2xl font-black tracking-tight">
            OUTSIDERS
          </h1>
        </div>

        {/* Center: Branch */}
        {activeBranch && (
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="font-medium">{activeBranch.name}</span>
          </div>
        )}

        {/* Right: User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
            </div>
            
            <div className="bg-accent rounded-full p-2">
              <User className="h-4 w-4" />
            </div>
            
            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <Fragment>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-strong py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>

                {isAdmin && (
                  <button
                    onClick={handleChangeBranch}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Cambiar Sucursal</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </Fragment>
          )}
        </div>
      </div>

      {/* Mobile Branch */}
      {activeBranch && (
        <div className="md:hidden px-4 pb-2 flex items-center space-x-2 text-xs border-t border-white/10 pt-2">
          <MapPin className="h-3 w-3 text-accent" />
          <span>{activeBranch.name}</span>
        </div>
      )}
    </header>
  )
}
