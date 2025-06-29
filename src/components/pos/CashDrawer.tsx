import React, { useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface CashDrawerProps {
  onDrawerOpened?: () => void;
}

const CashDrawer: React.FC<CashDrawerProps> = ({ onDrawerOpened }) => {
  const [opening, setOpening] = useState(false);
  const [status, setStatus] = useState<'closed' | 'open' | 'error'>('closed');
  const { t } = useLanguage();

  const openDrawer = async () => {
    try {
      setOpening(true);
      
      if (window.electronAPI) {
        const result = await window.electronAPI.openCashDrawer();
        if (result.success) {
          setStatus('open');
          toast.success('Tiroir-caisse ouvert', {
            icon: '💰',
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
            },
          });
          onDrawerOpened?.();
          
          setTimeout(() => setStatus('closed'), 3000);
        } else {
          setStatus('error');
          toast.error('Échec de l\'ouverture du tiroir-caisse');
          setTimeout(() => setStatus('closed'), 2000);
        }
      } else {
        toast.info('Contrôle du tiroir-caisse non disponible en mode web');
      }
    } catch (error) {
      console.error('Cash drawer error:', error);
      setStatus('error');
      toast.error('Erreur du tiroir-caisse');
      setTimeout(() => setStatus('closed'), 2000);
    } finally {
      setOpening(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'text-red-600 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
          <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mr-2">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          {t('cashDrawer')}
        </h3>
        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize font-medium">{status === 'closed' ? 'Fermé' : status === 'open' ? 'Ouvert' : 'Erreur'}</span>
        </div>
      </div>
      
      <button
        onClick={openDrawer}
        disabled={opening}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
      >
        <DollarSign className="h-4 w-4" />
        <span>{opening ? 'Ouverture...' : t('openCashDrawer')}</span>
        {!opening && <Sparkles className="h-3 w-3" />}
      </button>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
        Compatible A116W-HC
      </p>
    </div>
  );
};

export default CashDrawer;