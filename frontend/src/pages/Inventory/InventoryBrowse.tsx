// frontend/src/pages/Inventory/InventoryBrowse.tsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useGetInventoriesQuery } from '@/features/inventory/inventoryApi'
import { useGetAllPublicInventoryTagsQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import InventoryTable from '@/components/inventory/View/InventoryTable'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Grid, List, X } from 'lucide-react'
import InventoryCards from '@/components/inventory/View/InventoryCards'
import { useDebounce } from 'use-debounce'

export default function InventoryBrowse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewType, setViewType] = useState<'table' | 'card'>('table')
  const [localSearch, setLocalSearch] = useState('')
  const [debouncedSearch] = useDebounce(localSearch, 500)

  // Get URL params with defaults
  const sort = searchParams.get('sort') || 'newest'
  const category = searchParams.get('category') || ''
  const tag = searchParams.get('tag') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')


  // Fetch inventories with filters
  const { data: inventoriesData, isLoading } = useGetInventoriesQuery(
    {
      search: debouncedSearch,
      sort,
      category,
      tags: tag ? [tag] : undefined,
      page,
      limit,
    },
    { refetchOnMountOrArgChange: true }
  )

  const { data: tagsData } = useGetAllPublicInventoryTagsQuery()

  // Update URL params
  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    newParams.set('page', '1') // Reset to page 1 when filters change
    setSearchParams(newParams)
  }

  useEffect(() => {
    updateSearchParams({ search: debouncedSearch })
  }, [debouncedSearch])

  const handleSortChange = (value: string) => {
    updateSearchParams({ sort: value })
  }

  const handleTagClick = (tagName: string) => {
    updateSearchParams({ tag: tagName })
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
    setLocalSearch('')
  }

  // const categories = ['Book', 'Electronics', 'Furniture', 'Clothing', 'Other']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Inventories</h1>
          <p className="text-muted-foreground">
            Discover and explore public inventories
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard">My Dashboard</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find inventories by name, description, or tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventories..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="items">Most Items</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={viewType === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('card')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(debouncedSearch || tag) && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {debouncedSearch && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{debouncedSearch}"
                  <button
                    onClick={() => {
                      setLocalSearch('')
                      updateSearchParams({ search: '' })
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {tag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {tag}
                  <button
                    onClick={() => updateSearchParams({ tag: '' })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Tag Cloud */}
          {tagsData && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Popular Tags</div>
              <div className="flex flex-wrap gap-2">
                {tagsData.slice(0, 15).map((tagItem) => (
                  <Badge
                    key={tagItem.name}
                    variant={tag === tagItem.name ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleTagClick(tagItem.name)}
                  >
                    {tagItem.name}
                    <span className="ml-1 text-xs opacity-70">
                      ({tagItem.count})
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>{inventoriesData?.total || 0} Inventories Found</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {viewType === 'table' ? (
                <InventoryTable
                  inventories={inventoriesData?.inventories || []}
                />
              ) : (
                // Your card view component here
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InventoryCards
                    inventories={inventoriesData?.inventories || []}
                  />
                </div>
              )}

              {/* Pagination */}
              {inventoriesData && inventoriesData.total > limit && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() =>
                        updateSearchParams({ page: (page - 1).toString() })
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page * limit >= inventoriesData.total}
                      onClick={() =>
                        updateSearchParams({ page: (page + 1).toString() })
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
