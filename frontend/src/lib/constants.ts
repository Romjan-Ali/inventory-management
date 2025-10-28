// frontend/src/lib/constants.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const CATEGORIES = [
  'Equipment',
  'Furniture',
  'Book',
  'Electronics',
  'Tools',
  'Other',
] as const

export const FIELD_TYPES = [
  { value: 'string', label: 'Single Line Text' },
  { value: 'text', label: 'Multi-line Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'True/False' },
  { value: 'link', label: 'Document/Image Link' },
] as const