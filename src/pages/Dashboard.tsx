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
  X,
  Sparkles,
  Star,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
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

  // Yesterday's stats for comparison
  const yesterday = subDays(new Date(), 1);
  const yesterdayOrders = orders.filter(order => 
    format(order.createdAt, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
  );
  const yesterdayStats = {
    sales: yesterdayOrders.reduce((sum, order) => sum + order.total, 0),
    orders: yesterdayOrders.length
  };

  // Calculate growth percentages
  const salesGrowth = yesterdayStats.sales > 0 ? ((todayStats.sales - yesterdayStats.sales) / yesterdayStats.sales) * 100 : 0;
  const ordersGrowth = yesterdayStats.orders > 0 ? ((todayStats.orders - yesterdayStats.orders) / yesterdayStats.orders) * 100 : 0;

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="sm:hidden p-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all duration-200"
        >
          {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Sales"
          value={`$${todayStats.sales.toFixed(2)}`}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
          growth={salesGrowth}
          subtitle={`${todayStats.orders} orders`}
        />
        
        <StatsCard
          title="Orders Today"
          value={todayStats.orders.toString()}
          icon={ShoppingCart}
          gradient="from-blue-500 to-blue-600"
          growth={ordersGrowth}
          subtitle={`${todayStats.items} items`}
        />
        
        <StatsCard
          title="Average Order"
          value={`$${todayStats.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-600"
          subtitle="Per order"
        />
        
        <StatsCard
          title="Items Sold"
          value={todayStats.items.toString()}
          icon={Coffee}
          gradient="from-purple-500 to-purple-600"
          subtitle="Total today"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Sales Trend (Last 7 Days)</h3>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="url(#salesGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                />
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Sales */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Hourly Sales Today</h3>
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Products Today</h3>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-2xl text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ${product.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sales today yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 hover:shadow-md transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 text-sm truncate">
                        {order.orderNumber}
                      </span>
                      <span className="font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{format(order.createdAt, 'hh:mm a')}</span>
                        <span>•</span>
                        <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      {showMobileMenu && (
        <div className="sm:hidden bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-2xl font-semibold border border-amber-200 hover:shadow-md transition-all duration-200">
              View Reports
            </button>
            <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 text-blue-700 rounded-2xl font-semibold border border-blue-200 hover:shadow-md transition-all duration-200">
              Manage Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  growth?: number;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, gradient, growth, subtitle }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      
      {growth !== undefined && (
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
            growth >= 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {growth >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            <span>{Math.abs(growth).toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">vs yesterday</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;