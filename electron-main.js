const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

let mainWindow = null;

function showLoadError(details) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const safe = String(details || 'No se pudo cargar el contenido local.')
    .replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!doctype html><html lang="es"><meta charset="utf-8">
    <style>body{margin:0;background:#06121f;color:white;font-family:Segoe UI,Arial;display:grid;place-items:center;min-height:100vh}
    main{max-width:760px;padding:40px;border:2px solid #56d9ff;border-radius:24px;background:#102c42}
    h1{color:#a8f040}p{font-size:20px;line-height:1.5}.detail{font-size:14px;color:#c9d8e6}</style>
    <main><h1>Matemáticas vs. Zombis</h1><p>No fue posible proyectar el juego.</p>
    <p>Cierre el programa y vuelva a ejecutarlo. Si el problema continúa, comunique este detalle:</p>
    <p class="detail">${safe}</p></main></html>`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Matemáticas vs. Zombis 4.1.7',
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: '#06121f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false,
      backgroundThrottling: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();
  mainWindow.focus();

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:') && !url.startsWith('data:')) event.preventDefault();
  });
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && ['L', 'N', 'T', 'W', 'R'].includes(input.key.toUpperCase())) event.preventDefault();
    if (input.key === 'F12') event.preventDefault();
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    showLoadError('El proceso gráfico se detuvo: ' + details.reason);
  });
  mainWindow.webContents.on('did-fail-load', (_event, code, description) => {
    showLoadError('Error ' + code + ': ' + description);
  });

  const gameFile = path.join(__dirname, 'app', 'src', 'main', 'assets', 'www', 'index.html');
  mainWindow.loadFile(gameFile).catch(error => showLoadError(error.message));
}

app.whenReady().then(() => {
  app.setAppUserModelId('ec.edu.matematicasvszombis.estudiante.v417');
  createWindow();
}).catch(error => dialog.showErrorBox('Matemáticas vs. Zombis', error.message));

app.on('window-all-closed', () => app.quit());
