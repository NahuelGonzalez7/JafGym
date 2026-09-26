"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const electron_updater_1 = require("electron-updater");
let mainWindow;
let kioskWindow = null;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        autoHideMenuBar: true,
        title: 'GymManager',
    });
    if (!electron_1.app.isPackaged) {
        mainWindow.loadURL('http://localhost:4200');
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/gym-manager/browser/index.html'));
    }
}
function createKioskWindow() {
    // Si ya está abierta, la enfocamos en vez de abrir otra
    if (kioskWindow) {
        kioskWindow.focus();
        return;
    }
    kioskWindow = new electron_1.BrowserWindow({
        width: 600,
        height: 700,
        resizable: true, // cambiá a true
        autoHideMenuBar: true,
        title: 'Registro de Asistencia',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (!electron_1.app.isPackaged) {
        kioskWindow.loadURL('http://localhost:4200/kiosko');
    }
    else {
        kioskWindow.loadFile(path.join(__dirname, '../dist/gym-manager/browser/index.html'), {
            hash: '/kiosko',
        });
    }
    // Cuando se cierra, limpiamos la referencia
    kioskWindow.on('closed', () => {
        kioskWindow = null;
    });
}
// Escucha el evento desde Angular para abrir el kiosko
electron_1.ipcMain.on('open-kiosk', () => {
    createKioskWindow();
});
electron_1.app.whenReady().then(() => {
    createMainWindow();
    if (electron_1.app.isPackaged)
        setupAutoUpdater();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
function setupAutoUpdater() {
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    electron_updater_1.autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update-available');
    });
    electron_updater_1.autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update-downloaded');
    });
}
