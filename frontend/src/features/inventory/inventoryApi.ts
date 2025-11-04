// frontend/src/features/inventory/inventoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Inventory,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  IdFormatElement,
  InventoryAccess
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
      { page?: number; limit?: number; search?: string; category?: string; tags?: string[]; sort?: string; }
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

    getAllPublicInventoryTags: builder.query<{ name: string; count: number }[], void>({
      query: () => '/tags/public',
      providesTags: ['Inventory'],
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

    getUserInventories: builder.query<Inventory[], void>({
      query: () => '/user/my-inventories',
      providesTags: ['Inventory'],
    }),

    getAccessList: builder.query<InventoryAccess[], string>({
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

    revokeAccess: builder.mutation<
      void,
      { inventoryId: string; userId: string }
    >({
      query: ({ inventoryId, userId }) => ({
        url: `/${inventoryId}/access/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'Inventory', id: inventoryId },
      ],
    }),

    // Custom ID Generation Endpoints
    updateCustomIdFormat: builder.mutation<
      Inventory,
      { id: string; format: IdFormatElement[] }
    >({
      query: ({ id, format }) => ({
        url: `/${id}/custom-id-format`,
        method: 'PUT',
        body: { format },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),

    generateCustomId: builder.query<{ customId: string }, string>({
      query: (inventoryId) => `/${inventoryId}/generate-custom-id`,
      // Don't cache this as it should generate a new ID each time
      providesTags: ['Inventory'],
    }),

    previewCustomId: builder.mutation<
      { preview: string },
      { format: IdFormatElement[] }
    >({
      query: ({ format }) => ({ 
        url: '/preview-custom-id',
        method: 'POST',
        body: { format },
      }),
    }),
  }),
})

export const {
  useGetInventoriesQuery,
  useGetInventoryQuery,
  useGetAllPublicInventoryTagsQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetPopularInventoriesQuery,
  useGetUserInventoriesQuery,
  useGetAccessListQuery,
  useGrantAccessMutation,
  useRevokeAccessMutation,
  // Custom ID Generation hooks
  useUpdateCustomIdFormatMutation,
  useGenerateCustomIdQuery,
  usePreviewCustomIdMutation,
} = inventoryApi