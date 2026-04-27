import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DevSpace } from '../../components/devspace/DevSpace';
import {
  BEGINNER_PROGRESS_KEY,
  beginnerLessons,
  createBeginnerWorkspaceState,
  createBeginnerWorkspaceTree,
  getBeginnerLessonStatus,
} from '../beginner/beginnerLessons';
import './BeginnerWorkspace.css';

const readCompletedLessons = () => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(BEGINNER_PROGRESS_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
};

const getFileName = (filePath: string) => {
  const parts = filePath.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? filePath;
};

export const BeginnerWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedLessonId = searchParams.get('lesson');
  const initialLesson = beginnerLessons.find((lesson) => lesson.id === requestedLessonId)?.id ?? beginnerLessons[0].id;
  const [selectedLessonId, setSelectedLessonId] = useState(initialLesson);
  const [completedLessons, setCompletedLessons] = useState<string[]>(readCompletedLessons);
  const [workspaceFiles, setWorkspaceFiles] = useState(createBeginnerWorkspaceState);
  const [runPassedByLesson, setRunPassedByLesson] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState('Open a lesson, edit the code in Dev Hub, then run the lesson check here.');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeLessonIndex = beginnerLessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const activeLesson = beginnerLessons[activeLessonIndex] ?? beginnerLessons[0];
  const activeStatus = getBeginnerLessonStatus(activeLessonIndex, completedLessons);
  const nextLesson = beginnerLessons[activeLessonIndex + 1];
  const fileTree = useMemo(
    () => createBeginnerWorkspaceTree(activeLesson.id, workspaceFiles[activeLesson.id]),
    [activeLesson.id, workspaceFiles]
  );

  const handleSelectLesson = (lessonId: string) => {
    const lessonIndex = beginnerLessons.findIndex((lesson) => lesson.id === lessonId);

    if (getBeginnerLessonStatus(lessonIndex, completedLessons) === 'locked') {
      const previousLesson = beginnerLessons[lessonIndex - 1];
      setFeedback(`Pass ${previousLesson.title} first to unlock this lesson.`);
      return;
    }

    setSelectedLessonId(lessonId);
    setSearchParams({ lesson: lessonId });
    setFeedback('Lesson loaded in Dev Hub. Edit the code, then run the lesson check.');
  };

  const handleCodeChange = (filePath: string, content: string) => {
    const fileId = getFileName(filePath);

    setWorkspaceFiles((current) => ({
      ...current,
      [activeLesson.id]: (current[activeLesson.id] ?? activeLesson.files).map((file) =>
        file.id === fileId ? { ...file, code: content } : file
      ),
    }));

    setRunPassedByLesson((current) => ({
      ...current,
      [activeLesson.id]: false,
    }));

    setFeedback(`Updated ${fileId}. Keep going, then run the lesson check.`);
  };

  const handleRunLessonCheck = () => {
    const focusFile = (workspaceFiles[activeLesson.id] ?? activeLesson.files).find(
      (file) => file.id === activeLesson.focusFileId
    );
    const code = focusFile?.code ?? '';
    const hasHints = activeLesson.expectedHints.every((hint) => code.includes(hint));

    setRunPassedByLesson((current) => ({
      ...current,
      [activeLesson.id]: hasHints,
    }));

    setFeedback(
      hasHints
        ? 'Lesson check passed. Click "Pass lesson" to unlock the next one.'
        : `This lesson still needs: ${activeLesson.expectedHints.join(', ')}.`
    );
  };

  const handlePassLesson = () => {
    if (!runPassedByLesson[activeLesson.id]) {
      setFeedback('Run the lesson check successfully before passing the lesson.');
      return;
    }

    setCompletedLessons((current) => {
      const nextCompleted = current.includes(activeLesson.id) ? current : [...current, activeLesson.id];
      window.localStorage.setItem(BEGINNER_PROGRESS_KEY, JSON.stringify(nextCompleted));
      return nextCompleted;
    });

    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      setSearchParams({ lesson: nextLesson.id });
      setFeedback(`Lesson passed. ${nextLesson.title} is now unlocked in Dev Hub.`);
      return;
    }

    setFeedback('You passed the final beginner lesson in Dev Hub.');
  };

  const lessons = beginnerLessons.map((lesson, index) => ({
    ...lesson,
    status: getBeginnerLessonStatus(index, completedLessons),
  }));

  return (
    <div className={`beginner-workspace ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="workspace-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/beginner')}>
            Back
          </button>
          <div>
            <h1>Beginner Dev Hub</h1>
            <p className="subtitle">Interactive coding tests for the HTML and CSS track</p>
          </div>
        </div>
        <div className="progress-info">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedLessons.length / beginnerLessons.length) * 100}%` }}
            />
          </div>
          <p>{completedLessons.length} of {beginnerLessons.length} lessons passed</p>
        </div>
      </div>

      <div className="workspace-content">
        <aside className={`lessons-sidebar ${isFullscreen ? 'hidden-sidebar' : ''}`}>
          <h2>Dev Hub Lessons</h2>
          <div className="lessons-list">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(lesson.id)}
                className={`lesson-card ${lesson.status === 'complete' ? 'completed' : ''} ${
                  lesson.id === activeLesson.id ? 'active' : ''
                } ${lesson.status === 'locked' ? 'locked' : ''}`}
              >
                <div className="lesson-checkbox">
                  {lesson.status === 'complete' ? <span className="check-icon">✓</span> : <span>{lesson.order}</span>}
                </div>
                <div className="lesson-info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <span className="difficulty-badge">
                    {lesson.status === 'complete' ? 'Passed' : lesson.status === 'locked' ? 'Locked' : lesson.duration}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="lesson-brief">
            <p className="brief-label">Current mission</p>
            <h3>{activeLesson.title}</h3>
            <p>{activeLesson.challenge}</p>
          </div>

          <div className="lesson-brief">
            <p className="brief-label">Pass checklist</p>
            {activeLesson.successCriteria.map((item) => (
              <p key={item} className="brief-item">
                {item}
              </p>
            ))}
          </div>

          <div className="lesson-brief">
            <p className="brief-label">Required code signals</p>
            <p>{activeLesson.expectedHints.join(', ')}</p>
          </div>

          <div className="lesson-brief">
            <p className="brief-label">Lesson helper</p>
            <p>{feedback}</p>
          </div>

          <div className="lesson-actions">
            <button type="button" className="primary-action" onClick={handleRunLessonCheck}>
              Run lesson check
            </button>
            <button type="button" className="secondary-action" onClick={handlePassLesson}>
              Pass lesson
            </button>
          </div>

          <div className="lesson-brief">
            <p className="brief-label">Next unlock</p>
            <p>{nextLesson ? nextLesson.title : 'You are on the final lesson.'}</p>
            <p className="brief-status">
              {activeStatus === 'complete'
                ? 'This lesson is already passed.'
                : runPassedByLesson[activeLesson.id]
                  ? 'Lesson check is green and ready to pass.'
                  : 'Edit the workspace and run the check to continue.'}
            </p>
          </div>
        </aside>

        <main className="devspace-wrapper">
          <DevSpace
            key={activeLesson.id}
            initialFileTree={fileTree}
            onCodeChange={handleCodeChange}
            onFullscreenChange={setIsFullscreen}
          />
        </main>
      </div>
    </div>
  );
};
