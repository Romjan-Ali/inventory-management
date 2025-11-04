// frontend/src/components/inventory/Tabs/DiscussionTab.tsx
import type { Inventory } from '@/types'
import DiscussionThread from '../../discussion/DiscussionThread'

interface DiscussionTabProps {
  inventory: Inventory
}

export default function DiscussionTab({ inventory }: DiscussionTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Discussion</h2>
        <p className="text-muted-foreground">
          Real-time discussion for this inventory
        </p>
      </div>
      
      <DiscussionThread inventory={inventory} />
    </div>
  )
}