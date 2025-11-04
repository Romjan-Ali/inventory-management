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

// Custom ID Element Types
export const ID_ELEMENT_TYPES = [
  { value: 'FIXED_TEXT', label: 'Fixed Text' },
  { value: 'RANDOM_20BIT', label: 'Random 20-bit' },
  { value: 'RANDOM_32BIT', label: 'Random 32-bit' },
  { value: 'RANDOM_6DIGIT', label: 'Random 6-digit' },
  { value: 'RANDOM_9DIGIT', label: 'Random 9-digit' },
  { value: 'GUID', label: 'GUID' },
  { value: 'DATETIME', label: 'Date/Time' },
  { value: 'SEQUENCE', label: 'Sequence' },
] as const

// Date/Time Formats
export const DATETIME_FORMATS = [
  { value: 'YYYYMMDD', label: 'YYYYMMDD' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DDMMYYYY', label: 'DDMMYYYY' },
] as const

// Number Formats
export const NUMBER_FORMATS = [
  { value: '0', label: 'No padding' },
  { value: '00', label: '2 digits' },
  { value: '000', label: '3 digits' },
  { value: '0000', label: '4 digits' },
  { value: '00000', label: '5 digits' },
  { value: '000000', label: '6 digits' },
  { value: '0000000', label: '7 digits' },
  { value: '00000000', label: '8 digits' },
] as const