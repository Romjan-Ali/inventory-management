import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, EyeOff, Users, Package, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Inventory } from '@/types'
import { useTranslation } from 'react-i18next'

interface InventoryTableProps {
  inventories: Inventory[]
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventories }) => {
  const { t, i18n } = useTranslation()
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.resolvedLanguage || 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="border-b">{t('inventory')}</TableHead>
          <TableHead className="border-b">{t('category')}</TableHead>
          <TableHead className="border-b">{t('tags')}</TableHead>
          <TableHead className="border-b">{t('items')}</TableHead>
          <TableHead className="border-b">{t('visibility')}</TableHead>
          <TableHead className="border-b">{t('creator')}</TableHead>
          <TableHead className="border-b">{t('lastUpdated')}</TableHead>
          <TableHead className="border-b">{t('version')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventories.map((inventory) => (
          <Link
            key={inventory.id}
            to={`/inventory/${inventory.id}`}
            className="contents no-underline hover:no-underline"
          >
            <TableRow className="group hover:bg-primary/10 transition-colors duration-200 border-b">
              <TableCell className="py-4">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0">
                    {inventory.imageUrl ? (
                      <img
                        src={inventory.imageUrl}
                        alt={inventory.title}
                        className="w-10 h-10 rounded-md object-cover border"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove(
                            'hidden'
                          )
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center border ${
                        inventory.imageUrl ? 'hidden' : ''
                      }`}
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <div className="font-medium text-sm group-hover:text-blue-600 transition-colors truncate">
                      {inventory.title}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 wrap-break-word whitespace-normal">
                      {inventory.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="text-xs">
                  {inventory.category}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-wrap gap-1 max-w-[150px]">
                  {inventory.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {inventory.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{inventory.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{inventory._count?.items}</span>
                  {inventory._count?.accesses && inventory._count?.accesses > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {inventory._count?.accesses}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                {inventory.isPublic ? (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Eye className="h-3 w-3" />
                    {t('public')}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <EyeOff className="h-3 w-3" />
                    {t('private')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={inventory.creator?.avatar}
                      alt={inventory.creator?.name}
                    />
                    <AvatarFallback className="text-xs">
                      {inventory.creator?.name && getInitials(inventory.creator?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{inventory.creator?.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <span className="text-sm text-muted-foreground">
                  {formatDate(inventory.updatedAt)}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="font-mono text-xs">
                  v{inventory.version}
                </Badge>
              </TableCell>
            </TableRow>
          </Link>
        ))}
      </TableBody>
    </Table>
  )
}

export default InventoryTable
