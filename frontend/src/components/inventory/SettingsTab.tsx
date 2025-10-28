// frontend/src/components/inventory/SettingsTab.tsx
import type { Inventory } from '@/types'
import FieldManager from './FieldManager/FieldManager'

interface SettingsTabProps {
  inventory: Inventory
}

export default function SettingsTab({ inventory }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Configure inventory settings and custom fields
        </p>
      </div>
      
      <FieldManager inventory={inventory} />
    </div>
  )
}