// frontend/src/features/inventory/inventoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Inventory,
  CreateInventoryRequest,
  UpdateInventoryRequest,
} from '@/types'

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/inventories',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Inventory'],
  endpoints: (builder) => ({
    getInventories: builder.query<
      { inventories: Inventory[]; total: number },
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    getInventory: builder.query<Inventory, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    createInventory: builder.mutation<Inventory, CreateInventoryRequest>({
      query: (inventoryData) => ({
        url: '/',
        method: 'POST',
        body: inventoryData,
      }),
      invalidatesTags: ['Inventory'],
    }),

    updateInventory: builder.mutation<
      Inventory,
      { id: string; data: UpdateInventoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),

    deleteInventory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),

    getPopularInventories: builder.query<Inventory[], number | void>({
      query: (limit = 5) => `/popular?limit=${limit}`,
    }),

    getAccessList: builder.query<any[], string>({
      query: (id) => `/${id}/access`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    grantAccess: builder.mutation<
      void,
      { inventoryId: string; userId: string; canWrite: boolean }
    >({
      query: ({ inventoryId, userId, canWrite }) => ({
        url: `/${inventoryId}/access`,
        method: 'POST',
        body: { userId, canWrite },
      }),
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'Inventory', id: inventoryId },
      ],
    }),

    revokeAccess: builder.mutation<void, { inventoryId: string; userId: string }>({
      query: ({ inventoryId, userId }) => ({
        url: `/${inventoryId}/access/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'Inventory', id: inventoryId },
      ],
    }),
  }),
})

export const {
  useGetInventoriesQuery,
  useGetInventoryQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetPopularInventoriesQuery,
  useGetAccessListQuery,
  useGrantAccessMutation,
  useRevokeAccessMutation,
} = inventoryApi
