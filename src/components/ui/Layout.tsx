import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthContext } from '../../contexts/AuthContext';

// Sidebar context to allow children to open/close sidebar
export const SidebarContext = createContext({ openSidebar: () => {}, sidebarOpen: false });
export const useSidebar = () => useContext(SidebarContext);

const Layout: React.FC = () => {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Check if running in Electron (desktop mode)
  const isElectron = window.electronAPI !== undefined;

  useEffect(() => {
    // Auto-close sidebar when navigating to POS page in desktop mode
    if (isElectron && location.pathname === '/pos') {
      setSidebarOpen(false);
    }
  }, [location.pathname, isElectron]);

  if (!user) {
    return <Outlet />;
  }

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true), sidebarOpen }}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Hide on POS page in desktop mode */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isElectron && location.pathname === '/pos' ? 'lg:hidden' : 'lg:translate-x-0'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 relative z-10">
            <div className={`mx-auto ${isElectron && location.pathname === '/pos' ? 'max-w-none' : 'max-w-7xl'}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Layout;