import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { initializeFirebaseData } from './utils/firebaseInit';
import Layout from './components/ui/Layout';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Reports from './pages/Reports';
import CashFlow from './pages/CashFlow';
import Staff from './pages/Staff';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Coffee Shop POS...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginForm />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="reports" element={<Reports />} />
        <Route path="cash-flow" element={<CashFlow />} />
        <Route path="staff" element={<Staff />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

function App() {
  useEffect(() => {
    // Initialize Firebase data on app start
    const initData = async () => {
      try {
        await initializeFirebaseData();
        console.log('Firebase data initialized successfully');
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
      }
    };

    initData();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;