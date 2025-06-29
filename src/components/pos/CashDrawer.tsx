import React, { useState } from 'react';
import { DollarSign, AlertCircle, CheckCircle, Sparkles, Zap, Lock, Unlock } from 'lucide-react';
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
          toast.success('Cash drawer opened', {
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
          toast.error('Failed to open cash drawer');
          setTimeout(() => setStatus('closed'), 2000);
        }
      } else {
        toast.info('Cash drawer control not available in web mode');
      }
    } catch (error) {
      console.error('Cash drawer error:', error);
      setStatus('error');
      toast.error('Cash drawer error');
      setTimeout(() => setStatus('closed'), 2000);
    } finally {
      setOpening(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-gradient-to-r from-red-50 to-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'open':
        return <Unlock className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'error':
        return 'Error';
      default:
        return 'Closed';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg p-4 rounded-3xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Cash Drawer</h3>
            <p className="text-xs text-gray-600">A116W-HC Compatible</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-semibold">{getStatusText()}</span>
        </div>
      </div>
      
      <button
        onClick={openDrawer}
        disabled={opening}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
      >
        <DollarSign className="h-4 w-4" />
        <span>{opening ? 'Opening...' : 'Open Drawer'}</span>
        {!opening && <Zap className="h-3 w-3" />}
      </button>
      
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Hardware Ready</span>
        </div>
      </div>
    </div>
  );
};

export default CashDrawer;