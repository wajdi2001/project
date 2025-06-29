const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
  openCashDrawer: () => ipcRenderer.invoke('open-cash-drawer'),
  scanBarcode: () => ipcRenderer.invoke('scan-barcode'),
  getHardwareStatus: () => ipcRenderer.invoke('get-hardware-status'),
  testHardware: (device) => ipcRenderer.invoke('test-hardware', device),
  
  // Event listeners
  onNewOrder: (callback) => ipcRenderer.on('new-order', callback),
  onPrintReceipt: (callback) => ipcRenderer.on('print-receipt', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Platform detection
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});