import React, { useState, useEffect, useRef } from 'react';
import './DevSpaceProIDE.css';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  modified?: boolean;
}

interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

interface Problem {
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
  file: string;
  path: string;
}

export const DevSpaceProIDE: React.FC = () => {
  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const folderHandleRef = useRef<any>(null);
  
  const [fileTree, setFileTree] = useState<FileItem[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [consoleEntries, setConsoleEntries] = useState<any[]>([]);
  // const [terminalOutput, setTerminalOutput] = useState<string[]>([]);  // Unused but kept for future terminal integration
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [currentPanel, setCurrentPanel] = useState<'terminal' | 'console' | 'output' | 'problems'>('terminal');
  // const [sidebarVisible, setSidebarVisible] = useState(true);  // Unused but kept for future toggling
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [projectName, setProjectName] = useState('Default Project');
  // const [extensions, setExtensions] = useState<any[]>([  // Unused but kept for extension system
  //   { id: 'eslint', name: 'ESLint', icon: '📘', installed: false },
  //   { id: 'prettier', name: 'Prettier', icon: '🎨', installed: false },
  //   { id: 'python', name: 'Python', icon: '🐍', installed: false },
  //   { id: 'live-server', name: 'Live Server', icon: '🌐', installed: false },
  // ]);

  // Initialize Monaco Editor
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
    script.onload = initializeMonaco;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize file system
  useEffect(() => {
    const defaultFiles: Record<string, any> = {
      'src/index.js': {
        content: `// Welcome to DevSpace Pro IDE\nconsole.log('Hello World!');\n\nfunction greet(name) {\n  return 'Hello, ' + name;\n}\n\nconsole.log(greet('Developer'));`,
        language: 'javascript'
      },
      'src/app.js': {
        content: `export class App {\n  constructor() {\n    this.version = '1.0.0';\n  }\n  \n  start() {\n    console.log('App v' + this.version);\n  }\n}`,
        language: 'javascript'
      },
      'src/styles.css': {
        content: `* {\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: Arial, sans-serif;\n  background: #1e1e1e;\n  color: #fff;\n}`,
        language: 'css'
      },
      'public/index.html': {
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>DevSpace App</title>\n</head>\n<body>\n  <h1>Welcome!</h1>\n</body>\n</html>`,
        language: 'html'
      }
    };

    const buildTree = (files: Record<string, any>) => {
      const tree: FileItem[] = [];
      const paths = new Set<string>();

      Object.entries(files).forEach(([path, data]) => {
        const parts = path.split('/');
        
        parts.forEach((part, index) => {
          const currentPath = parts.slice(0, index + 1).join('/');
          
          if (!paths.has(currentPath)) {
            paths.add(currentPath);
            
            if (index === parts.length - 1) {
              // File
              tree.push({
                name: part,
                path: currentPath,
                type: 'file',
                content: data.content,
                language: data.language,
                modified: false
              });
            } else {
              // Folder
              if (!tree.some(t => t.path === currentPath)) {
                tree.push({
                  name: part,
                  path: currentPath,
                  type: 'folder',
                  modified: false
                });
              }
            }
          }
        });
      });

      return tree;
    };

    setFileTree(buildTree(defaultFiles));
  }, []);

  const initializeMonaco = () => {
    window.require.config({ 
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } 
    });

    window.require(['vs/editor/editor.main'], () => {
      const container = document.getElementById('monaco-editor');
      if (container) {
        monacoRef.current = window.monaco;
        
        const editor = monacoRef.current.editor.create(container, {
          value: '// Welcome to DevSpace Pro IDE\n// Start coding...',
          language: 'javascript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
          lineNumbers: 'on',
          folding: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          tabSize: 2,
          insertSpaces: true
        });

        editorRef.current = editor;

        editor.onDidChangeModelContent(() => {
          if (activeTab) {
            setEditorContent(editor.getValue());
            validateContent(editor.getValue(), activeTab);
          }
        });

        editor.onDidChangeCursorPosition((e: any) => {
          setCursorPosition({
            line: e.position.lineNumber,
            column: e.position.column
          });
        });
      }
    });
  };

  const validateContent = (content: string, filePath: string) => {
    const newProblems: Problem[] = [];
    const fileName = filePath.split('/').pop() || '';
    const language = filePath.split('.').pop() || '';

    // JavaScript validation
    if (language === 'js') {
      try {
        new Function(content);
      } catch (e: any) {
        newProblems.push({
          severity: 'error',
          message: e.message,
          line: 1,
          column: 1,
          file: fileName,
          path: filePath
        });
      }

      // Check for undefined variables
      const lines = content.split('\n');
      // const variables = new Set<string>();  // Unused in current implementation
      
      lines.forEach((line, idx) => {
        if (line.includes('undefined') && !line.includes('var ') && !line.includes('let ') && !line.includes('const ')) {
          const match = line.match(/(\w+)\s*=\s*undefined/);
          if (match) {
            newProblems.push({
              severity: 'warning',
              message: `'${match[1]}' is undefined`,
              line: idx + 1,
              column: 1,
              file: fileName,
              path: filePath
            });
          }
        }
      });
    }

    setProblems(newProblems);
  };

  const openFile = (path: string) => {
    const file = fileTree.find(f => f.path === path);
    if (!file || file.type === 'folder') return;

    const existingTab = openTabs.find(t => t.path === path);
    if (existingTab) {
      setActiveTab(path);
      if (editorRef.current) {
        editorRef.current.setValue(file.content || '');
      }
      return;
    }

    const newTab: OpenTab = {
      path,
      name: file.name,
      content: file.content || '',
      language: file.language || 'plaintext',
      modified: false
    };

    setOpenTabs([...openTabs, newTab]);
    setActiveTab(path);
    setEditorContent(file.content || '');

    if (editorRef.current && monacoRef.current) {
      const model = monacoRef.current.editor.createModel(
        file.content || '',
        file.language || 'plaintext'
      );
      editorRef.current.setModel(model);
    }
  };

  const closeTab = (path: string) => {
    const updatedTabs = openTabs.filter(t => t.path !== path);
    setOpenTabs(updatedTabs);

    if (activeTab === path) {
      if (updatedTabs.length > 0) {
        setActiveTab(updatedTabs[0].path);
      } else {
        setActiveTab(null);
        if (editorRef.current) {
          editorRef.current.setValue('');
        }
      }
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const addConsoleEntry = (level: 'info' | 'error' | 'warn' | 'success', message: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleEntries(prev => [...prev, { time, level, message }]);
  };

  const runCode = () => {
    if (!activeTab) {
      addConsoleEntry('warn', 'No file open to run');
      return;
    }

    const tab = openTabs.find(t => t.path === activeTab);
    if (!tab) return;

    setCurrentPanel('console');
    addConsoleEntry('info', `Running ${tab.name}...`);

    if (tab.language === 'javascript') {
      try {
        // Create a new function context with console
        const consoleProxy = {
          log: (...args: any[]) => {
            addConsoleEntry('info', args.map(a => String(a)).join(' '));
          },
          error: (...args: any[]) => {
            addConsoleEntry('error', args.map(a => String(a)).join(' '));
          },
          warn: (...args: any[]) => {
            addConsoleEntry('warn', args.map(a => String(a)).join(' '));
          }
        };

        const func = new Function('console', editorContent);
        func(consoleProxy);
        addConsoleEntry('success', 'Execution completed');
      } catch (e: any) {
        addConsoleEntry('error', e.message);
      }
    } else {
      addConsoleEntry('info', `Language '${tab.language}' execution not yet supported`);
    }
  };

  const saveFile = () => {
    if (!activeTab || !editorRef.current) return;

    const tab = openTabs.find(t => t.path === activeTab);
    if (!tab) return;

    const updated = openTabs.map(t =>
      t.path === activeTab ? { ...t, modified: false } : t
    );
    setOpenTabs(updated);
    addConsoleEntry('success', `Saved ${tab.name}`);

    // Save to folder if folder is open
    if (folderHandleRef.current) {
      saveFileToFolder(activeTab, editorRef.current.getValue());
    }
  };

  // Open folder from local PC using File System Access API
  const openFolderFromPC = async () => {
    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        addConsoleEntry('error', 'File System Access API not supported. Please use a modern browser (Chrome, Edge).');
        alert('File System Access API not supported. Please use Chrome, Edge, or another modern browser.');
        return;
      }

      const dirHandle = await (window as any).showDirectoryPicker();
      folderHandleRef.current = dirHandle;
      
      // Load project name from folder
      setProjectName(dirHandle.name);
      addConsoleEntry('info', `Opened folder: ${dirHandle.name}`);

      // Load all files from the folder
      await loadFilesFromFolder(dirHandle);
      addConsoleEntry('success', `Project loaded: ${dirHandle.name}`);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        addConsoleEntry('error', `Failed to open folder: ${error.message}`);
        console.error('Error opening folder:', error);
      }
    }
  };

  // Recursively load files from folder
  const loadFilesFromFolder = async (dirHandle: any, basePath = '') => {
    const files: FileItem[] = [];
    const pathSet = new Set<string>();

    const processFiles = async (handle: any, path: string) => {
      for await (const entry of (handle as any).values()) {
        const currentPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
          // Skip certain files
          if (['node_modules', '.git', 'dist', 'build'].some(name => currentPath.includes(name))) {
            continue;
          }

          // Only load text-based files
          const textExtensions = [
            'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json', 'md', 
            'py', 'java', 'cpp', 'c', 'h', 'rb', 'php', 'go', 'rs', 'yml', 'yaml', 'xml'
          ];
          
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';
          if (!textExtensions.includes(ext)) {
            continue;
          }

          try {
            const file = await entry.getFile();
            const content = await file.text();
            
            files.push({
              name: entry.name,
              path: currentPath,
              type: 'file',
              content: content,
              language: detectLanguage(entry.name),
              modified: false
            });
            
            pathSet.add(currentPath);
          } catch (error) {
            console.warn(`Could not read file ${currentPath}:`, error);
          }
        } else if (entry.kind === 'directory') {
          // Skip hidden folders and common node modules
          if (entry.name.startsWith('.') && entry.name !== '.env') {
            continue;
          }

          // Add folder to tree
          files.push({
            name: entry.name,
            path: currentPath,
            type: 'folder',
            modified: false
          });

          pathSet.add(currentPath);

          // Recursively process subdirectories
          try {
            await processFiles(entry, currentPath);
          } catch (error) {
            console.warn(`Could not access folder ${currentPath}:`, error);
          }
        }
      }
    };

    try {
      await processFiles(dirHandle, basePath);
      setFileTree(files);
    } catch (error) {
      addConsoleEntry('error', `Error loading folder contents: ${error}`);
    }
  };

  // Save file back to folder
  const saveFileToFolder = async (filePath: string, content: string) => {
    if (!folderHandleRef.current) return;

    try {
      const parts = filePath.split('/');
      let currentHandle = folderHandleRef.current;

      // Navigate to the correct directory
      for (let i = 0; i < parts.length - 1; i++) {
        try {
          currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
        } catch (error) {
          console.warn(`Could not get/create directory ${parts[i]}:`, error);
          return;
        }
      }

      // Get or create the file
      const fileName = parts[parts.length - 1];
      try {
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        addConsoleEntry('success', `File saved to disk: ${filePath}`);
      } catch (error) {
        console.warn(`Could not write file ${fileName}:`, error);
      }
    } catch (error) {
      console.error('Error saving file to folder:', error);
    }
  };

  // Create new file in the opened folder
  const newFileInFolder = async () => {
    if (!folderHandleRef.current) {
      addConsoleEntry('warn', 'Please open a folder first');
      return;
    }

    const fileName = prompt('Enter file name (e.g., index.js):');
    if (!fileName) return;

    try {
      const fileHandle = await folderHandleRef.current.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write('');
      await writable.close();

      // Reload folder
      await loadFilesFromFolder(folderHandleRef.current);
      addConsoleEntry('success', `Created file: ${fileName}`);
    } catch (error) {
      addConsoleEntry('error', `Failed to create file: ${error}`);
    }
  };

  // Create new folder in the opened folder
  const newFolderInPC = async () => {
    if (!folderHandleRef.current) {
      addConsoleEntry('warn', 'Please open a folder first');
      return;
    }

    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      await folderHandleRef.current.getDirectoryHandle(folderName, { create: true });
      await loadFilesFromFolder(folderHandleRef.current);
      addConsoleEntry('success', `Created folder: ${folderName}`);
    } catch (error) {
      addConsoleEntry('error', `Failed to create folder: ${error}`);
    }
  };

  const detectLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',
      'html': 'html', 'css': 'css', 'scss': 'scss',
      'json': 'json', 'md': 'markdown',
      'py': 'python', 'java': 'java',
      'cpp': 'cpp', 'c': 'c',
      'go': 'go', 'rs': 'rust',
      'rb': 'ruby', 'php': 'php',
      'sql': 'sql', 'sh': 'shell',
      'yml': 'yaml', 'yaml': 'yaml'
    };
    return langMap[ext] || 'plaintext';
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item.path);
        const children = fileTree.filter(f => 
          f.path.startsWith(item.path + '/') && 
          f.path.split('/').length === item.path.split('/').length + 1
        );

        return (
          <div key={item.path}>
            <div
              className="tree-item folder"
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              <span className={`chevron ${isExpanded ? 'rotated' : ''}`}>▶</span>
              <span className="tree-icon">📁</span>
              <span>{item.name}</span>
            </div>
            {isExpanded && renderFileTree(children, depth + 1)}
          </div>
        );
      } else {
        return (
          <div
            key={item.path}
            className={`tree-item file ${activeTab === item.path ? 'active' : ''}`}
            onClick={() => openFile(item.path)}
            style={{ paddingLeft: `${depth * 16}px` }}
            title={item.path}
          >
            <span className="tree-icon">{getFileIcon(item.name)}</span>
            <span>{item.name}</span>
          </div>
        );
      }
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const icons: Record<string, string> = {
      js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
      html: '🌐', css: '🎨', json: '📋', md: '📝',
      py: '🐍', java: '☕', cpp: '⚙️'
    };
    return icons[ext] || '📄';
  };

  useEffect(() => {
    if (openTabs.length === 0 && editorRef.current) {
      editorRef.current.setValue('// Open a file to start coding...');
    }
  }, [openTabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
        addConsoleEntry('success', `Saved: ${activeTab || 'file'}`);
      }
      // Ctrl+N: New file
      else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (folderHandleRef.current) {
          newFileInFolder();
        } else {
          addConsoleEntry('warn', 'Open a folder first (📂 button)');
        }
      }
      // Ctrl+Shift+N: New folder
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        if (folderHandleRef.current) {
          newFolderInPC();
        } else {
          addConsoleEntry('warn', 'Open a folder first (📂 button)');
        }
      }
      // Ctrl+`: Toggle terminal (if implemented)
      else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        // Future: Toggle bottom panel
        addConsoleEntry('info', 'Terminal toggle - coming soon!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, openTabs, folderHandleRef.current]);

  return (
    <div className="devspace-pro-ide">
      {/* Header */}
      <div className="ide-header">
        <div className="ide-logo">
          <span style={{ fontSize: '20px' }}>🚀</span>
          <span>DevSpace Pro IDE</span>
        </div>
        <div className="ide-menu-bar">
          <span 
            className="ide-menu-item" 
            onClick={openFolderFromPC}
            title="Open Folder from your computer"
            style={{ cursor: 'pointer' }}
          >
            File
          </span>
          <span className="ide-menu-item">Edit</span>
          <span className="ide-menu-item">View</span>
          <span className="ide-menu-item">Run</span>
          <span className="ide-menu-item">Help</span>
        </div>
        <div className="ide-header-actions">
          <button className="ide-btn" onClick={() => setCurrentPanel('problems')}>
            ⚠️ Issues ({problems.length})
          </button>
          <button className="ide-btn ide-btn-primary" onClick={runCode}>
            ▶ Run
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="ide-container">
        {/* Sidebar - Always visible (toggling feature coming soon)
        {sidebarVisible && ( */}
          <div className="ide-sidebar">
            <div className="sidebar-header">
              <span title={projectName} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {projectName}
              </span>
              <div className="sidebar-actions">
                <button 
                  className="icon-btn" 
                  title="Open Folder from PC"
                  onClick={openFolderFromPC}
                  style={{ fontSize: '16px' }}
                >
                  📂
                </button>
                <button 
                  className="icon-btn" 
                  title="New File"
                  onClick={newFileInFolder}
                >
                  📄
                </button>
                <button 
                  className="icon-btn" 
                  title="New Folder"
                  onClick={newFolderInPC}
                >
                  📁
                </button>
                <button 
                  className="icon-btn" 
                  title="Refresh"
                  onClick={() => {
                    if (folderHandleRef.current) {
                      loadFilesFromFolder(folderHandleRef.current);
                      addConsoleEntry('info', 'Project refreshed');
                    }
                  }}
                >
                  🔄
                </button>
              </div>
            </div>
            <div className="file-tree">
              {renderFileTree(fileTree.filter(f => !f.path.includes('/')))}
            </div>
          </div>
        {/* Sidebar toggling feature coming soon - so sidebar is always visible */}

        {/* Editor Container */}
        <div className="ide-editor-container">
          {/* Tabs */}
          <div className="ide-tabs">
            {openTabs.map(tab => (
              <div
                key={tab.path}
                className={`ide-tab ${activeTab === tab.path ? 'active' : ''} ${tab.modified ? 'modified' : ''}`}
                onClick={() => {
                  setActiveTab(tab.path);
                  const file = fileTree.find(f => f.path === tab.path);
                  if (file && editorRef.current) {
                    editorRef.current.setValue(file.content || '');
                  }
                }}
              >
                <span className="tab-icon">{getFileIcon(tab.name)}</span>
                <span className="tab-name">{tab.name}</span>
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
            ))}
          </div>

          {/* Editor */}
          <div className="ide-editor-wrapper">
            <div id="monaco-editor" style={{ width: '100%', height: '100%' }}></div>
          </div>

          {/* Bottom Panel */}
          <div className="ide-bottom-panel">
            <div className="panel-tabs">
              <div
                className={`panel-tab ${currentPanel === 'console' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('console')}
              >
                Console
              </div>
              <div
                className={`panel-tab ${currentPanel === 'terminal' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('terminal')}
              >
                Terminal
              </div>
              <div
                className={`panel-tab ${currentPanel === 'problems' ? 'active' : ''}`}
                onClick={() => setCurrentPanel('problems')}
              >
                Problems ({problems.length})
              </div>
            </div>

            {/* Panel Content */}
            <div className="panel-content">
              {currentPanel === 'console' && (
                <div className="console-output">
                  {consoleEntries.length === 0 ? (
                    <div className="empty-state">Ready to execute code...</div>
                  ) : (
                    consoleEntries.map((entry, idx) => (
                      <div key={idx} className={`console-entry console-${entry.level}`}>
                        <span className="console-time">{entry.time}</span>
                        <span className="console-level">{entry.level.toUpperCase()}</span>
                        <span className="console-message">{entry.message}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentPanel === 'terminal' && (
                <div className="terminal-output" ref={terminalRef}>
                  <div className="empty-state">Terminal ready...</div>
                </div>
              )}

              {currentPanel === 'problems' && (
                <div className="problems-output">
                  {problems.length === 0 ? (
                    <div className="empty-state">No problems detected 🎉</div>
                  ) : (
                    problems.map((problem, idx) => (
                      <div key={idx} className={`problem-item ${problem.severity}`}>
                        <span className="problem-icon">
                          {problem.severity === 'error' ? '❌' : '⚠️'}
                        </span>
                        <div className="problem-detail">
                          <div className="problem-message">{problem.message}</div>
                          <div className="problem-location">
                            {problem.file} [{problem.line}:{problem.column}]
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="ide-status-bar">
            <div className="status-item">
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </div>
            <div className="status-item">UTF-8</div>
            <div className="status-item">
              {activeTab ? activeTab.split('.').pop()?.toUpperCase() : 'Plain Text'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
