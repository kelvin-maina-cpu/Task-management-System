import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo?: { _id: string; name: string; email: string };
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/tasks',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasksByProject: builder.query<Task[], string>({
      query: (projectId) => `/project/${projectId}`,
      providesTags: (result) =>
        result?.map(({ _id }) => ({ type: 'Task', id: _id })) || ['Task'],
    }),
    getTaskById: builder.query<Task, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (newTask) => ({
        url: '/',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<Task, { id: string; updates: Partial<Task> }>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Task', id }],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksByProjectQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;

