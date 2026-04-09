import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from './dashboardApi';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const StatCard = ({ title, value, trend, icon, alert }: { 
  title: string; 
  value: number | string; 
  trend?: string; 
  icon: React.ReactNode;
  alert?: boolean;
}) => (
  <div className={`bg-slate-800/50 border border-white/10 rounded-xl p-6 ${alert ? 'border-red-500/50' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend} from last month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${alert ? 'bg-red-600/20 text-red-400' : 'bg-purple-600/20 text-purple-400'}`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ErrorMessage = ({ error }: { error: unknown }) => (
  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
    <p>Error loading dashboard: {error instanceof Error ? error.message : 'Unknown error'}</p>
  </div>
);

const TaskDistributionChart = ({ data }: { data: { todo: number; inProgress: number; completed: number } }) => {
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
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const MonthlyTrendChart = ({ data }: { data: Array<{ month: string; count: number }> }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          dot={{ fill: '#8B5CF6' }}
          name="Completed Tasks"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const ProjectList = ({ projects }: { projects: Array<{
  id: string;
  title: string;
  status: string;
  progress: number;
  memberCount: number;
  taskCount: number;
}> }) => (
  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>
    <div className="space-y-4">
      {projects.length === 0 ? (
        <p className="text-gray-400">No projects found</p>
      ) : (
        projects.slice(0, 5).map((project) => (
          <div key={project.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-medium">{project.title}</h4>
              <span className={`text-xs ${
                project.status === 'active' ? 'text-green-400' : 
                project.status === 'completed' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {project.status} • {project.taskCount} tasks
              </span>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{project.progress}%</p>
              <div className="w-24 h-2 bg-slate-600 rounded-full mt-1">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const ActivityFeed = ({ activities }: { activities: Array<{
  id: string;
  description: string;
  project: string;
  user: string;
  timestamp: string;
  status: string;
}> }) => (
  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 mt-6">
    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-gray-400">No recent activity</p>
      ) : (
        activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.status === 'completed' ? 'bg-green-400' : 'bg-purple-400'
            }`}></div>
            <div>
              <p className="text-white text-sm">{activity.description}</p>
              <p className="text-gray-400 text-xs">
                {activity.project} • {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const DueSoonList = ({ tasks }: { tasks: Array<{
  id: string;
  title: string;
  deadline: string;
  project: string;
  priority: string;
  daysLeft: number;
}> }) => (
  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Due Soon</h3>
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks due soon</p>
      ) : (
        tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-medium text-sm">{task.title}</h4>
              <p className="text-gray-400 text-xs">{task.project}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded ${
                task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {task.priority}
              </span>
              <p className={`text-xs mt-1 ${task.daysLeft <= 1 ? 'text-red-400' : 'text-gray-400'}`}>
                {task.daysLeft} days left
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const TeamPerformance = ({ data }: { data: Array<{
  userId: string;
  name: string;
  email: string;
  completedTasks: number;
}> }) => (
  <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
    <div className="space-y-3">
      {data.length === 0 ? (
        <p className="text-gray-400">No team data available</p>
      ) : (
        data.map((member, index) => (
          <div key={member.userId} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {index + 1}
              </div>
              <div>
                <h4 className="text-white font-medium">{member.name}</h4>
                <p className="text-gray-400 text-xs">{member.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{member.completedTasks}</p>
              <p className="text-gray-400 text-xs">tasks completed</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const DashboardPage = () => {
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery();
  const { data: activityData } = useGetRecentActivityQuery({ page: 1, limit: 10 });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!stats) return null;

  // Ensure we have data for charts
  const distributionData = stats.taskStats?.distribution || { todo: 0, inProgress: 0, completed: 0 };
  const trendData = stats.monthlyTrend?.length > 0 ? stats.monthlyTrend : [
    { month: '2024-01', count: 0 },
    { month: '2024-02', count: 0 },
    { month: '2024-03', count: 0 },
    { month: '2024-04', count: 0 },
    { month: '2024-05', count: 0 },
    { month: '2024-06', count: 0 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Projects" 
          value={stats.overview?.activeProjects || 0} 
          trend="+12%" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          } 
        />
        <StatCard 
          title="Total Tasks" 
          value={stats.overview?.totalTasks || 0} 
          trend="+5%" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          } 
        />
        <StatCard 
          title="Completion Rate" 
          value={`${stats.overview?.completionRate || 0}%`} 
          trend="+8%" 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } 
        />
        <StatCard 
          title="Due Soon" 
          value={stats.overview?.tasksDueSoon || 0} 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          alert={(stats.overview?.tasksDueSoon || 0) > 5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Distribution</h3>
          <TaskDistributionChart data={distributionData} />
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
          <MonthlyTrendChart data={trendData} />
        </div>
      </div>

      {/* Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
  );
};

export default DashboardPage;

