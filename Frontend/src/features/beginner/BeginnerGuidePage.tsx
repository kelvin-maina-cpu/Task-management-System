import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type ThemeMode = 'dark' | 'light';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  analogy: string;
  eli5: string;
  starterCode: string;
  expectedHints: string[];
  challenge: string;
  previewLabel: string;
  checkpoint: string;
}

const roadmap = [
  {
    level: 'Beginner',
    title: 'Start here',
    steps: ['What is programming?', 'Variables and basic concepts', 'HTML and CSS foundations'],
  },
  {
    level: 'Intermediate',
    title: 'Build confidence',
    steps: ['Logic with if statements', 'Loops and repetition', 'Simple JavaScript interactions'],
  },
  {
    level: 'Advanced',
    title: 'Ship small products',
    steps: ['Project planning', 'Debugging and polishing', 'Deploying your first app'],
  },
];

const lessons: Lesson[] = [
  {
    id: 'programming',
    title: 'What is Programming?',
    duration: '5 min',
    level: 'Beginner',
    summary: 'Programming is giving a computer a clear list of instructions so it can help solve a problem.',
    analogy: 'Think of programming like writing a recipe. If the steps are clear, the dish comes out right.',
    eli5: 'You tell the computer what to do, one tiny step at a time, like teaching a robot a game.',
    starterCode:
      `<h1>My first web page</h1>\n<p>I am learning to give the computer instructions.</p>`,
    expectedHints: ['<h1>', '<p>'],
    challenge: 'Write a page title and one sentence about why you want to learn coding.',
    previewLabel: 'This lesson previews your HTML like a mini browser.',
    checkpoint: 'You can explain programming as instructions for a computer.',
  },
  {
    id: 'variables',
    title: 'Variables = labeled boxes',
    duration: '7 min',
    level: 'Beginner',
    summary: 'A variable stores information so your code can remember and reuse it.',
    analogy: 'A variable is like a labeled jar in a kitchen. The label tells you what is inside.',
    eli5: 'It is a named box where your code keeps something safe until it needs it later.',
    starterCode:
      `const learnerName = "Amina";\nconst currentLevel = "Beginner";\nconsole.log(learnerName, currentLevel);`,
    expectedHints: ['const', 'console.log'],
    challenge: 'Change the name and level so the computer prints your own learning status.',
    previewLabel: 'There is no browser preview here, so feedback checks your code structure.',
    checkpoint: 'You can create a box to store data and reuse it in code.',
  },
  {
    id: 'first-project',
    title: 'Build Your First Mini Project',
    duration: '10 min',
    level: 'Beginner',
    summary: 'Small projects help you connect lessons to something real and memorable.',
    analogy: 'Learning code without projects is like learning to swim without touching water.',
    eli5: 'Tiny projects help your brain see why the lesson matters.',
    starterCode:
      `<section>\n  <h1>My Daily Goals</h1>\n  <ul>\n    <li>Learn variables</li>\n    <li>Practice HTML</li>\n    <li>Build one tiny project</li>\n  </ul>\n</section>`,
    expectedHints: ['<ul>', '<li>'],
    challenge: 'Turn this into a mini to-do list by adding at least two more tasks.',
    previewLabel: 'You can see your small project live as you edit the code.',
    checkpoint: 'You can turn a lesson into a small, visible project.',
  },
];

const starterProjects = [
  { title: 'Calculator', reason: 'Great for variables, inputs, and simple logic.' },
  { title: 'To-do list', reason: 'Perfect for loops, arrays, and daily practice.' },
  { title: 'Simple portfolio', reason: 'Builds HTML, CSS, layout, and confidence.' },
  { title: 'Weather app', reason: 'Introduces APIs once you are ready for the next step.' },
];

const glossary = [
  { term: 'Variable', plain: 'A named box that stores information.' },
  { term: 'Loop', plain: 'A way to repeat an action without writing it many times.' },
  { term: 'Function', plain: 'A reusable mini-machine that does one job.' },
  { term: 'Bug', plain: 'A mistake that makes the code behave the wrong way.' },
];

const supportOptions = [
  'Ask for help button when a concept feels confusing',
  'Comment section under each lesson for beginner questions',
  'Q&A area with common mistakes and fixes',
  'Community study group for accountability and support',
];

const getInitialCode = (lesson: Lesson) => lesson.starterCode;

export const BeginnerGuidePage = () => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [codeByLesson, setCodeByLesson] = useState<Record<string, string>>(
    Object.fromEntries(lessons.map((lesson) => [lesson.id, getInitialCode(lesson)]))
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showEli5, setShowEli5] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  const activeLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const activeCode = codeByLesson[activeLesson.id] ?? activeLesson.starterCode;

  const completionRate = Math.round((completedLessons.length / lessons.length) * 100);

  const earnedBadges = useMemo(() => {
    const badges: string[] = [];

    if (completedLessons.length >= 1) badges.push('First Code Run');
    if (completedLessons.length >= 2) badges.push('Quick Learner');
    if (completedLessons.length === lessons.length) badges.push('Beginner Path Complete');

    return badges;
  }, [completedLessons]);

  const themeClasses =
    theme === 'dark'
      ? {
          page: 'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,63,94,0.14),_transparent_26%),linear-gradient(180deg,_#0f172a_0%,_#111827_55%,_#0b1120_100%)] text-white',
          panel: 'border-white/10 bg-slate-900/60 text-white',
          muted: 'text-slate-300',
          soft: 'text-slate-400',
          editor: 'bg-slate-950 text-slate-100',
          surface: 'bg-white/[0.05]',
        }
      : {
          page: 'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_24%),linear-gradient(180deg,_#fffdf7_0%,_#fff8ef_55%,_#fff4e6_100%)] text-slate-900',
          panel: 'border-orange-200/80 bg-white/80 text-slate-900',
          muted: 'text-slate-700',
          soft: 'text-slate-500',
          editor: 'bg-white text-slate-900',
          surface: 'bg-orange-50/70',
        };

  const setLessonCode = (value: string) => {
    setCodeByLesson((current) => ({
      ...current,
      [activeLesson.id]: value,
    }));
  };

  const handleCheckCode = () => {
    const hasHints = activeLesson.expectedHints.every((hint) => activeCode.includes(hint));

    if (hasHints) {
      setFeedback(`Nice work. Checkpoint unlocked: ${activeLesson.checkpoint}`);
    } else {
      setFeedback(`Almost there. Try adding: ${activeLesson.expectedHints.join(', ')}`);
    }
  };

  const handleMarkComplete = () => {
    setCompletedLessons((current) =>
      current.includes(activeLesson.id) ? current : [...current, activeLesson.id]
    );
    setFeedback(`Lesson completed. You earned progress toward the beginner journey.`);
  };

  return (
    <div className={`min-h-screen ${themeClasses.page}`}>
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-orange-200/70 bg-white/80'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-400">Beginner section</p>
            <h1 className="mt-1 text-lg font-semibold">Start Here Learning Path</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-orange-200 bg-white hover:bg-orange-50'}`}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
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
              Zero experience required
            </div>
            <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Learn coding like a guided journey, not a confusing textbook.
            </h2>
            <p className={`mt-6 max-w-3xl text-lg leading-8 ${themeClasses.muted}`}>
              This beginner space assumes you are starting from zero. Every concept is short, visual, and followed by immediate practice so you can feel progress fast.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#start-here" className="glow-button rounded-2xl px-8 py-4 text-center text-base font-semibold text-white transition hover:-translate-y-1">
                Begin the journey
              </a>
              <a href="#practice-lab" className={`rounded-2xl border px-8 py-4 text-center text-base font-semibold transition hover:-translate-y-1 ${theme === 'dark' ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-orange-200 bg-white hover:bg-orange-50'}`}>
                Try a lesson now
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Path progress</p>
                <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Micro lessons</p>
                <p className="mt-2 text-3xl font-bold">{lessons.length}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Starter projects</p>
                <p className="mt-2 text-3xl font-bold">{starterProjects.length}</p>
              </div>
            </div>
          </div>

          <div className={`glow-panel rounded-[34px] border p-6 ${themeClasses.panel}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.26em] ${themeClasses.soft}`}>Motivation center</p>
                <h3 className="mt-2 text-2xl font-semibold">Safe, simple, and encouraging</h3>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Beginner ready
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Current streak</p>
                <p className="mt-2 text-2xl font-bold">1 day</p>
                <p className={`mt-2 text-sm ${themeClasses.muted}`}>Show up today and your streak begins.</p>
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
                    <span className={`text-sm ${themeClasses.muted}`}>Complete your first lesson to earn a badge.</span>
                  )}
                </div>
              </div>

              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>From zero mindset</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                  No jargon required. When a hard term appears, this page explains it in plain language right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="start-here" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Start here</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">A clear roadmap from beginner to builder</h2>
            <p className={`mt-5 text-lg leading-8 ${themeClasses.muted}`}>
              Beginners get overwhelmed when everything appears at once. This path keeps the next step obvious so the experience feels like progress in a game.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {roadmap.map((stage, stageIndex) => (
              <div key={stage.level} className={`glow-panel rounded-[28px] border p-6 ${themeClasses.panel}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                    {stage.level}
                  </span>
                  <span className={`text-sm ${themeClasses.soft}`}>0{stageIndex + 1}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{stage.title}</h3>
                <div className="mt-5 space-y-3">
                  {stage.steps.map((step, index) => (
                    <div key={step} className={`flex items-start gap-3 rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-300 to-rose-400 text-xs font-bold text-slate-950">
                        {index + 1}
                      </span>
                      <p className={`text-sm leading-7 ${themeClasses.muted}`}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Micro learning</p>
            <h2 className="mt-4 text-3xl font-bold">Quick lessons you can finish fast</h2>
            <div className="mt-6 space-y-4">
              {lessons.map((lesson) => {
                const completed = completedLessons.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setFeedback('');
                    }}
                    className={`w-full rounded-[24px] border p-5 text-left transition ${
                      selectedLessonId === lesson.id
                        ? 'border-orange-300/40 bg-orange-400/10'
                        : theme === 'dark'
                          ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                          : 'border-orange-200 bg-white/80 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.22em] ${themeClasses.soft}`}>{lesson.level}</p>
                        <h3 className="mt-2 text-xl font-semibold">{lesson.title}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${completed ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-slate-300'}`}>
                        {completed ? 'Complete' : lesson.duration}
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
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Visual explanation</p>
                <h2 className="mt-3 text-3xl font-bold">{activeLesson.title}</h2>
              </div>
              <button
                onClick={() => setShowEli5((current) => !current)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-orange-200 bg-white hover:bg-orange-50'}`}
              >
                {showEli5 ? 'Show normal view' : 'Explain like I’m 5'}
              </button>
            </div>

            <div className={`mt-6 rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
              <p className={`text-sm ${themeClasses.soft}`}>Simple explanation</p>
              <p className={`mt-3 text-base leading-8 ${themeClasses.muted}`}>
                {showEli5 ? activeLesson.eli5 : activeLesson.analogy}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Checkpoint</p>
                <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.checkpoint}</p>
              </div>
              <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Challenge</p>
                <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.challenge}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="practice-lab" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Interactive learning</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Every concept includes immediate practice</h2>
            <p className={`mt-5 text-lg leading-8 ${themeClasses.muted}`}>
              Read a small idea, try it yourself, then get instant feedback. This keeps momentum high and makes learning feel active.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${themeClasses.soft}`}>Mini code editor</p>
                  <h3 className="mt-2 text-2xl font-semibold">Try it yourself</h3>
                </div>
                <span className="rounded-full bg-orange-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                  {activeLesson.duration}
                </span>
              </div>

              <p className={`mt-4 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.previewLabel}</p>

              <textarea
                value={activeCode}
                onChange={(e) => setLessonCode(e.target.value)}
                className={`mt-5 min-h-[260px] w-full rounded-[24px] border border-white/10 p-5 font-mono text-sm leading-7 outline-none transition focus:border-orange-300/40 focus:ring-2 focus:ring-orange-300/20 ${themeClasses.editor}`}
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleCheckCode}
                  className="glow-button rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
                >
                  Check my work
                </button>
                <button
                  onClick={handleMarkComplete}
                  className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:-translate-y-1 ${theme === 'dark' ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-orange-200 bg-white hover:bg-orange-50'}`}
                >
                  Mark checkpoint complete
                </button>
              </div>

              <div className={`mt-5 rounded-[24px] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Instant feedback</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                  {feedback || 'Your helper will show simple, encouraging feedback here after you check your work.'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Live preview</p>
                <h3 className="mt-3 text-2xl font-semibold">See your result instantly</h3>
                <div className={`mt-5 overflow-hidden rounded-[24px] border ${theme === 'dark' ? 'border-white/10 bg-white' : 'border-orange-200 bg-white'}`}>
                  <iframe
                    title="Beginner live preview"
                    srcDoc={activeCode}
                    className="h-[280px] w-full bg-white"
                  />
                </div>
              </div>

              <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Error helper</p>
                <h3 className="mt-3 text-2xl font-semibold">Gentle corrections</h3>
                <div className="mt-4 space-y-3">
                  <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Example helper</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                      “You forgot one of these: {activeLesson.expectedHints.join(', ')}. Add it and check again.”
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Why this matters</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                      Immediate feedback removes fear and helps beginners fix mistakes without feeling lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Project-based learning</p>
            <h2 className="mt-4 text-3xl font-bold">Tiny projects that make lessons feel real</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {starterProjects.map((project) => (
                <div key={project.title} className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{project.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Glossary</p>
              <h3 className="mt-3 text-2xl font-semibold">Explain hard words instantly</h3>
              <div className="mt-5 space-y-3">
                {glossary.map((item) => (
                  <div key={item.term} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className="font-semibold">{item.term}</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>{item.plain}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Support</p>
              <h3 className="mt-3 text-2xl font-semibold">Help when you get stuck</h3>
              <div className="mt-5 space-y-3">
                {supportOptions.map((item) => (
                  <div key={item} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm leading-7 ${themeClasses.muted}`}>{item}</p>
                  </div>
                ))}
              </div>

              <button className="glow-button mt-5 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1">
                Ask for help
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeginnerGuidePage;
