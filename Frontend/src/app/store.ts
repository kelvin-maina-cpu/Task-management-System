import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../features/auth/authApi';
import { projectsApi } from '../features/projects/projectsApi';
import { tasksApi } from '../features/collaboration/tasksApi';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import { adminApi } from '../features/admin/adminApi';
import { guidanceApi } from '../features/guidance/guidanceApi';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [guidanceApi.reducerPath]: guidanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(projectsApi.middleware)
      .concat(tasksApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(adminApi.middleware)
      .concat(guidanceApi.middleware),
});

// Setup listeners for refetch on focus/reconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

