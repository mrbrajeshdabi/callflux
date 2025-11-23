const {app,BrowserWindow,Menu,globalShortcut,Tray,Notification,ipcMain,session} = require('electron');
const path = require('path');
const process = require('process');

let win;
//electron code
const createEwindow = () =>
{
    win = new BrowserWindow({
        width:320,
        height:400,
        show:true,
        title:'callflux',
        resizable:false,
        frame:true,
        icon : path.join(__dirname,'callwating.png'),
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:true,
            preload : path.join(__dirname,'preload.js'),
            partition: 'persist:main', // <- important
            webSecurity:true,
            media:true
        }
    });
    win.loadFile('public/index.html');
    win.webContents.openDevTools();


    win.on("minimize", function (event) {
        event.preventDefault();
        win.hide();
    });

    win.on("close", function (event) {
    //   event.preventDefault();
    //   win.hide();
      if (!app.isQuiting) {
        event.preventDefault();
        win.hide(); // background me chali jayegi
      }
    });

    win.on('show', () => {
        win.webContents.send('resume-app');
    });

    ipcMain.on('setcookie',async(event,data)=>{
        let cookie = {
            url: 'http://localhost/',
            name:data.key,
            value:data.value,
            expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10),
            path:'/'
        };
        await session.defaultSession.cookies.set(cookie);
        return event.sender.send('replycookie','cookie saved');
    });

    ipcMain.on('openBGW',(event,data)=>{
        // win.setResizable(false);
        win.maximize();
        event.sender.send('OKBGW','OK Open Big Window');
    });

    ipcMain.on('notification',(event,{title,sid,rid,sname,spic})=>{
       let noti = new Notification({
        title:title,
        body:`Calling From ${sname}`,
        icon:spic,
    });
    noti.on('click',()=>{
        win.isVisible() ? win.hide() : win.show();
        event.sender.send('notficationreciver',{sid,rid,sname,spic});
    });

    });

    ipcMain.on('quit',(event,data)=>{
        app.isQuiting = true;
        app.quit();
    });

    ipcMain.on('callnotification',(event,data)=>{
        win.show();
    });

    ipcMain.on('logout',(event,data)=>{
        app.isQuiting = true;
        app.quit();
    });
    
}

function createmenu()
{
    //contextmenu
    let cm = Menu.buildFromTemplate([{label:'Only For Education Purpose And Testing'}]);
    Menu.setApplicationMenu(cm);
}

function tray()
{
    const iconPath = path.join(__dirname, 'logo.ico');
    tray = new Tray(iconPath);
    tray.setToolTip("Z");
    tray.on("click", () => {
        win.isVisible() ? win.hide() : win.show();
        win.focus();
    });
}



app.whenReady().then(()=>{
    createEwindow();
    createmenu();
    tray();
});

app.on('web-contents-created', (event, contents) => {
  contents.on('permission-request', (event, permission) => {
    if (permission === 'media') {
      event.request.allow();
    } else {
      event.request.deny();
    }
  });
});
app.on("window-all-closed", (event) => {
  event.preventDefault();
});








