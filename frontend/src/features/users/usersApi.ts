// frontend/src/features/users/usersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '@/types'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/users',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getAllUsers: builder.query<{ users: User[]; total: number }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/',
        params,
      }),
      providesTags: ['User'],
    }),

    getUser: builder.query<User, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    blockUser: builder.mutation<User, { id: string; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/${id}/block`,
        method: 'POST',
        body: { isBlocked },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),

    makeAdmin: builder.mutation<User, { id: string; isAdmin: boolean }>({
      query: ({ id, isAdmin }) => ({
        url: `/${id}/admin`,
        method: 'POST',
        body: { isAdmin },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
  }),
})

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useBlockUserMutation,
  useMakeAdminMutation,
} = usersApi