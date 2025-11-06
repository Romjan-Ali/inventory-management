// frontend/src/features/posts/postsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/lib/constants'
import type { Post, PaginationInfo, PostsResponse } from '@/types'

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/posts`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<
      PostsResponse,
      { inventoryId: string; page?: number; limit?: number }
    >({
      query: ({ inventoryId, page = 1, limit = 50 }) => ({
        url: `/inventory/${inventoryId}`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { inventoryId }) => [
        { type: 'Post', id: `INVENTORY-${inventoryId}` },
      ],
    }),

    createPost: builder.mutation<
      Post,
      { inventoryId: string; content: string }
    >({
      query: ({ inventoryId, content }) => ({
        url: `/inventory/${inventoryId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { inventoryId }) => [
        { type: 'Post', id: `INVENTORY-${inventoryId}` },
      ],
    }),

    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
} = postsApi

// Export the types for use in components
export type { PaginationInfo, PostsResponse }