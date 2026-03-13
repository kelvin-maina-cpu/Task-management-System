import { useGetAllMyProjectsQuery, useDeleteProjectMutation, useUpdateProjectMutation } from './projectsApi';
import type { Project } from './projectsApi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';


interface ExtendedProject extends Project {
  isCreated?: boolean;
}

  const MyProjectsSkeleton = () => (
    <div className="space-y-4">
      {[1,2,3,4].map((i) => (
        <div key={i} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-96 mb-3"></div>
          <div className="h-10 bg-slate-600 rounded-lg w-32"></div>
        </div>
      ))}
    </div>
  );


export const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    data: projectsData, 
    isLoading, 
    error,
    refetch 
  } = useGetAllMyProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  const projects: ExtendedProject[] = projectsData?.data || [];

  const handleDelete = async (projectId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(projectId).unwrap();
      refetch();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const getStatusBadge = (project: ExtendedProject) => {
    if (project.isCreated) {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Created</span>;
    }
    const status = project.enrollment?.status || 'enrolled';
    const colors = {
      enrolled: 'bg-gray-500/20 text-gray-400',
      'in-progress': 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      abandoned: 'bg-red-500/20 text-red-400'
    };
    return <span className={`px-3 py-1 ${colors[status as keyof typeof colors]} rounded-full text-xs font-medium capitalize`}>{status}</span>;
  };

  const getProgress = (project: ExtendedProject) => {
    if (!project.enrollment) return 0;
    const total = project.milestones?.length || 1;
    const completed = project.enrollment.completedMilestones.length;
    return Math.round((completed / total) * 100);
  };

  if (isLoading) return <MyProjectsSkeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-gray-400 mb-4">Failed to load projects</p>
      <button onClick={() => refetch()} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
        Retry
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-xl text-gray-400">
            {projects.length} project{projects.length !== 1 ? 's' : ''} {user ? `· ${user.name}` : ''}
          </p>
        </div>
        <button 
          onClick={() => navigate('/projects/suggestions')} 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-700/50 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-6">Get started by creating your own or enrolling in a suggested project.</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/projects/suggestions')} 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="group bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 rounded-2xl p-8 transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {project.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.difficulty}
                    </span>
                  )}
                  {getStatusBadge(project)}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:line-clamp-none">
                {project.title}
              </h3>
              
              <p className="text-gray-400 mb-6 line-clamp-3">{project.description}</p>

              {project.enrollment && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-white">
                      {getProgress(project)}% ({project.enrollment.completedMilestones.length}/{project.milestones?.length || 0})
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgress(project)}%` }}
                    />
                  </div>
                </div>
              )}

              {project.averageRating && project.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-6 text-sm text-yellow-400">
                  ★ {project.averageRating} ({project.ratings?.length || 0} ratings)
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-700">
                <button
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-white hover:bg-slate-700 transition-colors"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  View
                </button>
                {(project.isCreated || project.enrollment) && (
                  <>
                    <button
                      className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      onClick={() => navigate(`/projects/${project._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      onClick={() => handleDelete(project._id, project.title)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;

