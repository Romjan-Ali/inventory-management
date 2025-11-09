// frontend/src/components/inventory/InventoryFilters.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type FilterState, CATEGORY_OPTIONS, VISIBILITY_OPTIONS, SORT_OPTIONS } from '@/types/filter'

interface InventoryFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
}

export default function InventoryFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: InventoryFiltersProps) {
  const { t } = useTranslation()
  const [localSearch, setLocalSearch] = useState(filters.search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearch, filters, onFiltersChange])

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value } as FilterState)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    handleFilterChange('tags', newTags)
  }

  const handleSortChange = (value: string) => {
    handleFilterChange('sort', value)
  }

  const getSortDisplayValue = () => {
    const sortOption = SORT_OPTIONS.find(opt => opt.value === filters.sort)
    return sortOption ? sortOption.label : 'Sort by'
  }

  const hasActiveFilters = 
    filters.search || 
    filters.category !== 'all' || 
    filters.isPublic !== 'all' || 
    filters.tags.length > 0

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchWithinInventories')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>{getSortDisplayValue()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Visibility Filter */}
        <Select value={filters.isPublic} onValueChange={(value) => handleFilterChange('isPublic', value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('activeFilters')}:
          </span>
          
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('searchLabel')}: "{filters.search}"
              <button
                onClick={() => {
                  setLocalSearch('')
                  handleFilterChange('search', '')
                }}
                className="ml-1 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.category !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('categoryLabel')}: {filters.category}
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.isPublic !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('visibilityLabel')}: {filters.isPublic ? 'Public' : 'Private'}
              <button
                onClick={() => handleFilterChange('isPublic', 'all')}
                className="ml-1 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </Badge>
          )}

          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {t('tagLabel')}: {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            {t('clearAll')}
          </Button>
        </div>
      )}
    </div>
  )
}