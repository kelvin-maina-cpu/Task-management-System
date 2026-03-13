import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { LandingPage } from '../features/landing/LandingPage';
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

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'mentor';
}

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  mentor: 2,
  user: 1,
};

// ✅ Protected route - redirects to login if not authenticated
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

// ✅ Public route - redirects to dashboard if already authenticated
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
    element: <LandingPage />, // ✅ Landing page is always accessible
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
        path: 'my-projects',
        element: <MyProjectsPage />,
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

import MyProjectsPage from '../features/projects/MyProjectsPage';  // ✅ Import


