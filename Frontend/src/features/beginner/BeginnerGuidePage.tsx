import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useThemeMode } from '../../theme/ThemeProvider';
import {
  BEGINNER_PROGRESS_KEY,
  beginnerGlossary,
  beginnerLessons,
  beginnerRoadmap,
  getBeginnerLessonStatus,
} from './beginnerLessons';

type LessonPanel = 'overview' | 'checklist' | 'dev-hub';

const panelLabels: Record<LessonPanel, string> = {
  overview: 'Overview',
  checklist: 'Checklist',
  'dev-hub': 'Dev Hub flow',
};

const readCompletedLessons = () => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(BEGINNER_PROGRESS_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
};

export const BeginnerGuidePage = () => {
  const navigate = useNavigate();
  const { theme } = useThemeMode();
  const [selectedLessonId, setSelectedLessonId] = useState(beginnerLessons[0].id);
  const [completedLessons] = useState<string[]>(readCompletedLessons);
  const [showEli5, setShowEli5] = useState(false);
  const [activePanel, setActivePanel] = useState<LessonPanel>('overview');
  const [feedback, setFeedback] = useState('Choose a lesson, learn the goal here, then open Dev Hub to complete the coding test.');

  const activeLessonIndex = beginnerLessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const activeLesson = beginnerLessons[activeLessonIndex] ?? beginnerLessons[0];
  const activeStatus = getBeginnerLessonStatus(activeLessonIndex, completedLessons);
  const nextLesson = beginnerLessons[activeLessonIndex + 1];
  const unlockedCount = useMemo(
    () => beginnerLessons.filter((_, index) => getBeginnerLessonStatus(index, completedLessons) !== 'locked').length,
    [completedLessons]
  );
  const completionRate = Math.round((completedLessons.length / beginnerLessons.length) * 100);

  const earnedBadges = useMemo(() => {
    const badges: string[] = [];

    if (completedLessons.length >= 1) badges.push('HTML Starter');
    if (completedLessons.length >= 2) badges.push('Semantic Builder');
    if (completedLessons.length >= 4) badges.push('CSS Layout Ready');

    return badges;
  }, [completedLessons]);

  const themeClasses =
    theme === 'dark'
      ? {
          page:
            'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.14),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#111827_55%,_#0b1120_100%)] text-white',
          panel: 'border-white/10 bg-slate-900/60 text-white',
          muted: 'text-slate-300',
          soft: 'text-slate-400',
        }
      : {
          page:
            'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_24%),linear-gradient(180deg,_#fffdf7_0%,_#fff8ef_55%,_#fff4e6_100%)] text-slate-900',
          panel: 'border-orange-200/80 bg-white/80 text-slate-900',
          muted: 'text-slate-700',
          soft: 'text-slate-500',
        };

  const handleSelectLesson = (lessonId: string) => {
    const lessonIndex = beginnerLessons.findIndex((lesson) => lesson.id === lessonId);

    if (getBeginnerLessonStatus(lessonIndex, completedLessons) === 'locked') {
      const previousLesson = beginnerLessons[lessonIndex - 1];
      setFeedback(`Finish ${previousLesson.title} in Dev Hub first to unlock this lesson.`);
      return;
    }

    setSelectedLessonId(lessonId);
    setActivePanel('overview');
    setFeedback('Lesson loaded. Review the goal, then open Dev Hub for the coding test.');
  };

  const launchDevHub = () => {
    navigate(`/workspace/beginner?lesson=${activeLesson.id}`);
  };

  return (
    <div className={`min-h-screen ${themeClasses.page}`}>
      <nav
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-orange-200/70 bg-white/80'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">Beginner section</p>
            <h1 className="mt-1 text-lg font-semibold">Interactive HTML and CSS Track</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="glow-button rounded-full px-5 py-2 text-sm font-semibold text-white">
              Back to landing
            </Link>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={`glow-panel rounded-[34px] border p-8 ${themeClasses.panel}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-sm text-orange-300">
              <span className="h-2 w-2 rounded-full bg-orange-300"></span>
              Learn here, build in Dev Hub
            </div>
            <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Beginner lessons are now guided like missions instead of static notes.
            </h2>
            <p className={`mt-6 max-w-3xl text-lg leading-8 ${themeClasses.muted}`}>
              Use this page to understand each lesson, preview the coding goal, and decide what to build. The actual
              coding test now lives in Developer Hub so practice happens in a real workspace.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#task-roadmap"
                className="glow-button rounded-2xl px-8 py-4 text-center text-base font-semibold text-white transition hover:-translate-y-1"
              >
                Explore lessons
              </a>
              <button
                onClick={launchDevHub}
                className={`rounded-2xl border px-8 py-4 text-center text-base font-semibold transition hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 hover:bg-white/10'
                    : 'border-orange-200 bg-white hover:bg-orange-50'
                }`}
              >
                Open this lesson in Dev Hub
              </button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Track progress</p>
                <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Unlocked lessons</p>
                <p className="mt-2 text-3xl font-bold">{unlockedCount}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Coding tests</p>
                <p className="mt-2 text-3xl font-bold">Dev Hub</p>
              </div>
            </div>
          </div>

          <div className={`glow-panel rounded-[34px] border p-6 ${themeClasses.panel}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.26em] ${themeClasses.soft}`}>Track rules</p>
                <h3 className="mt-2 text-2xl font-semibold">One lesson, one workspace mission</h3>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Interactive
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>How this works now</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                  Study the lesson here, switch into Dev Hub to code, run the lesson check there, and pass to unlock the next mission.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Current feedback</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>{feedback}</p>
              </div>

              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Badges earned</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {earnedBadges.length > 0 ? (
                    earnedBadges.map((badge) => (
                      <span key={badge} className="rounded-full bg-orange-400/15 px-3 py-2 text-sm font-medium text-orange-300">
                        {badge}
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${themeClasses.muted}`}>Pass your first Dev Hub lesson to earn a badge.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="task-roadmap" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Task roadmap</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">A lesson path that nudges action</h2>
            <p className={`mt-5 text-lg leading-8 ${themeClasses.muted}`}>
              Every lesson now guides the learner from understanding to practice, instead of mixing everything inside one long coding page.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {beginnerRoadmap.map((item, index) => (
              <div key={item.title} className={`glow-panel rounded-[28px] border p-6 ${themeClasses.panel}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                    Phase {index + 1}
                  </span>
                  <span className={`text-sm ${themeClasses.soft}`}>0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
                <p className={`mt-4 text-sm leading-7 ${themeClasses.muted}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Lesson ladder</p>
            <h2 className="mt-4 text-3xl font-bold">Choose the mission you want to work on</h2>
            <div className="mt-6 space-y-4">
              {beginnerLessons.map((lesson, index) => {
                const status = getBeginnerLessonStatus(index, completedLessons);
                const isSelected = selectedLessonId === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson.id)}
                    className={`w-full rounded-[24px] border p-5 text-left transition ${
                      isSelected
                        ? 'border-orange-300/40 bg-orange-400/10'
                        : theme === 'dark'
                          ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                          : 'border-orange-200 bg-white/80 hover:bg-orange-50'
                    } ${status === 'locked' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.22em] ${themeClasses.soft}`}>{lesson.stage}</p>
                        <h3 className="mt-2 text-xl font-semibold">{lesson.title}</h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          status === 'complete'
                            ? 'bg-emerald-400/15 text-emerald-400'
                            : status === 'locked'
                              ? 'bg-slate-500/15 text-slate-300'
                              : 'bg-orange-400/15 text-orange-300'
                        }`}
                      >
                        {status === 'complete' ? 'Passed' : status === 'locked' ? 'Locked' : lesson.duration}
                      </span>
                    </div>
                    <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{lesson.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Current lesson</p>
                <h2 className="mt-3 text-3xl font-bold">{activeLesson.title}</h2>
              </div>
              <button
                onClick={() => setShowEli5((current) => !current)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  theme === 'dark'
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'border-orange-200 bg-white hover:bg-orange-50'
                }`}
              >
                {showEli5 ? 'Show normal view' : "Explain like I'm 5"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {(Object.keys(panelLabels) as LessonPanel[]).map((panel) => (
                <button
                  key={panel}
                  onClick={() => setActivePanel(panel)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activePanel === panel
                      ? 'bg-orange-400 text-slate-950'
                      : theme === 'dark'
                        ? 'border border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border border-orange-200 bg-white hover:bg-orange-50'
                  }`}
                >
                  {panelLabels[panel]}
                </button>
              ))}
            </div>

            <div className={`mt-6 rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
              <p className={`text-sm ${themeClasses.soft}`}>Simple explanation</p>
              <p className={`mt-3 text-base leading-8 ${themeClasses.muted}`}>
                {showEli5 ? activeLesson.eli5 : activeLesson.analogy}
              </p>
            </div>

            {activePanel === 'overview' && (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Why developers use this</p>
                    <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.devUse}</p>
                  </div>
                  <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Checkpoint</p>
                    <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.checkpoint}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Skill focus</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeLesson.skillFocus.map((skill) => (
                        <span key={skill} className="rounded-full bg-orange-400/15 px-3 py-2 text-sm font-medium text-orange-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Mission prompt</p>
                    <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.challenge}</p>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'checklist' && (
              <div className="mt-6 space-y-4">
                <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>What to learn before coding</p>
                  <div className="mt-4 space-y-3">
                    {activeLesson.lessonPoints.map((point, index) => (
                      <div key={point} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-rose-400 text-xs font-bold text-slate-950">
                          {index + 1}
                        </span>
                        <p className={`text-sm leading-7 ${themeClasses.muted}`}>{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>Pass requirements</p>
                  <div className="mt-3 space-y-2">
                    {activeLesson.successCriteria.map((item) => (
                      <p key={item} className={`text-sm leading-7 ${themeClasses.muted}`}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'dev-hub' && (
              <div className="mt-6 space-y-4">
                <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>What you edit in Dev Hub</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeLesson.files.map((file) => (
                      <span key={file.id} className="rounded-full bg-slate-950/10 px-3 py-2 text-sm font-medium text-orange-300">
                        {file.label}
                      </span>
                    ))}
                    <span className="rounded-full bg-slate-950/10 px-3 py-2 text-sm font-medium text-orange-300">README.md</span>
                  </div>
                </div>

                <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>How the coding test works</p>
                  <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>
                    Open the lesson in Developer Hub, edit the focus file, run the lesson check, and pass it there to unlock the next lesson.
                  </p>
                  <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>
                    Required code signals: {activeLesson.expectedHints.join(', ')}.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={launchDevHub}
                className="glow-button rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
              >
                Open coding test in Dev Hub
              </button>
              <span
                className={`rounded-2xl border px-6 py-3 text-sm font-semibold ${
                  theme === 'dark' ? 'border-white/15 bg-white/5' : 'border-orange-200 bg-white'
                }`}
              >
                {activeStatus === 'complete'
                  ? 'Passed in Dev Hub'
                  : activeStatus === 'locked'
                    ? 'Locked until previous lesson is passed'
                    : nextLesson
                      ? `Next unlock: ${nextLesson.title}`
                      : 'Final lesson unlocked'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Skill dictionary</p>
            <h2 className="mt-4 text-3xl font-bold">Words you will see while building interfaces</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {beginnerGlossary.map((item) => (
                <div key={item.term} className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <h3 className="text-xl font-semibold">{item.term}</h3>
                  <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{item.plain}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">After this track</p>
              <h3 className="mt-3 text-2xl font-semibold">What this prepares you for</h3>
              <div className="mt-5 space-y-3">
                {[
                  'Building landing page sections with semantic HTML',
                  'Styling cards, forms, and onboarding screens with CSS',
                  'Reading and editing frontend markup in real projects',
                  'Moving into responsive components and JavaScript with stronger foundations',
                ].map((item) => (
                  <div key={item} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm leading-7 ${themeClasses.muted}`}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Current track focus</p>
              <h3 className="mt-3 text-2xl font-semibold">Purposeful training only</h3>
              <p className={`mt-4 text-sm leading-7 ${themeClasses.muted}`}>
                This section now teaches the concept on the guide page and pushes the actual coding test into Developer Hub for a more practical beginner flow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
