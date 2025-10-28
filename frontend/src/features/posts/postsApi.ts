import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Post } from '@/types'

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/posts',
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
      { posts: Post[]; pagination: any },
      { inventoryId: string; page?: number; limit?: number }
    >({
      query: ({ inventoryId, page = 1, limit = 50 }) => ({
        url: `/inventory/${inventoryId}`,
        params: { page, limit },
      }),
      providesTags: (result, error, { inventoryId }) => [
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
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'Post', id: `INVENTORY-${inventoryId}` },
      ],
    }),

    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
} = postsApi
