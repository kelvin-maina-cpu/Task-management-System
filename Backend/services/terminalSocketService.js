const path = require('path');
const jwt = require('jsonwebtoken');
const pty = require('node-pty');
const { Server } = require('socket.io');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const TERMINAL_NAMESPACE = '/terminal';

function resolveWorkspaceDir(relativePath = '.') {
  const targetPath = path.resolve(WORKSPACE_ROOT, relativePath);
  const normalizedRoot = `${WORKSPACE_ROOT}${path.sep}`;
  const normalizedTarget = `${targetPath}${path.sep}`;

  if (targetPath !== WORKSPACE_ROOT && !normalizedTarget.startsWith(normalizedRoot)) {
    throw new Error('Requested terminal path is outside the workspace');
  }

  return targetPath;
}

function createPty(cwd) {
  const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/sh';
  const args = process.platform === 'win32' ? ['-NoLogo'] : [];

  return pty.spawn(shell, args, {
    name: 'xterm-color',
    cwd,
    env: process.env,
    cols: 120,
    rows: 30,
  });
}

function initializeTerminalSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    path: '/socket.io',
  });

  const terminalNamespace = io.of(TERMINAL_NAMESPACE);

  terminalNamespace.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Missing auth token'));
      }

      const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.data.user = user;
      return next();
    } catch (error) {
      return next(new Error('Invalid auth token'));
    }
  });

  terminalNamespace.on('connection', (socket) => {
    let shell;

    try {
      const requestedCwd = typeof socket.handshake.auth?.cwd === 'string'
        ? socket.handshake.auth.cwd
        : '.';
      const cwd = resolveWorkspaceDir(requestedCwd);
      shell = createPty(cwd);
      socket.data.shell = shell;
      socket.emit('terminal:ready', {
        cwd: path.relative(WORKSPACE_ROOT, cwd) || '.',
        shell: process.platform === 'win32' ? 'powershell' : 'shell',
      });
    } catch (error) {
      socket.emit('terminal:error', {
        message: error.message || 'Unable to start terminal session',
      });
      socket.disconnect(true);
      return;
    }

    shell.onData((data) => {
      socket.emit('terminal:data', data);
    });

    shell.onExit(({ exitCode }) => {
      socket.emit('terminal:exit', { exitCode });
    });

    socket.on('terminal:input', (input) => {
      if (typeof input === 'string') {
        shell.write(input);
      }
    });

    socket.on('terminal:resize', ({ cols, rows }) => {
      if (typeof cols === 'number' && typeof rows === 'number') {
        shell.resize(cols, rows);
      }
    });

    socket.on('disconnect', () => {
      try {
        shell.kill();
      } catch (_error) {
        // Ignore shell cleanup errors on disconnect.
      }
    });
  });

  return io;
}

module.exports = {
  initializeTerminalSocket,
  resolveWorkspaceDir,
};
