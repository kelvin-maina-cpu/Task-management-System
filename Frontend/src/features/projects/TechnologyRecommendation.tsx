import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery } from './projectsApi';

interface TechStack {
  name: string;
  technologies: string[];
  description: string;
}

const StackCard = ({ stack, isSelected, onSelect }: { 
  stack: TechStack; 
  isSelected: boolean; 
  onSelect: () => void;
}) => (
  <div 
    onClick={onSelect}
    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50/10' 
        : 'border-gray-700 hover:border-blue-400'
    }`}
  >
    <div className="flex items-center gap-3 mb-3">
      <h3 className="font-bold text-lg text-white">{stack.name}</h3>
    </div>
    <p className="text-sm text-gray-400 mb-4">{stack.description}</p>
    <div className="flex flex-wrap gap-2">
      {stack.technologies.map((tech) => (
        <span key={tech} className="px-2 py-1 bg-slate-700 text-xs rounded text-gray-300">
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

  // Mock tech stacks - in real app these would come from the project data
  const suggestedStacks: TechStack[] = project?.techStack ? [
    { name: 'MERN Stack', technologies: project.techStack, description: 'MongoDB, Express, React, Node.js' },
    { name: 'Modern Web', technologies: ['React', 'TypeScript', 'Vite', 'Tailwind'], description: 'Modern frontend stack with TypeScript' },
    { name: 'Full Stack', technologies: ['Next.js', 'Prisma', 'PostgreSQL'], description: 'Production-ready full stack solution' },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-400">Project not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
      <p className="text-gray-400 mb-8">{project.description}</p>
      
      <h2 className="text-xl font-semibold text-white mb-4">Recommended Technology Stacks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {suggestedStacks.map((stack) => (
          <StackCard
            key={stack.name}
            stack={stack}
            isSelected={selectedStack?.name === stack.name}
            onSelect={() => setSelectedStack(stack)}
          />
        ))}
      </div>

      {selectedStack && (
        <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30">
          <h3 className="font-semibold text-white mb-2">Selected: {selectedStack.name}</h3>
          <p className="text-gray-300 mb-4">
            This stack includes: {selectedStack.technologies.join(', ')}
          </p>
          <button 
            onClick={handleStartProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
          >
            Start Project with This Stack
          </button>
        </div>
      )}
    </div>
  );
};

