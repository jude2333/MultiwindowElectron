const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let secondWindow;

function createMainWindow() {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays[0];

    mainWindow = new BrowserWindow({
        x: primaryDisplay.bounds.x + 50,
        y: primaryDisplay.bounds.y + 50,
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    // Load your PHP web app URL here
    mainWindow.loadURL('https://andrsn.in'); // <-- Change to your actual URL

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle message from renderer to open second monitor window
ipcMain.on('open-second-window', (event, dynamicUrl) => {
    const displays = screen.getAllDisplays();
    const secondDisplay = displays[1];

    if (!secondDisplay) {
        console.error('Second monitor not detected.');
        return;
    }

    if (secondWindow) {
        secondWindow.close();
    }

    secondWindow = new BrowserWindow({
        x: secondDisplay.bounds.x,
        y: secondDisplay.bounds.y,
        width: secondDisplay.bounds.width,
        height: secondDisplay.bounds.height,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: false,
        },
    });

    secondWindow.loadURL(dynamicUrl);
});

ipcMain.on('close-second-window', () => {
    if (secondWindow) {
        secondWindow.close();
        secondWindow = null;
    }
});

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
