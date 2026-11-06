import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow;
let kioskWindow: BrowserWindow | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
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

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:4200');
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, 'dist/gym-manager/browser/index.html'));
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

function createKioskWindow() {
  // Si ya está abierta, la enfocamos en vez de abrir otra
  if (kioskWindow) {
    kioskWindow.focus();
    return;
  }

  kioskWindow = new BrowserWindow({
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

  if (!app.isPackaged) {
    kioskWindow.loadURL('http://localhost:4200/kiosko');
  } else {
    kioskWindow.loadFile(path.join(process.resourcesPath, 'dist/gym-manager/browser/index.html'), {
      hash: '/kiosko',
    });
  }

  // Cuando se cierra, limpiamos la referencia
  kioskWindow.on('closed', () => {
    kioskWindow = null;
  });
}

// Escucha el evento desde Angular para abrir el kiosko
ipcMain.on('open-kiosk', () => {
  createKioskWindow();
});

app.whenReady().then(() => {
  createMainWindow();
  if (app.isPackaged) setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    dialog.showMessageBox({ message: 'Chequeando actualizaciones...' });
  });

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({ message: `Update disponible: ${JSON.stringify(info)}` });
    mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('update-not-available', (info) => {
    dialog.showMessageBox({ message: `No hay update. Versión actual: ${JSON.stringify(info)}` });
  });

  autoUpdater.on('error', (err) => {
    dialog.showMessageBox({ message: `Error: ${err.message}` });
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });

  autoUpdater.checkForUpdatesAndNotify();
}
