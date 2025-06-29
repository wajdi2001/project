import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Search,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { CashFlow } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CashFlowPage: React.FC = () => {
  const { user } = useAuthContext();
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [filteredCashFlows, setFilteredCashFlows] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out',
    amount: '',
    reason: ''
  });

  useEffect(() => {
    loadCashFlows();
  }, []);

  useEffect(() => {
    filterCashFlows();
  }, [cashFlows, searchTerm, typeFilter, dateFilter]);

  const loadCashFlows = async () => {
    try {
      const cashFlowQuery = query(
        collection(db, 'cashFlows'),
        orderBy('createdAt', 'desc')
      );
      
      const cashFlowSnapshot = await getDocs(cashFlowQuery);
      const cashFlowData = cashFlowSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as CashFlow[];
      
      setCashFlows(cashFlowData);
    } catch (error) {
      console.error('Error loading cash flows:', error);
      toast.error('Error loading cash flow data');
    } finally {
      setLoading(false);
    }
  };

  const filterCashFlows = () => {
    let filtered = [...cashFlows];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cf => 
        cf.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(cf => cf.type === typeFilter);
    }

    // Date filter
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(cf => cf.createdAt >= startOfToday);
        break;
      case 'week':
        filtered = filtered.filter(cf => cf.createdAt >= startOfWeek);
        break;
      case 'month':
        filtered = filtered.filter(cf => cf.createdAt >= startOfMonth);
        break;
    }

    setFilteredCashFlows(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const cashFlowData = {
        type: formData.type,
        amount,
        reason: formData.reason,
        cashierId: user?.id || '',
        updatedAt: serverTimestamp()
      };

      if (editingCashFlow) {
        await updateDoc(doc(db, 'cashFlows', editingCashFlow.id), cashFlowData);
        setCashFlows(cashFlows.map(cf => 
          cf.id === editingCashFlow.id 
            ? { ...cf, ...cashFlowData, updatedAt: new Date() }
            : cf
        ));
        toast.success('Cash flow updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'cashFlows'), {
          ...cashFlowData,
          createdAt: serverTimestamp()
        });
        const newCashFlow = {
          id: docRef.id,
          ...cashFlowData,
          createdAt: new Date(),
          updatedAt: new Date()
        } as CashFlow;
        setCashFlows([newCashFlow, ...cashFlows]);
        toast.success('Cash flow recorded successfully');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving cash flow:', error);
      toast.error('Error saving cash flow');
    }
  };

  const handleEdit = (cashFlow: CashFlow) => {
    setEditingCashFlow(cashFlow);
    setFormData({
      type: cashFlow.type,
      amount: cashFlow.amount.toString(),
      reason: cashFlow.reason
    });
    setShowModal(true);
  };

  const handleDelete = async (cashFlowId: string) => {
    if (!confirm('Are you sure you want to delete this cash flow record?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'cashFlows', cashFlowId));
      setCashFlows(cashFlows.filter(cf => cf.id !== cashFlowId));
      toast.success('Cash flow deleted successfully');
    } catch (error) {
      console.error('Error deleting cash flow:', error);
      toast.error('Error deleting cash flow');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'in',
      amount: '',
      reason: ''
    });
    setEditingCashFlow(null);
  };

  // Calculate totals
  const totalIn = filteredCashFlows
    .filter(cf => cf.type === 'in')
    .reduce((sum, cf) => sum + cf.amount, 0);
  
  const totalOut = filteredCashFlows
    .filter(cf => cf.type === 'out')
    .reduce((sum, cf) => sum + cf.amount, 0);
  
  const netFlow = totalIn - totalOut;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Flow Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track cash in and cash out transactions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash In</p>
              <p className="text-2xl font-bold text-green-600">${totalIn.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Out</p>
              <p className="text-2xl font-bold text-red-600">${totalOut.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Flow</p>
              <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netFlow.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'in' | 'out')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="in">Cash In</option>
            <option value="out">Cash Out</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4 mr-2" />
            {filteredCashFlows.length} transactions found
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Date & Time</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Reason</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Cashier</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCashFlows.map(cashFlow => (
                <tr key={cashFlow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    <div>
                      <div>{format(cashFlow.createdAt, 'MMM dd, yyyy')}</div>
                      <div className="text-sm">{format(cashFlow.createdAt, 'hh:mm a')}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cashFlow.type === 'in' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {cashFlow.type === 'in' ? (
                        <Plus className="h-3 w-3 mr-1" />
                      ) : (
                        <Minus className="h-3 w-3 mr-1" />
                      )}
                      Cash {cashFlow.type === 'in' ? 'In' : 'Out'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-semibold ${
                      cashFlow.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {cashFlow.type === 'in' ? '+' : '-'}${cashFlow.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-900 dark:text-white">
                    {cashFlow.reason}
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    {cashFlow.cashierId}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(cashFlow)}
                        className="text-amber-600 hover:text-amber-700 p-1"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cashFlow.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCashFlows.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No cash flow transactions found</p>
          </div>
        )}
      </div>

      {/* Cash Flow Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCashFlow ? 'Edit Transaction' : 'Add Cash Flow Transaction'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'in' })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'in'
                        ? 'border-green-600 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Cash In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'out' })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'out'
                        ? 'border-red-600 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <Minus className="h-5 w-5" />
                    <span>Cash Out</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter reason for transaction"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  {editingCashFlow ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowPage;