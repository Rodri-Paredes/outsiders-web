import { useState } from 'react'
import { Image as ImageIcon, Star, Layout, Grid3X3, LayoutGrid } from 'lucide-react'

import HomeEditor from '@/components/cms/HomeEditor'
import BannersEditor from '@/components/cms/BannersEditor'
import FeaturedProductsEditor from '@/components/cms/FeaturedProductsEditor'
import SectionsEditor from '@/components/cms/SectionsEditor'
import CategoriesEditor from '@/components/cms/CategoriesEditor'

type TabId = 'banner' | 'best_sellers' | 'categories' | 'sections' | 'hero'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  description: string
}

const tabs: Tab[] = [
  {
    id: 'banner',
    label: 'Banner',
    icon: ImageIcon,
    description: 'Imagen y texto del hero principal',
  },
  {
    id: 'best_sellers',
    label: 'Best Sellers',
    icon: Star,
    description: 'Productos destacados en el home',
  },
  {
    id: 'categories',
    label: 'Categorías',
    icon: LayoutGrid,
    description: 'Tarjetas de categorías del home (imagen, título, link)',
  },
  {
    id: 'sections',
    label: 'Secciones',
    icon: Grid3X3,
    description: 'Secciones dinámicas del home',
  },
  {
    id: 'hero',
    label: 'Textos Hero',
    icon: Layout,
    description: 'Título, subtítulo e imágenes del slider',
  },
]

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('banner')
  const currentTab = tabs.find(t => t.id === activeTab)!

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personalización de la Tienda</h1>
        <p className="text-sm text-gray-500 mt-1">
          Controla el contenido visual del e-commerce sin tocar código. Los cambios se reflejan en ~60 segundos.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Bar */}
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="CMS Tabs">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2.5 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200
                    ${isActive
                      ? 'border-black text-black bg-gray-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/30'
                    }
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          <p className="text-xs text-gray-500 font-medium">{currentTab.description}</p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'banner' && <BannersEditor />}
          {activeTab === 'categories' && <CategoriesEditor />}
          {activeTab === 'best_sellers' && <FeaturedProductsEditor />}
          {activeTab === 'sections' && <SectionsEditor />}
          {activeTab === 'hero' && <HomeEditor />}
        </div>
      </div>
    </div>
  )
}
