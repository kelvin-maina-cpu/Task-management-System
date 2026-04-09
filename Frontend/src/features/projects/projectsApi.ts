import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';

export interface ProjectFilters {
  difficulty?: string;
  stack?: string;
  domain?: string;
  search?: string;
}

export interface Technology {
  name: string;
  version?: string;
  purpose?: string;
}

export interface TechStack {
  name: string;
  category?: string;
  whenToChoose?: string;
  pros?: string[];
  cons?: string[];
  technologies?: Technology[];
  architecture?: {
    pattern?: string;
    description?: string;
  };
}

export interface Requirement {
  asA: string;
  iWant: string;
  soThat: string;
  priority: string;
}

export interface NonFunctionalRequirement {
  category: string;
  requirement: string;
  metric?: string;
}

export interface EntityField {
  name: string;
  type: string;
  description?: string;
}

export interface EntityRelationship {
  type: string;
  with: string;
}

export interface DatabaseEntity {
  name: string;
  fields?: EntityField[];
  relationships?: EntityRelationship[];
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description?: string;
}

export interface ResourceLink {
  title: string;
  url: string;
}

export interface Milestone {
  id?: string | number;
  order?: number;
  title: string;
  description: string;
  estimatedHours?: number;
  deliverables?: string[];
  learningOutcomes?: string[];
  resources?: ResourceLink[];
}

export interface Enrollment {
  user: string | { _id?: string; name?: string };
  status?: string;
  completedMilestones: Array<string | number>;
  chosenStack?: TechStack;
}

export interface StarterCodeVariable {
  name: string;
  required?: boolean;
  description?: string;
}

export interface StarterCode {
  setupInstructions?: string;
  environmentVariables?: StarterCodeVariable[];
}

export interface ProjectMember {
  user: {
    _id?: string;
    name?: string;
  };
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  domain?: string;
  estimatedDuration?: string;
  teamSize?: string;
  tags?: string[];
  techStack?: string[];
  members?: ProjectMember[];
  suggestedStacks?: TechStack[];
  requirements?: {
    functional?: Requirement[];
    nonFunctional?: NonFunctionalRequirement[];
  };
  learningOutcomes?: string[];
  realWorldUse?: string;
  starterCode?: StarterCode;
  databaseSchema?: {
    entities?: DatabaseEntity[];
  };
  apiEndpoints?: ApiEndpoint[];
  milestones?: Milestone[];
  createdBy?: {
    _id?: string;
    name?: string;
  };
  enrolledUsers?: Enrollment[];
  enrollment?: Enrollment;
  completionCount?: number;
  averageRating?: number;
  ratings?: Array<{
    user?: string;
    rating: number;
    review?: string;
  }>;
  isCreated?: boolean;
}

export interface AllMyProjectsResponse {
  success: boolean;
  count: number;
  data: Project[];
}

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'UserProject'],
  endpoints: (builder) => ({
    getProjectSuggestions: builder.query<Project[], ProjectFilters | void>({
      query: (filters) => ({
        url: '/projects/suggestions',
        params: (filters ?? {}) as Record<string, unknown>,
      }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as Project[];
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (Array.isArray(data)) return data as Project[];
        }
        return [];
      },
      providesTags: ['Project'],
    }),

    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: unknown) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as Record<string, unknown>).data as Project;
        }
        return response as Project;
      },
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),

    getMyProjects: builder.query<Project[], void>({
      query: () => '/projects/my-projects',
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as Project[];
        if (response && typeof response === 'object' && 'data' in response) {
          return ((response as Record<string, unknown>).data as Project[]) ?? [];
        }
        return [];
      },
      providesTags: ['UserProject'],
    }),

    getAllMyProjects: builder.query<AllMyProjectsResponse, void>({
      query: () => '/projects/all-my-projects',
      transformResponse: (response: unknown) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response as AllMyProjectsResponse;
        }
        return { success: false, count: 0, data: [] };
      },
      providesTags: ['UserProject'],
    }),

    enrollInProject: builder.mutation<
      { success: boolean; message: string; enrollment: Enrollment },
      { projectId: string; chosenStack: Partial<TechStack> & { name: string } }
    >({
      query: ({ projectId, chosenStack }) => ({
        url: `/projects/${projectId}/enroll`,
        method: 'POST',
        body: { chosenStack },
      }),
      invalidatesTags: ['UserProject'],
    }),

    updateMilestone: builder.mutation<
      { success: boolean; enrollment: Enrollment },
      { projectId: string; milestoneId: number; status: string }
    >({
      query: ({ projectId, milestoneId, status }) => ({
        url: `/projects/${projectId}/milestones/${milestoneId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['UserProject'],
    }),

    rateProject: builder.mutation<
      { success: boolean; averageRating: number; totalRatings: number },
      { projectId: string; rating: number; review?: string; completed?: boolean }
    >({
      query: ({ projectId, rating, review, completed }) => ({
        url: `/projects/${projectId}/rate`,
        method: 'POST',
        body: { rating, review, completed },
      }),
      invalidatesTags: ['Project'],
    }),

    getProjects: builder.query<Project[], void>({
      query: () => '/',
      providesTags: ['Project'],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (newProject) => ({
        url: '/',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: ['Project', 'UserProject'],
    }),

    updateProject: builder.mutation<Project, { id: string; updates: Partial<Project> }>({
      query: ({ id, updates }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Project', id }],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'UserProject'],
    }),
  }),
});

export const {
  useGetProjectSuggestionsQuery,
  useGetProjectByIdQuery,
  useGetMyProjectsQuery,
  useGetAllMyProjectsQuery,
  useEnrollInProjectMutation,
  useUpdateMilestoneMutation,
  useRateProjectMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
