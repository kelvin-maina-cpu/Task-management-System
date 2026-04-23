import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { logout, setToken } from '../features/auth/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const isDev = import.meta.env.DEV;

if (isDev) {
  console.log('Base API URL:', BASE_URL);
}

const isRefreshRequest = (args: unknown) =>
  typeof args === 'object' &&
  args !== null &&
  'url' in args &&
  typeof (args as { url?: unknown }).url === 'string' &&
  (args as { url: string }).url.includes('/auth/refresh');

const shouldAttemptRefresh = (args: unknown, token: string | null) => {
  if (!token || isRefreshRequest(args)) {
    return false;
  }

  if (typeof args === 'string') {
    return !args.includes('/auth/login') && !args.includes('/auth/register');
  }

  if (typeof args === 'object' && args !== null && 'url' in args) {
    const url = String((args as { url?: unknown }).url || '');
    return !url.includes('/auth/login') && !url.includes('/auth/register');
  }

  return true;
};

// Create base query with token handling
const baseQueryFn = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Export default base query
export const baseQuery = baseQueryFn;

// Base query with token refresh capability + deduplication
let refreshPromise: Promise<any> | null = null;

export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const token = (api.getState() as RootState).auth.token;
  let result = await baseQueryFn(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && (result.error.status === 401 || result.error.status === 403) && shouldAttemptRefresh(args, token)) {
    if (isDev) {
      console.log('Token expired or invalid, attempting refresh...');
    }
    
    if (refreshPromise) {
      await refreshPromise;
      // Retry original request after refresh completes
      result = await baseQueryFn(args, api, extraOptions);
      return result;
    }
    
    refreshPromise = (async () => {
      try {
        return await baseQueryFn(
          {
            url: '/auth/refresh',
            method: 'POST',
            credentials: 'include',
          },
          api,
          extraOptions
        );
      } finally {
        refreshPromise = null;
      }
    })();

    const refreshResult = await refreshPromise;

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      
      // Update token in Redux store
      api.dispatch(setToken(accessToken));
      localStorage.setItem('accessToken', accessToken);
      
      if (isDev) {
        console.log('Token refreshed successfully, retrying original request...');
      }
      
      // Retry the original request with new token
      result = await baseQueryFn(args, api, extraOptions);
    } else {
      // Refresh failed, logout the user
      api.dispatch(logout());
      localStorage.removeItem('accessToken');
    }
  }

  return result;
};


