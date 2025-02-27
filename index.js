const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');

const { app, BrowserWindow, ipcMain, dialog } = electron;

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // opens a file dialog box
  ipcMain.handle('open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov'] }]
    });

    if (canceled) return null;

    return filePaths[0]; // Return the selected video path
  });
});

ipcMain.on('video:submit', (event, path) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      const duration = metadata.format.duration;
      mainWindow.webContents.send('video:metadata', duration);
    });
});