import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProjectByIdQuery } from './projectsApi';

interface TechStack {
  name: string;
  technologies: string[];
  description: string;
}

const StackCard = ({
  stack,
  isSelected,
  onSelect,
}: {
  stack: TechStack;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50/10' : 'theme-card theme-card-hover'
    }`}
  >
    <div className="mb-3 flex items-center gap-3">
      <h3 className="text-lg font-bold">{stack.name}</h3>
    </div>
    <p className="theme-muted mb-4 text-sm">{stack.description}</p>
    <div className="flex flex-wrap gap-2">
      {stack.technologies.map((tech) => (
        <span key={tech} className="theme-subcard rounded border px-2 py-1 text-xs">
          {tech}
        </span>
      ))}
    </div>
  </div>
);

export const TechnologyRecommendation = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectByIdQuery(projectId || '');
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);
  const navigate = useNavigate();

  const handleStartProject = () => {
    if (projectId && selectedStack) {
      navigate(`/projects/${projectId}/collaboration`);
    }
  };

  const suggestedStacks: TechStack[] = project?.techStack
    ? [
        { name: 'MERN Stack', technologies: project.techStack, description: 'MongoDB, Express, React, Node.js' },
        { name: 'Modern Web', technologies: ['React', 'TypeScript', 'Vite', 'Tailwind'], description: 'Modern frontend stack with TypeScript' },
        { name: 'Full Stack', technologies: ['Next.js', 'Prisma', 'PostgreSQL'], description: 'Production-ready full stack solution' },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="theme-page flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="theme-page container mx-auto px-4 py-8">
        <p className="theme-muted">Project not found</p>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{project.title}</h1>
        <p className="theme-muted mb-8">{project.description}</p>

        <h2 className="mb-4 text-xl font-semibold">Recommended Technology Stacks</h2>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suggestedStacks.map((stack) => (
            <StackCard key={stack.name} stack={stack} isSelected={selectedStack?.name === stack.name} onSelect={() => setSelectedStack(stack)} />
          ))}
        </div>

        {selectedStack && (
          <div className="theme-card rounded-lg border border-blue-500/30 p-6">
            <h3 className="mb-2 font-semibold">Selected: {selectedStack.name}</h3>
            <p className="theme-muted mb-4">This stack includes: {selectedStack.technologies.join(', ')}</p>
            <button onClick={handleStartProject} className="rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
              Start Project with This Stack
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
