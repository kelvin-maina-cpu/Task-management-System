
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log('Base API URL:', BASE_URL);

// Create base query with token handling
const baseQueryFn = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    console.log('API Token:', token ? 'Present' : 'Missing');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Export default base query
export const baseQuery = baseQueryFn;

// Base query with token refresh capability
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryFn(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    console.log('Token expired/invalid, attempting refresh...');
    
    // Try to refresh the token - IMPORTANT: include credentials (cookies) for refresh to work
    const refreshResult = await baseQueryFn(
      { 
        url: '/auth/refresh', 
        method: 'POST',
        credentials: 'include'  // This ensures cookies are sent with the refresh request
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      
      // Update token in Redux store
      api.dispatch({ type: 'auth/setToken', payload: accessToken });
      localStorage.setItem('accessToken', accessToken);
      
      console.log('Token refreshed successfully, retrying original request...');
      
      // Retry the original request with new token
      result = await baseQueryFn(args, api, extraOptions);
    } else {
      console.log('Token refresh failed, logging out user...');
      // Refresh failed, logout the user
      api.dispatch({ type: 'auth/logout' });
      localStorage.removeItem('accessToken');
    }
  }

  return result;
};

