// frontend/src/components/inventory/Tabs/DiscussionTab.tsx
import type { Inventory } from '@/types'
import DiscussionThread from '../../discussion/DiscussionThread'
import { useTranslation } from 'react-i18next'

interface DiscussionTabProps {
  inventory: Inventory
}

export default function DiscussionTab({ inventory }: DiscussionTabProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('discussionHeader')}</h2>
        <p className="text-muted-foreground">
          {t('discussionSubtitle')}
        </p>
      </div>
      
      <DiscussionThread inventory={inventory} />
    </div>
  )
}