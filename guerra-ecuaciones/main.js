const {app,BrowserWindow}=require('electron');
const path=require('path');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
function createWindow(){
 const win=new BrowserWindow({
  width:1440,height:900,minWidth:1100,minHeight:700,
  backgroundColor:'#020611',autoHideMenuBar:true,
  webPreferences:{contextIsolation:true,nodeIntegration:false,backgroundThrottling:false}
 });
 win.loadFile(path.join(__dirname,'www','index.html'));
 win.on('closed',()=>{});
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});