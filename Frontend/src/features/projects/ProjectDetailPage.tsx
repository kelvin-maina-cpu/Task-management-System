import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery, useEnrollInProjectMutation, type Project, type TechStack } from './projectsApi';
import { useState } from 'react';
import { StackSelector } from './components/StackSelector';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

// Loading skeleton component
const ProjectDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    <div className="animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
      <div className="h-64 bg-slate-700 rounded-lg"></div>
    </div>
  </div>
);

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useGetProjectByIdQuery(projectId || '');
  const [enroll, { isLoading: enrolling }] = useEnrollInProjectMutation();
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'milestones'>('overview');
  
  // Get current user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const handleEnroll = async () => {
    if (!selectedStack) {
      alert('Please select a technology stack first');
      return;
    }

    console.log('Starting enrollment...', { projectId, stack: selectedStack.name });

    try {
      const result = await enroll({ 
        projectId: projectId || '', 
        chosenStack: selectedStack 
      }).unwrap();
      
      console.log('✅ Success:', result);
      navigate(`/projects/${projectId}/workspace`);
      
    } catch (err: unknown) {
      console.error('❌ Full error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', err ? Object.keys(err) : 'undefined');
      console.error('Error string:', String(err));
      
      // Safe message extraction - handle all possible error shapes
      let errorMsg = 'Failed to enroll. Please try again.';
      
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        if (errorObj.data && typeof errorObj.data === 'object') {
          const data = errorObj.data as Record<string, unknown>;
          if (typeof data.error === 'string') {
            errorMsg = data.error;
          } else if (typeof data.message === 'string') {
            errorMsg = data.message;
          }
        } else if (typeof errorObj.error === 'string') {
          errorMsg = errorObj.error;
        } else if (typeof errorObj.message === 'string') {
          errorMsg = errorObj.message;
        }
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      alert(errorMsg);
    }
  };

  if (isLoading) return <ProjectDetailSkeleton />;
  
  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          Project not found or failed to load.
        </div>
      </div>
    );
  }

  // Check if current user is already enrolled by comparing user IDs
  const isEnrolled = user && project.enrolledUsers && project.enrolledUsers.some(
    (e: { user: { _id?: string; toString?: () => string } }) => {
      const enrolledUserId = e.user?._id?.toString() || e.user?.toString?.() || '';
      return enrolledUserId === user.id;
    }
  );

  // Get user's enrollment data for display
  const userEnrollment = user && project.enrolledUsers?.find(
    (e: { user: { _id?: string; toString?: () => string } }) => {
      const enrolledUserId = e.user?._id?.toString() || e.user?.toString?.() || '';
      return enrolledUserId === user.id;
    }
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
            project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            project.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {project.difficulty || 'N/A'}
          </span>
          {project.domain && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
              {project.domain}
            </span>
          )}
          {project.estimatedDuration && (
            <span className="text-gray-400 text-sm">⏱️ {project.estimatedDuration}</span>
          )}
          {project.teamSize && (
            <span className="text-gray-400 text-sm">👥 {project.teamSize}</span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
        <p className="text-xl text-gray-400">{project.description}</p>
      </div>

      {/* Tags */}
        {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag, tagIndex) => (
            <span key={tag || `tag-${tagIndex}`} className="px-3 py-1 bg-slate-700/50 text-gray-300 text-sm rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        {(['overview', 'architecture', 'milestones'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize font-medium transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-purple-500 text-purple-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && <ProjectOverview project={project} />}
          {activeTab === 'architecture' && <ArchitectureSection project={project} />}
          {activeTab === 'milestones' && <MilestonesSection project={project} />}
        </div>

        {/* Sidebar - Stack Selection */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">Choose Your Stack</h3>
            <StackSelector 
              stacks={project.suggestedStacks || []}
              selected={selectedStack}
              onSelect={setSelectedStack}
            />
            
            {selectedStack && (
              <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h4 className="font-semibold text-purple-400">{selectedStack.name}</h4>
                {selectedStack.architecture?.description && (
                  <p className="text-sm text-gray-400 mt-1">{selectedStack.architecture.description}</p>
                )}
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={!selectedStack || enrolling || !!isEnrolled}
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold disabled:bg-slate-600 hover:bg-purple-700 transition disabled:cursor-not-allowed"
            >
              {enrolling ? 'Starting Project...' : isEnrolled ? 'Already Enrolled' : 'Start Building'}
            </button>
            
            {/* Edit button for created/enrolled projects */}
            {user && (isEnrolled || project.createdBy?._id === user.id) && (
              <button
                onClick={() => navigate(`/projects/${projectId}/edit`)}
                className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-semibold transition"
              >
                Edit Project
              </button>
            )}
            
            {/* Show "Go to Workspace" button for enrolled users */}
            {isEnrolled && (
              <button
                onClick={() => navigate(`/projects/${projectId}/workspace`)}
                className="w-full mt-3 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Workspace
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
            <h4 className="font-semibold text-white mb-3">Project Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Team Size</span>
                <span className="text-gray-200">{project.teamSize || '1-2 developers'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Milestones</span>
                <span className="text-gray-200">{project.milestones?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-gray-200">{project.completionCount || 0} builders</span>
              </div>
              {project.averageRating !== undefined && project.averageRating > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Rating</span>
                  <span className="text-yellow-400">★ {project.averageRating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Sub-components
const ProjectOverview = ({ project }: { project: Project }) => (
  <div className="space-y-8">
    {/* Requirements */}
    {project.requirements && (
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Requirements</h3>
        <div className="space-y-4">
          {project.requirements.functional && project.requirements.functional.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Functional Requirements</h4>
              <ul className="space-y-2">
                {project.requirements.functional.map((req, reqIndex) => (
                  <li key={`req-${req.asA}-${req.iWant}-${reqIndex}`} className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                      req.priority === 'Must Have' ? 'bg-red-500/20 text-red-400' :
                      req.priority === 'Should Have' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {req.priority}
                    </span>
                    <span className="text-gray-300 text-sm">
                      As a <span className="text-purple-400">{req.asA}</span>, I want <span className="text-purple-400">{req.iWant}</span> so that <span className="text-purple-400">{req.soThat}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.requirements.nonFunctional && project.requirements.nonFunctional.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Non-Functional Requirements</h4>
              <div className="grid gap-2">
                {project.requirements.nonFunctional.map((req, reqIndex) => (
                  <div key={`nonfunc-${req.category}-${reqIndex}`} className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">{req.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{req.requirement}</p>
                    {req.metric && (
                      <p className="text-green-400 text-xs mt-1">✓ Metric: {req.metric}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    )}

    {/* Learning Outcomes */}
    {project.learningOutcomes && project.learningOutcomes.length > 0 && (
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">What You'll Learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {project.learningOutcomes.map((outcome, outcomeIndex) => (
            <div key={`outcome-${outcome.substring(0,20)}-${outcomeIndex}`} className="flex items-center gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <span className="text-green-400">✓</span>
              <span className="text-green-300 text-sm">{outcome}</span>
            </div>
          ))}
        </div>
      </section>
    )}

    {/* Real World Use */}
    {project.realWorldUse && (
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Real-World Application</h3>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
          <p className="text-blue-300">{project.realWorldUse}</p>
        </div>
      </section>
    )}

    {/* Starter Code */}
    {project.starterCode && (
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Starter Code</h3>
        <div className="bg-slate-900 border border-white/10 p-4 rounded-lg">
          <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
            <code>{project.starterCode.setupInstructions}</code>
          </pre>
          {project.starterCode.environmentVariables && project.starterCode.environmentVariables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-semibold text-gray-300 mb-2">Environment Variables</h4>
              <ul className="space-y-1 text-sm">
                {project.starterCode.environmentVariables.map((env) => (
                  <li key={env.name} className="text-gray-400">
                    <code className="text-purple-400">{env.name}</code>
                    {env.required && <span className="text-red-400"> *required</span>}
                    {env.description && <span className="text-gray-500"> - {env.description}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    )}
  </div>
);

const ArchitectureSection = ({ project }: { project: Project }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white">Database Schema</h3>
    
    {project.databaseSchema?.entities && project.databaseSchema.entities.length > 0 ? (
      project.databaseSchema.entities.map((entity) => (
        <div key={entity.name} className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
          <h4 className="font-bold text-lg text-white mb-3">{entity.name}</h4>
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-2 text-gray-300">Field</th>
                <th className="text-left p-2 text-gray-300">Type</th>
                <th className="text-left p-2 text-gray-300">Description</th>
              </tr>
            </thead>
            <tbody>
              {entity.fields?.map((field) => (
                <tr key={field.name} className="border-t border-white/10">
                  <td className="p-2 font-mono text-purple-400">{field.name}</td>
                  <td className="p-2 text-gray-400">{field.type}</td>
                  <td className="p-2 text-gray-500">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entity.relationships && entity.relationships.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-gray-500">Relationships: </span>
              {entity.relationships.map((rel, idx) => (
                <span key={idx} className="text-xs text-blue-400 ml-2">
                  {entity.name} → {rel.type} {rel.with}
                </span>
              ))}
            </div>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-400">No database schema defined for this project.</p>
    )}

    <h3 className="text-2xl font-bold text-white mt-8">API Endpoints</h3>
    
    {project.apiEndpoints && project.apiEndpoints.length > 0 ? (
      <div className="space-y-2">
        {project.apiEndpoints.map((endpoint, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-white/10">
            <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
              endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
              endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {endpoint.method}
            </span>
            <code className="text-gray-300 font-mono text-sm">{endpoint.path}</code>
            <span className="text-gray-500 text-sm">{endpoint.description}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400">No API endpoints defined for this project.</p>
    )}
  </div>
);

const MilestonesSection = ({ project }: { project: Project }) => {
  const milestones = project.milestones || [];
  
  if (milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No milestones defined for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {milestones
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((milestone, idx) => (
        <div key={idx} className="bg-slate-800/50 border border-white/10 rounded-lg p-6 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-l-lg" />
          
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-sm text-purple-400 font-semibold">Milestone {milestone.order}</span>
              <h3 className="text-xl font-bold text-white mt-1">{milestone.title}</h3>
            </div>
            {milestone.estimatedHours && (
              <span className="text-sm text-gray-400">⏱️ {milestone.estimatedHours} hours</span>
            )}
          </div>
          
          <p className="text-gray-400 mb-4">{milestone.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestone.deliverables && milestone.deliverables.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-300 mb-2">Deliverables</h4>
                <ul className="space-y-1">
                  {milestone.deliverables.map((d, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {milestone.learningOutcomes && milestone.learningOutcomes.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-300 mb-2">Learning Outcomes</h4>
                <ul className="space-y-1">
                  {milestone.learningOutcomes.map((lo, i) => (
                    <li key={i} className="text-sm text-blue-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {lo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {milestone.resources && milestone.resources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="font-semibold text-sm text-gray-300 mb-2">Resources</h4>
              <div className="flex flex-wrap gap-2">
                {milestone.resources.map((r, i) => (
                  <a 
                    key={i}
                    href={r.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
                  >
                    {r.title} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectDetailPage;

