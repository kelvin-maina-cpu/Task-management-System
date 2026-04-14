import React, { useState, useCallback, useEffect } from 'react';
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

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  modified: boolean;
}

export interface DevSpaceProps {
  initialFileTree?: FileItem;
  readOnly?: boolean;
  onCodeChange?: (filePath: string, content: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const DevSpace: React.FC<DevSpaceProps> = ({
  initialFileTree,
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
    }
  );

  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPanel, setCurrentPanel] = useState<'console' | 'problems' | 'output' | 'terminal'>('console');
  const [editorContent, setEditorContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, type, message }]);
  }, []);

  // Initialize logs
  useEffect(() => {
    addLog('info', 'DevSpace initialized');
    addLog('success', 'Project loaded successfully');
  }, [addLog]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-container') && !target.closest('.menu-bar')) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [openMenu]);

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
      js: '📜',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      tsx: '⚛️',
      ts: '📘',
    };
    return icons[ext] || '📄';
  };

  const findFile = (path: string, tree: FileItem = fileTree): FileItem | null => {
    if (tree.name === path.split('/').pop() && path.includes(tree.name)) {
      return tree;
    }

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
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
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

    const newTab: OpenTab = {
      path,
      name: path.split('/').pop() || 'file',
      content: file.content || '',
      modified: false,
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

  const saveFile = () => {
    if (!activeTab) return;

    const tab = openTabs.find((t) => t.path === activeTab);
    if (tab) {
      setOpenTabs((prev) =>
        prev.map((t) =>
          t.path === activeTab ? { ...t, modified: false, content: editorContent } : t
        )
      );
      addLog('success', `Saved ${tab.name}`);
    }
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.currentTarget.value;
    setEditorContent(content);

    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.path === activeTab ? { ...tab, modified: true, content } : tab
      )
    );

    if (activeTab && onCodeChange) {
      onCodeChange(activeTab, content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = editorContent.substring(0, start) + '  ' + editorContent.substring(end);
      setEditorContent(newContent);
    }
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    if (onFullscreenChange) {
      onFullscreenChange(newFullscreenState);
    }
  };

  // Menu Handlers
  const handleMenuClick = (menu: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeMenu = () => setOpenMenu(null);

  const handleFileNew = () => {
    const fileName = prompt('Enter file name:') || 'untitled.js';
    const newTab: OpenTab = {
      path: `new/${fileName}`,
      name: fileName,
      content: '',
      modified: true,
    };
    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.path);
    setEditorContent('');
    addLog('info', `Created new file: ${fileName}`);
    closeMenu();
  };

  const handleFileOpen = () => {
    // Simulated file open - in real app, would use file input
    alert('Open File dialog would appear here');
    addLog('info', 'Open file dialog triggered');
    closeMenu();
  };

  const handleFileClose = () => {
    if (activeTab) {
      closeTab(activeTab);
      addLog('info', 'File closed');
    }
    closeMenu();
  };

  const handleFileSaveAll = () => {
    openTabs.forEach((tab) => {
      setOpenTabs((prev) =>
        prev.map((t) => (t.path === tab.path ? { ...t, modified: false } : t))
      );
    });
    addLog('success', 'All files saved');
    closeMenu();
  };

  const handleEditUndo = () => {
    addLog('info', 'Undo action');
    closeMenu();
  };

  const handleEditRedo = () => {
    addLog('info', 'Redo action');
    closeMenu();
  };

  const handleEditSelectAll = () => {
    const editor = document.querySelector('.code-editor') as HTMLTextAreaElement;
    if (editor) editor.select();
    closeMenu();
  };

  const handleViewToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    addLog('info', `Sidebar ${!sidebarVisible ? 'shown' : 'hidden'}`);
    closeMenu();
  };

  const handleViewTogglePanel = () => {
    setCurrentPanel(currentPanel === 'console' ? 'output' : 'console');
    addLog('info', `Switched to ${currentPanel === 'console' ? 'output' : 'console'}`);
    closeMenu();
  };

  const handleViewToggleWordWrap = () => {
    setWordWrap(!wordWrap);
    addLog('info', `Word wrap ${!wordWrap ? 'enabled' : 'disabled'}`);
    closeMenu();
  };

  const handleRunCode = () => {
    addLog('success', '▶ Executing code...');
    addLog('info', activeTab ? `Running ${activeTab}` : 'No file to run');
    closeMenu();
  };

  const handleRunDebug = () => {
    addLog('info', '🐛 Starting debugger...');
    closeMenu();
  };

  const handleHelpAbout = () => {
    alert('DevSpace v1.0\nA VS Code-like editor for the web\n\nMade with React');
    closeMenu();
  };

  const handleHelpDocumentation = () => {
    addLog('info', 'Opening documentation in browser...');
    closeMenu();
  };

  const handleHelpKeyboardShortcuts = () => {
    alert(`Keyboard Shortcuts:\nCtrl+S - Save\nCtrl+N - New File\nCtrl+O - Open File\nTab - Indent\nCtrl+/ - Toggle Comment`);
    closeMenu();
  };

  const renderFileTree = (item: FileItem, path: string = ''): React.ReactNode => {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(fullPath);

    return (
      <div key={fullPath}>
        <div
          className={`tree-item ${isFolder ? 'folder' : ''}`}
          onClick={() => {
            if (isFolder) {
              toggleFolder(fullPath);
            } else {
              openFile(fullPath);
            }
          }}
        >
          {isFolder && (
            <span className={`chevron ${isExpanded ? 'rotated' : ''}`}>▶</span>
          )}
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
    if (currentPanel === 'console') {
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
    } else if (currentPanel === 'problems') {
      return (
        <div className="panel-content">
          <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>
            No problems detected
          </div>
        </div>
      );
    } else if (currentPanel === 'output') {
      return (
        <div className="panel-content">
          <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>
            Build output will appear here...
          </div>
        </div>
      );
    } else {
      return (
        <div className="panel-content">
          <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
            <div>devspace@project:~$ <span style={{ color: 'var(--accent-green)' }}>npm</span> start</div>
            <div style={{ marginTop: '10px', color: 'var(--text-primary)' }}>
              &gt; my-project@1.0.0 start<br />
              &gt; node src/index.js<br />
              <br />
              <span style={{ color: 'var(--accent-green)' }}>✓</span> Server running on http://localhost:3000
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="devspace-container">
      {/* Header */}
      <div className="devspace-header">
        <div className="logo">
          <div className="logo-icon">D</div>
          <span>DevSpace</span>
        </div>
        <div className="menu-bar">
          {/* File Menu */}
          <div className="menu-container">
            <span 
              className="menu-item"
              onClick={(e) => handleMenuClick('file', e)}
            >
              File
            </span>
            {openMenu === 'file' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleFileNew}>📄 New File</div>
                <div className="menu-item-option" onClick={handleFileOpen}>📂 Open File</div>
                <div className="menu-item-divider"></div>
                <div className="menu-item-option" onClick={saveFile}>💾 Save</div>
                <div className="menu-item-option" onClick={handleFileSaveAll}>💾 Save All</div>
                <div className="menu-item-divider"></div>
                <div className="menu-item-option" onClick={handleFileClose}>✕ Close</div>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="menu-container">
            <span 
              className="menu-item"
              onClick={(e) => handleMenuClick('edit', e)}
            >
              Edit
            </span>
            {openMenu === 'edit' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleEditUndo}>↶ Undo</div>
                <div className="menu-item-option" onClick={handleEditRedo}>↷ Redo</div>
                <div className="menu-item-divider"></div>
                <div className="menu-item-option" onClick={handleEditSelectAll}>⊡ Select All</div>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="menu-container">
            <span 
              className="menu-item"
              onClick={(e) => handleMenuClick('view', e)}
            >
              View
            </span>
            {openMenu === 'view' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleViewToggleSidebar}>
                  {sidebarVisible ? '✓' : ' '} Explorer
                </div>
                <div className="menu-item-option" onClick={handleViewTogglePanel}>
                  🖥️ Bottom Panel
                </div>
                <div className="menu-item-divider"></div>
                <div className="menu-item-option" onClick={handleViewToggleWordWrap}>
                  {wordWrap ? '✓' : ' '} Word Wrap
                </div>
              </div>
            )}
          </div>

          {/* Run Menu */}
          <div className="menu-container">
            <span 
              className="menu-item"
              onClick={(e) => handleMenuClick('run', e)}
            >
              Run
            </span>
            {openMenu === 'run' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleRunCode}>▶ Run Code</div>
                <div className="menu-item-option" onClick={handleRunDebug}>🐛 Start Debugging</div>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="menu-container">
            <span 
              className="menu-item"
              onClick={(e) => handleMenuClick('help', e)}
            >
              Help
            </span>
            {openMenu === 'help' && (
              <div className="dropdown-menu" onClick={closeMenu}>
                <div className="menu-item-option" onClick={handleHelpDocumentation}>📖 Documentation</div>
                <div className="menu-item-option" onClick={handleHelpKeyboardShortcuts}>⌨️ Keyboard Shortcuts</div>
                <div className="menu-item-divider"></div>
                <div className="menu-item-option" onClick={handleHelpAbout}>ℹ️ About DevSpace</div>
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span>{isFullscreen ? '⛔' : '⛶'}</span> {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
          <button className="btn btn-primary" onClick={() => addLog('info', 'Code executed')}>
            <span>▶</span> Run
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`devspace-main ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        {/* Sidebar */}
        {!isFullscreen && sidebarVisible && (
        <div className="devspace-sidebar">
          <div className="sidebar-header">
            <span>Explorer</span>
            <div className="sidebar-actions">
              <button className="icon-btn" title="New File" onClick={handleFileNew}>
                📄
              </button>
              <button className="icon-btn" title="New Folder" onClick={() => {
                alert('New Folder feature coming soon');
              }}>
                📁
              </button>
              <button className="icon-btn" title="Refresh" onClick={() => {
                addLog('info', 'Project refreshed');
              }}>
                🔄
              </button>
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
              <div style={{ padding: '8px 15px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                No open files
              </div>
            ) : (
              openTabs.map((tab) => (
                <div
                  key={tab.path}
                  className={`tab ${activeTab === tab.path ? 'active' : ''} ${
                    tab.modified ? 'modified' : ''
                  }`}
                  onClick={() => {
                    setActiveTab(tab.path);
                    setEditorContent(tab.content);
                  }}
                >
                  <span className="tab-icon">{getFileIcon(tab.name)}</span>
                  <span>{tab.name}</span>
                  <span
                    className="tab-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.path);
                    }}
                  >
                    ×
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Editor with Minimap */}
          <div className="editor-main">
            <div className="editor-wrapper">
              {openTabs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚀</div>
                  <div className="empty-text">Welcome to DevSpace</div>
                  <div className="shortcuts">
                    <span className="shortcut-key">Ctrl+S</span>
                    <span>Save</span>
                    <span className="shortcut-key">Tab</span>
                    <span>Indent</span>
                  </div>
                </div>
              ) : (
                <textarea
                  className="code-editor"
                  value={editorContent}
                  onChange={handleEditorChange}
                  onKeyDown={handleKeyDown}
                  readOnly={readOnly}
                  spellCheck="false"
                />
              )}
            </div>
            {/* Minimap */}
            {openTabs.length > 0 && <div className="minimap"></div>}
          </div>

          {/* Bottom Panel */}
          <div className="bottom-panel">
            <div className="panel-tabs">
              <div
                className={`panel-tab ${currentPanel === 'console' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('console')}
              >
                <span>🖥️</span> Console
              </div>
              <div
                className={`panel-tab ${currentPanel === 'problems' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('problems')}
              >
                <span>⚠️</span> Problems <span>0</span>
              </div>
              <div
                className={`panel-tab ${currentPanel === 'output' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('output')}
              >
                <span>📤</span> Output
              </div>
              <div
                className={`panel-tab ${currentPanel === 'terminal' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('terminal')}
              >
                <span>💻</span> Terminal
              </div>
            </div>
            {renderPanelContent()}
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-item">
              <span>🌿</span> main
            </div>
            <div className="status-item" style={{ marginLeft: 'auto' }}>
              <span>Ln 1, Col 1</span>
            </div>
            <div className="status-item">
              <span>UTF-8</span>
            </div>
            <div className="status-item">
              <span>
                {activeTab ? activeTab.split('.').pop()?.toUpperCase() || 'Plain Text' : 'Plain Text'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
