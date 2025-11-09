// frontend/src/types/filter.ts
export interface FilterState {
  search: string
  category: string
  isPublic: string
  tags: string[]
  sort: string
}

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Book', label: 'Book' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Other', label: 'Other' },
]

export const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Public' },
  { value: 'false', label: 'Private' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'items', label: 'Most Items' },
  { value: 'title', label: 'Title A-Z' },
]

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'all',
  isPublic: 'all',
  tags: [],
  sort: 'newest',
}