import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';

export interface DashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    tasksDueSoon: number;
  };
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    completionRate: number;
    highPriority: number;
    distribution: {
      todo: number;
      inProgress: number;
      completed: number;
    };
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    memberCount: number;
    taskCount: number;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    project: string;
    assignee: string;
    updatedAt: string;
    priority: string;
  }>;
  dueSoon: Array<{
    id: string;
    title: string;
    deadline: string;
    project: string;
    priority: string;
    daysLeft: number;
  }>;
  teamPerformance: Array<{
    userId: string;
    name: string;
    email: string;
    completedTasks: number;
  }>;
  taskDistribution: Array<{
    month: string;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  project: string;
  user: string;
  avatar?: string;
  timestamp: string;
  status: string;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard', 'Activity'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getRecentActivity: builder.query<{ activities: ActivityItem[]; pagination: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/dashboard/activity?page=${page}&limit=${limit}`,
      providesTags: ['Activity'],
    }),
    refreshDashboard: builder.mutation<void, void>({
      queryFn: async () => ({ data: undefined }),
      invalidatesTags: ['Dashboard', 'Activity'],
    }),
    getInitialData: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => ({
        url: '/dashboard/initial-data',
        params: projectId ? { projectId } : undefined
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery,
  useRefreshDashboardMutation,
  useGetInitialDataQuery,
} = dashboardApi;

