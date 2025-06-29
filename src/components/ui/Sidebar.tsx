import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  BarChart3,
  Coffee,
  DollarSign,
  Utensils,
  X,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, hasRole } = useAuthContext();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'cashier', 'server'],
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'POS',
      href: '/pos',
      icon: ShoppingCart,
      roles: ['cashier', 'server'],
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Utensils,
      roles: ['admin', 'cashier', 'server'],
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: ['admin'],
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['admin'],
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Cash Flow',
      href: '/cash-flow',
      icon: DollarSign,
      roles: ['admin', 'cashier'],
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: Users,
      roles: ['admin'],
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin'],
      gradient: 'from-gray-500 to-gray-600'
    }
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg w-64 shadow-2xl h-full flex flex-col border-r border-gray-200/50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Coffee POS
              </span>
              <p className="text-xs text-gray-500 font-medium">Point of Sale System</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 lg:hidden rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-lg border border-amber-200/50 transform scale-105'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className="font-semibold">{item.name}</span>
                    {isActive && <Sparkles className="h-4 w-4 text-amber-500 ml-auto" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-lg font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.name}
            </p>
            <div className="flex items-center space-x-1">
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
              {user?.role === 'admin' && (
                <Shield className="h-3 w-3 text-amber-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;