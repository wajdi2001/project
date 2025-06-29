import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings as SettingsIcon, 
  Store, 
  DollarSign, 
  Printer, 
  Wifi,
  Bell,
  Shield,
  Palette
} from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
  printerName: string;
  enableSound: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: 'Coffee Shop POS',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'info@coffeeshop.com',
    taxRate: 0.08,
    currency: 'USD',
    receiptFooter: 'Thank you for your visit!',
    printerName: 'A116W-HC',
    enableSound: true,
    enableNotifications: true,
    theme: 'light',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testPrinter = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.printReceipt({
          orderNumber: 'TEST-001',
          items: [
            {
              id: 'test',
              productId: 'test',
              product: { name: 'Test Item', price: 5.00 },
              quantity: 1,
              variants: [],
              unitPrice: 5.00,
              totalPrice: 5.00
            }
          ],
          subtotal: 5.00,
          tax: 0.40,
          total: 5.40,
          paymentMethod: 'cash',
          cashReceived: 10.00,
          change: 4.60
        });
        
        if (result.success) {
          toast.success('Test receipt printed successfully');
        } else {
          toast.error('Failed to print test receipt');
        }
      } else {
        toast.info('Printer testing is only available in the desktop app');
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      toast.error('Error testing printer');
    }
  };

  const testCashDrawer = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.openCashDrawer();
        if (result.success) {
          toast.success('Cash drawer opened successfully');
        } else {
          toast.error('Failed to open cash drawer');
        }
      } else {
        toast.info('Cash drawer testing is only available in the desktop app');
      }
    } catch (error) {
      console.error('Error testing cash drawer:', error);
      toast.error('Error testing cash drawer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your coffee shop POS system
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Store className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shop Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.taxRate * 100}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) / 100 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Receipt Footer Message
              </label>
              <textarea
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                placeholder="Thank you for your visit!"
              />
            </div>
          </div>
        </div>

        {/* Hardware Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Printer className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hardware Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Receipt Printer
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={settings.printerName}
                  onChange={(e) => setSettings({ ...settings, printerName: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  placeholder="A116W-HC"
                />
                <button
                  onClick={testPrinter}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Test
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cash Drawer
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value="A116W-HC Compatible"
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                />
                <button
                  onClick={testCashDrawer}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Test
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Barcode Scanner
              </label>
              <input
                type="text"
                value="A116W-HC Compatible"
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <SettingsIcon className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Application Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sound Notifications</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Play sounds for new orders and alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableSound}
                    onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Receive notifications for important events</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="h-6 w-6 text-amber-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">1.0.0</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {window.electronAPI ? 'Desktop (Electron)' : 'Web Browser'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hardware Support</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">A116W-HC Compatible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;