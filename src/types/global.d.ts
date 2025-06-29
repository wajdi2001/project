interface Window {
  electronAPI?: {
    printReceipt: (receiptData: any) => Promise<{ success: boolean }>;
    openCashDrawer: () => Promise<{ success: boolean }>;
    scanBarcode: () => Promise<{ success: boolean; barcode?: string }>;
  };
}