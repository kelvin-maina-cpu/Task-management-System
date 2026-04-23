import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../authApi';
import { setCredentials } from '../authSlice';
import { ThemeToggle } from '../../../components/ThemeToggle';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.accessToken }));
      navigate('/dashboard');
    } catch (err: unknown) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="theme-page flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="theme-surface rounded-[28px] border p-8 backdrop-blur-md">
          <div className="mb-6 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="mb-8 text-center">
            <Link to="/" className="text-3xl font-bold">
              Developer Hub
            </Link>
            <h2 className="mt-4 text-2xl font-semibold">Welcome Back</h2>
            <p className="theme-muted mt-2">Sign in to continue your learning path and project lab work.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="theme-muted mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="theme-input w-full rounded-2xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="theme-muted mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="theme-input w-full rounded-2xl border px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="theme-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-orange-300 hover:text-orange-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
