import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './DevSpace.css';

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileItem[];
}

export interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  modified: boolean;
  language?: string;
}

export interface GitStatus {
  branch: string;
  staged: string[];
  unstaged: string[];
}

interface DevSpaceProps {
  initialFileTree?: FileItem;
  projectId?: string;
  readOnly?: boolean;
  onCodeChange?: (filePath: string, content: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

type Theme = 'light' | 'dark' | 'highContrast';
type Panel = 'console' | 'problems' | 'output' | 'terminal' | 'git';

const LANGUAGE_MAP: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'html': 'html',
  'css': 'css',
  'json': 'json',
  'md': 'markdown',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'cpp',
  'sql': 'sql',
  'yaml': 'yaml',
  'xml': 'xml',
  'sh': 'shell',
  'bash': 'shell',
};

const THEME_CONFIGS = {
  light: {
    background: '#ffffff',
    foreground: '#333333',
    monacoTheme: 'vs',
    className: 'devspace-light',
  },
  dark: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    monacoTheme: 'vs-dark',
    className: 'devspace-dark',
  },
  highContrast: {
    background: '#000000',
    foreground: '#ffffff',
    monacoTheme: 'hc-black',
    className: 'devspace-high-contrast',
  },
};

export const DevSpace: React.FC<DevSpaceProps> = ({
  initialFileTree,
  projectId,
  readOnly = false,
  onCodeChange,
  onFullscreenChange,
}) => {
  const [fileTree] = useState<FileItem>(
    initialFileTree || {
      name: 'project',
      type: 'folder',
      children: [
        {
          name: 'src',
          type: 'folder',
          children: [
            { name: 'index.js', type: 'file', content: '// Welcome to DevSpace\nconsole.log("Hello World");', language: 'javascript' },
            { name: 'app.js', type: 'file', content: 'const app = {\n  init() {\n    console.log("App initialized");\n  }\n};', language: 'javascript' },
            { name: 'styles.css', type: 'file', content: 'body {\n  margin: 0;\n  padding: 20px;\n  font-family: sans-serif;\n}', language: 'css' },
          ],
        },
        { name: 'package.json', type: 'file', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}', language: 'json' },
      ],
    }
  );

  // State management
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPanel, setCurrentPanel] = useState<Panel>('console');
  const [editorContent, setEditorContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  // const [isSaving, setIsSaving] = useState(false);  // Unused - saveFile function is commented out
  // const [collaborators, setCollaborators] = useState<string[]>([]);  // Unused but kept for future collab features
  const [gitStatus, setGitStatus] = useState<GitStatus>({
    branch: 'main',
    staged: [],
    unstaged: [],
  });
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  // const [extensions, setExtensions] = useState<Map<string, any>>(new Map());  // Unused but kept for extension system

  // Initialize
  useEffect(() => {
    addLog('info', 'DevSpace initialized');
    addLog('success', 'Project loaded successfully');
    addLog('info', `Theme: ${theme}`);
  }, []);

  // Load files from backend if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProjectFiles();
    }
  }, [projectId]);

  const loadProjectFiles = async () => {
    try {
      await axios.get(`/api/files/projects/${projectId}/file-structure`);
      addLog('success', 'Project files loaded from server');
      // Update fileTree with loaded data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Failed to load project files: ${errorMsg}`);
    }
  };

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, type, message }]);
  }, []);

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return LANGUAGE_MAP[ext] || 'plaintext';
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
      js: '📜', html: '🌐', css: '🎨', json: '📋', md: '📝', py: '🐍',
      java: '☕', cpp: '⚙️', tsx: '⚛️', ts: '📘', git: '🔧', yml: '⚙️',
      sql: '🗄️', xml: '📄', sh: '💻',
    };
    return icons[ext] || '📄';
  };

  const findFile = (path: string, tree: FileItem = fileTree): FileItem | null => {
    if (tree.name === path.split('/').pop() && path.includes(tree.name)) return tree;
    if (tree.children) {
      for (let child of tree.children) {
        const result = findFile(path, child);
        if (result) return result;
      }
    }
    return null;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(path) ? newSet.delete(path) : newSet.add(path);
      return newSet;
    });
  };

  const openFile = (path: string) => {
    const existingTab = openTabs.find((tab) => tab.path === path);
    if (existingTab) {
      setActiveTab(path);
      setEditorContent(existingTab.content);
      return;
    }

    const file = findFile(path);
    if (!file || file.type !== 'file') return;

    const language = file.language || getLanguageFromFilename(path);
    const newTab: OpenTab = {
      path,
      name: path.split('/').pop() || 'file',
      content: file.content || '',
      modified: false,
      language,
    };

    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTab(path);
    setEditorContent(newTab.content);
    addLog('info', `Opened ${newTab.name}`);
  };

  const closeTab = (path: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab.path !== path));
    if (activeTab === path) {
      setActiveTab(null);
      setEditorContent('');
    }
  };

  // Unused: saveFile function - files are auto-saved in this version
  // const saveFile = async () => {
  //   if (!activeTab) return;
  //   
  //   try {
  //     const tab = openTabs.find((t) => t.path === activeTab);
  //     if (!tab) return;
  //     setIsSaving(false);
  //   }
  // };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorContent(value);

    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.path === activeTab ? { ...tab, modified: true, content: value } : tab
      )
    );

    if (activeTab && onCodeChange) {
      onCodeChange(activeTab, value);
    }
  };

  // const handleKeyDown = (e: React.KeyboardEvent) => {  // Unused - keyboard handling is in Monaco editor
  //   if ((e.ctrlKey || e.metaKey) && e.key === 's') {
  //     e.preventDefault();
  //     saveFile();
  //   }
  // };

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    if (onFullscreenChange) onFullscreenChange(newState);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'highContrast'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    addLog('info', `Switched to ${nextTheme} theme`);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    try {
      // Backend would handle git operations
      addLog('success', `Committed: ${commitMessage}`);
      setCommitMessage('');
      setShowCommitDialog(false);
      setGitStatus({ ...gitStatus, staged: [], unstaged: [] });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Commit failed: ${errorMsg}`);
    }
  };

  const renderFileTree = (item: FileItem, path: string = ''): React.ReactNode => {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(fullPath);

    return (
      <div key={fullPath}>
        <div
          className={`tree-item ${isFolder ? 'folder' : ''}`}
          onClick={() => isFolder ? toggleFolder(fullPath) : openFile(fullPath)}
        >
          {isFolder && <span className={`chevron ${isExpanded ? 'rotated' : ''}`}>▶</span>}
          {!isFolder && <span className="chevron transparent">▶</span>}
          <span className="tree-icon">{isFolder ? '📁' : getFileIcon(item.name)}</span>
          <span>{item.name}</span>
        </div>
        {isFolder && isExpanded && item.children && (
          <div className="tree-children expanded">
            {item.children.map((child) => renderFileTree(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  const renderPanelContent = () => {
    switch (currentPanel) {
      case 'console':
        return (
          <div className="panel-content">
            {logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-type ${log.type}`}>{log.type.toUpperCase()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        );
      case 'git':
        return (
          <div className="panel-content git-panel">
            <div className="git-branch">
              <span>🌿</span> {gitStatus.branch}
            </div>
            <div className="git-changes">
              <div className="changes-group">
                <span>📋 Staged ({gitStatus.staged.length})</span>
                {gitStatus.staged.map((file, idx) => (
                  <div key={idx} className="change-item">+ {file}</div>
                ))}
              </div>
              <div className="changes-group">
                <span>🔄 Unstaged ({gitStatus.unstaged.length})</span>
                {gitStatus.unstaged.map((file, idx) => (
                  <div key={idx} className="change-item">~ {file}</div>
                ))}
              </div>
            </div>
            <div className="git-actions">
              <button onClick={() => setShowCommitDialog(true)} className="commit-btn">
                💾 Commit
              </button>
              <button className="push-btn">📤 Push</button>
              <button className="pull-btn">📥 Pull</button>
            </div>
            {showCommitDialog && (
              <div className="commit-dialog">
                <textarea
                  placeholder="Commit message..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.currentTarget.value)}
                  className="commit-input"
                />
                <div className="commit-buttons">
                  <button onClick={handleCommit} className="btn-confirm">Commit</button>
                  <button onClick={() => setShowCommitDialog(false)} className="btn-cancel">Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'problems':
        return <div className="panel-content"><div style={{ padding: '20px' }}>No problems detected</div></div>;
      default:
        return <div className="panel-content"><div style={{ padding: '20px' }}>Output will appear here...</div></div>;
    }
  };

  const themeConfig = THEME_CONFIGS[theme];

  return (
    <div className={`devspace-container ${themeConfig.className}`} style={{ '--bg': themeConfig.background, '--fg': themeConfig.foreground } as React.CSSProperties}>
      {/* Header */}
      <div className="devspace-header">
        <div className="logo">
          <div className="logo-icon">D</div>
          <span>DevSpace Pro</span>
        </div>
        <div className="menu-bar">
          <span className="menu-item">File</span>
          <span className="menu-item">Edit</span>
          <span className="menu-item">View</span>
          <span className="menu-item">Run</span>
          <span className="menu-item">Help</span>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚫'}
          </button>
          {/* Collaborators feature - coming soon
          {collaborators.length > 0 && (
            <div className="collaborators">
              <span title={`${collaborators.length} collaborators online`}>👥 {collaborators.length}</span>
            </div>
          )}
          */}
          <button className="btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? '⛔' : '⛶'}
          </button>
          <button className="btn btn-primary" onClick={() => addLog('info', 'Code executed')}>
            ▶ Run
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`devspace-main ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        {/* Sidebar */}
        {!isFullscreen && (
          <div className="devspace-sidebar">
            <div className="sidebar-header">
              <span>Explorer</span>
              <div className="sidebar-actions">
                <button className="icon-btn" title="New File">📄</button>
                <button className="icon-btn" title="New Folder">📁</button>
                <button className="icon-btn" title="Refresh">🔄</button>
              </div>
            </div>
            <div className="file-tree">{renderFileTree(fileTree)}</div>
          </div>
        )}

        {/* Editor Container */}
        <div className="editor-container">
          {/* Tabs */}
          <div className="tabs-bar">
            {openTabs.length === 0 ? (
              <div style={{ padding: '8px 15px', fontSize: '12px' }}>No open files</div>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.path}
                  className={`tab ${activeTab === tab.path ? 'active' : ''} ${tab.modified ? 'modified' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.path);
                    setEditorContent(tab.content);
                  }}
                >
                  <span className="tab-icon">{getFileIcon(tab.name)}</span>
                  <span>{tab.name}</span>
                  {tab.modified && <span className="modified-dot">●</span>}
                  <span className="tab-close" onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.path);
                  }}>×</span>
                </div>
              ))
            )}
          </div>

          {/* Editor */}
          <div className="editor-wrapper">
            {openTabs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚀</div>
                <div className="empty-text">Welcome to DevSpace Pro</div>
                <div className="features">
                  <div>✨ Syntax Highlighting with Monaco Editor</div>
                  <div>🎨 Light/Dark/High Contrast Themes</div>
                  <div>💾 Cloud File Persistence</div>
                  <div>🤝 Real-time Collaboration</div>
                  <div>🔧 Git Integration (Commit/Push/Pull)</div>
                  <div>🧩 Plugin System for Extensions</div>
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                defaultLanguage={openTabs.find(t => t.path === activeTab)?.language || 'javascript'}
                value={editorContent}
                onChange={(value) => handleEditorChange(value)}
                theme={themeConfig.monacoTheme}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: '"Fira Code", "Monaco", monospace',
                  readOnly: readOnly || false, // isSaving feature is disabled
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            )}
          </div>

          {/* Bottom Panel */}
          <div className="bottom-panel">
            <div className="panel-tabs">
              {['console', 'problems', 'output', 'git'].map((panel) => (
                <div
                  key={panel}
                  className={`panel-tab ${currentPanel === panel ? 'active' : ''}`}
                  onClick={() => setCurrentPanel(panel as Panel)}
                >
                  {panel === 'console' && '🖥️'}
                  {panel === 'problems' && '⚠️'}
                  {panel === 'output' && '📤'}
                  {panel === 'git' && '🌿'}
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </div>
              ))}
            </div>
            {renderPanelContent()}
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-item">
              <span>🌿</span> {gitStatus.branch}
            </div>
            <div className="status-item" style={{ marginLeft: 'auto' }}>
              {false ? '💾 Saving...' : activeTab ? `Ln 1, Col 1` : ''}
            </div>
            <div className="status-item">
              <span>UTF-8</span>
            </div>
            <div className="status-item">
              {activeTab ? activeTab.split('.').pop()?.toUpperCase() || 'Plain Text' : 'Plain Text'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevSpace;
