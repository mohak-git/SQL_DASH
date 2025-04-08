const { app, BrowserWindow, ipcMain, shell, Tray, Menu } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const configManager = require('./config/config-manager');

let mainWindow = null;
let tray = null;
let backendProcess = null;
let frontendProcess = null;

// --- Helper: Log to Renderer --- 
function logToRenderer(server, message) {
    if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-log', { server, message });
    }
}

// --- Process Killing Functions (killProcessOnPort, killProcessTree) --- 
// Use logToRenderer instead of direct mainWindow access
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (stdout) {
                    const lines = stdout.trim().split('\n');
                    const killPromises = lines.map(line => {
                        if (line.includes(`:${port}`)) {
                            const parts = line.trim().split(/\s+/);
                            const pid = parts[parts.length - 1]; 
                            if (pid && pid !== '0') {
                                return new Promise(res => {
                                    exec(`taskkill /F /PID ${pid}`, (err) => {
                                        if (!err) {
                                            logToRenderer('system', `Killed process ${pid} using port ${port}`);
                                        }
                                        res();
                                    });
                                });
                            }
                        }
                        return Promise.resolve();
                    });
                    Promise.all(killPromises).then(resolve);
                } else {
                    resolve();
                }
            });
        } else {
            exec(`lsof -i tcp:${port} -t`, (error, stdout) => {
                if (stdout) {
                    const pids = stdout.trim().split('\n').filter(pid => pid);
                    const killPromises = pids.map(pid => {
                        return new Promise(res => {
                            exec(`kill -9 ${pid}`, (err) => {
                                if (!err) {
                                    logToRenderer('system', `Killed process ${pid} using port ${port}`);
                                }
                                res();
                            });
                        });
                    });
                    Promise.all(killPromises).then(resolve);
                } else {
                    resolve();
                }
            });
        }
    });
}

function killProcessTree(pid) {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            exec(`taskkill /F /T /PID ${pid}`, (error) => {
                if (!error) {
                    logToRenderer('system', `Killed process tree for PID ${pid}`);
                }
                resolve();
            });
        } else {
            exec(`pgrep -P ${pid}`, (error, stdout) => {
                const children = stdout ? stdout.trim().split('\n') : [];
                const killPromises = children.map(childPid => {
                    return new Promise(res => exec(`kill -9 ${childPid}`, () => res()));
                });
                Promise.all(killPromises).then(() => {
                    exec(`kill -9 ${pid}`, (err) => {
                         if (!err) {
                             logToRenderer('system', `Killed parent process ${pid}`);
                         }
                         resolve();
                    });
                });
            });
        }
    });
}

// --- Window Creation --- 
function createOrShowMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, 
  });
  mainWindow.loadFile('dashboard.html');
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Send initial statuses upon showing
    logToRenderer('system', 'Dashboard loaded. Sending initial server statuses.');
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-status', { server: 'backend', isRunning: !!backendProcess });
        mainWindow.webContents.send('server-status', { server: 'frontend', isRunning: !!frontendProcess });
    }
  });
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) { 
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- Tray Creation --- 
function createTray() {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png'; // Platform specific icon
  const iconPath = path.join(__dirname, 'assets', iconName); 
  
  try {
      if (!fs.existsSync(iconPath)) {
          throw new Error(`Icon not found: ${iconPath}`);
      }
      tray = new Tray(iconPath);
  } catch (error) {
      console.error("Failed to create tray icon:", error);
      logToRenderer('system', `Error creating tray icon: ${error.message}. Using fallback.`);
      // Fallback needed - create a simple text-based tray if possible or handle error
      // For now, we might skip tray creation on error
      return; // Exit if tray can't be created
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Dashboard', click: () => createOrShowMainWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; quitApplication(); } },
  ]);
  tray.setToolTip('Server Control Dashboard');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.isVisible() ? mainWindow.hide() : createOrShowMainWindow();
      } else {
          createOrShowMainWindow();
      }
  });
}

// --- Server Management --- 
async function startServer(serverType) {
  // Enforce Backend-First constraint
  if (serverType === 'frontend' && !backendProcess) {
      logToRenderer('frontend', 'Cannot start: Backend server must be running first.');
      return;
  }
  // Prevent double-starting
  if ((serverType === 'backend' && backendProcess) || (serverType === 'frontend' && frontendProcess)) {
      logToRenderer(serverType, 'Server is already running.');
      return;
  }

  const config = configManager.loadConfig(serverType);
  const serverPath = path.join(__dirname, serverType);
  const logFilePath = configManager.getLogFilePath(serverType);
  
  logToRenderer(serverType, `Attempting to start ${config.name} on port ${config.port}...`);

  await killProcessOnPort(config.port);
  logToRenderer(serverType, `Ensured port ${config.port} is free.`);

  fs.closeSync(fs.openSync(logFilePath, 'a')); 
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  
  const command = 'npm run dev'; 
  
  // --- Inject Environment Variable for Frontend --- 
  let env = { ...process.env }; // Inherit current environment
  if (serverType === 'frontend') {
      const backendConfig = configManager.loadConfig('backend');
      const actualBackendUrl = `http://${backendConfig.host}:${backendConfig.port}`;
      env.ACTUAL_BACKEND_URL = actualBackendUrl; // Set the env var
      logToRenderer('frontend', `Injecting ACTUAL_BACKEND_URL=${actualBackendUrl} into frontend process.`);
  }
  // ---------------------------------------------

  const newProcess = exec(command, { cwd: serverPath, env: env }); // Pass the modified environment

  logToRenderer(serverType, `Starting process with PID ${newProcess.pid}...`);

  const streamLogs = (stream, prefix) => {
    stream.on('data', (data) => {
      const message = data.toString();
      const logEntry = `[${new Date().toISOString()}] ${prefix}${message}`;
      logStream.write(logEntry);
      logToRenderer(serverType, message.trim());
    });
  };
  streamLogs(newProcess.stdout, 'STDOUT: ');
  streamLogs(newProcess.stderr, 'STDERR: ');

  newProcess.on('error', (error) => {
    console.error(`Error executing ${serverType} process:`, error);
    logToRenderer(serverType, `Process Error: ${error.message}`);
    logStream.write(`[${new Date().toISOString()}] PROCESS ERROR: ${error.message}\n`);
    // Attempt to clean up if start failed
    if (serverType === 'backend') backendProcess = null;
    else frontendProcess = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-status', { server: serverType, isRunning: false });
    }
    logStream.end();
  });

  newProcess.on('close', (code) => {
    const message = `Process ${newProcess.pid} exited with code ${code}.`;
    logToRenderer(serverType, message);
    logStream.write(`[${new Date().toISOString()}] ${message}\n`);
    logStream.end();
    if ((serverType === 'backend' && backendProcess === newProcess) || (serverType === 'frontend' && frontendProcess === newProcess)) {
        if (serverType === 'backend') {
            backendProcess = null;
            // If backend closed unexpectedly, stop frontend
            if (frontendProcess) {
                logToRenderer('frontend', 'Backend closed unexpectedly. Stopping frontend.');
                stopServer('frontend', true); // Pass flag
            }
        } else {
            frontendProcess = null;
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('server-status', { server: serverType, isRunning: false });
        }
    }
  });

  if (serverType === 'backend') {
    backendProcess = newProcess;
  } else {
    frontendProcess = newProcess;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('server-status', { server: serverType, isRunning: true });
      logToRenderer(serverType, `${config.name} started successfully.`);
  }
}

async function stopServer(serverType, triggeredByBackendStop = false) { // Add flag
  const processToStop = serverType === 'backend' ? backendProcess : frontendProcess;
  if (processToStop) {
    logToRenderer(serverType, `Stopping server (PID: ${processToStop.pid})...`);
    try {
      await killProcessTree(processToStop.pid);
      
      if (serverType === 'backend') {
        backendProcess = null;
        // Stop frontend if backend is stopped
        if (frontendProcess && !triggeredByBackendStop) { // Avoid recursion if already triggered
            logToRenderer('frontend', 'Backend stopped. Stopping frontend.');
            await stopServer('frontend', true); // Pass flag
        }
      } else {
        frontendProcess = null;
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('server-status', { server: serverType, isRunning: false });
          logToRenderer(serverType, 'Server stopped completely.');
      }

    } catch (error) {
      logToRenderer(serverType, `Error stopping server: ${error.message}`);
    }
  } else {
     logToRenderer(serverType, 'Server is not running.');
  }
}

async function restartServer(serverType) {
  const isBackendRestart = serverType === 'backend';
  const wasFrontendRunning = !!frontendProcess;
  
  logToRenderer(serverType, 'Attempting server restart...');
  
  await stopServer(serverType);
  await new Promise(resolve => setTimeout(resolve, 500)); 
  await startServer(serverType);

  // If backend restarted and frontend was running, restart frontend too
  if (isBackendRestart && wasFrontendRunning) {
      logToRenderer('frontend', 'Backend restarted. Restarting frontend to ensure connection.');
      await restartServer('frontend'); 
  }
}

// --- Utility Functions --- 
function openBrowser(serverType) {
  if (frontendProcess) { 
      const url = configManager.getServerUrl(serverType);
      shell.openExternal(url);
  } else {
      logToRenderer(serverType, 'Frontend server is not running.');
  }
}

function openConfigFile(serverType) {
    const configPath = configManager.getConfigPath(serverType);
    shell.openPath(configPath).catch(err => {
        console.error(`Failed to open config file ${configPath}:`, err);
        logToRenderer('system', `Failed to open config file: ${configPath}`);
    });
}

// --- Application Lifecycle --- 
async function quitApplication() {
  console.log('Initiating application quit...');
  logToRenderer('system', 'Quitting application...');
  app.isQuitting = true; // Ensure flag is set
  configManager.cleanup(); 
  
  // Stop frontend first (if dependent)
  if (frontendProcess) await stopServer('frontend', true);
  // Then stop backend
  if (backendProcess) await stopServer('backend');
  
  console.log('Servers stopped.');
  if (tray) {
      tray.destroy();
  }
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      createOrShowMainWindow(); 
    }
  });

  app.whenReady().then(() => {
    configManager.initialize();
    
    configManager.on('configChanged', async (serverType) => {
      const isBackendChange = serverType === 'backend';
      const backendRunning = !!backendProcess;
      const frontendRunning = !!frontendProcess;
      
      let restartInitiated = false;
      
      // Restart the changed server if it was running
      if ((isBackendChange && backendRunning) || (!isBackendChange && frontendRunning)) {
          logToRenderer(serverType, 'Configuration changed detected. Restarting server...');
          await restartServer(serverType);
          restartInitiated = true;
      }
       // If backend config changed AND frontend was running, restart frontend (handled within restartServer)
       // No need for extra logic here now
      
      if(!restartInitiated) {
          logToRenderer(serverType, 'Configuration changed detected. Changes will apply on next start.');
      }
    });
    
    createTray();
    createOrShowMainWindow(); 

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createOrShowMainWindow();
      else if (mainWindow) mainWindow.show(); 
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // Don't quit
    }
  });

  app.on('before-quit', async (event) => { // Make async
      if (!app.isQuitting) { 
        event.preventDefault(); 
        // Initiate graceful quit when triggered externally (like Cmd+Q)
        await quitApplication(); 
      } else {
         console.log('Quit allowed via tray or explicit call.');
      }
  });
}

// --- IPC Handlers --- 
ipcMain.on('start-server', (event, serverType) => startServer(serverType));
ipcMain.on('stop-server', (event, serverType) => stopServer(serverType));
ipcMain.on('open-browser', (event, serverType) => openBrowser(serverType));
ipcMain.on('open-config-file', (event, serverType) => openConfigFile(serverType));
