import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProjectSuggestionsQuery, type Project } from './projectsApi';

const ProjectCard = ({ project, onSelect }: { project: Project; onSelect: () => void }) => {
  const techStack = project.techStack || [];
  const displayTech = techStack.slice(0, 3);
  const members = project.members || [];

  return (
    <div className="theme-card theme-card-hover cursor-pointer rounded-xl border p-6 transition-all" onClick={onSelect}>
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xl font-semibold">{project.title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            project.difficulty === 'Beginner'
              ? 'bg-green-500/20 text-green-400'
              : project.difficulty === 'Intermediate'
                ? 'bg-yellow-500/20 text-yellow-400'
                : project.difficulty === 'Advanced'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {project.difficulty || 'N/A'}
        </span>
      </div>

      <p className="theme-muted mb-4 line-clamp-2">{project.description}</p>

      {project.domain && (
        <div className="mb-3">
          <span className="rounded px-2 py-1 text-xs text-blue-400 bg-blue-500/20">{project.domain}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {displayTech.map((tech) => (
          <span key={tech} className="theme-subcard rounded border px-2 py-1 text-xs">
            {tech}
          </span>
        ))}
        {techStack.length > 3 && <span className="theme-subcard theme-soft rounded border px-2 py-1 text-xs">+{techStack.length - 3}</span>}
      </div>

      <div className="flex items-center justify-between">
        {members.length > 0 ? (
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member, idx) => (
              <div key={idx} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-transparent bg-purple-600 text-xs font-medium text-white">
                {member.user.name?.charAt(0) || '?'}
              </div>
            ))}
          </div>
        ) : (
          <span className="theme-soft text-sm">Individual project</span>
        )}

        {project.estimatedDuration && <span className="theme-soft text-sm">Estimated: {project.estimatedDuration}</span>}
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

  if (isLoading) {
    return (
      <div className="theme-page">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-page">
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
            Error loading projects: {JSON.stringify(error)}
          </div>
        </div>
      </div>
    );
  }

  if (!projects || !Array.isArray(projects)) {
    return (
      <div className="theme-page">
        <div className="container mx-auto px-4 py-8">
          <div className="py-16 text-center">
            <p className="theme-muted text-lg">No projects available or invalid data format</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Project Suggestions</h1>
          <p className="theme-muted">Discover real-world projects to build your skills</p>
        </div>

        <div className="theme-card mb-8 rounded-xl border p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="theme-select rounded-lg border px-4 py-2"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={filters.stack}
              onChange={(e) => setFilters({ ...filters, stack: e.target.value })}
              className="theme-select rounded-lg border px-4 py-2"
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
              className="theme-select rounded-lg border px-4 py-2"
            >
              <option value="">All Domains</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="AI">AI</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onSelect={() => handleSelectProject(project._id)} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="py-16 text-center">
            <p className="theme-muted text-lg">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
