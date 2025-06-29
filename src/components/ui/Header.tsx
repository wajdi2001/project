import React from 'react';
import { Bell, Moon, Sun, LogOut, Menu, Coffee, Sparkles } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthContext();
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left side - Mobile menu button and welcome text */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/80 lg:hidden transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Welcome text */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center space-x-1">
                  <span>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </p>
              </div>
            </div>
          </div>

          {/* Mobile welcome */}
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">
              Hi, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        
        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {/* User profile and logout */}
          <div className="flex items-center space-x-3">
            {/* User avatar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                  <span>{user?.role}</span>
                  {user?.role === 'admin' && <Sparkles className="h-3 w-3 text-amber-500" />}
                </p>
              </div>
            </div>
            
            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 group"
              title="Logout"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;