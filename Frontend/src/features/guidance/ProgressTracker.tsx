import { useAnalyzeProgressMutation } from './guidanceApi';
import { useGetProjectByIdQuery } from '../projects/projectsApi';
import { useState } from 'react';

interface ProgressTrackerProps {
  projectId: string;
}

// Skeleton loading
const ProgressSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

export const ProgressTracker = ({ projectId }: ProgressTrackerProps) => {
  const { data: project, isLoading: projectLoading } = useGetProjectByIdQuery(projectId);
  const [analyzeProgress, { isLoading: analyzing }] = useAnalyzeProgressMutation();
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeProgress({ projectId }).unwrap();
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze progress:', error);
    }
  };

  if (projectLoading) {
    return <ProgressSkeleton />;
  }

  const enrollment = (project as any)?.enrollment;
  const milestones = (project as any)?.milestones || [];
  const completedMilestones = enrollment?.completedMilestones || [];
  const currentMilestoneIndex = enrollment?.currentMilestone || 0;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedMilestones.length / milestones.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#3b82f6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${progressPercentage * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{progressPercentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Project Progress</h3>
            <p className="text-gray-600 mb-4">
              {milestones[currentMilestoneIndex]?.title || 'Getting Started'}
            </p>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{completedMilestones.length} completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{milestones.length - completedMilestones.length} remaining</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {analyzing ? 'Analyzing...' : 'Get AI Insights'}
        </button>
      </div>

      {/* AI Insights */}
      {analysis && analysis.insights && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            <h4 className="font-semibold text-purple-900">AI Insights</h4>
          </div>
          <p className="text-purple-800 mb-4">{analysis.insights.summary}</p>
          
          {analysis.insights.warnings && analysis.insights.warnings.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-red-700 mb-2">⚠️ Attention Needed</h5>
              <ul className="space-y-1">
                {analysis.insights.warnings.map((warning: string, idx: number) => (
                  <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.insights.recommendations && analysis.insights.recommendations.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-purple-900 mb-2">💡 Recommendations</h5>
              <ul className="space-y-2">
                {analysis.insights.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold mb-4">Milestones</h4>
        <div className="space-y-3">
          {milestones.map((milestone: any, idx: number) => {
            const isCompleted = completedMilestones.includes(idx);
            const isCurrent = idx === currentMilestoneIndex;
            
            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  isCompleted ? 'bg-green-50' : isCurrent ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                    {milestone.title}
                  </p>
                  {milestone.description && (
                    <p className="text-sm text-gray-500">{milestone.description}</p>
                  )}
                  {milestone.estimatedHours && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded mt-1 inline-block">
                      ~{milestone.estimatedHours}h
                    </span>
                  )}
                </div>
                {isCurrent && !isCompleted && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    In Progress
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

