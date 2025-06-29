import React, { useState, useEffect } from 'react';
import { Scan, X, Sparkles, Zap, Search, Camera, Smartphone } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product } from '../../types';
import toast from 'react-hot-toast';

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onProductFound, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && manualBarcode) {
        handleBarcodeScanned(manualBarcode);
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [manualBarcode, onClose]);

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      setScanning(true);
      
      const productsQuery = query(
        collection(db, 'products'),
        where('barcode', '==', barcode),
        where('isActive', '==', true)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      
      if (!productsSnapshot.empty) {
        const productDoc = productsSnapshot.docs[0];
        const product = {
          id: productDoc.id,
          ...productDoc.data(),
          createdAt: productDoc.data().createdAt?.toDate() || new Date()
        } as Product;
        
        onProductFound(product);
        toast.success(`Product found: ${product.name}`, {
          icon: '✨',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
          },
        });
        onClose();
      } else {
        toast.error(`No product found with barcode: ${barcode}`, {
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Error scanning barcode');
    } finally {
      setScanning(false);
    }
  };

  const handleHardwareScan = async () => {
    try {
      setScanning(true);
      
      if (window.electronAPI) {
        const result = await window.electronAPI.scanBarcode();
        if (result.success && result.barcode) {
          await handleBarcodeScanned(result.barcode);
        } else {
          toast.error('Hardware scan failed');
        }
      } else {
        toast.info('Hardware scanner not available in web mode');
      }
    } catch (error) {
      console.error('Hardware scan error:', error);
      toast.error('Hardware scanner error');
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeScanned(manualBarcode.trim());
    }
  };

  const quickBarcodes = [
    '1234567890001',
    '1234567890002', 
    '1234567890003',
    '1234567890004'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Barcode Scanner
              </h3>
              <p className="text-sm text-gray-600">Scan or enter product barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Hardware Scanner */}
          <div className="text-center">
            <button
              onClick={handleHardwareScan}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg transform hover:scale-105"
            >
              <Camera className="h-6 w-6" />
              <span>{scanning ? 'Scanning...' : 'Hardware Scanner'}</span>
              {!scanning && <Sparkles className="h-4 w-4" />}
            </button>
            <p className="text-sm text-gray-600 mt-3 flex items-center justify-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Use your A116W-HC scanner</span>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Enter Barcode Manually
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Scan or type barcode here..."
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  autoFocus
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!manualBarcode.trim() || scanning}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {scanning ? 'Searching...' : 'Search Product'}
            </button>
          </form>

          {/* Quick Barcodes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Test Barcodes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickBarcodes.map((barcode) => (
                <button
                  key={barcode}
                  onClick={() => setManualBarcode(barcode)}
                  className="px-3 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 text-gray-700 hover:text-blue-700 rounded-xl border border-gray-300 hover:border-blue-300 transition-all duration-200 font-mono"
                >
                  {barcode}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              Instructions:
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">1.</span>
                Use the hardware scanner button for A116W-HC scanner
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">2.</span>
                Or manually type/scan the barcode in the input field
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">3.</span>
                Press Enter or click Search to find the product
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">4.</span>
                Use quick test barcodes for demo purposes
              </li>
            </ul>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-gray-600" />
              Keyboard Shortcuts:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">Enter</kbd>
                <span className="text-gray-600">Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">Esc</kbd>
                <span className="text-gray-600">Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;