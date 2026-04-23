import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CodePracticeWorkspace,
  type PracticeFile,
  type PracticeRunResult,
} from '../../components/practice/CodePracticeWorkspace';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useThemeMode } from '../../theme/ThemeProvider';

interface LessonTask {
  id: string;
  order: number;
  title: string;
  duration: string;
  stage: 'Foundation' | 'Structure' | 'Styling' | 'Layout';
  focusFileId: string;
  summary: string;
  analogy: string;
  eli5: string;
  skillFocus: string[];
  devUse: string;
  lessonPoints: string[];
  successCriteria: string[];
  expectedHints: string[];
  challenge: string;
  previewLabel: string;
  checkpoint: string;
}

const roadmap = [
  {
    title: 'Learn structure first',
    description: 'Start with HTML so you can build the bones of real interfaces before styling them.',
  },
  {
    title: 'Style with purpose',
    description: 'Use CSS to improve readability, spacing, hierarchy, and developer-facing polish.',
  },
  {
    title: 'Unlock by shipping',
    description: 'Each task ends with a coding test. Pass it to unlock the next development skill.',
  },
];

const lessons: LessonTask[] = [
  {
    id: 'html-page-structure',
    order: 1,
    title: 'Task 1: Build a clean HTML page shell',
    duration: '10 min',
    stage: 'Foundation',
    focusFileId: 'index.html',
    summary: 'Learn the HTML elements developers use to create a readable page structure for real products.',
    analogy: 'HTML is the frame of a building. If the frame is weak, the rooms never feel right.',
    eli5: 'HTML tells the browser what each part of the page is, like title, section, or paragraph.',
    skillFocus: ['Page structure', 'Heading hierarchy', 'Readable content blocks'],
    devUse: 'Developers use this to start landing pages, dashboards, settings pages, and documentation screens.',
    lessonPoints: [
      'Use a main heading to make the page purpose obvious.',
      'Group content with semantic sections developers recognize quickly.',
      'Write text that explains what the page is supposed to do.',
    ],
    successCriteria: ['Add a hero heading', 'Add a supporting paragraph', 'Wrap the content in a <main> area'],
    expectedHints: ['<main', '<h1>', '<p>'],
    challenge: 'Turn the starter markup into a simple developer dashboard intro.',
    previewLabel: 'Your test is to shape a clean HTML page the way a developer would start a real interface.',
    checkpoint: 'You can build the first structure of a web page with HTML.',
  },
  {
    id: 'html-semantic-content',
    order: 2,
    title: 'Task 2: Organize content with semantic HTML',
    duration: '12 min',
    stage: 'Structure',
    focusFileId: 'index.html',
    summary: 'Train yourself to use semantic HTML so code stays easier to maintain and easier for teammates to read.',
    analogy: 'Semantic HTML is like labeling drawers in a workshop so every tool goes in the right place.',
    eli5: 'Semantic HTML gives each part of the page a clear job name, so people and browsers understand it.',
    skillFocus: ['Semantic tags', 'Lists for grouped information', 'Action areas'],
    devUse: 'Developers rely on this for navigation bars, feature lists, sidebars, FAQs, and product sections.',
    lessonPoints: [
      'Use tags like header, section, article, and footer to show intent.',
      'Use lists when content belongs together.',
      'Keep actions like buttons near the content they control.',
    ],
    successCriteria: ['Add a header area', 'Add a list of features', 'Add a footer note or action row'],
    expectedHints: ['<header', '<ul>', '<footer'],
    challenge: 'Build a feature summary block for a product team page.',
    previewLabel: 'Your test is to organize a small interface using semantic HTML instead of random divs.',
    checkpoint: 'You can structure content using HTML that communicates purpose clearly.',
  },
  {
    id: 'css-visual-foundation',
    order: 3,
    title: 'Task 3: Style content for readability',
    duration: '12 min',
    stage: 'Styling',
    focusFileId: 'styles.css',
    summary: 'Learn the CSS properties developers use first to make screens readable, clear, and professional.',
    analogy: 'CSS is the interior design layer. The structure stays the same, but the experience becomes usable.',
    eli5: 'CSS tells the page how to look, like colors, spacing, and text size.',
    skillFocus: ['Typography', 'Color contrast', 'Spacing'],
    devUse: 'Developers use this to make admin panels, forms, cards, and onboarding screens easier to scan.',
    lessonPoints: [
      'Start with the body because it sets the tone for the whole page.',
      'Use spacing to separate ideas clearly.',
      'Style cards so important information stands out fast.',
    ],
    successCriteria: ['Style the body', 'Style the main heading', 'Style the card container'],
    expectedHints: ['body {', 'font-family:', '.card', 'padding:'],
    challenge: 'Make the task card feel calm, clean, and readable for a teammate.',
    previewLabel: 'Your test is to style the existing HTML so it feels like a usable product screen.',
    checkpoint: 'You can use CSS to improve hierarchy and readability.',
  },
  {
    id: 'css-layout-system',
    order: 4,
    title: 'Task 4: Create a simple responsive layout',
    duration: '15 min',
    stage: 'Layout',
    focusFileId: 'styles.css',
    summary: 'Practice layout CSS that developers use constantly when building real feature pages and dashboards.',
    analogy: 'Layout CSS is the room planner. It decides where everything sits so the page feels organized.',
    eli5: 'Layout CSS tells boxes where to go so the page does not look messy.',
    skillFocus: ['Grid layout', 'Gap and alignment', 'Responsive page sections'],
    devUse: 'Developers use this for card grids, dashboards, landing page sections, and feature comparison blocks.',
    lessonPoints: [
      'Use grid to place content in a clean two-column system.',
      'Use gap instead of random margins for repeatable spacing.',
      'Round off the main UI surface so the layout feels deliberate.',
    ],
    successCriteria: ['Create a grid layout', 'Add spacing between items', 'Polish cards with border radius'],
    expectedHints: ['display: grid', 'gap:', 'border-radius:'],
    challenge: 'Turn the page into a small responsive development workspace overview.',
    previewLabel: 'Your final test is to create a layout developers would actually use as a starting point.',
    checkpoint: 'You can build a structured, styled HTML/CSS layout for development work.',
  },
];

const glossary = [
  { term: 'Semantic HTML', plain: 'HTML that says what something is, not just how it looks.' },
  { term: 'Selector', plain: 'The part of CSS that chooses which element gets styled.' },
  { term: 'Spacing', plain: 'The room around elements that keeps the interface readable.' },
  { term: 'Layout', plain: 'How sections and cards are arranged on the page.' },
];

const createLessonFiles = (lesson: LessonTask): PracticeFile[] => {
  if (lesson.id === 'html-semantic-content') {
    return [
      {
        id: 'index.html',
        label: 'index.html',
        language: 'html',
        description: 'Organize this product summary using semantic HTML tags.',
        code: `<main class="page-shell">\n  <header>\n    <h1>Team release notes</h1>\n    <p>Share the latest product improvements with the team.</p>\n  </header>\n\n  <section class="card">\n    <h2>What changed</h2>\n    <ul>\n      <li>Faster task loading</li>\n      <li>Cleaner dashboard cards</li>\n    </ul>\n  </section>\n</main>`,
      },
      {
        id: 'styles.css',
        label: 'styles.css',
        language: 'css',
        description: 'Optional styling support while you work through the HTML task.',
        code: `body {\n  font-family: "Segoe UI", sans-serif;\n}\n\n.card {\n  padding: 20px;\n}`,
      },
    ];
  }

  if (lesson.id === 'css-visual-foundation') {
    return [
      {
        id: 'index.html',
        label: 'index.html',
        language: 'html',
        description: 'The HTML is ready. Focus on styling it for clarity.',
        code: `<main class="page-shell">\n  <section class="card">\n    <p class="eyebrow">Development training</p>\n    <h1>Readable task brief</h1>\n    <p>Style this card so another developer can scan the content quickly.</p>\n  </section>\n</main>`,
      },
      {
        id: 'styles.css',
        label: 'styles.css',
        language: 'css',
        description: 'Use CSS to make the page readable and polished.',
        code: `body {\n}\n\n.card {\n}\n\nh1 {\n}\n`,
      },
    ];
  }

  if (lesson.id === 'css-layout-system') {
    return [
      {
        id: 'index.html',
        label: 'index.html',
        language: 'html',
        description: 'Turn this into a small dashboard-style layout.',
        code: `<main class="workspace">\n  <section class="card">\n    <h2>Today</h2>\n    <p>Finish the HTML and CSS path.</p>\n  </section>\n  <section class="card">\n    <h2>Next</h2>\n    <p>Move into forms and components.</p>\n  </section>\n</main>`,
      },
      {
        id: 'styles.css',
        label: 'styles.css',
        language: 'css',
        description: 'Create a clear layout using grid and spacing.',
        code: `body {\n  margin: 0;\n  padding: 32px;\n  font-family: "Segoe UI", sans-serif;\n  background: #fff7ed;\n}\n\n.workspace {\n}\n\n.card {\n  background: white;\n  padding: 24px;\n}\n`,
      },
    ];
  }

  return [
    {
      id: 'index.html',
      label: 'index.html',
      language: 'html',
      description: 'Build the first page shell using HTML only.',
      code: `<main>\n  <h1>Developer onboarding</h1>\n  <p>Build your first clean HTML structure for a real interface.</p>\n</main>`,
    },
    {
      id: 'styles.css',
      label: 'styles.css',
      language: 'css',
      description: 'Keep this file ready for later tasks when CSS becomes the focus.',
      code: `.page-shell {\n  max-width: 720px;\n}`,
    },
  ];
};

const getLessonStatus = (lessonIndex: number, completedLessons: string[]) => {
  if (completedLessons.includes(lessons[lessonIndex].id)) return 'complete';
  if (lessonIndex === 0 || completedLessons.includes(lessons[lessonIndex - 1].id)) return 'unlocked';
  return 'locked';
};

export const BeginnerGuidePage = () => {
  const { theme } = useThemeMode();
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [activeFileByLesson, setActiveFileByLesson] = useState<Record<string, string>>(
    Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson.focusFileId]))
  );
  const [filesByLesson, setFilesByLesson] = useState<Record<string, PracticeFile[]>>(
    Object.fromEntries(lessons.map((lesson) => [lesson.id, createLessonFiles(lesson)]))
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [runPassedByLesson, setRunPassedByLesson] = useState<Record<string, boolean>>({});
  const [showEli5, setShowEli5] = useState(false);
  const [feedback, setFeedback] = useState('Run the coding test after each lesson to unlock the next task.');

  const activeLessonIndex = lessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const activeLesson = lessons[activeLessonIndex] ?? lessons[0];
  const activeFileId = activeFileByLesson[activeLesson.id] ?? activeLesson.focusFileId;
  const activeFiles = filesByLesson[activeLesson.id] ?? createLessonFiles(activeLesson);
  const activeFocusFile = activeFiles.find((file) => file.id === activeLesson.focusFileId);
  const activeCode = activeFocusFile?.code ?? '';
  const activeStatus = getLessonStatus(activeLessonIndex, completedLessons);
  const nextLesson = lessons[activeLessonIndex + 1];

  const completionRate = Math.round((completedLessons.length / lessons.length) * 100);

  const earnedBadges = useMemo(() => {
    const badges: string[] = [];

    if (completedLessons.length >= 1) badges.push('HTML Starter');
    if (completedLessons.length >= 2) badges.push('Semantic Builder');
    if (completedLessons.length >= 4) badges.push('CSS Layout Ready');

    return badges;
  }, [completedLessons]);

  const unlockedCount = useMemo(
    () => lessons.filter((_, index) => getLessonStatus(index, completedLessons) !== 'locked').length,
    [completedLessons]
  );

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

  const setLessonCode = (fileId: string, value: string) => {
    setFilesByLesson((current) => ({
      ...current,
      [activeLesson.id]: (current[activeLesson.id] ?? []).map((file) =>
        file.id === fileId ? { ...file, code: value } : file
      ),
    }));
    setRunPassedByLesson((current) => ({
      ...current,
      [activeLesson.id]: false,
    }));
  };

  const handleActiveFileChange = (fileId: string) => {
    setActiveFileByLesson((current) => ({
      ...current,
      [activeLesson.id]: fileId,
    }));
    setFeedback(`Editing ${fileId}. Keep building toward the task test.`);
  };

  const handleSelectLesson = (lessonId: string) => {
    const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

    if (getLessonStatus(lessonIndex, completedLessons) === 'locked') {
      const previousLesson = lessons[lessonIndex - 1];
      setFeedback(`Finish ${previousLesson.title} to unlock this task.`);
      return;
    }

    setSelectedLessonId(lessonId);
    setFeedback('Task loaded. Read the lesson, complete the code test, and unlock the next task.');
  };

  const handlePracticeResult = (result: PracticeRunResult) => {
    if (result.status === 'error') {
      const firstError = result.errors[0];
      setRunPassedByLesson((current) => ({
        ...current,
        [activeLesson.id]: false,
      }));
      setFeedback(
        firstError?.line
          ? `Fix line ${firstError.line} first. ${firstError.message}`
          : firstError?.message || 'There is an error to fix before this task can pass.'
      );
      return;
    }

    const hasHints = activeLesson.expectedHints.every((hint) => activeCode.includes(hint));

    setRunPassedByLesson((current) => ({
      ...current,
      [activeLesson.id]: hasHints,
    }));

    setFeedback(
      hasHints
        ? 'Test run looks good. Click "Pass task test" to unlock the next lesson.'
        : `The preview ran, but this task still needs: ${activeLesson.expectedHints.join(', ')}`
    );
  };

  const handleCheckCode = () => {
    const hasHints = activeLesson.expectedHints.every((hint) => activeCode.includes(hint));

    setFeedback(
      hasHints
        ? 'Code structure is on the right track. Run the test to confirm the task passes.'
        : `Almost there. Add these pieces before testing: ${activeLesson.expectedHints.join(', ')}`
    );
  };

  const handlePassTask = () => {
    if (!runPassedByLesson[activeLesson.id]) {
      setFeedback('Run the coding test successfully first. The task only unlocks after a passing run.');
      return;
    }

    setCompletedLessons((current) =>
      current.includes(activeLesson.id) ? current : [...current, activeLesson.id]
    );

    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      setFeedback(`Task passed. ${nextLesson.title} is now unlocked.`);
      return;
    }

    setFeedback('You passed the final HTML/CSS task. This path is now complete.');
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
            <h1 className="mt-1 text-lg font-semibold">HTML and CSS Developer Track</h1>
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
              Task-based development training
            </div>
            <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Learn HTML and CSS by completing real developer tasks in order.
            </h2>
            <p className={`mt-6 max-w-3xl text-lg leading-8 ${themeClasses.muted}`}>
              This path is intentionally narrow. It trains beginner developers to build page structure, organize
              content, style readable screens, and create layouts used in real product work.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#task-roadmap"
                className="glow-button rounded-2xl px-8 py-4 text-center text-base font-semibold text-white transition hover:-translate-y-1"
              >
                View the tasks
              </a>
              <a
                href="#practice-lab"
                className={`rounded-2xl border px-8 py-4 text-center text-base font-semibold transition hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 hover:bg-white/10'
                    : 'border-orange-200 bg-white hover:bg-orange-50'
                }`}
              >
                Start the coding test
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Track progress</p>
                <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Unlocked tasks</p>
                <p className="mt-2 text-3xl font-bold">{unlockedCount}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Core skills</p>
                <p className="mt-2 text-3xl font-bold">HTML + CSS</p>
              </div>
            </div>
          </div>

          <div className={`glow-panel rounded-[34px] border p-6 ${themeClasses.panel}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.26em] ${themeClasses.soft}`}>Track rules</p>
                <h3 className="mt-2 text-2xl font-semibold">Unlock one skill at a time</h3>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Development only
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>How unlocking works</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                  Read the lesson, edit the workspace, run the coding test, and pass it before the next task opens.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>What you are not learning here</p>
                <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                  This track avoids random beginner detours. It stays focused on practical HTML and CSS for real interface development.
                </p>
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
                    <span className={`text-sm ${themeClasses.muted}`}>Pass your first task to earn a badge.</span>
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
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">A beginner path built around shipping skills</h2>
            <p className={`mt-5 text-lg leading-8 ${themeClasses.muted}`}>
              Every task builds on the last one, so beginners do not skip foundations and developers build habits that
              transfer into real project work.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {roadmap.map((item, index) => (
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
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Task ladder</p>
            <h2 className="mt-4 text-3xl font-bold">Complete tasks in sequence</h2>
            <div className="mt-6 space-y-4">
              {lessons.map((lesson, index) => {
                const status = getLessonStatus(index, completedLessons);
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

            <div className={`mt-6 rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
              <p className={`text-sm ${themeClasses.soft}`}>Simple explanation</p>
              <p className={`mt-3 text-base leading-8 ${themeClasses.muted}`}>
                {showEli5 ? activeLesson.eli5 : activeLesson.analogy}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Why developers use this</p>
                <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.devUse}</p>
              </div>
              <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                <p className={`text-sm ${themeClasses.soft}`}>Checkpoint</p>
                <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.checkpoint}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                <p className={`text-sm ${themeClasses.soft}`}>Task challenge</p>
                <p className={`mt-3 text-sm leading-7 ${themeClasses.muted}`}>{activeLesson.challenge}</p>
              </div>
            </div>

            <div className={`mt-6 rounded-[24px] border p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
              <p className={`text-sm ${themeClasses.soft}`}>What to learn before testing</p>
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
          </div>
        </div>
      </section>

      <section id="practice-lab" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Coding test</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Every lesson ends with a workspace task</h2>
            <p className={`mt-5 text-lg leading-8 ${themeClasses.muted}`}>
              The workspace is your test. Build the required HTML or CSS, run it, and pass the task to unlock the next
              lesson in the developer track.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <CodePracticeWorkspace
              title={`${activeLesson.title} test`}
              description={activeLesson.previewLabel}
              files={activeFiles}
              activeFileId={activeFileId}
              onActiveFileChange={handleActiveFileChange}
              onFileChange={setLessonCode}
              theme={theme}
              runLabel="Run task test"
              previewTitle="Live preview"
              outputTitle="Program output"
              showOutputPanel={false}
              onResultChange={handlePracticeResult}
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-sm ${themeClasses.soft}`}>Task tester</p>
                    <h3 className="mt-2 text-2xl font-semibold">Pass this lesson to move forward</h3>
                  </div>
                  <span className="rounded-full bg-orange-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                    {activeStatus === 'complete' ? 'Passed' : activeStatus === 'locked' ? 'Locked' : 'Unlocked'}
                  </span>
                </div>

                <div className={`mt-5 rounded-[24px] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>Lesson helper</p>
                  <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>{feedback}</p>
                </div>

                <div className={`mt-5 rounded-[24px] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                  <p className={`text-sm ${themeClasses.soft}`}>Pass requirements</p>
                  <div className="mt-3 space-y-2">
                    {activeLesson.successCriteria.map((item) => (
                      <p key={item} className={`text-sm leading-7 ${themeClasses.muted}`}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleCheckCode}
                    className="glow-button rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
                  >
                    Check lesson goal
                  </button>
                  <button
                    onClick={handlePassTask}
                    className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition hover:-translate-y-1 ${
                      theme === 'dark'
                        ? 'border-white/15 bg-white/5 hover:bg-white/10'
                        : 'border-orange-200 bg-white hover:bg-orange-50'
                    }`}
                  >
                    Pass task test
                  </button>
                </div>
              </div>

              <div className={`glow-panel rounded-[30px] border p-6 ${themeClasses.panel}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Developer hints</p>
                <h3 className="mt-3 text-2xl font-semibold">Build the habits teams expect</h3>
                <div className="mt-4 space-y-3">
                  <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Required code signals</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                      Include: {activeLesson.expectedHints.join(', ')}.
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Why the test exists</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                      The goal is not just to memorize syntax. It is to practice the exact HTML and CSS habits used to build interface work professionally.
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
                    <p className={`text-sm ${themeClasses.soft}`}>Next unlock</p>
                    <p className={`mt-2 text-sm leading-7 ${themeClasses.muted}`}>
                      {nextLesson ? nextLesson.title : 'You are on the final task in this track.'}
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
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">Skill dictionary</p>
            <h2 className="mt-4 text-3xl font-bold">Words you will see while building interfaces</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {glossary.map((item) => (
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
                This section now focuses on HTML and CSS for development work. It is designed to build useful frontend
                instincts before expanding into broader topics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BeginnerGuidePage;
