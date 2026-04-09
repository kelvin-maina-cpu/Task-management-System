import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { LandingPage } from '../features/landing/LandingPage';
import { BeginnerGuidePage } from '../features/beginner/BeginnerGuidePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupPage } from '../features/auth/pages/SignupPage';
import { ProjectSuggestions } from '../features/projects/ProjectSuggestions';
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage';
import { TechnologyRecommendation } from '../features/projects/TechnologyRecommendation';
import { KanbanBoard } from '../features/collaboration/KanbanBoard';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AdminLayout } from '../features/admin/AdminLayout';
import { ProjectApproval } from '../features/admin/ProjectApproval';
import { MainLayout } from '../components/layout/MainLayout';
import { ProjectWorkspace } from '../features/guidance/ProjectWorkspace';
import { EditProjectPage } from '../features/projects/EditProjectPage';
import MyProjectsPage from '../features/projects/MyProjectsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'mentor';
}

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  mentor: 2,
  user: 1,
};

export const ProtectedRoute = ({ children, requiredRole = 'user' }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user) {
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;

    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/beginner',
    element: <BeginnerGuidePage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'projects/suggestions',
        element: <ProjectSuggestions />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: 'projects/:projectId/technologies',
        element: <TechnologyRecommendation />,
      },
      {
        path: 'projects/:projectId/collaboration',
        element: <KanbanBoard />,
      },
      {
        path: 'projects/:projectId/workspace',
        element: <ProjectWorkspace />,
      },
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: <MyProjectsPage />,
          },
          {
            path: ':id',
            element: <ProjectDetailPage />,
          },
          {
            path: ':id/edit',
            element: <EditProjectPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="mentor">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <ProjectApproval />,
      },
      {
        path: 'projects',
        element: <ProjectApproval />,
      },
    ],
  },
]);
