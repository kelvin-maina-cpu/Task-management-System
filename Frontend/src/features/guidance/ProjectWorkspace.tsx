import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectByIdQuery, useGetMyProjectsQuery } from '../projects/projectsApi';
import { AIChat } from './AIChat';
import { MentorMatching } from './MentorMatching';
import { ProgressTracker } from './ProgressTracker';

type TabType = 'code' | 'ai' | 'mentor' | 'progress';

export const ProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectByIdQuery(projectId || '');
  const { data: myProjects } = useGetMyProjectsQuery();
  const [activeTab, setActiveTab] = useState<TabType>('ai');

  if (isLoading || !project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const enrollment = myProjects?.find(p => p._id === projectId);
  const currentFile = 'src/components/App.tsx';

  const tabs = [
    { id: 'ai' as TabType, label: 'AI Assistant' },
    { id: 'mentor' as TabType, label: 'Mentor' },
    { id: 'progress' as TabType, label: 'Progress' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{project.title}</h1>
            <p className="text-sm text-gray-500">
              Milestone {((enrollment as any)?.currentMilestone || 0) + 1} of {project.milestones?.length || 0}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {(enrollment as any)?.chosenStack?.name || 'No stack selected'}
            </span>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Submit for Review
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor (placeholder for actual editor integration) */}
        <div className="flex-1 bg-gray-900 text-white p-4 font-mono text-sm overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{currentFile}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">Modified</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700 transition-colors">
                Run
              </button>
              <button className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 transition-colors">
                Test
              </button>
            </div>
          </div>
          <pre className="text-gray-300 whitespace-pre-wrap">
{`// Your code here
// This is a placeholder for the Monaco Editor or CodeMirror integration

import React from 'react';

const App = () => {
  return (
    <div className="app">
      <h1>Welcome to ${project.title}</h1>
    </div>
  );
};

export default App;`}
          </pre>
        </div>

        {/* Right: Guidance Panel */}
        <div className="w-[450px] bg-white border-l flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'ai' && (
              <div className="h-full p-4">
                <AIChat 
                  projectId={projectId || ''} 
                  currentFile={currentFile}
                />
              </div>
            )}
            
            {activeTab === 'mentor' && (
              <div className="h-full overflow-y-auto p-4">
                <MentorMatching projectId={projectId || ''} />
              </div>
            )}
            
            {activeTab === 'progress' && (
              <div className="h-full overflow-y-auto p-4">
                <ProgressTracker projectId={projectId || ''} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

