'use strict';
const path=require('node:path');
const {app,BrowserWindow,dialog}=require('electron');
const {startServer}=require('../server/index.js');
let runningServer,windowRef;
async function createWindow(){
 runningServer=await startServer({port:Number(process.env.ECOONE_PORT||43821),dataDir:path.join(app.getPath('userData'),'data')});
 windowRef=new BrowserWindow({width:1440,height:940,minWidth:900,minHeight:650,backgroundColor:'#080b12',title:'EcoOne',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
 await windowRef.loadURL('http://127.0.0.1:'+runningServer.port);
 windowRef.on('closed',()=>{windowRef=null});
}
app.whenReady().then(createWindow).catch(e=>{dialog.showErrorBox('EcoOne could not start',e.message);app.quit()});
app.on('before-quit',()=>{if(runningServer)runningServer.close().catch(()=>{})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
