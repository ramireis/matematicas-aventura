const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

function createWindow() {
  const win = new BrowserWindow({
    title: 'Matemáticas vs. Zombis 4.1.5',
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#06121f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:')) event.preventDefault();
  });
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && ['L', 'N', 'T', 'W', 'R'].includes(input.key.toUpperCase())) {
      event.preventDefault();
    }
    if (input.key === 'F12') event.preventDefault();
  });

  win.loadFile(path.join(__dirname, 'app', 'src', 'main', 'assets', 'www', 'index.html'));
  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
