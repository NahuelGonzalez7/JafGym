"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    openKiosk: () => electron_1.ipcRenderer.send('open-kiosk'),
    onUpdateAvailable: (cb) => electron_1.ipcRenderer.on('update-available', cb),
    onUpdateDownloaded: (cb) => electron_1.ipcRenderer.on('update-downloaded', cb)
});
