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
  X
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
      roles: ['admin', 'cashier', 'server']
    },
    {
      name: 'POS',
      href: '/pos',
      icon: ShoppingCart,
      roles: ['cashier', 'server']
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Utensils,
      roles: ['admin', 'cashier', 'server']
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: ['admin']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      name: 'Cash Flow',
      href: '/cash-flow',
      icon: DollarSign,
      roles: ['admin', 'cashier']
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white w-64 shadow-sm h-full flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Coffee POS</span>
              <p className="text-xs text-gray-500">Point of Sale System</p>
            </div>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;