const { app, BrowserWindow, session } = require('electron');
const path = require('path');
app.whenReady().then(() => {
  const win = new BrowserWindow({width:1366,height:850,minWidth:900,minHeight:650,autoHideMenuBar:true,backgroundColor:'#10182b',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname,'index.html'));
  win.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file:'))event.preventDefault();});
});
app.on('window-all-closed',()=>app.quit());
