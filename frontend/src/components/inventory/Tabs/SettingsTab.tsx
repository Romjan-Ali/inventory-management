// frontend/src/components/inventory/Tabs/SettingsTab.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import FieldManager from '../FieldManager/FieldManager'
import CustomIdManager from '../CustomId/CustomIdManager'
import AccessManager from '../AccessManager/AccessManager'
import { Key, Users, Sliders } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ApiTokenManager from '../ApiTokenManager'

interface SettingsTabProps {
  inventory: Inventory
}

type SettingsSection = 'fields' | 'customId' | 'access' | 'api'

export default function SettingsTab({ inventory }: SettingsTabProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<SettingsSection>('fields')

  const sections = [
    { id: 'fields' as const, nameKey: 'settingsFields', icon: Sliders },
    { id: 'customId' as const, nameKey: 'settingsCustomId', icon: Key },
    { id: 'access' as const, nameKey: 'settingsAccess', icon: Users },
    { id: 'api' as const, nameKey: 'settingsApi', icon: Key },
  ]

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'fields':
        return <FieldManager inventory={inventory} />
      case 'customId':
        return <CustomIdManager inventory={inventory} />
      case 'access':
        return <AccessManager inventory={inventory} />
      case 'api':
        return <ApiTokenManager inventory={inventory} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('settingsHeader')}</h2>
        <p className="text-muted-foreground">
          {t('settingsSubtitle')}
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
                {t(section.nameKey)}
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