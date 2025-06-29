import React, { useState, useEffect } from 'react';
import { Scan, X, Sparkles, Zap } from 'lucide-react';
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
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [manualBarcode]);

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
        toast.success(`${t('productFound')}: ${product.name}`, {
          icon: '✨',
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
          },
        });
        onClose();
      } else {
        toast.error(`${t('noProductFound')}: ${barcode}`, {
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Erreur lors du scan du code-barres');
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
          toast.error('Échec du scan du code-barres');
        }
      } else {
        toast.info('Scanner matériel non disponible en mode web');
      }
    } catch (error) {
      console.error('Hardware scan error:', error);
      toast.error('Erreur du scanner matériel');
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Scanner Code-barres
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Scan className="h-6 w-6" />
              <span>{scanning ? 'Scan en cours...' : t('hardwareScanner')}</span>
              {!scanning && <Sparkles className="h-4 w-4" />}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Utilisez votre scanner A116W-HC
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500">ou</span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('enterManually')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Scanner ou taper le code-barres ici..."
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  autoFocus
                />
                <Zap className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!manualBarcode.trim() || scanning}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105"
            >
              {scanning ? 'Recherche...' : 'Rechercher le produit'}
            </button>
          </form>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              {t('instructions')}:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Utilisez le bouton scanner pour le scanner A116W-HC
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Ou tapez/scannez manuellement le code-barres
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Appuyez sur Entrée ou cliquez sur Rechercher
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;