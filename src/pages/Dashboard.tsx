import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Coffee,
  Clock,
  CheckCircle,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent orders
      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[];
      
      setOrders(ordersData);

      // Filter today's orders
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      
      const todayOrdersData = ordersData.filter(order => 
        order.createdAt >= startOfToday && order.createdAt <= endOfToday
      );
      setTodayOrders(todayOrdersData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const todayStats = {
    sales: todayOrders.reduce((sum, order) => sum + order.total, 0),
    orders: todayOrders.length,
    avgOrderValue: todayOrders.length > 0 ? todayOrders.reduce((sum, order) => sum + order.total, 0) / todayOrders.length : 0,
    items: todayOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
  };

  // Sales data for the last 7 days
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayOrders = orders.filter(order => 
      format(order.createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'MMM dd'),
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length
    };
  });

  // Hourly sales for today
  const hourlySales = Array.from({ length: 24 }, (_, hour) => {
    const hourOrders = todayOrders.filter(order => 
      order.createdAt.getHours() === hour
    );
    return {
      hour: `${hour}:00`,
      sales: hourOrders.reduce((sum, order) => sum + order.total, 0),
      orders: hourOrders.length
    };
  }).filter(data => data.sales > 0);

  // Recent orders for display
  const recentOrders = orders.slice(0, 10);

  // Top products today
  const productSales = new Map();
  todayOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = productSales.get(item.product.name) || { quantity: 0, revenue: 0 };
      productSales.set(item.product.name, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.totalPrice
      });
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'preparing':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
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
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between sm:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(), 'MMM do, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-gray-600 dark:text-gray-400"
        >
          {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your coffee shop performance - {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Today's Sales
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                ${todayStats.sales.toFixed(2)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900 rounded-lg flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {todayStats.orders} orders
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Orders Today
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {todayStats.orders}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {todayStats.items} items
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Avg Order
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                ${todayStats.avgOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900 rounded-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Per order
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                Items Sold
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {todayStats.items}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900 rounded-lg flex-shrink-0">
              <Coffee className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total today
            </span>
          </div>
        </div>
      </div>

      {/* Charts - Mobile: Stack vertically, Desktop: Side by side */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Sales Trend (Last 7 Days) */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales Trend (Last 7 Days)
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Sales Today */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hourly Sales Today
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Bar dataKey="sales" fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section - Mobile: Stack, Desktop: Side by side */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Top Products Today */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Products Today
          </h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex-shrink-0">
                      <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base flex-shrink-0">
                    ${product.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                No sales today yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Orders
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                        {order.orderNumber}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm flex-shrink-0">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {format(order.createdAt, 'hh:mm a')} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="hidden sm:inline">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="sm:hidden">
                          {order.status.charAt(0).toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                No orders yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions (if needed) */}
      {showMobileMenu && (
        <div className="sm:hidden bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium">
              View Reports
            </button>
            <button className="p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
              Manage Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;