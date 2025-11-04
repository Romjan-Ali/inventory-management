// frontend/src/components/inventory/Tabs/SettingsTab.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import FieldManager from '../FieldManager/FieldManager'
import CustomIdManager from '../CustomId/CustomIdManager'
import AccessManager from '../AccessManager/AccessManager'
import { Key, Users, Sliders } from 'lucide-react'

interface SettingsTabProps {
  inventory: Inventory
}

type SettingsSection = 'fields' | 'customId' | 'access'

export default function SettingsTab({ inventory }: SettingsTabProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('fields')

  const sections = [
    { id: 'fields' as const, name: 'Custom Fields', icon: Sliders },
    { id: 'customId' as const, name: 'Custom ID Format', icon: Key },
    { id: 'access' as const, name: 'Access Management', icon: Users },
  ]

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'fields':
        return <FieldManager inventory={inventory} />
      case 'customId':
        return <CustomIdManager inventory={inventory} />
      case 'access':
        return <AccessManager inventory={inventory} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Configure inventory settings, custom fields, and access control.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="py-6">
        {renderSectionContent()}
      </div>
    </div>
  )
}