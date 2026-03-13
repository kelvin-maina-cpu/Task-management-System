import { Outlet, Link, useLocation } from 'react-router-dom';

export const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/projects', label: 'Projects', icon: '📁' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-white">
            DevMentor Hub
          </Link>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

