import React, { useState } from 'react';
import { Coffee, Eye, EyeOff, Sparkles, Shield, Users } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-2xl transform rotate-3">
                <Coffee className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Coffee Shop POS
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Welcome to your premium point of sale system
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure • Fast • Reliable</span>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:z-10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:z-10 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign in to Dashboard</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium">Try Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@coffee.com', 'admin123')}
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-amber-200 rounded-2xl shadow-sm bg-gradient-to-r from-red-50 to-red-100 text-sm font-medium text-red-700 hover:from-red-100 hover:to-red-200 transition-all duration-200 transform hover:scale-105"
              >
                <Shield className="h-4 w-4 mr-2" />
                <span>Admin Demo</span>
                <span className="ml-2 text-xs bg-red-200 px-2 py-1 rounded-full">Full Access</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleDemoLogin('cashier@coffee.com', 'cashier123')}
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-amber-200 rounded-2xl shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 text-sm font-medium text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
              >
                <Users className="h-4 w-4 mr-2" />
                <span>Cashier Demo</span>
                <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">POS Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Powered by modern web technologies
          </p>
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>React</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Firebase</span>
            <span>•</span>
            <span>Electron</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;