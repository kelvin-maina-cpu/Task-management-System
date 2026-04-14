import { useEffect, useMemo, useRef, useState } from 'react';

export type PracticeLanguage = 'html' | 'javascript' | 'json' | 'css';

export interface PracticeFile {
  id: string;
  label: string;
  language: PracticeLanguage;
  code: string;
  description?: string;
}

export interface PracticeError {
  fileId?: string;
  line?: number;
  column?: number;
  message: string;
}

export interface PracticeRunResult {
  status: 'idle' | 'success' | 'error';
  summary: string;
  outputLines: string[];
  errors: PracticeError[];
  previewDoc?: string;
}

interface CodePracticeWorkspaceProps {
  title: string;
  description: string;
  files: PracticeFile[];
  activeFileId: string;
  onActiveFileChange: (fileId: string) => void;
  onFileChange: (fileId: string, value: string) => void;
  theme?: 'dark' | 'light';
  runLabel?: string;
  previewTitle?: string;
  outputTitle?: string;
  showOutputPanel?: boolean;
  onResultChange?: (result: PracticeRunResult) => void;
}

const FALLBACK_PREVIEW = `<!doctype html>
<html>
  <body style="font-family: Segoe UI, sans-serif; background: #fff7ed; color: #7c2d12; padding: 24px;">
    <h1 style="margin: 0 0 12px;">No preview yet</h1>
    <p style="margin: 0;">Run the editor to render the current files.</p>
  </body>
</html>`;

const DEFAULT_HTML = `<main class="card">
  <span class="pill">Preview</span>
  <h1>Online editor</h1>
  <p>Use the file tabs to build your output.</p>
</main>`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const getLineFromStack = (stack?: string) => {
  if (!stack) return undefined;

  const match = stack.match(/practice\.(?:js|json):(\d+):(\d+)/i) ?? stack.match(/<anonymous>:(\d+):(\d+)/i);

  if (!match) return undefined;

  const line = Number(match[1]);
  const column = Number(match[2]);

  if (Number.isNaN(line) || Number.isNaN(column)) return undefined;

  return {
    line: Math.max(line - 1, 1),
    column,
  };
};

const getJsonErrorLocation = (message: string, code: string) => {
  const positionMatch = message.match(/position\s+(\d+)/i);

  if (!positionMatch) return undefined;

  const position = Number(positionMatch[1]);

  if (Number.isNaN(position)) return undefined;

  const snippet = code.slice(0, position);
  const lines = snippet.split('\n');

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
};

const highlightSyntax = (code: string, language: PracticeLanguage, errorLines: Set<number>) => {
  const applyLanguageTokens = (line: string) => {
    if (language === 'javascript') {
      return line
        .replace(
          /\b(const|let|var|function|return|if|else|for|while|try|catch|throw|new|class|import|export|default|async|await)\b/g,
          '<span class="practice-token-keyword">$1</span>'
        )
        .replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="practice-token-string">$1</span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="practice-token-number">$1</span>')
        .replace(/(\/\/.*)$/g, '<span class="practice-token-comment">$1</span>');
    }

    if (language === 'json') {
      return line
        .replace(/("(?:\\.|[^"])*")(\s*:)/g, '<span class="practice-token-key">$1</span>$2')
        .replace(/:\s*("(?:\\.|[^"])*")/g, ': <span class="practice-token-string">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span class="practice-token-keyword">$1</span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="practice-token-number">$1</span>');
    }

    if (language === 'html') {
      return line
        .replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="practice-token-tag">$2</span>')
        .replace(/([a-zA-Z-:]+)=/g, '<span class="practice-token-attr">$1</span>=')
        .replace(/("[^"]*"|'[^']*')/g, '<span class="practice-token-string">$1</span>');
    }

    if (language === 'css') {
      return line
        .replace(/([.#]?[a-zA-Z_-][a-zA-Z0-9_-]*)(\s*\{)/g, '<span class="practice-token-tag">$1</span>$2')
        .replace(/([a-z-]+)(\s*:)/g, '<span class="practice-token-attr">$1</span>$2')
        .replace(/(:\s*)([^;]+)(;?)/g, '$1<span class="practice-token-string">$2</span>$3')
        .replace(/\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)?)\b/g, '<span class="practice-token-number">$1</span>');
    }

    return line;
  };

  return code
    .split('\n')
    .map((line, index) => {
      const lineNumber = index + 1;
      const safeLine = escapeHtml(line);
      const highlighted = applyLanguageTokens(safeLine) || '&nbsp;';
      const errorClass = errorLines.has(lineNumber) ? ' practice-line-error' : '';

      return `<div class="practice-line${errorClass}">${highlighted}</div>`;
    })
    .join('');
};

const getCombinedPreviewDoc = (html: string, css: string, javascript: string, runId: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: "Segoe UI", sans-serif;
        margin: 0;
        padding: 24px;
        background: #fff7ed;
        color: #111827;
      }

      .card {
        max-width: 560px;
        border-radius: 24px;
        background: white;
        padding: 24px;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
      }

      .pill {
        display: inline-block;
        padding: 8px 12px;
        border-radius: 999px;
        background: #fed7aa;
        color: #9a3412;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      ${css}
    </style>
  </head>
  <body>
    ${html || DEFAULT_HTML}
    <script>
      (function () {
        const runId = ${JSON.stringify(runId)};
        const post = (payload) => parent.postMessage({ source: 'practice-workspace', runId, ...payload }, '*');
        const wrap = (type) => (...args) => {
          post({
            type: 'console',
            level: type,
            message: args.map((arg) => {
              try {
                return typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }).join(' '),
          });
        };

        console.log = wrap('log');
        console.info = wrap('info');
        console.warn = wrap('warn');
        console.error = wrap('error');

        window.addEventListener('error', function (event) {
          post({
            type: 'runtime-error',
            message: event.message || 'Runtime error',
            line: event.lineno,
            column: event.colno,
          });
        });

        window.addEventListener('unhandledrejection', function (event) {
          const reason = event.reason && event.reason.message ? event.reason.message : String(event.reason);
          post({
            type: 'runtime-error',
            message: reason || 'Unhandled promise rejection',
          });
        });

        post({ type: 'ready' });
      })();
    </script>
    <script>
      ${javascript}
      //# sourceURL=practice.js
    </script>
  </body>
</html>`;

const runWorkspace = (files: PracticeFile[], runId: string): PracticeRunResult => {
  const html = files.find((file) => file.language === 'html')?.code ?? '';
  const css = files.find((file) => file.language === 'css')?.code ?? '';
  const javascriptFile = files.find((file) => file.language === 'javascript');
  const jsonFile = files.find((file) => file.language === 'json');
  const errors: PracticeError[] = [];
  const outputLines: string[] = [];

  if (jsonFile) {
    try {
      JSON.parse(jsonFile.code);
      outputLines.push(`${jsonFile.label} is valid JSON.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      const location = getJsonErrorLocation(message, jsonFile.code);

      errors.push({
        fileId: jsonFile.id,
        line: location?.line,
        column: location?.column,
        message,
      });
    }
  }

  if (javascriptFile?.code.trim()) {
    try {
      new Function(`"use strict";\n${javascriptFile.code}\n//# sourceURL=practice.js`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JavaScript syntax error';
      const location = getLineFromStack(error instanceof Error ? error.stack : undefined);

      errors.push({
        fileId: javascriptFile.id,
        line: location?.line,
        column: location?.column,
        message,
      });
    }
  }

  return {
    status: errors.length > 0 ? 'error' : 'success',
    summary:
      errors.length > 0
        ? 'The editor found issues before running everything together.'
        : 'Workspace ran successfully.',
    outputLines: errors.length > 0 ? outputLines : [...outputLines, 'Preview rendered successfully.'],
    errors,
    previewDoc: getCombinedPreviewDoc(html, css, javascriptFile?.code ?? '', runId),
  };
};

export const CodePracticeWorkspace = ({
  title,
  description,
  files,
  activeFileId,
  onActiveFileChange,
  onFileChange,
  theme = 'dark',
  runLabel = 'Run code',
  previewTitle = 'Preview',
  outputTitle = 'Output',
  showOutputPanel = true,
  onResultChange,
}: CodePracticeWorkspaceProps) => {
  const [result, setResult] = useState<PracticeRunResult>({
    status: 'idle',
    summary: 'Edit the files and run the workspace.',
    outputLines: [],
    errors: [],
    previewDoc: FALLBACK_PREVIEW,
  });
  const [runId, setRunId] = useState('idle');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const activeCode = activeFile?.code ?? '';

  useEffect(() => {
    onResultChange?.(result);
  }, [onResultChange, result]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      if (!data || data.source !== 'practice-workspace' || data.runId !== runId) {
        return;
      }

      if (data.type === 'console') {
        setResult((current) => ({
          ...current,
          outputLines: [
            ...current.outputLines,
            data.level === 'warn' ? `Warning: ${data.message}` : data.level === 'error' ? `Error: ${data.message}` : data.message,
          ],
        }));
      }

      if (data.type === 'runtime-error') {
        setResult((current) => ({
          ...current,
          status: 'error',
          summary: 'The workspace ran, but hit a runtime error.',
          errors: [
            ...current.errors,
            {
              fileId: files.find((file) => file.language === 'javascript')?.id,
              line: typeof data.line === 'number' && data.line > 0 ? data.line : undefined,
              column: typeof data.column === 'number' && data.column > 0 ? data.column : undefined,
              message: data.message || 'Runtime error',
            },
          ],
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, runId]);

  const activeErrors = useMemo(
    () => result.errors.filter((error) => !error.fileId || error.fileId === activeFile?.id),
    [activeFile?.id, result.errors]
  );

  const errorLines = useMemo(
    () => new Set(activeErrors.map((error) => error.line).filter((line): line is number => Boolean(line))),
    [activeErrors]
  );

  const highlightedMarkup = useMemo(
    () => highlightSyntax(activeCode, activeFile?.language ?? 'html', errorLines),
    [activeCode, activeFile?.language, errorLines]
  );

  const lineCount = useMemo(() => Math.max(activeCode.split('\n').length, 1), [activeCode]);

  const syncScroll = () => {
    if (!textareaRef.current) return;

    const { scrollTop, scrollLeft } = textareaRef.current;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }

    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const runCurrentWorkspace = () => {
    const nextRunId = `${Date.now()}`;
    setRunId(nextRunId);
    setResult(runWorkspace(files, nextRunId));
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-[30px] border ${isDark ? 'border-white/10 bg-slate-900/70 text-white' : 'border-orange-200 bg-white/85 text-slate-900'}`}>
      <div className={`flex flex-col gap-4 border-b p-5 ${isDark ? 'border-white/10' : 'border-orange-200'} lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Online editor</p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
          <p className={`mt-2 max-w-3xl text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
        </div>

        <button
          onClick={runCurrentWorkspace}
          className="glow-button self-start rounded-2xl px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
        >
          {runLabel}
        </button>
      </div>

      <div className="grid gap-6 p-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className={`rounded-[24px] border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-orange-200 bg-orange-50/60'}`}>
            <div className={`border-b px-4 py-3 ${isDark ? 'border-white/10' : 'border-orange-200'}`}>
              <div className="flex flex-wrap gap-2">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => onActiveFileChange(file.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeFile?.id === file.id
                        ? isDark
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-900 text-white'
                        : isDark
                          ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {file.label}
                  </button>
                ))}
              </div>
              <p className={`mt-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {activeFile?.description || `Editing ${activeFile?.label}`}
              </p>
            </div>

            <div className="flex h-[430px] overflow-hidden rounded-b-[24px]">
              <div
                ref={gutterRef}
                className={`w-14 overflow-hidden border-r px-3 py-4 text-right font-mono text-sm ${isDark ? 'border-white/10 bg-slate-900 text-slate-500' : 'border-orange-200 bg-white/70 text-slate-400'}`}
              >
                {Array.from({ length: lineCount }).map((_, index) => {
                  const lineNumber = index + 1;

                  return (
                    <div
                      key={lineNumber}
                      className={`h-[1.75rem] leading-7 ${errorLines.has(lineNumber) ? 'rounded-md bg-rose-500/15 px-1 text-rose-300' : ''}`}
                    >
                      {lineNumber}
                    </div>
                  );
                })}
              </div>

              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={highlightRef}
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 overflow-auto px-4 py-4 font-mono text-sm leading-7 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}
                >
                  <pre className="practice-editor-layer whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedMarkup }} />
                </div>

                <textarea
                  ref={textareaRef}
                  value={activeCode}
                  onChange={(event) => onFileChange(activeFile.id, event.target.value)}
                  onScroll={syncScroll}
                  spellCheck={false}
                  className={`relative z-10 h-full w-full resize-none overflow-auto bg-transparent px-4 py-4 font-mono text-sm leading-7 outline-none ${isDark ? 'text-transparent caret-orange-300' : 'text-transparent caret-orange-600'}`}
                />
              </div>
            </div>
          </div>

          <div className={`rounded-[24px] border p-4 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Run summary</p>
            <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.summary}</p>
            {result.errors.length > 0 && (
              <div className="mt-3 space-y-2">
                {result.errors.map((error, index) => {
                  const errorFile = files.find((file) => file.id === error.fileId);

                  return (
                    <div key={`${error.message}-${index}`} className={`rounded-2xl px-4 py-3 text-sm ${isDark ? 'bg-rose-500/10 text-rose-200' : 'bg-rose-100 text-rose-700'}`}>
                      {errorFile ? `${errorFile.label}: ` : ''}
                      {error.line ? `Line ${error.line}${error.column ? `, column ${error.column}` : ''}: ` : ''}
                      {error.message}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {showOutputPanel ? (
            <div className={`rounded-[24px] border p-4 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">{outputTitle}</p>
              <div className={`mt-4 min-h-[180px] rounded-[20px] border p-4 font-mono text-sm leading-7 ${isDark ? 'border-white/10 bg-slate-950 text-slate-200' : 'border-orange-200 bg-white text-slate-800'}`}>
                {result.outputLines.length > 0 ? (
                  result.outputLines.map((line, index) => (
                    <div key={`${line}-${index}`} className="whitespace-pre-wrap break-words">
                      {line}
                    </div>
                  ))
                ) : (
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Run the workspace to see logs and validation output here.</p>
                )}
              </div>
            </div>
          ) : null}

          <div className={`rounded-[24px] border p-4 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-orange-200 bg-orange-50/80'}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">{previewTitle}</p>
            <div className={`mt-4 overflow-hidden rounded-[20px] border ${isDark ? 'border-white/10 bg-white' : 'border-orange-200 bg-white'}`}>
              <iframe
                title={`${title} preview`}
                srcDoc={result.previewDoc || FALLBACK_PREVIEW}
                className={`${showOutputPanel ? 'h-[300px]' : 'h-[520px]'} w-full border-0 bg-white`}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePracticeWorkspace;
