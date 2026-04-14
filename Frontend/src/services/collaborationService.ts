import { io, Socket } from 'socket.io-client';

export interface CollaborationEvent {
  type: 'edit' | 'cursor' | 'selection' | 'user-joined' | 'user-left';
  userId: string;
  username: string;
  projectId: string;
  filePath?: string;
  content?: string;
  cursorPosition?: { line: number; column: number };
  timestamp: number;
}

class CollaborationService {
  private socket: Socket | null = null;
  private projectId: string | null = null;
  private userId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Initialize WebSocket connection for real-time collaboration
   */
  connect(projectId: string, userId: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.projectId = projectId;
        this.userId = userId;

        // Initialize Socket.io connection
        this.socket = io(window.location.origin, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        // Join project room
        this.socket.emit('join-project', {
          projectId,
          userId,
          username,
        });

        this.socket.on('connect', () => {
          console.log('Connected to collaboration server');
          resolve();
        });

        this.socket.on('error', (error) => {
          console.error('Collaboration error:', error);
          reject(error);
        });

        // Listen for all collaboration events
        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // User events
    this.socket.on('user-joined', (data) => {
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      this.emit('user-left', data);
    });

    // File edit events
    this.socket.on('file-edit', (data) => {
      this.emit('file-edit', data);
    });

    // Cursor position updates
    this.socket.on('cursor-move', (data) => {
      this.emit('cursor-move', data);
    });

    // Selection changes
    this.socket.on('selection-change', (data) => {
      this.emit('selection-change', data);
    });

    // Collaborators list
    this.socket.on('collaborators-update', (data) => {
      this.emit('collaborators-update', data);
    });
  }

  /**
   * Broadcast file edit to other collaborators
   */
  broadcastFileEdit(
    filePath: string,
    content: string,
    startLine: number,
    endLine: number,
    change: string
  ): void {
    if (!this.socket || !this.projectId) return;

    this.socket.emit('file-edit', {
      projectId: this.projectId,
      userId: this.userId,
      filePath,
      content,
      startLine,
      endLine,
      change,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast cursor position to other collaborators
   */
  broadcastCursorPosition(filePath: string, line: number, column: number): void {
    if (!this.socket || !this.projectId) return;

    this.socket.emit('cursor-move', {
      projectId: this.projectId,
      userId: this.userId,
      filePath,
      line,
      column,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast selection to other collaborators
   */
  broadcastSelection(
    filePath: string,
    startLine: number,
    endLine: number,
    startColumn: number,
    endColumn: number
  ): void {
    if (!this.socket || !this.projectId) return;

    this.socket.emit('selection-change', {
      projectId: this.projectId,
      userId: this.userId,
      filePath,
      startLine,
      endLine,
      startColumn,
      endColumn,
      timestamp: Date.now(),
    });
  }

  /**
   * Get list of active collaborators
   */
  getCollaborators(): Promise<any[]> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve([]);
        return;
      }

      this.socket.emit('get-collaborators', {}, (collaborators: any[]) => {
        resolve(collaborators);
      });
    });
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit event to local listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    listeners.forEach((callback) => callback(data));
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }
}

export const collaborationService = new CollaborationService();
