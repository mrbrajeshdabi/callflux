const {contextBridge,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('EAPI',{
  //send karengye main process ko
  //on min process se answer wapas lengye
  //setCookie ka function he ham frontend me winodow.EAPI.setCookie use karengye
  SetCookie : (data) => ipcRenderer.send('setcookie',data),
  replyCookie  : (cookie) => ipcRenderer.on('replycookie',(event,data) => cookie(data)),
  openBGW : (data) => ipcRenderer.send('openBGW',data),
  okOpenBGW : (data) => ipcRenderer.on('OKBGW',data),
  notification: (data) => ipcRenderer.send('notification',data),
  notificationreceive : (data) => ipcRenderer.on('notficationreciver',data),
  // friendswindow : (data) => ipcRenderer.send('friendswindow',data),
  // okopenchildwindow : (data) => ipcRenderer.on('okopenchildwindow', (event,data) => {
  //   localStorage.setItem('user',JSON.stringify({id:123}));
  // })
  quit : (data) => ipcRenderer.send('quit',(data)),
  callnotification : (data) => ipcRenderer.send('callnotification',(data))

});