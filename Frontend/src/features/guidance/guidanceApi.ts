import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/baseQuery';

// Types
export interface CodeBlock {
  language: string;
  code: string;
}

export interface AIResponse {
  answer: string;
  suggestedCode: CodeBlock[];
  confidence: number;
}

export interface ProgressAnalysis {
  progressAssessment: number;
  milestoneContext: string;
  completedMilestones: number;
  remainingMilestones: number;
  nextSteps: Array<{
    title: string;
    description: string;
    estimatedHours: number;
  }>;
  insights: {
    summary: string;
    warnings: string[];
    recommendations: string[];
  };
  codeReview: unknown;
  resources: unknown[];
  pitfalls: string[];
}

export interface CodeReview {
  score: number;
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  refactoredCode?: string;
}

export interface MentorScore {
  totalScore: number;
  breakdown: {
    techStack: number;
    domain: number;
    difficulty: number;
    availability: number;
    rating: number;
    pastSuccess: number;
  };
  techOverlap: Array<{ name: string; matched: boolean }>;
}

export interface Mentor {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  title?: string;
  expertise: string[];
  domains: string[];
  averageRating: number;
  totalReviews: number;
  completedMentorships: number;
  avgResponseTime: string;
  isTopRated: boolean;
  availability?: Record<string, Array<{ start: string; end: string }>>;
  maxDifficulty?: string;
}

export interface MentorMatch {
  mentor: Mentor;
  score: MentorScore;
}

export interface Session {
  _id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  topics: string[];
  status: string;
  meetingLink?: string;
  recordingUrl?: string;
  notes?: string;
  actionItems: Array<{
    title: string;
    completed: boolean;
    deadline?: string;
  }>;
}

export interface Mentorship {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  mentor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    title?: string;
    expertise?: string[];
  };
  project: {
    _id: string;
    title: string;
    domain: string;
    difficulty: string;
  };
  matchScore: number;
  status: string;
  goals: Array<{
    title: string;
    description: string;
    milestone?: number;
    completed: boolean;
  }>;
  sessions: Session[];
  startDate?: string;
  endDate?: string;
}

export interface LearningPath {
  prerequisites: Array<{
    topic: string;
    estimatedHours: number;
  }>;
  checkpoints: Array<{
    milestone: string;
    checkpoint: string;
    criteria: string[];
    estimatedHours: number;
  }>;
  skillGaps: Array<{
    skill: string;
    exercises: string[];
  }>;
}

export interface GuidanceSession {
  _id: string;
  type: string;
  query: string;
  response: string;
  timestamp: string;
}

// API Definition
export const guidanceApi = createApi({
  reducerPath: 'guidanceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Guidance', 'Mentorship'],
  endpoints: (builder) => ({
    // AI Assistance
    sendAIMessage: builder.mutation<AIResponse, { projectId: string; query: string; currentFile?: string }>({
      query: ({ projectId, query, currentFile }) => ({
        url: '/guidance/ai-assist',
        method: 'POST',
        body: { projectId, query, currentFile },
      }),
    }),

    // Progress Analysis (using mutation since it requires POST)
    analyzeProgress: builder.mutation<ProgressAnalysis, { projectId: string; code?: string; errorLog?: string }>({
      query: ({ projectId, code, errorLog }) => ({
        url: '/guidance/analyze-progress',
        method: 'POST',
        body: { projectId, code, errorLog },
      }),
      invalidatesTags: ['Guidance'],
    }),

    // Code Review
    reviewCode: builder.mutation<CodeReview, { projectId: string; code: string; language?: string; milestoneId?: string }>({
      query: ({ projectId, code, language, milestoneId }) => ({
        url: '/guidance/code-review',
        method: 'POST',
        body: { projectId, code, language, milestoneId },
      }),
      invalidatesTags: ['Guidance'],
    }),

    // Architecture Recommendation
    getArchitectureRecommendation: builder.mutation<unknown, { projectId?: string; context?: unknown; constraints?: string[] }>({
      query: ({ projectId, context, constraints }) => ({
        url: '/guidance/architecture',
        method: 'POST',
        body: { projectId, context, constraints },
      }),
    }),

    // Learning Path
    getLearningPath: builder.query<LearningPath, string>({
      query: (projectId) => `/guidance/learning-path/${projectId}`,
      providesTags: ['Guidance'],
    }),

    // Mentor Matching
    getMentorMatches: builder.query<MentorMatch[], string>({
      query: (projectId) => `/guidance/mentor-matches/${projectId}`,
      providesTags: ['Mentorship'],
    }),

    requestMentor: builder.mutation<{ success: boolean; message: string; mentorship: unknown }, { projectId: string; mentorId: string }>({
      query: ({ projectId, mentorId }) => ({
        url: '/guidance/request-mentor',
        method: 'POST',
        body: { projectId, mentorId },
      }),
      invalidatesTags: ['Mentorship'],
    }),

    acceptMentor: builder.mutation<unknown, string>({
      query: (mentorshipId) => ({
        url: '/guidance/accept-mentor',
        method: 'POST',
        body: { mentorshipId },
      }),
      invalidatesTags: ['Mentorship'],
    }),

    // Mentorships
    getMyMentorships: builder.query<Mentorship[], void>({
      query: () => '/guidance/mentorships',
      providesTags: ['Mentorship'],
    }),

    // Sessions
    scheduleSession: builder.mutation<unknown, { mentorshipId: string; sessionDetails: unknown }>({
      query: ({ mentorshipId, sessionDetails }) => ({
        url: '/guidance/schedule-session',
        method: 'POST',
        body: { mentorshipId, sessionDetails },
      }),
      invalidatesTags: ['Mentorship'],
    }),

    completeSession: builder.mutation<unknown, { mentorshipId: string; sessionIndex: number; notes?: string; actionItems?: unknown[] }>({
      query: ({ mentorshipId, sessionIndex, notes, actionItems }) => ({
        url: '/guidance/complete-session',
        method: 'POST',
        body: { mentorshipId, sessionIndex, notes, actionItems },
      }),
      invalidatesTags: ['Mentorship'],
    }),

    // Feedback
    submitFeedback: builder.mutation<unknown, { mentorshipId: string; rating: number; review?: string; wouldRecommend?: boolean }>({
      query: ({ mentorshipId, rating, review, wouldRecommend }) => ({
        url: '/guidance/feedback',
        method: 'POST',
        body: { mentorshipId, rating, review, wouldRecommend },
      }),
      invalidatesTags: ['Mentorship'],
    }),

    // Chat History
    getChatHistory: builder.query<GuidanceSession[], { projectId: string; type?: string; limit?: number }>({
      query: ({ projectId, type, limit = 20 }) => ({
        url: `/guidance/chat-history/${projectId}`,
        params: { type, limit },
      }),
      providesTags: ['Guidance'],
    }),
  }),
});

// Export hooks
export const {
  useSendAIMessageMutation,
  useAnalyzeProgressMutation,
  useReviewCodeMutation,
  useGetArchitectureRecommendationMutation,
  useGetLearningPathQuery,
  useGetMentorMatchesQuery,
  useRequestMentorMutation,
  useAcceptMentorMutation,
  useGetMyMentorshipsQuery,
  useScheduleSessionMutation,
  useCompleteSessionMutation,
  useSubmitFeedbackMutation,
  useGetChatHistoryQuery,
} = guidanceApi;

