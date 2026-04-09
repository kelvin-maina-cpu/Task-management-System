import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';

const navItems = [
  {
    path: '/dashboard',
    label: 'Learning Dashboard',
    shortLabel: 'Dashboard',
    accent: 'from-amber-300 to-orange-500',
  },
  {
    path: '/projects/suggestions',
    label: 'Project Studio',
    shortLabel: 'Projects',
    accent: 'from-orange-400 to-rose-500',
  },
];

export const MainLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logout());
    }
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_55%,_#0b1120_100%)] text-white">
      <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/80 px-5 py-6 backdrop-blur-xl">
        <Link to="/" className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-500 to-rose-500 text-sm font-black text-slate-950">
              DH
            </span>
            <div>
              <h1 className="text-lg font-semibold">Developer Hub</h1>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Guide + Lab</p>
            </div>
          </div>
        </Link>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
          <p className="mt-3 text-lg font-semibold text-white">{user?.name || 'Developer'}</p>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
        </div>

        <nav className="mt-6 space-y-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group block rounded-[24px] border px-4 py-4 transition ${
                  active
                    ? 'border-orange-300/30 bg-white/[0.08] shadow-lg shadow-slate-950/30'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-sm font-black text-slate-950`}>
                    {item.shortLabel.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">
                      {item.path === '/dashboard' ? 'Track growth and progress' : 'Explore stacks and project ideas'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(244,63,94,0.08),rgba(15,23,42,0.8))] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Current mission</p>
          <h2 className="mt-3 text-lg font-semibold">Learn fundamentals, then ship with modern frameworks.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use the dashboard for direction and the project studio to turn ideas into web and app builds.
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <Link
            to="/"
            className="block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]"
          >
            Back to homepage
          </Link>
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
