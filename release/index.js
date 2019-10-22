const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
    let win = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            webSecurity: false
        }
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }))
}

var template = [{
    label: "Application",
    submenu: [
        {label: "About Application", selector: "orderFrontStandardAboutPanel:"},
        {type: "separator"},
        {
            label: "Quit", accelerator: "Command+Q", click: function () {
                app.quit();
            }
        },
        {
            label: "Quit Window", accelerator: "Command+W", click: function () {
                app.quit();
            }
        }
    ]
}, {
    label: "Edit",
    submenu: [
        {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
        {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
        {type: "separator"},
        {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
        {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
        {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
        {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
    ]
}];

app.on('ready', createWindow);
app.on('ready', () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

app.on('window-all-closed', () => app.quit());