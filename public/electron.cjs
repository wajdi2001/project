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
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#ffffff'
  });

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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

app.whenReady().then(createWindow);

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
    
    // A116W-HC Receipt Printer Integration
    // ESC/POS commands for thermal printer
    const escpos = require('escpos');
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    
    device.open(() => {
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text(receiptData.shopName || 'Coffee Shop POS')
        .text('--------------------------------')
        .align('lt')
        .text(`Order: ${receiptData.orderNumber}`)
        .text(`Date: ${new Date().toLocaleString()}`)
        .text('--------------------------------');
      
      // Print items
      receiptData.items.forEach(item => {
        printer.text(`${item.quantity}x ${item.product.name}`);
        if (item.variants && item.variants.length > 0) {
          printer.text(`   ${item.variants.map(v => v.name).join(', ')}`);
        }
        printer.text(`   $${item.totalPrice.toFixed(2)}`);
      });
      
      printer
        .text('--------------------------------')
        .text(`Subtotal: $${receiptData.subtotal.toFixed(2)}`)
        .text(`Tax: $${receiptData.tax.toFixed(2)}`)
        .style('bu')
        .text(`Total: $${receiptData.total.toFixed(2)}`)
        .style('normal')
        .text(`Payment: ${receiptData.paymentMethod}`)
        .text(`Cash: $${receiptData.cashReceived?.toFixed(2) || receiptData.total.toFixed(2)}`)
        .text(`Change: $${receiptData.change?.toFixed(2) || '0.00'}`)
        .text('--------------------------------')
        .align('ct')
        .text('Thank you for your visit!')
        .text('Please come again!')
        .cut()
        .close();
    });
    
    return { success: true };
  } catch (error) {
    console.error('Print error:', error);
    // Fallback to system print dialog
    try {
      mainWindow.webContents.print({
        silent: false,
        printBackground: true,
        deviceName: 'A116W-HC'
      });
      return { success: true };
    } catch (fallbackError) {
      console.error('Fallback print error:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }
});

ipcMain.handle('open-cash-drawer', async (event) => {
  try {
    console.log('Opening cash drawer');
    
    // A116W-HC Cash Drawer Control
    // Send ESC/POS command to open cash drawer
    const escpos = require('escpos');
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    
    device.open(() => {
      // ESC/POS command to open cash drawer (Pulse pin 2)
      printer.cashdraw(2);
      printer.close();
    });
    
    return { success: true };
  } catch (error) {
    console.error('Cash drawer error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-barcode', async (event) => {
  try {
    console.log('Scanning barcode');
    
    // A116W-HC Barcode Scanner Integration
    // The scanner typically acts as a keyboard input device
    // This is a simulation - actual implementation depends on scanner model
    
    // For demonstration, return a sample barcode
    // In production, this would interface with the actual scanner
    const sampleBarcodes = [
      '1234567890123',
      '9876543210987',
      '5555555555555'
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

// Additional hardware functions
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

ipcMain.handle('test-hardware', async (event, device) => {
  try {
    switch (device) {
      case 'printer':
        return await ipcMain.emit('print-receipt', event, {
          orderNumber: 'TEST-001',
          items: [{ quantity: 1, product: { name: 'Test Item' }, totalPrice: 1.00 }],
          subtotal: 1.00,
          tax: 0.08,
          total: 1.08,
          paymentMethod: 'cash'
        });
      case 'cashDrawer':
        return await ipcMain.emit('open-cash-drawer', event);
      case 'scanner':
        return await ipcMain.emit('scan-barcode', event);
      default:
        return { success: false, error: 'Unknown device' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Auto-updater (for production)
if (!isDev) {
  const { autoUpdater } = require('electron-updater');
  
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    console.log('Update available');
  });
  
  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    autoUpdater.quitAndInstall();
  });
}

function openCashDrawer() {
  ipcMain.emit('open-cash-drawer', null);
}

function scanBarcode() {
  ipcMain.emit('scan-barcode', null);
}