import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Receipt,
  Search,
  X,
  Coffee,
  Menu,
  Scan,
  Star,
  Clock,
  Zap,
  Sparkles,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { Product, CartItem, Category } from '../types';
import BarcodeScanner from '../components/pos/BarcodeScanner';
import CashDrawer from '../components/pos/CashDrawer';
import toast from 'react-hot-toast';
import { useSidebar } from '../components/ui/Layout';

const POS: React.FC = () => {
  const { user } = useAuthContext();
  const { openSidebar, sidebarOpen } = useSidebar();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(0.08);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Product[];
      setProducts(productsData.filter(p => p.isActive));

      // Load categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder));

      // Load settings
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data();
        setTaxRate(settings.taxRate || 0.08);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, variant?: any) => {
    const cartItemId = `${product.id}-${variant?.id || 'default'}`;
    const existingItem = cart.find(item => item.id === cartItemId);
    
    const unitPrice = product.price + (variant?.priceModifier || 0);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * unitPrice }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        product,
        quantity: 1,
        variants: variant ? [variant] : [],
        unitPrice,
        totalPrice: unitPrice
      };
      setCart([...cart, newItem]);
    }
    
    toast.success(`${product.name} added to cart`, {
      icon: '✨',
      style: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
      },
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared', {
      icon: '🗑️',
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash') {
      const cashAmount = parseFloat(cashReceived);
      if (isNaN(cashAmount) || cashAmount < total) {
        toast.error('Insufficient cash amount');
        return;
      }
    }

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const orderData = {
        orderNumber,
        items: cart,
        subtotal,
        tax,
        total,
        status: 'completed',
        paymentMethod,
        paymentStatus: 'paid',
        cashierId: user?.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      toast.success('Order completed successfully!', {
        icon: '🎉',
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
        },
      });
      
      clearCart();
      setShowPayment(false);
      setShowMobileCart(false);
      setCashReceived('');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
    }
  };

  const handleProductFound = (product: Product) => {
    addToCart(product);
    setShowBarcodeScanner(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      {/* Back/Menu Button for Sidebar */}
      {!sidebarOpen && (
        <button
          onClick={openSidebar}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full shadow-lg lg:hidden"
          title="Open Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Cart Overlay */}
      {showMobileCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowMobileCart(false)} />
      )}

      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-lg p-4 border-b border-gray-200/50 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Point of Sale
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">Select products to add to cart</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Barcode Scanner */}
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                title="Scan Barcode"
              >
                <Scan className="h-5 w-5" />
              </button>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-amber-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-amber-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="lg:hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-3 rounded-2xl relative shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-200 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Enhanced Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl whitespace-nowrap font-semibold transition-all duration-200 flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>All Products</span>
              </div>
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-2xl whitespace-nowrap font-semibold transition-all duration-200 flex-shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <ProductListItem 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}

          {/* No Products Found */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 max-w-md mx-auto">
                <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg mb-2">No products found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or category filter</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Cart (Desktop) */}
      <div className="hidden lg:flex w-96 bg-white/80 backdrop-blur-lg border-l border-gray-200/50 flex-col shadow-xl">
        <CartSection 
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          taxRate={taxRate}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
          onProcessPayment={() => setShowPayment(true)}
        />
      </div>

      {/* Mobile Cart Slide-out */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white/95 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden
        ${showMobileCart ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
            <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
            <button
              onClick={() => setShowMobileCart(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <CartSection 
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            taxRate={taxRate}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onProcessPayment={() => {
              setShowPayment(true);
              setShowMobileCart(false);
            }}
            isMobile={true}
          />
        </div>
      </div>

      {/* Enhanced Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Payment</h3>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <div className="text-center mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
                <p className="text-sm text-gray-600 mt-2 flex items-center justify-center space-x-2">
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  <span>•</span>
                  <span>Tax: ${tax.toFixed(2)}</span>
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="font-semibold">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg transform scale-105'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="font-semibold">Card</span>
                </button>
              </div>

              {/* Cash Payment Input */}
              {paymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cash Received
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  {cashReceived && parseFloat(cashReceived) >= total && (
                    <div className="mt-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-700">Change:</span>
                        <span className="text-lg font-bold text-green-600">
                          ${(parseFloat(cashReceived) - total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Process Payment Button */}
            <button
              onClick={processPayment}
              disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Receipt className="h-5 w-5" />
              <span>Complete Payment</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onProductFound={handleProductFound}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Cash Drawer Component */}
      <div className="fixed bottom-4 right-4 z-30 lg:hidden">
        <CashDrawer />
      </div>
    </div>
  );
};

// Enhanced Product Card Component
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant?: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [showVariants, setShowVariants] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
      {/* Product Image */}
      <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-3 flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all duration-300">
        <Coffee className="h-12 w-12 text-amber-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      
      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">{product.description}</p>
        </div>
        
        {/* Price and Add Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-2 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1"
            >
              <span>{product.variants.length} options</span>
              <Zap className="h-3 w-3" />
            </button>
            {showVariants && (
              <div className="space-y-1">
                {product.variants.slice(0, 3).map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => onAddToCart(product, variant)}
                    className="w-full text-left text-xs bg-gradient-to-r from-gray-50 to-gray-100 hover:from-amber-50 hover:to-orange-50 px-2 py-1 rounded-xl border border-gray-200 transition-all duration-200 hover:border-amber-300"
                  >
                    <span className="font-medium">{variant.name}</span>
                    {variant.priceModifier > 0 && (
                      <span className="text-amber-600 ml-1">(+${variant.priceModifier.toFixed(2)})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Product List Item Component
const ProductListItem: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-4 hover:shadow-lg transition-all duration-200 hover:border-amber-300">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Coffee className="h-8 w-8 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={() => onAddToCart(product)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Cart Section Component
interface CartSectionProps {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onProcessPayment: () => void;
  isMobile?: boolean;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  subtotal,
  tax,
  total,
  taxRate,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onProcessPayment,
  isMobile = false
}) => {
  return (
    <>
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
            title="Clear cart"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-lg mb-2">Cart is empty</p>
              <p className="text-sm">Add products to start an order</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm">{item.product.name}</h4>
                    {item.variants.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{item.variants.map(v => v.name).join(', ')}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-xl transition-all duration-200 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-xl transition-all duration-200 transform hover:scale-110"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm bg-white rounded-lg py-1 border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-xl transition-all duration-200 transform hover:scale-110"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary & Payment */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total:</span>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onProcessPayment}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Receipt className="h-5 w-5" />
            <span>Process Payment</span>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
};

export default POS;