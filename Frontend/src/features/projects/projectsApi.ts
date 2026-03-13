import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';

// Milestone Schema Types
export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  estimatedHours?: number;
  learningOutcomes?: string[];
  deliverables?: string[];
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'documentation' | 'github';
  }[];
}

// Tech Stack Schema Types
export interface TechStack {
  name: string;
  category?: 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'mobile' | 'ai';
  technologies?: {
    name: string;
    version?: string;
    purpose?: string;
    alternatives?: string[];
  }[];
  architecture?: {
    pattern?: string;
    diagram?: string;
    description?: string;
  };
  pros?: string[];
  cons?: string[];
  whenToChoose?: string;
}

// Requirement Types
export interface FunctionalRequirement {
  asA: string;
  iWant: string;
  soThat: string;
  priority: 'Must Have' | 'Should Have' | 'Could Have';
}

export interface NonFunctionalRequirement {
  category: string;
  requirement: string;
  metric: string;
}

// Database Schema Types
export interface EntityField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface EntityRelationship {
  with: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface DatabaseEntity {
  name: string;
  fields: EntityField[];
  relationships?: EntityRelationship[];
}

// API Endpoint Types
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestBody?: Record<string, unknown>;
  response?: Record<string, unknown>;
  authRequired?: boolean;
}

// Enrollment Types
export interface Enrollment {
  user: string;
  enrolledAt: string;
  currentMilestone: number;
  completedMilestones: number[];
  chosenStack?: TechStack;
  repositoryUrl?: string;
  deployedUrl?: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'abandoned';
}

// Rating Types
export interface Rating {
  user: string;
  rating: number;
  review?: string;
  completed?: boolean;
}

// Main Project Type
export interface Project {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  status: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  domain?: 'Web' | 'Mobile' | 'AI' | 'DevOps' | 'Blockchain' | 'IoT' | 'Data Science' | 'Other';
  tags?: string[];
  isTemplate?: boolean;
  isActive?: boolean;
  estimatedDuration?: string;
  teamSize?: string;
  
  // Detailed Requirements
  requirements?: {
    functional?: FunctionalRequirement[];
    nonFunctional?: NonFunctionalRequirement[];
  };
  
  // Technical Architecture
  databaseSchema?: {
    entities?: DatabaseEntity[];
    erDiagram?: string;
  };
  apiEndpoints?: ApiEndpoint[];
  
  // UI/UX
  wireframes?: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
  
  // Implementation Guide
  milestones?: Milestone[];
  
  // Stack Suggestions
  suggestedStacks?: TechStack[];
  
  // Resources
  starterCode?: {
    repositoryUrl?: string;
    setupInstructions?: string;
    environmentVariables?: {
      name: string;
      description: string;
      required?: boolean;
    }[];
  };
  
  // Legacy fields for backward compatibility
  techStack?: string[];
  learningOutcomes?: string[];
  realWorldUse?: string;
  
  // User Progress Tracking
  enrolledUsers?: Enrollment[];
  
  // Metadata
  members?: Array<{ user: { _id: string; name: string; email: string }; role: string }>;
  createdBy?: { _id: string; name: string; email: string };
  mentors?: string[];
  
  // Ratings
  ratings?: Rating[];
  averageRating?: number;
  completionCount?: number;
  
  // Enrollment data (populated for user's projects)
  enrollment?: Enrollment;
  
  // Legacy fields
  visibility?: 'private' | 'team' | 'public';
  progress?: number;
  tasksCount?: { total: number; completed: number };
  aiGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Filter Types
export interface ProjectFilters {
  difficulty?: string;
  stack?: string;
  domain?: string;
  status?: string;
}

// API Definition
export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'UserProject'],
  endpoints: (builder) => ({
    // Get project suggestions (templates)
    getProjectSuggestions: builder.query<Project[], ProjectFilters>({
      query: (filters = {}) => ({
        url: '/projects/suggestions',
        params: filters as Record<string, unknown>,
      }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as Record<string, unknown>).data;
          if (Array.isArray(data)) return data;
        }
        return [];
      },
      providesTags: ['Project'],
    }),

    // Get single project detail
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: unknown) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as Record<string, unknown>).data as Project;
        }
        return response as Project;
      },
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    // Get user's enrolled projects
    getMyProjects: builder.query<Project[], void>({
      query: () => '/projects/my-projects',
      transformResponse: (response: unknown) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as Record<string, unknown>).data as Project[];
        }
        return [];
      },
      providesTags: ['UserProject'],
    }),

    // Get ALL user projects (created + enrolled)
    getAllMyProjects: builder.query<{ success: boolean; count: number; data: Project[] }, void>({
      query: () => '/all-my-projects',
      transformResponse: (response: unknown) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response as { success: boolean; count: number; data: Project[] };
        }
        return { success: false, count: 0, data: [] };
      },
      providesTags: ['UserProject'],
    }),

    // Enroll in a project
    enrollInProject: builder.mutation<{ success: boolean; message: string; enrollment: Enrollment }, { projectId: string; chosenStack: TechStack }>({
      query: ({ projectId, chosenStack }) => ({
        url: `/projects/${projectId}/enroll`,
        method: 'POST',
        body: { chosenStack },
      }),
      invalidatesTags: ['UserProject'],
    }),

    // Update milestone
    updateMilestone: builder.mutation<{ success: boolean; enrollment: Enrollment }, { projectId: string; milestoneId: number; status: string }>({
      query: ({ projectId, milestoneId, status }) => ({
        url: `/projects/${projectId}/milestones/${milestoneId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['UserProject'],
    }),

    // Rate project
    rateProject: builder.mutation<{ success: boolean; averageRating: number; totalRatings: number }, { projectId: string; rating: number; review?: string; completed?: boolean }>({
      query: ({ projectId, rating, review, completed }) => ({
        url: `/projects/${projectId}/rate`,
        method: 'POST',
        body: { rating, review, completed },
      }),
      invalidatesTags: ['Project'],
    }),

    // CRUD for user projects
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
        url: `/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'UserProject'],
    }),
  }),
});

// Single export statement
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

