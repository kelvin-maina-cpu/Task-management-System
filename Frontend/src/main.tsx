import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { setCredentials } from './features/auth/authSlice';
import { useGetCurrentUserQuery } from './features/auth/authApi';
import Loader from './components/Loader';
import './index.css';
import './styles/loader.css';

// Component to initialize auth state when page loads
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  const { data: user, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    // If we have a token but no user in state, try to fetch user
    if (token && user) {
      const state = store.getState();
      if (!state.auth.user) {
        store.dispatch(setCredentials({ user, token }));
      }
    }
  }, [token, user]);

  // Show loading only if we're actually trying to fetch user
  if (!token) {
    return <>{children}</>;
  }

  if (isLoading && !user) {
    return <Loader fullscreen label="Restoring session" />;
  }

  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
        <RouterProvider router={router} />
      </AuthInitializer>
    </Provider>
  </StrictMode>
);
