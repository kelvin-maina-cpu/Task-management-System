/**
 * Plugin System for DevSpace
 * Allows developers to extend DevSpace with custom language support and features
 */

export interface LanguagePlugin {
  name: string;
  version: string;
  extensions: string[];
  language: string;
  monacoLanguage?: string;
  highlighter?: (code: string) => string;
  formatter?: (code: string) => string;
  linter?: (code: string) => LintError[];
  snippets?: CodeSnippet[];
}

export interface CodeSnippet {
  label: string;
  detail?: string;
  insertText: string;
  kind?: 'snippet' | 'keyword' | 'variable';
}

export interface LintError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ThemePlugin {
  name: string;
  version: string;
  theme: {
    monacoTheme?: string;
    colors?: Record<string, string>;
    tokenColors?: any[];
  };
}

export interface StatusBarItem {
  id: string;
  label: string;
  priority?: number;
  onClick?: () => void;
}

export interface DevSpacePlugin {
  name: string;
  version: string;
  activate: (context: PluginContext) => void;
  deactivate?: () => void;
}

export interface PluginContext {
  registerLanguage: (plugin: LanguagePlugin) => void;
  registerTheme: (plugin: ThemePlugin) => void;
  registerStatusBarItem: (item: StatusBarItem) => void;
  registerCommand: (command: string, callback: Function) => void;
  onCommand: (command: string, callback: Function) => void;
  workspace: {
    getCurrentFile: () => string | null;
    getFileContent: () => string;
    setFileContent: (content: string) => void;
  };
  logger: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
}

class PluginManager {
  private plugins: Map<string, DevSpacePlugin> = new Map();
  private languages: Map<string, LanguagePlugin> = new Map();
  private themes: Map<string, ThemePlugin> = new Map();
  private commands: Map<string, Function[]> = new Map();
  private statusBarItems: Map<string, StatusBarItem> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Load a plugin
   */
  async loadPlugin(
    plugin: DevSpacePlugin,
    context: PluginContext
  ): Promise<void> {
    try {
      this.plugins.set(plugin.name, plugin);
      plugin.activate(context);
      this.emit('plugin-loaded', { name: plugin.name, version: plugin.version });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.emit('plugin-error', {
        name: plugin.name,
        error: errorMsg,
      });
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  unloadPlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return;

    if (plugin.deactivate) {
      plugin.deactivate();
    }
    this.plugins.delete(pluginName);
    this.emit('plugin-unloaded', { name: pluginName });
  }

  /**
   * Register a language
   */
  registerLanguage(plugin: LanguagePlugin): void {
    this.languages.set(plugin.language, plugin);
    this.emit('language-registered', { language: plugin.language });
  }

  /**
   * Register a theme
   */
  registerTheme(plugin: ThemePlugin): void {
    this.themes.set(plugin.name, plugin);
    this.emit('theme-registered', { name: plugin.name });
  }

  /**
   * Register a statusbar item
   */
  registerStatusBarItem(item: StatusBarItem): void {
    this.statusBarItems.set(item.id, item);
    this.emit('statusbar-item-registered', item);
  }

  /**
   * Register a command
   */
  registerCommand(command: string, callback: Function): void {
    if (!this.commands.has(command)) {
      this.commands.set(command, []);
    }
    this.commands.get(command)!.push(callback);
  }

  /**
   * Execute a command
   */
  executeCommand(command: string, ...args: any[]): void {
    const callbacks = this.commands.get(command);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error executing command ${command}:`, error);
      }
    });
  }

  /**
   * Get language support
   */
  getLanguage(language: string): LanguagePlugin | undefined {
    return this.languages.get(language);
  }

  /**
   * Get all registered languages
   */
  getLanguages(): LanguagePlugin[] {
    return Array.from(this.languages.values());
  }

  /**
   * Get theme
   */
  getTheme(name: string): ThemePlugin | undefined {
    return this.themes.get(name);
  }

  /**
   * Get all themes
   */
  getThemes(): ThemePlugin[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get status bar items
   */
  getStatusBarItems(): StatusBarItem[] {
    return Array.from(this.statusBarItems.values()).sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
  }

  /**
   * Lint code with registered language plugin
   */
  lintCode(language: string, code: string): LintError[] {
    const plugin = this.languages.get(language);
    if (!plugin || !plugin.linter) return [];

    return plugin.linter(code);
  }

  /**
   * Format code with registered language plugin
   */
  formatCode(language: string, code: string): string {
    const plugin = this.languages.get(language);
    if (!plugin || !plugin.formatter) return code;

    return plugin.formatter(code);
  }

  /**
   * Get code snippets for language
   */
  getSnippets(language: string): CodeSnippet[] {
    const plugin = this.languages.get(language);
    return plugin?.snippets || [];
  }

  /**
   * Subscribe to plugin events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Emit plugin event
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener:`, error);
      }
    });
  }

  /**
   * Get all plugins
   */
  getPlugins(): DevSpacePlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();

/**
 * Example built-in plugins
 */

// Python Language Plugin
export const pythonPlugin: LanguagePlugin = {
  name: 'Python',
  version: '1.0.0',
  extensions: ['.py'],
  language: 'python',
  monacoLanguage: 'python',
  snippets: [
    {
      label: 'for loop',
      insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
      kind: 'snippet',
    },
    {
      label: 'function',
      insertText: 'def ${1:function_name}(${2:args}):\n    """${3:docstring}"""\n    ${4:pass}',
      kind: 'snippet',
    },
    {
      label: 'class',
      insertText: 'class ${1:ClassName}:\n    def __init__(self, ${2:args}):\n        ${3:pass}',
      kind: 'snippet',
    },
  ],
};

// TypeScript Language Plugin
export const typescriptPlugin: LanguagePlugin = {
  name: 'TypeScript',
  version: '1.0.0',
  extensions: ['.ts', '.tsx'],
  language: 'typescript',
  monacoLanguage: 'typescript',
  snippets: [
    {
      label: 'interface',
      insertText: 'interface ${1:InterfaceName} {\n    ${2:property}: ${3:type};\n}',
      kind: 'snippet',
    },
    {
      label: 'async function',
      insertText: 'async function ${1:functionName}(${2:args}): Promise<${3:type}> {\n    ${4:}\n}',
      kind: 'snippet',
    },
    {
      label: 'arrow function',
      insertText: 'const ${1:name} = (${2:args}): ${3:type} => {\n    ${4:}\n};',
      kind: 'snippet',
    },
  ],
};

// SQL Language Plugin
export const sqlPlugin: LanguagePlugin = {
  name: 'SQL',
  version: '1.0.0',
  extensions: ['.sql'],
  language: 'sql',
  monacoLanguage: 'sql',
  snippets: [
    {
      label: 'SELECT',
      insertText: 'SELECT ${1:columns} FROM ${2:table} WHERE ${3:condition};',
      kind: 'snippet',
    },
    {
      label: 'INSERT',
      insertText: 'INSERT INTO ${1:table} (${2:columns}) VALUES (${3:values});',
      kind: 'snippet',
    },
    {
      label: 'UPDATE',
      insertText: 'UPDATE ${1:table} SET ${2:column} = ${3:value} WHERE ${4:condition};',
      kind: 'snippet',
    },
    {
      label: 'DELETE',
      insertText: 'DELETE FROM ${1:table} WHERE ${2:condition};',
      kind: 'snippet',
    },
  ],
};
