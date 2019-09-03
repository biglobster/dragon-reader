// Electron launch

// DISABLE Warning
const process = require('process');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

const {app, BrowserWindow} = require('electron');

function createWindow() {
    let win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            webSecurity: false
        }
    });
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.quit());