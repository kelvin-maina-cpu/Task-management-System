import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from './dashboardApi';
import { useThemeMode } from '../../theme/ThemeProvider';

const StatCard = ({
  title,
  value,
  trend,
  icon,
  alert,
}: {
  title: string;
  value: number | string;
  trend?: string;
  icon: React.ReactNode;
  alert?: boolean;
}) => (
  <div className={`theme-card rounded-xl border p-6 ${alert ? 'border-red-500/50' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="theme-soft text-sm">{title}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
        {trend && <p className={`mt-2 text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trend} from last month</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${alert ? 'bg-red-600/20 text-red-400' : 'bg-purple-600/20 text-purple-400'}`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="theme-page flex h-64 items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
  </div>
);

const ErrorMessage = ({ error }: { error: unknown }) => (
  <div className="theme-page p-8">
    <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
      <p>Error loading dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  </div>
);

const TaskDistributionChart = ({
  data,
  theme,
}: {
  data: { todo: number; inProgress: number; completed: number };
  theme: 'dark' | 'light';
}) => {
  const chartData = [
    { name: 'To Do', value: data.todo, color: '#6B7280' },
    { name: 'In Progress', value: data.inProgress, color: '#8B5CF6' },
    { name: 'Completed', value: data.completed, color: '#10B981' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#1F2937' : '#fff7ed',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#fdba74'}`,
          }}
          labelStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const MonthlyTrendChart = ({
  data,
  theme,
}: {
  data: Array<{ month: string; count: number }>;
  theme: 'dark' | 'light';
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#cbd5e1'} />
      <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#64748b'} />
      <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#64748b'} />
      <Tooltip
        contentStyle={{
          backgroundColor: theme === 'dark' ? '#1F2937' : '#fff7ed',
          border: `1px solid ${theme === 'dark' ? '#374151' : '#fdba74'}`,
        }}
        labelStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
      />
      <Legend />
      <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} name="Completed Tasks" />
    </LineChart>
  </ResponsiveContainer>
);

const ProjectList = ({
  projects,
}: {
  projects: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    memberCount: number;
    taskCount: number;
  }>;
}) => (
  <div className="theme-card rounded-xl border p-6">
    <h3 className="mb-4 text-lg font-semibold">Projects</h3>
    <div className="space-y-4">
      {projects.length === 0 ? (
        <p className="theme-muted">No projects found</p>
      ) : (
        projects.slice(0, 5).map((project) => (
          <div key={project.id} className="theme-subcard flex items-center justify-between rounded-lg border p-3">
            <div>
              <h4 className="font-medium">{project.title}</h4>
              <span className={`text-xs ${
                project.status === 'active' ? 'text-green-400' : project.status === 'completed' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {project.status} • {project.taskCount} tasks
              </span>
            </div>
            <div className="text-right">
              <p className="font-medium">{project.progress}%</p>
              <div className="theme-progress-track mt-1 h-2 w-24 rounded-full">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const ActivityFeed = ({
  activities,
}: {
  activities: Array<{
    id: string;
    description: string;
    project: string;
    user: string;
    timestamp: string;
    status: string;
  }>;
}) => (
  <div className="theme-card mt-6 rounded-xl border p-6">
    <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="theme-muted">No recent activity</p>
      ) : (
        activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`mt-2 h-2 w-2 rounded-full ${activity.status === 'completed' ? 'bg-green-400' : 'bg-purple-400'}`}></div>
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="theme-soft text-xs">
                {activity.project} • {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const DueSoonList = ({
  tasks,
}: {
  tasks: Array<{
    id: string;
    title: string;
    deadline: string;
    project: string;
    priority: string;
    daysLeft: number;
  }>;
}) => (
  <div className="theme-card rounded-xl border p-6">
    <h3 className="mb-4 text-lg font-semibold">Due Soon</h3>
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="theme-muted">No tasks due soon</p>
      ) : (
        tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="theme-subcard flex items-center justify-between rounded-lg border p-3">
            <div>
              <h4 className="text-sm font-medium">{task.title}</h4>
              <p className="theme-soft text-xs">{task.project}</p>
            </div>
            <div className="text-right">
              <span
                className={`rounded px-2 py-1 text-xs ${
                  task.priority === 'urgent'
                    ? 'bg-red-500/20 text-red-400'
                    : task.priority === 'high'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {task.priority}
              </span>
              <p className={`mt-1 text-xs ${task.daysLeft <= 1 ? 'text-red-400' : 'theme-soft'}`}>{task.daysLeft} days left</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const TeamPerformance = ({
  data,
}: {
  data: Array<{
    userId: string;
    name: string;
    email: string;
    completedTasks: number;
  }>;
}) => (
  <div className="theme-card rounded-xl border p-6">
    <h3 className="mb-4 text-lg font-semibold">Team Performance</h3>
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="theme-muted">No team data available</p>
      ) : (
        data.map((member, index) => (
          <div key={member.userId} className="theme-subcard flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-medium text-white">{index + 1}</div>
              <div>
                <h4 className="font-medium">{member.name}</h4>
                <p className="theme-soft text-xs">{member.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{member.completedTasks}</p>
              <p className="theme-soft text-xs">tasks completed</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const DashboardPage = () => {
  const { theme } = useThemeMode();
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery();
  const { data: activityData } = useGetRecentActivityQuery({ page: 1, limit: 10 });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!stats) return null;

  const distributionData = stats.taskStats?.distribution || { todo: 0, inProgress: 0, completed: 0 };
  const trendData =
    stats.monthlyTrend?.length > 0
      ? stats.monthlyTrend
      : [
          { month: '2024-01', count: 0 },
          { month: '2024-02', count: 0 },
          { month: '2024-03', count: 0 },
          { month: '2024-04', count: 0 },
          { month: '2024-05', count: 0 },
          { month: '2024-06', count: 0 },
        ];

  return (
    <div className="theme-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Projects"
            value={stats.overview?.activeProjects || 0}
            trend="+12%"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Total Tasks"
            value={stats.overview?.totalTasks || 0}
            trend="+5%"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.overview?.completionRate || 0}%`}
            trend="+8%"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Due Soon"
            value={stats.overview?.tasksDueSoon || 0}
            alert={(stats.overview?.tasksDueSoon || 0) > 5}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="theme-card rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold">Task Distribution</h3>
            <TaskDistributionChart data={distributionData} theme={theme} />
          </div>
          <div className="theme-card rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold">Monthly Trend</h3>
            <MonthlyTrendChart data={trendData} theme={theme} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProjectList projects={stats.projects || []} />
            <TeamPerformance data={stats.teamPerformance || []} />
          </div>
          <div>
            <DueSoonList tasks={stats.dueSoon || []} />
            <ActivityFeed activities={activityData?.activities || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
