import type { PracticeFile } from '../../components/practice/CodePracticeWorkspace';
import type { FileItem } from '../../components/devspace/DevSpace';

export interface BeginnerLesson {
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
  files: PracticeFile[];
}

export const BEGINNER_PROGRESS_KEY = 'beginner-dev-hub-progress';

export const beginnerRoadmap = [
  {
    title: 'Learn structure first',
    description: 'Start with HTML so you can build the bones of real interfaces before styling them.',
  },
  {
    title: 'Practice in context',
    description: 'Use the lesson guide to understand the task, then switch into Dev Hub to build it.',
  },
  {
    title: 'Unlock by shipping',
    description: 'Each lesson is checked inside Dev Hub so progress comes from doing the work.',
  },
] as const;

export const beginnerGlossary = [
  { term: 'Semantic HTML', plain: 'HTML that says what something is, not just how it looks.' },
  { term: 'Selector', plain: 'The part of CSS that chooses which element gets styled.' },
  { term: 'Spacing', plain: 'The room around elements that keeps the interface readable.' },
  { term: 'Layout', plain: 'How sections and cards are arranged on the page.' },
] as const;

export const beginnerLessons: BeginnerLesson[] = [
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
    files: [
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
    ],
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
    files: [
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
    ],
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
    files: [
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
    ],
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
    files: [
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
    ],
  },
];

export const getBeginnerLessonStatus = (lessonIndex: number, completedLessons: string[]) => {
  if (completedLessons.includes(beginnerLessons[lessonIndex].id)) return 'complete';
  if (lessonIndex === 0 || completedLessons.includes(beginnerLessons[lessonIndex - 1].id)) return 'unlocked';
  return 'locked';
};

export const createBeginnerWorkspaceTree = (lessonId: string, filesOverride?: PracticeFile[]): FileItem => {
  const lesson = beginnerLessons.find((item) => item.id === lessonId) ?? beginnerLessons[0];
  const files = filesOverride ?? lesson.files;

  return {
    name: lesson.id,
    type: 'folder',
    children: [
      ...files.map((file) => ({
        name: file.label,
        type: 'file' as const,
        content: file.code,
      })),
      {
        name: 'README.md',
        type: 'file',
        content: `# ${lesson.title}

## Mission
${lesson.challenge}

## What to practice
${lesson.lessonPoints.map((point) => `- ${point}`).join('\n')}

## Pass checklist
${lesson.successCriteria.map((item) => `- ${item}`).join('\n')}

## Required code signals
${lesson.expectedHints.map((hint) => `- ${hint}`).join('\n')}
`,
      },
    ],
  };
};

export const createBeginnerWorkspaceState = () =>
  Object.fromEntries(beginnerLessons.map((lesson) => [lesson.id, lesson.files])) as Record<string, PracticeFile[]>;
