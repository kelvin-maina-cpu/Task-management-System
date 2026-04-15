import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, type Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';
import './DevSpace.css';

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
}

export interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface ProblemEntry {
  file: string;
  path: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  source: string;
  message: string;
}

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  modified: boolean;
}

export interface TerminalEntry {
  id: string;
  kind: 'command' | 'output' | 'info' | 'error' | 'success';
  text: string;
}

interface LocalWorkspaceLoadResult {
  tree: FileItem;
  fileHandles: Map<string, any>;
}

interface CreateFileDialogState {
  isOpen: boolean;
  name: string;
  languageKey: string;
}

interface TerminalSessionState {
  id: string;
  title: string;
  connected: boolean;
  cwd: string;
}

export interface DevSpaceProps {
  initialFileTree?: FileItem;
  readOnly?: boolean;
  onCodeChange?: (filePath: string, content: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

type PanelName = 'console' | 'problems' | 'output' | 'terminal' | 'preview';

const FILE_LANGUAGE_OPTIONS = [
  { key: 'plaintext', label: 'Plain Text', extension: 'txt' },
  { key: 'javascript', label: 'JavaScript', extension: 'js' },
  { key: 'typescript', label: 'TypeScript', extension: 'ts' },
  { key: 'jsx', label: 'React JSX', extension: 'jsx' },
  { key: 'tsx', label: 'React TSX', extension: 'tsx' },
  { key: 'html', label: 'HTML', extension: 'html' },
  { key: 'css', label: 'CSS', extension: 'css' },
  { key: 'scss', label: 'SCSS', extension: 'scss' },
  { key: 'json', label: 'JSON', extension: 'json' },
  { key: 'markdown', label: 'Markdown', extension: 'md' },
  { key: 'python', label: 'Python', extension: 'py' },
  { key: 'java', label: 'Java', extension: 'java' },
  { key: 'cpp', label: 'C++', extension: 'cpp' },
  { key: 'c', label: 'C', extension: 'c' },
  { key: 'php', label: 'PHP', extension: 'php' },
  { key: 'yaml', label: 'YAML', extension: 'yml' },
  { key: 'xml', label: 'XML', extension: 'xml' },
  { key: 'shell', label: 'Shell', extension: 'sh' },
  { key: 'sql', label: 'SQL', extension: 'sql' },
] as const;

const createDefaultTree = (): FileItem => ({
  name: 'project',
  type: 'folder',
  children: [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'index.js', type: 'file', content: '// Welcome to DevSpace\nconsole.log("Hello World");' },
        { name: 'app.js', type: 'file', content: 'const app = {\n  init() {\n    console.log("App initialized");\n  }\n};' },
        { name: 'styles.css', type: 'file', content: 'body {\n  margin: 0;\n  padding: 20px;\n  font-family: sans-serif;\n}' },
      ],
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        {
          name: 'index.html',
          type: 'file',
          content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
        },
      ],
    },
    { name: 'package.json', type: 'file', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}' },
    { name: 'README.md', type: 'file', content: '# My Project\n\nThis is a sample project.' },
  ],
});

const getTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const icons: Record<string, string> = {
    js: 'JS',
    jsx: 'JS',
    ts: 'TS',
    tsx: 'TS',
    html: 'HT',
    css: 'CS',
    json: 'JN',
    md: 'MD',
    py: 'PY',
    java: 'JV',
    cpp: 'CP',
    php: 'PH',
    yml: 'YM',
    yaml: 'YM',
  };

  return icons[ext] || 'FI';
};

const detectLanguage = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    md: 'Markdown',
    py: 'Python',
    java: 'Java',
    cpp: 'C++',
    php: 'PHP',
    yml: 'YAML',
    yaml: 'YAML',
  };

  return map[ext] || 'Plain Text';
};

const getMonacoLanguage = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sh: 'shell',
    sql: 'sql',
  };

  return map[ext] || 'plaintext';
};

const normalizeSegments = (segments: string[]) => {
  const normalized: string[] = [];

  segments.forEach((segment) => {
    if (!segment || segment === '.') {
      return;
    }

    if (segment === '..') {
      normalized.pop();
      return;
    }

    normalized.push(segment);
  });

  return normalized;
};

const buildPath = (segments: string[]) => normalizeSegments(segments).join('/');
const splitPath = (path: string) => path.split('/').filter(Boolean);

const getParentPath = (path: string) => {
  const segments = splitPath(path);
  return buildPath(segments.slice(0, -1));
};

const getPathLabel = (rootName: string, path: string) => {
  if (!path || path === rootName) {
    return '/';
  }

  return `/${splitPath(path).slice(1).join('/')}`;
};

const cloneTree = (item: FileItem): FileItem => ({
  ...item,
  children: item.children?.map(cloneTree),
});

const findItem = (tree: FileItem, targetPath: string, currentPath = tree.name): FileItem | null => {
  if (currentPath === targetPath) {
    return tree;
  }

  if (!tree.children) {
    return null;
  }

  for (const child of tree.children) {
    const childPath = `${currentPath}/${child.name}`;
    const found = findItem(child, targetPath, childPath);
    if (found) {
      return found;
    }
  }

  return null;
};

const updateItemContent = (tree: FileItem, targetPath: string, content: string, currentPath = tree.name): FileItem => {
  if (currentPath === targetPath && tree.type === 'file') {
    return { ...tree, content };
  }

  if (!tree.children) {
    return tree;
  }

  return {
    ...tree,
    children: tree.children.map((child) =>
      updateItemContent(child, targetPath, content, `${currentPath}/${child.name}`)
    ),
  };
};

const addItemToFolder = (tree: FileItem, folderPath: string, newItem: FileItem, currentPath = tree.name): FileItem => {
  if (currentPath === folderPath && tree.type === 'folder') {
    const children = tree.children ?? [];
    return { ...tree, children: [...children, newItem] };
  }

  if (!tree.children) {
    return tree;
  }

  return {
    ...tree,
    children: tree.children.map((child) =>
      addItemToFolder(child, folderPath, newItem, `${currentPath}/${child.name}`)
    ),
  };
};

const countLines = (value: string) => value.split('\n').length;

const getCursorMetrics = (value: string, cursorIndex: number) => {
  const safeIndex = Math.max(0, Math.min(cursorIndex, value.length));
  const lines = value.slice(0, safeIndex).split('\n');
  const line = lines.length;
  const column = (lines.at(-1)?.length ?? 0) + 1;

  return { line, column };
};

const validateFileContent = (path: string, content: string): ProblemEntry[] => {
  const file = path.split('/').pop() || path;
  const ext = file.split('.').pop()?.toLowerCase() || '';
  const problems: ProblemEntry[] = [];

  const addProblem = (
    severity: ProblemEntry['severity'],
    message: string,
    line = 1,
    column = 1,
    source = 'DevSpace'
  ) => {
    problems.push({
      file,
      path,
      line,
      column,
      severity,
      source,
      message,
    });
  };

  if (['js', 'jsx'].includes(ext)) {
    try {
      new Function(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JavaScript';
      addProblem('error', message, 1, 1, 'JavaScript');
    }

    const lines = content.split('\n');
    lines.forEach((lineText, index) => {
      if (lineText.includes('console.log(')) {
        addProblem('warning', 'console.log statement left in file', index + 1, lineText.indexOf('console.log') + 1, 'Lint');
      }

      const trimmed = lineText.trim();
      if (
        trimmed &&
        !trimmed.startsWith('//') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(',') &&
        !trimmed.startsWith('if ') &&
        !trimmed.startsWith('if(') &&
        !trimmed.startsWith('for ') &&
        !trimmed.startsWith('for(') &&
        !trimmed.startsWith('while ') &&
        !trimmed.startsWith('while(') &&
        !trimmed.startsWith('function ') &&
        !trimmed.startsWith('class ') &&
        !trimmed.startsWith('import ') &&
        !trimmed.startsWith('export ') &&
        !trimmed.includes('=>')
      ) {
        if (
          trimmed.includes('=') ||
          trimmed.startsWith('return ') ||
          trimmed.startsWith('const ') ||
          trimmed.startsWith('let ') ||
          trimmed.startsWith('var ')
        ) {
          addProblem('warning', 'Possible missing semicolon', index + 1, lineText.length, 'Lint');
        }
      }
    });
  }

  if (ext === 'json') {
    try {
      JSON.parse(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      addProblem('error', message, 1, 1, 'JSON');
    }
  }

  if (ext === 'css') {
    const opens = (content.match(/{/g) || []).length;
    const closes = (content.match(/}/g) || []).length;
    if (opens !== closes) {
      addProblem('error', 'Unbalanced CSS braces', 1, 1, 'CSS');
    }
  }

  if (ext === 'html') {
    const openTags = content.match(/<([a-z][a-z0-9-]*)\b[^>]*>/gi) || [];
    const closeTags = content.match(/<\/([a-z][a-z0-9-]*)>/gi) || [];
    const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source'];
    const normalizedOpens = openTags.filter((tag) => !voidTags.includes(tag.replace(/<|>|\//g, '').split(/\s+/)[0]));
    if (normalizedOpens.length < closeTags.length) {
      addProblem('warning', 'HTML closing tags outnumber opening tags', 1, 1, 'HTML');
    }
  }

  return problems;
};

const renderTreeLines = (node: FileItem, depth = 0): string[] => {
  const prefix = depth === 0 ? '' : `${'  '.repeat(depth - 1)}- `;
  const current = `${prefix}${node.name}${node.type === 'folder' ? '/' : ''}`;
  const children = (node.children ?? []).flatMap((child) => renderTreeLines(child, depth + 1));
  return [current, ...children];
};

const TEXT_FILE_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json', 'md', 'txt',
  'py', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'go', 'rs', 'yml', 'yaml', 'xml',
  'env', 'sh', 'bat', 'ps1', 'sql',
]);

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);

const isTextFileName = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return ['dockerfile', 'makefile', '.gitignore'].includes(name.toLowerCase());
  }

  return TEXT_FILE_EXTENSIONS.has(extension);
};

const loadLocalDirectoryTree = async (
  dirHandle: any,
  currentPath = dirHandle.name
): Promise<LocalWorkspaceLoadResult> => {
  const children: FileItem[] = [];
  const fileHandles = new Map<string, any>();

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      if (SKIPPED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }

      const childPath = `${currentPath}/${entry.name}`;
      const nested = await loadLocalDirectoryTree(entry, childPath);
      children.push(nested.tree);
      nested.fileHandles.forEach((handle, path) => fileHandles.set(path, handle));
      continue;
    }

    if (!isTextFileName(entry.name)) {
      continue;
    }

    const file = await entry.getFile();
    const content = await file.text();
    const filePath = `${currentPath}/${entry.name}`;

    children.push({
      name: entry.name,
      type: 'file',
      content,
    });
    fileHandles.set(filePath, entry);
  }

  children.sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'folder' ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });

  return {
    tree: {
      name: dirHandle.name,
      type: 'folder',
      children,
    },
    fileHandles,
  };
};

const terminalEntryToAnsi = (entry: Pick<TerminalEntry, 'kind' | 'text'>) => {
  const colors: Record<TerminalEntry['kind'], string> = {
    command: '\x1b[36m',
    output: '\x1b[37m',
    info: '\x1b[90m',
    error: '\x1b[31m',
    success: '\x1b[32m',
  };

  return `${colors[entry.kind]}${entry.text}\x1b[0m`;
};

const TERMINAL_HISTORY_STORAGE_KEY = 'devspace-terminal-history';

export const DevSpace: React.FC<DevSpaceProps> = ({
  initialFileTree,
  readOnly = false,
  onCodeChange,
  onFullscreenChange,
}) => {
  const [fileTree, setFileTree] = useState<FileItem>(() => cloneTree(initialFileTree || createDefaultTree()));
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([fileTree.name]));
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([]);
  const [outputLogs, setOutputLogs] = useState<LogEntry[]>([]);
  const [problems, setProblems] = useState<ProblemEntry[]>([]);
  const [currentPanel, setCurrentPanel] = useState<PanelName>('terminal');
  const [editorContent, setEditorContent] = useState('');
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [panelHeight, setPanelHeight] = useState(200); // Track bottom panel height
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [createFileDialog, setCreateFileDialog] = useState<CreateFileDialogState>({
    isOpen: false,
    name: '',
    languageKey: 'javascript',
  });
  const [terminalSessions, setTerminalSessions] = useState<TerminalSessionState[]>([
    {
      id: 'terminal-1',
      title: 'PowerShell 1',
      connected: false,
      cwd: '.',
    },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('terminal-1');
  const [newItemSeed, setNewItemSeed] = useState(1);
  const [recentTerminalCommands, setRecentTerminalCommands] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(TERMINAL_HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const editorRef = useRef<any>(null);
  const terminalContainerRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const xtermRefs = useRef<Map<string, Terminal>>(new Map());
  const fitAddonRefs = useRef<Map<string, FitAddon>>(new Map());
  const terminalSocketRefs = useRef<Map<string, Socket>>(new Map());
  const terminalInputBuffersRef = useRef<Map<string, string>>(new Map());
  const terminalEntriesRef = useRef<TerminalEntry[]>([]);
  const localRootHandleRef = useRef<any>(null);
  const localFileHandlesRef = useRef<Map<string, any>>(new Map());

  const rootName = fileTree.name;
  const activeTerminalSession = terminalSessions.find((session) => session.id === activeTerminalId) || terminalSessions[0];

  const appendConsole = useCallback((type: LogEntry['type'], message: string) => {
    setConsoleLogs((prev) => [...prev, { time: getTimestamp(), type, message }]);
  }, []);

  const appendOutput = useCallback((type: LogEntry['type'], message: string) => {
    setOutputLogs((prev) => [...prev, { time: getTimestamp(), type, message }]);
  }, []);

  const appendTerminal = useCallback((kind: TerminalEntry['kind'], text: string) => {
    const entry = { id: `${Date.now()}-${terminalEntriesRef.current.length}`, kind, text };
    terminalEntriesRef.current.push(entry);
    const activeTerminal = xtermRefs.current.get(activeTerminalId);
    if (activeTerminal) {
      activeTerminal.writeln(terminalEntryToAnsi(entry));
    }
  }, [activeTerminalId]);

  const rememberTerminalCommand = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }

    setRecentTerminalCommands((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 8);
      localStorage.setItem(TERMINAL_HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const syncProblems = useCallback((path: string, content: string) => {
    const nextProblems = validateFileContent(path, content);
    setProblems(nextProblems);
    return nextProblems;
  }, []);

  useEffect(() => {
    appendOutput('info', `Workspace "${rootName}" loaded`);
    appendOutput('success', 'Explorer, editor, output, and terminal are ready');
  }, [appendOutput, rootName]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container') && !target.closest('.menu-bar')) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }

    return undefined;
  }, [openMenu]);

  useEffect(() => {
    if (currentPanel === 'terminal') {
      requestAnimationFrame(() => {
        fitAddonRefs.current.get(activeTerminalId)?.fit();
      });
    }
  }, [activeTerminalId, currentPanel, isTerminalExpanded, sidebarVisible, isFullscreen]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const openFile = useCallback((path: string) => {
    const file = findItem(fileTree, path);
    if (!file || file.type !== 'file') {
      return;
    }

    const existingTab = openTabs.find((tab) => tab.path === path);
    if (existingTab) {
      setActiveTab(path);
      setEditorContent(existingTab.content);
      setCursor(getCursorMetrics(existingTab.content, 0));
      setProblems(validateFileContent(path, existingTab.content));
      return;
    }

    const newTab: OpenTab = {
      path,
      name: file.name,
      content: file.content || '',
      modified: false,
    };

    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTab(path);
    setEditorContent(newTab.content);
    setCursor(getCursorMetrics(newTab.content, 0));
    setProblems(validateFileContent(path, newTab.content));
    setExpandedFolders((prev) => new Set([...prev, getParentPath(path)]));
    appendOutput('info', `Opened ${path}`);
  }, [appendOutput, fileTree, openTabs]);

  const focusTab = useCallback((path: string) => {
    const tab = openTabs.find((item) => item.path === path);
    if (!tab) {
      return;
    }

    setActiveTab(path);
    setEditorContent(tab.content);
    setCursor(getCursorMetrics(tab.content, 0));
    setProblems(validateFileContent(path, tab.content));
  }, [openTabs]);

  const closeTab = (path: string) => {
    const nextTabs = openTabs.filter((tab) => tab.path !== path);
    setOpenTabs(nextTabs);

    if (activeTab === path) {
      if (nextTabs.length > 0) {
        const replacement = nextTabs[nextTabs.length - 1];
        setActiveTab(replacement.path);
        setEditorContent(replacement.content);
        setCursor(getCursorMetrics(replacement.content, 0));
        setProblems(validateFileContent(replacement.path, replacement.content));
      } else {
        setActiveTab(null);
        setEditorContent('');
        setCursor({ line: 1, column: 1 });
        setProblems([]);
      }
    }
  };

  const persistFileToLocalWorkspace = useCallback(async (path: string, content: string) => {
    if (!localRootHandleRef.current) {
      return;
    }

    try {
      let fileHandle = localFileHandlesRef.current.get(path);

      if (!fileHandle) {
        const segments = splitPath(path);
        let currentHandle = localRootHandleRef.current;

        for (let index = 1; index < segments.length - 1; index += 1) {
          currentHandle = await currentHandle.getDirectoryHandle(segments[index], { create: true });
        }

        fileHandle = await currentHandle.getFileHandle(segments[segments.length - 1], { create: true });
        localFileHandlesRef.current.set(path, fileHandle);
      }

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      appendOutput('success', `Saved to local folder: ${path}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to write file';
      appendOutput('error', `Could not save ${path} to local folder: ${message}`);
      appendTerminal('error', `save failed ${getPathLabel(rootName, path)}`);
    }
  }, [appendOutput, appendTerminal, rootName]);

  const saveFile = useCallback(async () => {
    if (!activeTab) {
      appendOutput('warn', 'No active file to save');
      return;
    }

    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.path === activeTab ? { ...tab, modified: false, content: editorContent } : tab
      )
    );
    setFileTree((prev) => updateItemContent(prev, activeTab, editorContent));

    const nextProblems = syncProblems(activeTab, editorContent);
    appendOutput('success', `Saved ${activeTab}`);
    appendTerminal('success', `saved ${getPathLabel(rootName, activeTab)}`);

    if (nextProblems.length > 0) {
      appendOutput('warn', `Saved with ${nextProblems.length} problem${nextProblems.length === 1 ? '' : 's'} still detected`);
    }
    await persistFileToLocalWorkspace(activeTab, editorContent);
  }, [activeTab, appendOutput, appendTerminal, editorContent, persistFileToLocalWorkspace, rootName, syncProblems]);

  const saveAllFiles = useCallback(async () => {
    if (openTabs.length === 0) {
      appendOutput('warn', 'No open files to save');
      return;
    }

    let nextTree = fileTree;
    const nextTabs = openTabs.map((tab) => {
      const content = tab.path === activeTab ? editorContent : tab.content;
      nextTree = updateItemContent(nextTree, tab.path, content);
      return { ...tab, content, modified: false };
    });

    setFileTree(nextTree);
    setOpenTabs(nextTabs);

    if (activeTab) {
      syncProblems(activeTab, editorContent);
    }

    appendOutput('success', `Saved ${nextTabs.length} file${nextTabs.length === 1 ? '' : 's'}`);
    appendTerminal('success', `saved ${nextTabs.length} file${nextTabs.length === 1 ? '' : 's'}`);
    await Promise.all(nextTabs.map((tab) => persistFileToLocalWorkspace(tab.path, tab.content)));
  }, [activeTab, appendOutput, appendTerminal, editorContent, fileTree, openTabs, persistFileToLocalWorkspace, syncProblems]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);

    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.path === activeTab ? { ...tab, modified: true, content } : tab
      )
    );

    if (activeTab) {
      syncProblems(activeTab, content);
      onCodeChange?.(activeTab, content);
    }
  };

  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);
    onFullscreenChange?.(nextState);
  };

  const handleMenuClick = (menu: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const closeMenu = () => setOpenMenu(null);

  const openCreateFileDialog = () => {
    setCreateFileDialog({
      isOpen: true,
      name: `untitled-${newItemSeed}`,
      languageKey: 'javascript',
    });
    closeMenu();
  };

  const closeCreateFileDialog = () => {
    setCreateFileDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const openFolderFromPC = useCallback(async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        appendOutput('error', 'Local folder access is not supported in this browser');
        appendTerminal('error', 'showDirectoryPicker unavailable');
        return;
      }

      const dirHandle = await (window as any).showDirectoryPicker();
      const loaded = await loadLocalDirectoryTree(dirHandle);

      localRootHandleRef.current = dirHandle;
      localFileHandlesRef.current = loaded.fileHandles;

      setFileTree(loaded.tree);
      setOpenTabs([]);
      setActiveTab(null);
      setEditorContent('');
      setProblems([]);
      setCursor({ line: 1, column: 1 });
      setExpandedFolders(new Set([loaded.tree.name]));
      setTerminalSessions((prev) =>
        prev.map((session) =>
          session.id === activeTerminalId ? { ...session, cwd: '.' } : session
        )
      );
      setCurrentPanel('output');

      appendOutput('success', `Opened local folder: ${dirHandle.name}`);
      appendTerminal('success', `workspace ${dirHandle.name}`);
      closeMenu();
    } catch (error) {
      const maybeDomError = error as { name?: string; message?: string };
      if (maybeDomError?.name === 'AbortError') {
        return;
      }

      const message = error instanceof Error ? error.message : 'Unable to open local folder';
      appendOutput('error', `Failed to open local folder: ${message}`);
      appendTerminal('error', 'open folder failed');
    }
  }, [activeTerminalId, appendOutput, appendTerminal]);

  const createFile = (requestedName: string, languageKey: string) => {
    const parentPath = activeTab ? getParentPath(activeTab) : rootName;
    const languageOption =
      FILE_LANGUAGE_OPTIONS.find((option) => option.key === languageKey) ||
      FILE_LANGUAGE_OPTIONS[0];
    const trimmedName = requestedName.trim();
    const fileName =
      trimmedName.includes('.') || !languageOption.extension
        ? trimmedName
        : `${trimmedName}.${languageOption.extension}`;
    const filePath = `${parentPath}/${fileName}`;
    const file: FileItem = { name: fileName, type: 'file', content: '' };

    setNewItemSeed((prev) => prev + 1);
    setFileTree((prev) => addItemToFolder(prev, parentPath, file));
    const newTab: OpenTab = {
      path: filePath,
      name: fileName,
      content: '',
      modified: true,
    };
    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTab(filePath);
    setEditorContent('');
    setProblems([]);
    setCursor({ line: 1, column: 1 });
    setExpandedFolders((prev) => new Set([...prev, parentPath]));
    appendOutput('info', `Created ${filePath}`);
    appendTerminal('success', `touch ${getPathLabel(rootName, filePath)}`);
  };

  const submitCreateFileDialog = () => {
    const trimmedName = createFileDialog.name.trim();
    if (!trimmedName) {
      appendOutput('warn', 'Please enter a file name before creating a file');
      return;
    }

    createFile(trimmedName, createFileDialog.languageKey);
    closeCreateFileDialog();
  };

  const createUntitledFolder = () => {
    const parentPath = activeTab ? getParentPath(activeTab) : rootName;
    const folderName = `folder-${newItemSeed}`;
    const folderPath = `${parentPath}/${folderName}`;
    const folder: FileItem = { name: folderName, type: 'folder', children: [] };

    setNewItemSeed((prev) => prev + 1);
    setFileTree((prev) => addItemToFolder(prev, parentPath, folder));
    setExpandedFolders((prev) => new Set([...prev, parentPath, folderPath]));
    appendOutput('info', `Created ${folderPath}`);
    appendTerminal('success', `mkdir ${getPathLabel(rootName, folderPath)}`);
  };

  const createTerminalSession = () => {
    const nextIndex = terminalSessions.length + 1;
    const sessionId = `terminal-${Date.now()}`;
    setTerminalSessions((prev) => [
      ...prev,
      {
        id: sessionId,
        title: `PowerShell ${nextIndex}`,
        connected: false,
        cwd: '.',
      },
    ]);
    setActiveTerminalId(sessionId);
    setCurrentPanel('terminal');
  };

  const reconnectActiveTerminal = () => {
    const session = activeTerminalSession;
    if (!session) {
      return;
    }

    disconnectTerminalSession(session.id);
    const host = terminalContainerRefs.current.get(session.id);
    if (host) {
      host.innerHTML = '';
      connectTerminalSession(session.id, host, session.cwd);
    }
  };

  const copyTerminalSelection = async () => {
    const terminal = activeTerminalSession ? xtermRefs.current.get(activeTerminalSession.id) : null;
    const selectedText = terminal?.getSelection() || '';
    if (!selectedText) {
      appendOutput('warn', 'No terminal text selected to copy');
      return;
    }

    await navigator.clipboard.writeText(selectedText);
    appendOutput('success', 'Copied terminal selection');
  };

  const pasteIntoTerminal = async () => {
    const terminal = activeTerminalSession ? xtermRefs.current.get(activeTerminalSession.id) : null;
    const socket = activeTerminalSession ? terminalSocketRefs.current.get(activeTerminalSession.id) : null;
    if (!terminal || !socket) {
      return;
    }

    const text = await navigator.clipboard.readText();
    if (!text) {
      return;
    }

    socket.emit('terminal:input', text);
    terminal.focus();
  };

  const runRecentTerminalCommand = (command: string) => {
    const socket = activeTerminalSession ? terminalSocketRefs.current.get(activeTerminalSession.id) : null;
    const terminal = activeTerminalSession ? xtermRefs.current.get(activeTerminalSession.id) : null;
    if (!socket || !terminal) {
      return;
    }

    rememberTerminalCommand(command);
    socket.emit('terminal:input', `${command}\r`);
    terminal.focus();
  };

  const handleRunCode = useCallback(() => {
    if (!activeTab) {
      appendConsole('warn', 'No file open to run');
      appendOutput('warn', 'Run requested without an active file');
      setCurrentPanel('console');
      return;
    }

    setCurrentPanel('console');
    appendOutput('info', `Starting run for ${activeTab}`);

    const nextProblems = syncProblems(activeTab, editorContent);
    if (nextProblems.some((problem) => problem.severity === 'error')) {
      appendConsole('error', 'Execution blocked by syntax problems');
      appendOutput('error', `Run blocked: ${nextProblems.length} problem(s) detected`);
      return;
    }

    const ext = activeTab.split('.').pop()?.toLowerCase() || '';

    if (ext === 'js' || ext === 'jsx') {
      const consoleProxy = {
        log: (...args: unknown[]) => appendConsole('info', args.map((arg) => String(arg)).join(' ')),
        warn: (...args: unknown[]) => appendConsole('warn', args.map((arg) => String(arg)).join(' ')),
        error: (...args: unknown[]) => appendConsole('error', args.map((arg) => String(arg)).join(' ')),
      };

      try {
        appendConsole('info', `Running ${activeTab}`);
        const executable = new Function('console', `"use strict";\n${editorContent}`);
        executable(consoleProxy);
        appendConsole('success', `Execution finished for ${activeTab}`);
        appendOutput('success', `Run completed for ${activeTab}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown runtime error';
        appendConsole('error', message);
        appendOutput('error', `Run failed for ${activeTab}: ${message}`);
      }
      return;
    }

    if (ext === 'html') {
      setHtmlPreview(editorContent);
      appendConsole('success', `HTML preview generated for ${activeTab}`);
      appendOutput('success', 'HTML rendered in Preview panel');
      setCurrentPanel('output');
      return;
    }

    appendConsole('info', `Run is not implemented for ${detectLanguage(activeTab)} files yet`);
    appendOutput('warn', `No runtime executor for ${activeTab}`);
  }, [activeTab, appendConsole, appendOutput, editorContent, syncProblems]);

  const handleRunDebug = () => {
    appendOutput('info', 'Debug session started');
    appendConsole('info', 'Debugger attached (simulation)');
    setCurrentPanel('console');
    closeMenu();
  };

  const handleHelpAbout = () => {
    appendOutput('info', 'DevSpace browser IDE with VS Code-style panels');
    closeMenu();
  };

  const handleHelpDocumentation = () => {
    appendOutput('info', 'Documentation panel is not wired yet, but terminal help is available');
    appendTerminal('info', 'Try the "help" command in Terminal for supported workspace actions.');
    closeMenu();
  };

  const handleHelpKeyboardShortcuts = () => {
    appendOutput('info', 'Shortcuts: Ctrl+S save, Ctrl+` terminal, Ctrl+J toggle panel');
    closeMenu();
  };

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((event: any) => {
      setCursor({
        line: event.position.lineNumber,
        column: event.position.column,
      });
    });
  }, []);

  const disconnectTerminalSession = useCallback((sessionId: string) => {
    terminalSocketRefs.current.get(sessionId)?.disconnect();
    terminalSocketRefs.current.delete(sessionId);
    xtermRefs.current.get(sessionId)?.dispose();
    xtermRefs.current.delete(sessionId);
    fitAddonRefs.current.delete(sessionId);
    terminalInputBuffersRef.current.delete(sessionId);
    setTerminalSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, connected: false } : session
      )
    );
  }, []);

  const connectTerminalSession = useCallback((sessionId: string, host: HTMLDivElement, cwd = '.') => {
    if (xtermRefs.current.has(sessionId)) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: 13,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
      },
      convertEol: true,
      scrollback: 5000,
    });
    const fitAddon = new FitAddon();
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || window.location.origin;
    const socketBaseUrl = apiBase.replace(/\/api\/?$/, '');
    const token = localStorage.getItem('accessToken');
    const socket = io(`${socketBaseUrl}/terminal`, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token, cwd },
    });

    terminal.loadAddon(fitAddon);
    terminal.open(host);
    fitAddon.fit();
    terminal.writeln('\x1b[90mDevSpace PowerShell ready. Interactive session powered by xterm.js and node-pty.\x1b[0m');

    terminal.onData((data) => {
      socket.emit('terminal:input', data);

      const currentBuffer = terminalInputBuffersRef.current.get(sessionId) || '';
      if (data === '\r') {
        rememberTerminalCommand(currentBuffer);
        terminalInputBuffersRef.current.set(sessionId, '');
      } else if (data === '\u007f') {
        terminalInputBuffersRef.current.set(sessionId, currentBuffer.slice(0, -1));
      } else if (data >= ' ' && data !== '\u007f') {
        terminalInputBuffersRef.current.set(sessionId, `${currentBuffer}${data}`);
      }
    });

    socket.on('connect', () => {
      setTerminalSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, connected: true } : session
        )
      );
    });

    socket.on('disconnect', () => {
      setTerminalSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, connected: false } : session
        )
      );
    });

    socket.on('terminal:ready', (payload: { cwd?: string }) => {
      setTerminalSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, cwd: payload.cwd || session.cwd, connected: true }
            : session
        )
      );
      terminal.writeln('\x1b[32mPowerShell session connected.\x1b[0m');
    });

    socket.on('terminal:data', (data: string) => {
      terminal.write(data);
    });

    socket.on('terminal:error', (payload: { message?: string }) => {
      terminal.writeln(`\x1b[31m${payload.message || 'Terminal error'}\x1b[0m`);
    });

    socket.on('terminal:exit', (payload: { exitCode?: number }) => {
      terminal.writeln(`\r\n\x1b[31mTerminal exited with code ${payload.exitCode ?? 0}\x1b[0m`);
      setTerminalSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, connected: false } : session
        )
      );
    });

    xtermRefs.current.set(sessionId, terminal);
    fitAddonRefs.current.set(sessionId, fitAddon);
    terminalSocketRefs.current.set(sessionId, socket);
    terminalInputBuffersRef.current.set(sessionId, '');
  }, [rememberTerminalCommand]);

  useEffect(() => {
    terminalSessions.forEach((session) => {
      const host = terminalContainerRefs.current.get(session.id);
      if (host && !xtermRefs.current.has(session.id)) {
        connectTerminalSession(session.id, host, session.cwd);
      }
    });
  }, [connectTerminalSession, disconnectTerminalSession, terminalSessions]);

  useEffect(() => () => {
    Array.from(terminalSocketRefs.current.keys()).forEach((sessionId) => {
      disconnectTerminalSession(sessionId);
    });
  }, [disconnectTerminalSession]);

  useEffect(() => {
    const activeTerminal = xtermRefs.current.get(activeTerminalId);
    const activeFitAddon = fitAddonRefs.current.get(activeTerminalId);
    const activeSocket = terminalSocketRefs.current.get(activeTerminalId);

    if (activeTerminal && activeFitAddon && activeSocket && currentPanel === 'terminal') {
      requestAnimationFrame(() => {
        activeFitAddon.fit();
        activeSocket.emit('terminal:resize', {
          cols: activeTerminal.cols,
          rows: activeTerminal.rows,
        });
        activeTerminal.focus();
      });
    }
  }, [activeTerminalId, currentPanel, isTerminalExpanded, sidebarVisible, isFullscreen, terminalSessions]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveFile();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === '`') {
        event.preventDefault();
        setCurrentPanel('terminal');
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setCurrentPanel((prev) => (prev === 'output' ? 'terminal' : 'output'));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [saveFile]);

  // Panel resize handlers
  const handlePanelDragStart = () => {
    setIsDraggingPanel(true);
  };

  useEffect(() => {
    const handlePanelDragMove = (e: MouseEvent) => {
      if (!isDraggingPanel) return;

      const editorContainer = document.querySelector('.editor-container');
      if (!editorContainer) return;

      const rect = editorContainer.getBoundingClientRect();
      const newHeight = Math.max(100, Math.min(rect.height - 100, rect.height - (e.clientY - rect.top)));
      setPanelHeight(newHeight);
    };

    const handlePanelDragEnd = () => {
      setIsDraggingPanel(false);
    };

    if (isDraggingPanel) {
      document.addEventListener('mousemove', handlePanelDragMove);
      document.addEventListener('mouseup', handlePanelDragEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handlePanelDragMove);
      document.removeEventListener('mouseup', handlePanelDragEnd);
      document.body.style.cursor = 'auto';
      document.body.style.userSelect = 'auto';
    };
  }, [isDraggingPanel]);

  const renderFileTree = (item: FileItem, path = ''): React.ReactNode => {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(fullPath);

    return (
      <div key={fullPath}>
        <div
          className={`tree-item ${isFolder ? 'folder' : 'file'} ${activeTab === fullPath ? 'active' : ''}`}
          onClick={() => {
            if (isFolder) {
              toggleFolder(fullPath);
            } else {
              openFile(fullPath);
            }
          }}
        >
          <span className={`chevron ${isFolder && isExpanded ? 'rotated' : ''} ${!isFolder ? 'transparent' : ''}`}>
            {'>'}
          </span>
          <span className="tree-icon">{isFolder ? 'DIR' : getFileIcon(item.name)}</span>
          <span className="tree-label">{item.name}</span>
        </div>
        {isFolder && isExpanded && item.children && (
          <div className="tree-children expanded">
            {item.children.map((child) => renderFileTree(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  const renderProblemsPanel = () => {
    if (problems.length === 0) {
      return <div className="empty-panel-message">No problems detected</div>;
    }

    return (
      <div className="problems-list">
        {problems.map((problem, index) => (
          <button
            key={`${problem.path}-${problem.line}-${problem.column}-${index}`}
            type="button"
            className={`problem-row ${problem.severity}`}
            onClick={() => {
              openFile(problem.path);
              setCurrentPanel('problems');
            }}
          >
            <span className="problem-badge">{problem.severity === 'error' ? 'ERR' : 'WRN'}</span>
            <span className="problem-main">
              <span className="problem-message">{problem.message}</span>
              <span className="problem-meta">
                {problem.file}:{problem.line}:{problem.column} - {problem.source}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderLogPanel = (entries: LogEntry[], emptyMessage: string) => {
    if (entries.length === 0) {
      return <div className="empty-panel-message">{emptyMessage}</div>;
    }

    return (
      <div className="panel-log-list">
        {entries.map((log, index) => (
          <div key={`${log.time}-${index}`} className={`log-entry ${log.type}`}>
            <span className="log-time">{log.time}</span>
            <span className={`log-type ${log.type}`}>{log.type.toUpperCase()}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTerminalPanel = () => (
    <div className="terminal-panel">
      <div className="terminal-toolbar">
        <div className="terminal-session-tabs">
          {terminalSessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={`terminal-session-tab ${session.id === activeTerminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminalId(session.id)}
            >
              {session.title}
            </button>
          ))}
          <button type="button" className="terminal-toolbar-btn" onClick={createTerminalSession}>
            New Terminal
          </button>
        </div>
        <div className="terminal-toolbar-actions">
          <span className={`terminal-status ${activeTerminalSession?.connected ? 'connected' : 'disconnected'}`}>
            {activeTerminalSession?.connected ? 'PowerShell Connected' : 'PowerShell Disconnected'}
          </span>
          <button type="button" className="terminal-toolbar-btn" onClick={reconnectActiveTerminal}>
            Reconnect
          </button>
          <button type="button" className="terminal-toolbar-btn" onClick={copyTerminalSelection}>
            Copy
          </button>
          <button type="button" className="terminal-toolbar-btn" onClick={pasteIntoTerminal}>
            Paste
          </button>
        </div>
      </div>
      {recentTerminalCommands.length > 0 && (
        <div className="terminal-history-bar">
          {recentTerminalCommands.map((command) => (
            <button
              key={command}
              type="button"
              className="terminal-history-chip"
              onClick={() => runRecentTerminalCommand(command)}
            >
              {command}
            </button>
          ))}
        </div>
      )}
      <div className="terminal-session-hosts">
        {terminalSessions.map((session) => (
          <div
            key={session.id}
            className={`terminal-history xterm-host ${session.id === activeTerminalId ? 'active' : 'hidden'}`}
            ref={(node) => {
              terminalContainerRefs.current.set(session.id, node);
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderCreateFileDialog = () => {
    if (!createFileDialog.isOpen) {
      return null;
    }

    return (
      <div className="dialog-backdrop" onClick={closeCreateFileDialog}>
        <div className="dialog-card" onClick={(event) => event.stopPropagation()}>
          <div className="dialog-title">Create New File</div>
          <label className="dialog-field">
            <span>File Name</span>
            <input
              className="dialog-input"
              value={createFileDialog.name}
              onChange={(event) =>
                setCreateFileDialog((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="example"
              autoFocus
            />
          </label>
          <label className="dialog-field">
            <span>Language</span>
            <select
              className="dialog-input"
              value={createFileDialog.languageKey}
              onChange={(event) =>
                setCreateFileDialog((prev) => ({ ...prev, languageKey: event.target.value }))
              }
            >
              {FILE_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} (.{option.extension})
                </option>
              ))}
            </select>
          </label>
          <div className="dialog-help">
            If you leave off the extension, DevSpace will add one from the selected language.
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={closeCreateFileDialog}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={submitCreateFileDialog}>
              Create File
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="devspace-container">
      <div className="devspace-header">
        <div className="logo">
          <div className="logo-icon">D</div>
          <span>DevSpace</span>
        </div>

        <div className="menu-bar">
          <div className="menu-container">
            <span className="menu-item" onClick={(event) => handleMenuClick('file', event)}>
              File
            </span>
            {openMenu === 'file' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={openFolderFromPC}>Open Folder...</div>
                <div className="menu-item-divider" />
                <div className="menu-item-option" onClick={openCreateFileDialog}>New File</div>
                <div className="menu-item-option" onClick={createUntitledFolder}>New Folder</div>
                <div className="menu-item-divider" />
                <div className="menu-item-option" onClick={saveFile}>Save</div>
                <div className="menu-item-option" onClick={saveAllFiles}>Save All</div>
                <div className="menu-item-divider" />
                <div className="menu-item-option" onClick={() => activeTab && closeTab(activeTab)}>Close</div>
              </div>
            )}
          </div>

          <div className="menu-container">
            <span className="menu-item" onClick={(event) => handleMenuClick('view', event)}>
              View
            </span>
            {openMenu === 'view' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={() => setSidebarVisible((prev) => !prev)}>
                  {sidebarVisible ? 'Hide' : 'Show'} Explorer
                </div>
                <div className="menu-item-option" onClick={() => setCurrentPanel('terminal')}>
                  Focus Terminal
                </div>
                <div className="menu-item-option" onClick={() => setCurrentPanel('problems')}>
                  Focus Problems
                </div>
                <div className="menu-item-option" onClick={() => setWordWrap((prev) => !prev)}>
                  {wordWrap ? 'Disable' : 'Enable'} Word Wrap
                </div>
              </div>
            )}
          </div>

          <div className="menu-container">
            <span className="menu-item" onClick={(event) => handleMenuClick('run', event)}>
              Run
            </span>
            {openMenu === 'run' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleRunCode}>Run Active File</div>
                <div className="menu-item-option" onClick={handleRunDebug}>Start Debugging</div>
              </div>
            )}
          </div>

          <div className="menu-container">
            <span className="menu-item" onClick={(event) => handleMenuClick('help', event)}>
              Help
            </span>
            {openMenu === 'help' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleHelpDocumentation}>Docs</div>
                <div className="menu-item-option" onClick={handleHelpKeyboardShortcuts}>Keyboard Shortcuts</div>
                <div className="menu-item-option" onClick={handleHelpAbout}>About</div>
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button className="btn" onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button className="btn" onClick={saveFile}>Save</button>
          <button className="btn btn-primary" onClick={handleRunCode}>Run</button>
        </div>
      </div>

      <div className={`devspace-main ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        {sidebarVisible && (
          <div className="devspace-sidebar">
            <div className="sidebar-header">
              <span>Explorer</span>
              <div className="sidebar-actions">
                <button className="icon-btn" title="Open Folder" onClick={openFolderFromPC}>O</button>
                <button className="icon-btn" title="New File" onClick={openCreateFileDialog}>+</button>
                <button className="icon-btn" title="New Folder" onClick={createUntitledFolder}>[]</button>
              </div>
            </div>
            <div className="file-tree">{renderFileTree(fileTree)}</div>
          </div>
        )}

        <div className="editor-container">
          <div className="tabs-bar">
            {openTabs.length === 0 ? (
              <div className="tabs-empty">No open files</div>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.path}
                  className={`tab ${activeTab === tab.path ? 'active' : ''} ${tab.modified ? 'modified' : ''}`}
                  onClick={() => focusTab(tab.path)}
                >
                  <span className="tab-icon">{getFileIcon(tab.name)}</span>
                  <span className="tab-name">{tab.name}</span>
                  <span
                    className="tab-close"
                    onClick={(event) => {
                      event.stopPropagation();
                      closeTab(tab.path);
                    }}
                  >
                    x
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="editor-main">
            <div className="editor-wrapper">
              {openTabs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">CODE</div>
                  <div className="empty-text">Open a file from the explorer to start editing</div>
                  <div className="features">
                    <div>Run files into Console</div>
                    <div>Track editor activity in Output</div>
                    <div>Inspect live diagnostics in Problems</div>
                    <div>Use a workspace shell in Terminal</div>
                  </div>
                </div>
              ) : (
                <div className="code-editor-container">
                  <Editor
                  className="code-editor"
                  height="100%"
                  language={activeTab ? getMonacoLanguage(activeTab) : 'plaintext'}
                  value={editorContent}
                  onChange={(value) => handleEditorChange(value ?? '')}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    readOnly,
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
                    wordWrap: wordWrap ? 'on' : 'off',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    insertSpaces: true,
                    renderWhitespace: 'selection',
                    smoothScrolling: true,
                  }}
                />
                </div>
              )}
            </div>
          </div>

          <div 
            className={`bottom-panel ${currentPanel === 'terminal' && isTerminalExpanded ? 'terminal-expanded' : ''}`}
            style={{ height: `${panelHeight}px` }}
          >
            <div 
              className="panel-resize-handle"
              onMouseDown={handlePanelDragStart}
              title="Drag to resize panel"
            />
            <div className="panel-tabs">
              <div className={`panel-tab ${currentPanel === 'problems' ? 'active' : ''}`} onClick={() => setCurrentPanel('problems')}>
                Problems <span className="panel-count">{problems.length}</span>
              </div>
              <div className={`panel-tab ${currentPanel === 'output' ? 'active' : ''}`} onClick={() => setCurrentPanel('output')}>
                Output <span className="panel-count">{outputLogs.length}</span>
              </div>
              <div className={`panel-tab ${currentPanel === 'console' ? 'active' : ''}`} onClick={() => setCurrentPanel('console')}>
                Console <span className="panel-count">{consoleLogs.length}</span>
              </div>
              <div className={`panel-tab ${currentPanel === 'preview' ? 'active' : ''}`} onClick={() => setCurrentPanel('preview')}>
                Preview
              </div>
              <div className={`panel-tab ${currentPanel === 'terminal' ? 'active' : ''}`} onClick={() => setCurrentPanel('terminal')}>
                Terminal
              </div>
              {currentPanel === 'terminal' && (
                <button
                  type="button"
                  className="panel-action-btn"
                  onClick={() => setIsTerminalExpanded((prev) => !prev)}
                >
                  {isTerminalExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
            </div>

            <div className="panel-content">
              {currentPanel === 'problems' && renderProblemsPanel()}
              {currentPanel === 'output' && renderLogPanel(outputLogs, 'Editor and workspace activity will appear here')}
              {currentPanel === 'console' && renderLogPanel(consoleLogs, 'Application runtime logs will appear here')}
              {currentPanel === 'preview' && htmlPreview && (
                <iframe
                  title="HTML Preview"
                  srcDoc={htmlPreview}
                  style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                />
              )}
              {currentPanel === 'preview' && !htmlPreview && (
                <div className="empty-panel-message">No HTML preview. Run an HTML file to see preview here.</div>
              )}
              {currentPanel === 'terminal' && renderTerminalPanel()}
            </div>
          </div>

          <div className="status-bar">
            <div className="status-item">{problems.length > 0 ? `${problems.length} issue(s)` : 'No Issues'}</div>
            <div className="status-item">{activeTab ? activeTab.split('/').pop() || activeTab : '/'}</div>
            <div className="status-item" style={{ marginLeft: 'auto' }}>Ln {cursor.line}, Col {cursor.column}</div>
            <div className="status-item">UTF-8</div>
            <div className="status-item">{activeTab ? detectLanguage(activeTab) : 'Plain Text'}</div>
            <div className="status-item">{activeTab ? `${countLines(editorContent)} lines` : '0 lines'}</div>
          </div>
        </div>
      </div>
      {renderCreateFileDialog()}
    </div>
  );
};
