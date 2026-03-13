import { useGetPendingProjectsQuery, useApproveProjectMutation } from './adminApi';

export const ProjectApproval = () => {
  const { data: pendingProjects, isLoading } = useGetPendingProjectsQuery();
  const [approveProject] = useApproveProjectMutation();

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await approveProject({ id, action }).unwrap();
    } catch (error) {
      console.error('Failed to process project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Project Approvals</h1>
      
      <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Pending Projects</h2>
          <p className="text-gray-400 text-sm mt-1">Review and approve AI-generated projects</p>
        </div>
        
        <div className="divide-y divide-gray-700">
          {pendingProjects && pendingProjects.length > 0 ? (
            pendingProjects.map((project) => (
              <div key={project._id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{project.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    By {project.createdBy.name} • {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(project._id, 'reject')}
                    className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(project._id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-400">No pending projects to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

