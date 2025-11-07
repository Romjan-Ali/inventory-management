// frontend/src/types/index.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  isAdmin: boolean
  isBlocked: boolean
  createdAt: string
}

export interface Inventory {
  id: string
  title: string
  description: string
  imageUrl?: string
  isPublic: boolean
  category: string
  tags: string[]
  version: number
  creatorId: string
  customIdFormat?: CustomIdFormat

  // Custom field configurations
  string1Name?: string
  string1Description?: string
  string1Visible: boolean
  string1Order: number
  string2Name?: string
  string2Description?: string
  string2Visible: boolean
  string2Order: number
  string3Name?: string
  string3Description?: string
  string3Visible: boolean
  string3Order: number

  text1Name?: string
  text1Description?: string
  text1Visible: boolean
  text1Order: number
  text2Name?: string
  text2Description?: string
  text2Visible: boolean
  text2Order: number
  text3Name?: string
  text3Description?: string
  text3Visible: boolean
  text3Order: number

  number1Name?: string
  number1Description?: string
  number1Visible: boolean
  number1Order: number
  number2Name?: string
  number2Description?: string
  number2Visible: boolean
  number2Order: number
  number3Name?: string
  number3Description?: string
  number3Visible: boolean
  number3Order: number

  boolean1Name?: string
  boolean1Description?: string
  boolean1Visible: boolean
  boolean1Order: number
  boolean2Name?: string
  boolean2Description?: string
  boolean2Visible: boolean
  boolean2Order: number
  boolean3Name?: string
  boolean3Description?: string
  boolean3Visible: boolean
  boolean3Order: number

  link1Name?: string
  link1Description?: string
  link1Visible: boolean
  link1Order: number
  link2Name?: string
  link2Description?: string
  link2Visible: boolean
  link2Order: number
  link3Name?: string
  link3Description?: string
  link3Visible: boolean
  link3Order: number

  creator?: {
    id: string
    name: string
    avatar?: string
  }
  _count?: {
    items: number
    accesses: number
  }
  canWrite?: boolean

  createdAt: string
  updatedAt: string
}

export interface Paginaiton {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  startIndex: number
  endIndex: number
}

export interface Item {
  id: string
  customId: string
  version: number
  inventoryId: string
  creatorId: string

  // Custom field values
  string1Value?: string
  string2Value?: string
  string3Value?: string
  text1Value?: string
  text2Value?: string
  text3Value?: string
  number1Value?: number
  number2Value?: number
  number3Value?: number
  boolean1Value?: boolean
  boolean2Value?: boolean
  boolean3Value?: boolean
  link1Value?: string
  link2Value?: string
  link3Value?: string

  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  content: string
  inventoryId: string
  userId: string
  inventory: Inventory
  user: User
  createdAt: Date
}

// Custom ID Format Types
export type IdElementType =
  | 'FIXED_TEXT'
  | 'RANDOM_20BIT'
  | 'RANDOM_32BIT'
  | 'RANDOM_6DIGIT'
  | 'RANDOM_9DIGIT'
  | 'GUID'
  | 'DATETIME'
  | 'SEQUENCE'

export interface IdFormatElement {
  id: string // For React keys
  type: IdElementType
  value?: string
  format?: string
}

export type CustomIdFormat = IdFormatElement[]

// Request/Response DTOs
export interface CreateInventoryRequest {
  title: string
  description: string
  imageUrl?: string
  category: string
  tags: string[]
  isPublic: boolean
}

export interface UpdateInventoryRequest {
  title?: string
  description?: string
  imageUrl?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
  version: number
}

export interface CreateItemRequest {
  customId: string
  inventoryId: string

  // Custom field values
  string1Value?: string
  string2Value?: string
  string3Value?: string
  text1Value?: string
  text2Value?: string
  text3Value?: string
  number1Value?: number
  number2Value?: number
  number3Value?: number
  boolean1Value?: boolean
  boolean2Value?: boolean
  boolean3Value?: boolean
  link1Value?: string
  link2Value?: string
  link3Value?: string
}

// Field configuration types
export type FieldType = 'string' | 'text' | 'number' | 'boolean' | 'link'

export interface FieldConfig {
  type: FieldType
  index: number
  name: string
  description: string
  visibleInTable: boolean
  order: number
}

export interface InventoryAccess {
  id: string
  userId: string
  inventoryId: string
  canWrite: boolean
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface WebSocketMessage {
  id: string
  content: string
  inventoryId: string
  userId: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PostsResponse {
  posts: Post[]
  pagination: PaginationInfo
}
