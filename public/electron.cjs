const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false // Allow loading local files in development
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#ffffff'
  });

  // Load the app
  if (isDev) {
    // Wait for dev server to be ready
    const loadDevServer = () => {
      mainWindow.loadURL('http://localhost:5173')
        .then(() => {
          console.log('Dev server loaded successfully');
        })
        .catch((err) => {
          console.log('Dev server not ready, retrying in 1 second...', err.message);
          setTimeout(loadDevServer, 1000);
        });
    };
    loadDevServer();
    
    // Open DevTools in development
    mainWindow.webContents.once('dom-ready', () => {
      mainWindow.webContents.openDevTools();
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production build from:', indexPath);
    mainWindow.loadFile(indexPath)
      .catch((err) => {
        console.error('Failed to load production build:', err);
      });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window is ready to show');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Failed to load:', errorCode, errorDescription, validatedURL);
    if (isDev && errorCode === -102) {
      // Connection refused, dev server might not be ready
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 2000);
    }
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Order',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-order');
          }
        },
        {
          label: 'Print Receipt',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('print-receipt');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'POS',
      submenu: [
        {
          label: 'Open Cash Drawer',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            openCashDrawer();
          }
        },
        {
          label: 'Scan Barcode',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            scanBarcode();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Ensure app is ready before creating window
app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Hardware integration handlers for A116W-HC
ipcMain.handle('print-receipt', async (event, receiptData) => {
  try {
    console.log('Printing receipt:', receiptData);
    return { success: true };
  } catch (error) {
    console.error('Print error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-cash-drawer', async (event) => {
  try {
    console.log('Opening cash drawer');
    return { success: true };
  } catch (error) {
    console.error('Cash drawer error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-barcode', async (event) => {
  try {
    console.log('Scanning barcode');
    
    const sampleBarcodes = [
      '1234567890001',
      '1234567890002',
      '1234567890003',
      '1234567890004',
      '1234567890005'
    ];
    
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    
    return { 
      success: true, 
      barcode: randomBarcode,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Barcode scan error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-hardware-status', async (event) => {
  try {
    return {
      printer: { connected: true, model: 'A116W-HC' },
      cashDrawer: { connected: true, status: 'closed' },
      scanner: { connected: true, model: 'A116W-HC' },
      display: { connected: true, model: 'A116W-HC Touch' }
    };
  } catch (error) {
    return { error: error.message };
  }
});

function openCashDrawer() {
  ipcMain.emit('open-cash-drawer', null);
}

function scanBarcode() {
  ipcMain.emit('scan-barcode', null);
}