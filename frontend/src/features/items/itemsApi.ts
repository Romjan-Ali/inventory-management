// frontend/src/features/items/itemsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Item, CreateItemRequest } from '@/types'

export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/items',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    getInventoryItems: builder.query<{ items: Item[]; total: number }, { inventoryId: string; page?: number; limit?: number }>({
      query: ({ inventoryId, page = 1, limit = 50 }) => ({
        url: `/inventory/${inventoryId}/items`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { inventoryId }) => [
        { type: 'Item', id: `INVENTORY-${inventoryId}` },
      ],
    }),

    getItem: builder.query<Item, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Item', id }],
    }),

    createItem: builder.mutation<Item, CreateItemRequest>({
      query: (itemData) => ({
        url: `/inventory/${itemData.inventoryId}/items`,
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: (_result, _error, { inventoryId }) => [
        { type: 'Item', id: `INVENTORY-${inventoryId}` },
      ],
    }),

    updateItem: builder.mutation<Item, { id: string; data: Partial<Item> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Item', id }],
    }),

    deleteItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Item', id }],
    }),

    likeItem: builder.mutation<{ liked: boolean; likeCount: number }, string>({
      query: (id) => ({
        url: `/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Item', id }],
    }),
  }),
})

export const {
  useGetInventoryItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useLikeItemMutation,
} = itemsApi