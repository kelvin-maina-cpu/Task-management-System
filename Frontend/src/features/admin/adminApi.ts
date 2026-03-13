import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'mentor';
  createdAt: string;
}

export interface PendingProject {
  _id: string;
  title: string;
  description: string;
  createdBy: { _id: string; name: string; email: string };
  status: string;
  createdAt: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/admin',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    getPendingProjects: builder.query<PendingProject[], void>({
      query: () => '/projects/pending',
      providesTags: ['Admin'],
    }),
    approveProject: builder.mutation<void, { id: string; action: 'approve' | 'reject' }>({
      query: ({ id, action }) => ({
        url: `/projects/${id}/${action}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Admin'],
    }),
    getAllUsers: builder.query<AdminUser[], void>({
      query: () => '/users',
      providesTags: ['Admin'],
    }),
    updateUserRole: builder.mutation<void, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetPendingProjectsQuery,
  useApproveProjectMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} = adminApi;

