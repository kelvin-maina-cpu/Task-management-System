import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectSuggestionsQuery, type Project } from './projectsApi';

const ProjectCard = ({ project, onSelect }: { project: Project; onSelect: () => void }) => {
  // Safe access with fallbacks
  const techStack = project.techStack || [];
  const displayTech = techStack.slice(0, 3);
  const members = project.members || [];
  
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{project.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
          project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
          project.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {project.difficulty || 'N/A'}
        </span>
      </div>
      <p className="text-gray-400 mb-4 line-clamp-2">{project.description}</p>
      
      {/* Show domain if available */}
      {project.domain && (
        <div className="mb-3">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
            {project.domain}
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {displayTech.map((tech) => (
          <span key={tech} className="px-2 py-1 bg-slate-700/50 text-gray-300 text-xs rounded">
            {tech}
          </span>
        ))}
        {techStack.length > 3 && (
          <span className="px-2 py-1 bg-slate-700/50 text-gray-400 text-xs rounded">
            +{techStack.length - 3}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        {members.length > 0 ? (
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-purple-600 border-2 border-slate-800 flex items-center justify-center text-xs text-white font-medium">
                {member.user.name?.charAt(0) || '?'}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">Individual project</span>
        )}
        {project.estimatedDuration && (
          <span className="text-gray-400 text-sm">⏱️ {project.estimatedDuration}</span>
        )}
      </div>
    </div>
  );
};

export const ProjectSuggestions = () => {
  const [filters, setFilters] = useState({ difficulty: '', stack: '', domain: '' });
  const { data: projects, isLoading, error } = useGetProjectSuggestionsQuery(filters);
  const navigate = useNavigate();

  const handleSelectProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          Error loading projects: {JSON.stringify(error)}
        </div>
      </div>
    );
  }

  // Ensure projects is an array before mapping
  if (!projects || !Array.isArray(projects)) {
    console.error('Projects is not an array:', projects);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No projects available or invalid data format</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Project Suggestions</h1>
        <p className="text-gray-400">Discover real-world projects to build your skills</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={filters.stack}
            onChange={(e) => setFilters({ ...filters, stack: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white"
          >
            <option value="">All Stacks</option>
            <option value="MERN">MERN</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
          </select>

          <select
            value={filters.domain}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
            className="px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white"
          >
            <option value="">All Domains</option>
            <option value="Web">Web</option>
            <option value="Mobile">Mobile</option>
            <option value="AI">AI</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onSelect={() => handleSelectProject(project._id)}
            />
          ))}
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

