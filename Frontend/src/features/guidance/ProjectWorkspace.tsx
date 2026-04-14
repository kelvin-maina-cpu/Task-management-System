import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CodePracticeWorkspace,
  type PracticeFile,
  type PracticeRunResult,
} from '../../components/practice/CodePracticeWorkspace';
import { useGetProjectByIdQuery, useGetMyProjectsQuery } from '../projects/projectsApi';
import { AIChat } from './AIChat';
import { MentorMatching } from './MentorMatching';
import { ProgressTracker } from './ProgressTracker';

type TabType = 'code' | 'ai' | 'mentor' | 'progress';

const createWorkspaceTemplates = (projectTitle: string): PracticeFile[] => [
  {
    id: 'index.html',
    label: 'index.html',
    language: 'html',
    description: 'Structure the interface and connect classes or elements for your prototype.',
    code: `<section class="card workspace-card">\n  <span class="pill">Prototype</span>\n  <h1>${projectTitle}</h1>\n  <p>Sketch the interface, copy, and states for your next milestone here.</p>\n  <button id="cta">Review build</button>\n  <div id="status"></div>\n</section>`,
  },
  {
    id: 'styles.css',
    label: 'styles.css',
    language: 'css',
    description: 'Style the current prototype the way you would in a standard online editor.',
    code: `.workspace-card {\n  border-radius: 28px;\n  background: linear-gradient(160deg, #fff7ed, #ffffff);\n  border: 1px solid rgba(249, 115, 22, 0.18);\n}\n\n.workspace-card h1 {\n  margin-top: 18px;\n  font-size: 2rem;\n}\n\nbutton {\n  background: #ea580c;\n  color: white;\n  border: 0;\n  border-radius: 999px;\n  padding: 0.8rem 1.1rem;\n}\n\n#status {\n  margin-top: 16px;\n  color: #9a3412;\n}`,
  },
  {
    id: 'script.js',
    label: 'script.js',
    language: 'javascript',
    description: 'Run browser-side behavior and inspect console output below.',
    code: `const cta = document.getElementById('cta');\nconst status = document.getElementById('status');\n\nconsole.log('Workspace ready for ${projectTitle}');\n\nif (cta && status) {\n  cta.addEventListener('click', () => {\n    status.textContent = 'Review queued for the next milestone.';\n    console.log('Review button clicked');\n  });\n}`,
  },
  {
    id: 'config.json',
    label: 'config.json',
    language: 'json',
    description: 'Validate config, fixtures, and structured payloads.',
    code: `{\n  "project": "${projectTitle}",\n  "status": "active",\n  "stack": ["frontend", "backend"],\n  "needsReview": false\n}`,
  },
];

export const ProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useGetProjectByIdQuery(projectId || '');
  const { data: myProjects } = useGetMyProjectsQuery();
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [activeFileId, setActiveFileId] = useState('script.js');
  const [lastRunResult, setLastRunResult] = useState<PracticeRunResult | null>(null);
  const [templatesHydrated, setTemplatesHydrated] = useState(false);

  const workspaceTemplates = useMemo(
    () => createWorkspaceTemplates(project?.title || 'Project Workspace'),
    [project?.title]
  );

  const [workspaceFiles, setWorkspaceFiles] = useState<PracticeFile[]>(
    createWorkspaceTemplates('Project Workspace')
  );

  useEffect(() => {
    if (!project?.title || templatesHydrated) return;

    setWorkspaceFiles(createWorkspaceTemplates(project.title));
    setTemplatesHydrated(true);
  }, [project?.title, templatesHydrated]);

  if (isLoading || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const enrollment = myProjects?.find((entry) => entry._id === projectId);
  const currentFile = workspaceFiles.find((file) => file.id === activeFileId)?.label || 'script.js';

  const tabs = [
    { id: 'code' as TabType, label: 'Workspace' },
    { id: 'ai' as TabType, label: 'AI Assistant' },
    { id: 'mentor' as TabType, label: 'Mentor' },
    { id: 'progress' as TabType, label: 'Progress' },
  ];

  const runStatusLabel =
    lastRunResult?.status === 'error'
      ? 'Needs fixes'
      : lastRunResult?.status === 'success'
        ? 'Runnable'
        : 'Ready';

  const handleFileChange = (fileId: string, value: string) => {
    setWorkspaceFiles((current) =>
      current.map((file) => (file.id === fileId ? { ...file, code: value } : file))
    );
  };

  const handleResetSnippet = () => {
    setWorkspaceFiles(workspaceTemplates);
  };

  return (
    <div className="flex h-screen flex-col bg-[linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_48%,_#e0f2fe_100%)]">
      <header className="border-b border-slate-200/80 bg-white/85 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-500">Senior workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Milestone {((enrollment as { currentMilestone?: number } | undefined)?.currentMilestone || 0) + 1} of{' '}
              {project.milestones?.length || 0}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {(enrollment as { chosenStack?: { name?: string } } | undefined)?.chosenStack?.name || 'No stack selected'}
            </span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${runStatusLabel === 'Needs fixes' ? 'bg-rose-100 text-rose-700' : runStatusLabel === 'Runnable' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
              {runStatusLabel}
            </span>
            <button
              onClick={handleResetSnippet}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset snippet
            </button>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
              Submit for Review
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-auto p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'code' ? (
            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active file</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{currentFile}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                      Edit multiple files, run them together, and use the highlighted errors to tighten the next iteration fast.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    Standard editor mode
                  </span>
                </div>
              </div>

              <CodePracticeWorkspace
                title="Project practice runner"
                description="Use this lab like a standard online editor with separate HTML, CSS, JavaScript, and config tabs that run together."
                files={workspaceFiles}
                activeFileId={activeFileId}
                onActiveFileChange={setActiveFileId}
                onFileChange={handleFileChange}
                theme="light"
                runLabel="Run workspace code"
                previewTitle="Rendered result"
                outputTitle="Console and validation output"
                onResultChange={setLastRunResult}
              />
            </div>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <AIChat projectId={projectId || ''} currentFile={currentFile} />
            </div>
          ) : null}

          {activeTab === 'mentor' ? (
            <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <MentorMatching projectId={projectId || ''} />
            </div>
          ) : null}

          {activeTab === 'progress' ? (
            <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <ProgressTracker projectId={projectId || ''} />
            </div>
          ) : null}
        </div>

        <aside className="hidden w-[360px] shrink-0 border-l border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl xl:block">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Workspace mode</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Run and inspect</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This lab is optimized for fast browser-safe experiments before you promote code into your project files.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Supported languages</p>
              <div className="mt-3 space-y-3">
                {workspaceFiles.map((file) => (
                  <div key={file.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="font-medium text-slate-900">{file.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{file.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Latest run</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {lastRunResult?.summary || 'Run the current snippet to see status and error details here.'}
              </p>
              {lastRunResult?.errors.length ? (
                <div className="mt-3 space-y-2">
                  {lastRunResult.errors.map((error, index) => (
                    <div key={`${error.message}-${index}`} className="rounded-2xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                      {error.line ? `Line ${error.line}: ` : ''}
                      {error.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
