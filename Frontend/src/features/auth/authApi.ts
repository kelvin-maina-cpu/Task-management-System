import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'mentor';
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => 'auth/me',
      providesTags: ['User'],
    }),

  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetCurrentUserQuery,
} = authApi;

