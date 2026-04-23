import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { LandingActionButton } from './LandingActionButton';
import { ThemeToggle } from '../../components/ThemeToggle';

const quickActions = [
  {
    title: 'Start learning',
    description: 'Begin with simple explanations of how software development works.',
    toAuthenticated: '/beginner',
    toGuest: '/beginner',
  },
  {
    title: 'View dashboard',
    description: 'Track your progress and continue from where you stopped.',
    toAuthenticated: '/dashboard',
    toGuest: '/signup',
  },
  {
    title: 'Explore projects',
    description: 'Practice with guided projects and technology suggestions.',
    toAuthenticated: '/projects/suggestions',
    toGuest: '/login',
  },
];

const learningSteps = [
  {
    title: 'What is development?',
    description:
      'Understand what developers do and how websites, apps, databases, and APIs work together.',
  },
  {
    title: 'Learn the basics',
    description:
      'Study HTML, CSS, JavaScript, TypeScript, Git, and other core tools in a simple order.',
  },
  {
    title: 'Move into frameworks',
    description:
      'After the basics, continue into React, Node.js, Express, and full-stack project building.',
  },
];

const technologyGroups = [
  'HTML and page structure',
  'CSS and responsive design',
  'JavaScript and TypeScript',
  'Git and teamwork workflow',
  'React and frontend structure',
  'Node.js and backend APIs',
  'Databases and data storage',
  'Testing and deployment basics',
];

const labHighlights = [
  'Project suggestions based on your learning level',
  'Technology recommendations before you start building',
  'Workspaces for beginner and senior practice',
  'A clearer path from theory to real projects',
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
    <div className="theme-page">
      <nav className="theme-surface-strong sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 text-sm font-black text-slate-950">
              DH
            </span>
            <div>
              <p className="text-lg font-bold">Developer Hub</p>
              <p className="theme-soft text-xs uppercase tracking-[0.24em]">Learn. Build. Grow.</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
            <a href="#journey" className="theme-soft rounded-full px-4 py-2 transition hover:bg-orange-50 hover:text-slate-900">
              Journey
            </a>
            <a
              href="#technologies"
              className="theme-soft rounded-full px-4 py-2 transition hover:bg-orange-50 hover:text-slate-900"
            >
              Technologies
            </a>
            <a href="#lab" className="theme-soft rounded-full px-4 py-2 transition hover:bg-orange-50 hover:text-slate-900">
              Lab
            </a>
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <span className="theme-subcard theme-muted rounded-full border px-4 py-2">{user?.name}</span>
                <LandingActionButton onClick={handleLogout} size="sm">
                  Logout
                </LandingActionButton>
              </>
            ) : (
              <>
                <LandingActionButton to="/login" size="sm">
                  Login
                </LandingActionButton>
                <LandingActionButton to="/signup" size="sm">
                  Sign Up
                </LandingActionButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
              Beginner-friendly learning path for web development
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Learn development in a simpler, clearer way.
            </h1>

            <p className="theme-muted mt-5 max-w-2xl text-lg leading-8">
              Developer Hub helps beginners understand the theory first, then move into tools, frameworks, and real
              project practice without feeling overwhelmed.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LandingActionButton to="/beginner" size="lg" className="justify-center">
                Start as a Beginner
              </LandingActionButton>
              <LandingActionButton to={isAuthenticated ? '/projects/suggestions' : '/login'} size="lg" className="justify-center">
                {isAuthenticated ? 'Open Project Studio' : 'Continue Learning'}
              </LandingActionButton>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {quickActions.map((item) => (
                <Link
                  key={item.title}
                  to={isAuthenticated ? item.toAuthenticated : item.toGuest}
                  className="theme-card theme-card-hover rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Quick access</p>
                  <h2 className="mt-3 text-xl font-semibold">{item.title}</h2>
                  <p className="theme-muted mt-3 text-sm leading-6">{item.description}</p>
                </Link>
              ))}
            </div>

            <div className="theme-card mt-8 rounded-3xl border p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Theory first</p>
              <h2 className="mt-3 text-2xl font-bold">What you will understand before you build</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {learningSteps.map((step, index) => (
                  <div key={step.title} className="theme-subcard rounded-2xl border p-4">
                    <p className="text-sm font-semibold text-orange-600">Step {index + 1}</p>
                    <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                    <p className="theme-muted mt-2 text-sm leading-6">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="theme-card rounded-[2rem] border p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Simple roadmap</p>
            <h2 className="mt-3 text-3xl font-bold">A clear path from theory to practice</h2>
            <div className="mt-6 space-y-4">
              {learningSteps.map((step, index) => (
                <div key={step.title} className="theme-subcard rounded-2xl border p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 font-bold text-orange-700">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="theme-muted mt-2 text-sm leading-6">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-orange-300">Next step</p>
              <p className="mt-3 text-base leading-7 text-slate-200">
                After learning the theory, you can move into guided workspaces, projects, and more advanced developer
                tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="theme-card mx-auto max-w-6xl rounded-[2rem] border p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Learning journey</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The platform is arranged in a beginner-friendly order</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {learningSteps.map((step) => (
              <div key={step.title} className="theme-subcard rounded-2xl border p-5">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="theme-muted mt-3 text-sm leading-6">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technologies" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Technologies</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">See the main tools before combining them into a stack</h2>
            <p className="theme-muted mt-4 text-lg leading-8">
              Each topic is easier to understand when it is introduced one by one instead of all at once.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {technologyGroups.map((item) => (
              <div key={item} className="theme-card rounded-2xl border p-4 text-sm font-medium shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="lab" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Practice and lab</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">When you are ready, move from theory into building</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            The lab area keeps the learning path simple while also giving you room to explore projects, compare tools,
            and practice with more advanced workflows.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {labHighlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="theme-card mx-auto max-w-4xl rounded-[2rem] border p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Ready to begin?</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Start with the basics, then grow into projects</h2>
          <p className="theme-muted mx-auto mt-4 max-w-2xl text-lg leading-8">
            This landing page is now focused on helping new learners understand where to go first and what each section
            means.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LandingActionButton to={isAuthenticated ? '/dashboard' : '/signup'} size="lg" className="justify-center">
              {isAuthenticated ? 'Go to Dashboard' : 'Create Account'}
            </LandingActionButton>
            <LandingActionButton to={isAuthenticated ? '/projects/suggestions' : '/login'} size="lg" className="justify-center">
              {isAuthenticated ? 'View Projects' : 'Sign In'}
            </LandingActionButton>
          </div>
        </div>
      </section>
    </div>
  );
};
