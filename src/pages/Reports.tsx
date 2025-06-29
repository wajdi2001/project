import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  Coffee,
  FileText
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Order } from '../types';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'completed')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[];
      
      // Sort by createdAt in JavaScript instead of Firestore
      ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error loading orders data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        start = startOfDay(subDays(now, 1));
        end = endOfDay(subDays(now, 1));
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'custom':
        if (!startDate || !endDate) return orders;
        start = startOfDay(new Date(startDate));
        end = endOfDay(new Date(endDate));
        break;
      default:
        return orders;
    }

    return orders.filter(order => order.createdAt >= start && order.createdAt <= end);
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const cashSales = filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, order) => sum + order.total, 0);
  const cardSales = filteredOrders.filter(o => o.paymentMethod === 'card').reduce((sum, order) => sum + order.total, 0);

  // Sales by hour data
  const salesByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourOrders = filteredOrders.filter(order => 
      order.createdAt.getHours() === hour
    );
    return {
      hour: `${hour}:00`,
      sales: hourOrders.reduce((sum, order) => sum + order.total, 0),
      orders: hourOrders.length
    };
  }).filter(data => data.sales > 0);

  // Sales by day data (last 7 days)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
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

  // Top products
  const productSales = new Map();
  filteredOrders.forEach(order => {
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
    .slice(0, 10);

  // Payment method distribution
  const paymentData = [
    { name: 'Cash', value: cashSales, color: '#10b981' },
    { name: 'Card', value: cardSales, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  const exportReport = () => {
    const reportData = {
      period: dateRange,
      startDate: startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: endDate || format(new Date(), 'yyyy-MM-dd'),
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        cashSales,
        cardSales
      },
      topProducts,
      salesByHour: salesByHour.slice(0, 10)
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report exported successfully');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze your coffee shop performance and trends
          </p>
        </div>
        <button
          onClick={exportReport}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</span>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              />
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <Coffee className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Hour */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
              <Bar dataKey="sales" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Trend (Last 7 Days) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
              <Line type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {paymentData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}: ${entry.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full text-xs font-medium text-amber-600 dark:text-amber-400">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.quantity} sold</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${product.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Order #</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Date & Time</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Items</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Payment</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.slice(0, 10).map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-6 font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-6 text-gray-600 dark:text-gray-400">
                    {format(order.createdAt, 'MMM dd, yyyy hh:mm a')}
                  </td>
                  <td className="py-3 px-6 text-gray-600 dark:text-gray-400">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="py-3 px-6 text-gray-600 dark:text-gray-400 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3 px-6 font-semibold text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;