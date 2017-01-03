const {app, BrowserWindow, Menu} = require('electron');
const {open} = require('openurl');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    frame: false
  });

  // /////////////////////////////
  // Setup the application menu
  const menuTemplate = [
    {
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        }
      ]
    }, {
      label: 'File',
      submenu: [
        {
          label: 'Open Markdown',
          click() {
            mainWindow.webContents.send('open-markdown');
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // show dev tools
  mainWindow.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  /**
   * Intercepts anchor elements click emitter and forces the URL to open in the system
   * default browser.
   */
  mainWindow.webContents.on('will-navigate', (e, url) => {
    e.preventDefault();
    open(url);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
