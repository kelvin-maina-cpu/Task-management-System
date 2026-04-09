import { useState } from 'react';
import { useGetMentorMatchesQuery, useRequestMentorMutation } from './guidanceApi';

interface MentorMatchingProps {
  projectId: string;
}

// Skeleton loading component
const MentorMatchingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const MentorMatching = ({ projectId }: MentorMatchingProps) => {
  const { data, isLoading, error } = useGetMentorMatchesQuery(projectId);
  const matches = Array.isArray(data) ? data : [];
  const [requestMentor] = useRequestMentorMutation();
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const handleRequest = async (mentorId: string) => {
    try {
      setRequestError(null);
      await requestMentor({ projectId, mentorId }).unwrap();
      setRequestSent(true);
    } catch (err) {
      setRequestError('Failed to send mentorship request. Please try again.');
      console.error('Request failed:', err);
    }
  };

  if (isLoading) {
    return <MentorMatchingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
        Failed to load mentors
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No mentors available for this project yet.</p>
        <p className="text-sm text-gray-400 mt-2">Check back later for mentor availability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Find a Mentor</h2>
          <p className="text-gray-600">AI-matched experts for your tech stack and project</p>
        </div>
        <div className="text-sm text-gray-500">
          {matches.length} mentors available
        </div>
      </div>

      {requestError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {requestError}
        </div>
      )}

      {requestSent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800">Request Sent!</h3>
          <p className="text-green-700 mt-2">
            Your mentor will respond within 24 hours. Check your email for updates.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map(({ mentor, score }) => (
            <div
              key={mentor._id}
              className={`bg-white border-2 rounded-lg p-6 transition-all cursor-pointer ${
                selectedMentor === mentor._id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedMentor(mentor._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={mentor.avatar || '/default-avatar.png'}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover bg-gray-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{mentor.name}</h3>
                      {mentor.isTopRated && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Top Rated
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{mentor.title || 'Mentor'}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{mentor.averageRating || 4.8}</span>
                        <span className="text-gray-400">({mentor.totalReviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{mentor.completedMentorships || 0}+ mentored</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Responds in {mentor.avgResponseTime || '< 24h'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {score.totalScore}%
                  </div>
                  <div className="text-sm text-gray-500">Match Score</div>
                </div>
              </div>

              {/* Match Breakdown */}
              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
{Object.entries(score.breakdown).map(([key, value]) => (
                  <div key={`breakdown-${mentor._id}-${key}`} className={`p-2 rounded ${
                    value > 70 ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                  }`}>
                    <div className="font-semibold">{value}%</div>
                    <div className="text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {/* Tech Overlap */}
              {score.techOverlap && score.techOverlap.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
{score.techOverlap.map((tech: { name: string }, idx: number) => (
                    <span key={`tech-${mentor._id}-${idx}-${tech.name}`} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {tech.name} ✓
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded Details */}
              {selectedMentor === mentor._id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
{mentor.expertise?.map((skill, idx) => (
                          <span 
                            key={`expertise-${mentor._id}-${idx}-${skill}`} 
                            className="px-2 py-1 bg-gray-100 rounded text-sm"
                          >
                            {skill}
                          </span>
                        )) || <span className="text-gray-400">General</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Availability</h4>
                      <div className="text-sm text-gray-600">
                        Flexible schedule
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequest(mentor._id);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Request Mentorship
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

