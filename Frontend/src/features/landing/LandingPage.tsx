import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';

const learningStages = [
  {
    title: 'Understand development',
    description:
      'Start with what software development means, how products are built, and how frontend, backend, APIs, and databases connect.',
    level: 'Beginner track',
  },
  {
    title: 'Learn the core technologies',
    description:
      'Move through HTML, CSS, JavaScript, TypeScript, Git, REST APIs, databases, testing, and clean architecture foundations.',
    level: 'Core systems',
  },
  {
    title: 'Upgrade into frameworks and stacks',
    description:
      'Progress into React, Node.js, Express, Tailwind, Next.js, and full-stack workflows built for modern web and app products.',
    level: 'Framework path',
  },
  {
    title: 'Build inside the senior lab',
    description:
      'Use project workspaces, guidance tools, stack recommendations, and collaboration boards to prototype like an experienced team.',
    level: 'Advanced lab',
  },
];

const technologyPillars = [
  'HTML and semantic structure',
  'CSS, responsive design, and UI systems',
  'JavaScript and TypeScript',
  'Git, GitHub, and team workflows',
  'React, routing, and state patterns',
  'Node.js, Express, and APIs',
  'SQL, MongoDB, and data modeling',
  'Testing, deployment, and scaling',
];

const learningModes = [
  {
    title: 'Beginner guide',
    description:
      'Friendly onboarding that explains concepts in plain language before you touch frameworks.',
  },
  {
    title: 'Technology map',
    description:
      'A practical overview of the tools used in real product teams and where each one fits.',
  },
  {
    title: 'Framework upgrade',
    description:
      'A structured path from fundamentals into modern app and web development stacks.',
  },
  {
    title: 'Senior developer lab',
    description:
      'A space for architecture decisions, project planning, experimentation, and collaboration.',
  },
];

const labHighlights = [
  'AI-guided project suggestions based on skill level and goals',
  'Technology recommendations for app and web development projects',
  'Workspace and collaboration tools for team-based delivery',
  'A roadmap that helps juniors learn while seniors prototype faster',
];

const featureLinks = [
  {
    title: 'Beginner Start Here',
    description: 'Open the guided roadmap with quick lessons, progress, and practice.',
    toAuthenticated: '/beginner',
    toGuest: '/beginner',
  },
  {
    title: 'Learning Dashboard',
    description: 'Track progress, revisit concepts, and continue your development path.',
    toAuthenticated: '/dashboard',
    toGuest: '/signup',
  },
  {
    title: 'Project Studio',
    description: 'Jump into templates, stack ideas, and hands-on web or app projects.',
    toAuthenticated: '/projects/suggestions',
    toGuest: '/login',
  },
  {
    title: 'Senior Lab',
    description: 'Move into architecture, system thinking, and guided team workflows.',
    anchor: '#lab',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.2),_transparent_24%),linear-gradient(180deg,_#0f172a_0%,_#111827_55%,_#0b1120_100%)] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-sm font-black text-slate-950 shadow-lg shadow-orange-950/40">
              DH
            </span>
            <div>
              <p className="text-lg font-semibold tracking-wide">Developer Hub</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Learn. Build. Lead.</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#journey" className="text-sm text-slate-300 transition-colors hover:text-white">
              Journey
            </a>
            <a href="#technologies" className="text-sm text-slate-300 transition-colors hover:text-white">
              Technologies
            </a>
            <a href="#lab" className="text-sm text-slate-300 transition-colors hover:text-white">
              Senior Lab
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm text-slate-200 transition-colors hover:text-white">
                  Dashboard
                </Link>
                <Link to="/projects/suggestions" className="text-sm text-slate-200 transition-colors hover:text-white">
                  Project Studio
                </Link>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-slate-200 transition-colors hover:text-white">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Join the Hub
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-4 pb-16 pt-30 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.16),_transparent_38%)]"></div>
        <div className="pointer-events-none absolute left-[8%] top-40 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute right-[10%] top-28 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl"></div>
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm text-orange-100">
              <span className="h-2 w-2 rounded-full bg-orange-300"></span>
              Learning guide for developers and a lab hub for senior builders
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl xl:text-[5.5rem]">
              Learn development,
              <br />
              build with modern
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                {' '}frameworks and stacks
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
              Developer Hub introduces what development is for beginners, explains the technologies behind real products,
              and then levels learners up into frameworks, stacks, and collaborative app and web delivery.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/beginner"
                className="glow-button rounded-2xl px-8 py-4 text-center text-base font-semibold text-white transition hover:-translate-y-1"
              >
                Begin Here
              </Link>
              <Link
                to={isAuthenticated ? '/projects/suggestions' : '/login'}
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-center text-base font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-white/10"
              >
                {isAuthenticated ? 'Explore Project Studio' : 'Continue Your Progress'}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Beginner onboarding</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Framework upgrades</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Web + app projects</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Senior lab workflows</span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="glow-panel rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Learning flow</p>
                <p className="mt-2 text-xl font-semibold">Basics to frameworks</p>
              </div>
              <div className="glow-panel rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Project focus</p>
                <p className="mt-2 text-xl font-semibold">Web and app development</p>
              </div>
              <div className="glow-panel rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-sm text-slate-400">Advanced mode</p>
                <p className="mt-2 text-xl font-semibold">Senior lab workflows</p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {featureLinks.map((item) =>
                item.anchor ? (
                  <a
                    key={item.title}
                    href={item.anchor}
                    className="glow-panel rounded-[26px] border border-white/10 bg-slate-950/45 p-5 transition hover:-translate-y-1 hover:border-orange-300/30"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-200">Navigate</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                  </a>
                ) : (
                  <Link
                    key={item.title}
                    to={isAuthenticated ? item.toAuthenticated ?? '/' : item.toGuest ?? '/'}
                    className="glow-panel rounded-[26px] border border-white/10 bg-slate-950/45 p-5 transition hover:-translate-y-1 hover:border-orange-300/30"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-200">Navigate</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 hidden h-32 w-32 rounded-full bg-orange-500/20 blur-3xl lg:block"></div>
            <div className="absolute -right-8 bottom-8 hidden h-40 w-40 rounded-full bg-amber-300/15 blur-3xl lg:block"></div>
            <div className="glow-panel relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent"></div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Spotlight board</p>
                  <h2 className="mt-2 text-2xl font-semibold">Structured growth with modern navigation</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-6 rounded-[24px] border border-orange-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(244,63,94,0.1),rgba(15,23,42,0.88))] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-orange-100">Fast access</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/signup'}
                    className="glow-button rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:-translate-y-1"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to={isAuthenticated ? '/projects/suggestions' : '/login'}
                    className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Open Studio
                  </Link>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {learningStages.map((stage, index) => (
                  <div
                    key={stage.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-orange-300/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-rose-500 font-bold text-slate-950">
                        0{index + 1}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{stage.level}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{stage.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Learning journey</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              A guided path that makes development less intimidating
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The experience is designed to introduce beginners to the meaning of development, then steadily guide them
              toward frameworks, stack decisions, and product-level thinking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {learningModes.map((mode) => (
              <div key={mode.title} className="rounded-[28px] border border-white/10 bg-slate-900/45 p-6 backdrop-blur-sm">
                <div className="mb-5 h-1.5 w-14 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400"></div>
                <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{mode.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technologies" className="border-y border-white/10 bg-slate-950/45 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Technologies used</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Learn the tools behind modern software before combining them into stacks
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Beginners can understand what each technology does on its own, while more advanced users can compare where
              each tool belongs in a production workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {technologyPillars.map((pillar) => (
              <div
                key={pillar}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-medium text-slate-100 shadow-lg shadow-slate-950/20"
              >
                {pillar}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lab" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.09),rgba(244,63,94,0.08),rgba(15,23,42,0.96))] p-8 shadow-2xl shadow-slate-950/50 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Senior developer lab</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Keep the UI beginner-friendly while still useful for senior engineers
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                The lab side of the platform supports experimentation, project planning, architecture thinking, and
                stack comparison for developers who want more than a basic tutorial site.
              </p>

              <div className="mt-8 space-y-4">
                {labHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-amber-300 to-rose-400"></span>
                    <p className="text-sm leading-7 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Framework upgrade map</p>
                <div className="mt-5 grid gap-3">
                  {['React for interfaces', 'Node.js and Express for APIs', 'Tailwind for UI systems', 'Next.js and full-stack patterns'].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm text-slate-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Built for outcomes</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.05] p-4">
                    <p className="text-3xl font-bold text-white">01</p>
                    <p className="mt-2 text-sm text-slate-300">Understand concepts before tools.</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.05] p-4">
                    <p className="text-3xl font-bold text-white">02</p>
                    <p className="mt-2 text-sm text-slate-300">Choose technologies with context.</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.05] p-4">
                    <p className="text-3xl font-bold text-white">03</p>
                    <p className="mt-2 text-sm text-slate-300">Ship projects using real stacks.</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.05] p-4">
                    <p className="text-3xl font-bold text-white">04</p>
                    <p className="mt-2 text-sm text-slate-300">Collaborate like a senior team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-slate-900/60 px-8 py-12 text-center shadow-xl shadow-slate-950/40 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Start here</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Build confidence first, then build products
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Use the platform as a learning guide if you are new to development, or as a project lab if you already think
            in systems, frameworks, and delivery workflows.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-orange-100"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Your Account'}
            </Link>
            <Link
              to={isAuthenticated ? '/projects/suggestions' : '/login'}
              className="rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {isAuthenticated ? 'Open Projects' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-400">
        <p>Developer Hub helps beginners learn development and helps senior developers explore modern stacks and product workflows.</p>
      </footer>
    </div>
  );
};
