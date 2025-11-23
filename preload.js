const {contextBridge,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('EAPI',{
  SetCookie : (data) =>
    {
      ipcRenderer.send('setcookie',data)
    },
  replyCookie  : (cookie) =>
    {
      ipcRenderer.on('replycookie',(event,data) => cookie(data))
    },
  openBGW : (data) => 
    {
      ipcRenderer.send('openBGW',data)
    },
  okOpenBGW : (data) => 
    {
      ipcRenderer.on('OKBGW',data)
    },
  notification: (data) => 
    {
      ipcRenderer.send('notification',data)
    },
  notificationreceive : (data) => 
    {
      ipcRenderer.on('notficationreciver',data)
    },
  quit : (data) => 
    {
      ipcRenderer.send('quit',(data))
    },
  callnotification : (data) => 
    {
      ipcRenderer.send('callnotification',(data))
    },
  logout : (data) =>
    {
      ipcRenderer.send('logout',(data));
    }

});