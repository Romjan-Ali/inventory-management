// frontend/src/components/common/SearchBox.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchQuery } from '@/features/search/searchApi'
import { useDebounce } from 'use-debounce'
import { Search, X, Folder, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function SearchBox() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)

  const { data: searchResults, isLoading } = useSearchQuery(
    { q: debouncedQuery, type: 'all', limit: 5 },
    { skip: debouncedQuery.length < 2 }
  )

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery])

  const handleResultClick = (type: 'inventory' | 'item', id: string) => {
    if (type === 'inventory') {
      navigate(`/inventory/${id}`)
    } else {
      // For items, we might want to navigate to the item's inventory
      navigate(`/inventory/${id}`) // This would need the inventory ID
    }
    setQuery('')
    setIsOpen(false)
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {t('searchingDots')}
            </div>
          ) : searchResults ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Inventories */}
              {searchResults.inventories && searchResults.inventories.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    {t('inventoriesLabel')}
                  </div>
                  {searchResults.inventories.map((inventory) => (
                    <button
                      key={inventory.id}
                      onClick={() => handleResultClick('inventory', inventory.id)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <Folder className="h-4 w-4 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{inventory.title}</p>
                        <p className="truncate text-sm text-gray-500">
                          {inventory.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Items */}
              {searchResults.items && searchResults.items.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    {t('itemsLabel')}
                  </div>
                  {searchResults.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick('item', item.inventoryId)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4 text-green-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.customId}</p>
                        <p className="truncate text-sm text-gray-500">
                          {item.string1Value || item.text1Value || 'No description'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {(!searchResults.inventories || searchResults.inventories.length === 0) &&
               (!searchResults.items || searchResults.items.length === 0) && (
                <div className="p-4 text-center text-sm text-gray-500">
                  {t('noResultsFor', { q: debouncedQuery })}
                </div>
              )}
            </div>
          ) : debouncedQuery.length < 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {t('typeTwoChars')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}