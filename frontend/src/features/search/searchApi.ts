// frontend/src/features/search/searchApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Inventory, Item } from '@/types'

interface SearchResponse {
  inventories: Inventory[]
  items: Item[]
}

interface TagResponse {
  name: string
  count: number
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/search',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    search: builder.query<SearchResponse, { q: string; type?: string; category?: string; tags?: string[]; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/',
        params,
      }),
    }),

    getTags: builder.query<TagResponse[], void>({
      query: () => '/tags',
    }),
  }),
})

export const { useSearchQuery, useGetTagsQuery } = searchApi