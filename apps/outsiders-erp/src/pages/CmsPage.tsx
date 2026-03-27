import { useState } from 'react'
import { Layout, Image as ImageIcon, Star } from 'lucide-react'

// Placeholder components for the tabs
import HomeEditor from '@/components/cms/HomeEditor'
import BannersEditor from '@/components/cms/BannersEditor'
import FeaturedProductsEditor from '@/components/cms/FeaturedProductsEditor'

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'banners' | 'featured'>('home')

  const tabs = [
    { id: 'home', label: 'Home Editor', icon: Layout },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'featured', label: 'Featured Products', icon: Star },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Web</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona el contenido visual de la tienda pública</p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base flex items-center justify-center gap-2
                  ${activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'home' && <HomeEditor />}
          {activeTab === 'banners' && <BannersEditor />}
          {activeTab === 'featured' && <FeaturedProductsEditor />}
        </div>
      </div>
    </div>
  )
}
